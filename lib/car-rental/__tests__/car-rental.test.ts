/**
 * CAR RENTAL SYSTEM - COMPREHENSIVE TEST SUITE
 * Tests region detection, vehicle inventory, and ACRISS compliance
 */

import { detectRegion, getLocationInfo, iataToCountry } from '../location-database';
import { generateMockCarRentals } from '../../mock-data/car-rentals';

describe('Car Rental Location Database', () => {
  describe('Region Detection - Brazil', () => {
    const brazilAirports = ['BSB', 'GRU', 'GIG', 'CGH', 'CNF', 'POA', 'REC', 'SSA', 'FOR', 'MAO'];

    brazilAirports.forEach(code => {
      test(`${code} should detect as Brazil`, () => {
        expect(detectRegion(code)).toBe('brazil');
      });
    });

    test('Brazil airports should NOT have Tesla in inventory', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'BSB',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const hasTesla = result.data.some(car =>
        car.vehicle.description.toLowerCase().includes('tesla')
      );

      expect(hasTesla).toBe(false);
    });

    test('Brazil should have Localiza, Movida, or Unidas as providers', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'GRU',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const brazilProviders = ['Localiza', 'Movida', 'Unidas'];
      const hasValidProvider = result.data.every(car =>
        brazilProviders.includes(car.provider.companyName)
      );

      expect(hasValidProvider).toBe(true);
    });

    test('Brazil cars should have FLEX fuel type', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'BSB',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-18',
      });

      const hasFlexFuel = result.data.some(car =>
        car.vehicle.fuelType === 'FLEX'
      );

      expect(hasFlexFuel).toBe(true);
    });
  });

  describe('Region Detection - USA', () => {
    const usaAirports = ['JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'MIA', 'SFO', 'SEA', 'LAS', 'MCO'];

    usaAirports.forEach(code => {
      test(`${code} should detect as USA`, () => {
        expect(detectRegion(code)).toBe('usa');
      });
    });

    test('USA airports SHOULD have Tesla in inventory', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const hasTesla = result.data.some(car =>
        car.vehicle.description.toLowerCase().includes('tesla')
      );

      expect(hasTesla).toBe(true);
    });

    test('USA should have major rental providers', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'JFK',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const usProviders = ['Hertz', 'Avis', 'Enterprise', 'National', 'Budget', 'Alamo'];
      const hasUSProvider = result.data.some(car =>
        usProviders.includes(car.provider.companyName)
      );

      expect(hasUSProvider).toBe(true);
    });

    test('USA mileage unit should be miles', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-18',
      });

      expect(result.data[0].mileage.unit).toBe('miles');
    });
  });

  describe('Region Detection - Canada', () => {
    const canadaAirports = ['YYZ', 'YVR', 'YUL', 'YYC', 'YEG', 'YOW'];

    canadaAirports.forEach(code => {
      test(`${code} should detect as Canada`, () => {
        expect(detectRegion(code)).toBe('canada');
      });
    });

    test('Canada mileage unit should be km', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'YYZ',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-18',
      });

      expect(result.data[0].mileage.unit).toBe('km');
    });
  });

  describe('Region Detection - Europe', () => {
    const europeAirports = ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC'];

    europeAirports.forEach(code => {
      test(`${code} should detect as Europe`, () => {
        expect(detectRegion(code)).toBe('europe');
      });
    });

    test('Europe should have diesel options', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'CDG',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const hasDiesel = result.data.some(car =>
        car.vehicle.fuelType === 'DIESEL'
      );

      expect(hasDiesel).toBe(true);
    });

    test('Europe should have manual transmission options', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'FRA',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const hasManual = result.data.some(car =>
        car.vehicle.transmission === 'MANUAL'
      );

      expect(hasManual).toBe(true);
    });
  });

  describe('Region Detection - Asia', () => {
    const asiaAirports = ['NRT', 'HND', 'ICN', 'SIN', 'HKG', 'BKK', 'KUL'];

    asiaAirports.forEach(code => {
      test(`${code} should detect as Asia`, () => {
        expect(detectRegion(code)).toBe('asia');
      });
    });

    test('Japan airports should have hybrid options', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'NRT',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      const hasHybrid = result.data.some(car =>
        car.vehicle.fuelType === 'HYBRID'
      );

      expect(hasHybrid).toBe(true);
    });
  });

  describe('Region Detection - Middle East', () => {
    const middleEastAirports = ['DXB', 'AUH', 'DOH', 'RUH', 'JED'];

    middleEastAirports.forEach(code => {
      test(`${code} should detect as Middle East`, () => {
        expect(detectRegion(code)).toBe('middle_east');
      });
    });
  });

  describe('Region Detection - Oceania', () => {
    const oceaniaAirports = ['SYD', 'MEL', 'BNE', 'AKL', 'WLG'];

    oceaniaAirports.forEach(code => {
      test(`${code} should detect as Oceania`, () => {
        expect(detectRegion(code)).toBe('oceania');
      });
    });
  });

  describe('Region Detection - Africa', () => {
    const africaAirports = ['JNB', 'CPT', 'NBO', 'CMN', 'ADD'];

    africaAirports.forEach(code => {
      test(`${code} should detect as Africa`, () => {
        expect(detectRegion(code)).toBe('africa');
      });
    });
  });

  describe('Region Detection - LATAM', () => {
    const latamAirports = ['EZE', 'SCL', 'BOG', 'LIM', 'MEX', 'CUN'];

    latamAirports.forEach(code => {
      test(`${code} should detect as LATAM`, () => {
        expect(detectRegion(code)).toBe('latam');
      });
    });
  });

  describe('ACRISS Code Compliance', () => {
    test('All vehicles should have valid 4-character ACRISS codes', () => {
      const regions = ['BSB', 'JFK', 'LHR', 'NRT', 'DXB', 'SYD', 'JNB', 'EZE', 'YYZ'];

      regions.forEach(location => {
        const result = generateMockCarRentals({
          pickupLocation: location,
          pickupDate: '2025-01-15',
          dropoffDate: '2025-01-20',
        });

        result.data.forEach(car => {
          expect(car.vehicle.acrissCode).toBeDefined();
          expect(car.vehicle.acrissCode?.length).toBe(4);
        });
      });
    });

    test('ACRISS codes should follow standard format', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      // ACRISS Position 1: Category (M, E, C, I, S, F, P, L, X, etc.)
      const validCategories = ['M', 'E', 'C', 'I', 'S', 'F', 'P', 'L', 'X', 'U', 'W', 'O', 'G', 'R', 'J'];
      // ACRISS Position 2: Type (B, C, D, W, V, F, J, T, X, etc.)
      const validTypes = ['B', 'C', 'D', 'W', 'V', 'F', 'J', 'T', 'X', 'P', 'S', 'K', 'E', 'G', 'H', 'M', 'R', 'L', 'Y', 'N'];
      // ACRISS Position 3: Transmission (M, A, N, B, C, D)
      const validTransmissions = ['M', 'A', 'N', 'B', 'C', 'D'];
      // ACRISS Position 4: Fuel/AC (R, N, D, Q, H, E, V, Z, A, B, C, I, L, S, U, X)
      const validFuelAC = ['R', 'N', 'D', 'Q', 'H', 'E', 'V', 'Z', 'A', 'B', 'C', 'I', 'L', 'S', 'U', 'X'];

      result.data.forEach(car => {
        const code = car.vehicle.acrissCode!;
        expect(validCategories).toContain(code[0]);
        expect(validTypes).toContain(code[1]);
        expect(validTransmissions).toContain(code[2]);
        expect(validFuelAC).toContain(code[3]);
      });
    });
  });

  describe('Price Calculation', () => {
    test('Multi-day rental should calculate correct total', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20', // 5 days
      });

      result.data.forEach(car => {
        const perDay = parseFloat(car.price.perDay);
        const total = parseFloat(car.price.total);
        const expectedTotal = perDay * 5;

        expect(Math.abs(total - expectedTotal)).toBeLessThan(0.01);
      });
    });

    test('Single day rental should work correctly', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'JFK',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-15', // Same day
      });

      result.data.forEach(car => {
        const perDay = parseFloat(car.price.perDay);
        const total = parseFloat(car.price.total);

        expect(Math.abs(total - perDay)).toBeLessThan(0.01);
      });
    });
  });

  describe('Location Info', () => {
    test('getLocationInfo returns correct country code', () => {
      const info = getLocationInfo('JFK');
      expect(info.countryCode).toBe('US');
      expect(info.region).toBe('usa');

      const infoBR = getLocationInfo('BSB');
      expect(infoBR.countryCode).toBe('BR');
      expect(infoBR.region).toBe('brazil');
    });
  });

  describe('Meta Information', () => {
    test('Response should include region in meta', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'BSB',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      expect(result.meta.region).toBe('brazil');
    });

    test('Response should include mockData flag', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      expect(result.meta.mockData).toBe(true);
    });
  });

  describe('Vehicle Features', () => {
    test('All vehicles should have at least one feature', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      result.data.forEach(car => {
        expect(car.features.length).toBeGreaterThan(0);
      });
    });

    test('Luxury vehicles should have insurance included', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      result.data
        .filter(car => ['LUXURY', 'PREMIUM', 'ELECTRIC'].includes(car.vehicle.category))
        .forEach(car => {
          expect(car.insurance.included).toBe(true);
        });
    });
  });

  describe('Edge Cases', () => {
    test('Unknown location should default to global', () => {
      const region = detectRegion('XYZ');
      expect(region).toBe('global');
    });

    test('Lowercase location codes should work', () => {
      const region = detectRegion('jfk');
      expect(region).toBe('usa');
    });

    test('Location with spaces should be trimmed', () => {
      const region = detectRegion('  JFK  ');
      expect(region).toBe('usa');
    });

    test('Same pickup and dropoff location should work', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        dropoffLocation: 'LAX',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].pickupLocation.code).toBe('LAX');
      expect(result.data[0].dropoffLocation.code).toBe('LAX');
    });

    test('Different pickup and dropoff location should work', () => {
      const result = generateMockCarRentals({
        pickupLocation: 'LAX',
        dropoffLocation: 'SFO',
        pickupDate: '2025-01-15',
        dropoffDate: '2025-01-20',
      });

      expect(result.data[0].pickupLocation.code).toBe('LAX');
      expect(result.data[0].dropoffLocation.code).toBe('SFO');
    });
  });
});

describe('IATA Database Coverage', () => {
  test('Database should have 400+ airport codes', () => {
    const codeCount = Object.keys(iataToCountry).length;
    expect(codeCount).toBeGreaterThan(400);
  });

  test('All major world hubs should be covered', () => {
    const majorHubs = [
      'JFK', 'LAX', 'ORD', 'LHR', 'CDG', 'FRA', 'AMS', 'DXB', 'SIN', 'HKG',
      'NRT', 'ICN', 'PEK', 'SYD', 'GRU', 'EZE', 'MEX', 'JNB', 'IST', 'DOH',
    ];

    majorHubs.forEach(hub => {
      expect(iataToCountry[hub]).toBeDefined();
    });
  });
});
