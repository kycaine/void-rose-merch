import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../lib/api';
import { Product, CATEGORIES } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category')?.toUpperCase() || 'ALL';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'low-to-high' | 'high-to-low'>('featured');
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getProducts(currentCategory)
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentCategory]);

  const handleCategoryChange = (cat: string) => {
    if (cat === 'ALL') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.variants?.[0]?.price ?? 0;
    const priceB = b.variants?.[0]?.price ?? 0;
    if (sortBy === 'low-to-high') return priceA - priceB;
    if (sortBy === 'high-to-low') return priceB - priceA;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 w-full flex flex-col">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-4 border-ink gap-4">
        <div>
          <div className="font-mono text-xs text-ink/70 uppercase tracking-widest mb-1">
            <Link to="/" className="hover:underline">{t.shop.breadcrumbHome}</Link> / <span>{t.shop.breadcrumbShop}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-ink tracking-tight uppercase">
            {t.shop.title}
          </h1>
        </div>

        {/* Count Sticker */}
        <div className="bg-white border-3 border-ink px-4 py-2 font-mono text-xs sm:text-sm font-bold shadow-xs rotate-sticker-right">
          {products.length} {t.shop.itemsCount}
        </div>
      </div>

      {/* 2. FILTER & SORT BAR */}
      <div className="py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-3 border-ink mb-10">
        {/* Category Chips */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            const categoryLabel =
              t.shop.categories[cat as keyof typeof t.shop.categories] || cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`font-mono text-xs sm:text-sm font-bold px-4 py-2 border-3 border-ink transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white shadow-sm -translate-y-0.5'
                    : 'bg-white text-ink hover:bg-surface shadow-xs'
                }`}
              >
                {categoryLabel}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-select" className="font-mono text-xs font-bold text-ink uppercase">
            {t.shop.sortLabel}
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'featured' | 'low-to-high' | 'high-to-low')}
            className="neo-input px-3 py-2 font-mono text-xs font-bold bg-white cursor-pointer"
          >
            <option value="featured">{t.shop.sortFeatured}</option>
            <option value="low-to-high">{t.shop.sortLowToHigh}</option>
            <option value="high-to-low">{t.shop.sortHighToLow}</option>
          </select>
        </div>
      </div>

      {/* 3. PRODUCT GRID */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-72 sm:h-80 bg-surface/40 border-3 border-ink animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-white border-3 border-ink p-12 text-center my-12 shadow-md">
          <p className="font-display text-2xl text-ink">{t.shop.noProducts}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
