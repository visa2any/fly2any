import { chromium } from '@playwright/test';

async function captureExpandedDetails() {
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

    console.log('Taking screenshot of initial state with Deal Scores visible...');
    await page.screenshot({
      path: 'screenshot-1-deal-scores.png',
      fullPage: false
    });

    // Find and click the first Details button
    console.log('Looking for Details button...');
    const detailsButton = await page.locator('button:has-text("Details")').first();

    if (await detailsButton.count() > 0) {
      console.log('Clicking Details button...');
      await detailsButton.click();
      await page.waitForTimeout(3000);

      console.log('Taking screenshot of expanded flight details...');
      await page.screenshot({
        path: 'screenshot-2-expanded-details.png',
        fullPage: false
      });

      // Scroll down to see more content
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'screenshot-3-expanded-scrolled.png',
        fullPage: false
      });

      // Get the expanded section HTML to analyze
      const expandedContent = await page.locator('[class*="expand"], [class*="detail"]').first().textContent();
      console.log('\n=== Expanded Content (first 1000 chars) ===');
      console.log(expandedContent?.substring(0, 1000) || 'No expanded content found');

      // Look for specific features
      console.log('\n=== Checking for Features ===');

      const baggageText = await page.locator('text=/baggage/i').count();
      console.log(`Baggage mentions: ${baggageText}`);

      const calculatorText = await page.locator('text=/calculator/i').count();
      console.log(`Calculator mentions: ${calculatorText}`);

      const seatText = await page.locator('text=/seat/i').count();
      console.log(`Seat mentions: ${seatText}`);

      const mapText = await page.locator('text=/map/i').count();
      console.log(`Map mentions: ${mapText}`);

      // Try to find and screenshot specific sections if they exist
      const baggageSection = page.locator('text=/baggage fee calculator/i').first();
      if (await baggageSection.count() > 0) {
        console.log('Found Baggage Fee Calculator - taking screenshot...');
        const baggageElement = await baggageSection.locator('..').first();
        await baggageElement.screenshot({ path: 'screenshot-4-baggage-calculator.png' });
      }

      const seatMapSection = page.locator('text=/seat map/i').first();
      if (await seatMapSection.count() > 0) {
        console.log('Found Seat Map Preview - taking screenshot...');
        const seatElement = await seatMapSection.locator('..').first();
        await seatElement.screenshot({ path: 'screenshot-5-seat-map.png' });
      }

      // Take full page screenshot to capture everything
      console.log('Taking full page screenshot...');
      await page.screenshot({
        path: 'screenshot-6-full-page-expanded.png',
        fullPage: true
      });

    } else {
      console.log('No Details button found!');
    }

    console.log('\nAll screenshots saved successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'screenshot-error.png' });
  } finally {
    await browser.close();
  }
}

captureExpandedDetails().catch(console.error);
