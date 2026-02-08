/**
 * Service Worker Asset Validator
 * 
 * This script validates that all assets referenced in sw.js actually exist
 * Run this before deploying to catch missing asset references
 */

const fs = require('fs');
const path = require('path');

// Read and parse sw.js
const swPath = path.join(__dirname, '../public/sw.js');
const swContent = fs.readFileSync(swPath, 'utf-8');

// Extract STATIC_ASSETS array
const assetsMatch = swContent.match(/const STATIC_ASSETS = \[([\s\S]*?)\];/);
if (!assetsMatch) {
  console.error('❌ Could not find STATIC_ASSETS in sw.js');
  process.exit(1);
}

// Parse asset paths
const assetPaths = assetsMatch[1]
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.startsWith("'") || line.startsWith('"'))
  .map(line => line.replace(/['"',]/g, '').trim());

console.log('📋 Checking service worker assets...\n');

let allValid = true;

for (const assetPath of assetPaths) {
  // Skip root path
  if (assetPath === '/') {
    console.log('✅', assetPath, '(root - always exists)');
    continue;
  }

  // Check if file exists in public directory
  const fullPath = path.join(__dirname, '../public', assetPath);
  
  if (fs.existsSync(fullPath)) {
    console.log('✅', assetPath);
  } else {
    console.error('❌', assetPath, '(NOT FOUND)');
    allValid = false;
  }
}

// Read and validate manifest.json
console.log('\n📋 Checking manifest.json...\n');

const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Check service worker reference
const swRef = manifest.serviceworker?.src;
if (swRef) {
  const swRefPath = path.join(__dirname, '../public', swRef);
  if (fs.existsSync(swRefPath)) {
    console.log('✅ Service worker reference:', swRef);
  } else {
    console.error('❌ Service worker reference NOT FOUND:', swRef);
    allValid = false;
  }
}

// Check icons
if (manifest.icons) {
  for (const icon of manifest.icons) {
    const iconPath = icon.src.split('?')[0]; // Remove query params
    const fullIconPath = path.join(__dirname, '../public', iconPath);
    
    if (fs.existsSync(fullIconPath)) {
      console.log('✅ Icon:', iconPath);
    } else {
      console.warn('⚠️  Icon NOT FOUND:', iconPath);
      // Icons are less critical, don't fail
    }
  }
}

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('✅ All service worker assets are valid!');
  process.exit(0);
} else {
  console.error('❌ Some assets are missing. Fix before deploying!');
  process.exit(1);
}
