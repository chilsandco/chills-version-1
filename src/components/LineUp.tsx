import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { openQuickView } from '../lib/quickView';
import { OPENING, SHOWN_COLOR, WALK_PHOTOS, lookPhoto } from '../data/lookbook';
import cutouts from '../data/cutouts.json';
import { Product } from '../types';

const EASE = [0.22, 1, 0.36, 1] as const;
const DWELL = 6500;
const STEP = 2.2;
const ON_FLOOR = 6;

const CUTOUTS = cutouts as Record<string, { kind: string; src: string }>;

type Walker = { id: string; src: string; product?: Product };

/** Depth along the floor: 0 is the far end of the line, ON_FLOOR-1 is nearest the camera. */
function slot(p: number) {
  const t = p / (ON_FLOOR - 1);
  const scale = 0.27 * Math.pow(1 / 0.27, t);
  const left = 7 + 78 * Math.pow(t, 1.35);
  return { left: `${left}%`, scale, opacity: 1 };
}

const walkPhoto = (id: string) => WALK_PHOTOS[id] ?? (CUTOUTS[id]?.kind === 'full' ? CUTOUTS[id].src : undefined);

/** The quiet tees walk first; graphics follow once the tone is set. */
const isMinimal = (p: Product) => p.categories?.includes('Minimals') ? 0 : 1;

/** The home page opening: every tee with a head-to-toe photo walks past, slowly. Tap to stop, tap a model to buy. */
const LineUp: React.FC = () => {
  const { products } = useProducts();
  const reduced = useReducedMotion();
  const [walked, setWalked] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [held, setHeld] = useState(false);

  const walkers = useMemo<Walker[]>(() => {
    const opening = OPENING.map(id => ({ id, src: lookPhoto(id), product: products.find(p => p.id === id) }));
    const rest = products
      .filter(p => p.type !== 'grouped' && p.category !== 'Combos' && p.status === 'Available' && !opening.some(o => o.id === p.id))
      .sort((a, b) => isMinimal(a) - isMinimal(b))
      .flatMap(p => { const src = walkPhoto(p.id); return src ? [{ id: p.id, src, product: p }] : []; });
    return [...opening, ...rest];
  }, [products]);

  const at = (step: number) => walkers[step % walkers.length];

  useEffect(() => {
    if (stopped || held || reduced) return;
    // a hidden tab can't finish its animations, so the line waits rather than piling up
    const t = setInterval(() => { if (!document.hidden) setWalked(w => w + 1); }, DWELL);
    return () => clearInterval(t);
  }, [stopped, held, reduced]);

  // the next model should arrive already loaded
  useEffect(() => { new Image().src = at(walked + ON_FLOOR).src; }, [walked, walkers]); // eslint-disable-line react-hooks/exhaustive-deps

  const shop = (w: Walker) => {
    setStopped(true);
    if (w.product) openQuickView(w.product, SHOWN_COLOR[w.id]);
  };

  return (
    <section
      aria-label="CHILS & CO."
      onClick={e => { if (!(e.target as HTMLElement).closest('a,button')) setStopped(v => !v); }}
      className="seamless relative overflow-hidden text-ink h-[calc(100svh-72px)] min-h-[560px] [--title:7.2vw]"
    >
      <h1 className="absolute z-0 left-12 top-[2%] whitespace-nowrap wordmark !font-medium leading-[.95] tracking-[-0.02em] text-[length:var(--title)] select-none">CHILS &amp; CO.</h1>
      <div className="absolute z-20 left-12 top-[calc(2%+var(--title)*1.13)] max-w-sm">
        <p className="text-2xl leading-[1.2] font-semibold tracking-[-0.02em]">Designed by techies. For those who build.</p>
        <div className="mt-6 flex items-center gap-1">
        <Link to="/collection" className="inline-flex items-center gap-2 bg-ink text-[#fff] px-7 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity whitespace-nowrap">
          Shop the collection <ArrowRight size={15} />
        </Link>
        <button onClick={() => setStopped(v => !v)} aria-label={stopped ? 'Keep walking' : 'Stop the line-up'} className="p-3 text-neutral-400 hover:text-ink transition-colors cursor-pointer">
          {stopped ? <Play size={13} strokeWidth={1.6} /> : <Pause size={13} strokeWidth={1.6} />}
        </button>
        </div>
      </div>

      {/* STAGE */}
      <div className="absolute inset-x-0 top-[7%] bottom-6">
        <AnimatePresence initial={false}>
          {Array.from({ length: ON_FLOOR }, (_, n) => {
            // each step keeps its key, so a model walks forward until it passes the camera
            const step = walked + n;
            const w = at(step);
            const p = ON_FLOOR - 1 - n;
            const target = slot(p);
            return (
              <motion.button
                key={step}
                onClick={() => shop(w)}
                onMouseEnter={() => setHeld(true)}
                onMouseLeave={() => setHeld(false)}
                aria-label={w.product ? `Buy ${w.product.name}` : 'Loading'}
                initial={{ left: '0%', scale: 0.2, opacity: 0 }}
                animate={target}
                exit={{ left: '112%', scale: 1.75, opacity: 0 }}
                transition={{ duration: STEP, ease: EASE }}
                style={{ zIndex: p + 1, transformOrigin: '50% 100%', x: '-50%' }}
                className="absolute bottom-0 h-full aspect-[1/3] origin-bottom group outline-none cursor-pointer"
              >
                <img src={w.src} alt={w.product?.name ?? ''} draggable={false} className="absolute inset-0 w-full h-full object-contain object-bottom transition-transform duration-500 group-hover:-translate-y-[1%]" />
                <span aria-hidden className="absolute -bottom-[1.2%] left-1/2 -translate-x-1/2 w-[120%] h-[4%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(20,18,12,.34),transparent)]" />
                {w.product && (
                  <span style={{ fontSize: 13 / target.scale }} className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-[7%] whitespace-nowrap bg-[#fff] text-ink px-[0.9em] py-[0.5em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {w.product.name}
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LineUp;
