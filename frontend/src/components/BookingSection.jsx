import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle, CaretDown } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';

const BookingSection = ({ onSuccess, isBundle }) => {
  const location = useLocation();
  const bundle = location.state?.bundle;
  const selectedPdfs = location.state?.selectedPdfs || [];
  const [slotsData, setSlotsData] = useState([]);
  const [settings, setSettings] = useState({ price: 449, duration: 30, description: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formError, setFormError] = useState('');
  const [conflictUI, setConflictUI] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', countryCode: '91', topic: '' });

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch('/api/slots');
        if (response.ok) {
          const data = await response.json();
          setSlotsData(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/consultation-settings');
        if (response.ok) {
          setSettings(await response.json());
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    
    fetchSlots();
    fetchSettings();
  }, []);

  const availableDates = [...new Set(slotsData.map(s => s.date))].sort();

  const getSlotsForDate = (date) => {
    return slotsData.filter(s => s.date === date).map(s => ({ 
      time: s.time, 
      booked: s.isBooked, 
      id: s.id,
      eventId: s.eventId,
      slotStart: s.slotStart,
      slotEnd: s.slotEnd
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.topic) {
      setFormError('Please fill in all fields before proceeding');
      return;
    }

    if (!formData.countryCode || formData.countryCode.length < 1 || formData.countryCode.length > 3) {
      setFormError('Country code must be 1 to 3 digits');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setFormError('Phone number must be exactly 10 digits');
      return;
    }

    if (selectedSlot) {
      setIsProcessing(true);
      try {
        const response = await fetch('/api/consultation/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            eventId: selectedSlot.eventId,
            slotStart: selectedSlot.slotStart,
            slotEnd: selectedSlot.slotEnd,
            name: formData.name,
            email: formData.email,
            phone: '+' + formData.countryCode + formData.phone,
            topic: formData.topic,
            amount: isBundle ? bundle?.price : settings.price,
            bundleId: isBundle ? bundle?.id : null,
            selectedPdfs: isBundle ? selectedPdfs.map(p => p.title) : null
          })
        });
        
        const data = await response.json();
        
        if (data.success && data.order) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'Thejenishshah',
            description: isBundle ? bundle?.title : '1:1 Consultation',
            order_id: data.order.id,
            handler: async function (response) {
              try {
                setIsVerifying(true);
                const verifyRes = await fetch('/api/consultation/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...response, bookingId: data.bookingId })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  if (verifyData.conflict) {
                    setConflictUI(true);
                  } else {
                    setShowForm(false);
                    setSelectedSlot(null);
                    if (onSuccess) onSuccess();
                  }
                } else {
                  alert('Payment verification failed. Invalid signature.');
                }
              } catch (err) {
                console.error(err);
                alert('Verification error. Please check console.');
              } finally {
                setIsVerifying(false);
              }
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: isBundle ? '#00ff66' : '#b026ff'
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response){
            console.error(response.error);
          });
          rzp.open();
          return;
        } else {
          alert('Failed to initiate checkout. Please try again.');
        }
      } catch (err) {
        console.error("Failed to book slot", err);
        alert('Something went wrong while initiating payment.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10 relative bg-[#0B0C10] rounded-[32px] shadow-2xl border border-white/10"
    >
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b026ff]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      </div>

      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 outline-none group relative z-10 font-medium">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
      </Link>

      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="p-3 bg-[#b026ff]/10 border border-[#b026ff]/20 rounded-xl text-[#b026ff]">
          <Calendar weight="duotone" size={28} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {isBundle ? (bundle?.title || '1:1 + PDF Bundle Deal') : '1:1 Consultation'}
        </h2>
      </div>
      
      <div className="mb-10 relative z-10 border-b border-white/10 pb-8">
        <p className="text-slate-400 text-sm md:text-base mb-4 font-medium">
          {isBundle ? 'Book your consultation and secure your premium bundle.' : 'Book your high-impact private call below.'}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            ₹{isBundle ? (bundle?.price || '420') : settings.price}
          </span>
          <span className="text-slate-500 text-lg font-bold tracking-widest uppercase">/ {settings.duration}min</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-20">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading available slots...</div>
            ) : availableDates.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white/5 rounded-2xl border border-white/5">
                <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                <p>No consultation slots are available right now. Please check back later!</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select a Date</label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full px-5 py-4 bg-[#12141D] border ${isDropdownOpen ? (isBundle ? 'border-[#00ff66]/50' : 'border-[#b026ff]/50') : 'border-white/10'} rounded-xl text-white font-medium cursor-pointer hover:border-white/20 transition-colors flex justify-between items-center`}
                    >
                      <span className={selectedDate ? 'text-white' : 'text-slate-400'}>{selectedDate ? formatDate(selectedDate) : '-- Choose a Date --'}</span>
                      <CaretDown size={20} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 w-full mt-2 bg-[#1A1D27] border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto"
                        >
                          <div 
                            onClick={() => {
                              setSelectedDate('');
                              setSelectedSlot(null);
                              setIsDropdownOpen(false);
                            }}
                            className={`px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${!selectedDate ? (isBundle ? 'text-[#00ff66] bg-[#00ff66]/5' : 'text-[#b026ff] bg-[#b026ff]/5') : 'text-slate-400'}`}
                          >
                            -- Choose a Date --
                          </div>
                          {availableDates.map(date => (
                            <div 
                              key={date}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlot(null);
                                setIsDropdownOpen(false);
                              }}
                              className={`px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors ${selectedDate === date ? (isBundle ? 'text-[#00ff66] bg-[#00ff66]/5 border-l-2 border-[#00ff66]' : 'text-[#b026ff] bg-[#b026ff]/5 border-l-2 border-[#b026ff]') : 'text-slate-300 border-l-2 border-transparent'}`}
                            >
                              {formatDate(date)}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {selectedDate && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Available Times in IST Time Zone
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getSlotsForDate(selectedDate).map((slot) => (
                        <motion.button
                          key={slot.id}
                          whileHover={!slot.booked ? { scale: 0.98 } : {}}
                          whileTap={!slot.booked ? { scale: 0.95 } : {}}
                          onClick={() => !slot.booked && (setSelectedSlot(slot), setShowForm(true))}
                          disabled={slot.booked}
                          className={`
                            py-4 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 border
                            ${slot.booked 
                              ? 'bg-black/20 border-white/5 text-slate-700 line-through cursor-not-allowed' 
                              : selectedSlot?.id === slot.id
                                ? 'bg-[#b026ff]/10 border-[#b026ff] text-[#b026ff]'
                                : 'bg-[#12141D] hover:bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'}
                          `}
                        >
                          <Clock size={16} />
                          {slot.time} {slot.booked && <span className="text-[10px] uppercase ml-1 tracking-wider text-slate-600">(Booked)</span>}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ) : conflictUI ? (
          <motion.div 
            key="conflict"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-12 relative z-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl border bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10">
              <Calendar size={40} weight="duotone" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Payment Successful</h3>
            <p className="text-slate-300 text-lg leading-relaxed bg-[#12141D] p-6 rounded-2xl border border-white/10">
              Your payment went through successfully, but this slot was <span className="text-orange-400 font-bold">just taken</span> by another booking a moment ago.
              <br /><br />
              Don't worry! We will email you within 24 hours to help you reschedule to a new time that works for you.
              {isBundle && (
                <>
                  <br /><br />
                  <span className="text-[#00ff66] font-medium">Your selected PDFs have been secured and will be sent to your email shortly.</span>
                </>
              )}
            </p>
            <button 
              onClick={() => { setConflictUI(false); setShowForm(false); setSelectedSlot(null); }}
              className="mt-8 py-4 px-8 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all w-full"
            >
              Return Home
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-8 relative z-10"
          >
            <div className="text-center mb-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-xl border ${isBundle ? 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20 shadow-[#00ff66]/10' : 'bg-[#b026ff]/10 text-[#b026ff] border-[#b026ff]/20 shadow-[#b026ff]/10'}`}>
                <Calendar size={40} weight="duotone" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Complete Order</h3>
            </div>

            <div className="p-8 bg-[#12141D] border border-white/10 rounded-[28px] shadow-2xl relative overflow-hidden">
              <div className="mb-8 pb-8 border-b border-white/5 relative z-10">
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">{isBundle ? 'Bundle summary' : 'Consultation'}</p>
                    <p className="text-xl font-bold text-white leading-snug">{isBundle ? bundle?.title : '1:1 Consultation'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Amount</p>
                    <p className="text-xl font-bold text-white">₹{isBundle ? bundle?.price : settings.price}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Selected Slot</p>
                    <p className="text-sm font-bold text-white">{formatDate(selectedDate)} at {selectedSlot?.time}</p>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-slate-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg transition-colors outline-none">
                    Change
                  </button>
                </div>

                {selectedPdfs.length > 0 && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Included PDFs</p>
                    <ul className="space-y-2">
                      {selectedPdfs.map(pdf => (
                        <li key={pdf.id} className="text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle size={16} className={`shrink-0 mt-0.5 ${isBundle ? "text-[#00ff66]" : "text-[#b026ff]"}`} weight="fill" />
                          <span className="leading-snug">{pdf.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
              </div>
              
              <div className="flex justify-between items-center text-xl relative z-10">
                <span className="font-bold text-slate-400">Total Due</span>
                <span className={`font-black text-3xl tracking-tight ${isBundle ? 'text-[#00ff66]' : 'text-[#b026ff]'}`}>₹{isBundle ? bundle?.price : settings.price}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4">
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none transition-colors ${isBundle ? 'focus:border-[#00ff66]' : 'focus:border-[#b026ff]'}`}
                />
                <input 
                  type="email"
                  placeholder={isBundle ? "Email (to receive meeting link and pdf)" : "Email (for meeting link)"}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none transition-colors ${isBundle ? 'focus:border-[#00ff66]' : 'focus:border-[#b026ff]'}`}
                />
                <div className="flex gap-2">
                  <div className={`flex items-center bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#00ff66] transition-colors ${isBundle ? 'focus-within:border-[#00ff66]' : 'focus-within:border-[#b026ff]'}`}>
                    <span className="text-white/50 mr-1">+</span>
                    <input 
                      type="tel"
                      value={formData.countryCode}
                      maxLength="3"
                      placeholder="91"
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, countryCode: val });
                      }}
                      className="bg-transparent outline-none w-8 text-center"
                    />
                  </div>
                  <input 
                    type="tel"
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    maxLength="10"
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                    className={`w-full bg-[#0B0F19] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none transition-colors ${isBundle ? 'focus:border-[#00ff66]' : 'focus:border-[#b026ff]'}`}
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Topic to Discuss</label>
                <textarea 
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="What would you like to cover in this call?"
                  className="w-full px-5 py-4 bg-[#12141D] border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-600 focus:border-[#b026ff]/50 outline-none transition-colors resize-none"
                  rows={2}
                />
              </div>
              
              {formError && (
                <p className="text-red-500 text-sm font-medium text-center">{formError}</p>
              )}

              <button 
                onClick={handleCheckout}
                disabled={isProcessing || isVerifying}
                className={`w-full py-5 font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 ${isBundle ? 'bg-[#00ff66] hover:bg-[#00cc52] text-[#0B0C10]' : 'bg-[#b026ff] hover:bg-[#9d22e6] text-white'}`}
              >
                {isProcessing ? 'Processing...' : isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming your booking...
                  </>
                ) : (
                  <>Proceed to Secure Payment <ArrowRight weight="bold" size={20} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs font-medium text-slate-500 mt-8 pt-8 border-t border-white/5 relative z-10 leading-relaxed">
        Cancellations or reschedules must be made at least 24 hours prior to the call.<br />
        Please email <a href="mailto:support@thejenishshah.com" className="text-white hover:text-[#b026ff] transition-colors underline decoration-white/30 underline-offset-2">support@thejenishshah.com</a> for any changes.
      </p>
    </motion.section>
  );
};

export default BookingSection;
