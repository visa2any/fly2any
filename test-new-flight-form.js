const { chromium } = require('playwright');

(async () => {
  console.log('🎯 Testing NEW MobileFlightForm with Side-by-Side Dates\n');
  
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
    await page.waitForTimeout(4000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'new-1-homepage.png' });
    
    console.log('2️⃣ Clicking on "Voos" service...');
    const voosButton = page.locator('text=Voos').first();
    await voosButton.click();
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking Voos
    await page.screenshot({ path: 'new-2-flight-form-opened.png' });
    
    console.log('3️⃣ Analyzing NEW MobileFlightForm structure...');
    
    // Check for the new form elements
    const formElements = {
      'Buscar Voos heading': await page.locator('text="Buscar Voos"').count(),
      'Tipo de viagem section': await page.locator('text="Tipo de viagem"').count(),
      'Ida e volta button': await page.locator('text="Ida e volta"').count(),
      'Origem e destino section': await page.locator('text="Origem e destino"').count(),
      'De onde input': await page.locator('input[placeholder="Cidade de origem"]').count(),
      'Para onde input': await page.locator('input[placeholder="Cidade de destino"]').count(),
      'Quando você viaja section': await page.locator('text="Quando você viaja?"').count(),
      'Date inputs': await page.locator('input[type="date"]').count(),
    };
    
    console.log('\n   📋 NEW FORM ELEMENTS FOUND:');
    Object.entries(formElements).forEach(([key, count]) => {
      console.log(`      ${key}: ${count > 0 ? `✅ ${count}` : '❌ 0'}`);
    });
    
    console.log('\n4️⃣ Testing SIDE-BY-SIDE DATES...');
    
    // Check date inputs positions
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`   📅 Total date inputs found: ${dateInputs}`);
    
    if (dateInputs >= 2) {
      // Get position of both date inputs
      const input1 = page.locator('input[type="date"]').nth(0);
      const input2 = page.locator('input[type="date"]').nth(1);
      
      const box1 = await input1.boundingBox();
      const box2 = await input2.boundingBox();
      
      if (box1 && box2) {
        const sideBySide = Math.abs(box1.y - box2.y) < 15; // Allow small difference
        const properSpacing = Math.abs(box1.x - box2.x) > 100; // Should have good spacing
        
        console.log('\n   🎯 SIDE-BY-SIDE DATE ANALYSIS:');
        console.log(`      Input 1 (Ida): x=${Math.round(box1.x)}, y=${Math.round(box1.y)} (${Math.round(box1.width)}×${Math.round(box1.height)})`);
        console.log(`      Input 2 (Volta): x=${Math.round(box2.x)}, y=${Math.round(box2.y)} (${Math.round(box2.width)}×${Math.round(box2.height)})`);
        console.log(`      Same row (side-by-side): ${sideBySide ? '✅ YES' : '❌ NO'}`);
        console.log(`      Proper spacing: ${properSpacing ? '✅ YES' : '❌ NO'}`);
        console.log(`      Y difference: ${Math.abs(box1.y - box2.y)}px`);
        console.log(`      X difference: ${Math.abs(box1.x - box2.x)}px`);
        
        // Overall assessment
        const success = sideBySide && properSpacing;
        console.log(`\n   🎉 SIDE-BY-SIDE DATES: ${success ? '✅ WORKING PERFECTLY!' : '❌ NEEDS FIXING'}`);
        
        // Test date labels
        const label1 = await page.locator('text="Data de ida"').count();
        const label2 = await page.locator('text="Data de volta"').count();
        
        console.log('\n   🏷️ DATE LABELS:');
        console.log(`      "Data de ida": ${label1 > 0 ? '✅ Found' : '❌ Missing'}`);
        console.log(`      "Data de volta": ${label2 > 0 ? '✅ Found' : '❌ Missing'}`);
        
        // Test date functionality
        console.log('\n5️⃣ Testing date input functionality...');
        
        try {
          await input1.fill('2025-12-15');
          await page.waitForTimeout(500);
          
          await input2.fill('2025-12-22');
          await page.waitForTimeout(500);
          
          console.log('   ✅ Date inputs accept values successfully');
          
          // Check if date range preview appears
          const datePreview = await page.locator('text="15/12/2025"').count();
          console.log(`   📋 Date preview: ${datePreview > 0 ? '✅ Showing' : '⚠️ Not visible'}`);
          
        } catch (error) {
          console.log('   ❌ Error filling dates:', error.message);
        }
      }
    } else {
      console.log('   ❌ Not enough date inputs found for side-by-side test');
    }
    
    // Fill form to test complete flow
    console.log('\n6️⃣ Testing complete form interaction...');
    
    try {
      // Fill origin
      await page.locator('input[placeholder="Cidade de origem"]').fill('São Paulo');
      await page.waitForTimeout(500);
      
      // Fill destination
      await page.locator('input[placeholder="Cidade de destino"]').fill('Rio de Janeiro');
      await page.waitForTimeout(500);
      
      console.log('   ✅ Origin and destination filled');
      
      // Check if search button is enabled
      const searchButton = page.locator('text="Buscar Voos"').last();
      const isEnabled = await searchButton.isEnabled();
      console.log(`   🔍 Search button enabled: ${isEnabled ? '✅ YES' : '❌ NO'}`);
      
    } catch (error) {
      console.log('   ❌ Error during form interaction:', error.message);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'new-3-form-completed.png', fullPage: true });
    
    console.log('\n✅ NEW MOBILEFLIGHTFORM TEST COMPLETED!');
    console.log('📸 Screenshots saved:');
    console.log('   - new-1-homepage.png');
    console.log('   - new-2-flight-form-opened.png'); 
    console.log('   - new-3-form-completed.png');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    await page.screenshot({ path: 'new-error.png' });
  } finally {
    await browser.close();
  }
})();