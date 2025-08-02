'use client';

/**
 * BACKUP: Original complex flights page
 * Moved to backup while system is being optimized
 */

import { useState, useCallback, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import FlightResultsList from '@/components/flights/FlightResultsList';
import FlightDetailsPage from '@/components/flights/FlightDetailsPage';
import FlightFilters from '@/components/flights/FlightFilters';
import SafeFlightInsights from '@/components/flights/SafeFlightInsights';
import FlightCompareBar from '@/components/flights/FlightCompareBar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { BenefitsSection } from '@/components/ui/benefits-section';
import { HeroSection } from '@/components/ui/hero-section';
import { ErrorMessage } from '@/components/ui/error-message';
import { FilterIcon, XIcon } from '@/components/Icons';
import type { 
  FlightSearchFormData, 
  ProcessedFlightOffer, 
  FlightFilters as FlightFiltersType,
  FlightSortOptions,
  FlightSearchResponse 
} from '@/types/flights';
import { convertFormToSearchParams } from '@/lib/flights/validators';

type PageView = 'search' | 'results' | 'details' | 'booking' | 'confirmation';

interface PageState {
  view: PageView;
  searchData: FlightSearchFormData | null;
  searchResults: ProcessedFlightOffer[] | null;
  selectedFlight: ProcessedFlightOffer | null;
  isLoading: boolean;
  error: string | null;
  filters: FlightFiltersType;
  sortOptions: FlightSortOptions;
  compareFlights: ProcessedFlightOffer[];
}

const initialState: PageState = {
  view: 'search',
  searchData: null,
  searchResults: null,
  selectedFlight: null,
  isLoading: false,
  error: null,
  filters: {},
  sortOptions: { sortBy: 'price', sortOrder: 'asc' },
  compareFlights: []
};

// This component is currently disabled due to performance optimization
// It will be restored with improved architecture
export function VoosContentBackup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden font-sans flex flex-col">
      <GlobalMobileStyles />
      <ResponsiveHeader />
      
      <main className="flex-1 flex flex-col min-h-[calc(100vh-140px)] py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Flight Search System Under Maintenance
            </h2>
            <p className="text-gray-600 mb-6">
              We're optimizing our flight search system for better performance. 
              The advanced features will be restored shortly.
            </p>
            <button
              onClick={() => window.location.href = '/cotacao/voos'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Use Alternative Flight Quote Form
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default VoosContentBackup;