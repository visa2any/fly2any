const { chromium } = require('playwright');

async function testLogoDisplay() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing logo display on Fly2Any...');
    
    // Navigate to the site
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'logo-test-initial.png', fullPage: true });
    
    // Check if logo images are present
    const logoImages = await page.$$('img[alt*="Fly2Any"], img[src*="fly2any-logo"]');
    console.log(`📊 Found ${logoImages.length} logo elements`);
    
    // Check each logo
    for (let i = 0; i < logoImages.length; i++) {
      const logo = logoImages[i];
      const src = await logo.getAttribute('src');
      const alt = await logo.getAttribute('alt');
      const isVisible = await logo.isVisible();
      const boundingBox = await logo.boundingBox();
      
      console.log(`\n🖼️ Logo ${i + 1}:`);
      console.log(`  - Source: ${src}`);
      console.log(`  - Alt text: ${alt}`);
      console.log(`  - Visible: ${isVisible}`);
      console.log(`  - Dimensions: ${boundingBox ? `${boundingBox.width}x${boundingBox.height}` : 'Not measurable'}`);
      
      // Check if image loaded successfully
      const naturalWidth = await logo.evaluate(img => img.naturalWidth);
      const naturalHeight = await logo.evaluate(img => img.naturalHeight);
      console.log(`  - Natural size: ${naturalWidth}x${naturalHeight}`);
      console.log(`  - Load status: ${naturalWidth > 0 ? '✅ Loaded' : '❌ Failed to load'}`);
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'logo-test-mobile.png', fullPage: true });
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'logo-test-desktop.png', fullPage: true });
    
    console.log('\n📸 Screenshots saved:');
    console.log('  - logo-test-initial.png');
    console.log('  - logo-test-mobile.png');
    console.log('  - logo-test-desktop.png');
    
  } catch (error) {
    console.error('❌ Error testing logo:', error);
  } finally {
    await browser.close();
  }
}

testLogoDisplay();