import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ticket, Check, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { MarqueeStrip } from '../components/MarqueeStrip';
import { ProductCard } from '../components/ProductCard';
import { TicketModal } from '../components/TicketModal';
import { HeroSlider } from '../components/HeroSlider';
import { getProducts } from '../lib/api';
import { Product, TOUR_DATES, TourShow } from '@merch-band/shared';
import { useTranslation } from '../i18n/translations';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [selectedTourShow, setSelectedTourShow] = useState<TourShow | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    getProducts(undefined, true)
      .then((data) => setFeaturedProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setSubscribed(true);
    setEmailInput('');
  };

  const handleOpenTicketModal = (show: TourShow) => {
    setSelectedTourShow(show);
    setTicketModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. COMMERCIAL HERO SHOWCASE (NOT 100vh, WITH INTERACTIVE MUSIC SLIDER) */}
      <HeroSlider
        onOpenTicketModal={handleOpenTicketModal}
        tourShows={TOUR_DATES}
      />

      {/* 2. MARQUEE STRIP */}
      <MarqueeStrip />

      {/* 3. FEATURED MERCH SECTION */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b-4 border-ink mb-10 gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight">
              {t.featured.title}
            </h2>
            <p className="font-mono text-sm text-ink/70 mt-1">{t.featured.subtitle}</p>
          </div>
          <Link to="/shop">
            <Button variant="secondary" size="md" id="view-all-merch-btn">
              {t.featured.viewAll} ({featuredProducts.length || 8})
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 sm:h-80 bg-surface/50 border-3 border-ink animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW DROP SECTION */}
      <section id="drops" className="w-full bg-surface border-y-4 border-ink py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <Link
                to="/product/midnight-bloom-tee"
                className="block border-4 border-ink bg-bg p-4 shadow-xl aspect-square flex items-center justify-center group overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-2xl"
                title="Buka Midnight Bloom Tee"
              >
                <img
                  src="/assets/products/midnight-bloom-tee.svg"
                  alt="Midnight Bloom Collection"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block bg-brand text-white border-3 border-ink px-4 py-1 font-mono text-xs font-bold tracking-widest shadow-xs">
                {t.drops.badge}
              </div>
              <h2 className="font-display text-4xl sm:text-6xl text-ink leading-tight">
                {t.drops.title}
              </h2>
              <p className="font-body text-lg text-ink/80 max-w-xl leading-relaxed">
                {t.drops.description}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link to="/product/midnight-bloom-tee">
                  <Button variant="primary" size="lg" id="explore-drop-btn">
                    {t.drops.exploreBtn}
                  </Button>
                </Link>
                <Link to="/shop?category=T-SHIRT">
                  <Button variant="outline" size="lg">
                    ALL T-SHIRTS →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOUR TEASER SECTION */}
      <section id="tour" className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24 w-full">
        <div className="pb-8 border-b-4 border-ink mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight">
              {t.tour.title}
            </h2>
            <p className="font-mono text-sm text-ink/70 mt-1">{t.tour.subtitle}</p>
          </div>
          <div className="inline-flex items-center space-x-2 font-mono text-xs font-bold bg-accent-2 border-2 border-ink px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>OFFICIAL E-TICKETS AVAILABLE</span>
          </div>
        </div>

        <div className="space-y-4">
          {TOUR_DATES.map((show, idx) => (
            <div
              key={idx}
              className="bg-white border-3 border-ink p-4 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-x-1 transition-transform"
            >
              {/* Date Block */}
              <div className="flex items-center space-x-6">
                <div className="bg-surface border-3 border-ink px-4 py-2 text-center min-w-[70px]">
                  <div className="font-display text-2xl text-ink leading-none">{show.day}</div>
                  <div className="font-mono text-xs font-bold text-brand uppercase">{show.month}</div>
                </div>

                {/* City & Venue */}
                <div>
                  <div className="font-display text-xl sm:text-2xl text-ink">{show.city}</div>
                  <div className="font-mono text-sm text-ink/70">{show.venue}</div>
                  {show.active && (
                    <div className="font-mono text-xs text-brand font-bold mt-0.5">
                      Starts from Rp {show.priceFrom.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {show.active ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleOpenTicketModal(show)}
                    id={`buy-ticket-btn-${show.city.split(',')[0].toLowerCase().trim()}`}
                  >
                    <Ticket className="w-4 h-4 mr-1.5" /> {t.tour.getTickets}
                  </Button>
                ) : (
                  <button
                    disabled
                    className="font-display text-xs px-4 py-2.5 bg-disabled text-white border-3 border-ink cursor-not-allowed uppercase shadow-xs"
                  >
                    {t.tour.soldOut}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. NEWSLETTER SECTION */}
      <section id="about" className="w-full bg-[#1A1A1A] text-white border-t-4 border-ink py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-display text-4xl sm:text-6xl text-white tracking-tight">
                {t.newsletter.title}
              </h2>
              <p className="font-body text-base sm:text-lg text-[#DFD3C3] max-w-lg">
                {t.newsletter.description}
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="bg-brand text-white border-3 border-white p-4 font-mono font-bold flex flex-col space-y-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5" />
                    <span>{t.newsletter.success}</span>
                  </div>
                  <button
                    onClick={() => setSubscribed(false)}
                    className="text-xs text-white/80 underline text-left hover:text-white cursor-pointer"
                  >
                    + Daftarkan email lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder={t.newsletter.placeholder}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 bg-white text-ink px-4 py-3.5 border-3 border-ink font-mono text-sm outline-none focus:ring-4 focus:ring-brand"
                  />
                  <Button type="submit" variant="primary" size="md" id="newsletter-subscribe-btn">
                    {t.newsletter.subscribeBtn}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tour Ticket Modal */}
      <TicketModal
        show={selectedTourShow}
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
      />
    </div>
  );
};
