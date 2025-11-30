/**
 * City Location Data
 * Contains city centers, airports, and popular districts for location-based features
 */

export interface CityLocation {
  center: { lat: number; lng: number };
  airport: { code: string; lat: number; lng: number; name: string };
  popularDistricts: string[];
}

export const cityLocations: Record<string, CityLocation> = {
  // Middle East
  'dubai': {
    center: { lat: 25.2048, lng: 55.2708 },
    airport: { code: 'DXB', lat: 25.2532, lng: 55.3657, name: 'Dubai International' },
    popularDistricts: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Deira', 'Bur Dubai', 'JBR', 'Business Bay', 'Jumeirah']
  },
  'abu dhabi': {
    center: { lat: 24.4539, lng: 54.3773 },
    airport: { code: 'AUH', lat: 24.4330, lng: 54.6511, name: 'Abu Dhabi International' },
    popularDistricts: ['Corniche', 'Al Maryah Island', 'Yas Island', 'Saadiyat Island', 'Al Reem Island']
  },

  // Brazil
  'sao paulo': {
    center: { lat: -23.5505, lng: -46.6333 },
    airport: { code: 'GRU', lat: -23.4356, lng: -46.4731, name: 'Guarulhos International' },
    popularDistricts: ['Paulista', 'Itaim Bibi', 'Vila Madalena', 'Pinheiros', 'Jardins', 'Faria Lima', 'Centro', 'Moema', 'Vila Olímpia']
  },
  'rio de janeiro': {
    center: { lat: -22.9068, lng: -43.1729 },
    airport: { code: 'GIG', lat: -22.8090, lng: -43.2506, name: 'Galeão International' },
    popularDistricts: ['Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Botafogo', 'Centro', 'Santa Teresa', 'Lapa']
  },

  // Europe
  'paris': {
    center: { lat: 48.8566, lng: 2.3522 },
    airport: { code: 'CDG', lat: 49.0097, lng: 2.5479, name: 'Charles de Gaulle' },
    popularDistricts: ['Champs-Élysées', 'Le Marais', 'Montmartre', 'Saint-Germain', 'Latin Quarter', 'Opera', 'Louvre', 'Eiffel Tower']
  },
  'london': {
    center: { lat: 51.5074, lng: -0.1278 },
    airport: { code: 'LHR', lat: 51.4700, lng: -0.4543, name: 'Heathrow' },
    popularDistricts: ['Westminster', 'Kensington', 'Covent Garden', 'Soho', 'South Bank', 'Shoreditch', 'Mayfair', 'Camden']
  },
  'barcelona': {
    center: { lat: 41.3851, lng: 2.1734 },
    airport: { code: 'BCN', lat: 41.2971, lng: 2.0785, name: 'El Prat' },
    popularDistricts: ['Gothic Quarter', 'Eixample', 'La Rambla', 'Barceloneta', 'Gràcia', 'El Born', 'Sagrada Familia']
  },
  'rome': {
    center: { lat: 41.9028, lng: 12.4964 },
    airport: { code: 'FCO', lat: 41.8003, lng: 12.2389, name: 'Fiumicino' },
    popularDistricts: ['Centro Storico', 'Trastevere', 'Vatican', 'Colosseum', 'Termini', 'Spanish Steps', 'Pantheon']
  },
  'madrid': {
    center: { lat: 40.4168, lng: -3.7038 },
    airport: { code: 'MAD', lat: 40.4983, lng: -3.5676, name: 'Barajas' },
    popularDistricts: ['Sol', 'Gran Via', 'Salamanca', 'Malasaña', 'La Latina', 'Chueca', 'Retiro', 'Chamberí']
  },
  'amsterdam': {
    center: { lat: 52.3676, lng: 4.9041 },
    airport: { code: 'AMS', lat: 52.3105, lng: 4.7683, name: 'Schiphol' },
    popularDistricts: ['Centrum', 'Jordaan', 'De Pijp', 'Museum Quarter', 'Oud-West', 'Oost', 'Noord']
  },
  'lisbon': {
    center: { lat: 38.7223, lng: -9.1393 },
    airport: { code: 'LIS', lat: 38.7756, lng: -9.1354, name: 'Humberto Delgado' },
    popularDistricts: ['Baixa', 'Alfama', 'Bairro Alto', 'Chiado', 'Belém', 'Príncipe Real', 'Santos']
  },
  'berlin': {
    center: { lat: 52.5200, lng: 13.4050 },
    airport: { code: 'BER', lat: 52.3667, lng: 13.5033, name: 'Brandenburg' },
    popularDistricts: ['Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Friedrichshain', 'Charlottenburg', 'Neukölln']
  },

  // Americas
  'new york': {
    center: { lat: 40.7128, lng: -74.0060 },
    airport: { code: 'JFK', lat: 40.6413, lng: -73.7781, name: 'JFK International' },
    popularDistricts: ['Manhattan', 'Times Square', 'Midtown', 'SoHo', 'Brooklyn', 'Chelsea', 'Upper East Side', 'Financial District']
  },
  'los angeles': {
    center: { lat: 34.0522, lng: -118.2437 },
    airport: { code: 'LAX', lat: 33.9425, lng: -118.4081, name: 'LAX' },
    popularDistricts: ['Hollywood', 'Santa Monica', 'Beverly Hills', 'Downtown', 'Venice Beach', 'West Hollywood', 'Malibu']
  },
  'miami': {
    center: { lat: 25.7617, lng: -80.1918 },
    airport: { code: 'MIA', lat: 25.7959, lng: -80.2870, name: 'Miami International' },
    popularDistricts: ['South Beach', 'Downtown', 'Brickell', 'Wynwood', 'Coconut Grove', 'Coral Gables', 'Miami Beach']
  },
  'cancun': {
    center: { lat: 21.1619, lng: -86.8515 },
    airport: { code: 'CUN', lat: 21.0365, lng: -86.8771, name: 'Cancún International' },
    popularDistricts: ['Hotel Zone', 'Downtown', 'Puerto Juárez', 'Playa Delfines', 'Punta Cancún']
  },
  'mexico city': {
    center: { lat: 19.4326, lng: -99.1332 },
    airport: { code: 'MEX', lat: 19.4361, lng: -99.0719, name: 'Benito Juárez' },
    popularDistricts: ['Roma', 'Condesa', 'Polanco', 'Centro Histórico', 'Coyoacán', 'Zona Rosa', 'Santa Fe']
  },
  'buenos aires': {
    center: { lat: -34.6037, lng: -58.3816 },
    airport: { code: 'EZE', lat: -34.8222, lng: -58.5358, name: 'Ezeiza' },
    popularDistricts: ['Palermo', 'Recoleta', 'San Telmo', 'Puerto Madero', 'La Boca', 'Belgrano', 'Microcentro']
  },

  // Asia
  'tokyo': {
    center: { lat: 35.6762, lng: 139.6503 },
    airport: { code: 'NRT', lat: 35.7720, lng: 140.3929, name: 'Narita' },
    popularDistricts: ['Shinjuku', 'Shibuya', 'Ginza', 'Asakusa', 'Roppongi', 'Akihabara', 'Harajuku', 'Odaiba']
  },
  'singapore': {
    center: { lat: 1.3521, lng: 103.8198 },
    airport: { code: 'SIN', lat: 1.3644, lng: 103.9915, name: 'Changi' },
    popularDistricts: ['Marina Bay', 'Orchard', 'Chinatown', 'Little India', 'Sentosa', 'Clarke Quay', 'Bugis']
  },
  'bangkok': {
    center: { lat: 13.7563, lng: 100.5018 },
    airport: { code: 'BKK', lat: 13.6900, lng: 100.7501, name: 'Suvarnabhumi' },
    popularDistricts: ['Sukhumvit', 'Silom', 'Siam', 'Khao San', 'Riverside', 'Sathorn', 'Chatuchak']
  },
  'hong kong': {
    center: { lat: 22.3193, lng: 114.1694 },
    airport: { code: 'HKG', lat: 22.3080, lng: 113.9185, name: 'Hong Kong International' },
    popularDistricts: ['Central', 'Tsim Sha Tsui', 'Causeway Bay', 'Wan Chai', 'Mongkok', 'Lan Kwai Fong']
  },
  'bali': {
    center: { lat: -8.4095, lng: 115.1889 },
    airport: { code: 'DPS', lat: -8.7482, lng: 115.1672, name: 'Ngurah Rai' },
    popularDistricts: ['Seminyak', 'Kuta', 'Ubud', 'Canggu', 'Nusa Dua', 'Sanur', 'Jimbaran', 'Uluwatu']
  },

  // Australia & Oceania
  'sydney': {
    center: { lat: -33.8688, lng: 151.2093 },
    airport: { code: 'SYD', lat: -33.9399, lng: 151.1753, name: 'Kingsford Smith' },
    popularDistricts: ['CBD', 'Darling Harbour', 'Circular Quay', 'Bondi', 'Surry Hills', 'Manly', 'The Rocks']
  },

  // Africa
  'cape town': {
    center: { lat: -33.9249, lng: 18.4241 },
    airport: { code: 'CPT', lat: -33.9649, lng: 18.6017, name: 'Cape Town International' },
    popularDistricts: ['V&A Waterfront', 'City Bowl', 'Camps Bay', 'Sea Point', 'Green Point', 'De Waterkant']
  },
  'marrakech': {
    center: { lat: 31.6295, lng: -7.9811 },
    airport: { code: 'RAK', lat: 31.6069, lng: -8.0363, name: 'Menara' },
    popularDistricts: ['Medina', 'Gueliz', 'Hivernage', 'Palmeraie', 'Kasbah']
  }
};

/**
 * Get city data by name (case-insensitive, fuzzy match)
 */
export function getCityData(cityName: string): CityLocation | null {
  if (!cityName) return null;

  const normalized = cityName.toLowerCase().trim();

  // Direct match
  if (cityLocations[normalized]) {
    return cityLocations[normalized];
  }

  // Fuzzy match (contains)
  for (const [key, data] of Object.entries(cityLocations)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return data;
    }
  }

  return null;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Estimate drive time based on distance (rough estimate)
 */
export function estimateDriveTime(km: number): string {
  // Assume average speed of 30 km/h in urban areas
  const minutes = Math.round((km / 30) * 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
}

/**
 * Parse address to extract district/neighborhood
 */
export function extractDistrict(address: string, city: string): string | null {
  if (!address) return null;

  // Remove city name from address
  const cityLower = city.toLowerCase();
  let cleanAddress = address;

  // Common patterns to extract district
  // Pattern: "District Name, City" or "Street, District, City"
  const parts = address.split(',').map(p => p.trim());

  // Try to find a meaningful district name (not street number, not city, not country)
  for (const part of parts) {
    const partLower = part.toLowerCase();

    // Skip if it's the city name
    if (partLower.includes(cityLower) || cityLower.includes(partLower)) continue;

    // Skip if it looks like a street number or postal code
    if (/^\d+/.test(part) || /^\d{4,}/.test(part)) continue;

    // Skip if it's a country
    const countries = ['brazil', 'uae', 'united arab emirates', 'france', 'uk', 'usa', 'spain', 'italy', 'germany'];
    if (countries.some(c => partLower.includes(c))) continue;

    // This is likely the district
    if (part.length > 2 && part.length < 50) {
      return part;
    }
  }

  return null;
}

/**
 * Get location context for a hotel
 */
export function getHotelLocationContext(
  hotelLat: number,
  hotelLng: number,
  cityName: string,
  hotelAddress?: string
): {
  district: string | null;
  distanceToCenter: string;
  distanceToAirport: string;
  driveTimeToAirport: string;
  airportCode: string;
} | null {
  const cityData = getCityData(cityName);

  if (!cityData) {
    return null;
  }

  const distToCenter = calculateDistance(hotelLat, hotelLng, cityData.center.lat, cityData.center.lng);
  const distToAirport = calculateDistance(hotelLat, hotelLng, cityData.airport.lat, cityData.airport.lng);

  return {
    district: hotelAddress ? extractDistrict(hotelAddress, cityName) : null,
    distanceToCenter: formatDistance(distToCenter),
    distanceToAirport: formatDistance(distToAirport),
    driveTimeToAirport: estimateDriveTime(distToAirport),
    airportCode: cityData.airport.code
  };
}
