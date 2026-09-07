import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Package, DotsThreeVertical } from '@phosphor-icons/react';
import Header from './Header';
import SocialLinks from './SocialLinks';
import ShareModal from './ShareModal';

const offerings = [
  {
    id: 'consultation',
    title: '1:1 Consultation',
    subtitle: 'Book a high-impact cybersecurity call.',
    icon: Calendar,
    path: '/consultation',
  },
  {
    id: 'pdf-store',
    title: 'PDF Store',
    subtitle: 'Level up your skills with premium PDFs.',
    icon: BookOpen,
    path: '/pdf-store',
  },
  {
    id: 'bundles',
    title: 'Premium Bundles',
    subtitle: 'Exclusive packages for maximum value.',
    icon: Package,
    path: '/bundles',
  },
];

const Home = () => {
  const [shareModal, setShareModal] = useState(null); // { title, url, subtitle }

  const openShare = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setShareModal({
      title: item.title,
      url: window.location.origin + item.path,
      subtitle: item.subtitle,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6 md:gap-8 w-full"
      >
        <Header />

        <div className="flex flex-col gap-4">
          <div className="flex items-center w-full my-1">
            <div className="flex-grow border-t border-slate-700/50"></div>
            <span className="flex-shrink-0 px-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">Offerings</span>
            <div className="flex-grow border-t border-slate-700/50"></div>
          </div>

          {offerings.map((item) => {
            const IconComp = item.icon;
            return (
              <Link key={item.id} to={item.path} className="outline-none block w-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] hover:bg-[#e2ebd9] transition-colors shadow-sm"
                >
                  <div className="w-10 h-10 flex items-center justify-center text-gray-900">
                    <IconComp weight="regular" size={24} />
                  </div>

                  <div className="flex-1 text-center">
                    <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">{item.title}</h2>
                    <p className="text-gray-600 text-[12px] md:text-[13px] mt-0.5">{item.subtitle}</p>
                  </div>

                  {/* 3-dot → opens Linktree-style share modal */}
                  <div
                    onClick={(e) => openShare(e, item)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    aria-label={`Share ${item.title}`}
                  >
                    <DotsThreeVertical size={24} weight="bold" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        <SocialLinks />
      </motion.div>

      {/* Linktree-style share modal */}
      <ShareModal
        isOpen={!!shareModal}
        onClose={() => setShareModal(null)}
        title={shareModal?.title ?? ''}
        url={shareModal?.url ?? ''}
        subtitle={shareModal?.subtitle}
      />
    </>
  );
};

export default Home;
