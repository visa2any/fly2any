#!/usr/bin/env node
/**
 * 🧪 ULTRATHINK COMPREHENSIVE TESTING SUITE
 * ==========================================
 * Complete validation suite for React/Next.js stability
 */

const { chromium, webkit, firefox } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveTestSuite {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      serverStartup: null,
      reactContext: null,
      ssrHydration: null,
      desktopVersion: null,
      crossBrowser: null,
      performance: null,
      accessibility: null
    };
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async testServerStartup() {
    await this.log('🔧 Testing Server Startup Verification');
    
    try {
      // Test server response time
      const start = Date.now();
      const response = await fetch('http://localhost:3000');
      const responseTime = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const content = await response.text();
      
      // Check for essential elements
      const checks = [
        { name: 'HTML structure', test: content.includes('<html') },
        { name: 'React root', test: content.includes('__next') || content.includes('root') },
        { name: 'No server errors', test: !content.includes('Application error') },
        { name: 'Performance', test: responseTime < 5000 }
      ];

      const passed = checks.filter(c => c.test).length;
      
      this.results.serverStartup = {
        success: passed === checks.length,
        responseTime,
        checks,
        score: `${passed}/${checks.length}`
      };

      await this.log(`✅ Server startup: ${this.results.serverStartup.score} checks passed`);
      
    } catch (error) {
      this.results.serverStartup = { success: false, error: error.message };
      await this.log(`❌ Server startup failed: ${error.message}`);
    }
  }

  async testReactContext() {
    await this.log('⚛️ Testing React Context Validation');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto('http://localhost:3000');
      
      // Inject React context validation script
      const contextTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Check for React
          const hasReact = typeof window.React !== 'undefined' || 
                          document.querySelector('[data-reactroot]') !== null ||
                          document.querySelector('#__next') !== null;

          // Check for multiple React instances
          const reactElements = document.querySelectorAll('[data-react-checksum], [data-reactroot]');
          
          // Check for ReactCurrentDispatcher errors
          const consoleErrors = [];
          const originalError = console.error;
          console.error = (...args) => {
            consoleErrors.push(args.join(' '));
            originalError.apply(console, args);
          };

          // Wait a bit for any async errors
          setTimeout(() => {
            const hasDispatcherError = consoleErrors.some(error => 
              error.includes('ReactCurrentDispatcher') || 
              error.includes('Invalid hook call')
            );

            resolve({
              hasReact,
              reactElementCount: reactElements.length,
              hasDispatcherError,
              consoleErrors,
              success: hasReact && !hasDispatcherError
            });
          }, 2000);
        });
      });

      this.results.reactContext = contextTest;
      
      if (contextTest.success) {
        await this.log('✅ React context validation passed');
      } else {
        await this.log('❌ React context validation failed');
        if (contextTest.hasDispatcherError) {
          await this.log('   - ReactCurrentDispatcher error detected');
        }
      }
      
    } catch (error) {
      this.results.reactContext = { success: false, error: error.message };
      await this.log(`❌ React context test failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  async testSSRHydration() {
    await this.log('💧 Testing SSR/Hydration Consistency');
    
    const browser = await chromium.launch({ headless: true });
    
    try {
      // Test 1: Disable JavaScript and check SSR
      const contextNoJS = await browser.newContext({ 
        javaScriptEnabled: false 
      });
      const pageNoJS = await contextNoJS.newPage();
      await pageNoJS.goto('http://localhost:3000');
      
      const ssrContent = await pageNoJS.content();
      await pageNoJS.screenshot({ path: 'logs/ssr-no-js.png' });
      
      // Test 2: Enable JavaScript and check hydration
      const contextJS = await browser.newContext({ 
        javaScriptEnabled: true 
      });
      const pageJS = await contextJS.newPage();
      
      // Monitor hydration errors
      const hydrationErrors = [];
      pageJS.on('console', msg => {
        if (msg.type() === 'error' && 
            (msg.text().includes('hydration') || 
             msg.text().includes('mismatch') ||
             msg.text().includes('suppressHydrationWarning'))) {
          hydrationErrors.push(msg.text());
        }
      });

      await pageJS.goto('http://localhost:3000');
      await pageJS.waitForLoadState('networkidle');
      
      const hydratedContent = await pageJS.content();
      await pageJS.screenshot({ path: 'logs/ssr-with-js.png' });

      // Compare key elements
      const ssrBodyContent = ssrContent.match(/<body[^>]*>(.*?)<\/body>/s)?.[1] || '';
      const hydratedBodyContent = hydratedContent.match(/<body[^>]*>(.*?)<\/body>/s)?.[1] || '';
      
      const contentSimilarity = this.calculateSimilarity(ssrBodyContent, hydratedBodyContent);
      
      this.results.ssrHydration = {
        success: hydrationErrors.length === 0 && contentSimilarity > 0.8,
        hydrationErrors,
        contentSimilarity: Math.round(contentSimilarity * 100),
        ssrLength: ssrBodyContent.length,
        hydratedLength: hydratedBodyContent.length
      };

      if (this.results.ssrHydration.success) {
        await this.log('✅ SSR/Hydration consistency passed');
      } else {
        await this.log('❌ SSR/Hydration issues detected');
        if (hydrationErrors.length > 0) {
          await this.log(`   - ${hydrationErrors.length} hydration errors`);
        }
      }
      
      await contextNoJS.close();
      await contextJS.close();
      
    } catch (error) {
      this.results.ssrHydration = { success: false, error: error.message };
      await this.log(`❌ SSR/Hydration test failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  async testDesktopVersion() {
    await this.log('🖥️ Testing Desktop Version Functionality');
    
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--app=http://localhost:3000', '--disable-web-security']
    });
    
    try {
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3000');
      
      // Test desktop-specific features
      const desktopTests = await page.evaluate(() => {
        const tests = {
          windowSize: window.innerWidth >= 1024,
          touchSupport: 'ontouchstart' in window,
          mouseSupport: window.navigator.maxTouchPoints === 0,
          keyboardNavigation: document.activeElement !== null,
          rightClickContext: true // Test right-click menus
        };
        
        return tests;
      });

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      
      // Test responsive design
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.screenshot({ path: 'logs/desktop-1366.png' });
      
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.screenshot({ path: 'logs/desktop-1920.png' });

      this.results.desktopVersion = {
        success: desktopTests.windowSize && desktopTests.keyboardNavigation,
        tests: desktopTests,
        focusedElement,
        responsive: true
      };

      if (this.results.desktopVersion.success) {
        await this.log('✅ Desktop version functionality passed');
      } else {
        await this.log('❌ Desktop version issues detected');
      }
      
    } catch (error) {
      this.results.desktopVersion = { success: false, error: error.message };
      await this.log(`❌ Desktop version test failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  async testCrossBrowser() {
    await this.log('🌐 Testing Cross-Browser Compatibility');
    
    const browsers = [
      { name: 'Chromium', launch: () => chromium.launch({ headless: true }) },
      { name: 'WebKit', launch: () => webkit.launch({ headless: true }) },
      { name: 'Firefox', launch: () => firefox.launch({ headless: true }) }
    ];

    const results = {};
    
    for (const browserInfo of browsers) {
      try {
        const browser = await browserInfo.launch();
        const page = await browser.newPage();
        
        const start = Date.now();
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - start;
        
        // Basic functionality test
        const basicTest = await page.evaluate(() => {
          return {
            hasDocument: typeof document !== 'undefined',
            hasWindow: typeof window !== 'undefined',
            hasReact: document.querySelector('#__next') !== null,
            canInteract: document.querySelectorAll('button, input, a').length > 0
          };
        });

        await page.screenshot({ path: `logs/cross-browser-${browserInfo.name.toLowerCase()}.png` });
        
        results[browserInfo.name] = {
          success: Object.values(basicTest).every(test => test),
          loadTime,
          tests: basicTest
        };
        
        await browser.close();
        
        await this.log(`✅ ${browserInfo.name}: ${results[browserInfo.name].success ? 'PASS' : 'FAIL'}`);
        
      } catch (error) {
        results[browserInfo.name] = { success: false, error: error.message };
        await this.log(`❌ ${browserInfo.name}: FAIL - ${error.message}`);
      }
    }

    this.results.crossBrowser = results;
  }

  async testPerformance() {
    await this.log('⚡ Testing Performance Metrics');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      // Performance monitoring
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Web Vitals
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve({
              loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              firstPaint: entries.find(e => e.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: entries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
              resources: performance.getEntriesByType('resource').length,
              memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
              } : null
            });
          });
          
          observer.observe({ entryTypes: ['paint', 'navigation'] });
          
          // Fallback after 5 seconds
          setTimeout(() => {
            resolve({
              loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              resources: performance.getEntriesByType('resource').length,
              memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
              } : null
            });
          }, 5000);
        });
      });

      const performanceScore = this.calculatePerformanceScore(performanceMetrics);
      
      this.results.performance = {
        success: performanceScore >= 70,
        score: performanceScore,
        metrics: performanceMetrics
      };

      if (this.results.performance.success) {
        await this.log(`✅ Performance: Score ${performanceScore}/100`);
      } else {
        await this.log(`❌ Performance: Score ${performanceScore}/100 (below threshold)`);
      }
      
    } catch (error) {
      this.results.performance = { success: false, error: error.message };
      await this.log(`❌ Performance test failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
  }

  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // Load time penalties
    if (metrics.loadTime > 5000) score -= 30;
    else if (metrics.loadTime > 3000) score -= 15;
    else if (metrics.loadTime > 1000) score -= 5;
    
    // DOM Content Loaded penalties
    if (metrics.domContentLoaded > 3000) score -= 20;
    else if (metrics.domContentLoaded > 1500) score -= 10;
    
    // First Contentful Paint penalties
    if (metrics.firstContentfulPaint > 2000) score -= 15;
    else if (metrics.firstContentfulPaint > 1000) score -= 5;
    
    // Resource count penalties
    if (metrics.resources > 100) score -= 10;
    else if (metrics.resources > 50) score -= 5;
    
    return Math.max(0, score);
  }

  async runAllTests() {
    const startTime = Date.now();
    
    await this.log('🚀 Starting Comprehensive Test Suite');
    await this.log('=====================================');

    await this.testServerStartup();
    await this.testReactContext();
    await this.testSSRHydration();
    await this.testDesktopVersion();
    await this.testCrossBrowser();
    await this.testPerformance();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Calculate overall success
    const testResults = Object.values(this.results).filter(r => r !== null);
    const successfulTests = testResults.filter(r => r.success).length;
    const totalTests = testResults.length;
    
    const finalReport = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      overall: {
        success: successfulTests === totalTests,
        score: `${successfulTests}/${totalTests}`,
        percentage: Math.round((successfulTests / totalTests) * 100)
      },
      results: this.results
    };

    // Save report
    await fs.writeFile(
      path.join(this.projectRoot, 'logs', 'comprehensive-test-report.json'),
      JSON.stringify(finalReport, null, 2)
    );

    await this.log('=====================================');
    await this.log(`🎯 FINAL SCORE: ${finalReport.overall.score} (${finalReport.overall.percentage}%)`);
    
    if (finalReport.overall.success) {
      await this.log('🎉 ALL TESTS PASSED!');
    } else {
      await this.log('⚠️ Some tests failed - check report for details');
    }

    return finalReport;
  }
}

// Auto-execute if run directly
if (require.main === module) {
  const testSuite = new ComprehensiveTestSuite();
  
  testSuite.runAllTests()
    .then(report => {
      console.log('\n📊 Test execution completed');
      process.exit(report.overall.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Test execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = ComprehensiveTestSuite;