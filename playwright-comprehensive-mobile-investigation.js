/**
 * COMPREHENSIVE MOBILE DETECTION INVESTIGATION
 * Testing SSR vs Client-side mobile detection conflicts
 * Capturing evidence of "flash of wrong content" issue
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configurations
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  iPhone12: { width: 390, height: 844 },
  samsungGalaxy: { width: 393, height: 852 },
  iPad: { width: 1024, height: 768 },
  iPhoneSE: { width: 375, height: 667 },
  smallMobile: { width: 320, height: 568 }
};

const TARGET_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'mobile-investigation-screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function createPage(browser, viewport, userAgent = null) {
  const context = await browser.newContext({
    viewport,
    userAgent: userAgent || (viewport.width < 768 ? 
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' :
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )
  });
  
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[${viewport.width}x${viewport.height}] CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  // Enable request logging
  page.on('request', request => {
    if (request.url().includes('localhost:3000')) {
      console.log(`[${viewport.width}x${viewport.height}] REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  return { page, context };
}

async function captureSSRContent(page, viewport, testName) {
  console.log(`\n🔍 Testing ${testName} (${viewport.width}x${viewport.height})`);
  
  // Block JavaScript to test pure SSR/CSS behavior
  await page.route('**/*.js', route => route.abort());
  
  const startTime = Date.now();
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  const ssrLoadTime = Date.now() - startTime;
  
  // Capture pure SSR screenshot
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${testName}-1-pure-ssr.png`),
    fullPage: true
  });
  
  // Check computed styles for mobile detection
  const bodyStyles = await page.evaluate(() => {
    const body = document.querySelector('body');
    const computedStyle = window.getComputedStyle(body);
    return {
      cssDisplay: computedStyle.getPropertyValue('--mobile-display') || 'not-set',
      cssBreakpoint: computedStyle.getPropertyValue('--mobile-breakpoint') || 'not-set',
      bodyClass: body.className,
      bodyDataAttributes: Array.from(body.attributes).map(attr => `${attr.name}="${attr.value}"`),
    };
  });
  
  // Check if mobile layout elements exist in SSR
  const ssrMobileElements = await page.evaluate(() => {
    return {
      hasMobileAppLayout: !!document.querySelector('[data-testid="mobile-app-layout"]'),
      hasMobileHeader: !!document.querySelector('.mobile-header'),
      hasBottomNav: !!document.querySelector('[data-testid="bottom-navigation"]'),
      hasMobileForm: !!document.querySelector('.mobile-form'),
      hasGlobalMobileStyles: !!document.querySelector('#global-mobile-styles'),
      headerCount: document.querySelectorAll('header').length,
      navCount: document.querySelectorAll('nav').length
    };
  });
  
  console.log(`📊 SSR Analysis (${testName}):`);
  console.log(`- Load Time: ${ssrLoadTime}ms`);
  console.log(`- Body Classes: ${bodyStyles.bodyClass}`);
  console.log(`- CSS Variables: ${JSON.stringify(bodyStyles, null, 2)}`);
  console.log(`- Mobile Elements: ${JSON.stringify(ssrMobileElements, null, 2)}`);
  
  return {
    ssrLoadTime,
    bodyStyles,
    ssrMobileElements,
    testName,
    viewport
  };
}

async function captureHydrationFlow(page, viewport, testName) {
  console.log(`\n🔄 Testing hydration flow for ${testName}`);
  
  // Re-enable JavaScript
  await page.unroute('**/*.js');
  
  // Add timing markers
  await page.addInitScript(() => {
    window.hydrationTiming = {
      start: Date.now(),
      events: []
    };
    
    // Monitor state changes
    const originalSetState = React?.useState;
    if (originalSetState) {
      console.log('React useState detected - monitoring state changes');
    }
    
    // Monitor mobile detection
    let isMobileDetected = false;
    Object.defineProperty(window, 'isMobile', {
      set: function(value) {
        console.log(`🔧 Mobile detection changed: ${value} at ${Date.now() - window.hydrationTiming.start}ms`);
        window.hydrationTiming.events.push({
          event: 'mobile-detection',
          value,
          timestamp: Date.now() - window.hydrationTiming.start
        });
        isMobileDetected = value;
      },
      get: function() {
        return isMobileDetected;
      }
    });
  });
  
  const startTime = Date.now();
  await page.goto(TARGET_URL);
  
  // Capture immediate post-navigation state
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${testName}-2-immediate-load.png`),
    fullPage: true
  });
  
  // Wait for potential hydration
  await page.waitForTimeout(100);
  
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${testName}-3-post-100ms.png`),
    fullPage: true
  });
  
  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded');
  
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${testName}-4-dom-ready.png`),
    fullPage: true
  });
  
  // Wait for full hydration
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${testName}-5-fully-hydrated.png`),
    fullPage: true
  });
  
  // Get hydration timing data
  const hydrationData = await page.evaluate(() => {
    return {
      timing: window.hydrationTiming || { events: [] },
      currentMobileState: window.isMobile,
      userAgent: navigator.userAgent,
      screenSize: { width: screen.width, height: screen.height },
      viewportSize: { width: window.innerWidth, height: window.innerHeight },
      isTouchDevice: 'ontouchstart' in window
    };
  });
  
  // Check final mobile elements state
  const finalMobileElements = await page.evaluate(() => {
    return {
      hasMobileAppLayout: !!document.querySelector('[data-testid="mobile-app-layout"]'),
      hasMobileHeader: !!document.querySelector('.mobile-header'),
      hasBottomNav: !!document.querySelector('[data-testid="bottom-navigation"]'),
      hasMobileForm: !!document.querySelector('.mobile-form'),
      hasGlobalMobileStyles: !!document.querySelector('#global-mobile-styles'),
      mobileAppLayoutDisplay: getComputedStyle(document.querySelector('[data-testid="mobile-app-layout"]') || document.body).display,
      headerCount: document.querySelectorAll('header').length,
      navCount: document.querySelectorAll('nav').length,
      bodyClasses: document.body.className,
      htmlClasses: document.documentElement.className
    };
  });
  
  const totalLoadTime = Date.now() - startTime;
  
  console.log(`📊 Hydration Analysis (${testName}):`);
  console.log(`- Total Load Time: ${totalLoadTime}ms`);
  console.log(`- Mobile State: ${hydrationData.currentMobileState}`);
  console.log(`- Viewport: ${hydrationData.viewportSize.width}x${hydrationData.viewportSize.height}`);
  console.log(`- Touch Device: ${hydrationData.isTouchDevice}`);
  console.log(`- Hydration Events: ${JSON.stringify(hydrationData.timing.events, null, 2)}`);
  console.log(`- Final Mobile Elements: ${JSON.stringify(finalMobileElements, null, 2)}`);
  
  return {
    totalLoadTime,
    hydrationData,
    finalMobileElements,
    testName,
    viewport
  };
}

async function testMobileInteractions(page, viewport, testName) {
  console.log(`\n👆 Testing mobile interactions for ${testName}`);
  
  // Test form opening
  try {
    const formButton = await page.locator('button:has-text("Buscar Voos")').first();
    if (await formButton.isVisible()) {
      await formButton.click();
      
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${testName}-6-form-opened.png`),
        fullPage: true
      });
      
      // Test touch targets
      const touchTargets = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, .btn, [role="button"]'));
        return buttons.map(btn => {
          const rect = btn.getBoundingClientRect();
          return {
            text: btn.textContent?.trim().slice(0, 20),
            width: rect.width,
            height: rect.height,
            area: rect.width * rect.height,
            meetsTouchTarget: rect.width >= 44 && rect.height >= 44
          };
        });
      });
      
      console.log(`👆 Touch Target Analysis (${testName}):`);
      touchTargets.forEach(target => {
        const status = target.meetsTouchTarget ? '✅' : '❌';
        console.log(`${status} "${target.text}": ${target.width}x${target.height}px (${target.area}px²)`);
      });
      
      return { touchTargets, formOpened: true };
    }
  } catch (error) {
    console.log(`⚠️ Form interaction failed for ${testName}: ${error.message}`);
    return { touchTargets: [], formOpened: false, error: error.message };
  }
  
  return { touchTargets: [], formOpened: false };
}

async function runInvestigation() {
  console.log('🚀 Starting Comprehensive Mobile Detection Investigation');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  try {
    // Test each viewport
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const testName = name.toLowerCase();
      
      try {
        // Create page for this viewport
        const { page, context } = await createPage(browser, viewport);
        
        // Step 1: Test pure SSR content
        const ssrResults = await captureSSRContent(page, viewport, testName);
        
        await context.close();
        
        // Step 2: Test hydration flow
        const { page: page2, context: context2 } = await createPage(browser, viewport);
        const hydrationResults = await captureHydrationFlow(page2, viewport, testName);
        
        // Step 3: Test interactions
        const interactionResults = await testMobileInteractions(page2, viewport, testName);
        
        await context2.close();
        
        // Compile results
        results.push({
          viewport: name,
          dimensions: viewport,
          ssr: ssrResults,
          hydration: hydrationResults,
          interactions: interactionResults
        });
        
      } catch (error) {
        console.error(`❌ Error testing ${name}: ${error.message}`);
        results.push({
          viewport: name,
          dimensions: viewport,
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    // Save comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: TARGET_URL,
      totalTests: Object.keys(VIEWPORTS).length,
      results,
      summary: generateSummary(results)
    };
    
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'mobile-investigation-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 INVESTIGATION SUMMARY');
    console.log('='.repeat(50));
    console.log(JSON.stringify(report.summary, null, 2));
    console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`📄 Full report saved to: ${path.join(SCREENSHOTS_DIR, 'mobile-investigation-report.json')}`);
    
  } finally {
    await browser.close();
  }
}

function generateSummary(results) {
  const summary = {
    totalViewports: results.length,
    mobileViewports: results.filter(r => r.dimensions && r.dimensions.width < 768).length,
    desktopViewports: results.filter(r => r.dimensions && r.dimensions.width >= 768).length,
    ssrMobileDetection: {},
    hydrationMobileDetection: {},
    commonIssues: [],
    recommendations: []
  };
  
  // Analyze SSR vs Hydration differences
  results.forEach(result => {
    if (result.ssr && result.hydration) {
      const isMobileViewport = result.dimensions.width < 768;
      const ssrHasMobileElements = result.ssr.ssrMobileElements.hasMobileAppLayout;
      const hydrationHasMobileElements = result.hydration.finalMobileElements.hasMobileAppLayout;
      
      summary.ssrMobileDetection[result.viewport] = {
        shouldBeMobile: isMobileViewport,
        detectedAsMobile: ssrHasMobileElements,
        correct: isMobileViewport === ssrHasMobileElements
      };
      
      summary.hydrationMobileDetection[result.viewport] = {
        shouldBeMobile: isMobileViewport,
        detectedAsMobile: hydrationHasMobileElements,
        correct: isMobileViewport === hydrationHasMobileElements
      };
      
      // Identify flash of wrong content
      if (ssrHasMobileElements !== hydrationHasMobileElements) {
        summary.commonIssues.push(`${result.viewport}: Flash of wrong content (SSR: ${ssrHasMobileElements}, Hydration: ${hydrationHasMobileElements})`);
      }
    }
  });
  
  // Generate recommendations
  const mobileResults = results.filter(r => r.dimensions && r.dimensions.width < 768);
  const desktopResults = results.filter(r => r.dimensions && r.dimensions.width >= 768);
  
  if (mobileResults.some(r => !r.ssr?.ssrMobileElements.hasMobileAppLayout)) {
    summary.recommendations.push('Implement CSS-only mobile detection for SSR');
  }
  
  if (summary.commonIssues.length > 0) {
    summary.recommendations.push('Eliminate hydration mismatches between SSR and client-side mobile detection');
  }
  
  if (results.some(r => r.interactions?.touchTargets?.some(t => !t.meetsTouchTarget))) {
    summary.recommendations.push('Improve touch target sizes for mobile interaction');
  }
  
  return summary;
}

// Run the investigation
runInvestigation().catch(console.error);