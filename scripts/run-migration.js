#!/usr/bin/env node
/**
 * Migration Runner Wrapper
 * Loads .env.local before running the TypeScript migration
 */

const dotenv = require('dotenv');
const path = require('path');
const { exec } = require('child_process');

// Load .env.local
const envPath = path.join(__dirname, '../.env.local');
console.log('📋 Loading environment from .env.local...');
dotenv.config({ path: envPath });

// Verify POSTGRES_URL is loaded
if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL not found in environment variables!');
  console.error('   Make sure .env.local exists and contains POSTGRES_URL');
  process.exit(1);
}

console.log('✅ Environment loaded successfully');
console.log('');

// Run the TypeScript migration with environment variables passed
const child = exec('npx tsx scripts/run-flight-analytics-migration.ts', {
  cwd: path.join(__dirname, '..'),
  env: process.env,
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

child.on('exit', (code) => {
  process.exit(code || 0);
});
