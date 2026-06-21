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
  phone?: string;
}

const countryCodes = [
  { name: 'India', code: '+91', length: 10, flag: '🇮🇳' },
  { name: 'United States', code: '+1', length: 10, flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', length: 10, flag: '🇬🇧' },
  { name: 'Canada', code: '+1', length: 10, flag: '🇨🇦' },
  { name: 'Australia', code: '+61', length: 9, flag: '🇦🇺' },
  { name: 'Singapore', code: '+65', length: 8, flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: '+971', length: 9, flag: '🇦🇪' },
  { name: 'Germany', code: '+49', length: 10, flag: '🇩🇪' },
  { name: 'France', code: '+33', length: 9, flag: '🇫🇷' },
  { name: 'Saudi Arabia', code: '+966', length: 9, flag: '🇸🇦' },
  { name: 'Other', code: '+', length: 0, flag: '🌐' }
];

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
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');

  const dismissSecondLife = () => {
    setSecondLifeDismissed(true);
    setShowSecondLifeModal(false);
  };

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);

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
    pincode: '',
    phone: ''
  });

  // Country Code and Phone Digit components
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneInput, setPhoneInput] = useState('');
  const [addressCountry, setAddressCountry] = useState(countryCodes[0]);
  const [addressPhoneInput, setAddressPhoneInput] = useState('');

  // Sync components to formData.phone
  useEffect(() => {
    const formatted = phoneInput.trim();
    setFormData(prev => ({
      ...prev,
      phone: formatted ? `${selectedCountry.code} ${formatted}` : ''
    }));
  }, [selectedCountry, phoneInput]);

  // Sync back from formData.phone if updated externally
  useEffect(() => {
    if (!formData.phone) return;
    const currentCombined = `${selectedCountry.code} ${phoneInput}`.trim();
    if (formData.phone.trim() === currentCombined) return;

    const match = countryCodes.find(c => c.code !== '+' && formData.phone.startsWith(c.code + ' '));
    if (match) {
      setSelectedCountry(match);
      setPhoneInput(formData.phone.slice(match.code.length + 1).trim());
    } else if (formData.phone.startsWith('+')) {
      const parts = formData.phone.split(' ');
      const code = parts[0];
      const rest = parts.slice(1).join(' ').trim();
      const customMatch = countryCodes.find(c => c.code === code) || { name: 'Other', code, length: 0, flag: '🌐' };
      setSelectedCountry(customMatch);
      setPhoneInput(rest);
    } else {
      setSelectedCountry(countryCodes[0]);
      setPhoneInput(formData.phone.trim());
    }
  }, [formData.phone]);

  // Sync components to addressFormData.phone
  useEffect(() => {
    const formatted = addressPhoneInput.trim();
    setAddressFormData(prev => ({
      ...prev,
      phone: formatted ? `${addressCountry.code} ${formatted}` : ''
    }));
  }, [addressCountry, addressPhoneInput]);

  // Sync back from addressFormData.phone if updated externally
  useEffect(() => {
    if (addressFormData.phone === undefined) return;
    const currentCombined = `${addressCountry.code} ${addressPhoneInput}`.trim();
    if (addressFormData.phone.trim() === currentCombined) return;

    if (!addressFormData.phone) {
      setAddressPhoneInput('');
      return;
    }

    const match = countryCodes.find(c => c.code !== '+' && addressFormData.phone.startsWith(c.code + ' '));
    if (match) {
      setAddressCountry(match);
      setAddressPhoneInput(addressFormData.phone.slice(match.code.length + 1).trim());
    } else if (addressFormData.phone.startsWith('+')) {
      const parts = addressFormData.phone.split(' ');
      const code = parts[0];
      const rest = parts.slice(1).join(' ').trim();
      const customMatch = countryCodes.find(c => c.code === code) || { name: 'Other', code, length: 0, flag: '🌐' };
      setAddressCountry(customMatch);
      setAddressPhoneInput(rest);
    } else {
      setAddressCountry(countryCodes[0]);
      setAddressPhoneInput(addressFormData.phone.trim());
    }
  }, [addressFormData.phone]);

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
        pincode: selected.pincode,
        phone: selected.phone || prev.phone
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

    if (addressPhoneInput.trim() && addressCountry.length > 0 && addressPhoneInput.length !== addressCountry.length) {
      alert(`Contact phone number must be exactly ${addressCountry.length} digits for ${addressCountry.name}.`);
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
    setAddressFormData({ label: '', type: 'other', address: '', city: '', state: '', pincode: '', phone: '' });
  };

  const deleteAddress = (id: string) => {
    let updated = addresses.filter(a => a.id !== id);
    const wasDefault = addresses.find(a => a.id === id)?.isDefault;
    if (wasDefault && updated.length > 0) {
      updated = updated.map((a, index) => index === 0 ? { ...a, isDefault: true } : a);
    }
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
      pincode: addr.pincode,
      phone: addr.phone || ''
    });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  // Core payment logic (extracted so modal can also trigger it)
  const proceedToPayment = async () => {
    const shippingFee = shippingMethod === 'delivery' ? 80 : 0;
    await triggerCheckout(formData, cart, totalPrice + shippingFee, shippingMethod);
    // triggerCheckout handles navigation logic via PhonePe redirect
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if coordinates (shipping address) are selected/filled (only for home delivery)
    if (shippingMethod === 'delivery' && !selectedAddressId) {
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

    // Validate phone number length based on selected country
    if (selectedCountry.length > 0 && phoneInput.length !== selectedCountry.length) {
      setError(`Phone number must be exactly ${selectedCountry.length} digits for ${selectedCountry.name}.`);
      const identitySection = document.getElementById('identity-section');
      if (identitySection) {
        identitySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsEditingIdentity(true);
        setTimeout(() => {
          const phoneField = identitySection.querySelector('input[type="tel"]') as HTMLInputElement;
          if (phoneField) phoneField.focus();
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

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">        {/* Left Column: Form + Cart */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Step 01: Extraction Manifest */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <h2 className="text-[11px] tracking-[0.25em] font-mono font-bold uppercase text-white">01 / Extraction Manifest</h2>
              </div>
              <span className="text-[9px] font-mono text-neutral-600 uppercase">
                {cart.length} unique {cart.length === 1 ? 'artifact' : 'artifacts'}
              </span>
            </div>
            
            <div className="space-y-4">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 p-4 border border-white/5 bg-neutral-950/10 rounded-sm group relative">
                  <Link to={`/product/${item.id}`} className="w-16 h-20 bg-neutral-950 overflow-hidden relative flex-shrink-0 block rounded-sm">
                    <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-500" 
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </Link>
                  <div className="flex-grow flex flex-col py-0.5 justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.id}`} className="hover:text-accent transition-colors">
                          <h3 className="text-sm tracking-tight font-display font-medium uppercase mb-0.5">{item.name}</h3>
                        </Link>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] text-neutral-600 uppercase tracking-widest font-bold font-mono">CAT_{item.category?.toUpperCase()}</span>
                          <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                          <span className="text-[8px] text-accent uppercase tracking-[0.2em] font-bold font-mono">SIZE: {item.selectedSize || 'OS'}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-neutral-700 hover:text-red-500 transition-colors p-1 -mt-1 cursor-pointer">
                          <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center bg-black border border-neutral-900/80 p-0.5 rounded-sm">
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-accent transition-colors cursor-pointer">
                            <Minus size={8} />
                        </button>
                        <span className="w-6 text-center text-[9px] font-mono font-bold">{item.quantity.toString().padStart(2, '0')}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)} className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-accent transition-colors cursor-pointer">
                            <Plus size={8} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-neutral-600 font-mono tracking-tighter block">₹{item.price.toLocaleString()} EACH</span>
                        <p className="text-xs font-mono tracking-tight font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Packaging Intelligence Banner (Visual divider between Step 1 and Step 2) */}
          <PackagingUpsellBanner itemCount={totalItemCount} />

          {/* Step 02: Identity Clearance */}
          {(() => {
            const identityComplete = !!(formData.firstName && formData.email && formData.phone);
            const showIdentityForm = isEditingIdentity || !identityComplete;
            return (
              <section id="identity-section" className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      identityComplete 
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                        : 'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse'
                    }`} />
                    <h2 className="text-[11px] tracking-[0.25em] font-mono font-bold uppercase text-white">02 / Identity Clearance</h2>
                  </div>
                  {identityComplete && !showIdentityForm && (
                    <button
                      type="button"
                      onClick={() => setIsEditingIdentity(true)}
                      className="text-[9px] tracking-[0.2em] font-bold uppercase text-neutral-500 hover:text-accent transition-colors cursor-pointer"
                    >
                      [ Edit Credentials ]
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {!showIdentityForm ? (
                    // Read-only Glassmorphic Security Badge
                    <motion.div
                      key="badge"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="relative border border-white/5 bg-neutral-950/40 p-6 flex flex-col sm:flex-row items-center gap-6 rounded-sm backdrop-blur-md overflow-hidden"
                    >
                      {/* Corner subtle markings */}
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-accent/20" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-accent/20" />
                      
                      {/* Left side: Avatar */}
                      <div className="w-14 h-14 rounded-full border border-accent/30 bg-accent/5 shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center justify-center font-display text-accent text-xl font-bold uppercase shrink-0">
                        {formData.firstName.charAt(0) || 'U'}
                      </div>

                      {/* Right side: Key-value metadata */}
                      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[11px] uppercase tracking-wider font-light leading-relaxed">
                        <div>
                          <span className="text-neutral-600 block text-[8px] font-bold tracking-widest font-mono">HOLDER_NAME</span>
                          <span className="text-white font-medium">{formData.firstName} {formData.lastName || ''}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600 block text-[8px] font-bold tracking-widest font-mono">SECURE_EMAIL</span>
                          <span className="text-white font-medium lowercase font-sans">{formData.email}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600 block text-[8px] font-bold tracking-widest font-mono">VERIFIED_PHONE</span>
                          <span className="text-white font-medium font-mono">{formData.phone}</span>
                        </div>
                        <div>
                          <span className="text-neutral-600 block text-[8px] font-bold tracking-widest font-mono">CLEARANCE_LEVEL</span>
                          <span className="text-accent font-bold">LEVEL 1 AUTHORIZED ✓</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // Edit Form
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      className="border border-amber-500/10 bg-neutral-950/20 p-6 rounded-sm space-y-6 shadow-[0_0_20px_rgba(212,175,55,0.02)]"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-2 group">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                            placeholder="REQUIRED"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                            placeholder="OPTIONAL"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none transition-all font-mono placeholder:text-neutral-800 text-white"
                            placeholder="you@mail.com"
                          />
                        </div>
                        <div className="space-y-2 group">
                          <label className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] block font-bold group-focus-within:text-accent transition-colors">Phone Number *</label>
                          <div className="flex gap-2 items-end border-b border-neutral-900 focus-within:border-accent transition-all">
                            <select
                              value={selectedCountry.code}
                              onChange={(e) => {
                                const selected = countryCodes.find(c => c.code === e.target.value) || countryCodes[0];
                                setSelectedCountry(selected);
                              }}
                              className="bg-transparent py-2 text-sm outline-none font-mono text-white border-none cursor-pointer max-w-[120px]"
                            >
                              {countryCodes.map(c => (
                                <option key={c.name} value={c.code} className="bg-black text-white font-mono text-xs">
                                  {c.flag} {c.code} ({c.name})
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              required
                              value={phoneInput}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPhoneInput(val);
                              }}
                              className="flex-1 bg-transparent py-2 text-sm outline-none border-none font-mono placeholder:text-neutral-800 text-white"
                              placeholder={selectedCountry.length > 0 ? `${selectedCountry.length} DIGITS` : "NUMBER"}
                            />
                          </div>
                        </div>
                      </div>

                      {identityComplete && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsEditingIdentity(false)}
                            className="px-6 py-2.5 bg-white text-black text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-accent hover:text-black transition-all rounded-sm cursor-pointer active:scale-95"
                          >
                            Lock Pass
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            );
          })()}

          {/* Step 03: Transit Protocol */}
          <section className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <h2 className="text-[11px] tracking-[0.25em] font-mono font-bold uppercase text-white">03 / Transit Protocol</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShippingMethod('delivery')}
                className={`p-5 border text-left rounded-sm transition-all cursor-pointer ${
                  shippingMethod === 'delivery'
                    ? 'border-accent bg-accent/[0.02] shadow-[0_0_15px_rgba(212,175,55,0.05)]'
                    : 'border-white/5 bg-neutral-950/20 hover:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-white">Home Delivery</span>
                  <span className="text-[11px] font-mono font-bold text-accent">₹80</span>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-light leading-relaxed">
                  Delivered to your specified coordinate node. Standard dispatch times apply.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod('pickup')}
                className={`p-5 border text-left rounded-sm transition-all cursor-pointer ${
                  shippingMethod === 'pickup'
                    ? 'border-accent bg-accent/[0.02] shadow-[0_0_15px_rgba(212,175,55,0.05)]'
                    : 'border-white/5 bg-neutral-950/20 hover:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-white">Collect in Store</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-500">FREE</span>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-light leading-relaxed">
                  Pick up at Miyapur, Hyderabad store. Ready within 24 hours.
                </p>
              </button>
            </div>
          </section>

          {/* Delivery Destination (Conditional based on Transit Protocol) */}
          {shippingMethod === 'delivery' ? (
            (() => {
              const coordComplete = !!selectedAddressId;
              return (
                <section
                  id="coordinates-section"
                  className={`space-y-6 transition-all duration-700 ${
                    coordinatesFlash ? 'coordinates-flash' : ''
                  }`}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        coordComplete 
                          ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                          : coordinatesFlash
                            ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse'
                            : 'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse'
                      }`} />
                      <h2 className="text-[11px] tracking-[0.25em] font-mono font-bold uppercase text-white">04 / Delivery Destination</h2>
                    </div>
                    {addresses.length > 0 && !showAddressForm && (
                      <button
                        type="button"
                        onClick={() => { setShowAddressForm(true); setEditingAddressId(null); setAddressFormData({ label:'', type:'other', address:'', city:'', state:'', pincode:'', phone:'' }); }}
                        className="text-[9px] tracking-[0.2em] font-bold uppercase text-neutral-500 hover:text-accent transition-colors cursor-pointer"
                      >
                        [ + Add Destination ]
                      </button>
                    )}
                  </div>

                  <div className={`relative transition-all duration-500`}>
                    <AnimatePresence mode="wait">
                      {!showAddressForm ? (
                        <motion.div
                          key="address-list"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          {addresses.length === 0 ? (
                            /* Empty state — minimal CTA */
                            <div
                              onClick={() => setShowAddressForm(true)}
                              className="py-10 border border-dashed border-neutral-900 hover:border-accent/30 bg-neutral-950/20 hover:bg-accent/[0.01] transition-all rounded-sm flex flex-col items-center justify-center cursor-pointer group"
                            >
                              <MapPin className="text-neutral-700 group-hover:text-accent group-hover:scale-105 transition-all mb-3" size={24} />
                              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 group-hover:text-white transition-colors">
                                + Initialize Delivery Destination
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {addresses.map(addr => (
                                <div
                                  key={addr.id}
                                  onClick={() => setSelectedAddressId(addr.id)}
                                  className={`relative p-5 border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm ${
                                    selectedAddressId === addr.id
                                      ? 'border-accent bg-accent/[0.02] shadow-[0_0_15px_rgba(212,175,55,0.05)]'
                                      : 'border-white/5 bg-neutral-950/20 hover:border-neutral-800'
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    {/* Custom Radio Button */}
                                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                      selectedAddressId === addr.id ? 'border-accent' : 'border-neutral-800'
                                    }`}>
                                      {selectedAddressId === addr.id && (
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2.5 mb-1">
                                        <span className={`text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 rounded-sm ${
                                          selectedAddressId === addr.id ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-neutral-900 text-neutral-500 border border-transparent'
                                        }`}>{addr.label}</span>
                                        {addr.phone && (
                                          <span className="text-[9px] font-mono text-neutral-600 font-bold">{addr.phone}</span>
                                        )}
                                      </div>
                                      <p className="text-xs font-light text-neutral-400 font-sans tracking-wide leading-relaxed">
                                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 self-end md:self-auto text-[9px] font-bold uppercase tracking-widest text-neutral-600">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                      className="hover:text-accent transition-colors cursor-pointer"
                                    >
                                      [ Edit ]
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                      className="hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      [ Delete ]
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        // Add / Edit address form
                        <motion.div
                          key="address-form"
                          initial={{ opacity: 0, scale: 0.99 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.99 }}
                          className="border border-neutral-900 bg-neutral-950/40 p-6 rounded-sm space-y-6"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent font-mono">
                              {editingAddressId ? 'Edit Coordinate Node' : 'Initialize Coordinate Node'}
                            </h3>
                            <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="text-neutral-600 hover:text-white transition-colors cursor-pointer">
                              <X size={18} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <div className="space-y-2">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Node Type</label>
                              <div className="flex gap-2">
                                {['home', 'work', 'other'].map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setAddressFormData(prev => ({ ...prev, type: t as any }))}
                                    className={`flex-1 py-2 text-[9px] uppercase font-bold tracking-[0.2em] border transition-all cursor-pointer ${
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
                              <div className="space-y-2">
                                <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Custom Label</label>
                                <input
                                  type="text"
                                  name="label"
                                  value={addressFormData.label}
                                  onChange={handleAddressInputChange}
                                  placeholder="e.g. Studio, Hostel"
                                  className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                                />
                              </div>
                            )}
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Street Address *</label>
                              <input
                                  type="text"
                                  name="address"
                                  required
                                  value={addressFormData.address}
                                  onChange={handleAddressInputChange}
                                  className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                                  placeholder="Flat / Building / Street"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">City *</label>
                              <input
                                type="text"
                                name="city"
                                required
                                value={addressFormData.city}
                                onChange={handleAddressInputChange}
                                className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                                placeholder="Your City"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">State</label>
                              <input
                                type="text"
                                name="state"
                                value={addressFormData.state}
                                onChange={handleAddressInputChange}
                                className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                                placeholder="State"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Pincode *</label>
                              <input
                                type="text"
                                name="pincode"
                                required
                                value={addressFormData.pincode}
                                onChange={handleAddressInputChange}
                                className="w-full bg-transparent border-b border-neutral-900 py-2 text-sm focus:border-accent outline-none font-mono placeholder:text-neutral-800 text-white"
                                placeholder="000000"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] font-bold">Contact Phone Number</label>
                              <div className="flex gap-2 items-end border-b border-neutral-900 focus-within:border-accent transition-all">
                                <select
                                  value={addressCountry.code}
                                  onChange={(e) => {
                                    const selected = countryCodes.find(c => c.code === e.target.value) || countryCodes[0];
                                    setAddressCountry(selected);
                                  }}
                                  className="bg-transparent py-2 text-sm outline-none font-mono text-white border-none cursor-pointer max-w-[120px]"
                                >
                                  {countryCodes.map(c => (
                                    <option key={c.name} value={c.code} className="bg-black text-white font-mono text-xs">
                                      {c.flag} {c.code} ({c.name})
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="tel"
                                  value={addressPhoneInput}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setAddressPhoneInput(val);
                                  }}
                                  className="flex-1 bg-transparent py-2 text-sm outline-none border-none font-mono placeholder:text-neutral-800 text-white"
                                  placeholder={addressCountry.length > 0 ? `${addressCountry.length} DIGITS (optional)` : "NUMBER (optional)"}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 flex gap-4">
                            <button
                              type="button"
                              onClick={saveAddress}
                              className="flex-grow bg-white text-black py-4 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-accent transition-colors cursor-pointer"
                            >
                              Save Coordinates
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                              className="px-8 border border-neutral-900 py-4 text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-900 transition-colors text-neutral-500 cursor-pointer"
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
            })()
          ) : (
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <h2 className="text-[11px] tracking-[0.25em] font-mono font-bold uppercase text-white">04 / Store Collection Node</h2>
                </div>
              </div>

              <div className="border border-accent/20 bg-neutral-950/40 p-6 rounded-sm relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-accent/20" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-accent/20" />
                
                <div className="flex items-start gap-4">
                  <MapPin className="text-accent shrink-0 mt-0.5" size={18} />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-sm mb-2 inline-block">
                      CHILS & CO. HQ / FLAGSHIP STORE
                    </span>
                    <p className="text-xs text-neutral-400 font-sans tracking-wide leading-relaxed mt-1">
                      3rd Floor, Plot No. 38 & 39, Matrusri Nagar, Miyapur<br />
                      Hyderabad, Telangana – 500049, India
                    </p>
                    <p className="text-[9px] font-mono text-neutral-600 font-bold mt-2 uppercase">
                      Hours: Mon–Sat · 10 AM – 6 PM IST
                    </p>
                    <div className="mt-4">
                      <a
                        href="https://share.google/IwXCYyuX7MlF1tCt2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-accent/30 hover:border-accent bg-accent/5 hover:bg-accent/15 text-[10px] uppercase font-bold tracking-widest text-accent hover:text-white transition-all rounded-sm cursor-pointer"
                      >
                        <Navigation size={10} className="rotate-45" />
                        View Map Location
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

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
                  {shippingMethod === 'delivery' ? (
                    <span className="font-mono text-white font-bold">₹80</span>
                  ) : (
                    <span className="text-accent font-bold">Free (Store Pickup)</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-widest pt-6 border-t border-neutral-900">
                  <span className="text-white font-bold">Extraction Total</span>
                  <span className="text-2xl font-display font-medium text-white">₹{(totalPrice + (shippingMethod === 'delivery' ? 80 : 0)).toLocaleString()}</span>
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
                  disabled={isProcessing}
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
