import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../components/Button';
import { useCartStore } from '../store/cartStore';
import { validateCart, formatIDR } from '../lib/api';
import { FLAT_RATE_SHIPPING_IDR, FREE_SHIPPING_THRESHOLD_IDR } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [serverCalculation, setServerCalculation] = useState<{
    subtotal: number;
    shippingCost: number;
    total: number;
  } | null>(null);

  // Validate cart against server on mount or when items change
  useEffect(() => {
    if (items.length === 0) {
      setServerCalculation(null);
      return;
    }

    validateCart(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })))
      .then((calc) => setServerCalculation(calc))
      .catch((err) => console.error('Cart validation warning:', err));
  }, [items]);

  const clientSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const subtotal = serverCalculation ? serverCalculation.subtotal : clientSubtotal;
  const shippingCost =
    serverCalculation !== null
      ? serverCalculation.shippingCost
      : subtotal >= FREE_SHIPPING_THRESHOLD_IDR
      ? 0
      : FLAT_RATE_SHIPPING_IDR;
  const total = serverCalculation ? serverCalculation.total : subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-surface border-4 border-ink mx-auto flex items-center justify-center shadow-md">
          <ShoppingBag className="w-10 h-10 text-ink" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-ink uppercase">{t.cart.emptyTitle}</h1>
        <p className="font-body text-base text-ink/70 max-w-md mx-auto">
          {t.cart.emptyDesc}
        </p>
        <div>
          <Link to="/shop">
            <Button variant="primary" size="lg">
              {t.cart.startShopping}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 w-full">
      {/* 1. PAGE HEADER & STEPS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-4 border-ink gap-4 mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-ink tracking-tight uppercase">
          {t.cart.title}
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 font-mono text-xs font-bold">
          <span className="bg-brand text-white border-2 border-ink px-3 py-1 shadow-xs">
            {t.cart.step1}
          </span>
          <span className="text-ink/40">→</span>
          <span className="bg-white text-ink/60 border-2 border-ink/40 px-3 py-1">
            {t.cart.step2}
          </span>
          <span className="text-ink/40">→</span>
          <span className="bg-white text-ink/60 border-2 border-ink/40 px-3 py-1">
            {t.cart.step3}
          </span>
        </div>
      </div>

      {/* 2. BODY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="bg-white border-3 border-ink p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                {/* Thumb */}
                <div className="w-20 h-20 bg-accent-2 border-2 border-ink shrink-0 p-1 flex items-center justify-center">
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-display text-base sm:text-lg text-ink leading-tight">
                    {item.productName}
                  </h3>
                  <div className="font-mono text-xs text-brand font-bold uppercase">
                    {item.variantName}
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="inline-flex items-center text-xs text-red-600 font-mono font-bold hover:underline pt-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                  </button>
                </div>
              </div>

              {/* Stepper & Price Tag */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4">
                <div className="flex items-center border-2 border-ink bg-surface">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center font-display text-sm hover:bg-white cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 h-8 flex items-center justify-center font-mono font-bold text-xs border-x-2 border-ink bg-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center font-display text-sm hover:bg-white cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="bg-brand text-white border-2 border-ink px-3 py-1 font-mono text-sm font-bold shadow-xs whitespace-nowrap">
                  {formatIDR(item.price * item.quantity)}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Link to="/shop" className="font-mono text-xs font-bold text-ink hover:text-brand hover:underline">
              {t.cart.continueShopping}
            </Link>
            <button
              onClick={clearCart}
              className="font-mono text-xs text-red-700 hover:underline cursor-pointer"
            >
              {t.cart.clearCart}
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-surface border-4 border-ink p-6 shadow-xl space-y-6">
          <h2 className="font-display text-2xl text-ink border-b-3 border-ink pb-3 uppercase tracking-tight">
            {t.cart.summaryTitle}
          </h2>

          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-ink/80">{t.cart.subtotal} ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-bold">{formatIDR(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-ink/80">{t.cart.shipping}</span>
              <span className="font-bold">
                {shippingCost === 0 ? (
                  <span className="bg-emerald-600 text-white px-2 py-0.5 text-xs font-bold">
                    {t.cart.free}
                  </span>
                ) : (
                  formatIDR(shippingCost)
                )}
              </span>
            </div>

            {shippingCost === 0 ? (
              <div className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 p-2">
                {t.cart.freeShippingUnlocked}
              </div>
            ) : (
              <div className="text-xs text-ink/70 bg-bg p-2 border border-ink/20">
                {t.cart.freeShippingNotice}
              </div>
            )}

            <div className="border-t-3 border-ink pt-3 flex justify-between text-base font-bold">
              <span>{t.cart.total}</span>
              <span className="text-brand text-lg">{formatIDR(total)}</span>
            </div>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout')}
              id="proceed-checkout-btn"
            >
              {t.cart.checkoutBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
