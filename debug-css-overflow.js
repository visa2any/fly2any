const { chromium } = require('playwright');

console.log('🔍 DEBUGGING CSS OVERFLOW ISSUE');
console.log('===============================\n');

async function debugCSSOverflow() {
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

    // Check container heights and overflow
    const containerInfo = await page.evaluate(() => {
      // Find all relevant containers
      const containers = [
        document.querySelector('[class*="space-y-6 h-full flex flex-col"]'),
        document.querySelector('[class*="flex-1 px-4 py-4 overflow-y-auto"]'),
        document.querySelector('[class*="flex-1 flex flex-col"]')
      ].filter(Boolean);
      
      return containers.map((container, i) => {
        const rect = container.getBoundingClientRect();
        const styles = getComputedStyle(container);
        return {
          index: i,
          classes: container.className,
          height: rect.height,
          scrollHeight: container.scrollHeight,
          overflow: styles.overflow,
          overflowY: styles.overflowY,
          maxHeight: styles.maxHeight,
          position: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right
          }
        };
      });
    });
    
    console.log('CONTAINER ANALYSIS:');
    console.log('==================');
    containerInfo.forEach((info, i) => {
      console.log(`\nContainer ${i + 1}:`);
      console.log(`  Classes: ${info.classes}`);
      console.log(`  Height: ${info.height}px`);
      console.log(`  ScrollHeight: ${info.scrollHeight}px`);
      console.log(`  Overflow: ${info.overflow}`);
      console.log(`  OverflowY: ${info.overflowY}`);
      console.log(`  MaxHeight: ${info.maxHeight}`);
      console.log(`  Position: top=${info.position.top}, bottom=${info.position.bottom}`);
      console.log(`  Content cut off: ${info.scrollHeight > info.height ? 'YES' : 'NO'}`);
    });
    
    // Check dates section specifically
    const datesAnalysis = await page.evaluate(() => {
      const datesHeader = Array.from(document.querySelectorAll('h3')).find(h => 
        h.textContent?.includes('Quando você viaja')
      );
      
      if (!datesHeader) return { found: false };
      
      const datesContainer = datesHeader.closest('[class*="space-y-3"]');
      const rect = datesContainer.getBoundingClientRect();
      const parentRect = datesContainer.parentElement.getBoundingClientRect();
      
      return {
        found: true,
        datesPosition: {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          height: rect.height,
          width: rect.width
        },
        parentPosition: {
          top: parentRect.top,
          bottom: parentRect.bottom,
          height: parentRect.height
        },
        isVisible: rect.height > 0 && rect.width > 0,
        isInViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
        isClippedByParent: rect.bottom > parentRect.bottom || rect.top < parentRect.top
      };
    });
    
    console.log('\nDATES SECTION ANALYSIS:');
    console.log('=======================');
    if (datesAnalysis.found) {
      console.log('Dates Container Position:', datesAnalysis.datesPosition);
      console.log('Parent Container Position:', datesAnalysis.parentPosition);
      console.log(`Visible: ${datesAnalysis.isVisible}`);
      console.log(`In Viewport: ${datesAnalysis.isInViewport}`);  
      console.log(`Clipped by Parent: ${datesAnalysis.isClippedByParent}`);
      
      if (datesAnalysis.isClippedByParent) {
        console.log('🚨 ISSUE FOUND: Dates section is being clipped by parent container!');
      }
      if (!datesAnalysis.isInViewport) {
        console.log('🚨 ISSUE FOUND: Dates section is outside viewport!');
      }
    } else {
      console.log('❌ Dates section not found in DOM');
    }
    
    // Check if we can scroll to reveal the dates
    await page.evaluate(() => {
      const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot after scrolling
    await page.screenshot({ 
      path: 'debug-after-scroll.png', 
      fullPage: false 
    });
    console.log('\n📸 Screenshot after scroll: debug-after-scroll.png');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugCSSOverflow().catch(console.error);