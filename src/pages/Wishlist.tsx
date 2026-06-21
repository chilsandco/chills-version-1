import React, { useState } from 'react';
import { useWishlist } from '../WishlistContext';
import { useCart } from '../CartContext';
import { Trash2, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeSelectSizeId, setActiveSelectSizeId] = useState<string | null>(null);

  if (wishlist.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-display font-bold mb-8 uppercase tracking-tighter">Wishlist is empty</h1>
        <Link 
          to="/collection" 
          className="bg-white text-black px-12 py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-36 md:pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-16">
        <p className="text-[8px] tracking-[0.5em] text-neutral-600 uppercase mb-3">Saved Transmissions</p>
        <h1 className="text-5xl font-display font-bold tracking-tighter uppercase">Wishlist</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {wishlist.map(product => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group relative border border-neutral-900 bg-neutral-950 p-4 transition-all duration-500 hover:border-neutral-700 overflow-hidden"
            >
              <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-neutral-900">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md border border-neutral-800 text-white hover:text-accent transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[11px] font-bold tracking-[0.1em] uppercase mb-1">{product.name}</h3>
                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest">{product.category}</p>
                  </div>
                  <p className="text-sm font-medium">₹{product.price.toLocaleString()}</p>
                </div>

                <div className="flex gap-3">
                  <Link 
                    to={`/product/${product.id}`}
                    className="flex-1 border border-neutral-900 py-3.5 text-[9px] tracking-[0.2em] font-bold uppercase hover:bg-neutral-900 transition-all flex items-center justify-center gap-1.5"
                  >
                    Details <ArrowRight size={10} />
                  </Link>
                  <button 
                    onClick={() => setActiveSelectSizeId(product.id)}
                    className="flex-1 border border-neutral-800 bg-white text-black py-3.5 text-[9px] tracking-[0.2em] font-bold uppercase hover:bg-accent hover:border-accent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={10} /> Move to Cart
                  </button>
                </div>
              </div>

              {/* Size Selector Overlay */}
              <AnimatePresence>
                {activeSelectSizeId === product.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute inset-x-0 bottom-0 bg-black/95 backdrop-blur-md border-t border-neutral-800 p-6 flex flex-col justify-end z-20 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] tracking-[0.2em] font-bold uppercase text-neutral-400">Select Size</p>
                      <button 
                        onClick={() => setActiveSelectSizeId(null)}
                        className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center py-2">
                      {['S', 'M', 'L', 'XL', '2XL'].map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            addToCart(product, size);
                            toggleWishlist(product);
                            setActiveSelectSizeId(null);
                          }}
                          className="w-10 h-10 border border-neutral-800 hover:border-accent hover:text-accent font-mono text-xs uppercase transition-all flex items-center justify-center cursor-pointer rounded-sm"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
