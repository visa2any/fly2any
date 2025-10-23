import { chromium } from '@playwright/test';

async function testTooltipFix() {
  console.log('🔍 Testing Tooltip Overflow Fix\n');

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
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Waiting for flight API call...');
    // Wait for the flight search API to complete
    await page.waitForResponse(
      response => response.url().includes('/api/flights/search') && response.status() === 200,
      { timeout: 30000 }
    );
    console.log('✅ API call completed');

    console.log('Waiting for flights to render...');
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded\n');

    console.log('Step 2: Expand first flight card...');
    const detailsButton = await page.$('button:has-text("Details")');
    if (detailsButton) {
      await detailsButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight card expanded\n');
    }

    console.log('Step 3: Find Deal Score badge...');

    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'TOOLTIP-TEST-0-page-state.png', fullPage: true });
    console.log('📸 Screenshot: TOOLTIP-TEST-0-page-state.png');

    // Look for the deal score badge with multiple strategies
    let dealScoreBadges = await page.$$('text=/\\d+.*Deal/i');
    if (dealScoreBadges.length === 0) {
      dealScoreBadges = await page.$$('[class*="rounded-full"]:has-text("Deal")');
    }
    if (dealScoreBadges.length === 0) {
      dealScoreBadges = await page.$$('[class*="border"]:has-text("Score")');
    }
    if (dealScoreBadges.length === 0) {
      // Try looking for any element with numbers that could be a score
      dealScoreBadges = await page.$$('div:has-text("70"), div:has-text("80"), div:has-text("90")');
    }
    console.log(`Found ${dealScoreBadges.length} potential deal score elements\n`);

    console.log('Step 4: Hover over Deal Score badge to trigger tooltip...');
    if (dealScoreBadges.length > 0) {
      const badge = dealScoreBadges[0];

      await badge.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Get badge position
      const badgeBox = await badge.boundingBox();
      console.log(`Badge position: (${Math.round(badgeBox.x)}, ${Math.round(badgeBox.y)})`);

      // Hover over badge
      await badge.hover();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'TOOLTIP-TEST-1-hover.png' });
      console.log('📸 Screenshot: TOOLTIP-TEST-1-hover.png\n');

      console.log('Step 5: Check tooltip positioning...');

      // Check for tooltips
      const tooltips = await page.$$('[class*="absolute"][class*="group-hover:visible"]');
      console.log(`Found ${tooltips.length} tooltip elements`);

      if (tooltips.length > 0) {
        for (let i = 0; i < tooltips.length; i++) {
          const tooltip = tooltips[i];
          const isVisible = await tooltip.isVisible().catch(() => false);

          if (isVisible) {
            const box = await tooltip.boundingBox();
            if (box) {
              console.log(`\nTooltip ${i + 1} bounding box:`);
              console.log(`  Position: (${Math.round(box.x)}, ${Math.round(box.y)})`);
              console.log(`  Size: ${Math.round(box.width)}x${Math.round(box.height)}`);
              console.log(`  Right edge: ${Math.round(box.x + box.width)}`);
              console.log(`  Bottom edge: ${Math.round(box.y + box.height)}`);

              // Check if tooltip overflows viewport
              const overflowRight = box.x + box.width > 1920;
              const overflowLeft = box.x < 0;
              const overflowTop = box.y < 0;
              const overflowBottom = box.y + box.height > 1080;

              if (overflowRight || overflowLeft || overflowTop || overflowBottom) {
                console.log('\n❌ TOOLTIP OVERFLOWS VIEWPORT!');
                if (overflowRight) console.log('   - Overflows RIGHT edge');
                if (overflowLeft) console.log('   - Overflows LEFT edge');
                if (overflowTop) console.log('   - Overflows TOP edge');
                if (overflowBottom) console.log('   - Overflows BOTTOM edge');
                console.log('\n🐛 BUG STILL EXISTS!\n');
              } else {
                console.log('\n✅ TOOLTIP CONTAINED WITHIN VIEWPORT!');
                console.log('🎉 FIX SUCCESSFUL!\n');
              }
            }
          }
        }
      } else {
        console.log('\n⚠️  No tooltip elements found (may not be visible yet)');
      }

      await page.mouse.move(0, 0);
      await page.waitForTimeout(1000);
    }

    console.log('\n' + '='.repeat(80));
    console.log('TOOLTIP TEST COMPLETE');
    console.log('='.repeat(80));
    console.log('\n✅ Tooltip overflow fix has been tested');
    console.log('📸 Check TOOLTIP-TEST-1-hover.png for visual verification\n');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'TOOLTIP-TEST-ERROR.png', fullPage: true });
  } finally {
    console.log('⏸️  Keeping browser open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testTooltipFix();
