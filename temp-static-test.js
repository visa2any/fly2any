
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const consoleMessages = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`Console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('Page Error:', error.message);
  });
  
  try {
    console.log('⏳ Loading test HTML...');
    await page.goto('file:///mnt/d/Users/vilma/fly2any/simple-test.html');
    
    console.log('⏳ Waiting for React to load...');
    await page.waitForFunction(() => window.React && window.ReactDOM, { timeout: 10000 });
    
    const reactVersion = await page.evaluate(() => window.React?.version);
    console.log('📊 React version:', reactVersion);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'test-results/static-html-test.png', fullPage: true });
    
    console.log('🧪 Testing webpack error simulation...');
    await page.click('button:has-text("Simulate originalFactory Error")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Test Module Resolution")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Trigger HMR Error")');
    await page.waitForTimeout(2000);
    
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'test-results/webpack-simulation-test.png', fullPage: true });
    
    // Export results
    const results = {
      reactVersion,
      consoleMessages,
      errors,
      webpackErrors: consoleMessages.filter(msg => 
        msg.text.includes('originalFactory') || 
        msg.text.includes('webpack') || 
        msg.text.includes('HMR')
      )
    };
    
    require('fs').writeFileSync('test-results/static-html-results.json', JSON.stringify(results, null, 2));
    
    console.log('✅ Static HTML test completed successfully');
    
  } catch (error) {
    console.error('❌ Static HTML test failed:', error.message);
    throw error;
  }
  
  await browser.close();
})();
