/**
 * useFlightViewers Hook
 *
 * Real-time flight viewer tracking hook.
 * Registers viewer on mount, polls for updates, and unregisters on unmount.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFlightViewersOptions {
  /**
   * Polling interval in milliseconds
   * @default 10000 (10 seconds)
   */
  pollingInterval?: number;

  /**
   * Enable automatic polling
   * @default true
   */
  enablePolling?: boolean;

  /**
   * Callback when viewer count changes
   */
  onCountChange?: (count: number) => void;
}

interface UseFlightViewersReturn {
  /**
   * Current viewer count
   */
  viewerCount: number;

  /**
   * Loading state (true during initial fetch)
   */
  isLoading: boolean;

  /**
   * Error message if API call fails
   */
  error: string | null;

  /**
   * Manually refresh viewer count
   */
  refresh: () => Promise<void>;

  /**
   * Whether the hook is actively tracking
   */
  isTracking: boolean;
}

/**
 * Custom hook for real-time flight viewer tracking
 *
 * @param flightId - Unique flight identifier
 * @param options - Configuration options
 * @returns Viewer tracking state and controls
 *
 * @example
 * ```tsx
 * const { viewerCount, isLoading } = useFlightViewers('flight-123');
 * ```
 *
 * @example With custom polling interval
 * ```tsx
 * const { viewerCount, refresh } = useFlightViewers('flight-123', {
 *   pollingInterval: 5000, // Poll every 5 seconds
 *   onCountChange: (count) => console.log('Viewers:', count)
 * });
 * ```
 */
export function useFlightViewers(
  flightId: string | null | undefined,
  options: UseFlightViewersOptions = {}
): UseFlightViewersReturn {
  const {
    pollingInterval = 10000,
    enablePolling = true,
    onCountChange,
  } = options;

  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  // Use refs to track mounting state and avoid memory leaks
  const isMountedRef = useRef<boolean>(true);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasRegisteredRef = useRef<boolean>(false);

  /**
   * Register viewer (increment count)
   */
  const registerViewer = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/flight-viewers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flightId: id,
          action: 'join',
        }),
      });

      const data = await response.json();

      if (data.success && isMountedRef.current) {
        const count = data.data.viewerCount;
        setViewerCount(count);
        setIsTracking(true);
        hasRegisteredRef.current = true;
        onCountChange?.(count);
        console.log(`✅ Registered viewer for flight ${id}: ${count} viewers`);
      }
    } catch (err: any) {
      console.error('Failed to register viewer:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to register viewer');
      }
    }
  }, [onCountChange]);

  /**
   * Unregister viewer (decrement count)
   */
  const unregisterViewer = useCallback(async (id: string) => {
    if (!hasRegisteredRef.current) {
      return; // Don't unregister if we never registered
    }

    try {
      const response = await fetch('/api/flight-viewers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flightId: id,
          action: 'leave',
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`👋 Unregistered viewer for flight ${id}: ${data.data.viewerCount} viewers remaining`);
      }
    } catch (err: any) {
      console.error('Failed to unregister viewer:', err);
      // Don't update state on unmount
    }
  }, []);

  /**
   * Fetch current viewer count
   */
  const fetchViewerCount = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/flight-viewers?flightId=${encodeURIComponent(id)}`);
      const data = await response.json();

      if (data.success && isMountedRef.current) {
        const count = data.data.viewerCount;
        setViewerCount(count);
        setError(null);
        onCountChange?.(count);
      } else if (isMountedRef.current) {
        setError(data.error?.message || 'Failed to fetch viewer count');
      }
    } catch (err: any) {
      console.error('Failed to fetch viewer count:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch viewer count');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [onCountChange]);

  /**
   * Manually refresh viewer count
   */
  const refresh = useCallback(async () => {
    if (!flightId) return;
    setIsLoading(true);
    await fetchViewerCount(flightId);
  }, [flightId, fetchViewerCount]);

  /**
   * Setup polling
   */
  useEffect(() => {
    if (!flightId || !enablePolling || !isTracking) {
      return;
    }

    // Clear existing timer
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    // Setup new polling interval
    pollingTimerRef.current = setInterval(() => {
      if (isMountedRef.current && flightId) {
        fetchViewerCount(flightId);
      }
    }, pollingInterval);

    console.log(`🔄 Started polling for flight ${flightId} every ${pollingInterval}ms`);

    // Cleanup
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [flightId, enablePolling, isTracking, pollingInterval, fetchViewerCount]);

  /**
   * Register viewer on mount, unregister on unmount
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (!flightId) {
      setIsLoading(false);
      setIsTracking(false);
      return;
    }

    // Register viewer
    registerViewer(flightId);

    // Cleanup: Unregister viewer on unmount
    return () => {
      isMountedRef.current = false;

      // Clear polling timer
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }

      // Unregister viewer
      if (flightId && hasRegisteredRef.current) {
        unregisterViewer(flightId);
      }

      setIsTracking(false);
    };
  }, [flightId, registerViewer, unregisterViewer]);

  return {
    viewerCount,
    isLoading,
    error,
    refresh,
    isTracking,
  };
}

/**
 * Batch viewer tracking hook
 * Tracks multiple flights simultaneously
 *
 * @param flightIds - Array of flight identifiers
 * @returns Map of flightId -> viewer count
 *
 * @example
 * ```tsx
 * const { viewers, isLoading } = useFlightViewersBatch(['flight-1', 'flight-2']);
 * console.log(viewers.get('flight-1')); // 42
 * ```
 */
export function useFlightViewersBatch(
  flightIds: string[],
  options: { pollingInterval?: number } = {}
): {
  viewers: Map<string, number>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const { pollingInterval = 15000 } = options;

  const [viewers, setViewers] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBatchViewers = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const idsParam = ids.join(',');
      const response = await fetch(`/api/flight-viewers?flightIds=${encodeURIComponent(idsParam)}`);
      const data = await response.json();

      if (data.success && isMountedRef.current) {
        const viewersMap = new Map<string, number>();
        Object.entries(data.data.viewers).forEach(([id, count]) => {
          viewersMap.set(id, count as number);
        });
        setViewers(viewersMap);
        setError(null);
      } else if (isMountedRef.current) {
        setError(data.error?.message || 'Failed to fetch viewer counts');
      }
    } catch (err: any) {
      console.error('Failed to fetch batch viewers:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch viewer counts');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchBatchViewers(flightIds);
  }, [flightIds, fetchBatchViewers]);

  // Initial fetch and polling
  useEffect(() => {
    isMountedRef.current = true;

    if (flightIds.length === 0) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchBatchViewers(flightIds);

    // Setup polling
    pollingTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchBatchViewers(flightIds);
      }
    }, pollingInterval);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, [flightIds, pollingInterval, fetchBatchViewers]);

  return {
    viewers,
    isLoading,
    error,
    refresh,
  };
}
