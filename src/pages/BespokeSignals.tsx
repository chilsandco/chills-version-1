import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';
import { Activity, Clock, User, Mail, Shield } from 'lucide-react';

const BespokeSignals: React.FC = () => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchWaitlist = async () => {
      if (authLoading || !token) {
        if (!authLoading && !token) setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/bespoke/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setWaitlist(data);
        }
      } catch (err) {
        console.error("Failed to fetch bespoke signals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, [token, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-pulse text-accent" size={32} />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Scanning waitlist signals...</p>
        </div>
      </div>
    );
  }

  // Simplified "admin" check: if logged in user’s email matches current dev/admin profile
  const adminEmails = [
    'chilsandco.com@gmail.com', 
    'ud@gmail.com', 
    'ud.ai.kumar.dev@gmail.com',
    'chilsandco@gmail.com'
  ];
  const canAccess = user && adminEmails.includes(user.email);

  if (!canAccess) {
    return (
      <div className="pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center min-h-screen text-center bg-black">
        <Shield className="text-red-500 mb-8" size={48} />
        <h1 className="text-4xl font-display font-bold mb-4 uppercase tracking-tighter text-white">Access Denied</h1>
        <p className="text-neutral-500 uppercase text-[10px] tracking-widest max-w-sm mb-4">Insufficient clearance level for bespoke signals.</p>
        <p className="text-neutral-700 font-mono text-[9px] uppercase tracking-widest">Identified as: {user?.email || 'Unknown Entity'}</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen bg-black text-white">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-accent" size={16} />
          <p className="text-[10px] tracking-[0.5em] text-neutral-500 uppercase">System Intelligence</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-4">Bespoke Signals</h1>
        <p className="text-neutral-500 uppercase text-[10px] tracking-widest max-w-xl">
          List of engineers who have requested early access to the construction system.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {waitlist.map((customer, idx) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-8 border border-neutral-900 bg-neutral-950/50 hover:border-accent/40 transition-all group"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center rounded-sm">
                <User className="text-accent" size={20} />
              </div>
              <div className="text-right">
                <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1">Signal ID</p>
                <p className="font-mono text-[11px] text-accent">#B-{customer.id}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-2">Metadata / Email</p>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-neutral-700" />
                  <p className="text-sm font-medium tracking-tight text-white group-hover:text-accent transition-colors">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-neutral-900">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-neutral-700" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                    {new Date(customer.date_created).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Waitlisted</p>
              </div>
            </div>
          </motion.div>
        ))}

        {waitlist.length === 0 && (
          <div className="col-span-full py-32 text-center border border-dashed border-neutral-900">
            <Activity className="mx-auto mb-4 text-neutral-800" size={32} />
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] italic">"No signals detected in this cycle."</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BespokeSignals;
