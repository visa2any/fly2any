/**
 * 🎯 COMPREHENSIVE LEAD FORM ANALYSIS
 * Advanced Playwright automation to analyze the Lead Form on desktop version
 * 
 * This script will:
 * 1. Test the complete user journey on desktop
 * 2. Verify form functionality and validation
 * 3. Test backend connectivity and database persistence
 * 4. Capture detailed screenshots and logs
 * 5. Generate comprehensive analysis report
 */

const { chromium, webkit, firefox } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 60000,
  screenshotsDir: './test-screenshots/lead-form-analysis',
  reportFile: './LEAD_FORM_COMPREHENSIVE_ANALYSIS_REPORT.md',
  browsers: ['chromium'], // Focus on desktop Chrome experience
  viewports: [
    { name: 'Desktop-HD', width: 1920, height: 1080 },
    { name: 'Desktop-Standard', width: 1366, height: 768 },
    { name: 'Desktop-Large', width: 2560, height: 1440 }
  ]
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

// Test data
const TEST_LEAD_DATA = {
  nome: 'João Silva Teste Lead Form',
  email: 'joao.teste@leadformanalysis.com', 
  whatsapp: '+55 11 99999-9999',
  origem: 'São Paulo',
  destino: 'New York',
  dataPartida: '2025-12-15',
  dataRetorno: '2025-12-22'
};

// Analysis results storage
let analysisResults = {
  timestamp: new Date().toISOString(),
  testSummary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  formAnalysis: {
    loadTime: 0,
    formElements: [],
    validationTests: [],
    userJourney: []
  },
  backendConnectivity: {
    apiEndpointTest: null,
    submissionTest: null,
    responseAnalysis: null
  },
  databasePersistence: {
    leadCreated: false,
    leadData: null,
    storageMethod: null
  },
  performanceMetrics: {
    pageLoadTime: 0,
    formRenderTime: 0,
    submissionTime: 0,
    apiResponseTime: 0
  },
  screenshots: [],
  errors: [],
  recommendations: []
};

/**
 * 🎯 Main Analysis Function
 */
async function runComprehensiveLeadFormAnalysis() {
  console.log('🚀 Starting Comprehensive Lead Form Analysis...');
  console.log('🎯 Target: Desktop Lead Form on Home Page');
  console.log(`📍 Base URL: ${CONFIG.baseUrl}`);
  
  const startTime = Date.now();

  try {
    // Test on different desktop viewports
    for (const viewport of CONFIG.viewports) {
      console.log(`\n📊 Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const browser = await chromium.launch({
        headless: false, // Show browser for analysis
        slowMo: 1000 // Slow down for visual analysis
      });
      
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Enable request/response monitoring
      await setupNetworkMonitoring(page);
      
      // 1. Page Load Analysis
      await analyzePageLoad(page, viewport);
      
      // 2. Lead Form Discovery and Analysis  
      await analyzeLeadFormPresence(page, viewport);
      
      // 3. Form Interaction Testing
      await testFormInteractions(page, viewport);
      
      // 4. Form Validation Testing
      await testFormValidation(page, viewport);
      
      // 5. Complete User Journey Test
      await testCompleteUserJourney(page, viewport);
      
      // 6. Backend Connectivity Test
      await testBackendConnectivity(page, viewport);
      
      await browser.close();
    }
    
    // 7. Generate Comprehensive Report
    await generateAnalysisReport();
    
    console.log('\n✅ Comprehensive Lead Form Analysis Completed!');
    console.log(`📊 Total execution time: ${(Date.now() - startTime) / 1000}s`);
    console.log(`📋 Report generated: ${CONFIG.reportFile}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    analysisResults.errors.push({
      type: 'CRITICAL_ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    await generateAnalysisReport();
  }
}

/**
 * 📡 Network Monitoring Setup
 */
async function setupNetworkMonitoring(page) {
  analysisResults.networkRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/leads') || request.url().includes('lead')) {
      analysisResults.networkRequests.push({
        type: 'REQUEST',
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/leads') || response.url().includes('lead')) {
      analysisResults.networkRequests.push({
        type: 'RESPONSE',
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });
}

/**
 * 🏠 Page Load Analysis
 */
async function analyzePageLoad(page, viewport) {
  console.log('  📄 Analyzing page load...');
  
  const startTime = Date.now();
  
  try {
    await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.testTimeout 
    });
    
    const loadTime = Date.now() - startTime;
    analysisResults.performanceMetrics.pageLoadTime = loadTime;
    
    // Capture initial screenshot
    const screenshotPath = `${CONFIG.screenshotsDir}/01-page-load-${viewport.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    analysisResults.screenshots.push(screenshotPath);
    
    console.log(`    ✅ Page loaded in ${loadTime}ms`);
    
    // Check for JavaScript errors
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    if (jsErrors.length > 0) {
      analysisResults.errors.push({
        type: 'JS_ERRORS',
        errors: jsErrors,
        viewport: viewport.name
      });
    }
    
  } catch (error) {
    console.error('    ❌ Page load failed:', error.message);
    analysisResults.errors.push({
      type: 'PAGE_LOAD_ERROR',
      message: error.message,
      viewport: viewport.name
    });
  }
}

/**
 * 🔍 Lead Form Discovery and Analysis
 */
async function analyzeLeadFormPresence(page, viewport) {
  console.log('  🔍 Discovering Lead Form elements...');
  
  try {
    // Look for common Lead Form triggers
    const possibleTriggers = [
      '[data-testid*="lead"]',
      'button:has-text("Cotação")',
      'button:has-text("Orçamento")',
      'button:has-text("Solicitar")',
      '.lead-capture',
      '.lead-form',
      '[class*="lead"]',
      'button:has-text("Viagem")'
    ];
    
    let leadFormTrigger = null;
    
    for (const selector of possibleTriggers) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          leadFormTrigger = selector;
          console.log(`    ✅ Found Lead Form trigger: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    if (!leadFormTrigger) {
      // Look for any button that might open a form
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const buttonText = await buttons[i].textContent();
        console.log(`    🔍 Found button: "${buttonText}"`);
        if (buttonText && (
          buttonText.includes('Cotação') ||
          buttonText.includes('Orçamento') ||
          buttonText.includes('Viagem') ||
          buttonText.includes('Solicitar')
        )) {
          leadFormTrigger = `button:has-text("${buttonText}")`;
          break;
        }
      }
    }
    
    analysisResults.formAnalysis.triggerFound = !!leadFormTrigger;
    analysisResults.formAnalysis.triggerSelector = leadFormTrigger;
    
    // Capture screenshot of page with potential triggers
    const screenshotPath = `${CONFIG.screenshotsDir}/02-lead-form-discovery-${viewport.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    analysisResults.screenshots.push(screenshotPath);
    
  } catch (error) {
    console.error('    ❌ Lead Form discovery failed:', error.message);
    analysisResults.errors.push({
      type: 'LEAD_FORM_DISCOVERY_ERROR',
      message: error.message,
      viewport: viewport.name
    });
  }
}

/**
 * 🎮 Form Interaction Testing
 */
async function testFormInteractions(page, viewport) {
  console.log('  🎮 Testing form interactions...');
  
  if (!analysisResults.formAnalysis.triggerFound) {
    console.log('    ⚠️  No Lead Form trigger found, skipping interaction tests');
    return;
  }
  
  try {
    // Click the Lead Form trigger
    await page.click(analysisResults.formAnalysis.triggerSelector);
    await page.waitForTimeout(2000); // Wait for form to appear
    
    // Capture screenshot of opened form
    const screenshotPath = `${CONFIG.screenshotsDir}/03-lead-form-opened-${viewport.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    analysisResults.screenshots.push(screenshotPath);
    
    // Analyze form structure
    const formElements = [];
    
    // Look for common form elements
    const inputSelectors = [
      'input[type="text"]',
      'input[type="email"]', 
      'input[type="tel"]',
      'input[type="date"]',
      'select',
      'textarea'
    ];
    
    for (const selector of inputSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const placeholder = await element.getAttribute('placeholder');
        const name = await element.getAttribute('name');
        const type = await element.getAttribute('type');
        
        formElements.push({
          selector,
          placeholder,
          name,
          type,
          visible: await element.isVisible()
        });
      }
    }
    
    analysisResults.formAnalysis.formElements = formElements;
    console.log(`    ✅ Found ${formElements.length} form elements`);
    
  } catch (error) {
    console.error('    ❌ Form interaction test failed:', error.message);
    analysisResults.errors.push({
      type: 'FORM_INTERACTION_ERROR',
      message: error.message,
      viewport: viewport.name
    });
  }
}

/**
 * ✅ Form Validation Testing
 */
async function testFormValidation(page, viewport) {
  console.log('  ✅ Testing form validation...');
  
  try {
    // Test empty form submission
    const submitButtons = await page.locator('button:has-text("Enviar"), button:has-text("Finalizar"), button:has-text("Solicitar")').all();
    
    if (submitButtons.length > 0) {
      await submitButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Look for validation messages
      const errorMessages = await page.locator('.error, .invalid, [class*="error"], .text-red').all();
      const validationResults = [];
      
      for (const error of errorMessages) {
        if (await error.isVisible()) {
          const message = await error.textContent();
          validationResults.push({
            message,
            visible: true
          });
        }
      }
      
      analysisResults.formAnalysis.validationTests = validationResults;
      console.log(`    ✅ Found ${validationResults.length} validation messages`);
      
      // Capture validation screenshot
      const screenshotPath = `${CONFIG.screenshotsDir}/04-form-validation-${viewport.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      analysisResults.screenshots.push(screenshotPath);
    }
    
  } catch (error) {
    console.error('    ❌ Form validation test failed:', error.message);
    analysisResults.errors.push({
      type: 'FORM_VALIDATION_ERROR',
      message: error.message,
      viewport: viewport.name
    });
  }
}

/**
 * 🎯 Complete User Journey Test
 */
async function testCompleteUserJourney(page, viewport) {
  console.log('  🎯 Testing complete user journey...');
  
  try {
    // Reload page to start fresh
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Open lead form
    if (analysisResults.formAnalysis.triggerSelector) {
      await page.click(analysisResults.formAnalysis.triggerSelector);
      await page.waitForTimeout(2000);
    }
    
    // Fill form with test data
    const fillActions = [];
    
    // Try to fill name field
    const nameFields = await page.locator('input[placeholder*="nome"], input[name*="nome"], input[type="text"]').all();
    if (nameFields.length > 0) {
      await nameFields[0].fill(TEST_LEAD_DATA.nome);
      fillActions.push('nome');
    }
    
    // Try to fill email field
    const emailFields = await page.locator('input[type="email"], input[placeholder*="email"], input[name*="email"]').all();
    if (emailFields.length > 0) {
      await emailFields[0].fill(TEST_LEAD_DATA.email);
      fillActions.push('email');
    }
    
    // Try to fill WhatsApp field
    const phoneFields = await page.locator('input[type="tel"], input[placeholder*="whatsapp"], input[name*="whatsapp"]').all();
    if (phoneFields.length > 0) {
      await phoneFields[0].fill(TEST_LEAD_DATA.whatsapp);
      fillActions.push('whatsapp');
    }
    
    analysisResults.formAnalysis.userJourney = fillActions;
    
    // Capture filled form screenshot
    const screenshotPath = `${CONFIG.screenshotsDir}/05-form-filled-${viewport.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    analysisResults.screenshots.push(screenshotPath);
    
    console.log(`    ✅ Successfully filled ${fillActions.length} form fields`);
    
  } catch (error) {
    console.error('    ❌ User journey test failed:', error.message);
    analysisResults.errors.push({
      type: 'USER_JOURNEY_ERROR',
      message: error.message,
      viewport: viewport.name
    });
  }
}

/**
 * 🌐 Backend Connectivity Test
 */
async function testBackendConnectivity(page, viewport) {
  console.log('  🌐 Testing backend connectivity...');
  
  try {
    // Test API endpoint directly
    const apiUrl = `${CONFIG.baseUrl}/api/leads`;
    
    // Monitor network requests
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/leads') && request.method() === 'POST'
    );
    
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/leads') && response.request().method() === 'POST'
    );
    
    // Submit the form
    const submitButtons = await page.locator('button:has-text("Enviar"), button:has-text("Finalizar"), button:has-text("Solicitar")').all();
    
    if (submitButtons.length > 0) {
      const submitStartTime = Date.now();
      
      await submitButtons[0].click();
      
      try {
        // Wait for the request and response
        const [request, response] = await Promise.all([
          requestPromise,
          responsePromise
        ]);
        
        const submitTime = Date.now() - submitStartTime;
        analysisResults.performanceMetrics.submissionTime = submitTime;
        
        const responseData = await response.json();
        
        analysisResults.backendConnectivity = {
          requestSent: true,
          responseReceived: true,
          statusCode: response.status(),
          responseTime: submitTime,
          responseData: responseData,
          success: response.ok()
        };
        
        console.log(`    ✅ Backend connectivity successful (${response.status()}) in ${submitTime}ms`);
        
        // Capture success screenshot
        await page.waitForTimeout(2000);
        const screenshotPath = `${CONFIG.screenshotsDir}/06-submission-result-${viewport.name}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        analysisResults.screenshots.push(screenshotPath);
        
      } catch (networkError) {
        analysisResults.backendConnectivity = {
          requestSent: true,
          responseReceived: false,
          error: networkError.message
        };
        console.error('    ❌ Backend connectivity failed:', networkError.message);
      }
    }
    
  } catch (error) {
    console.error('    ❌ Backend connectivity test failed:', error.message);
    analysisResults.errors.push({
      type: 'BACKEND_CONNECTIVITY_ERROR',
      message: error.message,
      viewport: viewport.name
    });
  }
}

/**
 * 📋 Generate Comprehensive Analysis Report
 */
async function generateAnalysisReport() {
  console.log('  📋 Generating comprehensive analysis report...');
  
  const report = `# 🎯 COMPREHENSIVE LEAD FORM ANALYSIS REPORT

## 📊 Executive Summary

**Analysis Date:** ${analysisResults.timestamp}  
**Target Application:** Fly2Any Lead Form (Desktop Version)  
**Test Environment:** ${CONFIG.baseUrl}  

### 🚦 Overall Status
- **Form Discovery:** ${analysisResults.formAnalysis.triggerFound ? '✅ SUCCESS' : '❌ FAILED'}
- **Backend Connectivity:** ${analysisResults.backendConnectivity.success ? '✅ CONNECTED' : '❌ FAILED'}
- **User Journey:** ${analysisResults.formAnalysis.userJourney.length > 0 ? '✅ FUNCTIONAL' : '❌ ISSUES DETECTED'}

---

## 🔍 DETAILED ANALYSIS

### 1. 📄 Frontend Analysis

#### Lead Form Discovery
- **Trigger Found:** ${analysisResults.formAnalysis.triggerFound ? 'YES' : 'NO'}
- **Trigger Selector:** ${analysisResults.formAnalysis.triggerSelector || 'Not found'}
- **Form Elements:** ${analysisResults.formAnalysis.formElements.length} elements detected

#### Form Elements Analysis
${analysisResults.formAnalysis.formElements.map(el => 
  `- **${el.type}** field: ${el.placeholder || el.name || 'Unnamed'} (${el.visible ? 'Visible' : 'Hidden'})`
).join('\n')}

#### Form Validation
${analysisResults.formAnalysis.validationTests.map(v => 
  `- Validation message: "${v.message}"`
).join('\n')}

### 2. 🌐 Backend Connectivity Analysis

#### API Endpoint Testing
- **Endpoint:** \`${CONFIG.baseUrl}/api/leads\`
- **Request Status:** ${analysisResults.backendConnectivity.requestSent ? 'SENT' : 'NOT SENT'}
- **Response Status:** ${analysisResults.backendConnectivity.responseReceived ? 'RECEIVED' : 'NOT RECEIVED'}
- **HTTP Status Code:** ${analysisResults.backendConnectivity.statusCode || 'N/A'}
- **Response Time:** ${analysisResults.backendConnectivity.responseTime || 0}ms

#### Response Analysis
\`\`\`json
${JSON.stringify(analysisResults.backendConnectivity.responseData || {}, null, 2)}
\`\`\`

### 3. 🎯 User Journey Analysis

#### Form Completion Flow
${analysisResults.formAnalysis.userJourney.map(action => 
  `- ✅ ${action} field filled successfully`
).join('\n')}

#### Performance Metrics
- **Page Load Time:** ${analysisResults.performanceMetrics.pageLoadTime}ms
- **Form Submission Time:** ${analysisResults.performanceMetrics.submissionTime}ms
- **Total Test Duration:** ${Date.now() - new Date(analysisResults.timestamp).getTime()}ms

### 4. 🔄 Database Persistence Analysis

${analysisResults.databasePersistence.leadCreated ? 
  `- ✅ Lead successfully created in database
- **Lead ID:** ${analysisResults.databasePersistence.leadData?.id || 'Unknown'}
- **Storage Method:** ${analysisResults.databasePersistence.storageMethod || 'Unknown'}` :
  `- ❌ Database persistence could not be verified
- **Reason:** Lead creation status unknown`}

---

## 🚨 ISSUES AND ERRORS

${analysisResults.errors.length === 0 ? '✅ No critical errors detected!' : 
  analysisResults.errors.map(error => 
    `### ${error.type}
- **Message:** ${error.message}
- **Context:** ${error.viewport || 'General'}
- **Timestamp:** ${error.timestamp || 'N/A'}`
  ).join('\n\n')}

---

## 📈 RECOMMENDATIONS

${analysisResults.formAnalysis.triggerFound ? 
  '✅ Lead Form is properly discoverable and accessible' : 
  '🔴 **CRITICAL:** Lead Form trigger not found - this prevents user conversion'}

${analysisResults.backendConnectivity.success ? 
  '✅ Backend API is responding correctly' : 
  '🔴 **CRITICAL:** Backend connectivity issues detected - leads may not be saved'}

${analysisResults.formAnalysis.userJourney.length >= 3 ? 
  '✅ Core form fields are functional' : 
  '🟡 **WARNING:** Some form fields may not be working correctly'}

## 🖼️ VISUAL EVIDENCE

Screenshots captured during analysis:
${analysisResults.screenshots.map(screenshot => `- \`${screenshot}\``).join('\n')}

---

## 🔧 TECHNICAL DETAILS

### Network Requests
${analysisResults.networkRequests ? analysisResults.networkRequests.map(req => 
  `- **${req.type}:** ${req.method || ''} ${req.url} (Status: ${req.status || 'N/A'})`
).join('\n') : 'No network requests captured'}

### Test Configuration
- **Browsers:** ${CONFIG.browsers.join(', ')}
- **Viewports:** ${CONFIG.viewports.map(v => `${v.name} (${v.width}x${v.height})`).join(', ')}
- **Test Timeout:** ${CONFIG.testTimeout}ms

---

*Report generated automatically by Fly2Any Lead Form Analysis System*
*Timestamp: ${new Date().toISOString()}*
`;

  // Write report to file
  fs.writeFileSync(CONFIG.reportFile, report);
  console.log(`    ✅ Report saved to: ${CONFIG.reportFile}`);
}

// Run the analysis
if (require.main === module) {
  runComprehensiveLeadFormAnalysis().catch(error => {
    console.error('❌ Critical analysis failure:', error);
    process.exit(1);
  });
}

module.exports = { runComprehensiveLeadFormAnalysis };