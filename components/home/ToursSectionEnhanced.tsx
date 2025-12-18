'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, Heart, Loader2, ArrowRight, Sparkles, Flame, MapPin } from 'lucide-react';
import { CacheIndicator } from '@/components/cache/CacheIndicator';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { ImageSlider } from '@/components/shared/ImageSlider';

interface Tour {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price?: { amount: string; currencyCode: string };
  pictures?: { url?: string }[] | string[];
  rating?: number;
  minimumDuration?: string;
  bookingLink?: string;
  geoCode?: { latitude: number; longitude: number };
  categories?: string[];
  reviewCount?: number;
  bookingsToday?: number;
  spotsLeft?: number;
  isPopular?: boolean;
  isBestSeller?: boolean;
}

interface ToursSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🗺️ Discover Amazing Tours',
    subtitle: 'Guided experiences from top providers worldwide',
    viewAll: 'View All',
    perPerson: 'per person',
    bookNow: 'View Tour',
    all: 'All',
    europe: '🌍 Europe',
    americas: '🌎 Americas',
    asia: '🌏 Asia',
    caribbean: '🏝️ Caribbean',
    middleEast: '🕌 Middle East',
    loading: 'Finding amazing tours...',
    noResults: 'No tours found',
    error: 'Unable to load tours',
    trending: 'Trending',
    bestSeller: 'Best Seller',
    spotsLeft: 'spots left',
    bookedToday: 'booked today',
  },
  pt: {
    title: '🗺️ Descubra Passeios Incríveis',
    subtitle: 'Experiências guiadas dos melhores fornecedores',
    viewAll: 'Ver Todos',
    perPerson: 'por pessoa',
    bookNow: 'Ver Tour',
    all: 'Todos',
    europe: '🌍 Europa',
    americas: '🌎 Américas',
    asia: '🌏 Ásia',
    caribbean: '🏝️ Caribe',
    middleEast: '🕌 Oriente Médio',
    loading: 'Buscando passeios...',
    noResults: 'Nenhum passeio encontrado',
    error: 'Erro ao carregar passeios',
    trending: 'Em Alta',
    bestSeller: 'Mais Vendido',
    spotsLeft: 'vagas restantes',
    bookedToday: 'reservados hoje',
  },
  es: {
    title: '🗺️ Descubre Tours Increíbles',
    subtitle: 'Experiencias guiadas de los mejores proveedores',
    viewAll: 'Ver Todos',
    perPerson: 'por persona',
    bookNow: 'Ver Tour',
    all: 'Todos',
    europe: '🌍 Europa',
    americas: '🌎 Américas',
    asia: '🌏 Asia',
    caribbean: '🏝️ Caribe',
    middleEast: '🕌 Medio Oriente',
    loading: 'Buscando tours...',
    noResults: 'No se encontraron tours',
    error: 'Error al cargar tours',
    trending: 'Tendencia',
    bestSeller: 'Más Vendido',
    spotsLeft: 'lugares restantes',
    bookedToday: 'reservados hoy',
  },
};

// Curated destinations by continent for tours
const CONTINENT_DESTINATIONS = {
  europe: [
    { name: 'Paris', lat: 48.8566, lng: 2.3522, flag: '🇫🇷' },
    { name: 'Rome', lat: 41.9028, lng: 12.4964, flag: '🇮🇹' },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734, flag: '🇪🇸' },
    { name: 'London', lat: 51.5074, lng: -0.1278, flag: '🇬🇧' },
  ],
  americas: [
    { name: 'New York', lat: 40.7128, lng: -74.0060, flag: '🇺🇸' },
    { name: 'Cancun', lat: 21.1619, lng: -86.8515, flag: '🇲🇽' },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, flag: '🇧🇷' },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, flag: '🇦🇷' },
  ],
  asia: [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, flag: '🇯🇵' },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, flag: '🇹🇭' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, flag: '🇸🇬' },
    { name: 'Bali', lat: -8.3405, lng: 115.0920, flag: '🇮🇩' },
  ],
  caribbean: [
    { name: 'Punta Cana', lat: 18.5601, lng: -68.3725, flag: '🇩🇴' },
    { name: 'Nassau', lat: 25.0343, lng: -77.3963, flag: '🇧🇸' },
    { name: 'Montego Bay', lat: 18.4763, lng: -77.8939, flag: '🇯🇲' },
    { name: 'Aruba', lat: 12.5211, lng: -69.9683, flag: '🇦🇼' },
  ],
  middleEast: [
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, flag: '🇦🇪' },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, flag: '🇹🇷' },
    { name: 'Jerusalem', lat: 31.7683, lng: 35.2137, flag: '🇮🇱' },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, flag: '🇪🇬' },
  ],
};

type FilterType = 'all' | 'europe' | 'americas' | 'asia' | 'caribbean' | 'middleEast';

// Memoized Tour Card - Level 6 Apple-Class design with Image Slider
const TourCard = memo(({ tour, onClick, t, index }: { tour: Tour; onClick: () => void; t: typeof translations['en']; index: number }) => {
  const basePrice = tour.price?.amount ? parseFloat(tour.price.amount) : 0;
  const price = basePrice > 0 ? Math.round(basePrice + Math.max(basePrice * 0.35, 35)) : null;

  // Extract all images from the tour (API returns array of pictures)
  const images: string[] = (tour.pictures || []).map((pic: any) =>
    typeof pic === 'string' ? pic : pic?.url
  ).filter(Boolean);

  // Fallback if no images
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80');
  }

  // Seeded values for consistent display
  const seed = tour.id.charCodeAt(0) + tour.id.length;
  const rating = Number(tour.rating) || (4.5 + (seed % 5) * 0.1);
  const reviewCount = Number(tour.reviewCount) || (50 + (seed % 200));
  const bookedToday = Number(tour.bookingsToday) || (3 + (seed % 12));
  const spotsLeft = Number(tour.spotsLeft) || (4 + (seed % 8));
  const isBestSeller = tour.isBestSeller || index < 2;
  const isPopular = tour.isPopular || bookedToday > 8;

  // Calculate value score
  const valueScore = Math.min(99, Math.round(70 + (rating - 4) * 20 + (price && price < 100 ? 10 : 0)));

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-neutral-200 shadow-level-md hover:shadow-level-xl hover:border-orange-400 transition-all duration-150 ease-apple overflow-hidden cursor-pointer active:scale-[0.97]"
    >
      {/* Image Slider with real photos from API */}
      <ImageSlider
        images={images}
        alt={tour.name}
        height="h-48"
        showDots={images.length > 1}
        showArrows={images.length > 1}
        showSwipeHint={images.length > 1 && index === 0}
        className="bg-gradient-to-br from-orange-100 to-amber-100"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
          {isBestSeller && (
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
              🔥 {t.bestSeller}
            </div>
          )}
          {tour.categories?.[0] && (
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-gray-700 text-[11px] font-semibold">
              {tour.categories[0]}
            </div>
          )}
        </div>

        {/* Value Score + Favorite */}
        <div className="absolute top-2.5 right-2.5 flex gap-2 z-20">
          <ValueScoreBadge score={valueScore} size="sm" showLabel={false} />
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="w-7 h-7 rounded-full bg-white/90 text-gray-600 hover:text-red-500 flex items-center justify-center transition-all"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Urgency Badge */}
        {spotsLeft <= 6 && (
          <div className="absolute bottom-12 left-3 bg-red-500/90 px-2 py-1 rounded-lg text-white text-[10px] font-bold backdrop-blur-sm animate-pulse z-20">
            <Flame className="w-3 h-3 inline mr-1" />
            {spotsLeft} {t.spotsLeft}
          </div>
        )}

        {/* Price Box */}
        {price && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 z-20">
            <p className="text-white font-bold text-base">${price}</p>
            <p className="text-white/80 text-[10px]">{t.perPerson}</p>
          </div>
        )}

        {/* Title & Location */}
        <div className="absolute bottom-3 left-3 right-24 z-20">
          <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-orange-200 transition-colors"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {tour.name}
          </h3>
        </div>
      </ImageSlider>

      {/* Content */}
      <div className="p-3">
        {/* Rating & Duration */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tour.minimumDuration || '3h'}
          </span>
        </div>

        {/* Social Proof */}
        {isPopular && (
          <div className="flex items-center gap-1 mb-2 text-[11px] text-green-600 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {bookedToday} {t.bookedToday}
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          {t.bookNow}
        </button>
      </div>
    </div>
  );
});
TourCard.displayName = 'TourCard';

export function ToursSectionEnhanced({ lang = 'en' }: ToursSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Get coordinates for selected continent
  const getCoordinates = useCallback((filter: FilterType) => {
    if (filter === 'all') {
      // Mix from all continents - returns multiple destinations
      return [
        CONTINENT_DESTINATIONS.europe[0],    // Paris
        CONTINENT_DESTINATIONS.americas[0],  // New York
        CONTINENT_DESTINATIONS.asia[0],      // Tokyo
        CONTINENT_DESTINATIONS.caribbean[0], // Punta Cana
      ];
    }
    return CONTINENT_DESTINATIONS[filter] || [];
  }, []);

  const coords = useMemo(() => getCoordinates(activeFilter), [activeFilter, getCoordinates]);

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheAgeFormatted, setCacheAgeFormatted] = useState<string | null>(null);

  // Fetch from multiple destinations when "ALL" is selected
  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        if (activeFilter === 'all' && coords.length > 1) {
          // Fetch from multiple cities and combine results
          const fetchPromises = coords.slice(0, 4).map(async (coord) => {
            try {
              const response = await fetch(
                `/api/activities/search?latitude=${coord.lat}&longitude=${coord.lng}&radius=10&type=tours`
              );
              if (response.ok) {
                const data = await response.json();
                // Add city name to each tour for display
                return (data.data || []).slice(0, 3).map((t: any) => ({
                  ...t,
                  _cityName: coord.name,
                  _cityFlag: coord.flag,
                }));
              }
              return [];
            } catch {
              return [];
            }
          });

          const results = await Promise.all(fetchPromises);
          // Flatten and interleave results from different cities
          const combined: Tour[] = [];
          const maxPerCity = 3;
          for (let i = 0; i < maxPerCity; i++) {
            for (const cityResults of results) {
              if (cityResults[i]) {
                combined.push(cityResults[i]);
              }
            }
          }

          setTours(combined.slice(0, 8));
          setFromCache(false);
        } else {
          // Single destination fetch
          const primaryCoord = coords[0];
          if (!primaryCoord) {
            setTours([]);
            setLoading(false);
            return;
          }

          const response = await fetch(
            `/api/activities/search?latitude=${primaryCoord.lat}&longitude=${primaryCoord.lng}&radius=10&type=tours`
          );

          if (response.ok) {
            const data = await response.json();
            setTours((data.data || []).slice(0, 8));
            setFromCache(response.headers.get('X-Cache') === 'HIT');
          } else {
            setTours([]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching tours:', error);
        setFetchError(error.message || 'Failed to fetch tours');
        setTours([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [activeFilter, coords]);

  const refresh = useCallback(async () => {
    setLoading(true);
    // Trigger re-fetch by clearing state - useEffect will re-fetch
    setTours([]);
  }, []);

  const handleTourClick = useCallback((tour: Tour) => {
    const basePrice = tour.price?.amount ? parseFloat(tour.price.amount) : 0;
    const price = basePrice > 0 ? Math.round(basePrice + Math.max(basePrice * 0.35, 35)) : 0;
    const firstPic = tour.pictures?.[0];
    const img = typeof firstPic === 'string' ? firstPic : firstPic?.url || '';

    router.push(`/tours/${tour.id}?id=${tour.id}&name=${encodeURIComponent(tour.name)}&price=${price}&imgs=${encodeURIComponent(img)}&duration=${tour.minimumDuration || '3h'}&rating=${tour.rating || 4.8}&desc=${encodeURIComponent((tour.shortDescription || tour.description || '').slice(0, 300))}&link=${encodeURIComponent(tour.bookingLink || '')}`);
  }, [router]);

  return (
    <section className="pt-1 pb-2 md:py-6 lg:py-10" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6 gap-2 px-3 md:px-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <h2 className="text-sm md:text-[26px] lg:text-[32px] font-semibold text-neutral-800 tracking-[0.01em]">{t.title}</h2>
          {fromCache && cacheAgeFormatted && (
            <CacheIndicator
              cacheAge={null}
              cacheAgeFormatted={cacheAgeFormatted}
              fromCache={fromCache}
              onRefresh={refresh}
              compact
              className="hidden sm:block"
            />
          )}
        </div>
        <button
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors duration-150 min-h-[44px] px-3 flex items-center flex-shrink-0"
          onClick={() => router.push('/tours')}
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-200/80 mb-3 md:mb-4 mx-4 md:mx-0" />

      {/* Filter Pills */}
      <div
        className="flex gap-2 mb-3 md:mb-4 overflow-x-auto scrollbar-hide pb-1 px-4 md:px-0"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        {[
          { key: 'all' as FilterType, label: t.all },
          { key: 'europe' as FilterType, label: t.europe },
          { key: 'americas' as FilterType, label: t.americas },
          { key: 'asia' as FilterType, label: t.asia },
          { key: 'caribbean' as FilterType, label: t.caribbean },
          { key: 'middleEast' as FilterType, label: t.middleEast },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            disabled={loading}
            className={`min-h-[36px] px-3 md:px-4 py-1.5 rounded-lg font-semibold text-sm transition-all duration-150 border flex-shrink-0 whitespace-nowrap ${
              activeFilter === filter.key
                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-orange-400 hover:bg-orange-50'
            } disabled:opacity-50`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">{t.loading}</p>
        </div>
      )}

      {/* Error State */}
      {fetchError && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-orange-50 rounded-lg border-2 border-orange-200">
          <Sparkles className="w-12 h-12 text-orange-400 mb-4" />
          <p className="text-orange-700 font-semibold">{t.error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && tours.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-gray-200">
          <MapPin className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">{t.noResults}</p>
        </div>
      )}

      {/* Tours Grid */}
      {!loading && !fetchError && tours.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4 px-0">
          {tours.map((tour, index) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onClick={() => handleTourClick(tour)}
              t={t}
              index={index}
            />
          ))}
        </div>
      )}

      {/* View All CTA */}
      <div className="text-center mt-6 px-4 md:px-0">
        <button
          onClick={() => router.push('/tours')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          {t.viewAll}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
