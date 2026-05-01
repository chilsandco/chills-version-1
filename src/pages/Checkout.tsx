import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { useAuth } from '../AuthContext';
import { 
  Trash2, Plus, Minus, CreditCard, User, Mail, Phone, 
  MapPin, Building, Trash, Navigation, 
  Check, Settings, X, ChevronRight,
  GripVertical, Share2, Package
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface Address {
  id: string;
  label: string; // Home, Work, other
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const Checkout: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { triggerCheckout, isProcessing } = useCheckout();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form state
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

  const [addressFormData, setAddressFormData] = useState({
    label: '',
    type: 'other' as 'home' | 'work' | 'other',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Load addresses from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`chils_addresses_${user?.id || 'anon'}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAddresses(parsed);
        const def = parsed.find((a: Address) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
        else if (parsed.length > 0) setSelectedAddressId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse addresses", e);
      }
    }
  }, [user?.id]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || user.first_name || '',
        lastName: prev.lastName || user.lastName || user.last_name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Sync selected address to form data for final submission
  useEffect(() => {
    const selected = addresses.find(a => a.id === selectedAddressId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        address: selected.address,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode
      }));
    }
  }, [selectedAddressId, addresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveAddress = () => {
    if (!addressFormData.address || !addressFormData.city || !addressFormData.pincode) {
      alert("Please fill required address fields");
      return;
    }

    let newAddresses = [...addresses];
    const label = addressFormData.label || (addressFormData.type === 'home' ? 'Home' : addressFormData.type === 'work' ? 'Work' : 'Other');

    if (editingAddressId) {
      newAddresses = newAddresses.map(a => 
        a.id === editingAddressId ? { ...addressFormData, id: a.id, label, isDefault: a.isDefault } : a
      );
    } else {
      const newAddr: Address = {
        ...addressFormData,
        id: Math.random().toString(36).substr(2, 9),
        label,
        isDefault: addresses.length === 0
      };
      newAddresses.push(newAddr);
    }

    setAddresses(newAddresses);
    localStorage.setItem(`chils_addresses_${user?.id || 'anon'}`, JSON.stringify(newAddresses));
    
    // Auto-select if it's the only one
    if (newAddresses.length === 1) setSelectedAddressId(newAddresses[0].id);
    else if (!editingAddressId) setSelectedAddressId(newAddresses[newAddresses.length - 1].id);

    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressFormData({ label: '', type: 'other', address: '', city: '', state: '', pincode: '' });
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem(`chils_addresses_${user?.id || 'anon'}`, JSON.stringify(updated));
    if (selectedAddressId === id) setSelectedAddressId(updated[0]?.id || null);
  };

  const handleEditAddress = (addr: Address) => {
    setAddressFormData({
      label: addr.label,
      type: addr.type,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAddressId && addresses.length > 0) {
        alert("Please select a shipping address");
        return;
    }

    if (addresses.length === 0 && !showAddressForm) {
        setShowAddressForm(true);
        return;
    }

    // Basic validation
    const requiredFields = ['firstName', 'email', 'phone', 'address', 'city', 'pincode'];
    const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const order = await triggerCheckout(formData, cart);
    if (order && order.id) {
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
    <div className="pt-28 md:pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-5xl font-display font-bold tracking-tighter uppercase">Checkout</h1>
        {isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[12px] uppercase font-bold tracking-widest text-white/60">Session Active: {user?.username}</span>
            </div>
        )}
      </div>

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Form + Cart */}
        <div className="lg:col-span-7 space-y-16">
          
          {/* Identity Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-3 bg-accent" />
              <h2 className="text-[13px] tracking-[0.2em] font-bold uppercase">Identity Verification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-bold">First Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="Identifying name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-bold">Last Name</label>
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
                <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-bold">Email Interface *</label>
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
                <label className="text-[11px] text-neutral-500 uppercase tracking-widest block font-bold">Mobile Link *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                  <input
                    type="tel"
                    name="phone"
                    required
                    autoFocus={!!(formData.firstName && formData.lastName && formData.email)}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-900 py-3 pl-10 pr-4 text-xs focus:border-accent outline-none transition-colors font-mono"
                    placeholder="+91 XXXX"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-1 h-3 bg-accent" />
                <h2 className="text-[13px] tracking-[0.2em] font-bold uppercase">Signal Destination</h2>
              </div>
              {addresses.length > 0 && !showAddressForm && (
                <button 
                    type="button" 
                    onClick={() => { setShowAddressForm(true); setEditingAddressId(null); setAddressFormData({ label:'', type:'other', address:'', city:'', state:'', pincode:'' }); }}
                    className="text-[11px] uppercase tracking-widest font-bold text-accent hover:text-white transition-colors flex items-center gap-2"
                >
                    <Plus size={12} />
                    New Addr
                </button>
              )}
            </div>
            
            {/* Address List */}
            <AnimatePresence mode="wait">
                {!showAddressForm ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {addresses.map(addr => (
                            <div 
                                key={addr.id}
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`relative p-6 border transition-all cursor-pointer group ${selectedAddressId === addr.id ? 'border-accent bg-accent/5' : 'border-neutral-900 bg-neutral-950 hover:border-neutral-700'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedAddressId === addr.id ? 'bg-accent' : 'bg-neutral-800'}`} />
                                        <span className="text-[11px] uppercase font-bold tracking-widest text-neutral-400">{addr.label}</span>
                                        {addr.isDefault && <span className="text-[7px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded uppercase font-bold tracking-tighter text-neutral-600">Default</span>}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                            className="p-1 hover:text-accent transition-colors"
                                        >
                                            <Settings size={12} />
                                        </button>
                                        {!addr.isDefault && (
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                                className="p-1 hover:text-red-500 transition-colors"
                                            >
                                                <Trash size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs font-mono leading-relaxed mb-4 text-white/80">{addr.address}, {addr.city}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] uppercase tracking-widest text-neutral-600">{addr.state} • {addr.pincode}</p>
                                    {selectedAddressId === addr.id && <Check size={14} className="text-accent" />}
                                </div>
                            </div>
                        ))}
                        {addresses.length === 0 && (
                            <div 
                                onClick={() => setShowAddressForm(true)}
                                className="md:col-span-2 py-12 border-2 border-dashed border-neutral-900 hover:border-neutral-700 transition-colors flex flex-col items-center justify-center cursor-pointer group"
                            >
                                <MapPin className="text-neutral-800 group-hover:text-accent transition-colors mb-4" size={32} />
                                <p className="text-[13px] uppercase tracking-widest text-neutral-600 font-bold">No registered coordinates. Click to add.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-neutral-950 border border-neutral-900 p-8 space-y-8"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[13px] font-bold uppercase tracking-[0.2em]">{editingAddressId ? 'Edit Coordinate' : 'Register Coordinate'}</h3>
                            <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="text-neutral-500 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Protocol Label (Home/Work)</label>
                                    <div className="flex gap-2">
                                        {['home', 'work', 'other'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setAddressFormData(prev => ({ ...prev, type: t as any }))}
                                                className={`flex-1 py-2 text-[9px] uppercase font-bold tracking-widest border transition-all ${addressFormData.type === t ? 'bg-accent border-accent text-black' : 'bg-neutral-900 border-neutral-900 text-neutral-500 hover:border-neutral-800'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {addressFormData.type === 'other' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Custom Identification</label>
                                        <input
                                            type="text"
                                            name="label"
                                            value={addressFormData.label}
                                            onChange={handleAddressInputChange}
                                            placeholder="Hub Name"
                                            className="w-full bg-black border border-neutral-900 py-3 px-4 text-xs focus:border-accent outline-none font-mono"
                                        />
                                    </div>
                                )}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Physical Address* (Building, Street, Area)</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={addressFormData.address}
                                        onChange={handleAddressInputChange}
                                        className="w-full bg-black border border-neutral-900 py-3 px-4 text-xs focus:border-accent outline-none font-mono"
                                        placeholder="Enter full address details"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Sector/City*</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={addressFormData.city}
                                        onChange={handleAddressInputChange}
                                        className="w-full bg-black border border-neutral-900 py-3 px-4 text-xs focus:border-accent outline-none font-mono"
                                        placeholder="City name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Pincode*</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        required
                                        value={addressFormData.pincode}
                                        onChange={handleAddressInputChange}
                                        className="w-full bg-black border border-neutral-900 py-3 px-4 text-xs focus:border-accent outline-none font-mono"
                                        placeholder="6 digits code"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={saveAddress}
                                    className="flex-1 bg-white text-black py-4 text-[13px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors"
                                >
                                    Verify Coordinate
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                                    className="px-8 border border-neutral-900 py-4 text-[13px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </section>

          {/* Cart Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-3 bg-accent" />
              <h2 className="text-[13px] tracking-[0.2em] font-bold uppercase">Signal Contents</h2>
            </div>
            
            <div className="space-y-8">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 pb-8 border-b border-neutral-900">
                  <div className="w-24 h-32 bg-neutral-900 flex-shrink-0">
                    <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[13px] tracking-[0.1em] font-bold uppercase mb-1">{item.name}</h3>
                        <p className="text-[12px] text-neutral-500 uppercase mb-2">{item.category}</p>
                        {item.selectedSize && (
                          <p className="text-[12px] tracking-widest text-accent uppercase font-bold">Build: {item.selectedSize}</p>
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
            <h2 className="text-[13px] tracking-[0.2em] font-bold uppercase mb-8">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-accent uppercase tracking-widest text-[12px] font-bold">Complimentary delivery</span>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-neutral-900 font-bold">
                <span>Total Output Value</span>
                <span className="text-xl">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || (addresses.length === 0 && !showAddressForm)}
              className="w-full bg-white text-black py-5 text-[13px] tracking-[0.3em] font-bold uppercase hover:bg-accent transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? 'Confirming Signal...' : (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="text-accent"
                  >
                    <Share2 size={16} />
                  </motion.div>
                  Initiate Extraction Protocol
                </>
              )}
            </button>

            <p className="mt-6 text-[11px] text-neutral-600 text-center uppercase tracking-widest leading-relaxed">
              Secure checkout encrypted via system protocol.<br/>
              By proceeding, you authorize the physical manifestation of this signal.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
