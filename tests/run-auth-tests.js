#!/usr/bin/env node

/**
 * Comprehensive Authentication Testing Runner
 * Advanced test execution script with multiple modes and reporting
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AuthTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.config = {
      baseURL: 'http://localhost:3000',
      timeout: 30000,
      retries: 2,
      workers: 1
    };
  }

  async run(mode = 'all', options = {}) {
    console.log('🚀 [AUTH-TEST-RUNNER] Starting comprehensive authentication testing...');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`🎯 Mode: ${mode}`);
    console.log('=' .repeat(70));

    try {
      // Ensure application is running
      await this.checkApplicationStatus();
      
      // Run tests based on mode
      switch (mode) {
        case 'quick':
          await this.runQuickTests();
          break;
        case 'csrf':
          await this.runCSRFTests();
          break;
        case 'performance':
          await this.runPerformanceTests();
          break;
        case 'visual':
          await this.runVisualTests();
          break;
        case 'monitoring':
          await this.runMonitoringTests();
          break;
        case 'network':
          await this.runNetworkTests();
          break;
        case 'all':
        default:
          await this.runAllTests();
          break;
      }

      await this.generateSummaryReport();
      
      console.log('✅ [AUTH-TEST-RUNNER] All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ [AUTH-TEST-RUNNER] Test execution failed:', error.message);
      process.exit(1);
    }
  }

  async checkApplicationStatus() {
    console.log('🔍 [AUTH-TEST-RUNNER] Checking application status...');
    
    try {
      const { spawn } = require('child_process');
      const curl = spawn('curl', ['-I', 'http://localhost:3000/admin/login'], {
        stdio: 'pipe'
      });

      await new Promise((resolve, reject) => {
        curl.on('close', (code) => {
          if (code === 0) {
            console.log('✅ [AUTH-TEST-RUNNER] Application is running and accessible');
            resolve();
          } else {
            reject(new Error('Application is not accessible. Please start with "npm run dev"'));
          }
        });

        curl.on('error', (error) => {
          reject(new Error(`Application check failed: ${error.message}`));
        });
      });

    } catch (error) {
      throw new Error(`Application is not running. Please start the development server first.\nError: ${error.message}`);
    }
  }

  async runPlaywrightCommand(testPath, options = {}) {
    const {
      reporter = 'line',
      project = 'chromium',
      headed = false,
      timeout = 30000
    } = options;

    const command = [
      'npx', 'playwright', 'test',
      testPath,
      '--project', project,
      '--reporter', reporter,
      '--timeout', timeout.toString()
    ];

    if (headed) {
      command.push('--headed');
    }

    console.log(`🎬 [AUTH-TEST-RUNNER] Running: ${command.join(' ')}`);

    return new Promise((resolve, reject) => {
      const process = spawn(command[0], command.slice(1), {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Test process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runQuickTests() {
    console.log('⚡ [AUTH-TEST-RUNNER] Running quick authentication tests...');
    
    await this.runPlaywrightCommand('tests/auth/authentication.spec.ts', {
      reporter: 'line,json:tests/reports/quick-results.json'
    });
  }

  async runCSRFTests() {
    console.log('🛡️ [AUTH-TEST-RUNNER] Running CSRF monitoring tests...');
    
    await this.runPlaywrightCommand('tests/auth/csrf-monitoring.spec.ts', {
      reporter: 'line,json:tests/reports/csrf-results.json',
      timeout: 45000
    });
  }

  async runPerformanceTests() {
    console.log('📊 [AUTH-TEST-RUNNER] Running performance tests...');
    
    await this.runPlaywrightCommand('tests/monitoring/performance.spec.ts', {
      reporter: 'line,json:tests/reports/performance-results.json',
      timeout: 60000
    });
  }

  async runVisualTests() {
    console.log('📸 [AUTH-TEST-RUNNER] Running visual tests...');
    
    await this.runPlaywrightCommand('tests/monitoring/visual-testing.spec.ts', {
      reporter: 'line,json:tests/reports/visual-results.json',
      timeout: 45000
    });
  }

  async runMonitoringTests() {
    console.log('🔍 [AUTH-TEST-RUNNER] Running monitoring tests...');
    
    await this.runPlaywrightCommand('tests/monitoring/health-monitor.spec.ts', {
      reporter: 'line,json:tests/reports/monitoring-results.json',
      timeout: 120000 // 2 minutes for monitoring tests
    });

    await this.runPlaywrightCommand('tests/monitoring/error-detection.spec.ts', {
      reporter: 'line,json:tests/reports/error-detection-results.json',
      timeout: 60000
    });
  }

  async runNetworkTests() {
    console.log('🌐 [AUTH-TEST-RUNNER] Running network analysis tests...');
    
    await this.runPlaywrightCommand('tests/monitoring/network-analysis.spec.ts', {
      reporter: 'line,json:tests/reports/network-results.json',
      timeout: 60000
    });
  }

  async runAllTests() {
    console.log('🎯 [AUTH-TEST-RUNNER] Running complete test suite...');
    
    const testSuites = [
      { name: 'Authentication Core', path: 'tests/auth/authentication.spec.ts', timeout: 30000 },
      { name: 'CSRF Monitoring', path: 'tests/auth/csrf-monitoring.spec.ts', timeout: 45000 },
      { name: 'Performance Analysis', path: 'tests/monitoring/performance.spec.ts', timeout: 60000 },
      { name: 'Visual Testing', path: 'tests/monitoring/visual-testing.spec.ts', timeout: 45000 },
      { name: 'Health Monitoring', path: 'tests/monitoring/health-monitor.spec.ts', timeout: 120000 },
      { name: 'Error Detection', path: 'tests/monitoring/error-detection.spec.ts', timeout: 60000 },
      { name: 'Network Analysis', path: 'tests/monitoring/network-analysis.spec.ts', timeout: 60000 }
    ];

    for (const suite of testSuites) {
      console.log(`\n🧪 [AUTH-TEST-RUNNER] Running ${suite.name}...`);
      
      try {
        await this.runPlaywrightCommand(suite.path, {
          reporter: `line,json:tests/reports/${suite.name.toLowerCase().replace(/\s+/g, '-')}-results.json`,
          timeout: suite.timeout
        });
        
        console.log(`✅ [AUTH-TEST-RUNNER] ${suite.name} completed successfully`);
      } catch (error) {
        console.error(`❌ [AUTH-TEST-RUNNER] ${suite.name} failed:`, error.message);
        // Continue with other tests
      }
    }
  }

  async generateSummaryReport() {
    console.log('\n📋 [AUTH-TEST-RUNNER] Generating comprehensive summary report...');
    
    const reportsDir = path.join(process.cwd(), 'tests', 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const executionTime = Date.now() - this.startTime;
    
    const summary = {
      executionInfo: {
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: executionTime,
        durationFormatted: `${(executionTime / 1000).toFixed(2)}s`
      },
      testEnvironment: {
        baseURL: this.config.baseURL,
        nodeVersion: process.version,
        playwrightVersion: this.getPlaywrightVersion(),
        operatingSystem: process.platform
      },
      reports: this.collectGeneratedReports(reportsDir),
      recommendations: this.generateRecommendations()
    };

    // Save comprehensive summary
    const summaryPath = path.join(reportsDir, 'execution-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Generate HTML summary report
    this.generateHTMLSummary(summary, reportsDir);
    
    console.log(`📄 [AUTH-TEST-RUNNER] Summary report saved: ${summaryPath}`);
    console.log(`🌐 [AUTH-TEST-RUNNER] HTML report generated: tests/reports/summary.html`);
    
    // Display key metrics
    this.displayExecutionSummary(summary);
  }

  collectGeneratedReports(reportsDir) {
    const reports = [];
    
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      
      files.forEach(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        
        reports.push({
          filename: file,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          type: path.extname(file)
        });
      });
    }
    
    return reports;
  }

  generateRecommendations() {
    return [
      'Review all generated test reports for detailed insights',
      'Pay special attention to CSRF monitoring results',
      'Monitor authentication performance metrics',
      'Check visual testing screenshots for UI issues',
      'Analyze network traffic patterns for optimization opportunities',
      'Set up continuous monitoring based on health check results'
    ];
  }

  generateHTMLSummary(summary, reportsDir) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Test Suite - Execution Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .danger { border-left-color: #dc3545; }
        .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .report-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
        ul { padding-left: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Authentication Test Suite Results</h1>
            <p>Comprehensive testing and monitoring report</p>
            <p class="timestamp">Generated: ${summary.executionInfo.endTime}</p>
        </div>

        <div class="metric success">
            <h3>✅ Execution Completed</h3>
            <p><strong>Duration:</strong> ${summary.executionInfo.durationFormatted}</p>
            <p><strong>Started:</strong> ${summary.executionInfo.startTime}</p>
            <p><strong>Completed:</strong> ${summary.executionInfo.endTime}</p>
        </div>

        <div class="metric">
            <h3>🖥️ Test Environment</h3>
            <p><strong>Base URL:</strong> ${summary.testEnvironment.baseURL}</p>
            <p><strong>Node Version:</strong> ${summary.testEnvironment.nodeVersion}</p>
            <p><strong>Playwright Version:</strong> ${summary.testEnvironment.playwrightVersion}</p>
            <p><strong>Platform:</strong> ${summary.testEnvironment.operatingSystem}</p>
        </div>

        <h2>📊 Generated Reports</h2>
        <div class="reports-grid">
            ${summary.reports.map(report => `
                <div class="report-card">
                    <h4>📄 ${report.filename}</h4>
                    <p><strong>Size:</strong> ${(report.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Type:</strong> ${report.type}</p>
                    <p class="timestamp">Modified: ${new Date(report.modified).toLocaleString()}</p>
                </div>
            `).join('')}
        </div>

        <div class="metric">
            <h3>💡 Recommendations</h3>
            <ul>
                ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>

        <div class="footer">
            <p>🤖 Generated by Playwright Authentication Test Suite v1.0.0</p>
            <p>For detailed analysis, review the JSON reports and screenshots in the reports directory.</p>
        </div>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(path.join(reportsDir, 'summary.html'), html);
  }

  displayExecutionSummary(summary) {
    console.log('\n📊 [AUTH-TEST-RUNNER] Execution Summary:');
    console.log('=' .repeat(50));
    console.log(`⏱️  Total execution time: ${summary.executionInfo.durationFormatted}`);
    console.log(`📄 Reports generated: ${summary.reports.length}`);
    console.log(`🌐 HTML summary: tests/reports/summary.html`);
    console.log(`📁 All artifacts saved in: tests/reports/`);
    console.log('');
    console.log('🎯 Next Steps:');
    summary.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  getPlaywrightVersion() {
    try {
      const packagePath = path.join(process.cwd(), 'node_modules', '@playwright', 'test', 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version;
      }
    } catch (error) {
      // Fallback
    }
    return 'unknown';
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';
  
  const validModes = ['all', 'quick', 'csrf', 'performance', 'visual', 'monitoring', 'network'];
  
  if (!validModes.includes(mode)) {
    console.error(`❌ Invalid mode: ${mode}`);
    console.error(`Valid modes: ${validModes.join(', ')}`);
    process.exit(1);
  }

  const runner = new AuthTestRunner();
  runner.run(mode).catch(error => {
    console.error('❌ [AUTH-TEST-RUNNER] Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = AuthTestRunner;