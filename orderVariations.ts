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

/** One line of a GA4 ecommerce event. */
export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  discount?: number;
}

/** "Carbon Grey / M": the colour and size of a line, in the form GA4's item_variant expects. */
export const variantLabel = (size?: string | null, color?: string | null) =>
  [color, size].map(v => String(v || "").trim()).filter(Boolean).join(" / ") || undefined;

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * The parts of a store order that Google Analytics needs for "purchase": no names, addresses or
 * contact details. `productOf` looks up the product in the catalogue, so names and categories match the
 * other shop events (the store's line name also carries the colour and size).
 */
export function purchaseAnalytics(order: any, productOf: (productId: string) => { name?: string; category?: string } | undefined) {
  const lines = Array.isArray(order?.line_items) ? order.line_items : [];
  const metaValue = (meta: any[], test: RegExp) => {
    const m = (meta || []).find((x: any) => !String(x?.key || "").startsWith("_") && (test.test(String(x?.key || "")) || test.test(String(x?.display_key || ""))));
    const v = m ? (m.display_value ?? m.value) : undefined;
    return typeof v === "string" ? v.replace(/<[^>]*>/g, "").trim() : undefined;
  };
  const items: AnalyticsItem[] = lines.map((l: any) => {
    const quantity = Math.max(1, Number(l.quantity) || 1);
    const subtotal = Number(l.subtotal ?? l.total) || 0;
    const total = Number(l.total ?? l.subtotal) || 0;
    const id = String(l.product_id ?? "");
    const discount = round2((subtotal - total) / quantity);
    const product = productOf(id);
    const item: AnalyticsItem = {
      item_id: id,
      item_name: String(product?.name || l.name || ""),
      item_category: product?.category,
      item_variant: variantLabel(metaValue(l.meta_data, /size/i), metaValue(l.meta_data, /colou?r/i)),
      price: round2(subtotal / quantity),
      quantity,
    };
    if (discount > 0) item.discount = discount;
    return item;
  });
  const coupons = (Array.isArray(order?.coupon_lines) ? order.coupon_lines : [])
    .map((c: any) => String(c?.code || "").trim().toUpperCase()).filter(Boolean);
  return {
    transaction_id: String(order?.id ?? ""),
    currency: String(order?.currency || "INR"),
    value: round2(Number(order?.total) || 0),
    shipping: round2(Number(order?.shipping_total) || 0),
    tax: round2(Number(order?.total_tax) || 0),
    ...(coupons.length ? { coupon: coupons.join(",") } : {}),
    items,
  };
}
