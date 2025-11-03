/**
 * Filter State Management & URL Persistence
 *
 * Handles serialization/deserialization of filter state to/from URL params
 * Enables:
 * - Shareable filtered results
 * - Browser back/forward navigation
 * - Bookmark-friendly URLs
 * - State persistence across page refreshes
 */

import { FlightFilters } from '@/components/flights/FlightFilters';

/**
 * URL-friendly filter state representation
 * Uses short parameter names to keep URLs concise
 */
export interface URLFilterState {
  // Price filters
  price_min?: number;
  price_max?: number;

  // Flight characteristics
  stops?: string; // "direct,1-stop,2+-stops"
  airlines?: string; // "AA,UA,DL" (comma-separated IATA codes)
  cabin?: string; // "ECONOMY,BUSINESS,FIRST"

  // Timing filters
  departure?: string; // "morning,afternoon,evening,night"
  duration_max?: number; // hours
  layover_max?: number; // minutes

  // Fare features
  baggage?: 'true' | 'false';
  refundable?: 'true' | 'false';
  no_basic?: 'true' | 'false'; // Exclude basic economy

  // Alliances & partnerships
  alliances?: string; // "star-alliance,oneworld,skyteam"

  // Environmental
  co2_max?: number; // kg per passenger

  // Connection quality
  connection?: string; // "short,medium,long"

  // NDC filters
  ndc?: 'true' | 'false';
  exclusive?: 'true' | 'false';
}

/**
 * Convert FlightFilters to URL search parameters
 * Only includes non-default values to keep URLs clean
 */
export function filtersToURL(filters: FlightFilters, defaults: Partial<FlightFilters> = {}): URLSearchParams {
  const params = new URLSearchParams();

  // Price range (only if different from defaults)
  if (filters.priceRange[0] > (defaults.priceRange?.[0] || 0)) {
    params.set('price_min', filters.priceRange[0].toString());
  }
  if (filters.priceRange[1] < (defaults.priceRange?.[1] || 10000)) {
    params.set('price_max', filters.priceRange[1].toString());
  }

  // Stops
  if (filters.stops.length > 0) {
    params.set('stops', filters.stops.join(','));
  }

  // Airlines
  if (filters.airlines.length > 0) {
    params.set('airlines', filters.airlines.join(','));
  }

  // Cabin class
  if (filters.cabinClass.length > 0) {
    params.set('cabin', filters.cabinClass.join(','));
  }

  // Departure time
  if (filters.departureTime.length > 0) {
    params.set('departure', filters.departureTime.join(','));
  }

  // Duration (only if less than default 24h)
  if (filters.maxDuration < (defaults.maxDuration || 24)) {
    params.set('duration_max', filters.maxDuration.toString());
  }

  // Layover duration (only if less than default 360min = 6h)
  if (filters.maxLayoverDuration < (defaults.maxLayoverDuration || 360)) {
    params.set('layover_max', filters.maxLayoverDuration.toString());
  }

  // Boolean filters (only if true)
  if (filters.baggageIncluded) {
    params.set('baggage', 'true');
  }
  if (filters.refundableOnly) {
    params.set('refundable', 'true');
  }
  if (filters.excludeBasicEconomy) {
    params.set('no_basic', 'true');
  }
  if (filters.ndcOnly) {
    params.set('ndc', 'true');
  }
  if (filters.showExclusiveFares) {
    params.set('exclusive', 'true');
  }

  // Alliances
  if (filters.alliances.length > 0) {
    params.set('alliances', filters.alliances.join(','));
  }

  // CO2 emissions (only if less than default 500kg)
  if (filters.maxCO2Emissions < (defaults.maxCO2Emissions || 500)) {
    params.set('co2_max', filters.maxCO2Emissions.toString());
  }

  // Connection quality
  if (filters.connectionQuality.length > 0) {
    params.set('connection', filters.connectionQuality.join(','));
  }

  return params;
}

/**
 * Parse URL search parameters to FlightFilters
 * Returns partial filters object with only values present in URL
 */
export function filtersFromURL(searchParams: URLSearchParams): Partial<FlightFilters> {
  const filters: Partial<FlightFilters> = {};

  // Price range
  const priceMin = searchParams.get('price_min');
  const priceMax = searchParams.get('price_max');
  if (priceMin || priceMax) {
    filters.priceRange = [
      priceMin ? parseInt(priceMin, 10) : 0,
      priceMax ? parseInt(priceMax, 10) : 10000
    ];
  }

  // Stops
  const stops = searchParams.get('stops');
  if (stops) {
    filters.stops = stops.split(',') as ('direct' | '1-stop' | '2+-stops')[];
  }

  // Airlines
  const airlines = searchParams.get('airlines');
  if (airlines) {
    filters.airlines = airlines.split(',').filter(Boolean);
  }

  // Cabin class
  const cabin = searchParams.get('cabin');
  if (cabin) {
    filters.cabinClass = cabin.split(',') as ('ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST')[];
  }

  // Departure time
  const departure = searchParams.get('departure');
  if (departure) {
    filters.departureTime = departure.split(',') as ('morning' | 'afternoon' | 'evening' | 'night')[];
  }

  // Duration
  const durationMax = searchParams.get('duration_max');
  if (durationMax) {
    filters.maxDuration = parseInt(durationMax, 10);
  }

  // Layover duration
  const layoverMax = searchParams.get('layover_max');
  if (layoverMax) {
    filters.maxLayoverDuration = parseInt(layoverMax, 10);
  }

  // Boolean filters
  filters.baggageIncluded = searchParams.get('baggage') === 'true';
  filters.refundableOnly = searchParams.get('refundable') === 'true';
  filters.excludeBasicEconomy = searchParams.get('no_basic') === 'true';
  filters.ndcOnly = searchParams.get('ndc') === 'true';
  filters.showExclusiveFares = searchParams.get('exclusive') === 'true';

  // Alliances
  const alliances = searchParams.get('alliances');
  if (alliances) {
    filters.alliances = alliances.split(',') as ('star-alliance' | 'oneworld' | 'skyteam')[];
  }

  // CO2 emissions
  const co2Max = searchParams.get('co2_max');
  if (co2Max) {
    filters.maxCO2Emissions = parseInt(co2Max, 10);
  }

  // Connection quality
  const connection = searchParams.get('connection');
  if (connection) {
    filters.connectionQuality = connection.split(',') as ('short' | 'medium' | 'long')[];
  }

  return filters;
}

/**
 * Merge URL filters with default filters
 * URL params override defaults
 */
export function mergeWithDefaults(
  urlFilters: Partial<FlightFilters>,
  defaults: FlightFilters
): FlightFilters {
  return {
    ...defaults,
    ...urlFilters
  };
}

/**
 * Check if any filters are active (different from defaults)
 */
export function hasActiveFilters(
  filters: FlightFilters,
  defaults: Partial<FlightFilters>
): boolean {
  if (filters.priceRange[0] !== (defaults.priceRange?.[0] || 0)) return true;
  if (filters.priceRange[1] !== (defaults.priceRange?.[1] || 10000)) return true;
  if (filters.stops.length > 0) return true;
  if (filters.airlines.length > 0) return true;
  if (filters.cabinClass.length > 0) return true;
  if (filters.departureTime.length > 0) return true;
  if (filters.maxDuration !== (defaults.maxDuration || 24)) return true;
  if (filters.maxLayoverDuration !== (defaults.maxLayoverDuration || 360)) return true;
  if (filters.baggageIncluded) return true;
  if (filters.refundableOnly) return true;
  if (filters.excludeBasicEconomy) return true;
  if (filters.alliances.length > 0) return true;
  if (filters.maxCO2Emissions !== (defaults.maxCO2Emissions || 500)) return true;
  if (filters.connectionQuality.length > 0) return true;
  if (filters.ndcOnly) return true;
  if (filters.showExclusiveFares) return true;

  return false;
}

/**
 * Count active filters
 */
export function countActiveFilters(
  filters: FlightFilters,
  defaults: Partial<FlightFilters>
): number {
  let count = 0;

  if (filters.priceRange[0] !== (defaults.priceRange?.[0] || 0)) count++;
  if (filters.priceRange[1] !== (defaults.priceRange?.[1] || 10000)) count++;
  if (filters.stops.length > 0) count++;
  if (filters.airlines.length > 0) count++;
  if (filters.cabinClass.length > 0) count++;
  if (filters.departureTime.length > 0) count++;
  if (filters.maxDuration !== (defaults.maxDuration || 24)) count++;
  if (filters.maxLayoverDuration !== (defaults.maxLayoverDuration || 360)) count++;
  if (filters.baggageIncluded) count++;
  if (filters.refundableOnly) count++;
  if (filters.excludeBasicEconomy) count++;
  if (filters.alliances.length > 0) count++;
  if (filters.maxCO2Emissions !== (defaults.maxCO2Emissions || 500)) count++;
  if (filters.connectionQuality.length > 0) count++;
  if (filters.ndcOnly) count++;
  if (filters.showExclusiveFares) count++;

  return count;
}

/**
 * Get human-readable summary of active filters
 */
export interface FilterSummary {
  key: string;
  label: string;
  value: string;
}

export function getFilterSummary(filters: FlightFilters): FilterSummary[] {
  const summary: FilterSummary[] = [];

  // Price range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
    summary.push({
      key: 'price',
      label: 'Price',
      value: `$${filters.priceRange[0].toLocaleString()} - $${filters.priceRange[1].toLocaleString()}`
    });
  }

  // Stops
  if (filters.stops.length > 0) {
    const stopsLabels = filters.stops.map(s => {
      if (s === 'direct') return 'Direct';
      if (s === '1-stop') return '1 stop';
      return '2+ stops';
    });
    summary.push({
      key: 'stops',
      label: 'Stops',
      value: stopsLabels.join(', ')
    });
  }

  // Airlines
  if (filters.airlines.length > 0) {
    summary.push({
      key: 'airlines',
      label: 'Airlines',
      value: filters.airlines.length === 1 ? filters.airlines[0] : `${filters.airlines.length} airlines`
    });
  }

  // Cabin class
  if (filters.cabinClass.length > 0) {
    const cabinLabels = filters.cabinClass.map(c => {
      if (c === 'ECONOMY') return 'Economy';
      if (c === 'PREMIUM_ECONOMY') return 'Premium';
      if (c === 'BUSINESS') return 'Business';
      return 'First';
    });
    summary.push({
      key: 'cabin',
      label: 'Cabin',
      value: cabinLabels.join(', ')
    });
  }

  // Departure time
  if (filters.departureTime.length > 0) {
    const timeLabels = filters.departureTime.map(t => t.charAt(0).toUpperCase() + t.slice(1));
    summary.push({
      key: 'departure',
      label: 'Departure',
      value: timeLabels.join(', ')
    });
  }

  // Duration
  if (filters.maxDuration < 24) {
    summary.push({
      key: 'duration',
      label: 'Max duration',
      value: `${filters.maxDuration}h`
    });
  }

  // Layover
  if (filters.maxLayoverDuration < 360) {
    const hours = Math.floor(filters.maxLayoverDuration / 60);
    const mins = filters.maxLayoverDuration % 60;
    summary.push({
      key: 'layover',
      label: 'Max layover',
      value: `${hours}h ${mins}m`
    });
  }

  // Baggage
  if (filters.baggageIncluded) {
    summary.push({
      key: 'baggage',
      label: 'Baggage',
      value: 'Included'
    });
  }

  // Refundable
  if (filters.refundableOnly) {
    summary.push({
      key: 'refundable',
      label: 'Fare type',
      value: 'Refundable'
    });
  }

  // No basic economy
  if (filters.excludeBasicEconomy) {
    summary.push({
      key: 'noBasic',
      label: 'Fare type',
      value: 'No basic economy'
    });
  }

  // Alliances
  if (filters.alliances.length > 0) {
    const allianceLabels = filters.alliances.map(a => {
      if (a === 'star-alliance') return 'Star Alliance';
      if (a === 'oneworld') return 'oneworld';
      return 'SkyTeam';
    });
    summary.push({
      key: 'alliances',
      label: 'Alliances',
      value: allianceLabels.join(', ')
    });
  }

  // CO2
  if (filters.maxCO2Emissions < 500) {
    summary.push({
      key: 'co2',
      label: 'Max CO₂',
      value: `${filters.maxCO2Emissions}kg`
    });
  }

  // Connection quality
  if (filters.connectionQuality.length > 0) {
    const qualityLabels = filters.connectionQuality.map(q => q.charAt(0).toUpperCase() + q.slice(1));
    summary.push({
      key: 'connection',
      label: 'Connections',
      value: qualityLabels.join(', ')
    });
  }

  // NDC
  if (filters.ndcOnly) {
    summary.push({
      key: 'ndc',
      label: 'Booking',
      value: 'NDC direct'
    });
  }

  // Exclusive fares
  if (filters.showExclusiveFares) {
    summary.push({
      key: 'exclusive',
      label: 'Fares',
      value: 'Exclusive only'
    });
  }

  return summary;
}
