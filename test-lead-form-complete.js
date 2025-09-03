const { chromium } = require('playwright');

/**
 * Complete Lead Form Testing and Fixing Script
 * Tests all steps of the multistep form and identifies issues
 */

async function testLeadForm() {
  console.log('🚀 Starting Complete Lead Form Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR'
  });
  
  const page = await context.newPage();
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Error:', msg.text());
    }
  });
  
  // Monitor network failures
  page.on('requestfailed', request => {
    console.log('❌ Request Failed:', request.url(), request.failure().errorText);
  });
  
  // Monitor responses
  page.on('response', response => {
    if (response.url().includes('/api/leads') && response.status() !== 200 && response.status() !== 201) {
      console.log(`❌ API Error: ${response.status()} - ${response.url()}`);
      response.json().then(data => {
        console.log('API Response:', JSON.stringify(data, null, 2));
      }).catch(() => {});
    }
  });
  
  try {
    // Navigate to the page
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Wait for the form to be visible
    await page.waitForTimeout(2000);
    
    console.log('\n=== STEP 1: Flight Details ===');
    
    // Fill origin
    console.log('✈️ Filling origin...');
    const originInput = await page.locator('input[placeholder*="origem"], input[placeholder*="saindo"], input[placeholder*="Origin"]').first();
    await originInput.click();
    await originInput.fill('São Paulo');
    await page.waitForTimeout(500);
    
    // Fill destination
    console.log('✈️ Filling destination...');
    const destInput = await page.locator('input[placeholder*="destino"], input[placeholder*="indo"], input[placeholder*="Destination"]').first();
    await destInput.click();
    await destInput.fill('Rio de Janeiro');
    await page.waitForTimeout(500);
    
    // Set departure date
    console.log('📅 Setting departure date...');
    const departureInput = await page.locator('input[type="date"]').first();
    await departureInput.fill('2025-09-15');
    
    // Set return date
    console.log('📅 Setting return date...');
    const returnInput = await page.locator('input[type="date"]').nth(1);
    await returnInput.fill('2025-09-22');
    
    // Set trip type
    console.log('🎯 Setting trip type...');
    const tripTypeSelect = await page.locator('select').first();
    await tripTypeSelect.selectOption('ida-volta');
    
    // Set passengers
    console.log('👥 Setting passengers...');
    const adultsInput = await page.locator('input[type="number"]').first();
    await adultsInput.fill('2');
    
    // Click next button
    console.log('➡️ Clicking next...');
    await page.locator('button:has-text("Próximo"), button:has-text("Continuar")').first().click();
    await page.waitForTimeout(1000);
    
    console.log('\n=== STEP 2: Personal Information ===');
    
    // Fill name
    console.log('👤 Filling name...');
    const nameInput = await page.locator('input[placeholder*="Nome"], input[name="nome"]').first();
    await nameInput.fill('João');
    
    // Fill surname
    console.log('👤 Filling surname...');
    const surnameInput = await page.locator('input[placeholder*="Sobrenome"], input[name="sobrenome"]').first();
    await surnameInput.fill('Silva');
    
    // Fill email
    console.log('📧 Filling email...');
    const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first();
    await emailInput.fill('test@example.com');
    
    // Fill phone
    console.log('📱 Filling phone...');
    const phoneInput = await page.locator('input[placeholder*="Telefone"], input[placeholder*="telefone"], input[name="telefone"]').first();
    await phoneInput.fill('11999999999');
    
    // Fill WhatsApp
    console.log('📱 Filling WhatsApp...');
    const whatsappInput = await page.locator('input[placeholder*="WhatsApp"], input[placeholder*="whatsapp"], input[name="whatsapp"]').first();
    await whatsappInput.fill('11999999999');
    
    // Click next button
    console.log('➡️ Clicking next...');
    await page.locator('button:has-text("Próximo"), button:has-text("Continuar")').nth(1).click();
    await page.waitForTimeout(1000);
    
    console.log('\n=== STEP 3: Additional Information ===');
    
    // Fill budget
    console.log('💰 Filling budget...');
    const budgetInput = await page.locator('input[placeholder*="orçamento"], input[placeholder*="Orçamento"], input[name="orcamentoAproximado"]').first();
    if (await budgetInput.isVisible()) {
      await budgetInput.fill('5000');
    }
    
    // Add observations
    console.log('📝 Adding observations...');
    const obsTextarea = await page.locator('textarea[placeholder*="observações"], textarea[placeholder*="Observações"], textarea[name="observacoes"]').first();
    if (await obsTextarea.isVisible()) {
      await obsTextarea.fill('Teste de formulário automatizado');
    }
    
    // Take screenshot before submission
    await page.screenshot({ path: 'lead-form-before-submit.png', fullPage: true });
    
    // Submit form
    console.log('\n🚀 Submitting form...');
    const submitButton = await page.locator('button:has-text("Enviar"), button:has-text("Solicitar"), button:has-text("Finalizar")').first();
    
    // Log button text
    const buttonText = await submitButton.textContent();
    console.log(`Submit button text: "${buttonText}"`);
    
    await submitButton.click();
    
    // Wait for response
    console.log('⏳ Waiting for API response...');
    await page.waitForTimeout(5000);
    
    // Check for success message
    const successMessage = await page.locator('text=/sucesso|enviado|obrigado/i').first();
    if (await successMessage.isVisible()) {
      console.log('✅ Success message displayed!');
      const successText = await successMessage.textContent();
      console.log(`Success message: "${successText}"`);
    } else {
      console.log('❌ No success message found');
      
      // Check for error messages
      const errorMessage = await page.locator('text=/erro|falha|problema/i').first();
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`Error message: "${errorText}"`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'lead-form-after-submit.png', fullPage: true });
    
    console.log('\n📊 Test Summary:');
    console.log('- Form navigation: ✅');
    console.log('- Data filling: ✅');
    console.log('- Form submission: Completed');
    console.log('- Screenshots saved: lead-form-before-submit.png, lead-form-after-submit.png');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    await page.screenshot({ path: 'lead-form-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testLeadForm().catch(console.error);