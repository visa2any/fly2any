/**
 * 🇺🇸 COMPREHENSIVE US AIRPORTS DATABASE
 * Complete database of US airports with major hubs, regional airports, and international gateways
 * Data optimized for flight booking and search functionality
 */

export interface USAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  region: 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West' | 'Northwest' | 'Alaska' | 'Hawaii';
  country: 'United States';
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevation: number; // feet above sea level
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
  
  // 🇺🇸 US-SPECIFIC TRAVEL EXPERIENCE FEATURES
  security?: {
    tsaPrecheck: boolean;
    globalEntry: boolean;
    clear: boolean;
    averageWaitTimes: {
      standard: number; // minutes
      precheck: number;
      peak: number;
      offPeak: number;
    };
    checkpointHours: {
      open: string;
      close: string;
      early?: string; // for early morning flights
    };
  };
  usAmenities?: {
    lounges: {
      airline: { name: string; terminal: string; access: string[]; dayPass?: number }[];
      independent: { name: string; terminal: string; dayPass: number }[];
      creditCard: { name: string; terminal: string; cards: string[] }[];
    };
    dining: {
      fastFood: string[];
      restaurants: string[];
      cafes: string[];
      bars: string[];
      localSpecialties: string[];
    };
    shopping: {
      newsStands: boolean;
      electronics: boolean;
      fashion: boolean;
      gifts: boolean;
      dutyFree: boolean;
      bookstore: boolean;
    };
    services: {
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
    technology: {
      freeWifi: boolean;
      chargingStations: boolean;
      businessCenter: boolean;
      printServices: boolean;
      appBasedServices: string[];
    };
    families: {
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
    creditCardBenefits: {
      freeCheckedBags: string[]; // which cards offer this
      priorityBoarding: string[];
      loungeAccess: string[];
    };
  };
  domesticTravel?: {
    noPassportRequired: boolean;
    realIdRequired: boolean;
    frequentRoutes: string[]; // popular domestic destinations from this airport
    averageDomesticFlightTime: number; // minutes
    domesticTerminals: string[];
  };
  internationalTravel?: {
    customsAndBorder: boolean;
    globalEntryKiosks: boolean;
    immigrationHours: { open: string; close: string };
    dutyFree: boolean;
    currencyExchange: boolean;
    internationalTerminals: string[];
    precheck: {
      countries: string[]; // countries with preclearance
      available: boolean;
    };
  };
}

/**
 * MAJOR US AIRPORT HUBS - Top tier airports
 */
export const US_MAJOR_HUBS: USAirport[] = [
  // Los Angeles International Airport
  {
    iataCode: 'LAX',
    icaoCode: 'KLAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    state: 'California',
    stateCode: 'CA',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 33.9425, longitude: -118.4081 },
    elevation: 125,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 87.5,
    airlines: ['AA', 'DL', 'UA', 'WN', 'AS', 'B6'],
    terminals: 9,
    runways: 4,
    popularDestinations: ['JFK', 'SFO', 'ORD', 'DFW', 'LAS', 'SEA', 'DEN', 'PHX'],
    searchKeywords: ['los angeles', 'la', 'california', 'west coast'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference'],
    
    // 🇺🇸 US-SPECIFIC FEATURES
    security: {
      tsaPrecheck: true,
      globalEntry: true,
      clear: true,
      averageWaitTimes: {
        standard: 25,
        precheck: 8,
        peak: 40,
        offPeak: 15
      },
      checkpointHours: {
        open: '04:00',
        close: '23:30',
        early: '03:30'
      }
    },
    usAmenities: {
      lounges: {
        airline: [
          { name: 'American Airlines Admirals Club', terminal: 'Terminal 4', access: ['First/Business', 'Status', 'Day Pass'], dayPass: 59 },
          { name: 'Delta Sky Club', terminal: 'Terminal 2', access: ['First/Business', 'Status', 'Amex Platinum'], dayPass: 59 },
          { name: 'United Club', terminal: 'Terminal 7', access: ['First/Business', 'Status', 'Chase Cards'], dayPass: 59 }
        ],
        independent: [
          { name: 'The Private Suite', terminal: 'All Terminals', dayPass: 4000 }
        ],
        creditCard: [
          { name: 'Centurion Lounge', terminal: 'Terminal 4', cards: ['Amex Platinum', 'Amex Centurion'] },
          { name: 'Chase Sapphire Lounge', terminal: 'Terminal 3', cards: ['Chase Sapphire Reserve'] }
        ]
      },
      dining: {
        fastFood: ['In-N-Out Burger', 'McDonalds', 'Burger King', 'Panda Express', 'Subway'],
        restaurants: ['Spago', 'LAX Beer & Wine Co', 'Rock & Brews', 'Loteria! Grill'],
        cafes: ['Starbucks', 'Peets Coffee', 'Blue Bottle Coffee', 'Urth Caffe'],
        bars: ['LAX Beer & Wine Co', 'Rock & Brews', 'Vino Volo'],
        localSpecialties: ['California Pizza Kitchen', 'Pink Taco', 'Loteria! Grill']
      },
      shopping: {
        newsStands: true,
        electronics: true,
        fashion: true,
        gifts: true,
        dutyFree: true,
        bookstore: true
      },
      services: {
        currencyExchange: true,
        pharmacy: true,
        medical: true,
        banking: true,
        postOffice: false,
        luggageStorage: true,
        showers: true,
        sleepingPods: false,
        petRelief: true
      },
      technology: {
        freeWifi: true,
        chargingStations: true,
        businessCenter: true,
        printServices: true,
        appBasedServices: ['Mobile Order', 'Gate Info', 'Terminal Maps']
      },
      families: {
        nursingRooms: true,
        playAreas: true,
        familyRestrooms: true,
        strollerRental: true,
        unaccompaniedMinorServices: true
      }
    },
    loyaltyPrograms: {
      primaryAirlines: [
        { airline: 'AA', program: 'AAdvantage', benefits: ['Priority boarding', 'Free bags', 'Upgrades'], loungeAccess: true },
        { airline: 'DL', program: 'SkyMiles', benefits: ['Priority boarding', 'Free bags', 'Sky Club access'], loungeAccess: true },
        { airline: 'UA', program: 'MileagePlus', benefits: ['Priority boarding', 'Free bags', 'United Club access'], loungeAccess: true }
      ],
      creditCardBenefits: {
        freeCheckedBags: ['AA Citi Card', 'Delta Amex', 'United Chase Card'],
        priorityBoarding: ['AA Citi Card', 'Delta Amex', 'United Chase Card'],
        loungeAccess: ['Amex Platinum', 'Chase Sapphire Reserve', 'Citi Prestige']
      }
    },
    domesticTravel: {
      noPassportRequired: true,
      realIdRequired: true,
      frequentRoutes: ['SFO', 'LAS', 'SEA', 'DEN', 'PHX', 'ORD', 'JFK'],
      averageDomesticFlightTime: 180,
      domesticTerminals: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5', 'Terminal 6', 'Terminal 7']
    },
    internationalTravel: {
      customsAndBorder: true,
      globalEntryKiosks: true,
      immigrationHours: { open: '05:00', close: '23:00' },
      dutyFree: true,
      currencyExchange: true,
      internationalTerminals: ['Terminal B (TBIT)', 'Terminal 2', 'Terminal 4', 'Terminal 5'],
      precheck: {
        countries: ['Canada', 'Ireland'],
        available: true
      }
    }
  },

  // John F. Kennedy International Airport
  {
    iataCode: 'JFK',
    icaoCode: 'KJFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'New York',
    stateCode: 'NY',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.6413, longitude: -73.7781 },
    elevation: 13,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 62.5,
    airlines: ['AA', 'DL', 'UA', 'B6', 'WN'],
    terminals: 6,
    runways: 4,
    popularDestinations: ['LAX', 'SFO', 'MIA', 'ORD', 'ATL', 'BOS', 'DCA', 'LAS'],
    searchKeywords: ['new york', 'nyc', 'kennedy', 'queens', 'jfk'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // O'Hare International Airport
  {
    iataCode: 'ORD',
    icaoCode: 'KORD',
    name: "O'Hare International Airport",
    city: 'Chicago',
    state: 'Illinois',
    stateCode: 'IL',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 41.9742, longitude: -87.9073 },
    elevation: 672,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 84.0,
    airlines: ['AA', 'UA', 'DL', 'WN', 'F9'],
    terminals: 4,
    runways: 7,
    popularDestinations: ['LAX', 'JFK', 'DFW', 'ATL', 'DEN', 'SFO', 'LAS', 'PHX'],
    searchKeywords: ['chicago', 'ohare', "o'hare", 'illinois', 'midwest'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Dallas/Fort Worth International Airport
  {
    iataCode: 'DFW',
    icaoCode: 'KDFW',
    name: 'Dallas/Fort Worth International Airport',
    city: 'Dallas',
    state: 'Texas',
    stateCode: 'TX',
    region: 'Southwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 32.8968, longitude: -97.0380 },
    elevation: 607,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 75.0,
    airlines: ['AA', 'DL', 'UA', 'WN', 'F9'],
    terminals: 5,
    runways: 7,
    popularDestinations: ['LAX', 'ORD', 'ATL', 'JFK', 'DEN', 'PHX', 'IAH', 'MIA'],
    searchKeywords: ['dallas', 'fort worth', 'texas', 'dfw', 'southwest'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Hartsfield-Jackson Atlanta International Airport
  {
    iataCode: 'ATL',
    icaoCode: 'KATL',
    name: 'Hartsfield-Jackson Atlanta International Airport',
    city: 'Atlanta',
    state: 'Georgia',
    stateCode: 'GA',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 33.6407, longitude: -84.4277 },
    elevation: 1026,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 107.4,
    airlines: ['DL', 'WN', 'AA', 'UA', 'F9'],
    terminals: 7,
    runways: 5,
    popularDestinations: ['LAX', 'ORD', 'DFW', 'JFK', 'MIA', 'DEN', 'LAS', 'BOS'],
    searchKeywords: ['atlanta', 'hartsfield', 'jackson', 'georgia', 'southeast'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Miami International Airport
  {
    iataCode: 'MIA',
    icaoCode: 'KMIA',
    name: 'Miami International Airport',
    city: 'Miami',
    state: 'Florida',
    stateCode: 'FL',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 25.7959, longitude: -80.2870 },
    elevation: 8,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 52.3,
    airlines: ['AA', 'DL', 'UA', 'F9', 'B6'],
    terminals: 4,
    runways: 4,
    popularDestinations: ['JFK', 'LAX', 'ATL', 'ORD', 'DFW', 'LGA', 'BOS', 'DCA'],
    searchKeywords: ['miami', 'florida', 'south florida', 'southeast'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // LaGuardia Airport
  {
    iataCode: 'LGA',
    icaoCode: 'KLGA',
    name: 'LaGuardia Airport',
    city: 'New York',
    state: 'New York',
    stateCode: 'NY',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.7769, longitude: -73.8740 },
    elevation: 21,
    category: 'hub',
    isInternational: false,
    passengerCount: 31.1,
    airlines: ['AA', 'DL', 'UA', 'WN', 'B6'],
    terminals: 4,
    runways: 2,
    popularDestinations: ['MIA', 'ORD', 'ATL', 'DFW', 'BOS', 'DCA', 'CLT', 'DTW'],
    searchKeywords: ['laguardia', 'new york', 'nyc', 'queens', 'lga'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * MAJOR US HUB AIRPORTS - Second tier important airports
 */
export const US_HUB_AIRPORTS: USAirport[] = [
  // San Francisco International Airport
  {
    iataCode: 'SFO',
    icaoCode: 'KSFO',
    name: 'San Francisco International Airport',
    city: 'San Francisco',
    state: 'California',
    stateCode: 'CA',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 33.9768, longitude: -118.3965 },
    elevation: 13,
    category: 'hub',
    isInternational: true,
    passengerCount: 57.4,
    airlines: ['UA', 'AA', 'DL', 'WN', 'AS'],
    terminals: 4,
    runways: 4,
    popularDestinations: ['LAX', 'JFK', 'ORD', 'DFW', 'ATL', 'SEA', 'DEN', 'LAS'],
    searchKeywords: ['san francisco', 'sf', 'california', 'bay area', 'silicon valley'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Denver International Airport
  {
    iataCode: 'DEN',
    icaoCode: 'KDEN',
    name: 'Denver International Airport',
    city: 'Denver',
    state: 'Colorado',
    stateCode: 'CO',
    region: 'West',
    country: 'United States',
    timezone: 'America/Denver',
    coordinates: { latitude: 39.8561, longitude: -104.6737 },
    elevation: 5431,
    category: 'hub',
    isInternational: true,
    passengerCount: 69.3,
    airlines: ['UA', 'WN', 'F9', 'AA', 'DL'],
    terminals: 3,
    runways: 6,
    popularDestinations: ['LAX', 'ORD', 'DFW', 'ATL', 'SFO', 'SEA', 'PHX', 'LAS'],
    searchKeywords: ['denver', 'colorado', 'rocky mountains', 'midwest'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Seattle-Tacoma International Airport
  {
    iataCode: 'SEA',
    icaoCode: 'KSEA',
    name: 'Seattle-Tacoma International Airport',
    city: 'Seattle',
    state: 'Washington',
    stateCode: 'WA',
    region: 'Northwest',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 47.4502, longitude: -122.3088 },
    elevation: 131,
    category: 'hub',
    isInternational: true,
    passengerCount: 51.8,
    airlines: ['AS', 'DL', 'UA', 'AA', 'WN'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['LAX', 'SFO', 'DEN', 'ORD', 'ATL', 'JFK', 'LAS', 'PHX'],
    searchKeywords: ['seattle', 'tacoma', 'washington', 'pacific northwest', 'seatac'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Phoenix Sky Harbor International Airport
  {
    iataCode: 'PHX',
    icaoCode: 'KPHX',
    name: 'Phoenix Sky Harbor International Airport',
    city: 'Phoenix',
    state: 'Arizona',
    stateCode: 'AZ',
    region: 'Southwest',
    country: 'United States',
    timezone: 'America/Phoenix',
    coordinates: { latitude: 33.4342, longitude: -112.0116 },
    elevation: 1135,
    category: 'hub',
    isInternational: true,
    passengerCount: 48.4,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 4,
    runways: 3,
    popularDestinations: ['LAX', 'DFW', 'ORD', 'ATL', 'DEN', 'SFO', 'SEA', 'LAS'],
    searchKeywords: ['phoenix', 'arizona', 'sky harbor', 'southwest', 'desert'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Las Vegas McCarran International Airport
  {
    iataCode: 'LAS',
    icaoCode: 'KLAS',
    name: 'Harry Reid International Airport',
    city: 'Las Vegas',
    state: 'Nevada',
    stateCode: 'NV',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 36.0800, longitude: -115.1522 },
    elevation: 2181,
    category: 'hub',
    isInternational: true,
    passengerCount: 52.6,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9', 'B6'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['LAX', 'ORD', 'DFW', 'ATL', 'JFK', 'SFO', 'DEN', 'PHX'],
    searchKeywords: ['las vegas', 'vegas', 'nevada', 'mccarran', 'harry reid'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Boston Logan International Airport
  {
    iataCode: 'BOS',
    icaoCode: 'KBOS',
    name: 'Boston Logan International Airport',
    city: 'Boston',
    state: 'Massachusetts',
    stateCode: 'MA',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 42.3656, longitude: -71.0096 },
    elevation: 19,
    category: 'hub',
    isInternational: true,
    passengerCount: 42.5,
    airlines: ['B6', 'AA', 'DL', 'UA', 'WN'],
    terminals: 4,
    runways: 6,
    popularDestinations: ['JFK', 'LGA', 'DCA', 'MIA', 'ATL', 'ORD', 'LAX', 'SFO'],
    searchKeywords: ['boston', 'logan', 'massachusetts', 'new england', 'northeast'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  }
];

/**
 * ADDITIONAL HUB AIRPORTS - More major airports
 */
export const US_ADDITIONAL_HUBS: USAirport[] = [
  // Fort Lauderdale-Hollywood International Airport
  {
    iataCode: 'FLL',
    icaoCode: 'KFLL',
    name: 'Fort Lauderdale-Hollywood International Airport',
    city: 'Fort Lauderdale',
    state: 'Florida',
    stateCode: 'FL',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 26.0742, longitude: -80.1506 },
    elevation: 9,
    category: 'hub',
    isInternational: true,
    passengerCount: 36.2,
    airlines: ['B6', 'WN', 'NK', 'AA', 'DL'],
    terminals: 4,
    runways: 2,
    popularDestinations: ['JFK', 'LGA', 'BOS', 'ATL', 'ORD', 'DCA', 'CLT', 'PHL'],
    searchKeywords: ['fort lauderdale', 'hollywood', 'south florida', 'broward'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Tampa International Airport
  {
    iataCode: 'TPA',
    icaoCode: 'KTPA',
    name: 'Tampa International Airport',
    city: 'Tampa',
    state: 'Florida',
    stateCode: 'FL',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 27.9755, longitude: -82.5332 },
    elevation: 26,
    category: 'regional',
    isInternational: true,
    passengerCount: 21.7,
    airlines: ['WN', 'DL', 'AA', 'UA', 'B6'],
    terminals: 4,
    runways: 3,
    popularDestinations: ['ATL', 'JFK', 'LGA', 'ORD', 'DCA', 'BOS', 'CLT', 'MIA'],
    searchKeywords: ['tampa', 'bay area', 'florida', 'west florida'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Nashville International Airport
  {
    iataCode: 'BNA',
    icaoCode: 'KBNA',
    name: 'Nashville International Airport',
    city: 'Nashville',
    state: 'Tennessee',
    stateCode: 'TN',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 36.1245, longitude: -86.6782 },
    elevation: 599,
    category: 'regional',
    isInternational: true,
    passengerCount: 18.3,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 1,
    runways: 4,
    popularDestinations: ['ATL', 'ORD', 'DFW', 'DEN', 'JFK', 'LAX', 'CLT', 'MIA'],
    searchKeywords: ['nashville', 'music city', 'tennessee', 'southeast'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Austin-Bergstrom International Airport
  {
    iataCode: 'AUS',
    icaoCode: 'KAUS',
    name: 'Austin-Bergstrom International Airport',
    city: 'Austin',
    state: 'Texas',
    stateCode: 'TX',
    region: 'Southwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 30.1975, longitude: -97.6664 },
    elevation: 542,
    category: 'regional',
    isInternational: true,
    passengerCount: 17.2,
    airlines: ['WN', 'AA', 'DL', 'UA', 'B6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['DFW', 'ATL', 'ORD', 'DEN', 'LAX', 'JFK', 'PHX', 'IAH'],
    searchKeywords: ['austin', 'bergstrom', 'texas', 'capital', 'tech'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // San Antonio International Airport
  {
    iataCode: 'SAT',
    icaoCode: 'KSAT',
    name: 'San Antonio International Airport',
    city: 'San Antonio',
    state: 'Texas',
    stateCode: 'TX',
    region: 'Southwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 29.5337, longitude: -98.4698 },
    elevation: 809,
    category: 'regional',
    isInternational: true,
    passengerCount: 10.6,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 2,
    runways: 3,
    popularDestinations: ['DFW', 'IAH', 'ATL', 'ORD', 'DEN', 'LAX', 'PHX', 'LAS'],
    searchKeywords: ['san antonio', 'texas', 'alamo', 'south texas'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * REGIONAL US AIRPORTS - Important regional and focus city airports
 */
export const US_REGIONAL_AIRPORTS: USAirport[] = [
  // Ronald Reagan Washington National Airport
  {
    iataCode: 'DCA',
    icaoCode: 'KDCA',
    name: 'Ronald Reagan Washington National Airport',
    city: 'Washington',
    state: 'District of Columbia',
    stateCode: 'DC',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 38.8512, longitude: -77.0402 },
    elevation: 15,
    category: 'regional',
    isInternational: false,
    passengerCount: 25.2,
    airlines: ['AA', 'DL', 'UA', 'WN', 'B6'],
    terminals: 3,
    runways: 3,
    popularDestinations: ['JFK', 'LGA', 'BOS', 'ATL', 'ORD', 'MIA', 'LAX', 'SFO'],
    searchKeywords: ['washington', 'reagan', 'national', 'dc', 'virginia', 'capitol'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Washington Dulles International Airport
  {
    iataCode: 'IAD',
    icaoCode: 'KIAD',
    name: 'Washington Dulles International Airport',
    city: 'Washington',
    state: 'Virginia',
    stateCode: 'VA',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 38.9531, longitude: -77.4565 },
    elevation: 313,
    category: 'international_gateway',
    isInternational: true,
    passengerCount: 24.6,
    airlines: ['UA', 'AA', 'DL', 'WN', 'F9'],
    terminals: 5,
    runways: 4,
    popularDestinations: ['JFK', 'LAX', 'ORD', 'ATL', 'SFO', 'DEN', 'MIA', 'BOS'],
    searchKeywords: ['washington', 'dulles', 'virginia', 'dc', 'international'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Houston George Bush Intercontinental Airport
  {
    iataCode: 'IAH',
    icaoCode: 'KIAH',
    name: 'George Bush Intercontinental Airport',
    city: 'Houston',
    state: 'Texas',
    stateCode: 'TX',
    region: 'Southwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 29.9902, longitude: -95.3368 },
    elevation: 97,
    category: 'hub',
    isInternational: true,
    passengerCount: 45.4,
    airlines: ['UA', 'WN', 'AA', 'DL', 'F9'],
    terminals: 5,
    runways: 5,
    popularDestinations: ['DFW', 'ATL', 'ORD', 'LAX', 'DEN', 'JFK', 'MIA', 'PHX'],
    searchKeywords: ['houston', 'bush', 'intercontinental', 'texas', 'iah'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Charlotte Douglas International Airport
  {
    iataCode: 'CLT',
    icaoCode: 'KCLT',
    name: 'Charlotte Douglas International Airport',
    city: 'Charlotte',
    state: 'North Carolina',
    stateCode: 'NC',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 35.2144, longitude: -80.9473 },
    elevation: 748,
    category: 'hub',
    isInternational: true,
    passengerCount: 50.2,
    airlines: ['AA', 'DL', 'UA', 'WN', 'B6'],
    terminals: 5,
    runways: 4,
    popularDestinations: ['ATL', 'JFK', 'LGA', 'MIA', 'DCA', 'ORD', 'DFW', 'BOS'],
    searchKeywords: ['charlotte', 'douglas', 'north carolina', 'southeast'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Detroit Metropolitan Wayne County Airport
  {
    iataCode: 'DTW',
    icaoCode: 'KDTW',
    name: 'Detroit Metropolitan Wayne County Airport',
    city: 'Detroit',
    state: 'Michigan',
    stateCode: 'MI',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 42.2162, longitude: -83.3554 },
    elevation: 645,
    category: 'hub',
    isInternational: true,
    passengerCount: 34.9,
    airlines: ['DL', 'AA', 'UA', 'WN', 'F9'],
    terminals: 2,
    runways: 7,
    popularDestinations: ['ATL', 'ORD', 'JFK', 'LGA', 'MIA', 'DFW', 'LAX', 'BOS'],
    searchKeywords: ['detroit', 'metropolitan', 'wayne', 'michigan', 'midwest'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Newark Liberty International Airport
  {
    iataCode: 'EWR',
    icaoCode: 'KEWR',
    name: 'Newark Liberty International Airport',
    city: 'Newark',
    state: 'New Jersey',
    stateCode: 'NJ',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.6895, longitude: -74.1745 },
    elevation: 18,
    category: 'hub',
    isInternational: true,
    passengerCount: 46.3,
    airlines: ['UA', 'AA', 'DL', 'WN', 'B6'],
    terminals: 3,
    runways: 3,
    popularDestinations: ['JFK', 'LAX', 'ORD', 'ATL', 'SFO', 'MIA', 'DFW', 'BOS'],
    searchKeywords: ['newark', 'liberty', 'new jersey', 'nyc area', 'northeast'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Orlando International Airport
  {
    iataCode: 'MCO',
    icaoCode: 'KMCO',
    name: 'Orlando International Airport',
    city: 'Orlando',
    state: 'Florida',
    stateCode: 'FL',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 28.4312, longitude: -81.3081 },
    elevation: 96,
    category: 'hub',
    isInternational: true,
    passengerCount: 50.6,
    airlines: ['WN', 'B6', 'AA', 'DL', 'UA'],
    terminals: 4,
    runways: 4,
    popularDestinations: ['JFK', 'LGA', 'ATL', 'DCA', 'BOS', 'ORD', 'LAX', 'MIA'],
    searchKeywords: ['orlando', 'disney', 'florida', 'theme parks', 'central florida'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa']
  },

  // Minneapolis-Saint Paul International Airport
  {
    iataCode: 'MSP',
    icaoCode: 'KMSP',
    name: 'Minneapolis-Saint Paul International Airport',
    city: 'Minneapolis',
    state: 'Minnesota',
    stateCode: 'MN',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 44.8848, longitude: -93.2223 },
    elevation: 834,
    category: 'hub',
    isInternational: true,
    passengerCount: 38.5,
    airlines: ['DL', 'AA', 'UA', 'WN', 'F9'],
    terminals: 2,
    runways: 4,
    popularDestinations: ['ATL', 'ORD', 'DFW', 'DEN', 'LAX', 'JFK', 'SEA', 'PHX'],
    searchKeywords: ['minneapolis', 'saint paul', 'twin cities', 'minnesota', 'midwest'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Philadelphia International Airport
  {
    iataCode: 'PHL',
    icaoCode: 'KPHL',
    name: 'Philadelphia International Airport',
    city: 'Philadelphia',
    state: 'Pennsylvania',
    stateCode: 'PA',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 39.8729, longitude: -75.2437 },
    elevation: 36,
    category: 'hub',
    isInternational: true,
    passengerCount: 32.0,
    airlines: ['AA', 'DL', 'UA', 'WN', 'F9'],
    terminals: 7,
    runways: 4,
    popularDestinations: ['JFK', 'LGA', 'ATL', 'ORD', 'MIA', 'DCA', 'BOS', 'LAX'],
    searchKeywords: ['philadelphia', 'philly', 'pennsylvania', 'northeast'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Portland International Airport
  {
    iataCode: 'PDX',
    icaoCode: 'KPDX',
    name: 'Portland International Airport',
    city: 'Portland',
    state: 'Oregon',
    stateCode: 'OR',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 45.5898, longitude: -122.5951 },
    elevation: 31,
    category: 'regional',
    isInternational: true,
    passengerCount: 19.8,
    airlines: ['AS', 'DL', 'UA', 'AA', 'WN'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['SEA', 'SFO', 'LAX', 'DEN', 'ORD', 'ATL', 'JFK', 'LAS'],
    searchKeywords: ['portland', 'oregon', 'pacific northwest', 'rose city'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Salt Lake City International Airport
  {
    iataCode: 'SLC',
    icaoCode: 'KSLC',
    name: 'Salt Lake City International Airport',
    city: 'Salt Lake City',
    state: 'Utah',
    stateCode: 'UT',
    region: 'West',
    country: 'United States',
    timezone: 'America/Denver',
    coordinates: { latitude: 40.7899, longitude: -111.9791 },
    elevation: 4227,
    category: 'regional',
    isInternational: true,
    passengerCount: 26.8,
    airlines: ['DL', 'WN', 'AA', 'UA', 'F9'],
    terminals: 2,
    runways: 4,
    popularDestinations: ['DEN', 'LAX', 'SFO', 'SEA', 'ORD', 'ATL', 'JFK', 'PHX'],
    searchKeywords: ['salt lake city', 'utah', 'mountain west', 'slc'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Kansas City International Airport
  {
    iataCode: 'MCI',
    icaoCode: 'KMCI',
    name: 'Kansas City International Airport',
    city: 'Kansas City',
    state: 'Missouri',
    stateCode: 'MO',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 39.2976, longitude: -94.7139 },
    elevation: 1026,
    category: 'regional',
    isInternational: true,
    passengerCount: 11.2,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['DFW', 'ORD', 'ATL', 'DEN', 'LAX', 'JFK', 'PHX', 'LAS'],
    searchKeywords: ['kansas city', 'missouri', 'midwest', 'kc'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // St. Louis Lambert International Airport
  {
    iataCode: 'STL',
    icaoCode: 'KSTL',
    name: 'St. Louis Lambert International Airport',
    city: 'St. Louis',
    state: 'Missouri',
    stateCode: 'MO',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 38.7487, longitude: -90.3700 },
    elevation: 618,
    category: 'regional',
    isInternational: true,
    passengerCount: 15.8,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 2,
    runways: 4,
    popularDestinations: ['ATL', 'ORD', 'DFW', 'DEN', 'JFK', 'LAX', 'PHX', 'CLT'],
    searchKeywords: ['st louis', 'saint louis', 'lambert', 'missouri', 'gateway'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Cleveland Hopkins International Airport
  {
    iataCode: 'CLE',
    icaoCode: 'KCLE',
    name: 'Cleveland Hopkins International Airport',
    city: 'Cleveland',
    state: 'Ohio',
    stateCode: 'OH',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 41.4117, longitude: -81.8498 },
    elevation: 791,
    category: 'regional',
    isInternational: true,
    passengerCount: 9.7,
    airlines: ['UA', 'AA', 'DL', 'WN', 'F9'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['ATL', 'ORD', 'JFK', 'LAX', 'DEN', 'MIA', 'DTW', 'CLT'],
    searchKeywords: ['cleveland', 'hopkins', 'ohio', 'great lakes', 'midwest'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Cincinnati/Northern Kentucky International Airport
  {
    iataCode: 'CVG',
    icaoCode: 'KCVG',
    name: 'Cincinnati/Northern Kentucky International Airport',
    city: 'Cincinnati',
    state: 'Ohio',
    stateCode: 'OH',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 39.0488, longitude: -84.6678 },
    elevation: 896,
    category: 'regional',
    isInternational: true,
    passengerCount: 9.2,
    airlines: ['DL', 'AA', 'UA', 'WN', 'F9'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['ATL', 'DTW', 'ORD', 'JFK', 'MIA', 'LAX', 'CLT', 'DFW'],
    searchKeywords: ['cincinnati', 'northern kentucky', 'ohio', 'kentucky', 'cvg'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Pittsburgh International Airport
  {
    iataCode: 'PIT',
    icaoCode: 'KPIT',
    name: 'Pittsburgh International Airport',
    city: 'Pittsburgh',
    state: 'Pennsylvania',
    stateCode: 'PA',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 40.4915, longitude: -80.2329 },
    elevation: 1203,
    category: 'regional',
    isInternational: true,
    passengerCount: 8.2,
    airlines: ['AA', 'DL', 'UA', 'WN', 'F9'],
    terminals: 1,
    runways: 4,
    popularDestinations: ['ATL', 'ORD', 'JFK', 'CLT', 'DTW', 'PHL', 'DCA', 'BOS'],
    searchKeywords: ['pittsburgh', 'pennsylvania', 'steel city', 'allegheny'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Buffalo Niagara International Airport
  {
    iataCode: 'BUF',
    icaoCode: 'KBUF',
    name: 'Buffalo Niagara International Airport',
    city: 'Buffalo',
    state: 'New York',
    stateCode: 'NY',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 42.9405, longitude: -78.7322 },
    elevation: 724,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 5.6,
    airlines: ['WN', 'DL', 'AA', 'UA', 'B6'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['JFK', 'LGA', 'ATL', 'ORD', 'DTW', 'CLT', 'PHL', 'BOS'],
    searchKeywords: ['buffalo', 'niagara', 'new york', 'western ny', 'upstate'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Rochester International Airport
  {
    iataCode: 'ROC',
    icaoCode: 'KROC',
    name: 'Greater Rochester International Airport',
    city: 'Rochester',
    state: 'New York',
    stateCode: 'NY',
    region: 'Northeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 43.1189, longitude: -77.6724 },
    elevation: 559,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.3,
    airlines: ['DL', 'AA', 'UA', 'WN', 'B6'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['JFK', 'LGA', 'ATL', 'DTW', 'ORD', 'CLT', 'PHL', 'BOS'],
    searchKeywords: ['rochester', 'new york', 'finger lakes', 'upstate ny'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * STATE CAPITAL AND SECONDARY CITY AIRPORTS
 */
export const US_SECONDARY_AIRPORTS: USAirport[] = [
  // Raleigh-Durham International Airport
  {
    iataCode: 'RDU',
    icaoCode: 'KRDU',
    name: 'Raleigh-Durham International Airport',
    city: 'Raleigh',
    state: 'North Carolina',
    stateCode: 'NC',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 35.8776, longitude: -78.7875 },
    elevation: 435,
    category: 'regional',
    isInternational: true,
    passengerCount: 14.5,
    airlines: ['AA', 'DL', 'UA', 'WN', 'B6'],
    terminals: 2,
    runways: 3,
    popularDestinations: ['ATL', 'CLT', 'JFK', 'LGA', 'ORD', 'MIA', 'DCA', 'BOS'],
    searchKeywords: ['raleigh', 'durham', 'research triangle', 'north carolina', 'rdu'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Richmond International Airport
  {
    iataCode: 'RIC',
    icaoCode: 'KRIC',
    name: 'Richmond International Airport',
    city: 'Richmond',
    state: 'Virginia',
    stateCode: 'VA',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 37.5052, longitude: -77.3197 },
    elevation: 167,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 4.2,
    airlines: ['AA', 'DL', 'UA', 'WN', 'B6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['ATL', 'CLT', 'JFK', 'DCA', 'ORD', 'MIA', 'PHL', 'BOS'],
    searchKeywords: ['richmond', 'virginia', 'capital', 'ric'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Norfolk International Airport
  {
    iataCode: 'ORF',
    icaoCode: 'KORF',
    name: 'Norfolk International Airport',
    city: 'Norfolk',
    state: 'Virginia',
    stateCode: 'VA',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 36.8946, longitude: -76.2012 },
    elevation: 26,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 3.5,
    airlines: ['AA', 'DL', 'UA', 'WN', 'F9'],
    terminals: 1,
    runways: 4,
    popularDestinations: ['ATL', 'CLT', 'JFK', 'DCA', 'ORD', 'MIA', 'PHL', 'DTW'],
    searchKeywords: ['norfolk', 'virginia beach', 'hampton roads', 'virginia'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Jacksonville International Airport
  {
    iataCode: 'JAX',
    icaoCode: 'KJAX',
    name: 'Jacksonville International Airport',
    city: 'Jacksonville',
    state: 'Florida',
    stateCode: 'FL',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/New_York',
    coordinates: { latitude: 30.4941, longitude: -81.6879 },
    elevation: 30,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 6.8,
    airlines: ['WN', 'AA', 'DL', 'UA', 'B6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['ATL', 'CLT', 'JFK', 'ORD', 'MIA', 'DCA', 'BOS', 'PHL'],
    searchKeywords: ['jacksonville', 'florida', 'northeast florida', 'jax'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Birmingham-Shuttlesworth International Airport
  {
    iataCode: 'BHM',
    icaoCode: 'KBHM',
    name: 'Birmingham-Shuttlesworth International Airport',
    city: 'Birmingham',
    state: 'Alabama',
    stateCode: 'AL',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 33.5629, longitude: -86.7535 },
    elevation: 650,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 3.1,
    airlines: ['AA', 'DL', 'UA', 'WN', 'F9'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['ATL', 'CLT', 'DFW', 'ORD', 'MIA', 'JFK', 'IAH', 'DEN'],
    searchKeywords: ['birmingham', 'alabama', 'magic city', 'shuttlesworth'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // New Orleans Louis Armstrong International Airport
  {
    iataCode: 'MSY',
    icaoCode: 'KMSY',
    name: 'Louis Armstrong New Orleans International Airport',
    city: 'New Orleans',
    state: 'Louisiana',
    stateCode: 'LA',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 29.9934, longitude: -90.2581 },
    elevation: 4,
    category: 'regional',
    isInternational: true,
    passengerCount: 13.2,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['ATL', 'DFW', 'IAH', 'ORD', 'JFK', 'MIA', 'CLT', 'DEN'],
    searchKeywords: ['new orleans', 'louis armstrong', 'louisiana', 'crescent city', 'nola'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Memphis International Airport
  {
    iataCode: 'MEM',
    icaoCode: 'KMEM',
    name: 'Memphis International Airport',
    city: 'Memphis',
    state: 'Tennessee',
    stateCode: 'TN',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 35.0424, longitude: -89.9767 },
    elevation: 341,
    category: 'regional',
    isInternational: true,
    passengerCount: 4.4,
    airlines: ['DL', 'AA', 'UA', 'WN', 'F9'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['ATL', 'DFW', 'ORD', 'CLT', 'DTW', 'JFK', 'IAH', 'DEN'],
    searchKeywords: ['memphis', 'tennessee', 'river city', 'fedex hub'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Little Rock National Airport
  {
    iataCode: 'LIT',
    icaoCode: 'KLIT',
    name: 'Bill and Hillary Clinton National Airport',
    city: 'Little Rock',
    state: 'Arkansas',
    stateCode: 'AR',
    region: 'Southeast',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 34.7294, longitude: -92.2243 },
    elevation: 262,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 2.4,
    airlines: ['AA', 'DL', 'UA', 'WN', 'F9'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['ATL', 'DFW', 'ORD', 'CLT', 'DTW', 'IAH', 'DEN', 'MEM'],
    searchKeywords: ['little rock', 'arkansas', 'clinton', 'capital'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Omaha Eppley Airfield
  {
    iataCode: 'OMA',
    icaoCode: 'KOMA',
    name: 'Eppley Airfield',
    city: 'Omaha',
    state: 'Nebraska',
    stateCode: 'NE',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 41.3032, longitude: -95.8941 },
    elevation: 984,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 4.6,
    airlines: ['WN', 'DL', 'AA', 'UA', 'F9'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['DEN', 'ORD', 'DFW', 'ATL', 'LAX', 'MCI', 'MSP', 'PHX'],
    searchKeywords: ['omaha', 'nebraska', 'eppley', 'midwest'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Des Moines International Airport
  {
    iataCode: 'DSM',
    icaoCode: 'KDSM',
    name: 'Des Moines International Airport',
    city: 'Des Moines',
    state: 'Iowa',
    stateCode: 'IA',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 41.5340, longitude: -93.6631 },
    elevation: 958,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 2.8,
    airlines: ['DL', 'AA', 'UA', 'WN', 'F9'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['ORD', 'MSP', 'DEN', 'ATL', 'DFW', 'DTW', 'MCI', 'PHX'],
    searchKeywords: ['des moines', 'iowa', 'capital', 'midwest'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Wichita Dwight D. Eisenhower National Airport
  {
    iataCode: 'ICT',
    icaoCode: 'KICT',
    name: 'Wichita Dwight D. Eisenhower National Airport',
    city: 'Wichita',
    state: 'Kansas',
    stateCode: 'KS',
    region: 'Midwest',
    country: 'United States',
    timezone: 'America/Chicago',
    coordinates: { latitude: 37.6499, longitude: -97.4331 },
    elevation: 1333,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.6,
    airlines: ['WN', 'DL', 'AA', 'UA', 'F9'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['DFW', 'DEN', 'ORD', 'ATL', 'LAX', 'MCI', 'STL', 'PHX'],
    searchKeywords: ['wichita', 'kansas', 'eisenhower', 'air capital'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * WESTERN US AIRPORTS - Mountain and Pacific regions
 */
export const US_WESTERN_AIRPORTS: USAirport[] = [
  // San Diego International Airport
  {
    iataCode: 'SAN',
    icaoCode: 'KSAN',
    name: 'San Diego International Airport',
    city: 'San Diego',
    state: 'California',
    stateCode: 'CA',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 32.7336, longitude: -117.1897 },
    elevation: 17,
    category: 'regional',
    isInternational: true,
    passengerCount: 25.2,
    airlines: ['WN', 'AA', 'DL', 'UA', 'AS'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['LAX', 'SFO', 'ORD', 'DFW', 'ATL', 'DEN', 'SEA', 'PHX'],
    searchKeywords: ['san diego', 'california', 'southern california', 'lindbergh'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // San Jose Mineta International Airport
  {
    iataCode: 'SJC',
    icaoCode: 'KSJC',
    name: 'Norman Y. Mineta San José International Airport',
    city: 'San Jose',
    state: 'California',
    stateCode: 'CA',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 37.3626, longitude: -121.9291 },
    elevation: 62,
    category: 'regional',
    isInternational: true,
    passengerCount: 15.4,
    airlines: ['WN', 'AA', 'DL', 'UA', 'AS'],
    terminals: 2,
    runways: 3,
    popularDestinations: ['LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'JFK', 'PHX'],
    searchKeywords: ['san jose', 'mineta', 'silicon valley', 'california', 'bay area'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Sacramento International Airport
  {
    iataCode: 'SMF',
    icaoCode: 'KSMF',
    name: 'Sacramento International Airport',
    city: 'Sacramento',
    state: 'California',
    stateCode: 'CA',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 38.6954, longitude: -121.5907 },
    elevation: 27,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 12.4,
    airlines: ['WN', 'AA', 'DL', 'UA', 'AS'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'JFK', 'PHX'],
    searchKeywords: ['sacramento', 'california', 'capital', 'central valley'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Fresno Yosemite International Airport
  {
    iataCode: 'FAT',
    icaoCode: 'KFAT',
    name: 'Fresno Yosemite International Airport',
    city: 'Fresno',
    state: 'California',
    stateCode: 'CA',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 36.7762, longitude: -119.7181 },
    elevation: 336,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.3,
    airlines: ['AA', 'DL', 'UA', 'WN', 'AS'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'PHX', 'LAS'],
    searchKeywords: ['fresno', 'yosemite', 'california', 'central valley'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Reno-Tahoe International Airport
  {
    iataCode: 'RNO',
    icaoCode: 'KRNO',
    name: 'Reno-Tahoe International Airport',
    city: 'Reno',
    state: 'Nevada',
    stateCode: 'NV',
    region: 'West',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 39.4991, longitude: -119.7681 },
    elevation: 4415,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 4.2,
    airlines: ['WN', 'AA', 'DL', 'UA', 'AS'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'PHX', 'LAS'],
    searchKeywords: ['reno', 'tahoe', 'nevada', 'biggest little city'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Boise Airport
  {
    iataCode: 'BOI',
    icaoCode: 'KBOI',
    name: 'Boise Airport',
    city: 'Boise',
    state: 'Idaho',
    stateCode: 'ID',
    region: 'West',
    country: 'United States',
    timezone: 'America/Boise',
    coordinates: { latitude: 43.5644, longitude: -116.2228 },
    elevation: 2871,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 3.9,
    airlines: ['WN', 'DL', 'AA', 'UA', 'AS'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['SEA', 'DEN', 'SLC', 'LAX', 'SFO', 'ORD', 'ATL', 'PHX'],
    searchKeywords: ['boise', 'idaho', 'treasure valley', 'capital'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Spokane International Airport
  {
    iataCode: 'GEG',
    icaoCode: 'KGEG',
    name: 'Spokane International Airport',
    city: 'Spokane',
    state: 'Washington',
    stateCode: 'WA',
    region: 'Northwest',
    country: 'United States',
    timezone: 'America/Los_Angeles',
    coordinates: { latitude: 47.6198, longitude: -117.5336 },
    elevation: 2376,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 3.8,
    airlines: ['AS', 'DL', 'UA', 'WN', 'AA'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['SEA', 'DEN', 'SLC', 'LAX', 'SFO', 'ORD', 'ATL', 'MSP'],
    searchKeywords: ['spokane', 'washington', 'inland northwest', 'eastern washington'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Billings Logan International Airport
  {
    iataCode: 'BIL',
    icaoCode: 'KBIL',
    name: 'Billings Logan International Airport',
    city: 'Billings',
    state: 'Montana',
    stateCode: 'MT',
    region: 'West',
    country: 'United States',
    timezone: 'America/Denver',
    coordinates: { latitude: 45.8077, longitude: -108.5428 },
    elevation: 3652,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.2,
    airlines: ['DL', 'UA', 'AA', 'WN', 'F9'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['DEN', 'MSP', 'SLC', 'SEA', 'ORD', 'ATL', 'LAX', 'SFO'],
    searchKeywords: ['billings', 'montana', 'magic city', 'yellowstone'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Cheyenne Regional Airport
  {
    iataCode: 'CYS',
    icaoCode: 'KCYS',
    name: 'Cheyenne Regional Airport',
    city: 'Cheyenne',
    state: 'Wyoming',
    stateCode: 'WY',
    region: 'West',
    country: 'United States',
    timezone: 'America/Denver',
    coordinates: { latitude: 41.1557, longitude: -104.8119 },
    elevation: 6156,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.2,
    airlines: ['DL', 'UA'],
    terminals: 1,
    runways: 3,
    popularDestinations: ['DEN', 'SLC', 'MSP', 'ORD', 'ATL', 'LAX', 'SFO', 'SEA'],
    searchKeywords: ['cheyenne', 'wyoming', 'capital', 'frontier'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'dining']
  },

  // Albuquerque International Sunport
  {
    iataCode: 'ABQ',
    icaoCode: 'KABQ',
    name: 'Albuquerque International Sunport',
    city: 'Albuquerque',
    state: 'New Mexico',
    stateCode: 'NM',
    region: 'Southwest',
    country: 'United States',
    timezone: 'America/Denver',
    coordinates: { latitude: 35.0402, longitude: -106.6093 },
    elevation: 5355,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 5.4,
    airlines: ['WN', 'AA', 'DL', 'UA', 'F9'],
    terminals: 1,
    runways: 4,
    popularDestinations: ['DEN', 'DFW', 'PHX', 'LAX', 'ORD', 'ATL', 'LAS', 'SLC'],
    searchKeywords: ['albuquerque', 'new mexico', 'sunport', 'land of enchantment'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * ALASKA AND HAWAII AIRPORTS
 */
export const US_ALASKA_HAWAII_AIRPORTS: USAirport[] = [
  // Ted Stevens Anchorage International Airport
  {
    iataCode: 'ANC',
    icaoCode: 'PANC',
    name: 'Ted Stevens Anchorage International Airport',
    city: 'Anchorage',
    state: 'Alaska',
    stateCode: 'AK',
    region: 'Alaska',
    country: 'United States',
    timezone: 'America/Anchorage',
    coordinates: { latitude: 61.1743, longitude: -149.9962 },
    elevation: 152,
    category: 'regional',
    isInternational: true,
    passengerCount: 5.8,
    airlines: ['AS', 'DL', 'UA', 'AA', 'F9'],
    terminals: 2,
    runways: 3,
    popularDestinations: ['SEA', 'FAI', 'JNU', 'LAX', 'SFO', 'DEN', 'ORD', 'ATL'],
    searchKeywords: ['anchorage', 'alaska', 'ted stevens', 'last frontier'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Fairbanks International Airport
  {
    iataCode: 'FAI',
    icaoCode: 'PAFA',
    name: 'Fairbanks International Airport',
    city: 'Fairbanks',
    state: 'Alaska',
    stateCode: 'AK',
    region: 'Alaska',
    country: 'United States',
    timezone: 'America/Anchorage',
    coordinates: { latitude: 64.8151, longitude: -147.8560 },
    elevation: 434,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.1,
    airlines: ['AS', 'DL', 'UA'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['ANC', 'SEA', 'JNU', 'LAX', 'SFO', 'DEN', 'ORD', 'ATL'],
    searchKeywords: ['fairbanks', 'alaska', 'golden heart city', 'interior'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Juneau International Airport
  {
    iataCode: 'JNU',
    icaoCode: 'PAJN',
    name: 'Juneau International Airport',
    city: 'Juneau',
    state: 'Alaska',
    stateCode: 'AK',
    region: 'Alaska',
    country: 'United States',
    timezone: 'America/Juneau',
    coordinates: { latitude: 58.3548, longitude: -134.5763 },
    elevation: 21,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.4,
    airlines: ['AS', 'DL'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['ANC', 'SEA', 'FAI', 'LAX', 'SFO', 'DEN', 'ORD', 'ATL'],
    searchKeywords: ['juneau', 'alaska', 'capital', 'southeast alaska'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Daniel K. Inouye International Airport (Honolulu)
  {
    iataCode: 'HNL',
    icaoCode: 'PHNL',
    name: 'Daniel K. Inouye International Airport',
    city: 'Honolulu',
    state: 'Hawaii',
    stateCode: 'HI',
    region: 'Hawaii',
    country: 'United States',
    timezone: 'Pacific/Honolulu',
    coordinates: { latitude: 21.3187, longitude: -157.9224 },
    elevation: 13,
    category: 'regional',
    isInternational: true,
    passengerCount: 21.3,
    airlines: ['HA', 'WN', 'AA', 'DL', 'UA'],
    terminals: 3,
    runways: 4,
    popularDestinations: ['LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'JFK', 'PHX'],
    searchKeywords: ['honolulu', 'hawaii', 'oahu', 'inouye', 'hnl', 'aloha'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'spa']
  },

  // Kahului Airport (Maui)
  {
    iataCode: 'OGG',
    icaoCode: 'PHOG',
    name: 'Kahului Airport',
    city: 'Kahului',
    state: 'Hawaii',
    stateCode: 'HI',
    region: 'Hawaii',
    country: 'United States',
    timezone: 'Pacific/Honolulu',
    coordinates: { latitude: 20.8986, longitude: -156.4306 },
    elevation: 54,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 7.2,
    airlines: ['HA', 'WN', 'AA', 'DL', 'UA'],
    terminals: 3,
    runways: 1,
    popularDestinations: ['HNL', 'LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'JFK'],
    searchKeywords: ['kahului', 'maui', 'hawaii', 'valley isle'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Ellison Onizuka Kona International Airport
  {
    iataCode: 'KOA',
    icaoCode: 'PHKO',
    name: 'Ellison Onizuka Kona International Airport',
    city: 'Kailua-Kona',
    state: 'Hawaii',
    stateCode: 'HI',
    region: 'Hawaii',
    country: 'United States',
    timezone: 'Pacific/Honolulu',
    coordinates: { latitude: 19.7388, longitude: -156.0456 },
    elevation: 47,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 3.5,
    airlines: ['HA', 'WN', 'AA', 'DL', 'UA'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['HNL', 'LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'PHX'],
    searchKeywords: ['kona', 'big island', 'hawaii', 'onizuka', 'kailua'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Lihue Airport (Kauai)
  {
    iataCode: 'LIH',
    icaoCode: 'PHLI',
    name: 'Lihue Airport',
    city: 'Lihue',
    state: 'Hawaii',
    stateCode: 'HI',
    region: 'Hawaii',
    country: 'United States',
    timezone: 'Pacific/Honolulu',
    coordinates: { latitude: 21.9760, longitude: -159.3390 },
    elevation: 153,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 3.2,
    airlines: ['HA', 'WN', 'AA', 'DL', 'UA'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['HNL', 'LAX', 'SFO', 'SEA', 'DEN', 'ORD', 'ATL', 'PHX'],
    searchKeywords: ['lihue', 'kauai', 'hawaii', 'garden isle'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * COMPLETE US AIRPORTS DATABASE
 */
export const US_AIRPORTS_DATABASE: USAirport[] = [
  ...US_MAJOR_HUBS,
  ...US_HUB_AIRPORTS,
  ...US_ADDITIONAL_HUBS,
  ...US_REGIONAL_AIRPORTS,
  ...US_SECONDARY_AIRPORTS,
  ...US_WESTERN_AIRPORTS,
  ...US_ALASKA_HAWAII_AIRPORTS
];

/**
 * AIRPORT SEARCH INDEX - Optimized for fast searching
 */
export const createAirportSearchIndex = () => {
  const searchIndex = new Map<string, USAirport[]>();
  
  US_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    const iataKey = airport.iataCode.toLowerCase();
    if (!searchIndex.has(iataKey)) searchIndex.set(iataKey, []);
    searchIndex.get(iataKey)!.push(airport);
    
    // Index by city
    const cityKey = airport.city.toLowerCase();
    if (!searchIndex.has(cityKey)) searchIndex.set(cityKey, []);
    searchIndex.get(cityKey)!.push(airport);
    
    // Index by state
    const stateKey = airport.state.toLowerCase();
    if (!searchIndex.has(stateKey)) searchIndex.set(stateKey, []);
    searchIndex.get(stateKey)!.push(airport);
    
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

/**
 * POPULAR US ROUTES - Common city pairs for quick suggestions
 */
export const POPULAR_US_ROUTES = [
  { from: 'LAX', to: 'JFK', route: 'Los Angeles → New York', popularity: 95 },
  { from: 'JFK', to: 'LAX', route: 'New York → Los Angeles', popularity: 95 },
  { from: 'LAX', to: 'SFO', route: 'Los Angeles → San Francisco', popularity: 90 },
  { from: 'JFK', to: 'MIA', route: 'New York → Miami', popularity: 88 },
  { from: 'ORD', to: 'LAX', route: 'Chicago → Los Angeles', popularity: 85 },
  { from: 'ATL', to: 'JFK', route: 'Atlanta → New York', popularity: 83 },
  { from: 'DFW', to: 'LAX', route: 'Dallas → Los Angeles', popularity: 82 },
  { from: 'LAX', to: 'LAS', route: 'Los Angeles → Las Vegas', popularity: 80 },
  { from: 'JFK', to: 'BOS', route: 'New York → Boston', popularity: 78 },
  { from: 'DCA', to: 'BOS', route: 'Washington → Boston', popularity: 75 }
];

/**
 * US TIMEZONE MAPPING
 */
export const US_TIMEZONE_MAP = {
  'America/New_York': 'Eastern Time',
  'America/Chicago': 'Central Time', 
  'America/Denver': 'Mountain Time',
  'America/Los_Angeles': 'Pacific Time',
  'America/Phoenix': 'Mountain Time (No DST)',
  'America/Anchorage': 'Alaska Time',
  'Pacific/Honolulu': 'Hawaii Time'
};

/**
 * US REGIONS MAPPING
 */
export const US_REGIONS = {
  'Northeast': ['NY', 'MA', 'CT', 'RI', 'VT', 'NH', 'ME', 'NJ', 'PA', 'DC', 'MD', 'DE'],
  'Southeast': ['FL', 'GA', 'SC', 'NC', 'VA', 'WV', 'KY', 'TN', 'AL', 'MS', 'AR', 'LA'],
  'Midwest': ['IL', 'IN', 'MI', 'OH', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
  'Southwest': ['TX', 'OK', 'NM', 'AZ'],
  'West': ['CA', 'NV', 'UT', 'CO', 'WY', 'MT', 'ID', 'OR', 'WA'],
  'Alaska': ['AK'],
  'Hawaii': ['HI']
};