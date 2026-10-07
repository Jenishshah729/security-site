import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  ShoppingCart, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  ShieldCheck, 
  BookOpen, 
  Check, 
  User, 
  EnvelopeSimple, 
  Phone, 
  Sparkle, 
  Calendar, 
  Lightning, 
  LockKey,
  Star
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const BundleStore = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('store'); // 'store' | 'select-pdfs' | 'checkout'
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  
  const [bundles, setBundles] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'consultation' | 'pdf-only'

  // Buyer details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetch('/api/bundles')
      .then(res => res.json())
      .then(data => setBundles(Array.isArray(data) ? data : []))
      .catch(console.error);
      
    fetch('/api/offerings')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const orderCovers = [
          '/top-10-mistakes.png', // ₹149 (Beginner Blind Spots)
          '/burp-suite.jpg',      // ₹249 (Mastering Burp Suite)
          '/ctf-guide.jpg',       // ₹199 (Flag Hunter's Playbook)
          '/hackers-toolkit.jpg',  // ₹149 (The Hacker's Arsenal)
          '/cloud-security-v4.jpg',// ₹199 (Breach in the Cloud)
          '/soc-analyst.jpg',      // ₹249 (Behind the Screens)
          '/ai-in-cybersecurity.jpg' // ₹249 (How Hackers Actually Use AI)
        ];
        list.sort((a, b) => {
          const idxA = orderCovers.indexOf(a.coverImage);
          const idxB = orderCovers.indexOf(b.coverImage);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return 0;
        });
        setOfferings(list);
      })
      .catch(console.error);
  }, []);

  const handleBundleSelect = (b) => {
    setSelectedBundle(b);
    if (b.pdfSelectionCount > 0) {
      setSelectedPdfs([]);
      setStep('select-pdfs');
    } else if (b.hasConsultation) {
      const pdfsToPass = offerings;
      navigate('/bundle', { state: { bundle: b, selectedPdfs: pdfsToPass } });
    } else {
      setSelectedPdfs(offerings);
      setStep('checkout');
      setValidationError('');
    }
  };

  const handlePdfToggle = (pdf) => {
    if (selectedPdfs.find(p => p.id === pdf.id)) {
      setSelectedPdfs(selectedPdfs.filter(p => p.id !== pdf.id));
    } else {
      if (selectedPdfs.length < selectedBundle.pdfSelectionCount) {
        setSelectedPdfs([...selectedPdfs, pdf]);
      }
    }
  };

  const handlePdfSelectionComplete = () => {
    if (selectedBundle.hasConsultation) {
      navigate('/bundle', { state: { bundle: selectedBundle, selectedPdfs } });
    } else {
      setStep('checkout');
      setValidationError('');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setValidationError('Please fill in all fields before proceeding');
      return;
    }

    if (!countryCode || countryCode.length < 1 || countryCode.length > 3) {
      setValidationError('Country code must be 1 to 3 digits');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setValidationError('Phone number must be exactly 10 digits');
      return;
    }
    
    setValidationError('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/bundle/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: selectedBundle.id,
          selectedPdfs: selectedPdfs.map(p => p.title || p.name || String(p.id)),
          selectedPdfIds: selectedPdfs.map(p => String(p.id)),
          name: name,
          email: email,
          phone: `+${countryCode}${phone}`,
          customerName: name,
          customerEmail: email,
          customerPhone: `+${countryCode}${phone}`
        })
      });

      const responseText = await res.text();
      let orderData;
      try {
        orderData = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Server returned unexpected response (${res.status}). Please try again.`);
      }

      if (!res.ok) {
        const errorMsg = orderData.details ? orderData.details.map(d => d.message).join(', ') : (orderData.error || 'Failed to initialize payment');
        throw new Error(errorMsg);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: "Matrix Fortress",
        description: `Purchase: ${selectedBundle.title}`,
        order_id: orderData.order_id || orderData.id || orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/bundle/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (onSuccess) {
                onSuccess({
                  type: 'bundle',
                  title: selectedBundle.title,
                  amount: selectedBundle.price,
                  orderId: response.razorpay_order_id,
                  email: email
                });
              } else {
                alert('Payment Successful! Check your email for files.');
                navigate('/');
              }
            } else {
              alert('Payment verification failed. Please reach out to support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: `+${countryCode}${phone}`
        },
        theme: {
          color: "#E5C158"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        console.error(response.error);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Failed to initialize checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const consultationCount = bundles.filter(b => b.hasConsultation).length;
  const pdfOnlyCount = bundles.filter(b => !b.hasConsultation).length;

  const bundleOrder = [
    'all-in-one',
    'all-7-pdfs',
    '1-1-any-5',
    'any-5-pdfs',
    '1-1-any-3',
    'any-3-pdfs'
  ];

  const filteredBundles = [...bundles]
    .filter(b => {
      if (filter === 'consultation') return b.hasConsultation === true;
      if (filter === 'pdf-only') return b.hasConsultation === false;
      return true;
    })
    .sort((a, b) => {
      const idxA = bundleOrder.indexOf(a.id);
      const idxB = bundleOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return 0;
    });

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 md:p-8 relative bg-[#09090D] rounded-2xl sm:rounded-3xl md:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 min-h-[500px] overflow-hidden"
    >
      {/* Navigation / Back Button */}
      <div className="flex items-center justify-between mb-5 sm:mb-8 relative z-10">
        <button 
          onClick={() => {
            if (step === 'store') navigate('/');
            if (step === 'select-pdfs') setStep('store');
            if (step === 'checkout') {
              if (selectedBundle?.pdfSelectionCount > 0) {
                setStep('select-pdfs');
              } else {
                setStep('store');
              }
            }
          }} 
          className="inline-flex items-center gap-2 text-sm sm:text-base md:text-sm text-slate-200 outline-none font-bold bg-white/10 px-4 sm:px-5 md:px-4 py-2.5 sm:py-3 md:py-2.5 rounded-full border border-white/15 shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={18} className="text-[#E5C158]" /> 
          <span>{step === 'store' ? 'Back to Home' : 'Back to Bundles'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 'store' && (
          <motion.div 
            key="store" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="relative z-10 space-y-6 sm:space-y-8"
          >
            {/* Header Block */}
            <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#14141A] via-[#101015] to-[#0A0A0E] p-5 sm:p-7 md:p-9 border border-white/10 shadow-xl overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  High-Impact Cyber Packages
                </h1>
                <p className="text-base sm:text-lg text-slate-200 mt-2.5 max-w-xl leading-relaxed font-normal">
                  Fast-track your cybersecurity journey with strategic 1:1 mentorship and comprehensive guides at bundled savings.
                </p>
              </div>
            </div>

            {/* Professional Theme-Aligned Filter Tabs (Responsive, No Sliding on Mobile) */}
            <div className="w-full sm:w-auto flex items-center justify-start pt-1">
              <div 
                role="tablist" 
                aria-label="Filter bundle packages"
                className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center p-1 bg-[#121217] rounded-xl border border-white/10"
              >
                {[
                  { id: 'all', label: 'All Bundles', shortLabel: 'All', icon: Package },
                  { id: 'consultation', label: 'PDF + 1:1 Mentorship', shortLabel: 'PDF + 1:1', icon: Calendar },
                  { id: 'pdf-only', label: 'Only PDF Guides', shortLabel: 'Only PDFs', icon: BookOpen }
                ].map(tab => {
                  const isActive = filter === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setFilter(tab.id)}
                      className={`relative px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-center cursor-pointer select-none ${
                        isActive ? 'text-zinc-950' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterPill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <Icon
                        size={15}
                        weight={isActive ? 'fill' : 'bold'}
                        className={`relative z-10 shrink-0 transition-colors ${isActive ? 'text-zinc-950' : 'text-slate-400'}`}
                      />
                      <span className="relative z-10 hidden sm:inline whitespace-nowrap">{tab.label}</span>
                      <span className="relative z-10 sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bundles List */}
            {filteredBundles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-[#121217] rounded-2xl border border-white/10">
                <Package size={48} className="mx-auto mb-3 opacity-40 text-[#E5C158]" />
                <p className="text-base font-semibold">No bundles found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:gap-6">
                {filteredBundles.map(b => {
                  const isFeatured = b.id === 'all-in-one' || b.id === 'all-7-pdfs';

                  return (
                    <div 
                      key={b.id} 
                      className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 transition-all duration-300 ${
                        isFeatured 
                          ? 'bg-gradient-to-b from-[#181822] via-[#121218] to-[#0D0D12] border-2 border-[#E5C158] shadow-[0_12px_40px_rgba(229,193,88,0.12)]' 
                          : 'bg-[#121217] border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
                        {/* Left Info Column */}
                        <div className="flex-1 min-w-0">
                          {b.badge && (
                            <span className="inline-block px-3 py-1 mb-2.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#E5C158]/15 text-[#E5C158] border border-[#E5C158]/30">
                              {b.badge}
                            </span>
                          )}
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                            {b.title}
                          </h3>

                          {/* Features List */}
                          <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 max-w-lg font-medium">
                            {b.description ? b.description.split('\n').filter(l => l.trim()).map((line, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <CheckCircle weight="fill" className="text-[#E5C158] text-lg shrink-0 mt-0.5"/> 
                                <span className="leading-snug text-slate-100">{line}</span>
                              </li>
                            )) : (
                              <li className="flex items-center gap-2 text-slate-500 italic">
                                <span>No description provided.</span>
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Right Pricing & Action Box */}
                        <div className="w-full md:w-64 shrink-0 bg-[#08080C] border border-white/10 p-5 sm:p-6 rounded-2xl flex flex-col items-center justify-center gap-3.5">
                          <div className="text-center w-full">
                            <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-widest block mb-1">
                              Bundle Price
                            </span>
                            
                            <div className="flex items-baseline justify-center gap-2.5">
                              {b.originalPrice > b.price && (
                                <span className="text-base sm:text-lg font-semibold text-slate-500 line-through">
                                  ₹{b.originalPrice}
                                </span>
                              )}
                              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                ₹{b.price}
                              </span>
                            </div>
                            {b.savings > 0 && (
                              <span className="text-xs font-bold text-emerald-400 mt-1 block">
                                Save ₹{b.savings}{b.discount ? ` (${b.discount} off)` : ''}
                              </span>
                            )}
                          </div>

                          <button 
                            onClick={() => handleBundleSelect(b)}
                            className="w-full py-3.5 sm:py-4 px-5 bg-white text-slate-950 font-black text-sm sm:text-base rounded-xl transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2 min-h-[48px]"
                          >
                            <ShoppingCart size={18} weight="bold" />
                            {b.pdfSelectionCount > 0 
                              ? `Choose ${b.pdfSelectionCount} PDFs` 
                              : 'Get Bundle'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: PDF Selection */}
        {step === 'select-pdfs' && (
          <motion.div 
            key="select-pdfs" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }} 
            className="relative z-10 space-y-6"
          >
            {/* Step 2 Header */}
            <div className="p-6 bg-gradient-to-br from-[#14141A] to-[#0A0A0E] rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <BookOpen size={24} className="text-[#E5C158]" weight="duotone" />
                  Select Your {selectedBundle.pdfSelectionCount} Ebooks
                </h3>
                <p className="text-slate-300 text-xs md:text-sm mt-1">
                  Click on the blueprints you would like included in your <strong className="text-white font-bold">{selectedBundle.title}</strong> package.
                </p>
              </div>
              
              <div className="px-4 py-2 bg-[#08080C] border border-white/15 rounded-xl text-sm font-bold text-white shrink-0">
                Selected: <span className="text-[#E5C158] text-base">{selectedPdfs.length}</span> / {selectedBundle.pdfSelectionCount}
              </div>
            </div>

            {/* PDFs Grid with Covers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offerings.map(pdf => {
                const isSelected = selectedPdfs.some(p => p.id === pdf.id);
                const isDisabled = !isSelected && selectedPdfs.length >= selectedBundle.pdfSelectionCount;

                return (
                  <div 
                    key={pdf.id}
                    onClick={() => !isDisabled && handlePdfToggle(pdf)}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#1E1A10] to-[#14141A] border-[#E5C158]' 
                        : isDisabled 
                          ? 'bg-[#101015]/40 border-white/5 opacity-45 cursor-not-allowed' 
                          : 'bg-[#121217] border-white/10'
                    }`}
                  >
                    {/* Cover Thumbnail / Icon */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden bg-black/50 border border-white/10 shrink-0 flex items-center justify-center relative shadow-md">
                      {pdf.coverImage ? (
                        <img 
                          src={pdf.coverImage ? `${pdf.coverImage}?v=3d-v3` : ''} 
                          alt={pdf.title} 
                          className="w-full h-full object-cover transition-transform" 
                        />
                      ) : (
                        <BookOpen size={24} className="text-[#E5C158]" weight="duotone" />
                      )}
                    </div>

                    {/* PDF Title & Info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm md:text-base font-bold text-white leading-snug line-clamp-2">
                        {pdf.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {pdf.description}
                      </p>
                    </div>

                    {/* Selection Indicator Checkbox */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected 
                        ? 'border-[#E5C158] bg-[#E5C158] text-black' 
                        : 'border-white/20'
                    }`}>
                      {isSelected && <Check size={14} weight="bold" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating/Sticky Action Bar */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs sm:text-sm text-slate-400">
                {selectedPdfs.length === selectedBundle.pdfSelectionCount ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle size={16} weight="fill" /> Ready to proceed!
                  </span>
                ) : (
                  <span>Please select <strong className="text-[#E5C158]">{selectedBundle.pdfSelectionCount - selectedPdfs.length}</strong> more PDF(s) to continue.</span>
                )}
              </span>

              <button 
                disabled={selectedPdfs.length !== selectedBundle.pdfSelectionCount}
                onClick={handlePdfSelectionComplete}
                className="w-full sm:w-auto px-7 py-3.5 bg-white disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {selectedBundle.hasConsultation ? 'Continue to Schedule Call' : 'Review & Checkout'} 
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Checkout Form */}
        {step === 'checkout' && (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-xl mx-auto py-2 relative z-10"
          >
            <div className="p-6 md:p-8 bg-gradient-to-b from-[#14141A] to-[#0D0D12] border border-white/10 rounded-2xl shadow-2xl">
              {/* Order Summary */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold text-[#E5C158] uppercase tracking-wider block mb-1">
                      Selected Package
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {selectedBundle.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Investment
                    </span>
                    <span className="text-2xl font-black text-white">
                      ₹{selectedBundle.price}
                    </span>
                  </div>
                </div>

                {/* Selected Guides List */}
                {selectedPdfs.length > 0 && (
                  <div className="mt-4 p-4 bg-[#08080C] rounded-xl border border-white/10">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                      {selectedBundle?.pdfSelectionCount > 0 
                        ? `Included Ebooks (${selectedPdfs.length})` 
                        : `All ${selectedPdfs.length} Ebooks Included`}
                    </p>
                    <ul className="space-y-2">
                      {selectedPdfs.map(pdf => (
                        <li key={pdf.id} className="text-sm text-slate-200 flex items-start gap-2">
                          <CheckCircle size={16} className="text-[#E5C158] shrink-0 mt-0.5" weight="fill" />
                          <span className="leading-snug">{pdf.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Total Due Callout */}
              <div className="flex justify-between items-center bg-[#08080C] p-4 sm:p-5 md:p-4 rounded-2xl border border-[#E5C158]/30">
                <div>
                  <span className="text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wide block">Total Due</span>
                  <span className="text-sm sm:text-base md:text-sm text-slate-300 font-medium mt-1 block">
                    {selectedBundle?.pdfSelectionCount > 0 
                      ? `${selectedPdfs.length} item${selectedPdfs.length > 1 ? 's' : ''} included` 
                      : 'All 6 Cybersecurity PDFs included'}
                  </span>
                </div>
                <span className="font-black text-[#F5C842] text-3xl sm:text-4xl md:text-3xl tracking-tight">
                  ₹{selectedBundle.price}
                </span>
              </div>
              
              {/* Buyer Input Form */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={18} className="text-[#E5C158]" /> Buyer Contact Information
                </p>

                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#08080C] border border-white/10 rounded-xl px-4 py-3.5 md:py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] text-base md:text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 mb-2">
                      Email Address (for PDF delivery within 24 hours)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#08080C] border border-white/10 rounded-xl px-4 py-3.5 md:py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] text-base md:text-sm transition-all"
                      />
                    </div>
                    <span className="text-xs sm:text-sm md:text-xs text-slate-300 font-medium mt-1.5 block">
                      Your bundle PDFs will be shared to your email within 24 hours.
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 mb-2">
                      Phone Number (WhatsApp Updates)
                    </label>
                    <div className="flex gap-2.5">
                      <div className="flex items-center bg-[#08080C] border border-white/10 rounded-xl px-3.5 py-3.5 md:py-3 text-white focus-within:border-[#E5C158] text-base md:text-sm transition-colors">
                        <span className="text-slate-400 mr-1">+</span>
                        <input 
                          type="tel"
                          value={countryCode}
                          maxLength="3"
                          placeholder="91"
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            setCountryCode(val);
                          }}
                          className="bg-transparent outline-none w-9 text-center text-white font-semibold text-base md:text-sm"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        maxLength="10"
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPhone(val);
                        }}
                        className="w-full bg-[#08080C] border border-white/10 rounded-xl px-4 py-3.5 md:py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] text-base md:text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pay Button & Validation Error */}
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 sm:py-4.5 md:py-3.5 bg-white active:scale-95 disabled:opacity-50 text-slate-950 font-black text-base sm:text-lg md:text-base rounded-xl transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] cursor-pointer shadow-md flex items-center justify-center gap-2.5 min-h-[52px] md:min-h-[48px]"
              >
                <LockKey weight="bold" size={20} />
                {isProcessing ? 'Processing...' : `Pay ₹${selectedBundle.price} & Get Access`} 
                <ArrowRight weight="bold" size={20} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-xs text-slate-400 font-semibold pt-1">
                <ShieldCheck size={18} className="text-[#E5C158]" weight="fill" />
                <span>100% Secure Checkout</span>
              </div>

              {validationError && (
                <p className="text-red-400 text-sm text-center font-semibold bg-red-500/10 border border-red-500/20 py-2.5 px-3 rounded-xl">
                  {validationError}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default BundleStore;
