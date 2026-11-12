import { Product } from '../types';
import cutouts from './cutouts.json';

// The store's collections, shown as editorial groups. `category` must match the
// WooCommerce category name exactly.
export interface Group {
  slug: string;
  name: string;
  category: string;
  line: string;
  model: string;
  /** Three products shown together on the collection opening. */
  trio: [string, string, string];
  /** Studio backdrop colour for this group. */
  tone: string;
  dark?: boolean;
}

export const GROUPS: Group[] = [
  { slug: 'polos', name: 'Polos', category: 'Polos', line: 'TwinTex polos. Cotton inside, polyester outside.', model: '/looks/1301_3.webp', trio: ['517', '446', '455'], tone: '#e9edf0' },
  { slug: 'minimals', name: 'Minimals', category: 'Minimals', line: 'Quiet colour and one small mark. Nothing extra.', model: '/looks/1281_3.webp', trio: ['411', '482', '491'], tone: '#f3f2ee' },
  { slug: 'blacks', name: 'Blacks', category: 'Shades of Black', line: 'Every shade of black, in every fit.', model: '/looks/1134_3.webp', trio: ['697', '240', '526'], tone: '#e7e5df' },
  { slug: 'oversized', name: 'Oversized', category: 'Drop Shoulder/Oversized', line: 'Drop shoulders in heavyweight 240 GSM cotton.', model: '/looks/2048_3.webp', trio: ['364', '16', '546'], tone: '#ece4d8' },
  { slug: 'regular', name: 'Regular Fit', category: 'Regular Fit', line: 'A clean everyday cut, with graphics for people who build.', model: '/looks/1683_3.webp', trio: ['140', '231', '110'], tone: '#e6e9e2' },
];

// ── Shop all curation ────────────────────────────────────────────────────────
// Products belong to several WooCommerce categories, so a plain "top 4 per
// group" repeats the same tees and makes the range look small. On Shop all each
// product therefore gets one home group. Opening a group still shows everything.

/**
 * Whoever comes first claims the product. Every minimal also sits in another
 * group, so Minimals must claim early (after Polos) or its row ends up empty.
 */
const HOME_PRIORITY = ['polos', 'minimals', 'blacks', 'oversized', 'regular'];

const COLOR_FAMILIES: [string, RegExp][] = [
  ['black', /black|charcoal|onyx/i],
  ['grey', /gr[ae]y|melange|carbon|slate/i],
  ['blue', /blue|navy|azure|denim/i],
  ['green', /green|olive|sage|moss/i],
  ['red', /red|maroon|wine|burgundy|plum/i],
  ['brown', /brown|coffee|mocha|rust/i],
  ['light', /white|cream|ecru|beige|sand|vanilla/i],
];

export const colorFamily = (p: Product) => {
  const c = p.availableColors?.[0] ?? '';
  return COLOR_FAMILIES.find(([, re]) => re.test(c))?.[0] ?? c.toLowerCase();
};

/** The same design under different names ("Developer", "Developer Legacy"). */
const designOf = (p: Product) => p.name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/)[0];

const inGroupCategory = (p: Product, g: Group) => (p.categories || [p.category]).includes(g.category);

/** Rows on the floor need someone standing, so full-body shots go first. */
const standsOnFloor = (p: Product) => (cutouts as Record<string, { kind: string }>)[p.id]?.kind === 'full';

/** Picks for each group's Shop all row: no product twice, no design in two rows, no colour twice in a row. */
export function curateRows(products: Product[], perRow = 4): Record<string, Product[]> {
  const bySales = [...products].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
  const homes: Record<string, Product[]> = {};
  const claimed = new Set<string>();
  for (const slug of HOME_PRIORITY) {
    const group = GROUPS.find(g => g.slug === slug)!;
    homes[slug] = bySales.filter(p => inGroupCategory(p, group) && !claimed.has(p.id));
    homes[slug].forEach(p => claimed.add(p.id));
  }
  // A multi-colour tee's first photo may not be black, so single-colour tees lead the Blacks row.
  homes.blacks.sort((a, b) => Number((a.availableColors?.length ?? 0) > 1) - Number((b.availableColors?.length ?? 0) > 1));

  const rows: Record<string, Product[]> = {};
  const designs = new Set<string>();
  for (const slug of HOME_PRIORITY) {
    const row: Product[] = [];
    const colors = new Set<string>();
    const take = (ok: (p: Product) => boolean) => {
      for (const p of homes[slug]) {
        if (row.length >= perRow) return;
        if (row.includes(p) || !ok(p)) continue;
        row.push(p);
        colors.add(colorFamily(p));
        designs.add(designOf(p));
      }
    };
    // strictest first; relax only if a group runs short
    take(p => standsOnFloor(p) && !colors.has(colorFamily(p)) && !designs.has(designOf(p)));
    take(p => standsOnFloor(p) && !designs.has(designOf(p)));
    take(p => standsOnFloor(p));
    take(p => !designs.has(designOf(p)));
    take(() => true);
    rows[slug] = row;
  }
  return rows;
}

/** The studio colour for a product page, taken from its collection. Blacks stay light so black tees show. */
export function productTone(p: Product) {
  const order = ['polos', 'oversized', 'regular', 'minimals'];
  const g = order.map(slug => GROUPS.find(x => x.slug === slug)!).find(x => inGroupCategory(p, x));
  return g?.tone ?? '#f3f2ee';
}
