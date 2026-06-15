import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import ShareSignal from '../components/ShareSignal';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { BookOpen, Check, CreditCard, Droplets, Heart, Ruler, Shirt, Sparkles, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { useGesture } from '@use-gesture/react';
import { Link } from 'react-router-dom';
import SizeGuide from '../components/SizeGuide';
import SEO from '../components/SEO';
import { useAuth } from '../AuthContext';
import { ProductReview } from '../types';


interface MagnifiedImageCardProps {
  img: string;
  index: number;
  total: number;
  productName: string;
  onClick: () => void;
  productImgRef?: React.RefObject<HTMLImageElement | null>;
}

const MagnifiedImageCard: React.FC<MagnifiedImageCardProps> = ({
  img,
  index,
  total,
  productName,
  onClick,
  productImgRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hasHover, setHasHover] = useState(false);

  useEffect(() => {
    setHasHover(window.matchMedia('(hover: hover)').matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const getColSpan = (i: number, tot: number) => {
    if (tot <= 1) return "md:col-span-2";
    if (tot === 2) return "md:col-span-1";
    
    const layouts: string[] = [];
    let remaining = tot;
    let nextType = 'full';
    
    while (remaining > 0) {
      if (remaining === 1) {
        layouts.push('full');
        remaining -= 1;
      } else if (remaining === 2) {
        layouts.push('half', 'half');
        remaining -= 2;
      } else {
        if (nextType === 'full') {
          layouts.push('full');
          remaining -= 1;
          nextType = 'half';
        } else {
          layouts.push('half', 'half');
          remaining -= 2;
          nextType = 'full';
        }
      }
    }
    
    return layouts[i] === 'full' ? "md:col-span-2" : "md:col-span-1";
  };

  const zoomFactor = 2.2;
  const magnifierSize = 180; // 180px circular loupe

  const containerWidth = containerRef.current ? containerRef.current.clientWidth : 0;
  const containerHeight = containerRef.current ? containerRef.current.clientHeight : 0;
  
  const px = containerWidth > 0 ? mousePos.x / containerWidth : 0;
  const py = containerHeight > 0 ? mousePos.y / containerHeight : 0;

  const zoomX = -px * containerWidth * zoomFactor + magnifierSize / 2;
  const zoomY = -py * containerHeight * zoomFactor + magnifierSize / 2;

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative aspect-[3/4] bg-neutral-950 overflow-hidden border border-white/5 cursor-zoom-in ${getColSpan(index, total)}`}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      data-cursor="inspect"
    >
      <motion.img
        ref={productImgRef as any}
        src={img}
        alt={`${productName} ${index + 1}`}
        className="w-full h-full object-cover origin-center transition-transform duration-700"
        referrerPolicy="no-referrer"
      />

      {/* Futuristic Gold Scan HUD corners appearing on hover */}
      <div className={`absolute inset-0 border border-accent/20 transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Reticle corner markings */}
      <div className={`absolute top-3 left-3 w-3 h-3 border-t border-l border-accent/60 transition-all duration-500 pointer-events-none ${isHovered ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-2 -translate-y-2 opacity-0'}`} />
      <div className={`absolute top-3 right-3 w-3 h-3 border-t border-r border-accent/60 transition-all duration-500 pointer-events-none ${isHovered ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-2 -translate-y-2 opacity-0'}`} />
      <div className={`absolute bottom-3 left-3 w-3 h-3 border-b border-l border-accent/60 transition-all duration-500 pointer-events-none ${isHovered ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-2 translate-y-2 opacity-0'}`} />
      <div className={`absolute bottom-3 right-3 w-3 h-3 border-b border-r border-accent/60 transition-all duration-500 pointer-events-none ${isHovered ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-2 translate-y-2 opacity-0'}`} />

      {/* Detail Scan Loupe Overlay */}
      {isHovered && hasHover && containerWidth > 0 && (
        <div
          className="absolute rounded-full border border-accent bg-black pointer-events-none overflow-hidden shadow-[0_0_35px_rgba(212,175,55,0.25)]"
          style={{
            width: magnifierSize,
            height: magnifierSize,
            left: mousePos.x - magnifierSize / 2,
            top: mousePos.y - magnifierSize / 2,
            transform: 'translate3d(0, 0, 0)',
            zIndex: 10,
          }}
        >
          <img
            src={img}
            alt="Magnified View"
            className="absolute max-w-none origin-top-left pointer-events-none top-0 left-0"
            referrerPolicy="no-referrer"
            style={{
              width: containerWidth * zoomFactor,
              height: containerHeight * zoomFactor,
              transform: `translate3d(${zoomX}px, ${zoomY}px, 0)`,
            }}
          />

          {/* Micro HUD scanning grid inside loupe */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(212,175,55,0.3)_100%)]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(212, 175, 55, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(212, 175, 55, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '12px 12px',
            }}
          />
          
          {/* Lens center crosshair */}
          <div className="absolute w-2 h-2 flex items-center justify-center opacity-30">
            <div className="absolute w-[8px] h-[1px] bg-accent" />
            <div className="absolute h-[8px] w-[1px] bg-accent" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const sizeAdvisories: Record<string, { fit: string; chest: string; length: string; shoulder: string; note: string }> = {
  S: { fit: 'Slim fit', chest: '38.5"', length: '28"', shoulder: '16.25"', note: 'Ideal for a structured, close-to-body silhouette. If you prefer a dropped shoulder look, consider M.' },
  M: { fit: 'Standard fit', chest: '40.5"', length: '28.5"', shoulder: '16.75"', note: 'The standard system design. Balanced torso drape and structured shoulder line.' },
  L: { fit: 'Relaxed fit', chest: '42.5"', length: '29"', shoulder: '17.25"', note: 'Oversized aesthetic. Features dropped shoulders, a wider chest, and a longer hem drop.' },
  XL: { fit: 'Loose fit', chest: '45.5"', length: '29.5"', shoulder: '17.75"', note: 'Highly relaxed torso line for an ultra-oversized silhouette.' },
  '2XL': { fit: 'Extra relaxed', chest: '48.5"', length: '30"', shoulder: '18.25"', note: 'Maximum volume, room, and drape for an extremely relaxed profile.' }
};

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
  
  const { user, token } = useAuth();
  
  // Reviews and ratings state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      
      if (selectedImages.length + files.length > 3) {
        setSubmitError("Maximum of 3 images can be attached per review.");
        return;
      }
      
      files.forEach((file: File) => {
        if (file.size > 5 * 1024 * 1024) {
          setSubmitError(`Image ${file.name} exceeds the 5MB size limit.`);
          return;
        }
        
        if (!file.type.startsWith("image/")) {
          setSubmitError("Only image files are allowed.");
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSelectedImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Prepopulate review form if user profile changes
  useEffect(() => {
    if (user) {
      const name = user.pseudoName || `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || user.username || "";
      setReviewerName(name);
      setReviewerEmail(user.email || "");
    } else {
      setReviewerName("");
      setReviewerEmail("");
    }
  }, [user]);

  // Spring-based motion values for ultra-smooth transitions
  const scale = useSpring(1, { stiffness: 150, damping: 25 });
  const positionX = useSpring(0, { stiffness: 150, damping: 25 });
  const positionY = useSpring(0, { stiffness: 150, damping: 25 });

  const { cart, addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
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

    setReviewsLoading(true);
    fetch(`/api/products/${id}/reviews`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setReviews(data);
        setReviewsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reviews:", err);
        setReviewsLoading(false);
      });
  }, [id, navigate]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !reviewText.trim() || !reviewerName.trim() || !reviewerEmail.trim()) {
      setSubmitError("All fields are required");
      return;
    }
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reviewer: reviewerName,
          reviewer_email: reviewerEmail,
          review: reviewText,
          rating,
          images: selectedImages
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }
      
      setReviews(prev => [data, ...prev]);
      setSubmitSuccess(true);
      setReviewText("");
      setSelectedImages([]);
      if (!user) {
        setReviewerName("");
        setReviewerEmail("");
      }
      setRating(5);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReviewModal(false);
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const scrollToReviews = () => {
    const element = document.getElementById('reviews-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedImage || isDescOpen || showReviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, isDescOpen, showReviewModal]);


  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBuyNowProcessing, setIsBuyNowProcessing] = useState(false);
  const [buttonText, setButtonText] = useState("Add to Cart");
  const productImgRef = useRef<HTMLImageElement>(null);
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Swipe gesture tracking for mobile image carousel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => (prev + 1) % (product?.images?.length || 1));
    } else if (isRightSwipe) {
      setCurrentImageIndex((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (product?.images?.length || 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    setButtonText("Adding...");
    setIsAddingToCart(true);
    addToCart(product, selectedSize);

    const cartIcon = document.getElementById('cart-icon');
    const addToCartBtn = addToCartBtnRef.current;

    // Fallback if elements not found
    const fallback = () => {
      setIsAddingToCart(false);
      setButtonText("Added ✓");
      setShowConfirmation(true);
      setTimeout(() => {
        setButtonText("Add to Cart");
        setShowConfirmation(false);
      }, 3000);
    };

    if (!cartIcon || !addToCartBtn) {
      console.warn('[Chils] fly-to-cart: missing element', { cartIcon, addToCartBtn });
      fallback();
      return;
    }

    const btnRect = addToCartBtn.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const startX = btnRect.left + btnRect.width / 2;
    const startY = btnRect.top + btnRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    // Inject keyframes once
    const styleId = 'fly-to-cart-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        @keyframes sparkle {
          0%   { transform: scale(0) rotate(0deg);   opacity: 1; }
          50%  { transform: scale(1) rotate(180deg); opacity: 0.8; }
          100% { transform: scale(0.5) rotate(360deg); opacity: 0; }
        }
        @keyframes trailFade {
          0%   { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0;   transform: scale(0.3); }
        }
        @keyframes cartGoldPulse {
          0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.7); }
          50%  { box-shadow: 0 0 20px 10px rgba(212,175,55,0.4); }
          100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Gold sparkle burst at click target (Add to Cart button)
    for (let i = 0; i < 10; i++) {
      const spark = document.createElement('div');
      const angle = (i / 10) * 360;
      const dist = 15 + Math.random() * 35;
      const dx = Math.cos((angle * Math.PI) / 180) * dist;
      const dy = Math.sin((angle * Math.PI) / 180) * dist;
      const size = 4 + Math.random() * 5;
      spark.style.cssText = `
        position: fixed;
        left: ${startX - size / 2 + dx}px;
        top: ${startY - size / 2 + dy}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #d4af37, #fff8dc);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        animation: sparkle ${0.4 + Math.random() * 0.3}s ease-out forwards;
      `;
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 800);
    }

    // Thumbnail that flies to cart via JS-driven bezier arc
    const thumbSize = 80;
    const thumb = document.createElement('div');
    thumb.style.cssText = `
      position: fixed;
      left: ${startX - thumbSize / 2}px;
      top: ${startY - thumbSize / 2}px;
      width: ${thumbSize}px;
      height: ${thumbSize}px;
      border-radius: 8px;
      overflow: hidden;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 0 25px 8px rgba(212,175,55,0.6);
    `;
    const thumbImg = document.createElement('img');
    thumbImg.src = product.images[0];
    thumbImg.referrerPolicy = 'no-referrer';
    thumbImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    thumb.appendChild(thumbImg);
    document.body.appendChild(thumb);

    const duration = 850; // Slightly longer for the scale-up/scale-down drama
    const startTime = performance.now();
    // Arc control point peaks above both elements
    const cpX = (startX + endX) / 2;
    const cpY = Math.min(startY, endY) - 180; // High arc

    const animateFrame = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      // Ease out cubic / smooth curve
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Quadratic bezier calculation
      const bx = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * cpX + ease * ease * endX;
      const by = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * cpY + ease * ease * endY;

      // Premium scaling curve: starts small (0.2), scales up to 1.1 near mid-flight, shrinks to 0.2 at landing
      const scaleVal = ease < 0.5 
        ? 0.2 + (1.1 - 0.2) * (ease / 0.5) 
        : 1.1 - (1.1 - 0.2) * ((ease - 0.5) / 0.5);

      const currentSize = thumbSize * scaleVal;
      thumb.style.left = `${bx - currentSize / 2}px`;
      thumb.style.top  = `${by - currentSize / 2}px`;
      thumb.style.width  = `${currentSize}px`;
      thumb.style.height = `${currentSize}px`;
      thumb.style.opacity = `${1 - ease * 0.25}`;
      thumb.style.transform = `rotate(${ease * 360}deg)`; // Dynamic spin

      // Trail dots
      if (t > 0.03 && t < 0.95 && Math.random() > 0.45) {
        const trail = document.createElement('div');
        const ts = currentSize * 0.4;
        trail.style.cssText = `
          position:fixed;left:${bx - ts / 2}px;top:${by - ts / 2}px;
          width:${ts}px;height:${ts}px;border-radius:50%;pointer-events:none;z-index:9998;
          background:radial-gradient(circle,rgba(212,175,55,0.6),rgba(212,175,55,0) 70%);
          animation:trailFade 0.4s ease-out forwards;
        `;
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 450);
      }

      if (t < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        thumb.remove();
        window.dispatchEvent(new CustomEvent('pulse-cart'));
        cartIcon.style.animation = 'cartGoldPulse 0.6s ease-out';
        setTimeout(() => { cartIcon.style.animation = ''; }, 700);
        setIsAddingToCart(false);
        setButtonText("Added ✓");
        setShowConfirmation(true);
        setTimeout(() => {
          setButtonText("Add to Cart");
          setShowConfirmation(false);
        }, 3000);
      }
    };

    requestAnimationFrame(animateFrame);
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

  const productStory = product.shortDescription || product.concept || product.description;
  const productDetails = product.description || product.shortDescription || "";
  const storyParagraphs = productStory.split(/\n{2,}|\r\n{2,}/).map(line => line.trim()).filter(Boolean);
  const detailLines = productDetails.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const detailBullets = detailLines.filter(line => line.startsWith('-')).map(line => line.replace(/^-\s*/, ''));
  const detailParagraphs = detailLines.filter(line => !line.startsWith('-'));

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) : 0;

  return (
    <div className="pt-24 sm:pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      <SEO 
        title={product.name}
        description={product.shortDescription || product.concept || "Chils & Co. delivers high-end bespoke garments and luxury ready-to-wear."}
        canonical={`https://chilsandco.com/product/${product.id}`}
        ogType="product"
        ogImage={product.images[0]}
        keywords={`${product.name.toLowerCase()}, luxury clothing, bespoke garments, chils and co product`}
        schema={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.images,
          "description": product.description || product.shortDescription,
          "brand": {
            "@type": "Brand",
            "name": "CHILS & CO."
          },
          "offers": {
            "@type": "Offer",
            "url": `https://chilsandco.com/product/${product.id}`,
            "priceCurrency": "INR",
            "price": product.price.toString(),
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.status === "Available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          },
          ...(totalReviews > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": averageRating.toFixed(1),
              "reviewCount": totalReviews.toString(),
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": reviews.map(r => ({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": r.reviewer
              },
              "datePublished": r.date_created.split('T')[0],
              "reviewBody": r.review,
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": r.rating.toString(),
                "bestRating": "5",
                "worstRating": "1"
              }
            }))
          } : {})
        }}
      />

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
        {/* Desktop Image Gallery (Hidden on Mobile) */}
        <div className="hidden lg:grid lg:col-span-7 grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {product.images.map((img, i) => (
            <MagnifiedImageCard
              key={i}
              img={img}
              index={i}
              total={product.images.length}
              productName={product.name}
              productImgRef={i === 0 ? productImgRef : undefined}
              onClick={() => {
                setSelectedImage(img);
                scale.set(1);
                positionX.set(0);
                positionY.set(0);
              }}
            />
          ))}
        </div>

        {/* Mobile Image Carousel (Hidden on Desktop) */}
        <div 
          className="block lg:hidden lg:col-span-7 w-full relative mb-4"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative aspect-[3/4] w-full bg-neutral-950 overflow-hidden border border-white/5">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={`${product.name} mobile view ${currentImageIndex + 1}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  setSelectedImage(product.images[currentImageIndex]);
                  scale.set(1);
                  positionX.set(0);
                  positionY.set(0);
                }}
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Navigation Overlay */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-black/60 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md active:scale-95 cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-black/60 border border-white/10 text-white/70 hover:text-white transition-all backdrop-blur-md active:scale-95 cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight size={18} />
                </button>
                
                {/* Monospace HUD Counter indicator */}
                <div className="absolute bottom-4 left-4 z-10 bg-black/75 px-3 py-1.5 border border-white/5 text-[9px] tracking-[0.25em] font-mono text-accent/90 rounded-[2px] font-bold">
                  {String(currentImageIndex + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
                </div>

                {/* Progress dot indicators */}
                <div className="absolute bottom-5 right-4 z-10 flex gap-1.5">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${idx === currentImageIndex ? 'w-4 bg-accent' : 'w-1.5 bg-neutral-600'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="text-[12px] tracking-[0.3em] uppercase text-neutral-500">{product.category}</p>
              {product.coCreator && (
                <Link
                  to={`/collection?creator=${encodeURIComponent(product.coCreator)}`}
                  className="text-[9px] tracking-[0.25em] font-bold text-accent uppercase bg-accent/5 hover:bg-accent/15 px-3.5 py-1.5 border border-accent/20 hover:border-accent/50 rounded-[2px] backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-95"
                >
                  CO-CREATED BY {product.coCreator}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase">{product.name}</h1>
            </div>
            
            {/* Star Rating Summary */}
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={scrollToReviews}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer group"
              >
                <div className="flex items-center gap-0.5 text-accent">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={
                        star <= Math.round(averageRating)
                          ? "fill-accent stroke-accent"
                          : "text-neutral-800 stroke-neutral-700"
                      }
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 group-hover:text-accent transition-colors uppercase">
                  {totalReviews > 0 
                    ? `${averageRating.toFixed(1)} / 5.0 (${totalReviews} Transmission${totalReviews > 1 ? 's' : ''})`
                    : "0.0 / 5.0 (0 Transmissions)"
                  }
                </span>
              </button>
            </div>

            <p className="text-xl font-medium">₹{product.price.toLocaleString()}</p>
          </div>

          {/* Story Behind the Design (Moved Up) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative overflow-hidden border border-accent/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(255,255,255,0.025)_38%,rgba(0,0,0,0)_100%)] p-6 md:p-7 mb-8"
          >
            <div className="absolute left-0 top-0 h-full w-[2px] bg-accent" />
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-accent/30 bg-black/40 text-accent">
                  <BookOpen size={16} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-accent">Story Behind The Design</p>
              </div>
              <Sparkles size={15} className="text-accent/60" />
            </div>
            <div className="space-y-4">
              {storyParagraphs.slice(0, 2).map((paragraph, index) => (
                <p
                  key={index}
                  className={index === 0
                    ? "font-display text-xl leading-snug tracking-normal text-white md:text-2xl"
                    : "text-sm font-light leading-relaxed tracking-wide text-neutral-300"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {productStory.length > 260 && (
              <button
                onClick={() => setIsDescOpen(true)}
                className="group/btn mt-5 flex cursor-pointer items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-accent transition-colors hover:text-white"
              >
                <span className="h-3 w-1 bg-accent transition-colors group-hover/btn:bg-white" />
                Read Story And Details
              </button>
            )}
          </motion.div>

          {/* Size Selection Section (Moved Up) */}
          <div className="mb-8">
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
            <AnimatePresence mode="wait">
              {selectedSize ? (
                <motion.div
                  key={selectedSize}
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden mb-6"
                >
                  <div className="border border-accent/20 bg-neutral-950 p-4 rounded-sm relative mt-2">
                    {/* Corner technical accents */}
                    <div className="absolute top-0 left-0 w-2 h-[1px] bg-accent" />
                    <div className="absolute top-0 left-0 w-[1px] h-2 bg-accent" />
                    <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-accent" />
                    <div className="absolute bottom-0 right-0 w-[1px] h-2 bg-accent" />

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-mono tracking-[0.3em] text-accent uppercase font-bold">
                        Size Profile: {selectedSize}
                      </span>
                      <span className="text-[9px] font-mono tracking-[0.1em] text-white/50 uppercase px-2 py-0.5 border border-white/10 rounded-sm">
                        {sizeAdvisories[selectedSize].fit}
                      </span>
                    </div>

                    {/* Technical specifications grid */}
                    <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-3 mb-3 text-center">
                      <div>
                        <p className="text-[8px] tracking-[0.15em] text-neutral-500 uppercase font-bold mb-1">Chest</p>
                        <motion.p 
                          animate={{ opacity: [0.5, 1, 0.8, 1], textShadow: ["none", "0 0 8px rgba(212,175,55,0.4)", "none"] }}
                          transition={{ duration: 0.3 }}
                          className="font-mono text-sm text-white"
                        >
                          {sizeAdvisories[selectedSize].chest}
                        </motion.p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.15em] text-neutral-500 uppercase font-bold mb-1">Length</p>
                        <motion.p 
                          animate={{ opacity: [0.5, 1, 0.8, 1], textShadow: ["none", "0 0 8px rgba(212,175,55,0.4)", "none"] }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="font-mono text-sm text-white"
                        >
                          {sizeAdvisories[selectedSize].length}
                        </motion.p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.15em] text-neutral-500 uppercase font-bold mb-1">Shoulder</p>
                        <motion.p 
                          animate={{ opacity: [0.5, 1, 0.8, 1], textShadow: ["none", "0 0 8px rgba(212,175,55,0.4)", "none"] }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="font-mono text-sm text-white"
                        >
                          {sizeAdvisories[selectedSize].shoulder}
                        </motion.p>
                      </div>
                    </div>

                    {/* Fitting advisory note */}
                    <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                      {sizeAdvisories[selectedSize].note}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-4">
                  Model is 5'9" wearing size M for a standard fit.
                </p>
              )}
            </AnimatePresence>
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

          {/* Action Buttons: Add to Cart, Buy Now, Wishlist (Moved Up) */}
          <div className="flex flex-col gap-4 mb-10">
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
                  className="w-full bg-white text-black py-5 text-[13px] tracking-[0.3em] font-bold uppercase transition-all duration-300 border border-transparent active:opacity-90 cursor-pointer"
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
                  className="w-full border border-neutral-800 py-5 text-[13px] tracking-[0.3em] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
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
                  className="w-full flex items-center justify-center gap-3 py-3 text-[12px] tracking-[0.3em] font-bold uppercase text-neutral-500 hover:text-white transition-colors group cursor-pointer"
                >
                  <Heart 
                    size={16} 
                    className={`transition-all duration-500 ${isInWishlist(product.id) ? 'fill-accent text-accent' : 'group-hover:scale-110'}`} 
                  />
                  {isInWishlist(product.id) ? 'Saved' : 'Add to Wishlist'}
                </button>

                <div className="pt-4 mt-2 border-t border-neutral-900/50">
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

          {/* Details & Specs Container (Moved Below Actions) */}
          <div className="space-y-6 pt-6 border-t border-neutral-900/50">
            {/* Precision Metrics */}
            <div className="flex gap-12 py-4 border-b border-neutral-900/50">
              <div>
                <p className="text-[9px] tracking-[0.2em] font-bold uppercase text-neutral-500 mb-1">Signals Deployed</p>
                <p className="text-xl font-display font-bold tracking-tighter text-accent">
                  {product.totalSales || 0}
                </p>
              </div>
            </div>


            {/* Signal Protocol */}
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

            {/* Garment Intelligence */}
            <div className="py-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-900" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-500">Garment Intelligence</h3>
                <div className="h-px flex-1 bg-neutral-900" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Material", value: product.material, icon: Shirt },
                  { label: "Fit", value: product.fit, icon: Ruler },
                  { label: "Care", value: product.care, icon: Droplets }
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="border border-neutral-900 bg-neutral-950/70 p-4">
                    <Icon size={16} className="mb-4 text-accent" />
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600">{label}</p>
                    <p className="text-[12px] leading-relaxed text-neutral-300">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border border-neutral-900 bg-black p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">Product Details</h3>
                  <button
                    onClick={() => setIsDescOpen(true)}
                    className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
                  >
                    Full Intel
                  </button>
                </div>
                <div className="space-y-3 text-[12px] font-light leading-relaxed tracking-wide text-neutral-400">
                  {detailParagraphs.slice(0, 2).map((paragraph, index) => (
                    <p key={index} className="line-clamp-3">{paragraph}</p>
                  ))}
                </div>
                {detailBullets.length > 0 && (
                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {detailBullets.slice(0, 6).map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[11px] leading-relaxed text-neutral-400">
                        <Check size={12} className="mt-0.5 shrink-0 text-accent" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews & Ratings Section */}
      <div id="reviews-section" className="mt-24 pt-16 border-t border-neutral-900">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <h2 className="text-[12px] tracking-[0.4em] font-bold uppercase text-accent font-mono">
            TRANSMISSION REPORT // CLIENT FEEDBACK
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Rating Breakdown & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-[2px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-accent/40" />
              <div className="absolute top-0 left-0 w-[1px] h-2 bg-accent/40" />
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display font-bold tracking-tighter text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm font-mono text-neutral-500">/ 5.0</span>
              </div>

              <div className="flex items-center gap-0.5 text-accent mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= Math.round(averageRating)
                        ? "fill-accent stroke-accent"
                        : "text-neutral-900 stroke-neutral-800"
                    }
                  />
                ))}
              </div>

              <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-6">
                Based on {totalReviews} deployment{totalReviews !== 1 ? 's' : ''}
              </p>

              {/* Star Breakdown Bars */}
              <div className="space-y-2 mb-6">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter(r => r.rating === stars).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="w-12 text-neutral-500">{stars} STARS</span>
                      <div className="flex-1 h-1 bg-neutral-900 overflow-hidden rounded-[1px]">
                        <div 
                          className="h-full bg-accent transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-neutral-400">{count}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full border border-accent/30 hover:border-accent bg-accent/5 hover:bg-accent/10 py-4 text-[11px] tracking-[0.25em] font-bold uppercase text-accent hover:text-white transition-all duration-300 rounded-[1px] cursor-pointer"
              >
                TRANSMIT SIGNAL
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8">
            <div className="border border-neutral-900 bg-neutral-950/20 p-6 rounded-[2px] relative min-h-[300px]">
              <div className="absolute top-0 right-0 w-2 h-[1px] bg-neutral-800" />
              <div className="absolute top-0 right-0 w-[1px] h-2 bg-neutral-800" />

              {reviewsLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
                  <div className="w-6 h-6 border border-accent border-t-transparent rounded-full animate-spin mb-4" />
                  DECODING SECURE FEEDBACK...
                </div>
              ) : reviews.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-mono tracking-[0.2em] text-neutral-600 uppercase text-center p-6">
                  <MessageSquare size={20} className="text-neutral-800 mb-3" />
                  NO DEPLOYED SIGNALS FOUND FOR THIS CO-CREATION.
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="py-6 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white font-mono">
                            {rev.reviewer}
                          </span>
                          <span className="text-[8px] font-mono tracking-widest text-accent bg-accent/5 px-2 py-0.5 border border-accent/20 rounded-[1px] uppercase">
                            VERIFIED DEPLOYMENT
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-0.5 text-accent">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={10}
                                className={
                                  star <= rev.rating
                                    ? "fill-accent stroke-accent"
                                    : "text-neutral-950 stroke-neutral-900"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[9px] font-mono text-neutral-500">
                            DEPLOYED: {new Date(rev.date_created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }).replace(/\//g, '.')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-400 font-light tracking-wide whitespace-pre-line pl-1 border-l border-neutral-900">
                        {rev.review}
                      </p>
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-3 mt-3 mb-1 pl-1">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <div 
                              key={imgIdx} 
                              className="w-20 h-20 md:w-24 md:h-24 border border-white/5 bg-neutral-950 overflow-hidden cursor-zoom-in rounded-[1px] hover:border-accent/30 transition-colors"
                              onClick={() => {
                                setSelectedImage(imgUrl);
                                scale.set(1);
                                positionX.set(0);
                                positionY.set(0);
                              }}
                            >
                              <img src={imgUrl} alt="Customer Review attachment" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fade-in"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-neutral-950 border border-neutral-900 p-8 md:p-10 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <h2 className="text-[11px] tracking-[0.4em] font-bold uppercase text-accent font-mono">
                  TRANSMIT FEEDBACK SIGNAL
                </h2>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {submitError && (
                  <div className="border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-red-400 text-xs items-start rounded-[1px]">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-mono">{submitError}</p>
                  </div>
                )}

                {submitSuccess ? (
                  <div className="border border-accent/20 bg-accent/5 p-8 text-center space-y-3 rounded-[1px]">
                    <div className="w-10 h-10 border border-accent rounded-full flex items-center justify-center mx-auto text-accent mb-2 font-bold animate-pulse">
                      <Check size={20} />
                    </div>
                    <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white font-mono">
                      SIGNAL BROADCAST SUCCESSFUL
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                      Your transmission details have been recorded and embedded in the database.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                          Client Signature / Pseudonym
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!!user}
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="e.g. UDAY B."
                          className="w-full bg-black border border-neutral-800 focus:border-accent px-4 py-3 text-xs text-white focus:outline-none transition-colors rounded-[1px] disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                          Secure Email (Unpublished)
                        </label>
                        <input
                          type="email"
                          required
                          disabled={!!user}
                          value={reviewerEmail}
                          onChange={(e) => setReviewerEmail(e.target.value)}
                          placeholder="e.g. client@chilsandco.com"
                          className="w-full bg-black border border-neutral-800 focus:border-accent px-4 py-3 text-xs text-white focus:outline-none transition-colors rounded-[1px] disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        />
                      </div>
                    </div>

                    {/* Star Rating Select */}
                    <div>
                      <label className="block text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Signal Strength (Rating)
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-neutral-800 hover:text-accent focus:outline-none transition-colors cursor-pointer"
                          >
                            <Star
                              size={22}
                              className={
                                star <= rating
                                  ? "fill-accent stroke-accent"
                                  : "stroke-neutral-800"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload Input */}
                    <div>
                      <label className="block text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Attach Product Photos (Max 3, up to 5MB each)
                      </label>
                      
                      <div className="flex flex-wrap gap-3 mb-2">
                        {selectedImages.map((imgBase64, idx) => (
                          <div key={idx} className="relative w-16 h-16 border border-neutral-800 bg-neutral-900 overflow-hidden group rounded-[1px]">
                            <img src={imgBase64} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity duration-200 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        
                        {selectedImages.length < 3 && (
                          <label className="w-16 h-16 border border-dashed border-neutral-800 hover:border-accent/40 flex flex-col items-center justify-center text-neutral-500 hover:text-accent transition-colors cursor-pointer rounded-[1px]">
                            <span className="text-lg font-light">+</span>
                            <span className="text-[7px] tracking-tighter uppercase font-mono">Upload</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Review text */}
                    <div>
                      <label className="block text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Decoded Transmission / Feedback
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Detail the fabric drape, sizing precision, weave texture, or deployment aesthetics..."
                        className="w-full bg-black border border-neutral-800 focus:border-accent px-4 py-3 text-xs text-white focus:outline-none transition-colors rounded-[1px] resize-none font-light leading-relaxed tracking-wide"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full bg-white text-black hover:bg-neutral-200 py-4 text-[11px] tracking-[0.3em] font-bold uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer rounded-[1px]"
                    >
                      {submitLoading ? "TRANSMITTING SIGNAL..." : "BROADCAST TRANSMISSION"}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h2 className="text-[11px] tracking-[0.5em] font-bold uppercase text-accent">Story And Product Intelligence</h2>
              </div>
              
              <div className="mb-10 border-l border-accent/30 pl-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Story Behind The Design</p>
                <div className="space-y-4">
                  {storyParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-white text-lg md:text-xl font-light leading-relaxed tracking-tight">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Product Details</p>
                <div className="space-y-4 text-neutral-300 text-sm leading-relaxed tracking-wide whitespace-pre-line">
                  {productDetails}
                </div>
              </div>

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
