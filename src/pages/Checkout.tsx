import React from 'react';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Checkout: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { triggerCheckout, isProcessing } = useCheckout();
  const navigate = useNavigate();

  const handlePayment = async () => {
    const success = await triggerCheckout();
    if (success) {
      const orderId = `SGL-${Math.floor(100000 + Math.random() * 900000)}`;
      navigate(`/order-success/${orderId}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-display font-bold mb-8 uppercase tracking-tighter">Your cart is empty</h1>
        <Link to="/collection" className="bg-white text-black px-12 py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen">
      <h1 className="text-5xl font-display font-bold tracking-tighter mb-16 uppercase">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-7 space-y-8">
          {cart.map(item => (
            <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 pb-8 border-b border-neutral-900">
              <div className="w-24 h-32 bg-neutral-900 flex-shrink-0">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[11px] tracking-[0.1em] font-bold uppercase mb-1">{item.name}</h3>
                    <p className="text-[10px] text-neutral-500 uppercase mb-2">{item.category}</p>
                    {item.selectedSize && (
                      <p className="text-[10px] tracking-widest text-accent uppercase font-bold">Build: {item.selectedSize}</p>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-accent hover:text-white transition-colors">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <Trash2 size={16} />
                    </motion.div>
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-neutral-800">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} className="p-2 hover:bg-neutral-900 transition-colors text-accent">
                      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                        <Minus size={12} />
                      </motion.div>
                    </button>
                    <span className="w-10 text-center text-xs font-mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)} className="p-2 hover:bg-neutral-900 transition-colors text-accent">
                      <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                        <Plus size={12} />
                      </motion.div>
                    </button>
                  </div>
                  <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-950 p-8 border border-neutral-900">
            <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase mb-8">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-accent uppercase tracking-widest text-[10px] font-bold">Free</span>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-neutral-900 font-bold">
                <span>Total</span>
                <span className="text-xl">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-white text-black py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
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
                  Proceed to Payment
                </>
              )}
            </button>

            <p className="mt-6 text-[9px] text-neutral-600 text-center uppercase tracking-widest leading-relaxed">
              Secure checkout powered by Razorpay.<br/>
              By proceeding, you agree to our terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
