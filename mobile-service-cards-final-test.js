const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testMobileServiceCardsFinal() {
  console.log('🚀 Starting Final Mobile Service Cards Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: [],
    summary: {}
  };
  
  try {
    console.log('📱 Navigating to localhost:3001...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('✅ Page loaded, waiting for network idle...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'mobile-final-initial.png',
      fullPage: true
    });
    console.log('📸 Initial screenshot captured');
    
    // Wait for service buttons to be loaded
    await page.waitForSelector('.page_serviceButton__kz94S.page_mobileServiceButton__6ez6W', { timeout: 15000 });
    console.log('✅ Service buttons loaded');
    
    // Get all service buttons and identify them by index
    const serviceButtons = await page.$$('.page_serviceButton__kz94S.page_mobileServiceButton__6ez6W');
    console.log(`📋 Found ${serviceButtons.length} service buttons`);
    
    // Define service cards by their expected order (based on DOM analysis)
    const serviceCards = [
      { type: 'voos', index: 0, icon: '✈️', name: 'Voos' },
      { type: 'hoteis', index: 1, icon: '🏨', name: 'Hotéis' },
      { type: 'carros', index: 2, icon: '🚗', name: 'Carros' },
      { type: 'tours', index: 3, icon: '🎯', name: 'Tours' },
      { type: 'seguro', index: 4, icon: '🛡️', name: 'Seguro' }
    ];
    
    for (const card of serviceCards) {
      console.log(`\n🔍 Testing ${card.type.toUpperCase()} service card (index ${card.index})...`);
      
      try {
        // Select button by index
        if (card.index >= serviceButtons.length) {
          console.log(`⚠️  Button index ${card.index} out of range (only ${serviceButtons.length} buttons found)`);
          continue;
        }
        
        const button = serviceButtons[card.index];
        
        // Get button info
        const buttonInfo = await button.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            text: el.textContent?.trim(),
            classes: el.className,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            visible: rect.width > 0 && rect.height > 0,
            inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
            styles: {
              position: style.position,
              zIndex: style.zIndex,
              display: style.display
            }
          };
        });
        
        console.log(`📊 Button ${card.index} (${card.type}) info:`, {
          text: buttonInfo.text.substring(0, 50) + '...',
          visible: buttonInfo.visible,
          inViewport: buttonInfo.inViewport,
          position: buttonInfo.rect
        });
        
        // Take screenshot before clicking
        await page.screenshot({ 
          path: `mobile-${card.type}-before-click.png`,
          fullPage: true
        });
        
        // Get initial page state
        const initialState = await page.evaluate(() => ({
          scrollY: window.scrollY,
          bodyHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight
        }));
        
        // Click the button
        console.log(`👆 Clicking ${card.type} service card...`);
        await button.click();
        
        // Wait for any animations or state changes
        await page.waitForTimeout(3000);
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: `mobile-${card.type}-after-click.png`,
          fullPage: true
        });
        
        // Analyze what happened after the click
        const postClickState = await page.evaluate((cardType) => {
          const state = {
            cardType,
            scroll: {
              x: window.scrollX,
              y: window.scrollY,
              maxY: document.body.scrollHeight - window.innerHeight
            },
            body: {
              scrollHeight: document.body.scrollHeight,
              clientHeight: document.body.clientHeight,
              style: {
                height: document.body.style.height,
                overflow: document.body.style.overflow
              }
            },
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            overlaysAndForms: [],
            visibleElements: []
          };
          
          // Look for any newly appeared overlays, modals, or forms
          const selectors = [
            'div[class*="overlay"]',
            'div[class*="modal"]', 
            'div[class*="form"]',
            'form',
            'div[style*="position: fixed"]',
            'div[style*="position: absolute"]',
            '[class*="Mobile"][class*="Form"]',
            '[class*="mobile"][class*="form"]'
          ];
          
          selectors.forEach(selector => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach((el, idx) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                
                if (rect.width > 50 && rect.height > 50) { // Only consider substantial elements
                  const elementData = {
                    selector,
                    index: idx,
                    tag: el.tagName,
                    classes: el.className,
                    id: el.id,
                    rect: {
                      x: rect.x,
                      y: rect.y,
                      width: rect.width,
                      height: rect.height,
                      top: rect.top,
                      bottom: rect.bottom,
                      left: rect.left,
                      right: rect.right
                    },
                    styles: {
                      position: style.position,
                      zIndex: style.zIndex,
                      top: style.top,
                      left: style.left,
                      display: style.display,
                      visibility: style.visibility,
                      opacity: style.opacity,
                      transform: style.transform,
                      height: style.height,
                      maxHeight: style.maxHeight
                    },
                    visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.opacity !== '0',
                    inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
                    fullyInViewport: rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth,
                    text: el.textContent ? el.textContent.substring(0, 100) : ''
                  };
                  
                  state.overlaysAndForms.push(elementData);
                  
                  if (elementData.visible) {
                    state.visibleElements.push(elementData);
                  }
                }
              });
            } catch (e) {
              // Skip selectors that cause errors
            }
          });
          
          return state;
        }, card.type);
        
        // Analyze behavior
        const scrolledDown = postClickState.scroll.y > initialState.scrollY;
        const hasVisibleOverlay = postClickState.visibleElements.some(el => 
          el.inViewport && (el.classes.toLowerCase().includes('form') || el.tag === 'FORM')
        );
        const hasPartialOverlay = postClickState.visibleElements.some(el => 
          el.visible && (el.classes.toLowerCase().includes('form') || el.tag === 'FORM')
        );
        
        let behaviorType;
        let status;
        
        if (hasVisibleOverlay && !scrolledDown) {
          behaviorType = 'overlay-correct';
          status = 'working';
        } else if (scrolledDown && !hasVisibleOverlay) {
          behaviorType = 'scrolled-below';
          status = 'broken';
        } else if (hasPartialOverlay && scrolledDown) {
          behaviorType = 'partial-overlay-with-scroll';
          status = 'broken';
        } else if (hasPartialOverlay && !scrolledDown) {
          behaviorType = 'partial-overlay';
          status = 'partial';
        } else {
          behaviorType = 'no-response';
          status = 'error';
        }
        
        console.log(`📊 ${card.type} Analysis:`, {
          status,
          behaviorType,
          scrolledDown,
          scrollY: postClickState.scroll.y,
          hasVisibleOverlay,
          visibleElements: postClickState.visibleElements.length,
          totalElements: postClickState.overlaysAndForms.length
        });
        
        // Store results
        const testResult = {
          cardType: card.type,
          cardName: card.name,
          cardIcon: card.icon,
          index: card.index,
          status,
          behaviorType,
          buttonInfo,
          initialState,
          postClickState,
          analysis: {
            scrolledDown,
            scrollDistance: postClickState.scroll.y - initialState.scrollY,
            hasVisibleOverlay,
            hasPartialOverlay,
            visibleFormsCount: postClickState.visibleElements.filter(el => 
              el.classes.toLowerCase().includes('form') || el.tag === 'FORM'
            ).length,
            totalElementsFound: postClickState.overlaysAndForms.length
          },
          screenshots: {
            before: `mobile-${card.type}-before-click.png`,
            after: `mobile-${card.type}-after-click.png`
          }
        };
        
        results.testResults.push(testResult);
        
        // Try to close any opened forms/overlays
        try {
          console.log(`🔄 Attempting to close ${card.type} overlay...`);
          
          // Try different methods to close
          const closeMethods = [
            () => page.click('button:has-text("✕")'),
            () => page.click('button[aria-label*="close"]'),
            () => page.click('button[aria-label*="Close"]'),
            () => page.keyboard.press('Escape'),
            () => page.click('body', { position: { x: 50, y: 50 } }) // Click outside
          ];
          
          for (const closeMethod of closeMethods) {
            try {
              await closeMethod();
              await page.waitForTimeout(1000);
              
              // Check if overlay closed
              const currentScrollY = await page.evaluate(() => window.scrollY);
              if (currentScrollY < postClickState.scroll.y) {
                console.log(`✅ Successfully closed ${card.type} overlay`);
                break;
              }
            } catch (closeError) {
              // Continue to next method
            }
          }
          
          // Scroll back to top
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.log(`⚠️  Could not close ${card.type} overlay:`, error.message);
        }
        
      } catch (error) {
        console.error(`❌ Error testing ${card.type}:`, error.message);
        results.testResults.push({
          cardType: card.type,
          cardName: card.name,
          status: 'error',
          behaviorType: 'error',
          error: error.message
        });
      }
    }
    
    // Generate summary
    const working = results.testResults.filter(r => r.status === 'working');
    const broken = results.testResults.filter(r => r.status === 'broken');
    const partial = results.testResults.filter(r => r.status === 'partial');
    const errors = results.testResults.filter(r => r.status === 'error');
    
    results.summary = {
      total: results.testResults.length,
      working: working.length,
      broken: broken.length,
      partial: partial.length,
      errors: errors.length,
      workingCards: working.map(r => r.cardType),
      brokenCards: broken.map(r => r.cardType),
      partialCards: partial.map(r => r.cardType),
      errorCards: errors.map(r => r.cardType)
    };
    
    console.log('\n📈 FINAL TEST SUMMARY:');
    console.log(`✅ Working correctly: ${results.summary.workingCards.join(', ') || 'none'}`);
    console.log(`❌ Broken (scrolled below): ${results.summary.brokenCards.join(', ') || 'none'}`);
    console.log(`⚠️  Partially working: ${results.summary.partialCards.join(', ') || 'none'}`);
    console.log(`🚫 Errors: ${results.summary.errorCards.join(', ') || 'none'}`);
    
    // Save results
    await fs.writeFile('mobile-service-cards-final-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Final results saved to mobile-service-cards-final-results.json');
    
    // Generate final report
    const report = generateFinalReport(results);
    await fs.writeFile('MOBILE-SERVICE-CARDS-ANALYSIS-REPORT.md', report);
    console.log('📄 📄 COMPREHENSIVE REPORT SAVED TO: MOBILE-SERVICE-CARDS-ANALYSIS-REPORT.md');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

function generateFinalReport(results) {
  let report = `# 🔍 Mobile Service Cards Analysis Report\n\n`;
  report += `**Test Date:** ${results.timestamp}\n`;
  report += `**Environment:** localhost:3001 (mobile viewport 375x667)\n`;
  report += `**Test Framework:** Playwright\n\n`;
  
  report += `## 🎯 Executive Summary\n\n`;
  
  const { summary } = results;
  report += `**Total Cards Tested:** ${summary.total}\n\n`;
  
  report += `| Status | Count | Cards | Description |\n`;
  report += `|--------|-------|-------|-------------|\n`;
  report += `| ✅ Working | ${summary.working} | ${summary.workingCards.join(', ') || 'None'} | Opens as overlay correctly |\n`;
  report += `| ❌ Broken | ${summary.broken} | ${summary.brokenCards.join(', ') || 'None'} | Scrolls page instead of overlay |\n`;
  report += `| ⚠️ Partial | ${summary.partial} | ${summary.partialCards.join(', ') || 'None'} | Overlay partially visible |\n`;
  report += `| 🚫 Error | ${summary.errors} | ${summary.errorCards.join(', ') || 'None'} | Failed to test |\n\n`;
  
  if (summary.broken > 0) {
    report += `## 🚨 Critical Issues Identified\n\n`;
    report += `**${summary.broken} cards are opening below the viewport instead of as overlays:**\n`;
    summary.brokenCards.forEach(card => {
      report += `- **${card.toUpperCase()}:** Form appears below page, causing unwanted scroll\n`;
    });
    report += `\n`;
  }
  
  report += `## 📊 Detailed Analysis\n\n`;
  
  results.testResults.forEach(result => {
    const statusIcon = {
      'working': '✅',
      'broken': '❌',
      'partial': '⚠️',
      'error': '🚫'
    }[result.status] || '❓';
    
    report += `### ${statusIcon} ${result.cardType?.toUpperCase() || 'UNKNOWN'}\n\n`;
    
    if (result.error) {
      report += `**Error:** ${result.error}\n\n`;
      return;
    }
    
    report += `**Button:** ${result.cardIcon} ${result.cardName}\n`;
    report += `**Status:** ${result.status} (${result.behaviorType})\n`;
    
    if (result.analysis) {
      const analysis = result.analysis;
      report += `**Scroll Behavior:** ${analysis.scrolledDown ? 'Page scrolled' : 'No scroll'}\n`;
      if (analysis.scrollDistance > 0) {
        report += `**Scroll Distance:** ${analysis.scrollDistance}px\n`;
      }
      report += `**Overlay Detection:** ${analysis.hasVisibleOverlay ? 'Visible overlay found' : 'No visible overlay'}\n`;
      report += `**Form Elements Found:** ${analysis.visibleFormsCount} visible, ${analysis.totalElementsFound} total\n`;
      
      if (result.postClickState.visibleElements.length > 0) {
        report += `\n**Visible Elements After Click:**\n`;
        result.postClickState.visibleElements.forEach((el, idx) => {
          if (idx < 3) { // Limit to first 3 elements
            report += `- ${el.tag}.${el.classes.split(' ')[0]} (${el.rect.width}×${el.rect.height}px)\n`;
            report += `  - Position: ${el.styles.position}, Z-Index: ${el.styles.zIndex}\n`;
            report += `  - In Viewport: ${el.inViewport}, Fully Visible: ${el.fullyInViewport}\n`;
          }
        });
      }
    }
    
    report += `\n**Screenshots:**\n`;
    report += `- Before: \`${result.screenshots.before}\`\n`;
    report += `- After: \`${result.screenshots.after}\`\n\n`;
    
    // Add specific issue analysis
    if (result.status === 'broken') {
      report += `**🔧 Issue:** The form is opening below the visible area instead of as a proper overlay\n`;
      report += `**💡 Root Cause:** Likely CSS positioning issue - form is not using fixed positioning or has incorrect z-index\n`;
      report += `**🎯 Suggested Fix:**\n`;
      report += `- Ensure form container uses \`position: fixed\`\n`;
      report += `- Set appropriate \`top: 0\` or \`top: 50%\` with \`transform: translateY(-50%)\`\n`;
      report += `- Verify high \`z-index\` (e.g., 1000+)\n`;
      report += `- Add \`height: 100vh\` or \`max-height: 100vh\` constraints\n\n`;
    } else if (result.status === 'partial') {
      report += `**🔧 Issue:** Form overlay is partially outside viewport\n`;
      report += `**💡 Suggested Fix:** Check form dimensions and positioning relative to viewport\n\n`;
    }
  });
  
  report += `## 🎯 Recommendations\n\n`;
  
  if (summary.broken > 0) {
    report += `### High Priority Fixes\n\n`;
    report += `The broken cards (${summary.brokenCards.join(', ')}) need immediate attention:\n\n`;
    report += `1. **CSS Positioning Fix:**\n`;
    report += `   \`\`\`css\n`;
    report += `   .mobile-form-overlay {\n`;
    report += `     position: fixed;\n`;
    report += `     top: 0;\n`;
    report += `     left: 0;\n`;
    report += `     width: 100vw;\n`;
    report += `     height: 100vh;\n`;
    report += `     z-index: 1000;\n`;
    report += `     background: rgba(0, 0, 0, 0.5);\n`;
    report += `   }\n`;
    report += `   \`\`\`\n\n`;
    
    report += `2. **Form Container Fix:**\n`;
    report += `   \`\`\`css\n`;
    report += `   .mobile-form-container {\n`;
    report += `     position: fixed;\n`;
    report += `     top: 50%;\n`;
    report += `     left: 50%;\n`;
    report += `     transform: translate(-50%, -50%);\n`;
    report += `     max-height: 90vh;\n`;
    report += `     overflow-y: auto;\n`;
    report += `   }\n`;
    report += `   \`\`\`\n\n`;
  }
  
  if (summary.working > 0) {
    report += `### ✅ Working Cards Reference\n\n`;
    report += `The working cards (${summary.workingCards.join(', ')}) can serve as templates for the broken ones.\n`;
    report += `Examine their CSS implementation for correct positioning patterns.\n\n`;
  }
  
  report += `### Testing Validation\n\n`;
  report += `After implementing fixes, validate with:\n`;
  report += `- Form opens as overlay without page scroll\n`;
  report += `- Form is fully contained within viewport\n`;
  report += `- Close button/outside click works correctly\n`;
  report += `- No layout shift when opening/closing form\n\n`;
  
  report += `## 📝 Files Generated\n\n`;
  report += `This test generated the following artifacts:\n`;
  report += `- **Screenshots:** Before/after images for each service card\n`;
  report += `- **JSON Data:** \`mobile-service-cards-final-results.json\`\n`;
  report += `- **This Report:** \`MOBILE-SERVICE-CARDS-ANALYSIS-REPORT.md\`\n\n`;
  
  report += `---\n`;
  report += `*Report generated automatically by Playwright mobile testing framework*\n`;
  
  return report;
}

// Run the final test
testMobileServiceCardsFinal().catch(console.error);