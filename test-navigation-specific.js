const { chromium } = require('playwright');

console.log('🔍 SPECIFIC BOTTOM NAVIGATION TEST');
console.log('==================================\n');

async function testBottomNavigation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();

  try {
    console.log('🔍 Loading and navigating to flight wizard...');
    await page.goto('http://localhost:3001', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const flightCard = await page.$('text=/voos/i');
    if (flightCard) {
      await flightCard.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight wizard opened');
    }

    console.log('\n🔍 SEARCHING FOR BOTTOM NAVIGATION...');
    
    // Try multiple selectors
    const selectors = [
      'div.fixed.bottom-0',
      'div[class*="fixed bottom-0"]',
      'div[style*="position: fixed"]',
      'div[style*="zIndex: 9999"]',
      'button:has-text("Próximo")',
      'div[style*="minHeight: \'72px\'"]'
    ];

    for (const selector of selectors) {
      const element = await page.$(selector);
      console.log(`   ${selector}: ${element ? '✅ FOUND' : '❌ NOT FOUND'}`);
      
      if (element) {
        const bounds = await element.boundingBox();
        const computedStyle = await element.evaluate(el => ({
          position: window.getComputedStyle(el).position,
          bottom: window.getComputedStyle(el).bottom,
          zIndex: window.getComputedStyle(el).zIndex,
          display: window.getComputedStyle(el).display
        }));
        
        console.log(`      Bounds: ${bounds?.x}, ${bounds?.y}, ${bounds?.width}x${bounds?.height}`);
        console.log(`      Style: position:${computedStyle.position}, bottom:${computedStyle.bottom}, z:${computedStyle.zIndex}, display:${computedStyle.display}`);
      }
    }

    console.log('\n📱 CHECKING PAGE STRUCTURE...');
    
    // Check if there are any fixed elements
    const fixedElements = await page.$$('*[class*="fixed"]');
    console.log(`   Total fixed elements: ${fixedElements.length}`);
    
    for (let i = 0; i < Math.min(fixedElements.length, 5); i++) {
      const el = fixedElements[i];
      const tagName = await el.evaluate(e => e.tagName);
      const className = await el.evaluate(e => e.className);
      console.log(`   ${i + 1}. ${tagName}: ${className}`);
    }

    // Check for any element with "Próximo" text
    const nextButtons = await page.$$('text=/próximo/i');
    console.log(`\n   "Próximo" buttons found: ${nextButtons.length}`);
    
    for (let i = 0; i < nextButtons.length; i++) {
      const btn = nextButtons[i];
      const bounds = await btn.boundingBox();
      const visible = bounds && bounds.y < 844 && bounds.x >= 0;
      console.log(`   Button ${i + 1}: ${visible ? 'VISIBLE' : 'NOT VISIBLE'} at ${bounds?.x}, ${bounds?.y}`);
    }

    // Take screenshot for visual confirmation
    await page.screenshot({ 
      path: 'navigation-debug.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved as navigation-debug.png');

    console.log('\n🎯 CONCLUSION:');
    console.log('   Check the screenshot to see the actual page state');
    console.log('   If navigation exists but not found, there might be a selector issue');

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testBottomNavigation().catch(console.error);