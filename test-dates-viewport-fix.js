const { chromium } = require('playwright');

console.log('🚀 TESTING DATES VIEWPORT FIX');
console.log('=============================\n');

async function testDatesViewportFix() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Open flight form
    const flightCard = await page.$('text=/voos/i');
    if (flightCard) {
      await flightCard.click();
      await page.waitForTimeout(2000);
    }

    // Check if dates section is now visible in viewport
    const datesAnalysis = await page.evaluate(() => {
      const datesHeader = Array.from(document.querySelectorAll('h3')).find(h => 
        h.textContent?.includes('Quando você viaja')
      );
      
      if (!datesHeader) return { found: false };
      
      const datesContainer = datesHeader.closest('[class*="space-y-3"]');
      const rect = datesContainer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if all main sections are visible
      const tripTypeSection = document.querySelector('h3[text*="Tipo de viagem"], h3').closest('[class*="space-y"]');
      const tripTypeRect = tripTypeSection ? tripTypeSection.getBoundingClientRect() : null;
      
      return {
        found: true,
        viewport: {
          height: viewportHeight,
          width: window.innerWidth
        },
        tripTypeSection: tripTypeRect ? {
          top: tripTypeRect.top,
          bottom: tripTypeRect.bottom,
          height: tripTypeRect.height
        } : null,
        datesSection: {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          width: rect.width
        },
        datesVisible: rect.top >= 0 && rect.bottom <= viewportHeight,
        datesOverflow: rect.bottom > viewportHeight,
        totalContentHeight: Math.max(rect.bottom, tripTypeRect?.bottom || 0),
        spaceSaved: null // Will calculate based on previous measurements
      };
    });
    
    console.log('VIEWPORT ANALYSIS:');
    console.log('==================');
    console.log(`Viewport: ${datesAnalysis.viewport.width}x${datesAnalysis.viewport.height}`);
    console.log(`Total content height: ${datesAnalysis.totalContentHeight}px`);
    
    if (datesAnalysis.tripTypeSection) {
      console.log(`\nTrip Type Section: top=${datesAnalysis.tripTypeSection.top}px, bottom=${datesAnalysis.tripTypeSection.bottom}px`);
    }
    
    console.log(`\nDates Section: top=${datesAnalysis.datesSection.top}px, bottom=${datesAnalysis.datesSection.bottom}px`);
    console.log(`Dates visible in viewport: ${datesAnalysis.datesVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`Dates overflow viewport: ${datesAnalysis.datesOverflow ? '❌ YES - still overflowing' : '✅ NO - fits perfectly'}`);
    
    if (datesAnalysis.datesOverflow) {
      const overflow = datesAnalysis.datesSection.bottom - datesAnalysis.viewport.height;
      console.log(`\n🚨 STILL ${overflow}px overflow! Need more optimization.`);
    } else {
      console.log(`\n🎉 SUCCESS! Dates section now fits within viewport!`);
    }
    
    // Take screenshot to verify visually
    await page.screenshot({ 
      path: 'test-dates-viewport-fixed.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot saved: test-dates-viewport-fixed.png');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testDatesViewportFix().catch(console.error);