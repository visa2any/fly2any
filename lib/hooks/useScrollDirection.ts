import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Return type for useScrollDirection hook
 */
export interface ScrollDirectionState {
  /** Current scroll direction: 'up' | 'down' | null (null when at top) */
  scrollDirection: 'up' | 'down' | null;
  /** Current vertical scroll position in pixels */
  scrollY: number;
  /** Whether the page is at the top (within threshold) */
  isAtTop: boolean;
  /** Whether user is actively scrolling (for transition control) */
  isScrolling: boolean;
}

/**
 * Options for configuring scroll direction detection
 */
export interface UseScrollDirectionOptions {
  /** Minimum scroll distance (px) before detecting direction change (default: 50) */
  threshold?: number;
  /** Debounce delay in ms for scroll events (default: 100) */
  debounceDelay?: number;
  /** Only enable on mobile devices ≤768px (default: true) */
  mobileOnly?: boolean;
  /** Distance from top (px) to consider "at top" (default: 50) */
  topThreshold?: number;
  /** Enable verbose logging for debugging (default: false) */
  debug?: boolean;
}

/**
 * Custom hook for detecting scroll direction with high performance
 *
 * Features:
 * - 60fps performance using requestAnimationFrame
 * - Debounced scroll events (configurable)
 * - Threshold-based direction changes (ignores jitter)
 * - Mobile-only detection (optional)
 * - Passive event listeners for better performance
 * - Automatic cleanup on unmount
 * - GPU-acceleration ready (use with CSS transforms)
 *
 * @param options - Configuration options
 * @returns ScrollDirectionState object with current scroll state
 *
 * @example
 * ```tsx
 * function MobileSearchBar() {
 *   const { scrollDirection, isAtTop, scrollY } = useScrollDirection({
 *     threshold: 50,
 *     mobileOnly: true,
 *     debounceDelay: 100
 *   });
 *
 *   // Show mini bar when scrolling down (not at top)
 *   const showMiniBar = scrollDirection === 'down' && !isAtTop;
 *
 *   return (
 *     <div
 *       className={`transition-all duration-300 ${
 *         showMiniBar ? 'h-12 sticky top-0' : 'h-20'
 *       }`}
 *       style={{
 *         transform: showMiniBar ? 'translateY(0)' : 'none',
 *         willChange: 'transform',
 *       }}
 *     >
 *       Search Bar Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): ScrollDirectionState {
  const {
    threshold = 50,
    debounceDelay = 100,
    mobileOnly = true,
    topThreshold = 50,
    debug = false,
  } = options;

  // State
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  );
  const [scrollY, setScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  // Refs for tracking scroll position and RAF
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if device is mobile
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  }, []);

  // Update scroll state using requestAnimationFrame for 60fps
  const updateScrollState = useCallback(() => {
    const currentScrollY =
      window.scrollY || document.documentElement.scrollTop;

    if (debug) {
      console.log('[useScrollDirection] updateScrollState:', {
        currentScrollY,
        lastScrollY: lastScrollY.current,
        threshold,
      });
    }

    // Calculate scroll delta
    const delta = currentScrollY - lastScrollY.current;

    // Update scrollY state
    setScrollY(currentScrollY);

    // Check if at top
    const atTop = currentScrollY < topThreshold;
    setIsAtTop(atTop);

    // Only update direction if delta exceeds threshold (reduces jitter)
    if (Math.abs(delta) > threshold) {
      const newDirection = delta > 0 ? 'down' : 'up';

      if (debug) {
        console.log('[useScrollDirection] Direction change:', {
          delta,
          newDirection,
          atTop,
        });
      }

      // Only update if direction actually changed or we're at top
      if (atTop) {
        setScrollDirection(null);
      } else if (scrollDirection !== newDirection) {
        setScrollDirection(newDirection);
      }

      // Update last scroll position (memory)
      lastScrollY.current = currentScrollY;
    }

    // Reset RAF flag
    ticking.current = false;
  }, [threshold, topThreshold, scrollDirection, debug]);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    // Set scrolling state
    setIsScrolling(true);

    // Clear existing scroll-end timer
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }

    // Set new scroll-end timer (detects when scrolling stops)
    scrollEndTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      // Request animation frame for smooth 60fps updates
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollState);
        ticking.current = true;
      }
    }, debounceDelay);
  }, [debounceDelay, updateScrollState]);

  // Set up scroll listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if should enable (mobile-only mode)
    if (mobileOnly && !isMobile()) {
      if (debug) {
        console.log('[useScrollDirection] Skipping (desktop detected)');
      }
      return;
    }

    if (debug) {
      console.log('[useScrollDirection] Initializing scroll listener', {
        threshold,
        debounceDelay,
        mobileOnly,
        topThreshold,
      });
    }

    // Initialize last scroll position
    lastScrollY.current = window.scrollY || document.documentElement.scrollTop;

    // Add scroll listener with passive flag for better performance
    // Passive listeners can't call preventDefault, but we don't need to
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup function
    return () => {
      if (debug) {
        console.log('[useScrollDirection] Cleaning up');
      }

      window.removeEventListener('scroll', handleScroll);

      // Clear timers
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }

      // Reset RAF flag
      ticking.current = false;
    };
  }, [
    handleScroll,
    mobileOnly,
    isMobile,
    threshold,
    debounceDelay,
    topThreshold,
    debug,
  ]);

  // Handle window resize (recheck mobile status)
  useEffect(() => {
    if (!mobileOnly || typeof window === 'undefined') return;

    const handleResize = () => {
      const mobile = isMobile();
      if (!mobile) {
        // Reset state when switching to desktop
        setScrollDirection(null);
        setIsAtTop(true);
        setScrollY(0);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOnly, isMobile]);

  return {
    scrollDirection,
    scrollY,
    isAtTop,
    isScrolling,
  };
}

/**
 * Hook variant that returns a simplified boolean state for common use case:
 * "Should I hide/minimize the element?"
 *
 * @param options - Configuration options
 * @returns boolean - true when scrolling down and not at top
 *
 * @example
 * ```tsx
 * function MobileNav() {
 *   const shouldMinimize = useScrollMinimize({ threshold: 50 });
 *
 *   return (
 *     <nav className={shouldMinimize ? 'h-12' : 'h-20'}>
 *       Navigation
 *     </nav>
 *   );
 * }
 * ```
 */
export function useScrollMinimize(
  options: UseScrollDirectionOptions = {}
): boolean {
  const { scrollDirection, isAtTop } = useScrollDirection(options);
  return scrollDirection === 'down' && !isAtTop;
}

/**
 * Hook variant that returns visibility state for show/hide behavior
 *
 * @param options - Configuration options
 * @returns boolean - true when should be visible (at top OR scrolling up)
 *
 * @example
 * ```tsx
 * function FloatingButton() {
 *   const isVisible = useScrollVisibility({ threshold: 100 });
 *
 *   return (
 *     <button
 *       className="fixed bottom-4 right-4 transition-opacity duration-300"
 *       style={{
 *         opacity: isVisible ? 1 : 0,
 *         pointerEvents: isVisible ? 'auto' : 'none',
 *       }}
 *     >
 *       Scroll to Top
 *     </button>
 *   );
 * }
 * ```
 */
export function useScrollVisibility(
  options: UseScrollDirectionOptions = {}
): boolean {
  const { scrollDirection, isAtTop } = useScrollDirection(options);
  return isAtTop || scrollDirection === 'up';
}
