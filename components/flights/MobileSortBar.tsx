'use client';

import { useEffect, useRef } from 'react';
import { DollarSign, Sparkles, Zap, Luggage, RefreshCw, Ticket, SlidersHorizontal } from 'lucide-react';

export type MobileSortOption = 'cheapest' | 'best' | 'fastest' | 'baggage' | 'refundable' | 'rebooking';

interface MobileSortBarProps {
  currentSort: MobileSortOption;
  onChange: (sort: MobileSortOption) => void;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    cheapest: 'Cheapest',
    best: 'Best',
    fastest: 'Shortest',
    baggage: 'Baggage',
    refundable: 'Refundable',
    rebooking: 'Rebooking',
    filter: 'Filter',
  },
  pt: {
    cheapest: 'Mais Barato',
    best: 'Melhor',
    fastest: 'Mais Curto',
    baggage: 'Bagagem',
    refundable: 'Reembolsável',
    rebooking: 'Remarcação',
    filter: 'Filtro',
  },
  es: {
    cheapest: 'Más Barato',
    best: 'Mejor',
    fastest: 'Más Corto',
    baggage: 'Equipaje',
    refundable: 'Reembolsable',
    rebooking: 'Cambios',
    filter: 'Filtrar',
  },
};

const sortOptions = [
  {
    id: 'cheapest' as MobileSortOption,
    icon: DollarSign,
    labelKey: 'cheapest',
    color: 'text-green-600',
    activeBg: 'bg-green-600',
  },
  {
    id: 'best' as MobileSortOption,
    icon: Sparkles,
    labelKey: 'best',
    color: 'text-purple-600',
    activeBg: 'bg-purple-600',
  },
  {
    id: 'fastest' as MobileSortOption,
    icon: Zap,
    labelKey: 'fastest',
    color: 'text-orange-600',
    activeBg: 'bg-orange-600',
  },
  {
    id: 'baggage' as MobileSortOption,
    icon: Luggage,
    labelKey: 'baggage',
    color: 'text-blue-600',
    activeBg: 'bg-blue-600',
  },
  {
    id: 'refundable' as MobileSortOption,
    icon: RefreshCw,
    labelKey: 'refundable',
    color: 'text-teal-600',
    activeBg: 'bg-teal-600',
  },
  {
    id: 'rebooking' as MobileSortOption,
    icon: Ticket,
    labelKey: 'rebooking',
    color: 'text-indigo-600',
    activeBg: 'bg-indigo-600',
  },
];

/**
 * Mobile-only horizontal scrollable sort/filter bar
 * Positioned between search form and flight results
 * Ultra-compact, single row, auto-scrolls selected option into view
 */
export default function MobileSortBar({
  currentSort,
  onChange,
  onFilterClick,
  activeFilterCount = 0,
  lang = 'en',
}: MobileSortBarProps) {
  const t = content[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll selected option into view
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Calculate scroll position to center the button
      const scrollLeft = button.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [currentSort]);

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        {/* Filter Button */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 text-gray-700 active:bg-gray-200 transition-colors"
            aria-label={t.filter}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">{t.filter}</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[16px] h-4 flex items-center justify-center bg-primary-600 text-white text-[9px] font-bold rounded-full px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {/* Divider */}
        {onFilterClick && (
          <div className="w-px h-5 bg-gray-300 flex-shrink-0" />
        )}

        {/* Sort Options - Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide scroll-smooth"
          role="radiogroup"
          aria-label="Sort options"
        >
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentSort === option.id;

            return (
              <button
                key={option.id}
                ref={isActive ? activeButtonRef : null}
                onClick={() => onChange(option.id)}
                role="radio"
                aria-checked={isActive}
                className={`
                  flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg
                  transition-all duration-150 active:scale-95
                  ${isActive
                    ? `${option.activeBg} text-white shadow-sm`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-3 h-3" strokeWidth={2.5} />
                <span className="text-[10px] font-semibold whitespace-nowrap">
                  {t[option.labelKey as keyof typeof t]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
