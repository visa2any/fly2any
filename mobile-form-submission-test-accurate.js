const { chromium } = require('playwright');

async function testMobileFormSubmissionAccurate() {
  console.log('🚀 Starting Accurate Mobile Form Submission Tests...\n');

  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });

  const context = await browser.newContext({
    // iPhone 12 Pro viewport
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });

  const page = await context.newPage();
  
  // Monitor console errors and network failures
  const errors = [];
  const networkErrors = [];
  const submissions = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
      console.log(`❌ Console Error: ${msg.text()}`);
    }
    if (msg.type() === 'log' && msg.text().includes('ULTRATHINK')) {
      console.log(`🔍 Debug: ${msg.text()}`);
    }
  });

  page.on('requestfailed', request => {
    networkErrors.push(`Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    console.log(`🌐 Network Error: ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Monitor network requests to catch API calls
  page.on('request', request => {
    if (request.url().includes('/api/') || request.method() === 'POST') {
      console.log(`📡 API Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/') || response.status() >= 400) {
      console.log(`📨 API Response: ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        errors.push(`API Error: ${response.status()} ${response.url()}`);
      }
    }
  });

  try {
    console.log('📱 Navigating to mobile site...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Test each service form based on the actual structure
    const services = [
      { name: 'Voos', key: 'voos', buttonText: 'Voos' },
      { name: 'Hotéis', key: 'hoteis', buttonText: 'Hotéis' },
      { name: 'Carros', key: 'carros', buttonText: 'Carros' },
      { name: 'Tours', key: 'passeios', buttonText: 'Tours' },
      { name: 'Seguro Viagem', key: 'seguro', buttonText: 'Seguro Viagem' }
    ];

    for (const service of services) {
      console.log(`\n🔍 Testing ${service.name} Form Submission...`);
      
      try {
        // Take screenshot before clicking
        await page.screenshot({ 
          path: `mobile-before-${service.key}.png`,
          fullPage: true 
        });
        
        // Click on the service button using the service text
        console.log(`👆 Clicking on ${service.buttonText} button...`);
        const serviceButton = page.locator(`button:has-text("${service.buttonText}")`).first();
        
        if (await serviceButton.isVisible()) {
          await serviceButton.click();
          await page.waitForTimeout(3000);
          
          // Take screenshot after service selection
          await page.screenshot({ 
            path: `mobile-after-click-${service.key}.png`,
            fullPage: true 
          });
          
          // Wait for the form overlay to appear
          const formOverlay = page.locator('[data-testid="mobile-lead-form-overlay"]');
          const overlayVisible = await formOverlay.isVisible({ timeout: 5000 });
          
          if (overlayVisible) {
            console.log(`✅ Form overlay appeared for ${service.name}`);
            
            // Fill out the form
            await fillFormFieldsAccurate(page, service);
            
            // Look for submit button and submit
            console.log(`📤 Looking for submit button...`);
            const submitButtons = [
              'button:has-text("Enviar")',
              'button:has-text("Buscar")',
              'button:has-text("Solicitar")',
              'button[type="submit"]',
              'input[type="submit"]'
            ];
            
            let submitClicked = false;
            for (const selector of submitButtons) {
              const submitBtn = page.locator(selector);
              if (await submitBtn.isVisible({ timeout: 1000 })) {
                console.log(`📤 Found submit button: ${selector}`);
                
                // Take screenshot before submit
                await page.screenshot({ 
                  path: `mobile-before-submit-${service.key}.png`,
                  fullPage: true 
                });
                
                await submitBtn.click();
                submitClicked = true;
                
                // Record submission attempt
                submissions.push({
                  service: service.name,
                  timestamp: new Date().toISOString(),
                  status: 'attempted'
                });
                
                console.log(`✅ Submit button clicked for ${service.name}`);
                break;
              }
            }
            
            if (!submitClicked) {
              console.log(`⚠️ No submit button found for ${service.name}`);
            }
            
            // Wait and check for response
            await page.waitForTimeout(5000);
            
            // Check for success modal or error messages
            await checkModalAndErrorBehavior(page, service);
            
            // Take screenshot after submit
            await page.screenshot({ 
              path: `mobile-after-submit-${service.key}.png`,
              fullPage: true 
            });
            
          } else {
            console.log(`❌ Form overlay did not appear for ${service.name}`);
          }
          
        } else {
          console.log(`⚠️ Service button not found for ${service.name}`);
        }
        
        // Try to go back to home - close any open forms
        console.log(`🔙 Returning to home for next test...`);
        const backButton = page.locator('[aria-label*="Voltar"], button:has-text("×"), [aria-label="Close"]').first();
        if (await backButton.isVisible({ timeout: 2000 })) {
          await backButton.click();
          await page.waitForTimeout(2000);
        } else {
          // If no back button, refresh the page
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
        }
        
      } catch (error) {
        console.log(`❌ Error testing ${service.name}: ${error.message}`);
        errors.push(`${service.name} Test Error: ${error.message}`);
        
        // Try to recover by refreshing
        try {
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
        } catch (recoveryError) {
          console.log(`❌ Recovery failed: ${recoveryError.message}`);
        }
      }
    }

  } catch (error) {
    console.log(`❌ General Test Error: ${error.message}`);
    errors.push(`General Error: ${error.message}`);
  }

  // Generate comprehensive test report
  console.log('\n📊 Comprehensive Test Report Generated:');
  const report = {
    timestamp: new Date().toISOString(),
    errors: errors,
    networkErrors: networkErrors,
    submissions: submissions,
    testCompleted: true,
    modalIssues: [],
    recommendations: []
  };

  if (errors.length > 0) {
    report.recommendations.push('Fix console errors and API errors found during form submission');
    report.recommendations.push('Investigate form validation and submission endpoints');
  }
  if (networkErrors.length > 0) {
    report.recommendations.push('Investigate network request failures');
  }
  if (submissions.length === 0) {
    report.recommendations.push('No forms were successfully submitted - check form structure');
  }

  // Save comprehensive test report
  const fs = require('fs');
  fs.writeFileSync('mobile-form-submission-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Comprehensive report saved to mobile-form-submission-report.json');

  await browser.close();
  return report;
}

async function fillFormFieldsAccurate(page, service) {
  console.log(`📝 Filling form fields for ${service.name}...`);
  
  try {
    // Wait a moment for form to load
    await page.waitForTimeout(2000);
    
    // Common fields that might exist
    const emailSelectors = [
      'input[type="email"]',
      'input[name*="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="e-mail"]'
    ];
    
    for (const selector of emailSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 })) {
        await field.fill('test@fly2any.com');
        console.log(`✅ Filled email field with: test@fly2any.com`);
        break;
      }
    }
    
    const phoneSelectors = [
      'input[type="tel"]',
      'input[name*="phone"]',
      'input[name*="telefone"]',
      'input[placeholder*="telefone"]',
      'input[placeholder*="phone"]'
    ];
    
    for (const selector of phoneSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 })) {
        await field.click();
        await page.waitForTimeout(500);
        await field.fill('11999999999');
        console.log(`✅ Filled phone field with: 11999999999`);
        break;
      }
    }
    
    const nameSelectors = [
      'input[name*="name"]',
      'input[name*="nome"]',
      'input[placeholder*="nome"]',
      'input[placeholder*="name"]'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 })) {
        await field.fill('Test User Fly2Any');
        console.log(`✅ Filled name field with: Test User Fly2Any`);
        break;
      }
    }

    // Service-specific fields based on the service type
    if (service.key === 'voos') {
      await fillCityField(page, 'origem', 'São Paulo');
      await fillCityField(page, 'destino', 'Rio de Janeiro');
    }

    if (service.key === 'hoteis') {
      await fillCityField(page, 'cidade', 'São Paulo');
      await fillCityField(page, 'destino', 'São Paulo');
    }

    if (service.key === 'carros') {
      await fillCityField(page, 'local', 'São Paulo');
      await fillCityField(page, 'cidade', 'São Paulo');
    }

    if (service.key === 'passeios') {
      await fillCityField(page, 'destino', 'Bahia');
      await fillCityField(page, 'cidade', 'Salvador');
    }

    if (service.key === 'seguro') {
      await fillCityField(page, 'destino', 'Europa');
    }
    
    await page.waitForTimeout(1000);
    console.log(`✅ Completed filling fields for ${service.name}`);
    
  } catch (error) {
    console.log(`⚠️ Error filling fields for ${service.name}: ${error.message}`);
  }
}

async function fillCityField(page, fieldType, cityValue) {
  const citySelectors = [
    `input[placeholder*="${fieldType}"]`,
    `input[name*="${fieldType}"]`,
    `input[aria-label*="${fieldType}"]`
  ];
  
  for (const selector of citySelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 })) {
      await field.click();
      await page.waitForTimeout(300);
      await field.fill(cityValue);
      console.log(`✅ Filled ${fieldType} field with: ${cityValue}`);
      
      // Wait for autocomplete and try to select first option
      await page.waitForTimeout(1000);
      try {
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible({ timeout: 1000 })) {
          await firstOption.click();
          console.log(`✅ Selected autocomplete option for ${fieldType}`);
        }
      } catch (autocompleteError) {
        // Autocomplete might not be available, that's ok
        console.log(`⚠️ No autocomplete for ${fieldType}, using typed value`);
      }
      break;
    }
  }
}

async function checkModalAndErrorBehavior(page, service) {
  console.log(`🔍 Checking modal and error behavior for ${service.name}...`);
  
  try {
    await page.waitForTimeout(3000);
    
    // Check for success modal
    const modalSelectors = [
      '[role="dialog"]',
      '.modal',
      '[data-testid*="modal"]',
      '[class*="modal"]',
      '.success-modal',
      '.confirmation-modal'
    ];
    
    let modalFound = false;
    let modalInfo = null;
    
    for (const selector of modalSelectors) {
      const modal = page.locator(selector);
      if (await modal.isVisible({ timeout: 1000 })) {
        modalFound = true;
        console.log(`✅ Modal found with selector: ${selector}`);
        
        // Check modal size and positioning
        const modalBox = await modal.boundingBox();
        const viewport = page.viewportSize();
        
        if (modalBox) {
          const coveragePercent = ((modalBox.width * modalBox.height) / (viewport.width * viewport.height)) * 100;
          modalInfo = {
            selector: selector,
            coverage: coveragePercent,
            width: modalBox.width,
            height: modalBox.height,
            x: modalBox.x,
            y: modalBox.y
          };
          
          console.log(`📏 Modal covers ${coveragePercent.toFixed(1)}% of screen`);
          console.log(`📐 Modal size: ${modalBox.width}x${modalBox.height} at (${modalBox.x}, ${modalBox.y})`);
          
          if (coveragePercent > 85) {
            console.log(`⚠️ ISSUE: Modal covers too much of the screen (${coveragePercent.toFixed(1)}%)`);
          }
        }
        break;
      }
    }
    
    if (!modalFound) {
      console.log(`⚠️ No modal found for ${service.name}`);
    }
    
    // Check for error messages anywhere on the page
    const errorSelectors = [
      '.error',
      '[class*="error"]',
      '[role="alert"]',
      '.alert-error',
      '.text-red-500',
      '.text-red-600',
      '.text-danger',
      '[data-testid*="error"]'
    ];
    
    let errorsFound = [];
    for (const selector of errorSelectors) {
      const errorElements = page.locator(selector);
      const count = await errorElements.count();
      
      for (let i = 0; i < count; i++) {
        const errorElement = errorElements.nth(i);
        if (await errorElement.isVisible({ timeout: 500 })) {
          const errorText = await errorElement.textContent();
          const errorBox = await errorElement.boundingBox();
          
          if (errorText && errorText.trim()) {
            errorsFound.push({
              selector: selector,
              text: errorText.trim(),
              position: errorBox
            });
            console.log(`❌ Error found: "${errorText.trim()}" (${selector})`);
            
            if (modalInfo && errorBox) {
              // Check if error is above modal
              if (errorBox.y < modalInfo.y) {
                console.log(`⚠️ ISSUE: Error message appears ABOVE modal`);
              }
            }
          }
        }
      }
    }
    
    if (errorsFound.length === 0) {
      console.log(`✅ No error messages found for ${service.name}`);
    } else {
      console.log(`❌ Found ${errorsFound.length} error message(s) for ${service.name}`);
    }
    
    // Check for success messages
    const successSelectors = [
      '.success',
      '[class*="success"]',
      '.alert-success',
      '.text-green-500',
      '.text-green-600',
      '.text-success',
      '[data-testid*="success"]'
    ];
    
    for (const selector of successSelectors) {
      const successElements = page.locator(selector);
      const count = await successElements.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const successElement = successElements.nth(i);
          if (await successElement.isVisible({ timeout: 500 })) {
            const successText = await successElement.textContent();
            if (successText && successText.trim()) {
              console.log(`✅ Success message: "${successText.trim()}"`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.log(`⚠️ Error checking modal behavior: ${error.message}`);
  }
}

// Run the accurate test
testMobileFormSubmissionAccurate()
  .then(report => {
    console.log('\n✨ Accurate Mobile Form Submission Test Completed!');
    console.log(`📊 Total Errors Found: ${report.errors.length}`);
    console.log(`🌐 Network Errors: ${report.networkErrors.length}`);
    console.log(`📤 Submission Attempts: ${report.submissions.length}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
    
    console.log('\n🔍 Next Steps:');
    console.log('   1. Check mobile-form-submission-report.json for detailed results');
    console.log('   2. Review screenshot files for visual issues');
    console.log('   3. Address modal coverage and error positioning issues');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });