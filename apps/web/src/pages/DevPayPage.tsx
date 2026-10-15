import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Building2,
  CreditCard,
  Copy,
  Check,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../components/Button';
import { getOrder, submitSimulatedPayment, formatIDR } from '../lib/api';
import { Order, PAYMENT_METHODS, PaymentMethodOption } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const DevPayPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const navigate = useNavigate();
  const { lang, t } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active payment method
  const initialMethodId = searchParams.get('method') || 'qris';
  const [currentMethodId, setCurrentMethodId] = useState<string>(initialMethodId);
  const [copiedVA, setCopiedVA] = useState(false);
  const [selectedTenor, setSelectedTenor] = useState<number>(1);
  const [activeStepTab, setActiveStepTab] = useState<'mbanking' | 'atm' | 'ibanking'>('mbanking');
  const [countdown, setCountdown] = useState<number>(15 * 60); // 15 mins timer

  useEffect(() => {
    if (!orderNumber) return;
    getOrder(orderNumber, token)
      .then((data) => {
        setOrder(data);
        if (data.paymentMethod && !searchParams.get('method')) {
          setCurrentMethodId(data.paymentMethod);
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Pesanan tidak ditemukan atau link pembayaran tidak valid');
      })
      .finally(() => setLoading(false));
  }, [orderNumber, token]);

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentMethod: PaymentMethodOption =
    PAYMENT_METHODS.find((m) => m.id === currentMethodId) || PAYMENT_METHODS[0];

  // Generate deterministic VA Number
  const cleanOrderNum = (order?.orderNumber || '000000').replace(/[^0-9]/g, '').padEnd(8, '7');
  const vaNumber = `${currentMethod.vaPrefix || '8808'} ${cleanOrderNum.slice(0, 4)} ${cleanOrderNum.slice(4, 8)} ${cleanOrderNum.slice(0, 4)}`;

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s+/g, ''));
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleSimulate = async (action: 'success' | 'fail') => {
    if (!orderNumber) return;
    setProcessing(true);
    setErrorMsg(null);

    try {
      const res = await submitSimulatedPayment(orderNumber, action);
      if (res.success) {
        navigate(`/order/${orderNumber}?token=${token || order?.accessToken}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses simulasi pembayaran';
      setErrorMsg(msg);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-mono">
        <div className="animate-pulse font-display text-2xl">MEMUAT SIMULASI PEMBAYARAN...</div>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-red-50 border-3 border-red-700 p-6 text-red-800 font-mono">
          {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 w-full select-none">
      {/* 1. DEV MODE SIMULATED PAYMENT BANNER */}
      <div className="bg-[#FFE600] border-4 border-ink p-4 mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-ink text-white px-2.5 py-0.5 font-mono text-xs font-bold tracking-widest uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>DEV MODE — MULTI-PAYMENT SIMULATOR</span>
            </div>
            <p className="font-mono text-xs font-bold text-ink">
              Uji coba aneka opsi pembayaran: QRIS, Aneka Virtual Account Bank, dan PayLater.
            </p>
          </div>

          {/* Quick Method Switcher Dropdown / Pills */}
          <div className="flex items-center space-x-1 font-mono text-xs font-bold">
            <span className="text-ink/70 mr-1 hidden sm:inline">Pindah Opsi:</span>
            <select
              value={currentMethodId}
              onChange={(e) => {
                setCurrentMethodId(e.target.value);
                setSearchParams({ token: token || '', method: e.target.value });
              }}
              className="bg-white border-2 border-ink px-2.5 py-1 text-xs font-mono font-bold shadow-xs cursor-pointer outline-none"
            >
              <optgroup label="QRIS & E-Wallet">
                {PAYMENT_METHODS.filter((m) => m.category === 'QRIS').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Virtual Account Bank">
                {PAYMENT_METHODS.filter((m) => m.category === 'VA').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="PayLater & Cicilan">
                {PAYMENT_METHODS.filter((m) => m.category === 'PAYLATER').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Realistic Payment Method Interface */}
        <div className="lg:col-span-7 bg-surface border-4 border-ink p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header of Payment Box */}
          <div className="flex items-center justify-between border-b-3 border-ink pb-4">
            <div className="flex items-center space-x-2.5">
              {currentMethod.category === 'QRIS' && <QrCode className="w-6 h-6 text-brand" />}
              {currentMethod.category === 'VA' && <Building2 className="w-6 h-6 text-brand" />}
              {currentMethod.category === 'PAYLATER' && <CreditCard className="w-6 h-6 text-brand" />}
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-ink leading-tight">
                  {currentMethod.shortName}
                </h2>
                <span className="font-mono text-xs text-ink/70">
                  {currentMethod.categoryLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 bg-white border-2 border-ink px-2.5 py-1 font-mono text-xs font-bold text-ink">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>{formatTimer(countdown)}</span>
            </div>
          </div>

          {/* METHOD 1: QRIS INTERFACE */}
          {currentMethod.category === 'QRIS' && (
            <div className="space-y-5 text-center">
              <div className="bg-white border-3 border-ink p-6 inline-block mx-auto shadow-[4px_4px_0px_#1A1A1A] max-w-xs">
                <div className="border-b-2 border-ink pb-2 mb-3 flex items-center justify-between">
                  <span className="font-display text-sm tracking-wider text-ink">QRIS</span>
                  <span className="font-mono text-[10px] text-ink/60">NMID: ID1024892019284</span>
                </div>

                {/* SVG QR CODE */}
                <div className="w-48 h-48 mx-auto bg-white p-2 border-2 border-ink flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-ink">
                    <rect width="100" height="100" fill="white" />
                    {/* Top Left Marker */}
                    <rect x="5" y="5" width="28" height="28" fill="#1A1A1A" />
                    <rect x="9" y="9" width="20" height="20" fill="white" />
                    <rect x="13" y="13" width="12" height="12" fill="#85586F" />
                    {/* Top Right Marker */}
                    <rect x="67" y="5" width="28" height="28" fill="#1A1A1A" />
                    <rect x="71" y="9" width="20" height="20" fill="white" />
                    <rect x="75" y="13" width="12" height="12" fill="#85586F" />
                    {/* Bottom Left Marker */}
                    <rect x="5" y="67" width="28" height="28" fill="#1A1A1A" />
                    <rect x="9" y="71" width="20" height="20" fill="white" />
                    <rect x="13" y="75" width="12" height="12" fill="#85586F" />
                    {/* Data matrix dots */}
                    <rect x="38" y="10" width="8" height="8" fill="#1A1A1A" />
                    <rect x="50" y="15" width="6" height="6" fill="#1A1A1A" />
                    <rect x="38" y="25" width="6" height="12" fill="#1A1A1A" />
                    <rect x="48" y="28" width="10" height="8" fill="#1A1A1A" />
                    <rect x="12" y="38" width="18" height="6" fill="#1A1A1A" />
                    <rect x="35" y="42" width="12" height="12" fill="#85586F" />
                    <rect x="52" y="40" width="8" height="15" fill="#1A1A1A" />
                    <rect x="65" y="38" width="10" height="6" fill="#1A1A1A" />
                    <rect x="80" y="45" width="12" height="8" fill="#1A1A1A" />
                    <rect x="38" y="60" width="8" height="8" fill="#1A1A1A" />
                    <rect x="50" y="65" width="12" height="6" fill="#1A1A1A" />
                    <rect x="68" y="60" width="8" height="18" fill="#1A1A1A" />
                    <rect x="80" y="68" width="14" height="14" fill="#1A1A1A" />
                    <rect x="38" y="78" width="16" height="8" fill="#1A1A1A" />
                    <rect x="58" y="80" width="6" height="14" fill="#1A1A1A" />
                  </svg>
                </div>

                <div className="pt-2 text-center font-mono text-[10px] text-ink font-bold">
                  VOID/ROSE MERCH OFFICIAL
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <p className="font-bold text-ink">
                  Scan dengan GoPay, OVO, Dana, ShopeePay, BCA, Livin, atau Mobile Banking lainnya.
                </p>
                <p className="text-[11px] text-ink/70">
                  Verifikasi transaksi berlangsung otomatis dalam 5-10 detik.
                </p>
              </div>

              {/* Direct Simulated Action */}
              <button
                type="button"
                disabled={processing || order?.status === 'paid'}
                onClick={() => handleSimulate('success')}
                id="sim-pay-qris-btn"
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-display text-base uppercase py-3.5 px-4 border-3 border-ink shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[6px_6px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>SIMULASI SCAN & BAYAR QRIS BERHASIL</span>
              </button>
            </div>
          )}

          {/* METHOD 2: VIRTUAL ACCOUNT (BCA, MANDIRI, BNI, BRI, PERMATA, CIMB) */}
          {currentMethod.category === 'VA' && (
            <div className="space-y-5">
              <div className="bg-white border-3 border-ink p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-ink/20 pb-2">
                  <span className="font-mono text-xs text-ink/70 uppercase">
                    NOMOR VIRTUAL ACCOUNT
                  </span>
                  <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 border border-brand/30">
                    {currentMethod.name}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-ink select-all">
                    {vaNumber}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyVA}
                    className="inline-flex items-center justify-center space-x-1.5 bg-surface hover:bg-accent-2 border-2 border-ink px-3 py-1.5 font-mono text-xs font-bold text-ink transition-colors cursor-pointer"
                  >
                    {copiedVA ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span className="text-emerald-800">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin VA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="bg-white border-2 border-ink p-4 space-y-3 font-mono text-xs">
                <div className="font-bold text-ink uppercase flex items-center justify-between">
                  <span>{currentMethod.instructionTitle}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-ink/80 leading-relaxed">
                  {currentMethod.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Direct Simulated Action */}
              <button
                type="button"
                disabled={processing || order?.status === 'paid'}
                onClick={() => handleSimulate('success')}
                id="sim-pay-va-btn"
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-display text-base uppercase py-3.5 px-4 border-3 border-ink shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[6px_6px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>SIMULASI TRANSFER {currentMethod.shortName} BERHASIL</span>
              </button>
            </div>
          )}

          {/* METHOD 3: PAYLATER (GOPAY LATER, KREDIVO, AKULAKU, SPAYLATER) */}
          {currentMethod.category === 'PAYLATER' && (
            <div className="space-y-5">
              <div className="bg-white border-3 border-ink p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-ink/20 pb-2">
                  <span className="font-mono text-xs text-ink/70 uppercase">
                    PEMBIAYAAN {currentMethod.shortName.toUpperCase()}
                  </span>
                  <span className="bg-[#FFE600] text-ink font-mono text-xs font-bold px-2 py-0.5 border border-ink">
                    Limit: Rp 15.000.000
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs font-bold text-ink uppercase">
                    PILIH SKEMA CICILAN:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                    {[
                      { tenor: 1, label: '30 Hari', rate: '0% Bunga' },
                      { tenor: 3, label: '3 Bulan', rate: '2.5% / bln' },
                      { tenor: 6, label: '6 Bulan', rate: '2.5% / bln' },
                      { tenor: 12, label: '12 Bulan', rate: '2.5% / bln' }
                    ].map((t) => {
                      const monthly = Math.round((order?.total || 0) / t.tenor);
                      const isSelected = selectedTenor === t.tenor;
                      return (
                        <div
                          key={t.tenor}
                          onClick={() => setSelectedTenor(t.tenor)}
                          className={`p-2.5 border-2 border-ink cursor-pointer text-center space-y-0.5 transition-all ${
                            isSelected
                              ? 'bg-brand text-white shadow-xs'
                              : 'bg-surface hover:bg-white text-ink'
                          }`}
                        >
                          <div className="font-bold">{t.label}</div>
                          <div className="text-[11px] font-extrabold">{formatIDR(monthly)}</div>
                          <div className="text-[9px] opacity-80">{t.rate}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="bg-white border-2 border-ink p-4 space-y-2 font-mono text-xs">
                <div className="font-bold text-ink uppercase">
                  {currentMethod.instructionTitle}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-ink/80 leading-relaxed">
                  {currentMethod.steps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Direct Simulated Action */}
              <button
                type="button"
                disabled={processing || order?.status === 'paid'}
                onClick={() => handleSimulate('success')}
                id="sim-pay-paylater-btn"
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-display text-base uppercase py-3.5 px-4 border-3 border-ink shadow-[4px_4px_0px_#1A1A1A] hover:shadow-[6px_6px_0px_#1A1A1A] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>OTORISASI & BAYAR {currentMethod.shortName.toUpperCase()} (SUKSES)</span>
              </button>
            </div>
          )}

          {/* SIMULATE FAIL BUTTON (Common to all methods) */}
          <div className="pt-2 border-t-2 border-ink/20">
            <button
              type="button"
              disabled={processing || order?.status === 'paid'}
              onClick={() => handleSimulate('fail')}
              id="sim-pay-fail-btn"
              className="w-full bg-white hover:bg-red-50 text-ink hover:text-red-700 font-mono text-xs font-bold uppercase py-2.5 px-3 border-2 border-ink shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>SIMULASI PEMBAYARAN GAGAL / EXPIRED</span>
            </button>
          </div>
        </div>

        {/* Right Column: Order Details & Status */}
        <div className="lg:col-span-5 bg-surface border-4 border-ink p-6 shadow-xl space-y-5">
          <div className="flex justify-between items-start border-b-3 border-ink pb-3">
            <div>
              <div className="font-mono text-xs text-ink/70">NOMOR PESANAN</div>
              <div className="font-display text-2xl text-ink">#{order?.orderNumber}</div>
            </div>
            <div className="bg-white border-2 border-ink px-2.5 py-1 font-mono text-xs font-bold uppercase">
              STATUS: <span className="text-brand">{order?.status}</span>
            </div>
          </div>

          {/* Customer & Total */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-ink/70">Pembeli:</span>
              <span className="font-bold text-ink truncate max-w-[180px]">{order?.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/70">Email:</span>
              <span className="font-bold text-ink truncate max-w-[180px]">{order?.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/70">Tujuan:</span>
              <span className="font-bold text-ink truncate max-w-[180px]">
                {order?.shippingCity}, {order?.shippingProvince}
              </span>
            </div>
            <div className="border-t-2 border-ink/20 pt-2 flex justify-between items-baseline font-mono">
              <span className="font-bold text-ink">TOTAL TAGIHAN:</span>
              <span className="font-display text-2xl text-brand">{formatIDR(order?.total || 0)}</span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="bg-white border-2 border-ink p-3 space-y-2 font-mono text-xs max-h-48 overflow-y-auto">
            <div className="font-bold text-ink border-b border-ink/10 pb-1 text-[11px]">
              RINCIAN ITEM ({order?.items?.length || 0}):
            </div>
            {order?.items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b border-ink/10 pb-1.5 last:border-0 last:pb-0"
              >
                <div className="truncate max-w-[190px]">
                  <div className="font-bold text-ink truncate">{item.productName}</div>
                  <div className="text-[10px] text-brand">
                    {item.variantName} × {item.quantity}
                  </div>
                </div>
                <div className="font-bold text-right shrink-0">{formatIDR(item.subtotal)}</div>
              </div>
            ))}
          </div>

          {order?.status === 'paid' && (
            <div className="bg-emerald-100 border-2 border-emerald-800 p-3 font-mono text-xs font-bold text-emerald-900 text-center">
              ✓ Pesanan ini telah LUNAS! Anda akan diarahkan ke halaman pelacakan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
