/**
 * Unit Tests: Airport Helper Utilities
 *
 * Tests for distance calculations, search functionality, and metro area expansion.
 */

import {
  calculateDistance,
  searchAirports,
  getMetroAirports,
  parseNaturalLanguageQuery,
  getAirportDetails,
  getNearbyAirports,
} from '../airport-helpers';
import { AIRPORTS } from '@/lib/data/airports-complete';

describe('Airport Helpers', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between JFK and LAX correctly', () => {
      const jfk = AIRPORTS.find(a => a.code === 'JFK')!;
      const lax = AIRPORTS.find(a => a.code === 'LAX')!;

      const distance = calculateDistance(
        jfk.coordinates.lat,
        jfk.coordinates.lon,
        lax.coordinates.lat,
        lax.coordinates.lon
      );

      // JFK to LAX is approximately 3,944 km (2,451 miles)
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    test('should calculate short distances correctly', () => {
      const jfk = AIRPORTS.find(a => a.code === 'JFK')!;
      const lga = AIRPORTS.find(a => a.code === 'LGA')!;

      const distance = calculateDistance(
        jfk.coordinates.lat,
        jfk.coordinates.lon,
        lga.coordinates.lat,
        lga.coordinates.lon
      );

      // JFK to LGA is approximately 15 km
      expect(distance).toBeGreaterThan(10);
      expect(distance).toBeLessThan(20);
    });

    test('should calculate international distances correctly', () => {
      const lhr = AIRPORTS.find(a => a.code === 'LHR')!;
      const syd = AIRPORTS.find(a => a.code === 'SYD')!;

      const distance = calculateDistance(
        lhr.coordinates.lat,
        lhr.coordinates.lon,
        syd.coordinates.lat,
        syd.coordinates.lon
      );

      // LHR to SYD is approximately 17,000 km
      expect(distance).toBeGreaterThan(16500);
      expect(distance).toBeLessThan(17500);
    });
  });

  describe('searchAirports', () => {
    test('should find airports by exact code match', () => {
      const results = searchAirports('JFK');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('JFK');
      expect(results[0].matchType).toBe('code');
      expect(results[0].score).toBeGreaterThan(90);
    });

    test('should find airports by city name', () => {
      const results = searchAirports('New York');
      expect(results.length).toBeGreaterThan(0);
      const hasNYCAirport = results.some(r =>
        ['JFK', 'LGA', 'EWR'].includes(r.code)
      );
      expect(hasNYCAirport).toBe(true);
    });

    test('should find airports by airport name', () => {
      const results = searchAirports('Heathrow');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('LHR');
    });

    test('should find airports by country', () => {
      const results = searchAirports('United States');
      expect(results.length).toBeGreaterThan(0);
      const allUS = results.every(r => r.country.includes('United States'));
      expect(allUS).toBe(true);
    });

    test('should handle case-insensitive search', () => {
      const lowerCase = searchAirports('london');
      const upperCase = searchAirports('LONDON');
      expect(lowerCase.length).toBe(upperCase.length);
    });

    test('should prioritize popular airports', () => {
      const results = searchAirports('London');
      // LHR should be first as it's the most popular London airport
      expect(results[0].code).toBe('LHR');
    });

    test('should handle partial matches', () => {
      const results = searchAirports('Franc');
      const hasFrenchAirports = results.some(r => r.country.includes('France'));
      expect(hasFrenchAirports).toBe(true);
    });

    test('should return empty array for no matches', () => {
      const results = searchAirports('XYZABC123');
      expect(results.length).toBe(0);
    });

    test('should limit results to specified max', () => {
      const results = searchAirports('United', 5);
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getMetroAirports', () => {
    test('should return NYC metro airports', () => {
      const metroAirports = getMetroAirports('JFK');
      expect(metroAirports.length).toBeGreaterThan(1);
      expect(metroAirports).toContain('JFK');
      expect(metroAirports).toContain('LGA');
      expect(metroAirports).toContain('EWR');
    });

    test('should return London metro airports', () => {
      const metroAirports = getMetroAirports('LHR');
      expect(metroAirports.length).toBeGreaterThan(1);
      expect(metroAirports).toContain('LHR');
      expect(metroAirports).toContain('LGW');
      expect(metroAirports).toContain('LCY');
    });

    test('should return Tokyo metro airports', () => {
      const metroAirports = getMetroAirports('NRT');
      expect(metroAirports).toContain('NRT');
      expect(metroAirports).toContain('HND');
    });

    test('should return single airport for non-metro airports', () => {
      const metroAirports = getMetroAirports('DEN');
      expect(metroAirports).toEqual(['DEN']);
    });

    test('should handle invalid airport codes', () => {
      const metroAirports = getMetroAirports('INVALID');
      expect(metroAirports).toEqual(['INVALID']);
    });
  });

  describe('parseNaturalLanguageQuery', () => {
    test('should parse "beaches in Asia"', () => {
      const results = parseNaturalLanguageQuery('beaches in Asia');
      expect(results.length).toBeGreaterThan(0);
      const hasAsianBeachDestination = results.some(r =>
        ['BKK', 'DPS', 'HKT', 'SIN'].includes(r.code)
      );
      expect(hasAsianBeachDestination).toBe(true);
    });

    test('should parse "ski resorts in Europe"', () => {
      const results = parseNaturalLanguageQuery('ski resorts in Europe');
      expect(results.length).toBeGreaterThan(0);
      const hasEuropeanSkiDestination = results.some(r =>
        ['GVA', 'ZRH', 'INN'].includes(r.code)
      );
      expect(hasEuropeanSkiDestination).toBe(true);
    });

    test('should parse "city breaks"', () => {
      const results = parseNaturalLanguageQuery('city breaks');
      expect(results.length).toBeGreaterThan(0);
      const hasMajorCity = results.some(r =>
        ['LON', 'PAR', 'NYC', 'TYO'].includes(r.code)
      );
      expect(hasMajorCity).toBe(true);
    });

    test('should parse continent queries', () => {
      const results = parseNaturalLanguageQuery('anywhere in Europe');
      expect(results.length).toBeGreaterThan(0);
      const allEurope = results.every(r =>
        r.continent === 'Europe' || r.country.includes('Europe')
      );
      expect(allEurope).toBe(true);
    });

    test('should fall back to standard search for non-NLP queries', () => {
      const results = parseNaturalLanguageQuery('London');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].code).toBe('LHR');
    });
  });

  describe('getAirportDetails', () => {
    test('should get airport details by code', () => {
      const airport = getAirportDetails('JFK');
      expect(airport).toBeDefined();
      expect(airport?.code).toBe('JFK');
      expect(airport?.name).toContain('Kennedy');
      expect(airport?.city).toBe('New York');
    });

    test('should return null for invalid code', () => {
      const airport = getAirportDetails('INVALID');
      expect(airport).toBeNull();
    });

    test('should handle case-insensitive codes', () => {
      const lower = getAirportDetails('jfk');
      const upper = getAirportDetails('JFK');
      expect(lower?.code).toBe(upper?.code);
    });
  });

  describe('getNearbyAirports', () => {
    test('should find airports within radius', () => {
      const jfk = AIRPORTS.find(a => a.code === 'JFK')!;
      const nearby = getNearbyAirports(
        jfk.coordinates.lat,
        jfk.coordinates.lon,
        50 // 50km radius
      );

      expect(nearby.length).toBeGreaterThan(0);
      const hasLGA = nearby.some(a => a.code === 'LGA');
      expect(hasLGA).toBe(true);
    });

    test('should sort by distance', () => {
      const jfk = AIRPORTS.find(a => a.code === 'JFK')!;
      const nearby = getNearbyAirports(
        jfk.coordinates.lat,
        jfk.coordinates.lon,
        100
      );

      // Verify distances are in ascending order
      for (let i = 0; i < nearby.length - 1; i++) {
        expect(nearby[i].distance).toBeLessThanOrEqual(nearby[i + 1].distance);
      }
    });

    test('should limit results', () => {
      const jfk = AIRPORTS.find(a => a.code === 'JFK')!;
      const nearby = getNearbyAirports(
        jfk.coordinates.lat,
        jfk.coordinates.lon,
        500,
        5
      );

      expect(nearby.length).toBeLessThanOrEqual(5);
    });

    test('should exclude origin airport', () => {
      const jfk = AIRPORTS.find(a => a.code === 'JFK')!;
      const nearby = getNearbyAirports(
        jfk.coordinates.lat,
        jfk.coordinates.lon,
        50,
        10,
        'JFK'
      );

      const hasJFK = nearby.some(a => a.code === 'JFK');
      expect(hasJFK).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should handle multi-city search workflow', () => {
      // Step 1: Search for city
      const cityResults = searchAirports('Paris');
      expect(cityResults.length).toBeGreaterThan(0);

      // Step 2: Get metro airports
      const parisCode = cityResults[0].code;
      const metroAirports = getMetroAirports(parisCode);
      expect(metroAirports.length).toBeGreaterThan(0);

      // Step 3: Get details for each metro airport
      const details = metroAirports.map(code => getAirportDetails(code));
      expect(details.every(d => d !== null)).toBe(true);
    });

    test('should handle alternative airport search workflow', () => {
      // Step 1: Get origin airport
      const origin = getAirportDetails('JFK');
      expect(origin).toBeDefined();

      // Step 2: Find nearby airports
      const alternatives = getNearbyAirports(
        origin!.coordinates.lat,
        origin!.coordinates.lon,
        100,
        5,
        'JFK'
      );
      expect(alternatives.length).toBeGreaterThan(0);

      // Step 3: Calculate distances
      const distances = alternatives.map(alt =>
        calculateDistance(
          origin!.coordinates.lat,
          origin!.coordinates.lon,
          alt.coordinates.lat,
          alt.coordinates.lon
        )
      );
      expect(distances.every(d => d <= 100)).toBe(true);
    });
  });
});
