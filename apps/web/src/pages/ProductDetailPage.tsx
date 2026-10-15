import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShoppingBag, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { getProductBySlug, formatIDR } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useFlyCartStore } from '../store/flyCartStore';
import { Product, ProductVariant } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { t } = useTranslation();
  const triggerFly = useFlyCartStore((state) => state.triggerFly);

  // Accordion state
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.imageUrl);
        const inStock = data.variants?.find((v) => v.stock > 0) || data.variants?.[0] || null;
        setSelectedVariant(inStock);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center font-mono text-ink">
        <div className="animate-pulse font-display text-2xl">{t.productDetail.loading}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display text-3xl text-ink">{t.productDetail.notFound}</h2>
        <Link to="/shop">
          <Button variant="primary">{t.productDetail.backToShop}</Button>
        </Link>
      </div>
    );
  }

  const isSoldOut = !selectedVariant || selectedVariant.stock === 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!selectedVariant || isSoldOut) return;

    // Trigger thrown projectile animation to floating cart
    const triggerEl = (e?.currentTarget as HTMLElement) || document.getElementById('add-to-cart-btn');
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      triggerFly(rect.left + rect.width / 2, rect.top + rect.height / 2, product.imageUrl, product.name);
    } else {
      triggerFly(window.innerWidth / 2, window.innerHeight / 2, product.imageUrl, product.name);
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      productSlug: product.slug,
      variantName: selectedVariant.size === 'ONE SIZE' ? selectedVariant.color : `${selectedVariant.color} / ${selectedVariant.size}`,
      category: product.category,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.price,
      quantity,
      imageUrl: product.imageUrl,
      maxStock: selectedVariant.stock
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const allThumbnails = [product.imageUrl, ...(product.thumbnailUrls || [])].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <div className="w-full flex flex-col">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 lg:py-12 w-full">
        {/* Breadcrumb */}
        <div className="font-mono text-xs text-ink/70 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:underline">{t.productDetail.breadcrumbHome}</Link> /{' '}
          <Link to="/shop" className="hover:underline">{t.productDetail.breadcrumbShop}</Link> /{' '}
          <Link to={`/shop?category=${product.category}`} className="hover:underline">
            {product.category}
          </Link>{' '}
          / <span className="text-ink font-bold">{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Image */}
            <div className="relative border-4 border-ink bg-surface p-4 aspect-square shadow-xl flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />

              {product.badge && (
                <div className="absolute top-4 left-4 bg-brand text-white border-3 border-ink px-4 py-1.5 font-mono text-xs font-bold shadow-xs rotate-sticker-left">
                  {product.badge}
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {allThumbnails.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {allThumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(thumb)}
                    className={`w-20 h-20 bg-accent-2 border-3 border-ink p-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === thumb ? 'border-brand ring-2 ring-brand -translate-y-1' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumb} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-block bg-accent-2 text-ink border-2 border-ink px-3 py-1 font-mono text-xs font-bold tracking-wider mb-2">
                {product.category}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price & Stock Status */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-brand text-white border-3 border-ink px-4 py-2 shadow-xs">
                <span className="font-mono text-xl sm:text-2xl font-bold">
                  {selectedVariant ? formatIDR(selectedVariant.price) : '-'}
                </span>
              </div>
              <div className="font-mono text-xs font-bold">
                {isSoldOut ? (
                  <span className="text-red-700 bg-red-100 px-2 py-1 border border-red-700">
                    ✕ {t.productDetail.soldOut}
                  </span>
                ) : (
                  <span className="text-[#1A1A1A] bg-emerald-100 px-2.5 py-1 border border-[#1A1A1A]">
                    ✓ {t.productDetail.inStock} ({selectedVariant?.stock} PCS)
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="font-body text-base text-ink/80 leading-relaxed border-y-2 border-ink/20 py-4">
              {product.description}
            </p>

            {/* Variant / Size Selector */}
            {product.variants && product.variants.length > 0 && product.variants[0].size !== 'ONE SIZE' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-ink uppercase">
                    {t.productDetail.selectSize}: <span className="text-brand">{selectedVariant?.size}</span>
                  </span>
                  <span className="font-mono text-xs text-ink/60 underline cursor-pointer">
                    {t.productDetail.sizeGuide}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const variantOutOfStock = v.stock <= 0;

                    return (
                      <button
                        key={v.id}
                        disabled={variantOutOfStock}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`w-14 h-14 border-3 border-ink font-display text-base flex items-center justify-center transition-all select-none cursor-pointer ${
                          isSelected
                            ? 'bg-brand text-white shadow-sm -translate-y-1'
                            : variantOutOfStock
                            ? 'bg-disabled/30 text-disabled line-through cursor-not-allowed border-disabled'
                            : 'bg-white text-ink hover:bg-surface shadow-xs'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart Row */}
            <div className="flex items-center gap-4 pt-2">
              {/* Stepper */}
              <div className="flex items-center border-3 border-ink bg-white shadow-xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || isSoldOut}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center font-display text-lg hover:bg-surface disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <div className="w-12 h-12 flex items-center justify-center font-mono font-bold text-base border-x-3 border-ink">
                  {quantity}
                </div>
                <button
                  type="button"
                  disabled={!selectedVariant || quantity >= selectedVariant.stock || isSoldOut}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12 flex items-center justify-center font-display text-lg hover:bg-surface disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add Button */}
              <Button
                variant={added ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                disabled={isSoldOut}
                onClick={handleAddToCart}
                id="add-to-cart-btn"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 mr-1" /> {t.productDetail.addedToCart}
                  </>
                ) : isSoldOut ? (
                  t.productDetail.soldOut
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-1" /> {t.productDetail.addToCart}
                  </>
                )}
              </Button>
            </div>

            {/* Accordions: Details, Shipping, Returns */}
            <div className="border-t-3 border-ink pt-6 space-y-3">
              {/* Details Accordion */}
              <div className="border-3 border-ink bg-white">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full p-4 flex items-center justify-between font-display text-sm uppercase text-left cursor-pointer"
                >
                  <span>{t.productDetail.tabs.details}</span>
                  {detailsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {detailsOpen && (
                  <div className="p-4 border-t-2 border-ink/20 font-body text-sm text-ink/80 leading-relaxed">
                    {product.details}
                  </div>
                )}
              </div>

              {/* Shipping Accordion */}
              <div className="border-3 border-ink bg-white">
                <button
                  onClick={() => setShippingOpen(!shippingOpen)}
                  className="w-full p-4 flex items-center justify-between font-display text-sm uppercase text-left cursor-pointer"
                >
                  <span>{t.productDetail.tabs.shipping}</span>
                  {shippingOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {shippingOpen && (
                  <div className="p-4 border-t-2 border-ink/20 font-body text-sm text-ink/80 leading-relaxed">
                    {product.shippingInfo}
                  </div>
                )}
              </div>

              {/* Returns Accordion */}
              <div className="border-3 border-ink bg-white">
                <button
                  onClick={() => setReturnsOpen(!returnsOpen)}
                  className="w-full p-4 flex items-center justify-between font-display text-sm uppercase text-left cursor-pointer"
                >
                  <span>{t.productDetail.tabs.returns}</span>
                  {returnsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {returnsOpen && (
                  <div className="p-4 border-t-2 border-ink/20 font-body text-sm text-ink/80 leading-relaxed">
                    {product.returnsInfo}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MarqueeStrip />
    </div>
  );
};
