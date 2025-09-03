const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for manual observation
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('🎯 MANUAL AIRPORT DROPDOWN TEST');
  console.log('👀 Watch the browser - dropdown should appear OVER content');
  console.log('✨ Test z-index layering manually');
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Click flights
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(3000);
    
    console.log('📱 Flight form loaded - Look at the browser!');
    console.log('🔍 Now typing in origin airport field...');
    
    // Type in origin field
    const originInput = page.locator('input[placeholder*="De onde"]').first();
    await originInput.click();
    await page.waitForTimeout(1000);
    
    await originInput.fill('São');
    await page.waitForTimeout(3000);
    
    console.log('✅ OBSERVE: Does the dropdown appear OVER the form sections?');
    console.log('👆 Try clicking on airport suggestions manually');
    console.log('🎯 Z-index [9999] should make dropdown float on top');
    
    // Take screenshot for verification  
    await page.screenshot({ 
      path: 'manual-dropdown-test.png', 
      fullPage: false 
    });
    
    console.log('📸 Screenshot saved: manual-dropdown-test.png');
    console.log('');
    console.log('🎉 MANUAL TEST COMPLETE!');
    console.log('✅ If you can see airport suggestions over the form content, the fix works!');
    console.log('✅ If clicking on suggestions works, pointer events are fixed!');
    
    // Keep browser open for 30 seconds for manual testing
    console.log('⏱️  Browser will stay open for 30 seconds for manual testing...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();