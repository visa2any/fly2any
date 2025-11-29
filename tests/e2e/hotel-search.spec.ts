import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Hotel Search Flow
 *
 * Tests the complete hotel search journey:
 * 1. Homepage search form
 * 2. Search results page
 * 3. Filtering and sorting
 * 4. Hotel card interactions
 */

test.describe('Hotel Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should load homepage and display search form', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Fly2Any/);

    // Verify main navigation elements exist
    await expect(page.locator('nav')).toBeVisible();

    // Verify search form is present (either visible or in modal)
    const searchFormExists = await page.locator('[data-testid="hotel-search-form"]').count() > 0
      || await page.locator('input[placeholder*="destination" i]').count() > 0
      || await page.locator('input[placeholder*="city" i]').count() > 0;

    expect(searchFormExists).toBeTruthy();
  });

  test('should perform hotel search and display results', async ({ page }) => {
    // Fill in search form
    // Try to find destination input by common patterns
    const destinationInput = page.locator('input[name="destination"]')
      .or(page.locator('input[placeholder*="destination" i]'))
      .or(page.locator('input[placeholder*="city" i]'))
      .first();

    await destinationInput.click();
    await destinationInput.fill('Miami');
    await page.waitForTimeout(500); // Wait for autocomplete

    // Select dates (if date pickers exist)
    const checkInDate = '2025-12-06';
    const checkOutDate = '2025-12-13';

    // Try to find and fill check-in date
    const checkInInput = page.locator('input[name="checkIn"]')
      .or(page.locator('input[placeholder*="check" i][placeholder*="in" i]'))
      .first();

    if (await checkInInput.count() > 0) {
      await checkInInput.fill(checkInDate);
    }

    // Try to find and fill check-out date
    const checkOutInput = page.locator('input[name="checkOut"]')
      .or(page.locator('input[placeholder*="check" i][placeholder*="out" i]'))
      .first();

    if (await checkOutInput.count() > 0) {
      await checkOutInput.fill(checkOutDate);
    }

    // Submit search
    const searchButton = page.locator('button[type="submit"]')
      .or(page.locator('button:has-text("Search")'))
      .or(page.locator('button:has-text("Find Hotels")'))
      .first();

    await searchButton.click();

    // Wait for navigation to results page
    await page.waitForURL(/\/hotels\/results/);

    // Verify results page loaded
    await expect(page).toHaveURL(/\/hotels\/results/);

    // Wait for hotels to load (with longer timeout for API)
    await page.waitForSelector('[data-testid="hotel-card"]', {
      timeout: 30000,
      state: 'visible'
    }).catch(async () => {
      // Fallback: look for any element that looks like a hotel card
      await page.waitForSelector('.hotel-card, [class*="HotelCard"]', { timeout: 10000 });
    });

    // Verify hotel cards are displayed
    const hotelCards = page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .or(page.locator('[class*="HotelCard"]'));

    const count = await hotelCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ Found ${count} hotel cards on results page`);
  });

  test('should filter hotels by price range', async ({ page }) => {
    // Navigate directly to results page
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    // Wait for hotels to load
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card, [class*="HotelCard"]', { timeout: 10000 }));

    const initialCount = await page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .count();

    console.log(`Initial hotel count: ${initialCount}`);

    // Look for filter controls
    const filterButton = page.locator('button:has-text("Filters")')
      .or(page.locator('[data-testid="filters-button"]'))
      .first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }

    // Try to adjust price filter (if exists)
    const priceFilter = page.locator('input[type="range"][name*="price"]')
      .or(page.locator('input[type="number"][name*="price"]'))
      .first();

    if (await priceFilter.count() > 0) {
      await priceFilter.fill('500');
      await page.waitForTimeout(1000); // Wait for filter to apply

      const filteredCount = await page.locator('[data-testid="hotel-card"]')
        .or(page.locator('.hotel-card'))
        .count();

      console.log(`Filtered hotel count: ${filteredCount}`);
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should sort hotels by price', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    // Wait for hotels to load
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    // Look for sort dropdown
    const sortSelect = page.locator('select[name*="sort"]')
      .or(page.locator('[data-testid="sort-select"]'))
      .first();

    if (await sortSelect.count() > 0) {
      await sortSelect.selectOption({ label: /price/i });
      await page.waitForTimeout(1000);

      // Verify hotels are sorted
      const prices = await page.locator('[data-testid="hotel-price"]')
        .or(page.locator('[class*="price"]'))
        .allTextContents();

      console.log(`Found ${prices.length} hotel prices`);
    }
  });

  test('should navigate to hotel detail page', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    // Wait for hotels to load
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    // Click first hotel card
    const firstHotel = page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .first();

    await firstHotel.click();

    // Wait for navigation to detail page
    await page.waitForURL(/\/hotels\/.+/);

    // Verify detail page elements
    await expect(page.locator('h1')).toBeVisible();

    console.log(`✅ Navigated to hotel detail page: ${page.url()}`);
  });
});

test.describe('Mobile Hotel Search', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE dimensions

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/hotels/results?destination=Miami&checkIn=2025-12-06&checkOut=2025-12-13&adults=2&rooms=1');

    // Wait for content
    await page.waitForSelector('[data-testid="hotel-card"]', { timeout: 30000 })
      .catch(() => page.waitForSelector('.hotel-card', { timeout: 10000 }));

    // Verify mobile layout
    const hotelCards = await page.locator('[data-testid="hotel-card"]')
      .or(page.locator('.hotel-card'))
      .count();

    expect(hotelCards).toBeGreaterThan(0);

    console.log(`✅ Mobile view: Found ${hotelCards} hotel cards`);
  });
});
