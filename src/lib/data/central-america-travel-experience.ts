/**
 * 🌎 CENTRAL AMERICA TRAVEL EXPERIENCE DATA
 * Comprehensive Central American travel features, airlines, and user experience patterns
 * Covers Guatemala, Belize, El Salvador, Honduras, Nicaragua, Costa Rica, Panama, and Caribbean
 */

// Central American Airlines
export interface CentralAmericanAirlineDetails {
  iataCode: string;
  icaoCode: string;
  name: string;
  shortName: string;
  country: string;
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
      size: string; // cm
      weight: string; // kg
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
}

export const CENTRAL_AMERICAN_AIRLINES: Record<string, CentralAmericanAirlineDetails> = {
  'AV': {
    iataCode: 'AV',
    icaoCode: 'AVA',
    name: 'Avianca',
    shortName: 'Avianca',
    country: 'Colombia/Central America',
    currency: 'USD',
    loyaltyProgram: {
      name: 'LifeMiles',
      website: 'lifemiles.com',
      tiers: ['Green', 'Silver', 'Gold', 'Diamond'],
      currency: 'LifeMiles',
      creditCards: ['Avianca Vuela Visa', 'LifeMiles Mastercard'],
      benefits: ['Priority boarding', 'Free bags', 'Upgrades', 'Lounge access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '55 x 35 x 25 cm',
        weight: '10 kg',
        restrictions: ['Standard IATA restrictions', 'Liquids under 100ml']
      },
      checked: {
        first: { price: 25, weight: '23 kg', size: '158 cm linear' },
        second: { price: 45, weight: '23 kg', size: '158 cm linear' },
        overweight: { threshold: '24-32 kg', fee: 50 },
        oversize: { threshold: '159-300 cm', fee: 150 }
      },
      personalItem: {
        included: true,
        size: '40 x 30 x 10 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat assignment' },
      preferred: { price: 25, description: 'Preferred seat with extra space' },
      exit: { price: 40, description: 'Emergency exit row' },
      business: { price: 200, description: 'Business Class' }
    },
    amenities: {
      wifi: { available: true, price: '$8-15 USD', speed: 'Standard' },
      entertainment: { available: true, type: 'Seatback screens + app streaming' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks', 'Meals on long flights'], purchase: ['Premium meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Water'], alcoholic: true }
    },
    cabinClasses: ['Business', 'Economy'],
    focusCities: ['SAL', 'GUA', 'SJO', 'PTY'],
    hubs: ['BOG', 'SAL']
  },
  'CM': {
    iataCode: 'CM',
    icaoCode: 'CMP',
    name: 'Copa Airlines',
    shortName: 'Copa',
    country: 'Panama',
    currency: 'USD',
    loyaltyProgram: {
      name: 'ConnectMiles',
      website: 'copa.com/connectmiles',
      tiers: ['Silver', 'Gold', 'Platinum', 'Presidential Platinum'],
      currency: 'ConnectMiles',
      creditCards: ['Copa Airlines Mastercard'],
      benefits: ['Priority boarding', 'Free bags', 'Upgrades', 'Copa Club access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '56 x 36 x 23 cm',
        weight: '10 kg',
        restrictions: ['Standard security restrictions']
      },
      checked: {
        first: { price: 30, weight: '23 kg', size: '158 cm linear' },
        second: { price: 50, weight: '23 kg', size: '158 cm linear' },
        overweight: { threshold: '24-32 kg', fee: 75 },
        oversize: { threshold: '159-300 cm', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '45 x 35 x 20 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard economy seat' },
      preferred: { price: 30, description: 'Extra Space seat' },
      exit: { price: 45, description: 'Emergency exit row' },
      business: { price: 250, description: 'Business Class' }
    },
    amenities: {
      wifi: { available: true, price: '$9-19 USD', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + Copa app' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks', 'Meals on flights 3+ hours'], purchase: ['Premium meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Juice'], alcoholic: true }
    },
    cabinClasses: ['Business Class', 'Economy'],
    focusCities: ['PTY'],
    hubs: ['PTY']
  },
  'TA': {
    iataCode: 'TA',
    icaoCode: 'TAI',
    name: 'TACA',
    shortName: 'TACA',
    country: 'El Salvador',
    currency: 'USD',
    loyaltyProgram: {
      name: 'DistancePlus',
      website: 'taca.com/distanceplus',
      tiers: ['Green', 'Silver', 'Gold'],
      currency: 'Miles',
      creditCards: ['TACA Visa'],
      benefits: ['Priority boarding', 'Free bags', 'Upgrades']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '55 x 40 x 25 cm',
        weight: '10 kg',
        restrictions: ['Standard restrictions']
      },
      checked: {
        first: { price: 25, weight: '23 kg', size: '158 cm linear' },
        second: { price: 40, weight: '23 kg', size: '158 cm linear' },
        overweight: { threshold: '24-32 kg', fee: 50 },
        oversize: { threshold: '159-300 cm', fee: 100 }
      },
      personalItem: {
        included: true,
        size: '40 x 30 x 15 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat' },
      preferred: { price: 20, description: 'Preferred seat' },
      exit: { price: 35, description: 'Exit row' },
      business: { price: 150, description: 'Business Class' }
    },
    amenities: {
      wifi: { available: false, price: 'Not available', speed: 'N/A' },
      entertainment: { available: true, type: 'Limited seatback entertainment' },
      power: { available: false, type: 'Not available' },
      food: { complimentary: ['Light snacks'], purchase: ['Meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee'], alcoholic: false }
    },
    cabinClasses: ['Business', 'Economy'],
    focusCities: ['SAL'],
    hubs: ['SAL']
  },
  'GU': {
    iataCode: 'GU',
    icaoCode: 'GUA',
    name: 'Aviategua',
    shortName: 'Aviategua',
    country: 'Guatemala',
    currency: 'GTQ/USD',
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '55 x 35 x 25 cm',
        weight: '8 kg',
        restrictions: ['Standard restrictions']
      },
      checked: {
        first: { price: 30, weight: '20 kg', size: '150 cm linear' },
        second: { price: 50, weight: '20 kg', size: '150 cm linear' },
        overweight: { threshold: '21-30 kg', fee: 40 },
        oversize: { threshold: '151-200 cm', fee: 80 }
      },
      personalItem: {
        included: true,
        size: '40 x 25 x 15 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat' },
      preferred: { price: 15, description: 'Front seats' },
      exit: { price: 25, description: 'Exit row' },
      business: { price: 0, description: 'No business class' }
    },
    amenities: {
      wifi: { available: false, price: 'Not available', speed: 'N/A' },
      entertainment: { available: false, type: 'Bring your own device' },
      power: { available: false, type: 'Not available' },
      food: { complimentary: [], purchase: ['Snacks', 'Light meals'] },
      drinks: { complimentary: ['Water'], alcoholic: false }
    },
    cabinClasses: ['Economy'],
    focusCities: ['GUA'],
    hubs: ['GUA']
  }
};

// Central American Travel Requirements
export interface CentralAmericaVisaRequirements {
  country: string;
  countryCode: string;
  currency: string;
  language: string[];
  visaPolicy: {
    usaCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
    canadaCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
    euCitizens: { required: boolean; type?: string; duration?: string; fee?: number };
  };
  entryRequirements: {
    passport: boolean;
    passportValidity: string; // months
    yellowFever: boolean;
    covid19: boolean;
    onwardTicket: boolean;
    minFunds: number; // USD per day
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
  tips: string[];
}

export const CENTRAL_AMERICA_VISA_REQUIREMENTS: Record<string, CentralAmericaVisaRequirements> = {
  'GT': {
    country: 'Guatemala',
    countryCode: 'GT',
    currency: 'GTQ (Quetzal)',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      yellowFever: false,
      covid19: false,
      onwardTicket: true,
      minFunds: 25
    },
    stayDuration: {
      tourist: '90 days',
      business: '90 days',
      transit: '72 hours'
    },
    airports: {
      international: ['GUA'],
      domestic: ['FRS', 'PCG']
    },
    tips: [
      'CA-4 agreement allows free movement to Honduras, El Salvador, Nicaragua',
      'Tourist card required - usually provided on arrival or by airline',
      'Extend stay at immigration office in Guatemala City',
      'USD widely accepted alongside Quetzal'
    ]
  },
  'BZ': {
    country: 'Belize',
    countryCode: 'BZ',
    currency: 'BZD (Belize Dollar)',
    language: ['English'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '30 days' },
      canadaCitizens: { required: false, duration: '30 days' },
      euCitizens: { required: false, duration: '30 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      yellowFever: false,
      covid19: false,
      onwardTicket: true,
      minFunds: 60
    },
    stayDuration: {
      tourist: '30 days (extendable to 6 months)',
      business: '30 days',
      transit: '24 hours'
    },
    airports: {
      international: ['BZE'],
      domestic: ['CYC', 'ORZ', 'PLJ']
    },
    tips: [
      'English speaking country - easy for North American travelers',
      'Tourist tax of BZ$37.50 on departure',
      'USD accepted everywhere (2:1 exchange rate)',
      'Popular for diving and Mayan ruins'
    ]
  },
  'SV': {
    country: 'El Salvador',
    countryCode: 'SV',
    currency: 'USD',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      yellowFever: false,
      covid19: false,
      onwardTicket: true,
      minFunds: 30
    },
    stayDuration: {
      tourist: '90 days',
      business: '90 days',
      transit: '72 hours'
    },
    airports: {
      international: ['SAL'],
      domestic: []
    },
    tips: [
      'Uses USD as official currency',
      'Part of CA-4 agreement with Guatemala, Honduras, Nicaragua',
      'Tourist tax included in airline tickets',
      'Compact country - easy to explore'
    ]
  },
  'HN': {
    country: 'Honduras',
    countryCode: 'HN',
    currency: 'HNL (Lempira)',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      yellowFever: false,
      covid19: false,
      onwardTicket: true,
      minFunds: 50
    },
    stayDuration: {
      tourist: '90 days',
      business: '90 days',
      transit: '72 hours'
    },
    airports: {
      international: ['SAP', 'TGU'],
      domestic: ['LCE', 'RUY']
    },
    tips: [
      'Two main international airports: San Pedro Sula (SAP) and Tegucigalpa (TGU)',
      'CA-4 agreement member',
      'Tourist tax of $39 USD on departure',
      'Popular for Roatan island diving'
    ]
  },
  'NI': {
    country: 'Nicaragua',
    countryCode: 'NI',
    currency: 'NIO (Córdoba)',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      yellowFever: false,
      covid19: false,
      onwardTicket: true,
      minFunds: 200
    },
    stayDuration: {
      tourist: '90 days',
      business: '90 days',
      transit: '72 hours'
    },
    airports: {
      international: ['MGA'],
      domestic: ['BZA', 'RNI']
    },
    tips: [
      'Tourist card $10 USD on arrival',
      'Exit tax $35 USD on departure',
      'CA-4 agreement member',
      'USD widely accepted'
    ]
  },
  'CR': {
    country: 'Costa Rica',
    countryCode: 'CR',
    currency: 'CRC (Colón)',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '90 days' },
      canadaCitizens: { required: false, duration: '90 days' },
      euCitizens: { required: false, duration: '90 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '6 months',
      yellowFever: true, // if coming from yellow fever area
      covid19: false,
      onwardTicket: true,
      minFunds: 100
    },
    stayDuration: {
      tourist: '90 days',
      business: '90 days',
      transit: '24 hours'
    },
    airports: {
      international: ['SJO', 'LIR'],
      domestic: ['PBP', 'TMU', 'XQP']
    },
    tips: [
      'Two international airports: San José (SJO) and Liberia (LIR)',
      'Exit tax $29 USD (often included in ticket)',
      'Popular eco-tourism destination',
      'USD widely accepted, colones for small purchases'
    ]
  },
  'PA': {
    country: 'Panama',
    countryCode: 'PA',
    currency: 'PAB/USD',
    language: ['Spanish'],
    visaPolicy: {
      usaCitizens: { required: false, duration: '180 days' },
      canadaCitizens: { required: false, duration: '180 days' },
      euCitizens: { required: false, duration: '180 days' }
    },
    entryRequirements: {
      passport: true,
      passportValidity: '3 months',
      yellowFever: true, // if coming from yellow fever area
      covid19: false,
      onwardTicket: true,
      minFunds: 500
    },
    stayDuration: {
      tourist: '180 days',
      business: '180 days',
      transit: '24 hours'
    },
    airports: {
      international: ['PTY'],
      domestic: ['BLB', 'CHX', 'DAV']
    },
    tips: [
      'Longest tourist stay in region - 180 days',
      'Major hub for connections throughout Americas',
      'Uses USD as official currency (called Balboa)',
      'Tourist tax $20 USD on departure'
    ]
  }
};

// Central American Travel Patterns
export const CENTRAL_AMERICA_TRAVEL_PATTERNS = {
  popularRoutes: {
    fromUSA: ['MIA-SJO', 'LAX-SJO', 'IAH-SAL', 'DFW-PTY', 'JFK-PTY'],
    fromCanada: ['YYZ-SJO', 'YVR-SJO', 'YUL-PTY'],
    fromMexico: ['MEX-SJO', 'CUN-SJO', 'MEX-PTY'],
    regional: ['PTY-SJO', 'SAL-GUA', 'SJO-MGA', 'PTY-SAL']
  },
  seasonalPatterns: {
    drySeason: {
      months: 'December - April',
      description: 'Peak tourist season',
      routes: ['North America to Costa Rica', 'Regional tourism routes'],
      pricing: 'Higher prices, book early'
    },
    rainySeason: {
      months: 'May - November',
      description: 'Lower prices, fewer crowds',
      routes: ['Business travel remains steady', 'Fewer leisure travelers'],
      pricing: 'Better deals available'
    }
  },
  hubAirports: {
    'PTY': {
      name: 'Panama City Tocumen',
      role: 'Primary regional hub',
      connections: 'Throughout Americas',
      airlines: ['Copa Airlines', 'Multiple internationals']
    },
    'SJO': {
      name: 'San José Juan Santamaría',
      role: 'Major tourist gateway',
      connections: 'North America, Europe',
      airlines: ['Multiple international carriers']
    },
    'SAL': {
      name: 'San Salvador',
      role: 'Regional connector',
      connections: 'Central/North America',
      airlines: ['Avianca', 'TACA heritage routes']
    }
  }
};

// Airport Security and Immigration
export const CENTRAL_AMERICA_SECURITY_STANDARDS = {
  generalFeatures: {
    biometricEntry: ['CR', 'PA'], // Countries with biometric systems
    expeditedPrograms: [], // No regional expedited programs like NEXUS
    securityLevel: 'Standard international',
    commonLanguages: ['Spanish', 'English in Belize']
  },
  airportFeatures: {
    'SJO': {
      security: { standard: 45, peak: 60, international: true },
      immigration: { standard: 30, peak: 45, ePassport: true },
      customs: { standard: 15, declare: 30, greenLane: true }
    },
    'PTY': {
      security: { standard: 30, peak: 45, international: true },
      immigration: { standard: 20, peak: 30, ePassport: true },
      customs: { standard: 10, declare: 25, greenLane: true }
    },
    'SAL': {
      security: { standard: 35, peak: 50, international: true },
      immigration: { standard: 25, peak: 40, ePassport: false },
      customs: { standard: 20, declare: 35, greenLane: false }
    }
  }
};

export default {
  CENTRAL_AMERICAN_AIRLINES,
  CENTRAL_AMERICA_VISA_REQUIREMENTS,
  CENTRAL_AMERICA_TRAVEL_PATTERNS,
  CENTRAL_AMERICA_SECURITY_STANDARDS
};