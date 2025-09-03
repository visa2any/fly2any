#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Emergency Dev Setup for WSL - Starting...');

// Kill any hanging npm processes
try {
  execSync('pkill -f npm', { stdio: 'ignore' });
  console.log('✅ Cleaned up hanging npm processes');
} catch (e) {
  console.log('ℹ️  No hanging npm processes found');
}

// Clear npm cache
try {
  execSync('npm cache clean --force', { stdio: 'ignore' });
  console.log('✅ NPM cache cleared');
} catch (e) {
  console.log('⚠️  Could not clear npm cache:', e.message);
}

// Create WSL-optimized npmrc if not exists
const npmrcPath = '.npmrc';
const npmrcContent = `legacy-peer-deps=true
auto-install-peers=true
cache=/tmp/npm-cache
tmp=/tmp
registry=https://registry.npmjs.org/
fund=false
audit=false
prefer-offline=false
prefer-online=true
progress=false
loglevel=error
maxsockets=1
timeout=60000`;

fs.writeFileSync(npmrcPath, npmrcContent);
console.log('✅ Created WSL-optimized .npmrc');

// Ensure cache directory exists
execSync('mkdir -p /tmp/npm-cache');

// Simplified package.json for faster install
const packageJsonBackup = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const minimalPackageJson = {
  "name": "fly2any",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.4.7",
    "react": "19.1.1",
    "react-dom": "19.1.1"
  }
};

fs.writeFileSync('package-minimal.json', JSON.stringify(minimalPackageJson, null, 2));

// Install core dependencies first
console.log('📦 Installing core dependencies...');
try {
  execSync('cp package-minimal.json package.json', { stdio: 'inherit' });
  execSync('npm install --prefer-online --no-audit --no-fund', { 
    stdio: 'inherit',
    timeout: 120000
  });
  
  console.log('✅ Core dependencies installed');
  
  // Restore full package.json and install remaining
  fs.writeFileSync('package.json', JSON.stringify(packageJsonBackup, null, 2));
  
  console.log('📦 Installing remaining dependencies...');
  execSync('npm install --prefer-online --no-audit --no-fund', { 
    stdio: 'inherit',
    timeout: 180000
  });
  
  console.log('✅ All dependencies installed successfully!');
  
} catch (error) {
  console.log('⚠️  Some dependencies may not be installed, but attempting to start dev server...');
  
  // Restore original package.json
  fs.writeFileSync('package.json', JSON.stringify(packageJsonBackup, null, 2));
}

// Try to start dev server
console.log('🎯 Starting Next.js development server...');
try {
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      PORT: '3000'
    }
  });
  
  devProcess.on('error', (err) => {
    console.error('❌ Failed to start dev server:', err);
    process.exit(1);
  });
  
  process.on('SIGTERM', () => devProcess.kill());
  process.on('SIGINT', () => devProcess.kill());
  
} catch (error) {
  console.error('❌ Failed to start development server:', error.message);
  console.log('📋 Manual steps to try:');
  console.log('1. Run: npm cache clean --force');
  console.log('2. Run: rm -rf node_modules package-lock.json');
  console.log('3. Run: npm install --legacy-peer-deps');
  console.log('4. Run: npm run dev');
  process.exit(1);
}