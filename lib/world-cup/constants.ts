/**
 * FIFA World Cup 2026 Host Cities and Venues
 *
 * The tournament will be hosted across 16 cities in 3 countries:
 * - USA: 11 cities
 * - Canada: 2 cities
 * - Mexico: 3 cities
 *
 * Dates: June 11 - July 19, 2026
 */

export interface WorldCupCity {
  code: string;
  city: string;
  country: 'USA' | 'Canada' | 'Mexico';
  stadium: string;
  airportCodes: string[];
}

/**
 * Complete list of FIFA World Cup 2026 host cities with their airport codes
 */
export const WORLD_CUP_2026_HOST_CITIES: WorldCupCity[] = [
  // USA (11 cities)
  {
    code: 'ATL',
    city: 'Atlanta',
    country: 'USA',
    stadium: 'Mercedes-Benz Stadium',
    airportCodes: ['ATL'],
  },
  {
    code: 'BOS',
    city: 'Boston',
    country: 'USA',
    stadium: 'Gillette Stadium',
    airportCodes: ['BOS', 'MHT', 'PVD'],
  },
  {
    code: 'DFW',
    city: 'Dallas',
    country: 'USA',
    stadium: 'AT&T Stadium',
    airportCodes: ['DFW', 'DAL'],
  },
  {
    code: 'IAH',
    city: 'Houston',
    country: 'USA',
    stadium: 'NRG Stadium',
    airportCodes: ['IAH', 'HOU'],
  },
  {
    code: 'MCI',
    city: 'Kansas City',
    country: 'USA',
    stadium: 'Arrowhead Stadium',
    airportCodes: ['MCI'],
  },
  {
    code: 'LAX',
    city: 'Los Angeles',
    country: 'USA',
    stadium: 'SoFi Stadium',
    airportCodes: ['LAX', 'BUR', 'ONT', 'LGB', 'SNA'],
  },
  {
    code: 'MIA',
    city: 'Miami',
    country: 'USA',
    stadium: 'Hard Rock Stadium',
    airportCodes: ['MIA', 'FLL', 'PBI'],
  },
  {
    code: 'NYC',
    city: 'New York / New Jersey',
    country: 'USA',
    stadium: 'MetLife Stadium',
    airportCodes: ['JFK', 'EWR', 'LGA'],
  },
  {
    code: 'PHL',
    city: 'Philadelphia',
    country: 'USA',
    stadium: 'Lincoln Financial Field',
    airportCodes: ['PHL'],
  },
  {
    code: 'SFO',
    city: 'San Francisco Bay Area',
    country: 'USA',
    stadium: "Levi's Stadium",
    airportCodes: ['SFO', 'SJC', 'OAK'],
  },
  {
    code: 'SEA',
    city: 'Seattle',
    country: 'USA',
    stadium: 'Lumen Field',
    airportCodes: ['SEA'],
  },
  // Canada (2 cities)
  {
    code: 'YYZ',
    city: 'Toronto',
    country: 'Canada',
    stadium: 'BMO Field',
    airportCodes: ['YYZ', 'YTZ'],
  },
  {
    code: 'YVR',
    city: 'Vancouver',
    country: 'Canada',
    stadium: 'BC Place',
    airportCodes: ['YVR'],
  },
  // Mexico (3 cities)
  {
    code: 'GDL',
    city: 'Guadalajara',
    country: 'Mexico',
    stadium: 'Estadio Akron',
    airportCodes: ['GDL'],
  },
  {
    code: 'MEX',
    city: 'Mexico City',
    country: 'Mexico',
    stadium: 'Estadio Azteca',
    airportCodes: ['MEX'],
  },
  {
    code: 'MTY',
    city: 'Monterrey',
    country: 'Mexico',
    stadium: 'Estadio BBVA',
    airportCodes: ['MTY'],
  },
];

/**
 * Flat array of all airport codes for World Cup 2026 host cities
 * Use this for quick lookups and filtering
 */
export const WORLD_CUP_2026_AIRPORT_CODES: string[] = WORLD_CUP_2026_HOST_CITIES
  .flatMap(city => city.airportCodes);

/**
 * Check if an airport code belongs to a World Cup 2026 host city
 * @param airportCode - The IATA airport code to check
 * @returns true if the airport is in a host city, false otherwise
 */
export function isWorldCupHostCity(airportCode: string): boolean {
  const code = airportCode.toUpperCase().trim();
  return WORLD_CUP_2026_AIRPORT_CODES.some(
    hostCode => code.includes(hostCode) || hostCode.includes(code)
  );
}

/**
 * Get World Cup host city information from an airport code
 * @param airportCode - The IATA airport code
 * @returns WorldCupCity object if found, undefined otherwise
 */
export function getWorldCupCityInfo(airportCode: string): WorldCupCity | undefined {
  const code = airportCode.toUpperCase().trim();
  return WORLD_CUP_2026_HOST_CITIES.find(city =>
    city.airportCodes.some(hostCode =>
      code.includes(hostCode) || hostCode.includes(code)
    )
  );
}

/**
 * World Cup 2026 tournament dates
 */
export const WORLD_CUP_2026_DATES = {
  start: '2026-06-11',
  end: '2026-07-19',
  startFormatted: 'June 11, 2026',
  endFormatted: 'July 19, 2026',
  duration: '39 days',
};

/**
 * Get formatted location string for World Cup banner
 * @param lang - Language code
 * @returns Formatted string with host countries
 */
export function getWorldCupLocationString(lang: 'en' | 'pt' | 'es' = 'en'): string {
  const locations = {
    en: 'USA • Canada • Mexico | June 11 - July 19, 2026',
    pt: 'EUA • Canadá • México | 11 jun - 19 jul, 2026',
    es: 'EE.UU. • Canadá • México | 11 jun - 19 jul, 2026',
  };
  return locations[lang];
}
