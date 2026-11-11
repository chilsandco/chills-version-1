// Meta Conversions API: sends shopping events from the server, so ads still see
// sales when the browser Pixel is blocked. Each event shares its event_id with
// the browser Pixel event, so Meta counts it once.
//
// Env: META_PIXEL_ID (or VITE_META_PIXEL_ID), META_CAPI_TOKEN, and optionally
// META_TEST_EVENT_CODE while checking events in Events Manager > Test events.

import axios from "axios";
import crypto from "crypto";

const API_VERSION = "v21.0";

const pixelId = () => process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || "";
const token = () => process.env.META_CAPI_TOKEN || "";
export const metaEnabled = () => !!(pixelId() && token());

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
const hashed = (v: unknown) => (norm(v) ? sha256(norm(v)) : undefined);

/** Indian numbers as 91XXXXXXXXXX, which is the format Meta matches on. */
const phoneDigits = (v: unknown) => {
  const d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`;
  return d;
};

export function readCookie(header: string | undefined, name: string) {
  const m = (header || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Browser identifiers worth keeping with an order, read from the checkout request. */
export function browserContext(req: { headers: Record<string, any>; ip?: string }) {
  const cookie = req.headers.cookie as string | undefined;
  return {
    fbp: readCookie(cookie, "_fbp"),
    fbc: readCookie(cookie, "_fbc"),
    ua: req.headers["user-agent"] as string | undefined,
    ip: req.ip,
    url: req.headers.referer as string | undefined,
  };
}

type Ctx = ReturnType<typeof browserContext>;

async function send(event: Record<string, unknown>) {
  if (!metaEnabled()) return;
  const body: Record<string, unknown> = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  try {
    await axios.post(`https://graph.facebook.com/${API_VERSION}/${pixelId()}/events`, body, {
      params: { access_token: token() },
      timeout: 8000,
    });
  } catch (err: any) {
    console.error("[CHILS & CO. META] Conversions API failed:", err?.response?.data?.error?.message || err?.message);
  }
}

const userData = (ctx: Partial<Ctx>, extra: Record<string, unknown> = {}) => {
  const u: Record<string, unknown> = {
    client_ip_address: ctx.ip,
    client_user_agent: ctx.ua,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
    ...extra,
  };
  Object.keys(u).forEach(k => (u[k] === undefined || u[k] === "") && delete u[k]);
  return u;
};

/** AddToCart, relayed from the browser with the same event_id the Pixel used. */
export function sendAddToCart(ctx: Ctx, eventId: string, data: { value: number; contentIds: string[]; contentName?: string; url?: string }) {
  return send({
    event_name: "AddToCart",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: data.url || ctx.url,
    user_data: userData(ctx),
    custom_data: {
      currency: "INR",
      value: data.value,
      content_type: "product",
      content_ids: data.contentIds,
      ...(data.contentName ? { content_name: data.contentName } : {}),
    },
  });
}

const sentPurchases = new Set<string>();

/** Meta keys stored on the WooCommerce order at checkout (hidden in WP admin by the leading underscore). */
export const ORDER_META_KEYS = { fbp: "_meta_fbp", fbc: "_meta_fbc", ua: "_meta_ua", ip: "_meta_ip", url: "_meta_url" } as const;

export function orderMetaFrom(ctx: Ctx) {
  return (Object.keys(ORDER_META_KEYS) as (keyof typeof ORDER_META_KEYS)[])
    .filter(k => ctx[k])
    .map(k => ({ key: ORDER_META_KEYS[k], value: String(ctx[k]) }));
}

/** Purchase, sent once a WooCommerce order is paid. The event_id matches the browser's. */
export function sendPurchase(order: any) {
  if (!order?.id || !metaEnabled()) return;
  const id = String(order.id);
  if (sentPurchases.has(id)) return;
  sentPurchases.add(id);

  const meta = (key: string) => (order.meta_data || []).find((m: any) => m.key === key)?.value;
  const ctx: Partial<Ctx> = {
    fbp: meta(ORDER_META_KEYS.fbp),
    fbc: meta(ORDER_META_KEYS.fbc),
    ua: meta(ORDER_META_KEYS.ua),
    ip: meta(ORDER_META_KEYS.ip),
    url: meta(ORDER_META_KEYS.url),
  };
  const b = order.billing || {};
  const items: any[] = order.line_items || [];

  return send({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: `purchase-${id}`,
    action_source: "website",
    event_source_url: ctx.url || "https://chilsandco.com/checkout",
    user_data: userData(ctx, {
      em: hashed(b.email),
      ph: phoneDigits(b.phone) ? sha256(phoneDigits(b.phone)) : undefined,
      fn: hashed(b.first_name),
      ln: hashed(b.last_name),
      ct: hashed(String(b.city || "").replace(/\s+/g, "")),
      st: hashed(String(b.state || "").replace(/\s+/g, "")),
      zp: hashed(b.postcode),
      country: hashed(b.country || "in"),
      external_id: order.customer_id ? sha256(String(order.customer_id)) : undefined,
    }),
    custom_data: {
      currency: order.currency || "INR",
      value: Number(order.total) || 0,
      order_id: id,
      content_type: "product",
      content_ids: items.map(i => String(i.product_id)),
      contents: items.map(i => ({ id: String(i.product_id), quantity: i.quantity, item_price: Number(i.price) || undefined })),
      num_items: items.reduce((n, i) => n + (Number(i.quantity) || 0), 0),
    },
  });
}
