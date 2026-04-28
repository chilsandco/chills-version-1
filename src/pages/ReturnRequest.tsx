import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, RefreshCcw, Camera, Upload, AlertCircle, 
  CheckCircle2, Package, Info, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Signal, SignalItem } from '../types';

const REASONS = [
  "Size Issue (Recommended)",
  "Damaged Product",
  "Wrong Item Received",
  "Quality Issue",
  "Other"
];

const ReturnRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [returnItems, setReturnItems] = useState<{ productId: string, quantity: number }[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setSignal(data);
          // Default: select all items for return
          setReturnItems(data.items.map((i: SignalItem) => ({ productId: i.productId, quantity: i.quantity })));
        } else {
          setError(data.message || "Failed to retrieve signal details.");
        }
      } catch (err) {
        setError("Network error. Could not connect to system hub.");
      } finally {
        setLoading(false);
      }
    };

    if (token && id) fetchSignal();
  }, [id, token]);

  const handleItemToggle = (productId: string, quantity: number) => {
    setReturnItems(prev => {
      const exists = prev.find(item => item.productId === productId);
      if (exists) {
        return prev.filter(item => item.productId !== productId);
      } else {
        return [...prev, { productId, quantity }];
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (images.length >= 3) {
        alert("Maximum 3 images allowed.");
        return;
      }
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description) {
      alert("Please provide a reason and description.");
      return;
    }
    if (returnItems.length === 0) {
      alert("Please select at least one item to return.");
      return;
    }
    if (['Damaged Product', 'Wrong Item Received', 'Quality Issue'].includes(reason) && images.length === 0) {
      alert("Evidence (images) is required for this return reason.");
      return;
    }
    if (!acceptedTerms) {
      alert("Please read and acknowledge the return policy.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason,
          description,
          products: returnItems,
          images
        })
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to initiate return signal.");
      }
    } catch (err) {
      setError("Transmission failure. System unreachable.");
    } finally {
      setSubmitting(false);
    }
  };

  // Logic for 48 hour window
  const isReturnable = () => {
    if (!signal || signal.status !== 'completed' || !signal.dateCompleted) return false;
    const completedDate = new Date(signal.dateCompleted);
    const now = new Date();
    const diffHours = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60);
    return diffHours <= 48;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <RefreshCcw className="text-accent" size={32} />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <ShieldAlert size={48} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-tighter">{error}</h2>
        <Link to="/console/orders" className="text-accent uppercase tracking-widest text-xs font-bold hover:text-white transition-colors">Return to archive</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={40} className="text-black" />
        </motion.div>
        <h2 className="text-4xl font-display font-bold mb-4 tracking-tighter uppercase">Reversal Protocol Initiated</h2>
        <p className="text-[11px] text-white/50 tracking-widest uppercase italic mb-12 max-w-md">Our team is reviewing your transmission. You will be notified once the reversal is authorized.</p>
        <Link to="/console/orders" className="bg-white text-black px-12 py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors">GO TO DASHBOARD</Link>
      </div>
    );
  }

  const isWindowExpired = signal?.status === 'completed' && !isReturnable();

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1000px] mx-auto min-h-screen">
      <Link to={`/console/orders/${id}`} className="inline-flex items-center gap-2 text-white/40 hover:text-accent transition-colors mb-12 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase tracking-widest font-bold">Back to Signal Details</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-12">
           <h1 className="text-5xl font-display font-bold tracking-tighter uppercase mb-2">Reversal Processing</h1>
           <p className="text-[11px] text-white/40 tracking-[0.2em] font-medium uppercase mb-16">Signal: #{signal?.signalId}</p>
        </div>

        {isWindowExpired ? (
          <div className="lg:col-span-12 bg-red-500/5 border border-red-500/20 p-12 text-center rounded-sm">
            <AlertCircle size={40} className="mx-auto mb-6 text-red-500" />
            <h3 className="text-2xl font-display font-bold tracking-tight mb-4 uppercase">System Lock: 48hr Window Expired</h3>
            <p className="text-[11px] text-white/50 tracking-[0.2em] uppercase italic max-w-md mx-auto leading-relaxed">
              Returns are only authorized within a 48-hour delivery window. This window has now closed for your transmission. For critical defective hardware issues, please contact direct support.
            </p>
          </div>
        ) : (
          <>
            {/* Notice Section */}
            <div className="lg:col-span-12">
              <section className="bg-white/5 border border-white/10 p-10 md:p-16 rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Info size={120} />
                </div>
                
                <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-8 flex items-center gap-3">
                  <span className="w-1 h-3 bg-accent" />
                  Reversal Request Notice
                </h3>
                
                <div className="space-y-6 max-w-3xl">
                  <p className="text-lg md:text-xl font-display text-white/90 leading-relaxed font-light italic">
                    "Before you proceed with a return, we’d like to share something with you."
                  </p>
                  
                  <div className="space-y-4 text-[13px] text-white/60 leading-relaxed tracking-wide">
                    <p>
                      Every Chils & Co piece is designed, tested, and packaged with a lot of thought, time, and care — from fabric selection and color accuracy to wash and durability checks. What you see on the site is exactly what we aim to deliver to you.
                    </p>
                    <p>
                      If your return is due to a sizing issue, we completely understand and will take care of it.
                    </p>
                    <p>
                      For other reasons, we kindly ask you to consider the effort and intention behind the product before proceeding. Your support means a lot to us as a growing brand.
                    </p>
                  </div>
                  
                  <p className="text-[11px] font-bold uppercase tracking-widest text-accent mt-8 italic">Thank you for understanding 🤍</p>
                </div>
              </section>
            </div>

            {/* Form Section */}
            <div className="lg:col-span-7 space-y-12">
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Product Selection */}
                <section className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 scale-95 origin-left">SELECT ITEMS FOR REVERSAL</h4>
                  <div className="space-y-4">
                    {signal?.items.map((item) => (
                      <div 
                        key={item.productId} 
                        onClick={() => handleItemToggle(item.productId, item.quantity)}
                        className={`flex items-center gap-4 p-4 border transition-all cursor-pointer ${
                          returnItems.some(i => i.productId === item.productId) 
                          ? 'border-accent bg-accent/5' 
                          : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-4 h-4 border flex items-center justify-center rounded-sm transition-colors ${
                          returnItems.some(i => i.productId === item.productId) ? 'bg-accent border-accent' : 'border-white/20'
                        }`}>
                          {returnItems.some(i => i.productId === item.productId) && <CheckCircle2 size={10} className="text-black" />}
                        </div>
                        <img 
                          src={item.image || "https://picsum.photos/seed/placeholder/100/100"} 
                          alt={item.name} 
                          className="w-12 h-16 object-cover bg-white/5" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow">
                          <p className="text-[11px] font-bold uppercase tracking-widest leading-tight">{item.name}</p>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Reason Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">REASON FOR RETURN</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {REASONS.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`text-left px-6 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          reason === r ? 'border-accent bg-accent/5 text-accent' : 'border-white/10 hover:border-white/20 text-white/60'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">TELL US WHAT WENT WRONG</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please briefly describe the issue so we can help you faster."
                    className="w-full bg-black border border-white/10 p-6 text-sm focus:border-accent outline-none transition-colors min-h-[150px] font-light"
                  />
                </div>

                {/* Imagery */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">VISUAL PROOF (OPTIONAL)</label>
                    <span className="text-[8px] text-white/20 uppercase tracking-widest">{images.length}/3 IMAGES</span>
                  </div>
                  
                  <div className="flex gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-32 border border-white/20 rounded-sm overflow-hidden group">
                         <img src={img} className="w-full h-full object-cover" />
                         <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/60 p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <ShieldAlert size={12} className="text-red-500" />
                         </button>
                      </div>
                    ))}
                    
                    {images.length < 3 && (
                      <label className="w-24 h-32 border-2 border-dashed border-white/10 hover:border-accent/40 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                        <Camera size={24} className="text-white/20 group-hover:text-accent/60 transition-colors mb-2" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40 group-hover:opacity-100 uppercase">UPLOAD</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  {['Damaged Product', 'Wrong Item Received', 'Quality Issue'].includes(reason) && (
                    <p className="flex items-center gap-2 text-accent text-[9px] uppercase tracking-widest font-bold">
                       <AlertCircle size={10} />
                       Visual evidence required for this reason
                    </p>
                  )}
                </div>

                {/* Acknowledgement */}
                <div className="pt-8 border-t border-white/5">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative pt-1">
                      <input 
                        type="checkbox" 
                        required 
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="peer sr-only" 
                      />
                      <div className="w-5 h-5 border border-white/20 peer-checked:bg-accent peer-checked:border-accent transition-all flex items-center justify-center">
                        {acceptedTerms && <CheckCircle2 size={12} className="text-black" />}
                      </div>
                    </div>
                    <span className="text-[11px] text-white/50 leading-relaxed tracking-wide group-hover:text-white transition-colors italic">
                      I’ve read and understood the return policy. I acknowledge that returns are primarily intended for size-related issues and that other requests are reviewed manually to maintain the quality and intent of the Chils & Co ecosystem.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !acceptedTerms}
                  className="w-full bg-white text-black py-6 text-[11px] tracking-[0.4em] font-bold uppercase hover:bg-accent transition-colors flex items-center justify-center gap-4 disabled:opacity-30"
                >
                  {submitting ? 'TRANSMITTING REQUEST...' : (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                        <RefreshCcw size={16} />
                      </motion.div>
                      SEND REVERSAL SIGNAL
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-5">
               <div className="sticky top-32 space-y-8">
                  <div className="bg-neutral-950 border border-neutral-900 p-8 rounded-sm">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-2 italic">
                       <Package size={14} />
                       Return Summary
                    </h5>
                    <div className="space-y-4">
                      {returnItems.length === 0 ? (
                        <p className="text-[10px] text-white/30 uppercase tracking-widest italic py-8 border-y border-white/5 text-center">No items selected</p>
                      ) : (
                        returnItems.map(ri => {
                          const item = signal?.items.find(i => i.productId === ri.productId);
                          return (
                            <div key={ri.productId} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                               <span className="text-[10px] uppercase tracking-widest text-white/70 truncate mr-4">{item?.name}</span>
                               <span className="text-[10px] font-mono text-accent">x{ri.quantity}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {reason && (
                      <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mb-2 font-bold">DECLARED REASON</p>
                        <p className="text-[11px] uppercase tracking-[0.1em] font-medium leading-tight">{reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-accent/5 border border-accent/20 p-8 rounded-sm">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest leading-loose italic">
                      "Returns are primarily intended for size-related issues. For any other concerns, we carefully review each request to maintain the quality and intent behind every Chils & Co piece."
                    </p>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReturnRequest;
