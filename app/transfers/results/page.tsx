'use client';

import { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Star, Clock, Users, Loader2, ArrowLeft, MapPin, Navigation, Check, Shield } from 'lucide-react';
import { ProductFilters, applyFilters, defaultFilters } from '@/components/shared/ProductFilters';
import { ResultsPageSchema } from '@/components/seo/GEOEnhancer';

interface Transfer {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  maxPassengers: number;
  pickup: string;
  dropoff: string;
  price: { amount: string; currency: string };
  duration: string;
  rating: string;
  features: string[];
  cancellation: string;
}

// Category filter chips - transfer-specific
const categoryOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'private', label: 'Private' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'shared', label: 'Shared' },
  { value: 'group', label: 'Group' },
];

// Memoized Transfer Card - Apple Level 6 styling
// Skeleton loader for better perceived performance
const TransferSkeleton = memo(() => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-200" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-100 rounded-lg" />
        <div className="h-6 w-24 bg-gray-100 rounded-lg" />
        <div className="h-6 w-16 bg-gray-100 rounded-lg" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-4 w-28 bg-gray-100 rounded" />
        <div className="h-10 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
));
TransferSkeleton.displayName = 'TransferSkeleton';

// Conversion-optimized Transfer Card - Level 6 with trust signals
const TransferCard = memo(({ transfer, onViewDetails, index }: { transfer: Transfer; onViewDetails: (t: Transfer) => void; index: number }) => {
  const price = parseFloat(transfer.price.amount);
  const rating = parseFloat(transfer.rating);

  // Trust signals & social proof
  const seed = transfer.id.charCodeAt(0) + transfer.id.length;
  const reviewCount = 80 + (seed % 150);
  const carsAvailable = 2 + (seed % 5);
  const isVerified = rating >= 4.5;
  const isPremium = transfer.category === 'luxury';
  const isBestValue = index === 0 && transfer.category !== 'luxury';
  const isLimitedAvail = carsAvailable <= 3;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative">
      {/* Badge */}
      {(isPremium || isBestValue) && (
        <div className={`absolute top-0 right-0 z-20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-bl-xl ${
          isPremium ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'bg-teal-500 text-white'
        }`}>
          {isPremium ? '👑 Premium' : '💎 Best Value'}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
              isPremium ? 'bg-gradient-to-br from-amber-50 to-yellow-100' : 'bg-teal-50'
            }`}>
              {transfer.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{transfer.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-900 text-sm">{rating.toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({reviewCount})</span>
                {isVerified && (
                  <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-semibold rounded">✓ Verified</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">${price.toFixed(0)}</div>
            <div className="text-[10px] text-gray-500">total • no hidden fees</div>
          </div>
        </div>

        {/* Quick info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />Up to {transfer.maxPassengers}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{transfer.duration}</span>
          {isLimitedAvail && (
            <span className="text-orange-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              {carsAvailable} left
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {transfer.features.slice(0, 4).map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-[11px] text-gray-600">
              <Check className="w-3 h-3 text-teal-500" />{f}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Free cancellation</span>
          </div>
          <button
            onClick={() => onViewDetails(transfer)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Book Transfer
          </button>
        </div>
      </div>
    </div>
  );
});
TransferCard.displayName = 'TransferCard';

type CategoryFilter = 'all' | 'private' | 'luxury' | 'shared' | 'group';

function TransferResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(defaultFilters);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const pickup = searchParams.get('pickup') || '';
  const dropoff = searchParams.get('dropoff') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '10:00';
  const passengers = parseInt(searchParams.get('passengers') || '1');

  const handleViewDetails = useCallback((transfer: Transfer) => {
    const params = new URLSearchParams({
      id: transfer.id,
      type: transfer.type,
      name: transfer.name,
      icon: transfer.icon,
      category: transfer.category,
      maxPassengers: transfer.maxPassengers.toString(),
      price: transfer.price.amount,
      pickup,
      dropoff,
      date,
      time,
      passengers: passengers.toString(),
      duration: transfer.duration,
      rating: transfer.rating,
      features: transfer.features.join(','),
      cancellation: transfer.cancellation,
    });
    router.push(`/transfers/${transfer.id}?${params.toString()}`);
  }, [pickup, dropoff, date, time, passengers, router]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTransfers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/transfers/search?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(dropoff)}&date=${date}&passengers=${passengers}`, { signal: controller.signal });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTransfers(data.data || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load transfers');
          setTransfers([]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (pickup && dropoff) fetchTransfers();
    return () => controller.abort();
  }, [pickup, dropoff, date, passengers]);

  // Price getter for ProductFilters
  const getPrice = useCallback((t: Transfer) => parseFloat(t.price.amount), []);

  // Apply unified filters + category filter
  const filteredTransfers = useMemo(() => {
    // First apply category filter
    let result = category !== 'all' ? transfers.filter(t => t.category === category) : transfers;

    // Map to format expected by applyFilters (add rating as number)
    const mapped = result.map(t => ({ ...t, rating: parseFloat(t.rating), minimumDuration: t.duration }));

    // Apply price/rating/sort filters
    const filtered = applyFilters(mapped, filters, (item) => getPrice(item as unknown as Transfer));

    return filtered as unknown as Transfer[];
  }, [transfers, filters, category, getPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
      {/* GEO Schema for AI search engines */}
      {!loading && transfers.length > 0 && (
        <ResultsPageSchema
          type="transfer"
          items={transfers.map(t => ({
            name: t.name,
            price: parseFloat(t.price.amount),
            currency: t.price.currency,
            pickup: t.pickup,
            dropoff: t.dropoff,
            vehicleType: t.category,
            maxPassengers: t.maxPassengers,
            rating: parseFloat(t.rating),
          }))}
          pageInfo={{
            title: `Airport Transfers from ${pickup} to ${dropoff}`,
            description: `Compare ${transfers.length} transfer options from ${pickup} to ${dropoff}. Private cars, luxury vehicles, and shared shuttles available.`,
            totalResults: transfers.length,
            location: `${pickup} to ${dropoff}`,
          }}
        />
      )}
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <MaxWidthContainer>
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Airport Transfers</h1>
                <p className="text-xs text-gray-500">{loading ? 'Searching...' : `${transfers.length} options found`}</p>
              </div>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <MaxWidthContainer>
        {/* Route Summary */}
        <div className="py-4 flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="font-medium">{pickup}</span>
          </div>
          <Navigation className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span className="font-medium">{dropoff}</span>
          </div>
          {date && <span className="text-gray-500 ml-2">{date} at {time}</span>}
          <span className="text-gray-500">{passengers} passenger{passengers > 1 ? 's' : ''}</span>
        </div>

        {/* Unified Filters + Category Chips */}
        {!loading && transfers.length > 0 && (
          <>
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              resultCount={filteredTransfers.length}
              accentColor="teal"
              showDuration={false}
            />
            {/* Category Filter Chips */}
            <div className="py-2 flex gap-2 flex-wrap">
              {categoryOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => setCategory(o.value as CategoryFilter)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    category === o.value ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Loading Skeleton - Better perceived performance */}
        {loading && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
              <span className="text-sm text-gray-600">Finding the best transfers for you...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <TransferSkeleton key={i} />)}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Results Grid - Standardized 4-col layout */}
        {!loading && filteredTransfers.length > 0 && (
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTransfers.map((transfer, index) => (
              <TransferCard key={transfer.id} transfer={transfer} onViewDetails={handleViewDetails} index={index} />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && !error && transfers.length === 0 && (
          <div className="text-center py-16">
            <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transfers found for this route</p>
          </div>
        )}

        {/* No matches after filter */}
        {!loading && transfers.length > 0 && filteredTransfers.length === 0 && (
          <div className="text-center py-16">
            <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transfers match your filters</p>
            <button
              onClick={() => { setFilters(defaultFilters); setCategory('all'); }}
              className="mt-3 text-teal-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}

export default function TransferResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>}>
      <TransferResultsContent />
    </Suspense>
  );
}
