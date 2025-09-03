const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE INVESTIGATION: Real Component Flow Analysis\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  
  try {
    // Step 1: Navigate and analyze homepage
    console.log('1️⃣ HOMEPAGE ANALYSIS');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Find all elements containing "Voos"
    const voosElements = await page.locator('text=Voos').count();
    console.log(`   Found ${voosElements} elements with "Voos" text`);
    
    for (let i = 0; i < voosElements; i++) {
      const element = page.locator('text=Voos').nth(i);
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.getAttribute('class');
      const isVisible = await element.isVisible();
      console.log(`   Voos ${i + 1}: ${tagName} (visible: ${isVisible}) classes: ${className}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'investigate-1-homepage.png' });
    
    // Step 2: Click on Voos and analyze what happens
    console.log('\n2️⃣ CLICKING VOOS AND ANALYZING RESULT');
    
    // Click the first visible Voos element
    await page.locator('text=Voos').first().click();
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'investigate-2-after-click.png' });
    
    // Analyze current page state
    console.log('\n   📋 PAGE STATE ANALYSIS:');
    
    // Check URL
    const currentUrl = page.url();
    console.log(`      URL: ${currentUrl}`);
    
    // Check page title
    const title = await page.title();
    console.log(`      Title: ${title}`);
    
    // Look for any form elements
    const forms = await page.locator('form').count();
    console.log(`      Forms found: ${forms}`);
    
    // Look for specific flight-related elements
    const flightElements = {
      'MobileFlightWizard': await page.locator('[class*="MobileFlightWizard"]').count(),
      'Step indicators': await page.locator('[class*="step"], .step, [data-step]').count(),
      'Progress indicators': await page.locator('[class*="progress"], .progress').count(),
      'Date inputs': await page.locator('input[type="date"]').count(),
      'Airport inputs': await page.locator('input[placeholder*="onde"], input[placeholder*="aeroporto"]').count(),
      'Trip type buttons': await page.locator('text="Ida e volta", text="round-trip"').count(),
    };
    
    console.log('\n   🔍 FLIGHT-RELATED ELEMENTS:');
    Object.entries(flightElements).forEach(([key, count]) => {
      console.log(`      ${key}: ${count}`);
    });
    
    // Step 3: Detailed DOM analysis
    console.log('\n3️⃣ DETAILED DOM STRUCTURE ANALYSIS');
    
    // Get all visible text content to understand what's on screen
    const visibleText = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_SKIP;
            
            const style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
              return NodeFilter.FILTER_SKIP;
            }
            
            const rect = parent.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) {
              return NodeFilter.FILTER_SKIP;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text && text.length > 2) {
          textNodes.push(text);
        }
      }
      return textNodes.slice(0, 50); // First 50 text nodes
    });
    
    console.log('\n   📄 VISIBLE TEXT CONTENT (first 20 items):');
    visibleText.slice(0, 20).forEach((text, index) => {
      console.log(`      ${index + 1}: "${text}"`);
    });
    
    // Step 4: Look for specific date/calendar related elements
    console.log('\n4️⃣ CALENDAR/DATE ELEMENTS SEARCH');
    
    const dateRelatedSelectors = [
      'input[type="date"]',
      'input[type="datetime-local"]',
      '[class*="date"]',
      '[class*="calendar"]',
      '[data-testid*="date"]',
      'text="Data de ida"',
      'text="Data de volta"',
      'text="Quando você viaja"',
      'text="📅"'
    ];
    
    for (const selector of dateRelatedSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`   ✅ Found ${count} elements: ${selector}`);
        
        // Get details for first element
        const first = page.locator(selector).first();
        const isVisible = await first.isVisible();
        const box = await first.boundingBox();
        console.log(`      First element - Visible: ${isVisible}, Position: ${box ? `x=${Math.round(box.x)}, y=${Math.round(box.y)}` : 'N/A'}`);
      } else {
        console.log(`   ❌ Not found: ${selector}`);
      }
    }
    
    // Step 5: Try to find the actual component being used
    console.log('\n5️⃣ COMPONENT IDENTIFICATION');
    
    // Look for React component indicators in DOM
    const reactComponents = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const componentClasses = [];
      
      elements.forEach(el => {
        const className = el.className;
        if (typeof className === 'string') {
          // Look for React-like class names
          if (className.includes('Mobile') || 
              className.includes('Flight') || 
              className.includes('Lead') ||
              className.includes('Form') ||
              className.includes('Wizard')) {
            componentClasses.push(className);
          }
        }
      });
      
      return [...new Set(componentClasses)].slice(0, 10);
    });
    
    console.log('   🧩 SUSPECTED REACT COMPONENTS:');
    reactComponents.forEach((className, index) => {
      console.log(`      ${index + 1}: ${className}`);
    });
    
    // Step 6: Final screenshot and summary
    await page.screenshot({ path: 'investigate-3-final-state.png', fullPage: true });
    
    console.log('\n✅ INVESTIGATION COMPLETE');
    console.log('📸 Screenshots saved:');
    console.log('   - investigate-1-homepage.png');
    console.log('   - investigate-2-after-click.png');
    console.log('   - investigate-3-final-state.png');
    
  } catch (error) {
    console.error('❌ Investigation Error:', error);
    await page.screenshot({ path: 'investigate-error.png' });
  } finally {
    await browser.close();
  }
})();