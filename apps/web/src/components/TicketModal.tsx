import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Ticket, Check, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { Button } from './Button';
import { useCartStore } from '../store/cartStore';
import { useFlyCartStore } from '../store/flyCartStore';
import { TourShow, TourTier } from '@merch-band/shared';
import { formatIDR } from '../lib/api';
import { useTranslation } from '../i18n/translations';

interface TicketModalProps {
  show: TourShow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ show, isOpen, onClose }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const triggerFly = useFlyCartStore((state) => state.triggerFly);
  const { t } = useTranslation();

  const [selectedTier, setSelectedTier] = useState<TourTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (show && show.tiers && show.tiers.length > 0) {
      setSelectedTier(show.tiers[0]);
      setQuantity(1);
      setAdded(false);
    }
  }, [show]);

  if (!isOpen || !show) return null;

  const handleBuyNow = () => {
    if (!selectedTier) return;

    addItem({
      productId: show.id,
      variantId: selectedTier.variantId,
      productName: `TICKET: VOID/ROSE Live in ${show.city}`,
      productSlug: show.ticketSlug,
      variantName: `${selectedTier.name} (${show.day} ${show.month} - ${show.city})`,
      category: 'TICKETS',
      size: selectedTier.name,
      color: 'EVENT PASS',
      price: selectedTier.price,
      quantity,
      imageUrl: '/assets/products/tour-ticket.svg',
      maxStock: selectedTier.stock
    });

    onClose();
    navigate('/checkout');
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!selectedTier) return;

    const triggerEl = (e?.currentTarget as HTMLElement) || document.getElementById('ticket-add-to-cart-btn');
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      triggerFly(rect.left + rect.width / 2, rect.top + rect.height / 2, '/assets/products/tour-ticket.svg');
    } else {
      triggerFly(window.innerWidth / 2, window.innerHeight / 2, '/assets/products/tour-ticket.svg');
    }

    addItem({
      productId: show.id,
      variantId: selectedTier.variantId,
      productName: `TICKET: VOID/ROSE Live in ${show.city}`,
      productSlug: show.ticketSlug,
      variantName: `${selectedTier.name} (${show.day} ${show.month} - ${show.city})`,
      category: 'TICKETS',
      size: selectedTier.name,
      color: 'EVENT PASS',
      price: selectedTier.price,
      quantity,
      imageUrl: '/assets/products/tour-ticket.svg',
      maxStock: selectedTier.stock
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  const totalPrice = (selectedTier?.price || 0) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface border-4 border-ink shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip */}
        <div className="bg-brand text-white p-4 border-b-4 border-ink flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-white" />
            <span className="font-mono text-xs font-bold tracking-widest uppercase">
              {t.ticketModal.badge}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white text-ink border-2 border-ink shadow-xs hover:bg-accent-2 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Show Details Card */}
          <div className="bg-white border-3 border-ink p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl text-ink">{show.city}</span>
              <span className="bg-accent-2 text-ink border-2 border-ink font-mono text-xs font-bold px-2 py-0.5">
                {show.day} {show.month} 2026
              </span>
            </div>
            <div className="flex items-center text-xs font-mono text-ink/80 space-x-4">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-brand" /> {show.venue}
              </span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-brand" /> Doors 17:00 WIB
              </span>
            </div>
          </div>

          {/* Tier Selector */}
          <div className="space-y-3">
            <label className="block font-mono text-xs font-bold text-ink uppercase">
              {t.ticketModal.selectTier}
            </label>

            <div className="space-y-2.5">
              {show.tiers.map((tier) => {
                const isSelected = selectedTier?.variantId === tier.variantId;
                return (
                  <div
                    key={tier.variantId}
                    onClick={() => setSelectedTier(tier)}
                    className={`border-3 border-ink p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand text-white shadow-sm -translate-y-0.5'
                        : 'bg-white text-ink hover:bg-white/80 shadow-xs'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-display text-base tracking-tight">{tier.name}</div>
                      <div
                        className={`font-mono text-xs ${
                          isSelected ? 'text-white/90' : 'text-ink/70'
                        }`}
                      >
                        {tier.desc}
                      </div>
                    </div>
                    <div className="text-right pl-3">
                      <div
                        className={`font-mono text-sm sm:text-base font-bold whitespace-nowrap ${
                          isSelected ? 'text-white' : 'text-brand'
                        }`}
                      >
                        {formatIDR(tier.price)}
                      </div>
                      <div
                        className={`font-mono text-[10px] ${
                          isSelected ? 'text-white/80' : 'text-ink/60'
                        }`}
                      >
                        {t.ticketModal.remaining}: {tier.stock}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between bg-white border-3 border-ink p-4 shadow-xs">
            <div>
              <div className="font-mono text-xs font-bold text-ink uppercase">
                {t.ticketModal.quantity}
              </div>
              <div className="font-mono text-[11px] text-ink/60">
                {t.ticketModal.maxNotice}
              </div>
            </div>

            <div className="flex items-center border-2 border-ink bg-surface">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center font-display text-base hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                -
              </button>
              <span className="w-10 h-9 flex items-center justify-center font-mono font-bold text-sm border-x-2 border-ink bg-white">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= 4 || quantity >= (selectedTier?.stock || 4)}
                onClick={() => setQuantity((q) => Math.min(4, q + 1))}
                className="w-9 h-9 flex items-center justify-center font-display text-base hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Price Calculation Summary */}
          <div className="border-t-3 border-ink pt-3 flex items-baseline justify-between font-mono">
            <span className="text-sm font-bold text-ink uppercase">{t.ticketModal.total}</span>
            <span className="font-display text-2xl text-brand">{formatIDR(totalPrice)}</span>
          </div>

          {/* Added to cart notification */}
          {added && (
            <div className="bg-emerald-100 border-2 border-ink p-3 flex items-center space-x-2 font-mono text-xs font-bold text-emerald-900 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>{t.ticketModal.ticketAdded}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleBuyNow}
              id="ticket-buy-now-btn"
            >
              {t.ticketModal.buyNow}
            </Button>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleAddToCart}
              id="ticket-add-to-cart-btn"
            >
              {added ? t.ticketModal.ticketAdded : t.ticketModal.addToCart}
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-ink/70 text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0" />
            <span>Instant E-Ticket • QR Code Entry • Secure Direct Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
