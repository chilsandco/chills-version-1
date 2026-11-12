import React, { useEffect, useState, useRef } from 'react';
import { track } from '../lib/track';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { applyStudio } from '../data/studio';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_SUGGESTIONS = ['Oversized', 'Polo', 'Black', 'Under 500', 'Combos', 'Regular fit'];

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
            setProducts(data.map(applyStudio));
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
      track('search', { search_term: query.trim() });
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
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#f3f2ee] text-ink flex flex-col pt-20 md:pt-24 pb-8 px-4 md:px-12"
          data-lenis-prevent
        >
          <button onClick={onClose} aria-label="Close search"
            className="absolute top-5 right-4 md:right-12 w-10 h-10 rounded-full bg-[#fff] grid place-items-center hover:bg-ink hover:text-[#fff] transition-colors cursor-pointer">
            <X size={18} />
          </button>

          <div className="max-w-3xl mx-auto w-full flex flex-col min-h-0 flex-grow">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tees, polos, colours…"
                aria-label="Search"
                className="w-full bg-[#fff] rounded-full pr-14 py-4 md:py-5 text-lg md:text-xl outline-none ring-1 ring-black/5 focus:ring-ink placeholder:text-neutral-400"
                style={{ paddingLeft: 52 }}
              />
              <button type="submit" disabled={!query.trim()} aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-ink text-[#fff] grid place-items-center disabled:opacity-30 cursor-pointer">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              </button>
            </form>
            <p className="text-xs text-neutral-500 mt-2 px-5">Tip: add a price, like “black under 500”.</p>

            <div className="mt-6 flex-grow overflow-y-auto min-h-0">
              {!query.trim() ? (
                <div>
                  <p className="text-sm text-neutral-500 mb-3 px-1">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {SEARCH_SUGGESTIONS.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => { setQuery(suggestion); inputRef.current?.focus(); }}
                        className="px-4 py-2 rounded-full bg-[#fff] text-sm hover:bg-ink hover:text-[#fff] transition-colors cursor-pointer">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-neutral-500 mb-3 px-1">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
                  {results.length > 0 ? (
                    <div className="space-y-2">
                      {results.slice(0, 6).map((product) => (
                        <Link key={product.id} to={getProductLink(product)} onClick={onClose}
                          className="flex gap-4 items-center p-2.5 pr-4 bg-[#fff] rounded-2xl hover:ring-1 hover:ring-ink/15 transition group">
                          <div className="w-14 h-[72px] rounded-xl bg-paper overflow-hidden shrink-0">
                            {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-neutral-500 truncate">{product.category}</p>
                          </div>
                          <span className="font-semibold whitespace-nowrap">₹{product.price.toLocaleString('en-IN')}</span>
                          <ArrowRight size={16} className="text-neutral-400 group-hover:text-ink group-hover:translate-x-0.5 transition" />
                        </Link>
                      ))}
                      {results.length > 6 && (
                        <button type="button" onClick={() => handleSearchSubmit()}
                          className="w-full mt-2 py-3.5 rounded-full border border-ink/15 bg-[#fff] text-sm font-medium hover:border-ink transition-colors cursor-pointer">
                          See all {results.length} results
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#fff] rounded-2xl p-8 text-center">
                      <p className="font-medium">Nothing matches “{query}”</p>
                      <p className="text-sm text-neutral-500 mt-1">Try a simpler word, like “oversized” or “polo”.</p>
                      <button type="button" onClick={() => setQuery('')} className="mt-4 text-sm underline cursor-pointer">Clear search</button>
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
