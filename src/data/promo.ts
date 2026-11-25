// The seasonal gifting offer shown in the strip at the top of the shop.
// It exists in WooCommerce as the coupon GIFT10 (10% off orders of Rs 999 or more, not combinable with
// three-tee sets). It switches itself off at PROMO_ENDS. If the coupon changes, change this file and
// PROMO_ENDS / promoLine() in seo.ts so every page tells the same story.
export const PROMO = {
  code: 'GIFT10',
  /** The coupon expires at 00:00 on 6 Jan 2027 India time, so 5 Jan is the last full day. */
  ends: new Date('2027-01-06T00:00:00+05:30'),
  /** Height of the strip in pixels (also the offset applied to the header and the page). */
  height: 32,
  href: '/christmas-gifts-for-men',
};

export const promoActive = (now = new Date()) => now < PROMO.ends;
