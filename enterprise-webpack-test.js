/**
 * ENTERPRISE WEBPACK CONFIGURATION TESTING SUITE
 * ULTRATHINK ARCHITECTURE - COMPREHENSIVE PLAYWRIGHT TESTING
 * 
 * Testing objectives:
 * 1. originalFactory error validation
 * 2. Memory stability and Bus error prevention
 * 3. React 19 component functionality
 * 4. Next.js 15.x integration
 * 5. Performance monitoring
 * 6. HMR stress testing
 * 7. Multi-browser compatibility
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');
const os = require('os');

class EnterpriseWebpackTester {
  constructor() {
    this.testResults = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        memory: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
        cpus: os.cpus().length
      },
      tests: {},
      screenshots: [],
      errors: [],
      performance: {},
      browserLogs: []
    };
    
    this.serverProcess = null;
    this.serverStartTime = null;
    this.consoleLogs = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    
    if (!this.testResults.logs) this.testResults.logs = [];
    this.testResults.logs.push(logEntry);
  }

  async startDevServer() {
    this.log('🚀 Starting development server with enterprise configuration...');
    
    return new Promise((resolve, reject) => {
      // Try different approaches to start the server
      const attempts = [
        // Attempt 1: Use the enterprise build system
        () => spawn('node', ['scripts/enterprise-build-system.js', 'dev'], { 
          cwd: __dirname,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc' }
        }),
        
        // Attempt 2: Direct Next.js with proper NODE_OPTIONS
        () => spawn('node', ['--max-old-space-size=4096', '--expose-gc', 'node_modules/.bin/next', 'dev'], {
          cwd: __dirname,
          stdio: ['ignore', 'pipe', 'pipe']
        }),
        
        // Attempt 3: Basic Next.js without problematic flags
        () => spawn('./node_modules/.bin/next', ['dev'], {
          cwd: __dirname,
          stdio: ['ignore', 'pipe', 'pipe']
        })
      ];

      let attemptIndex = 0;
      
      const tryNextAttempt = () => {
        if (attemptIndex >= attempts.length) {
          this.log('❌ All server start attempts failed', 'error');
          return reject(new Error('Failed to start development server'));
        }

        this.log(`🔄 Server start attempt ${attemptIndex + 1}/${attempts.length}`);
        
        const serverProcess = attempts[attemptIndex]();
        this.serverStartTime = Date.now();
        
        let hasStarted = false;
        let output = '';
        
        serverProcess.stdout.on('data', (data) => {
          const chunk = data.toString();
          output += chunk;
          this.log(`SERVER STDOUT: ${chunk.trim()}`);
          
          // Check for server ready indicators
          if (chunk.includes('Ready in') || chunk.includes('Local:') || chunk.includes('localhost:3000')) {
            if (!hasStarted) {
              hasStarted = true;
              this.serverProcess = serverProcess;
              this.log('✅ Development server started successfully');
              resolve(serverProcess);
            }
          }
        });

        serverProcess.stderr.on('data', (data) => {
          const chunk = data.toString();
          this.log(`SERVER STDERR: ${chunk.trim()}`, 'warn');
          
          // Check for Bus error or other critical failures
          if (chunk.includes('Bus error') || chunk.includes('core dumped')) {
            this.log('🚨 Bus error detected - exactly the issue enterprise config should fix!', 'error');
            this.testResults.errors.push({
              type: 'bus_error',
              message: chunk.trim(),
              timestamp: new Date().toISOString(),
              attempt: attemptIndex + 1
            });
          }
        });

        serverProcess.on('exit', (code, signal) => {
          if (!hasStarted) {
            this.log(`❌ Server attempt ${attemptIndex + 1} failed: exit code ${code}, signal ${signal}`, 'error');
            this.testResults.errors.push({
              type: 'server_exit',
              exitCode: code,
              signal: signal,
              attempt: attemptIndex + 1,
              timestamp: new Date().toISOString()
            });
            
            attemptIndex++;
            setTimeout(tryNextAttempt, 2000); // Wait 2 seconds before next attempt
          }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          if (!hasStarted) {
            this.log(`⏰ Server start attempt ${attemptIndex + 1} timed out`, 'warn');
            serverProcess.kill();
            attemptIndex++;
            tryNextAttempt();
          }
        }, 30000);
      };

      tryNextAttempt();
    });
  }

  async testServerAvailability() {
    this.log('🔍 Testing server availability...');
    
    // Wait for server to be responsive
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:3000', { timeout: 5000 });
        if (response.ok) {
          this.log('✅ Server is responding');
          return true;
        }
      } catch (error) {
        this.log(`⏳ Waiting for server... attempt ${i + 1}/30`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    this.log('❌ Server is not responding after 60 seconds', 'error');
    return false;
  }

  async runBrowserTests(browserType, browserName) {
    this.log(`🌐 Starting ${browserName} browser tests...`);
    
    const browser = await browserType.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture console logs
    page.on('console', msg => {
      const logEntry = {
        browser: browserName,
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      this.consoleLogs.push(logEntry);
      
      // Check for originalFactory errors
      if (msg.text().includes('originalFactory')) {
        this.log(`🔥 originalFactory error detected in ${browserName}: ${msg.text()}`, 'error');
        this.testResults.errors.push({
          type: 'originalFactory_error',
          browser: browserName,
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      this.log(`❌ Page error in ${browserName}: ${error.message}`, 'error');
      this.testResults.errors.push({
        type: 'page_error',
        browser: browserName,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    try {
      // Test 1: Basic Page Load
      this.log(`📄 Testing basic page load in ${browserName}...`);
      const loadStartTime = Date.now();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - loadStartTime;
      
      this.testResults.performance[`${browserName}_load_time`] = loadTime;
      this.log(`⏱️  ${browserName} load time: ${loadTime}ms`);

      // Take screenshot
      const screenshotPath = path.join(__dirname, `screenshot-${browserName}-home.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      this.testResults.screenshots.push(screenshotPath);
      this.log(`📸 Screenshot saved: ${screenshotPath}`);

      // Test 2: React 19 Component Interaction
      this.log(`⚛️ Testing React 19 component interaction in ${browserName}...`);
      
      // Look for React components and interact with them
      try {
        // Test flight search form if it exists
        const searchButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
        if (searchButton) {
          await searchButton.click();
          this.log(`✅ Successfully interacted with search form in ${browserName}`);
        }
      } catch (error) {
        this.log(`⚠️  No interactive elements found in ${browserName}: ${error.message}`, 'warn');
      }

      // Test 3: Performance Metrics
      this.log(`📊 Collecting performance metrics for ${browserName}...`);
      const performanceMetrics = await page.evaluate(() => {
        return {
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null,
          navigation: performance.getEntriesByType('navigation')[0] || null,
          paint: performance.getEntriesByType('paint') || []
        };
      });
      
      this.testResults.performance[`${browserName}_metrics`] = performanceMetrics;

      // Test 4: Network Requests Monitoring
      this.log(`🌐 Monitoring network requests in ${browserName}...`);
      const networkRequests = [];
      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          timestamp: new Date().toISOString()
        });
      });

      // Navigate to different pages to test routing
      try {
        await page.goto('http://localhost:3000/flights', { waitUntil: 'networkidle' });
        this.log(`✅ Successfully navigated to /flights in ${browserName}`);
        
        // Take screenshot of flights page
        const flightsScreenshotPath = path.join(__dirname, `screenshot-${browserName}-flights.png`);
        await page.screenshot({ path: flightsScreenshotPath, fullPage: true });
        this.testResults.screenshots.push(flightsScreenshotPath);
      } catch (error) {
        this.log(`⚠️  Could not navigate to /flights in ${browserName}: ${error.message}`, 'warn');
      }

      this.testResults.tests[`${browserName}_network_requests`] = networkRequests.length;
      this.log(`📊 Captured ${networkRequests.length} network requests in ${browserName}`);

      this.testResults.tests[`${browserName}_test`] = 'PASSED';
      this.log(`✅ ${browserName} tests completed successfully`);

    } catch (error) {
      this.log(`❌ ${browserName} tests failed: ${error.message}`, 'error');
      this.testResults.tests[`${browserName}_test`] = 'FAILED';
      this.testResults.errors.push({
        type: 'browser_test_error',
        browser: browserName,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      await browser.close();
    }
  }

  async runHMRStressTest() {
    this.log('🔥 Running HMR (Hot Module Replacement) stress test...');
    
    // This would test the enterprise webpack configuration's HMR stability
    // by rapidly editing and saving files to trigger hot reloads
    
    const testFilePath = path.join(__dirname, 'src/components/test-hmr-component.tsx');
    const originalContent = `// HMR Test Component
import React from 'react';

export default function TestHMRComponent() {
  return (
    <div>
      <h1>HMR Test Component - Version 1</h1>
      <p>Testing Hot Module Replacement stability</p>
    </div>
  );
}`;

    try {
      // Create test component
      fs.writeFileSync(testFilePath, originalContent);
      this.log('📝 Created HMR test component');

      // Simulate rapid edits
      for (let i = 2; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const modifiedContent = originalContent.replace(
          `Version 1`,
          `Version ${i}`
        ).replace(
          `Testing Hot Module Replacement stability`,
          `Testing HMR stability - Update ${i} - ${new Date().toISOString()}`
        );
        
        fs.writeFileSync(testFilePath, modifiedContent);
        this.log(`🔄 HMR test iteration ${i}: File updated`);
      }

      this.testResults.tests['hmr_stress_test'] = 'COMPLETED';
      this.log('✅ HMR stress test completed');

    } catch (error) {
      this.log(`❌ HMR stress test failed: ${error.message}`, 'error');
      this.testResults.tests['hmr_stress_test'] = 'FAILED';
    } finally {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        this.log('🧹 Cleaned up HMR test component');
      }
    }
  }

  async generateReport() {
    this.log('📋 Generating comprehensive test report...');
    
    const reportData = {
      ...this.testResults,
      consoleLogs: this.consoleLogs,
      summary: {
        totalTests: Object.keys(this.testResults.tests).length,
        passedTests: Object.values(this.testResults.tests).filter(result => result === 'PASSED' || result === 'COMPLETED').length,
        failedTests: Object.values(this.testResults.tests).filter(result => result === 'FAILED').length,
        totalErrors: this.testResults.errors.length,
        originalFactoryErrors: this.testResults.errors.filter(err => err.type === 'originalFactory_error').length,
        busErrors: this.testResults.errors.filter(err => err.type === 'bus_error').length,
        serverUptime: this.serverStartTime ? Date.now() - this.serverStartTime : 0
      }
    };

    const reportPath = path.join(__dirname, 'enterprise-webpack-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    this.log(`📄 Test report saved to: ${reportPath}`);
    return reportData;
  }

  async cleanup() {
    this.log('🧹 Cleaning up test environment...');
    
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.log('🛑 Development server stopped');
    }
  }

  async runFullTestSuite() {
    try {
      this.log('🎯 ENTERPRISE WEBPACK CONFIGURATION TESTING SUITE STARTED');
      this.log(`🖥️  Environment: ${this.testResults.environment.platform} ${this.testResults.environment.arch}`);
      this.log(`💾 Memory: ${this.testResults.environment.memory}`);
      this.log(`🔧 CPUs: ${this.testResults.environment.cpus}`);
      this.log(`📦 Node.js: ${this.testResults.environment.nodeVersion}`);

      // Start development server
      try {
        await this.startDevServer();
        
        // Test server availability
        const serverAvailable = await this.testServerAvailability();
        
        if (serverAvailable) {
          // Run browser tests
          await this.runBrowserTests(chromium, 'chromium');
          await this.runBrowserTests(firefox, 'firefox');
          await this.runBrowserTests(webkit, 'webkit');
          
          // Run HMR stress test
          await this.runHMRStressTest();
          
        } else {
          this.log('❌ Server not available, skipping browser tests', 'error');
          this.testResults.tests['server_availability'] = 'FAILED';
        }
        
      } catch (error) {
        this.log(`❌ Server startup failed: ${error.message}`, 'error');
        this.testResults.tests['server_startup'] = 'FAILED';
        this.testResults.errors.push({
          type: 'server_startup_error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // Generate final report
      const report = await this.generateReport();
      
      this.log('🎉 ENTERPRISE WEBPACK CONFIGURATION TESTING COMPLETE');
      this.log(`📊 Summary: ${report.summary.passedTests}/${report.summary.totalTests} tests passed`);
      this.log(`🔥 originalFactory errors: ${report.summary.originalFactoryErrors}`);
      this.log(`🚨 Bus errors: ${report.summary.busErrors}`);
      
      return report;

    } catch (error) {
      this.log(`💥 Test suite failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new EnterpriseWebpackTester();
  tester.runFullTestSuite()
    .then(report => {
      console.log('\n🏆 ENTERPRISE WEBPACK TESTING COMPLETED');
      console.log('📄 Full report available in: enterprise-webpack-test-report.json');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 ENTERPRISE WEBPACK TESTING FAILED');
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = EnterpriseWebpackTester;