'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface DatePrice {
  date: string; // YYYY-MM-DD
  price: number; // USD
  available: boolean;
  isWeekend: boolean;
  isCheapest: boolean;
  approximate: boolean;
  cached: boolean;
  cachedAt?: string;
}

export interface PriceCalendarData {
  dates: DatePrice[];
  cheapestDate: string | null;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  route: string;
  coverage: {
    total: number;
    cached: number;
    approximate: number;
    percentage: number;
  };
}

interface UsePriceCalendarOptions {
  origin: string;
  destination: string;
  centerDate: string; // YYYY-MM-DD
  range?: number; // Days before/after center (default: 15)
  adults?: number;
  cabinClass?: string;
  enabled?: boolean; // Enable/disable fetching
}

interface UsePriceCalendarReturn {
  data: PriceCalendarData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  coverage: number; // Percentage of dates with cached prices
}

/**
 * Hook to fetch price calendar data with automatic caching and debouncing
 */
export function usePriceCalendar({
  origin,
  destination,
  centerDate,
  range = 15,
  adults = 1,
  cabinClass = 'economy',
  enabled = true,
}: UsePriceCalendarOptions): UsePriceCalendarReturn {
  const [data, setData] = useState<PriceCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to track abort controller and debounce timer
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCalendarPrices = useCallback(async () => {
    // Don't fetch if disabled or missing required params
    if (!enabled || !origin || !destination || !centerDate) {
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        centerDate,
        range: range.toString(),
        adults: adults.toString(),
        cabinClass,
      });

      const response = await fetch(`/api/flights/calendar-prices?${params.toString()}`, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch calendar prices');
      }

      const calendarData: PriceCalendarData = await response.json();

      // Only update if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setData(calendarData);
        setError(null);
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Error fetching calendar prices:', err);

      if (!abortController.signal.aborted) {
        setError(err.message || 'Failed to fetch calendar prices');
        setData(null);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [origin, destination, centerDate, range, adults, cabinClass, enabled]);

  // Debounced fetch with 300ms delay
  const debouncedFetch = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchCalendarPrices();
    }, 300);
  }, [fetchCalendarPrices]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    debouncedFetch();

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetch]);

  // Calculate coverage percentage
  const coverage = data?.coverage.percentage || 0;

  return {
    data,
    isLoading,
    error,
    refetch: fetchCalendarPrices,
    coverage,
  };
}
