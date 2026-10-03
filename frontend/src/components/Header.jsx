import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import thejenishshahLogo from '../assets/thejenishshah_logo.png';

const socialLinks = [
  {
    name: 'WhatsApp',
    label: 'WhatsApp Community',
    url: 'https://whatsapp.com/channel/0029VbEkxWWGufJ0zMq5WA1P',
    icon: FaWhatsapp,
    colorClass: 'text-[#25D366]',
  },
  {
    name: 'Instagram',
    label: 'Instagram Profile',
    url: 'https://instagram.com/thejenishshah',
    icon: FaInstagram,
    colorClass: 'text-[#E1306C]',
  },
  {
    name: 'Facebook',
    label: 'Facebook Page',
    url: 'https://facebook.com/thejenishshah',
    icon: FaFacebook,
    colorClass: 'text-[#1877F2]',
  },
  {
    name: 'YouTube',
    label: 'YouTube Channel',
    url: 'https://www.youtube.com/@thejenishshah',
    icon: FaYoutube,
    colorClass: 'text-[#FF0000]',
  },
  {
    name: 'LinkedIn',
    label: 'LinkedIn Profile',
    url: 'https://linkedin.com/in/thejenishshah',
    icon: FaLinkedin,
    colorClass: 'text-[#0A66C2]',
  },
];

const Header = () => {
  const shouldReduceMotion = useReducedMotion();

  const springTransition = shouldReduceMotion
    ? { duration: 0.2 }
    : { type: 'spring', stiffness: 400, damping: 25 };

  return (
    <header className="flex flex-col items-center text-center w-full select-none pt-5 md:pt-8">
      {/* Avatar Container: Precision Cyber-HUD & Golden Glass Bezel */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-32 h-32 md:w-36 md:h-36 mb-7 sm:mb-8 md:mb-10 relative flex items-center justify-center group"
      >
        {/* Ambient Golden Halo */}
        <div
          className="absolute -inset-2.5 rounded-full opacity-60 blur-xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(229, 193, 88, 0.25) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 72%)',
          }}
          aria-hidden="true"
        />

        {/* Outer Rotating Precision HUD Segmented Orbital Ring */}
        <svg
          className={`absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none ${
            shouldReduceMotion ? '' : 'animate-hud-spin'
          }`}
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            stroke="#C69214"
            strokeWidth="1.2"
            strokeDasharray="14 10 28 10 8 14"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
          <line x1="50" y1="0" x2="50" y2="4" stroke="#E5C158" strokeWidth="1.6" strokeOpacity="0.9" />
          <line x1="100" y1="50" x2="96" y2="50" stroke="#E5C158" strokeWidth="1.6" strokeOpacity="0.9" />
          <line x1="50" y1="100" x2="50" y2="96" stroke="#E5C158" strokeWidth="1.6" strokeOpacity="0.9" />
          <line x1="0" y1="50" x2="4" y2="50" stroke="#E5C158" strokeWidth="1.6" strokeOpacity="0.9" />
        </svg>

        {/* Counter-Rotating Inner Dotted Orbit */}
        <svg
          className={`absolute -inset-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none ${
            shouldReduceMotion ? '' : 'animate-hud-reverse'
          }`}
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="#E5C158"
            strokeWidth="0.8"
            strokeDasharray="2 6"
            strokeOpacity="0.3"
          />
        </svg>

        {/* Subtle Gold Border Rim */}
        <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-b from-white/10 via-[var(--accent-gold,#E5C158)]/30 to-white/5 border border-white/15 shadow-lg">
          <Link
            to="/about"
            title="About Jenish Shah"
            aria-label="View About Jenish Shah"
            className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C158]"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.jpg`}
              alt="Jenish Shah"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/256x256/141418/E5C158?text=Jenish+Shah";
              }}
            />
          </Link>
        </div>
      </motion.div>

      {/* Creator Logo: 3D Metallic Gaming Style Logo */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="w-full flex justify-center mb-7 sm:mb-8 md:mb-10 pt-2 px-4"
      >
        <h1 className="sr-only">Thejenishshah</h1>
        <img
          src={thejenishshahLogo}
          alt="Thejenishshah"
          className="w-full max-w-[270px] sm:max-w-[340px] md:max-w-[390px] h-auto object-contain select-none pointer-events-none"
        />
      </motion.div>



      {/* Modern Segmented Glass Cyber-Dock for Social Media */}
      <motion.nav
        aria-label="Social media profiles"
        initial={shouldReduceMotion ? { opacity: 0 } : { y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.24, duration: 0.4 }}
      >
        <ul className="flex items-center gap-2 md:gap-3 p-2 md:p-2.5 rounded-full bg-[#0e0e14]/90 backdrop-blur-xl border border-[#C69214]/30 shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {socialLinks.map((item) => {
            const IconComponent = item.icon;

            return (
              <li key={item.name} className="flex items-center justify-center">
                <motion.a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.94 }}
                  transition={springTransition}
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-all ${item.colorClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C158]`}
                >
                  <IconComponent size={21} className="md:w-[23px] md:h-[23px]" />
                </motion.a>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </header>
  );
};

export default Header;
