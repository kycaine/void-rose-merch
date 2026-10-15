import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Globe } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useTranslation } from '../i18n/translations';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const location = useLocation();
  const { lang, setLanguage, t } = useTranslation();

  const navLinks = [
    { label: t.nav.shop, href: '/shop' },
    { label: t.nav.drops, href: '/#drops' },
    { label: t.nav.tour, href: '/#tour' },
    { label: t.nav.about, href: '/#about' },
    { label: t.nav.checkOrder, href: '/check-order' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b-4 border-ink w-full select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* KIRI: Title VOID/ROSE mentok kiri dengan margin dikit */}
        <div className="flex-1 flex items-center justify-start min-w-0">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="font-display text-2xl sm:text-3xl tracking-tighter text-ink group-hover:text-brand transition-colors whitespace-nowrap">
              VOID/ROSE
            </span>
            <span className="hidden sm:inline-block bg-brand text-white text-[10px] font-mono px-1.5 py-0.5 border-2 border-ink font-bold">
              MERCH
            </span>
          </Link>
        </div>

        {/* TENGAH: Desktop Nav Links (tengah) */}
        <div className="hidden md:flex items-center justify-center flex-initial space-x-6 lg:space-x-8 px-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`font-display text-sm tracking-wider uppercase transition-colors hover:text-brand whitespace-nowrap ${
                  isActive ? 'text-brand underline underline-offset-4 decoration-3 font-bold' : 'text-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* KANAN: Button Lang & Cart mentok kanan dengan margin dikit */}
        <div className="flex-1 flex items-center justify-end space-x-2.5 sm:space-x-3.5 min-w-0">
          {/* Setting Bahasa (ID & EN) tepat di sebelah kiri tombol CART (sembunyi di mode HP karena sudah ada di dalam hamburger menu) */}
          <div
            id="nav-lang-switcher"
            className="hidden md:flex items-center border-3 border-ink bg-white shadow-xs font-mono text-xs font-bold overflow-hidden"
            role="group"
            aria-label="Language Selector"
          >
            <button
              type="button"
              id="lang-btn-id"
              onClick={() => setLanguage('id')}
              className={`px-2 sm:px-2.5 py-1.5 transition-colors cursor-pointer ${
                lang === 'id'
                  ? 'bg-brand text-white font-extrabold shadow-inner'
                  : 'bg-white text-ink hover:bg-surface/80'
              }`}
              title="Bahasa Indonesia"
              aria-label="Ubah ke Bahasa Indonesia"
              aria-pressed={lang === 'id'}
            >
              ID
            </button>
            <div className="w-[2px] h-5 bg-ink" />
            <button
              type="button"
              id="lang-btn-en"
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-2.5 py-1.5 transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-brand text-white font-extrabold shadow-inner'
                  : 'bg-white text-ink hover:bg-surface/80'
              }`}
              title="English"
              aria-label="Switch to English"
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>

          {/* Tombol CART */}
          <Link
            to="/cart"
            id="nav-cart-btn"
            className="flex items-center space-x-2 sm:space-x-2.5 bg-white border-3 border-ink px-3 sm:px-4 py-2 shadow-sm hover:shadow-md transition-all active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-ink" />
            <span className="font-display text-xs sm:text-sm tracking-wider uppercase">
              {t.nav.cart} ({itemCount})
            </span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-white border-3 border-ink shadow-xs cursor-pointer ml-1"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-3 border-ink bg-bg px-6 py-6 space-y-4">
          {/* Mobile Language Switcher indicator */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-ink/20">
            <span className="font-mono text-xs text-ink/70 flex items-center">
              <Globe className="w-4 h-4 mr-1.5" /> BAHASA / LANGUAGE:
            </span>
            <div className="flex items-center border-2 border-ink bg-white font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-3 py-1 ${lang === 'id' ? 'bg-brand text-white' : 'text-ink'}`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 ${lang === 'en' ? 'bg-brand text-white' : 'text-ink'}`}
              >
                EN
              </button>
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block font-display text-lg tracking-wider text-ink hover:text-brand py-2 border-b-2 border-ink/20"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-mono text-xs text-muted hover:text-ink pt-2"
            >
              {t.nav.adminPortal}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
