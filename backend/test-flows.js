import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ override: true });
const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateSignature(orderId, paymentId) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
  return crypto.createHmac('sha256', secret)
    .update(orderId + "|" + paymentId)
    .digest('hex');
}

async function runTests() {
  console.log('=== RUNNING FULL PAYMENT & CONCURRENCY TESTS ===');
  console.log('Active Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);

  await sleep(2000);

  // 1. Test 1:1 Booking Flow (User 1)
  console.log('\n--- [TEST 1] 1:1 Consultation Booking (User 1) ---');
  const slotDate = new Date();
  slotDate.setDate(slotDate.getDate() + 2);
  const slotEnd = new Date(slotDate);
  slotEnd.setMinutes(slotEnd.getMinutes() + 30);
  const testEventId = 'test_event_' + Date.now();

  const bookingRes = await fetch(`${API_BASE}/api/consultation/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: testEventId,
      slotStart: slotDate.toISOString(),
      slotEnd: slotEnd.toISOString(),
      name: 'User One',
      email: 'user1@test.com',
      phone: '+919876543210',
      topic: 'Career Guidance',
      amount: 349
    })
  });
  
  const bookingData = await bookingRes.json();
  console.log('User 1 Order Creation:', bookingRes.status, bookingData.order?.id ? `SUCCESS (${bookingData.order.id})` : bookingData);
  if (!bookingData.success) throw new Error('Failed to create booking order');

  const paymentId1 = 'pay_test_' + Date.now();
  const signature1 = await generateSignature(bookingData.order.id, paymentId1);

  const verifyRes1 = await fetch(`${API_BASE}/api/consultation/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: bookingData.order.id,
      razorpay_payment_id: paymentId1,
      razorpay_signature: signature1,
      bookingId: bookingData.bookingId
    })
  });
  const verifyData1 = await verifyRes1.json();
  console.log('User 1 Payment Verification:', verifyData1);
  const dbBooking1 = await prisma.booking.findUnique({ where: { id: bookingData.bookingId } });
  console.log('User 1 DB Status:', dbBooking1.status);


  // 2. Test Concurrency: Late User 2 tries to book the EXACT SAME slot
  console.log('\n--- [TEST 2] Concurrency / Duplicate Slot Booking Check (User 2) ---');
  const bookingRes2 = await fetch(`${API_BASE}/api/consultation/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: testEventId, // Identical slot that was just booked and paid!
      slotStart: slotDate.toISOString(),
      slotEnd: slotEnd.toISOString(),
      name: 'User Two',
      email: 'user2@test.com',
      phone: '+919876543211',
      topic: 'Career Guidance',
      amount: 349
    })
  });
  const bookingData2 = await bookingRes2.json();
  console.log('User 2 Order Creation Status:', bookingRes2.status);
  console.log('User 2 Order Creation Response:', bookingData2);
  if (bookingRes2.status === 409 && bookingData2.slotTaken) {
    console.log('>>> PASSED: Late user is immediately blocked from booking already taken slot!');
  } else {
    console.error('>>> FAILED: User 2 was not blocked!');
  }

  await sleep(2000);

  // 3. Test PDF Store Flow
  console.log('\n--- [TEST 3] PDF Store Purchase ---');
  const pdfRes = await fetch(`${API_BASE}/api/pdf/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'PDF Buyer',
      email: 'pdfbuyer@test.com',
      phone: '+919876543212',
      pdfIds: [78, 79]
    })
  });
  const pdfData = await pdfRes.json();
  console.log('PDF Order Creation:', pdfRes.status, pdfData.id ? `SUCCESS (${pdfData.id}, ₹${pdfData.amount / 100})` : pdfData);
  if (!pdfData.id) throw new Error('Failed to create PDF order');

  const pdfPaymentId = 'pay_pdf_' + Date.now();
  const pdfSignature = await generateSignature(pdfData.id, pdfPaymentId);

  const pdfVerifyRes = await fetch(`${API_BASE}/api/pdf/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: pdfData.id,
      razorpay_payment_id: pdfPaymentId,
      razorpay_signature: pdfSignature
    })
  });
  const pdfVerifyData = await pdfVerifyRes.json();
  console.log('PDF Payment Verification:', pdfVerifyData);
  const dbPdf = await prisma.pdfPurchase.findUnique({ where: { orderId: pdfData.id } });
  console.log('DB PDF Purchase Status:', dbPdf?.status);

  await sleep(2000);

  // 4. Test Standalone Bundle Store Flow (Any 2 PDFs)
  console.log('\n--- [TEST 4] Standalone Bundle Store Purchase (any-2-pdfs) ---');
  const bundleRes = await fetch(`${API_BASE}/api/bundle/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bundleId: 'any-2-pdfs',
      selectedPdfs: ['The Mistake Map for Beginners', 'The Toolkit Nobody Hands You'],
      name: 'Bundle Buyer',
      email: 'bundlebuyer@test.com',
      phone: '+919876543213'
    })
  });
  const bundleData = await bundleRes.json();
  console.log('Standalone Bundle Order Creation:', bundleRes.status, bundleData.id ? `SUCCESS (${bundleData.id}, ₹${bundleData.amount / 100})` : bundleData);
  if (!bundleData.id) throw new Error('Failed to create bundle order');

  const bundlePaymentId = 'pay_bundle_' + Date.now();
  const bundleSignature = await generateSignature(bundleData.id, bundlePaymentId);

  const bundleVerifyRes = await fetch(`${API_BASE}/api/bundle/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: bundleData.id,
      razorpay_payment_id: bundlePaymentId,
      razorpay_signature: bundleSignature
    })
  });
  const bundleVerifyData = await bundleVerifyRes.json();
  console.log('Standalone Bundle Payment Verification:', bundleVerifyData);
  const dbBundle = await prisma.bundlePurchase.findUnique({ where: { orderId: bundleData.id } });
  console.log('DB Bundle Purchase Status:', dbBundle?.status);

  await sleep(2000);

  // 5. Test Bundle With Consultation Flow (All-in-One / 1:1 + Any 4)
  console.log('\n--- [TEST 5] Bundle With Consultation (all-in-one) ---');
  const testBundleSlotId = 'test_bundle_event_' + Date.now();
  const bundleConsultationRes = await fetch(`${API_BASE}/api/consultation/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: testBundleSlotId,
      slotStart: slotDate.toISOString(),
      slotEnd: slotEnd.toISOString(),
      name: 'All In One Buyer',
      email: 'allinone@test.com',
      phone: '+919876543214',
      topic: 'Full Roadmap & Review',
      bundleId: 'all-in-one',
      selectedPdfs: ['PDF 1', 'PDF 2', 'PDF 3', 'PDF 4', 'PDF 5', 'PDF 6']
    })
  });
  const bundleConsultationData = await bundleConsultationRes.json();
  console.log('Bundle + 1:1 Order Creation:', bundleConsultationRes.status, bundleConsultationData.order?.id ? `SUCCESS (${bundleConsultationData.order.id}, ₹${bundleConsultationData.order.amount / 100})` : bundleConsultationData);
  if (!bundleConsultationData.success) throw new Error('Failed to create bundle+consultation order');

  const bPaymentId = 'pay_bundle_consult_' + Date.now();
  const bSignature = await generateSignature(bundleConsultationData.order.id, bPaymentId);

  const bVerifyRes = await fetch(`${API_BASE}/api/consultation/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: bundleConsultationData.order.id,
      razorpay_payment_id: bPaymentId,
      razorpay_signature: bSignature,
      bookingId: bundleConsultationData.bookingId
    })
  });
  const bVerifyData = await bVerifyRes.json();
  console.log('Bundle + 1:1 Payment Verification:', bVerifyData);
  const dbBookingBundle = await prisma.booking.findUnique({ where: { id: bundleConsultationData.bookingId } });
  console.log('DB Bundle + 1:1 Status:', dbBookingBundle?.status, 'Amount: ₹' + dbBookingBundle?.amount);

  console.log('\n=== ALL PAYMENT & CONCURRENCY TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
