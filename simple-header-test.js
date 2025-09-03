const { chromium } = require('playwright');

async function testHeaderFooter() {
  console.log('🔍 Quick Header/Footer Test');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('📡 Navigating to home page...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('⏳ Waiting for content...');
    await page.waitForTimeout(5000);
    
    // Take quick screenshot
    await page.screenshot({ path: 'quick-test.png', fullPage: true });
    console.log('📸 Screenshot saved as quick-test.png');
    
    // Check for LiveSite components
    const hasHeader = await page.locator('header[role="banner"]').count() > 0;
    const hasFooter = await page.locator('footer[role="contentinfo"]').count() > 0;
    
    console.log(`\n📊 Results:`);
    console.log(`Header with role="banner": ${hasHeader ? '✅' : '❌'}`);
    console.log(`Footer with role="contentinfo": ${hasFooter ? '✅' : '❌'}`);
    
    // Check for specific content
    const flashSale = await page.locator('text=FLASH SALE').count();
    const trustedBy = await page.locator('text=Trusted by 2.1M').count();
    
    console.log(`Flash Sale text: ${flashSale > 0 ? '✅' : '❌'}`);
    console.log(`Trusted by text: ${trustedBy > 0 ? '✅' : '❌'}`);
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    if (!hasHeader && !hasFooter) {
      console.log('\n⚠️ Neither header nor footer found. Possible issues:');
      console.log('1. Components not rendering due to React errors');
      console.log('2. CSS hiding the components');
      console.log('3. Next.js compilation issues');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testHeaderFooter().catch(console.error);