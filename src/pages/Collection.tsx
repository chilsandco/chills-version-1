import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, RotateCcw, Check, Activity, Square, LayoutGrid } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Product } from '../types';


const Collection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'editorial' | 'archive'>(() => {
    return (localStorage.getItem('chils_view_mode') as 'editorial' | 'archive') || 'archive';
  });
  const [filter, setFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const creatorQuery = searchParams.get('creator');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Advanced filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const touchStartY = React.useRef(0);

  const handleScrollRedirectWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  const handleScrollRedirectTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleScrollRedirectTouchMove = (e: React.TouchEvent) => {
    if (scrollContainerRef.current) {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;
      scrollContainerRef.current.scrollTop += deltaY;
      touchStartY.current = touchY;
    }
  };

  useEffect(() => {
    const html = document.documentElement;
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      html.style.overflow = 'hidden';
      html.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      html.style.overflow = '';
      html.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      html.style.overflow = '';
      html.style.height = '';
    };
  }, [isDrawerOpen]);



  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Collection: Data is not an array", data);
          setProducts([]);
        }
      })
      .catch(err => {
        console.error("Collection: Error fetching products", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Dynamic filter lists aggregation
  const allSizes = React.useMemo(() => {
    const sizes = new Set<string>();
    products.forEach(p => {
      const productSizes = p.availableSizes || (p.variations ? p.variations.map(v => v.attributes.size).filter(Boolean) : []);
      productSizes.forEach(s => sizes.add(s));
    });
    const standardOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    return Array.from(sizes).sort((a, b) => {
      const indexA = standardOrder.indexOf(a.toUpperCase());
      const indexB = standardOrder.indexOf(b.toUpperCase());
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const priceRange = React.useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Sync maxPrice when products load
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      setMaxPrice(Math.max(...prices));
    }
  }, [products]);

  // Apply all active filters to the collection
  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      // 0. Exclude Combos from collection page
      if (p.type === 'grouped' || p.category === 'Combos' || (p.categories || []).includes('Combos')) {
        return false;
      }

      // 1. Creator filter (from query param)
      if (creatorQuery && p.coCreator?.toLowerCase() !== creatorQuery.toLowerCase()) {
        return false;
      }

      // 2. Category filter
      if (filter !== 'All' && !(p.categories || [p.category]).includes(filter)) {
        return false;
      }

      // 3. Price filter
      if (p.price > maxPrice) {
        return false;
      }

      // 4. Stock Availability filter
      const isAvailable = p.status === "Available" && 
        (p.variations ? p.variations.some(v => v.manageStock ? v.stockQuantity > 0 : v.stockStatus !== 'outofstock') : true);
      if (inStockOnly && !isAvailable) {
        return false;
      }

      // 5. Size variation filter
      if (selectedSizes.length > 0) {
        if (p.variations) {
          const hasMatchingSize = p.variations.some(v => {
            const matchesSize = v.attributes.size && selectedSizes.includes(v.attributes.size);
            const inStock = v.manageStock ? v.stockQuantity > 0 : v.stockStatus !== 'outofstock';
            return matchesSize && (!inStockOnly || inStock);
          });
          if (!hasMatchingSize) return false;
        } else {
          // Fallback if variations data is not fetched for the list
          const hasMatchingSize = p.availableSizes?.some(size => selectedSizes.includes(size));
          if (!hasMatchingSize) return false;
        }
      }

      return true;
    });
  }, [products, creatorQuery, filter, selectedSizes, maxPrice, inStockOnly]);

  const categories = React.useMemo(() => {
    const allCats = new Set<string>();
    products.forEach(p => {
      if (p.type === 'grouped' || p.category === 'Combos' || (p.categories || []).includes('Combos')) return;
      const productCats = p.categories || [p.category];
      productCats.forEach(c => {
        if (c && c !== 'Combos') allCats.add(c);
      });
    });
    return ['All', ...Array.from(allCats)];
  }, [products]);

  const categoryCounts = React.useMemo(() => {
    // Filter products by all active filters EXCEPT the category filter itself
    const productsMatchingOtherFilters = products.filter(p => {
      // 1. Creator filter (from query param)
      if (creatorQuery && p.coCreator?.toLowerCase() !== creatorQuery.toLowerCase()) {
        return false;
      }

      // 2. Price filter
      if (p.price > maxPrice) {
        return false;
      }

      // 3. Stock Availability filter
      const isAvailable = p.status === "Available" && 
        (p.variations ? p.variations.some(v => v.manageStock ? v.stockQuantity > 0 : v.stockStatus !== 'outofstock') : true);
      if (inStockOnly && !isAvailable) {
        return false;
      }

      // 4. Size variation filter
      if (selectedSizes.length > 0) {
        if (p.variations) {
          const hasMatchingSize = p.variations.some(v => {
            const matchesSize = v.attributes.size && selectedSizes.includes(v.attributes.size);
            const inStock = v.manageStock ? v.stockQuantity > 0 : v.stockStatus !== 'outofstock';
            return matchesSize && (!inStockOnly || inStock);
          });
          if (!hasMatchingSize) return false;
        } else {
          // Fallback if variations data is not fetched
          const hasMatchingSize = p.availableSizes?.some(size => selectedSizes.includes(size));
          if (!hasMatchingSize) return false;
        }
      }

      return true;
    });

    const counts: Record<string, number> = { All: productsMatchingOtherFilters.length };
    productsMatchingOtherFilters.forEach(p => {
      const productCats = p.categories || [p.category];
      productCats.forEach(cat => {
        if (cat) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
    });
    return counts;
  }, [products, creatorQuery, maxPrice, inStockOnly, selectedSizes]);

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return categories;
    return categories.filter((cat: string) => 
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const isFilterDirty = React.useMemo(() => {
    const maxPriceBoundary = products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000;
    return filter !== 'All' || 
      selectedSizes.length > 0 || 
      inStockOnly || 
      maxPrice < maxPriceBoundary;
  }, [filter, selectedSizes, inStockOnly, maxPrice, products]);


  return (
    <div className="pt-36 md:pt-40 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <SEO 
        title="Luxury Collection | CHILS & CO." 
        description="Explore the curated collection of premium shirts and luxury garments by Chils & Co. Handcrafted with 100% fine cotton and digital-mapped tailoring."
        keywords="premium shirts India, luxury menswear collection, handcrafted fashion, Chils and Co products"
      />
      <header className="mb-16">
        {creatorQuery ? (
          <>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 uppercase">
              CO-CREATED BY {creatorQuery}
            </h1>
            <div className="flex items-center gap-6 border-b border-neutral-900 pb-4">
              <span className="text-[10px] tracking-[0.25em] font-mono text-accent uppercase font-bold">
                SPOTLIGHT // SYSTEM DESIGN EXTRACTIONS
              </span>
              <button
                onClick={() => setSearchParams({})}
                className="text-[10px] tracking-[0.25em] font-mono font-bold uppercase text-neutral-500 hover:text-white px-4 py-1.5 border border-neutral-800 hover:border-white transition-all duration-300 cursor-pointer active:scale-95"
              >
                [ RESET FILTER ]
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 uppercase flex items-center gap-4 flex-wrap">
              <span className="text-white">Collection</span>
              <span className="text-neutral-700 font-light">|</span>
              <Link to="/combos" className="text-neutral-500 hover:text-white transition-colors">Combos</Link>
            </h1>
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
              {/* Horizontally Scrollable Categories */}
              <div className="overflow-hidden relative flex-1">
                <div className="flex gap-8 overflow-x-auto scrollbar-none whitespace-nowrap pr-16 scroll-smooth py-1">
                  {categories.map(cat => {
                    const count = categoryCounts[cat] || 0;
                    const isActive = filter === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`text-[11px] tracking-[0.2em] font-bold uppercase transition-all duration-300 relative py-1 cursor-pointer active:scale-95 whitespace-nowrap ${
                          isActive
                            ? 'text-white'
                            : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        {cat}
                        <span className={`text-[9px] font-mono ml-1.5 font-normal transition-opacity duration-300 ${
                          isActive ? 'text-accent opacity-100' : 'text-neutral-600 opacity-60'
                        }`}>
                          ({count})
                        </span>
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent animate-fade-in" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Subtle Right Fade Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
              </div>

              {/* Layout controls */}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-neutral-800">
                {/* Layout Toggle Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setViewMode('editorial');
                      localStorage.setItem('chils_view_mode', 'editorial');
                    }}
                    title="Show 1 product per row (Spacious Editorial View)"
                    className={`h-7 w-7 transition-all border border-neutral-900 hover:border-neutral-700 hover:text-white flex items-center justify-center rounded-[2px] cursor-pointer ${
                      viewMode === 'editorial'
                        ? 'bg-white text-black border-white'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Square size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('archive');
                      localStorage.setItem('chils_view_mode', 'archive');
                    }}
                    title="Show 2 products per row (Compact Archive Scan View)"
                    className={`h-7 w-7 transition-all border border-neutral-900 hover:border-neutral-700 hover:text-white flex items-center justify-center rounded-[2px] cursor-pointer ${
                      viewMode === 'archive'
                        ? 'bg-white text-black border-white'
                        : 'text-neutral-500'
                    }`}
                  >
                    <LayoutGrid size={13} strokeWidth={1.5} />
                  </button>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(true)}
                  title="Open filter options (Filter by Size, Color, Price, and Category)"
                  className="flex items-center gap-2 text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-400 hover:text-white transition-all duration-300 cursor-pointer active:scale-95 whitespace-nowrap group"
                >
                  <SlidersHorizontal size={13} className="text-neutral-500 group-hover:text-accent transition-colors" />
                  <span>FILTER</span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Activity className="animate-pulse text-accent" size={32} />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">Synchronizing Chils...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-1 bg-neutral-900 transition-all duration-300 ${
              viewMode === 'editorial'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}>
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-black">
                  <ProductCard product={product} viewMode={viewMode} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center text-neutral-500 uppercase tracking-widest text-sm">
              No items found in this category.
            </div>
          )}
        </>
      )}

      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
          onWheel={handleScrollRedirectWheel}
          onTouchStart={handleScrollRedirectTouchStart}
          onTouchMove={handleScrollRedirectTouchMove}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] max-h-[100dvh] w-full sm:w-[460px] bg-[#0a0a0a] z-50 shadow-2xl flex flex-col border-l border-neutral-900 transition-transform duration-350 ease-out transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-8 py-6 border-b border-neutral-900"
          onWheel={handleScrollRedirectWheel}
          onTouchStart={handleScrollRedirectTouchStart}
          onTouchMove={handleScrollRedirectTouchMove}
        >
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight uppercase">Filters</h2>
            <p className="text-[10px] tracking-[0.2em] font-mono text-neutral-500 mt-1 uppercase">
              {filteredProducts.length} of {products.length} Deployed
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors duration-250 cursor-pointer rounded-full hover:bg-neutral-900 active:scale-95"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain px-8 py-6 space-y-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
          {/* Availability Toggle */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">// Stock Availability</h3>
            <button 
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors cursor-pointer group"
            >
              <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 rounded-[2px] ${
                inStockOnly ? 'bg-white border-white text-black' : 'border-neutral-800 group-hover:border-neutral-600'
              }`}>
                {inStockOnly && <Check size={12} strokeWidth={3} />}
              </div>
              <span className="text-[11px] tracking-[0.2em] font-bold uppercase">In Stock Only</span>
            </button>
          </div>

          {/* Size Filter */}
          {allSizes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">// Size Variation</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map(size => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSizes(prev => 
                          prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                        );
                      }}
                      className={`w-11 h-11 border text-[10px] font-mono font-bold transition-all duration-300 cursor-pointer rounded-[2px] ${
                        isSelected 
                          ? 'bg-white text-black border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                          : 'border-neutral-800 hover:border-white text-neutral-400'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}



          {/* Price Range Slider */}
          {priceRange.max > priceRange.min && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">// Price Threshold</h3>
                <span className="text-[10px] font-mono tracking-wider text-neutral-400 font-bold">
                  Under ₹{maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <input 
                  type="range" 
                  min={priceRange.min} 
                  max={priceRange.max} 
                  value={maxPrice} 
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-white bg-neutral-900 h-1 cursor-pointer outline-none rounded-sm"
                />
                <div className="flex justify-between text-[8px] font-mono text-neutral-600">
                  <span>₹{priceRange.min}</span>
                  <span>₹{priceRange.max}</span>
                </div>
              </div>
            </div>
          )}

          {/* Categories Search & List */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">// Product Category</h3>
            
            <div className="relative flex items-center mb-3">
              <Search className="absolute left-3.5 text-neutral-500" size={14} />
              <input
                type="text"
                placeholder="SEARCH CATEGORY..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-900 rounded-none pl-10 pr-4 py-2.5 text-[10px] tracking-[0.15em] text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-800 focus:ring-0 transition-all font-mono"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 text-neutral-500 hover:text-white text-[9px] font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(cat => {
                  const count = categoryCounts[cat] || 0;
                  const isSelected = filter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilter(cat)}
                      className={`w-full text-left py-3 px-4 flex justify-between items-center transition-all duration-300 border ${
                        isSelected 
                          ? 'bg-white/5 border-neutral-800 text-white font-semibold' 
                          : 'border-transparent hover:bg-white/[0.02] text-neutral-400 hover:text-white'
                      } cursor-pointer group rounded-[2px]`}
                    >
                      <span className="text-[11px] tracking-[0.2em] uppercase font-medium">
                        {cat}
                      </span>
                      <span className={`text-[9px] font-mono tracking-normal transition-colors px-2 py-0.5 border ${
                        isSelected 
                          ? 'border-white/20 bg-white/10 text-accent font-bold' 
                          : 'border-neutral-900 text-neutral-600 group-hover:text-neutral-300'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-neutral-600 font-mono text-[10px] tracking-[0.15em] uppercase">
                  No categories match search
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="p-8 border-t border-neutral-900 bg-[#070707] flex gap-4"
          onWheel={handleScrollRedirectWheel}
          onTouchStart={handleScrollRedirectTouchStart}
          onTouchMove={handleScrollRedirectTouchMove}
        >
          <button
            onClick={() => {
              setFilter('All');
              setSearchTerm('');
              setSelectedSizes([]);
              setInStockOnly(false);
              if (products.length > 0) {
                setMaxPrice(Math.max(...products.map(p => p.price)));
              }
              setIsDrawerOpen(false);
            }}
            disabled={!isFilterDirty}
            className="flex-1 py-4 border border-neutral-800 text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:border-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:pointer-events-none rounded-[2px]"
          >
            <RotateCcw size={13} />
            RESET
          </button>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 py-4 bg-white text-black text-[11px] tracking-[0.2em] font-bold uppercase hover:bg-neutral-200 transition-all duration-300 cursor-pointer active:scale-95"
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  );
};

export default Collection;
