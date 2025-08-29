/**
 * 🚀 ULTRA-COMPETITIVE Hero Section with Single-Line Search Form
 * Designed to beat Kayak, Expedia, Booking.com in UX and conversion
 * Features: Full-width single-line form, maximum visibility, first-screen optimization
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { FlightIcon, CalendarIcon, UsersIcon, SwitchIcon, MagnifyingGlassIcon } from '@/components/Icons';
import { FlightSearchFormData, TravelClass } from '@/types/flights';
import { validateFlightSearchForm } from '@/lib/flights/validators';

// Import enhanced airport databases
import { US_AIRPORTS_DATABASE } from '@/lib/airports/us-airports-database';
import { BRAZIL_AIRPORTS_DATABASE } from '@/lib/airports/brazil-airports-database';
import { SOUTH_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/south-america-airports-database';

interface CompetitiveHeroSectionProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  isLoading?: boolean;
}

interface AirportOption {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

// Popular destinations for quick access
const POPULAR_DESTINATIONS: AirportOption[] = [
  { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
  { iataCode: 'LAS', name: 'McCarran International', city: 'Las Vegas', country: 'United States' },
  { iataCode: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States' },
  { iataCode: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago', country: 'United States' },
  { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
  { iataCode: 'LHR', name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
  { iataCode: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { iataCode: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' }
];

// Trust signals for competitive advantage
const TRUST_SIGNALS = [
  { icon: '🏆', text: '2M+ Travelers Trust Us', color: 'text-yellow-400' },
  { icon: '💰', text: 'Save Up to 60%', color: 'text-green-400' },
  { icon: '⚡', text: 'Sub-1 Second Search', color: 'text-blue-400' },
  { icon: '🔒', text: 'Price Match Guarantee', color: 'text-purple-400' }
];

export default function CompetitiveHeroSection({ onSearch, isLoading = false }: CompetitiveHeroSectionProps) {
  // Form state - optimized for single-line layout
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: { iataCode: '', name: '', city: '', country: '' },
    destination: { iataCode: '', name: '', city: '', country: '' },
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    passengers: { adults: 1, children: 0, infants: 0 },
    travelClass: 'ECONOMY' as TravelClass,
    preferences: {
      nonStop: false,
      flexibleDates: { enabled: false, days: 2 },
      preferredAirlines: []
    }
  });

  // Search states for autocomplete
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<AirportOption[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<AirportOption[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  // Refs for form elements
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Consolidated airport database
  const allAirports = [
    ...US_AIRPORTS_DATABASE,
    ...BRAZIL_AIRPORTS_DATABASE,
    ...SOUTH_AMERICA_AIRPORTS_DATABASE
  ];

  // Airport search function with intelligent ranking
  const searchAirports = useCallback((query: string): AirportOption[] => {
    if (!query || query.length < 2) return POPULAR_DESTINATIONS;

    const normalizedQuery = query.toLowerCase();
    
    return allAirports
      .filter(airport => 
        airport.iataCode.toLowerCase().includes(normalizedQuery) ||
        airport.name.toLowerCase().includes(normalizedQuery) ||
        airport.city.toLowerCase().includes(normalizedQuery) ||
        airport.country.toLowerCase().includes(normalizedQuery)
      )
      .map(airport => ({
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.city,
        country: airport.country
      }))
      .slice(0, 8); // Limit to 8 results for clean UI
  }, [allAirports]);

  // Handle origin search
  const handleOriginSearch = useCallback((value: string) => {
    setOriginSearch(value);
    const suggestions = searchAirports(value);
    setOriginSuggestions(suggestions);
    setShowOriginDropdown(true);
  }, [searchAirports]);

  // Handle destination search
  const handleDestinationSearch = useCallback((value: string) => {
    setDestinationSearch(value);
    const suggestions = searchAirports(value);
    setDestinationSuggestions(suggestions);
    setShowDestinationDropdown(true);
  }, [searchAirports]);

  // Handle airport selection
  const selectOrigin = useCallback((airport: AirportOption) => {
    setFormData((prev: any) => ({ ...prev, origin: airport }));
    setOriginSearch('');
    setShowOriginDropdown(false);
    // Auto-focus to destination
    setTimeout(() => destinationRef.current?.focus(), 100);
  }, []);

  const selectDestination = useCallback((airport: AirportOption) => {
    setFormData((prev: any) => ({ ...prev, destination: airport }));
    setDestinationSearch('');
    setShowDestinationDropdown(false);
  }, []);

  // Switch origin and destination
  const switchAirports = useCallback(() => {
    setFormData((prev: any) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    const errors = validateFlightSearchForm(formData);
    if (errors.length > 0) {
      alert(errors[0]); // Simple error handling for MVP
      return;
    }

    onSearch(formData);
  }, [formData, onSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
        setShowDestinationDropdown(false);
        setShowPassengerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Get passenger count display
  const getPassengerDisplay = () => {
    const { adults, children, infants } = formData.passengers;
    const total = adults + children + infants;
    if (total === 1) return '1 passenger';
    return `${total} passengers`;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-800/30 animate-pulse"></div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Trust Signals Bar - Fixed at top */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              {TRUST_SIGNALS.map((signal: any, index: number) => (
                <div key={index} className={`flex items-center gap-2 ${signal.color}`}>
                  <span className="text-base">{signal.icon}</span>
                  <span>{signal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12">
          <div className="max-w-7xl mx-auto text-center">
            
            {/* Main Headline - Responsive typography */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight">
              Find Flights That
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Don't Break the Bank
              </span>
            </h1>

            {/* Subheadline - Mobile optimized */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3 sm:mb-4 max-w-4xl mx-auto font-medium px-4">
              AI-powered search across 500+ airlines. Compare prices instantly and save up to 60% vs other booking sites.
            </p>

            {/* Competitive Advantage - Mobile responsive */}
            <div className="text-sm sm:text-lg text-green-400 font-semibold mb-8 sm:mb-12 px-4">
              <div className="hidden sm:block">⚡ 3x faster than Kayak • 💰 Better prices than Expedia • 🎯 More options than Booking.com</div>
              <div className="sm:hidden text-center">
                <div>⚡ 3x faster than Kayak</div>
                <div>💰 Better prices than Expedia</div>
                <div>🎯 More options than Booking.com</div>
              </div>
            </div>

            {/* SINGLE-LINE SEARCH FORM - The Star of the Show */}
            <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
                
                {/* Trip Type Pills */}
                <div className="flex justify-center gap-3 mb-6">
                  {[
                    { value: 'round-trip', label: 'Round Trip', icon: '↔️' },
                    { value: 'one-way', label: 'One Way', icon: '➡️' }
                  ].map((option: any) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev: any) => ({ ...prev, tripType: option.value as any }))}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        formData.tripType === option.value
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* RESPONSIVE FORM GRID - Single line on desktop, stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                  
                  {/* Origin Input - 3 columns on desktop, full width on mobile */}
                  <div className="sm:col-span-1 lg:col-span-3 relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">From</label>
                    <div className="relative">
                      <input
                        ref={originRef}
                        type="text"
                        value={formData.origin?.iataCode ? `${formData.origin.city} (${formData.origin.iataCode})` : originSearch}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOriginSearch(e.target.value)}
                        onFocus={() => setShowOriginDropdown(true)}
                        placeholder="City or airport"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-lg font-semibold text-gray-800 placeholder-gray-400 transition-all"
                      />
                      <FlightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Origin Dropdown */}
                    {showOriginDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                        {originSuggestions.map((airport: any, index: number) => (
                          <button
                            key={airport.iataCode}
                            type="button"
                            onClick={() => selectOrigin(airport)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                          >
                            <div>
                              <div className="font-semibold text-gray-800">{airport.city}</div>
                              <div className="text-sm text-gray-500">{airport.name}</div>
                            </div>
                            <div className="text-blue-600 font-bold">{airport.iataCode}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Switch Button - Hidden on mobile, centered on desktop */}
                  <div className="hidden lg:flex lg:col-span-1 justify-center">
                    <button
                      type="button"
                      onClick={switchAirports}
                      className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                    >
                      <SwitchIcon className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>

                  {/* Destination Input - 3 columns on desktop, full width on mobile */}
                  <div className="sm:col-span-1 lg:col-span-3 relative">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-gray-700">To</label>
                      {/* Mobile Switch Button */}
                      <button
                        type="button"
                        onClick={switchAirports}
                        className="lg:hidden w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all"
                      >
                        <SwitchIcon className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        ref={destinationRef}
                        type="text"
                        value={formData.destination?.iataCode ? `${formData.destination.city} (${formData.destination.iataCode})` : destinationSearch}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleDestinationSearch(e.target.value)}
                        onFocus={() => setShowDestinationDropdown(true)}
                        placeholder="City or airport"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-lg font-semibold text-gray-800 placeholder-gray-400 transition-all"
                      />
                      <FlightIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Destination Dropdown */}
                    {showDestinationDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                        {destinationSuggestions.map((airport: any, index: number) => (
                          <button
                            key={airport.iataCode}
                            type="button"
                            onClick={() => selectDestination(airport)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                          >
                            <div>
                              <div className="font-semibold text-gray-800">{airport.city}</div>
                              <div className="text-sm text-gray-500">{airport.name}</div>
                            </div>
                            <div className="text-blue-600 font-bold">{airport.iataCode}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Inputs - 2 columns on desktop, spans both columns on tablet */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Dates</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={formData.departureDate.toISOString().split('T')[0]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ 
                          ...prev, 
                          departureDate: new Date(e.target.value) 
                        }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="flex-1 px-3 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-sm font-semibold"
                      />
                      {formData.tripType === 'round-trip' && (
                        <input
                          type="date"
                          value={formData.returnDate?.toISOString().split('T')[0] || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ 
                            ...prev, 
                            returnDate: new Date(e.target.value) 
                          }))}
                          min={formData.departureDate.toISOString().split('T')[0]}
                          className="flex-1 px-3 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-sm font-semibold"
                        />
                      )}
                    </div>
                  </div>

                  {/* Passengers - 1 column on desktop, spans 1 column on tablet */}
                  <div className="sm:col-span-1 lg:col-span-1 relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Travelers</label>
                    <button
                      type="button"
                      onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-left font-semibold text-gray-800 hover:border-gray-300 transition-all"
                    >
                      {getPassengerDisplay()}
                    </button>
                    
                    {/* Passenger Dropdown */}
                    {showPassengerDropdown && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 w-64">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Adults</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, adults: Math.max(1, prev.passengers.adults - 1) }
                                }))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold">{formData.passengers.adults}</span>
                              <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, adults: prev.passengers.adults + 1 }
                                }))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Children</span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, children: Math.max(0, prev.passengers.children - 1) }
                                }))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold">{formData.passengers.children}</span>
                              <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({
                                  ...prev,
                                  passengers: { ...prev.passengers, children: prev.passengers.children + 1 }
                                }))}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Button - 2 columns on desktop, spans both columns on tablet */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none text-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Searching...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <MagnifyingGlassIcon className="w-5 h-5" />
                          Search Flights
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white/90">
              <div>
                <div className="text-3xl font-bold text-yellow-400">500+</div>
                <div className="text-sm">Airlines</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">2M+</div>
                <div className="text-sm">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">&lt;1s</div>
                <div className="text-sm">Search Speed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">60%</div>
                <div className="text-sm">Max Savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}