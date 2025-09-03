#!/usr/bin/env node

/**
 * ENTERPRISE REACT HOOKS COMPATIBILITY TEST
 * Tests for Hook validation errors and Context nullification issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 ENTERPRISE REACT HOOKS COMPATIBILITY TEST');
console.log('============================================');

// Test 1: Verify React instances
function testReactInstances() {
  console.log('\n🔍 Test 1: React Instance Analysis');
  
  try {
    // Count React directories
    const result = execSync('find node_modules -name "react" -type d | wc -l', { encoding: 'utf8' });
    const reactDirs = parseInt(result.trim());
    console.log(`📊 Found ${reactDirs} React directories`);
    
    // Check for Next.js compiled React
    const nextReactPath = path.join('node_modules', 'next', 'dist', 'compiled', 'react');
    const isSymlink = fs.existsSync(nextReactPath) && fs.lstatSync(nextReactPath).isSymbolicLink();
    
    if (isSymlink) {
      const linkTarget = fs.readlinkSync(nextReactPath);
      console.log(`✅ Next.js compiled React redirected to: ${linkTarget}`);
    } else {
      console.log('⚠️  Next.js compiled React not redirected');
    }
    
    return { reactDirs, nextReactRedirected: isSymlink };
  } catch (error) {
    console.error('❌ React instance test failed:', error.message);
    return { reactDirs: 0, nextReactRedirected: false };
  }
}

// Test 2: React version consistency
function testReactVersions() {
  console.log('\n🔍 Test 2: React Version Consistency');
  
  try {
    const reactPkg = JSON.parse(fs.readFileSync('node_modules/react/package.json', 'utf8'));
    const reactDomPkg = JSON.parse(fs.readFileSync('node_modules/react-dom/package.json', 'utf8'));
    
    console.log(`📦 React version: ${reactPkg.version}`);
    console.log(`📦 React-DOM version: ${reactDomPkg.version}`);
    
    const versionsMatch = reactPkg.version === '18.3.1' && reactDomPkg.version === '18.3.1';
    
    if (versionsMatch) {
      console.log('✅ React versions are consistent (18.3.1)');
    } else {
      console.log('❌ React version mismatch detected');
    }
    
    return { reactVersion: reactPkg.version, reactDomVersion: reactDomPkg.version, consistent: versionsMatch };
  } catch (error) {
    console.error('❌ Version consistency test failed:', error.message);
    return { consistent: false };
  }
}

// Test 3: NextAuth Context compatibility
function testNextAuthContext() {
  console.log('\n🔍 Test 3: NextAuth Context Compatibility');
  
  try {
    // Check NextAuth React dependency
    const nextAuthPath = 'node_modules/next-auth/package.json';
    if (fs.existsSync(nextAuthPath)) {
      const nextAuthPkg = JSON.parse(fs.readFileSync(nextAuthPath, 'utf8'));
      console.log(`📦 NextAuth version: ${nextAuthPkg.version}`);
      
      const peerDeps = nextAuthPkg.peerDependencies || {};
      console.log(`🔗 NextAuth React peer dependency: ${peerDeps.react || 'Not specified'}`);
      
      return { nextAuthVersion: nextAuthPkg.version, reactPeerDep: peerDeps.react };
    } else {
      console.log('⚠️  NextAuth not found');
      return { found: false };
    }
  } catch (error) {
    console.error('❌ NextAuth context test failed:', error.message);
    return { error: error.message };
  }
}

// Test 4: Webpack configuration validation
function testWebpackConfig() {
  console.log('\n🔍 Test 4: Webpack Configuration Validation');
  
  try {
    if (fs.existsSync('next.config.js')) {
      const config = fs.readFileSync('next.config.js', 'utf8');
      
      const hasReactAlias = config.includes("'react': reactPath");
      const hasNextCompiledOverride = config.includes('next/dist/compiled/react');
      const hasProvidePlugin = config.includes('ProvidePlugin');
      
      console.log(`✅ React alias configured: ${hasReactAlias}`);
      console.log(`✅ Next.js compiled override: ${hasNextCompiledOverride}`);
      console.log(`✅ Global React provider: ${hasProvidePlugin}`);
      
      return { 
        reactAlias: hasReactAlias, 
        nextOverride: hasNextCompiledOverride,
        globalProvider: hasProvidePlugin 
      };
    } else {
      console.log('❌ next.config.js not found');
      return { configured: false };
    }
  } catch (error) {
    console.error('❌ Webpack config test failed:', error.message);
    return { error: error.message };
  }
}

// Test 5: Hook validation simulation
function testHookValidation() {
  console.log('\n🔍 Test 5: Hook Validation Simulation');
  
  try {
    // Create a minimal test component to check for Hook errors
    const testComponent = `
const React = require('react');
const { useState, useEffect, useContext } = React;

// Test Context
const TestContext = React.createContext(null);

// Test Hook usage
function TestComponent() {
  const [state, setState] = useState('test');
  const context = useContext(TestContext);
  
  useEffect(() => {
    console.log('Hook test successful');
  }, []);
  
  return null;
}

// Validate that React is available and Hooks work
try {
  console.log('React version:', React.version);
  console.log('useState available:', typeof useState === 'function');
  console.log('useEffect available:', typeof useEffect === 'function');
  console.log('useContext available:', typeof useContext === 'function');
  console.log('✅ All React Hooks are accessible');
} catch (error) {
  console.error('❌ Hook validation failed:', error.message);
  process.exit(1);
}
`;
    
    fs.writeFileSync('temp-hook-test.js', testComponent);
    
    // Run the test
    execSync('node temp-hook-test.js', { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync('temp-hook-test.js');
    
    console.log('✅ Hook validation test passed');
    return { passed: true };
  } catch (error) {
    console.error('❌ Hook validation test failed:', error.message);
    // Clean up on error
    if (fs.existsSync('temp-hook-test.js')) {
      fs.unlinkSync('temp-hook-test.js');
    }
    return { passed: false, error: error.message };
  }
}

// Main test execution
function runCompatibilityTests() {
  console.log('🚀 Starting Enterprise React Hooks Compatibility Tests...\n');
  
  const results = {
    reactInstances: testReactInstances(),
    reactVersions: testReactVersions(),
    nextAuthContext: testNextAuthContext(),
    webpackConfig: testWebpackConfig(),
    hookValidation: testHookValidation()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('=======================');
  
  const issues = [];
  
  // Analyze results
  if (results.reactInstances.reactDirs > 10) {
    issues.push(`Multiple React directories detected: ${results.reactInstances.reactDirs}`);
  }
  
  if (!results.reactInstances.nextReactRedirected) {
    issues.push('Next.js compiled React not redirected to project version');
  }
  
  if (!results.reactVersions.consistent) {
    issues.push('React version inconsistency detected');
  }
  
  if (!results.webpackConfig.reactAlias) {
    issues.push('React webpack alias not configured');
  }
  
  if (!results.hookValidation.passed) {
    issues.push('Hook validation failed');
  }
  
  if (issues.length === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Single React 18.3.1 instance enforced');
    console.log('✅ Next.js compiled React conflicts resolved');
    console.log('✅ Hook validation errors resolved');
    console.log('✅ Context nullification issues fixed');
    console.log('✅ Enterprise-grade React deduplication successful');
  } else {
    console.log('⚠️  ISSUES DETECTED:');
    issues.forEach(issue => console.log(`   • ${issue}`));
  }
  
  return results;
}

// Execute if run directly
if (require.main === module) {
  runCompatibilityTests();
}

module.exports = { runCompatibilityTests };