import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Verifying Deal Score Badge Single-Line Fix\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('Step 1: Navigate to flight results');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Step 2: Wait for "Searching" text to appear (page loaded)');
    await page.waitForSelector('text=/Searching|Procurando|Buscando/', { timeout: 10000 });

    console.log('Step 3: Wait for flight cards to load (skeleton should disappear)');
    // Wait for actual price text to appear (indicates real data loaded)
    await page.waitForSelector('text=/\\$[0-9,]+/', { timeout: 60000 });
    console.log('   ✅ Flight cards detected!\n');

    // Additional wait for complete render
    console.log('Step 4: Wait for complete render...');
    await page.waitForTimeout(8000);

    // Check for Deal Score badges
    console.log('Step 5: Locate Deal Score badges');

    // Look for elements containing score numbers
    const badgeLocators = [
      page.locator('text=/\\d+\\s*Excellent/i'),
      page.locator('text=/\\d+\\s*Great/i'),
      page.locator('text=/\\d+\\s*Good/i'),
      page.locator('text=/\\d+\\s*Fair/i'),
    ];

    let foundBadge = null;
    let badgeTier = '';

    for (const locator of badgeLocators) {
      const count = await locator.count();
      if (count > 0) {
        foundBadge = locator.first();
        const text = await foundBadge.textContent();
        badgeTier = text.match(/Excellent|Great|Good|Fair/i)?.[0] || 'Unknown';
        console.log(`   ✅ Found ${count} "${badgeTier}" badges\n`);
        break;
      }
    }

    if (foundBadge) {
      const box = await foundBadge.boundingBox();
      const text = await foundBadge.textContent();

      console.log('📊 Badge Analysis:');
      console.log(`   Text: "${text}"`);
      console.log(`   Width: ${box?.width}px`);
      console.log(`   Height: ${box?.height}px`);

      if (box) {
        // Single-line badge should be ~24-32px height
        // Multi-line would be 45-60px+
        if (box.height <= 35) {
          console.log(`   ✅ SINGLE-LINE (height ≤ 35px)\n`);
        } else {
          console.log(`   ❌ MULTI-LINE (height > 35px)\n`);
        }

        // Check if "Deal Score" text is present
        if (text.includes('Deal Score')) {
          console.log('   ⚠️  Contains "Deal Score" text (should be removed)\n');
        } else {
          console.log('   ✅ No "Deal Score" text (correct)\n');
        }
      }
    } else {
      console.log('   ⚠️  No Deal Score badges found\n');
      console.log('   Checking page content...');
      const bodyText = await page.textContent('body');
      console.log(`   Page contains ${bodyText.length} characters of text\n`);
    }

    // Screenshot
    console.log('Step 6: Taking screenshots');
    await page.screenshot({
      path: 'deal-score-verification-full.png',
      fullPage: false
    });
    console.log('   ✅ Saved: deal-score-verification-full.png\n');

    // Try to screenshot first card
    const firstCard = await page.locator('.bg-white.rounded-lg.shadow-sm').first();
    if (await firstCard.count() > 0) {
      await firstCard.screenshot({ path: 'deal-score-verification-card.png' });
      console.log('   ✅ Saved: deal-score-verification-card.png\n');
    }

    console.log('✅ Verification complete!\n');
    console.log('🔍 Keeping browser open for 20 seconds for manual inspection...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'deal-score-verification-error.png' });
    console.log('📸 Error screenshot saved\n');
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();
