'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { MapPin, Star, Users, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, TrendingUp, TrendingDown, Flame, Eye, ShoppingCart, Clock, Zap } from 'lucide-react';

interface HotelEnhanced {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  category: string[];

  // Pricing
  pricePerNight: number;
  originalPrice?: number;
  lowestRate?: any;

  // ML Features
  valueScore: number;

  // Marketing Signals
  demandLevel: number;
  availableRooms: number;
  trending: boolean;
  priceDropRecent: boolean;

  // Social Proof
  viewersLast24h: number;
  bookingsLast24h: number;

  // Hotel Data
  mainImage: string | null;
  images: any[];
  starRating?: number;
  reviewRating?: number;
  reviewCount: number;
  amenities: string[];
  address?: any;
  location?: any;
}

interface HotelsSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🏨 Featured Hotels Worldwide',
    subtitle: 'AI-curated accommodations with best value, real photos, and instant booking',
    viewAll: 'View All Hotels',
    perNight: 'per night',
    reviews: 'reviews',
    bookNow: 'Book Now',
    americas: '🌎 Americas',
    europe: '🌍 Europe',
    asiaPacific: '🌏 Asia-Pacific',
    beach: '🌴 Beach Resorts',
    luxury: '⭐ Luxury',
    all: 'All Destinations',
    fromCenter: 'from center',
    roomsLeft: 'rooms left',
    peopleViewing: 'viewing now',
    bookings24h: 'bookings today',
    priceDrop: 'Price Drop!',
    trending: 'Trending',
    highDemand: 'High Demand',
    limitedAvailability: 'Limited Rooms',
    clickHint: '💡 Click any hotel for full details, photos & instant booking',
  },
  pt: {
    title: '🏨 Hotéis em Destaque no Mundo',
    subtitle: 'Acomodações selecionadas por IA com melhor valor, fotos reais e reserva instantânea',
    viewAll: 'Ver Todos os Hotéis',
    perNight: 'por noite',
    reviews: 'avaliações',
    bookNow: 'Reservar',
    americas: '🌎 Américas',
    europe: '🌍 Europa',
    asiaPacific: '🌏 Ásia-Pacífico',
    beach: '🌴 Resorts de Praia',
    luxury: '⭐ Luxo',
    all: 'Todos os Destinos',
    fromCenter: 'do centro',
    roomsLeft: 'quartos restantes',
    peopleViewing: 'visualizando agora',
    bookings24h: 'reservas hoje',
    priceDrop: 'Preço Caiu!',
    trending: 'Tendência',
    highDemand: 'Alta Demanda',
    limitedAvailability: 'Quartos Limitados',
    clickHint: '💡 Clique em qualquer hotel para detalhes completos, fotos e reserva instantânea',
  },
  es: {
    title: '🏨 Hoteles Destacados en el Mundo',
    subtitle: 'Alojamientos seleccionados por IA con mejor valor, fotos reales y reserva instantánea',
    viewAll: 'Ver Todos los Hoteles',
    perNight: 'por noche',
    reviews: 'reseñas',
    bookNow: 'Reservar',
    americas: '🌎 Américas',
    europe: '🌍 Europa',
    asiaPacific: '🌏 Asia-Pacífico',
    beach: '🌴 Resorts de Playa',
    luxury: '⭐ Lujo',
    all: 'Todos los Destinos',
    fromCenter: 'del centro',
    roomsLeft: 'habitaciones restantes',
    peopleViewing: 'viendo ahora',
    bookings24h: 'reservas hoy',
    priceDrop: '¡Precio Reducido!',
    trending: 'Tendencia',
    highDemand: 'Alta Demanda',
    limitedAvailability: 'Habitaciones Limitadas',
    clickHint: '💡 Haz clic en cualquier hotel para detalles completos, fotos y reserva instantánea',
  },
};

type FilterType = 'all' | 'americas' | 'europe' | 'asia-pacific' | 'beach' | 'luxury';

const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
  coffee: <Coffee className="w-4 h-4" />,
};

export function HotelsSectionEnhanced({ lang = 'en' }: HotelsSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hotels, setHotels] = useState<HotelEnhanced[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch hotels based on filter
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/hotels/featured-enhanced?continent=${activeFilter}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            setHotels(data.data);
          } else {
            setHotels([]);
          }
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [activeFilter]);

  const handleHotelClick = (hotelId: string) => {
    router.push(`/hotels/${hotelId}`);
  };

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
        <button
          onClick={() => router.push('/hotels/search')}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-gray-200 mb-4"></div>

      {/* Filter Buttons - Continental Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all' as FilterType, label: t.all },
          { key: 'americas' as FilterType, label: t.americas },
          { key: 'europe' as FilterType, label: t.europe },
          { key: 'asia-pacific' as FilterType, label: t.asiaPacific },
          { key: 'beach' as FilterType, label: t.beach },
          { key: 'luxury' as FilterType, label: t.luxury },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing hotels...</p>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      {!loading && hotels.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => handleHotelClick(hotel.id)}
                className={`
                  bg-white rounded-xl border-2 border-gray-200
                  hover:border-primary-400 hover:shadow-2xl
                  transition-all duration-300 ease-out overflow-hidden cursor-pointer
                  ${hoveredId === hotel.id ? 'scale-[1.03] shadow-2xl -translate-y-1' : ''}
                `}
                onMouseEnter={() => setHoveredId(hotel.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Hotel Photo */}
                <div className="relative h-44 overflow-hidden">
                  {hotel.mainImage ? (
                    <>
                      <img
                        src={hotel.mainImage}
                        alt={hotel.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100 flex items-center justify-center">
                      <span className="text-6xl">🏨</span>
                    </div>
                  )}

                  {/* Value Score Badge - Top Right */}
                  <div className="absolute top-2 right-2">
                    <ValueScoreBadge score={hotel.valueScore} size="sm" showLabel={false} />
                  </div>

                  {/* Trending/Price Drop Badge - Top Left */}
                  {hotel.priceDropRecent && (
                    <div className="absolute top-2 left-2 bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <TrendingDown className="w-3 h-3" />
                      {t.priceDrop}
                    </div>
                  )}
                  {hotel.trending && !hotel.priceDropRecent && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                      <Flame className="w-3 h-3" />
                      {t.trending}
                    </div>
                  )}

                  {/* Star Rating Badge - Bottom Left */}
                  {hotel.starRating && (
                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-900">{hotel.starRating}</span>
                    </div>
                  )}
                </div>

                {/* Hotel Details */}
                <div className="p-4">
                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{hotel.city}, {hotel.country}</span>
                  </div>

                  {/* Hotel Name */}
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 min-h-[2.5rem]">
                    {hotel.name}
                  </h3>

                  {/* Reviews */}
                  {hotel.reviewCount > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 bg-primary-600 text-white px-2 py-0.5 rounded font-bold text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        {hotel.reviewRating?.toFixed(1) || hotel.starRating || '4.5'}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({hotel.reviewCount.toLocaleString()} {t.reviews})
                      </span>
                    </div>
                  )}

                  {/* Social Proof Indicators */}
                  <div className="space-y-2 mb-3">
                    {/* Viewers - Only show if very high (100+) */}
                    {hotel.viewersLast24h > 100 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold bg-gray-100 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" />
                        <span>{hotel.viewersLast24h} {t.peopleViewing}</span>
                      </div>
                    )}

                    {/* Bookings Today - Only show if significant (10+) */}
                    {hotel.bookingsLast24h > 10 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold bg-gray-100 px-2 py-1 rounded">
                        <ShoppingCart className="w-3 h-3" />
                        <span>{hotel.bookingsLast24h} {t.bookings24h}</span>
                      </div>
                    )}

                    {/* High Demand Warning */}
                    {hotel.demandLevel > 85 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded">
                        <Flame className="w-3 h-3" />
                        <span>{t.highDemand}</span>
                      </div>
                    )}

                    {/* Limited Availability */}
                    {hotel.availableRooms <= 5 && (
                      <div className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>⚠️ {hotel.availableRooms} {t.roomsLeft}</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities Preview */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                    {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                      <div
                        key={idx}
                        className="text-gray-600 hover:text-primary-600 transition-colors"
                        title={amenity}
                      >
                        {amenityIcons[amenity] || <Zap className="w-4 h-4" />}
                      </div>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="text-xs text-gray-500">+{hotel.amenities.length - 4}</span>
                    )}
                  </div>

                  {/* You Save Indicator */}
                  {hotel.originalPrice && hotel.originalPrice > hotel.pricePerNight && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-500 rounded-lg shadow-sm">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <div className="text-sm">
                        <span className="font-bold text-green-700">
                          You Save ${(hotel.originalPrice - hotel.pricePerNight).toFixed(2)}
                        </span>
                        <span className="text-green-600 ml-1">
                          ({Math.round(((hotel.originalPrice - hotel.pricePerNight) / hotel.originalPrice) * 100)}% off)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price Section */}
                  <div className="flex items-end justify-between">
                    <div>
                      {hotel.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">
                          ${hotel.originalPrice.toFixed(2)}
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-primary-600">${hotel.pricePerNight.toFixed(0)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{t.perNight}</div>
                    </div>
                    <button className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                      {t.bookNow}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Click Hint */}
          <div className="text-center text-sm text-gray-600 mt-4">
            {t.clickHint}
          </div>
        </>
      )}

      {/* No Results */}
      {!loading && hotels.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg mb-4">
            No hotels found for this filter. Try a different continent!
          </p>
          <button
            onClick={() => setActiveFilter('all')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Show All Hotels
          </button>
        </div>
      )}
    </section>
  );
}
