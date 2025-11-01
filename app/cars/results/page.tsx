'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CarCard, type CarRental } from '@/components/cars/CarCard';
import CarFilters, { type CarFiltersType } from '@/components/cars/CarFilters';
import { ScrollProgress } from '@/components/flights/ScrollProgress';
import ScrollToTop from '@/components/flights/ScrollToTop';
import { ChevronRight, AlertCircle, RefreshCcw, Sparkles, Car, TrendingUp, Clock, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface SearchParams {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  dropoffDate: string;
  rentalType: string;
}

type SortOption = 'best' | 'cheapest' | 'rating' | 'category' | 'popular' | 'deals' | 'company';

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    searching: 'Searching for the best car rentals...',
    noResults: 'No cars found',
    noResultsDesc: 'We couldn\'t find any cars matching your search criteria. Try adjusting your filters or search parameters.',
    error: 'Error loading cars',
    errorDesc: 'We encountered an issue while searching for cars. Please try again.',
    retry: 'Retry Search',
    loadMore: 'Load More Cars',
    loading: 'Loading...',
    showingResults: 'Showing {count} of {total} cars',
    filtersActive: '{count} filters active',
    clearFilters: 'Clear all filters',
    bestDeals: 'Best Deals',
    sortedBy: 'Sorted by',
    modifySearch: 'Modify Search',
    // Sort options
    bestValue: 'Best Value',
    lowestPrice: 'Lowest Price',
    highestRating: 'Highest Rating',
    byCategory: 'By Category',
    mostPopular: 'Most Popular',
    bestDealsSort: 'Best Deals',
    byCompany: 'By Company',
    // Insights
    priceInsights: 'Price Insights',
    avgPricePerDay: 'Avg price/day',
    totalPrice: 'Total for {days} days',
    dealAlert: 'Deal Alert',
    lowerThanAvg: '{percent}% lower than average',
    popularNow: 'Popular Right Now',
    topCompanies: 'Top Companies',
  },
  pt: {
    searching: 'Procurando os melhores carros para alugar...',
    noResults: 'Nenhum carro encontrado',
    noResultsDesc: 'Não encontramos carros que correspondam aos seus critérios. Tente ajustar seus filtros.',
    error: 'Erro ao carregar carros',
    errorDesc: 'Encontramos um problema ao procurar carros. Por favor, tente novamente.',
    retry: 'Tentar Novamente',
    loadMore: 'Carregar Mais Carros',
    loading: 'Carregando...',
    showingResults: 'Mostrando {count} de {total} carros',
    filtersActive: '{count} filtros ativos',
    clearFilters: 'Limpar todos os filtros',
    bestDeals: 'Melhores Ofertas',
    sortedBy: 'Ordenado por',
    modifySearch: 'Modificar Busca',
    bestValue: 'Melhor Valor',
    lowestPrice: 'Menor Preço',
    highestRating: 'Maior Avaliação',
    byCategory: 'Por Categoria',
    mostPopular: 'Mais Popular',
    bestDealsSort: 'Melhores Ofertas',
    byCompany: 'Por Empresa',
    priceInsights: 'Insights de Preço',
    avgPricePerDay: 'Preço médio/dia',
    totalPrice: 'Total para {days} dias',
    dealAlert: 'Alerta de Oferta',
    lowerThanAvg: '{percent}% abaixo da média',
    popularNow: 'Popular Agora',
    topCompanies: 'Principais Empresas',
  },
  es: {
    searching: 'Buscando los mejores coches de alquiler...',
    noResults: 'No se encontraron coches',
    noResultsDesc: 'No encontramos coches que coincidan con tus criterios. Intenta ajustar tus filtros.',
    error: 'Error al cargar coches',
    errorDesc: 'Encontramos un problema al buscar coches. Por favor, inténtalo de nuevo.',
    retry: 'Reintentar Búsqueda',
    loadMore: 'Cargar Más Coches',
    loading: 'Cargando...',
    showingResults: 'Mostrando {count} de {total} coches',
    filtersActive: '{count} filtros activos',
    clearFilters: 'Borrar todos los filtros',
    bestDeals: 'Mejores Ofertas',
    sortedBy: 'Ordenado por',
    modifySearch: 'Modificar Búsqueda',
    bestValue: 'Mejor Valor',
    lowestPrice: 'Precio Más Bajo',
    highestRating: 'Mayor Valoración',
    byCategory: 'Por Categoría',
    mostPopular: 'Más Popular',
    bestDealsSort: 'Mejores Ofertas',
    byCompany: 'Por Empresa',
    priceInsights: 'Información de Precios',
    avgPricePerDay: 'Precio promedio/día',
    totalPrice: 'Total para {days} días',
    dealAlert: 'Alerta de Oferta',
    lowerThanAvg: '{percent}% por debajo del promedio',
    popularNow: 'Popular Ahora',
    topCompanies: 'Principales Empresas',
  },
};

// ===========================
// MAIN COMPONENT
// ===========================

function CarResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cars, setCars] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [displayCount, setDisplayCount] = useState(20);
  const [filters, setFilters] = useState<CarFiltersType>({
    priceRange: [0, 500],
    categories: [],
    transmission: [],
    fuelType: [],
    passengers: [],
    features: [],
    companies: [],
  });

  const lang: 'en' | 'pt' | 'es' = (searchParams.get('lang') as any) || 'en';
  const t = translations[lang];

  const searchData: SearchParams = {
    pickup: searchParams.get('pickup') || '',
    dropoff: searchParams.get('dropoff') || '',
    pickupDate: searchParams.get('pickupDate') || '',
    dropoffDate: searchParams.get('dropoffDate') || '',
    rentalType: searchParams.get('rentalType') || 'pickupdropoff',
  };

  const days = searchData.pickupDate && searchData.dropoffDate
    ? Math.ceil((new Date(searchData.dropoffDate).getTime() - new Date(searchData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // ===========================
  // FETCH CARS
  // ===========================

  useEffect(() => {
    const fetchCars = async () => {
      if (!searchData.pickup || !searchData.pickupDate || !searchData.dropoffDate) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Enhanced mock data with more variety
        const mockCars: CarRental[] = [
          {
            id: '1',
            name: 'Toyota Camry',
            category: 'Sedan',
            company: 'Enterprise',
            passengers: 5,
            doors: 4,
            luggage: 3,
            transmission: 'Automatic',
            fuelType: 'Gasoline',
            pricePerDay: 45,
            image: '🚗',
            features: ['AC', 'Bluetooth', 'GPS', 'USB', 'Backup Camera'],
            rating: 4.3,
            reviewCount: 342,
            location: searchData.pickup,
            available: 8,
            airConditioning: true,
            unlimited_mileage: true,
            insurance_included: false,
            instant_confirmation: true,
          },
          {
            id: '2',
            name: 'Honda CR-V',
            category: 'SUV',
            company: 'Hertz',
            passengers: 7,
            doors: 5,
            luggage: 5,
            transmission: 'Automatic',
            fuelType: 'Hybrid',
            pricePerDay: 65,
            totalPrice: 420,
            image: '🚙',
            features: ['AC', 'Bluetooth', 'GPS', 'USB', 'Apple CarPlay', 'Lane Assist'],
            rating: 4.7,
            reviewCount: 567,
            location: searchData.pickup,
            available: 3,
            airConditioning: true,
            unlimited_mileage: true,
            insurance_included: true,
            instant_confirmation: true,
          },
          {
            id: '3',
            name: 'Ford Mustang',
            category: 'Sports',
            company: 'Avis',
            passengers: 4,
            doors: 2,
            luggage: 2,
            transmission: 'Manual',
            fuelType: 'Gasoline',
            pricePerDay: 89,
            image: '🏎️',
            features: ['AC', 'Bluetooth', 'Premium Audio', 'Sport Mode', 'Leather Seats'],
            rating: 4.9,
            reviewCount: 234,
            location: searchData.pickup,
            available: 2,
            airConditioning: true,
            unlimited_mileage: false,
            insurance_included: false,
            instant_confirmation: true,
          },
          {
            id: '4',
            name: 'Tesla Model 3',
            category: 'Luxury',
            company: 'Enterprise',
            passengers: 5,
            doors: 4,
            luggage: 2,
            transmission: 'Automatic',
            fuelType: 'Electric',
            pricePerDay: 120,
            totalPrice: 790,
            image: '⚡',
            features: ['AC', 'Autopilot', 'Premium Audio', 'Supercharging', 'Heated Seats'],
            rating: 4.8,
            reviewCount: 892,
            location: searchData.pickup,
            available: 4,
            airConditioning: true,
            unlimited_mileage: true,
            insurance_included: true,
            instant_confirmation: true,
          },
          {
            id: '5',
            name: 'Chevrolet Spark',
            category: 'Economy',
            company: 'Budget',
            passengers: 4,
            doors: 4,
            luggage: 2,
            transmission: 'Automatic',
            fuelType: 'Gasoline',
            pricePerDay: 35,
            image: '🚘',
            features: ['AC', 'Bluetooth', 'USB'],
            rating: 4.1,
            reviewCount: 189,
            location: searchData.pickup,
            available: 12,
            airConditioning: true,
            unlimited_mileage: true,
            insurance_included: false,
            instant_confirmation: true,
          },
          {
            id: '6',
            name: 'Mercedes-Benz E-Class',
            category: 'Luxury',
            company: 'Hertz',
            passengers: 5,
            doors: 4,
            luggage: 3,
            transmission: 'Automatic',
            fuelType: 'Diesel',
            pricePerDay: 150,
            totalPrice: 980,
            image: '🚙',
            features: ['AC', 'Bluetooth', 'GPS', 'Leather Seats', 'Premium Audio', 'Sunroof'],
            rating: 4.9,
            reviewCount: 456,
            location: searchData.pickup,
            available: 2,
            airConditioning: true,
            unlimited_mileage: false,
            insurance_included: true,
            instant_confirmation: true,
          },
          {
            id: '7',
            name: 'Toyota RAV4',
            category: 'SUV',
            company: 'Avis',
            passengers: 5,
            doors: 5,
            luggage: 4,
            transmission: 'Automatic',
            fuelType: 'Hybrid',
            pricePerDay: 70,
            image: '🚙',
            features: ['AC', 'Bluetooth', 'GPS', 'USB', 'Apple CarPlay', 'Backup Camera'],
            rating: 4.6,
            reviewCount: 421,
            location: searchData.pickup,
            available: 6,
            airConditioning: true,
            unlimited_mileage: true,
            insurance_included: true,
            instant_confirmation: true,
          },
          {
            id: '8',
            name: 'Honda Civic',
            category: 'Compact',
            company: 'Budget',
            passengers: 5,
            doors: 4,
            luggage: 2,
            transmission: 'Automatic',
            fuelType: 'Gasoline',
            pricePerDay: 42,
            image: '🚗',
            features: ['AC', 'Bluetooth', 'USB', 'Backup Camera'],
            rating: 4.4,
            reviewCount: 312,
            location: searchData.pickup,
            available: 9,
            airConditioning: true,
            unlimited_mileage: true,
            insurance_included: false,
            instant_confirmation: true,
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 1200));
        setCars(mockCars);
      } catch (err: any) {
        console.error('Error fetching cars:', err);
        setError(err.message || 'Failed to fetch cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [searchParams]);

  // ===========================
  // FILTER LOGIC
  // ===========================

  const applyFilters = (cars: CarRental[], filters: CarFiltersType): CarRental[] => {
    return cars.filter(car => {
      // Price range
      if (car.pricePerDay < filters.priceRange[0] || car.pricePerDay > filters.priceRange[1]) {
        return false;
      }

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(car.category)) {
        return false;
      }

      // Transmission
      if (filters.transmission.length > 0 && !filters.transmission.includes(car.transmission)) {
        return false;
      }

      // Fuel type
      if (filters.fuelType.length > 0 && !filters.fuelType.includes(car.fuelType)) {
        return false;
      }

      // Passengers
      if (filters.passengers.length > 0 && !filters.passengers.some(p => car.passengers >= p)) {
        return false;
      }

      // Features (all selected features must be present)
      if (filters.features.length > 0 && !filters.features.every(f => car.features.includes(f))) {
        return false;
      }

      // Companies
      if (filters.companies.length > 0 && !filters.companies.includes(car.company)) {
        return false;
      }

      return true;
    });
  };

  // ===========================
  // SORT LOGIC
  // ===========================

  const sortCars = (cars: CarRental[], sortBy: SortOption): CarRental[] => {
    const sorted = [...cars];

    switch (sortBy) {
      case 'best':
        // Sort by rating + value
        return sorted.sort((a, b) => {
          const aValue = ((a.rating || 0) * 20) - a.pricePerDay;
          const bValue = ((b.rating || 0) * 20) - b.pricePerDay;
          return bValue - aValue;
        });
      case 'cheapest':
        return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      case 'popular':
        // Sort by review count + rating
        return sorted.sort((a, b) => {
          const aPopularity = (a.reviewCount || 0) + ((a.rating || 0) * 100);
          const bPopularity = (b.reviewCount || 0) + ((b.rating || 0) * 100);
          return bPopularity - aPopularity;
        });
      case 'deals':
        // Sort by highest savings
        return sorted.sort((a, b) => {
          const aSavings = a.totalPrice ? ((a.pricePerDay * days) - a.totalPrice) : 0;
          const bSavings = b.totalPrice ? ((b.pricePerDay * days) - b.totalPrice) : 0;
          return bSavings - aSavings;
        });
      case 'company':
        return sorted.sort((a, b) => a.company.localeCompare(b.company));
      default:
        return sorted;
    }
  };

  const filteredCars = applyFilters(cars, filters);
  const sortedCars = sortCars(filteredCars, sortBy);
  const displayedCars = sortedCars.slice(0, displayCount);

  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.transmission.length > 0 ? 1 : 0) +
    (filters.fuelType.length > 0 ? 1 : 0) +
    (filters.passengers.length > 0 ? 1 : 0) +
    (filters.features.length > 0 ? 1 : 0) +
    (filters.companies.length > 0 ? 1 : 0) +
    ((filters.priceRange[0] > 0 || filters.priceRange[1] < 500) ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 500],
      categories: [],
      transmission: [],
      fuelType: [],
      passengers: [],
      features: [],
      companies: [],
    });
  };

  // Calculate insights
  const avgPricePerDay = cars.length > 0
    ? Math.round(cars.reduce((sum, car) => sum + car.pricePerDay, 0) / cars.length)
    : 0;
  const totalAvgPrice = avgPricePerDay * days;
  const popularCars = [...cars].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 3);
  const topCompanies = [...new Set(cars.map(c => c.company))].slice(0, 3);

  // ===========================
  // LOADING STATE
  // ===========================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            🚗
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.searching}</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // ERROR STATE
  // ===========================

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md text-center border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.error}</h2>
          <p className="text-gray-600 mb-6">{t.errorDesc}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-5 h-5" />
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // ===========================
  // MAIN CONTENT
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight leading-tight">Car Rentals in {searchData.pickup}</h1>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed tracking-normal">
                {searchData.pickupDate} - {searchData.dropoffDate} · {days} day{days > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => router.push('/home-new')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50/80"
            >
              {t.modifySearch}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <div className="bg-slate-50/95 backdrop-blur-xl rounded-2xl shadow-md border border-slate-200/60 overflow-hidden">
                <CarFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  cars={cars}
                  lang={lang}
                />
              </div>
            </div>
          </aside>

          {/* Main Content - Car Results */}
          <main className="lg:col-span-8">
            {/* Sort Tabs - WORLD-CLASS HORIZONTAL PILLS */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-700 mr-0.5">Sort:</span>

                {/* Horizontal Pills Container */}
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {/* Best Value Pill */}
                  <button
                    onClick={() => setSortBy('best')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'best'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    {t.bestValue}
                  </button>

                  {/* Lowest Price Pill */}
                  <button
                    onClick={() => setSortBy('cheapest')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'cheapest'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    💰 {t.lowestPrice}
                  </button>

                  {/* Highest Rating Pill */}
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'rating'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    ⭐ {t.highestRating}
                  </button>

                  {/* By Category Pill */}
                  <button
                    onClick={() => setSortBy('category')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'category'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    📂 {t.byCategory}
                  </button>

                  {/* Most Popular Pill */}
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'popular'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    🔥 {t.mostPopular}
                  </button>

                  {/* Best Deals Pill */}
                  <button
                    onClick={() => setSortBy('deals')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'deals'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    💎 {t.bestDealsSort}
                  </button>

                  {/* By Company Pill */}
                  <button
                    onClick={() => setSortBy('company')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      sortBy === 'company'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-white/90 backdrop-blur-sm text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    🏢 {t.byCompany}
                  </button>
                </div>
              </div>

              {/* Results Count */}
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {sortedCars.length}
                </span>
                {sortedCars.length === 1 ? 'car' : 'cars'}
              </span>
            </div>

            {/* Active Filters Badge */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex items-center justify-between px-4 py-2.5 bg-blue-50/60 border border-blue-200/70 rounded-lg">
                <span className="text-sm font-medium text-blue-800 leading-relaxed">
                  {t.filtersActive.replace('{count}', activeFilterCount.toString())}
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t.clearFilters}
                </button>
              </div>
            )}

            {/* Car Cards List */}
            {sortedCars.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-slate-200">
                <Car className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.noResults}</h3>
                <p className="text-slate-600 mb-6">{t.noResultsDesc}</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {t.clearFilters}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {displayedCars.map((car, index) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CarCard
                        car={car}
                        days={days}
                        onSelect={() => console.log('Selected car:', car.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More Button */}
            {sortedCars.length > displayCount && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setDisplayCount(prev => prev + 20)}
                  className="px-8 py-4 bg-white/90 backdrop-blur-lg border-2 border-blue-200 text-blue-700 rounded-lg font-bold hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {t.loadMore} ({sortedCars.length - displayCount} more)
                </button>
              </div>
            )}
          </main>

          {/* Right Sidebar - Insights */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Price Insights */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">{t.priceInsights}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">{t.avgPricePerDay}:</span>
                    <span className="text-sm font-bold text-slate-900">${avgPricePerDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">{t.totalPrice.replace('{days}', days.toString())}:</span>
                    <span className="text-sm font-bold text-blue-600">${totalAvgPrice}</span>
                  </div>
                </div>
              </div>

              {/* Deal Alert */}
              {avgPricePerDay > 0 && displayedCars.some(c => c.pricePerDay < avgPricePerDay * 0.8) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-700" />
                    <h3 className="text-sm font-bold text-green-900">{t.dealAlert}</h3>
                  </div>
                  <p className="text-xs text-green-700">
                    {t.lowerThanAvg.replace('{percent}', '20')}
                  </p>
                </div>
              )}

              {/* Popular Right Now */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">{t.popularNow}</h3>
                </div>
                <div className="space-y-2">
                  {popularCars.map((car, index) => (
                    <div key={car.id} className="flex items-center gap-2 text-xs">
                      <span className="text-blue-600 font-bold">#{index + 1}</span>
                      <span className="text-slate-700 truncate flex-1">{car.name}</span>
                      <span className="text-slate-500">{car.reviewCount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Companies */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">{t.topCompanies}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topCompanies.map((company) => (
                    <span
                      key={company}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-200"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}

export default function CarResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-8xl animate-bounce">🚗</span>
      </div>
    }>
      <CarResultsContent />
    </Suspense>
  );
}
