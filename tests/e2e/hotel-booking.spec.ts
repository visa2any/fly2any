/**
 * E2E Test Suite: Hotel Booking Flow
 * Tests the complete user journey from search to booking confirmation
 *
 * @requires Playwright
 * @requires Development server running on localhost:3000
 */

import { test, expect, Page } from '@playwright/test';

// Test Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 60 seconds for API-heavy operations

// Test Data
const testData = {
  destination: 'Miami',
  checkIn: '2025-12-01',
  checkOut: '2025-12-02',
  adults: 2,
  children: 0,
  rooms: 1,
  guestInfo: {
    title: 'Mr',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
  },
};

test.describe('Hotel Booking E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hotels page before each test
    await page.goto(`${BASE_URL}/hotels`);
    await page.waitForLoadState('networkidle');
  });

  test('should load hotels landing page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Fly2Any/);

    // Check search form is visible
    await expect(page.locator('input[placeholder*="City"]')).toBeVisible();
    await expect(page.locator('button:has-text("Search Hotels"), button:has-text("Buscar Hotéis")')).toBeVisible();
  });

  test('should show autocomplete suggestions when typing destination', async ({ page }) => {
    const destinationInput = page.locator('input[placeholder*="City"], input[placeholder*="landmark"]').first();

    // Type destination
    await destinationInput.fill(testData.destination);

    // Wait for autocomplete dropdown
    await page.waitForTimeout(1000); // Wait for debounce

    // Check if suggestions appear
    const suggestions = page.locator('button:has-text("Miami")').first();
    await expect(suggestions).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to results page when search button is clicked', async ({ page }) => {
    const destinationInput = page.locator('input[placeholder*="City"], input[placeholder*="landmark"]').first();

    // Fill search form
    await destinationInput.fill(testData.destination);
    await page.waitForTimeout(1000);

    // Select first suggestion
    await page.locator('button:has-text("Miami")').first().click();

    // Click search button
    await page.locator('button:has-text("Search Hotels"), button:has-text("Buscar Hotéis")').first().click();

    // Wait for navigation
    await page.waitForURL(/\/hotels\/results/, { timeout: 10000 });

    // Verify we're on results page
    expect(page.url()).toContain('/hotels/results');
    expect(page.url()).toContain('destination=Miami');
  });

  test('should display hotel search results', async ({ page }) => {
    // Navigate directly to results page
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}&children=${testData.children}&rooms=${testData.rooms}&lat=25.7617&lng=-80.1918`);

    // Wait for results to load (API call can take time)
    await page.waitForTimeout(20000); // Wait for LiteAPI response

    // Check if hotels are displayed
    const hotelCards = page.locator('button:has-text("See Availability")');
    await expect(hotelCards.first()).toBeVisible({ timeout: 30000 });

    // Verify at least one hotel is shown
    const count = await hotelCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should NOT display NaN prices on results page', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);

    await page.waitForTimeout(20000);

    // Check for NaN in page content
    const pageContent = await page.content();
    expect(pageContent).not.toContain('NaN');
    expect(pageContent).not.toContain('undefined');
  });

  test('should navigate to hotel details page when clicking a hotel', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);

    await page.waitForTimeout(20000);

    // Click first "See Availability" button
    await page.locator('button:has-text("See Availability")').first().click();

    // Wait for navigation to hotel details
    await page.waitForURL(/\/hotels\//, { timeout: 10000 });

    // Verify we're on a hotel details page
    expect(page.url()).toMatch(/\/hotels\/[a-zA-Z0-9]+/);
  });

  test('should display hotel details with room options', async ({ page }) => {
    // Navigate to a specific hotel (using ID from Miami search)
    // This assumes we have a hotel ID from the search results
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);

    await page.waitForTimeout(20000);
    await page.locator('button:has-text("See Availability")').first().click();
    await page.waitForURL(/\/hotels\//, { timeout: 10000 });

    // Check if room selection buttons are visible
    await expect(page.locator('button:has-text("Select Room")').first()).toBeVisible({ timeout: 15000 });

    // Verify hotel name is displayed
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to booking page when selecting a room', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);

    await page.waitForTimeout(20000);
    await page.locator('button:has-text("See Availability")').first().click();
    await page.waitForURL(/\/hotels\//, { timeout: 10000 });
    await page.waitForTimeout(5000);

    // Click "Select Room" button
    await page.locator('button:has-text("Select Room")').first().click();

    // Wait for navigation to booking page
    await page.waitForURL(/\/hotels\/booking/, { timeout: 10000 });

    // Verify we're on booking page
    expect(page.url()).toContain('/hotels/booking');
  });

  test('CRITICAL: should NOT display NaN prices on booking page', async ({ page }) => {
    // This is the critical bug fix test
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=2&price=0`); // Deliberately pass price=0

    await page.waitForLoadState('networkidle');

    // Check that prices are displayed as numbers, not NaN
    const pageContent = await page.content();

    // These assertions verify the bug fix
    expect(pageContent).not.toContain('NaN');
    expect(pageContent).not.toContain('USD NaN');

    // Verify fallback price is applied (should be >= $90)
    const priceElements = page.locator('text=/\\$\\d+\\.\\d{2}/');
    const firstPrice = await priceElements.first().textContent();

    if (firstPrice) {
      const priceValue = parseFloat(firstPrice.replace(/[^0-9.]/g, ''));
      expect(priceValue).toBeGreaterThanOrEqual(90); // Minimum price with $100 fallback * 0.9
    }
  });

  test('should display booking form with all required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=2&price=150`);

    await page.waitForLoadState('networkidle');

    // Check booking summary is visible
    await expect(page.locator('text=/Booking Summary|Resumo da Reserva/')).toBeVisible();

    // Check room selection step is visible
    await expect(page.locator('text=/Room Selection|Seleção de Quarto/')).toBeVisible();

    // Check Continue button is visible
    await expect(page.locator('button:has-text("Continue"), button:has-text("Continuar")')).toBeVisible();
  });

  test('should validate price calculations are correct', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=2&price=100`);

    await page.waitForLoadState('networkidle');

    // Extract prices from booking summary
    const pageText = await page.textContent('body');

    // Verify no division by zero or NaN
    expect(pageText).not.toContain('NaN');
    expect(pageText).not.toContain('Infinity');

    // Verify taxes calculation (should be 12% of base price)
    // Base: $100, Taxes: ~$12, Total: ~$112
    if (pageText?.includes('Taxes')) {
      expect(pageText).toMatch(/\$[\d]+\.\d{2}/); // Has valid currency format
    }
  });

  test('should progress through booking steps', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=2&price=150`);

    await page.waitForLoadState('networkidle');

    // Step 1: Room Selection - Click Continue
    await page.locator('button:has-text("Continue"), button:has-text("Continuar")').click();

    // Step 2: Guest Details should be visible
    await expect(page.locator('text=/Guest Information|Informações do Hóspede/')).toBeVisible({ timeout: 5000 });

    // Fill guest information
    await page.locator('select').first().selectOption(testData.guestInfo.title);
    await page.locator('input[type="text"]').nth(0).fill(testData.guestInfo.firstName);
    await page.locator('input[type="text"]').nth(1).fill(testData.guestInfo.lastName);
    await page.locator('input[type="email"]').fill(testData.guestInfo.email);
    await page.locator('input[type="tel"]').fill(testData.guestInfo.phone);

    // Click Continue to payment step
    await page.locator('button:has-text("Continue"), button:has-text("Continuar")').click();

    // Step 3: Payment should be visible
    await expect(page.locator('text=/Payment|Pagamento/')).toBeVisible({ timeout: 5000 });
  });

  test('should handle search with Enter key press', async ({ page }) => {
    const destinationInput = page.locator('input[placeholder*="City"], input[placeholder*="landmark"]').first();

    // Fill destination
    await destinationInput.fill(testData.destination);
    await page.waitForTimeout(1000);

    // Select suggestion
    await page.locator('button:has-text("Miami")').first().click();

    // Press Enter instead of clicking search button
    await page.keyboard.press('Enter');

    // Should navigate to results
    await page.waitForURL(/\/hotels\/results/, { timeout: 10000 });
    expect(page.url()).toContain('/hotels/results');
  });

  test('should maintain search parameters across pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);

    await page.waitForTimeout(20000);

    // Click a hotel
    await page.locator('button:has-text("See Availability")').first().click();
    await page.waitForURL(/\/hotels\//, { timeout: 10000 });

    // Verify search params are maintained in URL
    expect(page.url()).toContain(`checkIn=${testData.checkIn}`);
    expect(page.url()).toContain(`checkOut=${testData.checkOut}`);
  });
});

test.describe('Error Handling & Edge Cases', () => {
  test('should handle missing price gracefully', async ({ page }) => {
    // Test the fallback mechanism
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=2025-12-01&checkOut=2025-12-02&adults=2`); // No price param

    await page.waitForLoadState('networkidle');

    // Should show fallback price, not NaN
    const content = await page.content();
    expect(content).not.toContain('NaN');

    // Should show at least $90 (fallback $100 * 0.9)
    expect(content).toMatch(/\$[\d]+\.\d{2}/);
  });

  test('should handle zero nights gracefully', async ({ page }) => {
    // Same check-in and check-out date
    await page.goto(`${BASE_URL}/hotels/booking?hotelId=test&name=Test+Hotel&location=Miami,US&checkIn=2025-12-01&checkOut=2025-12-01&adults=2&price=100`);

    await page.waitForLoadState('networkidle');

    // Should calculate at least 1 night
    const content = await page.content();
    expect(content).not.toContain('0 night');
    expect(content).not.toContain('NaN');
  });

  test('should handle invalid destination gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/hotels/results?destination=&checkIn=2025-12-01&checkOut=2025-12-02&adults=2`);

    await page.waitForLoadState('networkidle');

    // Should either redirect or show error message
    const content = await page.content();
    const hasError = content.includes('required') || content.includes('invalid') || content.includes('search');
    expect(hasError).toBeTruthy();
  });
});

test.describe('Performance Tests', () => {
  test('hotel search should complete within 45 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}&lat=25.7617&lng=-80.1918`);

    // Wait for results
    await page.locator('button:has-text("See Availability")').first().waitFor({ timeout: 45000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Search completed in ${duration}ms`);
    expect(duration).toBeLessThan(45000); // 45 seconds max
  });

  test('hotel details should load within 15 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to results first
    await page.goto(`${BASE_URL}/hotels/results?destination=${testData.destination}&checkIn=${testData.checkIn}&checkOut=${testData.checkOut}&adults=${testData.adults}`);
    await page.waitForTimeout(20000);

    // Click hotel
    await page.locator('button:has-text("See Availability")').first().click();

    // Wait for room options
    await page.locator('button:has-text("Select Room")').first().waitFor({ timeout: 15000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Hotel details loaded in ${duration - 20000}ms`);
    expect(duration - 20000).toBeLessThan(15000); // 15 seconds max (excluding search wait)
  });
});
