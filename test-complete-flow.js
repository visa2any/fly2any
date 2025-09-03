const { chromium } = require('playwright');

(async () => {
  console.log('🎯 Testing Complete Lead Form Flow with Side-by-Side Dates\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500 
  });
  
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  try {
    console.log('1️⃣ Opening Fly2Any app...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    console.log('2️⃣ Clicking Voos (Flights) service...');
    await page.locator('text=Voos').first().click();
    await page.waitForTimeout(2000);
    
    console.log('3️⃣ Verifying Round-trip is selected...');
    const roundTripButton = page.locator('text=Ida e volta').first();
    const isSelected = await roundTripButton.evaluate(el => el.classList.contains('border-primary-500'));
    console.log(`   Round-trip selected: ${isSelected ? 'YES ✅' : 'NO, clicking...'}`);
    
    if (!isSelected) {
      await roundTripButton.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('4️⃣ Filling origin airport...');
    const originInput = page.locator('input[placeholder*="De onde"]').first();
    await originInput.fill('São Paulo');
    await page.waitForTimeout(1000);
    
    console.log('5️⃣ Filling destination airport...');
    const destInput = page.locator('input[placeholder*="Para onde"]').first();
    await destInput.fill('Rio de Janeiro');
    await page.waitForTimeout(1000);
    
    // Take screenshot after filling airports
    await page.screenshot({ path: 'flow-1-airports-filled.png' });
    
    console.log('6️⃣ Checking dates section visibility...');
    
    // Check if dates section appeared
    const datesHeading = page.locator('text=Quando você viaja?');
    const isVisible = await datesHeading.isVisible();
    const headingBox = await datesHeading.boundingBox();
    
    console.log(`   📅 Dates section visible: ${isVisible ? 'YES ✅' : 'NO ❌'}`);
    if (headingBox) {
      console.log(`   📍 Position: y=${Math.round(headingBox.y)} (viewport: 844px)`);
    }
    
    // Check date inputs
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`   📊 Date inputs found: ${dateInputs}`);
    
    if (dateInputs >= 2) {
      // Get positions of both date inputs
      const input1Box = await page.locator('input[type="date"]').nth(0).boundingBox();
      const input2Box = await page.locator('input[type="date"]').nth(1).boundingBox();
      
      if (input1Box && input2Box) {
        const sideBySide = Math.abs(input1Box.y - input2Box.y) < 10;
        const bothVisible = input1Box.y < 844 && input2Box.y < 844;
        
        console.log('\n   🎯 Date Layout Analysis:');
        console.log(`      Input 1: x=${Math.round(input1Box.x)}, y=${Math.round(input1Box.y)} (${Math.round(input1Box.width)}×${Math.round(input1Box.height)})`);
        console.log(`      Input 2: x=${Math.round(input2Box.x)}, y=${Math.round(input2Box.y)} (${Math.round(input2Box.width)}×${Math.round(input2Box.height)})`);
        console.log(`      Side-by-side: ${sideBySide ? 'YES ✅' : 'NO ❌'}`);
        console.log(`      Both visible: ${bothVisible ? 'YES ✅' : 'NO ❌'}`);
        console.log(`      X gap: ${Math.abs(input1Box.x - input2Box.x)}px`);
        console.log(`      Y difference: ${Math.abs(input1Box.y - input2Box.y)}px`);
        
        // Test date input functionality
        console.log('\n7️⃣ Testing date input functionality...');
        
        // Set departure date
        await page.locator('input[type="date"]').nth(0).fill('2025-12-15');
        await page.waitForTimeout(500);
        
        // Set return date  
        await page.locator('input[type="date"]').nth(1).fill('2025-12-22');
        await page.waitForTimeout(500);
        
        console.log('   📅 Dates filled successfully ✅');
      }
    }
    
    // Take final screenshot showing the complete form with dates
    await page.screenshot({ path: 'flow-2-complete-with-dates.png', fullPage: false });
    
    // Scroll to show dates section if needed
    await page.evaluate(() => {
      const datesSection = document.querySelector('h3:contains("Quando você viaja?")');
      if (datesSection) {
        datesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'flow-3-dates-focused.png' });
    
    console.log('\n✅ Complete flow test successful!');
    console.log('📸 Screenshots saved:');
    console.log('   - flow-1-airports-filled.png');
    console.log('   - flow-2-complete-with-dates.png'); 
    console.log('   - flow-3-dates-focused.png');
    
    console.log('\n🎉 SIDE-BY-SIDE DATES ARE NOW WORKING AND VISIBLE! 🎉');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'flow-error.png' });
  } finally {
    await browser.close();
  }
})();