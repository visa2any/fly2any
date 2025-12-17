'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { MapPin, Star, Users, Clock, TrendingUp, Flame, Activity, ArrowRight, Sparkles, Waves, Heart, Palette } from 'lucide-react';

interface ActivityItem {
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
}

interface ActivitiesSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: 'Popular Activities',
    subtitle: 'Unforgettable experiences curated for every interest',
    viewAll: 'Explore All Activities',
    perPerson: 'per person',
    reviews: 'reviews',
    bookNow: 'Book Now',
    duration: 'Duration',
    groupSize: 'Group Size',
    spots: 'spots left',
  },
  pt: {
    title: 'Atividades Populares',
    subtitle: 'Experiências inesquecíveis selecionadas para todos os interesses',
    viewAll: 'Explorar Todas as Atividades',
    perPerson: 'por pessoa',
    reviews: 'avaliações',
    bookNow: 'Reservar',
    duration: 'Duração',
    groupSize: 'Tamanho do Grupo',
    spots: 'vagas',
  },
  es: {
    title: 'Actividades Populares',
    subtitle: 'Experiencias inolvidables seleccionadas para todos los intereses',
    viewAll: 'Explorar Todas las Actividades',
    perPerson: 'por persona',
    reviews: 'reseñas',
    bookNow: 'Reservar',
    duration: 'Duración',
    groupSize: 'Tamaño del Grupo',
    spots: 'lugares',
  },
};

const featuredActivities: ActivityItem[] = [
  {
    id: '1',
    title: 'Surfing Lessons in Waikiki',
    destination: 'Honolulu, Hawaii',
    image: '🏄',
    rating: 4.9,
    reviews: 3245,
    pricePerPerson: 89,
    originalPrice: 129,
    valueScore: calculateValueScore({
      price: 89,
      marketAvgPrice: 129,
      rating: 4.9,
      reviewCount: 3245,
      demandLevel: 92,
      availabilityLevel: 20
    }),
    duration: '2 hours',
    category: 'Water Sports',
    badges: ['Best Seller', 'Beginner Friendly'],
    trending: true,
    demandLevel: 92,
    groupSize: 8,
    highlights: ['Board included', 'Expert instructors', 'All levels welcome'],
  },
  {
    id: '2',
    title: 'Cooking Class in Tuscany',
    destination: 'Florence, Italy',
    image: '👨‍🍳',
    rating: 4.8,
    reviews: 2156,
    pricePerPerson: 149,
    originalPrice: 199,
    valueScore: calculateValueScore({
      price: 149,
      marketAvgPrice: 199,
      rating: 4.8,
      reviewCount: 2156,
      demandLevel: 85,
      availabilityLevel: 30
    }),
    duration: '4 hours',
    category: 'Culinary',
    badges: ['Top Rated', 'Small Group'],
    demandLevel: 85,
    groupSize: 10,
    highlights: ['Fresh pasta making', 'Wine pairing', 'Market visit'],
  },
  {
    id: '3',
    title: 'Hot Air Balloon Ride',
    destination: 'Cappadocia, Turkey',
    image: '🎈',
    rating: 4.9,
    reviews: 5432,
    pricePerPerson: 249,
    originalPrice: 349,
    valueScore: calculateValueScore({
      price: 249,
      marketAvgPrice: 349,
      rating: 4.9,
      reviewCount: 5432,
      demandLevel: 98,
      availabilityLevel: 10
    }),
    duration: '3 hours',
    category: 'Adventure',
    badges: ['Bucket List', 'Sunrise Flight'],
    trending: true,
    demandLevel: 98,
    groupSize: 16,
    highlights: ['Sunrise views', 'Champagne toast', 'Photo package'],
  },
  {
    id: '4',
    title: 'Spa & Wellness Retreat',
    destination: 'Bali, Indonesia',
    image: '💆',
    rating: 4.7,
    reviews: 1823,
    pricePerPerson: 79,
    originalPrice: 119,
    valueScore: calculateValueScore({
      price: 79,
      marketAvgPrice: 119,
      rating: 4.7,
      reviewCount: 1823,
      demandLevel: 78,
      availabilityLevel: 45
    }),
    duration: '3 hours',
    category: 'Wellness',
    badges: ['Relaxation', 'Traditional'],
    demandLevel: 78,
    groupSize: 6,
    highlights: ['Balinese massage', 'Flower bath', 'Herbal tea'],
  }
];

export function ActivitiesSection({ lang = 'en' }: ActivitiesSectionProps) {
  const t = translations[lang];
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-4 px-4 md:px-0">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          {t.title}
        </h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredActivities.map((activity) => (
          <div
            key={activity.id}
            className={`
              flex flex-col
              bg-white rounded-lg border-2 border-gray-200
              hover:border-purple-400 hover:shadow-lg
              transition-all duration-200 overflow-hidden
              ${hoveredId === activity.id ? 'scale-[1.02]' : ''}
            `}
            onMouseEnter={() => setHoveredId(activity.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Activity Image */}
            <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <span className="text-6xl">{activity.image}</span>

              {/* Value Score Badge */}
              <div className="absolute top-2 right-2">
                <ValueScoreBadge score={activity.valueScore} size="sm" showLabel={false} />
              </div>

              {/* Trending Badge */}
              {activity.trending && (
                <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Trending
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {activity.category}
              </div>
            </div>

            {/* Activity Details */}
            <div className="p-2.5 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 text-base mb-0.5 line-clamp-2">{activity.title}</h3>
              <p className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {activity.destination}
              </p>

              {/* Rating + Reviews + Badges */}
              <div className="h-[52px] mb-1.5 overflow-hidden">
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <div className="flex items-center gap-1 bg-purple-600 text-white px-2 py-0.5 rounded font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {activity.rating}
                  </div>
                  <span className="text-xs text-gray-600">({activity.reviews.toLocaleString()})</span>
                  {activity.badges.slice(0, 2).map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-1.5 py-0.5 bg-purple-100 border border-purple-300 text-purple-700 rounded text-[10px] font-bold"
                    >
                      {badge}
                    </span>
                  ))}
                  {activity.demandLevel && activity.demandLevel > 90 && (
                    <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                      <TrendingUp className="w-2.5 h-2.5" />
                      High
                    </span>
                  )}
                </div>
              </div>

              {/* Duration + Group Size */}
              <div className="flex items-center gap-2 mb-1.5 text-[10px] text-gray-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{activity.duration}</span>
                </div>
                {activity.groupSize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Max {activity.groupSize}</span>
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div className="mb-1.5">
                <div className="flex flex-wrap gap-1">
                  {activity.highlights.slice(0, 3).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Section */}
              <div className="mt-auto border-t border-gray-200 pt-2">
                <div className="flex items-end justify-between">
                  <div>
                    {activity.originalPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        ${activity.originalPrice}
                      </div>
                    )}
                    <div className="text-lg font-bold text-purple-600">
                      ${activity.pricePerPerson}
                    </div>
                    <div className="text-xs text-gray-600">{t.perPerson}</div>
                  </div>
                  <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
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
        <button
          onClick={() => router.push('/activities')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 font-bold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          {t.viewAll}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
