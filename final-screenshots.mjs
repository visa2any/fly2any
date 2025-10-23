import { chromium } from '@playwright/test';

async function captureFinalScreenshots() {
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

    // Screenshot 1: Deal Score badges on flight cards
    console.log('1. Capturing Deal Score badges on flight cards...');
    await page.screenshot({
      path: 'FINAL-1-deal-score-badges.png',
      fullPage: false
    });

    // Click Details button to expand
    console.log('2. Clicking Details button to expand flight...');
    const detailsButton = await page.locator('button:has-text("Details")').first();
    await detailsButton.click();
    await page.waitForTimeout(3000);

    // Screenshot 2: Baggage Calculator
    console.log('3. Capturing Baggage Calculator...');
    const baggageCalculator = page.locator('text=Baggage Calculator').first();
    await baggageCalculator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'FINAL-2-baggage-calculator.png',
      fullPage: false
    });

    // Scroll to Seat Map Preview
    console.log('4. Scrolling to Seat Map Preview...');
    const seatMapPreview = page.locator('text=Seat Map Preview').first();
    await seatMapPreview.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Screenshot 3: Seat Map Preview
    console.log('5. Capturing Seat Map Preview...');
    await page.screenshot({
      path: 'FINAL-3-seat-map-preview.png',
      fullPage: false
    });

    // Screenshot 4: Full expanded view
    console.log('6. Capturing full expanded flight details...');
    await page.screenshot({
      path: 'FINAL-4-full-expanded-view.png',
      fullPage: true
    });

    console.log('\n=== VERIFICATION SUMMARY ===');

    // Verify all features are present
    const dealScoreCount = await page.locator('text=/deal score/i').count();
    const baggageCalcCount = await page.locator('text=Baggage Calculator').count();
    const seatMapCount = await page.locator('text=Seat Map Preview').count();

    console.log(`✓ Deal Score badges found: ${dealScoreCount} instances`);
    console.log(`✓ Baggage Calculator found: ${baggageCalcCount > 0 ? 'YES' : 'NO'}`);
    console.log(`✓ Seat Map Preview found: ${seatMapCount > 0 ? 'YES' : 'NO'}`);

    console.log('\n✓ All screenshots saved successfully!');
    console.log('\nScreenshots created:');
    console.log('- FINAL-1-deal-score-badges.png');
    console.log('- FINAL-2-baggage-calculator.png');
    console.log('- FINAL-3-seat-map-preview.png');
    console.log('- FINAL-4-full-expanded-view.png');

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'FINAL-error.png' });
  } finally {
    await browser.close();
  }
}

captureFinalScreenshots().catch(console.error);
