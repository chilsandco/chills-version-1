import { useEffect, useState } from 'react';
import { Product } from '../types';
import { applyStudio } from '../data/studio';

let cache: Promise<Product[]> | null = null;

/** The shared product list: one request per visit, started as the app boots (see main.tsx). */
export const loadProducts = () => {
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
    loadProducts().then(p => { if (live) { setProducts(p); setLoading(false); } });
    return () => { live = false; };
  }, []);
  return { products, loading };
}

const full = new Map<string, { at: number; p: Promise<Product | null> }>();

/** The list endpoint omits variations; orders and stock checks need them. Shared by everything on
 *  the page that needs the same product, and fetched again after a minute so stock stays current. */
export function fetchFullProduct(id: string) {
  const hit = full.get(id);
  if (!hit || Date.now() - hit.at > 60_000) {
    full.set(id, {
      at: Date.now(),
      p: fetch(`/api/products/${id}`).then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .then(p => applyStudio(p as Product)).catch(() => { full.delete(id); return null; }),
    });
  }
  return full.get(id)!.p;
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
