const { chromium } = require('playwright');

async function simpleUXAnalysis() {
  console.log('🎭 Starting Simple UX Analysis...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Set a longer timeout
    page.setDefaultTimeout(60000);
    
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take homepage screenshot
    console.log('📸 Capturing homepage...');
    await page.screenshot({ path: 'homepage-current.png', fullPage: true });
    
    // Try to navigate to flights page
    console.log('📍 Navigating to /flights...');
    await page.goto('http://localhost:3000/flights', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    // Take flights page screenshot
    console.log('📸 Capturing flights page...');
    await page.screenshot({ path: 'flights-page-current.png', fullPage: true });
    
    // Capture viewport only
    console.log('📸 Capturing viewport...');
    await page.screenshot({ path: 'flights-viewport.png' });
    
    console.log('✅ Screenshots captured successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

simpleUXAnalysis().catch(console.error);