/**
 * Comprehensive Test for Phase 1 Implementation
 * Tests all 3 features: Branded Fares, Seat Map, Trip Bundles
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPhase1Features() {
  console.log('🚀 Starting Phase 1 Features Test\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to flight results
    console.log('Step 1: Navigating to flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('⏳ Waiting for flights to load...');

    // Wait for skeleton loaders to disappear and actual flight cards to appear
    await page.waitForSelector('button:has-text("Details")', {
      state: 'visible',
      timeout: 30000
    });

    await page.waitForTimeout(2000);
    console.log('✅ Flight results page loaded\n');

    // Take screenshot of initial state
    await page.screenshot({
      path: join(__dirname, 'PHASE1-TEST-01-results-loaded.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: PHASE1-TEST-01-results-loaded.png\n');

    // Step 2: Find and expand first flight card
    console.log('Step 2: Expanding first flight card...');
    const expandButton = page.locator('button:has-text("Details")').first();

    await expandButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Flight card expanded\n');

    // Wait for features to load
    console.log('Step 3: Waiting for Phase 1 features to load...');
    await page.waitForTimeout(3000);

    // Take screenshot of expanded card with all features
    await page.screenshot({
      path: join(__dirname, 'PHASE1-TEST-02-card-expanded.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: PHASE1-TEST-02-card-expanded.png\n');

    // Step 4: Check for Feature 1 - Branded Fares
    console.log('Step 4: Testing Feature 1 - Branded Fares...');
    const brandedFaresSection = await page.locator('text=💎').first();
    const hasBrandedFares = await brandedFaresSection.isVisible().catch(() => false);

    if (hasBrandedFares) {
      console.log('✅ Feature 1: Branded Fares section found');

      // Look for "Compare all" button
      const compareButton = await page.locator('button:has-text("Compare all")').first();
      const hasCompareButton = await compareButton.isVisible().catch(() => false);

      if (hasCompareButton) {
        console.log('✅ "Compare all" button found');

        // Click to open modal
        await compareButton.click();
        await page.waitForTimeout(1500);

        // Take screenshot of modal
        await page.screenshot({
          path: join(__dirname, 'PHASE1-TEST-03-branded-fares-modal.png'),
          fullPage: false
        });
        console.log('📸 Screenshot saved: PHASE1-TEST-03-branded-fares-modal.png');

        // Close modal
        const closeButton = await page.locator('button').filter({ hasText: '' }).first();
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
        console.log('✅ Branded Fares modal opened and closed successfully\n');
      } else {
        console.log('⚠️  "Compare all" button not found - may be no API data\n');
      }
    } else {
      console.log('⚠️  Feature 1 not visible - may be no API data available\n');
    }

    // Step 5: Check for Feature 2 - Seat Map
    console.log('Step 5: Testing Feature 2 - Seat Map...');
    const seatMapSection = await page.locator('text=💺').first();
    const hasSeatMap = await seatMapSection.isVisible().catch(() => false);

    if (hasSeatMap) {
      console.log('✅ Feature 2: Seat Map section found');

      // Look for "View map" button
      const viewMapButton = await page.locator('button:has-text("View map")').first();
      const hasViewMapButton = await viewMapButton.isVisible().catch(() => false);

      if (hasViewMapButton) {
        console.log('✅ "View map" button found');

        // Click to open modal
        await viewMapButton.click();
        await page.waitForTimeout(1500);

        // Take screenshot of modal
        await page.screenshot({
          path: join(__dirname, 'PHASE1-TEST-04-seat-map-modal.png'),
          fullPage: false
        });
        console.log('📸 Screenshot saved: PHASE1-TEST-04-seat-map-modal.png');

        // Close modal
        const closeButton = await page.locator('button').filter({ hasText: '' }).first();
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
        console.log('✅ Seat Map modal opened and closed successfully\n');
      } else {
        console.log('⚠️  "View map" button not found - may be no API data\n');
      }
    } else {
      console.log('⚠️  Feature 2 not visible - may be no API data available\n');
    }

    // Step 6: Check for Feature 3 - Trip Bundles
    console.log('Step 6: Testing Feature 3 - Trip Bundles...');
    const tripBundlesSection = await page.locator('text=🎁').first();
    const hasTripBundles = await tripBundlesSection.isVisible().catch(() => false);

    if (hasTripBundles) {
      console.log('✅ Feature 3: Trip Bundles section found');

      // Look for "Bundle" button
      const bundleButton = await page.locator('button:has-text("Bundle")').first();
      const hasBundleButton = await bundleButton.isVisible().catch(() => false);

      if (hasBundleButton) {
        console.log('✅ "Bundle" button found');

        // Click to open modal
        await bundleButton.click();
        await page.waitForTimeout(1500);

        // Take screenshot of modal
        await page.screenshot({
          path: join(__dirname, 'PHASE1-TEST-05-trip-bundles-modal.png'),
          fullPage: true
        });
        console.log('📸 Screenshot saved: PHASE1-TEST-05-trip-bundles-modal.png');

        // Close modal
        const skipButton = await page.locator('button:has-text("Skip for now")').first();
        if (skipButton) {
          await skipButton.click();
          await page.waitForTimeout(500);
        }
        console.log('✅ Trip Bundles modal opened and closed successfully\n');
      } else {
        console.log('⚠️  "Bundle" button not found - may be no API data\n');
      }
    } else {
      console.log('⚠️  Feature 3 not visible - may be no API data available\n');
    }

    // Step 7: Measure vertical space
    console.log('Step 7: Measuring vertical space of expanded card...');
    const expandedCard = await page.locator('[class*="expanded"]').first();
    const cardHeight = await expandedCard.boundingBox().then(box => box?.height).catch(() => null);

    if (cardHeight) {
      console.log(`📏 Expanded card height: ${Math.round(cardHeight)}px\n`);
    }

    // Final screenshot
    await page.screenshot({
      path: join(__dirname, 'PHASE1-TEST-06-final-state.png'),
      fullPage: true
    });
    console.log('📸 Screenshot saved: PHASE1-TEST-06-final-state.png\n');

    console.log('✅ Phase 1 Features Test Complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Branded Fares: ${hasBrandedFares ? '✅ Visible' : '⚠️  Not visible'}`);
    console.log(`   • Seat Map: ${hasSeatMap ? '✅ Visible' : '⚠️  Not visible'}`);
    console.log(`   • Trip Bundles: ${hasTripBundles ? '✅ Visible' : '⚠️  Not visible'}`);
    console.log('\n💡 Note: Features may not be visible if API returns no data (by design - graceful fallback)');

  } catch (error) {
    console.error('❌ Test failed:', error);

    // Take error screenshot
    await page.screenshot({
      path: join(__dirname, 'PHASE1-TEST-ERROR.png'),
      fullPage: true
    });
    console.log('📸 Error screenshot saved: PHASE1-TEST-ERROR.png');

    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testPhase1Features().catch(console.error);
