const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 390, height: 844 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    hasTouch: true,
    isMobile: true
  });
  
  const page = await context.newPage();
  
  console.log('🚀 Testing Date Inputs Specifically...');
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page loaded');
    
    await page.waitForTimeout(2000);
    
    // Try to click on Voos card
    const voosCard = await page.locator('button', { hasText: 'Voos' }).first();
    if (await voosCard.isVisible()) {
      await voosCard.click();
      console.log('✅ Clicked on Voos card');
      await page.waitForTimeout(1500);
      
      // Navigate through steps to find date inputs
      for (let i = 0; i < 5; i++) {
        // Check if we have date inputs on current step
        const dateInputCount = await page.locator('input[type="date"]').count();
        console.log(`Step ${i + 1}: Found ${dateInputCount} date input(s)`);
        
        if (dateInputCount > 0) {
          console.log('✅ Found date inputs! Testing...');
          
          const dateInputs = await page.locator('input[type="date"]').all();
          for (let j = 0; j < dateInputs.length; j++) {
            const dateInput = dateInputs[j];
            await dateInput.focus();
            console.log(`✅ Focused date input ${j + 1}`);
            
            // Check no modals appeared
            const modals = await page.locator('.mobile-date-picker-modal, .fixed.inset-0.bg-black').count();
            console.log(`   📋 Modals after focus: ${modals}`);
          }
          
          await page.screenshot({ path: `date-inputs-step-${i + 1}.png` });
          console.log(`📸 Screenshot saved for step ${i + 1}`);
          break;
        }
        
        // Try to go to next step
        const nextBtn = await page.locator('button:has-text("Próximo")').first();
        if (await nextBtn.isVisible()) {
          await nextBtn.click();
          console.log(`   → Moved to step ${i + 2}`);
          await page.waitForTimeout(1000);
        } else {
          console.log('   → No more steps');
          break;
        }
      }
    } else {
      console.log('⚠️ Voos card not found, trying other options...');
      
      // Try the search button
      const searchBtn = await page.locator('button:has-text("Buscar Ofertas")').first();
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
        console.log('✅ Clicked search button instead');
      }
    }
    
    // Final modal check
    const finalModalCount = await page.locator('.mobile-date-picker-modal, [class*="modal"], .fixed.inset-0.bg-black').count();
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   🔍 Total modals found: ${finalModalCount}`);
    console.log(`   📅 Date inputs behavior: ${finalModalCount === 0 ? '✅ INLINE/NATIVE' : '❌ STILL MODAL'}`);
    
    if (finalModalCount === 0) {
      console.log('\n🎉 SUCCESS: NO MODAL DATE PICKERS - MISSION ACCOMPLISHED!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Date input verification complete');
  }
})();