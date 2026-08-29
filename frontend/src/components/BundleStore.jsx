import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck, BookOpen, Check } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

const BundleStore = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('store'); // 'store' | 'select-pdfs' | 'checkout'
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [selectedPdfs, setSelectedPdfs] = useState([]);
  
  const [bundles, setBundles] = useState([]);
  const [offerings, setOfferings] = useState([]);

  // Buyer details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/bundles')
      .then(res => res.json())
      .then(data => setBundles(data))
      .catch(console.error);
      
    fetch('/api/offerings')
      .then(res => res.json())
      .then(data => setOfferings(data))
      .catch(console.error);
  }, []);

  const handleBundleSelect = (b) => {
    setSelectedBundle(b);
    setSelectedPdfs([]);
    if (b.pdfSelectionCount > 0) {
      setStep('select-pdfs');
    } else if (b.hasConsultation) {
      const pdfsToPass = b.id === 'all-in-one' ? offerings : [];
      navigate('/bundle', { state: { bundle: b, selectedPdfs: pdfsToPass } });
    } else {
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
          selectedPdfs: selectedPdfs.map(p => p.title),
          amount: selectedBundle.price,
          name,
          email,
          phone: '+' + countryCode + phone
        }),
      });

      const orderData = await res.json();

      if (orderData.error) {
        setValidationError(orderData.error);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jenish Shah',
        description: selectedBundle.title,
        order_id: orderData.id,
        handler: function (response) {
          // Immediately redirect
          if (onSuccess) onSuccess(selectedBundle.hasConsultation);
          
          // Verify in background
          fetch('/api/bundle/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, bundleId: selectedBundle.id })
          }).catch(console.error);
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#00ff66"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
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

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="p-6 md:p-10 relative overflow-hidden bg-[#0B0C10] rounded-[32px] shadow-2xl border border-white/10"
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ff66]/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00ff66]/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

      <button 
        onClick={() => {
          if (step === 'store') navigate('/');
          if (step === 'select-pdfs') setStep('store');
          if (step === 'checkout') selectedBundle.pdfSelectionCount > 0 ? setStep('select-pdfs') : setStep('store');
        }} 
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10 outline-none group relative z-10 font-medium"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        {step === 'store' ? 'Back to Home' : 'Go Back'}
      </button>

      <AnimatePresence mode="wait">
        {step === 'store' && (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 space-y-8">
            <div className="flex items-center gap-5 mb-12 relative z-10">
              <div className="p-4 bg-[#00ff66]/10 border border-[#00ff66]/20 rounded-2xl text-[#00ff66]">
                <Package weight="duotone" size={32} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Premium Bundles</h2>
                <p className="text-slate-400 text-sm md:text-base font-medium mt-1.5">Exclusive packages designed for maximum value and impact.</p>
              </div>
            </div>

            {bundles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white/5 rounded-3xl border border-white/5">
                <Package size={48} className="mx-auto mb-4 opacity-50 text-[#00ff66]" />
                <p>No premium bundles available at the moment.</p>
              </div>
            ) : (
              bundles.map(b => (
                <div 
                  key={b.id}
                  className={`group relative overflow-hidden rounded-[28px] bg-[#12141D] border ${b.id === 'all-in-one' ? 'border-[#b026ff]/50 shadow-[0_0_40px_rgba(176,38,255,0.15)] scale-[1.02] z-20' : 'border-white/10 hover:border-[#00ff66]/30'} flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-between p-6 md:p-10 transition-all duration-500`}
                >
                  <div className="relative z-10 flex-1 min-w-0 text-center md:text-left mb-8 md:mb-0">
                    {b.id === 'all-in-one' && (
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#b026ff]/20 text-[#b026ff] text-xs font-bold uppercase tracking-wider mb-5 border border-[#b026ff]/30">
                        <ShieldCheck size={16} weight="fill" /> Best Value
                      </div>
                    )}
                    {b.id !== 'all-in-one' && b.id !== 'any-4-pdfs' && b.savings >= 35 && (
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00ff66]/10 text-[#00ff66] text-xs font-bold uppercase tracking-wider mb-5 border border-[#00ff66]/20">
                        <ShieldCheck size={16} weight="fill" /> Recommended
                      </div>
                    )}
                    <h4 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{b.title}</h4>
                    <ul className="text-slate-400 text-sm md:text-base max-w-md mx-auto md:mx-0 space-y-3">
                      {b.description ? b.description.split('\n').filter(l => l.trim()).map((line, i) => (
                        <li key={i} className="flex items-start justify-center md:justify-start gap-3">
                          <CheckCircle weight="fill" className="text-[#00ff66] text-lg shrink-0 mt-0.5"/> 
                          <span className="text-left break-words min-w-0 flex-1">{line}</span>
                        </li>
                      )) : (
                        <li className="flex items-center justify-center md:justify-start gap-3 text-slate-500 italic">
                          <span>No description provided.</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className={`relative z-10 w-full md:w-auto flex flex-col items-center gap-6 bg-black/40 border ${b.id === 'all-in-one' ? 'border-[#b026ff]/50 shadow-[0_0_30px_rgba(176,38,255,0.2)]' : 'border-white/10'} p-8 rounded-2xl backdrop-blur-md`}>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Investment</p>
                      {b.originalPrice > b.price && (
                        <p className="text-lg text-slate-400 line-through mb-1 flex items-center justify-center"><span className="mr-0.5 opacity-80">₹</span>{b.originalPrice}</p>
                      )}
                      <p className="text-5xl font-black text-white tracking-tighter flex items-center justify-center"><span className="mr-1.5 opacity-80 font-bold">₹</span>{b.price}</p>
                      {b.savings > 0 && (
                        <p className="text-sm font-bold text-[#00ff66] mt-2 flex items-center justify-center">Save <span className="ml-1 mr-0.5 opacity-80">₹</span>{b.savings}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleBundleSelect(b)}
                      className={`w-full px-8 py-4 ${b.id === 'all-in-one' ? 'bg-[#b026ff] hover:bg-[#9d22e6] text-white' : 'bg-[#00ff66] hover:bg-[#00cc52] text-[#0B0C10]'} font-bold text-lg rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2`}
                    >
                      <ShoppingCart size={24} weight="bold" className="shrink-0" />
                      Secure Bundle
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {step === 'select-pdfs' && (
          <motion.div key="select-pdfs" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="relative z-10 space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">Select your PDFs</h3>
                <p className="text-slate-400 mt-2">
                  Choose <strong className="text-[#00ff66]">{selectedBundle.pdfSelectionCount}</strong> PDF{selectedBundle.pdfSelectionCount > 1 ? 's' : ''} for your bundle.
                </p>
              </div>
              <div className="bg-[#12141D] border border-white/10 px-4 py-2 rounded-xl text-white font-bold">
                <span className="text-[#00ff66]">{selectedPdfs.length}</span> / {selectedBundle.pdfSelectionCount}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {offerings.map(pdf => {
                const isSelected = selectedPdfs.find(p => p.id === pdf.id);
                const isDisabled = !isSelected && selectedPdfs.length >= selectedBundle.pdfSelectionCount;
                return (
                  <div 
                    key={pdf.id}
                    onClick={() => !isDisabled && handlePdfToggle(pdf)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#00ff66]/10 border-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.1)]' 
                        : isDisabled 
                          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed' 
                          : 'bg-[#12141D] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-black/30 rounded-lg text-slate-300">
                        <BookOpen size={24} weight="duotone" />
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#00ff66] bg-[#00ff66] text-[#0B0C10]' : 'border-white/20'}`}>
                        {isSelected && <Check size={14} weight="bold" />}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white leading-snug mt-3">{pdf.title}</h4>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-white/10 flex justify-end">
              <button 
                disabled={selectedPdfs.length !== selectedBundle.pdfSelectionCount}
                onClick={handlePdfSelectionComplete}
                className="px-8 py-4 bg-[#00ff66] disabled:bg-white/10 disabled:text-slate-500 disabled:cursor-not-allowed text-[#0B0C10] font-bold text-lg rounded-xl hover:bg-[#00cc52] transition-colors active:scale-95 flex items-center justify-center gap-2"
              >
                {selectedBundle.hasConsultation ? 'Continue to Booking' : 'Review & Checkout'} <ArrowRight size={20} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'checkout' && (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-8 relative z-10"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 mb-6 shadow-xl shadow-[#00ff66]/10">
                <ShoppingCart size={40} weight="duotone" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Complete Order</h3>
            </div>

            <div className="p-8 bg-[#12141D] border border-white/10 rounded-[28px] shadow-2xl relative overflow-hidden">
              <div className="mb-8 pb-8 border-b border-white/5 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Bundle summary</p>
                    <p className="text-xl font-bold text-white leading-snug">{selectedBundle.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Amount</p>
                    <p className="text-xl font-bold text-white flex items-center justify-end"><span className="mr-0.5 opacity-80">₹</span>{selectedBundle.price}</p>
                  </div>
                </div>

                {selectedBundle.pdfSelectionCount > 0 && selectedPdfs.length > 0 && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Included PDFs</p>
                    <ul className="space-y-2">
                      {selectedPdfs.map(pdf => (
                        <li key={pdf.id} className="text-sm text-slate-300 flex items-center gap-2">
                          <CheckCircle size={14} className="text-[#00ff66]" weight="fill" /> {pdf.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedBundle.pdfSelectionCount === 0 && selectedBundle.id !== 'all-in-one' && selectedBundle.id !== 'all-4-pdfs' && (
                   <p className="text-sm text-slate-400 mt-2 flex items-center gap-2"><CheckCircle size={16} className="text-[#00ff66]" weight="fill"/> All PDFs Included Automatically</p>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xl relative z-10">
                <span className="font-bold text-slate-400">Total Due</span>
                <span className="font-black text-[#00ff66] text-3xl tracking-tight flex items-center"><span className="mr-1 opacity-80 font-bold">₹</span>{selectedBundle.price}</span>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-4">Your Details</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ff66]/50 focus:bg-[#00ff66]/5 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder={selectedBundle?.hasConsultation ? "Email (to receive meeting link and pdf)" : "Email (for PDF delivery)"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ff66]/50 focus:bg-[#00ff66]/5 transition-colors"
                  />
                  <div className="flex gap-2">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus-within:border-[#00ff66]/50 focus-within:bg-[#00ff66]/5 transition-colors">
                      <span className="text-white/50 mr-1">+</span>
                      <input 
                        type="tel"
                        value={countryCode}
                        maxLength="3"
                        placeholder="91"
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCountryCode(val);
                        }}
                        className="bg-transparent outline-none w-8 text-center"
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      maxLength="10"
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00ff66]/50 focus:bg-[#00ff66]/5 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4">
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-5 bg-[#00ff66] disabled:bg-[#00ff66]/50 disabled:cursor-not-allowed text-[#0B0C10] font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00cc52] transition-colors active:scale-95"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Secure Payment'} <ArrowRight weight="bold" size={20} />
              </button>
              {validationError && (
                <p className="text-red-500 text-sm text-center font-medium">{validationError}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default BundleStore;
