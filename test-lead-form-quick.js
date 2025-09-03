const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Testing lead form...');
    
    // Navigate with longer timeout
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded', 
      timeout: 45000 
    });
    await page.waitForTimeout(5000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'lead-form-quick-test.png',
      fullPage: false 
    });
    
    console.log('✅ Lead form test completed successfully!');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
  
  await context.close();
  await browser.close();
})();