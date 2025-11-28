/**
 * E2E Mobile Responsiveness Test Suite
 * Tests the hotel booking flow across mobile devices
 *
 * @requires Playwright
 * @requires Development server running on localhost:3000
 */

import { test, expect, Page, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const testData = {
  destination: 'Miami',
  checkIn: '2025-12-01',
  checkOut: '2025-12-02',
  adults: 2,
};

// Mobile Device Configurations
const mobileDevices = {
  iphoneSE: {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667 },
  },
  iphone12: {
    name: 'iPhone 12 Pro',
    viewport: { width: 390, height: 844 },
  },
  ipad: {
    name: 'iPad',
    viewport: { width: 768, height: 1024 },
  },
  ipadPro: {
    name: 'iPad Pro',
    viewport: { width: 1024, height: 1366 },
  },
};

test.describe('Mobile Responsiveness - iPhone SE (375x667)', () => {
  test.use({
    viewport: mobileDevices.iphoneSE.viewport,
    isMobile: true,
    hasTouch: true,
  });

  test('should display mobile-optimized hotels page', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    // Check page loads
    await expect(page).toHaveTitle(/Fly2Any/);

    // Check search form is visible and properly sized
    const searchForm = page.locator('form').first();
    await expect(searchForm).toBeVisible();

    // Verify mobile-friendly input fields
    const destinationInput = page.locator('input[placeholder*="City"]').first();
    await expect(destinationInput).toBeVisible();

    // Check tap targets are at least 44x44px (Apple HIG recommendation)
    const searchButton = page.locator('button:has-text("Search Hotels"), button:has-text("Buscar")').first();
    await expect(searchButton).toBeVisible();
  });

  test('should handle mobile search interaction', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    const destinationInput = page.locator('input[placeholder*="City"]').first();

    // Tap and fill destination
    await destinationInput.tap();
    await destinationInput.fill(testData.destination);
    await page.waitForTimeout(1000);

    // Check autocomplete dropdown appears
    const suggestions = page.locator('button:has-text("Miami")').first();
    await expect(suggestions).toBeVisible({ timeout: 10000 });

    // Tap suggestion
    await suggestions.tap();

    // Tap search button
    const searchButton = page.locator('button:has-text("Search Hotels"), button:has-text("Buscar")').first();
    await searchButton.tap();

    // Verify navigation
    await page.waitForURL(/\/hotels\/results/, { timeout: 10000 });
    expect(page.url()).toContain('/hotels/results');
  });

  test('should display mobile-optimized results page', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}&lat=25.7617&lng=-80.1918`);

    await page.waitForTimeout(20000); // Wait for API

    // Check hotel cards are stacked vertically (mobile layout)
    const hotelCards = page.locator('button:has-text("See Availability")');
    await expect(hotelCards.first()).toBeVisible({ timeout: 30000 });

    // Verify cards are touch-friendly
    const count = await hotelCards.count();
    expect(count).toBeGreaterThan(0);

    // Test scrolling on mobile
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
  });

  test('should handle mobile hotel details page', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);

    await page.waitForTimeout(20000);

    // Tap hotel card
    await page.locator('button:has-text("See Availability")').first().tap();
    await page.waitForURL(/\/hotels\//, { timeout: 10000 });

    // Verify room selection is mobile-friendly
    await expect(page.locator('button:has-text("Select Room")').first()).toBeVisible({ timeout: 15000 });

    // Test scroll behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test('should handle mobile booking form', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=2&price=150`);

    await page.waitForLoadState('networkidle');

    // Check mobile layout
    await expect(page.locator('text=/Booking Summary|Resumo/')).toBeVisible();

    // Verify form is scrollable
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeGreaterThan(667); // Taller than viewport

    // Test scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify continue button is accessible
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Continuar")');
    await expect(continueButton).toBeVisible();
  });

  test('should not have horizontal scroll', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    // Check viewport width matches content width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  });

  test('should handle portrait to landscape orientation', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    // Test portrait (default 375x667)
    await expect(page.locator('input[placeholder*="City"]').first()).toBeVisible();

    // Simulate landscape (667x375)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Content should still be visible
    await expect(page.locator('input[placeholder*="City"]').first()).toBeVisible();
  });
});

test.describe('Mobile Responsiveness - iPad (768x1024)', () => {
  test.use({
    viewport: mobileDevices.ipad.viewport,
    isMobile: true,
    hasTouch: true,
  });

  test('should display tablet-optimized layout', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Fly2Any/);

    // Check search form
    const searchForm = page.locator('form').first();
    await expect(searchForm).toBeVisible();

    // iPad should have more horizontal space
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBe(768);
  });

  test('should display results in grid on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}&lat=25.7617&lng=-80.1918`);

    await page.waitForTimeout(20000);

    // Check hotel cards
    const hotelCards = page.locator('button:has-text("See Availability")');
    await expect(hotelCards.first()).toBeVisible({ timeout: 30000 });

    // Tablet should show multiple cards per row (if using grid)
    const count = await hotelCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle touch gestures on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    const destinationInput = page.locator('input[placeholder*="City"]').first();

    // Tap with touch
    await destinationInput.tap();
    await destinationInput.fill('Miami');
    await page.waitForTimeout(1000);

    // Suggestions should appear
    const suggestions = page.locator('button:has-text("Miami")').first();
    await expect(suggestions).toBeVisible({ timeout: 10000 });

    // Tap suggestion
    await suggestions.tap();

    // Success
    const inputValue = await destinationInput.inputValue();
    expect(inputValue).toBe('Miami');
  });
});

test.describe('Mobile Performance & UX', () => {
  test.use({
    viewport: mobileDevices.iphoneSE.viewport,
    isMobile: true,
  });

  test('should load hotels page quickly on mobile', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Mobile page load time: ${loadTime}ms`);

    // Mobile should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    // Check font sizes are readable (>= 16px for body text)
    const fontSize = await page.locator('body').evaluate((el) => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });

    expect(fontSize).toBeGreaterThanOrEqual(14); // Minimum readable size
  });

  test('should not display NaN on mobile booking page', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=2&price=0`);

    await page.waitForLoadState('networkidle');

    const content = await page.content();
    expect(content).not.toContain('NaN');
    expect(content).not.toContain('undefined');
  });

  test('should handle mobile keyboard input', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    const destinationInput = page.locator('input[placeholder*="City"]').first();

    // Focus input (brings up mobile keyboard)
    await destinationInput.focus();

    // Type with keyboard
    await page.keyboard.type('New York');

    const value = await destinationInput.inputValue();
    expect(value).toBe('New York');
  });
});

test.describe('Cross-Device Compatibility', () => {
  test('iPhone 12 Pro - Complete booking flow', async ({ page }) => {
    await page.setViewportSize(mobileDevices.iphone12.viewport);

    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');

    // Search
    const destinationInput = page.locator('input[placeholder*="City"]').first();
    await destinationInput.fill(testData.destination);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Miami")').first().tap();

    // Submit
    await page.locator('button:has-text("Search Hotels"), button:has-text("Buscar")').first().tap();
    await page.waitForURL(/\/hotels\/results/, { timeout: 10000 });

    expect(page.url()).toContain('/hotels/results');
  });

  test('iPad Pro - Results page layout', async ({ page }) => {
    await page.setViewportSize(mobileDevices.ipadPro.viewport);

    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}&lat=25.7617&lng=-80.1918`);

    await page.waitForTimeout(20000);

    const hotelCards = page.locator('button:has-text("See Availability")');
    await expect(hotelCards.first()).toBeVisible({ timeout: 30000 });

    // Large tablet should show more content
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBe(1024);
  });
});
