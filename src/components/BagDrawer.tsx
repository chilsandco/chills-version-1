import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../CartContext';
import { useNarrow } from '../hooks/useNarrow';
import { CartItem } from '../types';
import { small } from '../data/studio';
import TrilogyHint from './TrilogyHint';

const EASE = [0.22, 1, 0.36, 1] as const;

const Line: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const size = item.selectedSize;
  const color = item.selectedColor;
  const img = item.comboItems?.[0]?.image ?? item.images?.[0];
  return (
    <div className="flex gap-4 py-5 border-b border-black/[.07]">
      <div className="w-[84px] h-[108px] shrink-0 bg-paper overflow-hidden">
        {img && <img src={small(img)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between gap-3">
          <p className="font-medium leading-snug truncate">{item.name}</p>
          <p className="text-sm font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
        </div>
        {item.isCombo ? (
          <ul className="text-xs text-stone mt-1 space-y-0.5">
            {item.comboItems?.map(s => <li key={s.id} className="truncate">{s.name} · {s.selectedSize}</li>)}
            <li className="text-ink">10% set saving applied</li>
          </ul>
        ) : (
          <p className="text-xs text-stone mt-1">{[size && `Size ${size}`, color].filter(Boolean).join(' · ')}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-center border border-black/15">
            <button aria-label={`Reduce ${item.name}`} onClick={() => (item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1, size, color) : removeFromCart(item.id, size, color))} className="w-9 h-9 flex items-center justify-center"><Minus size={13} /></button>
            <span className="w-7 text-center text-sm" aria-live="polite">{item.quantity}</span>
            <button aria-label={`Add another ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1, size, color)} className="w-9 h-9 flex items-center justify-center"><Plus size={13} /></button>
          </div>
          <button onClick={() => removeFromCart(item.id, size, color)} className="text-xs text-stone underline underline-offset-4 hover:text-ink">Remove</button>
        </div>
      </div>
    </div>
  );
};

/** Slide-in bag, so adding an item never forces a trip to checkout. */
const BagDrawer: React.FC = () => {
  const { cart, totalItems, totalPrice } = useCart();
  const narrow = useNarrow();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('bag-open', onOpen);
    return () => window.removeEventListener('bag-open', onOpen);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-[92] bg-[#0e0e0c]/35 backdrop-blur-[2px]" />
          <motion.aside
            role="dialog" aria-modal="true" aria-label="Your bag"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: EASE }}
            className={`fixed z-[93] top-0 right-0 h-full bg-[#fff] text-ink flex flex-col ${narrow ? 'w-full' : 'w-[460px]'}`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <h2 className="text-xl font-semibold">Your bag {totalItems > 0 && <span className="text-stone font-normal text-base ml-1">{totalItems}</span>}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close bag" className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center hover:bg-ink hover:text-[#fff] transition-colors"><X size={16} /></button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <p className="text-2xl font-semibold">Your bag is empty</p>
                <p className="text-stone mt-2 text-sm">Choose a Trilogy and save 10%.</p>
                <Link to="/pick-your-three" className="btn-primary mt-7 px-8 py-4 text-sm">Pick your three</Link>
                <Link to="/collection" className="mt-4 text-sm underline underline-offset-4">Browse all products</Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
                  {cart.map(item => <Line key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} item={item} />)}
                </div>
                <div className="px-6 py-5 border-t border-black/10 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                  {/* a single tee in the bag that also comes as a set */}
                  <TrilogyHint ids={cart.filter(i => !i.isCombo).map(i => String(i.id))} onGo={() => setOpen(false)} className="mb-4" />
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium">Subtotal</p>
                    <p className="text-xl font-semibold">₹{totalPrice.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-stone mt-1">Shipping is calculated at checkout. Collect in store is free.</p>
                  <button onClick={() => navigate('/checkout')} className="btn-primary mt-4 w-full py-4 text-sm">Checkout</button>
                  <button onClick={() => setOpen(false)} className="mt-3 w-full text-sm text-stone hover:text-ink">Continue shopping</button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default BagDrawer;
