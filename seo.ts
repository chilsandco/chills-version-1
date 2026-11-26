// Search and AI-assistant visibility for the shop pages.
//
// The shop is drawn in the browser, so a crawler that does not run JavaScript sees an empty page.
// This file gives crawlers real content:
//   1. Keyword pages (/oversized-t-shirts-for-men, /polo-t-shirts-for-men, ...), complete HTML that
//      lists the matching products straight from the live catalogue.
//   2. Readable content for the home, collection, product and policy pages. It is placed inside the
//      page's root element; the shop replaces it the moment it starts, so visitors see no change.
//
// Every fact here is checked against the store: prices and colours come from the catalogue, the
// fabric facts from product descriptions (all 25 oversized tees are 100% cotton at 240 GSM), and
// shipping and returns from the site's own policy pages. Do not add a claim you cannot point to.
import { SITE, BRAND, esc, inr, imgUrl, page, orgLd, ARTICLES } from "./journal";

// Google Merchant Center feed settings (see merchantFeedXml below). Owner decisions: change them here.
export const MERCHANT_FEED = {
  gender: "male" as "male" | "female" | "unisex",
  ageGroup: "adult" as "adult" | "teen" | "kids",
  googleProductCategory: "Apparel & Accessories > Clothing > Shirts & Tops",
  sizeSystem: "IN",
};

type P = any;
const visible = (ps: P[]) => ps.filter(p => String(p.id) !== "1672" && p.status !== "outofstock");
const isOversized = (p: P) => /drop shoulder|oversized/i.test(String(p.category));
const isPolo = (p: P) => /polo/i.test(String(p.name)) && p.type !== "grouped";
const isCombo = (p: P) => String(p.category) === "Combos";
const isRegular = (p: P) => !isOversized(p) && !isCombo(p);

const range = (ps: P[]) => {
  const n = ps.map(p => Number(p.price)).filter(x => x > 0);
  return n.length ? { lo: Math.min(...n), hi: Math.max(...n) } : null;
};
const topColors = (ps: P[], n = 6) => {
  const c = new Map<string, number>();
  for (const p of ps) for (const col of p.availableColors || []) c.set(col, (c.get(col) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
};
const plainText = (html: string) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .trim();


// A seasonal code that exists in WooCommerce (GIFT10: 10% off orders of Rs 999 or more, one code per order,
// not combinable with three-tee sets). The line below is shown only until the code expires, so no page
// ever advertises a dead offer. Keep the date in step with the coupon's expiry in WooCommerce.
const PROMO_ENDS = new Date("2027-01-06T00:00:00+05:30");
const promoLine = (now = new Date()) =>
  now < PROMO_ENDS ? "Gifting offer: use code GIFT10 at checkout for 10% off orders of ₹999 or more, until 5 January. It cannot be combined with three-tee sets." : "";

// ------------------------------------------------------------------ keyword landing pages

type Landing = {
  path: string;
  title: string;
  h1: string;
  description: string;
  pick: (p: P) => boolean;
  intro: (ps: P[]) => string[];
  sections: (ps: P[]) => { h2: string; p?: string[]; ul?: string[] }[];
  faq: (ps: P[]) => { q: string; a: string }[];
  related: { href: string; label: string }[];
  limit?: number;
};

const SHARED_FAQ = [
  { q: "How long does delivery take?", a: "Orders are packed within 24 to 48 hours and delivered across India in 2 to 7 business days, with SMS and email tracking. Delivery starts at ₹80, and store pickup is free." },
  { q: "What is the return policy?", a: "You can return a tee within 7 days of delivery for a refund, an exchange or store credit. The tee must be unworn and unwashed with its tags on. Refunds reach your PhonePe or original payment method in 3 to 7 business days." },
];

export const LANDINGS: Landing[] = [
  {
    path: "/oversized-t-shirts-for-men",
    title: "Oversized T-Shirts for Men | 240 GSM Cotton | CHILS & CO.",
    h1: "Oversized t-shirts for men",
    description: "Heavyweight oversized drop shoulder t-shirts in 100% cotton at 240 GSM, designed by techies in Hyderabad. Delivered across India with 7-day returns.",
    pick: isOversized,
    intro: ps => {
      const r = range(ps);
      return [
        `Our oversized t-shirts are cut as drop shoulder tees in 100% cotton at 240 GSM, a heavyweight fabric that holds its shape instead of hanging limp. There are ${ps.length} designs${r ? `, priced from ${inr(r.lo)} to ${inr(r.hi)}` : ""}.`,
        "We build them with reinforced stitching at the neck and shoulders and fade-resistant DTF artwork, as set out on our Our promise page. The designs are graphic tees from the worlds of code, chips and engineering, designed by techies in Hyderabad and delivered across India.",
      ];
    },
    sections: ps => [
      {
        h2: "What makes them oversized",
        ul: [
          "Drop shoulder cut: the shoulder seam sits low on the upper arm, for a relaxed shape.",
          "100% cotton at 240 GSM: heavyweight, soft and breathable.",
          "Built with reinforced neck and shoulder stitching so the tee keeps its shape.",
          "DTF artwork designed to resist fading, best washed inside out.",
        ],
      },
      {
        h2: "Colours",
        p: [`Colours across the range include ${topColors(ps).join(", ")}. Black is available on ${ps.filter(p => (p.availableColors || []).some((c: string) => /black/i.test(c))).length} of the ${ps.length} designs.`],
      },
      {
        h2: "Picking your size",
        p: ["Oversized tees are cut larger already, so start with your usual size and check the size guide on the product page for the measurements. Every design comes in sizes S to XL."],
      },
    ],
    faq: () => [
      { q: "What fabric are your oversized t-shirts made of?", a: "100% cotton at 240 GSM, a heavyweight weight that keeps the shape of a loose cut." },
      { q: "Should I size up for an oversized t-shirt?", a: "Usually no. The cut is already larger, so start with your usual size and check the size guide for measurements." },
      { q: "Are the prints durable?", a: "Our prints use DTF artwork designed to resist fading. For the longest life, wash the tee inside out and avoid a hot dryer." },
      ...SHARED_FAQ,
    ],
    related: [
      { href: "/journal/oversized-vs-boxy-vs-drop-shoulder-tshirt", label: "Oversized, boxy or drop shoulder: what's the difference?" },
      { href: "/journal/how-to-choose-an-oversized-graphic-tshirt-india", label: "How to choose an oversized graphic t-shirt" },
      { href: "/polo-t-shirts-for-men", label: "Polo t-shirts for men" },
    ],
  },
  {
    path: "/polo-t-shirts-for-men",
    title: "Polo Shirts for Men | Heavyweight 240 GSM | CHILS & CO.",
    h1: "Polo shirts and polo t-shirts for men",
    description: "Polo shirts for men with a structured collar, in heavyweight 240 GSM TwinTex fabric. Designed by techies in Hyderabad. Delivered across India, 7-day returns.",
    pick: isPolo,
    intro: ps => {
      const r = range(ps);
      return [
        `Our TwinTex polo shirts have a structured collar and a relaxed fit, knitted from a heavyweight 240 GSM fabric with cotton on the inside and polyester on the outside. There are ${ps.length} designs${r ? `, ${r.lo === r.hi ? `at ${inr(r.lo)}` : `from ${inr(r.lo)} to ${inr(r.hi)}`}` : ""}.`,
        "They are made for everyday wear: soft and breathable against the skin, with premium DTF branding.",
      ];
    },
    sections: ps => [
      {
        h2: "Why TwinTex",
        ul: [
          "Cotton inside, polyester outside: soft against the skin, and it keeps its look.",
          "240 GSM heavyweight knit with a structured polo collar.",
          "Relaxed fit for everyday wear.",
        ],
      },
      { h2: "Colours", p: [`Available colours include ${topColors(ps).join(", ") || "black, navy and green"}.`] },
    ],
    faq: () => [
      { q: "What is TwinTex fabric?", a: "TwinTex is our polo fabric: a 240 GSM heavyweight knit with cotton on the inside and polyester on the outside." },
      { q: "Do the polos have a relaxed or slim fit?", a: "A relaxed fit with a structured collar. Check the size guide on the product page for measurements." },
      ...SHARED_FAQ,
    ],
    related: [
      { href: "/t-shirt-combos", label: "Three-tee stacks, save 10%" },
      { href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" },
    ],
  },
  {
    path: "/t-shirt-combos",
    title: "T-Shirt Combos: Pick 3 and Save 10% | CHILS & CO.",
    h1: "T-shirt combos: three tees, save 10%",
    description: "Three tees chosen to go together and banded as a numbered Trilogy. Pick your size and save 10%. Delivered across India with 7-day returns.",
    pick: isCombo,
    intro: ps => [
      `Our stacks are three tees chosen to go together, banded as a numbered Trilogy. Pick your size and save 10%. There are ${ps.length} stacks to choose from, including core tees and polo stacks.`,
      "You can also build your own set of three on the Pick Your Three page.",
    ],
    sections: () => [
      {
        h2: "How a stack works",
        ul: [
          "Each stack is three tees chosen to go together, banded as a numbered Trilogy.",
          "Choose your size once and save 10% on the set.",
          "Or pick any three tees yourself on the Pick Your Three page.",
        ],
      },
    ],
    faq: () => [
      { q: "How much do I save on a combo?", a: "A Trilogy of three tees saves 10%." },
      { q: "Can I choose my own three tees?", a: "Yes. Use the Pick Your Three page to build your own set." },
      ...SHARED_FAQ,
    ],
    related: [
      { href: "/pick-your-three", label: "Build your own three" },
      { href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" },
    ],
  },
  {
    path: "/regular-fit-t-shirts-for-men",
    title: "Regular Fit T-Shirts for Men | Cotton & Blends | CHILS & CO.",
    h1: "Regular fit t-shirts for men",
    description: "Regular fit and minimal t-shirts in cotton and cotton-blend fabrics, from 180 to 240 GSM, designed by techies in Hyderabad. Delivered across India.",
    pick: isRegular,
    intro: ps => {
      const r = range(ps);
      return [
        `A cleaner, closer cut than our oversized range. Our regular fit and minimal tees come in 100% cotton, cotton blends and polycotton, between 180 and 240 GSM depending on the design. There are ${ps.length} designs${r ? `, from ${inr(r.lo)} to ${inr(r.hi)}` : ""}.`,
        "Product pages list the fabric and weight, so you can choose the feel you want.",
      ];
    },
    sections: ps => [
      {
        h2: "Regular fit or oversized?",
        p: ["Regular fit follows your body without clinging, and suits layering and a neat look. If you want the relaxed, loose silhouette, see our oversized t-shirts instead."],
      },
      { h2: "Colours", p: [`Available colours include ${topColors(ps, 8).join(", ")}.`] },
    ],
    faq: () => [
      { q: "What fabrics do regular fit tees come in?", a: "A mix of 100% cotton, cotton blend (60% cotton, 40% polyester) and polycotton, between 180 and 240 GSM. Each product page lists the exact fabric." },
      { q: "What is the difference between regular fit and oversized?", a: "Regular fit follows the body without clinging. Oversized is cut larger, with a lower shoulder seam, for a relaxed look." },
      ...SHARED_FAQ,
    ],
    related: [{ href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" }, { href: "/t-shirt-combos", label: "Three-tee stacks" }],
  },
  {
    path: "/corporate-gifting",
    title: "Corporate Gifts for Employees | Premium T-Shirts | CHILS & CO.",
    h1: "Corporate gifting: premium t-shirts for teams and clients",
    description: "Corporate gifts for employees and clients: heavyweight cotton tees and polos designed by techies in Hyderabad. Delivered across India. Message us for team orders.",
    limit: 18,
    pick: p => (isOversized(p) || isPolo(p)) && p.type !== "grouped",
    intro: ps => {
      const r = range(ps);
      return [
        `A good corporate gift is something people actually wear. ${BRAND} makes heavyweight oversized tees in 100% cotton at 240 GSM and TwinTex polos, designed by techies in Hyderabad${r ? `, ${inr(r.lo)} to ${inr(r.hi)} each` : ""}. They suit engineering and tech teams, year-end gifting and client thank-yous.`,
        "Orders are delivered across India and arrive in reusable Second Life packaging.",
        ...(promoLine() ? [promoLine()] : []),
      ];
    },
    sections: () => [
      {
        h2: "Ways to gift with CHILS & CO.",
        ul: [
          "Ready-made tees and polos: choose a design for the team and order by size.",
          "Three-tee stacks: three tees chosen to go together, with 10% off the set, for a larger gift.",
          "Custom Studio: design your own tee with your artwork on the front, back or sleeve.",
        ],
      },
      {
        h2: "Planning a team or company order?",
        p: [
          `Message us on WhatsApp at +91 78420 70404 or email hello.chilsandco@gmail.com with the number of pieces, the sizes, the design you like and the date you need them by. We will reply with what we can do. Please ask before you plan around a date, since large orders depend on stock and size.`,
        ],
      },
      {
        h2: "Why a tee works as a corporate gift",
        ul: [
          "People wear it, so the gift is remembered after the event.",
          "A heavyweight cotton tee feels like a real gift, not a giveaway.",
          "Sizes S to XL on the oversized range; the loose cut is forgiving across body types.",
        ],
      },
      {
        h2: "Delivery",
        p: ["Delivery across India starts at ₹80. Orders are packed within 24 to 48 hours and delivered in 2 to 7 business days, tracked by SMS and email. Order early for a fixed date, since busy periods can slow couriers."],
      },
    ],
    faq: () => [
      { q: "Can I order t-shirts for my whole team?", a: "Yes, ask us first. Message us on WhatsApp at +91 78420 70404 or email hello.chilsandco@gmail.com with the number of pieces, sizes and the date you need them. We reply with what we can do." },
      { q: "Can I add my company logo?", a: "The Custom Studio lets you design a tee with your own artwork. For a logo on many pieces, message us before you order so we can confirm what is possible." },
      { q: "What are good corporate gifts for employees?", a: "Something people use. A heavyweight cotton tee or a polo is wearable, memorable and works for tech and engineering teams." },
      ...SHARED_FAQ,
    ],
    related: [
      { href: "/journal/corporate-gift-ideas-for-employees-india", label: "Corporate gift ideas for employees in India" },
      { href: "/secret-santa-gifts", label: "Secret Santa gifts under ₹500" },
      { href: "/t-shirt-combos", label: "Three-tee stacks, save 10%" },
    ],
  },
  {
    path: "/christmas-gifts-for-men",
    title: "Christmas & New Year Gifts for Men | Tees from ₹349 | CHILS & CO.",
    h1: "Christmas and New Year gifts for men",
    description: "Christmas and New Year gift ideas for men: heavyweight oversized tees, polos and three-tee stacks, from ₹349. Designed in Hyderabad, delivered across India.",
    limit: 24,
    pick: p => p.type !== "grouped",
    intro: ps => {
      const r = range(ps);
      return [
        `A tee is an easy gift for men that they will use all year. ${BRAND} has ${ps.length} designs${r ? `, from ${inr(r.lo)} to ${inr(r.hi)}` : ""}, from heavyweight oversized tees to TwinTex polos, with designs from the worlds of code, chips and engineering.`,
        "Delivery across India starts at ₹80, in reusable Second Life packaging. Order early so it arrives before the day.",
        ...(promoLine() ? [promoLine()] : []),
      ];
    },
    sections: ps => [
      {
        h2: "Gifts by budget",
        ul: [
          `Under ₹500: ${ps.filter(p => Number(p.price) <= 500).length} designs.`,
          `Under ₹600: ${ps.filter(p => Number(p.price) <= 600).length} designs, including our TwinTex polos.`,
          "A set of three: a three-tee stack saves 10% on the set.",
        ],
      },
      {
        h2: "How to choose for him",
        ul: [
          "Loose, relaxed style: pick an oversized drop shoulder tee in 100% cotton at 240 GSM.",
          "Neater, smarter look: pick a polo or a regular fit tee.",
          "Not sure of the size: check a tee he already owns, measure it flat across the chest, and compare with the size guide on the product page.",
          "An engineer or developer: choose a design from his field.",
        ],
      },
      {
        h2: "Timing",
        p: ["Orders are packed within 24 to 48 hours and delivered in 2 to 7 business days. If the size is wrong, returns and exchanges are accepted within 7 days of delivery, as long as the tee is unworn and unwashed with its tags on."],
      },
    ],
    faq: () => [
      { q: "What is a good Christmas gift for men?", a: "A practical gift he will use. A heavyweight cotton tee or a polo suits most men, and a design from his work or interests makes it personal." },
      { q: "Will it arrive before Christmas?", a: "Orders are packed within 24 to 48 hours and delivered in 2 to 7 business days across India. Order early, since the festive season can slow couriers." },
      { q: "What if the size is wrong?", a: "Returns and exchanges are accepted within 7 days of delivery. The tee must be unworn and unwashed with its tags on." },
      { q: "Do you have a gift under ₹500?", a: "Yes. Several designs are priced at ₹499 or less. The list above shows the current ones." },
    ],
    related: [
      { href: "/secret-santa-gifts", label: "Secret Santa gifts under ₹500" },
      { href: "/corporate-gifting", label: "Corporate gifting" },
      { href: "/journal/christmas-gift-ideas-for-men-engineers-developers", label: "Christmas gift ideas for engineers and developers" },
    ],
  },
  {
    path: "/secret-santa-gifts",
    title: "Secret Santa Gifts Under ₹500 | T-Shirts for Men | CHILS & CO.",
    h1: "Secret Santa gifts under ₹500",
    description: "Secret Santa gift ideas under ₹500: heavyweight cotton tees and regular fit tees, designed by techies in Hyderabad. Delivered across India.",
    limit: 24,
    pick: p => Number(p.price) <= 500 && p.type !== "grouped",
    intro: ps => [
      `Secret Santa works best with a gift that is useful and not too personal. A tee fits: it suits most people, and a design from the worlds of code and engineering is a safe, friendly joke for a team. ${ps.length} of our designs are ₹500 or less.`,
      "Delivery across India starts at ₹80, in reusable Second Life packaging.",
    ],
    sections: () => [
      {
        h2: "Picking one for a coworker",
        ul: [
          "Choose a design that is friendly, not too personal.",
          "Pick a common size for the person, or an oversized cut, which is more forgiving.",
          "If you do not know the size, an oversized tee in their usual size works for most people.",
        ],
      },
      {
        h2: "Timing for the draw",
        p: ["Orders are packed within 24 to 48 hours and delivered in 2 to 7 business days. Order a week before the exchange. Returns and exchanges are accepted within 7 days of delivery, for an unworn, unwashed tee with its tags on."],
      },
    ],
    faq: () => [
      { q: "What is a good Secret Santa gift under ₹500?", a: "A tee is a safe, useful choice. Several of our designs are ₹499 or less, and a design from the world of code or engineering works well for tech teams." },
      { q: "How do I choose a size for a Secret Santa gift?", a: "Pick a common size, or choose an oversized cut, which is more forgiving. Check the size guide on the product page for measurements." },
      { q: "How long does delivery take?", a: "Orders are packed within 24 to 48 hours and delivered across India in 2 to 7 business days. Order about a week ahead of the exchange." },
    ],
    related: [
      { href: "/journal/secret-santa-gift-ideas-for-coworkers-india", label: "Secret Santa gift ideas for coworkers" },
      { href: "/christmas-gifts-for-men", label: "Christmas and New Year gifts for men" },
    ],
  },
];

function cardGrid(ps: P[], limit = 40) {
  return `<div class="grid">${ps
    .filter(p => p.images?.[0])
    .slice(0, limit)
    .map(p => `<a class="card" href="/product/${esc(p.id)}"><img loading="lazy" width="300" height="375" src="${esc(imgUrl(p.images[0], true))}" alt="${esc(p.name)}"><span>${esc(p.name)}<br><em>${inr(p.price)}</em></span></a>`)
    .join("")}</div>`;
}

export function landingHtml(l: Landing, all: P[]) {
  const ps = visible(all).filter(l.pick);
  const faq = l.faq(ps);
  const body = `<main>
<p class="eyebrow">${esc(BRAND)}</p>
<h1>${esc(l.h1)}</h1>
${l.intro(ps).map(t => `<p>${esc(t)}</p>`).join("")}
<h2>Shop the range</h2>
${ps.some(p => p.images?.[0]) ? cardGrid(ps, l.limit) : ps.length ? `<ul>${ps.map(p => `<li><a href="/product/${esc(p.id)}">${esc(p.name)}</a> · ${inr(p.price)}</li>`).join("")}</ul>` : `<p><a href="/collection">See the full collection</a></p>`}
<p><a class="pill" href="/collection">Shop the full collection</a></p>
${l
  .sections(ps)
  .map(s => `<section><h2>${esc(s.h2)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join("")}${s.ul ? `<ul>${s.ul.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}</section>`)
  .join("\n")}
<section class="faq"><h2>Frequently asked questions</h2>
${faq.map(f => `<details open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
</section>
<section><h2>Keep reading</h2><ul>${l.related.map(r => `<li><a href="${r.href}">${esc(r.label)}</a></li>`).join("")}</ul></section>
</main>`;
  return page({
    title: l.title,
    description: l.description,
    path: l.path,
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: l.h1,
        url: `${SITE}${l.path}`,
        description: l.description,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: ps.length,
          itemListElement: ps.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/product/${p.id}`, name: p.name })),
        },
      },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: l.h1, item: `${SITE}${l.path}` },
        ],
      },
      orgLd,
    ],
  });
}

// ------------------------------------------------------------------ content inside the shop's pages

const BOX = `<div style="max-width:760px;margin:0 auto;padding:88px 20px 48px;font:16px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141311">`;
const links = (items: { href: string; label: string }[]) => `<ul>${items.map(i => `<li><a href="${i.href}">${esc(i.label)}</a></li>`).join("")}</ul>`;
const productLinks = (ps: P[]) => `<ul>${ps.map(p => `<li><a href="/product/${esc(p.id)}">${esc(p.name)}</a> · ${inr(p.price)}</li>`).join("")}</ul>`;

const POLICY = `<h2>Delivery and returns</h2><ul>
<li>Delivery across India from ₹80, packed within 24 to 48 hours and delivered in 2 to 7 business days, tracked by SMS and email. Store pickup is free.</li>
<li>Returns within 7 days of delivery for a refund, exchange or store credit. Refunds reach your PhonePe or original payment method in 3 to 7 business days.</li>
<li>Reusable Second Life packaging and plastic-free shipping.</li></ul>`;

const GUIDES = links([
  ...LANDINGS.map(l => ({ href: l.path, label: l.h1 })),
  { href: "/journal", label: "Journal: fit, fabric and style guides" },
]);

export function homeBody(all: P[]) {
  const ps = visible(all);
  const over = ps.filter(isOversized);
  const r = range(ps);
  return `${BOX}<h1>Oversized t-shirts and polos for men, designed by techies in Hyderabad</h1>
<p>${esc(BRAND)} makes heavyweight oversized drop shoulder graphic tees in 100% cotton at 240 GSM, TwinTex polo shirts and minimal regular fit tees, designed by techies in Hyderabad${r ? `, priced from ${inr(r.lo)}` : ""}. We deliver across India, with 7-day returns.</p>
${promoLine() ? `<p><strong>${esc(promoLine())}</strong></p>` : ""}
<h2>Shop by type</h2>${links([
    { href: "/oversized-t-shirts-for-men", label: `Oversized t-shirts for men (${over.length} designs)` },
    { href: "/polo-t-shirts-for-men", label: "Polo shirts for men" },
    { href: "/regular-fit-t-shirts-for-men", label: "Regular fit t-shirts for men" },
    { href: "/t-shirt-combos", label: "Three-tee stacks: save 10%" },
    { href: "/christmas-gifts-for-men", label: "Christmas and New Year gifts for men" },
    { href: "/secret-santa-gifts", label: "Secret Santa gifts under ₹500" },
    { href: "/corporate-gifting", label: "Corporate gifting for teams" },
    { href: "/collection", label: "The full collection" },
  ])}
<h2>Popular oversized tees</h2>${productLinks(over.slice(0, 12))}
<h2>Why people choose us</h2><ul>
<li>Heavyweight 100% cotton at 240 GSM on every oversized tee.</li>
<li>Built with reinforced neck and shoulder stitching and fade-resistant DTF artwork.</li>
<li>Designs from the worlds of code, chips and engineering.</li></ul>
${POLICY}
<h2>Guides</h2>${GUIDES}</div>`;
}

export function collectionBody(all: P[]) {
  const ps = visible(all);
  const group = (title: string, items: P[]) => (items.length ? `<h2>${esc(title)} (${items.length})</h2>${productLinks(items)}` : "");
  return `${BOX}<h1>Shop t-shirts and polos for men</h1>
<p>Every ${esc(BRAND)} design in one place: ${ps.length} products across oversized drop shoulder tees, TwinTex polos, minimal and regular fit tees, and three-tee stacks. Delivered across India from ₹80, with 7-day returns.</p>
${group("Oversized drop shoulder t-shirts", ps.filter(isOversized))}
${group("Polo t-shirts", ps.filter(isPolo))}
${group("Regular fit and minimal t-shirts", ps.filter(p => isRegular(p) && !isPolo(p)))}
${group("Three-tee stacks", ps.filter(isCombo))}
${POLICY}
<h2>Guides</h2>${GUIDES}</div>`;
}

/** The product's own words, as clean lines: its bullet points first, then the story. */
function descriptionParts(p: P) {
  const lines = String(p.description || "").split(/\n/).map(l => l.trim()).filter(Boolean);
  const bullets = lines.filter(l => /^[-•]/.test(l)).map(l => l.replace(/^[-•]\s*/, ""));
  const prose = lines.filter(l => !/^[-•]/.test(l));
  const story = plainText(String(p.shortDescription || p.concept || "")).replace(/^Story Behind The Design\s*/i, "");
  return { bullets, prose: prose.join(" "), story };
}

export function productTypeLabel(p: P) {
  if (isPolo(p)) return "Polo T-Shirt for Men";
  if (isCombo(p)) return "T-Shirt Combo";
  if (isOversized(p)) return "Oversized T-Shirt for Men";
  return "T-Shirt for Men";
}

export function productBody(p: P) {
  const d = descriptionParts(p);
  const sizes = (p.availableSizes || []).join(", ");
  const cols = (p.availableColors || []).join(", ");
  return `${BOX}<p><a href="/collection">All products</a></p>
<h1>${esc(p.name)} ${esc(productTypeLabel(p))}</h1>
<p><strong>${inr(p.price)}</strong>${p.category ? ` · ${esc(p.category)}` : ""}${p.fit ? ` · ${esc(p.fit)}` : ""}</p>
${p.images?.[0] ? `<p><img src="${esc(imgUrl(p.images[0]))}" alt="${esc(p.name)}" width="480" style="max-width:100%;height:auto"></p>` : ""}
${d.bullets.length ? `<h2>Details</h2><ul>${d.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
${sizes || cols ? `<h2>Sizes and colours</h2><p>${sizes ? `Sizes: ${esc(sizes)}. ` : ""}${cols ? `Colours: ${esc(cols)}.` : ""}</p>` : ""}
${d.story ? `<h2>The story</h2><p>${esc(d.story).slice(0, 900)}</p>` : ""}
${p.care ? `<h2>Care</h2><p>${esc(p.care)}</p>` : ""}
${POLICY}
<h2>More like this</h2>${links([
    isOversized(p) ? { href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" } : isPolo(p) ? { href: "/polo-t-shirts-for-men", label: "Polo t-shirts for men" } : { href: "/regular-fit-t-shirts-for-men", label: "Regular fit t-shirts for men" },
    { href: "/collection", label: "The full collection" },
  ])}</div>`;
}

export function policyBody(path: string) {
  if (path === "/shipping-delivery")
    return `${BOX}<h1>Shipping and delivery</h1><p>We deliver across India. Delivery costs from ₹80, and you see the exact amount at checkout before you pay.</p><ul>
<li>Packing: orders are packed and handed to the courier within 24 to 48 hours.</li>
<li>Delivery time: 2 to 7 business days, tracked by SMS and email. Business days do not include Sundays or public holidays.</li>
<li>Store pickup: free.</li>
<li>Estimates can slip because of weather, courier delays or very busy periods, and we keep you posted.</li></ul>
<p><a href="/returns-refunds">Returns and refunds</a> · <a href="/collection">Shop</a></p></div>`;
  if (path === "/returns-refunds")
    return `${BOX}<h1>Returns and refunds</h1><p>Return a tee within 7 days of delivery for a refund, an exchange or store credit.</p><ul>
<li>What we cannot take back: tees that have been worn or washed, with tags or trims removed, damage after delivery, and requests made more than 7 days after delivery.</li>
<li>How to ask: tell us the reason, add a short description and up to three photos. Photos are needed for damaged items, wrong items and quality concerns.</li>
<li>What happens next: our team reviews every request. If it is approved we email you the pickup details; pickup depends on the courier serving your area.</li>
<li>Refunds go to your PhonePe or original payment method in 3 to 7 business days after the tee is back and checked.</li></ul>
<p><a href="/shipping-delivery">Shipping and delivery</a> · <a href="/collection">Shop</a></p></div>`;
  if (path === "/our-promise")
    return `${BOX}<h1>Our promise</h1><p>${esc(BRAND)} stands behind how its tees are made and packed.</p><ul>
<li>Fabric: our oversized tees are heavyweight 100% cotton at 240 GSM.</li>
<li>Construction: reinforced stitching at the neck and shoulders, and high-definition, fade-resistant DTF artwork.</li>
<li>Packaging: reusable Second Life packaging and plastic-free shipping.</li></ul>
<p><a href="/collection">Shop the collection</a></p></div>`;
  return "";
}

/** Product JSON-LD that Google can use for shopping results, with our own image addresses. */
export function productSchema(p: P, canonical: string) {
  const imgs = (p.images || []).slice(0, 4).map((i: string) => imgUrl(i));
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    image: imgs,
    description: plainText(descriptionParts(p).bullets.join(". ") || p.shortDescription || p.name).slice(0, 500),
    sku: `CHLS-${p.id}`,
    brand: { "@type": "Brand", name: BRAND },
    category: p.category,
    ...(p.availableColors?.length ? { color: p.availableColors.join(", ") } : {}),
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "INR",
      price: String(p.price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        merchantReturnLink: `${SITE}/returns-refunds`,
      },
    },
  };
}

export function registerLandings(app: any, getProducts: () => P[] | null) {
  for (const l of LANDINGS) {
    app.get(l.path, (_req: any, res: any) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
      res.send(landingHtml(l, getProducts() || []));
    });
  }
}

export { ARTICLES };

// ── Google Merchant Center product feed ─────────────────────────────────────
// RSS 2.0 with the g: namespace, one item per variation (colour and size), grouped by product id.
// Everything comes from the live catalogue: names, descriptions, prices, colours, sizes and stock.

const xmlText = (s: unknown) => esc(String(s ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, ""));
const plain = (s: unknown) => String(s ?? "")
  .replace(/<[^>]*>/g, " ")
  .replace(/^\s*-\s+/gm, "")
  .replace(/\s+/g, " ")
  .trim();
const price = (n: unknown) => `${(Number(n) || 0).toFixed(2)} INR`;

/** Products that belong in the feed: not the hidden test product, not grouped combos. */
export const feedEligible = (p: P) => String(p?.id) !== "1672" && p?.type !== "grouped" && !isCombo(p);

/**
 * @param products the catalogue list (/api/products)
 * @param details  the full product (with variations) by id, as /api/products/:id returns it
 */
export function merchantFeedXml(products: P[], details: Map<string, P>, now = new Date()) {
  const items: string[] = [];
  const label = (p: P) => {
    const t = productTypeLabel(p);
    return MERCHANT_FEED.gender === "male" ? t : t.replace(/ for Men$/, "");
  };
  for (const listed of products.filter(feedEligible)) {
    const p = details.get(String(listed.id)) || listed;
    if (!feedEligible(p)) continue;
    const id = String(p.id);
    const description = plain([p.shortDescription, p.description].filter(Boolean).join("\n\n")).replace(/^Story Behind The Design\s*/i, "").slice(0, 5000) || `${p.name} ${label(p)} by ${BRAND}.`;
    const parentImages: string[] = (p.images || []).map((src: string) => imgUrl(src)).filter(Boolean);
    const variations: P[] = Array.isArray(p.variations) && p.variations.length ? p.variations : [];
    // Products that only vary by size keep their one colour on the product itself.
    const onlyColour = (p.availableColors || []).length === 1 ? p.availableColors[0] : "";
    const rows = variations.length
      ? variations.map((v: P) => ({
          id: `${id}-${v.id}`,
          color: v.attributes?.color || onlyColour,
          size: v.attributes?.size || "",
          price: Number(v.price) || Number(p.price),
          inStock: v.stockStatus === "instock" && p.status !== "Coming Soon",
          images: (v.images || []).map((src: string) => imgUrl(src)).filter(Boolean) as string[],
        }))
      : [{ id, color: onlyColour, size: "", price: Number(p.price), inStock: p.status === "Available", images: [] as string[] }];
    for (const r of rows) {
      const images = [...new Set([...r.images, ...parentImages])];
      if (!images.length || !(r.price > 0)) continue; // Google rejects items without an image or a price
      const title = [`${p.name} ${label(p)}`, r.color, r.size && `Size ${r.size}`].filter(Boolean).join(" - ").slice(0, 150);
      const tags = [
        ["g:id", r.id],
        ["title", title],
        ["description", description],
        ["link", `${SITE}/product/${id}`],
        ["g:image_link", images[0]],
        ...images.slice(1, 11).map(src => ["g:additional_image_link", src]),
        ["g:price", price(r.price)],
        ["g:availability", r.inStock ? "in_stock" : "out_of_stock"],
        ["g:brand", BRAND],
        ["g:condition", "new"],
        ["g:identifier_exists", "no"],
        ["g:google_product_category", MERCHANT_FEED.googleProductCategory],
        ["g:product_type", p.category || ""],
        ["g:item_group_id", id],
        ["g:gender", MERCHANT_FEED.gender],
        ["g:age_group", MERCHANT_FEED.ageGroup],
        ["g:color", r.color],
        ["g:size", r.size],
        ["g:size_system", r.size ? MERCHANT_FEED.sizeSystem : ""],
      ].filter(([, v]) => String(v || "").trim());
      items.push(`<item>\n${tags.map(([k, v]) => `  <${k}>${xmlText(v)}</${k}>`).join("\n")}\n</item>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${xmlText(BRAND)}</title>
<link>${SITE}</link>
<description>${xmlText(`${BRAND} products`)}</description>
<lastBuildDate>${now.toUTCString()}</lastBuildDate>
${items.join("\n")}
</channel>
</rss>
`;
}
