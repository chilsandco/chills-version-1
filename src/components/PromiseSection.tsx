import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PROMISES = [
  {
    id: 1,
    title: "Well-Vetted Fabric",
    image: "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777910929/ChatGPT_Image_May_4_2026_08_46_37_PM_e6lboy.png",
    description: "Sourced from trusted manufacturers with an uncompromising standard for build quality. We exclusively utilize 100% fine premium cotton."
  },
  {
    id: 2,
    title: "Precision Tailoring",
    image: "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777910939/ChatGPT_Image_May_4_2026_08_56_52_PM_row0n2.png",
    description: "Every pattern is digitally mapped and finished with double stitching on the neck and shoulders for long-term durability."
  },
  {
    id: 3,
    title: "Creative Overflow",
    image: "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777910958/ChatGPT_Image_May_4_2026_09_00_31_PM_a6szsf.png",
    description: "Our designs are artifacts of expression. A path leading to the upcoming Co-Creator concept for community collaboration."
  },
  {
    id: 4,
    title: "Worn for a reason, not for a season",
    image: "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777911683/ChatGPT_Image_May_4_2026_09_23_04_PM_mztats.png",
    description: "Built to stay. From packaging to tags, every element is designed with a second life in mind. Designed to be used again."
  }
];

const PromiseSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Preload Images
  useEffect(() => {
    PROMISES.forEach((promise) => {
      const img = new Image();
      img.src = promise.image;
    });
  }, []);

  return (
    <section id="promise" className="bg-[#050505] py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "100%" }}
              viewport={{ once: true }}
              className="absolute -top-4 left-0 h-[1px] bg-[#C5A048]/30"
            />
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              className="text-[#C5A048] text-[10px] uppercase tracking-[0.8em] mb-4 block font-bold"
            >
              Protocol: Quality Assurance
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-7xl font-display font-medium tracking-tighter uppercase text-white leading-none"
            >
              Our Promise
            </motion.h2>
          </div>
          <div className="text-right hidden md:block">
            <span className="text-white/20 font-mono text-[10px] tracking-widest uppercase block mb-1">System Status</span>
            <span className="text-[#C5A048] font-mono text-[10px] tracking-widest uppercase block animate-pulse">● Verified Active</span>
          </div>
        </div>

        {/* MAIN DASHBOARD INTERFACE */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 items-stretch border border-white/10 rounded-sm overflow-hidden bg-black/40 backdrop-blur-xl shadow-2xl">
          
          {/* LEFT: DISPLAY MONITOR (16:9 Ratio) */}
          <div className="w-full lg:w-[65%] relative aspect-video overflow-hidden bg-black border-b lg:border-b-0 lg:border-r border-white/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0">
                  {/* Background Blur Layer */}
                  <img
                    src={PROMISES[activeIndex].image}
                    alt=""
                    className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Foreground Fit Layer */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={PROMISES[activeIndex].image}
                      alt={PROMISES[activeIndex].title}
                      className="w-full h-full object-contain relative z-10"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                {/* HUD OVERLAYS */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* TECHNICAL GRIDS */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: INTERACTIVE CONTROL MODULES */}
          <div className="w-full lg:w-[35%] flex flex-col divide-y divide-white/10">
            {PROMISES.map((item, i) => (
              <div 
                key={item.id}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex-1 relative cursor-pointer transition-all duration-500 overflow-hidden ${
                  activeIndex === i ? 'bg-white/[0.03]' : 'hover:bg-white/[0.01]'
                }`}
              >
                {/* Active Indicator Slide */}
                <motion.div 
                  initial={false}
                  animate={{ 
                    x: activeIndex === i ? "0%" : "-100%" 
                  }}
                  className="absolute bottom-0 left-0 h-[2px] w-full bg-[#C5A048]"
                />

                <div className="p-8 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`font-mono text-[9px] tracking-widest transition-colors duration-500 ${
                      activeIndex === i ? 'text-[#C5A048]' : 'text-white/20'
                    }`}>
                      00{i + 1}
                    </span>
                    <div className={`h-[1px] flex-1 transition-all duration-700 ${
                      activeIndex === i ? 'bg-[#C5A048]/30 w-12' : 'bg-white/5 w-4'
                    }`} />
                  </div>

                  <h3 className={`text-xl md:text-2xl font-display font-medium tracking-tight mb-2 transition-all duration-500 uppercase ${
                    activeIndex === i ? 'text-white translate-x-2' : 'text-white/30 group-hover:text-white/50'
                  }`}>
                    {item.title}
                  </h3>

                  <AnimatePresence>
                    {activeIndex === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        className="text-white/40 text-sm font-light leading-relaxed pr-4 pt-2"
                      >
                        {item.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM DECORATIVE FOOTER */}
        <div className="mt-8 flex justify-between items-center opacity-20 px-2 lg:px-0">
          <div className="flex gap-4">
            <div className="w-[1px] h-4 bg-white" />
            <div className="w-[1px] h-4 bg-white" />
            <div className="w-[1px] h-4 bg-white" />
          </div>
          <span className="text-[9px] font-mono tracking-[0.5em] uppercase">Built for eternity, not for ease.</span>
          <div className="flex gap-4">
            <div className="w-[1px] h-4 bg-white" />
            <div className="w-[1px] h-4 bg-white" />
            <div className="w-[1px] h-4 bg-white" />
          </div>
        </div>
      </div>

      {/* Background Decorative Text */}
      <div className="absolute top-1/2 -right-20 -translate-y-1/2 pointer-events-none opacity-[0.02] select-none hidden xl:block">
        <span className="text-[20vw] font-display font-bold uppercase tracking-tighter leading-none italic">
          CHILS & CO.
        </span>
      </div>
    </section>
  );
};

export default PromiseSection;
