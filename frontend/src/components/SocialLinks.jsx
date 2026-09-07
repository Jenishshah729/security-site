import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { DotsThreeVertical, Link as LinkIcon, ShareNetwork, Copy } from '@phosphor-icons/react';

const SocialLinks = () => {
  const [links, setLinks] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('/api/connect-links')
      .then(res => res.json())
      .then(data => setLinks(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('whatsapp')) return FaWhatsapp;
    if (t.includes('instagram')) return FaInstagram;
    if (t.includes('facebook')) return FaFacebook;
    if (t.includes('youtube')) return FaYoutube;
    if (t.includes('linkedin')) return FaLinkedin;
    return LinkIcon; // fallback
  };

  const handleShare = (e, title, url) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
    setActiveDropdown(null);
  };

  const handleCopy = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
    setActiveDropdown(null);
  };

  if (links.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
      className="flex flex-col gap-4 w-full mt-2"
    >
      <div className="flex items-center w-full my-2">
        <div className="flex-grow border-t border-slate-700/50"></div>
        <span className="flex-shrink-0 px-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">Connect</span>
        <div className="flex-grow border-t border-slate-700/50"></div>
      </div>

      {links.map((link, i) => {
        const IconComponent = getIcon(link.title);
        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ scale: activeDropdown === link.id ? 1 : 1.02 }}
            whileTap={{ scale: activeDropdown === link.id ? 1 : 0.98 }}
            className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] hover:bg-[#e2ebd9] transition-colors shadow-sm relative"
          >
            <div className="w-10 h-10 flex items-center justify-center text-gray-900">
              <IconComponent weight="regular" size={24} />
            </div>
            
            <div className="flex-1 text-center">
              <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">{link.title}</h2>
            </div>
            
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveDropdown(activeDropdown === link.id ? null : link.id);
              }}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer relative"
              ref={activeDropdown === link.id ? dropdownRef : null}
            >
              <DotsThreeVertical size={24} weight="bold" />
              
              <AnimatePresence>
                {activeDropdown === link.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 overflow-hidden"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <button 
                      onClick={(e) => handleShare(e, link.title, link.url)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <ShareNetwork size={18} weight="bold" />
                      <span className="font-medium">Share Link</span>
                    </button>
                    <button 
                      onClick={(e) => handleCopy(e, link.url)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Copy size={18} weight="bold" />
                      <span className="font-medium">Copy Link</span>
                    </button>
                    <div className="px-4 py-2 mt-1 bg-gray-50 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Destination URL</p>
                      <p className="text-xs text-gray-600 truncate">{link.url}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.a>
        );
      })}
    </motion.section>
  );
};

export default SocialLinks;
