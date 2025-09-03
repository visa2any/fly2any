#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🎭 Starting Comprehensive UX Test Suite for Flight Search Glassmorphism');
console.log('🎯 Target: Premium flight search form that beats Kayak, Expedia, and Booking.com');
console.log('');

// Test configurations
const testConfigs = [
  {
    name: '🎨 Visual Experience & Glassmorphism',
    file: 'flight-search-glassmorphism.spec.js',
    description: 'Form visibility, glassmorphism effects, text contrast, animations'
  },
  {
    name: '⚡ Performance & Rendering',
    file: 'performance-glassmorphism.spec.js',
    description: 'Animation performance, backdrop-blur efficiency, frame rates'
  },
  {
    name: '♿ Accessibility & UX Excellence',
    file: 'accessibility-glassmorphism.spec.js',
    description: 'Color contrast, keyboard navigation, screen reader support'
  }
];

// Ensure test results directory exists
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Function to run a single test suite
function runTestSuite(config) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${config.name}`);
    console.log(`📋 Testing: ${config.description}`);
    console.log('─'.repeat(80));
    
    const testArgs = [
      'test',
      `tests/ux/${config.file}`,
      '--config=playwright.ux.config.js',
      '--reporter=line',
      '--workers=1'
    ];
    
    const testProcess = spawn('npx', ['playwright', ...testArgs], {
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${config.name} - PASSED`);
        resolve({ name: config.name, status: 'PASSED', code });
      } else {
        console.log(`❌ ${config.name} - FAILED (exit code: ${code})`);
        resolve({ name: config.name, status: 'FAILED', code });
      }
    });
    
    testProcess.on('error', (error) => {
      console.error(`💥 Error running ${config.name}:`, error);
      reject(error);
    });
  });
}

// Function to generate comprehensive report
function generateComprehensiveReport() {
  return new Promise((resolve) => {
    console.log('\n📊 Generating comprehensive HTML report...');
    
    const reportArgs = [
      'test',
      'tests/ux/',
      '--config=playwright.ux.config.js',
      '--reporter=html',
      '--output=test-results/ux-comprehensive-report'
    ];
    
    const reportProcess = spawn('npx', ['playwright', ...reportArgs], {
      stdio: 'inherit',
      shell: true
    });
    
    reportProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Comprehensive report generated successfully');
      } else {
        console.log('⚠️  Report generation completed with warnings');
      }
      resolve();
    });
    
    reportProcess.on('error', (error) => {
      console.log('⚠️  Report generation had issues:', error.message);
      resolve();
    });
  });
}

// Main execution function
async function runAllTests() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if development server is likely running
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('http://localhost:3000', { 
      timeout: 5000,
      signal: AbortSignal.timeout(5000)
    });
    console.log('✅ Development server is responding');
  } catch (error) {
    console.log('⚠️  Development server may not be running. Please ensure:');
    console.log('   npm run dev');
    console.log('   Then run this test suite again.');
    console.log('');
  }
  
  const results = [];
  
  try {
    // Run each test suite sequentially
    for (const config of testConfigs) {
      const result = await runTestSuite(config);
      results.push(result);
    }
    
    // Generate comprehensive report
    await generateComprehensiveReport();
    
    // Print final summary
    console.log('\n');
    console.log('🎉 UX TEST SUITE COMPLETE!');
    console.log('═'.repeat(80));
    
    results.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
    });
    
    const passedTests = results.filter(r => r.status === 'PASSED').length;
    const totalTests = results.length;
    
    console.log('');
    console.log(`📈 Results: ${passedTests}/${totalTests} test suites passed`);
    
    if (passedTests === totalTests) {
      console.log('🏆 OUTSTANDING! Your flight search form delivers premium UX!');
      console.log('🚀 Ready to dominate Kayak, Expedia, and Booking.com!');
    } else {
      console.log('🔧 Some areas need attention. Check the detailed reports.');
    }
    
    console.log('');
    console.log('📊 Detailed Reports Available:');
    console.log('  • HTML Report: test-results/ux-comprehensive-report/index.html');
    console.log('  • JSON Data: test-results/ux-results.json');
    console.log('  • JUnit XML: test-results/ux-junit.xml');
    
    console.log('');
    console.log('🎯 Key Areas Tested:');
    console.log('  ✓ Glassmorphism visual effects (backdrop-blur, transparency)');
    console.log('  ✓ White text contrast on gradient backgrounds');
    console.log('  ✓ Smooth animations and micro-interactions');
    console.log('  ✓ Premium dropdown and form component styling');
    console.log('  ✓ Mobile touch interactions and responsive design');
    console.log('  ✓ Performance optimization for complex visual effects');
    console.log('  ✓ Accessibility compliance with glassmorphism design');
    console.log('  ✓ Competitive advantage validation');
    
    // Exit with appropriate code
    process.exit(passedTests === totalTests ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Fatal error during test execution:', error);
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(1);
});

// Run the tests
runAllTests();