const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    // Test the main mobile page
    console.log('Testing mobile homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'mobile-homepage-fixed.png', fullPage: false });
    console.log('✓ Homepage screenshot saved');
    
    // Click on a service to open the multi-step form
    console.log('Opening multi-step lead form...');
    await page.click('button:has-text("✈️")').catch(() => {
      // Alternative selector if the emoji doesn't work
      return page.click('button >> text=/Voos|Passagens/i');
    });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot of the form with the header
    await page.screenshot({ path: 'mobile-form-with-header.png', fullPage: false });
    console.log('✓ Form with header screenshot saved');
    
    // Check for duplicate headers by counting header elements
    const headerCount = await page.$$eval('.bg-gradient-to-r.from-purple-600', elements => elements.length);
    const logoCount = await page.$$eval('[class*="Logo"], [class*="F2A"]', elements => elements.length);
    
    console.log(`\nHeader Analysis:`);
    console.log(`- Gradient headers found: ${headerCount}`);
    console.log(`- Logo elements found: ${logoCount}`);
    
    if (headerCount > 1) {
      console.error('⚠️ WARNING: Multiple headers detected! There should only be one compact header.');
    } else {
      console.log('✅ SUCCESS: Only one header detected as expected!');
    }
    
    // Try clicking the generic quote button to test PremiumMobileLeadForm
    console.log('\nTesting Premium Lead Form...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on "Buscar Ofertas Grátis" button
    await page.click('button:has-text("Buscar Ofertas Grátis")').catch(() => {
      return page.click('button >> text=/Buscar|Ofertas/i');
    });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'mobile-premium-form-fixed.png', fullPage: false });
    console.log('✓ Premium form screenshot saved');
    
    // Check for duplicate headers in premium form
    const premiumHeaderCount = await page.$$eval('.bg-gradient-to-r.from-purple-600', elements => elements.length);
    console.log(`\nPremium Form Header Analysis:`);
    console.log(`- Gradient headers found: ${premiumHeaderCount}`);
    
    if (premiumHeaderCount > 1) {
      console.error('⚠️ WARNING: Multiple headers in premium form!');
    } else {
      console.log('✅ SUCCESS: Single header in premium form!');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed. Check the screenshots to verify the header display.');
  }
})();