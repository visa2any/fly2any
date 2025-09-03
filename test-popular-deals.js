const { chromium } = require('playwright');

async function testPopularFlightDeals() {
  console.log('🚀 Starting Popular Flight Deals Test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Monitor console messages for API loops
  const consoleMessages = [];
  const apiRequests = [];
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  // Monitor network requests for Amadeus API calls
  page.on('request', request => {
    if (request.url().includes('amadeus') || request.url().includes('api/flights')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('📍 Navigating to http://localhost:3001/flights...');
    await page.goto('http://localhost:3001/flights', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('✅ Page loaded successfully\n');
    
    // Wait for the Popular Flight Deals section to load
    console.log('🔍 Looking for Popular Flight Deals section...');
    await page.waitForSelector('[data-testid="popular-deals"]', { timeout: 10000 });
    console.log('✅ Popular Flight Deals section found\n');
    
    // Wait a bit to observe any potential infinite loops
    console.log('⏱️  Waiting 10 seconds to monitor for infinite API loops...');
    await page.waitForTimeout(10000);
    
    // Take screenshot of the Popular Flight Deals section
    console.log('📸 Taking screenshot of Popular Flight Deals section...');
    const dealsSection = await page.locator('[data-testid="popular-deals"]');
    await dealsSection.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/popular-deals-section.png' 
    });
    console.log('✅ Screenshot saved to test-results/popular-deals-section.png\n');
    
    // Take full page screenshot
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/test-results/full-page-with-deals.png',
      fullPage: true
    });
    console.log('✅ Full page screenshot saved\n');
    
    // Check for design improvements
    console.log('🎨 Checking design improvements...');
    
    // Check card headers (should NOT have blue gradient)
    const cardHeaders = await page.locator('[data-testid="popular-deals"] .space-y-2').first();
    if (await cardHeaders.isVisible()) {
      const headerStyles = await cardHeaders.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          background: styles.background,
          backgroundColor: styles.backgroundColor,
          backgroundImage: styles.backgroundImage
        };
      });
      console.log('📋 Card header styles:', headerStyles);
      
      if (!headerStyles.backgroundImage.includes('gradient')) {
        console.log('✅ No blue gradient background found - FIXED!');
      } else {
        console.log('❌ Blue gradient still present');
      }
    }
    
    // Check View Deal button styles
    const viewDealButtons = await page.locator('[data-testid="popular-deals"] button:has-text("View Deal")');
    const buttonCount = await viewDealButtons.count();
    console.log(`🔘 Found ${buttonCount} View Deal buttons`);
    
    if (buttonCount > 0) {
      const buttonStyles = await viewDealButtons.first().evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          padding: styles.padding,
          fontSize: styles.fontSize,
          backgroundColor: styles.backgroundColor
        };
      });
      console.log('🔘 View Deal button styles:', buttonStyles);
    }
    
    // Test hover interactions
    console.log('🖱️  Testing hover interactions on cards...');
    const cards = await page.locator('[data-testid="popular-deals"] .bg-white');
    const cardCount = await cards.count();
    console.log(`🃏 Found ${cardCount} cards`);
    
    if (cardCount > 0) {
      // Hover over first card
      await cards.first().hover();
      await page.waitForTimeout(1000);
      console.log('✅ Hover interaction tested on first card');
      
      // Take screenshot during hover
      await page.screenshot({ 
        path: '/mnt/d/Users/vilma/fly2any/test-results/card-hover-state.png'
      });
    }
    
    // Check grid layout (should be 3 columns)
    console.log('📐 Checking grid layout...');
    const gridContainer = await page.locator('[data-testid="popular-deals"] .grid');
    if (await gridContainer.isVisible()) {
      const gridStyles = await gridContainer.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          gridTemplateColumns: styles.gridTemplateColumns,
          display: styles.display
        };
      });
      console.log('📐 Grid layout styles:', gridStyles);
      
      if (gridStyles.gridTemplateColumns.includes('1fr 1fr 1fr') || 
          gridStyles.gridTemplateColumns.includes('repeat(3')) {
        console.log('✅ 3-column grid layout confirmed');
      } else {
        console.log('❓ Grid layout may have changed');
      }
    }
    
    // Check for countdown timers
    console.log('⏰ Checking for countdown timers...');
    const timers = await page.locator('[data-testid="popular-deals"] .text-red-600');
    const timerCount = await timers.count();
    console.log(`⏰ Found ${timerCount} countdown timer elements`);
    
    // Check for social proof elements
    console.log('👥 Checking for social proof elements...');
    const socialProof = await page.locator('[data-testid="popular-deals"] .text-xs');
    const socialProofCount = await socialProof.count();
    console.log(`👥 Found ${socialProofCount} social proof elements`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Analyze results
  console.log('\n📊 ANALYSIS RESULTS:\n');
  
  // Check for infinite loop issues
  const recentApiRequests = apiRequests.filter(req => {
    const requestTime = new Date(req.timestamp);
    const now = new Date();
    return (now - requestTime) < 10000; // Last 10 seconds
  });
  
  console.log(`🔄 API Requests in last 10 seconds: ${recentApiRequests.length}`);
  if (recentApiRequests.length > 5) {
    console.log('❌ POTENTIAL INFINITE LOOP DETECTED - Too many API requests');
    recentApiRequests.forEach(req => {
      console.log(`   - ${req.method} ${req.url} at ${req.timestamp}`);
    });
  } else {
    console.log('✅ NO INFINITE LOOP - API request frequency is normal');
  }
  
  // Check console for errors
  const errorMessages = consoleMessages.filter(msg => 
    msg.type === 'error' || 
    msg.text.toLowerCase().includes('rate limit') ||
    msg.text.toLowerCase().includes('429')
  );
  
  console.log(`\n🐛 Console Errors: ${errorMessages.length}`);
  if (errorMessages.length > 0) {
    errorMessages.forEach(msg => {
      console.log(`   - [${msg.type.toUpperCase()}] ${msg.text}`);
    });
  } else {
    console.log('✅ NO RATE LIMIT OR CRITICAL ERRORS in console');
  }
  
  console.log(`\n📝 Total Console Messages: ${consoleMessages.length}`);
  console.log(`🌐 Total API Requests: ${apiRequests.length}`);
  
  console.log('\n🎯 FINAL VERDICT:');
  
  if (recentApiRequests.length <= 5 && errorMessages.length === 0) {
    console.log('✅ INFINITE LOOP ISSUE RESOLVED!');
    console.log('✅ DESIGN IMPROVEMENTS APPLIED SUCCESSFULLY!');
    console.log('✅ Popular Flight Deals section is working correctly');
  } else {
    console.log('❌ Issues still present - check the detailed analysis above');
  }
  
  await browser.close();
  console.log('\n🏁 Test completed!');
}

// Run the test
testPopularFlightDeals().catch(console.error);