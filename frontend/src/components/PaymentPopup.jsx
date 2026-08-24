import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from '@phosphor-icons/react';

const PaymentPopup = ({ isOpen, type, title, message, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-[#12141D] border border-white/10 p-8 rounded-[32px] max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center z-10"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${type === 'success' ? 'bg-[#00ff66]/10 text-[#00ff66] shadow-[#00ff66]/10' : 'bg-red-500/10 text-red-500 shadow-red-500/10'}`}>
              {type === 'success' ? (
                <CheckCircle size={48} weight="fill" />
              ) : (
                <XCircle size={48} weight="fill" />
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-400 mb-8 leading-relaxed font-medium">
              {message}
            </p>
            
            <button 
              onClick={onConfirm}
              className={`w-full py-4 font-bold text-lg rounded-2xl transition-colors active:scale-95 flex items-center justify-center gap-2 ${type === 'success' ? 'bg-[#00ff66] text-[#0B0C10] hover:bg-[#00cc52]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentPopup;
