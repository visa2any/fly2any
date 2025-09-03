const { chromium } = require('playwright');
const fs = require('fs');

async function analyzeConsoleErrors() {
  const browser = await chromium.launch({ 
    headless: false, 
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Arrays to collect different types of console messages
  const consoleErrors = [];
  const consoleWarnings = [];
  const consoleLogs = [];
  const networkErrors = [];
  const jsErrors = [];
  
  // Listen for console events
  page.on('console', msg => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      args: msg.args().map(arg => arg.toString())
    };
    
    if (msg.type() === 'error') {
      consoleErrors.push(logEntry);
      console.log(`🔴 Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(logEntry);
      console.log(`🟡 Console Warning: ${msg.text()}`);
    } else {
      consoleLogs.push(logEntry);
    }
  });
  
  // Listen for JavaScript errors
  page.on('pageerror', error => {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name
    };
    jsErrors.push(errorEntry);
    console.log(`🔥 JavaScript Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  });
  
  // Listen for network failures
  page.on('response', response => {
    if (!response.ok()) {
      const networkError = {
        timestamp: new Date().toISOString(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      };
      networkErrors.push(networkError);
      console.log(`🌐 Network Error: ${response.status()} - ${response.url()}`);
    }
  });
  
  console.log('🚀 Starting Next.js application analysis...');
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for React to hydrate
    console.log('⚛️ Waiting for React hydration...');
    await page.waitForTimeout(3000);
    
    // Check for hydration errors by looking for common indicators
    const hydrationErrors = await page.evaluate(() => {
      const errors = [];
      
      // Check for hydration mismatch warnings
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.textContent && script.textContent.includes('hydration')) {
          errors.push('Hydration script found: ' + script.textContent.substring(0, 200));
        }
      });
      
      // Check for React DevTools
      const reactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (reactDevTools) {
        errors.push('React DevTools detected');
      }
      
      return errors;
    });
    
    // Take screenshot of the current state
    await page.screenshot({ 
      path: 'console-analysis-screenshot.png', 
      fullPage: true 
    });
    
    // Check if the main application elements are present
    console.log('🔍 Checking application structure...');
    const appStructure = await page.evaluate(() => {
      return {
        hasReactRoot: !!document.querySelector('#__next'),
        hasMainContent: !!document.querySelector('main'),
        hasNavigationMenus: document.querySelectorAll('nav').length,
        totalScripts: document.querySelectorAll('script').length,
        hasErrorBoundary: !!document.querySelector('[data-error-boundary]'),
        bodyClasses: document.body.className,
        htmlLang: document.documentElement.lang,
        title: document.title,
        metaCharset: document.querySelector('meta[charset]')?.getAttribute('charset')
      };
    });
    
    console.log('📊 Application Structure:', JSON.stringify(appStructure, null, 2));
    
    // Check for Next.js specific elements
    const nextJsElements = await page.evaluate(() => {
      return {
        nextData: !!document.querySelector('#__NEXT_DATA__'),
        nextScripts: document.querySelectorAll('script[src*="next"]').length,
        webpackHMR: !!window.__webpack_require__,
        nextVersion: window.__NEXT_DATA__?.buildId || 'unknown'
      };
    });
    
    console.log('⚡ Next.js Elements:', JSON.stringify(nextJsElements, null, 2));
    
    // Wait a bit more to catch any delayed errors
    console.log('⏱️ Waiting for delayed errors...');
    await page.waitForTimeout(5000);
    
    // Try to interact with the page to trigger any interactive errors
    console.log('🖱️ Testing page interactions...');
    try {
      // Try to click on navigation elements
      const navLinks = await page.$$('nav a, .nav-link, [role="navigation"] a');
      if (navLinks.length > 0) {
        await navLinks[0].hover();
      }
      
      // Try to trigger form interactions if present
      const forms = await page.$$('form');
      if (forms.length > 0) {
        await forms[0].hover();
      }
    } catch (interactionError) {
      console.log('⚠️ Interaction error (non-blocking):', interactionError.message);
    }
    
    // Final wait to capture any async errors
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log('🚫 Navigation/Page Error:', error.message);
    jsErrors.push({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      type: 'Navigation Error'
    });
  }
  
  // Compile comprehensive report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalConsoleErrors: consoleErrors.length,
      totalWarnings: consoleWarnings.length,
      totalJsErrors: jsErrors.length,
      totalNetworkErrors: networkErrors.length,
      applicationLoaded: jsErrors.length === 0 || jsErrors.every(e => e.type === 'Navigation Error')
    },
    consoleErrors,
    consoleWarnings,
    jsErrors,
    networkErrors,
    applicationStructure: appStructure,
    nextJsElements
  };
  
  // Save detailed report
  fs.writeFileSync('console-analysis-report.json', JSON.stringify(report, null, 2));
  
  // Generate summary
  console.log('\n📋 === CONSOLE ANALYSIS SUMMARY ===');
  console.log(`🔴 Console Errors: ${consoleErrors.length}`);
  console.log(`🟡 Console Warnings: ${consoleWarnings.length}`);
  console.log(`🔥 JavaScript Errors: ${jsErrors.length}`);
  console.log(`🌐 Network Errors: ${networkErrors.length}`);
  console.log(`✅ Application Loaded: ${report.summary.applicationLoaded ? 'YES' : 'NO'}`);
  
  if (consoleErrors.length > 0) {
    console.log('\n🔍 TOP CONSOLE ERRORS:');
    consoleErrors.slice(0, 5).forEach((error, index) => {
      console.log(`${index + 1}. ${error.text}`);
      if (error.location) {
        console.log(`   📍 Location: ${error.location.url}:${error.location.lineNumber}`);
      }
    });
  }
  
  if (jsErrors.length > 0) {
    console.log('\n🔥 JAVASCRIPT ERRORS:');
    jsErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n')[1] || 'No stack trace'}`);
      }
    });
  }
  
  await browser.close();
  
  console.log('\n📁 Files generated:');
  console.log('- console-analysis-report.json (detailed report)');
  console.log('- console-analysis-screenshot.png (page screenshot)');
  
  return report;
}

// Run the analysis
if (require.main === module) {
  analyzeConsoleErrors().catch(console.error);
}

module.exports = { analyzeConsoleErrors };