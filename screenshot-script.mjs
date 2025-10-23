import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshots() {
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

    console.log('Waiting for page to load...');
    await page.waitForTimeout(3000);

    // Screenshot 1: Full page with flight cards and Deal Score badges
    console.log('Taking screenshot 1: Flight cards overview...');
    await page.screenshot({
      path: join(__dirname, 'screenshot-flight-cards.png'),
      fullPage: false
    });

    // Try to find and click the first flight card to expand it
    console.log('Looking for expandable flight card...');
    const expandButtons = await page.locator('[class*="expand"], [class*="details"], button:has-text("Details"), button:has-text("View")').all();

    if (expandButtons.length > 0) {
      console.log(`Found ${expandButtons.length} expand buttons, clicking first one...`);
      await expandButtons[0].click();
      await page.waitForTimeout(2000);

      // Screenshot 2: Expanded details
      console.log('Taking screenshot 2: Expanded flight details...');
      await page.screenshot({
        path: join(__dirname, 'screenshot-expanded-details.png'),
        fullPage: false
      });

      // Try to find and screenshot baggage calculator section
      const baggageSection = await page.locator('[class*="baggage"], [class*="Baggage"]').first();
      if (await baggageSection.count() > 0) {
        console.log('Taking screenshot 3: Baggage Calculator...');
        await baggageSection.screenshot({
          path: join(__dirname, 'screenshot-baggage-calculator.png')
        });
      }

      // Try to find and screenshot seat map section
      const seatMapSection = await page.locator('[class*="seat"], [class*="Seat"]').first();
      if (await seatMapSection.count() > 0) {
        console.log('Taking screenshot 4: Seat Map Preview...');
        await seatMapSection.screenshot({
          path: join(__dirname, 'screenshot-seat-map.png')
        });
      }
    } else {
      console.log('No expand buttons found - taking full page screenshot');
      await page.screenshot({
        path: join(__dirname, 'screenshot-full-page.png'),
        fullPage: true
      });
    }

    // Get page content to analyze
    const html = await page.content();
    console.log('\n=== Page Analysis ===');
    console.log('Deal Score badges:', html.includes('Deal Score') || html.includes('deal-score') || html.includes('dealScore'));
    console.log('Baggage text found:', html.includes('Baggage') || html.includes('baggage'));
    console.log('Seat Map text found:', html.includes('Seat') || html.includes('seat'));

    console.log('\nScreenshots saved successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);
