const { chromium } = require('playwright');

async function testStepNavigation() {
  console.log('🚀 Testing step navigation fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    console.log('✅ Page loaded');
    
    // Look for service selection checkboxes/buttons
    const serviceButtons = page.locator('[type="checkbox"], button:has-text("Passagens"), button:has-text("Hotel")');
    const serviceCount = await serviceButtons.count();
    
    if (serviceCount > 0) {
      console.log(`📋 Found ${serviceCount} service options`);
      
      // Select first service
      await serviceButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Look for Continue button in step 1
      const continueButton = page.locator('button:has-text("Continuar"), button:has-text("Continue")');
      const continueCount = await continueButton.count();
      
      if (continueCount > 0) {
        console.log('✅ Found Continue button in step 1');
        
        // Click Continue - should go to step 2, not submit form
        await continueButton.first().click();
        await page.waitForTimeout(2000);
        
        // Check if we're in step 2 (service details)
        const step2Indicators = await page.locator('text="Detalhes", text="Origem", text="Destino"').count();
        
        if (step2Indicators > 0) {
          console.log('✅ Successfully navigated to Step 2 (Service Details)');
          
          // Fill some basic service details
          const origemField = page.locator('input[placeholder*="origem"], input[placeholder*="Origem"]');
          if (await origemField.count() > 0) {
            await origemField.first().fill('São Paulo');
            console.log('✅ Filled origem field');
          }
          
          const destinoField = page.locator('input[placeholder*="destino"], input[placeholder*="Destino"]');
          if (await destinoField.count() > 0) {
            await destinoField.first().fill('Rio de Janeiro');
            console.log('✅ Filled destino field');
          }
          
          // Look for Continue button in step 2
          const step2Continue = page.locator('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Próximo")');
          const step2ContinueCount = await step2Continue.count();
          
          if (step2ContinueCount > 0) {
            console.log('✅ Found Continue button in step 2');
            
            // Click Continue - should go to step 3 (personal info), not step 1
            await step2Continue.first().click();
            await page.waitForTimeout(2000);
            
            // Check if we're in step 3 (personal information)
            const step3Indicators = await page.locator('text="Seus Dados", text="Nome", text="Email", input[placeholder*="nome"]').count();
            
            if (step3Indicators > 0) {
              console.log('✅ Successfully navigated to Step 3 (Personal Information)');
              console.log('✅ Step navigation fix is working correctly!');
            } else {
              console.log('❌ Failed to navigate to Step 3');
              
              // Check if we're back at step 1 (the bug)
              const backToStep1 = await page.locator('text="Selecione os serviços", input[type="checkbox"]').count();
              if (backToStep1 > 0) {
                console.log('❌ BUG DETECTED: Went back to Step 1 instead of advancing to Step 3');
              }
            }
          } else {
            console.log('❌ No Continue button found in step 2');
          }
        } else {
          console.log('❌ Failed to navigate to Step 2');
        }
      } else {
        console.log('❌ No Continue button found in step 1');
      }
    } else {
      console.log('❌ No service options found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testStepNavigation().catch(console.error);