#!/usr/bin/env node

// Enterprise Next.js Startup Test
// Tests if Next.js can resolve react-dom/client properly

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 [ENTERPRISE TEST] Testing Next.js startup with react-dom/client resolution...');

const nextProcess = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

let output = '';
let hasError = false;
let hasSuccess = false;

nextProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log('[STDOUT]', text.trim());
  
  if (text.includes('ready') || text.includes('Ready') || text.includes('started server')) {
    hasSuccess = true;
    console.log('✅ [SUCCESS] Next.js started successfully');
    nextProcess.kill('SIGTERM');
  }
});

nextProcess.stderr.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log('[STDERR]', text.trim());
  
  if (text.includes("Can't resolve 'react-dom/client'")) {
    hasError = true;
    console.log('❌ [ERROR] react-dom/client resolution failed');
    nextProcess.kill('SIGTERM');
  }
});

nextProcess.on('close', (code) => {
  console.log('\n📊 [FINAL REPORT]');
  console.log('Exit code:', code);
  console.log('Success:', hasSuccess);
  console.log('Error:', hasError);
  
  if (hasSuccess && !hasError) {
    console.log('🎉 [ENTERPRISE SUCCESS] Next.js react-dom/client resolution is working!');
    process.exit(0);
  } else if (hasError) {
    console.log('🚨 [ENTERPRISE FAILURE] react-dom/client resolution still failing');
    process.exit(1);
  } else {
    console.log('⚠️ [ENTERPRISE WARNING] Inconclusive test result');
    process.exit(2);
  }
});

// Timeout after 45 seconds
setTimeout(() => {
  if (!hasSuccess && !hasError) {
    console.log('⏰ [TIMEOUT] Test took too long - likely hanging on some issue');
    nextProcess.kill('SIGKILL');
    process.exit(3);
  }
}, 45000);