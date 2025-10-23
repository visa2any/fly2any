import { chromium } from 'playwright';

console.log('🧪 Final Auto-Close Functionality Test\n');

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

let testResults = {
  roundTripWaitsForSecondDate: false,
  roundTripAutoCloses: false,
  oneWayAutoCloses: false,
  applyButtonPresent: false
};

try {
  console.log('📍 Step 1: Navigate to results page...');
  await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
    timeout: 60000
  });
  await page.waitForSelector('button:has-text("Round-trip")', { timeout: 30000, state: 'attached' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
  console.log('   ✅ Page loaded\n');
  await page.screenshot({ path: 'test-results/final-01-page-loaded.png', fullPage: false });

  // ==============================================================
  // TEST 1: ROUND-TRIP MODE - Should wait for 2nd date before closing
  // ==============================================================
  console.log('🔍 TEST 1: Round-Trip Mode (Default) - Auto-Close After Both Dates');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Scroll to top and click the departure date
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  console.log('   📍 Clicking departure date button...');
  const departureDateButton = page.locator('button:has-text("Nov 14")').or(page.locator('button:has-text("Nov 15")'));
  await departureDateButton.first().click();
  await page.waitForTimeout(1000);

  // Check if calendar opened
  const calendarOpen1 = await page.locator('div').filter({ hasText: 'November' }).and(page.locator('div').filter({ hasText: 'December' })).count() > 0;
  console.log(`   ${calendarOpen1 ? '✅' : '❌'} Calendar opened\n`);
  await page.screenshot({ path: 'test-results/final-02-calendar-opened.png', fullPage: false });

  if (calendarOpen1) {
    // Click first available date (departure)
    console.log('   📍 Selecting departure date...');
    const futureDates = page.locator('button').filter({ hasText: /^(20|21|22|23|24|25)$/ }).first();
    await futureDates.click();
    await page.waitForTimeout(800);
    console.log('   ✅ Departure date selected\n');
    await page.screenshot({ path: 'test-results/final-03-departure-selected.png', fullPage: false });

    // Check if calendar is STILL OPEN (should be waiting for return date)
    const stillOpen = await page.locator('div').filter({ hasText: 'November' }).or(page.locator('div').filter({ hasText: 'December' })).count() > 0;
    testResults.roundTripWaitsForSecondDate = stillOpen;
    console.log(`   ${stillOpen ? '✅' : '❌'} Calendar still open (waiting for return date)\n`);

    if (stillOpen) {
      // Click second date (return)
      console.log('   📍 Selecting return date...');
      const returnDate = page.locator('button').filter({ hasText: /^(26|27|28|29)$/ }).first();
      await returnDate.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Return date selected\n');

      // Check if calendar AUTO-CLOSED
      const autoClosed = await page.locator('div').filter({ hasText: 'November' }).and(page.locator('div').filter({ hasText: 'December' })).count() === 0;
      testResults.roundTripAutoCloses = autoClosed;
      console.log(`   ${autoClosed ? '✅' : '❌'} Calendar auto-closed after both dates selected\n`);
      await page.screenshot({ path: 'test-results/final-04-roundtrip-closed.png', fullPage: false });
    }
  }

  // ==============================================================
  // TEST 2: ONE-WAY MODE - Should close immediately after 1 date
  // ==============================================================
  console.log('\n🔍 TEST 2: One-Way Mode - Auto-Close After Single Date');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Scroll to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Click One-way button (it's in the sticky search bar)
  console.log('   📍 Switching to One-way mode...');
  const oneWayBtn = page.locator('button:has-text("One-way")');
  await oneWayBtn.click({ force: true });
  await page.waitForTimeout(1000);
  console.log('   ✅ One-way mode selected\n');
  await page.screenshot({ path: 'test-results/final-05-oneway-mode.png', fullPage: false });

  // Open departure date calendar
  console.log('   📍 Opening departure date picker...');
  await page.evaluate(() => window.scrollTo(0, 0));
  const departureDateBtn2 = page.locator('button:has-text("Nov 14")').or(page.locator('button:has-text("Nov 15")'));
  await departureDateBtn2.first().click();
  await page.waitForTimeout(1000);
  console.log('   ✅ Calendar opened\n');
  await page.screenshot({ path: 'test-results/final-06-oneway-calendar.png', fullPage: false });

  // Click a single date
  console.log('   📍 Selecting date...');
  const singleDate = page.locator('button').filter({ hasText: /^(18|19|20|21)$/ }).first();
  await singleDate.click();
  await page.waitForTimeout(500);
  console.log('   ✅ Date selected\n');

  // Check if calendar AUTO-CLOSED immediately
  const autoClosedOneway = await page.locator('div').filter({ hasText: 'November' }).and(page.locator('div').filter({ hasText: 'December' })).count() === 0;
  testResults.oneWayAutoCloses = autoClosedOneway;
  console.log(`   ${autoClosedOneway ? '✅' : '❌'} Calendar auto-closed after one date\n`);
  await page.screenshot({ path: 'test-results/final-07-oneway-closed.png', fullPage: false });

  // ==============================================================
  // TEST 3: VERIFY APPLY BUTTON IS PRESENT (Backup Option)
  // ==============================================================
  console.log('\n🔍 TEST 3: Apply Button Presence (Backup Option)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Open calendar one more time
  await page.evaluate(() => window.scrollTo(0, 0));
  const departureDateBtn3 = page.locator('button:has-text("Nov 14")').or(page.locator('button:has-text("Nov 15")'));
  await departureDateBtn3.first().click();
  await page.waitForTimeout(1000);

  // Check for Apply button
  const applyBtn = await page.locator('button:has-text("Apply")').isVisible();
  testResults.applyButtonPresent = applyBtn;
  console.log(`   ${applyBtn ? '✅' : '❌'} Apply button is visible (backup option)\n`);
  await page.screenshot({ path: 'test-results/final-08-apply-button.png', fullPage: false });

  // ==============================================================
  // FINAL SUMMARY
  // ==============================================================
  console.log('\n' + '='.repeat(70));
  console.log('📊 AUTO-CLOSE FUNCTIONALITY TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`✅ Round-trip waits for 2nd date: ${testResults.roundTripWaitsForSecondDate ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Round-trip auto-closes after both: ${testResults.roundTripAutoCloses ? 'PASS' : 'FAIL'}`);
  console.log(`✅ One-way auto-closes after one: ${testResults.oneWayAutoCloses ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Apply button present (backup): ${testResults.applyButtonPresent ? 'PASS' : 'FAIL'}`);
  console.log('='.repeat(70));

  const allPassed = Object.values(testResults).every(result => result === true);

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Auto-close functionality working perfectly!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review screenshots for details.\n');
  }

  console.log('📁 All screenshots saved to: test-results/\n');
  console.log('🔍 Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

} catch (error) {
  console.error('\n❌ Test error:', error.message);
  await page.screenshot({ path: 'test-results/final-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('✅ Browser closed. Testing complete!');
}
