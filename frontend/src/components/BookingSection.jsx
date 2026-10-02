import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck, User, EnvelopeSimple, Phone, ChatCircleText, Translate } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';

const BookingSection = ({ onSuccess, isBundle }) => {
  const location = useLocation();
  const bundle = location.state?.bundle;
  const selectedPdfs = location.state?.selectedPdfs || [];
  const [slotsData, setSlotsData] = useState([]);
  const [settings, setSettings] = useState({ price: 349, duration: 30, description: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const [conflictUI, setConflictUI] = useState(queryParams.get('conflict') === 'true');
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', countryCode: '91', topic: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const fetchSlots = async () => {
      try {
        const response = await fetch('/api/slots');
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : [];
          setSlotsData(list);
          const dates = [...new Set(list.map(s => s.date))].sort();
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
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

  const parseDateDetails = (dateString) => {
    if (!dateString) return { weekday: '', day: '', month: '', full: '' };
    const parts = dateString.split('-');
    const d = parts.length === 3 
      ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      : new Date(dateString);
    return {
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  };

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
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          throw new Error(`Server returned unexpected response (${response.status}). Please try again.`);
        }
        
        if (data.success && data.order) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.order.keyId || data.keyId,
            amount: data.order.amount,
            currency: data.order.currency || 'INR',
            name: 'Matrix Fortress',
            description: isBundle ? bundle?.title : '1:1 Consultation',
            order_id: data.order.order_id || data.order.id,
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
              color: '#2563EB'
            },
            modal: {
              ondismiss: function() {
                setIsVerifying(false);
              }
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response){
            console.error(response.error);
            alert(`Payment failed: ${response.error?.description || 'Transaction unsuccessful'}`);
          });
          rzp.open();
          return;
        } else {
          if (data.slotTaken || response.status === 409) {
            alert(data.error || 'This time slot was just taken by another person. Please select a different time slot.');
            setShowForm(false);
            setSelectedSlot(null);
            try {
              const res = await fetch('/api/slots');
              if (res.ok) setSlotsData(await res.json());
            } catch (fetchErr) {
              console.error(fetchErr);
            }
          } else {
            alert(data.error || 'Failed to initiate checkout. Please try again.');
          }
        }
      } catch (err) {
        console.error("Failed to book slot", err);
        alert('Something went wrong while initiating payment.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const finalPrice = isBundle ? (bundle?.price || '420') : settings.price;

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

      {/* Creator Service Header */}
      <div className="p-5 sm:p-7 md:p-8 bg-[#141418] rounded-2xl sm:rounded-3xl border border-white/10 mb-6 sm:mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm sm:text-base md:text-sm font-bold text-[#E5C158]">Jenish Shah</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-3xl font-black text-white tracking-tight leading-tight">
            {isBundle ? (bundle?.title || '1:1 + PDF Bundle') : '1:1 Consultation'}
          </h2>
          <p className="text-base sm:text-lg md:text-[15px] text-slate-200 mt-2.5 leading-relaxed font-normal max-w-2xl">
            {isBundle 
              ? 'Get your 1:1 consultation session plus your selected premium cybersecurity guides.' 
              : 'Personalized 1-on-1 mentorship for all areas of cybersecurity.'}
          </p>
        </div>

        {/* Feature Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4 mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 md:px-3 md:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm sm:text-base md:text-sm font-semibold">
              <Clock size={18} className="text-[#E5C158]" weight="bold" /> {settings.duration} Mins
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-2 md:px-3 md:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm sm:text-base md:text-sm font-semibold">
              <ShieldCheck size={18} className="text-[#E5C158]" weight="fill" /> Guaranteed Value
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-2 md:px-3 md:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm sm:text-base md:text-sm font-semibold">
              <Translate size={18} className="text-[#E5C158]" weight="bold" /> English • Hindi • Gujarati
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base md:text-sm text-slate-300 font-bold uppercase tracking-wider">Price:</span>
            <span className="text-3xl sm:text-4xl md:text-3xl font-black text-white tracking-tight">₹{finalPrice}</span>
          </div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {conflictUI ? (
          <motion.div 
            key="conflict"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-8 relative z-10 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/30">
              <Calendar size={40} weight="duotone" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight mb-2">Payment Successful</h3>
            <div className="text-slate-300 text-base leading-relaxed bg-[#141418] p-6 rounded-2xl border border-white/10 shadow-lg text-left">
              <p>Your payment went through successfully, but this slot was <span className="text-[#E5C158] font-bold">just taken</span> by another booking a moment ago.</p>
              <p className="mt-3">Don't worry! We will email you within 24 hours to help you reschedule to a new time that works for you.</p>
              {isBundle && (
                <p className="mt-3 text-[#E5C158] font-medium">
                  Your selected PDFs have been secured and will be emailed to you within 24 hours.
                </p>
              )}
            </div>
            <button 
              onClick={() => { setConflictUI(false); setShowForm(false); setSelectedSlot(null); }}
              className="mt-6 py-4 px-8 rounded-xl font-bold text-slate-950 bg-white transition-colors w-full shadow-none"
            >
              Return Home
            </button>
          </motion.div>
        ) : !showForm ? (
          <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-20 min-h-[350px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-[300px] text-slate-400 font-medium text-base">
                  <svg className="animate-spin mb-4 h-8 w-8 text-[#E5C158]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading available slots...
                </motion.div>
              ) : availableDates.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                  <Calendar size={48} className="mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="font-semibold text-base sm:text-lg text-white">No consultation slots available at the moment.</p>
                  <p className="text-sm text-slate-400 mt-1">Please check back later or reach out via email.</p>
                </motion.div>
              ) : (
                <motion.div key="dates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Date Selection Box */}
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <label className="text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={18} className="text-[#E5C158]" weight="duotone" /> 1. Select Date
                      </label>
                      <span className="text-xs sm:text-sm md:text-xs text-slate-400">Time zone: <strong className="text-slate-200 font-semibold">IST (GMT+5:30)</strong></span>
                    </div>

                    <div className="py-2 px-1 flex gap-3 overflow-x-auto no-scrollbar">
                      {availableDates.map(date => {
                        const { weekday, day, month } = parseDateDetails(date);
                        const isSelected = selectedDate === date;
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedSlot(null);
                            }}
                            className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[78px] py-4 px-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                              isSelected 
                                ? 'bg-white text-slate-950 border-white font-bold shadow-md' 
                                : 'bg-[#141418] text-slate-200 border-white/10 hover:border-white/25'
                            }`}
                          >
                            <span className={`text-xs uppercase tracking-wider font-bold ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{weekday}</span>
                            <span className={`text-2xl sm:text-3xl font-black my-1 ${isSelected ? 'text-slate-950' : 'text-white'}`}>{day}</span>
                            <span className={`text-xs uppercase tracking-wider font-bold ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Box */}
                  <AnimatePresence mode="wait">
                    {selectedDate && (
                      <motion.div key={selectedDate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3.5 pt-2">
                        <label className="text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                          <Clock size={18} className="text-[#E5C158]" weight="duotone" /> 2. Select Time Slot
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {getSlotsForDate(selectedDate).map((slot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={slot.booked}
                                onClick={() => !slot.booked && setSelectedSlot(slot)}
                                className={`
                                  py-3.5 px-3 sm:px-4 md:py-2.5 md:px-3 rounded-xl text-sm sm:text-base md:text-sm font-bold flex items-center justify-center gap-2 border transition-all duration-200 shadow-none cursor-pointer min-h-[46px] md:min-h-[40px]
                                  ${slot.booked 
                                    ? 'bg-white/[0.02] border-white/5 text-slate-500 cursor-not-allowed opacity-60' 
                                    : isSelected
                                      ? 'bg-white border-white text-slate-950 font-black shadow-md'
                                      : 'bg-[#141418] border-white/10 text-slate-200 hover:border-white/30'}
                                `}
                              >
                                <Clock size={16} weight={isSelected ? 'bold' : 'regular'} className="shrink-0" />
                                <span className={slot.booked ? 'line-through text-slate-500' : ''}>{slot.time}</span>
                                {slot.booked && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400/90 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                    Taken
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next Step CTA */}
                  <AnimatePresence>
                    {selectedSlot && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4">
                        <button
                          type="button"
                          onClick={() => setShowForm(true)}
                          className="w-full py-4 md:py-3.5 rounded-xl font-black text-base sm:text-lg md:text-base flex items-center justify-center gap-2 bg-white text-slate-950 transition-all duration-200 active:scale-[0.99] border border-slate-200 border-l-[4px] border-l-[#C69214] cursor-pointer shadow-md min-h-[50px] md:min-h-[46px]"
                        >
                          Next: Enter Details <ArrowRight weight="bold" size={19} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Step 2: Attendee Details Form */
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 max-w-lg mx-auto py-2 relative z-10"
          >
            {/* Slot Review Header */}
            <div className="p-3.5 sm:p-4 bg-[#141418] border border-white/10 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 bg-white/10 text-[#E5C158] rounded-xl shrink-0">
                  <Calendar size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-slate-400 uppercase font-semibold">Your Selected Session</p>
                  <p className="text-sm sm:text-base font-bold text-white truncate">
                    {parseDateDetails(selectedDate).full} at {selectedSlot?.time} (IST)
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="shrink-0 text-xs sm:text-sm font-bold text-[#E5C158] bg-[#E5C158]/10 hover:bg-[#E5C158]/20 border border-[#E5C158]/30 px-3.5 py-2 rounded-xl transition-all outline-none active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Included Bundle PDFs preview if applicable */}
            {selectedPdfs.length > 0 && (
              <div className="p-4 bg-[#141418] rounded-2xl border border-white/10">
                <p className="text-xs sm:text-sm text-slate-300 uppercase font-bold tracking-wider mb-2.5">
                  Included Bundle E-Books ({selectedPdfs.length})
                </p>
                <ul className="space-y-2">
                  {selectedPdfs.map(pdf => (
                    <li key={pdf.id} className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle size={16} className="shrink-0 mt-0.5 text-[#E5C158]" weight="fill" />
                      <span className="leading-snug">{pdf.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={18} className="text-[#E5C158]" /> Full Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#141418] text-white border border-white/10 rounded-xl px-4 py-3.5 md:py-3 placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158]/50 focus:ring-1 focus:ring-[#E5C158]/50 transition-all text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <EnvelopeSimple size={18} className="text-[#E5C158]" /> Email Address
                </label>
                <input 
                  type="email"
                  placeholder={isBundle ? "you@example.com (meeting link & PDFs sent here)" : "you@example.com (for calendar invite)"}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#141418] text-white border border-white/10 rounded-xl px-4 py-3.5 md:py-3 placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158]/50 focus:ring-1 focus:ring-[#E5C158]/50 transition-all text-base md:text-sm"
                />
                <span className="text-xs sm:text-sm md:text-xs text-slate-300 font-medium mt-1.5 block">
                  {isBundle 
                    ? "Meeting link and PDFs will be shared to your email within 24 hours." 
                    : "Google Meet link will be emailed here."}
                </span>
              </div>

              <div>
                <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Phone size={18} className="text-[#E5C158]" /> Phone Number (WhatsApp)
                </label>
                <div className="flex gap-2.5">
                  <div className="flex items-center bg-[#141418] text-white border border-white/10 rounded-xl px-3.5 py-3.5 md:py-3 focus-within:border-[#E5C158]/50 focus-within:ring-1 focus-within:ring-[#E5C158]/50 transition-all text-base md:text-sm font-semibold">
                    <span className="text-slate-400 mr-1">+</span>
                    <input 
                      type="tel"
                      value={formData.countryCode}
                      maxLength="3"
                      placeholder="91"
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData(prev => ({ ...prev, countryCode: val }));
                      }}
                      className="bg-transparent outline-none w-9 text-center text-white text-base md:text-sm font-semibold"
                    />
                  </div>
                  <input 
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    maxLength="10"
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, phone: val }));
                    }}
                    className="w-full bg-[#141418] text-white border border-white/10 rounded-xl px-4 py-3.5 md:py-3 placeholder:text-slate-500 focus:outline-none focus:border-[#E5C158]/50 focus:ring-1 focus:ring-[#E5C158]/50 transition-all text-base md:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base md:text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ChatCircleText size={18} className="text-[#E5C158]" /> Topic / Questions for Discussion
                </label>
                <textarea 
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Tell Jenish what specific topics, roadmap questions, or doubts you want to focus on..."
                  className="w-full px-4 py-3.5 md:py-3 bg-[#141418] border border-white/10 rounded-xl text-white text-base md:text-sm placeholder:text-slate-500 focus:border-[#E5C158]/50 focus:ring-1 focus:ring-[#E5C158]/50 outline-none transition-all resize-none"
                  rows={2}
                />
              </div>

              {formError && (
                <p className="text-red-400 text-sm font-semibold text-center bg-red-500/10 border border-red-500/20 py-2.5 px-3 rounded-xl">{formError}</p>
              )}

              {/* Pricing & Checkout Summary Box */}
              <div className="p-4 sm:p-5 md:p-4 bg-[#141418] border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm sm:text-base md:text-sm uppercase font-bold text-slate-200 block tracking-wide">Total Due</span>
                  <span className="text-sm sm:text-base md:text-sm text-slate-300 font-medium mt-1 block">
                    {isBundle ? `${selectedPdfs.length} E-Books + 30 min session included` : 'Includes 30 min session'}
                  </span>
                </div>
                <span className="text-3xl sm:text-4xl md:text-3xl font-black text-[#F5C842] tracking-tight">₹{finalPrice}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing || isVerifying}
                className="w-full py-4 sm:py-4.5 md:py-3.5 font-black text-base sm:text-lg md:text-base rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 bg-white text-slate-950 border border-slate-200 border-l-[4px] border-l-[#C69214] cursor-pointer shadow-md min-h-[52px] md:min-h-[48px]"
              >
                {isProcessing ? 'Processing...' : isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming booking...
                  </>
                ) : (
                  <>Confirm & Pay ₹{finalPrice} <ArrowRight weight="bold" size={20} /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-xs text-slate-400 font-semibold pt-1">
                <ShieldCheck size={18} className="text-[#E5C158]" weight="fill" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs md:text-xs font-medium text-slate-400 mt-8 pt-6 border-t border-white/10 relative z-10 leading-relaxed">
        Reschedules must be requested at least 24 hours in advance.<br />
        Contact <a href="mailto:support@thejenishshah.com" className="text-[#E5C158] transition-colors underline decoration-[#E5C158]/40">support@thejenishshah.com</a> for assistance.
      </p>
    </motion.section>
  );
};

export default BookingSection;
