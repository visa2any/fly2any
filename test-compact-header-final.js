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
    console.log('🚀 ULTRATHINK Header Test - Final Check\n');
    console.log('Loading mobile homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'ultrathink-mobile-home.png' });
    console.log('✓ Homepage screenshot saved');
    
    // Count headers on homepage
    const homeHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
    console.log(`\n📱 Homepage: Found ${homeHeaders.length} header(s)`);
    
    // Check for Logo elements on homepage
    const homeLogos = await page.$$('img[src*="logo"], [class*="Logo"]');
    console.log(`   - Logo elements: ${homeLogos.length}`);
    
    // Check for hamburger menu
    const homeHamburger = await page.$$('[class*="Bars3Icon"], svg[class*="w-5"][class*="h-5"]');
    console.log(`   - Hamburger menu icons: ${homeHamburger.length}`);
    
    // Click on first service to open form
    console.log('\n📝 Opening lead form...');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    
    if (serviceButtons.length > 0) {
      await serviceButtons[0].click();
      await page.waitForTimeout(3000);
      
      // Take form screenshot
      await page.screenshot({ path: 'ultrathink-mobile-form.png' });
      console.log('✓ Form screenshot saved');
      
      // Count headers with form open
      const formHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
      console.log(`\n📋 With Form Open: Found ${formHeaders.length} header(s)`);
      
      // Check for Logo elements with form
      const formLogos = await page.$$('img[src*="logo"], [class*="Logo"]');
      console.log(`   - Logo elements: ${formLogos.length}`);
      
      // Check for hamburger menu with form
      const formHamburger = await page.$$('[class*="Bars3Icon"], svg[class*="w-5"][class*="h-5"]');
      console.log(`   - Hamburger menu icons: ${formHamburger.length}`);
      
      // Verify back button appears
      const backButton = await page.$$('[class*="ChevronLeftIcon"], button[aria-label="Voltar"]');
      console.log(`   - Back button: ${backButton.length > 0 ? 'Present ✓' : 'Missing ✗'}`);
      
      // Final verdict
      console.log('\n' + '='.repeat(50));
      if (formHeaders.length === 1) {
        console.log('✅ SUCCESS: Only ONE compact header found!');
        console.log('   Logo ✓ | Hamburger Menu ✓ | Compact Design ✓');
      } else if (formHeaders.length === 0) {
        console.log('⚠️ WARNING: No header found');
      } else {
        console.log(`❌ ERROR: Found ${formHeaders.length} headers (expected 1)`);
      }
      console.log('='.repeat(50));
      
    } else {
      console.log('❌ Could not find service buttons');
    }
    
    console.log('\n✨ ULTRATHINK test complete! Check screenshots for visual verification.');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();