import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Code, 
  MegaphoneSimple, 
  ArrowSquareOut,
  Hammer,
  Factory,
  CarSimple,
  Flame,
  Lightning,
  GearSix
} from '@phosphor-icons/react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = "About Jenish Shah | Founder, Matrix Fortress | Ahmedabad";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Jenish Shah is a cybersecurity educator and founder of Matrix Fortress, based in Ahmedabad. Reaching 100K+ across Instagram, Facebook & YouTube.";
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

      {/* Hero Header Section - Professional, Aesthetic & Minimalist */}
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

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
          {/* Avatar - Aesthetic Rounded Square with Subtle Gold Border Rim */}
          <div className="relative group flex-shrink-0">
            <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 via-[var(--accent-gold,#E5C158)]/25 to-white/5 border border-white/10 shadow-lg">
              <img 
                src={`${import.meta.env.BASE_URL}jenish-shah.jpg?v=warm-v2`} 
                alt="Jenish Shah" 
                className="w-28 h-28 md:w-32 md:h-32 rounded-xl object-cover object-center shadow-inner"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${import.meta.env.BASE_URL}logo.jpg`;
                }}
              />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3 md:mb-4">
              About Jenish Shah
            </h1>

            <p className="text-slate-200 text-base md:text-[15px] lg:text-base leading-relaxed max-w-2xl font-normal">
              Jenish Shah is a cybersecurity educator, content creator, and entrepreneur based in Ahmedabad, Gujarat, India. He is pursuing a B.Tech in Cyber Security at Indus University, Gujarat, while founding and running Matrix Fortress, a cybersecurity services and education firm, working as the sales and marketing specialist at his family's business, Himmatlal Machine Tools (HMT), and creating cybersecurity content under the handle @thejenishshah, reaching over 100,000 people across Instagram, Facebook, and YouTube.
            </p>
          </div>
        </div>

        {/* Highlight Stats Grid - Refined Minimal Black & Gold Aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/[0.08] text-left">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-gold,#E5C158)]/40 to-transparent" aria-hidden="true" />
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Audience</div>
            <div className="text-xl md:text-xl lg:text-2xl font-black md:font-bold text-white tracking-tight mt-1">100K+</div>
            <div className="text-xs md:text-[12.5px] text-[var(--accent-gold,#E5C158)] mt-1 font-semibold md:font-medium">Instagram • Facebook • YouTube</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-gold,#E5C158)]/40 to-transparent" aria-hidden="true" />
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Venture</div>
            <div className="text-xl md:text-xl lg:text-2xl font-black md:font-bold text-white tracking-tight mt-1">Matrix Fortress</div>
            <div className="text-xs md:text-[12.5px] text-[var(--accent-gold,#E5C158)] mt-1 font-semibold md:font-medium">Founder &amp; CEO</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-gold,#E5C158)]/40 to-transparent" aria-hidden="true" />
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Education</div>
            <div className="text-xl md:text-xl lg:text-2xl font-black md:font-bold text-white tracking-tight mt-1">B.Tech Cybersecurity</div>
            <div className="text-xs md:text-[12.5px] text-[var(--accent-gold,#E5C158)] mt-1 font-semibold md:font-medium">Indus University</div>
          </div>
        </div>
      </header>

      {/* Structured Content Sections */}
      <div className="space-y-6 text-slate-200 relative z-10">

        {/* Section 1: Who is Jenish Shah? */}
        <article className="p-5 sm:p-6 md:p-7 bg-[#141418] rounded-2xl border border-white/10 transition-all">
          <h2 className="text-xl md:text-xl font-extrabold md:font-bold text-white tracking-tight mb-3 md:mb-4">
            Who is Jenish Shah?
          </h2>
          <p className="text-slate-200 text-base md:text-[15px] leading-relaxed">
            Jenish Shah studies, builds, and creates at the same time. He is a Cyber Security student at Indus University, the founder running Matrix Fortress's day-to-day execution, the sales and marketing specialist at his family's business Himmatlal Machine Tools, and a cybersecurity content creator teaching ethical hacking and security fundamentals to a growing beginner audience.
          </p>
        </article>

        {/* Section 2: Cybersecurity Content & Education */}
        <article className="p-5 sm:p-6 md:p-7 bg-[#141418] rounded-2xl border border-white/10 transition-all">
          <h2 className="text-xl md:text-xl font-extrabold md:font-bold text-white tracking-tight mb-3 md:mb-4">
            Cybersecurity Content &amp; Education
          </h2>

          <p className="text-slate-200 text-base md:text-[15px] leading-relaxed mb-5 md:mb-5">
            Under the handle @thejenishshah, Jenish Shah creates cybersecurity content publishing beginner guides, tool walkthroughs, and CTF/pentesting explainers. He also produces a curated collection of practical, high-impact PDF guides designed to fast-track real-world security skills, built for people starting exactly where he did.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link 
              to="/pdf-store" 
              className="py-3.5 px-6 md:py-3 md:px-5 rounded-xl bg-white text-slate-950 font-black md:font-extrabold text-sm md:text-sm flex items-center justify-center gap-1.5 transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Explore PDF Store</span>
              <ArrowSquareOut size={16} weight="bold" className="text-slate-700" />
            </Link>
            <Link 
              to="/consultation" 
              className="py-3.5 px-6 md:py-3 md:px-5 rounded-xl bg-white text-slate-950 font-black md:font-extrabold text-sm md:text-sm flex items-center justify-center gap-1.5 transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-sm"
            >
              <span>1:1 Consultation</span>
              <ArrowSquareOut size={16} weight="bold" className="text-slate-700" />
            </Link>
          </div>
        </article>

        {/* Section 3: Matrix Fortress — Founder & CEO */}
        <article className="p-5 sm:p-6 md:p-7 bg-gradient-to-br from-[#141418] via-[#16161c] to-[#121216] rounded-2xl border border-white/10 shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            {/* Original crisp white background container */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Matrix Fortress
            </h2>
          </div>

          <p className="text-slate-200 text-base md:text-[15px] leading-relaxed mb-5">
            As founder and CEO of Matrix Fortress, Jenish Shah leads a cybersecurity and digital solutions firm based in Ahmedabad, delivering services to clients and businesses worldwide — helping organizations globally identify critical vulnerabilities, build secure software architectures, and drive strategic growth.
          </p>

          {/* Matrix Fortress Offerings */}
          <div className="mt-5 pt-5 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
              Services &amp; Solutions Offerings
            </h3>
            <div className="flex flex-col gap-2.5">
              {/* 1. Cybersecurity Core */}
              <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/5 flex items-start gap-3.5 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#01649e]/10 border border-[#01649e]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#01649e]">
                  <ShieldCheck size={18} weight="bold" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight mb-1">Cybersecurity Core</h4>
                  <p className="text-xs md:text-[13px] text-slate-300 leading-relaxed font-normal">
                    Cybersecurity services, the firm's core focus — helping businesses identify and close security gaps
                  </p>
                </div>
              </div>

              {/* 2. Secure Development */}
              <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/5 flex items-start gap-3.5 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#01649e]/10 border border-[#01649e]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#01649e]">
                  <Code size={18} weight="bold" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight mb-1">Secure Development</h4>
                  <p className="text-xs md:text-[13px] text-slate-300 leading-relaxed font-normal">
                    Secure development services for web, app, and software projects
                  </p>
                </div>
              </div>

              {/* 3. Marketing */}
              <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/5 flex items-start gap-3.5 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#01649e]/10 border border-[#01649e]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#01649e]">
                  <MegaphoneSimple size={18} weight="bold" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight mb-1">Marketing</h4>
                  <p className="text-xs md:text-[13px] text-slate-300 leading-relaxed font-normal">
                    Marketing services and digital marketing for businesses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Section 4: Family Business — Himmatlal Machine Tools */}
        <article className="p-5 sm:p-6 md:p-7 bg-[#141418] rounded-2xl border border-white/10 transition-all">
          <div className="flex items-center gap-4 mb-4">
            {/* Original crisp white background container */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Himmatlal Machine Tools
            </h2>
          </div>

          <p className="text-slate-200 text-base md:text-[15px] leading-relaxed mb-5">
            As the sales and marketing specialist at Himmatlal Machine Tools (HMT), his family's machinery business in Ahmedabad, founded by his father, Kamlesh Shah, in 2006, Jenish Shah helps drive sales and marketing for a firm that supplies industrial machinery, tools, and equipment across India.
          </p>

          {/* HMT Offerings */}
          <div className="mt-5 pt-5 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
              Machinery &amp; Equipment Offerings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* 1. Woodworking Machinery */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center shrink-0 text-[#0070BA]">
                  <Hammer size={18} weight="bold" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">Woodworking Machinery</span>
              </div>

              {/* 2. Sheet Metal Machinery */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center shrink-0 text-[#0070BA]">
                  <Factory size={18} weight="bold" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">Sheet Metal Machinery</span>
              </div>

              {/* 3. Garage Machinery */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center shrink-0 text-[#0070BA]">
                  <CarSimple size={18} weight="bold" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">Garage Machinery</span>
              </div>

              {/* 4. Welding Machines */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center shrink-0 text-[#0070BA]">
                  <Flame size={18} weight="bold" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">Welding Machines</span>
              </div>

              {/* 5. Power Tools */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center shrink-0 text-[#0070BA]">
                  <Lightning size={18} weight="bold" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">Power Tools</span>
              </div>

              {/* 6. Parts and Accessories */}
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-3 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center shrink-0 text-[#0070BA]">
                  <GearSix size={18} weight="bold" />
                </div>
                <span className="text-sm font-semibold text-white leading-tight">Parts &amp; Accessories</span>
              </div>
            </div>
          </div>
        </article>

        {/* Social Links Footer Bar */}
        <div className="flex items-center justify-between p-4 md:p-5 bg-[#141418] rounded-2xl border border-white/10 flex-wrap gap-4 shadow-lg">
          <div className="flex items-center gap-2.5 text-xs md:text-sm text-slate-300 font-medium">
            <span>Connect with</span>
            <span className="inline-flex items-center gap-0.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-xs md:text-sm tracking-wide shadow-inner">
              <span className="text-[#E5C158] font-bold">@</span>
              <span className="text-slate-100 font-medium tracking-normal">thejenishshah</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <a href="https://instagram.com/thejenishshah" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-xl bg-white/5 text-slate-400 transition-all border border-white/5">
              <FaInstagram size={18} />
            </a>
            <a href="https://facebook.com/thejenishshah" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-xl bg-white/5 text-slate-400 transition-all border border-white/5">
              <FaFacebook size={18} />
            </a>
            <a href="https://www.youtube.com/@thejenishshah" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 rounded-xl bg-white/5 text-slate-400 transition-all border border-white/5">
              <FaYoutube size={18} />
            </a>
            <a href="https://linkedin.com/in/thejenishshah" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-xl bg-white/5 text-slate-400 transition-all border border-white/5">
              <FaLinkedin size={18} />
            </a>
            <a href="https://whatsapp.com/channel/0029VbEkxWWGufJ0zMq5WA1P" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="p-2 rounded-xl bg-white/5 text-slate-400 transition-all border border-white/5">
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>

      </div>
    </motion.main>
  );
};

export default About;
