// The Journal: articles written to be found by Google (SEO), quoted by answer boxes (AEO) and cited
// by AI assistants such as ChatGPT, Perplexity and Claude (GEO).
//
// Why server-rendered: the shop itself is drawn in the browser, so a crawler that does not run
// JavaScript sees almost nothing. Every page here is complete HTML with its text, headings,
// questions and structured data in the first response.
//
// Add an article: add an entry to ARTICLES below. It appears at /journal/<slug>, in /journal,
// in sitemap.xml and in llms.txt on the next start. Keep facts true to the store: the product
// lines are pulled from the live catalogue, everything else is checked against the site's own
// shipping, returns and product pages.
import type { Express, Request, Response } from "express";

export const SITE = "https://chilsandco.com";
export const BRAND = "CHILS & CO.";

type Block = { h2: string; p?: string[]; ul?: string[]; products?: "oversized" | "regular" | "polo" | "any" };
export type Article = {
  slug: string;
  title: string;
  /** Meta description, also used as the card summary. About 150 characters. */
  description: string;
  published: string;
  updated: string;
  /** The direct answer, shown first. This is the passage search and AI answers lift. */
  answer: string;
  keywords: string[];
  sections: Block[];
  faq: { q: string; a: string }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "oversized-vs-boxy-vs-drop-shoulder-tshirt",
    title: "Oversized, boxy or drop shoulder: what's the difference?",
    description:
      "Oversized, boxy fit and drop shoulder t-shirts get mixed up all the time. Here is what each one means, how it fits, and which suits you.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer:
      "A drop shoulder t-shirt has the shoulder seam sitting below your natural shoulder, on the top of the arm. An oversized t-shirt is simply cut larger than your body all round. A boxy fit is cut straight, with the same width at the chest and the hem, and usually a shorter length. Many modern tees combine all three.",
    keywords: ["oversized drop shoulder t-shirt", "boxy fit t-shirt", "men's oversized t-shirt", "oversized t-shirt"],
    sections: [
      {
        h2: "Drop shoulder: where the seam sits",
        p: [
          "On a regular tee the shoulder seam sits at the edge of your shoulder bone. On a drop shoulder tee the seam sits lower, down on the upper arm. That lowered seam is what gives the relaxed, slightly slouched look, and it makes the sleeve start further down your arm.",
          "It is a construction detail, not a size. You can have a drop shoulder tee that is cut close, or a very large one.",
        ],
      },
      {
        h2: "Oversized: a larger cut all round",
        p: [
          "Oversized means the tee is cut bigger than your body in the chest, the body length and often the sleeve. It is the word most people search for, and it is usually a drop shoulder tee that is also roomy.",
          "Fabric matters more on an oversized tee than on a fitted one. A thin fabric in a big cut hangs limp and clings in the wrong places. A heavier cotton holds the shape and falls cleanly.",
        ],
      },
      {
        h2: "Boxy fit: straight sides, shorter body",
        p: [
          "A boxy tee is cut straight from the chest down. It does not taper at the waist, so the chest and the hem are about the same width, and the length usually stops higher than a standard tee.",
          "Boxy and oversized overlap, but they are not the same. A tee can be boxy without being large, and large without being boxy.",
        ],
      },
      {
        h2: "Which one should you pick?",
        ul: [
          "If you want a relaxed, easy look and rarely tuck anything in: drop shoulder or oversized.",
          "If you like a clean, structured shape that sits well with trousers and layers: boxy.",
          "If you are between sizes, read the size guide on the product page. Fit varies by brand, so go by the measurements, not only the letter.",
          "If you have never worn this cut, start with your usual size and check how it hangs before going bigger.",
        ],
      },
      {
        h2: "Our drop shoulder and oversized tees",
        p: [
          `${BRAND} makes its oversized tees as drop shoulder cuts in 100% cotton at 240 GSM, a heavyweight fabric that keeps the shape. Here is the current range.`,
        ],
        products: "oversized",
      },
    ],
    faq: [
      {
        q: "Is a drop shoulder tee the same as an oversized tee?",
        a: "No. Drop shoulder describes where the shoulder seam sits, lower than your natural shoulder. Oversized describes a larger overall cut. Many tees are both, which is why the terms get mixed up.",
      },
      {
        q: "What is a boxy fit t-shirt?",
        a: "A boxy tee has straight sides, so the chest and the hem are about the same width, and it is usually cut shorter than a standard tee.",
      },
      {
        q: "Should I size up or stay in my usual size for an oversized tee?",
        a: "Stay in your usual size first. An oversized tee is already cut larger, and going up a size can make the shoulders and sleeves too big. Check the size guide on the product page for the measurements.",
      },
      {
        q: "What fabric works best for an oversized t-shirt?",
        a: "A heavier cotton, around 220 to 240 GSM, holds the shape better than a thin one. Thin fabric in a large cut tends to hang limp.",
      },
    ],
  },
  {
    slug: "how-to-choose-an-oversized-graphic-tshirt-india",
    title: "How to choose oversized graphic tees for men in India: a buying guide",
    description:
      "GSM, cotton, pre-shrunk fabric, print method and stitching: the checks that decide whether oversized graphic tees for men last or fall apart.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer:
      "For an oversized graphic t-shirt that lasts, look for 100% cotton at about 240 GSM, a pre-shrunk fabric, reinforced stitching at the neck and shoulders, and a fade-resistant print such as DTF. Check that the seller states these on the product page. If they are missing, assume the fabric is thin.",
    keywords: ["oversized graphic tees", "graphic tees for men", "oversized graphic t-shirt", "men's oversized t-shirt", "heavyweight cotton t-shirt"],
    sections: [
      {
        h2: "1. GSM: the weight of the fabric",
        p: [
          "GSM means grams per square metre. It tells you how heavy the fabric is. Around 160 to 180 GSM is light and suits regular fits. Around 220 to 240 GSM is heavyweight, and it is what an oversized cut needs to hang well.",
          "If a listing does not state the GSM, ask. Sellers who use good fabric usually say so.",
        ],
      },
      {
        h2: "2. Fabric: cotton or blend",
        p: [
          "100% cotton is soft, breathable and handles the Indian climate well. Polycotton blends are lighter and resist wrinkles, and some regular-fit tees use them. For an oversized tee worn daily, cotton is the usual choice.",
        ],
      },
      {
        h2: "3. Pre-shrunk and washed finishes",
        p: [
          "Cotton shrinks the first time it is washed unless it has been treated. A pre-shrunk fabric keeps its size, so the fit you ordered is the fit you keep. Finishes such as bio-wash or a sun-faded wash also make the fabric softer from the first wear.",
        ],
      },
      {
        h2: "4. The print: will it fade?",
        p: [
          "Two methods are common. Screen printing is durable and suits large runs. DTF (direct to film) prints high-definition artwork with fine detail and, done well, resists fading in the wash.",
          "Whatever the method, turn the tee inside out when you wash it, and avoid a hot dryer. That adds years to any print.",
        ],
      },
      {
        h2: "5. Stitching at the neck and shoulders",
        p: [
          "The neck and shoulders take the most strain. A ribbed neck that springs back, and reinforced stitching at the shoulder seams, are what stop a tee from stretching out and sagging after a few months.",
        ],
      },
      {
        h2: "6. What to check before you pay",
        ul: [
          "Is the GSM, fabric and fit stated on the page?",
          "Is there a size guide with measurements?",
          "What is the return window, and who pays?",
          "Is the delivery cost clear before checkout?",
        ],
      },
      {
        h2: "Heavyweight oversized graphic tees from CHILS & CO.",
        p: [
          "Our oversized tees are 100% cotton at 240 GSM, and we build them with reinforced neck and shoulder stitching and fade-resistant DTF artwork, as set out on our Our promise page. Prices start at ₹419. Here is the current range.",
        ],
        products: "oversized",
      },
    ],
    faq: [
      {
        q: "What GSM is best for an oversized t-shirt?",
        a: "About 220 to 240 GSM. The extra weight helps an oversized cut hang cleanly instead of clinging or drooping.",
      },
      {
        q: "Is 240 GSM too heavy for Indian summers?",
        a: "Heavyweight cotton is thicker, but 100% cotton still breathes. Many people wear it year-round in India. If you want something lighter, a 180 GSM regular fit is the cooler choice.",
      },
      {
        q: "Does a graphic print crack or fade in the wash?",
        a: "A good DTF print resists fading. To make any print last, wash the tee inside out in cold or warm water and avoid a hot dryer.",
      },
      {
        q: "What does pre-shrunk mean?",
        a: "The fabric has been treated so it does not shrink noticeably in the first wash, so the size you ordered stays the size you wear.",
      },
    ],
  },
  {
    slug: "how-to-choose-a-streetwear-brand-in-india",
    title: "Indian streetwear: 7 things to check before you buy from any brand",
    description:
      "Looking for Indian streetwear brands? Here are seven checks on fabric, fit, returns and delivery that tell you which ones are worth your money.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer:
      "Before buying from any Indian streetwear brand, check that it states fabric weight and material, shows measurements, has a clear return window, shows delivery cost before checkout, uses real product photos, ships across India with tracking, and answers messages. A brand that is open on these is usually open about quality too.",
    keywords: ["streetwear brands in india", "indian streetwear brands", "best streetwear brands in india"],
    sections: [
      {
        h2: "1. Does it state the fabric and weight?",
        p: ["Streetwear lives on the fabric. Look for the material (100% cotton or a blend) and the GSM. If neither is listed, you cannot judge the quality before you pay."],
      },
      {
        h2: "2. Is there a real size guide?",
        p: ["Oversized and boxy cuts vary a lot between brands. A size guide with measurements in centimetres or inches matters more than the letter on the tag."],
      },
      {
        h2: "3. Is the return policy plain?",
        p: ["Look for a stated window, what is accepted, and how the refund is paid. A clear policy before purchase means fewer surprises after."],
      },
      {
        h2: "4. Is the delivery cost shown before checkout?",
        p: ["You should see the exact delivery charge and the expected time before you pay, not after you have entered your address."],
      },
      {
        h2: "5. Are the photos of the real product?",
        p: ["Real photos, on a real body, in more than one angle. Heavily edited images can hide how the fabric hangs."],
      },
      {
        h2: "6. Does it deliver across India, with tracking?",
        p: ["A tracked shipment by SMS or email tells you the brand is organised, and lets you plan around delivery."],
      },
      {
        h2: "7. Does anyone answer?",
        p: ["Send a question before you buy. How a brand answers a pre-sale message shows how it will treat you after the sale."],
      },
      {
        h2: "How CHILS & CO. measures up",
        ul: [
          "Fabric: our oversized tees are 100% cotton at 240 GSM, stated on every product page.",
          "Delivery: across India from ₹80, packed within 24 to 48 hours and delivered in 2 to 7 business days, tracked by SMS and email. Store pickup is free.",
          "Returns: within 7 days of delivery for a refund, exchange or store credit. Refunds reach your PhonePe or original payment method in 3 to 7 business days.",
          "Packaging: reusable Second Life packaging and plastic-free shipping.",
          "Where: designed by techies in Hyderabad.",
        ],
        products: "any",
      },
    ],
    faq: [
      {
        q: "How do I know if a streetwear brand uses good fabric?",
        a: "Check that it states the material and the GSM. For an oversized tee, 100% cotton at around 240 GSM is a heavyweight standard.",
      },
      {
        q: "Are Indian streetwear brands worth buying from?",
        a: "Many are. Judge each one by what it states openly: fabric weight, size measurements, return window and delivery cost, rather than by its marketing.",
      },
      {
        q: "What should the return policy of a streetwear brand include?",
        a: "A stated return window, what can be returned, how pickup works and how the refund is paid. CHILS & CO. accepts returns within 7 days of delivery.",
      },
    ],
  },
  {
    slug: "gifts-for-software-engineers-india",
    title: "Gifts for software engineers that are not a coffee mug",
    description:
      "Ideas for a software engineer, developer or techie friend that they will actually wear. Heavyweight tees, delivered across India from ₹80.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer:
      "The best gift for a software engineer is something they use every day and that does not shout. A heavyweight cotton tee with a quiet, clever design beats another mug or lanyard. Pick their size from a tee they already own, choose a design that matches their work, and order early, since delivery in India takes 2 to 7 business days.",
    keywords: ["gift for software engineer", "gifts for developers", "tech t-shirt gift India"],
    sections: [
      {
        h2: "Why a tee works as a gift",
        p: [
          "Engineers tend to own enough gadgets and desk toys. A tee is practical, it gets worn weekly, and the right design makes a small joke only a fellow engineer understands.",
        ],
      },
      {
        h2: "How to choose one",
        ul: [
          "Match the work. A VLSI or semiconductor design for a chip engineer, a developer design for someone who writes code.",
          "Pick the fit from what they wear. If they live in loose tees, choose an oversized drop shoulder. If they prefer a neater look, choose a regular fit.",
          "Get the size from a tee they already own. Measure it flat across the chest and compare with the size guide.",
          "Prefer fabric over novelty. 100% cotton at 240 GSM feels better and lasts longer than a thin printed tee.",
        ],
      },
      {
        h2: "Timing and delivery",
        p: [
          `${BRAND} delivers across India from ₹80. Orders are packed within 24 to 48 hours and delivered in 2 to 7 business days, with SMS and email tracking. If the size is wrong, returns are accepted within 7 days of delivery.`,
        ],
      },
      {
        h2: "Tees for the techie in your life",
        p: ["Designed by techies in Hyderabad. Here is the current range."],
        products: "any",
      },
    ],
    faq: [
      {
        q: "What is a good gift for a software engineer in India?",
        a: "A heavyweight cotton tee with a design from their field is a practical choice. It is worn often and does not add desk clutter.",
      },
      {
        q: "How long does delivery take for a gift order?",
        a: "Orders are packed within 24 to 48 hours and delivered across India in 2 to 7 business days. Order a week ahead for a dated occasion.",
      },
      {
        q: "What if the size is wrong?",
        a: "Returns are accepted within 7 days of delivery, for a refund, an exchange or store credit. The tee must be unworn and unwashed, with its tags on.",
      },
    ],
  },
  {
    slug: "240-gsm-vs-180-gsm-tshirt-which-to-buy",
    title: "240 GSM vs 180 GSM t-shirts: which should you buy?",
    description: "What GSM means on a t-shirt, how 180 and 240 GSM differ in feel, drape and durability, and which suits oversized, regular and summer wear.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "GSM is grams per square metre, a measure of fabric weight. A 180 GSM tee is lighter, cooler and drapes softly, which suits regular fits and hot weather. A 240 GSM tee is heavyweight: it holds its shape, feels substantial and suits oversized cuts. Neither is better. Pick by fit and climate.",
    keywords: ["240 gsm t-shirt", "heavyweight cotton t-shirt", "180 gsm t-shirt", "gsm meaning t-shirt"],
    sections: [
      {
        h2: "What GSM means",
        p: ["GSM stands for grams per square metre. It is the weight of one square metre of the fabric, so a higher number means thicker, heavier cloth. It is the quickest way to compare two tees without touching them."],
      },
      {
        h2: "180 GSM: light and easy",
        ul: [
          "Feels light and breathable, and dries quickly.",
          "Drapes softly and follows the body, which suits a regular fit.",
          "A good choice for hot, humid weather and for layering under a shirt.",
          "Can look thin in a very large cut.",
        ],
      },
      {
        h2: "240 GSM: heavyweight",
        ul: [
          "Feels thick and substantial, with a firmer hand.",
          "Holds its shape, so an oversized or drop shoulder cut hangs cleanly instead of clinging.",
          "Tends to keep its form wash after wash, especially in 100% cotton.",
          "Warmer than a light tee, though 100% cotton still breathes.",
        ],
      },
      {
        h2: "Which should you pick?",
        ul: [
          "Oversized or drop shoulder: 240 GSM, for structure.",
          "Regular fit, or a very hot day: 180 GSM, for comfort.",
          "A polo: a heavier knit looks neater and keeps the collar standing.",
          "If a listing does not state the GSM, ask. Sellers who use good fabric usually say so.",
        ],
      },
      {
        h2: "How we use both",
        p: [`${BRAND} uses 100% cotton at 240 GSM for every oversized tee. Our regular fit and minimal tees range from 180 to 240 GSM depending on the design. The product page lists the fabric and weight.`],
        products: "oversized",
      },
    ],
    faq: [
      { q: "What does GSM mean on a t-shirt?", a: "Grams per square metre. It is the weight of the fabric, so a higher GSM means thicker, heavier cloth." },
      { q: "Is 240 GSM too hot for Indian weather?", a: "It is warmer than a light tee, but 100% cotton breathes well, and many people wear it year-round. For the hottest months a 180 GSM tee is cooler." },
      { q: "Is a higher GSM always better?", a: "No. It is better for structure and an oversized cut. A lower GSM is better for a light, cool, regular fit." },
      { q: "What GSM is a heavyweight t-shirt?", a: "Usually 220 GSM and above. Our oversized tees are 240 GSM." },
    ],
  },
  {
    slug: "how-to-style-an-oversized-tshirt-men",
    title: "How to style an oversized t-shirt: 6 ideas for men",
    description: "Six simple ways to wear an oversized t-shirt: trousers, jeans, shorts, layers, shoes and what to avoid, so the loose cut looks intentional.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "To style an oversized t-shirt, balance the loose top with a cleaner bottom: straight or tapered trousers, or well-fitted jeans. Keep the shoulder seam near your upper arm, let the hem sit around mid-hip, choose a heavier fabric so it drapes cleanly, and add one layer or a simple pair of shoes to finish the look.",
    keywords: ["how to style oversized t-shirt", "oversized t-shirt outfit men", "men's oversized t-shirt"],
    sections: [
      { h2: "1. Pair it with straight or tapered trousers", p: ["A loose top works best against a cleaner leg. Straight or tapered trousers in a dark or neutral colour keep the outfit sharp rather than shapeless."] },
      { h2: "2. Well-fitted jeans", p: ["Regular or straight jeans that fit at the waist and thigh balance the volume on top. If both the top and the jeans are very loose, the shape can get lost."] },
      { h2: "3. Shorts for summer", p: ["An oversized tee with shorts that end at or just above the knee is an easy hot-weather outfit. Keep the shorts a little shorter than the tee."] },
      { h2: "4. Layer it", p: ["An open overshirt or a light jacket over an oversized tee adds structure. Heavier cotton holds up under a layer without bunching."] },
      { h2: "5. Finish with simple shoes", p: ["Clean sneakers or minimal shoes keep attention on the shape. Chunky shoes also work if the trousers are tapered."] },
      {
        h2: "6. Get the fit right first",
        ul: [
          "The shoulder seam should sit on your upper arm, not at the base of your neck.",
          "The hem should land around mid-hip, not below the seat.",
          "Choose a heavier fabric, around 240 GSM, so the tee falls cleanly.",
          "If it feels too big, go by the measurements in the size guide, not only the letter.",
        ],
      },
      {
        h2: "Oversized tees to start with",
        p: [`${BRAND} oversized tees are 100% cotton at 240 GSM, in drop shoulder cuts, sizes S to XL.`],
        products: "oversized",
      },
    ],
    faq: [
      { q: "How should an oversized t-shirt fit?", a: "The shoulder seam sits on the upper arm, the hem lands around mid-hip, and the body is loose without swallowing you. A heavier fabric helps it drape cleanly." },
      { q: "What should I wear with an oversized t-shirt?", a: "A cleaner bottom: straight or tapered trousers, well-fitted jeans, or shorts. Simple shoes finish the look." },
      { q: "Can short men wear oversized t-shirts?", a: "Yes. Keep the hem at mid-hip rather than lower, choose tapered bottoms, and avoid fabric so large that it swallows your frame." },
    ],
  },
  {
    slug: "how-to-choose-a-polo-tshirt-for-men",
    title: "How to choose a polo t-shirt for men: fabric, fit and collar",
    description: "A buyer's guide to polo t-shirts for men: what fabric to look for, how a polo should fit, why the collar matters, and how to care for it.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "A good polo t-shirt has a structured collar that stands on its own, a knit heavy enough to hold its shape (around 220 to 240 GSM), and a fit that skims the body without clinging. Check that the fabric and weight are stated, that the collar is stitched firmly, and that the hem and sleeves sit neatly.",
    keywords: ["polo t-shirt for men", "polo t shirt", "best polo t-shirt"],
    sections: [
      {
        h2: "1. The collar",
        p: ["The collar decides whether a polo looks smart or sloppy. A structured collar stands up and keeps its shape after washing. A floppy one curls within weeks. Look for a firm, well-stitched collar with a clean finish."],
      },
      {
        h2: "2. The fabric and its weight",
        ul: [
          "Heavier knits, around 220 to 240 GSM, drape cleanly and resist clinging.",
          "Cotton is soft and breathable. A blend adds shape and wrinkle resistance.",
          "Some polos pair cotton on the inside with polyester on the outside, for softness against the skin and a longer-lasting finish.",
        ],
      },
      {
        h2: "3. The fit",
        p: ["A polo should skim the body. The shoulder seam sits on the edge of your shoulder, the sleeves end mid-bicep, and the hem falls around the belt line. A relaxed fit gives more room and suits warm weather."],
      },
      {
        h2: "4. Branding and print",
        p: ["Small, clean branding looks better on a polo than a large graphic. Check that the embroidery or print is crisp and will not crack in the wash."],
      },
      {
        h2: "5. Care",
        ul: ["Wash cold or warm, inside out.", "Dry in shade where you can, to protect the collar and the colour.", "Fold rather than hang for long periods, so the shoulders do not stretch."],
      },
      {
        h2: "Our TwinTex polos",
        p: [`${BRAND} TwinTex polos have a structured collar and a relaxed fit, in a 240 GSM heavyweight knit with cotton on the inside and polyester on the outside.`],
        products: "polo",
      },
    ],
    faq: [
      { q: "What is a good GSM for a polo t-shirt?", a: "Around 220 to 240 GSM gives a structured look that drapes well. Lighter knits are cooler but can cling." },
      { q: "How should a polo fit?", a: "It should skim the body: shoulder seams on the edge of your shoulders, sleeves ending mid-bicep and the hem near the belt line. A relaxed fit allows more room." },
      { q: "What is TwinTex?", a: "Our polo fabric, a 240 GSM heavyweight knit with cotton on the inside and polyester on the outside." },
    ],
  },
  {
    slug: "how-to-wash-a-graphic-tshirt-so-the-print-lasts",
    title: "How to wash a graphic t-shirt so the print lasts",
    description: "Simple washing and drying rules that keep a printed t-shirt from cracking or fading: inside out, cold water, mild detergent and shade drying.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "To keep a graphic t-shirt's print from fading or cracking, turn it inside out, wash in cold or warm water on a gentle cycle with mild detergent, avoid bleach and fabric softener, and dry it in the shade instead of a hot dryer. Do not iron directly on the print.",
    keywords: ["how to wash graphic t-shirt", "how to stop print fading", "t-shirt care"],
    sections: [
      {
        h2: "1. Turn it inside out",
        p: ["This protects the print from rubbing against other clothes and the drum. It is the single biggest thing you can do."],
      },
      {
        h2: "2. Use cold or warm water",
        p: ["Hot water relaxes the print and the fibres and speeds fading. Cold or warm water on a gentle cycle is enough for everyday wear."],
      },
      {
        h2: "3. Use mild detergent",
        ul: ["Skip bleach, which strips colour and weakens the print.", "Skip fabric softener, which can coat the print and dull it.", "Do not leave the tee soaking for hours."],
      },
      {
        h2: "4. Dry it in the shade",
        p: ["Direct sun fades colour, and a hot tumble dryer can crack a print. Dry in the shade, or on a low heat setting if you must use a dryer."],
      },
      {
        h2: "5. Ironing",
        p: ["If you iron, turn the tee inside out and use a low to medium setting. Never iron directly on the print."],
      },
      {
        h2: "6. Wash it less often",
        p: ["A tee does not need washing after every wear. Air it out between wears and wash when it needs it. Fewer washes mean a longer-lasting print and fabric."],
      },
      {
        h2: "Prints built to last",
        p: [`${BRAND} prints with DTF artwork designed to resist fading, on heavyweight cotton. Care instructions are on the product pages.`],
        products: "any",
      },
    ],
    faq: [
      { q: "Should I wash a printed t-shirt inside out?", a: "Yes. Washing it inside out protects the print from friction and is the most effective way to stop it fading or cracking." },
      { q: "Can I put a graphic t-shirt in the dryer?", a: "It is better not to. Heat can crack a print and shrink cotton. Dry it in the shade, or use a low heat setting." },
      { q: "Does fabric softener damage a print?", a: "It can coat the print and dull it over time, so it is best avoided on printed tees." },
    ],
  },
  {
    slug: "secret-santa-gift-ideas-for-coworkers-india",
    title: "Secret Santa gift ideas for coworkers in India (under ₹500)",
    description: "Secret Santa gift ideas for coworkers that are useful, safe and under ₹500: what to buy, what to avoid, and how to choose when you barely know them.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "The best Secret Santa gifts for coworkers are useful, friendly and not too personal: a good notebook, a desk plant, a quality mug, snacks, or a comfortable cotton t-shirt. Stay within the budget, avoid anything intimate or size-sensitive unless you know the person, and order about a week before the exchange so delivery in India does not cut it close.",
    keywords: ["secret santa ideas", "secret santa gift ideas", "secret santa gifts for coworkers", "secret santa gifts under 500"],
    sections: [
      {
        h2: "What makes a good Secret Santa gift",
        ul: [
          "Useful: something they will actually use at work or at home.",
          "Friendly: a light joke is fine, but never something that could embarrass them.",
          "Within the budget: do not overspend, since it makes others uncomfortable.",
          "Not too personal: skip perfume, jewellery and clothing in a very specific size unless you know them well.",
        ],
      },
      {
        h2: "Ideas that usually work for coworkers",
        ul: [
          "A good notebook and pen for people who take meeting notes.",
          "A desk plant or a small succulent.",
          "A quality mug or an insulated bottle.",
          "A snack box of sweets, nuts or tea.",
          "A comfortable cotton t-shirt, especially a loose, oversized cut that suits most body types.",
        ],
      },
      {
        h2: "Gifting a t-shirt to someone you barely know",
        ul: [
          "Choose an oversized fit. It is more forgiving than a fitted cut.",
          "Go with a common size for the person, and check the size guide on the product page.",
          "Pick a design that fits the team, such as a friendly design from the worlds of code or engineering for a tech team.",
        ],
      },
      {
        h2: "Timing in India",
        p: ["Order about a week before the exchange. Courier times of 2 to 7 business days are normal, and the festive season can slow them down."],
      },
      {
        h2: "Under ₹500 from CHILS & CO.",
        p: [`${BRAND} has several tees at ₹499 or less, in cotton and cotton-blend fabrics, delivered across India from ₹80.`],
        products: "any",
      },
    ],
    faq: [
      { q: "What is a good Secret Santa gift for a coworker?", a: "Something useful, friendly and not too personal, such as a notebook, a desk plant, a mug, snacks or a comfortable tee." },
      { q: "How much should I spend on Secret Santa?", a: "Stay within the budget your group agreed on, and do not go over it, since overspending makes others uncomfortable." },
      { q: "What should I avoid in Secret Santa?", a: "Avoid anything too personal, anything that could embarrass the person, and clothing in a size you cannot be sure of." },
      { q: "How early should I order a Secret Santa gift?", a: "About a week before the exchange. Delivery in India usually takes 2 to 7 business days." },
    ],
  },
  {
    slug: "corporate-gift-ideas-for-employees-india",
    title: "Corporate gift ideas for employees in India: a year-end guide",
    description: "Corporate gift ideas for employees and clients in India: what works for tech teams, how to pick a budget, how to order in bulk, and timing for year-end and New Year gifting.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "Good corporate gifts for employees are useful, easy to size or choose, and feel considered, not generic. For tech and engineering teams, a heavyweight cotton t-shirt, a polo, a quality notebook, or a desk accessory all work. Fix a budget per person, order early, confirm sizes, and plan for delivery of 2 to 7 business days across India.",
    keywords: ["corporate gifts for employees", "corporate gift ideas", "corporate gifting ideas", "corporate gifting for new year"],
    sections: [
      {
        h2: "What makes a corporate gift work",
        ul: [
          "It is useful, so it is used and remembered.",
          "It suits everyone: a gift that is size-friendly and neutral in taste.",
          "It feels considered, not like a bulk giveaway.",
          "It arrives on time and in good condition.",
        ],
      },
      {
        h2: "Ideas that suit tech and engineering teams",
        ul: [
          "A heavyweight cotton t-shirt or polo that people will wear.",
          "A quality notebook and pen.",
          "A desk accessory such as a cable organiser or a desk mat.",
          "A reusable bottle or insulated mug.",
        ],
      },
      {
        h2: "Setting a budget",
        p: ["Decide a fixed amount per person first. Add delivery, and keep a small buffer for sizes and replacements. A premium tee or polo sits in a comfortable range for many year-end budgets."],
      },
      {
        h2: "Ordering for a team",
        ul: [
          "Collect sizes early, and ask people to confirm them.",
          "Choose a cut that is forgiving. An oversized fit suits more body types.",
          "Ask the supplier about quantities, lead time and whether they can accommodate a larger order before you commit.",
          "Plan for delivery of 2 to 7 business days, and order earlier for a fixed date.",
        ],
      },
      {
        h2: "Gifting with CHILS & CO.",
        p: [
          `${BRAND} makes heavyweight oversized tees in 100% cotton at 240 GSM and TwinTex polos, designed in Hyderabad. For a team order, message us on WhatsApp at +91 78420 70404 or email hello.chilsandco@gmail.com with the number of pieces, sizes and the date you need them, and we will reply with what we can do.`,
        ],
        products: "any",
      },
    ],
    faq: [
      { q: "What are good corporate gifts for employees?", a: "Something useful and easy to choose for everyone, such as a quality t-shirt or polo, a notebook, a reusable bottle or a desk accessory." },
      { q: "What are good corporate gifts for a tech team?", a: "Wearable and practical gifts such as a heavyweight cotton tee or polo suit tech teams well, along with notebooks and desk accessories." },
      { q: "How early should I order corporate gifts for year-end?", a: "As early as you can, ideally a few weeks before the date. Delivery in India takes 2 to 7 business days, and large orders depend on stock." },
      { q: "How do I handle sizes for a team order?", a: "Collect and confirm sizes early. A loose, oversized cut is more forgiving across different body types." },
    ],
  },
  {
    slug: "christmas-gift-ideas-for-men-engineers-developers",
    title: "Christmas gift ideas for men: engineers, developers and techies",
    description: "Christmas gift ideas for men who work in tech: wearable, practical and thoughtful gifts for engineers and developers, with budgets and delivery timing for India.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "The best Christmas gifts for men who work in tech are practical and personal at the same time: a heavyweight cotton t-shirt with a design from his field, a quality notebook, a desk accessory, or a good bottle or mug. Pick something he will use daily, get the size from a tee he already owns, and order early since delivery in India takes 2 to 7 business days.",
    keywords: ["christmas gift ideas for men", "christmas presents for men", "christmas gifts for engineers", "gifts for developers"],
    sections: [
      {
        h2: "Gifts he will actually use",
        ul: [
          "A heavyweight cotton t-shirt with a design from his field.",
          "A quality notebook and pen for meetings and ideas.",
          "A desk accessory that tidies his workspace.",
          "A reusable bottle or insulated mug.",
        ],
      },
      {
        h2: "Why a t-shirt works",
        p: ["A tee is practical, he will wear it weekly, and a design from his work, such as chips, code or engineering, shows you paid attention. Choose heavyweight cotton, since it feels like a real gift and lasts."],
      },
      {
        h2: "Getting the size right",
        ul: [
          "Check a tee he already owns and likes.",
          "Measure it flat across the chest and compare with the size guide.",
          "If he likes loose, relaxed clothes, an oversized cut in his usual size is forgiving.",
        ],
      },
      {
        h2: "Timing",
        p: ["Delivery in India takes 2 to 7 business days, and the festive season can be slower. Order early. At CHILS & CO., returns and exchanges are accepted within 7 days of delivery for an unworn, unwashed tee with its tags on."],
      },
      {
        h2: "Christmas gifts from CHILS & CO.",
        p: [`${BRAND} is designed by techies in Hyderabad. Tees start at ₹349, polos are ₹599, and three-tee stacks save 10% on the set.`],
        products: "any",
      },
    ],
    faq: [
      { q: "What is a good Christmas gift for an engineer?", a: "Something practical with a personal touch, such as a heavyweight cotton tee with a design from his field, a notebook or a desk accessory." },
      { q: "What is a good Christmas gift for a developer?", a: "A comfortable t-shirt with a developer design, a quality notebook, or a good desk setup accessory." },
      { q: "How do I choose a size when gifting a t-shirt?", a: "Measure a tee he already owns flat across the chest and compare with the size guide. An oversized cut is more forgiving." },
      { q: "How much should I spend on a Christmas gift for a man?", a: "Set a budget first. A premium tee or polo is a comfortable choice in the few-hundred-rupee range." },
    ],
  },
  {
    slug: "how-to-choose-a-tshirt-size-when-gifting",
    title: "How to choose a t-shirt size when you are buying a gift",
    description: "How to pick the right t-shirt size for someone else: measure a tee they own, use the size guide, choose a forgiving fit, and know your exchange options.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer:
      "To pick a t-shirt size for a gift, measure a tee the person already owns and likes: lay it flat and measure across the chest, then compare with the brand's size guide. If you cannot, choose their usual size in an oversized or relaxed cut, which is more forgiving than a fitted one, and check the exchange policy before you buy.",
    keywords: ["how to choose t-shirt size gift", "t-shirt size for gift", "gift t-shirt size guide"],
    sections: [
      {
        h2: "The most reliable method: measure a tee they own",
        ul: [
          "Pick a tee they wear often and that fits them well.",
          "Lay it flat and smooth it out.",
          "Measure straight across the chest, from armpit to armpit, and note the number.",
          "Measure from the top of the shoulder to the hem for the length.",
          "Compare both numbers with the size guide on the product page.",
        ],
      },
      {
        h2: "If you cannot measure",
        ul: [
          "Ask a friend or family member who knows their size.",
          "Pick their usual size in an oversized cut, since it is more forgiving.",
          "Avoid fitted cuts when you are guessing.",
        ],
      },
      {
        h2: "Why an oversized cut is safer for gifts",
        p: ["An oversized tee is cut larger on purpose, so a small difference in size is less noticeable. It suits more body types and hangs well in a heavier fabric."],
      },
      {
        h2: "Check the exchange policy",
        p: [`Before you buy, check that the brand accepts exchanges. At ${BRAND}, returns, exchanges and store credit are accepted within 7 days of delivery, as long as the tee is unworn and unwashed with its tags on.`],
        products: "oversized",
      },
    ],
    faq: [
      { q: "How do I choose a t-shirt size for someone else?", a: "Measure a tee they already own flat across the chest and compare it with the size guide. If you cannot, pick their usual size in an oversized cut." },
      { q: "What is the safest t-shirt fit to gift?", a: "An oversized or relaxed cut. It is more forgiving than a fitted one if you are not sure of the exact size." },
      { q: "Can the recipient exchange a gifted t-shirt?", a: "At CHILS & CO., returns and exchanges are accepted within 7 days of delivery for an unworn, unwashed tee with its tags on." },
    ],
  },
];

// ------------------------------------------------------------------ rendering

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export const inr = (n: unknown) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const longDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const CSS = `
:root{--ink:#141311;--paper:#f4f2ee;--bone:#e7e3dc;--stone:#716c64;--brass:#9c8152}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:17px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
a{color:inherit}
header,footer{padding:18px 20px;display:flex;gap:18px;align-items:center;justify-content:space-between;max-width:1040px;margin:0 auto}
.brand{font:600 15px/1 "Space Grotesk",-apple-system,sans-serif;letter-spacing:.18em;text-decoration:none}
nav a{margin-left:18px;font-size:14px;color:var(--stone);text-decoration:none}
nav a:hover{color:var(--ink)}
main{max-width:720px;margin:0 auto;padding:28px 20px 56px}
.eyebrow{font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--brass);margin:0 0 14px}
h1{font-size:clamp(30px,6vw,44px);line-height:1.12;letter-spacing:-.02em;margin:0 0 14px}
h2{font-size:24px;line-height:1.25;margin:40px 0 10px;letter-spacing:-.01em}
.meta{color:var(--stone);font-size:14px;margin:0 0 26px}
.answer{background:var(--paper);border-radius:16px;padding:20px 22px;margin:0 0 8px;font-size:18px}
.answer b{display:block;font:11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--brass);margin-bottom:10px}
ul{padding-left:22px}li{margin:6px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin:18px 0}
.card{text-decoration:none;display:block}
.card img{width:100%;aspect-ratio:4/5;object-fit:cover;background:var(--bone);border-radius:14px;display:block}
.card span{display:block;font-size:14px;margin-top:8px;line-height:1.3}
.card em{font-style:normal;color:var(--stone);font-size:13px}
.faq details{border-top:1px solid var(--bone);padding:14px 0}.faq details:last-child{border-bottom:1px solid var(--bone)}
.faq summary{cursor:pointer;font-weight:600}.faq p{margin:10px 0 0;color:#2a2823}
.pill{display:inline-block;background:var(--ink);color:var(--paper);text-decoration:none;padding:14px 30px;border-radius:999px;font-weight:600;font-size:15px;margin-top:8px}
.list a.row{display:block;text-decoration:none;padding:22px 0;border-top:1px solid var(--bone)}
.list a.row:last-child{border-bottom:1px solid var(--bone)}
.list h2{margin:0 0 6px;font-size:22px}.list p{margin:0;color:var(--stone)}
footer{color:var(--stone);font-size:13px;border-top:1px solid var(--bone);flex-wrap:wrap}
`;

export function page(opts: { title: string; description: string; path: string; body: string; jsonLd: object[]; type?: string; published?: string; updated?: string }) {
  const url = `${SITE}${opts.path}`;
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta property="og:site_name" content="${esc(BRAND)}">
<meta property="og:type" content="${opts.type || "website"}">
<meta property="og:title" content="${esc(opts.title)}">
<meta property="og:description" content="${esc(opts.description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
${opts.published ? `<meta property="article:published_time" content="${opts.published}">` : ""}
${opts.updated ? `<meta property="article:modified_time" content="${opts.updated}">` : ""}
<link rel="icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600&display=swap">
<style>${CSS}</style>
${opts.jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<header><a class="brand" href="/">CHILS &amp; CO.</a><nav><a href="/collection">Shop</a><a href="/journal">Journal</a><a href="/our-promise">Our promise</a><a href="/support">Support</a></nav></header>
${opts.body}
<footer><span>© ${new Date().getFullYear()} ${esc(BRAND)}. Designed by techies in Hyderabad.</span><span><a href="/shipping-delivery">Shipping</a> · <a href="/returns-refunds">Returns</a></span></footer>
</body>
</html>`;
}

export const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: SITE,
  logo: `${SITE}/apple-touch-icon.png`,
  email: "hello.chilsandco@gmail.com",
  telephone: "+91 78420 70404",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    postalCode: "500049",
    addressCountry: "IN",
  },
  areaServed: "IN",
  sameAs: [
    "https://www.instagram.com/chils_and_co/",
    "https://www.facebook.com/chilsandco",
    "https://www.youtube.com/@chils_and_co",
    "https://www.pinterest.com/chilsandco",
    "https://twitter.com/chilsandco",
    "https://www.threads.net/@chilsandco",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: "+91 78420 70404",
    email: "hello.chilsandco@gmail.com",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Telugu"],
    hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "18:00" },
  },
};

/** A product photo as a direct, cacheable address on our own domain (not the redirecting proxy). */
export function imgUrl(src: string | undefined, small = false) {
  if (!src) return "";
  const m = src.match(/wp-content\/uploads\/(.+?)(?:$|[?#])/);
  if (/^\/api\/media\?url=/.test(src) || /^https?:\/\/[^/]*chilsandco\.com\/wp-content\//.test(src)) {
    let raw = src;
    try { if (src.startsWith("/api/media")) raw = decodeURIComponent(src.split("url=")[1] || ""); } catch { /* keep as is */ }
    const mm = raw.match(/wp-content\/uploads\/(.+?)(?:$|[?#])/);
    if (mm) return `${SITE}/media/${small ? "s/" : ""}${mm[1]}`;
  }
  if (m && /^https?:/.test(src)) return `${SITE}/media/${small ? "s/" : ""}${m[1]}`;
  return src.startsWith("/") ? `${SITE}${src}` : src;
}

function productGrid(products: any[], kind: Block["products"]) {
  const visible = products.filter(p => String(p.id) !== "1672" && p.status !== "outofstock");
  const pool =
    kind === "oversized" ? visible.filter(p => /oversized|drop shoulder/i.test(`${p.category} ${(p.categories || []).join(" ")}`))
    : kind === "polo" ? visible.filter(p => /polo/i.test(String(p.name)) && p.type !== "grouped")
    : kind === "regular" ? visible.filter(p => /regular/i.test(String(p.category)))
    : visible;
  const picks = pool.filter(p => p.images?.[0]).slice(0, 6);
  if (!picks.length) return `<p><a href="/collection">See the full collection</a></p>`;
  return `<div class="grid">${picks
    .map(p => `<a class="card" href="/product/${esc(p.id)}"><img loading="lazy" width="300" height="375" src="${esc(imgUrl(p.images[0], true))}" alt="${esc(p.name)}"><span>${esc(p.name)}<br><em>${inr(p.price)}</em></span></a>`)
    .join("")}</div><p><a class="pill" href="/collection">Shop the collection</a></p>`;
}

function articleHtml(a: Article, products: any[]) {
  const body = `<main>
<article>
<p class="eyebrow">Journal</p>
<h1>${esc(a.title)}</h1>
<p class="meta">By ${esc(BRAND)} · Updated ${longDate(a.updated)}</p>
<div class="answer"><b>The short answer</b>${esc(a.answer)}</div>
${a.sections
  .map(
    s => `<section><h2>${esc(s.h2)}</h2>${(s.p || []).map(t => `<p>${esc(t)}</p>`).join("")}${s.ul ? `<ul>${s.ul.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}${s.products ? productGrid(products, s.products) : ""}</section>`
  )
  .join("\n")}
<section class="faq"><h2>Frequently asked questions</h2>
${a.faq.map(f => `<details open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
</section>
</article>
<p style="margin-top:36px"><a href="/journal">← All articles</a></p>
</main>`;
  const url = `${SITE}/journal/${a.slug}`;
  return page({
    title: `${a.title} | ${BRAND}`,
    description: a.description,
    path: `/journal/${a.slug}`,
    body,
    type: "article",
    published: a.published,
    updated: a.updated,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.description,
        datePublished: a.published,
        dateModified: a.updated,
        inLanguage: "en-IN",
        keywords: a.keywords.join(", "),
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: BRAND, url: SITE },
        publisher: { "@type": "Organization", name: BRAND, url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/apple-touch-icon.png` } },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: a.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE}/journal` },
          { "@type": "ListItem", position: 3, name: a.title, item: url },
        ],
      },
      orgLd,
    ],
  });
}

function indexHtml() {
  const body = `<main>
<p class="eyebrow">Journal</p>
<h1>Fit, fabric and what to wear</h1>
<p class="meta">Plain answers from the team at ${esc(BRAND)}, Hyderabad.</p>
<div class="list">
${ARTICLES.map(a => `<a class="row" href="/journal/${a.slug}"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p></a>`).join("\n")}
</div>
</main>`;
  return page({
    title: `Journal | ${BRAND}`,
    description: "Guides on oversized fits, heavyweight cotton, streetwear and gifts for techies, from CHILS & CO. in Hyderabad.",
    path: "/journal",
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Journal",
        url: `${SITE}/journal`,
        hasPart: ARTICLES.map(a => ({ "@type": "Article", headline: a.title, url: `${SITE}/journal/${a.slug}` })),
      },
      orgLd,
    ],
  });
}

/** Extra pages for llms.txt, filled in by seo.ts users (kept here to avoid a circular import). */
export const EXTRA_LLM_LINKS: { href: string; label: string }[] = [];

/** A plain-text map of the site for AI assistants (the llms.txt convention). */
function llmsText(products: any[]) {
  const visible = products.filter(p => String(p.id) !== "1672");
  const prices = visible.map(p => Number(p.price)).filter(n => n > 0);
  const range = prices.length ? `${inr(Math.min(...prices))} to ${inr(Math.max(...prices))}` : "";
  return `# ${BRAND}

> ${BRAND} is an Indian clothing brand from Hyderabad, designed by techies. It sells heavyweight oversized drop shoulder tees (100% cotton, 240 GSM), TwinTex polos and regular fit tees, with delivery across India.

## Key facts
- Based in Hyderabad, Telangana, India. Website: ${SITE}
- Oversized and drop shoulder tees: 100% cotton at 240 GSM. Built with reinforced neck and shoulder stitching and fade-resistant DTF artwork (see the Our promise page).
- Polo t-shirts: TwinTex fabric (cotton inside, polyester outside), 240 GSM heavyweight knit, structured collar, relaxed fit.
- Regular fit and minimal tees: 100% cotton, cotton blend or polycotton, between 180 and 240 GSM depending on the design.
- Stacks: three tees chosen to go together, banded as a numbered Trilogy; save 10%.
${range ? `- Current prices: ${range}.\n` : ""}- Delivery across India from ₹80. Packed within 24 to 48 hours, delivered in 2 to 7 business days, tracked by SMS and email. Store pickup is free.
- Returns within 7 days of delivery for a refund, exchange or store credit. Refunds reach the PhonePe or original payment method in 3 to 7 business days.
- Packaging: reusable Second Life packaging, plastic-free shipping.

## Guides
${ARTICLES.map(a => `- [${a.title}](${SITE}/journal/${a.slug}): ${a.description}`).join("\n")}

## Shop by type
${EXTRA_LLM_LINKS.map(l => `- [${l.label}](${SITE}${l.href})`).join("\n")}

## Shop and policies
- [Collection](${SITE}/collection)
- [Our promise](${SITE}/our-promise)
- [Shipping and delivery](${SITE}/shipping-delivery)
- [Returns and refunds](${SITE}/returns-refunds)
- [Support](${SITE}/support)
`;
}

export function registerJournal(app: Express, getProducts: () => any[] | null) {
  const products = () => getProducts() || [];
  const html = (res: Response, body: string) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.send(body);
  };
  app.get("/journal", (_req: Request, res: Response) => html(res, indexHtml()));
  app.get("/journal/:slug", (req: Request, res: Response) => {
    const a = ARTICLES.find(x => x.slug === req.params.slug);
    if (!a) return res.redirect(302, "/journal");
    html(res, articleHtml(a, products()));
  });
  app.get("/llms.txt", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(llmsText(products()));
  });
}
