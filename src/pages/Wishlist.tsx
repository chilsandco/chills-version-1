import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Check } from 'lucide-react';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';
import SEO from '../components/SEO';
import { studio, small } from '../data/studio';
import { Product } from '../types';

const FALLBACK_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const hasCat = (p: Product, name: string) =>
  p.category?.toLowerCase() === name || p.categories?.some(c => c.toLowerCase() === name);

/** Saved tees: pick a size to move one to the bag, or remove it. */
const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [picking, setPicking] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const moveToBag = (product: Product, size: string) => {
    addToCart(product, size);
    setAdded(`${product.name} · ${size}`);
    setPicking(null);
    toggleWishlist(product);
    setTimeout(() => setAdded(null), 2500);
  };

  return (
    <div className="bg-paper text-ink pt-24 md:pt-32 pb-20 min-h-screen">
      <SEO title="Wishlist" noindex={true} />
      <div className="max-w-[1200px] mx-auto px-3 md:px-6">
        <header className="px-2 mb-6 md:mb-10">
          <p className="eyebrow text-neutral-500 mb-3">Wishlist</p>
          <h1 className="text-[34px] md:text-[56px] leading-[1.04] font-semibold tracking-[-0.03em]">
            {wishlist.length ? 'Saved for later' : 'Nothing saved yet'}
          </h1>
          <p className="mt-3 md:mt-4 text-neutral-600 md:text-lg max-w-[620px]">
            {wishlist.length
              ? `${wishlist.length} ${wishlist.length === 1 ? 'tee' : 'tees'}. Pick a size to move one to your bag.`
              : 'Tap the heart on any tee to keep it here for later.'}
          </p>
        </header>

        <AnimatePresence>
          {added && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-2 mb-4 bg-ink text-[#fff] rounded-2xl px-5 py-3.5 text-[15px] flex items-center gap-3">
              <Check size={16} /> Added to your bag: {added}
            </motion.div>
          )}
        </AnimatePresence>

        {wishlist.length === 0 ? (
          <div className="px-2 flex flex-wrap gap-2">
            <Link to="/collection" className="btn-primary items-center gap-2 px-6 py-3.5 text-sm">Shop the collection <ArrowRight size={15} /></Link>
            <Link to="/pick-your-three" className="btn-secondary items-center gap-2 px-6 py-3.5 text-sm">Pick your three</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <AnimatePresence mode="popLayout">
              {wishlist.map(product => {
                const to = product.type === 'grouped' || hasCat(product, 'combos') ? `/combos?id=${product.id}` : `/product/${product.id}`;
                const sizes = product.availableSizes?.length ? product.availableSizes : FALLBACK_SIZES;
                const canAdd = product.type !== 'grouped' && !hasCat(product, 'combos') && product.status !== 'Coming Soon';
                const open = picking === product.id;
                const img = product.images?.[0] ? small(studio(product.images[0])) : '';
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
                    className="bg-[#fff] rounded-2xl p-2 md:p-3 flex flex-col min-w-0">
                    <div className="relative">
                      <Link to={to} className="block aspect-[3/4] rounded-xl overflow-hidden bg-paper">
                        {img && <img src={img} alt={product.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" />}
                      </Link>
                      <button onClick={() => toggleWishlist(product)} aria-label={`Remove ${product.name} from wishlist`}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#fff]/90 backdrop-blur grid place-items-center hover:bg-ink hover:text-[#fff] transition-colors">
                        <X size={15} />
                      </button>
                    </div>

                    <div className="px-1 pt-3 flex-1">
                      <Link to={to} className="block text-sm md:text-[15px] font-medium leading-snug truncate hover:underline">{product.name}</Link>
                      <p className="text-sm font-semibold mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="px-1 pt-3">
                      {!canAdd ? (
                        <Link to={to} className="btn-secondary w-full items-center justify-center py-2.5 text-sm">View</Link>
                      ) : open ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-neutral-500">Choose a size</span>
                            <button onClick={() => setPicking(null)} aria-label="Close sizes" className="text-neutral-400 hover:text-ink"><X size={14} /></button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sizes.map(sz => (
                              <button key={sz} onClick={() => moveToBag(product, sz)}
                                className="min-w-9 h-9 px-2 rounded-lg border border-[#e3e0d8] text-[13px] font-medium hover:bg-ink hover:text-[#fff] hover:border-ink transition-colors">
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setPicking(product.id)} className="btn-primary w-full py-2.5 text-sm">
                          Move to bag
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
