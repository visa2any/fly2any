/**
 * Flight Type Detection System
 * Intelligent detection of domestic vs international flights
 *
 * Determines if a flight requires passport information based on:
 * - Airport country codes
 * - Special territories and dependencies
 * - Schengen Area rules
 * - US territories and possessions
 * - Caribbean and Pacific territories
 *
 * @module flight-type-detector
 */

import { AIRPORTS, type Airport } from '@/lib/data/airports';

export type FlightType = 'domestic' | 'international';

export interface FlightTypeResult {
  type: FlightType;
  requiresPassport: boolean;
  requiresVisa: boolean;
  originCountry: string;
  destinationCountry: string;
  isSchengen: boolean;
  isSameCountry: boolean;
  territoryInfo?: {
    isTerritory: boolean;
    parentCountry?: string;
    specialRules?: string;
  };
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

/**
 * Schengen Area countries (passport-free travel zone in Europe)
 * Domestic-like travel rules apply within Schengen
 */
const SCHENGEN_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Croatia', 'Czech Republic', 'Denmark',
  'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Iceland', 'Italy', 'Latvia', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway',
  'Poland', 'Portugal', 'Slovakia', 'Slovenia', 'Spain',
  'Sweden', 'Switzerland'
]);

/**
 * US Territories and possessions
 * Travel from US mainland to these territories is considered domestic
 */
const US_TERRITORIES = new Set([
  'Puerto Rico', 'US Virgin Islands', 'Guam', 'Northern Mariana Islands',
  'American Samoa', 'U.S. Virgin Islands', 'USVI'
]);

/**
 * Airport codes for US territories
 */
const US_TERRITORY_CODES = new Map<string, string>([
  ['SJU', 'Puerto Rico'], // San Juan
  ['STT', 'US Virgin Islands'], // St. Thomas
  ['STX', 'US Virgin Islands'], // St. Croix
  ['GUM', 'Guam'],
  ['SPN', 'Northern Mariana Islands'], // Saipan
  ['PPG', 'American Samoa'], // Pago Pago
]);

/**
 * UK Territories and Crown Dependencies
 */
const UK_TERRITORY_CODES = new Map<string, string>([
  ['GIB', 'Gibraltar'],
  ['JEY', 'Jersey'],
  ['GCI', 'Guernsey'],
  ['IOM', 'Isle of Man'],
]);

/**
 * French Overseas Territories
 */
const FRENCH_TERRITORY_CODES = new Map<string, string>([
  ['PTP', 'Guadeloupe'],
  ['FDF', 'Martinique'],
  ['CAY', 'French Guiana'],
  ['RUN', 'Réunion'],
  ['PPT', 'French Polynesia'],
  ['NOU', 'New Caledonia'],
]);

/**
 * Get airport information by IATA code
 */
function getAirportInfo(iataCode: string): Airport | null {
  const code = iataCode.trim().toUpperCase();
  return AIRPORTS.find(airport => airport.code === code) || null;
}

/**
 * Check if an airport is in a US territory
 */
function isUSTerritory(iataCode: string): { isTerritory: boolean; territory?: string } {
  const territory = US_TERRITORY_CODES.get(iataCode.toUpperCase());
  return {
    isTerritory: !!territory,
    territory
  };
}

/**
 * Check if an airport is in a UK territory
 */
function isUKTerritory(iataCode: string): { isTerritory: boolean; territory?: string } {
  const territory = UK_TERRITORY_CODES.get(iataCode.toUpperCase());
  return {
    isTerritory: !!territory,
    territory
  };
}

/**
 * Check if an airport is in a French territory
 */
function isFrenchTerritory(iataCode: string): { isTerritory: boolean; territory?: string } {
  const territory = FRENCH_TERRITORY_CODES.get(iataCode.toUpperCase());
  return {
    isTerritory: !!territory,
    territory
  };
}

/**
 * Check if a country is in the Schengen Area
 */
function isSchengenCountry(country: string): boolean {
  return SCHENGEN_COUNTRIES.has(country);
}

/**
 * Normalize country names for comparison
 */
function normalizeCountryName(country: string): string {
  const normalized = country.trim();

  // Handle common variations
  const variations: Record<string, string> = {
    'USA': 'United States',
    'US': 'United States',
    'U.S.A.': 'United States',
    'U.S.': 'United States',
    'UK': 'United Kingdom',
    'U.K.': 'United Kingdom',
    'Great Britain': 'United Kingdom',
    'England': 'United Kingdom',
    'Scotland': 'United Kingdom',
    'Wales': 'United Kingdom',
    'Northern Ireland': 'United Kingdom',
  };

  return variations[normalized] || normalized;
}

/**
 * Detect flight type with comprehensive logic
 */
export function detectFlightType(
  originCode: string,
  destinationCode: string
): FlightTypeResult {
  // Get airport information
  const origin = getAirportInfo(originCode);
  const destination = getAirportInfo(destinationCode);

  // Handle unknown airports - assume international for safety
  if (!origin || !destination) {
    return {
      type: 'international',
      requiresPassport: true,
      requiresVisa: false, // Visa requirements depend on nationality
      originCountry: origin?.country || 'Unknown',
      destinationCountry: destination?.country || 'Unknown',
      isSchengen: false,
      isSameCountry: false,
      confidence: 'low',
      reasoning: 'Airport information not found in database. Assuming international flight for safety.'
    };
  }

  // Normalize country names
  const originCountry = normalizeCountryName(origin.country);
  const destCountry = normalizeCountryName(destination.country);

  // Check for same country (simple domestic)
  const isSameCountry = originCountry === destCountry;

  // Check for US territories
  const originUSTerritory = isUSTerritory(originCode);
  const destUSTerritory = isUSTerritory(destinationCode);

  // US mainland to/from US territory is domestic
  if (originCountry === 'United States' && destUSTerritory.isTerritory) {
    return {
      type: 'domestic',
      requiresPassport: false, // No passport needed for US citizens
      requiresVisa: false,
      originCountry,
      destinationCountry: 'United States',
      isSchengen: false,
      isSameCountry: true,
      territoryInfo: {
        isTerritory: true,
        parentCountry: 'United States',
        specialRules: `Travel to ${destUSTerritory.territory} is considered domestic for US citizens.`
      },
      confidence: 'high',
      reasoning: `Flight from US mainland to ${destUSTerritory.territory} is domestic.`
    };
  }

  if (originUSTerritory.isTerritory && destCountry === 'United States') {
    return {
      type: 'domestic',
      requiresPassport: false,
      requiresVisa: false,
      originCountry: 'United States',
      destinationCountry: 'United States',
      isSchengen: false,
      isSameCountry: true,
      territoryInfo: {
        isTerritory: true,
        parentCountry: 'United States',
        specialRules: `Travel from ${originUSTerritory.territory} to US mainland is domestic for US citizens.`
      },
      confidence: 'high',
      reasoning: `Flight from ${originUSTerritory.territory} to US mainland is domestic.`
    };
  }

  // Between US territories is domestic
  if (originUSTerritory.isTerritory && destUSTerritory.isTerritory) {
    return {
      type: 'domestic',
      requiresPassport: false,
      requiresVisa: false,
      originCountry: 'United States',
      destinationCountry: 'United States',
      isSchengen: false,
      isSameCountry: true,
      territoryInfo: {
        isTerritory: true,
        parentCountry: 'United States',
        specialRules: 'Travel between US territories is domestic for US citizens.'
      },
      confidence: 'high',
      reasoning: `Flight between ${originUSTerritory.territory} and ${destUSTerritory.territory} is domestic.`
    };
  }

  // Check for UK territories
  const originUKTerritory = isUKTerritory(originCode);
  const destUKTerritory = isUKTerritory(destinationCode);

  // UK to/from UK territories may require passport but is often treated as domestic
  if ((originCountry === 'United Kingdom' && destUKTerritory.isTerritory) ||
      (originUKTerritory.isTerritory && destCountry === 'United Kingdom') ||
      (originUKTerritory.isTerritory && destUKTerritory.isTerritory)) {
    return {
      type: 'domestic',
      requiresPassport: true, // UK territories typically require passport
      requiresVisa: false,
      originCountry: 'United Kingdom',
      destinationCountry: 'United Kingdom',
      isSchengen: false,
      isSameCountry: true,
      territoryInfo: {
        isTerritory: true,
        parentCountry: 'United Kingdom',
        specialRules: 'Passport required but visa not needed for UK citizens.'
      },
      confidence: 'high',
      reasoning: 'Travel involving UK territories requires passport but is considered domestic.'
    };
  }

  // Check for French territories
  const originFrenchTerritory = isFrenchTerritory(originCode);
  const destFrenchTerritory = isFrenchTerritory(destinationCode);

  // France to/from French territories
  if ((originCountry === 'France' && destFrenchTerritory.isTerritory) ||
      (originFrenchTerritory.isTerritory && destCountry === 'France') ||
      (originFrenchTerritory.isTerritory && destFrenchTerritory.isTerritory)) {
    return {
      type: 'domestic',
      requiresPassport: true, // International passport required
      requiresVisa: false,
      originCountry: 'France',
      destinationCountry: 'France',
      isSchengen: true,
      isSameCountry: true,
      territoryInfo: {
        isTerritory: true,
        parentCountry: 'France',
        specialRules: 'Passport required for French overseas territories.'
      },
      confidence: 'high',
      reasoning: 'Travel involving French overseas territories requires passport.'
    };
  }

  // Check for Schengen Area travel
  const isOriginSchengen = isSchengenCountry(originCountry);
  const isDestSchengen = isSchengenCountry(destCountry);

  if (isOriginSchengen && isDestSchengen) {
    return {
      type: 'international',
      requiresPassport: true, // Passport or national ID required
      requiresVisa: false,
      originCountry,
      destinationCountry: destCountry,
      isSchengen: true,
      isSameCountry: false,
      confidence: 'high',
      reasoning: 'Both countries are in Schengen Area. Passport or national ID required, but no border controls.'
    };
  }

  // Simple same country check
  if (isSameCountry) {
    return {
      type: 'domestic',
      requiresPassport: false,
      requiresVisa: false,
      originCountry,
      destinationCountry: destCountry,
      isSchengen: isOriginSchengen,
      isSameCountry: true,
      confidence: 'high',
      reasoning: `Both airports are in ${originCountry}.`
    };
  }

  // Different countries = international
  return {
    type: 'international',
    requiresPassport: true,
    requiresVisa: false, // Visa requirements depend on passenger nationality
    originCountry,
    destinationCountry: destCountry,
    isSchengen: false,
    isSameCountry: false,
    confidence: 'high',
    reasoning: `Flight from ${originCountry} to ${destCountry} is international.`
  };
}

/**
 * Simplified detection - returns just the flight type
 */
export function detectFlightTypeSimple(
  originCode: string,
  destinationCode: string
): FlightType {
  const result = detectFlightType(originCode, destinationCode);
  return result.type;
}

/**
 * Check if passport is required for a flight
 */
export function requiresPassport(
  originCode: string,
  destinationCode: string
): boolean {
  const result = detectFlightType(originCode, destinationCode);
  return result.requiresPassport;
}

/**
 * Batch detection for multiple routes
 */
export function detectFlightTypeBatch(
  routes: Array<{ origin: string; destination: string }>
): FlightTypeResult[] {
  return routes.map(route => detectFlightType(route.origin, route.destination));
}

/**
 * Get human-readable explanation for flight type
 */
export function getFlightTypeExplanation(
  originCode: string,
  destinationCode: string
): string {
  const result = detectFlightType(originCode, destinationCode);
  return result.reasoning;
}

/**
 * Extract origin and destination from flight segments
 */
export function detectFlightTypeFromSegments(
  segments: Array<{ departure: { iataCode: string }; arrival: { iataCode: string } }>
): FlightTypeResult {
  if (segments.length === 0) {
    throw new Error('No flight segments provided');
  }

  // For multi-segment flights, use first departure and last arrival
  const originCode = segments[0].departure.iataCode;
  const destinationCode = segments[segments.length - 1].arrival.iataCode;

  return detectFlightType(originCode, destinationCode);
}

/**
 * Detect flight type from booking search parameters
 */
export function detectFlightTypeFromSearchParams(searchParams: {
  origin?: string;
  destination?: string;
}): FlightTypeResult | null {
  if (!searchParams.origin || !searchParams.destination) {
    return null;
  }

  return detectFlightType(searchParams.origin, searchParams.destination);
}
