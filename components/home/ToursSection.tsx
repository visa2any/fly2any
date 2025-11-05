'use client';

import { useState } from 'react';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { MapPin, Star, Users, Clock, Camera, Mountain, UtensilsCrossed, TrendingUp, Flame, Award } from 'lucide-react';

interface Tour {
  id: string;
  title: string;
  destination: string;
  image: string;
  rating: number;
  reviews: number;
  pricePerPerson: number;
  originalPrice?: number;
  valueScore: number;
  duration: string;
  category: string;
  badges: string[];
  trending?: boolean;
  demandLevel?: number;
  groupSize?: number;
  highlights: string[];
  difficulty?: string;
}

interface ToursSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: 'Featured Tours & Activities',
    subtitle: 'AI-curated experiences based on popularity, value, and traveler reviews',
    viewAll: 'View All Tours',
    perPerson: 'per person',
    reviews: 'reviews',
    bookNow: 'Book Now',
    duration: 'Duration',
    groupSize: 'Group Size',
    difficulty: 'Difficulty',
    easy: 'Easy',
    moderate: 'Moderate',
    challenging: 'Challenging',
    spots: 'spots left',
    highDemand: 'High demand',
  },
  pt: {
    title: 'Passeios e Atividades em Destaque',
    subtitle: 'Experiências selecionadas por IA baseadas em popularidade, valor e avaliações',
    viewAll: 'Ver Todos os Passeios',
    perPerson: 'por pessoa',
    reviews: 'avaliações',
    bookNow: 'Reservar Agora',
    duration: 'Duração',
    groupSize: 'Tamanho do Grupo',
    difficulty: 'Dificuldade',
    easy: 'Fácil',
    moderate: 'Moderado',
    challenging: 'Desafiador',
    spots: 'vagas restantes',
    highDemand: 'Alta demanda',
  },
  es: {
    title: 'Tours y Actividades Destacados',
    subtitle: 'Experiencias seleccionadas por IA basadas en popularidad, valor y reseñas',
    viewAll: 'Ver Todos los Tours',
    perPerson: 'por persona',
    reviews: 'reseñas',
    bookNow: 'Reservar Ahora',
    duration: 'Duración',
    groupSize: 'Tamaño del Grupo',
    difficulty: 'Dificultad',
    easy: 'Fácil',
    moderate: 'Moderado',
    challenging: 'Desafiante',
    spots: 'lugares restantes',
    highDemand: 'Alta demanda',
  },
};

// Sample tour data with ML scoring
const featuredTours: Tour[] = [
  {
    id: '1',
    title: 'Grand Canyon Helicopter Tour',
    destination: 'Las Vegas, Nevada',
    image: '🚁',
    rating: 4.9,
    reviews: 5432,
    pricePerPerson: 299,
    originalPrice: 449,
    valueScore: calculateValueScore({
      price: 299,
      marketAvgPrice: 449,
      rating: 4.9,
      reviewCount: 5432,
      demandLevel: 95,
      availabilityLevel: 10
    }),
    duration: '4 hours',
    category: 'Adventure',
    badges: ['Best Seller', 'Likely to Sell Out'],
    trending: true,
    demandLevel: 95,
    groupSize: 6,
    highlights: ['Aerial views', 'Landing on canyon floor', 'Champagne toast'],
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Wine Tasting in Napa Valley',
    destination: 'Napa, California',
    image: '🍷',
    rating: 4.8,
    reviews: 3241,
    pricePerPerson: 149,
    originalPrice: 229,
    valueScore: calculateValueScore({
      price: 149,
      marketAvgPrice: 229,
      rating: 4.8,
      reviewCount: 3241,
      demandLevel: 82,
      availabilityLevel: 30
    }),
    duration: '6 hours',
    category: 'Food & Wine',
    badges: ['Top Rated', 'Small Group'],
    demandLevel: 82,
    groupSize: 8,
    highlights: ['4 wineries', 'Gourmet lunch', 'Expert guide'],
    difficulty: 'easy'
  },
  {
    id: '3',
    title: 'NYC Walking Food Tour',
    destination: 'New York City',
    image: '🗽',
    rating: 4.7,
    reviews: 8765,
    pricePerPerson: 89,
    originalPrice: 129,
    valueScore: calculateValueScore({
      price: 89,
      marketAvgPrice: 129,
      rating: 4.7,
      reviewCount: 8765,
      demandLevel: 88,
      availabilityLevel: 45
    }),
    duration: '3 hours',
    category: 'Culinary',
    badges: ['Most Popular', 'Free Cancellation'],
    trending: true,
    demandLevel: 88,
    groupSize: 12,
    highlights: ['8 food tastings', 'Historic neighborhoods', 'Local guide'],
    difficulty: 'easy'
  },
  {
    id: '4',
    title: 'Snorkeling Adventure',
    destination: 'Key West, Florida',
    image: '🤿',
    rating: 4.6,
    reviews: 2156,
    pricePerPerson: 119,
    originalPrice: 179,
    valueScore: calculateValueScore({
      price: 119,
      marketAvgPrice: 179,
      rating: 4.6,
      reviewCount: 2156,
      demandLevel: 76,
      availabilityLevel: 50
    }),
    duration: '4 hours',
    category: 'Water Sports',
    badges: ['Equipment Included', 'All Levels'],
    demandLevel: 76,
    groupSize: 15,
    highlights: ['Coral reef exploration', 'Equipment provided', 'Marine life'],
    difficulty: 'moderate'
  }
];

// Difficulty level colors
const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  challenging: 'bg-red-100 text-red-800 border-red-300'
};

export function ToursSection({ lang = 'en' }: ToursSectionProps) {
  const t = translations[lang];
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return '';
    return {
      easy: t.easy,
      moderate: t.moderate,
      challenging: t.challenging
    }[difficulty] || '';
  };

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredTours.map((tour) => (
          <div
            key={tour.id}
            className={`
              flex flex-col
              bg-white rounded-lg border-2 border-gray-200
              hover:border-primary-400 hover:shadow-lg
              transition-all duration-200 overflow-hidden
              ${hoveredId === tour.id ? 'scale-[1.02]' : ''}
            `}
            onMouseEnter={() => setHoveredId(tour.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Tour Image */}
            <div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-6xl">{tour.image}</span>

              {/* Value Score Badge - Top Right */}
              <div className="absolute top-2 right-2">
                <ValueScoreBadge score={tour.valueScore} size="sm" showLabel={false} />
              </div>

              {/* Trending Badge - Top Left */}
              {tour.trending && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Trending
                </div>
              )}

              {/* Category Badge - Bottom */}
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {tour.category}
              </div>
            </div>

            {/* Tour Details */}
            <div className="p-2.5 flex-1 flex flex-col">
              {/* Title and Destination */}
              <h3 className="font-bold text-gray-900 text-base mb-0.5 line-clamp-2">{tour.title}</h3>
              <p className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {tour.destination}
              </p>

              {/* Rating + Reviews + Badges + Demand - ALL ON ONE LINE */}
              <div className="h-[52px] mb-1.5 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <div className="flex items-center gap-1 bg-primary-600 text-white px-2 py-0.5 rounded font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {tour.rating}
                  </div>
                  <span className="text-xs text-gray-600">({tour.reviews.toLocaleString()})</span>
                  {tour.badges.slice(0, 2).map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 bg-green-100 border border-green-300 text-green-700 rounded text-[10px] font-bold"
                    >
                      {badge}
                    </span>
                  ))}
                  {tour.demandLevel && tour.demandLevel > 85 && (
                    <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                      <TrendingUp className="w-2.5 h-2.5" />
                      High
                    </span>
                  )}
                  {tour.groupSize && tour.demandLevel && tour.demandLevel > 90 && (
                    <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                      ⚠️ {Math.floor(tour.groupSize * 0.3)} left
                    </span>
                  )}
                </div>
              </div>

              {/* Duration + Group Size + Difficulty - ONE LINE */}
              <div className="flex items-center gap-2 mb-1.5 text-[10px] text-gray-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{tour.duration}</span>
                </div>
                {tour.groupSize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Max {tour.groupSize}</span>
                  </div>
                )}
                {tour.difficulty && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 border rounded text-[10px] font-semibold ${difficultyColors[tour.difficulty as keyof typeof difficultyColors]}`}>
                    {getDifficultyLabel(tour.difficulty)}
                  </span>
                )}
              </div>

              {/* Highlights - COMPACT */}
              <div className="mb-1.5">
                <div className="flex flex-wrap gap-1">
                  {tour.highlights.slice(0, 3).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded"
                    >
                      • {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Section */}
              <div className="mt-auto border-t border-gray-200 pt-2">
                <div className="flex items-end justify-between">
                  <div>
                    {tour.originalPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        ${tour.originalPrice}
                      </div>
                    )}
                    <div className="text-lg font-bold text-primary-600">
                      ${tour.pricePerPerson}
                    </div>
                    <div className="text-xs text-gray-600">{t.perPerson}</div>
                  </div>
                  <button className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    {t.bookNow}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-6">
        <button className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold rounded-lg transition-colors">
          {t.viewAll} →
        </button>
      </div>
    </section>
  );
}
