'use client';

/**
 * 🚀 ULTRA-ADVANCED Flight Search System - US MARKET OPTIMIZED
 * Primary US market landing page targeting "cheap flights", "flight deals", "best flight prices"
 * Optimized for US travel patterns and competitive positioning vs Kayak/Expedia/Priceline
 */

import React, { useState, useCallback, useEffect, Suspense, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import SimpleHeroSection from '@/components/flights/SimpleHeroSection';
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightDetailsPage from '@/components/flights/FlightDetailsPage';
import FlightFilters from '@/components/flights/FlightFilters';
import SafeFlightInsights from '@/components/flights/SafeFlightInsights';
import FlightCompareBar from '@/components/flights/FlightCompareBar';
import FlightGrid from '@/components/flights/FlightGrid';
import SocialProofFeed from '@/components/flights/SocialProofFeed';
import AICopilot from '@/components/flights/AICopilot';
import TravelRewards from '@/components/gamification/TravelRewards';
import ErrorBoundary from '@/components/ErrorBoundary';
import { BenefitsSection } from '@/components/ui/benefits-section';
import { HeroSection } from '@/components/ui/hero-section';
import { ErrorMessage } from '@/components/ui/error-message';
import { FilterIcon, XIcon, CheckCircleIcon } from '@/components/Icons';

// Import new unified travel system components
import UnifiedTravelSearch, { type UnifiedSearchParams, type TravelIntent } from '@/components/travel/UnifiedTravelSearch';
import PricingDisplay, { type PriceBreakdown } from '@/components/travel/PricingDisplay';
import ConversionOptimizer from '@/components/travel/ConversionOptimizer';
import { notificationSystem } from '@/lib/realtime/notification-system';

// Import global airport databases for comprehensive search
import { BRAZIL_AIRPORTS_DATABASE } from '@/lib/airports/brazil-airports-database';
import { US_AIRPORTS_DATABASE } from '@/lib/airports/us-airports-database';
import { SOUTH_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/south-america-airports-database';
import { NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/north-central-america-airports-database';
import { ASIA_AIRPORTS_DATABASE } from '@/lib/airports/asia-airports-database';
import { EUROPE_AIRPORTS_DATABASE } from '@/lib/airports/europe-airports-database';
import { AFRICA_AIRPORTS_DATABASE } from '@/lib/airports/africa-airports-database';
import { OCEANIA_AIRPORTS_DATABASE } from '@/lib/airports/oceania-airports-database';
import { formatDate } from '@/config/locale';
import type { 
  FlightSearchFormData, 
  ProcessedFlightOffer, 
  FlightFilters as FlightFiltersType,
  FlightSortOptions,
  FlightSearchResponse,
  FlightComparison,
  PriceInsights,
  TravelClass
} from '@/types/flights';
import { convertFormToSearchParams, validateFlightSearchForm } from '@/lib/flights/validators';

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
  routeComplexity?: {
    isComplex: boolean;
    description: string;
    estimatedTime: number;
  };
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
    amenities: [],
    flexible: {
      dates: false,
      airports: false,
      refundable: false
    }
  },
  sortOptions: {
    sortBy: 'price',
    sortOrder: 'asc'
  },
  priceInsights: null,
  itemsPerPage: 20,
  currentPage: 1
};

// 🇺🇸 US MARKET SEO METADATA - Moved to layout.tsx for Next.js App Router compatibility

// 🎯 US MARKET HERO CONTENT
const US_HERO_CONTENT = {
  title: "Find Cheap Flights & Flight Deals",
  subtitle: "AI-powered search finds the best prices across 500+ airlines",
  features: [
    "✈️ Compare 500+ Airlines Instantly",
    "💰 Save Up to 60% vs Competitors", 
    "⚡ Sub-1 Second Search Results",
    "🎯 Transparent Pricing - No Hidden Fees",
    "🔒 Price Match Guarantee",
    "📱 Mobile-First Experience"
  ],
  trustSignals: [
    "2M+ Happy Travelers",
    "A+ BBB Rating", 
    "24/7 Support",
    "Secure Booking"
  ]
};

// 🏆 COMPETITIVE ADVANTAGES vs Kayak/Expedia/Priceline
const COMPETITIVE_ADVANTAGES = [
  {
    feature: "Search Speed",
    fly2any: "< 1 second",
    kayak: "3-5 seconds",
    expedia: "4-6 seconds",
    advantage: "5x Faster"
  },
  {
    feature: "Hidden Fees",
    fly2any: "All-inclusive pricing",
    kayak: "Fees added at checkout",
    expedia: "Multiple fee layers",
    advantage: "100% Transparent"
  },
  {
    feature: "AI Intelligence",
    fly2any: "GPT-4 powered",
    kayak: "Basic algorithms",
    expedia: "Legacy systems",
    advantage: "Next-gen AI"
  }
];

/**
 * Main Flights Page Component - US Market Optimized
 */
function FlightsPageContent() {
  const [state, setState] = useState<AdvancedPageState>(initialAdvancedState);
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [userLocation, setUserLocation] = useState<{country: string; region: string} | null>(null);
  const [showAICopilot, setShowAICopilot] = useState(false);
  const [socialProofVisible, setSocialProofVisible] = useState(true);
  const [showRewards, setShowRewards] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchFormRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 🎯 US MARKET OPTIMIZATION: Default to popular US routes
  const getDefaultSearchData = useCallback((): Partial<FlightSearchFormData> => {
    return {
      origin: { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
      destination: { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
      departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      passengers: { adults: 1, children: 0, infants: 0 },
      travelClass: 'ECONOMY',
      tripType: 'round-trip'
    };
  }, []);

  // Handle flight search with US market optimizations
  const handleFlightSearch = useCallback(async (searchData: FlightSearchFormData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, searchData }));
      
      // Scroll to results area for better UX
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Convert form data to API parameters
      const searchParams = convertFormToSearchParams(searchData);
      
      // Add US market specific optimizations
      searchParams.currencyCode = 'USD';
      searchParams.max = 250; // Get more results for better price comparison
      
      console.log('🔍 US Market Flight Search:', searchParams);

      // Call the flight search API
      const response = await fetch('/api/flights/search?' + new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(searchParams).map(([key, value]) => [
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          ])
        )
      }));

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const result: FlightSearchResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }

      const offers = result.data || [];
      
      setState(prev => ({
        ...prev,
        view: 'results',
        searchResults: offers,
        filteredResults: offers,
        isLoading: false,
        error: null
      }));

      // Track successful search for analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'flight_search', {
          origin: searchData.origin?.iataCode || 'UNK',
          destination: searchData.destination?.iataCode || 'UNK',
          trip_type: searchData.tripType,
          results_count: offers.length
        });
      }

    } catch (error) {
      console.error('❌ Flight search error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed. Please try again.'
      }));
    }
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FlightFiltersType) => {
    setState(prev => {
      const filtered = applyFilters(prev.searchResults || [], newFilters);
      return {
        ...prev,
        filters: newFilters,
        filteredResults: filtered,
        currentPage: 1 // Reset to first page when filters change
      };
    });
  }, []);

  // Apply filters to search results
  const applyFilters = useCallback((offers: ProcessedFlightOffer[], filters: FlightFiltersType): ProcessedFlightOffer[] => {
    return offers.filter(offer => {
      // Price range filter
      if (filters.priceRange) {
        const price = parseFloat(offer.totalPrice);
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }

      // Airlines filter
      if (filters.airlines && filters.airlines.length > 0) {
        const hasMatchingAirline = offer.validatingAirlines.some(airline => 
          filters.airlines!.includes(airline)
        );
        if (!hasMatchingAirline) return false;
      }

      // Stops filter
      if (filters.stops && Array.isArray(filters.stops) && filters.stops.length > 0) {
        const stops = offer.outbound.stops;
        const stopsMatch = filters.stops.some((stopFilter: 'direct' | '1-stop' | '2-plus-stops') => {
          if (stopFilter === 'direct') return stops === 0;
          if (stopFilter === '1-stop') return stops === 1;
          if (stopFilter === '2-plus-stops') return stops >= 2;
          return false;
        });
        if (!stopsMatch) return false;
      } else if (filters.stops && typeof filters.stops === 'number') {
        const stops = offer.outbound.stops;
        if (stops !== filters.stops) return false;
      }

      return true;
    });
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((sortOptions: FlightSortOptions) => {
    setState(prev => {
      const sorted = [...(prev.filteredResults || [])].sort((a, b) => {
        let comparison = 0;
        
        switch (sortOptions.sortBy) {
          case 'price':
            comparison = parseFloat(a.totalPrice) - parseFloat(b.totalPrice);
            break;
          case 'duration':
            comparison = a.outbound.durationMinutes - b.outbound.durationMinutes;
            break;
          case 'departure':
            comparison = new Date(a.outbound.departure.dateTime).getTime() - 
                        new Date(b.outbound.departure.dateTime).getTime();
            break;
          case 'arrival':
            comparison = new Date(a.outbound.arrival.dateTime).getTime() - 
                        new Date(b.outbound.arrival.dateTime).getTime();
            break;
          case 'stops':
            comparison = a.outbound.stops - b.outbound.stops;
            break;
          case 'aiScore':
            comparison = (b.aiScore || 0) - (a.aiScore || 0);
            break;
          default:
            comparison = 0;
        }
        
        return sortOptions.sortOrder === 'desc' ? -comparison : comparison;
      });
      
      return {
        ...prev,
        sortOptions,
        filteredResults: sorted
      };
    });
  }, []);

  // Handle flight selection
  const handleFlightSelect = useCallback((flight: ProcessedFlightOffer) => {
    setState(prev => ({
      ...prev,
      selectedFlight: flight,
      view: 'details'
    }));
  }, []);

  // Handle back navigation
  const handleBackToResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      view: 'results',
      selectedFlight: null
    }));
  }, []);

  // Handle back to search
  const handleBackToSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      view: 'search',
      searchResults: null,
      filteredResults: null,
      selectedFlight: null,
      error: null
    }));
  }, []);

  // Render current view
  const renderCurrentView = () => {
    switch (state.view) {
      case 'search':
        return (
          <div className="space-y-8">
            {/* 🚀 SIMPLIFIED HERO SECTION - Full Screen, Single-Line Form */}
            <SimpleHeroSection 
              onSearch={handleFlightSearch}
              isLoading={state.isLoading}
            />

            {/* Features Section */}
            <section className="py-16 px-4 bg-gray-50">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose Fly2Any?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {US_HERO_CONTENT.features.map((feature, index) => (
                    <div key={index} className="text-center p-6">
                      <div className="text-2xl mb-4">{feature.split(' ')[0]}</div>
                      <h3 className="font-semibold mb-2">{feature.substring(feature.indexOf(' ') + 1)}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Competitive Comparison */}
            <section className="py-16 px-4">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">How We Compare</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-4 text-left">Feature</th>
                        <th className="border border-gray-300 p-4 text-center bg-blue-50">
                          <div className="font-bold text-blue-600">Fly2Any</div>
                        </th>
                        <th className="border border-gray-300 p-4 text-center">Kayak</th>
                        <th className="border border-gray-300 p-4 text-center">Expedia</th>
                        <th className="border border-gray-300 p-4 text-center">Advantage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPETITIVE_ADVANTAGES.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-4 font-semibold">{item.feature}</td>
                          <td className="border border-gray-300 p-4 text-center bg-blue-50 font-semibold text-blue-600">
                            {item.fly2any}
                          </td>
                          <td className="border border-gray-300 p-4 text-center text-gray-600">
                            {item.kayak}
                          </td>
                          <td className="border border-gray-300 p-4 text-center text-gray-600">
                            {item.expedia}
                          </td>
                          <td className="border border-gray-300 p-4 text-center font-semibold text-green-600">
                            {item.advantage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Popular Flight Deals Grid */}
            <FlightGrid type="both" limit={6} />
          </div>
        );

      case 'results':
        return (
          <div ref={resultsRef} className="space-y-6">
            {/* Search modification bar */}
            <div className="bg-white shadow-sm border-b p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <button
                  onClick={handleBackToSearch}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Modify Search
                </button>
                <div className="text-sm text-gray-600">
                  {state.filteredResults?.length || 0} flights found
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
              <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <FlightFilters
                    filters={state.filters}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>

                {/* Results List */}
                <div className="lg:col-span-3">
                  <FlightResultsList
                    offers={state.filteredResults || []}
                    onOfferSelect={handleFlightSelect}
                    filters={state.filters}
                    onFiltersChange={handleFiltersChange}
                    sortOptions={state.sortOptions}
                    onSortChange={handleSortChange}
                    isLoading={state.isLoading}
                    comparedFlights={state.comparedFlights}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'details':
        return state.selectedFlight ? (
          <FlightDetailsPage
            flight={state.selectedFlight}
            onBooking={(flight, services) => {
              // Handle booking flow
              setState(prev => ({ ...prev, view: 'booking' }));
            }}
            onBack={handleBackToResults}
          />
        ) : null;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Something went wrong. Please try again.</p>
            <button
              onClick={handleBackToSearch}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Search
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Only show header and other elements when NOT on search view for maximum hero visibility */}
      {state.view !== 'search' && (
        <>
          <ResponsiveHeader />
          <GlobalMobileStyles />
        </>
      )}
      
      {/* Error Message */}
      {state.error && (
        <ErrorMessage
          message={state.error}
          onClose={() => setState(prev => ({ ...prev, error: null }))}
        />
      )}

      {/* Social Proof Feed - Only show on non-search views */}
      {socialProofVisible && state.view !== 'search' && <SocialProofFeed />}

      {/* AI Copilot */}
      <AICopilot 
        isVisible={showAICopilot}
        onClose={() => setShowAICopilot(false)}
        searchData={state.searchData}
      />

      {/* Travel Rewards */}
      <TravelRewards
        isVisible={showRewards}
        onClose={() => setShowRewards(false)}
        userStats={{
          level: 7,
          totalPoints: 2840,
          pointsToNextLevel: 360,
          searchesThisWeek: 23,
          totalBookings: 8,
          totalSavings: 1247,
          streakDays: 5,
          badge: 'Travel Explorer'
        }}
        achievements={[]}
      />

      {/* Main Content - No padding for search view to maximize space */}
      <main className={state.view === 'search' ? '' : 'pt-16'}>
        <ErrorBoundary>
          {renderCurrentView()}
        </ErrorBoundary>
      </main>

      <Footer />
      
      {/* Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 999
      }}>
        {/* AI Assistant Button */}
        {!showAICopilot && (
          <button
            onClick={() => setShowAICopilot(true)}
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            }}
          >
            🤖
          </button>
        )}

        {/* Travel Rewards Button */}
        <button
          onClick={() => setShowRewards(true)}
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)';
          }}
        >
          🏆
          {/* Level Badge */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#dc2626',
            color: 'white',
            fontSize: '10px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '10px',
            border: '2px solid white',
            minWidth: '20px',
            textAlign: 'center'
          }}>
            7
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * Main Flights Page with Suspense wrapper
 */
export default function FlightsPage() {
  return (
    <>
      <Head>
        <title>Cheap Flights & Flight Deals - Best Prices Guaranteed | Fly2Any</title>
        <meta name="description" content="Find the cheapest flights with our AI-powered search. Compare 500+ airlines, get instant results, and save up to 60% on domestic and international flights. Book with confidence." />
        <meta name="keywords" content="cheap flights, flight deals, best flight prices, airline tickets, domestic flights, international flights, flight search, compare flights, flight booking" />
        
        {/* US Market Geo-targeting */}
        <meta name="geo.region" content="US" />
        <meta name="geo.country" content="US" />
        <meta name="ICBM" content="39.8283, -98.5795" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Cheap Flights & Flight Deals - Best Prices Guaranteed" />
        <meta property="og:description" content="Find the cheapest flights with our AI-powered search. Save up to 60% on flights." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fly2any.com/flights" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Fly2Any" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cheap Flights & Flight Deals - Best Prices Guaranteed" />
        <meta name="twitter:description" content="Find the cheapest flights with our AI-powered search. Save up to 60% on flights." />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Fly2Any",
            "url": "https://fly2any.com",
            "description": "AI-powered flight search engine offering cheap flights and best deals",
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "39.8283",
              "longitude": "-98.5795"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "serviceType": "Flight booking and travel services"
          })
        }} />
        
        <link rel="canonical" href="https://fly2any.com/flights" />
      </Head>
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading flight search...</p>
          </div>
        </div>
      }>
        <FlightsPageContent />
      </Suspense>
    </>
  );
}