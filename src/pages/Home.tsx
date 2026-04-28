import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

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

      {/* Collection Preview - Cinematic Reveal */}
      <section className="py-60 px-6 md:px-12 max-w-[1800px] mx-auto overflow-hidden">
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
            <span className="text-accent text-[10px] uppercase tracking-[0.6em] mb-8 block font-bold">The 001 Collection</span>
            <h2 className="text-5xl md:text-[8vw] font-display font-bold tracking-tighter leading-[0.85] mb-12">
              ENGINEERED <br /> FOR SILENCE
            </h2>
            <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed max-w-xl">
              A precise exploration of form and function. Designed for those who value stillness over noise.
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
              className="group flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold border-b border-white/10 pb-4 hover:border-white transition-all duration-1000"
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

      {/* Brand Story - Parallax Depth */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="py-80 px-6 md:px-12 bg-[#050505] relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-accent text-[10px] uppercase tracking-[0.8em] mb-16 block font-bold"
          >
            Our Philosophy
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-7xl font-display font-medium leading-[1] mb-20 tracking-tighter"
          >
            We don't just make clothes. <br />
            We engineer <span className="italic text-gray-600 font-light">artifacts</span> for the digital age.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-gray-500 text-xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto"
          >
            Chils & Co was born from a desire to strip away the unnecessary. Every stitch is a decision. Every fabric is a dialogue between comfort and durability.
          </motion.p>
        </div>
        
        {/* Decorative Parallax Elements */}
        <motion.div 
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, 10, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 left-[5%] w-[40vw] h-[40vw] border border-white/5 rounded-full pointer-events-none blur-3xl" 
        />
        <motion.div 
          animate={{ 
            y: [0, 60, 0],
            rotate: [0, -15, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-[5%] w-[50vw] h-[50vw] border border-white/5 rounded-full pointer-events-none blur-3xl" 
        />
      </motion.section>

      {/* Our Promise Section - Progressive Reveal */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-[1800px] mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
           className="mb-16"
        >
          <span className="text-accent text-[10px] uppercase tracking-[0.6em] mb-4 block font-bold">The Commitment</span>
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
                title: "Well Vetted Fabric", 
                desc: "Sourced from trusted manufacturers with an uncompromising standard for build quality. We exclusively utilize 240GSM fine premium cloth, engineered for substance and tactile endurance." 
              },
              { 
                title: "Precision Tailoring", 
                desc: "Every pattern is digitally mapped and laser-cut to ensure a fit that feels like a second skin, balancing anatomical comfort with geometric precision." 
              },
              { 
                title: "Design Philosophy", 
                subtext: "Creative Overflow",
                desc: "While we lead the design today, we are paving the way for the Chils Co-Creator concept. Soon, you will be invited to submit designs, collaborate on artifacts, and receive rewards as an active part of our creative ecosystem." 
              },
              { 
                title: "Worn for a reason, not for season.", 
                desc: "Every aesthetic choice is anchored in intent. We have eliminated plastic from our lifecycle, prioritizing the 'Second Life' philosophy to ensure our pieces outlast trends." 
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
                  <span className="text-accent font-mono text-xs opacity-30 group-hover:opacity-100 transition-opacity duration-700">0{i + 1}</span>
                  {item.subtext && (
                    <span className="text-[10px] uppercase tracking-widest text-[#5F7D63] font-bold">/ {item.subtext}</span>
                  )}
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-medium mb-4 tracking-tighter leading-none group-hover:text-accent transition-colors duration-700">{item.title}</h3>
                <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Second Life Section - Cinematic Tunnel Reveal */}
      <motion.section 
        className="py-16 md:py-24 lg:py-32 bg-black text-white text-center px-6 relative overflow-hidden"
        onViewportEnter={() => {
          if (!hasSeenSustainability) {
            sessionStorage.setItem('chils_sustainability_seen', 'true');
          }
        }}
      >
        {/* Cinematic White Expansion (Light at the end of the tunnel) */}
        {!hasSeenSustainability ? (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 12, opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 4.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] bg-white rounded-full z-0 pointer-events-none blur-[140px]"
          />
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] bg-white rounded-full z-0 pointer-events-none blur-[140px] scale-[12]" />
        )}

        <motion.div 
          initial={hasSeenSustainability ? { color: "#000000", scale: 1, opacity: 1 } : { color: "#ffffff", scale: 0.985, opacity: 0 }}
          whileInView={{ color: "#000000", scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ 
            color: { duration: 3, delay: 0.2 },
            scale: { duration: 5, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 2, delay: 0.4 }
          }}
          className="max-w-5xl mx-auto relative z-10"
        >
          <motion.div
            initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 45, 
                repeat: Infinity, 
                ease: "linear"
              }}
            >
              <RefreshCw className="w-10 h-10 stroke-[0.5px]" />
            </motion.div>
          </motion.div>

          <motion.h2 
            initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-[7vw] font-display font-bold tracking-tighter mb-8 leading-none uppercase"
          >
            SECOND LIFE™
          </motion.h2>
          <motion.p 
            initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-2xl font-display font-bold tracking-tight mb-12 uppercase italic"
          >
            Engineered for a second life.
          </motion.p>
          <motion.div 
            initial={hasSeenSustainability ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl font-light mb-16 max-w-2xl mx-auto leading-relaxed space-y-6"
          >
            <motion.p 
              initial={hasSeenSustainability ? { opacity: 1 } : { opacity: 0.85 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="text-3xl md:text-4xl font-display font-bold tracking-[-0.04em] mb-10 text-black leading-[1.1]"
            >
              Not made to be discarded.
            </motion.p>
            <div className="space-y-4 opacity-50 text-[#1a1a1a]">
              <p>What you receive is only the beginning.</p>
              <p>
                Our packaging is designed to stay — not to be discarded.
              </p>
              <p>
                Even the smallest details are built with a purpose beyond the first use.
              </p>
            </div>
            <p className="font-medium mt-10 text-black">Because what we build shouldn’t end at delivery.</p>
          </motion.div>
          <motion.div
            initial={hasSeenSustainability ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-current opacity-10 w-full mb-16 origin-left"
          />
        </motion.div>
      </motion.section>

      {/* Eco Engineered Section - Premium Precision */}
      <motion.section 
        className="py-16 md:py-24 lg:py-32 bg-black text-white text-center px-6 relative overflow-hidden"
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
             ECO ENGINEERED™
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
      <section className="py-80 px-6 text-center bg-black overflow-hidden">
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
            className="inline-block border border-white/20 text-white px-24 py-8 text-[10px] tracking-[0.6em] font-bold uppercase hover:bg-white hover:text-black transition-all duration-1000 rounded-full"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
