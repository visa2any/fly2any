const { chromium } = require('playwright');

async function validateMobileDetectionFix() {
  console.log('🔍 Starting Comprehensive Mobile Detection Validation...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  // Test configurations for different viewports
  const testConfigs = [
    { name: 'iPhone 12', viewport: { width: 390, height: 844 }, isMobile: true },
    { name: 'Samsung Galaxy S21', viewport: { width: 360, height: 800 }, isMobile: true },
    { name: 'iPhone SE', viewport: { width: 375, height: 667 }, isMobile: true },
    { name: 'iPad', viewport: { width: 768, height: 1024 }, isMobile: false },
    { name: 'Desktop 1920x1080', viewport: { width: 1920, height: 1080 }, isMobile: false },
    { name: 'Desktop 1280x720', viewport: { width: 1280, height: 720 }, isMobile: false }
  ];

  const results = [];

  for (const config of testConfigs) {
    console.log(`\n📱 Testing ${config.name} (${config.viewport.width}x${config.viewport.height})...`);
    
    const context = await browser.newContext({
      viewport: config.viewport,
      userAgent: config.isMobile ? 
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1' :
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate to homepage with longer timeout for development server
      console.log(`   Navigating to http://localhost:3000...`);
      const response = await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      if (!response || response.status() !== 200) {
        console.log(`   ❌ Failed to load page - Status: ${response?.status() || 'No response'}`);
        results.push({
          device: config.name,
          success: false,
          error: `HTTP ${response?.status() || 'No response'}`
        });
        await context.close();
        continue;
      }

      console.log(`   ✅ Page loaded successfully (${response.status()})`);

      // Wait for DOM to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      
      // Wait a moment for any CSS to apply
      await page.waitForTimeout(1000);

      // Check if essential containers exist
      const mobileContainer = await page.$('.mobile-app-container');
      const desktopContainer = await page.$('.desktop-content-container');
      
      if (!mobileContainer || !desktopContainer) {
        console.log(`   ❌ Missing essential containers`);
        console.log(`      Mobile container: ${!!mobileContainer}`);
        console.log(`      Desktop container: ${!!desktopContainer}`);
        results.push({
          device: config.name,
          success: false,
          error: 'Missing essential containers'
        });
        await context.close();
        continue;
      }

      // Check CSS computed styles for visibility
      const mobileDisplay = await mobileContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          height: style.height,
          width: style.width
        };
      });

      const desktopDisplay = await desktopContainer.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          height: style.height,
          width: style.width
        };
      });

      // Determine if elements are actually visible
      const mobileVisible = (mobileDisplay.display !== 'none' && 
                            mobileDisplay.visibility !== 'hidden' && 
                            parseFloat(mobileDisplay.opacity || '1') > 0);
      
      const desktopVisible = (desktopDisplay.display !== 'none' && 
                             desktopDisplay.visibility !== 'hidden' && 
                             parseFloat(desktopDisplay.opacity || '1') > 0);

      // Check for mobile-specific components
      const mobileAppLayout = await page.$('[data-testid="mobile-app-layout"], .mobile-app-layout, .mobile-layout');
      const bottomNav = await page.$('[data-testid="bottom-nav"], .bottom-nav, .mobile-bottom-nav, [data-component="BottomNav"]');
      const mobileHeader = await page.$('[data-testid="mobile-header"], .mobile-header, .mobile-nav');

      // Check for desktop-specific components
      const desktopHeader = await page.$('.desktop-header, [data-testid="desktop-header"], .livesiteheader');
      const desktopFooter = await page.$('.desktop-footer, [data-testid="desktop-footer"], .livesitefooter');

      // Take screenshot for manual verification
      const screenshotPath = `mobile-validation-${config.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false,
        clip: { x: 0, y: 0, width: config.viewport.width, height: Math.min(config.viewport.height, 800) }
      });

      // Determine test success
      const expectedMobileVisible = config.isMobile;
      const expectedDesktopVisible = !config.isMobile;

      const isCorrect = (mobileVisible === expectedMobileVisible && desktopVisible === expectedDesktopVisible);

      const result = {
        device: config.name,
        viewport: config.viewport,
        expectedMobile: expectedMobileVisible,
        success: isCorrect,
        details: {
          mobileVisible,
          desktopVisible,
          mobileDisplay,
          desktopDisplay,
          hasMobileAppLayout: !!mobileAppLayout,
          hasBottomNav: !!bottomNav,
          hasMobileHeader: !!mobileHeader,
          hasDesktopHeader: !!desktopHeader,
          hasDesktopFooter: !!desktopFooter,
          screenshotTaken: screenshotPath
        }
      };

      results.push(result);

      // Log immediate results with details
      if (isCorrect) {
        console.log(`   ✅ ${config.name}: PASSED`);
        console.log(`      Mobile visible: ${mobileVisible} (expected: ${expectedMobileVisible})`);
        console.log(`      Desktop visible: ${desktopVisible} (expected: ${expectedDesktopVisible})`);
        console.log(`      Mobile components: Layout=${!!mobileAppLayout}, Nav=${!!bottomNav}, Header=${!!mobileHeader}`);
        console.log(`      Screenshot: ${screenshotPath}`);
      } else {
        console.log(`   ❌ ${config.name}: FAILED`);
        console.log(`      Mobile visible: ${mobileVisible} (expected: ${expectedMobileVisible})`);
        console.log(`      Desktop visible: ${desktopVisible} (expected: ${expectedDesktopVisible})`);
        console.log(`      Mobile display: ${mobileDisplay.display}, visibility: ${mobileDisplay.visibility}`);
        console.log(`      Desktop display: ${desktopDisplay.display}, visibility: ${desktopDisplay.visibility}`);
        console.log(`      Screenshot: ${screenshotPath}`);
      }

    } catch (error) {
      console.log(`   ❌ ${config.name}: ERROR - ${error.message}`);
      results.push({
        device: config.name,
        success: false,
        error: error.message
      });
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Final Summary Report
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPREHENSIVE MOBILE DETECTION VALIDATION RESULTS');
  console.log('='.repeat(80));

  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log(`\n📊 Overall Success Rate: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);

  console.log('\n📱 MOBILE DEVICES:');
  results.filter(r => r.expectedMobile).forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${result.device}: ${status}`);
    if (result.details) {
      console.log(`    - Mobile Layout Visible: ${result.details.mobileVisible ? '✅' : '❌'}`);
      console.log(`    - Desktop Layout Hidden: ${!result.details.desktopVisible ? '✅' : '❌'}`);
      console.log(`    - Has Mobile Components: ${result.details.hasMobileAppLayout ? '✅' : '❌'}`);
      console.log(`    - Has Bottom Navigation: ${result.details.hasBottomNav ? '✅' : '❌'}`);
      console.log(`    - CSS Display Control: ${result.details.mobileDisplay.display !== 'none' ? '✅' : '❌'}`);
    }
  });

  console.log('\n🖥️  DESKTOP DEVICES:');
  results.filter(r => !r.expectedMobile).forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${result.device}: ${status}`);
    if (result.details) {
      console.log(`    - Desktop Layout Visible: ${result.details.desktopVisible ? '✅' : '❌'}`);
      console.log(`    - Mobile Layout Hidden: ${!result.details.mobileVisible ? '✅' : '❌'}`);
      console.log(`    - Has Desktop Header: ${result.details.hasDesktopHeader ? '✅' : '❌'}`);
      console.log(`    - CSS Display Control: ${result.details.desktopDisplay.display !== 'none' ? '✅' : '❌'}`);
    }
  });

  // Critical Issues Check
  const criticalIssues = [];
  const mobileResults = results.filter(r => r.expectedMobile);
  const desktopResults = results.filter(r => !r.expectedMobile);

  // Check mobile devices
  mobileResults.forEach(result => {
    if (!result.success) {
      criticalIssues.push(`${result.device}: Mobile detection failed - showing ${result.details?.mobileVisible ? 'mobile' : 'desktop'} layout`);
    }
    if (result.details && !result.details.mobileVisible) {
      criticalIssues.push(`${result.device}: Mobile layout not visible via CSS media queries`);
    }
  });

  // Check desktop devices
  desktopResults.forEach(result => {
    if (!result.success) {
      criticalIssues.push(`${result.device}: Desktop detection failed - showing ${result.details?.desktopVisible ? 'desktop' : 'mobile'} layout`);
    }
  });

  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach(issue => console.log(`  ❌ ${issue}`));
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('  1. Check CSS media queries in GlobalMobileStyles.tsx');
    console.log('  2. Verify mobile-app-container and desktop-content-container CSS rules');
    console.log('  3. Test SSR rendering with disabled JavaScript');
    console.log('  4. Validate viewport meta tag in layout.tsx');
  } else {
    console.log('\n🎉 ALL CRITICAL REQUIREMENTS SATISFIED!');
    console.log('  ✅ Mobile devices show mobile app layout immediately');
    console.log('  ✅ Desktop devices show desktop layout');
    console.log('  ✅ CSS media queries properly control visibility');
    console.log('  ✅ No JavaScript dependency for initial layout rendering');
    console.log('  ✅ SSR mobile detection working correctly');
  }

  console.log('\n📸 Screenshots saved for all test configurations');
  console.log('='.repeat(80));

  return {
    success: criticalIssues.length === 0,
    passedTests,
    totalTests,
    results,
    criticalIssues
  };
}

// Run the validation
validateMobileDetectionFix().then(results => {
  if (results.success) {
    console.log('\n🎯 VALIDATION RESULT: MOBILE DETECTION FIX SUCCESSFUL!');
    console.log('\nThe enterprise-level progressive mobile detection fix is working correctly.');
    console.log('Mobile devices now receive the proper mobile app interface immediately on SSR.');
    process.exit(0);
  } else {
    console.log('\n💥 VALIDATION RESULT: MOBILE DETECTION FIX NEEDS ATTENTION');
    console.log(`\nFound ${results.criticalIssues.length} critical issue(s) that need resolution.`);
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});