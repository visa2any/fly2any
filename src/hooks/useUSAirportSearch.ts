/**
 * 🇺🇸 US AIRPORT SEARCH HOOK
 * React hook for intelligent US airport search with instant results
 * Optimized for US market with comprehensive fallback support
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getUSAirportSearch } from '../lib/airports/us-airport-search';
import { POPULAR_US_ROUTES } from '../lib/airports/us-airports-database';

export interface AirportSearchResult {
  iataCode: string;
  icaoCode?: string;
  name: string;
  city: string;
  state?: string;
  stateCode?: string;
  country: string;
  region?: string;
  timezone?: string;
  category?: string;
  isInternational?: boolean;
  passengerCount?: number;
  relevanceScore?: number;
  matchType?: string;
  displayName: string;
  description?: string;
  popularRoutes?: string[];
  isUSAirport?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UseUSAirportSearchOptions {
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredRegions?: string[];
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  prioritizePopular?: boolean;
}

export interface UseUSAirportSearchReturn {
  // Search state
  results: AirportSearchResult[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Search methods
  searchAirports: (query: string) => Promise<void>;
  clearResults: () => void;
  
  // Quick access methods
  getPopularAirports: () => AirportSearchResult[];
  getAirportByCode: (iataCode: string) => AirportSearchResult | undefined;
  getPopularRoutes: () => Array<{ from: string; to: string; route: string; popularity: number }>;
  
  // Helper methods
  isDomesticRoute: (origin: string, destination: string) => boolean;
  getTimezoneDifference: (origin: string, destination: string) => number;
  
  // Suggestions
  suggestDestinations: (originCode: string) => string[];
}

export function useUSAirportSearch(
  options: UseUSAirportSearchOptions = {}
): UseUSAirportSearchReturn {
  const {
    includeInternational = true,
    includeRegional = true,
    preferredRegions = [],
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 10,
    prioritizePopular = true
  } = options;

  // State
  const [results, setResults] = useState<AirportSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing and caching
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>('');
  const cacheRef = useRef<Map<string, AirportSearchResult[]>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Main search function with caching and API fallback
   */
  const searchAirports = useCallback(async (query: string): Promise<void> => {
    const trimmedQuery = query.trim();
    
    // Handle empty query
    if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
      if (prioritizePopular) {
        setResults(getPopularAirports());
      } else {
        setResults([]);
      }
      return;
    }

    // Prevent duplicate searches
    if (trimmedQuery === lastQueryRef.current) {
      return;
    }

    // Check cache first
    const cacheKey = `${trimmedQuery.toLowerCase()}_${includeInternational}_${includeRegional}`;
    const cachedResults = cacheRef.current.get(cacheKey);
    if (cachedResults) {
      setResults(cachedResults);
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsSearching(true);
    setError(null);

    // Debounced search
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        lastQueryRef.current = trimmedQuery;

        // 1. First try local US airports database (instant)
        let localResults: AirportSearchResult[] = [];
        try {
          const usResults = await getUSAirportSearch().searchAirports(trimmedQuery, {
            limit: maxResults,
            includeInternational,
            includeRegional,
            preferredRegions,
            sortBy: 'relevance'
          });

          localResults = usResults.map(airport => ({
            iataCode: airport.iataCode,
            icaoCode: airport.icaoCode,
            name: airport.name,
            city: airport.city,
            state: airport.state,
            stateCode: airport.stateCode,
            country: airport.country,
            region: airport.region,
            timezone: airport.timezone,
            category: airport.category,
            isInternational: airport.isInternational,
            passengerCount: airport.passengerCount,
            relevanceScore: airport.relevanceScore,
            matchType: airport.matchType,
            displayName: airport.displayName,
            description: airport.description,
            popularRoutes: airport.popularRoutes,
            isUSAirport: true
          }));
        } catch (localError) {
          console.warn('Local airport search failed:', localError);
        }

        // 2. If we have good local results, use them
        if (localResults.length >= 3) {
          const finalResults = localResults.slice(0, maxResults);
          setResults(finalResults);
          cacheRef.current.set(cacheKey, finalResults);
          return;
        }

        // 3. Supplement with API search for international airports
        let apiResults: AirportSearchResult[] = [];
        try {
          const response = await fetch(`/api/flights/airports?keyword=${encodeURIComponent(trimmedQuery)}&limit=${maxResults}&includeInternational=${includeInternational}&includeRegional=${includeRegional}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              apiResults = data.data.map((airport: any) => ({
                iataCode: airport.iataCode,
                icaoCode: airport.icaoCode,
                name: airport.name,
                city: airport.city,
                state: airport.state,
                stateCode: airport.countryCode, // API uses this field differently
                country: airport.country,
                displayName: airport.displayName || `${airport.city}, ${airport.country} (${airport.iataCode})`,
                description: airport.description || `${airport.name}`,
                isUSAirport: airport.isUSAirport || false,
                coordinates: airport.coordinates,
                timezone: airport.timezone
              }));
            }
          }
        } catch (apiError) {
          console.warn('API airport search failed:', apiError);
        }

        // 4. Combine and deduplicate results
        const combinedResults = new Map<string, AirportSearchResult>();
        
        // Add local results first (higher priority)
        localResults.forEach(airport => {
          combinedResults.set(airport.iataCode, airport);
        });
        
        // Add API results if not already present
        apiResults.forEach(airport => {
          if (!combinedResults.has(airport.iataCode)) {
            combinedResults.set(airport.iataCode, airport);
          }
        });
        
        const finalResults = Array.from(combinedResults.values()).slice(0, maxResults);
        
        // Cache and set results
        setResults(finalResults);
        cacheRef.current.set(cacheKey, finalResults);

      } catch (searchError) {
        console.error('Airport search error:', searchError);
        setError('Failed to search airports. Please try again.');
        
        // Fallback to popular airports on error
        if (prioritizePopular) {
          setResults(getPopularAirports());
        }
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    }, debounceMs);
  }, [includeInternational, includeRegional, preferredRegions, maxResults, minQueryLength, prioritizePopular, debounceMs]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    lastQueryRef.current = '';
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  /**
   * Get popular US airports for empty state
   */
  const getPopularAirports = useCallback((): AirportSearchResult[] => {
    const popularCodes = ['LAX', 'JFK', 'ORD', 'DFW', 'ATL', 'MIA', 'LGA', 'SFO', 'DEN', 'SEA'];
    
    return popularCodes
      .map(code => {
        const airport = getUSAirportSearch().getAirportByCode(code);
        if (airport) {
          return {
            iataCode: airport.iataCode,
            icaoCode: airport.icaoCode,
            name: airport.name,
            city: airport.city,
            state: airport.state,
            stateCode: airport.stateCode,
            country: airport.country,
            region: airport.region,
            category: airport.category,
            isInternational: airport.isInternational,
            passengerCount: airport.passengerCount,
            displayName: `${airport.city}, ${airport.stateCode} (${airport.iataCode})`,
            description: `${airport.category.replace('_', ' ').toUpperCase()} • ${airport.passengerCount}M passengers/year`,
            isUSAirport: true,
            popularRoutes: airport.popularDestinations?.slice(0, 3)
          };
        }
        return null;
      })
      .filter(Boolean) as AirportSearchResult[];
  }, []);

  /**
   * Get airport by IATA code
   */
  const getAirportByCode = useCallback((iataCode: string): AirportSearchResult | undefined => {
    const airport = getUSAirportSearch().getAirportByCode(iataCode);
    if (airport) {
      return {
        iataCode: airport.iataCode,
        icaoCode: airport.icaoCode,
        name: airport.name,
        city: airport.city,
        state: airport.state,
        stateCode: airport.stateCode,
        country: airport.country,
        region: airport.region,
        category: airport.category,
        isInternational: airport.isInternational,
        passengerCount: airport.passengerCount,
        displayName: `${airport.city}, ${airport.stateCode} (${airport.iataCode})`,
        description: `${airport.category.replace('_', ' ').toUpperCase()}`,
        isUSAirport: true,
        coordinates: airport.coordinates
      };
    }
    return undefined;
  }, []);

  /**
   * Get popular US routes
   */
  const getPopularRoutes = useCallback(() => {
    return POPULAR_US_ROUTES.slice(0, 10);
  }, []);

  /**
   * Check if route is domestic US
   */
  const isDomesticRoute = useCallback((origin: string, destination: string): boolean => {
    return getUSAirportSearch().isDomesticRoute(origin, destination);
  }, []);

  /**
   * Get timezone difference between airports
   */
  const getTimezoneDifference = useCallback((origin: string, destination: string): number => {
    return getUSAirportSearch().getTimezoneDifference(origin, destination);
  }, []);

  /**
   * Suggest popular destinations from an origin
   */
  const suggestDestinations = useCallback((originCode: string): string[] => {
    const routes = POPULAR_US_ROUTES.filter(route => 
      route.from === originCode.toUpperCase()
    );
    
    return routes
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 5)
      .map(route => route.to);
  }, []);

  return {
    // State
    results,
    isLoading,
    isSearching,
    error,
    
    // Methods
    searchAirports,
    clearResults,
    
    // Quick access
    getPopularAirports,
    getAirportByCode,
    getPopularRoutes,
    
    // Helpers
    isDomesticRoute,
    getTimezoneDifference,
    suggestDestinations
  };
}