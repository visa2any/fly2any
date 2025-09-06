'use client';
export const dynamic = 'force-dynamic';

/**
 * Advanced Flight Search Page
 */

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  MapIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightFilters from '@/components/flights/FlightFilters';
import type { FlightSearchFormData, TravelClass } from '@/types/flights';

// Component that uses useSearchParams - needs to be wrapped in Suspense
function FlightSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 5000 },
    airlines: [],
    stops: [],
    departureTime: [],
    airports: {}
  });

  // Get initial search values from URL params - convert to proper types
  const initialValues: Partial<FlightSearchFormData> = {
    origin: searchParams.get('from') ? { 
      iataCode: searchParams.get('from') || '', 
      name: '', 
      city: searchParams.get('from') || '', 
      country: '' 
    } : undefined,
    destination: searchParams.get('to') ? { 
      iataCode: searchParams.get('to') || '', 
      name: '', 
      city: searchParams.get('to') || '', 
      country: '' 
    } : undefined,
    departureDate: searchParams.get('departure') ? new Date(searchParams.get('departure')!) : undefined,
    returnDate: searchParams.get('return') ? new Date(searchParams.get('return')!) : undefined,
    passengers: {
      adults: parseInt(searchParams.get('passengers') || '1'),
      children: 0,
      infants: 0
    },
    travelClass: (searchParams.get('class') || 'ECONOMY') as TravelClass
  };

  const handleSearch = (searchData: any) => {
    // Build search URL with all parameters
    const params = new URLSearchParams({
      origin: searchData.origin?.iataCode || '',
      destination: searchData.destination?.iataCode || '',
      departure: searchData.departureDate.toISOString().split('T')[0],
      passengers: searchData.passengers.adults.toString(),
      class: searchData.travelClass
    });

    if (searchData.returnDate) {
      params.set('return', searchData.returnDate.toISOString().split('T')[0]);
    }

    // Navigate to results
    router.push(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/flights')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-6 h-6" />
                  Advanced Flight Search
                </h1>
                <p className="text-slate-600 text-sm">
                  Find flights with detailed filters and preferences
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${
                showAdvancedFilters 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Search Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 mb-2">
                  Search Flights
                </h2>
                <p className="text-slate-600">
                  Enter your travel details to find the best flights
                </p>
              </div>

              <FlightSearchForm 
                initialData={initialValues}
                onSearch={handleSearch}
              />

              {/* Quick Search Options */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Options</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors">
                    <CalendarDaysIcon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-bold text-blue-800">Flexible Dates</div>
                  </button>
                  
                  <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-center transition-colors">
                    <MapIcon className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-bold text-green-800">Nearby Airports</div>
                  </button>
                  
                  <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors">
                    <UsersIcon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-bold text-purple-800">Group Booking</div>
                  </button>
                  
                  <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl text-center transition-colors">
                    <MagnifyingGlassIcon className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-bold text-orange-800">Multi-City</div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Advanced Filters Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg sticky top-8 transition-all duration-300 ${
                showAdvancedFilters ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filters
              </h3>
              
              {showAdvancedFilters ? (
                <FlightFilters 
                  filters={filters as any}
                  onFiltersChange={(newFilters) => setFilters(newFilters as any)}
                />
              ) : (
                <div className="text-center py-8">
                  <AdjustmentsHorizontalIcon className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 text-sm">
                    Enable advanced filters to refine your search
                  </p>
                  <button
                    onClick={() => setShowAdvancedFilters(true)}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Enable Filters
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Popular Routes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg"
        >
          <h3 className="text-xl font-black text-slate-800 mb-6">Popular Routes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: 'NYC', to: 'LAX', route: 'New York → Los Angeles', price: '$299' },
              { from: 'LAX', to: 'LAS', route: 'Los Angeles → Las Vegas', price: '$89' },
              { from: 'MIA', to: 'NYC', route: 'Miami → New York', price: '$199' },
              { from: 'SFO', to: 'SEA', route: 'San Francisco → Seattle', price: '$149' },
              { from: 'CHI', to: 'DEN', route: 'Chicago → Denver', price: '$179' },
              { from: 'BOS', to: 'MIA', route: 'Boston → Miami', price: '$259' }
            ].map((route, index) => (
              <button
                key={index}
                onClick={() => {
                  const params = new URLSearchParams({
                    from: route.from,
                    to: route.to
                  });
                  router.push(`/flights/search?${params.toString()}`);
                }}
                className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-xl text-left transition-all duration-300 hover:shadow-md"
              >
                <div className="font-bold text-slate-800 mb-1">{route.route}</div>
                <div className="text-blue-600 font-bold">{route.price}</div>
                <div className="text-xs text-slate-500 mt-1">from</div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function FlightSearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl p-8 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-slate-200 rounded"></div>
              <div className="h-12 bg-slate-200 rounded"></div>
              <div className="h-12 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function FlightSearchPage() {
  return (
    <Suspense fallback={<FlightSearchLoading />}>
      <FlightSearchContent />
    </Suspense>
  );
}