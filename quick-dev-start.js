#!/usr/bin/env node

/**
 * Quick Dev Start Script
 * Bypasses npm/yarn installation issues and starts Next.js directly
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Dev Start - Starting Next.js Development Server...');

// Check if we have the basics
function checkDependencies() {
  const checks = [
    { name: 'next', path: 'node_modules/next' },
    { name: 'react', path: 'node_modules/react' },
    { name: 'react-dom', path: 'node_modules/react-dom' }
  ];

  let allGood = true;
  checks.forEach(check => {
    if (fs.existsSync(check.path)) {
      console.log(`✅ ${check.name} found`);
    } else {
      console.log(`❌ ${check.name} missing`);
      allGood = false;
    }
  });

  return allGood;
}

// Try different ways to start Next.js
function startNextDev() {
  const possiblePaths = [
    'node_modules/.bin/next',
    'node_modules/next/dist/bin/next',
    'node_modules/next/cli/next-dev.js',
    'node_modules/next/bin/next'
  ];

  console.log('🔍 Looking for Next.js binary...');
  
  for (const nextPath of possiblePaths) {
    if (fs.existsSync(nextPath)) {
      console.log(`✅ Found Next.js at: ${nextPath}`);
      
      try {
        console.log('🎯 Starting development server...');
        
        const devProcess = spawn('node', [nextPath, 'dev', '--port', '3000'], {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: '3000'
          }
        });

        devProcess.on('error', (err) => {
          console.error('❌ Failed to start dev server:', err.message);
          tryFallbackMethod();
        });

        console.log('🌐 Next.js development server should be starting...');
        console.log('📍 URL: http://localhost:3000');
        console.log('⏹️  Press Ctrl+C to stop');
        
        return true;
      } catch (error) {
        console.log(`⚠️  Failed with ${nextPath}:`, error.message);
        continue;
      }
    }
  }
  
  return false;
}

// Fallback method using npx
function tryFallbackMethod() {
  console.log('🔄 Trying fallback method with npx...');
  
  try {
    const fallbackProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: '3000'
      }
    });

    fallbackProcess.on('error', (err) => {
      console.error('❌ Fallback method failed:', err.message);
      console.log('📋 Manual steps to try:');
      console.log('1. yarn install');
      console.log('2. yarn dev');
      console.log('3. npm run dev');
    });

  } catch (error) {
    console.error('❌ Could not start Next.js development server');
    console.log('📋 Try these commands manually:');
    console.log('- yarn install && yarn dev');
    console.log('- npm install && npm run dev');
  }
}

// Main execution
if (!checkDependencies()) {
  console.log('⚠️  Some dependencies are missing, but attempting to start anyway...');
}

if (!startNextDev()) {
  console.log('⚠️  Could not find Next.js binary, trying fallback...');
  tryFallbackMethod();
}