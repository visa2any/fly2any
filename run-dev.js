#!/usr/bin/env node

// Direct Next.js dev server runner for Windows compatibility
const { spawn } = require('child_process');
const path = require('path');

// Try multiple paths to find Next.js
const possiblePaths = [
  './node_modules/next/dist/bin/next',
  './node_modules/.bin/next',
  './node_modules_corrupted_backup/next/dist/bin/next',
  'next'
];

function tryRunNext(paths, index = 0) {
  if (index >= paths.length) {
    console.error('Could not find Next.js. Please install it with: npm install next');
    process.exit(1);
  }

  const nextPath = paths[index];
  console.log(`Trying to run Next.js from: ${nextPath}`);
  
  const child = spawn('node', [nextPath, 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  child.on('error', (err) => {
    console.log(`Failed with ${nextPath}, trying next option...`);
    tryRunNext(paths, index + 1);
  });

  child.on('exit', (code) => {
    if (code !== 0 && index < paths.length - 1) {
      tryRunNext(paths, index + 1);
    }
  });
}

// Also try npx as fallback
console.log('Starting Next.js development server...');
const npxChild = spawn('npx', ['next@15.4.7', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

npxChild.on('error', () => {
  console.log('npx failed, trying direct paths...');
  tryRunNext(possiblePaths);
});

npxChild.on('exit', (code) => {
  if (code !== 0) {
    tryRunNext(possiblePaths);
  }
});