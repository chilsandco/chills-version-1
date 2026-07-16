import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingBag, Loader2, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useCart } from '../CartContext';
import { Product } from '../types';
import SEO from '../components/SEO';
import confetti from 'canvas-confetti';

interface PredefinedCombo {
  id: string; // e.g. "combo-349-a"
  comboProductId: string; // e.g. "combo-349"
  stackName: string; // e.g. "CORE STACK"
  name: string; // e.g. "COMBO A"
  price: number; // e.g. 999
  description: string;
  teeNames: {
    black: string;
    light: string;
    dark: string;
  };
}

const PREDEFINED_COMBOS: PredefinedCombo[] = [
  // ₹349 tier (Core Stack)
  {
    id: 'combo-349-a',
    comboProductId: 'combo-349',
    stackName: 'CORE STACK',
    name: 'COMBO A',
    price: 999,
    description: 'Kernal Panic (Black) + Cold Reset (Light Blue) + Evergreen Loop (Dark Green)',
    teeNames: { black: 'Kernal Panic', light: 'Cold Reset', dark: 'Evergreen Loop' }
  },
  {
    id: 'combo-349-b',
    comboProductId: 'combo-349',
    stackName: 'CORE STACK',
    name: 'COMBO B',
    price: 999,
    description: 'Kernal Panic (Black) + Ambient Noise (Light Grey) + Red Shift (Maroon)',
    teeNames: { black: 'Kernal Panic', light: 'Ambient Noise', dark: 'Red Shift' }
  },
  {
    id: 'combo-349-c',
    comboProductId: 'combo-349',
    stackName: 'CORE STACK',
    name: 'COMBO C',
    price: 999,
    description: 'Kernal Panic (Black) + Cold Reset (Light Blue) + Carbon Layer (Charcoal)',
    teeNames: { black: 'Kernal Panic', light: 'Cold Reset', dark: 'Carbon Layer' }
  },

  // ₹399 tier (Everyday Stack)
  {
    id: 'combo-399-a',
    comboProductId: 'combo-399',
    stackName: 'EVERYDAY STACK',
    name: 'COMBO A',
    price: 1099,
    description: 'Power Cycle (Black) + Friendchip 2.0 (Blue) + Forest Original (Dark Green)',
    teeNames: { black: 'Power Cycle', light: 'Friendchip 2.0', dark: 'Forest Original' }
  },
  {
    id: 'combo-399-b',
    comboProductId: 'combo-399',
    stackName: 'EVERYDAY STACK',
    name: 'COMBO B',
    price: 1099,
    description: 'VLSI Engineer Brain (Black) + Friendchip 2.0 (Blue) + Just Chill (Maroon)',
    teeNames: { black: 'VLSI Engineer Brain', light: 'Friendchip 2.0', dark: 'Just Chill' }
  },

  // ₹419 tier (Oversized Stack)
  {
    id: 'combo-419-a',
    comboProductId: 'combo-419',
    stackName: 'OVERSIZED STACK',
    name: 'COMBO A',
    price: 1149,
    description: 'Dark Mode (Black) + Forest Protocol (Sage Green) + Copper Core (Copper Brown)',
    teeNames: { black: 'Dark Mode', light: 'Forest Protocol', dark: 'Copper Core' }
  },
  {
    id: 'combo-419-b',
    comboProductId: 'combo-419',
    stackName: 'OVERSIZED STACK',
    name: 'COMBO B',
    price: 1149,
    description: 'Production Ready (Black) + Forest Protocol (Sage Green) + Static Instance (Charcoal)',
    teeNames: { black: 'Production Ready', light: 'Forest Protocol', dark: 'Static Instance' }
  },

  // ₹449 tier (Creator Stack)
  {
    id: 'combo-449-a',
    comboProductId: 'combo-449',
    stackName: 'CREATOR STACK',
    name: 'COMBO A',
    price: 1249,
    description: 'HEARTBEAT (Black) + VS CODE-ALPHA (Grey) + Universal Serial Builder (Dark Brown)',
    teeNames: { black: 'HEARTBEAT', light: 'VS CODE-ALPHA', dark: 'Universal Serial Builder' }
  },
  {
    id: 'combo-449-b',
    comboProductId: 'combo-449',
    stackName: 'CREATOR STACK',
    name: 'COMBO B',
    price: 1249,
    description: 'GIT CARDIO (Black) + VS CODE-ALPHA (Grey) + NO CHILS (Brown)',
    teeNames: { black: 'GIT CARDIO', light: 'VS CODE-ALPHA', dark: 'NO CHILS' }
  },
  {
    id: 'combo-449-c',
    comboProductId: 'combo-449',
    stackName: 'CREATOR STACK',
    name: 'COMBO C',
    price: 1249,
    description: 'CHILS & CO. (Black) + VS CODE-ALPHA (Grey) + SPRINT GAMES (Dark Grey)',
    teeNames: { black: 'CHILS & CO.', light: 'VS CODE-ALPHA', dark: 'SPRINT GAMES' }
  },

  // ₹549 tier (Polo Stack)
  {
    id: 'combo-549-a',
    comboProductId: 'combo-549',
    stackName: 'POLO STACK',
    name: 'COMBO A',
    price: 1499,
    description: 'Black Box (Black) + Static Logic (Royal Blue) + Bitwise Navy (Navy)',
    teeNames: { black: 'Black Box', light: 'Static Logic', dark: 'Bitwise Navy' }
  },
  {
    id: 'combo-549-b',
    comboProductId: 'combo-549',
    stackName: 'POLO STACK',
    name: 'COMBO B',
    price: 1499,
    description: 'Black Box (Black) + Clock Gating (Red) + Silicon Lattice (Charcoal)',
    teeNames: { black: 'Black Box', light: 'Clock Gating', dark: 'Silicon Lattice' }
  },

  // ₹599 tier (TwinTex Stack)
  {
    id: 'combo-599-a',
    comboProductId: 'combo-599',
    stackName: 'TWINTEX STACK',
    name: 'COMBO A',
    price: 1649,
    description: 'Low Logic (Black) + Clean Code (Cream) + Nexus Navy (Navy)',
    teeNames: { black: 'Low Logic', light: 'Clean Code', dark: 'Nexus Navy' }
  },
  {
    id: 'combo-599-b',
    comboProductId: 'combo-599',
    stackName: 'TWINTEX STACK',
    name: 'COMBO B',
    price: 1649,
    description: 'Low Logic (Black) + Clean Code (Cream) + Forest Green (Green)',
    teeNames: { black: 'Low Logic', light: 'Clean Code', dark: 'Forest Green' }
  }
];

const Combos: React.FC = () => {
  const { addComboToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [comboMainProducts, setComboMainProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCombo, setActiveCombo] = useState<PredefinedCombo | null>(null);

  // Size selections for the three shirts in the active predefined combo
  const [size1, setSize1] = useState<string>('M'); // Black
  const [size2, setSize2] = useState<string>('M'); // Light
  const [size3, setSize3] = useState<string>('M'); // Dark

  // Accordion state for design stories inside the customizer drawer
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.filter((p) => !p.id.startsWith('combo-')));
          setComboMainProducts(data.filter((p) => p.id.startsWith('combo-')));
        }
      })
      .catch((err) => console.error('Error loading products for combos:', err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to find a product in WooCommerce catalog matching a name
  const findProductByName = (name: string): Product | undefined => {
    return products.find((p) => p.name.toLowerCase().trim().includes(name.toLowerCase().trim()));
  };

  const handleOpenCustomizer = (combo: PredefinedCombo) => {
    setActiveCombo(combo);
    setSize1('M');
    setSize2('M');
    setSize3('M');
    setOpenStoryIndex(null);
  };

  const handleCloseCustomizer = () => {
    setActiveCombo(null);
  };

  const handleAddComboToBag = () => {
    if (!activeCombo) return;

    const mainProduct = comboMainProducts.find(p => p.id === activeCombo.comboProductId);
    if (!mainProduct) return;

    const tee1 = findProductByName(activeCombo.teeNames.black);
    const tee2 = findProductByName(activeCombo.teeNames.light);
    const tee3 = findProductByName(activeCombo.teeNames.dark);

    const items = [
      {
        id: tee1?.id || 't1',
        name: tee1?.name || activeCombo.teeNames.black,
        selectedSize: size1,
        selectedColor: 'Black',
        image: tee1?.images[0] || '',
        price: tee1?.price || 349
      },
      {
        id: tee2?.id || 't2',
        name: tee2?.name || activeCombo.teeNames.light,
        selectedSize: size2,
        selectedColor: 'Light Colorway',
        image: tee2?.images[0] || '',
        price: tee2?.price || 349
      },
      {
        id: tee3?.id || 't3',
        name: tee3?.name || activeCombo.teeNames.dark,
        selectedSize: size3,
        selectedColor: 'Dark Colorway',
        image: tee3?.images[0] || '',
        price: tee3?.price || 349
      }
    ];

    addComboToCart(mainProduct, items);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#FFFFFF', '#000000']
    });

    handleCloseCustomizer();
  };

  const toggleStoryAccordion = (index: number) => {
    setOpenStoryIndex(openStoryIndex === index ? null : index);
  };

  return (
    <div className="pt-36 md:pt-40 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SEO
        title="Curated Combo Stacks | CHILS & CO."
        description="Select from our predefined 3-tee combo packs. Choose sizes for each designer tee and buy the bundle."
      />

      <header className="mb-16 border-b border-neutral-900 pb-8">
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-4 uppercase">
          Curated Combos
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 font-mono tracking-wider max-w-xl">
          SELECT FROM OUR PREDEFINED BUNDLES. PRESERVING INDIVIDUAL GRAPHIC STORIES.
          CHOOSE SIZES FOR EACH DESIGN BELOW.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          <span className="text-[10px] tracking-[0.25em] font-mono text-neutral-500 uppercase">
            SYNCHRONIZING COMBO PACKS...
          </span>
        </div>
      ) : (
        <div className="space-y-20">
          {/* Group Combos by Price Tier Stacks */}
          {['CORE STACK', 'EVERYDAY STACK', 'OVERSIZED STACK', 'CREATOR STACK', 'POLO STACK', 'TWINTEX STACK'].map((stack) => {
            const stackCombos = PREDEFINED_COMBOS.filter((c) => c.stackName === stack);
            if (stackCombos.length === 0) return null;

            return (
              <div key={stack} className="space-y-8">
                <div className="flex items-center gap-4 border-b border-neutral-900 pb-4">
                  <h2 className="text-lg md:text-xl font-display font-bold tracking-widest text-white uppercase">
                    {stack}
                  </h2>
                  <span className="text-[9px] font-mono px-2 py-0.5 border border-neutral-800 text-neutral-500 bg-neutral-950 rounded-sm">
                    COMBO VALUE TIER: ₹{stackCombos[0].price}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stackCombos.map((combo) => {
                    const tee1 = findProductByName(combo.teeNames.black);
                    const tee2 = findProductByName(combo.teeNames.light);
                    const tee3 = findProductByName(combo.teeNames.dark);

                    const originalPrice = (tee1?.price || 349) + (tee2?.price || 349) + (tee3?.price || 349);
                    const savings = originalPrice - combo.price;

                    return (
                      <motion.div
                        key={combo.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="group border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-950 hover:border-neutral-800 transition-all duration-500 p-6 flex flex-col justify-between"
                      >
                        <div>
                          {/* 3-Tee Grid visual matching the banner */}
                          <div className="grid grid-cols-3 gap-2 mb-6 aspect-[4/3] bg-neutral-900 p-2 border border-neutral-900 group-hover:border-neutral-800 transition-all duration-500 relative overflow-hidden">
                            <div className="aspect-[4/5] bg-neutral-950 overflow-hidden">
                              {tee1 ? (
                                <img src={tee1.images[0]} alt={tee1.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-neutral-900" />
                              )}
                            </div>
                            <div className="aspect-[4/5] bg-neutral-950 overflow-hidden">
                              {tee2 ? (
                                <img src={tee2.images[0]} alt={tee2.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-neutral-900" />
                              )}
                            </div>
                            <div className="aspect-[4/5] bg-neutral-950 overflow-hidden">
                              {tee3 ? (
                                <img src={tee3.images[0]} alt={tee3.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-neutral-900" />
                              )}
                            </div>
                            <div className="absolute top-3 left-3 bg-black/90 border border-neutral-800 px-2 py-0.5 font-mono text-[7px] tracking-widest text-accent uppercase font-bold">
                              SAVE ₹{savings}
                            </div>
                          </div>

                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-display font-bold text-base tracking-tight uppercase group-hover:text-white transition-colors">
                              {combo.name}
                            </h3>
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-sm font-bold text-white">₹{combo.price}</span>
                              <span className="font-mono text-[9px] text-neutral-600 line-through">₹{originalPrice}</span>
                            </div>
                          </div>

                          {/* Descriptive Breakdown of Included Tees */}
                          <div className="space-y-1.5 mt-3 mb-6">
                            {[
                              { label: 'BLACK', product: tee1, fallbackName: combo.teeNames.black },
                              { label: 'LIGHT', product: tee2, fallbackName: combo.teeNames.light },
                              { label: 'DARK', product: tee3, fallbackName: combo.teeNames.dark }
                            ].map((row, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[9px] tracking-wider font-mono">
                                <span className="text-neutral-500 uppercase font-bold">{row.label}:</span>
                                {row.product ? (
                                  <Link
                                    to={`/product/${row.product.id}`}
                                    className="text-neutral-300 hover:text-accent flex items-center gap-1 transition-colors uppercase truncate max-w-[200px]"
                                    title="View Individual Product Story"
                                  >
                                    {row.product.name}
                                    <ExternalLink size={8} />
                                  </Link>
                                ) : (
                                  <span className="text-neutral-600 uppercase">{row.fallbackName}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenCustomizer(combo)}
                          className="w-full text-center text-[9px] font-mono tracking-[0.25em] font-bold uppercase py-4 border border-neutral-800 hover:border-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer active:scale-[0.98]"
                        >
                          SELECT SIZES & BUY
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
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

              {/* LEFT SIDE: PREVIEW PANEL */}
              <div className="w-full md:w-1/2 h-2/5 md:h-full bg-neutral-950 border-b md:border-b-0 md:border-r border-neutral-900 p-8 flex flex-col justify-between relative overflow-y-auto">
                <div>
                  <span className="text-[10px] tracking-[0.25em] font-mono text-accent uppercase font-bold">
                    {activeCombo.stackName} // BUNDLE CONFIGURATION
                  </span>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-white mt-2">
                    {activeCombo.name}
                  </h2>
                  <p className="font-mono text-xs text-neutral-500 mt-1">Curated Price: ₹{activeCombo.price}</p>
                </div>

                {/* Pre-packaged model views */}
                <div className="flex-grow flex items-center justify-center py-8">
                  <div className="grid grid-cols-3 gap-3 w-72 md:w-80">
                    {[
                      { name: activeCombo.teeNames.black, size: size1 },
                      { name: activeCombo.teeNames.light, size: size2 },
                      { name: activeCombo.teeNames.dark, size: size3 }
                    ].map((slot, index) => {
                      const p = findProductByName(slot.name);
                      return (
                        <div key={index} className="flex flex-col gap-2">
                          <div className="aspect-[4/5] bg-neutral-900 border border-neutral-850 overflow-hidden relative">
                            {p ? (
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-900" />
                            )}
                            <div className="absolute top-2 right-2 bg-black/80 w-5 h-5 flex items-center justify-center border border-neutral-800 font-mono text-[9px] text-accent font-bold">
                              {slot.size}
                            </div>
                          </div>
                          <span className="font-mono text-[8px] text-neutral-400 text-center uppercase truncate">
                            {slot.name.substring(0, 10)}...
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[9px] font-mono text-neutral-600 text-center tracking-wider mt-4">
                  * ALL 3 ITEMS ARE PRE-SELECTED. CHOOSE SIZES IN THE OPTIONS TAB.
                </div>
              </div>

              {/* RIGHT SIDE: SIZE CONFIGURATOR & DESIGN STORIES */}
              <div className="w-full md:w-1/2 h-3/5 md:h-full flex flex-col justify-between bg-black p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-col gap-8 mt-8 md:mt-0">
                  <span className="text-[10px] tracking-[0.25em] font-mono text-neutral-500 uppercase font-bold">
                    SELECT SIZES FOR INCLUDED ARTIFACTS
                  </span>

                  {/* Size Selectors & Story Accordions */}
                  <div className="space-y-6">
                    {[
                      { key: 'black', label: '1. BLACK TEE', name: activeCombo.teeNames.black, size: size1, setSize: setSize1, index: 0 },
                      { key: 'light', label: '2. LIGHT TEE', name: activeCombo.teeNames.light, size: size2, setSize: setSize2, index: 1 },
                      { key: 'dark', label: '3. DARK TEE', name: activeCombo.teeNames.dark, size: size3, setSize: setSize3, index: 2 }
                    ].map((slot) => {
                      const p = findProductByName(slot.name);
                      const isStoryOpen = openStoryIndex === slot.index;

                      return (
                        <div key={slot.key} className="border border-neutral-900 p-4 bg-neutral-950/20 space-y-4 rounded-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[8px] text-neutral-500 uppercase font-mono tracking-widest block">{slot.label}</span>
                              <h3 className="text-xs font-display font-medium uppercase text-white mt-0.5">{slot.name}</h3>
                            </div>
                            
                            {/* External detail link to individual t-shirt */}
                            {p && (
                              <Link
                                to={`/product/${p.id}`}
                                target="_blank"
                                className="text-neutral-500 hover:text-white transition-colors p-1"
                                title="Open full product page in new tab"
                              >
                                <ExternalLink size={12} />
                              </Link>
                            )}
                          </div>

                          {/* Size Selection */}
                          <div>
                            <span className="text-[8px] text-neutral-600 font-mono uppercase block mb-2">SIZE</span>
                            <div className="flex gap-1.5">
                              {(p?.availableSizes || ['S', 'M', 'L', 'XL']).map((s) => {
                                const isSel = slot.size === s;
                                return (
                                  <button
                                    key={s}
                                    onClick={() => slot.setSize(s)}
                                    className={`h-8 w-8 flex items-center justify-center border font-mono text-[10px] font-bold transition-all cursor-pointer ${
                                      isSel
                                        ? 'bg-accent border-accent text-black font-extrabold'
                                        : 'border-neutral-900 text-neutral-500 hover:border-neutral-800'
                                    }`}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Story & Spec Accordion */}
                          {p && (
                            <div className="border-t border-neutral-900/60 pt-3">
                              <button
                                onClick={() => toggleStoryAccordion(slot.index)}
                                className="w-full flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-neutral-500 hover:text-white transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Info size={10} className="text-neutral-500" />
                                  {isStoryOpen ? 'HIDE DESIGN DECRYPTION' : 'DECRYPT DESIGN STORY'}
                                </span>
                                {isStoryOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                              </button>

                              <AnimatePresence>
                                {isStoryOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 text-[10.5px] text-neutral-400 font-light leading-relaxed space-y-2 border-l border-neutral-850 pl-3">
                                      <p>{p.description}</p>
                                      {p.coCreator && (
                                        <p className="text-[9px] font-mono text-neutral-500 uppercase mt-2">
                                          Co-Created By: <span className="text-white">{p.coCreator}</span>
                                        </p>
                                      )}
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono text-neutral-500 uppercase pt-2 border-t border-neutral-900/40">
                                        <span>FIT: {p.fit || 'Regular'}</span>
                                        <span>FABRIC: {p.material || '100% Cotton'}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ADD BUNDLE TO BAG ACTION */}
                <div className="border-t border-neutral-900 pt-6 mt-8">
                  <button
                    onClick={handleAddComboToBag}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-accent hover:bg-accent/90 text-black font-mono text-[10px] tracking-[0.3em] font-bold uppercase transition-all duration-300 cursor-pointer active:scale-98 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  >
                    <ShoppingBag size={14} className="stroke-[2.5px]" />
                    ADD CURATED STACK TO BAG
                  </button>
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
