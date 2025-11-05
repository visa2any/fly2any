/**
 * Cache Indicator Component
 *
 * Shows cache status to users for transparency:
 * - "Last updated X minutes ago"
 * - Manual refresh button
 * - Loading state during refresh
 * - Success feedback after refresh
 *
 * UX Philosophy:
 * - Users should know when data was last updated
 * - Users should have control (manual refresh)
 * - Cached data = faster experience (highlight this!)
 */

'use client';

import { useState } from 'react';
import { RefreshCw, Clock, Check } from 'lucide-react';

export interface CacheIndicatorProps {
  /** Cache age in seconds */
  cacheAge: number | null;

  /** Human-readable cache age (e.g., "5m ago") */
  cacheAgeFormatted: string | null;

  /** Whether data is from cache */
  fromCache: boolean;

  /** Callback to refresh data */
  onRefresh: () => Promise<void>;

  /** Optional className for custom styling */
  className?: string;

  /** Compact mode (smaller display) */
  compact?: boolean;
}

export function CacheIndicator({
  cacheAge,
  cacheAgeFormatted,
  fromCache,
  onRefresh,
  className = '',
  compact = false,
}: CacheIndicatorProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setJustRefreshed(false);

    try {
      await onRefresh();

      // Show success feedback
      setJustRefreshed(true);
      setTimeout(() => {
        setJustRefreshed(false);
      }, 2000);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Don't show if no cache data
  if (!fromCache && cacheAge === null) {
    return null;
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-gray-500 ${className}`}>
        {fromCache && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {cacheAgeFormatted}
          </span>
        )}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Refresh data"
          aria-label="Refresh data"
        >
          <RefreshCw
            className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''} ${
              justRefreshed ? 'text-green-600' : 'text-gray-600'
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg ${className}`}
    >
      <div className="flex items-center gap-2">
        {justRefreshed ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Data refreshed successfully
            </span>
          </>
        ) : fromCache ? (
          <>
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              <span className="font-medium text-blue-700">Instant load!</span> Data cached{' '}
              <span className="font-semibold">{cacheAgeFormatted}</span>
            </span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
            <span className="text-sm text-gray-700">Loading fresh data...</span>
          </>
        )}
      </div>

      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className={`
          flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            justRefreshed
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-300'
          }
        `}
        title="Refresh to get latest data"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}

/**
 * Mini Cache Badge
 *
 * Smaller version for use in cards or list items
 */
export function CacheBadge({
  fromCache,
  cacheAgeFormatted,
  className = '',
}: {
  fromCache: boolean;
  cacheAgeFormatted: string | null;
  className?: string;
}) {
  if (!fromCache || !cacheAgeFormatted) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full ${className}`}
      title={`Data cached ${cacheAgeFormatted}`}
    >
      <Clock className="w-3 h-3" />
      {cacheAgeFormatted}
    </span>
  );
}

/**
 * Cache Stats Display
 *
 * Shows cache performance stats (for debugging or admin)
 */
export function CacheStatsDisplay({
  stats,
  className = '',
}: {
  stats: {
    hits: number;
    misses: number;
    size: number;
    totalSize: string;
  };
  className?: string;
}) {
  const hitRate =
    stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
      : '0';

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-2xl font-bold text-green-700">{hitRate}%</div>
        <div className="text-xs text-green-600">Cache Hit Rate</div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-2xl font-bold text-blue-700">{stats.size}</div>
        <div className="text-xs text-blue-600">Cached Items</div>
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="text-2xl font-bold text-purple-700">{stats.hits}</div>
        <div className="text-xs text-purple-600">Cache Hits</div>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-2xl font-bold text-gray-700">{stats.totalSize}</div>
        <div className="text-xs text-gray-600">Storage Used</div>
      </div>
    </div>
  );
}
