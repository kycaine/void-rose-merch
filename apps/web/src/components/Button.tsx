import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary: 'bg-accent-2 text-ink hover:bg-[#c2a796]',
    outline: 'bg-white text-ink hover:bg-surface',
    danger: 'bg-ink text-white hover:bg-[#333333]'
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button
      disabled={disabled}
      className={clsx(
        'neo-btn font-display inline-flex items-center justify-center gap-2 cursor-pointer select-none active:outline-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
