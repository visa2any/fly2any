'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface UrgencyClusterProps {
  priceLock?: {
    active: boolean;
    minutesRemaining: number;
    secondsRemaining: number;
  };
  prediction?: {
    trend: 'rising' | 'stable' | 'falling';
    percent: number;
    timeframe: '24h' | '48h' | '72h';
  };
  scarcity?: {
    seatsLeft: number;
    isLow: boolean;
  };
}

/**
 * Separated Urgency Badges
 * Each signal gets its own badge for better clarity
 *
 * Visual Design:
 * - Fare Expiry Timer: Orange gradient badge with LIVE countdown
 * - Price Prediction: Red (rising) or Green (falling) badge with trend label
 */
export function UrgencyCluster({ priceLock, prediction, scarcity }: UrgencyClusterProps) {
  // Live countdown timer state
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);

  // Initialize timer when priceLock changes
  useEffect(() => {
    if (priceLock?.active) {
      setTimeRemaining({
        minutes: priceLock.minutesRemaining,
        seconds: priceLock.secondsRemaining,
      });
    }
  }, [priceLock?.active, priceLock?.minutesRemaining, priceLock?.secondsRemaining]);

  // Live countdown - decrements every second
  useEffect(() => {
    if (!timeRemaining) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (!prev) return null;

        // Calculate total seconds
        let totalSeconds = prev.minutes * 60 + prev.seconds;

        // Decrement
        totalSeconds--;

        // Check if expired
        if (totalSeconds <= 0) {
          return { minutes: 0, seconds: 0 };
        }

        // Convert back to minutes and seconds
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;

        return { minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Don't render if no urgency signals (scarcity removed - shown in header)
  if (!priceLock?.active && !prediction) {
    return null;
  }

  // Format time display
  const formatTime = () => {
    if (!timeRemaining) return '0:00';

    const mins = timeRemaining.minutes;
    const secs = timeRemaining.seconds.toString().padStart(2, '0');

    // Check if expired
    if (mins === 0 && timeRemaining.seconds === 0) {
      return 'Expired';
    }

    return `${mins}:${secs}`;
  };

  const isExpired = timeRemaining?.minutes === 0 && timeRemaining?.seconds === 0;

  return (
    <div className="flex items-center flex-wrap gap-2">
      {/* BADGE 1: Fare Expiry Timer - Standalone with LIVE COUNTDOWN */}
      {priceLock?.active && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-white rounded-md text-xs font-bold shadow-md border-2 ${
          isExpired
            ? 'bg-gray-500 border-gray-600'
            : 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-600'
        }`}>
          <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${isExpired ? '' : 'animate-pulse'}`} />
          <span className="leading-none">
            {isExpired ? (
              'Fare Expired'
            ) : (
              <>Fare Expires in {formatTime()}</>
            )}
          </span>
        </div>
      )}

      {/* BADGE 2: Price Prediction - Standalone with "Rising" or "Falling" label */}
      {prediction && prediction.trend !== 'stable' && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-white rounded-md text-xs font-bold shadow-md border-2 ${
          prediction.trend === 'rising'
            ? 'bg-gradient-to-r from-red-500 to-rose-600 border-red-600'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-600'
        }`}>
          {prediction.trend === 'rising' ? (
            <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span className="leading-none">
            {prediction.trend === 'rising' ? 'Rising' : 'Falling'} {prediction.trend === 'rising' ? '+' : ''}{prediction.percent}% in {prediction.timeframe}
          </span>
        </div>
      )}
    </div>
  );
}
