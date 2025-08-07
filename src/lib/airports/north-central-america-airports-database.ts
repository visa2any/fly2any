/**
 * 🌎 COMPREHENSIVE NORTH & CENTRAL AMERICA AIRPORTS DATABASE
 * Complete database of North and Central American airports with major hubs, regional airports, and international gateways
 * Data optimized for flight booking and search functionality across all North and Central American countries
 */

export interface NorthCentralAmericaAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state?: string;
  stateCode?: string;
  region: string;
  country: 'United States' | 'Canada' | 'Mexico' | 'Guatemala' | 'Belize' | 'El Salvador' | 'Honduras' | 'Nicaragua' | 'Costa Rica' | 'Panama' | 'Cuba' | 'Jamaica' | 'Haiti' | 'Dominican Republic' | 'Puerto Rico' | 'Trinidad and Tobago' | 'Barbados' | 'Bahamas' | 'Aruba' | 'Curaçao' | 'Saint Lucia' | 'Martinique' | 'Guadeloupe' | 'Antigua and Barbuda' | 'Saint Kitts and Nevis' | 'Dominica' | 'Saint Vincent and the Grenadines' | 'Grenada';
  countryCode: 'US' | 'CA' | 'MX' | 'GT' | 'BZ' | 'SV' | 'HN' | 'NI' | 'CR' | 'PA' | 'CU' | 'JM' | 'HT' | 'DO' | 'PR' | 'TT' | 'BB' | 'BS' | 'AW' | 'CW' | 'LC' | 'MQ' | 'GP' | 'AG' | 'KN' | 'DM' | 'VC' | 'GD';
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

  // 🌎 NORTH AMERICA-SPECIFIC TRAVEL EXPERIENCE FEATURES
  security?: {
    // US/Canada/Mexico security programs
    tsaPrecheck?: boolean; // US airports
    globalEntry?: boolean; // US airports
    clear?: boolean; // US airports
    nexus?: boolean; // US/Canada airports
    sentri?: boolean; // US/Mexico airports
    catsa?: boolean; // Canada airports (Canadian Air Transport Security Authority)
    averageWaitTimes?: {
      standard: number; // minutes
      expedited?: number; // for precheck/nexus users
      peak: number;
      offPeak: number;
    };
    checkpointHours?: {
      open: string;
      close: string;
      early?: string;
    };
  };
  regionalAmenities?: {
    lounges?: {
      airline: { name: string; terminal: string; access: string[]; dayPass?: number }[];
      independent?: { name: string; terminal: string; dayPass: number }[];
      creditCard?: { name: string; terminal: string; cards: string[] }[];
    };
    dining?: {
      fastFood: string[];
      restaurants: string[];
      cafes: string[];
      bars: string[];
      localSpecialties: string[];
    };
    shopping?: {
      newsStands: boolean;
      electronics: boolean;
      fashion: boolean;
      gifts: boolean;
      dutyFree: boolean;
      bookstore: boolean;
    };
    services?: {
      currencyExchange: boolean;
      pharmacy: boolean;
      medical: boolean;
      banking: boolean;
      postOffice: boolean;
      luggageStorage: boolean;
      showers: boolean;
      sleepingPods: boolean;
      petRelief: boolean;
    };
    technology?: {
      freeWifi: boolean;
      chargingStations: boolean;
      businessCenter: boolean;
      printServices: boolean;
      appBasedServices: string[];
    };
    families?: {
      nursingRooms: boolean;
      playAreas: boolean;
      familyRestrooms: boolean;
      strollerRental: boolean;
      unaccompaniedMinorServices: boolean;
    };
  };
  loyaltyPrograms?: {
    primaryAirlines: { 
      airline: string; 
      program: string; 
      benefits: string[];
      loungeAccess: boolean;
    }[];
    creditCardBenefits?: {
      freeCheckedBags: string[];
      priorityBoarding: string[];
      loungeAccess: string[];
    };
  };
  crossBorderTravel?: {
    // For US/Canada/Mexico airports
    documentsRequired: string[];
    programs: string[]; // NEXUS, SENTRI, etc.
    restrictions: string[];
    tips: string[];
    customsHours?: { open: string; close: string };
    immigrationHours?: { open: string; close: string };
    dutyFree: boolean;
    currencyExchange: boolean;
    preclearance?: {
      countries: string[];
      available: boolean;
    };
  };
}

/**
 * MEXICO AIRPORTS - Complete coverage
 */
export const MEXICO_AIRPORTS: NorthCentralAmericaAirport[] = [
  // Mexico City Benito Juárez International Airport
  {
    iataCode: 'MEX',
    icaoCode: 'MMMX',
    name: 'Mexico City International Airport',
    city: 'Mexico City',
    state: 'Mexico City',
    stateCode: 'CDMX',
    region: 'Central',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Mexico_City',
    coordinates: { latitude: 19.4363, longitude: -99.0721 },
    elevation: 2230,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 50.3,
    airlines: ['AM', 'Y4', 'VB', 'DL', 'AA', 'UA', 'LH', 'AF', 'KL', 'IB'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['CUN', 'GDL', 'MTY', 'TIJ', 'MID', 'LAX', 'DFW', 'JFK', 'MAD', 'CDG'],
    searchKeywords: ['mexico city', 'cdmx', 'capital', 'benito juarez', 'distrito federal'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Cancún International Airport
  {
    iataCode: 'CUN',
    icaoCode: 'MMUN',
    name: 'Cancún International Airport',
    city: 'Cancún',
    state: 'Quintana Roo',
    stateCode: 'QR',
    region: 'Caribbean',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Cancun',
    coordinates: { latitude: 21.0366, longitude: -86.8771 },
    elevation: 5,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 31.1,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA', 'WN', 'B6', 'NK', 'F9'],
    terminals: 4,
    runways: 3,
    popularDestinations: ['MEX', 'GDL', 'MTY', 'MIA', 'DFW', 'ATL', 'JFK', 'ORD', 'LAX', 'YYZ'],
    searchKeywords: ['cancun', 'quintana roo', 'riviera maya', 'caribbean', 'beach', 'resort'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Guadalajara Miguel Hidalgo y Costilla International Airport
  {
    iataCode: 'GDL',
    icaoCode: 'MMGL',
    name: 'Miguel Hidalgo y Costilla Guadalajara International Airport',
    city: 'Guadalajara',
    state: 'Jalisco',
    stateCode: 'JAL',
    region: 'Western',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Mexico_City',
    coordinates: { latitude: 20.5218, longitude: -103.3112 },
    elevation: 1529,
    category: 'hub',
    isInternational: true,
    passengerCount: 15.2,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA', 'WN'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['MEX', 'CUN', 'MTY', 'TIJ', 'LAX', 'DFW', 'ORD', 'PHX', 'SFO', 'LAS'],
    searchKeywords: ['guadalajara', 'jalisco', 'western mexico', 'miguel hidalgo', 'pearl of the west'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Monterrey General Mariano Escobedo International Airport
  {
    iataCode: 'MTY',
    icaoCode: 'MMMY',
    name: 'General Mariano Escobedo International Airport',
    city: 'Monterrey',
    state: 'Nuevo León',
    stateCode: 'NL',
    region: 'Northern',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Monterrey',
    coordinates: { latitude: 25.7785, longitude: -100.1066 },
    elevation: 387,
    category: 'hub',
    isInternational: true,
    passengerCount: 12.8,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA', 'WN'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['MEX', 'CUN', 'GDL', 'TIJ', 'DFW', 'IAH', 'ATL', 'ORD', 'LAX', 'PHX'],
    searchKeywords: ['monterrey', 'nuevo leon', 'northern mexico', 'mariano escobedo', 'industrial'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Tijuana General Abelardo L. Rodríguez International Airport
  {
    iataCode: 'TIJ',
    icaoCode: 'MMTJ',
    name: 'General Abelardo L. Rodríguez International Airport',
    city: 'Tijuana',
    state: 'Baja California',
    stateCode: 'BC',
    region: 'Northwestern',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Tijuana',
    coordinates: { latitude: 32.5411, longitude: -116.9700 },
    elevation: 160,
    category: 'hub',
    isInternational: true,
    passengerCount: 8.4,
    airlines: ['Y4', 'VB', 'AM', 'WN', 'AA', 'DL'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MEX', 'GDL', 'MTY', 'CUN', 'LAX', 'SAN', 'PHX', 'LAS', 'SFO', 'SEA'],
    searchKeywords: ['tijuana', 'baja california', 'border', 'abelardo rodriguez', 'cross border xpress'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Puerto Vallarta Gustavo Díaz Ordaz International Airport
  {
    iataCode: 'PVR',
    icaoCode: 'MMPR',
    name: 'Gustavo Díaz Ordaz International Airport',
    city: 'Puerto Vallarta',
    state: 'Jalisco',
    stateCode: 'JAL',
    region: 'Pacific Coast',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Mexico_City',
    coordinates: { latitude: 20.6801, longitude: -105.2544 },
    elevation: 7,
    category: 'regional',
    isInternational: true,
    passengerCount: 5.2,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA', 'WN', 'WS'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['MEX', 'GDL', 'CUN', 'LAX', 'DFW', 'ORD', 'YYC', 'YVR', 'SEA', 'PHX'],
    searchKeywords: ['puerto vallarta', 'jalisco', 'pacific coast', 'beach', 'resort', 'gustavo diaz ordaz'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Los Cabos International Airport
  {
    iataCode: 'SJD',
    icaoCode: 'MMSD',
    name: 'Los Cabos International Airport',
    city: 'Los Cabos',
    state: 'Baja California Sur',
    stateCode: 'BCS',
    region: 'Northwestern',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Mazatlan',
    coordinates: { latitude: 23.1518, longitude: -109.7214 },
    elevation: 120,
    category: 'regional',
    isInternational: true,
    passengerCount: 5.8,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA', 'WN', 'WS'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['MEX', 'GDL', 'TIJ', 'LAX', 'DFW', 'PHX', 'DEN', 'YYC', 'YVR', 'SEA'],
    searchKeywords: ['los cabos', 'cabo', 'baja california sur', 'resort', 'beach', 'fishing'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Cozumel International Airport
  {
    iataCode: 'CZM',
    icaoCode: 'MMCZ',
    name: 'Cozumel International Airport',
    city: 'Cozumel',
    state: 'Quintana Roo',
    stateCode: 'QR',
    region: 'Caribbean',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Cancun',
    coordinates: { latitude: 20.5223, longitude: -86.9256 },
    elevation: 4,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.8,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA', 'WN'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MEX', 'CUN', 'MIA', 'DFW', 'ATL', 'MSP', 'YYZ', 'YUL'],
    searchKeywords: ['cozumel', 'quintana roo', 'island', 'diving', 'caribbean', 'cruise'],
    groundTransport: ['taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Mérida Manuel Crescencio Rejón International Airport
  {
    iataCode: 'MID',
    icaoCode: 'MMMD',
    name: 'Manuel Crescencio Rejón International Airport',
    city: 'Mérida',
    state: 'Yucatán',
    stateCode: 'YUC',
    region: 'Southeastern',
    country: 'Mexico',
    countryCode: 'MX',
    timezone: 'America/Merida',
    coordinates: { latitude: 20.9370, longitude: -89.6577 },
    elevation: 9,
    category: 'regional',
    isInternational: true,
    passengerCount: 2.1,
    airlines: ['AM', 'Y4', 'VB', 'AA', 'DL', 'UA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MEX', 'CUN', 'MIA', 'DFW', 'IAH', 'YYZ', 'YUL'],
    searchKeywords: ['merida', 'yucatan', 'mayan', 'white city', 'manuel crescencio rejon'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * CANADA AIRPORTS - Complete coverage
 */
export const CANADA_AIRPORTS: NorthCentralAmericaAirport[] = [
  // Toronto Pearson International Airport
  {
    iataCode: 'YYZ',
    icaoCode: 'CYYZ',
    name: 'Toronto Pearson International Airport',
    city: 'Toronto',
    state: 'Ontario',
    stateCode: 'ON',
    region: 'Central',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    coordinates: { latitude: 43.6777, longitude: -79.6248 },
    elevation: 173,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 50.5,
    airlines: ['AC', 'WS', 'TS', 'PD', 'AA', 'DL', 'UA', 'BA', 'LH', 'AF'],
    terminals: 3,
    runways: 5,
    popularDestinations: ['YVR', 'YUL', 'YYC', 'YOW', 'YHZ', 'LAX', 'JFK', 'LHR', 'FRA', 'CDG'],
    searchKeywords: ['toronto', 'ontario', 'pearson', 'canada', 'gta', 'greater toronto'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Vancouver International Airport
  {
    iataCode: 'YVR',
    icaoCode: 'CYVR',
    name: 'Vancouver International Airport',
    city: 'Vancouver',
    state: 'British Columbia',
    stateCode: 'BC',
    region: 'Western',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Vancouver',
    coordinates: { latitude: 49.1967, longitude: -123.1815 },
    elevation: 4,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 26.4,
    airlines: ['AC', 'WS', 'TS', 'PD', 'AA', 'DL', 'UA', 'AS', 'NH', 'CX'],
    terminals: 3,
    runways: 3,
    popularDestinations: ['YYZ', 'YYC', 'YUL', 'SEA', 'LAX', 'SFO', 'NRT', 'ICN', 'TPE', 'HKG'],
    searchKeywords: ['vancouver', 'british columbia', 'bc', 'pacific', 'west coast', 'yvr'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Montreal Pierre Elliott Trudeau International Airport
  {
    iataCode: 'YUL',
    icaoCode: 'CYUL',
    name: 'Montreal Pierre Elliott Trudeau International Airport',
    city: 'Montreal',
    state: 'Quebec',
    stateCode: 'QC',
    region: 'Eastern',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Montreal',
    coordinates: { latitude: 45.4657, longitude: -73.7448 },
    elevation: 36,
    category: 'hub',
    isInternational: true,
    passengerCount: 20.3,
    airlines: ['AC', 'WS', 'TS', 'PD', 'AA', 'DL', 'UA', 'AF', 'LH', 'KL'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['YYZ', 'YVR', 'YYC', 'YOW', 'JFK', 'CDG', 'LHR', 'FRA', 'AMS', 'ZUR'],
    searchKeywords: ['montreal', 'quebec', 'trudeau', 'french', 'dorval', 'quebec city'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Calgary International Airport
  {
    iataCode: 'YYC',
    icaoCode: 'CYYC',
    name: 'Calgary International Airport',
    city: 'Calgary',
    state: 'Alberta',
    stateCode: 'AB',
    region: 'Western',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Edmonton',
    coordinates: { latitude: 51.1315, longitude: -114.0106 },
    elevation: 1099,
    category: 'hub',
    isInternational: true,
    passengerCount: 18.5,
    airlines: ['AC', 'WS', 'TS', 'PD', 'AA', 'DL', 'UA', 'LH', 'KL'],
    terminals: 1,
    runways: 4,
    popularDestinations: ['YYZ', 'YVR', 'YUL', 'YEG', 'DEN', 'SEA', 'LAX', 'SFO', 'LHR', 'FRA'],
    searchKeywords: ['calgary', 'alberta', 'oil', 'rockies', 'western canada'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Ottawa Macdonald-Cartier International Airport
  {
    iataCode: 'YOW',
    icaoCode: 'CYOW',
    name: 'Ottawa Macdonald-Cartier International Airport',
    city: 'Ottawa',
    state: 'Ontario',
    stateCode: 'ON',
    region: 'Central',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    coordinates: { latitude: 45.3225, longitude: -75.6692 },
    elevation: 114,
    category: 'regional',
    isInternational: true,
    passengerCount: 5.1,
    airlines: ['AC', 'WS', 'TS', 'PD', 'AA', 'DL', 'UA'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['YYZ', 'YUL', 'YVR', 'YYC', 'LGA', 'DCA', 'BOS', 'ORD'],
    searchKeywords: ['ottawa', 'ontario', 'capital', 'government', 'macdonald cartier'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Edmonton International Airport
  {
    iataCode: 'YEG',
    icaoCode: 'CYEG',
    name: 'Edmonton International Airport',
    city: 'Edmonton',
    state: 'Alberta',
    stateCode: 'AB',
    region: 'Western',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Edmonton',
    coordinates: { latitude: 53.3097, longitude: -113.5800 },
    elevation: 723,
    category: 'regional',
    isInternational: true,
    passengerCount: 8.2,
    airlines: ['AC', 'WS', 'TS', 'PD', 'DL', 'UA', 'LH'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['YYZ', 'YVR', 'YYC', 'YUL', 'SEA', 'DEN', 'LAX', 'FRA', 'AMS'],
    searchKeywords: ['edmonton', 'alberta', 'oil sands', 'northern alberta'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Halifax Stanfield International Airport
  {
    iataCode: 'YHZ',
    icaoCode: 'CYHZ',
    name: 'Halifax Stanfield International Airport',
    city: 'Halifax',
    state: 'Nova Scotia',
    stateCode: 'NS',
    region: 'Atlantic',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Halifax',
    coordinates: { latitude: 44.8808, longitude: -63.5086 },
    elevation: 145,
    category: 'regional',
    isInternational: true,
    passengerCount: 4.2,
    airlines: ['AC', 'WS', 'TS', 'PD', 'AA', 'DL', 'UA'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['YYZ', 'YUL', 'YOW', 'BOS', 'JFK', 'LGA', 'LHR', 'FRA'],
    searchKeywords: ['halifax', 'nova scotia', 'maritime', 'atlantic canada', 'stanfield'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Winnipeg Richardson International Airport
  {
    iataCode: 'YWG',
    icaoCode: 'CYWG',
    name: 'Winnipeg Richardson International Airport',
    city: 'Winnipeg',
    state: 'Manitoba',
    stateCode: 'MB',
    region: 'Central',
    country: 'Canada',
    countryCode: 'CA',
    timezone: 'America/Winnipeg',
    coordinates: { latitude: 49.9100, longitude: -97.2394 },
    elevation: 239,
    category: 'regional',
    isInternational: true,
    passengerCount: 4.6,
    airlines: ['AC', 'WS', 'TS', 'PD', 'DL', 'UA'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['YYZ', 'YVR', 'YYC', 'YUL', 'DEN', 'MSP', 'ORD', 'SEA'],
    searchKeywords: ['winnipeg', 'manitoba', 'prairie', 'central canada', 'richardson'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * CENTRAL AMERICA AIRPORTS - Complete coverage
 */
export const CENTRAL_AMERICA_AIRPORTS: NorthCentralAmericaAirport[] = [
  // Guatemala City La Aurora International Airport
  {
    iataCode: 'GUA',
    icaoCode: 'MGGT',
    name: 'La Aurora International Airport',
    city: 'Guatemala City',
    state: 'Guatemala',
    stateCode: 'GT',
    region: 'Central',
    country: 'Guatemala',
    countryCode: 'GT',
    timezone: 'America/Guatemala',
    coordinates: { latitude: 14.5833, longitude: -90.5275 },
    elevation: 1502,
    category: 'hub',
    isInternational: true,
    passengerCount: 2.1,
    airlines: ['GU', 'TA', 'CM', 'AA', 'DL', 'UA', 'AM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SAL', 'SJO', 'PTY', 'MEX', 'MIA', 'LAX', 'DFW', 'IAH'],
    searchKeywords: ['guatemala city', 'guatemala', 'central america', 'la aurora', 'mayan'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Belize City Philip S. W. Goldson International Airport
  {
    iataCode: 'BZE',
    icaoCode: 'MZBZ',
    name: 'Philip S. W. Goldson International Airport',
    city: 'Belize City',
    state: 'Belize',
    stateCode: 'BZ',
    region: 'Coastal',
    country: 'Belize',
    countryCode: 'BZ',
    timezone: 'America/Belize',
    coordinates: { latitude: 17.5394, longitude: -88.3083 },
    elevation: 5,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.4,
    airlines: ['BZ', 'TA', 'AA', 'DL', 'UA', 'WS'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GUA', 'SJO', 'MIA', 'DFW', 'IAH', 'YYZ', 'YUL'],
    searchKeywords: ['belize city', 'belize', 'caribbean', 'barrier reef', 'goldson'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // San Salvador Monseñor Óscar Arnulfo Romero International Airport
  {
    iataCode: 'SAL',
    icaoCode: 'MSLP',
    name: 'Monseñor Óscar Arnulfo Romero International Airport',
    city: 'San Salvador',
    state: 'La Libertad',
    stateCode: 'LL',
    region: 'Central',
    country: 'El Salvador',
    countryCode: 'SV',
    timezone: 'America/El_Salvador',
    coordinates: { latitude: 13.4409, longitude: -89.0556 },
    elevation: 101,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.8,
    airlines: ['TA', 'CM', 'AA', 'DL', 'UA', 'AM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GUA', 'TGU', 'SJO', 'PTY', 'MEX', 'MIA', 'LAX', 'DFW'],
    searchKeywords: ['san salvador', 'el salvador', 'central america', 'romero', 'comalapa'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Tegucigalpa Toncontín International Airport
  {
    iataCode: 'TGU',
    icaoCode: 'MHTG',
    name: 'Toncontín International Airport',
    city: 'Tegucigalpa',
    state: 'Francisco Morazán',
    stateCode: 'FM',
    region: 'Central',
    country: 'Honduras',
    countryCode: 'HN',
    timezone: 'America/Tegucigalpa',
    coordinates: { latitude: 14.0608, longitude: -87.2172 },
    elevation: 1005,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.8,
    airlines: ['CM', 'TA', 'AA', 'DL', 'UA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SAL', 'GUA', 'SJO', 'PTY', 'MIA', 'DFW', 'IAH'],
    searchKeywords: ['tegucigalpa', 'honduras', 'central america', 'toncontin', 'challenging approach'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // San Pedro Sula Ramón Villeda Morales International Airport
  {
    iataCode: 'SAP',
    icaoCode: 'MHLM',
    name: 'Ramón Villeda Morales International Airport',
    city: 'San Pedro Sula',
    state: 'Cortés',
    stateCode: 'CR',
    region: 'Northern',
    country: 'Honduras',
    countryCode: 'HN',
    timezone: 'America/Tegucigalpa',
    coordinates: { latitude: 15.4526, longitude: -87.9236 },
    elevation: 89,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.2,
    airlines: ['CM', 'TA', 'AA', 'DL', 'UA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['TGU', 'SAL', 'GUA', 'SJO', 'MIA', 'DFW', 'IAH'],
    searchKeywords: ['san pedro sula', 'honduras', 'industrial', 'ramon villeda morales'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Managua Augusto C. Sandino International Airport
  {
    iataCode: 'MGA',
    icaoCode: 'MNMG',
    name: 'Augusto C. Sandino International Airport',
    city: 'Managua',
    state: 'Managua',
    stateCode: 'MN',
    region: 'Central',
    country: 'Nicaragua',
    countryCode: 'NI',
    timezone: 'America/Managua',
    coordinates: { latitude: 12.1415, longitude: -86.1681 },
    elevation: 56,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.5,
    airlines: ['TA', 'CM', 'AA', 'DL', 'UA', 'AM'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SJO', 'SAL', 'GUA', 'PTY', 'MIA', 'DFW', 'IAH', 'MEX'],
    searchKeywords: ['managua', 'nicaragua', 'central america', 'sandino', 'lakes'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // San José Juan Santamaría International Airport
  {
    iataCode: 'SJO',
    icaoCode: 'MROC',
    name: 'Juan Santamaría International Airport',
    city: 'San José',
    state: 'Alajuela',
    stateCode: 'A',
    region: 'Central Valley',
    country: 'Costa Rica',
    countryCode: 'CR',
    timezone: 'America/Costa_Rica',
    coordinates: { latitude: 9.9939, longitude: -84.2088 },
    elevation: 920,
    category: 'hub',
    isInternational: true,
    passengerCount: 5.1,
    airlines: ['LR', 'TA', 'CM', 'AA', 'DL', 'UA', 'WN', 'B6'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['PTY', 'GUA', 'SAL', 'MGA', 'MIA', 'DFW', 'LAX', 'JFK', 'ORD'],
    searchKeywords: ['san jose', 'costa rica', 'central america', 'juan santamaria', 'pura vida'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Liberia Daniel Oduber Quirós International Airport
  {
    iataCode: 'LIR',
    icaoCode: 'MRLB',
    name: 'Daniel Oduber Quirós International Airport',
    city: 'Liberia',
    state: 'Guanacaste',
    stateCode: 'G',
    region: 'Pacific Coast',
    country: 'Costa Rica',
    countryCode: 'CR',
    timezone: 'America/Costa_Rica',
    coordinates: { latitude: 10.5933, longitude: -85.5444 },
    elevation: 144,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.4,
    airlines: ['LR', 'TA', 'AA', 'DL', 'UA', 'WN', 'B6', 'WS'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SJO', 'MIA', 'DFW', 'LAX', 'ORD', 'YYZ', 'YUL'],
    searchKeywords: ['liberia', 'guanacaste', 'costa rica', 'beach', 'pacific', 'oduber quiros'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Panama City Tocumen International Airport
  {
    iataCode: 'PTY',
    icaoCode: 'MPTO',
    name: 'Tocumen International Airport',
    city: 'Panama City',
    state: 'Panamá',
    stateCode: 'PA',
    region: 'Central',
    country: 'Panama',
    countryCode: 'PA',
    timezone: 'America/Panama',
    coordinates: { latitude: 9.0714, longitude: -79.3835 },
    elevation: 35,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 16.7,
    airlines: ['CM', 'TA', 'AA', 'DL', 'UA', 'AV', 'LA', 'AM', 'B6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['SJO', 'GUA', 'SAL', 'MGA', 'BOG', 'LIM', 'UIO', 'CCS', 'MIA', 'JFK'],
    searchKeywords: ['panama city', 'panama', 'central america', 'tocumen', 'canal', 'hub'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  }
];

/**
 * CARIBBEAN AIRPORTS - Complete coverage
 */
export const CARIBBEAN_AIRPORTS: NorthCentralAmericaAirport[] = [
  // Havana José Martí International Airport
  {
    iataCode: 'HAV',
    icaoCode: 'MUHA',
    name: 'José Martí International Airport',
    city: 'Havana',
    state: 'La Habana',
    stateCode: 'LH',
    region: 'Western',
    country: 'Cuba',
    countryCode: 'CU',
    timezone: 'America/Havana',
    coordinates: { latitude: 22.9892, longitude: -82.4091 },
    elevation: 64,
    category: 'hub',
    isInternational: true,
    passengerCount: 3.9,
    airlines: ['CU', 'AM', 'AC', 'AF', 'IB', 'KL'],
    terminals: 5,
    runways: 2,
    popularDestinations: ['CUN', 'MEX', 'YYZ', 'YUL', 'CDG', 'MAD', 'AMS', 'BOG'],
    searchKeywords: ['havana', 'habana', 'cuba', 'caribbean', 'jose marti', 'cuban'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Kingston Norman Manley International Airport
  {
    iataCode: 'KIN',
    icaoCode: 'MKJP',
    name: 'Norman Manley International Airport',
    city: 'Kingston',
    state: 'Saint Andrew',
    stateCode: 'SA',
    region: 'Southeastern',
    country: 'Jamaica',
    countryCode: 'JM',
    timezone: 'America/Jamaica',
    coordinates: { latitude: 17.9357, longitude: -76.7875 },
    elevation: 3,
    category: 'regional',
    isInternational: true,
    passengerCount: 1.8,
    airlines: ['JM', 'B6', 'AA', 'DL', 'UA', 'WS', 'AC'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MBJ', 'MIA', 'JFK', 'FLL', 'ATL', 'YYZ', 'YUL'],
    searchKeywords: ['kingston', 'jamaica', 'caribbean', 'norman manley', 'reggae'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Montego Bay Sangster International Airport
  {
    iataCode: 'MBJ',
    icaoCode: 'MKJS',
    name: 'Sangster International Airport',
    city: 'Montego Bay',
    state: 'Saint James',
    stateCode: 'SJ',
    region: 'Northwestern',
    country: 'Jamaica',
    countryCode: 'JM',
    timezone: 'America/Jamaica',
    coordinates: { latitude: 18.5037, longitude: -77.9133 },
    elevation: 4,
    category: 'hub',
    isInternational: true,
    passengerCount: 4.3,
    airlines: ['JM', 'B6', 'AA', 'DL', 'UA', 'WS', 'AC', 'BA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['KIN', 'MIA', 'JFK', 'FLL', 'ATL', 'ORD', 'YYZ', 'LHR'],
    searchKeywords: ['montego bay', 'jamaica', 'caribbean', 'sangster', 'resort', 'tourism'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Port-au-Prince Toussaint Louverture International Airport
  {
    iataCode: 'PAP',
    icaoCode: 'MTPP',
    name: 'Toussaint Louverture International Airport',
    city: 'Port-au-Prince',
    state: 'Ouest',
    stateCode: 'OU',
    region: 'Western',
    country: 'Haiti',
    countryCode: 'HT',
    timezone: 'America/Port-au-Prince',
    coordinates: { latitude: 18.5800, longitude: -72.2925 },
    elevation: 37,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 2.0,
    airlines: ['HN', 'AA', 'DL', 'B6', 'AF'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['MIA', 'JFK', 'FLL', 'CDG', 'YUL', 'SDQ', 'CUR'],
    searchKeywords: ['port au prince', 'haiti', 'caribbean', 'toussaint louverture', 'haitian'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Santo Domingo Las Américas International Airport
  {
    iataCode: 'SDQ',
    icaoCode: 'MDSD',
    name: 'Las Américas International Airport',
    city: 'Santo Domingo',
    state: 'Distrito Nacional',
    stateCode: 'DN',
    region: 'Southern',
    country: 'Dominican Republic',
    countryCode: 'DO',
    timezone: 'America/Santo_Domingo',
    coordinates: { latitude: 18.4297, longitude: -69.6689 },
    elevation: 18,
    category: 'hub',
    isInternational: true,
    passengerCount: 6.2,
    airlines: ['JD', 'B6', 'AA', 'DL', 'UA', 'F9', 'IB'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['PUJ', 'MIA', 'JFK', 'FLL', 'ATL', 'BOS', 'YYZ', 'MAD'],
    searchKeywords: ['santo domingo', 'dominican republic', 'caribbean', 'las americas', 'capital'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Punta Cana International Airport
  {
    iataCode: 'PUJ',
    icaoCode: 'MDPC',
    name: 'Punta Cana International Airport',
    city: 'Punta Cana',
    state: 'La Altagracia',
    stateCode: 'LA',
    region: 'Eastern',
    country: 'Dominican Republic',
    countryCode: 'DO',
    timezone: 'America/Santo_Domingo',
    coordinates: { latitude: 18.5674, longitude: -68.3634 },
    elevation: 14,
    category: 'hub',
    isInternational: true,
    passengerCount: 8.5,
    airlines: ['JD', 'B6', 'AA', 'DL', 'UA', 'F9', 'WS', 'AC'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['SDQ', 'MIA', 'JFK', 'FLL', 'ATL', 'BOS', 'YYZ', 'YUL'],
    searchKeywords: ['punta cana', 'dominican republic', 'caribbean', 'resort', 'beach', 'tourism'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // San Juan Luis Muñoz Marín International Airport
  {
    iataCode: 'SJU',
    icaoCode: 'TJSJ',
    name: 'Luis Muñoz Marín International Airport',
    city: 'San Juan',
    state: 'Carolina',
    stateCode: 'CR',
    region: 'Northern',
    country: 'Puerto Rico',
    countryCode: 'PR',
    timezone: 'America/Puerto_Rico',
    coordinates: { latitude: 18.4394, longitude: -66.0017 },
    elevation: 3,
    category: 'hub',
    isInternational: true,
    passengerCount: 9.1,
    airlines: ['B6', 'AA', 'DL', 'UA', 'WN', 'F9', 'NK'],
    terminals: 5,
    runways: 3,
    popularDestinations: ['MIA', 'JFK', 'FLL', 'ATL', 'ORD', 'MCO', 'BOS', 'PHL'],
    searchKeywords: ['san juan', 'puerto rico', 'caribbean', 'munoz marin', 'borinquen'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Port of Spain Piarco International Airport
  {
    iataCode: 'POS',
    icaoCode: 'TTPP',
    name: 'Piarco International Airport',
    city: 'Port of Spain',
    state: 'Tunapuna-Piarco',
    stateCode: 'TP',
    region: 'Northern',
    country: 'Trinidad and Tobago',
    countryCode: 'TT',
    timezone: 'America/Port_of_Spain',
    coordinates: { latitude: 10.5953, longitude: -61.3372 },
    elevation: 17,
    category: 'regional',
    isInternational: true,
    passengerCount: 3.2,
    airlines: ['BW', 'B6', 'AA', 'DL', 'AC', 'BA', 'KL'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['BGI', 'GEO', 'MIA', 'JFK', 'YYZ', 'LHR', 'AMS'],
    searchKeywords: ['port of spain', 'trinidad', 'tobago', 'caribbean', 'piarco', 'carnival'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Bridgetown Grantley Adams International Airport
  {
    iataCode: 'BGI',
    icaoCode: 'TBPB',
    name: 'Grantley Adams International Airport',
    city: 'Bridgetown',
    state: 'Christ Church',
    stateCode: 'CC',
    region: 'Southern',
    country: 'Barbados',
    countryCode: 'BB',
    timezone: 'America/Barbados',
    coordinates: { latitude: 13.0749, longitude: -59.4925 },
    elevation: 56,
    category: 'regional',
    isInternational: true,
    passengerCount: 2.3,
    airlines: ['BW', 'B6', 'AA', 'DL', 'AC', 'BA', 'VS'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['POS', 'MIA', 'JFK', 'YYZ', 'LHR', 'MAN', 'FRA'],
    searchKeywords: ['bridgetown', 'barbados', 'caribbean', 'grantley adams', 'bajan'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Nassau Lynden Pindling International Airport
  {
    iataCode: 'NAS',
    icaoCode: 'MYNN',
    name: 'Lynden Pindling International Airport',
    city: 'Nassau',
    state: 'New Providence',
    stateCode: 'NP',
    region: 'Central',
    country: 'Bahamas',
    countryCode: 'BS',
    timezone: 'America/Nassau',
    coordinates: { latitude: 25.0389, longitude: -77.4661 },
    elevation: 4,
    category: 'regional',
    isInternational: true,
    passengerCount: 3.5,
    airlines: ['UP', 'B6', 'AA', 'DL', 'UA', 'WN', 'AC', 'BA'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['MIA', 'FLL', 'JFK', 'ATL', 'ORD', 'YYZ', 'LHR'],
    searchKeywords: ['nassau', 'bahamas', 'caribbean', 'lynden pindling', 'paradise island'],
    groundTransport: ['bus', 'taxi', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * COMPLETE NORTH & CENTRAL AMERICA AIRPORTS DATABASE
 */
export const NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE: NorthCentralAmericaAirport[] = [
  ...MEXICO_AIRPORTS,
  ...CANADA_AIRPORTS,
  ...CENTRAL_AMERICA_AIRPORTS,
  ...CARIBBEAN_AIRPORTS
];

/**
 * POPULAR NORTH & CENTRAL AMERICAN ROUTES - Common city pairs for quick suggestions
 */
export const POPULAR_NORTH_CENTRAL_AMERICA_ROUTES = [
  { from: 'LAX', to: 'MEX', route: 'Los Angeles → Mexico City', popularity: 95 },
  { from: 'MEX', to: 'LAX', route: 'Mexico City → Los Angeles', popularity: 95 },
  { from: 'YYZ', to: 'YVR', route: 'Toronto → Vancouver', popularity: 90 },
  { from: 'DFW', to: 'CUN', route: 'Dallas → Cancún', popularity: 88 },
  { from: 'MIA', to: 'PTY', route: 'Miami → Panama City', popularity: 85 },
  { from: 'YYZ', to: 'YUL', route: 'Toronto → Montreal', popularity: 83 },
  { from: 'LAX', to: 'GDL', route: 'Los Angeles → Guadalajara', popularity: 82 },
  { from: 'MIA', to: 'SJO', route: 'Miami → San José', popularity: 80 },
  { from: 'JFK', to: 'SJU', route: 'New York → San Juan', popularity: 78 },
  { from: 'DFW', to: 'GUA', route: 'Dallas → Guatemala City', popularity: 75 }
];

/**
 * NORTH & CENTRAL AMERICAN TIMEZONE MAPPING
 */
export const NORTH_CENTRAL_AMERICA_TIMEZONE_MAP = {
  // North America
  'America/Los_Angeles': 'Pacific Time (PST/PDT)',
  'America/Denver': 'Mountain Time (MST/MDT)',
  'America/Chicago': 'Central Time (CST/CDT)',
  'America/New_York': 'Eastern Time (EST/EDT)',
  'America/Toronto': 'Eastern Time (EST/EDT)',
  'America/Montreal': 'Eastern Time (EST/EDT)',
  'America/Vancouver': 'Pacific Time (PST/PDT)',
  'America/Edmonton': 'Mountain Time (MST/MDT)',
  'America/Winnipeg': 'Central Time (CST/CDT)',
  'America/Halifax': 'Atlantic Time (AST/ADT)',
  
  // Mexico
  'America/Mexico_City': 'Central Time (CST/CDT)',
  'America/Cancun': 'Eastern Time (EST)',
  'America/Monterrey': 'Central Time (CST/CDT)',
  'America/Tijuana': 'Pacific Time (PST/PDT)',
  'America/Mazatlan': 'Mountain Time (MST/MDT)',
  'America/Merida': 'Central Time (CST/CDT)',
  
  // Central America
  'America/Guatemala': 'Central Time (CST)',
  'America/Belize': 'Central Time (CST)',
  'America/El_Salvador': 'Central Time (CST)',
  'America/Tegucigalpa': 'Central Time (CST)',
  'America/Managua': 'Central Time (CST)',
  'America/Costa_Rica': 'Central Time (CST)',
  'America/Panama': 'Eastern Time (EST)',
  
  // Caribbean
  'America/Havana': 'Cuba Time (CST/CDT)',
  'America/Jamaica': 'Eastern Time (EST)',
  'America/Port-au-Prince': 'Eastern Time (EST/EDT)',
  'America/Santo_Domingo': 'Atlantic Time (AST)',
  'America/Puerto_Rico': 'Atlantic Time (AST)',
  'America/Port_of_Spain': 'Atlantic Time (AST)',
  'America/Barbados': 'Atlantic Time (AST)',
  'America/Nassau': 'Eastern Time (EST/EDT)'
};

/**
 * NORTH & CENTRAL AMERICAN REGIONS MAPPING
 */
export const NORTH_CENTRAL_AMERICA_REGIONS = {
  'United States': ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West', 'Northwest', 'Alaska', 'Hawaii'],
  'Canada': ['Atlantic', 'Central', 'Western', 'Northern'],
  'Mexico': ['Northern', 'Northwestern', 'Central', 'Western', 'Pacific Coast', 'Southeastern', 'Caribbean'],
  'Guatemala': ['Central', 'Northern', 'Eastern', 'Western'],
  'Belize': ['Northern', 'Central', 'Southern', 'Coastal'],
  'El Salvador': ['Central', 'Eastern', 'Western'],
  'Honduras': ['Northern', 'Central', 'Southern', 'Eastern'],
  'Nicaragua': ['Pacific', 'Central', 'Atlantic'],
  'Costa Rica': ['Central Valley', 'Pacific Coast', 'Caribbean Coast', 'Northern'],
  'Panama': ['Central', 'Eastern', 'Western'],
  'Caribbean': ['Greater Antilles', 'Lesser Antilles', 'Leeward Islands', 'Windward Islands']
};

/**
 * AIRPORT SEARCH INDEX - Optimized for fast searching
 */
export const createNorthCentralAmericaAirportSearchIndex = () => {
  const searchIndex = new Map<string, NorthCentralAmericaAirport[]>();
  
  NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE.forEach(airport => {
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