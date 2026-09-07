import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from '@phosphor-icons/react';
import {
  FaLink,
  FaXTwitter,
  FaFacebook,
  FaWhatsapp,
  FaLinkedin,
  FaTelegram,
} from 'react-icons/fa6';

/**
 * Linktree-style share modal.
 *
 * Props:
 *   isOpen  – boolean
 *   onClose – () => void
 *   title   – string  (name of the link / PDF)
 *   url     – string  (destination URL)
 *   subtitle – string (optional – shown below the URL preview)
 *   image   – string  (optional – thumbnail/avatar shown in the preview card)
 */
const ShareModal = ({ isOpen, onClose, title, url, subtitle, image }) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy link',
      icon: copied ? Check : FaLink,
      action: handleCopy,
      bg: 'bg-gray-100 hover:bg-gray-200',
      iconColor: 'text-gray-800',
      isCustom: true,
    },
    {
      id: 'x',
      label: 'X',
      icon: FaXTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-black hover:bg-gray-900',
      iconColor: 'text-white',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: FaFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      iconColor: 'text-white',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: FaWhatsapp,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'bg-[#25D366] hover:bg-[#1eb85a]',
      iconColor: 'text-white',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: FaLinkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-[#0A66C2] hover:bg-[#0958a8]',
      iconColor: 'text-white',
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: FaTelegram,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-[#229ED9] hover:bg-[#1a8fc4]',
      iconColor: 'text-white',
    },
  ];

  // Truncate URL for display
  const displayUrl = url
    ? url.replace(/^https?:\/\//, '').slice(0, 38) + (url.length > 38 ? '…' : '')
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Modal sheet from bottom */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[201] mx-auto max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-t-[28px] pt-5 pb-10 px-5 shadow-2xl">
              {/* Handle bar */}
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5 px-1">
                <h2 className="text-[17px] font-semibold text-gray-900">Share link</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} weight="bold" className="text-gray-600" />
                </button>
              </div>

              {/* Preview card */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-4 border border-gray-100">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <FaLink size={18} className="text-gray-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{title}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate">{displayUrl}</p>
                  {subtitle && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-snug">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Share buttons row — scrollable */}
              <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
                {shareOptions.map((opt) => {
                  const IconComp = opt.icon;
                  const inner = (
                    <>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 ${opt.bg}`}>
                        <IconComp size={22} className={opt.iconColor} />
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium w-14 text-center leading-tight mt-1">{opt.label}</span>
                    </>
                  );

                  return opt.isCustom ? (
                    <button
                      key={opt.id}
                      onClick={opt.action}
                      className="flex flex-col items-center flex-shrink-0"
                    >
                      {inner}
                    </button>
                  ) : (
                    <a
                      key={opt.id}
                      href={opt.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center flex-shrink-0"
                    >
                      {inner}
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
