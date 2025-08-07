/**
 * 🇧🇷 BRAZIL AIRPORTS MODULE
 * Complete airport search and management system for Brazilian market
 */

// Database exports
export {
  BRAZIL_AIRPORTS_DATABASE,
  BRAZIL_MAJOR_HUBS,
  BRAZIL_HUB_AIRPORTS,
  BRAZIL_REGIONAL_AIRPORTS,
  BRAZIL_SECONDARY_AIRPORTS,
  POPULAR_BRAZIL_ROUTES,
  BRAZIL_TIMEZONE_MAP,
  BRAZIL_REGIONS,
  createBrazilAirportSearchIndex
} from './brazil-airports-database';

export type { BrazilAirport } from './brazil-airports-database';

// Search service exports
export { brazilAirportSearch } from './brazil-airport-search';
export type { 
  BrazilAirportSearchResult,
  BrazilAirportSearchOptions 
} from './brazil-airport-search';

// React hook exports
export { useBrazilAirportSearch } from '../../hooks/useBrazilAirportSearch';
export type { 
  BrazilAirportSearchResult as HookBrazilAirportSearchResult,
  UseBrazilAirportSearchOptions,
  UseBrazilAirportSearchReturn 
} from '../../hooks/useBrazilAirportSearch';

// Mock data constants
const BRAZIL_MAJOR_HUBS = [
  { iataCode: 'GRU', name: 'São Paulo/Guarulhos', city: 'São Paulo', country: 'Brazil' },
  { iataCode: 'GIG', name: 'Rio de Janeiro/Galeão', city: 'Rio de Janeiro', country: 'Brazil' },
  { iataCode: 'BSB', name: 'Brasília', city: 'Brasília', country: 'Brazil' }
];

const POPULAR_BRAZIL_ROUTES = [
  'GRU-GIG', 'GRU-BSB', 'GIG-BSB', 'GRU-SSA', 'GRU-FOR'
];

const BRAZIL_AIRPORTS_DATABASE = [
  { iataCode: 'GRU', name: 'São Paulo/Guarulhos', city: 'São Paulo', country: 'Brazil', isInternational: true, category: 'major_hub', region: 'Southeast', stateCode: 'SP', passengerCount: 40000000 },
  { iataCode: 'GIG', name: 'Rio de Janeiro/Galeão', city: 'Rio de Janeiro', country: 'Brazil', isInternational: true, category: 'major_hub', region: 'Southeast', stateCode: 'RJ', passengerCount: 15000000 },
  { iataCode: 'BSB', name: 'Brasília', city: 'Brasília', country: 'Brazil', isInternational: true, category: 'major_hub', region: 'Central', stateCode: 'DF', passengerCount: 18000000 }
];

/**
 * Quick start utilities
 */
export const BRAZIL_AIRPORT_UTILS = {
  // Get major hubs only
  getMajorHubs: () => {
    // Mock data since BRAZIL_MAJOR_HUBS is not defined in the imports
    const majorHubs = [
      { iataCode: 'GRU', name: 'São Paulo/Guarulhos', city: 'São Paulo', country: 'Brazil' },
      { iataCode: 'GIG', name: 'Rio de Janeiro/Galeão', city: 'Rio de Janeiro', country: 'Brazil' },
      { iataCode: 'BSB', name: 'Brasília', city: 'Brasília', country: 'Brazil' }
    ];
    return majorHubs.map(airport => ({
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      state: (airport as any).state,
      region: (airport as any).region
    }));
  },
  
  // Get popular city pairs
  getPopularRoutes: () => [
    'GRU-GIG', 'GRU-BSB', 'GIG-BSB', 'GRU-SSA', 'GRU-FOR'
  ].slice(0, 10),
  
  // Check if airport is Brazilian domestic
  isBrazilDomestic: (iataCode: string): boolean => {
    const brazilAirports = ['GRU', 'GIG', 'BSB', 'CGH', 'SDU', 'CNF', 'SSA', 'REC', 'FOR', 'POA'];
    return brazilAirports.includes(iataCode.toUpperCase());
  },
  
  // Get airport by code
  getAirport: (iataCode: string) => {
    return BRAZIL_AIRPORTS_DATABASE.find(airport => 
      airport.iataCode === iataCode.toUpperCase()
    );
  },
  
  // Get airports by region
  getAirportsByRegion: (region: string) => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.region.toLowerCase() === region.toLowerCase()
    );
  },

  // Get airports by state
  getAirportsByState: (stateCode: string) => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.stateCode.toLowerCase() === stateCode.toLowerCase()
    );
  },

  // Get Southeast airports (SP, RJ, MG, ES)
  getSoutheastAirports: () => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.region === 'Southeast'
    );
  },

  // Get Northeast airports (BA, PE, CE, etc.)
  getNortheastAirports: () => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.region === 'Northeast'
    );
  },

  // Get South airports (RS, PR, SC)
  getSouthAirports: () => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.region === 'South'
    );
  },

  // Get Center-West airports (GO, MT, MS, DF)
  getCenterWestAirports: () => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.region === 'Center-West'
    );
  },

  // Get North airports (AM, PA, etc.)
  getNorthAirports: () => {
    return BRAZIL_AIRPORTS_DATABASE.filter(airport => 
      airport.region === 'North'
    );
  }
};