import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { DotsThreeVertical, Link as LinkIcon } from '@phosphor-icons/react';
import ShareModal from './ShareModal';

const SocialLinks = () => {
  const [links, setLinks] = useState([]);
  const [shareModal, setShareModal] = useState(null); // { title, url }

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
    return LinkIcon;
  };

  if (links.length === 0) return null;

  return (
    <>
      <section className="flex flex-col gap-4 w-full mt-2">
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-slate-700/50"></div>
          <span className="flex-shrink-0 px-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">Connect</span>
          <div className="flex-grow border-t border-slate-700/50"></div>
        </div>

        {links.map((link) => {
          const IconComponent = getIcon(link.title);
          return (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] shadow-sm transition-all border-[2.5px] border-[#C69214]"
            >
              <div className="w-10 h-10 flex items-center justify-center text-gray-900">
                <IconComponent size={25} />
              </div>

              <div className="flex-1 text-center">
                <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">{link.title}</h2>
              </div>

              {/* 3-dot button — opens share modal */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShareModal({ title: link.title, url: link.url });
                }}
                className="w-10 h-10 flex items-center justify-center text-gray-900 transition-colors cursor-pointer"
                aria-label={`Share ${link.title}`}
              >
                <DotsThreeVertical size={24} weight="bold" />
              </div>
            </motion.a>
          );
        })}
      </section>

      {/* Linktree-style share modal */}
      <ShareModal
        isOpen={!!shareModal}
        onClose={() => setShareModal(null)}
        title={shareModal?.title ?? ''}
        url={shareModal?.url ?? ''}
      />
    </>
  );
};

export default SocialLinks;
