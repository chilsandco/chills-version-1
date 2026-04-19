import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { CreditCard, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useGesture } from '@use-gesture/react';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Spring-based motion values for ultra-smooth transitions
  const scale = useSpring(1, { stiffness: 150, damping: 25 });
  const positionX = useSpring(0, { stiffness: 150, damping: 25 });
  const positionY = useSpring(0, { stiffness: 150, damping: 25 });

  const { addToCart, totalPrice } = useCart();
  const { triggerCheckout, isProcessing } = useCheckout();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => navigate('/collection'));
  }, [id, navigate]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  const handleBuyNow = async () => {
    if (!product) return;
    addToCart(product);
    const newTotal = totalPrice + product.price;
    await triggerCheckout(newTotal);
    navigate('/');
  };

  const handleZoomIn = () => scale.set(Math.min(scale.get() + 0.5, 4));
  const handleZoomOut = () => scale.set(Math.max(scale.get() - 0.5, 1));

  // Advanced Gesture Bindings
  const bind = (useGesture as any)(
    {
      onPinch: ({ offset: [d] }) => {
        const newScale = 1 + d / 150; 
        scale.set(Math.max(1, Math.min(newScale, 5)));
      },
      onDrag: ({ offset: [dx, dy] }) => {
        if (scale.get() > 1.01) {
          positionX.set(dx);
          positionY.set(dy);
        }
      },
      onDoubleClick: () => {
        if (scale.get() > 1) {
          scale.set(1);
          positionX.set(0);
          positionY.set(0);
        } else {
          scale.set(3);
        }
      }
    },
    {
      drag: { from: () => [positionX.get(), positionY.get()] }
    }
  );

  if (loading || !product) return <div className="h-screen flex items-center justify-center font-display tracking-widest text-neutral-500 uppercase text-xs">Awaiting Precision...</div>;

  return (
    <div className="pt-24 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Image Gallery */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.images.map((img, i) => (
            <motion.div 
              key={i} 
              className="aspect-[3/4] bg-neutral-900 overflow-hidden cursor-zoom-in"
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedImage(img);
                scale.set(1);
                positionX.set(0);
                positionY.set(0);
              }}
              data-cursor="inspect"
            >
              <motion.img
                src={img}
                alt={`${product.name} ${i + 1}`}
                className="w-full h-full object-cover origin-center transition-transform duration-700 hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
          <div className="mb-12">
            <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-4">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4 uppercase">{product.name}</h1>
            <p className="text-xl font-medium">₹{product.price.toLocaleString()}</p>
          </div>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-4">Concept</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{product.concept}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-4">Material</h3>
                <p className="text-neutral-400 text-sm">{product.material}</p>
              </div>
              <div>
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-4">Fit</h3>
                <p className="text-neutral-400 text-sm">{product.fit}</p>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-4">Care</h3>
              <p className="text-neutral-400 text-sm">{product.care}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {product.status === "Available" ? (
              <>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-white text-black py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent hover:text-black transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isProcessing}
                  className="w-full border border-neutral-800 py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="text-accent"
                      >
                        <CreditCard size={16} />
                      </motion.div>
                      Buy Now
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full border border-neutral-800 py-5 text-[11px] tracking-[0.3em] font-bold uppercase opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl touch-none"
            onClick={() => setSelectedImage(null)}
          >
            {/* Modal UI Controls */}
            <div 
              className="absolute top-8 right-8 flex gap-6 z-[110]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={handleZoomIn}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Zoom In"
              >
                <ZoomIn size={24} />
              </button>
              <button 
                onClick={handleZoomOut}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Zoom Out"
              >
                <ZoomOut size={24} />
              </button>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-white/60 hover:text-white transition-colors p-2 ml-4"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Instruction Overlay on mobile */}
            <div className="absolute top-8 left-8 hidden md:block text-[9px] tracking-[0.3em] text-white/30 uppercase pointer-events-none">
              Pinch to Zoom • Drag to Explore • Dbl Click to Reset
            </div>

            {/* Main Image Container */}
            <div 
              className="w-full h-full flex items-center justify-center p-12 overflow-hidden"
              {...(bind() as any)}
            >
              <motion.div
                className="relative max-w-full max-h-full flex items-center justify-center"
                style={{ scale, x: positionX, y: positionY }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  src={selectedImage}
                  alt="Full view"
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-12 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase pointer-events-none">
              {product.name} — Surface Inspection
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
