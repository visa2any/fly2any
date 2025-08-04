'use client';

/**
 * 🎯 FLIGHT RESULTS PAGE - Premium Experience
 * 
 * This page opens in a new tab after the cinematic transition
 * and displays comprehensive flight search results with advanced filtering
 */

import React, { useEffect, useState, Suspend } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Import existing components
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightFilters from '@/components/flights/FlightFilters';
import FlightInsights from '@/components/flights/FlightInsights';
import { FlightSearchFormData, FlightOffer } from '@/types/flights';

export default function FlightResultsPage() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  
  // Extract search parameters
  const searchData = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departure: searchParams.get('departure') || '',
    return: searchParams.get('return') || null,
    passengers: parseInt(searchParams.get('passengers') || '1'),
    class: searchParams.get('class') || 'ECONOMY'
  };

  // Fetch flight results
  useEffect(() => {
    const fetchFlights = async () => {
      if (!searchData.origin || !searchData.destination || !searchData.departure) {
        setError('Missing search parameters');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          originLocationCode: searchData.origin,
          destinationLocationCode: searchData.destination,
          departureDate: searchData.departure,
          adults: searchData.passengers.toString(),
          travelClass: searchData.class,
          currencyCode: 'USD',
          max: '50'
        });

        if (searchData.return) {
          queryParams.append('returnDate', searchData.return);
        }

        const response = await fetch(`/api/flights/search?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.flights) {
          setFlights(data.flights);
        } else {
          throw new Error(data.error || 'Failed to fetch flights');
        }
      } catch (err) {
        console.error('Flight search error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while searching for flights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, [searchData.origin, searchData.destination, searchData.departure, searchData.return, searchData.passengers, searchData.class]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-12 text-center shadow-xl"
          >
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <SparklesIcon className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Finalizing Your Perfect Flights
            </h2>
            <p className="text-slate-600 font-medium">
              Applying final optimizations and sorting by best value...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-3xl p-12 text-center shadow-xl max-w-md"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Search Issue
            </h2>
            <p className="text-slate-600 font-medium mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-white/40 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  {searchData.origin} → {searchData.destination}
                </h1>
                <p className="text-slate-600 font-medium text-sm">
                  {searchData.departure} • {searchData.passengers} passenger{searchData.passengers > 1 ? 's' : ''} • {searchData.class}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black text-slate-800">
                  {flights.length}
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  flights found
                </div>
              </div>
              <div className="w-px h-8 bg-slate-300" />
              <button className="p-2 bg-white/70 border border-white/60 rounded-xl hover:bg-white/80 transition-all duration-300">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filters
              </h3>
              {/* FlightFilters would go here - simplified for now */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price Range</label>
                  <input
                    type="range"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Departure Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                      Morning
                    </button>
                    <button className="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      Afternoon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Results */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-9"
          >
            {/* Insights */}
            <div className="mb-8">
              <FlightInsights 
                searchResults={flights}
                searchParams={{
                  origin: searchData.origin,
                  destination: searchData.destination,
                  departureDate: searchData.departure,
                  returnDate: searchData.return,
                  passengers: searchData.passengers
                }}
              />
            </div>

            {/* Results List */}
            <FlightResultsList
              offers={flights}
              onSelectFlight={(flight) => {
                console.log('Selected flight:', flight);
                // Handle flight selection
              }}
              loading={false}
              error={null}
              searchParams={{
                origin: searchData.origin,
                destination: searchData.destination,
                departureDate: searchData.departure,
                returnDate: searchData.return || undefined,
                passengers: searchData.passengers,
                travelClass: searchData.class as any
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}