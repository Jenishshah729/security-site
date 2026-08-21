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
    message = 'If you purchased a PDF Store item, you will receive it via email shortly.';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass-panel p-8 md:p-12 text-center flex flex-col items-center"
    >
      <motion.div 
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6 border border-accent/30 shadow-[0_0_30px_rgba(0,255,102,0.2)]"
      >
        <CheckCircle weight="fill" size={48} />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Payment Successful</h2>
      <p className="text-slate-300 mb-8 max-w-sm text-center">
        Thank you for your purchase! We have received your payment securely. <br /><br />
        <span className="text-accent">{message}</span>
      </p>
      
      <motion.button 
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="px-6 py-3 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Return to Home
      </motion.button>
    </motion.div>
  );
};

export default ThankYou;
