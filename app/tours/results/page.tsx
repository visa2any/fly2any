'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Star, Clock, Users, MapPin, Heart, Loader2, ArrowLeft,
  SlidersHorizontal, ChevronDown, Globe, Search
} from 'lucide-react';
import { GLOBAL_CITIES, CityDestination } from '@/lib/data/global-cities-database';

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

// Use GLOBAL_CITIES for all destinations - only get type='city' for main cities
const MAIN_CITIES = GLOBAL_CITIES.filter(c => c.type === 'city');

// Helper to find city by key or name
const findCity = (query: string): CityDestination | undefined => {
  const q = query.toLowerCase();
  return GLOBAL_CITIES.find(c =>
    c.id === q || c.name.toLowerCase() === q || c.aliases?.includes(q)
  );
};

function TourResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const destination = searchParams.get('destination') || 'paris';
  const foundCity = findCity(destination);
  const lat = parseFloat(searchParams.get('lat') || '') || foundCity?.location.lat || 48.8566;
  const lng = parseFloat(searchParams.get('lng') || '') || foundCity?.location.lng || 2.3522;
  const cityName = foundCity?.name || destination;

  // Filter cities based on input - show top 10 matches
  const suggestions = searchInput.length > 0
    ? MAIN_CITIES.filter(c =>
        c.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        c.id.includes(searchInput.toLowerCase()) ||
        c.country.toLowerCase().includes(searchInput.toLowerCase()) ||
        c.aliases?.some(a => a.includes(searchInput.toLowerCase()))
      ).slice(0, 10)
    : MAIN_CITIES.filter(c => c.popularity && c.popularity >= 8).slice(0, 10);

  const handleSelectCity = (city: CityDestination) => {
    setSearchInput(city.name);
    setShowSuggestions(false);
    router.push(`/tours/results?destination=${city.id}&lat=${city.location.lat}&lng=${city.location.lng}`);
  };

  const handleSearch = () => {
    const city = findCity(searchInput);
    if (city) {
      router.push(`/tours/results?destination=${city.id}&lat=${city.location.lat}&lng=${city.location.lng}`);
    } else if (suggestions.length > 0) {
      // Use first suggestion
      const first = suggestions[0];
      router.push(`/tours/results?destination=${first.id}&lat=${first.location.lat}&lng=${first.location.lng}`);
    }
  };

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/activities/search?latitude=${lat}&longitude=${lng}&radius=15&type=tours`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTours(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tours');
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [lat, lng]);

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

      <MaxWidthContainer>
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Finding tours in {cityName}...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tours found in {cityName}</p>
          </div>
        )}

        {!loading && tours.length > 0 && (
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tours.map((tour) => {
              // Apply 35% markup with $35 minimum
              const basePrice = tour.price?.amount ? parseFloat(tour.price.amount) : null;
              const markup = basePrice ? Math.max(basePrice * 0.35, 35) : null;
              const price = basePrice && markup ? basePrice + markup : null;
              // Handle pictures array (can be objects with url or strings)
              const firstPic = tour.pictures?.[0];
              const img = typeof firstPic === 'string' ? firstPic : firstPic?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80';
              return (
                <div key={tour.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={img} alt={tour.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white">
                      <Heart className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    {price && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur shadow-sm">
                        <span className="font-bold text-gray-900 text-sm">${price.toFixed(0)}</span>
                        <span className="text-gray-500 text-[10px] ml-0.5">/person</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors leading-tight">
                      {tour.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tour.rating || '4.8'}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{tour.minimumDuration || '3h'}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/tours/book?id=${tour.id}&name=${encodeURIComponent(tour.name)}&price=${price || 0}&img=${encodeURIComponent(img)}&duration=${tour.minimumDuration || '3h'}&link=${encodeURIComponent(tour.bookingLink || '')}`)}
                      className="w-full mt-1 py-1.5 rounded-lg bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
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
