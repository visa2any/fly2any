import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * COMPREHENSIVE COMPETITIVE ANALYSIS
 * Priceline vs Fly2Any Flight Results Page
 */

test.describe('Priceline Flight Results Analysis', () => {
  test('analyze Priceline UX and features', async ({ page }) => {
    const analysisDir = 'test-results/competitive-analysis';
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    console.log('\n========== PRICELINE ANALYSIS START ==========\n');

    // Navigate to Priceline
    await page.goto('https://www.priceline.com/m/fly/search/JFK-GRU-20251103/GRU-JFK-20251107/?cabin-class=ECO&no-date-search=false&search-type=0000&num-adults=1', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Take full page screenshot
    await page.screenshot({
      path: `${analysisDir}/priceline-full-page.png`,
      fullPage: true
    });
    console.log('✓ Full page screenshot captured');

    // Analyze page structure
    const pageAnalysis = {
      url: page.url(),
      title: await page.title(),
      viewport: page.viewportSize(),
      timestamp: new Date().toISOString()
    };

    // Check for loading states
    const hasLoader = await page.locator('[class*="loader"], [class*="loading"], [class*="spinner"]').count();
    console.log(`Loading indicators found: ${hasLoader}`);

    // Analyze filter section
    const filterSection = page.locator('[class*="filter"], [class*="sidebar"], aside, [role="complementary"]').first();
    if (await filterSection.count() > 0) {
      await filterSection.screenshot({ path: `${analysisDir}/priceline-filters.png` });
      console.log('✓ Filter section captured');

      // Document filter options
      const filterText = await filterSection.innerText().catch(() => 'Could not read filters');
      console.log('\n--- FILTERS AVAILABLE ---');
      console.log(filterText.substring(0, 500));
    }

    // Analyze flight cards
    const flightCards = page.locator('[class*="flight"], [class*="card"], [class*="result"], [data-testid*="flight"]');
    const cardCount = await flightCards.count();
    console.log(`\nTotal flight cards found: ${cardCount}`);

    if (cardCount > 0) {
      // Capture first flight card
      await flightCards.first().screenshot({ path: `${analysisDir}/priceline-flight-card-1.png` });
      console.log('✓ First flight card captured');

      // Analyze first card structure
      const firstCard = flightCards.first();
      const cardHTML = await firstCard.innerHTML().catch(() => '');

      // Look for price elements
      const priceElements = await firstCard.locator('[class*="price"], [class*="cost"], [class*="fare"]').count();
      console.log(`Price elements in first card: ${priceElements}`);

      // Look for airline info
      const airlineElements = await firstCard.locator('[class*="airline"], [class*="carrier"], img[alt*="airline"]').count();
      console.log(`Airline elements in first card: ${airlineElements}`);

      // Look for time/duration info
      const timeElements = await firstCard.locator('[class*="time"], [class*="duration"], [class*="depart"]').count();
      console.log(`Time/duration elements: ${timeElements}`);
    }

    // Check for sort options
    const sortButtons = page.locator('button:has-text("Sort"), [class*="sort"], select[class*="sort"]');
    const sortCount = await sortButtons.count();
    console.log(`\nSort options found: ${sortCount}`);

    // Check for price display variations
    const priceLabels = await page.locator('text=/total|per person|base fare|taxes|fees/i').count();
    console.log(`Price-related labels: ${priceLabels}`);

    // Check for additional features
    const features = {
      priceAlerts: await page.locator('text=/price alert|track price/i').count() > 0,
      flexibleDates: await page.locator('text=/flexible dates|date grid/i').count() > 0,
      baggageInfo: await page.locator('text=/baggage|luggage|bag/i').count() > 0,
      amenities: await page.locator('text=/wifi|meal|entertainment|seat/i').count() > 0,
      fareTypes: await page.locator('text=/basic|main|comfort|first|business/i').count() > 0,
    };

    console.log('\n--- FEATURES DETECTED ---');
    console.log(JSON.stringify(features, null, 2));

    // Capture mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${analysisDir}/priceline-mobile.png`,
      fullPage: true
    });
    console.log('✓ Mobile view captured');

    // Save analysis
    fs.writeFileSync(
      `${analysisDir}/priceline-analysis.json`,
      JSON.stringify({ pageAnalysis, cardCount, features, sortCount, priceLabels }, null, 2)
    );

    console.log('\n========== PRICELINE ANALYSIS COMPLETE ==========\n');
  });
});

test.describe('Fly2Any Flight Results Analysis', () => {
  test('analyze our flight results page', async ({ page }) => {
    const analysisDir = 'test-results/competitive-analysis';

    console.log('\n========== FLY2ANY ANALYSIS START ==========\n');

    // Navigate to our page
    const ourUrl = 'http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-10-15&adults=1&children=0&infants=0&class=economy&return=2025-10-30';

    try {
      await page.goto(ourUrl, {
        waitUntil: 'networkidle',
        timeout: 60000
      });
    } catch (error) {
      console.log('⚠ Navigation error:', error.message);
      await page.waitForTimeout(5000);
    }

    // Take full page screenshot
    await page.screenshot({
      path: `${analysisDir}/fly2any-full-page.png`,
      fullPage: true
    });
    console.log('✓ Full page screenshot captured');

    // Analyze page structure
    const pageAnalysis = {
      url: page.url(),
      title: await page.title(),
      viewport: page.viewportSize(),
      timestamp: new Date().toISOString()
    };

    // Check for errors
    const errorElements = await page.locator('text=/error|not found|failed|wrong/i').count();
    console.log(`Error messages detected: ${errorElements}`);

    // Check for loading states
    const hasLoader = await page.locator('[class*="loader"], [class*="loading"], [class*="spinner"]').count();
    console.log(`Loading indicators found: ${hasLoader}`);

    // Analyze filter section
    const filterSection = page.locator('[class*="filter"], [class*="sidebar"], aside').first();
    const hasFilters = await filterSection.count() > 0;
    console.log(`Has filter section: ${hasFilters}`);

    if (hasFilters) {
      await filterSection.screenshot({ path: `${analysisDir}/fly2any-filters.png` });
      const filterText = await filterSection.innerText().catch(() => 'Could not read filters');
      console.log('\n--- OUR FILTERS ---');
      console.log(filterText.substring(0, 500));
    }

    // Analyze flight cards
    const flightCards = page.locator('[class*="flight"], [class*="card"], [class*="result"]');
    const cardCount = await flightCards.count();
    console.log(`\nTotal flight cards found: ${cardCount}`);

    if (cardCount > 0) {
      await flightCards.first().screenshot({ path: `${analysisDir}/fly2any-flight-card-1.png` });
      console.log('✓ First flight card captured');

      const firstCard = flightCards.first();

      // Analyze card content
      const priceElements = await firstCard.locator('[class*="price"], [class*="cost"]').count();
      const airlineElements = await firstCard.locator('[class*="airline"], img[alt*="airline"]').count();
      const timeElements = await firstCard.locator('[class*="time"], [class*="duration"]').count();

      console.log(`Price elements: ${priceElements}`);
      console.log(`Airline elements: ${airlineElements}`);
      console.log(`Time elements: ${timeElements}`);
    } else {
      console.log('⚠ No flight cards found - may need to wait for data');

      // Check if there's a "no results" message
      const noResults = await page.locator('text=/no flights|no results|not available/i').count();
      console.log(`No results message: ${noResults > 0 ? 'Yes' : 'No'}`);
    }

    // Check for sort options
    const sortButtons = page.locator('button:has-text("Sort"), [class*="sort"], select');
    const sortCount = await sortButtons.count();
    console.log(`\nSort options found: ${sortCount}`);

    // Check for features
    const features = {
      priceAlerts: await page.locator('text=/price alert|track price/i').count() > 0,
      flexibleDates: await page.locator('text=/flexible dates|calendar/i').count() > 0,
      baggageInfo: await page.locator('text=/baggage|luggage/i').count() > 0,
      amenities: await page.locator('text=/wifi|meal|entertainment/i').count() > 0,
      fareComparison: await page.locator('text=/compare|fare type/i').count() > 0,
    };

    console.log('\n--- OUR FEATURES ---');
    console.log(JSON.stringify(features, null, 2));

    // Capture mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${analysisDir}/fly2any-mobile.png`,
      fullPage: true
    });
    console.log('✓ Mobile view captured');

    // Check console errors
    const consoleMessages: string[] = [];
    page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));

    // Save analysis
    fs.writeFileSync(
      `${analysisDir}/fly2any-analysis.json`,
      JSON.stringify({ pageAnalysis, cardCount, features, sortCount, hasFilters, errorElements }, null, 2)
    );

    console.log('\n========== FLY2ANY ANALYSIS COMPLETE ==========\n');
  });
});

test.describe('Side-by-Side Comparison', () => {
  test('generate comparison report', async ({ page }) => {
    const analysisDir = 'test-results/competitive-analysis';

    // Read both analyses
    const pricelineData = JSON.parse(
      fs.readFileSync(`${analysisDir}/priceline-analysis.json`, 'utf-8')
    );
    const fly2anyData = JSON.parse(
      fs.readFileSync(`${analysisDir}/fly2any-analysis.json`, 'utf-8')
    );

    const comparison = {
      timestamp: new Date().toISOString(),
      priceline: pricelineData,
      fly2any: fly2anyData,
      gaps: {
        featuresMissing: [],
        uxIssues: [],
        recommendations: []
      }
    };

    // Identify gaps
    if (pricelineData.cardCount > fly2anyData.cardCount) {
      comparison.gaps.recommendations.push('Priceline shows more flight results');
    }

    Object.keys(pricelineData.features).forEach(feature => {
      if (pricelineData.features[feature] && !fly2anyData.features[feature]) {
        comparison.gaps.featuresMissing.push(feature);
      }
    });

    fs.writeFileSync(
      `${analysisDir}/comparison-report.json`,
      JSON.stringify(comparison, null, 2)
    );

    console.log('\n========== COMPARISON COMPLETE ==========');
    console.log('\nFeatures Missing from Fly2Any:');
    comparison.gaps.featuresMissing.forEach(f => console.log(`  - ${f}`));
    console.log('\n');
  });
});
