'use client';

/**
 * Offer Countdown Timer — Fly2Any
 *
 * Apple-Class Level 6 countdown showing offer validity.
 * Warns users before expiration and handles auto-refresh.
 */

import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle, RefreshCw, X } from 'lucide-react';

interface OfferCountdownProps {
  offerId: string;
  createdAt?: number; // Unix timestamp ms
  onExpired?: () => void;
  onRefreshNeeded?: () => void;
  onRefresh?: () => Promise<void>;
  className?: string;
}

const VALIDITY_MS = 25 * 60 * 1000; // 25 min (5 min buffer from 30)
const WARNING_MS = 20 * 60 * 1000;  // Yellow warning at 20 min
const CRITICAL_MS = 5 * 60 * 1000;  // Red critical at 5 min

export function OfferCountdown({
  offerId,
  createdAt = Date.now(),
  onExpired,
  onRefreshNeeded,
  onRefresh,
  className = '',
}: OfferCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(VALIDITY_MS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Calculate remaining time
  useEffect(() => {
    const updateRemaining = () => {
      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(0, VALIDITY_MS - elapsed);
      setRemainingMs(remaining);

      // Trigger callbacks
      if (remaining <= 0 && onExpired) {
        onExpired();
      } else if (remaining <= CRITICAL_MS && remaining > 0 && onRefreshNeeded) {
        onRefreshNeeded();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [createdAt, onExpired, onRefreshNeeded]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Format time
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Determine status
  const isExpired = remainingMs <= 0;
  const isCritical = remainingMs <= CRITICAL_MS && remainingMs > 0;
  const isWarning = remainingMs <= WARNING_MS && remainingMs > CRITICAL_MS;
  const isNormal = remainingMs > WARNING_MS;

  // Don't show if dismissed and not critical
  if (dismissed && !isCritical && !isExpired) return null;

  // Don't show if plenty of time left
  if (isNormal && !className.includes('always')) return null;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-300 ${className}
        ${isExpired ? 'bg-red-50 text-red-700 border border-red-200' : ''}
        ${isCritical ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : ''}
        ${isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
        ${isNormal ? 'bg-gray-50 text-gray-600 border border-gray-200' : ''}
      `}
    >
      {/* Icon */}
      {isExpired || isCritical ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0" />
      )}

      {/* Message */}
      <span className="flex-1">
        {isExpired ? (
          'Price expired. Please search again.'
        ) : isCritical ? (
          <>Price expires in <span className="font-bold">{timeStr}</span></>
        ) : isWarning ? (
          <>Price valid for <span className="font-semibold">{timeStr}</span></>
        ) : (
          <>Price held for {minutes} min</>
        )}
      </span>

      {/* Actions */}
      {(isCritical || isExpired) && onRefresh && (
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="
            flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold
            bg-white border shadow-sm hover:bg-gray-50 transition-colors
            disabled:opacity-50
          "
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      )}

      {/* Dismiss (only for warning state) */}
      {isWarning && !isCritical && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-100 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/**
 * Compact countdown for mobile/small spaces
 */
export function OfferCountdownCompact({
  createdAt = Date.now(),
  onExpired,
}: {
  createdAt?: number;
  onExpired?: () => void;
}) {
  const [remainingMs, setRemainingMs] = useState(VALIDITY_MS);

  useEffect(() => {
    const updateRemaining = () => {
      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(0, VALIDITY_MS - elapsed);
      setRemainingMs(remaining);
      if (remaining <= 0 && onExpired) onExpired();
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [createdAt, onExpired]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const isCritical = remainingMs <= CRITICAL_MS;

  if (remainingMs <= 0) return null;

  return (
    <span className={`
      inline-flex items-center gap-1 text-xs font-medium
      ${isCritical ? 'text-red-600' : 'text-gray-500'}
    `}>
      <Clock className="w-3 h-3" />
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
