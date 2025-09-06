const { chromium } = require('playwright');

(async () => {
  console.log('🚀 [SERVICE CARDS] Starting mobile interaction investigation...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2
  });
  
  // Enable console logging
  context.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 [SERVICE CARDS] Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('📸 [SERVICE CARDS] Taking initial screenshot...');
    await page.screenshot({ path: 'mobile-homepage-initial.png', fullPage: true });
    
    console.log('🔍 [SERVICE CARDS] Looking for service cards...');
    
    // Wait for service cards to be visible
    await page.waitForSelector('.mobileServiceButton', { timeout: 10000 });
    
    // Get all service buttons
    const serviceButtons = await page.locator('.mobileServiceButton').all();
    console.log(`📊 [SERVICE CARDS] Found ${serviceButtons.length} service buttons`);
    
    if (serviceButtons.length === 0) {
      throw new Error('No service buttons found!');
    }
    
    // Check each service button's properties
    for (let i = 0; i < serviceButtons.length; i++) {
      const button = serviceButtons[i];
      const boundingBox = await button.boundingBox();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      console.log(`🔲 [SERVICE CARD ${i+1}] Properties:`, {
        visible: isVisible,
        enabled: isEnabled,
        boundingBox: boundingBox
      });
      
      if (boundingBox) {
        console.log(`   Position: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
      }
    }
    
    console.log('👆 [SERVICE CARDS] Attempting to click first service card...');
    
    // Try different click methods
    const firstButton = serviceButtons[0];
    
    // Method 1: Regular click
    console.log('   Method 1: Regular click');
    try {
      await firstButton.click({ timeout: 5000 });
      console.log('   ✅ Regular click succeeded');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('   ❌ Regular click failed:', error.message);
    }
    
    await page.screenshot({ path: 'mobile-after-first-click.png', fullPage: true });
    
    // Method 2: Force click
    console.log('   Method 2: Force click');
    try {
      await firstButton.click({ force: true, timeout: 5000 });
      console.log('   ✅ Force click succeeded');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('   ❌ Force click failed:', error.message);
    }
    
    // Method 3: Touch tap
    console.log('   Method 3: Touch tap');
    try {
      const box = await firstButton.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        console.log('   ✅ Touch tap succeeded');
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('   ❌ Touch tap failed:', error.message);
    }
    
    await page.screenshot({ path: 'mobile-after-touch-tap.png', fullPage: true });
    
    // Check CSS computed styles for potential issues
    console.log('🎨 [SERVICE CARDS] Checking CSS computed styles...');
    const computedStyles = await page.evaluate(() => {
      const button = document.querySelector('.mobileServiceButton');
      if (!button) return null;
      
      const styles = window.getComputedStyle(button);
      return {
        pointerEvents: styles.pointerEvents,
        touchAction: styles.touchAction,
        userSelect: styles.userSelect,
        position: styles.position,
        zIndex: styles.zIndex,
        opacity: styles.opacity,
        display: styles.display,
        visibility: styles.visibility,
        cursor: styles.cursor,
        transform: styles.transform
      };
    });
    
    console.log('   CSS Properties:', computedStyles);
    
    // Check for overlapping elements
    console.log('🔍 [SERVICE CARDS] Checking for overlapping elements...');
    const overlappingElements = await page.evaluate(() => {
      const button = document.querySelector('.mobileServiceButton');
      if (!button) return null;
      
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const elementAtPoint = document.elementFromPoint(centerX, centerY);
      
      return {
        buttonElement: button.tagName + '.' + button.className,
        elementAtCenter: elementAtPoint ? elementAtPoint.tagName + '.' + elementAtPoint.className : 'null',
        isButtonAtCenter: elementAtPoint === button
      };
    });
    
    console.log('   Overlapping check:', overlappingElements);
    
    // Check JavaScript errors
    console.log('🚨 [SERVICE CARDS] Checking for JavaScript errors...');
    
    // Test all service buttons
    console.log('🔄 [SERVICE CARDS] Testing all service buttons...');
    for (let i = 0; i < Math.min(serviceButtons.length, 5); i++) {
      console.log(`   Testing service button ${i+1}...`);
      
      try {
        const button = serviceButtons[i];
        const isClickable = await button.isEnabled() && await button.isVisible();
        
        if (isClickable) {
          // Try regular click
          await button.click({ timeout: 3000 });
          console.log(`   ✅ Button ${i+1} click successful`);
          await page.waitForTimeout(1000);
          
          // Take screenshot
          await page.screenshot({ path: `mobile-button-${i+1}-clicked.png`, fullPage: true });
        } else {
          console.log(`   ⚠️ Button ${i+1} not clickable (enabled: ${await button.isEnabled()}, visible: ${await button.isVisible()})`);
        }
      } catch (error) {
        console.log(`   ❌ Button ${i+1} click failed:`, error.message);
      }
    }
    
    console.log('📊 [SERVICE CARDS] Investigation completed!');
    
  } catch (error) {
    console.error('💥 [SERVICE CARDS] Investigation failed:', error);
    await page.screenshot({ path: 'mobile-investigation-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();