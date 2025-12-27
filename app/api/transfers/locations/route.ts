import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { getCoverageLevel, COVERAGE_STATS } from '@/lib/api/coverage';
import { amadeus } from '@/lib/api/amadeus';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Search Amadeus for REAL airports/cities (transfers can go anywhere they service)
 */
async function searchAmadeusTransferLocations(query: string, limit = 15) {
  try {
    console.log(`🔍 Amadeus transfer locations: "${query}"`);
    const response = await amadeus.searchAirports(query);

    if (!response?.data?.length) return [];

    return response.data.slice(0, limit).map((loc: any) => ({
      id: `amadeus-${loc.iataCode || loc.id}`,
      code: loc.iataCode || '',
      name: loc.name || loc.detailedName || '',
      displayName: loc.iataCode
        ? `${loc.name} (${loc.iataCode})`
        : `${loc.name}, ${loc.address?.countryName || ''}`,
      city: loc.address?.cityName || loc.name || '',
      country: loc.address?.countryName || '',
      countryCode: loc.address?.countryCode || '',
      latitude: loc.geoCode?.latitude || 0,
      longitude: loc.geoCode?.longitude || 0,
      type: loc.subType === 'AIRPORT' ? 'airport' : 'city',
      emoji: loc.subType === 'AIRPORT' ? '✈️' : '🏙️',
      coverage: 'high', // Amadeus only returns locations with coverage
      source: 'Amadeus',
    }));
  } catch (err: any) {
    console.error('Amadeus transfer locations error:', err.message);
    return [];
  }
}

// Comprehensive airports database for transfers
const AIRPORTS = [
  // USA Major Airports
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.6413, lng: -73.7781, emoji: '✈️' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7769, lng: -73.8740, emoji: '✈️' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States', countryCode: 'US', lat: 40.6895, lng: -74.1745, emoji: '✈️' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 33.9425, lng: -118.4081, emoji: '✈️' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.6213, lng: -122.3790, emoji: '✈️' },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.9742, lng: -87.9073, emoji: '✈️' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', countryCode: 'US', lat: 25.7959, lng: -80.2870, emoji: '✈️' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', country: 'United States', countryCode: 'US', lat: 26.0742, lng: -80.1506, emoji: '✈️' },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States', countryCode: 'US', lat: 36.0840, lng: -115.1537, emoji: '✈️' },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', countryCode: 'US', lat: 47.4502, lng: -122.3088, emoji: '✈️' },
  { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', country: 'United States', countryCode: 'US', lat: 42.3656, lng: -71.0096, emoji: '✈️' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', countryCode: 'US', lat: 32.8998, lng: -97.0403, emoji: '✈️' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', countryCode: 'US', lat: 39.8561, lng: -104.6737, emoji: '✈️' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', countryCode: 'US', lat: 33.6407, lng: -84.4277, emoji: '✈️' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', countryCode: 'US', lat: 33.4373, lng: -112.0078, emoji: '✈️' },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', countryCode: 'US', lat: 28.4312, lng: -81.3081, emoji: '✈️' },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', countryCode: 'US', lat: 29.9902, lng: -95.3368, emoji: '✈️' },
  { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', country: 'United States', countryCode: 'US', lat: 44.8848, lng: -93.2223, emoji: '✈️' },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'United States', countryCode: 'US', lat: 32.7336, lng: -117.1897, emoji: '✈️' },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', country: 'United States', countryCode: 'US', lat: 38.8512, lng: -77.0402, emoji: '✈️' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', country: 'United States', countryCode: 'US', lat: 38.9531, lng: -77.4565, emoji: '✈️' },
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'United States', countryCode: 'US', lat: 21.3245, lng: -157.9251, emoji: '✈️' },

  // Europe Major Airports
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.4700, lng: -0.4543, emoji: '✈️' },
  { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.1537, lng: -0.1821, emoji: '✈️' },
  { code: 'STN', name: 'London Stansted Airport', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.8860, lng: 0.2389, emoji: '✈️' },
  { code: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', countryCode: 'FR', lat: 49.0097, lng: 2.5479, emoji: '✈️' },
  { code: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.7262, lng: 2.3652, emoji: '✈️' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.8003, lng: 12.2389, emoji: '✈️' },
  { code: 'BCN', name: 'Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.2971, lng: 2.0785, emoji: '✈️' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4983, lng: -3.5676, emoji: '✈️' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3105, lng: 4.7683, emoji: '✈️' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.0379, lng: 8.5622, emoji: '✈️' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', countryCode: 'DE', lat: 48.3537, lng: 11.7860, emoji: '✈️' },
  { code: 'ZRH', name: 'Zürich Airport', city: 'Zürich', country: 'Switzerland', countryCode: 'CH', lat: 47.4647, lng: 8.5492, emoji: '✈️' },
  { code: 'LIS', name: 'Lisbon Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', countryCode: 'PT', lat: 38.7813, lng: -9.1359, emoji: '✈️' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.1103, lng: 16.5697, emoji: '✈️' },
  { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', countryCode: 'CZ', lat: 50.1008, lng: 14.2600, emoji: '✈️' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.6181, lng: 12.6560, emoji: '✈️' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', countryCode: 'IE', lat: 53.4264, lng: -6.2499, emoji: '✈️' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.2753, lng: 28.7519, emoji: '✈️' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', countryCode: 'GR', lat: 37.9364, lng: 23.9445, emoji: '✈️' },

  // Asia Major Airports
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2532, lng: 55.3657, emoji: '✈️' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3644, lng: 103.9915, emoji: '✈️' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', lat: 22.3080, lng: 113.9185, emoji: '✈️' },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.7647, lng: 140.3864, emoji: '✈️' },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.5494, lng: 139.7798, emoji: '✈️' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.4602, lng: 126.4407, emoji: '✈️' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.6900, lng: 100.7501, emoji: '✈️' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 2.7456, lng: 101.7099, emoji: '✈️' },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.5562, lng: 77.1000, emoji: '✈️' },
  { code: 'BOM', name: 'Chhatrapati Shivaji International Airport', city: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.0896, lng: 72.8656, emoji: '✈️' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.1443, lng: 121.8083, emoji: '✈️' },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', countryCode: 'CN', lat: 40.0799, lng: 116.6031, emoji: '✈️' },
  { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', countryCode: 'ID', lat: -8.7482, lng: 115.1671, emoji: '✈️' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', countryCode: 'PH', lat: 14.5086, lng: 121.0198, emoji: '✈️' },

  // South America & Mexico
  { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.4356, lng: -46.4731, emoji: '✈️' },
  { code: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.8090, lng: -43.2506, emoji: '✈️' },
  { code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', lat: -34.8222, lng: -58.5358, emoji: '✈️' },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', countryCode: 'CO', lat: 4.7016, lng: -74.1469, emoji: '✈️' },
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.4361, lng: -99.0719, emoji: '✈️' },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', countryCode: 'MX', lat: 21.0365, lng: -86.8771, emoji: '✈️' },
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', countryCode: 'PE', lat: -12.0219, lng: -77.1143, emoji: '✈️' },
  { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', countryCode: 'CL', lat: -33.3930, lng: -70.7858, emoji: '✈️' },

  // Oceania & Canada
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.9399, lng: 151.1753, emoji: '✈️' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.6690, lng: 144.8410, emoji: '✈️' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', countryCode: 'AU', lat: -27.3842, lng: 153.1175, emoji: '✈️' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -37.0082, lng: 174.7850, emoji: '✈️' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6777, lng: -79.6248, emoji: '✈️' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.1967, lng: -123.1815, emoji: '✈️' },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montréal', country: 'Canada', countryCode: 'CA', lat: 45.4706, lng: -73.7408, emoji: '✈️' },

  // Africa & Middle East
  { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.1392, lng: 28.2460, emoji: '✈️' },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.9715, lng: 18.6021, emoji: '✈️' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.1219, lng: 31.4056, emoji: '✈️' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.3675, lng: -7.5898, emoji: '✈️' },
  { code: 'RAK', name: 'Marrakesh Menara Airport', city: 'Marrakesh', country: 'Morocco', countryCode: 'MA', lat: 31.6069, lng: -8.0363, emoji: '✈️' },
  { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel', countryCode: 'IL', lat: 32.0055, lng: 34.8854, emoji: '✈️' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', countryCode: 'QA', lat: 25.2609, lng: 51.6138, emoji: '✈️' },
  { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', lat: 24.4330, lng: 54.6511, emoji: '✈️' },
];

// Popular hotels & landmarks for transfers
const HOTELS_LANDMARKS = [
  // New York
  { name: 'Times Square', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7580, lng: -73.9855, emoji: '🏨', type: 'landmark' },
  { name: 'The Plaza Hotel', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7645, lng: -73.9744, emoji: '🏨', type: 'hotel' },
  { name: 'Hilton Midtown', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7624, lng: -73.9793, emoji: '🏨', type: 'hotel' },
  { name: 'Empire State Building', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7484, lng: -73.9857, emoji: '🏢', type: 'landmark' },
  { name: 'Manhattan Downtown', city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060, emoji: '🏙️', type: 'area' },
  // Las Vegas
  { name: 'The Venetian', city: 'Las Vegas', country: 'United States', countryCode: 'US', lat: 36.1215, lng: -115.1699, emoji: '🏨', type: 'hotel' },
  { name: 'Bellagio Hotel', city: 'Las Vegas', country: 'United States', countryCode: 'US', lat: 36.1126, lng: -115.1767, emoji: '🏨', type: 'hotel' },
  { name: 'MGM Grand', city: 'Las Vegas', country: 'United States', countryCode: 'US', lat: 36.1025, lng: -115.1702, emoji: '🏨', type: 'hotel' },
  { name: 'Las Vegas Strip', city: 'Las Vegas', country: 'United States', countryCode: 'US', lat: 36.1147, lng: -115.1728, emoji: '🎰', type: 'landmark' },
  // Miami
  { name: 'South Beach', city: 'Miami', country: 'United States', countryCode: 'US', lat: 25.7826, lng: -80.1341, emoji: '🏖️', type: 'area' },
  { name: 'Fontainebleau Miami Beach', city: 'Miami', country: 'United States', countryCode: 'US', lat: 25.8006, lng: -80.1221, emoji: '🏨', type: 'hotel' },
  { name: 'Miami Beach Convention Center', city: 'Miami', country: 'United States', countryCode: 'US', lat: 25.7959, lng: -80.1300, emoji: '🏢', type: 'venue' },
  // Los Angeles
  { name: 'Beverly Hills Hotel', city: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0819, lng: -118.4130, emoji: '🏨', type: 'hotel' },
  { name: 'Hollywood Sign', city: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.1341, lng: -118.3215, emoji: '🎬', type: 'landmark' },
  { name: 'Santa Monica Pier', city: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0086, lng: -118.4986, emoji: '🎡', type: 'landmark' },
  // London
  { name: 'The Ritz London', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5072, lng: -0.1411, emoji: '🏨', type: 'hotel' },
  { name: 'Buckingham Palace', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5014, lng: -0.1419, emoji: '🏰', type: 'landmark' },
  { name: 'Big Ben', city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5007, lng: -0.1246, emoji: '🕰️', type: 'landmark' },
  // Paris
  { name: 'Eiffel Tower', city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8584, lng: 2.2945, emoji: '🗼', type: 'landmark' },
  { name: 'The Ritz Paris', city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8682, lng: 2.3286, emoji: '🏨', type: 'hotel' },
  { name: 'Champs-Élysées', city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8698, lng: 2.3078, emoji: '🛍️', type: 'landmark' },
  // Dubai
  { name: 'Burj Al Arab', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.1412, lng: 55.1854, emoji: '🏨', type: 'hotel' },
  { name: 'Burj Khalifa', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.1972, lng: 55.2744, emoji: '🏢', type: 'landmark' },
  { name: 'Dubai Mall', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.1985, lng: 55.2796, emoji: '🛍️', type: 'landmark' },
  { name: 'Palm Jumeirah', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.1124, lng: 55.1390, emoji: '🏝️', type: 'area' },
  // Cancun
  { name: 'Cancún Hotel Zone', city: 'Cancún', country: 'Mexico', countryCode: 'MX', lat: 21.0936, lng: -86.7712, emoji: '🏖️', type: 'area' },
  { name: 'Moon Palace Cancún', city: 'Cancún', country: 'Mexico', countryCode: 'MX', lat: 20.9938, lng: -86.8306, emoji: '🏨', type: 'hotel' },
  // Rome
  { name: 'Colosseum', city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.8902, lng: 12.4922, emoji: '🏛️', type: 'landmark' },
  { name: 'Vatican City', city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9022, lng: 12.4539, emoji: '⛪', type: 'landmark' },
  // Barcelona
  { name: 'La Sagrada Familia', city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.4036, lng: 2.1744, emoji: '⛪', type: 'landmark' },
  { name: 'Las Ramblas', city: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3809, lng: 2.1733, emoji: '🛍️', type: 'landmark' },
  // Tokyo
  { name: 'Shibuya Crossing', city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6595, lng: 139.7004, emoji: '🚶', type: 'landmark' },
  { name: 'Tokyo Disneyland', city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6329, lng: 139.8804, emoji: '🏰', type: 'landmark' },
  // Singapore
  { name: 'Marina Bay Sands', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.2834, lng: 103.8607, emoji: '🏨', type: 'hotel' },
  { name: 'Orchard Road', city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3048, lng: 103.8318, emoji: '🛍️', type: 'landmark' },
  // Sydney
  { name: 'Sydney Opera House', city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8568, lng: 151.2153, emoji: '🎭', type: 'landmark' },
  { name: 'Bondi Beach', city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8915, lng: 151.2767, emoji: '🏖️', type: 'landmark' },
  // Bangkok
  { name: 'Grand Palace', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7500, lng: 100.4913, emoji: '🏯', type: 'landmark' },
  { name: 'Khao San Road', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7588, lng: 100.4970, emoji: '🎉', type: 'landmark' },
  // Bali
  { name: 'Seminyak Beach', city: 'Bali', country: 'Indonesia', countryCode: 'ID', lat: -8.6873, lng: 115.1585, emoji: '🏖️', type: 'area' },
  { name: 'Ubud Center', city: 'Bali', country: 'Indonesia', countryCode: 'ID', lat: -8.5069, lng: 115.2625, emoji: '🌴', type: 'area' },
];

// Popular cities for transfers
const CITIES = [
  { name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.0060, emoji: '🗽' },
  { name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0522, lng: -118.2437, emoji: '🌴' },
  { name: 'Miami', country: 'United States', countryCode: 'US', lat: 25.7617, lng: -80.1918, emoji: '🏖️' },
  { name: 'Las Vegas', country: 'United States', countryCode: 'US', lat: 36.1699, lng: -115.1398, emoji: '🎰' },
  { name: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.7749, lng: -122.4194, emoji: '🌉' },
  { name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.8781, lng: -87.6298, emoji: '🏙️' },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lng: -0.1278, emoji: '🇬🇧' },
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, emoji: '🗼' },
  { name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, emoji: '🏛️' },
  { name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3851, lng: 2.1734, emoji: '🇪🇸' },
  { name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041, emoji: '🇳🇱' },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708, emoji: '🏜️' },
  { name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, emoji: '🦁' },
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503, emoji: '🗾' },
  { name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', lat: 22.3193, lng: 114.1694, emoji: '🇭🇰' },
  { name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093, emoji: '🇦🇺' },
  { name: 'Bangkok', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lng: 100.5018, emoji: '🇹🇭' },
  { name: 'Bali', country: 'Indonesia', countryCode: 'ID', lat: -8.3405, lng: 115.0920, emoji: '🏝️' },
  { name: 'Cancún', country: 'Mexico', countryCode: 'MX', lat: 21.1619, lng: -86.8515, emoji: '🏖️' },
  { name: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lng: -46.6333, emoji: '🇧🇷' },
  { name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', lat: -22.9068, lng: -43.1729, emoji: '🇧🇷' },
  { name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lng: -79.3832, emoji: '🇨🇦' },
];

/**
 * Normalize string for search (remove accents, lowercase)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Search for transfer locations (airports + cities + hotels/landmarks)
 */
function searchLocations(query: string): any[] {
  const normalized = normalizeString(query);
  if (normalized.length < 2) return [];

  const results: Array<{ item: any; score: number; type: 'airport' | 'city' | 'hotel' | 'landmark' }> = [];

  // Search airports
  for (const airport of AIRPORTS) {
    let score = 0;
    const normalizedCode = airport.code.toLowerCase();
    const normalizedName = normalizeString(airport.name);
    const normalizedCity = normalizeString(airport.city);

    if (normalizedCode === normalized) score = 100;
    else if (normalizedCode.startsWith(normalized)) score = 95;
    else if (normalizedName.includes(normalized)) score = 85;
    else if (normalizedCity.includes(normalized) || normalized.includes(normalizedCity)) score = 75;
    else if (normalized.includes(normalizedCode)) score = 90;

    if (score > 0) results.push({ item: airport, score, type: 'airport' });
  }

  // Search hotels & landmarks
  for (const poi of HOTELS_LANDMARKS) {
    let score = 0;
    const normalizedName = normalizeString(poi.name);
    const normalizedCity = normalizeString(poi.city);

    if (normalizedName === normalized) score = 85;
    else if (normalizedName.startsWith(normalized)) score = 78;
    else if (normalizedName.includes(normalized)) score = 65;
    else if (normalizedCity.includes(normalized)) score = 55;

    if (score > 0) results.push({ item: poi, score, type: poi.type === 'hotel' ? 'hotel' : 'landmark' });
  }

  // Search cities
  for (const city of CITIES) {
    let score = 0;
    const normalizedName = normalizeString(city.name);
    const normalizedCountry = normalizeString(city.country);

    if (normalizedName === normalized) score = 80;
    else if (normalizedName.startsWith(normalized)) score = 70;
    else if (normalizedName.includes(normalized)) score = 60;
    else if (normalizedCountry.includes(normalized)) score = 40;

    if (score > 0) results.push({ item: city, score, type: 'city' });
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Format results
  return results.slice(0, 12).map(r => {
    if (r.type === 'airport') {
      return {
        id: `airport-${r.item.code}`,
        name: r.item.name,
        displayName: `${r.item.name} (${r.item.code})`,
        code: r.item.code,
        city: r.item.city,
        country: r.item.country,
        countryCode: r.item.countryCode,
        latitude: r.item.lat,
        longitude: r.item.lng,
        type: 'airport',
        emoji: r.item.emoji,
        coverage: getCoverageLevel(r.item.code),
      };
    } else if (r.type === 'hotel' || r.type === 'landmark') {
      return {
        id: `${r.item.type}-${normalizeString(r.item.name)}`,
        name: r.item.name,
        displayName: `${r.item.emoji} ${r.item.name}, ${r.item.city}`,
        city: r.item.city,
        country: r.item.country,
        countryCode: r.item.countryCode,
        latitude: r.item.lat,
        longitude: r.item.lng,
        type: r.item.type, // hotel, landmark, area, venue
        emoji: r.item.emoji,
        coverage: 'high',
      };
    } else {
      return {
        id: `city-${normalizeString(r.item.name)}`,
        name: r.item.name,
        displayName: `${r.item.emoji} ${r.item.name}, ${r.item.country}`,
        city: r.item.name,
        country: r.item.country,
        countryCode: r.item.countryCode,
        latitude: r.item.lat,
        longitude: r.item.lng,
        type: 'city',
        emoji: r.item.emoji,
        coverage: 'medium',
      };
    }
  });
}

/**
 * GET /api/transfers/locations?query=JFK
 *
 * Transfer location autocomplete API
 * Returns airports and cities for transfer pickup/dropoff
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const query = request.nextUrl.searchParams.get('query');

    // Return popular airports if no query
    if (!query || query.length < 2) {
      const popular = AIRPORTS.slice(0, 15).map(a => ({
        id: `airport-${a.code}`,
        name: a.name,
        displayName: `${a.name} (${a.code})`,
        code: a.code,
        city: a.city,
        country: a.country,
        countryCode: a.countryCode,
        latitude: a.lat,
        longitude: a.lng,
        type: 'airport',
        emoji: a.emoji,
        coverage: getCoverageLevel(a.code),
      }));

      return NextResponse.json({
        success: true,
        data: popular,
        meta: {
          count: popular.length,
          source: 'popular',
          coverage: COVERAGE_STATS.transfers,
        }
      });
    }

    // Check cache
    const cacheKey = generateCacheKey('transfers:locations:v3', { query: query.toLowerCase() });
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    // PRIORITY: Use Amadeus API for REAL coverage (airports + cities worldwide)
    let results = await searchAmadeusTransferLocations(query, 15);

    // Fallback to local database if Amadeus returns nothing
    if (results.length === 0) {
      console.log(`⚠️ Amadeus returned 0, using local fallback for "${query}"`);
      results = searchLocations(query);
    }

    const response = {
      success: true,
      data: results,
      meta: {
        count: results.length,
        query,
        source: results[0]?.source || 'local',
        coverage: COVERAGE_STATS.transfers,
      }
    };

    // Cache for 1 hour
    await setCache(cacheKey, response, 3600);

    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.NORMAL });
}
