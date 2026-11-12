// Every product photo is served as a small, fast, long-cached file from our own site:
//  - /studio/<id>.webp  photos re-set on the studio backdrop (scripts/studio.swift)
//  - /p/<id>.webp       the other photos, resized as they are (scripts/size_images.py)
//  - /media/<path>      anything newer than the last sizing run: fetched from the store once,
//                       kept on our server and at the CDN, so only the very first view waits.
// Each has a 640px version under /s/ for cards and thumbnails.
import { Product } from '../types';
import map from './studioImages.json';
import sizedMap from './sizedImages.json';
import posters from './posterImages.json';

const table = map as Record<string, string>;
const sized = sizedMap as Record<string, string>;
const sizedRel = new Map(Object.entries(sized).map(([rel, id]) => [`/p/${id}.webp`, rel]));

/** The path under wp-content/uploads, from a store URL or a /api/media proxy URL. */
function uploadsPath(url: string): string | null {
  try {
    return decodeURIComponent(url).split('/uploads/')[1]?.split(/[?&#]/)[0] || null;
  } catch {
    return null;
  }
}

/** The full-size (about 1000px) version of a product photo. */
export function studio(url: string): string {
  if (!url || /^\/(studio|p|media)\//.test(url)) return url;
  const rel = uploadsPath(url);
  if (!rel) return url;
  if (table[rel]) return table[rel];
  if (sized[rel]) return `/p/${sized[rel]}.webp`;
  return `/media/${rel.split('/').map(encodeURIComponent).join('/')}`;
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
  if (u.startsWith('/studio/') && !u.startsWith('/studio/s/')) return u.replace('/studio/', '/studio/s/');
  if (u.startsWith('/p/') && !u.startsWith('/p/s/')) return u.replace('/p/', '/p/s/');
  if (u.startsWith('/media/') && !u.startsWith('/media/s/')) return u.replace('/media/', '/media/s/');
  return u;
}

/** srcset for a product photo: the 640px and the full version, so phones never fetch more than they show. */
export function srcSet(url: string): string | undefined {
  const s = small(url), l = studio(url);
  return s !== l && !l.startsWith('/media/') ? `${s} 640w, ${l} 1000w` : undefined;
}

const POSTERS = new Set(posters as string[]);

/** Marketing infographics: fine for a listing, wrong for a gallery wall. */
export function isPoster(url: string) {
  if (POSTERS.has(url)) return true;
  const rel = sizedRel.get(url.replace('/p/s/', '/p/')) ?? uploadsPath(url) ?? (url.startsWith('/media/') ? decodeURIComponent(url.replace(/^\/media\/(s\/)?/, '')) : '');
  return !!rel && POSTERS.has(rel);
}
