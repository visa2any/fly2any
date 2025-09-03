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
    console.log('🚀 ENTERPRISE MULTI-STEP FORM - Debug Test\n');
    
    // Step 1: Navigate to homepage
    console.log('📱 Step 1: Loading homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'debug-1-homepage.png' });
    console.log('✅ Homepage loaded successfully');
    
    // Step 2: Open multi-step form
    console.log('\n🎯 Step 2: Opening multi-step form...');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    console.log(`Found ${serviceButtons.length} service buttons`);
    
    if (serviceButtons.length === 0) {
      throw new Error('No service buttons found');
    }
    
    await serviceButtons[0].click(); // Click first service button
    await page.waitForTimeout(4000); // Wait longer for form to load
    
    await page.screenshot({ path: 'debug-2-form-opened.png' });
    console.log('✅ Multi-step form opened');
    
    // Debug: Check what progress elements exist
    console.log('\n🔍 Debugging progress bar elements...');
    
    // Check for various progress indicators
    const progressElements1 = await page.$$('text=/Passo.*de.*4/');
    const progressElements2 = await page.$$('[class*="progress"]');
    const progressElements3 = await page.$$('text="Passo 1 de 4"');
    
    console.log(`• Progress pattern 1 (/Passo.*de.*4/): ${progressElements1.length} found`);
    console.log(`• Progress elements with "progress" class: ${progressElements2.length} found`);
    console.log(`• Exact "Passo 1 de 4": ${progressElements3.length} found`);
    
    // Get all text content to debug
    const allText = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    console.log('\n📝 All page text (first 500 chars):');
    console.log(allText.substring(0, 500));
    
    // Look for the progress text more specifically
    const hasProgressText = allText.includes('Passo') && allText.includes('de 4');
    console.log(`\n🎯 Progress text found in page: ${hasProgressText}`);
    
    if (hasProgressText) {
      console.log('✅ Progress bar text exists in page content');
    } else {
      console.log('❌ Progress bar text not found - checking form state...');
      
      // Check if form is actually opened
      const formContainer = await page.$('[class*="multi-step"]');
      const leadForm = await page.$('[class*="lead-form"]');
      const stepIndicator = await page.$('[class*="step"]');
      
      console.log(`• Multi-step container: ${formContainer ? 'found' : 'not found'}`);
      console.log(`• Lead form: ${leadForm ? 'found' : 'not found'}`);
      console.log(`• Step indicator: ${stepIndicator ? 'found' : 'not found'}`);
    }
    
    console.log('\n🖼️ Screenshots saved:');
    console.log('   • debug-1-homepage.png');
    console.log('   • debug-2-form-opened.png');
    
  } catch (error) {
    console.error('\n❌ Debug test failed:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
  } finally {
    await browser.close();
  }
})();