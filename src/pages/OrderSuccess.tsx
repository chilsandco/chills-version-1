import React, { useEffect, useRef, useState } from 'react';
import { trackPurchase } from '../lib/track';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Clock, X, ArrowRight, Package, Truck, Home, Share2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import confetti from 'canvas-confetti';
import { useContact, whatsappLink, HelpBox } from '../components/InfoPage';
import { Card, inr, btnInk, btnLine, Spinner } from '../components/OrderUi';

/** A short, quiet burst in the brand's paper and ink tones. */
function celebrate() {
  const end = Date.now() + 1800;
  const colors = ['#0e0e0c', '#cfcac0', '#b9a274', '#ffffff'];
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

interface OrderStatus {
  id: string;
  status: string;
  total: string;
  currency: string;
}

const PAID = ['processing', 'completed', 'dispatched', 'Dispatched', 'shipping', 'delivered'];

const OrderSuccess: React.FC = () => {
  const { orderId: fullOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const contact = useContact();
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cartCleared = useRef(false);
  const celebrated = useRef(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // The payment reference can carry a suffix (123_1715535555); the order number is the part before it.
  const orderId = fullOrderId?.split('_')[0];
  const signalId = searchParams.get('signal');

  const handleRetryPayment = async () => {
    if (!orderId || !signalId) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const response = await fetch('/api/checkout/phonepe/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, signal: signalId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.url) throw new Error(data.message || 'We couldn’t start the payment again.');
      window.location.href = data.url; // to PhonePe
    } catch (err: any) {
      console.error('Payment retry error:', err);
      setRetryError(err.message || 'Something went wrong. Please try again.');
      setRetrying(false);
    }
  };

  // Ask the store for the payment result, slowing down from every 5 s to every 30 s, for up to 5 minutes.
  useEffect(() => {
    let pollTimer: any;
    let currentInterval = 5000;
    const maxPollTime = 300000;
    const startTime = Date.now();

    if (orderId && signalId) {
      const verifyOrder = async () => {
        try {
          const params = new URLSearchParams({ signal: signalId });
          if (fullOrderId) params.set('transaction', fullOrderId);
          const response = await fetch(`/api/orders/status/${orderId}?${params.toString()}`);
          if (!response.ok) throw new Error('Order check failed');
          const data = await response.json();
          setOrderInfo(data);
          if (['processing', 'completed'].includes(data.status)) trackPurchase(String(data.id), Number(data.total) || 0, data.currency || 'INR');
          return ['processing', 'completed', 'failed', 'cancelled', 'refunded'].includes(data.status);
        } catch (err) {
          console.error('Verification error:', err);
          return true; // stop on error, never loop forever
        }
      };
      const poll = async () => {
        if (Date.now() - startTime >= maxPollTime) { setLoading(false); return; }
        const shouldStop = await verifyOrder();
        setLoading(false);
        if (!shouldStop) {
          currentInterval = Math.min(currentInterval * 1.5, 30000);
          pollTimer = setTimeout(poll, currentInterval);
        }
      };
      poll();
    } else {
      setLoading(false);
      setError('We couldn’t find this order.');
    }
    return () => { if (pollTimer) clearTimeout(pollTimer); };
  }, [orderId, signalId, fullOrderId]);

  const isSuccessful = orderInfo ? PAID.includes(orderInfo.status) : false;
  const isPending = orderInfo ? ['pending', 'on-hold'].includes(orderInfo.status) : false;
  const isFailed = orderInfo ? ['failed', 'cancelled', 'refunded'].includes(orderInfo.status) : !!error;

  useEffect(() => {
    if (!cartCleared.current && isSuccessful) { cartCleared.current = true; clearCart(); }
    if (!celebrated.current && isSuccessful) { celebrated.current = true; celebrate(); }
  }, [isSuccessful, clearCart]);

  const share = async () => {
    const data = { title: 'CHILS & CO.', text: 'Just picked up a tee from CHILS & CO.', url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* the person closed the share sheet */ }
  };

  if (loading) return <Spinner label="Confirming your payment…" />;

  const state = isSuccessful ? 'paid' : isPending ? 'pending' : isFailed ? 'failed' : 'pending';
  const copy = {
    paid: { eyebrow: 'Order confirmed', title: 'Thank you. It’s yours.', intro: 'Your payment went through and your order is confirmed. We’ve emailed you the details.' },
    pending: { eyebrow: 'Payment pending', title: 'Almost there.', intro: 'We’re waiting for PhonePe to confirm your payment. This page updates on its own, so you can keep it open.' },
    failed: { eyebrow: 'Payment didn’t go through', title: error ? 'We couldn’t find this order.' : 'Your payment didn’t go through.', intro: error ? 'The link may be incomplete. Your orders are always in My orders.' : 'Your order is saved. If money left your account anyway, message us and we’ll sort it out.' },
  }[state];

  const Icon = state === 'paid' ? Check : state === 'pending' ? Clock : X;
  const iconTone = state === 'paid' ? 'bg-ink text-[#fff]' : state === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-neutral-200 text-neutral-700';

  return (
    <div className="bg-[#f3f2ee] text-ink pt-24 md:pt-32 pb-20 min-h-screen">
      <div className="max-w-[720px] mx-auto px-3 md:px-6">
        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="px-2 mb-6 md:mb-10">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
            className={`w-14 h-14 rounded-full grid place-items-center mb-6 ${iconTone}`}>
            <Icon size={26} strokeWidth={2.2} />
          </motion.div>
          <p className="eyebrow text-neutral-500 mb-3">{copy.eyebrow}</p>
          <h1 className="text-[34px] md:text-[56px] leading-[1.04] font-semibold tracking-[-0.03em]">{copy.title}</h1>
          <p className="mt-3 md:mt-4 text-neutral-600 md:text-lg max-w-[560px]">{copy.intro}</p>
        </motion.header>

        <div className="space-y-2">
          {(signalId || orderInfo) && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#fff] rounded-2xl p-5">
                <p className="text-sm text-neutral-500">Order number</p>
                <p className="text-[20px] md:text-[24px] font-semibold tracking-[-0.02em] mt-1 font-mono">{signalId || `#${orderId}`}</p>
              </div>
              <div className="bg-[#fff] rounded-2xl p-5">
                <p className="text-sm text-neutral-500">{state === 'paid' ? 'Paid' : 'Amount'}</p>
                <p className="text-[20px] md:text-[24px] font-semibold tracking-[-0.02em] mt-1">{orderInfo ? inr(orderInfo.total) : '—'}</p>
              </div>
            </div>
          )}

          {state === 'paid' && (
            <Card title="What happens next">
              <ol className="space-y-4">
                {[
                  { icon: Package, t: 'We pack it', d: 'Every order is checked and packed by hand in Hyderabad, usually within 1–2 days.' },
                  { icon: Truck, t: 'It ships', d: 'You’ll get an email with the courier and tracking link as soon as it leaves.' },
                  { icon: Home, t: 'It arrives', d: 'Most orders arrive in 3–7 days. Size not right? You have 7 days to ask for an exchange.' },
                ].map(({ icon: I, t, d }) => (
                  <li key={t} className="flex gap-4">
                    <span className="w-9 h-9 rounded-full bg-[#f3f2ee] grid place-items-center shrink-0"><I size={16} /></span>
                    <div><p className="font-medium">{t}</p><p className="text-[15px] text-neutral-600 leading-relaxed">{d}</p></div>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {state === 'pending' && (
            <Card>
              <div className="flex items-center gap-3 text-[15px] text-neutral-600">
                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin shrink-0" />
                Checking with PhonePe. If you paid and this doesn’t change in a few minutes, message us and we’ll sort it out.
              </div>
            </Card>
          )}

          {state === 'failed' && !error && (
            <Card title="Try the payment again">
              <p className="text-[15px] text-neutral-600 leading-relaxed">Your cart and order are saved. Pay again with PhonePe and we’ll confirm it straight away.</p>
              {retryError && <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{retryError}</p>}
              <button onClick={handleRetryPayment} disabled={retrying || !signalId} className={`${btnInk} mt-5 w-full sm:w-auto`}>
                {retrying ? (<><span className="w-3.5 h-3.5 border-2 border-[#fff] border-t-transparent rounded-full animate-spin" /> Opening PhonePe…</>) : (<>Pay again <ArrowRight size={15} /></>)}
              </button>
            </Card>
          )}

          {!user && state === 'paid' && (
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">Keep track of this order</p>
                  <p className="text-[15px] text-neutral-600">Sign in with the same email to see its progress any time.</p>
                </div>
                <Link to="/auth" className={btnInk}>Sign in or create account</Link>
              </div>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {state === 'paid' ? (
              <>
                <Link to={user ? '/console/orders' : '/collection'} className={`${btnInk} flex-1`}>{user ? 'View my orders' : 'Keep shopping'} <ArrowRight size={15} /></Link>
                <button onClick={share} className={`${btnLine} flex-1`}><Share2 size={15} /> {copied ? 'Link copied' : 'Share CHILS & CO.'}</button>
              </>
            ) : (
              <>
                <Link to={user ? '/console/orders' : '/'} className={`${btnLine} flex-1`}>{user ? 'My orders' : 'Back to home'}</Link>
                <a href={whatsappLink(contact.mobileLink, `Hi CHILS & CO., I need help with my payment${signalId ? ` for order ${signalId}` : ''}.`)} target="_blank" rel="noopener noreferrer" className={`${btnLine} flex-1`}>Message us on WhatsApp</a>
              </>
            )}
          </div>

          {state !== 'paid' && <div className="pt-6"><HelpBox contact={contact} /></div>}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
