const { chromium } = require('playwright');

async function testAccordionDates() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  
  try {
    console.log('🎯 Testing Accordion-style Dates Section');
    
    // Mobile test with detailed navigation
    const mobileContext = await browser.newContext({
      viewport: { width: 360, height: 640 }
    });
    
    const mobilePage = await mobileContext.newPage();
    
    // Navigate and open flight form
    console.log('📱 Opening flight form...');
    await mobilePage.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.waitForTimeout(2000);
    
    // Click flight service
    await mobilePage.locator('button:has-text("✈️VoosPassagens aéreas")').click();
    await mobilePage.waitForTimeout(2000);
    
    console.log('📱 Looking for all clickable elements that might expand sections...');
    
    // Try to find accordion sections or clickable areas
    const allClickable = await mobilePage.locator('button, [role="button"], .cursor-pointer, div[class*="cursor"], [onclick]').all();
    console.log(`📱 Found ${allClickable.length} clickable elements`);
    
    // Look specifically for text that might indicate dates section
    const possibleDateTriggers = [
      'text=Datas',
      'text=Data',
      'text=Quando',
      'text=Partida',
      'text=Retorno',
      '[data-section="dates"]',
      'button:has-text("Datas")',
      'div:has-text("Datas")',
      '.accordion:has-text("Data")'
    ];
    
    for (const trigger of possibleDateTriggers) {
      try {
        const elements = await mobilePage.locator(trigger).all();
        console.log(`📱 Found ${elements.length} elements matching "${trigger}"`);
        
        for (const element of elements) {
          const text = await element.textContent();
          const isVisible = await element.isVisible();
          console.log(`📱   - "${text}" (visible: ${isVisible})`);
          
          if (isVisible && text && text.toLowerCase().includes('data')) {
            console.log(`📱 Clicking on dates trigger: "${text}"`);
            await element.click();
            await mobilePage.waitForTimeout(2000);
            
            // Take screenshot after click
            await mobilePage.screenshot({ 
              path: `mobile-after-clicking-${text.replace(/\s+/g, '-').toLowerCase()}.png`,
              fullPage: true 
            });
            
            // Check if date inputs appeared
            const dateInputs = await mobilePage.locator('input[type="date"]').all();
            console.log(`📱 Date inputs after clicking: ${dateInputs.length}`);
            
            if (dateInputs.length >= 2) {
              console.log('✅ Found date inputs! Analyzing layout...');
              
              // Focus on the dates area
              await dateInputs[0].scrollIntoViewIfNeeded();
              await mobilePage.waitForTimeout(1000);
              
              // Get positions
              const positions = [];
              for (let i = 0; i < Math.min(dateInputs.length, 2); i++) {
                const box = await dateInputs[i].boundingBox();
                if (box) {
                  positions.push({
                    index: i,
                    x: Math.round(box.x),
                    y: Math.round(box.y),
                    width: Math.round(box.width),
                    height: Math.round(box.height)
                  });
                }
              }
              
              console.log('📱 Date input positions:');
              positions.forEach(pos => {
                console.log(`   Input ${pos.index}: x=${pos.x}, y=${pos.y}, w=${pos.width}, h=${pos.height}`);
              });
              
              if (positions.length >= 2) {
                const sideBySide = Math.abs(positions[0].y - positions[1].y) < 30;
                const gap = Math.abs(positions[0].x - positions[1].x);
                const totalWidth = positions[0].width + positions[1].width;
                const availableWidth = 360 - 40; // Assuming some padding
                
                console.log(`📱 Layout analysis:`);
                console.log(`   Side-by-side: ${sideBySide}`);
                console.log(`   Horizontal gap: ${gap}px`);
                console.log(`   Total input width: ${totalWidth}px`);
                console.log(`   Available width: ${availableWidth}px`);
                console.log(`   Fits side-by-side: ${totalWidth + gap < availableWidth}`);
              }
              
              // Take final screenshot with dates visible
              await mobilePage.screenshot({ 
                path: 'mobile-final-dates-visible.png',
                fullPage: true 
              });
              
              // Take cropped screenshot of just the dates area
              if (positions.length >= 2) {
                const minX = Math.min(positions[0].x, positions[1].x) - 20;
                const minY = Math.min(positions[0].y, positions[1].y) - 30;
                const maxX = Math.max(positions[0].x + positions[0].width, positions[1].x + positions[1].width) + 20;
                const maxY = Math.max(positions[0].y + positions[0].height, positions[1].y + positions[1].height) + 30;
                
                await mobilePage.screenshot({
                  path: 'mobile-dates-closeup.png',
                  clip: {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY
                  }
                });
                console.log('✅ Cropped dates screenshot saved');
              }
              
              break;
            }
          }
        }
      } catch (e) {
        console.log(`📱 Error with "${trigger}": ${e.message}`);
      }
    }
    
    // If still no dates found, try navigating through steps
    console.log('📱 Trying step navigation...');
    for (let step = 2; step <= 5; step++) {
      try {
        const stepButton = mobilePage.locator(`button:has-text("${step}")`).first();
        if (await stepButton.isVisible()) {
          console.log(`📱 Clicking step ${step}...`);
          await stepButton.click();
          await mobilePage.waitForTimeout(2000);
          
          const dateInputs = await mobilePage.locator('input[type="date"]').all();
          if (dateInputs.length >= 2) {
            console.log(`✅ Found dates on step ${step}!`);
            
            await mobilePage.screenshot({ 
              path: `mobile-dates-step-${step}.png`,
              fullPage: true 
            });
            
            // Scroll to dates and take focused screenshot
            await dateInputs[0].scrollIntoViewIfNeeded();
            await mobilePage.waitForTimeout(1000);
            
            await mobilePage.screenshot({ 
              path: `mobile-dates-focused-step-${step}.png`,
              fullPage: true 
            });
            
            break;
          }
        }
      } catch (e) {
        // Step doesn't exist or error
      }
    }
    
    await mobileContext.close();
    
    console.log('\n✅ Test completed! Check screenshots for side-by-side dates implementation.');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testAccordionDates();