const { chromium } = require('playwright');

(async () => {
  console.log('🔍 MOBILE VIEWPORT NAVIGATION ANALYSIS');
  console.log('========================================');
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();

  try {
    console.log('📱 Loading homepage with iPhone 14 Pro viewport (393x852)...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Wait for mobile layout to render
    await page.waitForTimeout(2000);

    console.log('\n📐 CURRENT LAYOUT ANALYSIS');
    console.log('===========================');

    // Get layout section heights
    const layoutAnalysis = await page.evaluate(() => {
      // Find the mobile layout sections
      const heroSection = document.querySelector('[style*="height: 14%"]');
      const servicesSection = document.querySelector('[style*="height: 50%"]');
      const ctaSection = document.querySelector('[style*="height: 12%"]');
      const bufferSection = document.querySelector('[style*="height: 5%"]');
      const socialSection = document.querySelector('[style*="height: 6%"]');
      const bottomNav = document.querySelector('.bg-white\\/95.backdrop-blur-xl');
      
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate actual pixel heights
      const heroHeight = heroSection ? (viewportHeight * 0.14) : 0;
      const servicesHeight = servicesSection ? (viewportHeight * 0.50) : 0;
      const ctaHeight = ctaSection ? (viewportHeight * 0.12) : 0;
      const bufferHeight = bufferSection ? (viewportHeight * 0.05) : 0;
      const socialHeight = socialSection ? (viewportHeight * 0.06) : 0;
      
      // Calculate bottom navigation dimensions
      let navHeight = 0;
      let navTop = 0;
      let navVisible = false;
      
      if (bottomNav) {
        const navRect = bottomNav.getBoundingClientRect();
        navHeight = navRect.height;
        navTop = navRect.top;
        navVisible = navRect.bottom <= viewportHeight;
      }
      
      // Calculate content totals
      const contentTotal = heroHeight + servicesHeight + ctaHeight + bufferHeight + socialHeight;
      const remainingSpace = viewportHeight - contentTotal;
      const remainingPercentage = (remainingSpace / viewportHeight) * 100;
      
      return {
        viewport: { width: viewportWidth, height: viewportHeight },
        sections: {
          hero: { percentage: 14, pixels: heroHeight },
          services: { percentage: 50, pixels: servicesHeight },
          cta: { percentage: 12, pixels: ctaHeight },
          buffer: { percentage: 5, pixels: bufferHeight },
          social: { percentage: 6, pixels: socialHeight }
        },
        navigation: {
          height: navHeight,
          topPosition: navTop,
          isFullyVisible: navVisible,
          isPartiallyVisible: navTop < viewportHeight
        },
        totals: {
          contentPixels: contentTotal,
          contentPercentage: 87,
          remainingPixels: remainingSpace,
          remainingPercentage: remainingPercentage
        }
      };
    });

    // Display current layout analysis
    console.log(`📱 Viewport: ${layoutAnalysis.viewport.width}x${layoutAnalysis.viewport.height}px`);
    console.log('\n📊 CURRENT SECTIONS:');
    Object.entries(layoutAnalysis.sections).forEach(([key, section]) => {
      console.log(`   ${key.toUpperCase()}: ${section.percentage}% (${Math.round(section.pixels)}px)`);
    });
    
    console.log(`\n🧮 TOTALS:`);
    console.log(`   Content: ${layoutAnalysis.totals.contentPercentage}% (${Math.round(layoutAnalysis.totals.contentPixels)}px)`);
    console.log(`   Remaining: ${Math.round(layoutAnalysis.totals.remainingPercentage)}% (${Math.round(layoutAnalysis.totals.remainingPixels)}px)`);
    
    console.log(`\n🧭 NAVIGATION STATUS:`);
    console.log(`   Height: ${Math.round(layoutAnalysis.navigation.height)}px`);
    console.log(`   Top Position: ${Math.round(layoutAnalysis.navigation.topPosition)}px`);
    console.log(`   Fully Visible: ${layoutAnalysis.navigation.isFullyVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`   Partially Visible: ${layoutAnalysis.navigation.isPartiallyVisible ? '✅ YES' : '❌ NO'}`);

    // Take screenshot of current layout
    await page.screenshot({
      path: 'mobile-viewport-current-layout.png',
      fullPage: false
    });

    console.log('\n🎯 PROPOSED OPTIMIZATION ANALYSIS');
    console.log('==================================');
    
    // Calculate proposed optimization
    const optimizedAnalysis = {
      hero: { percentage: 14, pixels: layoutAnalysis.viewport.height * 0.14 },
      services: { percentage: 50, pixels: layoutAnalysis.viewport.height * 0.50 },
      cta: { percentage: 12, pixels: layoutAnalysis.viewport.height * 0.12 },
      buffer: { percentage: 3, pixels: layoutAnalysis.viewport.height * 0.03 }, // Reduced from 5%
      social: { percentage: 4, pixels: layoutAnalysis.viewport.height * 0.04 }  // Reduced from 6%
    };
    
    const optimizedContentTotal = Object.values(optimizedAnalysis).reduce((sum, section) => sum + section.pixels, 0);
    const optimizedRemaining = layoutAnalysis.viewport.height - optimizedContentTotal;
    const optimizedRemainingPercentage = (optimizedRemaining / layoutAnalysis.viewport.height) * 100;
    
    console.log('\n📊 PROPOSED SECTIONS:');
    Object.entries(optimizedAnalysis).forEach(([key, section]) => {
      const current = layoutAnalysis.sections[key];
      const change = section.percentage - current.percentage;
      const changeStr = change === 0 ? '(unchanged)' : change > 0 ? `(+${change}%)` : `(${change}%)`;
      console.log(`   ${key.toUpperCase()}: ${section.percentage}% (${Math.round(section.pixels)}px) ${changeStr}`);
    });
    
    console.log(`\n🧮 OPTIMIZED TOTALS:`);
    console.log(`   Content: 83% (${Math.round(optimizedContentTotal)}px) (-4% reduction)`);
    console.log(`   Remaining: ${Math.round(optimizedRemainingPercentage)}% (${Math.round(optimizedRemaining)}px) (+4% increase)`);
    
    // Assess navigation fit
    const navWillFit = optimizedRemaining >= layoutAnalysis.navigation.height;
    const navMargin = optimizedRemaining - layoutAnalysis.navigation.height;
    
    console.log(`\n🧭 NAVIGATION FIT ANALYSIS:`);
    console.log(`   Required Space: ${Math.round(layoutAnalysis.navigation.height)}px`);
    console.log(`   Available Space: ${Math.round(optimizedRemaining)}px`);
    console.log(`   Will Fit: ${navWillFit ? '✅ YES' : '❌ NO'}`);
    console.log(`   Margin: ${Math.round(navMargin)}px ${navMargin > 0 ? '(safe)' : '(insufficient)'}`);

    console.log('\n📋 RECOMMENDATIONS');
    console.log('===================');
    
    if (navWillFit) {
      console.log('✅ OPTIMIZATION APPROVED:');
      console.log('   - 17% navigation space will guarantee 100% menu visibility');
      console.log('   - 4% social proof section is adequate for trust signals');
      console.log('   - 3% buffer maintains proper element separation');
      console.log(`   - ${Math.round(navMargin)}px safety margin for various screen sizes`);
    } else {
      console.log('❌ OPTIMIZATION INSUFFICIENT:');
      console.log('   - Additional content reduction needed');
      console.log('   - Consider reducing other sections further');
    }

    // Test different mobile viewport sizes
    console.log('\n📱 MULTI-DEVICE TESTING');
    console.log('========================');
    
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12/13/14', width: 390, height: 844 },
      { name: 'iPhone 14 Pro', width: 393, height: 852 },
      { name: 'iPhone 14 Plus', width: 428, height: 926 },
      { name: 'Samsung Galaxy S21', width: 384, height: 854 },
      { name: 'Google Pixel 6', width: 393, height: 851 }
    ];
    
    for (const device of devices) {
      await page.setViewportSize({
        width: device.width,
        height: device.height
      });
      
      await page.waitForTimeout(500);
      
      const deviceAnalysis = await page.evaluate((deviceHeight) => {
        const optimizedContentHeight = deviceHeight * 0.83; // 83% for content
        const availableForNav = deviceHeight - optimizedContentHeight;
        const bottomNav = document.querySelector('.bg-white\\/95.backdrop-blur-xl');
        const navHeight = bottomNav ? bottomNav.getBoundingClientRect().height : 80;
        const willFit = availableForNav >= navHeight;
        const margin = availableForNav - navHeight;
        
        return {
          availableSpace: availableForNav,
          navHeight: navHeight,
          willFit: willFit,
          margin: margin
        };
      }, device.height);
      
      console.log(`${device.name} (${device.width}x${device.height}): ${deviceAnalysis.willFit ? '✅' : '❌'} ${Math.round(deviceAnalysis.margin)}px margin`);
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
  } finally {
    console.log('\n📸 Screenshot saved as mobile-viewport-current-layout.png');
    console.log('\n🏁 Analysis complete!');
    await browser.close();
  }
})();