const { chromium } = require('playwright');

async function captureHomepage() {
  console.log('🎭 Starting Playwright screenshot capture...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(5000);
    
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'green-border-investigation.png',
      fullPage: true
    });
    
    console.log('✅ Screenshot saved as green-border-investigation.png');
    
    // Quick analysis of green elements
    const greenElementsCount = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let count = 0;
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const borderColor = styles.borderColor;
        const backgroundColor = styles.backgroundColor;
        
        if (borderColor.includes('green') || backgroundColor.includes('green') ||
            borderColor.includes('rgb(34, 197, 94)') || backgroundColor.includes('rgb(34, 197, 94)')) {
          count++;
        }
      });
      
      return count;
    });
    
    console.log(`🟢 Found ${greenElementsCount} elements with green styling`);
    
    // Get page source
    const pageSource = await page.content();
    require('fs').writeFileSync('homepage-source.html', pageSource);
    console.log('📝 Page source saved as homepage-source.html');
    
    return { success: true, greenElements: greenElementsCount };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureHomepage()
  .then(result => {
    console.log('🎉 Capture complete!');
  })
  .catch(error => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });