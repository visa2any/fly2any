'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { TrendingUp, TrendingDown, Users, Flame, Sparkles, Eye, ShoppingCart, AlertCircle, Loader2, ArrowRight, Plane, Heart, MapPin, Calendar } from 'lucide-react';
import { AIRLINE_DATABASE } from '@/lib/flights/airline-data';
import { useFavorites, saveToRecentlyViewed } from '@/lib/hooks/useFavorites';
import { useClientCache } from '@/lib/hooks/useClientCache';
import { CacheIndicator } from '@/components/cache/CacheIndicator';

interface DestinationData {
  id: string;
  from: string;
  to: string;
  city: string;
  country: string;
  continent: 'americas' | 'south-america' | 'europe' | 'asia-pacific' | 'caribbean' | 'beach';
  price: number;
  originalPrice?: number;
  valueScore: number;
  carrier?: string;
  carrierName?: string;
  departureDate: string;
  returnDate?: string;
  trending: boolean;
  priceDropRecent: boolean;
  demandLevel: number;
  seatsAvailable: number;
  viewersLast24h: number;
  bookingsLast24h: number;
  badges: string[];
}

interface DestinationsSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🌍 Explore Destinations Flights by Continent',
    viewAll: 'View All',
    from: 'from',
    priceStartsFrom: 'Price Starts from',
    americas: '🌎 North America',
    southAmerica: '🌎 South America',
    europe: '🌍 Europe',
    asiaPacific: '🌏 Asia-Pacific',
    caribbean: '🏝️ Caribbean',
    beach: '🌴 Beach',
    all: 'All',
    viewing: 'viewing',
    bookings: 'bookings',
    seatsLeft: 'seats left',
    trending: 'Trending',
    priceDrop: 'Price Drop',
    highDemand: 'High Demand',
    clickHint: '💡 Click any destination to auto-fill search form with best dates',
    loading: 'Loading destinations...',
    noResults: 'No destinations found for this filter',
    error: 'Failed to load destinations',
  },
  pt: {
    title: '🌍 Explorar Destinos de Voos por Continente',
    viewAll: 'Ver Todos',
    from: 'de',
    priceStartsFrom: 'Preço começa em',
    americas: '🌎 América do Norte',
    southAmerica: '🌎 América do Sul',
    europe: '🌍 Europa',
    asiaPacific: '🌏 Ásia-Pacífico',
    caribbean: '🏝️ Caribe',
    beach: '🌴 Praia',
    all: 'Todos',
    viewing: 'visualizando',
    bookings: 'reservas',
    seatsLeft: 'assentos restantes',
    trending: 'Tendência',
    priceDrop: 'Preço Caiu',
    highDemand: 'Alta Demanda',
    clickHint: '💡 Clique em qualquer destino para preencher automaticamente o formulário com as melhores datas',
    loading: 'Carregando destinos...',
    noResults: 'Nenhum destino encontrado para este filtro',
    error: 'Falha ao carregar destinos',
  },
  es: {
    title: '🌍 Explorar Destinos de Vuelos por Continente',
    viewAll: 'Ver Todos',
    from: 'de',
    priceStartsFrom: 'Precio desde',
    americas: '🌎 América del Norte',
    southAmerica: '🌎 América del Sur',
    europe: '🌍 Europa',
    asiaPacific: '🌏 Asia-Pacífico',
    caribbean: '🏝️ Caribe',
    beach: '🌴 Playa',
    all: 'Todos',
    viewing: 'viendo',
    bookings: 'reservas',
    seatsLeft: 'asientos restantes',
    trending: 'Tendencia',
    priceDrop: 'Precio Bajó',
    highDemand: 'Alta Demanda',
    clickHint: '💡 Haz clic en cualquier destino para completar automáticamente el formulario con las mejores fechas',
    loading: 'Cargando destinos...',
    noResults: 'No se encontraron destinos para este filtro',
    error: 'Error al cargar destinos',
  },
};

// Destination images - Curated iconic landmarks for each city
// Using entropy cropping for intelligent focal points
const DESTINATION_IMAGES: Record<string, string> = {
  // North Americas - Iconic landmarks fully visible
  'LAX': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=600&fit=crop&crop=entropy&v=5', // LA - Hollywood sign
  'MIA': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop&crop=entropy&v=5', // Miami - Beach hotels
  'JFK': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&crop=entropy&v=5', // NYC - Brooklyn Bridge
  'YYZ': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop&crop=entropy&v=5', // Toronto - CN Tower
  'MEX': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&h=600&fit=crop&crop=entropy&v=5', // Mexico City - Angel de la Independencia
  'SFO': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&crop=entropy&v=5', // SF - Golden Gate

  // South America - Iconic city landmarks
  'GRU': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop&crop=entropy&v=5', // São Paulo - Skyline at sunset
  'EZE': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=600&fit=crop&crop=entropy&v=5', // Buenos Aires - Obelisco
  'LIM': 'https://images.unsplash.com/photo-1531968455001-5705f6c778d3?w=800&h=600&fit=crop&crop=entropy&v=5', // Lima - Plaza de Armas historic center
  'BOG': 'https://images.unsplash.com/photo-1536702456330-f8bcd58c0e2a?w=800&h=600&fit=crop&crop=entropy&v=5', // Bogotá - Monserrate view with city skyline

  // Europe - Famous landmarks centered and fully visible
  'LHR': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&crop=entropy&v=5', // London - Big Ben
  'CDG': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop&crop=entropy&v=5', // Paris - Eiffel Tower at golden hour
  'FCO': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop&crop=entropy&v=5', // Rome - Colosseum
  'BCN': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop&crop=entropy&v=5', // Barcelona - Sagrada
  'AMS': 'https://images.unsplash.com/photo-1459679749680-18eb1eb37418?w=800&h=600&fit=crop&crop=entropy&v=5', // Amsterdam - Canals
  'MAD': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop&crop=entropy&v=5', // Madrid - Gran Via

  // Asia-Pacific - Recognizable city landmarks
  'NRT': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&crop=entropy&v=5', // Tokyo - Cityscape
  'SIN': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&crop=entropy&v=5', // Singapore - Marina Bay Sands
  'HKG': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop&crop=entropy&v=5', // Hong Kong - Skyline
  'SYD': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop&crop=entropy&v=5', // Sydney - Opera House
  'DPS': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&crop=entropy&v=5', // Bali - Beach

  // Caribbean - Tropical beaches and crystal waters
  'CUN': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop&crop=entropy&v=5', // Cancún - Beach
  'PUJ': 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=600&fit=crop&crop=entropy&v=5', // Punta Cana - Beach resort
  'MBJ': 'https://images.unsplash.com/photo-1568214379698-cca9cd2c6e16?w=800&h=600&fit=crop&crop=entropy&v=5', // Montego Bay - Beach
  'NAS': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop&crop=entropy&v=5', // Nassau - Bahamas beach
  'AUA': 'https://images.unsplash.com/photo-1595776613215-fe04b78de7d0?w=800&h=600&fit=crop&crop=entropy&v=5', // Aruba - Beach
  'PVR': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop&crop=entropy&v=5', // Puerto Vallarta - Beach

  // Beach/Pacific - Hawaii & other Pacific beaches
  'HNL': 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&h=600&fit=crop&crop=entropy&v=5', // Honolulu - Waikiki
  'OGG': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=entropy&v=5', // Maui - Beach
  'MLE': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&crop=entropy&v=5', // Maldives - Overwater bungalows

  // Generic fallback
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&crop=entropy&v=5',
};

type FilterType = 'all' | 'americas' | 'south-america' | 'europe' | 'asia-pacific' | 'caribbean' | 'beach';

// Memoized single destination card to prevent re-renders
const DestinationCard = memo(({
  destination,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isFavorite,
  toggleFavorite,
  t,
  getDestinationImage,
  getAirlineInfo,
  getCountryFlag
}: any) => (
  <div
    onClick={onClick}
    className={`
      group bg-white rounded-2xl border border-neutral-200
      shadow-level-md hover:shadow-level-xl hover:border-primary-400
      transition-all duration-150 ease-apple overflow-hidden cursor-pointer
      active:scale-[0.97]
      ${isHovered ? 'scale-[1.02] shadow-level-xl -translate-y-1' : ''}
    `}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {/* Destination Photo - TripMATCH Style with Fallback */}
    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 via-secondary-100 to-accent-100">
      <img
        src={getDestinationImage(destination.to)}
        alt={`${destination.city}, ${destination.country}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        style={{ objectPosition: 'center center', objectFit: 'cover', display: 'block' }}
        loading="lazy"
        crossOrigin="anonymous"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.fallback-icon')) {
            const fallback = document.createElement('div');
            fallback.className = 'fallback-icon w-full h-full flex items-center justify-center';
            fallback.innerHTML = '<span class="text-6xl">✈️</span>';
            parent.appendChild(fallback);
          }
        }}
      />
      {/* TripMATCH Gradient - Exact Match */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

      {/* TOP LEFT - Airline Badge + Date Badge (TripMATCH style) */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {(() => {
          const airline = getAirlineInfo(destination.carrier);
          return (
            <div className="bg-info-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
              <span>{airline.logo}</span>
              <span>{airline.name}</span>
            </div>
          );
        })()}
        {/* Date Badge - Low Season Date */}
        <div className="bg-emerald-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
          <Calendar className="w-3 h-3" />
          <span>{new Date(destination.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* TOP RIGHT - Value Score + Favorite (TripMATCH style) */}
      <div className="absolute top-3 right-3 flex gap-2">
        <ValueScoreBadge score={destination.valueScore} size="sm" showLabel={false} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite({
              id: destination.id,
              city: destination.city,
              country: destination.country,
              price: destination.price,
              from: destination.from,
              to: destination.to,
            });
          }}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isFavorite(destination.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={isFavorite(destination.id) ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* CENTER - Urgency Badge (if critical) - positioned below date badge */}
      {destination.seatsAvailable <= 8 && (
        <div className="absolute top-20 left-3">
          <div className="bg-orange-500 px-2 py-1 rounded-lg flex items-center gap-1 text-white text-xs font-bold">
            <Flame className="w-3 h-3" />
            <span>{destination.seatsAvailable} seats left</span>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT - Price Box (TripMATCH style) */}
      <div className="absolute bottom-3 right-3">
        <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
          <p className="text-white font-bold text-lg">
            ${destination.price.toFixed(0)}
          </p>
          <p className="text-white/70 text-xs">per person</p>
        </div>
      </div>

      {/* BOTTOM LEFT - Destination (TripMATCH style) */}
      <div className="absolute bottom-3 left-3 right-24">
        <h3 className="font-bold text-white text-lg mb-1 group-hover:text-primary-400 transition-colors line-clamp-1 drop-shadow-lg">
          {getCountryFlag(destination.country)} {destination.city}
        </h3>
        <div className="flex items-center gap-1 text-white/60 text-sm">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            from {(() => {
              const cityMap: Record<string, string> = {
                'JFK': 'New York', 'LAX': 'Los Angeles', 'ORD': 'Chicago', 'MIA': 'Miami',
                'SFO': 'San Francisco', 'DEN': 'Denver', 'ATL': 'Atlanta', 'SEA': 'Seattle',
                'IAH': 'Houston', 'YYZ': 'Toronto', 'YVR': 'Vancouver', 'MEX': 'Mexico City'
              };
              return cityMap[destination.from] || destination.from;
            })()}
          </span>
        </div>
      </div>
    </div>
  </div>
));

DestinationCard.displayName = 'DestinationCard';

export function DestinationsSectionEnhanced({ lang = 'en' }: DestinationsSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  // ✅ NEW: Dynamic URL based on continent filter
  const filterParam = activeFilter === 'all' ? '?limit=8' : `?continent=${activeFilter}&limit=8`;
  const url = `/api/flights/destinations-enhanced${filterParam}`;

  // ✅ NEW: Client-side cache for instant loads (1hr TTL for analytics data)
  interface DestinationsResponse {
    data: DestinationData[];
    meta?: {
      totalDestinations: number;
    };
  }

  const {
    data: destinationsData,
    loading,
    error: fetchError,
    fromCache,
    cacheAgeFormatted,
    refresh,
  } = useClientCache<DestinationsResponse>(
    url,
    {
      ttl: 3600, // 1 hour (destinations don't change often)
    }
  );

  const destinations = destinationsData?.data || [];
  const error = !!fetchError;

  // Memoize helper functions to prevent recreating on every render
  const getDestinationImage = useCallback((airportCode: string): string => {
    return DESTINATION_IMAGES[airportCode] || DESTINATION_IMAGES['default'];
  }, []);

  // Get airline info with logo and branding
  const getAirlineInfo = useCallback((carrierCode: string | undefined) => {
    if (!carrierCode) {
      // Return default fallback when carrier is missing
      return {
        code: 'MULTI',
        name: 'Multiple Airlines',
        logo: '✈️',
        color: '#6B7280'
      };
    }
    return AIRLINE_DATABASE[carrierCode] || {
      // Fallback for unknown carrier codes
      code: carrierCode,
      name: 'Multiple Airlines',
      logo: '✈️',
      color: '#6B7280'
    };
  }, []);

  // Country flags mapping - memoized
  const getCountryFlag = useCallback((country: string): string => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'Mexico': '🇲🇽',
      // South America
      'Brazil': '🇧🇷',
      'Argentina': '🇦🇷',
      'Peru': '🇵🇪',
      'Colombia': '🇨🇴',
      'Chile': '🇨🇱',
      'Panama': '🇵🇦',
      // Europe
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Germany': '🇩🇪',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Belgium': '🇧🇪',
      'Portugal': '🇵🇹',
      'Greece': '🇬🇷',
      // Asia-Pacific
      'Japan': '🇯🇵',
      'Singapore': '🇸🇬',
      'Australia': '🇦🇺',
      'China': '🇨🇳',
      'Thailand': '🇹🇭',
      'Indonesia': '🇮🇩',
      'South Korea': '🇰🇷',
      'Hong Kong': '🇭🇰',
      'India': '🇮🇳',
      'Malaysia': '🇲🇾',
      'Taiwan': '🇹🇼',
      'Philippines': '🇵🇭',
      // Beach/Caribbean
      'Bahamas': '🇧🇸',
      'Jamaica': '🇯🇲',
      'Dominican Republic': '🇩🇴',
      'Maldives': '🇲🇻',
      'Aruba': '🇦🇼',
      'Barbados': '🇧🇧',
      'Belize': '🇧🇿',
      'Cayman Islands': '🇰🇾',
      'St. Maarten': '🇸🇽',
    };
    return flags[country] || '🌍';
  }, []);

  // Memoize click handler
  const handleDestinationClick = useCallback((destination: DestinationData) => {
    // Save to recently viewed
    saveToRecentlyViewed({
      id: destination.id,
      city: destination.city,
      country: destination.country,
      price: destination.price,
      imageUrl: getDestinationImage(destination.to),
      from: destination.from,
      to: destination.to,
    });
    // Build search params
    const params = new URLSearchParams({
      from: destination.from,
      to: destination.to,
      departure: destination.departureDate,
      ...(destination.returnDate && { return: destination.returnDate }),
      adults: '1',
      children: '0',
      infants: '0',
      class: 'economy',
    });
    window.open(`/flights/results?${params.toString()}`, '_blank');
  }, [getDestinationImage]);

  // Open booking in same tab (not new tab) for better UX
  const handleBookNow = useCallback((destination: DestinationData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Save to recently viewed before navigating
    saveToRecentlyViewed({
      id: destination.id,
      city: destination.city,
      country: destination.country,
      price: destination.price,
      imageUrl: getDestinationImage(destination.to),
      from: destination.from,
      to: destination.to,
    });

    // Build search params - must match EnhancedSearchBar parameter names
    const params = new URLSearchParams({
      from: destination.from,
      to: destination.to,
      departure: destination.departureDate,
      ...(destination.returnDate && { return: destination.returnDate }),
      adults: '1',
      children: '0',
      infants: '0',
      class: 'economy',
    });

    // Navigate in new tab
    window.open(`/flights/results?${params.toString()}`, '_blank');
  }, [getDestinationImage]);

  return (
    <section className="py-4 md:py-6" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Section Header - Compact, allows line break */}
      <div className="flex items-center justify-between mb-3 md:mb-4 gap-2 px-4 md:px-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <h2 className="text-lg md:text-[26px] font-semibold text-neutral-800 tracking-[0.01em] leading-tight">{t.title}</h2>
          {/* Cache Indicator */}
          {fromCache && cacheAgeFormatted && (
            <CacheIndicator
              cacheAge={null}
              cacheAgeFormatted={cacheAgeFormatted}
              fromCache={fromCache}
              onRefresh={refresh}
              compact
              className="hidden sm:block"
            />
          )}
        </div>
        <button
          className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-150 ease-apple min-h-[44px] px-3 flex items-center flex-shrink-0 active:scale-[0.97]"
          onClick={() => window.open('/flights/results', '_blank')}
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider - Compact */}
      <div className="h-px bg-neutral-200/80 mb-3 md:mb-4 mx-4 md:mx-0"></div>

      {/* Filter Pills - Compact padding */}
      <div
        className="flex gap-2 mb-3 md:mb-4 overflow-x-auto scrollbar-hide pb-1 px-4 md:px-0"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {[
          { key: 'all' as FilterType, label: t.all },
          { key: 'americas' as FilterType, label: t.americas },
          { key: 'south-america' as FilterType, label: t.southAmerica },
          { key: 'europe' as FilterType, label: t.europe },
          { key: 'asia-pacific' as FilterType, label: t.asiaPacific },
          { key: 'caribbean' as FilterType, label: t.caribbean },
          { key: 'beach' as FilterType, label: t.beach },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            disabled={loading}
            className={`min-h-[36px] px-3 md:px-4 py-1.5 rounded-lg font-semibold text-sm transition-all duration-150 ease-apple border flex-shrink-0 whitespace-nowrap ${
              activeFilter === filter.key
                ? 'bg-primary-500 text-white border-primary-500 shadow-primary'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 active:scale-[0.97]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">{t.loading}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border-2 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <p className="text-red-700 font-semibold">{t.error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && destinations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Sparkles className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">{t.noResults}</p>
        </div>
      )}

      {/* Destinations Grid - Edge-to-edge, compact spacing */}
      {!loading && !error && destinations.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4 px-4 md:px-0">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                isHovered={hoveredId === destination.id}
                onMouseEnter={() => setHoveredId(destination.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleDestinationClick(destination)}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                t={t}
                getDestinationImage={getDestinationImage}
                getAirlineInfo={getAirlineInfo}
                getCountryFlag={getCountryFlag}
              />
            ))}
          </div>

          {/* Click Hint - Text padding */}
          <div className="text-center text-sm text-gray-600 mt-4 px-4 md:px-0">
            {t.clickHint}
          </div>
        </>
      )}
    </section>
  );
}
