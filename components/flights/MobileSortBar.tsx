'use client';

import { useEffect, useRef } from 'react';
import { DollarSign, Sparkles, Zap, Luggage, RefreshCw, Ticket, SlidersHorizontal, Plane, Sunrise, Moon } from 'lucide-react';

export type MobileSortOption = 'cheapest' | 'best' | 'fastest' | 'nonstop' | 'morning' | 'evening' | 'baggage' | 'refundable' | 'rebooking';

interface MobileSortBarProps {
  selectedOptions: Set<MobileSortOption>;
  onToggle: (option: MobileSortOption) => void;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: { cheapest: 'Cheapest', best: 'Best', fastest: 'Shortest', nonstop: 'Nonstop', morning: 'Morning', evening: 'Evening', baggage: 'Baggage', refundable: 'Refundable', rebooking: 'Flexible', filter: 'Filter' },
  pt: { cheapest: 'Mais Barato', best: 'Melhor', fastest: 'Mais Curto', nonstop: 'Direto', morning: 'Manhã', evening: 'Noite', baggage: 'Bagagem', refundable: 'Reembolsável', rebooking: 'Flexível', filter: 'Filtro' },
  es: { cheapest: 'Más Barato', best: 'Mejor', fastest: 'Más Corto', nonstop: 'Directo', morning: 'Mañana', evening: 'Noche', baggage: 'Equipaje', refundable: 'Reembolsable', rebooking: 'Flexible', filter: 'Filtrar' },
};

const sortOptions: { id: MobileSortOption; icon: typeof DollarSign; labelKey: string; activeBg: string }[] = [
  { id: 'cheapest', icon: DollarSign, labelKey: 'cheapest', activeBg: 'bg-green-600' },
  { id: 'best', icon: Sparkles, labelKey: 'best', activeBg: 'bg-purple-600' },
  { id: 'fastest', icon: Zap, labelKey: 'fastest', activeBg: 'bg-orange-600' },
  { id: 'nonstop', icon: Plane, labelKey: 'nonstop', activeBg: 'bg-sky-600' },
  { id: 'morning', icon: Sunrise, labelKey: 'morning', activeBg: 'bg-amber-500' },
  { id: 'evening', icon: Moon, labelKey: 'evening', activeBg: 'bg-slate-600' },
  { id: 'baggage', icon: Luggage, labelKey: 'baggage', activeBg: 'bg-primary-500' },
  { id: 'refundable', icon: RefreshCw, labelKey: 'refundable', activeBg: 'bg-teal-600' },
  { id: 'rebooking', icon: Ticket, labelKey: 'rebooking', activeBg: 'bg-indigo-600' },
];

/**
 * Mobile-only sticky horizontal multi-select filter bar
 * Supports multiple simultaneous selections with toggle behavior
 */
export default function MobileSortBar({ selectedOptions, onToggle, onFilterClick, activeFilterCount = 0, lang = 'en' }: MobileSortBarProps) {
  const t = content[lang];
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<MobileSortOption, HTMLButtonElement>>(new Map());

  // Auto-scroll last toggled option into view
  useEffect(() => {
    if (scrollRef.current && selectedOptions.size > 0) {
      const lastSelected = Array.from(selectedOptions).pop();
      const btn = lastSelected ? buttonRefs.current.get(lastSelected) : null;
      if (btn) {
        const container = scrollRef.current;
        const scrollLeft = btn.offsetLeft - (container.clientWidth / 2) + (btn.offsetWidth / 2);
        container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
      }
    }
  }, [selectedOptions.size]);

  return (
    <nav className="md:hidden sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-gray-100" role="navigation" aria-label="Flight filters" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        {/* Filter Button */}
        {onFilterClick && (
          <>
            <button onClick={onFilterClick} className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 text-gray-700 active:bg-gray-200" aria-label={t.filter}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold">{t.filter}</span>
              {activeFilterCount > 0 && <span className="min-w-[14px] h-3.5 flex items-center justify-center bg-primary-600 text-white text-[8px] font-bold rounded-full px-0.5">{activeFilterCount}</span>}
            </button>
            <div className="w-px h-4 bg-gray-300 flex-shrink-0" />
          </>
        )}

        {/* Multi-Select Options */}
        <div ref={scrollRef} className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }} role="group" aria-label="Sort and filter options">
          {sortOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = selectedOptions.has(opt.id);
            return (
              <button
                key={opt.id}
                ref={(el) => { if (el) buttonRefs.current.set(opt.id, el); }}
                onClick={() => onToggle(opt.id)}
                aria-pressed={isActive}
                className={`flex-shrink-0 flex items-center gap-0.5 px-2 py-1 rounded-full transition-all duration-150 active:scale-95 ${isActive ? `${opt.activeBg} text-white shadow-sm` : 'bg-gray-100 text-gray-700'}`}
              >
                <Icon className="w-3 h-3" strokeWidth={2.5} />
                <span className="text-[10px] font-semibold whitespace-nowrap">{t[opt.labelKey as keyof typeof t]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
