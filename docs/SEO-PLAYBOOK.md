# CHILS & CO. search, AI and backlink playbook

Written 26 Nov 2026. Everything below is based on real data pulled that day (Google Trends India, Bing Webmaster
keyword research, Google Search Console for chilsandco.com). Nothing here promises a ranking: search results take
weeks to move, and backlinks must be earned, never bought.

## 1. What people search (the keyword map)

Bing keyword data, last 3 months, all countries unless noted. Google Trends India is in brackets.

| Term | Searches | Where it lives on the site |
|---|---|---|
| oversized t shirt men (India) | 639 | /oversized-t-shirts-for-men |
| oversized t-shirts / oversized t shirt men (global) | 992 / 827 | same page, plus the fit and style articles |
| polo shirts / polo shirts for men | 12.9K / 3K | /polo-t-shirts-for-men (title says "Polo Shirts for Men") |
| polo t shirts for men | 784 | same page, H1 and body |
| graphic tees / graphic tees for men | 7K / 954 | oversized page, graphic tee buying guide |
| boxy shirt / boxy fit | 1K / 761 (Trends: boxy fit +450%) | oversized, boxy or drop shoulder article |
| baggy shirts | 355 | same article |
| oversized drop shoulder t-shirt | (Trends: +90%) | oversized page and article |
| streetwear brands in india | (Trends: steady) | streetwear checklist article |

Low-volume terms with no Bing data (gift for software engineer, t shirt combo, heavyweight t shirt) are worth having
for AI answers and for the right buyer, not for traffic.

Takeaway: the demand is "for men", and "tees / polo shirt" wording beats "t-shirt". "Developer t-shirt" and
"programmer t-shirt" barely get searched, so the techie angle is a brand hook, not a keyword.

## 2. Facts we can safely state (checked against the live catalogue, 26 Nov 2026)

- All 25 oversized tees: 100% cotton, 240 GSM, sizes S to XL, Rs 419 to Rs 549.
- 5 TwinTex polos: cotton inside, polyester outside, 240 GSM heavyweight knit, structured collar, relaxed fit, Rs 599.
- Regular fit and minimal tees: 180 to 240 GSM, cotton, cotton blend or polycotton, depending on the design.
- Delivery across India from Rs 80, packed in 24 to 48 hours, 2 to 7 business days; store pickup free.
- Returns within 7 days of delivery; refunds in 3 to 7 business days.

Careful: "reinforced neck and shoulder stitching" and "fade-resistant DTF artwork" are promised on the Our promise page
but only appear in some product descriptions (8 and 3 of 25 oversized tees). Make the product descriptions match
the promise, or soften the promise. Search engines and AI assistants compare the two.

## 3. Things only the owner can do (accounts and sign-ins)

1. Google Business Profile (highest value local signal). The shop has a real Miyapur address and offers free store
   pickup. Create the profile with the address from settings.json, phone +91 78420 70404, hours Mon to Sat 10 to 6,
   category "Clothing store", website https://chilsandco.com. Google verifies by video or postcard.
2. Google Merchant Center, for free product listings on Google Shopping. The product feed is ready at
   **https://chilsandco.com/feeds/google-products.xml** (RSS 2.0, one item per colour and size, grouped by product,
   rebuilt from the live catalogue at most every 15 minutes; the hidden test product and the combo sets are left out).
   In Merchant Center: Products > Feeds > add a scheduled fetch of that URL, daily, country India, language English.
   Gender (male) and age group (adult) are set in `MERCHANT_FEED` at the top of `seo.ts`; change them there if
   needed. The feed uses the store's product photos (via chilsandco.com/media).
3. Pin the website link in every social bio (Instagram chils_and_co, Facebook, YouTube, Pinterest, X, Threads). The
   site's structured data already lists these profiles.
4. LinkedIn company page for CHILS & CO. linking to the site.
5. Bing Webmaster Tools: done (imported from Search Console; sitemap read, 98 URLs).

## 4. Earning backlinks (what works, and what does not)

Do:
- Founder and brand story pitches: "Designed by techies in Hyderabad". Send to Indian startup and fashion outlets and
  to Hyderabad city media. Template below.
- Developer and engineering communities: college VLSI and electronics clubs, hackathons, meetup groups. Offer tees
  as prizes or merch in return for a mention with a link.
- Creators: send tees to 10 to 20 engineers and tech creators who already post about work life. A link in their bio
  or post is a real backlink, and the audience is the right one.
- Guest posts and expert quotes about fabric weight, fit and care. The Journal articles are the reference to cite.
- Unlinked mentions: search the brand name monthly and ask any site that mentions it to add a link.
- Product Hunt or a similar launch for a new drop, with the site as the link.

Do not: buy links, join link exchanges, use comment or forum spam, or use private blog networks. Google penalises
all of these, and it can remove the site from results.

### Pitch email (editable)

Subject: Hyderabad engineers who started a tee brand for people who build

Hi [name],

I'm [founder name] from CHILS & CO., a clothing brand from Hyderabad designed by techies. Our oversized tees are
100% cotton at 240 GSM, with designs from the worlds of code, chips and engineering. We deliver across India from
Rs 80.

I think your readers would like [one specific angle: the story, the VLSI line, a drop]. I can send a sample, photos
and the founder's story. Our site is https://chilsandco.com.

Thanks for considering it,
[name], [phone]

### Community or creator message (editable)

Hi [name], I love your posts on [topic]. We make tees for engineers (CHILS & CO., Hyderabad). Could I send you one,
no strings? If you like it and want to share it, great. If not, no worries.

## 5. Measure it

- Search Console, Performance: look for queries beyond the brand name (target: "oversized t-shirt for men",
  "polo shirts for men") in 2 to 3 weeks. Check Pages for the number of indexed pages.
- Bing Webmaster Tools: Search Performance, and Site Scan for technical issues.
- Re-run the keyword table above every month and update the pages that fall behind.
- Ask ChatGPT, Perplexity and Claude the target questions monthly and note whether CHILS & CO. is cited.
