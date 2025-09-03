#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Direct Next.js Launcher\n');

try {
  // First ensure dependencies are installed
  console.log('📦 Checking dependencies...');
  execSync('npm ls next react react-dom --depth=0', { stdio: 'ignore' });
  console.log('✅ Dependencies OK\n');
} catch (e) {
  console.log('⚠️ Installing missing dependencies...');
  execSync('npm install next@15.4.7 react@^19.1.1 react-dom@^19.1.1', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
}

const PORT = process.env.PORT || 3000;

console.log(`🌐 Starting Next.js on port ${PORT}...`);
console.log('📝 Access at: http://localhost:' + PORT);
console.log('⏳ First startup may take 30-60 seconds...\n');
console.log('Press Ctrl+C to stop\n');

// Use npx to ensure we use the correct version
try {
  execSync(`npx next@15.4.7 dev --port ${PORT}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });
} catch (error) {
  if (error.signal !== 'SIGINT') {
    console.error('\n❌ Server failed to start');
    console.error('Error:', error.message);
    process.exit(1);
  }
}