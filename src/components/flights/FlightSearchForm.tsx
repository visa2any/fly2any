'use client';

/**
 * Flight Search Form Component
 * Main form for searching flights with origin, destination, dates, and passengers
 */

import React, { useState, useCallback, useEffect } from 'react';
import { FlightIcon, CalendarIcon, UsersIcon, SwitchIcon, PlusIcon, MinusIcon } from '@/components/Icons';
import { FlightSearchFormData, AirportSelection, PassengerCounts, TravelClass } from '@/types/flights';
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

export default function FlightSearchForm({ 
  onSearch, 
  isLoading = false, 
  className = '',
  initialData 
}: FlightSearchFormProps) {
  // Form state
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: { iataCode: '', name: '', city: '', country: '' },
    destination: { iataCode: '', name: '', city: '', country: '' },
    departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
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

  // Airport search states
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originResults, setOriginResults] = useState<AirportSearchResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<AirportSearchResult[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

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

  // Handle origin search
  const handleOriginSearch = useCallback(async (value: string) => {
    setOriginSearch(value);
    setShowOriginDropdown(true);
    
    if (value.length >= 2) {
      const results = await searchAirports(value);
      setOriginResults(results);
    } else {
      setOriginResults([]);
    }
  }, [searchAirports]);

  // Handle destination search
  const handleDestinationSearch = useCallback(async (value: string) => {
    setDestinationSearch(value);
    setShowDestinationDropdown(true);
    
    if (value.length >= 2) {
      const results = await searchAirports(value);
      setDestinationResults(results);
    } else {
      setDestinationResults([]);
    }
  }, [searchAirports]);

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
      returnDate: tripType === 'one-way' ? undefined : prev.returnDate
    }));
  }, []);

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
    
    try {
      await onSearch(formData);
    } catch (error) {
      setErrors(['Erro ao buscar voos. Tente novamente.']);
    } finally {
      setIsSearching(false);
    }
  }, [formData, onSearch]);

  // Total passengers for display
  const totalPassengers = formData.passengers.adults + formData.passengers.children + formData.passengers.infants;

  return (
    <div className={`flight-search-form ${className}`}>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        
        {/* Trip Type Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'round-trip', label: 'Ida e volta' },
            { value: 'one-way', label: 'Somente ida' },
            { value: 'multi-city', label: 'Múltiplas cidades' }
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTripTypeChange(type.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.tripType === type.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Origin and Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
          
          {/* Origin */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FlightIcon className="inline w-4 h-4 mr-1" />
              Origem
            </label>
            <input
              type="text"
              value={originSearch}
              onChange={(e) => handleOriginSearch(e.target.value)}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="De onde você vai partir?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Origin Dropdown */}
            {showOriginDropdown && originResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {originResults.map((airport) => (
                  <button
                    key={airport.iataCode}
                    type="button"
                    onClick={() => handleAirportSelect(airport, 'origin')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{airport.city} ({airport.iataCode})</div>
                    <div className="text-sm text-gray-600">{airport.name}</div>
                    <div className="text-xs text-gray-500">{airport.country}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 lg:block hidden">
            <button
              type="button"
              onClick={swapAirports}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
            >
              <SwitchIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FlightIcon className="inline w-4 h-4 mr-1 transform rotate-90" />
              Destino
            </label>
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => handleDestinationSearch(e.target.value)}
              onFocus={() => setShowDestinationDropdown(true)}
              placeholder="Para onde você quer ir?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Destination Dropdown */}
            {showDestinationDropdown && destinationResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {destinationResults.map((airport) => (
                  <button
                    key={airport.iataCode}
                    type="button"
                    onClick={() => handleAirportSelect(airport, 'destination')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{airport.city} ({airport.iataCode})</div>
                    <div className="text-sm text-gray-600">{airport.name}</div>
                    <div className="text-xs text-gray-500">{airport.country}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="inline w-4 h-4 mr-1" />
              Data de partida
            </label>
            <input
              type="date"
              value={formData.departureDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                departureDate: new Date(e.target.value)
              }))}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Return Date */}
          {formData.tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="inline w-4 h-4 mr-1" />
                Data de retorno
              </label>
              <input
                type="date"
                value={formData.returnDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  returnDate: new Date(e.target.value)
                }))}
                min={new Date(formData.departureDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                max={new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Passengers and Class */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Passengers */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UsersIcon className="inline w-4 h-4 mr-1" />
              Passageiros
            </label>
            <button
              type="button"
              onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {totalPassengers} {totalPassengers === 1 ? 'passageiro' : 'passageiros'}
            </button>
            
            {/* Passengers Dropdown */}
            {showPassengerDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
                
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Adultos</div>
                    <div className="text-sm text-gray-600">12+ anos</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => updatePassengerCount('adults', -1)}
                      disabled={formData.passengers.adults <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{formData.passengers.adults}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengerCount('adults', 1)}
                      disabled={formData.passengers.adults >= AMADEUS_CONFIG.SEARCH_LIMITS.MAX_ADULTS}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Crianças</div>
                    <div className="text-sm text-gray-600">2-11 anos</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => updatePassengerCount('children', -1)}
                      disabled={formData.passengers.children <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{formData.passengers.children}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengerCount('children', 1)}
                      disabled={formData.passengers.children >= AMADEUS_CONFIG.SEARCH_LIMITS.MAX_CHILDREN}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Bebês</div>
                    <div className="text-sm text-gray-600">0-2 anos</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => updatePassengerCount('infants', -1)}
                      disabled={formData.passengers.infants <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{formData.passengers.infants}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengerCount('infants', 1)}
                      disabled={formData.passengers.infants >= formData.passengers.adults}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(false)}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>

          {/* Travel Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe
            </label>
            <select
              value={formData.travelClass}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                travelClass: e.target.value as TravelClass
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ECONOMY">Econômica</option>
              <option value="PREMIUM_ECONOMY">Econômica Premium</option>
              <option value="BUSINESS">Executiva</option>
              <option value="FIRST">Primeira Classe</option>
            </select>
          </div>
        </div>

        {/* Preferences */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
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
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Apenas voos diretos</span>
          </label>
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

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading || isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading || isSearching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Buscando voos...</span>
            </>
          ) : (
            <>
              <FlightIcon className="w-5 h-5" />
              <span>Buscar Voos</span>
            </>
          )}
        </button>
      </form>

      {/* Click outside handlers */}
      {(showOriginDropdown || showDestinationDropdown || showPassengerDropdown) && (
        <div
          className="fixed inset-0 z-30"
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