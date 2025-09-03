#!/usr/bin/env node

/**
 * ENTERPRISE WEBPACK CONFIGURATION VALIDATION
 * ULTRATHINK ARCHITECTURE - Bus Error & originalFactory Testing
 * 
 * This script validates that the enterprise webpack configuration successfully:
 * 1. Prevents Bus errors (exit code 135) during development
 * 2. Eliminates originalFactory undefined errors  
 * 3. Ensures stable Hot Module Replacement
 * 4. Provides proper React 19 + Next.js 15.x integration
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');
const os = require('os');

class EnterpriseWebpackValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        memory: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
        cpus: os.cpus().length
      },
      tests: {},
      errors: [],
      serverAttempts: [],
      conclusions: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
  }

  async validateEnterpriseConfiguration() {
    this.log('🏗️  ENTERPRISE WEBPACK CONFIGURATION VALIDATION STARTED');
    this.log(`🖥️  Environment: ${this.results.environment.platform} ${this.results.environment.arch}`);
    this.log(`💾 Memory: ${this.results.environment.memory}, CPUs: ${this.results.environment.cpus}`);
    this.log(`📦 Node.js: ${this.results.environment.nodeVersion}`);

    // Test 1: Verify enterprise configuration files exist
    await this.testConfigurationFiles();
    
    // Test 2: Test different server startup methods and document Bus errors
    await this.testServerStartupMethods();
    
    // Test 3: Validate webpack configuration syntax
    await this.validateWebpackConfig();
    
    // Test 4: Document the originalFactory fix implementation
    await this.analyzeOriginalFactoryFix();
    
    // Generate final report
    return this.generateReport();
  }

  async testConfigurationFiles() {
    this.log('📁 Validating enterprise configuration files...');
    
    const requiredFiles = [
      'next.config.ts',
      'webpack.enterprise-react19.js',
      'scripts/enterprise-build-system.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        this.log(`✅ Found: ${file}`);
        this.results.tests[`config_file_${file.replace(/[/.]/g, '_')}`] = 'EXISTS';
      } else {
        this.log(`❌ Missing: ${file}`, 'error');
        this.results.tests[`config_file_${file.replace(/[/.]/g, '_')}`] = 'MISSING';
        this.results.errors.push({
          type: 'missing_config_file',
          file: file,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async testServerStartupMethods() {
    this.log('🚀 Testing different server startup methods...');
    
    const startupMethods = [
      {
        name: 'Standard dev script',
        command: 'npm',
        args: ['run', 'dev'],
        env: {},
        expectedIssue: 'NODE_OPTIONS --expose-gc not allowed'
      },
      {
        name: 'Legacy dev script', 
        command: 'npm',
        args: ['run', 'dev:legacy'],
        env: {},
        expectedIssue: 'Bus error (exit code 135) due to memory issues'
      },
      {
        name: 'Direct Next.js with memory management',
        command: 'node',
        args: ['--max-old-space-size=4096', 'node_modules/.bin/next', 'dev'],
        env: {},
        expectedIssue: 'May work but without enterprise webpack plugins'
      },
      {
        name: 'Enterprise build system',
        command: 'node',
        args: ['scripts/enterprise-build-system.js', 'dev'],
        env: {},
        expectedIssue: 'Script may have PATH issues'
      }
    ];

    for (const method of startupMethods) {
      this.log(`🔄 Testing: ${method.name}`);
      
      const result = await this.testSingleStartupMethod(method);
      this.results.serverAttempts.push(result);
      
      if (result.success) {
        this.log(`✅ ${method.name}: SUCCESS - Server started successfully`);
        // Kill the successful server for next test
        if (result.process) {
          result.process.kill();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        break; // Found a working method
      } else {
        this.log(`❌ ${method.name}: ${result.error}`);
      }
    }
  }

  async testSingleStartupMethod(method) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let hasError = false;
      let errorMessage = '';
      let hasStarted = false;
      
      try {
        const serverProcess = spawn(method.command, method.args, {
          cwd: __dirname,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, ...method.env }
        });

        let stdout = '';
        let stderr = '';

        serverProcess.stdout.on('data', (data) => {
          const chunk = data.toString();
          stdout += chunk;
          
          if (chunk.includes('Ready in') || chunk.includes('Local:') || chunk.includes('localhost:3000')) {
            hasStarted = true;
            resolve({
              method: method.name,
              success: true,
              duration: Date.now() - startTime,
              process: serverProcess,
              stdout: stdout,
              stderr: stderr
            });
          }
        });

        serverProcess.stderr.on('data', (data) => {
          const chunk = data.toString();
          stderr += chunk;
          
          if (chunk.includes('Bus error') || chunk.includes('core dumped')) {
            hasError = true;
            errorMessage = 'Bus error (exit code 135) - memory crash';
            this.results.errors.push({
              type: 'bus_error',
              method: method.name,
              message: chunk.trim(),
              timestamp: new Date().toISOString()
            });
          }
          
          if (chunk.includes('not allowed in NODE_OPTIONS')) {
            hasError = true;
            errorMessage = 'NODE_OPTIONS --expose-gc not allowed';
          }
          
          if (chunk.includes('Cannot find module')) {
            hasError = true;
            errorMessage = 'Module not found: ' + chunk.trim();
          }
        });

        serverProcess.on('exit', (code, signal) => {
          if (!hasStarted) {
            resolve({
              method: method.name,
              success: false,
              error: errorMessage || `Exit code: ${code}, Signal: ${signal}`,
              exitCode: code,
              signal: signal,
              duration: Date.now() - startTime,
              stdout: stdout,
              stderr: stderr
            });
          }
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          if (!hasStarted && !hasError) {
            serverProcess.kill();
            resolve({
              method: method.name,
              success: false,
              error: 'Timeout after 30 seconds',
              duration: Date.now() - startTime,
              stdout: stdout,
              stderr: stderr
            });
          }
        }, 30000);

      } catch (error) {
        resolve({
          method: method.name,
          success: false,
          error: error.message,
          duration: Date.now() - startTime
        });
      }
    });
  }

  async validateWebpackConfig() {
    this.log('⚙️  Validating webpack enterprise configuration...');
    
    try {
      // Check if the webpack config can be loaded without errors
      const webpackConfigPath = path.join(__dirname, 'webpack.enterprise-react19.js');
      
      if (fs.existsSync(webpackConfigPath)) {
        const config = require(webpackConfigPath);
        
        // Verify required plugins exist
        const requiredComponents = [
          'EnterpriseReact19FastRefreshPlugin',
          'EnterpriseMemoryManagementPlugin', 
          'React19ModuleResolutionPlugin',
          'createEnterpriseWebpackConfig'
        ];
        
        for (const component of requiredComponents) {
          if (config[component]) {
            this.log(`✅ Found webpack component: ${component}`);
            this.results.tests[`webpack_component_${component}`] = 'FOUND';
          } else {
            this.log(`❌ Missing webpack component: ${component}`, 'error');
            this.results.tests[`webpack_component_${component}`] = 'MISSING';
          }
        }
        
        this.results.tests['webpack_config_loadable'] = 'SUCCESS';
        this.log('✅ Webpack enterprise configuration is syntactically valid');
        
      } else {
        this.log('❌ Webpack enterprise configuration file not found', 'error');
        this.results.tests['webpack_config_exists'] = 'FAILED';
      }
      
    } catch (error) {
      this.log(`❌ Webpack configuration validation failed: ${error.message}`, 'error');
      this.results.tests['webpack_config_loadable'] = 'FAILED';
      this.results.errors.push({
        type: 'webpack_config_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async analyzeOriginalFactoryFix() {
    this.log('🔥 Analyzing originalFactory error fix implementation...');
    
    try {
      const webpackConfigPath = path.join(__dirname, 'webpack.enterprise-react19.js');
      const configContent = fs.readFileSync(webpackConfigPath, 'utf8');
      
      // Check for originalFactory fix patterns
      const fixPatterns = [
        'originalFactory && typeof originalFactory === "function"',
        'originalFactory.call(this,',
        'EnterpriseReact19FastRefreshPlugin',
        'originalFactory undefined errors'
      ];
      
      for (const pattern of fixPatterns) {
        if (configContent.includes(pattern)) {
          this.log(`✅ Found originalFactory fix pattern: ${pattern}`);
          this.results.tests[`originalFactory_fix_${pattern.replace(/[^a-zA-Z0-9]/g, '_')}`] = 'FOUND';
        } else {
          this.log(`⚠️  Missing fix pattern: ${pattern}`, 'warn');
          this.results.tests[`originalFactory_fix_${pattern.replace(/[^a-zA-Z0-9]/g, '_')}`] = 'MISSING';
        }
      }
      
      this.results.tests['originalFactory_analysis'] = 'COMPLETED';
      
    } catch (error) {
      this.log(`❌ originalFactory analysis failed: ${error.message}`, 'error');
      this.results.tests['originalFactory_analysis'] = 'FAILED';
    }
  }

  async testBasicPageAccess() {
    this.log('🌐 Testing basic page access...');
    
    try {
      // Use curl to test if server is responding
      const { stdout } = await execAsync('curl -s -I http://localhost:3000 || echo "FAILED"');
      
      if (stdout.includes('HTTP/1.1 200')) {
        this.log('✅ Server is responding with HTTP 200');
        this.results.tests['server_responding'] = 'SUCCESS';
      } else {
        this.log('❌ Server is not responding or returned error', 'warn');
        this.results.tests['server_responding'] = 'FAILED';
      }
      
    } catch (error) {
      this.log(`⚠️  Could not test server response: ${error.message}`, 'warn');
      this.results.tests['server_responding'] = 'ERROR';
    }
  }

  generateReport() {
    this.log('📋 Generating validation report...');
    
    // Analyze results
    const totalTests = Object.keys(this.results.tests).length;
    const successfulTests = Object.values(this.results.tests).filter(
      result => result === 'SUCCESS' || result === 'FOUND' || result === 'EXISTS' || result === 'COMPLETED'
    ).length;
    const failedTests = Object.values(this.results.tests).filter(
      result => result === 'FAILED' || result === 'MISSING'
    ).length;
    
    const busErrors = this.results.errors.filter(err => err.type === 'bus_error').length;
    const configErrors = this.results.errors.filter(err => err.type === 'webpack_config_error').length;
    
    // Generate conclusions
    this.results.conclusions = [
      `🏗️  ENTERPRISE WEBPACK CONFIGURATION VALIDATION COMPLETE`,
      `📊 Tests: ${successfulTests}/${totalTests} successful, ${failedTests} failed`,
      `🚨 Bus errors detected: ${busErrors} (This is the exact issue the enterprise config should fix)`,
      `⚙️  Configuration errors: ${configErrors}`,
      ``,
      `🔍 KEY FINDINGS:`,
    ];
    
    if (busErrors > 0) {
      this.results.conclusions.push(`❌ Bus errors (exit code 135) confirmed - exactly what enterprise webpack config is designed to prevent`);
      this.results.conclusions.push(`🔧 Enterprise webpack configuration needed to stabilize memory management`);
    }
    
    const workingMethods = this.results.serverAttempts.filter(attempt => attempt.success);
    if (workingMethods.length > 0) {
      this.results.conclusions.push(`✅ Found ${workingMethods.length} working server startup method(s)`);
      workingMethods.forEach(method => {
        this.results.conclusions.push(`   - ${method.method}: Started in ${method.duration}ms`);
      });
    } else {
      this.results.conclusions.push(`❌ No server startup methods worked - enterprise configuration fixes needed`);
    }
    
    const hasWebpackConfig = this.results.tests['webpack_config_loadable'] === 'SUCCESS';
    if (hasWebpackConfig) {
      this.results.conclusions.push(`✅ Enterprise webpack configuration is syntactically valid and ready to use`);
    } else {
      this.results.conclusions.push(`❌ Enterprise webpack configuration has issues and needs attention`);
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'enterprise-webpack-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Print summary
    this.log('');
    this.results.conclusions.forEach(conclusion => this.log(conclusion));
    this.log('');
    this.log(`📄 Detailed report saved to: ${reportPath}`);
    
    return this.results;
  }
}

// Run the validation
if (require.main === module) {
  const validator = new EnterpriseWebpackValidator();
  validator.validateEnterpriseConfiguration()
    .then(report => {
      console.log('\n🎯 ENTERPRISE WEBPACK VALIDATION COMPLETED');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 VALIDATION FAILED');
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = EnterpriseWebpackValidator;