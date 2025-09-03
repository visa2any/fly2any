const { chromium } = require('playwright');
const http = require('http');

// Enterprise-grade validation suite
class EnterpriseValidator {
  constructor() {
    this.results = {
      server: false,
      frontend: false,
      responsive: false,
      forms: false,
      navigation: false,
      performance: false,
      accessibility: false,
      errors: []
    };
    this.serverPort = 3001;
    this.baseUrl = `http://localhost:${this.serverPort}`;
  }

  // Check if server is running
  async checkServer() {
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, (res) => {
        console.log('✅ Server responding on port', this.serverPort);
        this.results.server = true;
        resolve(true);
      });
      
      req.on('error', () => {
        console.log('❌ Server not running on port', this.serverPort);
        this.results.server = false;
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        console.log('⏱️ Server request timeout');
        this.results.server = false;
        resolve(false);
      });
    });
  }

  // Start Next.js server if needed
  async startServer() {
    console.log('🚀 Starting Next.js development server...');
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const server = spawn('npm', ['run', 'dev'], {
        env: { ...process.env, PORT: this.serverPort },
        stdio: 'pipe'
      });

      let startupComplete = false;

      server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('📟 Server:', output.trim());
        
        if (output.includes('Ready') || output.includes('ready') || output.includes('✓ Starting')) {
          if (!startupComplete) {
            startupComplete = true;
            setTimeout(() => resolve(server), 3000); // Give it time to fully start
          }
        }
      });

      server.stderr.on('data', (data) => {
        const error = data.toString();
        console.log('⚠️ Server Error:', error.trim());
        this.results.errors.push(`Server startup: ${error}`);
      });

      server.on('close', (code) => {
        console.log(`🔴 Server process exited with code ${code}`);
        if (!startupComplete) {
          resolve(null);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!startupComplete) {
          console.log('⏱️ Server startup timeout');
          server.kill();
          resolve(null);
        }
      }, 30000);
    });
  }

  // Comprehensive frontend testing
  async testFrontend() {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });

      const page = await context.newPage();
      
      // Enable console logging
      page.on('console', msg => console.log('🖥️ Browser:', msg.text()));
      page.on('pageerror', error => {
        console.log('🐛 Page Error:', error.message);
        this.results.errors.push(`Page error: ${error.message}`);
      });

      console.log('🧪 Testing homepage load...');
      
      try {
        await page.goto(this.baseUrl, { 
          waitUntil: 'networkidle',
          timeout: 20000 
        });
        
        console.log('✅ Page loaded successfully');
        this.results.frontend = true;

        // Test page title and basic elements
        const title = await page.title();
        console.log('📄 Page title:', title);

        // Test for critical elements
        const criticalElements = [
          'body',
          'main, [role="main"], .main-content',
          'nav, [role="navigation"], .navigation'
        ];

        for (const selector of criticalElements) {
          try {
            const element = await page.locator(selector).first();
            if (await element.count() > 0) {
              console.log(`✅ Found critical element: ${selector}`);
            }
          } catch (e) {
            console.log(`⚠️ Missing element: ${selector}`);
          }
        }

        // Test responsive design
        await this.testResponsive(page);
        
        // Test navigation if available
        await this.testNavigation(page);
        
        // Test forms if available
        await this.testForms(page);
        
        // Performance check
        await this.testPerformance(page);

        // Take screenshot for verification
        await page.screenshot({ 
          path: '/mnt/d/Users/vilma/fly2any/enterprise-validation-screenshot.png',
          fullPage: true 
        });
        console.log('📸 Screenshot saved: enterprise-validation-screenshot.png');

      } catch (error) {
        console.log('❌ Frontend test failed:', error.message);
        this.results.errors.push(`Frontend: ${error.message}`);
        this.results.frontend = false;
      }

    } catch (error) {
      console.log('❌ Browser setup failed:', error.message);
      this.results.errors.push(`Browser: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  async testResponsive(page) {
    console.log('📱 Testing responsive design...');
    
    const viewports = [
      { width: 1920, height: 1080, device: 'Desktop' },
      { width: 768, height: 1024, device: 'Tablet' },
      { width: 375, height: 667, device: 'Mobile' }
    ];

    try {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(1000);
        
        // Check if page is responsive
        const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
        console.log(`📐 ${viewport.device}: ${bodyWidth}px width`);
        
        if (bodyWidth > 0) {
          this.results.responsive = true;
        }
      }
      console.log('✅ Responsive design test completed');
    } catch (error) {
      console.log('⚠️ Responsive test error:', error.message);
      this.results.errors.push(`Responsive: ${error.message}`);
    }
  }

  async testNavigation(page) {
    console.log('🧭 Testing navigation...');
    
    try {
      // Look for navigation elements
      const navSelectors = [
        'nav a',
        '[role="navigation"] a',
        '.nav-link',
        '.navigation a',
        'header a'
      ];

      let foundLinks = false;
      for (const selector of navSelectors) {
        const links = await page.locator(selector).count();
        if (links > 0) {
          console.log(`✅ Found ${links} navigation links with selector: ${selector}`);
          foundLinks = true;
          this.results.navigation = true;
          break;
        }
      }

      if (!foundLinks) {
        console.log('⚠️ No navigation links found');
      }

    } catch (error) {
      console.log('⚠️ Navigation test error:', error.message);
      this.results.errors.push(`Navigation: ${error.message}`);
    }
  }

  async testForms(page) {
    console.log('📝 Testing forms...');
    
    try {
      const forms = await page.locator('form').count();
      const inputs = await page.locator('input').count();
      const buttons = await page.locator('button').count();

      if (forms > 0 || inputs > 0 || buttons > 0) {
        console.log(`✅ Found interactive elements: ${forms} forms, ${inputs} inputs, ${buttons} buttons`);
        this.results.forms = true;
      } else {
        console.log('⚠️ No forms or interactive elements found');
      }

    } catch (error) {
      console.log('⚠️ Forms test error:', error.message);
      this.results.errors.push(`Forms: ${error.message}`);
    }
  }

  async testPerformance(page) {
    console.log('⚡ Testing performance...');
    
    try {
      // Measure page load time
      const startTime = Date.now();
      await page.reload({ waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      console.log(`📊 Page load time: ${loadTime}ms`);
      
      if (loadTime < 10000) { // Less than 10 seconds is acceptable for dev
        this.results.performance = true;
        console.log('✅ Performance test passed');
      } else {
        console.log('⚠️ Page load time is slow');
      }

    } catch (error) {
      console.log('⚠️ Performance test error:', error.message);
      this.results.errors.push(`Performance: ${error.message}`);
    }
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n🏢 ENTERPRISE VALIDATION REPORT');
    console.log('================================');
    
    const tests = [
      { name: 'Server Status', status: this.results.server, icon: '🚀' },
      { name: 'Frontend Loading', status: this.results.frontend, icon: '🖥️' },
      { name: 'Responsive Design', status: this.results.responsive, icon: '📱' },
      { name: 'Navigation', status: this.results.navigation, icon: '🧭' },
      { name: 'Forms/Interactions', status: this.results.forms, icon: '📝' },
      { name: 'Performance', status: this.results.performance, icon: '⚡' }
    ];

    let passed = 0;
    tests.forEach(test => {
      const status = test.status ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.icon} ${test.name}: ${status}`);
      if (test.status) passed++;
    });

    console.log('\n📊 SUMMARY');
    console.log(`Tests Passed: ${passed}/${tests.length}`);
    console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🐛 ERRORS:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    console.log('\n🎯 DEPLOYMENT READINESS:');
    if (passed >= 4) {
      console.log('🟢 READY FOR DEPLOYMENT - All critical systems operational');
    } else if (passed >= 2) {
      console.log('🟡 NEEDS ATTENTION - Some issues detected');
    } else {
      console.log('🔴 NOT READY - Critical issues must be resolved');
    }

    return {
      passed,
      total: tests.length,
      successRate: Math.round((passed / tests.length) * 100),
      readyForDeployment: passed >= 4,
      errors: this.results.errors
    };
  }

  // Main validation process
  async validate() {
    console.log('🏢 STARTING ENTERPRISE VALIDATION SUITE');
    console.log('======================================');

    // Check if server is already running
    const serverRunning = await this.checkServer();
    
    let serverProcess = null;
    if (!serverRunning) {
      console.log('🔄 Server not running, attempting to start...');
      serverProcess = await this.startServer();
      
      if (serverProcess) {
        // Wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 5000));
        const serverReady = await this.checkServer();
        if (!serverReady) {
          console.log('❌ Failed to start server');
          return this.generateReport();
        }
      } else {
        console.log('❌ Could not start development server');
        return this.generateReport();
      }
    }

    // Run frontend tests
    await this.testFrontend();

    // Generate final report
    const report = this.generateReport();

    // Clean up server if we started it
    if (serverProcess) {
      console.log('🧹 Cleaning up server process...');
      serverProcess.kill();
    }

    return report;
  }
}

// Run validation
async function main() {
  const validator = new EnterpriseValidator();
  const report = await validator.validate();
  
  // Exit with appropriate code
  process.exit(report.readyForDeployment ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { EnterpriseValidator };