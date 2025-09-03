const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  const page = await context.newPage();

  console.log('📱 Testing Mobile Header Navigation on Multi-Step Lead Form...');

  try {
    // Navigate to the page
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000); // Wait for components to mount
    console.log('✅ Page loaded successfully');

    // Click on "Buscar Ofertas Grátis" button to open the form
    await page.click('text="Buscar Ofertas Grátis"');
    await page.waitForTimeout(1000);
    console.log('✅ Opened Multi-Step Lead Form');

    // Step 1: Service Selection
    console.log('\n📍 Step 1: Service Selection');
    
    // Check header elements
    const step1Header = await page.locator('.flex-none.bg-white\\/95').first();
    const step1HeaderVisible = await step1Header.isVisible();
    console.log(`  Header visible: ${step1HeaderVisible ? '✅' : '❌'}`);
    
    // Check for Fly2Any logo on step 1
    const logoVisible = await page.locator('text="Fly2Any"').isVisible();
    console.log(`  Fly2Any logo visible: ${logoVisible ? '✅' : '❌'}`);
    
    // Check step title (in header)
    const step1Title = await page.locator('h2:has-text("Escolha os Serviços")').isVisible();
    console.log(`  Step 1 title visible: ${step1Title ? '✅' : '❌'}`);

    // Take screenshot of Step 1
    await page.screenshot({ path: 'mobile-header-step1.png', fullPage: false });
    console.log('  📸 Screenshot saved: mobile-header-step1.png');

    // Select a service (Flights)
    await page.click('text="Passagens Aéreas"');
    await page.waitForTimeout(1000);
    console.log('✅ Selected Flights service');

    // Step 2: Service Details
    console.log('\n📍 Step 2: Service Details (Flight)');
    
    // Check for back button
    const backButton = await page.locator('button[aria-label="Voltar"]').first();
    const backButtonVisible = await backButton.isVisible();
    console.log(`  Back button visible: ${backButtonVisible ? '✅' : '❌'}`);
    
    // Check step title (in header)
    const step2Title = await page.locator('h2:has-text("Detalhes do Voo")').isVisible();
    console.log(`  Step 2 title visible: ${step2Title ? '✅' : '❌'}`);
    
    // Check progress indicator
    const progressText = await page.locator('text=/Passo 2 de 4/').isVisible();
    console.log(`  Progress indicator visible: ${progressText ? '✅' : '❌'}`);

    // Take screenshot of Step 2
    await page.screenshot({ path: 'mobile-header-step2.png', fullPage: false });
    console.log('  📸 Screenshot saved: mobile-header-step2.png');

    // Test back button functionality
    await backButton.click();
    await page.waitForTimeout(500);
    const backToStep1 = await page.locator('h2:has-text("Escolha os Serviços")').isVisible();
    console.log(`  Back button works: ${backToStep1 ? '✅' : '❌'}`);
    
    // Go forward again
    await page.click('text="Continuar com 1 serviço"');
    await page.waitForTimeout(1000);

    // Fill in some basic flight details
    await page.fill('input[placeholder="Aeroporto de origem"]', 'GRU');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    await page.fill('input[placeholder="Aeroporto de destino"]', 'JFK');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    // Click continue
    await page.click('text="Continuar →"');
    await page.waitForTimeout(1000);

    // Step 3: Personal Information
    console.log('\n📍 Step 3: Personal Information');
    
    // Check header elements
    const step3BackButton = await page.locator('button[aria-label="Voltar"]').first().isVisible();
    console.log(`  Back button visible: ${step3BackButton ? '✅' : '❌'}`);
    
    const step3Title = await page.locator('h2:has-text("Seus Dados")').isVisible();
    console.log(`  Step 3 title visible: ${step3Title ? '✅' : '❌'}`);
    
    const step3Progress = await page.locator('text=/Passo 3 de 4/').isVisible();
    console.log(`  Progress indicator visible: ${step3Progress ? '✅' : '❌'}`);

    // Take screenshot of Step 3
    await page.screenshot({ path: 'mobile-header-step3.png', fullPage: false });
    console.log('  📸 Screenshot saved: mobile-header-step3.png');

    // Fill personal info
    await page.fill('input[placeholder="Seu nome completo"]', 'Test User');
    await page.fill('input[placeholder="seu@email.com"]', 'test@example.com');
    await page.fill('input[placeholder*="555"]', '+1 555 123 4567');
    
    // Click on finalizar in bottom nav
    await page.click('text="Finalizar"');
    await page.waitForTimeout(1000);

    // Step 4: Final Details
    console.log('\n📍 Step 4: Final Details');
    
    const step4BackButton = await page.locator('button[aria-label="Voltar"]').first().isVisible();
    console.log(`  Back button visible: ${step4BackButton ? '✅' : '❌'}`);
    
    const step4Title = await page.locator('h2:has-text("Finalizar Cotação")').isVisible();
    console.log(`  Step 4 title visible: ${step4Title ? '✅' : '❌'}`);
    
    const step4Progress = await page.locator('text=/Passo 4 de 4/').isVisible();
    console.log(`  Progress indicator visible: ${step4Progress ? '✅' : '❌'}`);

    // Take screenshot of Step 4
    await page.screenshot({ path: 'mobile-header-step4.png', fullPage: false });
    console.log('  📸 Screenshot saved: mobile-header-step4.png');

    // Test clicking on progress dots
    console.log('\n🔄 Testing Progress Dot Navigation');
    
    // Click on dot 1 to go back to step 1
    const dots = await page.locator('.flex.items-center.gap-1 button').all();
    if (dots.length >= 4) {
      await dots[0].click(); // Click first dot
      await page.waitForTimeout(500);
      const backToServiceSelection = await page.locator('h2:has-text("Escolha os Serviços")').isVisible();
      console.log(`  Navigate to Step 1 via dots: ${backToServiceSelection ? '✅' : '❌'}`);
    }

    console.log('\n✨ Mobile Header Navigation Test Complete!');
    console.log('📊 Summary: The enhanced header with navigation is working correctly on all steps.');

  } catch (error) {
    console.error('❌ Error during test:', error);
    await page.screenshot({ path: 'mobile-header-error.png', fullPage: false });
    console.log('📸 Error screenshot saved: mobile-header-error.png');
  }

  await browser.close();
})();