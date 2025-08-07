/**
 * 🇺🇸 US AIRPORTS MODULE
 * Complete airport search and management system for US market
 */

// Import constants for internal use
import {
  US_AIRPORTS_DATABASE,
  US_MAJOR_HUBS,
  POPULAR_US_ROUTES
} from './us-airports-database';

// Database exports
export {
  US_AIRPORTS_DATABASE,
  US_MAJOR_HUBS,
  US_HUB_AIRPORTS,
  US_REGIONAL_AIRPORTS,
  POPULAR_US_ROUTES,
  US_TIMEZONE_MAP,
  US_REGIONS,
  createAirportSearchIndex
} from './us-airports-database';

export type { USAirport } from './us-airports-database';

// Search service exports
export { usAirportSearch } from './us-airport-search';
export type { 
  AirportSearchResult as USAirportSearchResult,
  AirportSearchOptions as USAirportSearchOptions 
} from './us-airport-search';

// React hook exports
export { useUSAirportSearch } from '../../hooks/useUSAirportSearch';
export type { 
  AirportSearchResult,
  UseUSAirportSearchOptions,
  UseUSAirportSearchReturn 
} from '../../hooks/useUSAirportSearch';

// Component exports
export { default as USAirportAutocomplete } from '../../components/ui/us-airport-autocomplete';
export type { USAirportAutocompleteProps } from '../../components/ui/us-airport-autocomplete';

/**
 * Quick start utilities
 */
export const US_AIRPORT_UTILS = {
  // Get major hubs only
  getMajorHubs: () => US_MAJOR_HUBS.map(airport => ({
    iataCode: airport.iataCode,
    name: airport.name,
    city: airport.city,
    state: airport.state,
    region: airport.region
  })),
  
  // Get popular city pairs
  getPopularRoutes: () => POPULAR_US_ROUTES.slice(0, 10),
  
  // Check if airport is US domestic
  isUSDomestic: (iataCode: string): boolean => {
    return US_AIRPORTS_DATABASE.some(airport => 
      airport.iataCode === iataCode.toUpperCase()
    );
  },
  
  // Get airport by code
  getAirport: (iataCode: string) => {
    return US_AIRPORTS_DATABASE.find(airport => 
      airport.iataCode === iataCode.toUpperCase()
    );
  },
  
  // Get airports by region
  getAirportsByRegion: (region: string) => {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.region.toLowerCase() === region.toLowerCase()
    );
  }
};