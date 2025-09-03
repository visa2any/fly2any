const { chromium } = require('playwright');

console.log('🔧 Testing Mobile Navigation Fixes - FINAL VERIFICATION');
console.log('=====================================================\n');

async function testMobileNavigation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 Pro size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();

  try {
    console.log('📱 Step 1: Navigate to mobile homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Wait for the page content to load
    await page.waitForSelector('[data-testid="service-card"], .service-card, .bg-white.rounded-2xl.shadow-neu-md', { timeout: 10000 });

    console.log('🔍 Step 2: Verify all 5 service cards are present...');
    
    // Look for service cards - try multiple selectors
    const serviceCards = await page.$$('div[class*="bg-white"][class*="rounded"], .service-card, div[class*="shadow-neu"]');
    
    // Also check for service text content
    const serviceTexts = await page.$$('text=/voos|hoteis|carros|passeios|seguro/i');
    const hasVoos = await page.$('text=/voos/i') !== null;
    const hasHoteis = await page.$('text=/hoteis/i') !== null;
    const hasCarros = await page.$('text=/carros/i') !== null;
    const hasPasseios = await page.$('text=/passeios/i') !== null;
    const hasSeguro = await page.$('text=/seguro/i') !== null;

    console.log(`   ${hasVoos ? '✅' : '❌'} Voos (Flights) service found`);
    console.log(`   ${hasHoteis ? '✅' : '❌'} Hoteis (Hotels) service found`);
    console.log(`   ${hasCarros ? '✅' : '❌'} Carros (Cars) service found`);
    console.log(`   ${hasPasseios ? '✅' : '❌'} Passeios (Tours) service found`);
    console.log(`   ${hasSeguro ? '✅' : '❌'} Seguro (Insurance) service found`);

    const allServicesFound = hasVoos && hasHoteis && hasCarros && hasPasseios && hasSeguro;
    console.log(`\n📊 All 5 services visible: ${allServicesFound ? '✅ YES' : '❌ NO'}`);

    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'mobile-navigation-test-homepage.png', 
      fullPage: true 
    });
    console.log('📸 Homepage screenshot saved: mobile-navigation-test-homepage.png');

    console.log('\n🎯 Step 3: Test service card navigation...');
    
    // Try to click on Voos (Flights) service
    const voosElement = await page.$('text=/voos/i');
    if (voosElement) {
      console.log('🖱️  Clicking on Voos (Flights) service...');
      await voosElement.click();
      
      // Wait for navigation/form to appear
      await page.waitForTimeout(2000);
      
      // Check if we went directly to personal info step (no duplicate service selection)
      const personalStep = await page.$('text=/dados pessoais|personal/i');
      const duplicateServices = await page.$('text=/escolha o serviço|select service/i');
      
      console.log(`   ${personalStep ? '✅' : '❌'} Navigated directly to personal info step`);
      console.log(`   ${!duplicateServices ? '✅' : '❌'} No duplicate service selection screen`);
      
      // Take screenshot of form state
      await page.screenshot({ 
        path: 'mobile-navigation-test-form.png', 
        fullPage: true 
      });
      console.log('📸 Form state screenshot saved: mobile-navigation-test-form.png');
      
    } else {
      console.log('❌ Could not find Voos service to click');
    }

    console.log('\n🎨 Step 4: Verify enhanced UX styling...');
    
    // Check for modern styling elements
    const hasNeuShadows = await page.$('[class*="shadow-neu"], [class*="shadow-glow"]') !== null;
    const hasModernColors = await page.$('[class*="bg-primary"], [class*="bg-accent"]') !== null;
    const hasRoundedCorners = await page.$('[class*="rounded-2xl"], [class*="rounded-xl"]') !== null;
    
    console.log(`   ${hasNeuShadows ? '✅' : '❌'} Neumorphic shadows applied`);
    console.log(`   ${hasModernColors ? '✅' : '❌'} Modern color system active`);
    console.log(`   ${hasRoundedCorners ? '✅' : '❌'} Enhanced rounded corners`);

    console.log('\n🎉 FINAL TEST SUMMARY');
    console.log('====================');
    
    const totalChecks = [
      allServicesFound,
      personalStep !== null,
      !duplicateServices,
      hasNeuShadows,
      hasModernColors,
      hasRoundedCorners
    ];
    
    const passedChecks = totalChecks.filter(check => check).length;
    
    console.log(`✅ Tests passed: ${passedChecks}/${totalChecks.length}`);
    
    if (passedChecks === totalChecks.length) {
      console.log('\n🚀 SUCCESS: Mobile navigation fixes are working perfectly!');
      console.log('\n📱 Confirmed fixes:');
      console.log('   • All 5 service cards visible on homepage');
      console.log('   • Direct service navigation (no duplicates)');  
      console.log('   • Enhanced UX styling maintained');
      console.log('   • Smooth user experience flow');
    } else {
      console.log(`\n⚠️  ${totalChecks.length - passedChecks} issues may still need attention`);
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testMobileNavigation().catch(console.error);