'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FlightCardCompact } from '@/components/flights/FlightCardCompact';
import ModifySearchBar from '@/components/flights/ModifySearchBar';
import FlightFilters, { type FlightFilters as FlightFiltersType, type FlightOffer } from '@/components/flights/FlightFilters';
import SortBar, { type SortOption } from '@/components/flights/SortBar';
import ScrollToTop from '@/components/flights/ScrollToTop';
import { ScrollProgress } from '@/components/flights/ScrollProgress';
import { ChevronRight, AlertCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { normalizePrice } from '@/lib/flights/types';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface SearchParams {
  from: string;
  to: string;
  departure: string;
  return?: string;
  adults: number;
  children: number;
  infants: number;
  class: 'economy' | 'premium' | 'business' | 'first';
}

interface ScoredFlight extends FlightOffer {
  score?: number;
  badges?: any[];
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    searching: 'Searching for the best flights...',
    noResults: 'No flights found',
    noResultsDesc: 'We couldn\'t find any flights matching your search criteria. Try adjusting your filters or search parameters.',
    error: 'Error loading flights',
    errorDesc: 'We encountered an issue while searching for flights. Please try again.',
    retry: 'Retry Search',
    loadMore: 'Load More Flights',
    loading: 'Loading...',
    showingResults: 'Showing {count} of {total} flights',
    filtersActive: '{count} filters active',
    clearFilters: 'Clear all filters',
    bestDeals: 'Best Deals',
    sortedBy: 'Sorted by',
  },
  pt: {
    searching: 'Procurando os melhores voos...',
    noResults: 'Nenhum voo encontrado',
    noResultsDesc: 'Não encontramos voos que correspondam aos seus critérios de busca. Tente ajustar seus filtros ou parâmetros de busca.',
    error: 'Erro ao carregar voos',
    errorDesc: 'Encontramos um problema ao procurar voos. Por favor, tente novamente.',
    retry: 'Tentar Novamente',
    loadMore: 'Carregar Mais Voos',
    loading: 'Carregando...',
    showingResults: 'Mostrando {count} de {total} voos',
    filtersActive: '{count} filtros ativos',
    clearFilters: 'Limpar filtros',
    bestDeals: 'Melhores Ofertas',
    sortedBy: 'Ordenado por',
  },
  es: {
    searching: 'Buscando los mejores vuelos...',
    noResults: 'No se encontraron vuelos',
    noResultsDesc: 'No pudimos encontrar vuelos que coincidan con sus criterios de búsqueda. Intente ajustar sus filtros o parámetros de búsqueda.',
    error: 'Error al cargar vuelos',
    errorDesc: 'Encontramos un problema al buscar vuelos. Por favor, inténtelo de nuevo.',
    retry: 'Reintentar Búsqueda',
    loadMore: 'Cargar Más Vuelos',
    loading: 'Cargando...',
    showingResults: 'Mostrando {count} de {total} vuelos',
    filtersActive: '{count} filtros activos',
    clearFilters: 'Limpiar filtros',
    bestDeals: 'Mejores Ofertas',
    sortedBy: 'Ordenado por',
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  return hours * 60 + minutes;
};

const getDepartureHour = (dateString: string): number => {
  return new Date(dateString).getHours();
};

const getTimeCategory = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

const getStopsCategory = (segments: number): 'direct' | '1-stop' | '2+-stops' => {
  const stops = segments - 1;
  if (stops === 0) return 'direct';
  if (stops === 1) return '1-stop';
  return '2+-stops';
};

// Apply filters to flights
const applyFilters = (flights: ScoredFlight[], filters: FlightFiltersType): ScoredFlight[] => {
  return flights.filter(flight => {
    const price = normalizePrice(flight.price.total);
    const itinerary = flight.itineraries[0];
    const duration = parseDuration(itinerary.duration);
    const departureHour = getDepartureHour(itinerary.segments[0].departure.at);
    const timeCategory = getTimeCategory(departureHour);
    const stopsCategory = getStopsCategory(itinerary.segments.length);
    const airlines = itinerary.segments.map(seg => seg.carrierCode);

    if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
    if (filters.stops.length > 0 && !filters.stops.includes(stopsCategory)) return false;
    if (filters.airlines.length > 0 && !airlines.some(airline => filters.airlines.includes(airline))) return false;
    if (filters.departureTime.length > 0 && !filters.departureTime.includes(timeCategory)) return false;
    if (duration > filters.maxDuration * 60) return false;

    // Basic Economy filter
    if (filters.excludeBasicEconomy) {
      const travelerPricings = (flight as any).travelerPricings || [];
      if (travelerPricings.length > 0) {
        const fareDetails = travelerPricings[0]?.fareDetailsBySegment?.[0];
        if (fareDetails) {
          const fareType = fareDetails.brandedFare || fareDetails.fareBasis || '';
          const isBasicEconomy =
            fareType.toUpperCase().includes('BASIC') ||
            fareType.toUpperCase().includes('LIGHT') ||
            fareType.toUpperCase().includes('SAVER') ||
            fareType.toUpperCase().includes('RESTRICTED');
          if (isBasicEconomy) return false;
        }
      }
    }

    return true;
  });
};

// Sort flights
const sortFlights = (flights: ScoredFlight[], sortBy: SortOption): ScoredFlight[] => {
  const sorted = [...flights];

  switch (sortBy) {
    case 'best':
      return sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
    case 'cheapest':
      return sorted.sort((a, b) => normalizePrice(a.price.total) - normalizePrice(b.price.total));
    case 'fastest':
      return sorted.sort((a, b) => {
        const durationA = parseDuration(a.itineraries[0].duration);
        const durationB = parseDuration(b.itineraries[0].duration);
        return durationA - durationB;
      });
    case 'earliest':
      return sorted.sort((a, b) => {
        const timeA = new Date(a.itineraries[0].segments[0].departure.at).getTime();
        const timeB = new Date(b.itineraries[0].segments[0].departure.at).getTime();
        return timeA - timeB;
      });
    default:
      return sorted;
  }
};

// ===========================
// MAIN COMPONENT
// ===========================

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lang] = useState<'en' | 'pt' | 'es'>('en');
  const t = translations[lang];

  // State
  const [flights, setFlights] = useState<ScoredFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [displayCount, setDisplayCount] = useState(20);

  // Extract search parameters
  const searchData: SearchParams = {
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    departure: searchParams.get('departure') || '',
    return: searchParams.get('return') || undefined,
    adults: parseInt(searchParams.get('adults') || '1'),
    children: parseInt(searchParams.get('children') || '0'),
    infants: parseInt(searchParams.get('infants') || '0'),
    class: (searchParams.get('class') || 'economy') as any,
  };

  // Initialize filters with default values (including new advanced filters)
  const [filters, setFilters] = useState<FlightFiltersType>({
    priceRange: [0, 10000],
    stops: [],
    airlines: [],
    departureTime: [],
    maxDuration: 24,
    excludeBasicEconomy: false,
    cabinClass: [],
    baggageIncluded: false,
    refundableOnly: false,
    maxLayoverDuration: 360,
    alliances: [],
    aircraftTypes: [],
    maxCO2Emissions: 500,
    connectionQuality: [],
  });

  // Fetch flights on mount and when search params change
  useEffect(() => {
    const fetchFlights = async () => {
      if (!searchData.from || !searchData.to || !searchData.departure) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: searchData.from,
            destination: searchData.to,
            departureDate: searchData.departure,
            returnDate: searchData.return,
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
            travelClass: searchData.class,
            currencyCode: 'USD',
            max: 50,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFlights(data.flights || []);

        // Update filter ranges based on results
        if (data.flights && data.flights.length > 0) {
          const prices = data.flights.map((f: ScoredFlight) => normalizePrice(f.price.total));
          const durations = data.flights.map((f: ScoredFlight) =>
            parseDuration(f.itineraries[0].duration)
          );

          setFilters(prev => ({
            ...prev,
            priceRange: [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))],
            maxDuration: Math.ceil(Math.max(...durations) / 60),
          }));
        }
      } catch (err: any) {
        console.error('Error fetching flights:', err);
        setError(err.message || 'Failed to fetch flights');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  // Apply filters and sorting
  const filteredFlights = applyFilters(flights, filters);
  const sortedFlights = sortFlights(filteredFlights, sortBy);
  const displayedFlights = sortedFlights.slice(0, displayCount);

  // Handlers
  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, sortedFlights.length));
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const handleSelectFlight = async (id: string) => {
    const selectedFlight = flights.find(f => f.id === id);
    if (!selectedFlight) return;

    setIsNavigating(true);
    setSelectedFlightId(id);

    try {
      sessionStorage.setItem(`flight_${id}`, JSON.stringify(selectedFlight));
      sessionStorage.setItem(`flight_search_${id}`, JSON.stringify(searchData));

      await new Promise(resolve => setTimeout(resolve, 500));

      const params = new URLSearchParams({
        flightId: id,
        adults: searchData.adults.toString(),
        children: searchData.children.toString(),
        infants: searchData.infants.toString(),
      });

      if (searchData.return && selectedFlight.itineraries.length > 1) {
        params.append('returnFlightId', id);
        params.append('tripType', 'roundtrip');
      } else {
        params.append('tripType', 'oneway');
      }

      router.push(`/flights/booking?${params.toString()}`);
    } catch (error) {
      console.error('Error navigating to booking:', error);
      setIsNavigating(false);
      setSelectedFlightId(null);
    }
  };

  // Get active filter count
  const activeFilterCount =
    filters.stops.length +
    filters.airlines.length +
    filters.departureTime.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t.searching}
            </h2>
            <p className="text-gray-600 font-medium">
              Finding the best deals for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-error/20 p-8 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.error}</h2>
          <p className="text-gray-600 mb-6">{t.errorDesc}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RefreshCcw className="w-5 h-5" />
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // No results state
  if (flights.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <ModifySearchBar
          origin={searchData.from}
          destination={searchData.to}
          departureDate={searchData.departure}
          returnDate={searchData.return}
          passengers={{
            adults: searchData.adults,
            children: searchData.children,
            infants: searchData.infants,
          }}
          cabinClass={searchData.class}
          lang={lang}
          sticky={true}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.noResults}</h2>
            <p className="text-lg text-gray-600 mb-8">{t.noResultsDesc}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main results view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Modify Search Bar - Sticky */}
      <ModifySearchBar
        origin={searchData.from}
        destination={searchData.to}
        departureDate={searchData.departure}
        returnDate={searchData.return}
        passengers={{
          adults: searchData.adults,
          children: searchData.children,
          infants: searchData.infants,
        }}
        cabinClass={searchData.class}
        lang={lang}
        sticky={true}
      />

      {/* Main Content Area */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-20">
              <FlightFilters
                filters={filters}
                onFiltersChange={setFilters}
                flightData={flights}
                lang={lang}
              />
            </div>
          </aside>

          {/* Main Content - Flight Results */}
          <main className="lg:col-span-9">
            {/* Sort Bar */}
            <SortBar
              currentSort={sortBy}
              onChange={setSortBy}
              resultCount={sortedFlights.length}
              lang={lang}
            />

            {/* Active Filters Badge */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex items-center justify-between px-4 py-2 bg-primary-50/50 border border-primary-200 rounded-lg">
                <span className="text-sm font-semibold text-primary-700">
                  {t.filtersActive.replace('{count}', activeFilterCount.toString())}
                </span>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 10000],
                    stops: [],
                    airlines: [],
                    departureTime: [],
                    maxDuration: 24,
                    excludeBasicEconomy: false,
                    cabinClass: [],
                    baggageIncluded: false,
                    refundableOnly: false,
                    maxLayoverDuration: 360,
                    alliances: [],
                    aircraftTypes: [],
                    maxCO2Emissions: 500,
                    connectionQuality: [],
                  })}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 underline"
                >
                  {t.clearFilters}
                </button>
              </div>
            )}

            {/* Flight Cards List - ULTRA COMPACT */}
            <div className="space-y-2">
              {displayedFlights.map((flight) => (
                <FlightCardCompact
                  key={flight.id}
                  id={flight.id}
                  itineraries={flight.itineraries as any}
                  price={flight.price}
                  numberOfBookableSeats={flight.numberOfBookableSeats}
                  validatingAirlineCodes={flight.validatingAirlineCodes}
                  travelerPricings={flight.travelerPricings}
                  badges={flight.badges}
                  score={flight.score as number}
                  onSelect={handleSelectFlight}
                  isNavigating={isNavigating && selectedFlightId === flight.id}
                />
              ))}
            </div>

            {/* Load More Button */}
            {displayCount < sortedFlights.length && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/90 backdrop-blur-lg hover:bg-white border-2 border-primary-200 hover:border-primary-400 text-primary-600 hover:text-primary-700 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span>{t.loadMore}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-gray-600 mt-3">
                  {t.showingResults
                    .replace('{count}', displayCount.toString())
                    .replace('{total}', sortedFlights.length.toString())}
                </p>
              </div>
            )}

            {/* No filtered results */}
            {sortedFlights.length === 0 && flights.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-warning" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No flights match your filters
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filter criteria to see more results.
                </p>
                <button
                  onClick={() => setFilters({
                    priceRange: [0, 10000],
                    stops: [],
                    airlines: [],
                    departureTime: [],
                    maxDuration: 24,
                    excludeBasicEconomy: false,
                    cabinClass: [],
                    baggageIncluded: false,
                    refundableOnly: false,
                    maxLayoverDuration: 360,
                    alliances: [],
                    aircraftTypes: [],
                    maxCO2Emissions: 500,
                    connectionQuality: [],
                  })}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t.clearFilters}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}

// ===========================
// PAGE WRAPPER WITH SUSPENSE
// ===========================

export default function FlightResultsPageOptimized() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Searching for flights...
          </h2>
          <p className="text-gray-600 font-medium">
            Finding the best deals for you
          </p>
        </div>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}
