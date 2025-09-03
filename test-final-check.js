const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Loading mobile homepage on port 3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'final-mobile-home.png' });
    console.log('✓ Homepage screenshot saved');
    
    // Click on first service to open form
    console.log('\nOpening lead form...');
    const firstService = await page.$('button.bg-gradient-to-br');
    
    if (firstService) {
      await firstService.click();
      await page.waitForTimeout(3000);
      
      // Take form screenshot
      await page.screenshot({ path: 'final-mobile-form.png' });
      console.log('✓ Form screenshot saved');
      
      // Check for headers
      const purpleHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
      const violetHeaders = await page.$$('.bg-gradient-to-r.from-violet-600');
      const totalHeaders = purpleHeaders.length + violetHeaders.length;
      
      console.log('\n=== HEADER CHECK ===');
      console.log(`Purple gradient headers: ${purpleHeaders.length}`);
      console.log(`Violet gradient headers: ${violetHeaders.length}`);
      console.log(`Total headers: ${totalHeaders}`);
      
      if (totalHeaders === 1) {
        console.log('\n✅ SUCCESS: Only ONE compact header found!');
        console.log('The duplicate headers have been successfully removed.');
      } else if (totalHeaders === 0) {
        console.log('\n⚠️ WARNING: No headers found. Checking alternative selectors...');
        const altHeaders = await page.$$('[class*="gradient"][class*="purple"]');
        console.log(`Alternative gradient elements: ${altHeaders.length}`);
      } else {
        console.log(`\n❌ ERROR: Found ${totalHeaders} headers - there should only be 1`);
      }
      
    } else {
      console.log('Could not find service button');
    }
    
    console.log('\n✨ Check the screenshots to verify the visual appearance.');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();