// Editorial content for the Line-Up and the Rail. Model cut-outs live in
// /public/looks and come from the store's own photography (scripts/cutout.swift).
// Product ids are WooCommerce ids.

/** The first tees to walk: the calmest of the range, with no bright prints. */
export const OPENING = ['1115', '1320', '1134', '1281', '1276', '1105'];

export const lookPhoto = (id: string) => `/looks/${id}_3.webp`;

/** Head-to-toe cut-outs for tees whose everyday cut-out is cropped. */
export const WALK_PHOTOS: Record<string, string> = {
  '1755': '/walk/1755.webp',
  '2011': '/walk/2011.webp',
  '2026': '/walk/2026.webp',
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
  { id: '1320' },
  { id: '1081' },
  { id: '1276' },
  { id: '719' },
  { id: '1115' },
  { id: '2048', photo: 2, backPhoto: 0 },
  { id: '761' },
  { id: '1041' },
  { id: '1281' },
];

/** Multi-colour products: the colour shown in our imagery. */
export const SHOWN_COLOR: Record<string, string> = { '2048': 'Elemental Blue' };

/** The discount the server applies per combo line item (server.ts, create-order). */
