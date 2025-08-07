/**
 * 🇺🇸 US TRAVEL EXPERIENCE DATA
 * Comprehensive US-specific travel features, loyalty programs, and user experience patterns
 * Optimized for US travelers and competitive with US-focused OTAs
 */

// US Airline Codes and Details
export interface USAirlineDetails {
  iataCode: string;
  icaoCode: string;
  name: string;
  shortName: string;
  loyaltyProgram: {
    name: string;
    website: string;
    tiers: string[];
    currency: string; // miles/points name
    creditCards: string[];
    benefits: string[];
  };
  baggagePolicy: {
    carryOn: {
      included: boolean;
      size: string; // inches
      weight: string; // lbs
      restrictions: string[];
    };
    checked: {
      first: { price: number; weight: string; size: string };
      second: { price: number; weight: string; size: string };
      overweight: { threshold: string; fee: number };
      oversize: { threshold: string; fee: number };
    };
    personalItem: {
      included: boolean;
      size: string;
      restrictions: string[];
    };
  };
  seatSelection: {
    basic: { price: number; description: string };
    preferred: { price: number; description: string };
    exit: { price: number; description: string };
    first: { price: number; description: string };
  };
  amenities: {
    wifi: { available: boolean; price: string; speed: string };
    entertainment: { available: boolean; type: string };
    power: { available: boolean; type: string };
    food: { complimentary: string[]; purchase: string[] };
    drinks: { complimentary: string[]; alcoholic: boolean };
  };
  cabinClasses: string[];
  focusCities: string[]; // IATA codes
  hubs: string[]; // IATA codes
}

export const US_AIRLINES: Record<string, USAirlineDetails> = {
  'AA': {
    iataCode: 'AA',
    icaoCode: 'AAL',
    name: 'American Airlines',
    shortName: 'American',
    loyaltyProgram: {
      name: 'AAdvantage',
      website: 'aa.com/aadvantage',
      tiers: ['Gold', 'Platinum', 'Platinum Pro', 'Executive Platinum', 'ConciergeKey'],
      currency: 'AAdvantage miles',
      creditCards: ['Citi AAdvantage Platinum', 'Barclays AAdvantage Aviator'],
      benefits: ['Priority boarding', 'Free checked bags', 'Seat upgrades', 'Lounge access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9',
        weight: '40 lbs',
        restrictions: ['No liquids over 3.4oz', 'No sharp objects']
      },
      checked: {
        first: { price: 35, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 45, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-70 lbs', fee: 100 },
        oversize: { threshold: '63-80 linear inches', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '18 x 14 x 8',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat assignment' },
      preferred: { price: 25, description: 'Extra legroom, preferred location' },
      exit: { price: 35, description: 'Emergency exit row, extra legroom' },
      first: { price: 150, description: 'First class cabin' }
    },
    amenities: {
      wifi: { available: true, price: '$12-19', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + app streaming' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks on flights 2+ hours'], purchase: ['Meals', 'Premium snacks'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Water'], alcoholic: false }
    },
    cabinClasses: ['First', 'Business', 'Premium Economy', 'Main Cabin'],
    focusCities: ['BOS', 'DCA', 'LAS', 'LAX', 'MIA', 'JFK', 'PHL', 'PHX', 'SJU'],
    hubs: ['CLT', 'DFW', 'MIA', 'PHX', 'PHL', 'DCA', 'ORD']
  },
  'DL': {
    iataCode: 'DL',
    icaoCode: 'DAL',
    name: 'Delta Air Lines',
    shortName: 'Delta',
    loyaltyProgram: {
      name: 'SkyMiles',
      website: 'delta.com/skymiles',
      tiers: ['Silver Medallion', 'Gold Medallion', 'Platinum Medallion', 'Diamond Medallion'],
      currency: 'SkyMiles',
      creditCards: ['Amex Gold Delta', 'Amex Platinum Delta', 'Amex Reserve Delta'],
      benefits: ['Priority boarding', 'Free checked bags', 'Seat upgrades', 'Sky Club access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9',
        weight: '40 lbs',
        restrictions: ['No liquids over 3.4oz', 'No sharp objects']
      },
      checked: {
        first: { price: 35, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 45, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-70 lbs', fee: 100 },
        oversize: { threshold: '63-80 linear inches', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '18 x 14 x 8',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat assignment' },
      preferred: { price: 30, description: 'Comfort+ with extra legroom' },
      exit: { price: 40, description: 'Emergency exit row' },
      first: { price: 200, description: 'Delta One or First Class' }
    },
    amenities: {
      wifi: { available: true, price: '$8-18', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + Delta app' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Free snacks', 'Meals on long flights'], purchase: ['Premium meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Juice'], alcoholic: true }
    },
    cabinClasses: ['Delta One', 'First Class', 'Comfort+', 'Main Cabin'],
    focusCities: ['BOS', 'LAS', 'LAX', 'MSP', 'JFK', 'SEA'],
    hubs: ['ATL', 'BOS', 'DTW', 'LAX', 'MSP', 'JFK', 'SLC', 'SEA']
  },
  'UA': {
    iataCode: 'UA',
    icaoCode: 'UAL',
    name: 'United Airlines',
    shortName: 'United',
    loyaltyProgram: {
      name: 'MileagePlus',
      website: 'united.com/mileageplus',
      tiers: ['Premier Silver', 'Premier Gold', 'Premier Platinum', 'Premier 1K', 'Global Services'],
      currency: 'United miles',
      creditCards: ['Chase United Explorer', 'Chase United Club'],
      benefits: ['Priority boarding', 'Free checked bags', 'Seat upgrades', 'United Club access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9',
        weight: '40 lbs',
        restrictions: ['No liquids over 3.4oz']
      },
      checked: {
        first: { price: 35, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 45, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-70 lbs', fee: 100 },
        oversize: { threshold: '63-80 linear inches', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '17 x 10 x 9',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard economy seat' },
      preferred: { price: 25, description: 'Economy Plus with extra legroom' },
      exit: { price: 35, description: 'Emergency exit row' },
      first: { price: 180, description: 'United Polaris or First' }
    },
    amenities: {
      wifi: { available: true, price: '$8-25', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + United app' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks'], purchase: ['Fresh meals', 'Snack boxes'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Water'], alcoholic: false }
    },
    cabinClasses: ['United Polaris', 'United First', 'United Premium Plus', 'United Economy'],
    focusCities: ['DEN', 'IAH', 'LAX', 'EWR', 'ORD', 'SFO'],
    hubs: ['DEN', 'IAH', 'LAX', 'EWR', 'ORD', 'SFO', 'IAD']
  },
  'WN': {
    iataCode: 'WN',
    icaoCode: 'SWA',
    name: 'Southwest Airlines',
    shortName: 'Southwest',
    loyaltyProgram: {
      name: 'Rapid Rewards',
      website: 'southwest.com/rapidrewards',
      tiers: ['A-List', 'A-List Preferred', 'Companion Pass'],
      currency: 'Rapid Rewards points',
      creditCards: ['Chase Southwest Rapid Rewards'],
      benefits: ['Priority boarding', 'Free WiFi', 'No change fees', 'Companion Pass']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '24 x 16 x 10',
        weight: '50 lbs',
        restrictions: ['Standard TSA restrictions']
      },
      checked: {
        first: { price: 0, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 0, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-100 lbs', fee: 75 },
        oversize: { threshold: '63-80 linear inches', fee: 75 }
      },
      personalItem: {
        included: true,
        size: '18.5 x 8.5 x 13.5',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Open seating - choose when boarding' },
      preferred: { price: 15, description: 'EarlyBird Check-In for better boarding position' },
      exit: { price: 0, description: 'Available during open seating' },
      first: { price: 0, description: 'No first class - single cabin' }
    },
    amenities: {
      wifi: { available: true, price: 'Free', speed: 'Standard' },
      entertainment: { available: true, type: 'Streaming to personal devices' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks', 'Peanuts'], purchase: ['Upgraded snacks'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Juice'], alcoholic: true }
    },
    cabinClasses: ['Economy'],
    focusCities: ['BWI', 'HOU', 'LAS', 'LAX', 'MDW', 'PHX'],
    hubs: ['ATL', 'BWI', 'BNA', 'DEN', 'HOU', 'LAS', 'LAX', 'MDW', 'PHX']
  }
};

// TSA PreCheck and Global Entry Information
export interface SecurityProgram {
  name: string;
  description: string;
  cost: number;
  validityYears: number;
  applicationTime: string;
  benefits: string[];
  eligibility: string[];
  website: string;
}

export const US_SECURITY_PROGRAMS: Record<string, SecurityProgram> = {
  'TSA_PRECHECK': {
    name: 'TSA PreCheck',
    description: 'Expedited security screening for domestic flights',
    cost: 78,
    validityYears: 5,
    applicationTime: '3-5 days online, up to 45 days total',
    benefits: [
      'Keep shoes, belts, and light jackets on',
      'Keep laptops and liquids in carry-on',
      'Shorter security lines',
      'Available at 200+ airports'
    ],
    eligibility: ['US citizens', 'US nationals', 'Lawful permanent residents'],
    website: 'tsa.gov/precheck'
  },
  'GLOBAL_ENTRY': {
    name: 'Global Entry',
    description: 'Expedited customs and immigration for international travel',
    cost: 100,
    validityYears: 5,
    applicationTime: '2-6 months including interview',
    benefits: [
      'Includes TSA PreCheck benefits',
      'Expedited customs and immigration',
      'No forms to fill out',
      'Available at major international airports',
      'Access to NEXUS and SENTRI lanes'
    ],
    eligibility: ['US citizens', 'US nationals', 'Lawful permanent residents', 'Citizens of select countries'],
    website: 'cbp.gov/travel/trusted-traveler-programs/global-entry'
  },
  'CLEAR': {
    name: 'CLEAR',
    description: 'Biometric identity verification to skip to front of security',
    cost: 189,
    validityYears: 1,
    applicationTime: '5 minutes online + airport enrollment',
    benefits: [
      'Skip to front of TSA line',
      'Biometric verification',
      'Works with TSA PreCheck',
      'Available at 50+ airports'
    ],
    eligibility: ['Anyone 18+ with valid ID'],
    website: 'clearme.com'
  }
};

// US Airport Security and Amenity Information
export interface USAirportSecurity {
  tsaPrecheck: boolean;
  globalEntry: boolean;
  clear: boolean;
  averageSecurityWait: {
    standard: number; // minutes
    precheck: number;
    peak: number;
    offPeak: number;
  };
  securityHours: {
    open: string;
    close: string;
    early?: string; // for early morning flights
  };
}

export interface USAirportAmenities {
  lounges: {
    airline: { name: string; terminal: string; access: string[] }[];
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
    luggage: boolean;
    showers: boolean;
    sleepingPods: boolean;
  };
  technology: {
    freeWifi: boolean;
    chargingStations: boolean;
    businessCenter: boolean;
    printServices: boolean;
  };
  families: {
    nursingRooms: boolean;
    playAreas: boolean;
    familyRestrooms: boolean;
    strollerRental: boolean;
  };
}

// US-Specific Flight Features
export interface USFlightFeatures {
  domesticFeatures: {
    noPassportRequired: boolean;
    sameDayChange: boolean;
    frequentFlierEarning: boolean;
    upgradeEligible: boolean;
  };
  internationalFeatures: {
    customsPrecheck: boolean;
    immigrationForms: boolean;
    dutyFreeAvailable: boolean;
    globalEntryEligible: boolean;
  };
  seasonalConsiderations: {
    weatherDelays: string[];
    holidayPricing: string[];
    springBreakImpact: boolean;
    summerPeak: boolean;
  };
}

// Popular US Travel Patterns
export const US_TRAVEL_PATTERNS = {
  businessRoutes: [
    'JFK-LAX', 'JFK-SFO', 'LAX-ORD', 'DCA-BOS', 'ATL-DFW',
    'ORD-DEN', 'SEA-SFO', 'MIA-JFK', 'PHX-LAX', 'BOS-DCA'
  ],
  leisureRoutes: [
    'JFK-MCO', 'LAX-LAS', 'ORD-MCO', 'ATL-MCO', 'DFW-LAS',
    'BOS-MCO', 'DEN-LAX', 'SEA-LAX', 'PHX-DEN', 'MIA-JFK'
  ],
  seasonalRoutes: {
    winter: ['JFK-MIA', 'ORD-PHX', 'BOS-FLL', 'DEN-LAX'],
    summer: ['LAX-SEA', 'ORD-DEN', 'JFK-BOS', 'ATL-LAX'],
    spring: ['JFK-LAX', 'ORD-LAS', 'ATL-LAX', 'DFW-DEN'],
    fall: ['LAX-JFK', 'MIA-JFK', 'SEA-LAX', 'PHX-ORD']
  },
  holidayPeaks: {
    thanksgiving: ['High volume nationwide', 'Wednesday before/Sunday after'],
    christmas: ['December 23-24, January 2-3'],
    newYear: ['December 31, January 1-2'],
    memorialDay: ['Friday before/Tuesday after'],
    laborDay: ['Friday before/Tuesday after'],
    july4th: ['July 3-5 weekend']
  }
};

// Credit Card and Payment Benefits
export const US_CREDIT_CARD_BENEFITS = {
  airlineCards: {
    'AA': ['Free checked bags', 'Priority boarding', 'Miles earning bonus'],
    'DL': ['Free checked bags', 'Sky Club access', 'Miles earning bonus'],
    'UA': ['Free checked bags', 'United Club access', 'Miles earning bonus'],
    'WN': ['Free WiFi', 'Early boarding', 'Points earning bonus']
  },
  generalCards: {
    'Chase Sapphire': ['Trip protection', '2x travel points', 'No foreign fees'],
    'Amex Platinum': ['Lounge access', 'Hotel status', 'Airline credits'],
    'Capital One Venture': ['2x miles', 'No foreign fees', 'Travel protection']
  }
};

export default {
  US_AIRLINES,
  US_SECURITY_PROGRAMS,
  US_TRAVEL_PATTERNS,
  US_CREDIT_CARD_BENEFITS
};