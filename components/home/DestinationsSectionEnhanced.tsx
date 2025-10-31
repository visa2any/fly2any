'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { TrendingUp, TrendingDown, Users, Flame, Sparkles, Eye, ShoppingCart, AlertCircle, Loader2, ArrowRight, Plane, Heart } from 'lucide-react';
import { AIRLINE_DATABASE } from '@/lib/flights/airline-data';
import { useFavorites, saveToRecentlyViewed } from '@/lib/hooks/useFavorites';

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
  'LIM': 'https://images.unsplash.com/photo-1531968455429-749562d22f32?w=800&h=600&fit=crop&crop=entropy&v=5', // Lima - Historic Center
  'BOG': 'https://images.unsplash.com/photo-1568632234857-c9bc58428001?w=800&h=600&fit=crop&crop=entropy&v=5', // Bogotá - Cityscape with mountains

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

export function DestinationsSectionEnhanced({ lang = 'en' }: DestinationsSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<DestinationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(false);
      try {
        const filterParam = activeFilter === 'all' ? '?limit=8' : `?continent=${activeFilter}&limit=8`;
        const response = await fetch(`/api/flights/destinations-enhanced${filterParam}`);

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setDestinations(data.data || []);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [activeFilter]);

  const handleDestinationClick = (destination: DestinationData) => {
    // Save to recently viewed
    saveToRecentlyViewed({
      id: destination.id,
      city: destination.city,
      country: destination.country,
      price: destination.price,
      imageUrl: getDestinationImage(destination.to),
    });
    // Build search params
    const params = new URLSearchParams({
      from: destination.from,
      to: destination.to,
      departureDate: destination.departureDate,
      ...(destination.returnDate && { returnDate: destination.returnDate }),
      tripType: destination.returnDate ? 'roundtrip' : 'oneway',
      adults: '1',
      cabinClass: 'economy',
    });

    // Navigate to flight results
    router.push(`/flights/results?${params.toString()}`);
  };

  const getDestinationImage = (airportCode: string): string => {
    return DESTINATION_IMAGES[airportCode] || DESTINATION_IMAGES['default'];
  };

  // Get airline info with logo and branding
  const getAirlineInfo = (carrierCode: string | undefined) => {
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
  };

  // Country flags mapping
  const getCountryFlag = (country: string): string => {
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
  };

  // Open booking in new tab
  const handleBookNow = (destination: DestinationData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
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
  };

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <button
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          onClick={() => router.push('/flights/results')}
        >
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
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
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

      {/* Destinations Grid */}
      {!loading && !error && destinations.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                onClick={() => handleDestinationClick(destination)}
                className={`
                  bg-white rounded-xl border-2 border-gray-200
                  hover:border-primary-400 hover:shadow-2xl
                  transition-all duration-300 ease-out overflow-hidden cursor-pointer
                  ${hoveredId === destination.id ? 'scale-[1.03] shadow-2xl -translate-y-1' : ''}
                `}
                onMouseEnter={() => setHoveredId(destination.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Destination Photo */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={getDestinationImage(destination.to)}
                    alt={`${destination.city}, ${destination.country}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    style={{ objectPosition: 'center center', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  {/* Enhanced overlay for better text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Top Right Controls: Value Score + Favorite */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    {/* Favorite Button */}
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isFavorite(destination.id)
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 shadow-md'
                      }`}
                      title={isFavorite(destination.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={isFavorite(destination.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                    {/* Value Score Badge */}
                    <ValueScoreBadge score={destination.valueScore} size="sm" showLabel={false} />
                  </div>

                  {/* Airline Branding - Top Left - PROMINENT */}
                  {(() => {
                    const airline = getAirlineInfo(destination.carrier);
                    return (
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{airline.logo}</span>
                          <span className="text-xs font-bold text-gray-900">{airline.name}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* City/Country with Flag - Bottom */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getCountryFlag(destination.country)}</span>
                      <h3 className="text-xl font-bold text-white drop-shadow-2xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                        {destination.city}
                      </h3>
                    </div>
                    <p className="text-xs text-white/95 drop-shadow-lg font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                      {destination.country}
                    </p>
                  </div>
                </div>

                {/* Destination Details - REDESIGNED COMPACT */}
                <div className="p-3 space-y-2.5">
                  {/* From City Display */}
                  <div className="text-xs text-gray-500 font-medium">
                    {t.from} {(() => {
                      const cityMap: Record<string, string> = {
                        'JFK': 'New York', 'LAX': 'Los Angeles', 'ORD': 'Chicago', 'MIA': 'Miami',
                        'SFO': 'San Francisco', 'DEN': 'Denver', 'ATL': 'Atlanta', 'SEA': 'Seattle',
                        'IAH': 'Houston', 'YYZ': 'Toronto', 'YVR': 'Vancouver', 'MEX': 'Mexico City'
                      };
                      return cityMap[destination.from] || destination.from;
                    })()}
                  </div>

                  {/* Price Section - ENHANCED FOR EMPHASIS */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-gray-500 font-medium mb-1">{t.priceStartsFrom}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-primary-600">${destination.price.toFixed(0)}</span>
                        {destination.originalPrice && destination.priceDropRecent && (
                          <span className="text-xs text-gray-400 line-through font-medium">${destination.originalPrice.toFixed(0)}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">per person</div>
                    </div>
                    {destination.originalPrice && destination.priceDropRecent && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        -{Math.round(((destination.originalPrice - destination.price) / destination.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Social Proof - UNIFIED GRAY, MAX 2 BADGES */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Priority 1: Urgency (Low Seats) - Keep urgency color for conversion */}
                    {destination.seatsAvailable <= 10 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-orange-100 rounded text-[10px] font-bold text-orange-700">
                        <Flame className="w-3 h-3" />
                        {destination.seatsAvailable} seats left
                      </span>
                    )}
                    {/* Priority 2: Trending - Only if no urgency */}
                    {destination.trending && destination.seatsAvailable > 10 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-gray-100 rounded text-[10px] font-semibold text-gray-700">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                    {/* Priority 3: Social Proof (Viewers or Bookings) - Unified Gray */}
                    {destination.viewersLast24h > 100 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-gray-100 rounded text-[10px] font-semibold text-gray-600">
                        <Eye className="w-3 h-3" />
                        {destination.viewersLast24h} viewing
                      </span>
                    )}
                    {destination.bookingsLast24h > 15 && destination.viewersLast24h <= 100 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-gray-100 rounded text-[10px] font-semibold text-gray-600">
                        <ShoppingCart className="w-3 h-3" />
                        {destination.bookingsLast24h} bookings
                      </span>
                    )}
                  </div>

                  {/* Book Now Button - REFINED CTA */}
                  <button
                    onClick={(e) => handleBookNow(destination, e)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <Plane className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
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
    </section>
  );
}
