import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { editionOf, folded, trilogyName } from './Trilogy';
import { Product } from '../types';

const isSet = (p: Product) => p.type === 'grouped' || p.category?.toLowerCase() === 'combos';

/** The first Trilogy that includes any of these tees, with its three tees and set price. */
export function useTrilogyFor(ids: string[]) {
  const { products } = useProducts();
  return useMemo(() => {
    const sets = products.filter(isSet);
    for (const id of ids) {
      const combo = sets.find(c => c.groupedProducts?.includes(id));
      if (!combo) continue;
      const tees = (combo.groupedProducts ?? []).map(t => products.find(p => p.id === t)).filter(Boolean) as Product[];
      if (tees.length < 3) continue;
      const regular = tees.reduce((n, t) => n + t.price, 0);
      return { combo, tees, regular, price: Math.round(regular * 0.9), name: `${trilogyName(combo)} ${editionOf(combo, sets).label}`, from: products.find(p => p.id === id) };
    }
    return null;
  }, [products, ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Three folded tees, overlapping: a small picture of the set. */
const MiniStack: React.FC<{ tees: Product[] }> = ({ tees }) => (
  <span className="relative block w-14 h-[60px] shrink-0">
    {tees.slice(0, 3).map((t, i) => (
      <img key={t.id} src={folded(t.id)} alt="" loading="lazy" className="absolute left-0 w-14" style={{ top: i * 12, zIndex: i + 1, filter: 'drop-shadow(0 2px 3px rgba(30,22,10,.3))' }} />
    ))}
  </span>
);

/** "This tee comes in a Trilogy": shown where people decide, on the product page and in the bag. */
const TrilogyHint: React.FC<{ ids: string[]; onGo?: () => void; className?: string }> = ({ ids, onGo, className = '' }) => {
  const t = useTrilogyFor(ids);
  if (!t) return null;
  return (
    <Link to={`/combos?id=${t.combo.id}`} onClick={onGo} className={`group flex items-center gap-3 rounded-xl bg-paper p-3 pr-4 ${className}`}>
      <MiniStack tees={t.tees} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug">{t.from ? `${t.from.name.replace(/^TwinTex Polo - /, '')} comes in ${t.name}` : t.name}</span>
        <span className="block text-xs text-neutral-500 mt-0.5">All three for ₹{t.price.toLocaleString()} <s className="opacity-70">₹{t.regular.toLocaleString()}</s> · save 10%</span>
      </span>
      <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
};

export default TrilogyHint;
