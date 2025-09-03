const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testLeadManagementInterface() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down for better debugging
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Store console errors and warnings
  const consoleMessages = [];
  const networkErrors = [];
  
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`🔍 Console [${msg.type()}]: ${msg.text()}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log(`❌ Network Error: ${response.status()} - ${response.url()}`);
    }
  });

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: [],
    consoleErrors: [],
    networkErrors: [],
    recommendations: []
  };

  try {
    console.log('🚀 Starting Lead Management Interface Testing...');
    
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await page.goto('http://localhost:3000', { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        if (response && response.status() === 200) {
          serverReady = true;
          break;
        }
      } catch (e) {
        console.log(`Attempt ${i + 1}/30: Server not ready yet...`);
        await page.waitForTimeout(2000);
      }
    }
    
    if (!serverReady) {
      throw new Error('Server failed to start within 60 seconds');
    }
    
    console.log('✅ Server is ready!');

    // Test 1: Navigate to Lead Management Modern Page
    console.log('📋 Test 1: Navigating to /admin/leads/modern');
    
    try {
      await page.goto('http://localhost:3000/admin/leads/modern', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      // Take screenshot of the page
      const screenshotPath = '/mnt/d/Users/vilma/fly2any/test-results/lead-management-modern.png';
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      
      testResults.screenshots.push({
        name: 'Lead Management Modern Page',
        path: screenshotPath,
        description: 'Full page screenshot of the modern lead management interface'
      });
      
      // Check if page loaded successfully
      const pageTitle = await page.title();
      const hasContent = await page.locator('body').count() > 0;
      
      testResults.tests.push({
        name: 'Modern Lead Management Page Load',
        status: hasContent ? 'PASS' : 'FAIL',
        details: {
          pageTitle,
          url: page.url(),
          hasContent
        }
      });
      
      console.log(`✅ Modern leads page loaded - Title: ${pageTitle}`);
      
    } catch (error) {
      testResults.tests.push({
        name: 'Modern Lead Management Page Load',
        status: 'FAIL',
        error: error.message
      });
      console.log(`❌ Failed to load modern leads page: ${error.message}`);
    }

    // Test 2: Check for LeadCard components and styling
    console.log('🎨 Test 2: Analyzing LeadCard components and styling');
    
    try {
      // Look for lead cards or lead-related elements
      const leadCards = await page.locator('[class*="lead"], [class*="Lead"], [data-testid*="lead"]').count();
      const leadElements = await page.locator('div').filter({ hasText: /lead|Lead/i }).count();
      
      // Check for common styling issues
      const elementStyles = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="lead"], [class*="Lead"]');
        const styles = [];
        
        elements.forEach((el, index) => {
          const computedStyle = window.getComputedStyle(el);
          styles.push({
            index,
            className: el.className,
            display: computedStyle.display,
            position: computedStyle.position,
            width: computedStyle.width,
            height: computedStyle.height,
            overflow: computedStyle.overflow,
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            fontSize: computedStyle.fontSize
          });
        });
        
        return styles;
      });
      
      testResults.tests.push({
        name: 'LeadCard Components Analysis',
        status: leadCards > 0 ? 'PASS' : 'WARNING',
        details: {
          leadCardCount: leadCards,
          leadElementCount: leadElements,
          elementStyles
        }
      });
      
      console.log(`📊 Found ${leadCards} lead cards and ${leadElements} lead-related elements`);
      
    } catch (error) {
      testResults.tests.push({
        name: 'LeadCard Components Analysis',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 3: Test Gmail API Endpoint
    console.log('📧 Test 3: Testing Gmail API endpoint');
    
    try {
      const gmailResponse = await page.goto('http://localhost:3000/api/email-gmail', {
        waitUntil: 'networkidle',
        timeout: 10000
      });
      
      const gmailContent = await page.textContent('body');
      const gmailStatus = gmailResponse.status();
      
      testResults.tests.push({
        name: 'Gmail API Endpoint Test',
        status: gmailStatus === 200 ? 'PASS' : 'FAIL',
        details: {
          statusCode: gmailStatus,
          responseContent: gmailContent?.substring(0, 500) + '...',
          url: 'http://localhost:3000/api/email-gmail'
        }
      });
      
      console.log(`📧 Gmail API Response: ${gmailStatus} - ${gmailContent?.substring(0, 100)}...`);
      
    } catch (error) {
      testResults.tests.push({
        name: 'Gmail API Endpoint Test',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 4: Look for Lead Form and Test Submission
    console.log('📝 Test 4: Testing lead form submission');
    
    try {
      // Navigate back to main page to look for lead forms
      await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      // Look for forms that might be lead forms
      const forms = await page.locator('form').count();
      const leadForms = await page.locator('form').filter({ hasText: /contact|lead|email|subscribe/i }).count();
      
      // Take screenshot of main page to see forms
      const mainPageScreenshot = '/mnt/d/Users/vilma/fly2any/test-results/main-page-forms.png';
      await page.screenshot({ 
        path: mainPageScreenshot, 
        fullPage: true 
      });
      
      testResults.screenshots.push({
        name: 'Main Page Forms',
        path: mainPageScreenshot,
        description: 'Main page showing available forms for lead generation'
      });
      
      // Try to find and interact with email input fields
      const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
      
      if (emailInputs > 0) {
        console.log('📧 Found email input fields, testing form submission...');
        
        // Try to fill out a form if one exists
        const firstEmailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
        await firstEmailInput.fill('test@example.com');
        
        // Look for name field
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test User');
        }
        
        // Look for submit button
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /submit|send|contact|subscribe/i }).first();
        
        if (await submitButton.count() > 0) {
          console.log('🔄 Attempting form submission...');
          
          // Listen for network requests during form submission
          const formSubmissionRequests = [];
          page.on('request', request => {
            if (request.method() === 'POST') {
              formSubmissionRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
              });
            }
          });
          
          await submitButton.click();
          await page.waitForTimeout(3000); // Wait for submission
          
          testResults.tests.push({
            name: 'Lead Form Submission Test',
            status: formSubmissionRequests.length > 0 ? 'PASS' : 'WARNING',
            details: {
              formsFound: forms,
              leadFormsFound: leadForms,
              emailInputsFound: emailInputs,
              submissionRequests: formSubmissionRequests
            }
          });
        }
      }
      
      testResults.tests.push({
        name: 'Lead Form Analysis',
        status: forms > 0 ? 'PASS' : 'WARNING',
        details: {
          totalForms: forms,
          leadForms: leadForms,
          emailInputs: emailInputs
        }
      });
      
      console.log(`📝 Found ${forms} forms, ${leadForms} potential lead forms, ${emailInputs} email inputs`);
      
    } catch (error) {
      testResults.tests.push({
        name: 'Lead Form Submission Test',
        status: 'FAIL',
        error: error.message
      });
    }

    // Test 5: Check regular leads admin page
    console.log('📋 Test 5: Testing regular leads admin page');
    
    try {
      await page.goto('http://localhost:3000/admin/leads', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      const regularLeadsScreenshot = '/mnt/d/Users/vilma/fly2any/test-results/admin-leads-regular.png';
      await page.screenshot({ 
        path: regularLeadsScreenshot, 
        fullPage: true 
      });
      
      testResults.screenshots.push({
        name: 'Regular Admin Leads Page',
        path: regularLeadsScreenshot,
        description: 'Regular admin leads page interface'
      });
      
      const pageContent = await page.textContent('body');
      const hasLeadData = pageContent.includes('lead') || pageContent.includes('Lead');
      
      testResults.tests.push({
        name: 'Regular Admin Leads Page',
        status: hasLeadData ? 'PASS' : 'WARNING',
        details: {
          url: page.url(),
          hasLeadContent: hasLeadData,
          pageTitle: await page.title()
        }
      });
      
    } catch (error) {
      testResults.tests.push({
        name: 'Regular Admin Leads Page',
        status: 'FAIL',
        error: error.message
      });
    }

    // Collect final console and network errors
    testResults.consoleErrors = consoleMessages.filter(msg => msg.type === 'error');
    testResults.networkErrors = networkErrors;
    
    // Generate recommendations based on findings
    if (testResults.consoleErrors.length > 0) {
      testResults.recommendations.push('🔧 Fix console errors found during testing');
    }
    
    if (testResults.networkErrors.length > 0) {
      testResults.recommendations.push('🌐 Resolve network errors and failed API calls');
    }
    
    const failedTests = testResults.tests.filter(test => test.status === 'FAIL');
    if (failedTests.length > 0) {
      testResults.recommendations.push('❌ Address failed test cases for core functionality');
    }
    
    testResults.recommendations.push('🎨 Review and improve LeadCard component styling');
    testResults.recommendations.push('📧 Ensure email notification system is properly configured');
    testResults.recommendations.push('🔍 Implement proper error handling and user feedback');
    
  } catch (error) {
    console.error('❌ Critical test failure:', error);
    testResults.tests.push({
      name: 'Critical Test Failure',
      status: 'FAIL',
      error: error.message
    });
  } finally {
    await browser.close();
  }
  
  // Save detailed test results
  const resultsPath = '/mnt/d/Users/vilma/fly2any/test-results/lead-management-test-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  
  // Generate human-readable report
  const reportPath = '/mnt/d/Users/vilma/fly2any/test-results/lead-management-report.md';
  const report = generateReport(testResults);
  fs.writeFileSync(reportPath, report);
  
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.tests.filter(t => t.status === 'PASS').length}`);
  console.log(`⚠️  Warnings: ${testResults.tests.filter(t => t.status === 'WARNING').length}`);
  console.log(`❌ Failed: ${testResults.tests.filter(t => t.status === 'FAIL').length}`);
  console.log(`📧 Console Errors: ${testResults.consoleErrors.length}`);
  console.log(`🌐 Network Errors: ${testResults.networkErrors.length}`);
  console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
  console.log(`\n📁 Results saved to: ${resultsPath}`);
  console.log(`📄 Report saved to: ${reportPath}`);
  
  return testResults;
}

function generateReport(testResults) {
  const { tests, screenshots, consoleErrors, networkErrors, recommendations } = testResults;
  
  let report = `# Lead Management Interface Testing Report\n\n`;
  report += `**Generated:** ${testResults.timestamp}\n\n`;
  
  // Executive Summary
  report += `## 🎯 Executive Summary\n\n`;
  const passedTests = tests.filter(t => t.status === 'PASS').length;
  const warningTests = tests.filter(t => t.status === 'WARNING').length;
  const failedTests = tests.filter(t => t.status === 'FAIL').length;
  
  report += `- **Total Tests:** ${tests.length}\n`;
  report += `- **Passed:** ${passedTests} ✅\n`;
  report += `- **Warnings:** ${warningTests} ⚠️\n`;
  report += `- **Failed:** ${failedTests} ❌\n`;
  report += `- **Console Errors:** ${consoleErrors.length}\n`;
  report += `- **Network Errors:** ${networkErrors.length}\n\n`;
  
  // Test Details
  report += `## 📋 Test Results Details\n\n`;
  tests.forEach((test, index) => {
    const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'WARNING' ? '⚠️' : '❌';
    report += `### ${index + 1}. ${test.name} ${statusIcon}\n\n`;
    report += `**Status:** ${test.status}\n\n`;
    
    if (test.error) {
      report += `**Error:** ${test.error}\n\n`;
    }
    
    if (test.details) {
      report += `**Details:**\n`;
      report += `\`\`\`json\n${JSON.stringify(test.details, null, 2)}\n\`\`\`\n\n`;
    }
  });
  
  // Screenshots
  if (screenshots.length > 0) {
    report += `## 📸 Screenshots Captured\n\n`;
    screenshots.forEach((screenshot, index) => {
      report += `${index + 1}. **${screenshot.name}**\n`;
      report += `   - Path: \`${screenshot.path}\`\n`;
      report += `   - Description: ${screenshot.description}\n\n`;
    });
  }
  
  // Console Errors
  if (consoleErrors.length > 0) {
    report += `## 🔍 Console Errors Found\n\n`;
    consoleErrors.forEach((error, index) => {
      report += `${index + 1}. **[${error.type.toUpperCase()}]** ${error.timestamp}\n`;
      report += `   \`\`\`\n   ${error.text}\n   \`\`\`\n\n`;
    });
  }
  
  // Network Errors
  if (networkErrors.length > 0) {
    report += `## 🌐 Network Errors Found\n\n`;
    networkErrors.forEach((error, index) => {
      report += `${index + 1}. **${error.status} ${error.statusText}**\n`;
      report += `   - URL: \`${error.url}\`\n\n`;
    });
  }
  
  // Recommendations
  report += `## 🔧 Recommendations\n\n`;
  recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}\n`;
  });
  
  return report;
}

// Create test results directory
const testResultsDir = '/mnt/d/Users/vilma/fly2any/test-results';
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Run the test
testLeadManagementInterface()
  .then(results => {
    console.log('🎉 Testing completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  });