const { chromium } = require('playwright');

(async () => {
  console.log('🔧 Testing Date Visibility After Viewport Fix\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 300 
  });
  
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  try {
    // Navigate to the app
    console.log('1️⃣ Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Click on Voos (Flights) service
    console.log('2️⃣ Opening flight form...');
    await page.locator('text=Voos').first().click();
    await page.waitForTimeout(2000);
    
    // Check viewport dimensions
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      scrollY: window.scrollY
    }));
    console.log(`   Viewport: ${viewport.width}x${viewport.height}, Scroll: ${viewport.scrollY}`);
    
    // Take screenshot before any scrolling
    await page.screenshot({ path: 'fixed-1-initial.png' });
    
    // Check if dates section is now visible
    console.log('\n3️⃣ Checking dates visibility...');
    
    const datesHeading = await page.locator('text=Quando você viaja?');
    const headingVisible = await datesHeading.isVisible();
    const headingBox = await datesHeading.boundingBox();
    
    console.log(`   📅 "Quando você viaja?" heading:`);
    console.log(`      Visible: ${headingVisible ? 'YES ✅' : 'NO ❌'}`);
    if (headingBox) {
      console.log(`      Position: y=${Math.round(headingBox.y)}`);
      console.log(`      In viewport: ${headingBox.y < viewport.height ? 'YES ✅' : 'NO ❌'}`);
    }
    
    // Count date inputs and check their positions
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`\n   📊 Date inputs found: ${dateInputs}`);
    
    if (dateInputs > 0) {
      for (let i = 0; i < Math.min(dateInputs, 2); i++) {
        const input = page.locator('input[type="date"]').nth(i);
        const isVisible = await input.isVisible();
        const box = await input.boundingBox();
        
        console.log(`      Input ${i + 1}:`);
        console.log(`         Visible: ${isVisible ? 'YES ✅' : 'NO ❌'}`);
        if (box) {
          console.log(`         Position: y=${Math.round(box.y)}`);
          console.log(`         In viewport: ${box.y < viewport.height ? 'YES ✅' : 'NO ❌'}`);
          console.log(`         Size: ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      }
      
      // Test side-by-side positioning
      if (dateInputs >= 2) {
        const input1 = page.locator('input[type="date"]').nth(0);
        const input2 = page.locator('input[type="date"]').nth(1);
        const box1 = await input1.boundingBox();
        const box2 = await input2.boundingBox();
        
        if (box1 && box2) {
          const sameLine = Math.abs(box1.y - box2.y) < 10;
          const bothVisible = box1.y < viewport.height && box2.y < viewport.height;
          
          console.log(`\n   🎯 Layout Status:`);
          console.log(`      Side-by-side: ${sameLine ? 'YES ✅' : 'NO ❌'}`);
          console.log(`      Both in viewport: ${bothVisible ? 'YES ✅' : 'NO ❌'}`);
          console.log(`      Fix successful: ${sameLine && bothVisible ? 'YES ✅' : 'NO ❌'}`);
        }
      }
    }
    
    // Take a focused screenshot of the dates area
    console.log('\n4️⃣ Capturing focused screenshots...');
    
    if (await datesHeading.isVisible()) {
      await datesHeading.scrollIntoView();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'fixed-2-dates-focused.png' });
    }
    
    // Take full page screenshot
    await page.screenshot({ path: 'fixed-3-full-form.png', fullPage: true });
    
    console.log('\n✅ Viewport fix test completed!');
    console.log('   Check screenshots: fixed-1-initial.png, fixed-2-dates-focused.png, fixed-3-full-form.png');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'fixed-error.png' });
  } finally {
    await browser.close();
  }
})();