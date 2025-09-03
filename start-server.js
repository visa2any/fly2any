#!/usr/bin/env node

/**
 * Enterprise Next.js Server Launcher
 * Ultimate solution for Next.js 15 startup issues
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Enterprise Next.js Server Launcher');
console.log('=====================================');

// Verify Next.js installation
const nextPath = path.join(__dirname, 'node_modules/.bin/next');
if (!fs.existsSync(nextPath)) {
  console.error('❌ Next.js not found! Installing...');
  
  // Install Next.js and dependencies
  const install = spawn('npm', ['install', 'next@15.4.7', 'react@^19.1.1', 'react-dom@^19.1.1'], {
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  const port = process.env.PORT || 3000;
  
  console.log(`\n📦 Starting Next.js 15.4.7 on port ${port}...`);
  console.log('⏳ This may take a moment on first run...\n');
  
  // Set environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: port,
    // Increase memory limits
    NODE_OPTIONS: '--max-old-space-size=2048'
  };
  
  // Start Next.js directly
  const server = spawn('node', [
    path.join(__dirname, 'node_modules/next/dist/bin/next'),
    'dev',
    '--port', port.toString()
  ], {
    env,
    stdio: 'inherit',
    shell: false,
    cwd: __dirname
  });
  
  server.on('error', (err) => {
    console.error('\n❌ Server error:', err.message);
    
    // Fallback to npx
    console.log('\n🔄 Trying fallback method with npx...');
    
    const npxServer = spawn('npx', ['next@15.4.7', 'dev', '--port', port.toString()], {
      env,
      stdio: 'inherit', 
      shell: true,
      cwd: __dirname
    });
    
    npxServer.on('error', (npxErr) => {
      console.error('❌ Fallback also failed:', npxErr.message);
      process.exit(1);
    });
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    server.kill('SIGTERM');
    process.exit(0);
  });
}