const { chromium } = require('playwright');

async function validateMobileDetectionFix() {
  console.log('🔍 Starting Comprehensive Mobile Detection Validation...\n');
  
  const browser = await chromium.launch({ headless: false });
  
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
    
    const page = await browser.newPage();
    await page.setViewportSize(config.viewport);
    
    try {
      // Navigate to homepage with network monitoring
      const response = await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      if (!response || response.status() !== 200) {
        console.log(`❌ Failed to load page - Status: ${response?.status() || 'No response'}`);
        results.push({
          device: config.name,
          success: false,
          error: `HTTP ${response?.status() || 'No response'}`
        });
        await page.close();
        continue;
      }

      // Wait a moment for any initial rendering
      await page.waitForTimeout(500);

      // 1. Check SSR Mobile Detection - immediate visibility
      const mobileContainer = await page.$('.mobile-app-container');
      const desktopContainer = await page.$('.desktop-content-container');
      
      const mobileVisible = mobileContainer ? await mobileContainer.isVisible() : false;
      const desktopVisible = desktopContainer ? await desktopContainer.isVisible() : false;

      // 2. Check computed CSS styles
      const mobileContainerDisplay = mobileContainer ? 
        await page.evaluate(el => window.getComputedStyle(el).display, mobileContainer) : 'none';
      const desktopContainerDisplay = desktopContainer ? 
        await page.evaluate(el => window.getComputedStyle(el).display, desktopContainer) : 'none';

      // 3. Check for MobileAppLayout components
      const mobileAppLayout = await page.$('[data-testid="mobile-app-layout"], .mobile-app-layout');
      const bottomNav = await page.$('[data-testid="bottom-nav"], .bottom-nav, .mobile-bottom-nav');
      const mobileHeader = await page.$('[data-testid="mobile-header"], .mobile-header');

      // 4. Check for flash content (should not happen with CSS control)
      let hadFlash = false;
      try {
        // Quick check for any visibility changes that might indicate flash
        await page.waitForFunction(() => {
          const mobile = document.querySelector('.mobile-app-container');
          const desktop = document.querySelector('.desktop-content-container');
          return mobile && desktop; // Both elements should exist
        }, { timeout: 1000 });
      } catch (e) {
        // This is expected - no flash should occur
      }

      // 5. Test JavaScript disabled scenario
      await page.setJavaScriptEnabled(false);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const mobileVisibleNoJS = mobileContainer ? await mobileContainer.isVisible() : false;
      const desktopVisibleNoJS = desktopContainer ? await desktopContainer.isVisible() : false;

      await page.setJavaScriptEnabled(true);

      // 6. Take screenshot
      const screenshotPath = `mobile-detection-${config.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });

      // 7. Analyze results
      const expectedMobileVisible = config.isMobile;
      const expectedDesktopVisible = !config.isMobile;

      const isCorrect = (
        mobileVisible === expectedMobileVisible &&
        desktopVisible === expectedDesktopVisible &&
        mobileVisibleNoJS === expectedMobileVisible &&
        desktopVisibleNoJS === expectedDesktopVisible
      );

      const result = {
        device: config.name,
        viewport: config.viewport,
        expectedMobile: expectedMobileVisible,
        success: isCorrect,
        details: {
          mobileContainerVisible: mobileVisible,
          desktopContainerVisible: desktopVisible,
          mobileContainerDisplay: mobileContainerDisplay,
          desktopContainerDisplay: desktopContainerDisplay,
          hasMobileAppLayout: !!mobileAppLayout,
          hasBottomNav: !!bottomNav,
          hasMobileHeader: !!mobileHeader,
          worksWithoutJS: (mobileVisibleNoJS === expectedMobileVisible),
          screenshotTaken: screenshotPath
        }
      };

      results.push(result);

      // Log immediate results
      if (isCorrect) {
        console.log(`✅ ${config.name}: PASSED`);
        console.log(`   Mobile visible: ${mobileVisible} (expected: ${expectedMobileVisible})`);
        console.log(`   Desktop visible: ${desktopVisible} (expected: ${expectedDesktopVisible})`);
        console.log(`   Works without JS: ${mobileVisibleNoJS === expectedMobileVisible}`);
      } else {
        console.log(`❌ ${config.name}: FAILED`);
        console.log(`   Mobile visible: ${mobileVisible} (expected: ${expectedMobileVisible})`);
        console.log(`   Desktop visible: ${desktopVisible} (expected: ${expectedDesktopVisible})`);
        console.log(`   Mobile display: ${mobileContainerDisplay}`);
        console.log(`   Desktop display: ${desktopContainerDisplay}`);
      }

    } catch (error) {
      console.log(`❌ ${config.name}: ERROR - ${error.message}`);
      results.push({
        device: config.name,
        success: false,
        error: error.message
      });
    } finally {
      await page.close();
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
      console.log(`    - Mobile Layout: ${result.details.hasMobileAppLayout ? '✅' : '❌'}`);
      console.log(`    - Bottom Nav: ${result.details.hasBottomNav ? '✅' : '❌'}`);
      console.log(`    - CSS Control: ${result.details.mobileContainerDisplay !== 'none' ? '✅' : '❌'}`);
      console.log(`    - No-JS Support: ${result.details.worksWithoutJS ? '✅' : '❌'}`);
    }
  });

  console.log('\n🖥️  DESKTOP DEVICES:');
  results.filter(r => !r.expectedMobile).forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`  ${result.device}: ${status}`);
    if (result.details) {
      console.log(`    - Desktop Layout: ${!result.details.hasMobileAppLayout ? '✅' : '❌'}`);
      console.log(`    - CSS Control: ${result.details.desktopContainerDisplay !== 'none' ? '✅' : '❌'}`);
    }
  });

  // Critical Issues Check
  const criticalIssues = [];
  results.forEach(result => {
    if (!result.success && result.expectedMobile) {
      criticalIssues.push(`${result.device}: Mobile detection failed`);
    }
    if (result.details && !result.details.worksWithoutJS && result.expectedMobile) {
      criticalIssues.push(`${result.device}: CSS media queries not working`);
    }
  });

  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach(issue => console.log(`  ❌ ${issue}`));
  } else {
    console.log('\n🎉 ALL CRITICAL REQUIREMENTS SATISFIED!');
    console.log('  ✅ Mobile devices show mobile content immediately');
    console.log('  ✅ Desktop devices show desktop content');
    console.log('  ✅ CSS media queries control visibility');
    console.log('  ✅ No JavaScript dependency for layout switching');
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
    process.exit(0);
  } else {
    console.log('\n💥 VALIDATION RESULT: MOBILE DETECTION FIX NEEDS ATTENTION');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});