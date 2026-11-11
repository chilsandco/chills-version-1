import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FeatureSpread, ModelFloor, ModelRow } from '../components/ModelFloor';
import SEO from '../components/SEO';
import { Product } from '../types';
import { parseSearchQuery } from '../components/SearchOverlay';
import { GROUPS, Group, curateRows } from '../data/groups';
import { OPENING, lookPhoto } from '../data/lookbook';
import { useProducts } from '../hooks/useProducts';
import { useNarrow } from '../hooks/useNarrow';
import CollectionChooser from '../components/CollectionChooser';
import { Sheet } from '../components/PhoneHome';
import { PhoneGrid } from '../components/ModelFloor';

type Sort = 'featured' | 'best' | 'low' | 'high';
const SORTS: { id: Sort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'best', label: 'Best selling' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
];
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const rank = (s: string) => (SIZE_ORDER.indexOf(s) === -1 ? 99 : SIZE_ORDER.indexOf(s));
const EASE = [0.22, 1, 0.36, 1] as const;

const isCombo = (p: Product) =>
  p.type === 'grouped' ||
  [p.category, ...(p.categories || [])].some(c => c === 'Combos' || c?.toLowerCase() === 'combos-redirect');

const inStock = (p: Product) =>
  p.status === 'Available' &&
  (p.variations ? p.variations.some(v => (v.manageStock ? v.stockQuantity > 0 : v.stockStatus !== 'outofstock')) : true);

const inGroup = (p: Product, g: Group) => (p.categories || [p.category]).includes(g.category);

const Collection: React.FC = () => {
  const { products, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const creatorQuery = params.get('creator');
  const searchQuery = params.get('search') || '';
  const group = GROUPS.find(g => g.slug === params.get('group')) ?? null;

  const [sort, setSort] = useState<Sort>('featured');
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [stockOnly, setStockOnly] = useState(false);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const pickGroup = (slug: string | null) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('group', slug); else next.delete('group');
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const base = useMemo(() => products.filter(p => !isCombo(p)), [products]);

  const priceCeiling = useMemo(
    () => Math.max(1000, Math.ceil(Math.max(0, ...base.map(p => p.price)) / 100) * 100),
    [base]
  );
  useEffect(() => { setMaxPrice(priceCeiling); }, [priceCeiling]);

  const allSizes = useMemo(() => {
    const s = new Set<string>();
    base.forEach(p => (p.availableSizes || []).forEach(x => s.add(x)));
    return Array.from(s).sort((a, b) => rank(a) - rank(b));
  }, [base]);

  const filtered = useMemo(() => {
    return base.filter(p => {
      if (creatorQuery && p.coCreator?.toLowerCase() !== creatorQuery.toLowerCase()) return false;
      if (p.price > maxPrice) return false;
      if (stockOnly && !inStock(p)) return false;
      if (sizes.length && !(p.availableSizes || []).some(s => sizes.includes(s))) return false;
      if (searchQuery) {
        const { textQuery, priceMax, priceMin } = parseSearchQuery(searchQuery);
        if (textQuery && !(p.name.toLowerCase().includes(textQuery) || p.category?.toLowerCase().includes(textQuery) || p.description?.toLowerCase().includes(textQuery))) return false;
        if (priceMax !== null && p.price > priceMax) return false;
        if (priceMin !== null && p.price < priceMin) return false;
      }
      return true;
    });
  }, [base, sizes, maxPrice, stockOnly, creatorQuery, searchQuery]);

  const shown = useMemo(() => {
    const list = group ? filtered.filter(p => inGroup(p, group)) : [...filtered];
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    else if (sort === 'high') list.sort((a, b) => b.price - a.price);
    else if (sort === 'best') list.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
    else list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return list;
  }, [filtered, group, sort]);

  const activeFilters = sizes.length + (stockOnly ? 1 : 0) + (maxPrice < priceCeiling ? 1 : 0);
  const reset = () => { setSizes([]); setStockOnly(false); setMaxPrice(priceCeiling); };

  // The curated view is the default way in; any filter or sort drops to a full grid.
  const curated = !group && !searchQuery && !creatorQuery && activeFilters === 0 && sort === 'featured';
  const count = (g: Group) => filtered.filter(p => inGroup(p, g)).length;
  const rows = useMemo(() => curateRows(filtered, 5), [filtered]);
  const narrow = useNarrow(768);

  return (
    <div className="pt-16 md:pt-[72px] bg-[#fff] text-ink">
      <SEO
        title={`${group ? group.name : 'Shop all'} | CHILS & CO.`}
        description={group ? group.line : 'Shop polos, minimals, blacks, oversized and regular-fit tees by CHILS & CO.'}
        canonical={`https://chilsandco.com/collection${group ? `?group=${group.slug}` : ''}`}
      />

      {/* HEADER */}
      {group ? (
        <header className={`relative overflow-hidden ${group.dark ? 'text-[#fff]' : 'text-ink'}`} style={{ backgroundColor: group.tone }}>
          <div className="max-w-[1600px] mx-auto px-5 md:px-10 h-[230px] md:h-[380px] flex items-center">
            <motion.div key={group.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="relative z-10 max-w-[62%] md:max-w-xl">
              <button onClick={() => pickGroup(null)} className={`eyebrow mb-3 md:mb-4 block ${group.dark ? 'text-[#fff]/60' : 'text-stone'}`}>← All collections</button>
              <h1 className="text-[44px] md:text-[88px] leading-none font-semibold">{group.name}</h1>
              <p className={`mt-3 md:mt-4 text-sm md:text-lg ${group.dark ? 'text-[#fff]/70' : 'text-stone'}`}>{group.line}</p>
            </motion.div>
            <motion.img
              key={group.model}
              src={group.model}
              alt=""
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: EASE }}
              className="absolute right-[-4%] md:right-[8%] top-3 md:top-6 h-[210%] max-w-none object-contain object-top"
            />
          </div>
        </header>
      ) : (
        searchQuery || creatorQuery ? (
          <header className="seamless">
            <div className="max-w-[1680px] mx-auto px-5 md:px-10 py-10 md:py-16">
              <h1 className="text-[44px] md:text-[88px] leading-none font-semibold">{searchQuery ? `“${searchQuery}”` : `By ${creatorQuery}`}</h1>
            </div>
          </header>
        ) : narrow ? (
          <header className="max-w-[1680px] mx-auto px-4 pt-3 pb-4"><h1>Shop all</h1></header>
        ) : (
          <CollectionChooser count={slug => count(GROUPS.find(g => g.slug === slug)!)} onPick={pickGroup} />
        )
      )}

      {/* STICKY TOOLBAR */}
      <div className="sticky top-16 md:top-[72px] z-30 bg-[#fff]/95 backdrop-blur border-b border-black/10">
        <div className="max-w-[1680px] mx-auto px-5 md:px-10 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-5 md:gap-7 overflow-x-auto py-3.5 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ slug: null as string | null, name: 'All' }, ...GROUPS].map(g => {
              const on = (group?.slug ?? null) === g.slug;
              return (
                <button key={g.name} onClick={() => pickGroup(g.slug)} aria-current={on} className={`shrink-0 text-sm transition-colors ${on ? 'font-semibold text-ink' : 'text-stone hover:text-ink'}`}>
                  {g.name}
                </button>
              );
            })}
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-sm text-stone whitespace-nowrap mr-2">{loading ? '' : `${shown.length} products`}</span>
            <select value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort" className="bg-transparent border border-black/15 px-3 py-2 text-[13px] outline-none cursor-pointer">
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <button onClick={() => setDrawer(true)} className="shrink-0 inline-flex items-center gap-2 border border-black/15 px-3 md:px-4 py-2 text-[13px] hover:border-black/50 transition-colors">
            <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Filter</span>
            {activeFilters > 0 && <span className="bg-ink text-[#fff] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>}
          </button>
        </div>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <div className="floor-band h-[640px] animate-pulse" aria-hidden />
      ) : curated && narrow ? (
        <div className="bg-[#efefef] pt-2 pb-2">
          {GROUPS.map(g => (
            <Sheet key={g.slug} title={g.name} to={`/collection?group=${g.slug}`} action={`View all ${count(g)}`}>
              <PhoneGrid products={(rows[g.slug] ?? []).slice(0, 4)} black={g.slug === 'blacks'} />
            </Sheet>
          ))}
        </div>
      ) : curated ? (
        <div>
          {GROUPS.map((g, i) => (
            <React.Fragment key={g.slug}>
              <section>
                <div className={g.dark ? 'text-[#fff]' : 'text-ink'} style={{ backgroundColor: g.tone }}>
                  <div className="max-w-[1680px] mx-auto px-5 md:px-10 pt-10 pb-8 md:pt-20 md:pb-14 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow opacity-50 mb-2 md:mb-3">Collection {String(i + 1).padStart(2, '0')}</p>
                      <h2 className="text-[46px] md:text-[112px] font-semibold leading-[.95] tracking-[-0.04em]">{g.name}</h2>
                      <p className="opacity-60 mt-2 md:mt-4 text-sm md:text-lg">{g.line}</p>
                    </div>
                    <button onClick={() => pickGroup(g.slug)} className="shrink-0 inline-flex items-center gap-2 text-sm border-b border-current pb-0.5 cursor-pointer">View all {count(g)} <ArrowRight size={14} /></button>
                  </div>
                </div>
                <ModelRow products={(rows[g.slug] ?? []).slice(0, narrow ? 2 : 4)} black={g.slug === 'blacks'} />
              </section>
              {i === 1 && rows.oversized?.[4] && <div><FeatureSpread product={rows.oversized[4]} eyebrow="In focus" /></div>}
              {i === 2 && (
                <section className="floor-band text-ink overflow-hidden">
                  <div className="max-w-[1680px] mx-auto px-5 md:px-10 pt-12 md:pt-16 grid md:grid-cols-2 items-end gap-4">
                    <div className="pb-2 md:pb-24">
                      <p className="eyebrow text-stone mb-3">Three tees, chosen to go together</p>
                      <h2 className="text-[38px] md:text-[80px] font-semibold leading-[1]">Pick your three. Save 10%.</h2>
                      <Link to="/pick-your-three" className="mt-7 inline-flex items-center gap-2 bg-ink text-[#fff] px-7 py-4 text-sm font-medium hover:opacity-85 transition-opacity">See the Trilogies <ArrowRight size={15} /></Link>
                    </div>
                    <div className="flex items-end justify-center gap-1 md:gap-3 h-[300px] md:h-[560px]">
                      {OPENING.slice(0, 3).map((id, n) => (
                        <img key={id} src={lookPhoto(id)} alt="" loading="lazy" className="w-auto object-contain object-bottom" style={{ height: `${[84, 100, 90][n]}%` }} />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </React.Fragment>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <section className="text-center py-24 px-6 min-h-[50vh]">
          <Search className="mx-auto mb-5 opacity-30" size={36} />
          <h2 className="text-2xl font-semibold">Nothing matches those filters</h2>
          <p className="text-stone mt-2">Try removing a filter or searching for something else.</p>
          <button onClick={reset} className="mt-7 bg-ink text-[#fff] px-8 py-3 text-sm">Clear filters</button>
        </section>
      ) : (
        <ModelFloor products={shown} eyebrow={group?.name} spreads={sort === 'featured'} black={group?.slug === 'blacks'} />
      )}

      {/* CUSTOM */}
      <section className="max-w-[1600px] mx-auto px-5 md:px-10 py-14 md:py-24 text-center">
        <p className="text-stone mb-5">Want to wear it your way?</p>
        <Link to="/customize" className="inline-block border border-black/30 px-8 py-4 text-sm font-medium hover:bg-ink hover:text-[#fff] transition-colors">Design your own in Custom Studio</Link>
      </section>

      {/* FILTER DRAWER */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0e0e0c]/35 z-[60]" onClick={() => setDrawer(false)} />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#fff] text-ink z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
                <h2 className="text-xl font-semibold">Filter</h2>
                <button onClick={() => setDrawer(false)} aria-label="Close"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-9" data-lenis-prevent>
                <div className="md:hidden">
                  <h3 className="text-xs uppercase tracking-widest font-semibold mb-3">Sort</h3>
                  <select value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort" className="w-full bg-transparent border border-black/20 px-3 py-3 text-sm outline-none">
                    {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest font-semibold mb-4">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(s => (
                      <button key={s} onClick={() => setSizes(p => (p.includes(s) ? p.filter(x => x !== s) : [...p, s]))} aria-pressed={sizes.includes(s)} className={`min-w-12 h-12 px-3 border text-sm ${sizes.includes(s) ? 'bg-ink text-[#fff] border-ink' : 'border-black/20 hover:border-black/60'}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Max price</h3>
                    <span className="text-sm">₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input type="range" min={100} max={priceCeiling} step={50} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-[#0e0e0c]" aria-label="Maximum price" />
                </div>

                <button onClick={() => setStockOnly(v => !v)} aria-pressed={stockOnly} className="w-full flex items-center justify-between">
                  <span className="text-sm">In stock only</span>
                  <span className={`w-6 h-6 border flex items-center justify-center ${stockOnly ? 'bg-ink border-ink text-[#fff]' : 'border-black/30'}`}>{stockOnly && <Check size={14} />}</span>
                </button>
              </div>

              <div className="px-6 py-5 border-t border-black/10 flex gap-3">
                <button onClick={reset} className="flex-1 border border-black/25 py-4 text-sm">Reset</button>
                <button onClick={() => setDrawer(false)} className="flex-[2] bg-ink text-[#fff] py-4 text-sm font-medium">Show {shown.length} product{shown.length === 1 ? '' : 's'}</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collection;
