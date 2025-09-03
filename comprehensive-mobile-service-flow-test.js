/**
 * COMPREHENSIVE MOBILE SERVICE FLOW TEST
 * Testing all 5 mobile service flows in the Next.js application
 * 
 * Services to test:
 * 1. Flights (voos) - MobileFlightFormUnified
 * 2. Hotels (hoteis) - MobileHotelForm  
 * 3. Cars (carros) - MobileCarForm
 * 4. Tours (passeios) - MobileTourForm
 * 5. Insurance (seguro) - MobileInsuranceForm
 */

const { chromium } = require('playwright');

class MobileServiceFlowTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      services: {},
      issues: [],
      recommendations: []
    };
  }

  async initialize() {
    console.log('🚀 Initializing Mobile Service Flow Test...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 100 
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 12 Pro
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      hasTouch: true,
      isMobile: true
    });
    
    this.page = await this.context.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
  }

  async navigateToApp() {
    console.log('📱 Loading mobile app at http://localhost:3000');
    
    try {
      await this.page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for the mobile app layout to load
      await this.page.waitForSelector('[data-testid="mobile-app"], .h-screen, .mobile-app-layout', { timeout: 10000 });
      
      console.log('✅ Mobile app loaded successfully');
      return true;
    } catch (error) {
      console.log('❌ Failed to load mobile app:', error.message);
      this.results.issues.push({
        type: 'critical',
        area: 'app-loading',
        message: `Failed to load mobile app: ${error.message}`
      });
      return false;
    }
  }

  async testServiceButtons() {
    console.log('🧪 Testing service button visibility and clickability...');
    
    const services = [
      { key: 'voos', label: '✈️ Voos', expectedForm: 'flight' },
      { key: 'hoteis', label: '🏨 Hotéis', expectedForm: 'hotel' },
      { key: 'carros', label: '🚗 Carros', expectedForm: 'car' },
      { key: 'passeios', label: '🎯 Passeios', expectedForm: 'tour' },
      { key: 'seguro', label: '🛡️ Seguro', expectedForm: 'insurance' }
    ];

    const serviceResults = {};

    for (const service of services) {
      console.log(`  Testing ${service.label} button...`);
      
      try {
        // Look for service button by various selectors
        const buttonSelectors = [
          `button:has-text("${service.key}")`,
          `button:has-text("Voos")`,
          `button:has-text("Hotéis")`,
          `button:has-text("Carros")`, 
          `button:has-text("Passeios")`,
          `button:has-text("Seguro")`,
          `[data-service="${service.key}"]`,
          `.service-${service.key}`,
          `button[onclick*="${service.key}"]`
        ];

        let button = null;
        for (const selector of buttonSelectors) {
          try {
            button = await this.page.waitForSelector(selector, { timeout: 2000 });
            if (button) break;
          } catch (e) {
            // Continue to next selector
          }
        }

        if (!button) {
          // Try to find by text content
          const buttons = await this.page.$$('button');
          for (const btn of buttons) {
            const text = await btn.textContent();
            if (text && (text.includes(service.label.split(' ')[1]) || text.toLowerCase().includes(service.key))) {
              button = btn;
              break;
            }
          }
        }

        if (button) {
          // Check if button is visible and clickable
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          
          serviceResults[service.key] = {
            buttonFound: true,
            isVisible,
            isEnabled,
            clicked: false,
            formOpened: false
          };

          if (isVisible && isEnabled) {
            console.log(`    ✅ ${service.label} button is visible and clickable`);
          } else {
            console.log(`    ⚠️  ${service.label} button found but not visible/enabled`);
          }

        } else {
          console.log(`    ❌ ${service.label} button not found`);
          serviceResults[service.key] = {
            buttonFound: false,
            isVisible: false,
            isEnabled: false,
            clicked: false,
            formOpened: false
          };
        }

        this.results.totalTests++;
        if (serviceResults[service.key].buttonFound) {
          this.results.passed++;
        } else {
          this.results.failed++;
        }

      } catch (error) {
        console.log(`    ❌ Error testing ${service.label}: ${error.message}`);
        serviceResults[service.key] = {
          buttonFound: false,
          error: error.message
        };
        this.results.failed++;
      }
    }

    this.results.services.buttons = serviceResults;
    return serviceResults;
  }

  async testServiceFormOpening(serviceKey, serviceName) {
    console.log(`🧪 Testing ${serviceName} form opening...`);
    
    try {
      // Click the service button
      const buttonSelectors = [
        `button:has-text("${serviceKey}")`,
        `button:has-text("${serviceName}")`,
        `[data-service="${serviceKey}"]`,
        `.service-${serviceKey}`
      ];

      let buttonClicked = false;
      for (const selector of buttonSelectors) {
        try {
          await this.page.click(selector, { timeout: 2000 });
          buttonClicked = true;
          console.log(`    ✅ Clicked ${serviceName} button`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!buttonClicked) {
        // Try finding by text content
        const buttons = await this.page.$$('button');
        for (const button of buttons) {
          const text = await button.textContent();
          if (text && (text.includes(serviceName) || text.toLowerCase().includes(serviceKey))) {
            await button.click();
            buttonClicked = true;
            console.log(`    ✅ Clicked ${serviceName} button by text`);
            break;
          }
        }
      }

      if (!buttonClicked) {
        throw new Error(`Could not click ${serviceName} button`);
      }

      // Wait for form to appear
      await this.page.waitForTimeout(1000);

      // Check if form opened
      const formSelectors = [
        `[class*="${serviceKey.toLowerCase()}"]`,
        `[class*="Mobile${serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1)}Form"]`,
        '.mobile-lead-form',
        '.lead-form',
        '[class*="form"]'
      ];

      let formFound = false;
      for (const selector of formSelectors) {
        try {
          const form = await this.page.waitForSelector(selector, { timeout: 3000 });
          if (form && await form.isVisible()) {
            formFound = true;
            console.log(`    ✅ ${serviceName} form opened successfully`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!formFound) {
        // Check if MobileLeadCaptureCorrect opened
        try {
          const leadForm = await this.page.waitForSelector('.mobile-lead-capture, [class*="MobileLeadCapture"], .lead-form', { timeout: 2000 });
          if (leadForm && await leadForm.isVisible()) {
            formFound = true;
            console.log(`    ✅ ${serviceName} opened MobileLeadCaptureCorrect form`);
          }
        } catch (e) {
          // Form not found
        }
      }

      this.results.totalTests++;
      if (formFound) {
        this.results.passed++;
        return { opened: true };
      } else {
        this.results.failed++;
        console.log(`    ❌ ${serviceName} form did not open`);
        return { opened: false };
      }

    } catch (error) {
      console.log(`    ❌ Error testing ${serviceName} form: ${error.message}`);
      this.results.failed++;
      return { opened: false, error: error.message };
    }
  }

  async testFormNavigation() {
    console.log('🧪 Testing form navigation...');
    
    try {
      // Look for navigation elements
      const navigationElements = await this.page.$$eval('button, [role="button"], a', elements =>
        elements
          .map(el => ({
            text: el.textContent?.trim(),
            className: el.className,
            role: el.role || el.tagName.toLowerCase()
          }))
          .filter(el => 
            el.text && (
              el.text.includes('Próximo') ||
              el.text.includes('Anterior') || 
              el.text.includes('Voltar') ||
              el.text.includes('Continuar') ||
              el.text.includes('Next') ||
              el.text.includes('Back') ||
              el.text.includes('Previous')
            )
          )
      );

      console.log(`    Found ${navigationElements.length} navigation elements:`, navigationElements);

      // Test back button
      try {
        const backButton = await this.page.waitForSelector('button:has-text("Voltar"), [aria-label*="back"], [class*="back"]', { timeout: 2000 });
        if (backButton && await backButton.isVisible()) {
          console.log('    ✅ Back button found and visible');
          
          // Test clicking back button
          await backButton.click();
          await this.page.waitForTimeout(500);
          console.log('    ✅ Back button clickable');
          
          this.results.totalTests++;
          this.results.passed++;
          return { backNavigation: true };
        }
      } catch (e) {
        console.log('    ⚠️  Back button not found or not clickable');
      }

      this.results.totalTests++;
      this.results.failed++;
      return { backNavigation: false };

    } catch (error) {
      console.log(`    ❌ Error testing form navigation: ${error.message}`);
      this.results.failed++;
      return { backNavigation: false, error: error.message };
    }
  }

  async testFormValidation() {
    console.log('🧪 Testing form validation...');
    
    try {
      // Look for input fields
      const inputs = await this.page.$$('input, select, textarea');
      console.log(`    Found ${inputs.length} form inputs`);

      // Look for validation messages
      const validationSelectors = [
        '[class*="error"]',
        '[class*="invalid"]',
        '[role="alert"]',
        '.validation-message',
        '.error-message'
      ];

      let hasValidation = false;
      for (const selector of validationSelectors) {
        try {
          const validationElements = await this.page.$$(selector);
          if (validationElements.length > 0) {
            hasValidation = true;
            console.log(`    ✅ Validation elements found: ${validationElements.length}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      // Try to submit empty form to trigger validation
      try {
        const submitButtons = await this.page.$$('button[type="submit"], button:has-text("Enviar"), button:has-text("Submeter")');
        if (submitButtons.length > 0) {
          await submitButtons[0].click();
          await this.page.waitForTimeout(1000);
          console.log('    ✅ Form submission attempted');
        }
      } catch (e) {
        console.log('    ⚠️  Could not test form submission');
      }

      this.results.totalTests++;
      if (inputs.length > 0) {
        this.results.passed++;
        return { hasInputs: true, hasValidation, inputCount: inputs.length };
      } else {
        this.results.failed++;
        return { hasInputs: false, hasValidation: false, inputCount: 0 };
      }

    } catch (error) {
      console.log(`    ❌ Error testing form validation: ${error.message}`);
      this.results.failed++;
      return { hasInputs: false, error: error.message };
    }
  }

  async testMobileLeadCaptureIntegration() {
    console.log('🧪 Testing MobileLeadCaptureCorrect integration...');
    
    try {
      // Reset to home
      await this.page.goto('http://localhost:3000');
      await this.page.waitForTimeout(1000);

      // Click the main "Buscar Ofertas Grátis" button
      try {
        const mainCTAButton = await this.page.waitForSelector(
          'button:has-text("Buscar Ofertas"), button:has-text("Cotação"), button:has-text("Grátis")', 
          { timeout: 5000 }
        );
        
        if (mainCTAButton) {
          await mainCTAButton.click();
          console.log('    ✅ Main CTA button clicked');
          
          await this.page.waitForTimeout(1000);
          
          // Check if MobileLeadCaptureCorrect opened
          const leadForm = await this.page.waitForSelector(
            '.mobile-lead-capture, [class*="MobileLeadCapture"], .lead-form, [class*="lead"]', 
            { timeout: 5000 }
          );
          
          if (leadForm && await leadForm.isVisible()) {
            console.log('    ✅ MobileLeadCaptureCorrect integration working');
            
            this.results.totalTests++;
            this.results.passed++;
            return { integrated: true };
          }
        }
      } catch (e) {
        console.log('    ⚠️  Main CTA button not found');
      }

      // Try the generic quote flow
      const tabButtons = await this.page.$$('button');
      for (const button of tabButtons) {
        const text = await button.textContent();
        if (text && (text.includes('Explorar') || text.includes('Buscar'))) {
          await button.click();
          await this.page.waitForTimeout(1000);
          
          const offerButton = await this.page.waitForSelector('button:has-text("Buscar Ofertas")', { timeout: 2000 });
          if (offerButton) {
            await offerButton.click();
            console.log('    ✅ Alternative quote flow triggered');
            break;
          }
        }
      }

      this.results.totalTests++;
      this.results.warnings++;
      return { integrated: false, warning: 'Could not test integration fully' };

    } catch (error) {
      console.log(`    ❌ Error testing integration: ${error.message}`);
      this.results.failed++;
      return { integrated: false, error: error.message };
    }
  }

  async runFullTest() {
    console.log('🧪 STARTING COMPREHENSIVE MOBILE SERVICE FLOW TEST');
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      // Initialize
      await this.initialize();
      
      // Load app
      const appLoaded = await this.navigateToApp();
      if (!appLoaded) {
        throw new Error('Failed to load mobile app - cannot continue tests');
      }

      // Test 1: Service Buttons
      console.log('\n1️⃣ TESTING SERVICE BUTTONS');
      console.log('-'.repeat(40));
      const buttonResults = await this.testServiceButtons();
      this.results.services.buttons = buttonResults;

      // Test 2: Service Form Opening for each service
      console.log('\n2️⃣ TESTING SERVICE FORM OPENING');
      console.log('-'.repeat(40));
      
      const services = [
        { key: 'voos', name: 'Flights' },
        { key: 'hoteis', name: 'Hotels' },
        { key: 'carros', name: 'Cars' },
        { key: 'passeios', name: 'Tours' },
        { key: 'seguro', name: 'Insurance' }
      ];

      for (const service of services) {
        // Reset to home before each test
        await this.page.goto('http://localhost:3000');
        await this.page.waitForTimeout(1000);
        
        const formResult = await this.testServiceFormOpening(service.key, service.name);
        this.results.services[service.key] = {
          ...this.results.services[service.key],
          formOpening: formResult
        };
      }

      // Test 3: Form Navigation
      console.log('\n3️⃣ TESTING FORM NAVIGATION');
      console.log('-'.repeat(40));
      const navResults = await this.testFormNavigation();
      this.results.navigation = navResults;

      // Test 4: Form Validation
      console.log('\n4️⃣ TESTING FORM VALIDATION');
      console.log('-'.repeat(40));
      const validationResults = await this.testFormValidation();
      this.results.validation = validationResults;

      // Test 5: MobileLeadCaptureCorrect Integration
      console.log('\n5️⃣ TESTING MOBILE LEAD CAPTURE INTEGRATION');
      console.log('-'.repeat(40));
      const integrationResults = await this.testMobileLeadCaptureIntegration();
      this.results.integration = integrationResults;

    } catch (error) {
      console.log('❌ Critical test error:', error.message);
      this.results.issues.push({
        type: 'critical',
        area: 'test-execution',
        message: error.message
      });
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Generate final report
    this.generateReport(duration);

    // Cleanup
    if (this.browser) {
      await this.browser.close();
    }
  }

  generateReport(duration) {
    console.log('\n📊 COMPREHENSIVE MOBILE SERVICE FLOW TEST REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Test Duration: ${duration} seconds`);
    console.log(`📊 Tests Run: ${this.results.summary.totalTests}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    
    const successRate = this.results.summary.totalTests > 0 
      ? Math.round((this.results.summary.passed / this.results.summary.totalTests) * 100)
      : 0;
    console.log(`🎯 Success Rate: ${successRate}%`);

    // Service Button Results
    console.log('\n🔘 SERVICE BUTTON RESULTS:');
    if (this.results.services.buttons) {
      Object.entries(this.results.services.buttons).forEach(([service, result]) => {
        const status = result.buttonFound ? '✅' : '❌';
        console.log(`  ${status} ${service.toUpperCase()}: Found=${result.buttonFound}, Visible=${result.isVisible}, Enabled=${result.isEnabled}`);
      });
    }

    // Service Form Results  
    console.log('\n📝 SERVICE FORM OPENING RESULTS:');
    Object.entries(this.results.services).forEach(([service, result]) => {
      if (result.formOpening && service !== 'buttons') {
        const status = result.formOpening.opened ? '✅' : '❌';
        console.log(`  ${status} ${service.toUpperCase()}: Form Opened=${result.formOpening.opened}`);
      }
    });

    // Navigation Results
    console.log('\n🧭 NAVIGATION RESULTS:');
    if (this.results.navigation) {
      const navStatus = this.results.navigation.backNavigation ? '✅' : '❌';
      console.log(`  ${navStatus} Back Navigation: ${this.results.navigation.backNavigation}`);
    }

    // Validation Results
    console.log('\n✅ VALIDATION RESULTS:');
    if (this.results.validation) {
      const inputStatus = this.results.validation.hasInputs ? '✅' : '❌';
      const validationStatus = this.results.validation.hasValidation ? '✅' : '⚠️';
      console.log(`  ${inputStatus} Form Inputs: ${this.results.validation.inputCount} found`);
      console.log(`  ${validationStatus} Validation: ${this.results.validation.hasValidation ? 'Present' : 'Not detected'}`);
    }

    // Integration Results
    console.log('\n🔗 INTEGRATION RESULTS:');
    if (this.results.integration) {
      const integrationStatus = this.results.integration.integrated ? '✅' : '⚠️';
      console.log(`  ${integrationStatus} MobileLeadCaptureCorrect: ${this.results.integration.integrated ? 'Working' : 'Needs verification'}`);
    }

    // Issues and Recommendations
    if (this.results.issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type.toUpperCase()}] ${issue.area}: ${issue.message}`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (successRate < 80) {
      console.log('  - Several service flows need attention. Review failed tests above.');
    }
    
    if (this.results.services.buttons) {
      const buttonIssues = Object.values(this.results.services.buttons).filter(r => !r.buttonFound).length;
      if (buttonIssues > 0) {
        console.log('  - Fix service button detection and clickability issues.');
      }
    }
    
    if (!this.results.integration?.integrated) {
      console.log('  - Verify MobileLeadCaptureCorrect integration is working properly.');
    }
    
    if (!this.results.navigation?.backNavigation) {
      console.log('  - Add proper back navigation functionality to forms.');
    }

    console.log('\n🎉 Test completed! Check above results for details.');

    // Save detailed results to file
    const fs = require('fs');
    fs.writeFileSync('mobile-service-flow-test-results.json', JSON.stringify(this.results, null, 2));
    console.log('📄 Detailed results saved to: mobile-service-flow-test-results.json');
  }
}

// Run the test
async function runTest() {
  const tester = new MobileServiceFlowTester();
  await tester.runFullTest();
}

// Check if we're running this directly
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = MobileServiceFlowTester;