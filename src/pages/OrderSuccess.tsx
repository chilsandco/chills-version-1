import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import ShareSignal from '../components/ShareSignal';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams();
  
  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto min-h-screen flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full text-center space-y-12"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-accent"
          >
            <CheckCircle2 size={64} strokeWidth={1} />
          </motion.div>
          <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">Transmission Confirmed</p>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter uppercase">Signal Deployed</h1>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 p-8 md:p-12 space-y-8 text-left">
          <div className="flex justify-between items-start border-b border-neutral-900 pb-8">
            <div>
              <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase mb-2">Order Assignment</p>
              <p className="font-mono text-sm tracking-widest uppercase">#{orderId || 'SGL-882-X9'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase mb-2">Status</p>
              <div className="flex items-center gap-2 text-accent">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Processing</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <Package className="text-neutral-700" size={20} />
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest">Preparation in Progress</p>
                <p className="text-[11px] text-neutral-500 leading-relaxed uppercase tracking-wider italic">
                  "Your signal is not selected. It is assigned."
                </p>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest leading-relaxed">
                  The system is currently embedding your unique output. Details will be decoded on arrival.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900">
            <p className="text-[10px] text-neutral-500 text-center uppercase tracking-[0.3em] mb-8">Broadcast Your Signal</p>
            <ShareSignal 
              productName="Chils & Co. Signal"
              productUrl={window.location.origin}
              isOrderSuccess={true}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <Link 
            to="/collection" 
            className="group flex items-center justify-center gap-3 px-12 py-5 border border-neutral-800 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Continue Exploring
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link 
            to="/" 
            className="flex items-center justify-center gap-3 px-12 py-5 text-[11px] tracking-[0.3em] font-bold uppercase text-neutral-500 hover:text-white transition-all"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
