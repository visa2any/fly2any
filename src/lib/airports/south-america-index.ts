/**
 * 🌎 SOUTH AMERICA AIRPORTS MODULE
 * Complete airport search and management system for South American market
 */

// Import constants for internal use
import {
  SOUTH_AMERICA_AIRPORTS_DATABASE,
  ARGENTINA_AIRPORTS,
  COLOMBIA_AIRPORTS,
  PERU_AIRPORTS,
  CHILE_AIRPORTS,
  ECUADOR_AIRPORTS,
  VENEZUELA_AIRPORTS,
  URUGUAY_AIRPORTS,
  PARAGUAY_AIRPORTS,
  BOLIVIA_AIRPORTS,
  GUIANAS_AIRPORTS,
  POPULAR_SOUTH_AMERICA_ROUTES
} from './south-america-airports-database';

// Database exports
export {
  SOUTH_AMERICA_AIRPORTS_DATABASE,
  ARGENTINA_AIRPORTS,
  COLOMBIA_AIRPORTS,
  PERU_AIRPORTS,
  CHILE_AIRPORTS,
  ECUADOR_AIRPORTS,
  VENEZUELA_AIRPORTS,
  URUGUAY_AIRPORTS,
  PARAGUAY_AIRPORTS,
  BOLIVIA_AIRPORTS,
  GUIANAS_AIRPORTS,
  POPULAR_SOUTH_AMERICA_ROUTES,
  SOUTH_AMERICA_TIMEZONE_MAP,
  SOUTH_AMERICA_REGIONS,
  createSouthAmericaAirportSearchIndex
} from './south-america-airports-database';

export type { SouthAmericaAirport } from './south-america-airports-database';

// Search service exports
export { southAmericaAirportSearch } from './south-america-airport-search';
export type { 
  SouthAmericaAirportSearchResult,
  SouthAmericaAirportSearchOptions 
} from './south-america-airport-search';

// React hook exports
export { useSouthAmericaAirportSearch } from '../../hooks/useSouthAmericaAirportSearch';
export type { 
  SouthAmericaAirportSearchResult as HookSouthAmericaAirportSearchResult,
  UseSouthAmericaAirportSearchOptions,
  UseSouthAmericaAirportSearchReturn 
} from '../../hooks/useSouthAmericaAirportSearch';

/**
 * Quick start utilities for South American airports
 */
export const SOUTH_AMERICA_AIRPORT_UTILS = {
  // Get major hubs only
  getMajorHubs: () => SOUTH_AMERICA_AIRPORTS_DATABASE
    .filter(airport => airport.category === 'major_hub')
    .map(airport => ({
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      region: airport.region
    })),
  
  // Get popular city pairs
  getPopularRoutes: () => POPULAR_SOUTH_AMERICA_ROUTES.slice(0, 10),
  
  // Check if airport is South American
  isSouthAmerican: (iataCode: string): boolean => {
    return SOUTH_AMERICA_AIRPORTS_DATABASE.some(airport => 
      airport.iataCode === iataCode.toUpperCase()
    );
  },
  
  // Get airport by code
  getAirport: (iataCode: string) => {
    return SOUTH_AMERICA_AIRPORTS_DATABASE.find(airport => 
      airport.iataCode === iataCode.toUpperCase()
    );
  },

  // Get airports by country
  getAirportsByCountry: (country: string) => {
    return SOUTH_AMERICA_AIRPORTS_DATABASE.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    );
  },

  // Get airports by region within a country
  getAirportsByRegion: (country: string, region: string) => {
    return SOUTH_AMERICA_AIRPORTS_DATABASE.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase() &&
      airport.region.toLowerCase() === region.toLowerCase()
    );
  },

  // Country-specific getters
  getArgentinaAirports: () => ARGENTINA_AIRPORTS,
  getBrazilAirports: () => SOUTH_AMERICA_AIRPORTS_DATABASE.filter(a => a.country === 'Brazil'),
  getColombiaAirports: () => COLOMBIA_AIRPORTS,
  getPeruAirports: () => PERU_AIRPORTS,
  getChileAirports: () => CHILE_AIRPORTS,
  getEcuadorAirports: () => ECUADOR_AIRPORTS,
  getVenezuelaAirports: () => VENEZUELA_AIRPORTS,
  getUruguayAirports: () => URUGUAY_AIRPORTS,
  getParaguayAirports: () => PARAGUAY_AIRPORTS,
  getBoliviaAirports: () => BOLIVIA_AIRPORTS,
  getGuianasAirports: () => GUIANAS_AIRPORTS,

  // Get international gateways
  getInternationalGateways: () => {
    return SOUTH_AMERICA_AIRPORTS_DATABASE.filter(airport => 
      airport.isInternational && ['major_hub', 'hub', 'international_gateway'].includes(airport.category)
    );
  },

  // Get capitals
  getCapitalAirports: () => {
    const capitals = ['EZE', 'GRU', 'BOG', 'LIM', 'SCL', 'UIO', 'CCS', 'MVD', 'ASU', 'LPB', 'GEO', 'PBM', 'CAY'];
    return SOUTH_AMERICA_AIRPORTS_DATABASE.filter(airport => 
      capitals.includes(airport.iataCode)
    );
  },

  // Get tourism destinations
  getTourismAirports: () => {
    const tourismCodes = ['CUZ', 'IGR', 'BRC', 'USH', 'CTG', 'GPS', 'IPC', 'PDP'];
    return SOUTH_AMERICA_AIRPORTS_DATABASE.filter(airport => 
      tourismCodes.includes(airport.iataCode)
    );
  },

  // Statistics
  getStatistics: () => {
    const total = SOUTH_AMERICA_AIRPORTS_DATABASE.length;
    const byCountry = SOUTH_AMERICA_AIRPORTS_DATABASE.reduce((acc, airport) => {
      acc[airport.country] = (acc[airport.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = SOUTH_AMERICA_AIRPORTS_DATABASE.reduce((acc, airport) => {
      acc[airport.category] = (acc[airport.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const international = SOUTH_AMERICA_AIRPORTS_DATABASE.filter(a => a.isInternational).length;
    const domestic = total - international;

    return {
      total,
      byCountry,
      byCategory,
      international,
      domestic,
      countries: Object.keys(byCountry).length
    };
  }
};