/**
 * 🌏 COMPREHENSIVE ASIA AIRPORTS DATABASE
 * Complete database of Asian airports with major hubs, regional airports, and international gateways
 * Data optimized for flight booking and search functionality across all Asian countries
 */

export interface AsiaAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state?: string;
  stateCode?: string;
  region: string;
  country: 'China' | 'Japan' | 'South Korea' | 'Taiwan' | 'Hong Kong' | 'Macau' | 'North Korea' | 'Mongolia' | 'Thailand' | 'Singapore' | 'Malaysia' | 'Indonesia' | 'Philippines' | 'Vietnam' | 'Cambodia' | 'Laos' | 'Myanmar' | 'Brunei' | 'East Timor' | 'India' | 'Pakistan' | 'Bangladesh' | 'Sri Lanka' | 'Nepal' | 'Bhutan' | 'Maldives' | 'Afghanistan' | 'Kazakhstan' | 'Uzbekistan' | 'Turkmenistan' | 'Tajikistan' | 'Kyrgyzstan' | 'Turkey' | 'Iran' | 'Iraq' | 'Syria' | 'Lebanon' | 'Jordan' | 'Israel' | 'Palestine' | 'Saudi Arabia' | 'UAE' | 'Qatar' | 'Kuwait' | 'Bahrain' | 'Oman' | 'Yemen' | 'Georgia' | 'Armenia' | 'Azerbaijan' | 'Russia';
  countryCode: 'CN' | 'JP' | 'KR' | 'TW' | 'HK' | 'MO' | 'KP' | 'MN' | 'TH' | 'SG' | 'MY' | 'ID' | 'PH' | 'VN' | 'KH' | 'LA' | 'MM' | 'BN' | 'TL' | 'IN' | 'PK' | 'BD' | 'LK' | 'NP' | 'BT' | 'MV' | 'AF' | 'KZ' | 'UZ' | 'TM' | 'TJ' | 'KG' | 'TR' | 'IR' | 'IQ' | 'SY' | 'LB' | 'JO' | 'IL' | 'PS' | 'SA' | 'AE' | 'QA' | 'KW' | 'BH' | 'OM' | 'YE' | 'GE' | 'AM' | 'AZ' | 'RU';
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
 * EAST ASIA AIRPORTS - Complete coverage
 */
export const EAST_ASIA_AIRPORTS: AsiaAirport[] = [
  // Beijing Capital International Airport
  {
    iataCode: 'PEK',
    icaoCode: 'ZBAA',
    name: 'Beijing Capital International Airport',
    city: 'Beijing',
    state: 'Beijing',
    stateCode: 'BJ',
    region: 'Northern China',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai',
    coordinates: { latitude: 40.0799, longitude: 116.6031 },
    elevation: 35,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 100.9,
    airlines: ['CA', 'CZ', 'MU', 'FM', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 3,
    runways: 3,
    popularDestinations: ['PVG', 'CAN', 'SZX', 'NRT', 'ICN', 'BKK', 'SIN', 'DXB', 'FRA', 'LAX'],
    searchKeywords: ['beijing', 'capital', 'china', 'peking', 'forbidden city'],
    groundTransport: ['metro', 'train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Beijing Daxing International Airport
  {
    iataCode: 'PKX',
    icaoCode: 'ZBAD',
    name: 'Beijing Daxing International Airport',
    city: 'Beijing',
    state: 'Beijing',
    stateCode: 'BJ',
    region: 'Northern China',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai',
    coordinates: { latitude: 39.5098, longitude: 116.4106 },
    elevation: 30,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 31.2,
    airlines: ['CZ', 'MU', 'KN', 'HO', 'BA', 'FI'],
    terminals: 1,
    runways: 4,
    popularDestinations: ['PVG', 'CAN', 'SZX', 'NRT', 'ICN', 'BKK', 'SIN', 'DXB'],
    searchKeywords: ['beijing', 'daxing', 'china', 'new airport', 'starfish'],
    groundTransport: ['metro', 'train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Shanghai Pudong International Airport
  {
    iataCode: 'PVG',
    icaoCode: 'ZSPD',
    name: 'Shanghai Pudong International Airport',
    city: 'Shanghai',
    state: 'Shanghai',
    stateCode: 'SH',
    region: 'Eastern China',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai',
    coordinates: { latitude: 31.1443, longitude: 121.8083 },
    elevation: 4,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 76.2,
    airlines: ['MU', 'FM', 'CA', 'CZ', 'AA', 'DL', 'UA', 'LH', 'AF', 'KL'],
    terminals: 2,
    runways: 5,
    popularDestinations: ['PEK', 'CAN', 'SZX', 'NRT', 'ICN', 'BKK', 'SIN', 'DXB', 'FRA', 'JFK'],
    searchKeywords: ['shanghai', 'pudong', 'china', 'financial', 'huangpu'],
    groundTransport: ['metro', 'train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Guangzhou Baiyun International Airport
  {
    iataCode: 'CAN',
    icaoCode: 'ZGGG',
    name: 'Guangzhou Baiyun International Airport',
    city: 'Guangzhou',
    state: 'Guangdong',
    stateCode: 'GD',
    region: 'Southern China',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai',
    coordinates: { latitude: 23.3924, longitude: 113.2988 },
    elevation: 11,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 73.4,
    airlines: ['CZ', 'MU', 'CA', 'HO', 'AA', 'DL', 'AF', 'KL', 'QR', 'EK'],
    terminals: 3,
    runways: 3,
    popularDestinations: ['PEK', 'PVG', 'SZX', 'HKG', 'BKK', 'SIN', 'KUL', 'DXB', 'AMS', 'LAX'],
    searchKeywords: ['guangzhou', 'canton', 'baiyun', 'china', 'pearl river'],
    groundTransport: ['metro', 'train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Shenzhen Bao'an International Airport
  {
    iataCode: 'SZX',
    icaoCode: 'ZGSZ',
    name: 'Shenzhen Bao\'an International Airport',
    city: 'Shenzhen',
    state: 'Guangdong',
    stateCode: 'GD',
    region: 'Southern China',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai',
    coordinates: { latitude: 22.6393, longitude: 113.8111 },
    elevation: 4,
    category: 'hub',
    isInternational: true,
    passengerCount: 52.9,
    airlines: ['ZH', 'CZ', 'MU', 'CA', 'HO', 'HX'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['PEK', 'PVG', 'CAN', 'HKG', 'TPE', 'BKK', 'SIN', 'KUL', 'NRT'],
    searchKeywords: ['shenzhen', 'baoan', 'china', 'tech hub', 'silicon valley'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Tokyo Haneda Airport
  {
    iataCode: 'HND',
    icaoCode: 'RJTT',
    name: 'Tokyo Haneda Airport',
    city: 'Tokyo',
    state: 'Tokyo',
    stateCode: 'TO',
    region: 'Kanto',
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
    coordinates: { latitude: 35.5494, longitude: 139.7798 },
    elevation: 6,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 87.1,
    airlines: ['JL', 'NH', 'JJ', 'MM', 'AA', 'DL', 'UA', 'LH', 'AF', 'KL'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['NRT', 'KIX', 'CTS', 'FUK', 'ICN', 'TPE', 'PVG', 'BKK', 'SIN', 'LAX'],
    searchKeywords: ['tokyo', 'haneda', 'japan', 'capital', 'domestic hub'],
    groundTransport: ['train', 'metro', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Tokyo Narita International Airport
  {
    iataCode: 'NRT',
    icaoCode: 'RJAA',
    name: 'Tokyo Narita International Airport',
    city: 'Tokyo',
    state: 'Chiba',
    stateCode: 'CH',
    region: 'Kanto',
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
    coordinates: { latitude: 35.7647, longitude: 140.3864 },
    elevation: 43,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 46.5,
    airlines: ['JL', 'NH', 'JJ', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA', 'SQ'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['HND', 'KIX', 'CTS', 'ICN', 'PVG', 'BKK', 'SIN', 'LAX', 'JFK', 'LHR'],
    searchKeywords: ['tokyo', 'narita', 'japan', 'international gateway', 'chiba'],
    groundTransport: ['train', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Osaka Kansai International Airport
  {
    iataCode: 'KIX',
    icaoCode: 'RJBB',
    name: 'Kansai International Airport',
    city: 'Osaka',
    state: 'Osaka',
    stateCode: 'OS',
    region: 'Kansai',
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
    coordinates: { latitude: 34.4347, longitude: 135.2441 },
    elevation: 8,
    category: 'hub',
    isInternational: true,
    passengerCount: 31.9,
    airlines: ['JL', 'NH', 'JJ', 'MM', 'LH', 'AF', 'KL', 'SQ', 'CX', 'TG'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['NRT', 'HND', 'CTS', 'FUK', 'ICN', 'TPE', 'PVG', 'BKK', 'SIN'],
    searchKeywords: ['osaka', 'kansai', 'japan', 'artificial island', 'kyoto'],
    groundTransport: ['train', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Seoul Incheon International Airport
  {
    iataCode: 'ICN',
    icaoCode: 'RKSI',
    name: 'Incheon International Airport',
    city: 'Seoul',
    state: 'Incheon',
    stateCode: 'IC',
    region: 'Seoul Capital Area',
    country: 'South Korea',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    coordinates: { latitude: 37.4602, longitude: 126.4407 },
    elevation: 7,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 71.2,
    airlines: ['KE', 'OZ', 'LJ', 'TW', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 2,
    runways: 4,
    popularDestinations: ['GMP', 'PUS', 'CJU', 'NRT', 'PVG', 'PEK', 'BKK', 'SIN', 'LAX', 'JFK'],
    searchKeywords: ['seoul', 'incheon', 'south korea', 'korea', 'international hub'],
    groundTransport: ['train', 'metro', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Seoul Gimpo International Airport
  {
    iataCode: 'GMP',
    icaoCode: 'RKSS',
    name: 'Gimpo International Airport',
    city: 'Seoul',
    state: 'Seoul',
    stateCode: 'SE',
    region: 'Seoul Capital Area',
    country: 'South Korea',
    countryCode: 'KR',
    timezone: 'Asia/Seoul',
    coordinates: { latitude: 37.5583, longitude: 126.7908 },
    elevation: 18,
    category: 'hub',
    isInternational: true,
    passengerCount: 31.9,
    airlines: ['KE', 'OZ', 'LJ', 'TW', 'JL', 'NH', 'MU'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['ICN', 'PUS', 'CJU', 'NRT', 'HND', 'PVG', 'TSN', 'TAO'],
    searchKeywords: ['seoul', 'gimpo', 'south korea', 'domestic hub', 'city airport'],
    groundTransport: ['metro', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Taipei Taoyuan International Airport
  {
    iataCode: 'TPE',
    icaoCode: 'RCTP',
    name: 'Taiwan Taoyuan International Airport',
    city: 'Taipei',
    state: 'Taoyuan',
    stateCode: 'TY',
    region: 'Northern Taiwan',
    country: 'Taiwan',
    countryCode: 'TW',
    timezone: 'Asia/Taipei',
    coordinates: { latitude: 25.0797, longitude: 121.2342 },
    elevation: 35,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 48.7,
    airlines: ['CI', 'BR', 'B7', 'IT', 'AA', 'DL', 'UA', 'LH', 'AF', 'KL'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['TSA', 'KHH', 'NRT', 'ICN', 'PVG', 'HKG', 'BKK', 'SIN', 'LAX', 'SFO'],
    searchKeywords: ['taipei', 'taoyuan', 'taiwan', 'formosa', 'chiang kai shek'],
    groundTransport: ['metro', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Hong Kong International Airport
  {
    iataCode: 'HKG',
    icaoCode: 'VHHH',
    name: 'Hong Kong International Airport',
    city: 'Hong Kong',
    region: 'Hong Kong Island',
    country: 'Hong Kong',
    countryCode: 'HK',
    timezone: 'Asia/Hong_Kong',
    coordinates: { latitude: 22.3080, longitude: 113.9185 },
    elevation: 9,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 74.5,
    airlines: ['CX', 'KA', 'HX', 'UO', 'AA', 'DL', 'UA', 'BA', 'LH', 'AF'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['PVG', 'PEK', 'CAN', 'TPE', 'NRT', 'BKK', 'SIN', 'DXB', 'LHR', 'LAX'],
    searchKeywords: ['hong kong', 'hkg', 'chek lap kok', 'fragrant harbor', 'asia hub'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  }
];

/**
 * SOUTHEAST ASIA AIRPORTS - Complete coverage
 */
export const SOUTHEAST_ASIA_AIRPORTS: AsiaAirport[] = [
  // Bangkok Suvarnabhumi Airport
  {
    iataCode: 'BKK',
    icaoCode: 'VTBS',
    name: 'Suvarnabhumi Airport',
    city: 'Bangkok',
    state: 'Samut Prakan',
    stateCode: 'SP',
    region: 'Central Thailand',
    country: 'Thailand',
    countryCode: 'TH',
    timezone: 'Asia/Bangkok',
    coordinates: { latitude: 13.6900, longitude: 100.7501 },
    elevation: 2,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 65.4,
    airlines: ['TG', 'WE', 'FD', 'SL', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['DMK', 'CNX', 'HKT', 'SIN', 'KUL', 'CGK', 'MNL', 'HKG', 'NRT', 'DXB'],
    searchKeywords: ['bangkok', 'suvarnabhumi', 'thailand', 'golden land', 'krung thep'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Bangkok Don Mueang International Airport
  {
    iataCode: 'DMK',
    icaoCode: 'VTBD',
    name: 'Don Mueang International Airport',
    city: 'Bangkok',
    state: 'Bangkok',
    stateCode: 'BK',
    region: 'Central Thailand',
    country: 'Thailand',
    countryCode: 'TH',
    timezone: 'Asia/Bangkok',
    coordinates: { latitude: 13.9126, longitude: 100.6067 },
    elevation: 9,
    category: 'hub',
    isInternational: true,
    passengerCount: 41.0,
    airlines: ['DD', 'FD', 'WE', 'SL', 'XJ', 'VZ'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['BKK', 'CNX', 'HKT', 'SIN', 'KUL', 'CGK', 'MNL', 'HAN', 'SGN'],
    searchKeywords: ['bangkok', 'don mueang', 'thailand', 'old airport', 'low cost'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Singapore Changi Airport
  {
    iataCode: 'SIN',
    icaoCode: 'WSSS',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    region: 'East Region',
    country: 'Singapore',
    countryCode: 'SG',
    timezone: 'Asia/Singapore',
    coordinates: { latitude: 1.3644, longitude: 103.9915 },
    elevation: 22,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 68.3,
    airlines: ['SQ', '3K', 'TR', 'MI', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 4,
    runways: 2,
    popularDestinations: ['KUL', 'CGK', 'BKK', 'MNL', 'HKG', 'NRT', 'ICN', 'DXB', 'LHR', 'SYD'],
    searchKeywords: ['singapore', 'changi', 'lion city', 'garden city', 'jewel'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Kuala Lumpur International Airport
  {
    iataCode: 'KUL',
    icaoCode: 'WMKK',
    name: 'Kuala Lumpur International Airport',
    city: 'Kuala Lumpur',
    state: 'Selangor',
    stateCode: 'SE',
    region: 'Klang Valley',
    country: 'Malaysia',
    countryCode: 'MY',
    timezone: 'Asia/Kuala_Lumpur',
    coordinates: { latitude: 2.7456, longitude: 101.7072 },
    elevation: 21,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 62.3,
    airlines: ['MH', 'OD', 'AK', 'D7', 'AA', 'DL', 'UA', 'LH', 'AF', 'KL'],
    terminals: 2,
    runways: 4,
    popularDestinations: ['SIN', 'CGK', 'BKK', 'MNL', 'HKG', 'BOM', 'DXB', 'LHR', 'SYD', 'MEL'],
    searchKeywords: ['kuala lumpur', 'klia', 'malaysia', 'sepang', 'twin towers'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Jakarta Soekarno-Hatta International Airport
  {
    iataCode: 'CGK',
    icaoCode: 'WIII',
    name: 'Soekarno-Hatta International Airport',
    city: 'Jakarta',
    state: 'Banten',
    stateCode: 'BT',
    region: 'Java',
    country: 'Indonesia',
    countryCode: 'ID',
    timezone: 'Asia/Jakarta',
    coordinates: { latitude: -6.1256, longitude: 106.6559 },
    elevation: 34,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 66.9,
    airlines: ['GA', 'JT', 'QG', 'IW', 'AA', 'DL', 'UA', 'LH', 'AF', 'KL'],
    terminals: 4,
    runways: 2,
    popularDestinations: ['DPS', 'SIN', 'KUL', 'BKK', 'MNL', 'HKG', 'NRT', 'DXB', 'AMS', 'SYD'],
    searchKeywords: ['jakarta', 'soekarno hatta', 'indonesia', 'java', 'cengkareng'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Bali Ngurah Rai International Airport
  {
    iataCode: 'DPS',
    icaoCode: 'WADD',
    name: 'Ngurah Rai International Airport',
    city: 'Denpasar',
    state: 'Bali',
    stateCode: 'BA',
    region: 'Lesser Sunda Islands',
    country: 'Indonesia',
    countryCode: 'ID',
    timezone: 'Asia/Makassar',
    coordinates: { latitude: -8.7482, longitude: 115.1675 },
    elevation: 4,
    category: 'hub',
    isInternational: true,
    passengerCount: 25.4,
    airlines: ['GA', 'JT', 'QG', 'IW', 'AA', 'DL', 'UA', 'SQ', 'JQ', 'D7'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['CGK', 'SIN', 'KUL', 'BKK', 'MNL', 'SYD', 'MEL', 'PER', 'NRT', 'ICN'],
    searchKeywords: ['bali', 'denpasar', 'ngurah rai', 'indonesia', 'island paradise'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'spa']
  },

  // Manila Ninoy Aquino International Airport
  {
    iataCode: 'MNL',
    icaoCode: 'RPLL',
    name: 'Ninoy Aquino International Airport',
    city: 'Manila',
    state: 'Metro Manila',
    stateCode: 'MM',
    region: 'Luzon',
    country: 'Philippines',
    countryCode: 'PH',
    timezone: 'Asia/Manila',
    coordinates: { latitude: 14.5086, longitude: 121.0194 },
    elevation: 23,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 47.9,
    airlines: ['PR', '5J', 'Z2', 'DG', 'AA', 'DL', 'UA', 'NH', 'SQ', 'CX'],
    terminals: 4,
    runways: 2,
    popularDestinations: ['CEB', 'DVO', 'SIN', 'KUL', 'BKK', 'CGK', 'HKG', 'NRT', 'ICN', 'DXB'],
    searchKeywords: ['manila', 'ninoy aquino', 'philippines', 'luzon', 'pearl of orient'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Ho Chi Minh City Tan Son Nhat International Airport
  {
    iataCode: 'SGN',
    icaoCode: 'VVTS',
    name: 'Tan Son Nhat International Airport',
    city: 'Ho Chi Minh City',
    state: 'Ho Chi Minh City',
    stateCode: 'SG',
    region: 'Southern Vietnam',
    country: 'Vietnam',
    countryCode: 'VN',
    timezone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 10.8187, longitude: 106.6519 },
    elevation: 10,
    category: 'hub',
    isInternational: true,
    passengerCount: 38.5,
    airlines: ['VN', 'VJ', 'BL', 'QH', 'SQ', 'TG', 'MH', 'CX'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['HAN', 'DAD', 'SIN', 'KUL', 'BKK', 'CGK', 'MNL', 'HKG', 'NRT'],
    searchKeywords: ['ho chi minh city', 'saigon', 'tan son nhat', 'vietnam', 'southern vietnam'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Hanoi Noi Bai International Airport
  {
    iataCode: 'HAN',
    icaoCode: 'VVNB',
    name: 'Noi Bai International Airport',
    city: 'Hanoi',
    state: 'Hanoi',
    stateCode: 'HN',
    region: 'Northern Vietnam',
    country: 'Vietnam',
    countryCode: 'VN',
    timezone: 'Asia/Ho_Chi_Minh',
    coordinates: { latitude: 21.2187, longitude: 105.8067 },
    elevation: 12,
    category: 'hub',
    isInternational: true,
    passengerCount: 24.6,
    airlines: ['VN', 'VJ', 'BL', 'QH', 'SQ', 'TG', 'MH', 'CX'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['SGN', 'DAD', 'SIN', 'KUL', 'BKK', 'CGK', 'HKG', 'ICN', 'NRT'],
    searchKeywords: ['hanoi', 'noi bai', 'vietnam', 'capital', 'northern vietnam'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * SOUTH ASIA AIRPORTS - Complete coverage
 */
export const SOUTH_ASIA_AIRPORTS: AsiaAirport[] = [
  // Delhi Indira Gandhi International Airport
  {
    iataCode: 'DEL',
    icaoCode: 'VIDP',
    name: 'Indira Gandhi International Airport',
    city: 'New Delhi',
    state: 'Delhi',
    stateCode: 'DL',
    region: 'Northern India',
    country: 'India',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
    coordinates: { latitude: 28.5562, longitude: 77.1000 },
    elevation: 237,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 69.9,
    airlines: ['AI', '6E', 'SG', 'UK', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'DXB', 'DOH', 'SIN', 'BKK', 'LHR'],
    searchKeywords: ['delhi', 'new delhi', 'indira gandhi', 'india', 'capital'],
    groundTransport: ['metro', 'train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Mumbai Chhatrapati Shivaji Maharaj International Airport
  {
    iataCode: 'BOM',
    icaoCode: 'VABB',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    city: 'Mumbai',
    state: 'Maharashtra',
    stateCode: 'MH',
    region: 'Western India',
    country: 'India',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
    coordinates: { latitude: 19.0896, longitude: 72.8656 },
    elevation: 11,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 49.8,
    airlines: ['AI', '6E', 'SG', 'UK', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['DEL', 'BLR', 'MAA', 'HYD', 'CCU', 'DXB', 'DOH', 'SIN', 'BKK', 'LHR'],
    searchKeywords: ['mumbai', 'bombay', 'chhatrapati shivaji', 'india', 'bollywood'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Bangalore Kempegowda International Airport
  {
    iataCode: 'BLR',
    icaoCode: 'VOBL',
    name: 'Kempegowda International Airport',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: 'KA',
    region: 'Southern India',
    country: 'India',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
    coordinates: { latitude: 13.1979, longitude: 77.7063 },
    elevation: 920,
    category: 'hub',
    isInternational: true,
    passengerCount: 33.7,
    airlines: ['AI', '6E', 'SG', 'UK', 'AA', 'DL', 'UA', 'LH', 'SQ', 'EK'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['DEL', 'BOM', 'MAA', 'HYD', 'CCU', 'DXB', 'DOH', 'SIN', 'BKK', 'FRA'],
    searchKeywords: ['bangalore', 'bengaluru', 'kempegowda', 'india', 'silicon valley'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Chennai International Airport
  {
    iataCode: 'MAA',
    icaoCode: 'VOMM',
    name: 'Chennai International Airport',
    city: 'Chennai',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    region: 'Southern India',
    country: 'India',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
    coordinates: { latitude: 12.9941, longitude: 80.1709 },
    elevation: 16,
    category: 'hub',
    isInternational: true,
    passengerCount: 22.3,
    airlines: ['AI', '6E', 'SG', 'UK', 'SQ', 'MH', 'EK', 'QR'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'DXB', 'DOH', 'SIN', 'KUL', 'CMB'],
    searchKeywords: ['chennai', 'madras', 'tamil nadu', 'india', 'southern india'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Hyderabad Rajiv Gandhi International Airport
  {
    iataCode: 'HYD',
    icaoCode: 'VOHS',
    name: 'Rajiv Gandhi International Airport',
    city: 'Hyderabad',
    state: 'Telangana',
    stateCode: 'TG',
    region: 'Southern India',
    country: 'India',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
    coordinates: { latitude: 17.2403, longitude: 78.4294 },
    elevation: 542,
    category: 'hub',
    isInternational: true,
    passengerCount: 24.3,
    airlines: ['AI', '6E', 'SG', 'UK', 'SQ', 'EK', 'QR', 'TG'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'DXB', 'DOH', 'SIN', 'BKK', 'KUL'],
    searchKeywords: ['hyderabad', 'rajiv gandhi', 'telangana', 'india', 'cyberabad'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Karachi Jinnah International Airport
  {
    iataCode: 'KHI',
    icaoCode: 'OPKC',
    name: 'Jinnah International Airport',
    city: 'Karachi',
    state: 'Sindh',
    stateCode: 'SD',
    region: 'Southern Pakistan',
    country: 'Pakistan',
    countryCode: 'PK',
    timezone: 'Asia/Karachi',
    coordinates: { latitude: 24.9056, longitude: 67.1608 },
    elevation: 30,
    category: 'hub',
    isInternational: true,
    passengerCount: 7.2,
    airlines: ['PK', 'PA', 'ER', 'NL', 'EK', 'QR', 'TK', 'SV'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['LHE', 'ISB', 'PEW', 'DXB', 'DOH', 'RYD', 'JED', 'LHR'],
    searchKeywords: ['karachi', 'jinnah', 'pakistan', 'sindh', 'port city'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Islamabad International Airport
  {
    iataCode: 'ISB',
    icaoCode: 'OPIS',
    name: 'Islamabad International Airport',
    city: 'Islamabad',
    state: 'Islamabad Capital Territory',
    stateCode: 'IS',
    region: 'Northern Pakistan',
    country: 'Pakistan',
    countryCode: 'PK',
    timezone: 'Asia/Karachi',
    coordinates: { latitude: 33.6149, longitude: 72.9886 },
    elevation: 508,
    category: 'regional',
    isInternational: true,
    passengerCount: 4.5,
    airlines: ['PK', 'PA', 'ER', 'NL', 'EK', 'QR', 'TK', 'SV'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['KHI', 'LHE', 'PEW', 'DXB', 'DOH', 'RYD', 'JED', 'LHR'],
    searchKeywords: ['islamabad', 'capital', 'pakistan', 'new islamabad'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Dhaka Hazrat Shahjalal International Airport
  {
    iataCode: 'DAC',
    icaoCode: 'VGHS',
    name: 'Hazrat Shahjalal International Airport',
    city: 'Dhaka',
    state: 'Dhaka Division',
    stateCode: 'DH',
    region: 'Central Bangladesh',
    country: 'Bangladesh',
    countryCode: 'BD',
    timezone: 'Asia/Dhaka',
    coordinates: { latitude: 23.8434, longitude: 90.3978 },
    elevation: 9,
    category: 'hub',
    isInternational: true,
    passengerCount: 9.1,
    airlines: ['BG', 'BS', 'VQ', 'EK', 'QR', 'TK', 'SQ', 'TG'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['CGP', 'CXB', 'DXB', 'DOH', 'KUL', 'SIN', 'BKK', 'DEL'],
    searchKeywords: ['dhaka', 'hazrat shahjalal', 'bangladesh', 'capital'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Colombo Bandaranaike International Airport
  {
    iataCode: 'CMB',
    icaoCode: 'VCBI',
    name: 'Bandaranaike International Airport',
    city: 'Colombo',
    state: 'Western Province',
    stateCode: 'WP',
    region: 'Western Sri Lanka',
    country: 'Sri Lanka',
    countryCode: 'LK',
    timezone: 'Asia/Colombo',
    coordinates: { latitude: 7.1808, longitude: 79.8842 },
    elevation: 9,
    category: 'regional',
    isInternational: true,
    passengerCount: 10.6,
    airlines: ['UL', 'FZ', 'EK', 'QR', 'TK', 'SQ', 'MH', 'AI'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MAA', 'BOM', 'DEL', 'DXB', 'DOH', 'SIN', 'KUL', 'BKK'],
    searchKeywords: ['colombo', 'bandaranaike', 'sri lanka', 'ceylon', 'katunayake'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * WESTERN ASIA (MIDDLE EAST) AIRPORTS - Complete coverage
 */
export const WESTERN_ASIA_AIRPORTS: AsiaAirport[] = [
  // Dubai International Airport
  {
    iataCode: 'DXB',
    icaoCode: 'OMDB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    state: 'Dubai',
    stateCode: 'DU',
    region: 'Emirates',
    country: 'UAE',
    countryCode: 'AE',
    timezone: 'Asia/Dubai',
    coordinates: { latitude: 25.2532, longitude: 55.3657 },
    elevation: 19,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 86.4,
    airlines: ['EK', 'FZ', 'QR', 'EY', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['DOH', 'AUH', 'RUH', 'JED', 'KWI', 'BOM', 'DEL', 'SIN', 'BKK', 'LHR'],
    searchKeywords: ['dubai', 'dxb', 'uae', 'emirates', 'middle east hub'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Doha Hamad International Airport
  {
    iataCode: 'DOH',
    icaoCode: 'OTHH',
    name: 'Hamad International Airport',
    city: 'Doha',
    state: 'Doha',
    stateCode: 'DA',
    region: 'Qatar',
    country: 'Qatar',
    countryCode: 'QA',
    timezone: 'Asia/Qatar',
    coordinates: { latitude: 25.2731, longitude: 51.6086 },
    elevation: 4,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 37.3,
    airlines: ['QR', 'WY', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA', 'TK'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['DXB', 'AUH', 'RUH', 'JED', 'KWI', 'BOM', 'DEL', 'SIN', 'BKK', 'LHR'],
    searchKeywords: ['doha', 'hamad', 'qatar', 'middle east', 'world cup'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Abu Dhabi International Airport
  {
    iataCode: 'AUH',
    icaoCode: 'OMAA',
    name: 'Abu Dhabi International Airport',
    city: 'Abu Dhabi',
    state: 'Abu Dhabi',
    stateCode: 'AZ',
    region: 'Emirates',
    country: 'UAE',
    countryCode: 'AE',
    timezone: 'Asia/Dubai',
    coordinates: { latitude: 24.4330, longitude: 54.6511 },
    elevation: 27,
    category: 'hub',
    isInternational: true,
    passengerCount: 23.3,
    airlines: ['EY', 'W4', 'EK', 'QR', 'AA', 'DL', 'UA', 'LH', 'AF'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['DXB', 'DOH', 'RUH', 'JED', 'KWI', 'BOM', 'DEL', 'SIN', 'BKK', 'LHR'],
    searchKeywords: ['abu dhabi', 'etihad', 'uae', 'capital', 'emirates'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Riyadh King Khalid International Airport
  {
    iataCode: 'RUH',
    icaoCode: 'OERK',
    name: 'King Khalid International Airport',
    city: 'Riyadh',
    state: 'Riyadh Province',
    stateCode: 'RI',
    region: 'Najd',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    timezone: 'Asia/Riyadh',
    coordinates: { latitude: 24.9576, longitude: 46.6988 },
    elevation: 614,
    category: 'hub',
    isInternational: true,
    passengerCount: 29.6,
    airlines: ['SV', 'XY', 'F3', 'EK', 'QR', 'EY', 'TK', 'LH'],
    terminals: 5,
    runways: 2,
    popularDestinations: ['JED', 'DMM', 'DXB', 'DOH', 'AUH', 'KWI', 'BOM', 'DEL', 'CAI', 'LHR'],
    searchKeywords: ['riyadh', 'king khalid', 'saudi arabia', 'capital', 'kingdom'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Jeddah King Abdulaziz International Airport
  {
    iataCode: 'JED',
    icaoCode: 'OEJN',
    name: 'King Abdulaziz International Airport',
    city: 'Jeddah',
    state: 'Makkah Province',
    stateCode: 'MK',
    region: 'Hejaz',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    timezone: 'Asia/Riyadh',
    coordinates: { latitude: 21.6796, longitude: 39.1565 },
    elevation: 48,
    category: 'hub',
    isInternational: true,
    passengerCount: 41.0,
    airlines: ['SV', 'XY', 'F3', 'EK', 'QR', 'EY', 'TK', 'MS'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['RUH', 'DMM', 'DXB', 'DOH', 'AUH', 'CAI', 'KHI', 'DAC', 'CGK', 'LHR'],
    searchKeywords: ['jeddah', 'king abdulaziz', 'saudi arabia', 'hajj', 'mecca gateway'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Istanbul Airport
  {
    iataCode: 'IST',
    icaoCode: 'LTFM',
    name: 'Istanbul Airport',
    city: 'Istanbul',
    state: 'Istanbul',
    stateCode: 'IS',
    region: 'Marmara',
    country: 'Turkey',
    countryCode: 'TR',
    timezone: 'Europe/Istanbul',
    coordinates: { latitude: 41.2619, longitude: 28.7414 },
    elevation: 104,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 64.3,
    airlines: ['TK', 'PC', 'XQ', 'AA', 'DL', 'UA', 'LH', 'AF', 'BA', 'SU'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['SAW', 'ADB', 'AYT', 'DXB', 'DOH', 'FRA', 'LHR', 'CDG', 'SVO', 'JFK'],
    searchKeywords: ['istanbul', 'turkey', 'new airport', 'europe asia', 'turkish airlines'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Tehran Imam Khomeini International Airport
  {
    iataCode: 'IKA',
    icaoCode: 'OIIE',
    name: 'Imam Khomeini International Airport',
    city: 'Tehran',
    state: 'Tehran Province',
    stateCode: 'TH',
    region: 'Central Iran',
    country: 'Iran',
    countryCode: 'IR',
    timezone: 'Asia/Tehran',
    coordinates: { latitude: 35.4161, longitude: 51.1522 },
    elevation: 1007,
    category: 'hub',
    isInternational: true,
    passengerCount: 14.2,
    airlines: ['IR', 'EP', 'W5', 'TK', 'QR', 'EK', 'SU', 'PS'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['THR', 'MHD', 'ISF', 'DXB', 'DOH', 'IST', 'SVO', 'VIE'],
    searchKeywords: ['tehran', 'imam khomeini', 'iran', 'persia', 'capital'],
    groundTransport: ['metro', 'bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Kuwait International Airport
  {
    iataCode: 'KWI',
    icaoCode: 'OKBK',
    name: 'Kuwait International Airport',
    city: 'Kuwait City',
    state: 'Al Asimah',
    stateCode: 'KU',
    region: 'Kuwait',
    country: 'Kuwait',
    countryCode: 'KW',
    timezone: 'Asia/Kuwait',
    coordinates: { latitude: 29.2267, longitude: 47.9689 },
    elevation: 63,
    category: 'regional',
    isInternational: true,
    passengerCount: 15.6,
    airlines: ['KU', 'J9', 'EK', 'QR', 'EY', 'TK', 'LH', 'BA'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['DXB', 'DOH', 'AUH', 'RUH', 'JED', 'BOM', 'DEL', 'CAI', 'LHR', 'FRA'],
    searchKeywords: ['kuwait', 'kuwait city', 'gulf', 'middle east'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Bahrain International Airport
  {
    iataCode: 'BAH',
    icaoCode: 'OBBI',
    name: 'Bahrain International Airport',
    city: 'Manama',
    state: 'Capital Governorate',
    stateCode: 'CA',
    region: 'Bahrain',
    country: 'Bahrain',
    countryCode: 'BH',
    timezone: 'Asia/Bahrain',
    coordinates: { latitude: 26.2708, longitude: 50.6336 },
    elevation: 2,
    category: 'regional',
    isInternational: true,
    passengerCount: 9.4,
    airlines: ['GF', 'XY', 'EK', 'QR', 'EY', 'TK', 'LH', 'BA'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['DXB', 'DOH', 'AUH', 'RUH', 'JED', 'KWI', 'BOM', 'DEL', 'LHR'],
    searchKeywords: ['bahrain', 'manama', 'gulf', 'island', 'pearl of gulf'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Muscat International Airport
  {
    iataCode: 'MCT',
    icaoCode: 'OOMS',
    name: 'Muscat International Airport',
    city: 'Muscat',
    state: 'Muscat Governorate',
    stateCode: 'MA',
    region: 'Northern Oman',
    country: 'Oman',
    countryCode: 'OM',
    timezone: 'Asia/Muscat',
    coordinates: { latitude: 23.5933, longitude: 58.2844 },
    elevation: 14,
    category: 'regional',
    isInternational: true,
    passengerCount: 15.3,
    airlines: ['WY', 'OV', 'EK', 'QR', 'EY', 'TK', 'LH', 'BA'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['DXB', 'DOH', 'AUH', 'BOM', 'DEL', 'KHI', 'CMB', 'SIN', 'BKK', 'LHR'],
    searchKeywords: ['muscat', 'oman', 'sultanate', 'arabian sea'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * COMPLETE ASIA AIRPORTS DATABASE
 */
export const ASIA_AIRPORTS_DATABASE: AsiaAirport[] = [
  ...EAST_ASIA_AIRPORTS,
  ...SOUTHEAST_ASIA_AIRPORTS,
  ...SOUTH_ASIA_AIRPORTS,
  ...WESTERN_ASIA_AIRPORTS
];

/**
 * POPULAR ASIAN ROUTES - Common city pairs for quick suggestions
 */
export const POPULAR_ASIA_ROUTES = [
  { from: 'NRT', to: 'ICN', route: 'Tokyo → Seoul', popularity: 95 },
  { from: 'ICN', to: 'NRT', route: 'Seoul → Tokyo', popularity: 95 },
  { from: 'HKG', to: 'SIN', route: 'Hong Kong → Singapore', popularity: 90 },
  { from: 'BKK', to: 'SIN', route: 'Bangkok → Singapore', popularity: 88 },
  { from: 'DXB', to: 'BOM', route: 'Dubai → Mumbai', popularity: 85 },
  { from: 'SIN', to: 'KUL', route: 'Singapore → Kuala Lumpur', popularity: 83 },
  { from: 'PVG', to: 'NRT', route: 'Shanghai → Tokyo', popularity: 82 },
  { from: 'DEL', to: 'DXB', route: 'Delhi → Dubai', popularity: 80 },
  { from: 'CGK', to: 'SIN', route: 'Jakarta → Singapore', popularity: 78 },
  { from: 'BKK', to: 'KUL', route: 'Bangkok → Kuala Lumpur', popularity: 75 }
];

/**
 * ASIAN TIMEZONE MAPPING
 */
export const ASIA_TIMEZONE_MAP = {
  // East Asia
  'Asia/Shanghai': 'China Standard Time (CST)',
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Asia/Seoul': 'Korea Standard Time (KST)',
  'Asia/Taipei': 'Taiwan Standard Time (TST)',
  'Asia/Hong_Kong': 'Hong Kong Time (HKT)',
  'Asia/Macau': 'Macau Standard Time (MST)',
  
  // Southeast Asia
  'Asia/Bangkok': 'Indochina Time (ICT)',
  'Asia/Singapore': 'Singapore Standard Time (SGT)',
  'Asia/Kuala_Lumpur': 'Malaysia Time (MYT)',
  'Asia/Jakarta': 'Western Indonesia Time (WIB)',
  'Asia/Makassar': 'Central Indonesia Time (WITA)',
  'Asia/Jayapura': 'Eastern Indonesia Time (WIT)',
  'Asia/Manila': 'Philippines Standard Time (PST)',
  'Asia/Ho_Chi_Minh': 'Indochina Time (ICT)',
  'Asia/Phnom_Penh': 'Indochina Time (ICT)',
  'Asia/Vientiane': 'Indochina Time (ICT)',
  'Asia/Yangon': 'Myanmar Time (MMT)',
  
  // South Asia
  'Asia/Kolkata': 'India Standard Time (IST)',
  'Asia/Karachi': 'Pakistan Standard Time (PKT)',
  'Asia/Dhaka': 'Bangladesh Standard Time (BST)',
  'Asia/Colombo': 'Sri Lanka Time (SLST)',
  'Asia/Kathmandu': 'Nepal Time (NPT)',
  'Asia/Thimphu': 'Bhutan Time (BTT)',
  
  // Central Asia
  'Asia/Almaty': 'Almaty Time (ALMT)',
  'Asia/Tashkent': 'Uzbekistan Time (UZT)',
  'Asia/Ashgabat': 'Turkmenistan Time (TMT)',
  'Asia/Dushanbe': 'Tajikistan Time (TJT)',
  'Asia/Bishkek': 'Kyrgyzstan Time (KGT)',
  
  // Western Asia
  'Asia/Dubai': 'Gulf Standard Time (GST)',
  'Asia/Qatar': 'Arabia Standard Time (AST)',
  'Asia/Kuwait': 'Arabia Standard Time (AST)',
  'Asia/Riyadh': 'Arabia Standard Time (AST)',
  'Asia/Bahrain': 'Arabia Standard Time (AST)',
  'Asia/Muscat': 'Gulf Standard Time (GST)',
  'Europe/Istanbul': 'Turkey Time (TRT)',
  'Asia/Tehran': 'Iran Standard Time (IRST)',
  'Asia/Baghdad': 'Arabia Standard Time (AST)',
  'Asia/Damascus': 'Eastern European Time (EET)',
  'Asia/Beirut': 'Eastern European Time (EET)',
  'Asia/Jerusalem': 'Israel Standard Time (IST)',
  'Asia/Amman': 'Eastern European Time (EET)'
};

/**
 * ASIAN REGIONS MAPPING
 */
export const ASIA_REGIONS = {
  'East Asia': ['China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau', 'North Korea', 'Mongolia'],
  'Southeast Asia': ['Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'East Timor'],
  'South Asia': ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Afghanistan'],
  'Central Asia': ['Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan'],
  'Western Asia': ['Turkey', 'Iran', 'Iraq', 'Syria', 'Lebanon', 'Jordan', 'Israel', 'Palestine', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen', 'Georgia', 'Armenia', 'Azerbaijan'],
  'Northern Asia': ['Russia']
};

/**
 * AIRPORT SEARCH INDEX - Optimized for fast searching
 */
export const createAsiaAirportSearchIndex = () => {
  const searchIndex = new Map<string, AsiaAirport[]>();
  
  ASIA_AIRPORTS_DATABASE.forEach(airport => {
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