'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white' | 'orange' | 'gray';
  className?: string;
}

const sizeClasses = {
  small: 'w-4 h-4 border-2',
  medium: 'w-8 h-8 border-3',
  large: 'w-12 h-12 border-4',
};

const colorClasses = {
  primary: 'border-primary-200 border-t-primary-600',
  white: 'border-white/30 border-t-white',
  orange: 'border-orange-200 border-t-orange-600',
  gray: 'border-gray-200 border-t-gray-600',
};

export default function LoadingSpinner({
  size = 'medium',
  color = 'primary',
  className
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Preset configurations for common use cases
export function ButtonSpinner({ size = 'small', color = 'white' }: Pick<LoadingSpinnerProps, 'size' | 'color'>) {
  return <LoadingSpinner size={size} color={color} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="large" color="primary" />
    </div>
  );
}
