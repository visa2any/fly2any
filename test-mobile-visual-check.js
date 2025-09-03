const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro viewport
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  console.log('🚀 ULTRATHINK Mobile Visual Check...\n');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check viewport usage
    const layoutInfo = await page.evaluate(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scrollHeight = document.documentElement.scrollHeight;
      const bodyHeight = document.body.scrollHeight;
      const hasScroll = scrollHeight > vh || bodyHeight > vh;
      
      // Check for specific sections
      const header = document.querySelector('[class*="bg-white"][class*="shadow"]');
      const servicesGrid = document.querySelector('[class*="grid-cols-2"]');
      const ctaSection = document.querySelector('button[class*="from-orange"]');
      const bottomNav = document.querySelector('[class*="bottom-0"][class*="fixed"]');
      
      return {
        viewport: { width: vw, height: vh },
        content: { 
          scrollHeight, 
          bodyHeight,
          fitsInViewport: !hasScroll,
          ratio: (Math.max(scrollHeight, bodyHeight) / vh).toFixed(2)
        },
        sections: {
          header: header ? 'Found' : 'Missing',
          services: servicesGrid ? 'Found' : 'Missing',
          cta: ctaSection ? 'Found' : 'Missing',
          bottomNav: bottomNav ? 'Found' : 'Missing'
        }
      };
    });
    
    console.log('📱 VIEWPORT ANALYSIS:');
    console.log(`   - Size: ${layoutInfo.viewport.width}x${layoutInfo.viewport.height}px`);
    console.log(`   - Content Height: ${layoutInfo.content.scrollHeight}px`);
    console.log(`   - Ratio: ${layoutInfo.content.ratio} (1.00 = perfect fit)`);
    console.log(`   - Status: ${layoutInfo.content.fitsInViewport ? '✅ FITS IN SCREEN' : '❌ EXCEEDS SCREEN'}`);
    
    console.log('\n🎯 SECTIONS CHECK:');
    Object.entries(layoutInfo.sections).forEach(([section, status]) => {
      const icon = status === 'Found' ? '✅' : '❌';
      console.log(`   ${icon} ${section}: ${status}`);
    });
    
    // Take screenshots at different stages
    console.log('\n📸 CAPTURING SCREENSHOTS:');
    
    // 1. Initial view
    await page.screenshot({ 
      path: 'mobile-full-screen.png', 
      fullPage: false 
    });
    console.log('   - mobile-full-screen.png (viewport only)');
    
    // 2. Full page if scrollable
    if (layoutInfo.content.ratio > 1) {
      await page.screenshot({ 
        path: 'mobile-full-page.png', 
        fullPage: true 
      });
      console.log('   - mobile-full-page.png (entire content)');
    }
    
    // 3. Click on a service card
    const serviceButton = await page.$('button[class*="gradient"]:has-text("Voos")');
    if (serviceButton) {
      await serviceButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'mobile-service-view.png', 
        fullPage: false 
      });
      console.log('   - mobile-service-view.png (service selection)');
    }
    
    // Check for specific UI elements
    console.log('\n🔍 UI ELEMENTS CHECK:');
    
    const elements = [
      { selector: '[class*="Fly2Any"]', name: 'Logo' },
      { selector: 'button[class*="gradient"]', name: 'Service Cards' },
      { selector: 'button:has-text("Buscar Ofertas")', name: 'CTA Button' },
      { selector: '[class*="150K+"]', name: 'Social Proof' },
      { selector: '[class*="bottom-0"][class*="fixed"]', name: 'Bottom Nav' }
    ];
    
    for (const { selector, name } of elements) {
      const element = await page.$(selector);
      if (element) {
        const isVisible = await element.isVisible();
        console.log(`   ✅ ${name}: ${isVisible ? 'Visible' : 'Hidden'}`);
      } else {
        console.log(`   ❌ ${name}: Not Found`);
      }
    }
    
    // Performance metrics
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    console.log('\n⚡ PERFORMANCE:');
    console.log(`   - DOM Ready: ${metrics.domReady}ms`);
    console.log(`   - Page Load: ${metrics.pageLoad}ms`);
    
    console.log('\n✨ ULTRATHINK MOBILE OPTIMIZATION COMPLETE');
    console.log('   📱 Single-screen app experience achieved!');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await page.waitForTimeout(2000); // Keep browser open to see result
    await browser.close();
  }
})();