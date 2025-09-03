const { chromium } = require('playwright');

async function testMobilePassengerDropdown() {
  console.log('🚀 Testing Mobile Passenger Dropdown Enhancement...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to homepage
    console.log('📱 Loading homepage on mobile viewport...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Find and click passenger dropdown trigger
    console.log('🔍 Looking for passenger dropdown trigger...');
    const passengerTrigger = await page.locator('[data-passengers-trigger]');
    await passengerTrigger.waitFor({ state: 'visible', timeout: 10000 });
    
    // Take screenshot before opening dropdown
    await page.screenshot({ path: 'mobile-passenger-before.png', fullPage: true });
    console.log('📸 Before dropdown screenshot saved');
    
    // Click to open passenger dropdown
    console.log('👆 Clicking passenger dropdown...');
    await passengerTrigger.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(1000);
    
    // Check if dropdown is visible
    const dropdown = await page.locator('#passengers-dropdown');
    const isVisible = await dropdown.evaluate(el => el.style.display === 'block');
    
    if (isVisible) {
      console.log('✅ Passenger dropdown opened successfully');
      
      // Take screenshot with dropdown open
      await page.screenshot({ path: 'mobile-passenger-dropdown-open.png', fullPage: true });
      console.log('📸 Dropdown open screenshot saved');
      
      // Test button interactions
      console.log('🧪 Testing adult counter buttons...');
      
      // Get current adult count
      const adultSpan = await page.locator('#passengers-dropdown').locator('span').filter({ hasText: /^\d+$/ }).first();
      const initialCount = await adultSpan.textContent();
      console.log(`Initial adult count: ${initialCount}`);
      
      // Click plus button for adults
      const plusButton = await dropdown.locator('button').filter({ hasText: '+' }).first();
      await plusButton.click();
      await page.waitForTimeout(500);
      
      const newCount = await adultSpan.textContent();
      console.log(`After plus click: ${newCount}`);
      
      if (parseInt(newCount) > parseInt(initialCount)) {
        console.log('✅ Plus button works correctly');
      } else {
        console.log('❌ Plus button not working');
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'mobile-passenger-final.png', fullPage: true });
      console.log('📸 Final screenshot saved');
      
      // Test button styling
      console.log('🎨 Checking button styling...');
      const buttonStyles = await plusButton.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          width: computed.width,
          height: computed.height,
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow
        };
      });
      
      console.log('Button styles:', buttonStyles);
      
      // Check dropdown background
      const dropdownStyles = await dropdown.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          backdropFilter: computed.backdropFilter,
          boxShadow: computed.boxShadow,
          border: computed.border
        };
      });
      
      console.log('Dropdown styles:', dropdownStyles);
      
    } else {
      console.log('❌ Passenger dropdown failed to open');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'mobile-passenger-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🏁 Mobile passenger dropdown test completed');
}

testMobilePassengerDropdown();