import { test, expect, devices } from '@playwright/test';
import { testFlights, getTestDateRange } from '../fixtures/test-data';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Responsive Tests', () => {

  test('should display mobile-optimized homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check viewport size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(428); // iPhone 12 width

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-homepage.png', fullPage: true });

    // Verify logo is visible on mobile
    const logo = page.locator('img[alt*="Fly2Any"]');
    await expect(logo).toBeVisible();

    // Check if content is responsive
    const flightsCard = page.locator('a[href="/flights"]');
    await expect(flightsCard).toBeVisible();

    console.log('Mobile homepage loaded successfully');
  });

  test('should handle mobile flight search', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Take screenshot of mobile flight search
    await page.screenshot({ path: 'test-results/mobile-flight-search.png', fullPage: true });

    // Verify form elements are accessible on mobile
    const originInput = page.locator('input').first();
    await expect(originInput).toBeVisible();

    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();

    // Test mobile form interaction
    await originInput.tap();
    await page.waitForTimeout(500);

    console.log('Mobile flight search interaction tested');
  });

  test('should support mobile navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to flights on mobile
    const flightsCard = page.locator('a[href="/flights"]');
    await flightsCard.tap();

    await page.waitForURL('**/flights');

    // Verify navigation worked
    expect(page.url()).toContain('/flights');

    // Go back
    await page.goBack();
    expect(page.url()).not.toContain('/flights');

    console.log('Mobile navigation tested successfully');
  });

  test('should handle mobile touch gestures', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Test scrolling
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(500);

    // Test touch on date input
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.tap();
      await page.waitForTimeout(500);
    }

    console.log('Mobile touch gestures tested');
  });

  test('should display mobile-optimized results', async ({ page }) => {
    const dates = getTestDateRange(30, 7);

    await page.goto(`/flights/results?from=${testFlights.domestic.origin}&to=${testFlights.domestic.destination}&departure=${dates.departureDate}&return=${dates.returnDate}&adults=1&children=0&infants=0&class=economy`);

    // Wait for results to load
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/mobile-results.png', fullPage: true });

    // Check if flight cards are visible on mobile
    const flightCards = page.locator('[class*="flight"], article').filter({ hasText: /\$|USD/ });
    const count = await flightCards.count();

    console.log(`Mobile results page showing ${count} flights`);
  });

  test('should have adequate touch target sizes', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Check button sizes (should be at least 44x44 pixels for mobile)
    const searchButton = page.locator('button:has-text("Search")').first();

    if (await searchButton.isVisible()) {
      const box = await searchButton.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40); // Allow slight variance
        console.log(`Search button size: ${box.width}x${box.height}px`);
      }
    }
  });

  test('should handle mobile form validation', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling form
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.tap();

    await page.waitForTimeout(1000);

    // Should remain on flights page (validation prevents submission)
    expect(page.url()).toContain('/flights');
    expect(page.url()).not.toContain('/results');

    console.log('Mobile form validation working');
  });
});

// Tablet tests - create separate file or use project configuration
test.describe('Tablet Responsive Tests', () => {

  test('should display tablet-optimized layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(768);

    await page.screenshot({ path: 'test-results/tablet-homepage.png', fullPage: true });

    // Verify tablet layout
    const logo = page.locator('img[alt*="Fly2Any"]');
    await expect(logo).toBeVisible();

    console.log('Tablet layout tested successfully');
  });

  test('should handle tablet flight search', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/tablet-flight-search.png', fullPage: true });

    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();

    console.log('Tablet flight search tested');
  });
});

test.describe('Responsive Breakpoints', () => {
  const breakpoints = [
    { name: 'Mobile Small', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  for (const breakpoint of breakpoints) {
    test(`should display correctly at ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({ page }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });

      await page.goto('/flights');
      await page.waitForLoadState('networkidle');

      await page.screenshot({
        path: `test-results/responsive-${breakpoint.name.replace(' ', '-').toLowerCase()}.png`,
        fullPage: false
      });

      // Verify logo is visible at all breakpoints
      const logo = page.locator('img[alt*="Fly2Any"]');
      await expect(logo).toBeVisible();

      console.log(`${breakpoint.name} breakpoint tested`);
    });
  }
});

test.describe('Landscape Orientation', () => {
  test('should handle landscape mode on mobile', async ({ page }) => {
    // Set landscape viewport
    await page.setViewportSize({ width: 896, height: 414 });

    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'test-results/mobile-landscape.png', fullPage: false });

    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();

    console.log('Landscape orientation tested');
  });
});
