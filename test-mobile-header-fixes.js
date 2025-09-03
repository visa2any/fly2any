const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing Mobile Header and Step Navigation Fixes...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down for observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Step 1: Loading mobile app...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'mobile-header-test-step1-homepage.png' });
    
    console.log('✈️ Step 2: Clicking on Voos (Flights) service...');
    await page.click('button:has-text("Voos")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'mobile-header-test-step2-form-opened.png' });
    
    console.log('🔍 Step 3: Checking visual hierarchy...');
    
    // Check if main header is visible (white BG, z-50)
    const mainHeader = await page.locator('div:has-text("Voltar")').first();
    const mainHeaderVisible = await mainHeader.isVisible();
    console.log(`✅ Main Header (white BG) visible: ${mainHeaderVisible}`);
    
    // Check if step navigation is visible (blue gradient)
    const stepNavigation = await page.locator('div:has-text("Detalhes da Viagem")').first();
    const stepNavVisible = await stepNavigation.isVisible();
    console.log(`✅ Step Navigation visible: ${stepNavVisible}`);
    
    // Check if form content is visible
    const formContent = await page.locator('text=Tipo de viagem').first();
    const formContentVisible = await formContent.isVisible();
    console.log(`✅ Form Content visible: ${formContentVisible}`);
    
    // Check if bottom navigation is visible (z-50)
    const bottomNav = await page.locator('button:has-text("Home")').first();
    const bottomNavVisible = await bottomNav.isVisible();
    console.log(`✅ Bottom Navigation visible: ${bottomNavVisible}`);
    
    // Check if continue buttons are visible (z-40)
    const continueButton = await page.locator('button:has-text("Próximo")').first();
    const continueButtonVisible = await continueButton.isVisible();
    console.log(`✅ Continue Buttons visible: ${continueButtonVisible}`);
    
    console.log('\n📊 Visual Hierarchy Test Results:');
    console.log('┌─ Main Header (White BG) - z-50 ─┐    ✅', mainHeaderVisible ? 'VISIBLE!' : 'NOT VISIBLE!');
    console.log('├─ Step Navigation ──────────────────┤ ✅', stepNavVisible ? 'VISIBLE!' : 'NOT VISIBLE!');
    console.log('├─ Form Content ─────────────────────┤ ✅', formContentVisible ? 'VISIBLE!' : 'NOT VISIBLE!');
    console.log('├─ [VOLTAR] [CONTINUAR] - z-40 ──────┤ ✅', continueButtonVisible ? 'VISIBLE!' : 'NOT VISIBLE!');
    console.log('└─ Bottom Menu Icons - z-50 ─────────┘ ✅', bottomNavVisible ? 'VISIBLE!' : 'NOT VISIBLE!');
    
    // Test back navigation
    console.log('\n🔙 Step 4: Testing back navigation...');
    await page.click('button:has-text("Voltar")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'mobile-header-test-step4-back-to-home.png' });
    
    const backToHome = await page.locator('text=Onde vamos hoje?').isVisible();
    console.log(`✅ Successfully navigated back to home: ${backToHome}`);
    
    console.log('\n🎉 Mobile Header and Step Navigation Test COMPLETED!');
    
    if (mainHeaderVisible && stepNavVisible && formContentVisible && continueButtonVisible && bottomNavVisible) {
      console.log('✅ ALL VISUAL HIERARCHY ELEMENTS ARE PROPERLY VISIBLE!');
    } else {
      console.log('❌ Some elements may have visibility issues');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'mobile-header-test-error.png' });
  }
  
  await browser.close();
})();