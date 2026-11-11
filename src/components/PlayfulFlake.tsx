import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Snowflake from './Snowflake';

type Drift = { id: number; x: number; y: number; turn: number; size: number };
let nextDrift = 1;

/**
 * The header snowflake: it turns slowly as the page scrolls, and a tap gives it a
 * spin while a few small flakes drift down and fade. Still for reduced motion.
 */
const PlayfulFlake: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const { scrollY } = useScroll();
  const scrolled = useTransform(scrollY, v => (still ? 0 : v * 0.12));
  const [spins, setSpins] = useState(0);
  const [drifts, setDrifts] = useState<Drift[]>([]);

  const play = () => {
    if (still) return;
    setSpins(s => s + 1);
    const burst = Array.from({ length: 6 }, () => ({
      id: nextDrift++,
      x: (Math.random() - 0.5) * 70,
      y: 26 + Math.random() * 46,
      turn: (Math.random() - 0.5) * 240,
      size: 5 + Math.random() * 5,
    }));
    setDrifts(d => [...d, ...burst]);
    setTimeout(() => setDrifts(d => d.filter(x => !burst.includes(x))), 1600);
  };

  return (
    <span className="relative inline-flex shrink-0" onClick={play}>
      <motion.span style={{ rotate: scrolled }} className="inline-flex">
        <motion.span animate={{ rotate: spins * 360 }} transition={{ type: 'spring', stiffness: 70, damping: 11, mass: 0.8 }} className="inline-flex">
          <Snowflake className={className} />
        </motion.span>
      </motion.span>
      <AnimatePresence>
        {drifts.map(d => (
          <motion.span
            key={d.id}
            aria-hidden
            initial={{ x: 0, y: 0, opacity: 0.9, rotate: 0, scale: 1 }}
            animate={{ x: d.x, y: d.y, opacity: 0, rotate: d.turn, scale: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 -ml-[4px] -mt-[4px]"
          >
            <span className="block" style={{ width: d.size, height: d.size * 1.13 }}><Snowflake className="block w-full h-full" /></span>
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
};

export default PlayfulFlake;
