const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  
  // Test iPhone 12 Pro viewport
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  
  console.log('🔍 Testing Mobile Form Visibility...');
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  
  // Take screenshot of mobile view
  await page.screenshot({ 
    path: 'mobile-form-visibility-test.png',
    fullPage: false 
  });
  
  console.log('📸 Screenshot saved: mobile-form-visibility-test.png');
  
  // Check if form elements are visible
  const formVisible = await page.evaluate(() => {
    const formContainer = document.querySelector('.mobile-form-container');
    if (!formContainer) return { found: false };
    
    const rect = formContainer.getBoundingClientRect();
    const styles = window.getComputedStyle(formContainer);
    
    return {
      found: true,
      visible: rect.height > 0 && rect.width > 0,
      position: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      styles: {
        zIndex: styles.zIndex,
        position: styles.position,
        overflow: styles.overflow,
        background: styles.background
      }
    };
  });
  
  console.log('📊 Form Visibility Check:', JSON.stringify(formVisible, null, 2));
  
  // Check for overlapping elements
  const overlappingElements = await page.evaluate(() => {
    const formContainer = document.querySelector('.mobile-form-container');
    if (!formContainer) return [];
    
    const rect = formContainer.getBoundingClientRect();
    const elements = document.elementsFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    
    return elements.map(el => ({
      tag: el.tagName,
      className: el.className,
      id: el.id,
      zIndex: window.getComputedStyle(el).zIndex,
      background: window.getComputedStyle(el).background
    })).slice(0, 5);
  });
  
  console.log('🔄 Elements at Form Position:', JSON.stringify(overlappingElements, null, 2));
  
  // Test scrolling
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'mobile-form-scrolled-test.png',
    fullPage: false 
  });
  
  console.log('📸 Scrolled screenshot saved: mobile-form-scrolled-test.png');
  
  await browser.close();
  console.log('✅ Mobile form visibility test completed!');
})();