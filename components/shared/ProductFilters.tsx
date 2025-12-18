'use client';

import { memo, useRef } from 'react';
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

export type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating' | 'duration';
export type PriceRange = 'all' | 'under-50' | '50-100' | '100-200' | 'over-200';
export type DurationRange = 'all' | 'under-2h' | '2-4h' | '4-8h' | 'full-day';

interface FiltersState {
  sort: SortOption;
  priceRange: PriceRange;
  durationRange: DurationRange;
  minRating: number;
}

interface ProductFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  resultCount: number;
  accentColor?: 'orange' | 'purple' | 'teal';
  showDuration?: boolean;
}

// All filter pills in a single array for horizontal layout
const sortPills: { value: SortOption; label: string; icon?: string }[] = [
  { value: 'recommended', label: 'Recommended', icon: '✨' },
  { value: 'price-low', label: 'Price ↓' },
  { value: 'price-high', label: 'Price ↑' },
  { value: 'rating', label: 'Top Rated', icon: '⭐' },
];

const pricePills: { value: PriceRange; label: string }[] = [
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50-100' },
  { value: '100-200', label: '$100-200' },
  { value: 'over-200', label: '$200+' },
];

const durationPills: { value: DurationRange; label: string }[] = [
  { value: 'under-2h', label: '<2h' },
  { value: '2-4h', label: '2-4h' },
  { value: '4-8h', label: '4-8h' },
  { value: 'full-day', label: 'Full day' },
];

const ratingPills = [4.5, 4, 3.5];

export const ProductFilters = memo(({ filters, onChange, resultCount, accentColor = 'orange', showDuration = true }: ProductFiltersProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Accent colors
  const colors = {
    orange: { active: 'bg-orange-500 text-white border-orange-500', hover: 'hover:border-orange-300 hover:bg-orange-50' },
    purple: { active: 'bg-purple-500 text-white border-purple-500', hover: 'hover:border-purple-300 hover:bg-purple-50' },
    teal: { active: 'bg-teal-500 text-white border-teal-500', hover: 'hover:border-teal-300 hover:bg-teal-50' },
  };
  const { active, hover } = colors[accentColor];

  const hasActiveFilters = filters.priceRange !== 'all' || filters.durationRange !== 'all' || filters.minRating > 0;

  const clearFilters = () => {
    onChange({ sort: 'recommended', priceRange: 'all', durationRange: 'all', minRating: 0 });
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' });

  const pillBase = "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap";
  const pillInactive = `border-gray-200 bg-white ${hover}`;

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[60px] z-30">
      <div className="relative py-2.5">
        {/* Desktop scroll buttons */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-md hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        {/* Horizontal scrollable filter bar */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 md:px-10"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Result count - left */}
          <span className="flex-shrink-0 text-sm text-gray-500 pr-2 border-r border-gray-200 mr-1">
            <span className="font-bold text-gray-900">{resultCount}</span> results
          </span>

          {/* Sort pills */}
          {sortPills.map(pill => (
            <button
              key={pill.value}
              onClick={() => onChange({ ...filters, sort: pill.value })}
              className={`${pillBase} ${filters.sort === pill.value ? active : pillInactive}`}
            >
              {pill.icon && <span className="mr-1">{pill.icon}</span>}
              {pill.label}
            </button>
          ))}

          {/* Divider */}
          <span className="flex-shrink-0 w-px h-5 bg-gray-200 mx-1" />

          {/* Price pills */}
          {pricePills.map(pill => (
            <button
              key={pill.value}
              onClick={() => onChange({ ...filters, priceRange: filters.priceRange === pill.value ? 'all' : pill.value })}
              className={`${pillBase} ${filters.priceRange === pill.value ? active : pillInactive}`}
            >
              {pill.label}
            </button>
          ))}

          {/* Duration pills - if enabled */}
          {showDuration && (
            <>
              <span className="flex-shrink-0 w-px h-5 bg-gray-200 mx-1" />
              {durationPills.map(pill => (
                <button
                  key={pill.value}
                  onClick={() => onChange({ ...filters, durationRange: filters.durationRange === pill.value ? 'all' : pill.value })}
                  className={`${pillBase} ${filters.durationRange === pill.value ? active : pillInactive}`}
                >
                  {pill.label}
                </button>
              ))}
            </>
          )}

          {/* Rating pills */}
          <span className="flex-shrink-0 w-px h-5 bg-gray-200 mx-1" />
          {ratingPills.map(rating => (
            <button
              key={rating}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === rating ? 0 : rating })}
              className={`${pillBase} flex items-center gap-1 ${filters.minRating === rating ? active : pillInactive}`}
            >
              <Star className="w-3 h-3 fill-current" />
              {rating}+
            </button>
          ))}

          {/* Clear filters - only if active */}
          {hasActiveFilters && (
            <>
              <span className="flex-shrink-0 w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-all"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
});

ProductFilters.displayName = 'ProductFilters';

// Helper function to apply filters to product array
export function applyFilters<T extends { price?: { amount: string }; rating?: number; minimumDuration?: string }>(
  items: T[],
  filters: FiltersState,
  getPrice: (item: T) => number | null
): T[] {
  let filtered = [...items];

  // Price filter
  if (filters.priceRange !== 'all') {
    filtered = filtered.filter(item => {
      const price = getPrice(item);
      if (!price) return filters.priceRange === 'all';
      switch (filters.priceRange) {
        case 'under-50': return price < 50;
        case '50-100': return price >= 50 && price <= 100;
        case '100-200': return price >= 100 && price <= 200;
        case 'over-200': return price > 200;
        default: return true;
      }
    });
  }

  // Duration filter
  if (filters.durationRange !== 'all') {
    filtered = filtered.filter(item => {
      const dur = item.minimumDuration || '';
      const hours = parseFloat(dur) || 2;
      switch (filters.durationRange) {
        case 'under-2h': return hours < 2;
        case '2-4h': return hours >= 2 && hours < 4;
        case '4-8h': return hours >= 4 && hours < 8;
        case 'full-day': return hours >= 8;
        default: return true;
      }
    });
  }

  // Rating filter
  if (filters.minRating > 0) {
    filtered = filtered.filter(item => (item.rating || 4.5) >= filters.minRating);
  }

  // Sort
  switch (filters.sort) {
    case 'price-low':
      filtered.sort((a, b) => (getPrice(a) || 0) - (getPrice(b) || 0));
      break;
    case 'price-high':
      filtered.sort((a, b) => (getPrice(b) || 0) - (getPrice(a) || 0));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
      break;
    case 'duration':
      filtered.sort((a, b) => parseFloat(a.minimumDuration || '2') - parseFloat(b.minimumDuration || '2'));
      break;
  }

  return filtered;
}

export const defaultFilters: FiltersState = {
  sort: 'recommended',
  priceRange: 'all',
  durationRange: 'all',
  minRating: 0,
};
