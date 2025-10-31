'use client';

import { useState } from 'react';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { TrendingUp, TrendingDown, Users, Flame, Sparkles } from 'lucide-react';

interface Destination {
  id: string;
  emoji: string;
  city: string;
  country: string;
  airportCode: string;
  image: string; // Gradient background
  priceFrom: number;
  valueScore: number;
  trend?: 'up' | 'down' | 'hot';
  trendPercent?: number;
  viewing?: number;
  continent: 'americas' | 'europe' | 'asia-pacific' | 'beach' | 'winter';
}

interface DestinationsSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🌍 Explore Destinations by Continent',
    viewAll: 'View All 240',
    from: 'from',
    americas: '🌎 Americas',
    europe: '🌍 Europe',
    asiaPacific: '🌏 Asia-Pacific',
    beach: '🌴 Beach',
    winter: '⛷️ Winter',
    all: 'All',
    viewing: 'viewing',
    hotDeal: 'Hot deal',
    clickHint: '💡 Click any destination to auto-fill search form with best dates',
  },
  pt: {
    title: '🌍 Explorar Destinos por Continente',
    viewAll: 'Ver Todos 240',
    from: 'a partir de',
    americas: '🌎 Américas',
    europe: '🌍 Europa',
    asiaPacific: '🌏 Ásia-Pacífico',
    beach: '🌴 Praia',
    winter: '⛷️ Inverno',
    all: 'Todos',
    viewing: 'visualizando',
    hotDeal: 'Oferta quente',
    clickHint: '💡 Clique em qualquer destino para preencher automaticamente o formulário com as melhores datas',
  },
  es: {
    title: '🌍 Explorar Destinos por Continente',
    viewAll: 'Ver Todos 240',
    from: 'desde',
    americas: '🌎 Américas',
    europe: '🌍 Europa',
    asiaPacific: '🌏 Asia-Pacífico',
    beach: '🌴 Playa',
    winter: '⛷️ Invierno',
    all: 'Todos',
    viewing: 'viendo',
    hotDeal: 'Oferta caliente',
    clickHint: '💡 Haz clic en cualquier destino para completar automáticamente el formulario con las mejores fechas',
  },
};

// Featured destinations with ML scoring and REAL photos
const featuredDestinations: Destination[] = [
  {
    id: '1',
    emoji: '🗼',
    city: 'Paris',
    country: 'France',
    airportCode: 'CDG',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
    priceFrom: 542,
    valueScore: calculateValueScore({
      price: 542,
      marketAvgPrice: 699,
      rating: 4.8,
      reviewCount: 15234,
      demandLevel: 85,
      availabilityLevel: 35,
    }),
    trend: 'up',
    trendPercent: 8,
    continent: 'europe',
  },
  {
    id: '2',
    emoji: '🏛️',
    city: 'Rome',
    country: 'Italy',
    airportCode: 'FCO',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop',
    priceFrom: 612,
    valueScore: calculateValueScore({
      price: 612,
      marketAvgPrice: 799,
      rating: 4.7,
      reviewCount: 12456,
      demandLevel: 78,
      availabilityLevel: 42,
    }),
    trend: 'down',
    trendPercent: 5,
    continent: 'europe',
  },
  {
    id: '3',
    emoji: '🗾',
    city: 'Tokyo',
    country: 'Japan',
    airportCode: 'NRT',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    priceFrom: 687,
    valueScore: calculateValueScore({
      price: 687,
      marketAvgPrice: 899,
      rating: 4.9,
      reviewCount: 18765,
      demandLevel: 92,
      availabilityLevel: 25,
    }),
    viewing: 89,
    continent: 'asia-pacific',
  },
  {
    id: '4',
    emoji: '🏖️',
    city: 'Cancún',
    country: 'Mexico',
    airportCode: 'CUN',
    image: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop',
    priceFrom: 287,
    valueScore: calculateValueScore({
      price: 287,
      marketAvgPrice: 449,
      rating: 4.6,
      reviewCount: 9876,
      demandLevel: 95,
      availabilityLevel: 15,
    }),
    trend: 'hot',
    continent: 'beach',
  },
  {
    id: '5',
    emoji: '🌉',
    city: 'San Francisco',
    country: 'USA',
    airportCode: 'SFO',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop',
    priceFrom: 142,
    valueScore: calculateValueScore({
      price: 142,
      marketAvgPrice: 229,
      rating: 4.5,
      reviewCount: 7654,
      demandLevel: 72,
      availabilityLevel: 55,
    }),
    continent: 'americas',
  },
  {
    id: '6',
    emoji: '🇬🇧',
    city: 'London',
    country: 'UK',
    airportCode: 'LHR',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop',
    priceFrom: 589,
    valueScore: calculateValueScore({
      price: 589,
      marketAvgPrice: 749,
      rating: 4.8,
      reviewCount: 16543,
      demandLevel: 88,
      availabilityLevel: 38,
    }),
    continent: 'europe',
  },
  {
    id: '7',
    emoji: '🗽',
    city: 'New York',
    country: 'USA',
    airportCode: 'JFK',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop',
    priceFrom: 89,
    valueScore: calculateValueScore({
      price: 89,
      marketAvgPrice: 179,
      rating: 4.7,
      reviewCount: 21345,
      demandLevel: 90,
      availabilityLevel: 32,
    }),
    continent: 'americas',
  },
  {
    id: '8',
    emoji: '🏝️',
    city: 'Bali',
    country: 'Indonesia',
    airportCode: 'DPS',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
    priceFrom: 742,
    valueScore: calculateValueScore({
      price: 742,
      marketAvgPrice: 999,
      rating: 4.9,
      reviewCount: 13456,
      demandLevel: 86,
      availabilityLevel: 28,
    }),
    continent: 'asia-pacific',
  },
];

type FilterType = 'all' | 'americas' | 'europe' | 'asia-pacific' | 'beach' | 'winter';

export function DestinationsSection({ lang = 'en' }: DestinationsSectionProps) {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter destinations
  const filteredDestinations = activeFilter === 'all'
    ? featuredDestinations
    : featuredDestinations.filter(d => d.continent === activeFilter);

  const handleDestinationClick = (destination: Destination) => {
    // This would auto-fill the search form - placeholder for now
    console.log('Auto-fill search with:', destination);
  };

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

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all' as FilterType, label: t.all },
          { key: 'americas' as FilterType, label: t.americas },
          { key: 'europe' as FilterType, label: t.europe },
          { key: 'asia-pacific' as FilterType, label: t.asiaPacific },
          { key: 'beach' as FilterType, label: t.beach },
          { key: 'winter' as FilterType, label: t.winter },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {filteredDestinations.map((destination) => (
          <button
            key={destination.id}
            onClick={() => handleDestinationClick(destination)}
            onMouseEnter={() => setHoveredId(destination.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`
              relative bg-white rounded-lg border-2 border-gray-200
              hover:border-primary-400 hover:shadow-lg
              transition-all duration-200 overflow-hidden text-left
              ${hoveredId === destination.id ? 'scale-[1.02]' : ''}
            `}
          >
            {/* Destination Photo */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={destination.image}
                alt={`${destination.city}, ${destination.country}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Dark overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Value Score Badge - Top Right */}
              <div className="absolute top-2 right-2">
                <ValueScoreBadge score={destination.valueScore} size="sm" showLabel={false} />
              </div>

              {/* Emoji - Bottom Left */}
              <div className="absolute bottom-2 left-2 text-4xl drop-shadow-lg">
                {destination.emoji}
              </div>
            </div>

            {/* Destination Details */}
            <div className="p-4">
              {/* City Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {destination.city}
              </h3>

              {/* Price */}
              <div className="mb-2">
                <span className="text-sm text-gray-600">{t.from} </span>
                <span className="text-2xl font-bold text-primary-600">${destination.priceFrom}</span>
              </div>

              {/* Value Score with Emoji */}
              <div className="mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  {destination.valueScore >= 85 ? '💎' : destination.valueScore >= 70 ? '🌟' : '👍'}
                  {' '}{destination.valueScore} {destination.valueScore >= 85 ? 'Excellent' : destination.valueScore >= 70 ? 'Great' : 'Good'}
                </span>
              </div>

              {/* Trend / Viewing / Hot Deal Indicator */}
              {destination.trend === 'up' && destination.trendPercent && (
                <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>📈 +{destination.trendPercent}% trend</span>
                </div>
              )}
              {destination.trend === 'down' && destination.trendPercent && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                  <TrendingDown className="w-3 h-3" />
                  <span>📉 -{destination.trendPercent}% trend</span>
                </div>
              )}
              {destination.viewing && (
                <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                  <Users className="w-3 h-3" />
                  <span>👥 {destination.viewing} {t.viewing}</span>
                </div>
              )}
              {destination.trend === 'hot' && (
                <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                  <Flame className="w-3 h-3" />
                  <span>🔥 {t.hotDeal}</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Click Hint */}
      <div className="text-center text-sm text-gray-600 mt-4">
        {t.clickHint}
      </div>
    </section>
  );
}
