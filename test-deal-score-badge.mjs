import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing Deal Score Badge Fix...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // Navigate to flight results
    console.log('📍 Step 1: Navigate to flight results...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    console.log('   ✅ Page loaded\n');

    // Wait for flight cards to load (not skeletons)
    console.log('📍 Step 2: Wait for flight cards to load...');
    await page.waitForSelector('.bg-gradient-to-br', { timeout: 45000 });
    console.log('   ✅ Flight cards loaded\n');

    // Wait additional time for all data
    console.log('📍 Step 3: Wait for complete render...');
    await page.waitForTimeout(5000);
    console.log('   ✅ Render complete\n');

    // Check for Deal Score badges
    console.log('📍 Step 4: Analyze Deal Score badges...');
    const badges = await page.locator('text=/\\d+.*Excellent|Great|Good|Fair/').all();
    console.log(`   Found ${badges.length} Deal Score badges\n`);

    if (badges.length > 0) {
      // Measure the first badge
      const firstBadge = badges[0];
      const box = await firstBadge.boundingBox();

      if (box) {
        console.log('📏 First Badge Measurements:');
        console.log(`   Width: ${box.width}px`);
        console.log(`   Height: ${box.height}px`);
        console.log(`   Height should be ≤ 32px for single-line display\n`);

        // Check if height indicates single line (should be around 24-32px for single line)
        if (box.height <= 32) {
          console.log('   ✅ Badge appears to be SINGLE LINE\n');
        } else {
          console.log('   ❌ Badge appears to be MULTI-LINE (height > 32px)\n');
        }
      }

      // Get text content
      const text = await firstBadge.textContent();
      console.log(`📝 Badge Text: "${text}"\n`);
    }

    // Screenshot the page
    console.log('📍 Step 5: Taking screenshots...');
    await page.screenshot({
      path: 'deal-score-badge-test-full.png',
      fullPage: true
    });
    console.log('   ✅ Full page: deal-score-badge-test-full.png\n');

    // Screenshot just the first flight card if available
    const firstCard = await page.locator('.bg-gradient-to-br').first().boundingBox();
    if (firstCard) {
      await page.screenshot({
        path: 'deal-score-badge-test-card.png',
        clip: firstCard
      });
      console.log('   ✅ First card: deal-score-badge-test-card.png\n');
    }

    console.log('✨ Test complete!\n');
    console.log('🔍 Keeping browser open for 15 seconds for inspection...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'deal-score-badge-test-error.png' });
    console.log('📸 Error screenshot saved: deal-score-badge-test-error.png');
  } finally {
    await browser.close();
    console.log('✅ Browser closed');
  }
})();
