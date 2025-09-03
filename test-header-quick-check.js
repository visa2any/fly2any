const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Quick Header Visibility Check...\n');
  
  const browser = await chromium.launch({ 
    headless: false
  });
  
  const page = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
  }).then(ctx => ctx.newPage());
  
  try {
    console.log('Loading app...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    console.log('Taking homepage screenshot...');
    await page.screenshot({ path: 'quick-check-1-homepage.png', fullPage: true });
    
    console.log('Opening Voos form...');
    // Try to find and click Voos button
    const voosButton = page.locator('button').filter({ hasText: 'Voos' }).first();
    if (await voosButton.isVisible()) {
      await voosButton.click();
      await page.waitForTimeout(3000);
      
      console.log('Taking form screenshot...');
      await page.screenshot({ path: 'quick-check-2-voos-form.png', fullPage: true });
      
      // Quick visibility check
      console.log('\n=== Visibility Check ===');
      
      // Check for any header-like element
      const headerElements = await page.locator('header, [class*="header"], button:has-text("Voltar")').all();
      console.log(`Found ${headerElements.length} header-related elements`);
      
      // Check for form content
      const formElements = await page.locator('[class*="form"], text=/tipo.*viagem/i').all();
      console.log(`Found ${formElements.length} form-related elements`);
      
    } else {
      console.log('Could not find Voos button');
    }
    
    console.log('\n✅ Check complete! Review screenshots.');
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'quick-check-error.png', fullPage: true });
  }
  
  await browser.close();
})();