import { chromium } from '@playwright/test';

async function testAllIssues() {
  console.log('🚀 Starting comprehensive UI testing...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Listen to console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('📍 Navigating to flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded\n');

    // Wait for flight cards to load
    await page.waitForSelector('[class*="flight-card"]', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    console.log('='.repeat(80));
    console.log('TEST 1: FARE BREAKDOWN HOVER POSITIONING ISSUE');
    console.log('='.repeat(80));

    // Find fare breakdown elements
    const fareBreakdownElements = await page.$$('[class*="fare"], [class*="Fare"], button:has-text("Fare"), div:has-text("Basic"), div:has-text("Standard"), div:has-text("Premium")');
    console.log(`Found ${fareBreakdownElements.length} potential fare elements\n`);

    if (fareBreakdownElements.length > 0) {
      console.log('🖱️  Testing hover on fare breakdown elements...');

      for (let i = 0; i < Math.min(3, fareBreakdownElements.length); i++) {
        try {
          const element = fareBreakdownElements[i];
          const text = await element.textContent();
          console.log(`  - Hovering element ${i + 1}: "${text?.substring(0, 30)}..."`);

          await element.hover();
          await page.waitForTimeout(1000);

          // Take screenshot of hover state
          await page.screenshot({
            path: `ISSUE-1-fare-hover-${i + 1}.png`,
            fullPage: false
          });
          console.log(`    📸 Screenshot saved: ISSUE-1-fare-hover-${i + 1}.png`);

          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`    ❌ Error hovering element ${i + 1}: ${e.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('TEST 2: SELECT BUTTON FUNCTIONALITY');
    console.log('='.repeat(80));

    // Find and click Details button first
    console.log('🔍 Looking for Details/Expand button...');
    const detailsButton = await page.$('button:has-text("Details"), button:has-text("View Details"), button:has-text("Show Details")').catch(() => null);

    if (detailsButton) {
      console.log('✅ Found Details button, clicking...');
      await detailsButton.click();
      await page.waitForTimeout(2000);

      // Screenshot expanded state
      await page.screenshot({
        path: 'ISSUE-2-expanded-flight.png',
        fullPage: false
      });
      console.log('📸 Screenshot saved: ISSUE-2-expanded-flight.png\n');
    }

    // Find Select buttons
    console.log('🔍 Looking for Select buttons (fare selection)...');
    const selectButtons = await page.$$('button:has-text("Select"), button:has-text("Choose"), button:has-text("Book")');
    console.log(`Found ${selectButtons.length} Select-type buttons\n`);

    if (selectButtons.length > 0) {
      for (let i = 0; i < Math.min(3, selectButtons.length); i++) {
        try {
          const button = selectButtons[i];
          const text = await button.textContent();
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();

          console.log(`Button ${i + 1}:`);
          console.log(`  - Text: "${text}"`);
          console.log(`  - Visible: ${isVisible}`);
          console.log(`  - Enabled: ${isEnabled}`);

          if (isVisible && isEnabled) {
            console.log(`  🖱️  Clicking button ${i + 1}...`);

            // Get page URL before click
            const urlBefore = page.url();

            await button.click();
            await page.waitForTimeout(2000);

            // Get page URL after click
            const urlAfter = page.url();

            console.log(`  - URL before: ${urlBefore}`);
            console.log(`  - URL after: ${urlAfter}`);
            console.log(`  - URL changed: ${urlBefore !== urlAfter ? '✅ YES' : '❌ NO'}`);

            // Check if any modal or overlay appeared
            const modalVisible = await page.$('[role="dialog"], [class*="modal"], [class*="Modal"]').then(el => !!el).catch(() => false);
            console.log(`  - Modal appeared: ${modalVisible ? '✅ YES' : '❌ NO'}`);

            // Take screenshot after click
            await page.screenshot({
              path: `ISSUE-2-select-button-${i + 1}-clicked.png`,
              fullPage: false
            });
            console.log(`  📸 Screenshot saved: ISSUE-2-select-button-${i + 1}-clicked.png\n`);
          } else {
            console.log(`  ⚠️  Button not clickable (Visible: ${isVisible}, Enabled: ${isEnabled})\n`);
          }
        } catch (e) {
          console.log(`  ❌ Error testing button ${i + 1}: ${e.message}\n`);
        }
      }
    } else {
      console.log('❌ No Select buttons found!\n');
    }

    console.log('='.repeat(80));
    console.log('TEST 3: DEAL SCORE BADGE INTERACTIONS');
    console.log('='.repeat(80));

    const dealScoreBadges = await page.$$('[class*="deal"], [class*="Deal"], [class*="score"], [class*="Score"]').catch(() => []);
    console.log(`Found ${dealScoreBadges.length} potential deal score elements\n`);

    if (dealScoreBadges.length > 0) {
      const badge = dealScoreBadges[0];
      console.log('🖱️  Testing Deal Score badge interaction...');
      await badge.hover();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'ISSUE-3-deal-score-hover.png',
        fullPage: false
      });
      console.log('📸 Screenshot saved: ISSUE-3-deal-score-hover.png\n');

      try {
        await badge.click();
        await page.waitForTimeout(1000);
        console.log('✅ Deal Score badge clicked\n');
      } catch (e) {
        console.log(`❌ Error clicking Deal Score: ${e.message}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('TEST 4: BAGGAGE CALCULATOR INTERACTIONS');
    console.log('='.repeat(80));

    const baggageElements = await page.$$('[class*="baggage"], [class*="Baggage"], button:has-text("Add Bag")');
    console.log(`Found ${baggageElements.length} baggage-related elements\n`);

    if (baggageElements.length > 0) {
      console.log('🖱️  Testing Baggage Calculator...');

      // Look for +/- buttons
      const plusButtons = await page.$$('button:has-text("+")');
      const minusButtons = await page.$$('button:has-text("-")');

      console.log(`  - Found ${plusButtons.length} plus buttons`);
      console.log(`  - Found ${minusButtons.length} minus buttons\n`);

      if (plusButtons.length > 0) {
        try {
          console.log('  🖱️  Clicking + button...');
          await plusButtons[0].click();
          await page.waitForTimeout(1000);

          await page.screenshot({
            path: 'ISSUE-4-baggage-plus-clicked.png',
            fullPage: false
          });
          console.log('  📸 Screenshot saved: ISSUE-4-baggage-plus-clicked.png\n');
        } catch (e) {
          console.log(`  ❌ Error clicking + button: ${e.message}\n`);
        }
      }
    }

    console.log('='.repeat(80));
    console.log('TEST 5: SEAT MAP PREVIEW INTERACTIONS');
    console.log('='.repeat(80));

    const seatMapElements = await page.$$('[class*="seat"], [class*="Seat"], button:has-text("Preview Seats")');
    console.log(`Found ${seatMapElements.length} seat-related elements\n`);

    if (seatMapElements.length > 0) {
      console.log('🖱️  Testing Seat Map Preview...');

      // Look for preview button
      const previewButton = await page.$('button:has-text("Preview Seats"), button:has-text("Seat Map"), button:has-text("Select Seat")').catch(() => null);

      if (previewButton) {
        try {
          console.log('  🖱️  Clicking Seat Preview button...');
          await previewButton.click();
          await page.waitForTimeout(2000);

          await page.screenshot({
            path: 'ISSUE-5-seat-map-opened.png',
            fullPage: false
          });
          console.log('  📸 Screenshot saved: ISSUE-5-seat-map-opened.png\n');

          // Try clicking a seat
          const seats = await page.$$('button[class*="seat"]').catch(() => []);
          if (seats.length > 0) {
            console.log(`  Found ${seats.length} clickable seats, testing first one...`);
            await seats[0].click();
            await page.waitForTimeout(1000);

            await page.screenshot({
              path: 'ISSUE-5-seat-selected.png',
              fullPage: false
            });
            console.log('  📸 Screenshot saved: ISSUE-5-seat-selected.png\n');
          }
        } catch (e) {
          console.log(`  ❌ Error with Seat Map: ${e.message}\n`);
        }
      }
    }

    console.log('='.repeat(80));
    console.log('CONSOLE ERRORS DETECTED');
    console.log('='.repeat(80));

    if (consoleErrors.length > 0) {
      console.log(`❌ Found ${consoleErrors.length} console errors:\n`);
      consoleErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}\n`);
      });
    } else {
      console.log('✅ No console errors detected\n');
    }

    console.log('='.repeat(80));
    console.log('FINAL FULL PAGE SCREENSHOT');
    console.log('='.repeat(80));

    await page.screenshot({
      path: 'ISSUE-FULL-PAGE.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot saved: ISSUE-FULL-PAGE.png\n');

    console.log('='.repeat(80));
    console.log('✅ TESTING COMPLETE');
    console.log('='.repeat(80));
    console.log('\nAll screenshots saved to project root directory.');
    console.log('Review them to identify positioning and functionality issues.\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAllIssues();
