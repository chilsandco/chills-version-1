import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Camera, X, ArrowRight, RefreshCcw } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Signal, SignalItem, Product } from '../types';
import { useContact, whatsappLink } from '../components/InfoPage';
import { OrderPage, Card, Thumb, Spinner, inr, btnInk, btnLine } from '../components/OrderUi';

interface ReturnItemChoice {
  productId: string;
  quantity: number;
  action: 'refund' | 'size_exchange' | 'style_exchange';
  selectedSize?: string;
  exchangeProductId?: string;
  exchangeProductName?: string;
  exchangeSize?: string;
}

const REASONS = ['Size Issue', 'Damaged Product', 'Wrong Item Received', 'Quality Issue', 'Other'];
const REASON_LABEL: Record<string, string> = {
  'Size Issue': 'Size or fit', 'Damaged Product': 'Arrived damaged', 'Wrong Item Received': 'Wrong item', 'Quality Issue': 'Quality concern', Other: 'Something else',
};
const NEEDS_PHOTOS = ['Damaged Product', 'Wrong Item Received', 'Quality Issue'];
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const ACTIONS = [
  { key: 'size_exchange', label: 'Different size', hint: 'Same tee' },
  { key: 'style_exchange', label: 'Different tee', hint: 'Pay or get back the difference' },
  { key: 'refund', label: 'Refund', hint: 'To your original payment' },
] as const;

const chip = (on: boolean) =>
  `border rounded-xl transition-colors ${on ? 'border-ink bg-ink text-[#fff]' : 'border-[#e3e0d8] bg-[#fff] hover:border-ink/40'}`;

const SizePicker: React.FC<{ sizes: string[]; value?: string; onPick: (s: string) => void }> = ({ sizes, value, onPick }) => (
  <div className="flex flex-wrap gap-2">
    {sizes.map(sz => (
      <button key={sz} type="button" onClick={() => onPick(sz)} className={`${chip(value === sz)} min-w-11 h-11 px-3 text-sm font-medium`}>{sz}</button>
    ))}
  </div>
);

/** Ask for a return or exchange. The rules are unchanged: 7 days from delivery, photos for damage or wrong items, one exchange per order. */
const ReturnRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const contact = useContact();

  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [returnItems, setReturnItems] = useState<ReturnItemChoice[]>([]);
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const balanceSheet = useMemo(() => {
    let refundTotal = 0;
    let extraChargeTotal = 0;
    returnItems.forEach(ri => {
      const item = signal?.items.find(i => i.productId === ri.productId);
      if (!item) return;
      if (ri.action === 'refund') refundTotal += item.price * ri.quantity;
      else if (ri.action === 'style_exchange' && ri.exchangeProductId) {
        const alt = productsCatalog.find(p => p.id.toString() === ri.exchangeProductId);
        if (alt) {
          const diff = alt.price - item.price;
          if (diff > 0) extraChargeTotal += diff * ri.quantity;
          else if (diff < 0) refundTotal += Math.abs(diff) * ri.quantity;
        }
      }
    });
    const netBalance = refundTotal - extraChargeTotal; // positive: we refund; negative: customer pays
    return { refundTotal, extraChargeTotal, isNetRefund: netBalance >= 0, absoluteBalance: Math.abs(netBalance) };
  }, [returnItems, signal, productsCatalog]);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) {
          if (data.parentExchangeOrderId) {
            setError('This order is already an exchange, and each order can be exchanged only once.');
            return;
          }
          setSignal(data);
          // Start with every item picked, as an exchange for a different size (the most common request).
          setReturnItems(data.items.map((i: SignalItem) => ({ productId: i.productId, quantity: i.quantity, action: 'size_exchange' })));
        } else {
          setError(data.message || 'We couldn’t load this order.');
        }
      } catch {
        setError('We couldn’t reach the store. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) setProductsCatalog(await res.json());
      } catch (err) {
        console.error('Failed to fetch products catalog:', err);
      }
    };
    if (token && id) { fetchSignal(); fetchCatalog(); }
    else setLoading(false);
  }, [id, token]);

  const update = (productId: string, patch: Partial<ReturnItemChoice>) =>
    setReturnItems(prev => prev.map(pi => (pi.productId === productId ? { ...pi, ...patch } : pi)));

  const handleItemToggle = (productId: string, quantity: number) => {
    setReturnItems(prev => prev.some(i => i.productId === productId)
      ? prev.filter(i => i.productId !== productId)
      : [...prev, { productId, quantity, action: 'size_exchange' }]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || images.length >= 3) return;
    const reader = new FileReader();
    reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const sizesFor = (productId?: string) => {
    const p = productsCatalog.find(x => x.id.toString() === String(productId));
    return (p as any)?.availableSizes?.length ? (p as any).availableSizes as string[] : DEFAULT_SIZES;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fail = (m: string) => { setFormError(m); return; };
    if (returnItems.length === 0) return fail('Pick at least one tee.');
    for (const item of returnItems) {
      const name = signal?.items.find(i => i.productId === item.productId)?.name || 'the tee';
      if (item.action === 'size_exchange' && !item.selectedSize) return fail(`Choose the new size for ${name}.`);
      if (item.action === 'style_exchange' && !item.exchangeProductId) return fail(`Choose the tee you’d like instead of ${name}.`);
      if (item.action === 'style_exchange' && !item.exchangeSize) return fail(`Choose a size for ${item.exchangeProductName}.`);
    }
    if (!reason) return fail('Tell us the reason.');
    if (!description.trim()) return fail('Add a short description of what went wrong.');
    if (NEEDS_PHOTOS.includes(reason) && images.length === 0) return fail('Please add at least one photo for this reason.');
    if (!acceptedTerms) return fail('Please tick the box to confirm you’ve read the return policy.');
    setFormError(null);

    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason, description, products: returnItems, images }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.requiresPayment && data.paymentUrl) window.location.href = data.paymentUrl;
        else setSuccess(true);
      } else {
        setFormError(data.message || 'We couldn’t send your request. Please try again.');
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isReturnable = () => {
    if (!signal || signal.status !== 'completed' || !signal.dateCompleted) return false;
    return (Date.now() - new Date(signal.dateCompleted).getTime()) / 36e5 <= 168;
  };

  const back = { to: `/console/orders/${id}`, label: 'Back to order' };
  const help = whatsappLink(contact.mobileLink, `Hi CHILS & CO., I need help with a return for order ${signal?.signalId || id}.`);

  if (loading) return <Spinner label="Getting your order…" />;

  if (!token) {
    return (
      <OrderPage back={back} eyebrow="Returns" title="Sign in to ask for a return" intro="Use the email you ordered with.">
        <div className="px-2"><Link to="/auth" className={btnInk}>Sign in <ArrowRight size={15} /></Link></div>
      </OrderPage>
    );
  }

  if (error) {
    return (
      <OrderPage back={back} eyebrow="Returns" title="We can’t start a return here" intro={error}>
        <div className="px-2 flex flex-wrap gap-2">
          <Link to="/console/orders" className={btnLine}>My orders</Link>
          <a href={help} target="_blank" rel="noopener noreferrer" className={btnInk}>Message us</a>
        </div>
      </OrderPage>
    );
  }

  if (success) {
    return (
      <OrderPage eyebrow="Request sent" title="We’ve got your request." intro="Our team looks at every request, usually within a day. We’ll email you once it’s approved, with the pickup details.">
        <div className="px-2 flex flex-wrap gap-2">
          <Link to={`/console/orders/${id}`} className={btnInk}>Back to order</Link>
          <Link to="/collection" className={btnLine}>Keep shopping</Link>
        </div>
      </OrderPage>
    );
  }

  if (signal?.status === 'completed' && !isReturnable()) {
    return (
      <OrderPage back={back} eyebrow="Returns" title="The 7-day window has closed" intro="Returns and exchanges can be asked for within 7 days of delivery. If something is genuinely wrong with the tee, message us and we’ll take a look.">
        <div className="px-2"><a href={help} target="_blank" rel="noopener noreferrer" className={btnInk}>Message us on WhatsApp</a></div>
      </OrderPage>
    );
  }

  return (
    <OrderPage
      width="max-w-[1080px]"
      back={back}
      eyebrow={`Return or exchange · ${signal?.signalId}`}
      title="What would you like to do?"
      intro="Size not right? We’ll swap it. For anything else, tell us what happened and we’ll look at it personally."
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-2 items-start">
        <div className="space-y-2 min-w-0">
          {/* 1. Which tees */}
          <Card title="1. Which tees?">
            <div className="space-y-3">
              {signal?.items.map(item => {
                const choice = returnItems.find(i => i.productId === item.productId);
                return (
                  <div key={item.productId} className={`rounded-2xl border transition-colors ${choice ? 'border-ink' : 'border-[#e8e5de]'}`}>
                    <button type="button" onClick={() => handleItemToggle(item.productId, item.quantity)} className="w-full flex items-center gap-4 p-3 md:p-4 text-left">
                      <span className={`w-5 h-5 rounded-md grid place-items-center shrink-0 ${choice ? 'bg-ink text-[#fff]' : 'border-2 border-[#d8d4cb]'}`}>{choice && <Check size={13} strokeWidth={3} />}</span>
                      <Thumb src={item.image} alt={item.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium leading-snug">{item.name}</p>
                        <p className="text-sm text-neutral-500 mt-0.5">Qty {item.quantity} · {inr(item.price)}</p>
                      </div>
                    </button>

                    {choice && (
                      <div className="border-t border-[#eeece6] p-3 md:p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {ACTIONS.map(a => (
                            <button key={a.key} type="button" onClick={() => update(item.productId, { action: a.key })} className={`${chip(choice.action === a.key)} px-2 py-3 text-center`}>
                              <span className="block text-sm font-medium">{a.label}</span>
                              <span className={`block text-[11px] mt-0.5 leading-tight ${choice.action === a.key ? 'text-[#fff]/60' : 'text-neutral-500'}`}>{a.hint}</span>
                            </button>
                          ))}
                        </div>

                        {choice.action === 'size_exchange' && (
                          <div>
                            <p className="text-sm text-neutral-600 mb-2">New size</p>
                            <SizePicker sizes={sizesFor(item.productId)} value={choice.selectedSize} onPick={sz => update(item.productId, { selectedSize: sz })} />
                          </div>
                        )}

                        {choice.action === 'style_exchange' && (() => {
                          const alts = productsCatalog.filter(p =>
                            p.id.toString() !== item.productId.toString() && p.type !== 'grouped' && p.category !== 'Combos' && !(p.categories || []).includes('Combos'));
                          if (!alts.length) return <p className="text-sm text-neutral-500">Loading the collection…</p>;
                          return (
                            <div className="space-y-4">
                              <p className="text-sm text-neutral-600">Pick the tee you’d like instead</p>
                              <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-2 snap-x">
                                {alts.map(alt => {
                                  const on = choice.exchangeProductId === alt.id.toString();
                                  const diff = alt.price - item.price;
                                  return (
                                    <button key={alt.id} type="button"
                                      onClick={() => update(item.productId, { exchangeProductId: alt.id.toString(), exchangeProductName: alt.name, exchangeSize: undefined })}
                                      className={`w-32 shrink-0 snap-start text-left rounded-xl p-1.5 border-2 transition-colors ${on ? 'border-ink' : 'border-transparent hover:border-[#e3e0d8]'}`}>
                                      <Thumb src={alt.images?.[0]} alt={alt.name} className="w-full h-40" />
                                      <p className="text-[13px] font-medium mt-2 truncate">{alt.name}</p>
                                      <p className={`text-xs mt-0.5 ${diff > 0 ? 'text-amber-800' : diff < 0 ? 'text-[#2f5130]' : 'text-neutral-500'}`}>
                                        {diff === 0 ? 'Same price' : diff > 0 ? `Pay ${inr(diff)} more` : `${inr(-diff)} back to you`}
                                      </p>
                                    </button>
                                  );
                                })}
                              </div>
                              {choice.exchangeProductId && (
                                <div>
                                  <p className="text-sm text-neutral-600 mb-2">Size for {choice.exchangeProductName}</p>
                                  <SizePicker sizes={sizesFor(choice.exchangeProductId)} value={choice.exchangeSize} onPick={sz => update(item.productId, { exchangeSize: sz })} />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 2. Why */}
          <Card title="2. What happened?">
            <div className="flex flex-wrap gap-2">
              {REASONS.map(r => (
                <button key={r} type="button" onClick={() => setReason(r)} className={`${chip(reason === r)} px-4 py-2.5 text-sm font-medium rounded-full`}>{REASON_LABEL[r]}</button>
              ))}
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={reason === 'Size Issue' ? 'For example: a bit tight on the shoulders, I usually wear M.' : 'A few words on what went wrong helps us sort it out faster.'}
              className="mt-4 w-full rounded-xl border border-[#e3e0d8] bg-[#fbfaf8] p-4 text-[15px] min-h-[120px] outline-none focus:border-ink transition-colors placeholder:text-neutral-400"
            />
          </Card>

          {/* 3. Photos */}
          <Card title={<span className="flex items-baseline justify-between gap-3">3. Photos <span className="text-sm font-normal text-neutral-500">{NEEDS_PHOTOS.includes(reason) ? 'Needed for this reason' : 'Optional'} · {images.length}/3</span></span>}>
            <div className="flex gap-2 flex-wrap">
              {images.map((src, idx) => (
                <div key={idx} className="relative w-24 h-32 rounded-xl overflow-hidden bg-[#ebe9e3]">
                  <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/80 text-[#fff] grid place-items-center"><X size={13} /></button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-24 h-32 rounded-xl border-2 border-dashed border-[#d8d4cb] hover:border-ink/50 grid place-items-center cursor-pointer text-neutral-500 transition-colors">
                  <span className="flex flex-col items-center gap-1.5 text-xs"><Camera size={20} /> Add photo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </Card>

          {/* A word from us */}
          <section className="rounded-2xl p-5 md:p-7 bg-[#e9e6df]">
            <p className="font-semibold">A note from us</p>
            <div className="text-[15px] text-neutral-700 leading-relaxed space-y-2 mt-2">
              <p>Every CHILS & CO. tee is designed, tested and packed with a lot of care, from fabric and colour to wash checks.</p>
              <p>If it’s about size, we completely understand and will take care of it. For anything else, we’d kindly ask you to think about the effort behind the piece before going ahead. It means a lot to a growing brand. Thank you 🤍</p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-28 space-y-2">
          <Card title="Summary">
            {returnItems.length === 0 ? (
              <p className="text-sm text-neutral-500">No tees picked yet.</p>
            ) : (
              <ul className="space-y-3">
                {returnItems.map(ri => {
                  const item = signal?.items.find(i => i.productId === ri.productId);
                  return (
                    <li key={ri.productId} className="text-[15px]">
                      <p className="font-medium leading-snug">{item?.name} <span className="text-neutral-500 font-normal">×{ri.quantity}</span></p>
                      <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1.5">
                        <RefreshCcw size={12} />
                        {ri.action === 'refund' && 'Refund'}
                        {ri.action === 'size_exchange' && `New size: ${ri.selectedSize || 'choose'}`}
                        {ri.action === 'style_exchange' && `Swap for ${ri.exchangeProductName || 'a tee'}${ri.exchangeSize ? ` · ${ri.exchangeSize}` : ''}`}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            {returnItems.length > 0 && (balanceSheet.refundTotal > 0 || balanceSheet.extraChargeTotal > 0) && (
              <div className="mt-5 pt-4 border-t border-[#eeece6] space-y-1.5 text-sm">
                {balanceSheet.refundTotal > 0 && <div className="flex justify-between text-neutral-600"><span>Refund</span><span>{inr(balanceSheet.refundTotal)}</span></div>}
                {balanceSheet.extraChargeTotal > 0 && <div className="flex justify-between text-neutral-600"><span>Price difference</span><span>{inr(balanceSheet.extraChargeTotal)}</span></div>}
                <div className="flex justify-between items-baseline pt-2 text-ink">
                  <span className="font-medium">{balanceSheet.isNetRefund ? 'You get back' : 'You pay now'}</span>
                  <span className="text-xl font-semibold">{inr(balanceSheet.absoluteBalance)}</span>
                </div>
              </div>
            )}
            {reason && <p className="mt-4 text-sm text-neutral-500">Reason: <span className="text-ink">{REASON_LABEL[reason]}</span></p>}
          </Card>

          <Card>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="peer sr-only" />
              <span className={`mt-0.5 w-5 h-5 rounded-md grid place-items-center shrink-0 ${acceptedTerms ? 'bg-ink text-[#fff]' : 'border-2 border-[#d8d4cb]'} peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30`}>{acceptedTerms && <Check size={13} strokeWidth={3} />}</span>
              <span className="text-sm text-neutral-600 leading-relaxed">
                I’ve read the <Link to="/returns-refunds" target="_blank" className="underline text-ink">return policy</Link>. I understand returns are mainly for size, and other requests are reviewed one by one.
              </span>
            </label>

            {formError && <p className="mt-4 text-sm text-red-800 bg-red-50 rounded-xl px-4 py-3">{formError}</p>}

            <button type="submit" disabled={submitting} className={`${btnInk} w-full mt-4`}>
              {submitting ? (<><span className="w-3.5 h-3.5 border-2 border-[#fff] border-t-transparent rounded-full animate-spin" /> Sending…</>)
                : !balanceSheet.isNetRefund && balanceSheet.absoluteBalance > 0 ? <>Continue to pay {inr(balanceSheet.absoluteBalance)} <ArrowRight size={15} /></>
                : <>Send request <ArrowRight size={15} /></>}
            </button>
            <p className="text-xs text-neutral-500 mt-3 text-center">We reply within a day, Monday to Saturday.</p>
          </Card>
        </div>
      </form>
    </OrderPage>
  );
};

export default ReturnRequest;
