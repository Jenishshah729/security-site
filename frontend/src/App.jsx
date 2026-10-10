import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Footer from './components/Footer';
import Home from './components/Home';
import BookingSection from './components/BookingSection';
import PDFStore from './components/PDFStore';
import ThankYou from './components/ThankYou';

import BundleStore from './components/BundleStore';
import Policy from './components/Policy';
import About from './components/About';
import WorkWithMe from './components/WorkWithMe';
import Contact from './components/Contact';
import CyberBackground from './components/CyberBackground';

// Eagerly pre-cache all 7 store covers in memory on app boot for instant display
const STORE_COVERS = [
  '/ai-in-cybersecurity.jpg',
  '/top-10-mistakes.png',
  '/hackers-toolkit.jpg',
  '/ctf-guide.jpg',
  '/burp-suite.jpg',
  '/soc-analyst.jpg',
  '/cloud-security-v4.jpg'
];

if (typeof window !== 'undefined') {
  STORE_COVERS.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  // Determine optimal container width per route:
  // - Home & ThankYou: Focused link-in-bio profile column (max-w-xl)
  // - PDF Store: Expands to showcase rich 3-column catalog grid on desktop (max-w-6xl)
  // - Bundles & Booking: Spacious package showcase & booking calendar (max-w-4xl / max-w-3xl)
  // - About / Work / Contact / Policy: Comfortable reading & portfolio width (max-w-4xl)
  let containerWidth = 'max-w-xl';
  if (path === '/pdf-store') {
    containerWidth = 'max-w-6xl';
  } else if (path === '/bundles' || path === '/bundle') {
    containerWidth = 'max-w-4xl';
  } else if (path === '/consultation') {
    containerWidth = 'max-w-3xl';
  } else if (['/about', '/about-jenish-shah', '/work-with-me', '/work-with-jenish-shah', '/contact', '/contact-me', '/policy'].includes(path)) {
    containerWidth = 'max-w-4xl';
  }

  const handlePaymentSuccess = (type, hasConsultation = false) => {
    window.location.href = `/thank-you?type=${type}&hasConsultation=${hasConsultation}`;
  };

  return (
    <div className="min-h-[100dvh] w-full px-3 sm:px-4 md:px-6 pt-4 pb-8 sm:pt-6 md:pt-10 flex justify-center relative">
      <CyberBackground />
      <div className={`w-full ${containerWidth} relative z-10`}>
        <div className="flex flex-col gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/about-jenish-shah" element={<About />} />
              <Route path="/work-with-jenish-shah" element={<WorkWithMe />} />
              <Route path="/work-with-me" element={<WorkWithMe />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/contact-me" element={<Contact />} />
              <Route path="/consultation" element={<BookingSection onSuccess={() => handlePaymentSuccess('consultation')} />} />
              <Route path="/pdf-store" element={<PDFStore onSuccess={() => handlePaymentSuccess('pdf')} />} />
              <Route path="/bundles" element={<BundleStore onSuccess={(hasConsultation) => handlePaymentSuccess('bundle', hasConsultation)} />} />
              <Route path="/bundle" element={<BookingSection onSuccess={() => handlePaymentSuccess('bundle', true)} isBundle={true} />} />
              <Route path="/thank-you" element={<ThankYou onBack={() => window.location.href = '/'} />} />
              <Route path="/policy" element={<Policy />} />

              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
