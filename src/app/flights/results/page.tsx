'use client';
export const dynamic = 'force-dynamic';

/**
 * Flight Results Page - English version
 */

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightResultsActions from '@/components/flights/FlightResultsActions';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import FallbackDateNotice from '@/components/flights/FallbackDateNotice';
import TestDataNotice from '@/components/flights/TestDataNotice';
import { FlightFilters } from '@/types/flights';

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FlightFilters>({});
  const [flexibleMetadata, setFlexibleMetadata] = useState<any>(null);
  const [fallbackDateInfo, setFallbackDateInfo] = useState<any>(null);
  const [testDataUsed, setTestDataUsed] = useState<boolean>(false);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FlightFilters) => {
    console.log('🔍 FILTERS CHANGED:', newFilters);
    setFilters(newFilters);
  };

  // Handle action button clicks
  const handleExploreMore = () => {
    console.log('🗺️ Opening Explore More modal...');
    // TODO: Implement explore more modal with similar destinations
  };

  const handlePriceAlerts = () => {
    console.log('🔔 Opening Price Alerts setup...');
    // TODO: Implement price alerts setup modal
  };

  const handleShareResults = () => {
    console.log('🔗 Sharing search results...');
    // TODO: Implement sharing functionality
  };

  const handleSaveSearch = () => {
    console.log('💾 Saving search...');
    // TODO: Implement save search functionality
  };

  const searchData = {
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    departure: searchParams.get('departure') || '',
    return: searchParams.get('return') || null,
    adults: parseInt(searchParams.get('adults') || '1'),
    class: searchParams.get('class') || 'ECONOMY'
  };

  useEffect(() => {
    const fetchFlights = async (): Promise<void> => {
      if (!searchData.from || !searchData.to || !searchData.departure) {
        setError('Missing search parameters');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          originLocationCode: searchData.from,
          destinationLocationCode: searchData.to,
          departureDate: searchData.departure,
          adults: searchData.adults.toString(),
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
        
        if (data.success && data.data) {
          setFlights(data.data);
          // Store flexible dates metadata if available
          if (data.meta?.flexibleDates) {
            setFlexibleMetadata(data.meta.flexibleDates);
          }
          
          // Check if test data was used
          if (data.meta?.testDataUsed) {
            setTestDataUsed(true);
          }
          
          // Check if any flight has fallback date metadata
          if (data.data.length > 0) {
            const firstFlight = data.data[0];
            if (firstFlight.searchMetadata?.fallbackDatesUsed) {
              setFallbackDateInfo({
                originalDeparture: firstFlight.searchMetadata.originalDepartureDate,
                originalReturn: firstFlight.searchMetadata.originalReturnDate,
                actualDeparture: firstFlight.searchMetadata.actualDepartureDate,
                actualReturn: firstFlight.searchMetadata.actualReturnDate,
                flightsFound: data.data.length
              });
            }
          }
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
  }, [searchData.from, searchData.to, searchData.departure, searchData.return, searchData.adults, searchData.class]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <ResponsiveHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-12 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">✈️</span>
            </div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Searching Best Flight Deals
            </h3>
            <p className="text-gray-600 font-medium">Our AI is analyzing thousands of flight options for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100">
        <ResponsiveHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-3xl p-12 text-center shadow-xl max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Search Issue</h2>
            <p className="text-slate-600 font-medium mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ResponsiveHeader />
      
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🗺️</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  {searchData.from} → {searchData.to}
                </h1>
                <p className="text-slate-600 font-medium text-sm">
                  {searchData.departure} • {searchData.adults} passenger{searchData.adults > 1 ? 's' : ''} • {searchData.class}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-black text-slate-800">
                  {flights.length}
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  flights found
                </div>
              </div>
              
              {/* Action Buttons */}
              <FlightResultsActions
                searchData={{
                  from: searchData.from,
                  to: searchData.to,
                  departure: searchData.departure,
                  return: searchData.return,
                  adults: searchData.adults,
                  class: searchData.class
                }}
                onExploreMore={handleExploreMore}
                onPriceAlerts={handlePriceAlerts}
                onShareResults={handleShareResults}
                onSaveSearch={handleSaveSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Test Data Notice */}
        {testDataUsed && (
          <TestDataNotice
            flightsCount={flights.length}
            route={`${searchData.from} → ${searchData.to}`}
          />
        )}

        {/* Fallback Date Notice */}
        {fallbackDateInfo && (
          <FallbackDateNotice
            originalDeparture={fallbackDateInfo.originalDeparture}
            originalReturn={fallbackDateInfo.originalReturn}
            actualDeparture={fallbackDateInfo.actualDeparture}
            actualReturn={fallbackDateInfo.actualReturn}
            flightsFound={fallbackDateInfo.flightsFound}
          />
        )}
        
        <FlightResultsList
          offers={flights}
          onOfferSelect={(flight) => {
            window.open(`/flights/${flight.id}`, '_blank');
          }}
          isLoading={false}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          flexibleMetadata={flexibleMetadata}
          searchData={{
            origin: searchData.from,
            destination: searchData.to,
            departureDate: searchData.departure,
            returnDate: searchData.return || undefined,
            passengers: searchData.adults,
            travelClass: searchData.class
          }}
        />
      </div>
      
      <Footer />
    </div>
  );
}

export default function FlightResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-slate-800">Loading...</h2>
        </div>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}