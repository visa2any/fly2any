'use client';

import { cn } from '@/lib/utils';

interface PulseLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'orange' | 'gray' | 'white';
  count?: 3 | 5;
  className?: string;
}

const sizeClasses = {
  small: 'w-2 h-2',
  medium: 'w-3 h-3',
  large: 'w-4 h-4',
};

const colorClasses = {
  primary: 'bg-primary-600',
  orange: 'bg-orange-600',
  gray: 'bg-gray-600',
  white: 'bg-white',
};

const gapClasses = {
  small: 'gap-1',
  medium: 'gap-2',
  large: 'gap-3',
};

export default function PulseLoader({
  size = 'medium',
  color = 'primary',
  count = 3,
  className,
}: PulseLoaderProps) {
  return (
    <div
      className={cn('flex items-center', gapClasses[size], className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 150}ms`,
            animationDuration: '0.6s',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Preset configurations
export function ButtonPulseLoader() {
  return <PulseLoader size="small" color="white" count={3} />;
}

export function CardPulseLoader() {
  return <PulseLoader size="medium" color="primary" count={3} />;
}

export function WavePulseLoader({ color = 'primary' }: Pick<PulseLoaderProps, 'color'>) {
  return (
    <div className="flex items-center gap-1" role="status" aria-label="Loading">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full animate-pulse',
            colorClasses[color]
          )}
          style={{
            height: `${12 + Math.sin(i) * 8}px`,
            animationDelay: `${i * 100}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
