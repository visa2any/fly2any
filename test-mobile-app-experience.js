const { chromium } = require('playwright');
const fs = require('fs');

// Define common mobile device configurations
const mobileDevices = [
  { name: 'iPhone SE', width: 375, height: 667, deviceScaleFactor: 2 },
  { name: 'iPhone 12', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926, deviceScaleFactor: 3 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800, deviceScaleFactor: 3 },
  { name: 'iPad Mini', width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: 'Google Pixel 5', width: 393, height: 851, deviceScaleFactor: 2.75 }
];

async function testMobileAppExperience() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const results = [];
  
  console.log('🚀 Starting Mobile App Experience Testing...\n');
  
  for (const device of mobileDevices) {
    console.log(`📱 Testing on ${device.name} (${device.width}x${device.height})...`);
    
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: true,
      hasTouch: true
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate to the application
      await page.goto('http://localhost:3003');
      await page.waitForTimeout(2000);
      
      // Test mobile navigation to lead form
      console.log(`  → Testing mobile navigation...`);
      await page.click('button:has-text("Começar"), .mobile-cta-button, [data-testid="mobile-start-button"]').catch(() => {
        // Try alternative selectors if primary doesn't work
        return page.click('text=Começar').catch(() => {
          return page.click('.cta-button, .start-button').catch(() => {
            console.log('    ⚠️ Could not find start button, navigating directly to form');
          });
        });
      });
      
      await page.waitForTimeout(1500);
      
      // Navigate directly to mobile form if needed
      const currentUrl = page.url();
      if (!currentUrl.includes('cotacao') && !currentUrl.includes('mobile')) {
        await page.goto('http://localhost:3003/cotacao');
        await page.waitForTimeout(2000);
      }
      
      const deviceResult = {
        device: device.name,
        viewport: `${device.width}x${device.height}`,
        tests: []
      };
      
      // Test 1: Check if form container fits viewport without scrolling
      console.log(`  → Checking single-screen app container...`);
      const containerHeight = await page.evaluate(() => {
        const container = document.querySelector('.mobile-app-container, [style*="height: calc(100vh - 60px)"]');
        if (!container) return null;
        return {
          containerHeight: container.offsetHeight,
          viewportHeight: window.innerHeight,
          hasOverflow: container.scrollHeight > container.offsetHeight
        };
      });
      
      deviceResult.tests.push({
        name: 'Single-Screen Container',
        passed: containerHeight ? containerHeight.containerHeight <= containerHeight.viewportHeight : false,
        details: containerHeight ? `Container: ${containerHeight.containerHeight}px, Viewport: ${containerHeight.viewportHeight}px` : 'Container not found'
      });
      
      // Test 2: Check progress header is minimal and fixed
      console.log(`  → Checking compact progress header...`);
      const progressHeader = await page.evaluate(() => {
        const header = document.querySelector('.flex-none, .sticky');
        if (!header) return null;
        return {
          height: header.offsetHeight,
          isSticky: getComputedStyle(header).position === 'sticky' || getComputedStyle(header).position === 'fixed',
          textSize: getComputedStyle(header.querySelector('h2, h3') || header).fontSize
        };
      });
      
      deviceResult.tests.push({
        name: 'Compact Progress Header',
        passed: progressHeader ? progressHeader.height <= 60 && progressHeader.isSticky : false,
        details: progressHeader ? `Height: ${progressHeader.height}px, Sticky: ${progressHeader.isSticky}` : 'Header not found'
      });
      
      // Test 3: Test app-like step navigation
      console.log(`  → Testing app-like step navigation...`);
      let stepNavigationWorks = false;
      
      try {
        // Try to find and click service selection buttons
        await page.waitForSelector('button[type="button"]', { timeout: 3000 });
        
        // Look for service selection buttons
        const serviceButtons = await page.$$('.service-option, button:has-text("✈️"), button:has-text("🏨"), button:has-text("🚗")');
        if (serviceButtons.length > 0) {
          await serviceButtons[0].click();
          await page.waitForTimeout(1000);
          
          // Check if we moved to next step
          const hasNextStepButton = await page.$('button:has-text("Continuar"), button:has-text("→")');
          stepNavigationWorks = !!hasNextStepButton;
        }
      } catch (error) {
        console.log(`    ⚠️ Navigation test failed: ${error.message}`);
      }
      
      deviceResult.tests.push({
        name: 'App-Like Step Navigation',
        passed: stepNavigationWorks,
        details: stepNavigationWorks ? 'Navigation flows properly' : 'Navigation issues detected'
      });
      
      // Test 4: Check if form elements are touch-friendly
      console.log(`  → Checking touch-friendly elements...`);
      const touchFriendly = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, select, button, textarea'));
        const touchFriendlyElements = inputs.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.height >= 44; // Apple's recommended minimum touch target
        });
        return {
          total: inputs.length,
          touchFriendly: touchFriendlyElements.length,
          percentage: inputs.length > 0 ? Math.round((touchFriendlyElements.length / inputs.length) * 100) : 0
        };
      });
      
      deviceResult.tests.push({
        name: 'Touch-Friendly Elements',
        passed: touchFriendly.percentage >= 80,
        details: `${touchFriendly.percentage}% of elements (${touchFriendly.touchFriendly}/${touchFriendly.total}) are touch-friendly`
      });
      
      // Test 5: Check responsive font sizes
      console.log(`  → Checking mobile-optimized typography...`);
      const typography = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, div'));
        const fontSizes = elements.map(el => {
          const fontSize = parseFloat(getComputedStyle(el).fontSize);
          return fontSize;
        }).filter(size => size > 0);
        
        const averageFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
        const minFontSize = Math.min(...fontSizes);
        
        return {
          averageFontSize: Math.round(averageFontSize),
          minFontSize: Math.round(minFontSize),
          readableElements: fontSizes.filter(size => size >= 14).length,
          totalElements: fontSizes.length
        };
      });
      
      deviceResult.tests.push({
        name: 'Mobile Typography',
        passed: typography.minFontSize >= 14 && typography.averageFontSize >= 16,
        details: `Min: ${typography.minFontSize}px, Avg: ${typography.averageFontSize}px, ${Math.round((typography.readableElements/typography.totalElements)*100)}% readable`
      });
      
      // Take screenshot for visual verification
      const screenshotPath = `./mobile-test-${device.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`  → Screenshot saved: ${screenshotPath}`);
      
      results.push(deviceResult);
      console.log(`  ✅ ${device.name} testing completed\n`);
      
    } catch (error) {
      console.log(`  ❌ Error testing ${device.name}: ${error.message}\n`);
      results.push({
        device: device.name,
        viewport: `${device.width}x${device.height}`,
        error: error.message,
        tests: []
      });
    }
    
    await context.close();
  }
  
  // Generate detailed report
  console.log('📊 MOBILE APP EXPERIENCE TEST RESULTS');
  console.log('=====================================\n');
  
  let allTestsPassed = true;
  const testSummary = {
    totalDevices: results.length,
    passedDevices: 0,
    failedDevices: 0,
    testCategories: {
      'Single-Screen Container': { passed: 0, total: 0 },
      'Compact Progress Header': { passed: 0, total: 0 },
      'App-Like Step Navigation': { passed: 0, total: 0 },
      'Touch-Friendly Elements': { passed: 0, total: 0 },
      'Mobile Typography': { passed: 0, total: 0 }
    }
  };
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.device} (${result.viewport}): ERROR - ${result.error}`);
      testSummary.failedDevices++;
      allTestsPassed = false;
      return;
    }
    
    const devicePassed = result.tests.every(test => test.passed);
    if (devicePassed) {
      testSummary.passedDevices++;
      console.log(`✅ ${result.device} (${result.viewport}): ALL TESTS PASSED`);
    } else {
      testSummary.failedDevices++;
      allTestsPassed = false;
      console.log(`⚠️  ${result.device} (${result.viewport}): SOME ISSUES DETECTED`);
    }
    
    result.tests.forEach(test => {
      const icon = test.passed ? '  ✓' : '  ✗';
      console.log(`${icon} ${test.name}: ${test.details}`);
      
      if (testSummary.testCategories[test.name]) {
        testSummary.testCategories[test.name].total++;
        if (test.passed) testSummary.testCategories[test.name].passed++;
      }
    });
    console.log();
  });
  
  // Overall summary
  console.log('OVERALL SUMMARY');
  console.log('===============');
  console.log(`Devices Tested: ${testSummary.totalDevices}`);
  console.log(`Devices Passed: ${testSummary.passedDevices}`);
  console.log(`Devices Failed: ${testSummary.failedDevices}`);
  console.log(`Success Rate: ${Math.round((testSummary.passedDevices/testSummary.totalDevices)*100)}%\n`);
  
  console.log('TEST CATEGORIES BREAKDOWN:');
  Object.entries(testSummary.testCategories).forEach(([category, stats]) => {
    const successRate = stats.total > 0 ? Math.round((stats.passed/stats.total)*100) : 0;
    console.log(`• ${category}: ${stats.passed}/${stats.total} devices (${successRate}%)`);
  });
  
  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: testSummary,
    results: results,
    overallPassed: allTestsPassed
  };
  
  fs.writeFileSync('./mobile-app-experience-test-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed report saved: mobile-app-experience-test-report.json');
  
  if (allTestsPassed) {
    console.log('\n🎉 SUCCESS: All mobile devices passed the app-like experience tests!');
    console.log('   The mobile form now provides a true single-screen app experience.');
  } else {
    console.log('\n⚠️  ATTENTION: Some devices have issues that need addressing.');
    console.log('   Check the detailed report and screenshots for specific problems.');
  }
  
  await browser.close();
  return allTestsPassed;
}

// Execute the test
testMobileAppExperience().then(success => {
  console.log(`\n🏁 Mobile App Experience Testing Complete - ${success ? 'PASSED' : 'NEEDS ATTENTION'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});