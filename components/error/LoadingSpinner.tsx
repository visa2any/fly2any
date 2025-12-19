'use client';

/**
 * Loading Spinner
 * Minimal, premium loading indicator for Suspense fallback
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export function LoadingSpinner({
  size = 'md',
  className = '',
  fullScreen = false,
}: LoadingSpinnerProps): JSX.Element {
  const spinner = (
    <div
      className={`
        ${sizes[size]}
        border-gray-200 border-t-gray-800
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {spinner}
      </div>
    );
  }

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
