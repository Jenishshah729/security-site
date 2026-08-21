import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Package, DotsThreeVertical } from '@phosphor-icons/react';
import Header from './Header';
import SocialLinks from './SocialLinks';

const Home = () => {
  const handleShare = (e, title, path) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + path;
    if (navigator.share) {
      navigator.share({ title, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
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

        <Link to="/consultation" className="outline-none block w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] hover:bg-[#e2ebd9] transition-colors shadow-sm"
          >
            <div className="w-10 h-10 flex items-center justify-center text-gray-900">
              <Calendar weight="regular" size={24} />
            </div>
            
            <div className="flex-1 text-center">
              <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">1:1 Consultation</h2>
              <p className="text-gray-600 text-[12px] md:text-[13px] mt-0.5">Book a high-impact cybersecurity call.</p>
            </div>
            
            <div
              onClick={(e) => handleShare(e, '1:1 Consultation', '/consultation')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <DotsThreeVertical size={24} weight="bold" />
            </div>
          </motion.div>
        </Link>

        <Link to="/pdf-store" className="outline-none block w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] hover:bg-[#e2ebd9] transition-colors shadow-sm"
          >
            <div className="w-10 h-10 flex items-center justify-center text-gray-900">
              <BookOpen weight="regular" size={24} />
            </div>
            
            <div className="flex-1 text-center">
              <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">PDF Store</h2>
              <p className="text-gray-600 text-[12px] md:text-[13px] mt-0.5">Level up your skills with premium PDFs.</p>
            </div>
            
            <div
              onClick={(e) => handleShare(e, 'PDF Store', '/pdf-store')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <DotsThreeVertical size={24} weight="bold" />
            </div>
          </motion.div>
        </Link>

        <Link to="/bundles" className="outline-none block w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center p-3 md:p-4 rounded-full bg-[#edf5e8] hover:bg-[#e2ebd9] transition-colors shadow-sm"
          >
            <div className="w-10 h-10 flex items-center justify-center text-gray-900">
              <Package weight="regular" size={24} />
            </div>
            
            <div className="flex-1 text-center">
              <h2 className="text-[16px] md:text-[17px] font-bold text-gray-900 tracking-tight">Premium Bundles</h2>
              <p className="text-gray-600 text-[12px] md:text-[13px] mt-0.5">Exclusive packages for maximum value.</p>
            </div>
            
            <div
              onClick={(e) => handleShare(e, 'Premium Bundles', '/bundles')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <DotsThreeVertical size={24} weight="bold" />
            </div>
          </motion.div>
        </Link>
      </div>

      <SocialLinks />
    </motion.div>
  );
};

export default Home;
