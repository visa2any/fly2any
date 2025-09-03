const { chromium } = require('playwright');

(async () => {
  console.log('🔍 TESTING REAL FLY2ANY HOMEPAGE LEAD FORM');
  console.log('==========================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs from the page
  page.on('console', msg => {
    if (msg.text().includes('AirportAutocomplete') || msg.text().includes('airports')) {
      console.log('   [BROWSER LOG]:', msg.text());
    }
  });
  
  try {
    console.log('1. Navigating to REAL homepage at localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'homepage-initial.png' });
    console.log('   📸 Homepage screenshot saved');
    
    // Look for Lead Form triggers
    console.log('\n2. Looking for Lead Form trigger buttons...');
    const triggerButtons = [
      'button:has-text("Cotação")',
      'button:has-text("Solicitar")',
      'button:has-text("Quote")',
      '.lead-capture-trigger',
      '[data-testid*="lead"]',
      'button:has-text("Grátis")'
    ];
    
    let foundButton = false;
    for (const selector of triggerButtons) {
      const buttons = await page.locator(selector).all();
      if (buttons.length > 0) {
        console.log(`   ✅ Found button with selector: ${selector}`);
        console.log(`   Clicking button...`);
        await buttons[0].click();
        await page.waitForTimeout(1000);
        foundButton = true;
        break;
      }
    }
    
    if (!foundButton) {
      console.log('   ⚠️ No obvious button found, checking for lead forms already visible...');
    }
    
    // Look for Lead Form modal/popup
    console.log('\n3. Looking for Lead Form...');
    const leadFormSelectors = [
      '[role="dialog"]',
      '.modal',
      '.lead-form',
      '.lead-capture',
      'form:has(input[placeholder*="origem" i])',
      'form:has(input[placeholder*="airport" i])'
    ];
    
    let leadForm = null;
    for (const selector of leadFormSelectors) {
      const forms = await page.locator(selector).all();
      if (forms.length > 0) {
        leadForm = forms[0];
        console.log(`   ✅ Found Lead Form with selector: ${selector}`);
        break;
      }
    }
    
    if (!leadForm) {
      console.log('   ❌ NO LEAD FORM FOUND ON HOMEPAGE!');
      console.log('   This means the issue is not with airport search, but with Lead Form visibility');
      await page.screenshot({ path: 'no-lead-form.png' });
      console.log('   📸 Screenshot saved as no-lead-form.png');
      return;
    }
    
    // Look for airport input in the Lead Form
    console.log('\n4. Looking for airport input field in Lead Form...');
    const airportInputSelectors = [
      'input[placeholder*="origem" i]',
      'input[placeholder*="from" i]',
      'input[placeholder*="departure" i]',
      'input[placeholder*="airport" i]',
      'input[placeholder*="cidade" i]'
    ];
    
    let airportInput = null;
    for (const selector of airportInputSelectors) {
      const inputs = await leadForm.locator(selector).all();
      if (inputs.length > 0) {
        airportInput = inputs[0];
        console.log(`   ✅ Found airport input with selector: ${selector}`);
        break;
      }
    }
    
    if (!airportInput) {
      console.log('   ❌ NO AIRPORT INPUT FOUND IN LEAD FORM!');
      await page.screenshot({ path: 'lead-form-no-airport-input.png' });
      console.log('   📸 Screenshot saved as lead-form-no-airport-input.png');
      return;
    }
    
    // Test the airport search functionality
    console.log('\n5. Testing airport search with "New York"...');
    await airportInput.click();
    await airportInput.clear();
    await airportInput.type('New York', { delay: 200 });
    
    // Wait for results
    await page.waitForTimeout(2000);
    
    // Look for dropdown results
    const resultSelectors = [
      '[role="listbox"] [role="option"]',
      '.airport-result',
      '.dropdown-item',
      '[data-airport]',
      '.airport-option'
    ];
    
    let results = [];
    for (const selector of resultSelectors) {
      const foundResults = await page.locator(selector).all();
      if (foundResults.length > 0) {
        results = foundResults;
        console.log(`   ✅ Found ${results.length} results with selector: ${selector}`);
        break;
      }
    }
    
    if (results.length > 0) {
      console.log('   🎉 AIRPORT SEARCH IS WORKING!');
      console.log('   Results found:');
      for (let i = 0; i < Math.min(5, results.length); i++) {
        const text = await results[i].textContent();
        console.log(`     ${i + 1}. ${text.trim()}`);
      }
    } else {
      console.log('   ❌ NO RESULTS FOUND FOR "New York"');
      console.log('   This confirms the airport search is NOT working');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'airport-search-test-real.png' });
    console.log('   📸 Final screenshot saved as airport-search-test-real.png');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
  }
  
  console.log('\n✅ Test complete. Browser stays open for 10 seconds for inspection...');
  await page.waitForTimeout(10000);
  await browser.close();
})();