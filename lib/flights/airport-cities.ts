/**
 * Airport code to city name mapping for major airports
 * Used to display user-friendly "City (CODE)" format instead of just codes
 */

export const AIRPORT_CITIES: Record<string, string> = {
  // United States - Major Hubs
  'JFK': 'New York',
  'LGA': 'New York',
  'EWR': 'Newark',
  'LAX': 'Los Angeles',
  'SFO': 'San Francisco',
  'ORD': 'Chicago',
  'MIA': 'Miami',
  'DFW': 'Dallas',
  'ATL': 'Atlanta',
  'BOS': 'Boston',
  'SEA': 'Seattle',
  'LAS': 'Las Vegas',
  'PHX': 'Phoenix',
  'DEN': 'Denver',
  'IAH': 'Houston',
  'MCO': 'Orlando',
  'CLT': 'Charlotte',
  'MSP': 'Minneapolis',
  'DTW': 'Detroit',
  'PHL': 'Philadelphia',
  'BWI': 'Baltimore',
  'DCA': 'Washington DC',
  'IAD': 'Washington DC',
  'SAN': 'San Diego',
  'TPA': 'Tampa',
  'PDX': 'Portland',
  'HNL': 'Honolulu',

  // Canada
  'YYZ': 'Toronto',
  'YVR': 'Vancouver',
  'YUL': 'Montreal',
  'YYC': 'Calgary',

  // Mexico & Latin America
  'MEX': 'Mexico City',
  'GRU': 'São Paulo',
  'GIG': 'Rio de Janeiro',
  'BOG': 'Bogotá',
  'LIM': 'Lima',
  'SCL': 'Santiago',
  'EZE': 'Buenos Aires',
  'CUN': 'Cancún',
  'GDL': 'Guadalajara',
  'PTY': 'Panama City',

  // Europe - Major Hubs
  'LHR': 'London',
  'LGW': 'London',
  'CDG': 'Paris',
  'ORY': 'Paris',
  'FRA': 'Frankfurt',
  'AMS': 'Amsterdam',
  'MAD': 'Madrid',
  'BCN': 'Barcelona',
  'FCO': 'Rome',
  'MXP': 'Milan',
  'VCE': 'Venice',
  'MUC': 'Munich',
  'ZRH': 'Zurich',
  'VIE': 'Vienna',
  'BRU': 'Brussels',
  'CPH': 'Copenhagen',
  'ARN': 'Stockholm',
  'OSL': 'Oslo',
  'HEL': 'Helsinki',
  'DUB': 'Dublin',
  'LIS': 'Lisbon',
  'ATH': 'Athens',
  'IST': 'Istanbul',
  'PRG': 'Prague',
  'WAW': 'Warsaw',
  'BUD': 'Budapest',

  // Middle East
  'DXB': 'Dubai',
  'DWC': 'Dubai',
  'AUH': 'Abu Dhabi',
  'DOH': 'Doha',
  'CAI': 'Cairo',
  'TLV': 'Tel Aviv',
  'AMM': 'Amman',
  'RUH': 'Riyadh',
  'JED': 'Jeddah',
  'MCT': 'Muscat',
  'BAH': 'Bahrain',
  'KWI': 'Kuwait City',

  // Asia-Pacific
  'HKG': 'Hong Kong',
  'SIN': 'Singapore',
  'NRT': 'Tokyo',
  'HND': 'Tokyo',
  'ICN': 'Seoul',
  'PEK': 'Beijing',
  'PVG': 'Shanghai',
  'BKK': 'Bangkok',
  'KUL': 'Kuala Lumpur',
  'MNL': 'Manila',
  'TPE': 'Taipei',
  'DEL': 'New Delhi',
  'BOM': 'Mumbai',
  'BLR': 'Bangalore',
  'SYD': 'Sydney',
  'MEL': 'Melbourne',
  'BNE': 'Brisbane',
  'AKL': 'Auckland',
  'CGK': 'Jakarta',
  'HAN': 'Hanoi',
  'SGN': 'Ho Chi Minh City',

  // Africa
  'JNB': 'Johannesburg',
  'CPT': 'Cape Town',
  'NBO': 'Nairobi',
  'ADD': 'Addis Ababa',
  'LOS': 'Lagos',
  'ACC': 'Accra',
  'CMN': 'Casablanca',
  'TUN': 'Tunis',
  'ALG': 'Algiers',
};

/**
 * Get formatted airport display with city name
 * @param code - IATA airport code
 * @returns "City (CODE)" or just "CODE" if city unknown
 */
export function getAirportDisplay(code: string): string {
  const city = AIRPORT_CITIES[code];
  return city ? `${city} (${code})` : code;
}

/**
 * Get just the city name for an airport code
 * @param code - IATA airport code
 * @returns City name or the code if unknown
 */
export function getAirportCity(code: string): string {
  return AIRPORT_CITIES[code] || code;
}
