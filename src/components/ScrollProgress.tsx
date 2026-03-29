import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-[100] opacity-50"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
