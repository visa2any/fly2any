const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Authenticated Email Campaign Testing Suite
 * This test logs in first, then tests the campaign creation workflow
 */

class AuthenticatedCampaignTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: [],
      screenshots: [],
      issues: []
    };
    this.screenshotCounter = 0;
  }

  async init() {
    console.log('🚀 Initializing Authenticated Email Campaign Testing...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1500
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.context.newPage();
    
    // Set up error logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.testResults.issues.push({
          type: 'console_error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    console.log('✅ Browser initialized');
  }

  async takeScreenshot(name) {
    const filename = `auth_test_${++this.screenshotCounter}_${name}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    
    this.testResults.screenshots.push({
      name: name,
      filename: filename,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📸 Screenshot: ${filename}`);
    return filename;
  }

  async addTestResult(testName, success, details = '') {
    const result = {
      name: testName,
      success: success,
      details: details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.tests.push(result);
    
    if (success) {
      this.testResults.passed++;
      console.log(`✅ ${testName} - PASSED`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName} - FAILED: ${details}`);
    }
    
    return result;
  }

  async loginToAdmin() {
    console.log('\n🔐 Testing Admin Login...');
    
    try {
      // Navigate to admin login
      await this.page.goto('http://localhost:3000/admin/login');
      await this.page.waitForLoadState('networkidle');
      await this.takeScreenshot('01_login_page');
      
      // Check if login form exists
      const emailInput = this.page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      const passwordInput = this.page.locator('input[type="password"], input[name="password"], input[placeholder*="senha" i]');
      const loginButton = this.page.locator('button[type="submit"], button').filter({ hasText: /entrar|login|sign/i });
      
      const emailExists = await emailInput.isVisible().catch(() => false);
      const passwordExists = await passwordInput.isVisible().catch(() => false);
      const buttonExists = await loginButton.isVisible().catch(() => false);
      
      if (emailExists && passwordExists && buttonExists) {
        // Fill login form
        await emailInput.fill('admin@fly2any.com');
        await passwordInput.fill('fly2any2024!');
        await this.takeScreenshot('02_login_filled');
        
        // Submit login
        await loginButton.click();
        await this.page.waitForTimeout(3000);
        
        // Check if redirected to admin area
        const currentUrl = this.page.url();
        const loginSuccessful = currentUrl.includes('/admin') && !currentUrl.includes('/login');
        
        await this.takeScreenshot('03_after_login');
        await this.addTestResult('Admin Login', loginSuccessful, loginSuccessful ? 'Successfully logged in' : 'Login failed or not redirected');
        
        return loginSuccessful;
      } else {
        await this.addTestResult('Admin Login', false, 'Login form elements not found');
        return false;
      }
    } catch (error) {
      await this.addTestResult('Admin Login', false, `Login error: ${error.message}`);
      return false;
    }
  }

  async navigateToEmailMarketing() {
    console.log('\n📧 Navigating to Email Marketing...');
    
    try {
      await this.page.goto('http://localhost:3000/admin/email-marketing/v2?tab=campaigns');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
      
      await this.takeScreenshot('04_email_marketing_page');
      
      // Check if we're on the right page
      const pageTitle = await this.page.title();
      const isCorrectPage = pageTitle.includes('Email') || 
                           await this.page.locator('h1, h2').filter({ hasText: /email|marketing|campanha/i }).isVisible().catch(() => false);
      
      await this.addTestResult('Navigate to Email Marketing', isCorrectPage, isCorrectPage ? 'Email marketing page loaded' : 'Not on email marketing page');
      
      return isCorrectPage;
    } catch (error) {
      await this.addTestResult('Navigate to Email Marketing', false, `Navigation error: ${error.message}`);
      return false;
    }
  }

  async testCampaignBuilder() {
    console.log('\n🔧 Testing Campaign Builder Interface...');
    
    try {
      // Look for campaign builder elements
      await this.page.waitForTimeout(1000);
      
      // Check for campaign name input
      const nameInput = this.page.locator('input[placeholder*="nome"], input[placeholder*="campaign"], input[name*="name"]').first();
      const nameInputExists = await nameInput.isVisible().catch(() => false);
      
      if (nameInputExists) {
        await nameInput.fill('Test Campaign from Automated Test');
        console.log('✅ Campaign name input found and filled');
      }
      
      // Check for subject input  
      const subjectInput = this.page.locator('input[placeholder*="assunto"], input[placeholder*="subject"], input[name*="subject"]').first();
      const subjectInputExists = await subjectInput.isVisible().catch(() => false);
      
      if (subjectInputExists) {
        await subjectInput.fill('🔥 Automated Test: Special Offers');
        console.log('✅ Subject input found and filled');
      }
      
      await this.takeScreenshot('05_form_fields_filled');
      
      // Look for TipTap editor
      const editorSelectors = [
        '.ProseMirror',
        '[contenteditable="true"]',
        '.prose',
        '[data-testid="tiptap-editor"]',
        '.tiptap',
        '.editor-content'
      ];
      
      let editorFound = false;
      for (const selector of editorSelectors) {
        const editorExists = await this.page.locator(selector).isVisible().catch(() => false);
        if (editorExists) {
          console.log(`✅ Editor found with selector: ${selector}`);
          await this.page.locator(selector).click();
          await this.page.keyboard.type('This is automated test content for the email campaign.');
          editorFound = true;
          break;
        }
      }
      
      await this.takeScreenshot('06_editor_content');
      
      // Look for drag and drop elements
      const dragElements = await this.page.locator('div').filter({ hasText: /📝|🖼️|🔲|texto|imagem|botão/i }).count();
      console.log(`Found ${dragElements} potential drag & drop elements`);
      
      if (dragElements > 0) {
        await this.takeScreenshot('07_drag_elements');
      }
      
      // Look for save/create button
      const saveButton = this.page.locator('button').filter({ hasText: /salvar|save|criar|create|publicar/i }).first();
      const saveButtonExists = await saveButton.isVisible().catch(() => false);
      
      if (saveButtonExists) {
        console.log('✅ Save button found');
        await saveButton.highlight();
        await this.takeScreenshot('08_save_button_highlighted');
        
        // Actually try to save
        await saveButton.click();
        await this.page.waitForTimeout(3000);
        
        // Check for success indicators
        const successIndicator = await this.page.locator('.success, .green, [class*="success"]').isVisible().catch(() => false) ||
                                await this.page.locator('div').filter({ hasText: /sucesso|salvo|criado/i }).isVisible().catch(() => false);
        
        await this.takeScreenshot('09_after_save');
        await this.addTestResult('Campaign Save', successIndicator, successIndicator ? 'Campaign saved successfully' : 'No success indicator found');
      }
      
      // Overall campaign builder test result
      const overallSuccess = nameInputExists || subjectInputExists || editorFound;
      await this.addTestResult('Campaign Builder Interface', overallSuccess, 
        `Form inputs: ${nameInputExists}, Subject: ${subjectInputExists}, Editor: ${editorFound}, Drag elements: ${dragElements}, Save button: ${saveButtonExists}`);
      
      return overallSuccess;
    } catch (error) {
      await this.addTestResult('Campaign Builder Interface', false, `Error: ${error.message}`);
      return false;
    }
  }

  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    let allViewportsWork = true;
    
    for (const viewport of viewports) {
      try {
        await this.page.setViewportSize(viewport);
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot(`10_responsive_${viewport.name.toLowerCase()}`);
        
        // Check if content is accessible
        const bodyOverflow = await this.page.evaluate(() => {
          return window.getComputedStyle(document.body).overflowX;
        });
        
        if (viewport.width < 768 && bodyOverflow === 'scroll') {
          allViewportsWork = false;
        }
        
        console.log(`📱 ${viewport.name} viewport tested - overflow: ${bodyOverflow}`);
      } catch (error) {
        console.log(`❌ Error testing ${viewport.name} viewport: ${error.message}`);
        allViewportsWork = false;
      }
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    await this.addTestResult('Responsive Design', allViewportsWork, allViewportsWork ? 'All viewports work correctly' : 'Some viewport issues detected');
    
    return allViewportsWork;
  }

  async runAuthenticatedTest() {
    console.log('\n🎯 Starting Authenticated Email Campaign Testing...\n');
    
    try {
      await this.init();
      
      // Step 1: Login
      const loginSuccess = await this.loginToAdmin();
      if (!loginSuccess) {
        console.log('❌ Cannot proceed without successful login');
        return;
      }
      
      // Step 2: Navigate to email marketing
      const navigationSuccess = await this.navigateToEmailMarketing();
      if (!navigationSuccess) {
        console.log('❌ Cannot proceed without successful navigation');
        return;
      }
      
      // Step 3: Test campaign builder
      await this.testCampaignBuilder();
      
      // Step 4: Test responsive design
      await this.testResponsiveDesign();
      
      // Final screenshot
      await this.takeScreenshot('11_final_state');
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      await this.takeScreenshot('error_state');
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.context) {
      await this.context.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    // Generate simple report
    const report = {
      testSummary: {
        totalTests: this.testResults.tests.length,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: `${((this.testResults.passed / this.testResults.tests.length) * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString()
      },
      testResults: this.testResults.tests,
      screenshots: this.testResults.screenshots,
      issues: this.testResults.issues
    };
    
    fs.writeFileSync('./authenticated-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('✅ Authenticated test completed');
    console.log(`📊 Results: ${report.testSummary.passed}/${report.testSummary.totalTests} tests passed (${report.testSummary.successRate})`);
    console.log(`📸 Screenshots taken: ${this.testResults.screenshots.length}`);
    console.log(`🐛 Issues found: ${this.testResults.issues.length}`);
  }
}

// Run the authenticated test
(async () => {
  const tester = new AuthenticatedCampaignTester();
  await tester.runAuthenticatedTest();
})().catch(console.error);