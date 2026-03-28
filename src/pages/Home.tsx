import React, { useEffect, useState, useRef } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const storyRef = useRef(null);
  const philosophyRef = useRef(null);
  const craftRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"]
  });
  
  const { scrollYProgress: philosophyScroll } = useScroll({
    target: philosophyRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: craftScroll } = useScroll({
    target: craftRef,
    offset: ["start end", "end start"]
  });

  // Scroll Velocity for micro-interactions
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  
  // Velocity-based effects (skew and blur) - Refined for subtlety
  const skew = useTransform(smoothVelocity, [-0.1, 0.1], [-0.5, 0.5]);
  const blur = useTransform(smoothVelocity, [-0.1, 0, 0.1], [1, 0, 1]);
  const progressOpacity = useTransform(smoothVelocity, [-0.1, 0, 0.1], [1, 0.3, 1]);

  // Ambient background shifts - More subtle
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 0.9, 1],
    ["#000000", "#030303", "#080808", "#030303", "#000000"]
  );

  // Section "Weight" / Resistance - Pronounced for "Philosophy" and "Chils Loop™"
  const philosophyY = useTransform(philosophyScroll, [0, 0.5, 1], [60, 0, -60]);
  const craftY = useTransform(craftScroll, [0, 0.5, 1], [80, 0, -80]);

  const storyOpacity = useTransform(storyScroll, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const storyScale = useTransform(storyScroll, [0, 0.5], [0.95, 1]);
  const storyTextY = useTransform(storyScroll, [0, 0.5], [30, 0]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 4)));
  }, []);

  return (
    <motion.div 
      style={{ backgroundColor: bgColor }}
      className="text-white selection:bg-accent selection:text-black transition-colors duration-1000"
    >
      {/* Minimal Progress Indicator with Velocity Glow */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[1px] bg-accent z-[100] origin-left shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        style={{ 
          scaleX: scrollYProgress,
          opacity: progressOpacity,
          backgroundColor: useTransform(smoothVelocity, [-0.1, 0, 0.1], ["#FFFFFF", "#F27D26", "#FFFFFF"])
        }}
      />
      
      <motion.div style={{ skewY: skew, filter: `blur(${blur}px)` }} className="will-change-transform">
        <Hero />

        {/* Collection Preview */}
        <section className="py-48 px-6 md:px-12 max-w-[1800px] mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-[11px] tracking-[0.4em] font-bold uppercase mb-6 text-accent/80">Current Iteration</h2>
              <h3 className="text-5xl md:text-8xl font-display font-bold tracking-tighter leading-[0.85]">
                THE<br/>SILICON<br/>SERIES
              </h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="max-w-md"
            >
              <p className="text-neutral-500 text-lg mb-10 leading-relaxed">
                A study in monochromatic precision. Engineered for those who build, debug, and deploy.
              </p>
              <Link to="/collection" className="group flex items-center gap-4 text-[11px] tracking-[0.3em] font-bold uppercase">
                <span className="group-hover:mr-2 transition-all duration-500">View Collection</span>
                <div className="w-12 h-[1px] bg-white/20 group-hover:w-20 group-hover:bg-accent transition-all duration-500" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.15, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Brand Story - Immersive Parallax */}
        <section id="story" ref={storyRef} className="h-[200vh] relative">
          <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
            <motion.div 
              style={{ opacity: storyOpacity, scale: storyScale, y: storyTextY }}
              className="max-w-5xl mx-auto px-6 text-center z-10"
            >
              <h2 className="text-[11px] tracking-[0.5em] font-bold uppercase mb-20 opacity-40">The Narrative</h2>
              <div className="space-y-16 text-4xl md:text-7xl font-display font-medium leading-[1.1] tracking-tight">
                <p className="reveal-text">We don't make clothes.</p>
                <p className="opacity-30 italic font-light">We manufacture equipment.</p>
                <p className="text-accent/90">For the architects of the digital age.</p>
              </div>
            </motion.div>
            
            {/* Background Parallax Elements */}
            <motion.div 
              style={{ 
                y: useTransform(storyScroll, [0, 1], [0, -200]),
                opacity: useTransform(storyScroll, [0, 0.5, 1], [0.1, 0.2, 0.1])
              }}
              className="absolute top-1/4 -left-20 text-[20vw] font-display font-bold text-white pointer-events-none select-none opacity-5"
            >
              BUILD
            </motion.div>
            <motion.div 
              style={{ 
                y: useTransform(storyScroll, [0, 1], [0, 200]),
                opacity: useTransform(storyScroll, [0, 0.5, 1], [0.1, 0.2, 0.1])
              }}
              className="absolute bottom-1/4 -right-20 text-[20vw] font-display font-bold text-white pointer-events-none select-none opacity-5"
            >
              DEPLOY
            </motion.div>
          </div>
        </section>

        {/* Philosophy - Bento Grid Style with Resistance */}
        <motion.section 
          id="philosophy" 
          ref={philosophyRef}
          style={{ y: philosophyY }}
          className="py-64 px-6 md:px-12 max-w-[1800px] mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {[
              { title: "ZERO NOISE", desc: "Every seam is a decision. Every pocket is a function." },
              { title: "HARDWARE FIRST", desc: "Materials tested against the friction of real-world building." },
              { title: "SYSTEMIC FIT", desc: "An interface between your body and your workspace." },
              { title: "OPEN SOURCE", desc: "Transparency in sourcing, manufacturing, and intent." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-neutral-950 p-16 flex flex-col justify-between aspect-square border border-white/5 group hover:bg-neutral-900 transition-colors duration-1000"
              >
                <span className="text-[10px] font-mono opacity-20 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                <div>
                  <h4 className="text-3xl font-display font-bold mb-8 tracking-tighter group-hover:text-accent transition-colors duration-700">{item.title}</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed max-w-[200px] group-hover:text-neutral-300 transition-colors duration-700">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quality & Craft - Cinematic Split with Resistance */}
        <motion.section 
          ref={craftRef}
          style={{ y: craftY }}
          className="py-64 px-6 md:px-12 bg-white text-black"
        >
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-48 items-center">
            <div className="order-2 lg:order-1">
              <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                className="aspect-[3/4] bg-neutral-100 overflow-hidden relative group"
              >
                <img
                  src="https://picsum.photos/seed/precision/1200/1600"
                  alt="Precision Engineering"
                  className="w-full h-full object-cover grayscale transition-all duration-[2000ms] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-1000" />
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <motion.h2 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="text-[11px] tracking-[0.5em] font-bold uppercase mb-16 opacity-40"
              >
                Chils Loop™
              </motion.h2>
              <motion.h3 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="text-6xl md:text-9xl font-display font-bold tracking-tighter mb-20 leading-[0.85]"
              >
                BUILT<br/>TO<br/>LAST.
              </motion.h3>
              <div className="space-y-16">
                {[
                  { title: "SENSORY TESTING", desc: "Fabric hand-feel optimized for focus and comfort." },
                  { title: "STRESS ANALYSIS", desc: "Reinforced stress points for durability in high-motion areas." }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                    className="max-w-md"
                  >
                    <h5 className="font-bold uppercase tracking-[0.3em] text-[10px] mb-4 text-neutral-400">{item.title}</h5>
                    <p className="text-neutral-600 text-lg leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA - Immersive */}
        <section className="py-96 px-6 text-center bg-black relative overflow-hidden">
          <motion.div
            style={{
              y: useTransform(useScroll().scrollYProgress, [0.8, 1], [100, -100]),
              opacity: useTransform(useScroll().scrollYProgress, [0.8, 0.9, 1], [0, 1, 0])
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-[30vw] font-display font-bold text-white/5 tracking-tighter uppercase">CHILS</span>
          </motion.div>
          
          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
              className="text-6xl md:text-[10vw] font-display font-bold tracking-tighter mb-24 uppercase leading-[0.8]"
            >
              JOIN THE<br/><span className="text-accent">ECOSYSTEM.</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              <Link
                to="/collection"
                className="group relative inline-flex items-center justify-center px-20 py-8 overflow-hidden rounded-full border border-white/20 transition-all duration-500 hover:border-accent"
              >
                <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]" />
                <span className="relative z-10 text-[11px] tracking-[0.5em] font-bold uppercase text-white group-hover:text-black transition-colors duration-500">
                  Enter Collection
                </span>
              </Link>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default Home;
