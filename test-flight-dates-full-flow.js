const { chromium } = require('playwright');

async function testFlightDatesFullFlow() {
  console.log('🚀 Starting Full Flow Flight Date Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    timeout: 60000
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  try {
    console.log('📍 Step 1: Navigate and click flights...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Click flights button
    const flightButton = page.locator('button').filter({ hasText: 'Voos' }).first();
    await flightButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'full-flow-1-flight-form-loaded.png', fullPage: true });
    console.log('✅ Flight form loaded');

    console.log('📍 Step 2: Ensure "Ida e volta" is selected...');
    const idaVoltaButton = page.locator('button').filter({ hasText: 'Ida e volta' }).first();
    if (await idaVoltaButton.isVisible()) {
      await idaVoltaButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Round-trip selected');
    }

    console.log('📍 Step 3: Fill origin airport...');
    
    // Look for origin input - try multiple selectors
    const originSelectors = [
      'input[placeholder*="De onde"]',
      'input[placeholder*="origem"]', 
      'input[placeholder*="Origem"]',
      'div:has-text("Origem") input',
      'label:has-text("Origem") + * input'
    ];
    
    let originInput = null;
    for (const selector of originSelectors) {
      try {
        originInput = page.locator(selector).first();
        if (await originInput.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found origin input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (originInput && await originInput.isVisible()) {
      await originInput.click();
      await originInput.fill('São Paulo');
      await page.waitForTimeout(1500); // Wait for any autocomplete
      
      // Try to select from dropdown if it appears
      try {
        const firstOption = page.locator('[role="option"], .dropdown-item, .autocomplete-item').first();
        if (await firstOption.isVisible({ timeout: 2000 })) {
          await firstOption.click();
          console.log('✅ Selected origin from dropdown');
        }
      } catch (e) {
        console.log('No dropdown appeared for origin');
      }
      
      console.log('✅ Origin filled: São Paulo');
    } else {
      console.log('❌ Could not find origin input');
    }

    await page.screenshot({ path: 'full-flow-2-origin-filled.png', fullPage: true });

    console.log('📍 Step 4: Fill destination airport...');
    
    // Look for destination input
    const destSelectors = [
      'input[placeholder*="Para onde"]',
      'input[placeholder*="destino"]',
      'input[placeholder*="Destino"]', 
      'div:has-text("Destino") input',
      'label:has-text("Destino") + * input'
    ];
    
    let destInput = null;
    for (const selector of destSelectors) {
      try {
        destInput = page.locator(selector).first();
        if (await destInput.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found destination input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (destInput && await destInput.isVisible()) {
      await destInput.click();
      await destInput.fill('Rio de Janeiro');
      await page.waitForTimeout(1500); // Wait for autocomplete
      
      // Try to select from dropdown
      try {
        const firstOption = page.locator('[role="option"], .dropdown-item, .autocomplete-item').first();
        if (await firstOption.isVisible({ timeout: 2000 })) {
          await firstOption.click();
          console.log('✅ Selected destination from dropdown');
        }
      } catch (e) {
        console.log('No dropdown appeared for destination');
      }
      
      console.log('✅ Destination filled: Rio de Janeiro');
    } else {
      console.log('❌ Could not find destination input');
    }

    await page.screenshot({ path: 'full-flow-3-destination-filled.png', fullPage: true });

    console.log('📍 Step 5: Wait for dates section to appear...');
    await page.waitForTimeout(3000); // Give time for any dynamic content

    // Now look for date inputs
    console.log('📍 Step 6: Searching for date inputs...');
    
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`Found ${dateInputs} date inputs`);
    
    if (dateInputs > 0) {
      console.log('✅ DATE INPUTS FOUND! Analyzing layout...');
      
      await page.screenshot({ path: 'full-flow-4-dates-visible.png', fullPage: true });
      
      // Check if dates are in grid-cols-2 container
      const allDateInputs = await page.locator('input[type="date"]').all();
      
      for (let i = 0; i < allDateInputs.length; i++) {
        const dateInput = allDateInputs[i];
        console.log(`\n📅 Date Input ${i + 1} Analysis:`);
        
        // Get the label
        const labelText = await dateInput.locator('..').locator('label').first().textContent();
        console.log(`  Label: "${labelText}"`);
        
        // Get the parent container
        const parent = dateInput.locator('..');
        const parentClass = await parent.getAttribute('class');
        console.log(`  Parent classes: "${parentClass}"`);
        
        // Get the grandparent (should be the grid container)
        const grandparent = parent.locator('..');
        const grandparentClass = await grandparent.getAttribute('class');
        console.log(`  Grandparent classes: "${grandparentClass}"`);
        
        // Check if grandparent is the grid-cols-2 container
        if (grandparentClass?.includes('grid-cols-2')) {
          console.log('  🎯 FOUND! This date input is inside grid-cols-2!');
          
          // Get computed styles of the grid container
          const gridStyles = await grandparent.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              display: computed.display,
              gridTemplateColumns: computed.gridTemplateColumns,
              gap: computed.gap,
              width: computed.width,
              gridColumnCount: computed.gridTemplateColumns.split(' ').length
            };
          });
          console.log('  Grid styles:', gridStyles);
          
          // Count children in grid
          const gridChildren = await grandparent.locator('> *').count();
          console.log(`  Grid has ${gridChildren} direct children`);
          
          // Take screenshot of just this grid
          await grandparent.screenshot({ 
            path: `full-flow-grid-cols-2-${i + 1}.png` 
          });
          
        } else {
          console.log('  ❌ This date input is NOT in grid-cols-2 container');
        }
      }
      
      // Look specifically for the grid-cols-2 container with dates
      const gridContainer = page.locator('.grid-cols-2').filter({ 
        has: page.locator('input[type="date"]') 
      }).first();
      
      if (await gridContainer.isVisible()) {
        console.log('\n🎯 MAIN ANALYSIS: Grid-cols-2 container with date inputs found!');
        
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
        console.log('Main grid styles:', gridStyles);
        
        // Count children
        const children = await gridContainer.locator('> *').count();
        console.log(`Grid container has ${children} direct children`);
        
        // List each child
        const gridChildren = await gridContainer.locator('> *').all();
        for (let i = 0; i < gridChildren.length; i++) {
          const child = gridChildren[i];
          const childClass = await child.getAttribute('class');
          const hasDateInput = await child.locator('input[type="date"]').count();
          const labelText = await child.locator('label').textContent();
          console.log(`  Child ${i + 1}: class="${childClass}", hasDateInput=${hasDateInput}, label="${labelText}"`);
        }
        
        // Take focused screenshot
        await gridContainer.screenshot({ 
          path: 'full-flow-MAIN-grid-cols-2-dates.png' 
        });
        
        console.log('✅ Side-by-side dates layout CONFIRMED!');
        
      } else {
        console.log('❌ Could not find grid-cols-2 container with date inputs');
        
        // Debug: show all grid containers
        const allGrids = await page.locator('[class*="grid"]').count();
        console.log(`Found ${allGrids} total grid elements`);
        
        if (allGrids > 0) {
          const grids = await page.locator('[class*="grid"]').all();
          for (let i = 0; i < Math.min(grids.length, 5); i++) {
            const grid = grids[i];
            const className = await grid.getAttribute('class');
            const isVisible = await grid.isVisible();
            const hasDateInputs = await grid.locator('input[type="date"]').count();
            console.log(`  Grid ${i + 1}: ${className}, visible: ${isVisible}, dateInputs: ${hasDateInputs}`);
          }
        }
      }
      
    } else {
      console.log('❌ NO DATE INPUTS FOUND - This is the issue!');
      
      // Debug: scroll down to see if dates are further down
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      const dateInputsAfterScroll = await page.locator('input[type="date"]').count();
      console.log(`After scrolling: Found ${dateInputsAfterScroll} date inputs`);
      
      if (dateInputsAfterScroll > 0) {
        console.log('✅ Date inputs appeared after scrolling!');
        await page.screenshot({ path: 'full-flow-5-dates-after-scroll.png', fullPage: true });
      }
    }

    // Test on desktop width
    console.log('\n📍 Step 7: Testing on desktop width (1280px)...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'full-flow-desktop-1280.png', fullPage: true });
    
    const desktopDateInputs = await page.locator('input[type="date"]').count();
    console.log(`Desktop view: Found ${desktopDateInputs} date inputs`);
    
    if (desktopDateInputs > 0) {
      const desktopGridContainer = page.locator('.grid-cols-2').filter({ 
        has: page.locator('input[type="date"]') 
      }).first();
      
      if (await desktopGridContainer.isVisible()) {
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
          path: 'full-flow-desktop-grid-cols-2-dates.png' 
        });
      }
    }

    await page.screenshot({ path: 'full-flow-final.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'full-flow-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('\n✅ Full Flow Test Complete!');
  console.log('\n📊 SUMMARY:');
  console.log('The test should show:');
  console.log('1. Whether date inputs appear after filling origin/destination');
  console.log('2. Whether they use grid-cols-2 layout correctly');
  console.log('3. How they display on both mobile (390px) and desktop (1280px)');
  console.log('4. Any CSS issues with the side-by-side layout');
}

testFlightDatesFullFlow().catch(console.error);