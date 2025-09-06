const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testMobileServiceCardsComprehensive() {
  console.log('🚀 Starting Comprehensive Mobile Service Cards Test...');
  
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
      path: 'mobile-comprehensive-initial.png',
      fullPage: true
    });
    console.log('📸 Initial screenshot captured');
    
    // Wait for service buttons to be loaded
    await page.waitForSelector('.page_serviceButton__kz94S.page_mobileServiceButton__6ez6W', { timeout: 15000 });
    console.log('✅ Service buttons loaded');
    
    // Define service cards with their expected text and identification
    const serviceCards = [
      { 
        type: 'voos', 
        buttonText: '✈️VoosPassagens aéreasPopular',
        expectedFormElements: ['origem', 'destino', 'data', 'passageiro'] 
      },
      { 
        type: 'hoteis', 
        buttonText: '🏨HotéisHospedagem',
        expectedFormElements: ['cidade', 'check-in', 'check-out', 'hóspede'] 
      },
      { 
        type: 'carros', 
        buttonText: '🚗CarrosAluguel',
        expectedFormElements: ['retirada', 'devolução', 'local'] 
      },
      { 
        type: 'tours', 
        buttonText: '🎯ToursExperiências',
        expectedFormElements: ['destino', 'data', 'pessoa'] 
      },
      { 
        type: 'seguro', 
        buttonText: '🛡️Seguro ViagemProteção completa',
        expectedFormElements: ['destino', 'data', 'cobertura'] 
      }
    ];
    
    for (const card of serviceCards) {
      console.log(`\n🔍 Testing ${card.type.toUpperCase()} service card...`);
      
      try {
        // Find the button by its text content
        const buttonSelector = `button.page_serviceButton__kz94S.page_mobileServiceButton__6ez6W:has-text("${card.buttonText.split('Popular')[0]}")`;
        
        // Take screenshot before clicking
        await page.screenshot({ 
          path: `mobile-${card.type}-before-click.png`,
          fullPage: true
        });
        
        console.log(`📍 Looking for button: ${buttonSelector}`);
        await page.waitForSelector(buttonSelector, { timeout: 5000 });
        
        // Get button position info before clicking
        const buttonInfo = await page.evaluate((selector) => {
          const button = document.querySelector(selector);
          if (!button) return null;
          
          const rect = button.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(button);
          
          return {
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            classes: button.className,
            text: button.textContent,
            styles: {
              position: computedStyle.position,
              zIndex: computedStyle.zIndex,
              display: computedStyle.display
            }
          };
        }, buttonSelector);
        
        console.log(`📊 Button info for ${card.type}:`, buttonInfo);
        
        // Click the service card
        console.log(`👆 Clicking ${card.type} service card...`);
        await page.click(buttonSelector);
        
        // Wait for potential form/overlay to appear
        console.log(`⏳ Waiting for ${card.type} form to appear...`);
        await page.waitForTimeout(3000); // Give time for animations
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: `mobile-${card.type}-after-click.png`,
          fullPage: true
        });
        
        // Analyze what happened after the click
        const postClickAnalysis = await page.evaluate((cardType) => {
          const analysis = {
            cardType,
            timestamp: new Date().toISOString(),
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            scroll: {
              x: window.scrollX,
              y: window.scrollY,
              maxX: document.body.scrollWidth - window.innerWidth,
              maxY: document.body.scrollHeight - window.innerHeight
            },
            body: {
              scrollHeight: document.body.scrollHeight,
              clientHeight: document.body.clientHeight,
              offsetHeight: document.body.offsetHeight,
              style: {
                height: document.body.style.height,
                overflow: document.body.style.overflow,
                position: document.body.style.position
              }
            },
            overlaysFound: [],
            formsFound: [],
            potentialIssues: []
          };
          
          // Look for overlays, modals, forms that might have appeared
          const potentialSelectors = [
            'div[class*="overlay"]',
            'div[class*="modal"]', 
            'div[class*="form"]',
            'form',
            'div[class*="mobile"]',
            'div[style*="position: fixed"]',
            'div[style*="position: absolute"]',
            'div[style*="z-index"]'
          ];
          
          potentialSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
              const rect = el.getBoundingClientRect();
              const computedStyle = window.getComputedStyle(el);
              
              if (rect.width > 50 && rect.height > 50) { // Only consider elements with some size
                const elementInfo = {
                  selector,
                  index,
                  tag: el.tagName,
                  classes: el.className,
                  id: el.id,
                  rect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    bottom: rect.bottom
                  },
                  styles: {
                    position: computedStyle.position,
                    zIndex: computedStyle.zIndex,
                    top: computedStyle.top,
                    left: computedStyle.left,
                    bottom: computedStyle.bottom,
                    right: computedStyle.right,
                    transform: computedStyle.transform,
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    height: computedStyle.height,
                    maxHeight: computedStyle.maxHeight,
                    overflow: computedStyle.overflow,
                    backgroundColor: computedStyle.backgroundColor
                  },
                  visible: rect.width > 0 && rect.height > 0,
                  inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
                  fullyInViewport: rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth,
                  text: el.textContent ? el.textContent.substring(0, 100) : ''
                };
                
                if (selector.includes('form') || el.tagName === 'FORM') {
                  analysis.formsFound.push(elementInfo);
                } else {
                  analysis.overlaysFound.push(elementInfo);
                }
              }
            });
          });
          
          // Check for positioning issues
          if (analysis.scroll.y > 0) {
            analysis.potentialIssues.push('Page scrolled after click - form might be positioned below viewport');
          }
          
          if (analysis.body.scrollHeight > window.innerHeight * 1.5) {
            analysis.potentialIssues.push('Body height significantly increased - possible layout issue');
          }
          
          // Check for elements positioned outside viewport
          const elementsOutsideViewport = analysis.overlaysFound.filter(el => !el.inViewport);
          if (elementsOutsideViewport.length > 0) {
            analysis.potentialIssues.push(`${elementsOutsideViewport.length} elements positioned outside viewport`);
          }
          
          return analysis;
        }, card.type);
        
        // Determine if the form appeared correctly
        const hasVisibleForm = postClickAnalysis.formsFound.some(f => f.visible && f.inViewport);
        const hasVisibleOverlay = postClickAnalysis.overlaysFound.some(o => o.visible && o.inViewport);
        const formAppeared = hasVisibleForm || hasVisibleOverlay;
        
        // Determine behavior type
        let behaviorType = 'unknown';
        if (postClickAnalysis.scroll.y > 0 && !formAppeared) {
          behaviorType = 'scrolled-below-viewport';
        } else if (formAppeared && postClickAnalysis.formsFound.some(f => f.fullyInViewport)) {
          behaviorType = 'overlay-correct';
        } else if (formAppeared && !postClickAnalysis.formsFound.some(f => f.fullyInViewport)) {
          behaviorType = 'overlay-partial';
        } else if (postClickAnalysis.potentialIssues.length > 0) {
          behaviorType = 'layout-issue';
        } else {
          behaviorType = 'no-response';
        }
        
        console.log(`📊 ${card.type} analysis:`, {
          behaviorType,
          formAppeared,
          scrollY: postClickAnalysis.scroll.y,
          formsFound: postClickAnalysis.formsFound.length,
          overlaysFound: postClickAnalysis.overlaysFound.length,
          issues: postClickAnalysis.potentialIssues
        });
        
        // Store comprehensive results
        const cardResult = {
          cardType: card.type,
          buttonText: card.buttonText,
          clickSuccessful: true,
          behaviorType,
          formAppeared,
          postClickAnalysis,
          screenshots: {
            before: `mobile-${card.type}-before-click.png`,
            after: `mobile-${card.type}-after-click.png`
          }
        };
        
        results.testResults.push(cardResult);
        
        // Try to close any opened form/overlay
        try {
          // Look for close buttons or click outside
          const closeButton = await page.$('button:has-text("✕"), button:has-text("Fechar"), button:has-text("×"), [aria-label*="close"], [aria-label*="Close"]');
          if (closeButton) {
            await closeButton.click();
            console.log(`✅ Closed ${card.type} form via close button`);
          } else {
            // Click outside to close
            await page.click('body', { position: { x: 10, y: 100 } });
            console.log(`✅ Attempted to close ${card.type} form via outside click`);
          }
          
          // Wait for close animation
          await page.waitForTimeout(1500);
        } catch (error) {
          console.log(`⚠️  Could not close ${card.type} form:`, error.message);
        }
        
      } catch (error) {
        console.error(`❌ Error testing ${card.type}:`, error.message);
        results.testResults.push({
          cardType: card.type,
          buttonText: card.buttonText,
          clickSuccessful: false,
          error: error.message,
          behaviorType: 'error'
        });
      }
    }
    
    // Generate comprehensive summary
    const workingCards = results.testResults.filter(r => r.behaviorType === 'overlay-correct');
    const brokenCards = results.testResults.filter(r => r.behaviorType === 'scrolled-below-viewport' || r.behaviorType === 'layout-issue');
    const partialCards = results.testResults.filter(r => r.behaviorType === 'overlay-partial');
    const errorCards = results.testResults.filter(r => r.behaviorType === 'error' || r.behaviorType === 'no-response');
    
    results.summary = {
      total: results.testResults.length,
      working: workingCards.length,
      broken: brokenCards.length,
      partial: partialCards.length,
      errors: errorCards.length,
      workingCards: workingCards.map(r => r.cardType),
      brokenCards: brokenCards.map(r => r.cardType),
      partialCards: partialCards.map(r => r.cardType),
      errorCards: errorCards.map(r => r.cardType)
    };
    
    console.log('\n📈 COMPREHENSIVE SUMMARY:');
    console.log(`✅ Working correctly: ${results.summary.workingCards.join(', ') || 'none'}`);
    console.log(`❌ Broken (scroll/layout issues): ${results.summary.brokenCards.join(', ') || 'none'}`);
    console.log(`⚠️  Partially working: ${results.summary.partialCards.join(', ') || 'none'}`);
    console.log(`🚫 Errors: ${results.summary.errorCards.join(', ') || 'none'}`);
    
    // Save comprehensive results
    await fs.writeFile('mobile-service-cards-comprehensive-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Comprehensive results saved to mobile-service-cards-comprehensive-results.json');
    
    // Generate detailed report
    const report = generateDetailedReport(results);
    await fs.writeFile('mobile-service-cards-detailed-report.md', report);
    console.log('📄 Detailed report saved to mobile-service-cards-detailed-report.md');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

function generateDetailedReport(results) {
  let report = `# 📱 Mobile Service Cards Comprehensive Test Report\n\n`;
  report += `**Generated:** ${results.timestamp}\n\n`;
  
  report += `## 📊 Executive Summary\n\n`;
  report += `| Status | Count | Cards |\n`;
  report += `|--------|-------|-------|\n`;
  report += `| ✅ Working Correctly | ${results.summary.working} | ${results.summary.workingCards.join(', ') || 'None'} |\n`;
  report += `| ❌ Broken (Layout Issues) | ${results.summary.broken} | ${results.summary.brokenCards.join(', ') || 'None'} |\n`;
  report += `| ⚠️ Partially Working | ${results.summary.partial} | ${results.summary.partialCards.join(', ') || 'None'} |\n`;
  report += `| 🚫 Errors | ${results.summary.errors} | ${results.summary.errorCards.join(', ') || 'None'} |\n\n`;
  
  report += `## 🔍 Detailed Analysis\n\n`;
  
  results.testResults.forEach(result => {
    const statusIcon = {
      'overlay-correct': '✅',
      'scrolled-below-viewport': '❌', 
      'overlay-partial': '⚠️',
      'layout-issue': '❌',
      'error': '🚫',
      'no-response': '🚫'
    }[result.behaviorType] || '❓';
    
    report += `### ${statusIcon} ${result.cardType.toUpperCase()}\n\n`;
    report += `**Behavior Type:** ${result.behaviorType}\n`;
    report += `**Form Appeared:** ${result.formAppeared ? 'Yes' : 'No'}\n`;
    
    if (result.error) {
      report += `**Error:** ${result.error}\n\n`;
      return;
    }
    
    if (result.postClickAnalysis) {
      const analysis = result.postClickAnalysis;
      
      report += `**Scroll Position After Click:** Y=${analysis.scroll.y}px, X=${analysis.scroll.x}px\n`;
      report += `**Body Height:** ${analysis.body.scrollHeight}px (viewport: ${analysis.viewport.height}px)\n`;
      report += `**Forms Found:** ${analysis.formsFound.length}\n`;
      report += `**Overlays Found:** ${analysis.overlaysFound.length}\n`;
      
      if (analysis.potentialIssues.length > 0) {
        report += `**Potential Issues:**\n`;
        analysis.potentialIssues.forEach(issue => {
          report += `- ${issue}\n`;
        });
      }
      
      if (analysis.formsFound.length > 0) {
        report += `\n**Form Details:**\n`;
        analysis.formsFound.forEach((form, index) => {
          report += `- **Form ${index + 1}:** ${form.classes}\n`;
          report += `  - Position: ${form.styles.position}\n`;
          report += `  - Z-Index: ${form.styles.zIndex}\n`;
          report += `  - In Viewport: ${form.inViewport}\n`;
          report += `  - Fully In Viewport: ${form.fullyInViewport}\n`;
          report += `  - Dimensions: ${form.rect.width}×${form.rect.height}\n`;
          report += `  - Top: ${form.rect.top}px\n\n`;
        });
      }
    }
    
    report += `**Screenshots:**\n`;
    report += `- 📸 Before: ${result.screenshots.before}\n`;
    report += `- 📸 After: ${result.screenshots.after}\n\n`;
    
    // Add behavior-specific recommendations
    if (result.behaviorType === 'scrolled-below-viewport') {
      report += `**💡 Issue:** Form appears below the viewport, causing page scroll instead of overlay\n`;
      report += `**🔧 Suggested Fix:** Check CSS positioning (position: fixed, top: 0, z-index) and ensure form container has proper height constraints\n\n`;
    } else if (result.behaviorType === 'overlay-partial') {
      report += `**💡 Issue:** Form appears but not fully within viewport\n`;
      report += `**🔧 Suggested Fix:** Verify form dimensions and positioning relative to viewport\n\n`;
    }
  });
  
  return report;
}

// Run the comprehensive test
testMobileServiceCardsComprehensive().catch(console.error);