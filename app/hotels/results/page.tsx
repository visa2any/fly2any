'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HotelCard } from '@/components/hotels/HotelCard';
import HotelFilters, { type HotelFiltersType } from '@/components/hotels/HotelFilters';
import { ScrollProgress } from '@/components/flights/ScrollProgress';
import ScrollToTop from '@/components/flights/ScrollToTop';
import type { MockHotel } from '@/lib/mock-data/hotels';
import { ChevronRight, AlertCircle, RefreshCcw, Sparkles, Hotel, TrendingUp, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  currency: string;
}

type SortOption = 'best' | 'cheapest' | 'rating' | 'distance' | 'popular' | 'deals' | 'topRated';

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    searching: 'Searching for the best hotels...',
    noResults: 'No hotels found',
    noResultsDesc: 'We couldn\'t find any hotels matching your search criteria. Try adjusting your filters or search parameters.',
    error: 'Error loading hotels',
    errorDesc: 'We encountered an issue while searching for hotels. Please try again.',
    retry: 'Retry Search',
    loadMore: 'Load More Hotels',
    loading: 'Loading...',
    showingResults: 'Showing {count} of {total} hotels',
    filtersActive: '{count} filters active',
    clearFilters: 'Clear all filters',
    bestDeals: 'Best Deals',
    sortedBy: 'Sorted by',
    modifySearch: 'Modify Search',
    // Sort options
    bestValue: 'Best Value',
    lowestPrice: 'Lowest Price',
    highestRating: 'Highest Rating',
    nearest: 'Nearest',
    mostPopular: 'Most Popular',
    bestDealsSort: 'Best Deals',
    topRated: 'Top Rated',
    // Insights
    priceInsights: 'Price Insights',
    avgPrice: 'Average Price',
    perNight: 'per night',
    totalForNights: 'Total for {nights} nights',
    dealAlert: 'Great Deal Alert',
    dealAlertDesc: 'Prices are {percent}% lower than usual for these dates',
    popularAmenities: 'Popular Amenities',
    topNeighborhoods: 'Top Neighborhoods',
  },
  pt: {
    searching: 'Procurando os melhores hotéis...',
    noResults: 'Nenhum hotel encontrado',
    noResultsDesc: 'Não encontramos hotéis que correspondam aos seus critérios de busca. Tente ajustar seus filtros.',
    error: 'Erro ao carregar hotéis',
    errorDesc: 'Encontramos um problema ao procurar hotéis. Por favor, tente novamente.',
    retry: 'Tentar Novamente',
    loadMore: 'Carregar Mais Hotéis',
    loading: 'Carregando...',
    showingResults: 'Mostrando {count} de {total} hotéis',
    filtersActive: '{count} filtros ativos',
    clearFilters: 'Limpar filtros',
    bestDeals: 'Melhores Ofertas',
    sortedBy: 'Ordenado por',
    modifySearch: 'Modificar Busca',
    bestValue: 'Melhor Custo-Benefício',
    lowestPrice: 'Menor Preço',
    highestRating: 'Maior Classificação',
    nearest: 'Mais Próximo',
    mostPopular: 'Mais Popular',
    bestDealsSort: 'Melhores Ofertas',
    topRated: 'Melhor Avaliados',
    priceInsights: 'Insights de Preço',
    avgPrice: 'Preço Médio',
    perNight: 'por noite',
    totalForNights: 'Total para {nights} noites',
    dealAlert: 'Alerta de Oferta',
    dealAlertDesc: 'Preços estão {percent}% menores que o normal para essas datas',
    popularAmenities: 'Comodidades Populares',
    topNeighborhoods: 'Principais Bairros',
  },
  es: {
    searching: 'Buscando los mejores hoteles...',
    noResults: 'No se encontraron hoteles',
    noResultsDesc: 'No pudimos encontrar hoteles que coincidan con sus criterios de búsqueda. Intente ajustar sus filtros.',
    error: 'Error al cargar hoteles',
    errorDesc: 'Encontramos un problema al buscar hoteles. Por favor, inténtelo de nuevo.',
    retry: 'Reintentar Búsqueda',
    loadMore: 'Cargar Más Hoteles',
    loading: 'Cargando...',
    showingResults: 'Mostrando {count} de {total} hoteles',
    filtersActive: '{count} filtros activos',
    clearFilters: 'Limpiar filtros',
    bestDeals: 'Mejores Ofertas',
    sortedBy: 'Ordenado por',
    modifySearch: 'Modificar Búsqueda',
    bestValue: 'Mejor Relación Calidad-Precio',
    lowestPrice: 'Precio Más Bajo',
    highestRating: 'Mayor Calificación',
    nearest: 'Más Cercano',
    mostPopular: 'Más Popular',
    bestDealsSort: 'Mejores Ofertas',
    topRated: 'Mejor Valorados',
    priceInsights: 'Información de Precios',
    avgPrice: 'Precio Promedio',
    perNight: 'por noche',
    totalForNights: 'Total para {nights} noches',
    dealAlert: 'Alerta de Oferta',
    dealAlertDesc: 'Los precios están un {percent}% más bajos de lo normal para estas fechas',
    popularAmenities: 'Servicios Populares',
    topNeighborhoods: 'Principales Vecindarios',
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const applyFilters = (hotels: MockHotel[], filters: HotelFiltersType): MockHotel[] => {
  return hotels.filter(hotel => {
    const price = hotel.rates.length > 0 ? parseFloat(hotel.rates[0].total_amount) : 0;

    // Price filter
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

    // Star rating
    if (filters.starRating.length > 0 && !filters.starRating.includes(hotel.star_rating)) return false;

    // Guest rating
    if (hotel.reviews.score < filters.guestRating) return false;

    // Amenities
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity =>
        hotel.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    // Property types
    if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(hotel.property_type)) return false;

    // Meal plans
    if (filters.mealPlans.length > 0) {
      const hasMatchingRate = hotel.rates.some(rate =>
        filters.mealPlans.includes(rate.board_type)
      );
      if (!hasMatchingRate) return false;
    }

    // Cancellation policy
    if (filters.cancellationPolicy.length > 0) {
      const hasMatchingPolicy = hotel.rates.some(rate => {
        if (filters.cancellationPolicy.includes('freeCancellation') && rate.refundable) return true;
        if (filters.cancellationPolicy.includes('nonRefundable') && !rate.refundable) return true;
        return false;
      });
      if (!hasMatchingPolicy) return false;
    }

    return true;
  });
};

const sortHotels = (hotels: MockHotel[], sortBy: SortOption): MockHotel[] => {
  const sorted = [...hotels];

  switch (sortBy) {
    case 'best':
      return sorted.sort((a, b) => {
        const aValue = (a.booking_stats.popular_choice ? 20 : 0) + (a.reviews.score * 10);
        const bValue = (b.booking_stats.popular_choice ? 20 : 0) + (b.reviews.score * 10);
        return bValue - aValue;
      });
    case 'cheapest':
      return sorted.sort((a, b) => {
        const aPrice = a.rates.length > 0 ? parseFloat(a.rates[0].total_amount) : 0;
        const bPrice = b.rates.length > 0 ? parseFloat(b.rates[0].total_amount) : 0;
        return aPrice - bPrice;
      });
    case 'rating':
      return sorted.sort((a, b) => b.reviews.score - a.reviews.score);
    case 'distance':
      return sorted; // Would sort by distance from center
    case 'popular':
      // Sort by booking activity (booked_today + viewing_now)
      return sorted.sort((a, b) => {
        const aPopularity = a.booking_stats.booked_today + a.booking_stats.viewing_now;
        const bPopularity = b.booking_stats.booked_today + b.booking_stats.viewing_now;
        return bPopularity - aPopularity;
      });
    case 'deals':
      // Sort by highest savings percentage
      return sorted.sort((a, b) => {
        const aBestRate = a.rates[0];
        const bBestRate = b.rates[0];
        const aSavings = aBestRate?.public_rate_comparison
          ? ((parseFloat(aBestRate.public_rate_comparison) - parseFloat(aBestRate.total_amount)) / parseFloat(aBestRate.public_rate_comparison)) * 100
          : 0;
        const bSavings = bBestRate?.public_rate_comparison
          ? ((parseFloat(bBestRate.public_rate_comparison) - parseFloat(bBestRate.total_amount)) / parseFloat(bBestRate.public_rate_comparison)) * 100
          : 0;
        return bSavings - aSavings;
      });
    case 'topRated':
      // Sort by combination of star rating and review score
      return sorted.sort((a, b) => {
        const aValue = (a.star_rating * 20) + (a.reviews.score * 10);
        const bValue = (b.star_rating * 20) + (b.reviews.score * 10);
        return bValue - aValue;
      });
    default:
      return sorted;
  }
};

// ===========================
// MAIN COMPONENT
// ===========================

function HotelResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lang] = useState<'en' | 'pt' | 'es'>('en');
  const t = translations[lang];

  // Extract search parameters
  const searchData: SearchParams = {
    destination: searchParams.get('destination') || searchParams.get('query') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0'),
    rooms: parseInt(searchParams.get('rooms') || '1'),
    currency: searchParams.get('currency') || 'USD',
  };

  // Calculate nights
  const nights = searchData.checkIn && searchData.checkOut
    ? Math.ceil((new Date(searchData.checkOut).getTime() - new Date(searchData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // State
  const [hotels, setHotels] = useState<MockHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [displayCount, setDisplayCount] = useState(20);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<HotelFiltersType>({
    priceRange: [0, 1000],
    starRating: [],
    guestRating: 0,
    amenities: [],
    mealPlans: [],
    propertyTypes: [],
    cancellationPolicy: [],
  });

  // Fetch hotels
  useEffect(() => {
    const fetchHotels = async () => {
      if (!searchData.destination || !searchData.checkIn || !searchData.checkOut) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({
          checkIn: searchData.checkIn,
          checkOut: searchData.checkOut,
          adults: searchData.adults.toString(),
          ...(searchData.children > 0 && { children: searchData.children.toString() }),
          query: searchData.destination,
          currency: searchData.currency,
          limit: '50',
        });

        const response = await fetch(`/api/hotels/search?${query.toString()}`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch hotels');
        }

        const hotelsData: MockHotel[] = data.data || [];
        setHotels(hotelsData);

        // Calculate price range from data
        if (hotelsData.length > 0) {
          const prices = hotelsData.map(h => h.rates.length > 0 ? parseFloat(h.rates[0].total_amount) : 0);
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setFilters(prev => ({ ...prev, priceRange: [min, max] }));
        }
      } catch (err: any) {
        console.error('❌ Error fetching hotels:', err);
        setError(err.message || 'Failed to fetch hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  // Apply filters and sorting
  const filteredHotels = applyFilters(hotels, filters);
  const sortedHotels = sortHotels(filteredHotels, sortBy);
  const displayedHotels = sortedHotels.slice(0, displayCount);

  // Count active filters
  const activeFilterCount =
    (filters.starRating.length > 0 ? 1 : 0) +
    (filters.amenities.length > 0 ? 1 : 0) +
    (filters.propertyTypes.length > 0 ? 1 : 0) +
    (filters.mealPlans.length > 0 ? 1 : 0) +
    (filters.cancellationPolicy.length > 0 ? 1 : 0) +
    (filters.guestRating > 0 ? 1 : 0);

  // Calculate average price
  const avgPrice = sortedHotels.length > 0
    ? sortedHotels.reduce((sum, h) => sum + (h.rates.length > 0 ? parseFloat(h.rates[0].total_amount) : 0), 0) / sortedHotels.length
    : 0;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, sortedHotels.length));
  };

  const handleSelectHotel = (hotelId: string, rateId: string) => {
    setSelectedHotelId(hotelId);
    setIsNavigating(true);
    router.push(`/hotels/${hotelId}?rateId=${rateId}&checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&adults=${searchData.adults}&children=${searchData.children}&rooms=${searchData.rooms}`);
  };

  const handleViewDetails = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setIsNavigating(true);
    router.push(`/hotels/${hotelId}?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&adults=${searchData.adults}&children=${searchData.children}&rooms=${searchData.rooms}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-orange-200/70 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-slate-50 rounded-full flex items-center justify-center shadow-lg">
              <Hotel className="w-10 h-10 text-orange-600" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-3 leading-tight tracking-tight">{t.searching}</h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">Finding the perfect stay in {searchData.destination}</p>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{searchData.checkIn} - {searchData.checkOut} · {nights} {nights === 1 ? 'night' : 'nights'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-red-100/70 p-10 text-center">
          <div className="w-24 h-24 bg-red-100/80 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-3 leading-tight tracking-tight">{t.error}</h2>
          <p className="text-base text-slate-600 mb-8 leading-relaxed">{t.errorDesc}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg leading-relaxed"
          >
            <RefreshCcw className="w-5 h-5" />
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // No results
  if (hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-12">
            <div className="w-24 h-24 bg-slate-100/80 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hotel className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 mb-4 leading-tight tracking-tight">{t.noResults}</h2>
            <p className="text-base text-slate-600 mb-8 leading-relaxed">{t.noResultsDesc}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main results view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50">
      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Modify Search Bar - Sticky (ENHANCED READABILITY) */}
      <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px' }}>
          <div className="flex items-center justify-between" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight leading-tight">Hotels in {searchData.destination}</h1>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed tracking-normal">
                {searchData.checkIn} - {searchData.checkOut} · {searchData.adults} adults · {searchData.rooms} room{searchData.rooms > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => router.push('/home-new')}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors px-4 py-2 rounded-lg hover:bg-orange-50/80"
            >
              {t.modifySearch}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - MATCHES GLOBAL HEADER WIDTH */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Sidebar - Filters (Reduced width by 30%) */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 overflow-hidden">
                <HotelFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  hotels={hotels}
                  lang={lang}
                />
              </div>
            </div>
          </aside>

          {/* Main Content - Hotel Results (Further expanded) */}
          <main className="lg:col-span-8">
            {/* Sort Tabs - WORLD-CLASS HORIZONTAL PILLS (Airbnb/Booking.com style) */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700 mr-0.5">Sort:</span>

                {/* Horizontal Pills Container - COMPACT FOR 7 PILLS IN ONE LINE */}
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {/* Best Value Pill */}
                  <button
                    onClick={() => setSortBy('best')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'best'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    {t.bestValue}
                  </button>

                  {/* Lowest Price Pill */}
                  <button
                    onClick={() => setSortBy('cheapest')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'cheapest'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    💰 {t.lowestPrice}
                  </button>

                  {/* Highest Rating Pill */}
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'rating'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    ⭐ {t.highestRating}
                  </button>

                  {/* Nearest Pill */}
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'distance'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    📍 {t.nearest}
                  </button>

                  {/* Most Popular Pill */}
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'popular'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    🔥 {t.mostPopular}
                  </button>

                  {/* Best Deals Pill */}
                  <button
                    onClick={() => setSortBy('deals')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'deals'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    💎 {t.bestDealsSort}
                  </button>

                  {/* Top Rated Pill */}
                  <button
                    onClick={() => setSortBy('topRated')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'topRated'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                  >
                    🏆 {t.topRated}
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  {sortedHotels.length}
                </span>
                {sortedHotels.length === 1 ? 'hotel' : 'hotels'}
              </span>
            </div>

            {/* Active Filters Badge */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex items-center justify-between px-4 py-2.5 bg-orange-50/60 border border-orange-200/70 rounded-lg">
                <span className="text-sm font-medium text-orange-800 leading-relaxed">
                  {t.filtersActive.replace('{count}', activeFilterCount.toString())}
                </span>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 1000],
                    starRating: [],
                    guestRating: 0,
                    amenities: [],
                    mealPlans: [],
                    propertyTypes: [],
                    cancellationPolicy: [],
                  })}
                  className="text-sm font-semibold text-orange-700 hover:text-orange-800 underline leading-relaxed"
                >
                  {t.clearFilters}
                </button>
              </div>
            )}

            {/* Hotel Cards List - ULTRA COMPACT */}
            <div className="space-y-2">
              {displayedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  checkIn={searchData.checkIn}
                  checkOut={searchData.checkOut}
                  adults={searchData.adults}
                  children={searchData.children}
                  nights={nights}
                  onSelect={handleSelectHotel}
                  onViewDetails={handleViewDetails}
                  lang={lang}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayCount < sortedHotels.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-50/95 backdrop-blur-lg hover:bg-white/95 border-2 border-orange-200/70 hover:border-orange-400 text-orange-700 hover:text-orange-800 font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg leading-relaxed"
                >
                  <span>{t.loadMore}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {t.showingResults
                    .replace('{count}', displayCount.toString())
                    .replace('{total}', sortedHotels.length.toString())}
                </p>
              </div>
            )}

            {/* No filtered results */}
            {sortedHotels.length === 0 && hotels.length > 0 && (
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
                <div className="w-20 h-20 bg-orange-100/80 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3 leading-tight tracking-tight">
                  No hotels match your filters
                </h3>
                <p className="text-base text-slate-600 mb-6 leading-relaxed">
                  Try adjusting your filter criteria to see more results.
                </p>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 1000],
                    starRating: [],
                    guestRating: 0,
                    amenities: [],
                    mealPlans: [],
                    propertyTypes: [],
                    cancellationPolicy: [],
                  })}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg leading-relaxed"
                >
                  {t.clearFilters}
                </button>
              </div>
            )}
          </main>

          {/* Right Sidebar - Insights (Reduced width by 20%) */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Price Insights */}
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2 leading-tight">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  {t.priceInsights}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 leading-relaxed">{t.avgPrice}</span>
                    <span className="text-xl font-bold text-orange-600 tracking-tight">${Math.round(avgPrice)}</span>
                  </div>
                  <div className="text-sm text-slate-500 leading-relaxed">{t.perNight}</div>
                  <div className="text-sm font-medium text-slate-800 leading-relaxed">
                    {t.totalForNights.replace('{nights}', nights.toString())}: ${Math.round(avgPrice * nights)}
                  </div>
                </div>
              </div>

              {/* Deal Alert */}
              {sortedHotels.some(h => h.booking_stats.popular_choice) && (
                <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-2 border-green-200/70 rounded-2xl p-5">
                  <h3 className="text-base font-semibold text-green-900 mb-2 flex items-center gap-2 leading-tight">
                    <TrendingUp className="w-4 h-4" />
                    {t.dealAlert}
                  </h3>
                  <p className="text-sm text-green-800 leading-relaxed">
                    {t.dealAlertDesc.replace('{percent}', '15')}
                  </p>
                </div>
              )}

              {/* Popular Right Now */}
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2 leading-tight">
                  <Users className="w-4 h-4 text-orange-600" />
                  Popular Right Now
                </h3>
                <div className="space-y-2.5">
                  {sortedHotels.slice(0, 3).map((hotel, idx) => (
                    <div key={hotel.id} className="flex items-center gap-2">
                      <span className="font-bold text-orange-600 text-sm">#{idx + 1}</span>
                      <span className="text-sm text-slate-700 truncate leading-relaxed">{hotel.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Amenities */}
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-3 leading-tight">{t.popularAmenities}</h3>
                <div className="flex flex-wrap gap-2">
                  {['WiFi', 'Pool', 'Gym', 'Parking'].map((amenity) => (
                    <span key={amenity} className="px-3 py-1.5 bg-orange-50/80 text-orange-700 rounded-full text-sm font-medium leading-relaxed">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}

export default function HotelResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-orange-200/70 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 bg-slate-50 rounded-full flex items-center justify-center shadow-lg">
                <Hotel className="w-10 h-10 text-orange-600" />
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 leading-tight tracking-tight">Loading hotels...</h2>
          </div>
        </div>
      }
    >
      <HotelResultsContent />
    </Suspense>
  );
}
