const { chromium } = require('playwright');

async function testFlightDatesSimple() {
  console.log('🚀 Starting Simple Flight Date Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    timeout: 60000
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  
  // Set longer timeouts
  page.setDefaultTimeout(60000);
  
  try {
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking homepage screenshot...');
    await page.screenshot({ 
      path: 'flight-dates-1-homepage.png',
      fullPage: true 
    });
    
    console.log('🔍 Looking for flights button...');
    
    // Wait for any loading to complete
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Look for flights service button
    const flightButton = page.locator('button').filter({ hasText: 'Voos' }).first();
    
    if (await flightButton.isVisible({ timeout: 10000 })) {
      console.log('✅ Found flights button, clicking...');
      await flightButton.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 Taking after-click screenshot...');
      await page.screenshot({ 
        path: 'flight-dates-2-after-click.png',
        fullPage: true 
      });
      
      // Look for flight form
      console.log('🔍 Looking for flight form...');
      await page.waitForTimeout(2000);
      
      // Check for any form or step content
      const formVisible = await page.locator('form, .step-content, [data-step], .mobile-flight').first().isVisible({ timeout: 10000 });
      
      if (formVisible) {
        console.log('✅ Flight form found!');
        
        await page.screenshot({ 
          path: 'flight-dates-3-flight-form.png',
          fullPage: true 
        });
        
        // Look specifically for date inputs
        console.log('🔍 Analyzing date inputs...');
        
        const dateInputs = await page.locator('input[type="date"]').count();
        console.log(`Found ${dateInputs} date inputs`);
        
        if (dateInputs > 0) {
          // Check the parent container of date inputs
          const dateContainer = page.locator('input[type="date"]').first().locator('..');
          const containerClass = await dateContainer.getAttribute('class');
          console.log(`Date container class: ${containerClass}`);
          
          // Check if it uses grid-cols-2
          const hasGridCols2 = containerClass?.includes('grid-cols-2');
          console.log(`Uses grid-cols-2: ${hasGridCols2}`);
          
          // Get computed styles
          const styles = await dateContainer.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              display: computed.display,
              gridTemplateColumns: computed.gridTemplateColumns,
              gap: computed.gap
            };
          });
          console.log('Container styles:', styles);
          
          // Take focused screenshot of date section
          await dateContainer.screenshot({ 
            path: 'flight-dates-4-date-section.png' 
          });
        }
        
        // Look for any grid layouts
        const gridElements = await page.locator('[class*="grid"]').count();
        console.log(`Found ${gridElements} elements with grid classes`);
        
        if (gridElements > 0) {
          for (let i = 0; i < Math.min(gridElements, 3); i++) {
            const gridEl = page.locator('[class*="grid"]').nth(i);
            const className = await gridEl.getAttribute('class');
            const isVisible = await gridEl.isVisible();
            console.log(`Grid element ${i + 1}: ${className}, visible: ${isVisible}`);
            
            if (isVisible && className?.includes('grid-cols-2')) {
              console.log('📸 Taking screenshot of grid-cols-2 element...');
              await gridEl.screenshot({ 
                path: `flight-dates-grid-${i + 1}.png` 
              });
            }
          }
        }
        
      } else {
        console.log('❌ Flight form not found');
      }
      
    } else {
      console.log('❌ Flights button not found');
      
      // Debug: show all buttons
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons:`);
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].textContent();
        console.log(`  Button ${i + 1}: "${text}"`);
      }
    }
    
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ 
      path: 'flight-dates-final.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ 
      path: 'flight-dates-error.png',
      fullPage: true 
    });
  }
  
  await browser.close();
  console.log('✅ Test complete!');
}

testFlightDatesSimple().catch(console.error);