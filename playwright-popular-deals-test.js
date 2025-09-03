const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPopularFlightDeals() {
  console.log('🚀 Starting comprehensive Popular Flight Deals test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Add delay for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Navigate to the flights page
    console.log('📍 Step 1: Navigating to http://localhost:3001/flights');
    await page.goto('http://localhost:3001/flights', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // 2. Wait for page to load completely
    console.log('⏳ Step 2: Waiting for page to load completely...');
    await page.waitForTimeout(3000);
    
    // Check if page loaded successfully
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);
    
    // 3. Scroll to Popular Flight Deals section
    console.log('📍 Step 3: Scrolling to Popular Flight Deals section...');
    
    // Look for the section by various possible selectors
    const possibleSelectors = [
      'text="Popular Flight Deals"',
      '[data-testid="popular-deals"]',
      '.popular-deals',
      'h2:has-text("Popular Flight Deals")',
      'section:has(h2:has-text("Popular"))'
    ];
    
    let dealsSectionFound = false;
    let dealsSection = null;
    
    for (const selector of possibleSelectors) {
      try {
        dealsSection = await page.locator(selector).first();
        if (await dealsSection.isVisible()) {
          dealsSectionFound = true;
          console.log(`✅ Found Popular Flight Deals section with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!dealsSectionFound) {
      console.log('🔍 Searching for any deals-related content...');
      const pageContent = await page.content();
      const hasDealsContent = pageContent.includes('Popular') || 
                             pageContent.includes('Deal') || 
                             pageContent.includes('Flight');
      
      if (hasDealsContent) {
        console.log('📄 Page contains deals-related content, taking full page screenshot...');
      } else {
        console.log('❌ No Popular Flight Deals section found. Taking full page screenshot for analysis...');
      }
    } else {
      // Scroll to the deals section
      await dealsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
    }
    
    // 4. Take initial screenshot
    console.log('📸 Step 4: Taking initial full page screenshot...');
    const screenshotDir = '/mnt/d/Users/vilma/fly2any/test-results';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    await page.screenshot({ 
      path: path.join(screenshotDir, 'popular-deals-full-page.png'),
      fullPage: true 
    });
    
    // 5. Analyze grid layout and visual elements
    console.log('🔍 Step 5: Analyzing grid layout and visual elements...');
    
    const analysis = {
      cardsFound: 0,
      visualElements: {},
      interactions: {},
      responsiveness: {},
      apiIntegration: {}
    };
    
    // Look for flight cards with various selectors
    const cardSelectors = [
      '.flight-card',
      '[data-testid="flight-card"]',
      '.deal-card',
      '.grid > div',
      '[class*="card"]',
      '[class*="deal"]'
    ];
    
    let cards = null;
    for (const selector of cardSelectors) {
      try {
        cards = await page.locator(selector);
        const count = await cards.count();
        if (count > 0) {
          analysis.cardsFound = count;
          console.log(`✅ Found ${count} flight cards using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (analysis.cardsFound > 0) {
      // Analyze first card in detail
      const firstCard = cards.first();
      
      // Check for images/icons
      console.log('🖼️ Checking for destination icons and images...');
      const images = await firstCard.locator('img').count();
      const icons = await firstCard.locator('[class*="icon"], svg').count();
      analysis.visualElements.images = images;
      analysis.visualElements.icons = icons;
      console.log(`📊 Found ${images} images and ${icons} icons in first card`);
      
      // Check for View Deal buttons
      console.log('🔘 Checking View Deal buttons...');
      const buttons = await page.locator('button:has-text("View Deal"), a:has-text("View Deal")').count();
      analysis.visualElements.viewDealButtons = buttons;
      console.log(`🔘 Found ${buttons} View Deal buttons`);
      
      // Check for Live indicator
      console.log('🔴 Checking for Live indicators...');
      const liveIndicators = await page.locator('text="LIVE DATA", text="LIVE PRICES", [class*="live"]').count();
      analysis.visualElements.liveIndicators = liveIndicators;
      console.log(`🔴 Found ${liveIndicators} live indicators`);
      
      // Check for countdown timers
      console.log('⏰ Checking for countdown timers...');
      const timers = await page.locator('[class*="countdown"], [class*="timer"]').count();
      analysis.visualElements.countdownTimers = timers;
      console.log(`⏰ Found ${timers} countdown timers`);
      
      // Check for urgency badges
      console.log('🏷️ Checking for urgency badges...');
      const badges = await page.locator('[class*="badge"], [class*="urgent"]').count();
      analysis.visualElements.urgencyBadges = badges;
      console.log(`🏷️ Found ${badges} urgency badges`);
    }
    
    // 6. Test hover interactions
    console.log('🖱️ Step 6: Testing hover interactions...');
    if (analysis.cardsFound > 0) {
      const firstCard = cards.first();
      
      // Take screenshot before hover
      await page.screenshot({ 
        path: path.join(screenshotDir, 'before-hover.png') 
      });
      
      // Hover over first card
      await firstCard.hover();
      await page.waitForTimeout(1000);
      
      // Take screenshot after hover
      await page.screenshot({ 
        path: path.join(screenshotDir, 'after-hover.png') 
      });
      
      analysis.interactions.hoverTested = true;
      console.log('✅ Hover interaction tested and screenshots captured');
    }
    
    // 7. Test responsiveness at different screen sizes
    console.log('📱 Step 7: Testing responsiveness...');
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Take screenshot for this viewport
      await page.screenshot({ 
        path: path.join(screenshotDir, `responsive-${viewport.name}.png`),
        fullPage: true 
      });
      
      // Count visible cards at this viewport
      if (analysis.cardsFound > 0) {
        const visibleCards = await cards.count();
        analysis.responsiveness[viewport.name] = visibleCards;
        console.log(`📊 ${visibleCards} cards visible at ${viewport.name} viewport`);
      }
    }
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 8. Check API integration and data loading
    console.log('🌐 Step 8: Checking API integration...');
    
    // Monitor network requests
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('api') || request.url().includes('amadeus')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    // Refresh page to capture API calls
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    analysis.apiIntegration.requestsDetected = apiRequests.length;
    analysis.apiIntegration.requests = apiRequests;
    console.log(`🌐 Detected ${apiRequests.length} API requests`);
    
    // Check for loading states
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"]').count();
    analysis.apiIntegration.loadingStates = loadingElements;
    
    // Take final comprehensive screenshot
    console.log('📸 Taking final comprehensive screenshot...');
    await page.screenshot({ 
      path: path.join(screenshotDir, 'final-comprehensive-view.png'),
      fullPage: true 
    });
    
    // 9. Generate comprehensive analysis report
    console.log('\n📋 COMPREHENSIVE TEST ANALYSIS REPORT');
    console.log('=====================================\n');
    
    console.log('🎯 VISUAL ELEMENTS ANALYSIS:');
    console.log(`├── Flight Cards Found: ${analysis.cardsFound}`);
    console.log(`├── Images: ${analysis.visualElements.images || 0}`);
    console.log(`├── Icons: ${analysis.visualElements.icons || 0}`);
    console.log(`├── View Deal Buttons: ${analysis.visualElements.viewDealButtons || 0}`);
    console.log(`├── Live Indicators: ${analysis.visualElements.liveIndicators || 0}`);
    console.log(`├── Countdown Timers: ${analysis.visualElements.countdownTimers || 0}`);
    console.log(`└── Urgency Badges: ${analysis.visualElements.urgencyBadges || 0}\n`);
    
    console.log('🖱️ INTERACTION TESTING:');
    console.log(`└── Hover Effects: ${analysis.interactions.hoverTested ? '✅ Tested' : '❌ Not tested'}\n`);
    
    console.log('📱 RESPONSIVENESS TESTING:');
    Object.entries(analysis.responsiveness).forEach(([viewport, cards]) => {
      console.log(`├── ${viewport}: ${cards} cards visible`);
    });
    console.log('');
    
    console.log('🌐 API INTEGRATION:');
    console.log(`├── API Requests: ${analysis.apiIntegration.requestsDetected}`);
    console.log(`├── Loading States: ${analysis.apiIntegration.loadingStates}`);
    if (apiRequests.length > 0) {
      console.log('└── Detected Requests:');
      apiRequests.forEach((req, i) => {
        console.log(`    ${i + 1}. ${req.method} ${req.url}`);
      });
    }
    console.log('');
    
    console.log('📁 SCREENSHOTS GENERATED:');
    console.log('├── popular-deals-full-page.png (Initial full page)');
    console.log('├── before-hover.png (Before hover state)');
    console.log('├── after-hover.png (After hover state)');
    console.log('├── responsive-mobile.png (Mobile viewport)');
    console.log('├── responsive-tablet.png (Tablet viewport)');
    console.log('├── responsive-desktop.png (Desktop viewport)');
    console.log('└── final-comprehensive-view.png (Final state)\n');
    
    // Quality assessment
    console.log('🏆 OVERALL QUALITY ASSESSMENT:');
    let qualityScore = 0;
    const maxScore = 10;
    
    if (analysis.cardsFound > 0) qualityScore += 2;
    if (analysis.visualElements.viewDealButtons > 0) qualityScore += 1;
    if (analysis.visualElements.icons > 0) qualityScore += 1;
    if (analysis.interactions.hoverTested) qualityScore += 2;
    if (Object.keys(analysis.responsiveness).length >= 3) qualityScore += 2;
    if (analysis.apiIntegration.requestsDetected > 0) qualityScore += 2;
    
    console.log(`├── Quality Score: ${qualityScore}/${maxScore} (${Math.round(qualityScore/maxScore*100)}%)`);
    
    if (qualityScore >= 8) {
      console.log('└── 🌟 EXCELLENT: UI is polished and professional');
    } else if (qualityScore >= 6) {
      console.log('└── 👍 GOOD: UI is functional with room for improvement');
    } else if (qualityScore >= 4) {
      console.log('└── ⚠️ FAIR: UI needs significant improvements');
    } else {
      console.log('└── ❌ POOR: UI requires major fixes');
    }
    
    // Save detailed report
    const reportPath = path.join(screenshotDir, 'test-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Detailed analysis saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    // Take error screenshot
    try {
      const screenshotDir = '/mnt/d/Users/vilma/fly2any/test-results';
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      await page.screenshot({ 
        path: path.join(screenshotDir, 'error-screenshot.png'),
        fullPage: true 
      });
      console.log('📸 Error screenshot saved as error-screenshot.png');
    } catch (e) {
      console.error('Failed to take error screenshot:', e.message);
    }
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed!');
  }
}

// Run the test
testPopularFlightDeals().catch(console.error);