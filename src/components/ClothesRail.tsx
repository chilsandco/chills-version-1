import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, X } from 'lucide-react';
import { fetchFullProduct, orderColor, sizeAvailable, useProducts } from '../hooks/useProducts';
import { useCart } from '../CartContext';
import { useNarrow } from '../hooks/useNarrow';
import { RAIL, RailItem, SHOWN_COLOR } from '../data/lookbook';
import { Product } from '../types';

const EASE = [0.22, 1, 0.36, 1] as const;

const Hanger: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 120 58" fill="none" aria-hidden className={className}>
    <path d="M60 24V12a6.5 6.5 0 1 0-6.5-6.5" stroke="#8d8a83" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M60 23c-4 1-46 24-54 29-3 2-2 5 1 5h106c3 0 4-3 1-5-8-5-50-28-54-29Z" fill="#7a4f33" />
    <path d="M60 23c-4 1-46 24-54 29 16-6 92-6 108 0-8-5-50-28-54-29Z" fill="#94633f" />
  </svg>
);

const Clip: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 46" fill="none" aria-hidden className={className}>
    <path d="M20 16V6a4 4 0 1 0-4-4" stroke="#8d8a83" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="8" y="16" width="24" height="26" rx="2" fill="#2a2925" />
    <rect x="8" y="16" width="24" height="5" rx="1.5" fill="#55534c" />
  </svg>
);

type Entry = { item: RailItem; product: Product };

const frontOf = ({ item, product }: Entry) => item.front ?? product.images[item.photo ?? 0] ?? product.images[0];
const backOf = ({ item, product }: Entry) => item.back ?? (item.backPhoto !== undefined ? product.images[item.backPhoto] : undefined);

const Focus: React.FC<{ entry: Entry; index: number; total: number; onClose: () => void }> = ({ entry, index, total, onClose }) => {
  const { addToCart } = useCart();
  const { item } = entry;
  const [product, setProduct] = useState(entry.product);
  const color = orderColor(product, SHOWN_COLOR[product.id]);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let live = true;
    fetchFullProduct(entry.product.id).then(f => { if (f && live) setProduct(f); });
    return () => { live = false; };
  }, [entry.product.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[80] seamless text-ink overflow-y-auto"
      data-lenis-prevent
      role="dialog" aria-modal="true" aria-label={product.name}
    >
      <button onClick={onClose} aria-label="Close" className="fixed top-5 right-5 md:top-8 md:right-8 z-10 w-11 h-11 rounded-full bg-[#fff] border border-black/10 flex items-center justify-center hover:bg-ink hover:text-[#fff] transition-colors">
        <X size={17} />
      </button>
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-14">
        <div className="relative h-[52vh] md:h-[60vh] aspect-[4/5] flex items-start justify-center">
          {item.front && <div className="absolute left-1/2 -top-[9vh] h-[6vh] w-px bg-[#8d8a83]" />}
          {item.front
            ? <Hanger className="absolute z-10 -top-[3.2vh] left-1/2 -translate-x-1/2 w-[44%]" />
            : <Clip className="absolute z-10 -top-5 left-1/2 -translate-x-1/2 w-7" />}
          <AnimatePresence mode="wait">
            <motion.img
              key={side}
              src={side === 'back' && backOf(entry) ? backOf(entry) : frontOf(entry)}
              alt={`${product.name}, ${side}`}
              initial={{ rotateY: 80, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -80, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              referrerPolicy="no-referrer"
              className={item.front ? 'max-h-full max-w-full object-contain drop-shadow-[0_26px_26px_rgba(20,18,12,.18)]' : 'h-full w-full object-cover shadow-[0_24px_50px_rgba(20,18,12,.16)]'}
            />
          </AnimatePresence>
        </div>

        <p className="eyebrow text-stone mt-7">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</p>
        <h3 className="text-3xl md:text-4xl font-semibold mt-2 text-center">{product.name}</h3>
        <p className="text-sm text-stone mt-1.5">{product.category} · ₹{product.price.toLocaleString()}</p>

        {backOf(entry) && (
          <div className="flex gap-6 mt-4 text-sm">
            {(['front', 'back'] as const).map(s => (
              <button key={s} onClick={() => setSide(s)} className={`capitalize pb-1 border-b ${side === s ? 'border-ink' : 'border-transparent text-stone'}`}>{s}</button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {(product.availableSizes ?? []).map(s => {
            const soldOut = !sizeAvailable(product, s, color);
            return (
              <button key={s} disabled={soldOut} onClick={() => { setSize(s); setAdded(false); }} aria-pressed={size === s} aria-label={soldOut ? `${s}, sold out` : s} className={`min-w-12 h-11 px-3 rounded-full border text-sm transition-colors ${soldOut ? 'border-black/10 text-black/25 line-through cursor-not-allowed' : size === s ? 'bg-ink text-[#fff] border-ink' : 'border-black/20 hover:border-ink'}`}>{s}</button>
            );
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full max-w-md">
          <button
            disabled={!size}
            onClick={() => { if (size) { if (product.variations) addToCart(product, size, color); else return; window.dispatchEvent(new CustomEvent('pulse-cart')); onClose(); window.dispatchEvent(new CustomEvent('bag-open')); } }}
            className="flex-1 bg-ink text-[#fff] py-4 text-sm font-medium disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {added ? <><Check size={15} /> Added to bag</> : size ? 'Add to bag' : 'Select a size'}
          </button>
          <Link to={`/product/${product.id}`} className="flex-1 border border-ink py-4 text-sm font-medium text-center hover:bg-ink hover:text-[#fff] transition-colors">View details</Link>
        </div>
      </div>
    </motion.div>
  );
};

/** Garments hang edge-on along a steel rail and turn to face you. */
const ClothesRail: React.FC = () => {
  const { products } = useProducts();
  const narrow = useNarrow();
  const [active, setActive] = useState(4);
  const [focus, setFocus] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const entries = useMemo(
    () => RAIL.map(item => ({ item, product: products.find(p => p.id === item.id) })).filter(e => e.product) as Entry[],
    [products]
  );

  useEffect(() => {
    document.body.style.overflow = focus !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [focus]);

  // Phones: swipe along the rail; whichever print is centred faces you.
  useEffect(() => {
    const el = scroller.current;
    if (!narrow || !el) return;
    el.scrollLeft = 0;
    setActive(0);
  }, [narrow, entries.length]);

  const onSwipe = () => {
    const el = scroller.current;
    if (!narrow || !el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const n = c as HTMLElement;
      const d = Math.abs(n.offsetLeft + n.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    setActive(best);
  };

  const centre = (i: number) => {
    const n = scroller.current?.children[i] as HTMLElement | undefined;
    n?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  if (entries.length === 0) return <div className="h-[640px] bg-[#fff]" aria-hidden />;
  const current = entries[Math.min(active, entries.length - 1)];
  const best = [...entries].sort((a, b) => (b.product.totalSales || 0) - (a.product.totalSales || 0))[0]?.product.id;

  return (
    <section className="bg-[#fff] text-ink pt-16 md:pt-32 pb-16 md:pb-28 overflow-hidden">
      <p className="eyebrow text-center">
        New collection <span className="mx-2 text-black/25">|</span> <span className="text-stone">Premium streetwear</span>
      </p>

      <div className="relative mt-9 md:mt-16">
        <div aria-hidden className="absolute z-20 inset-x-0 top-5 h-[5px] bg-gradient-to-b from-[#c9c8c3] via-[#8f8e88] to-[#6d6c67]" />
        <div
          ref={scroller}
          onScroll={onSwipe}
          className={narrow
            ? 'flex items-start overflow-x-auto snap-x snap-mandatory px-[19vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'flex justify-center items-start px-4'}
        >
          {entries.map(({ item, product }, i) => {
            const on = i === active;
            return (
              <motion.button
                key={item.id}
                onMouseEnter={() => { if (!narrow) setActive(i); }}
                onFocus={() => { if (!narrow) setActive(i); }}
                onClick={() => { if (on) setFocus(i); else if (narrow) centre(i); else setActive(i); }}
                aria-label={`${product.name}, ₹${product.price}`}
                animate={narrow ? undefined : { width: on ? 'var(--on)' : 'var(--off)' }}
                transition={{ duration: 0.6, ease: EASE }}
                className={narrow
                  ? 'relative shrink-0 snap-center w-[62vw] h-[calc(62vw*1.34+64px)] outline-none'
                  : 'relative shrink-0 h-[440px] outline-none cursor-pointer [--on:280px] [--off:74px] xl:[--on:320px] xl:[--off:96px]'}
              >
                <motion.span
                  className={narrow ? 'absolute inset-0 block origin-top' : 'absolute top-0 left-1/2 w-[300px] -ml-[150px] h-full block origin-top'}
                  style={{ transformPerspective: 1400 }}
                  animate={narrow
                    ? { rotateY: on ? 0 : i < active ? 32 : -32, scale: on ? 1 : 0.84 }
                    : { rotateY: on ? 0 : 74, rotateZ: on ? [0, -1.1, 0.6, 0] : 0 }}
                  transition={{ duration: narrow ? 0.35 : 0.75, ease: EASE }}
                >
                  {item.front
                    ? <Hanger className="absolute z-30 top-[9px] left-1/2 -translate-x-1/2 w-[132px] md:w-[148px]" />
                    : <Clip className="absolute z-30 top-[14px] left-1/2 -translate-x-1/2 w-6" />}
                  <img
                    src={frontOf({ item, product })}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className={item.front
                      ? 'absolute top-[52px] left-1/2 -translate-x-1/2 max-w-[92%] max-h-[350px] object-contain drop-shadow-[0_16px_14px_rgba(20,18,12,.2)]'
                      : 'absolute top-[40px] left-1/2 -translate-x-1/2 w-[92%] md:w-[88%] aspect-[3/4] object-cover bg-paper shadow-[0_14px_26px_rgba(20,18,12,.14)]'}
                  />
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-6 px-6 min-h-[132px]">
        <AnimatePresence mode="wait">
          <motion.div key={current.item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <p className="font-medium text-lg">{current.product.name}</p>
            <p className="text-sm text-stone mt-0.5">₹{current.product.price.toLocaleString()} · {current.product.category}{current.product.id === best ? ' · Best seller' : ''}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => setFocus(active)} className="bg-ink text-[#fff] rounded-full px-6 py-3 text-sm font-medium inline-flex items-center gap-2 hover:opacity-85 transition-opacity">
            Closer look <ArrowRight size={15} />
          </button>
          <Link to="/collection" className="border border-black/20 rounded-full px-7 py-3 text-sm font-medium hover:border-ink transition-colors">Shop all</Link>
        </div>
      </div>

      <AnimatePresence>
        {focus !== null && entries[focus] && (
          <Focus entry={entries[focus]} index={focus} total={entries.length} onClose={() => setFocus(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ClothesRail;
