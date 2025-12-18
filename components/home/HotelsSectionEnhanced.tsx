'use client';

import { useState, useEffect, useCallback, memo } from 'react';
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

// Memoized hotel card component for performance
const HotelCard = memo(({
  hotel,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  t
}: {
  hotel: HotelEnhanced;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  t: any;
}) => (
  <div
    onClick={onClick}
    className={`
      bg-white rounded-xl lg:rounded-2xl border-2 border-gray-200
      hover:border-primary-400
      transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden cursor-pointer
      shadow-sm hover:shadow-xl
      ${isHovered ? 'scale-[1.02] lg:scale-[1.03] shadow-xl lg:shadow-2xl -translate-y-1 lg:-translate-y-2' : ''}
    `}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {/* Hotel Photo - Level-6: Responsive height */}
    <div className="relative h-36 lg:h-44 overflow-hidden bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100">
      {/* Fallback Background - Always present */}
      <div className="absolute inset-0 flex items-center justify-center z-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <span className="text-5xl block mb-1">🏨</span>
          <span className="text-xs text-gray-500 font-medium">{hotel.city}</span>
        </div>
      </div>
      {/* Hotel Image - Show if mainImage exists OR use city-based Unsplash fallback */}
      <img
        src={hotel.mainImage || `https://source.unsplash.com/600x400/?hotel,${encodeURIComponent(hotel.city)}`}
        alt={hotel.name}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110 z-10"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Try a generic hotel image on first error
          if (!target.dataset.fallbackAttempted) {
            target.dataset.fallbackAttempted = 'true';
            target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80`;
          } else {
            // Hide image completely on second error - show fallback
            target.style.display = 'none';
            const overlay = target.nextElementSibling as HTMLElement;
            if (overlay) overlay.style.display = 'none';
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>

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

    {/* Hotel Details - Level-6: Generous padding on desktop */}
    <div className="p-3 lg:p-4">
      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
        <MapPin className="w-3 h-3" />
        <span>{hotel.city}, {hotel.country}</span>
      </div>

      {/* Hotel Name - SINGLE LINE */}
      <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
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

      {/* Social Proof - COMPACT ONE LINE */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap text-[10px]">
        {hotel.viewersLast24h > 100 && (
          <span className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
            <Eye className="w-2.5 h-2.5" />
            {hotel.viewersLast24h}
          </span>
        )}
        {hotel.bookingsLast24h > 10 && (
          <span className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
            <ShoppingCart className="w-2.5 h-2.5" />
            {hotel.bookingsLast24h}
          </span>
        )}
        {hotel.demandLevel > 85 && (
          <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
            <Flame className="w-2.5 h-2.5" />
            High
          </span>
        )}
        {hotel.availableRooms <= 5 && (
          <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
            <Clock className="w-2.5 h-2.5" />
            {hotel.availableRooms} left
          </span>
        )}
      </div>

      {/* Amenities Preview - COMPACT */}
      <div className="flex items-center gap-2 mb-2">
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

      {/* Price Section - COMPACT WITH INLINE SAVINGS */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="text-2xl font-bold text-primary-600">${hotel.pricePerNight.toFixed(0)}</span>
            {hotel.originalPrice && hotel.originalPrice > hotel.pricePerNight && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  ${hotel.originalPrice.toFixed(0)}
                </span>
                <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  💚 {Math.round(((hotel.originalPrice - hotel.pricePerNight) / hotel.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          <div className="text-[10px] text-gray-500">{t.perNight}</div>
        </div>
        <button className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1">
          <span>{t.bookNow}</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
));

HotelCard.displayName = 'HotelCard';

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

  // Memoize click handler with default search context
  const handleHotelClick = useCallback((hotelId: string, hotel?: any) => {
    // Default dates: 2 weeks from now, 3-night stay
    const checkIn = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const adults = 2;

    // Build URL with search context
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: '0',
    });

    // Add rate ID if available from hotel data
    if (hotel?.rates?.[0]?.id) {
      params.set('rateId', hotel.rates[0].id);
    }

    window.open(`/hotels/${hotelId}?${params.toString()}`, '_blank');
  }, []);

  return (
    <section className="py-2 md:py-6 lg:py-10" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Section Header - Level-6: Mobile compact, Desktop cinematic */}
      <div className="flex items-center justify-between mb-2 md:mb-4 lg:mb-6 px-3 md:px-0">
        <div>
          <h2 className="text-sm md:text-[26px] lg:text-[32px] font-bold text-neutral-800 tracking-[0.01em] mb-0.5">{t.title}</h2>
          <p className="text-xs md:text-sm lg:text-base text-neutral-500">{t.subtitle}</p>
        </div>
        <button
          onClick={() => window.open('/hotels', '_blank')}
          className="text-xs md:text-sm lg:text-base font-semibold text-primary-600 hover:text-primary-700 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] whitespace-nowrap hover:-translate-y-0.5"
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider - Level-6: Clean separator */}
      <div className="h-px bg-neutral-200 mb-2 md:mb-4 lg:mb-6 mx-3 md:mx-0"></div>

      {/* Filter Buttons - Edge-to-edge scroll on mobile, centered on desktop */}
      <div className="flex gap-1.5 md:gap-2 lg:gap-3 mb-3 md:mb-6 lg:mb-8 overflow-x-auto scrollbar-hide pb-1 px-3 md:px-0">
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
            className={`px-2.5 md:px-4 py-1 md:py-2 rounded-full font-bold text-[10px] md:text-sm transition-all border-2 flex-shrink-0 whitespace-nowrap ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-400 hover:bg-primary-50'
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

      {/* Hotels Grid - Level-6: Premium card grid with proper spacing */}
      {!loading && hotels.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-4 lg:mb-6 px-3 md:px-0">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isHovered={hoveredId === hotel.id}
                onMouseEnter={() => setHoveredId(hotel.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleHotelClick(hotel.id, hotel)}
                t={t}
              />
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

// Default export for better compatibility
export default HotelsSectionEnhanced;
