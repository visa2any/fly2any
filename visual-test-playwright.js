const { chromium } = require('playwright');
const path = require('path');

async function visualTestFlightGrid() {
  console.log('🎬 Starting Visual Test for Popular Flight Deals Grid...\n');
  
  const browser = await chromium.launch({ 
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();
  
  try {
    // Load the static HTML file
    const htmlPath = path.resolve('/mnt/d/Users/vilma/fly2any/test-grid-visual.html');
    const fileUrl = `file://${htmlPath}`;
    
    console.log('📂 Loading static HTML file...');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    
    console.log('✅ Page loaded successfully\n');
    
    // Take full page screenshot
    console.log('📸 Taking desktop screenshot (1400px)...');
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/popular-deals-desktop-final.png',
      fullPage: true
    });
    
    // Test hover effect on first card
    console.log('🖱️  Testing hover effect...');
    await page.locator('.route-card').first().hover();
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/popular-deals-hover-effect.png',
      fullPage: true
    });
    
    // Test tablet view
    console.log('📱 Testing tablet view (1024px)...');
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/popular-deals-tablet-final.png',
      fullPage: true
    });
    
    // Test mobile view
    console.log('📱 Testing mobile view (768px)...');
    await page.setViewportSize({ width: 768, height: 1000 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/popular-deals-mobile-final.png',
      fullPage: true
    });
    
    // Analyze the design elements
    console.log('🔍 Analyzing design elements...\n');
    
    // Check card backgrounds
    const cardBgColor = await page.locator('.route-image').first().evaluate(el => {
      return window.getComputedStyle(el).background;
    });
    
    // Check button styling
    const buttonStyles = await page.locator('.book-btn').first().evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        fontSize: styles.fontSize,
        backgroundColor: styles.backgroundColor
      };
    });
    
    console.log('🎨 DESIGN ANALYSIS:');
    console.log(`Card Background: ${cardBgColor.includes('linear-gradient') ? 'Clean gradient' : 'Solid color'}`);
    console.log(`Button Padding: ${buttonStyles.padding}`);
    console.log(`Button Font Size: ${buttonStyles.fontSize}`);
    console.log(`Button Color: ${buttonStyles.backgroundColor}`);
    
    console.log('\n✅ Visual testing completed successfully!');
    console.log('📁 Screenshots saved to test-results/ directory');
    
  } catch (error) {
    console.error('❌ Visual test failed:', error.message);
  }
  
  await browser.close();
  console.log('\n🏁 Visual test complete!');
}

visualTestFlightGrid().catch(console.error);