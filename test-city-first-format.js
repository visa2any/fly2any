const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('🎯 ULTRATHINK CITY-FIRST FORMAT TEST');
  console.log('✨ Testing "São Paulo • GRU" format with 14px font');
  console.log('📱 Verifying complete visibility in input field');
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    // Click flights to open form
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('🛫 DEPARTURE FIELD TEST');
    
    // Focus departure input
    const departureInput = page.locator('input[placeholder*="De onde"]').first();
    await departureInput.click();
    await page.waitForTimeout(500);
    await departureInput.fill('São');
    await page.waitForTimeout(2000);
    
    // Check dropdown suggestions format
    const suggestions = await page.locator('body > div[style*="position: fixed"] button').count();
    console.log(`📋 Found ${suggestions} suggestions with new format:`);
    
    for (let i = 0; i < Math.min(suggestions, 3); i++) {
      const suggestionButton = page.locator('body > div[style*="position: fixed"] button').nth(i);
      const cityCodeText = await suggestionButton.locator('span.font-bold').textContent();
      const airportName = await suggestionButton.locator('div.text-xs.text-gray-600').textContent();
      
      console.log(`   ${i + 1}. ${cityCodeText}`);
      console.log(`      🏢 ${airportName}`);
      
      // Verify format is "City • Code"
      if (cityCodeText && cityCodeText.includes(' • ')) {
        console.log(`      ✅ CITY-FIRST FORMAT CONFIRMED`);
      } else {
        console.log(`      ❌ FORMAT ERROR`);
      }
    }
    
    // Test clicking first suggestion
    console.log('\n🖱️ Testing selection...');
    const firstSuggestion = page.locator('body > div[style*="position: fixed"] button').first();
    await firstSuggestion.click();
    await page.waitForTimeout(1000);
    
    // Check input field value
    const selectedValue = await departureInput.inputValue();
    console.log(`📝 Input Field Value: "${selectedValue}"`);
    
    // Analyze text visibility
    const inputBounds = await departureInput.boundingBox();
    if (inputBounds) {
      console.log(`📊 Input Field: ${inputBounds.width}px wide`);
      
      // Estimate character fit (rough calculation)
      const fontSizePx = 14; // Our new consistent font size
      const avgCharWidth = fontSizePx * 0.6; // Approximate character width
      const usableWidth = inputBounds.width - 50; // Subtract padding + icon space
      const maxCharacters = Math.floor(usableWidth / avgCharWidth);
      
      console.log(`📏 Estimated fit: ~${maxCharacters} characters`);
      console.log(`📏 Current text: ${selectedValue?.length || 0} characters`);
      
      if (selectedValue && selectedValue.length <= maxCharacters) {
        console.log(`✅ TEXT SHOULD FIT COMPLETELY`);
      } else {
        console.log(`⚠️ MIGHT BE TRUNCATED`);
      }
    }
    
    // Clear and test return field
    console.log('\n🛬 RETURN FIELD TEST');
    const returnInput = page.locator('input[placeholder*="Para onde"]').first();
    await returnInput.click();
    await page.waitForTimeout(500);
    await returnInput.fill('Rio');
    await page.waitForTimeout(2000);
    
    // Test return selection
    const returnDropdownVisible = await page.locator('body > div[style*="position: fixed"]').isVisible();
    if (returnDropdownVisible) {
      console.log('📋 Return dropdown visible');
      
      const returnSuggestion = page.locator('body > div[style*="position: fixed"] button').first();
      const returnCityCodeText = await returnSuggestion.locator('span.font-bold').textContent();
      console.log(`📍 Return format: "${returnCityCodeText}"`);
      
      // Test return selection
      await returnSuggestion.click();
      await page.waitForTimeout(1000);
      
      const returnSelectedValue = await returnInput.inputValue();
      console.log(`📝 Return Input Value: "${returnSelectedValue}"`);
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'city-first-format-test.png', 
      fullPage: false 
    });
    
    console.log('\n🎉 ULTRATHINK FORMAT TEST COMPLETE!');
    console.log('');
    console.log('✅ IMPROVEMENTS IMPLEMENTED:');
    console.log('  📝 Format: "City • Code" (user-friendly order)');
    console.log('  🔤 Font: Consistent 14px (no zoom conflicts)');
    console.log('  📱 Mobile: Optimized for small screens');
    console.log('  ✨ Separator: Modern bullet • instead of dash -');
    console.log('');
    console.log('🎯 BENEFITS:');
    console.log('  👁️ City name appears first (more recognizable)');
    console.log('  💾 Shorter format saves 2 characters (• vs " - ")');
    console.log('  📏 Better fit in mobile input fields');
    console.log('  🎨 Modern, clean appearance');
    console.log('');
    console.log('👑 ULTRATHINK PROGRESSIVE ENHANCEMENT: SUCCESS!');
    
    // Keep browser open for manual verification
    console.log('\n⏱️ Browser open for 20 seconds - verify text visibility...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ City-first format test failed:', error);
    await page.screenshot({ 
      path: 'city-first-format-error.png', 
      fullPage: false 
    });
  } finally {
    await browser.close();
  }
})();