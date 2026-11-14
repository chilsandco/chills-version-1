// The team's order bot in Slack: every paid order is posted to #orders, and the
// team can mark it packed, delivered in person, or set any WooCommerce status
// from buttons. Changes land in WooCommerce, so the site and WooCommerce's own
// customer emails follow automatically.
//
// It also watches the store every few minutes for:
//   • checkouts that reached PhonePe but were never paid (with a WhatsApp button)
//   • new return requests (Approve / Reject)
// and posts a short summary every morning at 9 AM (India time).
//
// It connects with Slack's Socket Mode, so it needs no public address and works
// on a laptop as well as on the server. Without the two tokens it stays off.
//
//   SLACK_BOT_TOKEN       xoxb-…  (OAuth & Permissions → Bot User OAuth Token)
//   SLACK_APP_TOKEN       xapp-…  (Basic Information → App-Level Tokens, scope connections:write)
//   SLACK_ORDERS_CHANNEL  channel ID of #orders (C…)
//   SLACK_UNPAID_CHANNEL  optional channel ID for unpaid checkouts   (default: #orders)
//   SLACK_RETURNS_CHANNEL optional channel ID for return requests    (default: #orders)
//   SLACK_SUMMARY_CHANNEL optional channel ID for the morning summary (default: #orders)
//   SLACK_ALLOWED_USERS   optional, comma-separated Slack user IDs allowed to change orders
//   SLACK_STATE_FILE      optional, where the bot remembers what it has already posted
//                         (default .slack-state.json next to the server)

import fs from "fs";
import path from "path";
import { WebClient } from "@slack/web-api";
import { SocketModeClient } from "@slack/socket-mode";

type WcCall = (method: string, ...args: any[]) => Promise<any>;

const STATUSES: { value: string; label: string; risky?: boolean }[] = [
  { value: "processing", label: "Processing" },
  { value: "on-hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled", risky: true },
  { value: "refunded", label: "Refunded", risky: true },
  { value: "failed", label: "Failed", risky: true },
];

/** Statuses that mean the customer did not pay (or the money went back). */
const UNPAID = ["pending", "failed", "cancelled", "checkout-draft", "refunded", "trash"];
const WHATSAPP_US = "+91 78420 70404";

const ABANDON_AFTER = 20 * 60e3; // give a customer 20 minutes to finish paying before we nudge the team
const ABANDON_WINDOW = 6 * 3600e3; // only look at checkouts from the last 6 hours
const WATCH_EVERY = 5 * 60e3;
const SUMMARY_HOUR = 9; // India time

let web: WebClient | null = null;
let wc: WcCall | null = null;
let channel = ""; // #orders: new orders, shipping, commands
const rooms = { unpaid: "", returns: "", summary: "" };
let allowed: string[] = [];
let adminBase = "https://api.chilsandco.com";

const money = (n: unknown) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const can = (user: string) => !allowed.length || allowed.includes(user);
const adminLink = (id: number | string) => `${adminBase}/wp-admin/post.php?post=${id}&action=edit`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const metaOf = (order: any, key: string) => (order.meta_data || []).find((m: any) => m.key === key)?.value;
const isPaid = (order: any) => !UNPAID.includes(order.status);
const isPickup = (order: any) => (order.shipping_lines || []).some((s: any) => /pickup|store/i.test(s.method_title || s.method_id || ""));

// ---------- India time ----------
const IST = 5.5 * 3600e3;
const istDay = (t = Date.now()) => new Date(t + IST).toISOString().slice(0, 10);
const istHour = (t = Date.now()) => new Date(t + IST).getUTCHours();
/** Midnight India time today, as a UTC timestamp. */
const istMidnight = (t = Date.now()) => {
  const d = new Date(t + IST);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() - IST;
};
const istLabel = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
const istTime = (t: number) => new Date(t).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
const createdAt = (order: any) => new Date(`${order.date_created_gmt || order.date_created}Z`).getTime();
const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60e3);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return `${Math.round(h / 24)} days ago`;
};

// ---------- what the bot has already posted (survives restarts) ----------
type State = { abandoned: Record<string, number>; returns: Record<string, number>; returnsSeeded?: boolean; summaryDay?: string };
let state: State = { abandoned: {}, returns: {} };
let stateFile = "";

function loadState() {
  stateFile = (process.env.SLACK_STATE_FILE || "").trim() || path.join(process.cwd(), ".slack-state.json");
  try {
    state = { abandoned: {}, returns: {}, ...JSON.parse(fs.readFileSync(stateFile, "utf8")) };
  } catch {
    /* first run */
  }
}

function saveState() {
  const cutoff = Date.now() - 14 * 864e5;
  for (const [id, t] of Object.entries(state.abandoned)) if (t < cutoff) delete state.abandoned[id];
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch (err: any) {
    console.warn("[SLACK] Could not save the bot's memory file:", err.message);
  }
}

/** Every order created in a time range (India-time aware), across pages. */
async function ordersBetween(from: number, to?: number, extra: Record<string, unknown> = {}) {
  const out: any[] = [];
  for (let page = 1; page <= 10; page++) {
    const { data } = await wc!("get", "orders", {
      after: new Date(from).toISOString(),
      ...(to ? { before: new Date(to).toISOString() } : {}),
      dates_are_gmt: true,
      per_page: 100,
      page,
      ...extra,
    });
    out.push(...data);
    if (data.length < 100) break;
  }
  return out;
}

function itemLines(order: any) {
  return (
    (order.line_items || [])
      .map((i: any) => {
        const size = (i.meta_data || []).find((m: any) => /size/i.test(m.display_key || m.key))?.display_value;
        return `• ${i.name}${size ? ` (${size})` : ""} × ${i.quantity}`;
      })
      .join("\n") || "• (no items listed)"
  );
}

// =====================================================================
// Order cards
// =====================================================================

/** The message for one order: what was bought, where it goes, and what the team can do next. */
function orderBlocks(order: any, done?: string) {
  const pickup = isPickup(order);
  const city = order.shipping?.city || order.billing?.city || "";
  const name = `${order.billing?.first_name || ""}`.trim();
  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: `Order #${order.id} · ${money(order.total)}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*\n${name || "—"}` },
        { type: "mrkdwn", text: `*${pickup ? "Store pickup" : "Delivery to"}*\n${pickup ? "Collect in store" : city || "—"}` },
        { type: "mrkdwn", text: `*Status*\n${order.status}` },
        { type: "mrkdwn", text: `*Payment*\n${order.payment_method_title || order.payment_method || "—"}` },
      ],
    },
    { type: "section", text: { type: "mrkdwn", text: itemLines(order) } },
  ];
  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  blocks.push({
    type: "actions",
    block_id: `order_${order.id}`,
    elements: [
      { type: "button", text: { type: "plain_text", text: "Ready to ship" }, action_id: "ready_to_ship", value: String(order.id), style: "primary" },
      {
        type: "button",
        text: { type: "plain_text", text: "Delivered in person" },
        action_id: "in_person",
        value: String(order.id),
        confirm: {
          title: { type: "plain_text", text: "Mark as delivered?" },
          text: { type: "mrkdwn", text: `Order #${order.id} will be marked completed and the customer gets WooCommerce's completed-order email.` },
          confirm: { type: "plain_text", text: "Mark completed" },
          deny: { type: "plain_text", text: "Cancel" },
        },
      },
      {
        type: "static_select",
        action_id: "set_status",
        placeholder: { type: "plain_text", text: "Change status" },
        options: STATUSES.map(s => ({ text: { type: "plain_text", text: s.label }, value: `${order.id}:${s.value}` })),
        confirm: {
          title: { type: "plain_text", text: "Change the order status?" },
          text: { type: "mrkdwn", text: "This updates WooCommerce and the customer's order page. Cancelled orders return their stock. Refunded does not send money back, so refund it in PhonePe as well." },
          confirm: { type: "plain_text", text: "Change it" },
          deny: { type: "plain_text", text: "Keep it" },
        },
      },
      { type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) },
    ],
  });
  return blocks;
}

// =====================================================================
// 1. Payments that never went through
// =====================================================================

/** A WhatsApp number for wa.me, or "" when the phone doesn't look like an Indian mobile. */
function waNumber(phone: string) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return /^91\d{10}$/.test(d) ? d : "";
}

export function abandonedBlocks(order: any, done?: string) {
  const name = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();
  const first = `${order.billing?.first_name || ""}`.trim() || "there";
  const items = order.line_items || [];
  const firstItem = items[0]?.name || "your tees";
  const more = items.length > 1 ? ` and ${plural(items.length - 1, "more item")}` : "";
  const wa = waNumber(order.billing?.phone);
  const text = `Hi ${first}, this is CHILS & CO. Your order for ${firstItem}${more} didn't go through at payment. Want a hand finishing it? Just reply here.`;
  const failed = order.status === "failed";

  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: `Not paid · ${money(order.total)} · #${order.id}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*\n${name || "—"}` },
        { type: "mrkdwn", text: `*Phone*\n${order.billing?.phone || "—"}` },
        { type: "mrkdwn", text: `*What happened*\n${failed ? "Payment failed" : "Left at the payment page"}` },
        { type: "mrkdwn", text: `*Started*\n${istTime(createdAt(order))} (${ago(createdAt(order))})` },
      ],
    },
    { type: "section", text: { type: "mrkdwn", text: itemLines(order) } },
  ];
  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  const actions: any[] = [];
  if (wa) actions.push({ type: "button", text: { type: "plain_text", text: `WhatsApp ${first}` }, action_id: "open_whatsapp", url: `https://wa.me/${wa}?text=${encodeURIComponent(text)}`, style: "primary" });
  if (!done) actions.push({ type: "button", text: { type: "plain_text", text: "Mark followed up" }, action_id: "followed_up", value: String(order.id) });
  actions.push({ type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) });
  blocks.push({ type: "actions", elements: actions });
  return blocks;
}

async function checkAbandoned() {
  const now = Date.now();
  const recent = await ordersBetween(now - ABANDON_WINDOW);

  // someone who gave up on one order and then paid for another doesn't need chasing
  const paidLater = new Map<string, number>();
  for (const o of recent) {
    const email = `${o.billing?.email || ""}`.toLowerCase();
    if (email && isPaid(o)) paidLater.set(email, Math.max(paidLater.get(email) || 0, createdAt(o)));
  }

  for (const o of recent) {
    if (!["pending", "failed"].includes(o.status) || state.abandoned[o.id]) continue;
    if (now - createdAt(o) < ABANDON_AFTER || Number(o.total) <= 0 || !(o.line_items || []).length) continue;
    state.abandoned[o.id] = now;
    const email = `${o.billing?.email || ""}`.toLowerCase();
    if (email && (paidLater.get(email) || 0) > createdAt(o)) continue;
    await web!.chat.postMessage({ channel: rooms.unpaid, text: `Not paid: ${money(o.total)} from ${o.billing?.first_name || "a customer"} (#${o.id})`, blocks: abandonedBlocks(o) });
    console.log(`[SLACK] Posted unpaid checkout #${o.id}`);
  }
  saveState();
}

// =====================================================================
// 2. Morning summary
// =====================================================================

async function summaryText(morning = false) {
  const today = istMidnight();
  const yesterday = today - 864e5;
  const [y, processing, returns] = await Promise.all([
    ordersBetween(yesterday, today),
    wc!("get", "orders", { status: "processing", per_page: 100 }).then((r: any) => r.data),
    wc!("get", "orders", { status: "return-requested", per_page: 100 }).then((r: any) => r.data),
  ]);

  const paid = y.filter(isPaid);
  const sales = paid.reduce((n, o) => n + Number(o.total || 0), 0);
  const counts = new Map<string, number>();
  for (const o of paid) for (const i of o.line_items || []) counts.set(i.name, (counts.get(i.name) || 0) + Number(i.quantity || 0));
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const unpaid = y.filter(o => ["pending", "failed"].includes(o.status) && Number(o.total) > 0);
  const unpaidValue = unpaid.reduce((n, o) => n + Number(o.total || 0), 0);

  const packed = processing.filter((o: any) => metaOf(o, "_chils_packed_by"));
  const toPack = processing.filter((o: any) => !metaOf(o, "_chils_packed_by"));
  const oldest = toPack.length ? Math.min(...toPack.map(createdAt)) : 0;

  const lines = [`*${morning ? "Good morning. " : ""}Here's yesterday, ${istLabel(yesterday)}:*`];
  lines.push(paid.length ? `• Orders: ${paid.length}, ${money(sales)}${best ? ` · best seller ${best[0]} (×${best[1]})` : ""}` : "• No paid orders.");
  if (unpaid.length) lines.push(`• Didn't pay: ${plural(unpaid.length, "checkout")} worth ${money(unpaidValue)} reached PhonePe but ${unpaid.length === 1 ? "wasn't" : "weren't"} paid`);

  lines.push("", "*Today's list:*");
  const todo: string[] = [];
  if (toPack.length) todo.push(`• To pack: ${plural(toPack.length, "paid order")} (oldest ${ago(oldest)}): ${toPack.slice(0, 6).map((o: any) => `#${o.id}`).join(", ")}`);
  if (packed.length) todo.push(`• Packed, waiting for pickup or Shiprocket: ${packed.map((o: any) => `#${o.id}`).join(", ")}`);
  if (returns.length) todo.push(`• Returns waiting for a decision: ${returns.length} (type \`returns\`)`);
  lines.push(...(todo.length ? todo : ["• Nothing waiting. 🎉"]));
  return lines.join("\n");
}

async function maybeSendSummary() {
  const day = istDay();
  // 9 AM to noon, so a restart at 9:30 still sends it, but never twice a day
  if (state.summaryDay === day || istHour() < SUMMARY_HOUR || istHour() >= 12) return;
  state.summaryDay = day;
  saveState();
  await web!.chat.postMessage({ channel: rooms.summary, text: await summaryText(true) });
  console.log("[SLACK] Posted the morning summary");
}

// =====================================================================
// 3. Returns: Approve / Reject
// =====================================================================

/** The customer's latest return request, from the returns plugin's data on the order. */
function returnRequest(order: any) {
  const raw = metaOf(order, "wps_rma_return_product");
  let entries: any[] = [];
  try {
    entries = Object.values(typeof raw === "string" ? JSON.parse(raw) : raw || {});
  } catch {
    /* unreadable: show what we can */
  }
  const req: any = entries[entries.length - 1] || {};
  const subject = String(req.subject || "");
  const pick = (label: string) => subject.match(new RegExp(`${label}:\\s*(.*)`))?.[1]?.trim() || "";
  const products: any[] = req.products || [];
  const names = new Map<string, string>((order.line_items || []).map((i: any) => [String(i.product_id), i.name]));
  for (const p of products) {
    const line = (order.line_items || []).find((i: any) => String(i.id) === String(p.item_id));
    if (line && !names.has(String(p.product_id))) names.set(String(p.product_id), line.name);
  }
  const wants = subject
    .split("\n")
    .filter(l => l.startsWith("- Product ID:"))
    .map(l => {
      const [, id, qty, act] = l.match(/Product ID:\s*(\d+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*Action:\s*(.*)/) || [];
      return `• ${names.get(id) || `Product ${id}`} × ${qty}: ${act}`;
    });
  const value = products.reduce((n, p) => n + Number(p.price || 0) * Number(p.qty || 1), 0);
  const images = pick("Images").split(",").map(s => s.trim()).filter(s => /^https?:/.test(s));
  return {
    reason: pick("Reason"),
    description: pick("Description"),
    wants,
    value,
    images,
    isRefund: wants.some(w => /:\s*Refund$/.test(w)) || (!wants.length && /refund/i.test(subject)),
  };
}

export function returnBlocks(order: any, done?: string) {
  const r = returnRequest(order);
  const name = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();
  const detail = [
    `*Reason:* ${r.reason || "not given"}`,
    r.description ? `*Customer's note:* ${r.description}` : "",
    r.wants.length ? `*What they want:*\n${r.wants.join("\n")}` : `*Items:*\n${itemLines(order)}`,
    r.images.length ? `*Return photos:* ${r.images.map((u, i) => `<${u}|photo ${i + 1}>`).join(" · ")}` : "",
  ].filter(Boolean);

  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: `Return request · Order #${order.id}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*\n${name || "—"}` },
        { type: "mrkdwn", text: `*Value*\n${money(r.value || order.total)}` },
        { type: "mrkdwn", text: `*Ordered*\n${istLabel(createdAt(order))}` },
        { type: "mrkdwn", text: `*Status*\n${order.status}` },
      ],
    },
    { type: "section", text: { type: "mrkdwn", text: detail.join("\n") } },
  ];

  // Add product images
  const productImages = order.line_items?.slice(0, 3).map((item: any) => ({ type: "image", image_url: item.image?.src || "", alt_text: item.name })).filter((img: any) => img.image_url);
  if (productImages?.length) {
    blocks.push({ type: "divider" });
    productImages.forEach((img: any) => {
      if (img.image_url) blocks.push({ type: "image", image_url: img.image_url, alt_text: img.alt_text });
    });
  }

  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  const actions: any[] = [];
  if (!done) {
    actions.push(
      {
        type: "button",
        text: { type: "plain_text", text: "Approve & Refund" },
        style: "primary",
        action_id: "return_approve_refund",
        value: String(order.id),
        confirm: {
          title: { type: "plain_text", text: "Approve return & process refund?" },
          text: { type: "mrkdwn", text: `Order #${order.id} moves to Return approved, customer is emailed, and ${money(r.value || order.total)} will be refunded to their PhonePe account immediately.` },
          confirm: { type: "plain_text", text: "Approve & Refund" },
          deny: { type: "plain_text", text: "Cancel" },
        },
      },
      { type: "button", text: { type: "plain_text", text: "Reject" }, style: "danger", action_id: "return_reject", value: String(order.id) }
    );
  }
  actions.push({ type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) });
  blocks.push({ type: "actions", elements: actions });
  return blocks;
}

async function waitingReturns() {
  const { data } = await wc!("get", "orders", { status: "return-requested", per_page: 50 });
  return data as any[];
}

async function checkReturns() {
  const waiting = await waitingReturns();
  const ids = new Set(waiting.map(o => String(o.id)));
  for (const id of Object.keys(state.returns)) if (!ids.has(id)) delete state.returns[id];

  // first run: don't flood the channel with requests that were already sitting there
  if (!state.returnsSeeded) {
    for (const o of waiting) state.returns[o.id] = Date.now();
    state.returnsSeeded = true;
    saveState();
    if (waiting.length) await web!.chat.postMessage({ channel: rooms.returns, text: `${plural(waiting.length, "return request")} ${waiting.length === 1 ? "was" : "were"} already waiting before I started watching. Type \`returns\` to see them.` });
    return;
  }
  for (const o of waiting) {
    if (state.returns[o.id]) continue;
    state.returns[o.id] = Date.now();
    await web!.chat.postMessage({ channel: rooms.returns, text: `Return request for order #${o.id}`, blocks: returnBlocks(o) });
    console.log(`[SLACK] Posted return request #${o.id}`);
  }
  saveState();
}

async function approveReturn(id: string, who: string, user: string, ch: string, ts: string) {
  const { data: current } = await wc!("get", `orders/${id}`);
  if (current.status !== "return-requested") return `Order #${id} isn't waiting on a return decision any more (it's ${current.status}). Nothing changed.`;
  const { data } = await wc!("put", `orders/${id}`, { status: "return-approved" });
  await wc!("post", `orders/${id}/notes`, {
    note: `Good news: your return request for order #${id} is approved. We'll be in touch shortly with the next steps.`,
    customer_note: true,
  });
  await note(id, `Return approved by ${who} from Slack.`);
  const refund = returnRequest(current).isRefund ? " · refund the money in PhonePe" : "";
  await updateCard(ch, ts, `Return #${id}`, returnBlocks(data, `✅ Approved by <@${user}> · customer emailed${refund}`));
  return "";
}

async function approveReturnAndRefund(id: string, who: string, user: string, ch: string, ts: string) {
  const { data: current } = await wc!("get", `orders/${id}`);
  if (current.status !== "return-requested") return `Order #${id} isn't waiting on a return decision any more (it's ${current.status}). Nothing changed.`;

  const r = returnRequest(current);
  const refundAmount = r.value || current.total;

  // First approve the return
  const { data } = await wc!("put", `orders/${id}`, { status: "return-approved" });
  await wc!("post", `orders/${id}/notes`, {
    note: `Good news: your return request for order #${id} is approved. We'll be in touch shortly with the next steps.`,
    customer_note: true,
  });
  await note(id, `Return approved by ${who} from Slack and ₹${refundAmount} refund initiated.`);

  // Then initiate PhonePe refund via server endpoint
  try {
    const transactionId = current.transaction_id || current.meta_data?.find((m: any) => m.key === "_phonepe_transaction_id")?.value;
    if (transactionId) {
      await fetch(`${process.env.SERVER_URL || "https://chilsandco.com"}/api/admin/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Slack-Refund": "true" },
        body: JSON.stringify({ orderId: id, amount: refundAmount, transactionId })
      }).then(r => r.json());
    }
  } catch (err: any) {
    console.error("[SLACK] PhonePe refund initiation failed:", err.message);
  }

  await updateCard(ch, ts, `Return #${id}`, returnBlocks(data, `✅ Approved by <@${user}> · customer emailed · ₹${refundAmount} refund initiated`));
  return "";
}

async function rejectReturn(id: string, reason: string, who: string, user: string, ch: string, ts: string) {
  const { data: current } = await wc!("get", `orders/${id}`);
  if (current.status !== "return-requested") return `Order #${id} isn't waiting on a return decision any more (it's ${current.status}). Nothing changed.`;
  const { data } = await wc!("put", `orders/${id}`, { status: "return-cancelled" });
  await wc!("post", `orders/${id}/notes`, {
    note: `We're sorry, we can't accept the return for order #${id}.\n\n${reason}\n\nIf you'd like to talk it through, message us on WhatsApp at ${WHATSAPP_US}.`,
    customer_note: true,
  });
  await note(id, `Return rejected by ${who} from Slack. Reason given: ${reason}`);
  await updateCard(ch, ts, `Return #${id}`, returnBlocks(data, `✖️ Rejected by <@${user}> · customer emailed the reason`));
  return "";
}

function openRejectDialog(body: any, id: string) {
  return web!.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "return_reject_submit",
      private_metadata: JSON.stringify({ id, ch: body.channel?.id, ts: body.message?.ts }),
      title: { type: "plain_text", text: "Reject return" },
      submit: { type: "plain_text", text: "Reject and email" },
      close: { type: "plain_text", text: "Cancel" },
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `Order #${id}. The customer gets this reason by email, so keep it kind and clear.` } },
        {
          type: "input",
          block_id: "reason",
          label: { type: "plain_text", text: "Reason" },
          element: {
            type: "plain_text_input",
            action_id: "value",
            multiline: true,
            min_length: 10,
            placeholder: { type: "plain_text", text: "e.g. The tee has been worn and washed, so we can't take it back." },
          },
        },
      ],
    },
  });
}

// =====================================================================
// Slack plumbing
// =====================================================================

async function note(orderId: string, text: string) {
  await wc!("post", `orders/${orderId}/notes`, { note: text, customer_note: false });
}

async function setStatus(orderId: string, status: string, who: string, extraMeta: { key: string; value: string }[] = []) {
  // a second press on an order that is already there changes nothing and must not pile up notes
  const { data: current } = await wc!("get", `orders/${orderId}`);
  if (current.status === status) return { ...current, _unchanged: true };
  const { data } = await wc!("put", `orders/${orderId}`, { status, ...(extraMeta.length ? { meta_data: extraMeta } : {}) });
  await note(orderId, `Status set to ${status} by ${who} from Slack.`);
  return data;
}

async function updateCard(ch: string, ts: string, text: string, blocks: any[]) {
  if (!ch || !ts) return;
  try {
    await web!.chat.update({ channel: ch, ts, text, blocks });
  } catch (err: any) {
    console.warn("[SLACK] Could not update the message:", err?.data?.error || err.message);
  }
}

const refreshMessage = (body: any, order: any, done: string) => updateCard(body.channel?.id, body.message?.ts, `Order #${order.id}`, orderBlocks(order, done));

async function reply(body: any, text: string) {
  await web!.chat.postMessage({ channel: body.channel?.id || channel, thread_ts: body.message?.ts, text });
}

/** Button and menu presses. */
async function onAction(body: any) {
  const action = body.actions?.[0];
  if (!action || ["open_admin", "open_whatsapp"].includes(action.action_id)) return;
  const user = body.user?.id;
  const who = body.user?.username || body.user?.name || user;
  if (!can(user)) return reply(body, `<@${user}> you're not on the list of people who can change orders.`);
  console.log(`[SLACK] ${who} pressed ${action.action_id} ${action.value || action.selected_option?.value || ""}`);

  try {
    if (action.action_id === "return_reject") {
      // the dialog has to open within 3 seconds of the press, so it goes first
      await openRejectDialog(body, action.value);
    } else if (action.action_id === "return_approve") {
      const msg = await approveReturn(action.value, who, user, body.channel?.id, body.message?.ts);
      if (msg) await reply(body, msg);
    } else if (action.action_id === "return_approve_refund") {
      const msg = await approveReturnAndRefund(action.value, who, user, body.channel?.id, body.message?.ts);
      if (msg) await reply(body, msg);
    } else if (action.action_id === "followed_up") {
      const id = action.value;
      const { data } = await wc!("get", `orders/${id}`);
      await note(id, `Customer followed up about the unpaid checkout (by ${who}, from Slack).`);
      await updateCard(body.channel?.id, body.message?.ts, `Not paid #${id}`, abandonedBlocks(data, `💬 Followed up by <@${user}>`));
    } else if (action.action_id === "ready_to_ship") {
      const id = action.value;
      await note(id, `Packed and ready to ship (by ${who}, from Slack).`);
      const { data } = await wc!("put", `orders/${id}`, { meta_data: [{ key: "_chils_packed_by", value: String(who) }] });
      await refreshMessage(body, data, `📦 Packed by <@${user}> · ${isPickup(data) ? "ready for pickup" : "ready for Shiprocket"}`);
    } else if (action.action_id === "in_person") {
      const id = action.value;
      const data = await setStatus(id, "completed", who, [{ key: "_chils_delivered_in_person", value: "yes" }]);
      if (data._unchanged) return reply(body, `Order #${id} is already completed. Nothing changed and no new email was sent.`);
      await refreshMessage(body, data, `🤝 Delivered in person by <@${user}> · completed, customer emailed`);
    } else if (action.action_id === "set_status") {
      const [id, status] = String(action.selected_option?.value || "").split(":");
      if (!id || !STATUSES.some(s => s.value === status)) return;
      const data = await setStatus(id, status, who);
      if (data._unchanged) return reply(body, `Order #${id} is already ${status}. Nothing changed.`);
      const extra = status === "refunded" ? " · remember to refund the money in PhonePe" : "";
      await refreshMessage(body, data, `Status set to *${status}* by <@${user}>${extra}`);
    }
  } catch (err: any) {
    console.error("[SLACK] Action failed:", err?.response?.data || err?.data || err.message);
    await reply(body, `Couldn't do that: ${err?.response?.data?.message || err?.data?.error || err.message}`);
  }
}

/** The Reject dialog's Send button. */
async function onViewSubmit(body: any) {
  if (body.view?.callback_id !== "return_reject_submit") return;
  const user = body.user?.id;
  const who = body.user?.username || body.user?.name || user;
  const { id, ch, ts } = JSON.parse(body.view.private_metadata || "{}");
  const reason = String(body.view.state?.values?.reason?.value?.value || "").trim();
  if (!can(user) || !id || !reason) return;
  console.log(`[SLACK] ${who} rejected return ${id}`);
  try {
    const msg = await rejectReturn(id, reason, who, user, ch, ts);
    if (msg) await web!.chat.postMessage({ channel: ch || channel, thread_ts: ts, text: msg });
  } catch (err: any) {
    console.error("[SLACK] Reject failed:", err?.response?.data || err.message);
    await web!.chat.postMessage({ channel: ch || channel, thread_ts: ts, text: `Couldn't reject return #${id}: ${err?.response?.data?.message || err.message}` });
  }
}

const HELP = [
  "*Things I understand:*",
  "• `status 1234`: show an order with its buttons",
  "• `pending`: paid orders not packed yet",
  "• `today`: today's orders and sales",
  "• `summary`: the morning summary, right now",
  "• `returns`: return requests waiting for a decision",
  "",
  "_On my own I post new orders here, unpaid checkouts in #unpaid-checkouts, return requests in #returns and a summary in #daily-summary every morning at 9. These commands work in any of those channels._",
].join("\n");

/** Plain-text commands in #orders. */
async function onMessage(event: any) {
  if (event.bot_id || event.subtype || !event.text) return;
  const text = String(event.text).trim().toLowerCase().replace(/<@[^>]+>\s*/g, "");
  const say = (t: string, blocks?: any[]) => web!.chat.postMessage({ channel: event.channel, thread_ts: event.ts, text: t, ...(blocks ? { blocks } : {}) });

  try {
    const status = text.match(/^(?:status|order)\s*#?(\d+)$/);
    if (status) {
      const { data } = await wc!("get", `orders/${status[1]}`);
      return say(`Order #${data.id}`, data.status === "return-requested" ? returnBlocks(data) : orderBlocks(data));
    }
    if (text === "pending") {
      const { data } = await wc!("get", "orders", { status: "processing", per_page: 20 });
      if (!data.length) return say("Nothing waiting. Every paid order is packed or done. 🎉");
      return say(`*${plural(data.length, "paid order")} waiting:*\n` + data.map((o: any) => `• #${o.id} · ${money(o.total)} · ${o.shipping?.city || o.billing?.city || ""}${metaOf(o, "_chils_packed_by") ? " · packed" : ""}`).join("\n"));
    }
    if (text === "today") {
      const data = await ordersBetween(istMidnight());
      const paid = data.filter(isPaid);
      const total = paid.reduce((n: number, o: any) => n + Number(o.total || 0), 0);
      return say(`*Today:* ${plural(paid.length, "order")}, ${money(total)}.`);
    }
    if (text === "summary") return say(await summaryText());
    if (text === "returns") {
      const waiting = await waitingReturns();
      if (!waiting.length) return say("No return requests waiting. 🎉");
      await say(`*${plural(waiting.length, "return request")} waiting for a decision:*`);
      for (const o of waiting.slice(0, 10)) await say(`Return request for order #${o.id}`, returnBlocks(o));
      return;
    }
    if (text === "help") return say(HELP);
  } catch (err: any) {
    console.error("[SLACK] Command failed:", err?.response?.data || err.message);
    await say(`Couldn't do that: ${err?.response?.data?.message || err.message}`);
  }
}

/** Runs one watcher without letting a failure stop the others. */
async function safely(name: string, job: () => Promise<void>) {
  try {
    await job();
  } catch (err: any) {
    console.error(`[SLACK] ${name} check failed:`, err?.response?.data?.message || err?.data?.error || err.message);
  }
}

/** Starts the bot when its tokens are set. Safe to call when they aren't. */
export async function startSlackBot(opts: { wc: WcCall; adminUrl: string }) {
  const botToken = (process.env.SLACK_BOT_TOKEN || "").trim();
  const appToken = (process.env.SLACK_APP_TOKEN || "").trim();
  channel = (process.env.SLACK_ORDERS_CHANNEL || "").trim();
  rooms.unpaid = (process.env.SLACK_UNPAID_CHANNEL || "").trim() || channel;
  rooms.returns = (process.env.SLACK_RETURNS_CHANNEL || "").trim() || channel;
  rooms.summary = (process.env.SLACK_SUMMARY_CHANNEL || "").trim() || channel;
  if (!botToken || !appToken || !channel) {
    console.log("[SLACK] Order bot off (SLACK_BOT_TOKEN, SLACK_APP_TOKEN or SLACK_ORDERS_CHANNEL not set).");
    return;
  }
  allowed = (process.env.SLACK_ALLOWED_USERS || "").split(",").map(s => s.trim()).filter(Boolean);
  adminBase = opts.adminUrl.replace(/\/$/, "");
  wc = opts.wc;
  web = new WebClient(botToken);
  loadState();
  const socket = new SocketModeClient({ appToken });

  socket.on("interactive", async ({ body, ack }) => {
    await ack();
    if (body.type === "block_actions") onAction(body);
    else if (body.type === "view_submission") onViewSubmit(body);
  });
  socket.on("message", async ({ event, ack }) => { await ack(); onMessage(event); });
  socket.on("app_mention", async ({ event, ack }) => { await ack(); onMessage(event); });

  try {
    await socket.start();
    console.log("[SLACK] Order bot connected.");
  } catch (err: any) {
    console.error("[SLACK] Order bot could not connect:", err?.data?.error || err.message);
    return;
  }

  const watch = async () => {
    await safely("Unpaid checkout", checkAbandoned);
    await safely("Returns", checkReturns);
    await safely("Morning summary", maybeSendSummary);
  };
  setTimeout(watch, 30e3);
  setInterval(watch, WATCH_EVERY);
}

/** Posts a new paid order to #orders. Never throws: a Slack problem must not affect an order. */
export async function notifyNewOrder(order: any) {
  if (!web || !channel || !order?.id) return;
  try {
    await web.chat.postMessage({ channel, text: `New order #${order.id} · ${money(order.total)}`, blocks: orderBlocks(order) });
  } catch (err: any) {
    console.error("[SLACK] New-order message failed:", err?.data?.error || err.message);
  }
}

/** Shipping news worth a human's attention: delivered, failed, or coming back. */
export async function notifyShipping(orderId: number | string, trackingStatus: string, newStatus?: string) {
  if (!web || !channel) return;
  const s = String(trackingStatus).toLowerCase();
  const icon = /deliver/.test(s) && !/undeliver|fail/.test(s) ? "✅" : /rto|return|fail|undeliver|lost|damage/.test(s) ? "⚠️" : "";
  if (!icon) return; // routine in-transit updates stay quiet
  const extra = newStatus === "completed" ? " · marked completed, customer emailed" : " · needs a look";
  try {
    await web.chat.postMessage({ channel, text: `${icon} Order #${orderId}: ${trackingStatus}${extra}  <${adminLink(orderId)}|Open>` });
  } catch (err: any) {
    console.error("[SLACK] Shipping message failed:", err?.data?.error || err.message);
  }
}

/** Refund notification when customer receives money back. */
export async function notifyRefund(order: any, amount?: number) {
  if (!web || !channel || !order?.id) return;
  const refundAmount = amount || order.total;
  try {
    await web.chat.postMessage({
      channel,
      text: `💰 Refund processed for order #${order.id} · ${money(refundAmount)}`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `💰 *Refund processed*\nOrder #${order.id} · ${money(refundAmount)}\nCustomer: ${order.billing?.first_name || ''} ${order.billing?.last_name || ''}` }
        },
        { type: "divider" },
        {
          type: "section",
          text: { type: "mrkdwn", text: `<${adminLink(order.id)}|Open in WooCommerce>` }
        }
      ]
    });
  } catch (err: any) {
    console.error("[SLACK] Refund message failed:", err?.data?.error || err.message);
  }
}
