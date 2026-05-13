import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, ShieldCheck, Zap, Globe } from 'lucide-react';

interface CheckoutInterstitialProps {
  isVisible: boolean;
  message?: string;
}

const CheckoutInterstitial: React.FC<CheckoutInterstitialProps> = ({ isVisible, message = "Confirming Signal..." }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
        >
          {/* Background Grid Accent */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(197, 102, 70, 0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px' 
            }} />
          </div>

          <div className="relative z-10 max-w-md w-full text-center">
            {/* Main Icon Animation */}
            <div className="relative mb-12 flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border border-accent/20 rounded-full flex items-center justify-center"
              >
                <div className="w-24 h-24 border border-accent/40 rounded-full flex items-center justify-center">
                   <div className="w-16 h-16 border border-accent/60 rounded-full flex items-center justify-center">
                      <Share2 className="text-accent" size={24} />
                   </div>
                </div>
              </motion.div>
              
              {/* Pulsing Ring */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-accent/5"
              />
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-display font-medium uppercase tracking-tighter text-white mb-4"
            >
              {message}
            </motion.h2>

            <div className="space-y-4">
              <div className="h-[1px] w-full bg-neutral-900 overflow-hidden relative">
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-accent w-1/3"
                />
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <ShieldCheck size={16} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">Encrypted</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Zap size={16} className="text-accent" />
                    <motion.div 
                        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-accent rounded-full -z-10"
                    />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-accent">Active Port</span>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <Globe size={16} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">Handoff</span>
                </div>
              </div>
            </div>

            <div className="mt-16 font-mono text-[9px] text-neutral-600 uppercase tracking-widest flex flex-col gap-1">
              <p>Routing Protocol Alpha-7</p>
              <p>Establishing Secure WooCommerce Link...</p>
              <p>Initializing PhonePe Hermes Gateway...</p>
            </div>
          </div>

          {/* Luxury Corner Accents */}
          <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-white/10" />
          <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-white/10" />
          <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-white/10" />
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-white/10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutInterstitial;
