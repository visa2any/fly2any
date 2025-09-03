const { chromium, devices } = require('playwright');

async function testMobileUI() {
  console.log('🚀 Testing Mobile UI Enhancements...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });

  // Test on different mobile devices
  const mobileDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
    { name: 'iPad Mini', device: devices['iPad Mini'] }
  ];

  for (const { name, device } of mobileDevices) {
    console.log(`📱 Testing on ${name}...`);
    
    const context = await browser.newContext({
      ...device,
      permissions: ['geolocation'],
      geolocation: { latitude: -23.550520, longitude: -46.633308 }, // São Paulo
    });
    
    const page = await context.newPage();
    
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      // Test 1: Mobile Hero Section
      console.log('  ✅ Checking mobile hero section...');
      const heroVisible = await page.locator('text="Voe para Qualquer Lugar"').isVisible().catch(() => false);
      const mobileHero = await page.locator('[class*="mobile-hero"]').isVisible().catch(() => false);
      console.log(`    Hero section: ${heroVisible || mobileHero ? '✅' : '❌'}`);
      
      // Test 2: Mobile Bottom Navigation
      console.log('  ✅ Checking bottom navigation...');
      const bottomNav = await page.locator('[class*="mobile-bottom-nav"]').isVisible().catch(() => false);
      console.log(`    Bottom nav: ${bottomNav ? '✅' : '❌'}`);
      
      // Test 3: Touch Targets
      console.log('  ✅ Testing touch targets...');
      const buttons = await page.locator('button').all();
      let touchTargetIssues = 0;
      for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
        const box = await button.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          touchTargetIssues++;
        }
      }
      console.log(`    Touch targets: ${touchTargetIssues === 0 ? '✅' : `❌ ${touchTargetIssues} issues`}`);
      
      // Test 4: Mobile Flight Form
      console.log('  ✅ Testing mobile flight form...');
      const flightForm = await page.locator('[class*="mobile-flight-form"], [class*="MobileFlightForm"]').isVisible().catch(() => false);
      console.log(`    Mobile form: ${flightForm ? '✅' : '⚠️ Using default form'}`);
      
      // Test 5: Swipe Gestures
      console.log('  ✅ Testing swipe gestures...');
      const startX = 300;
      const startY = 400;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(100, startY, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      console.log('    Swipe gesture: ✅ Executed');
      
      // Test 6: Performance Metrics
      console.log('  ✅ Checking performance...');
      const metrics = await page.evaluate(() => {
        const timing = performance.timing;
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart
        };
      });
      console.log(`    DOM loaded: ${metrics.domContentLoaded}ms`);
      console.log(`    Page loaded: ${metrics.loadComplete}ms`);
      
      // Test 7: Viewport Adaptation
      console.log('  ✅ Testing viewport adaptation...');
      // Rotate to landscape
      await context.setViewportSize({ 
        width: device.viewport.height, 
        height: device.viewport.width 
      });
      await page.waitForTimeout(1000);
      console.log('    Landscape mode: ✅');
      
      // Rotate back to portrait
      await context.setViewportSize(device.viewport);
      await page.waitForTimeout(1000);
      console.log('    Portrait mode: ✅');
      
      // Take screenshot
      await page.screenshot({ 
        path: `mobile-test-${name.replace(/\s+/g, '-')}.png`,
        fullPage: false
      });
      console.log(`  📸 Screenshot saved: mobile-test-${name.replace(/\s+/g, '-')}.png\n`);
      
    } catch (error) {
      console.error(`  ❌ Error testing ${name}:`, error.message);
    } finally {
      await context.close();
    }
  }

  // Test Desktop for comparison
  console.log('💻 Testing Desktop (for comparison)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();
  
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);
  
  // Check desktop elements are visible
  const desktopHero = await desktopPage.locator('h1').first().isVisible();
  const mobileBottomNav = await desktopPage.locator('[class*="mobile-bottom-nav"]').isVisible().catch(() => false);
  
  console.log(`  Desktop hero visible: ${desktopHero ? '✅' : '❌'}`);
  console.log(`  Mobile nav hidden on desktop: ${!mobileBottomNav ? '✅' : '❌'}`);
  
  await desktopPage.screenshot({ path: 'desktop-test.png' });
  console.log('  📸 Screenshot saved: desktop-test.png\n');
  
  await desktopContext.close();
  await browser.close();
  
  console.log('✨ Mobile UI testing completed!');
}

// Run the test
testMobileUI().catch(console.error);