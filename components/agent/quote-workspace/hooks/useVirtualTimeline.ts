"use client";

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';

interface VirtualItem {
  index: number;
  start: number;
  size: number;
  key: string;
}

interface UseVirtualTimelineOptions {
  count: number;
  estimateSize: (index: number) => number;
  overscan?: number;
  getItemKey?: (index: number) => string;
}

/**
 * Lightweight virtualization hook for timeline
 * Only renders visible items + overscan buffer
 */
export function useVirtualTimeline({
  count,
  estimateSize,
  overscan = 3,
  getItemKey = (i) => String(i),
}: UseVirtualTimelineOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate item positions
  const measurements = useMemo(() => {
    const items: { start: number; size: number; end: number }[] = [];
    let totalSize = 0;

    for (let i = 0; i < count; i++) {
      const size = estimateSize(i);
      items.push({ start: totalSize, size, end: totalSize + size });
      totalSize += size;
    }

    return { items, totalSize };
  }, [count, estimateSize]);

  // Find visible range
  const visibleRange = useMemo(() => {
    if (count === 0) return { start: 0, end: 0 };

    const { items } = measurements;
    let start = 0;
    let end = count - 1;

    // Binary search for start
    let low = 0;
    let high = count - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (items[mid].end < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    start = Math.max(0, low - overscan);

    // Find end
    const viewportEnd = scrollTop + containerHeight;
    low = start;
    high = count - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (items[mid].start < viewportEnd) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    end = Math.min(count - 1, low + overscan);

    return { start, end };
  }, [count, measurements, scrollTop, containerHeight, overscan]);

  // Virtual items to render
  const virtualItems: VirtualItem[] = useMemo(() => {
    const { start, end } = visibleRange;
    const items: VirtualItem[] = [];

    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        start: measurements.items[i].start,
        size: measurements.items[i].size,
        key: getItemKey(i),
      });
    }

    return items;
  }, [visibleRange, measurements, getItemKey]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to index
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current || index < 0 || index >= count) return;

    const item = measurements.items[index];
    containerRef.current.scrollTo({ top: item.start, behavior });
  }, [count, measurements]);

  return {
    containerRef,
    virtualItems,
    totalSize: measurements.totalSize,
    scrollToIndex,
    isVirtualizing: count > 10, // Only virtualize when beneficial
  };
}

/**
 * Simple pagination hook as alternative to virtualization
 */
export function usePaginatedTimeline<T>(
  items: T[],
  initialPageSize = 10
) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(items.length / pageSize);
  const visibleItems = items.slice(0, (currentPage + 1) * pageSize);
  const hasMore = visibleItems.length < items.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setCurrentPage(0);
  }, []);

  // Reset when items change significantly
  useEffect(() => {
    if (items.length <= pageSize) {
      setCurrentPage(0);
    }
  }, [items.length, pageSize]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    reset,
    totalItems: items.length,
    loadedItems: visibleItems.length,
  };
}
