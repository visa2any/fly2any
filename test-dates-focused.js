const { chromium } = require('playwright');

async function testDatesFocused() {
  console.log('🚀 Testing Mobile Flight Date Layout - Focused Test');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  // Test both viewports separately
  const viewports = [
    { name: 'Mobile', width: 390, height: 844 },
    { name: 'Desktop', width: 1280, height: 720 }
  ];

  for (const viewport of viewports) {
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });
    
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    
    try {
      // Navigate and setup
      await page.goto('http://localhost:3000');
      await page.waitForTimeout(2000);
      
      // Click flights
      await page.locator('button').filter({ hasText: 'Voos' }).click();
      await page.waitForTimeout(1500);
      
      console.log('📍 Step 1: Selecting round-trip...');
      await page.locator('button').filter({ hasText: 'Ida e volta' }).click();
      await page.waitForTimeout(500);
      
      console.log('📍 Step 2: Filling origin...');
      const originInput = page.locator('input[placeholder*="De onde"]').first();
      await originInput.click();
      await originInput.fill('São Paulo');
      await page.waitForTimeout(1000);
      
      console.log('📍 Step 3: Filling destination...');  
      const destInput = page.locator('input[placeholder*="Para onde"]').first();
      await destInput.click();
      await destInput.fill('Rio de Janeiro');
      await page.waitForTimeout(1500); // Wait for dates to appear
      
      console.log('📍 Step 4: Looking for dates...');
      const dateCount = await page.locator('input[type="date"]').count();
      console.log(`Found ${dateCount} date inputs`);
      
      if (dateCount > 0) {
        console.log('✅ DATE INPUTS FOUND!');
        
        // Scroll to make sure dates are visible
        await page.locator('input[type="date"]').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        // Take screenshot of the whole form
        await page.screenshot({ 
          path: `dates-${viewport.name.toLowerCase()}-full-form.png`,
          fullPage: true 
        });
        
        // Focus on the dates section
        const datesContainer = page.locator('.grid-cols-2').filter({ 
          has: page.locator('input[type="date"]') 
        }).first();
        
        if (await datesContainer.isVisible()) {
          console.log('✅ Grid-cols-2 dates container found!');
          
          // Get the container info
          const containerInfo = await datesContainer.evaluate((el) => {
            const rect = el.getBoundingClientRect();
            const computed = window.getComputedStyle(el);
            return {
              width: rect.width,
              height: rect.height,
              display: computed.display,
              gridTemplateColumns: computed.gridTemplateColumns,
              gap: computed.gap
            };
          });
          
          console.log(`Container info for ${viewport.name}:`, containerInfo);
          
          // Take focused screenshot of dates
          await datesContainer.screenshot({ 
            path: `dates-${viewport.name.toLowerCase()}-grid-focused.png` 
          });
          
          // Check each date input
          const dateInputsInGrid = await datesContainer.locator('input[type="date"]').all();
          console.log(`Grid has ${dateInputsInGrid.length} date inputs`);
          
          for (let i = 0; i < dateInputsInGrid.length; i++) {
            const input = dateInputsInGrid[i];
            const label = await input.locator('..').locator('label').textContent();
            const inputRect = await input.boundingBox();
            console.log(`  Date ${i+1}: "${label}" at ${inputRect?.x}, ${inputRect?.y} (${inputRect?.width}x${inputRect?.height})`);
          }
          
          // Verify they're actually side by side
          if (dateInputsInGrid.length === 2) {
            const rect1 = await dateInputsInGrid[0].boundingBox();
            const rect2 = await dateInputsInGrid[1].boundingBox();
            
            const sideBySide = rect1 && rect2 && Math.abs(rect1.y - rect2.y) < 10; // Same row
            const properSpacing = rect1 && rect2 && rect2.x > rect1.x + rect1.width; // Second is to the right
            
            console.log(`  ✅ Side by side: ${sideBySide}`);
            console.log(`  ✅ Proper spacing: ${properSpacing}`);
            
            if (sideBySide && properSpacing) {
              console.log(`  🎉 ${viewport.name}: Date inputs are properly side-by-side!`);
            } else {
              console.log(`  ❌ ${viewport.name}: Date inputs have layout issues`);
            }
          }
          
        } else {
          console.log('❌ Grid-cols-2 container not found');
        }
        
      } else {
        console.log('❌ No date inputs found');
        await page.screenshot({ 
          path: `dates-${viewport.name.toLowerCase()}-no-dates.png`,
          fullPage: true 
        });
      }
      
    } catch (error) {
      console.error(`❌ Error in ${viewport.name} test:`, error.message);
      await page.screenshot({ 
        path: `dates-${viewport.name.toLowerCase()}-error.png`,
        fullPage: true 
      });
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\n✅ Focused Date Layout Test Complete!');
  console.log('\n📸 Screenshots saved:');
  console.log('  - dates-mobile-full-form.png');
  console.log('  - dates-mobile-grid-focused.png');  
  console.log('  - dates-desktop-full-form.png');
  console.log('  - dates-desktop-grid-focused.png');
}

testDatesFocused().catch(console.error);