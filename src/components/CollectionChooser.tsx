import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { GROUPS } from '../data/groups';

const EASE = [0.22, 1, 0.36, 1] as const;
const DWELL = 3800;

/**
 * The way into the collection. The names are the menu: big type with style
 * counts reads as navigation. The models only illustrate the selected group,
 * in threes so they read as a range, and are deliberately not clickable.
 */
const CollectionChooser: React.FC<{ count: (slug: string) => number; onPick: (slug: string) => void }> = ({ count, onPick }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const group = GROUPS[active];

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => setActive(a => (a + 1) % GROUPS.length), DWELL);
    return () => clearTimeout(t);
  }, [active, paused, reduced]);

  return (
    <motion.header
      animate={{ backgroundColor: group.tone, color: group.dark ? '#ffffff' : '#0e0e0c' }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative overflow-hidden"
    >
      <div className="max-w-[1680px] mx-auto px-5 md:px-10 grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:min-h-[calc(100svh-72px)] md:max-h-[860px]">
        {/* models */}
        <div aria-hidden className="order-1 md:order-2 relative h-[300px] sm:h-[380px] md:h-auto pointer-events-none select-none">
          <AnimatePresence initial={false}>
            <motion.div
              key={group.slug}
              className="absolute inset-0 flex items-end justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {group.trio.map((id, i) => (
                <motion.img
                  key={id}
                  src={`/cutouts/${id}.webp`}
                  alt=""
                  draggable={false}
                  initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                  className="w-auto max-w-none object-contain object-bottom"
                  style={{ height: `${[82, 94, 86][i]}%`, marginLeft: i ? '-7%' : 0, zIndex: i === 1 ? 2 : 1 }}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* names */}
        <nav aria-label="Collections" className="order-2 md:order-1 relative z-10 flex flex-col justify-center py-6 md:py-12" onMouseLeave={() => setPaused(false)}>
          <h1 className="eyebrow opacity-60 mb-3 md:mb-6">The collection</h1>
          <ul>
            {GROUPS.map((g, i) => {
              const on = i === active;
              return (
                <li key={g.slug}>
                  <button
                    onClick={() => onPick(g.slug)}
                    onMouseEnter={() => { setActive(i); setPaused(true); }}
                    onFocus={() => { setActive(i); setPaused(true); }}
                    className={`group w-full flex items-baseline gap-3 text-left leading-[1.06] font-semibold tracking-[-0.04em] text-[46px] sm:text-[60px] md:text-[clamp(64px,7.4vw,118px)] transition-opacity duration-300 cursor-pointer ${on ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
                  >
                    <span>{g.name}</span>
                    <sup className="font-mono font-normal text-[12px] md:text-[15px] tracking-normal self-start mt-2 md:mt-4">{count(g.slug)}</sup>
                    <ArrowRight className={`self-center ml-auto w-5 h-5 md:w-8 md:h-8 transition-all duration-300 ${on ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} strokeWidth={1.5} />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 md:mt-7 text-sm md:text-base opacity-60 min-h-[20px]">{group.line}</p>
        </nav>
      </div>
    </motion.header>
  );
};

export default CollectionChooser;
