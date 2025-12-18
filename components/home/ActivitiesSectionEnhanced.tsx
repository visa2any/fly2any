'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, Heart, Loader2, ArrowRight, Sparkles, Flame, Activity } from 'lucide-react';
import { CacheIndicator } from '@/components/cache/CacheIndicator';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { ImageSlider } from '@/components/shared/ImageSlider';

interface ActivityItem {
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

interface ActivitiesSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🎯 Experiences & Things To Do',
    subtitle: 'Unique activities from local experts',
    viewAll: 'View All',
    perPerson: 'per person',
    bookNow: 'Explore',
    all: 'All',
    culture: '🏛️ Culture',
    adventure: '🎢 Adventure',
    foodDrink: '🍷 Food & Drink',
    wellness: '💆 Wellness',
    nightlife: '🌙 Nightlife',
    loading: 'Discovering activities...',
    noResults: 'No activities found',
    error: 'Unable to load activities',
    trending: 'Trending',
    popular: 'Popular',
    spotsLeft: 'spots left',
    joinedToday: 'joined today',
  },
  pt: {
    title: '🎯 Experiências & O Que Fazer',
    subtitle: 'Atividades únicas com especialistas locais',
    viewAll: 'Ver Todas',
    perPerson: 'por pessoa',
    bookNow: 'Explorar',
    all: 'Todas',
    culture: '🏛️ Cultura',
    adventure: '🎢 Aventura',
    foodDrink: '🍷 Comida & Bebida',
    wellness: '💆 Bem-Estar',
    nightlife: '🌙 Vida Noturna',
    loading: 'Descobrindo atividades...',
    noResults: 'Nenhuma atividade encontrada',
    error: 'Erro ao carregar atividades',
    trending: 'Em Alta',
    popular: 'Popular',
    spotsLeft: 'vagas restantes',
    joinedToday: 'participaram hoje',
  },
  es: {
    title: '🎯 Experiencias & Qué Hacer',
    subtitle: 'Actividades únicas con expertos locales',
    viewAll: 'Ver Todas',
    perPerson: 'por persona',
    bookNow: 'Explorar',
    all: 'Todas',
    culture: '🏛️ Cultura',
    adventure: '🎢 Aventura',
    foodDrink: '🍷 Comida & Bebida',
    wellness: '💆 Bienestar',
    nightlife: '🌙 Vida Nocturna',
    loading: 'Descubriendo actividades...',
    noResults: 'No se encontraron actividades',
    error: 'Error al cargar actividades',
    trending: 'Tendencia',
    popular: 'Popular',
    spotsLeft: 'lugares restantes',
    joinedToday: 'participaron hoy',
  },
};

// Curated destinations by activity type
const ACTIVITY_DESTINATIONS = {
  culture: [
    { name: 'Rome', lat: 41.9028, lng: 12.4964, flag: '🇮🇹' },
    { name: 'Athens', lat: 37.9838, lng: 23.7275, flag: '🇬🇷' },
    { name: 'Kyoto', lat: 35.0116, lng: 135.7681, flag: '🇯🇵' },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, flag: '🇪🇬' },
  ],
  adventure: [
    { name: 'Queenstown', lat: -45.0312, lng: 168.6626, flag: '🇳🇿' },
    { name: 'Costa Rica', lat: 9.7489, lng: -83.7534, flag: '🇨🇷' },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, flag: '🇿🇦' },
    { name: 'Iceland', lat: 64.1466, lng: -21.9426, flag: '🇮🇸' },
  ],
  foodDrink: [
    { name: 'Tuscany', lat: 43.7711, lng: 11.2486, flag: '🇮🇹' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, flag: '🇯🇵' },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734, flag: '🇪🇸' },
    { name: 'Napa Valley', lat: 38.2975, lng: -122.2869, flag: '🇺🇸' },
  ],
  wellness: [
    { name: 'Bali', lat: -8.3405, lng: 115.0920, flag: '🇮🇩' },
    { name: 'Thailand', lat: 15.8700, lng: 100.9925, flag: '🇹🇭' },
    { name: 'Maldives', lat: 3.2028, lng: 73.2207, flag: '🇲🇻' },
    { name: 'Costa Rica', lat: 9.7489, lng: -83.7534, flag: '🇨🇷' },
  ],
  nightlife: [
    { name: 'Ibiza', lat: 38.9067, lng: 1.4206, flag: '🇪🇸' },
    { name: 'Las Vegas', lat: 36.1699, lng: -115.1398, flag: '🇺🇸' },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, flag: '🇩🇪' },
    { name: 'Miami', lat: 25.7617, lng: -80.1918, flag: '🇺🇸' },
  ],
};

type FilterType = 'all' | 'culture' | 'adventure' | 'foodDrink' | 'wellness' | 'nightlife';

// Memoized Activity Card - Level 6 Apple-Class design with Image Slider
const ActivityCard = memo(({ activity, onClick, t, index }: { activity: ActivityItem; onClick: () => void; t: typeof translations['en']; index: number }) => {
  const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : 0;
  const price = basePrice > 0 ? Math.round(basePrice + Math.max(basePrice * 0.35, 35)) : null;

  // Extract all images from the activity (API returns array of pictures)
  const images: string[] = (activity.pictures || []).map((pic: any) =>
    typeof pic === 'string' ? pic : pic?.url
  ).filter(Boolean);

  // Fallback if no images
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80');
  }

  // Seeded values for consistent display - ensure number types for toFixed
  const seed = activity.id.charCodeAt(0) + activity.id.length;
  const rating = Number(activity.rating) || (4.4 + (seed % 6) * 0.1);
  const reviewCount = Number(activity.reviewCount) || (30 + (seed % 180));
  const bookedToday = Number(activity.bookingsToday) || (2 + (seed % 15));
  const spotsLeft = Number(activity.spotsLeft) || (3 + (seed % 9));
  const isPopular = activity.isPopular || index < 3;
  const isHot = bookedToday > 8;

  // Calculate value score
  const valueScore = Math.min(99, Math.round(65 + (rating - 4) * 25 + (price && price < 80 ? 12 : 0)));

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-neutral-200 shadow-level-md hover:shadow-level-xl hover:border-purple-400 transition-all duration-150 ease-apple overflow-hidden cursor-pointer active:scale-[0.97]"
    >
      {/* Image Slider with real photos from API */}
      <ImageSlider
        images={images}
        alt={activity.name}
        height="h-48"
        showDots={images.length > 1}
        showArrows={images.length > 1}
        showSwipeHint={images.length > 1 && index === 0}
        className="bg-gradient-to-br from-purple-100 to-violet-100"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
          {isPopular && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
              ✨ {t.popular}
            </div>
          )}
          {activity.categories?.[0] && (
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-gray-700 text-[11px] font-semibold">
              {activity.categories[0]}
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
        {spotsLeft <= 5 && (
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

        {/* Title */}
        <div className="absolute bottom-3 left-3 right-24 z-20">
          <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-purple-200 transition-colors"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {activity.name}
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
            {activity.minimumDuration || '2h'}
          </span>
        </div>

        {/* Social Proof */}
        {isHot && (
          <div className="flex items-center gap-1 mb-2 text-[11px] text-green-600 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {bookedToday} {t.joinedToday}
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          {t.bookNow}
        </button>
      </div>
    </div>
  );
});
ActivityCard.displayName = 'ActivityCard';

export function ActivitiesSectionEnhanced({ lang = 'en' }: ActivitiesSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Get coordinates for selected category
  const getCoordinates = useCallback((filter: FilterType) => {
    if (filter === 'all') {
      // Mix from different categories - returns array of destinations
      return [
        ACTIVITY_DESTINATIONS.culture[0],    // Rome
        ACTIVITY_DESTINATIONS.adventure[0],  // Queenstown
        ACTIVITY_DESTINATIONS.foodDrink[0],  // Tuscany
        ACTIVITY_DESTINATIONS.wellness[0],   // Bali
      ];
    }
    return ACTIVITY_DESTINATIONS[filter] || [];
  }, []);

  const coords = useMemo(() => getCoordinates(activeFilter), [activeFilter, getCoordinates]);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cacheAgeFormatted, setCacheAgeFormatted] = useState<string | null>(null);

  // Fetch from multiple destinations when "ALL" is selected
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        if (activeFilter === 'all' && coords.length > 1) {
          // Fetch from multiple cities and combine results
          const fetchPromises = coords.slice(0, 4).map(async (coord, idx) => {
            try {
              const response = await fetch(
                `/api/activities/search?latitude=${coord.lat}&longitude=${coord.lng}&radius=10&type=activities`
              );
              if (response.ok) {
                const data = await response.json();
                // Add city name to each activity for display
                return (data.data || []).slice(0, 3).map((a: any) => ({
                  ...a,
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
          const combined: ActivityItem[] = [];
          const maxPerCity = 3;
          for (let i = 0; i < maxPerCity; i++) {
            for (const cityResults of results) {
              if (cityResults[i]) {
                combined.push(cityResults[i]);
              }
            }
          }

          setActivities(combined.slice(0, 8));
          setFromCache(false);
        } else {
          // Single destination fetch
          const primaryCoord = coords[0];
          if (!primaryCoord) {
            setActivities([]);
            setLoading(false);
            return;
          }

          const response = await fetch(
            `/api/activities/search?latitude=${primaryCoord.lat}&longitude=${primaryCoord.lng}&radius=10&type=activities`
          );

          if (response.ok) {
            const data = await response.json();
            setActivities((data.data || []).slice(0, 8));
            setFromCache(response.headers.get('X-Cache') === 'HIT');
          } else {
            setActivities([]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching activities:', error);
        setFetchError(error.message || 'Failed to fetch activities');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [activeFilter, coords]);

  const refresh = useCallback(async () => {
    setLoading(true);
    // Trigger re-fetch by clearing state - useEffect will re-fetch
    setActivities([]);
  }, []);

  const handleActivityClick = useCallback((activity: ActivityItem) => {
    const basePrice = activity.price?.amount ? parseFloat(activity.price.amount) : 0;
    const price = basePrice > 0 ? Math.round(basePrice + Math.max(basePrice * 0.35, 35)) : 0;
    const firstPic = activity.pictures?.[0];
    const img = typeof firstPic === 'string' ? firstPic : firstPic?.url || '';

    router.push(`/activities/${activity.id}?id=${activity.id}&name=${encodeURIComponent(activity.name)}&price=${price}&imgs=${encodeURIComponent(img)}&duration=${activity.minimumDuration || '2h'}&rating=${activity.rating || 4.7}&desc=${encodeURIComponent((activity.shortDescription || activity.description || '').slice(0, 300))}&link=${encodeURIComponent(activity.bookingLink || '')}`);
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
          className="text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors duration-150 min-h-[44px] px-3 flex items-center flex-shrink-0"
          onClick={() => router.push('/activities')}
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
          { key: 'culture' as FilterType, label: t.culture },
          { key: 'adventure' as FilterType, label: t.adventure },
          { key: 'foodDrink' as FilterType, label: t.foodDrink },
          { key: 'wellness' as FilterType, label: t.wellness },
          { key: 'nightlife' as FilterType, label: t.nightlife },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            disabled={loading}
            className={`min-h-[36px] px-3 md:px-4 py-1.5 rounded-lg font-semibold text-sm transition-all duration-150 border flex-shrink-0 whitespace-nowrap ${
              activeFilter === filter.key
                ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-purple-400 hover:bg-purple-50'
            } disabled:opacity-50`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">{t.loading}</p>
        </div>
      )}

      {/* Error State */}
      {fetchError && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-purple-50 rounded-lg border-2 border-purple-200">
          <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
          <p className="text-purple-700 font-semibold">{t.error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && activities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Activity className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">{t.noResults}</p>
        </div>
      )}

      {/* Activities Grid */}
      {!loading && !fetchError && activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4 px-0">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => handleActivityClick(activity)}
              t={t}
              index={index}
            />
          ))}
        </div>
      )}

      {/* View All CTA */}
      <div className="text-center mt-6 px-4 md:px-0">
        <button
          onClick={() => router.push('/activities')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          {t.viewAll}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
