/**
 * 🌙 OVERNIGHT LAYOVER DETECTOR
 *
 * Strategic Feature: Turn inconvenient layovers into "free vacation stopovers"
 * Budget travelers LOVE this - saves 20-40% on flights
 *
 * Detection Logic:
 * - Layover >= 8 hours = "Extended Layover" (enough for city tour)
 * - Layover >= 12 hours = "Overnight Layover" (free stopover vacation!)
 * - Include visa-free info, airport hotels, city highlights
 */

export interface LayoverInfo {
  city: string;
  airportCode: string;
  duration: number; // minutes
  durationFormatted: string;
  type: 'short' | 'extended' | 'overnight';
  isOpportunity: boolean; // true if 8+ hours
  perks: {
    canExploreCity: boolean;
    needsVisa: boolean;
    visaFreeHours?: number; // Some countries allow 24h visa-free transit
    estimatedSavings: number; // Percentage saved vs direct flight
    cityHighlights: string[];
    airportHotelAvailable: boolean;
  };
}

// Top layover cities with budget traveler amenities
const LAYOVER_CITY_DATA: {
  [key: string]: {
    name: string;
    visaFreeTransit: boolean;
    visaFreeHours?: number;
    highlights: string[];
    airportHotel: boolean;
    avgSavingsPercent: number;
  };
} = {
  // Middle East
  DXB: {
    name: 'Dubai',
    visaFreeTransit: true,
    visaFreeHours: 96,
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Gold Souk', 'Desert Safari'],
    airportHotel: true,
    avgSavingsPercent: 35,
  },
  DOH: {
    name: 'Doha',
    visaFreeTransit: true,
    visaFreeHours: 96,
    highlights: ['Souq Waqif', 'Museum of Islamic Art', 'Corniche'],
    airportHotel: true,
    avgSavingsPercent: 30,
  },
  AUH: {
    name: 'Abu Dhabi',
    visaFreeTransit: true,
    visaFreeHours: 48,
    highlights: ['Sheikh Zayed Mosque', 'Louvre Abu Dhabi', 'Corniche'],
    airportHotel: true,
    avgSavingsPercent: 28,
  },

  // Europe
  IST: {
    name: 'Istanbul',
    visaFreeTransit: true,
    visaFreeHours: 72,
    highlights: ['Hagia Sophia', 'Blue Mosque', 'Grand Bazaar', 'Bosphorus'],
    airportHotel: true,
    avgSavingsPercent: 25,
  },
  AMS: {
    name: 'Amsterdam',
    visaFreeTransit: true,
    highlights: ['Canals', 'Anne Frank House', 'Van Gogh Museum'],
    airportHotel: true,
    avgSavingsPercent: 22,
  },
  CDG: {
    name: 'Paris',
    visaFreeTransit: true,
    highlights: ['Eiffel Tower', 'Louvre', 'Notre-Dame', 'Champs-Élysées'],
    airportHotel: true,
    avgSavingsPercent: 20,
  },
  LHR: {
    name: 'London',
    visaFreeTransit: false,
    highlights: ['Big Ben', 'Tower Bridge', 'British Museum'],
    airportHotel: true,
    avgSavingsPercent: 18,
  },
  FRA: {
    name: 'Frankfurt',
    visaFreeTransit: true,
    highlights: ['Römerberg', 'Main Tower', 'Museums'],
    airportHotel: true,
    avgSavingsPercent: 20,
  },

  // Asia
  SIN: {
    name: 'Singapore',
    visaFreeTransit: true,
    visaFreeHours: 96,
    highlights: ['Gardens by the Bay', 'Marina Bay Sands', 'Hawker Centers'],
    airportHotel: true,
    avgSavingsPercent: 30,
  },
  HKG: {
    name: 'Hong Kong',
    visaFreeTransit: true,
    visaFreeHours: 7 * 24, // 7 days
    highlights: ['Victoria Peak', 'Temple Street Market', 'Dim Sum'],
    airportHotel: true,
    avgSavingsPercent: 32,
  },
  ICN: {
    name: 'Seoul',
    visaFreeTransit: true,
    visaFreeHours: 72,
    highlights: ['Gyeongbokgung Palace', 'Myeongdong', 'K-BBQ'],
    airportHotel: true,
    avgSavingsPercent: 28,
  },
  BKK: {
    name: 'Bangkok',
    visaFreeTransit: true,
    highlights: ['Grand Palace', 'Wat Pho', 'Street Food', 'Floating Market'],
    airportHotel: true,
    avgSavingsPercent: 35,
  },
  NRT: {
    name: 'Tokyo',
    visaFreeTransit: false,
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tsukiji Market'],
    airportHotel: true,
    avgSavingsPercent: 25,
  },

  // Americas
  MEX: {
    name: 'Mexico City',
    visaFreeTransit: true,
    highlights: ['Zócalo', 'Frida Kahlo Museum', 'Teotihuacan'],
    airportHotel: true,
    avgSavingsPercent: 30,
  },
  PTY: {
    name: 'Panama City',
    visaFreeTransit: true,
    highlights: ['Panama Canal', 'Casco Viejo', 'Causeway'],
    airportHotel: true,
    avgSavingsPercent: 32,
  },

  // Default for unknown cities
  DEFAULT: {
    name: 'Unknown',
    visaFreeTransit: false,
    highlights: [],
    airportHotel: false,
    avgSavingsPercent: 20,
  },
};

/**
 * Calculate layover duration between two flights
 */
export function calculateLayoverDuration(
  arrivalTime: string,
  departureTime: string
): number {
  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);
  const diffMs = departure.getTime() - arrival.getTime();
  return Math.floor(diffMs / (1000 * 60)); // minutes
}

/**
 * Format layover duration for display
 */
export function formatLayoverDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  }

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Detect overnight layover opportunities in a flight
 */
export function detectOvernightLayovers(segments: any[]): LayoverInfo[] {
  const layovers: LayoverInfo[] = [];

  for (let i = 0; i < segments.length - 1; i++) {
    const currentSegment = segments[i];
    const nextSegment = segments[i + 1];

    const arrivalTime = currentSegment.arrival?.at || currentSegment.arriving_at;
    const departureTime = nextSegment.departure?.at || nextSegment.departing_at;
    const layoverCity = currentSegment.arrival?.iataCode || currentSegment.destination?.iata_code;

    if (!arrivalTime || !departureTime || !layoverCity) {
      continue;
    }

    const durationMinutes = calculateLayoverDuration(arrivalTime, departureTime);

    // Only track layovers >= 2 hours (anything less is normal connection)
    if (durationMinutes < 120) {
      continue;
    }

    const cityData = LAYOVER_CITY_DATA[layoverCity] || LAYOVER_CITY_DATA.DEFAULT;

    let type: 'short' | 'extended' | 'overnight';
    if (durationMinutes >= 720) {
      // 12+ hours
      type = 'overnight';
    } else if (durationMinutes >= 480) {
      // 8-12 hours
      type = 'extended';
    } else {
      type = 'short';
    }

    const isOpportunity = durationMinutes >= 480; // 8+ hours

    layovers.push({
      city: cityData.name,
      airportCode: layoverCity,
      duration: durationMinutes,
      durationFormatted: formatLayoverDuration(durationMinutes),
      type,
      isOpportunity,
      perks: {
        canExploreCity: isOpportunity,
        needsVisa: !cityData.visaFreeTransit,
        visaFreeHours: cityData.visaFreeHours,
        estimatedSavings: cityData.avgSavingsPercent,
        cityHighlights: cityData.highlights,
        airportHotelAvailable: cityData.airportHotel,
      },
    });
  }

  return layovers;
}

/**
 * Check if flight has overnight layover opportunity
 */
export function hasOvernightLayoverOpportunity(segments: any[]): boolean {
  const layovers = detectOvernightLayovers(segments);
  return layovers.some(l => l.isOpportunity);
}

/**
 * Get the best layover opportunity from a flight
 */
export function getBestLayoverOpportunity(segments: any[]): LayoverInfo | null {
  const layovers = detectOvernightLayovers(segments);
  const opportunities = layovers.filter(l => l.isOpportunity);

  if (opportunities.length === 0) {
    return null;
  }

  // Return the layover with the highest estimated savings
  return opportunities.reduce((best, current) =>
    current.perks.estimatedSavings > best.perks.estimatedSavings ? current : best
  );
}
