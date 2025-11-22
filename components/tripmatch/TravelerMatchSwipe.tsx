'use client';

/**
 * Traveler Match Swipe Component
 *
 * Tinder-style swipe interface for matching with potential travel companions
 * Features: Swipe cards, match notifications, profile previews
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart, X, MapPin, Star, Languages, Users, Globe,
  Sparkles, CheckCircle, Shield
} from 'lucide-react';

interface TravelerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  locationCity: string;
  locationCountry: string;
  ageRange: string;
  gender: string;
  travelStyle: string[];
  interests: string[];
  languagesSpoken: string[];
  avgRating: number;
  totalReviews: number;
  tripsCompleted: number;
  verificationLevel: number;
  matchScore: number;
}

interface TravelerMatchSwipeProps {
  tripId?: string; // Optional: for trip-specific matching
}

export default function TravelerMatchSwipe({ tripId }: TravelerMatchSwipeProps) {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<TravelerProfile | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPotentialMatches();
    }
  }, [status]);

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      const url = tripId
        ? `/api/tripmatch/trips/${tripId}/potential-matches?limit=20`
        : `/api/tripmatch/potential-matches?limit=20`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setProfiles(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch potential matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', profile: TravelerProfile) => {
    if (direction === 'right') {
      // Like the profile
      try {
        const res = await fetch('/api/tripmatch/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: profile.userId,
            action: 'like',
          }),
        });

        const data = await res.json();

        if (data.success && data.data.isMatch) {
          // It's a match!
          setMatchedProfile(profile);
          setShowMatch(true);
        }
      } catch (error) {
        console.error('Failed to like profile:', error);
      }
    }

    // Move to next profile
    setCurrentIndex(prev => prev + 1);

    // Load more profiles if running low
    if (currentIndex >= profiles.length - 3) {
      fetchPotentialMatches();
    }
  };

  // Show auth loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Require authentication
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700 p-8">
        <p className="text-gray-300 mb-4">Please sign in to find travel companions</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          Find Travel Companions
        </h2>
        <p className="text-gray-400">Swipe right to connect, left to pass</p>
      </div>

      {/* Card Stack */}
      <div className="relative h-[600px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
          </div>
        ) : profiles.length === 0 || currentIndex >= profiles.length ? (
          <div className="flex items-center justify-center h-full bg-slate-800 rounded-2xl border border-slate-700">
            <div className="text-center p-8">
              <p className="text-xl text-gray-300 mb-2">No more profiles</p>
              <p className="text-gray-400 mb-4">Check back later for new travelers!</p>
              <button
                onClick={fetchPotentialMatches}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
              <SwipeCard
                key={profile.id}
                profile={profile}
                onSwipe={(direction) => handleSwipe(direction, profile)}
                style={{ zIndex: 3 - index }}
                isTop={index === 0}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Action Buttons */}
      {currentProfile && (
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() => handleSwipe('left', currentProfile)}
            className="w-16 h-16 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition shadow-lg"
          >
            <X className="w-8 h-8 text-red-400" />
          </button>
          <button
            onClick={() => handleSwipe('right', currentProfile)}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full flex items-center justify-center transition shadow-lg"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </button>
        </div>
      )}

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        profile={matchedProfile}
      />
    </div>
  );
}

function SwipeCard({
  profile,
  onSwipe,
  style,
  isTop,
}: {
  profile: TravelerProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  style: any;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity, ...style }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="h-full bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        {/* Profile Image */}
        <div className="relative h-2/3 bg-gradient-to-r from-purple-600 to-pink-600">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-24 h-24 text-white/50" />
            </div>
          )}

          {/* Match Score Badge */}
          <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            {profile.matchScore}% Match
          </div>

          {/* Verification Badge */}
          {profile.verificationLevel >= 3 && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="h-1/3 p-6 overflow-y-auto">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {profile.displayName}, {profile.ageRange}
              </h3>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                {profile.locationCity}, {profile.locationCountry}
              </div>
            </div>
            {profile.avgRating > 0 && (
              <div className="flex items-center gap-1 bg-slate-700 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">{profile.avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{profile.bio}</p>
          )}

          {/* Travel Style */}
          {profile.travelStyle.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {profile.travelStyle.slice(0, 3).map((style) => (
                  <span key={style} className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {profile.tripsCompleted} trips
            </div>
            {profile.languagesSpoken.length > 0 && (
              <div className="flex items-center gap-1">
                <Languages className="w-3 h-3" />
                {profile.languagesSpoken.slice(0, 2).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MatchModal({
  isOpen,
  onClose,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: TravelerProfile | null;
}) {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">It's a Match!</h2>
        <p className="text-white/80 mb-6">
          You and {profile.displayName} both liked each other
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <img
            src={profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.displayName}
            alt={profile.displayName}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          />
          <Heart className="w-8 h-8 text-white fill-white" />
          <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
          >
            Keep Swiping
          </button>
          <button
            onClick={() => window.location.href = `/tripmatch/profiles/${profile.userId}`}
            className="flex-1 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            View Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}
