'use client';

/**
 * Flight Search Form Component
 * Main form for searching flights with origin, destination, dates, and passengers
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FlightIcon, CalendarIcon, UsersIcon, SwitchIcon, PlusIcon, MinusIcon } from '@/components/Icons';
import { FlightSearchFormData, AirportSelection, PassengerCounts, TravelClass, FlightSegment } from '@/types/flights';
import { validateFlightSearchForm } from '@/lib/flights/validators';
import { AMADEUS_CONFIG } from '@/lib/flights/amadeus-config';

interface FlightSearchFormProps {
  onSearch: (formData: FlightSearchFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  initialData?: Partial<FlightSearchFormData>;
}

interface AirportSearchResult {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  detailedName: string;
}

// Cache para armazenar últimas escolhas e buscas de aeroportos
interface AirportCache {
  lastOrigin?: AirportSelection;
  lastDestination?: AirportSelection;
  recentSearches: AirportSelection[];
  searchCache: { [key: string]: AirportSearchResult[] };
}

const CACHE_KEY = 'fly2any_airport_cache';
const MAX_RECENT_SEARCHES = 10;
const MAX_SEARCH_CACHE = 50;

// Funções para gerenciar o cache
const getAirportCache = (): AirportCache => {
  if (typeof window === 'undefined') return { recentSearches: [], searchCache: {} };
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : { recentSearches: [], searchCache: {} };
  } catch {
    return { recentSearches: [], searchCache: {} };
  }
};

const saveAirportCache = (cache: AirportCache) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save airport cache:', error);
  }
};

const updateRecentSearches = (airport: AirportSelection) => {
  const cache = getAirportCache();
  
  // Remove duplicatas
  cache.recentSearches = cache.recentSearches.filter(
    item => item.iataCode !== airport.iataCode
  );
  
  // Adiciona no início
  cache.recentSearches.unshift(airport);
  
  // Limita o número de itens
  if (cache.recentSearches.length > MAX_RECENT_SEARCHES) {
    cache.recentSearches = cache.recentSearches.slice(0, MAX_RECENT_SEARCHES);
  }
  
  saveAirportCache(cache);
};

export default function FlightSearchForm({ 
  onSearch, 
  isLoading = false, 
  className = '',
  initialData 
}: FlightSearchFormProps) {
  // Defaults seguros para SSR
  const defaultOrigin = { iataCode: 'NYC', name: 'New York', city: 'New York', country: 'United States' };
  const defaultDestination = { iataCode: '', name: '', city: '', country: '' };

  // Form state with safe defaults (para evitar hydration mismatch)
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: defaultOrigin,
    destination: defaultDestination,
    departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days (better for international)
    returnDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000), // 2 weeks trip
    segments: [
      {
        origin: defaultOrigin,
        destination: defaultDestination,
        departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        origin: defaultDestination,
        destination: { iataCode: '', name: '', city: '', country: '' },
        departureDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000)
      }
    ],
    passengers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelClass: 'ECONOMY',
    preferences: {
      nonStop: false,
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
    },
    ...initialData
  });

  // International destination suggestions
  const [popularDestinations] = useState([
    { iataCode: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', deal: 'From $899' },
    { iataCode: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom', flag: '🇬🇧', deal: 'From $456' },
    { iataCode: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', flag: '🇫🇷', deal: 'From $523' },
    { iataCode: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', deal: 'From $945' },
    { iataCode: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', flag: '🇦🇺', deal: 'From $1,245' },
    { iataCode: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', deal: 'From $734' }
  ]);

  // Airport search states
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originResults, setOriginResults] = useState<AirportSearchResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<AirportSearchResult[]>([]);
  
  // Cache states para buscas recentes
  const [recentSearches, setRecentSearches] = useState<AirportSelection[]>([]);
  
  // Carregar dados cached apenas no cliente (após hydratação)
  useEffect(() => {
    const cache = getAirportCache();
    setRecentSearches(cache.recentSearches || []);
    
    // Aplicar valores cached se disponíveis
    if (cache.lastOrigin || cache.lastDestination) {
      setFormData(prev => ({
        ...prev,
        origin: cache.lastOrigin || prev.origin,
        destination: cache.lastDestination || prev.destination,
        segments: [
          {
            ...prev.segments?.[0],
            origin: cache.lastOrigin || prev.segments?.[0]?.origin,
            destination: cache.lastDestination || prev.segments?.[0]?.destination
          },
          {
            ...prev.segments?.[1],
            origin: cache.lastDestination || prev.segments?.[1]?.origin
          }
        ]
      }));
    }
  }, []);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  
  // Refs for dropdown positioning - targeting the input elements directly
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const passengerButtonRef = useRef<HTMLButtonElement>(null);
  
  // State for dropdown positions
  const [dropdownPositions, setDropdownPositions] = useState({
    origin: { top: 0, left: 0, width: 0 },
    destination: { top: 0, left: 0, width: 0 },
    passenger: { top: 0, left: 0, width: 0 }
  });

  // Validation and error states
  const [errors, setErrors] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Airport search function
  const searchAirports = useCallback(async (keyword: string): Promise<AirportSearchResult[]> => {
    if (keyword.length < 2) return [];
    
    try {
      const response = await fetch(`/api/flights/airports?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.map((airport: any) => ({
          iataCode: airport.iataCode,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          detailedName: airport.detailedName
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Airport search error:', error);
      return [];
    }
  }, []);

  // Update dropdown position
  const updateDropdownPosition = useCallback((type: 'origin' | 'destination' | 'passenger', ref: React.RefObject<HTMLInputElement | HTMLButtonElement | null>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPositions(prev => ({
        ...prev,
        [type]: {
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width
        }
      }));
    }
  }, []);

  // Update all dropdown positions on scroll/resize
  const updateAllDropdownPositions = useCallback(() => {
    if (showOriginDropdown && originInputRef.current) {
      updateDropdownPosition('origin', originInputRef);
    }
    if (showDestinationDropdown && destinationInputRef.current) {
      updateDropdownPosition('destination', destinationInputRef);
    }
    if (showPassengerDropdown && passengerButtonRef.current) {
      updateDropdownPosition('passenger', passengerButtonRef);
    }
  }, [showOriginDropdown, showDestinationDropdown, showPassengerDropdown, updateDropdownPosition]);

  // Handle scroll and resize events
  useEffect(() => {
    if (showOriginDropdown || showDestinationDropdown || showPassengerDropdown) {
      const handleScrollResize = () => {
        updateAllDropdownPositions();
      };

      window.addEventListener('scroll', handleScrollResize, { passive: true });
      window.addEventListener('resize', handleScrollResize, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScrollResize);
        window.removeEventListener('resize', handleScrollResize);
      };
    }
  }, [showOriginDropdown, showDestinationDropdown, showPassengerDropdown, updateAllDropdownPositions]);

  // Handle origin search
  const handleOriginSearch = useCallback(async (value: string) => {
    setOriginSearch(value);
    updateDropdownPosition('origin', originInputRef);
    setShowOriginDropdown(true);
    
    if (value.length >= 2) {
      const results = await searchAirports(value);
      setOriginResults(results);
    } else {
      setOriginResults([]);
    }
  }, [searchAirports, updateDropdownPosition]);

  // Handle destination search
  const handleDestinationSearch = useCallback(async (value: string) => {
    setDestinationSearch(value);
    updateDropdownPosition('destination', destinationInputRef);
    setShowDestinationDropdown(true);
    
    if (value.length >= 2) {
      const results = await searchAirports(value);
      setDestinationResults(results);
    } else {
      setDestinationResults([]);
    }
  }, [searchAirports, updateDropdownPosition]);

  // Handle airport selection
  const handleAirportSelect = useCallback((airport: AirportSearchResult, type: 'origin' | 'destination') => {
    const airportSelection: AirportSelection = {
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      country: airport.country
    };

    if (type === 'origin') {
      setFormData(prev => ({ ...prev, origin: airportSelection }));
      setOriginSearch(`${airport.city} (${airport.iataCode})`);
      setShowOriginDropdown(false);
    } else {
      setFormData(prev => ({ ...prev, destination: airportSelection }));
      setDestinationSearch(`${airport.city} (${airport.iataCode})`);
      setShowDestinationDropdown(false);
    }
  }, []);

  // Handle trip type change
  const handleTripTypeChange = useCallback((tripType: 'one-way' | 'round-trip' | 'multi-city') => {
    setFormData(prev => ({
      ...prev,
      tripType,
      returnDate: tripType === 'one-way' ? undefined : prev.returnDate,
      segments: tripType === 'multi-city' ? (prev.segments || [
        {
          origin: prev.origin,
          destination: prev.destination,
          departureDate: prev.departureDate
        },
        {
          origin: { iataCode: '', name: '', city: '', country: '' },
          destination: { iataCode: '', name: '', city: '', country: '' },
          departureDate: new Date(prev.departureDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      ]) : undefined
    }));
  }, []);

  // Add new segment for multi-city
  const addSegment = useCallback(() => {
    if (formData.tripType !== 'multi-city' || !formData.segments) return;
    
    const lastSegment = formData.segments[formData.segments.length - 1];
    const newSegment: FlightSegment = {
      origin: { iataCode: '', name: '', city: '', country: '' },
      destination: { iataCode: '', name: '', city: '', country: '' },
      departureDate: new Date(lastSegment.departureDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
    
    setFormData(prev => ({
      ...prev,
      segments: [...(prev.segments || []), newSegment]
    }));
  }, [formData.tripType, formData.segments]);

  // Remove segment for multi-city
  const removeSegment = useCallback((index: number) => {
    if (formData.tripType !== 'multi-city' || !formData.segments || formData.segments.length <= 2) return;
    
    setFormData(prev => ({
      ...prev,
      segments: prev.segments?.filter((_, i) => i !== index)
    }));
  }, [formData.tripType, formData.segments]);

  // Update segment data
  const updateSegment = useCallback((index: number, field: keyof FlightSegment, value: any) => {
    if (formData.tripType !== 'multi-city' || !formData.segments) return;
    
    setFormData(prev => ({
      ...prev,
      segments: prev.segments?.map((segment, i) => 
        i === index ? { ...segment, [field]: value } : segment
      )
    }));
  }, [formData.tripType, formData.segments]);

  // Handle passenger count changes
  const updatePassengerCount = useCallback((type: keyof PassengerCounts, change: number) => {
    setFormData(prev => {
      const newCount = Math.max(0, prev.passengers[type] + change);
      
      // Validate constraints
      let finalCount = newCount;
      
      if (type === 'adults') {
        finalCount = Math.max(1, Math.min(newCount, AMADEUS_CONFIG.SEARCH_LIMITS.MAX_ADULTS));
      } else if (type === 'children') {
        finalCount = Math.max(0, Math.min(newCount, AMADEUS_CONFIG.SEARCH_LIMITS.MAX_CHILDREN));
      } else if (type === 'infants') {
        finalCount = Math.max(0, Math.min(newCount, prev.passengers.adults));
      }
      
      const newPassengers = { ...prev.passengers, [type]: finalCount };
      const totalPassengers = newPassengers.adults + newPassengers.children + newPassengers.infants;
      
      if (totalPassengers > AMADEUS_CONFIG.SEARCH_LIMITS.MAX_PASSENGERS) {
        return prev; // Don't update if exceeds limit
      }
      
      return { ...prev, passengers: newPassengers };
    });
  }, []);

  // Swap origin and destination
  const swapAirports = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
    
    const tempSearch = originSearch;
    setOriginSearch(destinationSearch);
    setDestinationSearch(tempSearch);
  }, [originSearch, destinationSearch]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateFlightSearchForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    setIsSearching(true);
    
    // Salvar escolhas no cache antes de buscar
    const cache = getAirportCache();
    cache.lastOrigin = formData.origin;
    cache.lastDestination = formData.destination;
    saveAirportCache(cache);
    
    // Adicionar às buscas recentes
    if (formData.origin.iataCode) {
      updateRecentSearches(formData.origin);
    }
    if (formData.destination.iataCode) {
      updateRecentSearches(formData.destination);
    }
    
    // Atualizar estado local das buscas recentes
    const updatedCache = getAirportCache();
    setRecentSearches(updatedCache.recentSearches || []);
    
    try {
      await onSearch(formData);
    } catch (error) {
      setErrors(['Erro ao buscar voos. Tente novamente.']);
    } finally {
      setIsSearching(false);
    }
  }, [formData, onSearch]);

  // Handle explore destinations
  const handleExploreDestinations = useCallback(() => {
    // Implement explore functionality - could open modal or navigate
    const origin = formData.origin.iataCode || 'NYC';
    window.open(`/explore?origin=${origin}`, '_blank');
  }, [formData.origin.iataCode]);

  // Handle quick destination selection
  const handleQuickDestination = useCallback((destination: any) => {
    setFormData(prev => ({
      ...prev,
      destination: {
        iataCode: destination.iataCode,
        name: destination.name,
        city: destination.city,
        country: destination.country
      }
    }));
    setDestinationSearch(destination.city);
  }, []);

  // Total passengers for display
  const totalPassengers = formData.passengers.adults + formData.passengers.children + formData.passengers.infants;

  return (
    <div className={`flight-search-form w-full max-w-full overflow-x-hidden ${className}`}>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        
        
        {/* Trip Type Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-50 rounded-lg p-1 flex">
            {[
              { value: 'round-trip', label: 'Round Trip' },
              { value: 'one-way', label: 'One Way' },
              { value: 'multi-city', label: 'Multi-City' }
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTripTypeChange(type.value as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.tripType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 1: Origin, Swap, Destination, and Passengers - Premium Card Style */}
        <div className={`relative backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/60 mb-4 sm:mb-6 hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-x-hidden ${
          isLoading ? 'bg-white/60 opacity-75 pointer-events-none' : 'bg-white/80'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 relative z-10 w-full max-w-full">
          
          {/* Origin */}
          <div className="relative min-w-0">
            <label className="text-xs sm:text-sm font-black text-slate-800 mb-2 sm:mb-3 block uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🛫 FROM
            </label>
            <div className="relative group">
              <input
                ref={originInputRef}
                type="text"
                value={originSearch}
                onChange={(e) => handleOriginSearch(e.target.value)}
                onFocus={() => {
                  updateDropdownPosition('origin', originInputRef);
                  setShowOriginDropdown(true);
                }}
                placeholder="Where are you flying from?"
                className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 text-sm sm:text-base font-bold text-slate-900 placeholder-slate-500 shadow-lg transition-all duration-300 group-hover:shadow-xl hover:bg-white/80"
              />
              <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-lg sm:text-xl opacity-60 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-focus-within:scale-110">
                🛫
              </div>
            </div>
          </div>

          {/* Swap Button - Premium (correct position between FROM and TO) */}
          <div className="flex items-center justify-center lg:pt-8">
            <button
              type="button"
              onClick={swapAirports}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all transform hover:scale-110 shadow-xl hover:shadow-2xl hover:rotate-180 duration-300 border-2 border-white/50 backdrop-blur-sm group"
            >
              <span className="text-white text-sm sm:text-lg font-black group-hover:scale-110 transition-transform duration-300">⇄</span>
            </button>
          </div>

          {/* Destination */}
          <div className="relative min-w-0">
            <label className="text-xs sm:text-sm font-black text-slate-800 mb-2 sm:mb-3 block uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🛬 TO
            </label>
            <div className="relative group">
              <input
                ref={destinationInputRef}
                type="text"
                value={destinationSearch}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                onFocus={() => {
                  updateDropdownPosition('destination', destinationInputRef);
                  setShowDestinationDropdown(true);
                }}
                placeholder="Where are you going?"
                className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 text-sm sm:text-base font-bold text-slate-900 placeholder-slate-500 shadow-lg transition-all duration-300 group-hover:shadow-xl hover:bg-white/80"
              />
              <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-lg sm:text-xl opacity-60 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-focus-within:scale-110">
                🛬
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div className="relative min-w-0">
            <label className="text-xs sm:text-sm font-black text-slate-800 mb-2 sm:mb-3 block uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              👥 PASSENGERS
            </label>
            <div className="relative group">
              <button
                ref={passengerButtonRef}
                type="button"
                onClick={() => {
                  updateDropdownPosition('passenger', passengerButtonRef);
                  setShowPassengerDropdown(!showPassengerDropdown);
                }}
                className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl text-left focus:ring-2 sm:focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 text-sm sm:text-base font-bold text-slate-900 shadow-lg transition-all duration-300 group-hover:shadow-xl hover:bg-white/80"
              >
                <span className="truncate">{totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}</span>
              </button>
              <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-xs sm:text-sm opacity-60 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-focus-within:rotate-180 group-focus-within:scale-110">
                ▼
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Multi-City Segments */}
        {formData.tripType === 'multi-city' && formData.segments && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  ✈️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Multi-City Flights</h3>
                  <p className="text-sm text-gray-600">{formData.segments.length} segments planned</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addSegment}
                disabled={formData.segments.length >= 6}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-all text-sm font-medium"
              >
                <span className="text-lg">+</span>
                Add Segment
              </button>
            </div>

            <div className="space-y-4">
              {formData.segments.map((segment, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-blue-100 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-900">Flight {index + 1}</span>
                    </div>
                    {formData.segments && formData.segments.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSegment(index)}
                        className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Origin */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">FROM</label>
                      <input
                        type="text"
                        placeholder="Origin city"
                        value={segment.origin.city || ''}
                        onChange={(e) => {
                          const city = e.target.value;
                          updateSegment(index, 'origin', {
                            ...segment.origin,
                            city,
                            name: city,
                            iataCode: city.slice(0, 3).toUpperCase()
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* Destination */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">TO</label>
                      <input
                        type="text"
                        placeholder="Destination city"
                        value={segment.destination.city || ''}
                        onChange={(e) => {
                          const city = e.target.value;
                          updateSegment(index, 'destination', {
                            ...segment.destination,
                            city,
                            name: city,
                            iataCode: city.slice(0, 3).toUpperCase()
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">DEPARTURE</label>
                      <input
                        type="date"
                        value={segment.departureDate.toISOString().split('T')[0]}
                        onChange={(e) => updateSegment(index, 'departureDate', new Date(e.target.value))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {formData.segments && index < formData.segments.length - 1 && (
                    <div className="flex justify-center mt-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                        ↓
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>💡</span>
                <span><strong>Tip:</strong> Multi-city flights allow up to 6 destinations. Each segment is treated as a separate one-way flight.</span>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Dates, Class, and Direct flights - Premium Card Style */}
        <div className={`relative backdrop-blur-sm rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/60 mb-4 sm:mb-6 hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-x-hidden ${
          isLoading ? 'bg-white/60 opacity-75 pointer-events-none' : 'bg-white/80'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 relative z-10 w-full max-w-full">
          
          {/* Departure Date */}
          <div>
            <label className="text-xs sm:text-sm font-black text-slate-800 mb-2 sm:mb-3 block uppercase tracking-wider bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              📅 DEPARTURE
            </label>
            <div className="relative group">
              <input
                type="date"
                value={formData.departureDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  departureDate: new Date(e.target.value)
                }))}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 text-sm sm:text-base font-bold text-slate-900 shadow-lg transition-all duration-300 group-hover:shadow-xl hover:bg-white/80 cursor-pointer"
              />
              <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-lg sm:text-xl opacity-60 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-focus-within:scale-110">
                📅
              </div>
            </div>
          </div>

          {/* Return Date */}
          {formData.tripType === 'round-trip' && (
            <div>
              <label className="text-xs sm:text-sm font-black text-slate-800 mb-2 sm:mb-3 block uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                🔄 RETURN
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={formData.returnDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    returnDate: new Date(e.target.value)
                  }))}
                  min={new Date(formData.departureDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  max={new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 text-sm sm:text-base font-bold text-slate-900 shadow-lg transition-all duration-300 group-hover:shadow-xl hover:bg-white/80 cursor-pointer"
                />
                <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-lg sm:text-xl opacity-60 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-focus-within:scale-110">
                  🔄
                </div>
              </div>
            </div>
          )}

          {/* Travel Class */}
          <div>
            <label className="text-xs sm:text-sm font-black text-slate-800 mb-2 sm:mb-3 block uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              💺 CLASS
            </label>
            <div className="relative group">
              <select
                value={formData.travelClass}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  travelClass: e.target.value as TravelClass
                }))}
                className="w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 text-sm sm:text-base font-bold text-slate-900 shadow-lg transition-all duration-300 appearance-none cursor-pointer group-hover:shadow-xl hover:bg-white/80"
              >
                <option value="ECONOMY">✈️ Economy</option>
                <option value="PREMIUM_ECONOMY">🌟 Premium Economy</option>
                <option value="BUSINESS">💼 Business</option>
                <option value="FIRST">👑 First Class</option>
              </select>
              <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-xs sm:text-sm opacity-60 pointer-events-none group-hover:opacity-100 transition-all duration-300 group-focus-within:scale-110">
                ▼
              </div>
            </div>
          </div>

          {/* Direct flights toggle - Premium */}
          <div className="flex items-center justify-center lg:pt-8 sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <label className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm lg:text-base text-slate-700 font-bold cursor-pointer group bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/60 hover:shadow-xl hover:bg-white/70 transition-all duration-300 w-full max-w-full justify-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.preferences.nonStop}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      nonStop: e.target.checked
                    }
                  }))}
                  className="sr-only"
                />
                <div className={`w-14 h-7 rounded-full shadow-inner transition-all duration-300 ${
                  formData.preferences.nonStop 
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 shadow-lg' 
                    : 'bg-gray-200 group-hover:bg-gray-300'
                }`}></div>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
                  formData.preferences.nonStop ? 'left-8' : 'left-1'
                }`}></div>
              </div>
              <span className="group-hover:text-slate-900 transition-colors text-xs sm:text-sm font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                ✈️ <span className="hidden sm:inline">Direct flights only</span><span className="sm:hidden">Direct only</span>
              </span>
            </label>
          </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Search Button - Premium Style */}
        <div className="relative z-10">
          <button
            type="submit"
            disabled={isLoading || isSearching}
            className={`w-full font-black py-5 px-8 rounded-2xl text-xl transition-all transform shadow-2xl relative overflow-hidden group border-2 border-white/20 ${
              isLoading || isSearching 
                ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 cursor-not-allowed opacity-75' 
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 hover:scale-[1.02] hover:shadow-[0_25px_80px_-10px_rgba(59,130,246,0.6)]'
            } text-white`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isLoading || isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-lg">Search in Progress...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚀</span>
                  <span className="text-lg">Search Flights</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Premium Trust Indicators */}
        <div className="mt-6 text-center relative z-10">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/60">
            <div className="flex justify-center flex-wrap gap-6 text-slate-600 text-sm font-bold mb-2">
              <span className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2 shadow-md">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg"></span>
                🔒 SSL Secured
              </span>
              <span className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2 shadow-md">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg"></span>
                ⚡ Instant Results
              </span>
              <span className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2 shadow-md">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg"></span>
                ✈️ No Hidden Fees
              </span>
            </div>
            <div className="text-sm font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              ⚡ Trusted by travelers worldwide • Best Price Guarantee
            </div>
          </div>
        </div>

        {/* AI Travel Tips - Premium Style */}
        <div className="mt-6 relative z-10">
          <div className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-2 border-white/50">
                  🤖
                </div>
                <h4 className="text-lg font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">💡 AI Travel Tip</h4>
              </div>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                <span className="font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Best time to book:</span> 6-8 weeks in advance for international flights. 
                Prices for <span className="font-black text-slate-900">{formData.destination.city || 'popular destinations'}</span> typically drop on Tuesdays and Wednesdays.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Portal Dropdowns - Rendered outside hierarchy using React Portal */}
      {typeof window !== 'undefined' && createPortal(
        <>
          {/* Origin Dropdown Portal */}
          {showOriginDropdown && originResults.length > 0 && (
            <div
              style={{
                position: 'fixed',
                top: dropdownPositions.origin.top,
                left: Math.max(4, Math.min(dropdownPositions.origin.left, window.innerWidth - 340)),
                width: Math.min(Math.max(dropdownPositions.origin.width, 320), window.innerWidth - 32),
                zIndex: 99999,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxHeight: '320px',
                overflowY: 'auto',
                maxWidth: 'calc(100vw - 32px)'
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛫</span>
                  <span className="text-sm font-semibold text-gray-900">Select departure airport</span>
                  <span className="text-xs text-gray-500">({originResults.length} results)</span>
                </div>
              </div>
              
              {/* Recent Searches (quando não há busca ativa) */}
              {!originSearch && recentSearches.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Recent Searches
                  </div>
                  {recentSearches.slice(0, 5).map((airport, index) => (
                    <button
                      key={`recent-origin-${airport.iataCode}-${index}`}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, origin: airport }));
                        setOriginSearch('');
                        setShowOriginDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                            {airport.iataCode} - {airport.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {airport.city}, {airport.country}
                          </div>
                        </div>
                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <span className="text-xs">Recent</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Airport List */}
              <div className="py-2">
                {originResults.map((airport, index) => (
                  <button
                    key={`origin-${airport.iataCode}-${index}`}
                    type="button"
                    onClick={() => handleAirportSelect(airport, 'origin')}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {airport.iataCode}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                              {airport.city}
                            </div>
                            <div className="text-xs text-gray-600 truncate group-hover:text-blue-600">
                              {airport.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {airport.country}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  💡 Tip: Type city name or airport code to search faster
                </div>
              </div>
            </div>
          )}

          {/* Destination Dropdown Portal */}
          {showDestinationDropdown && destinationResults.length > 0 && (
            <div
              style={{
                position: 'fixed',
                top: dropdownPositions.destination.top,
                left: Math.max(4, Math.min(dropdownPositions.destination.left, window.innerWidth - 340)),
                width: Math.min(Math.max(dropdownPositions.destination.width, 320), window.innerWidth - 32),
                zIndex: 99999,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxHeight: '320px',
                overflowY: 'auto',
                maxWidth: 'calc(100vw - 32px)'
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛬</span>
                  <span className="text-sm font-semibold text-gray-900">Select destination airport</span>
                  <span className="text-xs text-gray-500">({destinationResults.length} results)</span>
                </div>
              </div>
              
              {/* Recent Searches (quando não há busca ativa) */}
              {!destinationSearch && recentSearches.length > 0 && (
                <div className="py-2 border-b border-gray-100">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Recent Searches
                  </div>
                  {recentSearches.slice(0, 5).map((airport, index) => (
                    <button
                      key={`recent-dest-${airport.iataCode}-${index}`}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, destination: airport }));
                        setDestinationSearch('');
                        setShowDestinationDropdown(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                            {airport.iataCode} - {airport.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {airport.city}, {airport.country}
                          </div>
                        </div>
                        <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <span className="text-xs">Recent</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Airport List */}
              <div className="py-2">
                {destinationResults.map((airport, index) => (
                  <button
                    key={`dest-${airport.iataCode}-${index}`}
                    type="button"
                    onClick={() => handleAirportSelect(airport, 'destination')}
                    className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {airport.iataCode}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                              {airport.city}
                            </div>
                            <div className="text-xs text-gray-600 truncate group-hover:text-purple-600">
                              {airport.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {airport.country}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  💡 Tip: Type city name or airport code to search faster
                </div>
              </div>
            </div>
          )}

          {/* Passenger Dropdown Portal */}
          {showPassengerDropdown && (
            <div
              style={{
                position: 'fixed',
                top: dropdownPositions.passenger.top,
                left: Math.max(4, Math.min(dropdownPositions.passenger.left, window.innerWidth - 300)),
                width: Math.min(Math.max(dropdownPositions.passenger.width, 280), window.innerWidth - 32),
                zIndex: 99999,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                padding: '20px',
                maxWidth: 'calc(100vw - 32px)'
              }}
            >
              {/* Adults */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-semibold text-gray-900 text-sm">Adults</div>
                  <div className="text-xs text-gray-600">12+ years</div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updatePassengerCount('adults', -1)}
                    disabled={formData.passengers.adults <= 1}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 text-sm font-bold text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold text-sm text-gray-900">{formData.passengers.adults}</span>
                  <button
                    type="button"
                    onClick={() => updatePassengerCount('adults', 1)}
                    disabled={formData.passengers.adults >= AMADEUS_CONFIG.SEARCH_LIMITS.MAX_ADULTS}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 text-sm font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-semibold text-gray-900 text-sm">Children</div>
                  <div className="text-xs text-gray-600">2-11 years</div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updatePassengerCount('children', -1)}
                    disabled={formData.passengers.children <= 0}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 text-sm font-bold text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold text-sm text-gray-900">{formData.passengers.children}</span>
                  <button
                    type="button"
                    onClick={() => updatePassengerCount('children', 1)}
                    disabled={formData.passengers.children >= AMADEUS_CONFIG.SEARCH_LIMITS.MAX_CHILDREN}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 text-sm font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-semibold text-gray-900 text-sm">Infants</div>
                  <div className="text-xs text-gray-600">0-2 years</div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updatePassengerCount('infants', -1)}
                    disabled={formData.passengers.infants <= 0}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 text-sm font-bold text-gray-600"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold text-sm text-gray-900">{formData.passengers.infants}</span>
                  <button
                    type="button"
                    onClick={() => updatePassengerCount('infants', 1)}
                    disabled={formData.passengers.infants >= formData.passengers.adults}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50 text-sm font-bold text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(false)}
                  className="w-full py-2.5 text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Click outside handlers */}
      {(showOriginDropdown || showDestinationDropdown || showPassengerDropdown) && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setShowOriginDropdown(false);
            setShowDestinationDropdown(false);
            setShowPassengerDropdown(false);
          }}
        />
      )}
    </div>
  );
}