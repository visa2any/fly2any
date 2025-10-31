/**
 * Comprehensive airline branding data
 * Includes logos, colors, names, alliances, and ratings
 */

export interface AirlineData {
  code: string;
  name: string;
  logo: string; // SVG or emoji for now, can be replaced with actual logos
  primaryColor: string;
  secondaryColor: string;
  alliance?: 'Star Alliance' | 'Oneworld' | 'SkyTeam' | null;
  rating: number; // Out of 5
  onTimePerformance: number; // Percentage
  comfort: number; // Out of 5
  service: number; // Out of 5
  country: string;
  hub?: string[];
  frequentFlyerProgram: string; // Loyalty program name (e.g., "MileagePlus", "AAdvantage")
}

export const AIRLINE_DATABASE: Record<string, AirlineData> = {
  // US Carriers
  AA: {
    code: 'AA',
    name: 'American Airlines',
    logo: '🦅',
    primaryColor: '#0078D2',
    secondaryColor: '#C8102E',
    alliance: 'Oneworld',
    rating: 4.0,
    onTimePerformance: 78,
    comfort: 3.8,
    service: 4.0,
    country: 'USA',
    hub: ['DFW', 'CLT', 'MIA', 'PHX'],
    frequentFlyerProgram: 'AAdvantage',
  },
  DL: {
    code: 'DL',
    name: 'Delta Air Lines',
    logo: '🔺',
    primaryColor: '#003A70',
    secondaryColor: '#C8102E',
    alliance: 'SkyTeam',
    rating: 4.3,
    onTimePerformance: 83,
    comfort: 4.2,
    service: 4.3,
    country: 'USA',
    hub: ['ATL', 'DTW', 'MSP', 'SLC'],
    frequentFlyerProgram: 'SkyMiles',
  },
  UA: {
    code: 'UA',
    name: 'United Airlines',
    logo: '🌐',
    primaryColor: '#0032A0',
    secondaryColor: '#002244',
    alliance: 'Star Alliance',
    rating: 3.9,
    onTimePerformance: 76,
    comfort: 3.7,
    service: 3.8,
    country: 'USA',
    hub: ['ORD', 'DEN', 'IAH', 'EWR', 'SFO'],
    frequentFlyerProgram: 'MileagePlus',
  },
  WN: {
    code: 'WN',
    name: 'Southwest Airlines',
    logo: '❤️',
    primaryColor: '#304CB2',
    secondaryColor: '#FFB81C',
    alliance: null,
    rating: 4.1,
    onTimePerformance: 80,
    comfort: 3.6,
    service: 4.2,
    country: 'USA',
    hub: ['DAL', 'HOU', 'PHX', 'BWI'],
    frequentFlyerProgram: 'Rapid Rewards',
  },
  B6: {
    code: 'B6',
    name: 'JetBlue Airways',
    logo: '💙',
    primaryColor: '#0000FF',
    secondaryColor: '#00AEEF',
    alliance: null,
    rating: 4.2,
    onTimePerformance: 77,
    comfort: 4.0,
    service: 4.3,
    country: 'USA',
    hub: ['JFK', 'BOS', 'FLL'],
    frequentFlyerProgram: 'TrueBlue',
  },
  AS: {
    code: 'AS',
    name: 'Alaska Airlines',
    logo: '⛰️',
    primaryColor: '#01426A',
    secondaryColor: '#0078D2',
    alliance: 'Oneworld',
    rating: 4.4,
    onTimePerformance: 84,
    comfort: 4.1,
    service: 4.5,
    country: 'USA',
    hub: ['SEA', 'PDX', 'ANC'],
    frequentFlyerProgram: 'Mileage Plan',
  },
  F9: {
    code: 'F9',
    name: 'Frontier Airlines',
    logo: '🦅',
    primaryColor: '#7FB539',
    secondaryColor: '#002F5D',
    alliance: null,
    rating: 3.5,
    onTimePerformance: 73,
    comfort: 3.2,
    service: 3.4,
    country: 'USA',
    hub: ['DEN'],
    frequentFlyerProgram: 'FRONTIER Miles',
  },
  NK: {
    code: 'NK',
    name: 'Spirit Airlines',
    logo: '💛',
    primaryColor: '#FFE900',
    secondaryColor: '#000000',
    alliance: null,
    rating: 3.2,
    onTimePerformance: 72,
    comfort: 3.0,
    service: 3.1,
    country: 'USA',
    hub: ['FLL', 'DTW', 'MCO'],
    frequentFlyerProgram: 'Free Spirit',
  },

  // European Carriers
  BA: {
    code: 'BA',
    name: 'British Airways',
    logo: '🇬🇧',
    primaryColor: '#075AAA',
    secondaryColor: '#E32119',
    alliance: 'Oneworld',
    rating: 4.2,
    onTimePerformance: 75,
    comfort: 4.3,
    service: 4.2,
    country: 'United Kingdom',
    hub: ['LHR', 'LGW'],
    frequentFlyerProgram: 'Executive Club',
  },
  LH: {
    code: 'LH',
    name: 'Lufthansa',
    logo: '🇩🇪',
    primaryColor: '#05164D',
    secondaryColor: '#F9B000',
    alliance: 'Star Alliance',
    rating: 4.3,
    onTimePerformance: 79,
    comfort: 4.4,
    service: 4.3,
    country: 'Germany',
    hub: ['FRA', 'MUC'],
    frequentFlyerProgram: 'Miles & More',
  },
  AF: {
    code: 'AF',
    name: 'Air France',
    logo: '🇫🇷',
    primaryColor: '#002157',
    secondaryColor: '#E4002B',
    alliance: 'SkyTeam',
    rating: 4.1,
    onTimePerformance: 74,
    comfort: 4.2,
    service: 4.1,
    country: 'France',
    hub: ['CDG', 'ORY'],
    frequentFlyerProgram: 'Flying Blue',
  },
  KL: {
    code: 'KL',
    name: 'KLM Royal Dutch Airlines',
    logo: '🇳🇱',
    primaryColor: '#00A1DE',
    secondaryColor: '#0063A3',
    alliance: 'SkyTeam',
    rating: 4.3,
    onTimePerformance: 81,
    comfort: 4.3,
    service: 4.4,
    country: 'Netherlands',
    hub: ['AMS'],
    frequentFlyerProgram: 'Flying Blue',
  },
  IB: {
    code: 'IB',
    name: 'Iberia',
    logo: '🇪🇸',
    primaryColor: '#EC1C24',
    secondaryColor: '#FDB913',
    alliance: 'Oneworld',
    rating: 3.9,
    onTimePerformance: 73,
    comfort: 3.8,
    service: 3.9,
    country: 'Spain',
    hub: ['MAD'],
    frequentFlyerProgram: 'Iberia Plus',
  },

  // Middle Eastern Carriers
  EK: {
    code: 'EK',
    name: 'Emirates',
    logo: '🏜️',
    primaryColor: '#D71921',
    secondaryColor: '#FFD700',
    alliance: null,
    rating: 4.8,
    onTimePerformance: 82,
    comfort: 4.9,
    service: 4.8,
    country: 'UAE',
    hub: ['DXB'],
    frequentFlyerProgram: 'Emirates Skywards',
  },
  QR: {
    code: 'QR',
    name: 'Qatar Airways',
    logo: '🐎',
    primaryColor: '#5C0632',
    secondaryColor: '#8B0A50',
    alliance: 'Oneworld',
    rating: 4.9,
    onTimePerformance: 85,
    comfort: 4.9,
    service: 4.9,
    country: 'Qatar',
    hub: ['DOH'],
    frequentFlyerProgram: 'Privilege Club',
  },
  EY: {
    code: 'EY',
    name: 'Etihad Airways',
    logo: '🕌',
    primaryColor: '#C3996B',
    secondaryColor: '#4A4A4A',
    alliance: null,
    rating: 4.6,
    onTimePerformance: 80,
    comfort: 4.7,
    service: 4.6,
    country: 'UAE',
    hub: ['AUH'],
    frequentFlyerProgram: 'Etihad Guest',
  },

  // Asian Carriers
  SQ: {
    code: 'SQ',
    name: 'Singapore Airlines',
    logo: '🦢',
    primaryColor: '#003580',
    secondaryColor: '#FFB612',
    alliance: 'Star Alliance',
    rating: 4.9,
    onTimePerformance: 88,
    comfort: 4.9,
    service: 5.0,
    country: 'Singapore',
    hub: ['SIN'],
    frequentFlyerProgram: 'KrisFlyer',
  },
  CX: {
    code: 'CX',
    name: 'Cathay Pacific',
    logo: '🐉',
    primaryColor: '#007F7F',
    secondaryColor: '#00665E',
    alliance: 'Oneworld',
    rating: 4.5,
    onTimePerformance: 82,
    comfort: 4.6,
    service: 4.6,
    country: 'Hong Kong',
    hub: ['HKG'],
    frequentFlyerProgram: 'Asia Miles',
  },
  NH: {
    code: 'NH',
    name: 'All Nippon Airways',
    logo: '🗾',
    primaryColor: '#17408B',
    secondaryColor: '#0096D6',
    alliance: 'Star Alliance',
    rating: 4.7,
    onTimePerformance: 90,
    comfort: 4.7,
    service: 4.8,
    country: 'Japan',
    hub: ['NRT', 'HND'],
    frequentFlyerProgram: 'ANA Mileage Club',
  },
  TG: {
    code: 'TG',
    name: 'Thai Airways',
    logo: '🇹🇭',
    primaryColor: '#4E2A84',
    secondaryColor: '#FFD700',
    alliance: 'Star Alliance',
    rating: 4.3,
    onTimePerformance: 76,
    comfort: 4.4,
    service: 4.5,
    country: 'Thailand',
    hub: ['BKK'],
    frequentFlyerProgram: 'Royal Orchid Plus',
  },

  // Low-Cost Carriers
  FR: {
    code: 'FR',
    name: 'Ryanair',
    logo: '💙',
    primaryColor: '#073590',
    secondaryColor: '#F1C933',
    alliance: null,
    rating: 3.2,
    onTimePerformance: 88,
    comfort: 2.8,
    service: 3.0,
    country: 'Ireland',
    hub: ['DUB', 'STN'],
    frequentFlyerProgram: 'MyRyanair',
  },
  U2: {
    code: 'U2',
    name: 'easyJet',
    logo: '🧡',
    primaryColor: '#FF6600',
    secondaryColor: '#000000',
    alliance: null,
    rating: 3.5,
    onTimePerformance: 82,
    comfort: 3.2,
    service: 3.4,
    country: 'United Kingdom',
    hub: ['LGW', 'LTN'],
    frequentFlyerProgram: 'easyJet Plus',
  },

  // Canadian Carriers
  AC: {
    code: 'AC',
    name: 'Air Canada',
    logo: '🍁',
    primaryColor: '#E31837',
    secondaryColor: '#000000',
    alliance: 'Star Alliance',
    rating: 4.0,
    onTimePerformance: 77,
    comfort: 4.0,
    service: 4.0,
    country: 'Canada',
    hub: ['YYZ', 'YVR', 'YUL'],
    frequentFlyerProgram: 'Aeroplan',
  },
  WS: {
    code: 'WS',
    name: 'WestJet',
    logo: '🌿',
    primaryColor: '#009DDC',
    secondaryColor: '#007AC9',
    alliance: null,
    rating: 3.9,
    onTimePerformance: 79,
    comfort: 3.8,
    service: 4.0,
    country: 'Canada',
    hub: ['YYC'],
    frequentFlyerProgram: 'WestJet Rewards',
  },

  // Latin American Carriers
  LA: {
    code: 'LA',
    name: 'LATAM Airlines',
    logo: '🦜',
    primaryColor: '#E6007E',
    secondaryColor: '#702F8A',
    alliance: 'Oneworld',
    rating: 4.0,
    onTimePerformance: 75,
    comfort: 4.0,
    service: 4.1,
    country: 'Chile',
    hub: ['SCL', 'LIM', 'GRU'],
    frequentFlyerProgram: 'LATAM Pass',
  },
  AM: {
    code: 'AM',
    name: 'Aeroméxico',
    logo: '🇲🇽',
    primaryColor: '#00539F',
    secondaryColor: '#E41E26',
    alliance: 'SkyTeam',
    rating: 3.9,
    onTimePerformance: 72,
    comfort: 3.8,
    service: 3.9,
    country: 'Mexico',
    hub: ['MEX'],
    frequentFlyerProgram: 'Club Premier',
  },
  AV: {
    code: 'AV',
    name: 'Avianca',
    logo: '🦅',
    primaryColor: '#DC0714',
    secondaryColor: '#FFFFFF',
    alliance: 'Star Alliance',
    rating: 3.8,
    onTimePerformance: 75,
    comfort: 3.7,
    service: 3.8,
    country: 'Colombia',
    hub: ['BOG', 'MDE', 'CLO'],
    frequentFlyerProgram: 'LifeMiles',
  },
  CM: {
    code: 'CM',
    name: 'Copa Airlines',
    logo: '🌎',
    primaryColor: '#003D7A',
    secondaryColor: '#00539F',
    alliance: 'Star Alliance',
    rating: 3.9,
    onTimePerformance: 78,
    comfort: 3.8,
    service: 3.9,
    country: 'Panama',
    hub: ['PTY'],
    frequentFlyerProgram: 'ConnectMiles',
  },

  // Australian/Oceania
  QF: {
    code: 'QF',
    name: 'Qantas',
    logo: '🦘',
    primaryColor: '#E0001B',
    secondaryColor: '#FFFFFF',
    alliance: 'Oneworld',
    rating: 4.4,
    onTimePerformance: 81,
    comfort: 4.4,
    service: 4.5,
    country: 'Australia',
    hub: ['SYD', 'MEL'],
    frequentFlyerProgram: 'Frequent Flyer',
  },
  NZ: {
    code: 'NZ',
    name: 'Air New Zealand',
    logo: '🥝',
    primaryColor: '#000000',
    secondaryColor: '#00B2D6',
    alliance: 'Star Alliance',
    rating: 4.6,
    onTimePerformance: 84,
    comfort: 4.5,
    service: 4.7,
    country: 'New Zealand',
    hub: ['AKL'],
    frequentFlyerProgram: 'Airpoints',
  },

  // Default/Unknown
  XX: {
    code: 'XX',
    name: 'Unknown Airline',
    logo: '✈️',
    primaryColor: '#6B7280',
    secondaryColor: '#9CA3AF',
    alliance: null,
    rating: 3.5,
    onTimePerformance: 75,
    comfort: 3.5,
    service: 3.5,
    country: 'Unknown',
    hub: [],
    frequentFlyerProgram: 'Rewards Program',
  },
};

/**
 * Get airline data by code
 */
export function getAirlineData(code: string): AirlineData {
  return AIRLINE_DATABASE[code.toUpperCase()] || {
    ...AIRLINE_DATABASE.XX,
    code: code.toUpperCase(),
    name: `${code} Airlines`,
  };
}

/**
 * Get airline alliance badge color
 */
export function getAllianceBadgeColor(alliance: string | null | undefined): string {
  switch (alliance) {
    case 'Star Alliance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Oneworld':
      return 'bg-pink-100 text-pink-800 border-pink-300';
    case 'SkyTeam':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
}

/**
 * Get rating color class
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-blue-600';
  if (rating >= 3.5) return 'text-yellow-600';
  return 'text-gray-600';
}

/**
 * Get on-time performance badge
 */
export function getOnTimePerformanceBadge(percentage: number): {
  text: string;
  color: string;
  emoji: string;
} {
  if (percentage >= 85) {
    return { text: 'Excellent', color: 'bg-green-100 text-green-800', emoji: '🟢' };
  }
  if (percentage >= 75) {
    return { text: 'Good', color: 'bg-blue-100 text-blue-800', emoji: '🔵' };
  }
  if (percentage >= 65) {
    return { text: 'Fair', color: 'bg-yellow-100 text-yellow-800', emoji: '🟡' };
  }
  return { text: 'Poor', color: 'bg-red-100 text-red-800', emoji: '🔴' };
}
