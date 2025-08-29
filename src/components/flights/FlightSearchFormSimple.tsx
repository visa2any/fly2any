'use client';

/**
 * Flight Search Form Component - Simplified Version
 * Main form for searching flights with origin, destination, dates, and passengers
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
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
  // Form state with international defaults
  const [formData, setFormData] = useState<FlightSearchFormData>({
    tripType: 'round-trip',
    origin: { iataCode: 'NYC', name: 'New York', city: 'New York', country: 'United States' },
    destination: { iataCode: '', name: '', city: '', country: '' },
    departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    returnDate: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000), // 2 weeks trip
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
  
  // Refs for dropdown positioning
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const passengerButtonRef = useRef<HTMLButtonElement>(null);
  
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
      setFormData((prev: any) => ({ ...prev, origin: airportSelection }));
      setOriginSearch(`${airport.city} (${airport.iataCode})`);
      setShowOriginDropdown(false);
    } else {
      setFormData((prev: any) => ({ ...prev, destination: airportSelection }));
      setDestinationSearch(`${airport.city} (${airport.iataCode})`);
      setShowDestinationDropdown(false);
    }
  }, []);

  // Handle trip type change
  const handleTripTypeChange = useCallback((tripType: 'one-way' | 'round-trip') => {
    setFormData((prev: any) => ({
      ...prev,
      tripType,
      returnDate: tripType === 'one-way' ? undefined : prev.returnDate
    }));
  }, []);

  // Handle passenger count changes
  const updatePassengerCount = useCallback((type: keyof PassengerCounts, change: number) => {
    setFormData((prev: any) => {
      const newCount = Math.max(0, prev.passengers[type] + change);
      
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
        return prev;
      }
      
      return { ...prev, passengers: newPassengers };
    });
  }, []);

  // Swap origin and destination
  const swapAirports = useCallback(() => {
    setFormData((prev: any) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
    
    const tempSearch = originSearch;
    setOriginSearch(destinationSearch);
    setDestinationSearch(tempSearch);
  }, [originSearch, destinationSearch]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
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
      setErrors(['Error searching flights. Please try again.']);
    } finally {
      setIsSearching(false);
    }
  }, [formData, onSearch]);

  const totalPassengers = formData.passengers.adults + formData.passengers.children + formData.passengers.infants;

  return (
    <div className={`flight-search-form ${className}`}>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        
        {/* Trip Type Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-50 rounded-lg p-1 flex">
            {[
              { value: 'round-trip', label: 'Round Trip' },
              { value: 'one-way', label: 'One Way' }
            ].map((type: any) => (
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

        {/* Main Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Origin */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <input
              ref={originInputRef}
              type="text"
              value={originSearch}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleOriginSearch(e.target.value)}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Where from?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center">
            <button
              type="button"
              onClick={swapAirports}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SwitchIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              ref={destinationInputRef}
              type="text"
              value={destinationSearch}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleDestinationSearch(e.target.value)}
              onFocus={() => setShowDestinationDropdown(true)}
              placeholder="Where to?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Passengers */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passengers
            </label>
            <button
              ref={passengerButtonRef}
              type="button"
              onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:ring-blue-500 focus:border-blue-500"
            >
              {totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}
            </button>
          </div>
        </div>

        {/* Dates and Class */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure
            </label>
            <input
              type="date"
              value={formData.departureDate.toISOString().split('T')[0]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({
                ...prev,
                departureDate: new Date(e.target.value)
              }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Return Date */}
          {formData.tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return
              </label>
              <input
                type="date"
                value={formData.returnDate?.toISOString().split('T')[0] || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({
                  ...prev,
                  returnDate: new Date(e.target.value)
                }))}
                min={new Date(formData.departureDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Travel Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={formData.travelClass}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData((prev: any) => ({
                ...prev,
                travelClass: e.target.value as TravelClass
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM_ECONOMY">Premium Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First Class</option>
            </select>
          </div>
        </div>

        {/* Direct flights toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="nonStop"
            checked={formData.preferences.nonStop}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                nonStop: e.target.checked
              }
            }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="nonStop" className="ml-2 text-sm text-gray-700">
            Direct flights only
          </label>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error: string, index: number) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading || isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {isLoading || isSearching ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Searching...
            </div>
          ) : (
            'Search Flights'
          )}
        </button>
      </form>
    </div>
  );
}