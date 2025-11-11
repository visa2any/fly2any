'use client';

/**
 * AdvancedFilters Component
 * Team 1 - Enhanced Search & Filters
 *
 * Comprehensive flight filtering with:
 * - Airlines (multi-select with checkboxes)
 * - Number of stops (0, 1, 2+)
 * - Flight duration (slider)
 * - Departure/Arrival time (Morning/Afternoon/Evening/Night)
 * - Aircraft type
 * - Baggage included
 * - Filter count badge
 * - Clear all filters button
 * - Save filter preferences
 */

import { useState, useEffect } from 'react';
import {
  FlightFilters,
  DEFAULT_FILTERS,
  COMMON_AIRLINES,
  COMMON_AIRCRAFT,
  TimeOfDay,
  StopFilter,
} from '@/lib/types/search';
import {
  countActiveFilters,
  formatDuration,
  formatTimeOfDay,
} from '@/lib/utils/search-helpers';

interface AdvancedFiltersProps {
  filters: FlightFilters;
  onChange: (filters: FlightFilters) => void;
  onClose?: () => void;
  className?: string;
}

export default function AdvancedFilters({
  filters,
  onChange,
  onClose,
  className = '',
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FlightFilters>(filters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['airlines', 'stops'])
  );

  const activeFilterCount = countActiveFilters(localFilters);

  const handleFilterChange = (updates: Partial<FlightFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleAirlineToggle = (airlineCode: string) => {
    const airlines = localFilters.airlines.includes(airlineCode)
      ? localFilters.airlines.filter((a) => a !== airlineCode)
      : [...localFilters.airlines, airlineCode];
    handleFilterChange({ airlines });
  };

  const handleStopToggle = (stop: StopFilter) => {
    const stops = localFilters.stops.includes(stop)
      ? localFilters.stops.filter((s) => s !== stop)
      : [...localFilters.stops, stop];
    handleFilterChange({ stops });
  };

  const handleTimeToggle = (
    type: 'departureTime' | 'arrivalTime',
    time: TimeOfDay
  ) => {
    const times = localFilters[type].includes(time)
      ? localFilters[type].filter((t) => t !== time)
      : [...localFilters[type], time];
    handleFilterChange({ [type]: times });
  };

  const handleAircraftToggle = (aircraft: string) => {
    const aircraftTypes = localFilters.aircraftTypes.includes(aircraft)
      ? localFilters.aircraftTypes.filter((a) => a !== aircraft)
      : [...localFilters.aircraftTypes, aircraft];
    handleFilterChange({ aircraftTypes });
  };

  const handleClearAll = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleSavePreferences = () => {
    // TODO: Implement save to database/localStorage
    const preferenceName = prompt('Enter a name for this filter preset:');
    if (preferenceName) {
      const preferences = {
        id: Date.now().toString(),
        name: preferenceName,
        filters: localFilters,
        createdAt: new Date(),
      };
      // Save to localStorage for now
      const saved = JSON.parse(localStorage.getItem('filter_preferences') || '[]');
      saved.push(preferences);
      localStorage.setItem('filter_preferences', JSON.stringify(saved));
      alert('Filter preferences saved!');
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close filters"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {/* Airlines Filter */}
        <FilterSection
          title="Airlines"
          count={localFilters.airlines.length}
          expanded={expandedSections.has('airlines')}
          onToggle={() => toggleSection('airlines')}
        >
          <div className="space-y-2">
            {COMMON_AIRLINES.map((airline) => (
              <label
                key={airline.code}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.airlines.includes(airline.code)}
                  onChange={() => handleAirlineToggle(airline.code)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">
                  {airline.name} ({airline.code})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Stops Filter */}
        <FilterSection
          title="Number of Stops"
          count={localFilters.stops.length}
          expanded={expandedSections.has('stops')}
          onToggle={() => toggleSection('stops')}
        >
          <div className="space-y-2">
            {[
              { value: 'nonstop' as StopFilter, label: 'Nonstop' },
              { value: 'one_stop' as StopFilter, label: '1 Stop' },
              { value: 'two_plus' as StopFilter, label: '2+ Stops' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.stops.includes(option.value)}
                  onChange={() => handleStopToggle(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Duration Filter */}
        <FilterSection
          title="Flight Duration"
          expanded={expandedSections.has('duration')}
          onToggle={() => toggleSection('duration')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700">
                Maximum Duration: {formatDuration(localFilters.durationRange.max)}
              </label>
              <input
                type="range"
                min="60"
                max="1440"
                step="30"
                value={localFilters.durationRange.max}
                onChange={(e) =>
                  handleFilterChange({
                    durationRange: {
                      ...localFilters.durationRange,
                      max: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1h</span>
                <span>24h</span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Departure Time Filter */}
        <FilterSection
          title="Departure Time"
          count={localFilters.departureTime.length}
          expanded={expandedSections.has('departureTime')}
          onToggle={() => toggleSection('departureTime')}
        >
          <div className="grid grid-cols-2 gap-2">
            {(['morning', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map((time) => (
              <button
                key={time}
                onClick={() => handleTimeToggle('departureTime', time)}
                className={`
                  p-3 rounded-lg border-2 transition-colors text-left
                  ${localFilters.departureTime.includes(time)
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-blue-400 text-gray-700'
                  }
                `}
              >
                <div className="text-xs font-medium capitalize">{time}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatTimeOfDay(time).split('(')[1]?.replace(')', '')}
                </div>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Arrival Time Filter */}
        <FilterSection
          title="Arrival Time"
          count={localFilters.arrivalTime.length}
          expanded={expandedSections.has('arrivalTime')}
          onToggle={() => toggleSection('arrivalTime')}
        >
          <div className="grid grid-cols-2 gap-2">
            {(['morning', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map((time) => (
              <button
                key={time}
                onClick={() => handleTimeToggle('arrivalTime', time)}
                className={`
                  p-3 rounded-lg border-2 transition-colors text-left
                  ${localFilters.arrivalTime.includes(time)
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-blue-400 text-gray-700'
                  }
                `}
              >
                <div className="text-xs font-medium capitalize">{time}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatTimeOfDay(time).split('(')[1]?.replace(')', '')}
                </div>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Aircraft Type Filter */}
        <FilterSection
          title="Aircraft Type"
          count={localFilters.aircraftTypes.length}
          expanded={expandedSections.has('aircraft')}
          onToggle={() => toggleSection('aircraft')}
        >
          <div className="space-y-2">
            {COMMON_AIRCRAFT.map((aircraft) => (
              <label
                key={aircraft}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.aircraftTypes.includes(aircraft)}
                  onChange={() => handleAircraftToggle(aircraft)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{aircraft}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Baggage Filter */}
        <FilterSection
          title="Baggage"
          expanded={expandedSections.has('baggage')}
          onToggle={() => toggleSection('baggage')}
        >
          <div className="space-y-2">
            {[
              { value: true, label: 'Checked baggage included' },
              { value: false, label: 'No checked baggage' },
              { value: null, label: 'Any' },
            ].map((option) => (
              <label
                key={String(option.value)}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="baggage"
                  checked={localFilters.baggageIncluded === option.value}
                  onChange={() =>
                    handleFilterChange({ baggageIncluded: option.value })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleSavePreferences}
          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Save Filter Preferences
        </button>
      </div>
    </div>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  count,
  expanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}
