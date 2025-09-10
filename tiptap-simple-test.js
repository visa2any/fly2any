const { chromium } = require('playwright');

async function testTipTapEditor() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: {},
    errors: [],
    performance: {},
    htmlOutput: {},
    productionReadiness: 0,
    routes_tested: []
  };

  const routes = [
    'http://localhost:3001/admin/email-marketing/v2',
    'http://localhost:3001/admin/email-marketing',
    'http://localhost:3001'
  ];

  try {
    console.log('🚀 Starting TipTap Editor Testing...');
    
    let successfulRoute = null;
    
    // Try different routes to find one that loads
    for (const route of routes) {
      try {
        console.log(`🔍 Trying route: ${route}`);
        await page.goto(route, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        });
        console.log(`✅ Successfully loaded: ${route}`);
        successfulRoute = route;
        results.routes_tested.push({ route, status: 'success' });
        break;
      } catch (error) {
        console.log(`❌ Failed to load: ${route} - ${error.message}`);
        results.routes_tested.push({ route, status: 'failed', error: error.message });
      }
    }

    if (!successfulRoute) {
      throw new Error('No routes could be loaded successfully');
    }

    // Wait a bit more for dynamic content
    await page.waitForTimeout(3000);
    console.log('📄 Page content loaded, looking for editor...');

    // Take a screenshot for debugging
    await page.screenshot({ path: './page-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as page-screenshot.png');

    // Search for TipTap editor with multiple selectors
    const editorSelectors = [
      '.ProseMirror',
      '[contenteditable="true"]',
      '[data-testid="tiptap-editor"]',
      '.prose',
      'div[role="textbox"]',
      '.tiptap',
      '[class*="editor"]'
    ];

    let editorElement = null;
    let foundSelector = null;

    for (const selector of editorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          editorElement = page.locator(selector).first();
          foundSelector = selector;
          console.log(`✅ Found editor with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!editorElement) {
      // Look for any form inputs or textareas as fallback
      const fallbackSelectors = ['textarea', 'input[type="text"]', '[contenteditable]'];
      for (const selector of fallbackSelectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            editorElement = page.locator(selector).first();
            foundSelector = selector;
            console.log(`⚠️ Using fallback selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
    }

    // Initialize test results
    results.testResults.setup = {
      pageLoad: successfulRoute ? 'PASS' : 'FAIL',
      editorFound: editorElement ? 'PASS' : 'FAIL',
      editorSelector: foundSelector || 'NONE'
    };

    if (editorElement) {
      console.log('🧪 Starting editor functionality tests...');
      
      // Test 1: Basic typing
      try {
        await editorElement.click();
        await editorElement.fill('Test content for TipTap validation');
        await page.waitForTimeout(500);
        
        const content = await editorElement.textContent() || await editorElement.inputValue() || '';
        results.testResults.typing = content.includes('Test content') ? 'PASS' : 'FAIL';
        console.log(`✅ Typing test: ${results.testResults.typing}`);
      } catch (error) {
        results.testResults.typing = 'FAIL';
        console.log(`❌ Typing test failed: ${error.message}`);
      }

      // Test 2: Look for toolbar buttons
      const toolbarButtons = {
        bold: ['button[title*="Bold"], button[title*="Negrito"]', 'button', /B|bold/i],
        italic: ['button[title*="Italic"], button[title*="Itálico"]', 'button', /I|italic/i],
        strikethrough: ['button[title*="Strike"], button[title*="Riscado"]', 'button', /S|strike/i],
        link: ['button[title*="Link"]', 'button', /🔗|link/i],
        color: ['button[title*="Color"], button[title*="Cor"]', 'button', /🎨|color/i],
        undo: ['button[title*="Undo"], button[title*="Desfazer"]', 'button', /↶|undo/i],
        redo: ['button[title*="Redo"], button[title*="Refazer"]', 'button', /↷|redo/i]
      };

      results.testResults.toolbar = {};
      
      for (const [buttonName, [titleSelector, generalSelector, textPattern]] of Object.entries(toolbarButtons)) {
        try {
          let button = page.locator(titleSelector).first();
          if (await button.count() === 0) {
            button = page.locator(generalSelector).filter({ hasText: textPattern }).first();
          }
          
          if (await button.count() > 0) {
            results.testResults.toolbar[buttonName] = 'FOUND';
            console.log(`✅ ${buttonName} button found`);
            
            // Try clicking the button
            try {
              await button.click();
              await page.waitForTimeout(200);
              results.testResults.toolbar[`${buttonName}_click`] = 'PASS';
              console.log(`✅ ${buttonName} button clickable`);
            } catch (error) {
              results.testResults.toolbar[`${buttonName}_click`] = 'FAIL';
              console.log(`⚠️ ${buttonName} button found but not clickable`);
            }
          } else {
            results.testResults.toolbar[buttonName] = 'NOT_FOUND';
            console.log(`❌ ${buttonName} button not found`);
          }
        } catch (error) {
          results.testResults.toolbar[buttonName] = 'ERROR';
          console.log(`❌ Error testing ${buttonName}: ${error.message}`);
        }
      }

      // Test 3: HTML output
      try {
        const htmlContent = await page.evaluate(() => {
          const editor = document.querySelector('[contenteditable="true"]') || 
                       document.querySelector('.ProseMirror') ||
                       document.querySelector('textarea') ||
                       document.querySelector('input[type="text"]');
          return editor ? (editor.innerHTML || editor.value || editor.textContent) : null;
        });
        
        if (htmlContent) {
          results.htmlOutput.sample = htmlContent;
          results.testResults.htmlOutput = 'PASS';
          console.log('✅ HTML output captured');
        } else {
          results.testResults.htmlOutput = 'FAIL';
          console.log('❌ No HTML output found');
        }
      } catch (error) {
        results.testResults.htmlOutput = 'FAIL';
        console.log(`❌ HTML output test failed: ${error.message}`);
      }

      // Test 4: Performance
      try {
        const startTime = Date.now();
        await editorElement.fill('Performance test: ' + 'Lorem ipsum '.repeat(50));
        const endTime = Date.now();
        results.performance.typing = endTime - startTime;
        results.testResults.performance = results.performance.typing < 1000 ? 'PASS' : 'SLOW';
        console.log(`✅ Performance test: ${results.performance.typing}ms (${results.testResults.performance})`);
      } catch (error) {
        results.testResults.performance = 'FAIL';
        console.log(`❌ Performance test failed: ${error.message}`);
      }

    } else {
      console.log('❌ No editor element found on page');
      results.testResults.editorNotFound = 'FAIL';
    }

    // Calculate production readiness score
    let totalTests = 0;
    let passedTests = 0;
    
    const countResults = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          countResults(value);
        } else if (typeof value === 'string') {
          totalTests++;
          if (value === 'PASS' || value === 'FOUND') {
            passedTests++;
          }
        }
      }
    };
    
    countResults(results.testResults);
    results.productionReadiness = totalTests > 0 ? Math.round((passedTests / totalTests) * 10) : 0;

    console.log('\n📊 Test Summary:');
    console.log(`Route tested: ${successfulRoute}`);
    console.log(`Editor selector: ${foundSelector || 'NONE'}`);
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed tests: ${passedTests}`);
    console.log(`Production readiness score: ${results.productionReadiness}/10`);

  } catch (error) {
    console.error('❌ Test execution error:', error);
    results.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync('./tiptap-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Test results saved to tiptap-test-results.json');

  return results;
}

// Run the test
testTipTapEditor().catch(console.error);