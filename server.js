// server.ts
import express from "express";
import path3 from "path";
import https from "https";
import fs4 from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import axios3 from "axios";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto3 from "crypto";

// orderVariations.ts
var same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
var COLOR_ATTRS = ["color", "pa_color", "colors", "pa_colors", "colour", "pa_colour", "colours", "pa_colours"];
var SIZE_ATTRS = ["size", "pa_size", "sizes", "pa_sizes"];
function mapWooVariation(v) {
  const attributes = {};
  (Array.isArray(v.attributes) ? v.attributes : []).forEach((attr) => {
    const name = (attr.name || "").toLowerCase();
    if (COLOR_ATTRS.includes(name)) attributes.color = attr.option;
    if (SIZE_ATTRS.includes(name)) attributes.size = attr.option;
  });
  return { id: v.id, attributes, price: v.price, stockStatus: v.stock_status, stockQuantity: v.stock_quantity, manageStock: v.manage_stock === true };
}
var hasStock = (v) => v.manageStock ? (v.stockQuantity ?? 0) > 0 : v.stockStatus !== "outofstock";
function findVariation(variations, size, color) {
  const matches = variations.filter((v) => {
    const a = v.attributes ?? {};
    const sizeOk = size ? !!a.size && same(a.size, size) : true;
    const colorOk = color && a.color ? same(a.color, color) : true;
    return sizeOk && colorOk;
  });
  return matches.find(hasStock) ?? matches[0];
}
function trustedPrice(variation, productPrice) {
  const n = Number(variation?.price || productPrice);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function couponProblem(c, subtotal, hasSet, now = /* @__PURE__ */ new Date()) {
  if (!c) return "That code isn't valid.";
  if (hasSet) return "Codes can't be combined with sets.";
  if (c.date_expires_gmt && /* @__PURE__ */ new Date(`${c.date_expires_gmt}Z`) < now) return "That code has expired.";
  if (c.usage_limit && (c.usage_count ?? 0) >= c.usage_limit) return "That code has been fully used.";
  const min = Number(c.minimum_amount || 0);
  if (min > 0 && subtotal < min) return `This code needs an order of \u20B9${min.toLocaleString("en-IN")} or more.`;
  return null;
}

// journal.ts
var SITE = "https://chilsandco.com";
var BRAND = "CHILS & CO.";
var ARTICLES = [
  {
    slug: "oversized-vs-boxy-vs-drop-shoulder-tshirt",
    title: "Oversized, boxy or drop shoulder: what's the difference?",
    description: "Oversized, boxy fit and drop shoulder t-shirts get mixed up all the time. Here is what each one means, how it fits, and which suits you.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer: "A drop shoulder t-shirt has the shoulder seam sitting below your natural shoulder, on the top of the arm. An oversized t-shirt is simply cut larger than your body all round. A boxy fit is cut straight, with the same width at the chest and the hem, and usually a shorter length. Many modern tees combine all three.",
    keywords: ["oversized drop shoulder t-shirt", "boxy fit t-shirt", "men's oversized t-shirt", "oversized t-shirt"],
    sections: [
      {
        h2: "Drop shoulder: where the seam sits",
        p: [
          "On a regular tee the shoulder seam sits at the edge of your shoulder bone. On a drop shoulder tee the seam sits lower, down on the upper arm. That lowered seam is what gives the relaxed, slightly slouched look, and it makes the sleeve start further down your arm.",
          "It is a construction detail, not a size. You can have a drop shoulder tee that is cut close, or a very large one."
        ]
      },
      {
        h2: "Oversized: a larger cut all round",
        p: [
          "Oversized means the tee is cut bigger than your body in the chest, the body length and often the sleeve. It is the word most people search for, and it is usually a drop shoulder tee that is also roomy.",
          "Fabric matters more on an oversized tee than on a fitted one. A thin fabric in a big cut hangs limp and clings in the wrong places. A heavier cotton holds the shape and falls cleanly."
        ]
      },
      {
        h2: "Boxy fit: straight sides, shorter body",
        p: [
          "A boxy tee is cut straight from the chest down. It does not taper at the waist, so the chest and the hem are about the same width, and the length usually stops higher than a standard tee.",
          "Boxy and oversized overlap, but they are not the same. A tee can be boxy without being large, and large without being boxy."
        ]
      },
      {
        h2: "Which one should you pick?",
        ul: [
          "If you want a relaxed, easy look and rarely tuck anything in: drop shoulder or oversized.",
          "If you like a clean, structured shape that sits well with trousers and layers: boxy.",
          "If you are between sizes, read the size guide on the product page. Fit varies by brand, so go by the measurements, not only the letter.",
          "If you have never worn this cut, start with your usual size and check how it hangs before going bigger."
        ]
      },
      {
        h2: "Our drop shoulder and oversized tees",
        p: [
          `${BRAND} makes its oversized tees as drop shoulder cuts in 100% cotton at 240 GSM, a heavyweight fabric that keeps the shape. Here is the current range.`
        ],
        products: "oversized"
      }
    ],
    faq: [
      {
        q: "Is a drop shoulder tee the same as an oversized tee?",
        a: "No. Drop shoulder describes where the shoulder seam sits, lower than your natural shoulder. Oversized describes a larger overall cut. Many tees are both, which is why the terms get mixed up."
      },
      {
        q: "What is a boxy fit t-shirt?",
        a: "A boxy tee has straight sides, so the chest and the hem are about the same width, and it is usually cut shorter than a standard tee."
      },
      {
        q: "Should I size up or stay in my usual size for an oversized tee?",
        a: "Stay in your usual size first. An oversized tee is already cut larger, and going up a size can make the shoulders and sleeves too big. Check the size guide on the product page for the measurements."
      },
      {
        q: "What fabric works best for an oversized t-shirt?",
        a: "A heavier cotton, around 220 to 240 GSM, holds the shape better than a thin one. Thin fabric in a large cut tends to hang limp."
      }
    ]
  },
  {
    slug: "how-to-choose-an-oversized-graphic-tshirt-india",
    title: "How to choose oversized graphic tees for men in India: a buying guide",
    description: "GSM, cotton, pre-shrunk fabric, print method and stitching: the checks that decide whether oversized graphic tees for men last or fall apart.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer: "For an oversized graphic t-shirt that lasts, look for 100% cotton at about 240 GSM, a pre-shrunk fabric, reinforced stitching at the neck and shoulders, and a fade-resistant print such as DTF. Check that the seller states these on the product page. If they are missing, assume the fabric is thin.",
    keywords: ["oversized graphic tees", "graphic tees for men", "oversized graphic t-shirt", "men's oversized t-shirt", "heavyweight cotton t-shirt"],
    sections: [
      {
        h2: "1. GSM: the weight of the fabric",
        p: [
          "GSM means grams per square metre. It tells you how heavy the fabric is. Around 160 to 180 GSM is light and suits regular fits. Around 220 to 240 GSM is heavyweight, and it is what an oversized cut needs to hang well.",
          "If a listing does not state the GSM, ask. Sellers who use good fabric usually say so."
        ]
      },
      {
        h2: "2. Fabric: cotton or blend",
        p: [
          "100% cotton is soft, breathable and handles the Indian climate well. Polycotton blends are lighter and resist wrinkles, and some regular-fit tees use them. For an oversized tee worn daily, cotton is the usual choice."
        ]
      },
      {
        h2: "3. Pre-shrunk and washed finishes",
        p: [
          "Cotton shrinks the first time it is washed unless it has been treated. A pre-shrunk fabric keeps its size, so the fit you ordered is the fit you keep. Finishes such as bio-wash or a sun-faded wash also make the fabric softer from the first wear."
        ]
      },
      {
        h2: "4. The print: will it fade?",
        p: [
          "Two methods are common. Screen printing is durable and suits large runs. DTF (direct to film) prints high-definition artwork with fine detail and, done well, resists fading in the wash.",
          "Whatever the method, turn the tee inside out when you wash it, and avoid a hot dryer. That adds years to any print."
        ]
      },
      {
        h2: "5. Stitching at the neck and shoulders",
        p: [
          "The neck and shoulders take the most strain. A ribbed neck that springs back, and reinforced stitching at the shoulder seams, are what stop a tee from stretching out and sagging after a few months."
        ]
      },
      {
        h2: "6. What to check before you pay",
        ul: [
          "Is the GSM, fabric and fit stated on the page?",
          "Is there a size guide with measurements?",
          "What is the return window, and who pays?",
          "Is the delivery cost clear before checkout?"
        ]
      },
      {
        h2: "Heavyweight oversized graphic tees from CHILS & CO.",
        p: [
          "Our oversized tees are 100% cotton at 240 GSM, and we build them with reinforced neck and shoulder stitching and fade-resistant DTF artwork, as set out on our Our promise page. Prices start at \u20B9419. Here is the current range."
        ],
        products: "oversized"
      }
    ],
    faq: [
      {
        q: "What GSM is best for an oversized t-shirt?",
        a: "About 220 to 240 GSM. The extra weight helps an oversized cut hang cleanly instead of clinging or drooping."
      },
      {
        q: "Is 240 GSM too heavy for Indian summers?",
        a: "Heavyweight cotton is thicker, but 100% cotton still breathes. Many people wear it year-round in India. If you want something lighter, a 180 GSM regular fit is the cooler choice."
      },
      {
        q: "Does a graphic print crack or fade in the wash?",
        a: "A good DTF print resists fading. To make any print last, wash the tee inside out in cold or warm water and avoid a hot dryer."
      },
      {
        q: "What does pre-shrunk mean?",
        a: "The fabric has been treated so it does not shrink noticeably in the first wash, so the size you ordered stays the size you wear."
      }
    ]
  },
  {
    slug: "how-to-choose-a-streetwear-brand-in-india",
    title: "Indian streetwear: 7 things to check before you buy from any brand",
    description: "Looking for Indian streetwear brands? Here are seven checks on fabric, fit, returns and delivery that tell you which ones are worth your money.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer: "Before buying from any Indian streetwear brand, check that it states fabric weight and material, shows measurements, has a clear return window, shows delivery cost before checkout, uses real product photos, ships across India with tracking, and answers messages. A brand that is open on these is usually open about quality too.",
    keywords: ["streetwear brands in india", "indian streetwear brands", "best streetwear brands in india"],
    sections: [
      {
        h2: "1. Does it state the fabric and weight?",
        p: ["Streetwear lives on the fabric. Look for the material (100% cotton or a blend) and the GSM. If neither is listed, you cannot judge the quality before you pay."]
      },
      {
        h2: "2. Is there a real size guide?",
        p: ["Oversized and boxy cuts vary a lot between brands. A size guide with measurements in centimetres or inches matters more than the letter on the tag."]
      },
      {
        h2: "3. Is the return policy plain?",
        p: ["Look for a stated window, what is accepted, and how the refund is paid. A clear policy before purchase means fewer surprises after."]
      },
      {
        h2: "4. Is the delivery cost shown before checkout?",
        p: ["You should see the exact delivery charge and the expected time before you pay, not after you have entered your address."]
      },
      {
        h2: "5. Are the photos of the real product?",
        p: ["Real photos, on a real body, in more than one angle. Heavily edited images can hide how the fabric hangs."]
      },
      {
        h2: "6. Does it deliver across India, with tracking?",
        p: ["A tracked shipment by SMS or email tells you the brand is organised, and lets you plan around delivery."]
      },
      {
        h2: "7. Does anyone answer?",
        p: ["Send a question before you buy. How a brand answers a pre-sale message shows how it will treat you after the sale."]
      },
      {
        h2: "How CHILS & CO. measures up",
        ul: [
          "Fabric: our oversized tees are 100% cotton at 240 GSM, stated on every product page.",
          "Delivery: across India from \u20B980, packed within 24 to 48 hours and delivered in 2 to 7 business days, tracked by SMS and email. Store pickup is free.",
          "Returns: within 7 days of delivery for a refund, exchange or store credit. Refunds reach your PhonePe or original payment method in 3 to 7 business days.",
          "Packaging: reusable Second Life packaging and plastic-free shipping.",
          "Where: designed by techies in Hyderabad."
        ],
        products: "any"
      }
    ],
    faq: [
      {
        q: "How do I know if a streetwear brand uses good fabric?",
        a: "Check that it states the material and the GSM. For an oversized tee, 100% cotton at around 240 GSM is a heavyweight standard."
      },
      {
        q: "Are Indian streetwear brands worth buying from?",
        a: "Many are. Judge each one by what it states openly: fabric weight, size measurements, return window and delivery cost, rather than by its marketing."
      },
      {
        q: "What should the return policy of a streetwear brand include?",
        a: "A stated return window, what can be returned, how pickup works and how the refund is paid. CHILS & CO. accepts returns within 7 days of delivery."
      }
    ]
  },
  {
    slug: "gifts-for-software-engineers-india",
    title: "Gifts for software engineers that are not a coffee mug",
    description: "Ideas for a software engineer, developer or techie friend that they will actually wear. Heavyweight tees, delivered across India from \u20B980.",
    published: "2026-11-25",
    updated: "2026-11-25",
    answer: "The best gift for a software engineer is something they use every day and that does not shout. A heavyweight cotton tee with a quiet, clever design beats another mug or lanyard. Pick their size from a tee they already own, choose a design that matches their work, and order early, since delivery in India takes 2 to 7 business days.",
    keywords: ["gift for software engineer", "gifts for developers", "tech t-shirt gift India"],
    sections: [
      {
        h2: "Why a tee works as a gift",
        p: [
          "Engineers tend to own enough gadgets and desk toys. A tee is practical, it gets worn weekly, and the right design makes a small joke only a fellow engineer understands."
        ]
      },
      {
        h2: "How to choose one",
        ul: [
          "Match the work. A VLSI or semiconductor design for a chip engineer, a developer design for someone who writes code.",
          "Pick the fit from what they wear. If they live in loose tees, choose an oversized drop shoulder. If they prefer a neater look, choose a regular fit.",
          "Get the size from a tee they already own. Measure it flat across the chest and compare with the size guide.",
          "Prefer fabric over novelty. 100% cotton at 240 GSM feels better and lasts longer than a thin printed tee."
        ]
      },
      {
        h2: "Timing and delivery",
        p: [
          `${BRAND} delivers across India from \u20B980. Orders are packed within 24 to 48 hours and delivered in 2 to 7 business days, with SMS and email tracking. If the size is wrong, returns are accepted within 7 days of delivery.`
        ]
      },
      {
        h2: "Tees for the techie in your life",
        p: ["Designed by techies in Hyderabad. Here is the current range."],
        products: "any"
      }
    ],
    faq: [
      {
        q: "What is a good gift for a software engineer in India?",
        a: "A heavyweight cotton tee with a design from their field is a practical choice. It is worn often and does not add desk clutter."
      },
      {
        q: "How long does delivery take for a gift order?",
        a: "Orders are packed within 24 to 48 hours and delivered across India in 2 to 7 business days. Order a week ahead for a dated occasion."
      },
      {
        q: "What if the size is wrong?",
        a: "Returns are accepted within 7 days of delivery, for a refund, an exchange or store credit. The tee must be unworn and unwashed, with its tags on."
      }
    ]
  },
  {
    slug: "240-gsm-vs-180-gsm-tshirt-which-to-buy",
    title: "240 GSM vs 180 GSM t-shirts: which should you buy?",
    description: "What GSM means on a t-shirt, how 180 and 240 GSM differ in feel, drape and durability, and which suits oversized, regular and summer wear.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer: "GSM is grams per square metre, a measure of fabric weight. A 180 GSM tee is lighter, cooler and drapes softly, which suits regular fits and hot weather. A 240 GSM tee is heavyweight: it holds its shape, feels substantial and suits oversized cuts. Neither is better. Pick by fit and climate.",
    keywords: ["240 gsm t-shirt", "heavyweight cotton t-shirt", "180 gsm t-shirt", "gsm meaning t-shirt"],
    sections: [
      {
        h2: "What GSM means",
        p: ["GSM stands for grams per square metre. It is the weight of one square metre of the fabric, so a higher number means thicker, heavier cloth. It is the quickest way to compare two tees without touching them."]
      },
      {
        h2: "180 GSM: light and easy",
        ul: [
          "Feels light and breathable, and dries quickly.",
          "Drapes softly and follows the body, which suits a regular fit.",
          "A good choice for hot, humid weather and for layering under a shirt.",
          "Can look thin in a very large cut."
        ]
      },
      {
        h2: "240 GSM: heavyweight",
        ul: [
          "Feels thick and substantial, with a firmer hand.",
          "Holds its shape, so an oversized or drop shoulder cut hangs cleanly instead of clinging.",
          "Tends to keep its form wash after wash, especially in 100% cotton.",
          "Warmer than a light tee, though 100% cotton still breathes."
        ]
      },
      {
        h2: "Which should you pick?",
        ul: [
          "Oversized or drop shoulder: 240 GSM, for structure.",
          "Regular fit, or a very hot day: 180 GSM, for comfort.",
          "A polo: a heavier knit looks neater and keeps the collar standing.",
          "If a listing does not state the GSM, ask. Sellers who use good fabric usually say so."
        ]
      },
      {
        h2: "How we use both",
        p: [`${BRAND} uses 100% cotton at 240 GSM for every oversized tee. Our regular fit and minimal tees range from 180 to 240 GSM depending on the design. The product page lists the fabric and weight.`],
        products: "oversized"
      }
    ],
    faq: [
      { q: "What does GSM mean on a t-shirt?", a: "Grams per square metre. It is the weight of the fabric, so a higher GSM means thicker, heavier cloth." },
      { q: "Is 240 GSM too hot for Indian weather?", a: "It is warmer than a light tee, but 100% cotton breathes well, and many people wear it year-round. For the hottest months a 180 GSM tee is cooler." },
      { q: "Is a higher GSM always better?", a: "No. It is better for structure and an oversized cut. A lower GSM is better for a light, cool, regular fit." },
      { q: "What GSM is a heavyweight t-shirt?", a: "Usually 220 GSM and above. Our oversized tees are 240 GSM." }
    ]
  },
  {
    slug: "how-to-style-an-oversized-tshirt-men",
    title: "How to style an oversized t-shirt: 6 ideas for men",
    description: "Six simple ways to wear an oversized t-shirt: trousers, jeans, shorts, layers, shoes and what to avoid, so the loose cut looks intentional.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer: "To style an oversized t-shirt, balance the loose top with a cleaner bottom: straight or tapered trousers, or well-fitted jeans. Keep the shoulder seam near your upper arm, let the hem sit around mid-hip, choose a heavier fabric so it drapes cleanly, and add one layer or a simple pair of shoes to finish the look.",
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
          "If it feels too big, go by the measurements in the size guide, not only the letter."
        ]
      },
      {
        h2: "Oversized tees to start with",
        p: [`${BRAND} oversized tees are 100% cotton at 240 GSM, in drop shoulder cuts, sizes S to XL.`],
        products: "oversized"
      }
    ],
    faq: [
      { q: "How should an oversized t-shirt fit?", a: "The shoulder seam sits on the upper arm, the hem lands around mid-hip, and the body is loose without swallowing you. A heavier fabric helps it drape cleanly." },
      { q: "What should I wear with an oversized t-shirt?", a: "A cleaner bottom: straight or tapered trousers, well-fitted jeans, or shorts. Simple shoes finish the look." },
      { q: "Can short men wear oversized t-shirts?", a: "Yes. Keep the hem at mid-hip rather than lower, choose tapered bottoms, and avoid fabric so large that it swallows your frame." }
    ]
  },
  {
    slug: "how-to-choose-a-polo-tshirt-for-men",
    title: "How to choose a polo t-shirt for men: fabric, fit and collar",
    description: "A buyer's guide to polo t-shirts for men: what fabric to look for, how a polo should fit, why the collar matters, and how to care for it.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer: "A good polo t-shirt has a structured collar that stands on its own, a knit heavy enough to hold its shape (around 220 to 240 GSM), and a fit that skims the body without clinging. Check that the fabric and weight are stated, that the collar is stitched firmly, and that the hem and sleeves sit neatly.",
    keywords: ["polo t-shirt for men", "polo t shirt", "best polo t-shirt"],
    sections: [
      {
        h2: "1. The collar",
        p: ["The collar decides whether a polo looks smart or sloppy. A structured collar stands up and keeps its shape after washing. A floppy one curls within weeks. Look for a firm, well-stitched collar with a clean finish."]
      },
      {
        h2: "2. The fabric and its weight",
        ul: [
          "Heavier knits, around 220 to 240 GSM, drape cleanly and resist clinging.",
          "Cotton is soft and breathable. A blend adds shape and wrinkle resistance.",
          "Some polos pair cotton on the inside with polyester on the outside, for softness against the skin and a longer-lasting finish."
        ]
      },
      {
        h2: "3. The fit",
        p: ["A polo should skim the body. The shoulder seam sits on the edge of your shoulder, the sleeves end mid-bicep, and the hem falls around the belt line. A relaxed fit gives more room and suits warm weather."]
      },
      {
        h2: "4. Branding and print",
        p: ["Small, clean branding looks better on a polo than a large graphic. Check that the embroidery or print is crisp and will not crack in the wash."]
      },
      {
        h2: "5. Care",
        ul: ["Wash cold or warm, inside out.", "Dry in shade where you can, to protect the collar and the colour.", "Fold rather than hang for long periods, so the shoulders do not stretch."]
      },
      {
        h2: "Our TwinTex polos",
        p: [`${BRAND} TwinTex polos have a structured collar and a relaxed fit, in a 240 GSM heavyweight knit with cotton on the inside and polyester on the outside.`],
        products: "polo"
      }
    ],
    faq: [
      { q: "What is a good GSM for a polo t-shirt?", a: "Around 220 to 240 GSM gives a structured look that drapes well. Lighter knits are cooler but can cling." },
      { q: "How should a polo fit?", a: "It should skim the body: shoulder seams on the edge of your shoulders, sleeves ending mid-bicep and the hem near the belt line. A relaxed fit allows more room." },
      { q: "What is TwinTex?", a: "Our polo fabric, a 240 GSM heavyweight knit with cotton on the inside and polyester on the outside." }
    ]
  },
  {
    slug: "how-to-wash-a-graphic-tshirt-so-the-print-lasts",
    title: "How to wash a graphic t-shirt so the print lasts",
    description: "Simple washing and drying rules that keep a printed t-shirt from cracking or fading: inside out, cold water, mild detergent and shade drying.",
    published: "2026-11-26",
    updated: "2026-11-26",
    answer: "To keep a graphic t-shirt's print from fading or cracking, turn it inside out, wash in cold or warm water on a gentle cycle with mild detergent, avoid bleach and fabric softener, and dry it in the shade instead of a hot dryer. Do not iron directly on the print.",
    keywords: ["how to wash graphic t-shirt", "how to stop print fading", "t-shirt care"],
    sections: [
      {
        h2: "1. Turn it inside out",
        p: ["This protects the print from rubbing against other clothes and the drum. It is the single biggest thing you can do."]
      },
      {
        h2: "2. Use cold or warm water",
        p: ["Hot water relaxes the print and the fibres and speeds fading. Cold or warm water on a gentle cycle is enough for everyday wear."]
      },
      {
        h2: "3. Use mild detergent",
        ul: ["Skip bleach, which strips colour and weakens the print.", "Skip fabric softener, which can coat the print and dull it.", "Do not leave the tee soaking for hours."]
      },
      {
        h2: "4. Dry it in the shade",
        p: ["Direct sun fades colour, and a hot tumble dryer can crack a print. Dry in the shade, or on a low heat setting if you must use a dryer."]
      },
      {
        h2: "5. Ironing",
        p: ["If you iron, turn the tee inside out and use a low to medium setting. Never iron directly on the print."]
      },
      {
        h2: "6. Wash it less often",
        p: ["A tee does not need washing after every wear. Air it out between wears and wash when it needs it. Fewer washes mean a longer-lasting print and fabric."]
      },
      {
        h2: "Prints built to last",
        p: [`${BRAND} prints with DTF artwork designed to resist fading, on heavyweight cotton. Care instructions are on the product pages.`],
        products: "any"
      }
    ],
    faq: [
      { q: "Should I wash a printed t-shirt inside out?", a: "Yes. Washing it inside out protects the print from friction and is the most effective way to stop it fading or cracking." },
      { q: "Can I put a graphic t-shirt in the dryer?", a: "It is better not to. Heat can crack a print and shrink cotton. Dry it in the shade, or use a low heat setting." },
      { q: "Does fabric softener damage a print?", a: "It can coat the print and dull it over time, so it is best avoided on printed tees." }
    ]
  }
];
var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var inr = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;
var longDate = (iso) => (/* @__PURE__ */ new Date(`${iso}T00:00:00Z`)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
var CSS = `
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
function page(opts) {
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
${opts.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<header><a class="brand" href="/">CHILS &amp; CO.</a><nav><a href="/collection">Shop</a><a href="/journal">Journal</a><a href="/our-promise">Our promise</a><a href="/support">Support</a></nav></header>
${opts.body}
<footer><span>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${esc(BRAND)}. Designed by techies in Hyderabad.</span><span><a href="/shipping-delivery">Shipping</a> \xB7 <a href="/returns-refunds">Returns</a></span></footer>
</body>
</html>`;
}
var orgLd = {
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
    addressCountry: "IN"
  },
  areaServed: "IN",
  sameAs: [
    "https://www.instagram.com/chils_and_co/",
    "https://www.facebook.com/chilsandco",
    "https://www.youtube.com/@chils_and_co",
    "https://www.pinterest.com/chilsandco",
    "https://twitter.com/chilsandco",
    "https://www.threads.net/@chilsandco"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: "+91 78420 70404",
    email: "hello.chilsandco@gmail.com",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Telugu"],
    hoursAvailable: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "18:00" }
  }
};
function imgUrl(src, small = false) {
  if (!src) return "";
  const m = src.match(/wp-content\/uploads\/(.+?)(?:$|[?#])/);
  if (/^\/api\/media\?url=/.test(src) || /^https?:\/\/[^/]*chilsandco\.com\/wp-content\//.test(src)) {
    let raw = src;
    try {
      if (src.startsWith("/api/media")) raw = decodeURIComponent(src.split("url=")[1] || "");
    } catch {
    }
    const mm = raw.match(/wp-content\/uploads\/(.+?)(?:$|[?#])/);
    if (mm) return `${SITE}/media/${small ? "s/" : ""}${mm[1]}`;
  }
  if (m && /^https?:/.test(src)) return `${SITE}/media/${small ? "s/" : ""}${m[1]}`;
  return src.startsWith("/") ? `${SITE}${src}` : src;
}
function productGrid(products, kind) {
  const visible2 = products.filter((p) => String(p.id) !== "1672" && p.status !== "outofstock");
  const pool = kind === "oversized" ? visible2.filter((p) => /oversized|drop shoulder/i.test(`${p.category} ${(p.categories || []).join(" ")}`)) : kind === "polo" ? visible2.filter((p) => /polo/i.test(String(p.name)) && p.type !== "grouped") : kind === "regular" ? visible2.filter((p) => /regular/i.test(String(p.category))) : visible2;
  const picks = pool.filter((p) => p.images?.[0]).slice(0, 6);
  if (!picks.length) return `<p><a href="/collection">See the full collection</a></p>`;
  return `<div class="grid">${picks.map((p) => `<a class="card" href="/product/${esc(p.id)}"><img loading="lazy" width="300" height="375" src="${esc(imgUrl(p.images[0], true))}" alt="${esc(p.name)}"><span>${esc(p.name)}<br><em>${inr(p.price)}</em></span></a>`).join("")}</div><p><a class="pill" href="/collection">Shop the collection</a></p>`;
}
function articleHtml(a, products) {
  const body = `<main>
<article>
<p class="eyebrow">Journal</p>
<h1>${esc(a.title)}</h1>
<p class="meta">By ${esc(BRAND)} \xB7 Updated ${longDate(a.updated)}</p>
<div class="answer"><b>The short answer</b>${esc(a.answer)}</div>
${a.sections.map(
    (s) => `<section><h2>${esc(s.h2)}</h2>${(s.p || []).map((t) => `<p>${esc(t)}</p>`).join("")}${s.ul ? `<ul>${s.ul.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}${s.products ? productGrid(products, s.products) : ""}</section>`
  ).join("\n")}
<section class="faq"><h2>Frequently asked questions</h2>
${a.faq.map((f) => `<details open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
</section>
</article>
<p style="margin-top:36px"><a href="/journal">\u2190 All articles</a></p>
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
        publisher: { "@type": "Organization", name: BRAND, url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/apple-touch-icon.png` } }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE}/journal` },
          { "@type": "ListItem", position: 3, name: a.title, item: url }
        ]
      },
      orgLd
    ]
  });
}
function indexHtml() {
  const body = `<main>
<p class="eyebrow">Journal</p>
<h1>Fit, fabric and what to wear</h1>
<p class="meta">Plain answers from the team at ${esc(BRAND)}, Hyderabad.</p>
<div class="list">
${ARTICLES.map((a) => `<a class="row" href="/journal/${a.slug}"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p></a>`).join("\n")}
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
        hasPart: ARTICLES.map((a) => ({ "@type": "Article", headline: a.title, url: `${SITE}/journal/${a.slug}` }))
      },
      orgLd
    ]
  });
}
var EXTRA_LLM_LINKS = [];
function llmsText(products) {
  const visible2 = products.filter((p) => String(p.id) !== "1672");
  const prices = visible2.map((p) => Number(p.price)).filter((n) => n > 0);
  const range2 = prices.length ? `${inr(Math.min(...prices))} to ${inr(Math.max(...prices))}` : "";
  return `# ${BRAND}

> ${BRAND} is an Indian clothing brand from Hyderabad, designed by techies. It sells heavyweight oversized drop shoulder tees (100% cotton, 240 GSM), TwinTex polos and regular fit tees, with delivery across India.

## Key facts
- Based in Hyderabad, Telangana, India. Website: ${SITE}
- Oversized and drop shoulder tees: 100% cotton at 240 GSM. Built with reinforced neck and shoulder stitching and fade-resistant DTF artwork (see the Our promise page).
- Polo t-shirts: TwinTex fabric (cotton inside, polyester outside), 240 GSM heavyweight knit, structured collar, relaxed fit.
- Regular fit and minimal tees: 100% cotton, cotton blend or polycotton, between 180 and 240 GSM depending on the design.
- Stacks: three tees chosen to go together, banded as a numbered Trilogy; save 10%.
${range2 ? `- Current prices: ${range2}.
` : ""}- Delivery across India from \u20B980. Packed within 24 to 48 hours, delivered in 2 to 7 business days, tracked by SMS and email. Store pickup is free.
- Returns within 7 days of delivery for a refund, exchange or store credit. Refunds reach the PhonePe or original payment method in 3 to 7 business days.
- Packaging: reusable Second Life packaging, plastic-free shipping.

## Guides
${ARTICLES.map((a) => `- [${a.title}](${SITE}/journal/${a.slug}): ${a.description}`).join("\n")}

## Shop by type
${EXTRA_LLM_LINKS.map((l) => `- [${l.label}](${SITE}${l.href})`).join("\n")}

## Shop and policies
- [Collection](${SITE}/collection)
- [Our promise](${SITE}/our-promise)
- [Shipping and delivery](${SITE}/shipping-delivery)
- [Returns and refunds](${SITE}/returns-refunds)
- [Support](${SITE}/support)
`;
}
function registerJournal(app, getProducts) {
  const products = () => getProducts() || [];
  const html = (res, body) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.send(body);
  };
  app.get("/journal", (_req, res) => html(res, indexHtml()));
  app.get("/journal/:slug", (req, res) => {
    const a = ARTICLES.find((x) => x.slug === req.params.slug);
    if (!a) return res.redirect(302, "/journal");
    html(res, articleHtml(a, products()));
  });
  app.get("/llms.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(llmsText(products()));
  });
}

// seo.ts
var visible = (ps) => ps.filter((p) => String(p.id) !== "1672" && p.status !== "outofstock");
var isOversized = (p) => /drop shoulder|oversized/i.test(String(p.category));
var isPolo = (p) => /polo/i.test(String(p.name)) && p.type !== "grouped";
var isCombo = (p) => String(p.category) === "Combos";
var isRegular = (p) => !isOversized(p) && !isCombo(p);
var range = (ps) => {
  const n = ps.map((p) => Number(p.price)).filter((x) => x > 0);
  return n.length ? { lo: Math.min(...n), hi: Math.max(...n) } : null;
};
var topColors = (ps, n = 6) => {
  const c = /* @__PURE__ */ new Map();
  for (const p of ps) for (const col of p.availableColors || []) c.set(col, (c.get(col) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map((e) => e[0]);
};
var plainText = (html) => String(html || "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/[ \t]+/g, " ").trim();
var SHARED_FAQ = [
  { q: "How long does delivery take?", a: "Orders are packed within 24 to 48 hours and delivered across India in 2 to 7 business days, with SMS and email tracking. Delivery starts at \u20B980, and store pickup is free." },
  { q: "What is the return policy?", a: "You can return a tee within 7 days of delivery for a refund, an exchange or store credit. The tee must be unworn and unwashed with its tags on. Refunds reach your PhonePe or original payment method in 3 to 7 business days." }
];
var LANDINGS = [
  {
    path: "/oversized-t-shirts-for-men",
    title: "Oversized T-Shirts for Men | 240 GSM Cotton | CHILS & CO.",
    h1: "Oversized t-shirts for men",
    description: "Heavyweight oversized drop shoulder t-shirts in 100% cotton at 240 GSM, designed by techies in Hyderabad. Delivered across India with 7-day returns.",
    pick: isOversized,
    intro: (ps) => {
      const r = range(ps);
      return [
        `Our oversized t-shirts are cut as drop shoulder tees in 100% cotton at 240 GSM, a heavyweight fabric that holds its shape instead of hanging limp. There are ${ps.length} designs${r ? `, priced from ${inr(r.lo)} to ${inr(r.hi)}` : ""}.`,
        "We build them with reinforced stitching at the neck and shoulders and fade-resistant DTF artwork, as set out on our Our promise page. The designs are graphic tees from the worlds of code, chips and engineering, designed by techies in Hyderabad and delivered across India."
      ];
    },
    sections: (ps) => [
      {
        h2: "What makes them oversized",
        ul: [
          "Drop shoulder cut: the shoulder seam sits low on the upper arm, for a relaxed shape.",
          "100% cotton at 240 GSM: heavyweight, soft and breathable.",
          "Built with reinforced neck and shoulder stitching so the tee keeps its shape.",
          "DTF artwork designed to resist fading, best washed inside out."
        ]
      },
      {
        h2: "Colours",
        p: [`Colours across the range include ${topColors(ps).join(", ")}. Black is available on ${ps.filter((p) => (p.availableColors || []).some((c) => /black/i.test(c))).length} of the ${ps.length} designs.`]
      },
      {
        h2: "Picking your size",
        p: ["Oversized tees are cut larger already, so start with your usual size and check the size guide on the product page for the measurements. Every design comes in sizes S to XL."]
      }
    ],
    faq: () => [
      { q: "What fabric are your oversized t-shirts made of?", a: "100% cotton at 240 GSM, a heavyweight weight that keeps the shape of a loose cut." },
      { q: "Should I size up for an oversized t-shirt?", a: "Usually no. The cut is already larger, so start with your usual size and check the size guide for measurements." },
      { q: "Are the prints durable?", a: "Our prints use DTF artwork designed to resist fading. For the longest life, wash the tee inside out and avoid a hot dryer." },
      ...SHARED_FAQ
    ],
    related: [
      { href: "/journal/oversized-vs-boxy-vs-drop-shoulder-tshirt", label: "Oversized, boxy or drop shoulder: what's the difference?" },
      { href: "/journal/how-to-choose-an-oversized-graphic-tshirt-india", label: "How to choose an oversized graphic t-shirt" },
      { href: "/polo-t-shirts-for-men", label: "Polo t-shirts for men" }
    ]
  },
  {
    path: "/polo-t-shirts-for-men",
    title: "Polo Shirts for Men | Heavyweight 240 GSM | CHILS & CO.",
    h1: "Polo shirts and polo t-shirts for men",
    description: "Polo shirts for men with a structured collar, in heavyweight 240 GSM TwinTex fabric. Designed by techies in Hyderabad. Delivered across India, 7-day returns.",
    pick: isPolo,
    intro: (ps) => {
      const r = range(ps);
      return [
        `Our TwinTex polo shirts have a structured collar and a relaxed fit, knitted from a heavyweight 240 GSM fabric with cotton on the inside and polyester on the outside. There are ${ps.length} designs${r ? `, ${r.lo === r.hi ? `at ${inr(r.lo)}` : `from ${inr(r.lo)} to ${inr(r.hi)}`}` : ""}.`,
        "They are made for everyday wear: soft and breathable against the skin, with premium DTF branding."
      ];
    },
    sections: (ps) => [
      {
        h2: "Why TwinTex",
        ul: [
          "Cotton inside, polyester outside: soft against the skin, and it keeps its look.",
          "240 GSM heavyweight knit with a structured polo collar.",
          "Relaxed fit for everyday wear."
        ]
      },
      { h2: "Colours", p: [`Available colours include ${topColors(ps).join(", ") || "black, navy and green"}.`] }
    ],
    faq: () => [
      { q: "What is TwinTex fabric?", a: "TwinTex is our polo fabric: a 240 GSM heavyweight knit with cotton on the inside and polyester on the outside." },
      { q: "Do the polos have a relaxed or slim fit?", a: "A relaxed fit with a structured collar. Check the size guide on the product page for measurements." },
      ...SHARED_FAQ
    ],
    related: [
      { href: "/t-shirt-combos", label: "Three-tee stacks, save 10%" },
      { href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" }
    ]
  },
  {
    path: "/t-shirt-combos",
    title: "T-Shirt Combos: Pick 3 and Save 10% | CHILS & CO.",
    h1: "T-shirt combos: three tees, save 10%",
    description: "Three tees chosen to go together and banded as a numbered Trilogy. Pick your size and save 10%. Delivered across India with 7-day returns.",
    pick: isCombo,
    intro: (ps) => [
      `Our stacks are three tees chosen to go together, banded as a numbered Trilogy. Pick your size and save 10%. There are ${ps.length} stacks to choose from, including core tees and polo stacks.`,
      "You can also build your own set of three on the Pick Your Three page."
    ],
    sections: () => [
      {
        h2: "How a stack works",
        ul: [
          "Each stack is three tees chosen to go together, banded as a numbered Trilogy.",
          "Choose your size once and save 10% on the set.",
          "Or pick any three tees yourself on the Pick Your Three page."
        ]
      }
    ],
    faq: () => [
      { q: "How much do I save on a combo?", a: "A Trilogy of three tees saves 10%." },
      { q: "Can I choose my own three tees?", a: "Yes. Use the Pick Your Three page to build your own set." },
      ...SHARED_FAQ
    ],
    related: [
      { href: "/pick-your-three", label: "Build your own three" },
      { href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" }
    ]
  },
  {
    path: "/regular-fit-t-shirts-for-men",
    title: "Regular Fit T-Shirts for Men | Cotton & Blends | CHILS & CO.",
    h1: "Regular fit t-shirts for men",
    description: "Regular fit and minimal t-shirts in cotton and cotton-blend fabrics, from 180 to 240 GSM, designed by techies in Hyderabad. Delivered across India.",
    pick: isRegular,
    intro: (ps) => {
      const r = range(ps);
      return [
        `A cleaner, closer cut than our oversized range. Our regular fit and minimal tees come in 100% cotton, cotton blends and polycotton, between 180 and 240 GSM depending on the design. There are ${ps.length} designs${r ? `, from ${inr(r.lo)} to ${inr(r.hi)}` : ""}.`,
        "Product pages list the fabric and weight, so you can choose the feel you want."
      ];
    },
    sections: (ps) => [
      {
        h2: "Regular fit or oversized?",
        p: ["Regular fit follows your body without clinging, and suits layering and a neat look. If you want the relaxed, loose silhouette, see our oversized t-shirts instead."]
      },
      { h2: "Colours", p: [`Available colours include ${topColors(ps, 8).join(", ")}.`] }
    ],
    faq: () => [
      { q: "What fabrics do regular fit tees come in?", a: "A mix of 100% cotton, cotton blend (60% cotton, 40% polyester) and polycotton, between 180 and 240 GSM. Each product page lists the exact fabric." },
      { q: "What is the difference between regular fit and oversized?", a: "Regular fit follows the body without clinging. Oversized is cut larger, with a lower shoulder seam, for a relaxed look." },
      ...SHARED_FAQ
    ],
    related: [{ href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" }, { href: "/t-shirt-combos", label: "Three-tee stacks" }]
  }
];
function cardGrid(ps, limit = 40) {
  return `<div class="grid">${ps.filter((p) => p.images?.[0]).slice(0, limit).map((p) => `<a class="card" href="/product/${esc(p.id)}"><img loading="lazy" width="300" height="375" src="${esc(imgUrl(p.images[0], true))}" alt="${esc(p.name)}"><span>${esc(p.name)}<br><em>${inr(p.price)}</em></span></a>`).join("")}</div>`;
}
function landingHtml(l, all) {
  const ps = visible(all).filter(l.pick);
  const faq = l.faq(ps);
  const body = `<main>
<p class="eyebrow">${esc(BRAND)}</p>
<h1>${esc(l.h1)}</h1>
${l.intro(ps).map((t) => `<p>${esc(t)}</p>`).join("")}
<h2>Shop the range</h2>
${ps.some((p) => p.images?.[0]) ? cardGrid(ps) : ps.length ? `<ul>${ps.map((p) => `<li><a href="/product/${esc(p.id)}">${esc(p.name)}</a> \xB7 ${inr(p.price)}</li>`).join("")}</ul>` : `<p><a href="/collection">See the full collection</a></p>`}
<p><a class="pill" href="/collection">Shop the full collection</a></p>
${l.sections(ps).map((s) => `<section><h2>${esc(s.h2)}</h2>${(s.p || []).map((t) => `<p>${esc(t)}</p>`).join("")}${s.ul ? `<ul>${s.ul.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}</section>`).join("\n")}
<section class="faq"><h2>Frequently asked questions</h2>
${faq.map((f) => `<details open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n")}
</section>
<section><h2>Keep reading</h2><ul>${l.related.map((r) => `<li><a href="${r.href}">${esc(r.label)}</a></li>`).join("")}</ul></section>
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
          itemListElement: ps.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/product/${p.id}`, name: p.name }))
        }
      },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: l.h1, item: `${SITE}${l.path}` }
        ]
      },
      orgLd
    ]
  });
}
var BOX = `<div style="max-width:760px;margin:0 auto;padding:88px 20px 48px;font:16px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141311">`;
var links = (items) => `<ul>${items.map((i) => `<li><a href="${i.href}">${esc(i.label)}</a></li>`).join("")}</ul>`;
var productLinks = (ps) => `<ul>${ps.map((p) => `<li><a href="/product/${esc(p.id)}">${esc(p.name)}</a> \xB7 ${inr(p.price)}</li>`).join("")}</ul>`;
var POLICY = `<h2>Delivery and returns</h2><ul>
<li>Delivery across India from \u20B980, packed within 24 to 48 hours and delivered in 2 to 7 business days, tracked by SMS and email. Store pickup is free.</li>
<li>Returns within 7 days of delivery for a refund, exchange or store credit. Refunds reach your PhonePe or original payment method in 3 to 7 business days.</li>
<li>Reusable Second Life packaging and plastic-free shipping.</li></ul>`;
var GUIDES = links([
  ...LANDINGS.map((l) => ({ href: l.path, label: l.h1 })),
  { href: "/journal", label: "Journal: fit, fabric and style guides" }
]);
function homeBody(all) {
  const ps = visible(all);
  const over = ps.filter(isOversized);
  const r = range(ps);
  return `${BOX}<h1>Oversized t-shirts and polos for men, designed by techies in Hyderabad</h1>
<p>${esc(BRAND)} makes heavyweight oversized drop shoulder graphic tees in 100% cotton at 240 GSM, TwinTex polo shirts and minimal regular fit tees, designed by techies in Hyderabad${r ? `, priced from ${inr(r.lo)}` : ""}. We deliver across India, with 7-day returns.</p>
<h2>Shop by type</h2>${links([
    { href: "/oversized-t-shirts-for-men", label: `Oversized t-shirts for men (${over.length} designs)` },
    { href: "/polo-t-shirts-for-men", label: "Polo shirts for men" },
    { href: "/regular-fit-t-shirts-for-men", label: "Regular fit t-shirts for men" },
    { href: "/t-shirt-combos", label: "Three-tee stacks: save 10%" },
    { href: "/collection", label: "The full collection" }
  ])}
<h2>Popular oversized tees</h2>${productLinks(over.slice(0, 12))}
<h2>Why people choose us</h2><ul>
<li>Heavyweight 100% cotton at 240 GSM on every oversized tee.</li>
<li>Built with reinforced neck and shoulder stitching and fade-resistant DTF artwork.</li>
<li>Designs from the worlds of code, chips and engineering.</li></ul>
${POLICY}
<h2>Guides</h2>${GUIDES}</div>`;
}
function collectionBody(all) {
  const ps = visible(all);
  const group = (title, items) => items.length ? `<h2>${esc(title)} (${items.length})</h2>${productLinks(items)}` : "";
  return `${BOX}<h1>Shop t-shirts and polos for men</h1>
<p>Every ${esc(BRAND)} design in one place: ${ps.length} products across oversized drop shoulder tees, TwinTex polos, minimal and regular fit tees, and three-tee stacks. Delivered across India from \u20B980, with 7-day returns.</p>
${group("Oversized drop shoulder t-shirts", ps.filter(isOversized))}
${group("Polo t-shirts", ps.filter(isPolo))}
${group("Regular fit and minimal t-shirts", ps.filter((p) => isRegular(p) && !isPolo(p)))}
${group("Three-tee stacks", ps.filter(isCombo))}
${POLICY}
<h2>Guides</h2>${GUIDES}</div>`;
}
function descriptionParts(p) {
  const lines = String(p.description || "").split(/\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-•]/.test(l)).map((l) => l.replace(/^[-•]\s*/, ""));
  const prose = lines.filter((l) => !/^[-•]/.test(l));
  const story = plainText(String(p.shortDescription || p.concept || "")).replace(/^Story Behind The Design\s*/i, "");
  return { bullets, prose: prose.join(" "), story };
}
function productTypeLabel(p) {
  if (isPolo(p)) return "Polo T-Shirt for Men";
  if (isCombo(p)) return "T-Shirt Combo";
  if (isOversized(p)) return "Oversized T-Shirt for Men";
  return "T-Shirt for Men";
}
function productBody(p) {
  const d = descriptionParts(p);
  const sizes = (p.availableSizes || []).join(", ");
  const cols = (p.availableColors || []).join(", ");
  return `${BOX}<p><a href="/collection">All products</a></p>
<h1>${esc(p.name)} ${esc(productTypeLabel(p))}</h1>
<p><strong>${inr(p.price)}</strong>${p.category ? ` \xB7 ${esc(p.category)}` : ""}${p.fit ? ` \xB7 ${esc(p.fit)}` : ""}</p>
${p.images?.[0] ? `<p><img src="${esc(imgUrl(p.images[0]))}" alt="${esc(p.name)}" width="480" style="max-width:100%;height:auto"></p>` : ""}
${d.bullets.length ? `<h2>Details</h2><ul>${d.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
${sizes || cols ? `<h2>Sizes and colours</h2><p>${sizes ? `Sizes: ${esc(sizes)}. ` : ""}${cols ? `Colours: ${esc(cols)}.` : ""}</p>` : ""}
${d.story ? `<h2>The story</h2><p>${esc(d.story).slice(0, 900)}</p>` : ""}
${p.care ? `<h2>Care</h2><p>${esc(p.care)}</p>` : ""}
${POLICY}
<h2>More like this</h2>${links([
    isOversized(p) ? { href: "/oversized-t-shirts-for-men", label: "Oversized t-shirts for men" } : isPolo(p) ? { href: "/polo-t-shirts-for-men", label: "Polo t-shirts for men" } : { href: "/regular-fit-t-shirts-for-men", label: "Regular fit t-shirts for men" },
    { href: "/collection", label: "The full collection" }
  ])}</div>`;
}
function policyBody(path4) {
  if (path4 === "/shipping-delivery")
    return `${BOX}<h1>Shipping and delivery</h1><p>We deliver across India. Delivery costs from \u20B980, and you see the exact amount at checkout before you pay.</p><ul>
<li>Packing: orders are packed and handed to the courier within 24 to 48 hours.</li>
<li>Delivery time: 2 to 7 business days, tracked by SMS and email. Business days do not include Sundays or public holidays.</li>
<li>Store pickup: free.</li>
<li>Estimates can slip because of weather, courier delays or very busy periods, and we keep you posted.</li></ul>
<p><a href="/returns-refunds">Returns and refunds</a> \xB7 <a href="/collection">Shop</a></p></div>`;
  if (path4 === "/returns-refunds")
    return `${BOX}<h1>Returns and refunds</h1><p>Return a tee within 7 days of delivery for a refund, an exchange or store credit.</p><ul>
<li>What we cannot take back: tees that have been worn or washed, with tags or trims removed, damage after delivery, and requests made more than 7 days after delivery.</li>
<li>How to ask: tell us the reason, add a short description and up to three photos. Photos are needed for damaged items, wrong items and quality concerns.</li>
<li>What happens next: our team reviews every request. If it is approved we email you the pickup details; pickup depends on the courier serving your area.</li>
<li>Refunds go to your PhonePe or original payment method in 3 to 7 business days after the tee is back and checked.</li></ul>
<p><a href="/shipping-delivery">Shipping and delivery</a> \xB7 <a href="/collection">Shop</a></p></div>`;
  if (path4 === "/our-promise")
    return `${BOX}<h1>Our promise</h1><p>${esc(BRAND)} stands behind how its tees are made and packed.</p><ul>
<li>Fabric: our oversized tees are heavyweight 100% cotton at 240 GSM.</li>
<li>Construction: reinforced stitching at the neck and shoulders, and high-definition, fade-resistant DTF artwork.</li>
<li>Packaging: reusable Second Life packaging and plastic-free shipping.</li></ul>
<p><a href="/collection">Shop the collection</a></p></div>`;
  return "";
}
function productSchema(p, canonical) {
  const imgs = (p.images || []).slice(0, 4).map((i) => imgUrl(i));
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    image: imgs,
    description: plainText(descriptionParts(p).bullets.join(". ") || p.shortDescription || p.name).slice(0, 500),
    sku: `CHLS-${p.id}`,
    brand: { "@type": "Brand", name: BRAND },
    category: p.category,
    ...p.availableColors?.length ? { color: p.availableColors.join(", ") } : {},
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
        merchantReturnLink: `${SITE}/returns-refunds`
      }
    }
  };
}
function registerLandings(app, getProducts) {
  for (const l of LANDINGS) {
    app.get(l.path, (_req, res) => {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
      res.send(landingHtml(l, getProducts() || []));
    });
  }
}

// slackBot.ts
import fs2 from "fs";
import { WebClient } from "@slack/web-api";
import { SocketModeClient } from "@slack/socket-mode";

// storage.ts
import fs from "fs";
import os from "os";
import path from "path";
var DATA_DIR = process.env.CHILS_DATA_DIR || path.join(os.homedir(), "chils-data");
var UPLOADS_DIR = path.join(DATA_DIR, "uploads");
var SAFE_EXT = /^[a-z0-9]{1,5}$/;
function saveUpload(kind, filename, data) {
  const ext = path.extname(filename).slice(1).toLowerCase();
  const base = path.basename(filename, path.extname(filename)).replace(/[^\w.-]/g, "");
  if (!base || !SAFE_EXT.test(ext)) throw new Error(`Refusing file name ${filename}`);
  const dir = path.join(UPLOADS_DIR, kind);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${base}.${ext}`), data);
  return `/uploads/${kind}/${base}.${ext}`;
}
function dataFile(name) {
  const target = path.join(DATA_DIR, name);
  const legacy = path.join(process.cwd(), name);
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(target) && fs.existsSync(legacy)) fs.copyFileSync(legacy, target);
  } catch (e) {
    console.error(`[CHILS DATA] Could not prepare ${name}:`, e.message);
  }
  return target;
}
function adoptLegacyUploads(appDir) {
  for (const root of [path.join(appDir, "public", "uploads"), path.join(appDir, "dist", "uploads")]) {
    for (const kind of ["reviews", "custom_designs"]) {
      const from = path.join(root, kind);
      if (!fs.existsSync(from)) continue;
      const to = path.join(UPLOADS_DIR, kind);
      fs.mkdirSync(to, { recursive: true });
      for (const f of fs.readdirSync(from)) {
        if (!fs.existsSync(path.join(to, f))) fs.copyFileSync(path.join(from, f), path.join(to, f));
      }
    }
  }
}

// slackBot.ts
var STATUSES = [
  { value: "processing", label: "Processing" },
  { value: "on-hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled", risky: true },
  { value: "refunded", label: "Refunded", risky: true },
  { value: "failed", label: "Failed", risky: true }
];
var UNPAID = ["pending", "failed", "cancelled", "checkout-draft", "refunded", "trash"];
var WHATSAPP_US = "+91 78420 70404";
var ABANDON_AFTER = 20 * 6e4;
var ABANDON_WINDOW = 6 * 36e5;
var WATCH_EVERY = 5 * 6e4;
var SUMMARY_HOUR = 9;
var web = null;
var wc = null;
var channel = "";
var rooms = { unpaid: "", returns: "", summary: "", refunds: "" };
var phonepe = null;
var refundLocks = /* @__PURE__ */ new Set();
var allowed = [];
var adminBase = "https://api.chilsandco.com";
var money = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;
var can = (user) => !allowed.length || allowed.includes(user);
var adminLink = (id) => `${adminBase}/wp-admin/post.php?post=${id}&action=edit`;
var plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
var metaOf = (order, key) => (order.meta_data || []).find((m) => m.key === key)?.value;
var isPaid = (order) => !UNPAID.includes(order.status);
var isPickup = (order) => (order.shipping_lines || []).some((s) => /pickup|store/i.test(s.method_title || s.method_id || ""));
var IST = 5.5 * 36e5;
var istDay = (t = Date.now()) => new Date(t + IST).toISOString().slice(0, 10);
var istHour = (t = Date.now()) => new Date(t + IST).getUTCHours();
var istMidnight = (t = Date.now()) => {
  const d = new Date(t + IST);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() - IST;
};
var istLabel = (t) => new Date(t).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short" });
var istTime = (t) => new Date(t).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
var createdAt = (order) => (/* @__PURE__ */ new Date(`${order.date_created_gmt || order.date_created}Z`)).getTime();
var ago = (t) => {
  const m = Math.round((Date.now() - t) / 6e4);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"} ago`;
  return `${Math.round(h / 24)} days ago`;
};
var state = { abandoned: {}, returns: {}, refunds: {} };
var stateFile = "";
function loadState() {
  stateFile = (process.env.SLACK_STATE_FILE || "").trim() || dataFile(".slack-state.json");
  try {
    state = { abandoned: {}, returns: {}, refunds: {}, ...JSON.parse(fs2.readFileSync(stateFile, "utf8")) };
  } catch {
  }
}
function saveState() {
  const cutoff = Date.now() - 14 * 864e5;
  for (const [id, t] of Object.entries(state.abandoned)) if (t < cutoff) delete state.abandoned[id];
  try {
    fs2.writeFileSync(stateFile, JSON.stringify(state));
  } catch (err) {
    console.warn("[SLACK] Could not save the bot's memory file:", err.message);
  }
}
async function ordersBetween(from, to, extra = {}) {
  const out = [];
  for (let page2 = 1; page2 <= 10; page2++) {
    const { data } = await wc("get", "orders", {
      after: new Date(from).toISOString(),
      ...to ? { before: new Date(to).toISOString() } : {},
      dates_are_gmt: true,
      per_page: 100,
      page: page2,
      ...extra
    });
    out.push(...data);
    if (data.length < 100) break;
  }
  return out;
}
function itemLines(order) {
  return (order.line_items || []).map((i) => {
    const size = (i.meta_data || []).find((m) => /size/i.test(m.display_key || m.key))?.display_value;
    return `\u2022 ${i.name}${size ? ` (${size})` : ""} \xD7 ${i.quantity}`;
  }).join("\n") || "\u2022 (no items listed)";
}
function addressText(order) {
  const a = order.shipping?.address_1 ? order.shipping : order.billing || {};
  const name = `${a.first_name || ""} ${a.last_name || ""}`.trim() || `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();
  const place = [a.city, a.state].filter(Boolean).join(", ");
  const lines = [name, a.company, a.address_1, a.address_2, [place, a.postcode].filter(Boolean).join(" - "), a.country && a.country !== "IN" ? a.country : ""].filter(Boolean);
  const phone = a.phone || order.billing?.phone;
  if (phone) lines.push(`\u{1F4DE} ${phone}`);
  return lines.join("\n") || "No address on the order";
}
var productImages = /* @__PURE__ */ new Map();
async function hydrateImages(data) {
  try {
    const orders = (Array.isArray(data) ? data : [data]).filter((o) => o && Array.isArray(o.line_items));
    const missing = /* @__PURE__ */ new Set();
    for (const o of orders) for (const i of o.line_items) if (!i.image?.src && i.product_id && !productImages.has(i.product_id)) missing.add(i.product_id);
    if (missing.size && wc) {
      const ids = [...missing].slice(0, 100);
      try {
        const { data: prods } = await wc("get", "products", { include: ids.join(","), per_page: 100 });
        for (const p of prods || []) if (p.images?.[0]?.src) productImages.set(p.id, p.images[0].src);
      } catch (err) {
        console.warn("[SLACK] Could not look up product pictures:", err?.message);
      }
      for (const id of ids) if (!productImages.has(id)) productImages.set(id, "");
    }
    for (const o of orders) for (const i of o.line_items) if (!i.image?.src && productImages.get(i.product_id)) i.image = { ...i.image || {}, src: productImages.get(i.product_id) };
  } catch {
  }
}
function itemBlocks(order) {
  return (order.line_items || []).slice(0, 8).map((i) => {
    const size = (i.meta_data || []).find((m) => /size/i.test(m.display_key || m.key))?.display_value;
    const block = {
      type: "section",
      text: { type: "mrkdwn", text: `*${i.name}*${size ? `
Size: ${size}` : ""}
Qty: ${i.quantity} \xB7 ${money(i.total)}` }
    };
    if (i.image?.src) block.accessory = { type: "image", image_url: i.image.src, alt_text: i.name };
    return block;
  });
}
function stripImages(blocks) {
  return blocks.filter((b) => b.type !== "image").map((b) => b.accessory?.type === "image" ? { ...b, accessory: void 0 } : b);
}
async function withPictureFallback(send2, blocks) {
  try {
    return await send2(blocks);
  } catch (err) {
    if (!/invalid_blocks|image/i.test(`${err?.data?.error || ""} ${err?.message || ""}`)) throw err;
    console.warn("[SLACK] Slack could not load a picture; sending the card without pictures.");
    return send2(stripImages(blocks));
  }
}
function orderBlocks(order, done) {
  const pickup = isPickup(order);
  const city = order.shipping?.city || order.billing?.city || "";
  const name = `${order.billing?.first_name || ""}`.trim();
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `Order #${order.id} \xB7 ${money(order.total)}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*
${name || "\u2014"}` },
        { type: "mrkdwn", text: `*${pickup ? "Store pickup" : "Delivery to"}*
${pickup ? "Collect in store" : city || "\u2014"}` },
        { type: "mrkdwn", text: `*Status*
${order.status}` },
        { type: "mrkdwn", text: `*Payment*
${order.payment_method_title || order.payment_method || "\u2014"}` }
      ]
    },
    ...itemBlocks(order),
    { type: "section", text: { type: "mrkdwn", text: `*${pickup ? "Store pickup" : "Ship to"}*
${pickup ? "Collect in store\n" : ""}${addressText(order)}` } }
  ];
  if (order.customer_note) blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Customer note:* ${order.customer_note}` } });
  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  blocks.push({
    type: "actions",
    block_id: `order_${order.id}`,
    elements: [
      { type: "button", text: { type: "plain_text", text: "Ready to ship" }, action_id: "ready_to_ship", value: String(order.id), style: "primary" },
      { type: "button", text: { type: "plain_text", text: "Create Shipment" }, action_id: "create_shipment", value: String(order.id), style: "primary" },
      {
        type: "button",
        text: { type: "plain_text", text: "Delivered in person" },
        action_id: "in_person",
        value: String(order.id),
        confirm: {
          title: { type: "plain_text", text: "Mark as delivered?" },
          text: { type: "mrkdwn", text: `Order #${order.id} will be marked completed and the customer gets WooCommerce's completed-order email.` },
          confirm: { type: "plain_text", text: "Mark completed" },
          deny: { type: "plain_text", text: "Cancel" }
        }
      },
      {
        type: "static_select",
        action_id: "set_status",
        placeholder: { type: "plain_text", text: "Change status" },
        options: STATUSES.map((s) => ({ text: { type: "plain_text", text: s.label }, value: `${order.id}:${s.value}` })),
        confirm: {
          title: { type: "plain_text", text: "Change the order status?" },
          text: { type: "mrkdwn", text: "This updates WooCommerce and the customer's order page. Cancelled orders return their stock. Refunded does not send money back: type `refund 1234` to send it through PhonePe." },
          confirm: { type: "plain_text", text: "Change it" },
          deny: { type: "plain_text", text: "Keep it" }
        }
      },
      { type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) }
    ]
  });
  return blocks;
}
function waNumber(phone) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return /^91\d{10}$/.test(d) ? d : "";
}
function abandonedBlocks(order, done) {
  const name = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();
  const first = `${order.billing?.first_name || ""}`.trim() || "there";
  const items = order.line_items || [];
  const firstItem = items[0]?.name || "your tees";
  const more = items.length > 1 ? ` and ${plural(items.length - 1, "more item")}` : "";
  const wa = waNumber(order.billing?.phone);
  const text = `Hi ${first}, this is CHILS & CO. Your order for ${firstItem}${more} didn't go through at payment. Want a hand finishing it? Just reply here.`;
  const failed = order.status === "failed";
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `Not paid \xB7 ${money(order.total)} \xB7 #${order.id}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*
${name || "\u2014"}` },
        { type: "mrkdwn", text: `*Phone*
${order.billing?.phone || "\u2014"}` },
        { type: "mrkdwn", text: `*What happened*
${failed ? "Payment failed" : "Left at the payment page"}` },
        { type: "mrkdwn", text: `*Started*
${istTime(createdAt(order))} (${ago(createdAt(order))})` }
      ]
    },
    { type: "section", text: { type: "mrkdwn", text: itemLines(order) } }
  ];
  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  const actions = [];
  if (wa) actions.push({ type: "button", text: { type: "plain_text", text: `WhatsApp ${first}` }, action_id: "open_whatsapp", url: `https://wa.me/${wa}?text=${encodeURIComponent(text)}`, style: "primary" });
  if (!done) actions.push({ type: "button", text: { type: "plain_text", text: "Mark followed up" }, action_id: "followed_up", value: String(order.id) });
  actions.push({ type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) });
  blocks.push({ type: "actions", elements: actions });
  return blocks;
}
async function checkAbandoned() {
  const now = Date.now();
  const recent = await ordersBetween(now - ABANDON_WINDOW);
  const paidLater = /* @__PURE__ */ new Map();
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
    await web.chat.postMessage({ channel: rooms.unpaid, text: `Not paid: ${money(o.total)} from ${o.billing?.first_name || "a customer"} (#${o.id})`, blocks: abandonedBlocks(o) });
    console.log(`[SLACK] Posted unpaid checkout #${o.id}`);
  }
  saveState();
}
async function summaryText(morning = false) {
  const today = istMidnight();
  const yesterday = today - 864e5;
  const [y, processing, returns] = await Promise.all([
    ordersBetween(yesterday, today),
    wc("get", "orders", { status: "processing", per_page: 100 }).then((r) => r.data),
    wc("get", "orders", { status: "return-requested", per_page: 100 }).then((r) => r.data)
  ]);
  const paid = y.filter(isPaid);
  const sales = paid.reduce((n, o) => n + Number(o.total || 0), 0);
  const counts = /* @__PURE__ */ new Map();
  for (const o of paid) for (const i of o.line_items || []) counts.set(i.name, (counts.get(i.name) || 0) + Number(i.quantity || 0));
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const unpaid = y.filter((o) => ["pending", "failed"].includes(o.status) && Number(o.total) > 0);
  const unpaidValue = unpaid.reduce((n, o) => n + Number(o.total || 0), 0);
  const packed = processing.filter((o) => metaOf(o, "_chils_packed_by"));
  const toPack = processing.filter((o) => !metaOf(o, "_chils_packed_by"));
  const oldest = toPack.length ? Math.min(...toPack.map(createdAt)) : 0;
  const lines = [`*${morning ? "Good morning. " : ""}Here's yesterday, ${istLabel(yesterday)}:*`];
  lines.push(paid.length ? `\u2022 Orders: ${paid.length}, ${money(sales)}${best ? ` \xB7 best seller ${best[0]} (\xD7${best[1]})` : ""}` : "\u2022 No paid orders.");
  if (unpaid.length) lines.push(`\u2022 Didn't pay: ${plural(unpaid.length, "checkout")} worth ${money(unpaidValue)} reached PhonePe but ${unpaid.length === 1 ? "wasn't" : "weren't"} paid`);
  lines.push("", "*Today's list:*");
  const todo = [];
  if (toPack.length) todo.push(`\u2022 To pack: ${plural(toPack.length, "paid order")} (oldest ${ago(oldest)}): ${toPack.slice(0, 6).map((o) => `#${o.id}`).join(", ")}`);
  if (packed.length) todo.push(`\u2022 Packed, waiting for pickup or Shiprocket: ${packed.map((o) => `#${o.id}`).join(", ")}`);
  if (returns.length) todo.push(`\u2022 Returns waiting for a decision: ${returns.length} (type \`returns\`)`);
  lines.push(...todo.length ? todo : ["\u2022 Nothing waiting. \u{1F389}"]);
  return lines.join("\n");
}
async function maybeSendSummary() {
  const day = istDay();
  if (state.summaryDay === day || istHour() < SUMMARY_HOUR || istHour() >= 12) return;
  state.summaryDay = day;
  saveState();
  await web.chat.postMessage({ channel: rooms.summary, text: await summaryText(true) });
  console.log("[SLACK] Posted the morning summary");
}
function returnRequest(order) {
  const ours = metaOf(order, "_chils_return_request");
  const raw = metaOf(order, "wps_rma_return_product");
  let entries = [];
  try {
    entries = Object.values(typeof raw === "string" ? JSON.parse(raw) : raw || {});
    const saved = typeof ours === "string" ? JSON.parse(ours) : ours;
    if (saved?.subject) entries = [{ ...entries[entries.length - 1] || {}, subject: saved.subject }];
  } catch {
  }
  const req = entries[entries.length - 1] || {};
  const subject = String(req.subject || req.reason || req.message || "");
  const pick = (label) => subject.match(new RegExp(`${label}:\\s*(.*)`))?.[1]?.trim() || "";
  const products = req.products || [];
  const names = new Map((order.line_items || []).map((i) => [String(i.product_id), i.name]));
  for (const p of products) {
    const line = (order.line_items || []).find((i) => String(i.id) === String(p.item_id));
    if (line && !names.has(String(p.product_id))) names.set(String(p.product_id), line.name);
  }
  const wants = subject.split("\n").filter((l) => l.startsWith("- Product ID:")).map((l) => {
    const [, id, qty, act] = l.match(/Product ID:\s*(\d+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*Action:\s*(.*)/) || [];
    return `\u2022 ${names.get(id) || `Product ${id}`} \xD7 ${qty}: ${act}`;
  });
  const value = products.reduce((n, p) => n + Number(p.price || 0) * Number(p.qty || 1), 0);
  const found = JSON.stringify(entries).match(/https?:[^"'\s,\\]+?\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"'\s,\\]*)?/gi) || [];
  const images = [.../* @__PURE__ */ new Set([...pick("Images").split(",").map((s) => s.trim()).filter((s) => /^https?:/.test(s)), ...found])];
  return {
    raw: subject.split("\n").filter((l) => l.trim() && !/^(Images|Return\/Exchange Actions|- Product ID)/.test(l.trim())).slice(0, 4).join("\n"),
    reason: pick("Reason"),
    description: pick("Description"),
    wants,
    value,
    images,
    isRefund: wants.some((w) => /:\s*Refund$/.test(w)) || !wants.length && /refund/i.test(subject)
  };
}
function returnBlocks(order, done) {
  const r = returnRequest(order);
  const name = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();
  const detail = [
    `*Reason:* ${r.reason || r.raw || "not given"}`,
    r.description ? `*Customer's note:* ${r.description}` : "",
    r.wants.length ? `*What they want:*
${r.wants.join("\n")}` : `*Items:*
${itemLines(order)}`,
    r.images.length ? `*Return photos (${r.images.length}):* ${r.images.map((u, i) => `<${u}|photo ${i + 1}>`).join(" \xB7 ")}` : "*Return photos:* none uploaded"
  ].filter(Boolean);
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `Return request \xB7 Order #${order.id}` } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer*
${name || "\u2014"}` },
        { type: "mrkdwn", text: `*Value*
${money(r.value || order.total)}` },
        { type: "mrkdwn", text: `*Ordered*
${istLabel(createdAt(order))}` },
        { type: "mrkdwn", text: `*Status*
${order.status}` }
      ]
    },
    { type: "section", text: { type: "mrkdwn", text: detail.join("\n") } }
  ];
  blocks.push(...itemBlocks(order));
  blocks.push({ type: "section", text: { type: "mrkdwn", text: `*Address*
${addressText(order)}` } });
  for (const [i, u] of r.images.slice(0, 6).entries()) {
    blocks.push({ type: "image", image_url: u, alt_text: `Return photo ${i + 1}`, title: { type: "plain_text", text: `Return photo ${i + 1} of ${r.images.length}` } });
  }
  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  const actions = [];
  if (!done) {
    actions.push(
      {
        type: "button",
        text: { type: "plain_text", text: "Approve" },
        style: "primary",
        action_id: "return_approve",
        value: String(order.id),
        confirm: {
          title: { type: "plain_text", text: "Approve this return?" },
          text: { type: "mrkdwn", text: `Order #${order.id} moves to Return approved and the customer is emailed.${r.isRefund ? " No money moves yet: a separate refund card appears for you to send the PhonePe refund." : ""}` },
          confirm: { type: "plain_text", text: "Approve" },
          deny: { type: "plain_text", text: "Cancel" }
        }
      },
      { type: "button", text: { type: "plain_text", text: "Reject" }, style: "danger", action_id: "return_reject", value: String(order.id) }
    );
  }
  actions.push({ type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) });
  blocks.push({ type: "actions", elements: actions });
  return blocks;
}
async function waitingReturns() {
  const { data } = await wc("get", "orders", { status: "return-requested", per_page: 50 });
  return data;
}
async function checkReturns() {
  const waiting = await waitingReturns();
  const ids = new Set(waiting.map((o) => String(o.id)));
  for (const id of Object.keys(state.returns)) if (!ids.has(id)) delete state.returns[id];
  if (!state.returnsSeeded) {
    for (const o of waiting) state.returns[o.id] = Date.now();
    state.returnsSeeded = true;
    saveState();
    if (waiting.length) await web.chat.postMessage({ channel: rooms.returns, text: `${plural(waiting.length, "return request")} ${waiting.length === 1 ? "was" : "were"} already waiting before I started watching. Type \`returns\` to see them.` });
    return;
  }
  for (const o of waiting) {
    if (state.returns[o.id]) continue;
    state.returns[o.id] = Date.now();
    await hydrateImages(o);
    await withPictureFallback((b) => web.chat.postMessage({ channel: rooms.returns, text: `Return request for order #${o.id}`, blocks: b }), returnBlocks(o));
    console.log(`[SLACK] Posted return request #${o.id}`);
  }
  saveState();
}
async function approveReturn(id, who, user, ch, ts) {
  const { data: current } = await wc("get", `orders/${id}`);
  if (current.status !== "return-requested") return `Order #${id} isn't waiting on a return decision any more (it's ${current.status}). Nothing changed.`;
  const { data } = await wc("put", `orders/${id}`, { status: "return-approved" });
  await wc("post", `orders/${id}/notes`, {
    note: `Good news: your return request for order #${id} is approved. We'll be in touch shortly with the next steps.`,
    customer_note: true
  });
  await note(id, `Return approved by ${who} from Slack.`);
  const r = returnRequest(current);
  const exchangeOnly = r.wants.length > 0 && r.wants.every((w) => /exchange|swap to/i.test(w));
  const wantsRefund = !exchangeOnly;
  const refundCard = wantsRefund ? await postRefundCard(data) : "";
  console.log(`[SLACK] Return #${id} approved: ${wantsRefund ? refundCard ? "refund card posted" : "refund card could not be posted" : "exchange only, no refund card"}`);
  const refund = wantsRefund ? refundCard ? " \xB7 refund card posted below, send the money from there" : " \xB7 refund the money in PhonePe" : "";
  await updateCard(ch, ts, `Return #${id}`, returnBlocks(data, `\u2705 Approved by <@${user}> \xB7 customer emailed${refund}`));
  return "";
}
async function rejectReturn(id, reason, who, user, ch, ts) {
  const { data: current } = await wc("get", `orders/${id}`);
  if (current.status !== "return-requested") return `Order #${id} isn't waiting on a return decision any more (it's ${current.status}). Nothing changed.`;
  const { data } = await wc("put", `orders/${id}`, { status: "return-cancelled" });
  await wc("post", `orders/${id}/notes`, {
    note: `We're sorry, we can't accept the return for order #${id}.

${reason}

If you'd like to talk it through, message us on WhatsApp at ${WHATSAPP_US}.`,
    customer_note: true
  });
  await note(id, `Return rejected by ${who} from Slack. Reason given: ${reason}`);
  await updateCard(ch, ts, `Return #${id}`, returnBlocks(data, `\u2716\uFE0F Rejected by <@${user}> \xB7 customer emailed the reason`));
  return "";
}
function openRejectDialog(body, id) {
  return web.views.open({
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
            placeholder: { type: "plain_text", text: "e.g. The tee has been worn and washed, so we can't take it back." }
          }
        }
      ]
    }
  });
}
async function note(orderId, text) {
  await wc("post", `orders/${orderId}/notes`, { note: text, customer_note: false });
}
async function setStatus(orderId, status, who, extraMeta = []) {
  const { data: current } = await wc("get", `orders/${orderId}`);
  if (current.status === status) return { ...current, _unchanged: true };
  const { data } = await wc("put", `orders/${orderId}`, { status, ...extraMeta.length ? { meta_data: extraMeta } : {} });
  await note(orderId, `Status set to ${status} by ${who} from Slack.`);
  return data;
}
async function updateCard(ch, ts, text, blocks) {
  if (!ch || !ts) return;
  try {
    await withPictureFallback((b) => web.chat.update({ channel: ch, ts, text, blocks: b }), blocks);
  } catch (err) {
    console.warn("[SLACK] Could not update the message:", err?.data?.error || err.message);
  }
}
var refreshMessage = (body, order, done) => updateCard(body.channel?.id, body.message?.ts, `Order #${order.id}`, orderBlocks(order, done));
async function reply(body, text) {
  await web.chat.postMessage({ channel: body.channel?.id || channel, thread_ts: body.message?.ts, text });
}
var phonePeOrderId = (order) => String(metaOf(order, "_phonepe_transaction_id") || "");
var rupees = (n) => Math.round(n * 100) / 100;
var refundsOf = (order) => {
  try {
    const raw = metaOf(order, "_chils_phonepe_refunds");
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
var refundedSoFar = (order) => refundsOf(order).filter((r) => r.state !== "FAILED").reduce((n, r) => n + Number(r.amount || 0), 0);
var canRefund = (user) => {
  const list = (process.env.SLACK_REFUND_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list.includes(user) : can(user);
};
async function paymentInfo(order) {
  const merchantOrderId = phonePeOrderId(order);
  if (!phonepe || !merchantOrderId) return null;
  try {
    const s = await phonepe.orderStatus(merchantOrderId);
    const pay = (s.paymentDetails || [])[0] || {};
    return { merchantOrderId, state: String(s.state || ""), paid: Number(s.amount || 0) / 100, mode: String(pay.paymentMode || ""), txn: String(pay.transactionId || "") };
  } catch (err) {
    return { merchantOrderId, error: err?.message || "PhonePe did not answer" };
  }
}
function refundBlocks(order, info, done) {
  const r = returnRequest(order);
  const name = `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim();
  const paid = info && !info.error ? info.paid : 0;
  const left = rupees(Math.max(0, paid - refundedSoFar(order)));
  const suggested = rupees(Math.min(Number(r.value || order.total || 0), left));
  const ready = !!info && !info.error && info.state === "COMPLETED" && left >= 1;
  const fields = [
    { type: "mrkdwn", text: `*Customer*
${name || "\u2014"}` },
    { type: "mrkdwn", text: `*Order total*
${money(order.total)}` }
  ];
  if (info) {
    fields.push(
      { type: "mrkdwn", text: `*PhonePe payment*
${info.error ? "couldn't check" : `${info.state || "unknown"} \xB7 ${money(info.paid)}${info.mode ? ` \xB7 ${info.mode.replace(/_/g, " ").toLowerCase()}` : ""}`}` },
      { type: "mrkdwn", text: `*Already refunded*
${money(refundedSoFar(order))}` },
      { type: "mrkdwn", text: `*PhonePe order ID*
\`${info.merchantOrderId}\`` },
      { type: "mrkdwn", text: `*Left to refund*
${money(left)}` }
    );
  }
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `Refund \xB7 Order #${order.id}` } },
    { type: "section", fields }
  ];
  const detail = [r.wants.length ? `*Return:*
${r.wants.join("\n")}` : `*Items:*
${itemLines(order)}`, r.reason ? `*Reason:* ${r.reason}` : ""].filter(Boolean);
  blocks.push({ type: "section", text: { type: "mrkdwn", text: detail.join("\n") } });
  if (done) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: done }] });
  const actions = [];
  if (!done) {
    if (ready) {
      actions.push(
        {
          type: "button",
          text: { type: "plain_text", text: `Refund ${money(suggested)} via PhonePe` },
          style: "primary",
          action_id: "refund_pay",
          value: `${order.id}:${suggested}`,
          confirm: {
            title: { type: "plain_text", text: "Send this refund?" },
            text: { type: "mrkdwn", text: `*${money(suggested)}* goes back to ${name || "the customer"} through PhonePe for order #${order.id}. This moves real money and can't be undone.` },
            confirm: { type: "plain_text", text: "Send refund" },
            deny: { type: "plain_text", text: "Cancel" }
          }
        },
        { type: "button", text: { type: "plain_text", text: "Refund another amount" }, action_id: "refund_custom", value: `${order.id}:${suggested}` }
      );
    } else {
      const why = !info ? "This order wasn't paid through PhonePe, so refund it where it was paid." : info.error ? `Couldn't reach PhonePe (${info.error}). Type \`refund ${order.id}\` to try again.` : info.state !== "COMPLETED" ? `PhonePe shows this payment as ${info.state || "unknown"}, so there is nothing to refund.` : "Everything paid has already been refunded.";
      blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: why }] });
    }
  }
  actions.push({ type: "button", text: { type: "plain_text", text: "Open in WooCommerce" }, action_id: "open_admin", url: adminLink(order.id) });
  blocks.push({ type: "actions", elements: actions });
  return blocks;
}
async function postRefundCard(order) {
  try {
    const info = await paymentInfo(order);
    const res = await web.chat.postMessage({ channel: rooms.refunds, text: `Refund for order #${order.id}`, blocks: refundBlocks(order, info) });
    console.log(`[SLACK] Posted refund card #${order.id}`);
    return res.ts || "";
  } catch (err) {
    console.error("[SLACK] Refund card failed:", err?.data?.error || err.message);
    return "";
  }
}
async function startRefund(id, amount, who, user, ch, ts) {
  if (!canRefund(user)) return `<@${user}> you're not on the list of people who can send refunds. Your Slack ID is \`${user}\`: add it to SLACK_REFUND_USERS.`;
  if (!phonepe) return "PhonePe isn't connected to the bot, so I can't send refunds.";
  if (refundLocks.has(id)) return `A refund for order #${id} is already being sent. Give it a moment.`;
  refundLocks.add(id);
  try {
    const { data: order } = await wc("get", `orders/${id}`);
    const info = await paymentInfo(order);
    if (!info) return `Order #${id} wasn't paid through PhonePe, so refund it where it was paid. Nothing was sent.`;
    if (info.error) return `Couldn't reach PhonePe: ${info.error}. Nothing was sent.`;
    if (info.state !== "COMPLETED") return `PhonePe shows this payment as ${info.state || "unknown"}, not completed. Nothing was sent.`;
    amount = rupees(amount);
    const left = rupees(info.paid - refundedSoFar(order));
    if (!Number.isFinite(amount) || amount < 1) return "A refund must be at least \u20B91. Nothing was sent.";
    if (amount > left) return `Order #${id} has only ${money(left)} left to refund (${money(info.paid)} paid). Nothing was sent.`;
    const refundId = `RF${id}_${Date.now()}`;
    state.refunds[refundId] = { orderId: id, amount, ch, ts, at: Date.now(), state: "SUBMITTING" };
    saveState();
    let res;
    try {
      res = await phonepe.refund(info.merchantOrderId, refundId, Math.round(amount * 100));
    } catch (err) {
      res = await phonepe.refundStatus(refundId).catch(() => null);
      if (!res) {
        delete state.refunds[refundId];
        saveState();
        console.error("[SLACK] PhonePe refund failed:", err?.message || err);
        return `PhonePe didn't accept the refund (${err?.message || "no reason given"}). Nothing was sent.`;
      }
    }
    const st = String(res.state || "PENDING");
    state.refunds[refundId].state = st;
    saveState();
    console.log(`[SLACK] ${who} sent PhonePe refund ${refundId}: ${money(amount)}, state ${st}`);
    const rows = [...refundsOf(order), { id: refundId, amount, state: st, at: Date.now() }];
    let latest = order;
    try {
      latest = (await wc("put", `orders/${id}`, { meta_data: [{ key: "_chils_phonepe_refunds", value: JSON.stringify(rows) }] })).data;
      await note(id, `PhonePe refund of ${money(amount)} sent by ${who} from Slack. Refund ref ${refundId}, state ${st}.`);
    } catch (err) {
      console.error("[SLACK] Refund sent but the order couldn't be updated:", err?.message || err);
    }
    await updateCard(ch, ts, `Refund #${id}`, refundBlocks(latest, info, `\u23F3 ${money(amount)} refund sent by <@${user}> \xB7 PhonePe says ${st} \xB7 ref \`${refundId}\` \xB7 I'll update here when it finishes`));
    if (st === "COMPLETED" || st === "FAILED") await applyRefundState(refundId, st, true);
    return "";
  } finally {
    refundLocks.delete(id);
  }
}
async function applyRefundState(refundId, st, force = false) {
  const job = state.refunds[refundId];
  if (!job || !force && job.state === st) return;
  job.state = st;
  saveState();
  const id = job.orderId;
  const { data: order } = await wc("get", `orders/${id}`);
  const rows = refundsOf(order).map((r) => r.id === refundId ? { ...r, state: st } : r);
  if (!rows.some((r) => r.id === refundId)) rows.push({ id: refundId, amount: job.amount, state: st, at: job.at });
  await wc("put", `orders/${id}`, { meta_data: [{ key: "_chils_phonepe_refunds", value: JSON.stringify(rows) }] });
  if (st !== "COMPLETED" && st !== "FAILED") return;
  let latest = order;
  if (st === "COMPLETED") {
    await wc("post", `orders/${id}/refunds`, { amount: String(job.amount), reason: "Return refunded through PhonePe (from Slack)", api_refund: false });
    await note(id, `PhonePe confirmed the refund of ${money(job.amount)} (ref ${refundId}).`);
    latest = (await wc("get", `orders/${id}`)).data;
    await web.chat.postMessage({ channel: job.ch, thread_ts: job.ts, text: `\u2705 Refund of ${money(job.amount)} is complete for order #${id}. PhonePe returns it to the customer's original payment method, usually within 3\u20135 working days.` });
  } else {
    await note(id, `PhonePe could not complete the refund of ${money(job.amount)} (ref ${refundId}). No money moved.`);
    await web.chat.postMessage({ channel: job.ch, thread_ts: job.ts, text: `\u26A0\uFE0F PhonePe couldn't complete the ${money(job.amount)} refund for order #${id}. No money moved. Type \`refund ${id}\` to post a fresh refund card and try again.` });
  }
  const info = await paymentInfo(latest);
  await updateCard(job.ch, job.ts, `Refund #${id}`, refundBlocks(latest, info, st === "COMPLETED" ? `\u2705 ${money(job.amount)} refunded through PhonePe \xB7 ref \`${refundId}\`` : `\u26A0\uFE0F ${money(job.amount)} refund failed at PhonePe \xB7 ref \`${refundId}\``));
  delete state.refunds[refundId];
  saveState();
}
async function checkRefunds() {
  if (!phonepe) return;
  for (const [refundId, job] of Object.entries(state.refunds)) {
    if (refundLocks.has(job.orderId)) continue;
    const res = await phonepe.refundStatus(refundId).catch(() => null);
    if (res?.state) await applyRefundState(refundId, String(res.state));
    else if (job.state === "SUBMITTING" && Date.now() - job.at > 10 * 6e4) {
      delete state.refunds[refundId];
      saveState();
    }
  }
}
async function openRefundDialog(body, value) {
  const [id, suggested] = String(value).split(":");
  return web.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "refund_custom_submit",
      private_metadata: JSON.stringify({ id, ch: body.channel?.id, ts: body.message?.ts }),
      title: { type: "plain_text", text: "Refund amount" },
      submit: { type: "plain_text", text: "Send refund" },
      close: { type: "plain_text", text: "Cancel" },
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `How much should go back to the customer for order #${id}? This is sent through PhonePe straight away.` } },
        {
          type: "input",
          block_id: "amount",
          label: { type: "plain_text", text: "Amount in rupees" },
          element: { type: "plain_text_input", action_id: "value", initial_value: suggested && Number(suggested) > 0 ? suggested : void 0 }
        }
      ]
    }
  });
}
async function onAction(body) {
  const action = body.actions?.[0];
  if (!action || ["open_admin", "open_whatsapp"].includes(action.action_id)) return;
  const user = body.user?.id;
  const who = body.user?.username || body.user?.name || user;
  if (!can(user)) return reply(body, `<@${user}> you're not on the list of people who can change orders.`);
  console.log(`[SLACK] ${who} pressed ${action.action_id} ${action.value || action.selected_option?.value || ""}`);
  try {
    if (action.action_id === "return_reject") {
      await openRejectDialog(body, action.value);
    } else if (action.action_id === "return_approve") {
      const msg = await approveReturn(action.value, who, user, body.channel?.id, body.message?.ts);
      if (msg) await reply(body, msg);
    } else if (action.action_id === "refund_pay") {
      const [id, amount] = String(action.value).split(":");
      const msg = await startRefund(id, Number(amount), who, user, body.channel?.id, body.message?.ts);
      if (msg) await reply(body, msg);
    } else if (action.action_id === "refund_custom") {
      if (!canRefund(user)) return reply(body, `<@${user}> you're not on the list of people who can send refunds. Your Slack ID is \`${user}\`: add it to SLACK_REFUND_USERS.`);
      await openRefundDialog(body, action.value);
    } else if (action.action_id === "followed_up") {
      const id = action.value;
      const { data } = await wc("get", `orders/${id}`);
      await note(id, `Customer followed up about the unpaid checkout (by ${who}, from Slack).`);
      await updateCard(body.channel?.id, body.message?.ts, `Not paid #${id}`, abandonedBlocks(data, `\u{1F4AC} Followed up by <@${user}>`));
    } else if (action.action_id === "ready_to_ship") {
      const id = action.value;
      try {
        await note(id, `Packed and ready to ship (by ${who}, from Slack).`);
        const { data } = await wc("put", `orders/${id}`, { meta_data: [{ key: "_chils_packed_by", value: String(who) }] });
        await refreshMessage(body, data, `\u{1F4E6} Packed by <@${user}> \xB7 ${isPickup(data) ? "ready for pickup" : "ready for Shiprocket"}`);
        await reply(body, `\u2705 Order #${id} marked as ready to ship`);
      } catch (err) {
        await reply(body, `\u274C Error: ${err.message}`);
      }
    } else if (action.action_id === "create_shipment") {
      const id = action.value;
      try {
        const res = await fetch(`${process.env.SERVER_URL || "https://chilsandco.com"}/api/admin/create-shipment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id })
        }).then((r) => r.json());
        if (res.awb) {
          const { data } = await wc("get", `orders/${id}`);
          await note(id, `Shipment created: AWB ${res.awb}, Courier: ${res.courier} (by ${who}, from Slack).${res.labelDownloadUrl ? ` Label: ${res.labelDownloadUrl}` : ""}`);
          await reply(body, `\u2705 Shipment created for order #${id}
*AWB:* ${res.awb}
*Courier:* ${res.courier}${res.labelDownloadUrl ? `
<${res.labelDownloadUrl}|\u{1F4C4} Download Label>` : ""}`);
          await refreshMessage(body, data, `\u{1F69A} Shipment created, AWB: ${res.awb} \xB7 initiated by <@${user}>`);
        } else if (res.shipmentId) {
          await note(id, `Order sent to Shiprocket (shipment ${res.shipmentId}) by ${who} from Slack. No courier assigned yet: ${res.courierError || "unknown reason"}.`);
          await reply(body, `\u26A0\uFE0F Order #${id} is in Shiprocket, but no courier was assigned yet.
*Why:* ${res.courierError || "unknown"}
Fix that (often the Shiprocket wallet balance) and press Create Shipment again, or finish it in <${res.dashboardUrl}|Shiprocket>.`);
        } else {
          await reply(body, `\u274C Shipment creation failed: ${res.message}`);
        }
      } catch (err) {
        await reply(body, `\u274C Error creating shipment: ${err.message}`);
      }
    } else if (action.action_id === "in_person") {
      const id = action.value;
      const data = await setStatus(id, "completed", who, [{ key: "_chils_delivered_in_person", value: "yes" }]);
      if (data._unchanged) return reply(body, `Order #${id} is already completed. Nothing changed and no new email was sent.`);
      await refreshMessage(body, data, `\u{1F91D} Delivered in person by <@${user}> \xB7 completed, customer emailed`);
    } else if (action.action_id === "set_status") {
      const [id, status] = String(action.selected_option?.value || "").split(":");
      if (!id || !STATUSES.some((s) => s.value === status)) return;
      const data = await setStatus(id, status, who);
      if (data._unchanged) return reply(body, `Order #${id} is already ${status}. Nothing changed.`);
      const extra = status === "refunded" ? " \xB7 remember to refund the money in PhonePe" : "";
      await refreshMessage(body, data, `Status set to *${status}* by <@${user}>${extra}`);
    }
  } catch (err) {
    console.error("[SLACK] Action failed:", err?.response?.data || err?.data || err.message);
    await reply(body, `Couldn't do that: ${err?.response?.data?.message || err?.data?.error || err.message}`);
  }
}
async function onViewSubmit(body) {
  if (body.view?.callback_id === "refund_custom_submit") {
    const user2 = body.user?.id;
    const who2 = body.user?.username || body.user?.name || user2;
    const { id: id2, ch: ch2, ts: ts2 } = JSON.parse(body.view.private_metadata || "{}");
    const amount = Number(String(body.view.state?.values?.amount?.value?.value || "").replace(/[₹,\s]/g, ""));
    try {
      const msg = await startRefund(id2, amount, who2, user2, ch2, ts2);
      if (msg) await web.chat.postMessage({ channel: ch2 || rooms.refunds, thread_ts: ts2, text: msg });
    } catch (err) {
      console.error("[SLACK] Refund failed:", err?.response?.data || err.message);
      await web.chat.postMessage({ channel: ch2 || rooms.refunds, thread_ts: ts2, text: `Couldn't send the refund for order #${id2}: ${err?.response?.data?.message || err.message}` });
    }
    return;
  }
  if (body.view?.callback_id !== "return_reject_submit") return;
  const user = body.user?.id;
  const who = body.user?.username || body.user?.name || user;
  const { id, ch, ts } = JSON.parse(body.view.private_metadata || "{}");
  const reason = String(body.view.state?.values?.reason?.value?.value || "").trim();
  if (!can(user) || !id || !reason) return;
  console.log(`[SLACK] ${who} rejected return ${id}`);
  try {
    const msg = await rejectReturn(id, reason, who, user, ch, ts);
    if (msg) await web.chat.postMessage({ channel: ch || channel, thread_ts: ts, text: msg });
  } catch (err) {
    console.error("[SLACK] Reject failed:", err?.response?.data || err.message);
    await web.chat.postMessage({ channel: ch || channel, thread_ts: ts, text: `Couldn't reject return #${id}: ${err?.response?.data?.message || err.message}` });
  }
}
var HELP = [
  "*Things I understand:*",
  "\u2022 `status 1234`: show an order with its buttons",
  "\u2022 `pending`: paid orders not packed yet",
  "\u2022 `today`: today's orders and sales",
  "\u2022 `summary`: the morning summary, right now",
  "\u2022 `returns`: return requests waiting for a decision",
  "\u2022 `refund 1234`: post the PhonePe refund card for an order",
  "",
  "_On my own I post new orders here, unpaid checkouts in #unpaid-checkouts, return requests in #returns and a summary in #daily-summary every morning at 9. These commands work in any of those channels._"
].join("\n");
async function onMessage(event) {
  if (event.bot_id || event.subtype || !event.text) return;
  const text = String(event.text).trim().toLowerCase().replace(/<@[^>]+>\s*/g, "");
  const say = (t, blocks) => web.chat.postMessage({ channel: event.channel, thread_ts: event.ts, text: t, ...blocks ? { blocks } : {} });
  try {
    const status = text.match(/^(?:status|order)\s*#?(\d+)$/);
    if (status) {
      const { data } = await wc("get", `orders/${status[1]}`);
      return say(`Order #${data.id}`, data.status === "return-requested" ? returnBlocks(data) : orderBlocks(data));
    }
    if (text === "pending") {
      const { data } = await wc("get", "orders", { status: "processing", per_page: 20 });
      if (!data.length) return say("Nothing waiting. Every paid order is packed or done. \u{1F389}");
      return say(`*${plural(data.length, "paid order")} waiting:*
` + data.map((o) => `\u2022 #${o.id} \xB7 ${money(o.total)} \xB7 ${o.shipping?.city || o.billing?.city || ""}${metaOf(o, "_chils_packed_by") ? " \xB7 packed" : ""}`).join("\n"));
    }
    if (text === "today") {
      const data = await ordersBetween(istMidnight());
      const paid = data.filter(isPaid);
      const total = paid.reduce((n, o) => n + Number(o.total || 0), 0);
      return say(`*Today:* ${plural(paid.length, "order")}, ${money(total)}.`);
    }
    if (text === "summary") return say(await summaryText());
    if (text === "returns") {
      const waiting = await waitingReturns();
      if (!waiting.length) return say("No return requests waiting. \u{1F389}");
      await say(`*${plural(waiting.length, "return request")} waiting for a decision:*`);
      for (const o of waiting.slice(0, 10)) await say(`Return request for order #${o.id}`, returnBlocks(o));
      return;
    }
    const dbg = text.match(/^debug\s*#?(\d+)$/);
    if (dbg) {
      const { data } = await wc("get", `orders/${dbg[1]}`);
      const lines = (data.meta_data || []).filter((m) => /rma|return|refund|exchange|reason|image|photo/i.test(m.key)).map((m) => `\u2022 \`${m.key}\`: ${(typeof m.value === "string" ? m.value : JSON.stringify(m.value)).replace(/data:image[^"\s]{40,}/g, "[base64 image]").slice(0, 600)}`);
      const notes = await wc("get", `orders/${dbg[1]}/notes`).then((r) => (r.data || []).map((n) => `\u2022 ${String(n.note).slice(0, 200)}`).slice(0, 8)).catch(() => []);
      return say(`Debug #${dbg[1]}`, [{ type: "section", text: { type: "mrkdwn", text: `*Return data on #${dbg[1]}*
${lines.join("\n") || "none found"}

*Notes*
${notes.join("\n") || "none"}`.slice(0, 2900) } }]);
    }
    const refund = text.match(/^refund\s*#?(\d+)$/);
    if (refund) {
      const { data } = await wc("get", `orders/${refund[1]}`);
      if (!phonePeOrderId(data)) return say(`Order #${data.id} wasn't paid through PhonePe, so there is no PhonePe refund to send.`);
      const ts = await postRefundCard(data);
      return say(ts ? `Refund card for order #${data.id} posted${rooms.refunds === event.channel ? " below" : ` in <#${rooms.refunds}>`}.` : `Couldn't post the refund card for #${data.id}. Check the logs.`);
    }
    if (text === "help") return say(HELP);
  } catch (err) {
    console.error("[SLACK] Command failed:", err?.response?.data || err.message);
    await say(`Couldn't do that: ${err?.response?.data?.message || err.message}`);
  }
}
async function safely(name, job) {
  try {
    await job();
  } catch (err) {
    console.error(`[SLACK] ${name} check failed:`, err?.response?.data?.message || err?.data?.error || err.message);
  }
}
async function startSlackBot(opts) {
  const botToken = (process.env.SLACK_BOT_TOKEN || "").trim();
  const appToken = (process.env.SLACK_APP_TOKEN || "").trim();
  channel = (process.env.SLACK_ORDERS_CHANNEL || "").trim();
  rooms.unpaid = (process.env.SLACK_UNPAID_CHANNEL || "").trim() || channel;
  rooms.returns = (process.env.SLACK_RETURNS_CHANNEL || "").trim() || channel;
  rooms.summary = (process.env.SLACK_SUMMARY_CHANNEL || "").trim() || channel;
  rooms.refunds = (process.env.SLACK_REFUNDS_CHANNEL || "").trim() || rooms.returns;
  if (!botToken || !appToken || !channel) {
    console.log("[SLACK] Order bot off (SLACK_BOT_TOKEN, SLACK_APP_TOKEN or SLACK_ORDERS_CHANNEL not set).");
    return;
  }
  allowed = (process.env.SLACK_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  adminBase = opts.adminUrl.replace(/\/$/, "");
  const rawWc = opts.wc;
  wc = async (method, ...args) => {
    const res = await rawWc(method, ...args);
    if (method === "get" && typeof args[0] === "string" && /^orders(\/\d+)?$/.test(args[0])) await hydrateImages(res?.data);
    return res;
  };
  phonepe = opts.phonepe || null;
  web = new WebClient(botToken);
  loadState();
  const socket = new SocketModeClient({ appToken });
  socket.on("interactive", async ({ body, ack }) => {
    await ack();
    if (body.type === "block_actions") onAction(body);
    else if (body.type === "view_submission") onViewSubmit(body);
  });
  socket.on("message", async ({ event, ack }) => {
    await ack();
    onMessage(event);
  });
  socket.on("app_mention", async ({ event, ack }) => {
    await ack();
    onMessage(event);
  });
  try {
    await socket.start();
    console.log("[SLACK] Order bot connected.");
  } catch (err) {
    console.error("[SLACK] Order bot could not connect:", err?.data?.error || err.message);
    return;
  }
  const watch = async () => {
    await safely("Unpaid checkout", checkAbandoned);
    await safely("Returns", checkReturns);
    await safely("Refunds", checkRefunds);
    await safely("Morning summary", maybeSendSummary);
  };
  setTimeout(watch, 3e4);
  setInterval(watch, WATCH_EVERY);
}
async function notifyNewOrder(order) {
  if (!web || !channel || !order?.id) return;
  try {
    await hydrateImages(order);
    await withPictureFallback((b) => web.chat.postMessage({ channel, text: `New order #${order.id} \xB7 ${money(order.total)}`, blocks: b }), orderBlocks(order));
  } catch (err) {
    console.error("[SLACK] New-order message failed:", err?.data?.error || err.message);
  }
}
async function notifyShipping(orderId, trackingStatus, newStatus) {
  if (!web || !channel) return;
  const s = String(trackingStatus).toLowerCase();
  const icon = /deliver/.test(s) && !/undeliver|fail/.test(s) ? "\u2705" : /rto|return|fail|undeliver|lost|damage/.test(s) ? "\u26A0\uFE0F" : "";
  if (!icon) return;
  const extra = newStatus === "completed" ? " \xB7 marked completed, customer emailed" : " \xB7 needs a look";
  try {
    await web.chat.postMessage({ channel, text: `${icon} Order #${orderId}: ${trackingStatus}${extra}  <${adminLink(orderId)}|Open>` });
  } catch (err) {
    console.error("[SLACK] Shipping message failed:", err?.data?.error || err.message);
  }
}
async function notifyRefund(order, amount) {
  if (!web || !channel || !order?.id) return;
  const refundAmount = amount || order.total;
  try {
    await web.chat.postMessage({
      channel,
      text: `\u{1F4B0} Refund processed for order #${order.id} \xB7 ${money(refundAmount)}`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: `\u{1F4B0} *Refund processed*
Order #${order.id} \xB7 ${money(refundAmount)}
Customer: ${order.billing?.first_name || ""} ${order.billing?.last_name || ""}` }
        },
        { type: "divider" },
        {
          type: "section",
          text: { type: "mrkdwn", text: `<${adminLink(order.id)}|Open in WooCommerce>` }
        }
      ]
    });
  } catch (err) {
    console.error("[SLACK] Refund message failed:", err?.data?.error || err.message);
  }
}

// metaCapi.ts
import axios from "axios";
import crypto from "crypto";
var API_VERSION = "v21.0";
var pixelId = () => process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || "";
var token = () => process.env.META_CAPI_TOKEN || "";
var metaEnabled = () => !!(pixelId() && token());
var sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
var norm = (v) => String(v ?? "").trim().toLowerCase();
var hashed = (v) => norm(v) ? sha256(norm(v)) : void 0;
var phoneDigits = (v) => {
  const d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`;
  return d;
};
function readCookie(header, name) {
  const m = (header || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : void 0;
}
function browserContext(req) {
  const cookie = req.headers.cookie;
  return {
    fbp: readCookie(cookie, "_fbp"),
    fbc: readCookie(cookie, "_fbc"),
    ua: req.headers["user-agent"],
    ip: req.ip,
    url: req.headers.referer
  };
}
async function send(event) {
  if (!metaEnabled()) return;
  const body = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  try {
    await axios.post(`https://graph.facebook.com/${API_VERSION}/${pixelId()}/events`, body, {
      params: { access_token: token() },
      timeout: 8e3
    });
  } catch (err) {
    console.error("[CHILS & CO. META] Conversions API failed:", err?.response?.data?.error?.message || err?.message);
  }
}
var userData = (ctx, extra = {}) => {
  const u = {
    client_ip_address: ctx.ip,
    client_user_agent: ctx.ua,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
    ...extra
  };
  Object.keys(u).forEach((k) => (u[k] === void 0 || u[k] === "") && delete u[k]);
  return u;
};
function sendAddToCart(ctx, eventId, data) {
  return send({
    event_name: "AddToCart",
    event_time: Math.floor(Date.now() / 1e3),
    event_id: eventId,
    action_source: "website",
    event_source_url: data.url || ctx.url,
    user_data: userData(ctx),
    custom_data: {
      currency: "INR",
      value: data.value,
      content_type: "product",
      content_ids: data.contentIds,
      ...data.contentName ? { content_name: data.contentName } : {}
    }
  });
}
var sentPurchases = /* @__PURE__ */ new Set();
var ORDER_META_KEYS = { fbp: "_meta_fbp", fbc: "_meta_fbc", ua: "_meta_ua", ip: "_meta_ip", url: "_meta_url" };
function orderMetaFrom(ctx) {
  return Object.keys(ORDER_META_KEYS).filter((k) => ctx[k]).map((k) => ({ key: ORDER_META_KEYS[k], value: String(ctx[k]) }));
}
function sendPurchase(order) {
  if (!order?.id || !metaEnabled()) return;
  const id = String(order.id);
  if (sentPurchases.has(id)) return;
  sentPurchases.add(id);
  const meta = (key) => (order.meta_data || []).find((m) => m.key === key)?.value;
  const ctx = {
    fbp: meta(ORDER_META_KEYS.fbp),
    fbc: meta(ORDER_META_KEYS.fbc),
    ua: meta(ORDER_META_KEYS.ua),
    ip: meta(ORDER_META_KEYS.ip),
    url: meta(ORDER_META_KEYS.url)
  };
  const b = order.billing || {};
  const items = order.line_items || [];
  return send({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1e3),
    event_id: `purchase-${id}`,
    action_source: "website",
    event_source_url: ctx.url || "https://chilsandco.com/checkout",
    user_data: userData(ctx, {
      em: hashed(b.email),
      ph: phoneDigits(b.phone) ? sha256(phoneDigits(b.phone)) : void 0,
      fn: hashed(b.first_name),
      ln: hashed(b.last_name),
      ct: hashed(String(b.city || "").replace(/\s+/g, "")),
      st: hashed(String(b.state || "").replace(/\s+/g, "")),
      zp: hashed(b.postcode),
      country: hashed(b.country || "in"),
      external_id: order.customer_id ? sha256(String(order.customer_id)) : void 0
    }),
    custom_data: {
      currency: order.currency || "INR",
      value: Number(order.total) || 0,
      order_id: id,
      content_type: "product",
      content_ids: items.map((i) => String(i.product_id)),
      contents: items.map((i) => ({ id: String(i.product_id), quantity: i.quantity, item_price: Number(i.price) || void 0 })),
      num_items: items.reduce((n, i) => n + (Number(i.quantity) || 0), 0)
    }
  });
}

// mediaCache.ts
import fs3 from "fs";
import os2 from "os";
import path2 from "path";
import crypto2 from "crypto";
import axios2 from "axios";
var DIR = process.env.MEDIA_CACHE_DIR || path2.join(os2.homedir(), "chils-media-cache");
var SAFE = /^[\w\-./ ()%,+@]+$/;
var LONG = "public, max-age=2592000, stale-while-revalidate=86400";
var sharpLoad = null;
var getSharp = () => sharpLoad ??= import("sharp").then((m) => m.default).catch((e) => {
  console.warn("[CHILS MEDIA] sharp unavailable, serving originals:", e.message);
  return null;
});
var inflight = /* @__PURE__ */ new Map();
async function build(rel, width, storeUrl) {
  const sharp = await getSharp();
  const hash = crypto2.createHash("sha1").update(rel).digest("hex").slice(0, 16);
  const ext = sharp ? "webp" : path2.extname(rel).slice(1).toLowerCase() || "bin";
  const file = path2.join(DIR, String(sharp ? width : "orig"), `${hash}.${ext}`);
  const type = sharp ? "image/webp" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
  if (fs3.existsSync(file)) return { file, type };
  const src = `${storeUrl.replace(/\/$/, "")}/wp-content/uploads/${rel.split("/").map(encodeURIComponent).join("/")}`;
  const { data } = await axios2.get(src, { responseType: "arraybuffer", timeout: 15e3, headers: { "User-Agent": "chils-media" } });
  const out = sharp ? await sharp(Buffer.from(data)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer() : Buffer.from(data);
  await fs3.promises.mkdir(path2.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs3.promises.writeFile(tmp, out);
  await fs3.promises.rename(tmp, file);
  return { file, type };
}
function mediaHandler(storeUrl) {
  return async (req, res) => {
    const m = req.path.match(/^\/media\/(s\/)?(.+)$/);
    let rel = "";
    try {
      rel = m ? decodeURIComponent(m[2]) : "";
    } catch {
    }
    if (!rel || rel.includes("..") || !SAFE.test(rel)) return res.status(400).send("Bad path");
    const width = m[1] ? 640 : 1e3;
    const key = `${width}:${rel}`;
    try {
      if (!inflight.has(key)) inflight.set(key, build(rel, width, storeUrl()).finally(() => inflight.delete(key)));
      const { file, type } = await inflight.get(key);
      res.setHeader("Content-Type", type);
      res.setHeader("Cache-Control", LONG);
      res.sendFile(file);
    } catch (e) {
      console.error(`[CHILS MEDIA] ${rel}: ${e.message}`);
      res.setHeader("Cache-Control", "no-store");
      res.redirect(302, `${storeUrl().replace(/\/$/, "")}/wp-content/uploads/${rel.split("/").map(encodeURIComponent).join("/")}`);
    }
  };
}
function uploadsPathOf(url) {
  try {
    return decodeURIComponent(url).split("/wp-content/uploads/")[1]?.split(/[?#]/)[0] || null;
  } catch {
    return null;
  }
}

// server.ts
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest, CallbackType, RefundRequest } from "pg-sdk-node";
dotenv.config();
var IS_PROD = process.env.NODE_ENV === "production";
var JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) console.error("[CHILS & CO.] JWT_SECRET is not set: customer logins will fail until it is added to the environment.");
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
function getWooCommerce() {
  const k = (process.env.WOOCOMMERCE_KEY || "").trim();
  const s = (process.env.WOOCOMMERCE_SECRET || "").trim();
  const rawUrl = (process.env.WOOCOMMERCE_URL || "https://www.chilsandco.com").trim();
  const isMissing = !k || !s;
  const isPlaceholder = k.includes("ck_xxxxxxxx") || s.includes("cs_xxxxxxxx");
  if (isMissing || isPlaceholder) {
    console.warn(`[CHILS & CO.] WooCommerce Auth Config Missing:
      - Has URL: ${!!rawUrl} (${rawUrl})
      - Has Key: ${k ? isPlaceholder ? "Placeholder" : "Yes" : "No"}
      - Has Secret: ${s ? isPlaceholder ? "Placeholder" : "Yes" : "No"}
      - ACTION: Please set WOOCOMMERCE_KEY and WOOCOMMERCE_SECRET in AI Studio Settings.`);
    return null;
  }
  const apiUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
  const WooCommerce = WooCommerceRestApi.default || WooCommerceRestApi;
  return new WooCommerce({
    url: apiUrl,
    consumerKey: k,
    consumerSecret: s,
    version: "wc/v3",
    queryStringAuth: true,
    // Generally more compatible with WAFs on shared hosting
    axiosConfig: {
      timeout: 3e4,
      headers: {
        "User-Agent": "ChilsAndCo-Backend-Client/1.4",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      // In case of SSL certificate chain issues on shared host
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: false
      })
    }
  });
}
var shiprocketToken = null;
var shiprocketTokenExpiry = 0;
async function getShiprocketToken() {
  if (shiprocketToken && Date.now() < shiprocketTokenExpiry) return shiprocketToken;
  const email = (process.env.SHIPROCKET_EMAIL || "").trim();
  const password = (process.env.SHIPROCKET_PASSWORD || "").trim();
  if (!email || !password) {
    console.warn("[CHILS & CO.] Shiprocket credentials not configured");
    return null;
  }
  try {
    const res = await axios3.post("https://apiv2.shiprocket.in/v1/external/auth/login", { email, password });
    shiprocketToken = res.data?.token;
    shiprocketTokenExpiry = Date.now() + 24 * 3600 * 1e3;
    return shiprocketToken;
  } catch (err) {
    console.error("[CHILS & CO.] Shiprocket auth failed:", err.response?.data?.message || err.message);
    return null;
  }
}
var INDIA_STATES = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CH: "Chandigarh",
  CT: "Chhattisgarh",
  DN: "Dadra and Nagar Haveli",
  DD: "Daman and Diu",
  DL: "Delhi",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JK: "Jammu and Kashmir",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OR: "Odisha",
  OD: "Odisha",
  PY: "Puducherry",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TG: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UT: "Uttarakhand",
  UK: "Uttarakhand",
  WB: "West Bengal"
};
function shiprocketProblem(err) {
  const d = err?.response?.data;
  if (!d) return err?.message || "Shiprocket did not answer";
  const detail = d.errors ? Object.entries(d.errors).map(([k, v]) => `${k}: ${[].concat(v).join(", ")}`).join("; ") : "";
  return [d.message, detail].filter(Boolean).join(" \xB7 ") || JSON.stringify(d).slice(0, 300);
}
var shiprocketPickupCache = null;
async function getShiprocketPickupName(token2) {
  const wanted = (process.env.SHIPROCKET_PICKUP_LOCATION || "").trim();
  if (shiprocketPickupCache && Date.now() - shiprocketPickupCache.at < 36e5 && (!wanted || shiprocketPickupCache.name.toLowerCase() === wanted.toLowerCase())) return shiprocketPickupCache.name;
  let list = [];
  try {
    const res = await axios3.get("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", { headers: { Authorization: `Bearer ${token2}` } });
    list = res.data?.data?.shipping_address || [];
  } catch (err) {
    console.warn("[CHILS & CO.] Could not read Shiprocket pickup locations:", shiprocketProblem(err));
    return wanted || "Primary";
  }
  const names = list.map((l) => String(l.pickup_location || "")).filter(Boolean);
  const match = wanted && names.find((n) => n.toLowerCase() === wanted.toLowerCase());
  const primary = list.find((l) => Number(l.is_primary_location) === 1)?.pickup_location;
  const chosen = match || primary || names[0];
  if (!chosen) throw new Error("Shiprocket has no pickup location on file. Add one in Shiprocket under Settings, then Pickup Addresses.");
  if (wanted && !match) console.warn(`[CHILS & CO.] SHIPROCKET_PICKUP_LOCATION "${wanted}" is not in Shiprocket (${names.join(", ")}). Using "${chosen}".`);
  shiprocketPickupCache = { name: String(chosen), at: Date.now() };
  return String(chosen);
}
async function createShiprocketShipment(order) {
  const token2 = await getShiprocketToken();
  if (!token2) throw new Error("Shiprocket not configured");
  const items = (order.line_items || []).map((item) => ({
    name: item.name,
    sku: item.sku || `SKU-${item.product_id}`,
    units: item.quantity,
    selling_price: Number(item.total) / Math.max(1, Number(item.quantity))
  }));
  const subTotal = items.reduce((n, i) => n + i.selling_price * i.units, 0);
  const bill = order.billing || {};
  const ship = order.shipping?.address_1 ? order.shipping : bill;
  const stateName = (a) => INDIA_STATES[String(a?.state || "").toUpperCase()] || a?.state || "";
  const phone = String(bill.phone || ship.phone || "").replace(/\D/g, "").slice(-10);
  const when = /* @__PURE__ */ new Date(`${order.date_created_gmt || order.date_created}${order.date_created_gmt ? "Z" : ""}`);
  const orderDate = when.toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16);
  const payload = {
    order_id: String(order.id),
    order_date: orderDate,
    pickup_location: await getShiprocketPickupName(token2),
    channel_id: "",
    billing_customer_name: bill.first_name || ship.first_name || "Customer",
    billing_last_name: bill.last_name || "",
    billing_address: bill.address_1 || ship.address_1,
    billing_address_2: bill.address_2 || "",
    billing_city: bill.city || ship.city,
    billing_pincode: bill.postcode || ship.postcode,
    billing_state: stateName(bill) || stateName(ship),
    billing_country: "India",
    billing_email: bill.email,
    billing_phone: phone,
    shipping_is_billing: false,
    shipping_customer_name: ship.first_name || bill.first_name || "Customer",
    shipping_last_name: ship.last_name || bill.last_name || "",
    shipping_address: ship.address_1,
    shipping_address_2: ship.address_2 || "",
    shipping_city: ship.city,
    shipping_pincode: ship.postcode,
    shipping_country: "India",
    shipping_state: stateName(ship),
    shipping_email: bill.email,
    shipping_phone: phone,
    order_items: items,
    // PhonePe orders are already paid: the courier must not collect cash for them
    payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
    shipping_charges: Number(order.shipping_total || 0),
    sub_total: Math.round(subTotal * 100) / 100,
    length: 10,
    breadth: 10,
    height: 5,
    weight: 0.5
  };
  try {
    const res = await axios3.post("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", payload, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    return res.data;
  } catch (err) {
    throw new Error(`Shiprocket rejected the order: ${shiprocketProblem(err)}`);
  }
}
async function assignShiprocketCourier(shipmentId) {
  const token2 = await getShiprocketToken();
  if (!token2) throw new Error("Shiprocket not configured");
  try {
    const res = await axios3.post("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", { shipment_id: Number(shipmentId) }, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const d = res.data || {};
    if (d.awb_assign_status !== 1 && !d.response?.data?.awb_code) throw new Error(d.message || d.response?.data?.awb_assign_error || "Shiprocket did not assign a courier");
    const info = d.response?.data || {};
    return { awb: String(info.awb_code || ""), courier: String(info.courier_name || info.courier_company_id || "") };
  } catch (err) {
    throw new Error(shiprocketProblem(err));
  }
}
async function getShiprocketLabelUrl(shipmentId) {
  const token2 = await getShiprocketToken();
  if (!token2) return "";
  try {
    const res = await axios3.post("https://apiv2.shiprocket.in/v1/external/courier/generate/label", { shipment_id: [Number(shipmentId)] }, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    return String(res.data?.label_url || "");
  } catch (err) {
    console.warn("[CHILS & CO.] Could not get the Shiprocket label:", shiprocketProblem(err));
    return "";
  }
}
function toSignalId(orderId) {
  const cleanId = String(orderId).replace(/\D/g, "");
  const numId = parseInt(cleanId, 10) || 123456;
  const signalNum = numId % 9e5 + 1e5;
  return `CHLS-${signalNum}`;
}
async function wcSafeCall(wc2, method, ...args) {
  const maxRetries = 6;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await wc2[method](...args);
    } catch (error) {
      const isTransient = error.code === "ECONNRESET" || error.code === "ETIMEDOUT" || error.code === "ECONNABORTED" || error.code === "EAI_AGAIN" || error.code === "ENOTFOUND" || error.code === "EHOSTUNREACH" || error.message?.includes("socket hang up") || error.message?.includes("timeout") || error.message?.includes("read ECONNRESET") || error.message?.includes("ERR_BAD_RESPONSE") || error.response && error.response.status >= 500;
      if (isTransient && i < maxRetries) {
        const backoff = Math.pow(2, i + 1) * 1e3 + Math.floor(Math.random() * 1e3);
        console.warn(`[CHILS & CO.] WooCommerce ${method} transient failure (${error.code || error.message}). Redialing in ${Math.round(backoff / 1e3)}s... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      if (error.response) {
        if (error.response.status === 401) {
          console.error(`[CHILS & CO.] WooCommerce 401 ERROR: REST API Authentication failed. 
            - URL: ${error.config?.url}
            - Method: ${method}
            - Check WOOCOMMERCE_KEY and WOOCOMMERCE_SECRET in environment.
            - Ensure WooCommerce REST API keys have "Read/Write" permissions.
            - Ensure Pretty Permalinks are enabled in WordPress Settings > Permalinks.
            - Server response:`, error.response.data);
        } else {
          console.error(`[CHILS & CO.] WooCommerce ${method} rejected with status ${error.response.status}:`, error.response.data);
        }
      } else {
        console.error(`[CHILS & CO.] WooCommerce ${method} failed critically after ${i} retries:`, error.message || error);
      }
      throw error;
    }
  }
}
var isPayableOrderStatus = (status) => ["pending", "on-hold"].includes(status || "");
function getPhonePeTransactionId(order, fallback) {
  if (fallback) return fallback;
  const metaField = order.meta_data?.find((m) => m.key === "_phonepe_transaction_id");
  return metaField?.value || (order.id && order.date_created ? `${order.id}_${new Date(order.date_created).getTime()}` : null);
}
async function verifyPhonePeTransaction(merchantTransactionId) {
  const merchantId = process.env.PHONEPE_MERCHANT_ID?.trim();
  const saltKey = (process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_API_KEY || "").trim();
  const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
  if (!merchantTransactionId) {
    return null;
  }
  const phonePeClient = getPhonePeClient();
  if (phonePeClient && typeof phonePeClient.getOrderStatus === "function") {
    const sdkStatus = await phonePeClient.getOrderStatus(merchantTransactionId);
    return normalizePhonePeStatus(sdkStatus);
  }
  if (!merchantId || !saltKey) {
    return null;
  }
  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const checksum = crypto3.createHash("sha256").update(endpoint + saltKey).digest("hex") + "###" + saltIndex;
  const verifyRes = await axios3.get(`https://api.phonepe.com/apis/hermes${endpoint}`, {
    timeout: 3e3,
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId
    }
  });
  return normalizePhonePeStatus(verifyRes.data);
}
function normalizePhonePeStatus(statusData) {
  if (!statusData) return null;
  const state2 = statusData.state || statusData.data?.state;
  const code = statusData.code || statusData.data?.code;
  const paymentDetail = statusData.paymentDetails?.[0] || statusData.data?.paymentDetails?.[0];
  const merchantTransactionId = statusData.merchantOrderId || statusData.originalMerchantOrderId || statusData.data?.merchantOrderId || statusData.data?.merchantTransactionId;
  const transactionId = statusData.transactionId || paymentDetail?.transactionId || statusData.orderId || statusData.data?.orderId || statusData.data?.transactionId;
  if (state2 === "COMPLETED" || statusData.success && code === "PAYMENT_SUCCESS") {
    return {
      success: true,
      code: "PAYMENT_SUCCESS",
      message: statusData.message,
      data: { merchantTransactionId, transactionId }
    };
  }
  if (["FAILED", "CANCELLED", "EXPIRED"].includes(state2) || ["PAYMENT_ERROR", "PAYMENT_DECLINED", "TIMED_OUT", "PAYMENT_FAILED"].includes(code)) {
    return {
      success: false,
      code: code || `PAYMENT_${state2}`,
      message: statusData.message || state2,
      data: { merchantTransactionId, transactionId }
    };
  }
  return {
    success: false,
    code: code || state2 || "PAYMENT_PENDING",
    message: statusData.message || state2 || "Payment is still pending",
    data: { merchantTransactionId, transactionId }
  };
}
async function reconcilePendingPhonePeOrder(wc2, order, fallbackTransactionId) {
  if (!wc2 || !order?.id || !isPayableOrderStatus(order.status)) {
    return order;
  }
  const merchantTransactionId = getPhonePeTransactionId(order, fallbackTransactionId);
  if (!merchantTransactionId) {
    return order;
  }
  try {
    const statusData = await verifyPhonePeTransaction(merchantTransactionId);
    if (!statusData) return order;
    if (statusData.success && statusData.code === "PAYMENT_SUCCESS") {
      const transactionId = statusData.data?.transactionId;
      console.log(`[CHILS & CO.] Public status reconciled Order ${order.id} as PAID.`);
      const update = await wcSafeCall(wc2, "put", `orders/${order.id}`, {
        status: "processing",
        set_paid: true,
        transaction_id: transactionId,
        customer_note: "Payment verified during customer return status check."
      });
      triggerOrderConfirmationEmails(update.data).catch((err) => {
        console.error("[CHILS & CO. EMAIL] Reconcile order confirmation email failed:", err);
      });
      return update.data;
    }
    if (["PAYMENT_ERROR", "PAYMENT_DECLINED", "TIMED_OUT", "PAYMENT_FAILED"].includes(statusData.code)) {
      console.log(`[CHILS & CO.] Public status reconciled Order ${order.id} as FAILED (${statusData.code}).`);
      const update = await wcSafeCall(wc2, "put", `orders/${order.id}`, {
        status: "failed",
        customer_note: `Payment resolution: ${statusData.message || statusData.code}`
      });
      return update.data;
    }
  } catch (err) {
    if (err.response?.status !== 404) {
      console.warn(`[CHILS & CO.] Public PhonePe reconciliation skipped for Order ${order.id}:`, err.message || err);
    }
  }
  return order;
}
async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`[CHILS DEBUG] API Requested: ${req.method} ${req.url}`);
    }
    next();
  });
  app.get("/api/ping", (req, res) => {
    res.json({ status: "alive", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const SETTINGS_FILE = dataFile("settings.json");
  const DEFAULT_SETTINGS = {
    mobileLink: "+91 7842 07 0404",
    address: "3rd Floor, Plot No. 38 & 39\nMatrusri Nagar, Miyapur\nHyderabad, Telangana \u2013 500049\nIndia",
    coordinates: "17.4948, 78.3444",
    email: "hello.chilsandco@gmail.com",
    groqApiKey: "",
    geminiApiKey: "",
    amazonBrandName: "CHILS & CO.",
    amazonManufacturer: "CHILS & CO.",
    amazonImporterContact: "CHILS & CO., 3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur, Hyderabad, Telangana \u2013 500049, Contact: +91 7842 07 0404",
    amazonPackerContact: "CHILS & CO., 3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur, Hyderabad, Telangana \u2013 500049, Contact: +91 7842 07 0404",
    amazonOriginCountry: "India",
    amazonFulfillmentChannel: "Merchant Fulfilled",
    amazonHandlingTime: "5",
    amazonDefaultPkgLength: "35",
    amazonDefaultPkgWidth: "25",
    amazonDefaultPkgHeight: "5",
    amazonDefaultPkgWeight: "500"
  };
  app.get("/api/settings", (req, res) => {
    try {
      if (!fs4.existsSync(SETTINGS_FILE)) {
        fs4.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
        return res.json(DEFAULT_SETTINGS);
      }
      const nodeContent = fs4.readFileSync(SETTINGS_FILE, "utf-8");
      const settings = JSON.parse(nodeContent);
      res.json({ ...DEFAULT_SETTINGS, ...settings });
    } catch (error) {
      console.error("[CHILS & CO.] Settings Fetch Error:", error);
      res.json(DEFAULT_SETTINGS);
    }
  });
  const PORT = process.env.PORT || 3e3;
  console.log(`[CHILS & CO.] Initializing Server...`);
  console.log(`[CHILS & CO.] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[CHILS & CO.] Target PORT: ${PORT} (Type: ${typeof PORT})`);
  app.use(cors());
  app.set("trust proxy", true);
  app.use(express.json({ limit: "10mb" }));
  const HOLDING = (process.env.SITE_MODE || "").trim().toLowerCase() === "holding";
  const PREVIEW_KEY = (process.env.PREVIEW_KEY || "").trim();
  const PREVIEW_COOKIE = "chils_preview";
  const previewToken = PREVIEW_KEY ? crypto3.createHmac("sha256", PREVIEW_KEY).update("chils-preview-v1").digest("hex") : "";
  const safeEq = (a, b) => crypto3.timingSafeEqual(crypto3.createHash("sha256").update(a).digest(), crypto3.createHash("sha256").update(b).digest());
  const cookieOf = (req, name) => {
    const hit = (req.headers.cookie || "").split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
  };
  const hasPreview = (req) => !!previewToken && safeEq(cookieOf(req, PREVIEW_COOKIE), previewToken);
  const cookieFlags = (req) => `Path=/; HttpOnly; SameSite=Lax${(req.headers["x-forwarded-proto"] || req.protocol) === "https" ? "; Secure" : ""}`;
  app.get("/preview", (req, res, next) => {
    const key = typeof req.query.key === "string" ? req.query.key : "";
    if (!previewToken || !key || !safeEq(key, PREVIEW_KEY)) return next();
    res.setHeader("Set-Cookie", `${PREVIEW_COOKIE}=${previewToken}; Max-Age=2592000; ${cookieFlags(req)}`);
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, "/");
  });
  app.get("/preview/off", (req, res) => {
    res.setHeader("Set-Cookie", `${PREVIEW_COOKIE}=; Max-Age=0; ${cookieFlags(req)}`);
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, "/");
  });
  const HOLDING_OPEN = [
    /^\/api\/ping$/,
    /^\/api\/launch-list$/,
    /^\/api\/settings$/,
    /^\/api\/checkout\/phonepe\/callback$/,
    /^\/api\/webhooks\//,
    /^\/api\/orders\/status\//,
    /^\/order-success\//,
    /^\/assets\//,
    /^\/folded\//,
    /^\/snowflake\.svg$/,
    /^\/coming-soon\.html$/,
    /^\/robots\.txt$/,
    /^\/google[\w]+\.html$/,
    /^\/apple-touch-icon\.png$/,
    /^\/favicon/
  ];
  let holdingHtml = null;
  const readHolding = () => {
    if (holdingHtml) return holdingHtml;
    for (const p of [path3.resolve(__dirname, "dist", "coming-soon.html"), path3.resolve(__dirname, "public", "coming-soon.html")]) {
      try {
        return holdingHtml = fs4.readFileSync(p, "utf-8");
      } catch {
      }
    }
    return "<!doctype html><title>CHILS & CO.</title><p style='font:16px sans-serif;padding:40px'>We're restitching the store. Back shortly.</p>";
  };
  if (HOLDING) {
    console.log(`[CHILS & CO.] HOLDING MODE: visitors see the coming-soon page${PREVIEW_KEY ? "; preview link is on" : "; NO PREVIEW_KEY set, nobody can open the store"}`);
    app.use((req, res, next) => {
      if (hasPreview(req) || HOLDING_OPEN.some((r) => r.test(req.path))) return next();
      res.setHeader("Retry-After", "3600");
      res.setHeader("Cache-Control", "no-store");
      if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api/")) {
        return res.status(503).type("html").send(readHolding());
      }
      return res.status(503).json({ message: "The store is being updated. Back shortly." });
    });
  }
  const LAUNCH_FILE = dataFile("launch-list.json");
  const launchHits = /* @__PURE__ */ new Map();
  const readLaunch = () => {
    try {
      return JSON.parse(fs4.readFileSync(LAUNCH_FILE, "utf-8"));
    } catch {
      return [];
    }
  };
  app.post("/api/launch-list", (req, res) => {
    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const recent = (launchHits.get(ip) || []).filter((t) => Date.now() - t < 36e5);
    if (recent.length >= 8) return res.status(429).json({ message: "Too many tries. Please wait a bit." });
    launchHits.set(ip, [...recent, Date.now()]);
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ message: "That email doesn't look right." });
    const list = readLaunch();
    if (list.length >= 5e4) return res.status(503).json({ message: "Try again later." });
    if (!list.some((x) => x.email === email)) {
      const best = Number(req.body?.best);
      list.push({ email, at: (/* @__PURE__ */ new Date()).toISOString(), ...Number.isFinite(best) && best > 0 ? { best: Math.min(Math.floor(best), 9999) } : {} });
      fs4.writeFileSync(LAUNCH_FILE, JSON.stringify(list));
      console.log(`[CHILS & CO.] Launch list: ${list.length} signed up`);
    }
    res.json({ ok: true });
  });
  app.get("/api/launch-list.csv", (req, res) => {
    if (!hasPreview(req)) return res.status(404).end();
    const rows = readLaunch().map((x) => `"${x.email.replace(/"/g, '""')}",${x.at},${x.best ?? ""}`);
    res.setHeader("Content-Disposition", 'attachment; filename="launch-list.csv"');
    res.type("text/csv").send(["email,signed_up,best_score", ...rows].join("\n"));
  });
  try {
    adoptLegacyUploads(__dirname);
  } catch (e) {
    console.error("[CHILS DATA] Could not adopt old uploads:", e.message);
  }
  app.use("/uploads", (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "sandbox");
    next();
  }, express.static(UPLOADS_DIR, { maxAge: "30d", index: false, fallthrough: false }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token2 = authHeader && authHeader.split(" ")[1];
    if (!token2) return res.status(401).json({ message: "Access denied. No token provided." });
    jwt.verify(token2, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token." });
      req.user = user;
      next();
    });
  };
  app.use((req, res, next) => {
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  app.get("/api/health", async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      let connectivity = "Not tested";
      if (wc2) {
        try {
          const test = await wcSafeCall(wc2, "get", "products", { per_page: 1 });
          connectivity = test.status === 200 ? "Success" : `Failed (Status: ${test.status})`;
        } catch (err) {
          connectivity = `Error: ${err.message}`;
        }
      }
      res.json({
        status: "ok",
        env: process.env.NODE_ENV,
        woocommerce: {
          configured: !!wc2,
          url: process.env.WOOCOMMERCE_URL,
          hasKey: !!process.env.WOOCOMMERCE_KEY,
          hasSecret: !!process.env.WOOCOMMERCE_SECRET,
          connectivity
        }
      });
    } catch (error) {
      console.error("[CHILS & CO.] Health Check Failure:", error);
      res.status(500).json({ status: "error", error: error.message });
    }
  });
  let globalSwatchesCache = null;
  let lastSwatchesFetch = 0;
  let globalProductsCache = null;
  let lastProductsFetch = 0;
  const PRODUCTS_CACHE_TTL = 1e3 * 60 * 5;
  const metaCache = /* @__PURE__ */ new Map();
  const productForMeta = (id) => {
    const entry = metaCache.get(id) ?? { data: null, at: 0, refresh: null };
    metaCache.set(id, entry);
    if (Date.now() - entry.at > 10 * 60 * 1e3 && !entry.refresh) {
      entry.refresh = wcSafeCall(getWooCommerce(), "get", `products/${id}`).then((r) => {
        entry.data = r.data;
        entry.at = Date.now();
        return r.data;
      }).finally(() => {
        entry.refresh = null;
      });
      entry.refresh.catch(() => {
        if (!entry.data) metaCache.delete(id);
      });
    }
    return entry.data ? Promise.resolve(entry.data) : entry.refresh;
  };
  const PRODUCT_TTL = 60 * 1e3;
  const productCache = /* @__PURE__ */ new Map();
  let productsBody = null;
  let productsRefresh = null;
  const refreshProducts = () => {
    if (productsRefresh) return productsRefresh;
    productsRefresh = (async () => {
      const wc2 = getWooCommerce();
      if (!wc2) return mockProducts;
      const swatchesData = await fetchSwatches();
      let all = [];
      for (let page2 = 1; ; page2++) {
        const response = await wcSafeCall(wc2, "get", "products", { per_page: 100, page: page2, status: "publish" });
        const rows = Array.isArray(response.data) ? response.data : [];
        all = all.concat(rows);
        if (rows.length < 100) break;
      }
      const mapped = all.map((p) => mapProduct(p, {}, swatchesData));
      globalProductsCache = mapped;
      lastProductsFetch = Date.now();
      productsBody = { all: JSON.stringify(mapped), visible: JSON.stringify(mapped.filter((p) => p.id.toString() !== "1672")) };
      console.log(`[CHILS & CO.] Products refreshed: ${mapped.length}`);
      return mapped;
    })().finally(() => {
      productsRefresh = null;
    });
    return productsRefresh;
  };
  const invalidateProductsCache = () => {
    console.log("[CHILS & CO.] Refreshing products cache.");
    lastProductsFetch = 0;
    productCache.forEach((e) => {
      e.at = 0;
    });
    refreshProducts().catch((e) => console.error("[CHILS & CO.] Products refresh failed:", e?.message));
  };
  const fetchSwatches = async () => {
    if (globalSwatchesCache && Date.now() - lastSwatchesFetch < 1e3 * 60 * 5) {
      return globalSwatchesCache;
    }
    try {
      const wpUrl = (process.env.WOOCOMMERCE_URL || "").replace(/\/$/, "");
      const res = await axios3.get(`${wpUrl}/wp-json/chils/v1/swatches`, { timeout: 4e3 });
      if (res.data && typeof res.data === "object" && !res.data.code) {
        const swatches = {};
        Object.values(res.data).forEach((term) => {
          if (term.meta && term.name) {
            const meta = term.meta;
            let type = "color";
            let value = "";
            const colorKey = Object.keys(meta).find((k) => k.includes("color"));
            if (colorKey && meta[colorKey] && meta[colorKey][0]) {
              type = "color";
              value = meta[colorKey][0];
            }
            const imageKey = Object.keys(meta).find((k) => k.includes("image_url"));
            if (imageKey && meta[imageKey]) {
              type = "image";
              value = meta[imageKey];
            }
            if (value) {
              swatches[term.name.toLowerCase()] = { type, value };
            }
          }
        });
        globalSwatchesCache = swatches;
        lastSwatchesFetch = Date.now();
        console.log(`[CHILS & CO. DEBUG] Cached ${Object.keys(swatches).length} CartFlows Swatches`);
        return swatches;
      }
    } catch (err) {
      console.error("[CHILS & CO. DEBUG] Failed to fetch CartFlows swatches:", err.message);
    }
    return globalSwatchesCache || {};
  };
  const mapProduct = (wcProduct, resolvedMediaUrls = {}, swatchesData = {}) => {
    const attributes = Array.isArray(wcProduct.attributes) ? wcProduct.attributes : [];
    const categories = Array.isArray(wcProduct.categories) ? wcProduct.categories : [];
    const images = Array.isArray(wcProduct.images) ? wcProduct.images : [];
    const decodeEntities = (str) => {
      return (str || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ").replace(/&mdash;/g, "\u2014").replace(/&ndash;/g, "\u2013").replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10))).replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    };
    const cleanHtml = (html) => {
      return (html || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<li[^>]*>/gi, "- ").replace(/<\/li>/gi, "\n").replace(/<\/h[1-6]>/gi, "\n").replace(/<[^>]*>?/gm, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    };
    const longDescription = decodeEntities(cleanHtml(wcProduct.description || ""));
    const shortDescription = decodeEntities(cleanHtml(wcProduct.short_description || ""));
    const coCreatorAttr = attributes.find((a) => {
      const name = (a.name || "").toLowerCase();
      return name.includes("co-creator") || name.includes("co_creator") || name.includes("co creator") || name.includes("cocreator") || name.includes("designer");
    })?.options?.[0];
    const coCreatorMeta = wcProduct.meta_data?.find((m) => m.key === "_co_creator" || m.key === "co_creator")?.value;
    const coCreator = coCreatorAttr || coCreatorMeta || "";
    let mappedVariations = [];
    let availableColors = [];
    let availableSizes = [];
    if (wcProduct.variations_data && Array.isArray(wcProduct.variations_data)) {
      mappedVariations = wcProduct.variations_data.map((v) => {
        const vAttrs = {};
        if (Array.isArray(v.attributes)) {
          v.attributes.forEach((attr) => {
            const attrName = (attr.name || "").toLowerCase();
            console.log(`[CHILS & CO. DEBUG] Variation ${v.id} Attribute Name: '${attrName}', Option: '${attr.option}'`);
            if (attrName === "color" || attrName === "pa_color" || attrName === "colors" || attrName === "pa_colors" || attrName === "colour" || attrName === "pa_colour" || attrName === "colours" || attrName === "pa_colours") vAttrs.color = attr.option;
            if (attrName === "size" || attrName === "pa_size" || attrName === "sizes" || attrName === "pa_sizes") vAttrs.size = attr.option;
          });
        }
        let vImages = [];
        if (v.image && v.image.src) {
          vImages.push(v.image.src);
        }
        let galleryIds = [];
        if (v.gallery_image_ids && Array.isArray(v.gallery_image_ids)) {
          galleryIds = [...galleryIds, ...v.gallery_image_ids];
        }
        if (v.custom_gallery_urls && Array.isArray(v.custom_gallery_urls)) {
          vImages = [...vImages, ...v.custom_gallery_urls];
        }
        if (v.meta_data && Array.isArray(v.meta_data)) {
          const metaKeys = [
            "_woo_variation_gallery_images",
            "woo_variation_gallery_images",
            "_wc_additional_variation_images",
            "wc_additional_variation_images",
            "_additional_variation_images",
            "additional_variation_images",
            "variation_image_gallery",
            "_wpg_variation_gallery",
            "wpg_variation_gallery",
            "rtwpvg_images",
            "_rtwpvg_images",
            "vargal_params",
            "_vargal_params",
            "vargal_gallery"
          ];
          metaKeys.forEach((key) => {
            const meta = v.meta_data.find((m) => m.key === key);
            if (meta && typeof meta.value === "string") {
              const ids = meta.value.split(",").map((id) => id.trim()).filter(Boolean);
              galleryIds = [...galleryIds, ...ids];
            } else if (meta && Array.isArray(meta.value)) {
              galleryIds = [...galleryIds, ...meta.value];
            } else if (meta && typeof meta.value === "object") {
              const ids = Object.values(meta.value).map(String);
              galleryIds = [...galleryIds, ...ids];
            }
          });
        }
        if (galleryIds.length > 0) {
          galleryIds.forEach((id) => {
            const parentImg = Array.isArray(wcProduct.images) ? wcProduct.images.find((img) => String(img.id) === String(id)) : null;
            if (parentImg && parentImg.src) {
              vImages.push(parentImg.src);
            } else if (resolvedMediaUrls[String(id)]) {
              vImages.push(resolvedMediaUrls[String(id)]);
            }
          });
        }
        const directArrayKeys = ["variation_gallery_images", "woo_variation_gallery_images"];
        directArrayKeys.forEach((key) => {
          if (v[key] && Array.isArray(v[key])) {
            v[key].forEach((img) => {
              if (img.src) vImages.push(img.src);
              else if (typeof img === "string" && img.startsWith("http")) vImages.push(img);
            });
          }
        });
        vImages = [...new Set(vImages)].map((src) => {
          let cleanSrc = src.replace(/-\d+x\d+(?=\.[a-zA-Z0-9]+$)/, "");
          if (cleanSrc.includes("wp-content/uploads")) {
            return `/api/media?url=${encodeURIComponent(cleanSrc)}`;
          }
          return cleanSrc;
        });
        if (vAttrs.color && !availableColors.includes(vAttrs.color)) {
          availableColors.push(vAttrs.color);
        }
        if (vAttrs.size && !availableSizes.includes(vAttrs.size)) {
          availableSizes.push(vAttrs.size);
        }
        console.log(`[CHILS & CO. DEBUG] Variation ${v.id} Final Attrs:`, vAttrs);
        return {
          id: (v.id || "").toString(),
          attributes: vAttrs,
          price: parseFloat(v.price || wcProduct.price || "0"),
          stockQuantity: v.stock_quantity !== null && v.stock_quantity !== void 0 ? v.stock_quantity : 0,
          stockStatus: v.stock_status || "instock",
          manageStock: v.manage_stock === true || v.manage_stock === "parent" || false,
          images: vImages
        };
      });
    }
    const matchedColorAttr = attributes.find((a) => {
      const name = (a.name || "").toLowerCase();
      return name === "color" || name === "pa_color" || name === "colors" || name === "pa_colors" || name === "colour" || name === "pa_colour" || name === "colours" || name === "pa_colours";
    });
    const parentColors = (matchedColorAttr?.options || []).map(decodeEntities);
    const matchedSizeAttr = attributes.find((a) => {
      const name = (a.name || "").toLowerCase();
      return name === "size" || name === "pa_size" || name === "sizes" || name === "pa_sizes";
    });
    const parentSizes = (matchedSizeAttr?.options || []).map(decodeEntities);
    const categoryList = categories.map((c) => decodeEntities(c.name || "")).filter(Boolean);
    const matchedFitAttr = attributes.find((a) => {
      const name = (a.name || "").toLowerCase();
      const slug = (a.slug || "").toLowerCase();
      return name === "fit" || name === "pa_fit" || slug === "pa_fit" || slug === "fit" || name === "fitting" || name === "pa_fitting";
    });
    const attrFitOption = matchedFitAttr?.options?.[0] ? decodeEntities(matchedFitAttr.options[0]).trim() : null;
    const categoryFitMatch = categoryList.find((cat) => {
      const lower = cat.toLowerCase();
      return lower.includes("drop shoulder") || lower.includes("oversized") || lower.includes("oversize") || lower.includes("regular fit") || lower.includes("relaxed fit") || lower.includes("slim fit") || lower.includes("boxy fit") || lower.includes("standard fit") || lower.includes("custom fit") || lower.endsWith(" fit");
    });
    let resolvedFit = attrFitOption || categoryFitMatch || "Regular Fit";
    if (resolvedFit.toLowerCase().includes("drop shoulder") || resolvedFit.toLowerCase().includes("oversiz")) {
      resolvedFit = "Drop Shoulder / Oversized";
    } else if (resolvedFit.toLowerCase().includes("regular fit")) {
      resolvedFit = "Regular Fit";
    }
    return {
      id: (wcProduct.id || "").toString(),
      name: decodeEntities(wcProduct.name || "Unknown Product"),
      category: decodeEntities(categories[0]?.name || "Uncategorized"),
      categories: categoryList,
      price: parseFloat(wcProduct.price || "0"),
      description: longDescription || shortDescription,
      shortDescription: shortDescription || longDescription,
      concept: attributes.find((a) => a.name?.toLowerCase() === "concept")?.options?.[0] || "A precise exploration of form and function.",
      material: attributes.find((a) => a.name?.toLowerCase() === "material")?.options?.[0] || "Premium technical fabric.",
      fit: resolvedFit,
      care: attributes.find((a) => a.name?.toLowerCase() === "care")?.options?.[0] || "Machine wash cold.",
      images: images.map((img) => {
        const src = img.src;
        if (!src) return "";
        if (src.includes("wp-content/uploads")) {
          return `/api/media?url=${encodeURIComponent(src)}`;
        }
        return src;
      }).filter(Boolean),
      status: wcProduct.stock_status === "instock" ? "Available" : "Coming Soon",
      totalSales: parseInt(wcProduct.total_sales || "0", 10),
      stockQuantity: wcProduct.stock_quantity || 0,
      coCreator,
      featured: !!wcProduct.featured,
      variations: mappedVariations.length > 0 ? mappedVariations : void 0,
      availableColors: availableColors.length > 0 ? availableColors : parentColors.length > 0 ? parentColors : void 0,
      availableSizes: availableSizes.length > 0 ? availableSizes : parentSizes.length > 0 ? parentSizes : void 0,
      colorSwatches: Object.keys(swatchesData).length > 0 ? swatchesData : void 0,
      colorAttributeName: matchedColorAttr ? matchedColorAttr.name : void 0,
      sizeAttributeName: matchedSizeAttr ? matchedSizeAttr.name : void 0,
      type: wcProduct.type || "simple",
      groupedProducts: Array.isArray(wcProduct.grouped_products) ? wcProduct.grouped_products.map((id) => id.toString()) : void 0
    };
  };
  const mockProducts = [
    {
      id: "t1",
      name: "KERNEL PANIC TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 399,
      description: "A digital error translated into physical style. Soft combed cotton in a heavy weight, custom print detailing.",
      shortDescription: "A crisp black signature developer print.",
      concept: "System anomalies structured on fabric.",
      material: "100% Combed Cotton, 220 GSM.",
      fit: "Oversized Fit.",
      care: "Wash cold, inside out.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Uday Boya",
      availableColors: ["Black"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t2",
      name: "COLD RESET TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 399,
      description: "Designed for standard comfort in a light grey colorway. Premium ring-spun weave.",
      shortDescription: "A minimalist light grey essential.",
      concept: "Starting fresh with pristine geometry.",
      material: "90% Cotton, 10% Polyester, 220 GSM.",
      fit: "Standard Fit.",
      care: "Wash cold, flat dry.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Antigravity Team",
      availableColors: ["Light Grey"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t3",
      name: "EVERGREEN LOOP TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 399,
      description: "A deep forest green representation of continuous execution. Clean typography on front chest.",
      shortDescription: "A deep forest green graphic tee.",
      concept: "The loop that never terminates.",
      material: "100% Combed Cotton, 220 GSM.",
      fit: "Oversized Fit.",
      care: "Wash cold, tumble dry low.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Uday Boya",
      availableColors: ["Green"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t4",
      name: "AMBIENT NOISE TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 399,
      description: "Muted color palettes showing waves of sound. Clean styling for focus-oriented developers.",
      shortDescription: "Muted gray-blue soundwave tee.",
      concept: "Filtering the sound of development.",
      material: "100% Premium Cotton, 220 GSM.",
      fit: "Oversized Fit.",
      care: "Cold wash only.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Uday Boya",
      availableColors: ["Gray-Blue"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t5",
      name: "RED SHIFT TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 419,
      description: "High-visibility red detailing reflecting motion and velocity.",
      shortDescription: "A deep red graphic statement piece.",
      concept: "Velocity-based wavelength displacement.",
      material: "100% Cotton, 220 GSM.",
      fit: "Relaxed Fit.",
      care: "Iron inside out.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Designer Crew",
      availableColors: ["Red"],
      availableSizes: ["S", "M", "L", "XL", "2XL"]
    },
    {
      id: "t6",
      name: "POWER CYCLE TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 419,
      description: "The binary restart button. Clean aesthetic showing structural power toggles.",
      shortDescription: "White graphic tee with a structured power loop.",
      concept: "Turn it off and on again.",
      material: "100% Combed Cotton, 220 GSM.",
      fit: "Oversized Fit.",
      care: "Wash cold.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Uday Boya",
      availableColors: ["White"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t7",
      name: "FRIENDCHIP TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 419,
      description: "Integrated circuit design depicting connections and camaraderie. Perfect for silicon engineers.",
      shortDescription: "A microchip-themed charcoal tee.",
      concept: "Camaraderie etched in silicon.",
      material: "100% Ring-spun Cotton, 220 GSM.",
      fit: "Relaxed Fit.",
      care: "Wash inside out.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Antigravity Team",
      availableColors: ["Charcoal"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t8",
      name: "FOREST ORIGINAL TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 419,
      description: "An earthy, organic green shade showing natural layout lines. Designed for creative engineers.",
      shortDescription: "An earthy forest green logo tee.",
      concept: "Where logic returns to the root.",
      material: "100% Organic Cotton, 220 GSM.",
      fit: "Standard Fit.",
      care: "Dry flat, do not bleach.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Designer Crew",
      availableColors: ["Forest Green"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    {
      id: "t9",
      name: "BRAIN TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 449,
      description: "Neural pathways rendered in precise technical patterns.",
      shortDescription: "A deep navy neural network print.",
      concept: "Cognitive systems mapped to threads.",
      material: "100% Combed Cotton, 240 GSM.",
      fit: "Oversized Fit.",
      care: "Wash cold.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Uday Boya",
      availableColors: ["Navy"],
      availableSizes: ["S", "M", "L", "XL", "2XL"]
    },
    {
      id: "t10",
      name: "CLOCKING BAD TEE",
      category: "T-Shirts",
      categories: ["T-Shirts"],
      price: 449,
      description: "For digital VLSI design experts who override standard clocking speeds.",
      shortDescription: "VLSI clock tree statement print.",
      concept: "Breaking the rules of time sync.",
      material: "100% Cotton, 240 GSM.",
      fit: "Oversized Fit.",
      care: "Do not iron print.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png"
      ],
      status: "Available",
      coCreator: "Antigravity Team",
      availableColors: ["Black"],
      availableSizes: ["S", "M", "L", "XL"]
    },
    // Grouped Combos (Curated Stacks)
    {
      id: "combo_core",
      name: "CORE STACK",
      category: "Combos",
      categories: ["Combos"],
      price: 949,
      // MRP is 1,047 (399 + 399 + 399 = 1197? Wait: 399 + 399 + 399 = 1197. Wait! 349 * 3 = 1047. Oh, let's keep price matching individual items or special rates)
      description: "Three engineered T-shirts. One better wardrobe. Carefully pre-curated for daily rotation.",
      shortDescription: "Kernel Panic (Black) + Cold Reset (Grey) + Evergreen Loop (Forest).",
      concept: "A complete rotation of our signature system tees.",
      material: "Curated Cotton Assembly.",
      fit: "Standard & Oversized Fits.",
      care: "Wash cold, dry flat.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png",
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
      ],
      status: "Available",
      type: "grouped",
      groupedProducts: ["t1", "t2", "t3"]
    },
    {
      id: "combo_builder",
      name: "BUILDER STACK",
      category: "Combos",
      categories: ["Combos"],
      price: 1079,
      description: "The builders pack. Contains Kernel Panic, Ambient Noise, and Red Shift.",
      shortDescription: "Kernel Panic (Black) + Ambient Noise (Gray-Blue) + Red Shift (Red).",
      concept: "Built for compile loops and velocity shifts.",
      material: "Premium Combed Cotton.",
      fit: "Relaxed & Oversized Fits.",
      care: "Wash separate.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png",
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
      ],
      status: "Available",
      type: "grouped",
      groupedProducts: ["t1", "t4", "t5"]
    },
    {
      id: "combo_creator",
      name: "CREATOR STACK",
      category: "Combos",
      categories: ["Combos"],
      price: 1079,
      description: "Pre-assembled set including Power Cycle, FriendChip, and Forest Original.",
      shortDescription: "Power Cycle (White) + FriendChip (Charcoal) + Forest Original (Forest Green).",
      concept: "A combination of logic and natural tones.",
      material: "Organic Cotton Selection.",
      fit: "Relaxed & Standard Fits.",
      care: "Wash cold.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png",
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
      ],
      status: "Available",
      type: "grouped",
      groupedProducts: ["t6", "t7", "t8"]
    },
    {
      id: "combo_vlsi",
      name: "VLSI STACK",
      category: "Combos",
      categories: ["Combos"],
      price: 1129,
      description: "A premium semiconductor-themed wardrobe stack. Brain, Clocking Bad, and FriendChip T-Shirts.",
      shortDescription: "Brain (Navy) + Clocking Bad (Black) + FriendChip (Charcoal).",
      concept: "For clock tree builders and logic designers.",
      material: "240GSM Heavyweight cotton.",
      fit: "Oversized & Relaxed Fits.",
      care: "Iron inside out.",
      images: [
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1777715200/a50f35f2-0d3c-411b-8695-82ada5d97bd5_20260502_151543_0000_u5fzyj.png",
        "https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
      ],
      status: "Available",
      type: "grouped",
      groupedProducts: ["t9", "t10", "t7"]
    }
  ];
  const mapOrderToSignal = (order) => {
    try {
      const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
      const shippingLines = Array.isArray(order.shipping_lines) ? order.shipping_lines : [];
      const getMeta = (key) => {
        return order.meta_data?.find((m) => m.key === key)?.value;
      };
      const getTrackingInfo = () => {
        let awb = getMeta("_shiprocket_awb") || getMeta("_tracking_number");
        let courier = getMeta("_shiprocket_courier") || getMeta("_tracking_provider");
        let status = getMeta("_shiprocket_tracking_status") || getMeta("_tracking_status");
        let url = getMeta("_shiprocket_tracking_url") || getMeta("_tracking_link");
        let etd = getMeta("_shiprocket_etd");
        const trackingItems = getMeta("_wc_shipment_tracking_items");
        if (!awb && trackingItems) {
          try {
            const items = typeof trackingItems === "string" ? JSON.parse(trackingItems) : trackingItems;
            if (Array.isArray(items) && items.length > 0) {
              const item = items[0];
              awb = item.tracking_number;
              courier = item.tracking_provider;
              url = item.custom_tracking_link || item.tracking_link;
            }
          } catch (e) {
            console.error("[CHILS] Failed to parse wc_shipment_tracking_items:", e);
          }
        }
        if (awb && !url) {
          url = `https://shiprocket.co/tracking/${awb}`;
        }
        return {
          awb: awb ? String(awb) : null,
          courier: courier ? String(courier) : null,
          trackingStatus: status ? String(status) : null,
          trackingUrl: url ? String(url) : null,
          etd: etd ? String(etd) : null
        };
      };
      const tracking = getTrackingInfo();
      const parentExchangeOrderId = getMeta("parent_exchange_order_id") || null;
      const totalVal = parentExchangeOrderId ? lineItems.reduce((acc, item) => acc + parseFloat(item.price || "0") * parseInt(item.quantity || "1", 10), 0) : parseFloat(order.total || "0");
      return {
        id: (order.id || "").toString(),
        signalId: toSignalId(order.id),
        status: order.status || "pending",
        date: order.date_created || (/* @__PURE__ */ new Date()).toISOString(),
        dateCompleted: order.date_completed || null,
        total: totalVal,
        currency: order.currency || "INR",
        parentExchangeOrderId,
        items: lineItems.map((item) => ({
          productId: (item.product_id || "").toString(),
          name: item.name || "Unknown Item",
          quantity: parseInt(item.quantity || "1", 10),
          price: parseFloat(item.price || "0"),
          total: parseFloat(item.total || "0"),
          // WC V3 often includes image object in line_items if configured
          image: item.image?.src || null
        })),
        billing: {
          first_name: order.billing?.first_name || "",
          last_name: order.billing?.last_name || "",
          email: order.billing?.email || "",
          phone: order.billing?.phone || ""
        },
        shipping: {
          address: order.shipping ? `${order.shipping.address_1 || ""}${order.shipping.address_1 && order.shipping.city ? ", " : ""}${order.shipping.city || ""}` : "No address provided",
          method: shippingLines[0]?.method_title || "Standard Delivery",
          awb: tracking.awb,
          courier: tracking.courier,
          trackingStatus: tracking.trackingStatus,
          trackingUrl: tracking.trackingUrl,
          etd: tracking.etd
        },
        orderKey: order.order_key,
        rmaSwaps: (() => {
          const rmaSwapInfoStr = getMeta("rma_swap_info") || getMeta("_rma_swap_info");
          if (rmaSwapInfoStr) {
            try {
              return typeof rmaSwapInfoStr === "string" ? JSON.parse(rmaSwapInfoStr) : rmaSwapInfoStr;
            } catch (e) {
              console.error("Failed to parse rma_swap_info:", e);
            }
          }
          return null;
        })()
      };
    } catch (err) {
      console.error("[CHILS & CO.] Error mapping order to signal:", err);
      return {
        id: (order.id || "0").toString(),
        signalId: "CHLS-ERR",
        status: "error",
        date: (/* @__PURE__ */ new Date()).toISOString(),
        total: 0,
        currency: "INR",
        items: [],
        shipping: { address: "Error processing signal", method: "N/A" }
      };
    }
  };
  app.get("/api/products", async (req, res) => {
    const fresh = req.query.fresh === "true";
    const showTest = req.query.show_test === "true";
    try {
      if (!getWooCommerce()) return res.json(mockProducts);
      if (fresh || !productsBody) {
        await refreshProducts();
        res.setHeader("X-Cache", "MISS");
      } else {
        res.setHeader("X-Cache", "HIT");
        if (Date.now() - lastProductsFetch > PRODUCTS_CACHE_TTL) invalidateProductsCache();
      }
      res.setHeader("Cache-Control", fresh || showTest ? "no-store" : "public, max-age=60, stale-while-revalidate=600");
      res.type("application/json").send(showTest ? productsBody.all : productsBody.visible);
    } catch (error) {
      console.error("WooCommerce API Error:", error);
      res.status(500).json({ message: "Failed to fetch products from WooCommerce" });
    }
  });
  const buildProductJson = async (id) => {
    const wc2 = getWooCommerce();
    const response = await wcSafeCall(wc2, "get", `products/${id}`);
    let productData = response.data;
    console.log(`[CHILS & CO. DEBUG] Product ${id} Type: '${productData.type}'`);
    let resolvedMediaUrls = {};
    if (productData.type === "variable") {
      let allVariations = [];
      let page2 = 1;
      let hasMore = true;
      while (hasMore) {
        console.log(`[CHILS & CO. DEBUG] Fetching variations page ${page2} for product ${id}...`);
        const variationsResponse = await wcSafeCall(wc2, "get", `products/${id}/variations`, {
          per_page: 100,
          page: page2
        });
        const pageData = variationsResponse.data;
        if (Array.isArray(pageData) && pageData.length > 0) {
          allVariations = [...allVariations, ...pageData];
          if (pageData.length < 100) {
            hasMore = false;
          } else {
            page2++;
          }
        } else {
          hasMore = false;
        }
      }
      productData.variations_data = allVariations;
      console.log(`[CHILS & CO. DEBUG] Fetched ${productData.variations_data.length} variations total for product ${id}`);
      const allGalleryIds = /* @__PURE__ */ new Set();
      productData.variations_data.forEach((v) => {
        if (v.gallery_image_ids && Array.isArray(v.gallery_image_ids)) {
          v.gallery_image_ids.forEach((id2) => allGalleryIds.add(String(id2)));
        }
        if (v.meta_data && Array.isArray(v.meta_data)) {
          const metaKeys = [
            "_woo_variation_gallery_images",
            "woo_variation_gallery_images",
            "_wc_additional_variation_images",
            "wc_additional_variation_images",
            "_additional_variation_images",
            "additional_variation_images",
            "variation_image_gallery",
            "_wpg_variation_gallery",
            "wpg_variation_gallery",
            "rtwpvg_images",
            "_rtwpvg_images",
            "vargal_params",
            "_vargal_params",
            "vargal_gallery"
          ];
          metaKeys.forEach((key) => {
            const meta = v.meta_data.find((m) => m.key === key);
            if (meta && typeof meta.value === "string") {
              meta.value.split(",").forEach((id2) => {
                if (id2.trim()) allGalleryIds.add(id2.trim());
              });
            } else if (meta && Array.isArray(meta.value)) {
              meta.value.forEach((id2) => allGalleryIds.add(String(id2)));
            } else if (meta && typeof meta.value === "object") {
              Object.values(meta.value).forEach((id2) => allGalleryIds.add(String(id2)));
            }
          });
        }
      });
      const parentImageIds = new Set((productData.images || []).map((img) => String(img.id)));
      const unresolvedIds = Array.from(allGalleryIds).filter((id2) => !parentImageIds.has(id2));
      if (unresolvedIds.length > 0) {
        console.log(`[CHILS & CO. DEBUG] Fetching ${unresolvedIds.length} unresolved media URLs from WordPress API...`);
        try {
          const wpUrl = (process.env.WOOCOMMERCE_URL || "").replace(/\/$/, "");
          const mediaResponse = await axios3.get(`${wpUrl}/wp-json/wp/v2/media`, {
            params: { include: unresolvedIds.join(",") }
          });
          if (mediaResponse.data && Array.isArray(mediaResponse.data)) {
            mediaResponse.data.forEach((media) => {
              if (media.source_url) {
                resolvedMediaUrls[String(media.id)] = media.source_url;
              }
            });
          }
        } catch (err) {
          console.error("[CHILS & CO. DEBUG] Failed to fetch media URLs:", err.message);
        }
      }
    }
    const swatchesData = await fetchSwatches();
    return JSON.stringify(mapProduct(productData, resolvedMediaUrls, swatchesData || {}));
  };
  const productJson = (id) => {
    const entry = productCache.get(id) ?? { body: null, at: 0, refresh: null };
    productCache.set(id, entry);
    const stale = Date.now() - entry.at > PRODUCT_TTL;
    if (stale && !entry.refresh) {
      entry.refresh = buildProductJson(id).then((json) => {
        entry.body = json;
        entry.at = Date.now();
        return json;
      }).finally(() => {
        entry.refresh = null;
      });
      entry.refresh.catch((e) => {
        console.error(`[CHILS & CO.] Product ${id} refresh failed:`, e?.message);
        if (!entry.body) productCache.delete(id);
      });
    }
    return entry.body ? Promise.resolve(entry.body) : entry.refresh;
  };
  app.get("/api/products/:id", async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      if (!wc2) {
        const mockProduct = mockProducts.find((product) => product.id === req.params.id);
        return mockProduct ? res.json(mockProduct) : res.status(404).json({ message: "Product not found (Mock Mode)" });
      }
      if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ message: "Product not found" });
      const json = await productJson(req.params.id);
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
      res.type("application/json").send(json);
    } catch (error) {
      console.error("WooCommerce API Error:", error);
      res.status(404).json({ message: "Product not found" });
    }
  });
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json([
          {
            id: 1,
            reviewer: "Uday Boya",
            reviewer_email: "uday@chilsandco.com",
            review: "Awesome structured fabric thickness and premium dropped shoulders. Highly recommend!",
            rating: 5,
            date_created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
            images: []
          },
          {
            id: 2,
            reviewer: "Aditya K.",
            reviewer_email: "aditya@chilsandco.com",
            review: "The oxford weave is clean and doesn't sag. Fits like a second skin.",
            rating: 4,
            date_created: new Date(Date.now() - 12 * 24 * 60 * 60 * 1e3).toISOString(),
            images: []
          }
        ]);
      }
      const response = await wcSafeCall(wc2, "get", "products/reviews", {
        product: req.params.id,
        status: "approved"
      });
      const mappedReviews = Array.isArray(response.data) ? response.data.map((r) => {
        let reviewText = r.review.replace(/<[^>]*>?/gm, "").trim();
        let images = [];
        const imgMatch = reviewText.match(/__IMAGES__(\[.*?\])/);
        if (imgMatch) {
          try {
            images = JSON.parse(imgMatch[1]).filter((u) => typeof u === "string" && (!u.startsWith("/uploads/") || fs4.existsSync(path3.join(UPLOADS_DIR, path3.normalize(u.slice("/uploads/".length)).replace(/^(\.\.[\/\\])+/, "")))));
            reviewText = reviewText.replace(/__IMAGES__\[.*?\]/, "").trim();
          } catch (e) {
          }
        }
        return {
          id: r.id,
          reviewer: r.reviewer,
          reviewer_email: r.reviewer_email,
          review: reviewText,
          rating: r.rating,
          date_created: r.date_created,
          images
        };
      }) : [];
      res.json(mappedReviews);
    } catch (error) {
      console.error("WooCommerce reviews API Error:", error.message || error);
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });
  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const { reviewer, reviewer_email, review, rating, images } = req.body;
      const productId = req.params.id;
      if (!review || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid review content or rating" });
      }
      let finalReviewer = reviewer;
      let finalEmail = reviewer_email;
      const authHeader = req.headers["authorization"];
      const token2 = authHeader && authHeader.split(" ")[1];
      if (token2) {
        try {
          const decoded = jwt.verify(token2, JWT_SECRET);
          const userObj = decoded.data?.user || decoded;
          finalReviewer = userObj.pseudoName || `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim() || userObj.username || finalReviewer;
          finalEmail = userObj.email || finalEmail;
        } catch (e) {
        }
      }
      if (!finalReviewer || !finalEmail) {
        return res.status(400).json({ message: "Reviewer name and email are required" });
      }
      const savedUrls = [];
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((imgBase64, index) => {
          try {
            if (typeof imgBase64 === "string" && imgBase64.startsWith("data:image/")) {
              const mimeMatch = imgBase64.match(/^data:image\/(\w+);base64,/);
              const ext = mimeMatch ? mimeMatch[1] : "jpg";
              const base64Content = imgBase64.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Content, "base64");
              const filename = `rev-${productId}-${Date.now()}-${index}.${ext}`;
              savedUrls.push(saveUpload("reviews", filename, buffer));
            }
          } catch (err) {
            console.error("Failed to save review image:", err);
          }
        });
      }
      const reviewPayload = savedUrls.length > 0 ? `${review}

__IMAGES__${JSON.stringify(savedUrls)}` : review;
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json({
          id: Math.floor(Math.random() * 1e4),
          reviewer: finalReviewer,
          reviewer_email: finalEmail,
          review,
          rating: Number(rating),
          date_created: (/* @__PURE__ */ new Date()).toISOString(),
          images: savedUrls
        });
      }
      const reviewData = {
        product_id: parseInt(productId, 10),
        reviewer: finalReviewer,
        reviewer_email: finalEmail,
        review: reviewPayload,
        rating: Number(rating),
        status: "approved"
      };
      const response = await wcSafeCall(wc2, "post", "products/reviews", reviewData);
      let resReview = response.data.review.replace(/<[^>]*>?/gm, "").trim();
      let resImages = [];
      const imgMatch = resReview.match(/__IMAGES__(\[.*?\])/);
      if (imgMatch) {
        try {
          resImages = JSON.parse(imgMatch[1]);
          resReview = resReview.replace(/__IMAGES__\[.*?\]/, "").trim();
        } catch (e) {
        }
      }
      res.json({
        id: response.data.id,
        reviewer: response.data.reviewer,
        reviewer_email: response.data.reviewer_email,
        review: resReview,
        rating: response.data.rating,
        date_created: response.data.date_created,
        images: resImages
      });
    } catch (error) {
      console.error("WooCommerce submit review API Error:", error.response?.data || error.message || error);
      res.status(500).json({ message: "Failed to submit product review" });
    }
  });
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      const code = String(req.body?.code || "").trim().toLowerCase().replace(/\s+/g, "");
      if (!wc2 || !code) return res.status(400).json({ valid: false, message: "That code isn't valid." });
      const { data } = await wcSafeCall(wc2, "get", "coupons", { code });
      const coupon = Array.isArray(data) ? data[0] : void 0;
      const problem = couponProblem(coupon, Number(req.body?.subtotal) || 0, !!req.body?.hasSet);
      if (problem) return res.json({ valid: false, message: problem });
      return res.json({ valid: true, code: coupon.code, discountType: coupon.discount_type, amount: Number(coupon.amount) });
    } catch (err) {
      console.error("[CHILS & CO.] Coupon check failed:", err);
      return res.status(500).json({ valid: false, message: "We couldn't check that code. Please try again." });
    }
  });
  app.post("/api/meta/event", (req, res) => {
    const { event, eventId, value, contentIds, contentName, url } = req.body || {};
    if (event !== "AddToCart" || typeof eventId !== "string" || eventId.length > 100) {
      return res.status(400).json({ ok: false });
    }
    const ids = Array.isArray(contentIds) ? contentIds.slice(0, 20).map(String) : [];
    sendAddToCart(browserContext(req), eventId, {
      value: Math.max(0, Math.min(Number(value) || 0, 1e5)),
      contentIds: ids,
      contentName: typeof contentName === "string" ? contentName.slice(0, 200) : void 0,
      url: typeof url === "string" ? url.slice(0, 500) : void 0
    });
    res.status(202).json({ ok: true });
  });
  app.post("/api/checkout/create-order", async (req, res) => {
    try {
      const { amount, currency, customerDetails, lineItems, shippingMethod, couponCode } = req.body;
      const wc2 = getWooCommerce();
      if (!req.headers.authorization) {
        return res.status(401).json({ message: "Authentication required: Please sign in or register to place an order." });
      }
      let customerId = 0;
      const token2 = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token2, JWT_SECRET);
        customerId = decoded.data?.user?.id || decoded.id || 0;
      } catch (e) {
        console.error("JWT verification failed for checkout:", e);
        return res.status(401).json({ message: "Session expired: Please sign in again to place an order." });
      }
      if (customerId === 0) {
        return res.status(401).json({ message: "Identity validation failed: A registered profile is required to check out." });
      }
      const flattenedLineItems = [];
      lineItems.forEach((item) => {
        if (item.isCombo && Array.isArray(item.comboItems)) {
          item.comboItems.forEach((sub) => {
            flattenedLineItems.push({
              id: sub.id,
              name: sub.name,
              price: sub.price,
              quantity: item.quantity,
              // Inherit quantity of the combo stack
              selectedSize: sub.selectedSize,
              selectedColor: sub.selectedColor,
              comboName: item.name,
              // Link to the combo name
              variations: sub.variations
              // Use the sub-item's variations!
            });
          });
        } else {
          flattenedLineItems.push(item);
        }
      });
      if (wc2) {
        const needsLookup = flattenedLineItems.filter((item) => item.selectedSize || item.selectedColor);
        const lookups = /* @__PURE__ */ new Map();
        for (const item of needsLookup) {
          const id = String(item.id);
          if (!lookups.has(id)) {
            lookups.set(id, (async () => {
              const all = [];
              for (let page2 = 1; ; page2++) {
                const { data } = await wcSafeCall(wc2, "get", `products/${id}/variations`, { per_page: 100, page: page2 });
                if (!Array.isArray(data) || data.length === 0) break;
                all.push(...data.map(mapWooVariation));
                if (data.length < 100) break;
              }
              return all;
            })().catch((err) => {
              console.warn(`[CHILS & CO.] Could not load variations for product ${id}: ${err.message}`);
              return [];
            }));
          }
        }
        await Promise.all(needsLookup.map(async (item) => {
          item.variations = await lookups.get(String(item.id));
        }));
        const productPrices = /* @__PURE__ */ new Map();
        await Promise.all([...new Set(flattenedLineItems.map((item) => String(item.id)))].map(async (id) => {
          const { data } = await wcSafeCall(wc2, "get", `products/${id}`);
          productPrices.set(id, data?.price);
        }));
        for (const item of flattenedLineItems) {
          const match = Array.isArray(item.variations) && item.variations.length ? findVariation(item.variations, item.selectedSize, item.selectedColor) : void 0;
          const price = trustedPrice(match, productPrices.get(String(item.id)));
          if (price === null) {
            return res.status(409).json({ message: `${item.name || "An item"} is unavailable right now. Please remove it and try again.` });
          }
          item.price = price;
        }
        let couponLines = [];
        if (couponCode) {
          const code = String(couponCode).trim().toLowerCase().replace(/\s+/g, "");
          const { data } = await wcSafeCall(wc2, "get", "coupons", { code });
          const coupon = Array.isArray(data) ? data[0] : void 0;
          const subtotal = flattenedLineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const hasSet = lineItems.some((item) => item.isCombo);
          const problem = couponProblem(coupon, subtotal, hasSet);
          if (problem) return res.status(400).json({ message: problem });
          couponLines = [{ code: coupon.code }];
        }
        const isPickup2 = shippingMethod === "pickup";
        const realShippingCount = flattenedLineItems.reduce((sum, item) => {
          if (item.id && item.id.toString() === "1672") return sum;
          return sum + item.quantity;
        }, 0);
        let shippingFee = 0;
        if (!isPickup2 && realShippingCount > 0) {
          if (realShippingCount <= 2) {
            shippingFee = 80;
          } else {
            const extra = realShippingCount - 2;
            shippingFee = 80 + Math.floor(extra / 2) * 79 + extra % 2 * 49;
          }
        }
        const orderData = {
          payment_method: "phonepe",
          payment_method_title: "PhonePe",
          set_paid: false,
          // Set to false initially, let the webhook confirm payment
          customer_id: customerId,
          billing: {
            first_name: customerDetails.firstName,
            last_name: customerDetails.lastName,
            address_1: customerDetails.address || "Local Pickup Store Address",
            city: customerDetails.city || "Hyderabad",
            state: customerDetails.state || "Telangana",
            postcode: customerDetails.pincode || "500049",
            country: "IN",
            email: customerDetails.email,
            phone: customerDetails.phone
          },
          shipping: isPickup2 ? {
            first_name: customerDetails.firstName,
            last_name: customerDetails.lastName,
            address_1: "3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur",
            city: "Hyderabad",
            state: "Telangana",
            postcode: "500049",
            country: "IN"
          } : {
            first_name: customerDetails.firstName,
            last_name: customerDetails.lastName,
            address_1: customerDetails.address,
            city: customerDetails.city,
            state: customerDetails.state,
            postcode: customerDetails.pincode,
            country: "IN"
          },
          line_items: flattenedLineItems.map((item) => {
            let variationId = void 0;
            if (item.variations && Array.isArray(item.variations)) {
              const match = findVariation(item.variations, item.selectedSize, item.selectedColor);
              if (match) {
                variationId = parseInt(String(match.id), 10);
              }
            }
            if (!variationId && item.selectedSize) {
              console.warn(`[CHILS & CO.] No variation found for product ${item.id} (size ${item.selectedSize}, colour ${item.selectedColor || "none"})`);
            }
            const meta_data = [];
            if (item.selectedSize) {
              meta_data.push({
                key: item.sizeAttributeName || "pa_size",
                value: item.selectedSize
              });
            }
            if (item.selectedColor) {
              meta_data.push({
                key: item.colorAttributeName || "pa_color",
                value: item.selectedColor
              });
            }
            if (item.comboName) {
              meta_data.push({
                key: "Part of Combo",
                value: item.comboName
              });
            }
            const lineItemPrice = item.price * item.quantity;
            const discountedPrice = item.comboName ? Math.round(lineItemPrice * 0.9) : lineItemPrice;
            return {
              product_id: parseInt(item.id, 10),
              quantity: item.quantity,
              ...variationId ? { variation_id: variationId } : {},
              total: discountedPrice.toString(),
              subtotal: lineItemPrice.toString(),
              meta_data
            };
          }),
          shipping_lines: [
            {
              method_id: isPickup2 ? "local_pickup" : "flat_rate",
              method_title: isPickup2 ? "Collect in Store" : "Home Delivery",
              total: shippingFee.toString()
            }
          ],
          ...couponLines.length ? { coupon_lines: couponLines } : {},
          meta_data: [
            {
              key: "Packaging Selection",
              value: lineItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "Eco-friendly Biodegradable Bag" : "Second Life Box"
            },
            {
              key: "Delivery Method",
              value: isPickup2 ? "Collect in Store" : "Home Delivery"
            },
            // Browser identifiers for the Meta Purchase event sent once this order is paid
            ...orderMetaFrom(browserContext(req))
          ]
        };
        console.log("[CHILS & CO.] Creating WooCommerce Order:", orderData);
        const response = await wcSafeCall(wc2, "post", "orders", orderData);
        invalidateProductsCache();
        const merchantTransactionId = `${response.data.id}_${Date.now()}`;
        try {
          await wcSafeCall(wc2, "put", `orders/${response.data.id}`, {
            meta_data: [
              { key: "_phonepe_transaction_id", value: merchantTransactionId }
            ]
          });
        } catch (metaErr) {
          console.error("[CHILS & CO.] Failed to store merchantTransactionId in WC:", metaErr);
        }
        return res.json({
          id: response.data.id.toString(),
          // Return WC Order ID
          merchantTransactionId,
          // Also return the unique ID
          total: response.data.total,
          // What WooCommerce will actually charge
          amount: amount * 100,
          currency: currency || "INR",
          receipt: `receipt_${response.data.id}`
        });
      }
      const orderId = `order_${Math.random().toString(36).substring(7)}`;
      res.json({
        id: orderId,
        amount: amount * 100,
        currency: currency || "INR",
        receipt: `receipt_${Date.now()}`
      });
    } catch (error) {
      console.error("Checkout Order Creation Error:", error.response?.data || error);
      res.status(500).json({ message: "Failed to create order in system" });
    }
  });
  app.post("/api/checkout/phonepe/pay", async (req, res) => {
    try {
      const { merchantTransactionId } = req.body;
      const phonePeClient = getPhonePeClient();
      if (!phonePeClient) {
        return res.status(400).json({
          success: false,
          message: "PhonePe SDK not configured. Please check your environment variables."
        });
      }
      console.log(`[CHILS & CO.] Using PhonePe SDK for initiation. Transaction: ${merchantTransactionId}`);
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers["host"] || req.get("host") || "www.chilsandco.com";
      const isStrictProd = process.env.PHONEPE_ENV?.toUpperCase() === "PRODUCTION";
      const siteUrl = "https://www.chilsandco.com";
      const currentOrigin = isStrictProd && host.includes("chilsandco.com") ? `${protocol}://${host}` : isStrictProd ? siteUrl : `${protocol}://${host}`;
      const orderId = merchantTransactionId.split("_")[0];
      const redirectUrl = `${currentOrigin}/order-success/${merchantTransactionId}?signal=${toSignalId(orderId)}`;
      const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${currentOrigin}/api/checkout/phonepe/callback`;
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.status(503).json({ success: false, message: "Payments are unavailable right now. Please try again." });
      }
      const { data: wcOrder } = await wcSafeCall(wc2, "get", `orders/${orderId}`);
      if (!["pending", "failed"].includes(wcOrder?.status)) {
        return res.status(409).json({ success: false, message: "This order can't be paid again." });
      }
      const orderTotal = parseFloat(wcOrder.total);
      if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
        return res.status(409).json({ success: false, message: "We couldn't confirm this order's total. Please try again." });
      }
      const amountPaise = Math.round(orderTotal * 100);
      console.log(`[CHILS & CO.] PhonePe SDK - Initiating Checkout:
        - Transaction ID: ${merchantTransactionId}
        - Base Domain: ${currentOrigin}
        - Redirect URL: ${redirectUrl}
        - Callback URL: ${callbackUrl}
        - Environment: ${isStrictProd ? "PROD" : "SANDBOX"}
      `);
      const requestBuilder = StandardCheckoutPayRequest.builder().merchantOrderId(merchantTransactionId.toString()).amount(amountPaise).redirectUrl(redirectUrl).message(`Payment for Order #${merchantTransactionId.split("_")[0]}`);
      if (typeof requestBuilder.callbackUrl === "function") {
        requestBuilder.callbackUrl(callbackUrl);
      }
      const request = requestBuilder.build();
      const response = await phonePeClient.pay(request);
      console.log(`[CHILS & CO.] PhonePe SDK Success. Redirect URL: ${response.redirectUrl}`);
      return res.json({
        success: true,
        url: response.redirectUrl
      });
    } catch (err) {
      console.error("[CHILS & CO.] PhonePe SDK Pay Error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Payment initiation failed. Please try again."
      });
    }
  });
  app.post("/api/checkout/phonepe/retry", async (req, res) => {
    try {
      const { orderId, signal } = req.body;
      if (!orderId || !signal) {
        return res.status(400).json({ success: false, message: "Order ID and Signal are required." });
      }
      const expectedSignal = toSignalId(orderId);
      if (signal !== expectedSignal) {
        return res.status(403).json({ success: false, message: "Signal validation failed." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.status(400).json({ success: false, message: "WooCommerce not configured." });
      }
      console.log(`[CHILS & CO.] Initiating payment retry for Order ID: ${orderId}`);
      const orderResponse = await wcSafeCall(wc2, "get", `orders/${orderId}`);
      const order = orderResponse.data;
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found." });
      }
      const allowedStatuses = ["pending", "failed", "cancelled", "on-hold"];
      if (!allowedStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order status is '${order.status}'. Payment retry not allowed.`
        });
      }
      const merchantTransactionId = `${orderId}_${Date.now()}`;
      console.log(`[CHILS & CO.] Updating WC Order ${orderId} status to 'pending' with new transaction ID: ${merchantTransactionId}`);
      await wcSafeCall(wc2, "put", `orders/${orderId}`, {
        status: "pending",
        meta_data: [
          { key: "_phonepe_transaction_id", value: merchantTransactionId }
        ]
      });
      const phonePeClient = getPhonePeClient();
      if (!phonePeClient) {
        return res.status(400).json({
          success: false,
          message: "PhonePe SDK not configured."
        });
      }
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers["host"] || req.get("host") || "www.chilsandco.com";
      const isStrictProd = process.env.PHONEPE_ENV?.toUpperCase() === "PRODUCTION";
      const siteUrl = "https://www.chilsandco.com";
      const currentOrigin = isStrictProd && host.includes("chilsandco.com") ? `${protocol}://${host}` : isStrictProd ? siteUrl : `${protocol}://${host}`;
      const redirectUrl = `${currentOrigin}/order-success/${merchantTransactionId}?signal=${toSignalId(orderId)}`;
      const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${currentOrigin}/api/checkout/phonepe/callback`;
      const amountRupees = parseFloat(order.total);
      const amountPaise = Math.max(100, Math.round(amountRupees * 100));
      console.log(`[CHILS & CO.] PhonePe SDK Retry - Initiating Checkout:
        - Transaction ID: ${merchantTransactionId}
        - Base Domain: ${currentOrigin}
        - Redirect URL: ${redirectUrl}
        - Callback URL: ${callbackUrl}
        - Amount: ${amountRupees} INR (${amountPaise} paise)
      `);
      const requestBuilder = StandardCheckoutPayRequest.builder().merchantOrderId(merchantTransactionId.toString()).amount(amountPaise).redirectUrl(redirectUrl).message(`Payment retry for Order #${orderId}`);
      if (typeof requestBuilder.callbackUrl === "function") {
        requestBuilder.callbackUrl(callbackUrl);
      }
      const request = requestBuilder.build();
      const response = await phonePeClient.pay(request);
      console.log(`[CHILS & CO.] PhonePe SDK Retry Success. Redirect URL: ${response.redirectUrl}`);
      return res.json({
        success: true,
        url: response.redirectUrl
      });
    } catch (error) {
      console.error("[CHILS & CO.] PhonePe Retry Error:", error.response?.data || error);
      res.status(500).json({
        success: false,
        message: error.message || "Payment retry initiation failed. Please try again."
      });
    }
  });
  app.post("/api/checkout/phonepe/callback", async (req, res) => {
    try {
      const phonePeClient = getPhonePeClient();
      const username = process.env.PHONEPE_WEBHOOK_USERNAME;
      const password = process.env.PHONEPE_WEBHOOK_PASSWORD;
      const authorization = req.headers["authorization"];
      const responseBody = JSON.stringify(req.body);
      if (phonePeClient && username && password && authorization) {
        console.log("[CHILS & CO.] Using PhonePe SDK for Callback Validation.");
        try {
          const callbackResponse = phonePeClient.validateCallback(
            username,
            password,
            authorization,
            responseBody
          );
          if (callbackResponse.type === CallbackType.CHECKOUT_ORDER_COMPLETED) {
            const payload = callbackResponse.payload;
            const fullTransactionId = payload.originalMerchantOrderId || payload.merchantOrderId;
            const transactionId = payload.paymentDetails?.[0]?.transactionId || payload.transactionId || payload.orderId;
            const orderId = fullTransactionId?.startsWith("RMA_") ? fullTransactionId.split("_")[1] : fullTransactionId?.split("_")[0];
            const wc2 = getWooCommerce();
            if (fullTransactionId?.startsWith("RMA_")) {
              console.log(`[CHILS & CO.] SDK callback for RMA Swap Delta. Tx: ${fullTransactionId}`);
              if (payload.state === "COMPLETED") {
                const cachedData = getPendingSwap(fullTransactionId);
                if (cachedData) {
                  if (activeRmaSubmissions.has(fullTransactionId)) {
                    console.log(`[CHILS & CO.] RMA ${fullTransactionId} already processing. Ignoring duplicate SDK callback.`);
                    return res.status(200).send("OK");
                  }
                  activeRmaSubmissions.add(fullTransactionId);
                  try {
                    await executeWooCommerceRmaSubmit(
                      orderId,
                      cachedData.reason,
                      cachedData.description,
                      cachedData.products,
                      cachedData.images,
                      cachedData.swapInfo,
                      transactionId
                    );
                    removePendingSwap(fullTransactionId);
                  } finally {
                    activeRmaSubmissions.delete(fullTransactionId);
                  }
                }
              }
              return res.status(200).send("OK");
            }
            if (payload.state === "COMPLETED") {
              console.log(`[CHILS & CO.] SDK verified COMPLETED for order: ${orderId}`);
              if (wc2 && orderId) {
                const updateRes = await wcSafeCall(wc2, "put", `orders/${orderId}`, {
                  status: "processing",
                  set_paid: true,
                  transaction_id: transactionId,
                  note: `PhonePe SDK Verified Success. Ref: ${transactionId}`
                });
                triggerOrderConfirmationEmails(updateRes.data).catch((err) => {
                  console.error("[CHILS & CO. EMAIL] SDK callback order confirmation email failed:", err);
                });
                notifyNewOrder(updateRes.data).catch((err) => {
                  console.error("[CHILS & CO. SLACK] Payment notification failed:", err);
                });
              }
            } else {
              const state2 = payload.state;
              console.log(`[CHILS & CO.] SDK verified ${state2} for order: ${orderId}`);
              if (wc2 && orderId) {
                await wcSafeCall(wc2, "put", `orders/${orderId}`, {
                  status: "failed",
                  note: `PhonePe SDK Verified ${state2}. Ref: ${transactionId}`
                });
              }
            }
          }
          return res.status(200).send("OK");
        } catch (valErr) {
          console.error("[CHILS & CO.] SDK Callback Validation Failed:", valErr.message);
        }
      }
      const { response: base64Response } = req.body;
      const saltKey = process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_API_KEY;
      const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
      const xVerifyHeader = req.headers["x-verify"];
      if (!base64Response || !saltKey) {
        console.warn("[CHILS & CO.] Incomplete PhonePe callback received.");
        return res.status(200).send("OK");
      }
      if (xVerifyHeader) {
        const stringToHash = base64Response + saltKey;
        const sha256Hash = crypto3.createHash("sha256").update(stringToHash).digest("hex");
        const expectedVerify = sha256Hash + "###" + saltIndex;
        if (xVerifyHeader !== expectedVerify) {
          console.error("[CHILS & CO.] PhonePe Callback Signature Mismatch!");
          return res.status(401).send("Invalid Signature");
        }
      }
      const decodedResponse = JSON.parse(Buffer.from(base64Response, "base64").toString("utf-8"));
      console.log("[CHILS & CO.] PhonePe Callback Decoded:", decodedResponse);
      if (decodedResponse.success && decodedResponse.code === "PAYMENT_SUCCESS") {
        const fullTransactionId = decodedResponse.data?.merchantTransactionId;
        const transactionId = decodedResponse.data?.transactionId;
        const orderId = fullTransactionId?.startsWith("RMA_") ? fullTransactionId.split("_")[1] : fullTransactionId?.split("_")[0];
        if (fullTransactionId?.startsWith("RMA_")) {
          console.log(`[CHILS & CO.] Manual callback verified success for RMA Swap Delta. Tx: ${fullTransactionId}`);
          const cachedData = getPendingSwap(fullTransactionId);
          if (cachedData) {
            if (activeRmaSubmissions.has(fullTransactionId)) {
              console.log(`[CHILS & CO.] RMA ${fullTransactionId} already processing. Ignoring duplicate manual callback.`);
              return res.status(200).send("OK");
            }
            activeRmaSubmissions.add(fullTransactionId);
            try {
              await executeWooCommerceRmaSubmit(
                orderId,
                cachedData.reason,
                cachedData.description,
                cachedData.products,
                cachedData.images,
                cachedData.swapInfo,
                transactionId
              );
              removePendingSwap(fullTransactionId);
            } catch (err) {
              console.error(`[CHILS & CO.] Manual RMA webhook processing failure:`, err);
            } finally {
              activeRmaSubmissions.delete(fullTransactionId);
            }
          }
          return res.status(200).send("OK");
        }
        console.log(`[CHILS & CO.] Payment CONFIRMED for Order: ${orderId}. Full ID: ${fullTransactionId}. Trans ID: ${transactionId}`);
        const wc2 = getWooCommerce();
        if (wc2 && orderId) {
          try {
            console.log(`[CHILS & CO.] Updating WooCommerce Order ${orderId} to 'processing'`);
            const updateRes = await wcSafeCall(wc2, "put", `orders/${orderId}`, {
              status: "processing",
              set_paid: true,
              transaction_id: transactionId,
              note: `PhonePe Payment Successful. Transaction ID: ${transactionId}`
            });
            console.log(`[CHILS & CO.] WooCommerce Order ${orderId} updated successfully.`);
            triggerOrderConfirmationEmails(updateRes.data).catch((err) => {
              console.error("[CHILS & CO. EMAIL] Manual callback order confirmation email failed:", err);
            });
          } catch (wcErr) {
            console.error(`[CHILS & CO.] Failed to update WC Order ${orderId}:`, wcErr);
          }
        }
      } else {
        const fullTransactionId = decodedResponse.data?.merchantTransactionId || decodedResponse.merchantTransactionId;
        const orderId = fullTransactionId?.startsWith("RMA_") ? fullTransactionId.split("_")[1] : fullTransactionId?.split("_")[0];
        const reason = decodedResponse.message || decodedResponse.code || "Unknown Error";
        if (fullTransactionId?.startsWith("RMA_")) {
          console.log(`[CHILS & CO.] Manual callback failure for RMA transaction: ${fullTransactionId}`);
          removePendingSwap(fullTransactionId);
          return res.status(200).send("OK");
        }
        console.log(`[CHILS & CO.] Payment FAILED/CANCELLED for Order: ${orderId}. Reason: ${reason}`);
        if (orderId) {
          const wc2 = getWooCommerce();
          if (wc2) {
            try {
              await wcSafeCall(wc2, "put", `orders/${orderId}`, {
                status: "failed",
                note: `PhonePe Payment Failed/Cancelled. Reason: ${reason}`
              });
              console.log(`[CHILS & CO.] WooCommerce Order ${orderId} updated to 'failed'.`);
            } catch (wcErr) {
              console.error(`[CHILS & CO.] Failed to mark WC Order ${orderId} as failed:`, wcErr);
            }
          }
        }
      }
      res.status(200).send("OK");
    } catch (err) {
      console.error("[CHILS & CO.] PhonePe Callback Error:", err);
      res.status(500).send("Error");
    }
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, first_name, last_name, password } = req.body;
      console.log(`[CHILS & CO.] Registration Attempt for: ${email}`);
      console.log(`[CHILS & CO.] Registration Body Keys:`, Object.keys(req.body));
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required for identity creation." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        console.log("[CHILS & CO.] No WooCommerce credentials. Registering mock customer:", email);
        return res.json({
          id: Math.floor(Math.random() * 1e3),
          email,
          first_name: first_name || "",
          last_name: last_name || "",
          username: email.split("@")[0],
          message: "Registration successful (Mock Mode)"
        });
      }
      const customerData = {
        email: email.trim().toLowerCase(),
        first_name: (first_name || "").trim(),
        last_name: (last_name || "").trim(),
        password,
        username: email.split("@")[0].trim().toLowerCase()
      };
      console.log(`[CHILS & CO.] Transmitting customer data to WooCommerce...`);
      const response = await wcSafeCall(wc2, "post", "customers", customerData);
      console.log(`[CHILS & CO.] WooCommerce Registration Successful: ${response.data.id}`);
      res.status(201).json(response.data);
    } catch (error) {
      const errorData = error.response?.data;
      console.error("[CHILS & CO.] WooCommerce Registration Failed:", errorData || error.message);
      const errorMessage = errorData?.message || error.message || "Failed to register user";
      const statusCode = error.response?.status || 400;
      res.status(statusCode).json({
        message: errorMessage,
        code: errorData?.code
      });
    }
  });
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const rawWpUrl = process.env.WOOCOMMERCE_URL || "https://chilsandco.com";
      const wpUrl = rawWpUrl.endsWith("/") ? rawWpUrl.slice(0, -1) : rawWpUrl;
      console.log(`[CHILS & CO.] Attempting login to: ${wpUrl}/wp-json/jwt-auth/v1/token`);
      const response = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          // WP JWT Auth allows email or username here
          password
        })
      }).catch((err) => {
        console.error("[CHILS & CO.] Network error during WP login:", err);
        throw err;
      });
      const data = await response.json();
      console.log(`[CHILS & CO.] WordPress login successful for: ${data.user_email}`);
      if (!response.ok) {
        console.error("WordPress Login Failed:", data);
        return res.status(response.status).json({
          message: data.message || "Invalid credentials"
        });
      }
      const wc2 = getWooCommerce();
      let customerId = 0;
      let firstName = "";
      let lastName = "";
      let onWaitlist = false;
      let bespokeUnlocked = false;
      let coCreatorInterest = false;
      let pseudoName = "";
      let wishlist = [];
      let cart = [];
      if (wc2) {
        try {
          console.log(`[CHILS & CO.] Looking up WC customer ID for: ${data.user_email}`);
          const search = await wcSafeCall(wc2, "get", "customers", { email: data.user_email });
          if (search && Array.isArray(search.data) && search.data.length > 0) {
            const customer = search.data[0];
            customerId = customer.id;
            firstName = customer.first_name || "";
            lastName = customer.last_name || "";
            const getMetaValue = (metaData, key) => {
              const match = metaData?.find((m) => {
                const k = String(m.key).toLowerCase();
                return k === key || k === `_${key}` || k === key.replace(/_/g, "-");
              });
              return match?.value;
            };
            const isTrue = (val) => {
              if (val === true || val === 1 || val === "1") return true;
              if (typeof val === "string") {
                const v = val.trim().toLowerCase();
                return v === "true" || v === "yes" || v === "on" || v === "active";
              }
              return false;
            };
            onWaitlist = isTrue(getMetaValue(customer.meta_data, "bespoke_waitlist"));
            bespokeUnlocked = isTrue(getMetaValue(customer.meta_data, "bespoke_unlocked"));
            coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
            pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || "";
            const wishlistValue = getMetaValue(customer.meta_data, "wishlist");
            if (wishlistValue) {
              try {
                wishlist = JSON.parse(wishlistValue);
                if (!Array.isArray(wishlist)) wishlist = [];
              } catch (e) {
                console.error("[CHILS & CO.] Failed to parse wishlist metadata:", e);
              }
            }
            const cartValue = getMetaValue(customer.meta_data, "cart");
            if (cartValue) {
              try {
                cart = JSON.parse(cartValue);
                if (!Array.isArray(cart)) cart = [];
              } catch (e) {
                console.error("[CHILS & CO.] Failed to parse cart metadata:", e);
              }
            }
          }
        } catch (err) {
          console.error("[CHILS & CO.] Error searching for customer ID:", err);
        }
      }
      const userPayload = {
        id: customerId,
        email: data.user_email,
        username: data.user_nicename,
        displayName: data.user_display_name,
        firstName,
        lastName,
        onWaitlist,
        bespokeUnlocked,
        coCreatorInterest,
        pseudoName
      };
      const locallySignedToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "30d" });
      res.json({
        token: locallySignedToken,
        user: {
          id: customerId,
          email: data.user_email,
          username: data.user_nicename,
          first_name: firstName,
          last_name: lastName,
          firstName,
          lastName,
          onWaitlist,
          bespokeUnlocked,
          coCreatorInterest,
          pseudoName,
          wishlist,
          cart
        },
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login Server Error:", error);
      res.status(500).json({ message: "Login failed due to server error" });
    }
  });
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: "Token is required for verification." });
      }
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "162390818288-j2fcothougcpmok54mojqmn7fq2i5goc.apps.googleusercontent.com";
      console.log("[CHILS & CO.] Verifying Google token...");
      const verifyRes = await axios3.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`).catch((err) => {
        console.error("Google verify token request failed:", err.message);
        throw new Error("Invalid or expired Google authentication token.");
      });
      const payload = verifyRes.data;
      if (payload.aud !== GOOGLE_CLIENT_ID) {
        console.error(`Google token audience mismatch. Expected: ${GOOGLE_CLIENT_ID}, Got: ${payload.aud}`);
        return res.status(400).json({ message: "Security validation failed: Google credentials mismatch." });
      }
      const email = (payload.email || "").toLowerCase().trim();
      const firstName = payload.given_name || "";
      const lastName = payload.family_name || "";
      if (!email) {
        return res.status(400).json({ message: "Google profile does not provide a valid email address." });
      }
      const wc2 = getWooCommerce();
      let customerId = 0;
      let customer = null;
      if (wc2) {
        try {
          console.log(`[CHILS & CO.] Searching WooCommerce for email: ${email}`);
          const search = await wcSafeCall(wc2, "get", "customers", { email });
          if (search && Array.isArray(search.data) && search.data.length > 0) {
            customer = search.data[0];
            customerId = customer.id;
            console.log(`[CHILS & CO.] Found existing customer matching Google login: ${customerId}`);
          }
        } catch (err) {
          console.error("[CHILS & CO.] Error searching customer by email:", err);
        }
        if (!customer) {
          try {
            console.log(`[CHILS & CO.] Customer not found. Creating WooCommerce account for: ${email}`);
            const newCustomerData = {
              email,
              first_name: firstName,
              last_name: lastName,
              username: email.split("@")[0]
            };
            const response = await wcSafeCall(wc2, "post", "customers", newCustomerData);
            customer = response.data;
            customerId = customer.id;
            console.log(`[CHILS & CO.] Successfully created WooCommerce customer: ${customerId}`);
          } catch (createErr) {
            console.error("[CHILS & CO.] WooCommerce account auto-creation failed:", createErr.response?.data || createErr.message);
            if (createErr.response?.data?.code === "registration-error-email-exists") {
              const finalSearch = await wcSafeCall(wc2, "get", "customers", { search: email });
              const exactMatch = Array.isArray(finalSearch.data) ? finalSearch.data.find((c) => c.email?.toLowerCase() === email) : null;
              if (exactMatch) {
                customer = exactMatch;
                customerId = customer.id;
              }
            }
            if (!customerId) {
              return res.status(500).json({ message: "Failed to initialize WooCommerce identity." });
            }
          }
        }
      }
      let onWaitlist = false;
      let bespokeUnlocked = false;
      let coCreatorInterest = false;
      let pseudoName = "";
      let wishlist = [];
      let cart = [];
      if (customer) {
        const getMetaValue = (metaData, key) => {
          const match = metaData?.find((m) => {
            const k = String(m.key).toLowerCase();
            return k === key || k === `_${key}` || k === key.replace(/_/g, "-");
          });
          return match?.value;
        };
        const isTrue = (val) => {
          if (val === true || val === 1 || val === "1") return true;
          if (typeof val === "string") {
            const v = val.trim().toLowerCase();
            return v === "true" || v === "yes" || v === "on" || v === "active";
          }
          return false;
        };
        onWaitlist = isTrue(getMetaValue(customer.meta_data, "bespoke_waitlist"));
        bespokeUnlocked = isTrue(getMetaValue(customer.meta_data, "bespoke_unlocked"));
        coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
        pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || "";
        const wishlistValue = getMetaValue(customer.meta_data, "wishlist");
        if (wishlistValue) {
          try {
            wishlist = JSON.parse(wishlistValue);
            if (!Array.isArray(wishlist)) wishlist = [];
          } catch (e) {
            console.error("[CHILS & CO.] Failed to parse wishlist metadata:", e);
          }
        }
        const cartValue = getMetaValue(customer.meta_data, "cart");
        if (cartValue) {
          try {
            cart = JSON.parse(cartValue);
            if (!Array.isArray(cart)) cart = [];
          } catch (e) {
            console.error("[CHILS & CO.] Failed to parse cart metadata:", e);
          }
        }
      }
      const userPayload = {
        id: customerId,
        email,
        username: email.split("@")[0],
        displayName: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        onWaitlist,
        bespokeUnlocked,
        coCreatorInterest,
        pseudoName
      };
      const locallySignedToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "30d" });
      res.json({
        token: locallySignedToken,
        user: {
          id: customerId,
          email,
          username: email.split("@")[0],
          first_name: firstName,
          last_name: lastName,
          firstName,
          lastName,
          onWaitlist,
          bespokeUnlocked,
          coCreatorInterest,
          pseudoName,
          wishlist,
          cart
        },
        message: "Google authentication successful"
      });
    } catch (error) {
      console.error("Google Auth Server Error:", error);
      res.status(400).json({ message: error.message || "Google authentication failed." });
    }
  });
  app.post("/api/bespoke/waitlist", async (req, res) => {
    try {
      const { email: rawEmail, pseudoName } = req.body;
      const email = (rawEmail || "").toLowerCase();
      if (!email) return res.status(400).json({ message: "Email is required" });
      const wc2 = getWooCommerce();
      if (!wc2) {
        console.log("[CHILS & CO.] No WooCommerce credentials. Waitlist signal mocked.");
        return res.json({ success: true, message: "Waitlist signal received (Mock Mode)" });
      }
      console.log(`[CHILS & CO.] Processing Bespoke join for: ${email}`, { pseudoName });
      let customerId = null;
      try {
        const response = await wcSafeCall(wc2, "get", "customers", { email });
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          customerId = response.data[0].id;
          console.log(`[CHILS & CO.] Found exact customer match: ${customerId}`);
        } else {
          const search = await wcSafeCall(wc2, "get", "customers", { search: email });
          if (search && Array.isArray(search.data) && search.data.length > 0) {
            const match = search.data.find((c) => c.email?.toLowerCase() === email.toLowerCase());
            if (match) {
              customerId = match.id;
              console.log(`[CHILS & CO.] Found fuzzy customer match: ${customerId}`);
            }
          }
        }
      } catch (err) {
        console.warn("[CHILS & CO.] Search failed", err);
      }
      const metaToUpdate = [
        { key: "bespoke_waitlist", value: "true" }
      ];
      if (pseudoName) {
        metaToUpdate.push({ key: "pseudo_name", value: pseudoName });
      }
      if (customerId) {
        console.log(`[CHILS & CO.] Tagging customer ${customerId} for Bespoke waitlist.`);
        const response = await wcSafeCall(wc2, "put", `customers/${customerId}`, {
          meta_data: metaToUpdate
        });
        const updatedCustomer = response.data;
        const waitlistMeta = updatedCustomer?.meta_data?.find((m) => String(m.key).toLowerCase() === "bespoke_waitlist");
        const unlockedMeta = updatedCustomer?.meta_data?.find((m) => String(m.key).toLowerCase() === "bespoke_unlocked");
        const pseudoMeta = updatedCustomer?.meta_data?.find((m) => String(m.key).toLowerCase() === "pseudo_name");
        const isTrue = (val) => {
          if (typeof val === "string") {
            const v = val.trim().toLowerCase();
            return v === "true" || v === "1" || v === "yes" || v === "on";
          }
          return val === true || val === 1;
        };
        return res.json({
          success: true,
          message: "Existing profile updated for Bespoke.",
          isExisting: true,
          onWaitlist: true,
          user: {
            id: customerId,
            email,
            onWaitlist: isTrue(waitlistMeta?.value),
            bespokeUnlocked: isTrue(unlockedMeta?.value),
            pseudoName: pseudoMeta?.value || ""
          }
        });
      }
      try {
        const response = await wcSafeCall(wc2, "post", "customers", {
          email,
          username: email.split("@")[0],
          meta_data: metaToUpdate
        });
        console.log(`[CHILS & CO.] Created new WooCommerce customer for Bespoke: ${email}`);
        res.json({
          success: true,
          data: response.data,
          onWaitlist: true,
          pseudoName: pseudoName || "",
          user: {
            id: response.data.id,
            email,
            onWaitlist: true,
            pseudoName: pseudoName || ""
          }
        });
      } catch (createError) {
        const errorData = createError.response?.data;
        if (errorData?.code === "registration-error-email-exists" || errorData?.code === "customer_invalid_email") {
          console.log(`[CHILS & CO.] Email exists during create. Final recovery search for: ${email}`);
          const finalSearch = await wcSafeCall(wc2, "get", "customers", { search: email });
          const exactMatch = Array.isArray(finalSearch.data) ? finalSearch.data.find((c) => c.email?.toLowerCase() === email.toLowerCase()) : null;
          if (exactMatch) {
            const response = await wcSafeCall(wc2, "put", `customers/${exactMatch.id}`, {
              meta_data: metaToUpdate
            });
            const updatedCustomer = response.data;
            const pseudoMeta = updatedCustomer?.meta_data?.find((m) => String(m.key).toLowerCase() === "pseudo_name");
            return res.json({
              success: true,
              message: "Customer tagged via recovery.",
              isExisting: true,
              onWaitlist: true,
              pseudoName: pseudoMeta?.value || pseudoName || "",
              user: {
                id: exactMatch.id,
                email,
                onWaitlist: true,
                pseudoName: pseudoMeta?.value || pseudoName || ""
              }
            });
          }
          return res.json({
            success: true,
            message: "Signal acknowledged. Security verified.",
            isExisting: true,
            onWaitlist: true,
            user: {
              ...exactMatch || {},
              email,
              onWaitlist: true,
              pseudoName: pseudoName || ""
            }
          });
        }
        throw createError;
      }
    } catch (error) {
      console.error("[CHILS & CO.] Waitlist Processing Error:", error.response?.data || error);
      res.status(500).json({ message: "Failed to process waitlist signal" });
    }
  });
  app.post("/api/bespoke/check-status", async (req, res) => {
    try {
      const { email: rawEmail } = req.body;
      const email = (rawEmail || "").toLowerCase().trim();
      if (!email) return res.status(400).json({ message: "Email is required" });
      const wc2 = getWooCommerce();
      if (!wc2) return res.json({ onWaitlist: false });
      console.log(`[CHILS & CO.] Status check search for: ${email}`);
      let customer = null;
      try {
        const response = await wcSafeCall(wc2, "get", "customers", { search: email, per_page: 20 });
        if (response && Array.isArray(response.data)) {
          customer = response.data.find(
            (c) => c.email?.toLowerCase() === email || c.billing?.email?.toLowerCase() === email
          );
        }
      } catch (err) {
        console.warn("[CHILS & CO.] Search failed in status check", err);
      }
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      if (customer) {
        const waitlistMeta = customer.meta_data?.find((m) => String(m.key).toLowerCase() === "bespoke_waitlist");
        const unlockedMeta = customer.meta_data?.find((m) => String(m.key).toLowerCase() === "bespoke_unlocked");
        const coCreatorMeta = customer.meta_data?.find((m) => String(m.key).toLowerCase() === "co_creator_interest");
        const isTrue = (val) => {
          if (typeof val === "string") {
            const v = val.trim().toLowerCase();
            return v === "true" || v === "1" || v === "yes" || v === "on";
          }
          return val === true || val === 1;
        };
        const onWaitlist = isTrue(waitlistMeta?.value);
        const bespokeUnlocked = isTrue(unlockedMeta?.value);
        const coCreatorInterest = isTrue(coCreatorMeta?.value);
        console.log(`[CHILS & CO.] Status for ${email}: Waitlist=${onWaitlist}, Unlocked=${bespokeUnlocked}, CoCreator=${coCreatorInterest}`);
        return res.json({
          onWaitlist,
          bespokeUnlocked,
          coCreatorInterest,
          isExisting: true,
          email: customer.email
        });
      }
      res.json({ onWaitlist: false, isExisting: false });
    } catch (error) {
      console.error("[CHILS & CO.] Status Check Error:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });
  app.get("/api/stats", async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      if (!wc2) return res.json({ waitlistPool: 0, coCreators: 0 });
      const response = await wcSafeCall(wc2, "get", "customers", { per_page: 50 });
      const totalUsers = parseInt(response.headers?.["x-wp-total"] || "0", 10);
      const customers = response?.data || [];
      const waitlistCount = customers.filter(
        (c) => c.meta_data?.some((m) => String(m.key).toLowerCase() === "bespoke_waitlist" && String(m.value) === "true")
      ).length;
      const coCreatorCount = customers.filter(
        (c) => c.meta_data?.some((m) => String(m.key).toLowerCase() === "co_creator_interest" && String(m.value) === "true")
      ).length;
      const ratioWaitlist = customers.length > 0 ? waitlistCount / customers.length : 0;
      const ratioCoCreator = customers.length > 0 ? coCreatorCount / customers.length : 0;
      const realWaitlist = Math.floor(totalUsers * ratioWaitlist);
      const realCoCreators = Math.floor(totalUsers * ratioCoCreator);
      res.json({
        waitlistPool: realWaitlist || waitlistCount,
        coCreators: realCoCreators || coCreatorCount,
        totalBase: totalUsers
      });
    } catch (error) {
      console.error("[CHILS & CO.] Stats Fetch Error:", error);
      res.json({ waitlistPool: 0, coCreators: 0 });
    }
  });
  app.post("/api/cocreator/interest", async (req, res) => {
    try {
      const { email: rawEmail, pseudoName } = req.body;
      const email = (rawEmail || "").toLowerCase();
      if (!email) return res.status(400).json({ message: "Email is required" });
      const wc2 = getWooCommerce();
      if (!wc2) {
        console.log("[CHILS & CO.] No WooCommerce credentials. Co-Creator interest mocked.");
        return res.json({ success: true, message: "Interest signal received (Mock Mode)" });
      }
      console.log(`[CHILS & CO.] Processing Co-Creator interest for: ${email}`, { pseudoName });
      let customerId = null;
      try {
        const response = await wcSafeCall(wc2, "get", "customers", { email });
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          customerId = response.data[0].id;
        } else {
          const search = await wcSafeCall(wc2, "get", "customers", { search: email });
          if (search && Array.isArray(search.data) && search.data.length > 0) {
            const match = search.data.find((c) => c.email?.toLowerCase() === email.toLowerCase());
            if (match) customerId = match.id;
          }
        }
      } catch (err) {
        console.warn("[CHILS & CO.] Search failed", err);
      }
      const metaToUpdate = [
        { key: "co_creator_interest", value: "true" }
      ];
      if (pseudoName) {
        metaToUpdate.push({ key: "pseudo_name", value: pseudoName });
      }
      if (customerId) {
        const response = await wcSafeCall(wc2, "put", `customers/${customerId}`, {
          meta_data: metaToUpdate
        });
        const updatedCustomer = response.data;
        const coCreatorMeta = updatedCustomer?.meta_data?.find((m) => String(m.key).toLowerCase() === "co_creator_interest");
        const pseudoMeta = updatedCustomer?.meta_data?.find((m) => String(m.key).toLowerCase() === "pseudo_name");
        const isTrue = (val) => {
          if (typeof val === "string") {
            const v = val.trim().toLowerCase();
            return v === "true" || v === "1" || v === "yes" || v === "on";
          }
          return val === true || val === 1;
        };
        return res.json({
          success: true,
          message: "Profile updated with interest.",
          coCreatorInterest: true,
          pseudoName: pseudoMeta?.value || pseudoName || "",
          user: {
            id: customerId,
            email,
            coCreatorInterest: true,
            pseudoName: pseudoMeta?.value || pseudoName || ""
          }
        });
      }
      try {
        const response = await wcSafeCall(wc2, "post", "customers", {
          email,
          username: email.split("@")[0],
          meta_data: metaToUpdate
        });
        res.json({
          success: true,
          coCreatorInterest: true,
          pseudoName: pseudoName || "",
          user: {
            id: response.data.id,
            email,
            coCreatorInterest: true,
            pseudoName: pseudoName || ""
          }
        });
      } catch (createError) {
        const errorData = createError.response?.data;
        if (errorData?.code === "registration-error-email-exists" || errorData?.code === "customer_invalid_email") {
          const finalSearch = await wcSafeCall(wc2, "get", "customers", { search: email });
          const exactMatch = finalSearch && Array.isArray(finalSearch.data) ? finalSearch.data.find((c) => c.email?.toLowerCase() === email.toLowerCase()) : null;
          if (exactMatch) {
            await wcSafeCall(wc2, "put", `customers/${exactMatch.id}`, {
              meta_data: metaToUpdate
            });
            return res.json({
              success: true,
              coCreatorInterest: true,
              pseudoName,
              user: {
                ...exactMatch,
                coCreatorInterest: true,
                pseudoName: pseudoName || ""
              }
            });
          }
          return res.json({
            success: true,
            coCreatorInterest: true,
            pseudoName,
            user: {
              email,
              coCreatorInterest: true,
              pseudoName: pseudoName || ""
            }
          });
        }
        throw createError;
      }
    } catch (error) {
      console.error("[CHILS & CO.] Co-Creator Processing Error:", error.response?.data || error);
      res.status(500).json({ message: "Failed to process interest signal" });
    }
  });
  app.post("/api/cocreator/check-status", async (req, res) => {
    try {
      const { email: rawEmail } = req.body;
      const email = (rawEmail || "").toLowerCase().trim();
      if (!email) return res.status(400).json({ message: "Email is required" });
      const wc2 = getWooCommerce();
      if (!wc2) return res.json({ coCreatorInterest: false });
      console.log(`[CHILS & CO.] Co-Creator status check search for: ${email}`);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      let customer = null;
      const response = await wcSafeCall(wc2, "get", "customers", { search: email });
      if (response && Array.isArray(response.data)) {
        customer = response.data.find((c) => c.email?.toLowerCase() === email);
      }
      if (customer) {
        const getMetaValue = (metaData, key) => {
          const match = metaData?.find((m) => {
            const k = String(m.key).toLowerCase();
            return k === key || k === `_${key}` || k === key.replace(/_/g, "-");
          });
          return match?.value;
        };
        const isTrue = (val) => {
          if (val === true || val === 1 || val === "1") return true;
          if (typeof val === "string") {
            const v = val.trim().toLowerCase();
            return v === "true" || v === "yes" || v === "on" || v === "active";
          }
          return false;
        };
        const coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
        const pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || "";
        return res.json({
          coCreatorInterest,
          pseudoName
        });
      }
      res.json({ coCreatorInterest: false, pseudoName: "" });
    } catch (error) {
      res.status(500).json({ message: "Failed to check status" });
    }
  });
  app.post("/api/custom/quote", async (req, res) => {
    try {
      const { name, email, phone, productType, quantity, designFile, additionalNotes } = req.body;
      if (!name || !email || !phone || !productType || !quantity) {
        return res.status(400).json({ message: "Name, email, phone, product type, and quantity are required." });
      }
      let fileUrl = "";
      if (designFile && typeof designFile === "string" && designFile.includes(";base64,")) {
        try {
          const parts = designFile.split(";base64,");
          const mime = parts[0].match(/data:(.*)/)?.[1] || "";
          const ext = mime.split("/")[1] || "png";
          const base64Content = parts[1];
          const buffer = Buffer.from(base64Content, "base64");
          const filename = `design-${Date.now()}-${Math.floor(Math.random() * 1e3)}.${ext}`;
          fileUrl = saveUpload("custom_designs", filename, buffer);
        } catch (err) {
          console.error("[CHILS & CO.] Failed to save design file:", err);
        }
      }
      const QUOTES_FILE = dataFile("quotes.json");
      let quotes = [];
      if (fs4.existsSync(QUOTES_FILE)) {
        try {
          quotes = JSON.parse(fs4.readFileSync(QUOTES_FILE, "utf-8"));
        } catch (e) {
          quotes = [];
        }
      }
      const newQuote = {
        id: `q-${Date.now()}`,
        name,
        email,
        phone,
        productType,
        quantity: parseInt(quantity, 10) || 1,
        designFile: fileUrl,
        additionalNotes,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      quotes.push(newQuote);
      fs4.writeFileSync(QUOTES_FILE, JSON.stringify(quotes, null, 2));
      console.log(`[CHILS & CO.] Custom quote request logged for ${email}`);
      res.json({ success: true, message: "Quote request successfully processed", quote: newQuote });
    } catch (error) {
      console.error("[CHILS & CO.] Custom Quote Error:", error);
      res.status(500).json({ message: error.message || "Failed to process quote request" });
    }
  });
  app.get("/api/bespoke/list", authenticateToken, async (req, res) => {
    try {
      const adminEmails = ["chilsandco.com@gmail.com", "chilsandco@gmail.com"];
      const userEmail = req.user?.email || "";
      if (!adminEmails.some((email) => email.toLowerCase() === userEmail.toLowerCase())) {
        return res.status(403).json({ message: "Access Denied: Admin clearance required." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) return res.json([]);
      const response = await wcSafeCall(wc2, "get", "customers", {
        per_page: 100,
        role: "all"
      });
      if (response && Array.isArray(response.data)) {
        const getMetaValue = (metaData, key) => {
          const match = metaData?.find((m) => {
            const k = String(m.key).toLowerCase();
            return k === key || k === `_${key}` || k === key.replace(/_/g, "-");
          });
          return match?.value;
        };
        const isTrue = (val) => {
          if (val === true || val === 1 || val === "1") return true;
          if (typeof val === "string") {
            const v = val.trim().toLowerCase();
            return v === "true" || v === "yes" || v === "on" || v === "active";
          }
          return false;
        };
        const waitlisted = response.data.filter((c) => isTrue(getMetaValue(c.meta_data, "bespoke_waitlist"))).map((c) => ({
          id: c.id,
          email: c.email,
          billing_email: c.billing?.email || c.email,
          username: c.username,
          date_created: c.date_created,
          pseudo_name: getMetaValue(c.meta_data, "pseudo_name") || "",
          is_co_creator: isTrue(getMetaValue(c.meta_data, "co_creator_interest"))
        }));
        return res.json(waitlisted);
      }
      res.json([]);
    } catch (error) {
      console.error("[CHILS & CO.] Fetch Bespoke List Error:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      if (!wc2) return res.json(req.user);
      let customer = null;
      let customerIdFromToken = req.user?.id || req.user?.data?.user?.id || req.user?.user_id;
      const email = (req.user?.email || req.user?.data?.user?.user_email || "").toLowerCase();
      try {
        if (customerIdFromToken) {
          const idResponse = await wcSafeCall(wc2, "get", `customers/${customerIdFromToken}`);
          if (idResponse && idResponse.status === 200 && idResponse.data?.id) {
            customer = idResponse.data;
          }
        }
        if (!customer && email) {
          const directResponse = await wcSafeCall(wc2, "get", "customers", { email });
          if (directResponse && Array.isArray(directResponse.data) && directResponse.data.length > 0) {
            customer = directResponse.data[0];
          } else {
            const searchResponse = await wcSafeCall(wc2, "get", "customers", { search: email });
            if (searchResponse && Array.isArray(searchResponse.data)) {
              customer = searchResponse.data.find((c) => c.email?.toLowerCase() === email.toLowerCase());
            }
          }
          if (!customer) {
            const username = email.split("@")[0];
            const usernameResponse = await wcSafeCall(wc2, "get", "customers", { search: username });
            if (usernameResponse && Array.isArray(usernameResponse.data)) {
              customer = usernameResponse.data.find(
                (c) => c.email?.toLowerCase() === email.toLowerCase() || c.username?.toLowerCase() === username.toLowerCase()
              );
            }
          }
        }
      } catch (lookupErr) {
        console.warn("[CHILS & CO.] Customer lookup failed in auth/me", lookupErr);
      }
      const getMetaValue = (metaData, key) => {
        const match = metaData?.find((m) => {
          const k = String(m.key).toLowerCase();
          return k === key || k === `_${key}` || k === key.replace(/_/g, "-");
        });
        return match?.value;
      };
      const isTrue = (val) => {
        if (val === true || val === 1 || val === "1") return true;
        if (typeof val === "string") {
          const v = val.trim().toLowerCase();
          return v === "true" || v === "yes" || v === "on" || v === "active";
        }
        return false;
      };
      if (customer) {
        const onWaitlist = isTrue(getMetaValue(customer.meta_data, "bespoke_waitlist"));
        const bespokeUnlocked = isTrue(getMetaValue(customer.meta_data, "bespoke_unlocked"));
        const coCreatorInterest = isTrue(getMetaValue(customer.meta_data, "co_creator_interest"));
        const pseudoName = getMetaValue(customer.meta_data, "pseudo_name") || "";
        const wishlistValue = getMetaValue(customer.meta_data, "wishlist");
        let wishlist = [];
        if (wishlistValue) {
          try {
            wishlist = JSON.parse(wishlistValue);
            if (!Array.isArray(wishlist)) wishlist = [];
          } catch (e) {
            console.error("[CHILS & CO.] Failed to parse wishlist metadata:", e);
          }
        }
        const cartValue = getMetaValue(customer.meta_data, "cart");
        let cart = [];
        if (cartValue) {
          try {
            cart = JSON.parse(cartValue);
            if (!Array.isArray(cart)) cart = [];
          } catch (e) {
            console.error("[CHILS & CO.] Failed to parse cart metadata:", e);
          }
        }
        const enhancedUser = {
          ...req.user,
          ...customer,
          onWaitlist,
          bespokeUnlocked,
          coCreatorInterest,
          pseudoName,
          wishlist,
          cart,
          id: customer.id,
          email: (customer.email || email).toLowerCase()
        };
        return res.json(enhancedUser);
      }
      res.json(req.user);
    } catch (error) {
      console.warn("[CHILS & CO.] Recovery failed for auth meta", error);
      res.json(req.user);
    }
  });
  app.put("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const { first_name, last_name, email, phone } = req.body;
      if (!first_name?.trim() || !last_name?.trim()) {
        return res.status(400).json({ message: "First name and last name are required." });
      }
      if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
        return res.status(400).json({ message: "A valid email address is required." });
      }
      const sanitizedPhone = (phone || "").replace(/\D/g, "").slice(-10);
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json({ ...req.user, first_name: first_name.trim(), last_name: last_name.trim(), email: email.toLowerCase().trim() });
      }
      const customerId = req.user?.id || req.user?.data?.user?.id;
      if (!customerId) {
        return res.status(400).json({ message: "Unable to resolve customer identity." });
      }
      const updatePayload = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        billing: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.toLowerCase().trim()
        }
      };
      if (sanitizedPhone) {
        updatePayload.billing.phone = sanitizedPhone;
      }
      const response = await wcSafeCall(wc2, "put", `customers/${customerId}`, updatePayload);
      const updatedCustomer = response.data;
      const getMetaValue = (metaData, key) => {
        const match = metaData?.find((m) => {
          const k = String(m.key).toLowerCase();
          return k === key || k === `_${key}` || k === key.replace(/_/g, "-");
        });
        return match?.value;
      };
      const isTrue = (val) => {
        if (val === true || val === 1 || val === "1") return true;
        if (typeof val === "string") {
          const v = val.trim().toLowerCase();
          return v === "true" || v === "yes" || v === "on" || v === "active";
        }
        return false;
      };
      return res.json({
        ...req.user,
        ...updatedCustomer,
        onWaitlist: isTrue(getMetaValue(updatedCustomer.meta_data, "bespoke_waitlist")),
        bespokeUnlocked: isTrue(getMetaValue(updatedCustomer.meta_data, "bespoke_unlocked")),
        coCreatorInterest: isTrue(getMetaValue(updatedCustomer.meta_data, "co_creator_interest")),
        pseudoName: getMetaValue(updatedCustomer.meta_data, "pseudo_name") || "",
        id: updatedCustomer.id,
        email: (updatedCustomer.email || email).toLowerCase()
      });
    } catch (error) {
      console.error("[CHILS & CO.] Profile update failed:", error);
      const msg = error.response?.data?.message || "Profile update failed. Please try again.";
      res.status(500).json({ message: msg });
    }
  });
  app.post("/api/wishlist", authenticateToken, async (req, res) => {
    try {
      const { wishlist } = req.body;
      if (!Array.isArray(wishlist)) {
        return res.status(400).json({ message: "Wishlist must be an array of products." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json({ success: true, message: "Wishlist updated (Mock Mode)", wishlist });
      }
      const customerId = req.user?.id || req.user?.data?.user?.id || req.user?.user_id;
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID not found in token." });
      }
      console.log(`[CHILS & CO.] Updating wishlist for customer ${customerId}.`);
      await wcSafeCall(wc2, "put", `customers/${customerId}`, {
        meta_data: [
          { key: "wishlist", value: JSON.stringify(wishlist) }
        ]
      });
      res.json({ success: true, message: "Wishlist updated successfully", wishlist });
    } catch (error) {
      console.error("[CHILS & CO.] Wishlist Update Error:", error);
      res.status(500).json({ message: "Failed to update wishlist due to server error" });
    }
  });
  app.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const { cart } = req.body;
      if (!Array.isArray(cart)) {
        return res.status(400).json({ message: "Cart must be an array of cart items." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json({ success: true, message: "Cart updated (Mock Mode)", cart });
      }
      const customerId = req.user?.id || req.user?.data?.user?.id || req.user?.user_id;
      if (!customerId) {
        return res.status(400).json({ message: "Customer ID not found in token." });
      }
      console.log(`[CHILS & CO.] Updating cart for customer ${customerId}.`);
      await wcSafeCall(wc2, "put", `customers/${customerId}`, {
        meta_data: [
          { key: "cart", value: JSON.stringify(cart) }
        ]
      });
      res.json({ success: true, message: "Cart updated successfully", cart });
    } catch (error) {
      console.error("[CHILS & CO.] Cart Update Error:", error);
      res.status(500).json({ message: "Failed to update cart due to server error" });
    }
  });
  app.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json([
          mapOrderToSignal({
            id: 101,
            number: "WC-101",
            status: "processing",
            date_created: (/* @__PURE__ */ new Date()).toISOString(),
            total: "4500.00",
            currency: "INR",
            line_items: [{ name: "SYNTAX OVERLOAD TEE", quantity: 1, price: "4500.00", total: "4500.00" }],
            shipping: { address_1: "System Hub 01", city: "Neo Metro" },
            shipping_lines: [{ method_title: "Drone Relay" }]
          })
        ]);
      }
      let customerId = req.user?.id || req.user?.data?.user?.id || req.user?.user?.id || req.user?.sub || req.user?.data?.id;
      const userEmail = req.user?.email || req.user?.data?.user?.email || req.user?.user_email;
      if (!customerId && userEmail) {
        console.log(`[CHILS & CO.] ID missing from token, searching WC by email: ${userEmail}`);
        try {
          const customerSearch = await wcSafeCall(wc2, "get", "customers", { email: userEmail });
          if (customerSearch && Array.isArray(customerSearch.data) && customerSearch.data.length > 0) {
            customerId = customerSearch.data[0].id;
            console.log(`[CHILS & CO.] Found customer ID linked to email: ${customerId}`);
          }
        } catch (searchErr) {
          console.error("[CHILS & CO.] Email search fallback failed:", searchErr);
        }
      }
      let orders;
      if (customerId) {
        console.log(`[CHILS & CO.] Fetching orders for customer ID: ${customerId}`);
        const response = await wcSafeCall(wc2, "get", "orders", {
          customer: customerId,
          per_page: 50
        });
        orders = response.data;
      } else if (userEmail) {
        console.log(`[CHILS & CO.] No customer ID found, fetching recent orders to filter by email: ${userEmail}`);
        const response = await wcSafeCall(wc2, "get", "orders", { per_page: 100 });
        orders = response.data.filter((o) => o.billing?.email?.toLowerCase() === userEmail.toLowerCase());
      } else {
        return res.status(400).json({ message: "Unable to identify customer from token" });
      }
      if (!Array.isArray(orders)) {
        console.warn("[CHILS & CO.] WC did not return an array of orders.");
        return res.json([]);
      }
      console.log(`[CHILS & CO.] Successfully retrieved ${orders.length} orders.`);
      res.json(orders.map(mapOrderToSignal));
    } catch (error) {
      console.error("WooCommerce Orders Error:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json(mapOrderToSignal({
          id: req.params.id,
          status: "completed",
          date_created: (/* @__PURE__ */ new Date()).toISOString(),
          date_completed: (/* @__PURE__ */ new Date()).toISOString(),
          total: "4500.00",
          currency: "INR",
          line_items: [{ name: "SYNTAX OVERLOAD TEE", quantity: 1, price: "4500.00", total: "4500.00" }],
          shipping: { address_1: "System Hub 01", city: "Neo Metro" },
          shipping_lines: [{ method_title: "Drone Relay" }]
        }));
      }
      const response = await wcSafeCall(wc2, "get", `orders/${req.params.id}`);
      res.json(mapOrderToSignal(response.data));
    } catch (error) {
      console.error("WooCommerce Order Detail Error:", error);
      res.status(404).json({ message: "Signal not found" });
    }
  });
  app.get("/api/orders/status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const signal = req.query.signal;
      const merchantTransactionId = req.query.transaction;
      if (!signal) {
        return res.status(400).json({ message: "Signal hash required for verification." });
      }
      const expectedSignal = toSignalId(id);
      if (signal !== expectedSignal) {
        return res.status(403).json({ message: "Signal mismatch. Verification failed." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.json({
          id,
          status: "processing",
          total: "4500.00",
          currency: "INR"
        });
      }
      const response = await wcSafeCall(wc2, "get", `orders/${id}`);
      const order = await reconcilePendingPhonePeOrder(wc2, response.data, merchantTransactionId);
      res.json({
        id: order.id,
        status: order.status,
        total: order.total,
        currency: order.currency,
        date_created: order.date_created,
        orderKey: order.order_key
      });
    } catch (error) {
      res.status(404).json({ message: "Signal not found in system archives." });
    }
  });
  const PENDING_SWAPS_FILE = dataFile("pending_swaps.json");
  const activeRmaSubmissions = /* @__PURE__ */ new Set();
  const savePendingSwap = (txId, payload) => {
    let pending = {};
    if (fs4.existsSync(PENDING_SWAPS_FILE)) {
      try {
        pending = JSON.parse(fs4.readFileSync(PENDING_SWAPS_FILE, "utf8"));
      } catch (e) {
        pending = {};
      }
    }
    pending[txId] = payload;
    fs4.writeFileSync(PENDING_SWAPS_FILE, JSON.stringify(pending, null, 2), "utf8");
  };
  const getPendingSwap = (txId) => {
    if (!fs4.existsSync(PENDING_SWAPS_FILE)) return null;
    try {
      const pending = JSON.parse(fs4.readFileSync(PENDING_SWAPS_FILE, "utf8"));
      return pending[txId] || null;
    } catch (e) {
      return null;
    }
  };
  const removePendingSwap = (txId) => {
    if (!fs4.existsSync(PENDING_SWAPS_FILE)) return;
    try {
      const pending = JSON.parse(fs4.readFileSync(PENDING_SWAPS_FILE, "utf8"));
      delete pending[txId];
      fs4.writeFileSync(PENDING_SWAPS_FILE, JSON.stringify(pending, null, 2), "utf8");
    } catch (e) {
    }
  };
  app.get("/api/orders/rma/reconcile/:txId", async (req, res) => {
    try {
      const { txId } = req.params;
      if (!txId.startsWith("RMA_")) {
        return res.status(400).json({ message: "Invalid transaction ID." });
      }
      console.log(`[CHILS & CO.] Reconciling RMA Delta Payment for transaction: ${txId}`);
      const statusData = await verifyPhonePeTransaction(txId);
      if (!statusData) {
        return res.status(404).json({ message: "Transaction not found." });
      }
      const isSuccess = statusData.success && statusData.code === "PAYMENT_SUCCESS";
      const transactionId = statusData.data?.transactionId || txId;
      const orderId = txId.split("_")[1];
      if (isSuccess) {
        const cachedData = getPendingSwap(txId);
        if (cachedData) {
          if (activeRmaSubmissions.has(txId)) {
            console.log(`[CHILS & CO.] RMA ${txId} is already being processed. Ignoring duplicate reconciliation request.`);
            return res.json({ success: true, message: "RMA swap is already being processed." });
          }
          activeRmaSubmissions.add(txId);
          try {
            console.log(`[CHILS & CO.] Pull-based reconciliation verified COMPLETED for RMA: ${txId}. Submitting return...`);
            await executeWooCommerceRmaSubmit(
              orderId,
              cachedData.reason,
              cachedData.description,
              cachedData.products,
              cachedData.images,
              cachedData.swapInfo,
              transactionId
            );
            removePendingSwap(txId);
            return res.json({ success: true, message: "RMA swap processed successfully." });
          } finally {
            activeRmaSubmissions.delete(txId);
          }
        } else {
          console.log(`[CHILS & CO.] RMA ${txId} already processed (no cache payload found).`);
          return res.json({ success: true, message: "RMA swap already processed." });
        }
      } else {
        console.log(`[CHILS & CO.] RMA ${txId} payment not successful yet: ${statusData.message}`);
        return res.json({ success: false, message: `Payment not verified: ${statusData.message}` });
      }
    } catch (error) {
      console.error("[CHILS & CO.] RMA Reconciliation Error:", error);
      res.status(500).json({ message: error.message || "Failed to reconcile RMA swap." });
    }
  });
  const executeWooCommerceRmaSubmit = async (orderId, reason, description, products, images, swapInfoList, paidTxId) => {
    const rmaSecret = process.env.RMA_API_SECRET || "";
    const rawWpUrl = process.env.WOOCOMMERCE_URL || "https://chilsandco.com";
    const wpUrl = rawWpUrl.endsWith("/") ? rawWpUrl.slice(0, -1) : rawWpUrl;
    const rmaSecretClean = rmaSecret.trim();
    const authHeader = "Basic " + Buffer.from(`secret_key:${rmaSecretClean}`).toString("base64");
    const wc2 = getWooCommerce();
    if (paidTxId && wc2) {
      try {
        const notesRes = await wcSafeCall(wc2, "get", `orders/${orderId}/notes`);
        const hasNote = Array.isArray(notesRes.data) && notesRes.data.some((n) => n.note?.includes(paidTxId));
        if (hasNote) {
          console.log(`[CHILS & CO.] RMA Delta Payment transaction ${paidTxId} was already logged in parent order ${orderId}. Skipping duplicate RMA processing.`);
          return;
        }
      } catch (noteCheckErr) {
        console.warn(`[CHILS & CO.] RMA duplicate note verification failed:`, noteCheckErr.message || noteCheckErr);
      }
    }
    let actionsSummary = "";
    if (products && Array.isArray(products)) {
      actionsSummary = products.map((p) => {
        let actDesc = "Refund";
        if (p.action === "size_exchange") {
          actDesc = `Exchange (Size Swap to: ${p.selectedSize || "?"})`;
        } else if (p.action === "style_exchange") {
          actDesc = `Swap to: ${p.exchangeProductName || "Alternative product"} (Size: ${p.exchangeSize || "?"})`;
        }
        return `- Product ID: ${p.productId} | Qty: ${p.quantity} | Action: ${actDesc}`;
      }).join("\n");
    }
    const siteBase = (process.env.PUBLIC_SITE_URL || "https://chilsandco.com").replace(/\/$/, "");
    const photoUrls = [];
    for (const [idx, img] of (Array.isArray(images) ? images : []).entries()) {
      try {
        if (typeof img === "string" && /^https?:/.test(img)) {
          photoUrls.push(img);
          continue;
        }
        const m = typeof img === "string" ? img.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/s) : null;
        if (!m) continue;
        const name = `ret-${orderId}-${Date.now()}-${idx}-${crypto3.randomBytes(6).toString("hex")}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
        photoUrls.push(siteBase + saveUpload("returns", name, Buffer.from(m[2], "base64")));
      } catch (err) {
        console.error("[CHILS & CO.] Could not save a return photo:", err.message);
      }
    }
    const fullReason = `Reason: ${reason}
Description: ${description}
Images: ${photoUrls.length ? photoUrls.join(", ") : "None"}

Return/Exchange Actions Chosen:
${actionsSummary}`;
    const rmaPayload = {
      order_id: orderId.toString(),
      reason: fullReason
    };
    if (products && products.length > 0) {
      rmaPayload.products = JSON.stringify(products.map((p) => ({
        product_id: parseInt(p.productId, 10),
        qty: parseInt(p.quantity, 10)
      })));
    }
    console.log(`[CHILS & CO.] Transmitting payload to: ${wpUrl}/wp-json/rma/refund-request`);
    const rmaResponse = await fetch(`${wpUrl}/wp-json/rma/refund-request?secret_key=${rmaSecretClean}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "secret_key": rmaSecretClean,
        "wps-rma-secret-key": rmaSecretClean,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      body: JSON.stringify(rmaPayload)
    });
    if (!rmaResponse.ok) {
      const text = await rmaResponse.text();
      console.error(`[CHILS & CO.] RMA Rejection: ${rmaResponse.status} - ${text}`);
      throw new Error(`RMA API failed: ${text}`);
    }
    if (wc2) {
      try {
        const orderRes = await wcSafeCall(wc2, "get", `orders/${orderId}`);
        const currentMeta = orderRes.data.meta_data || [];
        let updatedMeta = currentMeta.filter((m) => !["_rma_swap_info", "_rma_refund_delta_amount", "rma_swap_info", "rma_refund_delta_amount"].includes(m.key));
        updatedMeta = updatedMeta.filter((m) => m.key !== "_chils_return_request");
        updatedMeta.push({ key: "_chils_return_request", value: JSON.stringify({ subject: fullReason, at: (/* @__PURE__ */ new Date()).toISOString() }) });
        if (swapInfoList && swapInfoList.length > 0) {
          updatedMeta.push({
            key: "rma_swap_info",
            value: JSON.stringify(swapInfoList)
          });
        }
        let noteText = "";
        const refundDeltaTotal = swapInfoList && swapInfoList.length > 0 ? swapInfoList.filter((s) => s.type === "refund").reduce((acc, curr) => acc + curr.delta, 0) : 0;
        if (refundDeltaTotal > 0) {
          updatedMeta.push({
            key: "rma_refund_delta_amount",
            value: refundDeltaTotal.toString()
          });
        }
        if (swapInfoList && swapInfoList.length > 0) {
          const swapLines = swapInfoList.map((s) => {
            const detail = `${s.originalProductName} swapped for ${s.swapProductName} (${s.swapSize})`;
            const diff = s.type === "refund" ? `Refund Delta Due: \u20B9${s.delta}` : `Additional Paid: \u20B9${s.delta}`;
            return `- ${detail} | ${diff}`;
          }).join("\n");
          noteText = `Reversal Style Swap initiated.

Swap Specifications:
${swapLines}
`;
          if (paidTxId) {
            noteText += `
Delta payment verified successfully. Transaction ID: ${paidTxId}`;
          } else {
            if (refundDeltaTotal > 0) {
              noteText += `
Delta refund pending: \u20B9${refundDeltaTotal} to be refunded to source account.`;
            }
          }
        } else {
          noteText = `Standard return initiated.
Reason: ${reason}${description ? `
Customer's note: ${description}` : ""}${photoUrls.length ? `
Photos: ${photoUrls.join(" ")}` : ""}`;
        }
        const updatePayload = {
          meta_data: updatedMeta
        };
        if (refundDeltaTotal > 0) {
          updatePayload.status = "refund-requested";
          console.log(`[CHILS & CO.] Setting WooCommerce order status to 'refund-requested' with refund delta: \u20B9${refundDeltaTotal}`);
        }
        try {
          await wcSafeCall(wc2, "put", `orders/${orderId}`, updatePayload);
          console.log(`[CHILS & CO.] WooCommerce Order metadata logged for RMA ${orderId} (Status updated: ${!!updatePayload.status})`);
        } catch (statusErr) {
          console.warn(`[CHILS & CO.] WooCommerce status 'refund-requested' failed or rejected by API:`, statusErr.message || statusErr);
          delete updatePayload.status;
          await wcSafeCall(wc2, "put", `orders/${orderId}`, updatePayload);
          console.log(`[CHILS & CO.] WooCommerce metadata updated successfully without status change.`);
        }
        try {
          await wcSafeCall(wc2, "post", `orders/${orderId}/notes`, {
            note: noteText,
            customer_note: false
          });
          console.log(`[CHILS & CO.] Detailed audit note posted to WooCommerce order ${orderId} notes.`);
        } catch (noteErr) {
          console.error(`[CHILS & CO.] Failed to post order note to WooCommerce order ${orderId}:`, noteErr.message || noteErr);
        }
        if (swapInfoList && swapInfoList.length > 0) {
          try {
            const parentOrder = orderRes.data;
            const lineItems = [];
            let totalExchangeCredit = 0;
            for (const s of swapInfoList) {
              const altRes = await wcSafeCall(wc2, "get", `products/${s.swapProductId}`);
              lineItems.push({
                product_id: parseInt(s.swapProductId, 10),
                quantity: s.quantity,
                name: `${s.swapProductName} (Size: ${s.swapSize})`
              });
              const originalItem = parentOrder.line_items.find((item) => item.product_id.toString() === s.originalProductId.toString());
              const originalPrice = originalItem ? parseFloat(originalItem.price.toString()) : parseFloat(altRes.data.price.toString());
              totalExchangeCredit += originalPrice * s.quantity;
            }
            let totalSwappedCost = 0;
            for (const s of swapInfoList) {
              const altRes = await wcSafeCall(wc2, "get", `products/${s.swapProductId}`);
              const altPrice = parseFloat(altRes.data.price.toString());
              totalSwappedCost += altPrice * s.quantity;
            }
            const exchangeCreditClamped = Math.min(totalExchangeCredit, totalSwappedCost);
            const feeLines = [{
              name: `Exchange Credit (from Signal #${toSignalId(orderId)})`,
              total: `-${exchangeCreditClamped.toFixed(2)}`,
              tax_status: "none"
            }];
            const exchangeOrderPayload = {
              payment_method: "phonepe",
              payment_method_title: "PhonePe (Swap Upgrade)",
              set_paid: true,
              status: "processing",
              customer_id: parentOrder.customer_id,
              billing: parentOrder.billing,
              shipping: parentOrder.shipping,
              line_items: lineItems,
              fee_lines: feeLines,
              meta_data: [
                { key: "parent_exchange_order_id", value: orderId.toString() },
                { key: "rma_swap_info", value: JSON.stringify(swapInfoList) }
              ]
            };
            console.log(`[CHILS & CO.] Creating WooCommerce Exchange Order for parent Order ${orderId}...`);
            const newOrderRes = await wcSafeCall(wc2, "post", "orders", exchangeOrderPayload);
            const newOrder = newOrderRes.data;
            console.log(`[CHILS & CO.] Exchange Order created successfully: ID #${newOrder.id}`);
            await wcSafeCall(wc2, "post", `orders/${orderId}/notes`, {
              note: `Reversal Style Swap completed. Exchange Order #${newOrder.id} has been generated for fulfillment.`,
              customer_note: false
            });
            await wcSafeCall(wc2, "post", `orders/${newOrder.id}/notes`, {
              note: `This order was generated as a style swap exchange from parent Signal #${toSignalId(orderId)}.`,
              customer_note: false
            });
          } catch (exchangeErr) {
            console.error("[CHILS & CO.] Failed to create WooCommerce Exchange Order:", exchangeErr.message || exchangeErr);
          }
        }
      } catch (err) {
        console.error("[CHILS & CO.] Failed to write WooCommerce RMA metadata/notes:", err);
      }
    }
    wcSafeCall(getWooCommerce(), "post", `orders/${orderId}/notes`, {
      note: "We've received your return request. Our team looks at every request, usually within a day, and we'll email you once it's approved with the pickup details.",
      customer_note: true
    }).catch((err) => console.error("[CHILS & CO.] Return confirmation note failed:", err?.message));
  };
  app.post("/api/orders/:id/return", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, description, products, images } = req.body;
      console.log(`[CHILS & CO.] Initiating return logic for order ${id}`);
      const wc2 = getWooCommerce();
      if (!wc2) throw new Error("WooCommerce not configured.");
      const orderResponse = await wcSafeCall(wc2, "get", `orders/${id}`);
      const order = orderResponse.data;
      const parentExchangeOrderId = order.meta_data?.find((m) => m.key === "parent_exchange_order_id" || m.key === "_parent_exchange_order_id")?.value;
      if (parentExchangeOrderId) {
        return res.status(400).json({ message: "Style exchange is limited to 1 cycle. This order was generated via a swap and is not eligible for another reversal." });
      }
      const getProductDetails = async (productId) => {
        const cached = globalProductsCache?.find((p) => p.id.toString() === productId.toString());
        if (cached) return {
          price: parseFloat(cached.price.toString()),
          image: cached.images?.[0] || null
        };
        try {
          const res2 = await wcSafeCall(wc2, "get", `products/${productId}`);
          return {
            price: parseFloat(res2.data.price.toString()),
            image: res2.data.images?.[0]?.src || null
          };
        } catch (err) {
          console.error(`Failed to fetch product details for ${productId}:`, err);
          throw new Error(`Swap product not found.`);
        }
      };
      let netDelta = 0;
      const swapInfoList = [];
      if (products && Array.isArray(products)) {
        for (const p of products) {
          if (p.action === "style_exchange") {
            const originalItem = order.line_items.find((item) => item.product_id.toString() === p.productId.toString());
            if (!originalItem) {
              throw new Error(`Original product ${p.productId} not found in order.`);
            }
            const originalPrice = parseFloat(originalItem.price.toString());
            const altDetails = await getProductDetails(p.exchangeProductId);
            const itemDelta = altDetails.price - originalPrice;
            const itemDeltaTotal = itemDelta * p.quantity;
            netDelta += itemDeltaTotal;
            swapInfoList.push({
              originalProductId: p.productId,
              originalProductName: originalItem.name,
              swapProductId: p.exchangeProductId,
              swapProductName: p.exchangeProductName || "Alternative Product",
              swapSize: p.exchangeSize || "Unknown",
              swapProductImage: altDetails.image,
              quantity: p.quantity,
              delta: Math.abs(itemDeltaTotal),
              type: itemDeltaTotal >= 0 ? "charge" : "refund"
            });
          }
        }
      }
      if (netDelta > 0) {
        const phonePeClient = getPhonePeClient();
        if (!phonePeClient) {
          throw new Error("Payment gateway configuration error.");
        }
        const timestamp = Date.now();
        const merchantTransactionId = `RMA_${id}_${timestamp}`;
        savePendingSwap(merchantTransactionId, {
          reason,
          description,
          products,
          images,
          swapInfo: swapInfoList
        });
        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.headers["host"] || req.get("host") || "www.chilsandco.com";
        const isStrictProd = process.env.PHONEPE_ENV?.toUpperCase() === "PRODUCTION";
        const siteUrl = "https://www.chilsandco.com";
        const currentOrigin = isStrictProd && host.includes("chilsandco.com") ? `${protocol}://${host}` : isStrictProd ? siteUrl : `${protocol}://${host}`;
        const redirectUrl = `${currentOrigin}/console/orders?rma_success=true&tx=${merchantTransactionId}`;
        const callbackUrl = process.env.PHONEPE_CALLBACK_URL || `${currentOrigin}/api/checkout/phonepe/callback`;
        const amountPaise = Math.max(100, Math.round(Number(netDelta) * 100));
        console.log(`[CHILS & CO.] Generating PhonePe request for RMA swap upgrade balance: ${netDelta}`);
        const requestBuilder = StandardCheckoutPayRequest.builder().merchantOrderId(merchantTransactionId.toString()).amount(amountPaise).redirectUrl(redirectUrl).message(`Swap Upgrade delta for Order #${id}`);
        if (typeof requestBuilder.callbackUrl === "function") {
          requestBuilder.callbackUrl(callbackUrl);
        }
        const payRequest = requestBuilder.build();
        const payResponse = await phonePeClient.pay(payRequest);
        return res.json({
          success: true,
          requiresPayment: true,
          paymentUrl: payResponse.redirectUrl
        });
      } else {
        await executeWooCommerceRmaSubmit(id, reason, description, products, images, swapInfoList);
        return res.json({
          success: true,
          requiresPayment: false,
          message: "Transmission verified. Return request logged."
        });
      }
    } catch (error) {
      console.error("[CHILS & CO.] Return request failure:", error);
      res.status(500).json({ message: error.message || "Failed to process return request" });
    }
  });
  app.post("/api/settings", authenticateToken, async (req, res) => {
    try {
      const adminEmails = ["chilsandco@gmail.com", "chilsandco.com@gmail.com"];
      const isAdmin = adminEmails.some((email) => email.toLowerCase() === req.user.email.toLowerCase());
      if (!isAdmin) {
        return res.status(403).json({ message: "Higher clearance required for core reconfiguration." });
      }
      const currentSettings = fs4.existsSync(SETTINGS_FILE) ? JSON.parse(fs4.readFileSync(SETTINGS_FILE, "utf-8")) : DEFAULT_SETTINGS;
      const newSettings = { ...currentSettings, ...req.body };
      fs4.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
      console.log("[CHILS & CO.] Global settings recalibrated successfully.");
      res.json({ success: true, settings: newSettings });
    } catch (error) {
      console.error("[CHILS & CO.] Settings Update Error:", error);
      res.status(500).json({ message: "Failed to calibrate settings nodes." });
    }
  });
  app.post("/api/amazon/enrich", authenticateToken, async (req, res) => {
    let groqKey = "";
    try {
      const adminEmails = ["chilsandco@gmail.com", "chilsandco.com@gmail.com"];
      const isAdmin = adminEmails.some((email) => email.toLowerCase() === req.user.email.toLowerCase());
      if (!isAdmin) {
        return res.status(403).json({ message: "Higher clearance required for catalog sync operations." });
      }
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
      }
      const settings = fs4.existsSync(SETTINGS_FILE) ? JSON.parse(fs4.readFileSync(SETTINGS_FILE, "utf-8")) : DEFAULT_SETTINGS;
      groqKey = settings.groqApiKey || process.env.GROQ_API_KEY;
      if (!groqKey) {
        return res.status(400).json({ message: "GROQ_API_KEY is not configured. Please save your Groq API Key in your Admin panel settings." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        return res.status(400).json({ message: "WooCommerce API is not configured." });
      }
      console.log(`[AMAZON ENRICH] Fetching product #${productId} from WooCommerce...`);
      const response = await wcSafeCall(wc2, "get", `products/${productId}`);
      const rawProduct = response.data;
      const swatchesData = await fetchSwatches().catch(() => ({}));
      const mappedProduct = mapProduct(rawProduct, {}, swatchesData);
      console.log(`[AMAZON ENRICH] Querying Groq AI to extract attributes for: ${mappedProduct.name}`);
      const prompt = `You are an expert system that extracts and optimizes e-commerce product listings for Amazon Seller Central inventory feeds.
Your task is to analyze the following product catalog details (WooCommerce source) and generate standard Amazon listing specifications matching the exact JSON schema defined below.

Source Product Details:
- WooCommerce Title: "${mappedProduct.name}"
- WooCommerce Categories: ${JSON.stringify(mappedProduct.categories || [])}
- Description: "${mappedProduct.description || mappedProduct.shortDescription || ""}"
- Material: "${mappedProduct.material || ""}"
- Care: "${mappedProduct.care || ""}"

You must return a single JSON object with the following fields:
- "bulletPoints": an array of exactly 5 elements. Each element must be a high-quality product highlight (max 100 characters). Each highlight must begin with a 1-3 word lead-in in ALL CAPS followed by a colon and the description (e.g. "HEAVYWEIGHT FABRIC: Made of premium 240 GSM cotton").
- "genericKeywords": a string of search terms/keywords separated by semicolons (max 250 bytes).
- "modelName": a clean model name (e.g. "Claude Culprit Sweatshirt").
- "collectionName": a clean collection name (e.g. "Autumn/Winter 2026").
- "sleeveLengthDescription": one of ["Long Sleeve", "Short Sleeve", "Sleeveless", "3/4 Sleeve"].
- "closureType": one of ["Pull-On", "Button", "Zipper", "Drawstring"].
- "apparelFabricWeightClass": one of ["Heavyweight", "Medium weight", "Lightweight"].
- "apparelFabricStretch": one of ["Low Stretch", "Non-Stretch", "Medium Stretch", "High Stretch"].
- "fitToSizeSentiment": one of ["Runs Large", "True to Size", "Runs Small"].
- "itemWeightGrams": an estimated item weight as an integer (e.g. 450).
- "colorMap": a mapping object that maps each of the product's raw colors to one of Amazon's standard color maps: ["Black", "Grey", "White", "Blue", "Red", "Green", "Yellow", "Orange", "Pink", "Purple", "Brown", "Beige", "Multicolour"].
  Raw Colors found in product: ${JSON.stringify(mappedProduct.availableColors || [])}

Format your response strictly as a single JSON object. Ensure the keys and values match the requested schema exactly.
`;
      console.log(`[AMAZON ENRICH] Dispatching direct HTTP POST to Groq completions API...`);
      const apiRes = await axios3.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: {
            type: "json_object"
          },
          temperature: 0.1
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          }
        }
      );
      const responseText = apiRes.data?.choices?.[0]?.message?.content || "{}";
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```[a-zA-Z]*\n/, "");
        cleanJson = cleanJson.replace(/\n```$/, "");
      }
      const enrichedData = JSON.parse(cleanJson.trim());
      console.log("[AMAZON ENRICH] Groq enrichment successful:", enrichedData);
      res.json({ success: true, product: mappedProduct, enrichedAttributes: enrichedData });
    } catch (error) {
      console.error("[AMAZON ENRICH] Error:", error.response?.data || error.message || error);
      const errObj = error.response?.data || {};
      const errMsg = errObj.error?.message || error.message || "";
      const statusCode = error.response?.status || 500;
      const isRateLimit = statusCode === 429 || errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("rate limit");
      const keySnippet = groqKey ? `${groqKey.substring(0, 6)}...${groqKey.substring(groqKey.length - 4)}` : "None";
      if (isRateLimit) {
        res.status(429).json({ message: `${errMsg} (Using Groq Key: ${keySnippet})` });
      } else {
        res.status(statusCode).json({ message: `${errMsg} (Using Groq Key: ${keySnippet})` });
      }
    }
  });
  app.post("/api/amazon/export", authenticateToken, async (req, res) => {
    try {
      const adminEmails = ["chilsandco@gmail.com", "chilsandco.com@gmail.com"];
      const isAdmin = adminEmails.some((email) => email.toLowerCase() === req.user.email.toLowerCase());
      if (!isAdmin) {
        return res.status(403).json({ message: "Higher clearance required for catalog sync operations." });
      }
      const { products, enrichedData } = req.body;
      if (!products || !enrichedData) {
        return res.status(400).json({ message: "Products and enrichedData are required." });
      }
      const settings = JSON.parse(await fs4.promises.readFile("settings.json", "utf-8").catch(() => "{}"));
      const tempId = Date.now() + "_" + Math.floor(Math.random() * 1e3);
      const xlsmTempPath = path3.join(process.cwd(), `temp_${tempId}.xlsm`);
      const templatePath = path3.join(process.cwd(), "amazon_blank_template.xlsm");
      if (!fs4.existsSync(templatePath)) {
        return res.status(500).json({ message: "Amazon blank template file is missing on the server." });
      }
      const XLSXModule = await import("xlsx");
      const XLSX = XLSXModule.default || XLSXModule;
      const wb = XLSX.readFile(templatePath, { bookVBA: true });
      const sheetName = wb.SheetNames.find((name) => name.toLowerCase() === "template") || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const brand = settings.amazonBrandName || "CHILS & CO.";
      const manufacturer = settings.amazonManufacturer || "CHILS & CO.";
      const origin = settings.amazonOriginCountry || "India";
      const fulfillment = settings.amazonFulfillmentChannel || "Merchant Fulfilled";
      const handling = settings.amazonHandlingTime || "5";
      const pkgLength = settings.amazonDefaultPkgLength || "35";
      const pkgWidth = settings.amazonDefaultPkgWidth || "25";
      const pkgHeight = settings.amazonDefaultPkgHeight || "5";
      const pkgWeight = settings.amazonDefaultPkgWeight || "500";
      const importer = settings.amazonImporterContact || "";
      const packer = settings.amazonPackerContact || "";
      let currentRow = 6;
      const writeCell = (r, c, val) => {
        if (val === void 0 || val === null) return;
        const cellRef = XLSX.utils.encode_cell({ r, c });
        XLSX.utils.sheet_add_aoa(ws, [[val]], { origin: cellRef });
      };
      for (const product of products) {
        const prodId = String(product.id);
        const enrich = enrichedData[prodId];
        if (!enrich) continue;
        const parentSku = `P-${prodId}`;
        const parentCols = {
          0: parentSku,
          // Col 1 SKU
          1: "SHIRT",
          // Col 2 Product Type
          2: "full_update",
          // Col 3 Listing Action
          3: "parent",
          // Col 4 Parentage Level
          5: "SIZE/COLOR",
          // Col 6 Variation Theme Name
          6: product.name,
          // Col 7 Item Name
          8: brand,
          // Col 9 Brand Name
          19: enrich.modelName,
          // Col 20 Model Name
          20: manufacturer,
          // Col 21 Manufacturer
          31: product.description,
          // Col 32 Product Description
          32: enrich.bulletPoints?.[0] || "",
          // Col 33 Bullet Point 1
          33: enrich.bulletPoints?.[1] || "",
          // Col 34 Bullet Point 2
          34: enrich.bulletPoints?.[2] || "",
          // Col 35 Bullet Point 3
          35: enrich.bulletPoints?.[3] || "",
          // Col 36 Bullet Point 4
          36: enrich.bulletPoints?.[4] || "",
          // Col 37 Bullet Point 5
          37: enrich.genericKeywords,
          // Col 38 Generic Keywords
          45: "unisex-adult",
          // Col 46 Department Name
          46: "unisex",
          // Col 47 Target Gender
          47: "adult",
          // Col 48 Age Range Description
          53: product.material || "100% Cotton",
          // Col 54 Material
          56: enrich.apparelFabricWeightClass === "Heavyweight" ? "French Terry" : "Cotton Knit",
          // Col 57 Fabric Type
          65: parentSku,
          // Col 66 Part Number
          69: product.care || "Machine Wash",
          // Col 70 Care Instructions
          104: importer,
          // Col 105 Importer Contact
          109: packer,
          // Col 110 Packer Contact
          118: enrich.sleeveLengthDescription || "Long Sleeve",
          // Col 119 Sleeve Length Description
          120: enrich.closureType || "Pull-On",
          // Col 121 Closure Type
          130: enrich.apparelFabricWeightClass || "Heavyweight",
          // Col 131 Weight Class
          131: "India",
          // Col 132 Garment Size Country
          132: 70,
          // Col 133 Shoulder to bottom hem length
          133: "Centimeters",
          // Col 134 Shoulder to bottom hem length unit
          134: enrich.apparelFabricStretch || "Low Stretch",
          // Col 135 Stretch
          135: enrich.fitToSizeSentiment || "True to Size",
          // Col 136 Fit Sentiment
          139: enrich.itemWeightGrams || 450,
          // Col 140 Item Weight
          140: "Grams",
          // Col 141 Item Weight Unit
          142: "New",
          // Col 143 Item Condition
          190: parseInt(pkgLength, 10),
          // Col 191 Package Length
          191: "Centimeters",
          // Col 192 Package Length Unit
          192: parseInt(pkgWidth, 10),
          // Col 193 Package Width
          193: "Centimeters",
          // Col 194 Package Width Unit
          194: parseInt(pkgHeight, 10),
          // Col 195 Package Height
          195: "Centimeters",
          // Col 196 Package Height Unit
          196: parseInt(pkgWeight, 10),
          // Col 197 Package Weight
          197: "Grams",
          // Col 198 Package Weight Unit
          198: origin
          // Col 199 Country of Origin
        };
        for (const [colIdxStr, val] of Object.entries(parentCols)) {
          writeCell(currentRow, parseInt(colIdxStr, 10), val);
        }
        currentRow++;
        const variations = product.variations || [];
        for (const v of variations) {
          const attribs = v.attributes || {};
          const color = attribs.color || "Oversized";
          const size = attribs.size || "Regular";
          const childSku = `C-${prodId}-${color.replace(/\s+/g, "")}-${size}`;
          const mappedColor = enrich.colorMap?.[color] || "Multicolour";
          const childCols = {
            0: childSku,
            // Col 1 SKU
            1: "SHIRT",
            // Col 2 Product Type
            2: "full_update",
            // Col 3 Listing Action
            3: "child",
            // Col 4 Parentage Level
            4: parentSku,
            // Col 5 Parent SKU
            5: "SIZE/COLOR",
            // Col 6 Theme Name
            6: `${product.name} (Color: ${color}, Size: ${size})`,
            // Col 7 Item Name
            8: brand,
            // Col 9 Brand Name
            19: enrich.modelName,
            // Col 20 Model Name
            20: manufacturer,
            // Col 21 Manufacturer
            31: product.description,
            // Col 32 Product Description
            32: enrich.bulletPoints?.[0] || "",
            // Col 33 Bullet Point 1
            33: enrich.bulletPoints?.[1] || "",
            // Col 34 Bullet Point 2
            34: enrich.bulletPoints?.[2] || "",
            // Col 35 Bullet Point 3
            35: enrich.bulletPoints?.[3] || "",
            // Col 36 Bullet Point 4
            36: enrich.bulletPoints?.[4] || "",
            // Col 37 Bullet Point 5
            37: enrich.genericKeywords,
            // Col 38 Generic Keywords
            45: "unisex-adult",
            // Col 46 Department Name
            46: "unisex",
            // Col 47 Target Gender
            47: "adult",
            // Col 48 Age Range Description
            48: "ASIAN",
            // Col 49 Shirt Size System
            49: "ALPHA",
            // Col 50 Shirt Size Class
            50: size,
            // Col 51 Shirt Size Value
            52: "Regular",
            // Col 53 Shirt Body Type
            53: product.material || "100% Cotton",
            // Col 54 Material
            56: enrich.apparelFabricWeightClass === "Heavyweight" ? "French Terry" : "Cotton Knit",
            // Col 57 Fabric Type
            62: mappedColor,
            // Col 63 Color Map
            63: color,
            // Col 64 Color
            65: childSku,
            // Col 66 Part Number
            69: product.care || "Machine Wash",
            // Col 70 Care Instructions
            104: importer,
            // Col 105 Importer Contact
            109: packer,
            // Col 110 Packer Contact
            118: enrich.sleeveLengthDescription || "Long Sleeve",
            // Col 119 Sleeve Length Description
            120: enrich.closureType || "Pull-On",
            // Col 121 Closure Type
            130: enrich.apparelFabricWeightClass || "Heavyweight",
            // Col 131 Weight Class
            131: "India",
            // Col 132 Garment Size Country
            132: 70,
            // Col 133 Shoulder to bottom hem length
            133: "Centimeters",
            // Col 134 Shoulder to bottom hem length unit
            134: enrich.apparelFabricStretch || "Low Stretch",
            // Col 135 Stretch
            135: enrich.fitToSizeSentiment || "True to Size",
            // Col 136 Fit Sentiment
            139: enrich.itemWeightGrams || 450,
            // Col 140 Item Weight
            140: "Grams",
            // Col 141 Item Weight Unit
            142: "New",
            // Col 143 Item Condition
            169: v.stockQuantity || 0,
            // Col 170 Quantity (IN)
            170: parseInt(handling, 10),
            // Col 171 Handling Time (IN)
            173: parseFloat(v.price || product.price),
            // Col 174 Your Price INR
            190: parseInt(pkgLength, 10),
            // Col 191 Package Length
            191: "Centimeters",
            // Col 192 Package Length Unit
            192: parseInt(pkgWidth, 10),
            // Col 193 Package Width
            193: "Centimeters",
            // Col 194 Package Width Unit
            194: parseInt(pkgHeight, 10),
            // Col 195 Package Height
            195: "Centimeters",
            // Col 196 Package Height Unit
            196: parseInt(pkgWeight, 10),
            // Col 197 Package Weight
            197: "Grams",
            // Col 198 Package Weight Unit
            198: origin
            // Col 199 Country of Origin
          };
          for (const [colIdxStr, val] of Object.entries(childCols)) {
            writeCell(currentRow, parseInt(colIdxStr, 10), val);
          }
          currentRow++;
        }
      }
      console.log(`[AMAZON EXPORT] Saving macro-enabled workbook natively...`);
      XLSX.writeFile(wb, xlsmTempPath, { bookVBA: true });
      const buffer = await fs4.promises.readFile(xlsmTempPath);
      await fs4.promises.unlink(xlsmTempPath).catch(() => {
      });
      res.setHeader("Content-Type", "application/vnd.ms-excel.sheet.macroEnabled.12");
      res.setHeader("Content-Disposition", `attachment; filename=Amazon_Bulk_Listing_Feed_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsm`);
      res.send(buffer);
    } catch (error) {
      console.error("[AMAZON EXPORT] Error:", error.message || error);
      res.status(500).json({ message: error.message || "Failed to generate Excel spreadsheet." });
    }
  });
  app.post("/api/admin/whatsapp/broadcast", authenticateToken, async (req, res) => {
    try {
      const adminEmails = ["chilsandco@gmail.com", "chilsandco.com@gmail.com"];
      const isAdmin = adminEmails.some((email) => email.toLowerCase() === req.user.email.toLowerCase());
      if (!isAdmin) {
        return res.status(403).json({ message: "Higher clearance required." });
      }
      const { templateName, phoneNumbers, variables } = req.body;
      if (!templateName || !phoneNumbers || !Array.isArray(phoneNumbers)) {
        return res.status(400).json({ message: "Invalid payload. Required: templateName, phoneNumbers[]" });
      }
      let targets = phoneNumbers;
      if (phoneNumbers.length === 1 && phoneNumbers[0] === "all_customers") {
        const wc2 = getWooCommerce();
        if (wc2) {
          const customersRes = await wcSafeCall(wc2, "get", "customers", { per_page: 100 });
          targets = customersRes.data.map((c) => c.billing?.phone).filter(Boolean);
        } else {
          targets = [];
        }
      }
      let sent = 0;
      let failed = 0;
      for (const phone of targets) {
        try {
          const formatted = formatPhoneForWhatsApp(phone);
          if (formatted) {
            const components = variables ? [{
              type: "body",
              parameters: variables.map((v) => ({ type: "text", text: v }))
            }] : [];
            await sendWhatsAppMessage(formatted, templateName, "en_US", components);
            sent++;
          } else {
            failed++;
          }
          await new Promise((r) => setTimeout(r, 50));
        } catch (e) {
          failed++;
        }
      }
      res.json({ message: "Broadcast complete", sent, failed });
    } catch (error) {
      console.error("[CHILS & CO. WHATSAPP] Broadcast failed:", error.message);
      res.status(500).json({ message: "Broadcast failed" });
    }
  });
  app.post("/api/admin/create-shipment", async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ message: "Order ID required" });
      const wc2 = getWooCommerce();
      if (!wc2) return res.status(500).json({ message: "WooCommerce not configured" });
      const { data: order } = await wcSafeCall(wc2, "get", `orders/${orderId}`);
      const metaOf2 = (k) => order.meta_data?.find((m) => m.key === k)?.value;
      let shipmentId = metaOf2("_shiprocket_shipment_id");
      let awb = metaOf2("_shiprocket_awb");
      let courier = metaOf2("_shiprocket_courier");
      if (awb && awb !== "undefined") {
        return res.json({ message: "Shipment already created", shipmentId, awb, courier, labelDownloadUrl: await getShiprocketLabelUrl(shipmentId) });
      }
      if (!shipmentId) {
        const created = await createShiprocketShipment(order);
        shipmentId = created?.shipment_id ?? created?.data?.shipment_id;
        if (!shipmentId) throw new Error(created?.message || "Shiprocket did not return a shipment");
        await wcSafeCall(wc2, "put", `orders/${orderId}`, {
          meta_data: [
            { key: "_shiprocket_shipment_id", value: String(shipmentId) },
            { key: "_shiprocket_order_id", value: String(created?.order_id ?? "") }
          ]
        });
      }
      let courierError = "";
      try {
        const assigned = await assignShiprocketCourier(shipmentId);
        awb = assigned.awb;
        courier = assigned.courier;
        await wcSafeCall(wc2, "put", `orders/${orderId}`, {
          meta_data: [
            { key: "_shiprocket_awb", value: awb },
            { key: "_shiprocket_courier", value: courier },
            { key: "_shiprocket_status", value: "shipped" }
          ]
        });
        notifyShipping(orderId, `Shipment created with AWB ${awb}`).catch((err) => {
          console.error("[CHILS & CO. SLACK] Shipping notification failed:", err);
        });
      } catch (err) {
        courierError = err.message;
        console.warn(`[CHILS & CO.] Order ${orderId} is in Shiprocket (shipment ${shipmentId}) but no courier was assigned: ${courierError}`);
      }
      const labelDownloadUrl = awb ? await getShiprocketLabelUrl(shipmentId) : "";
      res.json({
        message: awb ? "Shipment created successfully" : "Order created in Shiprocket, courier not assigned yet",
        shipmentId,
        awb: awb || "",
        courier: courier || "",
        courierError,
        labelDownloadUrl,
        dashboardUrl: `https://app.shiprocket.in/seller/orders/details/${shipmentId}`
      });
    } catch (error) {
      console.error("[CHILS & CO.] Shipment creation failed:", error.message);
      res.status(500).json({ message: error.message || "Shipment creation failed" });
    }
  });
  app.post("/api/webhooks/woocommerce", async (req, res) => {
    try {
      invalidateProductsCache();
      const payload = req.body;
      const topic = req.headers["x-wc-webhook-topic"];
      const orderId = payload?.id;
      console.log(`[CHILS & CO. WEBHOOK] Received WooCommerce webhook: ${topic} for Order ${orderId}`);
      if (topic === "order.updated" || topic === "order.refunded") {
        const status = payload?.status;
        console.log(`[CHILS & CO. WEBHOOK] Order ${orderId} status updated to: ${status}`);
        if (topic === "order.refunded" && status === "refunded") {
          notifyRefund(payload).catch((err) => {
            console.error("[CHILS & CO. SLACK] Refund notification failed:", err);
          });
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("[CHILS & CO. WEBHOOK] Webhook processing failed:", error.message);
      res.status(200).send("OK");
    }
  });
  app.post("/api/webhooks/logistics-relay", async (req, res) => {
    try {
      const token2 = req.query.token || req.headers["x-api-key"];
      const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN || "";
      if (!token2 || token2 !== expectedToken) {
        console.warn(`[LOGISTICS WEBHOOK] Unauthorized access attempt: token mismatch.`);
        return res.status(401).json({ error: "Unauthorized: Invalid Webhook Token" });
      }
      const payload = req.body;
      console.log("[LOGISTICS WEBHOOK] Payload received:", JSON.stringify(payload));
      const rawOrderId = payload.channel_order_id || payload.order_id;
      const awb = payload.awb;
      const courier = payload.courier_name;
      const trackingStatus = payload.status || payload.current_status || "In Transit";
      const etd = payload.etd || payload.expected_delivery_date;
      if (!rawOrderId) {
        console.warn("[LOGISTICS WEBHOOK] Missing order identifier in payload. Acknowledging with 200 (potential dry-run test).");
        return res.status(200).json({ success: true, message: "Dry-run check verified: route alive." });
      }
      const orderId = parseInt(String(rawOrderId).replace(/\D/g, ""), 10);
      if (isNaN(orderId)) {
        console.warn(`[LOGISTICS WEBHOOK] Invalid order ID format: ${rawOrderId}. Acknowledging with 200.`);
        return res.status(200).json({ success: true, message: "Webhook acknowledged (invalid order format)." });
      }
      const wc2 = getWooCommerce();
      if (!wc2) {
        console.error("[LOGISTICS WEBHOOK] WooCommerce client not configured. Webhook mapping aborted.");
        return res.status(500).json({ error: "Internal store configuration error" });
      }
      console.log(`[LOGISTICS WEBHOOK] Syncing Order #${orderId} - AWB: ${awb}, Courier: ${courier}, Status: ${trackingStatus}`);
      let orderResponse;
      try {
        orderResponse = await wcSafeCall(wc2, "get", `orders/${orderId}`);
      } catch (err) {
        console.error(`[LOGISTICS WEBHOOK] Order #${orderId} lookup failed in WooCommerce:`, err.message);
        return res.status(200).json({ success: true, message: `Webhook received but order #${orderId} was not found in WooCommerce.` });
      }
      const existingOrder = orderResponse.data;
      if (!existingOrder) {
        console.warn(`[LOGISTICS WEBHOOK] Order #${orderId} data payload was empty.`);
        return res.status(200).json({ success: true, message: "Order data empty" });
      }
      const existingMeta = existingOrder.meta_data || [];
      const newMetaMap = new Map(existingMeta.map((m) => [m.key, m.value]));
      if (awb) newMetaMap.set("_shiprocket_awb", String(awb));
      if (courier) newMetaMap.set("_shiprocket_courier", String(courier));
      if (trackingStatus) newMetaMap.set("_shiprocket_tracking_status", String(trackingStatus));
      if (etd) newMetaMap.set("_shiprocket_etd", String(etd));
      if (awb) newMetaMap.set("_shiprocket_tracking_url", `https://shiprocket.co/tracking/${awb}`);
      const updatedMeta = Array.from(newMetaMap.entries()).map(([key, value]) => ({ key, value }));
      let updatedStatus = existingOrder.status;
      const normalStatus = String(trackingStatus).toLowerCase().trim();
      if (["shipped", "dispatched", "out_for_delivery", "out-for-delivery", "in-transit", "in transit", "picked up", "pickup done"].some((s) => normalStatus.includes(s))) {
        if (!["completed", "refunded", "cancelled"].includes(existingOrder.status)) updatedStatus = "dispatched-order";
      } else if (["delivered"].some((s) => normalStatus.includes(s))) {
        updatedStatus = "completed";
      }
      const orderUpdatePayload = { meta_data: updatedMeta };
      if (updatedStatus !== existingOrder.status) orderUpdatePayload.status = updatedStatus;
      await wcSafeCall(wc2, "put", `orders/${orderId}`, orderUpdatePayload);
      await wcSafeCall(wc2, "post", `orders/${orderId}/notes`, {
        note: `Courier update: ${trackingStatus}. ${courier || "Courier"}${awb ? `, AWB ${awb}` : ""}.`,
        customer_note: false
      }).catch(() => {
      });
      console.log(`[LOGISTICS WEBHOOK] Order #${orderId} updated${orderUpdatePayload.status ? ` to ${updatedStatus}` : ""}.`);
      notifyShipping(orderId, String(trackingStatus), updatedStatus);
      return res.status(200).send("OK");
    } catch (error) {
      console.error("[LOGISTICS WEBHOOK] Error processing webhook:", error.message || error);
      return res.status(500).send("Internal Error");
    }
  });
  app.get("/", async (req, res, next) => {
    const { "print-order": printOrder, "print-order-type": printType, order_key } = req.query;
    if (printOrder && printType && order_key) {
      const orderId = String(printOrder);
      if (!/^\d+$/.test(orderId)) {
        return res.status(400).send("Invalid order ID");
      }
      const wcUrl = `${process.env.WOOCOMMERCE_URL || "https://www.chilsandco.com"}/wp-admin/admin-ajax.php`;
      const params = new URLSearchParams({
        "action": "print_order",
        "print-order": orderId,
        "print-order-type": printType,
        "order_key": order_key
      });
      const redirect = `${wcUrl}?${params.toString()}`;
      console.log(`[CHILS & CO.] Redirecting invoice request \u2192 ${redirect}`);
      return res.redirect(302, redirect);
    }
    next();
  });
  app.get(/^\/media\//, mediaHandler(() => process.env.WOOCOMMERCE_URL || "https://api.chilsandco.com"));
  app.get("/api/media", (req, res) => {
    const imageUrl = typeof req.query.url === "string" ? req.query.url : "";
    const rel = imageUrl ? uploadsPathOf(imageUrl) : null;
    let allowed2 = false;
    try {
      const host = new URL(imageUrl).hostname;
      const store = new URL(process.env.WOOCOMMERCE_URL || "https://api.chilsandco.com").hostname;
      allowed2 = host === store || host.endsWith(`.${store}`);
    } catch {
    }
    if (!rel || !allowed2) return res.status(400).send("URL is required");
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.redirect(301, `/media/${rel.split("/").map(encodeURIComponent).join("/")}`);
  });
  app.use((req, res, next) => {
    const host = req.headers.host || "";
    if (host.startsWith("www.")) {
      const nonWwwHost = host.replace(/^www\./, "");
      const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
      return res.redirect(301, `${proto}://${nonWwwHost}${req.originalUrl}`);
    }
    next();
  });
  registerJournal(app, () => globalProductsCache);
  EXTRA_LLM_LINKS.push(...LANDINGS.map((l) => ({ href: l.path, label: l.h1 })));
  registerLandings(app, () => globalProductsCache);
  app.get("/sitemap.xml", async (req, res) => {
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    const todayISO = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const staticUrls = [
      { loc: "https://chilsandco.com/", priority: "1.0", changefreq: "daily" },
      { loc: "https://chilsandco.com/collection", priority: "0.9", changefreq: "daily" },
      { loc: "https://chilsandco.com/pick-your-three", priority: "0.9", changefreq: "weekly" },
      { loc: "https://chilsandco.com/our-promise", priority: "0.6", changefreq: "monthly" },
      { loc: "https://chilsandco.com/bespoke", priority: "0.9", changefreq: "weekly" },
      { loc: "https://chilsandco.com/co-creator", priority: "0.8", changefreq: "weekly" },
      { loc: "https://chilsandco.com/customize", priority: "0.8", changefreq: "weekly" },
      { loc: "https://chilsandco.com/social-vault", priority: "0.7", changefreq: "weekly" },
      { loc: "https://chilsandco.com/support", priority: "0.7", changefreq: "monthly" },
      { loc: "https://chilsandco.com/shipping-delivery", priority: "0.5", changefreq: "monthly" },
      { loc: "https://chilsandco.com/returns-refunds", priority: "0.5", changefreq: "monthly" },
      { loc: "https://chilsandco.com/privacy-policy", priority: "0.5", changefreq: "monthly" },
      { loc: "https://chilsandco.com/terms-conditions", priority: "0.5", changefreq: "monthly" },
      { loc: "https://chilsandco.com/journal", priority: "0.8", changefreq: "weekly" },
      ...ARTICLES.map((a) => ({ loc: `https://chilsandco.com/journal/${a.slug}`, priority: "0.8", changefreq: "monthly", lastmod: a.updated })),
      ...LANDINGS.map((l) => ({ loc: `https://chilsandco.com${l.path}`, priority: "0.9", changefreq: "weekly" }))
    ];
    let productUrls = [];
    try {
      const wc2 = getWooCommerce();
      if (wc2) {
        const response = await wcSafeCall(wc2, "get", "products", { per_page: 100, status: "publish" });
        if (Array.isArray(response.data)) {
          productUrls = response.data.map((prod) => ({
            loc: `https://chilsandco.com/product/${prod.id}`,
            priority: "0.8",
            changefreq: "weekly",
            lastmod: prod.date_modified ? new Date(prod.date_modified).toISOString().split("T")[0] : todayISO
          }));
        }
      }
    } catch (err) {
      console.error("[CHILS SITEMAP] Error generating product nodes for sitemap:", err.message || err);
    }
    const allUrls = [...staticUrls, ...productUrls];
    const xmlItems = allUrls.map((url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || todayISO}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>`;
    res.send(xml);
  });
  app.all("/api/*", (req, res) => {
    console.warn(`[CHILS DEBUG] Unmatched API path: ${req.method} ${req.url}`);
    res.status(404).json({
      error: "Route not found",
      message: `The endpoint ${req.url} does not exist on this server.`,
      path: req.url
    });
  });
  app.use((err, req, res, next) => {
    console.error(`[CHILS DEBUG] Global Error Handler:`, err);
    res.status(err.status || 500).json({
      error: "Internal Server Error",
      message: err.message || "An unexpected server error occurred."
    });
  });
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log(`[CHILS & CO.] Development mode: Vite middleware active`);
  } else {
    const distPath = path3.resolve(__dirname, "dist");
    if (fs4.existsSync(distPath)) {
      console.log(`[CHILS & CO.] Production mode: Serving static files from ${distPath}`);
      app.use(express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => {
          if (/[\\/](assets|studio|p)[\\/]/.test(filePath)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          else if (/\.(webp|png|jpe?g|svg|woff2?)$/i.test(filePath)) res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
        }
      }));
      const DEFAULT_OG_IMAGE = "https://res.cloudinary.com/ddatd5ruz/image/upload/w_1200,h_630,c_fill,f_jpg,q_80/v1782039896/ChatGPT_Image_Jun_21_2026_04_34_04_PM_avhfel.png";
      const PUBLIC_PAGE_META = {
        "/": {
          title: "Oversized T-Shirts for Men | 240 GSM Cotton | CHILS & CO.",
          description: "Heavyweight 100% cotton oversized tees, TwinTex polos and minimal tees, designed by techies in Hyderabad. From \u20B9349. Delivered across India, 7-day returns."
        },
        "/collection": {
          title: "Shop T-Shirts & Polos for Men Online | CHILS & CO.",
          description: "Oversized drop shoulder tees, TwinTex polos, minimal and regular fit tees and three-tee stacks. Delivered across India from \u20B980, 7-day returns."
        },
        "/pick-your-three": {
          title: "Trilogies: three tees, save 10% | CHILS & CO.",
          description: "Three tees chosen to go together, banded as a numbered Trilogy. Pick your size and save 10%."
        },
        "/combos": {
          title: "Trilogies: three tees, save 10% | CHILS & CO.",
          description: "Three tees chosen to go together, banded as a numbered Trilogy. Pick your size and save 10%."
        },
        "/our-promise": {
          title: "Our promise | CHILS & CO.",
          description: "Plastic-free, reusable packaging and tees made to last. How CHILS & CO. thinks about what it makes."
        },
        "/bespoke": {
          title: "Bespoke | CHILS & CO.",
          description: "Custom pieces made with the CHILS & CO. team."
        },
        "/co-creator": {
          title: "Co-Creator | CHILS & CO.",
          description: "Design a tee with CHILS & CO. and earn from every one sold."
        },
        "/customize": {
          title: "Custom Studio | CHILS & CO.",
          description: "Design your own tee in the CHILS & CO. Custom Studio."
        },
        "/social-vault": {
          title: "Social Vault | CHILS & CO.",
          description: "The world of CHILS & CO. on social media."
        },
        "/support": {
          title: "Support | CHILS & CO.",
          description: "Talk to the CHILS & CO. team on WhatsApp, email or phone, Monday to Saturday, 10 AM to 6 PM."
        },
        "/shipping-delivery": {
          title: "Shipping & delivery | CHILS & CO.",
          description: "Delivery across India from \u20B980. Packed within 24\u201348 hours, delivered in 2\u20137 business days. Free store pickup."
        },
        "/returns-refunds": {
          title: "Returns & refunds | CHILS & CO.",
          description: "Return within 7 days of delivery for a refund, exchange or store credit."
        },
        "/privacy-policy": {
          title: "Privacy Policy | CHILS & CO.",
          description: "How CHILS & CO. looks after your data and privacy."
        },
        "/terms-conditions": {
          title: "Terms & Conditions | CHILS & CO.",
          description: "Terms of service for shopping with CHILS & CO."
        }
      };
      const PRIVATE_ROUTE_PREFIXES = ["/checkout", "/onboarding", "/console", "/admin", "/auth", "/wishlist"];
      app.get("*", async (req, res) => {
        const indexPath = path3.resolve(distPath, "index.html");
        let cleanPath = req.path || "/";
        if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
          cleanPath = cleanPath.slice(0, -1);
        }
        let html = fs4.readFileSync(indexPath, "utf-8");
        const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const canonicalUrl = `https://chilsandco.com${cleanPath === "/" ? "" : cleanPath}`;
        const isPrivate = PRIVATE_ROUTE_PREFIXES.some((prefix) => cleanPath.startsWith(prefix));
        if (isPrivate) {
          html = html.replace(
            /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i,
            `<meta name="robots" content="noindex, nofollow" />`
          );
          html = html.replace(
            /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i,
            `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`
          );
          res.set("Content-Type", "text/html");
          return res.send(html);
        }
        const productMatch = cleanPath.match(/^\/product\/(\d+)/);
        if (productMatch) {
          const productId = productMatch[1];
          try {
            const wc2 = getWooCommerce();
            if (wc2) {
              const product = await productForMeta(productId);
              if (product) {
                const productName = (product.name || "Product").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                const productDesc = (product.short_description || product.description || "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").substring(0, 200).trim() || "Premium tee by CHILS & CO. Delivered across India with 7-day returns.";
                const productImage = Array.isArray(product.images) && product.images.length > 0 ? imgUrl(product.images[0].src) : DEFAULT_OG_IMAGE;
                const productPrice = product.price || "0";
                const ogTitle = escAttr(`${productName} | CHILS & CO.`);
                const ogDesc = escAttr(productDesc);
                const ogImage = escAttr(productImage);
                html = html.replace(/(<title>)([^<]*)(<\/title>)/i, `$1${ogTitle}$3`);
                html = html.replace(/(<link\s+rel="canonical"\s+href=")([^"]*)("\s*\/>)/i, `$1${escAttr(canonicalUrl)}$3`);
                html = html.replace(/(<meta\s+name="description"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogDesc}$3`);
                html = html.replace(/(<meta\s+property="og:title"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogTitle}$3`);
                html = html.replace(/(<meta\s+property="og:description"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogDesc}$3`);
                html = html.replace(/(<meta\s+property="og:image"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogImage}$3`);
                html = html.replace(/(<meta\s+property="og:url"\s+content=")([^"]*)("\s*\/>)/i, `$1${escAttr(canonicalUrl)}$3`);
                html = html.replace(/(<meta\s+property="og:type"\s+content=")([^"]*)("\s*\/>)/i, `$1product$3`);
                html = html.replace(/(<meta\s+name="twitter:title"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogTitle}$3`);
                html = html.replace(/(<meta\s+name="twitter:description"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogDesc}$3`);
                html = html.replace(/(<meta\s+name="twitter:image"\s+content=")([^"]*)("\s*\/>)/i, `$1${ogImage}$3`);
                const mapped = (globalProductsCache || []).find((x) => String(x.id) === String(productId));
                const schema = mapped ? productSchema(mapped, canonicalUrl) : { "@context": "https://schema.org/", "@type": "Product", name: productName, image: [productImage], description: productDesc, sku: `CHLS-${productId}`, brand: { "@type": "Brand", name: "CHILS & CO." }, offers: { "@type": "Offer", url: canonicalUrl, priceCurrency: "INR", price: productPrice, availability: product.stock_status === "outofstock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition" } };
                {
                  const kwTitle = escAttr(mapped ? `${productName} | ${productTypeLabel(mapped)} | CHILS & CO.` : `${productName} | CHILS & CO.`);
                  html = html.replace(/(<title>)([^<]*)(<\/title>)/i, `$1${kwTitle}$3`);
                  html = html.replace(/(<meta\s+property="og:title"\s+content=")([^"]*)("\s*\/>)/i, `$1${kwTitle}$3`);
                  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")([^"]*)("\s*\/>)/i, `$1${kwTitle}$3`);
                  const schemaScript = `
    <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
                  html = html.replace("</head>", `${schemaScript}
  </head>`);
                  if (mapped) html = html.replace('<div id="root"></div>', `<div id="root">${productBody(mapped)}</div>`);
                }
                res.set("Content-Type", "text/html");
                return res.send(html);
              }
            }
          } catch (error) {
            console.error(`[CHILS SEO] Error fetching product ${productId}:`, error.message || error);
          }
        }
        const pageMeta = PUBLIC_PAGE_META[cleanPath] || PUBLIC_PAGE_META["/"];
        const pageTitle = escAttr(pageMeta.title);
        const pageDesc = escAttr(pageMeta.description);
        html = html.replace(/(<title>)([^<]*)(<\/title>)/i, `$1${pageTitle}$3`);
        html = html.replace(/(<link\s+rel="canonical"\s+href=")([^"]*)("\s*\/>)/i, `$1${escAttr(canonicalUrl)}$3`);
        html = html.replace(/(<meta\s+name="description"\s+content=")([^"]*)("\s*\/>)/i, `$1${pageDesc}$3`);
        html = html.replace(/(<meta\s+property="og:title"\s+content=")([^"]*)("\s*\/>)/i, `$1${pageTitle}$3`);
        html = html.replace(/(<meta\s+property="og:description"\s+content=")([^"]*)("\s*\/>)/i, `$1${pageDesc}$3`);
        html = html.replace(/(<meta\s+property="og:url"\s+content=")([^"]*)("\s*\/>)/i, `$1${escAttr(canonicalUrl)}$3`);
        let seoBody = "";
        try {
          if (cleanPath === "/" && globalProductsCache) seoBody = homeBody(globalProductsCache);
          else if (cleanPath === "/collection" && globalProductsCache) seoBody = collectionBody(globalProductsCache);
          else seoBody = policyBody(cleanPath);
        } catch (e) {
          console.error("[CHILS SEO] Could not build page content:", e?.message);
        }
        if (seoBody) html = html.replace('<div id="root"></div>', `<div id="root">${seoBody}</div>`);
        res.set("Content-Type", "text/html");
        return res.send(html);
      });
    } else {
      console.warn(`[CHILS & CO.] Production mode active but 'dist' directory not found at ${distPath}`);
      console.warn(`[CHILS & CO.] Falling back to a placeholder message. Run 'npm run build' to fix this.`);
      app.get("*", (req, res) => {
        res.status(500).send("Application is in production mode but 'dist' directory is missing. Please build the frontend.");
      });
    }
  }
  if (process.env.PAYMENT_RECON === "off") console.log("[CHILS RECON] Payment reconciliation is off (PAYMENT_RECON=off).");
  else setInterval(async () => {
    console.log("[CHILS RECON] Triggering routine synchronization...");
    const wc2 = getWooCommerce();
    if (!wc2) return;
    try {
      const response = await wcSafeCall(wc2, "get", "orders", {
        status: "pending,on-hold",
        per_page: 50,
        after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString()
        // Last 30 days
      });
      const orders = response.data;
      if (!Array.isArray(orders) || orders.length === 0) return;
      console.log(`[CHILS RECON] Found ${orders.length} potential signals to reconcile.`);
      for (const order of orders) {
        const ageInMins = (Date.now() - new Date(order.date_created).getTime()) / 6e4;
        if (ageInMins < 5) continue;
        const merchantTransactionId = getPhonePeTransactionId(order);
        try {
          if (!merchantTransactionId) continue;
          const statusData = await verifyPhonePeTransaction(merchantTransactionId);
          if (!statusData) continue;
          if (statusData.success && statusData.code === "PAYMENT_SUCCESS") {
            console.log(`[CHILS RECON] Order ${order.id} verified as SUCCESS. Updating WC...`);
            const updateRes = await wcSafeCall(wc2, "put", `orders/${order.id}`, {
              status: "processing",
              set_paid: true,
              customer_note: "Payment verified via system reconciliation job."
            });
            triggerOrderConfirmationEmails(updateRes.data).catch((err) => {
              console.error("[CHILS & CO. EMAIL] Recon order confirmation email failed:", err);
            });
          } else if (statusData.code === "PAYMENT_ERROR" || statusData.code === "PAYMENT_DECLINED" || statusData.code === "TIMED_OUT") {
            console.log(`[CHILS RECON] Order ${order.id} verified as FAILED (${statusData.code}). Updating WC...`);
            await wcSafeCall(wc2, "put", `orders/${order.id}`, {
              status: "failed",
              customer_note: `Payment resolution: ${statusData.message}`
            });
          }
        } catch (err) {
          const is404 = err.response?.status === 404 || err.status === 404 || err.message?.includes("404") || err.message?.toLowerCase().includes("not found") || err.message?.toLowerCase().includes("not_found");
          if (is404) {
            console.warn(`[CHILS RECON] Order ${order.id} not found in PhonePe records. Marking as failed after 30 mins.`);
            if (ageInMins > 30) {
              await wcSafeCall(wc2, "put", `orders/${order.id}`, { status: "failed", customer_note: "Archived due to payment abandonment." });
            }
          } else {
            console.error(`[CHILS RECON] Error processing order ${order.id}:`, err.message || err);
          }
        }
      }
    } catch (error) {
      console.error("[CHILS RECON] Job Failure:", error);
    }
  }, 6e5);
  try {
    const numericPort = typeof PORT === "string" ? parseInt(PORT, 10) : Number(PORT);
    startSlackBot({
      wc: (method, ...args) => wcSafeCall(getWooCommerce(), method, ...args),
      adminUrl: (process.env.WOOCOMMERCE_URL || "https://api.chilsandco.com").trim(),
      phonepe: {
        orderStatus: async (merchantOrderId) => {
          const client = getPhonePeClient();
          if (!client) throw new Error("PhonePe credentials are not set");
          return client.getOrderStatus(merchantOrderId);
        },
        refund: async (merchantOrderId, merchantRefundId, amountPaise) => {
          const client = getPhonePeClient();
          if (!client) throw new Error("PhonePe credentials are not set");
          return client.refund(
            RefundRequest.builder().merchantRefundId(merchantRefundId).originalMerchantOrderId(merchantOrderId).amount(amountPaise).build()
          );
        },
        refundStatus: async (merchantRefundId) => {
          const client = getPhonePeClient();
          if (!client) throw new Error("PhonePe credentials are not set");
          return client.getRefundStatus(merchantRefundId);
        }
      }
    });
    app.listen(numericPort, "0.0.0.0", () => {
      console.log(`[CHILS & CO.] Server started successfully`);
      console.log(`[CHILS & CO.] Listening on port: ${numericPort}`);
      console.log(`[CHILS & CO.] Mode: ${IS_PROD ? "Production" : "Development"}`);
      if (getWooCommerce()) {
        const warmProductPages = async () => {
          try {
            const list = await refreshProducts();
            const ids = list.map((p) => String(p.id)).filter((id) => /^\d+$/.test(id));
            let next = 0;
            const worker = async () => {
              while (next < ids.length) {
                const id = ids[next++];
                try {
                  await productJson(id);
                } catch {
                }
              }
            };
            await Promise.all([worker(), worker(), worker()]);
            console.log(`[CHILS & CO.] Product pages warmed: ${ids.length}`);
          } catch (e) {
            console.error("[CHILS & CO.] Products warm-up failed:", e?.message);
          }
        };
        warmProductPages();
        setInterval(warmProductPages, 5 * 60 * 1e3).unref();
      }
    });
  } catch (error) {
    console.error("[CHILS & CO.] Critical Failure during server startup:", error);
    process.exit(1);
  }
}
function getPhonePeClient() {
  const merchantId = process.env.PHONEPE_MERCHANT_ID?.trim();
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET?.trim();
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || "1", 10);
  const env = process.env.PHONEPE_ENV?.toUpperCase() === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;
  if (!merchantId || !clientSecret) {
    console.warn("[CHILS & CO.] PhonePe credentials missing.");
    return null;
  }
  return StandardCheckoutClient.getInstance(
    merchantId,
    clientSecret,
    clientVersion,
    env,
    false
  );
}
async function triggerOrderConfirmationEmails(order) {
  if (!order) return;
  sendPurchase(order);
  notifyNewOrder(order);
  triggerWhatsAppOrderConfirmation(order).catch((err) => {
    console.error("[CHILS & CO. WHATSAPP] Failed to send order confirmation:", err?.message || "Unknown error");
  });
}
var WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
var WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
var WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }
  if (cleanPhone.startsWith("0") && cleanPhone.length > 10) {
    cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;
  }
  return cleanPhone;
}
async function sendWhatsAppMessage(toPhone, templateName, languageCode = "en_US", components = []) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("[CHILS & CO. WHATSAPP] WhatsApp credentials missing. Skipping transmission.");
    return null;
  }
  try {
    const data = {
      messaging_product: "whatsapp",
      to: toPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode }
      }
    };
    if (components.length > 0) {
      data.template.components = components;
    }
    const response = await axios3.post(`https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, data, {
      headers: {
        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    console.log(`[CHILS & CO. WHATSAPP] Transmission successful to ${toPhone}. ID: ${response.data?.messages?.[0]?.id}`);
    return response.data;
  } catch (err) {
    console.error("[CHILS & CO. WHATSAPP] Transmission failed:", err.response?.data || err.message);
    return null;
  }
}
async function triggerWhatsAppOrderConfirmation(order) {
  if (!order) return;
  const rawPhone = order.billing?.phone;
  const toPhone = formatPhoneForWhatsApp(rawPhone);
  if (!toPhone) return;
  const customerName = order.billing?.first_name || "Customer";
  const signalId = toSignalId(order.id);
  const itemsSummary = order.line_items?.map((i) => `${i.quantity}x ${i.name}`).join(", ") || "Your items";
  const totalAmount = parseFloat(order.total || 0).toLocaleString();
  const components = [
    {
      type: "body",
      parameters: [
        { type: "text", text: customerName },
        { type: "text", text: signalId },
        { type: "text", text: itemsSummary },
        { type: "text", text: totalAmount }
      ]
    }
  ];
  await sendWhatsAppMessage(toPhone, "order_confirmation", "en_US", components);
}
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CHILS & CO.] Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[CHILS & CO.] Uncaught Exception thrown:", err);
  process.exit(1);
});
startServer().catch((err) => {
  console.error("[CHILS & CO.] Failed to start server:", err);
  process.exit(1);
});
