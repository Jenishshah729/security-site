import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
// helmet automatically sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options
app.use(helmet()); 
// Configure CORS to accept requests from any origin during development
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

// Input Validation Schemas (Zod)
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

const slotSchema = z.object({
  date: z.string(), // e.g., "2026-08-20"
  time: z.string()  // e.g., "14:00"
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT for admin routes
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// --- TIME SLOT ROUTES ---

// Public route to fetch all slots (from Google Calendar FreeBusy)
app.get('/api/slots', async (req, res) => {
  try {
    if (!calendarAPI || !GOOGLE_CALENDAR_ID) {
       return res.status(500).json({ error: 'Calendar API not configured' });
    }

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0); // Start of today
    const timeMax = new Date(timeMin.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later

    const response = await calendarAPI.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: 'Asia/Kolkata',
        items: [{ id: GOOGLE_CALENDAR_ID }]
      }
    });

    const busyTimes = response.data.calendars[GOOGLE_CALENDAR_ID].busy;
    
    // Generate potential slots: Mon-Fri, 10 AM to 5 PM IST, every 30 mins
    const slots = [];
    let currentId = 1;

    for (let d = new Date(timeMin); d < timeMax; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) continue; // Skip weekends

      for (let h = 10; h < 17; h++) {
        for (let m = 0; m < 60; m += 30) {
          const slotStart = new Date(d);
          slotStart.setHours(h, m, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 mins later
          
          if (slotStart < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)) continue; // 24-hour notice

          // Check if slot overlaps with busy times
          const isBusy = busyTimes.some(busy => {
            const bStart = new Date(busy.start);
            const bEnd = new Date(busy.end);
            return (slotStart < bEnd && slotEnd > bStart);
          });

          const dateStr = slotStart.toISOString().split('T')[0];
          const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          
          slots.push({
            id: currentId++,
            date: dateStr,
            time: timeStr,
            isBooked: isBusy,
            slotStart: slotStart.toISOString(),
            slotEnd: slotEnd.toISOString()
          });
        }
      }
    }
    
    res.json(slots);
  } catch (error) {
    console.error("Failed to fetch slots from Google Calendar:", error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Protected route to add a new time slot
app.post('/api/slots', authenticateAdmin, async (req, res) => {
  try {
    const { date, time } = slotSchema.parse(req.body);
    const newSlot = await prisma.timeSlot.create({
      data: { date, time }
    });
    res.json({ success: true, slot: newSlot });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add slot' });
  }
});

// Public route to book a slot
app.post('/api/book-slot', async (req, res) => {
  try {
    const { slotStart, slotEnd, email, name } = req.body;
    
    if (!calendarAPI || !GOOGLE_CALENDAR_ID) {
      return res.status(500).json({ error: 'Calendar API not configured' });
    }

    // Create event
    const event = {
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
      attendees: email ? [{ email }] : [],
      conferenceData: {
        createRequest: {
          requestId: `consult-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const calendarResponse = await calendarAPI.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all' // Sends email to attendees
    });

    res.json({ success: true, eventLink: calendarResponse.data.htmlLink, meetLink: calendarResponse.data.hangoutLink });
  } catch (error) {
    console.error("Failed to book slot:", error);
    res.status(400).json({ error: 'Failed to book slot' });
  }
});

// Protected route to delete a time slot
app.delete('/api/slots/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.timeSlot.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete slot' });
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

app.post('/api/admin/connect-links', authenticateAdmin, async (req, res) => {
  try {
    const { title, url, order } = req.body;
    const newLink = await prisma.connectLink.create({ data: { title, url, order: order || 0 } });
    res.json({ success: true, link: newLink });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add connect link' });
  }
});

app.put('/api/admin/connect-links/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, order } = req.body;
    const updatedLink = await prisma.connectLink.update({
      where: { id: parseInt(id) },
      data: { title, url, order }
    });
    res.json({ success: true, link: updatedLink });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update connect link' });
  }
});

app.delete('/api/admin/connect-links/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.connectLink.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Connect link deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete connect link' });
  }
});

// --- OFFERINGS ROUTES ---
app.get('/api/offerings', async (req, res) => {
  try {
    const offerings = await prisma.offering.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(offerings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offerings' });
  }
});

app.post('/api/admin/offerings', authenticateAdmin, async (req, res) => {
  try {
    const { title, description, price, coverImage, pdfUrl } = req.body;
    const newOffering = await prisma.offering.create({
      data: { title, description, price: parseFloat(price), coverImage, pdfUrl }
    });
    res.json({ success: true, offering: newOffering });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add offering' });
  }
});

app.put('/api/admin/offerings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, coverImage, pdfUrl } = req.body;
    const updatedOffering = await prisma.offering.update({
      where: { id: parseInt(id) },
      data: { title, description, price: parseFloat(price), coverImage, pdfUrl }
    });
    res.json({ success: true, offering: updatedOffering });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update offering' });
  }
});

app.delete('/api/admin/offerings/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.offering.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Offering deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete offering' });
  }
});

// --- BUNDLES ROUTES ---
app.get('/api/bundles', async (req, res) => {
  try {
    const bundles = await prisma.bundle.findMany({
      include: { offerings: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bundles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

app.post('/api/admin/bundles', authenticateAdmin, async (req, res) => {
  try {
    const { title, price, description, hasConsultation, offeringIds } = req.body;
    const newBundle = await prisma.bundle.create({
      data: { 
        title, 
        price: parseFloat(price), 
        description,
        hasConsultation: Boolean(hasConsultation),
        offerings: {
          connect: (offeringIds || []).map(id => ({ id: parseInt(id) }))
        }
      },
      include: { offerings: true }
    });
    res.json({ success: true, bundle: newBundle });
  } catch (error) {
    res.status(400).json({ error: 'Failed to add bundle' });
  }
});

app.put('/api/admin/bundles/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, hasConsultation, offeringIds } = req.body;
    const updatedBundle = await prisma.bundle.update({
      where: { id: parseInt(id) },
      data: { 
        title, 
        price: parseFloat(price), 
        description,
        hasConsultation: Boolean(hasConsultation),
        offerings: {
          set: (offeringIds || []).map(oid => ({ id: parseInt(oid) }))
        }
      },
      include: { offerings: true }
    });
    res.json({ success: true, bundle: updatedBundle });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bundle' });
  }
});

app.delete('/api/admin/bundles/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.bundle.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Bundle deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete bundle' });
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

app.put('/api/admin/consultation-settings', authenticateAdmin, async (req, res) => {
  try {
    const { price, duration, description } = req.body;
    const settings = await prisma.consultationSetting.upsert({
      where: { id: 1 },
      update: { price: parseFloat(price), duration: parseInt(duration), description },
      create: { id: 1, price: parseFloat(price), duration: parseInt(duration), description }
    });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update consultation settings' });
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
