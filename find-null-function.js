const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Searching for problematic patterns that might create ()=>null...\n');

const patterns = [
  // Direct patterns
  /\(\)\s*=>\s*null/g,
  /\(\)\s*=>\s*\{[\s\S]*?return\s+null/g,
  /function\s*\(\)\s*\{\s*return\s+null/g,
  
  // Conditional patterns that might create functions
  /\?\s*\(\)\s*=>\s*null/g,
  /\|\|\s*\(\)\s*=>\s*null/g,
  /&&\s*\(\)\s*=>\s*null/g,
  /\?\?\s*\(\)\s*=>\s*null/g,
  
  // Default parameters
  /=\s*\(\)\s*=>\s*null/g,
  
  // Object properties
  /:\s*\(\)\s*=>\s*null/g,
  
  // Array elements
  /,\s*\(\)\s*=>\s*null/g,
  
  // Variable assignments
  /const\s+\w+\s*=\s*\(\)\s*=>\s*null/g,
  /let\s+\w+\s*=\s*\(\)\s*=>\s*null/g,
  /var\s+\w+\s*=\s*\(\)\s*=>\s*null/g,
];

// Search in source files
const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { 
  ignore: ['**/node_modules/**', '**/.next/**'] 
});

// Search in config files
const configFiles = glob.sync('*.{js,ts,json,mjs,cjs}', {
  ignore: ['node_modules/**', '.next/**', 'find-*.js', 'build-fix.js']
});

const allFiles = [...sourceFiles, ...configFiles];

let foundIssues = false;

allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        foundIssues = true;
        console.log(`❌ Pattern ${index + 1} found in: ${file}`);
        console.log(`   Pattern: ${pattern.source}`);
        console.log(`   Matches: ${matches.join(', ')}\n`);
        
        // Find line numbers
        const lines = content.split('\n');
        lines.forEach((line, lineIndex) => {
          if (pattern.test(line)) {
            console.log(`   Line ${lineIndex + 1}: ${line.trim()}`);
          }
        });
        console.log('');
      }
    });
    
    // Check for suspicious null-related patterns
    const suspiciousPatterns = [
      /return\s+null\s*\}/g,
      /callback:\s*null/g,
      /handler:\s*null/g,
      /listener:\s*null/g,
      /fn:\s*null/g,
      /func:\s*null/g,
      /method:\s*null/g,
    ];
    
    suspiciousPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`⚠️  Suspicious pattern in: ${file}`);
        console.log(`   Pattern: ${pattern.source}`);
        console.log(`   Found ${matches.length} occurrences\n`);
      }
    });
    
  } catch (error) {
    console.error(`Error reading ${file}: ${error.message}`);
  }
});

if (!foundIssues) {
  console.log('✅ No direct ()=>null patterns found in source code.');
  console.log('\n🔍 The issue might be:');
  console.log('1. Generated at runtime by a library');
  console.log('2. Created by a build plugin or transformation');
  console.log('3. Coming from a dependency');
  console.log('4. In Next.js internal code');
  
  console.log('\n📋 Checking dependencies for known issues...\n');
  
  // Check package.json for problematic dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const problematicDeps = [
      '@tanstack/react-query',
      'react-hook-form',
      'zustand',
      'valtio',
      'jotai',
      'recoil'
    ];
    
    const foundDeps = [];
    Object.keys({...packageJson.dependencies, ...packageJson.devDependencies}).forEach(dep => {
      if (problematicDeps.some(pd => dep.includes(pd))) {
        foundDeps.push(dep);
      }
    });
    
    if (foundDeps.length > 0) {
      console.log('⚠️  Found potentially problematic dependencies:');
      foundDeps.forEach(dep => console.log(`   - ${dep}`));
    }
  } catch (error) {
    console.error('Could not check package.json');
  }
}