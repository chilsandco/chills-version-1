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
            INCEPTION
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

      {/* Brand Story - Narrative Reveal */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="py-32 md:py-48 px-6 md:px-12 bg-black relative overflow-hidden"
        id="philosophy"
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-accent text-[13px] uppercase tracking-[0.8em] mb-24 block font-bold"
          >
            Our Philosophy
          </motion.span>

          <div className="space-y-40 mb-60">
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.4 }}
              className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase"
            >
              We don’t just design for mirrors.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.8 }}
              className="text-xl md:text-3xl font-display font-light text-neutral-500 tracking-tight max-w-3xl mx-auto leading-relaxed"
            >
              We design for movement — between screens, spaces, and moments.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 2, delay: 1.2 }}
            >
              <p className="text-5xl md:text-8xl font-display font-bold tracking-tighter uppercase leading-none">
                Not just seen. <span className="text-accent">Lived in.</span>
              </p>
            </motion.div>
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 1.6 }}
            className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-60 tracking-tighter uppercase"
          >
            We engineer artifacts for the digital age.
          </motion.h2>

          {/* FINAL REVEAL - Origin Story */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto pt-32 border-t border-white/5 space-y-8"
          >
             <p className="text-neutral-300 text-2xl md:text-4xl font-display font-light leading-snug tracking-tight">
              Chils & Co. was born from a desire to strip away the unnecessary. 
            </p>
            <p className="text-neutral-300 text-2xl md:text-4xl font-display font-light leading-snug tracking-tight">
              Every stitch is a decision. Every fabric is a dialogue — between comfort and durability.
            </p>
          </motion.div>
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
