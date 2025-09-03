const { chromium } = require('playwright');

async function captureActualDates() {
  const browser = await chromium.launch({ headless: false, slowMo: 1200 });
  
  try {
    console.log('🎯 Final Test: Capturing Side-by-Side Dates Implementation');
    
    // Mobile view test
    console.log('\n📱 MOBILE VIEW TEST');
    const mobileContext = await browser.newContext({
      viewport: { width: 360, height: 640 }
    });
    
    const mobilePage = await mobileContext.newPage();
    
    // Navigate to homepage
    await mobilePage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(3000);
    
    console.log('📱 Step 1: Taking homepage screenshot...');
    await mobilePage.screenshot({ 
      path: 'final-mobile-1-homepage.png',
      fullPage: true 
    });
    
    // Click on flight service
    console.log('📱 Step 2: Clicking flight service...');
    await mobilePage.locator('button:has-text("✈️VoosPassagens aéreas")').click();
    await mobilePage.waitForTimeout(3000);
    
    await mobilePage.screenshot({ 
      path: 'final-mobile-2-flight-opened.png',
      fullPage: true 
    });
    
    // Click on "Quando você viaja?" 
    console.log('📱 Step 3: Clicking on "Quando você viaja?"...');
    try {
      const whenTravel = mobilePage.locator('text=📅Quando você viaja?').first();
      if (await whenTravel.isVisible()) {
        console.log('✅ Found "Quando você viaja?" - clicking...');
        await whenTravel.click();
        await mobilePage.waitForTimeout(3000);
        
        await mobilePage.screenshot({ 
          path: 'final-mobile-3-after-quando-click.png',
          fullPage: true 
        });
      }
    } catch (e) {
      console.log('📱 Direct click failed, trying parent element...');
      
      // Try clicking on parent elements that might contain the dates
      const parentElements = await mobilePage.locator('div:has-text("📅Quando você viaja?")').all();
      for (const parent of parentElements) {
        try {
          await parent.click();
          await mobilePage.waitForTimeout(2000);
          console.log('✅ Clicked on parent element');
          break;
        } catch (e) {
          console.log('📱 Parent click failed, trying next...');
        }
      }
    }
    
    // Look for date inputs after interaction
    console.log('📱 Step 4: Looking for date inputs...');
    const dateInputs = await mobilePage.locator('input[type="date"]').all();
    console.log(`📱 Found ${dateInputs.length} date inputs`);
    
    if (dateInputs.length >= 2) {
      console.log('✅ Date inputs found! Scrolling to them...');
      
      // Scroll to first date input
      await dateInputs[0].scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(2000);
      
      // Take full page screenshot with dates visible
      await mobilePage.screenshot({ 
        path: 'final-mobile-4-dates-visible.png',
        fullPage: true 
      });
      
      // Get precise positioning
      console.log('📱 Analyzing date positioning...');
      const date1Box = await dateInputs[0].boundingBox();
      const date2Box = await dateInputs[1].boundingBox();
      
      if (date1Box && date2Box) {
        console.log('📱 Date Input Positions:');
        console.log(`   Date 1: x=${Math.round(date1Box.x)}, y=${Math.round(date1Box.y)}, w=${Math.round(date1Box.width)}, h=${Math.round(date1Box.height)}`);
        console.log(`   Date 2: x=${Math.round(date2Box.x)}, y=${Math.round(date2Box.y)}, w=${Math.round(date2Box.width)}, h=${Math.round(date2Box.height)}`);
        
        const yDiff = Math.abs(date1Box.y - date2Box.y);
        const xGap = Math.abs(date1Box.x - date2Box.x);
        const sideBySide = yDiff < 30;
        
        console.log(`📱 Layout Analysis:`);
        console.log(`   Y difference: ${Math.round(yDiff)}px`);
        console.log(`   X gap: ${Math.round(xGap)}px`);
        console.log(`   Side-by-side: ${sideBySide ? '✅ YES' : '❌ NO'}`);
        
        // Take cropped screenshot of just the dates area
        const cropX = Math.min(date1Box.x, date2Box.x) - 30;
        const cropY = Math.min(date1Box.y, date2Box.y) - 50;
        const cropWidth = Math.max(date1Box.x + date1Box.width, date2Box.x + date2Box.width) - cropX + 30;
        const cropHeight = Math.max(date1Box.y + date1Box.height, date2Box.y + date2Box.height) - cropY + 50;
        
        await mobilePage.screenshot({
          path: 'final-mobile-5-dates-closeup.png',
          clip: {
            x: Math.max(0, cropX),
            y: Math.max(0, cropY),
            width: Math.min(cropWidth, 360),
            height: Math.min(cropHeight, 200)
          }
        });
        console.log('✅ Dates close-up screenshot captured');
      }
    } else {
      console.log('📱 No date inputs found, trying to navigate through steps...');
      
      // Try clicking on different step numbers
      for (let step = 2; step <= 5; step++) {
        try {
          const stepBtn = mobilePage.locator(`button:has-text("${step}")`).first();
          if (await stepBtn.isVisible()) {
            console.log(`📱 Trying step ${step}...`);
            await stepBtn.click();
            await mobilePage.waitForTimeout(2000);
            
            const stepDateInputs = await mobilePage.locator('input[type="date"]').all();
            if (stepDateInputs.length >= 2) {
              console.log(`✅ Found dates on step ${step}!`);
              await stepDateInputs[0].scrollIntoViewIfNeeded();
              await mobilePage.waitForTimeout(1000);
              
              await mobilePage.screenshot({ 
                path: `final-mobile-step${step}-dates.png`,
                fullPage: true 
              });
              break;
            }
          }
        } catch (e) {
          console.log(`📱 Step ${step} failed: ${e.message}`);
        }
      }
    }
    
    await mobileContext.close();
    
    // Desktop view test
    console.log('\n🖥️ DESKTOP VIEW TEST');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const desktopPage = await desktopContext.newPage();
    
    await desktopPage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await desktopPage.waitForLoadState('networkidle');
    await desktopPage.waitForTimeout(3000);
    
    console.log('🖥️ Desktop homepage loaded');
    await desktopPage.screenshot({ 
      path: 'final-desktop-1-homepage.png',
      fullPage: true 
    });
    
    // Look for any date inputs that might already be visible on desktop
    const desktopDateInputs = await desktopPage.locator('input[type="date"]').all();
    console.log(`🖥️ Found ${desktopDateInputs.length} date inputs on desktop`);
    
    if (desktopDateInputs.length >= 2) {
      await desktopDateInputs[0].scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(1000);
      
      await desktopPage.screenshot({ 
        path: 'final-desktop-2-dates-found.png',
        fullPage: true 
      });
      
      const desktop1Box = await desktopDateInputs[0].boundingBox();
      const desktop2Box = await desktopDateInputs[1].boundingBox();
      
      if (desktop1Box && desktop2Box) {
        console.log('🖥️ Desktop Date Positions:');
        console.log(`   Date 1: x=${Math.round(desktop1Box.x)}, y=${Math.round(desktop1Box.y)}, w=${Math.round(desktop1Box.width)}`);
        console.log(`   Date 2: x=${Math.round(desktop2Box.x)}, y=${Math.round(desktop2Box.y)}, w=${Math.round(desktop2Box.width)}`);
        
        const desktopSideBySide = Math.abs(desktop1Box.y - desktop2Box.y) < 30;
        console.log(`🖥️ Desktop side-by-side: ${desktopSideBySide ? '✅ YES' : '❌ NO'}`);
      }
    }
    
    await desktopContext.close();
    
    console.log('\n🎉 FINAL RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log('📸 Key Screenshots Generated:');
    console.log('📱 Mobile (360px):');
    console.log('   • final-mobile-4-dates-visible.png - Full page with dates');
    console.log('   • final-mobile-5-dates-closeup.png - Close-up of dates layout');
    console.log('🖥️ Desktop (1280px):');
    console.log('   • final-desktop-2-dates-found.png - Desktop dates layout');
    console.log('\n✅ Side-by-side dates implementation testing completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

captureActualDates();