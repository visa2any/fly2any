const { chromium } = require('playwright');

async function simpleLogoTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-web-security'] 
  });

  console.log('🔍 SIMPLE LOGO VERIFICATION TEST');
  console.log('================================');

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // Track logo requests
    let logoRequests = [];
    page.on('request', request => {
      if (request.url().includes('fly2any-logo')) {
        logoRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`📡 Logo request: ${request.url()}`);
      }
    });

    console.log('\n🌐 Loading homepage...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'load',
      timeout: 60000 
    });

    // Wait a moment for resources to load
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ 
      path: 'simple-logo-test.png', 
      fullPage: false 
    });

    // Check for logo elements
    const logos = await page.locator('img[alt*="Fly2Any"]').all();
    console.log(`\n✅ Found ${logos.length} logo element(s)`);

    for (let i = 0; i < logos.length; i++) {
      const logo = logos[i];
      const src = await logo.getAttribute('src');
      const isVisible = await logo.isVisible();
      const alt = await logo.getAttribute('alt');
      
      console.log(`  Logo ${i+1}: ${src} (visible: ${isVisible})`);
      console.log(`  Alt text: ${alt}`);
    }

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const broken = [];
      images.forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
          broken.push({
            src: img.src,
            alt: img.alt
          });
        }
      });
      return broken;
    });

    console.log(`\n🖼️ Total images: ${await page.locator('img').count()}`);
    console.log(`❌ Broken images: ${brokenImages.length}`);
    brokenImages.forEach(img => {
      console.log(`   - ${img.src} (${img.alt})`);
    });

    console.log(`\n📡 Logo requests made: ${logoRequests.length}`);
    logoRequests.forEach(req => {
      console.log(`   - ${req.method} ${req.url}`);
    });

    // Test mobile view
    console.log('\n📱 Testing mobile view...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'simple-logo-test-mobile.png', 
      fullPage: false 
    });

    const mobileLogos = await page.locator('img[alt*="Fly2Any"]').all();
    console.log(`✅ Mobile logos found: ${mobileLogos.length}`);

    // Summary
    const hasDesktopLogo = logos.length > 0;
    const hasMobileLogo = mobileLogos.length > 0;
    const noBrokenImages = brokenImages.length === 0;
    const svgRequested = logoRequests.some(req => req.url.includes('.svg'));

    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log(`✅ Desktop logo found: ${hasDesktopLogo}`);
    console.log(`✅ Mobile logo found: ${hasMobileLogo}`);
    console.log(`✅ SVG requested: ${svgRequested}`);
    console.log(`✅ No broken images: ${noBrokenImages}`);

    const allGood = hasDesktopLogo && hasMobileLogo && noBrokenImages && svgRequested;
    console.log(`\n📊 OVERALL RESULT: ${allGood ? 'RESOLVED ✅' : 'NEEDS ATTENTION ❌'}`);

    return allGood;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

simpleLogoTest().then(success => {
  process.exit(success ? 0 : 1);
});