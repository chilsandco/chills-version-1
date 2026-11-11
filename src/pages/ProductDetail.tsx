import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import ShareSignal from '../components/ShareSignal';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { BookOpen, Check, CreditCard, Droplets, Heart, Ruler, Shirt, Sparkles, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Star, MessageSquare, AlertCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { useGesture } from '@use-gesture/react';
import { Link } from 'react-router-dom';
import SizeGuide from '../components/SizeGuide';
import SEO from '../components/SEO';
import { useAuth } from '../AuthContext';
import { ProductReview } from '../types';
import { ModelFloor, isStanding } from '../components/ModelFloor';
import { applyStudio, isPoster } from '../data/studio';
import { productTone } from '../data/groups';
import { STORIES, keySpecs } from '../data/stories';
import TrilogyHint from '../components/TrilogyHint';
import { itemOf, track } from '../lib/track';
import cutouts from '../data/cutouts.json';


const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [colorError, setColorError] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  const availableSizes = React.useMemo(() => {
    if (!product) return [];
    if (product.availableSizes && product.availableSizes.length > 0) {
      const standardOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
      return [...product.availableSizes].sort((a, b) => {
        const indexA = standardOrder.indexOf(a.toUpperCase());
        const indexB = standardOrder.indexOf(b.toUpperCase());
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    if (product.variations && product.variations.length > 0) {
      const sizes = new Set<string>();
      product.variations.forEach(v => {
        if (v.attributes && v.attributes.size) {
          sizes.add(v.attributes.size);
        }
      });
      const standardOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
      return Array.from(sizes).sort((a, b) => {
        const indexA = standardOrder.indexOf(a.toUpperCase());
        const indexB = standardOrder.indexOf(b.toUpperCase());
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    return [];
  }, [product]);

  const isSelectedSizeOutOfStock = React.useMemo(() => {
    if (!product || !selectedSize) return false;
    if (product.variations) {
      const matchingVariations = product.variations.filter(v => {
        const matchesSize = v.attributes.size === selectedSize;
        const matchesColor = !v.attributes.color || !selectedColor || v.attributes.color === selectedColor;
        return matchesSize && matchesColor;
      });
      if (matchingVariations.length > 0) {
        return matchingVariations.every(v => {
          const hasNoQty = v.stockQuantity !== undefined && v.stockQuantity <= 0;
          const isOosStatus = v.stockStatus === 'outofstock';
          return v.manageStock ? hasNoQty : isOosStatus;
        });
      }
      return true;
    }
    return false;
  }, [product, selectedSize, selectedColor]);

  useEffect(() => {
    setLoading(true);
    // one brief API hiccup shouldn't throw a shopper back to the collection
    const loadProduct = (retries: number): Promise<any> =>
      fetch(`/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .catch(err => {
          if (retries <= 0) throw err;
          return new Promise(resolve => setTimeout(resolve, 700)).then(() => loadProduct(retries - 1));
        });

    loadProduct(2)
      .then(data => {
        setProduct(applyStudio(data));
        track('view_item', { currency: 'INR', value: data.price, items: [itemOf(data)] });
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

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsExpanded(false);
  }, [id]);

  useEffect(() => {
    if (product?.availableColors && product.availableColors.length > 0) {
      const parentImage = product.images?.[0];
      let initialColor = product.availableColors[0];

      if (parentImage && product.variations) {
        const getCleanFilename = (url: string) => {
          try {
            const decoded = decodeURIComponent(url);
            const lastSlash = decoded.lastIndexOf('/');
            if (lastSlash === -1) return decoded;
            return decoded.substring(lastSlash + 1).split('?')[0];
          } catch (e) {
            return url;
          }
        };

        const parentFilename = getCleanFilename(parentImage);
        
        // Find variation whose images contain a matching URL or matching filename
        const matchingVariation = product.variations.find(v => 
          v.images?.some((img: string) => 
            img === parentImage || getCleanFilename(img) === parentFilename
          )
        );
        
        if (matchingVariation && matchingVariation.attributes.color) {
          initialColor = matchingVariation.attributes.color;
        }
      }

      setSelectedColor(initialColor);
    } else {
      setSelectedColor(null);
    }
  }, [product]);

  useEffect(() => {
    if (!loading && searchParams.get('writeReview') === 'true') {
      setShowReviewModal(true);
      const timer = setTimeout(() => {
        scrollToReviews();
      }, 150);
      
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('writeReview');
      setSearchParams(newParams, { replace: true });
      
      return () => clearTimeout(timer);
    }
  }, [loading, searchParams, setSearchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data.map(applyStudio));
        }
      })
      .catch(err => console.error("Error fetching products catalog:", err));
  }, []);

  // Recommendation logic prioritizing same-category items, sorted by match percentage
  const recommendedProducts = React.useMemo(() => {
    if (!product || !allProducts.length) return [];
    
    // Filter out the current product and grouped products/combos
    const candidates = allProducts.filter(
      p => p.id.toString() !== product.id.toString() && 
           p.type !== 'grouped' && 
           p.category !== 'Combos' && 
           !(p.categories || []).includes('Combos')
    );
    
    // Group A: Same Category (Strict Matches)
    const groupA = candidates.filter(p => p.category === product.category);
    // Sort Group A: closest fit match and closest price difference
    groupA.sort((a, b) => {
      // 1. Fit matching (styling)
      const aFitMatch = a.fit && product.fit && a.fit.toLowerCase() === product.fit.toLowerCase() ? 1 : 0;
      const bFitMatch = b.fit && product.fit && b.fit.toLowerCase() === product.fit.toLowerCase() ? 1 : 0;
      if (aFitMatch !== bFitMatch) {
        return bFitMatch - aFitMatch; // Put fit matches first
      }
      
      // 2. Price proximity (closest price first)
      const aPriceDiff = Math.abs(a.price - product.price);
      const bPriceDiff = Math.abs(b.price - product.price);
      return aPriceDiff - bPriceDiff;
    });

    // Group B: Different Categories (Broader matches)
    const groupB = candidates.filter(p => p.category !== product.category);
    // Sort Group B broadly
    groupB.sort((a, b) => {
      const aCreatorMatch = product.coCreator && a.coCreator === product.coCreator ? 1 : 0;
      const bCreatorMatch = product.coCreator && b.coCreator === product.coCreator ? 1 : 0;
      if (aCreatorMatch !== bCreatorMatch) {
        return bCreatorMatch - aCreatorMatch;
      }
      return Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    });

    // Combine Group A and Group B
    const mapScored = (alt: Product) => {
      let score = 0;
      if (alt.category === product.category) score += 45;
      if (product.coCreator && alt.coCreator === product.coCreator) score += 25;
      
      const priceDiffRatio = Math.abs(alt.price - product.price) / product.price;
      if (priceDiffRatio <= 0.05) score += 20;
      else if (priceDiffRatio <= 0.15) score += 15;
      else if (priceDiffRatio <= 0.3) score += 10;
      
      if (alt.fit && product.fit && alt.fit.toLowerCase() === product.fit.toLowerCase()) score += 10;
      const telemetryMatch = Math.min(Math.max(Math.round(score + 50), 60), 99);
      
      return { product: alt, score: telemetryMatch };
    };

    return [...groupA.map(mapScored), ...groupB.map(mapScored)];
  }, [product, allProducts]);

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
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);
  const [mainButtonVisible, setMainButtonVisible] = useState(true);

  // the sticky mobile bar only appears once the main button has scrolled away
  useEffect(() => {
    const el = addToCartBtnRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setMainButtonVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [loading, product, isSelectedSizeOutOfStock]);

  // the photo showing on the details screen
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stageZoom, setStageZoom] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => { setCurrentImageIndex(0); setStageZoom(null); }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    if (isSelectedSizeOutOfStock) {
      return;
    }
    if (product.availableColors && product.availableColors.length > 1 && !selectedColor) {
      setColorError(true);
      return;
    }

    setButtonText("Adding...");
    setIsAddingToCart(true);
    addToCart(product, selectedSize, selectedColor);

    if (isInWishlist(product.id)) {
      toggleWishlist(product);
    }

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
        window.dispatchEvent(new CustomEvent('bag-open'));
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
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    if (isSelectedSizeOutOfStock) {
      return;
    }
    if (product.availableColors && product.availableColors.length > 1 && !selectedColor) {
      setColorError(true);
      return;
    }
    setIsBuyNowProcessing(true);
    
    // Check if the item (product + size + color) is already in the cart
    const isAlreadyInCart = cart.some(item => 
      item.id === product.id && 
      item.selectedSize === selectedSize && 
      (item.selectedColor || undefined) === (selectedColor || undefined)
    );
    
    if (!isAlreadyInCart) {
      addToCart(product, selectedSize, selectedColor);
    }
    
    if (isInWishlist(product.id)) {
      toggleWishlist(product);
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

  if (loading || !product) return <div className="h-screen flex items-center justify-center font-display tracking-widest text-neutral-500 uppercase text-xs">Loading…</div>;

  const productStory = product.shortDescription || product.concept || product.description;
  const productDetails = product.description || product.shortDescription || "";
  const storyParagraphs = productStory.split(/\n{2,}|\r\n{2,}/).map(line => line.trim())
    // short lines with no full stop are leftover headings from the product text
    .filter(line => line && (/[.!?”"]$/.test(line) || line.length > 60));
  const detailLines = productDetails.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const detailBullets = detailLines.filter(line => line.startsWith('-')).map(line => line.replace(/^-\s*/, ''));
  const detailParagraphs = detailLines.filter(line => !line.startsWith('-'));

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) : 0;

  // the model on stage follows the selected colour; a colour without a cut-out shows its photo
  const cut = (cutouts as Record<string, any>)[product.id];
  const multiColor = (product.availableColors?.length ?? 0) > 1;
  const colorCut = selectedColor ? cut?.colors?.[selectedColor] : undefined;
  const cutSrc: string | undefined = colorCut?.src ?? (multiColor ? undefined : cut?.src);
  const tagline = detailParagraphs[detailParagraphs.length - 1] || 'Essential by design.';
  const shortStory = STORIES[product.id] ?? storyParagraphs[0]?.split(/(?<=[.!?])\s/)[0] ?? 'Essential by design.';
  const specs = keySpecs(productDetails, product.fit);

  const displayImages = selectedColor && product.variations
    ? product.variations.find(v => v.attributes.color === selectedColor)?.images?.length 
      ? product.variations.find(v => v.attributes.color === selectedColor)!.images
      : product.images
    : product.images;

  // some colourways have a single photo, so the wall tops up from the product's own set
  const galleryImages = Array.from(new Set([...displayImages, ...(displayImages.length < 4 ? product.images : [])])).filter(img => !isPoster(img)).slice(0, 6);
  const heroSrc = cutSrc ?? displayImages[0];
  const heroIsCutout = !!cutSrc;
  const heroStands = heroIsCutout && (colorCut?.kind ?? cut?.kind) !== 'bust';
  const views = galleryImages.length ? galleryImages : [displayImages[0]];
  const stageIndex = Math.min(currentImageIndex, views.length - 1);
  const stageSrc = views[stageIndex];

  return (
    <div className="pt-16 md:pt-[72px] pb-20">
      <SEO 
        title={product.name}
        description={product.shortDescription || product.concept || `${product.name} by CHILS & CO. ₹${product.price}, delivered across India with 7-day returns.`}
        canonical={`https://chilsandco.com/product/${product.id}`}
        ogType="product"
        ogImage={product.images[0]}
        keywords={`${product.name.toLowerCase()}, ${(product.category || 't-shirt').toLowerCase()}, premium t-shirt india, chils and co`}
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

      {/* PHONE GALLERY: every photo, edge to edge, one swipe apart */}
      <section className="lg:hidden relative bg-[#e4e3df]">
        <div
          key={selectedColor ?? 'all'}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={e => { const el = e.currentTarget; setCurrentImageIndex(Math.round(el.scrollLeft / el.clientWidth)); }}
        >
          {views.map((src, i) => (
            <button key={src + i} type="button" aria-label={`Zoom photo ${i + 1} of ${product.name}`} onClick={() => { setSelectedImage(src); scale.set(1); positionX.set(0); positionY.set(0); }} className="snap-center shrink-0 w-full aspect-[4/5]">
              <img src={src} alt={product.name} loading={i === 0 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" draggable={false} className="w-full h-full object-cover object-top" />
            </button>
          ))}
        </div>
        {views.length > 1 && (
          <div className="absolute inset-x-0 bottom-7 flex justify-center gap-1.5 pointer-events-none">
            {views.map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === stageIndex ? 'bg-[#fff]' : 'bg-[#fff]/45'}`} />)}
          </div>
        )}
      </section>

      {/* STAGE */}
      <section style={{ backgroundColor: productTone(product) }} className="relative overflow-hidden text-ink max-lg:!bg-transparent">
        <div className="relative lg:h-[calc(100svh-72px)] lg:min-h-[660px] lg:max-h-[960px]">
          <nav className="hidden lg:flex lg:absolute z-20 top-0 left-0 px-5 lg:px-10 pt-4 lg:pt-6 text-xs text-ink/60 items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-ink">Home</Link><span>/</span>
            <Link to="/collection" className="hover:text-ink">Collection</Link><span>/</span>
            <span className="text-ink truncate">{product.name}</span>
          </nav>

          <motion.h1
            key={product.id}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block lg:absolute z-0 inset-x-0 top-[5%] text-center font-semibold leading-[.92] tracking-[-0.05em] whitespace-nowrap px-3 select-none"
            style={{ fontSize: `clamp(44px, ${Math.min(17, 155 / Math.max(product.name.length, 6)).toFixed(1)}vw, 300px)` }}
          >
            {product.name}
          </motion.h1>

          <button
            type="button"
            aria-label={`Zoom ${product.name}`}
            onClick={() => { setSelectedImage(displayImages[0]); scale.set(1); positionX.set(0); positionY.set(0); }}
            className={`hidden lg:flex lg:absolute z-10 inset-x-0 w-full items-end justify-center cursor-zoom-in ${heroStands ? 'lg:bottom-7 lg:h-[88%] pb-4 lg:pb-0' : 'lg:bottom-0 lg:h-[90%]'}`}
          >
            {heroStands && <span aria-hidden className="absolute bottom-2 lg:-bottom-2 left-1/2 -translate-x-1/2 w-[240px] lg:w-[340px] h-6 lg:h-8 rounded-[50%] bg-[radial-gradient(closest-side,rgba(20,18,12,.32),transparent)]" />}
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={heroSrc}
                src={heroSrc}
                alt={product.name}
                draggable={false}
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, y: 26, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative h-full w-auto max-w-none object-contain object-bottom ${heroIsCutout ? '' : 'mix-blend-multiply'}`}
              />
            </AnimatePresence>
          </button>

          <div className="hidden lg:block absolute z-20 left-10 bottom-10 w-[300px]">
            {product.coCreator && (
              <Link to={`/collection?creator=${encodeURIComponent(product.coCreator)}`} className="eyebrow text-ink/60 hover:text-ink block mb-3">Co-created by {product.coCreator}</Link>
            )}
            <p className="text-2xl font-semibold leading-tight">{tagline}</p>
            <p className="text-sm text-ink/60 mt-2">{product.category}</p>
          </div>

          {/* BUY */}
          <div className="relative lg:absolute z-20 lg:right-10 lg:bottom-8 lg:w-[350px] bg-[#fff] lg:bg-[#fff]/70 lg:backdrop-blur-xl px-5 py-6 lg:p-6 max-lg:rounded-t-2xl max-lg:-mt-4">
            <p className="lg:hidden text-xl font-semibold leading-tight">{product.name}</p>
            <p className="lg:hidden text-sm text-neutral-500 mt-1 mb-3">{tagline}</p>
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <p className="text-2xl font-semibold">₹{product.price.toLocaleString()}</p>
              <p className="mt-1 text-xs text-neutral-500">Delivery from ₹80 · 7-day returns</p>
              {totalReviews > 0 && (
                <button onClick={scrollToReviews} className="flex items-center gap-1 text-xs cursor-pointer"><Star size={13} className="fill-current" /> {averageRating.toFixed(1)}</button>
              )}
            </div>
          {/* Color */}
          {product.availableColors && product.availableColors.length > 1 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-[0.15em] uppercase font-semibold">
                  Colour <span className="font-normal text-neutral-500 normal-case tracking-normal ml-1">{hoveredColor || selectedColor}</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.availableColors.map(color => {
                  const variation = product.variations?.find(v => v.attributes.color === color);
                  const thumb = variation?.images?.[0];
                  const swatch = product.colorSwatches?.[color.toLowerCase()];
                  const active = selectedColor === color;
                  return (
                    <motion.button
                      key={color}
                      onMouseEnter={() => setHoveredColor(color)}
                      onMouseLeave={() => setHoveredColor(null)}
                      onClick={() => {
                        setSelectedColor(color);
                        setColorError(false);
                        setCurrentImageIndex(0);
                        if (selectedSize && product.variations) {
                          const ok = product.variations.some(v => {
                            const inStock = v.manageStock ? (v.stockQuantity !== undefined && v.stockQuantity > 0) : v.stockStatus !== 'outofstock';
                            return v.attributes.size === selectedSize && v.attributes.color === color && inStock;
                          });
                          if (!ok) setSelectedSize(null);
                        }
                      }}
                      animate={colorError ? { x: [-2, 2, -2, 2, 0] } : {}}
                      title={color}
                      aria-label={color}
                      aria-pressed={active}
                      className={`overflow-hidden transition-all cursor-pointer ${
                        swatch?.type === 'color' || swatch?.type === 'image' || thumb ? 'w-11 h-14' : 'px-4 h-11 text-sm'
                      } border ${active ? 'border-[#111] ring-1 ring-[#111]' : colorError ? 'border-red-500' : 'border-black/20 hover:border-black/60'}`}
                    >
                      {swatch?.type === 'image' ? (
                        <img src={swatch.value} alt={color} className="w-full h-full object-cover" />
                      ) : swatch?.type === 'color' ? (
                        <span className="block w-full h-full" style={{ backgroundColor: swatch.value }} />
                      ) : thumb ? (
                        <img src={thumb} alt={color} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        color
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {colorError && <p className="text-xs text-red-600 mt-2">Please choose a colour.</p>}
            </div>
          )}

          {/* Size */}
          {availableSizes.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs tracking-[0.15em] uppercase font-semibold">Size</h3>
                <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1.5 text-xs underline underline-offset-4 cursor-pointer">
                  <Ruler size={13} /> Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map(size => {
                  let oos = false;
                  if (product.variations) {
                    const matching = product.variations.filter(v =>
                      v.attributes.size === size && (!v.attributes.color || !selectedColor || v.attributes.color === selectedColor)
                    );
                    oos = matching.length === 0 || matching.every(v => (v.manageStock ? v.stockQuantity !== undefined && v.stockQuantity <= 0 : v.stockStatus === 'outofstock'));
                  }
                  const active = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      animate={sizeError ? { x: [-2, 2, -2, 2, 0] } : {}}
                      aria-pressed={active}
                      className={`relative min-w-[56px] h-12 px-3 text-sm border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#111] text-[#fff] border-[#111]'
                          : sizeError
                            ? 'border-red-500'
                            : oos
                              ? 'border-black/10 text-neutral-400'
                              : 'border-black/25 hover:border-[#111]'
                      }`}
                    >
                      <span className={oos && !active ? 'line-through' : ''}>{size}</span>
                    </motion.button>
                  );
                })}
              </div>
              {sizeError && <p className="text-xs text-red-600 mt-2">Please select a size.</p>}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2">
            {product.status === 'Available' ? (
              isSelectedSizeOutOfStock ? (
                <button disabled className="w-full border border-black/15 text-neutral-500 py-3.5 text-sm cursor-not-allowed">Size {selectedSize} is out of stock</button>
              ) : (
                <>
                  <motion.button
                    ref={addToCartBtnRef}
                    onClick={handleAddToCart}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-ink text-[#fff] py-3.5 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {buttonText === 'Add to Cart' ? 'Add to bag' : buttonText}
                  </motion.button>
                  <div className="flex gap-2">
                    <button onClick={handleBuyNow} disabled={isBuyNowProcessing} className="flex-1 border border-ink py-3 text-sm font-medium hover:bg-ink hover:text-[#fff] transition-colors disabled:opacity-50 cursor-pointer">
                      {isBuyNowProcessing ? 'Taking you to checkout…' : 'Buy now'}
                    </button>
                    <button onClick={() => toggleWishlist(product)} aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={isInWishlist(product.id)} className="w-12 border border-ink flex items-center justify-center hover:bg-ink hover:text-[#fff] transition-colors cursor-pointer">
                      <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                    </button>
                  </div>
                </>
              )
            ) : (
              <button disabled className="w-full border border-black/15 text-neutral-500 py-3.5 text-sm cursor-not-allowed">Coming soon</button>
            )}
          </div>
          <TrilogyHint ids={[product.id]} className="mt-3" />
          </div>
        </div>
      </section>

      {/* DETAILS: the photos, the story and the facts */}
      <section className="bg-paper text-ink">
        <div className="max-w-[1500px] mx-auto px-5 md:px-10 pt-10 pb-20 lg:pt-0 lg:pb-16 lg:h-[calc(100svh-72px)] lg:min-h-[640px] lg:max-h-[880px] grid lg:grid-cols-[auto_minmax(0,1fr)] gap-8 lg:gap-20 items-center">
          {views.length > 0 && (
            <div className="hidden lg:flex flex-row gap-3 lg:h-[84%] min-h-0">
              {views.length > 1 && (
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {views.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      aria-label={`View photo ${i + 1} of ${views.length}`}
                      aria-pressed={i === stageIndex}
                      onMouseEnter={() => setCurrentImageIndex(i)}
                      onFocus={() => setCurrentImageIndex(i)}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`shrink-0 w-12 h-16 lg:w-14 lg:h-[74px] overflow-hidden bg-paper transition-opacity cursor-pointer ${i === stageIndex ? 'opacity-100 ring-1 ring-[#fff] ring-offset-2 ring-offset-ink' : 'opacity-45 hover:opacity-100'}`}
                    >
                      <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                aria-label={`Zoom photo of ${product.name}`}
                onClick={() => { setSelectedImage(stageSrc); scale.set(1); positionX.set(0); positionY.set(0); }}
                onMouseMove={e => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setStageZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onMouseLeave={() => setStageZoom(null)}
                className="relative w-full lg:w-auto lg:h-full aspect-[3/4] overflow-hidden bg-paper cursor-zoom-in"
              >
                <AnimatePresence initial={false}>
                  <motion.img
                    key={stageSrc}
                    src={stageSrc}
                    alt={product.name}
                    draggable={false}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={stageZoom ? { scale: 2.1, transformOrigin: `${stageZoom.x}% ${stageZoom.y}%` } : undefined}
                  />
                </AnimatePresence>
              </button>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[28px] lg:text-[48px] leading-[1.08] font-semibold tracking-[-0.03em]">{shortStory}</p>
            {productStory.length > 120 && (
              <button onClick={() => setIsDescOpen(true)} className="mt-4 text-sm text-stone border-b border-black/20 pb-0.5 hover:text-ink hover:border-ink transition-colors cursor-pointer">Read the full story</button>
            )}
            <dl className="mt-8 lg:mt-12 pt-7 lg:pt-9 border-t border-black/10 grid grid-cols-2 gap-x-8 gap-y-7">
              {specs.map(spec => (
                <div key={spec.label}>
                  <dd className="text-[24px] lg:text-[34px] leading-none font-semibold tracking-[-0.025em]">{spec.value}</dd>
                  <dt className="text-sm text-stone mt-2">{spec.label}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-8 lg:mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone">
              {product.care && <span>{product.care}</span>}
              <Link to="/our-promise#second-life" className="underline underline-offset-4 hover:text-ink">Second Life packaging</Link>
              <Link to="/shipping-delivery" className="underline underline-offset-4 hover:text-ink">Shipping</Link>
              <Link to="/returns-refunds" className="underline underline-offset-4 hover:text-ink">Returns</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky buy bar */}
      <AnimatePresence>
        {product.status === 'Available' && !isSelectedSizeOutOfStock && !mainButtonVisible && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 inset-x-0 z-40 bg-[#fff]/95 backdrop-blur text-ink border-t border-black/10"
          >
            <div className="max-w-[1680px] mx-auto px-4 md:px-10 py-3 flex items-center gap-4">
              <div className="min-w-0 mr-auto">
                <p className="text-sm font-semibold truncate"><span className="hidden md:inline">{product.name} · </span>₹{product.price.toLocaleString()}</p>
                <p className="text-[11px] text-neutral-500 truncate">{selectedSize ? `Size ${selectedSize}` : 'Choose a size'}{selectedColor && (product.availableColors?.length ?? 0) > 1 ? ` · ${selectedColor}` : ''}</p>
              </div>
              <button
                onClick={() => {
                  if (availableSizes.length > 0 && !selectedSize) {
                    setSizeError(true);
                    addToCartBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else handleAddToCart();
                }}
                className="shrink-0 w-[46%] md:w-[280px] bg-ink text-[#fff] py-3.5 text-sm font-medium cursor-pointer"
              >
                {buttonText === 'Add to Cart' ? 'Add to bag' : buttonText}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Reviews & Ratings Section */}
      <div id="reviews-section" className="max-w-[1680px] mx-auto px-5 md:px-10 py-8 md:py-12">
        {!reviewsLoading && reviews.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-ink">
            <p className="text-sm text-stone">Bought this one? Tell others how it fits.</p>
            <div className="flex items-center gap-5">
              <button onClick={() => setShowReviewModal(true)} className="text-sm border-b border-ink pb-0.5 cursor-pointer">Write a review</button>
              <div className="w-[170px]"><ShareSignal productName={product.name} productUrl={window.location.href} productImage={product.images[0]} /></div>
            </div>
          </div>
        ) : (
        <>
        <h2 className="text-2xl md:text-4xl font-semibold mb-8 md:mb-10">Reviews</h2>
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
                Based on {totalReviews} verified review{totalReviews !== 1 ? 's' : ''}
              </p>

              {/* Star Breakdown Bars */}
              <div className="space-y-2 mb-6">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter(r => r.rating === stars).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="w-12 text-neutral-500">{stars} star</span>
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
                Write a review
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
                  Loading reviews…
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
                            Verified
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
                            {new Date(rev.date_created).toLocaleDateString('en-US', {
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
        </>
        )}
      </div>

      {/* You may also like */}
      {recommendedProducts.length > 0 && (
        <div className="pt-4 md:pt-8">
          <div className="flex items-end justify-between gap-4 mb-2 px-5 md:px-10 max-w-[1680px] mx-auto">
            <h2 className="text-2xl md:text-4xl font-semibold">You may also like</h2>
            {recommendedProducts.length > 4 && (
              <button onClick={() => setIsExpanded(e => !e)} className="text-sm underline underline-offset-4 cursor-pointer">
                {isExpanded ? 'Show less' : 'View more'}
              </button>
            )}
          </div>
          <ModelFloor
            products={[...recommendedProducts.map(r => r.product)].sort((a, b) => Number(isStanding(b)) - Number(isStanding(a))).slice(0, isExpanded ? 10 : 4)}
            spreads={false}
          />
        </div>
      )}

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
                  Write a review
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
                      REVIEW SUBMITTED SUCCESSFULLY
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                      Your review has been recorded and embedded in the database. Thank you for your feedback!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                          Your Name / Pseudonym (Client Signature)
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
                          Your Email (Secure & Unpublished)
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
                        Product Rating (1-5 Stars)
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
                        Your Review / Feedback (Transmission Details)
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell others about the fit, the fabric and how you wear itment aesthetics..."
                        className="w-full bg-black border border-neutral-800 focus:border-accent px-4 py-3 text-xs text-white focus:outline-none transition-colors rounded-[1px] resize-none font-light leading-relaxed tracking-wide"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full bg-white text-black hover:bg-neutral-200 py-4 text-[11px] tracking-[0.3em] font-bold uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer rounded-[1px]"
                    >
                      {submitLoading ? "Sending…" : "Submit review"}
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
                  <p className="text-accent">Chils & Co.</p>
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
