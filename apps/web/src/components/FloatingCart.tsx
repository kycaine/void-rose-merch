import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, X, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useFlyCartStore } from '../store/flyCartStore';
import { useTranslation } from '../i18n/translations';
import { formatIDR } from '../lib/api';

export const FloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useTranslation();

  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.getItemCount());
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const { flyingItems, isCartBumping, removeFly, triggerCartBump } = useFlyCartStore();
  const cartAnchorRef = useRef<HTMLDivElement>(null);

  // Cek apakah perangkat adalah tablet / HP (< 1024px)
  const isMobileOrTablet = () => typeof window !== 'undefined' && window.innerWidth < 1024;

  // Di tablet & HP default minimized agar tidak menutupi layar. Di desktop auto-expand jika ada item.
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return true;
    return itemCount === 0;
  });
  const [showClearToast, setShowClearToast] = useState(false);

  // Jika keranjang kosong, auto-minimize di semua ukuran layar
  useEffect(() => {
    if (itemCount === 0) {
      setIsMinimized(true);
    }
  }, [itemCount]);

  // Saat add to cart (flyingItems bertambah):
  // HANYA auto-expand di desktop (>= 1024px). Tablet dan HP tidak auto-expand, tetap minimized.
  useEffect(() => {
    if (flyingItems.length > 0) {
      if (!isMobileOrTablet()) {
        setIsMinimized(false);
      }
    }
  }, [flyingItems.length]);

  // Sembunyikan floating cart di halaman checkout dan dev payment agar tidak menutupi form
  const isCheckoutOrPay =
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/dev/pay');

  if (isCheckoutOrPay) {
    return null;
  }

  const handleClearCart = () => {
    clearCart();
    setIsMinimized(true);
    setShowClearToast(true);
    setTimeout(() => setShowClearToast(false), 2000);
  };

  const handlePayNow = () => {
    navigate('/checkout');
  };

  return (
    <>
      {/* 1. Flying Ghost Items (Thrown Projectile Animation) */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {flyingItems.map((fly) => {
          let targetX = window.innerWidth - 80;
          let targetY = window.innerHeight - 80;

          if (cartAnchorRef.current) {
            const rect = cartAnchorRef.current.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
          }

          const dx = targetX - fly.startX;
          const dy = targetY - fly.startY;

          return (
            <div
              key={fly.id}
              style={{
                left: `${fly.startX}px`,
                top: `${fly.startY}px`,
                // Pass CSS variables for the parabolic thrown arc
                ['--target-x' as string]: `${dx}px`,
                ['--target-y' as string]: `${dy}px`
              }}
              className="absolute animate-fly-throw pointer-events-none will-change-transform z-[9999]"
              onAnimationEnd={() => {
                triggerCartBump();
                removeFly(fly.id);
              }}
            >
              {/* Inner wrapper handles centering offset to prevent CSS transform keyframe conflict */}
              <div className="-translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-surface border-3 border-ink rounded-lg shadow-[4px_4px_0px_#1A1A1A] flex items-center justify-center p-1.5 overflow-hidden filter drop-shadow-md">
                {fly.imageUrl ? (
                  <img
                    src={fly.imageUrl}
                    alt="Flying item"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-brand" />
                )}
                {/* Neo-brutalist spark badge */}
                <div className="absolute -top-1 -right-1 bg-[#FFE600] text-ink font-mono text-[9px] font-black px-1 border border-ink shadow-xs">
                  +1
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Floating Cart Container in Bottom Right */}
      <div
        ref={cartAnchorRef}
        id="floating-cart-widget"
        className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 select-none transition-all duration-200 ${
          isCartBumping ? 'animate-cart-impact' : ''
        }`}
      >
        {/* Minimized Pill View */}
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            id="floating-cart-minimized-btn"
            className="flex items-center space-x-2.5 bg-surface border-4 border-ink px-4 py-3 shadow-[6px_6px_0px_#1A1A1A] hover:shadow-[8px_8px_0px_#1A1A1A] hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 cursor-pointer group"
            title="Buka Keranjang"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-ink group-hover:text-brand transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-brand text-white font-mono text-xs font-black px-1.5 py-0.2 border-2 border-ink rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] font-bold text-ink/70 uppercase">
                {t.floatingCart.title} ({itemCount})
              </div>
              <div className="text-xs font-extrabold text-brand">
                {itemCount > 0 ? formatIDR(subtotal) : (lang === 'id' ? 'Kosong' : 'Empty')}
              </div>
            </div>
            <ChevronUp className="w-4 h-4 text-ink ml-1" />
          </button>
        ) : (
          /* Expanded Card View */
          <div className="w-[300px] sm:w-[320px] bg-surface border-4 border-ink shadow-[8px_8px_0px_#1A1A1A] flex flex-col overflow-hidden">
            {/* Header Strip */}
            <div className="bg-brand text-white px-3.5 py-2.5 border-b-4 border-ink flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FFE600] text-ink font-mono text-[10px] font-black px-1 py-0.2 border border-ink">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="font-display text-sm tracking-wider uppercase">
                  {t.floatingCart.title}
                </span>
                <span className="bg-white text-ink text-[10px] font-mono font-bold px-1.5 py-0.5 border border-ink">
                  {itemCount} {t.floatingCart.items}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-white/20 border border-transparent hover:border-white text-white cursor-pointer transition-colors"
                  title="Minimize"
                  aria-label="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body: Items Preview or Empty Message */}
            <div className="p-3.5 bg-bg/60 space-y-3">
              {itemCount === 0 ? (
                <div className="text-center py-4 px-2 space-y-1">
                  <p className="font-mono text-xs text-ink/70">
                    {t.cart.emptyTitle}
                  </p>
                  <p className="font-mono text-[11px] text-muted">
                    {t.floatingCart.addedNotice}
                  </p>
                </div>
              ) : (
                <>
                  {/* Items quick list (up to 2 items) */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {items.slice(0, 2).map((item) => (
                      <div
                        key={item.variantId}
                        className="flex items-center space-x-2.5 bg-white border-2 border-ink p-1.5 shadow-xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-9 h-9 object-contain bg-surface border border-ink shrink-0"
                        />
                        <div className="flex-1 min-w-0 font-mono text-xs">
                          <p className="font-bold text-ink truncate text-[11px]">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-ink/60 truncate">
                            {item.size || item.variantName} × {item.quantity}
                          </p>
                        </div>
                        <div className="font-mono text-[11px] font-bold text-brand shrink-0">
                          {formatIDR(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-right font-mono text-[10px] text-ink/60 font-bold">
                        +{items.length - 2} {t.floatingCart.items} lainnya...
                      </div>
                    )}
                  </div>

                  {/* Subtotal row */}
                  <div className="flex items-baseline justify-between border-t-2 border-ink/20 pt-2 font-mono">
                    <span className="text-xs font-bold text-ink uppercase">
                      {t.floatingCart.total}:
                    </span>
                    <span className="font-display text-lg text-brand">
                      {formatIDR(subtotal)}
                    </span>
                  </div>
                </>
              )}

              {/* Toast when cleared */}
              {showClearToast && (
                <div className="bg-emerald-100 border-2 border-ink p-2 flex items-center space-x-1.5 font-mono text-[11px] font-bold text-emerald-900 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{t.floatingCart.clearedToast}</span>
                </div>
              )}

              {/* ACTION BUTTONS: 1. Pay Now & 2. Kosongkan Cart */}
              <div className="space-y-2 pt-1">
                {/* 1. Tombol PAY NOW / BAYAR SEKARANG */}
                <button
                  type="button"
                  id="floating-cart-pay-now-btn"
                  disabled={itemCount === 0}
                  onClick={handlePayNow}
                  className="w-full bg-brand hover:bg-[#5E3B4F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-display text-sm uppercase py-2.5 px-3 border-3 border-ink shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[6px_6px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{t.floatingCart.payNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 2. Tombol KOSONGKAN CART */}
                <button
                  type="button"
                  id="floating-cart-clear-btn"
                  disabled={itemCount === 0}
                  onClick={handleClearCart}
                  className="w-full bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-ink hover:text-red-700 font-mono text-xs font-bold uppercase py-1.5 px-2.5 border-2 border-ink shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.floatingCart.clearCart}</span>
                </button>
              </div>

              {/* Secondary link to /cart */}
              {itemCount > 0 && (
                <div className="text-center pt-0.5">
                  <Link
                    to="/cart"
                    className="font-mono text-[11px] text-ink/70 hover:text-brand hover:underline font-bold"
                  >
                    {t.floatingCart.viewCart} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
