import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X,
  Check,
  Copy,
  ShareNetwork,
  ArrowSquareOut,
  LinkSimple,
  Package,
  Calendar,
  BookOpen,
  UserCircle,
  Briefcase,
  EnvelopeSimple,
  Sparkle
} from '@phosphor-icons/react';
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebookMessenger,
  FaTelegram,
  FaXTwitter,
  FaYoutube
} from 'react-icons/fa6';

/**
 * Clean & Minimal AAA Game Box Share Modal
 * Theme: Golden, Black, White
 * Buttons follow the website signature design (White + Gold border-l)
 */
const ShareModal = ({ isOpen, onClose, title = 'Jenish Shah', url = '', subtitle, image, icon }) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const shouldReduceMotion = useReducedMotion();

  // Detect native share capability
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  // Close on Escape & handle scroll lock
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle || title,
          url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const encodedUrl = encodeURIComponent(url || '');
  const encodedTitle = encodeURIComponent(title || '');

  // Resolve matching logo for the selected item (e.g. Bundle -> Package, Consultation -> Calendar)
  const SelectedIcon = useMemo(() => {
    if (icon) return icon;
    const lower = `${title} ${url} ${subtitle || ''}`.toLowerCase();
    if (lower.includes('bundle')) return Package;
    if (lower.includes('consultation') || lower.includes('booking') || lower.includes('call')) return Calendar;
    if (lower.includes('pdf') || lower.includes('store') || lower.includes('guide') || lower.includes('book')) return BookOpen;
    if (lower.includes('about')) return UserCircle;
    if (lower.includes('work')) return Briefcase;
    if (lower.includes('contact') || lower.includes('inquiry')) return EnvelopeSimple;
    if (lower.includes('whatsapp')) return FaWhatsapp;
    if (lower.includes('instagram')) return FaInstagram;
    if (lower.includes('facebook') || lower.includes('messenger')) return FaFacebookMessenger;
    if (lower.includes('youtube')) return FaYoutube;
    return Sparkle;
  }, [icon, title, url, subtitle]);

  const handleChannelClick = (chan, e) => {
    // Copy the link to clipboard so it's ready to paste in any conversation
    if (url) {
      navigator.clipboard?.writeText(url).catch(() => {});
    }

    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (chan.id === 'instagram') {
      e.preventDefault();
      showToast('Link copied // Paste in Instagram DM');
      if (isMobile) {
        // Deep-link directly into Instagram Direct Messages inbox on mobile app
        window.location.href = 'instagram://direct-inbox';
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
          }
        }, 1200);
      } else {
        window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (chan.id === 'messenger') {
      e.preventDefault();
      showToast('Opening Messenger to send...');
      if (isMobile) {
        // Deep-link directly into Messenger's native "Send to Contact" picker
        window.location.href = `fb-messenger://share/?link=${encodedUrl}`;
        setTimeout(() => {
          if (document.hasFocus()) {
            window.open('https://www.messenger.com/', '_blank', 'noopener,noreferrer');
          }
        }, 1200);
      } else {
        window.open('https://www.messenger.com/', '_blank', 'noopener,noreferrer');
      }
      return;
    }

    showToast(chan.toastText || `Opening ${chan.name}...`);
  };

  // 5 essential direct messaging & sharing platforms
  const channels = useMemo(
    () => [
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: FaWhatsapp,
        href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        color: '#25D366',
        toastText: 'Opening WhatsApp...',
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: FaInstagram,
        href: 'https://www.instagram.com/direct/inbox/',
        color: '#E1306C',
        toastText: 'Link copied // Paste in Instagram DM',
      },
      {
        id: 'messenger',
        name: 'Messenger',
        icon: FaFacebookMessenger,
        href: `fb-messenger://share/?link=${encodedUrl}`,
        color: '#0084FF',
        toastText: 'Opening Messenger to send...',
      },
      {
        id: 'telegram',
        name: 'Telegram',
        icon: FaTelegram,
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        color: '#229ED9',
        toastText: 'Opening Telegram...',
      },
      {
        id: 'x',
        name: 'X',
        icon: FaXTwitter,
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        color: '#FFFFFF',
        toastText: 'Opening X...',
      },
    ],
    [encodedUrl, encodedTitle]
  );

  const displayUrl = url ? url.replace(/^https?:\/\//, '') : '';

  const modalVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.94, y: 16 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: 'spring', damping: 26, stiffness: 340 },
        },
        exit: {
          opacity: 0,
          scale: 0.95,
          y: 10,
          transition: { duration: 0.15, ease: 'easeIn' },
        },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Deep Obsidian Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          >
            {/* Soft ambient golden wash */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at 50% 30%, rgba(229, 193, 88, 0.16) 0%, transparent 60%)',
              }}
            />
          </motion.div>

          {/* Minimal AAA Game Box Modal Container */}
          <motion.div
            key="modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[460px] my-auto z-10 select-none text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Separate, High-Contrast Floating Close Button */}
            {/* Separate, High-Contrast Floating Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close share dialog"
              className="absolute -top-3.5 -right-3.5 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#12141C] border-2 border-[#E5C158] text-white shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_15px_rgba(229,193,88,0.35)] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C158] active:scale-95"
            >
              <X size={18} weight="bold" />
            </button>

            {/* Soft Exterior Golden Glow halo */}
            <div
              className="absolute -inset-[1px] rounded-2xl opacity-40 blur-lg pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(229,193,88,0.3) 0%, transparent 70%)',
              }}
            />

            {/* Main Obsidian Glass Box */}
            <div className="relative rounded-2xl bg-[#090A0E]/95 border border-[#E5C158]/30 shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(229,193,88,0.1),inset_0_1px_1px_rgba(255,255,255,0.08)] p-4 sm:p-5 backdrop-blur-2xl overflow-hidden">
              
              {/* Toast / Status Alert Banner */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-3 left-6 right-6 z-30 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#E5C158] text-black font-extrabold text-xs tracking-wide shadow-[0_4px_20px_rgba(229,193,88,0.5)] border border-white/40"
                  >
                    <Check weight="bold" size={14} />
                    <span>{toastMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Direct Start: Selected Item Preview in Website Signature White Card with Black Text */}
              <div className="flex items-center gap-3.5 mb-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 border-l-[5px] border-l-[#C69214] shadow-md">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  /* Selected Item Logo Badge matching website card aesthetic */
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                    <SelectedIcon size={24} weight="fill" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2
                    id="share-modal-title"
                    className="text-base sm:text-lg font-bold text-gray-950 tracking-tight truncate leading-snug"
                  >
                    {title}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-[13px] font-medium mt-0.5 line-clamp-1">
                    {subtitle || displayUrl}
                  </p>
                </div>
              </div>

              {/* Fast Copy Link Bar with Clean Modern Sans Font & Signature Button */}
              <section className="mb-4">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#050608] border border-white/10 focus-within:border-[#E5C158]/70 focus-within:ring-1 focus-within:ring-[#E5C158]/30 shadow-inner">
                  <div className="pl-2.5 text-[#E5C158] flex items-center">
                    <LinkSimple size={16} weight="bold" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={url}
                    aria-label="Share Link URL"
                    className="w-full bg-transparent text-sm font-sans font-medium text-slate-100 focus:outline-none select-all px-2 truncate"
                  />
                  {/* Website Signature Golden + White Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide flex-shrink-0 active:scale-95 border cursor-pointer ${
                      copied
                        ? 'bg-emerald-50 text-emerald-950 border-slate-200 border-l-[4px] border-l-emerald-500 shadow-md'
                        : 'bg-white text-slate-950 border-slate-200 border-l-[4px] border-l-[#C69214] shadow-md'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} weight="bold" className="text-emerald-700" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} weight="bold" className="text-slate-950" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              {/* Social Channels with Clean Sans Heading */}
              <section className={canNativeShare ? "mb-3.5" : ""}>
                <div className="flex items-center mb-2.5 px-0.5">
                  <span className="text-xs sm:text-[13px] font-sans font-bold tracking-wide text-slate-200 uppercase">
                    Share via
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {channels.map((chan) => {
                    const IconComp = chan.icon;
                    const innerContent = (
                      <>
                        <div
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-1.5 bg-white/[0.04] border border-white/[0.08]"
                        >
                          <IconComp
                            size={20}
                            style={{ color: chan.color }}
                          />
                        </div>

                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-300 truncate w-full text-center">
                          {chan.name}
                        </span>
                      </>
                    );

                    return (
                      <a
                        key={chan.id}
                        href={chan.href}
                        target={chan.id === 'instagram' || chan.id === 'messenger' ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        onClick={(e) => handleChannelClick(chan, e)}
                        className="relative flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden shadow-sm active:scale-95 cursor-pointer"
                      >
                        {innerContent}
                      </a>
                    );
                  })}
                </div>
              </section>

              {/* Compact "Share with other apps" Button in White (No Gold Side Border) */}
              {canNativeShare && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.99] text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Black round icon with white symbol */}
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                        <ShareNetwork size={20} weight="bold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm sm:text-[15px] font-bold text-gray-950 block leading-tight truncate">
                          Share with other apps
                        </span>
                        <span className="text-[11px] sm:text-xs text-slate-500 block font-medium mt-0.5 truncate">
                          Open system sharing menu
                        </span>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 ml-2">
                      <ArrowSquareOut size={15} weight="bold" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
