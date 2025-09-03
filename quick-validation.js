const { chromium } = require('playwright');

async function quickValidation() {
  console.log('🎭 Quick validation of new transparent form...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📍 Navigating to flights page...');
    await page.goto('http://localhost:3000/flights');
    
    // Wait for page load
    await page.waitForTimeout(5000);
    
    console.log('📸 Capturing updated page...');
    await page.screenshot({ 
      path: 'flights-updated-transparent-form.png',
      fullPage: true 
    });
    
    console.log('✅ Validation complete! Check flights-updated-transparent-form.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickValidation().catch(console.error);