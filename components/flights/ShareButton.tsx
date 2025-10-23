'use client';

import { Share2 } from 'lucide-react';

export interface ShareButtonProps {
  onClick: () => void;
  variant?: 'icon' | 'button' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ShareButton({
  onClick,
  variant = 'icon',
  size = 'md',
  className = '',
}: ShareButtonProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSize = sizeClasses[size];
  const buttonSize = buttonSizeClasses[size];

  if (variant === 'icon') {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`${buttonSize} rounded-full bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all ${className}`}
        aria-label="Share this flight"
        title="Share this flight"
      >
        <Share2 className={iconSize} />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium text-sm ${className}`}
        aria-label="Share this flight"
      >
        <Share2 className={iconSize} />
        <span>Share</span>
      </button>
    );
  }

  // text variant
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors ${className}`}
      aria-label="Share this flight"
    >
      <Share2 className={iconSize} />
      <span>Share</span>
    </button>
  );
}
