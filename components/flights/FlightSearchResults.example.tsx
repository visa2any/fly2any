'use client';

/**
 * Complete Flight Search Results Example
 *
 * This file demonstrates a full implementation of flight search results
 * with integrated Deal Score algorithm, sorting, filtering, and UI.
 *
 * @module components/flights/FlightSearchResults.example
 */

import React, { useState, useMemo } from 'react';
import { batchCalculateDealScores, DealScoreBreakdown } from '@/lib/flights/dealScore';
import { FlightCardWithDealScore } from './FlightCardWithDealScore';
import { ArrowUpDown, Filter, Star, Clock, DollarSign } from 'lucide-react';

interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
}

interface FlightData {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  price: number;
  currency: string;
  departure: {
    airport: {
      code: string;
      city: string;
      name: string;
    };
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: {
      code: string;
      city: string;
      name: string;
    };
    time: string;
    terminal?: string;
  };
  duration: number;
  stops: number;
  layovers?: Array<{
    airport: {
      code: string;
      city: string;
      name: string;
    };
    duration: number;
  }>;
  seatsRemaining: number;
  aircraftType?: string;
  onTimePerformance?: number;
  aircraftAge?: number;
  airlineRating?: number;
  layoverQuality?: number;
}

type FlightWithScore = FlightData & { dealScore: DealScoreBreakdown };

type SortOption = 'deal_score' | 'price_asc' | 'price_desc' | 'duration' | 'departure' | 'arrival';
type FilterTier = 'all' | 'excellent' | 'great' | 'good' | 'fair';

interface FlightSearchResultsProps {
  searchParams: SearchParams;
  flights: FlightData[];
  loading?: boolean;
  onFlightSelect?: (flight: FlightWithScore) => void;
}

/**
 * Main Flight Search Results Component
 */
export function FlightSearchResults({
  searchParams,
  flights,
  loading = false,
  onFlightSelect,
}: FlightSearchResultsProps) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('deal_score');
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [maxStops, setMaxStops] = useState<number | null>(null);

  // Calculate deal scores for all flights
  const flightsWithScores = useMemo<FlightWithScore[]>(() => {
    if (flights.length === 0) return [];

    const scores = batchCalculateDealScores(
      flights.map(flight => ({
        price: flight.price,
        factors: {
          duration: flight.duration,
          stops: flight.stops,
          departureTime: flight.departure.time,
          arrivalTime: flight.arrival.time,
          onTimePerformance: flight.onTimePerformance,
          aircraftAge: flight.aircraftAge,
          seatAvailability: flight.seatsRemaining,
          airlineRating: flight.airlineRating,
          layoverQuality: flight.layoverQuality,
        },
      }))
    );

    return flights.map((flight, i) => ({
      ...flight,
      dealScore: scores[i],
    }));
  }, [flights]);

  // Apply filters
  const filteredFlights = useMemo(() => {
    let result = [...flightsWithScores];

    // Filter by tier
    if (filterTier !== 'all') {
      result = result.filter(f => f.dealScore.tier === filterTier);
    }

    // Filter by max price
    if (maxPrice !== null) {
      result = result.filter(f => f.price <= maxPrice);
    }

    // Filter by max stops
    if (maxStops !== null) {
      result = result.filter(f => f.stops <= maxStops);
    }

    return result;
  }, [flightsWithScores, filterTier, maxPrice, maxStops]);

  // Sort flights
  const sortedFlights = useMemo(() => {
    const result = [...filteredFlights];

    switch (sortBy) {
      case 'deal_score':
        result.sort((a, b) => b.dealScore.total - a.dealScore.total);
        break;
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        result.sort((a, b) => a.duration - b.duration);
        break;
      case 'departure':
        result.sort((a, b) => new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime());
        break;
      case 'arrival':
        result.sort((a, b) => new Date(a.arrival.time).getTime() - new Date(b.arrival.time).getTime());
        break;
    }

    return result;
  }, [filteredFlights, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (flightsWithScores.length === 0) {
      return {
        total: 0,
        excellentDeals: 0,
        averagePrice: 0,
        lowestPrice: 0,
        averageScore: 0,
      };
    }

    return {
      total: flightsWithScores.length,
      excellentDeals: flightsWithScores.filter(f => f.dealScore.tier === 'excellent').length,
      averagePrice: flightsWithScores.reduce((sum, f) => sum + f.price, 0) / flightsWithScores.length,
      lowestPrice: Math.min(...flightsWithScores.map(f => f.price)),
      averageScore: flightsWithScores.reduce((sum, f) => sum + f.dealScore.total, 0) / flightsWithScores.length,
    };
  }, [flightsWithScores]);

  const handleFlightSelect = (flight: FlightWithScore) => {
    setSelectedFlightId(flight.id);
    onFlightSelect?.(flight);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Finding the best deals...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">No flights found for your search criteria.</p>
        <p className="text-gray-500 mt-2">Try adjusting your dates or search parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchParams.origin} → {searchParams.destination}
            </h2>
            <p className="text-gray-600">
              {new Date(searchParams.departureDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {searchParams.returnDate && (
                <> - {new Date(searchParams.returnDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}</>
              )}
              {' • '}
              {searchParams.passengers} {searchParams.passengers === 1 ? 'passenger' : 'passengers'}
              {' • '}
              {searchParams.cabinClass}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              {stats.total}
            </p>
            <p className="text-sm text-gray-600">flights found</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              <p className="text-2xl font-bold text-gray-900">{stats.excellentDeals}</p>
            </div>
            <p className="text-sm text-gray-600">Excellent Deals</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <p className="text-2xl font-bold text-gray-900">
                ${stats.lowestPrice.toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-600">Lowest Price</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <p className="text-2xl font-bold text-gray-900">
                ${Math.round(stats.averagePrice).toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-600">Average Price</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ArrowUpDown className="w-4 h-4 text-blue-500" />
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.averageScore)}
              </p>
            </div>
            <p className="text-sm text-gray-600">Avg Deal Score</p>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          {/* Sort Options */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ArrowUpDown className="w-4 h-4 inline mr-1" />
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deal_score">Best Deal (Recommended)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration">Shortest Duration</option>
              <option value="departure">Departure Time</option>
              <option value="arrival">Arrival Time</option>
            </select>
          </div>

          {/* Filter by Tier */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Deal Quality
            </label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as FilterTier)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Deals</option>
              <option value="excellent">Excellent Only</option>
              <option value="great">Great & Above</option>
              <option value="good">Good & Above</option>
              <option value="fair">Fair & Above</option>
            </select>
          </div>

          {/* Filter by Stops */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Max Stops
            </label>
            <select
              value={maxStops ?? 'all'}
              onChange={(e) => setMaxStops(e.target.value === 'all' ? null : parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Any</option>
              <option value="0">Non-stop only</option>
              <option value="1">1 stop max</option>
              <option value="2">2 stops max</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(filterTier !== 'all' || maxStops !== null || maxPrice !== null) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterTier('all');
                  setMaxStops(null);
                  setMaxPrice(null);
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {sortedFlights.length !== flightsWithScores.length && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {sortedFlights.length} of {flightsWithScores.length} flights
            </p>
          </div>
        )}
      </div>

      {/* Results Count */}
      {sortedFlights.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No flights match your filters.</p>
          <button
            onClick={() => {
              setFilterTier('all');
              setMaxStops(null);
              setMaxPrice(null);
            }}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters to see all results
          </button>
        </div>
      ) : (
        <>
          {/* Featured Deal (if excellent deals exist) */}
          {stats.excellentDeals > 0 && sortBy === 'deal_score' && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-400 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-bold text-amber-900">Featured Excellent Deal</h3>
              </div>
              <FlightCardWithDealScore
                flight={sortedFlights[0]}
                onSelect={handleFlightSelect}
                selected={selectedFlightId === sortedFlights[0].id}
              />
            </div>
          )}

          {/* Flight List */}
          <div className="space-y-4">
            {sortedFlights.map((flight, index) => {
              // Skip first flight if it's featured
              if (index === 0 && stats.excellentDeals > 0 && sortBy === 'deal_score') {
                return null;
              }

              return (
                <FlightCardWithDealScore
                  key={flight.id}
                  flight={flight}
                  onSelect={handleFlightSelect}
                  selected={selectedFlightId === flight.id}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default FlightSearchResults;
