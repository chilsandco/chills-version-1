import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Activity, ArrowRight, UserPlus } from 'lucide-react';
import ShareSignal from '../components/ShareSignal';
import { useAuth } from '../AuthContext';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const signalId = searchParams.get('signal') || `#CHLS-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return (
    <div className="pt-36 md:pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto min-h-screen flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full text-center space-y-12"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-accent"
          >
            <CheckCircle2 size={64} strokeWidth={1} />
          </motion.div>
          <div className="space-y-1">
            <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">Transmission Confirmed</p>
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter uppercase">Order Confirmed</h1>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 p-8 md:p-12 space-y-12 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-neutral-900 pb-12">
            <div>
              <p className="text-[9px] tracking-[0.3em] text-accent uppercase font-bold mb-2">Signal Generated</p>
              <p className="font-mono text-3xl tracking-tighter uppercase">{signalId}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2 italic">
                "This signal represents your order within the system."
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase mb-2">System Status</p>
              <div className="flex items-center gap-3 text-accent justify-end">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                <p className="text-[11px] font-bold uppercase tracking-widest">Active Pulse</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest leading-relaxed">
              Your build is in progress. The archive is now processing the physical manifestation of this transmission.
            </p>
          </div>

          {!user && (
            <div className="pt-8 border-t border-neutral-900">
              <div className="bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4">
                  <UserPlus className="text-accent" size={24} />
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1">Save this signal?</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Identify with the system to track your build logs anytime.</p>
                  </div>
                </div>
                <Link 
                  to="/auth" 
                  className="bg-white text-black px-8 py-3 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-accent transition-colors flex items-center gap-2"
                >
                  Create Account <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-neutral-900">
            <p className="text-[10px] text-neutral-500 text-center uppercase tracking-[0.3em] mb-8">Share Signal Origin</p>
            <ShareSignal 
              productName="Chils & Co Signal"
              productUrl={window.location.origin}
              isOrderSuccess={true}
            />
          </div>
        </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a 
              href={`https://chilsandco-com-865405.hostingersite.com/wp-admin/admin-ajax.php?print-order=${orderId}&print-order-type=invoice&action=print_order`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-12 py-5 border border-accent text-[11px] tracking-[0.3em] font-bold uppercase bg-accent/5 text-accent hover:bg-accent hover:text-black transition-all"
            >
              Download Invoice
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </a>
            <Link 
              to="/console/orders" 
              className="group flex items-center justify-center gap-3 px-12 py-5 border border-white text-[11px] tracking-[0.3em] font-bold uppercase bg-white text-black hover:bg-accent hover:border-accent transition-all"
            >
              Monitor Signals
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
