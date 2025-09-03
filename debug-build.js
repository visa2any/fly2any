#!/usr/bin/env node

console.log('🔍 Starting debug build analysis...');

// Check Node.js version
console.log('Node version:', process.version);

// Check if we can require Next.js
try {
  const next = require('next');
  console.log('✅ Next.js can be required');
} catch (error) {
  console.error('❌ Next.js require failed:', error.message);
  process.exit(1);
}

// Check React
try {
  const React = require('react');
  console.log('✅ React can be required');
} catch (error) {
  console.error('❌ React require failed:', error.message);
  process.exit(1);
}

// Check if there are circular dependencies
console.log('🔄 Checking for potential circular dependencies...');

const fs = require('fs');
const path = require('path');

function findFiles(dir, ext) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('node_modules') && !item.startsWith('.')) {
      files.push(...findFiles(fullPath, ext));
    } else if (stat.isFile() && item.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

try {
  const tsxFiles = findFiles('./src', '.tsx');
  console.log(`Found ${tsxFiles.length} .tsx files`);
  
  // Check for problematic imports
  let problemFound = false;
  for (const file of tsxFiles.slice(0, 10)) { // Check first 10 files
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('enterprise-react-runtime')) {
        console.log('⚠️  Found enterprise-react-runtime import in:', file);
        problemFound = true;
      }
      if (content.includes('react-hook-safety-layer')) {
        console.log('⚠️  Found react-hook-safety-layer import in:', file);
        problemFound = true;
      }
    } catch (error) {
      console.log('❌ Could not read file:', file);
    }
  }
  
  if (!problemFound) {
    console.log('✅ No obvious problematic imports found in first 10 files');
  }

} catch (error) {
  console.error('❌ File analysis failed:', error.message);
}

console.log('🏁 Debug analysis complete');