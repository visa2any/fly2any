#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js Development Server');
console.log('📦 Next.js Version: 15.4.7');
console.log('⚛️  React Version: 19.1.1');
console.log('🟨 TypeScript Version: 5.9.2');
console.log('--------------------------------------');

// Change to project directory
process.chdir(__dirname);

// Set environment variables for development
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Start Next.js development server
const nextDev = spawn('npx', ['next', 'dev', '--turbo'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    FORCE_COLOR: '1'
  }
});

nextDev.on('error', (err) => {
  console.error('❌ Failed to start development server:', err.message);
  process.exit(1);
});

nextDev.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  nextDev.kill('SIGTERM');
});