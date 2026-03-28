import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useVelocity, useSpring } from 'motion/react';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Velocity for dynamic feedback
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0]);
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  // Velocity-based skew for the main heading
  const headingSkew = useTransform(smoothVelocity, [-0.1, 0.1], [-2, 2]);
  const headingScale = useTransform(smoothVelocity, [-0.1, 0, 0.1], [0.98, 1, 0.98]);

  return (
    <section ref={containerRef} className="relative h-[120vh] w-full overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <motion.div 
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 bg-black overflow-hidden pointer-events-none"
      >
        <iframe
          className="w-[100vw] h-[56.25vw] min-h-[120vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
          src="https://www.youtube.com/embed/G1cpYdshdA0?autoplay=1&mute=1&controls=0&loop=1&playlist=G1cpYdshdA0&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1"
          allow="autoplay; encrypted-media"
        ></iframe>
        {/* Central Vignette for Contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_80%)] pointer-events-none" />
        {/* CRT/Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-10" />
      </motion.div>

      {/* Overlay Content */}
      <motion.div 
        style={{ y: contentY, opacity: contentOpacity }}
        className="fixed z-10 text-center px-6 flex flex-col items-center pointer-events-none"
      >
        <motion.div style={{ scale: logoScale }}>
          <motion.img
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: 360
            }}
            transition={{ 
              opacity: { duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 30, repeat: Infinity, ease: "linear" }
            }}
            src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
            alt="CHILS & CO."
            className="h-20 md:h-28 w-auto mb-12 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <motion.h1
          style={{ skewX: headingSkew, scale: headingScale }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-7xl md:text-[14vw] font-display font-bold tracking-[-0.06em] leading-none mb-6 text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.9)] will-change-transform"
        >
          CHILS & CO.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs md:text-sm tracking-[0.5em] uppercase font-medium text-white/80 drop-shadow-md"
        >
          Essential by Design. Elevated by Intent.
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase opacity-50">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-full bg-white"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
