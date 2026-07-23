import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Box, MapPin, CreditCard, ChevronLeft, Package, Sparkles, ShieldAlert, RefreshCcw, CheckCircle2, User } from 'lucide-react';
import { Signal } from '../types';
import { useAuth } from '../AuthContext';

const SignalDetails: React.FC = () => {
  const { id } = useParams();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const pollStart = React.useRef(Date.now());

  useEffect(() => {
    let pollTimer: any;
    const fetchSignal = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setSignal(data);

        // Polling logic: if pending or on-hold, poll again in 10s
        if (data.status === 'pending' || data.status === 'on-hold') {
          const elapsed = Date.now() - pollStart.current;
          if (elapsed < 300000) { // 5 minutes
            pollTimer = setTimeout(fetchSignal, 10000);
          }
        }
      } catch (err) {
        console.error("Failed to fetch signal details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
    return () => {
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="pt-28 md:pt-32 pb-24 px-6 md:px-12 flex items-center justify-center min-h-screen">
        <Activity className="animate-pulse text-accent" size={32} />
      </div>
    );
  }

  if (!signal) return null;

  const isRefunded = signal.status === 'refunded';
  const isFailed = ['failed', 'cancelled', 'refunded'].includes(signal.status);
  const isPending = ['pending', 'on-hold'].includes(signal.status);
  const isSuccessful = ['processing', 'completed', 'shipping', 'delivered'].includes(signal.status);

  const steps = [
    { 
      label: signal.status === 'failed' 
        ? "Order Failed" 
        : signal.status === 'cancelled' 
          ? "Order Cancelled" 
          : "Order Received", 
      status: ['failed', 'cancelled'].includes(signal.status) ? 'failed' : 'completed' 
    },
    { label: "Processing", status: (signal.status === 'processing' || signal.status === 'completed' || isRefunded) ? 'completed' : 'pending' },
    { label: "Dispatched", status: (signal.status === 'shipping' || !!signal.shipping?.awb || signal.status === 'completed' || isRefunded) ? 'completed' : 'pending' },
    { label: "Delivered", status: (signal.status === 'completed' || isRefunded) ? 'completed' : 'pending' },
  ];

  return (
    <div className="pt-36 md:pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen">
      <Link 
        to="/console/orders" 
        className="inline-flex items-center gap-2 group mb-12 text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Archive
      </Link>

      <header className="mb-16">
        <div className="flex justify-between items-end gap-8 flex-wrap">
          <div>
            <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase mb-3">
              {isFailed ? 'Transmission Interrupted' : isPending ? 'Transmission Pending' : 'Order Confirmation'}
            </p>
            <h1 className="text-5xl font-display font-bold tracking-tighter uppercase mb-4">
              {isRefunded ? 'Refund Complete' : isFailed ? 'Order Terminated' : 'Order Details'}
            </h1>
            <div className="flex items-center gap-4">
              <p className={`font-mono text-xl tracking-tighter ${['failed', 'cancelled', 'refunded'].includes(signal.status) ? 'text-red-500' : 'text-accent'}`}>#{signal.signalId}</p>
              <span className="w-1 h-1 rounded-full bg-neutral-800" />
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
                Date: {new Date(signal.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-6 py-4 border rounded-sm ${['failed', 'cancelled', 'refunded'].includes(signal.status) ? 'bg-red-500/5 border-red-500/20' : 'bg-neutral-950 border-neutral-900'}`}>
              <p className={`text-[8px] tracking-[0.3em] uppercase mb-1 ${['failed', 'cancelled', 'refunded'].includes(signal.status) ? 'text-red-500/50' : 'text-neutral-600'}`}>Status</p>
              <p className={`text-[11px] font-bold uppercase tracking-widest ${['failed', 'cancelled', 'refunded'].includes(signal.status) ? 'text-red-500' : ''}`}>
                {signal.status === 'refunded' ? '✅ Refunded' : signal.status === 'failed' ? '❌ Failed' : signal.status === 'cancelled' ? '🚫 Cancelled' : signal.status}
              </p>
            </div>
          </div>
      </div>
    </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {isRefunded && (
             <motion.section 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white/5 border border-white/10 p-10 md:p-14"
             >
               <div className="flex flex-col md:flex-row gap-10">
                 <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} className="text-black" />
                 </div>
                 <div className="flex-grow">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent mb-6 italic">This piece has completed its cycle with you.</h3>
                    
                    <div className="space-y-6 text-[13px] text-white/70 leading-relaxed font-light mb-10">
                      <p>Your refund has been successfully processed. The value has been returned to your original payment method. Depending on your bank, it may take 3–7 business days to reflect in your account.</p>
                      <p className="italic">We appreciate you experiencing Chils & Co — every product is built with intention, and your support means a lot to us.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y border-white/5">
                      <div>
                        <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1 font-bold">Amount Refunded</p>
                        <p className="text-lg font-display font-bold text-red-500">₹{signal.total.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1 font-bold">Status</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-green-500">Success</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                      <Link to="/collection" className="bg-white text-black px-8 py-3 text-[10px] tracking-widest font-bold uppercase hover:bg-accent transition-colors">Shop Again</Link>
                      <a href="mailto:chilsandco@gmail.com" className="border border-white/10 px-8 py-3 text-[10px] tracking-widest font-bold uppercase hover:border-white transition-colors text-center inline-block">Support</a>
                    </div>
                 </div>
               </div>
             </motion.section>
          )}

          {['failed', 'cancelled'].includes(signal.status) ? (
            <section className="bg-red-500/5 border border-red-500/20 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-red-500">
                <ShieldAlert size={120} />
              </div>
              <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-8 flex items-center gap-3 text-red-500">
                <ShieldAlert size={16} />
                Transaction Terminated
              </h2>
              <div className="space-y-4 max-w-lg relative z-10">
                <p className="text-[13px] font-medium text-white leading-relaxed">
                  {signal.status === 'failed' 
                    ? "The payment for this order could not be authenticated. The checkout flow has been interrupted."
                    : "This order has been cancelled."}
                </p>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                  If any amount was deducted from your account, it will automatically revert within 3-5 business days. You can initiate a new order from our archive collection.
                </p>
              </div>
              <div className="flex gap-4 mt-8 relative z-10">
                <Link to="/collection" className="bg-white text-black px-6 py-3 text-[10px] tracking-widest font-bold uppercase hover:bg-accent transition-colors">
                  Create New Order
                </Link>
                <a href="mailto:chilsandco@gmail.com" className="border border-white/10 px-6 py-3 text-[10px] tracking-widest font-bold uppercase hover:border-white transition-colors text-center inline-block">
                  Support Protocol
                </a>
              </div>
            </section>
          ) : (
            <section className="bg-neutral-950 border border-neutral-900 p-8">
              <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-12 flex items-center gap-3">
                <Activity size={14} className={isRefunded ? 'text-white/20' : 'text-accent'} />
                Order Status
              </h2>
              
              <div className="relative pl-8 space-y-12">
                <div className="absolute left-[3px] top-1 bottom-1 w-[1px] bg-neutral-900" />
                {steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[32px] top-1 w-2.5 h-2.5 rounded-full border border-black ${
                      step.status === 'completed' 
                        ? (isRefunded ? 'bg-white/10' : 'bg-accent') 
                        : step.status === 'failed' 
                          ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                          : 'bg-neutral-800'
                    }`} />
                    <div>
                      <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${
                        step.status === 'completed' 
                          ? 'text-white/40' 
                          : step.status === 'failed' 
                            ? 'text-red-500' 
                            : 'text-neutral-600'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
                {isRefunded && (
                  <div className="relative">
                    <div className="absolute -left-[32px] top-1 w-2.5 h-2.5 rounded-full border border-black bg-red-500" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-1 text-red-500">Refunded</p>
                      <p className="text-[9px] text-red-500/50 uppercase tracking-widest italic">Recoupment successful</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-8 flex items-center gap-3">
              <Box size={14} className="text-accent" />
              Order Summary
            </h3>
            <div className="space-y-6">
              {signal.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-6 border-b border-neutral-900 last:border-0 last:pb-0">
                  <div className="flex items-center gap-6">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className={`w-16 h-20 object-cover flex-shrink-0 ${isRefunded ? 'grayscale opacity-10' : 'bg-neutral-900'}`} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-neutral-700" />
                      </div>
                    )}
                    <div>
                      <Link 
                        to={`/product/${item.productId}`}
                        className={`text-[11px] font-bold uppercase tracking-widest mb-1 transition-colors block ${isRefunded ? 'text-white/40' : 'hover:text-accent'}`}
                      >
                        {item.name}
                      </Link>
                      <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className={`font-mono text-xs ${isRefunded ? 'line-through text-white/20' : ''}`}>₹{item.total.toLocaleString()}</p>
                </div>
              ))}
              <div className="pt-6 flex justify-between items-center bg-neutral-900/10 -mx-8 px-8 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Order Total</p>
                <p className={`text-lg font-display font-bold tracking-tighter ${isRefunded ? 'text-white/40' : ''}`}>₹{signal.total.toLocaleString()}</p>
              </div>

              {!isRefunded && signal.status === 'completed' && (
                <div className="pt-4 border-t border-white/5">
                  {(() => {
                    const now = new Date();
                    const deliveryDate = signal.dateCompleted ? new Date(signal.dateCompleted) : new Date(signal.date);
                    const diffHours = (now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60);
                    const isWindowActive = diffHours <= 168;

                    if (isWindowActive) {
                      return (
                        <Link 
                          to={`/console/orders/${signal.id}/return`}
                          className="w-full bg-white/5 border border-white/10 text-white p-4 uppercase hover:bg-accent hover:border-accent hover:text-black transition-all flex flex-col items-center justify-center gap-1 group"
                        >
                          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] font-bold uppercase">
                            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                            Initiate Reversal
                          </div>
                          <span className="text-[9px] tracking-widest opacity-40 font-medium italic">Request a return for this order</span>
                        </Link>
                      );
                    } else {
                      return (
                        <div className="w-full bg-neutral-900/10 border border-neutral-900/20 text-neutral-600 p-4 text-[9px] tracking-[0.2em] font-bold uppercase flex items-center justify-center gap-2 cursor-not-allowed">
                          <ShieldAlert size={12} className="opacity-30" />
                          Authorized Return window closed (7 days)
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </section>

          <section className="bg-accent/5 border border-accent/20 p-8 relative overflow-hidden group">
            <Sparkles className="absolute -right-4 -top-4 text-accent/10 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Package size={18} className="text-accent" />
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Packaging Unit</h3>
              </div>
              <p className="text-[13px] font-medium leading-relaxed mb-3">
                This shipment includes a reusable packaging unit.
              </p>
              <p className="text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed mb-6">
                Connect it to your space. Convert it into a storage module for socks or stationery.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border border-neutral-800 rounded-full">
                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                <p className="text-[8px] tracking-[0.3em] text-neutral-400 uppercase">Secondary function enabled</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {signal.shipping.awb && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-950 border border-accent/20 p-8 relative overflow-hidden group shadow-[0_0_25px_rgba(212,175,55,0.02)]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-2xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors duration-1000" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase text-accent">Logistics Terminal</h3>
              </div>
              
              <div className="space-y-5 relative z-10">
                <div>
                  <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Carrier Protocol</span>
                  <p className="text-xs uppercase font-bold tracking-widest text-white">{signal.shipping.courier || 'Verified partner'}</p>
                </div>
                
                <div>
                  <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Relay AWB</span>
                  <a 
                    href={signal.shipping.trackingUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-mono text-[13px] tracking-widest text-white hover:text-accent transition-colors flex items-center gap-1.5 decoration-neutral-800 underline underline-offset-4 decoration-dotted hover:decoration-accent"
                  >
                    #{signal.shipping.awb}
                    <span className="text-[9px] text-neutral-500 font-sans">↗</span>
                  </a>
                </div>

                <div>
                  <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Logistics Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[11px] uppercase font-bold tracking-widest text-green-400">{signal.shipping.trackingStatus || 'Dispatched'}</p>
                  </div>
                </div>

                {signal.shipping.etd && (
                  <div className="pt-4 border-t border-neutral-900">
                    <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Estimated Delivery</span>
                    <p className="text-[11px] uppercase font-bold tracking-widest text-neutral-400 font-mono">
                      {new Date(signal.shipping.etd as string).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={14} className="text-accent" />
              <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Destination</h3>
            </div>
            <p className="text-[12px] font-medium leading-relaxed mb-4">{signal.shipping.address}</p>
            <div className="pt-4 border-t border-neutral-900">
              <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1">Method</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">{signal.shipping.method}</p>
            </div>
          </section>

          {signal.billing && (signal.billing.email || signal.billing.phone) && (
            <section className="bg-neutral-950 border border-neutral-900 p-8">
              <div className="flex items-center gap-3 mb-6">
                <User size={14} className="text-accent" />
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Contact Node</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Full Identity</span>
                  <p className="text-xs uppercase font-bold tracking-widest text-white">
                    {signal.billing.first_name} {signal.billing.last_name}
                  </p>
                </div>
                {signal.billing.email && (
                  <div>
                    <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Transmission Mail</span>
                    <p className="text-xs font-mono tracking-wider text-neutral-400">{signal.billing.email}</p>
                  </div>
                )}
                {signal.billing.phone && (
                  <div>
                    <span className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1 block">Telemetry Contact</span>
                    <p className="text-xs font-mono tracking-widest text-neutral-400">{signal.billing.phone}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-neutral-900">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest leading-relaxed mb-3 italic">
                    These contact parameters were registered at checkout for this transmission.
                  </p>
                  <Link 
                    to="/auth"
                    className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-accent hover:text-white transition-colors"
                  >
                    Update Node Identity ↗
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={14} className="text-accent" />
              <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Payment</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${
                (isSuccessful || isRefunded) 
                  ? 'bg-green-500' 
                  : ['failed', 'cancelled'].includes(signal.status) 
                    ? 'bg-red-500' 
                    : 'bg-amber-500 animate-pulse'
              }`} />
              <p className="text-[11px] font-bold uppercase tracking-widest">
                {(isSuccessful || isRefunded) ? 'Authenticated' : ['failed', 'cancelled'].includes(signal.status) ? 'Failed' : 'Pending'}
              </p>
            </div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed italic">
              {(isSuccessful || isRefunded)
                ? 'Payment was registered successfully.' 
                : ['failed', 'cancelled'].includes(signal.status) 
                  ? 'Payment was unsuccessful or cancelled.' 
                  : 'Awaiting payment confirmation from gateway.'}
            </p>
          </section>

          <div className="p-8 border border-neutral-900 text-center">
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] leading-relaxed">
              Need assistance?<br/>
              <a href="mailto:chilsandco@gmail.com" className="text-white hover:text-accent transition-colors mt-2 block">Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalDetails;
