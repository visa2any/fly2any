// Alternative airports data with nearby options and transport information

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface AlternativeAirport extends Airport {
  distanceFromMain: number; // miles
  transportOptions: TransportOption[];
  typicalPriceDifference: number; // percentage (negative = cheaper, positive = more expensive)
}

export interface TransportOption {
  type: 'train' | 'bus' | 'uber' | 'taxi' | 'shuttle';
  duration: number; // minutes
  cost: number; // USD
  provider?: string;
  availability: 'always' | 'limited' | 'peak_only';
}

export interface AirportGroup {
  main: Airport;
  alternatives: AlternativeAirport[];
}

// Main airport data with nearby alternatives
export const AIRPORT_ALTERNATIVES: Record<string, AirportGroup> = {
  // New York
  'JFK': {
    main: {
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'LGA',
        name: 'LaGuardia Airport',
        city: 'New York',
        country: 'USA',
        distanceFromMain: 11,
        typicalPriceDifference: -8,
        transportOptions: [
          { type: 'uber', duration: 25, cost: 45, availability: 'always' },
          { type: 'bus', duration: 50, cost: 15, provider: 'NYC Airporter', availability: 'always' },
          { type: 'taxi', duration: 25, cost: 55, availability: 'always' }
        ]
      },
      {
        code: 'EWR',
        name: 'Newark Liberty International Airport',
        city: 'Newark',
        country: 'USA',
        distanceFromMain: 28,
        typicalPriceDifference: -12,
        transportOptions: [
          { type: 'train', duration: 45, cost: 18, provider: 'NJ Transit', availability: 'always' },
          { type: 'uber', duration: 35, cost: 65, availability: 'always' },
          { type: 'bus', duration: 60, cost: 20, provider: 'Newark Airport Express', availability: 'always' }
        ]
      }
    ]
  },
  'LGA': {
    main: {
      code: 'LGA',
      name: 'LaGuardia Airport',
      city: 'New York',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'JFK',
        name: 'John F. Kennedy International Airport',
        city: 'New York',
        country: 'USA',
        distanceFromMain: 11,
        typicalPriceDifference: 5,
        transportOptions: [
          { type: 'uber', duration: 25, cost: 45, availability: 'always' },
          { type: 'bus', duration: 50, cost: 15, provider: 'NYC Airporter', availability: 'always' }
        ]
      },
      {
        code: 'EWR',
        name: 'Newark Liberty International Airport',
        city: 'Newark',
        country: 'USA',
        distanceFromMain: 24,
        typicalPriceDifference: -5,
        transportOptions: [
          { type: 'uber', duration: 40, cost: 70, availability: 'always' },
          { type: 'bus', duration: 65, cost: 22, provider: 'Newark Airport Express', availability: 'always' }
        ]
      }
    ]
  },
  'EWR': {
    main: {
      code: 'EWR',
      name: 'Newark Liberty International Airport',
      city: 'Newark',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'JFK',
        name: 'John F. Kennedy International Airport',
        city: 'New York',
        country: 'USA',
        distanceFromMain: 28,
        typicalPriceDifference: 8,
        transportOptions: [
          { type: 'uber', duration: 35, cost: 65, availability: 'always' },
          { type: 'bus', duration: 70, cost: 20, provider: 'NYC Airporter', availability: 'always' }
        ]
      },
      {
        code: 'LGA',
        name: 'LaGuardia Airport',
        city: 'New York',
        country: 'USA',
        distanceFromMain: 24,
        typicalPriceDifference: 3,
        transportOptions: [
          { type: 'uber', duration: 40, cost: 70, availability: 'always' },
          { type: 'bus', duration: 65, cost: 22, availability: 'always' }
        ]
      }
    ]
  },

  // Los Angeles
  'LAX': {
    main: {
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'BUR',
        name: 'Hollywood Burbank Airport',
        city: 'Burbank',
        country: 'USA',
        distanceFromMain: 28,
        typicalPriceDifference: -10,
        transportOptions: [
          { type: 'uber', duration: 35, cost: 50, availability: 'always' },
          { type: 'shuttle', duration: 60, cost: 25, provider: 'SuperShuttle', availability: 'always' },
          { type: 'bus', duration: 75, cost: 10, provider: 'Metro', availability: 'limited' }
        ]
      },
      {
        code: 'SNA',
        name: 'John Wayne Airport',
        city: 'Santa Ana',
        country: 'USA',
        distanceFromMain: 42,
        typicalPriceDifference: -15,
        transportOptions: [
          { type: 'uber', duration: 50, cost: 75, availability: 'always' },
          { type: 'shuttle', duration: 75, cost: 35, provider: 'Karmel Shuttle', availability: 'always' }
        ]
      },
      {
        code: 'ONT',
        name: 'Ontario International Airport',
        city: 'Ontario',
        country: 'USA',
        distanceFromMain: 48,
        typicalPriceDifference: -18,
        transportOptions: [
          { type: 'uber', duration: 55, cost: 80, availability: 'always' },
          { type: 'shuttle', duration: 80, cost: 40, provider: 'SuperShuttle', availability: 'always' }
        ]
      }
    ]
  },
  'BUR': {
    main: {
      code: 'BUR',
      name: 'Hollywood Burbank Airport',
      city: 'Burbank',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'LAX',
        name: 'Los Angeles International Airport',
        city: 'Los Angeles',
        country: 'USA',
        distanceFromMain: 28,
        typicalPriceDifference: 8,
        transportOptions: [
          { type: 'uber', duration: 35, cost: 50, availability: 'always' },
          { type: 'bus', duration: 75, cost: 10, provider: 'Metro', availability: 'limited' }
        ]
      },
      {
        code: 'SNA',
        name: 'John Wayne Airport',
        city: 'Santa Ana',
        country: 'USA',
        distanceFromMain: 65,
        typicalPriceDifference: -5,
        transportOptions: [
          { type: 'uber', duration: 70, cost: 95, availability: 'always' }
        ]
      }
    ]
  },
  'SNA': {
    main: {
      code: 'SNA',
      name: 'John Wayne Airport',
      city: 'Santa Ana',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'LAX',
        name: 'Los Angeles International Airport',
        city: 'Los Angeles',
        country: 'USA',
        distanceFromMain: 42,
        typicalPriceDifference: 12,
        transportOptions: [
          { type: 'uber', duration: 50, cost: 75, availability: 'always' }
        ]
      },
      {
        code: 'ONT',
        name: 'Ontario International Airport',
        city: 'Ontario',
        country: 'USA',
        distanceFromMain: 35,
        typicalPriceDifference: -3,
        transportOptions: [
          { type: 'uber', duration: 40, cost: 60, availability: 'always' }
        ]
      }
    ]
  },
  'ONT': {
    main: {
      code: 'ONT',
      name: 'Ontario International Airport',
      city: 'Ontario',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'LAX',
        name: 'Los Angeles International Airport',
        city: 'Los Angeles',
        country: 'USA',
        distanceFromMain: 48,
        typicalPriceDifference: 15,
        transportOptions: [
          { type: 'uber', duration: 55, cost: 80, availability: 'always' }
        ]
      },
      {
        code: 'SNA',
        name: 'John Wayne Airport',
        city: 'Santa Ana',
        country: 'USA',
        distanceFromMain: 35,
        typicalPriceDifference: 2,
        transportOptions: [
          { type: 'uber', duration: 40, cost: 60, availability: 'always' }
        ]
      }
    ]
  },

  // San Francisco
  'SFO': {
    main: {
      code: 'SFO',
      name: 'San Francisco International Airport',
      city: 'San Francisco',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'OAK',
        name: 'Oakland International Airport',
        city: 'Oakland',
        country: 'USA',
        distanceFromMain: 22,
        typicalPriceDifference: -12,
        transportOptions: [
          { type: 'train', duration: 40, cost: 12, provider: 'BART', availability: 'always' },
          { type: 'uber', duration: 25, cost: 45, availability: 'always' },
          { type: 'shuttle', duration: 50, cost: 20, provider: 'BayPorter', availability: 'always' }
        ]
      },
      {
        code: 'SJC',
        name: 'Norman Y. Mineta San Jose International Airport',
        city: 'San Jose',
        country: 'USA',
        distanceFromMain: 42,
        typicalPriceDifference: -8,
        transportOptions: [
          { type: 'uber', duration: 50, cost: 70, availability: 'always' },
          { type: 'train', duration: 75, cost: 15, provider: 'Caltrain', availability: 'limited' },
          { type: 'shuttle', duration: 70, cost: 35, provider: 'South & East Bay Airport Shuttle', availability: 'always' }
        ]
      }
    ]
  },
  'OAK': {
    main: {
      code: 'OAK',
      name: 'Oakland International Airport',
      city: 'Oakland',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'SFO',
        name: 'San Francisco International Airport',
        city: 'San Francisco',
        country: 'USA',
        distanceFromMain: 22,
        typicalPriceDifference: 10,
        transportOptions: [
          { type: 'train', duration: 40, cost: 12, provider: 'BART', availability: 'always' },
          { type: 'uber', duration: 25, cost: 45, availability: 'always' }
        ]
      },
      {
        code: 'SJC',
        name: 'Norman Y. Mineta San Jose International Airport',
        city: 'San Jose',
        country: 'USA',
        distanceFromMain: 38,
        typicalPriceDifference: 3,
        transportOptions: [
          { type: 'uber', duration: 45, cost: 65, availability: 'always' }
        ]
      }
    ]
  },
  'SJC': {
    main: {
      code: 'SJC',
      name: 'Norman Y. Mineta San Jose International Airport',
      city: 'San Jose',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'SFO',
        name: 'San Francisco International Airport',
        city: 'San Francisco',
        country: 'USA',
        distanceFromMain: 42,
        typicalPriceDifference: 7,
        transportOptions: [
          { type: 'uber', duration: 50, cost: 70, availability: 'always' },
          { type: 'train', duration: 75, cost: 15, provider: 'Caltrain', availability: 'limited' }
        ]
      },
      {
        code: 'OAK',
        name: 'Oakland International Airport',
        city: 'Oakland',
        country: 'USA',
        distanceFromMain: 38,
        typicalPriceDifference: -3,
        transportOptions: [
          { type: 'uber', duration: 45, cost: 65, availability: 'always' }
        ]
      }
    ]
  },

  // Chicago
  'ORD': {
    main: {
      code: 'ORD',
      name: "O'Hare International Airport",
      city: 'Chicago',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'MDW',
        name: 'Midway International Airport',
        city: 'Chicago',
        country: 'USA',
        distanceFromMain: 18,
        typicalPriceDifference: -15,
        transportOptions: [
          { type: 'train', duration: 35, cost: 5, provider: 'CTA Orange Line', availability: 'always' },
          { type: 'uber', duration: 25, cost: 40, availability: 'always' },
          { type: 'shuttle', duration: 45, cost: 25, provider: 'GO Airport Express', availability: 'always' }
        ]
      }
    ]
  },
  'MDW': {
    main: {
      code: 'MDW',
      name: 'Midway International Airport',
      city: 'Chicago',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'ORD',
        name: "O'Hare International Airport",
        city: 'Chicago',
        country: 'USA',
        distanceFromMain: 18,
        typicalPriceDifference: 12,
        transportOptions: [
          { type: 'train', duration: 50, cost: 5, provider: 'CTA Blue Line', availability: 'always' },
          { type: 'uber', duration: 25, cost: 40, availability: 'always' }
        ]
      }
    ]
  },

  // Washington DC
  'IAD': {
    main: {
      code: 'IAD',
      name: 'Washington Dulles International Airport',
      city: 'Washington',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'DCA',
        name: 'Ronald Reagan Washington National Airport',
        city: 'Arlington',
        country: 'USA',
        distanceFromMain: 27,
        typicalPriceDifference: -5,
        transportOptions: [
          { type: 'train', duration: 60, cost: 8, provider: 'Metro', availability: 'always' },
          { type: 'uber', duration: 35, cost: 55, availability: 'always' },
          { type: 'shuttle', duration: 55, cost: 30, provider: 'Supreme Airport Shuttle', availability: 'always' }
        ]
      },
      {
        code: 'BWI',
        name: 'Baltimore/Washington International Airport',
        city: 'Baltimore',
        country: 'USA',
        distanceFromMain: 48,
        typicalPriceDifference: -18,
        transportOptions: [
          { type: 'train', duration: 70, cost: 16, provider: 'MARC', availability: 'limited' },
          { type: 'uber', duration: 50, cost: 75, availability: 'always' },
          { type: 'shuttle', duration: 75, cost: 40, provider: 'Supreme Airport Shuttle', availability: 'always' }
        ]
      }
    ]
  },
  'DCA': {
    main: {
      code: 'DCA',
      name: 'Ronald Reagan Washington National Airport',
      city: 'Arlington',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'IAD',
        name: 'Washington Dulles International Airport',
        city: 'Washington',
        country: 'USA',
        distanceFromMain: 27,
        typicalPriceDifference: 4,
        transportOptions: [
          { type: 'uber', duration: 35, cost: 55, availability: 'always' },
          { type: 'shuttle', duration: 55, cost: 30, provider: 'Supreme Airport Shuttle', availability: 'always' }
        ]
      },
      {
        code: 'BWI',
        name: 'Baltimore/Washington International Airport',
        city: 'Baltimore',
        country: 'USA',
        distanceFromMain: 35,
        typicalPriceDifference: -12,
        transportOptions: [
          { type: 'train', duration: 55, cost: 16, provider: 'MARC', availability: 'limited' },
          { type: 'uber', duration: 40, cost: 65, availability: 'always' }
        ]
      }
    ]
  },
  'BWI': {
    main: {
      code: 'BWI',
      name: 'Baltimore/Washington International Airport',
      city: 'Baltimore',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'DCA',
        name: 'Ronald Reagan Washington National Airport',
        city: 'Arlington',
        country: 'USA',
        distanceFromMain: 35,
        typicalPriceDifference: 10,
        transportOptions: [
          { type: 'uber', duration: 40, cost: 65, availability: 'always' },
          { type: 'train', duration: 55, cost: 16, provider: 'MARC', availability: 'limited' }
        ]
      },
      {
        code: 'IAD',
        name: 'Washington Dulles International Airport',
        city: 'Washington',
        country: 'USA',
        distanceFromMain: 48,
        typicalPriceDifference: 15,
        transportOptions: [
          { type: 'uber', duration: 50, cost: 75, availability: 'always' }
        ]
      }
    ]
  },

  // Miami
  'MIA': {
    main: {
      code: 'MIA',
      name: 'Miami International Airport',
      city: 'Miami',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'FLL',
        name: 'Fort Lauderdale-Hollywood International Airport',
        city: 'Fort Lauderdale',
        country: 'USA',
        distanceFromMain: 28,
        typicalPriceDifference: -20,
        transportOptions: [
          { type: 'train', duration: 45, cost: 12, provider: 'Tri-Rail', availability: 'limited' },
          { type: 'uber', duration: 35, cost: 50, availability: 'always' },
          { type: 'shuttle', duration: 55, cost: 25, provider: 'GO Airport Shuttle', availability: 'always' }
        ]
      },
      {
        code: 'PBI',
        name: 'Palm Beach International Airport',
        city: 'West Palm Beach',
        country: 'USA',
        distanceFromMain: 68,
        typicalPriceDifference: -15,
        transportOptions: [
          { type: 'uber', duration: 75, cost: 100, availability: 'always' },
          { type: 'shuttle', duration: 95, cost: 50, provider: 'GO Airport Shuttle', availability: 'always' }
        ]
      }
    ]
  },
  'FLL': {
    main: {
      code: 'FLL',
      name: 'Fort Lauderdale-Hollywood International Airport',
      city: 'Fort Lauderdale',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'MIA',
        name: 'Miami International Airport',
        city: 'Miami',
        country: 'USA',
        distanceFromMain: 28,
        typicalPriceDifference: 18,
        transportOptions: [
          { type: 'train', duration: 45, cost: 12, provider: 'Tri-Rail', availability: 'limited' },
          { type: 'uber', duration: 35, cost: 50, availability: 'always' }
        ]
      },
      {
        code: 'PBI',
        name: 'Palm Beach International Airport',
        city: 'West Palm Beach',
        country: 'USA',
        distanceFromMain: 45,
        typicalPriceDifference: 5,
        transportOptions: [
          { type: 'uber', duration: 50, cost: 70, availability: 'always' }
        ]
      }
    ]
  },

  // Boston
  'BOS': {
    main: {
      code: 'BOS',
      name: 'Boston Logan International Airport',
      city: 'Boston',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'MHT',
        name: 'Manchester-Boston Regional Airport',
        city: 'Manchester',
        country: 'USA',
        distanceFromMain: 52,
        typicalPriceDifference: -25,
        transportOptions: [
          { type: 'uber', duration: 60, cost: 85, availability: 'always' },
          { type: 'shuttle', duration: 80, cost: 40, provider: 'Flight Line', availability: 'always' }
        ]
      },
      {
        code: 'PVD',
        name: 'T.F. Green Airport',
        city: 'Providence',
        country: 'USA',
        distanceFromMain: 50,
        typicalPriceDifference: -15,
        transportOptions: [
          { type: 'train', duration: 65, cost: 14, provider: 'MBTA Commuter Rail', availability: 'limited' },
          { type: 'uber', duration: 55, cost: 80, availability: 'always' }
        ]
      }
    ]
  },

  // Houston
  'IAH': {
    main: {
      code: 'IAH',
      name: 'George Bush Intercontinental Airport',
      city: 'Houston',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'HOU',
        name: 'William P. Hobby Airport',
        city: 'Houston',
        country: 'USA',
        distanceFromMain: 32,
        typicalPriceDifference: -12,
        transportOptions: [
          { type: 'uber', duration: 35, cost: 50, availability: 'always' },
          { type: 'bus', duration: 60, cost: 15, provider: 'Metro', availability: 'always' }
        ]
      }
    ]
  },
  'HOU': {
    main: {
      code: 'HOU',
      name: 'William P. Hobby Airport',
      city: 'Houston',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'IAH',
        name: 'George Bush Intercontinental Airport',
        city: 'Houston',
        country: 'USA',
        distanceFromMain: 32,
        typicalPriceDifference: 10,
        transportOptions: [
          { type: 'uber', duration: 35, cost: 50, availability: 'always' },
          { type: 'bus', duration: 60, cost: 15, provider: 'Metro', availability: 'always' }
        ]
      }
    ]
  },

  // Dallas
  'DFW': {
    main: {
      code: 'DFW',
      name: 'Dallas/Fort Worth International Airport',
      city: 'Dallas',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'DAL',
        name: 'Dallas Love Field',
        city: 'Dallas',
        country: 'USA',
        distanceFromMain: 22,
        typicalPriceDifference: -10,
        transportOptions: [
          { type: 'uber', duration: 28, cost: 45, availability: 'always' },
          { type: 'train', duration: 50, cost: 6, provider: 'DART', availability: 'always' }
        ]
      }
    ]
  },
  'DAL': {
    main: {
      code: 'DAL',
      name: 'Dallas Love Field',
      city: 'Dallas',
      country: 'USA'
    },
    alternatives: [
      {
        code: 'DFW',
        name: 'Dallas/Fort Worth International Airport',
        city: 'Dallas',
        country: 'USA',
        distanceFromMain: 22,
        typicalPriceDifference: 8,
        transportOptions: [
          { type: 'uber', duration: 28, cost: 45, availability: 'always' },
          { type: 'train', duration: 50, cost: 6, provider: 'DART', availability: 'always' }
        ]
      }
    ]
  }
};

// Helper function to get alternatives for an airport
export function getAlternativeAirports(airportCode: string): AirportGroup | null {
  const normalized = airportCode.toUpperCase();
  return AIRPORT_ALTERNATIVES[normalized] || null;
}

// Helper function to check if an airport has alternatives
export function hasAlternatives(airportCode: string): boolean {
  const alternatives = getAlternativeAirports(airportCode);
  return alternatives !== null && alternatives.alternatives.length > 0;
}

// Helper function to get all airport codes in a group
export function getAirportGroup(airportCode: string): string[] {
  const alternatives = getAlternativeAirports(airportCode);
  if (!alternatives) return [airportCode];

  return [
    alternatives.main.code,
    ...alternatives.alternatives.map(alt => alt.code)
  ];
}

// Get the cheapest transport option for an alternative airport
export function getCheapestTransport(alternative: AlternativeAirport): TransportOption {
  return alternative.transportOptions.reduce((cheapest, current) =>
    current.cost < cheapest.cost ? current : cheapest
  );
}

// Get the fastest transport option for an alternative airport
export function getFastestTransport(alternative: AlternativeAirport): TransportOption {
  return alternative.transportOptions.reduce((fastest, current) =>
    current.duration < fastest.duration ? current : fastest
  );
}

// Calculate total cost including transport
export function calculateTotalCost(
  flightPrice: number,
  transportCost: number,
  roundTrip: boolean = true
): number {
  const transportMultiplier = roundTrip ? 2 : 1;
  return flightPrice + (transportCost * transportMultiplier);
}
