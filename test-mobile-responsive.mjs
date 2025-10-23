import { chromium } from 'playwright';

/**
 * Test FlightCardEnhanced mobile responsiveness
 * Tests critical viewports: 375px (iPhone SE), 414px (iPhone Pro Max), 768px (iPad), 1024px (Desktop)
 */

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14 Pro Max', width: 414, height: 896 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 768 },
  { name: 'Large Desktop', width: 1440, height: 900 },
];

async function testMobileResponsiveness() {
  console.log('🚀 Starting mobile responsiveness test for FlightCardEnhanced...\n');

  const browser = await chromium.launch({ headless: false });

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n📱 Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);

      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
      });

      const page = await context.newPage();

      // Navigate to flight results page
      await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departDate=2025-01-15&passengers=1&class=ECONOMY', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      console.log('  ✓ Page loaded');

      // Wait for flight cards to appear
      await page.waitForSelector('[data-testid="conversion-features"]', { timeout: 10000 });
      console.log('  ✓ Flight cards rendered');

      // Check for horizontal scrolling (should be NONE)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        console.log('  ❌ FAIL: Horizontal scrolling detected!');
      } else {
        console.log('  ✓ No horizontal scrolling');
      }

      // Check header visibility
      const headerVisible = await page.isVisible('.flex.items-center.justify-between.gap-2.px-3');
      console.log(`  ${headerVisible ? '✓' : '❌'} Card header visible`);

      // Check conversion features visibility
      const conversionFeaturesVisible = await page.isVisible('[data-testid="conversion-features"]');
      console.log(`  ${conversionFeaturesVisible ? '✓' : '❌'} Conversion features visible`);

      // Check footer buttons
      const detailsButtonVisible = await page.isVisible('button:has-text("Details")');
      const selectButtonVisible = await page.isVisible('button:has-text("Select")');
      console.log(`  ${detailsButtonVisible ? '✓' : '❌'} Details button visible`);
      console.log(`  ${selectButtonVisible ? '✓' : '❌'} Select button visible`);

      // Take screenshot
      const screenshotPath = `./test-results/mobile-responsive-${viewport.name.replace(/\s+/g, '-')}-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      console.log(`  📸 Screenshot saved: ${screenshotPath}`);

      // Test expanded view
      const firstCard = page.locator('button:has-text("Details")').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForTimeout(500);
        console.log('  ✓ Card expanded successfully');

        // Screenshot of expanded view
        const expandedScreenshotPath = `./test-results/mobile-responsive-expanded-${viewport.name.replace(/\s+/g, '-')}-${viewport.width}x${viewport.height}.png`;
        await page.screenshot({
          path: expandedScreenshotPath,
          fullPage: true,
        });
        console.log(`  📸 Expanded screenshot saved: ${expandedScreenshotPath}`);
      }

      await context.close();
    }

    console.log('\n✅ All viewport tests completed!');
    console.log('\n📊 Summary:');
    console.log('  - Tested 5 different viewport sizes');
    console.log('  - Checked for horizontal scrolling');
    console.log('  - Verified component visibility');
    console.log('  - Captured screenshots for visual review');
    console.log('\n📁 Screenshots saved in ./test-results/');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testMobileResponsiveness().catch(console.error);
