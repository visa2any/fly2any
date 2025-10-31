'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { MapPin, Star, Users, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, TrendingUp, TrendingDown, Flame } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  image: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  originalPrice?: number;
  amenities: string[];
  valueScore: number;
  badges: string[];
  trending?: boolean;
  demandLevel?: number;
  availableRooms?: number;
  distanceFromCenter?: string;
}

interface HotelsSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: 'Featured Hotels',
    subtitle: 'AI-powered recommendations based on value, ratings, and availability',
    viewAll: 'View All Hotels',
    perNight: 'per night',
    reviews: 'reviews',
    bookNow: 'Book Now',
    fromCenter: 'from center',
    roomsLeft: 'rooms left',
    peopleViewing: 'people viewing',
    amenities: 'Amenities',
    trendingUp: 'Price Rising',
    trendingDown: 'Price Dropping',
  },
  pt: {
    title: 'Hotéis em Destaque',
    subtitle: 'Recomendações IA baseadas em valor, avaliações e disponibilidade',
    viewAll: 'Ver Todos os Hotéis',
    perNight: 'por noite',
    reviews: 'avaliações',
    bookNow: 'Reservar Agora',
    fromCenter: 'do centro',
    roomsLeft: 'quartos restantes',
    peopleViewing: 'pessoas visualizando',
    amenities: 'Comodidades',
    trendingUp: 'Preço Subindo',
    trendingDown: 'Preço Caindo',
  },
  es: {
    title: 'Hoteles Destacados',
    subtitle: 'Recomendaciones IA basadas en valor, calificaciones y disponibilidad',
    viewAll: 'Ver Todos los Hoteles',
    perNight: 'por noche',
    reviews: 'reseñas',
    bookNow: 'Reservar Ahora',
    fromCenter: 'del centro',
    roomsLeft: 'habitaciones restantes',
    peopleViewing: 'personas viendo',
    amenities: 'Servicios',
    trendingUp: 'Precio Subiendo',
    trendingDown: 'Precio Bajando',
  },
};

// Sample hotel data with ML scoring
const featuredHotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    location: 'Times Square',
    city: 'New York',
    image: '🏨',
    rating: 4.7,
    reviews: 2847,
    pricePerNight: 189,
    originalPrice: 299,
    amenities: ['wifi', 'gym', 'restaurant', 'parking'],
    valueScore: calculateValueScore({
      price: 189,
      marketAvgPrice: 299,
      rating: 4.7,
      reviewCount: 2847,
      demandLevel: 85,
      availabilityLevel: 25
    }),
    badges: ['Best Seller', 'Free Cancellation'],
    trending: true,
    demandLevel: 85,
    availableRooms: 3,
    distanceFromCenter: '0.5 mi'
  },
  {
    id: '2',
    name: 'Seaside Resort & Spa',
    location: 'South Beach',
    city: 'Miami',
    image: '🏖️',
    rating: 4.9,
    reviews: 1923,
    pricePerNight: 249,
    originalPrice: 399,
    amenities: ['wifi', 'gym', 'restaurant', 'coffee'],
    valueScore: calculateValueScore({
      price: 249,
      marketAvgPrice: 399,
      rating: 4.9,
      reviewCount: 1923,
      demandLevel: 92,
      availabilityLevel: 15
    }),
    badges: ['Top Rated', 'Limited Availability'],
    trending: true,
    demandLevel: 92,
    availableRooms: 2,
    distanceFromCenter: '0.2 mi'
  },
  {
    id: '3',
    name: 'Downtown Business Hotel',
    location: 'Financial District',
    city: 'San Francisco',
    image: '🏢',
    rating: 4.5,
    reviews: 1456,
    pricePerNight: 159,
    originalPrice: 229,
    amenities: ['wifi', 'gym', 'parking', 'restaurant'],
    valueScore: calculateValueScore({
      price: 159,
      marketAvgPrice: 229,
      rating: 4.5,
      reviewCount: 1456,
      demandLevel: 68,
      availabilityLevel: 45
    }),
    badges: ['Price Drop', 'Free Breakfast'],
    demandLevel: 68,
    availableRooms: 8,
    distanceFromCenter: '0.3 mi'
  },
  {
    id: '4',
    name: 'Airport Comfort Inn',
    location: 'Near LAX',
    city: 'Los Angeles',
    image: '✈️',
    rating: 4.3,
    reviews: 987,
    pricePerNight: 119,
    originalPrice: 179,
    amenities: ['wifi', 'parking', 'restaurant', 'gym'],
    valueScore: calculateValueScore({
      price: 119,
      marketAvgPrice: 179,
      rating: 4.3,
      reviewCount: 987,
      demandLevel: 72,
      availabilityLevel: 60
    }),
    badges: ['Free Shuttle', 'Best Price'],
    demandLevel: 72,
    availableRooms: 12,
    distanceFromCenter: '12 mi'
  }
];

// Amenity icon mapping
const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
  coffee: <Coffee className="w-4 h-4" />,
};

export function HotelsSection({ lang = 'en' }: HotelsSectionProps) {
  const t = translations[lang];
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>(featuredHotels);
  const [loading, setLoading] = useState(true);

  // Fetch real hotel data from Duffel API
  useEffect(() => {
    const fetchFeaturedHotels = async () => {
      try {
        const response = await fetch('/api/hotels/featured');
        if (response.ok) {
          const data = await response.json();

          // Transform Duffel data to our Hotel interface
          if (data.data && data.data.length > 0) {
            const transformedHotels: Hotel[] = data.data.map((hotel: any) => {
              const lowestRate = hotel.lowestRate || (hotel.rates && hotel.rates[0]);
              const price = lowestRate ? parseFloat(lowestRate.totalPrice.amount) : 0;
              const originalPrice = price > 0 ? Math.round(price * 1.5) : undefined;

              return {
                id: hotel.id,
                name: hotel.name,
                location: hotel.address?.city || hotel.city || 'City Center',
                city: hotel.city || data.meta?.city || 'Unknown',
                image: hotel.images && hotel.images.length > 0 ? hotel.images[0].url : '🏨',
                rating: hotel.starRating || hotel.reviewRating || 4.5,
                reviews: hotel.reviewCount || 1000,
                pricePerNight: Math.round(price),
                originalPrice,
                amenities: hotel.amenities?.slice(0, 4) || ['wifi', 'gym', 'restaurant', 'parking'],
                valueScore: hotel.valueScore || 75,
                badges: lowestRate?.refundable ? ['Free Cancellation'] : [],
                distanceFromCenter: hotel.distanceKm ? `${hotel.distanceKm.toFixed(1)} km` : '0.5 mi',
                demandLevel: 75,
                availableRooms: lowestRate?.roomsLeft || 5,
              };
            });

            setHotels(transformedHotels);
          }
        }
      } catch (error) {
        console.error('Error fetching featured hotels:', error);
        // Keep fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHotels();
  }, []);

  const handleHotelClick = (hotelId: string) => {
    router.push(`/hotels/${hotelId}`);
  };

  return (
    <section className="py-8" style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            onClick={() => handleHotelClick(hotel.id)}
            className={`
              bg-white rounded-lg border-2 border-gray-200
              hover:border-primary-400 hover:shadow-lg
              transition-all duration-200 overflow-hidden cursor-pointer
              ${hoveredId === hotel.id ? 'scale-[1.02]' : ''}
            `}
            onMouseEnter={() => setHoveredId(hotel.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Hotel Image */}
            <div className="relative h-40 overflow-hidden">
              {hotel.image && hotel.image.startsWith('http') ? (
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-6xl">{hotel.image}</span>
                </div>
              )}

              {/* Value Score Badge - Top Right */}
              <div className="absolute top-2 right-2">
                <ValueScoreBadge score={hotel.valueScore} size="sm" showLabel={false} />
              </div>

              {/* Trending Badge - Top Left */}
              {hotel.trending && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Trending
                </div>
              )}

              {/* Distance from Center - Bottom */}
              {hotel.distanceFromCenter && (
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hotel.distanceFromCenter} {t.fromCenter}
                </div>
              )}
            </div>

            {/* Hotel Details */}
            <div className="p-4">
              {/* Name and Location */}
              <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{hotel.name}</h3>
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {hotel.location}, {hotel.city}
              </p>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-primary-600 text-white px-2 py-0.5 rounded font-bold text-sm">
                  <Star className="w-3 h-3 fill-current" />
                  {hotel.rating}
                </div>
                <span className="text-xs text-gray-600">
                  {hotel.reviews.toLocaleString()} {t.reviews}
                </span>
              </div>

              {/* Amenities */}
              <div className="flex items-center gap-2 mb-3">
                {hotel.amenities.slice(0, 4).map((amenity) => (
                  <div
                    key={amenity}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                    title={amenity}
                  >
                    {amenityIcons[amenity]}
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {hotel.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-semibold"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Demand Indicator */}
              {hotel.demandLevel && hotel.demandLevel > 70 && (
                <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                  <Users className="w-3 h-3" />
                  <span className="font-semibold">{hotel.demandLevel} {t.peopleViewing}</span>
                </div>
              )}

              {/* Low Availability Warning */}
              {hotel.availableRooms && hotel.availableRooms <= 5 && (
                <div className="flex items-center gap-1 text-xs text-red-600 mb-3 font-semibold">
                  ⚠️ Only {hotel.availableRooms} {t.roomsLeft}
                </div>
              )}

              {/* Price Section */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-end justify-between">
                  <div>
                    {hotel.originalPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        ${hotel.originalPrice}
                      </div>
                    )}
                    <div className="text-xl font-bold text-primary-600">
                      ${hotel.pricePerNight}
                    </div>
                    <div className="text-xs text-gray-600">{t.perNight}</div>
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
