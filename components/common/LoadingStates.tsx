'use client';

import { Plane, Loader2, Search } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: 'default' | 'search' | 'minimal' | 'skeleton';
  className?: string;
}

/**
 * Default loading spinner with message
 */
export function LoadingState({
  message = 'Loading...',
  submessage,
  variant = 'default',
  className = '',
}: LoadingStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mb-4" />
        <p className="text-xl font-semibold text-gray-800">{message}</p>
        {submessage && (
          <p className="text-sm text-gray-600 mt-2">{submessage}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Flight search specific loading state with animated plane
 */
export function SearchLoadingState({
  message = 'Searching for the best flights...',
  showProgress = true,
  className = '',
}: {
  message?: string;
  showProgress?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Animated plane icon */}
      <div className="flex items-center justify-center py-8">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Plane className="w-8 h-8 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-800 mb-2">{message}</p>
        <p className="text-sm text-gray-600">
          This may take a few moments while we scan hundreds of airlines...
        </p>
      </div>

      {/* Progress indicators */}
      {showProgress && (
        <div className="max-w-md mx-auto space-y-3">
          <ProgressStep label="Searching airlines" completed />
          <ProgressStep label="Comparing prices" active />
          <ProgressStep label="Finding best deals" />
        </div>
      )}

      {/* Flight card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map((i) => (
          <FlightCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    </div>
  );
}

/**
 * Progress step indicator
 */
function ProgressStep({
  label,
  active = false,
  completed = false,
}: {
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
        w-6 h-6 rounded-full flex items-center justify-center border-2
        ${completed ? 'bg-green-500 border-green-500' : ''}
        ${active ? 'border-primary-600 bg-primary-50' : ''}
        ${!active && !completed ? 'border-gray-300 bg-gray-50' : ''}
      `}
      >
        {completed && (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {active && (
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" />
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          active || completed ? 'text-gray-800' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Flight card skeleton loader
 */
export function FlightCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-white/70 backdrop-blur rounded-2xl p-4 border-2 border-gray-200 space-y-3 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded flex-1" />
          <div className="h-12 bg-gray-200 rounded w-32" />
          <div className="h-12 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

/**
 * Card grid skeleton loader
 */
export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-10 bg-gray-200 rounded w-full mt-4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Text content skeleton
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Plane className="w-10 h-10 text-primary-600 animate-pulse" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-gray-800 mt-6">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner
 */
export function InlineSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
  );
}
