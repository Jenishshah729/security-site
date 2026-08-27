import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react';

const Policy = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="p-6 md:p-10 max-w-4xl mx-auto relative overflow-hidden bg-[#0B0C10] rounded-[32px] shadow-2xl border border-white/10 my-10"
    >
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
      
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10 outline-none group relative z-10 font-medium">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <div className="flex items-center gap-5 mb-10 relative z-10">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white">
          <ShieldCheck weight="duotone" size={32} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Terms & Conditions</h2>
        </div>
      </div>

      <div className="space-y-8 text-slate-300 leading-relaxed relative z-10">
        <section>
          <h3 className="text-xl font-bold text-white mb-4">1. Booking and Cancellations</h3>
          <p className="mb-4">
            All 1:1 consultation bookings must be paid in advance. If you need to cancel or reschedule your session, please email <a href="mailto:support@thejenishshah.com" className="text-white underline decoration-white/30 underline-offset-2 hover:text-slate-300">support@thejenishshah.com</a> at least 24 hours before your scheduled call time. Cancellations made within 24 hours of the call time will not be refunded.<br/><br/>
            If Jenish needs to cancel or reschedule a session for any reason, you will be notified in advance and offered an alternative time slot or a full refund, your choice.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-4">2. Digital Products (PDFs & Bundles)</h3>
          <p className="mb-4">
            Digital products (PDFs and bundles) are delivered to your email within 24 hours of purchase. Due to the nature of digital products, all sales are final and non-refundable once the product has been delivered. If you experience any technical issues receiving or opening your purchase, please contact us and we'll help resolve it promptly.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-4">3. Ethical & Legal Use Policy</h3>
          <p className="mb-4">
            All services, consultations, and digital products provided are strictly for educational, research, and legitimate cybersecurity assessment purposes. Under no circumstances will consultations or services cover illegal, unauthorized, or malicious activities — including but not limited to hacking email accounts, breaching social media profiles, unauthorized network access, or exploiting systems without consent.
          </p>
          <p className="mb-4">
            If a 1:1 consultation is booked or requested for illegal purposes:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>The session will be immediately denied, canceled, or terminated.</li>
            <li>No response or assistance will be provided regarding the illegal request.</li>
            <li><strong>No refunds</strong> will be issued for any bookings made in violation of this policy.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-4">4. Privacy Policy</h3>
          <p className="mb-4">
            We respect your privacy. Any personal information you provide — including your name, email address, phone number, and payment details — is used strictly to fulfill your order or schedule your consultation. We do not sell or share your personal data with third parties.<br/><br/>
            You may request access to or deletion of your personal data at any time by emailing <a href="mailto:support@thejenishshah.com" className="text-white underline decoration-white/30 underline-offset-2 hover:text-slate-300">support@thejenishshah.com</a>.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-4">5. Intellectual Property</h3>
          <p className="mb-4">
            All content provided through consultations, PDFs, and this website is the intellectual property of Jenish Shah. You may not distribute, reproduce, resell, or repost any digital products or consultation content without explicit written permission.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-4">6. Contact Information</h3>
          <p>
            For any questions or concerns regarding these terms, please contact us at <a href="mailto:support@thejenishshah.com" className="text-white underline decoration-white/30 underline-offset-2 hover:text-slate-300">support@thejenishshah.com</a>.
          </p>
        </section>
      </div>
    </motion.section>
  );
};

export default Policy;
