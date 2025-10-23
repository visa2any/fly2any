/**
 * Aircraft Amenities Database
 *
 * Provides estimated amenities based on aircraft type and cabin class
 * when real data is not available from Amadeus Branded Fares API
 *
 * Data sources:
 * - SeatGuru (seatguru.com)
 * - Airline fleet specifications
 * - Industry standards for each aircraft type
 */

export interface AircraftAmenities {
  wifi: boolean;
  power: boolean;
  meal: string;
  entertainment: boolean;
  seatPitch?: string;
  seatWidth?: string;
  isEstimated?: boolean;
}

export interface CabinAmenities {
  FIRST?: AircraftAmenities;
  BUSINESS?: AircraftAmenities;
  PREMIUM_ECONOMY?: AircraftAmenities;
  ECONOMY?: AircraftAmenities;
}

/**
 * Comprehensive aircraft amenities database
 * Key = Aircraft code (from Amadeus API aircraft.code field)
 */
export const AIRCRAFT_AMENITIES_DB: Record<string, CabinAmenities> = {
  // ========================================
  // BOEING WIDE-BODY (Long-haul, typically well-equipped)
  // ========================================

  '787': { // Boeing 787 Dreamliner (modern, most airlines have full amenities)
    FIRST: {
      wifi: true,
      power: true,
      meal: 'Multi-course meal',
      entertainment: true,
      seatPitch: '80"',
      seatWidth: '24"'
    },
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '78"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18.5"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Snack or meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '17.5"'
    }
  },

  '788': { // Boeing 787-8 (same as 787)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '78"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18.5"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Snack or meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '17.5"'
    }
  },

  '789': { // Boeing 787-9 (same as 787)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '78"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18.5"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Snack or meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '17.5"'
    }
  },

  '350': { // Airbus A350 (modern, highly equipped)
    FIRST: {
      wifi: true,
      power: true,
      meal: 'Multi-course meal',
      entertainment: true,
      seatPitch: '82"',
      seatWidth: '24"'
    },
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '78"',
      seatWidth: '22"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '19"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Snack or meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '18"'
    }
  },

  '359': { // Airbus A350-900
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '78"',
      seatWidth: '22"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '19"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Snack or meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '18"'
    }
  },

  '777': { // Boeing 777 (varies by airline, older ones may lack WiFi in economy)
    FIRST: {
      wifi: true,
      power: true,
      meal: 'Multi-course meal',
      entertainment: true,
      seatPitch: '82"',
      seatWidth: '23"'
    },
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '75"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false, // Many 777s don't have WiFi in economy
      power: true, // But usually have power
      meal: 'Meal',
      entertainment: true,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  },

  '77W': { // Boeing 777-300ER (same as 777)
    FIRST: {
      wifi: true,
      power: true,
      meal: 'Multi-course meal',
      entertainment: true,
      seatPitch: '82"',
      seatWidth: '23"'
    },
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '75"',
      seatWidth: '21"'
    },
    ECONOMY: {
      wifi: false,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  },

  '380': { // Airbus A380 (superjumbo, usually very well equipped)
    FIRST: {
      wifi: true,
      power: true,
      meal: 'Multi-course meal',
      entertainment: true,
      seatPitch: '88"',
      seatWidth: '25"'
    },
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '78"',
      seatWidth: '22"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '19"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '18"'
    }
  },

  '330': { // Airbus A330 (mid-range wide-body)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '74"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false, // Older A330s often lack WiFi
      power: false,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  },

  '333': { // Airbus A330-300
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '74"',
      seatWidth: '21"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  },

  '339': { // Airbus A330neo (newer, better equipped)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '76"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '32"',
      seatWidth: '17"'
    }
  },

  // ========================================
  // BOEING NARROW-BODY (Short-medium haul)
  // ========================================

  '737': { // Boeing 737 (most common, basic amenities)
    BUSINESS: {
      wifi: true, // Most newer 737s have WiFi
      power: false, // Many lack power in business
      meal: 'Meal',
      entertainment: false, // Usually no IFE
      seatPitch: '37"',
      seatWidth: '20"'
    },
    ECONOMY: {
      wifi: false, // Some have, some don't
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  '738': { // Boeing 737-800
    BUSINESS: {
      wifi: true,
      power: false,
      meal: 'Meal',
      entertainment: false,
      seatPitch: '37"',
      seatWidth: '20"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  '73H': { // Boeing 737-800 (winglets)
    BUSINESS: {
      wifi: true,
      power: false,
      meal: 'Meal',
      entertainment: false,
      seatPitch: '37"',
      seatWidth: '20"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  '7M8': { // Boeing 737 MAX 8 (newer, better equipped)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '37"',
      seatWidth: '20"'
    },
    ECONOMY: {
      wifi: true,
      power: false,
      meal: 'Snack',
      entertainment: true,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  // ========================================
  // AIRBUS NARROW-BODY (A320 family)
  // ========================================

  '320': { // Airbus A320 (common short-haul)
    BUSINESS: {
      wifi: false,
      power: false,
      meal: 'Meal',
      entertainment: false,
      seatPitch: '34"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  '321': { // Airbus A321 (longer range, sometimes better equipped)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '37"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: true,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  '32Q': { // Airbus A321neo (newer)
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '37"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: true,
      power: false,
      meal: 'Snack',
      entertainment: true,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  '319': { // Airbus A319 (smaller)
    BUSINESS: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '34"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '30"',
      seatWidth: '17"'
    }
  },

  // ========================================
  // REGIONAL JETS (Small aircraft, minimal amenities)
  // ========================================

  'E90': { // Embraer E190
    BUSINESS: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '34"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  },

  'CR9': { // Canadair CRJ-900
    FIRST: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '37"',
      seatWidth: '21"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  },

  // ========================================
  // DEFAULT FALLBACK (by cabin class)
  // ========================================

  'DEFAULT': {
    FIRST: {
      wifi: true,
      power: true,
      meal: 'Multi-course meal',
      entertainment: true,
      seatPitch: '80"',
      seatWidth: '22"'
    },
    BUSINESS: {
      wifi: true,
      power: true,
      meal: 'Hot meal',
      entertainment: true,
      seatPitch: '60"',
      seatWidth: '21"'
    },
    PREMIUM_ECONOMY: {
      wifi: true,
      power: true,
      meal: 'Meal',
      entertainment: true,
      seatPitch: '38"',
      seatWidth: '18"'
    },
    ECONOMY: {
      wifi: false,
      power: false,
      meal: 'Snack',
      entertainment: false,
      seatPitch: '31"',
      seatWidth: '17"'
    }
  }
};

/**
 * Get estimated amenities based on aircraft type and cabin class
 *
 * @param aircraftCode - Aircraft code from Amadeus API (e.g., "738", "787", "350")
 * @param cabin - Cabin class (FIRST, BUSINESS, PREMIUM_ECONOMY, ECONOMY)
 * @returns Amenities object with isEstimated flag
 */
export function getEstimatedAmenities(
  aircraftCode: string | undefined,
  cabin: string
): AircraftAmenities {
  // Default cabin if not recognized
  const cabinClass = ['FIRST', 'BUSINESS', 'PREMIUM_ECONOMY', 'ECONOMY'].includes(cabin)
    ? cabin
    : 'ECONOMY';

  // If no aircraft code provided, use default for cabin class
  if (!aircraftCode) {
    return {
      ...AIRCRAFT_AMENITIES_DB.DEFAULT[cabinClass as keyof CabinAmenities]!,
      isEstimated: true
    };
  }

  // Normalize aircraft code (remove non-alphanumeric, uppercase)
  const normalized = aircraftCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  // Try exact match first (e.g., "787", "350", "73H")
  if (AIRCRAFT_AMENITIES_DB[normalized]?.[cabinClass as keyof CabinAmenities]) {
    return {
      ...AIRCRAFT_AMENITIES_DB[normalized][cabinClass as keyof CabinAmenities]!,
      isEstimated: true
    };
  }

  // Try aircraft family match (e.g., "788" -> "787", "738" -> "737")
  const family = normalized.slice(0, 3);
  if (AIRCRAFT_AMENITIES_DB[family]?.[cabinClass as keyof CabinAmenities]) {
    return {
      ...AIRCRAFT_AMENITIES_DB[family][cabinClass as keyof CabinAmenities]!,
      isEstimated: true
    };
  }

  // Try first 2 characters (e.g., "77W" -> "77" -> look for "777")
  const shortFamily = normalized.slice(0, 2);
  const extendedFamily = shortFamily + shortFamily.charAt(1); // "77" -> "777"
  if (AIRCRAFT_AMENITIES_DB[extendedFamily]?.[cabinClass as keyof CabinAmenities]) {
    return {
      ...AIRCRAFT_AMENITIES_DB[extendedFamily][cabinClass as keyof CabinAmenities]!,
      isEstimated: true
    };
  }

  // Fallback to default for cabin class
  return {
    ...AIRCRAFT_AMENITIES_DB.DEFAULT[cabinClass as keyof CabinAmenities]!,
    isEstimated: true
  };
}

/**
 * Parse amenities from Amadeus Branded Fares API response
 *
 * @param amenitiesArray - Array of amenities from branded fares response
 * @returns Amenities object with isEstimated: false
 */
export function parseBrandedFaresAmenities(
  amenitiesArray: any[]
): AircraftAmenities {
  if (!amenitiesArray || amenitiesArray.length === 0) {
    return {
      wifi: false,
      power: false,
      meal: 'None',
      entertainment: false,
      isEstimated: false
    };
  }

  const amenitiesDesc = amenitiesArray.map(a => a.description?.toLowerCase() || '').join(' ');

  return {
    wifi: amenitiesDesc.includes('wifi') || amenitiesDesc.includes('wi-fi') || amenitiesDesc.includes('internet'),
    power: amenitiesDesc.includes('power') || amenitiesDesc.includes('outlet') || amenitiesDesc.includes('usb'),
    meal: getMealTypeFromDescription(amenitiesDesc),
    entertainment: amenitiesDesc.includes('entertainment') || amenitiesDesc.includes('ife') || amenitiesDesc.includes('streaming'),
    isEstimated: false
  };
}

/**
 * Extract meal type from amenities description
 */
function getMealTypeFromDescription(description: string): string {
  if (description.includes('multi-course') || description.includes('gourmet')) {
    return 'Multi-course meal';
  }
  if (description.includes('hot meal') || description.includes('dinner') || description.includes('lunch')) {
    return 'Hot meal';
  }
  if (description.includes('meal')) {
    return 'Meal';
  }
  if (description.includes('snack') || description.includes('refreshment')) {
    return 'Snack';
  }
  return 'None';
}
