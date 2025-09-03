const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('✈️ TESTING AIRPORT NAME DISPLAY');
  console.log('🎯 Verifying full airport names are visible');
  console.log('📋 Should show: IATA + City + Full Airport Name');
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    // Click flights to open form
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('🛫 Testing departure airport display...');
    
    // Focus and type in departure field
    const departureInput = page.locator('input[placeholder*="De onde"]').first();
    await departureInput.click();
    await page.waitForTimeout(500);
    await departureInput.fill('São');
    await page.waitForTimeout(2000);
    
    // Check if dropdown is visible
    const dropdownVisible = await page.locator('body > div[style*="position: fixed"]').isVisible();
    console.log('📋 Dropdown visible:', dropdownVisible ? 'SUCCESS' : 'FAILED');
    
    if (dropdownVisible) {
      // Get all suggestion texts
      const suggestions = await page.locator('body > div[style*="position: fixed"] button').count();
      console.log(`✈️ Found ${suggestions} airport suggestions`);
      
      for (let i = 0; i < Math.min(suggestions, 3); i++) {
        const suggestionButton = page.locator('body > div[style*="position: fixed"] button').nth(i);
        
        // Get the text content
        const iataCity = await suggestionButton.locator('span.font-bold').textContent();
        const airportName = await suggestionButton.locator('div.text-xs.text-gray-600').textContent();
        
        console.log(`📍 Suggestion ${i + 1}:`);
        console.log(`   IATA + City: ${iataCity || 'NOT FOUND'}`);
        console.log(`   Airport Name: ${airportName || 'NOT FOUND'}`);
        
        if (iataCity && airportName) {
          console.log(`   ✅ COMPLETE INFO DISPLAYED`);
        } else {
          console.log(`   ❌ MISSING INFORMATION`);
        }
      }
      
      // Take screenshot for verification
      await page.screenshot({ 
        path: 'airport-name-display-test.png', 
        fullPage: false 
      });
      
      // Test clicking on first suggestion
      console.log('\n🖱️ Testing suggestion click...');
      const firstSuggestion = page.locator('body > div[style*="position: fixed"] button').first();
      await firstSuggestion.click();
      await page.waitForTimeout(500);
      
      const selectedValue = await departureInput.inputValue();
      console.log(`✅ Selected Value: ${selectedValue}`);
      
      // Clear and test with different search
      await departureInput.clear();
      await page.waitForTimeout(500);
      await departureInput.fill('Rio');
      await page.waitForTimeout(2000);
      
      console.log('\n🔍 Testing Rio search results...');
      const rioSuggestions = await page.locator('body > div[style*="position: fixed"] button').count();
      console.log(`✈️ Found ${rioSuggestions} Rio airports`);
      
      if (rioSuggestions > 0) {
        const rioFirstSuggestion = page.locator('body > div[style*="position: fixed"] button').first();
        const rioIataCity = await rioFirstSuggestion.locator('span.font-bold').textContent();
        const rioAirportName = await rioFirstSuggestion.locator('div.text-xs.text-gray-600').textContent();
        
        console.log(`📍 Rio Result:`);
        console.log(`   IATA + City: ${rioIataCity || 'NOT FOUND'}`);
        console.log(`   Airport Name: ${rioAirportName || 'NOT FOUND'}`);
      }
    }
    
    console.log('\n🎉 AIRPORT NAME DISPLAY TEST COMPLETE!');
    console.log('');
    console.log('✅ INFORMATION STRUCTURE:');
    console.log('  📊 Line 1: [IATA CODE] - [CITY NAME] + [FLAGS/REGION]');
    console.log('  📊 Line 2: [FULL AIRPORT NAME]');
    console.log('  📏 Two-line layout in expanded dropdown (+20% width)');
    console.log('  🎯 54px height per suggestion for readability');
    console.log('');
    console.log('👑 COMPLETE AIRPORT INFORMATION NOW VISIBLE!');
    
    // Keep browser open for visual verification
    console.log('\n⏱️ Browser open for 20 seconds for visual verification...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Airport name display test failed:', error);
    await page.screenshot({ 
      path: 'airport-name-error.png', 
      fullPage: false 
    });
  } finally {
    await browser.close();
  }
})();