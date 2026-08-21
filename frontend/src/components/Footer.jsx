import React from 'react';
import { EnvelopeSimple, Code } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-2 w-full flex flex-col items-center gap-4">
      {/* Contact Link */}
      <a 
        href="mailto:support@thejenishshah.com" 
        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300 mb-2"
      >
        <EnvelopeSimple size={20} className="text-accent/80 group-hover:text-accent transition-colors" />
        <span className="text-base font-medium tracking-wide relative">
          support@thejenishshah.com
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-300"></span>
        </span>
      </a>
      
      {/* Footer Details */}
      <div className="flex flex-col items-center gap-2 text-center w-full relative pt-4">
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <p className="text-sm text-slate-400 font-medium tracking-wide">
          © {new Date().getFullYear()} Thejenishshah. | <Link to="/policy" className="hover:text-accent transition-colors">Policy and Terms & Conditions</Link>
        </p>
        
        <a href="https://instagram.com/matrixfortress" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-accent transition-colors font-mono mb-4">
          <Code size={16} /> Designed by Matrix Fortress
        </a>
      </div>
    </footer>
  );
};

export default Footer;
