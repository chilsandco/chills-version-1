import React, { useEffect, useMemo, useState } from 'react';
import { small } from '../data/studio';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useNarrow } from '../hooks/useNarrow';
import { fetchFullProduct, orderColor, sizeAvailable } from '../hooks/useProducts';
import { keySpecs, STORIES } from '../data/stories';

const EASE = [0.22, 1, 0.36, 1] as const;

export { openQuickView } from '../lib/quickView';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

/** Choose colour and size and add to the bag without leaving the page. */
const QuickView: React.FC = () => {
  const { addToCart } = useCart();
  const narrow = useNarrow();
  const { pathname } = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [full, setFull] = useState<Product | null>(null);
  const [color, setColor] = useState<string | undefined>();
  const [size, setSize] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const { product: p, color: wanted } = (e as CustomEvent<{ product: Product; color?: string }>).detail;
      setProduct(p); setFull(null); setSize(null); setNudge(false); setColor(wanted ?? p.availableColors?.[0]);
      fetchFullProduct(p.id).then(f => { if (f) setFull(f); });
    };
    window.addEventListener('quick-view', onOpen);
    return () => window.removeEventListener('quick-view', onOpen);
  }, []);

  useEffect(() => { setProduct(null); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = product ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setProduct(null); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [product]);

  const item = full ?? product;
  const images = useMemo(() => {
    if (!item) return [];
    const v = color ? item.variations?.find(x => x.attributes.color === color)?.images : undefined;
    return (v?.length ? v : item.images).slice(0, 4);
  }, [item, color]);
  const sizes = useMemo(
    () => [...(item?.availableSizes ?? [])].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)),
    [item]
  );

  const specs = keySpecs(item?.description ?? '', item?.fit).slice(0, 3);

  const add = () => {
    if (!full) return;
    if (!size) { setNudge(true); return; }
    addToCart(full, size, orderColor(full, color));
    setProduct(null);
    window.dispatchEvent(new CustomEvent('pulse-cart'));
    window.dispatchEvent(new CustomEvent('bag-open'));
  };

  return (
    <AnimatePresence>
      {product && item && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProduct(null)} className="fixed inset-0 z-[90] bg-[#0e0e0c]/35 backdrop-blur-[2px]" />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={`Quick view: ${item.name}`}
            initial={narrow ? { y: '100%' } : { x: '100%' }} animate={narrow ? { y: 0 } : { x: 0 }} exit={narrow ? { y: '100%' } : { x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed z-[91] bg-[#fff] text-ink flex flex-col inset-x-0 bottom-0 h-[90svh] rounded-t-2xl md:rounded-none md:inset-x-auto md:right-0 md:top-0 md:h-full md:w-[520px] overflow-hidden"
          >
            <button onClick={() => setProduct(null)} aria-label="Close" className="absolute z-10 top-4 right-4 w-10 h-10 rounded-full bg-[#fff]/90 backdrop-blur border border-black/10 flex items-center justify-center hover:bg-ink hover:text-[#fff] transition-colors">
              <X size={16} />
            </button>

            <div className="flex-1 overflow-y-auto" data-lenis-prevent>
              <div className="flex overflow-x-auto snap-x snap-mandatory bg-paper [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((src, i) => (
                  <img key={src} src={small(src)} alt={`${item.name} ${i + 1}`} referrerPolicy="no-referrer" className="snap-start shrink-0 w-[78%] aspect-[3/4] object-cover border-r border-[#fff]" />
                ))}
              </div>

              <div className="px-6 pt-6 pb-4">
                <p className="eyebrow text-stone">{item.category}</p>
                <div className="flex items-start justify-between gap-4 mt-1.5">
                  <h2 className="text-2xl font-semibold leading-tight">{item.name}</h2>
                  <p className="text-xl font-semibold whitespace-nowrap">₹{item.price.toLocaleString()}</p>
                </div>
                {STORIES[item.id] && <p className="mt-2 text-stone leading-relaxed">{STORIES[item.id]}</p>}
                {specs.length > 0 && <p className="mt-3 eyebrow text-stone">{specs.map(x => x.value).join(' · ')}</p>}

                {(item.availableColors?.length ?? 0) > 1 && (
                  <div className="mt-6">
                    <p className="text-xs text-stone mb-2">Colour <span className="text-ink ml-1">{color}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {item.availableColors!.map(c => {
                        const thumb = item.variations?.find(v => v.attributes.color === c)?.images?.[0];
                        return (
                          <button key={c} onClick={() => { setColor(c); setSize(null); }} aria-label={c} aria-pressed={color === c} className={`w-12 h-[60px] overflow-hidden border ${color === c ? 'border-ink ring-1 ring-ink' : 'border-black/15'}`}>
                            {thumb ? <img src={small(thumb)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <span className="text-[10px] px-1">{c}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className={`text-xs mb-2 ${nudge ? 'text-red-600' : 'text-stone'}`}>{nudge ? 'Please choose a size' : 'Size'}</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => {
                      const soldOut = !!full && !sizeAvailable(full, s, orderColor(full, color));
                      return (
                        <button key={s} disabled={soldOut} onClick={() => { setSize(s); setNudge(false); }} aria-pressed={size === s} aria-label={soldOut ? `${s}, sold out` : s}
                          className={`min-w-[52px] h-12 px-3 border text-sm transition-colors ${soldOut ? 'border-black/10 text-black/25 line-through cursor-not-allowed' : size === s ? 'bg-ink text-[#fff] border-ink' : 'border-black/20 hover:border-ink'}`}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link to={`/product/${item.id}`} className="link-brass inline-flex items-center gap-1.5 mt-6 text-sm">
                  View full details <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button onClick={add} disabled={!full} className="btn-primary w-full py-4 text-sm disabled:opacity-40">
                {full ? `Add to bag · ₹${item.price.toLocaleString()}` : 'Loading…'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
