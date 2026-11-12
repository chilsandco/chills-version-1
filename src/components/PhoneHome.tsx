import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useProducts } from '../hooks/useProducts';
import { openQuickView } from '../lib/quickView';
import { PhoneGrid } from './ModelFloor';
import { Trilogy } from './Trilogy';
import { GROUPS, curateRows } from '../data/groups';
import { OPENING, SHOWN_COLOR } from '../data/lookbook';
import { Product } from '../types';

const DWELL = 6500;
const FIRST_TRILOGY = '1727';

const Pill: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="shrink-0 bg-ink text-[#fff] rounded-full px-4 py-2 text-xs font-medium">{children}</Link>
);

export const Sheet: React.FC<{ title: string; to?: string; action?: string; children: React.ReactNode }> = ({ title, to, action = 'View all', children }) => (
  <section className="bg-[#fff] rounded-2xl mx-2 mb-2 pt-4 pb-5 px-2">
    <div className="flex items-center justify-between gap-3 px-2 mb-3">
      <h2 className="text-base font-semibold">{title}</h2>
      {to && <Pill to={to}>{action}</Pill>}
    </div>
    {children}
  </section>
);

/** The phone home page: photography edge to edge, then tees straight away. */
const PhoneHome: React.FC = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const still = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [stopped, setStopped] = useState(false);

  const heroes = useMemo(() => OPENING.map(id => products.find(p => p.id === id)).filter(p => p?.images?.[0]) as Product[], [products]);
  const hero = heroes[slide % Math.max(heroes.length, 1)];

  useEffect(() => {
    if (stopped || still || heroes.length < 2) return;
    const t = setInterval(() => { if (!document.hidden) setSlide(s => s + 1); }, DWELL);
    return () => clearInterval(t);
  }, [stopped, still, heroes.length]);

  useEffect(() => {
    const next = heroes[(slide + 1) % Math.max(heroes.length, 1)];
    if (next) new Image().src = next.images[0];
  }, [slide, heroes]);

  const rows = useMemo(() => curateRows(products.filter(p => p.type !== 'grouped' && p.status === 'Available' && p.images?.length && p.category !== 'Combos')), [products]);
  const latest = useMemo(() => GROUPS.flatMap(g => (rows[g.slug] ?? []).slice(0, 2)).filter((p, i, all) => all.findIndex(x => x.id === p.id) === i).slice(0, 6), [rows]);

  const firstSet = useMemo(() => {
    const ids = products.find(p => p.id === FIRST_TRILOGY)?.groupedProducts ?? [];
    return ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [products]);

  const shop = () => {
    if (!hero) return;
    setStopped(true);
    openQuickView(hero, SHOWN_COLOR[hero.id]);
  };

  return (
    <div className="bg-[#efefef] text-ink pt-16">
      <section aria-label="CHILS & CO." className="relative h-[calc(84svh-64px)] min-h-[520px] overflow-hidden bg-[#e4e3df]">
        <AnimatePresence initial={false}>
          {hero && (
            <motion.img
              key={hero.id}
              src={hero.images[0]}
              alt={hero.name}
              referrerPolicy="no-referrer"
              onClick={shop}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#0e0e0c]/75 via-[#0e0e0c]/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-[#fff] text-center pointer-events-none">
          <h1 className="keep text-[26px] leading-[1.15] font-semibold tracking-[-0.02em]">Designed by techies.<br />For those who build.</h1>
          <Link to="/collection" className="pointer-events-auto inline-block mt-3 text-sm border-b border-[#fff] pb-0.5">Shop now</Link>
          {hero && <p className="mt-3 text-xs opacity-70">{hero.name}</p>}
        </div>
      </section>

      <div className="-mt-4 relative pb-2">
        <Sheet title="Latest" to="/collection">
          <PhoneGrid products={latest} />
        </Sheet>

        <Sheet title="Trilogies" to="/pick-your-three" action="See all">
          <p className="px-2 -mt-1 mb-5 text-sm text-neutral-500">Three tees, banded together. Save 10%.</p>
          <div className="w-[70%] mx-auto pb-2">
            {firstSet.length === 3 && <Trilogy edition="N° 01" tees={firstSet} onPick={() => navigate('/pick-your-three')} />}
          </div>
        </Sheet>

        <section className="pt-3 pb-4">
          <h2 className="text-base font-semibold px-4 mb-3">Shop by range</h2>
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {GROUPS.map(g => (
              <Link key={g.slug} to={`/collection?group=${g.slug}`} className="snap-center shrink-0 relative w-[62vw] aspect-[3/4] rounded-2xl overflow-hidden" style={{ backgroundColor: g.tone }}>
                <img src={g.model} alt="" loading="lazy" className="absolute inset-x-0 bottom-0 mx-auto h-[94%] object-contain object-bottom" />
                <span className="absolute left-3 bottom-3 bg-[#fff] rounded-full px-3 py-1.5 text-xs font-medium">{g.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <Sheet title="Oversized" to="/collection?group=oversized">
          <PhoneGrid products={(rows.oversized ?? []).slice(0, 4)} />
        </Sheet>

        <section className="bg-[#fff] rounded-2xl mx-2 p-5">
          <h2 className="text-base font-semibold mb-3">Good to know</h2>
          <ul className="text-sm text-neutral-500 space-y-2">
            <li>Delivered across India, from ₹80</li>
            <li>7-day returns</li>
            <li>From Miyapur, Hyderabad</li>
          </ul>
          <Link to="/our-promise" className="inline-block mt-4 text-sm border-b border-ink pb-0.5">Our promise</Link>
        </section>
      </div>
    </div>
  );
};

export default PhoneHome;
