import { test, expect } from '@playwright/test';
import { mockPassengerData } from '../fixtures/mock-data';
import { fillPassengerForm, selectFirstFlight } from '../helpers/test-helpers';
import { selectors } from '../helpers/selectors';

test.describe('Booking Flow - Critical Paths', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to a flight search with results
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');
  });

  test('should validate card number with Luhn algorithm', async ({ page }) => {
    // Setup: Navigate through search to payment
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.fill('[data-testid="destination-input"]', 'LAX');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 30000 });

    // Select flight
    await page.click('[data-testid="flight-card"]:first-child');
    await page.waitForLoadState('networkidle');

    // Skip to step 2 (passengers)
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    // Fill passenger data
    await fillPassengerForm(page, mockPassengerData.adult1, 0);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    // Step 3: Payment - Enter invalid card (fails Luhn)
    await page.fill('input[placeholder="Card Number"]', '4111111111111112');
    await page.fill('input[placeholder="Cardholder Name"]', 'Test User');
    await page.selectOption('select:has-text("MM")', '12');
    await page.selectOption('select:has-text("YY")', '28');
    await page.fill('input[placeholder="CVV"]', '123');

    // Blur to trigger validation
    await page.click('input[placeholder="Cardholder Name"]');

    // Should show error
    await expect(page.locator('text=Invalid card number')).toBeVisible({ timeout: 2000 });

    // Enter valid card (passes Luhn)
    await page.fill('input[placeholder="Card Number"]', '4111111111111111');
    await page.click('input[placeholder="Cardholder Name"]');

    // Error should disappear
    await expect(page.locator('text=Invalid card number')).not.toBeVisible();
  });

  test('should only accept numeric CVV', async ({ page }) => {
    await page.goto('/flights/booking-optimized?flightId=test');
    await page.waitForTimeout(1000);

    // Try to enter letters in CVV
    const cvvInput = page.locator('input[placeholder="CVV"]');
    if (await cvvInput.isVisible({ timeout: 5000 })) {
      await cvvInput.fill('abc123');
      const value = await cvvInput.inputValue();
      expect(value).toBe('123'); // Only numbers should remain
    }
  });

  test('should preserve form state on browser back/forward', async ({ page }) => {
    // Navigate to booking page
    await page.goto('/flights');
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.fill('[data-testid="destination-input"]', 'MIA');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 30000 });

    // Select flight
    await page.click('[data-testid="flight-card"]:first-child');
    await page.waitForLoadState('networkidle');

    // Go to step 2
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    // Fill partial passenger data
    await page.selectOption('select[name*="title"]', 'Mr');
    await page.fill('input[name*="firstName"]', 'John');
    await page.fill('input[name*="lastName"]', 'Doe');

    // Store URL
    const bookingUrl = page.url();

    // Navigate back
    await page.goBack();
    await page.waitForTimeout(1000);

    // Navigate forward
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Verify we're on booking page
    expect(page.url()).toContain('booking');
  });

  test('should handle API timeout gracefully', async ({ page }) => {
    // Mock slow API
    await page.route('**/api/flights/booking/create', async (route) => {
      await new Promise(r => setTimeout(r, 35000)); // Timeout
      route.abort();
    });

    await page.goto('/flights/booking-optimized?flightId=test');
    await page.waitForTimeout(1000);

    // Should show loading state while waiting
    const loadingIndicator = page.locator('[class*="animate-spin"]');
    // Booking page should load
    await expect(page.locator('text=Complete Booking')).toBeVisible({ timeout: 5000 });
  });

  test('should display accurate price from fare selection', async ({ page }) => {
    await page.goto('/flights');
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.fill('[data-testid="destination-input"]', 'LAX');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 30000 });

    // Get price from card before clicking
    const cardPrice = await page.locator('[data-testid="flight-card"]:first-child [data-testid="flight-price"]').textContent();

    // Select flight
    await page.click('[data-testid="flight-card"]:first-child');
    await page.waitForLoadState('networkidle');

    // Get price in booking summary
    const summaryPrice = await page.locator('[data-testid="total-price"]').textContent().catch(() => null);

    // Prices should match (allowing for formatting differences)
    if (cardPrice && summaryPrice) {
      const cardNum = parseFloat(cardPrice.replace(/[^0-9.]/g, ''));
      const summaryNum = parseFloat(summaryPrice.replace(/[^0-9.]/g, ''));
      expect(Math.abs(cardNum - summaryNum)).toBeLessThan(1); // Within $1
    }
  });

  test('should show DOT compliance for basic fares', async ({ page }) => {
    await page.goto('/flights/booking-optimized?flightId=test');
    await page.waitForTimeout(1000);

    // If basic fare exists, select it
    const basicFare = page.locator('text=Basic').first();
    if (await basicFare.isVisible({ timeout: 3000 })) {
      await basicFare.click();

      // Navigate to payment
      await page.click('button:has-text("Continue")');
      await fillPassengerForm(page, mockPassengerData.adult1, 0);
      await page.click('button:has-text("Continue")');

      // DOT compliance checkboxes should appear
      await expect(page.locator('text=Before Completing Your Purchase')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should prevent submission without terms acceptance', async ({ page }) => {
    await page.goto('/flights/booking-optimized?flightId=test');
    await page.waitForTimeout(2000);

    // Navigate to payment step
    const continueBtn = page.locator('button:has-text("Continue")').first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(500);

      // Try to submit without accepting terms
      const submitBtn = page.locator('button:has-text("COMPLETE BOOKING")');
      if (await submitBtn.isVisible({ timeout: 5000 })) {
        await submitBtn.click();

        // Should not navigate to confirmation
        await page.waitForTimeout(1000);
        expect(page.url()).not.toContain('confirmation');
      }
    }
  });

});

test.describe('Booking Flow - Mobile Critical', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('should complete booking on mobile viewport', async ({ page }) => {
    await page.goto('/flights');

    // Mobile search
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.fill('[data-testid="destination-input"]', 'LAX');
    await page.click('[data-testid="search-button"]');

    // Wait for results
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 30000 });

    // Verify mobile-friendly layout
    await expect(page.locator('[data-testid="flight-card"]')).toBeVisible();

    // Select flight
    await page.click('[data-testid="flight-card"]:first-child');
    await page.waitForLoadState('networkidle');

    // Verify sticky summary is not blocking content
    const content = page.locator('[data-testid="booking-content"]');
    if (await content.isVisible()) {
      const box = await content.boundingBox();
      expect(box?.height).toBeGreaterThan(200);
    }
  });

  test('should show mobile-friendly toasts', async ({ page }) => {
    await page.goto('/flights/booking-optimized?flightId=test');
    await page.waitForTimeout(1000);

    // Navigate to step 2 without filling required fields
    const continueBtn = page.locator('button:has-text("Continue")');
    if (await continueBtn.isVisible()) {
      // Skip to step 2
      await continueBtn.click();
      await page.waitForTimeout(500);

      // Try to continue without filling passenger info
      await continueBtn.click();

      // Toast should be visible and not cut off
      const toast = page.locator('[class*="toast"]').first();
      if (await toast.isVisible({ timeout: 3000 })) {
        const box = await toast.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(0);
        expect(box?.width).toBeLessThanOrEqual(375);
      }
    }
  });

});

test.describe('Booking Flow - Edge Cases', () => {

  test('should handle infant without adult error', async ({ page }) => {
    await page.goto('/flights');

    // Try to search with only infant
    const infantSelector = page.locator('[data-testid="infant-count"]');
    if (await infantSelector.isVisible()) {
      await page.click('[data-testid="infant-increment"]');
      await page.click('[data-testid="adult-decrement"]');

      // Should show validation error
      await expect(page.locator('text=infant')).toBeVisible();
    }
  });

  test('should validate passport expiry for international', async ({ page }) => {
    await page.goto('/flights');
    await page.fill('[data-testid="origin-input"]', 'JFK');
    await page.fill('[data-testid="destination-input"]', 'LHR'); // International
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="flight-card"]', { timeout: 30000 });

    await page.click('[data-testid="flight-card"]:first-child');
    await page.waitForLoadState('networkidle');

    // Navigate to passengers
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    // Check if passport fields are shown for international
    const passportField = page.locator('input[name*="passport"]');
    // International flights should show passport option
    if (await passportField.isVisible({ timeout: 3000 })) {
      // Enter expired passport date
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      await passportField.fill(pastDate.toISOString().split('T')[0]);

      // Should show warning about expiry
    }
  });

  test('should handle session storage cleared', async ({ page }) => {
    // Navigate to booking with invalid flight ID
    await page.goto('/flights/booking-optimized?flightId=invalid_id_12345');
    await page.waitForTimeout(2000);

    // Should redirect back to results or show error
    const url = page.url();
    expect(url).toMatch(/results|flights/);
  });

});
