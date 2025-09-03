const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,  // Run with UI to see what's happening
    slowMo: 100      // Slow down actions to observe
  });
  
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Loading mobile homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    console.log('\n=== INITIAL PAGE STATE ===');
    
    // Count all gradient headers before clicking anything
    const initialHeaders = await page.$$eval('[class*="from-purple-600"], [class*="from-violet-600"]', els => {
      return els.map(el => ({
        className: el.className,
        tagName: el.tagName,
        text: el.textContent?.substring(0, 100)
      }));
    });
    
    console.log(`Found ${initialHeaders.length} header elements initially:`);
    initialHeaders.forEach((h, i) => {
      console.log(`  ${i+1}. ${h.tagName}: ${h.className.substring(0, 50)}...`);
    });
    
    // Click on the first service button to open the form
    console.log('\n=== CLICKING SERVICE BUTTON ===');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    if (serviceButtons.length > 0) {
      console.log(`Found ${serviceButtons.length} service buttons`);
      await serviceButtons[0].click();
      await page.waitForTimeout(3000);
      
      console.log('\n=== AFTER OPENING FORM ===');
      
      // Count headers again after opening form
      const formHeaders = await page.$$eval('[class*="from-purple-600"], [class*="from-violet-600"]', els => {
        return els.map(el => ({
          className: el.className,
          tagName: el.tagName,
          text: el.textContent?.substring(0, 100),
          parent: el.parentElement?.className
        }));
      });
      
      console.log(`Found ${formHeaders.length} header elements after opening form:`);
      formHeaders.forEach((h, i) => {
        console.log(`  ${i+1}. ${h.tagName}: ${h.className.substring(0, 80)}...`);
        console.log(`      Parent: ${h.parent?.substring(0, 80)}...`);
        console.log(`      Text: "${h.text?.substring(0, 50)}..."`);
      });
      
      // Check for duplicate Logo elements
      const logos = await page.$$eval('[class*="Logo"], [class*="F2A"], img[src*="logo"]', els => {
        return els.map(el => ({
          className: el.className,
          tagName: el.tagName,
          src: el.getAttribute('src')
        }));
      });
      
      console.log(`\nFound ${logos.length} logo elements:`);
      logos.forEach((l, i) => {
        console.log(`  ${i+1}. ${l.tagName}: ${l.className || l.src}`);
      });
      
      // Take screenshot for visual inspection
      await page.screenshot({ path: 'header-debug-form.png', fullPage: false });
      console.log('\nScreenshot saved to header-debug-form.png');
      
    } else {
      console.log('No service buttons found!');
    }
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('Browser window will remain open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
})();