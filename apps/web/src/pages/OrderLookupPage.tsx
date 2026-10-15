import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { lookupOrder } from '../lib/api';
import { useTranslation } from '../i18n/translations';

export const OrderLookupPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const order = await lookupOrder(orderNumber.trim(), email.trim());
      navigate(`/order/${order.orderNumber}?token=${order.accessToken}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Pesanan tidak ditemukan atau email salah';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-16 w-full select-none">
      <div className="bg-white border-4 border-ink p-6 sm:p-10 shadow-xl space-y-6">
        <div className="border-b-3 border-ink pb-4">
          <div className="inline-block bg-accent-2 border-2 border-ink px-3 py-1 font-mono text-xs font-bold uppercase mb-2">
            {t.orderLookup.badge}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink uppercase tracking-tight">
            {t.orderLookup.title}
          </h1>
          <p className="font-body text-sm text-ink/70 mt-1">
            {t.orderLookup.description}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-3 border-red-700 p-4 flex items-center space-x-3 text-red-800 font-mono text-xs">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label htmlFor="orderNumber" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
              {t.orderLookup.orderNumberLabel}
            </label>
            <input
              type="text"
              id="orderNumber"
              required
              placeholder={t.orderLookup.orderNumberPlaceholder}
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="neo-input w-full px-4 py-3 text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label htmlFor="lookupEmail" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
              {t.orderLookup.emailLabel}
            </label>
            <input
              type="email"
              id="lookupEmail"
              required
              placeholder={t.orderLookup.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neo-input w-full px-4 py-3 text-sm"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              <Search className="w-4 h-4 mr-1" />
              {loading ? t.orderLookup.searching : t.orderLookup.submitBtn}
            </Button>
          </div>
        </form>

        <div className="border-t-2 border-ink/20 pt-4 text-center font-mono text-xs text-ink/60">
          {t.orderLookup.helpText}{' '}
          <a href="mailto:support@voidrose.com" className="text-brand underline font-bold">
            support@voidrose.com
          </a>
        </div>
      </div>
    </div>
  );
};
