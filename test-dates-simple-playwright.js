const { chromium } = require('playwright');

async function testDatesLayoutSimple() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  
  try {
    // Test mobile view first
    console.log('🔍 Testing mobile view (360px width)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 360, height: 640 }
    });
    
    const mobilePage = await mobileContext.newPage();
    
    // Navigate with more lenient waiting
    console.log('📱 Navigating to homepage...');
    await mobilePage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for page to be interactive
    await mobilePage.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Mobile page loaded');
    
    // Take initial screenshot
    await mobilePage.screenshot({ 
      path: 'mobile-homepage-loaded.png',
      fullPage: true 
    });
    console.log('✅ Mobile homepage screenshot saved');
    
    // Wait a bit more and look for any flight-related elements
    await mobilePage.waitForTimeout(3000);
    
    // Try to find and interact with flight form elements
    console.log('📱 Looking for flight form elements...');
    
    // Try clicking on any visible buttons or form elements
    try {
      // Look for service buttons or flight-related elements
      const buttons = await mobilePage.locator('button').all();
      console.log(`📱 Found ${buttons.length} buttons`);
      
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const button = buttons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        console.log(`📱 Button ${i}: "${text}" (visible: ${isVisible})`);
        
        if (text && (text.toLowerCase().includes('flight') || 
                     text.toLowerCase().includes('voo') ||
                     text.toLowerCase().includes('data') ||
                     text.toLowerCase().includes('date'))) {
          console.log(`📱 Clicking on: ${text}`);
          await button.click();
          await mobilePage.waitForTimeout(2000);
          break;
        }
      }
    } catch (e) {
      console.log('📱 Button interaction error:', e.message);
    }
    
    // Take screenshot after interactions
    await mobilePage.screenshot({ 
      path: 'mobile-after-interaction.png',
      fullPage: true 
    });
    console.log('✅ Mobile interaction screenshot saved');
    
    // Look for date inputs specifically
    console.log('📱 Checking for date inputs...');
    const dateInputs = await mobilePage.locator('input[type="date"]').all();
    console.log(`📱 Found ${dateInputs.length} date inputs`);
    
    if (dateInputs.length > 0) {
      // Focus on the date inputs area and take a focused screenshot
      const firstDateInput = dateInputs[0];
      await firstDateInput.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(1000);
      
      await mobilePage.screenshot({ 
        path: 'mobile-dates-focused.png',
        fullPage: true 
      });
      console.log('✅ Mobile dates focused screenshot saved');
      
      // Check layout of date inputs
      if (dateInputs.length >= 2) {
        const box1 = await dateInputs[0].boundingBox();
        const box2 = await dateInputs[1].boundingBox();
        
        if (box1 && box2) {
          const sideBySide = Math.abs(box1.y - box2.y) < 30;
          const horizontalGap = Math.abs(box1.x - box2.x);
          
          console.log(`📱 Date input positions:`);
          console.log(`📱   First:  x=${box1.x}, y=${box1.y}, w=${box1.width}`);
          console.log(`📱   Second: x=${box2.x}, y=${box2.y}, w=${box2.width}`);
          console.log(`📱   Side-by-side: ${sideBySide}`);
          console.log(`📱   Horizontal gap: ${horizontalGap}px`);
        }
      }
    }
    
    await mobileContext.close();
    
    // Test desktop view
    console.log('\n🖥️ Testing desktop view (1280px width)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const desktopPage = await desktopContext.newPage();
    
    console.log('🖥️ Navigating to homepage...');
    await desktopPage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await desktopPage.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Desktop page loaded');
    
    // Take initial screenshot
    await desktopPage.screenshot({ 
      path: 'desktop-homepage-loaded.png',
      fullPage: true 
    });
    console.log('✅ Desktop homepage screenshot saved');
    
    await desktopPage.waitForTimeout(3000);
    
    // Similar interaction for desktop
    console.log('🖥️ Looking for flight form elements...');
    try {
      const buttons = await desktopPage.locator('button').all();
      console.log(`🖥️ Found ${buttons.length} buttons`);
      
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const button = buttons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        
        if (text && (text.toLowerCase().includes('flight') || 
                     text.toLowerCase().includes('voo') ||
                     text.toLowerCase().includes('data') ||
                     text.toLowerCase().includes('date'))) {
          console.log(`🖥️ Clicking on: ${text}`);
          await button.click();
          await desktopPage.waitForTimeout(2000);
          break;
        }
      }
    } catch (e) {
      console.log('🖥️ Button interaction error:', e.message);
    }
    
    // Take screenshot after interactions
    await desktopPage.screenshot({ 
      path: 'desktop-after-interaction.png',
      fullPage: true 
    });
    console.log('✅ Desktop interaction screenshot saved');
    
    // Check for date inputs on desktop
    console.log('🖥️ Checking for date inputs...');
    const desktopDateInputs = await desktopPage.locator('input[type="date"]').all();
    console.log(`🖥️ Found ${desktopDateInputs.length} date inputs`);
    
    if (desktopDateInputs.length > 0) {
      const firstDateInput = desktopDateInputs[0];
      await firstDateInput.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(1000);
      
      await desktopPage.screenshot({ 
        path: 'desktop-dates-focused.png',
        fullPage: true 
      });
      console.log('✅ Desktop dates focused screenshot saved');
      
      // Check layout of date inputs on desktop
      if (desktopDateInputs.length >= 2) {
        const box1 = await desktopDateInputs[0].boundingBox();
        const box2 = await desktopDateInputs[1].boundingBox();
        
        if (box1 && box2) {
          const sideBySide = Math.abs(box1.y - box2.y) < 30;
          const horizontalGap = Math.abs(box1.x - box2.x);
          
          console.log(`🖥️ Date input positions:`);
          console.log(`🖥️   First:  x=${box1.x}, y=${box1.y}, w=${box1.width}`);
          console.log(`🖥️   Second: x=${box2.x}, y=${box2.y}, w=${box2.width}`);
          console.log(`🖥️   Side-by-side: ${sideBySide}`);
          console.log(`🖥️   Horizontal gap: ${horizontalGap}px`);
        }
      }
    }
    
    await desktopContext.close();
    
    console.log('\n🎯 Test Summary:');
    console.log('='.repeat(50));
    console.log('📸 Screenshots captured:');
    console.log('  📱 Mobile:');
    console.log('    - mobile-homepage-loaded.png');
    console.log('    - mobile-after-interaction.png');
    console.log('    - mobile-dates-focused.png (if dates found)');
    console.log('  🖥️ Desktop:');
    console.log('    - desktop-homepage-loaded.png');
    console.log('    - desktop-after-interaction.png');
    console.log('    - desktop-dates-focused.png (if dates found)');
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testDatesLayoutSimple();