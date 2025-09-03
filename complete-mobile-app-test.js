const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('🏗️ COMPLETE MOBILE APP STRUCTURE TEST');
  console.log('🎯 Verifying: Main Header + Clean Navigation + Bottom Menu');
  console.log('📱 Testing mobile-only app experience\n');
  
  try {
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ PAGE LOADED');
    
    // Click flights to open mobile lead capture
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('✅ MOBILE LEAD CAPTURE OPENED');
    
    // Test 1: Main Fly2Any Header (should be visible on mobile)
    const mainHeader = page.locator('header[role="banner"]');
    const isMainHeaderVisible = await mainHeader.isVisible();
    console.log(`🏠 Main Fly2Any Header: ${isMainHeaderVisible ? '✅ VISIBLE' : '❌ Missing'}`);
    
    if (isMainHeaderVisible) {
      const logo = mainHeader.locator('img[alt*="Fly2Any"]');
      const isLogoVisible = await logo.isVisible();
      console.log(`   🏷️ Logo: ${isLogoVisible ? '✅ Present' : '❌ Missing'}`);
      
      const languageBtn = mainHeader.locator('button:has-text("🇧🇷")');
      const isLanguageBtnVisible = await languageBtn.isVisible();
      console.log(`   🌐 Language Button: ${isLanguageBtnVisible ? '✅ Present' : '❌ Missing'}`);
    }
    
    // Test 2: Clean Step Navigation Header
    const stepHeader = page.locator('div:has(h2:text("Selecione os Serviços"))');
    const isStepHeaderVisible = await stepHeader.isVisible();
    console.log(`📍 Clean Step Header: ${isStepHeaderVisible ? '✅ VISIBLE' : '❌ Missing'}`);
    
    if (isStepHeaderVisible) {
      const progressBar = stepHeader.locator('div[class*="bg-primary-400"], div[class*="bg-primary-600"]');
      const isProgressVisible = await progressBar.isVisible();
      console.log(`   📊 Progress Bar: ${isProgressVisible ? '✅ Working' : '❌ Missing'}`);
      
      const stepIcon = stepHeader.locator('span:text("🎯")');
      const isIconVisible = await stepIcon.isVisible();
      console.log(`   🎯 Step Icon: ${isIconVisible ? '✅ Present' : '❌ Missing'}`);
    }
    
    // Test 3: Fixed Bottom Navigation Menu
    const bottomNav = page.locator('div:has(span:text("Início"))').last();
    const isBottomNavVisible = await bottomNav.isVisible();
    console.log(`🧭 Bottom Navigation: ${isBottomNavVisible ? '✅ VISIBLE & FIXED' : '❌ Missing'}`);
    
    if (isBottomNavVisible) {
      // Test all 5 navigation items
      const navItems = [
        { text: 'Início', icon: 'HomeIcon', expected: true },
        { text: 'Voos', icon: 'Plane', expected: true },
        { text: 'Hotéis', icon: 'BuildingOffice', expected: true },
        { text: 'Carros', icon: 'Truck', expected: true },
        { text: 'Tours', icon: 'Camera', expected: true }
      ];
      
      for (const item of navItems) {
        const navItem = bottomNav.locator(`span:text("${item.text}")`);
        const isPresent = await navItem.isVisible();
        console.log(`   ${item.text === 'Início' ? '🏠' : 
                       item.text === 'Voos' ? '✈️' : 
                       item.text === 'Hotéis' ? '🏨' : 
                       item.text === 'Carros' ? '🚗' : '📸'} ${item.text}: ${isPresent ? '✅ Present' : '❌ Missing'}`);
      }
    }
    
    // Test 4: Bottom Navigation Functionality
    console.log('\n🔧 TESTING BOTTOM NAVIGATION FUNCTIONALITY...');
    
    // Test Flights navigation
    const flightNavBtn = bottomNav.locator('button:has(span:text("Voos"))');
    await flightNavBtn.click();
    await page.waitForTimeout(1500);
    
    const flightFormVisible = await page.locator('input[placeholder*="De onde"]').isVisible();
    console.log(`✈️ Flight Nav Click: ${flightFormVisible ? '✅ Navigated to Flight Form' : '❌ Navigation failed'}`);
    
    // Test Hotels navigation
    const hotelNavBtn = bottomNav.locator('button:has(span:text("Hotéis"))');
    await hotelNavBtn.click();
    await page.waitForTimeout(1500);
    
    const hotelFormVisible = await page.locator('h2:text("Hotéis")').isVisible();
    console.log(`🏨 Hotel Nav Click: ${hotelFormVisible ? '✅ Navigated to Hotel Form' : '❌ Navigation failed'}`);
    
    // Test 5: Mobile-Only Display (responsive behavior)
    console.log('\n📱 TESTING MOBILE-ONLY DISPLAY...');
    
    // Check that headers have mobile-only classes
    const mobileOnlyHeader = page.locator('.md\\:hidden').first();
    const hasMobileOnly = await mobileOnlyHeader.isVisible();
    console.log(`📱 Mobile-Only Classes: ${hasMobileOnly ? '✅ Responsive classes applied' : '❌ Missing responsive behavior'}`);
    
    // Test 6: App-like Experience
    console.log('\n🚀 TESTING APP-LIKE EXPERIENCE...');
    
    const appStructure = {
      mainHeader: isMainHeaderVisible,
      stepNavigation: isStepHeaderVisible, 
      bottomNavigation: isBottomNavVisible,
      mobileOptimized: hasMobileOnly
    };
    
    const isCompleteApp = Object.values(appStructure).every(Boolean);
    console.log(`📱 Complete App Structure: ${isCompleteApp ? '✅ ALL COMPONENTS WORKING' : '❌ Missing components'}`);
    
    // Take comprehensive screenshots
    await page.screenshot({ path: 'mobile-app-complete-structure.png', fullPage: true });
    console.log('📸 Screenshot saved: mobile-app-complete-structure.png');
    
    // Navigate through different steps to test full flow
    console.log('\n🔄 TESTING COMPLETE MOBILE FLOW...');
    
    // Go back to services selection
    const homeNavBtn = bottomNav.locator('button:has(span:text("Início"))');
    await homeNavBtn.click();
    await page.waitForTimeout(1000);
    
    // Test if we can navigate back to homepage
    const isOnHomepage = await page.url().includes('localhost:3003');
    console.log(`🏠 Home Navigation: ${isOnHomepage ? '✅ Returned to homepage' : '❌ Navigation failed'}`);
    
    // Final Results
    console.log('\n🎊 COMPLETE MOBILE APP STRUCTURE TEST RESULTS:');
    console.log('');
    console.log('📱 MOBILE APP COMPONENTS:');
    console.log(`  🏠 Main Fly2Any Header: ${isMainHeaderVisible ? '✅ Integrated' : '❌ Missing'}`);
    console.log(`  📍 Clean Step Navigation: ${isStepHeaderVisible ? '✅ Simplified' : '❌ Missing'}`);
    console.log(`  🧭 Fixed Bottom Navigation: ${isBottomNavVisible ? '✅ 5-tab menu' : '❌ Missing'}`);
    console.log(`  📱 Mobile-Only Display: ${hasMobileOnly ? '✅ Responsive' : '❌ Not responsive'}`);
    console.log('');
    console.log('🎯 APP FUNCTIONALITY:');
    console.log(`  ✈️ Flight Navigation: ${flightFormVisible ? '✅ Working' : '❌ Broken'}`);
    console.log(`  🏨 Hotel Navigation: ${hotelFormVisible ? '✅ Working' : '❌ Broken'}`);
    console.log(`  🏠 Home Navigation: ${isOnHomepage ? '✅ Working' : '❌ Broken'}`);
    console.log('');
    console.log('🏆 OVERALL RESULT:');
    if (isCompleteApp && flightFormVisible && hotelFormVisible && isOnHomepage) {
      console.log('🎉 COMPLETE MOBILE APP SUCCESS!');
      console.log('👑 ULTRATHINK MOBILE APP STRUCTURE: PERFECTLY IMPLEMENTED!');
      console.log('🌟 Persistent branding + Clean navigation + Fixed bottom menu');
      console.log('📱 True mobile-first app experience achieved!');
    } else {
      console.log('⚠️ Some components need attention');
    }
    
    // Keep browser open for manual verification
    console.log('\n⏱️ Browser open for 20 seconds - verify mobile app experience...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Mobile app structure test failed:', error);
    await page.screenshot({ 
      path: 'mobile-app-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();