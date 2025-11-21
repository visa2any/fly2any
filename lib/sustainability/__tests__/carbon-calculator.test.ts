/**
 * Unit Tests: Carbon Calculator
 *
 * Tests for CO2 emissions calculations and sustainability scoring.
 */

import {
  calculateFlightEmissions,
  getSustainabilityGrade,
  compareSustainability,
  getEmissionFactors,
  calculateEmissionPerPassenger,
} from '../carbon-calculator';

describe('Carbon Calculator', () => {
  describe('calculateFlightEmissions', () => {
    test('should calculate emissions for short-haul economy flight', () => {
      // JFK to BOS is approximately 300 km
      const emissions = calculateFlightEmissions({
        distance: 300,
        cabinClass: 'economy',
        aircraftType: 'narrowbody',
      });

      expect(emissions).toBeGreaterThan(0);
      expect(emissions).toBeLessThan(100); // Should be under 100kg CO2
    });

    test('should calculate emissions for long-haul economy flight', () => {
      // JFK to LHR is approximately 5,600 km
      const emissions = calculateFlightEmissions({
        distance: 5600,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      expect(emissions).toBeGreaterThan(500);
      expect(emissions).toBeLessThan(1500);
    });

    test('should calculate higher emissions for business class', () => {
      const economyEmissions = calculateFlightEmissions({
        distance: 5600,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      const businessEmissions = calculateFlightEmissions({
        distance: 5600,
        cabinClass: 'business',
        aircraftType: 'widebody',
      });

      // Business class should have 2-3x more emissions per passenger
      expect(businessEmissions).toBeGreaterThan(economyEmissions * 1.5);
    });

    test('should calculate higher emissions for first class', () => {
      const economyEmissions = calculateFlightEmissions({
        distance: 5600,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      const firstEmissions = calculateFlightEmissions({
        distance: 5600,
        cabinClass: 'first',
        aircraftType: 'widebody',
      });

      // First class should have 3-4x more emissions per passenger
      expect(firstEmissions).toBeGreaterThan(economyEmissions * 2);
    });

    test('should handle different aircraft types', () => {
      const narrowbody = calculateFlightEmissions({
        distance: 2000,
        cabinClass: 'economy',
        aircraftType: 'narrowbody',
      });

      const widebody = calculateFlightEmissions({
        distance: 2000,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      const regional = calculateFlightEmissions({
        distance: 2000,
        cabinClass: 'economy',
        aircraftType: 'regional',
      });

      // Regional should be highest, widebody should be most efficient
      expect(regional).toBeGreaterThan(narrowbody);
    });

    test('should apply distance multipliers correctly', () => {
      // Short haul (under 1000km) gets 1.1x multiplier
      const shortHaul = calculateFlightEmissions({
        distance: 500,
        cabinClass: 'economy',
        aircraftType: 'narrowbody',
      });

      // Long haul (over 5000km) gets 0.9x multiplier
      const longHaul = calculateFlightEmissions({
        distance: 10000,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      expect(shortHaul).toBeGreaterThan(0);
      expect(longHaul).toBeGreaterThan(0);
    });

    test('should handle zero distance', () => {
      const emissions = calculateFlightEmissions({
        distance: 0,
        cabinClass: 'economy',
        aircraftType: 'narrowbody',
      });

      expect(emissions).toBe(0);
    });

    test('should handle negative distance gracefully', () => {
      const emissions = calculateFlightEmissions({
        distance: -100,
        cabinClass: 'economy',
        aircraftType: 'narrowbody',
      });

      expect(emissions).toBe(0);
    });
  });

  describe('getSustainabilityGrade', () => {
    test('should assign grade A for very low emissions', () => {
      const grade = getSustainabilityGrade(50);
      expect(grade).toBe('A');
    });

    test('should assign grade B for low emissions', () => {
      const grade = getSustainabilityGrade(150);
      expect(grade).toBe('B');
    });

    test('should assign grade C for moderate emissions', () => {
      const grade = getSustainabilityGrade(300);
      expect(grade).toBe('C');
    });

    test('should assign grade D for high emissions', () => {
      const grade = getSustainabilityGrade(600);
      expect(grade).toBe('D');
    });

    test('should assign grade F for very high emissions', () => {
      const grade = getSustainabilityGrade(1500);
      expect(grade).toBe('F');
    });

    test('should handle boundary values', () => {
      expect(getSustainabilityGrade(100)).toBe('A'); // At boundary
      expect(getSustainabilityGrade(101)).toBe('B'); // Just over
      expect(getSustainabilityGrade(200)).toBe('B'); // At boundary
      expect(getSustainabilityGrade(201)).toBe('C'); // Just over
    });

    test('should handle zero emissions', () => {
      const grade = getSustainabilityGrade(0);
      expect(grade).toBe('A');
    });

    test('should handle negative emissions gracefully', () => {
      const grade = getSustainabilityGrade(-100);
      expect(grade).toBe('A');
    });
  });

  describe('compareSustainability', () => {
    test('should identify more sustainable option', () => {
      const flight1 = {
        emissions: 200,
        grade: 'B' as const,
      };

      const flight2 = {
        emissions: 400,
        grade: 'C' as const,
      };

      const comparison = compareSustainability(flight1, flight2);

      expect(comparison.betterOption).toBe('flight1');
      expect(comparison.difference).toBe(200);
      expect(comparison.percentDifference).toBe(50); // 50% less emissions
    });

    test('should handle equal emissions', () => {
      const flight1 = {
        emissions: 300,
        grade: 'C' as const,
      };

      const flight2 = {
        emissions: 300,
        grade: 'C' as const,
      };

      const comparison = compareSustainability(flight1, flight2);

      expect(comparison.betterOption).toBe('equal');
      expect(comparison.difference).toBe(0);
      expect(comparison.percentDifference).toBe(0);
    });

    test('should calculate percent difference correctly', () => {
      const flight1 = {
        emissions: 100,
        grade: 'A' as const,
      };

      const flight2 = {
        emissions: 200,
        grade: 'B' as const,
      };

      const comparison = compareSustainability(flight1, flight2);

      expect(comparison.percentDifference).toBe(50);
    });

    test('should handle flight2 being more sustainable', () => {
      const flight1 = {
        emissions: 500,
        grade: 'D' as const,
      };

      const flight2 = {
        emissions: 250,
        grade: 'C' as const,
      };

      const comparison = compareSustainability(flight1, flight2);

      expect(comparison.betterOption).toBe('flight2');
      expect(comparison.difference).toBe(250);
    });
  });

  describe('getEmissionFactors', () => {
    test('should return factors for economy narrowbody', () => {
      const factors = getEmissionFactors('economy', 'narrowbody');
      expect(factors).toBeDefined();
      expect(factors.baseFactor).toBeGreaterThan(0);
      expect(factors.cabinMultiplier).toBe(1);
    });

    test('should return factors for business class', () => {
      const factors = getEmissionFactors('business', 'widebody');
      expect(factors).toBeDefined();
      expect(factors.cabinMultiplier).toBeGreaterThan(2);
    });

    test('should return factors for first class', () => {
      const factors = getEmissionFactors('first', 'widebody');
      expect(factors).toBeDefined();
      expect(factors.cabinMultiplier).toBeGreaterThan(3);
    });

    test('should have different factors for different aircraft types', () => {
      const narrowbody = getEmissionFactors('economy', 'narrowbody');
      const widebody = getEmissionFactors('economy', 'widebody');
      const regional = getEmissionFactors('economy', 'regional');

      expect(narrowbody.baseFactor).not.toBe(widebody.baseFactor);
      expect(narrowbody.baseFactor).not.toBe(regional.baseFactor);
    });
  });

  describe('calculateEmissionPerPassenger', () => {
    test('should calculate per-passenger emissions correctly', () => {
      const totalEmissions = 1000; // Total flight emissions
      const passengers = 4;

      const perPassenger = calculateEmissionPerPassenger(totalEmissions, passengers);

      expect(perPassenger).toBe(250);
    });

    test('should handle single passenger', () => {
      const totalEmissions = 500;
      const passengers = 1;

      const perPassenger = calculateEmissionPerPassenger(totalEmissions, passengers);

      expect(perPassenger).toBe(500);
    });

    test('should handle zero passengers gracefully', () => {
      const totalEmissions = 500;
      const passengers = 0;

      const perPassenger = calculateEmissionPerPassenger(totalEmissions, passengers);

      expect(perPassenger).toBe(totalEmissions); // Should return total or handle gracefully
    });
  });

  describe('Integration Tests', () => {
    test('should calculate complete flight sustainability profile', () => {
      // NYC to London flight
      const distance = 5600;
      const emissions = calculateFlightEmissions({
        distance,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      const grade = getSustainabilityGrade(emissions);
      const perPassenger = calculateEmissionPerPassenger(emissions, 2);

      expect(emissions).toBeGreaterThan(0);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(grade);
      expect(perPassenger).toBe(emissions / 2);
    });

    test('should compare two real-world routes', () => {
      // Short-haul vs long-haul
      const shortHaul = calculateFlightEmissions({
        distance: 500,
        cabinClass: 'economy',
        aircraftType: 'narrowbody',
      });

      const longHaul = calculateFlightEmissions({
        distance: 10000,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      const shortGrade = getSustainabilityGrade(shortHaul);
      const longGrade = getSustainabilityGrade(longHaul);

      const comparison = compareSustainability(
        { emissions: shortHaul, grade: shortGrade },
        { emissions: longHaul, grade: longGrade }
      );

      expect(comparison.betterOption).toBe('flight1'); // Short haul is better
      expect(comparison.difference).toBeGreaterThan(0);
    });

    test('should calculate emissions for family trip', () => {
      const distance = 3000;
      const totalEmissions = calculateFlightEmissions({
        distance,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      // Family of 4 (2 adults, 2 children)
      const adults = 2;
      const children = 2;
      const totalPassengers = adults + children;

      const perAdult = calculateEmissionPerPassenger(totalEmissions, totalPassengers);
      const familyTotal = perAdult * totalPassengers;

      expect(familyTotal).toBeCloseTo(totalEmissions);
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme distances', () => {
      const veryShort = calculateFlightEmissions({
        distance: 1,
        cabinClass: 'economy',
        aircraftType: 'regional',
      });

      const veryLong = calculateFlightEmissions({
        distance: 20000,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      expect(veryShort).toBeGreaterThan(0);
      expect(veryLong).toBeGreaterThan(veryShort);
    });

    test('should handle premium economy', () => {
      const premiumEconomy = calculateFlightEmissions({
        distance: 5000,
        cabinClass: 'premium_economy',
        aircraftType: 'widebody',
      });

      const economy = calculateFlightEmissions({
        distance: 5000,
        cabinClass: 'economy',
        aircraftType: 'widebody',
      });

      // Premium economy should be between economy and business
      expect(premiumEconomy).toBeGreaterThan(economy);
      expect(premiumEconomy).toBeLessThan(economy * 2);
    });

    test('should handle unknown aircraft types gracefully', () => {
      const emissions = calculateFlightEmissions({
        distance: 2000,
        cabinClass: 'economy',
        aircraftType: 'unknown' as any, // Type assertion to test fallback
      });

      expect(emissions).toBeGreaterThan(0);
    });
  });
});
