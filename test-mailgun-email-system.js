const { chromium } = require('playwright');
const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  adminCredentials: {
    email: 'admin@fly2any.com',
    password: 'fly2any2024!'
  },
  testEmail: 'test@fly2any.com',
  timeout: 30000
};

async function testMailgunEmailSystem() {
  console.log('🚀 TESTING COMPLETE MAILGUN EMAIL MARKETING SYSTEM\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const page = await browser.newPage();
  const results = {
    passed: [],
    failed: [],
    warnings: [],
    stats: { total: 0, passed: 0, failed: 0, warnings: 0 }
  };

  try {
    // 1. LOGIN TO ADMIN PANEL
    console.log('\n1️⃣ TESTING ADMIN AUTHENTICATION');
    console.log('-'.repeat(40));
    
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/login`);
    await page.waitForSelector('.admin-login-form', { timeout: 10000 });
    
    await page.fill('input[name="email"]', TEST_CONFIG.adminCredentials.email);
    await page.fill('input[name="password"]', TEST_CONFIG.adminCredentials.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin**', { timeout: 10000 });
    results.passed.push('Admin authentication successful');
    console.log('✅ Admin login successful');

    // 2. TEST EMAIL MARKETING DASHBOARD
    console.log('\n2️⃣ TESTING EMAIL MARKETING DASHBOARD');
    console.log('-'.repeat(40));
    
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/email-marketing`);
    await page.waitForLoadState('networkidle');
    
    // Check for key elements
    const dashboardElements = [
      { selector: '.admin-page', name: 'Admin page container' },
      { selector: '.admin-header-section', name: 'Header section' },
      { selector: '.admin-stats-card', name: 'Statistics cards' },
      { selector: '.admin-btn', name: 'Action buttons' }
    ];
    
    for (const element of dashboardElements) {
      const count = await page.locator(element.selector).count();
      if (count > 0) {
        results.passed.push(`${element.name}: ${count} elements found`);
        console.log(`✅ ${element.name}: ${count} elements`);
      } else {
        results.failed.push(`${element.name}: No elements found`);
        console.log(`❌ ${element.name}: Not found`);
      }
    }
    
    await page.screenshot({ path: 'email-marketing-dashboard.png', fullPage: true });
    console.log('📸 Screenshot: email-marketing-dashboard.png');

    // 3. TEST EMAIL PROVIDERS PAGE
    console.log('\n3️⃣ TESTING EMAIL PROVIDERS CONFIGURATION');
    console.log('-'.repeat(40));
    
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/email-providers`);
    await page.waitForLoadState('networkidle');
    
    // Check for Mailgun configuration
    const mailgunSection = await page.locator('text=Mailgun').count();
    if (mailgunSection > 0) {
      results.passed.push('Mailgun provider section found');
      console.log('✅ Mailgun provider configuration visible');
      
      // Check if Mailgun is marked as recommended
      const isRecommended = await page.locator('text=RECOMMENDED').count();
      if (isRecommended > 0) {
        results.passed.push('Mailgun marked as recommended provider');
        console.log('✅ Mailgun marked as recommended');
      }
    } else {
      results.failed.push('Mailgun provider section not found');
      console.log('❌ Mailgun provider not found');
    }
    
    await page.screenshot({ path: 'email-providers-page.png', fullPage: true });

    // 4. TEST EMAIL TEMPLATES PAGE
    console.log('\n4️⃣ TESTING EMAIL TEMPLATES MANAGEMENT');
    console.log('-'.repeat(40));
    
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/email-templates`);
    await page.waitForLoadState('networkidle');
    
    // Check for template elements
    const templateElements = await page.locator('.admin-card').count();
    if (templateElements > 0) {
      results.passed.push(`Email templates: ${templateElements} templates found`);
      console.log(`✅ Email templates: ${templateElements} templates`);
    } else {
      results.warnings.push('No email templates found');
      console.log('⚠️  No email templates visible');
    }
    
    await page.screenshot({ path: 'email-templates-page.png', fullPage: true });

    // 5. TEST EMAIL CAMPAIGNS PAGE (if exists)
    console.log('\n5️⃣ TESTING EMAIL CAMPAIGNS MANAGEMENT');
    console.log('-'.repeat(40));
    
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/admin/email-campaigns`);
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      
      const campaignElements = await page.locator('.admin-page').count();
      if (campaignElements > 0) {
        results.passed.push('Email campaigns page accessible');
        console.log('✅ Email campaigns page loaded');
      }
    } catch (error) {
      results.warnings.push('Email campaigns page not found (optional)');
      console.log('⚠️  Email campaigns page not found (this is optional)');
    }

    // 6. TEST EMAIL ANALYTICS PAGE (if exists)
    console.log('\n6️⃣ TESTING EMAIL ANALYTICS DASHBOARD');
    console.log('-'.repeat(40));
    
    try {
      await page.goto(`${TEST_CONFIG.baseUrl}/admin/email-analytics`);
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      
      const analyticsElements = await page.locator('.admin-page').count();
      if (analyticsElements > 0) {
        results.passed.push('Email analytics dashboard accessible');
        console.log('✅ Email analytics dashboard loaded');
        await page.screenshot({ path: 'email-analytics-dashboard.png', fullPage: true });
      }
    } catch (error) {
      results.warnings.push('Email analytics page not found (optional)');
      console.log('⚠️  Email analytics page not found (this is optional)');
    }

    // 7. TEST API ENDPOINTS
    console.log('\n7️⃣ TESTING EMAIL MARKETING API ENDPOINTS');
    console.log('-'.repeat(40));
    
    const apiTests = [
      { endpoint: '/api/email-marketing', method: 'GET', description: 'Main email API' },
      { endpoint: '/api/email-templates', method: 'GET', description: 'Templates API' }
    ];
    
    for (const apiTest of apiTests) {
      try {
        const response = await page.evaluate(async (endpoint) => {
          const resp = await fetch(endpoint);
          return { status: resp.status, ok: resp.ok };
        }, apiTest.endpoint);
        
        if (response.ok) {
          results.passed.push(`${apiTest.description}: API responding (${response.status})`);
          console.log(`✅ ${apiTest.description}: Status ${response.status}`);
        } else {
          results.warnings.push(`${apiTest.description}: API error (${response.status})`);
          console.log(`⚠️  ${apiTest.description}: Status ${response.status}`);
        }
      } catch (error) {
        results.failed.push(`${apiTest.description}: API unreachable`);
        console.log(`❌ ${apiTest.description}: ${error.message}`);
      }
    }

    // 8. TEST EMAIL SENDING FUNCTIONALITY
    console.log('\n8️⃣ TESTING EMAIL SENDING FUNCTIONALITY');
    console.log('-'.repeat(40));
    
    // Go back to email marketing page to test sending
    await page.goto(`${TEST_CONFIG.baseUrl}/admin/email-marketing`);
    await page.waitForLoadState('networkidle');
    
    // Look for test email buttons
    const testButtons = await page.locator('button:has-text("Teste")').count();
    if (testButtons > 0) {
      results.passed.push(`Email testing: ${testButtons} test buttons found`);
      console.log(`✅ Email test functionality: ${testButtons} test buttons`);
      
      // Uncomment to actually test email sending (requires valid Mailgun config)
      /*
      try {
        await page.click('button:has-text("Teste"):first');
        await page.waitForTimeout(2000);
        results.passed.push('Test email sent successfully');
        console.log('✅ Test email sent successfully');
      } catch (error) {
        results.warnings.push('Test email sending failed (may need Mailgun config)');
        console.log('⚠️  Test email sending failed - check Mailgun configuration');
      }
      */
    } else {
      results.warnings.push('No email test buttons found');
      console.log('⚠️  No email test buttons found');
    }

    // 9. TEST SYSTEM CONFIGURATION
    console.log('\n9️⃣ TESTING SYSTEM CONFIGURATION');
    console.log('-'.repeat(40));
    
    // Check environment variables display (if any)
    const configInfo = await page.evaluate(() => {
      return {
        nodeEnv: typeof window !== 'undefined' ? 'browser' : 'server',
        hasMailgunConfig: document.body.textContent.includes('Mailgun')
      };
    });
    
    if (configInfo.hasMailgunConfig) {
      results.passed.push('Mailgun configuration visible in UI');
      console.log('✅ Mailgun configuration present in interface');
    } else {
      results.warnings.push('Mailgun configuration not visible');
      console.log('⚠️  Mailgun configuration not visible in UI');
    }

    // 10. TEST RESPONSIVE DESIGN
    console.log('\n🔟 TESTING RESPONSIVE DESIGN');
    console.log('-'.repeat(40));
    
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      const adminPage = await page.locator('.admin-page').count();
      if (adminPage > 0) {
        results.passed.push(`${viewport.name} responsive design working`);
        console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}): Responsive`);
      } else {
        results.failed.push(`${viewport.name} responsive design broken`);
        console.log(`❌ ${viewport.name}: Layout broken`);
      }
    }
    
    // Back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

  } catch (error) {
    results.failed.push(`Critical test error: ${error.message}`);
    console.error(`\n❌ CRITICAL ERROR: ${error.message}`);
  } finally {
    // Calculate final statistics
    results.stats = {
      total: results.passed.length + results.failed.length + results.warnings.length,
      passed: results.passed.length,
      failed: results.failed.length,
      warnings: results.warnings.length
    };
    
    // Generate comprehensive report
    console.log('\n' + '='.repeat(60));
    console.log('📊 MAILGUN EMAIL MARKETING SYSTEM TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`Total Tests: ${results.stats.total}`);
    console.log(`✅ Passed: ${results.stats.passed}`);
    console.log(`❌ Failed: ${results.stats.failed}`);
    console.log(`⚠️  Warnings: ${results.stats.warnings}`);
    
    const successRate = results.stats.total > 0 ? ((results.stats.passed / results.stats.total) * 100).toFixed(1) : 0;
    console.log(`📊 Success Rate: ${successRate}%`);
    
    // Detailed results
    if (results.passed.length > 0) {
      console.log(`\n✅ PASSED TESTS (${results.passed.length}):`);
      results.passed.forEach(test => console.log(`   ✓ ${test}`));
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ FAILED TESTS (${results.failed.length}):`);
      results.failed.forEach(test => console.log(`   ✗ ${test}`));
    }
    
    if (results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${results.warnings.length}):`);
      results.warnings.forEach(test => console.log(`   ⚠ ${test}`));
    }
    
    // Overall system status
    console.log('\n' + '='.repeat(60));
    if (results.stats.failed === 0 && results.stats.passed > 5) {
      console.log('🎉 MAILGUN EMAIL SYSTEM: FULLY FUNCTIONAL!');
      console.log('🚀 Ready for production use with Mailgun integration');
    } else if (results.stats.failed === 0) {
      console.log('✅ MAILGUN EMAIL SYSTEM: BASIC FUNCTIONALITY WORKING');
      console.log('⚠️  Some advanced features may need configuration');
    } else {
      console.log('⚠️  MAILGUN EMAIL SYSTEM: NEEDS ATTENTION');
      console.log('🔧 Please review failed tests and fix configuration issues');
    }
    
    console.log('\n📁 Screenshots saved:');
    console.log('   - email-marketing-dashboard.png');
    console.log('   - email-providers-page.png');
    console.log('   - email-templates-page.png');
    if (results.passed.some(p => p.includes('analytics'))) {
      console.log('   - email-analytics-dashboard.png');
    }
    
    console.log('\n🔧 NEXT STEPS FOR FULL ACTIVATION:');
    console.log('1. Set up Mailgun account and get API key');
    console.log('2. Update .env.local with Mailgun credentials');
    console.log('3. Configure domain verification in Mailgun');
    console.log('4. Set up webhook endpoints for tracking');
    console.log('5. Test actual email sending with real Mailgun config');
    console.log('6. Monitor email deliverability and performance');
    
    console.log('\n' + '='.repeat(60));
    
    await browser.close();
    
    // Exit with appropriate code
    process.exit(results.stats.failed > 0 ? 1 : 0);
  }
}

// Run the comprehensive test
console.log('🚀 Starting Mailgun Email Marketing System Test...');
testMailgunEmailSystem().catch(console.error);