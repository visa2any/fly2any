'use client';

/**
 * Journey Search Form - Entry Point
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, Calendar, MapPin, Sparkles, ArrowRightLeft, Plane } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { JourneySearchParams, JourneyTravelers, JourneyPreferences, JourneyPace, InterestType } from '@/lib/journey/types';
import { searchAirports, type Airport, AIRPORTS } from '@/lib/data/airports-all';

// ============================================================================
// TYPES
// ============================================================================

interface JourneySearchFormProps {
  onSubmit: (params: JourneySearchParams) => void;
  isLoading?: boolean;
  initialValues?: Partial<JourneySearchParams>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PACE_OPTIONS: Array<{ value: JourneyPace; label: string; description: string }> = [
  { value: 'relaxed', label: 'Relaxed', description: '2-3 activities per day' },
  { value: 'balanced', label: 'Balanced', description: '4-5 activities per day' },
  { value: 'intensive', label: 'Intensive', description: '6+ activities per day' },
];

const INTEREST_OPTIONS: Array<{ value: InterestType; label: string; icon: string }> = [
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'culture', label: 'Culture & History', icon: '🏛️' },
  { value: 'nature', label: 'Nature & Outdoors', icon: '🌿' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { value: 'adventure', label: 'Adventure', icon: '🎯' },
  { value: 'wellness', label: 'Wellness & Spa', icon: '💆' },
  { value: 'family', label: 'Family-Friendly', icon: '👨‍👩‍👧' },
];

// ============================================================================
// COMPONENT
// ============================================================================

// Popular airports for quick selection
const popularAirports = AIRPORTS.filter(a => a.popular).slice(0, 8);

export function JourneySearchForm({ onSubmit, isLoading = false, initialValues }: JourneySearchFormProps) {
  // Form state
  const [origin, setOrigin] = useState(initialValues?.origin || '');
  const [destination, setDestination] = useState(initialValues?.destination || '');

  // Autocomplete state
  const [originSuggestions, setOriginSuggestions] = useState<Airport[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Airport[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle airport search
  const handleOriginChange = (value: string) => {
    setOrigin(value.toUpperCase());
    const results = value.length > 0 ? searchAirports(value, 8) : popularAirports;
    setOriginSuggestions(results);
    setShowOriginDropdown(true);
  };

  const handleDestChange = (value: string) => {
    setDestination(value.toUpperCase());
    const results = value.length > 0 ? searchAirports(value, 8) : popularAirports;
    setDestSuggestions(results);
    setShowDestDropdown(true);
  };

  const selectOrigin = (airport: Airport) => {
    setOrigin(airport.code);
    setShowOriginDropdown(false);
  };

  const selectDestination = (airport: Airport) => {
    setDestination(airport.code);
    setShowDestDropdown(false);
  };
  const [departureDate, setDepartureDate] = useState(
    initialValues?.departureDate || format(addDays(new Date(), 14), 'yyyy-MM-dd')
  );
  const [returnDate, setReturnDate] = useState(
    initialValues?.returnDate || format(addDays(new Date(), 21), 'yyyy-MM-dd')
  );

  // Travelers state
  const [travelers, setTravelers] = useState<JourneyTravelers>(
    initialValues?.travelers || {
      adults: 2,
      children: 0,
      childAges: [],
      infants: 0,
      rooms: 1,
    }
  );

  // Preferences state
  const [showPreferences, setShowPreferences] = useState(false);
  const [pace, setPace] = useState<JourneyPace>('balanced');
  const [interests, setInterests] = useState<InterestType[]>(['culture', 'food']);
  const [budgetMin, setBudgetMin] = useState(500);
  const [budgetMax, setBudgetMax] = useState(5000);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Swap origin/destination
  const handleSwap = useCallback(() => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }, [origin, destination]);

  // Toggle interest
  const toggleInterest = useCallback((interest: InterestType) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }, []);

  // Update travelers
  const updateTravelers = useCallback((field: keyof JourneyTravelers, value: number) => {
    setTravelers((prev) => {
      const updated = { ...prev, [field]: Math.max(0, value) };

      // Ensure at least 1 adult
      if (field === 'adults' && updated.adults < 1) updated.adults = 1;

      // Infants can't exceed adults
      if (updated.infants > updated.adults) updated.infants = updated.adults;

      // Update child ages array
      if (field === 'children') {
        const currentAges = prev.childAges || [];
        if (value > currentAges.length) {
          updated.childAges = [...currentAges, ...Array(value - currentAges.length).fill(8)];
        } else {
          updated.childAges = currentAges.slice(0, value);
        }
      }

      return updated;
    });
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!origin.trim()) newErrors.origin = 'Origin is required';
    if (!destination.trim()) newErrors.destination = 'Destination is required';
    if (!departureDate) newErrors.departureDate = 'Departure date is required';
    if (!returnDate) newErrors.returnDate = 'Return date is required';

    if (departureDate && returnDate && new Date(returnDate) <= new Date(departureDate)) {
      newErrors.returnDate = 'Return must be after departure';
    }

    if (new Date(departureDate) < new Date()) {
      newErrors.departureDate = 'Departure must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [origin, destination, departureDate, returnDate]);

  // Handle submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const preferences: JourneyPreferences = {
        pace,
        interests,
        budget: {
          min: budgetMin,
          max: budgetMax,
          currency: 'USD',
          perPerson: true,
        },
      };

      const params: JourneySearchParams = {
        origin,
        destination,
        departureDate,
        returnDate,
        travelers,
        preferences,
      };

      onSubmit(params);
    },
    [origin, destination, departureDate, returnDate, travelers, pace, interests, budgetMin, budgetMax, validate, onSubmit]
  );

  // Traveler summary
  const travelerSummary = [
    `${travelers.adults} adult${travelers.adults !== 1 ? 's' : ''}`,
    travelers.children > 0 && `${travelers.children} child${travelers.children !== 1 ? 'ren' : ''}`,
    travelers.infants > 0 && `${travelers.infants} infant${travelers.infants !== 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main Search Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D63A35]" />
            <h2 className="text-lg font-semibold text-gray-900">Build Your Journey</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Your entire trip, intelligently designed</p>
        </div>

        {/* Form Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Origin */}
            <div className="relative" ref={originRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => {
                    setOriginSuggestions(origin ? searchAirports(origin, 8) : popularAirports);
                    setShowOriginDropdown(true);
                  }}
                  placeholder="JFK, NYC"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 ${
                    errors.origin ? 'border-red-400' : 'border-gray-200'
                  } focus:border-[#D63A35] focus:ring-0 transition-colors text-gray-900 placeholder-gray-400`}
                />
              </div>
              {/* Origin Dropdown */}
              {showOriginDropdown && originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-30 max-h-64 overflow-y-auto">
                  {originSuggestions.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => selectOrigin(airport)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Plane className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{airport.city}</p>
                        <p className="text-xs text-gray-500">{airport.name} • {airport.code}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
            </div>

            {/* Swap Button (Desktop) */}
            <button
              type="button"
              onClick={handleSwap}
              className="hidden lg:flex absolute left-[calc(25%-20px)] top-[108px] w-10 h-10 items-center justify-center rounded-full bg-white border-2 border-gray-200 hover:border-[#D63A35] hover:text-[#D63A35] transition-colors z-10 shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            {/* Destination */}
            <div className="relative" ref={destRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D63A35]" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestChange(e.target.value)}
                  onFocus={() => {
                    setDestSuggestions(destination ? searchAirports(destination, 8) : popularAirports);
                    setShowDestDropdown(true);
                  }}
                  placeholder="LAX, Los Angeles"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl border-2 ${
                    errors.destination ? 'border-red-400' : 'border-gray-200'
                  } focus:border-[#D63A35] focus:ring-0 transition-colors text-gray-900 placeholder-gray-400`}
                />
              </div>
              {/* Destination Dropdown */}
              {showDestDropdown && destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-30 max-h-64 overflow-y-auto">
                  {destSuggestions.map((airport) => (
                    <button
                      key={airport.code}
                      type="button"
                      onClick={() => selectDestination(airport)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#D63A35]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{airport.city}</p>
                        <p className="text-xs text-gray-500">{airport.name} • {airport.code}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Depart</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className={`w-full h-12 pl-10 pr-2 rounded-xl border-2 ${
                      errors.departureDate ? 'border-red-400' : 'border-gray-200'
                    } focus:border-[#D63A35] focus:ring-0 transition-colors text-gray-900 text-sm`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Return</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate}
                    className={`w-full h-12 pl-10 pr-2 rounded-xl border-2 ${
                      errors.returnDate ? 'border-red-400' : 'border-gray-200'
                    } focus:border-[#D63A35] focus:ring-0 transition-colors text-gray-900 text-sm`}
                  />
                </div>
              </div>
              {(errors.departureDate || errors.returnDate) && (
                <p className="text-xs text-red-500 col-span-2">{errors.departureDate || errors.returnDate}</p>
              )}
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Travelers</label>
              <div className="relative group">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <div className="w-full h-12 pl-10 pr-4 rounded-xl border-2 border-gray-200 flex items-center justify-between cursor-pointer hover:border-[#D63A35] transition-colors bg-white">
                  <span className="text-gray-900 text-sm">{travelerSummary}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {/* Travelers Dropdown */}
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {/* Adults */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Adults</p>
                      <p className="text-xs text-gray-500">12+ years</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateTravelers('adults', travelers.adults - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{travelers.adults}</span>
                      <button
                        type="button"
                        onClick={() => updateTravelers('adults', travelers.adults + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Children</p>
                      <p className="text-xs text-gray-500">2-11 years</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateTravelers('children', travelers.children - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{travelers.children}</span>
                      <button
                        type="button"
                        onClick={() => updateTravelers('children', travelers.children + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Infants</p>
                      <p className="text-xs text-gray-500">Under 2 years</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateTravelers('infants', travelers.infants - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{travelers.infants}</span>
                      <button
                        type="button"
                        onClick={() => updateTravelers('infants', travelers.infants + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rooms</p>
                      <p className="text-xs text-gray-500">Hotel rooms needed</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateTravelers('rooms', travelers.rooms - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-medium">{travelers.rooms}</span>
                      <button
                        type="button"
                        onClick={() => updateTravelers('rooms', travelers.rooms + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#D63A35] hover:text-[#D63A35] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Toggle */}
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-[#D63A35] transition-colors"
          >
            {showPreferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showPreferences ? 'Hide preferences' : 'Customize your journey'}</span>
          </button>

          {/* Preferences Panel */}
          {showPreferences && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-2 duration-200">
              {/* Pace Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Travel Pace</label>
                <div className="grid grid-cols-3 gap-3">
                  {PACE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPace(option.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        pace === option.value
                          ? 'border-[#D63A35] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-sm font-medium ${pace === option.value ? 'text-[#D63A35]' : 'text-gray-900'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleInterest(option.value)}
                      className={`px-3 py-2 rounded-full border-2 text-sm flex items-center gap-1.5 transition-all ${
                        interests.includes(option.value)
                          ? 'border-[#D63A35] bg-red-50 text-[#D63A35]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Budget per person: ${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Math.min(Number(e.target.value), budgetMax - 100))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D63A35]"
                  />
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Math.max(Number(e.target.value), budgetMin + 100))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D63A35]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="px-6 pb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-[#D63A35] to-[#C7342F] hover:from-[#C7342F] hover:to-[#B12F2B] text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Building your journey...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Build My Journey</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default JourneySearchForm;
