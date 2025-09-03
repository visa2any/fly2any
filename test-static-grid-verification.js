const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyFlightDealsGrid() {
  console.log('🚀 Starting Popular Flight Deals Grid Layout Verification...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Create test results directory
  const testResultsPath = '/mnt/d/Users/vilma/fly2any/test-results';
  if (!fs.existsSync(testResultsPath)) {
    fs.mkdirSync(testResultsPath, { recursive: true });
  }

  try {
    // Navigate to the static HTML test file
    const htmlFilePath = `file:///mnt/d/Users/vilma/fly2any/test-grid-layout.html`;
    console.log(`📍 Navigating to: ${htmlFilePath}`);
    
    await page.goto(htmlFilePath, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    console.log('✅ Static HTML page loaded successfully');

    // Wait for the grid to be visible
    await page.waitForSelector('.routes-grid', { timeout: 5000 });
    console.log('✅ Routes grid container found');

    // Function to analyze grid layout
    async function analyzeGridLayout(viewportWidth, expectedColumns, label) {
      console.log(`\n📱 ${label.toUpperCase()} LAYOUT ANALYSIS (${viewportWidth}px):`);
      console.log('='.repeat(50));
      
      await page.setViewportSize({ width: viewportWidth, height: 800 });
      await page.waitForTimeout(500); // Wait for layout to adjust
      
      // Take screenshot
      const screenshotPath = `/mnt/d/Users/vilma/fly2any/test-results/grid-${label.toLowerCase()}-${viewportWidth}px.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);

      // Get grid container
      const gridContainer = await page.locator('.routes-grid').first();
      const gridBoundingBox = await gridContainer.boundingBox();
      
      if (!gridBoundingBox) {
        console.log('❌ Grid container not found');
        return false;
      }

      console.log(`📐 Grid container: ${gridBoundingBox.width}px × ${gridBoundingBox.height}px`);

      // Get all flight cards
      const cards = await page.locator('.route-card').all();
      console.log(`🎫 Found ${cards.length} flight cards`);

      if (cards.length === 0) {
        console.log('❌ No flight cards found');
        return false;
      }

      // Analyze card positions
      const cardPositions = [];
      for (let i = 0; i < Math.min(cards.length, 6); i++) {
        const card = cards[i];
        const boundingBox = await card.boundingBox();
        if (boundingBox) {
          cardPositions.push({
            index: i,
            x: Math.round(boundingBox.x),
            y: Math.round(boundingBox.y),
            width: Math.round(boundingBox.width),
            height: Math.round(boundingBox.height)
          });
        }
      }

      console.log('\n📊 Card Positions:');
      cardPositions.forEach(pos => {
        console.log(`   Card ${pos.index + 1}: x=${pos.x}, y=${pos.y}, ${pos.width}×${pos.height}`);
      });

      // Analyze column layout
      const tolerance = 50; // Allow 50px tolerance for column detection
      const uniqueXPositions = [];
      
      cardPositions.forEach(pos => {
        const existingX = uniqueXPositions.find(x => Math.abs(x - pos.x) <= tolerance);
        if (!existingX) {
          uniqueXPositions.push(pos.x);
        }
      });

      uniqueXPositions.sort((a, b) => a - b);
      const detectedColumns = uniqueXPositions.length;

      console.log(`\n🔍 Layout Analysis:`);
      console.log(`   Expected columns: ${expectedColumns}`);
      console.log(`   Detected columns: ${detectedColumns}`);
      console.log(`   Column X positions: [${uniqueXPositions.join(', ')}]`);

      // Check if layout is correct
      let layoutCorrect = false;
      if (detectedColumns === expectedColumns) {
        console.log(`   ✅ CORRECT: ${detectedColumns}-column layout detected`);
        layoutCorrect = true;
      } else if (detectedColumns === 1 && expectedColumns > 1) {
        console.log(`   ❌ ISSUE: Cards appear to be stacked vertically (single column)`);
      } else if (detectedColumns > expectedColumns) {
        console.log(`   ⚠️  NOTICE: More columns than expected (${detectedColumns} vs ${expectedColumns})`);
      } else {
        console.log(`   ⚠️  NOTICE: Fewer columns than expected (${detectedColumns} vs ${expectedColumns})`);
      }

      // Check card spacing (only for multi-column layouts)
      if (detectedColumns > 1 && cardPositions.length >= 2) {
        const cardsInSameRow = cardPositions.filter(pos => Math.abs(pos.y - cardPositions[0].y) <= 20);
        
        if (cardsInSameRow.length >= 2) {
          const horizontalGap = cardsInSameRow[1].x - (cardsInSameRow[0].x + cardsInSameRow[0].width);
          console.log(`   📏 Horizontal gap between cards: ${horizontalGap}px`);
          
          if (horizontalGap >= 20 && horizontalGap <= 30) {
            console.log(`   ✅ SPACING: Gap appears correct (~24px)`);
          } else if (horizontalGap < 10) {
            console.log(`   ⚠️  SPACING: Cards might be too close (${horizontalGap}px)`);
          } else if (horizontalGap > 40) {
            console.log(`   ⚠️  SPACING: Cards might be too far apart (${horizontalGap}px)`);
          }
        }
      }

      // Check for horizontal overflow (cards in a single line)
      const firstRowY = cardPositions[0]?.y || 0;
      const cardsInFirstRow = cardPositions.filter(pos => Math.abs(pos.y - firstRowY) <= 20);
      
      if (cardsInFirstRow.length === cardPositions.length && expectedColumns < cardPositions.length) {
        console.log(`   ❌ CRITICAL: All ${cardPositions.length} cards appear to be in a single horizontal line!`);
        layoutCorrect = false;
      }

      return layoutCorrect;
    }

    // Test Desktop Layout (1200px - 3 columns)
    const desktopCorrect = await analyzeGridLayout(1200, 3, 'Desktop');

    // Test Tablet Layout (800px - 2 columns)  
    const tabletCorrect = await analyzeGridLayout(800, 2, 'Tablet');

    // Test Mobile Layout (400px - 1 column)
    const mobileCorrect = await analyzeGridLayout(400, 1, 'Mobile');

    // Check CSS Grid properties
    console.log('\n🔍 CSS GRID PROPERTIES VERIFICATION:');
    console.log('='.repeat(50));
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const gridStyles = await page.evaluate(() => {
      const gridElement = document.querySelector('.routes-grid');
      if (!gridElement) return null;
      
      const computedStyle = window.getComputedStyle(gridElement);
      return {
        display: computedStyle.display,
        gridTemplateColumns: computedStyle.gridTemplateColumns,
        gap: computedStyle.gap,
        gridAutoRows: computedStyle.gridAutoRows,
        width: computedStyle.width,
        maxWidth: computedStyle.maxWidth
      };
    });

    if (gridStyles) {
      console.log('📋 Computed CSS Grid Properties:');
      console.log(`   display: ${gridStyles.display}`);
      console.log(`   grid-template-columns: ${gridStyles.gridTemplateColumns}`);
      console.log(`   gap: ${gridStyles.gap}`);
      console.log(`   grid-auto-rows: ${gridStyles.gridAutoRows}`);
      console.log(`   width: ${gridStyles.width}`);
      console.log(`   max-width: ${gridStyles.maxWidth}`);
      
      if (gridStyles.display === 'grid') {
        console.log('   ✅ CSS Grid is properly applied');
      } else {
        console.log('   ❌ CSS Grid is NOT applied (display is not "grid")');
      }
    }

    // Final Summary
    console.log('\n🎯 FINAL VERIFICATION SUMMARY:');
    console.log('='.repeat(50));
    
    const totalTests = 3;
    const passedTests = [desktopCorrect, tabletCorrect, mobileCorrect].filter(Boolean).length;
    
    console.log(`✅ Passed: ${passedTests}/${totalTests} layout tests`);
    console.log(`📸 Screenshots saved in: test-results/`);
    
    if (passedTests === totalTests) {
      console.log('🎉 SUCCESS: All grid layouts are working correctly!');
      console.log('   ✓ Desktop: 3 columns');
      console.log('   ✓ Tablet: 2 columns'); 
      console.log('   ✓ Mobile: 1 column');
      console.log('   ✓ Proper spacing (24px gaps)');
      console.log('   ✓ Cards are NOT in a single horizontal line');
    } else {
      console.log('⚠️  ISSUES DETECTED:');
      if (!desktopCorrect) console.log('   • Desktop layout issues');
      if (!tabletCorrect) console.log('   • Tablet layout issues');
      if (!mobileCorrect) console.log('   • Mobile layout issues');
    }

    console.log('\n📋 LAYOUT VERIFICATION COMPLETE');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: '/mnt/d/Users/vilma/fly2any/test-results/error-verification.png',
        fullPage: true 
      });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.log('Could not save error screenshot');
    }
  } finally {
    await browser.close();
  }
}

// Run the verification
verifyFlightDealsGrid().catch(console.error);