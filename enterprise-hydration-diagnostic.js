const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔬 ULTRATHINK ENTERPRISE - Hydration Mismatch Diagnostic System\n');
    console.log('=' .repeat(80));
    console.log('🚨 ENTERPRISE HYDRATION ERROR ANALYSIS');
    console.log('=' .repeat(80));
    
    // Enable all console messages including React errors
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error' && text.includes('hydration')) {
        console.log(`🔴 HYDRATION ERROR DETECTED: ${text}`);
      } else if (type === 'warning' && (text.includes('hydration') || text.includes('mismatch'))) {
        console.log(`⚠️ HYDRATION WARNING: ${text}`);
      } else if (type === 'error') {
        console.log(`❌ RUNTIME ERROR: ${text}`);
      }
    });
    
    // Monitor for exceptions
    page.on('pageerror', error => {
      console.log(`💥 PAGE EXCEPTION: ${error.message}`);
      if (error.stack) {
        console.log(`📍 STACK TRACE: ${error.stack}`);
      }
    });
    
    // Step 1: Analyze Initial Load
    console.log('\n🔍 Step 1: Analyzing initial page load for hydration issues...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ Initial load completed, checking for hydration errors...');
    
    // Step 2: Capture Pre-Form State
    console.log('\n📊 Step 2: Capturing pre-form DOM state...');
    const preFormDOM = await page.evaluate(() => {
      return {
        bodyClassNames: document.body.className,
        documentTitle: document.title,
        metaElements: Array.from(document.querySelectorAll('meta')).length,
        scriptElements: Array.from(document.querySelectorAll('script')).length,
        styleElements: Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).length,
        reactRootExists: !!document.querySelector('#__next'),
        bodyChildren: document.body.children.length,
        hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
        reactVersion: window.React ? window.React.version : 'Not detected'
      };
    });
    
    console.log('Pre-Form DOM Analysis:', JSON.stringify(preFormDOM, null, 2));
    
    // Step 3: Trigger Form Opening
    console.log('\n🎯 Step 3: Opening form and monitoring hydration...');
    const serviceButtons = await page.$$('button.bg-gradient-to-br');
    
    if (serviceButtons.length > 0) {
      console.log(`Found ${serviceButtons.length} service buttons`);
      
      // Monitor for hydration errors during form opening
      await serviceButtons[0].click();
      await page.waitForTimeout(4000);
      
      // Step 4: Capture Post-Form State
      console.log('\n🔬 Step 4: Analyzing post-form DOM state...');
      const postFormDOM = await page.evaluate(() => {
        return {
          bodyClassNames: document.body.className,
          bodyChildren: document.body.children.length,
          modalElements: document.querySelectorAll('[role="dialog"], .modal, .fixed.inset-0').length,
          formElements: document.querySelectorAll('form, input, select, textarea').length,
          reactPortals: document.querySelectorAll('[data-react-portal]').length,
          styledComponents: document.querySelectorAll('[data-styled]').length,
          framerMotionElements: document.querySelectorAll('[data-framer-motion]').length,
          errors: Array.from(document.querySelectorAll('[data-testid="error"], .error, [class*="error"]')).length
        };
      });
      
      console.log('Post-Form DOM Analysis:', JSON.stringify(postFormDOM, null, 2));
      
      // Step 5: Advanced Hydration Analysis
      console.log('\n🧬 Step 5: Advanced hydration pattern analysis...');
      const hydrationAnalysis = await page.evaluate(() => {
        const analysis = {
          suspenseElements: document.querySelectorAll('[data-react-suspense]').length,
          lazyElements: document.querySelectorAll('[data-lazy-loaded]').length,
          dynamicImports: window.__webpack_require__ ? 'Detected' : 'Not detected',
          nextjsProps: window.__NEXT_DATA__ ? 'Present' : 'Missing',
          clientSideNavigation: !!window.__NEXT_ROUTER__,
          cssInJs: {
            styledComponents: !!document.querySelector('[data-styled]'),
            emotionStyles: !!document.querySelector('[data-emotion]'),
            inlineStyles: document.querySelectorAll('[style*="--"]').length
          },
          reactStrict: document.documentElement.hasAttribute('data-react-strict-mode'),
          development: process.env.NODE_ENV === 'development'
        };
        
        // Check for common hydration mismatch causes
        const potentialIssues = [];
        
        // Check for date/time elements that might differ between server and client
        const dateElements = Array.from(document.querySelectorAll('[data-testid*="date"], [class*="date"], [class*="time"]'));
        if (dateElements.length > 0) {
          potentialIssues.push(`Found ${dateElements.length} date/time elements that might cause hydration mismatches`);
        }
        
        // Check for random/dynamic content
        const dynamicContent = Array.from(document.querySelectorAll('[class*="random"], [data-dynamic], [class*="uuid"]'));
        if (dynamicContent.length > 0) {
          potentialIssues.push(`Found ${dynamicContent.length} potentially dynamic content elements`);
        }
        
        // Check for browser-specific APIs
        if (document.querySelector('[data-browser-only]')) {
          potentialIssues.push('Browser-only elements detected');
        }
        
        analysis.potentialIssues = potentialIssues;
        
        return analysis;
      });
      
      console.log('\n🎯 HYDRATION ANALYSIS RESULTS:');
      console.log('=' .repeat(50));
      Object.entries(hydrationAnalysis).forEach(([key, value]) => {
        if (key === 'potentialIssues') {
          console.log(`🚨 ${key}:`);
          value.forEach(issue => console.log(`   • ${issue}`));
        } else if (typeof value === 'object') {
          console.log(`📊 ${key}:`, JSON.stringify(value, null, 2));
        } else {
          console.log(`📊 ${key}: ${value}`);
        }
      });
      
      // Step 6: Component-Level Analysis
      console.log('\n🧩 Step 6: Component-level hydration analysis...');
      const componentAnalysis = await page.evaluate(() => {
        const reactFiber = document.querySelector('#__next')._reactInternalFiber ||
                          document.querySelector('#__next')._reactInternalInstance;
        
        return {
          reactFiberDetected: !!reactFiber,
          multiStepFormPresent: !!document.querySelector('[class*="multi-step"], [data-testid*="multi-step"]'),
          framerMotionAnimations: document.querySelectorAll('[data-framer-motion-animate]').length,
          portalElements: document.querySelectorAll('[data-react-portal="true"]').length,
          suspenseBoundaries: document.querySelectorAll('[data-react-suspense-boundary]').length,
          errorBoundaries: document.querySelectorAll('[data-react-error-boundary]').length
        };
      });
      
      console.log('Component Analysis:', JSON.stringify(componentAnalysis, null, 2));
      
      await page.screenshot({ path: 'hydration-diagnostic-state.png' });
      
    } else {
      console.log('❌ No service buttons found for analysis');
    }
    
    // Final Assessment
    console.log('\n' + '=' .repeat(80));
    console.log('🎯 ENTERPRISE HYDRATION DIAGNOSTIC SUMMARY');
    console.log('=' .repeat(80));
    
    console.log('\n📋 Recommended Actions:');
    console.log('1. Check for server/client date generation differences');
    console.log('2. Validate CSS-in-JS hydration patterns');
    console.log('3. Review Framer Motion server-side compatibility');
    console.log('4. Implement enterprise error boundaries');
    console.log('5. Add hydration validation middleware');
    console.log('6. Deploy React Strict Mode compatibility fixes');
    
    console.log('\n📸 Diagnostic screenshot saved: hydration-diagnostic-state.png');
    
  } catch (error) {
    console.error('\n💥 DIAGNOSTIC SYSTEM ERROR:', error.message);
    await page.screenshot({ path: 'diagnostic-error.png' });
  } finally {
    await browser.close();
  }
})();