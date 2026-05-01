import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, AlertCircle, LogOut, Package, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

import { Signal } from '../types';

const Orders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  if (loading) return <div className="text-[10px] text-white/40 tracking-widest uppercase">Retrieving transmissions...</div>;

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center border border-white/10 bg-white/5 rounded-sm">
        <Package className="mx-auto mb-3 opacity-20" size={32} />
        <p className="text-[10px] text-white/40 tracking-widest uppercase italic">"No signals detected in the archive."</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {orders.map((order) => (
        <Link 
          key={order.id} 
          to={`/console/orders/${order.id}`}
          className="block border border-white/10 bg-white/5 p-4 rounded-sm group hover:border-accent transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[8px] text-white/40 tracking-widest uppercase mb-1">Signal Identity</p>
              <p className="text-xs font-bold tracking-tight font-mono group-hover:text-accent transition-colors">#{order.signalId}</p>
            </div>
            <div className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest ${
              order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-accent/20 text-accent animate-pulse'
            }`}>
              {order.status}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] text-white/40 tracking-widest uppercase mb-1">Registration</p>
              <p className="text-xs text-white/60">
                {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            <p className="font-mono text-sm">₹{order.total.toLocaleString()}</p>
          </div>

          {/* Item Summary */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="w-8 h-10 border border-black bg-white/5 rounded-sm overflow-hidden relative">
                   {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <Package size={10} className="opacity-20" />
                     </div>
                   )}
                   {order.items.length > 3 && i === 2 && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[7px] font-bold">
                       +{order.items.length - 2}
                     </div>
                   )}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.1em] truncate flex-1">
              {order.items.map(i => i.name).join(' + ')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Auth: React.FC = () => {
  const { login: authLogin, user, logout, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        throw new Error('Server returned an invalid response format.');
      }

      if (!response.ok) {
        // Specific handling for known error codes or patterns
        if (data.message?.toLowerCase().includes('password') && data.message?.toLowerCase().includes('incorrect')) {
          throw new Error('Verification failed: The password provided is incorrect for this system identity.');
        }
        if (data.code === 'registration-error-email-exists') {
          throw new Error('Identity already exists: This email is already registered. Please sign in instead.');
        }
        throw new Error(data.message || 'Transmission error. Please verify your connection.');
      }

      if (isRegister) {
        setSuccess(true);
        // Automatically log in after registration
        try {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password })
          });
          const loginData = await loginResponse.json();
          if (loginResponse.ok && loginData.token && loginData.user) {
            // Ensure first and last names from registration form are preserved if server didn't have them yet
            const userWithNames = {
              ...loginData.user,
              first_name: loginData.user.first_name || formData.first_name,
              last_name: loginData.user.last_name || formData.last_name,
              firstName: loginData.user.firstName || formData.first_name,
              lastName: loginData.user.lastName || formData.last_name
            };
            authLogin(loginData.token, userWithNames);
            setTimeout(() => navigate('/onboarding'), 1500);
          } else {
            // If auto-login fails, just go to login mode
            setTimeout(() => {
              setIsRegister(false);
              setSuccess(false);
            }, 2000);
          }
        } catch (err) {
          setTimeout(() => setIsRegister(false), 2000);
        }
      } else {
        // Handle login success
        if (data.token && data.user) {
          authLogin(data.token, data.user);
          // Don't auto-navigate, stay on account page
        } else {
          throw new Error('Invalid login response');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen pt-36 md:pt-32 pb-24 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 p-12 text-center rounded-sm h-fit"
          >
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center text-4xl font-bold mx-auto">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-black rounded-full" />
            </div>
            
            <h3 className="text-2xl font-display font-bold tracking-tight mb-2">
              {user.username.toUpperCase()}
            </h3>
            <p className="text-[10px] text-white/40 tracking-widest uppercase mb-10">{user.email}</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/collection')}
                className="w-full border border-white/20 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                BROWSE PRODUCTS
                <ExternalLink size={12} />
              </button>
              <button 
                onClick={() => logout()}
                className="w-full bg-white text-black py-4 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
              >
                <LogOut size={14} />
                LOG OUT
              </button>
            </div>
          </motion.div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="mb-10">
              <h4 className="text-3xl font-display font-bold tracking-tighter mb-2">ORDERS ARCHIVE</h4>
              <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase font-medium">Historical logs and status of your active transmissions.</p>
            </div>
            
            <Orders />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 md:pt-32 flex flex-col md:flex-row">
      {/* Left: Branding */}
      <div className="hidden md:flex flex-1 bg-[#0a0a0a] items-center justify-center p-12 border-r border-white/10">
        <div className="max-w-md">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl font-display font-bold tracking-tighter leading-none mb-6"
          >
            ELEVATED <br /> IDENTITY.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg font-light tracking-wide leading-relaxed"
          >
            Join the CHILS & CO. community. Gain early access to limited drops, 
            personalized recommendations, and a seamless shopping experience 
            designed for the digital elite.
          </motion.p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-black">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-12">
            <h3 className="text-3xl font-display font-bold tracking-tight mb-2">
              {isRegister ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
            </h3>
            <p className="text-xs text-white/40 tracking-[0.2em] uppercase">
              {isRegister ? 'Enter your details to join us' : 'Sign in to your account'}
            </p>
          </div>

          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 border border-white/10 p-8 text-center rounded-sm"
            >
              <CheckCircle2 className="mx-auto mb-4 text-white" size={48} />
              <h4 className="text-lg font-bold mb-2">REGISTRATION COMPLETE</h4>
              <p className="text-sm text-white/60">
                Welcome to the fold. Redirecting you to the home page...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {isRegister && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest text-white/40 uppercase">First Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-widest text-white/40 uppercase">Last Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-white/40 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-white/40 uppercase">Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black py-4 text-xs font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : (isRegister ? 'JOIN COMMUNITY' : 'LOG IN')}
                <ArrowRight size={16} />
              </button>

              <div className="text-center mt-8">
                <button 
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-[10px] tracking-widest text-white/40 uppercase hover:text-white transition-colors"
                >
                  {isRegister ? 'Already have an account? Sign In' : 'Need an account? Join Now'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
