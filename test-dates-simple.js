const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Date Display in Lead Form\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 200 
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
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-1-homepage.png' });
    
    // Click on Voos (Flights) service
    console.log('2️⃣ Clicking on Voos...');
    await page.locator('text=Voos').first().click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking Voos
    await page.screenshot({ path: 'test-2-flight-form.png' });
    
    // Check if we're in step 1
    console.log('3️⃣ Checking for dates section...');
    
    // Look for the dates heading
    const datesHeading = await page.locator('text=Quando você viaja?').count();
    console.log(`   Dates heading found: ${datesHeading > 0 ? 'YES' : 'NO'}`);
    
    // Count date inputs
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`   Number of date inputs: ${dateInputs}`);
    
    // Get all date inputs and their positions
    if (dateInputs > 0) {
      console.log('\n   📅 Date Input Details:');
      for (let i = 0; i < dateInputs; i++) {
        const input = page.locator('input[type="date"]').nth(i);
        const box = await input.boundingBox();
        const isVisible = await input.isVisible();
        
        console.log(`      Input ${i + 1}:`);
        console.log(`         Visible: ${isVisible}`);
        if (box) {
          console.log(`         Position: x=${Math.round(box.x)}, y=${Math.round(box.y)}`);
          console.log(`         Size: ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      }
      
      // Check if they're side-by-side
      if (dateInputs >= 2) {
        const input1 = page.locator('input[type="date"]').nth(0);
        const input2 = page.locator('input[type="date"]').nth(1);
        const box1 = await input1.boundingBox();
        const box2 = await input2.boundingBox();
        
        if (box1 && box2) {
          const sameLine = Math.abs(box1.y - box2.y) < 10;
          console.log(`\n   🎯 Side-by-side: ${sameLine ? 'YES ✅' : 'NO ❌'}`);
          console.log(`      Y difference: ${Math.abs(box1.y - box2.y)}px`);
          console.log(`      X difference: ${Math.abs(box1.x - box2.x)}px`);
        }
      }
    }
    
    // Try to scroll down to see if dates are below
    console.log('\n4️⃣ Scrolling to check if dates are below...');
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);
    
    // Take screenshot after scrolling
    await page.screenshot({ path: 'test-3-scrolled.png' });
    
    // Re-check date inputs after scrolling
    const dateInputsAfterScroll = await page.locator('input[type="date"]').count();
    console.log(`   Date inputs after scroll: ${dateInputsAfterScroll}`);
    
    // Check the grid container
    console.log('\n5️⃣ Checking grid container...');
    const gridContainers = await page.locator('.grid.grid-cols-2').count();
    console.log(`   Grid containers with grid-cols-2: ${gridContainers}`);
    
    // Check each grid container
    if (gridContainers > 0) {
      for (let i = 0; i < gridContainers; i++) {
        const container = page.locator('.grid.grid-cols-2').nth(i);
        const box = await container.boundingBox();
        const children = await container.locator('> *').count();
        
        console.log(`      Grid ${i + 1}:`);
        console.log(`         Children: ${children}`);
        if (box) {
          console.log(`         Width: ${Math.round(box.width)}px`);
        }
      }
    }
    
    console.log('\n✅ Test completed! Check screenshots.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
})();