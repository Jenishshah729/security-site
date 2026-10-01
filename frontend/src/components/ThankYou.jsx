import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ArrowLeft } from '@phosphor-icons/react';
import { useLocation } from 'react-router-dom';

const ThankYou = ({ onBack }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const hasConsultation = queryParams.get('hasConsultation') === 'true';

  let message = '';
  if (type === 'consultation') {
    message = 'Your meeting link will be sent via email.';
  } else if (type === 'pdf') {
    message = 'Your PDF will be emailed to you within 24 hours.';
  } else if (type === 'bundle') {
    if (hasConsultation) {
      message = 'Your meeting link and bundle PDFs will be emailed to you within 24 hours.';
    } else {
      message = 'Your bundle PDFs will be emailed to you within 24 hours.';
    }
  } else {
    message = 'If you purchased a PDF Store item, you will receive it via email within 24 hours.';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 sm:p-8 md:p-12 text-center flex flex-col items-center bg-[#0c0c0e] rounded-2xl sm:rounded-3xl md:rounded-[32px] border border-white/10 shadow-2xl"
    >
      <motion.div 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-[#E5C158]/10 text-[#E5C158] flex items-center justify-center mb-6 border border-[#E5C158]/30 shadow-none"
      >
        <CheckCircle weight="fill" size={48} />
      </motion.div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Payment Successful</h2>
      <p className="text-slate-400 mb-8 max-w-sm text-center leading-relaxed text-sm md:text-base">
        Thank you for your purchase! We have received your payment securely. <br /><br />
        <span className="text-[#E5C158] font-semibold">{message}</span>
      </p>
      
      <button 
        onClick={onBack}
        className="px-6 py-3 rounded-full border border-white/10 text-xs md:text-sm font-semibold text-slate-300 bg-white/5 transition-colors flex items-center gap-2 group"
      >
        <ArrowLeft size={16} className="text-[#E5C158] transition-transform" /> Return to Home
      </button>
    </motion.div>
  );
};

export default ThankYou;
