import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recycle, Leaf, ChevronRight, X, Package, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PackagingUpsellBannerProps {
  itemCount: number;
}

const PackagingUpsellBanner: React.FC<PackagingUpsellBannerProps> = ({ itemCount }) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('chils_packaging_upsell_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('chils_packaging_upsell_dismissed', 'true');
  };

  const handleBrowseTees = () => {
    navigate('/collection');
  };

  // Only show when exactly 1 tee and not dismissed
  // Only show when exactly 1 item in cart and not dismissed
  const isVisible = itemCount === 1 && !dismissed;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden"
        >
          {/* Main Container */}
          <div className="relative border border-accent/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(0,0,0,0)_50%,rgba(212,175,55,0.03))]">
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-accent/30" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-accent/30" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-accent/30" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-accent/30" />

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-10 p-1.5 text-neutral-700 hover:text-white transition-colors"
              aria-label="Dismiss packaging suggestion"
            >
              <X size={14} />
            </button>

            {/* Content */}
            <div className="p-8 md:p-10">
              
              {/* Header Badge */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 border border-accent/30 bg-accent/5 flex items-center justify-center"
                >
                  <Recycle size={18} className="text-accent" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent">Second Life Protocol</span>
                    <Sparkles size={10} className="text-accent/60" />
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-0.5">Packaging Intelligence</p>
                </div>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Left: Message */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white leading-snug">
                    Unlock <span className="text-accent">Second Life</span> Packaging
                  </h3>
                  <p className="text-[12px] leading-relaxed text-neutral-400 tracking-wide max-w-md">
                    We have put a lot of effort and care into creating a unique unboxing experience. To help us sustain these packaging standards and offset high individual shipping charges, we kindly request you to order at least 2 T-shirts. This enables us to send them in our premium, handcrafted <span className="text-white font-medium">Second Life Box</span>.
                  </p>

                  {/* Visual Progress Element */}
                  <div className="mt-4 border border-[#D4AF37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.04),rgba(0,0,0,0)_60%)] p-4 max-w-md relative overflow-hidden">
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2">
                      <span>Unboxing Unlock Progress</span>
                      <span className="text-accent font-bold">1 / 2 Tees</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden mb-2">
                      <div className="h-full w-1/2 bg-gradient-to-r from-[#D4AF37] to-[#f5d97a]" />
                    </div>
                    <p className="text-[9.5px] text-neutral-500 font-light tracking-wide uppercase">
                      Add <strong className="text-white">1 more tee</strong> to unlock the premium <strong className="text-accent">Second Life Box</strong>
                    </p>
                  </div>
                </div>

                {/* Right: CTAs */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <motion.button
                    onClick={handleBrowseTees}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 175, 55, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-accent text-black py-4 text-[11px] tracking-[0.3em] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    <span>Browse Another Tee</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 text-[10px] tracking-[0.25em] font-bold uppercase text-neutral-600 hover:text-neutral-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <Leaf size={10} />
                    <span>Continue with Eco Bag</span>
                  </button>

                  <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-800 text-center leading-relaxed mt-1">
                    Second Life Box packaging is 100% sustainable. <br />
                    Your choice. Your signal.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default PackagingUpsellBanner;
