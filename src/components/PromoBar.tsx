import React, { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { PROMO, promoActive } from '../data/promo';

const KEY = 'chils_promo_dismissed';
// Staff and console pages do not get the strip.
const HIDDEN_ON = ['/console', '/admin'];

/** A slim strip announcing the gifting code. It pushes the header and page down by its own height
 *  (through the --promo-h value) and gives the space back when dismissed or when the offer ends. */
const PromoBar: React.FC = () => {
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(KEY) === 'true'; } catch { return false; }
  });
  const visible = promoActive() && !dismissed && !HIDDEN_ON.some(p => pathname.startsWith(p));

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--promo-h', visible ? `${PROMO.height}px` : '0px');
    return () => { document.documentElement.style.setProperty('--promo-h', '0px'); };
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      role="region"
      aria-label="Gifting offer"
      className="fixed top-0 inset-x-0 z-[45] bg-ink text-paper flex items-center justify-center gap-3 px-9 text-[12px] leading-none tracking-[0.01em]"
      style={{ height: PROMO.height }}
    >
      <span className="truncate">
        <span className="hidden sm:inline">Gifting season: </span>
        code <strong className="font-semibold tracking-[0.04em]">{PROMO.code}</strong> for 10% off ₹999+
        <span className="hidden sm:inline"> until 5 Jan</span>
      </span>
      {/* A normal link: the gifting page is served by the server, not by the shop's router. */}
      <a href={PROMO.href} className="shrink-0 underline underline-offset-2 hover:no-underline">Gift ideas</a>
      <button
        type="button"
        aria-label="Dismiss the offer"
        onClick={() => { try { sessionStorage.setItem(KEY, 'true'); } catch { /* fine */ } setDismissed(true); }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 opacity-70 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default PromoBar;
