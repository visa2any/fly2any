/**
 * City/Airport to Geocode Mapping
 * Based on LOCATION_DATA_STRATEGY.md
 */

export interface GeoCode {
  latitude: number;
  longitude: number;
}

export const GEOCODE_MAP: Record<string, GeoCode> = {
  // Central America - Costa Rica
  'SJO': { latitude: 9.9333, longitude: -84.0833 }, // San José
  'LIR': { latitude: 10.5931, longitude: -85.5444 }, // Liberia
  'XQP': { latitude: 9.3833, longitude: -84.1500 }, // Manuel Antonio

  // Central America - Guatemala
  'GUA': { latitude: 14.5833, longitude: -90.5167 }, // Guatemala City
  'FRS': { latitude: 16.9167, longitude: -89.8833 }, // Flores
  'ANTIGUA': { latitude: 14.5611, longitude: -90.7344 }, // Antigua

  // Central America - Honduras
  'SAP': { latitude: 15.4528, longitude: -87.9236 }, // San Pedro Sula
  'TGU': { latitude: 14.0608, longitude: -87.2072 }, // Tegucigalpa
  'RTB': { latitude: 16.3290, longitude: -86.5500 }, // Roatán

  // Central America - El Salvador
  'SAL': { latitude: 13.4408, longitude: -89.0556 }, // San Salvador

  // Central America - Nicaragua
  'MGA': { latitude: 12.1411, longitude: -86.2681 }, // Managua
  'GRANADA': { latitude: 11.9342, longitude: -85.9560 }, // Granada

  // Central America - Panama
  'PTY': { latitude: 8.9833, longitude: -79.5167 }, // Panama City
  'BOC': { latitude: 9.3333, longitude: -82.2500 }, // Bocas del Toro
  'DAV': { latitude: 8.3833, longitude: -82.4333 }, // David

  // Central America - Belize
  'BZE': { latitude: 17.5389, longitude: -88.3081 }, // Belize City

  // Popular International Cities
  'CDG': { latitude: 48.8566, longitude: 2.3522 }, // Paris
  'PAR': { latitude: 48.8566, longitude: 2.3522 }, // Paris
  'NYC': { latitude: 40.7128, longitude: -74.0060 }, // New York
  'JFK': { latitude: 40.6413, longitude: -73.7781 }, // New York (JFK)
  'LAX': { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
  'MIA': { latitude: 25.7617, longitude: -80.1918 }, // Miami
  'LHR': { latitude: 51.4700, longitude: -0.4543 }, // London
  'LON': { latitude: 51.5074, longitude: -0.1278 }, // London
  'NRT': { latitude: 35.7720, longitude: 140.3929 }, // Tokyo
  'TYO': { latitude: 35.6895, longitude: 139.6917 }, // Tokyo
  'BCN': { latitude: 41.3874, longitude: 2.1686 }, // Barcelona
  'MAD': { latitude: 40.4168, longitude: -3.7038 }, // Madrid
  'ROM': { latitude: 41.9028, longitude: 12.4964 }, // Rome
  'FCO': { latitude: 41.8003, longitude: 12.2389 }, // Rome
  'DXB': { latitude: 25.2532, longitude: 55.3657 }, // Dubai
  'SIN': { latitude: 1.3521, longitude: 103.8198 }, // Singapore
  'SYD': { latitude: -33.8688, longitude: 151.2093 }, // Sydney
  'MEL': { latitude: -37.8136, longitude: 144.9631 }, // Melbourne
  'CUN': { latitude: 21.1619, longitude: -86.8515 }, // Cancun
};

/**
 * Get geocode from city code, airport code, or city name
 */
export function getGeocode(location: string): GeoCode | null {
  // Normalize input (uppercase, remove spaces)
  const normalized = location.toUpperCase().trim();

  // Direct lookup
  if (GEOCODE_MAP[normalized]) {
    return GEOCODE_MAP[normalized];
  }

  // Try without spaces
  const withoutSpaces = normalized.replace(/\s+/g, '');
  if (GEOCODE_MAP[withoutSpaces]) {
    return GEOCODE_MAP[withoutSpaces];
  }

  // City name lookups
  const cityMap: Record<string, string> = {
    'SAN JOSE': 'SJO',
    'SAN JOSÉ': 'SJO',
    'SANJOSE': 'SJO',
    'GUATEMALA': 'GUA',
    'GUATEMALA CITY': 'GUA',
    'ROATAN': 'RTB',
    'ROATÁN': 'RTB',
    'MANAGUA': 'MGA',
    'PANAMA CITY': 'PTY',
    'BOCAS': 'BOC',
    'BOCAS DEL TORO': 'BOC',
    'BELIZE CITY': 'BZE',
    'PARIS': 'PAR',
    'NEW YORK': 'NYC',
    'NEWYORK': 'NYC',
    'LOS ANGELES': 'LAX',
    'LOSANGELES': 'LAX',
    'MIAMI': 'MIA',
    'LONDON': 'LON',
    'TOKYO': 'TYO',
    'BARCELONA': 'BCN',
    'MADRID': 'MAD',
    'ROME': 'ROM',
    'DUBAI': 'DXB',
    'SINGAPORE': 'SIN',
    'SYDNEY': 'SYD',
    'MELBOURNE': 'MEL',
    'CANCUN': 'CUN',
    'CANCÚN': 'CUN',
  };

  const code = cityMap[normalized];
  if (code && GEOCODE_MAP[code]) {
    return GEOCODE_MAP[code];
  }

  return null;
}

/**
 * Get geocode with fallback to default coordinates
 */
export function getGeocodeWithFallback(location: string, fallback?: GeoCode): GeoCode {
  const geocode = getGeocode(location);
  if (geocode) return geocode;

  if (fallback) return fallback;

  // Default to San José, Costa Rica (popular Central America destination)
  return { latitude: 9.9333, longitude: -84.0833 };
}
