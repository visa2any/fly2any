const { chromium } = require('playwright');

/**
 * ULTRATHINK JAVASCRIPT OVERRIDE DETECTIVE
 * Track what JavaScript code is overriding CSS height fixes after page load
 */

async function detectJavaScriptOverrides() {
  console.log('🕵️ ULTRATHINK: JavaScript override detective starting...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  try {
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 }
    });
    
    // Monitor all console messages and JavaScript execution
    page.on('console', msg => {
      console.log(`🔍 CONSOLE [${msg.type()}]:`, msg.text());
    });
    
    // Monitor network requests that might load JS affecting layout
    page.on('request', request => {
      if (request.url().includes('.js') && !request.url().includes('node_modules')) {
        console.log(`📡 JS REQUEST: ${request.url()}`);
      }
    });
    
    console.log('📊 PHASE 1: Initial page load analysis...');
    
    await page.goto('http://localhost:3000', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    
    // Take snapshot of initial state (should be working)
    const initialState = await page.evaluate(() => {
      return {
        timestamp: Date.now(),
        htmlHeight: document.documentElement.style.height || 'not set',
        htmlMinHeight: document.documentElement.style.minHeight || 'not set',
        htmlComputedHeight: window.getComputedStyle(document.documentElement).height,
        htmlComputedMinHeight: window.getComputedStyle(document.documentElement).minHeight,
        bodyHeight: document.body.style.height || 'not set',
        bodyMinHeight: document.body.style.minHeight || 'not set',
        bodyComputedHeight: window.getComputedStyle(document.body).height,
        bodyComputedMinHeight: window.getComputedStyle(document.body).minHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
        canScroll: document.documentElement.scrollHeight > window.innerHeight,
        scrollY: window.scrollY
      };
    });
    
    console.log('📊 INITIAL STATE (should work):');
    console.log(JSON.stringify(initialState, null, 2));
    
    // Test scroll capability
    const initialScrollTest = await page.evaluate(() => {
      window.scrollTo(0, 300);
      return window.scrollY;
    });
    
    console.log(`🧪 INITIAL SCROLL TEST: ${initialScrollTest}px (should be 300 if working)`);
    
    // Wait for React hydration and other JS to potentially interfere
    console.log('⏳ WAITING: For React hydration and dynamic JS...');
    await page.waitForTimeout(5000);
    
    // Take snapshot after JS execution
    const afterJSState = await page.evaluate(() => {
      return {
        timestamp: Date.now(),
        htmlHeight: document.documentElement.style.height || 'not set',
        htmlMinHeight: document.documentElement.style.minHeight || 'not set',
        htmlComputedHeight: window.getComputedStyle(document.documentElement).height,
        htmlComputedMinHeight: window.getComputedStyle(document.documentElement).minHeight,
        bodyHeight: document.body.style.height || 'not set',
        bodyMinHeight: document.body.style.minHeight || 'not set',
        bodyComputedHeight: window.getComputedStyle(document.body).height,
        bodyComputedMinHeight: window.getComputedStyle(document.body).minHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
        canScroll: document.documentElement.scrollHeight > window.innerHeight,
        scrollY: window.scrollY
      };
    });
    
    console.log('📊 AFTER JS STATE (might be broken):');
    console.log(JSON.stringify(afterJSState, null, 2));
    
    // Test scroll capability after JS
    await page.evaluate(() => window.scrollTo(0, 0)); // Reset
    const afterJSScrollTest = await page.evaluate(() => {
      window.scrollTo(0, 300);
      return window.scrollY;
    });
    
    console.log(`🧪 AFTER JS SCROLL TEST: ${afterJSScrollTest}px (broken if 0)`);
    
    // Look for JavaScript code that might be setting heights
    console.log('🔍 ANALYZING: JavaScript height modifications...');
    
    const jsAnalysis = await page.evaluate(() => {
      // Check for any inline styles being set
      const htmlInlineStyles = document.documentElement.getAttribute('style') || 'none';
      const bodyInlineStyles = document.body.getAttribute('style') || 'none';
      
      // Check for React-related attributes that might indicate hydration issues
      const reactAttrs = {
        htmlReactRoot: document.documentElement.hasAttribute('data-react-helmet'),
        bodyReactRoot: document.body.hasAttribute('data-react-helmet'),
        nextjsData: !!document.querySelector('[data-nextjs-scroll-focus-boundary]')
      };
      
      // Look for any elements with viewport height settings
      const elementsWithViewportHeight = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const styles = window.getComputedStyle(el);
          return styles.height === '100vh' || styles.minHeight === '100vh' || styles.maxHeight === '100vh';
        })
        .map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          height: window.getComputedStyle(el).height,
          minHeight: window.getComputedStyle(el).minHeight,
          maxHeight: window.getComputedStyle(el).maxHeight
        }));
      
      return {
        htmlInlineStyles,
        bodyInlineStyles,
        reactAttrs,
        elementsWithViewportHeight: elementsWithViewportHeight.slice(0, 5), // Limit output
        totalViewportElements: elementsWithViewportHeight.length
      };
    });
    
    console.log('📊 JAVASCRIPT ANALYSIS:');
    console.log(JSON.stringify(jsAnalysis, null, 2));
    
    // Simulate navigation back scenario
    console.log('🔄 SIMULATING: Navigation back scenario...');
    
    await page.goBack(); // This might not work if no previous page
    await page.waitForTimeout(2000);
    await page.goForward(); // Return to the page
    await page.waitForTimeout(3000);
    
    // Test state after navigation
    const afterNavState = await page.evaluate(() => {
      return {
        documentScrollHeight: document.documentElement.scrollHeight,
        canScroll: document.documentElement.scrollHeight > window.innerHeight,
        htmlComputedHeight: window.getComputedStyle(document.documentElement).height
      };
    });
    
    const afterNavScrollTest = await page.evaluate(() => {
      window.scrollTo(0, 300);
      return window.scrollY;
    });
    
    console.log('📊 AFTER NAVIGATION STATE:');
    console.log(JSON.stringify(afterNavState, null, 2));
    console.log(`🧪 AFTER NAVIGATION SCROLL TEST: ${afterNavScrollTest}px`);
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      issue: 'CSS fixes work on refresh but break after JavaScript execution',
      findings: {
        initialWorking: initialScrollTest === 300,
        brokenAfterJS: afterJSScrollTest === 0,
        brokenAfterNavigation: afterNavScrollTest === 0,
        jsOverrideDetected: initialScrollTest > afterJSScrollTest,
        navigationIssue: afterNavScrollTest === 0
      },
      states: {
        initial: initialState,
        afterJS: afterJSState,
        afterNavigation: afterNavState
      },
      jsAnalysis,
      diagnosis: '',
      solution: ''
    };
    
    // Diagnose the issue
    if (report.findings.jsOverrideDetected) {
      report.diagnosis = 'JavaScript code is overriding CSS height fixes after initial load';
      report.solution = 'Need JavaScript-level intervention to prevent height override';
    }
    
    if (report.findings.navigationIssue) {
      report.diagnosis += ' + Navigation/routing affecting height calculation';
      report.solution += ' + Fix React navigation height persistence';
    }
    
    console.log('📄 DETECTIVE REPORT:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
    
  } catch (error) {
    console.error('❌ Detective work failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

detectJavaScriptOverrides()
  .then(report => {
    console.log('🏁 JavaScript override detection completed');
    console.log('🎯 Next step: Fix the JavaScript override issue');
  })
  .catch(error => {
    console.error('💥 Detection failed:', error);
    process.exit(1);
  });