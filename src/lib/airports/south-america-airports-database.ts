/**
 * 🌎 COMPREHENSIVE SOUTH AMERICA AIRPORTS DATABASE
 * Complete database of South American airports with major hubs, regional airports, and international gateways
 * Data optimized for flight booking and search functionality across all South American countries
 */

export interface SouthAmericaAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state?: string;
  stateCode?: string;
  region: string;
  country: 'Argentina' | 'Bolivia' | 'Brazil' | 'Chile' | 'Colombia' | 'Ecuador' | 'French Guiana' | 'Guyana' | 'Paraguay' | 'Peru' | 'Suriname' | 'Uruguay' | 'Venezuela';
  countryCode: 'AR' | 'BO' | 'BR' | 'CL' | 'CO' | 'EC' | 'GF' | 'GY' | 'PY' | 'PE' | 'SR' | 'UY' | 'VE';
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevation: number; // meters above sea level
  category: 'major_hub' | 'hub' | 'regional' | 'international_gateway' | 'focus_city' | 'small_hub';
  isInternational: boolean;
  passengerCount: number; // annual passengers (millions)
  airlines: string[]; // major airlines operating at this airport
  terminals: number;
  runways: number;
  popularDestinations: string[]; // IATA codes of popular routes
  searchKeywords: string[]; // additional search terms
  weatherStation?: string;
  groundTransport: ('metro' | 'train' | 'bus' | 'taxi' | 'rideshare' | 'rental_car')[];
  amenities: ('wifi' | 'lounges' | 'shopping' | 'dining' | 'hotels' | 'spa' | 'conference')[];
}

/**
 * ARGENTINA AIRPORTS - Complete coverage
 */
export const ARGENTINA_AIRPORTS: SouthAmericaAirport[] = [
  // Buenos Aires - Jorge Newbery Airfield (Domestic)
  {
    iataCode: 'AEP',
    icaoCode: 'SABE',
    name: 'Jorge Newbery Airfield',
    city: 'Buenos Aires',
    state: 'Buenos Aires',
    stateCode: 'BA',
    region: 'Pampas',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Buenos_Aires',
    coordinates: { latitude: -34.5592, longitude: -58.4156 },
    elevation: 5,
    category: 'hub',
    isInternational: false,
    passengerCount: 8.2,
    airlines: ['AR', 'FO', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'COR', 'MDZ', 'IGR', 'BRC', 'USH', 'FTE', 'SLA'],
    searchKeywords: ['buenos aires', 'newbery', 'jorge newbery', 'ba', 'argentina', 'domestic'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Buenos Aires - Ezeiza International Airport
  {
    iataCode: 'EZE',
    icaoCode: 'SAEZ',
    name: 'Ezeiza International Airport',
    city: 'Buenos Aires',
    state: 'Buenos Aires',
    stateCode: 'BA',
    region: 'Pampas',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Buenos_Aires',
    coordinates: { latitude: -34.8222, longitude: -58.5358 },
    elevation: 20,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 10.8,
    airlines: ['AR', 'LA', 'G3', 'AA', 'DL', 'UA', 'AF', 'LH'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['GRU', 'SCL', 'LIM', 'BOG', 'UIO', 'CCS', 'MVD', 'ASU', 'COR', 'MDZ'],
    searchKeywords: ['buenos aires', 'ezeiza', 'ba', 'argentina', 'international', 'ministro pistarini'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Córdoba Airport
  {
    iataCode: 'COR',
    icaoCode: 'SACO',
    name: 'Córdoba Airport',
    city: 'Córdoba',
    state: 'Córdoba',
    stateCode: 'CB',
    region: 'Central',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Cordoba',
    coordinates: { latitude: -31.3236, longitude: -64.2081 },
    elevation: 474,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.8,
    airlines: ['AR', 'FO', 'JA', 'LA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'MDZ', 'BRC', 'IGR', 'GRU', 'SCL', 'LIM'],
    searchKeywords: ['cordoba', 'argentina', 'central', 'ingeniero aeronautico ambrosio taravella'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Mendoza Airport
  {
    iataCode: 'MDZ',
    icaoCode: 'SAME',
    name: 'Governor Francisco Gabrielli International Airport',
    city: 'Mendoza',
    state: 'Mendoza',
    stateCode: 'MZ',
    region: 'Cuyo',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Mendoza',
    coordinates: { latitude: -32.8317, longitude: -68.7928 },
    elevation: 704,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.4,
    airlines: ['AR', 'FO', 'JA', 'LA', 'H2'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'COR', 'SCL', 'GRU', 'LIM', 'BRC', 'IGR'],
    searchKeywords: ['mendoza', 'argentina', 'cuyo', 'wine', 'andes', 'francisco gabrielli'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Bariloche Airport
  {
    iataCode: 'BRC',
    icaoCode: 'SAZS',
    name: 'San Carlos de Bariloche Airport',
    city: 'Bariloche',
    state: 'Río Negro',
    stateCode: 'RN',
    region: 'Patagonia',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Salta',
    coordinates: { latitude: -41.1512, longitude: -71.1575 },
    elevation: 840,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.2,
    airlines: ['AR', 'FO', 'JA', 'LA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'COR', 'MDZ', 'IGR', 'SCL', 'GRU', 'USH'],
    searchKeywords: ['bariloche', 'patagonia', 'argentina', 'lakes', 'andes', 'teniente luis candelaria'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Iguazu Falls Airport
  {
    iataCode: 'IGR',
    icaoCode: 'SARI',
    name: 'Cataratas del Iguazú International Airport',
    city: 'Puerto Iguazú',
    state: 'Misiones',
    stateCode: 'MN',
    region: 'Northeast',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Buenos_Aires',
    coordinates: { latitude: -25.7372, longitude: -54.4734 },
    elevation: 270,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.0,
    airlines: ['AR', 'FO', 'JA', 'G3'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'COR', 'GRU', 'GIG', 'BSB', 'CGH', 'ASU'],
    searchKeywords: ['iguazu', 'iguassu', 'falls', 'puerto iguazu', 'misiones', 'argentina', 'cataratas'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Ushuaia Airport
  {
    iataCode: 'USH',
    icaoCode: 'SAWH',
    name: 'Ushuaia Malvinas Argentinas Airport',
    city: 'Ushuaia',
    state: 'Tierra del Fuego',
    stateCode: 'TF',
    region: 'Patagonia',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Ushuaia',
    coordinates: { latitude: -54.8433, longitude: -68.2958 },
    elevation: 25,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.8,
    airlines: ['AR', 'FO', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'BRC', 'COR', 'FTE', 'SCL', 'PUQ'],
    searchKeywords: ['ushuaia', 'tierra del fuego', 'patagonia', 'argentina', 'end of world', 'malvinas argentinas'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Salta Airport
  {
    iataCode: 'SLA',
    icaoCode: 'SASA',
    name: 'Martín Miguel de Güemes International Airport',
    city: 'Salta',
    state: 'Salta',
    stateCode: 'SA',
    region: 'Northwest',
    country: 'Argentina',
    countryCode: 'AR',
    timezone: 'America/Argentina/Salta',
    coordinates: { latitude: -24.8559, longitude: -65.4864 },
    elevation: 1221,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.9,
    airlines: ['AR', 'FO', 'JA', 'BO'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'COR', 'LPB', 'SCZ', 'VVI', 'BOG', 'LIM'],
    searchKeywords: ['salta', 'argentina', 'northwest', 'martin miguel de guemes'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * COLOMBIA AIRPORTS - Complete coverage
 */
export const COLOMBIA_AIRPORTS: SouthAmericaAirport[] = [
  // Bogotá El Dorado International Airport
  {
    iataCode: 'BOG',
    icaoCode: 'SKBO',
    name: 'El Dorado International Airport',
    city: 'Bogotá',
    state: 'Cundinamarca',
    stateCode: 'DC',
    region: 'Andina',
    country: 'Colombia',
    countryCode: 'CO',
    timezone: 'America/Bogota',
    coordinates: { latitude: 4.7016, longitude: -74.1469 },
    elevation: 2547,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 35.6,
    airlines: ['AV', 'VE', '9R', 'LA', 'AA', 'DL', 'UA', 'CM', 'IB'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['MDE', 'CTG', 'CLO', 'BAQ', 'BGA', 'LIM', 'UIO', 'CCS', 'PTY', 'MIA'],
    searchKeywords: ['bogota', 'colombia', 'capital', 'el dorado', 'cundinamarca'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Medellín José María Córdova International Airport
  {
    iataCode: 'MDE',
    icaoCode: 'SKRG',
    name: 'José María Córdova International Airport',
    city: 'Medellín',
    state: 'Antioquia',
    stateCode: 'ANT',
    region: 'Andina',
    country: 'Colombia',
    countryCode: 'CO',
    timezone: 'America/Bogota',
    coordinates: { latitude: 6.1645, longitude: -75.4231 },
    elevation: 2142,
    category: 'hub',
    isInternational: true,
    passengerCount: 8.5,
    airlines: ['AV', 'VE', '9R', 'LA', 'AA', 'DL', 'CM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['BOG', 'CTG', 'CLO', 'BAQ', 'BGA', 'LIM', 'UIO', 'PTY', 'MIA', 'CCS'],
    searchKeywords: ['medellin', 'antioquia', 'colombia', 'jose maria cordova', 'rionegro'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Cartagena Rafael Núñez International Airport
  {
    iataCode: 'CTG',
    icaoCode: 'SKCG',
    name: 'Rafael Núñez International Airport',
    city: 'Cartagena',
    state: 'Bolívar',
    stateCode: 'BOL',
    region: 'Caribe',
    country: 'Colombia',
    countryCode: 'CO',
    timezone: 'America/Bogota',
    coordinates: { latitude: 10.4424, longitude: -75.5130 },
    elevation: 4,
    category: 'regional',
    isInternational: true,
    passengerCount: 5.2,
    airlines: ['AV', 'VE', '9R', 'LA', 'AA', 'DL', 'CM', 'JA'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['BOG', 'MDE', 'CLO', 'BAQ', 'PTY', 'MIA', 'CCS', 'CUR', 'SJU', 'JFK'],
    searchKeywords: ['cartagena', 'bolivar', 'colombia', 'caribbean', 'rafael nunez', 'coast'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Cali Alfonso Bonilla Aragón International Airport
  {
    iataCode: 'CLO',
    icaoCode: 'SKCL',
    name: 'Alfonso Bonilla Aragón International Airport',
    city: 'Cali',
    state: 'Valle del Cauca',
    stateCode: 'VAC',
    region: 'Pacífica',
    country: 'Colombia',
    countryCode: 'CO',
    timezone: 'America/Bogota',
    coordinates: { latitude: 3.5432, longitude: -76.3816 },
    elevation: 969,
    category: 'regional',
    isInternational: true,
    passengerCount: 4.6,
    airlines: ['AV', 'VE', '9R', 'LA', 'AA', 'DL', 'CM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['BOG', 'MDE', 'CTG', 'BAQ', 'BGA', 'LIM', 'UIO', 'PTY', 'MIA'],
    searchKeywords: ['cali', 'valle del cauca', 'colombia', 'pacific', 'alfonso bonilla aragon'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Barranquilla Ernesto Cortissoz International Airport
  {
    iataCode: 'BAQ',
    icaoCode: 'SKBQ',
    name: 'Ernesto Cortissoz International Airport',
    city: 'Barranquilla',
    state: 'Atlántico',
    stateCode: 'ATL',
    region: 'Caribe',
    country: 'Colombia',
    countryCode: 'CO',
    timezone: 'America/Bogota',
    coordinates: { latitude: 10.8896, longitude: -74.7808 },
    elevation: 98,
    category: 'regional',
    isInternational: true,
    passengerCount: 3.1,
    airlines: ['AV', 'VE', '9R', 'LA', 'CM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['BOG', 'MDE', 'CTG', 'CLO', 'BGA', 'PTY', 'MIA', 'CCS', 'CUR'],
    searchKeywords: ['barranquilla', 'atlantico', 'colombia', 'caribbean', 'ernesto cortissoz'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Bucaramanga Palonegro International Airport
  {
    iataCode: 'BGA',
    icaoCode: 'SKBG',
    name: 'Palonegro International Airport',
    city: 'Bucaramanga',
    state: 'Santander',
    stateCode: 'SAN',
    region: 'Andina',
    country: 'Colombia',
    countryCode: 'CO',
    timezone: 'America/Bogota',
    coordinates: { latitude: 7.1265, longitude: -73.1848 },
    elevation: 1196,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.8,
    airlines: ['AV', 'VE', '9R', 'LA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['BOG', 'MDE', 'CTG', 'CLO', 'BAQ', 'CCS', 'PTY', 'MIA'],
    searchKeywords: ['bucaramanga', 'santander', 'colombia', 'palonegro'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * PERU AIRPORTS - Complete coverage
 */
export const PERU_AIRPORTS: SouthAmericaAirport[] = [
  // Lima Jorge Chávez International Airport
  {
    iataCode: 'LIM',
    icaoCode: 'SPJC',
    name: 'Jorge Chávez International Airport',
    city: 'Lima',
    state: 'Lima',
    stateCode: 'LIM',
    region: 'Costa',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    coordinates: { latitude: -12.0219, longitude: -77.1143 },
    elevation: 113,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 22.1,
    airlines: ['LP', 'LA', 'H2', 'AA', 'DL', 'UA', 'AV', 'IB', 'KL'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['CUZ', 'AQP', 'TRU', 'IQT', 'PIU', 'BOG', 'UIO', 'SCL', 'GRU', 'MIA'],
    searchKeywords: ['lima', 'peru', 'capital', 'jorge chavez', 'callao'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Cusco Alejandro Velasco Astete International Airport
  {
    iataCode: 'CUZ',
    icaoCode: 'SPZO',
    name: 'Alejandro Velasco Astete International Airport',
    city: 'Cusco',
    state: 'Cusco',
    stateCode: 'CUS',
    region: 'Sierra',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    coordinates: { latitude: -13.5358, longitude: -71.9389 },
    elevation: 3311,
    category: 'regional',
    isInternational: true,
    passengerCount: 3.2,
    airlines: ['LP', 'LA', 'H2', 'AV', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LIM', 'AQP', 'LPB', 'BOG', 'UIO', 'SCL', 'GRU', 'MIA'],
    searchKeywords: ['cusco', 'cuzco', 'peru', 'machu picchu', 'inca', 'alejandro velasco astete'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Arequipa Rodríguez Ballón International Airport
  {
    iataCode: 'AQP',
    icaoCode: 'SPQU',
    name: 'Rodríguez Ballón International Airport',
    city: 'Arequipa',
    state: 'Arequipa',
    stateCode: 'ARE',
    region: 'Sierra',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    coordinates: { latitude: -16.3411, longitude: -71.5830 },
    elevation: 2548,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.4,
    airlines: ['LP', 'LA', 'H2'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LIM', 'CUZ', 'TRU', 'SCL', 'LPB', 'BOG', 'UIO'],
    searchKeywords: ['arequipa', 'peru', 'white city', 'rodriguez ballon'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Trujillo Capitán FAP Carlos Martínez de Pinillos International Airport
  {
    iataCode: 'TRU',
    icaoCode: 'SPRU',
    name: 'Capitán FAP Carlos Martínez de Pinillos International Airport',
    city: 'Trujillo',
    state: 'La Libertad',
    stateCode: 'LAL',
    region: 'Costa',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    coordinates: { latitude: -8.0811, longitude: -79.1089 },
    elevation: 106,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.1,
    airlines: ['LP', 'LA', 'H2'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LIM', 'CUZ', 'AQP', 'PIU', 'IQT', 'BOG', 'UIO'],
    searchKeywords: ['trujillo', 'la libertad', 'peru', 'carlos martinez de pinillos'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Iquitos Coronel FAP Francisco Secada Vignetta International Airport
  {
    iataCode: 'IQT',
    icaoCode: 'SPQT',
    name: 'Coronel FAP Francisco Secada Vignetta International Airport',
    city: 'Iquitos',
    state: 'Loreto',
    stateCode: 'LOR',
    region: 'Selva',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    coordinates: { latitude: -3.7847, longitude: -73.3086 },
    elevation: 117,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.0,
    airlines: ['LP', 'LA', 'H2'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LIM', 'CUZ', 'TRU', 'PIU', 'MAO', 'BOG', 'UIO'],
    searchKeywords: ['iquitos', 'loreto', 'peru', 'amazon', 'francisco secada vignetta'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Piura Capitán FAP Guillermo Concha Iberico International Airport
  {
    iataCode: 'PIU',
    icaoCode: 'SPUR',
    name: 'Capitán FAP Guillermo Concha Iberico International Airport',
    city: 'Piura',
    state: 'Piura',
    stateCode: 'PIU',
    region: 'Costa',
    country: 'Peru',
    countryCode: 'PE',
    timezone: 'America/Lima',
    coordinates: { latitude: -5.2057, longitude: -80.6164 },
    elevation: 57,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.8,
    airlines: ['LP', 'LA', 'H2'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LIM', 'CUZ', 'TRU', 'AQP', 'IQT', 'UIO', 'BOG'],
    searchKeywords: ['piura', 'peru', 'north', 'guillermo concha iberico'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * CHILE AIRPORTS - Complete coverage
 */
export const CHILE_AIRPORTS: SouthAmericaAirport[] = [
  // Santiago Arturo Merino Benítez International Airport
  {
    iataCode: 'SCL',
    icaoCode: 'SCEL',
    name: 'Arturo Merino Benítez International Airport',
    city: 'Santiago',
    state: 'Santiago Metropolitan',
    stateCode: 'RM',
    region: 'Central',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'America/Santiago',
    coordinates: { latitude: -33.3928, longitude: -70.7858 },
    elevation: 474,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 24.2,
    airlines: ['LA', 'H2', 'JA', 'AA', 'DL', 'UA', 'AF', 'LH', 'IB', 'KL'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['LIM', 'BOG', 'UIO', 'EZE', 'GRU', 'MVD', 'ASU', 'CCP', 'IPC', 'LSC'],
    searchKeywords: ['santiago', 'chile', 'capital', 'arturo merino benitez', 'pudahuel'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Concepción Carriel Sur International Airport
  {
    iataCode: 'CCP',
    icaoCode: 'SCIE',
    name: 'Carriel Sur International Airport',
    city: 'Concepción',
    state: 'Biobío',
    stateCode: 'BI',
    region: 'Central',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'America/Santiago',
    coordinates: { latitude: -36.7726, longitude: -73.0631 },
    elevation: 8,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.2,
    airlines: ['LA', 'H2', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SCL', 'IPC', 'LSC', 'ANF', 'CJC', 'PMC', 'PUQ'],
    searchKeywords: ['concepcion', 'biobio', 'chile', 'carriel sur'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Easter Island Mataveri International Airport
  {
    iataCode: 'IPC',
    icaoCode: 'SCIP',
    name: 'Mataveri International Airport',
    city: 'Hanga Roa',
    state: 'Valparaíso',
    stateCode: 'VS',
    region: 'Insular',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'Pacific/Easter',
    coordinates: { latitude: -27.1648, longitude: -109.4219 },
    elevation: 51,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.1,
    airlines: ['LA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SCL', 'PPT'],
    searchKeywords: ['easter island', 'rapa nui', 'mataveri', 'hanga roa', 'chile', 'moai'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // La Serena La Florida Airport
  {
    iataCode: 'LSC',
    icaoCode: 'SCSE',
    name: 'La Florida Airport',
    city: 'La Serena',
    state: 'Coquimbo',
    stateCode: 'CO',
    region: 'North',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'America/Santiago',
    coordinates: { latitude: -29.9163, longitude: -71.2019 },
    elevation: 142,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.4,
    airlines: ['LA', 'H2', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SCL', 'CCP', 'ANF', 'CJC', 'IPC'],
    searchKeywords: ['la serena', 'coquimbo', 'chile', 'la florida', 'north'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Antofagasta Andrés Sabella Gálvez International Airport
  {
    iataCode: 'ANF',
    icaoCode: 'SCFA',
    name: 'Andrés Sabella Gálvez International Airport',
    city: 'Antofagasta',
    state: 'Antofagasta',
    stateCode: 'AN',
    region: 'North',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'America/Santiago',
    coordinates: { latitude: -23.4445, longitude: -70.4451 },
    elevation: 135,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.8,
    airlines: ['LA', 'H2', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SCL', 'CCP', 'LSC', 'CJC', 'LIM', 'LPB'],
    searchKeywords: ['antofagasta', 'chile', 'north', 'mining', 'andres sabella galvez'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Calama El Loa Airport
  {
    iataCode: 'CJC',
    icaoCode: 'SCCF',
    name: 'El Loa Airport',
    city: 'Calama',
    state: 'Antofagasta',
    stateCode: 'AN',
    region: 'North',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'America/Santiago',
    coordinates: { latitude: -22.4982, longitude: -68.9036 },
    elevation: 2317,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.6,
    airlines: ['LA', 'H2', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SCL', 'ANF', 'CCP', 'LSC', 'LIM', 'LPB'],
    searchKeywords: ['calama', 'el loa', 'antofagasta', 'chile', 'atacama', 'mining'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Punta Arenas Carlos Ibáñez del Campo International Airport
  {
    iataCode: 'PUQ',
    icaoCode: 'SCCI',
    name: 'Carlos Ibáñez del Campo International Airport',
    city: 'Punta Arenas',
    state: 'Magallanes',
    stateCode: 'MA',
    region: 'Patagonia',
    country: 'Chile',
    countryCode: 'CL',
    timezone: 'America/Punta_Arenas',
    coordinates: { latitude: -53.0026, longitude: -70.8546 },
    elevation: 17,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.7,
    airlines: ['LA', 'H2', 'JA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SCL', 'USH', 'FTE', 'PMC', 'CCP', 'EZE'],
    searchKeywords: ['punta arenas', 'magallanes', 'chile', 'patagonia', 'carlos ibanez del campo'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * ECUADOR AIRPORTS - Complete coverage
 */
export const ECUADOR_AIRPORTS: SouthAmericaAirport[] = [
  // Quito Mariscal Sucre International Airport
  {
    iataCode: 'UIO',
    icaoCode: 'SEQM',
    name: 'Mariscal Sucre International Airport',
    city: 'Quito',
    state: 'Pichincha',
    stateCode: 'P',
    region: 'Sierra',
    country: 'Ecuador',
    countryCode: 'EC',
    timezone: 'America/Guayaquil',
    coordinates: { latitude: -0.1292, longitude: -78.3578 },
    elevation: 2400,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 5.1,
    airlines: ['XL', 'EQ', 'LA', 'AV', 'AA', 'DL', 'UA', 'KL', 'IB'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GYE', 'CUE', 'LOH', 'BOG', 'LIM', 'PTY', 'MIA', 'MAD', 'AMS'],
    searchKeywords: ['quito', 'ecuador', 'capital', 'mariscal sucre', 'pichincha'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Guayaquil José Joaquín de Olmedo International Airport
  {
    iataCode: 'GYE',
    icaoCode: 'SEGU',
    name: 'José Joaquín de Olmedo International Airport',
    city: 'Guayaquil',
    state: 'Guayas',
    stateCode: 'G',
    region: 'Costa',
    country: 'Ecuador',
    countryCode: 'EC',
    timezone: 'America/Guayaquil',
    coordinates: { latitude: -2.1574, longitude: -79.8836 },
    elevation: 4,
    category: 'hub',
    isInternational: true,
    passengerCount: 4.8,
    airlines: ['XL', 'EQ', 'LA', 'AV', 'AA', 'DL', 'UA', 'CM', 'KL'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['UIO', 'CUE', 'LOH', 'GPS', 'BOG', 'LIM', 'PTY', 'MIA', 'AMS'],
    searchKeywords: ['guayaquil', 'ecuador', 'guayas', 'jose joaquin de olmedo', 'coast'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Cuenca Mariscal Lamar International Airport
  {
    iataCode: 'CUE',
    icaoCode: 'SECU',
    name: 'Mariscal Lamar International Airport',
    city: 'Cuenca',
    state: 'Azuay',
    stateCode: 'A',
    region: 'Sierra',
    country: 'Ecuador',
    countryCode: 'EC',
    timezone: 'America/Guayaquil',
    coordinates: { latitude: -2.8894, longitude: -78.9847 },
    elevation: 2515,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.4,
    airlines: ['XL', 'EQ', 'LA', 'AV'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['UIO', 'GYE', 'BOG', 'LIM', 'PTY', 'MIA'],
    searchKeywords: ['cuenca', 'azuay', 'ecuador', 'mariscal lamar', 'sierra'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Galápagos Seymour Airport
  {
    iataCode: 'GPS',
    icaoCode: 'SEGS',
    name: 'Seymour Airport',
    city: 'Galápagos',
    state: 'Galápagos',
    stateCode: 'W',
    region: 'Insular',
    country: 'Ecuador',
    countryCode: 'EC',
    timezone: 'Pacific/Galapagos',
    coordinates: { latitude: -0.4536, longitude: -90.2658 },
    elevation: 207,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.3,
    airlines: ['XL', 'EQ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['UIO', 'GYE'],
    searchKeywords: ['galapagos', 'seymour', 'ecuador', 'islands', 'darwin', 'tortoise'],
    groundTransport: ['bus', 'taxi'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * VENEZUELA AIRPORTS - Complete coverage
 */
export const VENEZUELA_AIRPORTS: SouthAmericaAirport[] = [
  // Caracas Simón Bolívar International Airport
  {
    iataCode: 'CCS',
    icaoCode: 'SVMI',
    name: 'Simón Bolívar International Airport',
    city: 'Caracas',
    state: 'Miranda',
    stateCode: 'MI',
    region: 'Capital',
    country: 'Venezuela',
    countryCode: 'VE',
    timezone: 'America/Caracas',
    coordinates: { latitude: 10.6013, longitude: -66.9911 },
    elevation: 72,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 8.2,
    airlines: ['VO', 'V0', 'R7', 'LA', 'AV', 'CM', 'AA', 'DL'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['MAR', 'VLN', 'BLA', 'BOG', 'PTY', 'CUR', 'AUA', 'MIA', 'MAD'],
    searchKeywords: ['caracas', 'venezuela', 'capital', 'simon bolivar', 'maiquetia'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Maracaibo La Chinita International Airport
  {
    iataCode: 'MAR',
    icaoCode: 'SVMC',
    name: 'La Chinita International Airport',
    city: 'Maracaibo',
    state: 'Zulia',
    stateCode: 'ZU',
    region: 'Occidental',
    country: 'Venezuela',
    countryCode: 'VE',
    timezone: 'America/Caracas',
    coordinates: { latitude: 10.5582, longitude: -71.7278 },
    elevation: 66,
    category: 'regional',
    isInternational: true,
    passengerCount: 2.1,
    airlines: ['VO', 'V0', 'R7', 'LA', 'AV', 'CM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['CCS', 'VLN', 'BLA', 'BOG', 'CTG', 'CUR', 'AUA', 'PTY'],
    searchKeywords: ['maracaibo', 'zulia', 'venezuela', 'la chinita', 'oil'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Valencia Arturo Michelena International Airport
  {
    iataCode: 'VLN',
    icaoCode: 'SVVA',
    name: 'Arturo Michelena International Airport',
    city: 'Valencia',
    state: 'Carabobo',
    stateCode: 'CA',
    region: 'Central',
    country: 'Venezuela',
    countryCode: 'VE',
    timezone: 'America/Caracas',
    coordinates: { latitude: 10.1497, longitude: -67.9281 },
    elevation: 139,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.4,
    airlines: ['VO', 'V0', 'R7', 'LA', 'AV'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['CCS', 'MAR', 'BLA', 'BOG', 'PTY', 'CUR', 'MIA'],
    searchKeywords: ['valencia', 'carabobo', 'venezuela', 'arturo michelena'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * URUGUAY AIRPORTS - Complete coverage
 */
export const URUGUAY_AIRPORTS: SouthAmericaAirport[] = [
  // Montevideo Carrasco International Airport
  {
    iataCode: 'MVD',
    icaoCode: 'SUMU',
    name: 'Carrasco International Airport',
    city: 'Montevideo',
    state: 'Montevideo',
    stateCode: 'MO',
    region: 'Sur',
    country: 'Uruguay',
    countryCode: 'UY',
    timezone: 'America/Montevideo',
    coordinates: { latitude: -34.8384, longitude: -56.0308 },
    elevation: 31,
    category: 'hub',
    isInternational: true,
    passengerCount: 2.3,
    airlines: ['UX', 'LA', 'G3', 'AR', 'AA', 'DL', 'IB', 'AF'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'AEP', 'GRU', 'GIG', 'SCL', 'ASU', 'BOG', 'LIM', 'MAD', 'MIA'],
    searchKeywords: ['montevideo', 'uruguay', 'capital', 'carrasco', 'general cesario l berisso'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Punta del Este Laguna del Sauce International Airport
  {
    iataCode: 'PDP',
    icaoCode: 'SULS',
    name: 'Laguna del Sauce International Airport',
    city: 'Punta del Este',
    state: 'Maldonado',
    stateCode: 'MA',
    region: 'Este',
    country: 'Uruguay',
    countryCode: 'UY',
    timezone: 'America/Montevideo',
    coordinates: { latitude: -34.8555, longitude: -55.0942 },
    elevation: 95,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.5,
    airlines: ['UX', 'LA', 'G3', 'AR'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MVD', 'EZE', 'AEP', 'GRU', 'GIG', 'SCL', 'ASU'],
    searchKeywords: ['punta del este', 'maldonado', 'uruguay', 'beach', 'resort', 'laguna del sauce'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * PARAGUAY AIRPORTS - Complete coverage
 */
export const PARAGUAY_AIRPORTS: SouthAmericaAirport[] = [
  // Asunción Silvio Pettirossi International Airport
  {
    iataCode: 'ASU',
    icaoCode: 'SGAS',
    name: 'Silvio Pettirossi International Airport',
    city: 'Asunción',
    state: 'Central',
    stateCode: 'CE',
    region: 'Oriental',
    country: 'Paraguay',
    countryCode: 'PY',
    timezone: 'America/Asuncion',
    coordinates: { latitude: -25.2397, longitude: -57.5196 },
    elevation: 101,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.1,
    airlines: ['LA', 'G3', 'AR', 'AV', 'BO'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['EZE', 'GRU', 'GIG', 'SCL', 'MVD', 'BOG', 'LIM', 'LPB', 'VVI'],
    searchKeywords: ['asuncion', 'paraguay', 'capital', 'silvio pettirossi', 'luque'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Ciudad del Este Guaraní International Airport
  {
    iataCode: 'AGT',
    icaoCode: 'SGES',
    name: 'Guaraní International Airport',
    city: 'Ciudad del Este',
    state: 'Alto Paraná',
    stateCode: 'AP',
    region: 'Oriental',
    country: 'Paraguay',
    countryCode: 'PY',
    timezone: 'America/Asuncion',
    coordinates: { latitude: -25.4559, longitude: -54.8431 },
    elevation: 259,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.3,
    airlines: ['LA', 'G3', 'AR'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['ASU', 'GRU', 'GIG', 'IGR', 'EZE', 'SCL'],
    searchKeywords: ['ciudad del este', 'alto parana', 'paraguay', 'guarani', 'itaipu'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * BOLIVIA AIRPORTS - Complete coverage
 */
export const BOLIVIA_AIRPORTS: SouthAmericaAirport[] = [
  // La Paz El Alto International Airport
  {
    iataCode: 'LPB',
    icaoCode: 'SLLP',
    name: 'El Alto International Airport',
    city: 'La Paz',
    state: 'La Paz',
    stateCode: 'LP',
    region: 'Altiplano',
    country: 'Bolivia',
    countryCode: 'BO',
    timezone: 'America/La_Paz',
    coordinates: { latitude: -16.5133, longitude: -68.1925 },
    elevation: 4150,
    category: 'hub',
    isInternational: true,
    passengerCount: 2.8,
    airlines: ['OB', 'BO', 'LA', 'AV', 'LP'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['VVI', 'CBB', 'SRE', 'LIM', 'CUZ', 'BOG', 'SCL', 'GRU', 'EZE'],
    searchKeywords: ['la paz', 'bolivia', 'el alto', 'capital', 'highest airport'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Santa Cruz Viru Viru International Airport
  {
    iataCode: 'VVI',
    icaoCode: 'SLVR',
    name: 'Viru Viru International Airport',
    city: 'Santa Cruz de la Sierra',
    state: 'Santa Cruz',
    stateCode: 'SC',
    region: 'Llanos',
    country: 'Bolivia',
    countryCode: 'BO',
    timezone: 'America/La_Paz',
    coordinates: { latitude: -17.6448, longitude: -63.1354 },
    elevation: 373,
    category: 'hub',
    isInternational: true,
    passengerCount: 2.4,
    airlines: ['OB', 'BO', 'LA', 'AV', 'G3'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LPB', 'CBB', 'SRE', 'LIM', 'BOG', 'GRU', 'EZE', 'SCL', 'ASU'],
    searchKeywords: ['santa cruz', 'bolivia', 'viru viru', 'llanos', 'economic capital'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Cochabamba Jorge Wilstermann International Airport
  {
    iataCode: 'CBB',
    icaoCode: 'SLCB',
    name: 'Jorge Wilstermann International Airport',
    city: 'Cochabamba',
    state: 'Cochabamba',
    stateCode: 'CB',
    region: 'Valles',
    country: 'Bolivia',
    countryCode: 'BO',
    timezone: 'America/La_Paz',
    coordinates: { latitude: -17.4211, longitude: -66.1771 },
    elevation: 2548,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.0,
    airlines: ['OB', 'BO', 'LA', 'AV'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LPB', 'VVI', 'SRE', 'LIM', 'BOG', 'GRU', 'SCL'],
    searchKeywords: ['cochabamba', 'bolivia', 'jorge wilstermann', 'valles'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Sucre Juana Azurduy de Padilla International Airport
  {
    iataCode: 'SRE',
    icaoCode: 'SLSU',
    name: 'Juana Azurduy de Padilla International Airport',
    city: 'Sucre',
    state: 'Chuquisaca',
    stateCode: 'CH',
    region: 'Valles',
    country: 'Bolivia',
    countryCode: 'BO',
    timezone: 'America/La_Paz',
    coordinates: { latitude: -19.0071, longitude: -65.2886 },
    elevation: 2904,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.4,
    airlines: ['OB', 'BO'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['LPB', 'VVI', 'CBB', 'LIM', 'BOG'],
    searchKeywords: ['sucre', 'bolivia', 'constitutional capital', 'juana azurduy de padilla'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * GUYANA, SURINAME, FRENCH GUIANA AIRPORTS - Complete coverage
 */
export const GUIANAS_AIRPORTS: SouthAmericaAirport[] = [
  // Georgetown Cheddi Jagan International Airport
  {
    iataCode: 'GEO',
    icaoCode: 'SYCJ',
    name: 'Cheddi Jagan International Airport',
    city: 'Georgetown',
    state: 'Demerara-Mahaica',
    stateCode: 'DE',
    region: 'Coast',
    country: 'Guyana',
    countryCode: 'GY',
    timezone: 'America/Guyana',
    coordinates: { latitude: 6.4985, longitude: -58.2542 },
    elevation: 29,
    category: 'regional',
    isInternational: true,
    passengerCount: 0.5,
    airlines: ['BW', 'JY', 'B6', 'CA', 'SU'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['PBM', 'CAY', 'BGI', 'POS', 'JFK', 'MIA', 'YYZ', 'LHR'],
    searchKeywords: ['georgetown', 'guyana', 'cheddi jagan', 'timehri'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Paramaribo Johan Adolf Pengel International Airport
  {
    iataCode: 'PBM',
    icaoCode: 'SMJP',
    name: 'Johan Adolf Pengel International Airport',
    city: 'Paramaribo',
    state: 'Para',
    stateCode: 'PR',
    region: 'Coast',
    country: 'Suriname',
    countryCode: 'SR',
    timezone: 'America/Paramaribo',
    coordinates: { latitude: 5.4528, longitude: -55.1878 },
    elevation: 18,
    category: 'regional',
    isInternational: true,
    passengerCount: 0.4,
    airlines: ['PY', 'SLM', 'KL', 'SU', 'CA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GEO', 'CAY', 'AMS', 'MIA', 'BGI', 'POS', 'BEL', 'CUR'],
    searchKeywords: ['paramaribo', 'suriname', 'johan adolf pengel', 'zanderij'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Cayenne Félix Eboué Airport
  {
    iataCode: 'CAY',
    icaoCode: 'SOCA',
    name: 'Félix Eboué Airport',
    city: 'Cayenne',
    state: 'French Guiana',
    stateCode: 'GF',
    region: 'Coast',
    country: 'French Guiana',
    countryCode: 'GF',
    timezone: 'America/Cayenne',
    coordinates: { latitude: 4.8198, longitude: -52.3604 },
    elevation: 9,
    category: 'regional',
    isInternational: true,
    passengerCount: 0.6,
    airlines: ['AF', 'TX', 'S4'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['ORY', 'PBM', 'GEO', 'FDF', 'PTP', 'BGI', 'POS', 'MIA'],
    searchKeywords: ['cayenne', 'french guiana', 'felix eboue', 'rochambeau'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * COMPLETE SOUTH AMERICA AIRPORTS DATABASE
 */
export const SOUTH_AMERICA_AIRPORTS_DATABASE: SouthAmericaAirport[] = [
  ...ARGENTINA_AIRPORTS,
  ...COLOMBIA_AIRPORTS,
  ...PERU_AIRPORTS,
  ...CHILE_AIRPORTS,
  ...ECUADOR_AIRPORTS,
  ...VENEZUELA_AIRPORTS,
  ...URUGUAY_AIRPORTS,
  ...PARAGUAY_AIRPORTS,
  ...BOLIVIA_AIRPORTS,
  ...GUIANAS_AIRPORTS
];

/**
 * POPULAR SOUTH AMERICAN ROUTES - Common city pairs for quick suggestions
 */
export const POPULAR_SOUTH_AMERICA_ROUTES = [
  { from: 'GRU', to: 'EZE', route: 'São Paulo → Buenos Aires', popularity: 95 },
  { from: 'EZE', to: 'GRU', route: 'Buenos Aires → São Paulo', popularity: 95 },
  { from: 'SCL', to: 'LIM', route: 'Santiago → Lima', popularity: 90 },
  { from: 'BOG', to: 'LIM', route: 'Bogotá → Lima', popularity: 88 },
  { from: 'GRU', to: 'SCL', route: 'São Paulo → Santiago', popularity: 85 },
  { from: 'LIM', to: 'BOG', route: 'Lima → Bogotá', popularity: 83 },
  { from: 'UIO', to: 'BOG', route: 'Quito → Bogotá', popularity: 82 },
  { from: 'EZE', to: 'SCL', route: 'Buenos Aires → Santiago', popularity: 80 },
  { from: 'GIG', to: 'EZE', route: 'Rio de Janeiro → Buenos Aires', popularity: 78 },
  { from: 'CCS', to: 'BOG', route: 'Caracas → Bogotá', popularity: 75 }
];

/**
 * SOUTH AMERICAN TIMEZONE MAPPING
 */
export const SOUTH_AMERICA_TIMEZONE_MAP = {
  'America/Argentina/Buenos_Aires': 'Argentina Time (ART)',
  'America/Argentina/Cordoba': 'Argentina Time (ART)',
  'America/Argentina/Mendoza': 'Argentina Time (ART)',
  'America/Argentina/Salta': 'Argentina Time (ART)',
  'America/Argentina/Ushuaia': 'Argentina Time (ART)',
  'America/Bogota': 'Colombia Time (COT)',
  'America/Lima': 'Peru Time (PET)',
  'America/Santiago': 'Chile Time (CLT/CLST)',
  'America/Punta_Arenas': 'Chile Time (CLT/CLST)',
  'Pacific/Easter': 'Easter Island Time (EAST/EASST)',
  'America/Guayaquil': 'Ecuador Time (ECT)',
  'Pacific/Galapagos': 'Galápagos Time (GALT)',
  'America/Caracas': 'Venezuela Time (VET)',
  'America/Montevideo': 'Uruguay Time (UYT/UYST)',
  'America/Asuncion': 'Paraguay Time (PYT/PYST)',
  'America/La_Paz': 'Bolivia Time (BOT)',
  'America/Guyana': 'Guyana Time (GYT)',
  'America/Paramaribo': 'Suriname Time (SRT)',
  'America/Cayenne': 'French Guiana Time (GFT)'
};

/**
 * SOUTH AMERICAN REGIONS MAPPING
 */
export const SOUTH_AMERICA_REGIONS = {
  'Argentina': ['Pampas', 'Central', 'Cuyo', 'Patagonia', 'Northeast', 'Northwest'],
  'Colombia': ['Andina', 'Caribe', 'Pacífica', 'Orinoquía', 'Amazonía'],
  'Peru': ['Costa', 'Sierra', 'Selva'],
  'Chile': ['North', 'Central', 'South', 'Patagonia', 'Insular'],
  'Ecuador': ['Costa', 'Sierra', 'Oriente', 'Insular'],
  'Venezuela': ['Capital', 'Central', 'Occidental', 'Oriental', 'Guayana'],
  'Uruguay': ['Sur', 'Este', 'Centro', 'Norte'],
  'Paraguay': ['Oriental', 'Occidental'],
  'Bolivia': ['Altiplano', 'Valles', 'Llanos'],
  'Brazil': ['Southeast', 'South', 'Northeast', 'North', 'Center-West'],
  'Guyana': ['Coast', 'Interior'],
  'Suriname': ['Coast', 'Interior'],
  'French Guiana': ['Coast', 'Interior']
};

/**
 * AIRPORT SEARCH INDEX - Optimized for fast searching
 */
export const createSouthAmericaAirportSearchIndex = () => {
  const searchIndex = new Map<string, SouthAmericaAirport[]>();
  
  SOUTH_AMERICA_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    const iataKey = airport.iataCode.toLowerCase();
    if (!searchIndex.has(iataKey)) searchIndex.set(iataKey, []);
    searchIndex.get(iataKey)!.push(airport);
    
    // Index by city
    const cityKey = airport.city.toLowerCase();
    if (!searchIndex.has(cityKey)) searchIndex.set(cityKey, []);
    searchIndex.get(cityKey)!.push(airport);
    
    // Index by country
    const countryKey = airport.country.toLowerCase();
    if (!searchIndex.has(countryKey)) searchIndex.set(countryKey, []);
    searchIndex.get(countryKey)!.push(airport);
    
    // Index by search keywords
    airport.searchKeywords.forEach(keyword => {
      const keywordKey = keyword.toLowerCase();
      if (!searchIndex.has(keywordKey)) searchIndex.set(keywordKey, []);
      searchIndex.get(keywordKey)!.push(airport);
    });
    
    // Index by partial matches
    const nameParts = airport.name.toLowerCase().split(' ');
    nameParts.forEach(part => {
      if (part.length > 2) {
        if (!searchIndex.has(part)) searchIndex.set(part, []);
        searchIndex.get(part)!.push(airport);
      }
    });
  });
  
  return searchIndex;
};