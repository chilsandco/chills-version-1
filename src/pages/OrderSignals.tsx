import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Activity, Clock, Box, Package } from 'lucide-react';
import { Signal } from '../types';
import { useAuth } from '../AuthContext';

const OrderSignals: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchSignals = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSignals(data);
        }
      } catch (err) {
        console.error("Failed to fetch signals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, [token]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-pulse text-accent" size={32} />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Retrieving system signals...</p>
        </div>
      </div>
    );
  }

  if (!user && signals.length === 0) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-4xl font-display font-bold mb-8 uppercase tracking-tighter">No Active Signals</h1>
        <p className="text-neutral-500 uppercase text-[10px] tracking-widest mb-12 max-w-sm">No transmissions detected from this origin.</p>
        <Link 
          to="/auth" 
          className="bg-white text-black px-12 py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors"
        >
          Identify with System
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-accent" size={16} />
          <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">Archive Logs</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-4">Order Signals</h1>
        <p className="text-neutral-500 uppercase text-[10px] tracking-widest max-w-xl">
          Complete log of all registered transmissions and system outputs.
        </p>
      </header>

      <div className="space-y-[1px] bg-neutral-900 border border-neutral-900">
        {signals.map((signal, idx) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group block"
          >
            <div className="flex flex-col md:flex-row md:items-stretch bg-black border-b border-neutral-900 last:border-0 hover:bg-neutral-950 transition-all">
              {/* Left Column: Metadata */}
              <Link 
                to={`/console/orders/${signal.id}`}
                className="flex-1 flex flex-col md:flex-row md:items-center justify-between p-8 gap-8"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
                  <div className="w-40">
                    <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-2">Signal Identity</p>
                    <p className="font-mono text-sm tracking-widest group-hover:text-accent transition-colors">#{signal.signalId}</p>
                  </div>
                  
                  <div className="w-32">
                    <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-2">Registration</p>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-neutral-700" />
                      <p className="text-[10px] uppercase font-bold tracking-widest">
                        {new Date(signal.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="w-24">
                    <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${signal.status === 'completed' ? 'bg-green-500' : 'bg-accent animate-pulse'}`} />
                      <p className="text-[10px] uppercase font-bold tracking-widest">{signal.status}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:gap-12">
                  <div className="text-right">
                    <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-2">Output Value</p>
                    <p className="font-mono text-sm tracking-widest uppercase">₹{signal.total.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </Link>

              {/* Right Column: Build Contents (Images & Names) */}
              <div className="md:w-1/3 bg-neutral-900/10 p-8 border-l border-neutral-900 flex flex-col justify-center">
                <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-4">Transmission Content</p>
                <div className="space-y-4">
                  {signal.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-16 object-cover bg-neutral-900 flex-shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-neutral-700" />
                        </div>
                      )}
                      <div>
                        <Link 
                          to={`/product/${item.productId}`}
                          className="text-[10px] uppercase font-bold tracking-widest hover:text-accent transition-colors block leading-tight mb-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {signal.items.length === 0 && (
                    <p className="text-[9px] text-neutral-600 uppercase italic">Signal metadata only</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {signals.length === 0 && !loading && (
        <div className="py-24 text-center border border-dashed border-neutral-800">
          <Box className="mx-auto mb-4 text-neutral-800" size={32} />
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] italic">"The system is currently quiet. No signals found."</p>
        </div>
      )}
    </div>
  );
};

export default OrderSignals;
