import React, { useState, useEffect } from 'react';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { useAuth } from '../AuthContext';
import { 
  Trash2, Plus, Minus, CreditCard, User, Mail, Phone, 
  MapPin, Building, Trash, Navigation, 
  Check, Settings, X, ChevronRight,
  GripVertical, Share2, Package, ShieldCheck as Shield,
  Lock, Info, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import CheckoutInterstitial from '../components/CheckoutInterstitial';
import SecondLifeModal from '../components/SecondLifeModal';
import PackagingUpsellBanner from '../components/PackagingUpsellBanner';

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

  // Total items in cart for packaging intelligence
  const totalItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const { triggerCheckout, isProcessing, error, setError } = useCheckout();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Second Life modal state — shown when 1 item in cart
  const [showSecondLifeModal, setShowSecondLifeModal] = useState(false);
  const [secondLifeDismissed, setSecondLifeDismissed] = useState(false);
  const [coordinatesFlash, setCoordinatesFlash] = useState(false);

  const dismissSecondLife = () => {
    setSecondLifeDismissed(true);
    setShowSecondLifeModal(false);
  };

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

  // Redirect to login if not authenticated (Guest checkout disabled)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Load addresses and persisted form info from local storage on mount
  useEffect(() => {
    const userSuffix = user?.id || 'anon';
    const stored = localStorage.getItem(`chils_addresses_${userSuffix}`);
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

    const storedForm = localStorage.getItem(`chils_checkout_form_${userSuffix}`);
    if (storedForm) {
      try {
        const parsed = JSON.parse(storedForm);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse persisted form", e);
      }
    }
  }, [user?.id]);

  // Persist form data changes
  useEffect(() => {
    const userSuffix = user?.id || 'anon';
    const timeout = setTimeout(() => {
      const { address, city, state, pincode, ...persistentInfo } = formData;
      localStorage.setItem(`chils_checkout_form_${userSuffix}`, JSON.stringify(persistentInfo));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData.firstName, formData.lastName, formData.email, formData.phone, user?.id]);

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

  // Core payment logic (extracted so modal can also trigger it)
  const proceedToPayment = async () => {
    await triggerCheckout(formData, cart);
    // triggerCheckout handles navigation logic via PhonePe redirect
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if coordinates (shipping address) are selected/filled
    if (!selectedAddressId) {
      // Flash the coordinates section to draw attention
      setCoordinatesFlash(true);
      setTimeout(() => setCoordinatesFlash(false), 2000);
      
      // Auto-open address form if they have no addresses registered
      if (addresses.length === 0 && !showAddressForm) {
        setShowAddressForm(true);
      }
      
      // Smooth scroll to the coordinates section
      const coordSection = document.getElementById('coordinates-section');
      if (coordSection) {
        coordSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for scroll and auto-focus coordinates field
        setTimeout(() => {
          if (showAddressForm || addresses.length === 0) {
            const firstInput = document.querySelector('input[name="address"]') || 
                               document.querySelector('input[name="city"]') ||
                               document.querySelector('input[name="pincode"]');
            if (firstInput) (firstInput as HTMLInputElement).focus();
          }
        }, 600);
      }
      return;
    }

    // Basic identity validation
    const requiredIdentityFields = ['firstName', 'email', 'phone'];
    const missingIdentityFields = requiredIdentityFields.filter(f => !formData[f as keyof typeof formData]);
    
    if (missingIdentityFields.length > 0) {
      // Smooth scroll back to identity section
      const identitySection = document.getElementById('identity-section');
      if (identitySection) {
        identitySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const emptyInput = identitySection.querySelector(`input[name="${missingIdentityFields[0]}"]`) as HTMLInputElement;
          if (emptyInput) emptyInput.focus();
        }, 600);
      }
      return;
    }

    // Second Life gate: force at least 2 items. Single items cannot checkout.
    if (totalItemCount < 2) {
      setShowSecondLifeModal(true);
      return;
    }

    await proceedToPayment();
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
    <div className="pt-36 md:pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen">
      <CheckoutInterstitial isVisible={isProcessing} message="Syncing with WooCommerce..." />

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-32 right-6 md:right-12 z-[110] w-full max-w-sm"
          >
            <div className="bg-neutral-950 border border-white/10 p-1 flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.15)]">
              <div className="bg-red-500/10 p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1">
                  <X className="text-red-500/20" size={128} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-red-500" size={16} />
                    <h3 className="text-white text-[12px] uppercase font-bold tracking-[0.2em]">Transmission Fault</h3>
                  </div>
                  
                  <p className="text-neutral-400 text-[11px] font-mono leading-relaxed mb-6 border-l border-red-500/50 pl-4 py-1">
                    {error}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setError(null)}
                      className="text-[10px] uppercase font-bold tracking-[0.2em] text-white hover:text-accent transition-colors"
                    >
                      Clear Log
                    </button>
                    <span className="text-[9px] font-mono text-neutral-600 uppercase">Err_Sig_404</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-16">
        <div>
          <span className="text-accent text-[10px] uppercase tracking-[0.4em] font-bold block mb-2 opacity-60">Phase: Finalization</span>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter uppercase">Checkout</h1>
        </div>
        
        {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-neutral-900/50 border border-white/5 rounded-sm backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">Authenticated: {user?.username}</span>
            </div>
        )}
      </div>

      <div className="mb-12 flex items-center gap-4 py-4 border-y border-neutral-900">
        <div className="flex items-center gap-2 text-accent">
          <Lock size={12} />
          <span className="text-[10px] uppercase font-bold tracking-widest">End-to-End Encrypted</span>
        </div>
        <div className="w-[1px] h-3 bg-neutral-800" />
        <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
          WooCommerce Secure Protocol v2.4
        </div>
      </div>

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
        {/* Left Column: Form + Cart */}
        <div className="lg:col-span-7 space-y-20">
          
          {/* Identity Section — Commanding Step Card */}
          {(() => {
            const identityComplete = !!(formData.firstName && formData.email && formData.phone);
            return (
              <section id="identity-section">
                {/* Step pill header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-mono text-xs font-black transition-all duration-500 ${
                    identityComplete
                      ? 'border-accent bg-accent/10 text-accent shadow-[0_0_14px_rgba(212,175,55,0.4)]'
                      : 'border-neutral-700 text-neutral-500'
                  }`}>01</div>
                  <div>
                    <p className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] font-bold">Step One</p>
                    <h2 className="text-sm tracking-[0.25em] font-bold uppercase text-white leading-none mt-0.5">Identity Access</h2>
                  </div>
                  <div className="flex-grow h-[1px] bg-neutral-900 mx-2" />
                  {identityComplete ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full"
                    >
                      <Check size={10} className="text-accent" />
                      <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-accent">Verified</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/60 border border-neutral-800 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
                      <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-neutral-500">Pending</span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className={`relative border transition-all duration-500 p-8 ${
                  identityComplete
                    ? 'border-accent/25 bg-[linear-gradient(135deg,rgba(212,175,55,0.04),rgba(0,0,0,0)_70%)] shadow-[0_0_40px_rgba(212,175,55,0.06)]'
                    : 'border-neutral-800 bg-neutral-950/60'
                }`}>
                  {/* Corner accents */}
                  <div className={`absolute top-0 left-0 w-5 h-5 border-t border-l transition-colors duration-500 ${identityComplete ? 'border-accent/50' : 'border-neutral-700'}`} />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 border-b border-r transition-colors duration-500 ${identityComplete ? 'border-accent/50' : 'border-neutral-700'}`} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-3 group">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">First Name *</label>
                      <div className="relative">
                        <User className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-accent transition-colors" size={13} />
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-neutral-800 py-3 pl-7 pr-4 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                          placeholder="REQUIRED"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-neutral-800 py-3 px-0 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                        placeholder="OPTIONAL"
                      />
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-accent transition-colors" size={13} />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-neutral-800 py-3 pl-7 pr-4 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                          placeholder="you@mail.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-accent transition-colors" size={13} />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-b border-neutral-800 py-3 pl-7 pr-4 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                          placeholder="+91 XXXXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* Step connector line */}
          <div className="flex items-center gap-4 my-2 ml-4">
            <div className="w-[1px] h-8 bg-gradient-to-b from-neutral-800 to-neutral-900" />
          </div>

          {/* Coordinates Section — Commanding Step Card */}
          {(() => {
            const coordComplete = !!selectedAddressId;
            return (
              <section
                id="coordinates-section"
                className={`transition-all duration-700 ${
                  coordinatesFlash ? 'coordinates-flash' : ''
                }`}
              >
                {/* Step pill header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-mono text-xs font-black transition-all duration-500 ${
                    coordComplete
                      ? 'border-accent bg-accent/10 text-accent shadow-[0_0_14px_rgba(212,175,55,0.4)]'
                      : coordinatesFlash
                        ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_14px_rgba(239,68,68,0.4)]'
                        : 'border-neutral-700 text-neutral-500'
                  }`}>02</div>
                  <div>
                    <p className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] font-bold">Step Two</p>
                    <h2 className="text-sm tracking-[0.25em] font-bold uppercase text-white leading-none mt-0.5">Delivery Address</h2>
                  </div>
                  <div className="flex-grow h-[1px] bg-neutral-900 mx-2" />
                  {coordComplete ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full"
                    >
                      <Check size={10} className="text-accent" />
                      <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-accent">Locked In</span>
                    </motion.div>
                  ) : (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full transition-all duration-500 ${
                      coordinatesFlash
                        ? 'bg-red-500/10 border-red-500/40'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        coordinatesFlash ? 'bg-red-500' : 'bg-neutral-600'
                      }`} />
                      <span className={`text-[9px] uppercase font-bold tracking-[0.15em] ${
                        coordinatesFlash ? 'text-red-400' : 'text-neutral-500'
                      }`}>
                        {coordinatesFlash ? 'Required!' : 'Not Set'}
                      </span>
                    </div>
                  )}
                  {addresses.length > 0 && !showAddressForm && (
                    <button
                      type="button"
                      onClick={() => { setShowAddressForm(true); setEditingAddressId(null); setAddressFormData({ label:'', type:'other', address:'', city:'', state:'', pincode:'' }); }}
                      className="ml-3 text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-500 hover:text-accent transition-colors flex items-center gap-1.5 group"
                    >
                      <Plus size={9} className="group-hover:rotate-90 transition-transform" />
                      Add New
                    </button>
                  )}
                </div>

                {/* Card body */}
                <div className={`relative border transition-all duration-500 p-8 ${
                  coordComplete
                    ? 'border-accent/25 bg-[linear-gradient(135deg,rgba(212,175,55,0.04),rgba(0,0,0,0)_70%)] shadow-[0_0_40px_rgba(212,175,55,0.06)]'
                    : coordinatesFlash
                      ? 'border-red-500/30 bg-red-500/[0.02] shadow-[0_0_30px_rgba(239,68,68,0.08)]'
                      : 'border-neutral-800 bg-neutral-950/60'
                }`}>
                  {/* Corner accents */}
                  <div className={`absolute top-0 left-0 w-5 h-5 border-t border-l transition-colors duration-500 ${
                    coordComplete ? 'border-accent/50' : coordinatesFlash ? 'border-red-500/40' : 'border-neutral-700'
                  }`} />
                  <div className={`absolute bottom-0 right-0 w-5 h-5 border-b border-r transition-colors duration-500 ${
                    coordComplete ? 'border-accent/50' : coordinatesFlash ? 'border-red-500/40' : 'border-neutral-700'
                  }`} />

                  <AnimatePresence mode="wait">
                    {!showAddressForm ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        {addresses.length === 0 ? (
                          /* Empty state — big CTA */
                          <div
                            onClick={() => setShowAddressForm(true)}
                            className="py-14 flex flex-col items-center justify-center cursor-pointer group"
                          >
                            <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center mb-6 transition-all duration-500 ${
                              coordinatesFlash
                                ? 'border-red-500/50 bg-red-500/5'
                                : 'border-neutral-800 group-hover:border-accent/50 group-hover:bg-accent/5'
                            }`}>
                              <MapPin className={`transition-all duration-500 ${
                                coordinatesFlash ? 'text-red-400 animate-bounce' : 'text-neutral-700 group-hover:text-accent group-hover:scale-110'
                              }`} size={28} />
                            </div>
                            <p className={`text-sm font-bold uppercase tracking-[0.25em] mb-2 transition-colors ${
                              coordinatesFlash ? 'text-red-400' : 'text-neutral-500 group-hover:text-white'
                            }`}>Add Delivery Address</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-700 group-hover:text-neutral-500 transition-colors">
                              Tap here to enter your shipping location
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map(addr => (
                              <div
                                key={addr.id}
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`relative p-6 border transition-all cursor-pointer group ${
                                  selectedAddressId === addr.id
                                    ? 'border-accent bg-accent/[0.03] shadow-[0_0_20px_rgba(212,175,55,0.06)]'
                                    : 'border-neutral-900 bg-neutral-950/40 hover:border-neutral-700'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                                      selectedAddressId === addr.id ? 'border-accent bg-accent shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'border-neutral-700 bg-transparent'
                                    }`} />
                                    <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${
                                      selectedAddressId === addr.id ? 'text-white' : 'text-neutral-500'
                                    }`}>{addr.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                      className="p-1.5 bg-neutral-900 rounded-sm hover:text-accent transition-colors"
                                    >
                                      <Settings size={10} />
                                    </button>
                                    {!addr.isDefault && (
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                        className="p-1.5 bg-neutral-900 rounded-sm hover:text-red-500 transition-colors"
                                      >
                                        <Trash size={10} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs font-mono leading-relaxed mb-4 text-white/60">{addr.address}, {addr.city}</p>
                                <div className="flex items-center justify-between pt-3 border-t border-neutral-900/50">
                                  <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-bold">{addr.state} • {addr.pincode}</p>
                                  {selectedAddressId === addr.id && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                      <Check size={14} className="text-accent" />
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                            {editingAddressId ? 'Edit Address' : 'New Delivery Address'}
                          </h3>
                          <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="text-neutral-600 hover:text-white transition-colors">
                            <X size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                          <div className="space-y-3">
                            <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Address Type</label>
                            <div className="flex gap-3">
                              {['home', 'work', 'other'].map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setAddressFormData(prev => ({ ...prev, type: t as any }))}
                                  className={`flex-1 py-3 text-[9px] uppercase font-bold tracking-[0.2em] border transition-all ${
                                    addressFormData.type === t
                                      ? 'bg-accent border-accent text-black'
                                      : 'bg-transparent border-neutral-900 text-neutral-600 hover:border-neutral-700'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          {addressFormData.type === 'other' && (
                            <div className="space-y-3">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Custom Label</label>
                              <input
                                type="text"
                                name="label"
                                value={addressFormData.label}
                                onChange={handleAddressInputChange}
                                placeholder="e.g. Studio, Hostel"
                                className="w-full bg-transparent border-b border-neutral-900 py-3 px-0 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800"
                              />
                            </div>
                          )}
                          <div className="md:col-span-2 space-y-3">
                            <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Street Address *</label>
                            <input
                              type="text"
                              name="address"
                              required
                              value={addressFormData.address}
                              onChange={handleAddressInputChange}
                              className="w-full bg-transparent border-b border-neutral-900 py-3 px-0 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                              placeholder="Flat / Building / Street"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">City *</label>
                            <input
                              type="text"
                              name="city"
                              required
                              value={addressFormData.city}
                              onChange={handleAddressInputChange}
                              className="w-full bg-transparent border-b border-neutral-900 py-3 px-0 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                              placeholder="Your City"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">State</label>
                            <input
                              type="text"
                              name="state"
                              value={addressFormData.state}
                              onChange={handleAddressInputChange}
                              className="w-full bg-transparent border-b border-neutral-900 py-3 px-0 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                              placeholder="State"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Pincode *</label>
                            <input
                              type="text"
                              name="pincode"
                              required
                              value={addressFormData.pincode}
                              onChange={handleAddressInputChange}
                              className="w-full bg-transparent border-b border-neutral-900 py-3 px-0 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                              placeholder="000000"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                          <button
                            type="button"
                            onClick={saveAddress}
                            className="flex-grow bg-white text-black py-5 text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-colors"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                            className="px-10 border border-neutral-900 py-5 text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-900 transition-colors text-neutral-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            );
          })()}

          {/* Second Life Modal — triggered on pay with 1 item */}
          <SecondLifeModal
            isOpen={showSecondLifeModal}
            onClose={() => setShowSecondLifeModal(false)}
            onContinueWithEcoBag={() => {
              dismissSecondLife();
              proceedToPayment();
            }}
            cartProductIds={cart.map(item => item.id)}
          />

          {/* Packaging Intelligence Banner */}
          <PackagingUpsellBanner itemCount={totalItemCount} />

          {/* Cart Section */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="text-accent font-mono text-xs font-bold leading-none">03</span>
              <h2 className="text-[12px] tracking-[0.3em] font-bold uppercase text-white">Extraction Manifest</h2>
              <div className="flex-grow h-[1px] bg-neutral-900" />
            </div>
            
            <div className="space-y-10">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-8 group">
                  <div className="w-28 h-36 bg-neutral-950 overflow-hidden relative flex-shrink-0">
                    <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="flex-grow flex flex-col py-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-[15px] tracking-tight font-display font-medium uppercase mb-1">{item.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold">CAT_{item.category?.toUpperCase()}</span>
                          <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                          <span className="text-[9px] text-accent uppercase tracking-[0.2em] font-bold">BUILD: {item.selectedSize || 'OS'}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-neutral-800 hover:text-red-500 transition-all p-2">
                          <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-black border border-neutral-900 p-1">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} className="w-6 h-6 flex items-center justify-center hover:text-accent transition-colors">
                              <Minus size={10} />
                          </button>
                          <span className="w-8 text-center text-[10px] font-mono font-bold">{item.quantity.toString().padStart(2, '0')}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)} className="w-6 h-6 flex items-center justify-center hover:text-accent transition-colors">
                              <Plus size={10} />
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-700 font-mono tracking-tighter">UNIT_PRICE: ₹{item.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-mono tracking-tighter font-bold">TOTAL: ₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-8">
            <div className="bg-neutral-950 p-10 border border-neutral-900 relative">
              {/* Corner Accents */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-accent/20" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-accent/20" />

              <h2 className="text-[11px] tracking-[0.4em] font-bold uppercase mb-10 text-white/40">Financial Ledger</h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                  <span className="text-neutral-600">Assets Subtotal</span>
                  <span className="font-mono">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                  <span className="text-neutral-600">Transit Protocol</span>
                  <span className="text-accent font-bold">Complementary Signal</span>
                </div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-widest pt-6 border-t border-neutral-900">
                  <span className="text-white font-bold">Extraction Total</span>
                  <span className="text-2xl font-display font-medium text-white">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Tracker replacing the warning banner */}
              <div className="mb-6 border border-[#D4AF37]/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(0,0,0,0)_60%)] p-5 relative overflow-hidden">
                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#D4AF37]/20" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#D4AF37]/20" />
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package size={14} className={totalItemCount >= 2 ? "text-accent" : "text-neutral-500"} />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white">Unboxing Unlock</span>
                  </div>
                  <span className="text-[9px] font-mono text-accent uppercase font-bold">
                    {totalItemCount >= 2 ? "UNLOCKED ✓" : `${totalItemCount} / 2 ITEMS`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-neutral-900 border border-white/5 rounded-full overflow-hidden mb-3 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: totalItemCount >= 2 ? '100%' : '50%' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#D4AF37] via-[#f5d97a] to-[#D4AF37] relative"
                  >
                    {totalItemCount < 2 && (
                      <span className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-[2px] animate-pulse" />
                    )}
                  </motion.div>
                </div>

                <p className="text-[10.5px] leading-relaxed text-neutral-400 font-light tracking-wide">
                  {totalItemCount >= 2 ? (
                    <span className="text-accent font-medium">Congratulations! Your premium, handcrafted Second Life Box is unlocked and will ship with your order.</span>
                  ) : (
                    <span>Add <strong className="text-white">one more tee</strong> to unlock your premium, handcrafted Second Life Box! (MOQ: 2 tees)</span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isProcessing || (addresses.length === 0 && !showAddressForm)}
                  className="w-full bg-white text-black py-6 text-[12px] tracking-[0.4em] font-bold uppercase hover:bg-accent transition-all duration-500 flex flex-col items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <div className="relative z-10 flex items-center gap-4">
                    {isProcessing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Share2 size={16} />
                      </motion.div>
                    ) : (
                      <CreditCard size={18} className="text-black" />
                    )}
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 group-hover:text-black/50 transition-colors block mb-0.5 font-bold font-sans leading-none">Initiate Extraction</span>
                      <span className="text-[16px] uppercase tracking-[0.3em] font-extrabold text-black leading-none">CHECK OUT</span>
                    </div>
                  </div>
                  {!isProcessing && (
                    <span className="relative z-10 text-[8px] opacity-40 font-bold group-hover:opacity-100 transition-opacity">
                      {totalItemCount < 2 ? "2 T-shirts requested for unboxing" : "Redirect to secure portal"}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 p-3 bg-neutral-900/40 border border-neutral-800 rounded-sm">
                  <Shield size={14} className="text-accent shrink-0" />
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold leading-tight">
                    Payments handled via secure external nodes (PhonePe/UPI)
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-900 text-[9px] text-neutral-700 text-center uppercase tracking-[0.2em] leading-relaxed space-y-1">
                <p>Digital Signal: {Math.random().toString(36).substr(2, 12).toUpperCase()}</p>
                <p>Protocol: SSL_256_EXTERN</p>
                <p>© CHILS & CO. SYSTEMS</p>
              </div>
            </div>

            <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border border-neutral-900 opacity-30">
                <Package size={12} />
                <span className="text-[9px] uppercase font-bold tracking-widest">Handcrafted</span>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border border-neutral-900 opacity-30">
                <Zap size={12} />
                <span className="text-[9px] uppercase font-bold tracking-widest">Global Express</span>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border border-neutral-900 opacity-30">
                <Shield size={12} />
                <span className="text-[9px] uppercase font-bold tracking-widest">Verified Origins</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
