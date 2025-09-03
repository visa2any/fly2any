const { chromium } = require('playwright');

async function testFlightFormBehavior() {
  console.log('🔍 Testing Flight Form Auto-Advance Behavior...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the main page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('1. ✅ Page loaded successfully');

    // Look for flight option button
    const flightButton = await page.locator('button:has-text("Voos"), button:has-text("✈️")').first();
    await flightButton.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('2. ✅ Flight button found');

    // Click on flights option
    await flightButton.click();
    await page.waitForTimeout(1000);

    console.log('3. ✅ Clicked on flights option');

    // Check if we're on step 2 (Details step)
    const currentStep = await page.locator('[data-testid="current-step"], .current-step, h3:has-text("Configurando")').first();
    await currentStep.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('4. ✅ Now in Details step');

    // Find the origin airport field
    const originField = await page.locator('input[placeholder*="origem"], input[placeholder*="Aeroporto de origem"]').first();
    await originField.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('5. ✅ Origin field found');

    // Start typing in origin field and monitor step changes
    console.log('6. 🔄 Starting to type in origin field...');
    await originField.focus();
    
    // Type character by character and check if step advances
    const testText = 'São Paulo';
    for (let i = 0; i < testText.length; i++) {
      await originField.type(testText[i]);
      await page.waitForTimeout(200);
      
      // Check if step has advanced unexpectedly
      const stepChanged = await page.locator('h3:has-text("Dados Pessoais"), h3:has-text("Personal"), .step-3').count();
      if (stepChanged > 0) {
        console.log(`❌ ISSUE FOUND: Step advanced automatically after typing "${testText.substring(0, i+1)}"`);
        break;
      }
    }

    // Wait for autocomplete dropdown
    await page.waitForTimeout(1000);

    // Check if there are autocomplete suggestions
    const suggestions = await page.locator('[role="listbox"], .autocomplete-dropdown, .airport-suggestions').count();
    if (suggestions > 0) {
      console.log('7. ✅ Autocomplete suggestions appeared');
      
      // Click on first suggestion
      await page.locator('[role="option"], .airport-option, .suggestion-item').first().click();
      await page.waitForTimeout(500);
      
      // Check if step advanced after selection
      const stepAdvanced = await page.locator('h3:has-text("Dados Pessoais"), h3:has-text("Personal"), .step-3').count();
      if (stepAdvanced > 0) {
        console.log('❌ CRITICAL ISSUE: Step advanced automatically after selecting origin airport!');
      } else {
        console.log('8. ✅ Step did not advance after origin selection (correct behavior)');
      }
    }

    // Now test destination field
    const destinationField = await page.locator('input[placeholder*="destino"], input[placeholder*="Aeroporto de destino"]').first();
    if (await destinationField.isVisible()) {
      console.log('9. 🔄 Testing destination field...');
      await destinationField.focus();
      await destinationField.type('Miami');
      await page.waitForTimeout(1000);
      
      // Select destination
      const destSuggestions = await page.locator('[role="option"], .airport-option').count();
      if (destSuggestions > 0) {
        await page.locator('[role="option"], .airport-option').first().click();
        await page.waitForTimeout(500);
        
        // Check if step advanced after destination selection
        const stepAdvancedAfterDest = await page.locator('h3:has-text("Dados Pessoais"), h3:has-text("Personal"), .step-3').count();
        if (stepAdvancedAfterDest > 0) {
          console.log('❌ CRITICAL ISSUE: Step advanced automatically after selecting destination!');
        } else {
          console.log('10. ✅ Step did not advance after destination selection (correct behavior)');
        }
      }
    }

    // Look for Continue button
    const continueButton = await page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("✓")').first();
    if (await continueButton.isVisible()) {
      console.log('11. ✅ Continue button is visible');
      console.log('12. ✅ Form is behaving correctly - waiting for Continue button click');
    } else {
      console.log('11. ❌ Continue button not found - this might be the issue');
    }

    // Take a screenshot for verification
    await page.screenshot({ path: 'flight-form-test-result.png', fullPage: true });
    console.log('13. 📸 Screenshot saved as flight-form-test-result.png');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testFlightFormBehavior().catch(console.error);