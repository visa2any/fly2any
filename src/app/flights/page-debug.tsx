/**
 * 🔧 DEBUG VERSION - Minimal flights page to isolate React fiber errors
 * ULTRATHINK approach: Add components one by one to find the culprit
 */

'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import Head from 'next/head'; // SUSPECTED ISSUE: Head in app router

// Essential imports only
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import SimpleHeroSection from '@/components/flights/SimpleHeroSection';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorMessage } from '@/components/ui/error-message';

// Types
import type { 
  FlightSearchFormData, 
  ProcessedFlightOffer, 
  FlightFilters as FlightFiltersType,
  FlightSortOptions,
  FlightSearchResponse,
  FlightComparison,
  PriceInsights,
  TravelClass
} from '@/types/flights';

type PageView = 'search' | 'results' | 'details' | 'booking' | 'confirmation';

interface MinimalPageState {
  view: PageView;
  searchData: FlightSearchFormData | null;
  searchResults: ProcessedFlightOffer[] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MinimalPageState = {
  view: 'search',
  searchData: null,
  searchResults: null,
  isLoading: false,
  error: null
};

/**
 * Minimal Flights Page Component - Debug Version
 */
function FlightsPageDebugContent() {
  const [state, setState] = useState<MinimalPageState>(initialState);
  
  // Handle flight search
  const handleFlightSearch = useCallback(async (searchData: FlightSearchFormData) => {
    console.log('🔍 Flight search triggered:', searchData);
    setState(prev => ({ ...prev, isLoading: true, error: null, searchData }));
    
    // Simulate search for now
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        view: 'results', 
        isLoading: false,
        searchResults: [] // Empty results for debugging
      }));
    }, 1000);
  }, []);

  // Render current view
  const renderCurrentView = () => {
    switch (state.view) {
      case 'search':
        return (
          <div>
            {/* 🚀 MINIMAL HERO SECTION - Testing fiber issues */}
            <SimpleHeroSection 
              onSearch={handleFlightSearch}
              isLoading={state.isLoading}
            />
          </div>
        );

      case 'results':
        return (
          <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-4">Search Results</h1>
              <p className="text-gray-600 mb-8">No results found (debug mode)</p>
              <button
                onClick={() => setState(prev => ({ ...prev, view: 'search' }))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Search
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Debug Mode</h1>
              <button
                onClick={() => setState(prev => ({ ...prev, view: 'search' }))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Search
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Only show header when NOT on search view for maximum hero visibility */}
      {state.view !== 'search' && <ResponsiveHeader />}
      
      {/* Error Message */}
      {state.error && (
        <ErrorMessage
          message={state.error}
          onClose={() => setState(prev => ({ ...prev, error: null }))}
        />
      )}

      {/* Main Content - No padding for search view to maximize space */}
      <main className={state.view === 'search' ? '' : 'pt-16'}>
        <ErrorBoundary>
          {renderCurrentView()}
        </ErrorBoundary>
      </main>

      {/* Footer only on non-search views */}
      {state.view !== 'search' && <Footer />}
    </div>
  );
}

/**
 * Main Debug Flights Page with Suspense wrapper
 */
export default function FlightsPageDebug() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading debug page...</p>
        </div>
      </div>
    }>
      <FlightsPageDebugContent />
    </Suspense>
  );
}