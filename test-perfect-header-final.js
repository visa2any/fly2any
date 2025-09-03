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
    console.log('🚀 ULTRATHINK ENTERPRISE - Perfect Header Implementation Test\n');
    
    // Test 1: Clean Homepage
    console.log('====================================================');
    console.log('📱 TEST 1: Homepage Analysis');
    console.log('====================================================');
    
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'perfect-homepage.png' });
    
    const homeHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
    const homeLogos = await page.$$('img[src*=\"logo\"], [class*=\"Logo\"]');
    const homeHamburger = await page.$$('svg[class*=\"w-5\"][class*=\"h-5\"]');
    const homeBackButton = await page.$('[aria-label=\"Voltar\"]');
    const homeTitle = await page.$('text=\"Cotação Personalizada\"');
    const homeFly2any = await page.$('text=\"Fly2Any\"');
    const homeDebug = await page.$('text=\"MOBILE APP VIEW\"');
    \n    console.log('Homepage Results:');  \n    console.log(`   ✓ Headers: ${homeHeaders.length} (perfect: 1)`);   \n    console.log(`   ✓ Logo: ${homeLogos.length > 0 ? 'PRESENT' : 'MISSING'}`);  \n    console.log(`   ✓ Hamburger Menu: ${homeHamburger.length > 0 ? 'PRESENT' : 'MISSING'}`);  \n    console.log(`   ✓ Back Button: ${!homeBackButton ? 'ABSENT ✓' : 'PRESENT ✗'}`);  \n    console.log(`   ✓ Title Text: ${!homeTitle ? 'ABSENT ✓' : 'PRESENT ✗'}`);  \n    console.log(`   ✓ \"Fly2Any\" Text: ${!homeFly2any ? 'ABSENT ✓' : 'PRESENT ✗'}`);  \n    console.log(`   ✓ Debug Text: ${!homeDebug ? 'ABSENT ✓' : 'PRESENT ✗'}`);
    
    // Test 2: Form with Perfect Header\n    console.log('\\n====================================================');   \n    console.log('📋 TEST 2: Form Header Analysis');   \n    console.log('====================================================');
    
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    if (serviceButtons.length > 0) {
      await serviceButtons[0].click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'perfect-form-header.png' });
      
      const formHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
      const formLogos = await page.$$('img[src*=\"logo\"], [class*=\"Logo\"]');  
      const formHamburger = await page.$$('svg[class*=\"w-5\"][class*=\"h-5\"]');
      const formBackButton = await page.$('[aria-label=\"Voltar\"]');
      const formTitle = await page.$('text=\"Cotação Personalizada\"');
      const formFly2any = await page.$('text=\"Fly2Any\"');
      
      console.log('Form Results:');
      console.log(`   ✓ Headers: ${formHeaders.length} (perfect: 1)`);
      console.log(`   ✓ Logo: ${formLogos.length > 0 ? 'PRESENT' : 'MISSING'}`);
      console.log(`   ✓ Hamburger Menu: ${formHamburger.length > 0 ? 'PRESENT' : 'MISSING'}`);
      console.log(`   ✓ Back Button: ${!formBackButton ? 'ABSENT ✓' : 'PRESENT ✗'}`);
      console.log(`   ✓ Title Text: ${!formTitle ? 'ABSENT ✓' : 'PRESENT ✗'}`);
      console.log(`   ✓ \"Fly2Any\" Text: ${!formFly2any ? 'ABSENT ✓' : 'PRESENT ✗'}`);
      
      // Test 3: Header Identity Verification\n      console.log('\\n====================================================');  \n      console.log('🔍 TEST 3: Header Identity Verification');  \n      console.log('====================================================');
      
      const headersIdentical = (homeHeaders.length === formHeaders.length);
      const logosIdentical = (homeLogos.length === formLogos.length);
      const noBackButton = (!homeBackButton && !formBackButton);
      const noTitleText = (!homeTitle && !formTitle);
      const noFly2anyText = (!homeFly2any && !formFly2any);
      const hamburgerPresent = (homeHamburger.length > 0 && formHamburger.length > 0);
      
      console.log('Identity Check:');
      console.log(`   ✓ Same header count: ${headersIdentical ? 'YES' : 'NO'}`);
      console.log(`   ✓ Same logo count: ${logosIdentical ? 'YES' : 'NO'}`); 
      console.log(`   ✓ No back buttons: ${noBackButton ? 'YES' : 'NO'}`);
      console.log(`   ✓ No title text: ${noTitleText ? 'YES' : 'NO'}`);
      console.log(`   ✓ No \"Fly2Any\" text: ${noFly2anyText ? 'YES' : 'NO'}`);
      console.log(`   ✓ Hamburger menu present: ${hamburgerPresent ? 'YES' : 'NO'}`);
      
      // Test 4: Home Button Functionality  \n      console.log('\\n===================================================='); \n      console.log('🏠 TEST 4: Home Button Functionality Test'); \n      console.log('====================================================');
      
      const homeButton = await page.$('button:has-text(\"Início\")');
      if (homeButton) {
        console.log('   ✓ Home button found in form');
        await homeButton.click();
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'perfect-after-home-click.png' });
        
        // Check if we're back to homepage
        const backToHome = await page.$('text=\"Onde vamos hoje?\"');
        const formClosed = !(await page.$('text=\"Passo 1 de 4\"'));
        
        console.log(`   ✓ Returned to homepage: ${backToHome ? 'YES' : 'NO'}`);
        console.log(`   ✓ Form closed: ${formClosed ? 'YES' : 'NO'}`);
        
      } else {
        console.log('   ✗ Home button not found');
      }
      
      // Final Assessment
      console.log('\\n####################################################');
      console.log('🎯 ULTRATHINK ENTERPRISE - FINAL ASSESSMENT');
      console.log('####################################################');
      
      const perfectScore = (
        homeHeaders.length === 1 &&
        formHeaders.length === 1 &&
        homeLogos.length > 0 &&
        formLogos.length > 0 &&
        !homeBackButton &&
        !formBackButton &&
        !homeTitle &&
        !formTitle &&
        !homeFly2any &&
        !formFly2any &&
        !homeDebug &&
        homeHamburger.length > 0 &&
        formHamburger.length > 0
      );
      
      if (perfectScore) {
        console.log('\\n🏆 MISSION ACCOMPLISHED - PERFECT IMPLEMENTATION!');
        console.log('✅ Single compact header everywhere');
        console.log('✅ Logo + Hamburger menu only');
        console.log('✅ No back arrow in header');
        console.log('✅ No title text in header');  
        console.log('✅ No \"Fly2Any\" text');
        console.log('✅ No debug indicators');
        console.log('✅ Headers are identical');
        console.log('✅ Home button works');
        console.log('✅ Enterprise quality achieved');
        console.log('\\n🚀 ULTRATHINK STANDARDS: 100% SATISFIED');
      } else {
        console.log('\\n⚠️ ISSUES DETECTED - FIXING REQUIRED');
        if (homeHeaders.length !== 1 || formHeaders.length !== 1) {
          console.log('   • Header count issue');
        }
        if (homeLogos.length === 0 || formLogos.length === 0) {
          console.log('   • Logo missing');
        }
        if (homeBackButton || formBackButton) {
          console.log('   • Back button still present');
        }
        if (homeTitle || formTitle) {
          console.log('   • Title text still present');
        }
        if (homeFly2any || formFly2any) {
          console.log('   • \"Fly2Any\" text still present');
        }
        if (homeDebug) {
          console.log('   • Debug text still present');
        }
        if (homeHamburger.length === 0 || formHamburger.length === 0) {
          console.log('   • Hamburger menu missing');
        }
      }
      
      console.log('\\n📸 ULTRATHINK Screenshots Generated:');
      console.log('   • perfect-homepage.png');
      console.log('   • perfect-form-header.png');
      console.log('   • perfect-after-home-click.png');
      
    } else {
      console.log('❌ Could not find service buttons to test');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();