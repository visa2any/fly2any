/**
 * Search Helper Utilities
 * Team 1 - Enhanced Search & Filters
 */

import {
  FlightSegment,
  FlightFilters,
  FlightForComparison,
  TimeOfDay,
  TIME_OF_DAY_RANGES,
  DatePrice,
  SearchHistoryItem,
  NearbyAirport,
} from '@/lib/types/search';

// ==================== Multi-City Validation ====================

/**
 * Validates that flight segments are in chronological order
 */
export function validateSegmentDates(segments: FlightSegment[]): {
  valid: boolean;
  error?: string;
} {
  for (let i = 1; i < segments.length; i++) {
    const prevDate = segments[i - 1].date;
    const currentDate = segments[i].date;

    if (!prevDate || !currentDate) {
      return {
        valid: false,
        error: `Segment ${i + 1}: Date is required`,
      };
    }

    if (currentDate <= prevDate) {
      return {
        valid: false,
        error: `Segment ${i + 1}: Date must be after segment ${i}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates a single flight segment
 */
export function validateSegment(segment: FlightSegment): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!segment.from) {
    errors.push('Departure airport is required');
  }

  if (!segment.to) {
    errors.push('Arrival airport is required');
  }

  if (segment.from === segment.to) {
    errors.push('Departure and arrival airports must be different');
  }

  if (!segment.date) {
    errors.push('Date is required');
  } else if (segment.date < new Date()) {
    errors.push('Date must be in the future');
  }

  if (segment.passengers < 1) {
    errors.push('At least one passenger is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates total price across all segments
 * NOTE: In production, this would call the API with all segments
 */
export function calculateMultiCityPrice(
  segments: FlightSegment[],
  basePricePerSegment: number = 200
): number {
  // Mock calculation - in production, call API
  let total = 0;

  segments.forEach((segment, index) => {
    // Base price
    let segmentPrice = basePricePerSegment;

    // Add passenger multiplier
    segmentPrice *= segment.passengers;

    // Add class multiplier
    const classMultiplier = {
      economy: 1,
      premium_economy: 1.5,
      business: 3,
      first: 5,
    };
    segmentPrice *= classMultiplier[segment.class];

    // Add complexity multiplier (more segments = slightly higher price)
    segmentPrice *= (1 + (index * 0.05));

    total += segmentPrice;
  });

  return Math.round(total * 100) / 100;
}

// ==================== Flexible Date Helpers ====================

/**
 * Generates date range with prices (mock data for development)
 * TODO: Replace with actual API call
 */
export function generateFlexibleDates(
  baseDate: Date,
  daysAround: number = 3
): DatePrice[] {
  const dates: DatePrice[] = [];
  const basePrice = 300 + Math.random() * 200;

  for (let i = -daysAround; i <= daysAround; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // Generate mock price variation
    const priceVariation = (Math.random() - 0.5) * 100;
    const price = Math.round(basePrice + priceVariation);

    dates.push({
      date,
      price,
      available: Math.random() > 0.1, // 90% availability
    });
  }

  return dates;
}

/**
 * Finds the cheapest date in a date range
 */
export function findCheapestDate(dates: DatePrice[]): DatePrice | null {
  const availableDates = dates.filter((d) => d.available);
  if (availableDates.length === 0) return null;

  return availableDates.reduce((min, current) =>
    current.price < min.price ? current : min
  );
}

/**
 * Filters dates by day of week
 */
export function filterByDayType(
  dates: DatePrice[],
  type: 'weekend' | 'weekday'
): DatePrice[] {
  return dates.filter((d) => {
    const dayOfWeek = d.date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return type === 'weekend' ? isWeekend : !isWeekend;
  });
}

// ==================== Nearby Airports Helpers ====================

/**
 * Mock nearby airports data
 * TODO: Replace with actual API call using geolocation
 */
export function getNearbyAirports(airportCode: string): NearbyAirport[] {
  // Mock data - in production, call API with airport code
  const mockNearbyAirports: Record<string, NearbyAirport[]> = {
    LAX: [
      {
        code: 'BUR',
        name: 'Hollywood Burbank Airport',
        city: 'Burbank',
        distanceKm: 45,
        price: 280,
        available: true,
      },
      {
        code: 'LGB',
        name: 'Long Beach Airport',
        city: 'Long Beach',
        distanceKm: 35,
        price: 290,
        available: true,
      },
      {
        code: 'ONT',
        name: 'Ontario International Airport',
        city: 'Ontario',
        distanceKm: 68,
        price: 270,
        available: true,
      },
    ],
    JFK: [
      {
        code: 'LGA',
        name: 'LaGuardia Airport',
        city: 'New York',
        distanceKm: 15,
        price: 310,
        available: true,
      },
      {
        code: 'EWR',
        name: 'Newark Liberty International',
        city: 'Newark',
        distanceKm: 25,
        price: 295,
        available: true,
      },
    ],
    LHR: [
      {
        code: 'LGW',
        name: 'Gatwick Airport',
        city: 'London',
        distanceKm: 45,
        price: 320,
        available: true,
      },
      {
        code: 'STN',
        name: 'Stansted Airport',
        city: 'London',
        distanceKm: 55,
        price: 280,
        available: true,
      },
    ],
  };

  return mockNearbyAirports[airportCode] || [];
}

/**
 * Calculates potential savings from nearby airports
 */
export function calculateNearbyAirportSavings(
  originalPrice: number,
  nearbyAirports: NearbyAirport[]
): {
  bestDeal: NearbyAirport | null;
  savings: number;
} {
  const availableAirports = nearbyAirports.filter((a) => a.available);
  if (availableAirports.length === 0) {
    return { bestDeal: null, savings: 0 };
  }

  const cheapest = availableAirports.reduce((min, current) =>
    current.price < min.price ? current : min
  );

  const savings = originalPrice - cheapest.price;

  return {
    bestDeal: savings > 0 ? cheapest : null,
    savings: Math.max(0, savings),
  };
}

// ==================== Flight Filtering ====================

/**
 * Filters flights based on advanced filter criteria
 */
export function applyFilters(
  flights: FlightForComparison[],
  filters: FlightFilters
): FlightForComparison[] {
  return flights.filter((flight) => {
    // Airline filter
    if (filters.airlines.length > 0) {
      if (!filters.airlines.includes(flight.airline)) {
        return false;
      }
    }

    // Stops filter
    if (filters.stops.length > 0) {
      const stopFilter = filters.stops;
      if (stopFilter.includes('nonstop') && flight.stops !== 0) {
        return false;
      }
      if (stopFilter.includes('one_stop') && flight.stops !== 1) {
        return false;
      }
      if (stopFilter.includes('two_plus') && flight.stops < 2) {
        return false;
      }
    }

    // Duration filter
    if (
      flight.duration < filters.durationRange.min ||
      flight.duration > filters.durationRange.max
    ) {
      return false;
    }

    // Departure time filter
    if (filters.departureTime.length > 0) {
      const departureHour = flight.departure.time.getHours();
      if (!isTimeInRanges(departureHour, filters.departureTime)) {
        return false;
      }
    }

    // Arrival time filter
    if (filters.arrivalTime.length > 0) {
      const arrivalHour = flight.arrival.time.getHours();
      if (!isTimeInRanges(arrivalHour, filters.arrivalTime)) {
        return false;
      }
    }

    // Aircraft type filter
    if (filters.aircraftTypes.length > 0) {
      if (!filters.aircraftTypes.includes(flight.aircraftType)) {
        return false;
      }
    }

    // Baggage filter
    if (filters.baggageIncluded !== null) {
      const hasBaggage = flight.baggage.checked > 0;
      if (filters.baggageIncluded !== hasBaggage) {
        return false;
      }
    }

    // Price filter
    if (
      flight.price < filters.priceRange.min ||
      flight.price > filters.priceRange.max
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Checks if an hour falls within any of the specified time ranges
 */
function isTimeInRanges(hour: number, timeRanges: TimeOfDay[]): boolean {
  return timeRanges.some((range) => {
    const { start, end } = TIME_OF_DAY_RANGES[range];

    // Handle overnight ranges (e.g., night: 22-6)
    if (end < start) {
      return hour >= start || hour < end;
    }

    return hour >= start && hour < end;
  });
}

/**
 * Counts active filters
 */
export function countActiveFilters(filters: FlightFilters): number {
  let count = 0;

  if (filters.airlines.length > 0) count++;
  if (filters.stops.length > 0) count++;
  if (filters.departureTime.length > 0) count++;
  if (filters.arrivalTime.length > 0) count++;
  if (filters.aircraftTypes.length > 0) count++;
  if (filters.baggageIncluded !== null) count++;

  // Check if duration is not default
  if (filters.durationRange.min > 0 || filters.durationRange.max < 1440) {
    count++;
  }

  // Check if price is not default
  if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
    count++;
  }

  return count;
}

// ==================== Search History Helpers ====================

const SEARCH_HISTORY_KEY = 'flight_search_history';

/**
 * Saves a search to history
 */
export function saveSearchToHistory(search: SearchHistoryItem): void {
  try {
    const history = getSearchHistory();

    // Add new search at the beginning
    history.unshift(search);

    // Keep only last 10 searches
    const trimmedHistory = history.slice(0, 10);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * Gets search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);

    // Parse dates
    return history.map((item: any) => ({
      ...item,
      date: new Date(item.date),
      returnDate: item.returnDate ? new Date(item.returnDate) : undefined,
      timestamp: new Date(item.timestamp),
      segments: item.segments?.map((seg: any) => ({
        ...seg,
        date: seg.date ? new Date(seg.date) : null,
      })),
    }));
  } catch (error) {
    console.error('Failed to get search history:', error);
    return [];
  }
}

/**
 * Clears search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * Removes a specific search from history
 */
export function removeSearchFromHistory(id: string): void {
  try {
    const history = getSearchHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove search from history:', error);
  }
}

// ==================== Formatting Helpers ====================

/**
 * Formats duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Formats time of day for display
 */
export function formatTimeOfDay(time: TimeOfDay): string {
  const labels: Record<TimeOfDay, string> = {
    morning: 'Morning (6am-12pm)',
    afternoon: 'Afternoon (12pm-6pm)',
    evening: 'Evening (6pm-10pm)',
    night: 'Night (10pm-6am)',
  };
  return labels[time];
}

/**
 * Formats price with currency
 */
export function formatPrice(
  price: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formats date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Formats time for display
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// ==================== Mock Data Generators ====================

/**
 * Generates mock flight data for testing
 * TODO: Replace with actual API calls
 */
export function generateMockFlights(count: number = 10): FlightForComparison[] {
  const airlines = ['AA', 'DL', 'UA', 'BA', 'LH'];
  const airports = ['LAX', 'JFK', 'LHR', 'CDG', 'DXB'];
  const aircraft = ['Boeing 737', 'Boeing 777', 'Airbus A320', 'Airbus A350'];

  return Array.from({ length: count }, (_, i) => {
    const departureTime = new Date();
    departureTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const duration = 120 + Math.floor(Math.random() * 480); // 2-10 hours
    const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

    return {
      id: `flight-${i}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      flightNumber: `${airlines[Math.floor(Math.random() * airlines.length)]}${100 + i}`,
      departure: {
        airport: airports[Math.floor(Math.random() * airports.length)],
        time: departureTime,
      },
      arrival: {
        airport: airports[Math.floor(Math.random() * airports.length)],
        time: arrivalTime,
      },
      duration,
      stops: Math.floor(Math.random() * 3),
      price: 200 + Math.floor(Math.random() * 800),
      baggage: {
        checked: Math.floor(Math.random() * 3),
        cabin: 1,
      },
      amenities: ['WiFi', 'Entertainment', 'Power outlets'].slice(
        0,
        Math.floor(Math.random() * 4)
      ),
      aircraftType: aircraft[Math.floor(Math.random() * aircraft.length)],
      fareClass: 'Economy',
    };
  });
}
