const { chromium } = require('playwright');

async function testCompleteDateFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  
  try {
    console.log('🎯 Testing complete date flow - Mobile and Desktop');
    
    // Mobile Test (360px)
    console.log('\n📱 MOBILE TEST (360px width)');
    console.log('='.repeat(40));
    
    const mobileContext = await browser.newContext({
      viewport: { width: 360, height: 640 }
    });
    
    const mobilePage = await mobileContext.newPage();
    
    // Navigate to homepage
    console.log('1️⃣ Navigating to homepage...');
    await mobilePage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await mobilePage.waitForLoadState('networkidle');
    
    // Take homepage screenshot
    await mobilePage.screenshot({ 
      path: 'mobile-step1-homepage.png',
      fullPage: true 
    });
    console.log('✅ Step 1: Homepage captured');
    
    // Click on flight service
    console.log('2️⃣ Clicking on Flight service...');
    await mobilePage.locator('button:has-text("✈️VoosPassagens aéreas")').click();
    await mobilePage.waitForTimeout(2000);
    
    // Take flight form opened screenshot
    await mobilePage.screenshot({ 
      path: 'mobile-step2-flight-opened.png',
      fullPage: true 
    });
    console.log('✅ Step 2: Flight form opened');
    
    // Navigate through the multi-step form to reach dates
    console.log('3️⃣ Navigating through form steps...');
    
    // Check if there are step navigation buttons (1, 2, 3, etc.)
    const stepButtons = await mobilePage.locator('.bg-blue-500, button:has-text("2"), button:has-text("3"), button:has-text("4")').all();
    console.log(`Found ${stepButtons.length} potential step buttons`);
    
    // Try to navigate to step where dates should be (usually step 2 or 3)
    for (let step = 2; step <= 4; step++) {
      try {
        const stepButton = mobilePage.locator(`button:has-text("${step}")`).first();
        if (await stepButton.isVisible()) {
          console.log(`📱 Clicking step ${step}...`);
          await stepButton.click();
          await mobilePage.waitForTimeout(1500);
          
          // Check if date inputs are now visible
          const dateInputs = await mobilePage.locator('input[type="date"]').all();
          console.log(`📱 Found ${dateInputs.length} date inputs on step ${step}`);
          
          if (dateInputs.length >= 2) {
            console.log(`✅ Found dates on step ${step}!`);
            
            // Scroll to dates area
            await dateInputs[0].scrollIntoViewIfNeeded();
            await mobilePage.waitForTimeout(1000);
            
            // Take screenshot of dates section
            await mobilePage.screenshot({ 
              path: `mobile-step${step}-dates-found.png`,
              fullPage: true 
            });
            console.log(`✅ Step ${step}: Dates screenshot captured`);
            
            // Analyze date positioning
            const box1 = await dateInputs[0].boundingBox();
            const box2 = await dateInputs[1].boundingBox();
            
            if (box1 && box2) {
              const sideBySide = Math.abs(box1.y - box2.y) < 30;
              const gap = Math.abs(box1.x - box2.x);
              const overlap = !(box1.x + box1.width < box2.x || box2.x + box2.width < box1.x);
              
              console.log(`📱 Date Analysis for Step ${step}:`);
              console.log(`   First date:  x=${Math.round(box1.x)}, y=${Math.round(box1.y)}, w=${Math.round(box1.width)}`);
              console.log(`   Second date: x=${Math.round(box2.x)}, y=${Math.round(box2.y)}, w=${Math.round(box2.width)}`);
              console.log(`   Side-by-side: ${sideBySide}`);
              console.log(`   Horizontal gap: ${Math.round(gap)}px`);
              console.log(`   No overlap: ${!overlap}`);
              
              // Take a cropped screenshot of just the dates area
              const cropArea = {
                x: Math.min(box1.x, box2.x) - 20,
                y: Math.min(box1.y, box2.y) - 40,
                width: Math.max(box1.x + box1.width, box2.x + box2.width) - Math.min(box1.x, box2.x) + 40,
                height: Math.max(box1.y + box1.height, box2.y + box2.height) - Math.min(box1.y, box2.y) + 80
              };
              
              await mobilePage.screenshot({ 
                path: `mobile-dates-detail-step${step}.png`,
                clip: cropArea 
              });
              console.log(`✅ Detailed dates screenshot saved`);
            }
            break;
          }
        }
      } catch (e) {
        console.log(`📱 Step ${step} not available or error: ${e.message}`);
      }
    }
    
    // Also try scrolling down to find dates if not found in steps
    console.log('4️⃣ Scrolling to find dates section...');
    await mobilePage.evaluate(() => {
      window.scrollBy(0, 300);
    });
    await mobilePage.waitForTimeout(1000);
    
    const dateInputsAfterScroll = await mobilePage.locator('input[type="date"]').all();
    if (dateInputsAfterScroll.length >= 2) {
      console.log('✅ Found dates after scrolling');
      await mobilePage.screenshot({ 
        path: 'mobile-dates-after-scroll.png',
        fullPage: true 
      });
    }
    
    await mobileContext.close();
    
    // Desktop Test (1280px)
    console.log('\n🖥️ DESKTOP TEST (1280px width)');
    console.log('='.repeat(40));
    
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const desktopPage = await desktopContext.newPage();
    
    console.log('1️⃣ Navigating to homepage...');
    await desktopPage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await desktopPage.waitForLoadState('networkidle');
    
    await desktopPage.screenshot({ 
      path: 'desktop-step1-homepage.png',
      fullPage: true 
    });
    console.log('✅ Desktop homepage captured');
    
    // Try to find flight service on desktop (may be different layout)
    console.log('2️⃣ Looking for flight service on desktop...');
    
    // Try different selectors that might be used on desktop
    const desktopFlightSelectors = [
      'button:has-text("Voo")',
      'button:has-text("Flight")',
      '[data-service="flight"]',
      '.service-flight',
      'a[href*="flight"]'
    ];
    
    let desktopFlightFound = false;
    for (const selector of desktopFlightSelectors) {
      try {
        const element = desktopPage.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`🖥️ Found flight element: ${selector}`);
          await element.click();
          await desktopPage.waitForTimeout(2000);
          desktopFlightFound = true;
          break;
        }
      } catch (e) {
        // Continue trying
      }
    }
    
    if (!desktopFlightFound) {
      console.log('🖥️ No specific flight trigger found on desktop, checking for existing form');
    }
    
    await desktopPage.screenshot({ 
      path: 'desktop-step2-after-interaction.png',
      fullPage: true 
    });
    
    // Look for date inputs on desktop
    console.log('3️⃣ Looking for date inputs on desktop...');
    const desktopDateInputs = await desktopPage.locator('input[type="date"]').all();
    console.log(`🖥️ Found ${desktopDateInputs.length} date inputs on desktop`);
    
    if (desktopDateInputs.length >= 2) {
      await desktopDateInputs[0].scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(1000);
      
      await desktopPage.screenshot({ 
        path: 'desktop-dates-found.png',
        fullPage: true 
      });
      
      // Analyze desktop date positioning
      const box1 = await desktopDateInputs[0].boundingBox();
      const box2 = await desktopDateInputs[1].boundingBox();
      
      if (box1 && box2) {
        const sideBySide = Math.abs(box1.y - box2.y) < 30;
        const gap = Math.abs(box1.x - box2.x);
        
        console.log(`🖥️ Desktop Date Analysis:`);
        console.log(`   First date:  x=${Math.round(box1.x)}, y=${Math.round(box1.y)}, w=${Math.round(box1.width)}`);
        console.log(`   Second date: x=${Math.round(box2.x)}, y=${Math.round(box2.y)}, w=${Math.round(box2.width)}`);
        console.log(`   Side-by-side: ${sideBySide}`);
        console.log(`   Horizontal gap: ${Math.round(gap)}px`);
      }
    }
    
    await desktopContext.close();
    
    console.log('\n🎉 TEST COMPLETION SUMMARY');
    console.log('='.repeat(50));
    console.log('📸 Screenshots Generated:');
    console.log('📱 Mobile:');
    console.log('   • mobile-step1-homepage.png');
    console.log('   • mobile-step2-flight-opened.png');
    console.log('   • mobile-dates-after-scroll.png');
    console.log('   • mobile-dates-detail-stepX.png (if found)');
    console.log('🖥️ Desktop:');
    console.log('   • desktop-step1-homepage.png');
    console.log('   • desktop-step2-after-interaction.png');
    console.log('   • desktop-dates-found.png (if found)');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testCompleteDateFlow();