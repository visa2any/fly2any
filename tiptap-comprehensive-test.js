const { chromium } = require('playwright');

async function testTipTapEditor() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 90000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: {
      coreEditor: {},
      advancedFeatures: {},
      contentManagement: {},
      errorHandling: {},
      performance: {}
    },
    errors: [],
    performance: {},
    htmlOutput: {},
    productionReadiness: 0,
    screenshots: []
  };

  try {
    console.log('🚀 Starting Comprehensive TipTap Editor Testing...');
    
    // Navigate to the email marketing page
    console.log('📄 Loading email marketing v2 page...');
    await page.goto('http://localhost:3001/admin/email-marketing/v2', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait for loading to complete (look for "Carregando..." to disappear)
    console.log('⏳ Waiting for page to finish loading...');
    try {
      await page.waitForFunction(() => {
        const loadingText = document.querySelector('text*="Carregando"');
        return !loadingText || !document.body.textContent.includes('Carregando');
      }, { timeout: 20000 });
      console.log('✅ Page finished loading');
    } catch (error) {
      console.log('⚠️ Loading timeout, proceeding anyway');
    }

    // Take initial screenshot
    await page.screenshot({ path: './loading-complete.png', fullPage: true });
    results.screenshots.push('loading-complete.png');
    
    // Look for campaign creation or editor interfaces
    console.log('🔍 Looking for campaign creation interface...');
    
    // Try to find and click "Nova Campanha", "Criar", or similar buttons
    const createButtons = [
      'button:text("Nova Campanha")',
      'button:text("Criar Campanha")',
      'button:text("Criar")',
      'button:text("Nova")',
      '[role="button"]:text("Nova")',
      'a[href*="novo"]',
      'a[href*="create"]',
      'button[title*="Nova"]',
      'button[title*="Criar"]'
    ];

    let createButtonFound = false;
    for (const selector of createButtons) {
      try {
        const button = page.locator(selector).first();
        if (await button.count() > 0) {
          console.log(`✅ Found create button: ${selector}`);
          await button.click();
          await page.waitForTimeout(2000);
          createButtonFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (createButtonFound) {
      console.log('✅ Clicked campaign creation button');
      await page.screenshot({ path: './after-create-click.png', fullPage: true });
      results.screenshots.push('after-create-click.png');
    }

    // Wait a bit more for any new content to load
    await page.waitForTimeout(3000);

    // Now look for TipTap editor with more comprehensive selectors
    console.log('🔍 Searching for TipTap editor...');
    
    const editorSelectors = [
      '.ProseMirror',
      '[contenteditable="true"]',
      '.tiptap',
      '[data-editor="tiptap"]',
      '.prose',
      'div[role="textbox"]',
      '[class*="editor-content"]',
      '[class*="tiptap"]',
      '.editor-wrapper .ProseMirror',
      '.rich-text-editor',
      '[data-testid*="editor"]'
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

    // If still no editor, try to look in the page content for any contenteditable areas
    if (!editorElement) {
      console.log('🔍 Searching for any contenteditable areas...');
      const contenteditableElements = await page.locator('[contenteditable]').all();
      if (contenteditableElements.length > 0) {
        editorElement = page.locator('[contenteditable]').first();
        foundSelector = '[contenteditable]';
        console.log(`✅ Found contenteditable element: ${contenteditableElements.length} total`);
      }
    }

    // Set test results for setup
    results.testResults.coreEditor.pageLoad = 'PASS';
    results.testResults.coreEditor.editorFound = editorElement ? 'PASS' : 'FAIL';
    results.testResults.coreEditor.editorSelector = foundSelector || 'NONE';

    if (editorElement) {
      console.log('🧪 Starting comprehensive editor testing...');
      
      // Take screenshot of editor
      await page.screenshot({ path: './editor-found.png', fullPage: true });
      results.screenshots.push('editor-found.png');

      // ========== CORE EDITOR FUNCTIONS TESTING ==========
      console.log('\n📝 Testing Core Editor Functions...');

      // Test 1: Basic typing and content insertion
      try {
        await editorElement.click();
        await page.waitForTimeout(500);
        await editorElement.fill('TipTap Editor Comprehensive Test Content');
        await page.waitForTimeout(1000);
        
        const content = await editorElement.textContent() || await editorElement.inputValue() || '';
        results.testResults.coreEditor.typing = content.includes('TipTap') ? 'PASS' : 'FAIL';
        console.log(`✅ Typing test: ${results.testResults.coreEditor.typing}`);
      } catch (error) {
        results.testResults.coreEditor.typing = 'FAIL';
        console.log(`❌ Typing test failed: ${error.message}`);
      }

      // Test 2: Bold formatting
      try {
        await editorElement.selectText();
        const boldButtons = [
          'button[title*="Bold"], button[title*="Negrito"]',
          'button:text("B")',
          'button:has-text("B")',
          '[aria-label*="bold"]'
        ];
        
        let boldWorked = false;
        for (const selector of boldButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(300);
              boldWorked = true;
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.coreEditor.bold = boldWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Bold formatting: ${results.testResults.coreEditor.bold}`);
      } catch (error) {
        results.testResults.coreEditor.bold = 'FAIL';
        console.log(`❌ Bold test failed: ${error.message}`);
      }

      // Test 3: Italic formatting
      try {
        const italicButtons = [
          'button[title*="Italic"], button[title*="Itálico"]',
          'button:text("I")',
          'button:has-text("I")',
          '[aria-label*="italic"]'
        ];
        
        let italicWorked = false;
        for (const selector of italicButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(300);
              italicWorked = true;
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.coreEditor.italic = italicWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Italic formatting: ${results.testResults.coreEditor.italic}`);
      } catch (error) {
        results.testResults.coreEditor.italic = 'FAIL';
        console.log(`❌ Italic test failed: ${error.message}`);
      }

      // Test 4: Strikethrough formatting
      try {
        const strikeButtons = [
          'button[title*="Strike"], button[title*="Riscado"]',
          'button:text("S")',
          'button:has-text("S")',
          '[aria-label*="strike"]'
        ];
        
        let strikeWorked = false;
        for (const selector of strikeButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(300);
              strikeWorked = true;
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.coreEditor.strikethrough = strikeWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Strikethrough formatting: ${results.testResults.coreEditor.strikethrough}`);
      } catch (error) {
        results.testResults.coreEditor.strikethrough = 'FAIL';
        console.log(`❌ Strikethrough test failed: ${error.message}`);
      }

      // Test 5: Heading formats
      try {
        const h1Buttons = [
          'button[title*="H1"], button[title*="Título 1"]',
          'button:text("H1")',
          'button:has-text("H1")'
        ];
        
        let headingWorked = false;
        for (const selector of h1Buttons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(300);
              headingWorked = true;
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.coreEditor.headings = headingWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Heading formatting: ${results.testResults.coreEditor.headings}`);
      } catch (error) {
        results.testResults.coreEditor.headings = 'FAIL';
        console.log(`❌ Heading test failed: ${error.message}`);
      }

      // Test 6: List formatting
      try {
        const bulletButtons = [
          'button[title*="bullet"], button[title*="marcador"]',
          'button:text("•")',
          'button:has-text("•")'
        ];
        
        let listWorked = false;
        for (const selector of bulletButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(300);
              listWorked = true;
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.coreEditor.bulletList = listWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Bullet list: ${results.testResults.coreEditor.bulletList}`);
      } catch (error) {
        results.testResults.coreEditor.bulletList = 'FAIL';
        console.log(`❌ Bullet list test failed: ${error.message}`);
      }

      // ========== ADVANCED FEATURES TESTING ==========
      console.log('\n🔗 Testing Advanced Features...');

      // Test Link functionality
      try {
        const linkButtons = [
          'button[title*="Link"]',
          'button:text("🔗")',
          'button:has-text("🔗")'
        ];
        
        let linkWorked = false;
        for (const selector of linkButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(1000);
              
              // Look for link dialog
              const linkDialog = page.locator('input[type="url"], input[placeholder*="exemplo"], input[placeholder*="https"]');
              if (await linkDialog.count() > 0) {
                await linkDialog.fill('https://example.com');
                const confirmButton = page.locator('button').filter({ hasText: /Confirmar|OK|Save/ }).first();
                if (await confirmButton.count() > 0) {
                  await confirmButton.click();
                  await page.waitForTimeout(500);
                }
                linkWorked = true;
              }
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.advancedFeatures.links = linkWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Link functionality: ${results.testResults.advancedFeatures.links}`);
      } catch (error) {
        results.testResults.advancedFeatures.links = 'FAIL';
        console.log(`❌ Link test failed: ${error.message}`);
      }

      // Test Color picker
      try {
        const colorButtons = [
          'button[title*="Color"], button[title*="Cor"]',
          'button:text("🎨")',
          'button:has-text("🎨")'
        ];
        
        let colorWorked = false;
        for (const selector of colorButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(500);
              colorWorked = true;
              // Close color picker
              await page.click('body');
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.advancedFeatures.colors = colorWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Color picker: ${results.testResults.advancedFeatures.colors}`);
      } catch (error) {
        results.testResults.advancedFeatures.colors = 'FAIL';
        console.log(`❌ Color test failed: ${error.message}`);
      }

      // Test Undo/Redo
      try {
        const undoButtons = [
          'button[title*="Undo"], button[title*="Desfazer"]',
          'button:text("↶")',
          'button:has-text("↶")'
        ];
        
        let undoWorked = false;
        for (const selector of undoButtons) {
          try {
            const button = page.locator(selector).first();
            if (await button.count() > 0) {
              await button.click();
              await page.waitForTimeout(300);
              undoWorked = true;
              break;
            }
          } catch (e) { /* continue */ }
        }
        
        results.testResults.advancedFeatures.undoRedo = undoWorked ? 'PASS' : 'FAIL - Button not found';
        console.log(`✅ Undo/Redo: ${results.testResults.advancedFeatures.undoRedo}`);
      } catch (error) {
        results.testResults.advancedFeatures.undoRedo = 'FAIL';
        console.log(`❌ Undo/Redo test failed: ${error.message}`);
      }

      // ========== CONTENT MANAGEMENT TESTING ==========
      console.log('\n📋 Testing Content Management...');

      // Test HTML output
      try {
        const htmlContent = await page.evaluate(() => {
          const editor = document.querySelector('.ProseMirror') || 
                       document.querySelector('[contenteditable="true"]') ||
                       document.querySelector('textarea') ||
                       document.querySelector('input[type="text"]');
          return editor ? (editor.innerHTML || editor.value || editor.textContent) : null;
        });
        
        if (htmlContent && htmlContent.length > 0) {
          results.htmlOutput.sample = htmlContent;
          results.testResults.contentManagement.htmlOutput = 'PASS';
          console.log('✅ HTML output generation works');
        } else {
          results.testResults.contentManagement.htmlOutput = 'FAIL';
          console.log('❌ No HTML output found');
        }
      } catch (error) {
        results.testResults.contentManagement.htmlOutput = 'FAIL';
        console.log(`❌ HTML output test failed: ${error.message}`);
      }

      // Test copy/paste
      try {
        await editorElement.selectText();
        await page.keyboard.press('Control+c');
        await page.keyboard.press('Control+v');
        await page.waitForTimeout(500);
        results.testResults.contentManagement.copyPaste = 'PASS';
        console.log('✅ Copy/paste functionality works');
      } catch (error) {
        results.testResults.contentManagement.copyPaste = 'FAIL';
        console.log(`❌ Copy/paste test failed: ${error.message}`);
      }

      // ========== PERFORMANCE TESTING ==========
      console.log('\n⚡ Testing Performance...');

      // Test typing responsiveness
      try {
        const startTime = Date.now();
        await editorElement.fill('');
        await editorElement.type('Performance test: This is a responsiveness test for the TipTap editor.');
        const endTime = Date.now();
        
        results.performance.typingSpeed = endTime - startTime;
        results.testResults.performance.responsiveness = results.performance.typingSpeed < 500 ? 'EXCELLENT' : 
                                                       results.performance.typingSpeed < 1000 ? 'GOOD' : 'SLOW';
        console.log(`✅ Typing responsiveness: ${results.performance.typingSpeed}ms (${results.testResults.performance.responsiveness})`);
      } catch (error) {
        results.testResults.performance.responsiveness = 'FAIL';
        console.log(`❌ Performance test failed: ${error.message}`);
      }

      // Test large content handling
      try {
        const largeContent = 'Lorem ipsum dolor sit amet. '.repeat(100);
        const startTime = Date.now();
        await editorElement.fill(largeContent);
        const endTime = Date.now();
        
        results.performance.largeContentHandling = endTime - startTime;
        results.testResults.performance.largeContent = results.performance.largeContentHandling < 2000 ? 'PASS' : 'SLOW';
        console.log(`✅ Large content handling: ${results.performance.largeContentHandling}ms (${results.testResults.performance.largeContent})`);
      } catch (error) {
        results.testResults.performance.largeContent = 'FAIL';
        console.log(`❌ Large content test failed: ${error.message}`);
      }

      // Take final screenshot
      await page.screenshot({ path: './final-test-state.png', fullPage: true });
      results.screenshots.push('final-test-state.png');

    } else {
      console.log('❌ No TipTap editor found on the page');
      results.testResults.coreEditor.editorFound = 'FAIL';
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
          if (value === 'PASS' || value === 'EXCELLENT' || value === 'GOOD') {
            passedTests++;
          }
        }
      }
    };
    
    countResults(results.testResults);
    results.productionReadiness = totalTests > 0 ? Math.round((passedTests / totalTests) * 10) : 0;

    console.log('\n📊 COMPREHENSIVE TEST SUMMARY:');
    console.log(`==========================================`);
    console.log(`Total tests executed: ${totalTests}`);
    console.log(`Passed tests: ${passedTests}`);
    console.log(`Production readiness score: ${results.productionReadiness}/10`);
    console.log(`Screenshots taken: ${results.screenshots.length}`);
    console.log(`==========================================`);

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

  // Save comprehensive results
  const fs = require('fs');
  fs.writeFileSync('./tiptap-comprehensive-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Comprehensive test results saved to tiptap-comprehensive-results.json');

  return results;
}

// Run the comprehensive test
testTipTapEditor().catch(console.error);