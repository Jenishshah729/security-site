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

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});
console.log(`[DEBUG] Initialized Razorpay with Key ID: ${process.env.RAZORPAY_KEY_ID}, Secret length: ${process.env.RAZORPAY_KEY_SECRET?.length}`);

async function createRazorpayOrderWithRetry(options, maxRetries = 5) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await razorpay.orders.create(options);
    } catch (err) {
      lastError = err;
      const status = err.statusCode || (err.response && err.response.status);
      console.log(`[Razorpay Attempt ${attempt}/${maxRetries} Failed]:`, status || err.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 600 * attempt));
        continue;
      }
    }
  }
  throw lastError;
}

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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        connectSrc: ["'self'", "https://lumberjack.razorpay.com", "https://api.razorpay.com"],
        imgSrc: ["'self'", "data:", "https:"],
        // upgradeInsecureRequests: [], // Temporarily disabled until HTTPS is fully setup
      },
    },
  })
);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://161.118.191.223' // Fallback for pre-domain
].filter(Boolean);

// Allow local LAN IPs (e.g. mobile devices on same Wi-Fi: 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
const isLocalOrLanOrigin = (origin) => {
  try {
    const url = new URL(origin);
    const host = url.hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.endsWith('.local')
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isLocalOrLanOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked]: Origin ${origin} not in whitelist`);
        callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);
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
  // 1. All in One (All 6 PDFs + 1:1)
  { 
    id: 'all-in-one', 
    title: 'All 6 PDFs + 1:1 Mentorship', 
    price: 929, 
    originalPrice: 1543, 
    savings: 614, 
    description: '1:1 Mentorship Call (30 mins)\nAll 6 Premium Cybersecurity PDFs\nMaximum value package', 
    hasConsultation: true, 
    pdfSelectionCount: 0, 
    category: 'consultation',
    badge: 'Best Value',
    paymentLink: 'https://rzp.io/rzp/all61' 
  },
  // 2. All 6 PDFs Standalone
  { 
    id: 'all-6-pdfs', 
    title: 'All 6 PDFs Bundle', 
    price: 749, 
    originalPrice: 1194, 
    savings: 445, 
    description: 'Instant access to all 6 Cybersecurity PDFs\nComplete offensive & defensive library\nLifetime access & future revisions', 
    hasConsultation: false, 
    pdfSelectionCount: 0, 
    category: 'pdf-only',
    badge: '37.3% Off',
    paymentLink: 'https://rzp.io/rzp/all6pdf' 
  },
  // 3. Any 4 PDFs + 1:1
  { 
    id: '1-1-any-4', 
    title: 'Any 4 PDFs + 1:1 Mentorship', 
    price: 799, 
    originalPrice: 1245, 
    savings: 446, 
    description: '1:1 Mentorship Call (30 mins)\nChoose any 4 Cybersecurity PDFs\nTargeted mentorship & deep dives', 
    hasConsultation: true, 
    pdfSelectionCount: 4, 
    category: 'consultation',
    paymentLink: 'https://rzp.io/rzp/1and4' 
  },
  // 4. Any 4 PDFs Standalone
  { 
    id: 'any-4-pdfs', 
    title: 'Any 4 PDFs Bundle', 
    price: 579, 
    originalPrice: 896, 
    savings: 317, 
    description: 'Choose any 4 Cybersecurity PDFs\nBuild your custom reading track\nLifetime access & future revisions', 
    hasConsultation: false, 
    pdfSelectionCount: 4, 
    category: 'pdf-only',
    badge: 'Up to 35% Off',
    paymentLink: 'https://rzp.io/rzp/any4' 
  },
  // 5. Any 2 PDFs + 1:1
  { 
    id: '1-1-any-2', 
    title: 'Any 2 PDFs + 1:1 Mentorship', 
    price: 549, 
    originalPrice: 847, 
    savings: 298, 
    description: '1:1 Mentorship Call (30 mins)\nChoose any 2 Cybersecurity PDFs\nStarter 1:1 session & core guides', 
    hasConsultation: true, 
    pdfSelectionCount: 2, 
    category: 'consultation',
    paymentLink: 'https://rzp.io/rzp/2and1' 
  },
  // 6. Any 2 PDFs Standalone
  { 
    id: 'any-2-pdfs', 
    title: 'Any 2 PDFs Bundle', 
    price: 329, 
    originalPrice: 498, 
    savings: 169, 
    description: 'Choose any 2 Cybersecurity PDFs\nFocused learning package\nLifetime access & future revisions', 
    hasConsultation: false, 
    pdfSelectionCount: 2, 
    category: 'pdf-only',
    badge: '34% Off',
    paymentLink: 'https://rzp.io/rzp/any2pd' 
  }
];

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(25).optional().nullable(),
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
  pdfIds: z.union([
    z.string(),
    z.number(),
    z.array(z.union([z.string(), z.number()]))
  ]).refine(val => {
    return Array.isArray(val) ? val.length > 0 : String(val).trim().length > 0;
  }, "At least one PDF must be selected")
});

const bundleOrderSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  bundleId: z.string().min(1, "Bundle ID is required"),
  selectedPdfs: z.union([
    z.array(z.union([z.string(), z.number()])),
    z.string()
  ]).optional().nullable(),
  selectedPdfIds: z.union([
    z.array(z.union([z.string(), z.number()])),
    z.string()
  ]).optional().nullable(),
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
      
      // Mark slot as booked if it's already paid in our local DB
      const isBooked = activeEventIds.has(e.id);

      const tzOptions = { timeZone: 'Asia/Kolkata' };
      const dateParts = new Intl.DateTimeFormat('en-CA', { ...tzOptions, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(slotStart);
      const dateStr = `${dateParts.find(p=>p.type==='year').value}-${dateParts.find(p=>p.type==='month').value}-${dateParts.find(p=>p.type==='day').value}`;
      
      const timeStr = new Intl.DateTimeFormat('en-US', { ...tzOptions, hour: '2-digit', minute: '2-digit', hour12: true }).format(slotStart);
      
      allSlots.push({
        id: currentId++,
        eventId: e.id,
        date: dateStr,
        time: timeStr,
        isBooked,
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
    
    // Concurrency Check: Check if slot has already been booked by another user
    const existingPaid = await prisma.booking.findFirst({
      where: { eventId, status: 'PAID' }
    });
    if (existingPaid) {
      return res.status(409).json({
        error: 'This time slot is already taken by another person. Please select a different time slot.',
        slotTaken: true
      });
    }
    
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

    const order = await createRazorpayOrderWithRetry(options);
    
    // Save the orderId in Booking for the webhook
    await prisma.booking.update({
      where: { id: newBooking.id },
      data: { orderId: order.id }
    });

    res.json({
      success: true,
      order: {
        ...order,
        orderId: order.id,
        order_id: order.id,
        keyId: process.env.RAZORPAY_KEY_ID
      },
      bookingId: newBooking.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
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
              let bundleDetails = '';
              if (booking.bundleId) {
                const bundleTitles = await getPdfTitlesText(booking.selectedPdfs);
                const bundle = customBundles.find(b => b.id === booking.bundleId);
                const bundleName = bundle ? bundle.title : booking.bundleId;
                bundleDetails = `\nBundle: ${bundleName}\nSelected PDFs: ${bundleTitles}`;
              }
              const timeSlotInfo = `\nTime Slot Selected: ${booking.slotStart.toISOString()} - ${booking.slotEnd.toISOString()}`;

              await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
                subject: 'URGENT: Double Booking Conflict Detected',
                text: `A double booking conflict occurred for eventId: ${booking.eventId}.\n\nThe slot was just taken by another user.\nThe second user has paid, and their booking status is set to CONFLICT_NEEDS_RESCHEDULE.\n\nPlease contact them to reschedule:\nName: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone || 'N/A'}\nAmount Paid: ₹${booking.amount}${bundleDetails}${timeSlotInfo}\nTopic: ${booking.topic || 'N/A'}`
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
          try {
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
          } catch (calErr) {
            console.error("Failed to patch Google Calendar event:", calErr.message || calErr);
          }
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
    const offerings = await prisma.offering.findMany();
    // Layout order: 149 -> 249 -> 199 -> 149 -> 199 -> 249
    const orderCovers = [
      '/top-10-mistakes.png', // ₹149 (Beginner Blind Spots)
      '/burp-suite.jpg',      // ₹249 (Crack the Request)
      '/ctf-guide.jpg',       // ₹199 (Flag Hunter's Playbook)
      '/hackers-toolkit.jpg',  // ₹149 (The Hacker's Arsenal)
      '/cloud-security-v4.jpg',// ₹199 (Breach in the Cloud)
      '/soc-analyst.jpg'      // ₹249 (Behind the Screens)
    ];
    offerings.sort((a, b) => {
      const idxA = orderCovers.indexOf(a.coverImage);
      const idxB = orderCovers.indexOf(b.coverImage);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.id - b.id;
    });
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offerings' });
  }
});

// --- BUNDLES ROUTES ---
app.get('/api/bundles', async (req, res) => {
  try {
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

app.post('/api/webhook/payment', apiLimiter, express.raw({type: 'application/json'}), async (req, res) => {
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

// --- STANDARD RAZORPAY CHECKOUT ROUTES ---
app.post('/api/create-order', paymentLimiter, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || Number(amount) < 100) {
      return res.status(400).json({ error: 'Minimum amount must be at least 100 paise (₹1)' });
    }
    const options = {
      amount: Math.round(Number(amount)),
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };
    const order = await createRazorpayOrderWithRetry(options);
    res.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
});

app.post('/api/verify-payment', paymentLimiter, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature mismatch' });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, error: 'Internal verification error' });
  }
});

// --- PDF PURCHASE ROUTES ---

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
    
    const order = await createRazorpayOrderWithRetry(options);
    
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
    
    res.json({
      ...order,
      orderId: order.id,
      order_id: order.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
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
    const bundleId = validatedData.bundleId;
    const name = validatedData.name || validatedData.customerName || 'Customer';
    const email = validatedData.email || validatedData.customerEmail || 'support@example.com';
    const phone = validatedData.phone || validatedData.customerPhone || null;
    const selectedPdfs = validatedData.selectedPdfs || validatedData.selectedPdfIds || [];
    
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
    
    const order = await createRazorpayOrderWithRetry(options);
    
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
    
    res.json({
      ...order,
      orderId: order.id,
      order_id: order.id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
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

// Global JSON Error Handler - Prevents HTML error pages on mobile/API clients
app.use((err, req, res, next) => {
  console.error('[API Error Caught]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});
