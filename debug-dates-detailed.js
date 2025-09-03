const { chromium } = require('playwright');

console.log('🔍 DETAILED DATES SECTION ANALYSIS');
console.log('=================================\n');

async function debugDatesDetailed() {
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

    // Get detailed breakdown of all elements in step 1
    const detailedAnalysis = await page.evaluate(() => {
      const stepContainer = document.querySelector('[class*="space-y-3 h-full flex flex-col"]');
      if (!stepContainer) return { error: 'Step container not found' };
      
      const result = {
        stepContainer: {
          height: stepContainer.offsetHeight,
          scrollHeight: stepContainer.scrollHeight,
          rect: stepContainer.getBoundingClientRect()
        },
        sections: []
      };
      
      // Analyze each direct child section
      Array.from(stepContainer.children).forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const styles = getComputedStyle(child);
        
        let sectionName = 'Unknown';
        const heading = child.querySelector('h3');
        if (heading) {
          sectionName = heading.textContent?.trim() || 'Unnamed section';
        } else if (child.textContent?.includes('Ida e volta')) {
          sectionName = 'Trip Type Selection';
        }
        
        const sectionInfo = {
          index,
          name: sectionName,
          height: rect.height,
          width: rect.width,
          top: rect.top,
          bottom: rect.bottom,
          padding: {
            top: parseFloat(styles.paddingTop),
            bottom: parseFloat(styles.paddingBottom),
            left: parseFloat(styles.paddingLeft),
            right: parseFloat(styles.paddingRight)
          },
          margin: {
            top: parseFloat(styles.marginTop),
            bottom: parseFloat(styles.marginBottom),
            left: parseFloat(styles.marginLeft),
            right: parseFloat(styles.marginRight)
          },
          classes: child.className,
          childrenCount: child.children.length
        };
        
        // For dates section, get more details
        if (sectionName.includes('viaja')) {
          const dateInputs = child.querySelectorAll('input[type="date"]');
          sectionInfo.dateInputs = Array.from(dateInputs).map(input => ({
            height: input.getBoundingClientRect().height,
            classes: input.className
          }));
        }
        
        result.sections.push(sectionInfo);
      });
      
      return result;
    });
    
    console.log('STEP CONTAINER ANALYSIS:');
    console.log('========================');
    console.log(`Container height: ${detailedAnalysis.stepContainer.height}px`);
    console.log(`Container scroll height: ${detailedAnalysis.stepContainer.scrollHeight}px`);
    console.log(`Container position: top=${detailedAnalysis.stepContainer.rect.top}px, bottom=${detailedAnalysis.stepContainer.rect.bottom}px`);
    
    console.log('\nSECTION BREAKDOWN:');
    console.log('==================');
    detailedAnalysis.sections.forEach((section, i) => {
      console.log(`\n${i + 1}. ${section.name}`);
      console.log(`   Height: ${section.height}px`);
      console.log(`   Position: top=${section.top}px, bottom=${section.bottom}px`);
      console.log(`   Padding: ${section.padding.top}px top, ${section.padding.bottom}px bottom`);
      console.log(`   Margin: ${section.margin.top}px top, ${section.margin.bottom}px bottom`);
      console.log(`   Children: ${section.childrenCount}`);
      
      if (section.dateInputs) {
        console.log(`   Date inputs: ${section.dateInputs.length} found`);
        section.dateInputs.forEach((input, idx) => {
          console.log(`     Input ${idx + 1}: ${input.height}px tall`);
        });
      }
      
      if (section.height > 200) {
        console.log(`   🚨 LARGE SECTION! This section takes ${section.height}px`);
      }
    });
    
    // Calculate total height and viewport fit
    const totalUsedHeight = detailedAnalysis.sections.reduce((sum, section) => sum + section.height, 0);
    const viewportHeight = 844;
    
    console.log(`\nTOTAL ANALYSIS:`);
    console.log(`===============`);
    console.log(`Total sections height: ${totalUsedHeight}px`);
    console.log(`Viewport height: ${viewportHeight}px`);
    console.log(`Overflow: ${totalUsedHeight - viewportHeight}px`);
    
    if (totalUsedHeight > viewportHeight) {
      console.log(`\n🚨 Need to save ${totalUsedHeight - viewportHeight}px more!`);
    } else {
      console.log(`\n🎉 Content fits within viewport!`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'debug-dates-detailed.png', 
      fullPage: false 
    });
    console.log('\n📸 Detailed screenshot: debug-dates-detailed.png');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDatesDetailed().catch(console.error);