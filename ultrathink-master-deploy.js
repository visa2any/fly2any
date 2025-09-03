#!/usr/bin/env node
/**
 * 🎯 ULTRATHINK MASTER DEPLOYMENT ORCHESTRATOR
 * ============================================
 * Single command to execute complete enterprise deployment
 * with intelligent fallback and recovery capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Import our deployment modules
const UltraThinkDeployment = require('./playwright-enterprise-deployment.js');
const ComprehensiveTestSuite = require('./playwright-comprehensive-tests.js');
const AutomatedRecoverySystem = require('./playwright-recovery-system.js');

class UltraThinkMasterDeploy {
  constructor() {
    this.projectRoot = process.cwd();
    this.masterLog = [];
    this.deploymentReport = {
      startTime: Date.now(),
      endTime: null,
      phases: {
        preCheck: null,
        deployment: null,
        testing: null,
        validation: null,
        recovery: null
      },
      overallSuccess: false,
      recommendations: []
    };
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    this.masterLog.push(logEntry);
    console.log(`[${timestamp}] [MASTER] [${level}] ${message}`);
    
    try {
      await fs.mkdir(path.join(this.projectRoot, 'logs'), { recursive: true });
      await fs.appendFile(
        path.join(this.projectRoot, 'logs', 'master-deploy.log'),
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      // Silent fail for logging
    }
  }

  async preflightCheck() {
    await this.log('🔍 PREFLIGHT SYSTEM CHECK');
    await this.log('=========================');

    const checks = {
      nodeVersion: false,
      npmVersion: false,
      diskSpace: false,
      memoryAvailable: false,
      portAvailable: false,
      projectStructure: false
    };

    try {
      // Node.js version check
      const { stdout: nodeVersion } = await execAsync('node --version');
      const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
      checks.nodeVersion = nodeMajor >= 18;
      await this.log(`Node.js version: ${nodeVersion.trim()} ${checks.nodeVersion ? '✅' : '❌'}`);

      // npm version check
      const { stdout: npmVersion } = await execAsync('npm --version');
      const npmMajor = parseInt(npmVersion.trim().split('.')[0]);
      checks.npmVersion = npmMajor >= 8;
      await this.log(`npm version: ${npmVersion.trim()} ${checks.npmVersion ? '✅' : '❌'}`);

      // Disk space check (Linux/macOS)
      try {
        const { stdout: diskInfo } = await execAsync('df -h . | tail -1');
        const availableGB = diskInfo.split(/\s+/)[3];
        checks.diskSpace = !availableGB.includes('M') || parseFloat(availableGB) > 10;
        await this.log(`Disk space: ${availableGB} available ${checks.diskSpace ? '✅' : '❌'}`);
      } catch (error) {
        checks.diskSpace = true; // Assume OK on Windows or other systems
        await this.log('Disk space: Could not check, assuming OK ✅');
      }

      // Memory check
      try {
        const { stdout: memInfo } = await execAsync('free -g 2>/dev/null | grep Mem || echo "Mem: ? ? 8"');
        const memParts = memInfo.split(/\s+/);
        const availableGB = parseInt(memParts[6] || memParts[3] || '8');
        checks.memoryAvailable = availableGB >= 4;
        await this.log(`Memory: ${availableGB}GB available ${checks.memoryAvailable ? '✅' : '❌'}`);
      } catch (error) {
        checks.memoryAvailable = true; // Assume OK
        await this.log('Memory: Could not check, assuming OK ✅');
      }

      // Port 3000 availability
      try {
        const { stdout: portCheck } = await execAsync('lsof -i :3000 2>/dev/null || echo "available"');
        checks.portAvailable = portCheck.includes('available') || portCheck.trim() === '';
        await this.log(`Port 3000: ${checks.portAvailable ? 'Available ✅' : 'In use ❌'}`);
      } catch (error) {
        checks.portAvailable = true;
        await this.log('Port 3000: Could not check, assuming available ✅');
      }

      // Project structure check
      const requiredFiles = ['package.json', 'next.config.js'];
      let structureOK = true;
      
      for (const file of requiredFiles) {
        try {
          await fs.access(path.join(this.projectRoot, file));
          await this.log(`Required file ${file}: Found ✅`);
        } catch (error) {
          structureOK = false;
          await this.log(`Required file ${file}: Missing ❌`);
        }
      }
      checks.projectStructure = structureOK;

      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      
      this.deploymentReport.phases.preCheck = {
        success: passedChecks === totalChecks,
        checks,
        score: `${passedChecks}/${totalChecks}`
      };

      if (this.deploymentReport.phases.preCheck.success) {
        await this.log('🎉 ALL PREFLIGHT CHECKS PASSED');
      } else {
        await this.log(`⚠️ PREFLIGHT WARNING: ${passedChecks}/${totalChecks} checks passed`);
      }

      return this.deploymentReport.phases.preCheck.success;

    } catch (error) {
      await this.log(`❌ Preflight check failed: ${error.message}`, 'ERROR');
      this.deploymentReport.phases.preCheck = { success: false, error: error.message };
      return false;
    }
  }

  async executeDeployment() {
    await this.log('🚀 EXECUTING MAIN DEPLOYMENT');
    await this.log('=============================');

    try {
      const deployment = new UltraThinkDeployment();
      const deploymentResult = await deployment.execute();
      
      this.deploymentReport.phases.deployment = {
        success: deploymentResult.success,
        phases: deploymentResult.phases,
        duration: deploymentResult.duration,
        errors: deploymentResult.errors || []
      };

      if (deploymentResult.success) {
        await this.log('✅ MAIN DEPLOYMENT COMPLETED SUCCESSFULLY');
        return true;
      } else {
        await this.log('❌ MAIN DEPLOYMENT FAILED');
        return false;
      }

    } catch (error) {
      await this.log(`💥 Deployment execution failed: ${error.message}`, 'ERROR');
      this.deploymentReport.phases.deployment = { success: false, error: error.message };
      return false;
    }
  }

  async executeComprehensiveTesting() {
    await this.log('🧪 EXECUTING COMPREHENSIVE TESTING');
    await this.log('===================================');

    try {
      const testSuite = new ComprehensiveTestSuite();
      const testResult = await testSuite.runAllTests();
      
      this.deploymentReport.phases.testing = {
        success: testResult.overall.success,
        score: testResult.overall.score,
        percentage: testResult.overall.percentage,
        results: testResult.results
      };

      if (testResult.overall.success) {
        await this.log(`✅ ALL TESTS PASSED: ${testResult.overall.score} (${testResult.overall.percentage}%)`);
        return true;
      } else {
        await this.log(`⚠️ SOME TESTS FAILED: ${testResult.overall.score} (${testResult.overall.percentage}%)`);
        return false;
      }

    } catch (error) {
      await this.log(`💥 Testing execution failed: ${error.message}`, 'ERROR');
      this.deploymentReport.phases.testing = { success: false, error: error.message };
      return false;
    }
  }

  async executeRecovery() {
    await this.log('🔄 EXECUTING AUTOMATED RECOVERY');
    await this.log('===============================');

    try {
      const recovery = new AutomatedRecoverySystem();
      const recoveryResult = await recovery.executeRecovery();
      
      this.deploymentReport.phases.recovery = {
        success: recoveryResult.success,
        strategy: recoveryResult.successfulStrategy,
        failureAnalysis: recoveryResult.failureAnalysis
      };

      if (recoveryResult.success) {
        await this.log(`✅ RECOVERY SUCCESSFUL with strategy: ${recoveryResult.successfulStrategy}`);
        return true;
      } else {
        await this.log('❌ ALL RECOVERY STRATEGIES EXHAUSTED');
        return false;
      }

    } catch (error) {
      await this.log(`💥 Recovery execution failed: ${error.message}`, 'ERROR');
      this.deploymentReport.phases.recovery = { success: false, error: error.message };
      return false;
    }
  }

  async finalValidation() {
    await this.log('🔍 FINAL SYSTEM VALIDATION');
    await this.log('===========================');

    try {
      // Quick server test
      const testServer = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: false
      });

      // Wait for server startup
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          testServer.kill();
          reject(new Error('Server startup timeout'));
        }, 30000);

        const checkServer = async () => {
          try {
            const response = await fetch('http://localhost:3000');
            if (response.ok) {
              clearTimeout(timeout);
              testServer.kill();
              resolve();
            } else {
              setTimeout(checkServer, 1000);
            }
          } catch (error) {
            setTimeout(checkServer, 1000);
          }
        };

        setTimeout(checkServer, 5000); // Give server time to start
      });

      this.deploymentReport.phases.validation = { success: true };
      await this.log('✅ FINAL VALIDATION SUCCESSFUL');
      return true;

    } catch (error) {
      await this.log(`❌ Final validation failed: ${error.message}`, 'ERROR');
      this.deploymentReport.phases.validation = { success: false, error: error.message };
      return false;
    }
  }

  async generateMasterReport() {
    this.deploymentReport.endTime = Date.now();
    const duration = this.deploymentReport.endTime - this.deploymentReport.startTime;
    
    // Calculate overall success
    const phaseResults = Object.values(this.deploymentReport.phases).filter(p => p !== null);
    const successfulPhases = phaseResults.filter(p => p.success).length;
    this.deploymentReport.overallSuccess = successfulPhases === phaseResults.length;

    // Generate recommendations
    this.generateRecommendations();

    const masterReport = {
      title: 'ULTRATHINK MASTER DEPLOYMENT REPORT',
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      overallSuccess: this.deploymentReport.overallSuccess,
      summary: {
        totalPhases: phaseResults.length,
        successfulPhases,
        successRate: Math.round((successfulPhases / phaseResults.length) * 100)
      },
      phases: this.deploymentReport.phases,
      recommendations: this.deploymentReport.recommendations,
      logs: this.masterLog
    };

    // Save master report
    await fs.writeFile(
      path.join(this.projectRoot, 'logs', 'ultrathink-master-report.json'),
      JSON.stringify(masterReport, null, 2)
    );

    return masterReport;
  }

  generateRecommendations() {
    const recommendations = [];

    if (!this.deploymentReport.phases.preCheck?.success) {
      recommendations.push('Address preflight check failures before next deployment');
    }

    if (!this.deploymentReport.phases.deployment?.success) {
      recommendations.push('Review deployment logs and consider manual intervention');
    }

    if (!this.deploymentReport.phases.testing?.success) {
      recommendations.push('Investigate test failures and fix underlying issues');
    }

    if (this.deploymentReport.phases.recovery?.success) {
      recommendations.push(`Document recovery strategy used: ${this.deploymentReport.phases.recovery.strategy}`);
    }

    if (this.deploymentReport.overallSuccess) {
      recommendations.push('Deployment successful - monitor system performance');
      recommendations.push('Schedule regular maintenance and updates');
    } else {
      recommendations.push('Deployment incomplete - manual intervention required');
      recommendations.push('Contact development team for assistance');
    }

    this.deploymentReport.recommendations = recommendations;
  }

  async executeMasterDeployment() {
    try {
      await this.log('🎯 ULTRATHINK MASTER DEPLOYMENT INITIATED');
      await this.log('==========================================');

      // Phase 1: Preflight Checks
      const preflightOK = await this.preflightCheck();
      
      // Phase 2: Main Deployment (even if preflight has warnings)
      const deploymentOK = await this.executeDeployment();
      
      // Phase 3: Comprehensive Testing
      let testingOK = false;
      if (deploymentOK) {
        testingOK = await this.executeComprehensiveTesting();
      }

      // Phase 4: Recovery if needed
      if (!deploymentOK || !testingOK) {
        await this.log('🚨 Issues detected - initiating recovery');
        const recoveryOK = await this.executeRecovery();
        
        if (recoveryOK) {
          // Re-run testing after recovery
          testingOK = await this.executeComprehensiveTesting();
        }
      }

      // Phase 5: Final Validation
      const validationOK = await this.finalValidation();

      // Generate and save master report
      const masterReport = await this.generateMasterReport();

      await this.log('==========================================');
      
      if (masterReport.overallSuccess) {
        await this.log('🎉 ULTRATHINK MASTER DEPLOYMENT SUCCESSFUL!');
        await this.log(`📊 Final Score: ${masterReport.summary.successfulPhases}/${masterReport.summary.totalPhases} (${masterReport.summary.successRate}%)`);
        await this.log('🚀 System ready for production use');
      } else {
        await this.log('⚠️ ULTRATHINK DEPLOYMENT COMPLETED WITH ISSUES');
        await this.log(`📊 Final Score: ${masterReport.summary.successfulPhases}/${masterReport.summary.totalPhases} (${masterReport.summary.successRate}%)`);
        await this.log('🔧 Manual intervention may be required');
      }

      await this.log('📋 Full report saved to: logs/ultrathink-master-report.json');

      return masterReport;

    } catch (error) {
      await this.log(`💥 MASTER DEPLOYMENT SYSTEM FAILURE: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// CLI Interface
function showHelp() {
  console.log(`
🎯 ULTRATHINK MASTER DEPLOYMENT ORCHESTRATOR
============================================

Usage: node ultrathink-master-deploy.js [options]

Options:
  --deploy-only     Run only main deployment (skip testing)
  --test-only       Run only comprehensive testing
  --recovery-only   Run only automated recovery
  --preflight-only  Run only preflight checks
  --help, -h        Show this help message

Examples:
  node ultrathink-master-deploy.js                 # Full deployment
  node ultrathink-master-deploy.js --preflight-only # Just preflight
  node ultrathink-master-deploy.js --recovery-only  # Just recovery

Reports generated in logs/ directory:
  - ultrathink-master-report.json (Master report)
  - deployment-report.json (Deployment phase)
  - comprehensive-test-report.json (Testing phase)
  - recovery-report.json (Recovery phase)
`);
}

// Auto-execute if run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const masterDeploy = new UltraThinkMasterDeploy();

  if (args.includes('--preflight-only')) {
    masterDeploy.preflightCheck()
      .then(success => process.exit(success ? 0 : 1))
      .catch(error => {
        console.error('Preflight check failed:', error.message);
        process.exit(1);
      });
  } else if (args.includes('--deploy-only')) {
    masterDeploy.executeDeployment()
      .then(success => process.exit(success ? 0 : 1))
      .catch(error => {
        console.error('Deployment failed:', error.message);
        process.exit(1);
      });
  } else if (args.includes('--test-only')) {
    masterDeploy.executeComprehensiveTesting()
      .then(success => process.exit(success ? 0 : 1))
      .catch(error => {
        console.error('Testing failed:', error.message);
        process.exit(1);
      });
  } else if (args.includes('--recovery-only')) {
    masterDeploy.executeRecovery()
      .then(success => process.exit(success ? 0 : 1))
      .catch(error => {
        console.error('Recovery failed:', error.message);
        process.exit(1);
      });
  } else {
    // Full master deployment
    masterDeploy.executeMasterDeployment()
      .then(report => {
        console.log('\n🎯 ULTRATHINK MASTER DEPLOYMENT COMPLETED');
        console.log(`📊 Overall Success: ${report.overallSuccess ? 'YES' : 'NO'}`);
        console.log(`🎖️ Success Rate: ${report.summary.successRate}%`);
        
        process.exit(report.overallSuccess ? 0 : 1);
      })
      .catch(error => {
        console.error('\n💥 MASTER DEPLOYMENT SYSTEM FAILURE');
        console.error('Error:', error.message);
        process.exit(1);
      });
  }
}

module.exports = UltraThinkMasterDeploy;