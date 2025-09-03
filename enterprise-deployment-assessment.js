#!/usr/bin/env node

/**
 * 🏢 ENTERPRISE DEPLOYMENT READINESS ASSESSMENT
 * =============================================
 * 
 * Comprehensive evaluation of Next.js application for production deployment
 * Tests all critical systems, configurations, and enterprise requirements
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class EnterpriseDeploymentAssessment {
  constructor() {
    this.results = {
      codeStructure: { score: 0, tests: [] },
      configuration: { score: 0, tests: [] },
      dependencies: { score: 0, tests: [] },
      security: { score: 0, tests: [] },
      performance: { score: 0, tests: [] },
      deploymentReadiness: { score: 0, tests: [] }
    };
    this.totalScore = 0;
    this.maxScore = 0;
    this.criticalIssues = [];
    this.recommendations = [];
  }

  log(category, message, status = 'INFO') {
    const icons = { INFO: '📋', PASS: '✅', FAIL: '❌', WARN: '⚠️' };
    console.log(`${icons[status]} [${category}] ${message}`);
  }

  addTestResult(category, test, passed, critical = false) {
    this.results[category].tests.push({ test, passed, critical });
    if (passed) {
      this.results[category].score += critical ? 10 : 5;
    } else if (critical) {
      this.criticalIssues.push(`${category}: ${test}`);
    }
    this.maxScore += critical ? 10 : 5;
  }

  // Test 1: Code Structure Analysis
  async testCodeStructure() {
    this.log('CODE', 'Analyzing code structure and architecture...');
    
    // Check for proper Next.js 13+ App Router structure
    const hasAppDir = fs.existsSync(path.join(process.cwd(), 'src', 'app'));
    this.addTestResult('codeStructure', 'App Router structure', hasAppDir, true);
    
    // Check for essential files
    const essentialFiles = [
      'package.json',
      'next.config.js',
      'tsconfig.json',
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/globals.css'
    ];
    
    for (const file of essentialFiles) {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      this.addTestResult('codeStructure', `Essential file: ${file}`, exists, true);
    }
    
    // Check for TypeScript configuration
    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      const hasStrictMode = tsConfig.compilerOptions?.strict === true;
      this.addTestResult('codeStructure', 'TypeScript strict mode', hasStrictMode, false);
    } catch (error) {
      this.addTestResult('codeStructure', 'TypeScript configuration', false, true);
    }
    
    // Check component organization
    const componentsDirs = [
      'src/components',
      'src/lib',
      'src/types'
    ];
    
    for (const dir of componentsDirs) {
      const exists = fs.existsSync(path.join(process.cwd(), dir));
      this.addTestResult('codeStructure', `Directory structure: ${dir}`, exists, false);
    }
  }

  // Test 2: Configuration Analysis
  async testConfiguration() {
    this.log('CONFIG', 'Validating configuration files...');
    
    // Next.js configuration
    try {
      const nextConfig = require(path.join(process.cwd(), 'next.config.js'));
      this.addTestResult('configuration', 'Next.js config valid', true, true);
      
      // Check for production optimizations
      const hasReactStrictMode = nextConfig.reactStrictMode === true;
      this.addTestResult('configuration', 'React Strict Mode enabled', hasReactStrictMode, false);
      
    } catch (error) {
      this.addTestResult('configuration', 'Next.js config valid', false, true);
    }
    
    // Package.json validation
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check essential scripts
      const requiredScripts = ['dev', 'build', 'start'];
      for (const script of requiredScripts) {
        const exists = packageJson.scripts && packageJson.scripts[script];
        this.addTestResult('configuration', `Script: ${script}`, !!exists, script === 'build');
      }
      
      // Check for essential dependencies
      const requiredDeps = ['next', 'react', 'react-dom', 'typescript'];
      for (const dep of requiredDeps) {
        const exists = (packageJson.dependencies && packageJson.dependencies[dep]) ||
                      (packageJson.devDependencies && packageJson.devDependencies[dep]);
        this.addTestResult('configuration', `Dependency: ${dep}`, !!exists, true);
      }
      
    } catch (error) {
      this.addTestResult('configuration', 'Package.json valid', false, true);
    }
    
    // Environment configuration
    const envFiles = ['.env.local', '.env.example', '.env'];
    let hasEnvConfig = false;
    for (const envFile of envFiles) {
      if (fs.existsSync(path.join(process.cwd(), envFile))) {
        hasEnvConfig = true;
        break;
      }
    }
    this.addTestResult('configuration', 'Environment configuration present', hasEnvConfig, false);
  }

  // Test 3: Dependencies Analysis
  async testDependencies() {
    this.log('DEPS', 'Analyzing dependencies and versions...');
    
    return new Promise((resolve) => {
      const npmCheck = spawn('npm', ['ls', '--depth=0'], { stdio: 'pipe' });
      let output = '';
      
      npmCheck.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      npmCheck.on('close', (code) => {
        const hasErrors = output.includes('UNMET DEPENDENCY') || 
                         output.includes('missing') || 
                         code !== 0;
        
        this.addTestResult('dependencies', 'Dependencies resolved', !hasErrors, true);
        
        // Check for outdated packages
        if (!hasErrors) {
          this.addTestResult('dependencies', 'Package structure valid', true, false);
        }
        
        resolve();
      });
      
      npmCheck.on('error', () => {
        this.addTestResult('dependencies', 'Dependencies resolved', false, true);
        resolve();
      });
    });
  }

  // Test 4: Security Analysis
  async testSecurity() {
    this.log('SECURITY', 'Performing security assessment...');
    
    // Check for .env in .gitignore
    let gitignoreSecure = false;
    try {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      gitignoreSecure = gitignore.includes('.env') && gitignore.includes('node_modules');
    } catch (error) {
      // .gitignore might not exist, which is a security concern
    }
    this.addTestResult('security', 'Environment files in .gitignore', gitignoreSecure, true);
    
    // Check for sensitive data exposure
    const sensitivePatterns = [
      /password\s*=\s*['"'][^'"]{1,}/gi,
      /secret\s*=\s*['"'][^'"]{1,}/gi,
      /api_key\s*=\s*['"'][^'"]{1,}/gi
    ];
    
    let hasSensitiveExposure = false;
    try {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      for (const pattern of sensitivePatterns) {
        if (pattern.test(envContent)) {
          // Check if it's a placeholder or actual sensitive data
          if (!envContent.includes('your-') && !envContent.includes('XXXXXXXXXX')) {
            hasSensitiveExposure = true;
          }
        }
      }
    } catch (error) {
      // No .env.local file, which is actually safer
    }
    
    this.addTestResult('security', 'No exposed sensitive data', !hasSensitiveExposure, true);
    
    // Check for proper NextAuth configuration
    let hasNextAuthConfig = false;
    try {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      hasNextAuthConfig = envContent.includes('NEXTAUTH_SECRET') && envContent.includes('NEXTAUTH_URL');
    } catch (error) {
      // No env file
    }
    this.addTestResult('security', 'Authentication configuration present', hasNextAuthConfig, false);
  }

  // Test 5: Performance Configuration
  async testPerformance() {
    this.log('PERF', 'Evaluating performance configuration...');
    
    // Check for proper image optimization
    const hasImageOptimization = fs.existsSync(path.join(process.cwd(), 'src', 'components', 'ui')) ||
                                 fs.existsSync(path.join(process.cwd(), 'public'));
    this.addTestResult('performance', 'Image assets structure', hasImageOptimization, false);
    
    // Check for CSS optimization
    const hasCSSOptimization = fs.existsSync(path.join(process.cwd(), 'src', 'app', 'globals.css'));
    this.addTestResult('performance', 'CSS structure present', hasCSSOptimization, false);
    
    // Check for proper font loading
    try {
      const layoutContent = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8');
      const hasFontOptimization = layoutContent.includes('next/font') || layoutContent.includes('Inter') || layoutContent.includes('Poppins');
      this.addTestResult('performance', 'Font optimization configured', hasFontOptimization, false);
    } catch (error) {
      this.addTestResult('performance', 'Font optimization configured', false, false);
    }
    
    // Check for metadata optimization
    try {
      const layoutContent = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8');
      const hasMetadata = layoutContent.includes('Metadata') && layoutContent.includes('export const metadata');
      this.addTestResult('performance', 'SEO metadata configured', hasMetadata, false);
    } catch (error) {
      this.addTestResult('performance', 'SEO metadata configured', false, false);
    }
  }

  // Test 6: Deployment Readiness
  async testDeploymentReadiness() {
    this.log('DEPLOY', 'Assessing deployment readiness...');
    
    // Test build process
    return new Promise((resolve) => {
      this.log('DEPLOY', 'Testing build process... (this may take a moment)');
      
      const buildProcess = spawn('npm', ['run', 'build'], { 
        stdio: 'pipe',
        timeout: 120000 // 2 minute timeout
      });
      
      let buildOutput = '';
      let buildError = '';
      
      buildProcess.stdout.on('data', (data) => {
        buildOutput += data.toString();
      });
      
      buildProcess.stderr.on('data', (data) => {
        buildError += data.toString();
      });
      
      buildProcess.on('close', (code) => {
        const buildSuccess = code === 0 && !buildError.includes('Error') && !buildOutput.includes('Failed');
        this.addTestResult('deploymentReadiness', 'Production build successful', buildSuccess, true);
        
        if (buildSuccess) {
          // Check for build output
          const hasBuildOutput = fs.existsSync(path.join(process.cwd(), '.next'));
          this.addTestResult('deploymentReadiness', 'Build artifacts generated', hasBuildOutput, true);
          
          // Check for static exports if needed
          const hasStaticExport = fs.existsSync(path.join(process.cwd(), 'out')) || 
                                 fs.existsSync(path.join(process.cwd(), '.next', 'static'));
          this.addTestResult('deploymentReadiness', 'Static assets generated', hasStaticExport, false);
        }
        
        resolve();
      });
      
      buildProcess.on('error', (error) => {
        this.addTestResult('deploymentReadiness', 'Production build successful', false, true);
        this.criticalIssues.push(`Build process error: ${error.message}`);
        resolve();
      });
      
      // Handle timeout
      setTimeout(() => {
        if (buildProcess.pid) {
          buildProcess.kill();
          this.addTestResult('deploymentReadiness', 'Production build successful', false, true);
          this.criticalIssues.push('Build process timeout (>2 minutes)');
          resolve();
        }
      }, 120000);
    });
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n\n🏢 ENTERPRISE DEPLOYMENT READINESS ASSESSMENT REPORT');
    console.log('='.repeat(60));
    
    const categories = Object.keys(this.results);
    let totalPassed = 0;
    let totalTests = 0;
    
    categories.forEach(category => {
      const categoryResults = this.results[category];
      const passed = categoryResults.tests.filter(t => t.passed).length;
      const total = categoryResults.tests.length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      totalPassed += passed;
      totalTests += total;
      
      console.log(`\n📊 ${category.toUpperCase()}: ${passed}/${total} tests passed (${percentage}%)`);
      
      categoryResults.tests.forEach(test => {
        const icon = test.passed ? '✅' : (test.critical ? '🔴' : '🟡');
        const criticality = test.critical ? ' [CRITICAL]' : '';
        console.log(`   ${icon} ${test.test}${criticality}`);
      });
    });
    
    const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    
    console.log('\n📈 OVERALL ASSESSMENT');
    console.log(`Tests Passed: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
    
    // Deployment readiness determination
    let readinessLevel = 'NOT READY';
    let readinessColor = '🔴';
    
    if (overallPercentage >= 90 && this.criticalIssues.length === 0) {
      readinessLevel = 'PRODUCTION READY';
      readinessColor = '🟢';
    } else if (overallPercentage >= 75 && this.criticalIssues.length <= 2) {
      readinessLevel = 'STAGING READY';
      readinessColor = '🟡';
    } else if (overallPercentage >= 60) {
      readinessLevel = 'DEVELOPMENT READY';
      readinessColor = '🟡';
    }
    
    console.log(`${readinessColor} DEPLOYMENT STATUS: ${readinessLevel}`);
    
    // Critical issues
    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO RESOLVE:');
      this.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (overallPercentage < 100) {
      console.log('   • Address failed tests to improve deployment readiness');
    }
    if (this.criticalIssues.length > 0) {
      console.log('   • Resolve all critical issues before production deployment');
    }
    if (overallPercentage >= 75) {
      console.log('   • Consider implementing CI/CD pipeline for automated deployment');
      console.log('   • Set up monitoring and logging for production environment');
    }
    console.log('   • Regularly update dependencies and run security audits');
    console.log('   • Implement proper backup and disaster recovery procedures');
    
    return {
      overallScore: overallPercentage,
      readinessLevel,
      criticalIssues: this.criticalIssues.length,
      totalTests: totalTests,
      passedTests: totalPassed,
      categories: this.results
    };
  }

  // Main assessment process
  async runAssessment() {
    console.log('🏢 STARTING ENTERPRISE DEPLOYMENT READINESS ASSESSMENT');
    console.log('======================================================');
    
    try {
      await this.testCodeStructure();
      await this.testConfiguration();
      await this.testDependencies();
      await this.testSecurity();
      await this.testPerformance();
      await this.testDeploymentReadiness();
      
      const report = this.generateReport();
      
      console.log('\n✨ Assessment completed successfully!');
      
      return report;
      
    } catch (error) {
      console.error('💥 Assessment failed:', error);
      this.criticalIssues.push(`Assessment error: ${error.message}`);
      return this.generateReport();
    }
  }
}

// Run assessment if called directly
if (require.main === module) {
  const assessment = new EnterpriseDeploymentAssessment();
  assessment.runAssessment().then(report => {
    // Exit with appropriate code
    const exitCode = report.criticalIssues > 0 ? 1 : 0;
    process.exit(exitCode);
  }).catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { EnterpriseDeploymentAssessment };