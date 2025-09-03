const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Comprehensive Playwright testing for Next.js React 19 application
class FlightAppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      testStart: new Date().toISOString(),
      errors: [],
      screenshots: [],
      networkRequests: [],
      consoleMessages: [],
      performanceMetrics: {},
      componentAnalysis: {},
      webpackErrors: [],
      testResults: []
    };
  }

  async init() {
    console.log('🚀 Initializing Playwright browser for comprehensive testing...');
    
    this.browser = await chromium.launch({
      headless: false, // Run visible for debugging
      slowMo: 1000,    // Slow down for observation
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set viewport for consistent testing
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Set up comprehensive monitoring
    await this.setupMonitoring();
    
    console.log('✅ Browser initialized successfully');
  }

  async setupMonitoring() {
    console.log('📊 Setting up comprehensive monitoring...');

    // Monitor console messages and errors
    this.page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      };
      this.results.consoleMessages.push(logEntry);
      
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
        this.results.errors.push({
          type: 'console_error',
          message: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });

        // Check for webpack originalFactory error
        if (msg.text().includes('originalFactory') || msg.text().includes('undefined')) {
          this.results.webpackErrors.push({
            error: msg.text(),
            location: msg.location(),
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Monitor page errors
    this.page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message);
      this.results.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Monitor network requests
    this.page.on('request', request => {
      this.results.networkRequests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        timestamp: new Date().toISOString(),
        type: 'request'
      });
    });

    this.page.on('response', response => {
      this.results.networkRequests.push({
        status: response.status(),
        url: response.url(),
        headers: response.headers(),
        timestamp: new Date().toISOString(),
        type: 'response'
      });
    });

    // Monitor failed requests
    this.page.on('requestfailed', request => {
      console.log('❌ Failed Request:', request.url(), request.failure());
      this.results.errors.push({
        type: 'request_failed',
        url: request.url(),
        failure: request.failure(),
        timestamp: new Date().toISOString()
      });
    });
  }

  async captureScreenshot(name, fullPage = true) {
    console.log(`📸 Capturing screenshot: ${name}`);
    
    const screenshotPath = path.join(__dirname, 'playwright-screenshots', `${name}-${Date.now()}.png`);
    
    // Ensure directory exists
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage,
      type: 'png'
    });
    
    this.results.screenshots.push({
      name,
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
    
    return screenshotPath;
  }

  async testLocalApplication() {
    console.log('🧪 Testing local application on localhost:3000...');
    
    try {
      // Try to load the main page
      console.log('⏳ Loading homepage...');
      await this.page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await this.captureScreenshot('homepage-loaded');
      
      // Test navigation to flights page
      console.log('⏳ Navigating to flights page...');
      await this.page.goto('http://localhost:3000/flights', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await this.captureScreenshot('flights-page-loaded');
      
      // Test for React component loading
      await this.testReactComponents();
      
      // Test form interactions
      await this.testFormInteractions();
      
    } catch (error) {
      console.log('❌ Local application test failed:', error.message);
      this.results.errors.push({
        type: 'navigation_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      await this.captureScreenshot('error-state');
    }
  }

  async testStaticFilesAnalysis() {
    console.log('📁 Analyzing static files and components...');
    
    try {
      // Create a simple HTML page to test React components
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>React 19 Component Test</title>
          <script src="https://unpkg.com/react@19/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error { color: red; padding: 10px; border: 1px solid red; margin: 10px 0; }
            .success { color: green; padding: 10px; border: 1px solid green; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>React 19 Component Test</h1>
          <div id="root"></div>
          
          <script>
            console.log('Testing React 19 loading...');
            
            try {
              const e = React.createElement;
              const testComponent = e('div', {className: 'success'}, 
                'React 19 loaded successfully! Version: ' + React.version
              );
              
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(testComponent);
              
              console.log('✅ React 19 component rendered successfully');
            } catch (error) {
              console.error('❌ React component error:', error);
              document.getElementById('root').innerHTML = 
                '<div class="error">React loading error: ' + error.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;
      
      const testPath = path.join(__dirname, 'react-test.html');
      fs.writeFileSync(testPath, testHtml);
      
      console.log('⏳ Loading React test page...');
      await this.page.goto(`file://${testPath}`, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      await this.page.waitForTimeout(2000);
      await this.captureScreenshot('react-test-page');
      
      // Check if React loaded successfully
      const reactVersion = await this.page.evaluate(() => {
        return window.React ? window.React.version : 'Not loaded';
      });
      
      this.results.componentAnalysis.reactVersion = reactVersion;
      console.log('📊 React version detected:', reactVersion);
      
    } catch (error) {
      console.log('❌ Static file analysis failed:', error.message);
      this.results.errors.push({
        type: 'static_analysis_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testReactComponents() {
    console.log('⚛️ Testing React components...');
    
    try {
      // Check for React elements in the page
      const reactElements = await this.page.evaluate(() => {
        const elements = [];
        document.querySelectorAll('[data-reactroot], [data-react-component]').forEach(el => {
          elements.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id
          });
        });
        return elements;
      });
      
      this.results.componentAnalysis.reactElements = reactElements;
      console.log('📊 React elements found:', reactElements.length);
      
      // Check for client components with "use client" directive
      const clientComponents = await this.page.evaluate(() => {
        // Look for components that might be using client-side features
        return {
          hasInteractiveElements: document.querySelectorAll('button, input, select, textarea').length,
          hasFormElements: document.querySelectorAll('form').length,
          hasClickHandlers: document.querySelectorAll('[onclick]').length
        };
      });
      
      this.results.componentAnalysis.clientComponents = clientComponents;
      console.log('📊 Client components analysis:', clientComponents);
      
    } catch (error) {
      console.log('❌ React component test failed:', error.message);
      this.results.errors.push({
        type: 'react_component_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async testFormInteractions() {
    console.log('📝 Testing form interactions...');
    
    try {
      // Look for flight search forms
      const forms = await this.page.locator('form');
      const formCount = await forms.count();
      
      console.log(`📊 Found ${formCount} forms on page`);
      
      if (formCount > 0) {
        // Try to interact with the first form
        const firstForm = forms.first();
        
        // Look for input fields
        const inputs = await firstForm.locator('input');
        const inputCount = await inputs.count();
        
        console.log(`📊 Found ${inputCount} input fields in first form`);
        
        // Try to fill some basic fields
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          try {
            const input = inputs.nth(i);
            const inputType = await input.getAttribute('type');
            const inputName = await input.getAttribute('name');
            
            console.log(`📝 Testing input ${i}: type=${inputType}, name=${inputName}`);
            
            if (inputType === 'text' || inputType === 'email') {
              await input.fill('test@example.com');
              await this.page.waitForTimeout(500);
            }
            
          } catch (inputError) {
            console.log(`❌ Input ${i} interaction failed:`, inputError.message);
          }
        }
        
        await this.captureScreenshot('form-interactions');
      }
      
    } catch (error) {
      console.log('❌ Form interaction test failed:', error.message);
      this.results.errors.push({
        type: 'form_interaction_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getPerformanceMetrics() {
    console.log('📈 Collecting performance metrics...');
    
    try {
      const metrics = await this.page.evaluate(() => {
        if (window.performance) {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            totalLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
            memoryUsage: window.performance.memory ? {
              used: window.performance.memory.usedJSHeapSize,
              total: window.performance.memory.totalJSHeapSize,
              limit: window.performance.memory.jsHeapSizeLimit
            } : null
          };
        }
        return null;
      });
      
      this.results.performanceMetrics = metrics;
      console.log('📊 Performance metrics collected:', metrics);
      
    } catch (error) {
      console.log('❌ Performance metrics collection failed:', error.message);
    }
  }

  async generateReport() {
    console.log('📋 Generating comprehensive test report...');
    
    this.results.testEnd = new Date().toISOString();
    this.results.testDuration = new Date(this.results.testEnd) - new Date(this.results.testStart);
    
    // Analyze webpack errors
    if (this.results.webpackErrors.length > 0) {
      console.log('🚨 WEBPACK ERRORS DETECTED:');
      this.results.webpackErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.error}`);
      });
    }
    
    // Generate report file
    const reportPath = path.join(__dirname, 'playwright-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate human-readable report
    const readableReport = this.generateReadableReport();
    const readableReportPath = path.join(__dirname, 'playwright-test-report.md');
    fs.writeFileSync(readableReportPath, readableReport);
    
    console.log('✅ Reports generated:');
    console.log('📄 JSON Report:', reportPath);
    console.log('📄 Markdown Report:', readableReportPath);
    
    return {
      jsonReport: reportPath,
      markdownReport: readableReportPath,
      results: this.results
    };
  }

  generateReadableReport() {
    const report = `# Fly2Any React 19 Application Test Report

## Test Summary
- **Test Start**: ${this.results.testStart}
- **Test End**: ${this.results.testEnd}
- **Duration**: ${Math.round(this.results.testDuration / 1000)} seconds
- **Total Errors**: ${this.results.errors.length}
- **Webpack Errors**: ${this.results.webpackErrors.length}
- **Screenshots Captured**: ${this.results.screenshots.length}

## Critical Issues Found

### Webpack originalFactory Errors
${this.results.webpackErrors.length > 0 ? 
  this.results.webpackErrors.map((error, i) => 
    `${i + 1}. **Error**: ${error.error}\n   **Location**: ${error.location ? JSON.stringify(error.location) : 'Unknown'}\n   **Time**: ${error.timestamp}`
  ).join('\n\n') 
  : 'No webpack originalFactory errors detected during testing.'}

## Application Analysis

### React Components
- **React Version**: ${this.results.componentAnalysis.reactVersion || 'Not detected'}
- **React Elements Found**: ${this.results.componentAnalysis.reactElements ? this.results.componentAnalysis.reactElements.length : 0}
- **Interactive Elements**: ${this.results.componentAnalysis.clientComponents ? this.results.componentAnalysis.clientComponents.hasInteractiveElements : 'Unknown'}

### Performance Metrics
${this.results.performanceMetrics ? `
- **DOM Content Loaded**: ${this.results.performanceMetrics.domContentLoaded}ms
- **Load Complete**: ${this.results.performanceMetrics.loadComplete}ms
- **Total Load Time**: ${this.results.performanceMetrics.totalLoadTime}ms
${this.results.performanceMetrics.memoryUsage ? `
- **Memory Used**: ${Math.round(this.results.performanceMetrics.memoryUsage.used / 1024 / 1024)}MB
- **Memory Total**: ${Math.round(this.results.performanceMetrics.memoryUsage.total / 1024 / 1024)}MB` : ''}
` : 'Performance metrics not available'}

## Console Messages
${this.results.consoleMessages.slice(0, 10).map((msg, i) => 
  `${i + 1}. **${msg.type.toUpperCase()}**: ${msg.text} (${msg.timestamp})`
).join('\n')}
${this.results.consoleMessages.length > 10 ? `\n... and ${this.results.consoleMessages.length - 10} more messages` : ''}

## Error Details
${this.results.errors.map((error, i) => 
  `### Error ${i + 1}: ${error.type}
**Message**: ${error.message}
**Time**: ${error.timestamp}
${error.stack ? `**Stack**: \`\`\`\n${error.stack}\n\`\`\`` : ''}
`).join('\n')}

## Screenshots
${this.results.screenshots.map((screenshot, i) => 
  `${i + 1}. **${screenshot.name}**: ${screenshot.path} (${screenshot.timestamp})`
).join('\n')}

## Recommendations

### Enterprise-Level Solutions for Webpack originalFactory Error

1. **React Refresh Configuration**
   - Disable React Fast Refresh in development (already configured in next.config.ts)
   - Consider using alternative HMR solutions

2. **Webpack Module Configuration**
   - Review webpack module resolution settings
   - Check for conflicting React versions
   - Validate client/server component boundaries

3. **Dependencies Audit**
   - Update React and Next.js to latest stable versions
   - Review package-lock.json for conflicting dependencies
   - Consider using npm audit to identify security issues

4. **Environment Isolation**
   - Use containerized development environment
   - Implement proper environment variable management
   - Consider using Docker for consistent development

5. **Code Splitting Strategy**
   - Review dynamic imports and code splitting
   - Optimize bundle size and loading strategy
   - Implement proper error boundaries

## Next Steps

1. Fix the bus error crash preventing server startup
2. Resolve environment configuration issues
3. Implement proper error handling for webpack module loading
4. Add comprehensive error monitoring in production
5. Set up continuous integration testing with Playwright

---
*Report generated by Playwright MCP Automation System*
`;

    return report;
  }

  async close() {
    console.log('🔄 Closing browser and cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      
      // Test both local application and static analysis
      await this.testLocalApplication();
      await this.testStaticFilesAnalysis();
      await this.getPerformanceMetrics();
      
      return await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      this.results.errors.push({
        type: 'test_execution_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      return await this.generateReport();
      
    } finally {
      await this.close();
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive Fly2Any application testing...');
  console.log('📊 Testing React 19 components and webpack configuration...');
  
  const tester = new FlightAppTester();
  const results = await tester.run();
  
  console.log('✅ Testing completed!');
  console.log('📋 Results summary:');
  console.log(`   - Errors found: ${results.results.errors.length}`);
  console.log(`   - Webpack issues: ${results.results.webpackErrors.length}`);
  console.log(`   - Screenshots: ${results.results.screenshots.length}`);
  console.log(`   - Reports: ${results.jsonReport}, ${results.markdownReport}`);
  
  return results;
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FlightAppTester };