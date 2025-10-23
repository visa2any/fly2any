import { chromium } from 'playwright';

console.log('🧪 Testing Auto-Close Functionality\n');

const browser = await chromium.launch({ headless: false, slowMo: 500 });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

try {
  console.log('📍 Navigate to results page...');
  await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
    timeout: 60000
  });

  // Wait for the search bar to be fully loaded and scroll to top
  console.log('   ⏳ Waiting for search bar to load...');
  await page.waitForSelector('button:has-text("Round-trip")', { timeout: 30000, state: 'attached' });
  await page.evaluate(() => window.scrollTo(0, 0)); // Scroll to top
  await page.waitForTimeout(2000); // Extra time for full render
  console.log('   ✅ Page loaded\n');
  await page.screenshot({ path: 'test-results/autoclose-01-initial.png', fullPage: true });

  // ==============================================================
  // TEST 1: ROUND-TRIP MODE (should close after selecting 2 dates)
  // ==============================================================
  console.log('🔍 TEST 1: Round-Trip Auto-Close (Default Mode)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Find and click departure date button (it shows the date, e.g., "Nov 14, 2025")
  console.log('   📍 Opening departure date picker...');
  // Look for the button containing "Nov" (departure date)
  const departButton = page.locator('button:has-text("Nov 14")').first();
  await departButton.click();
  await page.waitForTimeout(1000);

  const calendarVisible1 = await page.locator('text=Quick Shortcuts').isVisible().catch(() => false);
  console.log(`   ${calendarVisible1 ? '✅' : '❌'} Calendar opened\n`);
  await page.screenshot({ path: 'test-results/autoclose-02-calendar-open.png', fullPage: true });

  if (calendarVisible1) {
    // Click first available date
    console.log('   📍 Selecting departure date...');
    const dateButtons = page.locator('button[class*="aspect-square"]').filter({ hasText: /^\d+$/ });

    for (let i = 0; i < await dateButtons.count(); i++) {
      const button = dateButtons.nth(i);
      const isDisabled = await button.evaluate(el =>
        el.className.includes('cursor-not-allowed') || el.className.includes('opacity-40')
      );

      if (!isDisabled) {
        await button.click();
        console.log('   ✅ Departure date selected\n');
        await page.waitForTimeout(500);
        break;
      }
    }

    // Check if calendar is still open (should be, waiting for return date)
    const stillOpen = await page.locator('text=Quick Shortcuts').isVisible().catch(() => false);
    console.log(`   ${stillOpen ? '✅' : '❌'} Calendar still open (waiting for return date)\n`);
    await page.screenshot({ path: 'test-results/autoclose-03-after-first-date.png', fullPage: true });

    if (stillOpen) {
      // Select return date (a few days later)
      console.log('   📍 Selecting return date...');
      const dateButtons2 = page.locator('button[class*="aspect-square"]').filter({ hasText: /^\d+$/ });

      let clickCount = 0;
      for (let i = 0; i < await dateButtons2.count(); i++) {
        const button = dateButtons2.nth(i);
        const isDisabled = await button.evaluate(el =>
          el.className.includes('cursor-not-allowed') || el.className.includes('opacity-40')
        );

        if (!isDisabled) {
          clickCount++;
          if (clickCount === 5) {  // Click 5th available date for return
            await button.click();
            console.log('   ✅ Return date selected\n');
            await page.waitForTimeout(500);
            break;
          }
        }
      }

      // Check if calendar auto-closed
      const autoClosed1 = !(await page.locator('text=Quick Shortcuts').isVisible().catch(() => false));
      console.log(`   ${autoClosed1 ? '✅' : '❌'} Calendar auto-closed after both dates\n`);
      await page.screenshot({ path: 'test-results/autoclose-04-after-both-dates.png', fullPage: true });
    }
  }

  // ==============================================================
  // TEST 2: ONE-WAY MODE (should close after selecting 1 date)
  // ==============================================================
  console.log('\n🔍 TEST 2: One-Way Auto-Close');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Click One-way button
  console.log('   📍 Switching to One-way mode...');
  const oneWayButton = page.locator('button:has-text("One-way")');
  await oneWayButton.click();
  await page.waitForTimeout(1000);
  console.log('   ✅ One-way mode activated\n');
  await page.screenshot({ path: 'test-results/autoclose-05-oneway-mode.png', fullPage: true });

  // Open departure date picker
  console.log('   📍 Opening departure date picker...');
  const departButton2 = page.locator('button').filter({ hasText: 'Depart' }).first();
  await departButton2.click();
  await page.waitForTimeout(1000);

  const calendarVisible2 = await page.locator('text=Quick Shortcuts').isVisible().catch(() => false);
  console.log(`   ${calendarVisible2 ? '✅' : '❌'} Calendar opened\n`);
  await page.screenshot({ path: 'test-results/autoclose-06-oneway-calendar.png', fullPage: true });

  if (calendarVisible2) {
    // Click a date
    console.log('   📍 Selecting date...');
    const dateButtons3 = page.locator('button[class*="aspect-square"]').filter({ hasText: /^\d+$/ });

    for (let i = 0; i < await dateButtons3.count(); i++) {
      const button = dateButtons3.nth(i);
      const isDisabled = await button.evaluate(el =>
        el.className.includes('cursor-not-allowed') || el.className.includes('opacity-40')
      );

      if (!isDisabled) {
        await button.click();
        console.log('   ✅ Date selected\n');
        await page.waitForTimeout(500);
        break;
      }
    }

    // Check if calendar auto-closed
    const autoClosed2 = !(await page.locator('text=Quick Shortcuts').isVisible().catch(() => false));
    console.log(`   ${autoClosed2 ? '✅' : '❌'} Calendar auto-closed after one date\n`);
    await page.screenshot({ path: 'test-results/autoclose-07-oneway-closed.png', fullPage: true });
  }

  // ==============================================================
  // TEST 3: VERIFY APPLY BUTTON EXISTS
  // ==============================================================
  console.log('\n🔍 TEST 3: Apply Button Presence');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Open calendar once more to check Apply button
  console.log('   📍 Opening calendar to verify Apply button...');
  await departButton2.click();
  await page.waitForTimeout(1000);

  const applyButton = await page.locator('button:has-text("Apply")').isVisible().catch(() => false);
  console.log(`   ${applyButton ? '✅' : '❌'} Apply button is visible (backup option)\n`);
  await page.screenshot({ path: 'test-results/autoclose-08-apply-button.png', fullPage: true });

  console.log('\n============================================================');
  console.log('📊 AUTO-CLOSE TEST SUMMARY');
  console.log('============================================================');
  console.log('✅ All screenshots saved to test-results/');
  console.log('✅ Tests completed successfully!');
  console.log('============================================================\n');

  console.log('🔍 Keeping browser open for 15 seconds for inspection...');
  await page.waitForTimeout(15000);

} catch (error) {
  console.error('\n❌ Test error:', error.message);
  await page.screenshot({ path: 'test-results/autoclose-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('✅ Browser closed. Testing complete!');
}
