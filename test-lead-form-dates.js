const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Lead Form Step 1 - Date Display Issue\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('1️⃣ Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on Voos (Flights) service
    console.log('2️⃣ Clicking on "Voos" service...');
    const voosButton = await page.locator('button:has-text("Voos")').first();
    await voosButton.click();
    await page.waitForTimeout(2000);
    
    // Now we should be in MobileFlightWizard Step 1
    console.log('3️⃣ Checking Step 1 - Trip Details...\n');
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'step1-initial-state.png', 
      fullPage: false 
    });
    
    // Check if dates section exists
    console.log('4️⃣ Looking for dates section...');
    const datesSection = await page.locator('h3:has-text("Quando você viaja?")');
    const datesSectionExists = await datesSection.isVisible();
    console.log(`   ✅ Dates section exists: ${datesSectionExists}`);
    
    if (datesSectionExists) {
      // Check the parent container of date inputs
      const dateContainer = await page.locator('h3:has-text("Quando você viaja?")').locator('..').locator('div.grid');
      const containerExists = await dateContainer.count() > 0;
      console.log(`   ✅ Date container with grid exists: ${containerExists}`);
      
      if (containerExists) {
        // Get the computed styles of the grid container
        const gridClasses = await dateContainer.getAttribute('class');
        console.log(`   📋 Grid container classes: ${gridClasses}`);
        
        // Check if grid-cols-2 is present
        const hasGridCols2 = gridClasses?.includes('grid-cols-2');
        console.log(`   ${hasGridCols2 ? '✅' : '❌'} Has grid-cols-2 class: ${hasGridCols2}`);
        
        // Get computed styles
        const computedStyles = await dateContainer.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            gridTemplateColumns: styles.gridTemplateColumns,
            gap: styles.gap,
            width: styles.width
          };
        });
        
        console.log('\n   📊 Computed Grid Styles:');
        console.log(`      Display: ${computedStyles.display}`);
        console.log(`      Grid Template Columns: ${computedStyles.gridTemplateColumns}`);
        console.log(`      Gap: ${computedStyles.gap}`);
        console.log(`      Width: ${computedStyles.width}`);
        
        // Count date inputs
        const dateInputs = await page.locator('input[type="date"]').all();
        console.log(`\n   📅 Number of date inputs found: ${dateInputs.length}`);
        
        // Get position of each date input
        for (let i = 0; i < dateInputs.length; i++) {
          const box = await dateInputs[i].boundingBox();
          const label = await dateInputs[i].evaluate(el => {
            const parent = el.parentElement;
            const labelEl = parent?.querySelector('label');
            return labelEl?.textContent || 'No label';
          });
          
          console.log(`      Date ${i + 1} ("${label}"):`);
          console.log(`         Position: x=${box?.x}, y=${box?.y}`);
          console.log(`         Size: ${box?.width}x${box?.height}`);
        }
        
        // Check if dates are side-by-side
        if (dateInputs.length >= 2) {
          const box1 = await dateInputs[0].boundingBox();
          const box2 = await dateInputs[1].boundingBox();
          
          const sameLine = Math.abs((box1?.y || 0) - (box2?.y || 0)) < 10;
          const differentX = Math.abs((box1?.x || 0) - (box2?.x || 0)) > 50;
          
          console.log(`\n   🎯 Layout Analysis:`);
          console.log(`      Same Y position (side-by-side): ${sameLine ? '✅ YES' : '❌ NO'}`);
          console.log(`      Different X position: ${differentX ? '✅ YES' : '❌ NO'}`);
          console.log(`      Side-by-side layout: ${sameLine && differentX ? '✅ WORKING' : '❌ NOT WORKING'}`);
        }
      }
    }
    
    // Select round-trip to ensure we should see both dates
    console.log('\n5️⃣ Selecting Round-Trip option...');
    const roundTripButton = await page.locator('button:has-text("Ida e volta")').first();
    await roundTripButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after selecting round-trip
    await page.screenshot({ 
      path: 'step1-round-trip-selected.png', 
      fullPage: false 
    });
    
    // Re-check date inputs after round-trip selection
    const dateInputsAfter = await page.locator('input[type="date"]').all();
    console.log(`   📅 Date inputs after round-trip selection: ${dateInputsAfter.length}`);
    
    // Scroll to dates section
    await page.evaluate(() => {
      const datesSection = document.querySelector('h3')?.parentElement?.parentElement;
      if (datesSection && datesSection.textContent?.includes('Quando você viaja')) {
        datesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Take focused screenshot of dates section
    const datesSectionElement = await page.locator('h3:has-text("Quando você viaja?")').locator('..');
    if (await datesSectionElement.isVisible()) {
      await datesSectionElement.screenshot({ 
        path: 'step1-dates-section-focused.png' 
      });
      console.log('   📸 Captured focused screenshot of dates section');
    }
    
    console.log('\n✅ Test completed! Check the screenshots:\n');
    console.log('   - step1-initial-state.png');
    console.log('   - step1-round-trip-selected.png');
    console.log('   - step1-dates-section-focused.png');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'error-state.png' });
  } finally {
    await browser.close();
  }
})();