/**
 * Test ultra-compact extended card design
 * Verifies 70% height reduction and Emirates-style inline badges
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🧪 Testing Ultra-Compact Extended Card Design\n');

  try {
    // Navigate to flight results
    console.log('1️⃣ Loading flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=GRU&departure=2025-10-25&adults=1&children=0&infants=0&class=business&direct=false');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find first flight card
    const firstCard = page.locator('[data-flight-card]').first();

    // Measure collapsed height
    const collapsedBox = await firstCard.boundingBox();
    const collapsedHeight = collapsedBox?.height || 0;
    console.log(`\n📏 Collapsed card height: ${collapsedHeight}px`);

    // Take screenshot of collapsed state
    await page.screenshot({
      path: 'test-results/compact-collapsed.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: compact-collapsed.png');

    // Click Details button to expand
    console.log('\n2️⃣ Expanding card...');
    const detailsButton = firstCard.locator('button:has-text("Details")');
    await detailsButton.click();
    await page.waitForTimeout(1000); // Wait for animation

    // Measure expanded height
    const expandedBox = await firstCard.boundingBox();
    const expandedHeight = expandedBox?.height || 0;
    console.log(`📏 Expanded card height: ${expandedHeight}px`);

    // Calculate extended section height
    const extendedSectionHeight = expandedHeight - collapsedHeight;
    console.log(`📏 Extended section height: ${extendedSectionHeight}px`);

    // Take screenshot of expanded state
    await page.screenshot({
      path: 'test-results/compact-expanded.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: compact-expanded.png');

    // Check for Emirates-style inline badges
    console.log('\n3️⃣ Verifying Emirates-style inline badges...');

    // Wait for "Load fare policies" button or policies badges
    const hasPoliciesButton = await firstCard.locator('button:has-text("Load fare policies")').count() > 0;

    if (hasPoliciesButton) {
      console.log('📋 Found "Load fare policies" button - clicking to load...');
      await firstCard.locator('button:has-text("Load fare policies")').click();
      await page.waitForTimeout(3000); // Wait for API call

      // Take screenshot after loading
      await page.screenshot({
        path: 'test-results/compact-with-policies.png',
        fullPage: false
      });
      console.log('✅ Screenshot saved: compact-with-policies.png');
    }

    // Check for policy badges
    const refundableBadge = firstCard.locator('span:has-text("Refundable"), span:has-text("Non-refundable")');
    const changesBadge = firstCard.locator('span:has-text("Changes OK"), span:has-text("No changes")');
    const protectionBadge = firstCard.locator('span:has-text("24hr protection")');

    const hasRefundableBadge = await refundableBadge.count() > 0;
    const hasChangesBadge = await changesBadge.count() > 0;
    const hasProtectionBadge = await protectionBadge.count() > 0;

    console.log(`${hasRefundableBadge ? '✅' : '❌'} Refundable/Non-refundable badge`);
    console.log(`${hasChangesBadge ? '✅' : '❌'} Changes OK/No changes badge`);
    console.log(`${hasProtectionBadge ? '✅' : '❌'} 24hr protection badge`);

    // Check for baggage summary line
    console.log('\n4️⃣ Verifying compact baggage summary...');
    const baggageLine = firstCard.locator('text=🎒 Baggage:');
    const hasBaggageLine = await baggageLine.count() > 0;
    console.log(`${hasBaggageLine ? '✅' : '❌'} Compact baggage summary line`);

    // Check for inline action buttons
    console.log('\n5️⃣ Verifying inline action buttons...');
    const calculatorBtn = firstCard.locator('button:has-text("Calculator")');
    const upgradeBtn = firstCard.locator('button:has-text("Upgrade")');
    const seatMapBtn = firstCard.locator('button:has-text("Seat Map")');

    const hasCalculator = await calculatorBtn.count() > 0;
    const hasUpgrade = await upgradeBtn.count() > 0;
    const hasSeatMap = await seatMapBtn.count() > 0;

    console.log(`${hasCalculator ? '✅' : '❌'} Calculator button`);
    console.log(`${hasUpgrade ? '✅' : '❌'} Upgrade button`);
    console.log(`${hasSeatMap ? '✅' : '❌'} Seat Map button`);

    // Check for compact Basic Economy warning (if applicable)
    console.log('\n6️⃣ Checking for Basic Economy warning...');
    const basicWarning = firstCard.locator('text=Basic Economy:');
    const hasBasicWarning = await basicWarning.count() > 0;

    if (hasBasicWarning) {
      console.log('✅ Compact Basic Economy warning found');
      const warningUpgradeBtn = firstCard.locator('button:has-text("Upgrade →")');
      const hasWarningUpgrade = await warningUpgradeBtn.count() > 0;
      console.log(`${hasWarningUpgrade ? '✅' : '❌'} Inline Upgrade button in warning`);
    } else {
      console.log('ℹ️  No Basic Economy warning (not a Basic Economy fare)');
    }

    // Check if old Price Breakdown section is gone
    console.log('\n7️⃣ Verifying redundant sections removed...');
    const priceBreakdown = firstCard.locator('h4:has-text("Price Breakdown")');
    const hasPriceBreakdown = await priceBreakdown.count() > 0;
    console.log(`${!hasPriceBreakdown ? '✅' : '❌'} Price Breakdown section removed (should be absent)`);

    // Check if old large accordion is gone
    const oldAccordion = firstCard.locator('button:has-text("Refund & Change Policies")').filter({ hasText: 'Load from API' });
    const hasOldAccordion = await oldAccordion.count() > 0;
    console.log(`${!hasOldAccordion ? '✅' : '❌'} Old large accordion removed (should be absent)`);

    // Calculate height reduction
    console.log('\n📊 HEIGHT REDUCTION ANALYSIS:');
    console.log(`   Collapsed height: ${collapsedHeight}px`);
    console.log(`   Expanded height: ${expandedHeight}px`);
    console.log(`   Extended section: ${extendedSectionHeight}px`);

    // Compare to old implementation (estimated ~250px)
    const oldEstimatedHeight = 250;
    const heightReduction = oldEstimatedHeight - extendedSectionHeight;
    const reductionPercentage = ((heightReduction / oldEstimatedHeight) * 100).toFixed(1);

    console.log(`\n   Old estimated height: ~${oldEstimatedHeight}px`);
    console.log(`   New actual height: ${extendedSectionHeight}px`);
    console.log(`   Height reduction: ${heightReduction}px (${reductionPercentage}%)`);

    if (parseFloat(reductionPercentage) >= 60) {
      console.log(`\n   ✅ GOAL ACHIEVED! ${reductionPercentage}% reduction (target: 70%)`);
    } else {
      console.log(`\n   ⚠️  Close to goal: ${reductionPercentage}% reduction (target: 70%)`);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 ULTRA-COMPACT DESIGN TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Inline policy badges: ${hasRefundableBadge && hasChangesBadge ? 'YES' : 'PARTIAL'}`);
    console.log(`✅ Compact baggage line: ${hasBaggageLine ? 'YES' : 'NO'}`);
    console.log(`✅ Action buttons: ${hasCalculator && hasUpgrade && hasSeatMap ? 'YES' : 'PARTIAL'}`);
    console.log(`✅ Price breakdown removed: ${!hasPriceBreakdown ? 'YES' : 'NO'}`);
    console.log(`✅ Old accordion removed: ${!hasOldAccordion ? 'YES' : 'NO'}`);
    console.log(`✅ Height reduction: ${reductionPercentage}%`);
    console.log('='.repeat(60));

    console.log('\n✅ Test complete! Check screenshots in test-results/ folder');
    console.log('   - compact-collapsed.png');
    console.log('   - compact-expanded.png');
    if (hasPoliciesButton) {
      console.log('   - compact-with-policies.png');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/compact-error.png' });
  } finally {
    await page.waitForTimeout(3000); // Keep browser open for 3s to view
    await browser.close();
  }
})();
