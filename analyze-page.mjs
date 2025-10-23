import { chromium } from '@playwright/test';

async function analyzePage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshot-initial.png', fullPage: false });

    // Get visible text
    const bodyText = await page.locator('body').textContent();
    console.log('\n=== Visible Text (first 2000 chars) ===');
    console.log(bodyText.substring(0, 2000));

    // Look for specific elements
    console.log('\n=== Looking for key elements ===');

    // Flight cards
    const flightCards = await page.locator('[class*="flight"], [class*="Flight"], [class*="card"], [class*="Card"]').count();
    console.log(`Flight-related elements: ${flightCards}`);

    // Deal Score
    const dealScoreElements = await page.locator('text=/deal score/i').count();
    console.log(`Deal Score elements: ${dealScoreElements}`);

    // Buttons
    const buttons = await page.locator('button').count();
    console.log(`Total buttons: ${buttons}`);

    // Get all button texts
    const buttonTexts = await page.locator('button').allTextContents();
    console.log('Button texts:', buttonTexts.slice(0, 10));

    // Check for loading states
    const loadingElements = await page.locator('text=/loading/i, [class*="loading"], [class*="spinner"]').count();
    console.log(`Loading indicators: ${loadingElements}`);

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Wait a bit longer and take another screenshot
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshot-after-wait.png', fullPage: true });

    console.log('\nScreenshots saved!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

analyzePage().catch(console.error);
