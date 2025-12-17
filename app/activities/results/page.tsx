'use client';

import { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Star, Clock, Heart, Loader2, ArrowLeft, Globe, Sparkles, Search } from 'lucide-react';
import { GLOBAL_CITIES, CityDestination } from '@/lib/data/global-cities-database';
import { ProductFilters, applyFilters, defaultFilters } from '@/components/shared/ProductFilters';

interface Activity {
  id: string;
  name: string;
  description?: string;
  price?: { amount: string; currencyCode: string };
  pictures?: { url?: string }[] | string[];
  rating?: number;
  minimumDuration?: string;
  geoCode?: { latitude: number; longitude: number };
  bookingLink?: string;
  self?: { href: string; methods?: string[] };
}

// Pre-filter cities once (static)
const MAIN_CITIES = GLOBAL_CITIES.filter(c => c.type === 'city');
const POPULAR_CITIES = MAIN_CITIES.filter(c => c.popularity && c.popularity >= 8).slice(0, 10);

const findCity = (query: string): CityDestination | undefined => {
  const q = query.toLowerCase();
  return GLOBAL_CITIES.find(c => c.id === q || c.name.toLowerCase() === q || c.aliases?.includes(q));
};

// Skeleton loader for better perceived performance
const ActivitySkeleton = memo(() => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-[16/10] bg-gray-200" />
    <div className="p-4">
      <div className="h-5 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-3/4 bg-gray-100 rounded mb-3" />
      <div className="flex items-center gap-3 mb-3">
        <div className="h-4 w-12 bg-gray-100 rounded" />
        <div className="h-4 w-10 bg-gray-100 rounded" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-xl" />
    </div>
  </div>
));
ActivitySkeleton.displayName = 'ActivitySkeleton';

// Memoized Activity Card - Apple Level 6 styling
const ActivityCard = memo(({ activity, onBook }: { activity: Activity; onBook: (a: Activity, price: number | null, img: string) => void }) => {
  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : null;
  const price = basePrice ? basePrice + Math.max(basePrice * 0.35, 35) : null;
  const firstPic = activity.pictures?.[0];
  const img = typeof firstPic === 'string' ? firstPic : firstPic?.url || '/placeholder-activity.jpg';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
        <Image src={img} alt={activity.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized loading="lazy" />
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        {price && (
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm shadow-md">
            <span className="font-bold text-gray-900">${price.toFixed(0)}</span>
            <span className="text-gray-500 text-xs ml-1">/person</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">{activity.name}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{activity.rating || '4.7'}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{activity.minimumDuration || '2h'}</span>
        </div>
        <button onClick={() => onBook(activity, price, img)} className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors shadow-sm">
          Book Now
        </button>
      </div>
    </div>
  );
});
ActivityCard.displayName = 'ActivityCard';

function ActivityResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const destination = searchParams.get('destination') || 'paris';
  const foundCity = useMemo(() => findCity(destination), [destination]);
  const lat = parseFloat(searchParams.get('lat') || '') || foundCity?.location.lat || 48.8566;
  const lng = parseFloat(searchParams.get('lng') || '') || foundCity?.location.lng || 2.3522;
  const cityName = foundCity?.name || destination;

  const suggestions = useMemo(() => {
    if (searchInput.length === 0) return POPULAR_CITIES;
    const q = searchInput.toLowerCase();
    return MAIN_CITIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.id.includes(q) || c.country.toLowerCase().includes(q) || c.aliases?.some(a => a.includes(q))
    ).slice(0, 10);
  }, [searchInput]);

  const handleSelectCity = useCallback((city: CityDestination) => {
    setSearchInput(city.name);
    setShowSuggestions(false);
    router.push(`/activities/results?destination=${city.id}&lat=${city.location.lat}&lng=${city.location.lng}`);
  }, [router]);

  const handleSearch = useCallback(() => {
    const city = findCity(searchInput);
    if (city) {
      router.push(`/activities/results?destination=${city.id}&lat=${city.location.lat}&lng=${city.location.lng}`);
    } else if (suggestions.length > 0) {
      const first = suggestions[0];
      router.push(`/activities/results?destination=${first.id}&lat=${first.location.lat}&lng=${first.location.lng}`);
    }
  }, [searchInput, suggestions, router]);

  const handleBook = useCallback((activity: Activity, price: number | null, img: string) => {
    router.push(`/activities/book?id=${activity.id}&name=${encodeURIComponent(activity.name)}&price=${price || 0}&img=${encodeURIComponent(img)}&duration=${activity.minimumDuration || '2h'}&link=${encodeURIComponent(activity.bookingLink || '')}`);
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchActivities = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/activities/search?latitude=${lat}&longitude=${lng}&radius=15&type=activities`, { signal: controller.signal });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setActivities(data.data || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load activities');
          setActivities([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
    return () => controller.abort();
  }, [lat, lng]);

  // Apply filters
  const getPrice = useCallback((a: Activity) => {
    const base = a.price?.amount ? parseFloat(a.price.amount) : null;
    return base ? base + Math.max(base * 0.35, 35) : null;
  }, []);

  const filteredActivities = useMemo(() => applyFilters(activities, filters, getPrice), [activities, filters, getPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Activities in {cityName}</h1>
                <p className="text-xs text-gray-500">{loading ? 'Searching...' : `${activities.length} activities found`}</p>
              </div>
            </div>
            {/* Search Input with Suggestions */}
            <div className="flex-1 max-w-md relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destination..."
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-4 py-2.5 text-left hover:bg-purple-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                    >
                      <span className="text-lg">{city.flag}</span>
                      <div>
                        <span className="font-medium text-gray-900">{city.name}</span>
                        <span className="text-gray-500 ml-1 text-xs">{city.country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleSearch} className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex-shrink-0">
              Search
            </button>
          </div>
        </MaxWidthContainer>
      </div>

      {/* Filters - Unified Component */}
      {!loading && activities.length > 0 && (
        <MaxWidthContainer>
          <ProductFilters filters={filters} onChange={setFilters} resultCount={filteredActivities.length} accentColor="purple" />
        </MaxWidthContainer>
      )}

      <MaxWidthContainer>
        {/* Loading Skeleton - Better perceived performance */}
        {loading && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              <span className="text-sm text-gray-600">Discovering amazing activities in {cityName}...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ActivitySkeleton key={i} />)}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && activities.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activities found in {cityName}</p>
          </div>
        )}

        {/* Results Grid - Apple Level 6 */}
        {!loading && filteredActivities.length > 0 && (
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onBook={handleBook} />
            ))}
          </div>
        )}

        {/* No matches after filter */}
        {!loading && activities.length > 0 && filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activities match your filters</p>
            <button onClick={() => setFilters(defaultFilters)} className="mt-3 text-purple-600 font-medium hover:underline">Clear filters</button>
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}

export default function ActivityResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    }>
      <ActivityResultsContent />
    </Suspense>
  );
}
