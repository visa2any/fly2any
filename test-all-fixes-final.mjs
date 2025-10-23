import { chromium } from '@playwright/test';

async function testAllFixes() {
  console.log('🚀 COMPREHENSIVE FIX VERIFICATION TEST\n');
  console.log('Testing both fixes:');
  console.log('1. ✅ Tooltip overflow fix');
  console.log('2. ✅ Select button functionality\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    slowMo: 800,
    args: ['--start-maximized']
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const testResults = {
    tooltipFix: false,
    mainSelectButton: false,
    brandedFareSelectButton: false,
    allFeaturesVisible: false,
  };

  try {
    console.log('='.repeat(80));
    console.log('STEP 1: LOAD FLIGHT RESULTS PAGE');
    console.log('='.repeat(80) + '\n');

    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Waiting for flight API...');
    await page.waitForResponse(
      response => response.url().includes('/api/flights/search') && response.status() === 200,
      { timeout: 30000 }
    );
    console.log('✅ API returned data');

    console.log('Waiting for flight cards to render...');
    // Wait for Details button to appear (indicates flights have rendered)
    await page.waitForSelector('button:has-text("Details")', { timeout: 15000 });
    console.log('✅ Flights rendered to page\n');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'FINAL-TEST-1-loaded.png', fullPage: true });

    console.log('='.repeat(80));
    console.log('STEP 2: EXPAND FLIGHT CARD');
    console.log('='.repeat(80) + '\n');

    const detailsButton = await page.$('button:has-text("Details")');
    if (detailsButton) {
      await detailsButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight card expanded\n');
      await page.screenshot({ path: 'FINAL-TEST-2-expanded.png' });
    }

    console.log('='.repeat(80));
    console.log('STEP 3: VERIFY ALL FEATURES ARE VISIBLE');
    console.log('='.repeat(80) + '\n');

    // Check Deal Score
    const dealScore = await page.$('text=/\\d+.*Deal/i, text=/Deal.*Score/i');
    if (dealScore) {
      console.log('✅ Deal Score Badge found');
    } else {
      console.log('❌ Deal Score Badge NOT found');
    }

    // Check Baggage Calculator
    const baggageCalc = await page.$('text=/Baggage.*Calculator/i, text=/Total.*Trip.*Cost/i');
    if (baggageCalc) {
      console.log('✅ Baggage Calculator found');
    } else {
      console.log('❌ Baggage Calculator NOT found');
    }

    // Check Seat Map Preview
    const seatMap = await page.$('text=/Seat.*Map/i, text=/Preview.*Seat/i');
    if (seatMap) {
      console.log('✅ Seat Map Preview found');
    } else {
      console.log('⚠️  Seat Map Preview NOT found (may be collapsed)');
    }

    testResults.allFeaturesVisible = !!(dealScore && baggageCalc);
    console.log('');

    console.log('='.repeat(80));
    console.log('STEP 4: TEST TOOLTIP OVERFLOW FIX');
    console.log('='.repeat(80) + '\n');

    // Find and hover over Deal Score badge
    let dealScoreBadges = await page.$$('text=/\\d+.*Deal/i');
    if (dealScoreBadges.length === 0) {
      dealScoreBadges = await page.$$('div:has-text("70"), div:has-text("80"), div:has-text("90")');
    }

    if (dealScoreBadges.length > 0) {
      const badge = dealScoreBadges[0];
      await badge.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      console.log('Hovering over Deal Score badge...');
      await badge.hover();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'FINAL-TEST-3-tooltip-hover.png' });

      // Check tooltip positioning
      const tooltips = await page.$$('[class*="absolute"][class*="group-hover:visible"]');
      if (tooltips.length > 0) {
        for (const tooltip of tooltips) {
          const isVisible = await tooltip.isVisible().catch(() => false);
          if (isVisible) {
            const box = await tooltip.boundingBox();
            if (box) {
              const overflowRight = box.x + box.width > 1920;
              const overflowLeft = box.x < 0;
              const overflowTop = box.y < 0;
              const overflowBottom = box.y + box.height > 1080;

              if (overflowRight || overflowLeft || overflowTop || overflowBottom) {
                console.log('❌ TOOLTIP STILL OVERFLOWS!');
                testResults.tooltipFix = false;
              } else {
                console.log('✅ TOOLTIP FIX VERIFIED - Tooltip stays within viewport');
                testResults.tooltipFix = true;
              }
              break;
            }
          }
        }
      }

      await page.mouse.move(0, 0);
      await page.waitForTimeout(1000);
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('STEP 5: TEST MAIN SELECT BUTTON');
    console.log('='.repeat(80) + '\n');

    // Scroll to find Select button
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);

    const mainSelectButton = await page.$('button:has-text("Select →")');
    if (mainSelectButton) {
      const urlBefore = page.url();
      console.log('Clicking main "Select →" button...');

      await mainSelectButton.click();
      await page.waitForTimeout(2000);

      const urlAfter = page.url();

      if (urlBefore !== urlAfter) {
        console.log('✅ MAIN SELECT BUTTON WORKS - Navigated to booking page');
        console.log(`   URL: ${urlAfter}`);
        testResults.mainSelectButton = true;

        // Navigate back
        await page.goBack();
        await page.waitForTimeout(2000);
      } else {
        console.log('❌ Main Select button did NOT navigate');
        testResults.mainSelectButton = false;
      }
    } else {
      console.log('⚠️  Main Select button not found');
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('STEP 6: TEST BRANDED FARE SELECT BUTTONS');
    console.log('='.repeat(80) + '\n');

    // Expand flight again
    const detailsButton2 = await page.$('button:has-text("Details")');
    if (detailsButton2) {
      await detailsButton2.click();
      await page.waitForTimeout(2000);
    }

    // Look for "Upgrade Your Fare" button
    const upgradeButton = await page.$('button:has-text("Upgrade Your Fare"), button:has-text("Branded Fares")');
    if (upgradeButton) {
      console.log('Found "Upgrade Your Fare" button');
      await upgradeButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      console.log('Clicking to expand branded fares...');
      await upgradeButton.click();
      await page.waitForTimeout(3000); // Wait for API call

      await page.screenshot({ path: 'FINAL-TEST-4-branded-fares.png' });

      // Look for branded fare Select buttons
      const brandedFareButtons = await page.$$('button:has-text("Select")');
      console.log(`Found ${brandedFareButtons.length} Select buttons total`);

      // Try clicking a branded fare Select button (not the main one)
      if (brandedFareButtons.length > 1) {
        // Skip first button (main Select), try second one (branded fare)
        const brandedButton = brandedFareButtons[1];
        const isVisible = await brandedButton.isVisible().catch(() => false);

        if (isVisible) {
          console.log('Clicking branded fare "Select" button...');

          // Listen for console logs
          page.on('console', msg => {
            if (msg.text().includes('Selected branded fare')) {
              console.log('✅ BRANDED FARE SELECT BUTTON WORKS - Handler called');
              testResults.brandedFareSelectButton = true;
            }
          });

          await brandedButton.click();
          await page.waitForTimeout(2000);

          await page.screenshot({ path: 'FINAL-TEST-5-branded-selected.png' });

          // Check if toast appeared
          const toast = await page.$('text=/Flight Selected/i, text=/Success/i');
          if (toast) {
            console.log('✅ Toast notification appeared');
            testResults.brandedFareSelectButton = true;
          }
        }
      } else {
        console.log('⚠️  No branded fare Select buttons found');
      }
    } else {
      console.log('⚠️  "Upgrade Your Fare" button not found');
    }
    console.log('');

    console.log('='.repeat(80));
    console.log('FINAL RESULTS');
    console.log('='.repeat(80) + '\n');

    console.log('✅ All Features Visible:', testResults.allFeaturesVisible ? 'YES' : 'NO');
    console.log('✅ Tooltip Overflow Fixed:', testResults.tooltipFix ? 'YES' : 'NO');
    console.log('✅ Main Select Button Works:', testResults.mainSelectButton ? 'YES' : 'NO');
    console.log('✅ Branded Fare Select Works:', testResults.brandedFareSelectButton ? 'YES' : 'NO');

    const allPassed = Object.values(testResults).every(result => result);

    console.log('\n' + '='.repeat(80));
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! 🎉');
    } else {
      console.log('⚠️  SOME TESTS FAILED - See details above');
    }
    console.log('='.repeat(80) + '\n');

    console.log('📸 Screenshots saved:');
    console.log('   - FINAL-TEST-1-loaded.png');
    console.log('   - FINAL-TEST-2-expanded.png');
    console.log('   - FINAL-TEST-3-tooltip-hover.png');
    console.log('   - FINAL-TEST-4-branded-fares.png');
    console.log('   - FINAL-TEST-5-branded-selected.png');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'FINAL-TEST-ERROR.png', fullPage: true });
  } finally {
    console.log('\n⏸️  Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testAllFixes();
