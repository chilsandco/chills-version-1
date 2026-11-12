import React, { useMemo, useState } from 'react';
import { small } from '../data/studio';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { Product } from '../types';
import { useNarrow } from '../hooks/useNarrow';
import { openQuickView } from '../lib/quickView';
import cutouts from '../data/cutouts.json';

type Kind = 'full' | 'pair' | 'bust';
type Cutout = { src: string; alt?: string; kind: Kind; ratio: number; black?: { src: string; kind: Kind; color: string } };
const CUTOUTS = cutouts as Record<string, Cutout>;
/** On the Blacks page a multi-colour tee is shown in its black colourway. */
const cutoutOf = (p: Product, black = false): (Cutout & { color?: string }) | undefined => {
  const c = CUTOUTS[p.id];
  if (black && c?.black) return { ...c, ...c.black, alt: undefined };
  return c;
};

/** Can stand on the floor (rather than a waist-up shot). */
export const isStanding = (p: Product) => CUTOUTS[p.id]?.kind === 'full' || CUTOUTS[p.id]?.kind === 'pair';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Slight height changes, so a row reads as people standing rather than a grid. */
const DEPTH = [0.93, 1, 0.9, 0.97, 0.91];

const Figure: React.FC<{
  product: Product;
  index: number;
  hovered: string | null;
  setHovered: (id: string | null) => void;
  bust?: boolean;
  black?: boolean;
}> = ({ product, index, hovered, setHovered, bust, black }) => {
  const c = cutoutOf(product, black);
  const on = hovered === product.id;
  const src = c?.src ?? product.images[0];
  const height = bust ? 100 : DEPTH[index % DEPTH.length] * 100;

  return (
    <div
      className={`group relative min-w-0 h-full flex flex-col ${c?.kind === 'pair' ? 'flex-[1.7]' : 'flex-1'}`}
      onMouseEnter={() => setHovered(product.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <Link to={`/product/${product.id}`} aria-label={`${product.name}, ₹${product.price}`} className="relative flex-1 min-h-0 block outline-none">
        <motion.span
          className="absolute inset-0 flex items-end justify-center origin-bottom"
          animate={{ scale: on ? 1.045 : 1 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <span className="relative h-full flex items-end justify-center" style={{ height: `${height}%` }}>
            {!bust && <span aria-hidden className="absolute -bottom-[1%] left-1/2 -translate-x-1/2 w-[112%] min-w-[120px] h-[4%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(20,18,12,.3),transparent)]" />}
            <img src={src} alt={product.name} loading="lazy" draggable={false} referrerPolicy="no-referrer" className={`relative h-full w-auto max-w-none object-contain object-bottom transition-opacity duration-500 ${on && c?.alt ? 'opacity-0' : 'opacity-100'}`} />
            {c?.alt && <img src={c.alt} alt="" aria-hidden loading="lazy" draggable={false} className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-auto max-w-none object-contain object-bottom transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`} />}
          </span>
        </motion.span>
      </Link>

      <div className="relative z-10 pt-5 pb-2 px-1 text-center">
        <Link to={`/product/${product.id}`} className="block text-[13px] md:text-sm font-medium truncate">{product.name}</Link>
        <p className="text-[13px] text-stone mt-0.5">₹{product.price.toLocaleString()}</p>
        <button
          onClick={() => openQuickView(product, c?.color)}
          aria-label={`Quick view ${product.name}`}
          className="relative mt-2 inline-flex items-center gap-1.5 text-xs border-b border-ink pb-0.5 before:absolute before:-inset-x-3 before:-inset-y-3 before:content-[''] md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 focus:opacity-100 transition-all duration-300 cursor-pointer"
        >
          <Plus size={12} /> Quick view
        </button>
      </div>
    </div>
  );
};

/** Phones: real photos, two across, with the name and price under each. */
export const PhoneGrid: React.FC<{ products: Product[]; black?: boolean }> = ({ products, black }) => (
  <div className="grid grid-cols-2 gap-x-2 gap-y-4">
    {products.map(p => {
      const c = cutoutOf(p, black);
      const colourway = black && c?.color;
      return (
        <article key={p.id} className="min-w-0">
          <Link to={`/product/${p.id}`} aria-label={`${p.name}, ₹${p.price}`} className="block aspect-[3/4] rounded-lg overflow-hidden bg-[#e4e3df]">
            <img src={colourway ? c!.src : small(p.images[0])} alt={p.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={`w-full h-full ${colourway ? 'object-contain object-bottom' : 'object-cover object-top'}`} />
          </Link>
          <div className="flex items-start justify-between gap-1 pl-1 pt-2">
            <div className="min-w-0">
              <p className="text-[13px] font-medium truncate">{p.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">₹{p.price.toLocaleString()}</p>
            </div>
            <button onClick={() => openQuickView(p, c?.color)} aria-label={`Quick view ${p.name}`} className="shrink-0 -mr-1 -mt-1 p-2 cursor-pointer"><Plus size={16} strokeWidth={1.6} /></button>
          </div>
        </article>
      );
    })}
  </div>
);

/** One row of models standing on the studio floor. */
export const ModelRow: React.FC<{ products: Product[]; black?: boolean }> = ({ products, black }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const narrow = useNarrow(768);
  if (narrow) return <div className="px-2 pb-6"><PhoneGrid products={products} black={black} /></div>;
  return (
    <div className="floor-band">
      <div className="max-w-[1680px] mx-auto px-3 md:px-10 flex gap-1 md:gap-3 h-[430px] sm:h-[520px] lg:h-[640px] xl:h-[700px] pt-6 md:pt-10">
        {products.map((p, i) => <React.Fragment key={p.id}><Figure product={p} index={i} hovered={hovered} setHovered={setHovered} black={black} /></React.Fragment>)}
      </div>
    </div>
  );
};

/** Waist-up photography: the edge of the band does the cropping, as in print. */
const BustRow: React.FC<{ products: Product[]; black?: boolean }> = ({ products, black }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="relative">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[calc(100%-92px)] seamless" />
      <div className="relative max-w-[1680px] mx-auto px-3 md:px-10 flex gap-1 md:gap-3 h-[350px] sm:h-[440px] lg:h-[520px] pt-8">
        {products.map((p, i) => <React.Fragment key={p.id}><Figure product={p} index={i} hovered={hovered} setHovered={setHovered} bust black={black} /></React.Fragment>)}
      </div>
    </div>
  );
};

/** A full-bleed editorial moment that breaks the rhythm. */
export const FeatureSpread: React.FC<{ product: Product; eyebrow?: string; flip?: boolean; black?: boolean }> = ({ product, eyebrow, flip, black }) => {
  const c = cutoutOf(product, black);
  return (
    <section className="overflow-hidden seamless text-ink">
      <div className="max-w-[1680px] mx-auto px-5 md:px-10 grid md:grid-cols-2 items-end min-h-[560px] md:min-h-[760px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: EASE }}
          className={`self-center pt-14 md:py-20 ${flip ? 'md:order-2 md:pl-10' : ''}`}
        >
          {eyebrow && <p className="eyebrow mb-4 text-stone">{eyebrow}</p>}
          <h2 className="text-[52px] md:text-[96px] xl:text-[128px] leading-[.95] font-semibold">{product.name}</h2>
          <p className="mt-5 text-lg text-stone">₹{product.price.toLocaleString()} · {product.fit || product.category}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => openQuickView(product, c?.color)} className="px-8 py-4 text-sm font-medium cursor-pointer transition-opacity hover:opacity-85 bg-ink text-[#fff]">Quick view</button>
            <Link to={`/product/${product.id}`} className="inline-flex items-center gap-2 px-2 py-4 text-sm border-b border-ink">View details <ArrowRight size={15} /></Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease: EASE }}
          className={`relative flex justify-center ${flip ? 'md:order-1' : ''}`}
        >
          <img src={c?.src ?? product.images[0]} alt={product.name} loading="lazy" draggable={false} className="h-[440px] md:h-[720px] w-auto max-w-none object-contain object-bottom" />
        </motion.div>
      </div>
    </section>
  );
};

type Block =
  | { type: 'row'; items: Product[] }
  | { type: 'bust'; items: Product[] }
  | { type: 'feature'; item: Product; flip: boolean };

/** Lays products out as a run of rows, waist-up bands and editorial spreads. */
export const ModelFloor: React.FC<{ products: Product[]; eyebrow?: string; spreads?: boolean; black?: boolean }> = ({ products, eyebrow, spreads = true, black }) => {
  const narrow = useNarrow(768);
  const medium = useNarrow(1180);
  const perRow = narrow ? 2 : medium ? 4 : 5;

  const blocks = useMemo(() => {
    const out: Block[] = [];
    let row: Product[] = [];
    let width = 0;
    let bust: Product[] = [];
    let rows = 0;
    let flip = false;
    const flushRow = () => {
      if (!row.length) return;
      out.push({ type: 'row', items: row });
      row = []; width = 0; rows++;
    };
    const queue = [...products];
    while (queue.length) {
      const p = queue.shift()!;
      const c = cutoutOf(p, black);
      if (c?.kind === 'bust' || !c) {
        bust.push(p);
        if (bust.length >= Math.min(perRow, 4)) { out.push({ type: 'bust', items: bust }); bust = []; }
        continue;
      }
      // a spread after every second row, so the page keeps changing pace
      if (spreads && rows > 0 && rows % 2 === 0 && !row.length && c.kind === 'full' && queue.length > perRow) {
        out.push({ type: 'feature', item: p, flip });
        flip = !flip;
        rows++;
        continue;
      }
      const w = c.kind === 'pair' ? 2 : 1;
      if (width + w > perRow) flushRow();
      row.push(p);
      width += w;
      if (width >= perRow) flushRow();
    }
    flushRow();
    if (bust.length) out.push({ type: 'bust', items: bust });
    return out;
  }, [products, perRow, spreads, black]);

  if (narrow) return <div className="px-2 pt-4 pb-8"><PhoneGrid products={products} black={black} /></div>;

  return (
    <div>
      {blocks.map((b, i) =>
        b.type === 'row' ? <React.Fragment key={i}><ModelRow products={b.items} black={black} /></React.Fragment>
        : b.type === 'bust' ? <React.Fragment key={i}><BustRow products={b.items} black={black} /></React.Fragment>
        : <React.Fragment key={i}><FeatureSpread product={b.item} eyebrow={eyebrow} flip={b.flip} black={black} /></React.Fragment>
      )}
    </div>
  );
};

export default ModelFloor;
