import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ShoppingCart, ArrowRight, ArrowLeft, FilePdf } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const PDFStore = ({ onSuccess }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [offerings, setOfferings] = useState([]);

  useEffect(() => {
    fetch('/api/offerings')
      .then(res => res.json())
      .then(data => setOfferings(data))
      .catch(console.error);
  }, []);

  const handleCheckout = (e) => {
    e.preventDefault();
    setTimeout(() => onSuccess(), 800);
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="p-6 md:p-10 relative overflow-hidden bg-[#0B0C10] rounded-[32px] shadow-2xl border border-white/10"
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
        {!selectedProduct ? (
          <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10">
            {/* Offerings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
              {offerings.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 text-center py-12 text-slate-400 bg-white/5 rounded-3xl border border-white/5">
                   <p>No PDFs available at the moment.</p>
                </div>
              ) : (
                offerings.map((p) => (
                  <div 
                    key={p.id} 
                    className="group relative rounded-[28px] overflow-hidden bg-[#12141D] border border-white/10 hover:border-[#00e5ff]/30 transition-all duration-500 flex flex-col shadow-xl"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-[#0B0F19] relative flex items-center justify-center">
                      <img src={p.coverImage || "https://placehold.co/600x800/12141D/ffffff?text=PDF"} alt={p.title} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
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
                      <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-0.5">Investment</span>
                          <span className="text-4xl font-black text-white tracking-tight">₹{p.price}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedProduct(p)}
                          className="px-6 py-3 rounded-xl bg-[#00e5ff] text-[#0B0C10] font-bold hover:bg-[#00ccff] transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                          <ShoppingCart size={18} weight="bold" />
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5 relative z-10">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Item summary</p>
                  <p className="text-xl font-bold text-white leading-snug">{selectedProduct.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-2">Amount</p>
                  <p className="text-xl font-bold text-white">₹{selectedProduct.price}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xl relative z-10">
                <span className="font-bold text-slate-400">Total Due</span>
                <span className="font-black text-[#00e5ff] text-3xl tracking-tight">₹{selectedProduct.price}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 pt-4">
              <button 
                onClick={handleCheckout}
                className="w-full py-5 bg-[#00e5ff] text-[#0B0C10] font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-[#00ccff] transition-colors active:scale-95"
              >
                Proceed to Secure Payment <ArrowRight weight="bold" size={20} />
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedProduct(null)} 
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
