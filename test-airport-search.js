const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Airport Search Functionality...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to the home page
    console.log('1. Navigating to Fly2Any homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Try to trigger the lead capture popup (which has airport search)
    console.log('2. Triggering lead capture form...');
    
    // Move mouse to trigger exit intent
    await page.mouse.move(500, 0);
    await page.waitForTimeout(1000);
    
    // Check if popup opened, if not try clicking a button
    const popup = await page.locator('[role="dialog"], .lead-capture-modal, .modal').first();
    
    if (!await popup.isVisible()) {
      console.log('   Popup not visible, trying to find a trigger button...');
      // Try to find and click any button that might trigger the lead form
      const triggerButton = await page.locator('button:has-text("Quote"), button:has-text("Cotação"), button:has-text("Get Started")').first();
      if (await triggerButton.isVisible()) {
        await triggerButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Look for airport input fields
    console.log('3. Looking for airport input fields...');
    const airportInputs = await page.locator('input[placeholder*="airport" i], input[placeholder*="origem" i], input[placeholder*="from" i], input[placeholder*="departure" i]').all();
    
    if (airportInputs.length > 0) {
      console.log(`   Found ${airportInputs.length} airport input field(s)`);
      
      // Test the first airport input
      const firstInput = airportInputs[0];
      
      console.log('4. Testing "New York" search...');
      await firstInput.click();
      await firstInput.fill('New York');
      await page.waitForTimeout(1000);
      
      // Check for dropdown results
      const dropdownResults = await page.locator('[role="listbox"] [role="option"], .airport-result, .dropdown-item, [data-airport]').all();
      
      console.log(`   Found ${dropdownResults.length} results for "New York"`);
      
      if (dropdownResults.length > 0) {
        console.log('   ✅ Airport search is working!');
        console.log('   Results found:');
        for (let i = 0; i < Math.min(5, dropdownResults.length); i++) {
          const text = await dropdownResults[i].textContent();
          console.log(`     - ${text}`);
        }
      } else {
        console.log('   ❌ No results found for "New York"');
        
        // Try alternative search
        console.log('5. Testing "JFK" search...');
        await firstInput.clear();
        await firstInput.fill('JFK');
        await page.waitForTimeout(1000);
        
        const jfkResults = await page.locator('[role="listbox"] [role="option"], .airport-result, .dropdown-item').all();
        console.log(`   Found ${jfkResults.length} results for "JFK"`);
        
        if (jfkResults.length > 0) {
          console.log('   ✅ Airport code search is working!');
          for (let i = 0; i < Math.min(3, jfkResults.length); i++) {
            const text = await jfkResults[i].textContent();
            console.log(`     - ${text}`);
          }
        }
      }
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'airport-search-test.png', fullPage: false });
      console.log('\n📸 Screenshot saved as airport-search-test.png');
      
    } else {
      console.log('   ❌ No airport input fields found');
      console.log('   Checking page structure...');
      
      // Try to find the flight search form
      const flightForm = await page.locator('form').first();
      if (await flightForm.isVisible()) {
        console.log('   Found a form on the page');
        const formHTML = await flightForm.innerHTML();
        console.log('   Form contains:', formHTML.substring(0, 200) + '...');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'airport-search-error.png' });
    console.log('Screenshot saved as airport-search-error.png');
  }
  
  console.log('\n🔍 Test complete. Browser will close in 5 seconds...');
  await page.waitForTimeout(5000);
  await browser.close();
})();