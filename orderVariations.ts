// Matches an order line to its WooCommerce variation, so the order records the
// exact size and reduces that size's stock.

export interface OrderVariation {
  id: string | number;
  attributes?: { size?: string; color?: string };
  price?: string | number;
  stockStatus?: string;
  stockQuantity?: number | null;
  manageStock?: boolean;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const COLOR_ATTRS = ["color", "pa_color", "colors", "pa_colors", "colour", "pa_colour", "colours", "pa_colours"];
const SIZE_ATTRS = ["size", "pa_size", "sizes", "pa_sizes"];

/** Converts a raw WooCommerce variation to the shape the storefront uses. */
export function mapWooVariation(v: any): OrderVariation {
  const attributes: OrderVariation["attributes"] = {};
  (Array.isArray(v.attributes) ? v.attributes : []).forEach((attr: any) => {
    const name = (attr.name || "").toLowerCase();
    if (COLOR_ATTRS.includes(name)) attributes.color = attr.option;
    if (SIZE_ATTRS.includes(name)) attributes.size = attr.option;
  });
  return { id: v.id, attributes, price: v.price, stockStatus: v.stock_status, stockQuantity: v.stock_quantity, manageStock: v.manage_stock === true };
}

const hasStock = (v: OrderVariation) =>
  v.manageStock ? (v.stockQuantity ?? 0) > 0 : v.stockStatus !== "outofstock";

/**
 * Single-colour products usually vary by size alone, while the cart still
 * carries a colour name. A colour therefore only has to match when the
 * variation actually has one. Some products list the same size twice, so an
 * in-stock variation is preferred over a sold-out duplicate.
 */
export function findVariation(variations: OrderVariation[], size?: string | null, color?: string | null) {
  const matches = variations.filter(v => {
    const a = v.attributes ?? {};
    const sizeOk = size ? !!a.size && same(a.size, size) : true;
    const colorOk = color && a.color ? same(a.color, color) : true;
    return sizeOk && colorOk;
  });
  return matches.find(hasStock) ?? matches[0];
}

/** The price to charge comes from WooCommerce, never from the browser. */
export function trustedPrice(variation: OrderVariation | undefined, productPrice: unknown): number | null {
  const n = Number(variation?.price || productPrice);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export interface StoreCoupon {
  code: string;
  amount: string;
  discount_type: string;
  date_expires_gmt?: string | null;
  usage_limit?: number | null;
  usage_count?: number;
  minimum_amount?: string;
}

/** Why a coupon can't be used, or null when it can. */
export function couponProblem(c: StoreCoupon | undefined, subtotal: number, hasSet: boolean, now = new Date()): string | null {
  if (!c) return "That code isn't valid.";
  if (hasSet) return "Codes can't be combined with sets.";
  if (c.date_expires_gmt && new Date(`${c.date_expires_gmt}Z`) < now) return 'That code has expired.';
  if (c.usage_limit && (c.usage_count ?? 0) >= c.usage_limit) return 'That code has been fully used.';
  const min = Number(c.minimum_amount || 0);
  if (min > 0 && subtotal < min) return `This code needs an order of ₹${min.toLocaleString('en-IN')} or more.`;
  return null;
}
