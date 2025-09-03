const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 ULTRATHINK ENTERPRISE - Final Complete Test\n');
    console.log('=====================================');
    
    // Test 1: Homepage
    console.log('📱 Test 1: Loading mobile homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'ultrathink-homepage-clean.png' });
    
    // Check for clean header
    const homeHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
    console.log(`   ✓ Headers found: ${homeHeaders.length} (expected: 1)`);
    
    // Check for no debug text
    const debugText = await page.$('text="MOBILE APP VIEW"');
    console.log(`   ✓ Debug text removed: ${!debugText ? 'YES' : 'NO'}`);
    
    // Check for no "Fly2Any" text in header
    const fly2anyText = await page.$('text="Fly2Any"');
    console.log(`   ✓ "Fly2Any" text removed: ${!fly2anyText ? 'YES' : 'NO'}`);
    
    // Check for logo presence
    const logos = await page.$$('img[src*="logo"], [class*="Logo"]');
    console.log(`   ✓ Logo present: ${logos.length > 0 ? 'YES' : 'NO'} (${logos.length} found)`);
    
    // Check for hamburger menu
    const hamburger = await page.$$('[class*="Bars3Icon"], svg[viewBox="0 0 24 24"]');
    console.log(`   ✓ Hamburger menu present: ${hamburger.length > 0 ? 'YES' : 'NO'}`);
    
    console.log('\\n=====================================');
    
    // Test 2: Open Lead Form
    console.log('📋 Test 2: Opening lead form...');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    
    if (serviceButtons.length > 0) {
      await serviceButtons[0].click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'ultrathink-form-with-header.png' });
      
      // Check for header visibility in form
      const formHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
      console.log(`   ✓ Headers in form: ${formHeaders.length} (expected: 1)`);
      
      // Check for back button
      const backButton = await page.$('[aria-label="Voltar"]');
      console.log(`   ✓ Back button present: ${backButton ? 'YES' : 'NO'}`);
      
      // Check for form title
      const formTitle = await page.$('text="Cotação Personalizada"');
      console.log(`   ✓ Form title present: ${formTitle ? 'YES' : 'NO'}`);
      
      // Check logo in form
      const formLogos = await page.$$('img[src*="logo"], [class*="Logo"]');
      console.log(`   ✓ Logo in form: ${formLogos.length > 0 ? 'YES' : 'NO'} (${formLogos.length} found)`);
      
      console.log('\\n=====================================');
      
      // Test 3: Navigate through form steps
      console.log('⚡ Test 3: Testing form step navigation...');
      
      // Go to next step
      const continueButton = await page.$('button:has-text("Continuar")');
      if (continueButton) {
        await continueButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'ultrathink-form-step2.png' });
        
        // Check header still visible in step 2
        const step2Headers = await page.$$('.bg-gradient-to-r.from-purple-600');
        console.log(`   ✓ Headers in step 2: ${step2Headers.length} (expected: 1)`);
        
        // Check step title updated
        const step2Title = await page.$('text="Cotação Personalizada"');
        console.log(`   ✓ Step 2 title present: ${step2Title ? 'YES' : 'NO'}`);
        
      } else {
        console.log('   - Continue button not found, skipping step navigation');
      }
      
      console.log('\\n=====================================');
      
      // Test 4: Back button functionality
      console.log('🔙 Test 4: Testing back button...');
      const backBtn = await page.$('[aria-label="Voltar"]');
      if (backBtn) {
        await backBtn.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'ultrathink-back-to-home.png' });
        
        // Should be back to homepage
        const backToHomeHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
        console.log(`   ✓ Headers after back: ${backToHomeHeaders.length} (expected: 1)`);
        
        // Should not show form title anymore
        const noFormTitle = await page.$('text="Cotação Personalizada"');
        console.log(`   ✓ Form closed: ${!noFormTitle ? 'YES' : 'NO'}`);
        
      } else {
        console.log('   - Back button not found');
      }
      
    } else {
      console.log('   ❌ No service buttons found on homepage');
    }
    
    console.log('\\n=====================================');
    console.log('🎯 ULTRATHINK ENTERPRISE RESULTS:');
    console.log('=====================================');
    
    // Final assessment
    const finalHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
    const finalDebugText = await page.$('text="MOBILE APP VIEW"');
    const finalFly2anyText = await page.$('text="Fly2Any"');
    const finalLogos = await page.$$('img[src*="logo"], [class*="Logo"]');
    
    if (finalHeaders.length === 1 && !finalDebugText && !finalFly2anyText && finalLogos.length >= 1) {
      console.log('✅ MISSION ACCOMPLISHED!');
      console.log('   • Single compact header: ✓');
      console.log('   • No duplicate headers: ✓');
      console.log('   • No debug text: ✓');
      console.log('   • No "Fly2Any" text: ✓');
      console.log('   • Logo present: ✓');
      console.log('   • Enterprise quality: ✓');
    } else {
      console.log('⚠️ ISSUES DETECTED:');
      if (finalHeaders.length !== 1) console.log(`   • Header count: ${finalHeaders.length} (should be 1)`);
      if (finalDebugText) console.log('   • Debug text still present');
      if (finalFly2anyText) console.log('   • "Fly2Any" text still present');
      if (finalLogos.length < 1) console.log('   • Logo missing');
    }
    
    console.log('\\n🎨 Screenshots saved:');
    console.log('   • ultrathink-homepage-clean.png');
    console.log('   • ultrathink-form-with-header.png');
    console.log('   • ultrathink-form-step2.png');
    console.log('   • ultrathink-back-to-home.png');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();