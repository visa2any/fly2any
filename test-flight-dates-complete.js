const { chromium } = require('playwright');

async function testFlightDatesComplete() {
  console.log('🚀 Starting Complete Flight Date Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    timeout: 60000
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  try {
    console.log('📍 Step 1: Navigate to homepage...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'complete-1-homepage.png', fullPage: true });
    
    console.log('📍 Step 2: Click flights button...');
    const flightButton = page.locator('button').filter({ hasText: 'Voos' }).first();
    await flightButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'complete-2-flight-form.png', fullPage: true });
    
    console.log('📍 Step 3: Ensure "Ida e volta" is selected...');
    const idaVoltaButton = page.locator('button').filter({ hasText: 'Ida e volta' }).first();
    if (await idaVoltaButton.isVisible()) {
      await idaVoltaButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ "Ida e volta" selected');
    }
    
    console.log('📍 Step 4: Fill in origin...');
    const originInput = page.locator('input[placeholder*="De onde"], input[placeholder*="origem"]').first();
    if (await originInput.isVisible()) {
      await originInput.click();
      await originInput.fill('São Paulo');
      await page.waitForTimeout(1000);
      console.log('✅ Origin filled');
    }
    
    console.log('📍 Step 5: Fill in destination...');
    const destInput = page.locator('input[placeholder*="Para onde"], input[placeholder*="destino"]').first();
    if (await destInput.isVisible()) {
      await destInput.click();
      await destInput.fill('Rio de Janeiro');
      await page.waitForTimeout(1000);
      console.log('✅ Destination filled');
    }
    
    await page.screenshot({ path: 'complete-3-after-origin-dest.png', fullPage: true });
    
    console.log('📍 Step 6: Look for date inputs...');
    
    // Wait a bit for any dynamic content to appear
    await page.waitForTimeout(2000);
    
    // Check for date inputs
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`Found ${dateInputs} date inputs`);
    
    if (dateInputs > 0) {
      console.log('✅ Date inputs found!');
      
      // Take screenshot of the current state
      await page.screenshot({ path: 'complete-4-with-dates.png', fullPage: true });
      
      // Analyze the date inputs layout
      const allDateInputs = await page.locator('input[type="date"]').all();
      
      for (let i = 0; i < allDateInputs.length; i++) {
        const input = allDateInputs[i];
        const placeholder = await input.getAttribute('placeholder');
        const ariaLabel = await input.getAttribute('aria-label');
        const className = await input.getAttribute('class');
        
        console.log(`Date Input ${i + 1}:`);
        console.log(`  Placeholder: "${placeholder}"`);
        console.log(`  Aria-label: "${ariaLabel}"`);
        console.log(`  Classes: "${className}"`);
        
        // Get the parent container
        const parent = input.locator('..');
        const parentClass = await parent.getAttribute('class');
        console.log(`  Parent classes: "${parentClass}"`);
        
        // Check if parent has grid classes
        if (parentClass?.includes('grid')) {
          console.log('  🎯 Parent uses grid layout!');
          
          const styles = await parent.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              display: computed.display,
              gridTemplateColumns: computed.gridTemplateColumns,
              gap: computed.gap,
              width: computed.width
            };
          });
          console.log(`  Grid styles:`, styles);
          
          // Take screenshot of just this grid container
          await parent.screenshot({ 
            path: `complete-date-grid-${i + 1}.png` 
          });
        }
      }
      
      // Look for the specific grid container that should contain both dates
      const gridContainer = page.locator('.grid-cols-2').first();
      if (await gridContainer.isVisible()) {
        console.log('✅ Found grid-cols-2 container!');
        
        const children = await gridContainer.locator('> *').count();
        console.log(`Grid container has ${children} direct children`);
        
        // Get computed styles
        const gridStyles = await gridContainer.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            gridTemplateColumns: computed.gridTemplateColumns,
            gap: computed.gap,
            width: computed.width,
            height: computed.height
          };
        });
        console.log('Grid-cols-2 styles:', gridStyles);
        
        // Take focused screenshot
        await gridContainer.screenshot({ 
          path: 'complete-grid-cols-2-focused.png' 
        });
        
        // Check each child
        const gridChildren = await gridContainer.locator('> *').all();
        for (let i = 0; i < gridChildren.length; i++) {
          const child = gridChildren[i];
          const childText = await child.textContent();
          const childClass = await child.getAttribute('class');
          console.log(`  Grid child ${i + 1}: "${childText}" (class: ${childClass})`);
        }
        
      } else {
        console.log('❌ No grid-cols-2 container found');
        
        // Look for any grid elements
        const anyGrid = await page.locator('[class*="grid"]').count();
        console.log(`Found ${anyGrid} elements with grid classes`);
        
        if (anyGrid > 0) {
          const gridElements = await page.locator('[class*="grid"]').all();
          for (let i = 0; i < Math.min(gridElements.length, 3); i++) {
            const el = gridElements[i];
            const className = await el.getAttribute('class');
            const isVisible = await el.isVisible();
            console.log(`Grid element ${i + 1}: ${className} (visible: ${isVisible})`);
          }
        }
      }
      
    } else {
      console.log('❌ No date inputs found yet');
      
      // Try clicking continue or next button
      const continueButton = page.locator('button').filter({ hasText: /continuar|próximo|next/i }).first();
      if (await continueButton.isVisible()) {
        console.log('🔄 Trying to click continue button...');
        await continueButton.click();
        await page.waitForTimeout(2000);
        
        // Check again for date inputs
        const newDateInputs = await page.locator('input[type="date"]').count();
        console.log(`After continue: Found ${newDateInputs} date inputs`);
        
        await page.screenshot({ path: 'complete-5-after-continue.png', fullPage: true });
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'complete-final.png', fullPage: true });
    
    console.log('📍 Step 7: Test on desktop width...');
    
    // Change to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'complete-desktop-final.png', fullPage: true });
    
    // Check grid layout on desktop
    const desktopGridContainer = page.locator('.grid-cols-2').first();
    if (await desktopGridContainer.isVisible()) {
      console.log('✅ Grid-cols-2 visible on desktop');
      
      const desktopStyles = await desktopGridContainer.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          gridTemplateColumns: computed.gridTemplateColumns,
          gap: computed.gap,
          width: computed.width
        };
      });
      console.log('Desktop grid styles:', desktopStyles);
      
      await desktopGridContainer.screenshot({ 
        path: 'complete-desktop-grid-cols-2.png' 
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'complete-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('✅ Complete test finished!');
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('Screenshots captured:');
  console.log('  - complete-1-homepage.png');
  console.log('  - complete-2-flight-form.png');
  console.log('  - complete-3-after-origin-dest.png');
  console.log('  - complete-4-with-dates.png (if dates found)');
  console.log('  - complete-date-grid-*.png (individual grids)');
  console.log('  - complete-grid-cols-2-focused.png (if grid-cols-2 found)');
  console.log('  - complete-desktop-*.png (desktop tests)');
}

testFlightDatesComplete().catch(console.error);