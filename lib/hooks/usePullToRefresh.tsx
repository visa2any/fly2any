import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Options for configuring pull-to-refresh behavior
 */
export interface PullToRefreshOptions {
  /** Distance in pixels required to trigger refresh (default: 80) */
  threshold?: number;
  /** Maximum distance the pull indicator can travel (default: 150) */
  maxDistance?: number;
  /** Resistance factor applied to pull distance for natural feel (default: 2.5) */
  resistance?: number;
  /** Only enable on mobile devices (default: true) */
  mobileOnly?: boolean;
  /** Enable haptic feedback if available (default: true) */
  enableHaptics?: boolean;
  /** Color theme for the loading indicator - 'blue' for flights, 'orange' for hotels (default: 'blue') */
  theme?: 'blue' | 'orange';
}

/**
 * Custom hook for implementing native-like pull-to-refresh functionality
 *
 * Features:
 * - Smooth 60fps animations using transform
 * - Haptic feedback on trigger
 * - Mobile-only by default
 * - Prevents conflicts with scroll
 * - Automatic cleanup on unmount
 * - Accessible with ARIA announcements
 *
 * @param onRefresh - Async function to execute when refresh is triggered
 * @param options - Configuration options
 * @returns Object containing isRefreshing state and pullIndicator JSX element
 *
 * @example
 * ```tsx
 * function FlightResults() {
 *   const { isRefreshing, pullIndicator } = usePullToRefresh(
 *     async () => {
 *       await fetchFlights();
 *     },
 *     { threshold: 80, theme: 'blue' }
 *   );
 *
 *   return (
 *     <div>
 *       {pullIndicator}
 *       {isRefreshing ? <Spinner /> : <Results />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options: PullToRefreshOptions = {}
) {
  const {
    threshold = 80,
    maxDistance = 150,
    resistance = 2.5,
    mobileOnly = true,
    enableHaptics = true,
    theme = 'blue',
  } = options;

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Refs for touch tracking
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(false);

  // Check if device is mobile
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768;
  }, []);

  // Haptic feedback using Vibration API
  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (enableHaptics && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail if vibration not supported
      }
    }
  }, [enableHaptics]);

  // Calculate pull distance with resistance curve
  const calculatePullDistance = useCallback((delta: number): number => {
    // Apply resistance curve for natural feel
    const resistedDistance = delta / resistance;
    // Cap at max distance
    return Math.min(resistedDistance, maxDistance);
  }, [resistance, maxDistance]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only activate if we're at the top of the page
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 5) return;

    // Don't activate if already refreshing
    if (isRefreshing) return;

    // Check if mobile-only mode is enabled
    if (mobileOnly && !isMobile()) return;

    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    hasTriggeredRef.current = false;
    setIsPulling(true);
  }, [isRefreshing, mobileOnly, isMobile]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || isRefreshing) return;

    // Check if we're still at the top
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 5) {
      // User scrolled down, cancel pull
      isDraggingRef.current = false;
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    currentYRef.current = e.touches[0].clientY;
    const delta = currentYRef.current - startYRef.current;

    // Only activate on downward pull
    if (delta > 0) {
      // Prevent default scroll behavior during pull
      e.preventDefault();

      const distance = calculatePullDistance(delta);
      setPullDistance(distance);

      // Trigger haptic feedback when threshold is reached
      if (distance >= threshold && !hasTriggeredRef.current) {
        triggerHaptic(10); // Short haptic pulse
        hasTriggeredRef.current = true;
      } else if (distance < threshold && hasTriggeredRef.current) {
        hasTriggeredRef.current = false;
      }
    }
  }, [isRefreshing, threshold, calculatePullDistance, triggerHaptic]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!isDraggingRef.current || isRefreshing) return;

    isDraggingRef.current = false;
    setIsPulling(false);

    // Check if threshold was reached
    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(threshold); // Keep indicator at threshold position during refresh

      // Success haptic feedback
      triggerHaptic([10, 50, 10]); // Double pulse

      try {
        // Execute refresh callback
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        // Delay before hiding to show success state
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Snap back if threshold not reached
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh, triggerHaptic]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if should enable (mobile-only mode)
    if (mobileOnly && !isMobile()) return;

    const options: AddEventListenerOptions = { passive: false };

    window.addEventListener('touchstart', handleTouchStart, options);
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, mobileOnly, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      setIsPulling(false);
      setPullDistance(0);
    };
  }, []);

  // Determine indicator state
  const indicatorProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowSpinner = isRefreshing || pullDistance >= threshold;

  // Theme colors
  const themeColors = {
    blue: {
      gradient: 'from-primary-500 to-blue-500',
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      spinner: 'border-primary-600',
    },
    orange: {
      gradient: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      spinner: 'border-orange-600',
    },
  };

  const colors = themeColors[theme];

  // Pull indicator JSX
  const pullIndicator = (
    <>
      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isRefreshing ? 'Refreshing results...' : ''}
      </div>

      {/* Pull indicator */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance - 60 : -60}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex items-center justify-center py-4">
          <div
            className={`
              ${colors.bg} backdrop-blur-md rounded-full shadow-lg border border-white/50
              transition-all duration-300
            `}
            style={{
              width: `${40 + (indicatorProgress * 16)}px`,
              height: `${40 + (indicatorProgress * 16)}px`,
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {shouldShowSpinner ? (
                // Spinning loader
                <div
                  className={`
                    w-6 h-6 border-2 ${colors.spinner} border-t-transparent rounded-full
                    ${isRefreshing ? 'animate-spin' : ''}
                  `}
                  style={{
                    animationDuration: '0.8s',
                  }}
                />
              ) : (
                // Pull arrow
                <svg
                  className={`w-6 h-6 ${colors.text} transition-transform duration-300`}
                  style={{
                    transform: `rotate(${indicatorProgress * 180}deg)`,
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Progress text */}
        {(isPulling || isRefreshing) && (
          <div className="text-center pb-2">
            <p className={`text-sm font-medium ${colors.text}`}>
              {isRefreshing
                ? 'Refreshing...'
                : pullDistance >= threshold
                ? 'Release to refresh'
                : 'Pull to refresh'}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return {
    isRefreshing,
    isPulling,
    pullDistance,
    pullIndicator,
  };
}

/**
 * Keyboard-accessible refresh button for accessibility
 * Use alongside usePullToRefresh to provide non-touch alternative
 */
export function RefreshButton({
  onRefresh,
  isRefreshing,
  theme = 'blue',
  className = '',
}: {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  theme?: 'blue' | 'orange';
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isRefreshing || isLoading) return;

    setIsLoading(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const themeClasses = {
    blue: 'from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700',
    orange: 'from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRefreshing || isLoading}
      className={`
        fixed bottom-24 right-4 md:right-8 z-40
        inline-flex items-center gap-2 px-4 py-3
        bg-gradient-to-r ${themeClasses[theme]}
        text-white font-semibold rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label="Refresh results"
    >
      <svg
        className={`w-5 h-5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span className="text-sm">Refresh</span>
    </button>
  );
}
