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
  
  console.log('🚀 Testing Optimized Mobile Layout...');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check if mobile layout is active
    const isMobile = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    console.log('📱 Mobile Detection:', isMobile ? 'Active' : 'Not Active');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'mobile-optimized-initial.png', 
      fullPage: false 
    });
    console.log('📸 Screenshot: mobile-optimized-initial.png');
    
    // Check viewport usage
    const viewportInfo = await page.evaluate(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scrollHeight = document.documentElement.scrollHeight;
      const hasScroll = scrollHeight > vh;
      
      return {
        viewportHeight: vh,
        viewportWidth: vw,
        scrollHeight: scrollHeight,
        hasScroll: hasScroll,
        ratio: (scrollHeight / vh).toFixed(2)
      };
    });
    
    console.log('📏 Viewport Analysis:', viewportInfo);
    
    // Check if content fits in single screen
    if (viewportInfo.hasScroll) {
      console.log('⚠️  WARNING: Content exceeds viewport height');
    } else {
      console.log('✅ SUCCESS: Content fits in single screen');
    }
    
    // Check for service cards
    const serviceCards = await page.$$('[data-testid*="service-card"], button[class*="gradient"]');
    console.log(`🎯 Service Cards Found: ${serviceCards.length}`);
    
    // Test service card clicks
    const services = ['Voos', 'Hotéis', 'Carros', 'Tours'];
    for (let i = 0; i < services.length && i < serviceCards.length; i++) {
      const card = serviceCards[i];
      const serviceName = services[i];
      
      // Click service card
      await card.click();
      await page.waitForTimeout(1000);
      
      // Check if navigation happened
      const url = page.url();
      console.log(`  - ${serviceName}: Navigation check`);
      
      // Go back to home
      const backButton = await page.$('[class*="ChevronLeft"], button:has-text("Voltar")');
      if (backButton) {
        await backButton.click();
        await page.waitForTimeout(500);
      } else {
        // Navigate back using browser
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      }
    }
    
    // Check bottom navigation
    const bottomNav = await page.$('[class*="bottom-0"][class*="fixed"]');
    if (bottomNav) {
      const isVisible = await bottomNav.isVisible();
      console.log('🗂️ Bottom Navigation:', isVisible ? 'Visible' : 'Not Visible');
      
      if (isVisible) {
        await page.screenshot({ 
          path: 'mobile-optimized-bottom-nav.png', 
          fullPage: false 
        });
        console.log('📸 Screenshot: mobile-optimized-bottom-nav.png');
      }
    } else {
      console.log('⚠️  Bottom Navigation: Not Found');
    }
    
    // Test CTA button
    const ctaButton = await page.$('button:has-text("Buscar Ofertas")');
    if (ctaButton) {
      const isVisible = await ctaButton.isVisible();
      console.log('🎯 CTA Button:', isVisible ? 'Visible' : 'Not Visible');
      
      if (isVisible) {
        await ctaButton.click();
        await page.waitForTimeout(1000);
        
        // Check if lead form appeared
        const leadForm = await page.$('[class*="LeadCapture"], [class*="lead-form"]');
        if (leadForm) {
          console.log('✅ Lead Form: Triggered successfully');
          await page.screenshot({ 
            path: 'mobile-optimized-lead-form.png', 
            fullPage: false 
          });
          console.log('📸 Screenshot: mobile-optimized-lead-form.png');
        }
      }
    }
    
    // Final layout measurements
    const layoutAnalysis = await page.evaluate(() => {
      const sections = {
        header: document.querySelector('[class*="h-16"], [class*="height: 15%"]'),
        services: document.querySelector('[class*="height: 50%"]'),
        cta: document.querySelector('[class*="height: 35%"]')
      };
      
      const measurements = {};
      for (const [name, element] of Object.entries(sections)) {
        if (element) {
          const rect = element.getBoundingClientRect();
          measurements[name] = {
            height: rect.height,
            percentage: ((rect.height / window.innerHeight) * 100).toFixed(1) + '%'
          };
        }
      }
      
      return measurements;
    });
    
    console.log('\n📊 Layout Distribution:', layoutAnalysis);
    
    // Performance check
    const performance = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      };
    });
    
    console.log('\n⚡ Performance Metrics:');
    console.log(`  - DOM Content Loaded: ${performance.domContentLoaded}ms`);
    console.log(`  - Page Load Complete: ${performance.loadComplete}ms`);
    
    console.log('\n✨ MOBILE LAYOUT TEST COMPLETE - ULTRATHINK OPTIMIZED');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await browser.close();
  }
})();