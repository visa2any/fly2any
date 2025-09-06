const { chromium } = require('playwright');

async function investigateMobileOverlay() {
  console.log('🔍 Starting Mobile Overlay Investigation...\n');

  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });

  const page = await context.newPage();
  
  // Monitor all console logs
  page.on('console', msg => {
    console.log(`📱 Console [${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('📱 Navigating to mobile site...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'investigation-step1-initial.png',
      fullPage: true 
    });
    console.log('✅ Initial page loaded');

    // Check if service buttons are visible
    console.log('\n🔍 Checking service buttons...');
    const serviceButtons = await page.locator('button:has-text("Voos"), button:has-text("Hotéis"), button:has-text("Carros"), button:has-text("Tours"), button:has-text("Seguro")').all();
    console.log(`📊 Found ${serviceButtons.length} service buttons`);

    // Test click on Voos button
    console.log('\n🎯 Testing Voos button click...');
    const voosButton = page.locator('button:has-text("Voos")').first();
    
    if (await voosButton.isVisible()) {
      console.log('✅ Voos button is visible');
      
      // Check current state before click
      const overlayBefore = await page.locator('[data-testid="mobile-lead-form-overlay"]').isVisible();
      console.log(`📊 Overlay visible before click: ${overlayBefore}`);
      
      // Add event listener for state changes
      await page.evaluate(() => {
        window.debugStateChanges = [];
        
        // Monitor state changes by checking DOM mutations
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.dataset?.testid === 'mobile-lead-form-overlay') {
                  window.debugStateChanges.push({
                    type: 'overlay_added',
                    timestamp: Date.now(),
                    visible: getComputedStyle(node).display !== 'none'
                  });
                  console.log('🔍 OVERLAY ADDED TO DOM');
                }
              });
            }
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also monitor any React state changes by hijacking console.log calls
        const originalConsoleLog = console.log;
        console.log = function(...args) {
          const message = args.join(' ');
          if (message.includes('ULTRATHINK DEBUG')) {
            window.debugStateChanges.push({
              type: 'debug_log',
              message: message,
              timestamp: Date.now()
            });
          }
          originalConsoleLog.apply(console, args);
        };
      });
      
      // Click the Voos button
      await voosButton.click();
      console.log('✅ Clicked Voos button');
      
      // Wait for potential state changes
      await page.waitForTimeout(5000);
      
      // Take screenshot after click
      await page.screenshot({ 
        path: 'investigation-step2-after-click.png',
        fullPage: true 
      });
      
      // Check if overlay appeared
      const overlayAfter = await page.locator('[data-testid="mobile-lead-form-overlay"]').isVisible();
      console.log(`📊 Overlay visible after click: ${overlayAfter}`);
      
      // Check if overlay exists in DOM but is hidden
      const overlayExists = await page.locator('[data-testid="mobile-lead-form-overlay"]').count();
      console.log(`📊 Overlay elements in DOM: ${overlayExists}`);
      
      if (overlayExists > 0) {
        const overlayStyles = await page.evaluate(() => {
          const overlay = document.querySelector('[data-testid="mobile-lead-form-overlay"]');
          if (overlay) {
            const computed = window.getComputedStyle(overlay);
            return {
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity,
              zIndex: computed.zIndex,
              position: computed.position,
              top: computed.top,
              left: computed.left,
              width: computed.width,
              height: computed.height
            };
          }
          return null;
        });
        console.log('📊 Overlay computed styles:', JSON.stringify(overlayStyles, null, 2));
      }
      
      // Get debug state changes
      const stateChanges = await page.evaluate(() => window.debugStateChanges || []);
      console.log('📊 State changes captured:', JSON.stringify(stateChanges, null, 2));
      
      // Check React state by looking for leadFormEmbedded
      const reactState = await page.evaluate(() => {
        // Try to find React fiber and extract state
        const findReactFiber = (dom) => {
          const key = Object.keys(dom).find(key => key.startsWith("__reactInternalInstance$") || key.startsWith("__reactFiber"));
          return dom[key];
        };
        
        const bodyFiber = findReactFiber(document.body);
        if (bodyFiber) {
          // Look for MobileAppLayout component state
          let currentFiber = bodyFiber;
          while (currentFiber) {
            if (currentFiber.memoizedState && currentFiber.type?.name === 'MobileAppLayout') {
              return {
                componentFound: true,
                state: currentFiber.memoizedState
              };
            }
            currentFiber = currentFiber.child || currentFiber.sibling || currentFiber.return;
          }
        }
        return { componentFound: false };
      });
      console.log('📊 React state check:', JSON.stringify(reactState, null, 2));
      
    } else {
      console.log('❌ Voos button is not visible');
    }

    // Try programmatic trigger
    console.log('\n🎯 Testing programmatic trigger...');
    try {
      await page.evaluate(() => {
        // Try to find and trigger the handleServiceSelection function
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.textContent.includes('Voos')) {
            button.click();
            break;
          }
        }
      });
      
      await page.waitForTimeout(3000);
      await page.screenshot({ 
        path: 'investigation-step3-programmatic.png',
        fullPage: true 
      });
      
    } catch (error) {
      console.log(`⚠️ Programmatic trigger error: ${error.message}`);
    }

  } catch (error) {
    console.log(`❌ Investigation Error: ${error.message}`);
  }

  // Final analysis
  console.log('\n📊 Investigation Summary:');
  console.log('1. Check investigation-step1-initial.png for initial state');
  console.log('2. Check investigation-step2-after-click.png for post-click state');
  console.log('3. Check investigation-step3-programmatic.png for programmatic trigger');
  
  await page.waitForTimeout(5000); // Keep browser open for manual inspection
  await browser.close();
}

// Run the investigation
investigateMobileOverlay()
  .then(() => {
    console.log('\n✨ Mobile Overlay Investigation Completed!');
  })
  .catch(error => {
    console.error('❌ Investigation failed:', error);
  });