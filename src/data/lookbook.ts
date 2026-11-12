import { legacyId } from './legacyIds';
// Editorial content for the Line-Up and the Rail. Model cut-outs live in
// /public/looks and come from the store's own photography (scripts/cutout.swift).
// Product ids are WooCommerce ids.

/** The first tees to walk: the calmest of the range, with no bright prints. */
export const OPENING = ['546', '411', '526', '482', '491', '564'];

export const lookPhoto = (id: string) => `/looks/${legacyId(id)}_3.webp`;

/** Head-to-toe cut-outs for tees whose everyday cut-out is cropped. */
export const WALK_PHOTOS: Record<string, string> = {
  '222': '/walk/1755.webp',
  '54': '/walk/2011.webp',
  '45': '/walk/2026.webp',
};

export interface RailItem {
  id: string;
  /** Which of the product's own photos to hang (default: the first). */
  photo?: number;
  backPhoto?: number;
  /**
   * Transparent hanger shots. When set, the garment hangs from a wooden hanger
   * instead of showing as a clipped print: drop files in /public/rail and add
   * e.g. front: '/rail/1115-front.webp', back: '/rail/1115-back.webp'.
   */
  front?: string;
  back?: string;
}

export const RAIL: RailItem[] = [
  { id: '411' },
  { id: '582' },
  { id: '491' },
  { id: '725' },
  { id: '546' },
  { id: '16', photo: 2, backPhoto: 0 },
  { id: '761' },
  { id: '618' },
  { id: '482' },
];

/** Multi-colour products: the colour shown in our imagery. */
export const SHOWN_COLOR: Record<string, string> = { '16': 'Elemental Blue' };

/** The discount the server applies per combo line item (server.ts, create-order). */
