/**
 * 🎯 END-TO-END USER JOURNEY TEST
 * Complete user journey simulation from frontend to database persistence
 */

const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotsDir: './test-screenshots/e2e-journey',
  reportFile: './E2E_USER_JOURNEY_REPORT.md'
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

let journeyResults = {
  timestamp: new Date().toISOString(),
  steps: [],
  screenshots: [],
  apiInteractions: [],
  databaseVerification: null,
  overallSuccess: false
};

/**
 * 🚀 Complete End-to-End Journey Test
 */
async function runEndToEndJourneyTest() {
  console.log('🚀 Starting End-to-End User Journey Test...');
  console.log('🎯 Simulating complete user flow from frontend to database');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Monitor network requests
  page.on('request', req => {
    if (req.url().includes('/api/leads')) {
      journeyResults.apiInteractions.push({
        type: 'REQUEST',
        method: req.method(),
        url: req.url(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('response', res => {
    if (res.url().includes('/api/leads')) {
      journeyResults.apiInteractions.push({
        type: 'RESPONSE', 
        status: res.status(),
        url: res.url(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    // Step 1: Load Homepage
    console.log('\n📄 Step 1: Loading homepage...');
    await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const screenshot1 = `${CONFIG.screenshotsDir}/step1-homepage-loaded.png`;
    await page.screenshot({ path: screenshot1, fullPage: true });
    journeyResults.screenshots.push(screenshot1);
    
    journeyResults.steps.push({
      step: 1,
      name: 'Homepage Load',
      status: 'SUCCESS',
      details: 'Homepage loaded successfully'
    });
    console.log('  ✅ Homepage loaded successfully');
    
    // Step 2: Look for and click Lead Form trigger
    console.log('\n🔍 Step 2: Finding Lead Form entry point...');
    
    let leadFormOpened = false;
    const triggerSelectors = [
      'button:has-text("Save up to $250 - Free Quote")',
      'button:has-text("Cotação")',
      'button:has-text("Orçamento")',
      '.lead-capture',
      '[data-testid*="lead"]'
    ];
    
    for (const selector of triggerSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          console.log(`  ✅ Found trigger: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          leadFormOpened = true;
          
          journeyResults.steps.push({
            step: 2,
            name: 'Lead Form Trigger',
            status: 'SUCCESS', 
            details: `Triggered using: ${selector}`
          });
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!leadFormOpened) {
      console.log('  ⚠️ No obvious Lead Form trigger found, proceeding with form field discovery...');
      journeyResults.steps.push({
        step: 2,
        name: 'Lead Form Trigger',
        status: 'PARTIAL',
        details: 'No trigger button found, but continuing with form field discovery'
      });
    }
    
    const screenshot2 = `${CONFIG.screenshotsDir}/step2-form-trigger.png`;
    await page.screenshot({ path: screenshot2, fullPage: true });
    journeyResults.screenshots.push(screenshot2);
    
    // Step 3: Fill out form fields
    console.log('\n📝 Step 3: Filling form fields...');
    
    const testData = {
      name: 'Maria João E2E Test',
      email: 'maria.e2e@fly2anytest.com',
      phone: '+55 11 98888-7777'
    };
    
    let formFieldsFilled = 0;
    
    // Fill name field
    const nameFields = await page.locator('input[type="text"], input[placeholder*="nome"], input[name*="nome"]').all();
    for (const field of nameFields) {
      if (await field.isVisible()) {
        try {
          await field.fill(testData.name);
          formFieldsFilled++;
          console.log('  ✅ Name field filled');
          break;
        } catch (e) {
          console.log('  ⚠️ Error filling name field:', e.message);
        }
      }
    }
    
    // Fill email field
    const emailFields = await page.locator('input[type="email"], input[placeholder*="email"]').all();
    for (const field of emailFields) {
      if (await field.isVisible()) {
        try {
          await field.fill(testData.email);
          formFieldsFilled++;
          console.log('  ✅ Email field filled');
          break;
        } catch (e) {
          console.log('  ⚠️ Error filling email field:', e.message);
        }
      }
    }
    
    // Fill phone field
    const phoneFields = await page.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="whatsapp"]').all();
    for (const field of phoneFields) {
      if (await field.isVisible()) {
        try {
          await field.fill(testData.phone);
          formFieldsFilled++;
          console.log('  ✅ Phone field filled');
          break;
        } catch (e) {
          console.log('  ⚠️ Error filling phone field:', e.message);
        }
      }
    }
    
    journeyResults.steps.push({
      step: 3,
      name: 'Form Field Filling',
      status: formFieldsFilled > 0 ? 'SUCCESS' : 'FAILED',
      details: `Filled ${formFieldsFilled} form fields`
    });
    
    const screenshot3 = `${CONFIG.screenshotsDir}/step3-form-filled.png`;
    await page.screenshot({ path: screenshot3, fullPage: true });
    journeyResults.screenshots.push(screenshot3);
    
    // Step 4: Submit form
    console.log('\n🚀 Step 4: Submitting form...');
    
    const submitTexts = ['Enviar', 'Finalizar', 'Solicitar', 'Submit', 'Send', 'Cotação'];
    let formSubmitted = false;
    
    for (const text of submitTexts) {
      const buttons = await page.locator(`button:has-text("${text}")`).all();
      for (const button of buttons) {
        if (await button.isVisible()) {
          try {
            console.log(`  🎯 Attempting to submit with button: "${text}"`);
            await button.click();
            await page.waitForTimeout(5000); // Wait for submission
            formSubmitted = true;
            
            journeyResults.steps.push({
              step: 4,
              name: 'Form Submission',
              status: 'SUCCESS',
              details: `Submitted using button: "${text}"`
            });
            break;
          } catch (e) {
            console.log(`  ❌ Error submitting with "${text}":`, e.message);
          }
        }
      }
      if (formSubmitted) break;
    }
    
    if (!formSubmitted) {
      console.log('  ❌ No working submit button found');
      journeyResults.steps.push({
        step: 4,
        name: 'Form Submission',
        status: 'FAILED',
        details: 'No working submit button found'
      });
    }
    
    const screenshot4 = `${CONFIG.screenshotsDir}/step4-form-submitted.png`;
    await page.screenshot({ path: screenshot4, fullPage: true });
    journeyResults.screenshots.push(screenshot4);
    
    // Step 5: Check for success/error messages
    console.log('\n✅ Step 5: Checking for feedback messages...');
    
    await page.waitForTimeout(2000);
    
    const messageSelectors = [
      '.success, .error, .message',
      '[class*="success"], [class*="error"]',
      'text="Obrigado"',
      'text="Sucesso"',
      'text="Erro"'
    ];
    
    let feedbackFound = false;
    for (const selector of messageSelectors) {
      const messages = await page.locator(selector).all();
      for (const msg of messages) {
        if (await msg.isVisible()) {
          const text = await msg.textContent();
          console.log(`  💬 Found feedback: "${text}"`);
          feedbackFound = true;
          break;
        }
      }
      if (feedbackFound) break;
    }
    
    journeyResults.steps.push({
      step: 5,
      name: 'User Feedback',
      status: feedbackFound ? 'SUCCESS' : 'PARTIAL',
      details: feedbackFound ? 'Feedback message displayed' : 'No clear feedback message found'
    });
    
    // Step 6: Verify database persistence
    console.log('\n🗄️ Step 6: Verifying database persistence...');
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for database write
    
    const dbVerification = await verifyDatabasePersistence(testData.email);
    journeyResults.databaseVerification = dbVerification;
    
    journeyResults.steps.push({
      step: 6,
      name: 'Database Verification',
      status: dbVerification.success ? 'SUCCESS' : 'FAILED',
      details: dbVerification.message
    });
    
    // Calculate overall success
    const successfulSteps = journeyResults.steps.filter(s => s.status === 'SUCCESS').length;
    const totalSteps = journeyResults.steps.length;
    journeyResults.overallSuccess = successfulSteps >= totalSteps * 0.7; // 70% success threshold
    
    console.log('\n📊 End-to-End Journey Summary:');
    console.log(`✅ Successful steps: ${successfulSteps}/${totalSteps}`);
    console.log(`🌐 API interactions: ${journeyResults.apiInteractions.length}`);
    console.log(`🗄️ Database verification: ${dbVerification.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`🎯 Overall journey: ${journeyResults.overallSuccess ? 'SUCCESS' : 'NEEDS ATTENTION'}`);
    
  } catch (error) {
    console.error('❌ End-to-end journey error:', error);
    journeyResults.steps.push({
      step: 'ERROR',
      name: 'Critical Error',
      status: 'ERROR',
      details: error.message
    });
  } finally {
    await browser.close();
    await generateE2EReport();
    console.log('✅ End-to-End User Journey Test Complete!');
  }
}

/**
 * 🗄️ Verify Database Persistence
 */
async function verifyDatabasePersistence(email) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads?limit=10',
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.success && data.data?.leads) {
            const foundLead = data.data.leads.find(lead => 
              lead.email === email || 
              lead.observacoes?.includes('E2E Test')
            );
            
            if (foundLead) {
              console.log(`  ✅ Lead found in database: ${foundLead.id}`);
              resolve({
                success: true,
                message: `Lead persisted successfully (ID: ${foundLead.id})`,
                leadId: foundLead.id,
                leadData: foundLead
              });
            } else {
              console.log('  ❌ Lead not found in database');
              resolve({
                success: false,
                message: `Lead not found (searched for email: ${email})`,
                totalLeads: data.data.leads.length
              });
            }
          } else {
            console.log('  ❌ Unable to retrieve leads from database');
            resolve({
              success: false,
              message: 'Unable to retrieve leads from database'
            });
          }
        } catch (error) {
          console.log('  ❌ Database verification error:', error.message);
          resolve({
            success: false,
            message: `Database verification error: ${error.message}`
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        message: `Database connection error: ${error.message}`
      });
    });
    
    req.setTimeout(10000);
    req.end();
  });
}

/**
 * 📋 Generate E2E Report
 */
async function generateE2EReport() {
  const report = `# 🎯 END-TO-END USER JOURNEY TEST REPORT

## 📊 Journey Summary

**Test Date:** ${journeyResults.timestamp}  
**Overall Success:** ${journeyResults.overallSuccess ? '✅ SUCCESS' : '❌ NEEDS ATTENTION'}  
**Total Steps:** ${journeyResults.steps.length}  
**Successful Steps:** ${journeyResults.steps.filter(s => s.status === 'SUCCESS').length}  
**API Interactions:** ${journeyResults.apiInteractions.length}  

## 🚶‍♂️ Step-by-Step Journey

${journeyResults.steps.map(step => `
### Step ${step.step}: ${step.name}
- **Status:** ${step.status === 'SUCCESS' ? '✅' : step.status === 'PARTIAL' ? '🟡' : '❌'} ${step.status}
- **Details:** ${step.details}
`).join('')}

## 🌐 API Interactions Captured

${journeyResults.apiInteractions.length === 0 ? 'No API interactions detected during the journey.' : 
  journeyResults.apiInteractions.map(interaction => `
- **${interaction.type}:** ${interaction.method || ''} ${interaction.url}
- **Status:** ${interaction.status || 'N/A'}
- **Timestamp:** ${interaction.timestamp}
`).join('')}

## 🗄️ Database Persistence Verification

${journeyResults.databaseVerification ? `
- **Status:** ${journeyResults.databaseVerification.success ? '✅ SUCCESS' : '❌ FAILED'}
- **Message:** ${journeyResults.databaseVerification.message}
${journeyResults.databaseVerification.leadId ? `- **Lead ID:** ${journeyResults.databaseVerification.leadId}` : ''}
${journeyResults.databaseVerification.totalLeads ? `- **Total Leads in DB:** ${journeyResults.databaseVerification.totalLeads}` : ''}
` : 'Database verification not performed.'}

## 🖼️ Journey Screenshots

${journeyResults.screenshots.map(screenshot => `- ![Step Screenshot](${screenshot})`).join('\n')}

## 🔍 Key Findings

### ✅ Working Components
${journeyResults.steps.filter(s => s.status === 'SUCCESS').map(s => `- ${s.name}: ${s.details}`).join('\n')}

### ⚠️ Areas Needing Attention
${journeyResults.steps.filter(s => s.status !== 'SUCCESS').map(s => `- ${s.name}: ${s.details}`).join('\n')}

### 🎯 User Experience Assessment

**Form Discovery:** ${journeyResults.steps.find(s => s.name === 'Lead Form Trigger')?.status === 'SUCCESS' ? 'Users can easily find the lead form' : 'Lead form entry point needs improvement'}

**Form Usability:** ${journeyResults.steps.find(s => s.name === 'Form Field Filling')?.status === 'SUCCESS' ? 'Form fields are functional and user-friendly' : 'Form field issues detected'}

**Submission Process:** ${journeyResults.steps.find(s => s.name === 'Form Submission')?.status === 'SUCCESS' ? 'Form submission works correctly' : 'Form submission needs attention'}

**Backend Integration:** ${journeyResults.databaseVerification?.success ? 'Backend and database integration working correctly' : 'Backend integration issues detected'}

**User Feedback:** ${journeyResults.steps.find(s => s.name === 'User Feedback')?.status === 'SUCCESS' ? 'Users receive clear feedback after submission' : 'User feedback mechanism needs improvement'}

---

*End-to-End Journey Test completed: ${new Date().toISOString()}*
`;

  fs.writeFileSync(CONFIG.reportFile, report);
  console.log(`📋 E2E report saved to: ${CONFIG.reportFile}`);
}

// Run the test
if (require.main === module) {
  runEndToEndJourneyTest().catch(console.error);
}

module.exports = { runEndToEndJourneyTest };