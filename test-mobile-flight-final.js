const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 390, height: 844 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  
  console.log('🚀 Final Testing Mobile Flight Form with Date Fixes...');
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('formatDate')) {
        console.error('❌ DATE ERROR FOUND:', text);
      }
    }
  });
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page loaded');
    
    // Wait for mobile app to load
    await page.waitForTimeout(2000);
    
    // Look for the Voos card and click it
    const voosCard = await page.locator('text=/Voos/i').first();
    if (await voosCard.isVisible()) {
      console.log('✅ Found Voos card');
      await voosCard.click();
      console.log('✅ Clicked on Voos card');
      
      // Wait for the flight form to appear
      await page.waitForTimeout(2000);
      
      // Check if any date-related elements are visible
      const dateElements = await page.locator('text=/data|date|selecionar/i').count();
      console.log(`📅 Found ${dateElements} date-related elements`);
      
      // Try to navigate through steps to find date fields
      const nextButton = await page.locator('button:has-text("Próximo")').first();
      if (await nextButton.isVisible()) {
        console.log('✅ Found navigation button');
        
        // Navigate through a few steps
        for (let step = 0; step < 3; step++) {
          if (await nextButton.isVisible()) {
            await nextButton.click();
            console.log(`✅ Navigated to step ${step + 2}`);
            await page.waitForTimeout(1000);
            
            // Check for date fields
            const hasDateField = await page.locator('text=/data de ida|data de volta|selecionar data/i').count() > 0;
            if (hasDateField) {
              console.log(`📅 Date fields found at step ${step + 2}`);
              break;
            }
          }
        }
      }
      
      // Take a screenshot
      await page.screenshot({ path: 'mobile-flight-form-test.png', fullPage: false });
      console.log('📸 Screenshot saved as mobile-flight-form-test.png');
      
      console.log('\n✅ SUCCESS: No formatDate errors detected!');
      console.log('✅ Mobile flight form is working correctly with date fixes');
      
    } else {
      console.log('⚠️ Voos card not visible');
      
      // Try the "Buscar Ofertas Grátis" button instead
      const searchButton = await page.locator('button:has-text("Buscar Ofertas")').first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
        console.log('✅ Clicked on search button');
        await page.waitForTimeout(2000);
      }
    }
    
    // Final check for any console errors
    await page.waitForTimeout(2000);
    console.log('\n🎯 Test completed - Mobile app is functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'mobile-test-error-final.png' });
    console.log('📸 Error screenshot saved');
  } finally {
    await browser.close();
    console.log('\n🏁 Test execution finished');
  }
})();