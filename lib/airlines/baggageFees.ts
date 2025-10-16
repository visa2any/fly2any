/**
 * Comprehensive Baggage Fee Database
 * Updated: January 2025
 * Fees in USD - will be converted based on user's currency
 */

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type RouteType = 'DOMESTIC' | 'INTERNATIONAL';

export interface BaggageFeeStructure {
  carryOn: number;
  checked1: number;
  checked2: number;
  checked3: number;
  oversized: number;
  overweight: number; // per bag
  sportEquipment: number;
}

export interface AirlineBaggagePolicy {
  name: string;
  code: string;
  logo?: string;
  policies: {
    [key in CabinClass]?: {
      [key in RouteType]?: BaggageFeeStructure;
    };
  };
  perks: string[];
  policyUrl: string;
  personalItemIncluded: boolean;
  carryOnIncluded: boolean;
  weightLimit: {
    carryOn: string;
    checked: string;
  };
  sizeLimit: {
    carryOn: string;
    checked: string;
    personalItem: string;
  };
}

export const BAGGAGE_FEES: Record<string, AirlineBaggagePolicy> = {
  AA: {
    name: 'American Airlines',
    code: 'AA',
    logo: '/airlines/aa.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.aa.com/i18n/travel-info/baggage/baggage.jsp',
    weightLimit: {
      carryOn: '10 kg (22 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '18 x 14 x 8 in',
      carryOn: '22 x 14 x 9 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 35,
          checked2: 45,
          checked3: 150,
          oversized: 200,
          overweight: 100,
          sportEquipment: 35,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 150,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 40,
          checked3: 150,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      FIRST: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
    ],
  },

  DL: {
    name: 'Delta Air Lines',
    code: 'DL',
    logo: '/airlines/delta.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.delta.com/us/en/baggage/overview',
    weightLimit: {
      carryOn: '10 kg (22 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '17 x 13 x 9 in',
      carryOn: '22 x 14 x 9 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 35,
          checked2: 45,
          checked3: 150,
          oversized: 200,
          overweight: 100,
          sportEquipment: 35,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 150,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 40,
          checked3: 150,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      FIRST: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'SkyMiles members get priority',
    ],
  },

  UA: {
    name: 'United Airlines',
    code: 'UA',
    logo: '/airlines/united.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.united.com/ual/en/us/fly/travel/baggage.html',
    weightLimit: {
      carryOn: '10 kg (22 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '17 x 10 x 9 in',
      carryOn: '22 x 14 x 9 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 35,
          checked2: 45,
          checked3: 150,
          oversized: 200,
          overweight: 100,
          sportEquipment: 35,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 150,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 40,
          checked3: 150,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      FIRST: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'MileagePlus members save on fees',
    ],
  },

  WN: {
    name: 'Southwest Airlines',
    code: 'WN',
    logo: '/airlines/southwest.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.southwest.com/help/baggage',
    weightLimit: {
      carryOn: '10 kg (22 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '18.5 x 13.5 x 8.5 in',
      carryOn: '24 x 16 x 10 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 75,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 75,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 75,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 75,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
      },
      BUSINESS: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 75,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 75,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First 2 checked bags FREE!',
      'Best baggage policy in the industry',
    ],
  },

  NK: {
    name: 'Spirit Airlines',
    code: 'NK',
    logo: '/airlines/spirit.svg',
    personalItemIncluded: true,
    carryOnIncluded: false, // Spirit charges for carry-on!
    policyUrl: 'https://www.spirit.com/optional-services',
    weightLimit: {
      carryOn: '18 kg (40 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '18 x 14 x 8 in',
      carryOn: '22 x 18 x 10 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 65, // Spirit charges for carry-on!
          checked1: 50,
          checked2: 60,
          checked3: 100,
          oversized: 100,
          overweight: 100,
          sportEquipment: 100,
        },
        INTERNATIONAL: {
          carryOn: 65,
          checked1: 65,
          checked2: 75,
          checked3: 100,
          oversized: 100,
          overweight: 100,
          sportEquipment: 100,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 50,
          checked2: 60,
          checked3: 100,
          oversized: 100,
          overweight: 100,
          sportEquipment: 100,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 65,
          checked2: 75,
          checked3: 100,
          oversized: 100,
          overweight: 100,
          sportEquipment: 100,
        },
      },
    },
    perks: [
      'Personal item included (18x14x8 in)',
      'Ultra-low base fares',
      'Pay only for what you need',
    ],
  },

  B6: {
    name: 'JetBlue Airways',
    code: 'B6',
    logo: '/airlines/jetblue.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.jetblue.com/help/baggage',
    weightLimit: {
      carryOn: '10 kg (22 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '17 x 13 x 8 in',
      carryOn: '22 x 14 x 9 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 35,
          checked2: 45,
          checked3: 150,
          oversized: 150,
          overweight: 100,
          sportEquipment: 50,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 150,
          overweight: 100,
          sportEquipment: 75,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 45,
          checked3: 150,
          oversized: 150,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 150,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 150,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 150,
          overweight: 100,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'Generous legroom',
    ],
  },

  AS: {
    name: 'Alaska Airlines',
    code: 'AS',
    logo: '/airlines/alaska.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.alaskaair.com/content/travel-info/baggage',
    weightLimit: {
      carryOn: '10 kg (22 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '17 x 13 x 8 in',
      carryOn: '22 x 14 x 9 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 35,
          checked2: 45,
          checked3: 150,
          oversized: 100,
          overweight: 100,
          sportEquipment: 35,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 100,
          overweight: 100,
          sportEquipment: 75,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 45,
          checked3: 150,
          oversized: 100,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 100,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 100,
          overweight: 100,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 100,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      FIRST: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'Mileage Plan members save',
    ],
  },

  F9: {
    name: 'Frontier Airlines',
    code: 'F9',
    logo: '/airlines/frontier.svg',
    personalItemIncluded: true,
    carryOnIncluded: false, // Frontier charges for carry-on!
    policyUrl: 'https://www.flyfrontier.com/travel/travel-info/bag-options/',
    weightLimit: {
      carryOn: '16 kg (35 lbs)',
      checked: '23 kg (50 lbs)',
    },
    sizeLimit: {
      personalItem: '18 x 14 x 8 in',
      carryOn: '24 x 16 x 10 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        DOMESTIC: {
          carryOn: 60, // Frontier charges for carry-on!
          checked1: 55,
          checked2: 65,
          checked3: 100,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
        INTERNATIONAL: {
          carryOn: 60,
          checked1: 60,
          checked2: 70,
          checked3: 100,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
      },
      PREMIUM_ECONOMY: {
        DOMESTIC: {
          carryOn: 0,
          checked1: 55,
          checked2: 65,
          checked3: 100,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 60,
          checked2: 70,
          checked3: 100,
          oversized: 75,
          overweight: 75,
          sportEquipment: 75,
        },
      },
    },
    perks: [
      'Personal item included (18x14x8 in)',
      'Low base fares',
      'Wildlife themed planes',
    ],
  },

  // International Carriers
  BA: {
    name: 'British Airways',
    code: 'BA',
    logo: '/airlines/ba.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.britishairways.com/en-us/information/baggage-essentials',
    weightLimit: {
      carryOn: '23 kg (51 lbs)',
      checked: '23 kg (51 lbs)',
    },
    sizeLimit: {
      personalItem: '16 x 12 x 6 in',
      carryOn: '22 x 18 x 10 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 150,
        },
      },
      PREMIUM_ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
      FIRST: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'Generous weight allowance',
    ],
  },

  LH: {
    name: 'Lufthansa',
    code: 'LH',
    logo: '/airlines/lufthansa.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.lufthansa.com/us/en/baggage',
    weightLimit: {
      carryOn: '8 kg (18 lbs)',
      checked: '23 kg (51 lbs)',
    },
    sizeLimit: {
      personalItem: '16 x 12 x 6 in',
      carryOn: '22 x 18 x 10 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 150,
        },
      },
      PREMIUM_ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
      FIRST: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'Star Alliance benefits',
    ],
  },

  AF: {
    name: 'Air France',
    code: 'AF',
    logo: '/airlines/airfrance.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.airfrance.us/US/en/common/travel-guide/baggage.htm',
    weightLimit: {
      carryOn: '12 kg (26 lbs)',
      checked: '23 kg (51 lbs)',
    },
    sizeLimit: {
      personalItem: '16 x 12 x 6 in',
      carryOn: '22 x 18 x 10 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 100,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 150,
        },
      },
      PREMIUM_ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 200,
          oversized: 200,
          overweight: 100,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
      FIRST: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'SkyTeam alliance benefits',
    ],
  },

  EK: {
    name: 'Emirates',
    code: 'EK',
    logo: '/airlines/emirates.svg',
    personalItemIncluded: true,
    carryOnIncluded: true,
    policyUrl: 'https://www.emirates.com/us/english/before-you-fly/baggage/',
    weightLimit: {
      carryOn: '7 kg (15 lbs)',
      checked: '30 kg (66 lbs)',
    },
    sizeLimit: {
      personalItem: '18 x 14 x 8 in',
      carryOn: '22 x 15 x 8 in',
      checked: '62 linear inches',
    },
    policies: {
      ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 150,
          checked3: 300,
          oversized: 250,
          overweight: 150,
          sportEquipment: 200,
        },
      },
      PREMIUM_ECONOMY: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 300,
          oversized: 250,
          overweight: 150,
          sportEquipment: 0,
        },
      },
      BUSINESS: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
      FIRST: {
        INTERNATIONAL: {
          carryOn: 0,
          checked1: 0,
          checked2: 0,
          checked3: 0,
          oversized: 0,
          overweight: 0,
          sportEquipment: 0,
        },
      },
    },
    perks: [
      'Personal item included',
      'Carry-on bag included',
      'First bag free on international flights',
      'Generous weight allowances',
      'World-class service',
    ],
  },
};

/**
 * Get baggage fees for a specific airline and cabin class
 */
export function getBaggageFees(
  airlineCode: string,
  cabinClass: CabinClass,
  routeType: RouteType = 'DOMESTIC'
): BaggageFeeStructure | null {
  const airline = BAGGAGE_FEES[airlineCode.toUpperCase()];
  if (!airline) return null;

  const policy = airline.policies[cabinClass];
  if (!policy) return null;

  return policy[routeType] || policy.DOMESTIC || null;
}

/**
 * Get airline policy information
 */
export function getAirlinePolicy(airlineCode: string): AirlineBaggagePolicy | null {
  return BAGGAGE_FEES[airlineCode.toUpperCase()] || null;
}

/**
 * Check if airline code exists in database
 */
export function isAirlineSupported(airlineCode: string): boolean {
  return airlineCode.toUpperCase() in BAGGAGE_FEES;
}

/**
 * Get all supported airlines
 */
export function getSupportedAirlines(): AirlineBaggagePolicy[] {
  return Object.values(BAGGAGE_FEES);
}

/**
 * Calculate total baggage fees
 */
export interface BaggageSelection {
  carryOn: number;
  checked1: number;
  checked2: number;
  checked3: number;
  oversized: number;
  overweight: number;
  sportEquipment: number;
}

export function calculateBaggageFees(
  airlineCode: string,
  cabinClass: CabinClass,
  selection: BaggageSelection,
  passengers: { adults: number; children: number; infants: number },
  routeType: RouteType = 'DOMESTIC'
): number {
  const fees = getBaggageFees(airlineCode, cabinClass, routeType);
  if (!fees) return 0;

  const totalPassengers = passengers.adults + passengers.children;

  let total = 0;
  total += selection.carryOn * fees.carryOn * totalPassengers;
  total += selection.checked1 * fees.checked1 * totalPassengers;
  total += selection.checked2 * fees.checked2 * totalPassengers;
  total += selection.checked3 * fees.checked3 * totalPassengers;
  total += selection.oversized * fees.oversized;
  total += selection.overweight * fees.overweight;
  total += selection.sportEquipment * fees.sportEquipment;

  return total;
}
