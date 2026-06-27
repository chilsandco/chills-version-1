import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Product } from '../types';


const Collection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const creatorQuery = searchParams.get('creator');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
      });
  }, []);

  const filteredProducts = creatorQuery
    ? products.filter(p => p.coCreator?.toLowerCase() === creatorQuery.toLowerCase())
    : filter === 'All'
      ? products
      : products.filter(p => p.category === filter);

  const categories: string[] = ['All', ...(Array.from(new Set(products.map(p => p.category))) as string[])];

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return categories;
    return categories.filter((cat: string) => 
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);


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
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 uppercase">Collection</h1>
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

              {/* Filter / Drawer Trigger */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-400 hover:text-white transition-all duration-300 ml-4 pl-4 border-l border-neutral-800 cursor-pointer active:scale-95 whitespace-nowrap group"
              >
                <SlidersHorizontal size={13} className="text-neutral-500 group-hover:text-accent transition-colors" />
                <span>FILTER</span>
              </button>
            </div>
          </>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 bg-neutral-900">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-black">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-32 text-center text-neutral-500 uppercase tracking-widest text-sm">
          No items found in this category.
        </div>
      )}

      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-[#0a0a0a] z-50 shadow-2xl flex flex-col border-l border-neutral-900 transition-transform duration-350 ease-out transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-900">
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight uppercase">Categories</h2>
            <p className="text-[10px] tracking-[0.2em] font-mono text-neutral-500 mt-1 uppercase">
              {products.length} Items Available
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

        {/* Search */}
        <div className="px-8 py-4 border-b border-neutral-900">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="SEARCH CATEGORY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-none pl-11 pr-4 py-3 text-[11px] tracking-[0.15em] text-white placeholder-neutral-600 focus:outline-none focus:border-white focus:ring-0 transition-all font-mono"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 text-neutral-500 hover:text-white text-xs font-mono"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Categories List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-none space-y-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => {
              const count = categoryCounts[cat] || 0;
              const isSelected = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setFilter(cat);
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full text-left py-4 px-5 flex justify-between items-center transition-all duration-300 border border-transparent ${
                    isSelected 
                      ? 'bg-white/5 border-neutral-800 text-white font-semibold' 
                      : 'hover:bg-white/[0.02] text-neutral-400 hover:text-white'
                  } cursor-pointer group`}
                >
                  <span className="text-[12px] tracking-[0.2em] uppercase font-medium">
                    {cat}
                  </span>
                  <span className={`text-[10px] font-mono tracking-normal transition-colors px-2 py-0.5 border ${
                    isSelected 
                      ? 'border-white/20 bg-white/10 text-accent font-bold' 
                      : 'border-neutral-800 text-neutral-500 group-hover:text-neutral-300'
                  }`}>
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-neutral-600 font-mono text-[11px] tracking-[0.15em] uppercase">
              No categories match search
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-neutral-900 bg-[#070707] flex gap-4">
          <button
            onClick={() => {
              setFilter('All');
              setSearchTerm('');
              setIsDrawerOpen(false);
            }}
            disabled={filter === 'All'}
            className="flex-1 py-4 border border-neutral-800 text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:border-neutral-800 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:pointer-events-none"
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
