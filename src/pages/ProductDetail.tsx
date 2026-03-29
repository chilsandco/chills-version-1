import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
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

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Add to cart first
    addToCart(product);
    
    // Calculate new total (old total + this product's price)
    // We do this because the cart state update won't be reflected in the current render cycle
    const newTotal = totalPrice + product.price;
    
    // Trigger Razorpay
    await triggerCheckout(newTotal);
    
    // After successful payment, navigate to home or success page
    navigate('/');
  };

  if (loading || !product) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="pt-24 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Image Gallery */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.images.map((img, i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-900 overflow-hidden">
              <img
                src={img}
                alt={`${product.name} ${i + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
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
    </div>
  );
};

export default ProductDetail;
