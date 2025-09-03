const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Lead Form Test on Fly2Any Homepage...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📍 Step 1: Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'homepage-initial.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot taken: homepage-initial.png');
    
    console.log('📍 Step 2: Looking for Lead Form trigger buttons...');
    
    // Look for common button text patterns that might open the Lead Form
    const buttonSelectors = [
      'text="Solicitar Cotação"',
      'text="Cotação Grátis"', 
      'text="Orçamento"',
      'text="Cotação"',
      'text="Solicite"',
      '[data-testid="lead-form-trigger"]',
      '.lead-capture-button',
      '.cta-button',
      'button:has-text("Cotação")',
      'button:has-text("Solicitar")',
      'button:has-text("Orçamento")'
    ];
    
    let triggerButton = null;
    let buttonText = '';
    
    for (const selector of buttonSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          triggerButton = element;
          buttonText = await element.textContent();
          console.log(`✅ Found Lead Form trigger: "${buttonText}" with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!triggerButton) {
      console.log('❌ No Lead Form trigger button found. Looking for any visible buttons...');
      
      // Get all visible buttons
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons on the page`);
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        try {
          const text = await allButtons[i].textContent();
          console.log(`Button ${i+1}: "${text}"`);
        } catch (e) {
          console.log(`Button ${i+1}: [Could not get text]`);
        }
      }
      
      await page.screenshot({ path: 'no-trigger-found.png', fullPage: true });
      console.log('📸 Screenshot taken: no-trigger-found.png');
    } else {
      console.log('📍 Step 3: Clicking the Lead Form trigger...');
      
      // Click the trigger button
      await triggerButton.click();
      
      // Wait a bit for the form to appear
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'after-trigger-click.png', 
        fullPage: true 
      });
      console.log('📸 Screenshot taken: after-trigger-click.png');
      
      console.log('📍 Step 4: Looking for airport input field...');
      
      // Look for airport input field with various selectors
      const airportSelectors = [
        'input[placeholder*="Origem"]',
        'input[placeholder*="origem"]', 
        'input[placeholder*="Saída"]',
        'input[placeholder*="saída"]',
        'input[placeholder*="De onde"]',
        'input[placeholder*="Partida"]',
        'input[placeholder*="partida"]',
        'input[name*="origem"]',
        'input[name*="origin"]',
        'input[name*="departure"]',
        '[data-testid="origin-input"]',
        '[data-testid="departure-input"]',
        '.airport-input',
        '.origin-input'
      ];
      
      let airportInput = null;
      let inputSelector = '';
      
      for (const selector of airportSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            airportInput = element;
            inputSelector = selector;
            console.log(`✅ Found airport input field with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!airportInput) {
        console.log('❌ No airport input field found. Looking for any input fields...');
        
        // Get all visible input fields
        const allInputs = await page.locator('input').all();
        console.log(`Found ${allInputs.length} input fields`);
        
        for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
          try {
            const placeholder = await allInputs[i].getAttribute('placeholder');
            const name = await allInputs[i].getAttribute('name');
            const type = await allInputs[i].getAttribute('type');
            console.log(`Input ${i+1}: placeholder="${placeholder}" name="${name}" type="${type}"`);
          } catch (e) {
            console.log(`Input ${i+1}: [Could not get attributes]`);
          }
        }
        
        await page.screenshot({ path: 'no-airport-input-found.png', fullPage: true });
        console.log('📸 Screenshot taken: no-airport-input-found.png');
      } else {
        console.log('📍 Step 5: Testing airport search with "New York"...');
        
        // Focus and clear the input
        await airportInput.focus();
        await airportInput.fill('');
        
        // Type "New York" character by character
        await airportInput.type('New York', { delay: 100 });
        
        console.log('✅ Typed "New York" in the airport input field');
        
        // Wait for potential dropdown/autocomplete results
        await page.waitForTimeout(3000);
        
        console.log('📍 Step 6: Checking for dropdown results...');
        
        // Look for dropdown/autocomplete results
        const dropdownSelectors = [
          '.airport-dropdown',
          '.autocomplete-dropdown',
          '.search-results',
          '.dropdown-menu',
          '[role="listbox"]',
          '[role="menu"]',
          '.suggestions',
          'ul li',
          '.airport-option',
          '.search-option'
        ];
        
        let foundDropdown = false;
        let dropdownResults = [];
        
        for (const selector of dropdownSelectors) {
          try {
            const elements = await page.locator(selector).all();
            if (elements.length > 0) {
              console.log(`✅ Found ${elements.length} dropdown elements with selector: ${selector}`);
              
              for (let i = 0; i < Math.min(elements.length, 5); i++) {
                try {
                  const text = await elements[i].textContent();
                  if (text && text.trim() && text.toLowerCase().includes('new york')) {
                    dropdownResults.push(text.trim());
                    foundDropdown = true;
                  }
                } catch (e) {
                  // Skip this element
                }
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        // Take final screenshot
        await page.screenshot({ 
          path: 'airport-search-results.png', 
          fullPage: true 
        });
        console.log('📸 Screenshot taken: airport-search-results.png');
        
        // Report results
        console.log('\n=== LEAD FORM TEST RESULTS ===');
        console.log(`✅ Lead Form trigger found: "${buttonText}"`);
        console.log(`✅ Airport input field found: ${inputSelector}`);
        console.log(`✅ Successfully typed "New York" in airport field`);
        
        if (foundDropdown && dropdownResults.length > 0) {
          console.log(`✅ AIRPORT SEARCH IS WORKING! Found ${dropdownResults.length} results:`);
          dropdownResults.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result}`);
          });
        } else {
          console.log('❌ AIRPORT SEARCH NOT WORKING - No dropdown results found for "New York"');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot taken: error-screenshot.png');
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
})();