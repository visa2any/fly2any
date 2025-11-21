/**
 * CARBON FOOTPRINT CALCULATOR
 *
 * Calculates CO2 emissions for flights based on distance, aircraft type,
 * cabin class, and load factors. Provides sustainability scores and
 * eco-friendly recommendations.
 *
 * Formula based on:
 * - ICAO Carbon Emissions Calculator methodology
 * - UK DEFRA emission factors
 * - Industry average load factors
 *
 * @module carbon-calculator
 */

import { calculateDistance } from '../data/airport-helpers';
import type { Airport } from '../data/airports-complete';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CarbonFootprint {
  totalKg: number;
  perPassengerKg: number;
  comparisonToAverage: number; // Percentage difference from average
  rating: 'excellent' | 'good' | 'average' | 'poor';
  badge: string; // Emoji badge
  offsetCostUSD: number;
  details: {
    distanceKm: number;
    distanceMiles: number;
    baseEmissions: number;
    cabinMultiplier: number;
    aircraftEfficiency: number;
  };
}

export interface SustainabilityScore {
  score: number; // 0-100
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  improvements: string[];
  alternativeSuggestions?: AlternativeSuggestion[];
}

export interface AlternativeSuggestion {
  type: 'direct-flight' | 'shorter-route' | 'rail-alternative' | 'economy-class';
  description: string;
  savingsKg: number;
  savingsPercent: number;
}

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type AircraftType = 'narrowbody' | 'widebody' | 'regional' | 'turboprop';

// ============================================================================
// EMISSION FACTORS (kg CO2 per km per passenger)
// ============================================================================

/**
 * Base emission factors by distance bracket
 * Source: UK DEFRA, ICAO methodology
 */
const EMISSION_FACTORS = {
  // Short-haul (< 1500 km)
  SHORT_HAUL: {
    economy: 0.15458,
    premium_economy: 0.23187,
    business: 0.30916,
    first: 0.46374,
  },
  // Medium-haul (1500-3500 km)
  MEDIUM_HAUL: {
    economy: 0.11087,
    premium_economy: 0.16631,
    business: 0.22174,
    first: 0.33261,
  },
  // Long-haul (> 3500 km)
  LONG_HAUL: {
    economy: 0.10298,
    premium_economy: 0.20596,
    business: 0.41192,
    first: 0.61788,
  },
};

/**
 * Aircraft efficiency multipliers
 * Newer aircraft are more fuel-efficient
 */
const AIRCRAFT_EFFICIENCY = {
  narrowbody: 1.0, // A320neo, 737 MAX - baseline
  widebody: 0.95, // A350, 787 - more efficient
  regional: 1.15, // Smaller jets - less efficient
  turboprop: 0.85, // ATR, Dash 8 - very efficient for short distances
};

/**
 * Load factor (average seat occupancy)
 * Higher = better per-passenger efficiency
 */
const AVERAGE_LOAD_FACTOR = 0.82; // 82% typical

// ============================================================================
// CORE CALCULATIONS
// ============================================================================

/**
 * Calculate CO2 emissions for a flight
 */
export function calculateFlightEmissions(
  origin: Airport | string,
  destination: Airport | string,
  cabinClass: CabinClass = 'economy',
  aircraftType: AircraftType = 'narrowbody',
  passengers: number = 1
): CarbonFootprint | null {
  // Get coordinates
  let originCoords, destCoords;

  if (typeof origin === 'string' || typeof destination === 'string') {
    // Need to import airports to look up
    return null; // Simplified for now
  }

  originCoords = origin.coordinates;
  destCoords = destination.coordinates;

  // Calculate distance
  const distance = calculateDistance(
    originCoords.lat,
    originCoords.lon,
    destCoords.lat,
    destCoords.lon
  );

  const distanceKm = distance.distanceKm;

  // Determine distance bracket
  let factors;
  if (distanceKm < 1500) {
    factors = EMISSION_FACTORS.SHORT_HAUL;
  } else if (distanceKm < 3500) {
    factors = EMISSION_FACTORS.MEDIUM_HAUL;
  } else {
    factors = EMISSION_FACTORS.LONG_HAUL;
  }

  // Get emission factor for cabin class
  const baseFactor = factors[cabinClass];

  // Apply aircraft efficiency multiplier
  const efficiencyMultiplier = AIRCRAFT_EFFICIENCY[aircraftType];

  // Calculate emissions
  const emissionsPerPassenger = distanceKm * baseFactor * efficiencyMultiplier;
  const totalEmissions = emissionsPerPassenger * passengers;

  // Calculate average for comparison
  const averageEmissions = distanceKm * factors.economy;
  const comparisonToAverage = ((emissionsPerPassenger - averageEmissions) / averageEmissions) * 100;

  // Determine rating
  let rating: 'excellent' | 'good' | 'average' | 'poor';
  let badge: string;

  if (comparisonToAverage <= -20) {
    rating = 'excellent';
    badge = '🌟';
  } else if (comparisonToAverage <= 0) {
    rating = 'good';
    badge = '🌱';
  } else if (comparisonToAverage <= 25) {
    rating = 'average';
    badge = '🌿';
  } else {
    rating = 'poor';
    badge = '⚠️';
  }

  // Calculate carbon offset cost ($12 per ton of CO2)
  const offsetCostUSD = (emissionsPerPassenger / 1000) * 12;

  return {
    totalKg: Math.round(totalEmissions * 10) / 10,
    perPassengerKg: Math.round(emissionsPerPassenger * 10) / 10,
    comparisonToAverage: Math.round(comparisonToAverage),
    rating,
    badge,
    offsetCostUSD: Math.round(offsetCostUSD * 100) / 100,
    details: {
      distanceKm: distance.distanceKm,
      distanceMiles: distance.distanceMiles,
      baseEmissions: Math.round(baseFactor * distanceKm * 10) / 10,
      cabinMultiplier: baseFactor / factors.economy,
      aircraftEfficiency: efficiencyMultiplier,
    },
  };
}

/**
 * Calculate sustainability score (0-100)
 */
export function calculateSustainabilityScore(
  emissions: CarbonFootprint,
  isDirectFlight: boolean = true,
  distanceKm: number
): SustainabilityScore {
  let score = 100;
  const improvements: string[] = [];
  const alternatives: AlternativeSuggestion[] = [];

  // Penalize based on comparison to average
  const comparison = emissions.comparisonToAverage;
  if (comparison > 50) {
    score -= 40;
    improvements.push('Consider economy class for lower emissions');

    // Calculate savings from downgrading
    if (emissions.details.cabinMultiplier > 1.5) {
      const economySavings = emissions.perPassengerKg * (1 - (1 / emissions.details.cabinMultiplier));
      alternatives.push({
        type: 'economy-class',
        description: 'Switch to Economy class',
        savingsKg: Math.round(economySavings),
        savingsPercent: Math.round(((economySavings / emissions.perPassengerKg) * 100)),
      });
    }
  } else if (comparison > 25) {
    score -= 25;
    improvements.push('Above average emissions for this route');
  } else if (comparison > 0) {
    score -= 10;
  } else if (comparison < -20) {
    score += 10; // Bonus for excellent choice
  }

  // Penalize connecting flights
  if (!isDirectFlight) {
    score -= 20;
    improvements.push('Direct flights are more efficient');
    alternatives.push({
      type: 'direct-flight',
      description: 'Choose a direct flight if available',
      savingsKg: Math.round(emissions.perPassengerKg * 0.15), // ~15% savings
      savingsPercent: 15,
    });
  }

  // Consider distance efficiency
  if (distanceKm < 500) {
    score -= 15;
    improvements.push('Consider train/bus for short distances');
    alternatives.push({
      type: 'rail-alternative',
      description: 'Consider high-speed rail',
      savingsKg: Math.round(emissions.perPassengerKg * 0.7), // 70% savings
      savingsPercent: 70,
    });
  }

  // Aircraft efficiency bonus
  if (emissions.details.aircraftEfficiency < 1.0) {
    score += 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Assign letter grade
  let rating: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) rating = 'A';
  else if (score >= 80) rating = 'B';
  else if (score >= 70) rating = 'C';
  else if (score >= 60) rating = 'D';
  else rating = 'F';

  return {
    score: Math.round(score),
    rating,
    improvements,
    alternativeSuggestions: alternatives.length > 0 ? alternatives : undefined,
  };
}

/**
 * Compare emissions across multiple cabin classes
 */
export function compareCabinClasses(
  origin: Airport,
  destination: Airport,
  aircraftType: AircraftType = 'narrowbody'
): Record<CabinClass, CarbonFootprint | null> {
  const classes: CabinClass[] = ['economy', 'premium_economy', 'business', 'first'];
  const comparison: Record<string, CarbonFootprint | null> = {};

  for (const cabinClass of classes) {
    comparison[cabinClass] = calculateFlightEmissions(
      origin,
      destination,
      cabinClass,
      aircraftType
    );
  }

  return comparison as Record<CabinClass, CarbonFootprint | null>;
}

/**
 * Get emission statistics for display
 */
export function formatEmissionsForDisplay(emissions: CarbonFootprint): string {
  const { perPassengerKg, comparisonToAverage, badge } = emissions;

  let comparison = '';
  if (comparisonToAverage < 0) {
    comparison = `${Math.abs(comparisonToAverage)}% below average`;
  } else if (comparisonToAverage > 0) {
    comparison = `${comparisonToAverage}% above average`;
  } else {
    comparison = 'Average for this route';
  }

  return `${badge} ${perPassengerKg} kg CO2 (${comparison})`;
}

/**
 * Calculate equivalent comparisons (trees, cars, etc.)
 */
export function getEmissionEquivalents(emissionsKg: number) {
  return {
    trees: Math.round((emissionsKg / 21.77) * 10) / 10, // Trees needed to absorb in 1 year
    carMiles: Math.round((emissionsKg / 0.404) * 10) / 10, // Equivalent car miles driven
    smartphones: Math.round((emissionsKg / 0.0086) * 10) / 10, // Smartphones charged
    meatMeals: Math.round((emissionsKg / 3.3) * 10) / 10, // Beef meals produced
  };
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const carbonCalculator = {
  calculateFlightEmissions,
  calculateSustainabilityScore,
  compareCabinClasses,
  formatEmissionsForDisplay,
  getEmissionEquivalents,
};

export default carbonCalculator;
