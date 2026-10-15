import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, QrCode, Building2, CreditCard, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { useCartStore } from '../store/cartStore';
import { submitCheckout, formatIDR } from '../lib/api';
import {
  CheckoutFormInput,
  FLAT_RATE_SHIPPING_IDR,
  FREE_SHIPPING_THRESHOLD_IDR,
  PAYMENT_METHODS,
  PaymentMethodOption
} from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: Record<string, unknown>) => void;
    };
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState<'QRIS' | 'VA' | 'PAYLATER'>('QRIS');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('qris');

  const [formData, setFormData] = useState<Omit<CheckoutFormInput, 'items'>>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingProvince: 'DKI Jakarta',
    shippingCity: 'Jakarta Selatan',
    shippingDistrict: 'Kebayoran Baru',
    shippingPostalCode: '12180',
    shippingAddress: '',
    notes: '',
    paymentMethod: 'qris'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamically load Midtrans Snap JS
  React.useEffect(() => {
    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
    const snapScriptUrl = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-EqaDBB-Z9wVfpigC';
    if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = snapScriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD_IDR ? 0 : FLAT_RATE_SHIPPING_IDR;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display text-3xl text-ink uppercase">{t.checkout.emptyTitle}</h2>
        <Link to="/shop">
          <Button variant="primary">{t.checkout.backToShop}</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload: CheckoutFormInput = {
        ...formData,
        paymentMethod: selectedMethodId,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
      };

      const result = await submitCheckout(payload);

      // Clear local cart
      clearCart();

      // If simulated mode, redirect to Dev Pay page with selected payment method
      if (result.paymentMode === 'simulated') {
        const methodParam = encodeURIComponent(selectedMethodId);
        navigate(`/dev/pay/${result.orderNumber}?token=${result.accessToken}&method=${methodParam}`);
        return;
      }

      // If Midtrans mode
      if (result.paymentToken && window.snap) {
        window.snap.pay(result.paymentToken, {
          onSuccess: () => navigate(result.trackingUrl),
          onPending: () => navigate(result.trackingUrl),
          onError: () => navigate(result.trackingUrl),
          onClose: () => navigate(result.trackingUrl)
        });
      } else {
        navigate(result.trackingUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.alerts.checkoutError;
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 w-full">
      {/* Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-4 border-ink gap-4 mb-8">
        <div>
          <Link to="/cart" className="inline-flex items-center font-mono text-xs text-ink/70 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {t.cart.title}
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl text-ink uppercase tracking-tight">
            {t.checkout.title}
          </h1>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs font-bold">
          <Link to="/cart" className="bg-white text-ink border-2 border-ink px-3 py-1 hover:bg-surface">
            {t.cart.step1}
          </Link>
          <span className="text-ink/40">→</span>
          <span className="bg-brand text-white border-2 border-ink px-3 py-1 shadow-xs">
            {t.cart.step2}
          </span>
          <span className="text-ink/40">→</span>
          <span className="bg-white text-ink/60 border-2 border-ink/40 px-3 py-1">
            {t.cart.step3}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-3 border-red-700 p-4 mb-8 flex items-center space-x-3 text-red-800 font-mono text-sm">
          <AlertCircle className="w-6 h-6 shrink-0 text-red-700" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form & Summary Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Guest Shipping Form */}
        <div className="lg:col-span-7 bg-white border-4 border-ink p-6 sm:p-8 shadow-lg space-y-6">
          <div className="border-b-3 border-ink pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl text-ink uppercase">
              {t.checkout.buyerTitle}
            </h2>
            <span className="bg-surface border-2 border-ink px-2.5 py-0.5 text-[10px] font-mono font-bold">
              GUEST
            </span>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="customerName" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                {t.checkout.fullName}
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleChange}
                placeholder={t.checkout.fullNamePlaceholder}
                className="neo-input w-full px-4 py-3 text-sm"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerEmail" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                  {t.checkout.email}
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder={t.checkout.emailPlaceholder}
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                  {t.checkout.phone}
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder={t.checkout.phonePlaceholder}
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="pt-2 border-t-2 border-ink/20 font-display text-lg uppercase text-ink">
              {t.checkout.shippingTitle}
            </div>

            {/* Province & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingProvince" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                  {t.checkout.province}
                </label>
                <input
                  type="text"
                  id="shippingProvince"
                  name="shippingProvince"
                  required
                  value={formData.shippingProvince}
                  onChange={handleChange}
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label htmlFor="shippingCity" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                  {t.checkout.city}
                </label>
                <input
                  type="text"
                  id="shippingCity"
                  name="shippingCity"
                  required
                  value={formData.shippingCity}
                  onChange={handleChange}
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* District & Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shippingDistrict" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                  {t.checkout.district}
                </label>
                <input
                  type="text"
                  id="shippingDistrict"
                  name="shippingDistrict"
                  required
                  value={formData.shippingDistrict}
                  onChange={handleChange}
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label htmlFor="shippingPostalCode" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                  {t.checkout.postalCode}
                </label>
                <input
                  type="text"
                  id="shippingPostalCode"
                  name="shippingPostalCode"
                  required
                  value={formData.shippingPostalCode}
                  onChange={handleChange}
                  className="neo-input w-full px-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* Full Street Address */}
            <div>
              <label htmlFor="shippingAddress" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                {t.checkout.fullAddress}
              </label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                required
                rows={3}
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder={t.checkout.fullAddressPlaceholder}
                className="neo-input w-full px-4 py-3 text-sm"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                {t.checkout.notes}
              </label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder={t.checkout.notesPlaceholder}
                className="neo-input w-full px-4 py-3 text-sm"
              />
            </div>

            {/* 3. METODE PEMBAYARAN */}
            <div className="pt-4 border-t-3 border-ink space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg sm:text-xl text-ink uppercase">
                    {t.checkout.paymentSectionTitle}
                  </h3>
                  <p className="font-mono text-xs text-ink/70">
                    {t.checkout.paymentSectionDesc}
                  </p>
                </div>
                <div className="hidden sm:inline-block bg-emerald-100 text-emerald-900 border-2 border-ink px-2.5 py-1 font-mono text-[11px] font-bold">
                  ✓ {t.checkout.adminFeeFree}
                </div>
              </div>

              {/* Category Tabs: QRIS | VA BANK | PAYLATER */}
              <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('QRIS');
                    setSelectedMethodId('qris');
                  }}
                  className={`p-2.5 sm:p-3 border-3 border-ink flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    activeCategory === 'QRIS'
                      ? 'bg-brand text-white shadow-[3px_3px_0px_#1A1A1A] -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-surface'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[10px] sm:text-xs uppercase text-center leading-tight">
                    {t.checkout.paymentCategoryQris}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('VA');
                    if (!selectedMethodId.startsWith('va_')) {
                      setSelectedMethodId('va_bca');
                    }
                  }}
                  className={`p-2.5 sm:p-3 border-3 border-ink flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    activeCategory === 'VA'
                      ? 'bg-brand text-white shadow-[3px_3px_0px_#1A1A1A] -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-surface'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px] sm:text-xs uppercase text-center leading-tight">
                    {t.checkout.paymentCategoryVa}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('PAYLATER');
                    if (!selectedMethodId.startsWith('paylater_')) {
                      setSelectedMethodId('paylater_gopay');
                    }
                  }}
                  className={`p-2.5 sm:p-3 border-3 border-ink flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    activeCategory === 'PAYLATER'
                      ? 'bg-brand text-white shadow-[3px_3px_0px_#1A1A1A] -translate-y-0.5'
                      : 'bg-white text-ink hover:bg-surface'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] sm:text-xs uppercase text-center leading-tight">
                    {t.checkout.paymentCategoryPaylater}
                  </span>
                </button>
              </div>

              {/* Method Cards inside Active Category */}
              <div className="space-y-2 pt-1">
                {PAYMENT_METHODS.filter((m) => m.category === activeCategory).map((m) => {
                  const isSelected = selectedMethodId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMethodId(m.id)}
                      className={`border-3 border-ink p-3.5 flex items-start justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white ring-2 ring-brand shadow-[4px_4px_0px_#1A1A1A] -translate-y-0.5'
                          : 'bg-surface/50 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="pt-0.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setSelectedMethodId(m.id)}
                            className="w-4 h-4 text-brand accent-brand cursor-pointer"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-display text-sm text-ink">{m.name}</span>
                            {m.badge && (
                              <span className="bg-[#FFE600] text-ink font-mono text-[10px] font-bold px-1.5 py-0.2 border border-ink">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-ink/70 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-700 px-1.5 py-0.5">
                        Biaya Rp 0
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Place Order */}
        <div className="lg:col-span-5 bg-surface border-4 border-ink p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="font-display text-2xl text-ink border-b-3 border-ink pb-3 uppercase tracking-tight">
            {t.checkout.summaryTitle}
          </h2>

          {/* Items Preview */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.variantId} className="flex justify-between items-center text-sm font-mono border-b border-ink/20 pb-2">
                <div>
                  <div className="font-bold text-ink">{i.productName}</div>
                  <div className="text-xs text-brand">{i.variantName} × {i.quantity}</div>
                </div>
                <div className="font-bold">{formatIDR(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-2.5 font-mono text-sm border-t-2 border-ink pt-3">
            <div className="flex justify-between">
              <span className="text-ink/80">{t.cart.subtotal}</span>
              <span className="font-bold">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink/80">{t.cart.shipping}</span>
              <span className="font-bold">
                {shippingCost === 0 ? t.cart.free : formatIDR(shippingCost)}
              </span>
            </div>
            <div className="border-t-3 border-ink pt-3 flex justify-between items-baseline">
              <span className="font-display text-lg text-ink">{t.cart.total}</span>
              <span className="font-display text-2xl sm:text-3xl text-brand">
                {formatIDR(total)}
              </span>
            </div>
          </div>

          {/* Selected Payment Method Display */}
          <div className="bg-white border-2 border-ink p-3 space-y-1 font-mono text-xs shadow-xs">
            <div className="flex justify-between items-center text-ink/70">
              <span>Metode Pembayaran:</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 border border-emerald-700">
                Bebas Admin
              </span>
            </div>
            <div className="font-display text-sm text-brand truncate">
              {PAYMENT_METHODS.find((m) => m.id === selectedMethodId)?.name || selectedMethodId}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              id="pay-button"
            >
              <Lock className="w-4 h-4 mr-1" />
              {loading ? t.checkout.processing : `${t.checkout.placeOrderBtn} →`}
            </Button>

            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-ink/70 pt-2 text-center">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
              <span>{t.checkout.secureNotice}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
