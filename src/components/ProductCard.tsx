import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useWishlist } from '../WishlistContext';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 1500);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, product.images.length]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative block overflow-hidden bg-neutral-950 perspective-1000 transition-shadow duration-500"
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block"
        data-cursor="inspect"
      >
        <div className="aspect-[3/4] overflow-hidden relative" style={{ transform: "translateZ(50px)" }}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 active:scale-95 group/heart"
          >
            <Heart 
              size={14} 
              strokeWidth={2}
              className={`transition-colors duration-300 ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'text-white'}`}
            />
          </button>
          
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.1, y: 10 }}
              animate={{ opacity: 1, scale: 1.05, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: -10 }}
              transition={{ 
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
              }}
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-1000" />
          
          {/* Progress Indicators */}
          {product.images.length > 1 && isHovered && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {product.images.map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`h-[1px] transition-all duration-500 ${i === currentImageIndex ? 'w-6 bg-accent' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-8 flex justify-between items-start bg-black border-t border-white/5 relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div>
            <h3 className="text-[13px] tracking-[0.2em] font-bold uppercase mb-2 group-hover:text-accent transition-colors duration-500">{product.name}</h3>
            <p className="text-[12px] text-neutral-600 uppercase tracking-widest">{product.category}</p>
          </div>
          <p className="text-[13px] font-mono opacity-40 group-hover:opacity-100 transition-opacity duration-500">₹{product.price.toLocaleString()}</p>
        </div>

        {product.status === "Coming Soon" && (
          <div className="absolute top-6 left-6 bg-white text-black text-[11px] font-bold px-3 py-1.5 tracking-[0.2em] uppercase z-30" style={{ transform: "translateZ(60px)" }}>
            Coming Soon
          </div>
        )}

        {product.totalSales !== undefined && product.totalSales > 0 && (
          <div className="absolute top-6 left-6 bg-accent text-black text-[9px] font-bold px-3 py-1 tracking-[0.3em] uppercase z-30 flex items-center gap-2" style={{ transform: "translateZ(60px)" }}>
            <span className="w-1 h-1 rounded-full bg-black animate-pulse" />
            Deployed: {product.totalSales}
          </div>
        )}

        <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors pointer-events-none z-40" />
      </Link>
    </motion.div>
  );
};

export default ProductCard;
