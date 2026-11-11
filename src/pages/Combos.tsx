import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { TeeTab, Trilogy, editionOf, teeName, trilogyName } from '../components/Trilogy';
import { useCart } from '../CartContext';
import { orderColor, useProducts } from '../hooks/useProducts';
import { SHOWN_COLOR } from '../data/lookbook';
import { Product } from '../types';

/** A new set lands in Everyday until it is given a range here. */
const RANGES = [
  { label: 'Everyday', line: 'The three you reach for most.', match: /^(Core|Stealth)/ },
  { label: 'Oversized', line: 'Drop shoulders in heavyweight cotton.', match: /^Earth/ },
  { label: 'Polos', line: 'A collar for the days that ask for one.', match: /^Polo/ },
  { label: 'TwinTex', line: 'Cotton inside, polyester outside.', match: /^TwinTex/ },
];

/** Trilogies per range on the full page; the rest sit behind See all. */
const PREVIEW = 4;

type Entry = { combo: Product; name: string; edition: string; no: number; tees: Product[]; regular: number; price: number };

/** Long enough for the band to slide off before the tab opens. */
const BAND_OFF = 620;

const rangeOf = (combo: Product) => Math.max(0, RANGES.findIndex(r => r.match.test(combo.name)));

/** Every set of three, as numbered Trilogies grouped by range. */
const Combos: React.FC = () => {
  const { products, loading } = useProducts();
  const { addComboToCart } = useCart();
  const [params, setParams] = useSearchParams();
  const list = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const timer = useRef<number | undefined>(undefined);
  const [banded, setBanded] = useState<string | null>(null);
  const [range, setRange] = useState<number | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tee, setTee] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);

  const closets = useMemo<Entry[]>(() => {
    const sets = products.filter(p => p.type === 'grouped' || p.category?.toLowerCase() === 'combos');
    return sets
      .map(combo => {
        const tees = (combo.groupedProducts ?? []).map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 3) as Product[];
        const regular = tees.reduce((sum, t) => sum + t.price, 0);
        const { no, label } = editionOf(combo, sets);
        return { combo, name: trilogyName(combo), edition: label, no, tees, regular, price: Math.round(regular * 0.9) };
      })
      .filter(c => c.tees.length === 3)
      .sort((a, b) => a.no - b.no);
  }, [products]);

  const rows = RANGES
    .map((r, i) => ({ ...r, index: i, closets: closets.filter(c => rangeOf(c.combo) === i) }))
    .filter(r => r.closets.length > 0);
  const visible = range === null ? rows : rows.filter(r => r.index === range);
  const opened = closets.find(c => c.combo.id === openId);

  const choose = (next: number | null) => {
    setRange(next);
    const top = list.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 130, behavior: 'smooth' });
  };

  // the band slides off and the tees fan out, then the tab opens
  const pick = (id: string, teeId: string) => {
    if (banded) return;
    setBanded(id);
    setTee(teeId);
    timer.current = window.setTimeout(() => setOpenId(id), still ? 0 : BAND_OFF);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const close = useCallback(() => {
    setOpenId(null);
    setBanded(null);
    if (params.get('id')) setParams({}, { replace: true });
  }, [params, setParams]);

  // shared links and the bag land on a Trilogy with its tab already open
  const linked = params.get('id');
  useEffect(() => {
    const c = closets.find(x => x.combo.id === linked);
    if (c) { setBanded(c.combo.id); setOpenId(c.combo.id); setTee(c.tees[0].id); }
  }, [linked, closets]);

  useEffect(() => {
    if (!opened) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [opened]);

  const addToBag = (full: Product[]) => {
    if (!opened || !size) return;
    addComboToCart(
      { ...opened.combo, name: `${opened.name} ${opened.edition}`, price: opened.price, images: [full[0].images[0]] },
      full.map(p => ({
        id: p.id,
        name: p.name,
        selectedSize: size,
        selectedColor: orderColor(p, SHOWN_COLOR[p.id]) ?? '',
        image: p.images[0],
        price: p.price,
        variations: p.variations,
      }))
    );
    window.dispatchEvent(new CustomEvent('pulse-cart'));
    close();
    window.dispatchEvent(new CustomEvent('bag-open'));
  };

  const tab = (label: string, count: number, value: number | null) => (
    <button key={label} onClick={() => choose(value)} aria-current={range === value} className={`relative shrink-0 py-3.5 text-sm transition-colors duration-500 ${range === value ? 'text-ink' : 'text-neutral-500 hover:text-ink'}`}>
      {label}<sup className="ml-0.5 text-[10px] text-neutral-400">{count}</sup>
      {range === value && <motion.span layoutId="trilogy-range" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-x-0 bottom-0 h-px bg-ink" />}
    </button>
  );

  return (
    <div className="seamless min-h-screen pt-16 md:pt-[72px] pb-20 text-ink overflow-x-clip">
      <SEO
        title="Trilogies | CHILS & CO."
        description="Your week, sorted. Three tees chosen to go together, banded as a numbered Trilogy. Pick your size and save 10%."
        canonical="https://chilsandco.com/pick-your-three"
      />

      <header className="max-w-[1500px] mx-auto px-5 md:px-12 pt-6 md:pt-10 pb-3 md:pb-5 flex flex-col md:flex-row md:items-end justify-between gap-1 md:gap-6">
        <h1 className="text-[34px] md:text-[56px] leading-none font-semibold tracking-[-0.035em]">Your week, sorted.</h1>
        <p className="text-neutral-500 md:text-lg">Three tees, banded together. Save 10%.</p>
      </header>

      <div className="sticky top-16 md:top-[72px] z-30 bg-[#fff] md:bg-[#fff]/90 md:backdrop-blur border-y border-neutral-200">
        <nav aria-label="Trilogy ranges" className="max-w-[1500px] mx-auto px-5 md:px-12 flex gap-6 md:gap-9 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tab('All', closets.length, null)}
          {rows.map(r => tab(r.label, r.closets.length, r.index))}
        </nav>
      </div>

      <div ref={list} className="max-w-[1500px] mx-auto px-2 md:px-12">
        {!loading && closets.length === 0 && (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center gap-5">
            <p className="text-neutral-500">No Trilogies are available right now.</p>
            <Link to="/collection" className="border-b border-ink pb-0.5 text-sm">Shop the collection</Link>
          </div>
        )}

        {visible.map(r => {
          const shown = range === null ? r.closets.slice(0, PREVIEW) : r.closets;
          return (
            <section key={r.label} className="pt-5 md:pt-14 max-md:bg-[#fff] max-md:rounded-2xl max-md:mt-2 max-md:px-3 max-md:pb-6">
              <div className="flex items-baseline justify-between gap-4 mb-5 md:mb-8">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-3xl font-semibold">{r.label}</h2>
                  <p className="text-sm md:text-base text-neutral-500 mt-0.5">{r.line}</p>
                </div>
                {shown.length < r.closets.length && (
                  <button onClick={() => choose(r.index)} className="shrink-0 inline-flex items-center gap-1.5 text-sm border-b border-ink pb-0.5">
                    See all {r.closets.length} <ArrowRight size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 md:gap-x-12 gap-y-10 md:gap-y-16">
                {shown.map(c => (
                  <article key={c.combo.id}>
                    <Trilogy edition={c.edition} tees={c.tees} open={banded === c.combo.id} onPick={id => pick(c.combo.id, id)} />
                    <button onClick={() => pick(c.combo.id, c.tees[0].id)} className="mt-5 md:mt-6 w-full text-left group">
                      <span className="block text-sm md:text-base font-semibold truncate">{c.name}</span>
                      <span className="hidden md:block text-sm text-neutral-500 truncate mt-0.5 group-hover:text-ink transition-colors">{c.tees.map(teeName).join(', ')}</span>
                      <span className="block text-sm mt-0.5"><span className="text-neutral-500">3 tees · </span><span className="font-medium">₹{c.price.toLocaleString()}</span></span>
                    </button>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <AnimatePresence>
        {opened && tee && (
          <TeeTab
            name={`${opened.name} ${opened.edition}`}
            tees={opened.tees}
            tee={tee}
            size={size}
            price={opened.price}
            onTee={setTee}
            onSize={setSize}
            onAdd={addToBag}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Combos;
