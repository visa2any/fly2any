const { chromium } = require('playwright');

async function testCompleteMobileFormFlow() {
  console.log('🚀 Starting Complete Mobile Form Flow Test...\n');

  const browser = await chromium.launch({ 
    headless: false,
    devtools: false 
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });

  const page = await context.newPage();
  
  // Monitor for success/error messages
  const testResults = {
    formOpened: false,
    formSubmitted: false,
    successModalAppeared: false,
    modalCoverage: null,
    modalOptimized: false,
    errors: []
  };
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`📱 Console [${msg.type()}]: ${text}`);
    
    if (text.includes('Lead submitted successfully')) {
      testResults.formSubmitted = true;
    }
  });

  page.on('pageerror', error => {
    testResults.errors.push(`Page Error: ${error.message}`);
    console.log(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('📱 Navigating to mobile site...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'complete-test-step1-initial.png',
      fullPage: true 
    });

    // Test the Voos (Flights) form - most popular service
    console.log('\n🎯 Testing Voos (Flights) Form Flow...');
    
    // Click Voos service button
    const voosButton = page.locator('button:has-text("Voos")').first();
    
    if (await voosButton.isVisible()) {
      console.log('✅ Voos button found and visible');
      await voosButton.click();
      await page.waitForTimeout(2000);
      
      // Check if form opened
      const formVisible = await page.locator('[class*="mobileFormOverlay"], [class*="MobileForm"]').isVisible();
      testResults.formOpened = formVisible;
      console.log(`📊 Form opened: ${formVisible}`);
      
      if (formVisible) {
        // Take screenshot of opened form
        await page.screenshot({ 
          path: 'complete-test-step2-form-opened.png',
          fullPage: true 
        });
        
        // Fill out the form with test data
        console.log('📝 Filling form with test data...');
        
        try {
          // Wait for form to be fully loaded
          await page.waitForTimeout(2000);
          
          // Fill basic fields (these might vary depending on form structure)
          await fillFormField(page, 'input[name*="nome"], input[placeholder*="nome"], input[placeholder*="Name"]', 'João Silva Mobile Test');
          await fillFormField(page, 'input[name*="email"], input[type="email"]', 'joao.mobile@test.com');
          await fillFormField(page, 'input[name*="telefone"], input[type="tel"], input[name*="phone"]', '11999999999');
          
          // Fill flight-specific fields if they exist
          await fillFormField(page, 'input[name*="origem"], input[placeholder*="origem"], input[placeholder*="Origem"]', 'São Paulo');
          await page.waitForTimeout(1000);
          
          await fillFormField(page, 'input[name*="destino"], input[placeholder*="destino"], input[placeholder*="Destino"]', 'Rio de Janeiro');
          await page.waitForTimeout(1000);
          
          console.log('✅ Form filled with test data');
          
          // Take screenshot of filled form
          await page.screenshot({ 
            path: 'complete-test-step3-form-filled.png',
            fullPage: true 
          });
          
          // Find and click submit button
          console.log('📤 Looking for submit button...');
          const submitSelectors = [
            'button:has-text("Enviar")',
            'button:has-text("Solicitar")',
            'button:has-text("Buscar")',
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Cotação")',
            'button:has-text("Orçamento")'
          ];
          
          let submitClicked = false;
          for (const selector of submitSelectors) {
            const submitBtn = page.locator(selector);
            if (await submitBtn.isVisible({ timeout: 1000 })) {
              console.log(`✅ Found submit button: ${selector}`);
              await submitBtn.click();
              submitClicked = true;
              console.log('✅ Submit button clicked');
              break;
            }
          }
          
          if (submitClicked) {
            // Wait for submission and modal
            console.log('⏳ Waiting for form submission and modal...');
            await page.waitForTimeout(5000);
            
            // Check for success modal
            const modalSelectors = [
              '[data-testid="mobile-success-modal"]',
              '.mobile-success-modal',
              '[class*="MobileSuccessModal"]',
              '[role="dialog"]'
            ];
            
            let modalFound = false;
            let modalInfo = null;
            
            for (const selector of modalSelectors) {
              const modal = page.locator(selector);
              if (await modal.isVisible({ timeout: 2000 })) {
                modalFound = true;
                testResults.successModalAppeared = true;
                console.log(`✅ Success modal found: ${selector}`);
                
                // Analyze modal coverage and optimization
                const modalBox = await modal.boundingBox();
                const viewport = page.viewportSize();
                
                if (modalBox && viewport) {
                  const coveragePercent = ((modalBox.width * modalBox.height) / (viewport.width * viewport.height)) * 100;
                  testResults.modalCoverage = coveragePercent;
                  testResults.modalOptimized = coveragePercent < 85; // Consider optimized if less than 85%
                  
                  modalInfo = {
                    coverage: coveragePercent,
                    width: modalBox.width,
                    height: modalBox.height,
                    optimized: coveragePercent < 85
                  };
                  
                  console.log(`📊 Modal Analysis:`);
                  console.log(`   Coverage: ${coveragePercent.toFixed(1)}% of screen`);
                  console.log(`   Dimensions: ${modalBox.width}x${modalBox.height}`);
                  console.log(`   Optimized: ${coveragePercent < 85 ? '✅ YES' : '❌ NO'} (${coveragePercent < 85 ? 'Good' : 'Too large'})`);
                }
                
                // Take screenshot with modal
                await page.screenshot({ 
                  path: 'complete-test-step4-success-modal.png',
                  fullPage: true 
                });
                
                // Check modal content
                const modalText = await modal.textContent();
                const hasSuccessMessage = modalText && (modalText.includes('Sucesso') || modalText.includes('Enviada') || modalText.includes('Obrigado'));
                console.log(`📝 Modal has success message: ${hasSuccessMessage ? '✅ YES' : '❌ NO'}`);
                
                // Try to close modal
                const closeButton = modal.locator('button, [aria-label*="Close"], [aria-label*="Fechar"]').first();
                if (await closeButton.isVisible({ timeout: 1000 })) {
                  await closeButton.click();
                  await page.waitForTimeout(1000);
                  console.log('✅ Modal closed successfully');
                }
                
                break;
              }
            }
            
            if (!modalFound) {
              console.log('⚠️ No success modal found - checking for other success indicators...');
              
              // Check for success toast or other indicators
              const successIndicators = [
                '.success-toast',
                '.success-message',
                '[class*="success"]',
                ':has-text("sucesso")',
                ':has-text("enviado")'
              ];
              
              for (const indicator of successIndicators) {
                if (await page.locator(indicator).isVisible({ timeout: 1000 })) {
                  console.log(`✅ Found success indicator: ${indicator}`);
                  break;
                }
              }
            }
            
            // Final screenshot
            await page.screenshot({ 
              path: 'complete-test-step5-final.png',
              fullPage: true 
            });
            
          } else {
            console.log('❌ No submit button found');
          }
          
        } catch (fillError) {
          console.log(`⚠️ Error filling form: ${fillError.message}`);
          testResults.errors.push(`Form fill error: ${fillError.message}`);
        }
        
      } else {
        console.log('❌ Form did not open after clicking service button');
      }
      
    } else {
      console.log('❌ Voos button not found');
    }

  } catch (error) {
    console.log(`❌ Test Error: ${error.message}`);
    testResults.errors.push(`Test error: ${error.message}`);
  }

  // Generate comprehensive test report
  console.log('\n📊 Complete Mobile Form Flow Test Report:');
  console.log('='.repeat(50));
  
  console.log(`🔍 Form Opening: ${testResults.formOpened ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`📤 Form Submission: ${testResults.formSubmitted ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`🎯 Success Modal: ${testResults.successModalAppeared ? '✅ APPEARED' : '❌ NOT FOUND'}`);
  
  if (testResults.modalCoverage !== null) {
    console.log(`📏 Modal Coverage: ${testResults.modalCoverage.toFixed(1)}% of screen`);
    console.log(`⚡ Mobile Optimized: ${testResults.modalOptimized ? '✅ YES' : '❌ NO'}`);
  }
  
  console.log(`❌ Errors Found: ${testResults.errors.length}`);
  if (testResults.errors.length > 0) {
    testResults.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }
  
  console.log('\n📁 Screenshots saved:');
  console.log('   • complete-test-step1-initial.png');
  console.log('   • complete-test-step2-form-opened.png');
  console.log('   • complete-test-step3-form-filled.png');
  console.log('   • complete-test-step4-success-modal.png');
  console.log('   • complete-test-step5-final.png');
  
  // Save detailed test report
  const fs = require('fs');
  fs.writeFileSync('mobile-form-complete-test-report.json', JSON.stringify(testResults, null, 2));
  console.log('\n📄 Detailed report saved to: mobile-form-complete-test-report.json');
  
  await page.waitForTimeout(3000); // Keep open for inspection
  await browser.close();
  
  return testResults;
}

async function fillFormField(page, selector, value) {
  try {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 2000 })) {
      await field.click();
      await field.fill(value);
      console.log(`✅ Filled field "${selector}" with: ${value}`);
      return true;
    }
  } catch (error) {
    console.log(`⚠️ Could not fill field "${selector}": ${error.message}`);
  }
  return false;
}

// Run the complete test
testCompleteMobileFormFlow()
  .then(results => {
    console.log('\n🎉 Complete Mobile Form Flow Test Finished!');
    
    if (results.formOpened && results.successModalAppeared && results.modalOptimized) {
      console.log('🎯 OVERALL RESULT: ✅ SUCCESS - Mobile form flow is working with optimized modal!');
    } else if (results.formOpened && results.successModalAppeared) {
      console.log('🎯 OVERALL RESULT: ⚠️ PARTIAL - Form works but modal needs optimization');
    } else if (results.formOpened) {
      console.log('🎯 OVERALL RESULT: ⚠️ PARTIAL - Form opens but submission/modal has issues');
    } else {
      console.log('🎯 OVERALL RESULT: ❌ FAILED - Form flow needs fixing');
    }
  })
  .catch(error => {
    console.error('❌ Test completely failed:', error);
  });