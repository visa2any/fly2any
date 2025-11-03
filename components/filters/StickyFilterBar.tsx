/**
 * Sticky Filter Summary Bar
 *
 * Mobile-first component that shows active filters at top of results
 * Key features:
 * - Always visible (sticky positioning)
 * - Horizontal scroll for many filters
 * - Quick remove individual filters
 * - Open filter modal on click
 * - Live result count
 */

'use client';

import { X, Sliders, ChevronRight } from 'lucide-react';
import { FlightFilters } from '@/components/flights/FlightFilters';
import { getFilterSummary, type FilterSummary } from '@/lib/filters/filterState';

interface StickyFilterBarProps {
  filters: FlightFilters;
  defaultFilters: Partial<FlightFilters>;
  onOpenFilters: () => void; // Open filter bottom sheet
  onClearFilter: (filterKey: string) => void; // Remove specific filter
  onClearAll: () => void; // Clear all filters
  resultCount: number;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    filters: 'Filters',
    clearAll: 'Clear all',
    results: 'flights',
    result: 'flight',
    noFilters: 'No filters applied',
  },
  pt: {
    filters: 'Filtros',
    clearAll: 'Limpar tudo',
    results: 'voos',
    result: 'voo',
    noFilters: 'Nenhum filtro aplicado',
  },
  es: {
    filters: 'Filtros',
    clearAll: 'Limpiar todo',
    results: 'vuelos',
    result: 'vuelo',
    noFilters: 'Sin filtros aplicados',
  }
};

export default function StickyFilterBar({
  filters,
  defaultFilters,
  onOpenFilters,
  onClearFilter,
  onClearAll,
  resultCount,
  lang = 'en'
}: StickyFilterBarProps) {
  const t = content[lang];
  const filterSummary = getFilterSummary(filters);
  const hasActiveFilters = filterSummary.length > 0;

  return (
    <div className="sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      {/* Mobile & Tablet Layout */}
      <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto scrollbar-hide scroll-smooth">
        {/* Filter Button - Always visible */}
        <button
          onClick={onOpenFilters}
          className={`
            flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm
            transition-all duration-200 min-w-[44px] min-h-[44px] touch-manipulation
            ${hasActiveFilters
              ? 'bg-primary-50 border-2 border-primary-500 text-primary-700 shadow-sm'
              : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
            }
          `}
          aria-label={`${t.filters}${hasActiveFilters ? ` (${filterSummary.length})` : ''}`}
        >
          <Sliders className="w-4 h-4" strokeWidth={2.5} />
          <span className="font-semibold">{t.filters}</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
              {filterSummary.length}
            </span>
          )}
        </button>

        {/* Active Filter Pills */}
        {hasActiveFilters ? (
          <>
            {filterSummary.map((filter) => (
              <FilterPill
                key={filter.key}
                filter={filter}
                onRemove={() => onClearFilter(filter.key)}
              />
            ))}

            {/* Clear All Button */}
            <button
              onClick={onClearAll}
              className="
                flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg
                bg-red-50 border border-red-300 text-red-700 hover:bg-red-100
                font-medium text-sm transition-colors min-w-[44px] min-h-[44px] touch-manipulation
              "
              aria-label={t.clearAll}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">{t.clearAll}</span>
            </button>
          </>
        ) : (
          // No filters message
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>{t.noFilters}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Result Count - Right aligned */}
        <div className="ml-auto flex-shrink-0 flex items-baseline gap-1 pl-2 border-l border-gray-200">
          <span className="font-bold text-primary-600 text-base tabular-nums">
            {resultCount.toLocaleString()}
          </span>
          <span className="text-sm text-gray-600 font-medium">
            {resultCount === 1 ? t.result : t.results}
          </span>
        </div>
      </div>

      {/* Scroll Indicator (gradient fade at edges) */}
      {hasActiveFilters && filterSummary.length > 3 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/98 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/98 to-transparent pointer-events-none" />
        </>
      )}
    </div>
  );
}

/**
 * Individual Filter Pill Component
 */
interface FilterPillProps {
  filter: FilterSummary;
  onRemove: () => void;
}

function FilterPill({ filter, onRemove }: FilterPillProps) {
  return (
    <div
      className="
        flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
        bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200
        text-sm font-medium transition-all duration-200 hover:shadow-sm
        group min-h-[36px] touch-manipulation
      "
      role="status"
      aria-label={`${filter.label}: ${filter.value}`}
    >
      {/* Filter value */}
      <span className="text-gray-700 max-w-[150px] truncate">
        {filter.value}
      </span>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="
          p-0.5 rounded-full hover:bg-blue-200 transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          min-w-[20px] min-h-[20px] flex items-center justify-center
        "
        aria-label={`Remove ${filter.label} filter`}
      >
        <X className="w-3.5 h-3.5 text-blue-700 group-hover:text-blue-900" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/**
 * Desktop variant (optional - can use same component)
 * Shows filters inline with sort options
 */
export function DesktopFilterSummary({
  filters,
  onOpenFilters,
  onClearFilter,
  onClearAll
}: Omit<StickyFilterBarProps, 'resultCount' | 'defaultFilters'>) {
  const filterSummary = getFilterSummary(filters);
  const hasActiveFilters = filterSummary.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <span className="text-sm text-gray-600 font-medium">Active filters:</span>

      {filterSummary.slice(0, 5).map((filter) => (
        <div
          key={filter.key}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-sm"
        >
          <span className="text-gray-700">{filter.value}</span>
          <button
            onClick={() => onClearFilter(filter.key)}
            className="p-0.5 rounded-full hover:bg-blue-200 transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3 text-blue-700" />
          </button>
        </div>
      ))}

      {filterSummary.length > 5 && (
        <button
          onClick={onOpenFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          +{filterSummary.length - 5} more
        </button>
      )}

      <button
        onClick={onClearAll}
        className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
