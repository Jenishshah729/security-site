import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';

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
  max: 100, // Limit each IP to 100 requests per window
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

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0); // Start of today
    const timeMax = new Date(timeMin.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

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

    const slots = [];
    let currentId = 1;

    for (const e of freeEvents) {
      const slotStart = new Date(e.start.dateTime || e.start.date);
      const slotEnd = new Date(e.end.dateTime || e.end.date);
      
      // Skip slots that are in the past
      if (slotStart < new Date()) continue;

      const h = slotStart.getHours();
      const m = slotStart.getMinutes();
      
      const dateStr = slotStart.toISOString().split('T')[0];
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      
      slots.push({
        id: currentId++,
        eventId: e.id,
        date: dateStr,
        time: timeStr,
        isBooked: false,
        slotStart: slotStart.toISOString(),
        slotEnd: slotEnd.toISOString()
      });
    }
    
    res.json(slots);
  } catch (error) {
    console.error("Failed to fetch slots from Google Calendar:", error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Public route to book a slot
app.post('/api/book-slot', async (req, res) => {
  try {
    const { eventId, slotStart, slotEnd, email, name } = req.body;
    
    if (!calendarAPI || !GOOGLE_CALENDAR_ID) {
      return res.status(500).json({ error: 'Calendar API not configured' });
    }

    // Update event
    const eventPatch = {
      summary: `Consultation with ${name || 'User'}`,
      description: `1:1 Consultation booked via website.`,
      start: {
        dateTime: slotStart,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: slotEnd,
        timeZone: 'Asia/Kolkata',
      },
      attendees: email ? [{ email }] : []
    };

    let calendarResponse;
    if (eventId) {
      calendarResponse = await calendarAPI.events.patch({
        calendarId: GOOGLE_CALENDAR_ID,
        eventId: eventId,
        resource: eventPatch,
        sendUpdates: 'all' // Sends email to attendees
      });
    } else {
      calendarResponse = await calendarAPI.events.insert({
        calendarId: GOOGLE_CALENDAR_ID,
        resource: eventPatch,
        sendUpdates: 'all'
      });
    }

    res.json({ success: true, eventLink: calendarResponse.data.htmlLink, meetLink: calendarResponse.data.hangoutLink });
  } catch (error) {
    console.error("Failed to book slot:", error);
    res.status(400).json({ error: 'Failed to book slot' });
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
        pdfSelectionCount: 0 // Gets all of them automatically
      },
      {
        id: '1-1-any-4',
        title: '1:1 + any 4 PDFs',
        price: 549,
        originalPrice: 625,
        savings: 76,
        description: '1:1 Consultation\nChoose any 4 PDFs',
        hasConsultation: true,
        pdfSelectionCount: 4
      },
      {
        id: '1-1-any-2',
        title: '1:1 + any 2 PDFs',
        price: 449,
        originalPrice: 487,
        savings: 38,
        description: '1:1 Consultation\nChoose any 2 PDFs',
        hasConsultation: true,
        pdfSelectionCount: 2
      },
      {
        id: 'any-4-pdfs',
        title: 'Any 4 PDFs',
        price: 229,
        originalPrice: 276,
        savings: 47,
        description: 'Choose any 4 PDFs',
        hasConsultation: false,
        pdfSelectionCount: 4
      },
      {
        id: 'any-2-pdfs',
        title: 'Any 2 PDFs',
        price: 119,
        originalPrice: 138,
        savings: 19,
        description: 'Choose any 2 PDFs',
        hasConsultation: false,
        pdfSelectionCount: 2
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

// --- BOOKING & WEBHOOK (Stubbed) ---

app.post('/api/webhook/payment', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-razorpay-signature']; // Example for Razorpay
  // Cryptographically verify the signature here using process.env.PAYMENT_SECRET
  // Never trust a webhook without verifying the signature
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});
