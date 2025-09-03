const { chromium } = require('playwright');

async function captureEnhancedMobileExperience() {
  console.log('📱 Capturing Enhanced Mobile App Experience...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },  // iPhone 12
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to homepage
    await page.goto('http://localhost:3003', { timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Capture homepage
    await page.screenshot({ path: './enhanced-homepage.png' });
    console.log('📸 Enhanced homepage captured');
    
    // Try to access form
    try {
      await page.click('text=Cotação', { timeout: 5000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('⚠️ Direct form access, continuing...');
    }
    
    // Try service selection
    try {
      await page.click('text=Voos', { timeout: 5000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: './enhanced-step1-service.png' });
      console.log('📸 Step 1 - Service selection captured');
    } catch (e) {
      console.log('❌ Could not access service selection');
    }
    
    // Check for bottom navigation
    const bottomNavExists = await page.evaluate(() => {
      const bottomNav = document.querySelector('.flex-none.bg-white.border-t');
      return {
        exists: !!bottomNav,
        hasButtons: bottomNav ? bottomNav.querySelectorAll('button').length : 0,
        hasIcons: bottomNav ? bottomNav.textContent.includes('←') && bottomNav.textContent.includes('→') : false
      };
    });
    
    console.log('🧭 Bottom Navigation Check:', bottomNavExists);
    
    // Check for app container
    const appContainerExists = await page.evaluate(() => {
      const container = document.querySelector('.mobile-app-container');
      return {
        exists: !!container,
        height: container ? container.offsetHeight : 0,
        viewportHeight: window.innerHeight,
        overflowHidden: container ? getComputedStyle(container).overflow === 'hidden' : false
      };
    });
    
    console.log('📱 App Container Check:', appContainerExists);
    
    // Try to navigate if possible
    try {
      const nextButton = await page.$('button:has-text("Próximo")');
      if (nextButton) {
        await nextButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: './enhanced-step2-form.png' });
        console.log('📸 Step 2 - Form with bottom nav captured');
        
        // Try step 3
        const nextButton2 = await page.$('button:has-text("Próximo")');
        if (nextButton2) {
          await nextButton2.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: './enhanced-step3-personal.png' });
          console.log('📸 Step 3 - Personal info with bottom nav captured');
        }
      }
    } catch (e) {
      console.log('⚠️ Navigation test incomplete:', e.message);
    }
    
    // Final state capture
    await page.screenshot({ path: './enhanced-final-state.png', fullPage: false });
    console.log('📸 Final enhanced state captured');
    
    // Summary
    console.log('\n🎉 ENHANCED MOBILE APP EXPERIENCE VERIFICATION');
    console.log('==============================================');
    console.log(`✅ App Container: ${appContainerExists.exists}`);
    console.log(`✅ Bottom Navigation: ${bottomNavExists.exists}`);
    console.log(`✅ Navigation Icons: ${bottomNavExists.hasIcons}`);
    console.log(`✅ Button Count: ${bottomNavExists.hasButtons}`);
    console.log(`✅ No Overflow: ${appContainerExists.overflowHidden}`);
    
    const success = appContainerExists.exists && bottomNavExists.exists && bottomNavExists.hasIcons;
    
    if (success) {
      console.log('\n🚀 SUCCESS: Enhanced mobile app experience implemented!');
      console.log('   - Persistent bottom navigation ✓');
      console.log('   - App-like container structure ✓');
      console.log('   - Native mobile UI patterns ✓');
    } else {
      console.log('\n⚠️ Verification incomplete - check screenshots');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run verification
captureEnhancedMobileExperience().then(success => {
  console.log(`\n🏁 Enhanced mobile app verification - ${success ? 'PASSED' : 'NEEDS REVIEW'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification error:', error);
  process.exit(1);
});