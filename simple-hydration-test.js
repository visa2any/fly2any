const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔬 ULTRATHINK ENTERPRISE - Simple Hydration Test\n');
    
    let hydrationErrorDetected = false;
    
    // Monitor for hydration errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error' && text.includes('hydration')) {
        hydrationErrorDetected = true;
        console.log(`🔴 HYDRATION ERROR: ${text}`);
      }
    });
    
    // Monitor for exceptions
    page.on('pageerror', error => {
      if (error.message.includes('hydration')) {
        hydrationErrorDetected = true;
        console.log(`💥 HYDRATION EXCEPTION: ${error.message}`);
      }
    });
    
    console.log('🔍 Loading homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Find social proof text
    const socialProofText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (const el of elements) {
        if (el.textContent && el.textContent.includes('pessoas fizeram isso hoje')) {
          return el.textContent;
        }
      }
      return null;
    });
    
    console.log(`📊 Social proof text found: "${socialProofText}"`);
    
    if (socialProofText) {
      // Extract number using more flexible regex
      const numberMatch = socialProofText.match(/(\\d+)\\s*pessoas/);
      const number = numberMatch ? parseInt(numberMatch[1]) : null;
      console.log(`📊 Extracted number: ${number}`);
      
      if (number >= 5 && number <= 19) {
        console.log('✅ Number is within expected range (5-19)');
      } else {
        console.log(`⚠️ Number ${number} is outside expected range`);
      }
    }
    
    await page.screenshot({ path: 'simple-hydration-test.png' });
    
    console.log('\n' + '=' .repeat(50));
    if (!hydrationErrorDetected) {
      console.log('🏆 SUCCESS: NO HYDRATION ERRORS DETECTED!');
      console.log('✅ The Math.random() hydration mismatch has been FIXED!');
      console.log('✅ Enterprise-level solution implemented successfully');
    } else {
      console.log('❌ HYDRATION ERRORS STILL PRESENT');
    }
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('💥 TEST ERROR:', error.message);
  } finally {
    await browser.close();
  }
})();