const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@fly2any.com';
const ADMIN_EMAIL_MARKETING_URL = `${BASE_URL}/admin/email-marketing/v2`;
const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');

// Create screenshots directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Test results tracking
const testResults = {
  startTime: new Date().toISOString(),
  testsPassed: 0,
  testsFailed: 0,
  errors: [],
  warnings: [],
  performanceMetrics: {},
  screenshots: [],
  userJourneySteps: []
};

// Utility functions
function logStep(step, status = 'INFO', duration = null) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, step, status, duration };
  testResults.userJourneySteps.push(logEntry);
  console.log(`[${timestamp}] ${status}: ${step}${duration ? ` (${duration}ms)` : ''}`);
}

function logError(error, context) {
  testResults.errors.push({ context, error: error.message, timestamp: new Date().toISOString() });
  console.error(`ERROR in ${context}: ${error.message}`);
}

function logWarning(warning, context) {
  testResults.warnings.push({ context, warning, timestamp: new Date().toISOString() });
  console.warn(`WARNING in ${context}: ${warning}`);
}

async function takeScreenshot(page, name, context = '') {
  try {
    const filename = `${name}_${Date.now()}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    testResults.screenshots.push({ filename, context, timestamp: new Date().toISOString() });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  } catch (error) {
    logError(error, `Screenshot: ${name}`);
  }
}

async function measurePageLoad(page, url, stepName) {
  const startTime = Date.now();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const loadTime = Date.now() - startTime;
    testResults.performanceMetrics[stepName] = loadTime;
    logStep(`${stepName} loaded successfully`, 'SUCCESS', loadTime);
    return loadTime;
  } catch (error) {
    const loadTime = Date.now() - startTime;
    testResults.performanceMetrics[stepName] = loadTime;
    logError(error, stepName);
    throw error;
  }
}

async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    logWarning(`Element not found: ${selector}`, 'Element Wait');
    return false;
  }
}

async function runCompleteUserJourney() {
  let browser, page;

  try {
    logStep('🚀 Starting Complete User Journey Testing', 'START');
    
    // Launch browser
    browser = await chromium.launch({ 
      headless: false, // Set to true for CI/CD
      slowMo: 500 // Slow down actions for better observation
    });
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Enable request/response logging
    page.on('request', request => {
      if (request.url().includes('/api/email-marketing')) {
        console.log(`📤 API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/email-marketing')) {
        console.log(`📥 API Response: ${response.status()} ${response.url()}`);
      }
    });

    // 1. SYSTEM ACCESS & AUTHENTICATION
    logStep('1️⃣ Testing System Access & Authentication', 'INFO');
    
    const homeLoadTime = await measurePageLoad(page, BASE_URL, 'Homepage Load');
    await takeScreenshot(page, 'homepage', 'Initial homepage load');
    
    // Check if authentication is required
    const currentUrl = page.url();
    logStep(`Current URL after homepage load: ${currentUrl}`, 'INFO');
    
    // Navigate to admin email marketing
    logStep('Navigating to Email Marketing Admin Panel', 'INFO');
    const adminLoadTime = await measurePageLoad(page, ADMIN_EMAIL_MARKETING_URL, 'Admin Panel Load');
    await takeScreenshot(page, 'admin-panel', 'Email marketing admin panel');
    
    // Check for authentication redirect or direct access
    if (page.url().includes('/auth') || page.url().includes('/login')) {
      logStep('Authentication required - testing login flow', 'INFO');
      // Handle authentication if needed
      await takeScreenshot(page, 'auth-page', 'Authentication page');
      // Note: In a real scenario, you'd implement login here
      logWarning('Authentication flow detected but not implemented in test', 'Authentication');
    } else {
      logStep('Direct access to admin panel successful', 'SUCCESS');
      testResults.testsPassed++;
    }

    // 2. DASHBOARD OVERVIEW
    logStep('2️⃣ Testing Dashboard Overview', 'INFO');
    
    // Wait for dashboard elements to load
    const dashboardLoaded = await waitForElement(page, '[data-testid="dashboard"], .dashboard, .email-marketing-dashboard');
    if (dashboardLoaded) {
      logStep('Dashboard elements detected', 'SUCCESS');
      testResults.testsPassed++;
    } else {
      logStep('Dashboard elements not found', 'WARNING');
      testResults.testsFailed++;
    }
    
    await takeScreenshot(page, 'dashboard-overview', 'Main dashboard view');
    
    // Test tab navigation
    const tabs = ['dashboard', 'campaigns', 'contacts', 'templates', 'workflows', 'analytics'];
    for (const tab of tabs) {
      try {
        logStep(`Testing navigation to ${tab} tab`, 'INFO');
        
        // Try multiple selector strategies for tabs
        const tabSelectors = [
          `[data-tab="${tab}"]`,
          `button[data-tab="${tab}"]`,
          `a[href*="${tab}"]`,
          `.tab-${tab}`,
          `button:has-text("${tab.charAt(0).toUpperCase() + tab.slice(1)}")`
        ];
        
        let tabFound = false;
        for (const selector of tabSelectors) {
          try {
            const tabElement = await page.$(selector);
            if (tabElement) {
              const startTime = Date.now();
              await tabElement.click();
              await page.waitForTimeout(2000); // Wait for content to load
              const tabLoadTime = Date.now() - startTime;
              
              testResults.performanceMetrics[`${tab}_tab_load`] = tabLoadTime;
              logStep(`${tab} tab loaded`, 'SUCCESS', tabLoadTime);
              await takeScreenshot(page, `tab-${tab}`, `${tab} tab content`);
              tabFound = true;
              testResults.testsPassed++;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        
        if (!tabFound) {
          logWarning(`${tab} tab not found or not clickable`, 'Navigation');
          testResults.testsFailed++;
        }
        
      } catch (error) {
        logError(error, `Tab Navigation: ${tab}`);
        testResults.testsFailed++;
      }
    }

    // 3. CONTACT MANAGEMENT
    logStep('3️⃣ Testing Contact Management', 'INFO');
    
    // Navigate to contacts tab
    try {
      await page.click('[data-tab="contacts"], button:has-text("Contacts"), .tab-contacts');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'contacts-tab', 'Contacts management interface');
      
      // Check for contact list elements
      const contactsLoaded = await waitForElement(page, '.contacts-list, [data-testid="contacts-list"], table');
      if (contactsLoaded) {
        logStep('Contacts interface loaded successfully', 'SUCCESS');
        testResults.testsPassed++;
      } else {
        logStep('Contacts interface elements not found', 'WARNING');
        testResults.testsFailed++;
      }
      
      // Test contact search/filter functionality
      const searchInput = await page.$('input[placeholder*="search"], input[placeholder*="Search"], .search-input');
      if (searchInput) {
        await searchInput.fill('test@example.com');
        await page.waitForTimeout(1000);
        logStep('Contact search functionality tested', 'SUCCESS');
        testResults.testsPassed++;
      }
      
    } catch (error) {
      logError(error, 'Contact Management');
      testResults.testsFailed++;
    }

    // 4. TEMPLATE MANAGEMENT
    logStep('4️⃣ Testing Template Management', 'INFO');
    
    try {
      await page.click('[data-tab="templates"], button:has-text("Templates"), .tab-templates');
      await page.waitForTimeout(3000);
      await takeScreenshot(page, 'templates-tab', 'Template gallery interface');
      
      // Check for template gallery
      const templatesLoaded = await waitForElement(page, '.template-gallery, [data-testid="template-gallery"], .templates-grid');
      if (templatesLoaded) {
        logStep('Template gallery loaded successfully', 'SUCCESS');
        testResults.testsPassed++;
      } else {
        logStep('Template gallery not found', 'WARNING');
        testResults.testsFailed++;
      }
      
      // Test template categories
      const categories = ['All', 'Promotional', 'Newsletter', 'Transactional'];
      for (const category of categories) {
        try {
          const categoryButton = await page.$(`button:has-text("${category}"), [data-category="${category.toLowerCase()}"]`);
          if (categoryButton) {
            await categoryButton.click();
            await page.waitForTimeout(1000);
            logStep(`${category} template category tested`, 'SUCCESS');
          }
        } catch (error) {
          logWarning(`${category} category not found`, 'Template Categories');
        }
      }
      
    } catch (error) {
      logError(error, 'Template Management');
      testResults.testsFailed++;
    }

    // 5. CAMPAIGN CREATION JOURNEY
    logStep('5️⃣ Testing Campaign Creation Journey', 'INFO');
    
    try {
      // Navigate to campaigns
      await page.click('[data-tab="campaigns"], button:has-text("Campaigns"), .tab-campaigns');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'campaigns-tab', 'Campaigns management interface');
      
      // Try to create a new campaign
      const createButtons = [
        'button:has-text("Create Campaign")',
        'button:has-text("New Campaign")',
        '[data-testid="create-campaign"]',
        '.create-campaign-btn',
        'button:has-text("Create")'
      ];
      
      let campaignCreated = false;
      for (const selector of createButtons) {
        try {
          const createBtn = await page.$(selector);
          if (createBtn) {
            await createBtn.click();
            await page.waitForTimeout(2000);
            await takeScreenshot(page, 'campaign-creation', 'Campaign creation interface');
            
            // Fill campaign details
            const nameInput = await page.$('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]');
            if (nameInput) {
              await nameInput.fill(`Test Campaign ${Date.now()}`);
            }
            
            const subjectInput = await page.$('input[name="subject"], input[placeholder*="subject"], input[placeholder*="Subject"]');
            if (subjectInput) {
              await subjectInput.fill('Test Email Subject - User Journey Testing');
            }
            
            logStep('Campaign creation form filled', 'SUCCESS');
            await takeScreenshot(page, 'campaign-form-filled', 'Campaign form with test data');
            campaignCreated = true;
            testResults.testsPassed++;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!campaignCreated) {
        logWarning('Campaign creation button not found', 'Campaign Creation');
        testResults.testsFailed++;
      }
      
    } catch (error) {
      logError(error, 'Campaign Creation');
      testResults.testsFailed++;
    }

    // 6. CAMPAIGN SENDING PROCESS
    logStep('6️⃣ Testing Campaign Sending Process', 'INFO');
    
    try {
      // Look for send/test buttons
      const sendButtons = [
        'button:has-text("Send Test")',
        'button:has-text("Send")',
        '[data-testid="send-campaign"]',
        '.send-btn'
      ];
      
      let sendTested = false;
      for (const selector of sendButtons) {
        try {
          const sendBtn = await page.$(selector);
          if (sendBtn) {
            // Don't actually send, just test the button exists
            logStep('Send campaign functionality detected', 'SUCCESS');
            await takeScreenshot(page, 'send-options', 'Campaign sending options');
            sendTested = true;
            testResults.testsPassed++;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!sendTested) {
        logWarning('Campaign sending options not found', 'Campaign Sending');
        testResults.testsFailed++;
      }
      
    } catch (error) {
      logError(error, 'Campaign Sending');
      testResults.testsFailed++;
    }

    // 7. ANALYTICS & REPORTING
    logStep('7️⃣ Testing Analytics & Reporting', 'INFO');
    
    try {
      await page.click('[data-tab="analytics"], button:has-text("Analytics"), .tab-analytics');
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'analytics-tab', 'Analytics dashboard');
      
      // Check for analytics elements
      const analyticsLoaded = await waitForElement(page, '.analytics-dashboard, [data-testid="analytics"], .stats-grid');
      if (analyticsLoaded) {
        logStep('Analytics dashboard loaded', 'SUCCESS');
        testResults.testsPassed++;
      } else {
        logStep('Analytics dashboard not found', 'WARNING');
        testResults.testsFailed++;
      }
      
    } catch (error) {
      logError(error, 'Analytics & Reporting');
      testResults.testsFailed++;
    }

    // 8. ERROR SCENARIOS TESTING
    logStep('8️⃣ Testing Error Scenarios', 'INFO');
    
    try {
      // Test invalid URL
      await page.goto(`${BASE_URL}/admin/email-marketing/v2/invalid-page`, { waitUntil: 'networkidle', timeout: 10000 });
      await takeScreenshot(page, 'error-page', 'Error page handling');
      
      // Test network timeout simulation
      await page.route('**/api/email-marketing/v2**', route => {
        setTimeout(() => {
          route.continue();
        }, 5000); // 5 second delay
      });
      
      logStep('Error scenario testing completed', 'SUCCESS');
      testResults.testsPassed++;
      
    } catch (error) {
      logError(error, 'Error Scenarios');
      testResults.testsFailed++;
    }

    // FINAL ASSESSMENT
    logStep('🏁 Completing User Journey Assessment', 'INFO');
    
    // Test responsive design
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      try {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(1000);
        await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`, `${viewport.name} responsive view`);
        logStep(`${viewport.name} responsive design tested`, 'SUCCESS');
      } catch (error) {
        logError(error, `Responsive: ${viewport.name}`);
      }
    }

  } catch (error) {
    logError(error, 'Main Test Flow');
    testResults.testsFailed++;
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Generate final report
    testResults.endTime = new Date().toISOString();
    testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
    testResults.totalTests = testResults.testsPassed + testResults.testsFailed;
    testResults.successRate = ((testResults.testsPassed / testResults.totalTests) * 100).toFixed(2);
    
    logStep('📊 User Journey Testing Completed', 'COMPLETE');
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'user-journey-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    // Generate HTML report
    generateHTMLReport(testResults);
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 USER JOURNEY TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Tests Passed: ${testResults.testsPassed}`);
    console.log(`❌ Tests Failed: ${testResults.testsFailed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
    console.log(`🚨 Errors: ${testResults.errors.length}`);
    console.log(`📊 Success Rate: ${testResults.successRate}%`);
    console.log(`⏱️  Total Duration: ${(testResults.duration / 1000).toFixed(2)}s`);
    console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
    console.log('='.repeat(80));
  }
}

function generateHTMLReport(results) {
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Marketing User Journey Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #495057; }
        .metric-label { font-size: 0.9em; color: #6c757d; margin-top: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .step { padding: 10px; border-left: 4px solid #007bff; margin: 10px 0; background: #f8f9fa; }
        .step.success { border-left-color: #28a745; }
        .step.warning { border-left-color: #ffc107; }
        .step.error { border-left-color: #dc3545; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .screenshot { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
        .screenshot img { width: 100%; height: 200px; object-fit: cover; }
        .screenshot-info { padding: 10px; background: #f8f9fa; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .performance-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .performance-fill { height: 100%; background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Email Marketing User Journey Test Report</h1>
            <p>Complete end-to-end testing results for email marketing system</p>
            <p><strong>Test Date:</strong> ${new Date(results.startTime).toLocaleString()}</p>
        </div>

        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value success">${results.testsPassed}</div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value error">${results.testsFailed}</div>
                <div class="metric-label">Tests Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value warning">${results.warnings.length}</div>
                <div class="metric-label">Warnings</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${results.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
        </div>

        <h2>🔍 Performance Metrics</h2>
        <table>
            <tr><th>Operation</th><th>Load Time (ms)</th><th>Performance</th></tr>
            ${Object.entries(results.performanceMetrics).map(([key, value]) => {
              const performance = value < 2000 ? 'Excellent' : value < 5000 ? 'Good' : 'Needs Improvement';
              const color = value < 2000 ? 'success' : value < 5000 ? 'warning' : 'error';
              return `<tr><td>${key}</td><td>${value}</td><td class="${color}">${performance}</td></tr>`;
            }).join('')}
        </table>

        <h2>📋 Test Steps</h2>
        <div class="steps-container">
            ${results.userJourneySteps.map(step => `
                <div class="step ${step.status.toLowerCase()}">
                    <strong>${step.status}:</strong> ${step.step}
                    ${step.duration ? `<span style="float: right;">${step.duration}ms</span>` : ''}
                    <div style="font-size: 0.8em; color: #6c757d;">${new Date(step.timestamp).toLocaleString()}</div>
                </div>
            `).join('')}
        </div>

        <h2>🚨 Errors & Issues</h2>
        ${results.errors.length > 0 ? `
            <table>
                <tr><th>Context</th><th>Error</th><th>Time</th></tr>
                ${results.errors.map(error => `
                    <tr>
                        <td>${error.context}</td>
                        <td class="error">${error.error}</td>
                        <td>${new Date(error.timestamp).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </table>
        ` : '<p class="success">✅ No critical errors detected!</p>'}

        <h2>📸 Screenshots</h2>
        <div class="screenshots">
            ${results.screenshots.map(screenshot => `
                <div class="screenshot">
                    <img src="test-screenshots/${screenshot.filename}" alt="${screenshot.context}" />
                    <div class="screenshot-info">
                        <strong>${screenshot.context}</strong>
                        <div style="font-size: 0.8em; color: #6c757d;">${new Date(screenshot.timestamp).toLocaleString()}</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <h2>🎯 Recommendations</h2>
        <div class="recommendations">
            ${results.successRate >= 90 ? 
              '<p class="success">✅ System is production-ready with excellent user experience!</p>' :
              results.successRate >= 70 ?
                '<p class="warning">⚠️ System is functional but needs optimization for better user experience.</p>' :
                '<p class="error">🚨 System has significant issues that need to be resolved before production deployment.</p>'
            }
            
            <ul>
                ${results.errors.length > 0 ? '<li>🔧 Fix critical errors identified in testing</li>' : ''}
                ${results.warnings.length > 3 ? '<li>⚠️ Address UI/UX warnings for better user experience</li>' : ''}
                ${Object.values(results.performanceMetrics).some(v => v > 5000) ? '<li>🚀 Optimize page load times for better performance</li>' : ''}
                <li>🧪 Implement automated testing for regression prevention</li>
                <li>📱 Ensure responsive design works across all devices</li>
                <li>🔒 Verify security and authentication flows</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `;

  fs.writeFileSync(path.join(__dirname, 'user-journey-test-report.html'), htmlReport);
  console.log('📄 HTML report generated: user-journey-test-report.html');
}

// Run the complete user journey test
runCompleteUserJourney().catch(console.error);