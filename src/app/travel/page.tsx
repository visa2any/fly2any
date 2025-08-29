'use client';

/**
 * 🌟 PREMIUM TRAVEL EXPERIENCE
 * World-class travel booking interface matching industry leaders
 * Expedia/Booking.com/Kayak level UX with advanced features
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Layout Components
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';

// Premium Components
import PremiumTravelSearch from '@/components/travel/PremiumTravelSearch';
import PricingDisplay from '@/components/travel/PricingDisplay';

// Icons - Premium icon set
import { 
  Search, MapPin, Calendar, Users, Plane, Building, Car, Star, Shield, CheckCircle, 
  ArrowRight, Filter, SortDesc, Heart, Share2, ChevronDown, Clock, Award,
  Wifi, Coffee, Utensils, Dumbbell, Waves, Mountain, Camera, Gift,
  TrendingUp, Globe, Zap, Smartphone, CreditCard, Lock, Phone
} from 'lucide-react';

// ========================================
// SIMPLE TRAVEL PAGE COMPONENT
// ========================================

const PremiumTravelPage: React.FC<{}> = () => {
  const router = useRouter();

  // ========================================
  // PREMIUM STATE MANAGEMENT
  // ========================================

  const [currentStep, setCurrentStep] = useState<'search' | 'results' | 'details' | 'booking'>('search');
  const [searchParams, setSearchParams] = useState({
    query: '',
    destination: '',
    dates: { checkin: '', checkout: '' },
    travelers: { adults: 2, children: 0, rooms: 1 },
    services: { flights: true, hotels: true, cars: false, activities: false },
    preferences: {
      budget: { min: 0, max: 5000 },
      starRating: [3, 4, 5],
      hotelAmenities: [],
      flightClass: 'economy',
      sortBy: 'recommended'
    }
  });

  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedBundle, setSelectedBundle] = useState<any>(null);

  // Advanced UI state
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ========================================
  // SEARCH HANDLING
  // ========================================

  // ========================================
  // PREMIUM SEARCH HANDLER
  // ========================================
  
  const handleUnifiedSearch = useCallback(async (params: any) => {
    setIsSearching(true);
    setSearchError(null);
    setCurrentStep('results');

    try {
      console.log('🔍 Premium search initiated:', params);

      // Semantic validation and transformation to API schema format
      const apiRequest = {
        query: String(params.query || '').trim(),
        destination: {
          code: String(params.destination?.code || 'UNK').toUpperCase(),
          name: String(params.destination?.name || params.query || 'Unknown'),
          coordinates: {
            lat: Number(params.destination?.coordinates?.lat || 0),
            lng: Number(params.destination?.coordinates?.lng || 0)
          }
        },
        dates: {
          departure: params.dates?.departure || new Date().toISOString().split('T')[0],
          return: params.dates?.return || undefined,
          flexible: Boolean(params.dates?.flexible)
        },
        travelers: {
          adults: Math.max(1, Math.min(20, Number(params.travelers?.adults || 2))),
          children: Math.max(0, Math.min(10, Number(params.travelers?.children || 0))),
          infants: Math.max(0, Math.min(5, Number(params.travelers?.infants || 0)))
        },
        services: {
          flights: Boolean(params.services?.flights ?? true),
          hotels: Boolean(params.services?.hotels ?? false),
          cars: Boolean(params.services?.cars ?? false),
          activities: Boolean(params.services?.activities ?? false)
        },
        preferences: {
          budget: {
            min: Math.max(0, Number(params.filters?.budget?.min || 0)),
            max: Math.max(100, Number(params.filters?.budget?.max || 5000)),
            currency: String(params.filters?.budget?.currency || 'USD').toUpperCase().slice(0, 3)
          },
          travelClass: ['economy', 'premium', 'business', 'first'].includes(params.filters?.flightClass) 
            ? params.filters.flightClass 
            : 'economy',
          accommodationType: ['budget', 'mid-range', 'luxury'].includes(params.filters?.accommodationType) 
            ? params.filters.accommodationType 
            : 'mid-range',
          carType: 'economy'
        },
        options: {
          generateBundles: true,
          maxResults: Math.max(1, Math.min(50, Number(params.options?.maxResults || 10))),
          sortBy: ['price', 'duration', 'rating', 'relevance'].includes(params.filters?.sortBy) 
            ? params.filters.sortBy 
            : 'relevance'
        }
      };

      // Semantic validation checks
      if (!apiRequest.query.trim()) {
        throw new Error('Search query is required');
      }
      
      if (!apiRequest.destination.name || apiRequest.destination.name === 'Unknown') {
        throw new Error('Valid destination is required');
      }

      console.log('🔄 Transformed API request:', apiRequest);

      const response = await fetch('/api/travel/unified-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        // Enhanced error handling - get detailed API response
        let errorDetails = `HTTP ${response.status} - ${response.statusText}`;
        try {
          const errorBody = await response.json();
          console.error('🚨 API Error Details:', errorBody);
          errorDetails = errorBody.error?.message || errorBody.message || errorDetails;
          
          // Log validation details if available
          if (errorBody.error?.details) {
            console.error('📋 Validation Errors:', errorBody.error.details);
            errorDetails += `\n\nValidation Issues:\n${JSON.stringify(errorBody.error.details, null, 2)}`;
          }
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          const errorText = await response.text();
          console.error('📄 Raw error response:', errorText);
          errorDetails += `\n\nRaw response: ${errorText}`;
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('🚨 API returned unsuccessful response:', data);
        throw new Error(data.error?.message || data.message || 'Search failed');
      }

      // Enhanced result processing for premium UX
      const enhancedResults = {
        searchId: data.data.searchId,
        totalResults: data.data.meta.totalResults,
        processingTime: data.data.searchTime,
        bundles: data.data.bundles || [],
        flights: (data.data.services.flights?.data || []).map((flight: any) => {
          // Semantic data transformation with error boundaries
          try {
            const firstItinerary = flight.itineraries?.[0];
            const firstSegment = firstItinerary?.segments?.[0];
            const lastSegment = firstItinerary?.segments?.slice(-1)?.[0];
            
            return {
              id: flight.id || `flight-${Math.random().toString(36).substr(2, 9)}`,
              airline: flight.airline || flight.validatingAirlineCodes?.[0] || 'Unknown',
              price: parseFloat(flight.totalPrice || flight.price?.total || '0'),
              currency: flight.currency || flight.price?.currency || 'USD',
              duration: firstItinerary?.duration || 'Unknown',
              stops: Math.max(0, (firstItinerary?.segments?.length || 1) - 1),
              departure: {
                time: firstSegment?.departure?.at || '',
                airport: firstSegment?.departure?.iataCode || '',
                terminal: firstSegment?.departure?.terminal || ''
              },
              arrival: {
                time: lastSegment?.arrival?.at || '',
                airport: lastSegment?.arrival?.iataCode || '',
                terminal: lastSegment?.arrival?.terminal || ''
              },
              aircraft: firstSegment?.aircraft?.code || '',
              bookingClass: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || 'Y',
              baggage: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags || {},
              isRefundable: flight.policyDetails?.refundable || false,
              lastTicketingDate: flight.lastTicketingDate || null
            };
          } catch (transformError) {
            console.warn('Flight data transformation error:', transformError, flight);
            return {
              id: `error-flight-${Math.random().toString(36).substr(2, 9)}`,
              airline: 'Data Error',
              price: 0,
              currency: 'USD',
              duration: 'Unknown',
              stops: 0,
              departure: { time: '', airport: '', terminal: '' },
              arrival: { time: '', airport: '', terminal: '' },
              aircraft: '',
              bookingClass: 'Y',
              baggage: {},
              isRefundable: false,
              lastTicketingDate: null
            };
          }
        }),
        hotels: (data.data.services.hotels?.data || []).map((hotel: any) => {
          // Semantic hotel data transformation with error boundaries
          try {
            return {
              id: hotel.id || `hotel-${Math.random().toString(36).substr(2, 9)}`,
              name: hotel.name || 'Unknown Hotel',
              starRating: Math.max(0, Math.min(5, hotel.starRating || 0)),
              guestRating: Math.max(0, Math.min(10, hotel.guestRating || 0)),
              reviewCount: Math.max(0, hotel.reviewCount || 0),
              price: parseFloat(hotel.lowestRate?.amount || hotel.price || '0'),
              currency: hotel.lowestRate?.currency || hotel.currency || 'USD',
              location: {
                address: hotel.location?.address?.street || '',
                city: hotel.location?.address?.city || hotel.city || '',
                country: hotel.location?.address?.country || hotel.country || '',
                coordinates: hotel.location?.coordinates || { latitude: 0, longitude: 0 }
              },
              images: Array.isArray(hotel.images) ? hotel.images : [],
              amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
              policies: hotel.policies || {},
              distance: parseFloat(hotel.location?.landmarks?.[0]?.distance || '0'),
              isRefundable: Boolean(hotel.rates?.[0]?.isRefundable || hotel.isRefundable),
              freeCancellation: Boolean(hotel.rates?.[0]?.isFreeCancellation || hotel.freeCancellation)
            };
          } catch (transformError) {
            console.warn('Hotel data transformation error:', transformError, hotel);
            return {
              id: `error-hotel-${Math.random().toString(36).substr(2, 9)}`,
              name: 'Data Error',
              starRating: 0,
              guestRating: 0,
              reviewCount: 0,
              price: 0,
              currency: 'USD',
              location: {
                address: '',
                city: '',
                country: '',
                coordinates: { latitude: 0, longitude: 0 }
              },
              images: [],
              amenities: [],
              policies: {},
              distance: 0,
              isRefundable: false,
              freeCancellation: false
            };
          }
        }),
        recommendations: data.data.recommendations || []
      };

      setSearchResults(enhancedResults);
      
      // Scroll to results on mobile
      if (window.innerWidth < 768 && searchRef.current) {
        searchRef.current.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (error) {
      console.error('Premium search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed. Please try again.');
      setCurrentStep('search');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setSearchParams((prev: any) => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ========================================
  // RENDER COMPONENT
  // ========================================

  // ========================================
  // PREMIUM UX COMPONENTS
  // ========================================

  const PremiumLoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
      <div className="ml-4">
        <div className="text-lg font-semibold text-gray-900">Searching worldwide...</div>
        <div className="text-sm text-gray-500">Finding the best deals for you</div>
      </div>
    </div>
  );

  const PremiumHeroSection = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-4 py-16 md:py-24">
        <div className="max-w-7xl mx-auto text-center">
          {/* Premium Trust Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20 mb-6"
          >
            <Award className="w-4 h-4 mr-2" />
            Trusted by 2M+ travelers worldwide
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Your Dream Trip
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Discover, compare, and book flights, hotels, and experiences with confidence. 
            Get personalized recommendations powered by AI.
          </motion.p>

          {/* Premium Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <div className="flex items-center text-white/80">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center text-white/80">
              <Globe className="w-5 h-5 mr-2 text-blue-400" />
              <span>500+ Airlines</span>
            </div>
            <div className="flex items-center text-white/80">
              <Building className="w-5 h-5 mr-2 text-purple-400" />
              <span>1M+ Hotels</span>
            </div>
            <div className="flex items-center text-white/80">
              <Phone className="w-5 h-5 mr-2 text-pink-400" />
              <span>24/7 Support</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const PremiumSearchInterface = () => (
    <div className="relative -mt-16 z-20 px-4 mb-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm p-8"
          ref={searchRef}
        >
          <PremiumTravelSearch 
            onSearch={handleUnifiedSearch}
            className="premium-search-interface"
            placeholder="Where would you like to go? Try 'Beach vacation in Miami' or 'Business trip to São Paulo'"
            showAdvancedFilters={true}
            enablePriceAlerts={true}
          />
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      <GlobalMobileStyles />
      <div className="min-h-screen bg-gray-50">
        <ResponsiveHeader />
        
        {currentStep === 'search' && (
          <>
            <PremiumHeroSection />
            <PremiumSearchInterface />
            
            {/* Premium Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Why 2M+ Travelers Choose Us
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the difference with our award-winning platform
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Search</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our intelligent algorithm finds the perfect combination of flights, hotels, and activities 
                    tailored to your preferences and budget.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Price Guarantee</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Found a better price elsewhere? We'll match it and give you an extra 5% off. 
                    Your satisfaction is our guarantee.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Trusted</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Bank-level security, instant confirmations, and 24/7 multilingual support. 
                    Travel with complete peace of mind.
                  </p>
                </motion.div>
              </div>
            </div>
          </>
        )}

        {/* Premium Results View */}
        {currentStep === 'results' && (
          <div className="bg-white min-h-screen">
            {/* Sticky Search Bar */}
            <div className={`sticky top-0 z-50 bg-white border-b transition-shadow ${
              isScrolled ? 'shadow-lg' : ''
            }`}>
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep('search')}
                    className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                    <span>Modify Search</span>
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Sort by:</span>
                      <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500">
                        <option>Recommended</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Duration</option>
                        <option>Rating</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span>Filters</span>
                    </button>

                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                      >
                        <div className="w-4 h-4 flex flex-col space-y-1">
                          <div className="bg-current h-0.5 w-full"></div>
                          <div className="bg-current h-0.5 w-full"></div>
                          <div className="bg-current h-0.5 w-full"></div>
                        </div>
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                      >
                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                          <div className="bg-current"></div>
                          <div className="bg-current"></div>
                          <div className="bg-current"></div>
                          <div className="bg-current"></div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-20">
                <PremiumLoadingSpinner />
              </div>
            ) : searchError ? (
              <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-red-800 mb-2">Search Error</h3>
                  <p className="text-red-600 mb-4">{searchError}</p>
                  <button
                    onClick={() => setCurrentStep('search')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : searchResults ? (
              <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Results Summary */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Travel Options
                  </h2>
                  <p className="text-gray-600">
                    Found {searchResults.totalResults} options in {searchResults.processingTime}ms
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Filters Sidebar */}
                  {showFilters && (
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                        {/* Filter content would go here */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price Range
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="range"
                                min="0"
                                max="5000"
                                className="flex-1"
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>$0</span>
                              <span>$5000+</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results Grid */}
                  <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                    {searchResults.bundles && searchResults.bundles.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Gift className="w-5 h-5 mr-2 text-purple-600" />
                          Recommended Packages
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {searchResults.bundles.slice(0, 4).map((bundle: any, index: number) => (
                            <motion.div
                              key={bundle.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => setSelectedBundle(bundle)}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-purple-600">
                                    ${bundle.pricing.totalBundlePrice}
                                  </div>
                                  <div className="text-sm text-green-600">
                                    Save ${bundle.pricing.totalSavings}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-4">{bundle.description}</p>
                              <div className="flex items-center space-x-2">
                                {bundle.components.map((component: any) => (
                                  <span
                                    key={component.type}
                                    className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700"
                                  >
                                    {component.type === 'flight' && <Plane className="w-3 h-3 mr-1" />}
                                    {component.type === 'hotel' && <Building className="w-3 h-3 mr-1" />}
                                    {component.type === 'car' && <Car className="w-3 h-3 mr-1" />}
                                    {component.type}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Results */}
                    <div className="space-y-6">
                      {searchResults.flights && searchResults.flights.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Plane className="w-5 h-5 mr-2 text-blue-600" />
                            Flights ({searchResults.flights.length})
                          </h3>
                          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                            {searchResults.flights.slice(0, 8).map((flight: any, index: number) => (
                              <motion.div
                                key={flight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">{flight.airline}</div>
                                    <div className="text-sm text-gray-500">
                                      {flight.departure.airport} → {flight.arrival.airport}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {flight.duration} • {flight.stops === 0 ? 'Direct' : `${flight.stops} stops`}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">
                                      ${flight.price}
                                    </div>
                                    <div className="text-sm text-gray-500">{flight.currency}</div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setFavoriteItems((prev: Set<string>) => {
                                          const newSet = new Set(prev);
                                          if (newSet.has(flight.id)) {
                                            newSet.delete(flight.id);
                                          } else {
                                            newSet.add(flight.id);
                                          }
                                          return newSet;
                                        });
                                      }}
                                      className={`p-2 rounded-full transition-colors ${
                                        favoriteItems.has(flight.id)
                                          ? 'bg-red-100 text-red-600'
                                          : 'bg-gray-100 text-gray-400 hover:text-red-600'
                                      }`}
                                    >
                                      <Heart className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    Select Flight
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.hotels && searchResults.hotels.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-green-600" />
                            Hotels ({searchResults.hotels.length})
                          </h3>
                          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                            {searchResults.hotels.slice(0, 8).map((hotel: any, index: number) => (
                              <motion.div
                                key={hotel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
                              >
                                {hotel.images && hotel.images.length > 0 && (
                                  <div className="h-48 bg-gray-200 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    <div className="absolute top-4 right-4">
                                      <button
                                        onClick={(e: React.MouseEvent) => {
                                          e.stopPropagation();
                                          setFavoriteItems((prev: Set<string>) => {
                                            const newSet = new Set(prev);
                                            if (newSet.has(hotel.id)) {
                                              newSet.delete(hotel.id);
                                            } else {
                                              newSet.add(hotel.id);
                                            }
                                            return newSet;
                                          });
                                        }}
                                        className={`p-2 rounded-full transition-colors backdrop-blur-sm ${
                                          favoriteItems.has(hotel.id)
                                            ? 'bg-red-100/90 text-red-600'
                                            : 'bg-white/90 text-gray-400 hover:text-red-600'
                                        }`}
                                      >
                                        <Heart className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="p-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-1">{hotel.name}</h4>
                                      <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex items-center">
                                          {[...Array(hotel.starRating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                          ))}
                                        </div>
                                        {hotel.guestRating > 0 && (
                                          <span className="text-sm text-gray-600">
                                            {hotel.guestRating}/10 ({hotel.reviewCount} reviews)
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {hotel.location.city}, {hotel.location.country}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-green-600">
                                        ${hotel.price}
                                      </div>
                                      <div className="text-sm text-gray-500">per night</div>
                                    </div>
                                  </div>

                                  {hotel.amenities && hotel.amenities.length > 0 && (
                                    <div className="flex items-center space-x-2 mb-4">
                                      {hotel.amenities.slice(0, 4).map((amenity: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                                        >
                                          {amenity.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                      {hotel.freeCancellation && (
                                        <span className="text-green-600">Free Cancellation</span>
                                      )}
                                      {hotel.isRefundable && (
                                        <span className="text-blue-600">Refundable</span>
                                      )}
                                    </div>
                                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                      Select Hotel
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default PremiumTravelPage;