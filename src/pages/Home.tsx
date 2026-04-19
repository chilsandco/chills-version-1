import React, { useEffect, useState, useRef } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black">
      <Hero />

      {/* Collection Preview - Cinematic Reveal */}
      <section className="py-60 px-6 md:px-12 max-w-[1800px] mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            Chils & Co. was born from a desire to strip away the unnecessary. Every stitch is a decision. Every fabric is a dialogue between comfort and durability.
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

      {/* Quality & Craft - Progressive Reveal */}
      <section className="py-80 px-6 md:px-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] overflow-hidden group rounded-sm"
          >
            <img 
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1000" 
              alt="Craftsmanship"
              className="w-full h-full object-cover transition-all duration-2000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-2000" />
          </motion.div>
          
          <div className="space-y-32">
            {[
              { title: "Engineered Fabrics", desc: "Sourced from the finest mills in Japan and Italy, our textiles are chosen for their technical performance and tactile luxury." },
              { title: "Precision Tailoring", desc: "Every pattern is digitally mapped and laser-cut to ensure a fit that feels like a second skin." },
              { title: "Sustainable Intent", desc: "We believe in longevity. Our pieces are designed to be worn for a lifetime, not a season." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 60, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: i * 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <span className="text-accent font-mono text-xs mb-6 block opacity-30 group-hover:opacity-100 transition-opacity duration-700">0{i + 1}</span>
                <h3 className="text-4xl md:text-6xl font-display font-medium mb-8 tracking-tighter leading-none">{item.title}</h3>
                <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packaging Section - Immersive */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.5 }}
        className="py-80 bg-white text-black text-center px-6 relative overflow-hidden"
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-[12vw] font-display font-bold tracking-tighter mb-16 leading-none"
          >
            CHILS LOOP™
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl md:text-4xl font-light mb-24 max-w-3xl mx-auto leading-[1.1]"
          >
            Our packaging is 100% compostable. <br />
            <span className="font-bold">Engineered for a second life.</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.5, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-black/10 w-full mb-24 origin-left"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            <Link 
              to="/collection" 
              className="inline-block bg-black text-white px-20 py-8 rounded-full text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-gray-900 transition-all duration-700 hover:scale-105 active:scale-95 shadow-2xl"
            >
              Explore Collection
            </Link>
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
