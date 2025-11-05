/**
 * CLIENT-SIDE CACHE IMPLEMENTATION EXAMPLE
 *
 * This file shows how to integrate client-side caching into your components.
 * Copy this pattern to any component that fetches data!
 */

'use client';

import React from 'react';
import { useClientCache } from '@/lib/hooks/useClientCache';
import { CacheIndicator } from '@/components/cache/CacheIndicator';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

// ============================================================================
// EXAMPLE 1: TripMatch Preview Section (Simple)
// ============================================================================

interface Trip {
  id: string;
  title: string;
  destination: string;
  pricePerPerson: number;
  // ... other trip fields
}

interface TripsData {
  success: boolean;
  data: Trip[];
  count: number;
}

export function TripMatchPreviewSectionWithCache() {
  // ✅ BEFORE: Manual fetch with useState/useEffect
  // const [trips, setTrips] = useState([]);
  // const [loading, setLoading] = useState(true);

  // ✅ AFTER: Use client cache hook
  const {
    data,
    loading,
    error,
    fromCache,
    cacheAge,
    cacheAgeFormatted,
    refresh,
  } = useClientCache<TripsData>(
    '/api/tripmatch/trips?trending=true&limit=6',
    {
      ttl: 300, // 5 minutes (user-generated content)
      onLoad: (data, fromCache) => {
        console.log(fromCache ? '⚡ Instant load from cache!' : '🌐 Fresh data from server');
      },
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading trips...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Failed to load trips: {error.message}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const trips = data?.data || [];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Cache Indicator */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Trending TripMatch Groups</h2>

          {/* ✅ NEW: Cache indicator for transparency */}
          <CacheIndicator
            cacheAge={cacheAge}
            cacheAgeFormatted={cacheAgeFormatted}
            fromCache={fromCache}
            onRefresh={refresh}
            compact
          />
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        {/* Full Cache Indicator at bottom (optional) */}
        {fromCache && (
          <div className="mt-6">
            <CacheIndicator
              cacheAge={cacheAge}
              cacheAgeFormatted={cacheAgeFormatted}
              fromCache={fromCache}
              onRefresh={refresh}
              className="mx-auto max-w-2xl"
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 2: Flash Deals (With Auto-Refresh)
// ============================================================================

interface FlashDeal {
  id: string;
  from: string;
  to: string;
  price: number;
  originalPrice: number;
  savingsPercent: number;
  expiresAt: string;
}

interface FlashDealsData {
  data: FlashDeal[];
  meta: {
    totalDeals: number;
    averageSavings: number;
  };
}

export function FlashDealsSectionWithCache() {
  const {
    data,
    loading,
    fromCache,
    cacheAgeFormatted,
    timeUntilExpiry,
    refresh,
  } = useClientCache<FlashDealsData>(
    '/api/flights/flash-deals-enhanced',
    {
      ttl: 1800, // 30 minutes
      autoRefresh: true, // ✅ Auto-refresh when expired
    }
  );

  return (
    <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🔥 Flash Deals</h2>
            <p className="text-gray-600">Limited time offers - book now!</p>
          </div>

          {/* Countdown Timer */}
          {timeUntilExpiry && (
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {Math.floor(timeUntilExpiry / 60)}:{(timeUntilExpiry % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-600">until refresh</div>
            </div>
          )}
        </div>

        {/* Cache Indicator */}
        {fromCache && cacheAgeFormatted && (
          <CacheIndicator
            cacheAge={null}
            cacheAgeFormatted={cacheAgeFormatted}
            fromCache={fromCache}
            onRefresh={refresh}
            compact
            className="mb-4"
          />
        )}

        {/* Deals Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.data.map((deal) => (
              <FlashDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 3: Destinations (With Manual Fetch Function)
// ============================================================================

interface Destination {
  id: string;
  city: string;
  country: string;
  lowestPrice: number;
  // ... other fields
}

interface DestinationsData {
  data: Destination[];
  meta: {
    totalDestinations: number;
  };
}

export function DestinationsSectionWithCache() {
  const [continent, setContinent] = React.useState('all');

  // ✅ Dynamic URL based on continent filter
  const url = `/api/flights/destinations-enhanced?continent=${continent}&limit=8`;

  const {
    data,
    loading,
    fromCache,
    cacheAgeFormatted,
    refresh,
  } = useClientCache<DestinationsData>(
    url,
    {
      ttl: 3600, // 1 hour (destinations don't change often)
    }
  );

  const handleContinentChange = (newContinent: string) => {
    setContinent(newContinent);
    // ✅ Cache will automatically handle the new URL
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Popular Destinations</h2>

        {/* Continent Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'americas', 'europe', 'asia-pacific', 'caribbean'].map((c) => (
            <button
              key={c}
              onClick={() => handleContinentChange(c)}
              className={`px-4 py-2 rounded ${
                continent === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Cache Status */}
        {fromCache && (
          <div className="mb-4 text-sm text-green-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
            Loaded instantly from cache ({cacheAgeFormatted})
          </div>
        )}

        {/* Destinations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.data.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// EXAMPLE 4: Simple fetchWithClientCache (Without Hook)
// ============================================================================

import { fetchWithClientCache } from '@/lib/utils/client-cache';

// Use directly in an API call (non-React)
async function loadFlashDeals() {
  try {
    const data = await fetchWithClientCache<FlashDealsData>(
      '/api/flights/flash-deals-enhanced',
      {},
      1800 // 30 minutes TTL
    );

    console.log('Flash deals loaded:', data);
    return data;
  } catch (error) {
    console.error('Failed to load deals:', error);
    throw error;
  }
}

// Force refresh (bypass cache)
async function refreshFlashDeals() {
  const data = await fetchWithClientCache<FlashDealsData>(
    '/api/flights/flash-deals-enhanced',
    {},
    1800,
    true // ✅ forceRefresh = true
  );

  return data;
}

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/**
 * HOW TO MIGRATE EXISTING COMPONENTS:
 *
 * STEP 1: Replace useState/useEffect with useClientCache
 * -------------------------------------------------------
 * BEFORE:
 * ```tsx
 * const [data, setData] = useState(null);
 * const [loading, setLoading] = useState(true);
 *
 * useEffect(() => {
 *   fetch('/api/endpoint')
 *     .then(res => res.json())
 *     .then(data => {
 *       setData(data);
 *       setLoading(false);
 *     });
 * }, []);
 * ```
 *
 * AFTER:
 * ```tsx
 * const { data, loading, fromCache, refresh } = useClientCache(
 *   '/api/endpoint',
 *   { ttl: 900 }
 * );
 * ```
 *
 * STEP 2: Add Cache Indicator
 * ----------------------------
 * ```tsx
 * <CacheIndicator
 *   cacheAge={cacheAge}
 *   cacheAgeFormatted={cacheAgeFormatted}
 *   fromCache={fromCache}
 *   onRefresh={refresh}
 *   compact
 * />
 * ```
 *
 * STEP 3: Choose TTL Based on Data Type
 * --------------------------------------
 * - Static data (airports, airlines): 86400 (24 hours)
 * - Search results (flights, hotels): 900 (15 minutes)
 * - Flash deals: 1800 (30 minutes)
 * - User content (TripMatch): 300 (5 minutes)
 * - Real-time (bookings): 0 (no cache)
 *
 * STEP 4: Test
 * ------------
 * 1. Load page → Should fetch from API
 * 2. Refresh page → Should load instantly from cache
 * 3. Wait TTL duration → Should auto-expire
 * 4. Click refresh button → Should bypass cache
 */

// Dummy components for compilation
function TripCard({ trip }: { trip: Trip }) {
  return <div>Trip: {trip.title}</div>;
}
function FlashDealCard({ deal }: { deal: FlashDeal }) {
  return <div>Deal: {deal.from} → {deal.to}</div>;
}
function DestinationCard({ destination }: { destination: Destination }) {
  return <div>Destination: {destination.city}</div>;
}
function DestinationCardSkeleton() {
  return <div className="animate-pulse bg-gray-200 h-48 rounded"></div>;
}
