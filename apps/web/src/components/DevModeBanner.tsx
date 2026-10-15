import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/translations';

export const DevModeBanner: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Tampilkan hanya mulai dari halaman checkout sampai seterusnya (/checkout, /dev/pay, /order, /check-order)
  // Sembunyikan di home (/), shop (/shop), product detail (/product/*), dll.
  const isCheckoutOrAfter =
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/dev/pay') ||
    location.pathname.startsWith('/order') ||
    location.pathname.startsWith('/check-order');

  if (!isCheckoutOrAfter) {
    return null;
  }

  return (
    <div className="w-full bg-[#FFE600] border-b-4 border-ink py-2 px-4 text-center font-mono text-xs sm:text-sm font-bold text-ink uppercase tracking-wider flex items-center justify-center space-x-2 select-none">
      <span className="bg-ink text-white px-2 py-0.5 text-xs">{t.devBanner.devMode}</span>
      <span>{t.devBanner.simulatedNotice}</span>
    </div>
  );
};
