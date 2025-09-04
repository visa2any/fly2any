const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Desktop Scrolling Fix...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    console.log('📱 Loading desktop version...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for desktop content to load
    await page.waitForSelector('.desktop-content-container', { timeout: 5000 });
    console.log('✅ Desktop container loaded');
    
    // Check if page is scrollable
    const isScrollable = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight;
    });
    console.log(`📏 Page scrollable: ${isScrollable}`);
    
    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.pageYOffset);
    console.log(`📍 Initial scroll position: ${initialScroll}`);
    
    // Try to scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    const afterScroll = await page.evaluate(() => window.pageYOffset);
    console.log(`📍 After scroll position: ${afterScroll}`);
    
    // Check if scroll was successful
    if (afterScroll > initialScroll) {
      console.log('✅ SUCCESS: Desktop scrolling is working!');
    } else {
      console.log('❌ ERROR: Desktop scrolling is NOT working!');
    }
    
    // Check body and html overflow styles
    const overflowStyles = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      const container = document.querySelector('.desktop-content-container');
      
      return {
        html: {
          overflowY: window.getComputedStyle(html).overflowY,
          height: window.getComputedStyle(html).height
        },
        body: {
          overflowY: window.getComputedStyle(body).overflowY,
          height: window.getComputedStyle(body).height
        },
        container: container ? {
          overflowY: window.getComputedStyle(container).overflowY,
          height: window.getComputedStyle(container).height,
          minHeight: window.getComputedStyle(container).minHeight
        } : null
      };
    });
    
    console.log('\n📊 Overflow Styles:');
    console.log('HTML:', overflowStyles.html);
    console.log('Body:', overflowStyles.body);
    console.log('Container:', overflowStyles.container);
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'desktop-scrolling-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved as desktop-scrolling-test.png');
    
    // Test mouse wheel scrolling
    console.log('\n🖱️ Testing mouse wheel scroll...');
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);
    
    const wheelScroll = await page.evaluate(() => window.pageYOffset);
    console.log(`📍 After wheel scroll: ${wheelScroll}`);
    
    if (wheelScroll !== afterScroll) {
      console.log('✅ Mouse wheel scrolling works!');
    } else {
      console.log('⚠️ Mouse wheel scrolling may not be working');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed!');
  }
})();