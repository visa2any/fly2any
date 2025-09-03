const { chromium } = require('playwright');

console.log('🎯 FINAL VIEWPORT OPTIMIZATION TEST');
console.log('==================================\n');

async function finalViewportTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  
  const page = await context.newPage();

  try {
    console.log('Waiting for dev server to be ready...');
    
    // Wait longer and retry if needed
    let retries = 5;
    let connected = false;
    
    while (retries > 0 && !connected) {
      try {
        await page.goto('http://localhost:3000', { timeout: 10000 });
        connected = true;
      } catch (error) {
        console.log(`Retry ${6 - retries}: ${error.message}`);
        retries--;
        await page.waitForTimeout(2000);
      }
    }
    
    if (!connected) {
      throw new Error('Could not connect to dev server after 5 retries');
    }

    await page.waitForTimeout(3000);
    
    // Open flight form
    console.log('Opening flight form...');
    const flightCard = await page.$('text=/voos/i');
    if (flightCard) {
      await flightCard.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('Flight card not found, taking screenshot for debug');
      await page.screenshot({ path: 'flight-card-not-found.png' });
    }

    // Final viewport analysis
    const finalAnalysis = await page.evaluate(() => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Find dates section
      const datesHeader = Array.from(document.querySelectorAll('h3')).find(h => 
        h.textContent?.includes('Quando você viaja')
      );
      
      if (!datesHeader) {
        return { 
          success: false, 
          error: 'Dates section not found',
          viewport: { height: viewportHeight, width: viewportWidth }
        };
      }
      
      const datesContainer = datesHeader.closest('[class*="space-y"]');
      const datesRect = datesContainer.getBoundingClientRect();
      
      // Find step container for total height
      const stepContainer = document.querySelector('[class*="space-y-3 h-full flex flex-col"]');
      const stepRect = stepContainer ? stepContainer.getBoundingClientRect() : null;
      
      const results = {
        success: true,
        viewport: {
          height: viewportHeight,
          width: viewportWidth
        },
        dates: {
          found: true,
          top: datesRect.top,
          bottom: datesRect.bottom,
          height: datesRect.height,
          visible: datesRect.top >= 0 && datesRect.bottom <= viewportHeight,
          fullyVisible: datesRect.top >= 0 && datesRect.bottom <= viewportHeight
        },
        step: stepRect ? {
          height: stepRect.height,
          bottom: stepRect.bottom,
          fitsInViewport: stepRect.bottom <= viewportHeight
        } : null,
        optimization: {
          overflow: Math.max(0, datesRect.bottom - viewportHeight),
          spaceSaved: null, // We don't have baseline to compare
          status: datesRect.bottom <= viewportHeight ? 'SUCCESS' : 'NEEDS_MORE_WORK'
        }
      };
      
      return results;
    });
    
    console.log('\n🎯 FINAL ANALYSIS:');
    console.log('==================');
    console.log(`Viewport: ${finalAnalysis.viewport.width}x${finalAnalysis.viewport.height}`);
    
    if (finalAnalysis.success) {
      console.log(`\nDates Section:`);
      console.log(`- Position: top=${finalAnalysis.dates.top}px, bottom=${finalAnalysis.dates.bottom}px`);
      console.log(`- Height: ${finalAnalysis.dates.height}px`);
      console.log(`- Visible: ${finalAnalysis.dates.visible ? '✅ YES' : '❌ NO'}`);
      console.log(`- Fully Visible: ${finalAnalysis.dates.fullyVisible ? '✅ YES' : '❌ NO'}`);
      
      if (finalAnalysis.step) {
        console.log(`\nStep Container:`);
        console.log(`- Total height: ${finalAnalysis.step.height}px`);
        console.log(`- Fits in viewport: ${finalAnalysis.step.fitsInViewport ? '✅ YES' : '❌ NO'}`);
      }
      
      console.log(`\nOptimization Status: ${finalAnalysis.optimization.status}`);
      
      if (finalAnalysis.optimization.overflow > 0) {
        console.log(`🚨 Still ${finalAnalysis.optimization.overflow}px overflow`);
      } else {
        console.log(`🎉 SUCCESS! All content fits within viewport!`);
      }
    } else {
      console.log(`❌ ${finalAnalysis.error}`);
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'final-viewport-test.png', 
      fullPage: false 
    });
    console.log('\n📸 Final screenshot: final-viewport-test.png');
    
  } catch (error) {
    console.log('❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

finalViewportTest().catch(console.error);