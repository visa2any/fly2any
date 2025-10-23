import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * COMPLETE USER JOURNEY ANALYSIS
 * From Homepage → Search → Results → Select → Book → Pay → Confirm
 */

const analysisDir = 'test-results/user-journey';

test.beforeAll(async () => {
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }
});

test.describe('STEP 1: Homepage & Search', () => {
  test('analyze homepage and search functionality', async ({ page }) => {
    console.log('\n========== STEP 1: HOMEPAGE & SEARCH ==========\n');

    // Navigate to homepage
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    // Capture homepage
    await page.screenshot({
      path: `${analysisDir}/01-homepage-full.png`,
      fullPage: true
    });
    console.log('✓ Homepage screenshot captured');

    // Analyze search form
    const searchForm = page.locator('form, [class*="search"]').first();
    const hasSearchForm = await searchForm.count() > 0;
    console.log(`Search form present: ${hasSearchForm}`);

    // Look for input fields
    const originInput = page.locator('input[placeholder*="From" i], input[name*="origin" i], input[id*="origin" i]');
    const destInput = page.locator('input[placeholder*="To" i], input[name*="destination" i], input[id*="dest" i]');
    const dateInput = page.locator('input[type="date"], input[placeholder*="date" i]');
    const searchButton = page.locator('button:has-text("Search"), button[type="submit"]');

    const formElements = {
      hasOriginInput: await originInput.count() > 0,
      hasDestInput: await destInput.count() > 0,
      hasDateInput: await dateInput.count() > 0,
      hasSearchButton: await searchButton.count() > 0,
    };

    console.log('Form elements:', formElements);

    // Try to interact with search form
    if (formElements.hasOriginInput && formElements.hasDestInput) {
      console.log('Attempting to fill search form...');

      try {
        await originInput.first().click();
        await page.waitForTimeout(500);
        await originInput.first().fill('JFK');
        await page.waitForTimeout(1000);

        await destInput.first().click();
        await page.waitForTimeout(500);
        await destInput.first().fill('LAX');
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: `${analysisDir}/01-homepage-filled.png`,
          fullPage: true
        });
        console.log('✓ Form filled screenshot captured');

      } catch (error) {
        console.log('⚠ Could not fill form:', error.message);
      }
    }

    // Check for trip type options (one-way, round-trip, multi-city)
    const tripTypeElements = await page.locator('text=/one.?way|round.?trip|multi.?city/i').count();
    console.log(`Trip type options found: ${tripTypeElements}`);

    // Check for passenger selectors
    const passengerSelectors = await page.locator('text=/adults?|children|infants?|passengers?/i').count();
    console.log(`Passenger selectors found: ${passengerSelectors}`);

    // Check for class selectors
    const classSelectors = await page.locator('text=/economy|business|first|premium/i').count();
    console.log(`Cabin class options found: ${classSelectors}`);

    // Save analysis
    fs.writeFileSync(
      `${analysisDir}/01-homepage-analysis.json`,
      JSON.stringify({ hasSearchForm, formElements, tripTypeElements, passengerSelectors, classSelectors }, null, 2)
    );

    console.log('\n========== STEP 1 COMPLETE ==========\n');
  });
});

test.describe('STEP 2: Search Results', () => {
  test('navigate to results and analyze', async ({ page }) => {
    console.log('\n========== STEP 2: SEARCH RESULTS ==========\n');

    // Navigate directly to results page
    const resultsUrl = 'http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-10-20&adults=1&children=0&infants=0&class=economy&return=2025-10-27';

    await page.goto(resultsUrl, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    await page.screenshot({
      path: `${analysisDir}/02-results-full.png`,
      fullPage: true
    });
    console.log('✓ Results page screenshot captured');

    // Check for flight cards
    const flightCards = page.locator('[class*="flight"], [data-testid*="flight"], article, [role="article"]');
    const cardCount = await flightCards.count();
    console.log(`Flight cards found: ${cardCount}`);

    if (cardCount > 0) {
      // Capture first flight card
      await flightCards.first().screenshot({
        path: `${analysisDir}/02-results-first-card.png`
      });

      // Analyze card elements
      const firstCard = flightCards.first();
      const cardElements = {
        hasPrice: await firstCard.locator('[class*="price"], [class*="cost"]').count() > 0,
        hasAirline: await firstCard.locator('[class*="airline"], img[alt*="airline"]').count() > 0,
        hasTime: await firstCard.locator('[class*="time"], [class*="departure"]').count() > 0,
        hasDuration: await firstCard.locator('[class*="duration"]').count() > 0,
        hasSelectButton: await firstCard.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Choose")').count() > 0,
      };

      console.log('Card elements:', cardElements);

      // Try to click "Select" button
      const selectButton = firstCard.locator('button').first();
      if (await selectButton.count() > 0) {
        console.log('Attempting to click select button...');

        try {
          await selectButton.click();
          await page.waitForTimeout(3000);

          await page.screenshot({
            path: `${analysisDir}/02-results-after-click.png`,
            fullPage: true
          });
          console.log('✓ After selection screenshot captured');

          // Check if navigation occurred
          const newUrl = page.url();
          console.log(`Current URL after click: ${newUrl}`);

          fs.writeFileSync(
            `${analysisDir}/02-navigation.json`,
            JSON.stringify({ beforeUrl: resultsUrl, afterUrl: newUrl, navigationOccurred: newUrl !== resultsUrl }, null, 2)
          );

        } catch (error) {
          console.log('⚠ Could not click select button:', error.message);
        }
      }

      fs.writeFileSync(
        `${analysisDir}/02-results-analysis.json`,
        JSON.stringify({ cardCount, cardElements }, null, 2)
      );
    } else {
      console.log('⚠ No flight cards found - analyzing error state');

      const errorMessages = await page.locator('text=/error|failed|not found/i').count();
      const loadingIndicators = await page.locator('[class*="loading"], [class*="spinner"]').count();

      console.log(`Error messages: ${errorMessages}`);
      console.log(`Loading indicators: ${loadingIndicators}`);

      fs.writeFileSync(
        `${analysisDir}/02-results-analysis.json`,
        JSON.stringify({ cardCount: 0, errorMessages, loadingIndicators, status: 'NO_RESULTS' }, null, 2)
      );
    }

    console.log('\n========== STEP 2 COMPLETE ==========\n');
  });
});

test.describe('STEP 3: Booking Page', () => {
  test('check if booking page exists', async ({ page }) => {
    console.log('\n========== STEP 3: BOOKING PAGE ==========\n');

    // Try to navigate to booking page
    const bookingUrls = [
      'http://localhost:3000/flights/booking',
      'http://localhost:3000/flights/book',
      'http://localhost:3000/booking',
      'http://localhost:3000/checkout',
    ];

    for (const url of bookingUrls) {
      console.log(`Trying: ${url}`);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);

        const is404 = await page.locator('text=/404|not found/i').count() > 0;

        if (!is404) {
          console.log(`✓ Found booking page at: ${url}`);

          await page.screenshot({
            path: `${analysisDir}/03-booking-page.png`,
            fullPage: true
          });

          // Analyze booking form
          const passengerForm = await page.locator('form, [class*="passenger"], [class*="traveler"]').count() > 0;
          const nameInputs = await page.locator('input[name*="name" i], input[placeholder*="name" i]').count();
          const emailInputs = await page.locator('input[type="email"], input[name*="email" i]').count();
          const phoneInputs = await page.locator('input[type="tel"], input[name*="phone" i]').count();
          const paymentSection = await page.locator('[class*="payment"], text=/payment|credit card/i').count() > 0;

          console.log({
            url,
            hasPassengerForm: passengerForm,
            nameInputs,
            emailInputs,
            phoneInputs,
            hasPaymentSection: paymentSection,
          });

          fs.writeFileSync(
            `${analysisDir}/03-booking-analysis.json`,
            JSON.stringify({
              bookingPageUrl: url,
              exists: true,
              hasPassengerForm: passengerForm,
              nameInputs,
              emailInputs,
              phoneInputs,
              hasPaymentSection: paymentSection,
            }, null, 2)
          );

          break;
        } else {
          console.log(`✗ 404 at ${url}`);
        }
      } catch (error) {
        console.log(`✗ Failed to load ${url}: ${error.message}`);
      }
    }

    console.log('\n========== STEP 3 COMPLETE ==========\n');
  });
});

test.describe('STEP 4: Complete Journey Map', () => {
  test('generate complete journey report', async ({ page }) => {
    console.log('\n========== GENERATING COMPLETE JOURNEY REPORT ==========\n');

    // Read all previous analyses
    const step1 = JSON.parse(fs.readFileSync(`${analysisDir}/01-homepage-analysis.json`, 'utf-8'));
    const step2 = JSON.parse(fs.readFileSync(`${analysisDir}/02-results-analysis.json`, 'utf-8'));

    let step3 = { exists: false };
    try {
      step3 = JSON.parse(fs.readFileSync(`${analysisDir}/03-booking-analysis.json`, 'utf-8'));
    } catch (e) {
      console.log('No booking page found');
    }

    const journeyMap = {
      timestamp: new Date().toISOString(),
      steps: {
        '1_homepage': {
          status: step1.hasSearchForm ? 'EXISTS' : 'MISSING',
          details: step1,
          completeness: calculateCompleteness(step1),
        },
        '2_results': {
          status: step2.cardCount > 0 ? 'WORKING' : 'BROKEN',
          details: step2,
          completeness: step2.cardCount > 0 ? 50 : 0,
        },
        '3_booking': {
          status: step3.exists ? 'EXISTS' : 'MISSING',
          details: step3,
          completeness: step3.exists ? 30 : 0,
        },
        '4_payment': {
          status: 'UNKNOWN',
          completeness: 0,
        },
        '5_confirmation': {
          status: 'UNKNOWN',
          completeness: 0,
        },
      },
      overallCompleteness: 0,
      criticalBlockers: [],
    };

    // Calculate overall completeness
    const completenessValues = Object.values(journeyMap.steps).map((step: any) => step.completeness || 0);
    journeyMap.overallCompleteness = Math.round(
      completenessValues.reduce((sum, val) => sum + val, 0) / completenessValues.length
    );

    // Identify blockers
    if (!step1.hasSearchForm) {
      journeyMap.criticalBlockers.push('No search form on homepage');
    }
    if (step2.cardCount === 0) {
      journeyMap.criticalBlockers.push('No flights displayed on results page (BLOCKER)');
    }
    if (!step3.exists) {
      journeyMap.criticalBlockers.push('No booking page found');
    }

    fs.writeFileSync(
      `${analysisDir}/COMPLETE-JOURNEY-MAP.json`,
      JSON.stringify(journeyMap, null, 2)
    );

    console.log('\n========== JOURNEY REPORT ==========');
    console.log(`Overall Completeness: ${journeyMap.overallCompleteness}%`);
    console.log('\nCritical Blockers:');
    journeyMap.criticalBlockers.forEach((blocker, i) => {
      console.log(`  ${i + 1}. ${blocker}`);
    });
    console.log('====================================\n');
  });
});

function calculateCompleteness(step: any): number {
  const keys = Object.keys(step);
  const trueValues = Object.values(step).filter(v => v === true).length;
  return Math.round((trueValues / keys.length) * 100);
}
