import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react';

const Policy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto relative bg-[#0c0c0e] rounded-2xl sm:rounded-3xl md:rounded-[32px] shadow-2xl border border-white/10"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-400 transition-colors mb-4 sm:mb-6 outline-none group relative z-10 font-medium bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
        <ArrowLeft size={14} className="text-[#E5C158] transition-transform" /> Back to Home
      </Link>

      <div className="p-4 sm:p-5 md:p-6 bg-[#141418] rounded-xl sm:rounded-2xl border border-white/10 mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 bg-white/5 border border-white/10 rounded-xl text-[#E5C158] shrink-0">
          <ShieldCheck weight="duotone" size={28} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">Terms & Conditions</h2>
        </div>
      </div>

      <div className="space-y-6 text-slate-300 text-sm md:text-base leading-relaxed relative z-10">
        <section className="p-5 bg-[#141418] rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">1. 1:1 Consultation & Rescheduling Policy</h3>
          <p className="text-slate-400 text-sm">
            All 1:1 consultation bookings must be paid in advance. Following successful payment, your meeting access link and confirmation details will be delivered to your provided email address within 24 hours. All consultation payments are strictly non-refundable.<br/><br/>
            If you need to change your session time, you may request to reschedule by emailing <a href="mailto:support@thejenishshah.com" className="text-[#E5C158] underline decoration-[#E5C158]/40">support@thejenishshah.com</a> at least 24 hours prior to your scheduled call time. Rescheduling requests made within 24 hours of the scheduled call time will not be accepted, and the session fee will be forfeited.<br/><br/>
            If Jenish needs to reschedule a session for any reason, you will be notified in advance and provided with alternative time slots to choose from.
          </p>
        </section>

        <section className="p-5 bg-[#141418] rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">2. Digital Products (PDFs & Bundles)</h3>
          <p className="text-slate-400 text-sm">
            Digital products (PDFs and bundles) will be delivered to your email address within 24 hours of successful payment. All sales of digital products are strictly final — no cancellations, returns, or refunds are permitted under any circumstances once payment is completed.<br/><br/>
            If you experience any technical issues receiving or opening your purchased files after 24 hours, please contact <a href="mailto:support@thejenishshah.com" className="text-[#E5C158] underline decoration-[#E5C158]/40">support@thejenishshah.com</a> and we will resolve it promptly.
          </p>
        </section>

        <section className="p-5 bg-[#141418] rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">3. Ethical & Legal Use Policy</h3>
          <p className="text-slate-400 text-sm mb-3">
            All services, consultations, and digital products provided are strictly for educational, research, and legitimate cybersecurity assessment purposes. Under no circumstances will consultations or services cover illegal, unauthorized, or malicious activities — including but not limited to hacking email accounts, breaching social media profiles, unauthorized network access, or exploiting systems without consent.
          </p>
          <p className="text-slate-400 text-sm mb-2">
            If a 1:1 consultation is booked or requested for illegal purposes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
            <li>The session will be immediately denied, canceled, or terminated.</li>
            <li>No response or assistance will be provided regarding the illegal request.</li>
            <li><strong className="text-red-400">No refunds</strong> will be issued for any bookings made in violation of this policy.</li>
          </ul>
        </section>

        <section className="p-5 bg-[#141418] rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">4. Privacy Policy</h3>
          <p className="text-slate-400 text-sm">
            We respect your privacy. Any personal information you provide — including your name, email address, phone number, and payment details — is used strictly to fulfill your order or schedule your consultation. We do not sell or share your personal data with third parties. Payments are processed securely via third-party gateways (e.g., Razorpay); we do not store your financial or credit card information on our servers.<br/><br/>
            You may request access to or deletion of your personal data at any time by emailing <a href="mailto:support@thejenishshah.com" className="text-[#E5C158] underline decoration-[#E5C158]/40">support@thejenishshah.com</a>.
          </p>
        </section>

        <section className="p-5 bg-[#141418] rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">5. Intellectual Property</h3>
          <p className="text-slate-400 text-sm">
            All content provided through consultations, PDFs, and this website is the intellectual property of Jenish Shah. You may not distribute, reproduce, resell, or repost any digital products or consultation content without explicit written permission.
          </p>
        </section>

        <section className="p-5 bg-[#141418] rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-2">6. Contact Information</h3>
          <p className="text-slate-400 text-sm">
            For any questions or concerns regarding these terms, please contact us at <a href="mailto:support@thejenishshah.com" className="text-[#E5C158] underline decoration-[#E5C158]/40">support@thejenishshah.com</a>.
          </p>
        </section>
      </div>
    </motion.section>
  );
};

export default Policy;
