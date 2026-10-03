import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  EnvelopeSimple, 
  Copy, 
  Check, 
  ArrowSquareOut
} from '@phosphor-icons/react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const email = "support@thejenishshah.com";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = "Contact Jenish Shah";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Reach Jenish Shah directly via email or social.";
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@thejenishshah',
      url: 'https://instagram.com/thejenishshah',
      icon: FaInstagram,
    },
    {
      name: 'Facebook',
      handle: '@thejenishshah',
      url: 'https://facebook.com/thejenishshah',
      icon: FaFacebook,
    },
    {
      name: 'YouTube',
      handle: '@thejenishshah',
      url: 'https://www.youtube.com/@thejenishshah',
      icon: FaYoutube,
    },
    {
      name: 'WhatsApp Channel',
      handle: '@thejenishshah',
      url: 'https://whatsapp.com/channel/0029VbEkxWWGufJ0zMq5WA1P',
      icon: FaWhatsapp,
    },
    {
      name: 'LinkedIn',
      handle: '@thejenishshah',
      url: 'https://linkedin.com/in/thejenishshah',
      icon: FaLinkedin,
    },
  ];

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto relative bg-[#0c0c0e] rounded-2xl sm:rounded-3xl md:rounded-[32px] shadow-2xl border border-white/10 text-slate-200"
    >
      {/* Navigation Top Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between mb-4 sm:mb-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm sm:text-base md:text-sm text-slate-200 outline-none font-bold bg-white/10 px-4 sm:px-5 md:px-4 py-2.5 sm:py-3 md:py-2.5 rounded-full border border-white/15 shadow-sm active:scale-95"
        >
          <ArrowLeft size={18} className="text-[#E5C158]" /> 
          <span>Back to Home</span>
        </Link>
      </nav>

      {/* Hero Header - Professional, Aesthetic & Minimalist */}
      <header className="relative p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#141418] to-[#0c0c0e] rounded-2xl sm:rounded-3xl border border-[var(--accent-gold,#E5C158)]/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] mb-6 sm:mb-8 overflow-hidden">
        {/* Minimal Golden Hairline Accent at Top Edge */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent-gold,#E5C158)]/50 to-transparent" 
          aria-hidden="true" 
        />

        {/* Quiet Ambient Gold Glow */}
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-gold,#E5C158)]/8 rounded-full blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Content: Solid Typography, No Color Shifts, No Icons, No Text Above */}
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3 md:mb-4">
            Contact Jenish Shah
          </h1>

          <p className="text-slate-200 text-base md:text-[15px] leading-relaxed max-w-2xl font-normal">
            Reach Jenish Shah directly via email or official social channels for inquiries, partnerships, or mentorship notes.
          </p>
        </div>
      </header>

      {/* Email Hub Card */}
      <section className="p-5 sm:p-6 md:p-7 bg-[#141418] border border-[#E5C158]/30 rounded-2xl mb-8 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-2.5 text-[#E5C158] mb-3">
          <EnvelopeSimple size={24} weight="duotone" />
          <h2 className="text-xl md:text-lg font-bold text-white tracking-tight">Direct Email Address</h2>
        </div>
        <p className="text-sm md:text-sm text-slate-300 md:text-slate-300 mb-4 md:mb-5 leading-relaxed">
          The primary inbox for personal notes, general questions, business proposals, and direct outreach.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 md:p-3.5 bg-white/[0.04] border border-white/10 rounded-xl transition-colors">
          <a 
            href={`mailto:${email}`}
            className="text-base md:text-base font-bold md:font-semibold text-white transition-colors truncate"
          >
            {email}
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmail}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 md:px-4 md:py-2.5 bg-white text-slate-950 rounded-xl text-sm md:text-sm font-extrabold transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-sm"
              title="Copy Email"
              aria-label="Copy Email"
            >
              {copied ? (
                <>
                  <Check size={14} weight="bold" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} weight="bold" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Social Media Channels Grid (Black & Gold Theme) */}
      <section className="space-y-4 mb-8">
        <h2 className="text-xl md:text-lg font-bold text-white tracking-tight">
          Official Social Media Channels
        </h2>

        <div className="flex flex-col gap-3 md:gap-3.5">
          {socialLinks.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center p-3 sm:p-3.5 md:p-3.5 rounded-2xl bg-white shadow-sm transition-all border border-slate-200 border-l-[4px] border-l-[#C69214]"
              >
                {/* Black Round Icon Badge with White Icon */}
                <div className="w-11 h-11 md:w-11 md:h-11 rounded-full bg-black flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <IconComp size={22} />
                </div>

                <div className="flex-1 text-left px-3 sm:px-3.5 min-w-0">
                  <h3 className="text-base md:text-[16px] font-bold text-gray-950 md:text-gray-900 tracking-tight leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-slate-600 text-[13px] md:text-[13px] mt-0.5 font-medium leading-normal">
                    {item.handle}
                  </p>
                </div>

                <ArrowSquareOut size={18} className="text-gray-400 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      </section>

    </motion.main>
  );
};

export default Contact;
