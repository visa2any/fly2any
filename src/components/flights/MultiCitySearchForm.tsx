'use client';

/**
 * 🗺️ MULTI-CITY SEARCH FORM COMPONENT
 * Advanced multi-city flight search with dynamic segments
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon, SwitchIcon, CalendarIcon, UsersIcon } from '@/components/Icons';
import { FlightSearchFormData, AirportSelection, FlightSegment, PassengerCounts, TravelClass } from '@/types/flights';
import EnterpriseDatePicker from '@/components/ui/enterprise-date-picker';
import AirportAutocomplete from '@/components/flights/AirportAutocomplete';

interface MultiCitySearchFormProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  initialData?: Partial<FlightSearchFormData>;
  isLoading?: boolean;
  className?: string;
}

const MIN_SEGMENTS = 2;
const MAX_SEGMENTS = 6;

export default function MultiCitySearchForm({
  onSearch,
  initialData,
  isLoading = false,
  className = ''
}: MultiCitySearchFormProps) {
  const [segments, setSegments] = useState<FlightSegment[]>(
    initialData?.segments || [
      {
        origin: { iataCode: '', name: '', city: '', country: '' },
        destination: { iataCode: '', name: '', city: '', country: '' },
        departureDate: new Date()
      },
      {
        origin: { iataCode: '', name: '', city: '', country: '' },
        destination: { iataCode: '', name: '', city: '', country: '' },
        departureDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    ]
  );

  const [passengers, setPassengers] = useState<PassengerCounts>(
    initialData?.passengers || { adults: 1, children: 0, infants: 0 }
  );

  const [travelClass, setTravelClass] = useState<TravelClass>(
    initialData?.travelClass || 'ECONOMY'
  );

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSegment = useCallback(() => {
    if (segments.length >= MAX_SEGMENTS) return;

    const lastSegment = segments[segments.length - 1];
    const newSegment: FlightSegment = {
      origin: lastSegment.destination, // Start from last destination
      destination: { iataCode: '', name: '', city: '', country: '' },
      departureDate: new Date(lastSegment.departureDate.getTime() + 24 * 60 * 60 * 1000) // Next day
    };

    setSegments(prev => [...prev, newSegment]);
  }, [segments]);

  const removeSegment = useCallback((index: number) => {
    if (segments.length <= MIN_SEGMENTS) return;
    setSegments(prev => prev.filter((_, i) => i !== index));
  }, [segments.length]);

  const updateSegment = useCallback((index: number, updates: Partial<FlightSegment>) => {
    setSegments(prev => prev.map((segment, i) => 
      i === index ? { ...segment, ...updates } : segment
    ));

    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`segment-${index}-origin`];
      delete newErrors[`segment-${index}-destination`];
      delete newErrors[`segment-${index}-date`];
      return newErrors;
    });
  }, []);

  const swapSegmentCities = useCallback((index: number) => {
    setSegments(prev => prev.map((segment, i) => 
      i === index 
        ? { ...segment, origin: segment.destination, destination: segment.origin }
        : segment
    ));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    segments.forEach((segment, index) => {
      if (!segment.origin.iataCode) {
        newErrors[`segment-${index}-origin`] = 'Origin airport is required';
      }
      if (!segment.destination.iataCode) {
        newErrors[`segment-${index}-destination`] = 'Destination airport is required';
      }
      if (segment.origin.iataCode === segment.destination.iataCode) {
        newErrors[`segment-${index}-destination`] = 'Origin and destination must be different';
      }
      if (!segment.departureDate || segment.departureDate < new Date(new Date().setHours(0, 0, 0, 0))) {
        newErrors[`segment-${index}-date`] = 'Departure date must be today or in the future';
      }
    });

    if (passengers.adults < 1) {
      newErrors.passengers = 'At least 1 adult passenger is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validateForm()) return;

    const searchData: FlightSearchFormData = {
      tripType: 'multi-city',
      origin: segments[0].origin,
      destination: segments[segments.length - 1].destination,
      departureDate: segments[0].departureDate,
      returnDate: undefined,
      segments,
      passengers,
      travelClass,
      preferences: {
        nonStop: false,
        preferredAirlines: []
      }
    };

    onSearch(searchData);
  };

  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + passengers.infants;
  };

  const updatePassengerCount = (type: keyof PassengerCounts, increment: boolean) => {
    setPassengers(prev => {
      const newCount = increment 
        ? prev[type] + 1 
        : Math.max(0, prev[type] - 1);

      // Ensure at least 1 adult
      if (type === 'adults' && newCount < 1) {
        return prev;
      }

      return { ...prev, [type]: newCount };
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-3xl">🗺️</span>
          Multi-City Flight Search
        </h2>
        <p className="text-gray-600">
          Search flights with multiple destinations in one trip
        </p>
      </div>

      {/* Flight Segments */}
      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {segments.map((segment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Flight {index + 1}
                </span>
                {segments.length > MIN_SEGMENTS && (
                  <button
                    onClick={() => removeSegment(index)}
                    className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                    title="Remove flight"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 rounded-lg p-4">
                {/* From Airport */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <AirportAutocomplete
                    value={segment.origin}
                    onChange={(airport) => updateSegment(index, { origin: airport })}
                    placeholder="Origin airport"
                    error={errors[`segment-${index}-origin`]}
                  />
                </div>

                {/* Swap Button */}
                <div className="md:col-span-1 flex items-end justify-center pb-2">
                  <button
                    onClick={() => swapSegmentCities(index)}
                    className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                    title="Swap cities"
                  >
                    <SwitchIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* To Airport */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <AirportAutocomplete
                    value={segment.destination}
                    onChange={(airport) => updateSegment(index, { destination: airport })}
                    placeholder="Destination airport"
                    error={errors[`segment-${index}-destination`]}
                  />
                </div>

                {/* Departure Date */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <EnterpriseDatePicker
                    value={segment.departureDate.toISOString().split('T')[0]}
                    onChange={(date) => date && updateSegment(index, { departureDate: new Date(date) })}
                    minDate={new Date().toISOString().split('T')[0]}
                    className="w-full"
                    error={errors[`segment-${index}-date`]}
                  />
                </div>
              </div>

              {/* Connection Info */}
              {index < segments.length - 1 && (
                <div className="flex items-center justify-center py-2">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Connection
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Segment Button */}
        {segments.length < MAX_SEGMENTS && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addSegment}
            className="w-full border-2 border-dashed border-blue-300 rounded-lg p-4 text-blue-600 hover:border-blue-400 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Another Flight
            <span className="text-sm">({segments.length}/{MAX_SEGMENTS})</span>
          </motion.button>
        )}
      </div>

      {/* Passengers and Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Passengers */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passengers
          </label>
          <button
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-gray-400" />
              <span>
                {getTotalPassengers()} passenger{getTotalPassengers() !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-gray-400">▼</div>
          </button>

          {showPassengerDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adults</div>
                    <div className="text-sm text-gray-500">12+ years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('adults', false)}
                      disabled={passengers.adults <= 1}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{passengers.adults}</span>
                    <button
                      onClick={() => updatePassengerCount('adults', true)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Children</div>
                    <div className="text-sm text-gray-500">2-11 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('children', false)}
                      disabled={passengers.children <= 0}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{passengers.children}</span>
                    <button
                      onClick={() => updatePassengerCount('children', true)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Infants</div>
                    <div className="text-sm text-gray-500">Under 2 years</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('infants', false)}
                      disabled={passengers.infants <= 0}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{passengers.infants}</span>
                    <button
                      onClick={() => updatePassengerCount('infants', true)}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPassengerDropdown(false)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
          {errors.passengers && (
            <p className="mt-1 text-sm text-red-600">{errors.passengers}</p>
          )}
        </div>

        {/* Travel Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel Class
          </label>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value as TravelClass)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Searching Multi-City Flights...
          </>
        ) : (
          <>
            <span className="text-2xl">🚀</span>
            Search Multi-City Flights
          </>
        )}
      </motion.button>

      {/* Trip Summary */}
      <div className="mt-4 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Trip Summary</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center justify-between">
            <span>Total segments:</span>
            <span className="font-medium">{segments.length} flights</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Passengers:</span>
            <span className="font-medium">
              {passengers.adults} adult{passengers.adults !== 1 ? 's' : ''}
              {passengers.children > 0 && `, ${passengers.children} child${passengers.children !== 1 ? 'ren' : ''}`}
              {passengers.infants > 0 && `, ${passengers.infants} infant${passengers.infants !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Class:</span>
            <span className="font-medium capitalize">{travelClass.toLowerCase().replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}