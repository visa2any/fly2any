/**
 * Urgency Indicators Component
 *
 * Shows scarcity/urgency signals to boost conversions:
 * - Limited spots remaining
 * - Recent bookings
 * - Time-sensitive offers
 * - Price anchoring
 */

'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, Zap, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UrgencyIndicatorsProps {
  tripId: string;
  currentMembers: number;
  maxMembers: number;
  pricePerPerson: number;
  trending?: boolean;
  featured?: boolean;
}

interface RecentBooking {
  name: string;
  timeAgo: string;
}

export default function UrgencyIndicators({
  tripId,
  currentMembers,
  maxMembers,
  pricePerPerson,
  trending,
  featured,
}: UrgencyIndicatorsProps) {
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [showBookingNotification, setShowBookingNotification] = useState(false);

  const spotsLeft = maxMembers - currentMembers;
  const percentFull = (currentMembers / maxMembers) * 100;
  const isAlmostFull = spotsLeft <= 3;
  const regularPrice = Math.round(pricePerPerson * 1.25); // Show 25% higher as "regular"
  const savings = regularPrice - pricePerPerson;

  // Fetch recent bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await fetch(`/api/tripmatch/trips/${tripId}/recent-activity`);
        if (response.ok) {
          const data = await response.json();
          setRecentBookings(data.recentBookings || []);
        }
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
      }
    };

    fetchRecentBookings();
  }, [tripId]);

  // Show periodic booking notifications
  useEffect(() => {
    if (recentBookings.length === 0) return;

    const interval = setInterval(() => {
      setShowBookingNotification(true);
      setTimeout(() => setShowBookingNotification(false), 5000);
    }, 20000); // Show every 20 seconds

    return () => clearInterval(interval);
  }, [recentBookings]);

  return (
    <div className="space-y-3">
      {/* Spots Remaining - High Urgency */}
      {isAlmostFull && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-500 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-red-900">
              Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left!
            </p>
            <p className="text-xs text-red-700">Book now before it's full</p>
          </div>
        </motion.div>
      )}

      {/* Spots Remaining - Medium Urgency */}
      {!isAlmostFull && spotsLeft <= 6 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-300 rounded-lg">
          <Users className="w-5 h-5 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-orange-900">
              {spotsLeft} spots available
            </p>
            <p className="text-xs text-orange-700">
              {currentMembers} travelers already joined
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{currentMembers}/{maxMembers} spots filled</span>
          <span>{percentFull.toFixed(0)}% full</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentFull}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isAlmostFull
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
          />
        </div>
      </div>

      {/* Price Anchoring */}
      <div className="px-4 py-3 bg-green-50 border border-green-300 rounded-lg">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-gray-500 line-through">
            ${(regularPrice / 100).toFixed(0)}
          </span>
          <span className="text-2xl font-black text-green-900">
            ${(pricePerPerson / 100).toFixed(0)}
          </span>
          <span className="text-xs text-green-700 font-bold">per person</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-green-700">
          <Zap className="w-3 h-3" />
          <span className="font-semibold">
            Save ${(savings / 100).toFixed(0)} with group pricing!
          </span>
        </div>
      </div>

      {/* Trending Badge */}
      {trending && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg">
          <TrendingUp className="w-4 h-4 animate-bounce" />
          <span className="text-sm font-bold">🔥 Trending Trip</span>
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg">
          <Star className="w-4 h-4 fill-white" />
          <span className="text-sm font-bold">⭐ Featured Experience</span>
        </div>
      )}

      {/* Recent Booking Notification */}
      <AnimatePresence>
        {showBookingNotification && recentBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-300 rounded-lg"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {recentBookings[0].name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                {recentBookings[0].name} just joined!
              </p>
              <p className="text-xs text-purple-700">{recentBookings[0].timeAgo}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time-Sensitive Offer (Optional) */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
        <Clock className="w-4 h-4 text-gray-600" />
        <div className="text-xs text-gray-700">
          <span className="font-semibold">Early bird pricing</span> - Limited time offer
        </div>
      </div>
    </div>
  );
}
