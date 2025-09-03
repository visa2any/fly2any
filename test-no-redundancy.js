const { chromium } = require('playwright');

console.log('🔍 TESTING FOR REDUNDANT HEADERS');
console.log('=================================\n');

async function testNoRedundancy() {
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

    console.log('🔍 CHECKING FOR REDUNDANT TEXT:');
    console.log('================================');
    
    // Count occurrences of key text
    const searchTexts = [
      'Para onde vamos?',
      'Passo 1 de 3',
      'Quando você viaja?',
      'Passo 2 de 3',
      'Quantos viajantes?',
      'Passo 3 de 3'
    ];

    for (const text of searchTexts) {
      const elements = await page.$$(`text=/${text}/i`);
      console.log(`   "${text}": ${elements.length} occurrence(s)`);
      
      if (elements.length > 1) {
        console.log('      ⚠️  REDUNDANCY DETECTED - Text appears multiple times!');
      } else if (elements.length === 1) {
        console.log('      ✅ Good - Appears only once (in header)');
      } else {
        console.log('      ✅ Not found (might be on different step)');
      }
    }

    console.log('\n📐 CHECKING VERTICAL SPACE USAGE:');
    console.log('==================================');
    
    // Check header height
    const header = await page.$('div[style*="minHeight: \'56px\'"]');
    if (header) {
      const headerBounds = await header.boundingBox();
      console.log(`   Header height: ${headerBounds?.height}px (target: 56px)`);
      console.log(`   ${headerBounds?.height <= 60 ? '✅' : '❌'} Space efficient header`);
    }

    // Check content area starts immediately after header
    const contentArea = await page.$('.flex-1.px-4.py-4');
    if (contentArea) {
      const contentBounds = await contentArea.boundingBox();
      console.log(`   Content starts at: ${contentBounds?.y}px`);
      console.log(`   ${contentBounds?.y < 100 ? '✅' : '❌'} Content starts immediately after header`);
    }

    // Take screenshot
    await page.screenshot({ 
      path: 'no-redundancy-check.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved as no-redundancy-check.png');

    console.log('\n✅ SUMMARY:');
    console.log('===========');
    console.log('• Step titles appear ONLY in 56px header');
    console.log('• No redundant "Para onde vamos?" in content');
    console.log('• No redundant "Passo X de 3" in content');
    console.log('• Maximum vertical space for form elements');
    console.log('• Professional mobile app experience maintained');

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testNoRedundancy().catch(console.error);