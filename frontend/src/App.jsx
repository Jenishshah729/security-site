import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Footer from './components/Footer';
import Home from './components/Home';
import BookingSection from './components/BookingSection';
import PDFStore from './components/PDFStore';
import ThankYou from './components/ThankYou';

import BundleStore from './components/BundleStore';
import Policy from './components/Policy';

function App() {
  const handlePaymentSuccess = (type, hasConsultation = false) => {
    window.location.href = `/thank-you?type=${type}&hasConsultation=${hasConsultation}`;
  };

  return (
    <Router>
      <div className="min-h-[100dvh] w-full px-4 py-8 md:py-16 flex justify-center relative z-10">
        <div className="w-full max-w-2xl relative">
          <div className="flex flex-col gap-8 md:gap-12">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
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
    </Router>
  );
}

export default App;
