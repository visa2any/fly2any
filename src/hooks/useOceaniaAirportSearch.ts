/**
 * 🌺 OCEANIA AIRPORT SEARCH HOOK
 * React hook for Oceania airport search with caching and performance optimization
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { oceaniaAirportSearch, OceaniaAirportSearchResult, OceaniaAirportSearchOptions } from '@/lib/airports/oceania-airport-search';
import { OceaniaAirport } from '@/lib/airports/oceania-airports-database';

export interface UseOceaniaAirportSearchOptions extends OceaniaAirportSearchOptions {
  debounceMs?: number;
  cacheResults?: boolean;
  fallbackToApi?: boolean;
}

export interface UseOceaniaAirportSearchReturn {
  results: OceaniaAirportSearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  getAirportByCode: (code: string) => OceaniaAirport | null;
  popularAirports: OceaniaAirport[];
  totalResults: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useOceaniaAirportSearch(
  initialQuery: string = '',
  options: UseOceaniaAirportSearchOptions = {}
): UseOceaniaAirportSearchReturn {
  const {
    debounceMs = 300,
    cacheResults = true,
    fallbackToApi = false,
    limit = 10,
    ...searchOptions
  } = options;

  const [results, setResults] = useState<OceaniaAirportSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [totalResults, setTotalResults] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(limit);

  // Memoize popular airports
  const popularAirports = useMemo(() => {
    return oceaniaAirportSearch.getPopularAirports(10);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setTotalResults(0);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Search with current limit
        const searchResults = await oceaniaAirportSearch.searchAirports(query, {
          ...searchOptions,
          limit: currentLimit
        });

        setResults(searchResults);
        setTotalResults(searchResults.length);

        // If using fallback API and no results found, try external API
        if (fallbackToApi && searchResults.length === 0) {
          try {
            // Here you could integrate with external airport API
            // For now, just return empty results
            console.log('No local results found, fallback API could be implemented here');
          } catch (apiError) {
            console.warn('Fallback API failed:', apiError);
          }
        }
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : 'Search failed');
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    },
    [searchOptions, currentLimit, fallbackToApi]
  );

  // Debounce mechanism
  useEffect(() => {
    if (!currentQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      debouncedSearch(currentQuery);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [currentQuery, debouncedSearch, debounceMs]);

  // Main search function
  const search = useCallback(async (query: string) => {
    setCurrentQuery(query);
    setCurrentLimit(limit); // Reset limit when new search
  }, [limit]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setCurrentQuery('');
    setTotalResults(0);
    setError(null);
    setCurrentLimit(limit);
  }, [limit]);

  // Get airport by code
  const getAirportByCode = useCallback((code: string) => {
    return oceaniaAirportSearch.getAirportByCode(code);
  }, []);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!currentQuery.trim() || loading) return;

    const newLimit = currentLimit + limit;
    setCurrentLimit(newLimit);

    // The useEffect will trigger a new search with the increased limit
  }, [currentQuery, loading, currentLimit, limit]);

  // Check if there are more results to load
  const hasMore = useMemo(() => {
    return results.length >= currentLimit && results.length > 0;
  }, [results.length, currentLimit]);

  // Initial search if query provided
  useEffect(() => {
    if (initialQuery.trim()) {
      search(initialQuery);
    }
  }, [initialQuery, search]);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
    getAirportByCode,
    popularAirports,
    totalResults,
    hasMore,
    loadMore
  };
}