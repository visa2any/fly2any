/**
 * Cache Key Generation Utilities
 * Generates consistent cache keys for different API endpoints
 */

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  nonStop?: boolean;
  currencyCode?: string;
  max?: number;
  sortBy?: string;
}

/**
 * Generate cache key for flight search
 * Format: flight:search:{origin}:{destination}:{departureDate}:{returnDate}:{adults}:{children}:{infants}:{travelClass}:{nonStop}:{currencyCode}
 */
export function generateFlightSearchKey(params: FlightSearchParams): string {
  const parts = [
    'flight:search',
    params.origin.toUpperCase(),
    params.destination.toUpperCase(),
    params.departureDate,
    params.returnDate || 'oneway',
    params.adults.toString(),
    (params.children || 0).toString(),
    (params.infants || 0).toString(),
    params.travelClass?.toUpperCase() || 'ECONOMY',
    params.nonStop ? 'nonstop' : 'any',
    params.currencyCode || 'USD',
  ];

  // Note: max and sortBy don't affect API results, only presentation
  // So they're not included in the cache key

  return parts.join(':');
}

/**
 * Generate cache key for hotel search
 */
export function generateHotelSearchKey(params: {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  rooms?: number;
}): string {
  const parts = [
    'hotel:search',
    params.cityCode.toUpperCase(),
    params.checkInDate,
    params.checkOutDate,
    params.adults.toString(),
    (params.rooms || 1).toString(),
  ];
  return parts.join(':');
}

/**
 * Generate pattern for clearing all flight searches
 */
export function getFlightSearchPattern(): string {
  return 'flight:search:*';
}

/**
 * Generate pattern for clearing specific route
 */
export function getRoutePattern(origin: string, destination: string): string {
  return `flight:search:${origin.toUpperCase()}:${destination.toUpperCase()}:*`;
}
