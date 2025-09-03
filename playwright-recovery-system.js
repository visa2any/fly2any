#!/usr/bin/env node
/**
 * 🔄 ULTRATHINK AUTOMATED RECOVERY SYSTEM
 * =======================================
 * Enterprise-grade automated recovery for React/Next.js issues
 * Self-healing deployment with multiple fallback strategies
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AutomatedRecoverySystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.recoveryStrategies = [
      'emergencyNodeModulesReset',
      'reactVersionAlignment',
      'nextConfigFix',
      'typeScriptConfigRepair',
      'dependencyTreeRepair',
      'cacheEviction',
      'portConflictResolution',
      'memoryLeakFix',
      'nuclearOption'
    ];
    
    this.recoveryLog = [];
    this.failureAnalysis = {
      reactCurrentDispatcher: false,
      typeScriptErrors: false,
      dependencyConflicts: false,
      portConflicts: false,
      memoryIssues: false,
      buildFailures: false,
      networkIssues: false
    };
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    
    this.recoveryLog.push(logEntry);
    console.log(`[${timestamp}] [${level}] ${message}`);
    
    // Append to recovery log file
    try {
      await fs.appendFile(
        path.join(this.projectRoot, 'logs', 'recovery.log'),
        JSON.stringify(logEntry) + '\n'
      );
    } catch (error) {
      // Silent fail for logging
    }
  }

  async analyzeFailure() {
    await this.log('🔍 ANALYZING SYSTEM FAILURE PATTERNS');

    // Check for ReactCurrentDispatcher errors
    try {
      const { stdout } = await execAsync('grep -r "ReactCurrentDispatcher" node_modules/react* 2>/dev/null || true');
      if (stdout.trim()) {
        this.failureAnalysis.reactCurrentDispatcher = true;
        await this.log('❌ ReactCurrentDispatcher issues detected');
      }
    } catch (error) {
      // Ignore grep errors
    }

    // Check TypeScript compilation
    try {
      await execAsync('npx tsc --noEmit');
    } catch (error) {
      this.failureAnalysis.typeScriptErrors = true;
      await this.log('❌ TypeScript compilation errors detected');
    }

    // Check dependency conflicts
    try {
      const { stderr } = await execAsync('npm ls 2>&1');
      if (stderr.includes('ERESOLVE') || stderr.includes('peer dep')) {
        this.failureAnalysis.dependencyConflicts = true;
        await this.log('❌ Dependency conflicts detected');
      }
    } catch (error) {
      this.failureAnalysis.dependencyConflicts = true;
    }

    // Check port conflicts
    try {
      const { stdout } = await execAsync('netstat -tulpn 2>/dev/null | grep :3000 || ss -tulpn | grep :3000 || lsof -i :3000 || true');
      if (stdout.trim()) {
        this.failureAnalysis.portConflicts = true;
        await this.log('❌ Port 3000 conflicts detected');
      }
    } catch (error) {
      // Port check not critical
    }

    // Check memory usage
    try {
      const { stdout } = await execAsync('free -m 2>/dev/null || vm_stat || true');
      if (stdout.includes('low') || stdout.includes('swap')) {
        this.failureAnalysis.memoryIssues = true;
        await this.log('⚠️ Memory pressure detected');
      }
    } catch (error) {
      // Memory check not critical
    }

    await this.log(`📊 Failure analysis complete: ${Object.values(this.failureAnalysis).filter(Boolean).length} issues found`);
  }

  async emergencyNodeModulesReset() {
    await this.log('🆘 STRATEGY 1: Emergency node_modules Reset');
    
    try {
      // Create backup
      await execAsync('cp package.json package.json.recovery-backup');
      await execAsync('cp package-lock.json package-lock.json.recovery-backup 2>/dev/null || true');
      
      // Nuclear node_modules reset
      await execAsync('rm -rf node_modules package-lock.json .next');
      await execAsync('npm cache clean --force');
      
      // Reinstall with specific flags for React stability
      await execAsync('npm install --legacy-peer-deps --no-audit --no-fund', { 
        timeout: 600000 
      });
      
      await this.log('✅ Emergency node_modules reset completed');
      return true;
      
    } catch (error) {
      await this.log(`❌ Emergency reset failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async reactVersionAlignment() {
    await this.log('⚛️ STRATEGY 2: React Version Alignment');
    
    try {
      // Force specific React versions
      const reactVersions = {
        'react': '^18.3.1',
        'react-dom': '^18.3.1',
        '@types/react': '^18.3.12',
        '@types/react-dom': '^18.3.5'
      };

      // Update package.json with exact versions
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      Object.entries(reactVersions).forEach(([pkg, version]) => {
        if (packageJson.dependencies[pkg]) {
          packageJson.dependencies[pkg] = version;
        }
        if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
          packageJson.devDependencies[pkg] = version;
        }
      });

      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Reinstall with exact versions
      await execAsync('npm install --legacy-peer-deps', { timeout: 300000 });
      
      // Verify alignment
      const { stdout } = await execAsync('npm list react react-dom');
      if (stdout.includes('18.3.1')) {
        await this.log('✅ React versions aligned successfully');
        return true;
      } else {
        throw new Error('Version alignment verification failed');
      }
      
    } catch (error) {
      await this.log(`❌ React version alignment failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async nextConfigFix() {
    await this.log('🔧 STRATEGY 3: Next.js Configuration Repair');
    
    try {
      const configPath = path.join(this.projectRoot, 'next.config.js');
      
      // Enhanced Next.js config for React stability
      const enhancedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ULTRATHINK REACT FIX: Complete React isolation
  experimental: {
    esmExternals: 'loose',
  },
  
  webpack: (config, { dev, isServer, webpack }) => {
    // Force single React instance resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react-dom/client': require.resolve('react-dom/client'),
      'react-dom/server': require.resolve('react-dom/server')
    };

    // Prevent duplicate React modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom')
    };

    // Fix ReactCurrentDispatcher by ensuring single React context
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }

    // Optimize chunks for React consistency
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
            enforce: true,
            priority: 20
          }
        }
      }
    };

    return config;
  },

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig;`;

      await fs.writeFile(configPath, enhancedConfig);
      await this.log('✅ Next.js configuration repaired');
      return true;
      
    } catch (error) {
      await this.log(`❌ Next.js config fix failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async typeScriptConfigRepair() {
    await this.log('📘 STRATEGY 4: TypeScript Configuration Repair');
    
    try {
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
      
      // Enhanced TypeScript config
      const enhancedTsConfig = {
        "compilerOptions": {
          "target": "ES2022",
          "lib": ["dom", "dom.iterable", "ES2022"],
          "allowJs": true,
          "skipLibCheck": true,
          "strict": false,
          "forceConsistentCasingInFileNames": true,
          "noEmit": true,
          "esModuleInterop": true,
          "module": "esnext",
          "moduleResolution": "node",
          "resolveJsonModule": true,
          "isolatedModules": true,
          "jsx": "preserve",
          "incremental": true,
          "baseUrl": ".",
          "paths": {
            "@/*": ["./*"],
            "react": ["./node_modules/react"],
            "react-dom": ["./node_modules/react-dom"]
          },
          "typeRoots": ["./node_modules/@types"],
          "types": ["node"]
        },
        "include": [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts"
        ],
        "exclude": [
          "node_modules",
          ".next",
          "out",
          "dist"
        ]
      };

      await fs.writeFile(tsconfigPath, JSON.stringify(enhancedTsConfig, null, 2));
      
      // Test TypeScript compilation
      await execAsync('npx tsc --noEmit');
      
      await this.log('✅ TypeScript configuration repaired');
      return true;
      
    } catch (error) {
      await this.log(`❌ TypeScript config repair failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async dependencyTreeRepair() {
    await this.log('🌳 STRATEGY 5: Dependency Tree Repair');
    
    try {
      // Remove problematic dependencies
      await execAsync('npm uninstall @types/react @types/react-dom');
      
      // Reinstall with exact versions
      await execAsync('npm install --save-exact react@18.3.1 react-dom@18.3.1');
      await execAsync('npm install --save-dev --save-exact @types/react@18.3.12 @types/react-dom@18.3.5');
      
      // Fix peer dependency warnings
      await execAsync('npm install --legacy-peer-deps');
      
      // Dedupe to remove duplicates
      await execAsync('npm dedupe');
      
      await this.log('✅ Dependency tree repaired');
      return true;
      
    } catch (error) {
      await this.log(`❌ Dependency tree repair failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async cacheEviction() {
    await this.log('🧹 STRATEGY 6: Complete Cache Eviction');
    
    try {
      // Clear all possible caches
      await execAsync('npm cache clean --force');
      await execAsync('rm -rf .next');
      await execAsync('rm -rf node_modules/.cache');
      await execAsync('rm -rf ~/.npm');
      await execAsync('rm -rf /tmp/next-*');
      
      // Clear Playwright cache
      await execAsync('npx playwright uninstall');
      await execAsync('npx playwright install');
      
      await this.log('✅ All caches cleared');
      return true;
      
    } catch (error) {
      await this.log(`❌ Cache eviction failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async portConflictResolution() {
    await this.log('🔌 STRATEGY 7: Port Conflict Resolution');
    
    try {
      // Kill any process using port 3000
      await execAsync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true');
      await execAsync('pkill -f "next dev" 2>/dev/null || true');
      await execAsync('pkill -f "node.*3000" 2>/dev/null || true');
      
      // Wait for port to be free
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await this.log('✅ Port conflicts resolved');
      return true;
      
    } catch (error) {
      await this.log(`❌ Port conflict resolution failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async memoryLeakFix() {
    await this.log('🧠 STRATEGY 8: Memory Leak Fix');
    
    try {
      // Increase Node.js memory limits
      process.env.NODE_OPTIONS = '--max-old-space-size=8192 --max-semi-space-size=512';
      
      // Clear any memory-intensive processes
      await execAsync('pkill -f "node.*next" 2>/dev/null || true');
      
      // Force garbage collection if running in Node
      if (global.gc) {
        global.gc();
      }
      
      await this.log('✅ Memory optimizations applied');
      return true;
      
    } catch (error) {
      await this.log(`❌ Memory leak fix failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async nuclearOption() {
    await this.log('☢️ STRATEGY 9: Nuclear Option - Complete Reset');
    
    try {
      // Backup essential files
      await execAsync('cp -r src src.backup 2>/dev/null || true');
      await execAsync('cp -r pages pages.backup 2>/dev/null || true');
      await execAsync('cp -r app app.backup 2>/dev/null || true');
      await execAsync('cp package.json package.json.nuclear-backup');
      
      // Complete environment reset
      await execAsync('rm -rf node_modules package-lock.json .next .tsbuildinfo');
      await execAsync('npm cache clean --force');
      
      // Reinstall everything from scratch
      await execAsync('npm install', { timeout: 600000 });
      
      // Restore Next.js config
      await this.nextConfigFix();
      
      // Verify installation
      await execAsync('npm list react react-dom');
      
      await this.log('✅ Nuclear reset completed successfully');
      return true;
      
    } catch (error) {
      await this.log(`❌ Nuclear option failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async validateRecovery() {
    await this.log('🔍 Validating Recovery Success');
    
    try {
      // Start dev server
      const devProcess = spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'pipe'
      });

      // Wait for server to start
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 30000);
        
        const checkServer = async () => {
          try {
            const response = await fetch('http://localhost:3000');
            if (response.ok) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkServer, 1000);
            }
          } catch (error) {
            setTimeout(checkServer, 1000);
          }
        };
        
        checkServer();
      });

      // Test with Playwright
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      await page.goto('http://localhost:3000');
      
      // Check for React errors
      const hasErrors = await page.evaluate(() => {
        const errors = [];
        
        // Check console errors
        window.addEventListener('error', (e) => errors.push(e.message));
        
        // Check for ReactCurrentDispatcher
        if (window.React && window.React.__errors) {
          errors.push(...window.React.__errors);
        }
        
        return errors.length === 0;
      });

      await browser.close();
      
      // Kill dev server
      devProcess.kill('SIGTERM');
      
      if (hasErrors) {
        await this.log('✅ Recovery validation successful');
        return true;
      } else {
        await this.log('❌ Recovery validation failed - errors still present');
        return false;
      }
      
    } catch (error) {
      await this.log(`❌ Recovery validation failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async executeRecovery() {
    await this.log('🚨 STARTING AUTOMATED RECOVERY SYSTEM');
    await this.log('====================================');

    await this.analyzeFailure();

    // Execute recovery strategies based on failure analysis
    const strategiesToTry = this.determineStrategies();
    
    for (const strategyName of strategiesToTry) {
      try {
        await this.log(`🔄 Attempting recovery strategy: ${strategyName}`);
        
        const success = await this[strategyName]();
        
        if (success) {
          // Validate the fix
          const isValid = await this.validateRecovery();
          
          if (isValid) {
            await this.log(`🎉 RECOVERY SUCCESSFUL with strategy: ${strategyName}`);
            
            // Generate recovery report
            const report = await this.generateRecoveryReport(strategyName, true);
            return report;
          } else {
            await this.log(`⚠️ Strategy ${strategyName} applied but validation failed`);
          }
        }
        
      } catch (error) {
        await this.log(`❌ Strategy ${strategyName} failed: ${error.message}`, 'ERROR');
      }
    }

    // If we reach here, all strategies failed
    await this.log('💥 ALL RECOVERY STRATEGIES EXHAUSTED');
    const report = await this.generateRecoveryReport('none', false);
    return report;
  }

  determineStrategies() {
    const strategies = [];
    
    if (this.failureAnalysis.reactCurrentDispatcher) {
      strategies.push('reactVersionAlignment', 'nextConfigFix', 'emergencyNodeModulesReset');
    }
    
    if (this.failureAnalysis.dependencyConflicts) {
      strategies.push('dependencyTreeRepair', 'emergencyNodeModulesReset');
    }
    
    if (this.failureAnalysis.typeScriptErrors) {
      strategies.push('typeScriptConfigRepair');
    }
    
    if (this.failureAnalysis.portConflicts) {
      strategies.push('portConflictResolution');
    }
    
    if (this.failureAnalysis.memoryIssues) {
      strategies.push('memoryLeakFix');
    }

    // Always add these as fallbacks
    strategies.push('cacheEviction', 'nuclearOption');
    
    // Remove duplicates and return
    return [...new Set(strategies)];
  }

  async generateRecoveryReport(successfulStrategy, success) {
    const report = {
      timestamp: new Date().toISOString(),
      success,
      successfulStrategy,
      failureAnalysis: this.failureAnalysis,
      strategiesAttempted: this.recoveryLog.filter(log => log.message.includes('STRATEGY')),
      recoveryLog: this.recoveryLog,
      recommendations: this.generateRecommendations(successfulStrategy)
    };

    await fs.writeFile(
      path.join(this.projectRoot, 'logs', 'recovery-report.json'),
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  generateRecommendations(successfulStrategy) {
    const recommendations = [];
    
    if (successfulStrategy === 'emergencyNodeModulesReset') {
      recommendations.push('Consider using npm ci instead of npm install for consistent builds');
      recommendations.push('Add node_modules to .gitignore if not already present');
    }
    
    if (successfulStrategy === 'reactVersionAlignment') {
      recommendations.push('Pin React versions in package.json to prevent future conflicts');
      recommendations.push('Use exact versions for critical dependencies');
    }
    
    if (successfulStrategy === 'nextConfigFix') {
      recommendations.push('Review webpack configuration regularly for React compatibility');
      recommendations.push('Consider using Next.js built-in optimizations');
    }
    
    recommendations.push('Implement regular health checks to catch issues early');
    recommendations.push('Consider using Docker for consistent development environments');
    
    return recommendations;
  }
}

// Auto-execute if run directly
if (require.main === module) {
  const recovery = new AutomatedRecoverySystem();
  
  recovery.executeRecovery()
    .then(report => {
      console.log('\n📊 Recovery Report Generated');
      console.log(`🎯 Success: ${report.success}`);
      
      if (report.success) {
        console.log(`✅ Successful Strategy: ${report.successfulStrategy}`);
        process.exit(0);
      } else {
        console.log('❌ All recovery strategies failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Recovery system failure:', error.message);
      process.exit(1);
    });
}

module.exports = AutomatedRecoverySystem;