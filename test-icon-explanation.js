const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  console.log('🔍 AIRPORT DROPDOWN ICON EXPLANATION');
  console.log('📊 Understanding what each icon represents');
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    // Click flights to open form
    await page.locator('button:has-text("Voos")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('✈️ Testing with São Paulo airports...');
    
    // Focus and type in departure field
    const departureInput = page.locator('input[placeholder*="De onde"]').first();
    await departureInput.click();
    await page.waitForTimeout(500);
    await departureInput.fill('São');
    await page.waitForTimeout(2000);
    
    const suggestions = await page.locator('body > div[style*="position: fixed"] button').count();
    console.log(`\n📋 Found ${suggestions} airport suggestions:`);
    
    for (let i = 0; i < Math.min(suggestions, 3); i++) {
      const suggestionButton = page.locator('body > div[style*="position: fixed"] button').nth(i);
      
      // Get the left icon (airport type) - more specific selector
      const leftIcon = await suggestionButton.locator('div.flex.items-center.gap-1\\.5 > span:first-child').textContent();
      
      // Get the main info
      const iataCity = await suggestionButton.locator('span.font-bold').textContent();
      const airportName = await suggestionButton.locator('div.text-xs.text-gray-600').textContent();
      
      // Get the right icons (region flag + badge)
      const rightArea = suggestionButton.locator('div.flex.items-center.gap-0\\.5');
      const regionFlag = await rightArea.locator('span:first-child').textContent();
      const regionBadge = await rightArea.locator('span.bg-gray-200').textContent();
      
      console.log(`\n${i + 1}. ${iataCity}`);
      console.log(`   🏢 Airport Name: ${airportName}`);
      console.log(`   📍 LEFT ICON: ${leftIcon} (Airport Type)`);
      console.log(`   🌎 RIGHT FLAG: ${regionFlag} (Geographic Region)`);
      console.log(`   🏷️ BADGE: ${regionBadge || 'None'} (Region Text)`);
    }
    
    // Clear and test with different regions
    await departureInput.clear();
    await page.waitForTimeout(500);
    await departureInput.fill('London');
    await page.waitForTimeout(2000);
    
    console.log('\n🇬🇧 Testing with London airports...');
    
    const londonSuggestions = await page.locator('body > div[style*="position: fixed"] button').count();
    if (londonSuggestions > 0) {
      const firstLondon = page.locator('body > div[style*="position: fixed"] button').first();
      const leftIcon = await firstLondon.locator('div.flex.items-center.gap-1\\.5 > span:first-child').textContent();
      const iataCity = await firstLondon.locator('span.font-bold').textContent();
      const rightArea = firstLondon.locator('div.flex.items-center.gap-0\\.5');
      const regionFlag = await rightArea.locator('span:first-child').textContent();
      const regionBadge = await rightArea.locator('span.bg-gray-200').textContent();
      
      console.log(`\n📍 ${iataCity}`);
      console.log(`   📍 LEFT ICON: ${leftIcon} (Airport Type)`);
      console.log(`   🌎 RIGHT FLAG: ${regionFlag} (Geographic Region)`);
      console.log(`   🏷️ BADGE: ${regionBadge || 'None'} (Region Text)`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'airport-icons-explanation.png', 
      fullPage: false 
    });
    
    console.log('\n📚 ICON SYSTEM EXPLANATION:');
    console.log('');
    console.log('🎯 LEFT ICON (Airport Type):');
    console.log('   🕒 Recent searches');
    console.log('   🛫 Major airports (high traffic)');
    console.log('   🌍 International airports');
    console.log('   ✈️ Standard airports');
    console.log('');
    console.log('🎯 RIGHT FLAG (Geographic Region):');
    console.log('   🇺🇸 North America');
    console.log('   🇧🇷 South America');
    console.log('   🇪🇺 Europe');
    console.log('   🌏 Asia');
    console.log('   🌍 Africa');
    console.log('   🇦🇺 Oceania');
    console.log('   🇲🇽 Central America');
    console.log('');
    console.log('🎯 BADGE (Region Text):');
    console.log('   Shows the continent/region name');
    console.log('   Hidden for "Recent" searches');
    console.log('');
    console.log('🔧 GLOBE CONFUSION SOLVED:');
    console.log('   🌍 LEFT = International airport type');
    console.log('   🌍 RIGHT = Africa region flag');
    console.log('   Different meanings, same icon!');
    
    // Keep browser open for manual inspection
    console.log('\n⏱️ Browser open for 20 seconds - inspect icons...');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('❌ Icon explanation test failed:', error);
    await page.screenshot({ 
      path: 'icon-explanation-error.png', 
      fullPage: false 
    });
  } finally {
    await browser.close();
  }
})();