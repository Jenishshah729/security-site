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

// Security Middlewares
app.use(helmet()); 
app.use(cors()); 
app.use(express.json());

// Rate Limiting on all API routes to prevent brute-force/spam
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

const slotSchema = z.object({
  date: z.string(), // e.g., "2026-08-20"
  time: z.string()  // e.g., "14:00"
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

// Public route to initialize booking intent with Orders API
app.post('/api/consultation/create-order', async (req, res) => {
  try {
    console.log(`[DEBUG] /api/consultation/create-order called. Using Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID}`);
    const { eventId, slotStart, slotEnd, email, name, phone, amount, topic } = req.body;
    
    const finalAmount = amount || 349;
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const newBooking = await prisma.booking.create({
      data: {
        eventId,
        slotStart: new Date(slotStart),
        slotEnd: new Date(slotEnd),
        status: 'PENDING',
        expiresAt,
        name: name || '',
        email: email || '',
        phone: phone || '',
        topic: topic || ''
      }
    });

    const options = {
      amount: finalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_booking_${newBooking.id}`,
      notes: {
        type: 'BOOKING',
        bookingId: newBooking.id,
        topic: topic || 'No topic provided'
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
    console.error("Failed to create consultation order:", error);
    res.status(400).json({ error: 'Failed to create consultation order' });
  }
});

app.post('/api/consultation/verify-payment', async (req, res) => {
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
        await prisma.pdfPurchase.updateMany({
          where: { orderId: order.id, status: { not: 'SUCCESS' } },
          data: { status: 'SUCCESS', paymentId: payment.id }
        });
      } else if (type === 'BUNDLE') {
        await prisma.bundlePurchase.updateMany({
          where: { orderId: order.id, status: { not: 'SUCCESS' } },
          data: { status: 'SUCCESS', paymentId: payment.id }
        });
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

app.post('/api/pdf/create-order', async (req, res) => {
  try {
    const { pdfId, amount, name, email, phone } = req.body;
    
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: { type: 'PDF' }
    };
    
    const order = await razorpay.orders.create(options);
    
    await prisma.pdfPurchase.create({
      data: {
        orderId: order.id,
        pdfId: String(pdfId),
        amount: parseFloat(amount),
        name,
        email,
        phone: phone || null,
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/pdf/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
      
    if (expectedSignature === razorpay_signature) {
      await prisma.pdfPurchase.update({
        where: { orderId: razorpay_order_id },
        data: {
          status: 'SUCCESS',
          paymentId: razorpay_payment_id
        }
      });
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

app.post('/api/bundle/create-order', async (req, res) => {
  try {
    const { bundleId, selectedPdfs, amount, name, email, phone } = req.body;
    
    const options = {
      amount: amount * 100,
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
        amount: parseFloat(amount),
        name,
        email,
        phone: phone || null,
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error("Failed to create bundle order:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/bundle/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
      
    if (expectedSignature === razorpay_signature) {
      await prisma.bundlePurchase.update({
        where: { orderId: razorpay_order_id },
        data: {
          status: 'SUCCESS',
          paymentId: razorpay_payment_id
        }
      });
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
