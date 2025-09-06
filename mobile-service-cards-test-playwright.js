const { chromium } = require('playwright');
const fs = require('fs').promises;

async function testMobileServiceCards() {
  console.log('🚀 Starting Playwright Mobile Service Cards Test...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 500, // Slow down for better visibility
    timeout: 60000 // Increase launch timeout
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();
  
  // Set longer timeout for all operations
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
      path: 'mobile-service-cards-initial.png',
      fullPage: true
    });
    console.log('✅ Initial screenshot captured');
    
    // Wait for service cards to be loaded (looking for mobile service buttons)
    await page.waitForSelector('.mobileServiceButton, .serviceButton', { timeout: 15000 });
    console.log('✅ Service cards loaded');
    
    // Get all service cards
    const serviceCards = await page.$$('.mobileServiceButton');
    console.log(`📋 Found ${serviceCards.length} service cards`);
    
    const cardTypes = ['voos', 'hoteis', 'carros', 'tours', 'seguro'];
    
    for (const cardType of cardTypes) {
      console.log(`\n🔍 Testing ${cardType.toUpperCase()} card...`);
      
      try {
        // Find the specific service card by content
        let cardSelector;
        if (cardType === 'voos') {
          cardSelector = 'button:has-text("Voos"), button:has-text("✈️")';
        } else if (cardType === 'hoteis') {
          cardSelector = 'button:has-text("Hotéis"), button:has-text("🏨")';
        } else if (cardType === 'carros') {
          cardSelector = 'button:has-text("Carros"), button:has-text("🚗")';
        } else if (cardType === 'tours') {
          cardSelector = 'button:has-text("Tours"), button:has-text("🎯")';
        } else if (cardType === 'seguro') {
          cardSelector = 'button:has-text("Seguro"), button:has-text("🛡️")';
        }
        
        await page.waitForSelector(cardSelector, { timeout: 5000 });
        
        // Get card element info before clicking
        const cardInfo = await page.evaluate((selector) => {
          const card = document.querySelector(selector);
          if (!card) return null;
          
          const rect = card.getBoundingClientRect();
          return {
            exists: true,
            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            classes: card.className,
            visible: rect.width > 0 && rect.height > 0
          };
        }, cardSelector);
        
        console.log(`📍 Card ${cardType} info:`, cardInfo);
        
        // Take screenshot before clicking
        await page.screenshot({ 
          path: `mobile-${cardType}-before-click.png`,
          fullPage: true
        });
        
        // Click the card
        console.log(`👆 Clicking ${cardType} card...`);
        await page.click(cardSelector);
        
        // Wait for form to appear (different wait strategies for different cards)
        let formSelector;
        if (cardType === 'voos') {
          formSelector = '.mobile-flight-form, [class*="flight"], [class*="Flight"], form:has-text("origem"), form:has-text("destino")';
        } else if (cardType === 'hoteis') {
          formSelector = '.mobile-hotel-form, [class*="hotel"], [class*="Hotel"], form:has-text("cidade"), form:has-text("check")';
        } else if (cardType === 'carros') {
          formSelector = '.mobile-car-form, [class*="car"], [class*="Car"], form:has-text("retirada"), form:has-text("devolução")';
        } else if (cardType === 'tours') {
          formSelector = '.mobile-tour-form, [class*="tour"], [class*="Tour"], form:has-text("destino"), form:has-text("data")';
        } else if (cardType === 'seguro') {
          formSelector = '.mobile-insurance-form, [class*="insurance"], [class*="Insurance"], form:has-text("seguro"), form:has-text("cobertura")';
        }
        
        // Wait for form to appear with multiple strategies
        let formAppeared = false;
        try {
          await page.waitForSelector(formSelector, { timeout: 3000 });
          formAppeared = true;
          console.log(`✅ Form appeared for ${cardType}`);
        } catch (error) {
          console.log(`⚠️  Form selector ${formSelector} not found, trying alternative approach...`);
          
          // Try waiting for any overlay or modal
          try {
            await page.waitForFunction(() => {
              // Check for various overlay indicators
              const overlays = document.querySelectorAll('[class*="overlay"], [class*="modal"], [class*="form"], [data-testid*="form"]');
              return overlays.length > 0;
            }, { timeout: 3000 });
            formAppeared = true;
            console.log(`✅ Some form/overlay appeared for ${cardType}`);
          } catch (e) {
            console.log(`❌ No form/overlay detected for ${cardType}`);
          }
        }
        
        // Wait a bit for animations
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking
        await page.screenshot({ 
          path: `mobile-${cardType}-after-click.png`,
          fullPage: true
        });
        
        // Get detailed DOM analysis after clicking
        const domAnalysis = await page.evaluate((cardType) => {
          const analysis = {
            cardType,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            body: {
              scrollHeight: document.body.scrollHeight,
              clientHeight: document.body.clientHeight,
              classes: document.body.className
            },
            overlays: [],
            forms: [],
            positioning: {}
          };
          
          // Find all potential overlays/modals
          const overlaySelectors = [
            '[class*="overlay"]',
            '[class*="modal"]', 
            '[class*="form"]',
            '[data-testid*="form"]',
            '[class*="fixed"]',
            '[class*="absolute"]'
          ];
          
          overlaySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
              const rect = el.getBoundingClientRect();
              const computedStyle = window.getComputedStyle(el);
              
              analysis.overlays.push({
                selector: selector,
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
                style: {
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
                  overflow: computedStyle.overflow
                },
                visible: rect.width > 0 && rect.height > 0,
                inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
              });
            });
          });
          
          // Check scroll position
          analysis.scroll = {
            x: window.scrollX,
            y: window.scrollY,
            maxX: document.body.scrollWidth - window.innerWidth,
            maxY: document.body.scrollHeight - window.innerHeight
          };
          
          return analysis;
        }, cardType);
        
        // Store results
        const cardResult = {
          cardType,
          formAppeared,
          domAnalysis,
          screenshots: {
            before: `mobile-${cardType}-before-click.png`,
            after: `mobile-${cardType}-after-click.png`
          }
        };
        
        results.testResults.push(cardResult);
        
        console.log(`📊 Analysis for ${cardType}:`, {
          formAppeared,
          overlayCount: domAnalysis.overlays.length,
          scrollPosition: domAnalysis.scroll
        });
        
        // Close form/overlay if it opened (try multiple approaches)
        try {
          // Try clicking outside or finding close button
          const closeButton = await page.$('[data-testid="close-button"], .close-button, [aria-label="Close"], [aria-label="Fechar"]');
          if (closeButton) {
            await closeButton.click();
            console.log(`✅ Closed ${cardType} form via close button`);
          } else {
            // Try clicking outside the form area
            await page.click('body', { position: { x: 50, y: 100 } });
            console.log(`✅ Closed ${cardType} form via outside click`);
          }
        } catch (error) {
          console.log(`⚠️  Could not close ${cardType} form automatically`);
        }
        
        // Wait for form to close
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.error(`❌ Error testing ${cardType}:`, error.message);
        results.testResults.push({
          cardType,
          error: error.message,
          formAppeared: false
        });
      }
    }
    
    // Generate summary
    const workingCards = results.testResults.filter(r => r.formAppeared && !r.error);
    const brokenCards = results.testResults.filter(r => !r.formAppeared || r.error);
    
    results.summary = {
      total: results.testResults.length,
      working: workingCards.length,
      broken: brokenCards.length,
      workingCards: workingCards.map(r => r.cardType),
      brokenCards: brokenCards.map(r => r.cardType)
    };
    
    console.log('\n📈 SUMMARY:');
    console.log(`✅ Working cards: ${results.summary.workingCards.join(', ')}`);
    console.log(`❌ Broken cards: ${results.summary.brokenCards.join(', ')}`);
    
    // Save detailed results
    await fs.writeFile('mobile-service-cards-test-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Detailed results saved to mobile-service-cards-test-results.json');
    
    // Generate comparison report
    const report = generateComparisonReport(results);
    await fs.writeFile('mobile-service-cards-comparison-report.md', report);
    console.log('📄 Comparison report saved to mobile-service-cards-comparison-report.md');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

function generateComparisonReport(results) {
  let report = `# Mobile Service Cards Test Report\n\n`;
  report += `**Generated:** ${results.timestamp}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Cards Tested:** ${results.summary.total}\n`;
  report += `- **Working Cards:** ${results.summary.working} (${results.summary.workingCards.join(', ')})\n`;
  report += `- **Broken Cards:** ${results.summary.broken} (${results.summary.brokenCards.join(', ')})\n\n`;
  
  report += `## Detailed Analysis\n\n`;
  
  results.testResults.forEach(result => {
    if (result.error) {
      report += `### ${result.cardType.toUpperCase()} - ❌ ERROR\n\n`;
      report += `**Error:** ${result.error}\n\n`;
      return;
    }
    
    const status = result.formAppeared ? '✅ WORKING' : '❌ BROKEN';
    report += `### ${result.cardType.toUpperCase()} - ${status}\n\n`;
    
    if (result.domAnalysis) {
      report += `**Overlay Count:** ${result.domAnalysis.overlays.length}\n`;
      report += `**Scroll Position:** Y=${result.domAnalysis.scroll.y}, X=${result.domAnalysis.scroll.x}\n`;
      report += `**Viewport:** ${result.domAnalysis.viewport.width}x${result.domAnalysis.viewport.height}\n`;
      report += `**Body Height:** ${result.domAnalysis.body.scrollHeight}px\n\n`;
      
      if (result.domAnalysis.overlays.length > 0) {
        report += `**Overlays Found:**\n`;
        result.domAnalysis.overlays.forEach((overlay, index) => {
          report += `- **Overlay ${index + 1}:** ${overlay.classes}\n`;
          report += `  - Position: ${overlay.style.position}\n`;
          report += `  - Z-Index: ${overlay.style.zIndex}\n`;
          report += `  - Dimensions: ${overlay.rect.width}x${overlay.rect.height}\n`;
          report += `  - Top: ${overlay.rect.top}px\n`;
          report += `  - In Viewport: ${overlay.inViewport}\n`;
          report += `  - Visible: ${overlay.visible}\n\n`;
        });
      }
    }
    
    report += `**Screenshots:**\n`;
    report += `- Before: ${result.screenshots.before}\n`;
    report += `- After: ${result.screenshots.after}\n\n`;
  });
  
  return report;
}

// Run the test
testMobileServiceCards().catch(console.error);