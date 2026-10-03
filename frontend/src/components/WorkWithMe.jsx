import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  EnvelopeSimple, 
  ArrowSquareOut
} from '@phosphor-icons/react';

const WorkWithMe = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = "Work With Jenish Shah | Careers, Internships & Collaborations";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Explore internships and sales roles at Matrix Fortress and Himmatlal Machine Tools, or partner with Jenish Shah on brand collaborations.";
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto relative bg-[#0c0c0e] rounded-2xl sm:rounded-3xl md:rounded-[32px] shadow-2xl border border-white/10 text-slate-200"
    >
      {/* Navigation Top Bar */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between mb-5 sm:mb-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm sm:text-base md:text-sm text-slate-200 outline-none font-bold bg-white/10 px-4 sm:px-5 md:px-4 py-2.5 sm:py-3 md:py-2.5 rounded-full border border-white/15 shadow-sm active:scale-95"
        >
          <ArrowLeft size={18} className="text-[#E5C158]" /> 
          <span>Back to Home</span>
        </Link>
      </nav>

      {/* Hero Header - Professional, Aesthetic & Minimalist */}
      <header className="relative p-5 sm:p-7 md:p-9 bg-gradient-to-b from-[#141418] to-[#0c0c0e] rounded-2xl sm:rounded-3xl border border-[var(--accent-gold,#E5C158)]/20 shadow-[0_16px_40px_rgba(0,0,0,0.6)] mb-6 sm:mb-8 overflow-hidden">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4">
            Work With Jenish Shah
          </h1>

          <p className="text-slate-200 text-base sm:text-lg md:text-[15px] leading-relaxed max-w-2xl font-normal">
            There are three ways to work with Jenish Shah: join Matrix Fortress, join the sales team at Himmatlal Machine Tools, or collaborate on content and brand partnerships.
          </p>
        </div>
      </header>

      {/* 3 Work Streams */}
      <div className="space-y-6 sm:space-y-8 relative z-10">

        {/* Opportunity 1: Matrix Fortress */}
        <article className="p-5 sm:p-7 md:p-8 bg-[#141418] rounded-2xl border border-white/10 transition-all">
          <div className="flex items-center gap-3.5 mb-4">
            {/* White background container for company logo */}
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
              <img 
                src={`${import.meta.env.BASE_URL}matrix-fortress-logo.png?v=3`} 
                alt="Matrix Fortress Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/128x128/ffffff/0070BA?text=MF";
                }}
              />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-xl font-black text-white tracking-tight leading-snug">
              Careers &amp; Internships at Matrix Fortress
            </h2>
          </div>

          <p className="text-slate-200 text-base sm:text-lg md:text-[15px] leading-relaxed mb-6 font-normal">
            Matrix Fortress is actively hiring for job positions and onboarding interns across cybersecurity, offensive security, secure software development, and growth marketing. Roles are available both remotely and on-site. Whether you're an ambitious professional looking for your next career role or a fast learner looking for hands-on, production-grade security experience rather than another passive course, we'd love to hear from you.
          </p>

          <div className="p-4 sm:p-5 bg-[#181820] rounded-2xl border border-white/15 flex items-start sm:items-center gap-3.5">
            <EnvelopeSimple size={24} className="text-[#E5C158] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm sm:text-base md:text-[15px] text-slate-100 leading-relaxed font-medium">
              To apply, send an email to <a href="mailto:support@thejenishshah.com?subject=Matrix%20Fortress%20Role" className="text-[#E5C158] font-bold underline underline-offset-4 decoration-[#E5C158]/50 break-all sm:break-normal">support@thejenishshah.com</a> with subject <span className="text-white font-bold">"Matrix Fortress Role"</span>.
            </p>
          </div>
        </article>

        {/* Opportunity 2: Himmatlal Machine Tools */}
        <article className="p-5 sm:p-7 md:p-8 bg-[#141418] rounded-2xl border border-white/10 transition-all">
          <div className="flex items-center gap-3.5 mb-4">
            {/* White background container for company logo */}
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
              <img 
                src={`${import.meta.env.BASE_URL}hmt-logo-transparent.png?v=4`} 
                alt="Himmatlal Machine Tools Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/128x128/ffffff/0070BA?text=HMT";
                }}
              />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-xl font-black text-white tracking-tight leading-snug">
              Sales Careers &amp; Internships at Himmatlal Machine Tools
            </h2>
          </div>

          <p className="text-slate-200 text-base sm:text-lg md:text-[15px] leading-relaxed mb-6 font-normal">
            HMT is looking for sales team members and interns in Ahmedabad — roles are available on-site or offsite. It's a fit for someone with knowledge of or genuine interest in industrial machinery — woodworking machinery, sheet metal machinery, garage equipment, welding machines, and power tools — who wants to build real sales experience in the field.
          </p>

          <div className="p-4 sm:p-5 bg-[#181820] rounded-2xl border border-white/15 flex items-start sm:items-center gap-3.5">
            <EnvelopeSimple size={24} className="text-[#E5C158] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm sm:text-base md:text-[15px] text-slate-100 leading-relaxed font-medium">
              To apply, send an email to <a href="mailto:support@thejenishshah.com?subject=HMT%20Sales%20Role" className="text-[#E5C158] font-bold underline underline-offset-4 decoration-[#E5C158]/50 break-all sm:break-normal">support@thejenishshah.com</a> with subject <span className="text-white font-bold">"HMT Sales Role"</span>.
            </p>
          </div>
        </article>

        {/* Opportunity 3: Collaborations & Partnerships */}
        <article className="p-5 sm:p-7 md:p-8 bg-[#141418] rounded-2xl border border-white/10 transition-all">
          <div className="flex items-center gap-3.5 mb-4">
            {/* Clean borderless Jenish avatar image without thick white border */}
            <img
              src={`${import.meta.env.BASE_URL}logo.jpg`}
              alt="Jenish Shah"
              className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md border border-white/10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/44x44/141418/E5C158?text=JS";
              }}
            />
            <h2 className="text-xl sm:text-2xl md:text-xl font-black text-white tracking-tight leading-snug">
              Collaborations &amp; Partnerships
            </h2>
          </div>

          <p className="text-slate-200 text-base sm:text-lg md:text-[15px] leading-relaxed mb-6 font-normal">
            Jenish Shah is open to brand collaborations, sponsorships, partnerships, and invitations to speak or contribute, reaching a combined audience of 100,000+ across Instagram, Facebook, and YouTube.
          </p>

          <div className="p-4 sm:p-5 bg-[#181820] rounded-2xl border border-white/15 flex items-start sm:items-center gap-3.5">
            <EnvelopeSimple size={24} className="text-[#E5C158] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm sm:text-base md:text-[15px] text-slate-100 leading-relaxed font-medium">
              To propose a collaboration, send an email to <a href="mailto:support@thejenishshah.com?subject=Collaboration" className="text-[#E5C158] font-bold underline underline-offset-4 decoration-[#E5C158]/50 break-all sm:break-normal">support@thejenishshah.com</a> with subject <span className="text-white font-bold">"Collaboration"</span>.
            </p>
          </div>
        </article>

      </div>
    </motion.main>
  );
};

export default WorkWithMe;
