import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../WishlistContext';
import { openQuickView } from './QuickView';
import { studio, small } from '../data/studio';

interface ProductCardProps {
  product: Product;
  viewMode?: 'editorial' | 'archive';
  /** Show a hover/tap size strip that adds straight to the bag */
  quickAdd?: boolean;
  /** Overrides the category line, so a card matches the group it is shown in */
  label?: string;
}

const hasCat = (p: Product, name: string) =>
  p.category?.toLowerCase() === name || p.categories?.some(c => c.toLowerCase() === name);

const ProductCard: React.FC<ProductCardProps> = ({ product, quickAdd = false, label }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const canQuickAdd = quickAdd && product.type !== 'grouped' && product.status === 'Available' && !!product.availableSizes?.length && !hasCat(product, 'combos');
  const [hover, setHover] = useState(false);

  const to = hasCat(product, 'combos-redirect')
    ? '/combos'
    : product.type === 'grouped' || hasCat(product, 'combos')
      ? `/combos?id=${product.id}`
      : `/product/${product.id}`;

  const img = studio((hover && product.images[1]) || product.images[0]);
  const liked = isInWishlist(product.id);

  return (
    <div className="group relative min-w-0" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link to={to} className="block">
        <div className="relative aspect-[3/4] bg-paper overflow-hidden">
          {img && (
            <img
              src={small(img)}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}

          {canQuickAdd && (
            <>
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
                className="hidden md:block absolute inset-x-2 bottom-2 z-10 bg-[#fff]/95 backdrop-blur text-ink py-3 text-[13px] font-medium opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus:opacity-100 transition-all duration-300 hover:bg-ink hover:text-[#fff]"
              >
                Quick view
              </button>
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); openQuickView(product); }}
                aria-label={`Quick view ${product.name}`}
                className="md:hidden absolute right-2 bottom-2 z-10 w-9 h-9 rounded-full bg-[#fff]/95 backdrop-blur text-ink flex items-center justify-center"
              >
                <Plus size={17} strokeWidth={1.6} />
              </button>
            </>
          )}

          {product.status === 'Coming Soon' && (
            <span className="absolute bottom-2 left-2 bg-ink text-[#fff] font-mono text-[10px] px-1.5 py-0.5">
              Coming soon
            </span>
          )}
        </div>

        <div className="pt-3 pr-8">
          <h3 className="text-sm md:text-[15px] font-medium leading-snug truncate">{product.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{label ?? product.category}</p>
          <p className="text-sm font-semibold mt-1.5">₹{product.price.toLocaleString()}</p>
        </div>
      </Link>

      <button
        onClick={() => toggleWishlist(product)}
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute bottom-0 right-0 p-1.5 hover:scale-110 transition-transform"
      >
        <Heart size={18} strokeWidth={1.6} className={liked ? 'fill-current' : ''} />
      </button>
    </div>
  );
};

export default ProductCard;
