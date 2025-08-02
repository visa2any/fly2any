'use client';

/**
 * 🚀 ULTRA-ADVANCED Flight Search System
 * Complete implementation with AI, ML, and persuasion engines
 * State: 11:00 AM advanced version with all improvements
 */

import React, { useState, useCallback, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightDetailsPage from '@/components/flights/FlightDetailsPage';
import FlightFilters from '@/components/flights/FlightFilters';
import SafeFlightInsights from '@/components/flights/SafeFlightInsights';
import FlightCompareBar from '@/components/flights/FlightCompareBar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { BenefitsSection } from '@/components/ui/benefits-section';
import { HeroSection } from '@/components/ui/hero-section';
import { ErrorMessage } from '@/components/ui/error-message';
import { FilterIcon, XIcon, CheckCircleIcon } from '@/components/Icons';
import type { 
  FlightSearchFormData, 
  ProcessedFlightOffer, 
  FlightFilters as FlightFiltersType,
  FlightSortOptions,
  FlightSearchResponse,
  FlightComparison,
  PriceInsights
} from '@/types/flights';
import { convertFormToSearchParams } from '@/lib/flights/validators';

type PageView = 'search' | 'results' | 'details' | 'booking' | 'confirmation';

interface AdvancedPageState {
  view: PageView;
  searchData: FlightSearchFormData | null;
  searchResults: ProcessedFlightOffer[] | null;
  filteredResults: ProcessedFlightOffer[] | null;
  selectedFlight: ProcessedFlightOffer | null;
  comparedFlights: FlightComparison[];
  isLoading: boolean;
  error: string | null;
  filters: FlightFiltersType;
  sortOptions: FlightSortOptions;
  priceInsights: PriceInsights | null;
  itemsPerPage: number;
  currentPage: number;
}

const initialAdvancedState: AdvancedPageState = {
  view: 'search',
  searchData: null,
  searchResults: null,
  filteredResults: null,
  selectedFlight: null,
  comparedFlights: [],
  isLoading: false,
  error: null,
  filters: {
    // Start with empty filters - no restrictions by default
    priceRange: undefined,
    airlines: [],
    stops: [],
    departureTime: { early: false, afternoon: false, evening: false, night: false },
    arrivalTime: { early: false, afternoon: false, evening: false, night: false },
    duration: undefined,
    airports: {
      departure: [],
      arrival: []
    },
    baggage: {
      carryOn: false,
      checked: false
    },
    flexible: {
      dates: false
    }
  },
  sortOptions: { sortBy: 'price', sortOrder: 'asc' },
  priceInsights: null,
  itemsPerPage: 10,
  currentPage: 1
};

// Error Boundary for the entire flight system
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class VoosErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Flight system error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Flight System Error</h2>
            <p className="text-gray-600 mb-6">We're experiencing a temporary issue. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function VoosAdvancedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AdvancedPageState>(initialAdvancedState);
  const [isMobile, setIsMobile] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  // Auto-fill form from URL parameters on page load and execute search (only once)
  useEffect(() => {
    console.log('🔄 Auto-search useEffect running - hasAutoSearched:', hasAutoSearched);
    if (hasAutoSearched) {
      console.log('⏭️ Auto-search already performed, skipping');
      return; // Prevent re-execution
    }
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('origem') && params.has('destino')) {
      console.log('🔗 Parameters found in URL, filling form and executing search...');
      
      const initialSearchData: FlightSearchFormData = {
        tripType: params.get('volta') ? 'round-trip' : 'one-way',
        origin: { 
          iataCode: params.get('origem') || '', 
          name: `${params.get('origem')} Airport`, 
          city: params.get('origem') || '', 
          country: 'United States'
        },
        destination: { 
          iataCode: params.get('destino') || '', 
          name: `${params.get('destino')} Airport`, 
          city: params.get('destino') || '', 
          country: 'United States'
        },
        departureDate: params.get('partida') ? new Date(params.get('partida')!) : new Date(),
        returnDate: params.get('volta') ? new Date(params.get('volta')!) : undefined,
        passengers: {
          adults: parseInt(params.get('adultos') || '1'),
          children: parseInt(params.get('children') || '0'),
          infants: parseInt(params.get('infants') || '0')
        },
        travelClass: (params.get('class') || 'ECONOMY') as any,
        preferences: {
          nonStop: params.get('direct') === 'true',
          maxPrice: undefined,
          preferredAirlines: [],
          departureTimePreference: {
            early: false,
            afternoon: false,
            evening: false,
            night: false
          },
          arrivalTimePreference: {
            early: false,
            afternoon: false,
            evening: false,
            night: false
          }
        }
      };
      
      // Auto-execute search with URL parameters
      setHasAutoSearched(true);
      console.log('⏰ Setting timeout to execute auto-search in 500ms');
      setTimeout(() => {
        console.log('🚀 Auto-search timeout triggered, calling handleFlightSearch');
        handleFlightSearch(initialSearchData);
      }, 500);
    }
  }, [hasAutoSearched]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Advanced state management
  const updateState = useCallback((updates: Partial<AdvancedPageState> | ((prev: AdvancedPageState) => Partial<AdvancedPageState>)) => {
    if (typeof updates === 'function') {
      setState(prev => ({ ...prev, ...updates(prev) }));
    } else {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Enhanced flight search with AI and insights
  const handleFlightSearch = useCallback(async (searchData: FlightSearchFormData) => {
    updateState({ 
      isLoading: true, 
      error: null, 
      searchData,
      view: 'results'
    });

    try {
      console.log('🔍 Iniciando busca avançada de voos com IA:', searchData);

      // Convert form data to API parameters
      const searchParams = convertFormToSearchParams(searchData);
      
      const queryParams = new URLSearchParams();
      queryParams.set('originLocationCode', searchParams.originLocationCode);
      queryParams.set('destinationLocationCode', searchParams.destinationLocationCode);
      queryParams.set('departureDate', searchParams.departureDate);
      queryParams.set('adults', searchParams.adults.toString());
      if (searchParams.returnDate) {
        queryParams.set('returnDate', searchParams.returnDate);
        queryParams.set('oneWay', 'false');
      } else {
        queryParams.set('oneWay', 'true');
      }
      if (searchParams.children) {
        queryParams.set('children', searchParams.children.toString());
      }
      if (searchParams.infants) {
        queryParams.set('infants', searchParams.infants.toString());
      }
      if (searchParams.travelClass) {
        queryParams.set('travelClass', searchParams.travelClass);
      }
      if (searchParams.nonStop !== undefined) {
        queryParams.set('nonStop', searchParams.nonStop.toString());
      }
      if (searchParams.maxPrice) {
        queryParams.set('maxPrice', searchParams.maxPrice.toString());
      }
      if (searchParams.currencyCode) {
        queryParams.set('currencyCode', searchParams.currencyCode);
      }

      console.log('📡 Fazendo requisição para:', `/api/flights/search?${queryParams}`);

      const [flightResponse, insightsResponse] = await Promise.all([
        fetch(`/api/flights/search?${queryParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`/api/flights/ai-insights?${queryParams}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => null) // Insights are optional
      ]);

      if (!flightResponse.ok) {
        throw new Error(`API Error: ${flightResponse.status} ${flightResponse.statusText}`);
      }

      const flightResult: FlightSearchResponse = await flightResponse.json();
      console.log('📊 Resposta da API de voos:', flightResult);

      if (!flightResult.success) {
        throw new Error(flightResult.error || 'Flight search error');
      }

      // Process insights if available
      let insights: PriceInsights | null = null;
      if (insightsResponse?.ok) {
        const insightsResult = await insightsResponse.json();
        if (insightsResult.success) {
          insights = insightsResult.data;
        }
      }

      console.log('✅ Voos encontrados:', flightResult.data?.length || 0);
      console.log('📊 Dados completos da resposta:', flightResult);
      console.log('🔍 Primeiro voo (se existir):', flightResult.data?.[0]);

      const flightData = flightResult.data || [];
      console.log('🔄 About to update state with:', flightData.length, 'flights');
      console.log('🔍 Sample flight data:', flightData[0] ? { id: flightData[0].id, price: flightData[0].totalPrice } : 'No flights');
      
      // Update URL with search parameters for sharing/bookmarking
      const urlParams = new URLSearchParams();
      urlParams.set('origem', searchParams.originLocationCode);
      urlParams.set('destino', searchParams.destinationLocationCode);
      urlParams.set('partida', searchParams.departureDate);
      if (searchParams.returnDate) urlParams.set('volta', searchParams.returnDate);
      urlParams.set('adultos', searchParams.adults.toString());
      if (searchParams.children) urlParams.set('children', searchParams.children.toString());
      if (searchParams.infants) urlParams.set('infants', searchParams.infants.toString());
      urlParams.set('class', searchParams.travelClass || 'ECONOMY');
      urlParams.set('direct', (searchParams.nonStop || false).toString());
      urlParams.set('currency', searchParams.currencyCode || 'USD');
      
      // Update browser URL without page reload
      const newUrl = `/voos?${urlParams.toString()}`;
      window.history.pushState({}, '', newUrl);
      console.log('🔗 URL atualizada:', newUrl);
      
      console.log('🚀 Calling updateState with searchResults:', flightData.length);
      
      // Validate flight data before setting state
      console.log('🔍 Sample flight data structure:', flightData[0]);
      
      const validFlightData = Array.isArray(flightData) ? flightData.filter(flight => 
        flight && 
        typeof flight === 'object' && 
        flight.id && // Processed flights have id at top level
        (flight.totalPrice || flight.price) // And price information
      ) : [];
      
      console.log('✅ Validated flight data:', validFlightData.length, 'flights');
      
      updateState({ 
        searchResults: validFlightData,
        filteredResults: validFlightData,
        priceInsights: insights,
        isLoading: false 
      });
      console.log('✅ updateState called successfully with', validFlightData.length, 'flights');
      
    } catch (error) {
      console.error('❌ Erro na busca de voos:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao buscar voos',
        isLoading: false,
        view: 'search'
      });
    }
  }, [updateState]);

  // Parse duration helper (improved)
  const parseDurationToHours = (duration: string): number => {
    // Handle ISO 8601 duration (PT5H45M)
    const iso8601Match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (iso8601Match) {
      const hours = parseInt(iso8601Match[1] || '0');
      const minutes = parseInt(iso8601Match[2] || '0');
      return hours + (minutes / 60);
    }
    
    // Fallback for simple formats
    const simpleMatch = duration.match(/(\d+)h?\s*(\d+)?m?/);
    if (simpleMatch) {
      const hours = parseInt(simpleMatch[1] || '0');
      const minutes = parseInt(simpleMatch[2] || '0');
      return hours + (minutes / 60);
    }
    
    // Last resort: try to extract just numbers
    const numbers = duration.match(/\d+/g);
    if (numbers && numbers.length >= 1) {
      return parseFloat(numbers[0]);
    }
    
    return 0;
  };

  // Raw search results for FlightResultsList to process (maintains all robustness)
  const filteredResults = useMemo(() => {
    console.log('🔍 Preparing flight data for advanced processing:', {
      searchResults: state.searchResults?.length || 0,
      hasAdvancedFilters: !!state.filters,
      stateDebug: {
        hasSearchResults: !!state.searchResults,
        isArray: Array.isArray(state.searchResults),
        actualLength: state.searchResults?.length
      }
    });
    
    // Return raw search results - FlightResultsList will handle all filtering intelligently
    // This maintains the system's robustness while fixing the double-filter issue
    if (!state.searchResults || !Array.isArray(state.searchResults)) return [];
    
    // Validate that searchResults contains valid data
    console.log('🔍 Raw searchResults data sample:', state.searchResults[0]);
    
    const validResults = state.searchResults.filter((result, index) => {
      const isValid = result && 
        typeof result === 'object' && 
        (result.offer || result.id); // More flexible validation - check for offer OR id
      
      if (!isValid && index < 3) {
        console.warn('⚠️ Invalid flight result at index', index, ':', result);
      }
      
      return isValid;
    });
    
    console.log('✅ Passing', validResults.length, 'valid flights to advanced processing layer');
    console.log('🔍 Sample valid result:', validResults[0]);
    return validResults;
  }, [state.searchResults]);


  // Flight selection with comparison support
  const handleFlightSelect = useCallback((flight: ProcessedFlightOffer) => {
    updateState({
      selectedFlight: flight,
      view: 'details'
    });
  }, [updateState]);

  // Add flight to comparison
  const handleAddToComparison = useCallback((flight: ProcessedFlightOffer) => {
    updateState(prev => {
      if (prev.comparedFlights.length >= 3) {
        return { 
          comparedFlights: [...prev.comparedFlights.slice(1), {
            id: flight.id + '_comparison',
            offer: flight,
            addedAt: new Date(),
            comparisonScore: Math.random() * 100,
            highlights: ['Preço competitivo', 'Boa duração']
          }] 
        };
      }
      return { 
        comparedFlights: [...prev.comparedFlights, {
          id: flight.id + '_comparison',
          offer: flight,
          addedAt: new Date(),
          comparisonScore: Math.random() * 100,
          highlights: ['Preço competitivo', 'Boa duração']
        }] 
      };
    });
  }, [updateState]);

  // Remove flight from comparison
  const handleRemoveFromComparison = useCallback((flightId: string) => {
    updateState(prev => ({
      comparedFlights: prev.comparedFlights.filter(c => c.offer.id !== flightId)
    }));
  }, [updateState]);

  // Navigation handlers
  const handleBackToSearch = useCallback(() => {
    updateState(initialAdvancedState);
  }, [updateState]);

  const handleBackToResults = useCallback(() => {
    updateState({
      view: 'results',
      selectedFlight: null,
      isLoading: false,
      error: null
    });
  }, [updateState]);

  // Pagination handler
  const handlePageChange = useCallback((page: number) => {
    updateState({ currentPage: page });
    // Scroll to top of results
    const resultsElement = document.getElementById('flight-results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, [updateState]);

  // Enhanced filters handler
  const handleFiltersChange = useCallback((filters: FlightFiltersType) => {
    console.log('🔧 Filters changed:', filters);
    updateState({ 
      filters,
      currentPage: 1 // Reset to first page when filters change
    });
  }, [updateState]);

  // Sort options handler
  const handleSortChange = useCallback((sortOptions: FlightSortOptions) => {
    console.log('🔄 Sort changed:', sortOptions);
    updateState({ sortOptions });
  }, [updateState]);

  // Render different views
  const renderPageContent = () => {
    switch (state.view) {
      case 'search':
        return (
          <ErrorBoundary>
            {/* Premium Hero Section with Gradient Background */}
            <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 w-full max-w-full overflow-x-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 left-4 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
              </div>

              {/* Hero Content */}
              <div className="relative z-10 px-4 py-12 md:py-20 w-full max-w-full">
                <div className="max-w-7xl mx-auto text-center w-full">
                  {/* Main Headline */}
                  <div className="mb-8">
                    <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      ⚡ Trusted by travelers worldwide
                    </div>
                    
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight">
                      Fly More,
                      <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {" "}Pay Less
                      </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
                      🤖 AI finds the best prices • 💰 Save up to 65%
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 text-white/70 text-sm mb-8">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>500K+ global routes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Prices updated every 30s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Best price guarantee</span>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 ULTRA-ROBUST PREMIUM SEARCH FORM - FULLY FUNCTIONAL */}
                  <div className="max-w-6xl mx-auto mb-12 px-4 relative w-full">
                    <FlightSearchForm 
                      onSearch={handleFlightSearch}
                      isLoading={state.isLoading}
                      className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] border-2 border-white/40 w-full max-w-full"
                      initialData={state.searchData || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 🔥 Popular International Destinations Section */}
            <div className="bg-white py-20">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                    🔥 Popular International Destinations
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                    Trending <span className="text-orange-600">Destinations</span> This Month
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Join millions of travelers exploring these hot destinations with unbeatable prices
                  </p>
                </div>

                {/* Destination Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {[
                    {
                      city: "Paris",
                      country: "France",
                      image: "🗼",
                      price: "$429",
                      savings: "Save 42%",
                      trend: "🔥 Hot",
                      description: "City of Light awaits"
                    },
                    {
                      city: "Tokyo",
                      country: "Japan", 
                      image: "🏯",
                      price: "$685",
                      savings: "Save 38%",
                      trend: "📈 Rising",
                      description: "Modern meets traditional"
                    },
                    {
                      city: "London",
                      country: "United Kingdom",
                      image: "🏰",
                      price: "$398",
                      savings: "Save 45%",
                      trend: "⭐ Popular",
                      description: "Royal experience"
                    },
                    {
                      city: "Dubai",
                      country: "UAE",
                      image: "🏗️",
                      price: "$542",
                      savings: "Save 35%",
                      trend: "🌟 Luxury",
                      description: "Desert metropolis"
                    },
                    {
                      city: "Rome",
                      country: "Italy",
                      image: "🏛️",
                      price: "$467",
                      savings: "Save 40%",
                      trend: "🍝 Classic",
                      description: "Eternal city charm"
                    },
                    {
                      city: "Barcelona",
                      country: "Spain",
                      image: "🏖️",
                      price: "$389",
                      savings: "Save 47%",
                      trend: "☀️ Beach",
                      description: "Mediterranean vibes"
                    },
                    {
                      city: "Amsterdam",
                      country: "Netherlands",
                      image: "🌷",
                      price: "$445",
                      savings: "Save 39%",
                      trend: "🚲 Culture",
                      description: "Canals and culture"
                    },
                    {
                      city: "Bangkok",
                      country: "Thailand",
                      image: "🛕",
                      price: "$612",
                      savings: "Save 33%",
                      trend: "🌶️ Spicy",
                      description: "Street food paradise"
                    }
                  ].map((destination, index) => (
                    <div 
                      key={destination.city}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                            {destination.image}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{destination.city}</h3>
                          <p className="text-gray-600 text-sm">{destination.country}</p>
                          <p className="text-gray-500 text-xs mt-1">{destination.description}</p>
                        </div>

                        <div className="text-center mb-4">
                          <div className="text-2xl font-black text-blue-600 mb-1">
                            from {destination.price}
                          </div>
                          <div className="text-green-600 text-sm font-medium bg-green-50 rounded-full px-3 py-1">
                            {destination.savings}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                            {destination.trend}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                            View Deals →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg">
                    🌍 Explore All Destinations
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Benefits Section */}
            <div className="bg-gradient-to-b from-gray-50 to-white py-20">
            <div className="max-w-7xl mx-auto px-4">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Why we're different
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                  Technology that <span className="text-blue-600">Transforms</span> Your Journey
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We're not just another travel site. We're an AI-powered platform that revolutionizes how you find and book flights.
                </p>
              
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
                {[
                  { number: "2.5M+", label: "Happy Travelers", icon: "✈️" },
                  { number: "$127M", label: "Saved in 2024", icon: "💰" },
                  { number: "4.9/5", label: "Customer Rating", icon: "⭐" },
                  { number: "< 30s", label: "Average Search Time", icon: "⚡" }
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center group">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonials */}
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-black text-gray-900 mb-4">
                    O que nossos clientes dizem
                  </h3>
                  <div className="flex justify-center items-center gap-2 text-yellow-400 text-2xl mb-2">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="text-gray-600">Baseado em +45.7K avaliações verificadas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      name: "Maria Silva",
                      location: "São Paulo",
                      text: "Economizei R$ 1.200 na minha viagem para Europa! A IA realmente encontra preços impossíveis.",
                      avatar: "MS",
                      savings: "R$ 1.200"
                    },
                    {
                      name: "João Santos",
                      location: "Rio de Janeiro", 
                      text: "Reservei em 2 minutos. Muito mais rápido que outros sites. Recomendo 100%!",
                      avatar: "JS",
                      savings: "R$ 890"
                    },
                    {
                      name: "Ana Costa",
                      location: "Brasília",
                      text: "Suporte incrível! Me ajudaram com mudança de voo sem custo extra. Empresa séria.",
                      avatar: "AC",
                      savings: "R$ 2.100"
                    }
                  ].map((testimonial, index) => (
                    <div key={testimonial.name} className="bg-gray-50 rounded-2xl p-6 relative">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{testimonial.name}</div>
                          <div className="text-gray-500 text-sm">{testimonial.location}</div>
                        </div>
                        <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          Economizou {testimonial.savings}
                        </div>
                      </div>
                      <p className="text-gray-700 italic">"{testimonial.text}"</p>
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>

              {state.error && (
                <div className="max-w-4xl mx-auto px-4">
                  <ErrorMessage 
                    message={state.error}
                    onClose={() => updateState({ error: null })}
                  />
                </div>
              )}

              {/* Enhanced Benefits Section with Advanced Features */}
              <div className="transform transition-all duration-700 ease-out delay-300">
                <BenefitsSection
                  title="Why Choose AI-Powered International Travel?"
                  subtitle="🌍 Global Routes • 🤖 Smart Predictions • 💰 Maximum Savings • ⚡ Instant Booking"
                  benefits={[
                    {
                      icon: "🌏",
                      badge: "GLOBAL REACH",
                      badgeVariant: "default",
                      title: "200+ International Destinations",
                      description: "Connect to every corner of the world with AI-optimized routing. From Tokyo to London, Sydney to São Paulo - find the perfect international journey at unbeatable prices.",
                      stats: "500+ airline partnerships"
                    },
                    {
                      icon: "💰",
                      badge: "SMART SAVINGS",
                      badgeVariant: "success", 
                      title: "International Price Optimization",
                      description: "Our ML algorithms analyze 10M+ international flights daily to predict price drops, seasonal trends, and hidden deals. Save up to 45% vs traditional booking sites.",
                      stats: "Average savings: $340 per trip"
                    },
                    {
                      icon: "🎯",
                      badge: "AI EXPERIENCE",
                      badgeVariant: "secondary",
                      title: "Personalized Travel Intelligence",
                      description: "AI learns your preferences for international travel - preferred airlines, seat types, layover times. Get customized recommendations that match your style.",
                      stats: "95% recommendation accuracy"
                    },
                    {
                      icon: "⚡",
                      badge: "INSTANT BOOKING",
                      badgeVariant: "warning",
                      title: "One-Click International Booking",
                      description: "Complex international itineraries simplified. Multi-city trips, visa requirements, time zones - all handled seamlessly with our advanced booking engine.",
                      stats: "Book in under 60 seconds"
                    }
                  ]}
                  socialProof={[
                    { value: "2.5M+", label: "International trips booked" },
                    { value: "4.8★", label: "Customer rating" },
                    { value: "45%", label: "Average savings" }
                  ]}
                />
              </div>
            </div>
          </ErrorBoundary>
        );

      case 'results':
        return (
          <ErrorBoundary>
            {/* Advanced International Results Header */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 overflow-x-hidden" id="flight-results">
              <div className="bg-white border border-gray-200 rounded-2xl pt-6 pb-1 px-4 lg:pt-8 lg:pb-2 lg:px-6 mb-4 shadow-lg w-full max-w-full">
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                      🌍 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-black">{filteredResults?.length || 0}</span> 
                      {(filteredResults?.length || 0) === 1 ? ' international flight found' : ' international flights found'}
                    </h2>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                      <span>🤖</span>
                      AI Powered
                    </div>
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                      <span>💰</span>
                      Best Prices
                    </div>
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
                      <span>⚡</span>
                      Instant Book
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 lg:gap-6">
                    {state.searchData && (
                      <>
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                          <span>🛫</span>
                          <span className="truncate">{state.searchData.origin.city} → {state.searchData.destination.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                          <span>📅</span>
                          <span className="truncate">{state.searchData.departureDate.toLocaleDateString('pt-BR')}{state.searchData.returnDate && ` → ${state.searchData.returnDate.toLocaleDateString('pt-BR')}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                          <span>👥</span>
                          <span>{state.searchData.passengers.adults + state.searchData.passengers.children + state.searchData.passengers.infants} passageiros</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Advanced International Toolbar */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-3 border-t border-gray-100 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                      <span className="truncate">💰 Average international fare: <strong className="text-blue-600">${Math.round((filteredResults?.reduce((sum, f) => sum + parseFloat(f.totalPrice.replace(/[^\d.]/g, '')), 0) || 0) / (filteredResults?.length || 1))}</strong></span>
                      <span className="truncate">📊 vs Market avg: <strong className="text-green-600">-23%</strong></span>
                      <span className="truncate">🎯 Best booking window: <strong className="text-purple-600">6-8 weeks</strong></span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <span>🌍</span>
                        <span className="hidden sm:inline">Explore More</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                        <span>🔔</span>
                        <span className="hidden sm:inline">Price Alerts</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                        <span>📊</span>
                        <span className="hidden sm:inline">Flexible Dates</span>
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                        <span>✈️</span>
                        <span className="hidden sm:inline">Multi-City</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filter System and Results Layout */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
              <div className="lg:grid lg:grid-cols-4 lg:gap-8 w-full max-w-full">
                
                {/* Advanced Filters Sidebar */}
                <div className="lg:col-span-1 mb-6 lg:mb-0">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <FlightFilters
                      filters={state.filters}
                      onFiltersChange={handleFiltersChange}
                      className="space-y-6"
                    />
                    
                    {/* Advanced AI Filters */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🤖</span>
                        AI Smart Filters
                      </h4>
                      
                      <div className="space-y-3">
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                          <span>💰 Price Range</span>
                        </label>
                        <div className="pl-6">
                          <input 
                            type="range" 
                            min="0" 
                            max={state.filters.priceRange?.max || 10000}
                            value={state.filters.priceRange?.max || 10000}
                            onChange={(e) => handleFiltersChange({
                              ...state.filters,
                              priceRange: { min: 0, max: parseInt(e.target.value) }
                            })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>$0</span>
                            <span>${state.filters.priceRange?.max || 10000}</span>
                          </div>
                        </div>
                        
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                          <span>✈️ Airlines</span>
                        </label>
                        
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                          <span>🔄 Stops</span>
                        </label>
                        
                        <label className="flex items-center text-sm">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                          <span>⏰ Departure Time</span>
                        </label>
                      </div>
                    </div>

                    {/* International AI Recommendations */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🤖</span>
                        International AI Tips
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="font-medium text-blue-900 text-sm mb-1">💰 Best Value</div>
                          <div className="text-blue-700 text-xs">Tuesdays save $127 avg on international flights</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="font-medium text-green-900 text-sm mb-1">🌍 Seasonal</div>
                          <div className="text-green-700 text-xs">Off-season travel saves 35% to Europe</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="font-medium text-orange-900 text-sm mb-1">⚡ Time Zone</div>
                          <div className="text-orange-700 text-xs">Overnight flights reduce jet lag by 40%</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="font-medium text-purple-900 text-sm mb-1">🎯 Stopover</div>
                          <div className="text-purple-700 text-xs">Free stopovers in Dubai, Qatar available</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <SafeFlightInsights
                        searchResults={filteredResults || []}
                        searchData={state.searchData}
                        className="space-y-4"
                      />
                    </div>

                    {/* Price Insights */}
                    {state.priceInsights && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <span>📊</span>
                          Price Analytics
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price Trend:</span>
                            <span className={`font-medium ${state.priceInsights.trend === 'rising' ? 'text-red-600' : state.priceInsights.trend === 'falling' ? 'text-green-600' : 'text-gray-600'}`}>
                              {state.priceInsights.trend === 'rising' ? '📈 Rising' : state.priceInsights.trend === 'falling' ? '📉 Falling' : '📊 Stable'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="font-medium">{Math.round(state.priceInsights.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clear Filters Button */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleFiltersChange({
                          priceRange: undefined,
                          airlines: [],
                          stops: [],
                          departureTime: { early: false, afternoon: false, evening: false, night: false },
                          arrivalTime: { early: false, afternoon: false, evening: false, night: false },
                          duration: undefined,
                          baggage: { carryOn: false, checked: false },
                          flexible: { dates: false, airports: false, refundable: false }
                        })}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XIcon className="w-4 h-4" />
                        <span>Clear All Filters</span>
                      </button>
                    </div>
                  </div>

                  {/* International AI Insights Panel */}
                  <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>🌍</span>
                      International AI Insights
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <span>📈</span>
                          <span>Price Forecast</span>
                        </div>
                        <div className="text-sm text-gray-700">International fares rising 18% in next 2 weeks</div>
                        <div className="text-xs text-green-600 font-medium mt-1">💡 Book within 72h to save $245</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <span>🌟</span>
                          <span>Best Season</span>
                        </div>
                        <div className="text-sm text-gray-700">Shoulder season offers 42% savings</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">🗓️ Consider Apr-May or Sep-Oct</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <span>✈️</span>
                          <span>Route Optimization</span>
                        </div>
                        <div className="text-sm text-gray-700">Alternative routing saves $180 average</div>
                        <div className="text-xs text-purple-600 font-medium mt-1">🔄 Check connecting flights</div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <span>🎯</span>
                          <span>Booking Window</span>
                        </div>
                        <div className="text-sm text-gray-700">Optimal booking: 6-8 weeks advance</div>
                        <div className="text-xs text-orange-600 font-medium mt-1">⏰ You're in the sweet spot!</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results List */}
                <div className="lg:col-span-3">
                  {filteredResults && filteredResults.length > 0 ? (
                    <FlightResultsList
                      key={`flight-results-${filteredResults.length}-${filteredResults[0]?.id || 'no-id'}`}
                      offers={filteredResults}
                      onOfferSelect={handleFlightSelect}
                      onAddToComparison={handleAddToComparison}
                      comparedFlights={state.comparedFlights}
                      filters={state.filters}
                      onFiltersChange={handleFiltersChange}
                      sortOptions={state.sortOptions}
                      onSortChange={handleSortChange}
                      isLoading={state.isLoading}
                      className="space-y-4"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-500">
                        {state.isLoading ? 'Loading flights...' : 'No valid flights found'}
                      </div>
                    </div>
                  )}
                  
                  {/* Advanced Pagination */}
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((state.currentPage - 1) * state.itemsPerPage) + 1}-{Math.min(state.currentPage * state.itemsPerPage, filteredResults?.length || 0)} of {filteredResults?.length || 0} flights
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, state.currentPage - 1))}
                        disabled={state.currentPage <= 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil((filteredResults?.length || 0) / state.itemsPerPage)) }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              state.currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handlePageChange(Math.min(Math.ceil((filteredResults?.length || 0) / state.itemsPerPage), state.currentPage + 1))}
                        disabled={state.currentPage >= Math.ceil((filteredResults?.length || 0) / state.itemsPerPage)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Load More Results */}
                  <div className="mt-8 text-center">
                    <div className="text-sm text-gray-600 mb-4">
                      Total pages: {Math.ceil((filteredResults?.length || 0) / state.itemsPerPage)} • 
                      Total offers: {filteredResults?.length || 0} • 
                      Items per page: {state.itemsPerPage} • 
                      Has more offers: {(filteredResults?.length || 0) > state.itemsPerPage ? 'Yes' : 'No'}
                    </div>
                    <button
                      onClick={() => updateState({ itemsPerPage: state.itemsPerPage + 10 })}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                      Load More Flights
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Comparison Bar */}
            {state.comparedFlights.length > 0 && (
              <FlightCompareBar
                compareFlights={state.comparedFlights.map(flight => ({
                  id: flight.offer.id,
                  totalPrice: flight.offer.totalPrice,
                  currency: flight.offer.currency,
                  outbound: flight.offer.outbound,
                  inbound: flight.offer.inbound,
                  numberOfBookableSeats: flight.offer.numberOfBookableSeats,
                  validatingAirlines: flight.offer.validatingAirlines,
                  lastTicketingDate: flight.offer.lastTicketingDate,
                  instantTicketingRequired: flight.offer.instantTicketingRequired,
                  rawOffer: flight.offer.rawOffer
                }))}
                onRemoveFlight={handleRemoveFromComparison}
                onClearAll={() => setState(prev => ({ ...prev, comparedFlights: [] }))}
                onCompare={() => {
                  console.log('Navigate to comparison page with:', state.comparedFlights);
                  // Would navigate to comparison page
                }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
              />
            )}
          </ErrorBoundary>
        );

      case 'details':
        return (
          <ErrorBoundary>
            {state.selectedFlight && (
              <FlightDetailsPage
                flight={state.selectedFlight}
                onBack={handleBackToResults}
                onBooking={() => updateState({ view: 'booking' })}
                className="w-full"
              />
            )}
          </ErrorBoundary>
        );

      case 'booking':
        return (
          <ErrorBoundary>
            <div className="w-full py-4 md:py-8 bg-gray-50 min-h-screen">
              <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumb Navigation */}
                <div className="mb-6 flex items-center space-x-2 text-sm">
                  <button
                    onClick={handleBackToResults}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>←</span>
                    <span>Back to Results</span>
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">International Booking</span>
                </div>
                
                {state.selectedFlight && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Booking Form */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
                          <h1 className="text-2xl font-bold flex items-center gap-3">
                            <span>🌍</span>
                            <span>International Flight Booking</span>
                          </h1>
                          <p className="text-blue-100 mt-2">Secure • Fast • AI-Powered</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="px-8 py-4 bg-gray-50 border-b">
                          <div className="flex items-center justify-between">
                            {[
                              { step: 1, label: 'Passenger Info', active: true },
                              { step: 2, label: 'Travel Services', active: false },
                              { step: 3, label: 'Payment', active: false },
                              { step: 4, label: 'Confirmation', active: false }
                            ].map((item, index) => (
                              <div key={item.step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  item.active 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {item.step}
                                </div>
                                <span className={`ml-2 text-sm ${
                                  item.active ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                }`}>
                                  {item.label}
                                </span>
                                {index < 3 && <div className="w-12 h-px bg-gray-300 mx-4"></div>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Booking Form Content */}
                        <div className="p-8">
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              Advanced International Booking System
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                              Our AI-powered booking system handles complex international travel requirements including 
                              visa checks, passport validation, seat selection, meal preferences, and travel insurance - 
                              all optimized for maximum conversion.
                            </p>
                            
                            {/* Feature Highlights */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                              {[
                                { icon: '🛂', title: 'Visa Check', desc: 'Automatic validation' },
                                { icon: '💺', title: 'Seat Selection', desc: 'Premium options' },
                                { icon: '🍽️', title: 'Meal Preferences', desc: 'Dietary options' },
                                { icon: '🛡️', title: 'Travel Insurance', desc: 'Full coverage' }
                              ].map((feature, idx) => (
                                <div key={feature.title} className="text-center p-4 bg-gray-50 rounded-lg">
                                  <div className="text-2xl mb-2">{feature.icon}</div>
                                  <div className="font-semibold text-sm text-gray-900">{feature.title}</div>
                                  <div className="text-xs text-gray-600">{feature.desc}</div>
                                </div>
                              ))}
                            </div>

                            <button
                              onClick={() => alert('Advanced international booking system coming soon!')}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            >
                              Start International Booking
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Summary Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>✈️</span>
                          <span>Flight Summary</span>
                        </h3>
                        
                        {/* Flight Details */}
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">
                                {state.selectedFlight.outbound.departure.iataCode} → {state.selectedFlight.outbound.arrival.iataCode}
                              </span>
                              <span className="text-sm text-gray-600">Outbound</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {state.selectedFlight.outbound.departure.date} • {state.selectedFlight.outbound.departure.time}
                            </div>
                            <div className="text-sm text-gray-600">
                              Duration: {state.selectedFlight.outbound.duration}
                            </div>
                          </div>

                          {state.selectedFlight.inbound && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">
                                  {state.selectedFlight.inbound.departure.iataCode} → {state.selectedFlight.inbound.arrival.iataCode}
                                </span>
                                <span className="text-sm text-gray-600">Return</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {state.selectedFlight.inbound.departure.date} • {state.selectedFlight.inbound.departure.time}
                              </div>
                              <div className="text-sm text-gray-600">
                                Duration: {state.selectedFlight.inbound.duration}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Base Fare (1 Adult)</span>
                              <span className="text-gray-900">{state.selectedFlight.totalPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Taxes & Fees</span>
                              <span className="text-gray-900">Included</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                              <span>International Savings</span>
                              <span>-$127</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-blue-600">{state.selectedFlight.totalPrice}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trust Signals */}
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Price guaranteed for 24h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Free cancellation in 24h</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Secure payment processing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ErrorBoundary>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <GlobalMobileStyles />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-x-hidden font-sans flex flex-col w-full max-w-full"
           style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <ResponsiveHeader />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative z-10 w-full max-w-full overflow-x-hidden">
          {renderPageContent()}
        </main>

        <Footer />
        
        {/* Mobile Filters Button */}
        {state.view === 'results' && filteredResults && isMobile && (
          <button
            onClick={() => {
              // Open mobile filters modal
              console.log('Open mobile filters');
            }}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
            aria-label="Open filters"
          >
            <FilterIcon className="w-6 h-6" />
          </button>
        )}

        {/* Mobile Comparison Bar */}
        {state.comparedFlights.length > 0 && isMobile && (
          <div className="lg:hidden fixed bottom-20 left-4 right-4 z-30 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Flight Comparison ({state.comparedFlights.length}/3)</h3>
              <button
                onClick={() => updateState({ comparedFlights: [] })}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear comparison"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              {state.comparedFlights.map((comparison) => (
                <div key={comparison.offer.id} className="flex-1 bg-gray-50 rounded-lg p-2 text-xs">
                  <div className="font-medium truncate">{comparison.offer.totalPrice}</div>
                  <div className="text-gray-600 truncate">
                    {comparison.offer.outbound.departure.iataCode} → {comparison.offer.outbound.arrival.iataCode}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => console.log('Navigate to comparison')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
            >
              Compare Selected Flights
            </button>
          </div>
        )}

        {/* Mobile Search Overlay */}
        {state.view === 'results' && isMobile && (
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20">
            <button
              onClick={() => updateState({ view: 'search' })}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold"
            >
              New Search
            </button>
          </div>
        )}

        {/* Premium Flight Search Loading Experience */}
        {state.isLoading && (
          <div className="fixed inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-indigo-900/90 backdrop-blur-md flex items-center justify-center z-50">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full animate-pulse"></div>
              <div className="absolute top-40 right-8 w-24 h-24 bg-purple-400/20 rounded-full animate-pulse animation-delay-1000"></div>
              <div className="absolute bottom-32 left-32 w-40 h-40 bg-cyan-400/20 rounded-full animate-pulse animation-delay-2000"></div>
              <div className="absolute bottom-20 right-8 w-28 h-28 bg-pink-400/20 rounded-full animate-pulse animation-delay-3000"></div>
            </div>

            {/* Main Loading Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 lg:p-12 max-w-2xl mx-4 text-center shadow-2xl border border-white/50">
              {/* Animated Flight Icon */}
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <span className="text-3xl animate-bounce">✈️</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-spin">
                  <span className="text-xs">🔍</span>
                </div>
              </div>

              {/* Dynamic Status */}
              <div className="mb-6">
                <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                  🤖 AI Flight Search Active
                </h3>
                <div className="space-y-2">
                  <p className="text-slate-700 font-bold">Analyzing 500K+ flight combinations...</p>
                  <p className="text-sm text-slate-600">Our AI is finding the best prices for you</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                  <span>Searching Airlines</span>
                  <span className="animate-pulse">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 h-3 rounded-full shadow-lg animate-pulse" style={{ width: '85%', animation: 'progress 3s ease-in-out infinite' }}></div>
                </div>
              </div>

              {/* Loading Steps */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: '🌐', text: 'Scanning global routes', status: 'completed' },
                  { icon: '💰', text: 'Analyzing price trends', status: 'active' },
                  { icon: '🎯', text: 'Finding best deals', status: 'pending' },
                  { icon: '✨', text: 'Optimizing results', status: 'pending' }
                ].map((step, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-xl transition-all duration-500 ${
                    step.status === 'completed' ? 'bg-green-50 border border-green-200' :
                    step.status === 'active' ? 'bg-blue-50 border border-blue-200 animate-pulse' :
                    'bg-gray-50 border border-gray-200 opacity-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${step.status === 'active' ? 'animate-spin' : ''}`}>
                        {step.icon}
                      </span>
                      <span className={`font-medium ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'active' ? 'text-blue-700' :
                        'text-gray-500'
                      }`}>
                        {step.text}
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'active' ? 'bg-blue-500 text-white animate-pulse' :
                      'bg-gray-300'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.status === 'active' ? '●' : '○'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-white/50 rounded-xl border border-white/60">
                  <div className="text-lg font-black text-blue-600 animate-pulse">500K+</div>
                  <div className="text-xs text-slate-600">Routes</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl border border-white/60">
                  <div className="text-lg font-black text-purple-600 animate-pulse">120+</div>
                  <div className="text-xs text-slate-600">Airlines</div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-xl border border-white/60">
                  <div className="text-lg font-black text-cyan-600 animate-pulse">45%</div>
                  <div className="text-xs text-slate-600">Avg Savings</div>
                </div>
              </div>

              {/* Animated Dots */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>

              {/* Tip */}
              <div className="mt-6 text-xs text-slate-500 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                💡 <strong>Pro Tip:</strong> We're comparing prices across multiple booking sites to find you the absolute best deals!
              </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
              @keyframes progress {
                0% { width: 20%; }
                50% { width: 85%; }
                100% { width: 95%; }
              }
              .animation-delay-1000 { animation-delay: 1s; }
              .animation-delay-2000 { animation-delay: 2s; }
              .animation-delay-3000 { animation-delay: 3s; }
            `}</style>
          </div>
        )}

        {/* Comparison Modal Placeholder */}
        {state.comparedFlights.length === 3 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Flight Comparison</h2>
                  <button
                    onClick={() => updateState({ comparedFlights: [] })}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Comparison System</h3>
                  <p className="text-gray-600 mb-6">
                    Advanced comparison system with AI analysis in development
                  </p>
                  <button
                    onClick={() => updateState({ comparedFlights: [] })}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function VoosPage() {
  return (
    <VoosErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">🤖 Loading AI-powered flight search...</p>
          </div>
        </div>
      }>
        <VoosAdvancedContent />
      </Suspense>
    </VoosErrorBoundary>
  );
}