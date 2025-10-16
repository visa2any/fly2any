'use client';

import { Sparkles, DollarSign, Zap, Clock } from 'lucide-react';
import { spacing, typography, colors } from '@/lib/design-system';

export type SortOption = 'best' | 'cheapest' | 'fastest' | 'earliest';

interface SortBarProps {
  currentSort: SortOption;
  onChange: (sort: SortOption) => void;
  resultCount?: number;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    best: 'Best',
    cheapest: 'Cheapest',
    fastest: 'Fastest',
    earliest: 'Earliest',
    results: 'results',
    aiScore: 'AI Score',
    lowestPrice: 'Lowest price',
    shortestDuration: 'Shortest duration',
    earliestDeparture: 'Earliest departure',
  },
  pt: {
    best: 'Melhor',
    cheapest: 'Mais Barato',
    fastest: 'Mais Rápido',
    earliest: 'Mais Cedo',
    results: 'resultados',
    aiScore: 'Score IA',
    lowestPrice: 'Menor preço',
    shortestDuration: 'Menor duração',
    earliestDeparture: 'Partida mais cedo',
  },
  es: {
    best: 'Mejor',
    cheapest: 'Más Barato',
    fastest: 'Más Rápido',
    earliest: 'Más Temprano',
    results: 'resultados',
    aiScore: 'Score IA',
    lowestPrice: 'Precio más bajo',
    shortestDuration: 'Menor duración',
    earliestDeparture: 'Salida más temprana',
  },
};

const sortOptions = [
  {
    id: 'best' as SortOption,
    icon: Sparkles,
    labelKey: 'best',
    descriptionKey: 'aiScore',
    gradient: 'from-purple-500 to-pink-500',
    hoverGradient: 'hover:from-purple-600 hover:to-pink-600',
    activeGlow: 'shadow-purple-500/50',
  },
  {
    id: 'cheapest' as SortOption,
    icon: DollarSign,
    labelKey: 'cheapest',
    descriptionKey: 'lowestPrice',
    gradient: 'from-green-500 to-emerald-500',
    hoverGradient: 'hover:from-green-600 hover:to-emerald-600',
    activeGlow: 'shadow-green-500/50',
  },
  {
    id: 'fastest' as SortOption,
    icon: Zap,
    labelKey: 'fastest',
    descriptionKey: 'shortestDuration',
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'hover:from-orange-600 hover:to-red-600',
    activeGlow: 'shadow-orange-500/50',
  },
  {
    id: 'earliest' as SortOption,
    icon: Clock,
    labelKey: 'earliest',
    descriptionKey: 'earliestDeparture',
    gradient: 'from-blue-500 to-cyan-500',
    hoverGradient: 'hover:from-blue-600 hover:to-cyan-600',
    activeGlow: 'shadow-blue-500/50',
  },
];

export default function SortBar({
  currentSort,
  onChange,
  resultCount = 0,
  lang = 'en'
}: SortBarProps) {
  const t = content[lang];

  return (
    <div className="w-full mb-2">
      {/* Ultra-Compact Result count + Sort options in ONE line */}
      <div className="flex items-center justify-between gap-3 bg-white/80 backdrop-blur-lg rounded-lg shadow-sm border border-gray-200 px-3 py-1.5 mb-2">
        {/* Result count - Inline */}
        {resultCount > 0 && (
          <div className="flex items-baseline gap-1.5 flex-shrink-0">
            <span className="font-bold text-gray-900" style={{ fontSize: typography.card.price.size }}>{resultCount}</span>
            <span className="text-gray-600 font-medium" style={{ fontSize: typography.card.body.size }}>{t.results}</span>
          </div>
        )}

        {/* Sort options - Compact inline buttons */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth flex-1 justify-end">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = currentSort === option.id;

            return (
              <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className={`
                  group relative flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded
                  font-semibold transition-all duration-200
                  ${
                    isActive
                      ? `bg-gradient-to-r ${option.gradient} text-white shadow-md`
                      : `bg-white text-gray-700 hover:bg-gray-50 border border-gray-200`
                  }
                `}
                style={{ fontSize: typography.card.meta.size }}
                aria-label={`${t[option.labelKey as keyof typeof t]}`}
                aria-pressed={isActive}
              >
                {/* Icon - Smaller */}
                <Icon
                  className={`w-3 h-3 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
                  strokeWidth={2.5}
                />

                {/* Label - Hidden on very small screens */}
                <span className="whitespace-nowrap hidden sm:inline">
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
