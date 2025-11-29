'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  expiresAt: string; // ISO timestamp
  onExpire?: () => void; // Callback when timer expires
  variant?: 'banner' | 'badge' | 'inline';
  showIcon?: boolean;
  className?: string;
}

/**
 * Price Lock Timer Component
 *
 * Displays a countdown timer for price lock expiration.
 * Used to show users how much time they have to complete their booking
 * before the price lock expires and they need to re-prebook.
 *
 * Industry Standard Practice:
 * - Shows clear countdown (minutes:seconds)
 * - Warning state when < 5 minutes remaining
 * - Calls onExpire callback when time runs out
 * - Visual urgency signals (color changes, icons)
 *
 * Usage:
 * ```tsx
 * <PriceLockTimer
 *   expiresAt="2025-11-28T23:00:00Z"
 *   onExpire={() => handleExpire()}
 *   variant="banner"
 * />
 * ```
 */
export function PriceLockTimer({
  expiresAt,
  onExpire,
  variant = 'banner',
  showIcon = true,
  className = '',
}: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const [expired, setExpired] = useState(false);

  // Calculate time remaining
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const expiryTime = new Date(expiresAt).getTime();
    const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
    return diff;
  }, [expiresAt]);

  // Update timer every second
  useEffect(() => {
    // Initial calculation
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) {
      setExpired(true);
      onExpire?.();
      return;
    }

    // Set up interval
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0 && !expired) {
        setExpired(true);
        onExpire?.();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculateTimeLeft, onExpire, expired]);

  // Format time for display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Determine urgency level
  const isUrgent = timeLeft > 0 && timeLeft < 300; // Less than 5 minutes
  const isCritical = timeLeft > 0 && timeLeft < 60; // Less than 1 minute

  // Render variants
  if (variant === 'banner') {
    return (
      <div
        className={`sticky top-0 z-50 ${
          expired
            ? 'bg-red-600'
            : isCritical
            ? 'bg-red-500 animate-pulse'
            : isUrgent
            ? 'bg-orange-500'
            : 'bg-green-600'
        } text-white p-3 sm:p-4 shadow-lg ${className}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {showIcon && (
              <>
                {expired || isCritical ? (
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                )}
              </>
            )}
            <span className="font-semibold text-sm sm:text-base">
              {expired ? 'Price lock expired!' : 'Price locked for:'}
            </span>
          </div>

          {!expired && (
            <div className="text-2xl sm:text-3xl font-mono font-bold tabular-nums">
              {formattedTime}
            </div>
          )}

          <span className="text-xs sm:text-sm opacity-90">
            {expired
              ? 'Please refresh to get new pricing'
              : isCritical
              ? 'Complete booking NOW!'
              : isUrgent
              ? 'Complete booking soon'
              : 'Complete booking before timer expires'}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          expired
            ? 'bg-red-100 text-red-800 border border-red-300'
            : isCritical
            ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
            : isUrgent
            ? 'bg-orange-100 text-orange-800 border border-orange-300'
            : 'bg-green-100 text-green-800 border border-green-300'
        } ${className}`}
      >
        {showIcon && (
          <>
            {expired || isCritical ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </>
        )}
        <span>{expired ? 'Expired' : formattedTime}</span>
      </div>
    );
  }

  // Inline variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold ${
        expired
          ? 'text-red-600'
          : isCritical
          ? 'text-red-600 animate-pulse'
          : isUrgent
          ? 'text-orange-600'
          : 'text-green-600'
      } ${className}`}
    >
      {showIcon && (
        <>
          {expired || isCritical ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </>
      )}
      {expired ? 'Expired' : formattedTime}
    </span>
  );
}

/**
 * Utility function to check if a prebook has expired
 * @param expiresAt ISO timestamp
 * @returns true if expired, false otherwise
 */
export function isPrebookExpired(expiresAt: string): boolean {
  const now = new Date().getTime();
  const expiryTime = new Date(expiresAt).getTime();
  return now >= expiryTime;
}

/**
 * Utility function to get time remaining in seconds
 * @param expiresAt ISO timestamp
 * @returns seconds until expiry (0 if expired)
 */
export function getTimeRemaining(expiresAt: string): number {
  const now = new Date().getTime();
  const expiryTime = new Date(expiresAt).getTime();
  return Math.max(0, Math.floor((expiryTime - now) / 1000));
}
