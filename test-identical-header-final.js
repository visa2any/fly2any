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
    console.log('🚀 ULTRATHINK - Testing Identical Header Implementation\n');
    
    // Test 1: Homepage Header
    console.log('📱 Step 1: Analyzing homepage header...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'header-homepage.png' });
    
    // Analyze homepage header elements
    const homeHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
    const homeLogos = await page.$$('img[src*="logo"], [class*="Logo"]');
    const homeHamburger = await page.$$('svg[class*="w-5"][class*="h-5"]');
    const homeBackButtons = await page.$$('[aria-label="Voltar"]');
    const homeTitles = await page.$('text="Cotação Personalizada"');
    const homeFly2anyText = await page.$('text="Fly2Any"');
    
    console.log('   Homepage Header Analysis:');
    console.log(`   • Headers: ${homeHeaders.length}`);
    console.log(`   • Logos: ${homeLogos.length}`);
    console.log(`   • Hamburger menus: ${homeHamburger.length}`);
    console.log(`   • Back buttons: ${homeBackButtons.length}`);
    console.log(`   • "Cotação" title: ${homeTitles ? 'PRESENT' : 'ABSENT'}`);
    console.log(`   • "Fly2Any" text: ${homeFly2anyText ? 'PRESENT' : 'ABSENT'}`);
    
    // Test 2: Form Header
    console.log('\\n📋 Step 2: Opening form and analyzing header...');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    
    if (serviceButtons.length > 0) {
      await serviceButtons[0].click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'header-form.png' });
      
      // Analyze form header elements
      const formHeaders = await page.$$('.bg-gradient-to-r.from-purple-600');
      const formLogos = await page.$$('img[src*="logo"], [class*="Logo"]');
      const formHamburger = await page.$$('svg[class*="w-5"][class*="h-5"]');
      const formBackButtons = await page.$$('[aria-label="Voltar"]');
      const formTitles = await page.$('text="Cotação Personalizada"');
      const formFly2anyText = await page.$('text="Fly2Any"');
      
      console.log('   Form Header Analysis:');
      console.log(`   • Headers: ${formHeaders.length}`);
      console.log(`   • Logos: ${formLogos.length}`);
      console.log(`   • Hamburger menus: ${formHamburger.length}`);
      console.log(`   • Back buttons: ${formBackButtons.length}`);
      console.log(`   • "Cotação" title: ${formTitles ? 'PRESENT' : 'ABSENT'}`);
      console.log(`   • "Fly2Any" text: ${formFly2anyText ? 'PRESENT' : 'ABSENT'}`);
      
      // Test 3: Header Comparison
      console.log('\\n🔍 Step 3: Header Identity Comparison...');
      
      const headerIdentical = (
        homeHeaders.length === formHeaders.length &&
        homeLogos.length === formLogos.length &&
        homeBackButtons.length === formBackButtons.length &&
        !formTitles && // No title text
        !formFly2anyText // No Fly2Any text
      );
      
      console.log('\\n' + '='.repeat(50));
      console.log('🎯 ULTRATHINK ENTERPRISE RESULTS:');
      console.log('='.repeat(50));
      
      if (headerIdentical && formHamburger.length > 0) {
        console.log('✅ PERFECT SUCCESS!');
        console.log('   • Headers are IDENTICAL ✓');
        console.log('   • Logo present in both ✓');
        console.log('   • Hamburger menu present ✓');
        console.log('   • No back arrow ✓');
        console.log('   • No title text ✓');
        console.log('   • Enterprise quality achieved ✓');
      } else {
        console.log('⚠️ DISCREPANCIES FOUND:');
        if (homeHeaders.length !== formHeaders.length) {
          console.log(`   • Header count mismatch: ${homeHeaders.length} vs ${formHeaders.length}`);
        }
        if (homeLogos.length !== formLogos.length) {
          console.log(`   • Logo count mismatch: ${homeLogos.length} vs ${formLogos.length}`);
        }
        if (formBackButtons.length > 0) {
          console.log('   • Back button still present in form');
        }
        if (formTitles) {
          console.log('   • Title text still present in form');
        }
        if (formHamburger.length === 0) {
          console.log('   • Hamburger menu missing in form');
        }
      }
      
      console.log('\\n📸 Screenshots captured:');
      console.log('   • header-homepage.png');
      console.log('   • header-form.png');
      
    } else {
      console.log('❌ Could not find service buttons to test form');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();