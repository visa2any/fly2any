import { chromium } from 'playwright';

console.log('🧪 Starting Auto-Close Functionality Tests...\n');

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 }
});
const page = await context.newPage();

try {
  // Navigate to flight results page where EnhancedSearchBar is displayed
  console.log('📍 Step 1: Navigate to flight results page...');
  try {
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(3000); // Give it time to load flight results
    console.log('   ✅ Results page loaded\n');
  } catch (navError) {
    console.error('   ❌ Navigation failed:', navError.message);
    throw navError;
  }

  // Take screenshot of initial state
  await page.screenshot({ path: 'test-results/autoclose-01-results-page.png', fullPage: true });

  // ============================================================
  // TEST 1: ONE-WAY MODE AUTO-CLOSE
  // ============================================================
  console.log('🔍 TEST 1: One-Way Mode Auto-Close');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Click one-way radio button
  console.log('   📍 Selecting "One-Way" mode...');
  const oneWayRadio = page.locator('input[value="one-way"]');
  await oneWayRadio.click();
  await page.waitForTimeout(500);
  console.log('   ✅ One-Way mode selected\n');

  // Open departure date picker
  console.log('   📍 Opening departure date picker...');
  const departureButton = page.locator('button:has-text("Depart")').first();
  await departureButton.click();
  await page.waitForTimeout(500);

  // Check if calendar is visible
  const calendarVisible1 = await page.locator('[class*="bg-white"][class*="rounded-lg"][class*="shadow"]').filter({ hasText: 'Quick Shortcuts' }).isVisible();
  console.log(`   ${calendarVisible1 ? '✅' : '❌'} Calendar opened\n`);

  await page.screenshot({ path: 'test-results/autoclose-02-oneway-calendar-open.png', fullPage: true });

  // Click a future date (15 days from now)
  console.log('   📍 Selecting a date...');
  const dateButtons = page.locator('button[class*="aspect-square"]').filter({ hasText: /^\d+$/ });
  const dateCount = await dateButtons.count();

  let clickedDate = false;
  for (let i = 0; i < dateCount; i++) {
    const button = dateButtons.nth(i);
    const isDisabled = await button.evaluate(el => {
      return el.className.includes('cursor-not-allowed') ||
             el.className.includes('opacity-40') ||
             el.hasAttribute('disabled');
    });

    if (!isDisabled) {
      await button.click();
      clickedDate = true;
      console.log('   ✅ Date selected\n');
      break;
    }
  }

  if (!clickedDate) {
    console.log('   ⚠️  Could not find available date to click\n');
  }

  // Wait for auto-close (should happen within 200ms)
  await page.waitForTimeout(300);

  // Check if calendar is closed
  const calendarClosed1 = !(await page.locator('[class*="bg-white"][class*="rounded-lg"][class*="shadow"]').filter({ hasText: 'Quick Shortcuts' }).isVisible());
  console.log(`   ${calendarClosed1 ? '✅' : '❌'} Calendar auto-closed after selecting one date\n`);

  await page.screenshot({ path: 'test-results/autoclose-03-oneway-after-selection.png', fullPage: true });

  // ============================================================
  // TEST 2: ROUND-TRIP MODE AUTO-CLOSE
  // ============================================================
  console.log('\n🔍 TEST 2: Round-Trip Mode Auto-Close');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Click round-trip radio button
  console.log('   📍 Selecting "Round-Trip" mode...');
  const roundTripRadio = page.locator('input[value="round-trip"]');
  await roundTripRadio.click();
  await page.waitForTimeout(500);
  console.log('   ✅ Round-Trip mode selected\n');

  // Open departure date picker
  console.log('   📍 Opening departure date picker...');
  const departureButton2 = page.locator('button:has-text("Depart")').first();
  await departureButton2.click();
  await page.waitForTimeout(500);

  const calendarVisible2 = await page.locator('[class*="bg-white"][class*="rounded-lg"][class*="shadow"]').filter({ hasText: 'Quick Shortcuts' }).isVisible();
  console.log(`   ${calendarVisible2 ? '✅' : '❌'} Calendar opened\n`);

  await page.screenshot({ path: 'test-results/autoclose-04-roundtrip-calendar-open.png', fullPage: true });

  // Select departure date
  console.log('   📍 Selecting departure date...');
  const dateButtons2 = page.locator('button[class*="aspect-square"]').filter({ hasText: /^\d+$/ });
  const dateCount2 = await dateButtons2.count();

  let firstDateClicked = false;
  for (let i = 0; i < dateCount2; i++) {
    const button = dateButtons2.nth(i);
    const isDisabled = await button.evaluate(el => {
      return el.className.includes('cursor-not-allowed') ||
             el.className.includes('opacity-40') ||
             el.hasAttribute('disabled');
    });

    if (!isDisabled) {
      await button.click();
      firstDateClicked = true;
      console.log('   ✅ Departure date selected\n');
      break;
    }
  }

  await page.waitForTimeout(300);

  // Check if calendar is STILL OPEN (should not auto-close yet)
  const calendarStillOpen = await page.locator('[class*="bg-white"][class*="rounded-lg"][class*="shadow"]').filter({ hasText: 'Quick Shortcuts' }).isVisible();
  console.log(`   ${calendarStillOpen ? '✅' : '❌'} Calendar still open (waiting for return date)\n`);

  await page.screenshot({ path: 'test-results/autoclose-05-roundtrip-first-date.png', fullPage: true });

  // Select return date (a few days later)
  console.log('   📍 Selecting return date...');
  const dateButtons3 = page.locator('button[class*="aspect-square"]').filter({ hasText: /^\d+$/ });
  const dateCount3 = await dateButtons3.count();

  let secondDateClicked = false;
  let clickCount = 0;
  for (let i = 0; i < dateCount3; i++) {
    const button = dateButtons3.nth(i);
    const isDisabled = await button.evaluate(el => {
      return el.className.includes('cursor-not-allowed') ||
             el.className.includes('opacity-40') ||
             el.hasAttribute('disabled');
    });

    if (!isDisabled) {
      clickCount++;
      // Click the 3rd available date (to ensure it's after the first)
      if (clickCount === 3) {
        await button.click();
        secondDateClicked = true;
        console.log('   ✅ Return date selected\n');
        break;
      }
    }
  }

  // Wait for auto-close (should happen within 200ms)
  await page.waitForTimeout(300);

  // Check if calendar is closed NOW
  const calendarClosed2 = !(await page.locator('[class*="bg-white"][class*="rounded-lg"][class*="shadow"]').filter({ hasText: 'Quick Shortcuts' }).isVisible());
  console.log(`   ${calendarClosed2 ? '✅' : '❌'} Calendar auto-closed after selecting both dates\n`);

  await page.screenshot({ path: 'test-results/autoclose-06-roundtrip-after-both.png', fullPage: true });

  // ============================================================
  // TEST 3: VERIFY APPLY BUTTON IS STILL PRESENT
  // ============================================================
  console.log('\n🔍 TEST 3: Apply Button Presence (Backup Option)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Open calendar again
  console.log('   📍 Opening calendar to check Apply button...');
  await departureButton2.click();
  await page.waitForTimeout(500);

  const calendarVisible3 = await page.locator('[class*="bg-white"][class*="rounded-lg"][class*="shadow"]').filter({ hasText: 'Quick Shortcuts' }).isVisible();
  console.log(`   ${calendarVisible3 ? '✅' : '❌'} Calendar opened\n`);

  // Check for Apply button
  const applyButton = page.locator('button:has-text("Apply")');
  const applyButtonVisible = await applyButton.isVisible();
  console.log(`   ${applyButtonVisible ? '✅' : '❌'} Apply button is visible (backup option)\n`);

  await page.screenshot({ path: 'test-results/autoclose-07-apply-button-check.png', fullPage: true });

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n============================================================');
  console.log('📊 AUTO-CLOSE TEST SUMMARY');
  console.log('============================================================');
  console.log(`✅ One-way auto-close: ${calendarClosed1 ? 'WORKING' : 'FAILED'}`);
  console.log(`✅ Round-trip waits for 2nd date: ${calendarStillOpen ? 'WORKING' : 'FAILED'}`);
  console.log(`✅ Round-trip auto-close: ${calendarClosed2 ? 'WORKING' : 'FAILED'}`);
  console.log(`✅ Apply button present: ${applyButtonVisible ? 'YES' : 'NO'}`);
  console.log(`📸 Total screenshots: 7`);
  console.log('============================================================\n');

  const allTestsPassed = calendarClosed1 && calendarStillOpen && calendarClosed2 && applyButtonVisible;

  if (allTestsPassed) {
    console.log('✨ All auto-close tests PASSED! 🎉\n');
  } else {
    console.log('⚠️  Some tests FAILED. Review screenshots for details.\n');
  }

  console.log('📁 All screenshots saved to: test-results/\n');
  console.log('🔍 Keeping browser open for 10 seconds for manual inspection...');
  await page.waitForTimeout(10000);

} catch (error) {
  console.error('❌ Test error:', error);
  await page.screenshot({ path: 'test-results/autoclose-error.png', fullPage: true });
} finally {
  await browser.close();
  console.log('✅ Browser closed. Testing complete!');
}
