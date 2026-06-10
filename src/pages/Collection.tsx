import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Product } from '../types';

const Collection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const creatorQuery = searchParams.get('creator');

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

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

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
            <div className="flex gap-8 border-b border-neutral-900 pb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`text-[11px] tracking-[0.2em] font-bold uppercase transition-colors ${filter === cat ? 'text-white' : 'text-neutral-600 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
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
    </div>
  );
};

export default Collection;
