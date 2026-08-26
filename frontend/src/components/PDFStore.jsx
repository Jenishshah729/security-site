import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ShoppingCart, ArrowRight, ArrowLeft, FilePdf, X } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const PDFStore = ({ onSuccess }) => {
  const [cart, setCart] = useState([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [offerings, setOfferings] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch('/api/offerings')
      .then(res => res.json())
      .then(data => setOfferings(data))
      .catch(console.error);
  }, []);

  const addToCart = (product) => {
    if (!cart.find(p => p.id === product.id)) {
      setCart([...cart, product]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(p => p.id !== productId));
  };

  const totalAmount = cart.reduce((sum, p) => sum + p.price, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name || !email || !phone) {
      setFormError('Please fill in all fields before proceeding');
      return;
    }

    if (!countryCode || countryCode.length < 1 || countryCode.length > 3) {
      setFormError('Country code must be 1 to 3 digits');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setFormError('Phone number must be exactly 10 digits');
      return;
    }
    
    setIsProcessing(true);
    try {
      const orderRes = await fetch('/api/pdf/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfIds: cart.map(p => String(p.id)),
          amount: totalAmount,
          name,
          email,
          phone: '+' + countryCode + phone
        })
      });
      const order = await orderRes.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Thejenishshah',
        description: `Purchase ${cart.length} PDFs`,
        order_id: order.id,
        handler: function (response) {
          // Immediately redirect to thank you page
          setCart([]);
          setIsCheckout(false);
          if (onSuccess) onSuccess();

          // Verify in background
          fetch('/api/pdf/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          }).catch(console.error);
        },
        prefill: {
          name,
          email,
          contact: phone
        },
        theme: {
          color: '#00e5ff'
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        console.error(response.error);
      });
      rzp.open();
    } catch (err) {
      console.error("Failed to process PDF payment", err);
      alert('Something went wrong during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="p-6 md:p-10 relative overflow-hidden bg-[#0B0C10] rounded-[32px] shadow-2xl border border-white/10 min-h-screen"
    >
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00e5ff]/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00e5ff]/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10 outline-none group relative z-10 font-medium">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <div className="flex items-center gap-5 mb-10 relative z-10">
        <div className="p-4 bg-[#00e5ff]/10 border border-[#00e5ff]/20 rounded-2xl text-[#00e5ff]">
          <BookOpen weight="duotone" size={32} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">PDF Store</h2>
          <p className="text-slate-400 text-sm md:text-base font-medium mt-1.5">Premium resources to level up your expertise.</p>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!isCheckout ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 pb-28">
            {/* Offerings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
              {offerings.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 text-center py-12 text-slate-400 bg-white/5 rounded-3xl border border-white/5">
                   <p>No PDFs available at the moment.</p>
                </div>
              ) : (
                offerings.map((p) => {
                  const inCart = cart.find(item => item.id === p.id);
                  return (
                    <div 
                      key={p.id} 
                      className={`group relative rounded-[28px] overflow-hidden bg-[#12141D] border transition-all duration-500 flex flex-col shadow-xl ${inCart ? 'border-[#00e5ff] shadow-[#00e5ff]/10' : 'border-white/10 hover:border-[#00e5ff]/30'}`}
                    >
                      <div className="aspect-[4/5] w-full overflow-hidden bg-[#0B0F19] relative flex items-center justify-center">
                        <img src={p.coverImage ? `${import.meta.env.BASE_URL}${p.coverImage.replace(/^\/+/, '')}` : "https://placehold.co/600x800/12141D/ffffff?text=PDF"} alt={p.title} className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12141D] via-[#12141D]/20 to-transparent"></div>
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-slate-300 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-white/10 flex items-center gap-1.5">
                          <FilePdf size={16} weight="fill" className="text-slate-400" /> E-Book
                        </div>
                      </div>
                      <div className="p-7 flex flex-col flex-1 justify-between gap-6 -mt-10 relative z-10">
                        <div>
                          <h3 className="text-xl font-bold text-white leading-tight break-words">{p.title}</h3>
                          {p.description && <p className="text-sm text-slate-400 mt-3 leading-relaxed break-words">{p.description}</p>}
                        </div>
                          <div className="flex flex-col mt-4 border-t border-white/5 pt-5 gap-5">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-0.5">Investment</span>
                              <span className="text-3xl font-black text-white tracking-tight">₹{p.price}</span>
                            </div>
                            {inCart ? (
                              <button 
                                onClick={() => removeFromCart(p.id)}
                                className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 active:scale-95 border border-red-500/20"
                              >
                                <X size={18} weight="bold" /> Remove from Cart
                              </button>
                            ) : (
                              <button 
                                onClick={() => addToCart(p)}
                                className="w-full py-3.5 rounded-xl bg-[#00e5ff] text-[#0B0C10] font-bold hover:bg-[#00ccff] transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                              >
                                <ShoppingCart size={18} weight="bold" /> Add to Cart
                              </button>
                            )}
                          </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Cart Floating Summary */}
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                  className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-[#00e5ff] text-[#0B0C10] flex justify-between items-center z-[100] rounded-t-[32px] mx-4 md:mx-auto max-w-4xl"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm opacity-80 uppercase tracking-widest mb-1">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</span>
                    <span className="text-2xl md:text-3xl font-black">₹{totalAmount}</span>
                  </div>
                  <button 
                    onClick={() => setIsCheckout(true)} 
                    className="px-6 md:px-8 py-3 md:py-4 bg-[#0B0C10] text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-[#1a1c23] transition-colors active:scale-95 shadow-xl"
                  >
                    Proceed to Checkout <ArrowRight size={18} weight="bold" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-8 relative z-10"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20 mb-6 shadow-xl shadow-[#00e5ff]/10">
                <ShoppingCart size={40} weight="duotone" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Complete Order</h3>
            </div>

            <div className="p-8 bg-[#12141D] border border-white/10 rounded-[28px] shadow-2xl relative overflow-hidden">
              <div className="mb-6 pb-6 border-b border-white/5 relative z-10 space-y-4">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Order summary</p>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <p className="text-md font-medium text-slate-300 leading-snug max-w-[70%] truncate" title={item.title}>{item.title}</p>
                    <p className="text-md font-bold text-white">₹{item.price}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xl relative z-10 mb-8 pt-2">
                <span className="font-bold text-slate-400">Total Due</span>
                <span className="font-black text-[#00e5ff] text-3xl tracking-tight">₹{totalAmount}</span>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00e5ff] transition-colors"
                />
                <input 
                  type="email"
                  placeholder="Your Email (for PDF delivery)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00e5ff] transition-colors"
                />
                <div className="flex gap-2">
                  <div className="flex items-center bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00e5ff] transition-colors">
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
                    placeholder="Your Phone Number"
                    value={phone}
                    maxLength="10"
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                    }}
                    className="w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00e5ff] transition-colors"
                  />
                </div>
              </div>
              
              {formError && (
                <p className="text-red-500 text-sm mt-4 font-medium text-center">{formError}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-4 pt-4">
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-5 bg-[#00e5ff] text-[#0B0C10] font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00ccff] transition-colors active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Secure Payment'} <ArrowRight weight="bold" size={20} />
              </button>
              <button 
                type="button" 
                onClick={() => setIsCheckout(false)} 
                className="w-full py-4 rounded-2xl text-slate-500 font-medium hover:text-white hover:bg-white/5 transition-colors active:scale-95"
              >
                Cancel and return to store
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default PDFStore;
