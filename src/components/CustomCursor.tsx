import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react';

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // High-performance spring for zero-latency feel
  const cursorX = useSpring(mouseX, { stiffness: 1200, damping: 65, restDelta: 0.001 });
  const cursorY = useSpring(mouseY, { stiffness: 1200, damping: 65, restDelta: 0.001 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      const target = e.target as HTMLElement;
      //@ts-ignore
      const isClickable = target.closest('a, button, [data-cursor], .interactive');
      setIsHovering(!!isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden hidden lg:block">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            style={{
              x: cursorX,
              y: cursorY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            className="absolute flex items-center justify-center"
          >
            {/* Ambient Glow */}
            <motion.div
              animate={{
                scale: isHovering ? 1.2 : 1,
                opacity: isHovering ? 0.25 : 0.15,
              }}
              className="absolute w-12 h-12 bg-accent/40 blur-[20px] rounded-full"
            />

            {/* Snowflake Icon Cursor */}
            <motion.div
              animate={{
                scale: isHovering ? 0.9 : 0.8,
                rotate: 360
              }}
              transition={{
                scale: { type: 'spring', stiffness: 300, damping: 20 },
                rotate: { duration: 15, repeat: Infinity, ease: "linear" }
              }}
              className="relative w-8 h-8 flex items-center justify-center text-accent"
            >
              <img 
                src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
                alt="cursor"
                className="w-full h-full object-contain gold-icon drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Outer Subtle Ring On Hover */}
            <motion.div
              animate={{
                scale: isHovering ? 1 : 0,
                opacity: isHovering ? 1 : 0,
              }}
              className="absolute w-12 h-12 border border-accent/20 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomCursor;
