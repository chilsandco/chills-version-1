// Shopping steps for Google Analytics 4 (the gtag already in index.html).
// Only the live site reports, so local testing never pollutes the numbers.

import { CartItem, Product } from '../types';

// Every ecommerce event follows the GA4 schema: currency "INR", value, and items with item_id, item_name,
// item_category, item_variant ("Colour / Size"), price and quantity.
export type Item = { item_id: string; item_name: string; item_category?: string; item_variant?: string; price: number; quantity: number; discount?: number };

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; fbq?: any; _fbq?: any }
}

const live = () => typeof window !== 'undefined' && /(^|\.)chilsandco\.com$/.test(window.location.hostname);
const DEV = !!(import.meta as any).env?.DEV;

export function track(event: string, params: Record<string, unknown> = {}) {
  if (live()) window.gtag?.('event', event, params);
  else if (DEV) console.debug('[track]', event, params);
}

// ── Meta Pixel ──────────────────────────────────────────────────────────────
// Loaded only on the live site and only when VITE_META_PIXEL_ID is set at build
// time. AddToCart and Purchase share an event id with the server's Conversions
// API event (metaCapi.ts), so Meta counts each one once.

const PIXEL_ID: string = (import.meta as any).env?.VITE_META_PIXEL_ID || '';
const pixelOn = () => !!PIXEL_ID && live();

export function initMetaPixel() {
  if (!pixelOn() || window.fbq) return;
  const n: any = (window.fbq = function (...args: unknown[]) {
    n.callMethod ? n.callMethod(...args) : n.queue.push(args);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', PIXEL_ID);
}

/** One PageView per route, since the site is a single-page app. */
export function metaPageView() {
  if (pixelOn()) window.fbq?.('track', 'PageView');
}

const eventId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function metaAddToCart(value: number, contentIds: string[], contentName?: string) {
  const id = eventId('atc');
  if (!pixelOn()) { if (DEV) console.debug('[meta] AddToCart', { value, contentIds, id }); return; }
  window.fbq?.('track', 'AddToCart', { currency: 'INR', value, content_type: 'product', content_ids: contentIds, content_name: contentName }, { eventID: id });
  fetch('/api/meta/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'AddToCart', eventId: id, value, contentIds, contentName, url: window.location.href }),
    keepalive: true,
  }).catch(() => { /* the Pixel event still counts */ });
}

/** "Carbon Grey / M", or just one of them, or nothing when neither is chosen yet. */
export const variantOf = (size?: string | null, color?: string | null) =>
  [color, size].map(v => String(v || '').trim()).filter(Boolean).join(' / ') || undefined;

const money = (n: unknown) => Math.round((Number(n) || 0) * 100) / 100;
const itemsValue = (items: Item[]) => money(items.reduce((n, i) => n + i.price * i.quantity, 0));

export const itemOf = (p: Product, size?: string | null, color?: string | null, quantity = 1): Item => ({
  item_id: String(p.id), item_name: p.name, item_category: p.category, item_variant: variantOf(size, color),
  price: money(p.price), quantity,
});

/** Bag lines as analytics items; a Trilogy counts as one item at its set price. */
export const cartItems = (cart: CartItem[]): Item[] => cart.map(i => ({
  item_id: String(i.comboId ?? i.id), item_name: i.name, item_category: i.isCombo ? 'Trilogy' : i.category,
  item_variant: i.isCombo
    ? variantOf((i.comboItems || []).map(c => c.selectedSize).filter(Boolean).join(', '))
    : variantOf(i.selectedSize, i.selectedColor),
  price: money(i.price), quantity: i.quantity,
}));

export const cartValue = (cart: CartItem[]) => itemsValue(cartItems(cart));

/** view_item, add_to_cart, remove_from_cart and begin_checkout: value is always the items' total. */
export function trackItems(event: 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout', items: Item[]) {
  if (items.length) track(event, { currency: 'INR', value: itemsValue(items), items });
}

export interface PurchaseDetails {
  transaction_id: string;
  value: number;
  currency?: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  items?: Item[];
}

const reportedPurchases = new Set<string>();

/** A purchase is reported once per order, even if the confirmation page reloads or keeps polling. */
export function trackPurchase(p: PurchaseDetails) {
  const orderId = String(p.transaction_id || '');
  if (!orderId || reportedPurchases.has(orderId)) return;
  reportedPurchases.add(orderId);
  const key = `chils-purchase-${orderId}`;
  try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch { /* storage blocked: the in-memory guard still holds */ }
  const currency = p.currency || 'INR';
  const value = money(p.value);
  track('purchase', {
    transaction_id: orderId, currency, value,
    shipping: money(p.shipping), tax: money(p.tax),
    ...(p.coupon ? { coupon: p.coupon } : {}),
    items: p.items || [],
  });
  // The server sends the same event (event id purchase-<order>) once the payment is confirmed.
  if (pixelOn()) window.fbq?.('track', 'Purchase', { currency, value, order_id: orderId }, { eventID: `purchase-${orderId}` });
}
