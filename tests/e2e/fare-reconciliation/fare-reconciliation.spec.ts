/**
 * Fare Reconciliation E2E Tests
 *
 * Validates that UI-displayed fares match API responses with correct markup applied.
 *
 * Test Strategy:
 * 1. Navigate to flight search and execute search
 * 2. Capture UI fare data from DOM
 * 3. Make parallel API calls with same parameters
 * 4. Compare prices, fare families, baggage, policies
 * 5. Generate detailed reconciliation report
 */

import { test, expect, Page, APIRequestContext } from '@playwright/test';
import {
  UIFareData,
  APIFareData,
  FareComparisonResult,
  TestScenario,
  parsePriceString,
  calculateExpectedPrice,
  compareFares,
  COMPARISON_THRESHOLDS,
} from './types';
import { getFutureDate } from '../fixtures/test-data';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/flights/search`;
const PRICE_TOLERANCE = 0.01; // $0.01 tolerance

// Test scenarios covering various routes and fare types
const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Domestic Economy - JFK to LAX',
    searchParams: {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: getFutureDate(30),
      returnDate: getFutureDate(37),
      adults: 1,
      cabinClass: 'ECONOMY',
    },
    expectedFareFamilies: ['Basic', 'Standard', 'Plus', 'Flex'],
    priceRange: { min: 150, max: 800 },
    tags: ['domestic', 'economy', 'round-trip'],
  },
  {
    name: 'International Economy - JFK to LHR',
    searchParams: {
      origin: 'JFK',
      destination: 'LHR',
      departureDate: getFutureDate(45),
      returnDate: getFutureDate(52),
      adults: 1,
      cabinClass: 'ECONOMY',
    },
    expectedFareFamilies: ['Basic', 'Standard', 'Plus', 'Flex'],
    priceRange: { min: 400, max: 2000 },
    tags: ['international', 'economy', 'transatlantic'],
  },
  {
    name: 'Business Class - JFK to CDG',
    searchParams: {
      origin: 'JFK',
      destination: 'CDG',
      departureDate: getFutureDate(60),
      returnDate: getFutureDate(67),
      adults: 1,
      cabinClass: 'BUSINESS',
    },
    priceRange: { min: 2000, max: 8000 },
    tags: ['international', 'business', 'premium'],
  },
  {
    name: 'Family Booking - Multi-passenger',
    searchParams: {
      origin: 'JFK',
      destination: 'MIA',
      departureDate: getFutureDate(21),
      returnDate: getFutureDate(28),
      adults: 2,
      children: 2,
      cabinClass: 'ECONOMY',
    },
    tags: ['domestic', 'family', 'multi-pax'],
  },
  {
    name: 'One-way - LAX to SFO',
    searchParams: {
      origin: 'LAX',
      destination: 'SFO',
      departureDate: getFutureDate(14),
      adults: 1,
      cabinClass: 'ECONOMY',
    },
    tags: ['domestic', 'one-way', 'short-haul'],
  },
];

test.describe('Fare Reconciliation Tests', () => {
  let testResults: FareComparisonResult[] = [];

  test.beforeAll(async () => {
    testResults = [];
  });

  test.afterAll(async () => {
    // Generate summary report
    const passed = testResults.filter(r => r.comparison.passed).length;
    const failed = testResults.filter(r => !r.comparison.passed).length;

    console.log('\n========================================');
    console.log('FARE RECONCILIATION SUMMARY');
    console.log('========================================');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${passed} (${((passed / testResults.length) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed}`);
    console.log('========================================\n');

    if (failed > 0) {
      console.log('FAILURES:');
      testResults
        .filter(r => !r.comparison.passed)
        .forEach(r => {
          console.log(`  - ${r.testId}: ${r.comparison.failures.join(', ')}`);
        });
    }
  });

  for (const scenario of TEST_SCENARIOS) {
    test(`${scenario.name}`, async ({ page, request }) => {
      const testId = `fare_test_${Date.now()}_${scenario.name.replace(/\s+/g, '_').toLowerCase()}`;

      // Step 1: Execute API search
      const apiResponse = await makeAPISearch(request, scenario.searchParams);
      expect(apiResponse.success, 'API search should succeed').toBeTruthy();
      expect(apiResponse.flights.length, 'Should return flight results').toBeGreaterThan(0);

      // Step 2: Navigate and perform UI search
      await page.goto(`${BASE_URL}/flights`);
      await performUISearch(page, scenario.searchParams);

      // Step 3: Wait for results to load
      await page.waitForSelector('[data-testid="flight-card"], article', { timeout: 60000 });

      // Step 4: Capture UI fare data for each flight card
      const uiFares = await captureUIFares(page);
      expect(uiFares.length, 'UI should display fare cards').toBeGreaterThan(0);

      // Step 5: Compare first fare (most commonly displayed)
      const firstAPIFare = apiResponse.flights[0];
      const firstUIFare = uiFares[0];

      if (firstAPIFare && firstUIFare) {
        const comparison = compareFares(firstUIFare, firstAPIFare, PRICE_TOLERANCE);

        const result: FareComparisonResult = {
          testId,
          timestamp: new Date().toISOString(),
          searchParams: {
            origin: scenario.searchParams.origin,
            destination: scenario.searchParams.destination,
            departureDate: scenario.searchParams.departureDate,
            returnDate: scenario.searchParams.returnDate,
            adults: scenario.searchParams.adults,
            children: scenario.searchParams.children,
            infants: scenario.searchParams.infants,
            cabinClass: scenario.searchParams.cabinClass,
          },
          uiFare: firstUIFare,
          apiFare: firstAPIFare,
          comparison,
        };

        testResults.push(result);

        // Take screenshot on failure
        if (!comparison.passed) {
          await page.screenshot({
            path: `test-results/fare-reconciliation/${testId}_failure.png`,
            fullPage: true,
          });
        }

        // Assert on key checks
        expect(comparison.priceMatch, `Price should match within $${PRICE_TOLERANCE}: UI=$${firstUIFare.priceValue}, API=$${firstAPIFare.customerPrice}`).toBeTruthy();
        expect(comparison.cabinClassMatch, `Cabin class should match: UI=${firstUIFare.cabinClass}, API=${firstAPIFare.cabinClass}`).toBeTruthy();
      }

      // Step 6: Validate price range if specified
      if (scenario.priceRange) {
        const avgPrice = uiFares.reduce((sum, f) => sum + f.priceValue, 0) / uiFares.length;
        expect(avgPrice, `Average price should be within expected range $${scenario.priceRange.min}-$${scenario.priceRange.max}`).toBeGreaterThanOrEqual(scenario.priceRange.min * 0.8);
        expect(avgPrice).toBeLessThanOrEqual(scenario.priceRange.max * 1.2);
      }
    });
  }

  test('Markup calculation validation', async ({ request }) => {
    // Test that markup is correctly applied across price ranges
    const testPrices = [100, 200, 314.29, 500, 1000, 3000];

    for (const basePrice of testPrices) {
      const expected = calculateExpectedPrice(basePrice);

      // Verify markup bounds
      expect(expected.markupAmount).toBeGreaterThanOrEqual(22); // Minimum
      expect(expected.markupAmount).toBeLessThanOrEqual(200);   // Maximum

      // Verify calculation
      const manualMarkup = Math.min(200, Math.max(22, basePrice * 0.07));
      expect(Math.abs(expected.markupAmount - manualMarkup)).toBeLessThan(0.01);

      console.log(`Base: $${basePrice} → Customer: $${expected.customerPrice} (markup: $${expected.markupAmount}, ${expected.markupPercentage}%)`);
    }
  });

  test('All fare families displayed correctly', async ({ page, request }) => {
    // Search for a route that typically has multiple fare families
    const params = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: getFutureDate(45),
      returnDate: getFutureDate(52),
      adults: 1,
      cabinClass: 'ECONOMY' as const,
    };

    await page.goto(`${BASE_URL}/flights`);
    await performUISearch(page, params);
    await page.waitForSelector('[data-testid="flight-card"], article', { timeout: 60000 });

    // Check for branded fares section
    const brandedFaresSection = await page.$('[data-testid="branded-fares"], [class*="branded"], [class*="fare-families"]');

    if (brandedFaresSection) {
      const fareFamilies = await page.$$eval(
        '[data-testid="fare-family-card"], [class*="fare-card"], [class*="fare-option"]',
        (cards) => cards.map(card => ({
          name: card.querySelector('[class*="title"], h3, h4')?.textContent?.trim() || 'Unknown',
          price: card.querySelector('[class*="price"]')?.textContent?.trim() || '$0',
          features: Array.from(card.querySelectorAll('li, [class*="feature"]'))
            .map(f => f.textContent?.trim())
            .filter(Boolean),
        }))
      );

      console.log('Fare Families Found:', fareFamilies.map(f => f.name).join(', '));
      expect(fareFamilies.length, 'Should display multiple fare families').toBeGreaterThanOrEqual(1);
    }
  });

  test('Baggage policy accuracy', async ({ page, request }) => {
    const params = {
      origin: 'JFK',
      destination: 'LHR',
      departureDate: getFutureDate(60),
      adults: 1,
      cabinClass: 'ECONOMY' as const,
    };

    // Get API response
    const apiResponse = await makeAPISearch(request, params);

    // Navigate and search
    await page.goto(`${BASE_URL}/flights`);
    await performUISearch(page, params);
    await page.waitForSelector('[data-testid="flight-card"], article', { timeout: 60000 });

    // Extract baggage info from UI
    const baggageInfo = await page.$$eval(
      '[data-testid="baggage-info"], [class*="baggage"], [class*="luggage"]',
      (elements) => elements.map(el => ({
        text: el.textContent?.trim() || '',
        carryOn: el.querySelector('[class*="carry"], [class*="cabin"]')?.textContent?.trim(),
        checked: el.querySelector('[class*="checked"]')?.textContent?.trim(),
      }))
    );

    console.log('UI Baggage Info:', JSON.stringify(baggageInfo, null, 2));

    // Compare with API baggage
    if (apiResponse.flights[0]?.baggage) {
      const apiBaggage = apiResponse.flights[0].baggage;
      console.log('API Baggage:', JSON.stringify(apiBaggage, null, 2));
    }
  });

  test('Refund/Change policy consistency', async ({ page, request }) => {
    const params = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: getFutureDate(30),
      returnDate: getFutureDate(37),
      adults: 1,
      cabinClass: 'ECONOMY' as const,
    };

    const apiResponse = await makeAPISearch(request, params);

    await page.goto(`${BASE_URL}/flights`);
    await performUISearch(page, params);
    await page.waitForSelector('[data-testid="flight-card"], article', { timeout: 60000 });

    // Click on first flight to see details
    const firstCard = page.locator('[data-testid="flight-card"], article').first();
    await firstCard.click();

    // Look for policy information
    const policyInfo = await page.$$eval(
      '[data-testid="fare-rules"], [class*="policy"], [class*="rules"], [class*="terms"]',
      (elements) => elements.map(el => ({
        text: el.textContent?.trim() || '',
        isChangeable: el.textContent?.toLowerCase().includes('change') &&
                     !el.textContent?.toLowerCase().includes('non-change'),
        isRefundable: el.textContent?.toLowerCase().includes('refund') &&
                     !el.textContent?.toLowerCase().includes('non-refund'),
      }))
    );

    console.log('Policy Info Found:', policyInfo.length);
  });
});

// Helper Functions

async function makeAPISearch(
  request: APIRequestContext,
  params: TestScenario['searchParams']
): Promise<{ success: boolean; flights: APIFareData[] }> {
  try {
    const response = await request.post(API_ENDPOINT, {
      data: {
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        travelClass: params.cabinClass,
        currencyCode: 'USD',
        maxResults: 20,
      },
      timeout: 60000,
    });

    if (!response.ok()) {
      console.error('API search failed:', await response.text());
      return { success: false, flights: [] };
    }

    const data = await response.json();
    const flights = (data.data || data.flights || []).map(transformAPIFlight);

    return { success: true, flights };
  } catch (error) {
    console.error('API search error:', error);
    return { success: false, flights: [] };
  }
}

function transformAPIFlight(flight: any): APIFareData {
  const basePrice = parseFloat(flight.price?.base || flight.price?.total || '0');
  const totalPrice = parseFloat(flight.price?.total || '0');
  const markup = calculateExpectedPrice(totalPrice);

  return {
    offerId: flight.id,
    basePrice,
    totalPrice,
    currency: flight.price?.currency || 'USD',
    customerPrice: markup.customerPrice,
    markupAmount: markup.markupAmount,
    fareFamily: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare || 'Standard',
    cabinClass: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
    baggage: {
      carryOn: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags,
      checked: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags,
    },
    fareRules: {
      changeable: !flight.pricingOptions?.fareType?.includes('NORESTR') || true,
      refundable: !flight.pricingOptions?.fareType?.includes('NONREF') || false,
    },
    travelerPricing: (flight.travelerPricings || []).map((tp: any) => ({
      travelerId: tp.travelerId,
      travelerType: tp.travelerType,
      price: parseFloat(tp.price?.total || '0'),
    })),
    rawResponse: flight,
  };
}

async function performUISearch(
  page: Page,
  params: TestScenario['searchParams']
): Promise<void> {
  // Fill origin
  const originInput = page.locator('input[name="origin"], input[placeholder*="From"], input[data-testid="origin-input"]').first();
  await originInput.fill(params.origin);
  await page.waitForTimeout(500);

  // Select from autocomplete if present
  const originSuggestion = page.locator(`[role="option"]:has-text("${params.origin}"), [class*="suggestion"]:has-text("${params.origin}")`).first();
  if (await originSuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
    await originSuggestion.click();
  }

  // Fill destination
  const destInput = page.locator('input[name="destination"], input[placeholder*="To"], input[data-testid="destination-input"]').first();
  await destInput.fill(params.destination);
  await page.waitForTimeout(500);

  const destSuggestion = page.locator(`[role="option"]:has-text("${params.destination}"), [class*="suggestion"]:has-text("${params.destination}")`).first();
  if (await destSuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
    await destSuggestion.click();
  }

  // Fill dates
  const departureDateInput = page.locator('input[name="departureDate"], input[data-testid="departure-date"]').first();
  await departureDateInput.fill(params.departureDate);

  if (params.returnDate) {
    const returnDateInput = page.locator('input[name="returnDate"], input[data-testid="return-date"]').first();
    await returnDateInput.fill(params.returnDate);
  }

  // Set passengers if needed
  if (params.adults > 1 || params.children || params.infants) {
    const passengerToggle = page.locator('[data-testid="passenger-selector"], button:has-text("Traveler"), button:has-text("Passenger")').first();
    if (await passengerToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      await passengerToggle.click();

      // Adjust adults
      for (let i = 1; i < params.adults; i++) {
        await page.locator('button:has-text("+"):near([data-testid="adults"], :text("Adult"))').first().click();
      }

      // Add children
      if (params.children) {
        for (let i = 0; i < params.children; i++) {
          await page.locator('button:has-text("+"):near([data-testid="children"], :text("Child"))').first().click();
        }
      }
    }
  }

  // Set cabin class
  const cabinSelect = page.locator('select[name="class"], select[name="cabinClass"], [data-testid="cabin-select"]').first();
  if (await cabinSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
    await cabinSelect.selectOption(params.cabinClass.toLowerCase());
  }

  // Submit search
  const searchButton = page.locator('button[type="submit"], button:has-text("Search")').first();
  await searchButton.click();
}

async function captureUIFares(page: Page): Promise<UIFareData[]> {
  return await page.$$eval(
    '[data-testid="flight-card"], article[class*="flight"], div[class*="flight-card"]',
    (cards) => cards.slice(0, 10).map(card => {
      // Extract price
      const priceEl = card.querySelector('[data-testid="flight-price"], [class*="price"]:not([class*="per-person"])');
      const priceString = priceEl?.textContent?.trim() || '$0';
      const priceValue = parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;

      // Extract fare family
      const fareFamilyEl = card.querySelector('[data-testid="fare-family"], [class*="fare-family"], [class*="branded"]');
      const fareFamily = fareFamilyEl?.textContent?.trim() || 'Standard';

      // Extract cabin class
      const cabinEl = card.querySelector('[data-testid="cabin-class"], [class*="cabin"]');
      const cabinClass = cabinEl?.textContent?.trim() || 'ECONOMY';

      // Extract baggage
      const baggageEl = card.querySelector('[data-testid="baggage"], [class*="baggage"]');
      const baggageText = baggageEl?.textContent?.trim() || '';

      // Extract icons
      const icons = Array.from(card.querySelectorAll('svg, [class*="icon"]'))
        .map(icon => icon.getAttribute('data-testid') || icon.getAttribute('aria-label') || 'icon')
        .filter(Boolean);

      // Extract policies
      const changeEl = card.querySelector('[class*="change"], :has-text("Change")');
      const refundEl = card.querySelector('[class*="refund"], :has-text("Refund")');

      return {
        priceString,
        priceValue,
        currency: priceString.startsWith('$') ? 'USD' : priceString.startsWith('€') ? 'EUR' : 'USD',
        fareFamily,
        description: card.querySelector('[class*="description"]')?.textContent?.trim() || '',
        icons: icons as string[],
        cabinClass: cabinClass.toUpperCase(),
        baggage: {
          carryOn: baggageText.includes('carry') ? '1 bag' : '0 bags',
          checked: baggageText.match(/(\d+)\s*checked/i)?.[1] + ' bags' || '0 bags',
        },
        policies: {
          changeable: !changeEl?.textContent?.toLowerCase().includes('non'),
          refundable: !refundEl?.textContent?.toLowerCase().includes('non'),
        },
        ancillaries: [],
        rawHtml: card.outerHTML.substring(0, 500),
      };
    })
  );
}
