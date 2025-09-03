#!/usr/bin/env node

/**
 * Emergency Next.js Development Server Launcher
 * For when Next.js installation is corrupted
 */

console.log('🚀 Starting emergency Next.js development server...');
console.log('⚠️  Note: Next.js installation is corrupted. This is a fallback solution.');

// Try to load Next.js directly from npm cache or use npx
const { spawn } = require('child_process');

// Method 1: Try using npx with specific version
console.log('\n📦 Attempting to run Next.js 15.4.7 via npx...');
console.log('This may take a moment on first run...\n');

const npx = spawn('npx', ['next@15.4.7', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

npx.on('error', (err) => {
  console.error('\n❌ Failed to start with npx:', err.message);
  console.log('\n🔧 Alternative solutions:');
  console.log('1. Clear npm cache: npm cache clean --force');
  console.log('2. Install globally: npm install -g next@15.4.7');
  console.log('3. Use yarn: yarn add next@15.4.7');
  console.log('4. Manual download: curl -o next.tgz https://registry.npmjs.org/next/-/next-15.4.7.tgz');
});

npx.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Next.js exited with code ${code}`);
    console.log('\n📝 Please try:');
    console.log('1. Check if React is installed: npm ls react');
    console.log('2. Clear node_modules: rm -rf node_modules');
    console.log('3. Fresh install: npm install');
  }
});