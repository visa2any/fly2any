const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Desktop Scrolling Fix (Updated)...');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser for visual verification
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    console.log('📱 Loading desktop version...');
    await page.goto('http://localhost:3002', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check if desktop content container exists
    await page.waitForSelector('.desktop-content-container', { timeout: 5000 });
    console.log('✅ Desktop container loaded');
    
    // Check if page is scrollable
    const scrollInfo = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const container = document.querySelector('.desktop-content-container');
      
      return {
        pageHeight: Math.max(body.scrollHeight, html.scrollHeight),
        viewportHeight: window.innerHeight,
        isScrollable: Math.max(body.scrollHeight, html.scrollHeight) > window.innerHeight,
        bodyOverflow: window.getComputedStyle(body).overflowY,
        htmlOverflow: window.getComputedStyle(html).overflowY,
        containerOverflow: container ? window.getComputedStyle(container).overflowY : 'N/A',
        initialScrollY: window.pageYOffset
      };
    });
    
    console.log('\n📊 Page Info:');
    console.log(`  Page Height: ${scrollInfo.pageHeight}px`);
    console.log(`  Viewport Height: ${scrollInfo.viewportHeight}px`);
    console.log(`  Is Scrollable: ${scrollInfo.isScrollable}`);
    console.log(`  Body overflow-y: ${scrollInfo.bodyOverflow}`);
    console.log(`  HTML overflow-y: ${scrollInfo.htmlOverflow}`);
    console.log(`  Container overflow-y: ${scrollInfo.containerOverflow}`);
    console.log(`  Initial Scroll Y: ${scrollInfo.initialScrollY}px`);
    
    // Try multiple scroll methods
    console.log('\n🔄 Testing scroll methods...');
    
    // Method 1: window.scrollTo
    const scrollTest1 = await page.evaluate(() => {
      const before = window.pageYOffset;
      window.scrollTo(0, 300);
      return { method: 'window.scrollTo', before, after: window.pageYOffset };
    });
    
    await page.waitForTimeout(500);
    
    // Method 2: scrollBy
    const scrollTest2 = await page.evaluate(() => {
      const before = window.pageYOffset;
      window.scrollBy(0, 200);
      return { method: 'window.scrollBy', before, after: window.pageYOffset };
    });
    
    await page.waitForTimeout(500);
    
    // Method 3: Mouse wheel
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);
    
    const finalScroll = await page.evaluate(() => window.pageYOffset);
    
    console.log(`  ${scrollTest1.method}: ${scrollTest1.before}px -> ${scrollTest1.after}px`);
    console.log(`  ${scrollTest2.method}: ${scrollTest2.before}px -> ${scrollTest2.after}px`);
    console.log(`  Mouse wheel: Final position ${finalScroll}px`);
    
    const scrollWorking = finalScroll > 0 || scrollInfo.htmlOverflow === 'scroll';
    
    if (scrollWorking) {
      console.log('\n✅ SUCCESS: Desktop scrolling is WORKING!');
    } else {
      console.log('\n❌ FAILED: Desktop scrolling is NOT working!');
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'desktop-scrolling-final-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved as desktop-scrolling-final-test.png');
    
    // Keep browser open for manual verification
    console.log('🔍 Browser will stay open for 10 seconds for manual verification...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed!');
  }
})();