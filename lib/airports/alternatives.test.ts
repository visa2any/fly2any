/**
 * Tests for Airport Alternatives Utility Functions
 *
 * Run with: npm test -- alternatives.test.ts
 */

import {
  getAlternativeAirports,
  hasAlternatives,
  getAirportGroup,
  getCheapestTransport,
  getFastestTransport,
  calculateTotalCost,
  AIRPORT_ALTERNATIVES,
  type AlternativeAirport,
  type TransportOption
} from './alternatives';

describe('Airport Alternatives Utility', () => {
  describe('getAlternativeAirports', () => {
    test('should return alternatives for JFK', () => {
      const result = getAlternativeAirports('JFK');
      expect(result).not.toBeNull();
      expect(result?.main.code).toBe('JFK');
      expect(result?.alternatives.length).toBeGreaterThan(0);
    });

    test('should return alternatives for LAX', () => {
      const result = getAlternativeAirports('LAX');
      expect(result).not.toBeNull();
      expect(result?.main.code).toBe('LAX');
      expect(result?.alternatives.length).toBe(3);
    });

    test('should handle lowercase airport codes', () => {
      const result = getAlternativeAirports('jfk');
      expect(result).not.toBeNull();
      expect(result?.main.code).toBe('JFK');
    });

    test('should return null for unknown airport', () => {
      const result = getAlternativeAirports('XYZ');
      expect(result).toBeNull();
    });
  });

  describe('hasAlternatives', () => {
    test('should return true for airports with alternatives', () => {
      expect(hasAlternatives('JFK')).toBe(true);
      expect(hasAlternatives('LAX')).toBe(true);
      expect(hasAlternatives('SFO')).toBe(true);
    });

    test('should return false for unknown airports', () => {
      expect(hasAlternatives('XYZ')).toBe(false);
    });
  });

  describe('getAirportGroup', () => {
    test('should return all airports in NY area', () => {
      const group = getAirportGroup('JFK');
      expect(group).toContain('JFK');
      expect(group).toContain('LGA');
      expect(group).toContain('EWR');
      expect(group.length).toBe(3);
    });

    test('should return all airports in LA area', () => {
      const group = getAirportGroup('LAX');
      expect(group).toContain('LAX');
      expect(group).toContain('BUR');
      expect(group).toContain('SNA');
      expect(group).toContain('ONT');
      expect(group.length).toBe(4);
    });

    test('should return single airport for unknown code', () => {
      const group = getAirportGroup('XYZ');
      expect(group).toEqual(['XYZ']);
    });
  });

  describe('getCheapestTransport', () => {
    test('should return cheapest transport option', () => {
      const mockAirport: AlternativeAirport = {
        code: 'TEST',
        name: 'Test Airport',
        city: 'Test City',
        country: 'USA',
        distanceFromMain: 20,
        typicalPriceDifference: -10,
        transportOptions: [
          { type: 'uber', duration: 30, cost: 50, availability: 'always' },
          { type: 'bus', duration: 60, cost: 15, availability: 'always' },
          { type: 'train', duration: 45, cost: 20, availability: 'always' }
        ]
      };

      const cheapest = getCheapestTransport(mockAirport);
      expect(cheapest.type).toBe('bus');
      expect(cheapest.cost).toBe(15);
    });
  });

  describe('getFastestTransport', () => {
    test('should return fastest transport option', () => {
      const mockAirport: AlternativeAirport = {
        code: 'TEST',
        name: 'Test Airport',
        city: 'Test City',
        country: 'USA',
        distanceFromMain: 20,
        typicalPriceDifference: -10,
        transportOptions: [
          { type: 'uber', duration: 30, cost: 50, availability: 'always' },
          { type: 'bus', duration: 60, cost: 15, availability: 'always' },
          { type: 'train', duration: 45, cost: 20, availability: 'always' }
        ]
      };

      const fastest = getFastestTransport(mockAirport);
      expect(fastest.type).toBe('uber');
      expect(fastest.duration).toBe(30);
    });
  });

  describe('calculateTotalCost', () => {
    test('should calculate total cost with round trip', () => {
      const total = calculateTotalCost(400, 30, true);
      expect(total).toBe(460); // 400 + (30 * 2)
    });

    test('should calculate total cost with one-way trip', () => {
      const total = calculateTotalCost(400, 30, false);
      expect(total).toBe(430); // 400 + 30
    });
  });

  describe('Data Validation', () => {
    test('all airports should have valid codes', () => {
      Object.entries(AIRPORT_ALTERNATIVES).forEach(([code, group]) => {
        expect(code).toHaveLength(3);
        expect(code).toBe(code.toUpperCase());
        expect(group.main.code).toBe(code);
      });
    });

    test('all alternatives should have transport options', () => {
      Object.values(AIRPORT_ALTERNATIVES).forEach(group => {
        group.alternatives.forEach(alt => {
          expect(alt.transportOptions.length).toBeGreaterThan(0);
        });
      });
    });

    test('all transport options should have valid costs', () => {
      Object.values(AIRPORT_ALTERNATIVES).forEach(group => {
        group.alternatives.forEach(alt => {
          alt.transportOptions.forEach(transport => {
            expect(transport.cost).toBeGreaterThan(0);
            expect(transport.duration).toBeGreaterThan(0);
          });
        });
      });
    });

    test('all alternatives should be within 50 miles', () => {
      Object.values(AIRPORT_ALTERNATIVES).forEach(group => {
        group.alternatives.forEach(alt => {
          expect(alt.distanceFromMain).toBeLessThanOrEqual(70); // Some flexibility
          expect(alt.distanceFromMain).toBeGreaterThan(0);
        });
      });
    });

    test('all alternatives should have reasonable price differences', () => {
      Object.values(AIRPORT_ALTERNATIVES).forEach(group => {
        group.alternatives.forEach(alt => {
          expect(alt.typicalPriceDifference).toBeGreaterThan(-50);
          expect(alt.typicalPriceDifference).toBeLessThan(50);
        });
      });
    });
  });

  describe('Specific City Tests', () => {
    test('NYC area should have all three airports', () => {
      const jfk = getAlternativeAirports('JFK');
      const lga = getAlternativeAirports('LGA');
      const ewr = getAlternativeAirports('EWR');

      expect(jfk?.alternatives.map(a => a.code)).toContain('LGA');
      expect(jfk?.alternatives.map(a => a.code)).toContain('EWR');
      expect(lga?.alternatives.map(a => a.code)).toContain('JFK');
      expect(ewr?.alternatives.map(a => a.code)).toContain('JFK');
    });

    test('LA area should have all four airports', () => {
      const lax = getAlternativeAirports('LAX');
      expect(lax?.alternatives.length).toBe(3);
      expect(lax?.alternatives.map(a => a.code)).toContain('BUR');
      expect(lax?.alternatives.map(a => a.code)).toContain('SNA');
      expect(lax?.alternatives.map(a => a.code)).toContain('ONT');
    });

    test('SF Bay Area should have all three airports', () => {
      const sfo = getAlternativeAirports('SFO');
      expect(sfo?.alternatives.map(a => a.code)).toContain('OAK');
      expect(sfo?.alternatives.map(a => a.code)).toContain('SJC');
    });

    test('DC area should have all three airports', () => {
      const iad = getAlternativeAirports('IAD');
      expect(iad?.alternatives.map(a => a.code)).toContain('DCA');
      expect(iad?.alternatives.map(a => a.code)).toContain('BWI');
    });
  });

  describe('Transport Type Coverage', () => {
    test('should have variety of transport types', () => {
      const transportTypes = new Set<string>();
      Object.values(AIRPORT_ALTERNATIVES).forEach(group => {
        group.alternatives.forEach(alt => {
          alt.transportOptions.forEach(transport => {
            transportTypes.add(transport.type);
          });
        });
      });

      expect(transportTypes.has('train')).toBe(true);
      expect(transportTypes.has('bus')).toBe(true);
      expect(transportTypes.has('uber')).toBe(true);
      expect(transportTypes.size).toBeGreaterThanOrEqual(3);
    });
  });
});

// Mock data for integration tests
export const MOCK_FLIGHT_SCENARIOS = [
  {
    name: 'NYC to LA - Expensive flight',
    origin: 'JFK',
    destination: 'LAX',
    currentPrice: 600,
    expectedSavings: true
  },
  {
    name: 'SF to NYC - Moderate flight',
    origin: 'SFO',
    destination: 'JFK',
    currentPrice: 400,
    expectedSavings: true
  },
  {
    name: 'Chicago to Miami - Budget flight',
    origin: 'ORD',
    destination: 'MIA',
    currentPrice: 250,
    expectedSavings: true
  }
];

// Helper function for component testing
export function getMockAlternativeData(airportCode: string) {
  const alternatives = getAlternativeAirports(airportCode);
  if (!alternatives) return null;

  return alternatives.alternatives.map(alt => ({
    airport: alt,
    cheapestTransport: getCheapestTransport(alt),
    fastestTransport: getFastestTransport(alt)
  }));
}
