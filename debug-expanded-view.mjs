import { chromium } from 'playwright';

(async () => {
  console.log('🔍 DEBUG: Checking Expanded Flight Card Content\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('1️⃣ Loading flight results...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
      waitUntil: 'networkidle',
      timeout: 90000
    });

    await page.waitForSelector('text=/\\$[0-9,]+/', { timeout: 90000 });
    await page.waitForTimeout(5000);

    console.log('✅ Results loaded\n');

    console.log('2️⃣ Finding Details button...');
    const detailsButton = page.locator('button:has-text("Details")').first();

    if (await detailsButton.count() === 0) {
      console.log('❌ No Details button found!');
      await page.screenshot({ path: 'test-results/debug-no-button.png', fullPage: true });
    } else {
      console.log('✅ Details button found\n');

      console.log('3️⃣ Clicking Details button...');
      await detailsButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ Clicked\n');

      console.log('4️⃣ Taking screenshot of expanded view...');
      await page.screenshot({ path: 'test-results/debug-expanded-full.png', fullPage: true });
      console.log('✅ Screenshot saved\n');

      console.log('5️⃣ Searching for component elements...\n');

      // Check for various text patterns
      const checks = [
        { name: 'Header text (exact)', selector: 'text="Baggage Allowance by Flight Leg"' },
        { name: 'Header text (case-insensitive)', selector: 'text=/baggage allowance by flight leg/i' },
        { name: 'Any "Baggage Allowance"', selector: 'text=/baggage allowance/i' },
        { name: 'Any "Flight Leg"', selector: 'text=/flight leg/i' },
        { name: 'Luggage emoji 🧳', selector: 'text=/🧳/' },
        { name: 'Outbound label', selector: 'text=/Outbound/i' },
        { name: 'Return label', selector: 'text=/Return/i' },
        { name: 'Checked bags text', selector: 'text=/checked bag/i' },
        { name: 'Carry-on text', selector: 'text=/carry-on/i' },
        { name: 'PC (pieces)', selector: 'text=/PC/' },
        { name: 'KG or LBS', selector: 'text=/kg|lbs/i' }
      ];

      for (const check of checks) {
        const count = await page.locator(check.selector).count();
        const icon = count > 0 ? '✅' : '❌';
        console.log(`   ${icon} ${check.name}: ${count} found`);
      }

      console.log('\n6️⃣ Getting all visible text in page...');
      const allText = await page.evaluate(() => {
        return document.body.innerText;
      });

      // Search for our key phrases
      const keyPhrases = [
        'Baggage Allowance by Flight Leg',
        'baggage allowance',
        'Outbound:',
        'Return:',
        'checked bag'
      ];

      console.log('\nSearching for key phrases in page text:');
      for (const phrase of keyPhrases) {
        const found = allText.toLowerCase().includes(phrase.toLowerCase());
        const icon = found ? '✅' : '❌';
        console.log(`   ${icon} "${phrase}": ${found ? 'FOUND' : 'NOT FOUND'}`);
      }

      console.log('\n7️⃣ Checking component structure...');

      // Check for specific class names used in PerSegmentBaggage
      const bgGradient = await page.locator('.bg-gradient-to-br.from-blue-50.to-cyan-50').count();
      console.log(`   Gradient background container: ${bgGradient}`);

      // Extract a sample of text near the Details button
      console.log('\n8️⃣ Sample of expanded content (first 1000 chars):');
      const expandedSection = await page.evaluate(() => {
        const button = document.querySelector('button:has-text("Details")');
        if (!button) return 'Button not found';

        const card = button.closest('[class*="space-y"], [class*="border"], .flight-card');
        if (!card) return 'Card not found';

        return card.innerText.substring(0, 1000);
      });
      console.log(expandedSection);

      console.log('\n9️⃣ Waiting for manual inspection...');
      console.log('Browser will stay open for 30 seconds.');
      await page.waitForTimeout(30000);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({ path: 'test-results/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Debug complete!');
  }
})();
