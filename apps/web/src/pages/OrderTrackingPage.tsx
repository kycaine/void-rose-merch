import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Truck, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { getOrder, createPayment, formatIDR } from '../lib/api';
import { Order, ORDER_STATUS_LABELS } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const { t } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    getOrder(orderNumber, token)
      .then((data) => setOrder(data))
      .catch((err) => {
        console.error(err);
        setErrorMsg('Pesanan tidak ditemukan atau akses token tidak valid.');
      })
      .finally(() => setLoading(false));
  }, [orderNumber, token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRepay = async () => {
    if (!order || !order.accessToken) return;
    setRepaying(true);
    try {
      const res = await createPayment(order.orderNumber, order.accessToken);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      alert('Gagal menginisiasi pembayaran ulang: ' + (err as Error).message);
      setRepaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-mono">
        <div className="animate-pulse font-display text-2xl">{t.orderTracking.loading}</div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-red-50 border-3 border-red-700 p-8 shadow-md space-y-4">
          <AlertCircle className="w-12 h-12 text-red-700 mx-auto" />
          <h2 className="font-display text-2xl text-red-800">{t.orderTracking.notFoundTitle}</h2>
          <p className="font-body text-sm text-red-700">
            {errorMsg || t.orderTracking.notFoundDesc}
          </p>
          <div className="pt-2">
            <Link to="/check-order">
              <Button variant="primary">{t.orderTracking.checkViaLookup}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = ORDER_STATUS_LABELS[order.status] || {
    label: order.status.toUpperCase(),
    bg: '#1A1A1A',
    color: '#FFFFFF'
  };

  // Timeline Steps
  const steps = [
    { key: 'created', label: t.orderTracking.title, completed: true },
    { key: 'paid', label: 'Payment Done', completed: ['paid', 'shipped', 'completed'].includes(order.status) },
    { key: 'shipped', label: 'Shipped', completed: ['shipped', 'completed'].includes(order.status) },
    { key: 'completed', label: 'Completed', completed: order.status === 'completed' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 w-full select-none">
      {/* 1. HEADER CARD */}
      <div className="bg-surface border-4 border-ink p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-3 border-ink pb-6 gap-4">
          <div>
            <div className="font-mono text-xs text-ink/70">{t.orderTracking.title}</div>
            <h1 className="font-display text-2xl sm:text-3xl text-ink">
              #{order.orderNumber}
            </h1>
          </div>

          <div
            className="border-3 border-ink px-4 py-2 font-mono text-xs sm:text-sm font-bold shadow-xs uppercase"
            style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
          >
            {statusMeta.label}
          </div>
        </div>

        {/* Shareable Token Link Bar */}
        <div className="bg-white border-2 border-ink p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="truncate max-w-lg text-ink/70">
            <span className="font-bold text-ink">Private Link:</span> {window.location.href}
          </div>
          <button
            onClick={handleCopyLink}
            className="neo-btn bg-accent-2 text-ink px-3 py-1 text-xs shrink-0 flex items-center space-x-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.orderTracking.linkCopied : t.orderTracking.copyLink}</span>
          </button>
        </div>

        {/* 2. TIMELINE PROGRESS */}
        <div className="py-4 border-y-3 border-ink">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {steps.map((st, i) => (
              <div
                key={st.key}
                className={`p-3 border-2 border-ink font-mono text-xs transition-all ${
                  st.completed
                    ? 'bg-brand text-white font-bold shadow-xs'
                    : 'bg-white/60 text-ink/40'
                }`}
              >
                <div className="text-base mb-1">{st.completed ? '✓' : i + 1}</div>
                <div>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Resi Banner if Shipped */}
        {order.trackingNumber && (
          <div className="bg-white border-3 border-ink p-4 flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 bg-surface border-2 border-ink flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-brand" />
            </div>
            <div>
              <div className="font-mono text-xs text-ink/70 font-bold uppercase">{t.orderTracking.trackingNumberLabel}</div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-brand tracking-wider">
                {order.trackingNumber}
              </div>
            </div>
          </div>
        )}

        {/* Re-pay button if failed or pending */}
        {['pending', 'failed', 'expired'].includes(order.status) && (
          <div className="bg-amber-50 border-3 border-ink p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-ink">
              <strong>Status #{order.orderNumber}: {order.status.toUpperCase()}.</strong>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={repaying}
              onClick={handleRepay}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {repaying ? t.orderTracking.repaying : t.orderTracking.repayBtn}
            </Button>
          </div>
        )}

        {/* 3. ORDER ITEMS & ADDRESS DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-display text-base text-ink border-b-2 border-ink pb-1 uppercase">
              {t.orderTracking.orderItems} ({order.items?.length || 0})
            </h3>
            <div className="space-y-2 bg-white border-2 border-ink p-4 font-mono text-xs">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-ink/10 pb-2 last:border-0 last:pb-0">
                  <div>
                    <div className="font-bold text-ink">{item.productName}</div>
                    <div className="text-[11px] text-brand">{item.variantName} × {item.quantity}</div>
                  </div>
                  <div className="font-bold">{formatIDR(item.subtotal)}</div>
                </div>
              ))}

              <div className="border-t-2 border-ink pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatIDR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shippingCost === 0 ? t.cart.free : formatIDR(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-display text-sm text-brand pt-1">
                  <span>TOTAL:</span>
                  <span>{formatIDR(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="font-display text-base text-ink border-b-2 border-ink pb-1 uppercase">
              {t.orderTracking.shippingAddress}
            </h3>
            <div className="bg-white border-2 border-ink p-4 font-mono text-xs space-y-1.5 leading-relaxed">
              <div className="font-bold text-sm text-ink">{order.customerName}</div>
              <div className="text-brand">{order.customerPhone}</div>
              <div className="text-ink/70">{order.customerEmail}</div>
              <div className="pt-2 border-t border-ink/10 text-ink">
                {order.shippingAddress}
              </div>
              <div className="text-ink/80">
                {order.shippingDistrict}, {order.shippingCity}
              </div>
              <div className="text-ink/80">
                {order.shippingProvince} {order.shippingPostalCode}
              </div>
              {order.notes && (
                <div className="pt-2 text-[11px] text-ink/70 italic">
                  Note: "{order.notes}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
