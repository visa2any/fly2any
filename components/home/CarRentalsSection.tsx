'use client';

import { useState } from 'react';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { Car, Users, Briefcase, Zap, Fuel, Settings, MapPin, Shield, TrendingUp } from 'lucide-react';

interface CarRental {
  id: string;
  type: string;
  model: string;
  company: string;
  image: string;
  pricePerDay: number;
  originalPrice?: number;
  valueScore: number;
  rating: number;
  reviews: number;
  specs: {
    seats: number;
    bags: number;
    transmission: string;
    fuel: string;
  };
  badges: string[];
  demandLevel?: number;
  availability?: number;
  location: string;
  freeDelivery?: boolean;
  trending?: boolean;
}

interface CarRentalsSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: 'Featured Car Rentals',
    subtitle: 'Smart recommendations based on value, availability, and customer ratings',
    viewAll: 'View All Cars',
    perDay: 'per day',
    reviews: 'reviews',
    bookNow: 'Book Now',
    seats: 'Seats',
    bags: 'Bags',
    automatic: 'Automatic',
    manual: 'Manual',
    unlimited: 'Unlimited mileage',
    freeDelivery: 'Free Delivery',
    highDemand: 'High demand',
    carsAvailable: 'cars available',
  },
  pt: {
    title: 'Aluguel de Carros em Destaque',
    subtitle: 'Recomendações inteligentes baseadas em valor, disponibilidade e avaliações',
    viewAll: 'Ver Todos os Carros',
    perDay: 'por dia',
    reviews: 'avaliações',
    bookNow: 'Reservar Agora',
    seats: 'Assentos',
    bags: 'Malas',
    automatic: 'Automático',
    manual: 'Manual',
    unlimited: 'Km ilimitado',
    freeDelivery: 'Entrega Grátis',
    highDemand: 'Alta demanda',
    carsAvailable: 'carros disponíveis',
  },
  es: {
    title: 'Alquiler de Autos Destacados',
    subtitle: 'Recomendaciones inteligentes basadas en valor, disponibilidad y calificaciones',
    viewAll: 'Ver Todos los Autos',
    perDay: 'por día',
    reviews: 'reseñas',
    bookNow: 'Reservar Ahora',
    seats: 'Asientos',
    bags: 'Maletas',
    automatic: 'Automático',
    manual: 'Manual',
    unlimited: 'Km ilimitado',
    freeDelivery: 'Entrega Gratis',
    highDemand: 'Alta demanda',
    carsAvailable: 'autos disponibles',
  },
};

// Sample car rental data with ML scoring
const featuredCars: CarRental[] = [
  {
    id: '1',
    type: 'Economy',
    model: 'Toyota Corolla',
    company: 'Enterprise',
    image: '🚗',
    pricePerDay: 45,
    originalPrice: 79,
    valueScore: calculateValueScore({
      price: 45,
      marketAvgPrice: 79,
      rating: 4.6,
      reviewCount: 3421,
      demandLevel: 78,
      availabilityLevel: 55
    }),
    rating: 4.6,
    reviews: 3421,
    specs: {
      seats: 5,
      bags: 2,
      transmission: 'automatic',
      fuel: 'Hybrid'
    },
    badges: ['Best Value', 'Eco-Friendly'],
    demandLevel: 78,
    availability: 12,
    location: 'LAX Airport',
    freeDelivery: true
  },
  {
    id: '2',
    type: 'SUV',
    model: 'Jeep Grand Cherokee',
    company: 'Hertz',
    image: '🚙',
    pricePerDay: 89,
    originalPrice: 149,
    valueScore: calculateValueScore({
      price: 89,
      marketAvgPrice: 149,
      rating: 4.8,
      reviewCount: 2156,
      demandLevel: 92,
      availabilityLevel: 20
    }),
    rating: 4.8,
    reviews: 2156,
    specs: {
      seats: 7,
      bags: 4,
      transmission: 'automatic',
      fuel: 'Premium'
    },
    badges: ['Family Favorite', 'Limited Stock'],
    demandLevel: 92,
    availability: 3,
    location: 'Miami Airport',
    trending: true
  },
  {
    id: '3',
    type: 'Luxury',
    model: 'BMW 5 Series',
    company: 'Sixt',
    image: '🚘',
    pricePerDay: 129,
    originalPrice: 219,
    valueScore: calculateValueScore({
      price: 129,
      marketAvgPrice: 219,
      rating: 4.9,
      reviewCount: 987,
      demandLevel: 85,
      availabilityLevel: 30
    }),
    rating: 4.9,
    reviews: 987,
    specs: {
      seats: 5,
      bags: 3,
      transmission: 'automatic',
      fuel: 'Premium'
    },
    badges: ['Luxury Deal', 'Top Rated'],
    demandLevel: 85,
    availability: 5,
    location: 'JFK Airport',
    freeDelivery: true,
    trending: true
  },
  {
    id: '4',
    type: 'Compact',
    model: 'Honda Civic',
    company: 'Budget',
    image: '🚗',
    pricePerDay: 39,
    originalPrice: 65,
    valueScore: calculateValueScore({
      price: 39,
      marketAvgPrice: 65,
      rating: 4.5,
      reviewCount: 4532,
      demandLevel: 72,
      availabilityLevel: 70
    }),
    rating: 4.5,
    reviews: 4532,
    specs: {
      seats: 5,
      bags: 2,
      transmission: 'automatic',
      fuel: 'Regular'
    },
    badges: ['Best Price', 'Most Popular'],
    demandLevel: 72,
    availability: 18,
    location: 'Downtown Miami'
  }
];

export function CarRentalsSection({ lang = 'en' }: CarRentalsSectionProps) {
  const t = translations[lang];
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-8" style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredCars.map((car) => (
          <div
            key={car.id}
            className={`
              bg-white rounded-lg border-2 border-gray-200
              hover:border-primary-400 hover:shadow-lg
              transition-all duration-200 overflow-hidden
              ${hoveredId === car.id ? 'scale-[1.02]' : ''}
            `}
            onMouseEnter={() => setHoveredId(car.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Car Image */}
            <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl">{car.image}</span>

              {/* Value Score Badge - Top Right */}
              <div className="absolute top-2 right-2">
                <ValueScoreBadge score={car.valueScore} size="sm" showLabel={false} />
              </div>

              {/* Trending Badge - Top Left */}
              {car.trending && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </div>
              )}

              {/* Free Delivery Badge - Bottom */}
              {car.freeDelivery && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {t.freeDelivery}
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="p-4">
              {/* Type and Model */}
              <div className="text-xs text-gray-500 mb-1">{car.type}</div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{car.model}</h3>
              <p className="text-sm text-gray-600 mb-3">{car.company}</p>

              {/* Rating and Location */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-sm">
                  <div className="flex items-center gap-1 bg-primary-600 text-white px-2 py-0.5 rounded font-bold text-xs">
                    ⭐ {car.rating}
                  </div>
                  <span className="text-xs text-gray-600">({car.reviews.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{car.location}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1 text-gray-700">
                  <Users className="w-3 h-3" />
                  <span>{car.specs.seats} {t.seats}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Briefcase className="w-3 h-3" />
                  <span>{car.specs.bags} {t.bags}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Settings className="w-3 h-3" />
                  <span className="line-clamp-1">{car.specs.transmission === 'automatic' ? t.automatic : t.manual}</span>
                </div>
              </div>

              {/* Fuel Type */}
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                <Fuel className="w-3 h-3" />
                <span>{car.specs.fuel}</span>
                {car.specs.fuel === 'Hybrid' && <Zap className="w-3 h-3 text-green-600" />}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {car.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-semibold"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Demand Indicator */}
              {car.demandLevel && car.demandLevel > 80 && (
                <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-semibold">{t.highDemand}</span>
                </div>
              )}

              {/* Low Availability Warning */}
              {car.availability && car.availability <= 5 && (
                <div className="flex items-center gap-1 text-xs text-red-600 mb-3 font-semibold">
                  ⚠️ Only {car.availability} {t.carsAvailable}
                </div>
              )}

              {/* Price Section */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-end justify-between">
                  <div>
                    {car.originalPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        ${car.originalPrice}
                      </div>
                    )}
                    <div className="text-xl font-bold text-primary-600">
                      ${car.pricePerDay}
                    </div>
                    <div className="text-xs text-gray-600">{t.perDay}</div>
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
