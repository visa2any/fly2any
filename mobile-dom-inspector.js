const { chromium } = require('playwright');
const fs = require('fs').promises;

async function inspectMobileDOM() {
  console.log('🚀 Starting DOM Inspector...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    console.log('📱 Navigating to localhost:3001...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('✅ Page loaded, waiting for network idle...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'mobile-dom-full-page.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot captured');
    
    // Get all interactive elements
    const interactiveElements = await page.evaluate(() => {
      const elements = [];
      
      // Find all buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        elements.push({
          type: 'button',
          index,
          text: button.textContent?.trim() || '',
          classes: button.className,
          id: button.id,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          visible: rect.width > 0 && rect.height > 0,
          inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
        });
      });
      
      // Find elements with specific classes or text
      const serviceKeywords = ['voos', 'hotéis', 'carros', 'tours', 'seguro', 'flight', 'hotel', 'car', 'tour', 'insurance'];
      serviceKeywords.forEach(keyword => {
        const byText = document.querySelectorAll(`*:not(script):not(style)`);
        byText.forEach((el, index) => {
          if (el.textContent && el.textContent.toLowerCase().includes(keyword.toLowerCase()) && 
              el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              elements.push({
                type: 'service-element',
                keyword,
                index,
                tag: el.tagName,
                text: el.textContent?.trim().substring(0, 100) || '',
                classes: el.className,
                id: el.id,
                rect: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height
                },
                visible: rect.width > 0 && rect.height > 0,
                inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
              });
            }
          }
        });
      });
      
      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        scroll: {
          x: window.scrollX,
          y: window.scrollY
        },
        elements: elements.slice(0, 50) // Limit to first 50 elements
      };
    });
    
    console.log(`📊 Found ${interactiveElements.elements.length} interactive elements`);
    
    // Save detailed analysis
    await fs.writeFile('mobile-dom-analysis.json', JSON.stringify(interactiveElements, null, 2));
    console.log('💾 DOM analysis saved to mobile-dom-analysis.json');
    
    // Print summary
    console.log('\n📋 SUMMARY:');
    const buttons = interactiveElements.elements.filter(el => el.type === 'button');
    const serviceElements = interactiveElements.elements.filter(el => el.type === 'service-element');
    
    console.log(`🔲 Buttons found: ${buttons.length}`);
    buttons.forEach(btn => {
      if (btn.text.length > 0 && btn.visible) {
        console.log(`  - "${btn.text}" (${btn.classes})`);
      }
    });
    
    console.log(`🎯 Service elements found: ${serviceElements.length}`);
    ['voos', 'hotéis', 'carros', 'tours', 'seguro'].forEach(service => {
      const elements = serviceElements.filter(el => el.keyword === service);
      console.log(`  - ${service}: ${elements.length} elements`);
      elements.slice(0, 3).forEach(el => {
        console.log(`    • ${el.tag}: "${el.text.substring(0, 50)}..." (${el.classes})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Inspection failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the inspection
inspectMobileDOM().catch(console.error);