import { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

/**
 * Custom Playwright Reporter for Authentication Testing
 * Generates detailed reports specific to authentication testing needs
 */

class AuthTestReporter implements Reporter {
  private startTime: Date;
  private config: FullConfig;
  private authTestResults: any[] = [];
  private authMetrics = {
    totalTests: 0,
    authTests: 0,
    csrfTests: 0,
    performanceTests: 0,
    visualTests: 0,
    networkTests: 0,
    monitoringTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0
  };

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = new Date();
    this.config = config;
    
    console.log('\n🚀 [AUTH-REPORTER] Starting Authentication Test Suite...');
    console.log(`📅 Test execution started at: ${this.startTime.toISOString()}`);
    console.log(`🖥️  Base URL: ${config.use?.baseURL || 'http://localhost:3000'}`);
    console.log(`🌐 Workers: ${config.workers}`);
    console.log(`🔄 Retries: ${config.retries}`);
    
    this.countTests(suite);
    console.log(`📊 Test breakdown: ${this.authMetrics.totalTests} total tests`);
    console.log(`   - Authentication: ${this.authMetrics.authTests}`);
    console.log(`   - CSRF Monitoring: ${this.authMetrics.csrfTests}`);
    console.log(`   - Performance: ${this.authMetrics.performanceTests}`);
    console.log(`   - Visual Testing: ${this.authMetrics.visualTests}`);
    console.log(`   - Network Analysis: ${this.authMetrics.networkTests}`);
    console.log(`   - Health Monitoring: ${this.authMetrics.monitoringTests}`);
  }

  private countTests(suite: Suite) {
    for (const test of suite.tests) {
      this.authMetrics.totalTests++;
      
      // Categorize tests based on file path or test title
      const testFile = test.location.file;
      const testTitle = test.title;
      
      if (testFile.includes('authentication.spec')) {
        this.authMetrics.authTests++;
      } else if (testFile.includes('csrf-monitoring.spec')) {
        this.authMetrics.csrfTests++;
      } else if (testFile.includes('performance.spec')) {
        this.authMetrics.performanceTests++;
      } else if (testFile.includes('visual-testing.spec')) {
        this.authMetrics.visualTests++;
      } else if (testFile.includes('network-analysis.spec')) {
        this.authMetrics.networkTests++;
      } else if (testFile.includes('health-monitor.spec') || testFile.includes('error-detection.spec')) {
        this.authMetrics.monitoringTests++;
      }
    }
    
    for (const childSuite of suite.suites) {
      this.countTests(childSuite);
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testInfo = {
      testName: test.title,
      fullName: `${test.parent.title} > ${test.title}`,
      file: test.location.file.split('/').pop(),
      status: result.status,
      duration: result.duration,
      startTime: new Date(Date.now() - result.duration),
      endTime: new Date(),
      error: result.error?.message || null,
      attachments: result.attachments.length,
      retries: result.retry,
      workerIndex: result.workerIndex
    };

    this.authTestResults.push(testInfo);

    // Update metrics
    if (result.status === 'passed') {
      this.authMetrics.passedTests++;
    } else if (result.status === 'failed') {
      this.authMetrics.failedTests++;
    } else if (result.status === 'skipped') {
      this.authMetrics.skippedTests++;
    }

    // Real-time logging for critical tests
    if (testInfo.file.includes('csrf') || testInfo.testName.includes('CSRF')) {
      if (result.status === 'failed') {
        console.log(`🚨 [AUTH-REPORTER] CRITICAL: CSRF test failed - ${testInfo.testName}`);
      } else if (result.status === 'passed') {
        console.log(`🛡️ [AUTH-REPORTER] CSRF test passed - ${testInfo.testName}`);
      }
    }

    if (testInfo.testName.includes('authentication') || testInfo.testName.includes('login')) {
      if (result.status === 'failed') {
        console.log(`❌ [AUTH-REPORTER] Authentication test failed - ${testInfo.testName}`);
      } else if (result.status === 'passed') {
        console.log(`✅ [AUTH-REPORTER] Authentication test passed - ${testInfo.testName}`);
      }
    }
  }

  onEnd(result: FullResult) {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();
    const successRate = this.authMetrics.totalTests > 0 ? 
      (this.authMetrics.passedTests / this.authMetrics.totalTests * 100) : 0;

    console.log('\n📋 [AUTH-REPORTER] Authentication Test Suite Summary');
    console.log('=' .repeat(60));
    console.log(`📅 Execution completed at: ${endTime.toISOString()}`);
    console.log(`⏱️  Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`📊 Overall status: ${result.status}`);
    console.log(`✅ Success rate: ${successRate.toFixed(2)}%`);
    console.log('');

    // Detailed metrics
    console.log('📈 Test Results:');
    console.log(`   Total tests: ${this.authMetrics.totalTests}`);
    console.log(`   ✅ Passed: ${this.authMetrics.passedTests}`);
    console.log(`   ❌ Failed: ${this.authMetrics.failedTests}`);
    console.log(`   ⏭️  Skipped: ${this.authMetrics.skippedTests}`);

    // Category breakdown
    console.log('\n🔍 Test Category Results:');
    this.printCategoryResults('Authentication Core', this.authMetrics.authTests);
    this.printCategoryResults('CSRF Monitoring', this.authMetrics.csrfTests);
    this.printCategoryResults('Performance Analysis', this.authMetrics.performanceTests);
    this.printCategoryResults('Visual Testing', this.authMetrics.visualTests);
    this.printCategoryResults('Network Analysis', this.authMetrics.networkTests);
    this.printCategoryResults('Health Monitoring', this.authMetrics.monitoringTests);

    // Failed test details
    const failedTests = this.authTestResults.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test.fullName}`);
        console.log(`     File: ${test.file}`);
        console.log(`     Duration: ${test.duration}ms`);
        if (test.error) {
          console.log(`     Error: ${test.error.substring(0, 100)}...`);
        }
        console.log('');
      });
    }

    // Performance insights
    const avgDuration = this.authTestResults.reduce((sum, test) => sum + test.duration, 0) / this.authTestResults.length;
    const slowTests = this.authTestResults.filter(test => test.duration > avgDuration * 2);
    
    if (slowTests.length > 0) {
      console.log(`⏱️  Performance Notes:`);
      console.log(`   Average test duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`   Slow tests (> 2x avg): ${slowTests.length}`);
      slowTests.slice(0, 3).forEach(test => {
        console.log(`     - ${test.testName}: ${test.duration}ms`);
      });
    }

    // Generate detailed report
    this.generateDetailedReport(result, totalDuration);

    // Final recommendations
    console.log('\n💡 Recommendations:');
    if (this.authMetrics.failedTests > 0) {
      console.log(`   - Investigate ${this.authMetrics.failedTests} failed tests`);
    }
    if (successRate < 95) {
      console.log(`   - Success rate below 95% - review authentication system stability`);
    }
    if (failedTests.some(t => t.file.includes('csrf'))) {
      console.log(`   - CRITICAL: CSRF tests failing - immediate attention required`);
    }
    if (slowTests.length > this.authMetrics.totalTests * 0.3) {
      console.log(`   - Consider optimizing test performance (${slowTests.length} slow tests)`);
    }
    if (this.authMetrics.failedTests === 0 && successRate === 100) {
      console.log(`   - ✅ All authentication tests passing - system appears healthy`);
    }

    console.log('\n🎯 [AUTH-REPORTER] Authentication testing completed');
    console.log('=' .repeat(60));
  }

  private printCategoryResults(category: string, count: number) {
    if (count > 0) {
      const categoryTests = this.authTestResults.filter(test => {
        const fileName = test.file.toLowerCase();
        const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
        return fileName.includes(categoryKey) || fileName.includes(category.toLowerCase().split(' ')[0]);
      });
      
      const passed = categoryTests.filter(t => t.status === 'passed').length;
      const failed = categoryTests.filter(t => t.status === 'failed').length;
      
      const status = failed > 0 ? '❌' : '✅';
      console.log(`   ${status} ${category}: ${passed}/${count} passed`);
    }
  }

  private generateDetailedReport(result: FullResult, totalDuration: number) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const reportsDir = path.join(process.cwd(), 'tests', 'reports');
      
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const detailedReport = {
        metadata: {
          reportGenerated: new Date().toISOString(),
          testSuiteVersion: '1.0.0',
          playwrightVersion: require('@playwright/test/package.json').version,
          baseURL: this.config.use?.baseURL || 'http://localhost:3000',
          totalDuration,
          overallStatus: result.status
        },
        summary: {
          ...this.authMetrics,
          successRate: (this.authMetrics.passedTests / this.authMetrics.totalTests * 100).toFixed(2) + '%'
        },
        testResults: this.authTestResults,
        insights: {
          averageTestDuration: this.authTestResults.reduce((sum, test) => sum + test.duration, 0) / this.authTestResults.length,
          slowestTest: this.authTestResults.reduce((slowest, test) => test.duration > slowest.duration ? test : slowest),
          fastestTest: this.authTestResults.reduce((fastest, test) => test.duration < fastest.duration ? test : fastest),
          totalAttachments: this.authTestResults.reduce((sum, test) => sum + test.attachments, 0)
        },
        categories: {
          authentication: this.authTestResults.filter(t => t.file.includes('authentication')),
          csrf: this.authTestResults.filter(t => t.file.includes('csrf')),
          performance: this.authTestResults.filter(t => t.file.includes('performance')),
          visual: this.authTestResults.filter(t => t.file.includes('visual')),
          network: this.authTestResults.filter(t => t.file.includes('network')),
          monitoring: this.authTestResults.filter(t => t.file.includes('monitor') || t.file.includes('error'))
        }
      };

      const reportPath = path.join(reportsDir, 'auth-test-detailed-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      
      console.log(`📄 [AUTH-REPORTER] Detailed report saved: ${reportPath}`);

      // Generate CSV summary for easy analysis
      const csvData = [
        'Test Name,File,Status,Duration (ms),Retries,Attachments',
        ...this.authTestResults.map(test => 
          `"${test.testName}","${test.file}","${test.status}",${test.duration},${test.retries},${test.attachments}`
        )
      ].join('\n');

      const csvPath = path.join(reportsDir, 'auth-test-summary.csv');
      fs.writeFileSync(csvPath, csvData);
      console.log(`📊 [AUTH-REPORTER] CSV summary saved: ${csvPath}`);

    } catch (error) {
      console.error('❌ [AUTH-REPORTER] Failed to generate detailed report:', error.message);
    }
  }
}

export default AuthTestReporter;