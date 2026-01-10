/**
 * City/Airport to Geocode Mapping
 * Based on LOCATION_DATA_STRATEGY.md
 */

export interface GeoCode {
  latitude: number;
  longitude: number;
}

export const GEOCODE_MAP: Record<string, GeoCode> = {
  // USA - Major Cities
  'ATL': { latitude: 33.7490, longitude: -84.3880 }, // Atlanta
  'ORD': { latitude: 41.9742, longitude: -87.9073 }, // Chicago
  'DFW': { latitude: 32.8998, longitude: -97.0403 }, // Dallas
  'DEN': { latitude: 39.7392, longitude: -104.9903 }, // Denver
  'DTW': { latitude: 42.3314, longitude: -83.0458 }, // Detroit
  'IAH': { latitude: 29.9902, longitude: -95.3368 }, // Houston
  'LAS': { latitude: 36.1699, longitude: -115.1398 }, // Las Vegas
  'LAX': { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
  'MIA': { latitude: 25.7617, longitude: -80.1918 }, // Miami
  'MSP': { latitude: 44.9778, longitude: -93.2650 }, // Minneapolis
  'EWR': { latitude: 40.7357, longitude: -74.1724 }, // Newark
  'JFK': { latitude: 40.6413, longitude: -73.7781 }, // New York (JFK)
  'NYC': { latitude: 40.7128, longitude: -74.0060 }, // New York
  'MCO': { latitude: 28.4294, longitude: -81.3089 }, // Orlando
  'PHX': { latitude: 33.4484, longitude: -112.0740 }, // Phoenix
  'PDX': { latitude: 45.5051, longitude: -122.6750 }, // Portland
  'SLC': { latitude: 40.7899, longitude: -111.9791 }, // Salt Lake City
  'SAN': { latitude: 32.7157, longitude: -117.1611 }, // San Diego
  'SFO': { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
  'SEA': { latitude: 47.6062, longitude: -122.3321 }, // Seattle
  'IAD': { latitude: 38.9531, longitude: -77.4565 }, // Washington DC
  'BOS': { latitude: 42.3656, longitude: -71.0096 }, // Boston
  'PHL': { latitude: 39.9526, longitude: -75.1652 }, // Philadelphia
  'MSY': { latitude: 29.9511, longitude: -90.0715 }, // New Orleans
  'BNA': { latitude: 36.1627, longitude: -86.7816 }, // Nashville
  'AUS': { latitude: 30.2672, longitude: -97.7431 }, // Austin

  // Mexico & Caribbean
  'CUN': { latitude: 21.1619, longitude: -86.8515 }, // Cancun
  'MEX': { latitude: 19.4326, longitude: -99.1332 }, // Mexico City
  'GDL': { latitude: 20.6737, longitude: -103.4054 }, // Guadalajara
  'PVR': { latitude: 20.6534, longitude: -105.2253 }, // Puerto Vallarta
  'CZM': { latitude: 20.5223, longitude: -86.9252 }, // Cozumel
  'SJD': { latitude: 23.1645, longitude: -109.7095 }, // Los Cabos
  'NAS': { latitude: 25.0443, longitude: -77.3504 }, // Nassau
  'MBJ': { latitude: 18.5037, longitude: -77.9133 }, // Montego Bay
  'PUJ': { latitude: 18.5674, longitude: -68.3676 }, // Punta Cana

  // Central America
  'SJO': { latitude: 9.9333, longitude: -84.0833 }, // San José, Costa Rica
  'LIR': { latitude: 10.5931, longitude: -85.5444 }, // Liberia
  'XQP': { latitude: 9.3833, longitude: -84.1500 }, // Manuel Antonio
  'GUA': { latitude: 14.5833, longitude: -90.5167 }, // Guatemala City
  'FRS': { latitude: 16.9167, longitude: -89.8833 }, // Flores
  'ANTIGUA': { latitude: 14.5611, longitude: -90.7344 }, // Antigua
  'SAP': { latitude: 15.4528, longitude: -87.9236 }, // San Pedro Sula
  'TGU': { latitude: 14.0608, longitude: -87.2072 }, // Tegucigalpa
  'RTB': { latitude: 16.3290, longitude: -86.5500 }, // Roatán
  'SAL': { latitude: 13.4408, longitude: -89.0556 }, // San Salvador
  'MGA': { latitude: 12.1411, longitude: -86.2681 }, // Managua
  'GRANADA': { latitude: 11.9342, longitude: -85.9560 }, // Granada
  'PTY': { latitude: 8.9833, longitude: -79.5167 }, // Panama City
  'BOC': { latitude: 9.3333, longitude: -82.2500 }, // Bocas del Toro
  'DAV': { latitude: 8.3833, longitude: -82.4333 }, // David
  'BZE': { latitude: 17.5389, longitude: -88.3081 }, // Belize City

  // Europe
  'CDG': { latitude: 48.8566, longitude: 2.3522 }, // Paris
  'PAR': { latitude: 48.8566, longitude: 2.3522 }, // Paris
  'LHR': { latitude: 51.4700, longitude: -0.4543 }, // London
  'LON': { latitude: 51.5074, longitude: -0.1278 }, // London
  'BCN': { latitude: 41.3874, longitude: 2.1686 }, // Barcelona
  'MAD': { latitude: 40.4168, longitude: -3.7038 }, // Madrid
  'ROM': { latitude: 41.9028, longitude: 12.4964 }, // Rome
  'FCO': { latitude: 41.8003, longitude: 12.2389 }, // Rome
  'AMS': { latitude: 52.3676, longitude: 4.9041 }, // Amsterdam
  'FRA': { latitude: 50.1109, longitude: 8.6821 }, // Frankfurt
  'MUC': { latitude: 48.1351, longitude: 11.5820 }, // Munich
  'VIE': { latitude: 48.2082, longitude: 16.3738 }, // Vienna
  'PRG': { latitude: 50.0755, longitude: 14.4378 }, // Prague
  'LIS': { latitude: 38.7223, longitude: -9.1393 }, // Lisbon
  'ATH': { latitude: 37.9838, longitude: 23.7275 }, // Athens
  'IST': { latitude: 41.0082, longitude: 28.9784 }, // Istanbul

  // Asia Pacific
  'DXB': { latitude: 25.2532, longitude: 55.3657 }, // Dubai
  'SIN': { latitude: 1.3521, longitude: 103.8198 }, // Singapore
  'NRT': { latitude: 35.7720, longitude: 140.3929 }, // Tokyo
  'TYO': { latitude: 35.6895, longitude: 139.6917 }, // Tokyo
  'HND': { latitude: 35.5494, longitude: 139.7798 }, // Tokyo Haneda
  'HKG': { latitude: 22.3193, longitude: 114.1694 }, // Hong Kong
  'ICN': { latitude: 37.4602, longitude: 126.4407 }, // Seoul
  'BKK': { latitude: 13.7563, longitude: 100.5018 }, // Bangkok
  'SYD': { latitude: -33.8688, longitude: 151.2093 }, // Sydney
  'MEL': { latitude: -37.8136, longitude: 144.9631 }, // Melbourne
  'BNE': { latitude: -27.4698, longitude: 153.0251 }, // Brisbane
  'PER': { latitude: -31.9505, longitude: 115.8605 }, // Perth
  'AKL': { latitude: -36.8485, longitude: 174.7633 }, // Auckland
  'DEL': { latitude: 28.5562, longitude: 77.1000 }, // Delhi
  'BOM': { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
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
    // USA
    'ATLANTA': 'ATL',
    'CHICAGO': 'ORD',
    'DALLAS': 'DFW',
    'DENVER': 'DEN',
    'DETROIT': 'DTW',
    'HOUSTON': 'IAH',
    'LAS VEGAS': 'LAS',
    'LASVEGAS': 'LAS',
    'VEGAS': 'LAS',
    'LOS ANGELES': 'LAX',
    'LOSANGELES': 'LAX',
    'LA': 'LAX',
    'MIAMI': 'MIA',
    'MINNEAPOLIS': 'MSP',
    'NEWARK': 'EWR',
    'NEW YORK': 'NYC',
    'NEWYORK': 'NYC',
    'ORLANDO': 'MCO',
    'PHOENIX': 'PHX',
    'PORTLAND': 'PDX',
    'SALT LAKE CITY': 'SLC',
    'SAN DIEGO': 'SAN',
    'SANDIEGO': 'SAN',
    'SAN FRANCISCO': 'SFO',
    'SANFRANCISCO': 'SFO',
    'SF': 'SFO',
    'SEATTLE': 'SEA',
    'WASHINGTON': 'IAD',
    'WASHINGTON DC': 'IAD',
    'DC': 'IAD',
    'BOSTON': 'BOS',
    'PHILADELPHIA': 'PHL',
    'PHILLY': 'PHL',
    'NEW ORLEANS': 'MSY',
    'NEWORLEANS': 'MSY',
    'NASHVILLE': 'BNA',
    'AUSTIN': 'AUS',
    // Mexico & Caribbean
    'CANCUN': 'CUN',
    'CANCÚN': 'CUN',
    'MEXICO CITY': 'MEX',
    'MEXICOCITY': 'MEX',
    'GUADALAJARA': 'GDL',
    'PUERTO VALLARTA': 'PVR',
    'PUERTOVALLARTA': 'PVR',
    'COZUMEL': 'CZM',
    'LOS CABOS': 'SJD',
    'CABO': 'SJD',
    'NASSAU': 'NAS',
    'MONTEGO BAY': 'MBJ',
    'PUNTA CANA': 'PUJ',
    'PUNTACANA': 'PUJ',
    // Central America
    'SAN JOSE': 'SJO',
    'SAN JOSÉ': 'SJO',
    'SANJOSE': 'SJO',
    'LIBERIA': 'LIR',
    'GUATEMALA': 'GUA',
    'GUATEMALA CITY': 'GUA',
    'ROATAN': 'RTB',
    'ROATÁN': 'RTB',
    'MANAGUA': 'MGA',
    'PANAMA CITY': 'PTY',
    'BOCAS': 'BOC',
    'BOCAS DEL TORO': 'BOC',
    'BELIZE': 'BZE',
    'BELIZE CITY': 'BZE',
    // Europe
    'PARIS': 'PAR',
    'LONDON': 'LON',
    'BARCELONA': 'BCN',
    'MADRID': 'MAD',
    'ROME': 'ROM',
    'AMSTERDAM': 'AMS',
    'FRANKFURT': 'FRA',
    'MUNICH': 'MUC',
    'VIENNA': 'VIE',
    'PRAGUE': 'PRG',
    'LISBON': 'LIS',
    'ATHENS': 'ATH',
    'ISTANBUL': 'IST',
    // Asia Pacific
    'DUBAI': 'DXB',
    'SINGAPORE': 'SIN',
    'TOKYO': 'TYO',
    'HONG KONG': 'HKG',
    'HONGKONG': 'HKG',
    'SEOUL': 'ICN',
    'BANGKOK': 'BKK',
    'SYDNEY': 'SYD',
    'MELBOURNE': 'MEL',
    'BRISBANE': 'BNE',
    'PERTH': 'PER',
    'AUCKLAND': 'AKL',
    'DELHI': 'DEL',
    'MUMBAI': 'BOM',
  };

  const code = cityMap[normalized];
  if (code && GEOCODE_MAP[code]) {
    return GEOCODE_MAP[code];
  }

  return null;
}

/**
 * Get geocode with fallback to default coordinates
 * IMPORTANT: Logs warning when destination not found
 */
export function getGeocodeWithFallback(location: string, fallback?: GeoCode): GeoCode {
  const geocode = getGeocode(location);
  if (geocode) return geocode;

  if (fallback) {
    console.warn(`⚠️ Geocode not found for "${location}" - using provided fallback`);
    return fallback;
  }

  // CRITICAL WARNING: Using default fallback means incorrect results
  console.error(`❌ GEOCODE NOT FOUND: "${location}" - defaulting to San José, Costa Rica`);
  console.error(`   This will return WRONG activities/tours! Add this city to GEOCODE_MAP.`);

  // Default to San José, Costa Rica
  return { latitude: 9.9333, longitude: -84.0833 };
}
