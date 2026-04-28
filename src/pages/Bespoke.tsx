import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const Bespoke: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bespoke/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        setEmail('');
      } else {
        alert(data.message || 'Failed to process signal. Please try again.');
      }
    } catch (error) {
      console.error('Bespoke signal error:', error);
      alert('Network error. Pulse failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Hero / Header */}
      <section className="px-6 md:px-12 mb-24 md:mb-40">
        <div className="max-w-5xl mx-auto text-center">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.5 }}
               className="flex flex-col items-center gap-2 mb-8"
            >
              <span className="text-accent text-[11px] uppercase tracking-[0.8em] font-bold mb-4">The Future System</span>
              <h1 className="text-6xl md:text-[10vw] font-display font-bold tracking-tighter uppercase leading-[0.8] text-white">
                THE BESPOKE
              </h1>
              <p className="text-accent text-lg md:text-2xl font-display italic tracking-[0.2em] font-light mt-4">
                Arriving Soon
              </p>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="text-neutral-400 text-xl md:text-3xl font-display font-light tracking-tight max-w-3xl mx-auto leading-tight"
            >
              A shift from readywear to precision-built garments, <br className="hidden md:block" />
              designed around your body, your preferences, and your standards.
            </motion.p>
        </div>
      </section>

      {/* Main Infographic Section */}
      <section className="px-6 md:px-12 mb-40">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-center">
             {/* Visual Infographic */}
             <div className="lg:col-span-8 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(30px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                <img 
                  src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1777383461/The_Bespoke_vbsrwn.png" 
                  alt="The Bespoke Engineering Process" 
                  className="w-full h-auto rounded-sm shadow-[0_0_100px_rgba(255,255,255,0.05)] border border-white/5"
                  referrerPolicy="no-referrer"
                />
                
                {/* Protocol Labels */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { p: '01', t: 'Material Selection' },
                    { p: '02', t: 'Anatomical Capture' },
                    { p: '03', t: 'Custom Configuration' },
                    { p: '04', t: 'Iterative Quality' }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      transition={{ delay: 1 + i * 0.2 }}
                      className="space-y-1"
                    >
                      <p className="text-[10px] text-accent uppercase font-bold tracking-widest leading-none">Protocol {item.p}</p>
                      <p className="text-[11px] text-white uppercase tracking-[0.2em]">{item.t}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Supporting Content */}
            <div className="lg:col-span-4 space-y-16">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <h3 className="text-white text-3xl font-display font-medium tracking-tighter leading-tight italic">
                    What you’re <br />looking at
                  </h3>
                  <div className="h-px w-12 bg-accent opacity-50" />
                </div>

                <div className="space-y-8">
                  {[
                    { icon: <Zap size={18} className="text-accent" />, title: 'Guided Build System', desc: 'Not a standard product page. A multi-stage construction interface.' },
                    { icon: <RefreshCw size={18} className="text-accent" />, title: 'Fabric-First Selection', desc: 'Sourcing the finest materials before the first cut is made.' },
                    { icon: <ShieldCheck size={18} className="text-accent" />, title: 'Measurement-Driven Fit', desc: 'Anatomically mapped to your exact specifications.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 pt-1">{item.icon}</div>
                      <div>
                        <h4 className="text-[11px] text-white uppercase tracking-widest font-bold mb-1">{item.title}</h4>
                        <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="px-6 md:px-12 py-24 bg-white/5 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-white text-4xl font-display font-bold tracking-tighter uppercase italic leading-none">Fit Guarantee</h3>
            <p className="text-neutral-400 text-lg leading-relaxed font-light">
              We understand that precision requires adjustment. If your bespoke artifact doesn’t fit exactly as intended, we refine it until it does. Engineered to fit. Refined if needed.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <h3 className="text-white text-4xl font-display font-bold tracking-tighter uppercase italic leading-none">CRAFT STATEMENT</h3>
            <p className="text-neutral-400 text-lg leading-relaxed font-light">
              Every piece is cut, stitched, and finished with precision — not mass processed. We reject speed in favor of quality. Only a limited number of builds are accepted each cycle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Form Section */}
      <section className="px-6 md:px-12 py-40 text-center relative overflow-hidden" id="waitlist">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          {!submitted ? (
            <>
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase mb-6 text-white">Join the Build List</h2>
              <p className="text-neutral-400 mb-12 text-lg font-light leading-relaxed">
                Currently in development. Early access will be strictly limited to those on our build list. Secure your spot in the queue.
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Enter your system email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 px-6 py-5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-all rounded-sm uppercase tracking-widest text-[11px]"
                  />
                  {isSubmitting && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                    </div>
                  )}
                </div>
                <motion.button 
                  whileHover={{ backgroundColor: '#D4AF37', color: '#000' }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="w-full py-5 border border-accent text-accent uppercase tracking-[0.4em] text-[11px] font-bold transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing Signal...' : 'Initiate Early Access'}
                  {!isSubmitting && <ArrowRight size={14} />}
                </motion.button>
              </form>
              <p className="mt-6 text-[10px] text-neutral-600 uppercase tracking-widest">Limited builds. Direct collaboration.</p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 px-8 border border-accent/20 bg-accent/5 rounded-sm flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 className="text-black" size={32} />
              </div>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tighter mb-4">Signal Received</h2>
              <p className="text-neutral-400 font-light leading-relaxed">
                You have been added to the Bespoke build list. <br />
                We will notify you via encrypted signal when we are ready for the first build phase.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-[11px] text-accent uppercase tracking-widest font-bold border-b border-accent/20 pb-1 hover:border-accent transition-all"
              >
                Add another email
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Background Depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent/5 rounded-full blur-[200px] pointer-events-none opacity-50" />
    </div>
  );
};

export default Bespoke;
