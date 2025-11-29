'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HotelCard } from '@/components/hotels/HotelCard';
import HotelFilters, { type HotelFiltersType } from '@/components/hotels/HotelFilters';
import { ScrollProgress } from '@/components/flights/ScrollProgress';
import ScrollToTop from '@/components/flights/ScrollToTop';
import type { LiteAPIHotel } from '@/lib/hotels/types';
import { ChevronRight, AlertCircle, RefreshCcw, Sparkles, Hotel, TrendingUp, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileFilterSheet, FilterButton } from '@/components/mobile';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { usePullToRefresh, RefreshButton } from '@/lib/hooks/usePullToRefresh';
import { useScrollMinimize } from '@/lib/hooks/useScrollDirection';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import { CollapsibleSearchBar } from '@/components/mobile/CollapsibleSearchBar';

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
    loadingMore: 'Loading more hotels...',
    allResultsLoaded: 'All {total} hotels loaded',
    filtersActive: '{count} filters active',
    clearFilters: 'Clear all filters',
    bestDeals: 'Best Deals',
    sortedBy: 'Sorted by',
    modifySearch: 'Modify Search',
    bestValue: 'Best Value',
    lowestPrice: 'Lowest Price',
    highestRating: 'Highest Rating',
    nearest: 'Nearest',
    mostPopular: 'Most Popular',
    bestDealsSort: 'Best Deals',
    topRated: 'Top Rated',
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
    loadingMore: 'Carregando mais hotéis...',
    allResultsLoaded: 'Todos os {total} hotéis carregados',
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
    loadingMore: 'Cargando más hoteles...',
    allResultsLoaded: 'Todos los {total} hoteles cargados',
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
// UTILITY FUNCTIONS (Production - LiteAPI)
// ===========================

const getLowestPrice = (hotel: LiteAPIHotel): number => {
  // Safety check for hotel object
  if (!hotel) return 0;

  // CRITICAL FIX: Use per-night price, not total price!
  // LiteAPI returns lowestPrice as TOTAL for entire stay

  // Try lowestPricePerNight first (correctly calculated in API)
  if (hotel.lowestPricePerNight) {
    return hotel.lowestPricePerNight;
  }

  // Fall back to rates (these are also TOTAL prices, need to divide)
  const rates = hotel.rates || [];
  if (rates.length === 0) return 0;

  // Filter out invalid rates and get valid prices
  const validPrices = rates
    .filter(r => r?.totalPrice?.amount)
    .map(r => parseFloat(r.totalPrice.amount))
    .filter(p => !isNaN(p) && p > 0);

  if (validPrices.length === 0) return 0;

  // Return minimum - this will be used for filtering/sorting
  // Note: For display, the HotelCard component will handle per-night calculation
  return Math.min(...validPrices);
};

const applyFilters = (hotels: LiteAPIHotel[], filters: HotelFiltersType): LiteAPIHotel[] => {
  if (!hotels || !Array.isArray(hotels)) return [];
  if (!filters) return hotels;

  return hotels.filter(hotel => {
    if (!hotel) return false;

    const price = getLowestPrice(hotel);

    // Price filter - defensive check for priceRange
    const minPrice = filters.priceRange?.[0] ?? 0;
    const maxPrice = filters.priceRange?.[1] ?? 10000;
    if (price > 0 && (price < minPrice || price > maxPrice)) return false;

    // Star rating - defensive array check
    const starFilters = filters.starRating || [];
    if (starFilters.length > 0 && !starFilters.includes(hotel.rating || 0)) return false;

    // Guest rating (reviewScore is 0-10 scale)
    const guestRating = filters.guestRating || 0;
    if (guestRating > 0 && (hotel.reviewScore || 0) < guestRating) return false;

    // Amenities - defensive array checks
    const amenityFilters = filters.amenities || [];
    if (amenityFilters.length > 0) {
      const hotelAmenities = hotel.amenities || [];
      const hasAllAmenities = amenityFilters.every(amenity =>
        hotelAmenities.some(a => a?.toLowerCase?.().includes?.(amenity?.toLowerCase?.()) ?? false)
      );
      if (!hasAllAmenities) return false;
    }

    // Meal plans (board types) - defensive array checks
    const mealPlanFilters = filters.mealPlans || [];
    if (mealPlanFilters.length > 0) {
      const rates = hotel.rates || [];
      const hasMatchingRate = rates.some(rate =>
        rate && mealPlanFilters.some(plan => rate.boardType?.toLowerCase?.()?.includes?.(plan?.toLowerCase?.()) ?? false)
      );
      if (!hasMatchingRate) return false;
    }

    // Cancellation policy - defensive array checks
    const cancellationFilters = filters.cancellationPolicy || [];
    if (cancellationFilters.length > 0) {
      const rates = hotel.rates || [];
      const hasMatchingPolicy = rates.some(rate => {
        if (!rate) return false;
        if (cancellationFilters.includes('freeCancellation') && rate.refundable) return true;
        if (cancellationFilters.includes('nonRefundable') && !rate.refundable) return true;
        return false;
      });
      if (!hasMatchingPolicy) return false;
    }

    return true;
  });
};

const sortHotels = (hotels: LiteAPIHotel[], sortBy: SortOption): LiteAPIHotel[] => {
  if (!hotels || !Array.isArray(hotels)) return [];

  // Filter out invalid hotel entries first
  const validHotels = hotels.filter(h => h && h.id);
  const sorted = [...validHotels];

  switch (sortBy) {
    case 'best':
      // Sort by combination of review score and star rating
      return sorted.sort((a, b) => {
        const aValue = ((a?.reviewScore || 0) * 10) + ((a?.rating || 0) * 5);
        const bValue = ((b?.reviewScore || 0) * 10) + ((b?.rating || 0) * 5);
        return bValue - aValue;
      });
    case 'cheapest':
      return sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    case 'rating':
      return sorted.sort((a, b) => (b?.reviewScore || 0) - (a?.reviewScore || 0));
    case 'distance':
      return sorted; // Would need distance data from API
    case 'popular':
      // Sort by review count as proxy for popularity
      return sorted.sort((a, b) => (b?.reviewCount || 0) - (a?.reviewCount || 0));
    case 'deals':
      // Sort by lowest price (best deals = cheapest)
      return sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    case 'topRated':
      // Sort by combination of star rating and review score
      return sorted.sort((a, b) => {
        const aValue = ((a?.rating || 0) * 20) + ((a?.reviewScore || 0) * 10);
        const bValue = ((b?.rating || 0) * 20) + ((b?.reviewScore || 0) * 10);
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
    destination: searchParams.get('destination') || searchParams.get('location') || searchParams.get('query') || '',
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

  // State - Using LiteAPIHotel type
  const [hotels, setHotels] = useState<LiteAPIHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [displayCount, setDisplayCount] = useState(20);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Mobile filter sheet state
  const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false);

  // Search bar collapsed state (for mobile)
  const [searchBarCollapsed, setSearchBarCollapsed] = useState(true);

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

  // Smart scroll behavior
  const shouldMinimize = useScrollMinimize({
    threshold: 50,
    mobileOnly: true,
  });

  // Pull-to-refresh functionality
  const { isRefreshing: isPullRefreshing, pullIndicator } = usePullToRefresh(
    async () => {
      await fetchHotels();
    },
    {
      threshold: 80,
      mobileOnly: true,
      theme: 'orange',
    }
  );

  // Fetch hotels function
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
        limit: '200', // Increased from 50 to get more hotel options
      });

      const response = await fetch(`/api/hotels/search?${query.toString()}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch hotels');
      }

      // Data is already in LiteAPIHotel format from API
      const hotelsData: LiteAPIHotel[] = data.data || [];
      setHotels(hotelsData);

      // Calculate price range from data
      if (hotelsData.length > 0) {
        const prices = hotelsData.map(h => getLowestPrice(h)).filter(p => p > 0);
        if (prices.length > 0) {
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setFilters(prev => ({ ...prev, priceRange: [min, max] }));
        }
      }
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
      setError(err.message || 'Failed to fetch hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotels on mount and when search params change
  useEffect(() => {
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
    ? sortedHotels.reduce((sum, h) => sum + getLowestPrice(h), 0) / sortedHotels.length
    : 0;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, sortedHotels.length));
  };

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll(
    handleLoadMore,
    displayCount < sortedHotels.length,
    0.8,
    '200px'
  );

  const handleSelectHotel = (hotelId: string, rateId: string, offerId: string) => {
    setSelectedHotelId(hotelId);
    setIsNavigating(true);
    router.push(`/hotels/${hotelId}?rateId=${rateId}&offerId=${offerId}&checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&adults=${searchData.adults}&children=${searchData.children}&rooms=${searchData.rooms}`);
  };

  const handleViewDetails = (hotelId: string) => {
    // Open hotel details in a new tab
    window.open(`/hotels/${hotelId}?checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&adults=${searchData.adults}&children=${searchData.children}&rooms=${searchData.rooms}`, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50">
        {/* Search Bar - VISIBLE during loading */}
        <EnhancedSearchBar
          lang={lang}
          defaultService="hotels"
        />

        <div className="flex items-center justify-center pt-20">
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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50">
        <EnhancedSearchBar
          lang={lang}
          defaultService="hotels"
        />

        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-md w-full bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-red-100/70 p-10 text-center">
            <div className="w-24 h-24 bg-red-100/80 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-semibold text-slate-900 mb-3 leading-tight tracking-tight">{t.error}</h2>
            <p className="text-base text-slate-600 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => fetchHotels()}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg leading-relaxed"
            >
              <RefreshCcw className="w-5 h-5" />
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No results
  if (hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-50">
        <EnhancedSearchBar
          lang={lang}
          defaultService="hotels"
        />

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
      {pullIndicator}

      <div className="md:hidden">
        <RefreshButton
          onRefresh={fetchHotels}
          isRefreshing={loading || isPullRefreshing}
          theme="orange"
        />
      </div>

      <ScrollProgress />

      {/* Search Bar - Collapsible for mobile, always visible for desktop (Flight-style pattern) */}
      <CollapsibleSearchBar
        searchSummary={{
          origin: '', // Hotels don't have origin/destination like flights
          destination: searchData.destination,
          departDate: searchData.checkIn ? new Date(searchData.checkIn) : null,
          returnDate: searchData.checkOut ? new Date(searchData.checkOut) : null,
          passengers: {
            adults: searchData.adults,
            children: searchData.children,
            infants: 0,
          },
          tripType: 'roundtrip', // Hotel stays are conceptually like roundtrips
        }}
        defaultCollapsed={searchBarCollapsed}
        onCollapseChange={setSearchBarCollapsed}
        mobileOnly={true}
      >
        <EnhancedSearchBar
          lang={lang}
          defaultService="hotels"
          hotelDestination={searchData.destination}
          hotelCheckIn={searchData.checkIn}
          hotelCheckOut={searchData.checkOut}
          hotelAdults={searchData.adults}
          hotelChildren={searchData.children}
          hotelRooms={searchData.rooms}
        />
      </CollapsibleSearchBar>

      {/* Desktop: Show full search bar (CollapsibleSearchBar is mobile-only) */}
      <div className="hidden md:block">
        <EnhancedSearchBar
          lang={lang}
          defaultService="hotels"
          hotelDestination={searchData.destination}
          hotelCheckIn={searchData.checkIn}
          hotelCheckOut={searchData.checkOut}
          hotelAdults={searchData.adults}
          hotelChildren={searchData.children}
          hotelRooms={searchData.rooms}
        />
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1600px', margin: '0 auto' }} className="p-3 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">

          {/* Left Sidebar - Filters */}
          <aside className="hidden lg:block lg:col-span-2">
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

          {/* Main Content - Hotel Results */}
          <main className="lg:col-span-8">
            {/* Sort Tabs */}
            <div className="flex items-center justify-between mb-2 md:mb-4 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700 mr-0.5">Sort:</span>
                <div className="flex items-center gap-1.5 flex-wrap md:flex-nowrap">
                  {[
                    { key: 'best', label: t.bestValue, icon: '' },
                    { key: 'cheapest', label: t.lowestPrice, icon: '💰' },
                    { key: 'rating', label: t.highestRating, icon: '⭐' },
                    { key: 'distance', label: t.nearest, icon: '📍' },
                    { key: 'popular', label: t.mostPopular, icon: '🔥' },
                    { key: 'topRated', label: t.topRated, icon: '🏆' },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key as SortOption)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                        sortBy === key
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg'
                          : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  {sortedHotels.length}
                </span>
                {sortedHotels.length === 1 ? 'hotel' : 'hotels'}
              </span>
            </div>

            {/* Active Filters Badge */}
            {activeFilterCount > 0 && (
              <div className="mb-2 md:mb-4 flex items-center justify-between px-3 md:px-4 py-2 md:py-2.5 bg-orange-50/60 border border-orange-200/70 rounded-lg">
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

            {/* Hotel Cards List */}
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

            {/* Infinite Scroll Sentinel */}
            {displayCount < sortedHotels.length && (
              <div ref={loadMoreRef} className="mt-6 md:mt-8 text-center">
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{t.loadingMore}</p>
                </div>
              </div>
            )}

            {/* All Results Loaded */}
            {displayCount >= sortedHotels.length && sortedHotels.length > 20 && (
              <div className="mt-6 md:mt-8 text-center py-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">
                    {t.allResultsLoaded.replace('{total}', sortedHotels.length.toString())}
                  </span>
                </div>
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

          {/* Right Sidebar - Insights */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-2 md:space-y-4">
              {/* Price Insights */}
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 p-3 md:p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-2 md:mb-3 flex items-center gap-2 leading-tight">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  {t.priceInsights}
                </h3>
                <div className="space-y-2 md:space-y-3">
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

              {/* Popular Right Now */}
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 p-3 md:p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-2 md:mb-3 flex items-center gap-2 leading-tight">
                  <Users className="w-4 h-4 text-orange-600" />
                  Popular Right Now
                </h3>
                <div className="space-y-1.5 md:space-y-2.5">
                  {sortedHotels.slice(0, 3).map((hotel, idx) => (
                    <div key={hotel.id} className="flex items-center gap-2">
                      <span className="font-bold text-orange-600 text-sm">#{idx + 1}</span>
                      <span className="text-sm text-slate-700 truncate leading-relaxed">{hotel.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Amenities */}
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 p-3 md:p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-2 md:mb-3 leading-tight">{t.popularAmenities}</h3>
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

      <ScrollToTop />

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <FilterButton
          onClick={() => setMobileFilterSheetOpen(true)}
          activeFilterCount={activeFilterCount}
          label="Filters"
        />
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={mobileFilterSheetOpen}
        onClose={() => setMobileFilterSheetOpen(false)}
        onApply={() => setMobileFilterSheetOpen(false)}
        onClear={() => {
          setFilters({
            priceRange: [0, 1000],
            starRating: [],
            guestRating: 0,
            amenities: [],
            mealPlans: [],
            propertyTypes: [],
            cancellationPolicy: [],
          });
        }}
        resultCount={sortedHotels.length}
        activeFilterCount={activeFilterCount}
        title="Hotel Filters"
      >
        <HotelFilters
          filters={filters}
          onFiltersChange={setFilters}
          hotels={hotels}
          lang={lang}
        />
      </MobileFilterSheet>
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
