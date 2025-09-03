const { chromium } = require('playwright');

console.log('🔍 DEBUGGING FORM VALIDATION');
console.log('=============================\n');

async function debugValidation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();

  try {
    console.log('📱 Loading flight wizard...');
    await page.goto('http://localhost:3001', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const flightCard = await page.$('text=/voos/i');
    if (flightCard) {
      await flightCard.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight wizard opened\n');
    }

    // Check current form state
    console.log('🔍 CHECKING FORM STATE:');
    console.log('========================');
    
    // Check trip type selection
    const selectedTripType = await page.evaluate(() => {
      const selectedButton = document.querySelector('button[class*="border-primary-500"]');
      return selectedButton ? selectedButton.textContent.trim() : 'None';
    });
    console.log(`   Trip type: ${selectedTripType}`);
    
    // Check origin/destination values
    const originValue = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="origem"]');
      return input ? input.value : 'Empty';
    });
    const destValue = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="destino"]');
      return input ? input.value : 'Empty';
    });
    console.log(`   Origin: ${originValue}`);
    console.log(`   Destination: ${destValue}`);
    
    // Check next button state
    const nextButton = await page.$('button:has-text("Próximo")');
    if (nextButton) {
      const isDisabled = await nextButton.evaluate(btn => btn.disabled);
      const buttonText = await nextButton.textContent();
      console.log(`   Next button: "${buttonText}" - ${isDisabled ? 'DISABLED' : 'ENABLED'}`);
    }
    
    console.log('\n🛫 TESTING ONE-WAY SELECTION:');
    console.log('==============================');
    
    // Select One-Way
    const oneWayButton = await page.$('text=/somente ida/i');
    if (oneWayButton) {
      await oneWayButton.click();
      await page.waitForTimeout(1500);
      console.log('   ✅ Selected One-Way');
      
      // Check button state again
      const nextButtonAfter = await page.$('button:has-text("Próximo")');
      if (nextButtonAfter) {
        const isDisabled = await nextButtonAfter.evaluate(btn => btn.disabled);
        console.log(`   Next button after one-way selection: ${isDisabled ? 'DISABLED' : 'ENABLED'}`);
        
        if (isDisabled) {
          console.log('   ⚠️  Next button still disabled - need to fill airports');
          
          // Try filling origin
          const originInput = await page.$('input[placeholder*="origem"]');
          if (originInput) {
            await originInput.fill('SAO');
            await page.waitForTimeout(2000);
            
            // Look for dropdown options
            const options = await page.$$('.autocomplete-dropdown li, .autocomplete-option, [role="option"]');
            console.log(`   Found ${options.length} airport options for origin`);
            
            if (options.length > 0) {
              await options[0].click();
              await page.waitForTimeout(1000);
              console.log('   ✅ Selected origin airport');
            } else {
              console.log('   ❌ No airport options found for origin');
            }
          }
          
          // Try filling destination
          const destInput = await page.$('input[placeholder*="destino"]');
          if (destInput) {
            await destInput.fill('RIO');
            await page.waitForTimeout(2000);
            
            const options = await page.$$('.autocomplete-dropdown li, .autocomplete-option, [role="option"]');
            console.log(`   Found ${options.length} airport options for destination`);
            
            if (options.length > 0) {
              await options[0].click();
              await page.waitForTimeout(1000);
              console.log('   ✅ Selected destination airport');
            } else {
              console.log('   ❌ No airport options found for destination');
            }
          }
          
          // Check validation again
          await page.waitForTimeout(1000);
          const finalButton = await page.$('button:has-text("Próximo")');
          if (finalButton) {
            const isDisabledFinal = await finalButton.evaluate(btn => btn.disabled);
            console.log(`   Final validation: ${isDisabledFinal ? 'STILL DISABLED' : 'NOW ENABLED'}`);
          }
        }
      }
    }
    
    console.log('\n🌐 TESTING MULTI-CITY SELECTION:');
    console.log('=================================');
    
    // Select Multi-City
    const multiCityButton = await page.$('text=/múltiplas cidades/i');
    if (multiCityButton) {
      await multiCityButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Selected Multi-City');
      
      // Check if segments UI appeared
      const segments = await page.$$('text=/trecho \\d+/i');
      console.log(`   Multi-city UI: ${segments.length} segments visible`);
      
      // Check segment inputs
      const segmentInputs = await page.$$('input[placeholder*="aeroporto"], input[placeholder*="Cidade"]');
      console.log(`   Segment inputs: ${segmentInputs.length} inputs found`);
      
      // Check next button for multi-city
      const multiNextButton = await page.$('button:has-text("Próximo")');
      if (multiNextButton) {
        const isDisabled = await multiNextButton.evaluate(btn => btn.disabled);
        console.log(`   Multi-city next button: ${isDisabled ? 'DISABLED' : 'ENABLED'}`);
      }
    }

    // Take debug screenshot
    await page.screenshot({ 
      path: 'validation-debug.png', 
      fullPage: false 
    });
    console.log('\n📸 Debug screenshot saved as validation-debug.png');

  } catch (error) {
    console.log('❌ Error during debugging:', error.message);
  } finally {
    await browser.close();
  }
}

debugValidation().catch(console.error);