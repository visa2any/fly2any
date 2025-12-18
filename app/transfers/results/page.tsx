'use client';

import { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Star, Clock, Users, Loader2, ArrowLeft, MapPin, Navigation, Check, Shield, ArrowUpDown } from 'lucide-react';

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

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating';
type CategoryFilter = 'all' | 'private' | 'luxury' | 'shared' | 'group';

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

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

const TransferCard = memo(({ transfer, onViewDetails }: { transfer: Transfer; onViewDetails: (t: Transfer) => void }) => {
  const price = parseFloat(transfer.price.amount);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl">
              {transfer.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{transfer.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />Up to {transfer.maxPassengers}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{transfer.duration}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{transfer.rating}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-600">${price.toFixed(0)}</div>
            <div className="text-xs text-gray-500">total price</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {transfer.features.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-xs text-gray-600">
              <Check className="w-3 h-3 text-teal-500" />{f}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>{transfer.cancellation}</span>
          </div>
          <button
            onClick={() => onViewDetails(transfer)}
            className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});
TransferCard.displayName = 'TransferCard';

function TransferResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortOption>('recommended');
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

  const filteredTransfers = useMemo(() => {
    let result = [...transfers];
    if (category !== 'all') result = result.filter(t => t.category === category);
    switch (sort) {
      case 'price-low': result.sort((a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount)); break;
      case 'price-high': result.sort((a, b) => parseFloat(b.price.amount) - parseFloat(a.price.amount)); break;
      case 'rating': result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)); break;
    }
    return result;
  }, [transfers, sort, category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
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

        {/* Filters */}
        {!loading && transfers.length > 0 && (
          <div className="py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="pl-2 pr-6 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
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
          </div>
        )}

        {/* Loading Skeleton - Better perceived performance */}
        {loading && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
              <span className="text-sm text-gray-600">Finding the best transfers for you...</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <TransferSkeleton key={i} />)}
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

        {/* Results Grid */}
        {!loading && filteredTransfers.length > 0 && (
          <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} onViewDetails={handleViewDetails} />
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
