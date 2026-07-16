import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingBag, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useCart } from '../CartContext';
import { Product } from '../types';
import SEO from '../components/SEO';
import confetti from 'canvas-confetti';

interface ComboSelection {
  product: Product;
  selectedSize: string;
  selectedColor: string;
}

const Combos: React.FC = () => {
  const { addComboToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [comboProducts, setComboProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCombo, setActiveCombo] = useState<Product | null>(null);

  // Customizer selections
  const [tee1, setTee1] = useState<ComboSelection | null>(null); // Black
  const [tee2, setTee2] = useState<ComboSelection | null>(null); // Light
  const [tee3, setTee3] = useState<ComboSelection | null>(null); // Dark

  // Active slot in customizer drawer (0: Tee 1, 1: Tee 2, 2: Tee 3)
  const [activeSlot, setActiveSlot] = useState<number>(0);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.filter((p) => !p.id.startsWith('combo-')));
          setComboProducts(data.filter((p) => p.id.startsWith('combo-')));
        }
      })
      .catch((err) => console.error('Error fetching products for combos:', err))
      .finally(() => setLoading(false));
  }, []);

  // Map combo products to their respective individual tee price tiers
  const getPriceTierForCombo = (comboId: string): number => {
    if (comboId.includes('349')) return 349;
    if (comboId.includes('399')) return 399;
    if (comboId.includes('419')) return 419;
    if (comboId.includes('449')) return 449;
    if (comboId.includes('549')) return 549;
    if (comboId.includes('599')) return 599;
    return 349;
  };

  // Classify a product color palette based on heuristics & exact matching
  const classifyProduct = (productName: string): 'black' | 'light' | 'dark' => {
    const name = productName.toLowerCase().trim();

    if (
      name.includes('kernal panic') ||
      name.includes('vlsi') ||
      name.includes('power cycle') ||
      name.includes('dark mode') ||
      name.includes('production ready') ||
      name.includes('git cardio') ||
      name.includes('chils & co') ||
      name.includes('heartbeat') ||
      name.includes('black box') ||
      name.includes('low logic') ||
      name.includes('black') ||
      name.includes('charcoal')
    ) {
      return 'black';
    }

    if (
      name.includes('cold reset') ||
      name.includes('ambient noise') ||
      name.includes('friendchip 2.0') ||
      name.includes('friendchip 2') ||
      name.includes('friendchip v2') ||
      name.includes('forest protocol') ||
      name.includes('vs code-alpha') ||
      name.includes('code-alpha') ||
      name.includes('static logic') ||
      name.includes('clock gating') ||
      name.includes('clean code') ||
      name.includes('cream') ||
      name.includes('white') ||
      name.includes('light')
    ) {
      return 'light';
    }

    return 'dark'; // Fallback for other items (maroon, navy, green, grey, brown)
  };

  // Extract products belonging to the active combo's price tier
  const getPoolForActiveCombo = () => {
    if (!activeCombo) return { blackList: [], lightList: [], darkList: [] };
    const tierPrice = getPriceTierForCombo(activeCombo.id);
    const tierProducts = products.filter((p) => p.price === tierPrice);

    const blackList: Product[] = [];
    const lightList: Product[] = [];
    const darkList: Product[] = [];

    tierProducts.forEach((p) => {
      const type = classifyProduct(p.name);
      if (type === 'black') blackList.push(p);
      else if (type === 'light') lightList.push(p);
      else darkList.push(p);
    });

    // Fallbacks if one categories is empty (so the combo system doesn't break)
    if (blackList.length === 0 && tierProducts.length > 0) blackList.push(tierProducts[0]);
    if (lightList.length === 0 && tierProducts.length > 0) lightList.push(tierProducts[0]);
    if (darkList.length === 0 && tierProducts.length > 0) darkList.push(tierProducts[0]);

    return { blackList, lightList, darkList };
  };

  const { blackList, lightList, darkList } = getPoolForActiveCombo();

  const handleOpenCustomizer = (combo: Product) => {
    setActiveCombo(combo);
    setTee1(null);
    setTee2(null);
    setTee3(null);
    setActiveSlot(0);
  };

  const handleCloseCustomizer = () => {
    setActiveCombo(null);
    setTee1(null);
    setTee2(null);
    setTee3(null);
  };

  const handleSelectProduct = (product: Product, slotIndex: number) => {
    const size = product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : 'M';
    const color = product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : 'Default';

    const selection: ComboSelection = { product, selectedSize: size, selectedColor: color };

    if (slotIndex === 0) setTee1(selection);
    if (slotIndex === 1) setTee2(selection);
    if (slotIndex === 2) setTee3(selection);
  };

  const handleSelectSize = (size: string, slotIndex: number) => {
    if (slotIndex === 0 && tee1) setTee1({ ...tee1, selectedSize: size });
    if (slotIndex === 1 && tee2) setTee2({ ...tee2, selectedSize: size });
    if (slotIndex === 2 && tee3) setTee3({ ...tee3, selectedSize: size });
  };

  const handleAddComboToBag = () => {
    if (!activeCombo || !tee1 || !tee2 || !tee3) return;

    const items = [
      {
        id: tee1.product.id,
        name: tee1.product.name,
        selectedSize: tee1.selectedSize,
        selectedColor: tee1.selectedColor,
        image: tee1.product.images[0] || '',
        price: tee1.product.price,
      },
      {
        id: tee2.product.id,
        name: tee2.product.name,
        selectedSize: tee2.selectedSize,
        selectedColor: tee2.selectedColor,
        image: tee2.product.images[0] || '',
        price: tee2.product.price,
      },
      {
        id: tee3.product.id,
        name: tee3.product.name,
        selectedSize: tee3.selectedSize,
        selectedColor: tee3.selectedColor,
        image: tee3.product.images[0] || '',
        price: tee3.product.price,
      },
    ];

    addComboToCart(activeCombo, items);

    // Premium celebration animation
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00FF66', '#FFFFFF', '#111111'],
    });

    handleCloseCustomizer();
  };

  const isComboComplete = tee1 !== null && tee2 !== null && tee3 !== null;

  return (
    <div className="pt-36 md:pt-40 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SEO
        title="Combo Stacks | CHILS & CO."
        description="Construct your premium 3-tee rotation. Choose 1 Black, 1 Light, and 1 Dark tee at curated prices."
      />

      <header className="mb-16 border-b border-neutral-900 pb-8">
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-4 uppercase">
          SYSTEM STACKS
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 font-mono tracking-wider max-w-xl">
          THREE ESSENTIALS. CURATED BY LOGIC. COMBINED FOR A REDUCED RUNTIME PRICE.
          ONE BLACK / ONE LIGHT / ONE DARK IN EVERY BUILD.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          <span className="text-[10px] tracking-[0.25em] font-mono text-neutral-500 uppercase">
            COMPILING CATALOG LAYOUT...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comboProducts.map((combo) => {
            const originalPrice = getPriceTierForCombo(combo.id) * 3;
            const savings = originalPrice - combo.price;

            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-950 hover:border-neutral-800 transition-all duration-500 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden mb-6 aspect-[4/5] bg-neutral-900 border border-neutral-900 group-hover:border-neutral-800 transition-all duration-500">
                    <img
                      src={combo.images[0]}
                      alt={combo.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-black/90 border border-neutral-850 px-3 py-1 font-mono text-[9px] tracking-widest text-accent uppercase font-bold">
                      SAVE ₹{savings}
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-lg tracking-tight uppercase group-hover:text-white transition-colors">
                      {combo.name}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-base font-bold text-white">₹{combo.price}</span>
                      <span className="font-mono text-[10px] text-neutral-600 line-through">₹{originalPrice}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 font-mono tracking-wide mb-6 leading-relaxed">
                    {combo.shortDescription}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenCustomizer(combo)}
                  className="w-full text-center text-[10px] font-mono tracking-[0.25em] font-bold uppercase py-4 border border-neutral-800 hover:border-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer active:scale-[0.98]"
                >
                  CONSTRUCT STACK
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN CUSTOMIZER DRAWER */}
      <AnimatePresence>
        {activeCombo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm"
          >
            {/* Click-out blocker */}
            <div className="absolute inset-0 cursor-default" onClick={handleCloseCustomizer} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-4xl h-full bg-black border-l border-neutral-900 flex flex-col md:flex-row z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseCustomizer}
                className="absolute top-6 right-6 p-2 rounded-full border border-neutral-800 hover:border-white text-neutral-500 hover:text-white transition-all duration-300 cursor-pointer z-50 active:scale-95"
              >
                <X size={16} />
              </button>

              {/* LEFT SIDE: PREVIEW CONTAINER */}
              <div className="w-full md:w-1/2 h-2/5 md:h-full bg-neutral-950 border-b md:border-b-0 md:border-r border-neutral-900 p-8 flex flex-col justify-between relative">
                <div>
                  <span className="text-[10px] tracking-[0.25em] font-mono text-accent uppercase font-bold">
                    SYSTEM SELECTION PREVIEW
                  </span>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white mt-2">
                    {activeCombo.name}
                  </h2>
                  <p className="font-mono text-xs text-neutral-500 mt-1">₹{activeCombo.price} Stack Build</p>
                </div>

                {/* Stack Visual mockups */}
                <div className="flex-grow flex items-center justify-center py-6">
                  <div className="flex flex-col -space-y-16 md:-space-y-24 w-44 md:w-56 transition-all duration-500">
                    {/* Tee 3 (Dark) - Top */}
                    <div className="relative group/slot z-30 transition-transform hover:-translate-y-4 duration-300">
                      <div
                        className={`aspect-[4/5] bg-neutral-900 border overflow-hidden shadow-2xl transition-all duration-300 ${
                          activeSlot === 2 ? 'border-accent scale-105' : 'border-neutral-850 opacity-90'
                        }`}
                        onClick={() => setActiveSlot(2)}
                      >
                        {tee3 ? (
                          <img
                            src={tee3.product.images[0]}
                            alt={tee3.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-[9px] font-mono tracking-[0.2em] font-bold text-neutral-600 uppercase">
                              SLOT 3: DARK TEE
                            </span>
                            <span className="text-[8px] font-mono text-neutral-700">EMPTY CONFIG</span>
                          </div>
                        )}
                      </div>
                      {tee3 && (
                        <div className="absolute bottom-3 left-3 bg-black/90 px-2 py-0.5 font-mono text-[7px] tracking-wider text-white border border-neutral-850">
                          {tee3.product.name.substring(0, 15)}... ({tee3.selectedSize})
                        </div>
                      )}
                    </div>

                    {/* Tee 2 (Light) - Middle */}
                    <div className="relative group/slot z-20 transition-transform hover:-translate-y-4 duration-300">
                      <div
                        className={`aspect-[4/5] bg-neutral-900 border overflow-hidden shadow-2xl transition-all duration-300 ${
                          activeSlot === 1 ? 'border-accent scale-105' : 'border-neutral-850 opacity-90'
                        }`}
                        onClick={() => setActiveSlot(1)}
                      >
                        {tee2 ? (
                          <img
                            src={tee2.product.images[0]}
                            alt={tee2.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-[9px] font-mono tracking-[0.2em] font-bold text-neutral-600 uppercase">
                              SLOT 2: LIGHT TEE
                            </span>
                            <span className="text-[8px] font-mono text-neutral-700">EMPTY CONFIG</span>
                          </div>
                        )}
                      </div>
                      {tee2 && (
                        <div className="absolute bottom-3 left-3 bg-black/90 px-2 py-0.5 font-mono text-[7px] tracking-wider text-white border border-neutral-850">
                          {tee2.product.name.substring(0, 15)}... ({tee2.selectedSize})
                        </div>
                      )}
                    </div>

                    {/* Tee 1 (Black) - Bottom */}
                    <div className="relative group/slot z-10 transition-transform hover:-translate-y-4 duration-300">
                      <div
                        className={`aspect-[4/5] bg-neutral-900 border overflow-hidden shadow-2xl transition-all duration-300 ${
                          activeSlot === 0 ? 'border-accent scale-105' : 'border-neutral-850 opacity-90'
                        }`}
                        onClick={() => setActiveSlot(0)}
                      >
                        {tee1 ? (
                          <img
                            src={tee1.product.images[0]}
                            alt={tee1.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-[9px] font-mono tracking-[0.2em] font-bold text-neutral-600 uppercase">
                              SLOT 1: BLACK TEE
                            </span>
                            <span className="text-[8px] font-mono text-neutral-700">EMPTY CONFIG</span>
                          </div>
                        )}
                      </div>
                      {tee1 && (
                        <div className="absolute bottom-3 left-3 bg-black/90 px-2 py-0.5 font-mono text-[7px] tracking-wider text-white border border-neutral-850">
                          {tee1.product.name.substring(0, 15)}... ({tee1.selectedSize})
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-neutral-600 text-center tracking-wider mt-4">
                  * CLICK ANY SLOT IN THE PREVIEW TO EDIT ITS CONFIGURATION
                </div>
              </div>

              {/* RIGHT SIDE: CONFIGURATION CONTROLS */}
              <div className="w-full md:w-1/2 h-3/5 md:h-full flex flex-col justify-between bg-black p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-col gap-6">
                  {/* Slot selection buttons */}
                  <div className="grid grid-cols-3 gap-2 border-b border-neutral-900 pb-6 mt-8 md:mt-0">
                    {[
                      { label: '1. BLACK TEE', selection: tee1 },
                      { label: '2. LIGHT TEE', selection: tee2 },
                      { label: '3. DARK TEE', selection: tee3 },
                    ].map((slot, index) => {
                      const isActive = activeSlot === index;
                      const isFilled = slot.selection !== null;
                      return (
                        <button
                          key={index}
                          onClick={() => setActiveSlot(index)}
                          className={`text-center py-3 border font-mono text-[9px] tracking-widest font-bold uppercase transition-all duration-300 cursor-pointer ${
                            isActive
                              ? 'bg-white text-black border-white'
                              : isFilled
                              ? 'text-accent border-neutral-800 bg-neutral-950'
                              : 'text-neutral-500 border-neutral-900 bg-neutral-950/20'
                          }`}
                        >
                          {slot.label}
                          {isFilled && <Check size={10} className="inline ml-1.5 align-text-top" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* ACTIVE SLOT DETAILS AND PRODUCTS POOL */}
                  <div>
                    <span className="text-[9px] tracking-[0.25em] font-mono text-neutral-500 uppercase font-bold">
                      {activeSlot === 0 && 'STEP 1: CONFIGURING BLACK TEE'}
                      {activeSlot === 1 && 'STEP 2: CONFIGURING LIGHT TEE'}
                      {activeSlot === 2 && 'STEP 3: CONFIGURING DARK TEE'}
                    </span>

                    {/* POOL LIST */}
                    <div className="mt-4 grid grid-cols-2 gap-4 max-h-[220px] md:max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                      {activeSlot === 0 &&
                        blackList.map((p) => {
                          const isSelected = tee1?.product.id === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(p, 0)}
                              className={`border p-2 cursor-pointer transition-all duration-300 flex items-center gap-3 relative ${
                                isSelected ? 'border-accent bg-neutral-950' : 'border-neutral-900 bg-neutral-950/20 hover:border-neutral-800'
                              }`}
                            >
                              <img src={p.images[0]} alt={p.name} className="w-12 h-15 object-cover bg-neutral-900" />
                              <span className="font-display text-[10px] tracking-tight uppercase text-white font-bold leading-tight truncate pr-4">
                                {p.name}
                              </span>
                              {isSelected && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full" />}
                            </div>
                          );
                        })}

                      {activeSlot === 1 &&
                        lightList.map((p) => {
                          const isSelected = tee2?.product.id === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(p, 1)}
                              className={`border p-2 cursor-pointer transition-all duration-300 flex items-center gap-3 relative ${
                                isSelected ? 'border-accent bg-neutral-950' : 'border-neutral-900 bg-neutral-950/20 hover:border-neutral-800'
                              }`}
                            >
                              <img src={p.images[0]} alt={p.name} className="w-12 h-15 object-cover bg-neutral-900" />
                              <span className="font-display text-[10px] tracking-tight uppercase text-white font-bold leading-tight truncate pr-4">
                                {p.name}
                              </span>
                              {isSelected && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full" />}
                            </div>
                          );
                        })}

                      {activeSlot === 2 &&
                        darkList.map((p) => {
                          const isSelected = tee3?.product.id === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(p, 2)}
                              className={`border p-2 cursor-pointer transition-all duration-300 flex items-center gap-3 relative ${
                                isSelected ? 'border-accent bg-neutral-950' : 'border-neutral-900 bg-neutral-950/20 hover:border-neutral-800'
                              }`}
                            >
                              <img src={p.images[0]} alt={p.name} className="w-12 h-15 object-cover bg-neutral-900" />
                              <span className="font-display text-[10px] tracking-tight uppercase text-white font-bold leading-tight truncate pr-4">
                                {p.name}
                              </span>
                              {isSelected && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full" />}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* SIZE SELECTOR FOR ACTIVE SLOT */}
                  <AnimatePresence mode="wait">
                    {((activeSlot === 0 && tee1) || (activeSlot === 1 && tee2) || (activeSlot === 2 && tee3)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="border-t border-neutral-900 pt-6"
                      >
                        <span className="text-[9px] tracking-[0.25em] font-mono text-neutral-500 uppercase font-bold">
                          SELECT SIZE FOR:{' '}
                          <span className="text-white">
                            {activeSlot === 0 && tee1?.product.name}
                            {activeSlot === 1 && tee2?.product.name}
                            {activeSlot === 2 && tee3?.product.name}
                          </span>
                        </span>

                        <div className="flex gap-2.5 mt-3">
                          {(activeSlot === 0 ? tee1?.product.availableSizes || ['S', 'M', 'L', 'XL'] :
                            activeSlot === 1 ? tee2?.product.availableSizes || ['S', 'M', 'L', 'XL'] :
                            tee3?.product.availableSizes || ['S', 'M', 'L', 'XL']).map((size) => {
                            const currentSelection = activeSlot === 0 ? tee1 : activeSlot === 1 ? tee2 : tee3;
                            const isSelected = currentSelection?.selectedSize === size;
                            return (
                              <button
                                key={size}
                                onClick={() => handleSelectSize(size, activeSlot)}
                                className={`h-11 w-11 flex items-center justify-center border font-mono text-xs font-bold transition-all duration-300 cursor-pointer ${
                                  isSelected
                                    ? 'bg-accent border-accent text-black font-extrabold'
                                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-500'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BOTTOM BUTTON ACTION */}
                <div className="border-t border-neutral-900 pt-6 mt-6">
                  {isComboComplete ? (
                    <button
                      onClick={handleAddComboToBag}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-accent hover:bg-accent/90 text-black font-mono text-[10px] tracking-[0.3em] font-bold uppercase transition-all duration-300 cursor-pointer active:scale-98 shadow-[0_0_20px_rgba(0,255,102,0.15)]"
                    >
                      <ShoppingBag size={14} className="stroke-[2.5px]" />
                      ADD STACK TO BAG
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Automatically advance to first unconfigured slot
                        if (!tee1) setActiveSlot(0);
                        else if (!tee2) setActiveSlot(1);
                        else if (!tee3) setActiveSlot(2);
                      }}
                      className="w-full flex items-center justify-center gap-3 py-5 bg-neutral-900 text-neutral-500 border border-neutral-800 font-mono text-[10px] tracking-[0.3em] font-bold uppercase transition-all duration-300 cursor-pointer active:scale-98"
                    >
                      SELECT ALL ITEMS
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Combos;
