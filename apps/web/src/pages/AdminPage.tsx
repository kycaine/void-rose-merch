import React, { useEffect, useState } from 'react';
import { ShieldAlert, Package, Check, Truck, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { getAdminOrders, shipAdminOrder, formatIDR } from '../lib/api';
import { Order, getOrderStatusLabel } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const AdminPage: React.FC = () => {
  const { lang, isId, t } = useTranslation();
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('vr_admin_token') || '');
  const [inputToken, setInputToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const verifyAndLoad = async (secret: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await getAdminOrders(secret, filterStatus);
      setOrders(data);
      setAuthenticated(true);
      sessionStorage.setItem('vr_admin_token', secret);
    } catch (err: unknown) {
      setAuthError(t.alerts.adminAuthError);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyAndLoad(token);
    }
  }, [filterStatus]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken) return;
    setToken(inputToken.trim());
    verifyAndLoad(inputToken.trim());
  };

  const handleShipOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !trackingNumber) return;

    setShippingLoading(true);
    try {
      await shipAdminOrder(token, selectedOrder.orderNumber, trackingNumber.trim());
      const successMsg = isId
        ? `Pesanan #${selectedOrder.orderNumber} berhasil diperbarui ke status SHIPPED dengan resi ${trackingNumber}! Email notifikasi telah dikirim ke pembeli.`
        : `Order #${selectedOrder.orderNumber} successfully updated to SHIPPED with tracking number ${trackingNumber}! Notification email sent to buyer.`;
      alert(successMsg);
      setSelectedOrder(null);
      setTrackingNumber('');
      verifyAndLoad(token);
    } catch (err) {
      alert(t.alerts.adminShipError + (err as Error).message);
    } finally {
      setShippingLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 w-full select-none">
        <div className="bg-white border-4 border-ink p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <ShieldAlert className="w-12 h-12 text-brand mx-auto" />
            <h1 className="font-display text-2xl text-ink uppercase">
              {isId ? 'PORTAL ADMIN' : 'ADMIN PORTAL'}
            </h1>
            <p className="font-mono text-xs text-ink/70">
              {isId
                ? 'Dilindungi satu rahasia (Secret Token). Tidak memerlukan pendaftaran akun.'
                : 'Protected by a secret token. No account registration required.'}
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 border-2 border-red-700 p-3 text-red-800 text-xs font-mono font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="adminKey" className="block font-mono text-xs font-bold text-ink uppercase mb-1">
                ADMIN SECRET KEY
              </label>
              <input
                type="password"
                id="adminKey"
                required
                placeholder={isId ? 'Masukkan secret key...' : 'Enter secret key...'}
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="neo-input w-full px-4 py-3 text-sm font-mono"
              />
              <span className="text-[12px] font-mono text-ink/50 mt-1 block">
                Dev test: void-rose-super-secret
              </span>
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth disabled={loading}>
              {loading
                ? (isId ? 'MEMVERIFIKASI...' : 'VERIFYING...')
                : (isId ? 'BUKA PORTAL ADMIN →' : 'OPEN ADMIN PORTAL →')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 w-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-4 border-ink gap-4 mb-8">
        <div>
          <div className="font-mono text-xs text-brand font-bold uppercase tracking-widest">
            MANAGEMENT DASHBOARD
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink uppercase tracking-tight">
            {isId ? 'DAFTAR PESANAN BAND' : 'BAND ORDERS MANAGEMENT'}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sessionStorage.removeItem('vr_admin_token');
              setAuthenticated(false);
              setToken('');
            }}
            className="neo-btn bg-white px-4 py-2 text-xs"
          >
            LOGOUT ADMIN
          </button>
        </div>
      </div>

      {/* Filter status */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="font-mono text-xs font-bold mr-2 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1" /> FILTER STATUS:
        </span>
        {['', 'pending', 'paid', 'shipped', 'failed', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`font-mono text-xs font-bold px-3 py-1.5 border-2 border-ink uppercase ${filterStatus === st ? 'bg-brand text-white shadow-xs' : 'bg-white text-ink hover:bg-surface'
              }`}
          >
            {st ? st : (isId ? 'SEMUA' : 'ALL')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white border-3 border-ink p-12 text-center font-mono">
          {isId ? 'MEMUAT PESANAN...' : 'LOADING ORDERS...'}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border-3 border-ink p-12 text-center font-mono">
          {isId ? 'Belum ada pesanan yang sesuai filter.' : 'No orders found for this filter.'}
        </div>
      ) : (
        <div className="bg-white border-4 border-ink shadow-lg overflow-x-auto">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-ink text-white border-b-3 border-ink text-left">
                <th className="p-3.5">ORDER NO</th>
                <th className="p-3.5">{isId ? 'TANGGAL' : 'DATE'}</th>
                <th className="p-3.5">{isId ? 'PEMBELI' : 'BUYER'}</th>
                <th className="p-3.5">TOTAL</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">{isId ? 'RESI PENGIRIMAN' : 'TRACKING NO'}</th>
                <th className="p-3.5">{isId ? 'AKSI' : 'ACTION'}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => {
                const badge = getOrderStatusLabel(ord.status, lang);
                return (
                  <tr key={ord.id} className="border-b-2 border-ink/10 hover:bg-surface/30">
                    <td className="p-3.5 font-bold text-ink">
                      <a
                        href={`/order/${ord.orderNumber}?token=${ord.accessToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand hover:underline"
                      >
                        #{ord.orderNumber}
                      </a>
                    </td>
                    <td className="p-3.5 text-ink/70">
                      {new Date(ord.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-ink">{ord.customerName}</div>
                      <div className="text-[11px] text-ink/60">{ord.shippingCity}</div>
                    </td>
                    <td className="p-3.5 font-bold">{formatIDR(ord.total)}</td>
                    <td className="p-3.5">
                      <span
                        className="px-2 py-0.5 border border-ink font-bold text-[10px]"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-brand">
                      {ord.trackingNumber || '-'}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setTrackingNumber(ord.trackingNumber || '');
                        }}
                        className="neo-btn bg-accent-2 text-ink px-2.5 py-1 text-[11px]"
                      >
                        {isId ? 'INPUT RESI' : 'SET TRACKING'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Input Resi */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-ink/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-ink p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b-2 border-ink pb-2">
              <h3 className="font-display text-lg text-ink">
                {isId ? 'PENGIRIMAN #' : 'SHIPMENT #'}{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="font-mono text-sm font-bold text-ink hover:text-brand"
              >
                ✕
              </button>
            </div>

            <p className="font-mono text-xs text-ink/70">
              {isId ? 'Penerima: ' : 'Recipient: '}<strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerEmail})<br />
              {isId ? 'Tujuan: ' : 'Destination: '}{selectedOrder.shippingAddress}, {selectedOrder.shippingCity}
            </p>

            <form onSubmit={handleShipOrder} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold text-ink mb-1">
                  {isId ? 'NOMOR RESI PENGIRIMAN (JNE / J&T / SICEPAT) *' : 'COURIER TRACKING NUMBER (JNE / J&T / SICEPAT / DHL) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isId ? 'misal: JNE10928471928' : 'e.g. JNE10928471928'}
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  className="neo-input w-full px-3 py-2.5 font-mono text-sm uppercase font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="neo-btn bg-white text-ink px-4 py-2 text-xs"
                >
                  {isId ? 'BATAL' : 'CANCEL'}
                </button>
                <Button type="submit" variant="primary" size="sm" disabled={shippingLoading}>
                  <Truck className="w-4 h-4 mr-1" />
                  {shippingLoading
                    ? (isId ? 'MENYIMPAN...' : 'SAVING...')
                    : (isId ? 'SIMPAN & KIRIM EMAIL RESI' : 'SAVE & SEND TRACKING EMAIL')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
