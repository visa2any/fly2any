'use client';

import { memo, useState } from 'react';
import { SlidersHorizontal, ChevronDown, X, Star, Clock, DollarSign, ArrowUpDown } from 'lucide-react';

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
  accentColor?: 'orange' | 'purple' | 'teal'; // Tours=orange, Activities=purple, Transfers=teal
  showDuration?: boolean; // Transfers don't need duration filter
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'duration', label: 'Duration' },
];

const priceOptions: { value: PriceRange; label: string }[] = [
  { value: 'all', label: 'Any Price' },
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: 'over-200', label: '$200+' },
];

const durationOptions: { value: DurationRange; label: string }[] = [
  { value: 'all', label: 'Any Duration' },
  { value: 'under-2h', label: 'Under 2 hours' },
  { value: '2-4h', label: '2 - 4 hours' },
  { value: '4-8h', label: '4 - 8 hours' },
  { value: 'full-day', label: 'Full day' },
];

export const ProductFilters = memo(({ filters, onChange, resultCount, accentColor = 'orange', showDuration = true }: ProductFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  // Unified accent color system for all 3 products
  const accentStyles = {
    orange: { btn: 'bg-orange-600 hover:bg-orange-700', chip: 'border-orange-300 bg-orange-50 text-orange-700' },
    purple: { btn: 'bg-purple-600 hover:bg-purple-700', chip: 'border-purple-300 bg-purple-50 text-purple-700' },
    teal: { btn: 'bg-teal-600 hover:bg-teal-700', chip: 'border-teal-300 bg-teal-50 text-teal-700' },
  };
  const { btn: btnClass, chip: chipClass } = accentStyles[accentColor] || accentStyles.orange;

  const activeFiltersCount = [
    filters.priceRange !== 'all',
    showDuration && filters.durationRange !== 'all',
    filters.minRating > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onChange({ sort: 'recommended', priceRange: 'all', durationRange: 'all', minRating: 0 });
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-[60px] z-30">
      <div className="py-3 px-4 md:px-0">
        {/* Top Row - Sort & Filter Toggle */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{resultCount}</span> results
          </p>
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 cursor-pointer"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? `${chipClass} border-current`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className={`w-5 h-5 rounded-full ${btnClass} text-white text-xs flex items-center justify-center`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="pt-3 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Price Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Price Range
              </label>
              <div className="flex flex-wrap gap-2">
                {priceOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...filters, priceRange: opt.value })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      filters.priceRange === opt.value ? chipClass : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Filter - hidden for Transfers */}
            {showDuration && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Duration
                </label>
                <div className="flex flex-wrap gap-2">
                  {durationOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => onChange({ ...filters, durationRange: opt.value })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        filters.durationRange === opt.value ? chipClass : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                {[0, 3, 3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => onChange({ ...filters, minRating: rating })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 ${
                      filters.minRating === rating ? chipClass : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {rating === 0 ? 'Any' : (
                      <>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {rating}+
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
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
