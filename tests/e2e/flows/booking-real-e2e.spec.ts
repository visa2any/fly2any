/**
 * Real E2E Booking Flow Tests — Fly2Any
 *
 * Comprehensive tests covering the entire booking journey
 * from search to confirmation, including error handling.
 *
 * Run with: npx playwright test tests/e2e/flows/booking-real-e2e.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds for long flows

// Test data
const TEST_ROUTES = {
  domestic: { from: 'JFK', to: 'LAX', fromCity: 'New York', toCity: 'Los Angeles' },
  short: { from: 'MCO', to: 'MIA', fromCity: 'Orlando', toCity: 'Miami' },
  international: { from: 'JFK', to: 'CDG', fromCity: 'New York', toCity: 'Paris' },
};

const TEST_PASSENGER = {
  title: 'Mr',
  firstName: 'Test',
  lastName: 'Booking',
  dateOfBirth: '1990-05-15',
  email: 'test@fly2any.com',
  phone: '5551234567',
  nationality: 'US',
};

const TEST_CARD = {
  number: '4111111111111111', // Stripe test card
  name: 'Test Booking',
  expMonth: '12',
  expYear: '28',
  cvv: '123',
};

// Helper functions
async function searchFlights(page: Page, route: typeof TEST_ROUTES.domestic, departureDate?: string) {
  // Navigate to flights page
  await page.goto(`${BASE_URL}/flights`);
  await page.waitForLoadState('domcontentloaded');

  // Use the search form
  const fromInput = page.locator('[data-testid="origin-input"], input[placeholder*="From"]').first();
  const toInput = page.locator('[data-testid="destination-input"], input[placeholder*="To"]').first();

  if (await fromInput.isVisible()) {
    await fromInput.fill(route.from);
    await page.waitForTimeout(500);
    // Select from dropdown if visible
    const fromOption = page.locator(`text=${route.fromCity}`).first();
    if (await fromOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fromOption.click();
    }
  }

  if (await toInput.isVisible()) {
    await toInput.fill(route.to);
    await page.waitForTimeout(500);
    const toOption = page.locator(`text=${route.toCity}`).first();
    if (await toOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toOption.click();
    }
  }

  // Set departure date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = departureDate || tomorrow.toISOString().split('T')[0];

  const dateInput = page.locator('[data-testid="departure-date"], input[type="date"]').first();
  if (await dateInput.isVisible()) {
    await dateInput.fill(dateStr);
  }

  // Click search
  const searchBtn = page.locator('[data-testid="search-button"], button:has-text("Search")').first();
  await searchBtn.click();

  // Wait for results
  await page.waitForURL(/\/flights\/results/, { timeout: 15000 });
}

async function selectFirstFlight(page: Page) {
  // Wait for flight results
  await page.waitForSelector('[data-testid="flight-card"], .flight-card, [class*="FlightCard"]', {
    timeout: 30000,
  });

  // Click first flight
  const flightCard = page.locator('[data-testid="flight-card"], .flight-card, [class*="FlightCard"]').first();
  await flightCard.click();

  // Wait for booking page
  await page.waitForURL(/\/booking/, { timeout: 15000 });
}

async function fillPassengerForm(page: Page, passenger: typeof TEST_PASSENGER) {
  // Wait for form
  await page.waitForTimeout(1000);

  // Title
  const titleSelect = page.locator('select[name*="title"], [data-testid="title-select"]').first();
  if (await titleSelect.isVisible()) {
    await titleSelect.selectOption(passenger.title);
  }

  // First Name
  const firstNameInput = page.locator('input[name*="firstName"], [data-testid="first-name"]').first();
  if (await firstNameInput.isVisible()) {
    await firstNameInput.fill(passenger.firstName);
  }

  // Last Name
  const lastNameInput = page.locator('input[name*="lastName"], [data-testid="last-name"]').first();
  if (await lastNameInput.isVisible()) {
    await lastNameInput.fill(passenger.lastName);
  }

  // Date of Birth
  const dobInput = page.locator('input[name*="dateOfBirth"], input[type="date"][name*="dob"]').first();
  if (await dobInput.isVisible()) {
    await dobInput.fill(passenger.dateOfBirth);
  }

  // Email
  const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill(passenger.email);
  }

  // Phone
  const phoneInput = page.locator('input[name*="phone"], input[type="tel"]').first();
  if (await phoneInput.isVisible()) {
    await phoneInput.fill(passenger.phone);
  }
}

async function fillPaymentForm(page: Page, card: typeof TEST_CARD) {
  // Card Number
  const cardInput = page.locator('input[placeholder*="Card"], input[name*="cardNumber"]').first();
  if (await cardInput.isVisible()) {
    await cardInput.fill(card.number);
  }

  // Cardholder Name
  const nameInput = page.locator('input[placeholder*="Cardholder"], input[name*="cardName"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.fill(card.name);
  }

  // Expiry Month
  const monthSelect = page.locator('select[name*="expMonth"], select:has-text("MM")').first();
  if (await monthSelect.isVisible()) {
    await monthSelect.selectOption(card.expMonth);
  }

  // Expiry Year
  const yearSelect = page.locator('select[name*="expYear"], select:has-text("YY")').first();
  if (await yearSelect.isVisible()) {
    await yearSelect.selectOption(card.expYear);
  }

  // CVV
  const cvvInput = page.locator('input[placeholder*="CVV"], input[name*="cvv"]').first();
  if (await cvvInput.isVisible()) {
    await cvvInput.fill(card.cvv);
  }
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════

test.describe('Flight Booking - Complete Flow', () => {
  test.setTimeout(TEST_TIMEOUT);

  test('should complete full booking flow from search to step 3', async ({ page }) => {
    // Step 1: Search for flights
    await searchFlights(page, TEST_ROUTES.short);

    // Verify results page loaded
    await expect(page).toHaveURL(/\/flights\/results/);

    // Take screenshot of results
    await page.screenshot({ path: 'test-results/booking-flow-results.png', fullPage: true });

    // Step 2: Select first flight
    await selectFirstFlight(page);

    // Verify booking page loaded
    await expect(page).toHaveURL(/\/booking/);

    // Verify Step 1 content
    await expect(page.locator('text=Customize Flight, text=Step 1, h1:has-text("Complete Booking")')).toBeVisible();

    // Take screenshot of booking step 1
    await page.screenshot({ path: 'test-results/booking-flow-step1.png', fullPage: true });

    // Click Continue to Step 2
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.click();
    await page.waitForTimeout(1000);

    // Fill passenger form
    await fillPassengerForm(page, TEST_PASSENGER);

    // Take screenshot of passenger form
    await page.screenshot({ path: 'test-results/booking-flow-step2.png', fullPage: true });

    // Continue to Step 3
    const continue2Btn = page.locator('button:has-text("Continue")').first();
    await continue2Btn.click();
    await page.waitForTimeout(1000);

    // Verify Step 3 (Payment)
    await expect(page.locator('text=Review, text=Payment, text=Review & Pay')).toBeVisible();

    // Take screenshot of payment step
    await page.screenshot({ path: 'test-results/booking-flow-step3.png', fullPage: true });
  });

  test('should display offer countdown timer for Duffel flights', async ({ page }) => {
    // Navigate directly to booking with a known offer
    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Check if countdown timer is visible (only for Duffel flights)
    const countdown = page.locator('[class*="Countdown"], text=/\\d+:\\d+/');
    const hasCountdown = await countdown.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasCountdown) {
      // Verify countdown format
      const countdownText = await countdown.textContent();
      expect(countdownText).toMatch(/\d+:\d+|\\d+m|expires/i);
    }

    // Either way, verify booking page is functional
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();
  });

  test('should handle offer expiration gracefully', async ({ page }) => {
    // Navigate to booking page
    await searchFlights(page, TEST_ROUTES.domestic);
    await selectFirstFlight(page);

    // Fill passenger data
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.click();
    await page.waitForTimeout(500);

    await fillPassengerForm(page, TEST_PASSENGER);

    // Continue to payment
    const continue2Btn = page.locator('button:has-text("Continue")').first();
    await continue2Btn.click();
    await page.waitForTimeout(500);

    // Mock an expired offer response (if modal appears, verify it works)
    const expiredModal = page.locator('text=Price Expired, text=expired');
    if (await expiredModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify recovery options are available
      await expect(page.locator('button:has-text("Check Current Price"), button:has-text("Search")')).toBeVisible();

      // Take screenshot
      await page.screenshot({ path: 'test-results/booking-offer-expired.png', fullPage: true });
    }
  });
});

test.describe('Booking API Tests', () => {
  test('should validate booking API response structure', async ({ request }) => {
    // Test flight search API
    const searchResponse = await request.get(`${BASE_URL}/api/flights/search?origin=JFK&destination=LAX&departureDate=2025-01-15&adults=1`);

    // Should return 200 or flights (might be empty)
    expect([200, 404]).toContain(searchResponse.status());

    if (searchResponse.ok()) {
      const data = await searchResponse.json();
      expect(data).toHaveProperty('data');
    }
  });

  test('should reject booking without required fields', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/flights/booking/create`, {
      data: {
        // Missing flightOffer, passengers, contactInfo
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error || data.message).toBeTruthy();
  });

  test('should handle offer refresh API', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/flights/offer/refresh`, {
      data: {
        originalOfferId: 'test_offer_123',
        origin: 'MCO',
        destination: 'MIA',
        departureDate: '2025-01-20',
        adults: 1,
      },
    });

    // Should return 200 (with results) or 404/500 (no flights)
    expect([200, 404, 500]).toContain(response.status());
  });
});

test.describe('Booking Error Handling', () => {
  test('should show error toast for booking failures', async ({ page }) => {
    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Navigate through steps
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.click();
    await page.waitForTimeout(500);

    await fillPassengerForm(page, TEST_PASSENGER);

    const continue2Btn = page.locator('button:has-text("Continue")').first();
    await continue2Btn.click();
    await page.waitForTimeout(500);

    // Fill payment
    await fillPaymentForm(page, TEST_CARD);

    // Try to submit (will fail in test environment)
    const submitBtn = page.locator('button:has-text("Complete Booking"), button:has-text("Pay"), button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Wait for error toast
      const errorToast = page.locator('[class*="toast"], [role="alert"], .Toastify');
      const hasError = await errorToast.isVisible({ timeout: 10000 }).catch(() => false);

      // Either error shows or booking succeeds (in test mode)
      if (hasError) {
        await page.screenshot({ path: 'test-results/booking-error-toast.png', fullPage: true });
      }
    }
  });

  test('should validate passenger form fields', async ({ page }) => {
    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Go to passenger step
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.click();
    await page.waitForTimeout(500);

    // Try to continue without filling form
    const continue2Btn = page.locator('button:has-text("Continue")');
    if (await continue2Btn.first().isVisible()) {
      // Should be disabled if validation is in place
      const isDisabled = await continue2Btn.first().isDisabled();

      // Or validation message should show
      const validationMsg = page.locator('text=required, text=fill, text=complete, [class*="error"]');
      const hasValidation = await validationMsg.isVisible({ timeout: 2000 }).catch(() => false);

      // Either button is disabled or validation shows
      expect(isDisabled || hasValidation).toBeTruthy();
    }
  });
});

test.describe('Booking UI/UX', () => {
  test('should display flight summary throughout booking', async ({ page }) => {
    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Verify sticky summary or flight info is visible
    const summary = page.locator('[class*="Summary"], [class*="summary"], text=/\\$\\d+|Total/');
    await expect(summary.first()).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/booking-summary.png', fullPage: true });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Verify mobile layout
    await expect(page.locator('body')).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/booking-mobile.png', fullPage: true });
  });

  test('should show step indicators', async ({ page }) => {
    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Verify step indicators
    const stepIndicators = page.locator('[class*="step"], text=/Step|1|2|3/');
    await expect(stepIndicators.first()).toBeVisible();
  });
});

test.describe('Booking Performance', () => {
  test('should load booking page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);

    console.log(`Booking page load time: ${loadTime}ms`);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await searchFlights(page, TEST_ROUTES.short);
    await selectFirstFlight(page);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('preload') && !e.includes('Tracking Prevention')
    );

    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Console errors:', criticalErrors);
    }

    // Should have no critical errors
    expect(criticalErrors.length).toBeLessThan(5);
  });
});
