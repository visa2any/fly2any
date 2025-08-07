/**
 * 🏝️ CARIBBEAN TRAVEL EXPERIENCE DATA
 * Comprehensive Caribbean travel features, airlines, and island-specific information
 * Covers all major Caribbean islands, territories, and dependencies
 */

// Caribbean Airlines
export interface CaribbeanAirlineDetails {
  iataCode: string;
  icaoCode: string;
  name: string;
  shortName: string;
  country: string;
  baseIslands: string[];
  loyaltyProgram?: {
    name: string;
    website?: string;
    tiers: string[];
    currency: string;
    creditCards: string[];
    benefits: string[];
  };
  baggagePolicy: {
    carryOn: {
      included: boolean;
      size: string; // cm or inches
      weight: string; // kg or lbs
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
    business: { price: number; description: string };
  };
  amenities: {
    wifi: { available: boolean; price: string; speed: string };
    entertainment: { available: boolean; type: string };
    power: { available: boolean; type: string };
    food: { complimentary: string[]; purchase: string[] };
    drinks: { complimentary: string[]; alcoholic: boolean };
  };
  cabinClasses: string[];
  focusCities: string[];
  hubs: string[];
  currency: string;
  operatesInterIsland: boolean;
}

export const CARIBBEAN_AIRLINES: Record<string, CaribbeanAirlineDetails> = {
  'BW': {
    iataCode: 'BW',
    icaoCode: 'BWA',
    name: 'Caribbean Airlines',
    shortName: 'Caribbean Airlines',
    country: 'Trinidad and Tobago',
    baseIslands: ['Trinidad', 'Tobago', 'Jamaica', 'Barbados'],
    currency: 'USD',
    operatesInterIsland: true,
    loyaltyProgram: {
      name: 'Miles',
      website: 'caribbean-airlines.com/miles',
      tiers: ['Blue', 'Silver', 'Gold', 'Platinum'],
      currency: 'Miles',
      creditCards: ['Caribbean Airlines Mastercard'],
      benefits: ['Priority boarding', 'Free bags', 'Seat upgrades', 'Lounge access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9 inches',
        weight: '22 lbs',
        restrictions: ['Standard security restrictions', 'No sharp objects']
      },
      checked: {
        first: { price: 25, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 50, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-70 lbs', fee: 75 },
        oversize: { threshold: '63-80 inches', fee: 150 }
      },
      personalItem: {
        included: true,
        size: '18 x 14 x 8 inches',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat assignment' },
      preferred: { price: 25, description: 'Extra legroom seat' },
      exit: { price: 35, description: 'Emergency exit row' },
      business: { price: 150, description: 'Business Plus cabin' }
    },
    amenities: {
      wifi: { available: false, price: 'Not available', speed: 'N/A' },
      entertainment: { available: true, type: 'Seatback screens on select routes' },
      power: { available: false, type: 'Not available' },
      food: { complimentary: ['Snacks', 'Meals on flights 2+ hours'], purchase: ['Premium meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Juice'], alcoholic: true }
    },
    cabinClasses: ['Business Plus', 'Economy'],
    focusCities: ['POS', 'BGI', 'KIN'],
    hubs: ['POS']
  },
  'JY': {
    iataCode: 'JY',
    icaoCode: 'IWD',
    name: 'Intercaribbean Airways',
    shortName: 'Intercaribbean',
    country: 'Turks and Caicos',
    baseIslands: ['Turks and Caicos', 'Bahamas', 'Dominican Republic', 'Haiti'],
    currency: 'USD',
    operatesInterIsland: true,
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9 inches',
        weight: '15 lbs',
        restrictions: ['Standard restrictions']
      },
      checked: {
        first: { price: 25, weight: '44 lbs', size: '62 linear inches' },
        second: { price: 45, weight: '44 lbs', size: '62 linear inches' },
        overweight: { threshold: '45-70 lbs', fee: 50 },
        oversize: { threshold: '63-80 inches', fee: 100 }
      },
      personalItem: {
        included: true,
        size: '16 x 12 x 6 inches',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat' },
      preferred: { price: 15, description: 'Front rows' },
      exit: { price: 25, description: 'Exit row' },
      business: { price: 0, description: 'No business class' }
    },
    amenities: {
      wifi: { available: false, price: 'Not available', speed: 'N/A' },
      entertainment: { available: false, type: 'Bring your own device' },
      power: { available: false, type: 'Not available' },
      food: { complimentary: ['Light snacks'], purchase: ['Snacks', 'Beverages'] },
      drinks: { complimentary: ['Water'], alcoholic: false }
    },
    cabinClasses: ['Economy'],
    focusCities: ['PLS', 'NAS', 'SDQ', 'PAP'],
    hubs: ['PLS']
  },
  'B6': {
    iataCode: 'B6',
    icaoCode: 'JBU',
    name: 'JetBlue Airways',
    shortName: 'JetBlue',
    country: 'United States',
    baseIslands: ['Puerto Rico', 'US Virgin Islands'],
    currency: 'USD',
    operatesInterIsland: false,
    loyaltyProgram: {
      name: 'TrueBlue',
      website: 'jetblue.com/trueblue',
      tiers: ['Mosaic'],
      currency: 'TrueBlue points',
      creditCards: ['JetBlue Plus Card', 'JetBlue Business Card'],
      benefits: ['Free bags', 'Priority boarding', 'Extra points', 'Preferred seating']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9 inches',
        weight: '40 lbs',
        restrictions: ['Standard TSA restrictions']
      },
      checked: {
        first: { price: 35, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 45, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-70 lbs', fee: 150 },
        oversize: { threshold: '63-80 inches', fee: 150 }
      },
      personalItem: {
        included: true,
        size: '17 x 13 x 8 inches',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat' },
      preferred: { price: 25, description: 'Even More Space seat' },
      exit: { price: 35, description: 'Exit row with extra legroom' },
      business: { price: 199, description: 'Mint business class' }
    },
    amenities: {
      wifi: { available: true, price: 'Free', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + streaming' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks'], purchase: ['Meals', 'Premium snacks'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee'], alcoholic: true }
    },
    cabinClasses: ['Mint', 'Core', 'Blue'],
    focusCities: ['SJU', 'STT'],
    hubs: ['JFK', 'BOS', 'FLL']
  },
  'DL': {
    iataCode: 'DL',
    icaoCode: 'DAL',
    name: 'Delta Air Lines',
    shortName: 'Delta',
    country: 'United States',
    baseIslands: ['Puerto Rico', 'US Virgin Islands'],
    currency: 'USD',
    operatesInterIsland: false,
    loyaltyProgram: {
      name: 'SkyMiles',
      website: 'delta.com/skymiles',
      tiers: ['Silver', 'Gold', 'Platinum', 'Diamond'],
      currency: 'SkyMiles',
      creditCards: ['Delta Amex Gold', 'Delta Amex Platinum'],
      benefits: ['Priority boarding', 'Free bags', 'Sky Club access', 'Upgrades']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '22 x 14 x 9 inches',
        weight: '40 lbs',
        restrictions: ['Standard restrictions']
      },
      checked: {
        first: { price: 35, weight: '50 lbs', size: '62 linear inches' },
        second: { price: 45, weight: '50 lbs', size: '62 linear inches' },
        overweight: { threshold: '51-70 lbs', fee: 100 },
        oversize: { threshold: '63-80 inches', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '18 x 14 x 8 inches',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat' },
      preferred: { price: 30, description: 'Comfort+ with extra legroom' },
      exit: { price: 40, description: 'Exit row' },
      business: { price: 200, description: 'Delta One or First Class' }
    },
    amenities: {
      wifi: { available: true, price: '$8-18', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + Delta app' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks', 'Meals on long flights'], purchase: ['Premium meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee'], alcoholic: true }
    },
    cabinClasses: ['Delta One', 'First Class', 'Comfort+', 'Main Cabin'],
    focusCities: ['SJU', 'STT'],
    hubs: ['ATL', 'JFK', 'LAX', 'SEA']
  }
};

// Caribbean Visa and Entry Requirements
export interface CaribbeanVisaRequirements {
  territory: string;
  territoryCode: string;
  sovereignty: string; // Which country governs it
  currency: string;
  language: string[];
  visaPolicy: {
    usaCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
    canadaCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
    euCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
    ukCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
  };
  entryRequirements: {
    passport: boolean;
    passportCard?: boolean; // US territories
    enhancedDL?: boolean; // US territories
    passportValidity: string;
    onwardTicket: boolean;
    accommodationProof: boolean;
    minFunds?: number;
    covidRequirements: boolean;
  };
  stayDuration: {
    tourist: string;
    business: string;
    transit: string;
  };
  airports: {
    international: string[];
    domestic: string[];
  };
  specialFeatures: string[];
  tips: string[];
}

export const CARIBBEAN_VISA_REQUIREMENTS: Record<string, CaribbeanVisaRequirements> = {
  'PR': {
    territory: 'Puerto Rico',
    territoryCode: 'PR',
    sovereignty: 'United States',
    currency: 'USD',
    language: ['Spanish', 'English'],
    visaPolicy: {
      usaCitizens: { required: false, duration: 'No limit (US territory)' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days (ESTA)' },
      ukCitizens: { required: false, duration: '90 days (ESTA)' }
    },
    entryRequirements: {
      passport: false, // for US citizens
      passportCard: true,
      enhancedDL: true,
      passportValidity: '6 months',
      onwardTicket: false,
      accommodationProof: false,
      covidRequirements: false
    },
    stayDuration: {
      tourist: 'Unlimited (US citizens), 90 days (others)',
      business: 'Unlimited (US citizens), 90 days (others)',
      transit: 'No restrictions'
    },
    airports: {
      international: ['SJU'],
      domestic: ['PSE', 'MAZ', 'CPX']
    },
    specialFeatures: [
      'US territory - no passport required for US citizens',
      'TSA PreCheck and Global Entry accepted',
      'US federal laws apply',
      'No customs for US mainland travelers'
    ],
    tips: [
      'US citizens can travel with just driver\'s license',
      'No currency exchange needed - uses USD',
      'Spanish helpful but English widely spoken',
      'Hurricane season June-November'
    ]
  },
  'VI': {
    territory: 'US Virgin Islands',
    territoryCode: 'VI',
    sovereignty: 'United States',
    currency: 'USD',
    language: ['English'],
    visaPolicy: {
      usaCitizens: { required: false, duration: 'No limit (US territory)' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days (ESTA)' },
      ukCitizens: { required: false, duration: '90 days (ESTA)' }
    },
    entryRequirements: {
      passport: false,
      passportCard: true,
      enhancedDL: true,
      passportValidity: '6 months',
      onwardTicket: false,
      accommodationProof: false,
      covidRequirements: false
    },
    stayDuration: {
      tourist: 'Unlimited (US citizens), 90 days (others)',
      business: 'Unlimited (US citizens), 90 days (others)',
      transit: 'No restrictions'
    },
    airports: {
      international: ['STT', 'STX'],
      domestic: []
    },
    specialFeatures: [
      'US territory - no passport for US citizens',
      'Duty-free shopping paradise',
      'Left-hand driving (British heritage)',
      'No sales tax'
    ],
    tips: [
      'Passport card sufficient for US citizens',
      'Duty-free allowance: $1,600 per person',
      'Cars drive on left side of road',
      'Hurricane season precautions necessary'
    ]
  },
  'JM': {
    territory: 'Jamaica',
    territoryCode: 'JM',
    sovereignty: 'Independent',
    currency: 'JMD (Jamaican Dollar)',
    language: ['English', 'Patois'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days' },
      ukCitizens: { required: false, duration: '90 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      onwardTicket: true,
      accommodationProof: true,
      minFunds: 50,
      covidRequirements: false
    },
    stayDuration: {
      tourist: '90 days',
      business: '90 days',
      transit: '24 hours'
    },
    airports: {
      international: ['KIN', 'MBJ'],
      domestic: []
    },
    specialFeatures: [
      'English-speaking Caribbean nation',
      'Commonwealth country',
      'Popular cruise ship destination',
      'Rich cultural heritage and music scene'
    ],
    tips: [
      'USD widely accepted in tourist areas',
      'Departure tax usually included in ticket',
      'Tipping expected in service industry',
      'Hurricane season June-November'
    ]
  },
  'BS': {
    territory: 'Bahamas',
    territoryCode: 'BS',
    sovereignty: 'Independent',
    currency: 'BSD (Bahamian Dollar)',
    language: ['English'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '240 days' },
      canadaCitizens: { required: false, duration: '240 days' },
      euCitizens: { required: false, duration: '90 days' },
      ukCitizens: { required: false, duration: '240 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      onwardTicket: true,
      accommodationProof: true,
      minFunds: 40,
      covidRequirements: false
    },
    stayDuration: {
      tourist: '240 days (US/CA/UK), 90 days (EU)',
      business: '240 days (US/CA/UK), 90 days (EU)',
      transit: '24 hours'
    },
    airports: {
      international: ['NAS', 'FPO'],
      domestic: ['ELH', 'GHB', 'MHH', 'RSD']
    },
    specialFeatures: [
      'Close proximity to Florida (50 miles)',
      'No income tax',
      'English-speaking',
      '700+ islands and cays'
    ],
    tips: [
      'BSD pegged 1:1 with USD',
      'Popular for day trips from Florida',
      'Departure tax $20-29 (usually included)',
      'Out Islands offer authentic experiences'
    ]
  },
  'BB': {
    territory: 'Barbados',
    territoryCode: 'BB',
    sovereignty: 'Independent',
    currency: 'BBD (Barbados Dollar)',
    language: ['English'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '180 days' },
      euCitizens: { required: false, duration: '90 days' },
      ukCitizens: { required: false, duration: '180 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      onwardTicket: true,
      accommodationProof: true,
      minFunds: 50,
      covidRequirements: false
    },
    stayDuration: {
      tourist: '90-180 days (varies by nationality)',
      business: '90-180 days',
      transit: '24 hours'
    },
    airports: {
      international: ['BGI'],
      domestic: []
    },
    specialFeatures: [
      'Easternmost Caribbean island',
      'Well-developed tourism infrastructure',
      'Commonwealth country',
      'Strong British influence'
    ],
    tips: [
      'BBD fixed at 2:1 to USD',
      'Departure tax included in ticket',
      'Excellent healthcare system',
      'Hurricane season less severe than western Caribbean'
    ]
  },
  'DO': {
    territory: 'Dominican Republic',
    territoryCode: 'DO',
    sovereignty: 'Independent',
    currency: 'DOP (Dominican Peso)',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '30 days' },
      canadaCitizens: { required: false, duration: '30 days' },
      euCitizens: { required: false, duration: '30 days' },
      ukCitizens: { required: false, duration: '30 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      onwardTicket: true,
      accommodationProof: false,
      minFunds: 50,
      covidRequirements: false
    },
    stayDuration: {
      tourist: '30 days (extendable to 90 days)',
      business: '30 days',
      transit: '24 hours'
    },
    airports: {
      international: ['SDQ', 'PUJ', 'STI', 'LRM'],
      domestic: []
    },
    specialFeatures: [
      'Tourist card $10 USD required',
      'Multiple international airports',
      'Shares island with Haiti',
      'Popular all-inclusive destination'
    ],
    tips: [
      'Tourist card often included in package deals',
      'USD widely accepted in tourist areas',
      'Departure tax $20 USD (usually included)',
      'Spanish helpful for local interactions'
    ]
  }
};

// Caribbean Travel Patterns
export const CARIBBEAN_TRAVEL_PATTERNS = {
  popularRoutes: {
    fromUSA: ['MIA-NAS', 'JFK-SJU', 'ATL-BGI', 'FLL-KIN', 'JFK-STT'],
    fromCanada: ['YYZ-BGI', 'YUL-SJU', 'YVR-NAS'],
    fromEurope: ['LHR-BGI', 'CDG-SJU', 'FRA-KIN'],
    interIsland: ['SJU-STT', 'NAS-FPO', 'BGI-KIN', 'POS-BGI']
  },
  seasonalPatterns: {
    peakSeason: {
      months: 'December - April',
      description: 'Dry season, perfect weather',
      pricing: 'Highest rates, advance booking essential',
      events: ['Carnival season', 'Spring break']
    },
    shoulderSeason: {
      months: 'May, November',
      description: 'Good weather, fewer crowds',
      pricing: 'Moderate rates, good availability',
      events: ['Local festivals', 'End of hurricane season']
    },
    lowSeason: {
      months: 'June - October',
      description: 'Hurricane season but still warm',
      pricing: 'Best deals, flexible booking',
      events: ['Hurricane preparedness', 'Local summer festivals']
    }
  },
  hubAirports: {
    'SJU': {
      name: 'San Juan Luis Muñoz Marín',
      role: 'Caribbean gateway hub',
      connections: 'US mainland, Caribbean islands',
      advantages: ['US territory benefits', 'No customs for US travelers']
    },
    'NAS': {
      name: 'Nassau Lynden Pindling',
      role: 'Bahamas tourism hub',
      connections: 'US east coast, Caribbean',
      advantages: ['Close to Florida', 'English speaking']
    },
    'BGI': {
      name: 'Bridgetown Grantley Adams',
      role: 'Eastern Caribbean hub',
      connections: 'North America, Europe, Caribbean',
      advantages: ['Modern facilities', 'Regional connections']
    }
  },
  cruiseIntegration: {
    majorPorts: ['NAS', 'SJU', 'BGI', 'KIN', 'STT'],
    flyAndCruise: 'Popular combination with Miami/Fort Lauderdale',
    advantages: ['Multi-island visits', 'No visa concerns for most ports']
  }
};

// Caribbean Security and Immigration Features
export const CARIBBEAN_SECURITY_STANDARDS = {
  usTerritories: {
    features: ['TSA security standards', 'Global Entry/PreCheck accepted', 'US federal oversight'],
    advantages: ['Familiar procedures', 'No immigration for US citizens', 'English language'],
    airports: ['SJU', 'STT', 'STX']
  },
  britishOverseas: {
    features: ['UK-aligned security', 'Commonwealth protocols', 'English language'],
    territories: ['Cayman Islands', 'British Virgin Islands', 'Turks and Caicos'],
    advantages: ['Familiar to UK/Commonwealth travelers']
  },
  independent: {
    features: ['Varied security standards', 'CARICOM integration', 'Island-specific procedures'],
    countries: ['Jamaica', 'Bahamas', 'Barbados', 'Trinidad', 'Dominican Republic'],
    considerations: ['Language barriers possible', 'Varying wait times', 'Documentation requirements']
  },
  generalFeatures: {
    averageWaitTimes: {
      security: { standard: 20, peak: 35, small: 10 },
      immigration: { standard: 15, peak: 30, usTerritory: 5 },
      customs: { standard: 10, declare: 20, nothing: 5 }
    },
    commonAmenities: ['Duty-free shopping', 'Currency exchange', 'Tourism information'],
    challenges: ['Limited facilities at smaller airports', 'Weather delays', 'Seasonal capacity issues']
  }
};

// Island-Specific Features
export const CARIBBEAN_ISLAND_FEATURES = {
  accessibility: {
    wheelchairFriendly: ['SJU', 'NAS', 'BGI', 'KIN'],
    limitedAccessibility: ['Small island airports', 'Regional strips'],
    considerations: ['Volcanic terrain', 'Beach wheelchair rentals available']
  },
  transportation: {
    publicTransit: ['Limited on most islands', 'Taxi/rental car primary'],
    specialConsiderations: ['Left-hand driving (some islands)', 'Island hopping flights', 'Ferry connections'],
    costs: ['Higher than mainland due to import costs', 'Negotiate taxi fares', 'All-inclusive often better value']
  },
  cultural: {
    languages: ['English (predominant)', 'Spanish (DR, PR)', 'French (some islands)', 'Dutch (some islands)'],
    currencies: ['USD widely accepted', 'Local currencies pegged to USD/EUR', 'Exchange rate variations'],
    etiquette: ['Relaxed "island time"', 'Friendly greetings important', 'Tipping expected in tourist areas']
  }
};

export default {
  CARIBBEAN_AIRLINES,
  CARIBBEAN_VISA_REQUIREMENTS,
  CARIBBEAN_TRAVEL_PATTERNS,
  CARIBBEAN_SECURITY_STANDARDS,
  CARIBBEAN_ISLAND_FEATURES
};