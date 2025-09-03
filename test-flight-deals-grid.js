const { chromium } = require('playwright');

async function testFlightDealsGrid() {
  console.log('🚀 Starting Popular Flight Deals Grid Verification...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the flights page
    console.log('📍 Navigating to http://localhost:3000/flights');
    await page.goto('http://localhost:3000/flights', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for page to load completely
    console.log('⏳ Waiting for page to load completely...');
    await page.waitForTimeout(3000);

    // Wait for the Popular Flight Deals section to be visible
    console.log('🔍 Looking for Popular Flight Deals section...');
    
    try {
      await page.waitForSelector('text="Popular Flight Deals"', { timeout: 10000 });
      console.log('✅ Popular Flight Deals section found');
    } catch (error) {
      console.log('❌ Popular Flight Deals section not found, checking for alternative selectors...');
      
      // Try to find any grid-like structure
      const gridSelectors = [
        '[class*="grid"]',
        '[class*="deals"]',
        '[class*="flight"]',
        '.grid',
        '.deals-grid',
        '.flight-deals'
      ];
      
      for (const selector of gridSelectors) {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found grid element with selector: ${selector}`);
          break;
        }
      }
    }

    // Take initial desktop screenshot
    console.log('📸 Taking desktop screenshot (1200px width)...');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/flight-deals-desktop.png',
      fullPage: true 
    });

    // Analyze desktop grid layout
    console.log('\n🔍 DESKTOP LAYOUT ANALYSIS (1200px):');
    
    // Look for grid container
    const gridContainers = await page.locator('[class*="grid"], .grid, [style*="grid"], [style*="column"]').all();
    
    if (gridContainers.length > 0) {
      console.log(`✅ Found ${gridContainers.length} potential grid container(s)`);
      
      for (let i = 0; i < gridContainers.length; i++) {
        const container = gridContainers[i];
        const boundingBox = await container.boundingBox();
        
        if (boundingBox) {
          console.log(`   Container ${i + 1}: ${boundingBox.width}px × ${boundingBox.height}px`);
          
          // Check children/cards
          const children = await container.locator('> *').all();
          console.log(`   - Contains ${children.length} child elements`);
          
          // Check if elements are arranged in columns
          if (children.length >= 3) {
            const positions = [];
            for (const child of children.slice(0, 6)) { // Check first 6 elements
              const box = await child.boundingBox();
              if (box) {
                positions.push({ x: box.x, y: box.y, width: box.width, height: box.height });
              }
            }
            
            // Analyze layout pattern
            const uniqueXPositions = [...new Set(positions.map(p => Math.round(p.x / 50) * 50))].sort();
            console.log(`   - Detected ${uniqueXPositions.length} column(s) at X positions: ${uniqueXPositions.join(', ')}`);
            
            if (uniqueXPositions.length === 3) {
              console.log('   ✅ CORRECT: 3-column layout detected on desktop');
            } else if (uniqueXPositions.length === 1) {
              console.log('   ❌ ISSUE: Elements appear to be in a single column/row');
            } else {
              console.log(`   ⚠️  NOTICE: ${uniqueXPositions.length} columns detected (expected 3)`);
            }
          }
        }
      }
    } else {
      console.log('❌ No grid containers found');
    }

    // Test tablet view (800px)
    console.log('\n📱 TABLET LAYOUT ANALYSIS (800px):');
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/flight-deals-tablet.png',
      fullPage: true 
    });

    // Analyze tablet grid layout
    const tabletContainers = await page.locator('[class*="grid"], .grid, [style*="grid"], [style*="column"]').all();
    
    if (tabletContainers.length > 0) {
      for (let i = 0; i < tabletContainers.length; i++) {
        const container = tabletContainers[i];
        const children = await container.locator('> *').all();
        
        if (children.length >= 2) {
          const positions = [];
          for (const child of children.slice(0, 4)) {
            const box = await child.boundingBox();
            if (box) {
              positions.push({ x: box.x, y: box.y });
            }
          }
          
          const uniqueXPositions = [...new Set(positions.map(p => Math.round(p.x / 50) * 50))].sort();
          console.log(`   Container ${i + 1}: ${uniqueXPositions.length} column(s) detected`);
          
          if (uniqueXPositions.length === 2) {
            console.log('   ✅ CORRECT: 2-column layout detected on tablet');
          } else {
            console.log(`   ⚠️  ${uniqueXPositions.length} columns detected (expected 2)`);
          }
        }
      }
    }

    // Test mobile view (400px)
    console.log('\n📱 MOBILE LAYOUT ANALYSIS (400px):');
    await page.setViewportSize({ width: 400, height: 600 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/flight-deals-mobile.png',
      fullPage: true 
    });

    // Analyze mobile grid layout
    const mobileContainers = await page.locator('[class*="grid"], .grid, [style*="grid"], [style*="column"]').all();
    
    if (mobileContainers.length > 0) {
      for (let i = 0; i < mobileContainers.length; i++) {
        const container = mobileContainers[i];
        const children = await container.locator('> *').all();
        
        if (children.length >= 1) {
          const positions = [];
          for (const child of children.slice(0, 3)) {
            const box = await child.boundingBox();
            if (box) {
              positions.push({ x: box.x, y: box.y });
            }
          }
          
          const uniqueXPositions = [...new Set(positions.map(p => Math.round(p.x / 30) * 30))].sort();
          console.log(`   Container ${i + 1}: ${uniqueXPositions.length} column(s) detected`);
          
          if (uniqueXPositions.length === 1) {
            console.log('   ✅ CORRECT: 1-column layout detected on mobile');
          } else {
            console.log(`   ⚠️  ${uniqueXPositions.length} columns detected (expected 1)`);
          }
        }
      }
    }

    // Check for hydration errors
    console.log('\n🔍 CHECKING FOR HYDRATION ERRORS:');
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait and collect any errors
    await page.waitForTimeout(2000);
    
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('hydration') || 
      error.includes('Hydration') || 
      error.includes('mismatch') ||
      error.includes('server-rendered HTML')
    );

    if (hydrationErrors.length === 0) {
      console.log('✅ No hydration errors detected');
    } else {
      console.log(`❌ Found ${hydrationErrors.length} hydration error(s):`);
      hydrationErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    // Check spacing between cards
    console.log('\n📏 CHECKING CARD SPACING:');
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    const cards = await page.locator('[class*="card"], [class*="deal"], .card, .deal').all();
    
    if (cards.length >= 2) {
      console.log(`✅ Found ${cards.length} card-like elements`);
      
      // Check spacing between first two cards
      const card1Box = await cards[0].boundingBox();
      const card2Box = await cards[1].boundingBox();
      
      if (card1Box && card2Box) {
        const horizontalGap = Math.abs(card2Box.x - (card1Box.x + card1Box.width));
        const verticalGap = Math.abs(card2Box.y - card1Box.y);
        
        console.log(`   Horizontal gap between cards: ${horizontalGap}px`);
        console.log(`   Vertical alignment difference: ${verticalGap}px`);
        
        if (horizontalGap >= 20 && horizontalGap <= 30) {
          console.log('   ✅ CORRECT: Spacing appears to be around 24px');
        } else if (horizontalGap < 10) {
          console.log('   ⚠️  Cards might be too close together');
        } else if (horizontalGap > 40) {
          console.log('   ⚠️  Cards might be too far apart');
        }
      }
    } else {
      console.log('❌ Less than 2 cards found for spacing analysis');
    }

    console.log('\n🎯 SUMMARY OF VERIFICATION RESULTS:');
    console.log('=====================================');
    
    // Get final page state
    const finalTitle = await page.title();
    const finalUrl = page.url();
    
    console.log(`Page Title: ${finalTitle}`);
    console.log(`Final URL: ${finalUrl}`);
    console.log('Screenshots saved:');
    console.log('  - Desktop: test-results/flight-deals-desktop.png');
    console.log('  - Tablet: test-results/flight-deals-tablet.png');
    console.log('  - Mobile: test-results/flight-deals-mobile.png');
    
    console.log('\n✅ Verification completed successfully!');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: '/mnt/d/Users/vilma/fly2any/test-results/error-screenshot.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved to test-results/error-screenshot.png');
    } catch (screenshotError) {
      console.log('Could not save error screenshot');
    }
  } finally {
    await browser.close();
  }
}

// Create test results directory
const fs = require('fs');
const path = '/mnt/d/Users/vilma/fly2any/test-results';
if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
}

// Run the test
testFlightDealsGrid().catch(console.error);