import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'accent' | 'ink' | 'surface';
  rotation?: 'left' | 'right' | 'none';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  rotation = 'none',
  className
}) => {
  const variantStyles = {
    brand: 'bg-brand text-white',
    accent: 'bg-accent-2 text-ink',
    ink: 'bg-ink text-white',
    surface: 'bg-surface text-ink'
  };

  const rotationStyles = {
    left: 'rotate-sticker-left',
    right: 'rotate-sticker-right',
    none: ''
  };

  return (
    <span
      className={clsx(
        'neo-badge inline-block px-3 py-1 text-xs tracking-wider font-mono font-bold select-none',
        variantStyles[variant],
        rotationStyles[rotation],
        className
      )}
    >
      {children}
    </span>
  );
};
