const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('🔍 FOCUSED DIAGNOSTIC - ULTRATHINK ISSUES');
  console.log('🎯 Testing USER SERVER: localhost:3000');
  console.log('📱 Identifying EXACT problems with:');
  console.log('   1. 🏠 Main Fly2Any Header persistence');  
  console.log('   2. 📍 Clean Step Navigation focus\n');
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ USER SERVER LOADED\n');
    
    // ===== DIAGNOSTIC 1: MAIN FLY2ANY HEADER ISSUE =====
    console.log('🏠 MAIN FLY2ANY HEADER DIAGNOSTIC:');
    console.log('   🔍 Looking for persistent branding throughout mobile lead capture...\n');
    
    // Check homepage first
    const homepageHeaders = await page.locator('header').count();
    console.log(`   📍 HOMEPAGE: ${homepageHeaders} header elements found`);
    
    const homepageFly2AnyLogo = await page.locator('img[alt*="Fly2Any"]').isVisible();
    console.log(`   🏷️ Homepage Fly2Any Logo: ${homepageFly2AnyLogo ? '✅ Present' : '❌ Missing'}`);
    
    // Now open mobile lead capture
    console.log('\n   🚀 Opening mobile lead capture flow...');
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(3000);
    
    // CRITICAL: Check what happens to branding
    const leadCaptureHeaders = await page.locator('header').count();
    console.log(`   📍 LEAD CAPTURE: ${leadCaptureHeaders} header elements found`);
    
    const leadCaptureFly2AnyLogo = await page.locator('img[alt*="Fly2Any"]').isVisible();
    console.log(`   🏷️ Lead Capture Fly2Any Logo: ${leadCaptureFly2AnyLogo ? '✅ Present' : '❌ MISSING BRANDING!'}`);
    
    // Check if ANY Fly2Any branding exists
    const anyFly2AnyText = await page.locator('text=Fly2Any').isVisible();
    const anyFly2AnyBranding = await page.locator('[alt*="Fly2Any"], [title*="Fly2Any"], :text("Fly2Any")').isVisible();
    console.log(`   🔍 ANY Fly2Any branding: ${anyFly2AnyBranding ? '✅ Found somewhere' : '❌ COMPLETELY MISSING!'}`);
    
    // Check header structure
    if (leadCaptureHeaders > 0) {
      const headerClasses = await page.locator('header').first().getAttribute('class');
      console.log(`   🎨 Header classes: "${headerClasses}"`);
      
      const headerContent = await page.locator('header').first().textContent();
      console.log(`   📝 Header content: "${headerContent}"`);
    } else {
      console.log('   ❌ NO HEADER ELEMENTS FOUND IN LEAD CAPTURE!');
    }
    
    // ===== DIAGNOSTIC 2: CLEAN STEP NAVIGATION ISSUE =====
    console.log('\n📍 CLEAN STEP NAVIGATION DIAGNOSTIC:');
    console.log('   🔍 Looking for essential step progress focus...\n');
    
    // Check what step navigation exists
    const stepHeaders = await page.locator('h1, h2, h3, h4').count();
    console.log(`   📋 Step Headers: ${stepHeaders} heading elements found`);
    
    if (stepHeaders > 0) {
      for (let i = 0; i < Math.min(stepHeaders, 5); i++) {
        const heading = page.locator('h1, h2, h3, h4').nth(i);
        const headingText = await heading.textContent();
        const headingTag = await heading.evaluate(el => el.tagName.toLowerCase());
        console.log(`   ${i+1}. <${headingTag}>: "${headingText}"`);
      }
    }
    
    // Check for step progress indicators
    const progressBars = await page.locator('[class*="progress"], [class*="step"]').count();
    console.log(`   📊 Progress Elements: ${progressBars} progress indicators found`);
    
    // Check for step counters
    const stepCounters = await page.locator('text=/\\d+\\/\\d+/').count();
    console.log(`   🔢 Step Counters: ${stepCounters} counters found`);
    
    // Check navigation buttons
    const navButtons = await page.locator('button:has-text("Voltar"), button:has-text("Continuar"), button:has-text("Próximo")').count();
    console.log(`   🔄 Navigation Buttons: ${navButtons} nav buttons found`);
    
    // Check for clutter vs essential focus
    const allElements = await page.locator('div, span, p').count();
    console.log(`   📦 Total Elements: ${allElements} elements (checking for clutter)`);
    
    // ===== DIAGNOSTIC 3: WHAT SHOULD BE THERE =====
    console.log('\n🎯 WHAT SHOULD BE PRESENT:');
    console.log('   🏠 MAIN HEADER REQUIREMENT:');
    console.log('     • Persistent Fly2Any logo/branding');
    console.log('     • Visible throughout entire mobile lead capture flow');  
    console.log('     • Consistent header styling');
    console.log('');
    console.log('   📍 CLEAN STEP NAVIGATION REQUIREMENT:');
    console.log('     • Simplified header focusing ONLY on essential step progress');
    console.log('     • Clear step indicators (1/4, 2/4, etc.)');
    console.log('     • Progress bar showing current step');
    console.log('     • Clean navigation without clutter');
    
    // Take diagnostic screenshot
    await page.screenshot({ path: 'diagnostic-current-state.png', fullPage: true });
    console.log('\n📸 Current state captured: diagnostic-current-state.png');
    
    // ===== DIAGNOSTIC RESULTS =====
    console.log('\n🔍 DIAGNOSTIC RESULTS:');
    console.log('═'.repeat(60));
    
    console.log('\n🏠 ISSUE #1 - MAIN FLY2ANY HEADER:');
    if (!leadCaptureFly2AnyLogo) {
      console.log('   ❌ CRITICAL: Fly2Any branding MISSING in mobile lead capture');
      console.log('   🔧 ROOT CAUSE: Header not persistent throughout flow');
      console.log('   💡 SOLUTION NEEDED: Ensure LiveSiteHeader appears in mobile lead capture');
    } else {
      console.log('   ✅ Fly2Any branding present in lead capture');
    }
    
    console.log('\n📍 ISSUE #2 - CLEAN STEP NAVIGATION:');
    if (stepHeaders === 0 || stepCounters === 0 || progressBars === 0) {
      console.log('   ❌ CRITICAL: Step navigation lacks essential elements');
      console.log('   🔧 ROOT CAUSE: Missing step focus and progress indicators');
      console.log('   💡 SOLUTION NEEDED: Create clean, focused step navigation');
    } else {
      console.log('   ⚠️ Step navigation present but needs simplification analysis');
    }
    
    if (allElements > 100) {
      console.log('   ⚠️ POTENTIAL: Too many elements - may need decluttering');
    }
    
    console.log('\n🎯 NEXT ACTIONS REQUIRED:');
    if (!leadCaptureFly2AnyLogo) {
      console.log('   1. 🏠 FIX: Integrate persistent Fly2Any header in mobile lead capture');
    }
    if (stepCounters === 0 || progressBars === 0) {
      console.log('   2. 📍 FIX: Create clean, essential step navigation with progress');
    }
    
    console.log('\n⏱️ Browser open for 20 seconds - review current state...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Focused diagnostic failed:', error.message);
    await page.screenshot({ path: 'diagnostic-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();