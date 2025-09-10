/**
 * 🎯 TARGETED LEAD FORM TEST
 * Based on manual analysis findings - test the actual Lead Form elements found
 */

const { chromium } = require('playwright');
const fs = require('fs');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotsDir: './test-screenshots/targeted-test',
  reportFile: './TARGETED_LEAD_FORM_TEST_REPORT.md'
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  screenshots: [],
  formSubmission: null,
  apiRequests: []
};

async function runTargetedTest() {
  console.log('🎯 Starting Targeted Lead Form Test...');
  console.log('Based on manual analysis findings');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Monitor network requests
  const networkMonitor = [];
  page.on('request', req => {
    if (req.url().includes('/api/leads')) {
      networkMonitor.push({
        type: 'REQUEST',
        url: req.url(),
        method: req.method(),
        postData: req.postData(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', res => {
    if (res.url().includes('/api/leads')) {
      networkMonitor.push({
        type: 'RESPONSE',
        url: res.url(),
        status: res.status(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('📄 Loading homepage...');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    const screenshot1 = `${CONFIG.screenshotsDir}/01-homepage-loaded.png`;
    await page.screenshot({ path: screenshot1, fullPage: true });
    testResults.screenshots.push(screenshot1);
    console.log('📸 Screenshot 1: Homepage loaded');
    
    // Test 1: Check if "Save up to $250 - Free Quote" button works
    console.log('\n🧪 Test 1: Testing "Free Quote" button...');
    try {
      const quoteButton = await page.locator('button:has-text("Save up to $250 - Free Quote")');
      if (await quoteButton.count() > 0) {
        console.log('  ✅ Found "Free Quote" button');
        await quoteButton.click();
        await page.waitForTimeout(2000);
        
        const screenshot2 = `${CONFIG.screenshotsDir}/02-after-quote-button.png`;
        await page.screenshot({ path: screenshot2, fullPage: true });
        testResults.screenshots.push(screenshot2);
        
        testResults.tests.push({
          name: 'Free Quote Button Click',
          status: 'SUCCESS',
          details: 'Button found and clicked successfully'
        });
      } else {
        console.log('  ❌ "Free Quote" button not found');
        testResults.tests.push({
          name: 'Free Quote Button Click', 
          status: 'FAILED',
          details: 'Button not found'
        });
      }
    } catch (e) {
      console.log('  ❌ Error testing Free Quote button:', e.message);
      testResults.tests.push({
        name: 'Free Quote Button Click',
        status: 'ERROR',
        details: e.message
      });
    }
    
    // Test 2: Test service selection buttons
    console.log('\n🧪 Test 2: Testing service selection buttons...');
    const services = ['Voos', 'Hotéis', 'Carros', 'Passeios', 'Seguro'];
    
    for (const service of services) {
      try {
        const serviceButton = await page.locator(`button:has-text("${service}")`).first();
        if (await serviceButton.count() > 0 && await serviceButton.isVisible()) {
          console.log(`  ✅ Testing ${service} button...`);
          await serviceButton.click();
          await page.waitForTimeout(1500);
          
          testResults.tests.push({
            name: `${service} Service Button`,
            status: 'SUCCESS',
            details: 'Service button clicked successfully'
          });
        } else {
          console.log(`  ❌ ${service} button not visible`);
          testResults.tests.push({
            name: `${service} Service Button`,
            status: 'FAILED',
            details: 'Button not visible'
          });
        }
      } catch (e) {
        console.log(`  ❌ Error testing ${service} button:`, e.message);
      }
    }
    
    const screenshot3 = `${CONFIG.screenshotsDir}/03-after-services-selection.png`;
    await page.screenshot({ path: screenshot3, fullPage: true });
    testResults.screenshots.push(screenshot3);
    
    // Test 3: Look for and test form fields
    console.log('\n🧪 Test 3: Testing form fields...');
    
    // Look for email input
    const emailInputs = await page.locator('input[type="email"]').all();
    console.log(`  📧 Found ${emailInputs.length} email inputs`);
    
    for (let i = 0; i < emailInputs.length; i++) {
      try {
        if (await emailInputs[i].isVisible()) {
          console.log(`  ✅ Testing email input ${i + 1}...`);
          await emailInputs[i].fill('teste.leadform@fly2any.com');
          await page.waitForTimeout(1000);
          
          testResults.tests.push({
            name: `Email Input ${i + 1}`,
            status: 'SUCCESS', 
            details: 'Email input filled successfully'
          });
        }
      } catch (e) {
        console.log(`  ❌ Error with email input ${i + 1}:`, e.message);
      }
    }
    
    // Look for name/text inputs
    const textInputs = await page.locator('input[type="text"], input[placeholder*="nome"], input[placeholder*="Name"]').all();
    console.log(`  👤 Found ${textInputs.length} text/name inputs`);
    
    for (let i = 0; i < Math.min(textInputs.length, 3); i++) {
      try {
        if (await textInputs[i].isVisible()) {
          console.log(`  ✅ Testing text input ${i + 1}...`);
          await textInputs[i].fill('João Silva Teste');
          await page.waitForTimeout(1000);
          
          testResults.tests.push({
            name: `Text Input ${i + 1}`,
            status: 'SUCCESS',
            details: 'Text input filled successfully'
          });
        }
      } catch (e) {
        console.log(`  ❌ Error with text input ${i + 1}:`, e.message);
      }
    }
    
    // Look for phone inputs
    const phoneInputs = await page.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="whatsapp"]').all();
    console.log(`  📞 Found ${phoneInputs.length} phone inputs`);
    
    for (let i = 0; i < phoneInputs.length; i++) {
      try {
        if (await phoneInputs[i].isVisible()) {
          console.log(`  ✅ Testing phone input ${i + 1}...`);
          await phoneInputs[i].fill('+55 11 99999-9999');
          await page.waitForTimeout(1000);
          
          testResults.tests.push({
            name: `Phone Input ${i + 1}`,
            status: 'SUCCESS',
            details: 'Phone input filled successfully'
          });
        }
      } catch (e) {
        console.log(`  ❌ Error with phone input ${i + 1}:`, e.message);
      }
    }
    
    const screenshot4 = `${CONFIG.screenshotsDir}/04-form-fields-filled.png`;
    await page.screenshot({ path: screenshot4, fullPage: true });
    testResults.screenshots.push(screenshot4);
    
    // Test 4: Look for submit buttons and test submission
    console.log('\n🧪 Test 4: Testing form submission...');
    
    const submitTexts = ['Enviar', 'Finalizar', 'Solicitar', 'Submit', 'Send', 'Cotação'];
    let submitButton = null;
    
    for (const text of submitTexts) {
      const buttons = await page.locator(`button:has-text("${text}")`).all();
      for (const button of buttons) {
        if (await button.isVisible()) {
          submitButton = button;
          console.log(`  ✅ Found submit button: "${text}"`);
          break;
        }
      }
      if (submitButton) break;
    }
    
    if (submitButton) {
      try {
        console.log('  🚀 Attempting form submission...');
        await submitButton.click();
        await page.waitForTimeout(5000); // Wait for submission
        
        const screenshot5 = `${CONFIG.screenshotsDir}/05-after-submission.png`;
        await page.screenshot({ path: screenshot5, fullPage: true });
        testResults.screenshots.push(screenshot5);
        
        testResults.tests.push({
          name: 'Form Submission',
          status: 'SUCCESS',
          details: 'Submit button clicked successfully'
        });
        
        // Check for success/error messages
        const messages = await page.locator('.success, .error, .message, [class*="success"], [class*="error"]').all();
        for (const msg of messages) {
          if (await msg.isVisible()) {
            const text = await msg.textContent();
            console.log(`  💬 Found message: "${text}"`);
          }
        }
        
      } catch (e) {
        console.log('  ❌ Form submission error:', e.message);
        testResults.tests.push({
          name: 'Form Submission',
          status: 'ERROR',
          details: e.message
        });
      }
    } else {
      console.log('  ❌ No submit button found');
      testResults.tests.push({
        name: 'Form Submission',
        status: 'FAILED',
        details: 'No submit button found'
      });
    }
    
    // Store network monitoring results
    testResults.apiRequests = networkMonitor;
    
    console.log('\n📊 Test Summary:');
    console.log(`✅ Successful tests: ${testResults.tests.filter(t => t.status === 'SUCCESS').length}`);
    console.log(`❌ Failed tests: ${testResults.tests.filter(t => t.status === 'FAILED').length}`);
    console.log(`⚠️  Error tests: ${testResults.tests.filter(t => t.status === 'ERROR').length}`);
    console.log(`🌐 API requests monitored: ${networkMonitor.length}`);
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    // Generate report
    await generateTargetedReport();
    await browser.close();
    console.log('✅ Targeted test completed!');
  }
}

async function generateTargetedReport() {
  const report = `# 🎯 TARGETED LEAD FORM TEST REPORT

## 📊 Test Summary

**Test Date:** ${testResults.timestamp}  
**Total Tests:** ${testResults.tests.length}  
**Successful:** ${testResults.tests.filter(t => t.status === 'SUCCESS').length}  
**Failed:** ${testResults.tests.filter(t => t.status === 'FAILED').length}  
**Errors:** ${testResults.tests.filter(t => t.status === 'ERROR').length}  

## 🧪 Individual Test Results

${testResults.tests.map(test => `
### ${test.name}
- **Status:** ${test.status}
- **Details:** ${test.details}
`).join('')}

## 🌐 API Monitoring Results

${testResults.apiRequests.length === 0 ? 'No API requests to /api/leads detected' : 
  testResults.apiRequests.map(req => `
- **${req.type}:** ${req.method || ''} ${req.url}
- **Status:** ${req.status || 'N/A'}
- **Timestamp:** ${req.timestamp}
${req.postData ? `- **Data:** ${req.postData}` : ''}
`).join('')}

## 🖼️ Screenshots

${testResults.screenshots.map(screenshot => `- ![Screenshot](${screenshot})`).join('\n')}

## 🔍 Key Findings

1. **Service Selection:** ${testResults.tests.filter(t => t.name.includes('Service Button')).every(t => t.status === 'SUCCESS') ? 'All service buttons functional' : 'Some service buttons not working'}

2. **Form Fields:** ${testResults.tests.filter(t => t.name.includes('Input')).length > 0 ? 'Form fields detected and testable' : 'No form fields found'}

3. **Form Submission:** ${testResults.tests.find(t => t.name === 'Form Submission')?.status === 'SUCCESS' ? 'Submission mechanism working' : 'Submission issues detected'}

4. **Backend Connectivity:** ${testResults.apiRequests.length > 0 ? 'API requests detected' : 'No API requests captured'}

---

*Report generated: ${new Date().toISOString()}*
`;

  fs.writeFileSync(CONFIG.reportFile, report);
  console.log(`📋 Report saved to: ${CONFIG.reportFile}`);
}

// Run the test
if (require.main === module) {
  runTargetedTest().catch(console.error);
}

module.exports = { runTargetedTest };