#!/usr/bin/env node

// Emergency Next.js Direct Test - Bypass all npm scripts
// Direct Next.js test to isolate react-dom/client issue

const { spawn } = require('child_process');

console.log('🚨 [EMERGENCY TEST] Direct Next.js execution test...');

// Test 1: Direct node resolution
console.log('\n1️⃣ Testing direct Node.js module resolution:');
try {
  const reactDomClient = require('react-dom/client');
  console.log('✅ react-dom/client:', Object.keys(reactDomClient));
} catch (e) {
  console.log('❌ react-dom/client resolution failed:', e.message);
}

// Test 2: Direct Next.js binary
console.log('\n2️⃣ Testing direct Next.js binary execution:');
const nextBin = require.resolve('next/dist/bin/next');
console.log('Next.js binary path:', nextBin);

// Test 3: Minimal Next.js dev start
console.log('\n3️⃣ Starting minimal Next.js dev server:');

const nextProcess = spawn('node', [nextBin, 'dev'], {
  cwd: process.cwd(),
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

let startTime = Date.now();
let serverReady = false;

nextProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('[NEXT]', output.trim());
  
  if (output.includes('ready') || output.includes('Ready') || output.includes('started server on')) {
    serverReady = true;
    console.log('✅ [SUCCESS] Next.js server started successfully');
    console.log(`⏱️ Startup time: ${Date.now() - startTime}ms`);
    nextProcess.kill('SIGTERM');
  }
});

nextProcess.stderr.on('data', (data) => {
  const output = data.toString();
  console.log('[ERROR]', output.trim());
  
  if (output.includes("Can't resolve 'react-dom/client'")) {
    console.log('❌ [CRITICAL] react-dom/client resolution still failing');
    nextProcess.kill('SIGTERM');
  }
});

nextProcess.on('close', (code) => {
  console.log('\n📊 [EMERGENCY REPORT]');
  console.log('Server ready:', serverReady);
  console.log('Exit code:', code);
  console.log('Total time:', Date.now() - startTime, 'ms');
  
  if (serverReady) {
    console.log('🎉 [EMERGENCY SUCCESS] Direct Next.js execution works!');
  } else {
    console.log('🚨 [EMERGENCY FAILURE] Issue persists in direct execution');
  }
});

// Emergency timeout
setTimeout(() => {
  if (!serverReady) {
    console.log('⏰ [EMERGENCY TIMEOUT] Killing Next.js process');
    nextProcess.kill('SIGKILL');
  }
}, 30000);