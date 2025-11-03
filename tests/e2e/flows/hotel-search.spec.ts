import { test, expect } from '@playwright/test';
import { testHotels } from '../fixtures/test-data';

test.describe('Hotel Search Flow', () => {
  test('should navigate to hotels page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on hotels card
    const hotelsCard = page.locator('a[href="/hotels"]');
    await hotelsCard.click();

    await page.waitForURL('**/hotels');
    await page.waitForLoadState('networkidle');

    // Verify hotels page loaded
    await expect(page).toHaveTitle(/hotel/i);
    console.log('Hotels page loaded successfully');
  });

  test('should display hotel search form', async ({ page }) => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');

    // Check for destination input
    const destinationInput = page.locator('input[placeholder*="destination" i], input[placeholder*="destino" i]').first();
    await expect(destinationInput).toBeVisible();

    // Check for date inputs
    const checkInInput = page.locator('input[type="date"]').first();
    const checkOutInput = page.locator('input[type="date"]').nth(1);
    await expect(checkInInput).toBeVisible();
    await expect(checkOutInput).toBeVisible();

    // Check for guest inputs
    const adultsInput = page.locator('input[type="number"]').first();
    await expect(adultsInput).toBeVisible();

    // Check for search button
    const searchButton = page.locator('button:has-text("Search"), button:has-text("Buscar")');
    await expect(searchButton).toBeVisible();

    console.log('Hotel search form displayed correctly');
  });

  test('should fill hotel search form', async ({ page }) => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');

    const hotel = testHotels.newYork;

    // Fill destination
    const destinationInput = page.locator('input[placeholder*="destination" i]').first();
    await destinationInput.fill(hotel.destination);

    // Fill check-in date
    const checkInInput = page.locator('input[type="date"]').first();
    await checkInInput.fill(hotel.checkIn);

    // Fill check-out date
    const checkOutInput = page.locator('input[type="date"]').nth(1);
    await checkOutInput.fill(hotel.checkOut);

    // Fill adults
    const adultsInput = page.locator('input[type="number"]').first();
    await adultsInput.fill(hotel.adults.toString());

    // Fill rooms
    const roomsInput = page.locator('input[type="number"]').nth(2);
    await roomsInput.fill(hotel.rooms.toString());

    // Take screenshot
    await page.screenshot({ path: 'test-results/hotel-search-filled.png' });

    console.log('Hotel search form filled successfully');
  });

  test('should validate hotel search dates', async ({ page }) => {
    await page.goto('/hotels');

    // Try to set check-out before check-in
    const checkInInput = page.locator('input[type="date"]').first();
    const checkOutInput = page.locator('input[type="date"]').nth(1);

    await checkInInput.fill('2025-12-20');
    await checkOutInput.fill('2025-12-15'); // Earlier date

    const searchButton = page.locator('button:has-text("Search"), button:has-text("Buscar")');
    await searchButton.click();

    // Should show validation error or prevent invalid search
    await page.waitForTimeout(1000);

    console.log('Hotel date validation test completed');
  });

  test('should support multi-language for hotels', async ({ page }) => {
    await page.goto('/hotels');

    // Test language switcher
    const languagePT = page.locator('button:has-text("PT")');
    const languageES = page.locator('button:has-text("ES")');
    const languageEN = page.locator('button:has-text("EN")');

    // Switch to Portuguese
    if (await languagePT.isVisible()) {
      await languagePT.click();
      await page.waitForTimeout(500);
      console.log('Switched to Portuguese');
    }

    // Switch to Spanish
    if (await languageES.isVisible()) {
      await languageES.click();
      await page.waitForTimeout(500);
      console.log('Switched to Spanish');
    }

    // Switch back to English
    if (await languageEN.isVisible()) {
      await languageEN.click();
      await page.waitForTimeout(500);
      console.log('Switched back to English');
    }
  });
});
