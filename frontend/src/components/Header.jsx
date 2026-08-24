import React from 'react';
import { motion } from 'motion/react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="flex flex-col items-center text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-white/20 p-1 mb-6 relative group cursor-default"
      >
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="w-full h-full rounded-full overflow-hidden bg-surface-elevated flex items-center justify-center relative z-10">
          <img 
            src={`${import.meta.env.BASE_URL}logo.jpg`} 
            alt="Jenish Shah" 
            className="w-full h-full object-cover transition-all duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/128x128/0a0e17/00ff66?text=JS";
            }}
          />
        </div>
      </motion.div>
      
      <motion.h1 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2"
      >
        Thejenishshah
      </motion.h1>
      
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-slate-300 text-sm md:text-base font-medium tracking-wide flex items-center justify-center gap-1.5">
          Grab your Chai/Coffee.
          <span className="font-bold text-[#00ff66] relative inline-block">
            Let's Hack.
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#00ff66] rounded-full opacity-80"></span>
          </span>
        </p>
      </motion.div>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center gap-5 md:gap-7 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl"
      >
        <a href="https://whatsapp.com/channel/thejenishshah" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:scale-110 transition-all text-[#25D366]">
          <FaWhatsapp size={26} />
        </a>
        <a href="https://instagram.com/thejenishshah" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:scale-110 transition-all text-[#E1306C]">
          <FaInstagram size={26} />
        </a>
        <a href="https://facebook.com/thejenishshah" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:scale-110 transition-all text-[#1877F2]">
          <FaFacebook size={26} />
        </a>
        <a href="https://youtube.com/thejenishshah" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:scale-110 transition-all text-[#FF0000]">
          <FaYoutube size={26} />
        </a>
        <a href="https://linkedin.com/in/thejenishshah" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 hover:scale-110 transition-all text-[#0A66C2]">
          <FaLinkedin size={26} />
        </a>
      </motion.div>
    </header>
  );
};

export default Header;
