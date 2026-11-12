import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { small } from '../data/studio';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, X } from 'lucide-react';
import Snowflake from './Snowflake';
import { track } from '../lib/track';
import { editionOf, trilogyName, trilogySizes } from './Trilogy';
import { useCart } from '../CartContext';
import { fetchFullProduct, orderColor, sizeAvailable, useProducts } from '../hooks/useProducts';
import { GROUPS, colorFamily, curateRows } from '../data/groups';
import { SHOWN_COLOR } from '../data/lookbook';
import { Product } from '../types';

// ── What the shopper wants ──────────────────────────────────────────────────

type Kind = 'tees' | 'polos' | 'oversized';
type Want = { kind?: Kind; range?: string; colour?: string; budget?: number; size?: string; name?: string; graphic?: boolean };
type Topic = 'delivery' | 'returns' | 'trilogy' | 'size' | 'contact' | 'order';

const KINDS: { label: string; kind: Kind }[] = [
  { label: 'Tees', kind: 'tees' },
  { label: 'Polos', kind: 'polos' },
  { label: 'Oversized', kind: 'oversized' },
];

/** Colour moods map onto the colour families the store already uses. */
const COLOURS: { label: string; families: string[] }[] = [
  { label: 'Black', families: ['black'] },
  { label: 'Earthy', families: ['green', 'brown'] },
  { label: 'Light', families: ['light', 'grey'] },
  { label: 'Bright', families: ['blue', 'red'] },
];

const BUDGETS = [400, 500];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const ANY = 'any';
const PAGE = 6;
const WHATSAPP = '917842070404';

const sellable = (p: Product) => p.type !== 'grouped' && p.category !== 'Combos' && p.status === 'Available' && !!p.images?.length;
const isSet = (p: Product) => p.type === 'grouped' || p.category?.toLowerCase() === 'combos';
const cats = (p: Product) => p.categories ?? [p.category];
const isPolo = (p: Product) => cats(p).includes('Polos');
const isOversized = (p: Product) => cats(p).includes('Drop Shoulder/Oversized') || /oversized/i.test(p.fit || '');
const familiesOf = (p: Product) => (p.availableColors?.length ? p.availableColors : ['']).map(c => colorFamily({ ...p, availableColors: [c] }));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function matches(p: Product, w: Want) {
  if (w.kind === 'polos' && !isPolo(p)) return false;
  if (w.kind === 'oversized' && !isOversized(p)) return false;
  if (w.kind === 'tees' && isPolo(p)) return false;
  if (w.range) {
    const g = GROUPS.find(x => x.slug === w.range);
    if (g && !cats(p).includes(g.category)) return false;
  }
  if (w.graphic && cats(p).includes('Minimals')) return false;
  if (w.colour && w.colour !== ANY) {
    const fam = COLOURS.find(c => c.label === w.colour)?.families ?? [];
    if (!familiesOf(p).some(f => fam.includes(f))) return false;
  }
  if (w.budget && p.price > w.budget) return false;
  if (w.size && w.size !== ANY && !(p.availableSizes ?? []).includes(w.size)) return false;
  if (w.name && !p.name.toLowerCase().includes(w.name)) return false;
  return true;
}

/** One line on why a tee came up: colour, cut and price. */
const reason = (p: Product) => `${cap(familiesOf(p)[0] || 'Colour')} · ${isPolo(p) ? 'Polo' : isOversized(p) ? 'Oversized' : 'Regular'} · ₹${p.price}`;

/** Edit distance, so "kernal panic" still finds Kernel Panic. */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const clean = (s: string) => s.toLowerCase().replace(/^twintex polo - /, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/** The product the text names, allowing small typos. */
function findNamed(text: string, products: Product[]) {
  const words = clean(text).split(' ');
  let best: { p: Product; d: number } | null = null;
  for (const p of products.filter(sellable)) {
    const name = clean(p.name);
    if (name.length < 4) continue;
    const n = name.split(' ').length;
    for (let i = 0; i + n <= words.length; i++) {
      const d = distance(words.slice(i, i + n).join(' '), name);
      if (d <= Math.max(1, Math.floor(name.length * 0.2)) && (!best || d < best.d)) best = { p, d };
    }
  }
  return best?.p;
}

/** Plain keyword reading: sizes, colours, cuts, budgets, product names and "like …". */
function read(text: string, products: Product[]): { want: Want; topic?: Topic; like?: Product } {
  const t = ` ${text.toLowerCase()} `;
  if (/where.*order|track|my order|order status/.test(t)) return { want: {}, topic: 'order' };
  if (/deliver|shipping|ship |how long|when will/.test(t)) return { want: {}, topic: 'delivery' };
  if (/return|refund|exchange/.test(t)) return { want: {}, topic: 'returns' };
  if (/size guide|which size|what size|fit me|measure/.test(t)) return { want: {}, topic: 'size' };
  if (/contact|call|phone|email|whatsapp|talk to|human|person/.test(t)) return { want: {}, topic: 'contact' };

  const named = findNamed(text, products);
  if (named && /(like|similar|same as|alternative)/.test(t)) return { want: {}, like: named };
  if (/trilog|combo|bundle|set of|three tees/.test(t) && !named) return { want: {}, topic: 'trilogy' };

  const want: Want = {};
  if (/polo|collar/.test(t)) want.kind = 'polos';
  else if (/oversized|over sized|drop shoulder|baggy|loose|boxy/.test(t)) want.kind = 'oversized';
  else if (/\btees?\b|t-shirt|tshirt|t shirt/.test(t)) want.kind = 'tees';
  if (/plain|minimal|basic|simple|no print/.test(t)) want.range = 'minimals';
  else if (/regular fit|regular/.test(t)) want.range = 'regular';
  if (/graphic|print|design|text/.test(t) && !want.range) want.graphic = true;
  const size = t.match(/\b(xxl|2xl|xl|l|m|s)\b/);
  if (size) want.size = size[1] === '2xl' ? 'XXL' : size[1].toUpperCase();
  const budget = t.match(/(?:under|below|less than|upto|up to|within|max|<)\s*(?:rs\.?|₹|inr)?\s*(\d{3,4})/) ?? t.match(/(?:rs\.?|₹|inr)\s*(\d{3,4})|(\d{3,4})\s*(?:rs|₹|rupees|inr)/);
  if (budget) want.budget = Number(budget[1] ?? budget[2]);
  else if (/cheap|budget|affordable|low price/.test(t)) want.budget = 400;
  if (/black|dark/.test(t)) want.colour = 'Black';
  else if (/green|brown|olive|earth/.test(t)) want.colour = 'Earthy';
  else if (/white|cream|beige|grey|gray|light/.test(t)) want.colour = 'Light';
  else if (/blue|red|navy|maroon|bright/.test(t)) want.colour = 'Bright';
  if (named) want.name = named.name.toLowerCase();
  return { want };
}

// ── Conversation, kept as plain data so it survives page changes ────────────

type Act =
  | { t: 'ask'; want: Want }
  | { t: 'answer'; topic: Topic }
  | { t: 'show'; want: Want; from?: number }
  | { t: 'size'; id: string }
  | { t: 'add'; id: string; size: string }
  | { t: 'trilogy'; id: string }
  | { t: 'addTrilogy'; id: string; size: string }
  | { t: 'similar'; id: string }
  | { t: 'go'; to: string }
  | { t: 'whatsapp'; text?: string }
  | { t: 'reset' };
type Chip = { label: string; act: Act; primary?: boolean };
type Msg = { id: number; from: 'bot' | 'me'; text?: string; chips?: Chip[]; cards?: string[]; size?: string; link?: { to: string; label: string } };
type Saved = { log: Msg[]; want: Want; size?: string; place?: string };

const HIDE_ON = ['/checkout', '/auth', '/order-success', '/console', '/admin', '/onboarding'];
const NUDGE_KEY = 'chils-nudges';
const CHAT_KEY = 'chils-assistant';
const MAX_NUDGES = 2;

const load = (): Saved => {
  try { return JSON.parse(sessionStorage.getItem(CHAT_KEY) || '') as Saved; } catch { return { log: [], want: {} }; }
};

const FACTS: Record<Topic, string> = {
  delivery: 'We deliver across India. Delivery starts at ₹80 and usually takes 2–7 business days, depending on where you are. Collecting in store is free.',
  returns: 'You can return within 7 days of delivery. Eligible returns can be a refund, an exchange or store credit.',
  trilogy: 'Trilogies are three tees chosen to go together, banded as a set. Every Trilogy saves 10%.',
  size: 'Each product page has a Size guide next to the sizes, with exact measurements. Oversized tees are cut roomy by design, so most people pick their usual size.',
  contact: 'You can reach us on WhatsApp or at +91 7842 07 0404, or email hello.chilsandco@gmail.com. Monday to Saturday, 10 AM to 6 PM.',
  order: 'Sign in to see your orders, their status and tracking.',
};

const LINKS: Partial<Record<Topic, { to: string; label: string }>> = {
  trilogy: { to: '/pick-your-three', label: 'See the Trilogies' },
  delivery: { to: '/shipping-delivery', label: 'Delivery details' },
  returns: { to: '/returns-refunds', label: 'Returns details' },
  contact: { to: '/support', label: 'Support' },
  order: { to: '/console/orders', label: 'My orders' },
};

const STARTERS: Chip[] = [
  ...KINDS.map(k => ({ label: k.label, act: { t: 'ask', want: { kind: k.kind } } as Act })),
  { label: 'Under ₹400', act: { t: 'show', want: { budget: 400 } } },
  { label: 'Trilogies', act: { t: 'answer', topic: 'trilogy' } },
  { label: 'Talk to us', act: { t: 'whatsapp' } },
];

let nextId = Date.now();

/** A guided shopping helper: knows the page you're on, real stock, add to bag, then you check out yourself. */
const Assistant: React.FC = () => {
  const { products } = useProducts();
  const { addToCart, addComboToCart, cart } = useCart();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const saved = useRef(load()).current;
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<Msg[]>(saved.log ?? []);
  const [want, setWant] = useState<Want>(saved.want ?? {});
  const [size, setSize] = useState<string | undefined>(saved.size);
  const [place, setPlace] = useState<string | undefined>(saved.place);
  const [draft, setDraft] = useState('');
  const [nudge, setNudge] = useState<{ text: string; start: () => void } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const latest = useRef(0);

  const hidden = HIDE_ON.some(p => pathname.startsWith(p));
  const byId = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const sets = useMemo(() => products.filter(isSet), [products]);

  // best picks first: the same curated order as Shop all
  const rank = useMemo(() => {
    const rows = curateRows(products.filter(sellable), 40);
    const order = new Map<string, number>();
    GROUPS.forEach(g => (rows[g.slug] ?? []).forEach(p => { if (!order.has(p.id)) order.set(p.id, order.size); }));
    return (p: Product) => order.get(p.id) ?? 9999;
  }, [products]);

  useEffect(() => {
    try { sessionStorage.setItem(CHAT_KEY, JSON.stringify({ log: log.slice(-60), want, size, place })); } catch { /* storage blocked */ }
  }, [log, want, size, place]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [log, open]);
  useEffect(() => { if (hidden) setOpen(false); }, [hidden]);

  const say = useCallback((m: Omit<Msg, 'id'>) => setLog(l => [...l, { ...m, id: nextId++ }]), []);
  const me = (text: string) => say({ from: 'me', text });
  const remember = (s: string) => { if (SIZES.includes(s)) setSize(s); };

  const stockOf = async (p: Product, s: string) => {
    const f = (await fetchFullProduct(p.id)) ?? p;
    return { full: f, ok: sizeAvailable(f, s, orderColor(f, SHOWN_COLOR[p.id])) };
  };
  const sizesInStock = async (p: Product) => {
    const f = (await fetchFullProduct(p.id)) ?? p;
    return (p.availableSizes ?? []).filter(s => sizeAvailable(f, s, orderColor(f, SHOWN_COLOR[p.id])));
  };
  const setsWith = (id: string) => sets.filter(c => c.groupedProducts?.includes(id));

  // ── answers ──
  const answer = (topic: Topic) => {
    const chips: Chip[] = topic === 'contact'
      ? [{ label: 'Open WhatsApp', act: { t: 'whatsapp' }, primary: true }, { label: 'Find a tee', act: { t: 'ask', want: {} } }]
      : [{ label: 'Find a tee', act: { t: 'ask', want: {} } }, { label: 'Talk to us', act: { t: 'whatsapp' } }];
    say({ from: 'bot', text: FACTS[topic], link: LINKS[topic], chips });
  };

  // ── the guided questions ──
  const ask = (w: Want) => {
    setWant(w);
    if (!w.kind && !w.range && !w.name) {
      say({ from: 'bot', text: 'What are you looking for?', chips: STARTERS });
    } else if (!w.colour && w.range !== 'blacks') {
      say({ from: 'bot', text: 'Any colour in mind?', chips: [
        ...COLOURS.map(c => ({ label: c.label, act: { t: 'ask', want: { ...w, colour: c.label } } as Act })),
        { label: 'Doesn’t matter', act: { t: 'ask', want: { ...w, colour: ANY } } },
      ] });
    } else if (w.budget === undefined) {
      say({ from: 'bot', text: 'And your budget?', chips: [
        ...BUDGETS.map(b => ({ label: `Under ₹${b}`, act: { t: 'ask', want: { ...w, budget: b } } as Act })),
        { label: 'Any', act: { t: 'ask', want: { ...w, budget: 0 } } },
      ] });
    } else if (!w.size && size) {
      say({ from: 'bot', text: `I'll use size ${size}, as you said earlier.` });
      show({ ...w, size });
    } else if (!w.size) {
      say({ from: 'bot', text: 'Your size?', chips: [
        ...SIZES.map(s => ({ label: s, act: { t: 'ask', want: { ...w, size: s } } as Act })),
        { label: 'Not sure', act: { t: 'ask', want: { ...w, size: ANY } } },
      ] });
    } else {
      show(w);
    }
  };

  // ── results from the live store, checked for stock in that size ──
  const show = async (w: Want, from = 0) => {
    setWant(w);
    // a newer request wins; slower stock checks for an older one are dropped
    const ticket = ++latest.current;
    const pool = products.filter(sellable).sort((a, b) => rank(a) - rank(b));
    const s = w.size && w.size !== ANY ? w.size : undefined;
    const inStock = async (list: Product[]) => {
      if (!s) return list;
      const top = list.slice(0, from + 24);
      const checks = await Promise.all(top.map(p => stockOf(p, s)));
      return top.filter((_, i) => checks[i].ok);
    };
    // exact first, then let go of colour, then of budget, always keeping type and size
    const tries: Want[] = [w, { ...w, colour: ANY }, { ...w, colour: ANY, budget: 0 }];
    let found: Product[] = [];
    let loosened = false;
    for (const [n, t] of tries.entries()) {
      found = await inStock(pool.filter(p => matches(p, t)));
      if (found.length) { loosened = n > 0; break; }
    }
    if (ticket !== latest.current) return;
    const picks = found.slice(from, from + PAGE);
    if (!picks.length) {
      say({ from: 'bot', text: from ? 'That’s everything that matches.' : 'I couldn’t find a match in stock right now. Want to try different options?', chips: [
        { label: 'Start again', act: { t: 'reset' } },
        { label: 'Shop all', act: { t: 'go', to: '/collection' } },
      ] });
      return;
    }
    const text = from ? 'A few more:' : loosened ? 'Nothing matched everything, so here are the closest in stock:' : `Here ${picks.length === 1 ? 'is one' : `are ${picks.length}`} in stock for you:`;
    say({ from: 'bot', text, cards: picks.map(p => p.id), size: s });
    say({ from: 'bot', chips: [
      ...(found.length > from + PAGE ? [{ label: 'Show more', act: { t: 'show', want: w, from: from + PAGE } as Act }] : []),
      { label: 'Change size', act: { t: 'ask', want: { ...w, size: undefined } } },
      { label: 'Start again', act: { t: 'reset' } },
    ] });
  };

  const similar = (p: Product) => {
    const g = GROUPS.find(x => cats(p).includes(x.category));
    const fam = familiesOf(p)[0];
    const colour = COLOURS.find(c => c.families.includes(fam))?.label ?? ANY;
    say({ from: 'bot', text: `Tees like ${p.name}:` });
    show({ range: g?.slug, kind: isPolo(p) ? 'polos' : undefined, colour, budget: 0, size: size ?? ANY, name: undefined });
  };

  const pickSize = async (p: Product) => {
    const ok = await sizesInStock(p);
    say({ from: 'bot', text: ok.length ? `Which size for ${p.name}?` : `${p.name} is out of stock right now.`, chips: ok.map(s => ({ label: s, act: { t: 'add', id: p.id, size: s } as Act })) });
  };

  const add = async (p: Product, s: string) => {
    remember(s);
    const { full, ok } = await stockOf(p, s);
    if (!ok) {
      say({ from: 'bot', text: `Sorry, ${p.name} just ran out in ${s}.`, chips: [{ label: 'Other sizes', act: { t: 'size', id: p.id } }] });
      return;
    }
    addToCart(full, s, orderColor(full, SHOWN_COLOR[p.id]));
    track('assistant_add', { item_id: p.id, kind: 'tee' });
    window.dispatchEvent(new CustomEvent('pulse-cart'));
    const set = setsWith(p.id)[0];
    say({ from: 'bot', text: `Added ${p.name} (${s}) to your bag.`, chips: [
      { label: 'Go to checkout', primary: true, act: { t: 'go', to: '/checkout' } },
      ...(set ? [{ label: 'Make it a Trilogy', act: { t: 'trilogy', id: set.id } as Act }] : []),
      { label: 'Find another', act: { t: 'reset' } },
    ] });
  };

  // ── Trilogies ──
  const trilogy = async (comboId: string) => {
    const combo = byId.get(comboId);
    const tees = (combo?.groupedProducts ?? []).map(id => byId.get(id)).filter(Boolean) as Product[];
    if (!combo || tees.length < 3) return;
    const regular = tees.reduce((n, t) => n + t.price, 0);
    const name = `${trilogyName(combo)} ${editionOf(combo, sets).label}`;
    const common = trilogySizes(tees);
    const stock = await Promise.all(common.map(async s => (await Promise.all(tees.map(t => stockOf(t, s)))).every(c => c.ok)));
    const ok = common.filter((_, i) => stock[i]);
    say({
      from: 'bot',
      text: `${name}: ${tees.map(t => t.name.replace(/^TwinTex Polo - /, '')).join(', ')}. ₹${Math.round(regular * 0.9).toLocaleString()} for all three, instead of ₹${regular.toLocaleString()}.${ok.length ? ' One size for all three:' : ' It’s out of stock in every size right now.'}`,
      cards: tees.map(t => t.id),
      chips: ok.map(s => ({ label: s === size ? `${s} (your size)` : s, act: { t: 'addTrilogy', id: comboId, size: s } as Act, primary: s === size })),
      link: { to: `/combos?id=${comboId}`, label: 'Open this Trilogy' },
    });
  };

  const addTrilogy = async (comboId: string, s: string) => {
    remember(s);
    const combo = byId.get(comboId);
    const tees = (combo?.groupedProducts ?? []).map(id => byId.get(id)).filter(Boolean) as Product[];
    if (!combo || tees.length < 3) return;
    const checks = await Promise.all(tees.map(t => stockOf(t, s)));
    if (!checks.every(c => c.ok)) {
      say({ from: 'bot', text: `One of these just ran out in ${s}.`, chips: [{ label: 'Other sizes', act: { t: 'trilogy', id: comboId } }] });
      return;
    }
    const full = checks.map(c => c.full);
    const price = Math.round(full.reduce((n, t) => n + t.price, 0) * 0.9);
    const name = `${trilogyName(combo)} ${editionOf(combo, sets).label}`;
    addComboToCart(
      { ...combo, name, price, images: [full[0].images[0]] },
      full.map(p => ({ id: p.id, name: p.name, selectedSize: s, selectedColor: orderColor(p, SHOWN_COLOR[p.id]) ?? '', image: p.images[0], price: p.price, variations: p.variations }))
    );
    track('assistant_add', { item_id: comboId, kind: 'trilogy' });
    window.dispatchEvent(new CustomEvent('pulse-cart'));
    say({ from: 'bot', text: `Added ${name} (${s}) to your bag.`, chips: [
      { label: 'Go to checkout', primary: true, act: { t: 'go', to: '/checkout' } },
      { label: 'Find another', act: { t: 'reset' } },
    ] });
  };

  // ── what each chip does ──
  const run = (act: Act, label?: string) => {
    if (label) me(label);
    switch (act.t) {
      case 'ask': return ask(act.want);
      case 'answer': return answer(act.topic);
      case 'show': return show(act.want, act.from);
      case 'size': { const p = byId.get(act.id); return p && pickSize(p); }
      case 'add': { const p = byId.get(act.id); return p && add(p, act.size); }
      case 'trilogy': return trilogy(act.id);
      case 'addTrilogy': return addTrilogy(act.id, act.size);
      case 'similar': { const p = byId.get(act.id); return p && similar(p); }
      case 'go': setOpen(false); navigate(act.to); return;
      case 'whatsapp': {
        const text = act.text ?? `Hi CHILS & CO., I have a question${pathname.startsWith('/product/') ? ` about ${byId.get(pathname.split('/')[2])?.name ?? 'a tee'}` : ''}.`;
        window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        return;
      }
      case 'reset': setWant({}); return ask({});
    }
  };

  // ── opening: help for the page you're on ──
  const opener = async () => {
    const here = pathname + search;
    if (place === here && log.length) return;
    setPlace(here);
    const id = pathname.match(/^\/product\/(\d+)/)?.[1];
    const p = id && byId.get(id);
    if (p) {
      const ok = await sizesInStock(p);
      const set = setsWith(p.id)[0];
      say({
        from: 'bot',
        text: ok.length ? `${p.name}, ₹${p.price}. In stock in ${ok.join(', ')}. Delivery from ₹80, 7-day returns.` : `${p.name} is out of stock right now.`,
        chips: [
          ...(size && ok.includes(size) ? [{ label: `Add · ${size}`, act: { t: 'add', id: p.id, size } as Act, primary: true }] : ok.map(s => ({ label: `Add · ${s}`, act: { t: 'add', id: p.id, size: s } as Act }))),
          ...(set ? [{ label: 'In a Trilogy?', act: { t: 'trilogy', id: set.id } as Act }] : []),
          { label: 'Similar tees', act: { t: 'similar', id: p.id } },
          { label: 'Size help', act: { t: 'answer', topic: 'size' } },
        ],
      });
      return;
    }
    const group = pathname === '/collection' ? GROUPS.find(g => g.slug === new URLSearchParams(search).get('group')) : undefined;
    if (group) {
      say({ from: 'bot', text: `Want help picking from ${group.name}?` });
      ask({ range: group.slug });
      return;
    }
    if (pathname === '/pick-your-three' || pathname === '/combos') {
      say({ from: 'bot', text: `${FACTS.trilogy} Tap any folded tee to see it, or ask me about one.`, chips: [{ label: 'Find a tee instead', act: { t: 'ask', want: {} } }, { label: 'Talk to us', act: { t: 'whatsapp' } }] });
      return;
    }
    if (cart.length) {
      const n = cart.reduce((k, i) => k + i.quantity, 0);
      say({ from: 'bot', text: `You have ${n} ${n === 1 ? 'item' : 'items'} in your bag. Ready when you are.`, chips: [
        { label: 'Go to checkout', primary: true, act: { t: 'go', to: '/checkout' } },
        { label: 'Delivery & returns', act: { t: 'answer', topic: 'delivery' } },
        { label: 'Find a tee', act: { t: 'ask', want: {} } },
      ] });
      return;
    }
    if (!log.length) say({ from: 'bot', text: 'Hi! I can help you find a tee in a few taps, or answer questions about delivery and returns.' });
    say({ from: 'bot', text: 'What are you looking for?', chips: STARTERS });
  };

  const start = (opening?: Omit<Msg, 'id'>) => {
    setOpen(true);
    track('assistant_open', { page: pathname, from_suggestion: !!opening });
    setNudge(null);
    if (opening) say(opening);
    else opener();
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    me(text);
    const { want: w, topic, like } = read(text, products);
    if (topic) return answer(topic);
    if (like) return similar(like);
    if (!Object.keys(w).length) {
      say({ from: 'bot', text: 'I can search by type, colour, size and budget, like “black oversized L under 500”, or a tee’s name. Or tap below.', chips: STARTERS });
      return;
    }
    if (w.size) remember(w.size);
    // a typed request stands on its own, so earlier answers don't narrow it
    show({ ...w, size: w.size ?? size });
  };

  // ── gentle suggestions from what the shopper is doing ──
  const nudged = () => { try { return Number(sessionStorage.getItem(NUDGE_KEY) || 0); } catch { return MAX_NUDGES; } };
  const offer = useCallback((text: string, begin: () => void) => {
    if (open || nudged() >= MAX_NUDGES) return;
    try { sessionStorage.setItem(NUDGE_KEY, String(nudged() + 1)); } catch { /* storage blocked */ }
    // wait for the bag or any sidebar to close, so the suggestion is actually seen
    let tries = 0;
    const showIt = () => {
      if (document.querySelector('[role="dialog"]') && tries++ < 60) { setTimeout(showIt, 1000); return; }
      setNudge({ text, start: begin });
    };
    showIt();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (nudge) { const t = setTimeout(() => setNudge(null), 12000); return () => clearTimeout(t); } }, [nudge]);

  // lingering on one tee without adding it
  useEffect(() => {
    if (!pathname.startsWith('/product/')) return;
    const before = cart.length;
    const t = setTimeout(() => {
      if (cart.length === before) offer('Not sure about the size? I can help.', () => start());
    }, 25000);
    return () => clearTimeout(t);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // browsing several polos
  useEffect(() => {
    const id = pathname.match(/^\/product\/(\d+)/)?.[1];
    const p = id && byId.get(id);
    if (!p) return;
    let seen: string[] = [];
    try { seen = JSON.parse(sessionStorage.getItem('chils-seen') || '[]'); } catch { /* storage blocked */ }
    if (!seen.includes(p.id)) seen.push(p.id);
    try { sessionStorage.setItem('chils-seen', JSON.stringify(seen)); } catch { /* storage blocked */ }
    const polos = seen.filter(s => { const x = byId.get(s); return x && isPolo(x); }).length;
    if (isPolo(p) && polos === 3) offer('Looking at polos? Our polo Trilogies save 10%.', () => start({ from: 'bot', text: FACTS.trilogy, link: LINKS.trilogy }));
  }, [pathname, byId]); // eslint-disable-line react-hooks/exhaustive-deps

  // a second tee in the bag
  useEffect(() => {
    const tees = cart.filter(i => !i.isCombo).reduce((n, i) => n + i.quantity, 0);
    if (tees === 2) offer('Buying a few? Trilogies bundle three tees and save 10%.', () => start({ from: 'bot', text: FACTS.trilogy, link: LINKS.trilogy }));
  }, [cart]); // eslint-disable-line react-hooks/exhaustive-deps

  // opening the bag again without checking out
  useEffect(() => {
    let opens = 0;
    const onBag = () => { opens += 1; if (opens === 2) offer('Any questions about delivery or returns?', () => start({ from: 'bot', text: `${FACTS.delivery} ${FACTS.returns}` })); };
    window.addEventListener('bag-open', onBag);
    return () => window.removeEventListener('bag-open', onBag);
  }, [offer]);

  // product pages have a buy bar along the bottom, so the helper sits above it
  const lifted = pathname.startsWith('/product/');

  // at the very bottom the launcher would cover the footer's "Crafted by Uday", so it steps away
  const [footerInView, setFooterInView] = useState(false);
  useEffect(() => {
    const target = document.querySelector('.ub-badge-wrap');
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setFooterInView(e.isIntersecting), { rootMargin: '0px 0px -10px 0px' });
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  if (hidden) return null;

  return (
    <>
      {/* launcher and the occasional suggestion */}
      <div style={{ opacity: footerInView ? 0 : 1, pointerEvents: footerInView ? 'none' : undefined, transition: 'opacity .3s' }} className={`fixed z-[70] right-4 md:right-6 ${lifted ? 'bottom-24 md:bottom-24' : 'bottom-5 md:bottom-6'} flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)]`}>
        <AnimatePresence>
          {nudge && !open && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35 }} className="max-w-[260px] bg-[#fff] text-ink rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,.35)] pl-4 pr-2 py-3 flex items-start gap-2">
              <button onClick={nudge.start} className="text-sm text-left leading-snug cursor-pointer">{nudge.text}</button>
              <button onClick={() => setNudge(null)} aria-label="Dismiss" className="shrink-0 p-1 text-neutral-400 hover:text-ink cursor-pointer"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          // On a phone it shows its name; on a computer it stays a small round button over the page
          // (so it never sits on a price) and says "Ask CHILS" when you point at it.
          <button onClick={() => start()} aria-label="Ask CHILS" className="group btn-primary h-12 pl-4 pr-5 md:px-0 md:w-12 md:hover:w-[132px] md:transition-[width,transform,background-color] md:duration-300 md:ease-soft flex items-center justify-center gap-2 md:gap-0 text-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)] cursor-pointer overflow-hidden">
            <Snowflake className="w-[15px] h-[17px] shrink-0" />
            <span className="md:max-w-0 md:opacity-0 md:group-hover:max-w-[90px] md:group-hover:opacity-100 md:group-hover:ml-2 md:transition-all md:duration-300 whitespace-nowrap">Ask CHILS</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div key="shade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="md:hidden fixed inset-0 z-[79] bg-[#0e0e0c]/35" />
        )}
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label="Ask CHILS"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[80] inset-x-0 bottom-0 h-[82dvh] rounded-t-2xl md:inset-x-auto md:right-6 md:bottom-6 md:w-[390px] md:h-[620px] md:max-h-[calc(100svh-120px)] md:rounded-2xl bg-[#fff] text-ink flex flex-col overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,.45)]"
          >
            <header className="flex items-center justify-between px-5 h-14 border-b border-black/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-ink text-[#fff] flex items-center justify-center shrink-0"><Snowflake className="w-[14px] h-[16px]" /></span>
                <div>
                  <p className="text-sm font-semibold">Ask CHILS</p>
                  <p className="text-[11px] text-neutral-500">Find your tee in a few taps</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="-mr-2 p-2 cursor-pointer"><X size={18} /></button>
            </header>

            <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f6f6f4]" data-lenis-prevent aria-live="polite">
              {log.map(m => (
                <div key={m.id} className={m.from === 'me' ? 'flex justify-end' : ''}>
                  {m.text && (m.from === 'me' ? (
                    <p className="inline-block max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl bg-ink text-[#fff] rounded-br-md">{m.text}</p>
                  ) : (
                    <div className="flex items-end gap-2">
                      <span className="w-6 h-6 rounded-full bg-ink text-[#fff] flex items-center justify-center shrink-0 mb-0.5"><Snowflake className="w-[11px] h-[12px]" /></span>
                      <p className="inline-block max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl bg-[#fff] rounded-bl-md">{m.text}</p>
                    </div>
                  ))}
                  {m.link && (
                    <Link to={m.link.to} onClick={() => setOpen(false)} className="link-brass block mt-2 ml-8 text-sm w-fit">{m.link.label}</Link>
                  )}
                  {m.cards && (
                    <div className="mt-2 -mx-4 px-4 flex gap-2 overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {m.cards.map(id => byId.get(id)).filter(Boolean).map(p => p!).map(p => (
                        <article key={p.id} className="snap-start shrink-0 w-[150px] bg-[#fff] rounded-xl overflow-hidden">
                          <Link to={`/product/${p.id}`} onClick={() => setOpen(false)} className="block aspect-[3/4] bg-[#e4e3df]">
                            <img src={small(p.images[0])} alt={p.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover object-top" />
                          </Link>
                          <div className="p-2.5">
                            <p className="text-[13px] font-medium truncate">{p.name}</p>
                            <p className="text-[11px] text-neutral-500 truncate">{reason(p)}</p>
                            <button onClick={() => (m.size ? add(p, m.size) : pickSize(p))} className="btn-primary mt-2 w-full py-2 text-xs cursor-pointer">
                              {m.size ? `Add · ${m.size}` : 'Choose size'}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                  {m.chips && m.chips.length > 0 && (
                    <div className={`mt-2 flex flex-wrap gap-1.5 ${m.text ? 'ml-8' : ''}`}>
                      {m.chips.map(c => (
                        <button key={c.label} onClick={() => run(c.act, c.label)} className={`rounded-full px-3.5 py-2 text-[13px] border cursor-pointer transition-colors ${c.primary ? 'bg-ink text-[#fff] border-ink' : 'bg-[#fff] border-black/15 hover:border-ink'}`}>{c.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={send} className="shrink-0 border-t border-black/10 p-3 flex items-center gap-2 pb-[max(.75rem,env(safe-area-inset-bottom))]">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Try “black oversized L under 500”"
                aria-label="Ask CHILS"
                className="flex-1 h-11 px-4 rounded-full bg-[#f1f1ef] text-[16px] outline-none placeholder:text-neutral-400"
              />
              <button type="submit" aria-label="Send" className="btn-primary w-11 h-11 flex items-center justify-center cursor-pointer"><ArrowUp size={18} /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default Assistant;
