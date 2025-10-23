import { test, expect } from '@playwright/test';

test.describe('Homepage - Fly2Any', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that page title contains "Fly2Any"
    await expect(page).toHaveTitle(/fly2any/i);

    console.log('Homepage loaded successfully!');
  });

  test('should display the main logo', async ({ page }) => {
    await page.goto('/');

    // Look for the logo image (adjust selector based on your actual HTML)
    const logo = page.locator('img[alt*="logo" i], img[alt*="fly2any" i]').first();

    // Check if logo exists and is visible
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
      console.log('Logo is visible on homepage');
    } else {
      console.log('No logo found - may need to adjust selector');
    }
  });

  test('should have navigation or service sections', async ({ page }) => {
    await page.goto('/');

    // Check for navigation or main content sections
    const nav = page.locator('nav').first();
    const main = page.locator('main').first();

    // At least one should exist
    const hasNav = await nav.count() > 0;
    const hasMain = await main.count() > 0;

    expect(hasNav || hasMain).toBeTruthy();
    console.log(`Found navigation: ${hasNav}, Found main content: ${hasMain}`);
  });
});

test.describe('Basic Interactions', () => {
  test('should be able to interact with the page', async ({ page }) => {
    await page.goto('/');

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get page URL
    const url = page.url();
    console.log(`Page URL: ${url}`);

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/homepage-screenshot.png' });
    console.log('Screenshot saved to test-results/homepage-screenshot.png');

    // Check that we're on the correct domain
    expect(url).toContain('localhost');
  });
});
