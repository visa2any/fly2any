/**
 * ULTRATHINK Mobile App-Like Experience Testing with Playwright MCP
 * Tests the redesigned mobile layout for single-screen, app-like UX
 * Validates no overlapping, proper spacing, and accessibility across devices
 */

const { chromium } = require('playwright');

async function testMobileAppExperience() {
  console.log('🚀 ULTRATHINK Mobile App-Like Experience Testing Started');
  console.log('Testing redesigned single-screen layout with MCP optimization');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  // Test different mobile devices
  const devices = [
    { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
    { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
    { name: 'Samsung Galaxy S21', viewport: { width: 384, height: 854 } },
    { name: 'iPad Mini', viewport: { width: 768, height: 1024 } },
    { name: 'iPhone 14 Pro Max', viewport: { width: 430, height: 932 } }
  ];

  const results = {};

  for (const device of devices) {
    console.log(`\n📱 Testing ${device.name} (${device.viewport.width}x${device.viewport.height})`);
    
    const context = await browser.newContext({
      viewport: device.viewport,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    const page = await context.newPage();
    
    try {
      // Navigate to mobile page
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for mobile detection and layout
      await page.waitForTimeout(2000);

      // Test 1: Check if content fits in viewport (no scrolling needed)
      const viewportHeight = device.viewport.height;
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
      const needsScrolling = bodyHeight > clientHeight;

      console.log(`   📏 Viewport: ${viewportHeight}px, Content: ${bodyHeight}px, Visible: ${clientHeight}px`);
      console.log(`   ${needsScrolling ? '❌' : '✅'} Single-screen experience: ${!needsScrolling ? 'FITS' : 'REQUIRES SCROLLING'}`);

      // Test 2: Check BUSCAR OFERTAS GRATIS button visibility and positioning
      const buscarButton = await page.locator('text=BUSCAR OFERTAS GRÁTIS').first();
      const buscarVisible = await buscarButton.isVisible();
      let buscarPosition = null;
      
      if (buscarVisible) {
        const buscarBox = await buscarButton.boundingBox();
        const bottomNav = await page.locator('nav').last().boundingBox();
        
        if (buscarBox && bottomNav) {
          const clearance = bottomNav.y - (buscarBox.y + buscarBox.height);
          buscarPosition = {
            y: buscarBox.y,
            height: buscarBox.height,
            clearance: clearance,
            overlapping: clearance < 10
          };
        }
      }

      console.log(`   ${buscarVisible ? '✅' : '❌'} BUSCAR OFERTAS GRÁTIS button visible`);
      if (buscarPosition) {
        console.log(`   ${buscarPosition.overlapping ? '❌' : '✅'} Button clearance: ${buscarPosition.clearance}px from bottom nav`);
      }

      // Test 3: Service grid layout validation
      const serviceGrid = await page.locator('[style*="gridTemplateColumns"]').first();
      const serviceCards = await page.locator('a[href*="/cotacao/"]').count();
      const gridVisible = await serviceGrid.isVisible();

      console.log(`   ${gridVisible ? '✅' : '❌'} Service grid layout present`);
      console.log(`   ${serviceCards >= 5 ? '✅' : '❌'} Service cards count: ${serviceCards}/5`);

      // Test 4: Touch target sizes (44px minimum for iOS guidelines)
      const touchTargets = await page.locator('a, button').all();
      let touchTargetIssues = 0;
      
      for (const target of touchTargets) {
        const box = await target.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          touchTargetIssues++;
        }
      }

      console.log(`   ${touchTargetIssues === 0 ? '✅' : '❌'} Touch targets: ${touchTargetIssues} undersized targets found`);

      // Test 5: Check bottom navigation overlap
      const bottomNav = await page.locator('nav').last();
      const navVisible = await bottomNav.isVisible();
      let navOverlap = false;
      
      if (navVisible) {
        const navBox = await bottomNav.boundingBox();
        const mainContent = await page.locator('div[style*="flex: 1"]').boundingBox();
        
        if (navBox && mainContent) {
          navOverlap = navBox.y < (mainContent.y + mainContent.height - 20);
        }
      }

      console.log(`   ${navVisible ? '✅' : '❌'} Bottom navigation present`);
      console.log(`   ${!navOverlap ? '✅' : '❌'} Navigation overlap: ${navOverlap ? 'OVERLAPPING' : 'PROPER CLEARANCE'}`);

      // Test 6: App-like visual hierarchy
      const heroCompact = await page.evaluate(() => {
        const hero = document.querySelector('h1');
        return hero ? parseInt(window.getComputedStyle(hero).fontSize) <= 20 : false;
      });

      const servicesCompact = await page.evaluate(() => {
        const services = document.querySelector('h2');
        return services ? parseInt(window.getComputedStyle(services).fontSize) <= 18 : false;
      });

      console.log(`   ${heroCompact ? '✅' : '❌'} Compact hero typography`);
      console.log(`   ${servicesCompact ? '✅' : '❌'} Compact service section typography`);

      // Take screenshot
      const screenshotPath = `mobile-app-like-${device.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: false // Only capture viewport for single-screen test
      });

      // Store results
      results[device.name] = {
        singleScreen: !needsScrolling,
        buscarButtonVisible: buscarVisible,
        buscarButtonClearance: buscarPosition?.clearance || 0,
        serviceGridPresent: gridVisible,
        serviceCardsCount: serviceCards,
        touchTargetIssues: touchTargetIssues,
        navigationOverlap: navOverlap,
        compactTypography: heroCompact && servicesCompact,
        screenshot: screenshotPath
      };

      console.log(`   📸 Screenshot saved: ${screenshotPath}`);

    } catch (error) {
      console.error(`   ❌ Error testing ${device.name}:`, error.message);
      results[device.name] = { error: error.message };
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Generate comprehensive report
  console.log('\n📊 COMPREHENSIVE APP-LIKE EXPERIENCE REPORT');
  console.log('=' .repeat(60));

  let passedDevices = 0;
  const totalDevices = devices.length;

  for (const [deviceName, result] of Object.entries(results)) {
    console.log(`\n📱 ${deviceName}:`);
    
    if (result.error) {
      console.log(`   ❌ Testing failed: ${result.error}`);
      continue;
    }

    const checks = [
      { name: 'Single-screen fit', passed: result.singleScreen },
      { name: 'BUSCAR button visible', passed: result.buscarButtonVisible },
      { name: 'Button clearance', passed: result.buscarButtonClearance >= 10 },
      { name: 'Service grid present', passed: result.serviceGridPresent },
      { name: 'All service cards', passed: result.serviceCardsCount >= 5 },
      { name: 'Touch targets OK', passed: result.touchTargetIssues === 0 },
      { name: 'No nav overlap', passed: !result.navigationOverlap },
      { name: 'Compact typography', passed: result.compactTypography }
    ];

    const passedChecks = checks.filter(check => check.passed).length;
    const deviceScore = passedChecks / checks.length;

    for (const check of checks) {
      console.log(`   ${check.passed ? '✅' : '❌'} ${check.name}`);
    }

    console.log(`   📊 Device score: ${Math.round(deviceScore * 100)}% (${passedChecks}/${checks.length})`);
    console.log(`   📸 Screenshot: ${result.screenshot}`);

    if (deviceScore >= 0.8) passedDevices++;
  }

  // Final summary
  console.log('\n🎯 FINAL APP-LIKE EXPERIENCE SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Devices passed: ${passedDevices}/${totalDevices}`);
  console.log(`📊 Success rate: ${Math.round((passedDevices / totalDevices) * 100)}%`);

  if (passedDevices === totalDevices) {
    console.log('🎉 PERFECT! All devices have app-like single-screen experience');
  } else if (passedDevices >= totalDevices * 0.8) {
    console.log('👍 GOOD! Most devices have proper app-like experience');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT! Some devices require layout optimization');
  }

  console.log('\n🚀 ULTRATHINK Mobile App-Like Testing Completed');

  return {
    totalDevices,
    passedDevices,
    successRate: Math.round((passedDevices / totalDevices) * 100),
    results
  };
}

// Run the test
if (require.main === module) {
  testMobileAppExperience()
    .then((summary) => {
      console.log('\n📋 Test Summary:', summary);
      process.exit(summary.passedDevices === summary.totalDevices ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = testMobileAppExperience;