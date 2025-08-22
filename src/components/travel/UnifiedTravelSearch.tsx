'use client';

/**
 * 🎯 UNIFIED TRAVEL SEARCH HUB
 * Revolutionary search component that handles ANY travel intent:
 * - Single items (flights only, hotels only, cars only)  
 * - Complete packages (flights + hotels + cars + activities)
 * - Smart intent detection from natural language
 * - Adaptive interface based on user preferences
 * - Mobile-first design for maximum conversion
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Users, Car, Plane, Building, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface TravelIntent {
  type: 'flights' | 'hotels' | 'cars' | 'activities' | 'package' | 'unknown';
  confidence: number;
  detected_keywords: string[];
  suggested_services: ('flights' | 'hotels' | 'cars' | 'activities')[];
}

export interface UnifiedSearchParams {
  query: string;
  origin?: {
    code: string;
    name: string;
    type: 'airport' | 'city';
  };
  destination?: {
    code: string;
    name: string;
    type: 'airport' | 'city';
  };
  departureDate?: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelClass?: 'economy' | 'premium' | 'business' | 'first';
  services: {
    flights: boolean;
    hotels: boolean;
    cars: boolean;
    activities: boolean;
  };
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  preferences?: {
    flexible_dates: boolean;
    direct_flights: boolean;
    hotel_rating: number;
    car_type: string;
  };
}

// ========================================
// UNIFIED TRAVEL SEARCH COMPONENT  
// ========================================

interface UnifiedTravelSearchProps {
  onSearch: (params: UnifiedSearchParams) => void;
  onIntentChange?: (intent: TravelIntent) => void;
  className?: string;
  placeholder?: string;
  showQuickFilters?: boolean;
  enableVoiceSearch?: boolean;
}

const UnifiedTravelSearch: React.FC<UnifiedTravelSearchProps> = ({
  onSearch,
  onIntentChange,
  className = '',
  placeholder = "Where would you like to go? Try 'Miami weekend' or 'flight to Brazil'",
  showQuickFilters = true,
  enableVoiceSearch = false
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<TravelIntent | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedServices, setSelectedServices] = useState({
    flights: true,
    hotels: false,
    cars: false,
    activities: false
  });
  
  const [searchParams, setSearchParams] = useState<UnifiedSearchParams>({
    query: '',
    passengers: { adults: 2, children: 0, infants: 0 },
    services: selectedServices
  });
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // SMART INTENT DETECTION
  // ========================================
  
  const detectTravelIntent = useCallback(async (query: string): Promise<TravelIntent> => {
    if (!query.trim()) {
      return { type: 'unknown', confidence: 0, detected_keywords: [], suggested_services: [] };
    }

    // Keywords for different travel services
    const patterns = {
      flights: /\\b(flight|fly|plane|airline|ticket|departure|arrival|voo|passagem)\\b/i,
      hotels: /\\b(hotel|accommodation|stay|room|resort|lodge|hostel|hospedagem)\\b/i,
      cars: /\\b(car|rental|drive|vehicle|auto|carro|aluguel)\\b/i,
      activities: /\\b(activity|tour|experience|ticket|attraction|passeio|atividade)\\b/i,
      package: /\\b(vacation|trip|package|getaway|weekend|holiday|viagem|pacote|férias)\\b/i,
      destinations: /\\b(brazil|miami|new york|são paulo|rio|bahia|fortaleza|recife)\\b/i,
      timeframes: /\\b(weekend|week|month|tomorrow|next|hoje|amanhã)\\b/i
    };

    const detected_keywords: string[] = [];
    const suggested_services: ('flights' | 'hotels' | 'cars' | 'activities')[] = [];
    let primaryType: TravelIntent['type'] = 'unknown';
    let confidence = 0;

    // Analyze query for patterns
    Object.entries(patterns).forEach(([key, pattern]) => {
      const matches = query.match(pattern);
      if (matches) {
        detected_keywords.push(...matches);
        if (key === 'package' || (key === 'destinations' && patterns.timeframes.test(query))) {
          primaryType = 'package';
          confidence = Math.max(confidence, 0.8);
          suggested_services.push('flights', 'hotels');
        } else if (['flights', 'hotels', 'cars', 'activities'].includes(key)) {
          if (primaryType === 'unknown') {
            primaryType = key as 'flights' | 'hotels' | 'cars' | 'activities';
            confidence = 0.7;
          }
          if (['flights', 'hotels', 'cars', 'activities'].includes(key)) {
            suggested_services.push(key as 'flights' | 'hotels' | 'cars' | 'activities');
          }
        }
      }
    });

    // Smart suggestions based on intent (using type guards for semantic correctness)
    const isFlightRelated = (type: TravelIntent['type']): boolean => 
      type === 'flights' || type === 'package';
    
    if (isFlightRelated(primaryType)) {
      suggested_services.push('hotels');
    }
    if (patterns.destinations.test(query) && patterns.timeframes.test(query)) {
      suggested_services.push('cars', 'activities');
      confidence = Math.max(confidence, 0.9);
    }

    // Remove duplicates
    const uniqueSuggestions = [...new Set(suggested_services)];

    return {
      type: primaryType,
      confidence,
      detected_keywords: [...new Set(detected_keywords)],
      suggested_services: uniqueSuggestions
    };
  }, []);

  // ========================================
  // QUERY ANALYSIS & SUGGESTIONS
  // ========================================
  
  const analyzeQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Detect travel intent
      const intent = await detectTravelIntent(query);
      setCurrentIntent(intent);
      onIntentChange?.(intent);
      
      // Auto-suggest services based on intent
      if (intent.confidence > 0.6) {
        const newServices = { ...selectedServices };
        intent.suggested_services.forEach(service => {
          newServices[service] = true;
        });
        setSelectedServices(newServices);
      }
      
      // Generate location suggestions (mock for now - integrate with real API)
      const locationSuggestions = await generateLocationSuggestions(query);
      setSuggestions(locationSuggestions);
      
    } catch (error) {
      console.error('Query analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedServices, onIntentChange]);

  // Debounced query analysis
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (searchQuery.length > 2) {
        analyzeQuery(searchQuery);
      }
    }, 500);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, analyzeQuery]);

  // ========================================
  // LOCATION SUGGESTIONS
  // ========================================
  
  const generateLocationSuggestions = async (query: string): Promise<string[]> => {
    // Popular destinations based on query
    const destinations = [
      'São Paulo, Brazil',
      'Rio de Janeiro, Brazil', 
      'Miami, Florida',
      'New York, New York',
      'Orlando, Florida',
      'Salvador, Bahia',
      'Fortaleza, Ceará',
      'Recife, Pernambuco',
      'Brasília, Brazil',
      'Belo Horizonte, Brazil'
    ];
    
    return destinations.filter(dest => 
      dest.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  // ========================================
  // VOICE SEARCH (if enabled) - Simplified with better error handling
  // ========================================
  
  const startVoiceSearch = useCallback(() => {
    if (!enableVoiceSearch) return;
    
    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported in this browser');
      return;
    }
    
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.start();
    } catch (error) {
      console.error('Voice search initialization failed:', error);
      setIsListening(false);
    }
  }, [enableVoiceSearch]);

  // ========================================
  // SEARCH EXECUTION
  // ========================================
  
  const handleSearch = useCallback(() => {
    const params: UnifiedSearchParams = {
      ...searchParams,
      query: searchQuery,
      services: selectedServices
    };
    
    // Track search event for analytics (optional, if gtag is available)
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'search', {
          event_category: 'travel',
          event_label: currentIntent?.type || 'unknown',
          value: currentIntent?.confidence || 0
        });
      }
    } catch (error) {
      console.log('Analytics tracking not available:', error);
    }
    
    onSearch(params);
  }, [searchParams, searchQuery, selectedServices, currentIntent, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ========================================
  // QUICK FILTERS
  // ========================================
  
  const quickFilters = [
    { label: 'Weekend Getaway', icon: '🏖️', query: 'weekend getaway' },
    { label: 'Business Trip', icon: '💼', query: 'business trip one way' },
    { label: 'Family Vacation', icon: '👨‍👩‍👧‍👦', query: 'family vacation package' },
    { label: 'Romantic Trip', icon: '❤️', query: 'romantic getaway' },
    { label: 'Adventure Travel', icon: '🎒', query: 'adventure activities' }
  ];

  // ========================================
  // RENDER COMPONENT
  // ========================================
  
  return (
    <motion.div 
      className={`unified-travel-search ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Search Container */}
      <div className="search-container bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Smart Search Bar */}
        <div className="search-bar-wrapper relative">
          <div className="flex items-center p-4 md:p-6">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full text-base md:text-lg py-3 md:py-4 px-4 md:px-6 pr-12 md:pr-16 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400 min-h-[48px] touch-manipulation"
                  autoComplete="off"
                />
                
                {/* Analysis Indicator */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Voice Search Button */}
                {enableVoiceSearch && (
                  <button
                    onClick={startVoiceSearch}
                    disabled={isListening}
                    className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    🎤
                  </button>
                )}
              </div>
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="ml-2 md:ml-4 px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none min-h-[48px] touch-manipulation"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5 inline md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </button>
          </div>
        </div>
        
        {/* Intent Detection Display */}
        <AnimatePresence>
          {currentIntent && currentIntent.type !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="intent-display bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-t border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-gray-700">
                    Detected: <strong>{currentIntent.type}</strong> search 
                    ({Math.round(currentIntent.confidence * 100)}% confidence)
                  </span>
                </div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Options
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Service Selection */}
        <div className="service-selection p-4 md:p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <ServiceToggle 
              icon={<Plane className="w-4 h-4" />}
              label="Flights"
              active={selectedServices.flights}
              onChange={(active) => setSelectedServices(prev => ({ ...prev, flights: active }))}
              priority={currentIntent?.suggested_services.includes('flights')}
            />
            <ServiceToggle 
              icon={<Building className="w-4 h-4" />}
              label="Hotels"
              active={selectedServices.hotels}
              onChange={(active) => setSelectedServices(prev => ({ ...prev, hotels: active }))}
              priority={currentIntent?.suggested_services.includes('hotels')}
            />
            <ServiceToggle 
              icon={<Car className="w-4 h-4" />}
              label="Cars"
              active={selectedServices.cars}
              onChange={(active) => setSelectedServices(prev => ({ ...prev, cars: active }))}
              priority={currentIntent?.suggested_services.includes('cars')}
            />
            <ServiceToggle 
              icon={<Activity className="w-4 h-4" />}
              label="Activities"
              active={selectedServices.activities}
              onChange={(active) => setSelectedServices(prev => ({ ...prev, activities: active }))}
              priority={currentIntent?.suggested_services.includes('activities')}
            />
          </div>
        </div>
        
        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="advanced-options p-4 md:p-6 border-t border-gray-200 bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Dates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                    />
                    <input
                      type="date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const adults = parseInt(e.target.value);
                      setSearchParams(prev => ({ 
                        ...prev, 
                        passengers: { ...prev.passengers, adults } 
                      }));
                    }}
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                {/* Travel Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Class</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchParams(prev => ({ 
                      ...prev, 
                      travelClass: e.target.value as any 
                    }))}
                  >
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Quick Filters */}
      {showQuickFilters && (
        <motion.div 
          className="quick-filters mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Searches</h3>
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(filter.query)}
                className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-200"
              >
                <span className="mr-2">{filter.icon}</span>
                <span className="text-sm font-medium text-gray-700">{filter.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================================
// SERVICE TOGGLE COMPONENT
// ========================================

interface ServiceToggleProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onChange: (active: boolean) => void;
  priority?: boolean;
}

const ServiceToggle: React.FC<ServiceToggleProps> = ({
  icon,
  label,
  active,
  onChange,
  priority = false
}) => {
  return (
    <motion.button
      onClick={() => onChange(!active)}
      className={`flex items-center px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
        active
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
      } ${priority ? 'ring-2 ring-blue-200 ring-offset-1' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span className="ml-2">{label}</span>
      {priority && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1 w-2 h-2 bg-green-400 rounded-full"
        />
      )}
    </motion.button>
  );
};

export default UnifiedTravelSearch;
// Types already exported above