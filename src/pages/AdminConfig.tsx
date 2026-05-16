import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, AlertCircle, CheckCircle2, ArrowLeft, Phone, MapPin, Mail, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AdminConfig: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [settings, setSettings] = useState({
    mobileLink: "",
    address: "",
    coordinates: "",
    email: ""
  });

  const adminEmails = ['chilsandco@gmail.com', 'chilsandco.com@gmail.com', 'chilsandco.com@gmail.com'];
  const isAdmin = user && adminEmails.some(email => email.toLowerCase() === user.email.toLowerCase());

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      return;
    }

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch settings:", err);
        setLoading(false);
      });
  }, [user, isAdmin, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error("Failed to update system nodes.");
      
      setMessage({ type: 'success', text: 'System configuration recalibrated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Calibration failure detected.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/console/bespoke" className="inline-flex items-center gap-2 text-neutral-500 hover:text-accent transition-colors mb-12 uppercase text-[10px] font-bold tracking-widest">
          <ArrowLeft size={14} /> Back to Console
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
            <Navigation className="text-accent" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tighter uppercase">System Coordinates</h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] mt-1 font-bold">Global Node Reconfiguration</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 bg-neutral-950 border border-neutral-900">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                  <Phone size={12} className="text-accent" /> Voice Link (Mobile)
                </label>
                <input 
                  type="text" 
                  value={settings.mobileLink}
                  onChange={e => setSettings({...settings, mobileLink: e.target.value})}
                  placeholder="+91 0000 00 0000"
                  className="w-full bg-black border border-neutral-900 p-4 font-mono text-sm focus:border-accent outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                  <Mail size={12} className="text-accent" /> Electronic Mail
                </label>
                <input 
                  type="email" 
                  value={settings.email}
                  onChange={e => setSettings({...settings, email: e.target.value})}
                  placeholder="hello.chilsandco@gmail.com"
                  className="w-full bg-black border border-neutral-900 p-4 font-mono text-sm focus:border-accent outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                  <Navigation size={12} className="text-accent" /> GPS Coordinates
                </label>
                <input 
                  type="text" 
                  value={settings.coordinates}
                  onChange={e => setSettings({...settings, coordinates: e.target.value})}
                  placeholder="17.4948, 78.3444"
                  className="w-full bg-black border border-neutral-900 p-4 font-mono text-sm focus:border-accent outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 h-full">
                <label className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                  <MapPin size={12} className="text-accent" /> Physical Topology (Address)
                </label>
                <textarea 
                  value={settings.address}
                  onChange={e => setSettings({...settings, address: e.target.value})}
                  rows={8}
                  placeholder="Street\nCity\nState - Zip"
                  className="w-full bg-black border border-neutral-900 p-4 font-mono text-sm focus:border-accent outline-none resize-none h-full"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 pt-6 border-t border-neutral-900">
            <div className="flex-grow">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-4 ${message.type === 'success' ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{message.text}</span>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-12 py-5 bg-white text-black font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-accent transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Transmitting...' : 'Commit Changes'}
            </button>
          </div>
        </form>

        <div className="mt-24 p-8 border border-neutral-900 bg-neutral-950/20">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-500 mb-4 italic">Security Protocol</h3>
          <p className="text-[10px] text-neutral-700 leading-relaxed uppercase tracking-widest">
            These changes are global. Modifications will reflect across Support, Shipping, Onboarding, and Footer components instantly. 
            Authorization Level: System Administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
