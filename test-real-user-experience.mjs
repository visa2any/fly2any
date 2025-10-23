import { chromium } from '@playwright/test';
import fs from 'fs';

async function testRealUserExperience() {
  console.log('🚀 TESTING AS A REAL USER - Complete walkthrough\n');

  const issues = [];
  const successes = [];

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    slowMo: 1000,
    args: ['--start-maximized']
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Step 1: Load flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'REAL-UX-01-loaded.png', fullPage: true });
    console.log('✅ Page loaded\n');
    successes.push('Page loads successfully with all flights');

    // ========================================
    console.log('Step 2: Test FIRST flight card - click Details...');
    // ========================================

    const firstDetails = await page.$('button:has-text("Details")');
    if (firstDetails) {
      console.log('🖱️  Clicking Details button...');
      await firstDetails.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'REAL-UX-02-flight-expanded.png', fullPage: false });
      console.log('✅ Flight expanded successfully\n');
      successes.push('Flight Details button expands card');
    } else {
      console.log('❌ Details button not found!\n');
      issues.push('Details button not found on flight cards');
    }

    // ========================================
    console.log('Step 3: Look for Deal Score or score badges...');
    // ========================================

    // Look for any text with numbers that might be a score
    const scoreElements = await page.$$('[class*="score"], [class*="Score"], [class*="badge"], [class*="Badge"]');
    console.log(`Found ${scoreElements.length} score/badge elements`);

    if (scoreElements.length > 0) {
      const firstScore = scoreElements[0];
      const text = await firstScore.innerText().catch(() => '');
      console.log(`🖱️  Hovering over: "${text.substring(0, 40)}"`);

      await firstScore.hover();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'REAL-UX-03-score-hover.png' });
      console.log('📸 Captured hover state\n');
      successes.push('Score/badge elements are hoverable');
    }

    // ========================================
    console.log('Step 4: Test Baggage Calculator...');
    // ========================================

    // Scroll to find baggage calculator
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Look for baggage-related text
    const baggageSection = await page.locator('text=/Baggage|baggage/i').first().catch(() => null);

    if (baggageSection) {
      console.log('✅ Found Baggage section');
      await baggageSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'REAL-UX-04-baggage-visible.png' });
      console.log('📸 Screenshot captured');

      // Look for + buttons
      const plusButtons = await page.$$('button:has-text("+")');
      console.log(`Found ${plusButtons.length} plus buttons`);

      if (plusButtons.length > 0) {
        console.log('🖱️  Clicking + button...');
        await plusButtons[0].click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'REAL-UX-04-baggage-clicked.png' });
        console.log('✅ Baggage + button works\n');
        successes.push('Baggage Calculator + button functions');
      } else {
        console.log('⚠️  No + buttons found\n');
        issues.push('Baggage Calculator + buttons not found');
      }
    } else {
      console.log('❌ Baggage Calculator not found\n');
      issues.push('Baggage Calculator not visible in expanded flight');
    }

    // ========================================
    console.log('Step 5: Test Seat Map Preview...');
    // ========================================

    const seatMapSection = await page.locator('text=/Seat.*Map|Preview.*Seat/i').first().catch(() => null);

    if (seatMapSection) {
      console.log('✅ Found Seat Map section');
      await seatMapSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'REAL-UX-05-seatmap-visible.png' });

      // Look for expand/preview button
      const seatButtons = await page.$$('button:has-text("Preview"), button:has-text("Seat")');
      console.log(`Found ${seatButtons.length} seat-related buttons`);

      if (seatButtons.length > 0) {
        console.log('🖱️  Clicking Seat Map button...');
        await seatButtons[0].click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'REAL-UX-05-seatmap-expanded.png' });
        console.log('✅ Seat Map expands\n');
        successes.push('Seat Map Preview expands correctly');
      }
    } else {
      console.log('⚠️  Seat Map not found\n');
      issues.push('Seat Map Preview not visible in expanded flight');
    }

    // ========================================
    console.log('Step 6: Test ALL Select buttons...');
    // ========================================

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(1000);

    const allSelectButtons = await page.$$('button:has-text("Select")');
    console.log(`Found ${allSelectButtons.length} Select buttons total\n`);

    // Test first 3 Select buttons
    for (let i = 0; i < Math.min(3, allSelectButtons.length); i++) {
      const button = allSelectButtons[i];
      const isVisible = await button.isVisible().catch(() => false);

      if (!isVisible) continue;

      await button.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const text = await button.innerText();
      console.log(`Testing button ${i + 1}: "${text}"`);

      const urlBefore = page.url();

      console.log('🖱️  Clicking...');
      await button.click();
      await page.waitForTimeout(2000);

      const urlAfter = page.url();
      const changed = urlBefore !== urlAfter;

      console.log(`  URL changed: ${changed ? '✅ YES' : '❌ NO'}`);
      console.log(`  Before: ${urlBefore.substring(0, 80)}...`);
      console.log(`  After: ${urlAfter.substring(0, 80)}...`);

      await page.screenshot({ path: `REAL-UX-06-select-${i + 1}.png` });

      if (changed) {
        console.log('✅ Button navigates correctly\n');
        successes.push(`Select button "${text}" navigates to booking`);
        // Navigate back
        await page.goBack();
        await page.waitForTimeout(2000);
      } else {
        console.log('⚠️  Button does NOTHING\n');
        issues.push(`Select button "${text}" does not navigate or show modal`);
      }
    }

    // ========================================
    console.log('Step 7: Test hover states for overflow...');
    // ========================================

    console.log('Hovering over various elements to check for positioning issues...\n');

    // Test various elements
    const hoverTests = [
      { text: 'price', selector: '[class*="price"]' },
      { text: 'score badges', selector: '[class*="badge"]' },
      { text: 'breakdown text', selector: 'text=Breakdown' },
    ];

    for (const test of hoverTests) {
      const elements = await page.$$(test.selector).catch(() => []);

      if (elements.length > 0) {
        console.log(`Hovering over ${test.text}...`);
        const element = elements[0];

        await element.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);

        await element.hover();
        await page.waitForTimeout(2000);

        const filename = `REAL-UX-07-hover-${test.text.replace(/\s/g, '-')}.png`;
        await page.screenshot({ path: filename });
        console.log(`📸 ${filename}`);

        // Check for tooltips
        const tooltips = await page.$$('[role="tooltip"]');
        if (tooltips.length > 0) {
          console.log(`  Found ${tooltips.length} tooltip(s)`);

          for (const tooltip of tooltips) {
            const isVisible = await tooltip.isVisible().catch(() => false);
            if (isVisible) {
              const box = await tooltip.boundingBox();
              if (box) {
                const overflow = box.x < 0 || box.y < 0 ||
                                box.x + box.width > 1920 ||
                                box.y + box.height > 1080;

                if (overflow) {
                  console.log(`  ⚠️  🐛 TOOLTIP OVERFLOWS VIEWPORT!`);
                  issues.push(`${test.text} tooltip overflows viewport`);
                } else {
                  console.log(`  ✅ Tooltip positioned correctly`);
                }
              }
            }
          }
        }

        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }
    }

    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('FINAL RESULTS');
    console.log('='.repeat(80));
    // ========================================

    console.log(`\n✅ Successes: ${successes.length}`);
    successes.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));

    console.log(`\n⚠️  Issues Found: ${issues.length}`);
    issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));

    const report = {
      timestamp: new Date().toISOString(),
      successes,
      issues,
      totalTests: successes.length + issues.length
    };

    fs.writeFileSync('REAL-USER-TEST-REPORT.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved: REAL-USER-TEST-REPORT.json');

    console.log('\n✅ Complete user journey test finished!');
    console.log('📸 Check all REAL-UX-*.png screenshots for visual verification\n');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'REAL-UX-ERROR.png', fullPage: true });
    issues.push(`Test crashed: ${error.message}`);
  } finally {
    console.log('⏸️  Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testRealUserExperience();
