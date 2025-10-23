import { chromium } from '@playwright/test';

async function testBadgeHeightAndClassDisplay() {
  console.log('🧪 Testing Badge Height Alignment & Class/Fare Type Display\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to flight results
    console.log('1️⃣ Loading flight results page...');
    await page.goto('http://localhost:3001/flights/results?from=JFK&to=LAX&departDate=2025-01-15&returnDate=2025-01-22&adults=1&children=0&infants=0&class=economy&tripType=roundtrip');

    // Wait for flight cards to load
    await page.waitForSelector('[data-testid="flight-card"], .group.relative.bg-white.rounded-xl', { timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for dynamic content

    console.log('✅ Flight cards loaded\n');

    // Step 2: Take screenshot of initial state with badges
    console.log('2️⃣ Capturing initial state with badges...');
    await page.screenshot({
      path: 'test-badge-height-initial.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: test-badge-height-initial.png\n');

    // Step 3: Check badge heights in compact card
    console.log('3️⃣ Checking badge heights in compact view...');
    const badgeHeights = await page.evaluate(() => {
      const badges = document.querySelectorAll('.flex.flex-wrap.items-center.gap-2 > div, .flex.flex-wrap.items-center.gap-2 > span');
      const heights = Array.from(badges).map(badge => ({
        text: badge.textContent?.trim().substring(0, 30) || 'Unknown',
        computedHeight: window.getComputedStyle(badge).height,
        hasH5Class: badge.classList.contains('h-5'),
        hasLeadingNone: badge.classList.contains('leading-none') ||
                        Array.from(badge.querySelectorAll('*')).some(el => el.classList.contains('leading-none'))
      }));
      return heights;
    });

    console.log('Badge Heights Analysis:');
    badgeHeights.forEach((badge, i) => {
      console.log(`  Badge ${i + 1}: "${badge.text}"`);
      console.log(`    - Computed height: ${badge.computedHeight}`);
      console.log(`    - Has h-5 class: ${badge.hasH5Class}`);
      console.log(`    - Has leading-none: ${badge.hasLeadingNone}`);
    });
    console.log('');

    // Step 4: Check for class and fare type display in header
    console.log('4️⃣ Checking class and fare type display...');
    const classAndFareDisplay = await page.evaluate(() => {
      // Look for the purple badge we added
      const classBadges = document.querySelectorAll('.bg-purple-50.text-purple-700');
      return Array.from(classBadges).map(badge => ({
        text: badge.textContent?.trim() || 'Not found',
        visible: badge.offsetHeight > 0
      }));
    });

    if (classAndFareDisplay.length > 0) {
      console.log('✅ Class & Fare Type badges found:');
      classAndFareDisplay.forEach((badge, i) => {
        console.log(`  Badge ${i + 1}: "${badge.text}" (Visible: ${badge.visible})`);
      });
    } else {
      console.log('❌ Class & Fare Type badges NOT found in compact card header');
    }
    console.log('');

    // Step 5: Expand a card to check expanded view badges
    console.log('5️⃣ Expanding first card to check expanded view...');
    const detailsButton = await page.locator('button:has-text("Details")').first();
    await detailsButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-badge-height-expanded.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: test-badge-height-expanded.png\n');

    // Step 6: Final verification
    console.log('6️⃣ Final verification...');
    const allBadgesUniform = badgeHeights.every(badge =>
      badge.computedHeight === '20px' || badge.hasH5Class
    );
    const classDisplayPresent = classAndFareDisplay.length > 0;

    console.log('\n📊 TEST RESULTS:');
    console.log(`  ✓ Badge Height Uniform (h-5/20px): ${allBadgesUniform ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`  ✓ Class & Fare Type Display: ${classDisplayPresent ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`  ✓ Total badges checked: ${badgeHeights.length}`);

    if (allBadgesUniform && classDisplayPresent) {
      console.log('\n🎉 ALL TESTS PASSED! Badge heights are uniform and class/fare type is displayed.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the screenshots.');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'test-badge-height-error.png' });
    console.log('Error screenshot saved: test-badge-height-error.png');
  } finally {
    console.log('\n👁️ Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testBadgeHeightAndClassDisplay().catch(console.error);
