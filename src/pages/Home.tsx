import React, { useEffect, useState, useRef } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw, Smartphone, Monitor, Watch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, useInView } from 'motion/react';

const contexts = [
  { name: "office", color: "rgba(100, 116, 139, 0.1)", light: "rgba(255, 255, 255, 0.05)" },
  { name: "meeting", color: "rgba(148, 163, 184, 0.1)", light: "rgba(255, 255, 255, 0.08)" },
  { name: "walk", color: "rgba(234, 179, 8, 0.05)", light: "rgba(234, 179, 8, 0.1)" },
  { name: "lunch", color: "rgba(212, 175, 55, 0.03)", light: "rgba(212, 175, 55, 0.05)" },
  { name: "event", color: "rgba(255, 255, 255, 0.02)", light: "rgba(255, 255, 255, 0.15)" },
  { name: "night", color: "rgba(0, 0, 0, 0.4)", light: "rgba(212, 175, 55, 0.02)" }
];

const PhilosophySystem: React.FC = () => {
  const [step, setStep] = useState(0);
  const [contextIndex, setContextIndex] = useState(0);
  const [isCycling, setIsCycling] = useState(false);
  const scrollRef = useRef(null);
  const isInView = useInView(scrollRef, { once: true, amount: 0.2 });
  const [hasStarted, setHasStarted] = useState(false);

  // Animation Sequence Controller
  useEffect(() => {
    if (!isInView || hasStarted) return;
    setHasStarted(true);

    const sequence = async () => {
      // Step 1: Identity
      setStep(1); 
      await new Promise(r => setTimeout(r, 1800));
      
      // Step 2: Builders
      setStep(2); 
      await new Promise(r => setTimeout(r, 1800));
      
      // Step 3: Belief
      setStep(3); 
      await new Promise(r => setTimeout(r, 2200));

      // Step 4: Bridge Reveal
      setStep(4);
      await new Promise(r => setTimeout(r, 2000));
      
      // Step 5: Artifact & Context Cycle
      setStep(5);
      setIsCycling(true);
      
      // Run two full cycles for engagement
      for (let cycle = 0; cycle < 2; cycle++) {
        for (let i = 0; i < contexts.length; i++) {
          setContextIndex(i);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      setIsCycling(false);
      await new Promise(r => setTimeout(r, 500));
      
      // Step 6: Emotional Drop
      setStep(6);
      await new Promise(r => setTimeout(r, 2500));
      
      // Step 7: Final Signature
      setStep(7);
    };

    sequence();
  }, [isInView, hasStarted]);

  return (
    <section ref={scrollRef} className="py-32 md:py-64 bg-black flex items-center justify-center p-6 relative overflow-hidden" id="philosophy">
      {/* Background Lighting System */}
      <motion.div 
        animate={{ 
          backgroundColor: isCycling ? contexts[contextIndex].color : "rgba(0,0,0,0)",
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 z-0"
      />
      
      {/* Ambient Glow Shifting */}
      <AnimatePresence>
        {isCycling && (
          <motion.div
            key={contextIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{ backgroundColor: contexts[contextIndex].light }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full blur-[200px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl w-full flex flex-col items-center gap-24 relative z-10">
        
        {/* Top Section: The Manifesto Build */}
        <div className="space-y-12 w-full text-center">
          <div className="space-y-4">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-display font-medium tracking-tighter text-white"
            >
              Designed by techies.
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 15 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-xl md:text-3xl font-display font-light text-neutral-400 tracking-tight"
            >
              For those who build, ship, and iterate.
            </motion.p>
          </div>

          <div className="space-y-6">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              className="text-3xl md:text-5xl font-display font-light text-white tracking-tighter"
            >
              We believe clothing should move with you — <br className="hidden md:block" />
              <span className="text-white/40">through every context, without interruption.</span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: step >= 4 ? 1 : 0, scale: step >= 4 ? 1 : 0.98 }}
              transition={{ duration: 1.5 }}
              className="py-4"
            >
              <p className="text-accent text-xl md:text-3xl font-bold uppercase tracking-[0.5em] italic">
                From work to everything after.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Center Section: THE ARTIFACT */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: step >= 5 ? 1 : 0, scale: step >= 5 ? 1 : 0.9 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 0.5, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-56 h-72 md:w-80 md:h-[420px] bg-neutral-900/40 backdrop-blur-3xl border border-white/10 relative group flex items-center justify-center p-12 rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
          >
            {/* Inner "Breathing" Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-50" />
            
            {/* The Silhouette Shape - Real Image Artifact */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
              <img 
                src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1777713945/ChatGPT_Image_May_2_2026_12_32_59_PM_xzhxrr.png" 
                alt="The Chils Artifact" 
                className="max-w-full max-h-full object-contain filter brightness-110 contrast-105 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Micro Context Terminal */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={contextIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.7em] font-mono font-bold text-accent">
                    {contexts[contextIndex].name}
                  </span>
                </motion.div>
              </AnimatePresence>
              <div className="w-16 h-[1px] bg-white/10" />
            </div>
          </motion.div>

          <p className="text-neutral-600 text-[9px] uppercase tracking-[0.8em] font-mono mt-8">
            Adaptive Logic Processor // v1.0
          </p>
        </motion.div>

        {/* Bottom Section: The Resolution */}
        <div className="space-y-20 w-full text-center py-20">
          <motion.h4 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: step >= 6 ? 1 : 0, y: step >= 6 ? 0 : 30 }}
            transition={{ duration: 1.5 }}
            className="text-4xl md:text-7xl font-display font-bold tracking-tighter text-white"
          >
            Built for the moments <br />
            that give you <span className="text-accent italic">chils.</span>
          </motion.h4>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 7 ? 1 : 0 }}
            transition={{ duration: 2 }}
            className="space-y-8"
          >
            <div className="w-px h-24 bg-gradient-to-b from-white/0 via-white/20 to-accent mx-auto" />
            <div className="space-y-2">
              <p className="text-4xl md:text-6xl font-display font-light text-white tracking-widest uppercase">
                Not just seen.
              </p>
              <p className="text-6xl md:text-9xl font-display font-black text-accent tracking-tighter uppercase italic drop-shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                Lived in.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Progress Indicator - Software Style */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div 
            key={i} 
            className={`w-1 transition-all duration-700 ${step >= i ? 'h-8 bg-accent' : 'h-2 bg-white/10'}`} 
          />
        ))}
      </div>

      {/* OS Style Context Switching bars - UI layer */}
      {isCycling && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1">
          {contexts.map((_, i) => (
            <div 
              key={i} 
              className={`h-[1px] w-8 transition-all duration-500 ${i === contextIndex ? 'bg-accent w-12' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      )}
    </section>
  );
};

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSeenSustainability, setHasSeenSustainability] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('chils_sustainability_seen');
    if (seen) setHasSeenSustainability(true);
    
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Home: Products data is not an array", data);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Home: Error fetching products", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black">
      <Hero />

      {/* Drop Identifier Section */}
      <section className="py-20 md:py-24 px-6 text-center overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
           whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-accent text-[13px] uppercase tracking-[0.8em] mb-6 block font-bold">Drop 001</span>
          <h2 className="text-6xl md:text-[12vw] font-display font-bold tracking-tighter uppercase leading-none mb-8">
            <span className="text-accent">1</span>NCEPTION
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-white/10" />
            <p className="text-neutral-500 text-[10px] md:text-xs uppercase tracking-[0.5em] font-medium italic">
              The beginning of the system.
            </p>
            <span className="h-px w-8 bg-white/10" />
          </div>
        </motion.div>
      </section>

      {/* Collection Preview - Cinematic Reveal */}
      <section className="py-16 md:py-20 px-6 md:px-12 max-w-[1800px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-32">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
            ))
          ) : (
            products.slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 80, scale: 0.98, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.2, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-12">
          <motion.div
            initial={{ opacity: 0, x: -60, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="text-accent text-[13px] uppercase tracking-[0.6em] mb-8 block font-bold">The 001 Collection</span>
            <h2 className="text-5xl md:text-[8vw] font-display font-bold tracking-tighter leading-[0.85] mb-12">
              ENGINEERED <br /> FOR SILENCE
            </h2>
            <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-xl">
              A precise exploration of form and function. <br />
              Engineered by those who build systems. Worn by those who understand them.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link 
              to="/collection" 
              className="group flex items-center gap-6 text-[13px] uppercase tracking-[0.4em] font-bold border-b border-white/10 pb-4 hover:border-white transition-all duration-1000"
            >
              Explore All 
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-1000" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Coming Next - The Bespoke Teaser */}
      <section className="py-24 md:py-40 bg-black text-center relative overflow-hidden" id="bespoke-teaser">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="mb-12"
          >
            <span className="text-accent text-[11px] uppercase tracking-[0.8em] font-bold mb-4 block">Coming Next</span>
            <h2 className="text-5xl md:text-8xl font-display font-bold tracking-tighter uppercase leading-none text-white mb-6">
              THE BESPOKE
            </h2>
            <p className="text-neutral-500 text-lg md:text-2xl font-display italic tracking-[0.2em] font-light">
              Not off-the-rack. Not adjusted. Built from scratch — for you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.3 }}
            className="relative group mb-16 max-w-4xl mx-auto"
          >
            <Link to="/bespoke">
              <div className="relative overflow-hidden rounded-sm border border-white/5 shadow-2lx">
                <img 
                  src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1777383461/The_Bespoke_vbsrwn.png" 
                  alt="The Next System" 
                  className="w-full h-auto opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/80 backdrop-blur-sm border border-accent/20 px-8 py-4 rounded-full flex items-center gap-4 group-hover:bg-accent group-hover:text-black transition-all duration-500">
                    <span className="text-[11px] uppercase tracking-[0.4em] font-bold">Explore the System</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
        
        {/* Background Depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-accent/5 rounded-full blur-[180px] pointer-events-none opacity-30" />
      </section>

      <PhilosophySystem />

      {/* Our Promise Section - Progressive Reveal */}
      <section className="py-16 md:py-24 px-6 md:px-12 max-w-[1800px] mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
           className="mb-16"
        >
          <span className="text-accent text-[13px] uppercase tracking-[0.6em] mb-4 block font-bold">The Commitment</span>
          <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tighter uppercase">Our Promise</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] overflow-hidden group rounded-sm lg:sticky lg:top-32"
          >
            <img 
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000" 
              alt="Craftsmanship"
              className="w-full h-full object-cover transition-all duration-2000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-2000" />
          </motion.div>
          
          <div className="space-y-24 md:space-y-32">
            {[
              { 
                title: "Well-Vetted Fabric", 
                desc: "Sourced from trusted manufacturers with an uncompromising standard for build quality. We exclusively utilize 100% fine premium cotton, engineered for substance, tactile endurance, and structural integrity." 
              },
              { 
                title: "Precision Tailoring", 
                desc: "Every pattern is digitally mapped and finished with double stitching on the neck and shoulders. This ensures long-term durability and resistance to sagging — maintaining a fit that feels like a second skin, balancing anatomical comfort with geometric precision." 
              },
              { 
                title: "Creative Overflow", 
                subtext: "Design Philosophy",
                desc: "Our designs are artifacts of expression—story, satire, and idea. This path leads to the upcoming Co-Creator concept, where our community will be invited to collaborate on future signal drops within our creative ecosystem." 
              },
              { 
                title: "Worn for a reason, not for a season", 
                desc: "Nothing we give you is meant to be thrown away. From packaging to tags — every element is designed with a second life. Built to stay. Designed to be used — again." 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 60, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: i * 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-accent font-mono text-base font-bold opacity-30 group-hover:opacity-100 transition-opacity duration-700">0{i + 1}</span>
                  {item.subtext && (
                    <span className="text-[12px] uppercase tracking-widest text-accent font-bold">/ {item.subtext}</span>
                  )}
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-medium mb-4 tracking-tighter leading-none group-hover:text-accent transition-colors duration-700">{item.title}</h3>
                <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Second Life Section - Cinematic Reveal with Visual Evidence */}
      <motion.section 
        className="py-24 md:py-40 bg-white text-black relative z-10 overflow-hidden"
        onViewportEnter={() => {
          if (!hasSeenSustainability) {
            sessionStorage.setItem('chils_sustainability_seen', 'true');
            setHasSeenSustainability(true);
          }
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Text Content */}
            <div className="lg:col-span-5 text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-black/5 rounded-full"
                  >
                    <RefreshCw className="w-5 h-5 text-black" strokeWidth={1} />
                  </motion.div>
                  <span className="text-[13px] uppercase tracking-[0.4em] font-bold">Protocol: Circularity</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-[0.9] uppercase">
                  SECOND LIFE
                </h2>
                
                <div className="space-y-8 text-neutral-600 text-lg md:text-xl font-light leading-relaxed max-w-lg mb-12">
                  <p className="text-black font-bold text-2xl md:text-3xl tracking-tight leading-tight">
                    Not made to be discarded.
                  </p>
                  <p>
                    What you receive is only the beginning. Our packaging is designed to stay — not to be discarded.
                  </p>
                  <p>
                    From the structured compartmentalization to the tactile finish, every element is built with a purpose beyond the first use.
                  </p>
                </div>

                <div className="pt-8 border-t border-black/5">
                  <p className="font-bold text-black uppercase tracking-widest text-xs">
                    Status: Permanent / Reusable
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Visual Content */}
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 rounded-sm overflow-hidden shadow-2xl"
              >
                <img 
                  src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1777382382/second_life_copy_cvaj7g.png" 
                  alt="Second Life Packaging System" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              
              {/* Decorative accents */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/5 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Eco Engineered Section - Premium Precision */}
      <motion.section 
        className="py-12 md:py-20 bg-black text-white text-center px-6 relative overflow-hidden"
      >
        {/* OLED-Hardened Film Grain Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:256px_256px]" 
          style={{ filter: 'contrast(120%) brightness(110%)' }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={hasSeenSustainability ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 2.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-16"
          >
            <div className="relative w-12 h-12 flex items-center justify-center opacity-20">
              <div className="absolute inset-0 border border-[#5F7D63] rounded-sm transform rotate-45" />
              <div className="w-1.5 h-1.5 bg-[#5F7D63] rounded-full" />
            </div>
          </motion.div>

          <motion.h2 
            initial={hasSeenSustainability ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 15, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 2.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-[8vw] font-display font-bold tracking-tighter mb-12 leading-none uppercase text-[#5F7D63] whitespace-nowrap"
          >
             ECO ENGINEERED
          </motion.h2>
          
          {/* Horizontal Precision Sweep Animation - Responsive Speed */}
          <div className="relative overflow-hidden mb-20 py-6 inline-block mx-auto max-w-full">
            <motion.p 
              initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl md:text-3xl font-display font-bold tracking-tight uppercase text-[#5F7D63] italic relative z-10"
            >
              Built with purpose. Designed without waste.
            </motion.p>
            {!hasSeenSustainability && (
              <motion.div 
                initial={{ left: '-10%' }}
                whileInView={{ left: '110%' }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ 
                  duration: typeof window !== 'undefined' && window.innerWidth < 768 ? 3.5 : 5, 
                  delay: 0.8, 
                  ease: [0.4, 0, 0.2, 1] 
                }}
                className="absolute top-0 bottom-0 w-px bg-[#5F7D63] z-0 opacity-25 shadow-[0_0_8px_rgba(95,125,99,0.2)]"
              />
            )}
          </div>

          <motion.div 
            initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-2xl font-light text-[#EAEAEA] max-w-4xl mx-auto leading-relaxed space-y-12"
          >
            <p>
              Sustainability at Chils & Co isn’t added later — it’s engineered into every layer.
            </p>
            <p>
              We eliminate plastic entirely, reduce unnecessary materials, and design every component with long-term use in mind.
            </p>
            <p className="text-[#5F7D63] font-medium opacity-80">
              From packaging to product details, everything is built to minimize waste while maintaining performance and form.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <section className="py-24 md:py-40 px-6 text-center bg-black overflow-hidden">
        <motion.h2 
          initial={{ opacity: 0, y: 100, filter: 'blur(20px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-[10vw] font-display font-bold tracking-tighter mb-32 uppercase leading-[0.8] text-white"
        >
          Essential by Design.<br/>Elevated by Intent.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/collection"
            className="inline-block border border-white/20 text-white px-24 py-8 text-[13px] tracking-[0.6em] font-bold uppercase hover:bg-white hover:text-black transition-all duration-1000 rounded-full"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
