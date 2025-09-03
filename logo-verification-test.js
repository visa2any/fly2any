const { chromium } = require('playwright');

async function runLogoVerificationTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-web-security'] 
  });

  console.log('🔍 LOGO VERIFICATION TEST - Final Check');
  console.log('=====================================');

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    // Enable request logging to check for any PNG logo requests
    page.on('request', request => {
      if (request.url().includes('fly2any-logo')) {
        console.log(`📡 Logo request: ${request.url()}`);
      }
    });

    // Enable response logging for logo requests
    page.on('response', response => {
      if (response.url().includes('fly2any-logo')) {
        console.log(`📡 Logo response: ${response.url()} - Status: ${response.status()}`);
      }
    });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    console.log('\n🖥️ DESKTOP TEST (1920x1080)');
    console.log('============================');

    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Take desktop screenshot
    await page.screenshot({ 
      path: 'logo-verification-desktop.png', 
      fullPage: false 
    });

    // Check if logo elements exist
    const desktopLogoVisible = await page.isVisible('img[alt*="Fly2Any"]');
    const desktopLogoSrc = await page.getAttribute('img[alt*="Fly2Any"]', 'src');
    
    console.log(`✅ Desktop logo visible: ${desktopLogoVisible}`);
    console.log(`✅ Desktop logo source: ${desktopLogoSrc}`);

    // Test logo clickability
    const logoElement = page.locator('a').filter({ has: page.locator('img[alt*="Fly2Any"]') }).first();
    const logoClickable = await logoElement.count() > 0;
    console.log(`✅ Desktop logo clickable: ${logoClickable}`);

    if (logoClickable) {
      // Test navigation
      await logoElement.click();
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`✅ Desktop logo navigation: ${currentUrl}`);
    }

    console.log('\n📱 MOBILE TEST (iPhone 12 Pro: 390x844)');
    console.log('=======================================');

    // Switch to mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    await page.waitForTimeout(3000);

    // Take mobile screenshot
    await page.screenshot({ 
      path: 'logo-verification-mobile.png', 
      fullPage: false 
    });

    // Check mobile logo
    const mobileLogoVisible = await page.isVisible('img[alt*="Fly2Any"]');
    const mobileLogoSrc = await page.getAttribute('img[alt*="Fly2Any"]', 'src');
    
    console.log(`✅ Mobile logo visible: ${mobileLogoVisible}`);
    console.log(`✅ Mobile logo source: ${mobileLogoSrc}`);

    // Test mobile logo clickability
    const mobileLogoElement = page.locator('a').filter({ has: page.locator('img[alt*="Fly2Any"]') }).first();
    const mobileLogoClickable = await mobileLogoElement.count() > 0;
    console.log(`✅ Mobile logo clickable: ${mobileLogoClickable}`);

    if (mobileLogoClickable) {
      await mobileLogoElement.click();
      await page.waitForTimeout(2000);
      const mobileCurrentUrl = page.url();
      console.log(`✅ Mobile logo navigation: ${mobileCurrentUrl}`);
    }

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const broken = [];
      images.forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
          broken.push(img.src);
        }
      });
      return broken;
    });

    console.log('\n🔍 IMAGE ANALYSIS');
    console.log('=================');
    console.log(`Total broken images: ${brokenImages.length}`);
    if (brokenImages.length > 0) {
      brokenImages.forEach(src => console.log(`❌ Broken: ${src}`));
    }

    // FINAL VERIFICATION SUMMARY
    console.log('\n🎯 FINAL VERIFICATION SUMMARY');
    console.log('============================');

    const allTestsPassed = (
      desktopLogoVisible && 
      mobileLogoVisible && 
      desktopLogoSrc?.includes('.svg') && 
      mobileLogoSrc?.includes('.svg') && 
      logoClickable && 
      mobileLogoClickable &&
      brokenImages.length === 0
    );

    if (allTestsPassed) {
      console.log('🎉 SUCCESS: Logo visibility issue is RESOLVED!');
      console.log('✅ Desktop logo: Visible and working');
      console.log('✅ Mobile logo: Visible and working');
      console.log('✅ SVG format: Loading correctly');
      console.log('✅ Clickability: Working on both platforms');
      console.log('✅ No broken images detected');
    } else {
      console.log('❌ ISSUES DETECTED:');
      if (!desktopLogoVisible) console.log('  - Desktop logo not visible');
      if (!mobileLogoVisible) console.log('  - Mobile logo not visible');
      if (!desktopLogoSrc?.includes('.svg')) console.log('  - Desktop logo not using SVG');
      if (!mobileLogoSrc?.includes('.svg')) console.log('  - Mobile logo not using SVG');
      if (!logoClickable) console.log('  - Desktop logo not clickable');
      if (!mobileLogoClickable) console.log('  - Mobile logo not clickable');
      if (brokenImages.length > 0) console.log(`  - ${brokenImages.length} broken images found`);
    }

    return allTestsPassed;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
runLogoVerificationTest().then(success => {
  console.log(`\n📊 FINAL RESULT: ${success ? 'RESOLVED ✅' : 'NEEDS ATTENTION ❌'}`);
  process.exit(success ? 0 : 1);
});