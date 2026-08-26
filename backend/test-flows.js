import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000';

async function generateSignature(orderId, paymentId) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
  return crypto.createHmac('sha256', secret)
    .update(orderId + "|" + paymentId)
    .digest('hex');
}

async function runTests() {
  console.log('--- STARTING TESTS ---');

  // 1. Test 1:1 Booking
  console.log('\n[1] Testing 1:1 Booking...');
  const slotDate = new Date();
  slotDate.setDate(slotDate.getDate() + 1); // tomorrow
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
      name: 'Test User 1',
      email: 'test1@example.com',
      phone: '1234567890',
      topic: 'Test Topic',
      amount: 50
    })
  });
  
  const bookingData = await bookingRes.json();
  if (!bookingData.success) {
    console.error('Failed to create booking order', bookingData);
    return;
  }
  console.log('Order created:', bookingData.order.id);

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
  console.log('Payment Verify 1:', verifyData1);
  
  const dbBooking1 = await prisma.booking.findUnique({ where: { id: bookingData.bookingId } });
  console.log('DB Booking 1 Status:', dbBooking1.status);


  // 2. Test Conflict (Double Booking)
  console.log('\n[2] Testing Double Booking Conflict...');
  
  const bookingRes2 = await fetch(`${API_BASE}/api/consultation/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: testEventId, // same event ID!
      slotStart: slotDate.toISOString(),
      slotEnd: slotEnd.toISOString(),
      name: 'Test User 2',
      email: 'test2@example.com',
      phone: '0987654321',
      topic: 'Conflict Topic',
      amount: 50
    })
  });
  
  const bookingData2 = await bookingRes2.json();
  console.log('Order 2 created:', bookingData2.order.id);

  const paymentId2 = 'pay_test_' + Date.now();
  const signature2 = await generateSignature(bookingData2.order.id, paymentId2);

  const verifyRes2 = await fetch(`${API_BASE}/api/consultation/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: bookingData2.order.id,
      razorpay_payment_id: paymentId2,
      razorpay_signature: signature2,
      bookingId: bookingData2.bookingId
    })
  });
  
  const verifyData2 = await verifyRes2.json();
  console.log('Payment Verify 2 (Expected Conflict):', verifyData2);
  
  const dbBooking2 = await prisma.booking.findUnique({ where: { id: bookingData2.bookingId } });
  console.log('DB Booking 2 Status (Expected CONFLICT_NEEDS_RESCHEDULE):', dbBooking2.status);


  // 3. Test PDF Purchase
  console.log('\n[3] Testing PDF Purchase...');
  const pdfRes = await fetch(`${API_BASE}/api/pdf/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test PDF User',
      email: 'testpdf@example.com',
      phone: '1234567890',
      pdfIds: ['PDF 1', 'PDF 2'],
      amount: 10
    })
  });
  
  const pdfData = await pdfRes.json();
  if (pdfData.error) {
    console.error('Failed to create PDF order', pdfData);
  } else {
    console.log('PDF Order created:', pdfData.id);

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
    console.log('PDF Payment Verify:', pdfVerifyData);
    
    const dbPdf = await prisma.pdfPurchase.findUnique({ where: { orderId: pdfData.id } });
    console.log('DB PDF Status (Expected SUCCESS):', dbPdf?.status);
  }

  console.log('\n--- TESTS COMPLETE ---');
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
