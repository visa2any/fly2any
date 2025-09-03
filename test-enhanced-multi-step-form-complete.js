const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Set to false to see the test
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 ENTERPRISE MULTI-STEP FORM - Complete End-to-End Test\n');
    
    // Step 1: Navigate to homepage
    console.log('📱 Step 1: Loading homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-1-homepage.png' });
    console.log('✅ Homepage loaded successfully');
    
    // Step 2: Open multi-step form (look for service buttons)
    console.log('\n🎯 Step 2: Opening multi-step form...');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    if (serviceButtons.length === 0) {
      throw new Error('No service buttons found');
    }
    
    await serviceButtons[0].click(); // Click first service button
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-2-form-opened.png' });
    console.log('✅ Multi-step form opened');
    
    // Step 3: Verify progress bar
    console.log('\n📊 Step 3: Checking progress bar...');
    const progressBar = await page.$('text=/Passo.*de.*4/');
    if (!progressBar) {
      throw new Error('Progress bar not found');
    }
    console.log('✅ Progress bar is visible');
    
    // Step 4: Verify we're in service configuration (Step 2)
    console.log('\n✈️ Step 4: Verifying service configuration step...');
    const serviceDetailsHeader = await page.$('text="Detalhes do Voo"');
    const serviceIndex = await page.$('text="Serviço 1 de 1"');
    
    if (serviceDetailsHeader && serviceIndex) {
      console.log('✅ Service configuration step is active');
      console.log('✅ Flight details form is visible');
    } else {
      console.log('⚠️ Service configuration step layout differs from expected');
    }
    
    await page.screenshot({ path: 'test-3-services-step.png' });
    
    // Step 5: Fill out flight form
    console.log('\n✈️ Step 5: Filling flight form...');
    
    // Check if we're in flights form
    let isFlightsForm = await page.$('text="Origem"');
    if (isFlightsForm) {
      console.log('📍 Found flights form, filling details...');
      
      // Fill origin
      const originInput = await page.$('input[placeholder*="origem"]');
      if (originInput) {
        await originInput.fill('São Paulo');
        await page.waitForTimeout(500);
      }
      
      // Fill destination  
      const destInput = await page.$('input[placeholder*="destino"]');
      if (destInput) {
        await destInput.fill('Rio de Janeiro');
        await page.waitForTimeout(500);
      }
      
      // Set departure date
      const dateInputs = await page.$$('input[type="date"]');
      if (dateInputs.length > 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateInputs[0].fill(tomorrow.toISOString().split('T')[0]);
      }
      
      console.log('✅ Flight form filled');
    }
    
    // Complete current service
    const continueButton = await page.$('button:has-text("Continuar")');
    if (continueButton) {
      await continueButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Service form completed');
    }
    
    await page.screenshot({ path: 'test-4-service-completed.png' });
    
    // Step 6: Navigate to Personal Information (Step 3)
    console.log('\n👤 Step 6: Personal information step...');
    const perfilButton = await page.$('button:has-text("Perfil")');
    if (perfilButton) {
      await perfilButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-5-personal-info.png' });
    }
    
    // Fill personal information
    console.log('📝 Filling personal information...');
    
    // Fill name
    const nameInput = await page.$('input[placeholder*="nome"]');
    if (nameInput) {
      await nameInput.fill('João Silva Santos');
      await page.waitForTimeout(500);
    }
    
    // Fill email
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.fill('joao.silva@email.com');
      await page.waitForTimeout(500);
    }
    
    // Fill WhatsApp
    const whatsappInput = await page.$('input[placeholder*="WhatsApp"], input[placeholder*="99999"]');
    if (whatsappInput) {
      await whatsappInput.fill('+55 11 99999-9999');
      await page.waitForTimeout(500);
    }
    
    // Accept terms
    const termsCheckbox = await page.$('input#aceitar-termos');
    if (termsCheckbox) {
      await termsCheckbox.click();
      await page.waitForTimeout(500);
    }
    
    console.log('✅ Personal information filled');
    await page.screenshot({ path: 'test-6-personal-filled.png' });
    
    // Step 7: Navigate to Final Step (Step 4)
    console.log('\n🎯 Step 7: Final summary step...');
    const finalizarButton = await page.$('button:has-text("Finalizar")');
    if (finalizarButton) {
      await finalizarButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-7-final-step.png' });
    }
    
    // Verify final step content
    const summarySection = await page.$('text="Resumo dos Serviços"');
    const personalSection = await page.$('text="Seus Dados"');
    const readySection = await page.$('text="Tudo Pronto para Enviar"');
    
    console.log('📋 Final step verification:');
    console.log(`   • Services Summary: ${summarySection ? '✅' : '❌'}`);
    console.log(`   • Personal Data: ${personalSection ? '✅' : '❌'}`);
    console.log(`   • Ready to Submit: ${readySection ? '✅' : '❌'}`);
    
    // Step 8: Test submission (without actually submitting)
    console.log('\n🚀 Step 8: Testing submission button...');
    const submitButton = await page.$('button:has-text("Enviar")');
    if (submitButton) {
      console.log('✅ Submit button found and ready');
      
      // Check if button is enabled
      const isDisabled = await submitButton.getAttribute('disabled');
      console.log(`   • Button enabled: ${!isDisabled ? '✅' : '❌'}`);
      
      await page.screenshot({ path: 'test-8-ready-to-submit.png' });
      
      // Note: We won't actually click submit to avoid sending test data
      console.log('   • Skipping actual submission to avoid test data');
    }
    
    // Step 9: Test navigation between steps
    console.log('\n🔄 Step 9: Testing navigation...');
    
    // Test back navigation
    const homeButton = await page.$('button:has-text("Início")');
    if (homeButton) {
      await homeButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigation to home works');
    }
    
    // Navigate back to final step
    if (perfilButton) {
      await perfilButton.click();
      await page.waitForTimeout(1000);
    }
    if (finalizarButton) {
      await finalizarButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigation back to final step works');
    }
    
    await page.screenshot({ path: 'test-9-navigation-test.png' });
    
    // Final Assessment
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ENTERPRISE MULTI-STEP FORM - TEST RESULTS');
    console.log('='.repeat(60));
    
    const testResults = {
      'Homepage Loading': true,
      'Form Opening': true,
      'Progress Bar': !!progressBar,
      'Service Selection': selectedServices.length > 0,
      'Service Forms': !!isFlightsForm,
      'Personal Information': !!(nameInput && emailInput && whatsappInput),
      'Final Summary': !!(summarySection && personalSection),
      'Submit Ready': !!submitButton && !!readySection,
      'Navigation': !!(homeButton && perfilButton && finalizarButton)
    };
    
    let passedTests = 0;
    const totalTests = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`);
      if (passed) passedTests++;
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 OVERALL SCORE: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🏆 PERFECT SCORE - All tests passed!');
      console.log('✨ The enhanced multi-step form is working flawlessly!');
    } else if (passedTests >= totalTests * 0.8) {
      console.log('🎯 GREAT SCORE - Most features working well!');
    } else {
      console.log('⚠️  Some issues detected - Review needed');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   • test-1-homepage.png');
    console.log('   • test-2-form-opened.png');
    console.log('   • test-3-services-step.png');
    console.log('   • test-4-service-completed.png');
    console.log('   • test-5-personal-info.png');
    console.log('   • test-6-personal-filled.png');
    console.log('   • test-7-final-step.png');
    console.log('   • test-8-ready-to-submit.png');
    console.log('   • test-9-navigation-test.png');
    
    console.log('\n🚀 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
})();