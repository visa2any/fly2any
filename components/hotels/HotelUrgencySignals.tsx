'use client';

import { useState, useEffect } from 'react';
import { Eye, Clock, TrendingUp, Flame, Users, AlertTriangle, Zap, Calendar, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UrgencySignalsProps {
  hotelId: string;
  hotelName?: string;
  basePrice?: number;
  originalPrice?: number;
  roomsLeft?: number;
  isPopular?: boolean;
  lastBooked?: string;
  variant?: 'card' | 'detail' | 'checkout';
  // Real-time data props (when available from API)
  realViewers?: number;
  realRecentBookings?: number;
  realPriceDropPercent?: number;
  isRealData?: boolean;
}

interface SignalData {
  viewers: number;
  recentBookings: number;
  roomsLeft: number;
  priceDropPercent: number;
  bookingTrend: 'hot' | 'warm' | 'normal';
  lastBookedMinutes: number;
  isRealData: boolean;
}

// Generate signal data - use real data when available, otherwise estimate based on hotel ID
function generateSignalData(
  hotelId: string,
  options: {
    roomsLeft?: number;
    realViewers?: number;
    realRecentBookings?: number;
    realPriceDropPercent?: number;
    isRealData?: boolean;
  }
): SignalData {
  const { roomsLeft, realViewers, realRecentBookings, realPriceDropPercent, isRealData } = options;

  // Use hotelId to generate consistent but varied data for fallback
  const hash = hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Use real data when available, otherwise generate estimates
  const viewers = realViewers ?? (2 + (hash % 15)); // 2-16 viewers
  const recentBookings = realRecentBookings ?? (1 + (hash % 5)); // 1-5 recent bookings
  const rooms = roomsLeft ?? (3 + (hash % 8)); // Use real room count or estimate 3-10
  const priceDropPercent = realPriceDropPercent ?? (hash % 3 === 0 ? 10 + (hash % 20) : 0);
  const trend = rooms < 4 ? 'hot' : rooms < 7 ? 'warm' : 'normal';
  const lastBooked = 5 + (hash % 55); // 5-60 minutes ago

  return {
    viewers,
    recentBookings,
    roomsLeft: rooms,
    priceDropPercent,
    bookingTrend: trend,
    lastBookedMinutes: lastBooked,
    isRealData: isRealData || (roomsLeft !== undefined),
  };
}

function ViewersIndicator({ count, animate = true }: { count: number; animate?: boolean }) {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    if (!animate) return;

    // Randomly fluctuate viewers for realism
    const interval = setInterval(() => {
      setDisplayCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(1, Math.min(count + 5, newCount));
      });
    }, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [count, animate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium"
    >
      <Eye className="w-3.5 h-3.5 animate-pulse" />
      <span>{displayCount} people viewing</span>
    </motion.div>
  );
}

function RoomsLeftBadge({ count }: { count: number }) {
  const isUrgent = count <= 3;
  const isWarning = count <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isUrgent
          ? 'bg-red-100 text-red-700 animate-pulse'
          : isWarning
          ? 'bg-orange-100 text-orange-700'
          : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>Only {count} room{count !== 1 ? 's' : ''} left!</span>
    </motion.div>
  );
}

function RecentBookingPulse({ minutes, bookings }: { minutes: number; bookings: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium"
    >
      <div className="relative">
        <Zap className="w-3.5 h-3.5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
      </div>
      <span>
        {bookings} booked in last {minutes < 60 ? `${minutes}min` : `${Math.floor(minutes / 60)}h`}
      </span>
    </motion.div>
  );
}

function PriceDropBadge({ percent }: { percent: number }) {
  if (percent <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold"
    >
      <TrendingUp className="w-3.5 h-3.5" />
      <span>{percent}% price drop</span>
    </motion.div>
  );
}

function HotDealBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg"
    >
      <Flame className="w-3.5 h-3.5 animate-pulse" />
      <span>Hot Deal</span>
    </motion.div>
  );
}

function BookingCountdown({ expiresAt }: { expiresAt?: Date }) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 15, seconds: 0 });

  useEffect(() => {
    const targetTime = expiresAt || new Date(Date.now() + 15 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isUrgent = timeLeft.minutes < 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isUrgent ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
      }`}
    >
      <Timer className={`w-4 h-4 ${isUrgent ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-medium">
        Price locked for{' '}
        <span className="font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </span>
    </motion.div>
  );
}

export function HotelUrgencySignals({
  hotelId,
  hotelName,
  basePrice,
  originalPrice,
  roomsLeft,
  isPopular,
  lastBooked,
  variant = 'card',
  realViewers,
  realRecentBookings,
  realPriceDropPercent,
  isRealData,
}: UrgencySignalsProps) {
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = generateSignalData(hotelId, {
      roomsLeft,
      realViewers,
      realRecentBookings,
      realPriceDropPercent,
      isRealData,
    });
    setSignalData(data);

    // Update periodically for realism (only if not using real data)
    if (!isRealData) {
      const interval = setInterval(() => {
        setSignalData(generateSignalData(hotelId, {
          roomsLeft,
          realViewers,
          realRecentBookings,
          realPriceDropPercent,
          isRealData,
        }));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [hotelId, roomsLeft, realViewers, realRecentBookings, realPriceDropPercent, isRealData]);

  if (!mounted || !signalData) return null;

  // Card variant - compact badges
  if (variant === 'card') {
    return (
      <div className="flex flex-wrap gap-1.5 mb-2">
        {signalData.bookingTrend === 'hot' && <HotDealBadge />}
        {signalData.roomsLeft <= 5 && <RoomsLeftBadge count={signalData.roomsLeft} />}
        {signalData.priceDropPercent > 0 && <PriceDropBadge percent={signalData.priceDropPercent} />}
      </div>
    );
  }

  // Detail variant - more comprehensive
  if (variant === 'detail') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <ViewersIndicator count={signalData.viewers} />
          {signalData.roomsLeft <= 5 && <RoomsLeftBadge count={signalData.roomsLeft} />}
          <RecentBookingPulse
            minutes={signalData.lastBookedMinutes}
            bookings={signalData.recentBookings}
          />
        </div>

        {signalData.priceDropPercent > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-semibold text-green-700">
                Price dropped {signalData.priceDropPercent}%
              </span>
              <span className="text-sm text-green-600 ml-2">
                from usual rates
              </span>
            </div>
          </div>
        )}

        {signalData.bookingTrend === 'hot' && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Flame className="w-5 h-5 text-orange-600 animate-pulse" />
            <div>
              <span className="font-semibold text-orange-700">High demand!</span>
              <span className="text-sm text-orange-600 ml-2">
                This hotel is booking fast
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Checkout variant - countdown focused
  if (variant === 'checkout') {
    return (
      <div className="space-y-3">
        <BookingCountdown />

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700">
            <strong>{signalData.viewers} other travelers</strong> are looking at this hotel right now
          </span>
        </div>

        {signalData.roomsLeft <= 3 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700 font-medium">
              Only {signalData.roomsLeft} room{signalData.roomsLeft !== 1 ? 's' : ''} left at this price!
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default HotelUrgencySignals;
