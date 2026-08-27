import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

let calendarAPI = null;
try {
  const auth = new google.auth.GoogleAuth({
    keyFile: './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  calendarAPI = google.calendar({ version: 'v3', auth });
} catch (e) {
  console.error("Google Calendar API initialization failed:", e);
}


const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Email Notification Setup
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const adminEmail = process.env.ADMIN_EMAIL || smtpUser;
let mailTransporter = null;
if (smtpUser && smtpPass) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass }
  });
}
async function sendAdminNotification(subject, text) {
  if (!mailTransporter) return;
  try {
    await mailTransporter.sendMail({
      from: smtpUser,
      to: adminEmail,
      subject,
      text
    });
    console.log("Admin email notification sent.");
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}

async function getPdfTitlesText(pdfIdString) {
  if (!pdfIdString || pdfIdString === '[]') return '';
  try {
    let ids = [];
    if (pdfIdString.startsWith('[')) {
      const parsed = JSON.parse(pdfIdString);
      ids = Array.isArray(parsed) ? parsed : [];
    } else {
      ids = pdfIdString.split(',').map(s => s.trim());
    }
    const numericIds = ids.map(Number).filter(n => !isNaN(n));
    if (numericIds.length === 0) return pdfIdString;
    const offerings = await prisma.offering.findMany({
      where: { id: { in: numericIds } }
    });
    if (offerings.length === 0) return pdfIdString;
    return offerings.map(o => o.title).join(', ');
  } catch (err) {
    return pdfIdString;
  }
}

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
      'upgrade-insecure-requests': null,
    },
  },
  xFrameOptions: { action: "deny" },
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  xContentTypeOptions: true
})); 
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://161.118.191.223'
  ],
  credentials: true
})); 
app.use(express.json());

// Rate Limiting on general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Specific rate limit for payment/booking endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many payment requests, please try again later'
});

const customBundles = [
  { id: 'all-in-one', title: 'All-in-One (1:1 + all 6 PDFs)', price: 649, originalPrice: 763, savings: 114, description: '1:1 Consultation\nAll 6 PDFs included\nMaximum value package', hasConsultation: true, pdfSelectionCount: 0, paymentLink: 'https://rzp.io/rzp/all61' },
  { id: '1-1-any-4', title: '1:1 + any 4 PDFs', price: 549, originalPrice: 625, savings: 76, description: '1:1 Consultation\nChoose any 4 PDFs', hasConsultation: true, pdfSelectionCount: 4, paymentLink: 'https://rzp.io/rzp/1and4' },
  { id: '1-1-any-2', title: '1:1 + any 2 PDFs', price: 449, originalPrice: 487, savings: 38, description: '1:1 Consultation\nChoose any 2 PDFs', hasConsultation: true, pdfSelectionCount: 2, paymentLink: 'https://rzp.io/rzp/2and1' },
  { id: 'any-4-pdfs', title: 'Any 4 PDFs', price: 229, originalPrice: 276, savings: 47, description: 'Choose any 4 PDFs', hasConsultation: false, pdfSelectionCount: 4, paymentLink: 'https://rzp.io/rzp/any4' },
  { id: 'any-2-pdfs', title: 'Any 2 PDFs', price: 119, originalPrice: 138, savings: 19, description: 'Choose any 2 PDFs', hasConsultation: false, pdfSelectionCount: 2, paymentLink: 'https://rzp.io/rzp/any2pd' }
];

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional().nullable(),
});

const consultationOrderSchema = contactSchema.extend({
  eventId: z.string().min(1),
  slotStart: z.string().min(1),
  slotEnd: z.string().min(1),
  topic: z.string().optional().nullable(),
  bundleId: z.string().optional().nullable(),
  selectedPdfs: z.array(z.string()).optional().nullable()
});

const pdfOrderSchema = contactSchema.extend({
  pdfIds: z.union([z.string(), z.array(z.string())]).refine(val => {
    return Array.isArray(val) ? val.length > 0 : val.trim().length > 0;
  }, "At least one PDF must be selected")
});

const bundleOrderSchema = contactSchema.extend({
  bundleId: z.string().min(1, "Bundle ID is required"),
  selectedPdfs: z.array(z.string()).optional().nullable()
});

// --- TIME SLOT ROUTES ---

// Public route to fetch slots manually added as "free" events in Google Calendar
app.get('/api/slots', async (req, res) => {
  try {
    if (!calendarAPI || !GOOGLE_CALENDAR_ID) {
       return res.status(500).json({ error: 'Calendar API not configured' });
    }

    // Actively clean up expired PENDING bookings to keep the database tidy
    await prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lte: new Date() }
      },
      data: { status: 'TIMEOUT' }
    });

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0); // Start of today
    const timeMax = new Date(timeMin.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days later to catch distant recurring events

    const activeBookings = await prisma.booking.findMany({
      where: {
        status: 'PAID'
      }
    });
    const activeEventIds = new Set(activeBookings.map(b => b.eventId));

    const response = await calendarAPI.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    
    // Filter events where the summary (title) is exactly "free" (case-insensitive)
    const freeEvents = events.filter(e => e.summary && e.summary.toLowerCase().trim() === 'free');

    const allSlots = [];
    let currentId = 1;

    for (const e of freeEvents) {
      const slotStart = new Date(e.start.dateTime || e.start.date);
      const slotEnd = new Date(e.end.dateTime || e.end.date);
      
      // Skip slots that are in the past
      if (slotStart < new Date()) continue;
      
      // Skip slots that are actively pending or paid in our local DB
      if (activeEventIds.has(e.id)) continue;

      const tzOptions = { timeZone: 'Asia/Kolkata' };
      const dateParts = new Intl.DateTimeFormat('en-CA', { ...tzOptions, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(slotStart);
      const dateStr = `${dateParts.find(p=>p.type==='year').value}-${dateParts.find(p=>p.type==='month').value}-${dateParts.find(p=>p.type==='day').value}`;
      
      const timeStr = new Intl.DateTimeFormat('en-US', { ...tzOptions, hour: '2-digit', minute: '2-digit', hour12: true }).format(slotStart);
      
      allSlots.push({
        id: currentId++,
        eventId: e.id,
        date: dateStr,
        time: timeStr,
        isBooked: false,
        slotStart: slotStart.toISOString(),
        slotEnd: slotEnd.toISOString()
      });
    }

    // Limit to the first 12 unique available dates
    const uniqueDates = [...new Set(allSlots.map(s => s.date))];
    const allowedDates = uniqueDates.slice(0, 12);
    
    const finalSlots = allSlots.filter(s => allowedDates.includes(s.date));
    
    res.json(finalSlots);
  } catch (error) {
    console.error("Failed to fetch slots from Google Calendar:", error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

app.post('/api/consultation/create-order', paymentLimiter, async (req, res) => {
  try {
    const validatedData = consultationOrderSchema.parse(req.body);
    const { eventId, slotStart, slotEnd, email, name, phone, topic, bundleId, selectedPdfs } = validatedData;
    
    // Server-side price calculation
    let finalAmount = 349;
    if (bundleId) {
      const bundle = customBundles.find(b => b.id === bundleId);
      if (bundle) finalAmount = bundle.price;
    } else {
      const settings = await prisma.consultationSetting.findUnique({ where: { id: 1 } });
      if (settings) finalAmount = settings.price;
    }
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const newBooking = await prisma.booking.create({
      data: {
        eventId,
        slotStart: new Date(slotStart),
        slotEnd: new Date(slotEnd),
        status: 'PENDING',
        expiresAt,
        name,
        email,
        phone: phone || '',
        topic: topic || '',
        bundleId: bundleId || null,
        selectedPdfs: selectedPdfs ? JSON.stringify(selectedPdfs) : null,
        amount: finalAmount
      }
    });

    const options = {
      amount: Math.round(finalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_booking_${newBooking.id}`,
      notes: {
        type: 'BOOKING',
        bookingId: String(newBooking.id),
        topic: (topic || 'No topic provided').substring(0, 255)
      }
    };

    const order = await razorpay.orders.create(options);
    
    // Save the orderId in Booking for the webhook
    await prisma.booking.update({
      where: { id: newBooking.id },
      data: { orderId: order.id }
    });

    res.json({ success: true, order, bookingId: newBooking.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error("Failed to create consultation order:", error);
    res.status(500).json({ error: 'Failed to create consultation order' });
  }
});

app.post('/api/consultation/verify-payment', paymentLimiter, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
      
    if (expectedSignature === razorpay_signature) {
      const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
      if (booking && booking.status !== 'PAID' && booking.status !== 'CONFLICT_NEEDS_RESCHEDULE') {
        
        // Concurrency Check
        const existingPaidBooking = await prisma.booking.findFirst({
          where: { eventId: booking.eventId, status: 'PAID' }
        });

        if (existingPaidBooking) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CONFLICT_NEEDS_RESCHEDULE' }
          });

          // Insert a (late) event into Google Calendar
          if (calendarAPI && GOOGLE_CALENDAR_ID) {
            try {
              const topicDesc = booking.topic ? `\n\nTopic to discuss:\n${booking.topic}` : '';
              const phoneDesc = booking.phone ? `\nPhone: ${booking.phone}` : '';
              
              await calendarAPI.events.insert({
                calendarId: GOOGLE_CALENDAR_ID,
                requestBody: {
                  summary: `${booking.name} (late)`,
                  description: `Name: ${booking.name}\nEmail: ${booking.email}${phoneDesc}${topicDesc}\n\n[CONFLICT: NEEDS RESCHEDULE]`,
                  start: { dateTime: booking.slotStart.toISOString(), timeZone: 'Asia/Kolkata' },
                  end: { dateTime: booking.slotEnd.toISOString(), timeZone: 'Asia/Kolkata' }
                }
              });
            } catch (calErr) {
              console.error("Failed to insert (late) calendar event:", calErr);
            }
          }

          // Send Email Alert
          try {
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              });
              await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
                subject: 'URGENT: Double Booking Conflict Detected',
                text: `A double booking conflict occurred for eventId: ${booking.eventId}.\n\nThe slot was just taken by another user.\nThe second user has paid, and their booking status is set to CONFLICT_NEEDS_RESCHEDULE.\n\nPlease contact them to reschedule:\nName: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone}\nTopic: ${booking.topic || 'N/A'}`
              });
            }
          } catch (err) {
            console.error("Failed to send conflict email alert:", err);
          }

          return res.json({ success: true, conflict: true });
        }

        // Normal Flow
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'PAID' }
        });

        if (calendarAPI && GOOGLE_CALENDAR_ID) {
          const topicDesc = booking.topic ? `\n\nTopic to discuss:\n${booking.topic}` : '';
          const phoneDesc = booking.phone ? `\nPhone: ${booking.phone}` : '';
          await calendarAPI.events.patch({
            calendarId: GOOGLE_CALENDAR_ID,
            eventId: booking.eventId,
            requestBody: {
              summary: `Booked: ${booking.name}`,
              description: `Email: ${booking.email}${phoneDesc}${topicDesc}`
            }
          });
        }
        
        if (booking.bundleId) {
          sendAdminNotification(
            'New Bundle Purchase (WITH Consultation!)',
            `You have a new bundle purchase with a consultation!\n\nName: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone || 'N/A'}\nBundle ID: ${booking.bundleId}\nSelected PDFs: ${booking.selectedPdfs || '[]'}\nAmount Paid: ₹${booking.amount}\nTime Slot: ${booking.slotStart.toISOString()} - ${booking.slotEnd.toISOString()}\n\nPlease fulfill the PDFs and verify they are on your calendar.`
          );
        } else {
          sendAdminNotification(
            'New Consultation Booking!',
            `Name: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone || 'N/A'}\nTopic: ${booking.topic || 'N/A'}\nAmount Paid: ₹${booking.amount}\nTime Slot: ${booking.slotStart.toISOString()} - ${booking.slotEnd.toISOString()}`
          );
        }

      }
      res.json({ success: true });
    } else {
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: { status: 'FAILED' }
      });
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error("Failed to verify consultation payment:", error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// --- CONNECT LINKS ROUTES ---
app.get('/api/connect-links', async (req, res) => {
  try {
    const links = await prisma.connectLink.findMany({ orderBy: { order: 'asc' } });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connect links' });
  }
});

// --- OFFERINGS ROUTES ---
app.get('/api/offerings', async (req, res) => {
  try {
    const offerings = await prisma.offering.findMany({ orderBy: { id: 'asc' } });
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offerings' });
  }
});

// --- BUNDLES ROUTES ---
app.get('/api/bundles', async (req, res) => {
  try {
    const customBundles = [
      {
        id: 'all-in-one',
        title: 'All-in-One (1:1 + all 6 PDFs)',
        price: 649,
        originalPrice: 763,
        savings: 114,
        description: '1:1 Consultation\nAll 6 PDFs included\nMaximum value package',
        hasConsultation: true,
        pdfSelectionCount: 0, // Gets all of them automatically
        paymentLink: 'https://rzp.io/rzp/all61'
      },
      {
        id: '1-1-any-4',
        title: '1:1 + any 4 PDFs',
        price: 549,
        originalPrice: 625,
        savings: 76,
        description: '1:1 Consultation\nChoose any 4 PDFs',
        hasConsultation: true,
        pdfSelectionCount: 4,
        paymentLink: 'https://rzp.io/rzp/1and4'
      },
      {
        id: '1-1-any-2',
        title: '1:1 + any 2 PDFs',
        price: 449,
        originalPrice: 487,
        savings: 38,
        description: '1:1 Consultation\nChoose any 2 PDFs',
        hasConsultation: true,
        pdfSelectionCount: 2,
        paymentLink: 'https://rzp.io/rzp/2and1'
      },
      {
        id: 'any-4-pdfs',
        title: 'Any 4 PDFs',
        price: 229,
        originalPrice: 276,
        savings: 47,
        description: 'Choose any 4 PDFs',
        hasConsultation: false,
        pdfSelectionCount: 4,
        paymentLink: 'https://rzp.io/rzp/any4'
      },
      {
        id: 'any-2-pdfs',
        title: 'Any 2 PDFs',
        price: 119,
        originalPrice: 138,
        savings: 19,
        description: 'Choose any 2 PDFs',
        hasConsultation: false,
        pdfSelectionCount: 2,
        paymentLink: 'https://rzp.io/rzp/any2pd'
      }
    ];
    res.json(customBundles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// --- CONSULTATION SETTINGS ROUTES ---
app.get('/api/consultation-settings', async (req, res) => {
  try {
    let settings = await prisma.consultationSetting.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.consultationSetting.create({ data: { id: 1, price: 50.0, duration: 30 } });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consultation settings' });
  }
});

// --- BOOKING & WEBHOOK ---

app.post('/api/webhook/payment', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.PAYMENT_SECRET || process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';

    if (!signature || !secret) {
      return res.status(400).send('Missing signature or secret');
    }

    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const payload = JSON.parse(req.body.toString());

    if (payload.event === 'order.paid') {
      const order = payload.payload.order.entity;
      const payment = payload.payload.payment.entity;
      
      const type = order.notes?.type;

      if (type === 'BOOKING') {
        const booking = await prisma.booking.findUnique({ where: { orderId: order.id } });
        if (booking && booking.status !== 'PAID') {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'PAID' }
          });

          if (calendarAPI && GOOGLE_CALENDAR_ID) {
            const topicDesc = booking.topic ? `\n\nTopic to discuss:\n${booking.topic}` : '';
            const phoneDesc = booking.phone ? `\nPhone: ${booking.phone}` : '';
            await calendarAPI.events.patch({
              calendarId: GOOGLE_CALENDAR_ID,
              eventId: booking.eventId,
              requestBody: {
                summary: `Booked: ${booking.name}`,
                description: `Email: ${booking.email}${phoneDesc}${topicDesc}`
              }
            });
          }
        }
      } else if (type === 'PDF') {
        const purchase = await prisma.pdfPurchase.findUnique({ where: { orderId: order.id } });
        if (purchase && purchase.status !== 'SUCCESS') {
          await prisma.pdfPurchase.update({
            where: { id: purchase.id },
            data: { status: 'SUCCESS', paymentId: payment.id }
          });
          const pdfNames = await getPdfTitlesText(purchase.pdfId);
          sendAdminNotification(
            'New PDF Purchase!',
            `You have a new purchase!\n\nName: ${purchase.name}\nEmail: ${purchase.email}\nPhone: ${purchase.phone || 'N/A'}\nPurchased PDFs: ${pdfNames}\nAmount Paid: ₹${purchase.amount}`
          );
        }
      } else if (type === 'BUNDLE') {
        const purchase = await prisma.bundlePurchase.findUnique({ where: { orderId: order.id } });
        if (purchase && purchase.status !== 'SUCCESS') {
          await prisma.bundlePurchase.update({
            where: { id: purchase.id },
            data: { status: 'SUCCESS', paymentId: payment.id }
          });
          const bundle = customBundles.find(b => b.id === purchase.bundleId);
          const bundleTitle = bundle ? bundle.title : purchase.bundleId;
          const pdfNames = await getPdfTitlesText(purchase.selectedPdfs);
          sendAdminNotification(
            'New Bundle Purchase!',
            `You have a new purchase!\n\nName: ${purchase.name}\nEmail: ${purchase.email}\nPhone: ${purchase.phone || 'N/A'}\nBundle: ${bundleTitle}\nSelected PDFs: ${pdfNames}\nAmount Paid: ₹${purchase.amount}`
          );
        }
      }
    }

    res.send('OK');
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send('Internal Error');
  }
});

// --- PDF PURCHASE ROUTES ---

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});
console.log(`[DEBUG] Initialized Razorpay with Key ID: ${process.env.RAZORPAY_KEY_ID}`);

app.post('/api/pdf/create-order', paymentLimiter, async (req, res) => {
  try {
    const validatedData = pdfOrderSchema.parse(req.body);
    const { pdfIds, name, email, phone } = validatedData;
    
    // Server-side price calculation
    const pdfIdArray = Array.isArray(pdfIds) ? pdfIds : [pdfIds];
    const validIds = pdfIdArray.map(Number).filter(n => !isNaN(n));
    const offerings = await prisma.offering.findMany({
      where: { id: { in: validIds.length > 0 ? validIds : [-1] } }
    });
    let finalAmount = offerings.reduce((sum, offer) => sum + offer.price, 0);
    if (finalAmount <= 0) finalAmount = 149; // fallback
    
    const options = {
      amount: Math.round(finalAmount * 100), // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: { type: 'PDF' }
    };
    
    const order = await razorpay.orders.create(options);
    
    await prisma.pdfPurchase.create({
      data: {
        orderId: order.id,
        pdfId: Array.isArray(pdfIds) ? pdfIds.join(', ') : String(pdfIds),
        amount: finalAmount,
        name,
        email,
        phone: phone || null,
      }
    });
    
    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error("Failed to create Razorpay order:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/pdf/verify-payment', paymentLimiter, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
      
    if (expectedSignature === razorpay_signature) {
      const purchase = await prisma.pdfPurchase.findUnique({ where: { orderId: razorpay_order_id } });
      if (purchase && purchase.status !== 'SUCCESS') {
        await prisma.pdfPurchase.update({
          where: { id: purchase.id },
          data: { status: 'SUCCESS', paymentId: razorpay_payment_id }
        });
        const pdfNames = await getPdfTitlesText(purchase.pdfId);
        sendAdminNotification(
          'New PDF Purchase!',
          `You have a new purchase!\n\nName: ${purchase.name}\nEmail: ${purchase.email}\nPhone: ${purchase.phone || 'N/A'}\nPurchased PDFs: ${pdfNames}\nAmount Paid: ₹${purchase.amount}`
        );
      }
      res.json({ success: true });
    } else {
      await prisma.pdfPurchase.update({
        where: { orderId: razorpay_order_id },
        data: {
          status: 'FAILED',
          paymentId: razorpay_payment_id
        }
      });
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error("Failed to verify payment:", error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// --- BUNDLE PURCHASE ROUTES ---

app.post('/api/bundle/create-order', paymentLimiter, async (req, res) => {
  try {
    const validatedData = bundleOrderSchema.parse(req.body);
    const { bundleId, selectedPdfs, name, email, phone } = validatedData;
    
    // Server-side price calculation
    let finalAmount = 229; // fallback
    const bundle = customBundles.find(b => b.id === bundleId);
    if (bundle) finalAmount = bundle.price;
    
    const options = {
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `receipt_bundle_${Date.now()}`,
      notes: { type: 'BUNDLE' }
    };
    
    const order = await razorpay.orders.create(options);
    
    await prisma.bundlePurchase.create({
      data: {
        orderId: order.id,
        bundleId: String(bundleId),
        selectedPdfs: JSON.stringify(selectedPdfs || []),
        amount: finalAmount,
        name,
        email,
        phone: phone || null,
      }
    });
    
    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error("Failed to create bundle order:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/bundle/verify-payment', paymentLimiter, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
      
    if (expectedSignature === razorpay_signature) {
      const purchase = await prisma.bundlePurchase.findUnique({ where: { orderId: razorpay_order_id } });
      if (purchase && purchase.status !== 'SUCCESS') {
        await prisma.bundlePurchase.update({
          where: { id: purchase.id },
          data: { status: 'SUCCESS', paymentId: razorpay_payment_id }
        });
        const bundle = customBundles.find(b => b.id === purchase.bundleId);
        const bundleTitle = bundle ? bundle.title : purchase.bundleId;
        const pdfNames = await getPdfTitlesText(purchase.selectedPdfs);
        sendAdminNotification(
          'New Bundle Purchase!',
          `You have a new purchase!\n\nName: ${purchase.name}\nEmail: ${purchase.email}\nPhone: ${purchase.phone || 'N/A'}\nBundle: ${bundleTitle}\nSelected PDFs: ${pdfNames}\nAmount Paid: ₹${purchase.amount}`
        );
      }
      res.json({ success: true });
    } else {
      await prisma.bundlePurchase.update({
        where: { orderId: razorpay_order_id },
        data: {
          status: 'FAILED',
          paymentId: razorpay_payment_id
        }
      });
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error("Failed to verify bundle payment:", error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});
