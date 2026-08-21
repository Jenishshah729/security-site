import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowRight, ArrowLeft } from '@phosphor-icons/react';
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
  
  const [formData, setFormData] = useState({ name: '', email: '' });

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

    if (selectedSlot) {
      try {
        await fetch('/api/book-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            eventId: selectedSlot.eventId,
            slotStart: selectedSlot.slotStart,
            slotEnd: selectedSlot.slotEnd,
            name: formData.name,
            email: formData.email
          })
        });
      } catch (err) {
        console.error("Failed to book slot", err);
      }
    }
    setTimeout(() => onSuccess(), 800);
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
      className="p-6 md:p-10 relative overflow-hidden bg-[#0B0C10] rounded-[32px] shadow-2xl border border-white/10"
    >
      {/* Subtle Background Effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b026ff]/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

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
          <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
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
                  <select 
                    value={selectedDate} 
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                    className="w-full px-5 py-4 bg-[#12141D] border border-white/10 rounded-xl text-white font-medium cursor-pointer appearance-none hover:border-white/20 transition-colors outline-none focus:border-[#b026ff]/50 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%238b949e%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1.5rem_center]"
                  >
                    <option value="">-- Choose a Date --</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>{formatDate(date)}</option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Available Times</label>
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
        ) : (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="flex items-center justify-between p-6 bg-[#12141D] border border-white/10 rounded-2xl mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Selected Slot</p>
                <p className="text-base font-bold text-white">{formatDate(selectedDate)} at {selectedSlot?.time}</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-slate-400 hover:text-white bg-white/5 px-4 py-2 rounded-lg transition-colors outline-none">
                Change
              </button>
            </div>
            
            {selectedPdfs.length > 0 && (
              <div className="p-4 bg-[#12141D] border border-white/10 rounded-2xl mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Included PDFs</p>
                <ul className="space-y-1">
                  {selectedPdfs.map(pdf => (
                    <li key={pdf.id} className="text-sm text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]"></span> {pdf.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button 
              onClick={handleCheckout}
              className="w-full py-5 bg-[#b026ff] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-[#9d22e6] transition-colors active:scale-95 mt-4"
            >
              Confirm Booking <ArrowRight weight="bold" />
            </button>
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
