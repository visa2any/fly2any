/**
 * 🌺 OCEANIA AIRPORTS DATABASE
 * Comprehensive database of major Oceania airports with complete metadata
 * Covers Australia, New Zealand, Pacific Islands, Papua New Guinea, Fiji
 */

export interface OceaniaAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  country: 'Australia' | 'New Zealand' | 'Papua New Guinea' | 'Fiji' | 'New Caledonia' |
           'Vanuatu' | 'Solomon Islands' | 'Samoa' | 'Tonga' | 'Cook Islands' |
           'French Polynesia' | 'Palau' | 'Marshall Islands' | 'Micronesia' | 'Kiribati' |
           'Nauru' | 'Tuvalu' | 'American Samoa' | 'Guam' | 'Northern Mariana Islands';
  countryCode: string;
  region: 'Australia & New Zealand' | 'Melanesia' | 'Polynesia' | 'Micronesia';
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevation: number;
  runways: number;
  terminals: number;
  passengerCount: number; // millions per year
  cargoTonnage: number; // thousands of tons per year
  isInternational: boolean;
  category: 'major_hub' | 'hub' | 'international_gateway' | 'regional' | 'small_hub';
  primaryLanguages: string[];
  currency: string;
  searchKeywords: string[];
  popularDestinations: string[];
  airlinesCount: number;
  hasMetroConnection: boolean;
  distanceToCity: number; // km
}

export const OCEANIA_AIRPORTS_DATABASE: OceaniaAirport[] = [
  // AUSTRALIA - Major Hubs
  {
    iataCode: 'SYD',
    icaoCode: 'YSSY',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Sydney',
    coordinates: { latitude: -33.9399, longitude: 151.1753 },
    elevation: 6,
    runways: 3,
    terminals: 3,
    passengerCount: 44.4,
    cargoTonnage: 715,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Sydney', 'SYD', 'Australia', 'Kingsford Smith', 'Mascot'],
    popularDestinations: ['LAX', 'LHR', 'SIN', 'HKG', 'NRT', 'DXB', 'MEL'],
    airlinesCount: 78,
    hasMetroConnection: true,
    distanceToCity: 8
  },
  {
    iataCode: 'MEL',
    icaoCode: 'YMML',
    name: 'Melbourne Airport',
    city: 'Melbourne',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Melbourne',
    coordinates: { latitude: -37.6733, longitude: 144.8430 },
    elevation: 132,
    runways: 2,
    terminals: 4,
    passengerCount: 37.7,
    cargoTonnage: 432,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Melbourne', 'MEL', 'Australia', 'Tullamarine'],
    popularDestinations: ['LAX', 'LHR', 'SIN', 'HKG', 'NRT', 'DXB', 'SYD'],
    airlinesCount: 65,
    hasMetroConnection: false,
    distanceToCity: 23
  },
  {
    iataCode: 'BNE',
    icaoCode: 'YBBN',
    name: 'Brisbane Airport',
    city: 'Brisbane',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Brisbane',
    coordinates: { latitude: -27.3942, longitude: 153.1218 },
    elevation: 4,
    runways: 2,
    terminals: 2,
    passengerCount: 24.0,
    cargoTonnage: 185,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Brisbane', 'BNE', 'Australia', 'Queensland'],
    popularDestinations: ['LAX', 'SIN', 'HKG', 'NRT', 'DXB', 'SYD', 'MEL'],
    airlinesCount: 54,
    hasMetroConnection: true,
    distanceToCity: 15
  },
  {
    iataCode: 'PER',
    icaoCode: 'YPPH',
    name: 'Perth Airport',
    city: 'Perth',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Perth',
    coordinates: { latitude: -31.9403, longitude: 115.9669 },
    elevation: 20,
    runways: 3,
    terminals: 4,
    passengerCount: 15.7,
    cargoTonnage: 167,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Perth', 'PER', 'Australia', 'Western Australia'],
    popularDestinations: ['SIN', 'KUL', 'DXB', 'DOH', 'HKG', 'CGK', 'SYD'],
    airlinesCount: 43,
    hasMetroConnection: false,
    distanceToCity: 12
  },
  {
    iataCode: 'ADL',
    icaoCode: 'YPAD',
    name: 'Adelaide Airport',
    city: 'Adelaide',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Adelaide',
    coordinates: { latitude: -34.9455, longitude: 138.5307 },
    elevation: 6,
    runways: 2,
    terminals: 1,
    passengerCount: 8.7,
    cargoTonnage: 74,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Adelaide', 'ADL', 'Australia', 'South Australia'],
    popularDestinations: ['SIN', 'KUL', 'DXB', 'SYD', 'MEL', 'BNE', 'PER'],
    airlinesCount: 32,
    hasMetroConnection: false,
    distanceToCity: 7
  },
  {
    iataCode: 'DRW',
    icaoCode: 'YPDN',
    name: 'Darwin Airport',
    city: 'Darwin',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Darwin',
    coordinates: { latitude: -12.4086, longitude: 130.8770 },
    elevation: 31,
    runways: 2,
    terminals: 1,
    passengerCount: 2.2,
    cargoTonnage: 28,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Darwin', 'DRW', 'Australia', 'Northern Territory'],
    popularDestinations: ['SIN', 'DPS', 'KUL', 'SYD', 'MEL', 'BNE', 'PER'],
    airlinesCount: 18,
    hasMetroConnection: false,
    distanceToCity: 8
  },
  {
    iataCode: 'CNS',
    icaoCode: 'YBCS',
    name: 'Cairns Airport',
    city: 'Cairns',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Brisbane',
    coordinates: { latitude: -16.8758, longitude: 145.7555 },
    elevation: 3,
    runways: 2,
    terminals: 2,
    passengerCount: 5.1,
    cargoTonnage: 45,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Cairns', 'CNS', 'Australia', 'Queensland', 'Great Barrier Reef'],
    popularDestinations: ['NRT', 'SIN', 'HKG', 'NAN', 'SYD', 'MEL', 'BNE'],
    airlinesCount: 25,
    hasMetroConnection: false,
    distanceToCity: 7
  },
  {
    iataCode: 'GLD',
    icaoCode: 'YGCN',
    name: 'Gold Coast Airport',
    city: 'Gold Coast',
    country: 'Australia',
    countryCode: 'AU',
    region: 'Australia & New Zealand',
    timezone: 'Australia/Brisbane',
    coordinates: { latitude: -28.1644, longitude: 153.5052 },
    elevation: 6,
    runways: 1,
    terminals: 1,
    passengerCount: 6.8,
    cargoTonnage: 23,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English'],
    currency: 'AUD',
    searchKeywords: ['Gold Coast', 'GLD', 'Australia', 'Queensland', 'Coolangatta'],
    popularDestinations: ['NRT', 'KIX', 'SIN', 'AKL', 'SYD', 'MEL', 'BNE'],
    airlinesCount: 22,
    hasMetroConnection: true,
    distanceToCity: 25
  },

  // NEW ZEALAND - Major Hubs
  {
    iataCode: 'AKL',
    icaoCode: 'NZAA',
    name: 'Auckland Airport',
    city: 'Auckland',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Australia & New Zealand',
    timezone: 'Pacific/Auckland',
    coordinates: { latitude: -37.0082, longitude: 174.7850 },
    elevation: 7,
    runways: 2,
    terminals: 2,
    passengerCount: 21.4,
    cargoTonnage: 289,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English', 'Māori'],
    currency: 'NZD',
    searchKeywords: ['Auckland', 'AKL', 'New Zealand', 'Aotearoa'],
    popularDestinations: ['LAX', 'SYD', 'MEL', 'SIN', 'HKG', 'NRT', 'LHR'],
    airlinesCount: 67,
    hasMetroConnection: false,
    distanceToCity: 21
  },
  {
    iataCode: 'CHC',
    icaoCode: 'NZCH',
    name: 'Christchurch Airport',
    city: 'Christchurch',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Australia & New Zealand',
    timezone: 'Pacific/Auckland',
    coordinates: { latitude: -43.4894, longitude: 172.5320 },
    elevation: 37,
    runways: 2,
    terminals: 1,
    passengerCount: 7.1,
    cargoTonnage: 98,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'Māori'],
    currency: 'NZD',
    searchKeywords: ['Christchurch', 'CHC', 'New Zealand', 'Canterbury'],
    popularDestinations: ['SYD', 'MEL', 'SIN', 'DOH', 'AKL', 'WLG', 'DUD'],
    airlinesCount: 28,
    hasMetroConnection: false,
    distanceToCity: 12
  },
  {
    iataCode: 'WLG',
    icaoCode: 'NZWN',
    name: 'Wellington Airport',
    city: 'Wellington',
    country: 'New Zealand',
    countryCode: 'NZ',
    region: 'Australia & New Zealand',
    timezone: 'Pacific/Auckland',
    coordinates: { latitude: -41.3272, longitude: 174.8062 },
    elevation: 12,
    runways: 1,
    terminals: 1,
    passengerCount: 6.4,
    cargoTonnage: 34,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'Māori'],
    currency: 'NZD',
    searchKeywords: ['Wellington', 'WLG', 'New Zealand', 'Capital'],
    popularDestinations: ['SYD', 'MEL', 'SIN', 'AKL', 'CHC', 'DUD', 'BNE'],
    airlinesCount: 21,
    hasMetroConnection: false,
    distanceToCity: 8
  },

  // PACIFIC ISLANDS - Major Gateways
  {
    iataCode: 'NAN',
    icaoCode: 'NFFN',
    name: 'Nadi International Airport',
    city: 'Nadi',
    country: 'Fiji',
    countryCode: 'FJ',
    region: 'Melanesia',
    timezone: 'Pacific/Fiji',
    coordinates: { latitude: -17.7554, longitude: 177.4434 },
    elevation: 18,
    runways: 1,
    terminals: 1,
    passengerCount: 2.4,
    cargoTonnage: 18,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'Fijian', 'Hindi'],
    currency: 'FJD',
    searchKeywords: ['Nadi', 'NAN', 'Fiji', 'Viti Levu'],
    popularDestinations: ['SYD', 'MEL', 'AKL', 'LAX', 'HNL', 'NRT', 'ICN'],
    airlinesCount: 32,
    hasMetroConnection: false,
    distanceToCity: 9
  },
  {
    iataCode: 'POM',
    icaoCode: 'AYPY',
    name: 'Jacksons International Airport',
    city: 'Port Moresby',
    country: 'Papua New Guinea',
    countryCode: 'PG',
    region: 'Melanesia',
    timezone: 'Pacific/Port_Moresby',
    coordinates: { latitude: -9.4434, longitude: 147.2200 },
    elevation: 46,
    runways: 2,
    terminals: 2,
    passengerCount: 1.8,
    cargoTonnage: 34,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'Tok Pisin', 'Hiri Motu'],
    currency: 'PGK',
    searchKeywords: ['Port Moresby', 'POM', 'Papua New Guinea', 'PNG', 'Jacksons'],
    popularDestinations: ['BNE', 'SYD', 'SIN', 'MNL', 'DRW', 'CNS', 'HKG'],
    airlinesCount: 18,
    hasMetroConnection: false,
    distanceToCity: 8
  },
  {
    iataCode: 'NOU',
    icaoCode: 'NWWW',
    name: 'La Tontouta Airport',
    city: 'Noumea',
    country: 'New Caledonia',
    countryCode: 'NC',
    region: 'Melanesia',
    timezone: 'Pacific/Noumea',
    coordinates: { latitude: -22.0146, longitude: 166.2130 },
    elevation: 52,
    runways: 1,
    terminals: 1,
    passengerCount: 1.6,
    cargoTonnage: 12,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['French', 'English'],
    currency: 'XPF',
    searchKeywords: ['Noumea', 'NOU', 'New Caledonia', 'La Tontouta'],
    popularDestinations: ['SYD', 'MEL', 'BNE', 'NRT', 'CDG', 'AKL', 'VLI'],
    airlinesCount: 15,
    hasMetroConnection: false,
    distanceToCity: 52
  },
  {
    iataCode: 'VLI',
    icaoCode: 'NVVV',
    name: 'Bauerfield Airport',
    city: 'Port Vila',
    country: 'Vanuatu',
    countryCode: 'VU',
    region: 'Melanesia',
    timezone: 'Pacific/Efate',
    coordinates: { latitude: -17.6993, longitude: 168.3198 },
    elevation: 21,
    runways: 1,
    terminals: 1,
    passengerCount: 0.5,
    cargoTonnage: 3,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'French', 'Bislama'],
    currency: 'VUV',
    searchKeywords: ['Port Vila', 'VLI', 'Vanuatu', 'Bauerfield'],
    popularDestinations: ['SYD', 'BNE', 'AKL', 'NOU', 'NAN', 'HIR', 'MEL'],
    airlinesCount: 8,
    hasMetroConnection: false,
    distanceToCity: 6
  },
  {
    iataCode: 'HIR',
    icaoCode: 'AGGH',
    name: 'Henderson Field',
    city: 'Honiara',
    country: 'Solomon Islands',
    countryCode: 'SB',
    region: 'Melanesia',
    timezone: 'Pacific/Guadalcanal',
    coordinates: { latitude: -9.4280, longitude: 160.0549 },
    elevation: 8,
    runways: 1,
    terminals: 1,
    passengerCount: 0.3,
    cargoTonnage: 2,
    isInternational: true,
    category: 'small_hub',
    primaryLanguages: ['English', 'Solomon Islands Pijin'],
    currency: 'SBD',
    searchKeywords: ['Honiara', 'HIR', 'Solomon Islands', 'Henderson Field'],
    popularDestinations: ['BNE', 'SYD', 'POM', 'VLI', 'NAN', 'NOU', 'AKL'],
    airlinesCount: 6,
    hasMetroConnection: false,
    distanceToCity: 11
  },

  // POLYNESIA - Tourist Gateways
  {
    iataCode: 'PPT',
    icaoCode: 'NTAA',
    name: 'Faa\'a International Airport',
    city: 'Papeete',
    country: 'French Polynesia',
    countryCode: 'PF',
    region: 'Polynesia',
    timezone: 'Pacific/Tahiti',
    coordinates: { latitude: -17.5537, longitude: -149.6060 },
    elevation: 2,
    runways: 1,
    terminals: 1,
    passengerCount: 1.4,
    cargoTonnage: 8,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['French', 'Tahitian', 'English'],
    currency: 'XPF',
    searchKeywords: ['Papeete', 'PPT', 'Tahiti', 'French Polynesia', 'Faa\'a'],
    popularDestinations: ['LAX', 'NRT', 'AKL', 'CDG', 'HNL', 'SYD', 'ORY'],
    airlinesCount: 12,
    hasMetroConnection: false,
    distanceToCity: 5
  },
  {
    iataCode: 'APW',
    icaoCode: 'NSFA',
    name: 'Faleolo International Airport',
    city: 'Apia',
    country: 'Samoa',
    countryCode: 'WS',
    region: 'Polynesia',
    timezone: 'Pacific/Apia',
    coordinates: { latitude: -13.8300, longitude: -172.0083 },
    elevation: 16,
    runways: 1,
    terminals: 1,
    passengerCount: 0.4,
    cargoTonnage: 2,
    isInternational: true,
    category: 'small_hub',
    primaryLanguages: ['Samoan', 'English'],
    currency: 'WST',
    searchKeywords: ['Apia', 'APW', 'Samoa', 'Faleolo'],
    popularDestinations: ['AKL', 'SYD', 'HNL', 'NAN', 'PPT', 'NOU', 'BNE'],
    airlinesCount: 8,
    hasMetroConnection: false,
    distanceToCity: 40
  },
  {
    iataCode: 'TBU',
    icaoCode: 'NFTF',
    name: 'Fuaʻamotu International Airport',
    city: 'Nuku\'alofa',
    country: 'Tonga',
    countryCode: 'TO',
    region: 'Polynesia',
    timezone: 'Pacific/Tongatapu',
    coordinates: { latitude: -21.2421, longitude: -175.1496 },
    elevation: 42,
    runways: 1,
    terminals: 1,
    passengerCount: 0.2,
    cargoTonnage: 1,
    isInternational: true,
    category: 'small_hub',
    primaryLanguages: ['Tongan', 'English'],
    currency: 'TOP',
    searchKeywords: ['Nuku\'alofa', 'TBU', 'Tonga', 'Fuaʻamotu'],
    popularDestinations: ['AKL', 'SYD', 'NAN', 'APW', 'HNL', 'PPT', 'LAX'],
    airlinesCount: 4,
    hasMetroConnection: false,
    distanceToCity: 35
  },
  {
    iataCode: 'RAR',
    icaoCode: 'NCRG',
    name: 'Rarotonga International Airport',
    city: 'Avarua',
    country: 'Cook Islands',
    countryCode: 'CK',
    region: 'Polynesia',
    timezone: 'Pacific/Rarotonga',
    coordinates: { latitude: -21.2026, longitude: -159.8056 },
    elevation: 4,
    runways: 1,
    terminals: 1,
    passengerCount: 0.2,
    cargoTonnage: 1,
    isInternational: true,
    category: 'small_hub',
    primaryLanguages: ['English', 'Cook Islands Māori'],
    currency: 'NZD',
    searchKeywords: ['Rarotonga', 'RAR', 'Cook Islands', 'Avarua'],
    popularDestinations: ['AKL', 'SYD', 'LAX', 'HNL', 'PPT', 'NAN', 'TBU'],
    airlinesCount: 5,
    hasMetroConnection: false,
    distanceToCity: 2
  },

  // MICRONESIA
  {
    iataCode: 'GUM',
    icaoCode: 'PGUM',
    name: 'Antonio B. Won Pat International Airport',
    city: 'Hagåtña',
    country: 'Guam',
    countryCode: 'GU',
    region: 'Micronesia',
    timezone: 'Pacific/Guam',
    coordinates: { latitude: 13.4834, longitude: 144.7960 },
    elevation: 88,
    runways: 2,
    terminals: 1,
    passengerCount: 3.7,
    cargoTonnage: 45,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'Chamorro'],
    currency: 'USD',
    searchKeywords: ['Guam', 'GUM', 'Hagåtña', 'Antonio B. Won Pat'],
    popularDestinations: ['NRT', 'ICN', 'MNL', 'HNL', 'SPN', 'ROR', 'YAP'],
    airlinesCount: 18,
    hasMetroConnection: false,
    distanceToCity: 5
  },
  {
    iataCode: 'SPN',
    icaoCode: 'PGSN',
    name: 'Francisco C. Ada/Saipan International Airport',
    city: 'Saipan',
    country: 'Northern Mariana Islands',
    countryCode: 'MP',
    region: 'Micronesia',
    timezone: 'Pacific/Saipan',
    coordinates: { latitude: 15.1190, longitude: 145.7297 },
    elevation: 70,
    runways: 1,
    terminals: 1,
    passengerCount: 0.5,
    cargoTonnage: 3,
    isInternational: true,
    category: 'small_hub',
    primaryLanguages: ['English', 'Chamorro', 'Carolinian'],
    currency: 'USD',
    searchKeywords: ['Saipan', 'SPN', 'Northern Mariana Islands', 'Francisco C. Ada'],
    popularDestinations: ['GUM', 'NRT', 'ICN', 'MNL', 'HNL', 'ROR', 'YAP'],
    airlinesCount: 8,
    hasMetroConnection: false,
    distanceToCity: 8
  },
  {
    iataCode: 'ROR',
    icaoCode: 'PTRO',
    name: 'Palau International Airport',
    city: 'Ngerulmud',
    country: 'Palau',
    countryCode: 'PW',
    region: 'Micronesia',
    timezone: 'Pacific/Palau',
    coordinates: { latitude: 7.3673, longitude: 134.5442 },
    elevation: 87,
    runways: 1,
    terminals: 1,
    passengerCount: 0.1,
    cargoTonnage: 1,
    isInternational: true,
    category: 'small_hub',
    primaryLanguages: ['Palauan', 'English'],
    currency: 'USD',
    searchKeywords: ['Palau', 'ROR', 'Ngerulmud', 'Koror'],
    popularDestinations: ['GUM', 'MNL', 'ICN', 'NRT', 'SPN', 'YAP', 'TKK'],
    airlinesCount: 6,
    hasMetroConnection: false,
    distanceToCity: 25
  }
];

export function createOceaniaAirportSearchIndex(): Map<string, OceaniaAirport[]> {
  const index = new Map<string, OceaniaAirport[]>();
  
  OCEANIA_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    const iataKey = airport.iataCode.toLowerCase();
    if (!index.has(iataKey)) index.set(iataKey, []);
    index.get(iataKey)!.push(airport);
    
    // Index by city (normalized)
    const cityKey = airport.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!index.has(cityKey)) index.set(cityKey, []);
    index.get(cityKey)!.push(airport);
    
    // Index by country
    const countryKey = airport.country.toLowerCase();
    if (!index.has(countryKey)) index.set(countryKey, []);
    index.get(countryKey)!.push(airport);
    
    // Index by keywords
    airport.searchKeywords.forEach(keyword => {
      const keywordKey = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!index.has(keywordKey)) index.set(keywordKey, []);
      index.get(keywordKey)!.push(airport);
    });
  });
  
  return index;
}

export const OCEANIA_AIRPORTS_BY_REGION = {
  'Australia & New Zealand': OCEANIA_AIRPORTS_DATABASE.filter(a => a.region === 'Australia & New Zealand'),
  'Melanesia': OCEANIA_AIRPORTS_DATABASE.filter(a => a.region === 'Melanesia'),
  'Polynesia': OCEANIA_AIRPORTS_DATABASE.filter(a => a.region === 'Polynesia'),
  'Micronesia': OCEANIA_AIRPORTS_DATABASE.filter(a => a.region === 'Micronesia')
};

export const OCEANIA_MAJOR_HUBS = OCEANIA_AIRPORTS_DATABASE.filter(
  airport => airport.category === 'major_hub'
);

export const OCEANIA_INTERNATIONAL_GATEWAYS = OCEANIA_AIRPORTS_DATABASE.filter(
  airport => airport.isInternational && ['major_hub', 'hub', 'international_gateway'].includes(airport.category)
);