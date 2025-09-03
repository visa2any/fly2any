const { chromium } = require('playwright');

console.log('🔍 DEBUGGING DOM STRUCTURE');
console.log('==========================\n');

async function debugDOMStructure() {
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

    // Get the full DOM structure of the step content
    const stepContent = await page.evaluate(() => {
      // Find the step content container
      const stepContainer = document.querySelector('[class*="space-y-6"]');
      if (!stepContainer) return 'Step container not found';
      
      function getElementInfo(el, depth = 0) {
        const indent = '  '.repeat(depth);
        const tag = el.tagName.toLowerCase();
        const classes = el.className ? ` class="${el.className}"` : '';
        const text = el.textContent?.trim().substring(0, 50) || '';
        const textDisplay = text ? ` (text: "${text}...")` : '';
        
        let result = `${indent}<${tag}${classes}>${textDisplay}\n`;
        
        // Only show first level children for readability
        if (depth < 3) {
          for (let child of el.children) {
            result += getElementInfo(child, depth + 1);
          }
        }
        
        return result;
      }
      
      return getElementInfo(stepContainer);
    });
    
    console.log('DOM STRUCTURE:');
    console.log('==============');
    console.log(stepContent);
    
    // Check specifically for dates section
    const datesSection = await page.evaluate(() => {
      const dates = document.querySelector('text=/Quando você viaja/') || 
                   document.querySelector('[class*="space-y-3"]:has(h3:contains("Quando você viaja"))') ||
                   Array.from(document.querySelectorAll('h3')).find(h => h.textContent?.includes('Quando você viaja'));
      
      if (dates) {
        const parent = dates.closest('div');
        return {
          found: true,
          visible: dates.offsetHeight > 0 && dates.offsetWidth > 0,
          parentClasses: parent?.className || 'no parent',
          computedStyle: getComputedStyle(parent || dates),
          text: dates.textContent
        };
      }
      return { found: false };
    });
    
    console.log('\nDATES SECTION ANALYSIS:');
    console.log('=======================');
    console.log(JSON.stringify(datesSection, null, 2));
    
    // Check all h3 elements to see what sections exist
    const allH3s = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h3')).map(h3 => ({
        text: h3.textContent?.trim(),
        visible: h3.offsetHeight > 0 && h3.offsetWidth > 0,
        classes: h3.className
      }));
    });
    
    console.log('\nALL SECTION HEADERS (h3):');
    console.log('==========================');
    allH3s.forEach((h3, i) => {
      console.log(`${i + 1}. "${h3.text}" - Visible: ${h3.visible} - Classes: ${h3.classes}`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDOMStructure().catch(console.error);