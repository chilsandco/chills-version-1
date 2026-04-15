import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group relative block overflow-hidden bg-neutral-950">
      <div className="aspect-[3/4] overflow-hidden relative">
        <motion.img
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-1000" />
      </div>

      <div className="p-8 flex justify-between items-start bg-black border-t border-white/5">
        <div>
          <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-2 group-hover:text-accent transition-colors duration-500">{product.name}</h3>
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">{product.category}</p>
        </div>
        <p className="text-[11px] font-mono opacity-40 group-hover:opacity-100 transition-opacity duration-500">₹{product.price.toLocaleString()}</p>
      </div>

      {product.status === "Coming Soon" && (
        <div className="absolute top-6 left-6 bg-white text-black text-[9px] font-bold px-3 py-1.5 tracking-[0.2em] uppercase">
          Coming Soon
        </div>
      )}

      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors pointer-events-none" />
    </Link>
  );
};

export default ProductCard;
