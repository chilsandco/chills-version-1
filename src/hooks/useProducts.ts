import { useEffect, useState } from 'react';
import { Product } from '../types';
import { applyStudio } from '../data/studio';

let cache: Promise<Product[]> | null = null;

const load = () => {
  if (!cache) {
    cache = fetch('/api/products')
      .then(r => r.json())
      .then(d => (Array.isArray(d) ? (d as Product[]).map(applyStudio) : []))
      .catch(() => { cache = null; return [] as Product[]; });
  }
  return cache;
};

/** Shared, cached product list so sections on a page don't refetch. */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    load().then(p => { if (live) { setProducts(p); setLoading(false); } });
    return () => { live = false; };
  }, []);
  return { products, loading };
}

const full = new Map<string, Promise<Product | null>>();

/** The list endpoint omits variations; orders and stock checks need them. */
export function fetchFullProduct(id: string) {
  if (!full.has(id)) {
    full.set(id, fetch(`/api/products/${id}`).then(r => (r.ok ? r.json() : null)).then(p => (p ? applyStudio(p as Product) : null)).catch(() => { full.delete(id); return null; }));
  }
  return full.get(id)!;
}

/** Colour to order: only sent when the product's variations actually carry one. */
export function orderColor(p: Product, preferred?: string) {
  if (!p.variations?.some(v => v.attributes.color)) return undefined;
  return preferred ?? p.availableColors?.[0];
}

export function sizeAvailable(p: Product, size: string, color?: string) {
  if (!p.variations) return true;
  const matches = p.variations.filter(v => v.attributes.size === size && (!color || !v.attributes.color || v.attributes.color === color));
  return matches.some(v => (v.manageStock ? (v.stockQuantity ?? 0) > 0 : v.stockStatus !== 'outofstock'));
}
