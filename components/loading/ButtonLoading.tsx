'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface ButtonLoadingProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500',
  secondary: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500',
  outline: 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 disabled:border-gray-300 disabled:text-gray-400',
  ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 disabled:text-gray-400',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500',
};

const sizeClasses = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3 text-base',
  large: 'px-8 py-4 text-lg',
};

const ButtonLoading = forwardRef<HTMLButtonElement, ButtonLoadingProps>(
  (
    {
      isLoading = false,
      loadingText,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const spinnerColor = variant === 'outline' || variant === 'ghost' ? 'primary' : 'white';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:opacity-70',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <LoadingSpinner
            size={size === 'small' ? 'small' : 'medium'}
            color={spinnerColor}
          />
        )}

        <span className={cn(isLoading && 'opacity-70')}>
          {isLoading && loadingText ? loadingText : children}
        </span>
      </button>
    );
  }
);

ButtonLoading.displayName = 'ButtonLoading';

export default ButtonLoading;

// Preset button configurations
export function PrimaryButton(props: Omit<ButtonLoadingProps, 'variant'>) {
  return <ButtonLoading {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonLoadingProps, 'variant'>) {
  return <ButtonLoading {...props} variant="secondary" />;
}

export function OutlineButton(props: Omit<ButtonLoadingProps, 'variant'>) {
  return <ButtonLoading {...props} variant="outline" />;
}

export function DangerButton(props: Omit<ButtonLoadingProps, 'variant'>) {
  return <ButtonLoading {...props} variant="danger" />;
}
