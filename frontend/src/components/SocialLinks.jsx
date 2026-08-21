import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { DotsThreeVertical, Link as LinkIcon } from '@phosphor-icons/react';

const SocialLinks = () => {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch('/api/connect-links')
      .then(res => res.json())
      .then(data => setLinks(data))
      .catch(console.error);
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] hover:bg-[#e2ebd9] transition-colors shadow-sm"
          >
            <div className="w-10 h-10 flex items-center justify-center text-gray-900">
              <IconComponent weight="regular" size={24} />
            </div>
            
            <div className="flex-1 text-center">
              <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">{link.title}</h2>
            </div>
            
            <div
              onClick={(e) => handleShare(e, link.title, link.url)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <DotsThreeVertical size={24} weight="bold" />
            </div>
          </motion.a>
        );
      })}
    </motion.section>
  );
};

export default SocialLinks;
