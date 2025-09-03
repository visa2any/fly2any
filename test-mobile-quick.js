const { chromium } = require('playwright');

console.log('🔧 Quick Mobile Navigation Test');
console.log('==============================\n');

async function quickMobileTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();

  try {
    console.log('📱 Loading mobile homepage (extended timeout)...');
    await page.goto('http://localhost:3000', { 
      timeout: 60000, // 60 second timeout for first load
      waitUntil: 'domcontentloaded' 
    });
    
    console.log('✅ Page loaded successfully!');
    
    // Wait for content
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'mobile-test-quick.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: mobile-test-quick.png');
    
    // Quick check for service content
    const pageContent = await page.textContent('body');
    const hasVoos = pageContent.includes('Voos') || pageContent.includes('voos');
    const hasSeguro = pageContent.includes('Seguro') || pageContent.includes('seguro');
    
    console.log(`\n🔍 Quick service check:`);
    console.log(`   ${hasVoos ? '✅' : '❌'} Voos service found in content`);
    console.log(`   ${hasSeguro ? '✅' : '❌'} Seguro service found in content`);
    
    if (hasVoos && hasSeguro) {
      console.log('\n🎉 SUCCESS: Mobile page loaded with services!');
    } else {
      console.log('\n⚠️  Services may not be fully visible');
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

quickMobileTest().catch(console.error);