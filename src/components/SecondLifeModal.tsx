import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recycle, Leaf, ChevronRight, X, Package, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
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
    const size = selectedSizes[product.id] || 'M'; // Default to M if not selected
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

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4 overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-neutral-800"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Top Accent Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent to-transparent" />

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/40" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 p-2 text-neutral-600 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="p-8 pb-0 md:p-10 md:pb-0">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 border border-accent/40 bg-accent/5 flex items-center justify-center"
                >
                  <Recycle size={22} className="text-accent" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.4em] font-bold text-accent">Second Life Protocol</span>
                    <Sparkles size={12} className="text-accent/60" />
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-bold mt-0.5">Packaging Intelligence Activated</p>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white leading-snug mt-6">
                Sustain Our <span className="text-accent">Unboxing Experience</span>
              </h2>
              <p className="text-[12px] leading-relaxed text-neutral-400 tracking-wide max-w-lg mt-3">
                We have put a lot of effort and care into creating a unique unboxing experience. To help us sustain these packaging standards and offset high individual shipping charges, we kindly request you to order at least 2 T-shirts. This enables us to send them in our premium, handcrafted <span className="text-white font-medium">Second Life Box</span>.
              </p>

              {/* Visual Progress Element */}
              <div className="mt-6 border border-[#D4AF37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.04),rgba(0,0,0,0)_60%)] p-4 relative overflow-hidden">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2">
                  <span>Unboxing Unlock Progress</span>
                  <span className="text-accent font-bold">1 / 2 Tees</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full w-1/2 bg-gradient-to-r from-[#D4AF37] to-[#f5d97a]" />
                </div>
                <p className="text-[9.5px] text-neutral-500 font-light tracking-wide uppercase">
                  Add <strong className="text-white">1 more tee</strong> to unlock the premium <strong className="text-accent">Second Life Box</strong>
                </p>
              </div>

              {/* Current vs Upgrade — Updated for MOQ */}
              <div className="flex items-center gap-4 mt-5 mb-2">
                {/* 
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/60 border border-neutral-800">
                  <Leaf size={12} className="text-green-500/70" />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-500">Current: Eco Bag</span>
                </div>
                <ChevronRight size={14} className="text-neutral-700" />
                */}
                <div className="flex items-center gap-2 px-3 py-2 border border-accent/30 bg-accent/5">
                  <Package size={12} className="text-accent" />
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-accent">Active Shipping: Second Life Box Only</span>
                </div>
              </div>

              {/* Top Eco Bag CTA — commented out for MOQ enforcement */}
              {/* 
              <button
                type="button"
                onClick={onContinueWithEcoBag}
                className="w-full mt-6 py-3 text-[10px] tracking-[0.25em] font-bold uppercase text-neutral-500 hover:text-white transition-colors flex items-center justify-center gap-2 border border-neutral-900 hover:border-neutral-600"
              >
                <Leaf size={11} />
                <span>Continue with Biodegradable Eco Bag</span>
              </button>
              */}
            </div>

            {/* Divider */}
            <div className="mx-8 md:mx-10 my-6 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

            {/* Product Suggestions */}
            <div className="px-8 md:px-10 pb-2">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500">Quick Add</span>
                <div className="flex-grow h-[1px] bg-neutral-900" />
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-700">Select a tee below</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <Loader2 size={24} className="text-accent" />
                  </motion.div>
                  <span className="ml-3 text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold">Loading inventory...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex gap-5 p-4 border transition-all duration-300 group ${
                        addedProductId === product.id
                          ? 'border-accent/60 bg-accent/5'
                          : 'border-neutral-900 bg-neutral-950/60 hover:border-neutral-700'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 md:w-24 md:h-28 bg-neutral-900 overflow-hidden flex-shrink-0 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow flex flex-col justify-between min-w-0 py-1">
                        <div>
                          <h4 className="text-[13px] md:text-[14px] tracking-tight font-display font-medium uppercase text-white group-hover:text-accent transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-neutral-600 uppercase tracking-[0.15em] font-bold mt-1">
                            ₹{product.price.toLocaleString()}
                          </p>

                          {/* Size Selector */}
                          <div className="flex items-center gap-1.5 mt-3">
                            {sizes.map(size => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSizeSelect(product.id, size)}
                                className={`w-7 h-7 text-[8px] font-bold uppercase tracking-wider border transition-all ${
                                  (selectedSizes[product.id] || 'M') === size
                                    ? 'border-accent bg-accent/10 text-accent'
                                    : 'border-neutral-800 text-neutral-600 hover:border-neutral-600'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Button */}
                      <div className="flex-shrink-0 flex items-center">
                        <motion.button
                          type="button"
                          onClick={() => handleQuickAdd(product)}
                          disabled={addedProductId !== null}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-10 h-10 md:w-12 md:h-12 border flex items-center justify-center transition-all duration-300 ${
                            addedProductId === product.id
                              ? 'border-accent bg-accent text-black'
                              : 'border-neutral-800 bg-transparent text-neutral-500 hover:border-accent hover:text-accent disabled:opacity-30'
                          }`}
                        >
                          {addedProductId === product.id ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                              <Check size={18} />
                            </motion.div>
                          ) : (
                            <Plus size={18} />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-600 font-bold">All available tees are in your cart</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 md:p-10 pt-6">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent mb-6" />

              {/* Bottom Eco Bag CTA — commented out for MOQ enforcement */}
              {/* 
              <button
                type="button"
                onClick={onContinueWithEcoBag}
                className="w-full py-4 text-[10px] tracking-[0.3em] font-bold uppercase text-neutral-500 hover:text-white transition-colors flex items-center justify-center gap-2 border border-neutral-900 hover:border-neutral-700"
              >
                <Leaf size={12} />
                <span>Continue with Biodegradable Eco Bag</span>
              </button>
              */}

              <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-800 text-center leading-relaxed mt-4">
                Second Life Box packaging is 100% sustainable. Your choice. Your signal.
              </p>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SecondLifeModal;
