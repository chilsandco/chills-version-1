import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Shared pieces for the pages after a purchase: confirmation, My orders, order details and returns. */

export const inr = (n: number | string) =>
  `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const shortDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

type Tone = 'wait' | 'go' | 'done' | 'stop';

/** What each order status means to a customer, in plain words. */
export const STATUS: Record<string, { label: string; tone: Tone; note: string }> = {
  pending: { label: 'Awaiting payment', tone: 'wait', note: 'We’re waiting for the payment to confirm.' },
  'on-hold': { label: 'On hold', tone: 'wait', note: 'We’re checking the payment. This usually takes a few minutes.' },
  processing: { label: 'Being packed', tone: 'go', note: 'Paid and confirmed. We’re packing it now.' },
  dispatched: { label: 'On the way', tone: 'go', note: 'It has left our studio and is with the courier.' },
  shipping: { label: 'On the way', tone: 'go', note: 'It has left our studio and is with the courier.' },
  completed: { label: 'Delivered', tone: 'done', note: 'Delivered. We hope you love it.' },
  delivered: { label: 'Delivered', tone: 'done', note: 'Delivered. We hope you love it.' },
  refunded: { label: 'Refunded', tone: 'stop', note: 'This order was refunded.' },
  cancelled: { label: 'Cancelled', tone: 'stop', note: 'This order was cancelled.' },
  failed: { label: 'Payment failed', tone: 'stop', note: 'The payment didn’t go through, so nothing was charged for this order.' },
};

export const statusOf = (s: string) =>
  STATUS[s?.toLowerCase()] || { label: s ? s.replace(/-/g, ' ') : 'Unknown', tone: 'wait' as Tone, note: '' };

const TONE: Record<Tone, string> = {
  wait: 'bg-amber-100 text-amber-900',
  go: 'bg-[#e8efe6] text-[#2f5130]',
  done: 'bg-ink text-[#fff]',
  stop: 'bg-neutral-200 text-neutral-600',
};

export const StatusPill: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const s = statusOf(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE[s.tone]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.tone === 'done' ? 'bg-[#fff]' : 'bg-current'} ${s.tone === 'wait' || s.tone === 'go' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  );
};

/** A tee picture with a quiet placeholder when an old order has none. */
export const Thumb: React.FC<{ src?: string | null; alt: string; className?: string }> = ({ src, alt, className = 'w-14 h-[72px]' }) =>
  src ? (
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={`${className} object-cover rounded-lg bg-bone shrink-0`} />
  ) : (
    <div className={`${className} rounded-lg bg-bone shrink-0 grid place-items-center text-[10px] text-neutral-400`}>CHILS</div>
  );

/** The paper page frame used by every after-purchase page. */
export const OrderPage: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  back?: { to: string; label: string };
  aside?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}> = ({ eyebrow, title, intro, back, aside, width = 'max-w-[880px]', children }) => (
  <div className="bg-paper text-ink pt-24 md:pt-32 pb-20 min-h-screen">
    <div className={`${width} mx-auto px-3 md:px-6`}>
      {back && (
        <Link to={back.to} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-ink mx-2 mb-5">
          <ArrowLeft size={15} /> {back.label}
        </Link>
      )}
      <header className="px-2 mb-6 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow text-neutral-500 mb-3">{eyebrow}</p>}
          <h1 className="text-[34px] md:text-[56px] leading-[1.04] font-semibold tracking-[-0.03em]">{title}</h1>
          {intro && <div className="mt-3 md:mt-4 text-neutral-600 md:text-lg max-w-[620px]">{intro}</div>}
        </div>
        {aside}
      </header>
      {children}
    </div>
  </div>
);

export const Card: React.FC<{ title?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, className = '', children }) => (
  <section className={`bg-[#fff] rounded-2xl p-5 md:p-7 ${className}`}>
    {title && <h2 className="text-lg md:text-xl font-semibold mb-4">{title}</h2>}
    {children}
  </section>
);

export const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="min-h-screen bg-paper grid place-items-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
      {label && <p className="mt-4 text-sm text-neutral-500">{label}</p>}
    </div>
  </div>
);

export const btnInk = 'btn-primary px-6 py-3.5 text-sm';
export const btnLine = 'btn-secondary px-6 py-3.5 text-sm';
