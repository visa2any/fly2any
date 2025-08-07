/**
 * 🍁🇺🇸🇲🇽 NORTH AMERICA TRAVEL EXPERIENCE DATA
 * Comprehensive North American travel features, loyalty programs, and user experience patterns
 * Covers United States, Canada, and Mexico for complete regional coverage
 */

import { US_AIRLINES, US_SECURITY_PROGRAMS, US_TRAVEL_PATTERNS, US_CREDIT_CARD_BENEFITS } from './us-travel-experience';

// Canadian Airlines
export interface CanadianAirlineDetails {
  iataCode: string;
  icaoCode: string;
  name: string;
  shortName: string;
  loyaltyProgram: {
    name: string;
    website: string;
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
}

export const CANADIAN_AIRLINES: Record<string, CanadianAirlineDetails> = {
  'AC': {
    iataCode: 'AC',
    icaoCode: 'ACA',
    name: 'Air Canada',
    shortName: 'Air Canada',
    loyaltyProgram: {
      name: 'Aeroplan',
      website: 'aeroplan.com',
      tiers: ['25K', '35K', '50K', '75K', '100K'],
      currency: 'Aeroplan points',
      creditCards: ['TD Aeroplan Visa', 'CIBC Aeroplan Visa', 'American Express Aeroplan'],
      benefits: ['Priority boarding', 'Free checked bags', 'Seat upgrades', 'Maple Leaf Lounge access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '56 x 23 x 56 cm',
        weight: '10 kg',
        restrictions: ['Liquids under 100ml', 'No sharp objects']
      },
      checked: {
        first: { price: 30, weight: '23 kg', size: '158 cm linear' },
        second: { price: 50, weight: '23 kg', size: '158 cm linear' },
        overweight: { threshold: '24-32 kg', fee: 100 },
        oversize: { threshold: '159-292 cm', fee: 225 }
      },
      personalItem: {
        included: true,
        size: '33 x 16 x 6 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat assignment' },
      preferred: { price: 35, description: 'Preferred seat with extra legroom' },
      exit: { price: 50, description: 'Emergency exit row' },
      business: { price: 250, description: 'Business Class cabin' }
    },
    amenities: {
      wifi: { available: true, price: 'CAD $8-25', speed: 'High-speed' },
      entertainment: { available: true, type: 'Seatback screens + Air Canada app' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks on flights 2+ hours', 'Meals on international'], purchase: ['Premium meals', 'Snack boxes'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Juice'], alcoholic: true }
    },
    cabinClasses: ['Signature Class', 'Business Class', 'Premium Economy', 'Economy'],
    focusCities: ['YUL', 'YYC', 'YVR', 'YYZ'],
    hubs: ['YYZ', 'YVR', 'YUL']
  },
  'WS': {
    iataCode: 'WS',
    icaoCode: 'WJA',
    name: 'WestJet',
    shortName: 'WestJet',
    loyaltyProgram: {
      name: 'WestJet Rewards',
      website: 'westjet.com/rewards',
      tiers: ['Silver', 'Gold', 'Platinum'],
      currency: 'WestJet dollars',
      creditCards: ['WestJet RBC World Elite Mastercard'],
      benefits: ['Priority boarding', 'Free bags', 'Seat selection', 'Lounge access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '53 x 23 x 56 cm',
        weight: '10 kg',
        restrictions: ['Standard CATSA restrictions']
      },
      checked: {
        first: { price: 35, weight: '23 kg', size: '158 cm linear' },
        second: { price: 50, weight: '23 kg', size: '158 cm linear' },
        overweight: { threshold: '24-32 kg', fee: 100 },
        oversize: { threshold: '159-292 cm', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '41 x 33 x 15 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard economy seat' },
      preferred: { price: 25, description: 'Plus seat with extra legroom' },
      exit: { price: 40, description: 'Emergency exit row' },
      business: { price: 200, description: 'Business class cabin' }
    },
    amenities: {
      wifi: { available: true, price: 'CAD $8-20', speed: 'Standard' },
      entertainment: { available: true, type: 'Streaming to personal devices' },
      power: { available: true, type: 'USB and AC power' },
      food: { complimentary: ['Snacks'], purchase: ['Meals', 'Premium snacks'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee'], alcoholic: false }
    },
    cabinClasses: ['Business', 'Premium', 'Economy'],
    focusCities: ['YYC', 'YVR', 'YYZ'],
    hubs: ['YYC', 'YVR']
  }
};

// Mexican Airlines
export interface MexicanAirlineDetails {
  iataCode: string;
  icaoCode: string;
  name: string;
  shortName: string;
  loyaltyProgram: {
    name: string;
    website: string;
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
}

export const MEXICAN_AIRLINES: Record<string, MexicanAirlineDetails> = {
  'AM': {
    iataCode: 'AM',
    icaoCode: 'AMX',
    name: 'Aeromexico',
    shortName: 'Aeromexico',
    loyaltyProgram: {
      name: 'Club Premier',
      website: 'aeromexico.com/club-premier',
      tiers: ['Plata', 'Oro', 'Platino', 'Titanio'],
      currency: 'Puntos Premier',
      creditCards: ['Aeromexico Santander', 'Aeromexico BBVA'],
      benefits: ['Priority boarding', 'Free bags', 'Upgrades', 'Salon Premier access']
    },
    baggagePolicy: {
      carryOn: {
        included: true,
        size: '55 x 40 x 25 cm',
        weight: '10 kg',
        restrictions: ['Liquids under 100ml', 'Standard restrictions']
      },
      checked: {
        first: { price: 25, weight: '25 kg', size: '158 cm linear' },
        second: { price: 40, weight: '25 kg', size: '158 cm linear' },
        overweight: { threshold: '26-32 kg', fee: 150 },
        oversize: { threshold: '159-300 cm', fee: 200 }
      },
      personalItem: {
        included: true,
        size: '40 x 30 x 15 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 0, description: 'Standard seat' },
      preferred: { price: 30, description: 'AM Plus seat with extra space' },
      exit: { price: 45, description: 'Emergency exit row' },
      business: { price: 300, description: 'Clase Premier' }
    },
    amenities: {
      wifi: { available: true, price: '$8-15 USD', speed: 'Standard' },
      entertainment: { available: true, type: 'Seatback screens + mobile app' },
      power: { available: true, type: 'AC power + USB' },
      food: { complimentary: ['Snacks', 'Meals on long flights'], purchase: ['Premium meals'] },
      drinks: { complimentary: ['Soft drinks', 'Coffee', 'Juice'], alcoholic: true }
    },
    cabinClasses: ['Clase Premier', 'AM Plus', 'Economy'],
    focusCities: ['MEX', 'GDL', 'MTY', 'CUN'],
    hubs: ['MEX']
  },
  'Y4': {
    iataCode: 'Y4',
    icaoCode: 'VIV',
    name: 'Volaris',
    shortName: 'Volaris',
    loyaltyProgram: {
      name: 'v.club',
      website: 'volaris.com/vclub',
      tiers: ['Green', 'Silver', 'Gold'],
      currency: 'v.points',
      creditCards: ['Volaris Invex'],
      benefits: ['Priority boarding', 'Discount on extras', 'Free seat selection']
    },
    baggagePolicy: {
      carryOn: {
        included: false, // Ultra low cost model
        size: '55 x 40 x 25 cm',
        weight: '10 kg',
        restrictions: ['Fee applies for carry-on']
      },
      checked: {
        first: { price: 35, weight: '25 kg', size: '158 cm linear' },
        second: { price: 55, weight: '25 kg', size: '158 cm linear' },
        overweight: { threshold: '26-32 kg', fee: 100 },
        oversize: { threshold: '159-300 cm', fee: 150 }
      },
      personalItem: {
        included: true,
        size: '40 x 25 x 20 cm',
        restrictions: ['Must fit under seat']
      }
    },
    seatSelection: {
      basic: { price: 15, description: 'Standard seat selection fee' },
      preferred: { price: 25, description: 'Extra space seat' },
      exit: { price: 35, description: 'Emergency exit row' },
      business: { price: 0, description: 'No business class' }
    },
    amenities: {
      wifi: { available: false, price: 'Not available', speed: 'N/A' },
      entertainment: { available: false, type: 'Bring your own device' },
      power: { available: false, type: 'Not available' },
      food: { complimentary: [], purchase: ['Meals', 'Snacks', 'Beverages'] },
      drinks: { complimentary: [], alcoholic: false }
    },
    cabinClasses: ['Economy'],
    focusCities: ['MEX', 'GDL', 'TIJ', 'MTY'],
    hubs: ['MEX', 'GDL', 'TIJ']
  }
};

// North American Security Programs
export interface NorthAmericaSecurityProgram {
  name: string;
  description: string;
  cost: number;
  currency: string;
  validityYears: number;
  applicationTime: string;
  benefits: string[];
  eligibility: string[];
  countries: string[];
  website: string;
}

export const NORTH_AMERICA_SECURITY_PROGRAMS: Record<string, NorthAmericaSecurityProgram> = {
  ...US_SECURITY_PROGRAMS,
  'NEXUS': {
    name: 'NEXUS',
    description: 'Expedited border crossing between US and Canada',
    cost: 50,
    currency: 'USD',
    validityYears: 5,
    applicationTime: '2-4 months including interview',
    benefits: [
      'Includes Global Entry and TSA PreCheck',
      'Expedited US-Canada border crossing',
      'Dedicated NEXUS lanes at airports',
      'Fast-track through customs',
      'Works at land, air, and sea borders'
    ],
    eligibility: ['US citizens', 'Canadian citizens', 'Canadian permanent residents', 'Mexican nationals'],
    countries: ['United States', 'Canada'],
    website: 'cbp.gov/travel/trusted-traveler-programs/nexus'
  },
  'SENTRI': {
    name: 'SENTRI',
    description: 'Expedited border crossing between US and Mexico',
    cost: 122.25,
    currency: 'USD',
    validityYears: 5,
    applicationTime: '3-6 months including interview',
    benefits: [
      'Includes Global Entry and TSA PreCheck',
      'Expedited US-Mexico border crossing',
      'Dedicated SENTRI lanes',
      'Fast-track immigration and customs'
    ],
    eligibility: ['US citizens', 'US permanent residents', 'Mexican nationals', 'Canadian citizens'],
    countries: ['United States', 'Mexico'],
    website: 'cbp.gov/travel/trusted-traveler-programs/sentri'
  },
  'FAST': {
    name: 'FAST (Free and Secure Trade)',
    description: 'Commercial driver program for US-Canada-Mexico trade',
    cost: 50,
    currency: 'USD',
    validityYears: 5,
    applicationTime: '3-4 months',
    benefits: [
      'Expedited commercial border crossing',
      'Dedicated FAST lanes',
      'Reduced inspections',
      'Works at all NAFTA borders'
    ],
    eligibility: ['Commercial drivers', 'Must be employed by FAST-approved company'],
    countries: ['United States', 'Canada', 'Mexico'],
    website: 'cbp.gov/travel/trusted-traveler-programs/fast'
  }
};

// All North American Airlines Combined
export const NORTH_AMERICA_AIRLINES = {
  ...US_AIRLINES,
  ...CANADIAN_AIRLINES,
  ...MEXICAN_AIRLINES
};

// North American Travel Patterns
export const NORTH_AMERICA_TRAVEL_PATTERNS = {
  ...US_TRAVEL_PATTERNS,
  canadianRoutes: {
    domestic: ['YYZ-YVR', 'YYZ-YYC', 'YUL-YVR', 'YYC-YVR', 'YYZ-YHZ'],
    toUS: ['YYZ-JFK', 'YVR-LAX', 'YYC-DEN', 'YUL-BOS', 'YVR-SEA'],
    seasonal: {
      winter: ['YYZ-YYC', 'YVR-YYC', 'YUL-YVR', 'YYZ-YCG'],
      summer: ['YYZ-YVR', 'YUL-YYZ', 'YYC-YVR', 'YHZ-YYZ']
    }
  },
  mexicanRoutes: {
    domestic: ['MEX-GDL', 'MEX-MTY', 'MEX-CUN', 'GDL-CUN', 'MTY-CUN'],
    toUS: ['MEX-LAX', 'CUN-MIA', 'GDL-LAX', 'MTY-DFW', 'TIJ-LAX'],
    seasonal: {
      winter: ['MEX-CUN', 'GDL-CUN', 'MTY-CUN', 'PVR-LAX'],
      summer: ['MEX-LAX', 'GDL-DFW', 'MTY-IAH', 'CUN-JFK']
    }
  },
  transborder: {
    usCanada: ['JFK-YYZ', 'LAX-YVR', 'SEA-YVR', 'DFW-YYC', 'ORD-YYZ'],
    usMexico: ['LAX-MEX', 'DFW-MEX', 'MIA-CUN', 'LAX-GDL', 'IAH-MTY'],
    canadaMexico: ['YYZ-CUN', 'YVR-CUN', 'YYC-PVR', 'YUL-CUN']
  }
};

// Credit Card Benefits (Extended)
export const NORTH_AMERICA_CREDIT_BENEFITS = {
  ...US_CREDIT_CARD_BENEFITS,
  canadianCards: {
    'TD Aeroplan': ['Free checked bags', 'Priority boarding', 'Lounge access', 'No foreign fees'],
    'Amex Aeroplan': ['Free bags', 'Lounge access', '2x points', 'Priority boarding'],
    'CIBC Aeroplan': ['Free bags', 'Buddy pass', 'Insurance', 'Priority boarding']
  },
  mexicanCards: {
    'Aeromexico Santander': ['Free bags', 'Priority boarding', 'Points bonus', 'Lounge access'],
    'Volaris Invex': ['Carry-on included', 'Seat selection', 'Points earning', 'Discounts']
  }
};

// Cross-border Travel Requirements
export const CROSS_BORDER_REQUIREMENTS = {
  usCanada: {
    documents: ['Passport', 'Enhanced DL', 'NEXUS card'],
    restrictions: ['No liquids over 100ml', 'Standard security screening'],
    programs: ['NEXUS', 'Global Entry', 'TSA PreCheck'],
    tips: ['NEXUS works for both countries', 'Enhanced DL for land/sea only']
  },
  usMexico: {
    documents: ['Passport', 'Passport card (land/sea)', 'SENTRI card'],
    restrictions: ['Standard international restrictions', 'Customs declarations'],
    programs: ['SENTRI', 'Global Entry', 'TSA PreCheck'],
    tips: ['SENTRI includes Global Entry', 'Tourist card required for stays >72 hours']
  },
  canadaMexico: {
    documents: ['Passport'],
    restrictions: ['Standard international restrictions', 'Visa may be required'],
    programs: ['NEXUS (for connections through US)'],
    tips: ['Check visa requirements', 'Consider connections through US hubs']
  }
};

export default {
  NORTH_AMERICA_AIRLINES,
  NORTH_AMERICA_SECURITY_PROGRAMS,
  NORTH_AMERICA_TRAVEL_PATTERNS,
  NORTH_AMERICA_CREDIT_BENEFITS,
  CROSS_BORDER_REQUIREMENTS
};