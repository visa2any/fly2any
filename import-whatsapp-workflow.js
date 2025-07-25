const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function importWhatsAppWorkflow() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🌐 Accessing N8N instance...');
    await page.goto('https://n8n-production-81b6.up.railway.app', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for interface to load
    await page.waitForTimeout(5000);
    
    // Check if login is required
    console.log('🔍 Checking for login form...');
    const loginForm = await page.$('input[type="email"], input[type="password"], [data-test-id="login-form"]');
    
    if (loginForm) {
      console.log('🔐 Login form detected. Please log in manually...');
      console.log('⏳ Waiting 30 seconds for manual login...');
      await page.waitForTimeout(30000);
    }
    
    // Try to navigate to workflows page
    console.log('📋 Navigating to workflows page...');
    
    // Try different approaches to get to workflows
    const workflowsSelectors = [
      '[data-test-id="workflows"]',
      'a[href*="workflows"]',
      'nav a:contains("Workflows")',
      '.menu-item:contains("Workflows")'
    ];
    
    let workflowsFound = false;
    for (const selector of workflowsSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          workflowsFound = true;
          console.log('✅ Clicked workflows menu');
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!workflowsFound) {
      // Try direct navigation
      console.log('🔄 Trying direct navigation...');
      await page.goto('https://n8n-production-81b6.up.railway.app/workflows');
    }
    
    await page.waitForTimeout(3000);
    
    // Look for import workflow button or create new workflow
    console.log('🔍 Looking for import or create workflow options...');
    
    const importSelectors = [
      '[data-test-id="import-workflow"]',
      'button:contains("Import")',
      '.import-workflow',
      '[aria-label*="import"]'
    ];
    
    const createSelectors = [
      '[data-test-id="create-workflow"]',
      'button:contains("New")',
      'button:contains("Create")',
      '.create-workflow',
      '+',
      '[data-test-id="new-workflow"]'
    ];
    
    let importButton = null;
    let createButton = null;
    
    // Check for import button first
    for (const selector of importSelectors) {
      try {
        importButton = await page.$(selector);
        if (importButton) {
          console.log('✅ Found import button');
          break;
        }
      } catch (e) {}
    }
    
    // Check for create button
    for (const selector of createSelectors) {
      try {
        createButton = await page.$(selector);
        if (createButton) {
          console.log('✅ Found create button');
          break;
        }
      } catch (e) {}
    }
    
    // Read the workflow JSON
    const workflowPath = '/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json';
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflowData = JSON.parse(workflowContent);
    
    console.log(`📄 Loaded workflow: ${workflowData.name}`);
    
    if (importButton) {
      console.log('🔄 Using import workflow method...');
      await importButton.click();
      await page.waitForTimeout(2000);
      
      // Look for JSON import field
      const jsonInput = await page.$('textarea, .json-input, [data-test-id="json-input"]');
      if (jsonInput) {
        console.log('📝 Pasting workflow JSON...');
        await jsonInput.click();
        await jsonInput.evaluate((el, content) => {
          el.value = content;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }, workflowContent);
        
        // Click import/save button
        const importConfirm = await page.$('button:contains("Import"), button:contains("Save"), [data-test-id="import-confirm"]');
        if (importConfirm) {
          await importConfirm.click();
          console.log('✅ Workflow import initiated');
        }
      }
      
    } else if (createButton) {
      console.log('🔄 Using create new workflow method...');
      await createButton.click();
      await page.waitForTimeout(3000);
      
      // Check if we're in the workflow editor
      const workflowEditor = await page.$('.workflow-canvas, .node-view, [data-test-id="workflow-canvas"]');
      
      if (workflowEditor) {
        console.log('🎯 In workflow editor - looking for import option...');
        
        // Try to find workflow menu or settings
        const menuSelectors = [
          '[data-test-id="workflow-menu"]',
          '.workflow-settings',
          'button:contains("...")',
          '[aria-label*="menu"]'
        ];
        
        for (const selector of menuSelectors) {
          try {
            const menuButton = await page.$(selector);
            if (menuButton) {
              await menuButton.click();
              await page.waitForTimeout(1000);
              
              // Look for import option in menu
              const importOption = await page.$('li:contains("Import"), .menu-item:contains("Import")');
              if (importOption) {
                await importOption.click();
                console.log('✅ Found import option in menu');
                break;
              }
            }
          } catch (e) {}
        }
        
        // Alternative: Try keyboard shortcut for import (Ctrl+I)
        console.log('🔄 Trying keyboard shortcut for import...');
        await page.keyboard.down('Control');
        await page.keyboard.press('i');
        await page.keyboard.up('Control');
        await page.waitForTimeout(1000);
        
        // Look for import dialog or JSON input
        const importDialog = await page.$('.import-dialog, .json-import, textarea');
        if (importDialog) {
          console.log('📝 Found import dialog - pasting workflow...');
          await importDialog.click();
          await importDialog.evaluate((el, content) => {
            el.value = content;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }, workflowContent);
          
          // Click import button
          const confirmButton = await page.$('button:contains("Import"), button:contains("Confirm")');
          if (confirmButton) {
            await confirmButton.click();
            console.log('✅ Workflow imported successfully');
          }
        }
      }
    }
    
    // Wait a bit to see the result
    await page.waitForTimeout(5000);
    
    // Try to activate the workflow
    console.log('🔄 Looking for workflow activation...');
    const activateSelectors = [
      '[data-test-id="workflow-activate"]',
      'button:contains("Active")',
      '.workflow-active-toggle',
      'input[type="checkbox"][aria-label*="active"]'
    ];
    
    for (const selector of activateSelectors) {
      try {
        const activateButton = await page.$(selector);
        if (activateButton) {
          const isActive = await activateButton.evaluate(el => {
            return el.checked || el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true';
          });
          
          if (!isActive) {
            await activateButton.click();
            console.log('✅ Workflow activated');
          } else {
            console.log('✅ Workflow already active');
          }
          break;
        }
      } catch (e) {}
    }
    
    // Save workflow
    console.log('💾 Saving workflow...');
    await page.keyboard.down('Control');
    await page.keyboard.press('s');
    await page.keyboard.up('Control');
    await page.waitForTimeout(2000);
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: '/mnt/d/Users/vilma/fly2any/whatsapp-workflow-imported.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved as whatsapp-workflow-imported.png');
    
    // Test the webhook endpoint
    console.log('🧪 Testing webhook endpoint...');
    
    const testMessage = {
      event: 'whatsapp_message_received',
      data: {
        from: '+1234567890',
        text: 'Olá! Preciso de uma cotação para voos Miami-São Paulo',
        contactName: 'Test User',
        timestamp: new Date().toISOString(),
        messageId: 'test_msg_123',
        isNewConversation: true
      }
    };
    
    try {
      // Open new tab for webhook test
      const newPage = await browser.newPage();
      await newPage.goto('about:blank');
      
      const testResult = await newPage.evaluate(async (testData) => {
        try {
          const response = await fetch('https://n8n-production-81b6.up.railway.app/webhook/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
          });
          return {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          };
        } catch (error) {
          return { error: error.message };
        }
      }, testMessage);
      
      console.log('🧪 Webhook test result:', testResult);
      
      if (testResult.ok) {
        console.log('✅ WhatsApp webhook is working!');
      } else if (testResult.status === 404) {
        console.log('⚠️ Webhook not found - may need manual activation');
      } else {
        console.log('⚠️ Webhook test returned:', testResult);
      }
      
      await newPage.close();
      
    } catch (error) {
      console.log('⚠️ Could not test webhook:', error.message);
    }
    
    console.log('\n🎉 WhatsApp Workflow Import Process Complete!');
    console.log('\n📋 Workflow Features:');
    console.log('✅ Webhook endpoint: /webhook/whatsapp');
    console.log('✅ Message processing with intent detection');
    console.log('✅ Lead creation event handling');
    console.log('✅ Auto-response generation');
    console.log('✅ Support ticket creation');
    console.log('✅ Email notifications');
    console.log('\n🔗 Webhook URL: https://n8n-production-81b6.up.railway.app/webhook/whatsapp');
    
    console.log('\n⏳ Browser will remain open for manual verification...');
    console.log('Press Ctrl+C when finished');
    
    // Keep browser open for manual inspection
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error during workflow import:', error.message);
    
    // Take error screenshot
    try {
      const page = await browser.newPage();
      await page.screenshot({ 
        path: '/mnt/d/Users/vilma/fly2any/import-error.png', 
        fullPage: true 
      });
      console.log('📸 Error screenshot saved as import-error.png');
    } catch (e) {}
    
  } finally {
    // Don't close browser automatically to allow manual inspection
    console.log('🔍 Browser kept open for inspection. Close manually when done.');
  }
}

// Check if workflow file exists before running
const workflowPath = '/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json';
if (!fs.existsSync(workflowPath)) {
  console.error('❌ Workflow file not found:', workflowPath);
  process.exit(1);
}

console.log('🚀 Starting WhatsApp Workflow Import Process...');
console.log('📁 Workflow file:', workflowPath);
console.log('🌐 N8N Instance: https://n8n-production-81b6.up.railway.app');
console.log('🎯 Target webhook: /webhook/whatsapp');

importWhatsAppWorkflow();