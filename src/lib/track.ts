// Shopping steps for Google Analytics 4 (the gtag already in index.html).
// Only the live site reports, so local testing never pollutes the numbers.

import { CartItem, Product } from '../types';

type Item = { item_id: string; item_name: string; price: number; quantity: number; item_variant?: string; item_category?: string };

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

export const itemOf = (p: Product, size?: string, quantity = 1): Item => ({
  item_id: String(p.id), item_name: p.name, price: p.price, quantity, item_variant: size, item_category: p.category,
});

/** Bag lines as analytics items; a Trilogy counts as one item at its set price. */
export const cartItems = (cart: CartItem[]): Item[] => cart.map(i => ({
  item_id: String(i.comboId ?? i.id), item_name: i.name, price: i.price, quantity: i.quantity,
  item_variant: i.selectedSize, item_category: i.isCombo ? 'Trilogy' : i.category,
}));

export const cartValue = (cart: CartItem[]) => cart.reduce((n, i) => n + i.price * i.quantity, 0);

/** A purchase is reported once per order, even if the confirmation page reloads. */
export function trackPurchase(orderId: string, value: number, currency = 'INR') {
  const key = `chils-purchase-${orderId}`;
  try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch { /* storage blocked */ }
  track('purchase', { transaction_id: orderId, value, currency });
  // The server sends the same event (event id purchase-<order>) once the payment is confirmed.
  if (pixelOn()) window.fbq?.('track', 'Purchase', { currency, value, order_id: orderId }, { eventID: `purchase-${orderId}` });
}
