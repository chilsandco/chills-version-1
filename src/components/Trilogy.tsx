import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { Product } from '../types';
import { fetchFullProduct, orderColor, sizeAvailable } from '../hooks/useProducts';
import { isPoster, small } from '../data/studio';
import { SHOWN_COLOR } from '../data/lookbook';
import { keySpecs, STORIES } from '../data/stories';
import { useNarrow } from '../hooks/useNarrow';
import { legacyId } from '../data/legacyIds';

const SILK = [0.65, 0, 0.2, 1] as const;
const SETTLE = [0.22, 1, 0.36, 1] as const;

export const folded = (id: string) => `/folded/${legacyId(id)}.webp`;
export const teeName = (p: Product) => p.name.replace(/^TwinTex Polo - /, '');

/** Editions keep their number for good. New sets simply take the next one, oldest first. */
const EDITIONS: Record<string, number> = { '739': 1, '740': 2, '741': 3, '742': 4, '743': 5, '745': 6, '744': 7, '747': 8, '746': 9 };

export function editionOf(combo: Product, all: Product[]) {
  const late = all.filter(c => !EDITIONS[c.id]).sort((a, b) => Number(a.id) - Number(b.id));
  const no = EDITIONS[combo.id] ?? Object.keys(EDITIONS).length + late.findIndex(c => c.id === combo.id) + 1;
  return { no, label: `N° ${String(no).padStart(2, '0')}` };
}

export const trilogyName = (combo: Product) => /\bStack\b/.test(combo.name) ? `The ${combo.name.replace(/\s*Stack.*$/, '')} Three` : combo.name;
export const trilogySizes = (tees: Product[]) =>
  tees.map(t => t.availableSizes ?? []).reduce((all, s) => all.filter(x => s.includes(x)));

// ── The Trilogy ─────────────────────────────────────────────────────────────

/** Rest, a touch of hover, and fully fanned once the band is off. */
const fan = (rest: number[], hover: number[], open: number[]) => ({
  rest: { rotate: rest[0], x: '0%', y: '0%', transition: { duration: 0.8, ease: SETTLE } },
  hover: { rotate: hover[0], x: `${hover[1]}%`, y: `${hover[2]}%`, transition: { duration: 0.8, ease: SETTLE } },
  open: { rotate: open[0], x: `${open[1]}%`, y: `${open[2]}%`, transition: { duration: 0.75, delay: 0.14, ease: SETTLE } },
});

const LAYERS = [
  fan([0.9], [-1.5, -2, -2.5], [-5, -8, -6]),
  fan([-0.7], [-0.4, 0, -1], [0.8, 1, -2]),
  fan([0.4], [1.6, 2, 0.8], [5, 8, 3]),
];

const BAND = {
  rest: { x: '0%', rotate: 0, opacity: 1, transition: { duration: 0.8, ease: SETTLE } },
  hover: { x: '0%', rotate: 0, opacity: 1 },
  open: { x: '112%', rotate: 2.5, opacity: 0, transition: { x: { duration: 0.6, ease: SILK }, rotate: { duration: 0.6, ease: SILK }, opacity: { duration: 0.2, delay: 0.42 } } },
};

/** Three folded tees held by a paper band. It holds still; only a touch moves it. */
export const Trilogy: React.FC<{
  edition: string;
  tees: Product[];
  open?: boolean;
  onPick: (teeId: string) => void;
}> = ({ edition, tees, open = false, onPick }) => {
  const still = useReducedMotion();
  return (
    <motion.div
      initial={false}
      animate={still ? 'rest' : open ? 'open' : 'rest'}
      whileHover={still || open ? undefined : 'hover'}
      className="relative aspect-[1/1.38]"
    >
      <span className="absolute left-[6%] right-[6%] -bottom-[1%] h-[5%] bg-[#2a2010]/30 blur-xl" />
      {tees.map((t, i) => (
        <motion.button
          key={t.id}
          variants={LAYERS[i]}
          onClick={() => onPick(t.id)}
          aria-label={`See ${t.name}`}
          className="absolute left-0 w-full cursor-pointer"
          style={{ top: `${i * 21}%`, zIndex: i + 1 }}
        >
          <img src={folded(t.id)} alt="" loading="lazy" decoding="async" className="block w-full aspect-[5/4]" style={{ filter: 'drop-shadow(0 6px 9px rgba(30,22,10,.34))' }} />
        </motion.button>
      ))}
      <motion.div
        variants={BAND}
        aria-hidden
        className="absolute z-10 -left-[2%] -right-[2%] bottom-[4%] h-[11%] pointer-events-none flex items-center justify-between px-[5%] gap-2 bg-gradient-to-b from-[#1d1b16] to-[#11100c] border-t border-[#3a362b] shadow-[0_8px_14px_-6px_rgba(20,14,6,.55)]"
      >
        <span className="wordmark whitespace-nowrap text-[8px] md:text-[12px] tracking-[0.2em] md:tracking-[0.26em] text-[#d6be8e]">CHILS &amp; CO.</span>
        <span className="eyebrow whitespace-nowrap text-[8px] md:text-[10px] text-[#a59f90]"><span className="hidden md:inline">Trilogy </span>{edition}</span>
      </motion.div>
    </motion.div>
  );
};

// ── Size and add ────────────────────────────────────────────────────────────

/** One size for all three, then one tap to the bag. */
export const BuyBar: React.FC<{
  tees: Product[];
  size: string | null;
  price: number;
  onSize: (size: string | null) => void;
  onAdd: (tees: Product[]) => void;
}> = ({ tees, size, price, onSize, onAdd }) => {
  const [full, setFull] = useState<Record<string, Product>>({});
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    let live = true;
    tees.forEach(t => fetchFullProduct(t.id).then(f => { if (f && live) setFull(v => ({ ...v, [t.id]: f })); }));
    return () => { live = false; };
  }, [tees]);

  const sizes = trilogySizes(tees);
  const inStock = (s: string) => tees.every(t => { const f = full[t.id]; return !f || sizeAvailable(f, s, orderColor(f, SHOWN_COLOR[t.id])); });

  // a size carried over from another Trilogy may not exist in this one
  const ready = tees.every(t => full[t.id]);
  useEffect(() => {
    if (size && ready && (!sizes.includes(size) || !inStock(size))) onSize(null);
  }, [size, ready, tees]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = async () => {
    if (!size) { setNudge(true); setTimeout(() => setNudge(false), 900); return; }
    onAdd(await Promise.all(tees.map(async t => full[t.id] ?? (await fetchFullProduct(t.id)) ?? t)));
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm transition-colors duration-300 ${nudge ? 'text-ink font-medium' : 'text-neutral-500'}`}>{nudge ? 'Choose a size first' : 'One size for all three'}</p>
        <div className="flex gap-1.5">
          {sizes.map(s => {
            const ok = inStock(s);
            return (
              <button
                key={s}
                disabled={!ok}
                onClick={() => onSize(s)}
                className={`h-11 min-w-11 md:h-9 md:min-w-9 px-2 text-sm md:text-xs border transition-colors ${size === s ? 'bg-ink text-[#fff] border-ink' : ok ? 'border-neutral-300 hover:border-ink' : 'border-neutral-200 text-neutral-300 line-through'}`}
              >{s}</button>
            );
          })}
        </div>
      </div>
      <button onClick={add} className="mt-3 w-full bg-ink text-[#fff] py-4 flex items-center justify-center gap-3 text-sm font-medium hover:opacity-85 transition-opacity">
        Add this Trilogy to bag
        <span className="opacity-40">·</span>
        <span>₹{price.toLocaleString()}</span>
      </button>
    </>
  );
};

// ── The tee tab ─────────────────────────────────────────────────────────────

/** Opens the moment a folded tee is chosen, and unfolds it into the full look. */
export const TeeTab: React.FC<{
  name: string;
  tees: Product[];
  tee: string;
  size: string | null;
  price: number;
  onTee: (id: string) => void;
  onSize: (size: string) => void;
  onAdd: (tees: Product[]) => void;
  onClose: () => void;
}> = ({ name, tees, tee, size, price, onTee, onSize, onAdd, onClose }) => {
  const narrow = useNarrow(768);
  const still = useReducedMotion();
  const [full, setFull] = useState<Record<string, Product>>({});
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    let live = true;
    tees.forEach(t => fetchFullProduct(t.id).then(f => { if (f && live) setFull(v => ({ ...v, [t.id]: f })); }));
    return () => { live = false; };
  }, [tees]);

  useEffect(() => setPhoto(0), [tee]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const current = tees.find(t => t.id === tee) ?? tees[0];
  const photos = current.images.filter(i => !isPoster(i));
  const specs = keySpecs(full[current.id]?.description ?? current.description ?? '', current.fit).slice(0, 3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-[#0e0e0c]/55"
      />
      <motion.aside
        role="dialog"
        aria-label={name}
        initial={narrow ? { y: '100%' } : { x: '100%' }}
        animate={narrow ? { y: 0 } : { x: 0 }}
        exit={narrow ? { y: '100%' } : { x: '100%' }}
        transition={{ duration: still ? 0 : 0.85, ease: SETTLE }}
        className="fixed z-[110] bg-[#fff] text-ink flex flex-col inset-x-0 bottom-0 h-[92dvh] rounded-t-2xl overflow-hidden md:rounded-none md:inset-x-auto md:top-0 md:right-0 md:h-full md:w-[560px]"
      >
        <div className="flex items-center justify-between px-5 md:px-7 h-14 shrink-0">
          <p className="eyebrow text-neutral-500">{name} · 3 tees</p>
          <button onClick={onClose} aria-label="Close" className="-m-3 p-3 hover:opacity-60 transition-opacity"><X size={20} /></button>
        </div>

        {/* the three tees of this Trilogy */}
        <div role="tablist" className="grid grid-cols-3 shrink-0 border-b border-neutral-200 px-3 md:px-5">
          {tees.map(t => (
            <button key={t.id} role="tab" aria-selected={t.id === tee} onClick={() => onTee(t.id)} className="relative flex flex-col items-center gap-1.5 pt-1 pb-3 min-w-0">
              <img src={folded(t.id)} alt="" className={`h-9 w-[54px] object-cover transition-opacity duration-500 ${t.id === tee ? 'opacity-100' : 'opacity-70'}`} />
              <span className={`text-xs truncate max-w-full px-1 transition-colors duration-500 ${t.id === tee ? 'text-ink' : 'text-neutral-500'}`}>{teeName(t)}</span>
              {t.id === tee && <motion.span layoutId="tee-tab-line" transition={{ duration: 0.5, ease: SETTLE }} className="absolute inset-x-3 -bottom-px h-px bg-ink" />}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto" data-lenis-prevent>
          {/* the folded tee, then it unfolds top to bottom into the photo */}
          <div className="relative h-[52dvh] md:h-[56vh] overflow-hidden seamless">
            <AnimatePresence initial={false}>
              <motion.div
                key={tee}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0"
              >
                <img src={folded(tee)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <motion.div
                  key={photo}
                  initial={{ clipPath: still ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)' }}
                  animate={{ clipPath: 'inset(0 0 0% 0)' }}
                  transition={{ duration: still ? 0 : 1.15, delay: still ? 0 : photo === 0 ? 0.5 : 0, ease: SILK }}
                  className="absolute inset-0 seamless"
                >
                  <motion.img
                    src={photos[photo] ?? photos[0]}
                    alt={current.name}
                    referrerPolicy="no-referrer"
                    initial={{ scale: still ? 1 : 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: still ? 0 : 1.7, delay: still ? 0 : photo === 0 ? 0.5 : 0, ease: SETTLE }}
                    className="w-full h-full object-contain object-bottom"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            {photos.length > 1 && (
              <div className="absolute z-10 left-5 md:left-7 bottom-4 flex gap-1.5">
                {photos.slice(0, 4).map((p, i) => (
                  <button key={p} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} className={`w-10 h-12 overflow-hidden border bg-[#fff] transition-colors ${i === photo ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={small(p)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 md:px-7 pt-5 pb-6">
            <motion.div key={tee} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: still ? 0 : 0.35, ease: SETTLE }}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-semibold">{teeName(current)}</h2>
                <Link to={`/product/${current.id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-ink transition-colors whitespace-nowrap">Full details <ArrowRight size={14} /></Link>
              </div>
              {STORIES[current.id] && <p className="mt-2 text-neutral-500 text-[15px] leading-relaxed">{STORIES[current.id]}</p>}
              {specs.length > 0 && <p className="mt-3 eyebrow text-neutral-500">{specs.map(s => s.value).join(' · ')}</p>}
            </motion.div>
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-200 px-5 md:px-7 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <BuyBar tees={tees} size={size} price={price} onSize={onSize} onAdd={onAdd} />
        </div>
      </motion.aside>
    </>
  );
};
