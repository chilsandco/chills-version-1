import React, { useState, useEffect } from 'react';
import { small } from '../data/studio';
import { cartItems, cartValue, track } from '../lib/track';
import { useCart } from '../CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { useAuth } from '../AuthContext';
import { Lock, Minus, Package, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import CheckoutInterstitial from '../components/CheckoutInterstitial';
import SecondLifeModal from '../components/SecondLifeModal';
import { useNarrow } from '../hooks/useNarrow';
import { studio } from '../data/studio';

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

const money = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });

const sanitizePhoneNumber = (phone: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
};

const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; prefix?: string; hint?: string }> = ({ label, prefix, hint, ...input }) => (
  <label className="block">
    <span className="block text-sm mb-1.5">{label}{input.required && <span className="text-stone"> *</span>}</span>
    <span className="flex items-center h-12 border border-black/20 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink transition-colors bg-[#fff]">
      {prefix && <span className="pl-3 text-stone text-[15px] select-none">{prefix}</span>}
      <input {...input} className="w-full h-full px-3 bg-transparent text-[16px] text-ink outline-none placeholder:text-black/35" />
    </span>
    {hint && <span className="block text-xs text-red-700 mt-1">{hint}</span>}
  </label>
);

const Checkout: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  // one report per visit to checkout, once the bag has loaded
  const reported = React.useRef(false);
  React.useEffect(() => {
    if (reported.current || !cart.length) return;
    reported.current = true;
    track('begin_checkout', { currency: 'INR', value: cartValue(cart), items: cartItems(cart) });
  }, [cart]);

  // Total items in cart for packaging intelligence
  // Combos count as their actual tee count (3), not as 1 cart item
  const totalItemCount = cart.reduce((count, item) => {
    if (item.isCombo && item.comboItems && item.comboItems.length > 0) {
      return count + (item.comboItems.length * item.quantity);
    }
    return count + item.quantity;
  }, 0);
  const { triggerCheckout, isProcessing, error, setError } = useCheckout();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const narrow = useNarrow(1024);
  const [showItems, setShowItems] = useState(false);

  // A private code, entered quietly at the end of the order
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; discountType: string; amount: number } | null>(null);
  const hasSet = cart.some(item => item.isCombo);

  const applyCode = async () => {
    const code = codeInput.trim();
    if (!code) return;
    setCodeChecking(true);
    setCodeError(null);
    try {
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: totalPrice, hasSet }),
      });
      const d = await r.json();
      if (d.valid) { setCoupon({ code: d.code, discountType: d.discountType, amount: d.amount }); setCodeInput(''); setCodeOpen(false); }
      else setCodeError(d.message || "That code isn't valid.");
    } catch {
      setCodeError("We couldn't check that code. Please try again.");
    } finally {
      setCodeChecking(false);
    }
  };

  // codes don't combine with sets, so adding a set clears the code
  useEffect(() => { if (hasSet) setCoupon(null); }, [hasSet]);

  const discount = coupon
    ? coupon.discountType === 'percent' ? (totalPrice * coupon.amount) / 100 : Math.min(coupon.amount, totalPrice)
    : 0;

  // Second Life modal state — shown when 1 item in cart
  const [showSecondLifeModal, setShowSecondLifeModal] = useState(false);
  const [secondLifeDismissed, setSecondLifeDismissed] = useState(() => {
    return sessionStorage.getItem('chils_packaging_upsell_dismissed') === 'true';
  });
  const [coordinatesFlash, setCoordinatesFlash] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('delivery');

  const deliveryFee = () => {
    const realShippingCount = cart.reduce((count, item) => {
      if (item.id.toString() === '1672') return count; // exclude packaging product
      if (item.isCombo && item.comboItems && item.comboItems.length > 0) {
        return count + (item.comboItems.length * item.quantity);
      }
      return count + item.quantity;
    }, 0);
    if (realShippingCount === 0) return 0;
    if (realShippingCount <= 2) return 80;
    const extra = realShippingCount - 2;
    return 80 + Math.floor(extra / 2) * 79 + (extra % 2) * 49;
  };

  const getShippingFee = () => (shippingMethod === 'delivery' ? deliveryFee() : 0);

  const dismissSecondLife = () => {
    setSecondLifeDismissed(true);
    sessionStorage.setItem('chils_packaging_upsell_dismissed', 'true');
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
    type: 'home' as 'home' | 'work' | 'other',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  // Redirect to login if not authenticated (Guest checkout disabled)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
    let cachedData: any = {};
    if (storedForm) {
      try {
        cachedData = JSON.parse(storedForm);
      } catch (e) {
        console.error("Failed to parse persisted form", e);
      }
    }

    setFormData(prev => {
      const freshName = user ? (user.firstName || user.first_name || '') : '';
      const freshLastName = user ? (user.lastName || user.last_name || '') : '';
      const freshEmail = user ? (user.email || '') : '';
      const freshPhone = user ? sanitizePhoneNumber(user.billing?.phone || (user as any).phone || '') : '';

      return {
        ...prev,
        ...cachedData,
        // Prioritize fresh profile details over local storage cache on load/mount
        firstName: freshName || cachedData.firstName || prev.firstName || '',
        lastName: freshLastName || cachedData.lastName || prev.lastName || '',
        email: freshEmail || cachedData.email || prev.email || '',
        phone: freshPhone || cachedData.phone || prev.phone || ''
      };
    });
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

  // Pre-fill user data if they were empty
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || user.first_name || '',
        lastName: prev.lastName || user.lastName || user.last_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || sanitizePhoneNumber(user.billing?.phone || (user as any).phone || '')
      }));
    }
  }, [user?.id]);

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
        phone: sanitizePhoneNumber(selected.phone || prev.phone)
      }));
    }
  }, [selectedAddressId, addresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    let digits = rawVal.replace(/\D/g, '');
    
    // If they pasted or typed a long string containing country code:
    if (digits.length > 10) {
      if (digits.startsWith('91')) {
        digits = digits.slice(2);
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
    }
    
    const cleanVal = digits.slice(0, 10);
    setFormData(prev => ({ ...prev, phone: cleanVal }));
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      let digits = value.replace(/\D/g, '');
      if (digits.length > 10) {
        if (digits.startsWith('91')) {
          digits = digits.slice(2);
        } else if (digits.startsWith('0')) {
          digits = digits.slice(1);
        }
      }
      const cleanVal = digits.slice(0, 10);
      setAddressFormData(prev => ({ ...prev, phone: cleanVal }));
    } else {
      setAddressFormData(prev => ({ ...prev, [name]: value }));
    }
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
    setAddressFormData({ label: '', type: 'home', address: '', city: '', state: '', pincode: '', phone: '' });
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
    const shippingFee = getShippingFee();
    await triggerCheckout(formData, cart, totalPrice - discount + shippingFee, shippingMethod, coupon?.code);
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

    // Phone number length validation (must be exactly 10 digits)
    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      const identitySection = document.getElementById('identity-section');
      if (identitySection) {
        identitySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const phoneInput = identitySection.querySelector('input[name="phone"]') as HTMLInputElement;
          if (phoneInput) phoneInput.focus();
        }, 600);
      }
      return;
    }

    // Second Life gate: single items show upsell modal once before checking out
    if (totalItemCount === 1 && !secondLifeDismissed) {
      setShowSecondLifeModal(true);
      return;
    }

    await proceedToPayment();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center text-ink">
        <h1 className="text-4xl md:text-5xl font-semibold">Your bag is empty</h1>
        <p className="text-stone mt-3">Choose a Trilogy and save 10%.</p>
        <Link to="/pick-your-three" className="mt-8 bg-ink text-[#fff] px-10 py-4 text-sm font-medium">Pick your three</Link>
        <Link to="/collection" className="mt-4 text-sm underline underline-offset-4">Browse all products</Link>
      </div>
    );
  }

  const isPhoneValid = /^\d{10}$/.test(formData.phone);
  const identityComplete = !!(formData.firstName && formData.email && isPhoneValid);
  const showIdentityForm = isEditingIdentity || !identityComplete;
  const orderTotal = totalPrice - discount + getShippingFee();

  const stepper = (qty: number, onChange: (n: number) => void, name: string) => (
    <div className="inline-flex items-center border border-black/15">
      <button type="button" aria-label={`Reduce ${name}`} onClick={() => onChange(qty - 1)} className="w-8 h-8 flex items-center justify-center"><Minus size={12} /></button>
      <span className="w-6 text-center text-sm" aria-live="polite">{qty}</span>
      <button type="button" aria-label={`Add another ${name}`} onClick={() => onChange(qty + 1)} className="w-8 h-8 flex items-center justify-center"><Plus size={12} /></button>
    </div>
  );

  const orderLines = (
    <ul className="divide-y divide-black/[.07]">
      {cart.map(item => {
        const remove = () => (item.isCombo ? removeFromCart(item.id) : removeFromCart(item.id, item.selectedSize, item.selectedColor));
        const setQty = (n: number) => {
          if (n < 1) return remove();
          return item.isCombo ? updateQuantity(item.id, n) : updateQuantity(item.id, n, item.selectedSize, item.selectedColor);
        };
        const variationImage = item.selectedColor && item.variations
          ? item.variations.find(v => v.attributes.color === item.selectedColor)?.images?.[0]
          : null;
        const image = studio((item.isCombo ? item.comboItems?.[0]?.image : variationImage) || item.images[0]);
        return (
          <li key={`${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`} className="flex gap-4 py-4">
            <Link to={item.isCombo ? `/combos?id=${item.comboId || item.id}` : `/product/${item.id}`} className="w-[72px] h-[92px] shrink-0 bg-paper overflow-hidden">
              <img src={small(image)} alt={item.name} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex justify-between gap-3">
                <p className="font-medium text-sm leading-snug truncate">{item.name}</p>
                <p className="text-sm font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
              {item.isCombo ? (
                <ul className="text-xs text-stone mt-1 space-y-0.5">
                  {item.comboItems?.map((sub, i) => <li key={sub.id + i} className="truncate">{sub.name} · {sub.selectedSize}</li>)}
                  <li className="text-ink">10% set saving applied</li>
                </ul>
              ) : (
                <p className="text-xs text-stone mt-1 truncate">{[item.selectedSize && `Size ${item.selectedSize}`, item.selectedColor].filter(Boolean).join(' · ')}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2">
                {stepper(item.quantity, setQty, item.name)}
                <button type="button" onClick={remove} className="text-xs text-stone underline underline-offset-4 hover:text-ink cursor-pointer">Remove</button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );

  const heading = (n: number, title: string, action?: React.ReactNode) => (
    <div className="flex items-baseline justify-between gap-4 mb-5">
      <h2 className="text-xl md:text-2xl font-semibold"><span className="text-stone font-normal mr-2">{n}</span>{title}</h2>
      {action}
    </div>
  );

  return (
    <div className="pt-20 md:pt-28 pb-16 md:pb-24 px-5 md:px-10 max-w-[1240px] mx-auto min-h-screen text-ink">
      <SEO title="Checkout" noindex={true} />
      <CheckoutInterstitial isVisible={isProcessing} message="Taking you to secure payment" />

      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 md:top-24 inset-x-5 md:inset-x-auto md:right-10 z-[110] md:w-full md:max-w-sm bg-[#fff] border border-black/15 shadow-[0_18px_50px_rgba(20,18,12,.14)] p-5"
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-medium text-red-700">Something went wrong</p>
                <p className="text-sm text-stone mt-1">{error}</p>
              </div>
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss"><X size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-[40px] md:text-[64px] leading-none font-semibold mb-6 md:mb-12">Checkout</h1>

      {narrow && (
        <div className="bg-paper mb-8 max-md:mb-2 max-md:rounded-2xl max-md:overflow-hidden max-md:bg-[#fff]">
          <button type="button" onClick={() => setShowItems(v => !v)} aria-expanded={showItems} className="w-full flex items-center justify-between px-4 py-4 text-sm">
            <span className="font-medium">{showItems ? 'Hide' : 'Show'} your order · {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
            <span className="font-semibold">₹{money(orderTotal)}</span>
          </button>
          {showItems && <div className="px-4 pb-2 bg-[#fff] border-x border-b border-paper">{orderLines}</div>}
        </div>
      )}

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-16">
        <div className="lg:col-span-7 space-y-2 md:space-y-12">

          {/* CONTACT */}
          <section id="identity-section" className="max-md:bg-[#fff] max-md:rounded-2xl max-md:p-4">
            {heading(1, 'Contact', identityComplete && !showIdentityForm ? (
              <button type="button" onClick={() => setIsEditingIdentity(true)} className="text-sm underline underline-offset-4 cursor-pointer">Edit</button>
            ) : undefined)}
            {!showIdentityForm ? (
              <div className="text-sm leading-relaxed border-t border-black/10 pt-4">
                <p className="font-medium">{formData.firstName} {formData.lastName || ''}</p>
                <p className="text-stone">{formData.email}</p>
                <p className="text-stone">+91 {formData.phone}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" name="firstName" required value={formData.firstName} onChange={handleInputChange} autoComplete="given-name" />
                  <Field label="Last name" name="lastName" value={formData.lastName} onChange={handleInputChange} autoComplete="family-name" />
                  <Field label="Email" name="email" type="email" required value={formData.email} onChange={handleInputChange} autoComplete="email" />
                  <Field label="Phone" name="phone" type="tel" required prefix="+91" maxLength={10} value={formData.phone} onChange={handlePhoneInputChange} autoComplete="tel-national"
                    hint={formData.phone && formData.phone.length < 10 ? 'Enter all 10 digits' : undefined} />
                </div>
                {identityComplete && (
                  <button type="button" onClick={() => setIsEditingIdentity(false)} className="mt-4 text-sm underline underline-offset-4 cursor-pointer">Done</button>
                )}
              </>
            )}
          </section>

          {/* DELIVERY */}
          <section className="max-md:bg-[#fff] max-md:rounded-2xl max-md:p-4">
            {heading(2, 'Delivery')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                ['delivery', 'Home delivery', `₹${deliveryFee()}`, 'Delivered to your address.'],
                ['pickup', 'Collect in store', 'Free', 'Miyapur, Hyderabad. Ready within 24 hours.'],
              ] as const).map(([id, title, price, note]) => (
                <button
                  key={id} type="button" onClick={() => setShippingMethod(id)} aria-pressed={shippingMethod === id}
                  className={`p-4 border text-left transition-colors cursor-pointer ${shippingMethod === id ? 'border-ink ring-1 ring-ink' : 'border-black/15 hover:border-black/40'}`}
                >
                  <span className="flex justify-between gap-3 font-medium text-sm"><span>{title}</span><span>{price}</span></span>
                  <span className="block text-sm text-stone mt-1">{note}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ADDRESS / STORE */}
          {shippingMethod === 'delivery' ? (
            <section id="coordinates-section" className={coordinatesFlash ? 'coordinates-flash' : ''}>
              {heading(3, 'Delivery address', addresses.length > 0 && !showAddressForm ? (
                <button
                  type="button"
                  onClick={() => { setShowAddressForm(true); setEditingAddressId(null); setAddressFormData({ label: '', type: 'home', address: '', city: '', state: '', pincode: '', phone: '' }); }}
                  className="text-sm underline underline-offset-4 cursor-pointer"
                >
                  Add new
                </button>
              ) : undefined)}
              {coordinatesFlash && <p className="text-sm text-red-700 -mt-3 mb-3">Please add a delivery address.</p>}

              {!showAddressForm ? (
                addresses.length === 0 ? (
                  <button type="button" onClick={() => setShowAddressForm(true)} className="w-full border border-black/15 hover:border-ink transition-colors py-5 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer">
                    <Plus size={15} /> Add a delivery address
                  </button>
                ) : (
                  <div className="space-y-3" role="radiogroup" aria-label="Delivery address">
                    {addresses.map(addr => {
                      const on = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id} role="radio" aria-checked={on} tabIndex={0}
                          onClick={() => setSelectedAddressId(addr.id)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAddressId(addr.id); } }}
                          className={`p-4 border flex items-start gap-3 cursor-pointer transition-colors ${on ? 'border-ink ring-1 ring-ink' : 'border-black/15 hover:border-black/40'}`}
                        >
                          <span className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${on ? 'border-ink' : 'border-black/30'}`}>
                            {on && <span className="w-2 h-2 rounded-full bg-ink" />}
                          </span>
                          <div className="flex-1 min-w-0 text-sm">
                            <p className="font-medium capitalize">{addr.label}{addr.phone && <span className="text-stone font-normal ml-2">+91 {addr.phone}</span>}</p>
                            <p className="text-stone mt-0.5">{addr.address}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.pincode}</p>
                          </div>
                          <div className="flex gap-3 text-xs text-stone shrink-0">
                            <button type="button" onClick={e => { e.stopPropagation(); handleEditAddress(addr); }} className="underline underline-offset-4 hover:text-ink cursor-pointer">Edit</button>
                            <button type="button" onClick={e => { e.stopPropagation(); deleteAddress(addr.id); }} className="underline underline-offset-4 hover:text-red-700 cursor-pointer">Remove</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="border-t border-black/10 pt-5">
                  <div className="flex gap-2 mb-4">
                    {(['home', 'work', 'other'] as const).map(t => (
                      <button key={t} type="button" aria-pressed={addressFormData.type === t} onClick={() => setAddressFormData(prev => ({ ...prev, type: t }))}
                        className={`px-4 h-10 text-sm capitalize border cursor-pointer ${addressFormData.type === t ? 'bg-ink text-[#fff] border-ink' : 'border-black/15 hover:border-black/40'}`}>{t}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addressFormData.type === 'other' && (
                      <div className="sm:col-span-2"><Field label="Label" name="label" value={addressFormData.label} onChange={handleAddressInputChange} placeholder="e.g. Studio, Hostel" /></div>
                    )}
                    <div className="sm:col-span-2"><Field label="Address" name="address" required value={addressFormData.address} onChange={handleAddressInputChange} placeholder="Flat, building, street" autoComplete="street-address" /></div>
                    <Field label="City" name="city" required value={addressFormData.city} onChange={handleAddressInputChange} autoComplete="address-level2" />
                    <Field label="State" name="state" value={addressFormData.state} onChange={handleAddressInputChange} autoComplete="address-level1" />
                    <Field label="Pincode" name="pincode" required inputMode="numeric" value={addressFormData.pincode} onChange={handleAddressInputChange} autoComplete="postal-code" />
                    <Field label="Phone for delivery (optional)" name="phone" type="tel" prefix="+91" maxLength={10} value={addressFormData.phone} onChange={handleAddressInputChange} />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button type="button" onClick={saveAddress} className="bg-ink text-[#fff] px-7 py-3.5 text-sm font-medium cursor-pointer">Save address</button>
                    <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} className="border border-black/20 px-7 py-3.5 text-sm cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="max-md:bg-[#fff] max-md:rounded-2xl max-md:p-4">
              {heading(3, 'Collection store')}
              <div className="text-sm border-t border-black/10 pt-4 leading-relaxed">
                <p className="font-medium">CHILS &amp; CO. Store</p>
                <p className="text-stone">3rd Floor, Plot No. 38 &amp; 39, Matrusri Nagar, Miyapur<br />Hyderabad, Telangana 500049</p>
                <p className="text-stone">Mon–Sat, 10 AM – 6 PM IST</p>
                <a href="https://share.google/IwXCYyuX7MlF1tCt2" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 underline underline-offset-4">View on map</a>
              </div>
            </section>
          )}

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

        {/* ORDER */}
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 lg:bg-paper lg:p-8 max-lg:bg-[#fff] max-lg:rounded-2xl max-lg:p-4">
            {!narrow && (
              <>
                <h2 className="text-xl font-semibold mb-1">Your order</h2>
                <div className="max-h-[38vh] overflow-y-auto pr-1 -mr-1" data-lenis-prevent>{orderLines}</div>
              </>
            )}

            <dl className="text-sm space-y-2.5 border-t border-black/10 pt-4 lg:mt-1">
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>₹{totalPrice.toLocaleString()}</dd></div>
              {coupon && (
                <div className="flex justify-between">
                  <dt className="text-stone">
                    Code <span className="uppercase text-ink">{coupon.code}</span>
                    <button type="button" onClick={() => setCoupon(null)} className="ml-2 text-xs underline underline-offset-2 cursor-pointer">Remove</button>
                  </dt>
                  <dd>−₹{money(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between"><dt className="text-stone">{shippingMethod === 'delivery' ? 'Delivery' : 'Collect in store'}</dt><dd>{shippingMethod === 'delivery' ? `₹${getShippingFee()}` : 'Free'}</dd></div>
              <div className="flex justify-between items-baseline pt-3 border-t border-black/10">
                <dt className="font-medium">Total</dt>
                <dd className="text-2xl font-semibold">₹{money(orderTotal)}</dd>
              </div>
            </dl>

            {!coupon && !hasSet && (
              <div className="mt-4">
                {!codeOpen ? (
                  <button type="button" onClick={() => setCodeOpen(true)} className="text-xs text-stone underline underline-offset-2 hover:text-ink cursor-pointer">Have a code?</button>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={codeInput}
                        onChange={e => { setCodeInput(e.target.value); setCodeError(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCode(); } }}
                        placeholder="Enter your code"
                        aria-label="Code"
                        autoFocus
                        className="flex-1 min-w-0 h-11 px-3 bg-[#fff] border border-black/20 focus:border-ink outline-none text-[16px] text-ink uppercase placeholder:normal-case placeholder:text-black/35"
                      />
                      <button type="button" onClick={applyCode} disabled={codeChecking || !codeInput.trim()} className="px-5 h-11 bg-ink text-[#fff] text-sm disabled:opacity-40 cursor-pointer">{codeChecking ? '…' : 'Apply'}</button>
                    </div>
                    {codeError && <p role="alert" className="text-xs text-red-700 mt-2">{codeError}</p>}
                  </>
                )}
              </div>
            )}

            <p className="text-xs text-stone mt-4 flex gap-2">
              <Package size={14} className="shrink-0 mt-px" />
              {totalItemCount >= 2
                ? 'Your order ships in our reusable Second Life box.'
                : 'Ships in a biodegradable bag. Add one more tee for our reusable Second Life box.'}
            </p>

            <button type="submit" disabled={isProcessing} className="mt-5 w-full bg-ink text-[#fff] py-4 text-[15px] font-medium flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
              <Lock size={15} /> {isProcessing ? 'Processing…' : `Pay ₹${money(orderTotal)}`}
            </button>
            <p className="text-xs text-stone text-center mt-3">You'll complete payment securely on PhonePe.</p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
