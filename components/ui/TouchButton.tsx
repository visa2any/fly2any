/**
 * TouchButton - Accessible Touch-Friendly Button
 *
 * Implements WCAG 2.5 touch target guidelines (minimum 44x44px)
 * with consistent styling across the platform.
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  secondary: 'bg-secondary-500 text-neutral-900 hover:bg-secondary-600 active:bg-secondary-700',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
  ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
  danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 text-sm',
  md: 'min-h-[44px] px-5 text-base',
  lg: 'min-h-[52px] px-6 text-lg',
};

export function TouchButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled,
  className = '',
  children,
  ...props
}: TouchButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}

/**
 * IconButton - Touch-friendly icon-only button
 */
export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  const iconSizes: Record<ButtonSize, string> = {
    sm: 'min-h-[40px] min-w-[40px]',
    md: 'min-h-[44px] min-w-[44px]',
    lg: 'min-h-[52px] min-w-[52px]',
  };

  return (
    <button
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-xl transition-all duration-200
        active:scale-[0.95]
        ${variantStyles[variant]}
        ${iconSizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

export default TouchButton;
