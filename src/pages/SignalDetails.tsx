import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ExternalLink, RefreshCcw, Star, ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { Signal } from '../types';
import { useAuth } from '../AuthContext';
import { useContact, whatsappLink } from '../components/InfoPage';
import { OrderPage, Card, StatusPill, Thumb, Spinner, inr, shortDate, statusOf, btnInk, btnLine } from '../components/OrderUi';

const SHIPPED = ['dispatched', 'Dispatched', 'shipping', 'completed'];

/** One order: where it is, what's in it, and what you can do with it. */
const SignalDetails: React.FC = () => {
  const { id } = useParams();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const contact = useContact();
  const pollStart = useRef(Date.now());

  // While the payment is still confirming, look again every 10 s for up to 5 minutes.
  useEffect(() => {
    let pollTimer: any;
    const fetchSignal = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data?.id) setSignal(data);
        if ((data.status === 'pending' || data.status === 'on-hold') && Date.now() - pollStart.current < 300000) {
          pollTimer = setTimeout(fetchSignal, 10000);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSignal();
    return () => { if (pollTimer) clearTimeout(pollTimer); };
  }, [id, token]);

  if (loading) return <Spinner label="Getting your order…" />;

  if (!signal) {
    return (
      <OrderPage back={{ to: '/console/orders', label: 'My orders' }} eyebrow="Order" title={token ? 'We couldn’t find this order' : 'Sign in to see this order'}
        intro={token ? 'It may belong to a different account. Your orders are all in My orders.' : 'Use the email you ordered with.'}>
        <div className="px-2"><Link to={token ? '/console/orders' : '/auth'} className={btnInk}>{token ? 'My orders' : 'Sign in'} <ArrowRight size={15} /></Link></div>
      </OrderPage>
    );
  }

  const s = signal.status;
  const isRefunded = s === 'refunded';
  const isStopped = s === 'failed' || s === 'cancelled';
  const isPending = s === 'pending' || s === 'on-hold';
  const isPaid = ['processing', 'completed', 'shipping', 'delivered', 'dispatched', 'Dispatched'].includes(s) || isRefunded;
  const shipped = SHIPPED.includes(s) || !!signal.shipping?.awb || isRefunded;

  const steps = [
    { label: 'Ordered', done: true },
    { label: 'Packed', done: ['processing', ...SHIPPED].includes(s) || isRefunded },
    { label: 'On the way', done: shipped },
    { label: 'Delivered', done: s === 'completed' || isRefunded },
  ];
  const current = steps.filter(x => x.done).length - 1;

  // Returns: a delivered order, not itself an exchange, within 7 days of delivery.
  const deliveredAt = signal.dateCompleted ? new Date(signal.dateCompleted) : new Date(signal.date);
  const hoursSince = (Date.now() - deliveredAt.getTime()) / 36e5;
  const returnState = s !== 'completed' || isRefunded ? null : signal.parentExchangeOrderId ? 'exchange' : hoursSince <= 168 ? 'open' : 'closed';
  const daysLeft = Math.max(0, Math.ceil((168 - hoursSince) / 24));

  const help = whatsappLink(contact.mobileLink, `Hi CHILS & CO., I have a question about my order ${signal.signalId}.`);

  return (
    <OrderPage
      width="max-w-[1080px]"
      back={{ to: '/console/orders', label: 'My orders' }}
      eyebrow={`Ordered ${shortDate(signal.date)}`}
      title={<span className="font-mono tracking-[-0.04em]">{signal.signalId}</span>}
      intro={statusOf(s).note}
      aside={<StatusPill status={s} className="self-start md:self-end text-sm px-3 py-1.5" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-2 items-start">
        <div className="space-y-2 min-w-0">
          {/* Where it is */}
          {!isStopped && (
            <Card>
              <ol className="grid grid-cols-4">
                {steps.map((st, i) => (
                  <li key={st.label} className="relative flex flex-col items-center text-center">
                    {i > 0 && <span className={`absolute top-[13px] right-1/2 w-full h-[2px] ${st.done ? 'bg-ink' : 'bg-[#e6e3dc]'}`} />}
                    <span className={`relative z-10 w-7 h-7 rounded-full grid place-items-center text-xs font-medium ${st.done ? 'bg-ink text-[#fff]' : 'bg-[#fff] border-2 border-[#e6e3dc] text-neutral-400'} ${i === current && !isRefunded && s !== 'completed' ? 'ring-4 ring-ink/10' : ''}`}>
                      {st.done ? <Check size={14} strokeWidth={2.6} /> : i + 1}
                    </span>
                    <span className={`mt-2 text-xs md:text-sm ${st.done ? 'text-ink font-medium' : 'text-neutral-400'}`}>{st.label}</span>
                  </li>
                ))}
              </ol>
              {isRefunded && (
                <p className="mt-6 text-[15px] text-neutral-600 bg-paper rounded-xl px-4 py-3">
                  <strong className="text-ink font-medium">Refunded {inr(signal.total)}</strong> to your original payment method. Depending on your bank, it shows up in 3–7 business days.
                </p>
              )}
              {isPending && (
                <p className="mt-6 text-[15px] text-neutral-600 flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin shrink-0" /> Waiting for the payment to confirm. This page updates on its own.
                </p>
              )}
            </Card>
          )}

          {isStopped && (
            <Card title={s === 'failed' ? 'The payment didn’t go through' : 'This order was cancelled'}>
              <p className="text-[15px] text-neutral-600 leading-relaxed">
                {s === 'failed' ? 'Nothing was shipped for this order.' : 'Nothing will be shipped for this order.'} If money left your account anyway, message us with the order number and we’ll sort it out.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                <Link to="/collection" className={btnInk}>Shop again</Link>
                <a href={help} target="_blank" rel="noopener noreferrer" className={btnLine}><MessageCircle size={15} /> Message us</a>
              </div>
            </Card>
          )}

          {/* Tracking */}
          {signal.shipping.awb && !isRefunded && (
            <Card title="Tracking">
              <div className="grid sm:grid-cols-3 gap-4 text-[15px]">
                <div><p className="text-sm text-neutral-500">Courier</p><p className="font-medium mt-0.5">{signal.shipping.courier || 'Our delivery partner'}</p></div>
                <div><p className="text-sm text-neutral-500">Latest update</p><p className="font-medium mt-0.5">{signal.shipping.trackingStatus || 'Shipped'}</p></div>
                {signal.shipping.etd && <div><p className="text-sm text-neutral-500">Expected by</p><p className="font-medium mt-0.5">{shortDate(signal.shipping.etd)}</p></div>}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {signal.shipping.trackingUrl && (
                  <a href={signal.shipping.trackingUrl} target="_blank" rel="noopener noreferrer" className={btnInk}>Track package <ExternalLink size={14} /></a>
                )}
                <span className="text-sm text-neutral-500">Tracking number <span className="font-mono text-ink">{signal.shipping.awb}</span></span>
              </div>
            </Card>
          )}

          {/* Exchanges */}
          {signal.rmaSwaps && signal.rmaSwaps.length > 0 && (
            <Card title="Your exchange">
              <div className="space-y-4">
                {signal.rmaSwaps.map((sw, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Thumb src={sw.swapProductImage} alt={sw.swapProductName} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-500 line-through truncate">{sw.originalProductName}</p>
                      <p className="font-medium leading-snug">{sw.swapProductName} · {sw.swapSize}</p>
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {sw.delta > 0 ? (sw.type === 'refund' ? `${inr(sw.delta)} to be refunded to you` : `${inr(sw.delta)} difference paid`) : 'Same price, nothing to pay'}
                      </p>
                    </div>
                    <span className="text-xs bg-paper rounded-full px-2.5 py-1 shrink-0">Requested</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* What's in it */}
          <Card title={`In this order (${signal.items.reduce((a, b) => a + b.quantity, 0)})`}>
            <div className="divide-y divide-[#eeece6]">
              {signal.items.map((item, idx) => {
                const swap = signal.rmaSwaps?.find(x => String(x.originalProductId) === String(item.productId));
                return (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <Link to={`/product/${item.productId}`} className="shrink-0"><Thumb src={item.image} alt={item.name} className={`w-16 h-20 ${isRefunded ? 'opacity-50 grayscale' : ''}`} /></Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.productId}`} className="font-medium leading-snug hover:underline">{item.name}</Link>
                      <p className="text-sm text-neutral-500 mt-0.5">Qty {item.quantity} · {inr(item.price)} each</p>
                      {swap && <p className="text-sm text-neutral-600 mt-1 flex items-center gap-1.5"><RefreshCcw size={13} /> Exchanging for {swap.swapProductName} ({swap.swapSize})</p>}
                      {isPaid && !isRefunded && s === 'completed' && (
                        <Link to={`/product/${item.productId}?writeReview=true`} className="link-brass inline-flex items-center gap-1.5 text-sm mt-2"><Star size={13} /> Write a review</Link>
                      )}
                    </div>
                    <p className={`font-medium shrink-0 ${isRefunded ? 'line-through text-neutral-400' : ''}`}>{inr(item.total)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-[#eeece6] flex justify-between items-baseline">
              <span className="text-neutral-600">Total{isPaid ? ' paid' : ''}</span>
              <span className={`text-2xl font-semibold tracking-[-0.02em] ${isRefunded ? 'text-neutral-400' : ''}`}>{inr(signal.total)}</span>
            </div>
          </Card>

          {/* Returns */}
          {returnState === 'open' && (
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Size not right?</p>
                  <p className="text-[15px] text-neutral-600">You can ask for a return or exchange for {daysLeft} more {daysLeft === 1 ? 'day' : 'days'}.</p>
                </div>
                <Link to={`/console/orders/${signal.id}/return`} className={btnInk}><RefreshCcw size={15} /> Return or exchange</Link>
              </div>
            </Card>
          )}
          {returnState === 'closed' && (
            <p className="px-2 py-2 text-sm text-neutral-500">The 7-day return window for this order has closed. Something wrong with the tee? <a href={help} target="_blank" rel="noopener noreferrer" className="underline text-ink">Message us</a>.</p>
          )}
          {returnState === 'exchange' && (
            <p className="px-2 py-2 text-sm text-neutral-500">This order is already an exchange, so it can’t be exchanged again. <a href={help} target="_blank" rel="noopener noreferrer" className="underline text-ink">Message us</a> if something’s wrong.</p>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-2">
          <Card title="Delivery">
            <p className="text-[15px] leading-relaxed">{signal.shipping.address}</p>
            <p className="text-sm text-neutral-500 mt-2">{signal.shipping.method}</p>
          </Card>

          {signal.billing && (signal.billing.email || signal.billing.phone) && (
            <Card title="Contact">
              <div className="text-[15px] space-y-1">
                <p className="font-medium">{[signal.billing.first_name, signal.billing.last_name].filter(Boolean).join(' ')}</p>
                {signal.billing.email && <p className="text-neutral-600 break-all">{signal.billing.email}</p>}
                {signal.billing.phone && <p className="text-neutral-600">{signal.billing.phone}</p>}
              </div>
              <p className="text-sm text-neutral-500 mt-3">Saved at checkout for this order.</p>
            </Card>
          )}

          <Card title="Payment">
            <p className="flex items-center gap-2 text-[15px]">
              <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-[#2f5130]' : isStopped ? 'bg-neutral-400' : 'bg-amber-500 animate-pulse'}`} />
              {isRefunded ? 'Paid, then refunded' : isPaid ? 'Paid' : isStopped ? 'Not paid' : 'Confirming'}
            </p>
            <p className="text-sm text-neutral-500 mt-1">PhonePe · {inr(signal.total)}</p>
          </Card>

          {isPaid && !isRefunded && (
            <Card>
              <p className="font-semibold">Keep the box</p>
              <p className="text-[15px] text-neutral-600 mt-1">Your tee comes in a sturdy box made to be reused for socks, cables or stationery.</p>
            </Card>
          )}

          <section className="bg-ink text-[#fff] rounded-2xl p-5 md:p-6">
            <p className="font-semibold text-lg">Need help with this order?</p>
            <p className="text-[#fff]/60 text-sm mt-1">Monday to Saturday, 10 AM to 6 PM.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={help} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#fff] text-ink rounded-full px-4 py-2.5 text-sm font-medium"><MessageCircle size={14} /> WhatsApp</a>
              <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Order ${signal.signalId}`)}`} className="inline-flex items-center gap-2 border border-[#fff]/30 rounded-full px-4 py-2.5 text-sm"><Mail size={14} /> Email</a>
            </div>
          </section>
        </div>
      </div>
    </OrderPage>
  );
};

export default SignalDetails;
