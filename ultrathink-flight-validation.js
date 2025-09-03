const { chromium } = require('@playwright/test');

async function validateUltrathinkOptimization() {
  console.log('🚀 ULTRATHINK Mobile Flight Form Validation Starting...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const devices = [
    { name: 'iPhone 12', viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' },
    { name: 'Samsung Galaxy S21', viewport: { width: 360, height: 640 }, userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)' }
  ];

  for (const device of devices) {
    console.log(`\n📱 Testing on ${device.name}...`);
    
    const context = await browser.newContext({
      viewport: device.viewport,
      userAgent: device.userAgent,
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: true
    });

    // Force clear cache
    await context.clearCookies();
    await context.clearPermissions();
    
    const page = await context.newPage();
    
    // Force reload without cache
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Force hard refresh
    await page.evaluate(() => {
      location.reload(true);
    });
    
    await page.waitForTimeout(3000);
    
    // Take screenshot of home
    await page.screenshot({ 
      path: `ultrathink-${device.name.toLowerCase().replace(' ', '-')}-home.png`, 
      fullPage: false 
    });
    
    // Wait for mobile app to load
    await page.waitForTimeout(2000);
    
    // Click on Voos (Flights) - using the actual button structure
    const flightButton = await page.locator('button:has-text("Voos")').first();
    if (await flightButton.isVisible()) {
      console.log('✅ Found Voos button, clicking...');
      await flightButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of flight form
      await page.screenshot({ 
        path: `ultrathink-${device.name.toLowerCase().replace(' ', '-')}-flight-form.png`, 
        fullPage: false 
      });
      
      // Measure spacing
      const measurements = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        const buttons = document.querySelectorAll('button');
        const inputs = document.querySelectorAll('input');
        
        let totalPadding = 0;
        let elementCount = 0;
        
        forms.forEach(form => {
          const styles = window.getComputedStyle(form);
          totalPadding += parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
          elementCount++;
        });
        
        return {
          formCount: forms.length,
          buttonCount: buttons.length,
          inputCount: inputs.length,
          avgPadding: elementCount > 0 ? (totalPadding / elementCount).toFixed(1) : 0
        };
      });
      
      console.log('📊 Form Measurements:', measurements);
      
      // Try to navigate through form steps
      const nextButton = await page.locator('button:has-text("Próximo")').first();
      if (await nextButton.isVisible()) {
        console.log('✅ Navigating to next step...');
        await nextButton.click();
        await page.waitForTimeout(1500);
        
        await page.screenshot({ 
          path: `ultrathink-${device.name.toLowerCase().replace(' ', '-')}-step2.png`, 
          fullPage: false 
        });
      }
    } else {
      console.log('⚠️ Voos button not found, checking page state...');
      
      // Debug: Check what's actually on the page
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body.innerText.substring(0, 200),
          hasFlightElements: document.body.innerText.includes('Voos'),
          hasMobileElements: document.querySelector('.mobile-app-container') !== null
        };
      });
      
      console.log('📄 Page State:', pageContent);
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\n✅ ULTRATHINK Validation Complete!');
  console.log('📸 Screenshots saved with ultrathink- prefix');
  console.log('\n🎯 KEY OPTIMIZATIONS APPLIED:');
  console.log('  • Reduced padding: p-4→p-2, p-3→p-2');
  console.log('  • Tighter spacing: space-y-3→space-y-2');
  console.log('  • Smaller gaps: gap-3→gap-2');
  console.log('  • Compact margins: mb-4→mb-2, mb-3→mb-1');
  console.log('  • Form bottom padding: 88px→60px');
}

validateUltrathinkOptimization().catch(console.error);