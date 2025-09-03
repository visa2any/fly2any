const { chromium } = require('playwright');

async function validateUXImprovements() {
  console.log('🎭 Starting Final UX Validation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Set longer timeout
    page.setDefaultTimeout(90000);
    
    console.log('📍 Navigating to optimized flights page...');
    await page.goto('http://localhost:3000/flights');
    
    // Wait for page to load
    await page.waitForTimeout(10000);
    
    console.log('📸 Capturing full page screenshot...');
    await page.screenshot({ 
      path: 'ultra-optimized-flights-full.png',
      fullPage: true 
    });
    
    console.log('📸 Capturing viewport screenshot...');
    await page.screenshot({ 
      path: 'ultra-optimized-flights-viewport.png'
    });
    
    // Test mobile viewport
    console.log('📱 Testing mobile experience...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'ultra-optimized-flights-mobile.png',
      fullPage: true 
    });
    
    // Test tablet viewport
    console.log('📱 Testing tablet experience...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: 'ultra-optimized-flights-tablet.png',
      fullPage: true 
    });
    
    // Test form interactions
    console.log('🔍 Testing form interactions...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Try clicking on the form
    const formElement = await page.locator('form, [data-testid="flight-search"], input').first();
    if (await formElement.count() > 0) {
      await formElement.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'ultra-optimized-flights-form-active.png'
      });
    }
    
    console.log('✅ UX Validation Complete!');
    console.log('📊 Screenshots saved:');
    console.log('  - ultra-optimized-flights-full.png');
    console.log('  - ultra-optimized-flights-viewport.png');
    console.log('  - ultra-optimized-flights-mobile.png');
    console.log('  - ultra-optimized-flights-tablet.png');
    console.log('  - ultra-optimized-flights-form-active.png');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  } finally {
    await browser.close();
  }
}

validateUXImprovements().catch(console.error);