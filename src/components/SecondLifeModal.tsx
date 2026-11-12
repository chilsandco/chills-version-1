import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recycle, Leaf, ChevronRight, X, Package, Plus, Check, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../CartContext';

interface SecondLifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithEcoBag: () => void;
  /** Products currently in cart — so we can exclude them from suggestions */
  cartProductIds: string[];
}

const SecondLifeModal: React.FC<SecondLifeModalProps> = ({
  isOpen,
  onClose,
  onContinueWithEcoBag,
  cartProductIds,
}) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      setLoading(true);
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          }
        })
        .catch(err => console.error('Failed to fetch products for upsell', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Filter out products already in cart, only show available ones, max 3
  const suggestions = products
    .filter(p => !cartProductIds.includes(p.id) && p.status === 'Available')
    .slice(0, 3);

  const handleQuickAdd = (product: Product) => {
    const size = selectedSizes[product.id] || defaultSize(product);
    addToCart(product, size);
    setAddedProductId(product.id);

    // Dismiss modal after a brief success animation
    setTimeout(() => {
      onClose();
      setAddedProductId(null);
    }, 1200);
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  // Lock body scroll when modal is open — target both body and html
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  const sizesFor = (p: Product) => (p.availableSizes?.length ? p.availableSizes : ['S', 'M', 'L', 'XL', 'XXL']);
  function defaultSize(p: Product) { const s = sizesFor(p); return s.includes('M') ? 'M' : s[0]; }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:px-4 overscroll-contain bg-ink/50 backdrop-blur-sm"
          onWheel={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#f3f2ee] text-ink rounded-t-2xl sm:rounded-2xl p-4 md:p-6"
            style={{ overscrollBehavior: 'contain' }}
            data-lenis-prevent
          >
            <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#fff] grid place-items-center hover:bg-ink hover:text-[#fff] transition-colors">
              <X size={17} />
            </button>

            <div className="px-1 pr-12">
              <span className="w-11 h-11 rounded-full bg-ink text-[#fff] grid place-items-center mb-4"><Recycle size={20} /></span>
              <p className="eyebrow text-neutral-500 mb-2">Second Life Box</p>
              <h2 className="text-[26px] md:text-[32px] leading-[1.08] font-semibold tracking-[-0.03em]">Add one more tee for our signature box</h2>
              <p className="text-[15px] text-neutral-600 mt-2 leading-relaxed">
                Orders of 2 or more tees ship in our handmade <strong className="text-ink font-medium">Second Life Box</strong>, made to be reused. A single tee ships in an eco-friendly, biodegradable bag.
              </p>
            </div>

            <div className="bg-[#fff] rounded-2xl p-4 mt-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-neutral-600">Your bag</span>
                <span className="font-medium">1 of 2 tees</span>
              </div>
              <div className="h-2 w-full bg-[#eeece6] rounded-full overflow-hidden"><div className="h-full w-1/2 bg-ink rounded-full" /></div>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <span className="inline-flex items-center gap-1.5 bg-[#f3f2ee] rounded-full px-3 py-1.5"><Leaf size={13} /> Eco bag</span>
                <ChevronRight size={14} className="text-neutral-400" />
                <span className="inline-flex items-center gap-1.5 bg-ink text-[#fff] rounded-full px-3 py-1.5"><Package size={13} /> Second Life Box</span>
              </div>
            </div>

            <p className="text-sm text-neutral-500 mt-5 mb-2 px-1">Pick a tee to add</p>
            {loading ? (
              <div className="bg-[#fff] rounded-2xl py-10 flex items-center justify-center text-sm text-neutral-500 gap-2"><Loader2 size={18} className="animate-spin" /> Loading tees…</div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((product, index) => {
                  const added = addedProductId === product.id;
                  const chosen = selectedSizes[product.id] || defaultSize(product);
                  return (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
                      className={`flex gap-3 p-2.5 rounded-2xl bg-[#fff] transition ${added ? 'ring-2 ring-ink' : ''}`}>
                      <div className="w-20 h-24 rounded-xl bg-paper overflow-hidden shrink-0">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow min-w-0 py-0.5">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm font-semibold mt-0.5">₹{product.price.toLocaleString('en-IN')}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sizesFor(product).map(size => (
                            <button key={size} type="button" onClick={() => handleSizeSelect(product.id, size)}
                              className={`min-w-8 h-8 px-1.5 rounded-lg text-xs font-medium border transition-colors ${chosen === size ? 'bg-ink text-[#fff] border-ink' : 'border-[#e3e0d8] hover:border-ink/40'}`}>
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button type="button" onClick={() => handleQuickAdd(product)} disabled={addedProductId !== null} aria-label={`Add ${product.name}, size ${chosen}`}
                        className={`self-center w-11 h-11 rounded-full grid place-items-center shrink-0 transition-colors ${added ? 'bg-ink text-[#fff]' : 'bg-[#f3f2ee] hover:bg-ink hover:text-[#fff] disabled:opacity-30'}`}>
                        {added ? <Check size={18} /> : <Plus size={18} />}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#fff] rounded-2xl py-8 text-center text-sm text-neutral-500">Every available tee is already in your bag.</div>
            )}

            <button type="button" onClick={onContinueWithEcoBag}
              className="w-full mt-4 py-3.5 rounded-full border border-ink/15 bg-[#fff] text-sm font-medium hover:border-ink transition-colors flex items-center justify-center gap-2">
              <Leaf size={14} /> Continue with the eco bag
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SecondLifeModal;
