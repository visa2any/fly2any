#!/usr/bin/env node

/**
 * Enterprise Development Server Launcher
 * Optimized for large-scale Next.js applications
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Enterprise Next.js Development Server...');
console.log('📦 Optimizing memory allocation and build performance...\n');

// Set enterprise-grade memory limits and optimization flags
const env = {
  ...process.env,
  NODE_OPTIONS: [
    '--max-old-space-size=8192',     // 8GB heap memory
    '--max-semi-space-size=256',      // Larger semi-space for GC
    '--no-deprecation',                // Suppress deprecation warnings
    '--trace-warnings'                 // Trace warning origins
  ].join(' '),
  NEXT_TELEMETRY_DISABLED: '1',       // Disable telemetry for performance
  NODE_ENV: 'development',
  PORT: process.env.PORT || '3000'
};

// Launch Next.js with optimized settings
const nextProcess = spawn('npx', ['next', 'dev', '--turbo'], {
  env,
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname)
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down development server...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
  process.exit(0);
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️  Development server exited with code ${code}`);
  }
  process.exit(code || 0);
});

console.log('✅ Development server launcher initialized');
console.log('📝 Memory limit: 8GB');
console.log('⚡ Turbo mode: Enabled');
console.log('🌐 Port:', env.PORT);
console.log('\nWaiting for Next.js to start...\n');