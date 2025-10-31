'use client';

import { useState } from 'react';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { Clock, TrendingUp, Users, Flame } from 'lucide-react';

interface FlashDeal {
  id: string;
  from: string;
  to: string;
  price: number;
  originalPrice: number;
  savings: number;
  valueScore: number;
  timeRemaining: string;
  urgency?: 'low-seats' | 'high-demand' | 'rising-price';
  urgencyValue?: number;
  carrier?: string;
}

interface FlashDealsSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🔥 Flash Deals - Expiring Soon',
    viewAll: 'View All 47',
    save: 'Save',
    viewing: 'viewing',
    only: 'Only',
    left: 'left',
    rising: 'Rising',
    scrollHint: '← Scroll →',
  },
  pt: {
    title: '🔥 Ofertas Relâmpago - Expirando em Breve',
    viewAll: 'Ver Todos 47',
    save: 'Economize',
    viewing: 'visualizando',
    only: 'Apenas',
    left: 'restantes',
    rising: 'Subindo',
    scrollHint: '← Rolar →',
  },
  es: {
    title: '🔥 Ofertas Flash - Expiran Pronto',
    viewAll: 'Ver Todos 47',
    save: 'Ahorra',
    viewing: 'viendo',
    only: 'Solo',
    left: 'quedan',
    rising: 'Subiendo',
    scrollHint: '← Desplazar →',
  },
};

// Flash deals data with ML scoring
const flashDeals: FlashDeal[] = [
  {
    id: '1',
    from: 'BOS',
    to: 'BCN',
    price: 448,
    originalPrice: 637,
    savings: 189,
    valueScore: calculateValueScore({
      price: 448,
      marketAvgPrice: 637,
      rating: 4.7,
      reviewCount: 3421,
      demandLevel: 92,
      availabilityLevel: 8,
    }),
    timeRemaining: '2h 34m',
    urgency: 'low-seats',
    urgencyValue: 5,
    carrier: 'Iberia',
  },
  {
    id: '2',
    from: 'ORD',
    to: 'AMS',
    price: 523,
    originalPrice: 757,
    savings: 234,
    valueScore: calculateValueScore({
      price: 523,
      marketAvgPrice: 757,
      rating: 4.8,
      reviewCount: 5678,
      demandLevel: 85,
      availabilityLevel: 35,
    }),
    timeRemaining: '5h 12m',
    urgency: 'high-demand',
    urgencyValue: 43,
    carrier: 'KLM',
  },
  {
    id: '3',
    from: 'SEA',
    to: 'LHR',
    price: 612,
    originalPrice: 790,
    savings: 178,
    valueScore: calculateValueScore({
      price: 612,
      marketAvgPrice: 790,
      rating: 4.6,
      reviewCount: 4567,
      demandLevel: 78,
      availabilityLevel: 45,
    }),
    timeRemaining: '1h 47m',
    urgency: 'rising-price',
    carrier: 'British Airways',
  },
  {
    id: '4',
    from: 'MIA',
    to: 'MAD',
    price: 387,
    originalPrice: 600,
    savings: 213,
    valueScore: calculateValueScore({
      price: 387,
      marketAvgPrice: 600,
      rating: 4.9,
      reviewCount: 6789,
      demandLevel: 95,
      availabilityLevel: 10,
    }),
    timeRemaining: '4h 22m',
    urgency: 'low-seats',
    urgencyValue: 3,
    carrier: 'Iberia',
  },
  {
    id: '5',
    from: 'LAX',
    to: 'CDG',
    price: 534,
    originalPrice: 799,
    savings: 265,
    valueScore: calculateValueScore({
      price: 534,
      marketAvgPrice: 799,
      rating: 4.7,
      reviewCount: 5432,
      demandLevel: 88,
      availabilityLevel: 28,
    }),
    timeRemaining: '3h 15m',
    urgency: 'high-demand',
    urgencyValue: 67,
    carrier: 'Air France',
  },
  {
    id: '6',
    from: 'JFK',
    to: 'FCO',
    price: 489,
    originalPrice: 699,
    savings: 210,
    valueScore: calculateValueScore({
      price: 489,
      marketAvgPrice: 699,
      rating: 4.8,
      reviewCount: 4321,
      demandLevel: 82,
      availabilityLevel: 38,
    }),
    timeRemaining: '6h 41m',
    urgency: 'low-seats',
    urgencyValue: 7,
    carrier: 'ITA Airways',
  },
];

export function FlashDealsSection({ lang = 'en' }: FlashDealsSectionProps) {
  const t = translations[lang];
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-8" style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          {t.viewAll} →
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-gray-200 mb-4"></div>

      {/* Scroll Hint */}
      <div className="text-center text-sm text-gray-600 mb-4 font-semibold">
        {t.scrollHint}
      </div>

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-4 min-w-max">
          {flashDeals.map((deal) => (
            <div
              key={deal.id}
              onMouseEnter={() => setHoveredId(deal.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                w-80 bg-white rounded-lg border-2 border-gray-200
                hover:border-primary-400 hover:shadow-lg
                transition-all duration-200 overflow-hidden flex-shrink-0
                ${hoveredId === deal.id ? 'scale-[1.02]' : ''}
              `}
            >
              {/* Deal Header - Route */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">
                    {deal.from} → {deal.to}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                    {deal.carrier}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold">${deal.price}</div>
                  <div className="text-lg line-through opacity-75 mb-1">
                    ${deal.originalPrice}
                  </div>
                </div>
              </div>

              {/* Deal Details */}
              <div className="p-4">
                {/* Time Remaining */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-600">
                    ⏱️ {deal.timeRemaining}
                  </span>
                </div>

                {/* Savings */}
                <div className="mb-3">
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-lg">💰</span>
                    <span className="text-sm font-bold text-green-700">
                      {t.save} ${deal.savings}
                    </span>
                  </div>
                </div>

                {/* Value Score */}
                <div className="mb-3">
                  <ValueScoreBadge score={deal.valueScore} size="md" showLabel={true} />
                </div>

                {/* Urgency Indicator */}
                {deal.urgency === 'low-seats' && deal.urgencyValue && (
                  <div className="flex items-center gap-1 text-sm text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    <Flame className="w-4 h-4" />
                    <span>🔥 {t.only} {deal.urgencyValue} {t.left}!</span>
                  </div>
                )}
                {deal.urgency === 'high-demand' && deal.urgencyValue && (
                  <div className="flex items-center gap-1 text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <Users className="w-4 h-4" />
                    <span>👥 {deal.urgencyValue} {t.viewing}</span>
                  </div>
                )}
                {deal.urgency === 'rising-price' && (
                  <div className="flex items-center gap-1 text-sm text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                    <TrendingUp className="w-4 h-4" />
                    <span>📈 {t.rising}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
