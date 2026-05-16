import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Activity, ArrowRight, UserPlus, XCircle, Clock, AlertCircle } from 'lucide-react';
import ShareSignal from '../components/ShareSignal';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

interface OrderStatus {
  id: string;
  status: string;
  total: string;
  currency: string;
}

const OrderSuccess: React.FC = () => {
  const { orderId: fullOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cartCleared = useRef(false);
  
  // Extract original order ID if suffix exists (e.g. 123_1715535555 -> 123)
  const orderId = fullOrderId?.split('_')[0];
  const signalId = searchParams.get('signal');

  useEffect(() => {
    let pollTimer: any;
    let timeoutTimer: any;
    let currentInterval = 5000; // Start with 5 seconds
    const maxPollTime = 300000; // Stop after 5 minutes (300 seconds)
    const startTime = Date.now();

    if (orderId && signalId) {
      const resolvedOrderId = orderId;
      const resolvedSignalId = signalId;
      const resolvedTransactionId = fullOrderId;

      const verifyOrder = async () => {
        try {
          const params = new URLSearchParams({ signal: resolvedSignalId });
          if (resolvedTransactionId) params.set('transaction', resolvedTransactionId);
          const response = await fetch(`/api/orders/status/${resolvedOrderId}?${params.toString()}`);
          if (!response.ok) throw new Error("Signal verification failed");
          
          const data = await response.json();
          setOrderInfo(data);
          
          // Terminal states - stop polling
          const terminalStates = ['processing', 'completed', 'failed', 'cancelled', 'refunded'];
          if (terminalStates.includes(data.status)) {
            return true; // Stop
          }
          return false; // Continue
        } catch (err) {
          console.error("Verification error:", err);
          return true; // Stop on error to prevent infinite loops
        }
      };

      const poll = async () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxPollTime) {
          console.log("[CHILS & CO.] Polling timed out after 5 minutes.");
          setLoading(false);
          return;
        }

        const shouldStop = await verifyOrder();
        setLoading(false);

        if (!shouldStop) {
          // Exponential backoff: increase interval by 1.5x until max 30s
          currentInterval = Math.min(currentInterval * 1.5, 30000);
          pollTimer = setTimeout(poll, currentInterval);
        }
      };

      poll();
    } else {
      setLoading(false);
      setError("Incomplete transmission data.");
    }

    return () => {
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [orderId, signalId, fullOrderId]);

  useEffect(() => {
    if (!cartCleared.current && orderInfo && ['processing', 'completed'].includes(orderInfo.status)) {
      cartCleared.current = true;
      clearCart();
    }
  }, [orderInfo?.status, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full mx-auto"
          />
          <p className="text-[10px] tracking-[0.5em] text-accent uppercase animate-pulse">Verifying Transmission...</p>
        </div>
      </div>
    );
  }

  const isSuccessful = orderInfo ? ['processing', 'completed'].includes(orderInfo.status) : false;
  const isPending = orderInfo ? ['pending', 'on-hold'].includes(orderInfo.status) : false;
  const isFailed = orderInfo ? ['failed', 'cancelled', 'refunded'].includes(orderInfo.status) : false;

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
            className={isFailed ? "text-red-500" : isPending ? "text-amber-500" : "text-accent"}
          >
            {isFailed ? <XCircle size={64} strokeWidth={1} /> : isPending ? <Clock size={64} strokeWidth={1} /> : <CheckCircle2 size={64} strokeWidth={1} />}
          </motion.div>
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">
                {isFailed ? "Transmission Interrupted" : isPending ? "Awaiting Verification" : isSuccessful ? "Transmission Confirmed" : "Signal Synchronizing"}
              </p>
              <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter uppercase">
                {isFailed ? "Payment Failed" : isPending ? "Payment Pending" : isSuccessful ? "Order Confirmed" : "Processing..."}
              </h1>
            </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 p-8 md:p-12 space-y-12 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-neutral-900 pb-12">
            <div>
              <p className="text-[9px] tracking-[0.3em] text-accent uppercase font-bold mb-2">Signal Generated</p>
              <p className="font-mono text-3xl tracking-tighter uppercase">{signalId || 'UNKNOWN'}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2 italic">
                {isFailed 
                  ? "\"This transmission encountered a critical failure.\"" 
                  : isPending 
                    ? "\"This signal is awaiting payment confirmation.\""
                    : "\"This signal represents your order within the system.\""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase mb-2">System Status</p>
              <div className={`flex items-center gap-3 justify-end ${isFailed ? "text-red-500" : isPending ? "text-amber-500" : "text-accent"}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)] ${isFailed ? "bg-red-500" : isPending ? "bg-amber-500" : "bg-accent"}`} />
                <p className="text-[11px] font-bold uppercase tracking-widest">
                  {isFailed ? "Critical Error" : isPending ? "Paused Pulse" : "Active Pulse"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest leading-relaxed">
              {isFailed 
                ? "The payment for your order could not be processed. Please check your bank details or try again."
                : isPending
                  ? "We are currently awaiting confirmation from the payment gateway. Your order will process once verified."
                  : "Your build is in progress. The archive is now processing the physical manifestation of this transmission."}
            </p>
          </div>

          {isFailed && (
            <div className="pt-8 border-t border-neutral-900">
               <div className="bg-red-500/5 border border-red-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4">
                  <AlertCircle className="text-red-500" size={24} />
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest mb-1 text-red-500">Action Required</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Return to checkout to try another payment method.</p>
                  </div>
                </div>
                <Link 
                  to="/checkout" 
                  className="bg-red-500 text-white px-8 py-3 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  Retry Payment <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {!user && isSuccessful && (
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

          {isSuccessful && (
            <div className="pt-8 border-t border-neutral-900">
              <p className="text-[10px] text-neutral-500 text-center uppercase tracking-[0.3em] mb-8">Share Signal Origin</p>
              <ShareSignal 
                productName="Chils & Co Signal"
                productUrl={window.location.origin}
                isOrderSuccess={true}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {isSuccessful && (
            <a 
              href={`https://api.chilsandco.com/wp-admin/admin-ajax.php?print-order=${orderId}&print-order-type=invoice&action=print_order`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-12 py-5 border border-accent text-[11px] tracking-[0.3em] font-bold uppercase bg-accent/5 text-accent hover:bg-accent hover:text-black transition-all"
            >
              Download Invoice
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </a>
          )}
          <Link 
            to={isSuccessful ? "/console/orders" : "/"} 
            className="group flex items-center justify-center gap-3 px-12 py-5 border border-white text-[11px] tracking-[0.3em] font-bold uppercase bg-white text-black hover:bg-accent hover:border-accent transition-all"
          >
            {isSuccessful ? "Monitor Signals" : "Return Home"}
            <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
