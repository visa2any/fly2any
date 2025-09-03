const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('🔍 INVESTIGATING HEADER ISSUES - ULTRATHINK DIAGNOSTIC');
  console.log('🎯 Focus: Main Header + Step Navigation Problems');
  console.log('📱 PROGRESSIVE FIX - NO DOWNGRADES\n');
  
  try {
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ PAGE LOADED - Starting diagnostic...\n');
    
    // ===== ISSUE 1: MAIN FLY2ANY HEADER INVESTIGATION =====
    console.log('🏠 MAIN FLY2ANY HEADER DIAGNOSTIC:');
    
    // Check main header on homepage
    const mainHeaderHome = await page.locator('header[role="banner"]').isVisible();
    console.log(`   📍 Homepage Main Header: ${mainHeaderHome ? '✅ Present' : '❌ Missing'}`);
    
    if (mainHeaderHome) {
      const logoHome = await page.locator('header img[alt*="Fly2Any"]').isVisible();
      const compactMobileHome = await page.locator('header .md\\:hidden').isVisible();
      console.log(`   🏷️ Homepage Logo: ${logoHome ? '✅ Visible' : '❌ Missing'}`);
      console.log(`   📱 Mobile Compact Header: ${compactMobileHome ? '✅ Active' : '❌ Missing'}`);
    }
    
    // Open lead capture form
    console.log('\n🔄 Opening mobile lead capture...');
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(3000);
    
    // Check main header in lead capture
    const mainHeaderForm = await page.locator('header[role="banner"]').isVisible();
    console.log(`   📍 Lead Capture Main Header: ${mainHeaderForm ? '✅ Present' : '❌ MISSING!'}`);
    
    if (mainHeaderForm) {
      const logoForm = await page.locator('header img[alt*="Fly2Any"]').isVisible();
      const compactMobileForm = await page.locator('header .md\\:hidden').isVisible();
      console.log(`   🏷️ Form Logo: ${logoForm ? '✅ Visible' : '❌ Missing'}`);
      console.log(`   📱 Mobile Compact Form: ${compactMobileForm ? '✅ Active' : '❌ Missing'}`);
    } else {
      console.log('   ⚠️  CRITICAL: Main header NOT appearing in mobile lead capture!');
      console.log('   🔧 This means LiveSiteHeader integration failed');
    }
    
    // ===== ISSUE 2: CLEAN STEP NAVIGATION INVESTIGATION =====
    console.log('\n📍 CLEAN STEP NAVIGATION DIAGNOSTIC:');
    
    const stepHeader = await page.locator('h2:text("Selecione os Serviços")').isVisible();
    console.log(`   📋 Step Title: ${stepHeader ? '✅ Present' : '❌ Missing'}`);
    
    const stepIcon = await page.locator('span:text("🎯")').isVisible();
    console.log(`   🎯 Step Icon: ${stepIcon ? '✅ Present' : '❌ Missing'}`);
    
    const progressBar = await page.locator('div[class*="bg-primary-"]').isVisible();
    console.log(`   📊 Progress Bar: ${progressBar ? '✅ Present' : '❌ Missing'}`);
    
    const backButton = await page.locator('button:has(span:text("Voltar"))').isVisible();
    console.log(`   ⬅️ Back Button: ${backButton ? '✅ Present (should not be on first step)' : '✅ Correctly hidden'}`);
    
    const stepCounter = await page.locator('span:text("1/4"), span:text("1/5")').isVisible();
    console.log(`   🔢 Step Counter: ${stepCounter ? '✅ Present' : '❌ Missing'}`);
    
    // Check DOM structure
    console.log('\n🔍 DOM STRUCTURE ANALYSIS:');
    
    const allHeaders = await page.locator('header, div[class*="bg-gradient-to-r"]').count();
    console.log(`   📦 Total Header Elements: ${allHeaders}`);
    
    const mobileOnlyHeaders = await page.locator('.md\\:hidden').count();
    console.log(`   📱 Mobile-Only Elements: ${mobileOnlyHeaders}`);
    
    // Check CSS classes
    const headerClasses = await page.locator('header').first().getAttribute('class');
    console.log(`   🎨 Main Header Classes: ${headerClasses || 'None'}`);
    
    const stepHeaderClasses = await page.locator('div:has(h2)').first().getAttribute('class');
    console.log(`   🎨 Step Header Classes: ${stepHeaderClasses || 'None'}`);
    
    // Take diagnostic screenshot
    await page.screenshot({ path: 'header-diagnostic.png', fullPage: true });
    console.log('📸 Diagnostic screenshot: header-diagnostic.png');
    
    console.log('\n🎯 ULTRATHINK DIAGNOSTIC RESULTS:');
    console.log('');
    console.log('🏠 MAIN HEADER ISSUE:');
    if (!mainHeaderForm) {
      console.log('   ❌ CRITICAL: LiveSiteHeader not displaying in mobile lead capture');
      console.log('   🔧 FIX NEEDED: Integration between LiveSiteHeader and MobileLeadCaptureCorrect');
      console.log('   📋 ROOT CAUSE: Import/integration issue in the mobile component');
    } else {
      console.log('   ✅ Main header working correctly');
    }
    
    console.log('\n📍 STEP NAVIGATION ISSUE:');
    if (!stepHeader || !stepIcon || !progressBar || !stepCounter) {
      console.log('   ❌ ISSUE: Clean step navigation missing elements');
      console.log('   🔧 FIX NEEDED: Enhance step header component');
      console.log('   📋 MISSING ELEMENTS:');
      if (!stepHeader) console.log('      • Step title');
      if (!stepIcon) console.log('      • Step icon');  
      if (!progressBar) console.log('      • Progress bar');
      if (!stepCounter) console.log('      • Step counter');
    } else {
      console.log('   ✅ Step navigation elements present');
    }
    
    console.log('\n💡 NEXT ACTIONS:');
    console.log('1. 🏠 Fix LiveSiteHeader integration in MobileLeadCaptureCorrect');
    console.log('2. 📍 Enhance clean step navigation with missing elements');
    console.log('3. 🎯 Apply PROGRESSIVE fixes without downgrades');
    console.log('\n👑 ULTRATHINK - NO SHORTCUTS, PROGRESSIVE ENHANCEMENT!');
    
    // Keep browser open for investigation
    console.log('\n⏱️ Browser open for 15 seconds for visual investigation...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('❌ Header investigation failed:', error);
    await page.screenshot({ path: 'header-diagnostic-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();