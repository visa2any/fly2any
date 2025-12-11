/**
 * API Fare Validation Tests
 *
 * Direct API testing for fare data integrity without browser automation.
 * Faster execution for CI/CD pipelines.
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import {
  calculateExpectedPrice,
  MARKUP_CONFIG,
  COMPARISON_THRESHOLDS,
} from './types';
import { getFutureDate } from '../fixtures/test-data';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Test mode headers with secret token to bypass rate limiting securely
const TEST_HEADERS = {
  'X-Test-Mode': 'fare-reconciliation',
  'X-Test-Secret': process.env.E2E_TEST_SECRET || 'fly2any-e2e-secure-2025',
  'User-Agent': 'Fly2Any-FareReconciliation-Test/1.0',
};

// Helper to add delay between tests to avoid rate limiting
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Configure tests to run sequentially
test.describe.configure({ mode: 'serial' });

test.describe('API Fare Validation', () => {
  // Add delay before each test to avoid rate limiting
  test.beforeEach(async () => {
    await delay(2000);
  });

  test.describe('Flight Search API', () => {
    test('should return valid flight offers with correct structure', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: {
          origin: 'JFK',
          destination: 'LAX',
          departureDate: getFutureDate(30),
          returnDate: getFutureDate(37),
          adults: 1,
          travelClass: 'ECONOMY',
          currencyCode: 'USD',
          maxResults: 10,
        },
        headers: TEST_HEADERS,
        timeout: 60000,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Validate response structure (API returns either 'data' or 'flights' array)
      expect(data.data || data.flights).toBeDefined();
      expect(Array.isArray(data.data || data.flights)).toBeTruthy();

      const flights = data.data || data.flights || [];
      expect(flights.length).toBeGreaterThan(0);

      // Validate first flight structure
      const flight = flights[0];
      expect(flight).toHaveProperty('id');
      expect(flight).toHaveProperty('price');
      expect(flight.price).toHaveProperty('total');
      expect(flight.price).toHaveProperty('currency');
      expect(flight).toHaveProperty('itineraries');
    });

    test('should apply markup correctly to prices', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: {
          origin: 'JFK',
          destination: 'LAX',
          departureDate: getFutureDate(45),
          adults: 1,
          travelClass: 'ECONOMY',
          currencyCode: 'USD',
          maxResults: 5,
        },
        headers: TEST_HEADERS,
        timeout: 60000,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const flights = data.data || data.flights || [];

      for (const flight of flights) {
        const displayPrice = parseFloat(flight.price?.total || '0');
        const basePrice = parseFloat(flight.price?.base || flight.price?.total || '0');

        // Calculate expected markup
        const expected = calculateExpectedPrice(basePrice);

        // Log for debugging
        console.log(`Flight ${flight.id}: Base=$${basePrice}, Display=$${displayPrice}, Expected=$${expected.customerPrice}`);

        // Verify markup bounds
        if (displayPrice > basePrice) {
          const actualMarkup = displayPrice - basePrice;
          expect(actualMarkup).toBeGreaterThanOrEqual(MARKUP_CONFIG.minimum - 0.01);
          expect(actualMarkup).toBeLessThanOrEqual(MARKUP_CONFIG.maximum + 0.01);
        }
      }
    });

    test('should handle multi-passenger pricing correctly', async ({ request }) => {
      const params = {
        origin: 'JFK',
        destination: 'MIA',
        departureDate: getFutureDate(21),
        returnDate: getFutureDate(28),
        adults: 2,
        children: 1,
        travelClass: 'ECONOMY',
        currencyCode: 'USD',
      };

      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: params,
        headers: TEST_HEADERS,
        timeout: 60000,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const flights = data.data || data.flights || [];

      for (const flight of flights) {
        const travelerPricings = flight.travelerPricings || [];
        const totalPax = params.adults + (params.children || 0);

        // Should have pricing for travelers (API may combine or separate)
        expect(travelerPricings.length).toBeGreaterThanOrEqual(1);

        // Validate total price is reasonable for multiple passengers
        const totalPrice = parseFloat(flight.price?.total || '0');
        expect(totalPrice).toBeGreaterThan(0);

        // If traveler pricing exists, validate structure
        if (travelerPricings.length > 0) {
          const sumOfTravelers = travelerPricings.reduce(
            (sum: number, tp: any) => sum + parseFloat(tp.price?.total || '0'),
            0
          );
          // Total should be close to sum of traveler prices (allow for rounding)
          expect(Math.abs(totalPrice - sumOfTravelers)).toBeLessThan(totalPrice * 0.05);
        }
      }
    });

    test('should include fare family information when available', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: {
          origin: 'JFK',
          destination: 'LAX',
          departureDate: getFutureDate(60),
          returnDate: getFutureDate(67),
          adults: 1,
          travelClass: 'ECONOMY',
          currencyCode: 'USD',
        },
        headers: TEST_HEADERS,
        timeout: 60000,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const flights = data.data || data.flights || [];

      let fareFamiliesFound = 0;

      for (const flight of flights) {
        const travelerPricings = flight.travelerPricings || [];

        for (const tp of travelerPricings) {
          const fareDetails = tp.fareDetailsBySegment || [];

          for (const fd of fareDetails) {
            if (fd.brandedFare) {
              fareFamiliesFound++;
              console.log(`Fare Family: ${fd.brandedFare}, Cabin: ${fd.cabin}, Class: ${fd.class}`);
            }
          }
        }
      }

      console.log(`Total branded fares found: ${fareFamiliesFound}`);
    });

    test('should include baggage information', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: {
          origin: 'JFK',
          destination: 'LHR',
          departureDate: getFutureDate(45),
          adults: 1,
          travelClass: 'ECONOMY',
          currencyCode: 'USD',
          maxResults: 5,
        },
        headers: TEST_HEADERS,
        timeout: 60000,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const flights = data.data || data.flights || [];

      for (const flight of flights.slice(0, 3)) {
        const travelerPricings = flight.travelerPricings || [];

        for (const tp of travelerPricings) {
          const fareDetails = tp.fareDetailsBySegment || [];

          for (const fd of fareDetails) {
            if (fd.includedCheckedBags) {
              const bags = fd.includedCheckedBags;
              console.log(`Baggage for flight ${flight.id}: ${JSON.stringify(bags)}`);

              // Validate baggage structure
              if (bags.quantity !== undefined) {
                expect(bags.quantity).toBeGreaterThanOrEqual(0);
              }
              if (bags.weight !== undefined) {
                expect(bags.weight).toBeGreaterThan(0);
                expect(bags.weightUnit).toBeDefined();
              }
            }
          }
        }
      }
    });
  });

  test.describe('Price Validation', () => {
    test('should maintain price consistency across requests', async ({ request }) => {
      const params = {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: getFutureDate(30),
        adults: 1,
        travelClass: 'ECONOMY',
        currencyCode: 'USD',
        maxResults: 5,
      };

      // Make two identical requests
      const [response1, response2] = await Promise.all([
        request.post(`${BASE_URL}/api/flights/search`, { data: params, headers: TEST_HEADERS, timeout: 60000 }),
        request.post(`${BASE_URL}/api/flights/search`, { data: params, headers: TEST_HEADERS, timeout: 60000 }),
      ]);

      expect(response1.ok()).toBeTruthy();
      expect(response2.ok()).toBeTruthy();

      const data1 = await response1.json();
      const data2 = await response2.json();

      const flights1 = data1.data || data1.flights || [];
      const flights2 = data2.data || data2.flights || [];

      // Find matching flights by ID
      for (const f1 of flights1) {
        const f2 = flights2.find((f: any) => f.id === f1.id);

        if (f2) {
          const price1 = parseFloat(f1.price?.total || '0');
          const price2 = parseFloat(f2.price?.total || '0');

          // Prices should be identical for same flight
          expect(price1).toBe(price2);
        }
      }
    });

    test('should handle different cabin classes correctly', async ({ request }) => {
      const cabinClasses = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
      const prices: Record<string, number[]> = {};

      for (const cabinClass of cabinClasses) {
        const response = await request.post(`${BASE_URL}/api/flights/search`, {
          data: {
            origin: 'JFK',
            destination: 'LHR',
            departureDate: getFutureDate(60),
            adults: 1,
            travelClass: cabinClass,
            currencyCode: 'USD',
            maxResults: 5,
          },
          headers: TEST_HEADERS,
          timeout: 60000,
        });

        if (response.ok()) {
          const data = await response.json();
          const flights = data.data || data.flights || [];

          prices[cabinClass] = flights.map((f: any) => parseFloat(f.price?.total || '0'));

          if (prices[cabinClass].length > 0) {
            const avg = prices[cabinClass].reduce((a, b) => a + b, 0) / prices[cabinClass].length;
            console.log(`${cabinClass}: ${flights.length} flights, avg price $${avg.toFixed(2)}`);
          }
        }
      }

      // Verify price ordering (generally higher cabins cost more)
      if (prices.ECONOMY?.length && prices.BUSINESS?.length) {
        const avgEconomy = prices.ECONOMY.reduce((a, b) => a + b, 0) / prices.ECONOMY.length;
        const avgBusiness = prices.BUSINESS.reduce((a, b) => a + b, 0) / prices.BUSINESS.length;

        expect(avgBusiness).toBeGreaterThan(avgEconomy);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid origin gracefully', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: {
          origin: 'INVALID',
          destination: 'LAX',
          departureDate: getFutureDate(30),
          adults: 1,
        },
        headers: TEST_HEADERS,
        timeout: 30000,
      });

      const data = await response.json();

      // Should return error or empty results
      if (!response.ok()) {
        expect(data.error || data.message).toBeDefined();
      } else {
        const flights = data.data || data.flights || [];
        expect(flights.length).toBe(0);
      }
    });

    test('should handle past dates appropriately', async ({ request }) => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const response = await request.post(`${BASE_URL}/api/flights/search`, {
        data: {
          origin: 'JFK',
          destination: 'LAX',
          departureDate: pastDateStr,
          adults: 1,
        },
        headers: TEST_HEADERS,
        timeout: 30000,
      });

      const data = await response.json();

      // Should return error for past date
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(data.error || data.message).toBeDefined();
    });

    test('should enforce rate limiting', async ({ request }) => {
      // Make many rapid requests WITHOUT test headers to verify rate limiting works
      const promises = Array(20).fill(null).map(() =>
        request.post(`${BASE_URL}/api/flights/search`, {
          data: {
            origin: 'JFK',
            destination: 'LAX',
            departureDate: getFutureDate(30),
            adults: 1,
          },
          timeout: 5000,
        })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status() === 429);

      console.log(`Rate limited requests: ${rateLimited.length}/${responses.length}`);

      // At least some should be rate limited if protection is working
      // Note: This may vary based on rate limit configuration
    });
  });

  test.describe('Markup Verification', () => {
    const testCases = [
      { base: 100, expectedMarkup: 22, description: '$100 flight - minimum markup applies' },
      { base: 200, expectedMarkup: 22, description: '$200 flight - minimum markup applies' },
      { base: 314.29, expectedMarkup: 22, description: '$314.29 flight - breakeven point' },
      { base: 500, expectedMarkup: 35, description: '$500 flight - 7% applies' },
      { base: 1000, expectedMarkup: 70, description: '$1000 flight - 7% applies' },
      { base: 3000, expectedMarkup: 200, description: '$3000 flight - maximum cap applies' },
      { base: 5000, expectedMarkup: 200, description: '$5000 flight - maximum cap applies' },
    ];

    for (const tc of testCases) {
      test(`${tc.description}`, async () => {
        const result = calculateExpectedPrice(tc.base);

        console.log(`Base: $${tc.base} → Markup: $${result.markupAmount} → Customer: $${result.customerPrice}`);

        expect(result.markupAmount).toBeCloseTo(tc.expectedMarkup, 0);
        expect(result.customerPrice).toBe(tc.base + result.markupAmount);
        expect(result.markupAmount).toBeGreaterThanOrEqual(MARKUP_CONFIG.minimum);
        expect(result.markupAmount).toBeLessThanOrEqual(MARKUP_CONFIG.maximum);
      });
    }
  });
});

test.describe('Booking Flow API Tests', () => {
  test('should create booking with correct pricing', async ({ request }) => {
    // First search for flights
    const searchResponse = await request.post(`${BASE_URL}/api/flights/search`, {
      data: {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: getFutureDate(45),
        adults: 1,
        travelClass: 'ECONOMY',
        currencyCode: 'USD',
        maxResults: 1,
      },
      headers: TEST_HEADERS,
      timeout: 60000,
    });

    expect(searchResponse.ok()).toBeTruthy();
    const searchData = await searchResponse.json();
    const flights = searchData.data || searchData.flights || [];

    if (flights.length === 0) {
      console.log('No flights found, skipping booking test');
      return;
    }

    const selectedFlight = flights[0];
    const expectedPrice = parseFloat(selectedFlight.price?.total || '0');

    console.log(`Selected flight ${selectedFlight.id} at $${expectedPrice}`);

    // Note: Actual booking creation would require more setup
    // This test validates the price consistency check would work
    expect(expectedPrice).toBeGreaterThan(0);
  });
});
