'use client';

/**
 * Flight Selector Modal
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plane,
  Clock,
  ArrowRight,
  Luggage,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  SortAsc,
} from 'lucide-react';
import { JourneyFlight } from '@/lib/journey/types';
import { JourneyAPI, FlightSearchResult, JourneyFlightSearchParams } from '@/lib/journey/services/JourneyAPI';

// ============================================================================
// TYPES
// ============================================================================

interface FlightSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (outbound: JourneyFlight, inbound?: JourneyFlight) => void;
  searchParams: JourneyFlightSearchParams;
  isRoundTrip: boolean;
}

type SortOption = 'price' | 'duration' | 'departure';

// ============================================================================
// COMPONENT
// ============================================================================

export function FlightSelector({
  isOpen,
  onClose,
  onSelect,
  searchParams,
  isRoundTrip,
}: FlightSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<FlightSearchResult[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightSearchResult | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxStops: -1, // -1 = any
    maxPrice: 0,
    airlines: [] as string[],
  });

  // Search flights on open
  useEffect(() => {
    if (isOpen && searchParams) {
      searchFlights();
    }
  }, [isOpen, searchParams]);

  const searchFlights = useCallback(async () => {
    setLoading(true);
    try {
      const { results } = await JourneyAPI.searchFlights(searchParams);
      setFlights(results);
      // Reset filters when new results come in
      if (results.length > 0) {
        const maxPrice = Math.max(...results.map(f => f.price.amount));
        setFilters(prev => ({ ...prev, maxPrice }));
      }
    } catch (error) {
      console.error('Flight search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Sort and filter flights
  const sortedFlights = React.useMemo(() => {
    let filtered = [...flights];

    // Apply filters
    if (filters.maxStops >= 0) {
      filtered = filtered.filter(f => f.outbound.stops <= filters.maxStops);
    }
    if (filters.maxPrice > 0) {
      filtered = filtered.filter(f => f.price.amount <= filters.maxPrice);
    }
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(f => filters.airlines.includes(f.airline.code));
    }

    // Sort
    switch (sortBy) {
      case 'price':
        return filtered.sort((a, b) => a.price.amount - b.price.amount);
      case 'duration':
        return filtered.sort((a, b) => a.outbound.duration - b.outbound.duration);
      case 'departure':
        return filtered.sort((a, b) =>
          new Date(a.outbound.departureTime).getTime() -
          new Date(b.outbound.departureTime).getTime()
        );
      default:
        return filtered;
    }
  }, [flights, sortBy, filters]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format time
  const formatTime = (dateStr: string): string => {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Handle selection
  const handleSelect = () => {
    if (!selectedFlight) return;

    const outboundFlight = JourneyAPI.toJourneyFlight(selectedFlight, false);
    const inboundFlight = isRoundTrip && selectedFlight.inbound
      ? JourneyAPI.toJourneyFlight(selectedFlight, true)
      : undefined;

    onSelect(outboundFlight, inboundFlight);
    onClose();
  };

  // Get unique airlines
  const uniqueAirlines = React.useMemo(() => {
    const airlines = new Map<string, { code: string; name: string }>();
    flights.forEach(f => {
      if (!airlines.has(f.airline.code)) {
        airlines.set(f.airline.code, f.airline);
      }
    });
    return Array.from(airlines.values());
  }, [flights]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D63A35]/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#D63A35]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Select Flight</h2>
              <p className="text-xs text-gray-500">
                {searchParams.origin} → {searchParams.destination}
                {isRoundTrip && ` • Round Trip`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Sort & Filter Bar */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? 'bg-[#D63A35] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border-0 bg-transparent text-gray-600 focus:ring-0 cursor-pointer"
            >
              <option value="price">Lowest Price</option>
              <option value="duration">Shortest Duration</option>
              <option value="departure">Earliest Departure</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-3">
            {/* Stops Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Stops</label>
              <div className="flex gap-2">
                {[
                  { value: -1, label: 'Any' },
                  { value: 0, label: 'Non-stop' },
                  { value: 1, label: '1 Stop' },
                  { value: 2, label: '2+ Stops' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters(f => ({ ...f, maxStops: opt.value }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.maxStops === opt.value
                        ? 'bg-[#D63A35] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Airlines Filter */}
            {uniqueAirlines.length > 1 && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Airlines</label>
                <div className="flex flex-wrap gap-2">
                  {uniqueAirlines.map((airline) => (
                    <button
                      key={airline.code}
                      onClick={() => {
                        setFilters(f => ({
                          ...f,
                          airlines: f.airlines.includes(airline.code)
                            ? f.airlines.filter(c => c !== airline.code)
                            : [...f.airlines, airline.code]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filters.airlines.length === 0 || filters.airlines.includes(airline.code)
                          ? 'bg-[#D63A35] text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {airline.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flight List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#D63A35] rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Searching flights...</p>
            </div>
          ) : sortedFlights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No flights found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your dates or filters</p>
            </div>
          ) : (
            sortedFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isRoundTrip={isRoundTrip}
                isSelected={selectedFlight?.id === flight.id}
                onSelect={() => setSelectedFlight(flight)}
                formatDuration={formatDuration}
                formatTime={formatTime}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {sortedFlights.length} flight{sortedFlights.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={handleSelect}
            disabled={!selectedFlight}
            className="h-10 px-6 bg-gradient-to-r from-[#D63A35] to-[#C7342F] hover:from-[#C7342F] hover:to-[#B12F2B] text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Select Flight
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FLIGHT CARD COMPONENT
// ============================================================================

interface FlightCardProps {
  flight: FlightSearchResult;
  isRoundTrip: boolean;
  isSelected: boolean;
  onSelect: () => void;
  formatDuration: (min: number) => string;
  formatTime: (str: string) => string;
}

function FlightCard({
  flight,
  isRoundTrip,
  isSelected,
  onSelect,
  formatDuration,
  formatTime,
}: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-[#D63A35] bg-red-50/50 shadow-lg shadow-red-100'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Outbound Flight */}
      <div className="flex items-center gap-4">
        {/* Airline Logo */}
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          {flight.airline.logo ? (
            <img
              src={flight.airline.logo}
              alt={flight.airline.name}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="text-xs font-bold text-gray-600">{flight.airline.code}</span>
          )}
        </div>

        {/* Flight Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Departure */}
            <div className="text-center">
              <p className="font-semibold text-gray-900">{formatTime(flight.outbound.departureTime)}</p>
              <p className="text-xs text-gray-500">{flight.outbound.departure}</p>
            </div>

            {/* Duration & Stops */}
            <div className="flex-1 flex flex-col items-center px-2">
              <p className="text-xs text-gray-500">{formatDuration(flight.outbound.duration)}</p>
              <div className="w-full h-px bg-gray-300 relative my-1">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
                <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                {flight.outbound.stops === 0 ? 'Non-stop' : `${flight.outbound.stops} stop${flight.outbound.stops > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="font-semibold text-gray-900">{formatTime(flight.outbound.arrivalTime)}</p>
              <p className="text-xs text-gray-500">{flight.outbound.arrival}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{flight.airline.name}</span>
            <span>•</span>
            <span>{flight.outbound.flightNumber}</span>
            {flight.baggageIncluded && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-600">
                  <Luggage className="w-3 h-3" />
                  Baggage
                </span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg text-gray-900">
            ${flight.price.amount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            ${Math.round(flight.price.perPerson).toLocaleString()}/person
          </p>
        </div>
      </div>

      {/* Return Flight (if round trip) */}
      {isRoundTrip && flight.inbound && (
        <>
          <div className="my-3 border-t border-dashed border-gray-200" />
          <div className="flex items-center gap-4 opacity-80">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex-1 flex items-center gap-3">
              <div className="text-center">
                <p className="font-medium text-gray-700">{formatTime(flight.inbound.departureTime)}</p>
                <p className="text-xs text-gray-500">{flight.inbound.departure}</p>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <p className="text-xs text-gray-400">{formatDuration(flight.inbound.duration)}</p>
                <div className="w-full h-px bg-gray-200 relative my-1">
                  <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400">
                  {flight.inbound.stops === 0 ? 'Non-stop' : `${flight.inbound.stops} stop`}
                </p>
              </div>

              <div className="text-center">
                <p className="font-medium text-gray-700">{formatTime(flight.inbound.arrivalTime)}</p>
                <p className="text-xs text-gray-500">{flight.inbound.arrival}</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 text-right">
              Return
            </div>
          </div>
        </>
      )}
    </button>
  );
}

export default FlightSelector;
