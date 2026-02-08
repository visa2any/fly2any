'use client';

import { ReactNode } from 'react';

interface SearchFormSkeletonProps {
  /** Enable glassmorphism style for hero overlay */
  glassmorphism?: boolean;
  /** Hide the service tabs (for Journey page) */
  hideTabs?: boolean;
  /** Show shimmer animation (default: true) */
  animate?: boolean;
  /** Optional className for the container */
  className?: string;
}

/**
 * Premium Search Form Skeleton
 * 
 * Matches exact dimensions of EnhancedSearchBar to prevent CLS (Cumulative Layout Shift).
 * Used during SSR hydration and lazy loading.
 * 
 * Layout matching:
 * - Tabs: min-h-[44px], gap-1.5/2, rounded-xl
 * - Desktop form: flex gap-3 with flex-1 fields
 * - Mobile form: 2-column grid with gap-2
 * - Field heights: h-[54px] desktop, h-[52px] mobile
 */
export function SearchFormSkeleton({
  glassmorphism = false,
  hideTabs = false,
  animate = true,
  className = '',
}: SearchFormSkeletonProps) {
  return (
    <div className={`w-full ${className}`} style={{ minHeight: '140px' }}>
      <div 
        className={`${
          glassmorphism 
            ? 'bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl' 
            : 'bg-white shadow-lg lg:shadow-xl border-b border-neutral-100'
        }`} 
        style={{ paddingTop: '16px', paddingBottom: '16px' }}
      >
        {/* MaxWidthContainer equivalent */}
        <div className="max-w-7xl mx-auto px-0 lg:px-8">
          <div className={animate ? 'animate-pulse' : ''}>
            {/* Service Tabs skeleton - matches real tabs: min-h-[44px], px-4 py-2.5 */}
            {!hideTabs && (
              <div 
                className={`flex gap-1.5 md:gap-2 mb-4 p-1.5 rounded-2xl overflow-x-auto ${
                  glassmorphism 
                    ? 'bg-gray-800/80 border border-white/15' 
                    : 'bg-neutral-100/80'
                }`}
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* 8 tabs: Flights, Hotels, Tours, Activities, Cars, Transfers, Packages, Insurance */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div 
                    key={i} 
                    className={`min-h-[44px] min-w-[80px] md:min-w-[90px] flex-shrink-0 rounded-xl ${
                      i === 1 
                        ? glassmorphism ? 'bg-white/90' : 'bg-white shadow-lg' 
                        : glassmorphism ? 'bg-white/10' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Desktop Form Fields skeleton - matches real layout: flex items-center gap-3 */}
            <div className="hidden lg:flex items-center gap-3">
              {/* From Airport - flex-1 */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`h-3 w-12 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                  <div className={`h-3 w-16 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                </div>
                <div className={`h-[54px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>

              {/* To Airport - flex-1 */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`h-3 w-10 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                  <div className={`h-3 w-16 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                </div>
                <div className={`h-[54px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>

              {/* Depart Date - flex-1 */}
              <div className="flex-1 space-y-2">
                <div className={`h-3 w-14 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[54px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>

              {/* Return Date - flex-1 */}
              <div className="flex-1 space-y-2">
                <div className={`h-3 w-14 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[54px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>

              {/* Travelers - flex-shrink-0 */}
              <div className="w-32 space-y-2">
                <div className={`h-3 w-20 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[54px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>

              {/* Search Button - flex-shrink-0 */}
              <div className="flex-shrink-0 pt-5">
                <div className={`h-[54px] w-[110px] rounded-xl ${glassmorphism ? 'bg-red-500/50' : 'bg-gradient-to-r from-red-400 to-red-500'}`} />
              </div>
            </div>

            {/* Mobile Form Fields skeleton - 2x2 grid + full width search */}
            <div className="lg:hidden grid grid-cols-2 gap-2 px-4">
              {/* From */}
              <div className="space-y-1.5">
                <div className={`h-3 w-12 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[52px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>
              {/* To */}
              <div className="space-y-1.5">
                <div className={`h-3 w-10 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[52px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>
              {/* Dates */}
              <div className="space-y-1.5">
                <div className={`h-3 w-14 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[52px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>
              {/* Travelers */}
              <div className="space-y-1.5">
                <div className={`h-3 w-16 rounded ${glassmorphism ? 'bg-white/20' : 'bg-neutral-200'}`} />
                <div className={`h-[52px] w-full rounded-xl ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'}`} />
              </div>
              {/* Search Button - full width */}
              <div className="col-span-2 mt-1">
                <div className={`h-[52px] w-full rounded-xl ${glassmorphism ? 'bg-red-500/50' : 'bg-gradient-to-r from-red-400 to-red-500'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchFormSkeleton;
