import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Signal } from '../types';
import { useAuth } from '../AuthContext';
import { OrderPage, Card, StatusPill, Thumb, Spinner, inr, shortDate, btnInk, btnLine } from '../components/OrderUi';

const isFlagActive = (val: any, sessionKey?: string) => {
  if (val === true || val === 1 || val === '1') return true;
  if (typeof val === 'string' && ['true', 'yes', 'on', 'active'].includes(val.trim().toLowerCase())) return true;
  return !!(sessionKey && sessionStorage.getItem(sessionKey) === 'true');
};

/** My orders: every order, newest first, each opening its details. */
const OrderSignals: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  const [searchParams] = useSearchParams();
  const txId = searchParams.get('tx');
  const rmaSuccess = searchParams.get('rma_success');
  const [notice, setNotice] = useState<{ text: string; busy: boolean } | null>(null);

  const load = async () => {
    const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (Array.isArray(data)) setSignals(data);
  };

  // Back from paying the difference for an exchange: confirm that payment, then refresh the list.
  useEffect(() => {
    if (rmaSuccess !== 'true' || !txId || !token) return;
    (async () => {
      setNotice({ text: 'Confirming your exchange payment…', busy: true });
      try {
        const res = await fetch(`/api/orders/rma/reconcile/${txId}`);
        const data = await res.json();
        if (data.success) {
          setNotice({ text: 'Payment received. Your exchange request is in, and we’ll email you the next steps.', busy: false });
          await load();
        } else {
          setNotice({ text: `We’re still waiting for the payment to confirm. ${data.message || ''}`.trim(), busy: false });
        }
      } catch (e) {
        console.error('Failed to reconcile RMA:', e);
        setNotice({ text: 'Payment received. Your order will update shortly.', busy: false });
      } finally {
        setTimeout(() => setNotice(null), 6000);
      }
    })();
  }, [rmaSuccess, txId, token]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    load().catch(err => console.error('Failed to fetch orders:', err)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner label="Getting your orders…" />;

  if (!user && signals.length === 0) {
    return (
      <OrderPage eyebrow="My orders" title="Sign in to see your orders" intro="Use the email you ordered with. Every past order, its tracking and returns are in one place.">
        <div className="px-2 flex flex-wrap gap-2">
          <Link to="/auth" className={btnInk}>Sign in <ArrowRight size={15} /></Link>
          <Link to="/collection" className={btnLine}>Browse the collection</Link>
        </div>
      </OrderPage>
    );
  }

  const hasWaitlist = isFlagActive(user?.onWaitlist);
  const hasCoCreator = isFlagActive(user?.coCreatorInterest, 'chils_cocreator_interest');
  const name = user?.firstName || user?.first_name;

  return (
    <OrderPage
      eyebrow="My orders"
      title={name ? `Hi ${name}.` : 'My orders'}
      intro={signals.length ? `${signals.length} ${signals.length === 1 ? 'order' : 'orders'} so far. Tap one to track it, review it or start a return.` : 'Your orders will show up here.'}
    >
      {notice && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-2 bg-ink text-[#fff] rounded-2xl px-5 py-4 text-[15px] flex items-center gap-3">
          {notice.busy && <span className="w-4 h-4 border-2 border-[#fff] border-t-transparent rounded-full animate-spin shrink-0" />}
          {notice.text}
        </motion.div>
      )}

      <div className="space-y-2">
        {signals.map((o, idx) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx, 8) * 0.04 }}>
            <Link to={`/console/orders/${o.id}`} className="group block bg-[#fff] rounded-2xl p-4 md:p-6 hover:ring-1 hover:ring-ink/15 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-500">{shortDate(o.date)} · <span className="font-mono whitespace-nowrap">{o.signalId}</span></p>
                  <p className="text-xl md:text-2xl font-semibold tracking-[-0.02em] mt-0.5">{inr(o.total)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={o.status} />
                  <ChevronRight size={18} className="text-neutral-400 group-hover:text-ink group-hover:translate-x-0.5 transition" />
                </div>
              </div>
              {o.items.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto -mx-1 px-1 pb-1">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 shrink-0 max-w-[260px]">
                      <Thumb src={it.image} alt={it.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug line-clamp-2">{it.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Qty {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          </motion.div>
        ))}

        {signals.length === 0 && (
          <Card>
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-[15px] text-neutral-600 mt-1">When you buy something, it’ll appear here with its tracking.</p>
            <Link to="/collection" className={`${btnInk} mt-5`}>Shop the collection <ArrowRight size={15} /></Link>
          </Card>
        )}

        {(hasWaitlist || hasCoCreator) && (
          <div className="grid md:grid-cols-2 gap-2 pt-6">
            {hasWaitlist && (
              <Card>
                <p className="eyebrow text-neutral-500 mb-2">The Bespoke</p>
                <p className="text-lg font-semibold">You’re on the waitlist</p>
                <p className="text-[15px] text-neutral-600 mt-1">We’ll email you as soon as The Bespoke opens for early access.</p>
                <Link to="/bespoke" className="inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm mt-4">About The Bespoke <ArrowRight size={13} /></Link>
              </Card>
            )}
            {hasCoCreator && (
              <Card>
                <p className="eyebrow text-neutral-500 mb-2">Co-creators</p>
                <p className="text-lg font-semibold">You’re a co-creator{user?.pseudoName ? `, ${user.pseudoName}` : ''}</p>
                <p className="text-[15px] text-neutral-600 mt-1">We’ll invite you to share your designs when submissions open.</p>
                <Link to="/co-creator" className="inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm mt-4">Co-creator page <ArrowRight size={13} /></Link>
              </Card>
            )}
          </div>
        )}
      </div>
    </OrderPage>
  );
};

export default OrderSignals;
