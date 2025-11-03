import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for implementing infinite scroll using Intersection Observer API
 *
 * @param callback - Function to call when sentinel element becomes visible
 * @param hasMore - Boolean indicating if there's more content to load
 * @param threshold - Intersection threshold (0-1). Default 0.8 means trigger at 80% visibility
 * @param rootMargin - Margin around root element for early triggering
 * @returns Ref to attach to sentinel element
 *
 * @example
 * ```tsx
 * const loadMoreRef = useInfiniteScroll(
 *   () => setDisplayCount(prev => prev + 20),
 *   displayCount < totalItems.length,
 *   0.8
 * );
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={loadMoreRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  threshold = 0.8,
  rootMargin = '200px'
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize callback to prevent unnecessary observer recreations
  const memoizedCallback = useCallback(() => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current || !hasMore) {
      return;
    }

    // Debounce the callback to prevent rapid successive calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      isLoadingRef.current = true;
      callback();

      // Reset loading flag after a short delay to allow next load
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 300);
    }, 200);
  }, [callback, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return;
    }

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // Trigger callback when sentinel is intersecting
        if (entry.isIntersecting) {
          memoizedCallback();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin, // Load content 200px before reaching sentinel
        threshold, // Trigger when 80% of sentinel is visible
      }
    );

    // Start observing
    observer.observe(sentinel);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      observer.disconnect();
    };
  }, [hasMore, threshold, rootMargin, memoizedCallback]);

  return sentinelRef;
}

/**
 * Hook variant with loading state for more control
 *
 * @param callback - Async function to call when sentinel becomes visible
 * @param hasMore - Boolean indicating if there's more content to load
 * @param threshold - Intersection threshold (0-1)
 * @returns [sentinelRef, isLoading] - Ref for sentinel and loading state
 */
export function useInfiniteScrollWithLoading(
  callback: () => Promise<void> | void,
  hasMore: boolean,
  threshold = 0.8
): [React.RefObject<HTMLDivElement>, boolean] {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true;
          try {
            await callback();
          } finally {
            // Small delay to prevent immediate re-trigger
            setTimeout(() => {
              isLoadingRef.current = false;
            }, 300);
          }
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, threshold, callback]);

  return [sentinelRef, isLoadingRef.current];
}
