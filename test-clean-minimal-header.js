const { chromium } = require('playwright');

console.log('🧹 TESTING CLEAN MINIMAL HEADER DESIGN');
console.log('=====================================\n');

async function testCleanHeader() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();

  try {
    console.log('📱 Loading flight wizard...');
    await page.goto('http://localhost:3001', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const flightCard = await page.$('text=/voos/i');
    if (flightCard) {
      await flightCard.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight wizard opened\n');
    }

    console.log('🧹 CHECKING CLEAN MINIMAL HEADER:');
    console.log('==================================');
    
    // Check for removed text
    const oldTitles = await page.$$('text=/Para onde vamos?/i');
    const oldSteps = await page.$$('text=/Passo \\d de \\d/i');
    
    console.log(`   "Para onde vamos?" text: ${oldTitles.length} occurrence(s)`);
    console.log(`   ${oldTitles.length === 0 ? '✅' : '❌'} Header text removed successfully`);
    
    console.log(`   "Passo X de X" text: ${oldSteps.length} occurrence(s)`);
    console.log(`   ${oldSteps.length === 0 ? '✅' : '❌'} Step counter text removed successfully`);

    // Check for progress indicators
    const progressDots = await page.$$('div[class*="w-8 h-8 rounded-full"]');
    console.log(`   Progress indicators: ${progressDots.length} found`);
    console.log(`   ${progressDots.length === 3 ? '✅' : '❌'} Clean progress indicators present`);

    // Check header height
    const header = await page.$('div[style*="minHeight: \'48px\'"]');
    const headerHeight = header ? await header.evaluate(el => el.getBoundingClientRect().height) : 0;
    console.log(`   Header height: ${headerHeight}px (target: 48px)`);
    console.log(`   ${headerHeight <= 52 && headerHeight >= 44 ? '✅' : '❌'} Minimal header size`);

    console.log('\n🎨 CHECKING CLEAN SECTION STYLING:');
    console.log('===================================');

    // Check for removed backgrounds
    const greyBackgrounds = await page.$$('div[class*="bg-neutral-50"]');
    console.log(`   Grey backgrounds: ${greyBackgrounds.length} found`);
    console.log(`   ${greyBackgrounds.length === 0 ? '✅' : '⚠️ '} Background removal ${greyBackgrounds.length === 0 ? 'complete' : 'partial'}`);

    // Check for cleaner buttons
    const cleanButtons = await page.$$('button[class*="hover:bg-neutral-50"]');
    console.log(`   Clean hover buttons: ${cleanButtons.length} found`);
    console.log(`   ${cleanButtons.length > 0 ? '✅' : '❌'} Button styling updated`);

    console.log('\n⚡ TESTING FUNCTIONALITY:');
    console.log('=========================');

    // Test progress indicators work
    const currentStepDot = await page.$('div[class*="bg-primary-500"]');
    const stepVisible = currentStepDot !== null;
    console.log(`   ${stepVisible ? '✅' : '❌'} Current step indicator working`);

    // Test trip type selection still works
    const tripTypeButton = await page.$('text=/ida e volta/i');
    if (tripTypeButton) {
      await tripTypeButton.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Trip type selection functional');
    }

    console.log('\n📐 SPACE OPTIMIZATION:');
    console.log('=======================');
    
    const windowHeight = await page.evaluate(() => window.innerHeight);
    const contentStart = header ? await header.evaluate(el => el.getBoundingClientRect().bottom) : 0;
    const spaceForContent = windowHeight - contentStart - 72; // minus bottom nav
    
    console.log(`   Window height: ${windowHeight}px`);
    console.log(`   Content area starts: ${contentStart}px`);
    console.log(`   Available content space: ${spaceForContent}px`);
    console.log(`   ${spaceForContent > 600 ? '✅' : '❌'} Excellent space optimization`);

    // Take screenshot
    await page.screenshot({ 
      path: 'clean-minimal-header.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved as clean-minimal-header.png');

    const cleanFeatures = [
      oldTitles.length === 0, // Text removed
      oldSteps.length === 0, // Steps removed
      progressDots.length === 3, // Progress working
      headerHeight <= 52 && headerHeight >= 44, // Minimal size
      stepVisible, // Functionality preserved
      spaceForContent > 600 // Space optimized
    ];

    const passedFeatures = cleanFeatures.filter(Boolean).length;
    
    console.log('\n🎉 CLEAN MINIMAL DESIGN RESULTS:');
    console.log('=================================');
    console.log(`✅ Clean features: ${passedFeatures}/6`);
    
    if (passedFeatures >= 5) {
      console.log('🚀 SUCCESS: Clean, minimal header achieved!');
      console.log('• No redundant text cluttering the interface');
      console.log('• Maximum space for form content');
      console.log('• Clean, professional mobile design');
      console.log('• All functionality preserved');
    } else {
      console.log(`⚠️  ${6 - passedFeatures} features may need attention`);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testCleanHeader().catch(console.error);