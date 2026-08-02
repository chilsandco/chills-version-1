import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_SUGGESTIONS = [
  'Linen',
  'Classic',
  'Silk',
  'Bespoke',
  'Combos',
  'Signature'
];

export const parseSearchQuery = (rawQuery: string) => {
  let cleanQuery = rawQuery.replace(/[₹$,]/g, '').toLowerCase().trim();
  let priceMax: number | null = null;
  let priceMin: number | null = null;

  // Match "under X", "below X", "less than X", "< X", "<= X"
  const underRegex = /(?:under|below|less\s+than|<\s*=?)\s*(\d+)/i;
  const matchUnder = cleanQuery.match(underRegex);
  if (matchUnder) {
    priceMax = parseFloat(matchUnder[1]);
    cleanQuery = cleanQuery.replace(matchUnder[0], '');
  }

  // Match "above X", "over X", "more than X", "> X", ">= X"
  const overRegex = /(?:above|over|more\s+than|>\s*=?)\s*(\d+)/i;
  const matchOver = cleanQuery.match(overRegex);
  if (matchOver) {
    priceMin = parseFloat(matchOver[1]);
    cleanQuery = cleanQuery.replace(matchOver[0], '');
  }

  // If no explicit threshold yet, check if there's a standalone number or end number
  if (priceMax === null && priceMin === null) {
    const numberRegex = /^\s*(\d+)\s*$/;
    const matchNumber = cleanQuery.match(numberRegex);
    if (matchNumber) {
      priceMax = parseFloat(matchNumber[1]);
      cleanQuery = '';
    } else {
      const endNumberRegex = /\b(\d+)\b\s*$/;
      const matchEndNumber = cleanQuery.match(endNumberRegex);
      if (matchEndNumber) {
        priceMax = parseFloat(matchEndNumber[1]);
        cleanQuery = cleanQuery.replace(matchEndNumber[0], '');
      }
    }
  }

  return {
    textQuery: cleanQuery.replace(/\s+/g, ' ').trim(),
    priceMax,
    priceMin
  };
};

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch products when opened
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
          }
        })
        .catch((err) => console.error('SearchOverlay: error fetching products', err))
        .finally(() => setLoading(false));

      // Auto focus search input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Disable body scroll when open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard events (Escape to close, Enter to submit search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Real-time query filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const { textQuery, priceMax, priceMin } = parseSearchQuery(query);

    const filtered = products.filter((product) => {
      // 1. Text filter
      if (textQuery) {
        const matchesName = product.name.toLowerCase().includes(textQuery);
        const matchesCategory = product.category?.toLowerCase().includes(textQuery);
        const matchesDesc = product.description?.toLowerCase().includes(textQuery);
        if (!matchesName && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // 2. Price Max filter
      if (priceMax !== null && product.price > priceMax) {
        return false;
      }

      // 3. Price Min filter
      if (priceMin !== null && product.price < priceMin) {
        return false;
      }

      return true;
    });

    setResults(filtered);
  }, [query, products]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/collection?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const getProductLink = (product: Product) => {
    if (
      product.category?.toLowerCase() === 'combos-redirect' ||
      product.categories?.some((c) => c.toLowerCase() === 'combos-redirect')
    ) {
      return '/combos';
    }
    if (
      product.type === 'grouped' ||
      product.category?.toLowerCase() === 'combos' ||
      product.categories?.some((c) => c.toLowerCase() === 'combos')
    ) {
      return `/combos?id=${product.id}`;
    }
    return `/product/${product.id}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col pt-24 pb-12 px-6 md:px-12 select-none"
        >
          {/* Header Close Bar */}
          <div className="absolute top-6 right-6 md:right-12">
            <button
              onClick={onClose}
              className="p-3 text-neutral-400 hover:text-white transition-colors duration-250 cursor-pointer rounded-full hover:bg-neutral-900 active:scale-95 border border-white/5"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full border-b border-neutral-800 pb-4">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="TYPE TO SEARCH..."
                className="w-full bg-transparent border-none text-3xl md:text-5xl font-display font-light uppercase tracking-widest text-white placeholder-neutral-800 focus:outline-none focus:ring-0 pr-12"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-accent transition-colors cursor-pointer"
                disabled={!query.trim()}
              >
                {loading ? (
                  <Loader2 className="animate-spin text-accent" size={24} />
                ) : (
                  <Search size={24} />
                )}
              </button>
            </form>

            {/* Suggestions & Results Panel */}
            <div className="mt-12 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-900">
              {!query.trim() ? (
                // Quick suggestions when empty
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">
                    // Suggested Keywords
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {SEARCH_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setQuery(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="px-4 py-2 border border-neutral-900 hover:border-accent text-neutral-400 hover:text-white transition-all duration-300 font-mono text-[10px] tracking-[0.2em] uppercase rounded-[2px] cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Results list
                <div className="space-y-8">
                  <div className="flex justify-between items-center border-b border-neutral-950 pb-2">
                    <span className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase font-bold">
                      // Search Extraction Matrix
                    </span>
                    <span className="text-[9px] font-mono tracking-[0.25em] text-neutral-600 uppercase font-bold">
                      {results.length} Matches Found
                    </span>
                  </div>

                  {results.length > 0 ? (
                    <div className="space-y-4">
                      {results.slice(0, 5).map((product) => (
                        <Link
                          key={product.id}
                          to={getProductLink(product)}
                          onClick={onClose}
                          className="flex gap-6 items-center p-3 border border-neutral-950 hover:border-neutral-800 bg-neutral-950/40 hover:bg-neutral-900/30 rounded-[2px] transition-all duration-300 group"
                        >
                          {/* Image */}
                          <div className="w-16 h-20 bg-neutral-900 overflow-hidden relative flex-shrink-0 border border-neutral-900 group-hover:border-neutral-800 transition-colors">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-neutral-700">
                                NO IMG
                              </div>
                            )}
                          </div>

                          {/* Meta */}
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] font-mono tracking-[0.15em] text-accent/60 uppercase">
                              {product.category}
                            </span>
                            <h4 className="text-sm md:text-base font-display font-medium tracking-wide text-white group-hover:text-accent transition-colors truncate uppercase mt-0.5">
                              {product.name}
                            </h4>
                          </div>

                          {/* Price / Arrow */}
                          <div className="text-right flex items-center gap-4">
                            <span className="text-sm font-mono text-neutral-400 font-bold whitespace-nowrap">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <ArrowRight
                              size={16}
                              className="text-neutral-600 group-hover:text-accent transform group-hover:translate-x-1 transition-all"
                            />
                          </div>
                        </Link>
                      ))}

                      {results.length > 5 && (
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full py-4 mt-6 border border-neutral-900 hover:border-white text-[11px] tracking-[0.2em] font-bold uppercase text-neutral-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 rounded-[2px]"
                        >
                          View All {results.length} Results
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-3">
                      <p className="text-neutral-600 font-mono text-xs uppercase tracking-[0.2em]">
                        No matching luxury identities retrieved.
                      </p>
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="text-[9px] font-mono tracking-[0.2em] text-accent uppercase underline underline-offset-4 cursor-pointer"
                      >
                        Reset Matrix Search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
