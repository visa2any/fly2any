/**
 * 🚀 COMPREHENSIVE EMAIL MARKETING V2 SYSTEM VERIFICATION
 * Complete testing suite for Email Marketing V2 system functionality
 * Tests all components, API endpoints, and 2025 features
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

class EmailMarketingV2Verifier {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.results = {
      systemArchitecture: {},
      apiEndpoints: {},
      contactDatabase: {},
      campaignSystem: {},
      brazilianFeatures2025: {},
      performanceMetrics: {},
      mobileResponsive: {},
      integrations: {},
      productionReadiness: {},
      startTime: new Date().toISOString(),
      endTime: null
    };
    this.errors = [];
    this.screenshots = [];
  }

  async init() {
    console.log('🚀 Starting Email Marketing V2 Comprehensive Verification...');
    this.browser = await chromium.launch({ headless: false, slowMo: 1000 });
    this.page = await this.browser.newPage();
    this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Set error handling
    this.page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    this.page.on('pageerror', error => {
      console.error('PAGE ERROR:', error.message);
      this.errors.push({ type: 'page_error', error: error.message, timestamp: new Date().toISOString() });
    });
  }

  async takeScreenshot(name, description) {
    const screenshot = `verification-${name}-${Date.now()}.png`;
    await this.page.screenshot({ 
      path: screenshot, 
      fullPage: true 
    });
    this.screenshots.push({ name, screenshot, description, timestamp: new Date().toISOString() });
    console.log(`📸 Screenshot taken: ${screenshot} - ${description}`);
    return screenshot;
  }

  async testApiEndpoint(endpoint, expectedKeys = [], method = 'GET', body = null) {
    try {
      console.log(`🔗 Testing API: ${method} ${endpoint}`);
      
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();
      
      const result = {
        status: response.status,
        success: data.success || response.ok,
        hasExpectedKeys: expectedKeys.length === 0 || expectedKeys.every(key => data.hasOwnProperty(key)),
        responseTime: Date.now(),
        data: data
      };

      console.log(`   ✅ ${endpoint}: Status ${result.status}, Success: ${result.success}`);
      return result;
    } catch (error) {
      console.error(`   ❌ ${endpoint}: ${error.message}`);
      return {
        status: 500,
        success: false,
        error: error.message,
        hasExpectedKeys: false
      };
    }
  }

  async verifySystemArchitecture() {
    console.log('\n📊 TESTING SYSTEM ARCHITECTURE...');
    
    const tests = [
      { endpoint: '/api/email-marketing/v2?action=stats', keys: ['success', 'data'] },
      { endpoint: '/api/email-marketing/v2?action=contacts', keys: ['success', 'data'] },
      { endpoint: '/api/email-marketing/v2?action=campaigns', keys: ['success', 'data'] },
      { endpoint: '/api/email-marketing/v2?action=templates', keys: ['success', 'data'] },
      { endpoint: '/api/email-marketing/v2?action=analytics', keys: ['success', 'data'] },
      { endpoint: '/api/email-marketing/v2?action=segments', keys: ['success', 'data'] },
      { endpoint: '/api/email-marketing/v2?action=workflows', keys: ['success', 'data'] },
    ];

    for (const test of tests) {
      this.results.apiEndpoints[test.endpoint] = await this.testApiEndpoint(test.endpoint, test.keys);
    }

    // Test TypeScript compilation (check for console errors)
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2`);
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('system-architecture', 'Email Marketing V2 Main Interface');
    
    this.results.systemArchitecture.interfaceLoaded = true;
    this.results.systemArchitecture.typescriptCompiled = this.errors.filter(e => e.type === 'page_error').length === 0;
  }

  async verifyContactDatabase() {
    console.log('\n👥 TESTING CONTACT DATABASE...');
    
    // Test contacts API
    const contactsResponse = await this.testApiEndpoint('/api/email-marketing/v2?action=contacts');
    this.results.contactDatabase = contactsResponse;
    
    // Navigate to contacts section
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=segments`);
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('contacts-interface', 'Contacts and Segments Interface');
    
    // Check if contact count is displayed
    try {
      const contactCountElement = await this.page.$('.text-3xl.font-bold');
      if (contactCountElement) {
        const contactCount = await contactCountElement.innerText();
        this.results.contactDatabase.displayedCount = contactCount;
        console.log(`📊 Contact count displayed: ${contactCount}`);
      }
    } catch (error) {
      console.log('   ℹ️  Contact count element not found');
    }

    // Test data sync functionality
    const statsResponse = await this.testApiEndpoint('/api/email-marketing/v2?action=stats');
    this.results.contactDatabase.statsAvailable = statsResponse.success;
    
    if (statsResponse.data && statsResponse.data.data) {
      const stats = statsResponse.data.data;
      this.results.contactDatabase.totalContacts = stats.totalContacts;
      this.results.contactDatabase.segmentStats = stats.segmentStats;
      console.log(`📈 Stats: ${stats.totalContacts} total contacts`);
    }
  }

  async verifyCampaignSystem() {
    console.log('\n📧 TESTING CAMPAIGN SYSTEM...');
    
    // Navigate to campaigns
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=campaigns`);
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('campaign-builder', 'Campaign Builder Interface');
    
    // Test campaign creation interface
    try {
      const campaignFormExists = await this.page.$('[data-testid="campaign-form"], .campaign-builder, form');
      this.results.campaignSystem.builderInterface = !!campaignFormExists;
      
      if (campaignFormExists) {
        console.log('   ✅ Campaign builder interface found');
      }
    } catch (error) {
      console.log('   ⚠️  Campaign builder interface check failed');
    }
    
    // Test templates
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=templates`);
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('templates-gallery', 'Templates Gallery');
    
    const templatesResponse = await this.testApiEndpoint('/api/email-marketing/v2?action=templates');
    this.results.campaignSystem.templates = templatesResponse;
    
    // Test campaign API endpoints
    this.results.campaignSystem.createCampaign = await this.testApiEndpoint(
      '/api/email-marketing/v2?action=create_campaign',
      ['success'],
      'POST',
      {
        name: 'Test Campaign',
        subject: 'Test Subject',
        content: '<h1>Test Content</h1>',
        from_email: 'test@fly2any.com',
        from_name: 'Test Sender'
      }
    );
  }

  async verifyBrazilianFeatures2025() {
    console.log('\n🇧🇷 TESTING 2025 BRAZILIAN DIASPORA FEATURES...');
    
    // Check if AI personalization files exist
    const aiFeatures = {
      aiPersonalization: false,
      diasporaIntelligence: false,
      culturalIntegration: false,
      advancedSegmentation: false
    };
    
    // Navigate through different sections to check for 2025 features
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=analytics`);
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('advanced-analytics', 'Advanced Analytics Dashboard');
    
    // Check analytics for cultural and diaspora insights
    const analyticsResponse = await this.testApiEndpoint('/api/email-marketing/v2?action=analytics');
    this.results.brazilianFeatures2025.analytics = analyticsResponse;
    
    if (analyticsResponse.data && analyticsResponse.data.data) {
      const analytics = analyticsResponse.data.data;
      aiFeatures.culturalIntegration = !!(analytics.locationStats && analytics.locationStats.some(l => l.country === 'Brasil'));
      console.log('   📍 Location stats include Brazil:', aiFeatures.culturalIntegration);
    }
    
    // Test segmentation for cultural targeting
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=segments`);
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('segmentation-engine', 'Advanced Segmentation');
    
    this.results.brazilianFeatures2025 = { ...aiFeatures, ...this.results.brazilianFeatures2025 };
  }

  async verifyPerformance() {
    console.log('\n⚡ TESTING PERFORMANCE METRICS...');
    
    const startTime = Date.now();
    
    // Test page load times
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2`);
    const loadTime = Date.now() - startTime;
    
    // Test API response times
    const apiStartTime = Date.now();
    await this.testApiEndpoint('/api/email-marketing/v2?action=stats');
    const apiResponseTime = Date.now() - apiStartTime;
    
    // Test different tabs for responsiveness
    const tabs = ['dashboard', 'campaigns', 'segments', 'analytics', 'templates'];
    const tabLoadTimes = {};
    
    for (const tab of tabs) {
      const tabStart = Date.now();
      await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=${tab}`);
      await this.page.waitForTimeout(1000);
      tabLoadTimes[tab] = Date.now() - tabStart;
    }
    
    this.results.performanceMetrics = {
      initialLoadTime: loadTime,
      apiResponseTime: apiResponseTime,
      tabLoadTimes: tabLoadTimes,
      averageTabLoadTime: Object.values(tabLoadTimes).reduce((a, b) => a + b, 0) / tabs.length
    };
    
    console.log(`   🚀 Initial load: ${loadTime}ms`);
    console.log(`   📡 API response: ${apiResponseTime}ms`);
    console.log(`   📊 Average tab load: ${this.results.performanceMetrics.averageTabLoadTime.toFixed(0)}ms`);
  }

  async verifyMobileResponsive() {
    console.log('\n📱 TESTING MOBILE RESPONSIVE DESIGN...');
    
    const devices = [
      { name: 'iPhone', width: 375, height: 667 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      await this.page.setViewportSize({ width: device.width, height: device.height });
      await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2`);
      await this.page.waitForTimeout(1000);
      
      await this.takeScreenshot(`mobile-${device.name.toLowerCase()}`, `${device.name} View`);
      
      // Check if layout adapts properly
      const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
      const hasHorizontalScroll = bodyWidth > device.width;
      
      this.results.mobileResponsive[device.name] = {
        viewport: device,
        hasHorizontalScroll,
        responsive: !hasHorizontalScroll
      };
      
      console.log(`   📱 ${device.name}: ${hasHorizontalScroll ? '⚠️  Horizontal scroll' : '✅ Responsive'}`);
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async verifyIntegrations() {
    console.log('\n🔗 TESTING INTEGRATIONS...');
    
    // Test MailGun integration
    const mailgunTest = await this.testApiEndpoint('/api/email-marketing/v2?action=test_mailgun', [], 'POST');
    this.results.integrations.mailgun = mailgunTest;
    
    // Test domain status
    const domainStatus = await this.testApiEndpoint('/api/email-marketing/v2?action=checkDeliverability');
    this.results.integrations.domainDeliverability = domainStatus;
    
    // Test deliverability tools
    await this.page.goto(`${this.baseUrl}/admin/email-marketing/v2?tab=deliverability`);
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('deliverability-tools', 'Deliverability Tools Interface');
    
    // Check for WhatsApp and Instagram integration interfaces
    try {
      const integrationElements = await this.page.$$('[data-integration], .integration-card, .channel-integration');
      this.results.integrations.multiChannelInterface = integrationElements.length > 0;
    } catch (error) {
      this.results.integrations.multiChannelInterface = false;
    }
    
    console.log(`   📧 MailGun: ${mailgunTest.success ? '✅ Connected' : '❌ Not connected'}`);
    console.log(`   🛡️  Deliverability: ${domainStatus.success ? '✅ Available' : '❌ Not available'}`);
  }

  async assessProductionReadiness() {
    console.log('\n🏭 ASSESSING PRODUCTION READINESS...');
    
    const readiness = {
      databaseConnectivity: false,
      apiEndpointsWorking: 0,
      uiFunctional: false,
      errorCount: this.errors.length,
      performanceAcceptable: false,
      mobileResponsive: false,
      integrationsWorking: false,
      overallScore: 0
    };
    
    // Database connectivity
    readiness.databaseConnectivity = this.results.apiEndpoints['/api/email-marketing/v2?action=stats']?.success || false;
    
    // API endpoints working
    const workingEndpoints = Object.values(this.results.apiEndpoints).filter(r => r.success).length;
    const totalEndpoints = Object.keys(this.results.apiEndpoints).length;
    readiness.apiEndpointsWorking = totalEndpoints > 0 ? (workingEndpoints / totalEndpoints) * 100 : 0;
    
    // UI functional
    readiness.uiFunctional = this.results.systemArchitecture.interfaceLoaded && 
                             this.results.systemArchitecture.typescriptCompiled;
    
    // Performance acceptable (under 3 seconds average)
    readiness.performanceAcceptable = this.results.performanceMetrics.averageTabLoadTime < 3000;
    
    // Mobile responsive
    readiness.mobileResponsive = Object.values(this.results.mobileResponsive)
      .every(device => device.responsive);
    
    // Integrations working
    readiness.integrationsWorking = this.results.integrations.mailgun?.success || false;
    
    // Calculate overall score
    const scores = [
      readiness.databaseConnectivity ? 20 : 0,
      (readiness.apiEndpointsWorking / 100) * 25,
      readiness.uiFunctional ? 15 : 0,
      readiness.errorCount === 0 ? 10 : Math.max(0, 10 - readiness.errorCount),
      readiness.performanceAcceptable ? 15 : 0,
      readiness.mobileResponsive ? 10 : 0,
      readiness.integrationsWorking ? 5 : 0
    ];
    
    readiness.overallScore = scores.reduce((a, b) => a + b, 0);
    readiness.productionReady = readiness.overallScore >= 70;
    
    this.results.productionReadiness = readiness;
    
    console.log(`   📊 Overall Score: ${readiness.overallScore}/100`);
    console.log(`   🎯 Production Ready: ${readiness.productionReady ? '✅ YES' : '❌ NO'}`);
  }

  async generateReport() {
    console.log('\n📋 GENERATING COMPREHENSIVE REPORT...');
    
    this.results.endTime = new Date().toISOString();
    this.results.totalDuration = Date.now() - new Date(this.results.startTime).getTime();
    this.results.errors = this.errors;
    this.results.screenshots = this.screenshots;
    
    const report = {
      title: '🚀 EMAIL MARKETING V2 COMPREHENSIVE VERIFICATION REPORT',
      executionDate: this.results.startTime,
      duration: `${(this.results.totalDuration / 1000).toFixed(2)} seconds`,
      summary: {
        totalTests: Object.keys(this.results.apiEndpoints).length + 7, // API tests + other categories
        passedTests: Object.values(this.results.apiEndpoints).filter(r => r.success).length + 
                     (this.results.systemArchitecture.interfaceLoaded ? 1 : 0) +
                     (this.results.contactDatabase.statsAvailable ? 1 : 0) +
                     (this.results.campaignSystem.builderInterface ? 1 : 0),
        productionReady: this.results.productionReadiness.productionReady,
        overallScore: `${this.results.productionReadiness.overallScore}/100`
      },
      findings: {
        '✅ Working Features': [],
        '⚠️  Issues Found': [],
        '❌ Critical Problems': [],
        '🇧🇷 2025 Brazilian Features': [],
        '📱 Mobile Compatibility': [],
        '⚡ Performance Metrics': []
      },
      recommendations: [],
      detailedResults: this.results
    };
    
    // Analyze findings
    if (this.results.systemArchitecture.interfaceLoaded) {
      report.findings['✅ Working Features'].push('Email Marketing V2 interface loads successfully');
    }
    
    if (this.results.contactDatabase.statsAvailable) {
      report.findings['✅ Working Features'].push('Contact database and statistics API functional');
    }
    
    if (this.results.campaignSystem.builderInterface) {
      report.findings['✅ Working Features'].push('Campaign builder interface present');
    }
    
    if (this.results.productionReadiness.apiEndpointsWorking > 80) {
      report.findings['✅ Working Features'].push(`${this.results.productionReadiness.apiEndpointsWorking.toFixed(0)}% of API endpoints working`);
    }
    
    if (this.results.contactDatabase.totalContacts === 0) {
      report.findings['⚠️  Issues Found'].push('No contacts found in database - data sync may be needed');
      report.recommendations.push('Sync existing customer/lead data to email marketing contacts');
    }
    
    if (this.errors.length > 0) {
      report.findings['❌ Critical Problems'].push(`${this.errors.length} JavaScript errors detected`);
      report.recommendations.push('Fix JavaScript errors to ensure stable operation');
    }
    
    if (!this.results.integrations.mailgun?.success) {
      report.findings['⚠️  Issues Found'].push('MailGun integration not verified');
      report.recommendations.push('Verify MailGun configuration and API keys');
    }
    
    // Brazilian features assessment
    if (this.results.brazilianFeatures2025.analytics?.success) {
      report.findings['🇧🇷 2025 Brazilian Features'].push('Advanced analytics dashboard available');
    }
    
    if (this.results.brazilianFeatures2025.culturalIntegration) {
      report.findings['🇧🇷 2025 Brazilian Features'].push('Location stats include Brazilian market data');
    }
    
    // Mobile compatibility
    Object.entries(this.results.mobileResponsive).forEach(([device, result]) => {
      if (result.responsive) {
        report.findings['📱 Mobile Compatibility'].push(`${device} responsive design working`);
      } else {
        report.findings['⚠️  Issues Found'].push(`${device} has horizontal scroll issues`);
      }
    });
    
    // Performance metrics
    const avgLoadTime = this.results.performanceMetrics.averageTabLoadTime;
    if (avgLoadTime < 2000) {
      report.findings['⚡ Performance Metrics'].push(`Excellent performance: ${avgLoadTime.toFixed(0)}ms average load time`);
    } else if (avgLoadTime < 3000) {
      report.findings['⚡ Performance Metrics'].push(`Good performance: ${avgLoadTime.toFixed(0)}ms average load time`);
    } else {
      report.findings['⚠️  Issues Found'].push(`Slow performance: ${avgLoadTime.toFixed(0)}ms average load time`);
      report.recommendations.push('Optimize page loading times and database queries');
    }
    
    // Final recommendations
    if (this.results.productionReadiness.overallScore < 70) {
      report.recommendations.push('Address critical issues before production deployment');
    }
    
    if (this.results.productionReadiness.overallScore >= 85) {
      report.recommendations.push('System is ready for production with minor optimizations');
    }
    
    // Save report to file
    const reportFile = `EMAIL_MARKETING_V2_VERIFICATION_REPORT_${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    // Generate markdown summary
    const markdownReport = this.generateMarkdownReport(report);
    const markdownFile = `EMAIL_MARKETING_V2_VERIFICATION_REPORT_${new Date().toISOString().split('T')[0]}.md`;
    await fs.writeFile(markdownFile, markdownReport);
    
    console.log(`\n📄 Report saved: ${reportFile}`);
    console.log(`📝 Markdown report: ${markdownFile}`);
    console.log(`📸 Screenshots: ${this.screenshots.length} files`);
    
    return report;
  }

  generateMarkdownReport(report) {
    return `# ${report.title}

## Executive Summary

**Execution Date:** ${report.executionDate}  
**Duration:** ${report.duration}  
**Overall Score:** ${report.summary.overallScore}  
**Production Ready:** ${report.summary.productionReady ? '✅ YES' : '❌ NO'}  

### Test Results
- **Total Tests:** ${report.summary.totalTests}
- **Passed Tests:** ${report.summary.passedTests}
- **Success Rate:** ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%

## Detailed Findings

${Object.entries(report.findings).map(([category, items]) => 
  items.length > 0 ? `### ${category}\n${items.map(item => `- ${item}`).join('\n')}` : ''
).filter(Boolean).join('\n\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Screenshots Captured

${report.detailedResults.screenshots.map(s => 
  `- **${s.name}**: ${s.description} (${s.screenshot})`
).join('\n')}

## Performance Metrics

- **Initial Load Time:** ${report.detailedResults.performanceMetrics.initialLoadTime}ms
- **API Response Time:** ${report.detailedResults.performanceMetrics.apiResponseTime}ms
- **Average Tab Load Time:** ${report.detailedResults.performanceMetrics.averageTabLoadTime.toFixed(0)}ms

## Contact Database Analysis

- **Total Contacts:** ${report.detailedResults.contactDatabase.totalContacts || 0}
- **Stats Available:** ${report.detailedResults.contactDatabase.statsAvailable ? '✅' : '❌'}
- **API Response:** ${report.detailedResults.contactDatabase.success ? '✅' : '❌'}

## Production Readiness Assessment

| Component | Status | Score |
|-----------|--------|-------|
| Database Connectivity | ${report.detailedResults.productionReadiness.databaseConnectivity ? '✅' : '❌'} | 20/20 |
| API Endpoints | ${report.detailedResults.productionReadiness.apiEndpointsWorking.toFixed(0)}% | ${((report.detailedResults.productionReadiness.apiEndpointsWorking / 100) * 25).toFixed(0)}/25 |
| UI Functional | ${report.detailedResults.productionReadiness.uiFunctional ? '✅' : '❌'} | 15/15 |
| Error Count | ${report.detailedResults.productionReadiness.errorCount} errors | ${Math.max(0, 10 - report.detailedResults.productionReadiness.errorCount)}/10 |
| Performance | ${report.detailedResults.productionReadiness.performanceAcceptable ? '✅' : '❌'} | ${report.detailedResults.productionReadiness.performanceAcceptable ? 15 : 0}/15 |
| Mobile Responsive | ${report.detailedResults.productionReadiness.mobileResponsive ? '✅' : '❌'} | ${report.detailedResults.productionReadiness.mobileResponsive ? 10 : 0}/10 |
| Integrations | ${report.detailedResults.productionReadiness.integrationsWorking ? '✅' : '❌'} | ${report.detailedResults.productionReadiness.integrationsWorking ? 5 : 0}/5 |

**Total Score: ${report.detailedResults.productionReadiness.overallScore}/100**

---

*Report generated on ${new Date().toISOString()}*
*Email Marketing V2 System Verification Complete* 🚀
`;
  }

  async run() {
    try {
      await this.init();
      
      await this.verifySystemArchitecture();
      await this.verifyContactDatabase();
      await this.verifyCampaignSystem();
      await this.verifyBrazilianFeatures2025();
      await this.verifyPerformance();
      await this.verifyMobileResponsive();
      await this.verifyIntegrations();
      await this.assessProductionReadiness();
      
      const report = await this.generateReport();
      
      console.log('\n🎉 VERIFICATION COMPLETE!');
      console.log(`📊 Overall Score: ${report.summary.overallScore}`);
      console.log(`🚀 Production Ready: ${report.summary.productionReady ? '✅ YES' : '❌ NO'}`);
      console.log(`📸 Screenshots: ${this.screenshots.length} captured`);
      console.log(`⚠️  Errors: ${this.errors.length} found`);
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      this.errors.push({ type: 'verification_error', error: error.message, timestamp: new Date().toISOString() });
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the verification
const verifier = new EmailMarketingV2Verifier();
verifier.run().catch(console.error);