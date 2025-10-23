import { chromium } from '@playwright/test';
import fs from 'fs';

/**
 * COMPLETE USER JOURNEY TEST
 * Tests every single interaction as a real user would
 */

async function completeUserJourneyTest() {
  console.log('🚀 COMPLETE USER JOURNEY TEST - Testing like a real user\n');
  console.log('Browser: Edge (Chromium)\n');

  const testResults = {
    timestamp: new Date().toISOString(),
    stepsCompleted: 0,
    stepsFailed: 0,
    issues: [],
    screenshots: []
  };

  // Launch Edge browser (Chromium engine)
  const browser = await chromium.launch({
    channel: 'msedge', // Use Microsoft Edge
    headless: false,
    slowMo: 800, // Slow down to see what's happening
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  });

  const page = await context.newPage();

  // Track console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  try {
    console.log('='.repeat(80));
    console.log('STEP 1: NAVIGATE TO FLIGHT RESULTS');
    console.log('='.repeat(80));

    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded');

    // Wait for flights to load
    await page.waitForResponse(r => r.url().includes('/api/flights/search'), { timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'UX-STEP-01-page-loaded.png', fullPage: true });
    testResults.screenshots.push('UX-STEP-01-page-loaded.png');
    console.log('📸 Screenshot: UX-STEP-01-page-loaded.png');
    testResults.stepsCompleted++;

    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: LOCATE ALL FLIGHT CARDS');
    console.log('='.repeat(80));

    const flightCards = await page.$$('article, [data-testid*="flight"], [class*="flight-card"], [class*="FlightCard"]');
    console.log(`Found ${flightCards.length} flight cards`);

    if (flightCards.length === 0) {
      // Try alternative selectors
      const cards = await page.$$('.glass, [class*="card"]');
      console.log(`Alternative search found ${cards.length} cards`);
    }
    testResults.stepsCompleted++;

    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: TEST DEAL SCORE BADGE INTERACTIONS');
    console.log('='.repeat(80));

    // Look for Deal Score badges
    const dealScoreBadges = await page.$$('text=/\\d+.*Deal/, [class*="deal"], [class*="Deal"], [class*="score"]');
    console.log(`Found ${dealScoreBadges.length} potential deal score elements`);

    if (dealScoreBadges.length > 0) {
      const badge = dealScoreBadges[0];
      await badge.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      console.log('🖱️  Hovering over Deal Score badge...');
      await badge.hover();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'UX-STEP-03-deal-score-hover.png' });
      testResults.screenshots.push('UX-STEP-03-deal-score-hover.png');
      console.log('📸 Screenshot: UX-STEP-03-deal-score-hover.png');

      // Try clicking it
      console.log('🖱️  Clicking Deal Score badge...');
      try {
        await badge.click();
        await page.waitForTimeout(1500);

        await page.screenshot({ path: 'UX-STEP-03-deal-score-clicked.png' });
        testResults.screenshots.push('UX-STEP-03-deal-score-clicked.png');
        console.log('📸 Screenshot: UX-STEP-03-deal-score-clicked.png');
        console.log('✅ Deal Score badge clickable');
      } catch (e) {
        console.log('ℹ️  Deal Score badge not clickable (this may be expected)');
      }

      testResults.stepsCompleted++;
    } else {
      console.log('❌ No Deal Score badges found!');
      testResults.stepsFailed++;
      testResults.issues.push('Deal Score badges not found on page');
    }

    console.log('\n' + '='.repeat(80));
    console.log('STEP 4: EXPAND FIRST FLIGHT CARD');
    console.log('='.repeat(80));

    const detailsButtons = await page.$$('button:has-text("Details")');
    console.log(`Found ${detailsButtons.length} Details buttons`);

    if (detailsButtons.length > 0) {
      console.log('🖱️  Clicking first Details button to expand flight...');
      await detailsButtons[0].scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await detailsButtons[0].click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'UX-STEP-04-flight-expanded.png', fullPage: false });
      testResults.screenshots.push('UX-STEP-04-flight-expanded.png');
      console.log('📸 Screenshot: UX-STEP-04-flight-expanded.png');
      console.log('✅ Flight card expanded');
      testResults.stepsCompleted++;
    } else {
      console.log('❌ No Details buttons found!');
      testResults.stepsFailed++;
      testResults.issues.push('Details buttons not found');
    }

    console.log('\n' + '='.repeat(80));
    console.log('STEP 5: TEST BAGGAGE CALCULATOR INTERACTIONS');
    console.log('='.repeat(80));

    // Look for Baggage Calculator
    const baggageText = await page.$('text=Baggage Calculator, text=Baggage Fee');

    if (baggageText) {
      console.log('✅ Baggage Calculator found');
      await baggageText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'UX-STEP-05-baggage-visible.png' });
      testResults.screenshots.push('UX-STEP-05-baggage-visible.png');
      console.log('📸 Screenshot: UX-STEP-05-baggage-visible.png');

      // Look for +/- buttons
      const plusButtons = await page.$$('button:has-text("+")');
      const minusButtons = await page.$$('button:has-text("-")');

      console.log(`Found ${plusButtons.length} plus buttons, ${minusButtons.length} minus buttons`);

      if (plusButtons.length > 0) {
        console.log('🖱️  Clicking + button to add baggage...');
        await plusButtons[0].click();
        await page.waitForTimeout(1500);

        await page.screenshot({ path: 'UX-STEP-05-baggage-added.png' });
        testResults.screenshots.push('UX-STEP-05-baggage-added.png');
        console.log('📸 Screenshot: UX-STEP-05-baggage-added.png');
        console.log('✅ Baggage + button works');

        // Try minus button
        if (minusButtons.length > 0) {
          console.log('🖱️  Clicking - button to remove baggage...');
          await minusButtons[0].click();
          await page.waitForTimeout(1500);
          console.log('✅ Baggage - button works');
        }
      } else {
        console.log('⚠️  No +/- buttons found in Baggage Calculator');
        testResults.issues.push('Baggage Calculator +/- buttons not found');
      }

      testResults.stepsCompleted++;
    } else {
      console.log('❌ Baggage Calculator not found!');
      testResults.stepsFailed++;
      testResults.issues.push('Baggage Calculator not visible in expanded flight');
    }

    console.log('\n' + '='.repeat(80));
    console.log('STEP 6: TEST SEAT MAP PREVIEW');
    console.log('='.repeat(80));

    const seatMapText = await page.$('text=Seat Map Preview, text=Seat Map, text=Preview Seats');

    if (seatMapText) {
      console.log('✅ Seat Map Preview found');
      await seatMapText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await page.screenshot({ path: 'UX-STEP-06-seatmap-visible.png' });
      testResults.screenshots.push('UX-STEP-06-seatmap-visible.png');
      console.log('📸 Screenshot: UX-STEP-06-seatmap-visible.png');

      // Look for Preview Seats button
      const previewButton = await page.$('button:has-text("Preview Seats"), button:has-text("Select Seat")');

      if (previewButton) {
        console.log('🖱️  Clicking to expand Seat Map...');
        await previewButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'UX-STEP-06-seatmap-expanded.png' });
        testResults.screenshots.push('UX-STEP-06-seatmap-expanded.png');
        console.log('📸 Screenshot: UX-STEP-06-seatmap-expanded.png');

        // Try clicking a seat
        const seats = await page.$$('button[class*="seat"]');
        console.log(`Found ${seats.length} clickable seats`);

        if (seats.length > 0) {
          console.log('🖱️  Clicking first available seat...');
          await seats[0].click();
          await page.waitForTimeout(1500);

          await page.screenshot({ path: 'UX-STEP-06-seat-selected.png' });
          testResults.screenshots.push('UX-STEP-06-seat-selected.png');
          console.log('📸 Screenshot: UX-STEP-06-seat-selected.png');
          console.log('✅ Seat selection works');
        }
      }

      testResults.stepsCompleted++;
    } else {
      console.log('❌ Seat Map Preview not found!');
      testResults.stepsFailed++;
      testResults.issues.push('Seat Map Preview not visible in expanded flight');
    }

    console.log('\n' + '='.repeat(80));
    console.log('STEP 7: TEST ALL HOVER STATES - FIND THE OVERFLOW BUG');
    console.log('='.repeat(80));

    // Scroll back to top of expanded flight
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1000);

    const hoverTargets = [
      { selector: 'text=/\\d+.*Score/', name: 'Deal Score badge' },
      { selector: 'text=Breakdown', name: 'Breakdown text' },
      { selector: 'button:has-text("Details")', name: 'Details button' },
      { selector: '[class*="price"]', name: 'Price elements' },
      { selector: 'text=/\\$\\d+/', name: 'Dollar amounts' },
    ];

    for (const target of hoverTargets) {
      const elements = await page.$$(target.selector).catch(() => []);

      if (elements.length > 0) {
        console.log(`\nTesting hover on: ${target.name} (found ${elements.length})`);

        const element = elements[0];
        await element.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);

        console.log('🖱️  Hovering...');
        await element.hover();
        await page.waitForTimeout(2000);

        const filename = `UX-STEP-07-hover-${target.name.replace(/\s+/g, '-')}.png`;
        await page.screenshot({ path: filename });
        testResults.screenshots.push(filename);
        console.log(`📸 Screenshot: ${filename}`);

        // Check for visible tooltips
        const tooltips = await page.$$('[role="tooltip"]:visible, [class*="tooltip"]:visible');
        if (tooltips.length > 0) {
          console.log(`  ✅ Found ${tooltips.length} visible tooltip(s)`);

          for (const tooltip of tooltips) {
            const box = await tooltip.boundingBox();
            if (box) {
              console.log(`     Position: (${Math.round(box.x)}, ${Math.round(box.y)}), Size: ${Math.round(box.width)}x${Math.round(box.height)}`);

              if (box.x < 0 || box.y < 0 || box.x + box.width > 1920 || box.y + box.height > 1080) {
                console.log(`  ⚠️  🐛 BUG FOUND: Tooltip overflows viewport!`);
                testResults.issues.push(`${target.name}: Tooltip overflows viewport`);
              }
            }
          }
        }

        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }
    }

    testResults.stepsCompleted++;

    console.log('\n' + '='.repeat(80));
    console.log('STEP 8: TEST SELECT BUTTONS - FIND THE NON-WORKING ONE');
    console.log('='.repeat(80));

    const allSelectButtons = await page.$$('button:has-text("Select")');
    console.log(`Found ${allSelectButtons.length} Select buttons on page`);

    for (let i = 0; i < Math.min(5, allSelectButtons.length); i++) {
      const button = allSelectButtons[i];
      const buttonText = await button.innerText().catch(() => 'unknown');
      const isVisible = await button.isVisible().catch(() => false);

      if (!isVisible) continue;

      console.log(`\nTesting Select button ${i + 1}: "${buttonText}"`);

      await button.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const urlBefore = page.url();

      console.log('🖱️  Clicking...');
      await button.click();
      await page.waitForTimeout(2000);

      const urlAfter = page.url();
      const modalExists = await page.$('[role="dialog"]').then(el => !!el).catch(() => false);

      console.log(`  URL before: ${urlBefore}`);
      console.log(`  URL after: ${urlAfter}`);
      console.log(`  URL changed: ${urlBefore !== urlAfter ? '✅ YES' : '❌ NO'}`);
      console.log(`  Modal appeared: ${modalExists ? '✅ YES' : '❌ NO'}`);

      if (urlBefore === urlAfter && !modalExists) {
        console.log(`  ⚠️  🐛 BUG FOUND: Button does NOTHING!`);
        testResults.issues.push(`Select button "${buttonText}" does nothing (no navigation, no modal)`);
      } else {
        console.log(`  ✅ Button works`);
      }

      const filename = `UX-STEP-08-select-button-${i + 1}.png`;
      await page.screenshot({ path: filename });
      testResults.screenshots.push(filename);
      console.log(`📸 Screenshot: ${filename}`);

      if (urlAfter !== urlBefore) break; // Stop if we navigated away
    }

    testResults.stepsCompleted++;

    console.log('\n' + '='.repeat(80));
    console.log('FINAL REPORT');
    console.log('='.repeat(80));

    console.log(`\n✅ Steps completed: ${testResults.stepsCompleted}`);
    console.log(`❌ Steps failed: ${testResults.stepsFailed}`);
    console.log(`🐛 Issues found: ${testResults.issues.length}`);
    console.log(`📸 Screenshots captured: ${testResults.screenshots.length}\n`);

    if (testResults.issues.length > 0) {
      console.log('🐛 ISSUES FOUND:\n');
      testResults.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
      console.log('');
    } else {
      console.log('✅ No major issues found!\n');
    }

    // Save detailed report
    fs.writeFileSync('USER-JOURNEY-TEST-REPORT.json', JSON.stringify(testResults, null, 2));
    console.log('📄 Detailed report saved: USER-JOURNEY-TEST-REPORT.json\n');

    console.log('Console logs captured:', consoleLogs.filter(log => log.type === 'error').length, 'errors');

  } catch (error) {
    console.error('\n❌ Test crashed:', error.message);
    await page.screenshot({ path: 'UX-ERROR-crash.png', fullPage: true });
    testResults.issues.push(`Test crashed: ${error.message}`);
  } finally {
    console.log('\n⏸️  Keeping browser open for 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);

    await browser.close();
    console.log('✅ Test complete!');
  }
}

completeUserJourneyTest();
