import React, { useEffect, useState, useRef } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import EcoEngineeredLogo from '../components/EcoEngineeredLogo';
import PromiseSection from '../components/PromiseSection';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw, Smartphone, Monitor, Watch } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
  const [contextIndex, setContextIndex] = useState(0);
  const scrollRef = useRef(null);
  const isInView = useInView(scrollRef, { once: true, amount: 0.2 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);

  // Continuous loop for context artifact
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlickering(true);
      setTimeout(() => {
        setContextIndex((prev) => (prev + 1) % contexts.length);
        setIsFlickering(false);
      }, 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={scrollRef} id="philosophy" className="bg-black">
      {/* SECTION 1: THE SYSTEM (3-COLUMN SPLIT) */}
      <section className="min-h-screen flex items-center justify-center p-8 md:p-24 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 items-start relative z-10"
        >
          {/* LEFT: IDENTITY (STATIC) */}
          <div className="md:col-span-4 space-y-12 pt-4">
            <div className="space-y-8">
              <p className="text-accent text-base md:text-xl font-display font-medium tracking-[0.4em] uppercase">Our Philosophy</p>
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter leading-none">
                  Designed by techies.
                </h3>
                <p className="text-xl md:text-2xl text-white/40 font-display font-light leading-snug tracking-tight">
                  For those who build, <br />
                  ship, and iterate.
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: ARTIFACT (CORE VISUAL) - CONTINUOUS */}
          <div className="md:col-span-4 flex flex-col items-center justify-center relative py-12">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img 
                src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png" 
                alt="System Artifact" 
                className={`w-64 md:w-[32vw] max-w-lg h-auto object-contain brightness-110 drop-shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-opacity duration-100 ${isFlickering ? 'opacity-80' : 'opacity-100'}`}
                referrerPolicy="no-referrer"
              />

              {/* DESKTOP ONLY: ON-SHIRT CONTEXT OVERLAY */}
              <div className="absolute inset-0 hidden md:flex items-center justify-center">
                <div className="mt-[-15%] pointer-events-none select-none flex flex-col items-center gap-4">
                  {/* Constant Anchor */}
                  <span className="text-[10px] md:text-[11px] font-mono tracking-[0.5em] text-white/20 uppercase">
                    BUILT FOR EVERY CONTEXT
                  </span>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={contextIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: isFlickering ? [0.1, 0.6, 0.4] : 0.6, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-[14px] md:text-[16px] font-mono tracking-[1.2rem] text-accent font-bold uppercase mix-blend-overlay">
                        {contexts[contextIndex].name}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* MOBILE ONLY: ATTACHED CONTEXT LAYER (BELOW SHIRT) */}
            <div className="flex md:hidden flex-col items-center mt-12 space-y-4 text-center">
              <span className="text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase">
                BUILT FOR EVERY CONTEXT
              </span>
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={contextIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xl font-mono tracking-[0.8em] text-accent font-bold uppercase">
                      {contexts[contextIndex].name}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT: BELIEF (DYNAMIC TEXT) */}
          <div className="md:col-span-4 flex flex-col md:items-end md:text-right space-y-10 md:pt-4">
            <p className="text-3xl md:text-[2.5rem] font-display font-light text-white tracking-tighter leading-[1.05] max-w-sm">
              We believe clothing should <br />
              move with you — <br />
              <span className="text-white/20 italic font-extra-light">through every context, without interruption.</span>
            </p>
            
            <div className="pt-6 border-t border-white/10 w-full md:w-auto">
              <p className="text-accent text-[13px] md:text-[15px] font-bold uppercase tracking-[0.6em] leading-tight">
                FROM WORK TO <br /> EVERYTHING AFTER.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ambient Glow */}
        <div 
          className="absolute inset-0 transition-colors duration-2000 blur-[180px] opacity-[0.04] pointer-events-none"
          style={{ backgroundColor: contexts[contextIndex].light }} 
        />
      </section>

      {/* SECTION 2: THE SIGNATURE (STANDALONE) */}
      <section className="py-16 md:py-20 flex flex-col items-center justify-center px-6 relative overflow-hidden bg-black">
        <div className="text-center space-y-8 md:space-y-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 0.5, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="text-4xl md:text-6xl font-display font-extra-light text-white tracking-[0.3em] uppercase"
          >
            Not just seen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 3, delay: 0.5 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative cursor-default"
          >
            <h4 
              className="text-7xl md:text-[12vw] font-display font-black tracking-tighter uppercase italic leading-none transition-all duration-1000 transform"
              style={{ 
                color: '#C5A028',
                textShadow: isHovered ? '0 0 40px rgba(197, 160, 40, 0.15)' : 'none',
                scale: isHovered ? 1.01 : 1
              }}
            >
              <span className="relative inline-block overflow-hidden px-4">
                Lived in.
                
                {/* Light Sweep Effect */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={isHovered ? { x: '250%' } : { x: '-150%' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 top-[-100%] bottom-[-100%] w-64 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] pointer-events-none"
                  style={{ mixBlendMode: 'soft-light' }}
                />
              </span>
            </h4>
          </motion.div>
        </div>
      </section>
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:128px_128px]" />
    </div>
  );
};

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSeenSustainability, setHasSeenSustainability] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500); // Small delay to ensure component is rendered
    }
  }, [location.hash]);

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

      <PromiseSection />

      {/* Second Life Section - Cinematic Reveal with Visual Evidence */}
      <motion.section 
        id="second-life"
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
                    What you receive is not an end product — it is the beginning of a second function.
                  </p>
                  <p>
                    Our packaging is designed as a reusable system: <br />
                    storage, organization, and utility beyond delivery.
                  </p>
                  <p>
                    From compartmental structure to material finish, every detail is designed to persist.
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
        id="eco-engineered"
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
            <EcoEngineeredLogo />
          </motion.div>

          <motion.h2 
            initial={hasSeenSustainability ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 15, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 2.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-[8vw] font-display font-bold tracking-tighter mb-12 leading-none uppercase text-[#5CA904] whitespace-nowrap"
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
              className="text-xl md:text-3xl font-display font-medium tracking-tight uppercase text-[#5CA904] italic relative z-10"
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
                className="absolute top-0 bottom-0 w-px bg-[#5CA904] z-0 opacity-25 shadow-[0_0_8px_rgba(92,169,4,0.2)]"
              />
            )}
          </div>

          <motion.div 
            initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-2xl font-sans font-light text-[#EAEAEA] max-w-4xl mx-auto leading-relaxed space-y-12"
          >
            <p>
              Sustainability at Chils & Co. is not an addition — it is engineered into the system.
            </p>
            <p>
              We eliminate plastic entirely, reduce material excess, and design every component to function beyond its first use.
            </p>
            <p className="text-[#5CA904] font-medium opacity-80">
              From packaging to product detailing, every element is structured for durability, reuse, and extended life.
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
