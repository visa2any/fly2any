import { test, expect } from '@playwright/test';

test.describe('Hotel Card Compact Layout', () => {
  test('should have compact hotel cards with h-40 image height', async ({ page }) => {
    // Navigate to hotel search results (allow extra time for initial compilation)
    await page.goto('http://localhost:3001/hotels/results?destination=New+York+City&checkIn=2025-12-03&checkOut=2025-12-10&adults=2&children=0&rooms=1&lat=40.7128&lng=-74.006', {
      timeout: 90000,
      waitUntil: 'networkidle'
    });

    // Wait for hotel cards to load
    await page.waitForSelector('[data-hotel-card]', { timeout: 60000 });

    // Get all hotel cards
    const hotelCards = page.locator('[data-hotel-card]');
    const count = await hotelCards.count();

    console.log(`Found ${count} hotel cards`);
    expect(count).toBeGreaterThan(0);

    // Check the first hotel card
    const firstCard = hotelCards.first();

    // Measure the image container height (should be h-40 = 160px)
    const imageContainer = firstCard.locator('.relative.w-full').first();
    const imageBox = await imageContainer.boundingBox();

    console.log('Image container height:', imageBox?.height);

    // h-40 in Tailwind = 160px (40 * 4px)
    expect(imageBox?.height).toBeLessThanOrEqual(165); // Allow 5px tolerance
    expect(imageBox?.height).toBeGreaterThanOrEqual(155);

    // Measure total card height (should be ~480px or less)
    const cardBox = await firstCard.boundingBox();
    console.log('Total card height:', cardBox?.height);

    // Card should be compact (around 480px or less)
    expect(cardBox?.height).toBeLessThan(500);

    // Verify key elements are still present (premium features)
    await expect(firstCard.locator('text=/\\$[0-9]+/')).toBeVisible(); // Price
    await expect(firstCard.locator('button').filter({ hasText: /Book Now|See Availability/ })).toBeVisible(); // CTA button

    // Check that at least 3 cards are visible in viewport (1080px height)
    const viewportHeight = page.viewportSize()?.height || 1080;
    const visibleCards = Math.floor(viewportHeight / (cardBox?.height || 480));

    console.log(`Viewport: ${viewportHeight}px, Card height: ${cardBox?.height}px, Visible cards: ${visibleCards}`);
    expect(visibleCards).toBeGreaterThanOrEqual(2); // At least 2-3 cards visible
  });

  test('should have reduced padding and margins', async ({ page }) => {
    await page.goto('http://localhost:3001/hotels/results?destination=New+York&checkIn=2025-12-03&checkOut=2025-12-10&adults=2', {
      timeout: 90000,
      waitUntil: 'networkidle'
    });

    await page.waitForSelector('[data-hotel-card]', { timeout: 60000 });

    const firstCard = page.locator('[data-hotel-card]').first();

    // Check content padding (should be p-3 = 12px)
    const contentSection = firstCard.locator('.flex-1.flex.flex-col').first();
    const paddingTop = await contentSection.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });

    console.log('Content padding-top:', paddingTop);
    expect(paddingTop).toBe('12px'); // p-3 = 0.75rem = 12px
  });

  test('should maintain all premium features', async ({ page }) => {
    await page.goto('http://localhost:3001/hotels/results?destination=New+York&checkIn=2025-12-03&checkOut=2025-12-10&adults=2', {
      timeout: 90000,
      waitUntil: 'networkidle'
    });

    await page.waitForSelector('[data-hotel-card]', { timeout: 60000 });

    const firstCard = page.locator('[data-hotel-card]').first();

    // Verify all premium elements are present
    const elements = [
      { selector: 'text=/\\$[0-9]+/', name: 'Price badge' },
      { selector: '[aria-label="Favorite"]', name: 'Favorite button' },
      { selector: 'text=/[0-9]+\\.[0-9]/', name: 'Rating' },
      { selector: 'button >> text=/Book|See/', name: 'CTA button' },
    ];

    for (const { selector, name } of elements) {
      const element = firstCard.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 5000 });
      console.log(`✓ ${name} is visible`);
    }
  });
});
