'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Calendar, MapPin, Sparkles, TrendingUp, Award, ArrowRight, Plus, Heart, Star, Loader2, AlertCircle } from 'lucide-react';
import { useClientCache } from '@/lib/hooks/useClientCache';
import { CacheIndicator } from '@/components/cache/CacheIndicator';

interface TripGroup {
  id: string;
  title: string;
  destination: string;
  destinationImage?: string;
  coverImageUrl?: string;
  category: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  members?: number;
  currentMembers?: number;
  maxMembers: number;
  pricePerPerson?: number;
  estimatedPricePerPerson?: number;
  creatorCredits?: number;
  trending?: boolean;
  featured?: boolean;
  memberAvatars?: string[];
}

// Fallback static data in case API fails
const FALLBACK_TRIPS: TripGroup[] = [
  {
    id: 'fallback-1',
    title: '🏝️ Ibiza Summer Party',
    destination: 'Ibiza, Spain',
    coverImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    category: 'Party',
    dates: 'Jul 15-22',
    members: 6,
    maxMembers: 12,
    pricePerPerson: 1899,
    creatorCredits: 600,
    trending: true,
    memberAvatars: ['👤', '👤', '👤', '👤', '👤', '👤'],
  },
  {
    id: 'fallback-2',
    title: '🎉 Miami Spring Break',
    destination: 'Miami, USA',
    coverImageUrl: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop',
    category: 'Spring Break',
    dates: 'Mar 10-17',
    members: 8,
    maxMembers: 10,
    pricePerPerson: 1450,
    creatorCredits: 800,
    featured: true,
    memberAvatars: ['👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤'],
  },
  {
    id: 'fallback-3',
    title: '💃 Girls Trip to Barcelona',
    destination: 'Barcelona, Spain',
    coverImageUrl: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop',
    category: 'Girls Trip',
    dates: 'Jun 5-12',
    members: 5,
    maxMembers: 8,
    pricePerPerson: 1650,
    creatorCredits: 500,
    trending: true,
    memberAvatars: ['👤', '👤', '👤', '👤', '👤'],
  },
  {
    id: 'fallback-4',
    title: '🏔️ Swiss Alps Adventure',
    destination: 'Interlaken, Switzerland',
    coverImageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
    category: 'Adventure',
    dates: 'Aug 20-27',
    members: 4,
    maxMembers: 10,
    pricePerPerson: 2299,
    creatorCredits: 400,
    memberAvatars: ['👤', '👤', '👤', '👤'],
  },
  {
    id: 'fallback-5',
    title: '🎊 Vegas Bachelor Party',
    destination: 'Las Vegas, USA',
    coverImageUrl: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&h=600&fit=crop',
    category: 'Bachelor',
    dates: 'May 18-21',
    members: 10,
    maxMembers: 12,
    pricePerPerson: 999,
    creatorCredits: 1000,
    featured: true,
    memberAvatars: ['👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤'],
  },
  {
    id: 'fallback-6',
    title: '🌴 Bali Backpacker Trip',
    destination: 'Bali, Indonesia',
    coverImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    category: 'Backpacker',
    dates: 'Sep 1-14',
    members: 7,
    maxMembers: 12,
    pricePerPerson: 1299,
    creatorCredits: 700,
    trending: true,
    memberAvatars: ['👤', '👤', '👤', '👤', '👤', '👤', '👤'],
  },
];

// Format dates from ISO to compact format (e.g., "Jul 15-22")
function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();

    // Same month
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${startDay}-${endDay}`;
    }

    // Different months
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  } catch (e) {
    return '';
  }
}

// Calculate creator credits based on member count (simplified)
function calculateCreatorCredits(memberCount: number): number {
  const basePerMember = 50; // 50 credits ($5) per member
  let multiplier = 1.0;

  if (memberCount >= 12) multiplier = 2.0;
  else if (memberCount >= 8) multiplier = 1.5;

  return Math.floor(memberCount * basePerMember * multiplier);
}

// Generate realistic human profile pictures
function generateAvatars(count: number): string[] {
  // Use realistic human face photos from randomuser.me
  const genders = ['men', 'women'];
  const avatars: string[] = [];

  for (let i = 0; i < count; i++) {
    const gender = genders[i % 2]; // Alternate between men and women
    const photoId = (i % 75) + 1; // Use IDs 1-75 for variety
    avatars.push(`https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`);
  }

  return avatars;
}

// Memoized Trip Card Component to prevent unnecessary re-renders
const TripCard = memo(({
  trip,
  index,
  hoveredCard,
  onHover,
  onLeave
}: {
  trip: TripGroup;
  index: number;
  hoveredCard: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}) => {
  return (
    <div
      key={trip.id}
      onMouseEnter={() => onHover(trip.id)}
      onMouseLeave={onLeave}
      className="flex-shrink-0 snap-start"
      style={{
        width: '300px',
        animationDelay: `${index * 100}ms`,
        animation: 'slideInUp 0.5s ease-out forwards',
      }}
    >
      <Link
        href={`/tripmatch/trips/${trip.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div
          className={`
            relative rounded-xl overflow-hidden cursor-pointer
            transform transition-all duration-300
            ${hoveredCard === trip.id ? 'scale-105 shadow-2xl' : 'shadow-lg'}
            ${trip.featured ? 'ring-2 ring-purple-400' : ''}
            bg-white
          `}
          style={{ height: '300px' }}
        >
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden bg-gray-200">
          <Image
            src={trip.coverImageUrl || trip.destinationImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop'}
            alt={`${trip.title} - ${trip.destination}`}
            fill
            sizes="300px"
            className={`object-cover transition-transform duration-500 ${
              hoveredCard === trip.id ? 'scale-110' : 'scale-100'
            }`}
            priority={index < 3}
            loading={index < 3 ? 'eager' : 'lazy'}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {trip.trending && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg animate-pulse">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-bold">Trending</span>
            </div>
          )}
          {trip.featured && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-white" />
              <span className="text-xs font-bold">Featured</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {trip.category}
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 p-3 flex flex-col justify-end">
          {/* Trip Title & Destination */}
          <div className="mb-2">
            <h3 className="text-base font-bold text-white mb-0.5" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              {trip.title}
            </h3>
            <div className="flex items-center gap-1 text-white/90" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-medium">{trip.destination}</span>
            </div>
          </div>

          {/* Trip Info Grid */}
          <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 space-y-1.5 mb-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-white/90">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{trip.dates}</span>
              </div>
              <div className="flex items-center gap-1 text-white/90">
                <Users className="w-4 h-4" />
                <span className="font-bold">{trip.members}/{trip.maxMembers}</span>
              </div>
            </div>

            {/* Member Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {trip.memberAvatars?.slice(0, 5).map((avatar, i) => {
                  // Check if avatar is a valid URL (starts with http://, https://, or /)
                  const isValidUrl = avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/');

                  return (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white overflow-hidden flex items-center justify-center relative"
                    >
                      {isValidUrl ? (
                        <Image
                          src={avatar}
                          alt={`Member ${i + 1}`}
                          fill
                          sizes="28px"
                          className="object-cover"
                          loading="lazy"
                          quality={60}
                        />
                      ) : (
                        <span className="text-white text-sm">{avatar}</span>
                      )}
                    </div>
                  );
                })}
                {trip.members && trip.members > 5 && (
                  <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center text-xs text-white font-bold">
                    +{trip.members - 5}
                  </div>
                )}
              </div>
              <span className="text-xs text-white/70 font-medium">
                {trip.maxMembers - (trip.members || 0)} spots left
              </span>
            </div>
          </div>

          {/* Price & Credits */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-white/70" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                from
              </p>
              <p className="text-xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                ${Math.floor((parseFloat(String(trip.pricePerPerson || 0)) / 100)).toLocaleString()}
                <span className="text-xs font-normal text-white/80">/person</span>
              </p>
              <div className="bg-green-500/90 text-white px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 mt-0.5">
                <Award className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold">
                  Creator earns ${Math.floor((trip.creatorCredits || 0) / 100).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Join Button */}
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-1 text-xs">
              Join Trip
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
            transition-transform duration-1000
            ${hoveredCard === trip.id ? 'translate-x-[200%]' : 'translate-x-[-200%]'}
          `}
        />
      </div>
      </Link>
    </div>
  );
});

TripCard.displayName = 'TripCard';

export function TripMatchPreviewSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Format category for display
  function formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'party': 'Party',
      'spring_break': 'Spring Break',
      'girls_trip': 'Girls Trip',
      'bachelor': 'Bachelor',
      'bachelorette': 'Bachelorette',
      'adventure': 'Adventure',
      'backpacker': 'Backpacker',
      'family': 'Family',
      'vacation': 'Vacation',
      'cultural': 'Cultural',
      'wellness': 'Wellness',
    };
    return categoryMap[category] || category;
  }

  // ✅ NEW: Client-side cache for instant loads (0ms on refresh)
  interface TripMatchResponse {
    success: boolean;
    data: any[];
    count: number;
    error?: string;
  }

  const {
    data: apiData,
    loading,
    error: fetchError,
    fromCache,
    cacheAge,
    cacheAgeFormatted,
    refresh,
  } = useClientCache<TripMatchResponse>(
    '/api/tripmatch/trips?trending=true&limit=6',
    {
      ttl: 300, // 5 minutes (user-generated content changes frequently)
    }
  );

  // Transform API data to component format
  const trips = useMemo(() => {
    if (!apiData?.data || apiData.data.length === 0) {
      console.log('⚠️  TripMatch: No trips found, using fallback data');
      return FALLBACK_TRIPS;
    }

    return apiData.data.map((trip: any) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      coverImageUrl: trip.coverImageUrl || trip.cover_image_url,
      category: formatCategory(trip.category),
      dates: formatDateRange(trip.startDate || trip.start_date, trip.endDate || trip.end_date),
      members: trip.currentMembers || trip.current_members || 0,
      maxMembers: trip.maxMembers || trip.max_members || 12,
      pricePerPerson: trip.estimatedPricePerPerson || trip.estimated_price_per_person || 0,
      creatorCredits: calculateCreatorCredits(trip.currentMembers || trip.current_members || 0),
      trending: trip.trending,
      featured: trip.featured,
      memberAvatars: generateAvatars(trip.currentMembers || trip.current_members || 0),
    }));
  }, [apiData]);

  const error = fetchError ? fetchError.message : null;
  const usingFallback = !apiData?.data || apiData.data.length === 0;

  return (
    <section className="py-3 animate-fadeIn" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Unified Compact Header */}
      <div className="mb-3">
        {/* Row 1: Logo + Title + NEW + Cache + CTAs */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">TripMATCH</h2>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              NEW
            </span>
            {usingFallback && (
              <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                DEMO
              </span>
            )}
            {/* Cache Indicator - After TripMATCH NEW */}
            {fromCache && cacheAgeFormatted && (
              <CacheIndicator
                cacheAge={cacheAge}
                cacheAgeFormatted={cacheAgeFormatted}
                fromCache={fromCache}
                onRefresh={refresh}
                compact
              />
            )}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <a
              href="/tripmatch/browse"
              className="text-sm text-purple-600 font-medium hover:underline transition-colors"
            >
              Browse All →
            </a>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-sm">
              <Plus className="w-4 h-4" />
              Create Trip
            </button>
          </div>
        </div>

        {/* Row 2: Subtitle + Creator Incentive */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
          <p className="text-gray-600">
            Find travel companions, share costs, and explore together
          </p>
          <p className="font-semibold text-purple-700 flex items-center gap-1">
            <span>🎁</span>
            Create a trip, bring 8 friends = Earn $80 in credits! Use credits on YOUR next trip. 100% free!
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading amazing trips...</p>
          </div>
        </div>
      )}

      {/* Trips Grid - Horizontal Scroll */}
      {!loading && trips.length > 0 && (
        <div className="relative">
          <div
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {trips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={index}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
                onLeave={() => setHoveredCard(null)}
              />
            ))}
          </div>

          {/* Scroll Hint */}
          <div className="flex justify-center mt-3 gap-2">
            {trips.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-200 transition-all"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && trips.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No trips available yet</h3>
          <p className="text-sm text-gray-600 mb-4">Be the first to create an amazing group trip!</p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
            Create First Trip
          </button>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
