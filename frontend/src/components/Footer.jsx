import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full pt-2 pb-6 md:pt-4 md:pb-8 select-none" aria-label="Footer">
      {/* Clean hairline ambient divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 md:mb-5"></div>

      {/* Balanced Minimal Responsive Footer Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 text-sm md:text-[16px] text-white font-normal px-1 text-center sm:text-left">
        {/* Left: Copyright */}
        <div className="flex items-center gap-1 text-white">
          <span>© 2026 thejenishshah</span>
        </div>

        {/* Right: Policy Link & Studio Attribution */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 flex-wrap justify-center text-white">
          <Link
            to="/policy"
            className="text-white hover:text-white/80 transition-colors duration-200"
          >
            Policy & Terms
          </Link>

          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/50"></span>

          <a
            href="https://instagram.com/matrixfortress"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition-colors duration-200"
          >
            Designed by Matrix Fortress
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
