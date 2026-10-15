import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/translations';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full max-w-full bg-surface border-t-4 border-ink mt-24 select-none overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="font-display text-3xl tracking-tight text-ink">
              VOID/ROSE
            </div>
            <p className="text-sm text-ink/80 leading-relaxed max-w-sm">
              {t.footer.brandDesc}
            </p>
            <div className="pt-2">
              <span className="inline-block bg-brand text-white font-mono text-xs px-2.5 py-1 border-2 border-ink font-bold">
                {t.footer.cities}
              </span>
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div className="space-y-4">
            <h4 className="font-display text-base tracking-wider text-ink border-b-2 border-ink pb-2">
              {t.footer.colShop}
            </h4>
            <ul className="space-y-2.5 font-mono text-sm">
              <li>
                <Link to="/shop?category=T-SHIRT" className="hover:text-brand transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=HOODIE" className="hover:text-brand transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=VINYL" className="hover:text-brand transition-colors">
                  Vinyl & LPs
                </Link>
              </li>
              <li>
                <Link to="/shop?category=ACCESSORIES" className="hover:text-brand transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Band Links */}
          <div className="space-y-4">
            <h4 className="font-display text-base tracking-wider text-ink border-b-2 border-ink pb-2">
              {t.footer.colBand}
            </h4>
            <ul className="space-y-2.5 font-mono text-sm">
              <li>
                <a href="/#tour" className="hover:text-brand transition-colors">
                  {t.footer.tourDates}
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-brand transition-colors">
                  {t.footer.about}
                </a>
              </li>
              <li>
                <a href="#press" className="hover:text-brand transition-colors">
                  {t.footer.pressKit}
                </a>
              </li>
              <li>
                <a href="mailto:contact@voidrose.com" className="hover:text-brand transition-colors">
                  {t.footer.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Help Links */}
          <div className="space-y-4">
            <h4 className="font-display text-base tracking-wider text-ink border-b-2 border-ink pb-2">
              {t.footer.colHelp}
            </h4>
            <ul className="space-y-2.5 font-mono text-sm">
              <li>
                <Link to="/check-order" className="text-brand font-bold hover:underline">
                  {t.footer.checkOrder}
                </Link>
              </li>
              <li>
                <span className="text-ink/80">{t.footer.shippingInfo}</span>
              </li>
              <li>
                <span className="text-ink/80">{t.footer.returnsInfo}</span>
              </li>
              <li>
                <Link to="/admin" className="text-muted hover:text-ink text-xs block pt-2">
                  {t.footer.adminPortal}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-3 border-ink mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="text-ink/70">
            © 2026 VOID/ROSE. {t.footer.copyright}
          </div>
          <div className="flex space-x-6 font-bold tracking-wider">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brand">
              INSTAGRAM
            </a>
            <span>/</span>
            <a href="https://spotify.com" target="_blank" rel="noreferrer" className="hover:text-brand">
              SPOTIFY
            </a>
            <span>/</span>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-brand">
              YOUTUBE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
