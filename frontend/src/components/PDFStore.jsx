import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkle, 
  User, 
  EnvelopeSimple, 
  Phone,
  Translate,
  X
} from '@phosphor-icons/react';

const PDFStore = ({ onSuccess }) => {
  const [offerings, setOfferings] = useState([]);
  const [cart, setCart] = useState([]); // Array of selected PDF objects
  const [isCheckout, setIsCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Checkout Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    fetch('/api/offerings')
      .then(res => res.json())
      .then(data => setOfferings(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const addToCart = (pdf) => {
    if (!cart.some(item => item.id === pdf.id)) {
      setCart([...cart, pdf]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 8) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    setFormError('');
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/pdf/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfIds: cart.map(item => String(item.id)),
          name: name,
          email: email,
          phone: `+${countryCode}${phone}`
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

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: "Matrix Fortress",
        description: `Access to ${cart.length} Cybersecurity PDF(s)`,
        order_id: orderData.order_id || orderData.id || orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment signature
            const verifyRes = await fetch('/api/pdf/verify-payment', {
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
              if (onSuccess) onSuccess();
            } else {
              alert('Payment verification failed. If money was deducted, please contact support.');
            }
          } catch (e) {
            console.error(e);
            alert('Error verifying payment.');
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: `+${countryCode}${phone}`
        },
        theme: {
          color: '#E5C158'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp){
        alert(`Payment failed: ${resp.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Payment initiation failed.');
      setIsProcessing(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      className="p-4 sm:p-6 md:p-8 relative bg-[#0c0c0e] rounded-2xl sm:rounded-3xl md:rounded-[32px] shadow-2xl border border-white/10 min-h-[500px]"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-5 sm:mb-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm sm:text-base md:text-sm text-slate-200 hover:text-white transition-all outline-none group font-bold bg-white/10 hover:bg-white/15 px-4 sm:px-5 md:px-4 py-2.5 sm:py-3 md:py-2.5 rounded-full border border-white/15 shadow-sm active:scale-95"
        >
          <ArrowLeft size={18} className="text-[#E5C158] transition-transform group-hover:-translate-x-0.5" /> 
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Creator Store Header */}
      <div className="p-5 sm:p-7 md:p-8 bg-[#141418] rounded-2xl sm:rounded-3xl border border-white/10 mb-6 sm:mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm sm:text-base md:text-sm font-bold text-[#E5C158]">Jenish Shah</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-3xl font-black text-white tracking-tight leading-tight">
            PDF Store
          </h2>
          <p className="text-base sm:text-lg md:text-[15px] text-slate-200 mt-2.5 leading-relaxed font-normal max-w-2xl">
            Curated, high-impact cybersecurity blueprints and practical guides designed for real-world offensive &amp; defensive mastery.
          </p>
        </div>

        {/* Feature Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4 mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 md:px-3 md:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm sm:text-base md:text-sm font-semibold">
              <ShieldCheck size={18} className="text-[#E5C158]" weight="fill" /> Lifetime Access
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-2 md:px-3 md:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm sm:text-base md:text-sm font-semibold">
              <Translate size={18} className="text-[#E5C158]" weight="bold" /> English
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm md:text-xs text-slate-300 font-bold uppercase tracking-wider">Available:</span>
            <span className="text-base sm:text-lg md:text-base font-black text-white">{offerings.length} Guides</span>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!isCheckout ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 space-y-6">
            {/* Offerings Grid - 1 Col Mobile, 2 Col Tablet, 3 Col Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {offerings.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                  <BookOpen size={48} className="mx-auto mb-3 opacity-40 text-[#E5C158]" />
                  <p className="font-medium">No PDFs available at the moment.</p>
                </div>
              ) : (
                offerings.map((p) => {
                  const inCart = cart.find(item => item.id === p.id);
                  return (
                    <div 
                      key={p.id} 
                      className={`group relative rounded-2xl overflow-hidden bg-[#141418] border transition-colors flex flex-col justify-between ${
                        inCart ? 'border-[#E5C158]' : 'border-white/10'
                      }`}
                    >
                      <div>
                        <div className="aspect-[2/3] w-full overflow-hidden bg-[#0c0c0e] relative flex items-center justify-center border-b border-white/5">
                          <img 
                            src={p.coverImage ? `${import.meta.env.BASE_URL}${p.coverImage.replace(/^\/+/, '')}?v=3d` : "https://placehold.co/600x800/12141D/ffffff?text=PDF"} 
                            alt={p.title} 
                            className="w-full h-full object-cover object-top opacity-95 transition-opacity duration-300" 
                          />
                        </div>

                        <div className="p-4 sm:p-5 md:p-5">
                          <h3 className="text-base sm:text-lg md:text-base font-black text-white leading-snug break-words tracking-tight">{p.title}</h3>
                          {p.description && (
                            <p className="text-sm sm:text-base md:text-[13px] text-slate-300 mt-2.5 leading-relaxed break-words font-normal">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 md:p-5 pt-0 mt-2 border-t border-white/5 flex items-center justify-between gap-3.5 pt-4 sm:pt-5">
                        <div className="shrink-0">
                          <span className="text-xs sm:text-sm md:text-xs text-slate-300 uppercase font-bold tracking-wider block mb-0.5">Price</span>
                          <span className="text-2xl sm:text-3xl md:text-2xl font-black text-white flex items-center tracking-tight">
                            ₹{p.price}
                          </span>
                        </div>

                        {inCart ? (
                          <button 
                            onClick={() => removeFromCart(p.id)}
                            className="py-3 sm:py-3.5 md:py-2.5 px-3.5 sm:px-4 md:px-3 rounded-xl bg-red-500/15 text-red-300 text-sm md:text-sm font-bold border border-red-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[46px] md:min-h-[40px]"
                          >
                            <X size={17} weight="bold" /> Remove
                          </button>
                        ) : (
                          <button 
                            onClick={() => addToCart(p)}
                            className="py-3 sm:py-3.5 md:py-2.5 px-4 sm:px-5 md:px-3.5 rounded-xl bg-white text-slate-950 text-sm sm:text-base md:text-sm font-black flex items-center justify-center gap-2 transition-all border border-slate-200 border-l-[4px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-md min-h-[46px] md:min-h-[40px]"
                          >
                            <ShoppingCart size={18} weight="bold" /> Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Sticky Floating Cart Summary */}
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 30 }}
                  className="sticky bottom-3 p-4 sm:p-5 bg-[#141418]/95 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3.5 sm:gap-4 z-40"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs sm:text-sm text-[#E5C158] uppercase tracking-wider">
                      {cart.length} item{cart.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-[#F5C842] flex items-center">
                      ₹{totalAmount}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsCheckout(true)} 
                    className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 md:py-3 bg-white text-slate-950 font-black text-sm sm:text-base md:text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all border border-slate-200 border-l-[5px] border-l-[#C69214] active:scale-95 cursor-pointer shadow-lg min-h-[48px] md:min-h-[44px]"
                  >
                    Proceed to Checkout <ArrowRight size={18} weight="bold" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Step 2: Attendee & Delivery Checkout Screen */
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-2 relative z-10"
          >
            {/* Cart Summary Header */}
            <div className="p-3.5 sm:p-4 bg-[#141418] border border-white/10 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 bg-[#E5C158]/15 text-[#E5C158] rounded-xl shrink-0">
                  <ShoppingCart size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-slate-400 uppercase font-semibold">Your Cart ({cart.length})</p>
                  <p className="text-sm sm:text-base font-bold text-white truncate">
                    {cart.map(i => i.title).join(', ')}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCheckout(false)} 
                className="shrink-0 text-xs sm:text-sm font-bold text-[#E5C158] bg-[#E5C158]/10 hover:bg-[#E5C158]/20 border border-[#E5C158]/30 px-3.5 py-2 rounded-xl transition-all outline-none active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4 sm:space-y-5 md:space-y-4">
              <div>
                <label className="block text-sm md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 md:mb-1.5 flex items-center gap-2 md:gap-1.5">
                  <User size={18} className="text-[#E5C158] md:w-4 md:h-4" /> Full Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#141418] text-white border border-white/10 rounded-xl px-4 py-3.5 md:py-3 placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] transition-all text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 md:mb-1.5 flex items-center gap-2 md:gap-1.5">
                  <EnvelopeSimple size={18} className="text-[#E5C158] md:w-4 md:h-4" /> Email Address (For PDF Delivery)
                </label>
                <input 
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#141418] text-white border border-white/10 rounded-xl px-4 py-3.5 md:py-3 placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] transition-all text-base md:text-sm"
                />
                <span className="text-xs md:text-xs text-slate-300 md:text-slate-400 font-medium mt-1.5 md:mt-1 block">Your download link will be emailed within 24 hours after payment.</span>
              </div>

              <div>
                <label className="block text-sm md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 md:mb-1.5 flex items-center gap-2 md:gap-1.5">
                  <Phone size={18} className="text-[#E5C158] md:w-4 md:h-4" /> Phone Number (WhatsApp)
                </label>
                <div className="flex gap-2.5 md:gap-2">
                  <div className="flex items-center bg-[#141418] text-white border border-white/10 rounded-xl px-3.5 py-3.5 md:py-3 md:px-3 focus-within:border-[#E5C158] focus-within:ring-1 focus-within:ring-[#E5C158] transition-all text-base md:text-sm font-semibold">
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
                      className="bg-transparent outline-none w-9 md:w-8 text-center text-white text-base md:text-sm font-semibold"
                    />
                  </div>
                  <input 
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    maxLength="10"
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                    }}
                    className="w-full bg-[#141418] text-white border border-white/10 rounded-xl px-4 py-3.5 md:py-3 placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158] focus:ring-1 focus:ring-[#E5C158] transition-all text-base md:text-sm"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-red-400 text-sm md:text-xs font-semibold md:font-medium text-center bg-red-500/10 border border-red-500/20 py-2.5 md:py-2 px-3 rounded-xl">{formError}</p>
              )}

              {/* Pricing & Checkout Summary Box */}
              <div className="p-4 sm:p-5 md:p-4 bg-[#141418] border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm md:text-sm uppercase font-bold md:font-semibold text-slate-200 md:text-slate-400 block tracking-wide">Total Due</span>
                  <span className="text-sm md:text-sm text-slate-300 md:text-slate-400 font-medium mt-1 md:mt-0 block">{cart.length} item{cart.length > 1 ? 's' : ''} included</span>
                </div>
                <span className="text-3xl md:text-3xl font-black text-[#F5C842] md:text-white tracking-tight">₹{totalAmount}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 sm:py-4.5 md:py-3.5 font-black text-base md:text-base rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 bg-white text-slate-950 border border-slate-200 border-l-[4px] border-l-[#C69214] cursor-pointer shadow-md min-h-[52px] md:min-h-[48px]"
              >
                {isProcessing ? 'Processing...' : `Confirm & Pay ₹${totalAmount}`} <ArrowRight weight="bold" size={20} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-xs text-slate-400 font-semibold pt-1">
                <ShieldCheck size={18} className="text-[#E5C158] md:w-4 md:h-4" weight="fill" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs md:text-sm font-medium text-slate-400 mt-8 pt-6 border-t border-white/10 relative z-10 leading-relaxed">
        Need assistance with your order?<br />
        Contact <a href="mailto:support@thejenishshah.com" className="text-[#E5C158] transition-colors underline decoration-[#E5C158]/40">support@thejenishshah.com</a>.
      </p>
    </motion.section>
  );
};

export default PDFStore;
