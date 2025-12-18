'use client';

import { useState, useEffect, Suspense, memo, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Star, Clock, Heart, Loader2, ArrowLeft, Globe, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageSlider } from '@/components/shared/ImageSlider';
import { GLOBAL_CITIES, CityDestination } from '@/lib/data/global-cities-database';
import { ProductFilters, applyFilters, defaultFilters, type SortOption, type PriceRange, type DurationRange } from '@/components/shared/ProductFilters';
import { ResultsPageSchema } from '@/components/seo/GEOEnhancer';

interface Tour {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
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

// Fast city lookup
const findCity = (query: string): CityDestination | undefined => {
  const q = query.toLowerCase();
  return GLOBAL_CITIES.find(c => c.id === q || c.name.toLowerCase() === q || c.aliases?.includes(q));
};

// Skeleton loader for better perceived performance
const TourSkeleton = memo(() => (
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
TourSkeleton.displayName = 'TourSkeleton';

// Conversion-optimized Tour Card - Level 6 with social proof & urgency
const TourCard = memo(({ tour, onViewDetails, index }: { tour: Tour; onViewDetails: (tour: Tour, price: number | null, images: string[]) => void; index: number }) => {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== 'undefined') {
      const favs = JSON.parse(localStorage.getItem('tour-favorites') || '[]');
      return favs.includes(tour.id);
    }
    return false;
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('tour-favorites') || '[]');
    const newFavs = isFavorite ? favs.filter((id: string) => id !== tour.id) : [...favs, tour.id];
    localStorage.setItem('tour-favorites', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const basePrice = tour.price?.amount ? parseFloat(tour.price.amount) : null;
  const price = basePrice ? basePrice + Math.max(basePrice * 0.35, 35) : null;
  const images = (tour.pictures || []).map(pic => typeof pic === 'string' ? pic : pic?.url).filter(Boolean) as string[];
  const mainImg = images[0] || '/placeholder-tour.jpg';
  const hasMultiple = images.length > 1;

  // Dynamic social proof & urgency (seeded by tour id for consistency)
  const seed = tour.id.charCodeAt(0) + tour.id.charCodeAt(Math.min(1, tour.id.length - 1)) + tour.id.length;
  const rating = Number(tour.rating) || (4.5 + (seed % 5) * 0.1);
  const reviewCount = 50 + (seed % 200);
  const bookedToday = 2 + (seed % 6); // 2-7 people - more realistic
  const spotsLeft = 3 + (seed % 6);
  const isTopRated = rating >= 4.7;
  const isBestSeller = index < 3;
  const showSocialProof = (seed % 3) === 0; // Only show on ~33% of cards

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative">
      {/* Image Section - Use slider for multiple images */}
      {hasMultiple ? (
        <ImageSlider images={images.slice(0, 5)} alt={tour.name} height="aspect-[16/10]" showArrows={true} showDots={true}>
          {/* Badge inside slider */}
          {(isTopRated || isBestSeller) && (
            <div className={`absolute top-2 left-2 z-30 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-md ${
              isBestSeller ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-amber-400 text-amber-900'
            }`}>
              {isBestSeller ? '🔥 Best Seller' : '⭐ Top Rated'}
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
          {spotsLeft <= 5 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-semibold backdrop-blur-sm z-30">
              {spotsLeft} left!
            </div>
          )}
        </ImageSlider>
      ) : (
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <Image src={mainImg} alt={tour.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" unoptimized />
          {/* Badge for single image */}
          {(isTopRated || isBestSeller) && (
            <div className={`absolute top-2 left-2 z-20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-md ${
              isBestSeller ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-amber-400 text-amber-900'
            }`}>
              {isBestSeller ? '🔥 Best Seller' : '⭐ Top Rated'}
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
          {spotsLeft <= 5 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-red-500/90 text-white text-[10px] font-semibold backdrop-blur-sm">
              {spotsLeft} left!
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-orange-600 transition-colors leading-snug">{tour.name}</h3>
        {/* Rating with review count */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-gray-900 text-sm">{rating.toFixed(1)}</span>
          <span className="text-gray-400 text-xs">({reviewCount} reviews)</span>
          <span className="text-gray-300 mx-1">•</span>
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-gray-500 text-xs">{tour.minimumDuration || '3h'}</span>
        </div>
        {/* Social proof - varied */}
        {showSocialProof && (
          <div className="flex items-center gap-1 mb-2 text-[11px] text-green-600 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {bookedToday} booked in last {1 + (seed % 3)} hours
          </div>
        )}
        <button onClick={() => onViewDetails(tour, price, images)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          View Experience
        </button>
      </div>
    </div>
  );
});
TourCard.displayName = 'TourCard';

const ITEMS_PER_PAGE = 12; // Show 12 items initially for performance

function TourResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
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

  // Memoized suggestions filter
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
    router.push(`/tours/results?destination=${city.id}&lat=${city.location.lat}&lng=${city.location.lng}`);
  }, [router]);

  const handleSearch = useCallback(() => {
    const city = findCity(searchInput);
    if (city) {
      router.push(`/tours/results?destination=${city.id}&lat=${city.location.lat}&lng=${city.location.lng}`);
    } else if (suggestions.length > 0) {
      const first = suggestions[0];
      router.push(`/tours/results?destination=${first.id}&lat=${first.location.lat}&lng=${first.location.lng}`);
    }
  }, [searchInput, suggestions, router]);

  const handleViewDetails = useCallback((tour: Tour, price: number | null, images: string[]) => {
    const desc = tour.shortDescription || tour.description || 'Experience an unforgettable tour with expert guides and amazing sights.';
    // Pass all images as comma-separated for gallery support
    const imgsParam = images.slice(0, 5).map(i => encodeURIComponent(i)).join(',');
    router.push(`/tours/${tour.id}?id=${tour.id}&name=${encodeURIComponent(tour.name)}&price=${price || 0}&imgs=${imgsParam}&duration=${tour.minimumDuration || '3h'}&location=${encodeURIComponent(cityName)}&rating=${tour.rating || 4.8}&desc=${encodeURIComponent(desc.slice(0, 300))}&link=${encodeURIComponent(tour.bookingLink || '')}`);
  }, [router, cityName]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTours = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/activities/search?latitude=${lat}&longitude=${lng}&radius=15&type=tours`, { signal: controller.signal });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTours(data.data || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load tours');
          setTours([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
    return () => controller.abort();
  }, [lat, lng]);

  // Apply filters to tours
  const getPrice = useCallback((tour: Tour) => {
    const base = tour.price?.amount ? parseFloat(tour.price.amount) : null;
    return base ? base + Math.max(base * 0.35, 35) : null;
  }, []);

  const filteredTours = useMemo(() => applyFilters(tours, filters, getPrice), [tours, filters, getPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* GEO Schema for AI search engines */}
      {!loading && tours.length > 0 && (
        <ResultsPageSchema
          type="tour"
          items={tours.slice(0, 20).map(t => ({
            name: t.name,
            description: t.shortDescription || t.description,
            price: t.price?.amount ? parseFloat(t.price.amount) + Math.max(parseFloat(t.price.amount) * 0.35, 35) : 0,
            currency: t.price?.currencyCode || 'USD',
            rating: t.rating || 4.7,
            duration: t.minimumDuration,
          }))}
          pageInfo={{
            title: `Tours in ${cityName}`,
            description: `Discover ${tours.length} amazing tours and experiences in ${cityName}. Book guided tours, adventures, and cultural experiences.`,
            totalResults: tours.length,
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
                <h1 className="text-lg font-bold text-gray-900">Tours in {cityName}</h1>
                <p className="text-xs text-gray-500">{loading ? 'Searching...' : `${tours.length} tours found`}</p>
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
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      className="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
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
            <button onClick={handleSearch} className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors flex-shrink-0">
              Search
            </button>
          </div>
        </MaxWidthContainer>
      </div>

      {/* Filters - Unified Component */}
      {!loading && tours.length > 0 && (
        <MaxWidthContainer>
          <ProductFilters filters={filters} onChange={setFilters} resultCount={filteredTours.length} accentColor="orange" />
        </MaxWidthContainer>
      )}

      <MaxWidthContainer>
        {/* Loading Skeleton - Better perceived performance */}
        {loading && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
              <span className="text-sm text-gray-600">Discovering amazing tours in {cityName}...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <TourSkeleton key={i} />)}
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
        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tours found in {cityName}</p>
          </div>
        )}

        {/* Results Grid - Apple Level 6 with Pagination */}
        {!loading && filteredTours.length > 0 && (
          <>
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTours.slice(0, visibleCount).map((tour, index) => (
                <TourCard key={tour.id} tour={tour} onViewDetails={handleViewDetails} index={index} />
              ))}
            </div>
            {/* Load More Button */}
            {visibleCount < filteredTours.length && (
              <div className="flex justify-center py-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
                >
                  <span>Load More Tours</span>
                  <span className="text-orange-200 text-sm">({filteredTours.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
            {/* Results count */}
            <div className="text-center text-sm text-gray-500 pb-4">
              Showing {Math.min(visibleCount, filteredTours.length)} of {filteredTours.length} tours
            </div>
          </>
        )}

        {/* No matches after filter */}
        {!loading && tours.length > 0 && filteredTours.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tours match your filters</p>
            <button onClick={() => setFilters(defaultFilters)} className="mt-3 text-orange-600 font-medium hover:underline">Clear filters</button>
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}

export default function TourResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-6xl">🗺️</span></div>}>
      <TourResultsContent />
    </Suspense>
  );
}
