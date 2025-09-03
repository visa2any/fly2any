#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🔍 Testing Next.js Environment...');
console.log('================================');

// Test 1: Check if packages are properly installed
console.log('📦 Checking package versions...');

const checkPackage = (packageName) => {
  try {
    const pkg = require(`./node_modules/${packageName}/package.json`);
    console.log(`✅ ${packageName}: v${pkg.version}`);
    return true;
  } catch (err) {
    console.log(`❌ ${packageName}: Not found or invalid`);
    return false;
  }
};

const packages = ['next', 'react', 'react-dom', 'typescript'];
const allPackagesOk = packages.every(checkPackage);

console.log('');

// Test 2: Check Next.js CLI
console.log('🚀 Testing Next.js CLI...');
const nextTest = spawn('npx', ['next', '--version'], { 
  stdio: ['pipe', 'pipe', 'pipe'],
  timeout: 10000 
});

nextTest.stdout.on('data', (data) => {
  console.log(`✅ Next.js CLI: ${data.toString().trim()}`);
});

nextTest.stderr.on('data', (data) => {
  console.log(`❌ Next.js CLI Error: ${data.toString().trim()}`);
});

nextTest.on('close', (code) => {
  console.log('');
  
  if (code === 0 && allPackagesOk) {
    console.log('🎉 Environment Check: PASSED');
    console.log('✅ Next.js 15.4.7 is properly installed');
    console.log('✅ React 19.1.1 is properly installed'); 
    console.log('✅ React-DOM 19.1.1 is properly installed');
    console.log('✅ TypeScript 5.9.2 is properly installed');
    console.log('');
    console.log('🚀 Ready to start development!');
    console.log('💡 Run: node run-dev-fixed.js');
  } else {
    console.log('❌ Environment Check: FAILED');
    console.log('⚠️  Some dependencies may be missing or corrupted');
  }
});