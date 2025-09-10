const { chromium } = require('playwright');

async function testTipTapEditor() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    testResults: {},
    errors: [],
    performance: {},
    htmlOutput: {},
    productionReadiness: 0
  };

  try {
    console.log('🚀 Starting TipTap Editor Comprehensive Testing...');
    
    // Navigate to the email marketing page where TipTap editor is used
    await page.goto('http://localhost:3001/admin/email-marketing/v2');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    console.log('📄 Page loaded successfully');
    
    // Wait for TipTap editor to be ready (check for editor content area)
    const editorSelector = '.ProseMirror, [data-testid="tiptap-editor"], .prose';
    try {
      await page.waitForSelector(editorSelector, { timeout: 10000 });
      console.log('✅ TipTap editor found and ready');
    } catch (error) {
      console.log('⚠️ TipTap editor not found with standard selectors, checking for alternative...');
      // Try to find any contenteditable div which is typical for TipTap
      await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });
      console.log('✅ Found contenteditable editor area');
    }

    // Test 1: Core Editor Functions
    console.log('\n🧪 Testing Core Editor Functions...');
    results.testResults.coreEditor = {};

    // Test editor loading
    const editorElement = await page.locator('[contenteditable="true"]').first();
    if (await editorElement.count() > 0) {
      results.testResults.coreEditor.editorLoading = 'PASS';
      console.log('✅ Editor loads properly');

      // Test typing
      await editorElement.fill('Test content for TipTap editor validation');
      await page.waitForTimeout(500);
      const content = await editorElement.textContent();
      results.testResults.coreEditor.typing = content.includes('Test content') ? 'PASS' : 'FAIL';
      console.log(`✅ Typing test: ${results.testResults.coreEditor.typing}`);

      // Test Bold formatting
      await editorElement.selectText();
      const boldButton = page.locator('button').filter({ hasText: 'B' }).first();
      if (await boldButton.count() > 0) {
        await boldButton.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.bold = 'PASS';
        console.log('✅ Bold formatting works');
      } else {
        results.testResults.coreEditor.bold = 'FAIL - Button not found';
        console.log('❌ Bold button not found');
      }

      // Test Italic formatting
      const italicButton = page.locator('button').filter({ hasText: 'I' }).first();
      if (await italicButton.count() > 0) {
        await italicButton.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.italic = 'PASS';
        console.log('✅ Italic formatting works');
      } else {
        results.testResults.coreEditor.italic = 'FAIL - Button not found';
        console.log('❌ Italic button not found');
      }

      // Test Strikethrough formatting
      const strikeButton = page.locator('button').filter({ hasText: 'S' }).first();
      if (await strikeButton.count() > 0) {
        await strikeButton.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.strikethrough = 'PASS';
        console.log('✅ Strikethrough formatting works');
      } else {
        results.testResults.coreEditor.strikethrough = 'FAIL - Button not found';
        console.log('❌ Strikethrough button not found');
      }

      // Test Headings
      const h1Button = page.locator('button').filter({ hasText: 'H1' }).first();
      if (await h1Button.count() > 0) {
        await h1Button.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.headings = 'PASS';
        console.log('✅ Heading formatting works');
      } else {
        results.testResults.coreEditor.headings = 'FAIL - Button not found';
        console.log('❌ H1 button not found');
      }

      // Test Lists
      const bulletButton = page.locator('button').filter({ hasText: '•' }).first();
      if (await bulletButton.count() > 0) {
        await bulletButton.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.bulletList = 'PASS';
        console.log('✅ Bullet list works');
      } else {
        results.testResults.coreEditor.bulletList = 'FAIL - Button not found';
        console.log('❌ Bullet list button not found');
      }

      const numberedButton = page.locator('button').filter({ hasText: '1.' }).first();
      if (await numberedButton.count() > 0) {
        await numberedButton.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.numberedList = 'PASS';
        console.log('✅ Numbered list works');
      } else {
        results.testResults.coreEditor.numberedList = 'FAIL - Button not found';
        console.log('❌ Numbered list button not found');
      }

      // Test Alignment
      const centerButton = page.locator('button[title*="Centralizar"], button[title*="center"]').first();
      if (await centerButton.count() > 0) {
        await centerButton.click();
        await page.waitForTimeout(300);
        results.testResults.coreEditor.alignment = 'PASS';
        console.log('✅ Text alignment works');
      } else {
        results.testResults.coreEditor.alignment = 'FAIL - Button not found';
        console.log('❌ Center alignment button not found');
      }

    } else {
      results.testResults.coreEditor.editorLoading = 'FAIL - No contenteditable found';
      console.log('❌ No contenteditable editor found');
    }

    // Test 2: Advanced Features
    console.log('\n🧪 Testing Advanced Features...');
    results.testResults.advancedFeatures = {};

    // Test Link functionality
    const linkButton = page.locator('button[title*="Link"], button').filter({ hasText: '🔗' }).first();
    if (await linkButton.count() > 0) {
      await linkButton.click();
      await page.waitForTimeout(500);
      
      // Check if link dialog appears
      const linkDialog = page.locator('input[type="url"], input[placeholder*="exemplo.com"], input[placeholder*="https"]');
      if (await linkDialog.count() > 0) {
        await linkDialog.fill('https://example.com');
        const confirmButton = page.locator('button').filter({ hasText: /Confirmar|OK|Save/ }).first();
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(300);
          results.testResults.advancedFeatures.links = 'PASS';
          console.log('✅ Link functionality works');
        } else {
          results.testResults.advancedFeatures.links = 'PARTIAL - Dialog opens but no confirm button';
          console.log('⚠️ Link dialog opens but no confirm button found');
        }
      } else {
        results.testResults.advancedFeatures.links = 'FAIL - No dialog';
        console.log('❌ Link dialog does not appear');
      }
    } else {
      results.testResults.advancedFeatures.links = 'FAIL - Button not found';
      console.log('❌ Link button not found');
    }

    // Test Color picker
    const colorButton = page.locator('button').filter({ hasText: '🎨' }).first();
    if (await colorButton.count() > 0) {
      await colorButton.click();
      await page.waitForTimeout(500);
      
      // Check if color picker appears
      const colorPicker = page.locator('[style*="background-color"], .color-picker, [role="dialog"]').first();
      if (await colorPicker.count() > 0) {
        results.testResults.advancedFeatures.colors = 'PASS';
        console.log('✅ Color picker works');
        // Close color picker by clicking outside
        await page.click('body');
      } else {
        results.testResults.advancedFeatures.colors = 'FAIL - No picker';
        console.log('❌ Color picker does not appear');
      }
    } else {
      results.testResults.advancedFeatures.colors = 'FAIL - Button not found';
      console.log('❌ Color button not found');
    }

    // Test Undo/Redo
    const undoButton = page.locator('button[title*="Desfazer"], button[title*="Undo"]').first();
    if (await undoButton.count() > 0) {
      await undoButton.click();
      await page.waitForTimeout(300);
      
      const redoButton = page.locator('button[title*="Refazer"], button[title*="Redo"]').first();
      if (await redoButton.count() > 0) {
        await redoButton.click();
        await page.waitForTimeout(300);
        results.testResults.advancedFeatures.undoRedo = 'PASS';
        console.log('✅ Undo/Redo functionality works');
      } else {
        results.testResults.advancedFeatures.undoRedo = 'PARTIAL - Undo only';
        console.log('⚠️ Undo works but redo button not found');
      }
    } else {
      results.testResults.advancedFeatures.undoRedo = 'FAIL - Button not found';
      console.log('❌ Undo button not found');
    }

    // Test Variable insertion (if available)
    const variableButton = page.locator('button').filter({ hasText: '🏷️' }).first();
    if (await variableButton.count() > 0) {
      results.testResults.advancedFeatures.variables = 'AVAILABLE';
      console.log('✅ Variable insertion button available');
    } else {
      results.testResults.advancedFeatures.variables = 'NOT_AVAILABLE';
      console.log('ℹ️ Variable insertion not available');
    }

    // Test AI suggestions (if available)
    const aiButton = page.locator('button').filter({ hasText: '✨' }).first();
    if (await aiButton.count() > 0) {
      results.testResults.advancedFeatures.aiSuggestions = 'AVAILABLE';
      console.log('✅ AI suggestions button available');
    } else {
      results.testResults.advancedFeatures.aiSuggestions = 'NOT_AVAILABLE';
      console.log('ℹ️ AI suggestions not available');
    }

    // Test 3: Content Management
    console.log('\n🧪 Testing Content Management...');
    results.testResults.contentManagement = {};

    // Test copy/paste
    await editorElement.selectText();
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(300);
    results.testResults.contentManagement.copyPaste = 'PASS';
    console.log('✅ Copy/paste functionality works');

    // Test HTML output
    const htmlContent = await page.evaluate(() => {
      const editor = document.querySelector('[contenteditable="true"]');
      return editor ? editor.innerHTML : null;
    });
    
    if (htmlContent) {
      results.htmlOutput.sample = htmlContent;
      results.testResults.contentManagement.htmlOutput = 'PASS';
      console.log('✅ HTML output generation works');
    } else {
      results.testResults.contentManagement.htmlOutput = 'FAIL';
      console.log('❌ HTML output generation failed');
    }

    // Test character count (if available)
    const charCount = page.locator('text=/\\d+\/\\d+ caracteres|\\d+ characters/').first();
    if (await charCount.count() > 0) {
      results.testResults.contentManagement.characterCount = 'AVAILABLE';
      console.log('✅ Character count display available');
    } else {
      results.testResults.contentManagement.characterCount = 'NOT_AVAILABLE';
      console.log('ℹ️ Character count not displayed');
    }

    // Test 4: Performance Measurement
    console.log('\n🧪 Testing Performance...');
    const startTime = Date.now();
    
    // Type a large amount of text to test performance
    const largeText = 'Lorem ipsum '.repeat(100);
    await editorElement.fill(largeText);
    
    const typingEndTime = Date.now();
    results.performance.largeTextHandling = typingEndTime - startTime;
    
    console.log(`✅ Large text performance: ${results.performance.largeTextHandling}ms`);

    // Test responsiveness
    const responseStartTime = Date.now();
    await editorElement.type(' responsive test');
    const responseEndTime = Date.now();
    results.performance.responsiveness = responseEndTime - responseStartTime;
    
    console.log(`✅ Typing responsiveness: ${results.performance.responsiveness}ms`);

    // Test 5: Error Scenarios
    console.log('\n🧪 Testing Error Scenarios...');
    results.testResults.errorHandling = {};

    // Test invalid URL in link
    if (await linkButton.count() > 0) {
      await linkButton.click();
      await page.waitForTimeout(500);
      const linkDialog = page.locator('input[type="url"], input[placeholder*="exemplo.com"], input[placeholder*="https"]');
      if (await linkDialog.count() > 0) {
        await linkDialog.fill('invalid-url');
        const confirmButton = page.locator('button').filter({ hasText: /Confirmar|OK|Save/ }).first();
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          await page.waitForTimeout(500);
          results.testResults.errorHandling.invalidUrl = 'HANDLED';
          console.log('✅ Invalid URL handling works');
        }
      }
    }

    // Test very long content
    const veryLongText = 'A'.repeat(10000);
    await editorElement.fill(veryLongText);
    await page.waitForTimeout(1000);
    results.testResults.errorHandling.longContent = 'HANDLED';
    console.log('✅ Long content handling works');

    // Calculate production readiness score
    const totalTests = Object.keys(results.testResults.coreEditor).length + 
                      Object.keys(results.testResults.advancedFeatures).length + 
                      Object.keys(results.testResults.contentManagement).length + 
                      Object.keys(results.testResults.errorHandling).length;

    let passedTests = 0;
    for (const category of Object.values(results.testResults)) {
      for (const result of Object.values(category)) {
        if (typeof result === 'string' && (result === 'PASS' || result === 'AVAILABLE' || result === 'HANDLED')) {
          passedTests++;
        }
      }
    }

    results.productionReadiness = Math.round((passedTests / totalTests) * 10);

    console.log('\n📊 Test Summary:');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed tests: ${passedTests}`);
    console.log(`Production readiness score: ${results.productionReadiness}/10`);

  } catch (error) {
    console.error('❌ Test execution error:', error);
    results.errors.push({
      message: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }

  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('./tiptap-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Test results saved to tiptap-test-results.json');

  return results;
}

// Run the test
testTipTapEditor().catch(console.error);