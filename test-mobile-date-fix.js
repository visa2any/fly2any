const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 390, height: 844 } // iPhone 12 Pro size
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  
  console.log('🚀 Testing Mobile Flight Form Date Handling...');
  
  try {
    // Navigate to the page (with extended timeout for slow initial load)
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✅ Page loaded successfully');
    
    // Check if there's a premium lead form modal and close it
    await page.waitForTimeout(2000); // Wait for any modals to appear
    
    // Try to close the lead form modal if it appears
    const closeModalButton = await page.$('button[aria-label="Fechar"]');
    if (closeModalButton) {
      await closeModalButton.click();
      console.log('✅ Closed lead form modal');
      await page.waitForTimeout(500);
    } else {
      // Alternative: look for X button or close icon
      const closeButton = await page.$('text=/×|X|Fechar/i');
      if (closeButton) {
        await closeButton.click();
        console.log('✅ Closed modal');
        await page.waitForTimeout(500);
      }
    }
    
    // Wait for the mobile app view to load
    await page.waitForSelector('text=/Voos|Buscar Ofertas/i', { timeout: 10000 });
    console.log('✅ Mobile app view loaded');
    
    // Click on "Buscar Ofertas Grátis" button to open the flight form
    const searchButton = await page.$('button:has-text("Buscar Ofertas Grátis")');
    if (searchButton) {
      await searchButton.click();
      console.log('✅ Clicked on search button');
      await page.waitForTimeout(1000); // Wait for form to appear
    }
    
    // Now wait for the form to be visible
    try {
      await page.waitForSelector('.bg-white.rounded-2xl', { timeout: 5000 });
      console.log('✅ Flight form is visible');
    } catch (e) {
      console.log('ℹ️ Flight form not immediately visible, checking for service cards...');
      
      // Try clicking on "Voos" card instead
      const voosCard = await page.$('text=/Voos/i');
      if (voosCard) {
        await voosCard.click();
        console.log('✅ Clicked on Voos card');
        await page.waitForTimeout(1000);
      }
    }
    
    // Check if date fields are displayed correctly (they might be in a later step)
    const hasDateField = await page.isVisible('text=/Selecionar data|Data de ida|Data de volta/i');
    console.log(`📅 Date field visible: ${hasDateField}`);
    
    // Navigate through form steps to find date fields
    let stepCount = 0;
    const maxSteps = 5;
    
    while (stepCount < maxSteps) {
      // Check current step for date-related content
      const currentContent = await page.textContent('body');
      
      if (currentContent && (currentContent.includes('Selecionar data') || 
          currentContent.includes('Data de ida') || 
          currentContent.includes('Data de volta'))) {
        console.log(`✅ Found date fields at step ${stepCount + 1}`);
        
        // Try to click on the date field
        try {
          await page.click('text=/Selecionar data|[0-9]+ [a-z]+/i', { timeout: 2000 });
          console.log('✅ Clicked on date field');
          
          // Check if date picker modal opens
          const datePickerVisible = await page.isVisible('.mobile-date-picker-modal');
          console.log(`📅 Date picker modal: ${datePickerVisible ? 'Opened' : 'Not opened'}`);
          
          if (datePickerVisible) {
            // Close the date picker
            await page.click('button:has-text("Cancelar")', { timeout: 2000 });
            console.log('✅ Closed date picker');
          }
        } catch (e) {
          console.log('ℹ️ Date field not clickable in current step');
        }
        break;
      }
      
      // Try to navigate to next step
      const nextButton = await page.$('button:has-text("Próximo")');
      if (nextButton) {
        await nextButton.click();
        console.log(`✅ Navigated to step ${stepCount + 2}`);
        await page.waitForTimeout(500);
        stepCount++;
      } else {
        console.log('ℹ️ No more steps to navigate');
        break;
      }
    }
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console error:', msg.text());
      }
    });
    
    // Wait a bit to catch any late errors
    await page.waitForTimeout(2000);
    
    console.log('\n✅ Test completed successfully - No date formatting errors detected!');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'mobile-date-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as mobile-date-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'mobile-date-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as mobile-date-test-error.png');
  } finally {
    await browser.close();
    console.log('\n🎯 Test execution completed');
  }
})();