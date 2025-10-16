/**
 * FlightCardWithViewers Component
 *
 * Wrapper around FlightCardEnhanced that adds real-time viewer tracking.
 * Each card instance tracks its own viewers independently.
 */

'use client';

import { FlightCardEnhanced, EnhancedFlightCardProps } from './FlightCardEnhanced';
import { useFlightViewers } from '@/lib/hooks/useFlightViewers';

interface FlightCardWithViewersProps extends EnhancedFlightCardProps {
  /**
   * Enable real-time viewer tracking
   * @default true
   */
  enableViewerTracking?: boolean;
}

/**
 * Flight card with integrated real-time viewer tracking
 *
 * Uses Redis-backed viewer counts when available, falls back to estimated counts
 */
export function FlightCardWithViewers({
  enableViewerTracking = true,
  viewingCount: providedViewingCount,
  ...props
}: FlightCardWithViewersProps) {
  // Use the real-time viewer tracking hook
  const { viewerCount, isLoading } = useFlightViewers(
    enableViewerTracking ? props.id : null,
    {
      pollingInterval: 10000, // Poll every 10 seconds
      enablePolling: true,
    }
  );

  // Determine which viewer count to use:
  // 1. If viewer tracking is disabled, use provided count
  // 2. If loading, show provided count or 0
  // 3. Otherwise, use real-time count from hook
  const displayViewerCount = !enableViewerTracking
    ? providedViewingCount ?? 0
    : isLoading
    ? providedViewingCount ?? 0
    : viewerCount;

  return (
    <FlightCardEnhanced
      {...props}
      viewingCount={displayViewerCount}
    />
  );
}
