/**
 * Deal Score Algorithm Tests
 *
 * Comprehensive test suite covering:
 * - Individual component calculations
 * - Edge cases and boundary conditions
 * - Integration tests
 * - Batch processing
 * - Type validation
 *
 * @module lib/flights/dealScore.test
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateDealScore,
  calculateMarketAverage,
  findShortestDuration,
  batchCalculateDealScores,
  isValidDealScoreFactors,
  type DealScoreFactors,
} from './dealScore';

describe('Deal Score Algorithm', () => {
  // Helper to create base factors
  const createBaseFactors = (overrides?: Partial<DealScoreFactors>): DealScoreFactors => ({
    priceVsMarket: 0,
    duration: 480, // 8 hours
    stops: 1,
    departureTime: '2025-06-15T09:00:00Z',
    arrivalTime: '2025-06-15T17:00:00Z',
    onTimePerformance: 85,
    aircraftAge: 7,
    seatAvailability: 12,
    airlineRating: 4.0,
    layoverQuality: 3.5,
    ...overrides,
  });

  describe('Price Scoring', () => {
    it('should give maximum points (40) for 20% below market', () => {
      const factors = createBaseFactors({ priceVsMarket: -20 });
      const result = calculateDealScore(factors);
      expect(result.components.price).toBe(40);
    });

    it('should give 20 points for at market price', () => {
      const factors = createBaseFactors({ priceVsMarket: 0 });
      const result = calculateDealScore(factors);
      expect(result.components.price).toBe(20);
    });

    it('should give 0 points for 20% above market', () => {
      const factors = createBaseFactors({ priceVsMarket: 20 });
      const result = calculateDealScore(factors);
      expect(result.components.price).toBe(0);
    });

    it('should interpolate correctly for -10% below market', () => {
      const factors = createBaseFactors({ priceVsMarket: -10 });
      const result = calculateDealScore(factors);
      expect(result.components.price).toBe(30);
    });

    it('should handle extreme negative values (>20% below)', () => {
      const factors = createBaseFactors({ priceVsMarket: -50 });
      const result = calculateDealScore(factors);
      expect(result.components.price).toBe(40);
    });

    it('should handle extreme positive values (>20% above)', () => {
      const factors = createBaseFactors({ priceVsMarket: 50 });
      const result = calculateDealScore(factors);
      expect(result.components.price).toBe(0);
    });
  });

  describe('Duration Scoring', () => {
    it('should give maximum points (15) for shortest duration', () => {
      const factors = createBaseFactors({ duration: 420 });
      const result = calculateDealScore(factors, 420);
      expect(result.components.duration).toBe(15);
    });

    it('should scale down for longer durations', () => {
      const factors = createBaseFactors({ duration: 600 }); // 10 hours
      const result = calculateDealScore(factors, 420); // vs 7 hours shortest
      // 600/420 = 1.43 ratio
      // 15 - ((1.43 - 1) * 12) = 15 - 5.16 = ~10
      expect(result.components.duration).toBeGreaterThanOrEqual(9);
      expect(result.components.duration).toBeLessThanOrEqual(11);
    });

    it('should give minimum points (3) for 2x shortest duration', () => {
      const factors = createBaseFactors({ duration: 840 }); // 14 hours
      const result = calculateDealScore(factors, 420); // vs 7 hours shortest
      expect(result.components.duration).toBe(3);
    });

    it('should handle no context (use own duration as shortest)', () => {
      const factors = createBaseFactors({ duration: 480 });
      const result = calculateDealScore(factors); // no shortestDuration provided
      expect(result.components.duration).toBe(15);
    });
  });

  describe('Stops Scoring', () => {
    it('should give 15 points for non-stop', () => {
      const factors = createBaseFactors({ stops: 0 });
      const result = calculateDealScore(factors);
      expect(result.components.stops).toBe(15);
    });

    it('should give 8 points for 1 stop', () => {
      const factors = createBaseFactors({ stops: 1 });
      const result = calculateDealScore(factors);
      expect(result.components.stops).toBe(8);
    });

    it('should give 3 points for 2 stops', () => {
      const factors = createBaseFactors({ stops: 2 });
      const result = calculateDealScore(factors);
      expect(result.components.stops).toBe(3);
    });

    it('should give 1 point for 3+ stops', () => {
      const factors = createBaseFactors({ stops: 3 });
      const result = calculateDealScore(factors);
      expect(result.components.stops).toBe(1);
    });
  });

  describe('Time of Day Scoring', () => {
    it('should score high for morning departure (9am)', () => {
      const factors = createBaseFactors({
        departureTime: '2025-06-15T09:00:00Z',
        arrivalTime: '2025-06-15T17:00:00Z',
      });
      const result = calculateDealScore(factors);
      expect(result.components.timeOfDay).toBeGreaterThanOrEqual(9);
    });

    it('should score lower for red-eye departure (11pm)', () => {
      const factors = createBaseFactors({
        departureTime: '2025-06-15T23:00:00Z',
        arrivalTime: '2025-06-16T07:00:00Z',
      });
      const result = calculateDealScore(factors);
      expect(result.components.timeOfDay).toBeLessThanOrEqual(6);
    });

    it('should score low for very early morning departure (3am)', () => {
      const factors = createBaseFactors({
        departureTime: '2025-06-15T03:00:00Z',
        arrivalTime: '2025-06-15T11:00:00Z',
      });
      const result = calculateDealScore(factors);
      expect(result.components.timeOfDay).toBeLessThanOrEqual(5);
    });

    it('should consider arrival time in scoring', () => {
      const morningArrival = createBaseFactors({
        departureTime: '2025-06-15T09:00:00Z',
        arrivalTime: '2025-06-15T17:00:00Z', // 5pm arrival
      });
      const lateArrival = createBaseFactors({
        departureTime: '2025-06-15T09:00:00Z',
        arrivalTime: '2025-06-16T03:00:00Z', // 3am arrival
      });

      const morningResult = calculateDealScore(morningArrival);
      const lateResult = calculateDealScore(lateArrival);

      expect(morningResult.components.timeOfDay).toBeGreaterThan(
        lateResult.components.timeOfDay
      );
    });
  });

  describe('Reliability Scoring', () => {
    it('should give maximum points (10) for 90%+ on-time', () => {
      const factors = createBaseFactors({ onTimePerformance: 95 });
      const result = calculateDealScore(factors);
      expect(result.components.reliability).toBe(10);
    });

    it('should give 0 points for 50% or less on-time', () => {
      const factors = createBaseFactors({ onTimePerformance: 45 });
      const result = calculateDealScore(factors);
      expect(result.components.reliability).toBe(0);
    });

    it('should interpolate correctly for 75% on-time', () => {
      const factors = createBaseFactors({ onTimePerformance: 75 });
      const result = calculateDealScore(factors);
      // (75 - 50) / 4 = 6.25
      expect(result.components.reliability).toBeGreaterThanOrEqual(6);
      expect(result.components.reliability).toBeLessThanOrEqual(7);
    });

    it('should give average score (5) when data not available', () => {
      const factors = createBaseFactors({ onTimePerformance: undefined });
      const result = calculateDealScore(factors);
      expect(result.components.reliability).toBe(5);
    });
  });

  describe('Comfort Scoring', () => {
    it('should score higher for newer aircraft', () => {
      const newPlane = createBaseFactors({ aircraftAge: 3 });
      const oldPlane = createBaseFactors({ aircraftAge: 18 });

      const newResult = calculateDealScore(newPlane);
      const oldResult = calculateDealScore(oldPlane);

      expect(newResult.components.comfort).toBeGreaterThan(oldResult.components.comfort);
    });

    it('should score higher for better airline ratings', () => {
      const highRated = createBaseFactors({ airlineRating: 4.8 });
      const lowRated = createBaseFactors({ airlineRating: 2.5 });

      const highResult = calculateDealScore(highRated);
      const lowResult = calculateDealScore(lowRated);

      expect(highResult.components.comfort).toBeGreaterThan(lowResult.components.comfort);
    });

    it('should consider layover quality', () => {
      const goodLayover = createBaseFactors({ layoverQuality: 4.5 });
      const poorLayover = createBaseFactors({ layoverQuality: 2.0 });

      const goodResult = calculateDealScore(goodLayover);
      const poorResult = calculateDealScore(poorLayover);

      expect(goodResult.components.comfort).toBeGreaterThan(poorResult.components.comfort);
    });

    it('should handle missing comfort data gracefully', () => {
      const factors = createBaseFactors({
        aircraftAge: undefined,
        airlineRating: undefined,
        layoverQuality: undefined,
      });
      const result = calculateDealScore(factors);
      expect(result.components.comfort).toBeGreaterThan(0);
      expect(result.components.comfort).toBeLessThanOrEqual(5);
    });
  });

  describe('Availability Scoring', () => {
    it('should give maximum points (5) for 20+ seats', () => {
      const factors = createBaseFactors({ seatAvailability: 25 });
      const result = calculateDealScore(factors);
      expect(result.components.availability).toBe(5);
    });

    it('should give 4 points for 10-19 seats', () => {
      const factors = createBaseFactors({ seatAvailability: 15 });
      const result = calculateDealScore(factors);
      expect(result.components.availability).toBe(4);
    });

    it('should give 3 points for 5-9 seats', () => {
      const factors = createBaseFactors({ seatAvailability: 7 });
      const result = calculateDealScore(factors);
      expect(result.components.availability).toBe(3);
    });

    it('should give 2 points for 2-4 seats', () => {
      const factors = createBaseFactors({ seatAvailability: 3 });
      const result = calculateDealScore(factors);
      expect(result.components.availability).toBe(2);
    });

    it('should give 1 point for last seat', () => {
      const factors = createBaseFactors({ seatAvailability: 1 });
      const result = calculateDealScore(factors);
      expect(result.components.availability).toBe(1);
    });
  });

  describe('Overall Score and Tiers', () => {
    it('should classify 90-100 as "Excellent Deal"', () => {
      const factors = createBaseFactors({
        priceVsMarket: -20, // 40 points
        stops: 0, // 15 points
        duration: 300, // will get 15 with proper context
        onTimePerformance: 95, // 10 points
        seatAvailability: 20, // 5 points
      });
      const result = calculateDealScore(factors, 300);
      expect(result.tier).toBe('excellent');
      expect(result.label).toBe('Excellent Deal');
    });

    it('should classify 75-89 as "Great Deal"', () => {
      const factors = createBaseFactors({
        priceVsMarket: -15, // ~35 points
        stops: 0, // 15 points
        duration: 360,
        onTimePerformance: 85, // ~9 points
      });
      const result = calculateDealScore(factors, 300);
      expect(result.tier).toBe('great');
      expect(result.label).toBe('Great Deal');
    });

    it('should classify 60-74 as "Good Deal"', () => {
      const factors = createBaseFactors({
        priceVsMarket: -5, // ~25 points
        stops: 1, // 8 points
        duration: 420,
        onTimePerformance: 80,
      });
      const result = calculateDealScore(factors, 360);
      expect(result.tier).toBe('good');
      expect(result.label).toBe('Good Deal');
    });

    it('should classify <60 as "Fair Deal"', () => {
      const factors = createBaseFactors({
        priceVsMarket: 10, // ~10 points
        stops: 2, // 3 points
        duration: 720,
        onTimePerformance: 65,
      });
      const result = calculateDealScore(factors, 360);
      expect(result.tier).toBe('fair');
      expect(result.label).toBe('Fair Deal');
    });

    it('should never exceed 100 points', () => {
      const perfectFactors = createBaseFactors({
        priceVsMarket: -50,
        stops: 0,
        duration: 180,
        onTimePerformance: 100,
        aircraftAge: 1,
        airlineRating: 5,
        layoverQuality: 5,
        seatAvailability: 50,
      });
      const result = calculateDealScore(perfectFactors, 180);
      expect(result.total).toBeLessThanOrEqual(100);
    });

    it('should never go below 0 points', () => {
      const worstFactors = createBaseFactors({
        priceVsMarket: 50,
        stops: 3,
        duration: 1440,
        onTimePerformance: 30,
        aircraftAge: 25,
        airlineRating: 1,
        layoverQuality: 1,
        seatAvailability: 1,
      });
      const result = calculateDealScore(worstFactors, 300);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Explanations', () => {
    it('should provide detailed explanations for all components', () => {
      const factors = createBaseFactors();
      const result = calculateDealScore(factors);

      expect(result.explanations.price).toBeDefined();
      expect(result.explanations.duration).toBeDefined();
      expect(result.explanations.stops).toBeDefined();
      expect(result.explanations.timeOfDay).toBeDefined();
      expect(result.explanations.reliability).toBeDefined();
      expect(result.explanations.comfort).toBeDefined();
      expect(result.explanations.availability).toBeDefined();
    });

    it('should describe price correctly for below market', () => {
      const factors = createBaseFactors({ priceVsMarket: -15 });
      const result = calculateDealScore(factors);
      expect(result.explanations.price).toContain('below market');
      expect(result.explanations.price).toContain('15');
    });

    it('should describe non-stop flights correctly', () => {
      const factors = createBaseFactors({ stops: 0 });
      const result = calculateDealScore(factors);
      expect(result.explanations.stops).toBe('Non-stop flight');
    });

    it('should handle missing optional data gracefully', () => {
      const factors = createBaseFactors({
        onTimePerformance: undefined,
        aircraftAge: undefined,
        airlineRating: undefined,
      });
      const result = calculateDealScore(factors);
      expect(result.explanations.reliability).toContain('not available');
    });
  });

  describe('Helper Functions', () => {
    describe('calculateMarketAverage', () => {
      it('should calculate correct average', () => {
        const prices = [100, 200, 300, 400];
        const average = calculateMarketAverage(prices);
        expect(average).toBe(250);
      });

      it('should handle single price', () => {
        const average = calculateMarketAverage([500]);
        expect(average).toBe(500);
      });

      it('should handle empty array', () => {
        const average = calculateMarketAverage([]);
        expect(average).toBe(0);
      });
    });

    describe('findShortestDuration', () => {
      it('should find minimum duration', () => {
        const durations = [480, 360, 600, 420];
        const shortest = findShortestDuration(durations);
        expect(shortest).toBe(360);
      });

      it('should handle single duration', () => {
        const shortest = findShortestDuration([480]);
        expect(shortest).toBe(480);
      });

      it('should handle empty array', () => {
        const shortest = findShortestDuration([]);
        expect(shortest).toBe(0);
      });
    });
  });

  describe('Batch Processing', () => {
    it('should calculate scores for multiple flights with proper context', () => {
      const flights = [
        {
          price: 450,
          factors: {
            duration: 420,
            stops: 0,
            departureTime: '2025-06-15T09:00:00Z',
            arrivalTime: '2025-06-15T16:00:00Z',
            seatAvailability: 15,
          },
        },
        {
          price: 350,
          factors: {
            duration: 480,
            stops: 1,
            departureTime: '2025-06-15T14:00:00Z',
            arrivalTime: '2025-06-15T22:00:00Z',
            seatAvailability: 8,
          },
        },
        {
          price: 550,
          factors: {
            duration: 360,
            stops: 0,
            departureTime: '2025-06-15T08:00:00Z',
            arrivalTime: '2025-06-15T14:00:00Z',
            seatAvailability: 20,
          },
        },
      ];

      const scores = batchCalculateDealScores(flights);

      expect(scores).toHaveLength(3);
      expect(scores[0].total).toBeGreaterThan(0);
      expect(scores[0].total).toBeLessThanOrEqual(100);

      // Cheapest flight should have better price score
      expect(scores[1].components.price).toBeGreaterThan(scores[2].components.price);

      // Shortest flight should have better duration score
      expect(scores[2].components.duration).toBe(15);
    });

    it('should handle single flight in batch', () => {
      const flights = [
        {
          price: 400,
          factors: {
            duration: 480,
            stops: 1,
            departureTime: '2025-06-15T09:00:00Z',
            arrivalTime: '2025-06-15T17:00:00Z',
            seatAvailability: 12,
          },
        },
      ];

      const scores = batchCalculateDealScores(flights);
      expect(scores).toHaveLength(1);
      expect(scores[0].components.price).toBe(20); // At market average
      expect(scores[0].components.duration).toBe(15); // Shortest (only one)
    });
  });

  describe('Type Validation', () => {
    it('should validate correct DealScoreFactors', () => {
      const factors = createBaseFactors();
      expect(isValidDealScoreFactors(factors)).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalid = { priceVsMarket: 0, duration: 480 };
      expect(isValidDealScoreFactors(invalid)).toBe(false);
    });

    it('should reject wrong types', () => {
      const invalid = createBaseFactors({ stops: '1' as any });
      expect(isValidDealScoreFactors(invalid)).toBe(false);
    });

    it('should accept missing optional fields', () => {
      const valid = {
        priceVsMarket: 0,
        duration: 480,
        stops: 1,
        departureTime: '2025-06-15T09:00:00Z',
        arrivalTime: '2025-06-15T17:00:00Z',
        seatAvailability: 12,
      };
      expect(isValidDealScoreFactors(valid)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration gracefully', () => {
      const factors = createBaseFactors({ duration: 0 });
      const result = calculateDealScore(factors, 0);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeLessThanOrEqual(100);
    });

    it('should handle very long flights (24+ hours)', () => {
      const factors = createBaseFactors({ duration: 1500 }); // 25 hours
      const result = calculateDealScore(factors, 360);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative seat availability gracefully', () => {
      const factors = createBaseFactors({ seatAvailability: -5 });
      const result = calculateDealScore(factors);
      expect(result.components.availability).toBe(0);
    });

    it('should handle invalid on-time performance percentages', () => {
      const highFactors = createBaseFactors({ onTimePerformance: 150 });
      const result = calculateDealScore(highFactors);
      expect(result.components.reliability).toBe(10);
    });

    it('should handle dates far in the future', () => {
      const factors = createBaseFactors({
        departureTime: '2030-12-31T09:00:00Z',
        arrivalTime: '2030-12-31T17:00:00Z',
      });
      const result = calculateDealScore(factors);
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
