import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
import { Product } from '@merch-band/shared';
import { formatIDR } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useFlyCartStore } from '../store/flyCartStore';
import { useTranslation } from '../i18n/translations';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const triggerFly = useFlyCartStore((state) => state.triggerFly);
  const [added, setAdded] = React.useState(false);
  const { t } = useTranslation();

  // Check total stock across all variants
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const isSoldOut = totalStock === 0;

  // Default variant (first available or first)
  const defaultVariant = product.variants?.find((v) => v.stock > 0) || product.variants?.[0];
  const displayPrice = defaultVariant ? defaultVariant.price : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut || !defaultVariant) return;

    const rect = e.currentTarget.getBoundingClientRect();
    triggerFly(rect.left + rect.width / 2, rect.top + rect.height / 2, product.imageUrl);

    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      productName: product.name,
      productSlug: product.slug,
      variantName: defaultVariant.size === 'ONE SIZE' ? defaultVariant.color : `${defaultVariant.color} / ${defaultVariant.size}`,
      category: product.category,
      size: defaultVariant.size,
      color: defaultVariant.color,
      price: defaultVariant.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      maxStock: defaultVariant.stock
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="neo-card bg-surface border-3 border-ink flex flex-col justify-between overflow-hidden group">
      <Link to={`/product/${product.slug}`} className="block relative">
        {/* Image Box */}
        <div className="w-full aspect-square bg-accent-2 border-b-3 border-ink relative overflow-hidden flex items-center justify-center p-2.5 sm:p-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
              isSoldOut ? 'opacity-60 grayscale' : ''
            }`}
            loading="lazy"
          />

          {/* Badges */}
          {isSoldOut ? (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-ink text-white font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 border-2 border-white shadow-xs">
              {t.productCard.soldOut}
            </div>
          ) : product.badge ? (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-brand text-white font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 border-2 sm:border-3 border-ink shadow-xs rotate-sticker-left">
              {product.badge}
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4 space-y-1 sm:space-y-2">
          <div className="font-mono text-[10px] sm:text-xs font-bold tracking-widest text-[#5E3B4F] uppercase truncate">
            {product.category}
          </div>
          <h3 className="font-display text-sm sm:text-lg sm:text-xl text-ink leading-snug line-clamp-1 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Price & Action Row */}
      <div className="px-2.5 sm:px-4 pb-2.5 sm:pb-4 pt-0.5 flex items-center justify-between gap-1.5">
        <div className="bg-brand text-white border-2 sm:border-3 border-ink px-2 py-0.5 sm:px-3 sm:py-1 shadow-xs min-w-0">
          <span className="font-mono text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">
            {formatIDR(displayPrice)}
          </span>
        </div>

        {!isSoldOut && defaultVariant ? (
          <button
            onClick={handleQuickAdd}
            title={added ? t.productCard.added : t.productCard.quickAdd}
            className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-accent-2 border-2 sm:border-3 border-ink flex items-center justify-center shadow-xs hover:bg-brand hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Quick Add"
          >
            {added ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-ink hover:text-white" />}
          </button>
        ) : (
          <span className="font-mono text-[10px] sm:text-xs text-muted font-bold px-1.5 py-0.5 border border-disabled whitespace-nowrap">
            {t.productCard.soldOut}
          </span>
        )}
      </div>
    </div>
  );
};
