const { chromium } = require('playwright');

(async () => {
  console.log('✈️ Testing Airport Search Fix...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to the home page
    console.log('1. Navigating to Fly2Any homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Open browser console to see debug logs
    page.on('console', msg => {
      if (msg.text().includes('AirportAutocomplete')) {
        console.log('   [Browser]:', msg.text());
      }
    });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Look for the first visible input that looks like an airport search
    console.log('2. Looking for airport search input...');
    
    // Try different selectors
    const selectors = [
      'input[placeholder*="origem" i]',
      'input[placeholder*="from" i]',
      'input[placeholder*="departure" i]',
      'input[placeholder*="airport" i]',
      'input[placeholder*="cidade" i]'
    ];
    
    let airportInput = null;
    for (const selector of selectors) {
      const inputs = await page.locator(selector).all();
      if (inputs.length > 0) {
        airportInput = inputs[0];
        console.log(`   Found input with selector: ${selector}`);
        break;
      }
    }
    
    if (airportInput) {
      // Test New York search
      console.log('\n3. Testing "New York" search...');
      await airportInput.click();
      await airportInput.clear();
      await airportInput.type('New York', { delay: 100 });
      await page.waitForTimeout(1500);
      
      // Check for results
      const results = await page.locator('[role="option"], .airport-option, .dropdown-item').all();
      console.log(`   ✅ Found ${results.length} results for "New York"`);
      
      if (results.length > 0) {
        for (let i = 0; i < Math.min(3, results.length); i++) {
          const text = await results[i].textContent();
          console.log(`     - ${text.trim()}`);
        }
      }
      
      // Test JFK search
      console.log('\n4. Testing "JFK" search...');
      await airportInput.clear();
      await airportInput.type('JFK', { delay: 100 });
      await page.waitForTimeout(1500);
      
      const jfkResults = await page.locator('[role="option"], .airport-option, .dropdown-item').all();
      console.log(`   ✅ Found ${jfkResults.length} results for "JFK"`);
      
      // Test São Paulo search
      console.log('\n5. Testing "São Paulo" search...');
      await airportInput.clear();
      await airportInput.type('São Paulo', { delay: 100 });
      await page.waitForTimeout(1500);
      
      const spResults = await page.locator('[role="option"], .airport-option, .dropdown-item').all();
      console.log(`   ✅ Found ${spResults.length} results for "São Paulo"`);
      
      // Take screenshot
      await page.screenshot({ path: 'airport-fix-test.png' });
      console.log('\n📸 Screenshot saved as airport-fix-test.png');
      
    } else {
      console.log('   ❌ No airport input found on page');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'airport-fix-debug.png' });
      console.log('   Screenshot saved as airport-fix-debug.png');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n✅ Test complete! Browser will close in 5 seconds...');
  await page.waitForTimeout(5000);
  await browser.close();
})();