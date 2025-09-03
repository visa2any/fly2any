const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Mobile Header Visibility FINAL FIX...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📱 Step 1: Loading mobile app...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'final-header-test-1-homepage.png' });
    console.log('✅ Homepage screenshot saved');
    
    console.log('\n✈️ Step 2: Opening Voos (Flights) form...');
    // Click on Voos service
    const voosButton = await page.locator('button:has-text("Voos")').first();
    await voosButton.click();
    await page.waitForTimeout(3000);
    
    // Take screenshot of form with headers
    await page.screenshot({ path: 'final-header-test-2-form-with-headers.png' });
    console.log('✅ Form with headers screenshot saved');
    
    console.log('\n🔍 Step 3: Checking element visibility...\n');
    
    // Check main white header visibility
    try {
      const mainHeader = await page.locator('button:has-text("Voltar")').first();
      const isMainHeaderVisible = await mainHeader.isVisible();
      console.log(`Main Header (White BG):     ${isMainHeaderVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
    } catch (e) {
      console.log('Main Header (White BG):     ❌ NOT FOUND');
    }
    
    // Check step navigation visibility
    try {
      const stepNav = await page.locator('text=Detalhes da Viagem').first();
      const isStepNavVisible = await stepNav.isVisible();
      console.log(`Step Navigation (Blue):     ${isStepNavVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
    } catch (e) {
      console.log('Step Navigation (Blue):     ❌ NOT FOUND');
    }
    
    // Check form content visibility
    try {
      const formContent = await page.locator('text=Tipo de viagem').first();
      const isFormVisible = await formContent.isVisible();
      console.log(`Form Content:               ${isFormVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
    } catch (e) {
      console.log('Form Content:               ❌ NOT FOUND');
    }
    
    // Check navigation buttons
    try {
      const navButtons = await page.locator('button:has-text("Próximo")').first();
      const isNavButtonsVisible = await navButtons.isVisible();
      console.log(`Navigation Buttons:         ${isNavButtonsVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
    } catch (e) {
      console.log('Navigation Buttons:         ❌ NOT FOUND');
    }
    
    // Check if bottom navigation is hidden (as it should be when form is open)
    try {
      const bottomNav = await page.locator('button:has-text("Home")').first();
      const isBottomNavVisible = await bottomNav.isVisible();
      console.log(`Bottom Navigation:          ${!isBottomNavVisible ? '✅ HIDDEN (correct)' : '❌ VISIBLE (should be hidden)'}`);
    } catch (e) {
      console.log('Bottom Navigation:          ✅ HIDDEN (correct)');
    }
    
    console.log('\n📊 Visual Hierarchy Summary:');
    console.log('════════════════════════════════════');
    console.log('┌─ Main Header (White) - z-50 ──────┐');
    console.log('├─ Step Navigation (Blue) - z-40 ───┤');
    console.log('├─ Form Content - z-20 ─────────────┤');
    console.log('├─ Navigation Buttons - z-40 ───────┤');
    console.log('└─ Bottom Nav (hidden) ─────────────┘');
    console.log('════════════════════════════════════');
    
    console.log('\n🔙 Step 4: Testing back navigation...');
    try {
      const backButton = await page.locator('button:has-text("Voltar")').first();
      await backButton.click();
      await page.waitForTimeout(2000);
      
      const isBackHome = await page.locator('text=Onde vamos hoje?').isVisible();
      console.log(`Back to home: ${isBackHome ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      await page.screenshot({ path: 'final-header-test-3-back-home.png' });
    } catch (e) {
      console.log('Back navigation: ❌ FAILED -', e.message);
    }
    
    console.log('\n✨ Test completed! Check screenshots for visual confirmation.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'final-header-test-error.png' });
  }
  
  await browser.close();
})();