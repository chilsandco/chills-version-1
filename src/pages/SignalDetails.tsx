import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Box, MapPin, CreditCard, ChevronLeft, Package, Sparkles } from 'lucide-react';
import { Signal } from '../types';
import { useAuth } from '../AuthContext';

const SignalDetails: React.FC = () => {
  const { id } = useParams();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
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
      } catch (err) {
        console.error("Failed to fetch signal details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [id, token]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 flex items-center justify-center min-h-screen">
        <Activity className="animate-pulse text-accent" size={32} />
      </div>
    );
  }

  if (!signal) return null;

  const steps = [
    { label: "Signal Received", status: "completed" },
    { label: "Processing", status: signal.status === 'processing' || signal.status === 'completed' ? 'completed' : 'pending' },
    { label: "Dispatched", status: signal.status === 'shipping' || signal.status === 'completed' ? 'completed' : 'pending' },
    { label: "Delivered", status: signal.status === 'completed' ? 'completed' : 'pending' },
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen">
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
            <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase mb-3">System Output</p>
            <h1 className="text-5xl font-display font-bold tracking-tighter uppercase mb-4">Signal Details</h1>
            <div className="flex items-center gap-4">
              <p className="font-mono text-xl tracking-tighter text-accent">#{signal.signalId}</p>
              <span className="w-1 h-1 rounded-full bg-neutral-800" />
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest uppercase">
                Registered: {new Date(signal.date).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 px-6 py-4 rounded-sm">
            <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1">Current State</p>
            <p className="text-[11px] font-bold uppercase tracking-widest">{signal.status}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Status Timeline */}
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-12 flex items-center gap-3">
              <Activity size={14} className="text-accent" />
              Propagation Status
            </h2>
            
            <div className="relative pl-8 space-y-12">
              <div className="absolute left-[3px] top-1 bottom-1 w-[1px] bg-neutral-900" />
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[32px] top-1 w-2.5 h-2.5 rounded-full border border-black ${step.status === 'completed' ? 'bg-accent' : 'bg-neutral-800'}`} />
                  <div>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${step.status === 'completed' ? 'text-white' : 'text-neutral-600'}`}>
                      {step.label}
                    </p>
                    {step.status === 'completed' && (
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest italic">
                        &gt; {idx === 0 ? "Initial transmission detected" : "System checkpoint verified"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Products */}
          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-8 flex items-center gap-3">
              <Box size={14} className="text-accent" />
              Transmission Content
            </h3>
            <div className="space-y-6">
              {signal.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-6 border-b border-neutral-900 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">{item.name}</h4>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-mono text-xs">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
              <div className="pt-6 flex justify-between items-center bg-neutral-900/30 -mx-8 px-8">
                <p className="text-[10px] font-bold uppercase tracking-widest">Signal Value</p>
                <p className="text-lg font-display font-bold tracking-tighter">₹{signal.total.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Packaging Module */}
          <section className="bg-accent/5 border border-accent/20 p-8 relative overflow-hidden group">
            <Sparkles className="absolute -right-4 -top-4 text-accent/10 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Package size={18} className="text-accent" />
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Packaging Module</h3>
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

        {/* Sidebar info */}
        <div className="space-y-8">
          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={14} className="text-accent" />
              <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Destination</h3>
            </div>
            <p className="text-[12px] font-medium leading-relaxed mb-4">{signal.shipping.address}</p>
            <div className="pt-4 border-t border-neutral-900">
              <p className="text-[8px] tracking-[0.3em] text-neutral-600 uppercase mb-1">Logistics Protocol</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">{signal.shipping.method}</p>
            </div>
          </section>

          <section className="bg-neutral-950 border border-neutral-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={14} className="text-accent" />
              <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase">Payment</h3>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest">Authenticated</p>
            </div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed italic">
              "The cost of the build was registered in the ledger successfully."
            </p>
          </section>

          <div className="p-8 border border-neutral-900 text-center">
            <p className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] leading-relaxed">
              Need assistance with this signal?<br/>
              <span className="text-white hover:text-accent cursor-pointer transition-colors mt-2 block">Contact System Admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalDetails;
