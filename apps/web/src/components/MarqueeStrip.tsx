import React from 'react';
import { useTranslation } from '../i18n/translations';

export const MarqueeStrip: React.FC = () => {
  const { t } = useTranslation();
  const items = [...t.marquee, ...t.marquee, ...t.marquee];

  return (
    <div className="w-full max-w-full bg-ink text-white border-y-4 border-ink py-3 overflow-hidden select-none">
      <div className="flex w-max animate-marquee space-x-8 text-sm md:text-base font-display tracking-widest uppercase">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-6">
            <span className={idx % 2 === 0 ? 'text-white' : 'text-accent-2 font-bold'}>
              {item}
            </span>
            <span className="text-brand">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
