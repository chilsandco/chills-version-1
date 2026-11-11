import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutInterstitialProps {
  isVisible: boolean;
  message?: string;
}

/** Shown for the moment between pressing Pay and arriving at PhonePe. */
const CheckoutInterstitial: React.FC<CheckoutInterstitialProps> = ({ isVisible, message = 'Confirming your order' }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        role="status"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] seamless text-ink flex flex-col items-center justify-center px-6 text-center"
      >
        <p className="wordmark tracking-[0.25em] text-lg">CHILS &amp; CO.</p>
        <p className="text-2xl md:text-3xl font-semibold mt-8">{message}</p>
        <div className="mt-7 h-px w-48 bg-black/15 overflow-hidden relative">
          <motion.span animate={{ x: ['-100%', '300%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-y-0 left-0 w-1/3 bg-ink" />
        </div>
        <p className="text-sm text-stone mt-5">Please don't close this page.</p>
      </motion.div>
    )}
  </AnimatePresence>
);

export default CheckoutInterstitial;
