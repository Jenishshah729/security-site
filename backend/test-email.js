import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!user || !pass) {
    console.error('Missing SMTP_USER or SMTP_PASS in .env');
    return;
  }

  console.log('Connecting to SMTP with user: ' + user);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    console.log('SMTP Connection verified successfully!');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: user,
      to: process.env.ADMIN_EMAIL || user,
      subject: 'Test Email - SMTP Configuration Success',
      text: 'This is a test email from your backend server. If you received this, your email alerts are working perfectly!'
    });
    
    console.log('Test email sent! Message ID: ' + info.messageId);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

testEmail();
