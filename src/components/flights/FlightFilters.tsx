'use client';

/**
 * Flight Filters Sidebar Component
 * Left sidebar with comprehensive flight filtering options
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  FlightIcon, 
  ClockIcon, 
  CalendarIcon,
  DollarIcon,
  XIcon,
  CheckIcon,
  StarIcon,
  FilterIcon,
  WifiIcon,
  UtensilsIcon
} from '@/components/Icons';
import { FlightFilters as FlightFiltersType } from '@/types/flights';

interface FlightFiltersProps {
  filters: FlightFiltersType;
  onFiltersChange: (filters: FlightFiltersType) => void;
  priceRange?: { min: number; max: number };
  availableAirlines?: string[];
  className?: string;
}

interface FilterChip {
  id: string;
  label: string;
  type: keyof FlightFiltersType;
  value: any;
}

export default function FlightFilters({
  filters,
  onFiltersChange,
  priceRange = { min: 0, max: 2000 },
  availableAirlines = [],
  className = ''
}: FlightFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FlightFiltersType>(filters || {});

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  // Active filter chips
  const getActiveFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (localFilters.priceRange) {
      chips.push({
        id: 'price',
        label: `$${localFilters.priceRange.min} - $${localFilters.priceRange.max}`,
        type: 'priceRange',
        value: localFilters.priceRange
      });
    }

    if (localFilters.stops !== undefined) {
      const stopsValue = Array.isArray(localFilters.stops) ? localFilters.stops[0] : localFilters.stops;
      const stopsLabel = stopsValue === 0 ? 'Direct flights' : `Max ${stopsValue} stops`;
      chips.push({
        id: 'stops',
        label: stopsLabel,
        type: 'stops',
        value: localFilters.stops
      });
    }

    if (localFilters.airlines && localFilters.airlines.length > 0) {
      chips.push({
        id: 'airlines',
        label: `${localFilters.airlines.length} airline${localFilters.airlines.length > 1 ? 's' : ''}`,
        type: 'airlines',
        value: localFilters.airlines
      });
    }

    if (Array.isArray(localFilters.departureTime) && localFilters.departureTime.length > 0) {
      chips.push({
        id: 'departure',
        label: `${localFilters.departureTime.length} time period${localFilters.departureTime.length > 1 ? 's' : ''}`,
        type: 'departureTime',
        value: localFilters.departureTime
      });
    }

    if (localFilters.duration) {
      chips.push({
        id: 'duration',
        label: `Max ${localFilters.duration.max}h`,
        type: 'duration',
        value: localFilters.duration
      });
    }

    return chips;
  };

  const removeFilter = (chip: FilterChip) => {
    const newFilters = { ...localFilters };
    
    switch (chip.type) {
      case 'priceRange':
        delete newFilters.priceRange;
        break;
      case 'stops':
        delete newFilters.stops;
        break;
      case 'airlines':
        delete newFilters.airlines;
        break;
      case 'departureTime':
        delete newFilters.departureTime;
        break;
      case 'duration':
        delete newFilters.duration;
        break;
    }

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: FlightFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const updateFilter = useCallback((filterType: keyof FlightFiltersType, value: any) => {
    const newFilters = { ...localFilters, [filterType]: value };
    console.log('🎛️ FILTER UPDATE:', filterType, '=', value, 'newFilters:', newFilters);
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  }, [localFilters, onFiltersChange]);

  const activeChips = getActiveFilterChips();

  const timeOptions = [
    { id: 'early', label: 'Early morning', time: '00:00 - 06:00', icon: '🌅' },
    { id: 'morning', label: 'Morning', time: '06:00 - 12:00', icon: '☀️' },
    { id: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00', icon: '🌤️' },
    { id: 'evening', label: 'Evening', time: '18:00 - 00:00', icon: '🌙' }
  ];

  const popularAirlines = [
    { code: 'AA', name: 'American Airlines', logo: '🇺🇸' },
    { code: 'DL', name: 'Delta Air Lines', logo: '✈️' },
    { code: 'UA', name: 'United Airlines', logo: '🌐' },
    { code: 'WN', name: 'Southwest Airlines', logo: '💙' },
    { code: 'AS', name: 'Alaska Airlines', logo: '🏔️' },
    { code: 'B6', name: 'JetBlue Airways', logo: '💫' }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-gray-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            🔍 <span>Filters</span>
          </h2>
          {activeChips.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeChips.length > 0 && (
        <div className="p-3 lg:p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {chip.label}
                <button
                  onClick={() => removeFilter(chip)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <div className="p-3 space-y-4 lg:space-y-5 max-h-[600px] overflow-y-auto">
        
        {/* Price Range */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <DollarIcon className="w-4 h-4" />
            Price Range
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange.min}</span>
              <span>${priceRange.max}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={localFilters.priceRange?.min || priceRange.min}
                onChange={(e) => updateFilter('priceRange', {
                  min: parseInt(e.target.value),
                  max: localFilters.priceRange?.max || priceRange.max
                })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.priceRange?.min || ''}
                onChange={(e) => updateFilter('priceRange', {
                  min: parseInt(e.target.value) || priceRange.min,
                  max: localFilters.priceRange?.max || priceRange.max
                })}
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-400 text-xs">—</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.priceRange?.max || ''}
                onChange={(e) => updateFilter('priceRange', {
                  min: localFilters.priceRange?.min || priceRange.min,
                  max: parseInt(e.target.value) || priceRange.max
                })}
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stops */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <FlightIcon className="w-4 h-4" />
            Stops
          </h3>
          <div className="space-y-2">
            {[
              { value: 0, label: 'Direct flights only', popular: true },
              { value: 1, label: 'Up to 1 stop', popular: false },
              { value: 2, label: 'Up to 2 stops', popular: false }
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="stops"
                  value={option.value}
                  checked={Array.isArray(localFilters.stops) 
                    ? localFilters.stops.includes(option.value as any)
                    : localFilters.stops === option.value}
                  onChange={(e) => updateFilter('stops', parseInt(e.target.value))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900 flex-1">{option.label}</span>
                {option.popular && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Departure Time */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Departure Time
          </h3>
          <div className="space-y-2">
            {timeOptions.map((time) => (
              <label key={time.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(localFilters.departureTime) 
                    ? localFilters.departureTime.includes(time.id) 
                    : false}
                  onChange={(e) => {
                    const current = Array.isArray(localFilters.departureTime) 
                      ? localFilters.departureTime 
                      : [];
                    const newTimes = e.target.checked
                      ? [...current, time.id]
                      : current.filter(t => t !== time.id);
                    updateFilter('departureTime', newTimes);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-lg">{time.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{time.label}</div>
                  <div className="text-xs text-gray-600">{time.time}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Airlines */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <FlightIcon className="w-4 h-4" />
            Airlines
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {popularAirlines.map((airline) => (
              <label key={airline.code} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.airlines?.includes(airline.code) || false}
                  onChange={(e) => {
                    const current = localFilters.airlines || [];
                    const newAirlines = e.target.checked
                      ? [...current, airline.code]
                      : current.filter(a => a !== airline.code);
                    updateFilter('airlines', newAirlines);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-lg">{airline.logo}</span>
                <span className="text-sm text-gray-900 flex-1">{airline.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Flight Duration */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Flight Duration
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Up to {localFilters.duration?.max || 24} hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={localFilters.duration?.max || 24}
              onChange={(e) => updateFilter('duration', { max: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1h</span>
              <span>12h</span>
              <span>24h</span>
            </div>
          </div>
        </div>

        {/* Travel Flexibility */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Flexibility
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.flexible?.dates || false}
                onChange={(e) => {
                  const current = localFilters.flexible || {};
                  updateFilter('flexible', { ...current, dates: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Flexible dates (±3 days)</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.flexible?.airports || false}
                onChange={(e) => {
                  const current = localFilters.flexible || {};
                  updateFilter('flexible', { ...current, airports: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Nearby airports</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.flexible?.refundable || false}
                onChange={(e) => {
                  const current = localFilters.flexible || {};
                  updateFilter('flexible', { ...current, refundable: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Refundable only</span>
            </label>
          </div>
        </div>

        {/* Baggage Options */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <span>🧳</span>
            Baggage
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.baggage?.carryOn || false}
                onChange={(e) => {
                  const current = localFilters.baggage || {};
                  updateFilter('baggage', { ...current, carryOn: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Carry-on included</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.baggage?.checked || false}
                onChange={(e) => {
                  const current = localFilters.baggage || {};
                  updateFilter('baggage', { ...current, checked: e.target.checked });
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Checked bag included</span>
            </label>
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-3 lg:space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base flex items-center gap-2">
            <StarIcon className="w-4 h-4" />
            Amenities
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.amenities?.includes('wifi') || false}
                onChange={(e) => {
                  const current = localFilters.amenities || [];
                  const newAmenities = e.target.checked
                    ? [...current, 'wifi']
                    : current.filter(a => a !== 'wifi');
                  updateFilter('amenities', newAmenities);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <WifiIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">WiFi</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.amenities?.includes('meals') || false}
                onChange={(e) => {
                  const current = localFilters.amenities || [];
                  const newAmenities = e.target.checked
                    ? [...current, 'meals']
                    : current.filter(a => a !== 'meals');
                  updateFilter('amenities', newAmenities);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <UtensilsIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">Meals included</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.amenities?.includes('entertainment') || false}
                onChange={(e) => {
                  const current = localFilters.amenities || [];
                  const newAmenities = e.target.checked
                    ? [...current, 'entertainment']
                    : current.filter(a => a !== 'entertainment');
                  updateFilter('amenities', newAmenities);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-600">📺</span>
              <span className="text-sm text-gray-900">Entertainment</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.amenities?.includes('power') || false}
                onChange={(e) => {
                  const current = localFilters.amenities || [];
                  const newAmenities = e.target.checked
                    ? [...current, 'power']
                    : current.filter(a => a !== 'power');
                  updateFilter('amenities', newAmenities);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-600">🔌</span>
              <span className="text-sm text-gray-900">Power outlets</span>
            </label>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={clearAllFilters}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => onFiltersChange(localFilters)}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}