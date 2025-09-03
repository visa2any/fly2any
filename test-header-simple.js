const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Loading mobile homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'mobile-initial.png' });
    console.log('✓ Initial screenshot saved');
    
    // Try to click on flight service to open form
    console.log('Attempting to open flight form...');
    const flightButton = await page.$('button:has-text("Voos")');
    if (flightButton) {
      await flightButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'mobile-form-opened.png' });
      console.log('✓ Form opened and screenshot saved');
      
      // Count header elements
      const headers = await page.$$('.bg-gradient-to-r.from-purple-600');
      console.log(`\n✅ Header count: ${headers.length} (should be 1)`);
      
      if (headers.length === 1) {
        console.log('SUCCESS: Only one compact header found as expected!');
      } else if (headers.length > 1) {
        console.log('WARNING: Multiple headers detected - duplicate header issue!');
      } else {
        console.log('INFO: No gradient headers found - checking alternative selectors...');
        const altHeaders = await page.$$('[class*="from-purple-600"]');
        console.log(`Alternative header count: ${altHeaders.length}`);
      }
    } else {
      console.log('Flight button not found, trying alternative approach...');
      // Try clicking the first service card
      const serviceCards = await page.$$('button.bg-gradient-to-br');
      if (serviceCards.length > 0) {
        await serviceCards[0].click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'mobile-form-alternative.png' });
        console.log('✓ Clicked service card');
      }
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
})();