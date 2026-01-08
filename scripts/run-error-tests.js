#!/usr/bin/env node

/**
 * Error Test Runner
 * 
 * This script runs all error-related tests and provides a summary report.
 * It's part of the Phase 2 error handling improvements.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ERROR_TEST_PATTERNS = [
  '**/*error*.test.*',
  '**/*Error*.test.*',
  '**/*chaos*.test.*',
  '**/*ErrorBoundary*.test.*',
];

const JEST_CONFIG = path.join(__dirname, '..', 'jest.config.js');

function runTests(pattern) {
  console.log(`\n🔍 Running tests matching: ${pattern}`);
  try {
    const command = `npx jest --config=${JEST_CONFIG} --testPathPattern="${pattern}" --passWithNoTests`;
    const output = execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 ERROR TESTING REPORT');
  console.log('='.repeat(80));

  let totalPassed = 0;
  let totalFailed = 0;

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.pattern}`);
    console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (result.success) {
      totalPassed++;
    } else {
      totalFailed++;
      
      // Extract failure summary
      const lines = result.output.split('\n');
      const failureLines = lines.filter(line => 
        line.includes('FAIL') || 
        line.includes('✕') || 
        line.includes('×') ||
        line.includes('Error:')
      ).slice(0, 5);
      
      if (failureLines.length > 0) {
        console.log('   Failures:');
        failureLines.forEach(line => console.log(`     ${line.trim()}`));
      }
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📈 SUMMARY: ${totalPassed} passed, ${totalFailed} failed`);
  console.log('='.repeat(80));

  return totalFailed === 0;
}

async function main() {
  console.log('🚀 Starting Error Test Suite Runner');
  console.log('📁 Patterns:', ERROR_TEST_PATTERNS.join(', '));

  const results = [];

  for (const pattern of ERROR_TEST_PATTERNS) {
    const result = runTests(pattern);
    results.push({
      pattern,
      success: result.success,
      output: result.output,
    });
  }

  const allPassed = generateReport(results);

  // Write detailed report to file
  const reportDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `error-test-report-${Date.now()}.json`);
  const detailedReport = {
    timestamp: new Date().toISOString(),
    patterns: ERROR_TEST_PATTERNS,
    results: results.map(r => ({
      pattern: r.pattern,
      success: r.success,
      output: r.output,
    })),
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
  };

  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  if (!allPassed) {
    console.error('\n❌ Some error tests failed. Please review the failures above.');
    process.exit(1);
  }

  console.log('\n✅ All error tests passed!');
  process.exit(0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('🚨 Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, generateReport };