/**
 * Type definitions for Enhanced Search & Filters
 * Team 1 - Enhanced Search & Filters
 */

// ==================== Multi-City Search Types ====================

export interface FlightSegment {
  id: string;
  from: string;
  to: string;
  date: Date | null;
  passengers: number;
  class: 'economy' | 'premium_economy' | 'business' | 'first';
}

export interface MultiCitySearchParams {
  segments: FlightSegment[];
  totalPassengers: number;
}

// ==================== Flexible Date Search Types ====================

export interface DatePrice {
  date: Date;
  price: number;
  available: boolean;
}

export interface FlexibleDateRange {
  baseDate: Date;
  daysAround: number; // ±3 days by default
  prices: DatePrice[];
}

export type DateFilterType = 'cheapest' | 'weekend' | 'weekday' | 'custom';

// ==================== Nearby Airports Types ====================

export interface NearbyAirport {
  code: string;
  name: string;
  city: string;
  distanceKm: number;
  price: number;
  available: boolean;
}

export interface NearbyAirportsData {
  primaryAirport: string;
  nearbyAirports: NearbyAirport[];
  searchRadius: number; // in km
}

// ==================== Advanced Filters Types ====================

export type StopFilter = 'nonstop' | 'one_stop' | 'two_plus';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeRange {
  start: number; // 0-23 hours
  end: number;
}

export interface FlightFilters {
  airlines: string[]; // airline codes
  stops: StopFilter[];
  durationRange: {
    min: number; // in minutes
    max: number;
  };
  departureTime: TimeOfDay[];
  arrivalTime: TimeOfDay[];
  aircraftTypes: string[];
  baggageIncluded: boolean | null;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface FilterPreferences {
  id: string;
  name: string;
  filters: FlightFilters;
  createdAt: Date;
}

// ==================== Flight Comparison Types ====================

export interface FlightForComparison {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: Date;
  };
  arrival: {
    airport: string;
    time: Date;
  };
  duration: number; // in minutes
  stops: number;
  price: number;
  baggage: {
    checked: number;
    cabin: number;
  };
  amenities: string[];
  aircraftType: string;
  fareClass: string;
}

export interface ComparisonState {
  flights: FlightForComparison[];
  maxFlights: number;
}

// ==================== Search History Types ====================

export interface SearchHistoryItem {
  id: string;
  type: 'one-way' | 'round-trip' | 'multi-city';
  from: string;
  to: string;
  date: Date;
  returnDate?: Date;
  segments?: FlightSegment[];
  passengers: number;
  class: string;
  timestamp: Date;
}

export interface SearchHistoryState {
  items: SearchHistoryItem[];
  maxItems: number;
}

// ==================== Search Results Types ====================

export interface SearchResult {
  id: string;
  outbound: FlightForComparison;
  inbound?: FlightForComparison;
  totalPrice: number;
  currency: string;
}

export interface SearchResultsState {
  results: SearchResult[];
  filters: FlightFilters;
  sortBy: 'price' | 'duration' | 'departure' | 'arrival';
  sortOrder: 'asc' | 'desc';
  loading: boolean;
  error: string | null;
}

// ==================== Time of Day Definitions ====================

export const TIME_OF_DAY_RANGES: Record<TimeOfDay, TimeRange> = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 18 },
  evening: { start: 18, end: 22 },
  night: { start: 22, end: 6 },
};

// ==================== Default Values ====================

export const DEFAULT_FILTERS: FlightFilters = {
  airlines: [],
  stops: [],
  durationRange: {
    min: 0,
    max: 1440, // 24 hours
  },
  departureTime: [],
  arrivalTime: [],
  aircraftTypes: [],
  baggageIncluded: null,
  priceRange: {
    min: 0,
    max: 10000,
  },
};

export const DEFAULT_SEGMENT: Omit<FlightSegment, 'id'> = {
  from: '',
  to: '',
  date: null,
  passengers: 1,
  class: 'economy',
};

// ==================== Common Airlines ====================

export interface Airline {
  code: string;
  name: string;
  logo?: string;
}

export const COMMON_AIRLINES: Airline[] = [
  { code: 'AA', name: 'American Airlines' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'AF', name: 'Air France' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'CX', name: 'Cathay Pacific' },
];

// ==================== Common Aircraft Types ====================

export const COMMON_AIRCRAFT: string[] = [
  'Boeing 737',
  'Boeing 747',
  'Boeing 777',
  'Boeing 787 Dreamliner',
  'Airbus A320',
  'Airbus A330',
  'Airbus A350',
  'Airbus A380',
];
