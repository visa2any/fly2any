/**
 * 🌎 SOUTH AMERICA AIRPORT SEARCH HOOK
 * React hook for intelligent South American airport search with instant results
 * Optimized for South American market with comprehensive multi-language support
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { southAmericaAirportSearch } from '../lib/airports/south-america-airport-search';
import { POPULAR_SOUTH_AMERICA_ROUTES } from '../lib/airports/south-america-airports-database';

export interface SouthAmericaAirportSearchResult {
  iataCode: string;
  icaoCode?: string;
  name: string;
  city: string;
  state?: string;
  stateCode?: string;
  country: string;
  countryCode: string;
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
  isSouthAmericaAirport?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface UseSouthAmericaAirportSearchOptions {
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredCountries?: string[];
  preferredRegions?: string[];
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  prioritizePopular?: boolean;
}

export interface UseSouthAmericaAirportSearchReturn {
  // Search state
  results: SouthAmericaAirportSearchResult[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  
  // Search methods
  searchAirports: (query: string) => Promise<void>;
  clearResults: () => void;
  
  // Quick access methods
  getPopularAirports: () => SouthAmericaAirportSearchResult[];
  getAirportByCode: (iataCode: string) => SouthAmericaAirportSearchResult | null;
  getPopularRoutes: () => Array<{ from: string; to: string; route: string; popularity: number }>;
  
  // Helper methods
  isDomesticRoute: (origin: string, destination: string) => boolean;
  isSouthAmericanRoute: (origin: string, destination: string) => boolean;
  getTimezoneDifference: (origin: string, destination: string) => number;
  
  // Country specific methods
  getAirportsByCountry: (country: string) => SouthAmericaAirportSearchResult[];
  getMajorHubs: () => SouthAmericaAirportSearchResult[];
  
  // Suggestions
  suggestDestinations: (originCode: string) => string[];
}

export function useSouthAmericaAirportSearch(
  options: UseSouthAmericaAirportSearchOptions = {}
): UseSouthAmericaAirportSearchReturn {
  const {
    includeInternational = true,
    includeRegional = true,
    preferredCountries = [],
    preferredRegions = [],
    debounceMs = 300,
    minQueryLength = 1,
    maxResults = 10,
    prioritizePopular = true
  } = options;

  // State
  const [results, setResults] = useState<SouthAmericaAirportSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing and caching
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>('');
  const cacheRef = useRef<Map<string, SouthAmericaAirportSearchResult[]>>(new Map());

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
    const cacheKey = `${trimmedQuery.toLowerCase()}_${includeInternational}_${includeRegional}_${preferredCountries.join(',')}_${preferredRegions.join(',')}`;
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

        // 1. First try local South American airports database (instant)
        let localResults: SouthAmericaAirportSearchResult[] = [];
        try {
          const southAmericaResults = await southAmericaAirportSearch.searchAirports(trimmedQuery, {
            limit: maxResults,
            includeInternational,
            includeRegional,
            preferredCountries,
            preferredRegions,
            sortBy: 'relevance'
          });

          localResults = southAmericaResults.map(airport => ({
            iataCode: airport.iataCode,
            icaoCode: airport.icaoCode,
            name: airport.name,
            city: airport.city,
            state: airport.state,
            stateCode: airport.stateCode,
            country: airport.country,
            countryCode: airport.countryCode,
            region: airport.region,
            timezone: airport.timezone,
            category: airport.category,
            isInternational: airport.isInternational,
            passengerCount: airport.passengerCount,
            relevanceScore: airport.relevanceScore,
            matchType: airport.matchType,
            displayName: airport.displayName,
            description: airport.description,
            popularRoutes: airport.popularDestinations?.slice(0, 3),
            isSouthAmericaAirport: true,
            coordinates: airport.coordinates
          }));
        } catch (localError) {
          console.warn('Local South American airport search failed:', localError);
        }

        // 2. If we have good local results, use them
        if (localResults.length >= 3) {
          const finalResults = localResults.slice(0, maxResults);
          setResults(finalResults);
          cacheRef.current.set(cacheKey, finalResults);
          return;
        }

        // 3. Supplement with API search for international airports
        let apiResults: SouthAmericaAirportSearchResult[] = [];
        try {
          const response = await fetch(`/api/flights/airports?keyword=${encodeURIComponent(trimmedQuery)}&limit=${maxResults}&includeInternational=${includeInternational}&includeRegional=${includeRegional}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Filter out South American airports (to avoid duplicates) and add non-SA airports
              apiResults = data.data
                .filter((airport: any) => {
                  const southAmericanCountries = [
                    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 
                    'French Guiana', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'
                  ];
                  return !southAmericanCountries.includes(airport.country);
                })
                .map((airport: any) => ({
                  iataCode: airport.iataCode,
                  icaoCode: airport.icaoCode,
                  name: airport.name,
                  city: airport.city,
                  state: airport.state,
                  stateCode: airport.countryCode,
                  country: airport.country,
                  countryCode: airport.countryCode,
                  displayName: airport.displayName || `${airport.city}, ${airport.country} (${airport.iataCode})`,
                  description: airport.description || `${airport.name}`,
                  isSouthAmericaAirport: false,
                  coordinates: airport.coordinates,
                  timezone: airport.timezone
                }));
            }
          }
        } catch (apiError) {
          console.warn('API airport search failed:', apiError);
        }

        // 4. Combine and deduplicate results
        const combinedResults = new Map<string, SouthAmericaAirportSearchResult>();
        
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
        console.error('South American airport search error:', searchError);
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
  }, [includeInternational, includeRegional, preferredCountries, preferredRegions, maxResults, minQueryLength, prioritizePopular, debounceMs]);

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
   * Get popular South American airports for empty state
   */
  const getPopularAirports = useCallback((): SouthAmericaAirportSearchResult[] => {
    const popularCodes = ['GRU', 'EZE', 'BOG', 'LIM', 'SCL', 'UIO', 'CCS', 'MVD', 'ASU', 'LPB'];
    
    return popularCodes
      .map(code => {
        const airport = southAmericaAirportSearch.getAirportByCode(code);
        if (airport) {
          return {
            iataCode: airport.iataCode,
            icaoCode: airport.icaoCode,
            name: airport.name,
            city: airport.city,
            state: airport.state,
            stateCode: airport.stateCode,
            country: airport.country,
            countryCode: airport.countryCode,
            region: airport.region,
            category: airport.category,
            isInternational: airport.isInternational,
            passengerCount: airport.passengerCount,
            displayName: `${airport.city}, ${airport.country} (${airport.iataCode})`,
            description: `${airport.category.replace('_', ' ').toUpperCase()} • ${airport.passengerCount}M passengers/year`,
            isSouthAmericaAirport: true,
            popularRoutes: airport.popularDestinations?.slice(0, 3),
            coordinates: airport.coordinates,
            timezone: airport.timezone
          };
        }
        return null;
      })
      .filter(Boolean) as SouthAmericaAirportSearchResult[];
  }, []);

  /**
   * Get airport by IATA code
   */
  const getAirportByCode = useCallback((iataCode: string): SouthAmericaAirportSearchResult | null => {
    const airport = southAmericaAirportSearch.getAirportByCode(iataCode);
    if (airport) {
      return {
        iataCode: airport.iataCode,
        icaoCode: airport.icaoCode,
        name: airport.name,
        city: airport.city,
        state: airport.state,
        stateCode: airport.stateCode,
        country: airport.country,
        countryCode: airport.countryCode,
        region: airport.region,
        category: airport.category,
        isInternational: airport.isInternational,
        passengerCount: airport.passengerCount,
        displayName: `${airport.city}, ${airport.country} (${airport.iataCode})`,
        description: `${airport.category.replace('_', ' ').toUpperCase()}`,
        isSouthAmericaAirport: true,
        coordinates: airport.coordinates,
        timezone: airport.timezone
      };
    }
    return null;
  }, []);

  /**
   * Get popular South American routes
   */
  const getPopularRoutes = useCallback(() => {
    return POPULAR_SOUTH_AMERICA_ROUTES.slice(0, 10);
  }, []);

  /**
   * Check if route is domestic (same country)
   */
  const isDomesticRoute = useCallback((origin: string, destination: string): boolean => {
    return southAmericaAirportSearch.isDomesticRoute(origin, destination);
  }, []);

  /**
   * Check if route is within South America
   */
  const isSouthAmericanRoute = useCallback((origin: string, destination: string): boolean => {
    return southAmericaAirportSearch.isSouthAmericanRoute(origin, destination);
  }, []);

  /**
   * Get timezone difference between airports
   */
  const getTimezoneDifference = useCallback((origin: string, destination: string): number => {
    return southAmericaAirportSearch.getTimezoneDifference(origin, destination);
  }, []);

  /**
   * Get airports by country
   */
  const getAirportsByCountry = useCallback((country: string): SouthAmericaAirportSearchResult[] => {
    const airports = southAmericaAirportSearch.getAirportsByCountry(country);
    return airports.map(airport => ({
      iataCode: airport.iataCode,
      icaoCode: airport.icaoCode,
      name: airport.name,
      city: airport.city,
      state: airport.state,
      stateCode: airport.stateCode,
      country: airport.country,
      countryCode: airport.countryCode,
      region: airport.region,
      category: airport.category,
      isInternational: airport.isInternational,
      passengerCount: airport.passengerCount,
      displayName: `${airport.city}, ${airport.country} (${airport.iataCode})`,
      description: `${airport.category.replace('_', ' ').toUpperCase()}`,
      isSouthAmericaAirport: true,
      coordinates: airport.coordinates,
      timezone: airport.timezone
    }));
  }, []);

  /**
   * Get major hubs only
   */
  const getMajorHubs = useCallback((): SouthAmericaAirportSearchResult[] => {
    const hubs = southAmericaAirportSearch.getMajorHubs();
    return hubs.map(airport => ({
      iataCode: airport.iataCode,
      icaoCode: airport.icaoCode,
      name: airport.name,
      city: airport.city,
      state: airport.state,
      stateCode: airport.stateCode,
      country: airport.country,
      countryCode: airport.countryCode,
      region: airport.region,
      category: airport.category,
      isInternational: airport.isInternational,
      passengerCount: airport.passengerCount,
      displayName: `${airport.city}, ${airport.country} (${airport.iataCode})`,
      description: `${airport.category.replace('_', ' ').toUpperCase()} • ${airport.passengerCount}M passengers/year`,
      isSouthAmericaAirport: true,
      coordinates: airport.coordinates,
      timezone: airport.timezone
    }));
  }, []);

  /**
   * Suggest popular destinations from an origin
   */
  const suggestDestinations = useCallback((originCode: string): string[] => {
    const routes = POPULAR_SOUTH_AMERICA_ROUTES.filter(route => 
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
    isSouthAmericanRoute,
    getTimezoneDifference,
    getAirportsByCountry,
    getMajorHubs,
    suggestDestinations
  };
}