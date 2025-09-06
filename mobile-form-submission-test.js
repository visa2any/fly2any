const { chromium } = require('playwright');

async function testMobileFormSubmission() {
  console.log('🚀 Starting Mobile Form Submission Tests...\n');

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
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  page.on('requestfailed', request => {
    networkErrors.push(`Network Error: ${request.url()} - ${request.failure()?.errorText}`);
    console.log(`🌐 Network Error: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('📱 Navigating to mobile site...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Test each service form
    const services = [
      { name: 'Passagens Aéreas', selector: '[data-service="flights"]' },
      { name: 'Hotéis', selector: '[data-service="hotels"]' },
      { name: 'Aluguel de Carros', selector: '[data-service="cars"]' },
      { name: 'Pacotes de Viagem', selector: '[data-service="tours"]' },
      { name: 'Seguro Viagem', selector: '[data-service="insurance"]' }
    ];

    for (const service of services) {
      console.log(`\n🔍 Testing ${service.name} Form Submission...`);
      
      try {
        // Click on the service card
        await page.click(service.selector);
        await page.waitForTimeout(2000);
        
        // Fill out form fields (basic test data)
        await fillFormFields(page, service.name);
        
        // Submit form
        console.log(`📤 Submitting ${service.name} form...`);
        const submitButton = await page.locator('button[type="submit"], button:has-text("Enviar"), button:has-text("Buscar")').first();
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          // Check for success modal or error messages
          await checkModalBehavior(page, service.name);
        } else {
          console.log(`⚠️ Submit button not found for ${service.name}`);
        }
        
        // Go back to main page for next test
        await page.goBack();
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Error testing ${service.name}: ${error.message}`);
        errors.push(`${service.name} Test Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ General Test Error: ${error.message}`);
    errors.push(`General Error: ${error.message}`);
  }

  // Generate test report
  console.log('\n📊 Test Report Generated:');
  const report = {
    timestamp: new Date().toISOString(),
    errors: errors,
    networkErrors: networkErrors,
    testCompleted: true,
    recommendations: []
  };

  if (errors.length > 0) {
    report.recommendations.push('Fix console errors found during form submission');
  }
  if (networkErrors.length > 0) {
    report.recommendations.push('Investigate network request failures');
  }

  // Save test report
  const fs = require('fs');
  fs.writeFileSync('mobile-form-test-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Report saved to mobile-form-test-report.json');

  await browser.close();
  return report;
}

async function fillFormFields(page, serviceName) {
  console.log(`📝 Filling form fields for ${serviceName}...`);
  
  try {
    // Common fields that might exist
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    if (await emailField.isVisible({ timeout: 1000 })) {
      await emailField.fill('test@example.com');
    }
    
    const phoneField = page.locator('input[type="tel"], input[name*="phone"], input[name*="telefone"]').first();
    if (await phoneField.isVisible({ timeout: 1000 })) {
      await phoneField.fill('+55 (11) 99999-9999');
    }
    
    const nameField = page.locator('input[name*="name"], input[name*="nome"]').first();
    if (await nameField.isVisible({ timeout: 1000 })) {
      await nameField.fill('Test User');
    }

    // Service-specific fields
    if (serviceName === 'Passagens Aéreas') {
      const originField = page.locator('input[placeholder*="origem"], input[placeholder*="partida"]').first();
      if (await originField.isVisible({ timeout: 1000 })) {
        await originField.fill('São Paulo');
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
      
      const destField = page.locator('input[placeholder*="destino"]').first();
      if (await destField.isVisible({ timeout: 1000 })) {
        await destField.fill('Rio de Janeiro');
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
    }

    if (serviceName === 'Hotéis') {
      const cityField = page.locator('input[placeholder*="cidade"], input[placeholder*="destino"]').first();
      if (await cityField.isVisible({ timeout: 1000 })) {
        await cityField.fill('São Paulo');
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
    }
    
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.log(`⚠️ Error filling fields: ${error.message}`);
  }
}

async function checkModalBehavior(page, serviceName) {
  console.log(`🔍 Checking modal behavior for ${serviceName}...`);
  
  try {
    // Wait for any modal or response
    await page.waitForTimeout(2000);
    
    // Check for success modal
    const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
    const isModalVisible = await modal.isVisible();
    
    if (isModalVisible) {
      console.log(`✅ Modal appeared for ${serviceName}`);
      
      // Check modal size and positioning
      const modalBox = await modal.boundingBox();
      const viewport = page.viewportSize();
      
      if (modalBox) {
        const coveragePercent = ((modalBox.width * modalBox.height) / (viewport.width * viewport.height)) * 100;
        console.log(`📏 Modal covers ${coveragePercent.toFixed(1)}% of screen`);
        
        if (coveragePercent > 80) {
          console.log(`⚠️ Modal covers too much of the screen (${coveragePercent.toFixed(1)}%)`);
        }
      }
      
      // Check for error messages above modal
      const errorMessages = page.locator('.error, [class*="error"], [role="alert"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        console.log(`❌ Found ${errorCount} error message(s) on screen`);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log(`   Error ${i + 1}: ${errorText}`);
        }
      }
      
      // Take screenshot of modal
      await page.screenshot({ 
        path: `mobile-modal-${serviceName.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
      
      // Try to close modal
      const closeBtn = page.locator('button:has-text("Fechar"), button:has-text("×"), [aria-label="Close"]');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
      
    } else {
      console.log(`⚠️ No modal found for ${serviceName}`);
      
      // Check for inline success/error messages
      const successMsg = page.locator('[class*="success"], .success-message');
      const errorMsg = page.locator('[class*="error"], .error-message');
      
      if (await successMsg.isVisible()) {
        const text = await successMsg.textContent();
        console.log(`✅ Success message: ${text}`);
      }
      
      if (await errorMsg.isVisible()) {
        const text = await errorMsg.textContent();
        console.log(`❌ Error message: ${text}`);
      }
    }
    
  } catch (error) {
    console.log(`⚠️ Error checking modal: ${error.message}`);
  }
}

// Run the test
testMobileFormSubmission()
  .then(report => {
    console.log('\n✨ Mobile Form Submission Test Completed!');
    console.log(`📊 Total Errors Found: ${report.errors.length}`);
    console.log(`🌐 Network Errors: ${report.networkErrors.length}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });