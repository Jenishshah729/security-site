import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  BookOpen,
  Package,
  DotsThreeVertical,
  UserCircle,
  Briefcase,
  EnvelopeSimple,
  Sparkle,
  ArrowRight
} from '@phosphor-icons/react';
import Header from './Header';
import ShareModal from './ShareModal';

const offerings = [
  {
    id: 'consultation',
    title: '1:1 Consultation',
    subtitle: 'Book a high-impact cybersecurity call.',
    icon: Calendar,
    path: '/consultation',
    badge: 'Direct Mentorship',
    tag: 'Popular',
  },
  {
    id: 'pdf-store',
    title: 'PDF Store',
    subtitle: 'Level up your skills with premium PDFs.',
    icon: BookOpen,
    path: '/pdf-store',
    badge: 'Curated Guides',
    tag: 'Top Guides',
  },
  {
    id: 'bundles',
    title: 'Premium Bundles',
    subtitle: 'Exclusive packages for maximum value.',
    icon: Package,
    path: '/bundles',
    badge: 'Save up to 40%',
    tag: 'Best Value',
  },
];

const exploreLinks = [
  {
    id: 'about',
    title: 'About Jenish Shah',
    subtitle: 'Founder of Matrix Fortress, educator & background.',
    icon: UserCircle,
    path: '/about',
  },
  {
    id: 'work-with-me',
    title: 'Work with Jenish Shah',
    subtitle: 'Careers at Matrix Fortress, HMT & collaborations.',
    icon: Briefcase,
    path: '/work-with-jenish-shah',
  },
  {
    id: 'contact',
    title: 'Contact Jenish Shah',
    subtitle: 'Reach Jenish Shah directly via email or social.',
    icon: EnvelopeSimple,
    path: '/contact',
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
      icon: item.icon,
    });
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6 md:gap-8 w-full"
      >
        <Header />

        {/* Offerings Section */}
        <section aria-labelledby="offerings-heading" className="flex flex-col gap-3.5 sm:gap-4 md:gap-4.5 px-1 sm:px-3 md:px-4">
          <div className="flex items-center w-full my-1 md:my-2">
            <div className="flex-grow h-[1.5px] bg-[var(--accent-cyan,#00f0ff)] shadow-[0_0_10px_rgba(0,240,255,0.8),0_0_3px_#00f0ff]"></div>
            <span id="offerings-heading" className="flex-shrink-0 px-3 sm:px-4 text-[#E5C158] text-xs md:text-sm font-bold uppercase tracking-widest md:tracking-[0.16em]">
              Offerings
            </span>
            <div className="flex-grow h-[1.5px] bg-[var(--accent-cyan,#00f0ff)] shadow-[0_0_10px_rgba(0,240,255,0.8),0_0_3px_#00f0ff]"></div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-3.5 md:gap-4 w-full">
            {offerings.map((item) => {
              const IconComp = item.icon;

              return (
                <Link key={item.id} to={item.path} className="outline-none block w-full">
                  <motion.div
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center p-3 sm:p-3.5 md:py-4.5 md:px-6 rounded-2xl md:rounded-[22px] bg-white shadow-sm border border-slate-200 border-l-[4px] md:border-l-[5px] border-l-[#C69214] md:min-h-[84px]"
                  >
                    {/* Black Round Icon Badge with White Icon */}
                    <div className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-black flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <IconComp weight="fill" size={22} className="md:w-6.5 md:h-6.5" />
                    </div>

                    <div className="flex-1 text-left px-2.5 sm:px-3.5 md:px-5 min-w-0">
                      <h2 className="text-base sm:text-base md:text-[20px] font-bold text-gray-950 tracking-tight leading-snug break-words">
                        {item.title}
                      </h2>
                      <p className="text-slate-600 text-[13px] sm:text-xs md:text-[14.5px] mt-0.5 md:mt-1 font-medium leading-normal break-words block">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* 3-dot → opens Linktree-style share modal */}
                    <div
                      onClick={(e) => openShare(e, item)}
                      className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-gray-700 rounded-xl cursor-pointer flex-shrink-0"
                      aria-label={`Share ${item.title}`}
                    >
                      <DotsThreeVertical size={22} weight="bold" className="md:w-6 md:h-6" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Explore Section */}
        <section aria-labelledby="explore-heading" className="flex flex-col gap-3.5 sm:gap-4 md:gap-5 px-1 sm:px-3 md:px-4">
          <div className="flex items-center w-full my-1 md:my-2.5">
            <div className="flex-grow h-[1.5px] bg-[var(--accent-cyan,#00f0ff)] shadow-[0_0_10px_rgba(0,240,255,0.8),0_0_3px_#00f0ff]"></div>
            <span id="explore-heading" className="flex-shrink-0 px-3 sm:px-4 text-[#E5C158] text-xs md:text-[13.5px] font-bold uppercase tracking-widest md:tracking-[0.18em]">
              Explore
            </span>
            <div className="flex-grow h-[1.5px] bg-[var(--accent-cyan,#00f0ff)] shadow-[0_0_10px_rgba(0,240,255,0.8),0_0_3px_#00f0ff]"></div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-3.5 md:gap-4.5 w-full">
            {exploreLinks.map((item) => {
              const IconComp = item.icon;
              return (
                <Link key={item.id} to={item.path} className="outline-none block w-full">
                  <motion.div
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center p-3 sm:p-3.5 md:py-4.5 md:px-6 rounded-2xl md:rounded-[22px] bg-white shadow-sm border border-slate-200 border-l-[4px] md:border-l-[5px] border-l-[#C69214] md:min-h-[84px]"
                  >
                    {/* Black Round Icon Badge with White Icon */}
                    <div className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-black flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <IconComp weight="fill" size={22} className="md:w-6.5 md:h-6.5" />
                    </div>

                    <div className="flex-1 text-left px-2.5 sm:px-3.5 md:px-5 min-w-0">
                      <h2 className="text-base sm:text-base md:text-[20px] font-bold text-gray-950 tracking-tight leading-snug break-words">
                        {item.title}
                      </h2>
                      <p className="text-slate-600 text-[13px] sm:text-xs md:text-[14.5px] mt-0.5 md:mt-1 font-medium leading-normal break-words block">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* 3-dot → opens Linktree-style share modal */}
                    <div
                      onClick={(e) => openShare(e, item)}
                      className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-gray-700 rounded-xl cursor-pointer flex-shrink-0"
                      aria-label={`Share ${item.title}`}
                    >
                      <DotsThreeVertical size={22} weight="bold" className="md:w-6 md:h-6" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      </motion.main>

      {/* Linktree-style share modal */}
      <ShareModal
        isOpen={!!shareModal}
        onClose={() => setShareModal(null)}
        title={shareModal?.title ?? ''}
        url={shareModal?.url ?? ''}
        subtitle={shareModal?.subtitle}
        icon={shareModal?.icon}
      />
    </>
  );
};

export default Home;
