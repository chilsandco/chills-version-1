// Our photos re-set on one seamless studio backdrop (scripts/studio.swift).
// Models and crops are untouched. New uploads simply fall back to the original.
import { Product } from '../types';
import map from './studioImages.json';
import posters from './posterImages.json';

const table = map as Record<string, string>;
// The store moved on 12 Nov 2026 and its photos got new upload folders (same file names),
// so photos are also matched by file name alone.
const fileName = (key: string) => key.split('/').pop() ?? key;
const byName: Record<string, string> = Object.fromEntries(Object.entries(table).map(([k, v]) => [fileName(k), v]));

export function studio(url: string): string {
  if (!url || url.startsWith('/studio/')) return url;
  try {
    const key = decodeURIComponent(url).split('/uploads/')[1]?.split(/[?&]/)[0];
    return (key && (table[key] || byName[fileName(key)])) || url;
  } catch {
    return url;
  }
}

export function applyStudio<T extends Product>(p: T): T {
  return {
    ...p,
    images: (p.images ?? []).map(studio),
    ...(p.variations ? { variations: p.variations.map(v => ({ ...v, images: (v.images ?? []).map(studio) })) } : {}),
  };
}

/** A 640px version for cards and thumbnails; full-size photos stay for galleries. */
export function small(url: string): string {
  const u = studio(url);
  return u.startsWith('/studio/') && !u.startsWith('/studio/s/') ? u.replace('/studio/', '/studio/s/') : u;
}

const POSTERS = new Set(posters as string[]);
const POSTER_NAMES = new Set((posters as string[]).map(fileName));

/** Marketing infographics: fine for a listing, wrong for a gallery wall. */
export function isPoster(url: string) {
  if (POSTERS.has(url)) return true;
  try {
    const key = decodeURIComponent(url).split('/uploads/')[1]?.split(/[?&]/)[0] ?? '';
    return POSTERS.has(key) || POSTER_NAMES.has(fileName(key));
  } catch {
    return false;
  }
}
