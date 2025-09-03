const { chromium } = require('playwright');

async function testMobileFlightDates() {
  console.log('🚀 Starting Mobile Flight Form Date Layout Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  try {
    // Test both mobile and desktop viewports
    const viewports = [
      { name: 'Mobile iPhone 12', width: 390, height: 844 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent: viewport.width < 768 ? 
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' :
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Enable console logging
      page.on('console', msg => console.log(`Console [${viewport.name}]:`, msg.text()));
      page.on('pageerror', error => console.error(`Page Error [${viewport.name}]:`, error));
      
      try {
        // Step 1: Navigate to localhost:3000
        console.log('📍 Step 1: Navigating to localhost:3000...');
        await page.goto('http://localhost:3000', { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });
        
        // Take screenshot of homepage
        await page.screenshot({ 
          path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-1-homepage.png`,
          fullPage: true 
        });
        console.log(`✅ Homepage loaded for ${viewport.name}`);
        
        // Wait for any hydration or loading to complete
        await page.waitForTimeout(2000);
        
        // Step 2: Look for and click the "Voos" (flights) service
        console.log('📍 Step 2: Looking for "Voos" service button...');
        
        // Try multiple selectors for the flights button
        const flightSelectors = [
          'button:has-text("Voos")',
          'button:has-text("✈️")',
          '[data-service="flights"]',
          '.service-button:has-text("Voos")',
          'button[aria-label*="Voo"]',
          'button[title*="Voo"]'
        ];
        
        let flightButton = null;
        for (const selector of flightSelectors) {
          try {
            flightButton = await page.locator(selector).first();
            if (await flightButton.isVisible()) {
              console.log(`✅ Found flights button with selector: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!flightButton || !await flightButton.isVisible()) {
          console.log('⚠️ Flight button not found, taking screenshot for debugging...');
          await page.screenshot({ 
            path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-debug-no-flight-button.png`,
            fullPage: true 
          });
          
          // Get all buttons for debugging
          const allButtons = await page.locator('button').all();
          console.log(`Found ${allButtons.length} buttons on page:`);
          for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
            const text = await allButtons[i].textContent();
            console.log(`  Button ${i + 1}: "${text}"`);
          }
          continue;
        }
        
        // Click the flights button
        console.log('🖱️ Clicking flights service...');
        await flightButton.click();
        await page.waitForTimeout(1500);
        
        // Take screenshot after clicking flights
        await page.screenshot({ 
          path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-2-flights-clicked.png`,
          fullPage: true 
        });
        
        // Step 3: Look for MobileFlightWizard or flight form
        console.log('📍 Step 3: Looking for MobileFlightWizard form...');
        
        // Wait for the flight form to appear
        const formSelectors = [
          '.mobile-flight-wizard',
          '.flight-form',
          '[data-step="1"]',
          'form:has-text("viagem")',
          '.step-content:has-text("Detalhes")'
        ];
        
        let formFound = false;
        for (const selector of formSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            console.log(`✅ Flight form found with selector: ${selector}`);
            formFound = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!formFound) {
          console.log('⚠️ Flight form not found, taking screenshot...');
          await page.screenshot({ 
            path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-debug-no-form.png`,
            fullPage: true 
          });
          continue;
        }
        
        // Step 4: Focus on Step 1 - "Detalhes da viagem"
        console.log('📍 Step 4: Examining Step 1 - Date inputs section...');
        
        // Take screenshot of the flight form
        await page.screenshot({ 
          path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-3-flight-form.png`,
          fullPage: true 
        });
        
        // Look for date inputs specifically
        console.log('🔍 Analyzing date inputs layout...');
        
        // Check for date-related elements
        const dateSelectors = [
          'input[type="date"]',
          'input[placeholder*="ida"]',
          'input[placeholder*="volta"]',
          '.date-input',
          '.grid-cols-2',
          '[class*="grid"]'
        ];
        
        const dateElements = [];
        for (const selector of dateSelectors) {
          try {
            const elements = await page.locator(selector).all();
            if (elements.length > 0) {
              console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
              for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const isVisible = await element.isVisible();
                const text = await element.textContent();
                const placeholder = await element.getAttribute('placeholder');
                const className = await element.getAttribute('class');
                
                dateElements.push({
                  selector,
                  index: i,
                  visible: isVisible,
                  text: text || '',
                  placeholder: placeholder || '',
                  className: className || ''
                });
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        console.log('\n📋 Date Elements Found:');
        dateElements.forEach((el, i) => {
          console.log(`  ${i + 1}. ${el.selector}[${el.index}]:`);
          console.log(`     Visible: ${el.visible}`);
          console.log(`     Text: "${el.text}"`);
          console.log(`     Placeholder: "${el.placeholder}"`);
          console.log(`     Classes: "${el.className}"`);
        });
        
        // Check CSS Grid layout specifically
        console.log('\n🎨 Checking CSS Grid Layout...');
        
        // Look for grid containers
        const gridContainers = await page.locator('[class*="grid"]').all();
        console.log(`Found ${gridContainers.length} potential grid containers`);
        
        for (let i = 0; i < gridContainers.length; i++) {
          const container = gridContainers[i];
          const className = await container.getAttribute('class');
          const isVisible = await container.isVisible();
          
          if (isVisible && (className?.includes('grid-cols-2') || className?.includes('grid'))) {
            console.log(`  Grid Container ${i + 1}: ${className}`);
            
            // Get computed styles
            const styles = await container.evaluate((el) => {
              const computed = window.getComputedStyle(el);
              return {
                display: computed.display,
                gridTemplateColumns: computed.gridTemplateColumns,
                gap: computed.gap,
                width: computed.width,
                flexDirection: computed.flexDirection
              };
            });
            
            console.log(`     Computed styles:`, styles);
            
            // Check children
            const children = await container.locator('> *').all();
            console.log(`     Children count: ${children.length}`);
            
            for (let j = 0; j < Math.min(children.length, 4); j++) {
              const child = children[j];
              const childText = await child.textContent();
              const childClass = await child.getAttribute('class');
              console.log(`       Child ${j + 1}: "${childText}" (class: ${childClass})`);
            }
          }
        }
        
        // Take a focused screenshot of the dates section
        try {
          const dateSection = page.locator('.grid-cols-2, [class*="grid"]:has(input[type="date"]), .date-input').first();
          if (await dateSection.isVisible()) {
            await dateSection.screenshot({ 
              path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-4-dates-section.png` 
            });
            console.log('✅ Date section screenshot captured');
          }
        } catch (e) {
          console.log('⚠️ Could not capture date section screenshot');
        }
        
        // Final full page screenshot
        await page.screenshot({ 
          path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-5-final-state.png`,
          fullPage: true 
        });
        
      } catch (error) {
        console.error(`❌ Error during ${viewport.name} test:`, error.message);
        await page.screenshot({ 
          path: `flight-test-${viewport.name.toLowerCase().replace(' ', '-')}-error.png`,
          fullPage: true 
        });
      }
      
      await context.close();
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Mobile Flight Form Date Test Complete!');
    console.log('\n📸 Screenshots saved:');
    console.log('   - *-1-homepage.png - Initial homepage');
    console.log('   - *-2-flights-clicked.png - After clicking flights');
    console.log('   - *-3-flight-form.png - Flight form loaded');
    console.log('   - *-4-dates-section.png - Focused on dates');
    console.log('   - *-5-final-state.png - Final state');
    console.log('   - *-debug-*.png - Any debug screenshots');
  }
}

testMobileFlightDates().catch(console.error);