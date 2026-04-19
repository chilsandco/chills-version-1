import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { Trash2, Plus, Minus, CreditCard, User, Mail, Phone, MapPin, Building, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Checkout: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { triggerCheckout, isProcessing } = useCheckout();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ['firstName', 'email', 'phone', 'address', 'city', 'pincode'];
    const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const order = await triggerCheckout(formData, cart);
    if (order && order.id) {
      // Create a deterministic Signal ID for display (matches server logic)
      const numId = parseInt(order.id.replace(/\D/g, ''), 10) || 1234;
      const signalId = `CHLS-${(numId % 900000) + 100000}`;
      navigate(`/order-success/${order.id}?signal=${signalId}`);
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

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Form + Cart */}
        <div className="lg:col-span-7 space-y-16">
          {/* Shipping Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-3 bg-accent" />
              <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Shipping Transmission</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">First Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="Enter identifying name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-950 border border-neutral-900 py-3 px-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                  placeholder="System suffix"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Email Interface *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="communication@channel.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Mobile Link *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="+91 XXXX"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Physical Coordinates (Address) *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-neutral-700" size={14} />
                  <input
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="Enter full address for signal delivery"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Hub (City) *</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="Sector/City"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-950 border border-neutral-900 py-3 px-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                  placeholder="XXXXXX"
                />
              </div>
            </div>
          </section>

          {/* Cart Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-3 bg-accent" />
              <h2 className="text-[11px] tracking-[0.2em] font-bold uppercase">Signal Contents</h2>
            </div>
            
            <div className="space-y-8">
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
                      <button type="button" onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-accent hover:text-white transition-colors">
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
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} className="p-2 hover:bg-neutral-900 transition-colors text-accent">
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
                            <Minus size={12} />
                          </motion.div>
                        </button>
                        <span className="w-10 text-center text-xs font-mono">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)} className="p-2 hover:bg-neutral-900 transition-colors text-accent">
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
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-950 p-8 border border-neutral-900 sticky top-32">
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
              type="submit"
              disabled={isProcessing}
              className="w-full bg-white text-black py-5 text-[11px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Signal...' : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-accent"
                  >
                    <CreditCard size={16} />
                  </motion.div>
                  Initiate Extraction
                </>
              )}
            </button>

            <p className="mt-6 text-[9px] text-neutral-600 text-center uppercase tracking-widest leading-relaxed">
              Secure checkout powered by Razorpay.<br/>
              By proceeding, you agree to our terms of service.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
