import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import ShareSignal from '../components/ShareSignal';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { CreditCard, ZoomIn, ZoomOut, X, Heart, Ruler, ChevronLeft } from 'lucide-react';
import { useGesture } from '@use-gesture/react';
import { Link } from 'react-router-dom';
import SizeGuide from '../components/SizeGuide';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  
  // Spring-based motion values for ultra-smooth transitions
  const scale = useSpring(1, { stiffness: 150, damping: 25 });
  const positionX = useSpring(0, { stiffness: 150, damping: 25 });
  const positionY = useSpring(0, { stiffness: 150, damping: 25 });

  const { cart, addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
        
        // Update Metadata for Sharing
        const brandLine = "Not made for seasons. Made for reasons. — Chils & Co";
        document.title = `${data.name} | Chils & Co`;
        
        const metaTags = {
          'og:title': `${data.name} | Chils & Co`,
          'og:description': brandLine,
          'og:image': data.images[0],
          'og:url': window.location.href,
          'og:type': 'product',
          'twitter:card': 'summary_large_image',
          'twitter:title': data.name,
          'twitter:description': brandLine,
          'twitter:image': data.images[0],
        };

        Object.entries(metaTags).forEach(([property, content]) => {
          let element = document.querySelector(`meta[property="${property}"]`) || 
                        document.querySelector(`meta[name="${property}"]`);
          
          if (!element) {
            element = document.createElement('meta');
            if (property.startsWith('og:')) {
              element.setAttribute('property', property);
            } else {
              element.setAttribute('name', property);
            }
            document.head.appendChild(element);
          }
          element.setAttribute('content', content);
        });
      })
      .catch(() => navigate('/collection'));
  }, [id, navigate]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedImage || isDescOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, isDescOpen]);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBuyNowProcessing, setIsBuyNowProcessing] = useState(false);
  const [buttonText, setButtonText] = useState("Add to Cart");
  const productImgRef = useRef<HTMLImageElement>(null);
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      setSizeError(true);
      // Soft glow effect on size options is handled by sizeError state in render
      return;
    }

    setButtonText("Adding...");
    setIsAddingToCart(true);
    addToCart(product, selectedSize);
    
    const cartIcon = document.getElementById('cart-icon');
    const btn = addToCartBtnRef.current;
    
    if (cartIcon && btn) {
      const btnRect = btn.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();
      
      const emoji = document.createElement('div');
      emoji.innerText = '👕';
      emoji.style.position = 'fixed';
      emoji.style.left = `${btnRect.left + btnRect.width / 2 - 12}px`;
      emoji.style.top = `${btnRect.top}px`;
      emoji.style.fontSize = '24px';
      emoji.style.zIndex = '9999';
      emoji.style.pointerEvents = 'none';
      emoji.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      
      document.body.appendChild(emoji);
      
      // Force reflow
      emoji.getBoundingClientRect();
      
      // Animate to cart
      emoji.style.left = `${cartRect.left + 10}px`;
      emoji.style.top = `${cartRect.top + 10}px`;
      emoji.style.transform = 'scale(0.4) rotate(15deg)';
      emoji.style.opacity = '0.5';
      
      setTimeout(() => {
        document.body.removeChild(emoji);
        window.dispatchEvent(new CustomEvent('pulse-cart'));
        
        setIsAddingToCart(false);
        setButtonText("Added ✓");
        setShowConfirmation(true);
        
        setTimeout(() => {
          setButtonText("Add to Cart");
          setShowConfirmation(false);
        }, 3000);
      }, 600);
    } else {
      setIsAddingToCart(false);
      setButtonText("Added ✓");
      setShowConfirmation(true);
      setTimeout(() => {
        setButtonText("Add to Cart");
        setShowConfirmation(false);
      }, 3000);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setIsBuyNowProcessing(true);
    
    // Check if the item (product + size) is already in the cart
    const isAlreadyInCart = cart.some(item => item.id === product.id && item.selectedSize === selectedSize);
    
    if (!isAlreadyInCart) {
      addToCart(product, selectedSize);
    }
    
    // Instant redirect after a tiny delay for the text swap
    setTimeout(() => {
      navigate('/checkout');
    }, 300);
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
      {/* Navigation Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-12"
      >
        <Link 
          to="/collection" 
          className="group inline-flex items-center gap-3 text-[10px] tracking-[0.4em] font-bold uppercase text-neutral-500 hover:text-white transition-all duration-300"
        >
          <div className="w-8 h-[1px] bg-neutral-800 group-hover:w-12 group-hover:bg-accent transition-all duration-500" />
          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-500">
            <ChevronLeft size={12} className="group-hover:text-accent transition-colors" />
            Back to Collections
          </div>
        </Link>
      </motion.div>

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
                ref={i === 0 ? productImgRef : null}
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
            <p className="text-[12px] tracking-[0.3em] uppercase text-neutral-500 mb-4">{product.category}</p>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase">{product.name}</h1>
            </div>
            <p className="text-xl font-medium">₹{product.price.toLocaleString()}</p>
          </div>

          {/* Precision Metrics */}
          <div className="flex gap-12 mb-6 py-4 border-y border-neutral-900/50">
            <div>
              <p className="text-[9px] tracking-[0.2em] font-bold uppercase text-neutral-500 mb-1">Signals Deployed</p>
              <p className="text-xl font-display font-bold tracking-tighter text-accent">
                {product.totalSales || 0}
              </p>
            </div>
          </div>

          {/* Product Intel (Brief Description) */}
          <div className="mb-8">
            <div className="relative group">
              <p className="text-neutral-400 text-[12px] leading-relaxed tracking-wide font-light whitespace-pre-line border-l border-accent/20 pl-4 py-1 line-clamp-4">
                {product.description}
              </p>
              {product.description.length > 150 && (
                <button 
                  onClick={() => setIsDescOpen(true)}
                  className="mt-3 text-[9px] uppercase tracking-[0.3em] font-bold text-accent hover:text-white transition-colors cursor-pointer flex items-center gap-2 group/btn"
                >
                  <div className="w-1 h-3 bg-accent group-hover/btn:bg-white transition-colors" />
                  Read Full Intel
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-500">Choose Your Size</h3>
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-accent hover:text-accent/80 transition-colors cursor-pointer"
                >
                  <Ruler size={12} />
                  Size Guide
                </button>
              </div>
              <div className="flex gap-3 mb-4">
                {['S', 'M', 'L', 'XL', '2XL'].map(size => (
                  <motion.button 
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    animate={sizeError ? { x: [-2, 2, -2, 2, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-12 h-12 border flex items-center justify-center text-[11px] font-bold transition-all duration-300 cursor-pointer ${
                      selectedSize === size 
                        ? 'bg-white text-black border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                        : sizeError 
                          ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                          : 'border-neutral-800 hover:border-white'
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-4">
                Model is 5'9" wearing size M for a standard fit.
              </p>
              <AnimatePresence>
                {sizeError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    <p className="text-[12px] text-red-500 tracking-[0.3em] uppercase font-bold">
                      CAUTION: Select your size
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>



            <div className="py-6 border-b border-neutral-900/50">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <h3 className="text-[11px] tracking-[0.3em] font-bold uppercase mb-4 text-accent">Signal Protocol</h3>
                <div className="space-y-4 text-neutral-500 text-[12px] leading-relaxed tracking-wide font-light">
                  <p className="text-neutral-200">Each piece carries a coded message.</p>
                  <p>Your signal is not selected. It is assigned.</p>
                  <p>At dispatch, the system embeds a unique output into your garment. No two drops are identical.</p>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] pt-2 border-t border-neutral-900/10 inline-block">— Decoded on arrival.</p>
                </div>
              </motion.div>
            </div>

            <div className="py-6 space-y-6">
              <div>
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-2 text-neutral-500">Concept</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{product.concept}</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-2 text-neutral-500">Material</h3>
                  <p className="text-neutral-400 text-sm">{product.material}</p>
                </div>
                <div>
                  <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-2 text-neutral-500">Fit</h3>
                  <p className="text-neutral-400 text-sm">{product.fit}</p>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-2 text-neutral-500">Care</h3>
                <p className="text-neutral-400 text-sm">{product.care}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {product.status === "Available" ? (
              <>
                <motion.button
                  ref={addToCartBtnRef}
                  onClick={handleAddToCart}
                  whileHover={{ 
                    scale: 1.01,
                    boxShadow: "0 0 30px rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.6)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-black py-5 text-[13px] tracking-[0.3em] font-bold uppercase transition-all duration-300 border border-transparent active:opacity-90"
                >
                  {buttonText}
                </motion.button>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-center text-[11px] tracking-widest text-neutral-600 uppercase">
                    Signal assigned at dispatch
                  </p>
                  <AnimatePresence>
                    {showConfirmation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center text-[12px] tracking-widest text-accent uppercase font-bold"
                      >
                        Added to Cart ✓ <br/>
                        <span className="text-[10px] font-normal opacity-60">Signal assigned at dispatch</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
 
                <motion.button
                  onClick={handleBuyNow}
                  disabled={isBuyNowProcessing}
                  whileHover={{ 
                    scale: 1.01,
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "rgba(0, 0, 0, 1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border border-neutral-800 py-5 text-[13px] tracking-[0.3em] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isBuyNowProcessing ? 'Securing Checkout...' : (
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
                </motion.button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="w-full flex items-center justify-center gap-3 py-3 text-[12px] tracking-[0.3em] font-bold uppercase text-neutral-500 hover:text-white transition-colors group"
                >
                  <Heart 
                    size={16} 
                    className={`transition-all duration-500 ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'group-hover:scale-110'}`} 
                  />
                  {isInWishlist(product.id) ? 'Saved' : 'Add to Wishlist'}
                </button>

                <div className="pt-4 mt-4 border-t border-neutral-900/50">
                  <ShareSignal 
                    productName={product.name}
                    productUrl={window.location.href}
                    productImage={product.images[0]}
                  />
                </div>
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

      <SizeGuide 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />

      {/* Product Description Modal */}
      <AnimatePresence>
        {isDescOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
            onClick={() => setIsDescOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-neutral-950 border border-neutral-900 p-8 md:p-12 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <button 
                onClick={() => setIsDescOpen(false)}
                className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <h2 className="text-[11px] tracking-[0.5em] font-bold uppercase text-accent">Full Product Intelligence</h2>
              </div>
              
              <p className="text-white text-lg md:text-xl font-light leading-relaxed tracking-tight whitespace-pre-line mb-12">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-900 text-[10px] tracking-[0.2em] font-bold uppercase text-neutral-500">
                <div>
                  <p className="text-neutral-700 mb-1">Status</p>
                  <p className="text-accent">Authenticated Record</p>
                </div>
                <div>
                  <p className="text-neutral-700 mb-1">Index</p>
                  <p className="text-white">RECORD-{product.id.padStart(3, '0')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
