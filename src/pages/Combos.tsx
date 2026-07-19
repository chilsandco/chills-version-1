import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, X, Sparkles, Check, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import { Product, CartItem } from '../types';
import { useCart } from '../CartContext';
import ShareSignal from '../components/ShareSignal';

const Combos: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const comboIdParam = searchParams.get('id');

  const { addComboToCart } = useCart();
  const [globalSize, setGlobalSize] = useState<string>('M');

  // Customizer Drawer State
  const [selectedCombo, setSelectedCombo] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { size: string; color: string }>>({});
  const [addingState, setAddingState] = useState<'idle' | 'adding' | 'success'>('idle');

  // Fetch all products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          
          // Filter combo products (type 'grouped' or category 'combos')
          const comboProducts = data.filter(p => 
            p.type === 'grouped' || 
            p.category?.toLowerCase() === 'combos' || 
            p.categories?.some(c => c.toLowerCase() === 'combos')
          );
          setCombos(comboProducts);

          // If there is an ID in the URL, open that combo's drawer automatically
          if (comboIdParam) {
            const foundCombo = comboProducts.find(c => c.id === comboIdParam);
            if (foundCombo) {
              handleOpenCombo(foundCombo, data);
            }
          }
        }
      })
      .catch(err => console.error("Combos: Error fetching products", err))
      .finally(() => setLoading(false));
  }, [comboIdParam]);

  // Resolve child products and initialize default selections
  const handleOpenCombo = (combo: Product, allProducts: Product[] = products) => {
    setSelectedCombo(combo);
    setGlobalSize('M');
    
    // Resolve child items of the combo
    const childIds = combo.groupedProducts || [];
    const defaults: Record<string, { size: string; color: string }> = {};

    childIds.forEach(id => {
      const child = allProducts.find(p => p.id === id);
      if (child) {
        defaults[id] = {
          size: 'M',
          color: child.availableColors && child.availableColors.length > 0 ? child.availableColors[0] : 'Black'
        };
      }
    });
    
    setSelectedOptions(defaults);
    setAddingState('idle');
  };

  const handleCloseCombo = () => {
    setSelectedCombo(null);
    setSearchParams({});
  };

  // Add all selected products in the combo to the cart
  const handleAddComboToCart = () => {
    if (!selectedCombo) return;
    setAddingState('adding');

    const childIds = selectedCombo.groupedProducts || [];
    const subItems: any[] = [];
    let regularTotal = 0;
    
    childIds.forEach(id => {
      const child = products.find(p => p.id === id);
      if (child) {
        const option = selectedOptions[id] || { size: globalSize, color: 'Black' };
        const variationImage = option.color && child.variations
          ? child.variations.find(v => v.attributes.color === option.color)?.images?.[0]
          : null;
        const itemImage = variationImage || child.images[0];

        regularTotal += child.price;
        subItems.push({
          id: child.id,
          name: child.name,
          selectedSize: globalSize,
          selectedColor: option.color,
          image: itemImage,
          price: child.price,
          variations: child.variations
        });
      }
    });

    const discountedTotal = Math.round(regularTotal * 0.9);

    addComboToCart({
      ...selectedCombo,
      price: discountedTotal,
    }, subItems);

    setTimeout(() => {
      setAddingState('success');
      setTimeout(() => {
        handleCloseCombo();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="pt-28 md:pt-40 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SEO 
        title="Engineered Stacks | CHILS & CO." 
        description="Thoughtfully pre-curated wardrobe stacks. Built to work together. Save 10% on Chils engineered wardrobe setups."
      />

      <header className="mb-8 md:mb-16">
        {/* Breadcrumb — stays on one line on all screen sizes */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 overflow-hidden">
          <Link
            to="/collection"
            className="text-3xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter uppercase text-neutral-500 hover:text-white transition-colors whitespace-nowrap flex-shrink-0"
          >
            Collection
          </Link>
          <span className="text-neutral-700 font-light text-3xl md:text-6xl flex-shrink-0">|</span>
          <span className="text-3xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter uppercase text-white whitespace-nowrap">
            Combos
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 border-b border-neutral-900 pb-4">
          <span className="text-[10px] tracking-[0.25em] font-mono text-accent uppercase font-bold">
            SYSTEM OPTIMIZATIONS // MULTI-UNIT WARDROBES
          </span>
          <span className="text-[10px] tracking-[0.25em] font-mono text-neutral-500 uppercase">
            Curated identity stacks • 10% integrated savings
          </span>
        </div>
      </header>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : combos.length === 0 ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-center">
          <p className="text-neutral-500 font-display text-lg uppercase tracking-wider mb-6">No curated stacks online at the moment.</p>
          <Link to="/collection" className="border border-neutral-800 hover:border-white px-8 py-3 text-[10px] tracking-widest font-mono uppercase transition-all">
            [ BACK TO COLLECTION ]
          </Link>
        </div>
      ) : (
        {/* Mobile-only tap nudge */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-6 py-2.5 border border-dashed border-neutral-800 rounded-sm">
          <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase">Tap a stack to configure &amp; add to wardrobe</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {combos.map((combo) => {
            // Resolve children products to display their details
            const childIds = combo.groupedProducts || [];
            const children = childIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];

            // Sum up standard prices to show comparison
            const regularTotal = children.reduce((sum, c) => sum + c.price, 0);
            
            // Calculate 10% discount for the stack
            const comboPrice = Math.round(regularTotal * 0.9);

            return (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover="hover"
                transition={{ duration: 0.8 }}
                className="group cursor-pointer flex flex-col h-full bg-neutral-950/40 border border-neutral-900 hover:border-accent/25 rounded-sm p-6 transition-all duration-500 relative overflow-hidden"
                onClick={() => handleOpenCombo(combo)}
              >
                {/* Visual stacked card effect */}
                <div className="aspect-[3/4] w-full bg-neutral-950 overflow-hidden relative rounded-sm mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                  
                  {/* Outer corner accent decoration */}
                  <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-accent/15 z-20 group-hover:border-accent/40 transition-colors" />

                  {/* Overlapping/overlapping stack images */}
                  <div className="relative w-full h-full flex items-center justify-center scale-90 group-hover:scale-95 transition-transform duration-700">
                    {children.map((child, index) => {
                      // Creative fanned layout so all 3 products are clearly visible
                      const offsetMultiplier = index - (children.length - 1) / 2; // -1, 0, 1
                      const rotation = offsetMultiplier * 12; // -12deg, 0deg, 12deg
                      const translateX = offsetMultiplier * 60; // -60px, 0px, 60px
                      const translateY = Math.abs(offsetMultiplier) * 15; // 15px, 0px, 15px
                      const zIndex = 5 + index;

                      return (
                        <motion.div
                          key={child.id}
                          style={{
                            rotate: `${rotation}deg`,
                            x: `${translateX}px`,
                            y: `${translateY}px`,
                            zIndex,
                          }}
                          variants={{
                            hover: {
                              rotate: `${rotation / 2}deg`,
                              x: `${translateX * 2}px`, // Expand out wider on hover
                              y: -20
                            }
                          }}
                          className="absolute w-[50%] aspect-[3/4] bg-neutral-900 border border-neutral-800 shadow-2xl rounded-md overflow-hidden transition-all duration-500"
                        >
                          <img 
                            src={child.images[0]} 
                            alt={child.name} 
                            className="w-full h-full object-cover select-none pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded-[2px] border border-white/5 text-center">
                            <p className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase truncate">
                              {child.name}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Hover Preview Strip — slides up from bottom of image on hover */}
                  <motion.div
                    variants={{
                      hover: { opacity: 1, y: 0 }
                    }}
                    initial={{ opacity: 0, y: '100%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-neutral-800 px-4 py-3 z-40 pointer-events-none"
                  >
                    <p className="text-[8px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-2.5">STACK INCLUDES</p>
                    <div className="flex gap-2">
                      {children.map((child, idx) => (
                        <div key={child.id} className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-10 flex-shrink-0 rounded-[2px] overflow-hidden border border-neutral-800">
                            <img
                              src={child.images[0]}
                              alt={child.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] font-mono text-white uppercase truncate leading-tight">{child.name}</p>
                            <p className="text-[7px] font-mono text-neutral-600 mt-0.5">₹{child.price}</p>
                          </div>
                          {idx < children.length - 1 && (
                            <span className="text-neutral-700 text-[10px] flex-shrink-0">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-neutral-900 flex items-center justify-center">
                      <span className="text-[7px] font-mono tracking-[0.2em] text-accent uppercase">Click to configure →</span>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-auto space-y-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.25em] text-accent uppercase block mb-1">
                      CURATED WARDROBE STACK
                    </span>
                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight group-hover:text-accent transition-colors">
                      {combo.name}
                    </h3>
                  </div>

                  <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">
                    {combo.description}
                  </p>

                  <div className="pt-4 border-t border-neutral-900 flex justify-between items-baseline">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-display font-bold text-white font-mono">
                        ₹{comboPrice.toLocaleString()}
                      </span>
                      {regularTotal > 0 && (
                        <span className="text-sm text-neutral-500 line-through font-mono">
                          ₹{regularTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-accent uppercase bg-accent/5 border border-accent/20 px-2 py-0.5 rounded-sm">
                      SAVE 10%
                    </span>
                  </div>
                </div>
              </motion.div>

            );
          })}
        </div>
      )}

      {/* Slide-over Customizer Panel */}
      <AnimatePresence>
        {selectedCombo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCombo}
              className="fixed inset-0 bg-black z-[100] cursor-pointer"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[650px] bg-neutral-950 border-l border-neutral-900 z-[110] p-8 overflow-y-auto flex flex-col justify-between"
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-accent/15 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-accent/15 pointer-events-none" />

              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase">
                    STACK CONFIGURATOR // DR-01
                  </span>
                  <button 
                    onClick={handleCloseCombo}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-3 text-white">
                  {selectedCombo.name}
                </h2>
                <p className="text-neutral-500 text-xs leading-relaxed mb-8">
                  {selectedCombo.description}
                </p>

                {/* Global Size Selector */}
                <div className="mb-8 p-5 bg-neutral-900/30 border border-neutral-900 rounded-sm">
                  <span className="text-[10px] font-mono text-accent tracking-[0.2em] uppercase block mb-3 font-bold">
                    SELECT SIZE FOR ALL ITEMS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // Dynamically calculate sizes based on child products
                      const childIds = selectedCombo.groupedProducts || [];
                      let commonSizes = ['S', 'M', 'L', 'XL', 'XXL']; // Fallback

                      if (childIds.length > 0) {
                        const sizesArrays = childIds
                          .map(id => products.find(p => p.id === id))
                          .filter(Boolean)
                          .map(child => child!.availableSizes && child!.availableSizes.length > 0 
                            ? child!.availableSizes 
                            : ['S', 'M', 'L', 'XL']
                          );

                        if (sizesArrays.length > 0) {
                          // Find intersection of all child size arrays
                          commonSizes = sizesArrays.reduce((common, current) => 
                            common.filter(size => current.includes(size))
                          );
                        }
                      }
                      
                      // If no common sizes are found, provide a fallback
                      if (commonSizes.length === 0) commonSizes = ['S', 'M', 'L', 'XL'];

                      return commonSizes.map(s => {
                        const isSel = globalSize === s;
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              setGlobalSize(s);
                            }}
                            className={`px-5 py-2.5 text-[10px] font-mono font-bold transition-all border ${
                              isSel 
                                ? 'border-accent bg-accent/5 text-accent font-bold' 
                                : 'border-neutral-900 text-neutral-500 hover:border-neutral-800 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Sub items layout */}
                <div className="space-y-8">
                  {(selectedCombo.groupedProducts || []).map((id, index) => {
                    const child = products.find(p => p.id === id);
                    if (!child) return null;

                    const option = selectedOptions[id] || { size: 'M', color: 'Black' };
                    const availableSizes = child.availableSizes || ['S', 'M', 'L', 'XL'];
                    const availableColors = child.availableColors || ['Black'];

                    return (
                      <div key={id} className="border border-neutral-900 p-5 bg-neutral-950/40 relative">
                        <div className="absolute top-0 right-0 bg-neutral-900 px-3 py-1 text-[8px] font-mono text-neutral-500 tracking-wider">
                          ITEM 0{index + 1}
                        </div>
                        
                        <div className="flex gap-4">
                          <Link to={`/product/${child.id}`} className="block">
                            <img 
                              src={child.images[0]} 
                              alt={child.name}
                              className="w-20 aspect-[3/4] object-cover bg-neutral-900 border border-neutral-800 rounded-sm hover:opacity-80 transition-opacity"
                              referrerPolicy="no-referrer"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/product/${child.id}`} className="hover:text-accent transition-colors">
                              <h4 className="text-sm font-display font-bold uppercase text-white tracking-wide mb-1">
                                {child.name}
                              </h4>
                            </Link>
                            <p className="text-[10px] font-mono text-neutral-500 mb-4">
                              Individual Price: ₹{child.price}
                            </p>

                            {/* Size selection is handled globally at stack level */}

                            {/* Color Selection (if multiple) */}
                            {availableColors.length > 1 && (
                              <div>
                                <span className="text-[9px] font-mono text-neutral-600 tracking-widest uppercase block mb-2">
                                  SELECT COLOR
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {availableColors.map(c => {
                                    const isSel = option.color === c;
                                    return (
                                      <button
                                        key={c}
                                        onClick={() => setSelectedOptions(prev => ({
                                          ...prev,
                                          [id]: { ...prev[id], color: c }
                                        }))}
                                        className={`px-3 py-1 text-[9px] font-mono uppercase transition-all border ${
                                          isSel 
                                            ? 'border-accent bg-accent/5 text-accent font-bold' 
                                            : 'border-neutral-900 text-neutral-500 hover:border-neutral-800 hover:text-white'
                                        }`}
                                      >
                                        {c}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button Section */}
              <div className="border-t border-neutral-900 pt-8 mt-12 bg-neutral-950">
                <div className="flex justify-between items-baseline mb-6">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-600 tracking-widest uppercase block mb-1">
                      INTEGRATED TOTAL
                    </span>
                    <div className="flex items-baseline gap-3">
                      {(() => {
                        const regularTotal = (selectedCombo.groupedProducts || [])
                          .map(id => products.find(p => p.id === id)?.price || 0)
                          .reduce((a, b) => a + b, 0);
                        const comboPrice = Math.round(regularTotal * 0.9);
                        return (
                          <>
                            <span className="text-3xl font-display font-bold text-white font-mono">
                              ₹{comboPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-neutral-500 line-through font-mono">
                              ₹{regularTotal.toLocaleString()}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-accent tracking-widest bg-accent/5 border border-accent/25 px-3 py-1 rounded-sm uppercase">
                    10% Stack Savings Applied
                  </span>
                </div>

                <button
                  onClick={handleAddComboToCart}
                  disabled={addingState !== 'idle'}
                  className="w-full bg-white text-black hover:bg-accent hover:text-black py-5 text-[11px] tracking-[0.4em] font-bold uppercase transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <AnimatePresence mode="wait">
                    {addingState === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Add Stack to Wardrobe</span>
                      </motion.div>
                    )}

                    {addingState === 'adding' && (
                      <motion.div
                        key="adding"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Compiling Stack Items...</span>
                      </motion.div>
                    )}

                    {addingState === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-green-700"
                      >
                        <Check size={16} strokeWidth={3} />
                        <span>Stack Added Successfully</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Share Signal */}
                <div className="mt-4">
                  <ShareSignal
                    productName={selectedCombo.name}
                    productUrl={`${window.location.origin}/combos?id=${selectedCombo.id}`}
                    productImage={selectedCombo.images?.[0]}
                  />
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Combos;
