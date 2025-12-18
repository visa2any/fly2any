'use client';

import { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Star, Clock, Heart, Loader2, ArrowLeft, Globe, Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageSlider } from '@/components/shared/ImageSlider';
import { GLOBAL_CITIES, CityDestination } from '@/lib/data/global-cities-database';
import { ProductFilters, applyFilters, defaultFilters } from '@/components/shared/ProductFilters';
import { ResultsPageSchema } from '@/components/seo/GEOEnhancer';

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

// Conversion-optimized Activity Card - Level 6 with social proof & urgency
const ActivityCard = memo(({ activity, onViewDetails, index }: { activity: Activity; onViewDetails: (a: Activity, price: number | null, images: string[]) => void; index: number }) => {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('activity-favorites') || '[]');
      return favs.includes(activity.id);
    }
    return false;
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('activity-favorites') || '[]');
    const newFavs = isFavorite ? favs.filter((id: string) => id !== activity.id) : [...favs, activity.id];
    localStorage.setItem('activity-favorites', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : null;
  const price = basePrice ? basePrice + Math.max(basePrice * 0.35, 35) : null;
  const images = (activity.pictures || []).map(pic => typeof pic === 'string' ? pic : pic?.url).filter(Boolean) as string[];
  const mainImg = images[0] || '/placeholder-activity.jpg';
  const hasMultiple = images.length > 1;

  // Dynamic social proof & urgency
  const seed = activity.id.charCodeAt(0) + activity.id.charCodeAt(Math.min(1, activity.id.length - 1)) + activity.id.length;
  const rating = Number(activity.rating) || (4.4 + (seed % 6) * 0.1);
  const reviewCount = 30 + (seed % 180);
  const bookedToday = 1 + (seed % 5); // 1-5 people - more realistic
  const spotsLeft = 2 + (seed % 6);
  const isTopRated = rating >= 4.6;
  const isPopular = index < 4;
  const showSocialProof = (seed % 4) === 0; // Only show on ~25% of cards

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative">
      {/* Image Section - Use slider for multiple images */}
      {hasMultiple ? (
        <ImageSlider images={images.slice(0, 5)} alt={activity.name} height="aspect-[16/10]" showArrows={true} showDots={true}>
          {/* Badge inside slider */}
          {(isTopRated || isPopular) && (
            <div className={`absolute top-2 left-2 z-30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-md ${
              isPopular ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              {isPopular ? '✨ Popular' : '⭐ Top Rated'}
            </div>
          )}
          <button onClick={toggleFavorite} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 hover:bg-white transition-all z-30">
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
          </button>
          {price && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm shadow-md z-30">
              <span className="font-bold text-gray-900">${price.toFixed(0)}</span>
              <span className="text-gray-500 text-xs ml-1">/person</span>
            </div>
          )}
          {spotsLeft <= 4 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-semibold backdrop-blur-sm z-30">
              {spotsLeft} left!
            </div>
          )}
        </ImageSlider>
      ) : (
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <Image src={mainImg} alt={activity.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" unoptimized />
          {/* Badge for single image */}
          {(isTopRated || isPopular) && (
            <div className={`absolute top-2 left-2 z-20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-md ${
              isPopular ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              {isPopular ? '✨ Popular' : '⭐ Top Rated'}
            </div>
          )}
          <button onClick={toggleFavorite} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 hover:bg-white transition-all z-10">
            <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
          </button>
          {price && (
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm shadow-md">
              <span className="font-bold text-gray-900">${price.toFixed(0)}</span>
              <span className="text-gray-500 text-xs ml-1">/person</span>
            </div>
          )}
          {spotsLeft <= 4 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-semibold backdrop-blur-sm">
              {spotsLeft} left!
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-purple-600 transition-colors leading-snug">{activity.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-900 text-sm">{rating.toFixed(1)}</span>
          <span className="text-gray-400 text-xs">({reviewCount} reviews)</span>
          <span className="text-gray-300 mx-1">•</span>
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-gray-500 text-xs">{activity.minimumDuration || '2h'}</span>
        </div>
        {showSocialProof && (
          <div className="flex items-center gap-1 mb-2 text-[11px] text-green-600 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {bookedToday} joined in last {1 + (seed % 2)} hour{(seed % 2) === 0 ? '' : 's'}
          </div>
        )}
        <button onClick={() => onViewDetails(activity, price, images)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-sm hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          Explore Activity
        </button>
      </div>
    </div>
  );
});
ActivityCard.displayName = 'ActivityCard';

const ITEMS_PER_PAGE = 12; // Show 12 items initially for performance

function ActivityResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

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

  const handleViewDetails = useCallback((activity: Activity, price: number | null, images: string[]) => {
    const desc = activity.description || 'Enjoy an exciting activity with professional guides.';
    // Pass all images as comma-separated for gallery support
    const imgsParam = images.slice(0, 5).map(i => encodeURIComponent(i)).join(',');
    router.push(`/activities/${activity.id}?id=${activity.id}&name=${encodeURIComponent(activity.name)}&price=${price || 0}&imgs=${imgsParam}&duration=${activity.minimumDuration || '2h'}&location=${encodeURIComponent(cityName)}&rating=${activity.rating || 4.7}&desc=${encodeURIComponent(desc.slice(0, 300))}&link=${encodeURIComponent(activity.bookingLink || '')}`);
  }, [router, cityName]);

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
      {/* GEO Schema for AI search engines */}
      {!loading && activities.length > 0 && (
        <ResultsPageSchema
          type="activity"
          items={activities.slice(0, 20).map(a => ({
            name: a.name,
            description: a.description,
            price: a.price?.amount ? parseFloat(a.price.amount) + Math.max(parseFloat(a.price.amount) * 0.35, 35) : 0,
            currency: a.price?.currencyCode || 'USD',
            rating: a.rating || 4.6,
            duration: a.minimumDuration,
          }))}
          pageInfo={{
            title: `Activities in ${cityName}`,
            description: `Explore ${activities.length} unique activities and experiences in ${cityName}. Classes, shows, tickets, and more.`,
            totalResults: activities.length,
            location: cityName,
          }}
        />
      )}
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

        {/* Results Grid - Apple Level 6 with Pagination */}
        {!loading && filteredActivities.length > 0 && (
          <>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredActivities.slice(0, visibleCount).map((activity, index) => (
                <ActivityCard key={activity.id} activity={activity} onViewDetails={handleViewDetails} index={index} />
              ))}
            </div>
            {/* Load More Button */}
            {visibleCount < filteredActivities.length && (
              <div className="flex justify-center py-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                >
                  <span>Load More Activities</span>
                  <span className="text-purple-200 text-sm">({filteredActivities.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
            {/* Results count */}
            <div className="text-center text-sm text-gray-500 pb-4">
              Showing {Math.min(visibleCount, filteredActivities.length)} of {filteredActivities.length} activities
            </div>
          </>
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
