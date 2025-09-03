const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  console.log('📸 Visual Confirmation: Original Logo and Hamburger Menu');

  try {
    // Navigate and take screenshots
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');

    // Take screenshot of main page
    await page.screenshot({ path: 'visual-main-page.png', fullPage: false });
    console.log('📸 Main page screenshot saved');

    // Open form and take screenshot
    await page.click('text="Buscar Ofertas Grátis"');
    await page.waitForTimeout(2000);
    console.log('✅ Opened form');

    // Screenshot of step 1 with original header
    await page.screenshot({ path: 'visual-step1-original-header.png', fullPage: false });
    console.log('📸 Step 1 with original header screenshot saved');

    // Go to step 2
    await page.click('text="Passagens Aéreas"');
    await page.waitForTimeout(1000);

    // Screenshot of step 2 with back button
    await page.screenshot({ path: 'visual-step2-with-back.png', fullPage: false });
    console.log('📸 Step 2 with back button screenshot saved');

    console.log('\n🎉 Visual confirmation screenshots taken!');
    console.log('✨ Check the following files to confirm:');
    console.log('  - visual-main-page.png');
    console.log('  - visual-step1-original-header.png');
    console.log('  - visual-step2-with-back.png');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'visual-error.png', fullPage: false });
  }

  await browser.close();
})();