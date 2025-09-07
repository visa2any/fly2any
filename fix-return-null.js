#!/usr/bin/env node

/**
 * FIX DATACLONEERROR: Replace all React component `return null` with empty elements
 */

const fs = require('fs');
const path = require('path');

// Files to fix based on our search results
const filesToFix = [
  'src/app/admin/layout.tsx',
  'src/app/account/page.tsx',
  'src/app/admin/leads/modern/page.tsx',
  'src/app/hoteis/page.tsx',
  'src/app/admin/email-templates/page.tsx'
];

console.log('🔧 FIXING DataCloneError: Replacing `return null` with React.Fragment...\n');

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace patterns that return null in React components
    // Pattern 1: Simple return null;
    content = content.replace(/return\s+null;/g, 'return <React.Fragment />; // Fixed: DataCloneError');
    
    // Pattern 2: Conditional return null
    content = content.replace(/\)\s+return\s+null;/g, ') return <React.Fragment />; // Fixed: DataCloneError');
    
    // Pattern 3: Inline conditionals that return null (in JSX context)
    content = content.replace(/\?\s*null\s*:/g, '? <React.Fragment /> :');
    content = content.replace(/:\s*null\s*\}/g, ': <React.Fragment />}');
    
    if (content !== originalContent) {
      // Check if React is imported, if not add it
      if (!content.includes("import React") && !content.includes("import * as React")) {
        // Add React import at the top of the file after 'use client' if it exists
        if (content.includes("'use client'")) {
          content = content.replace(
            /('use client'[;\s]*\n)/,
            "$1import React from 'react';\n"
          );
        } else {
          content = "import React from 'react';\n" + content;
        }
      }
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      
      // Count how many replacements were made
      const replacements = (originalContent.match(/return\s+null/g) || []).length;
      if (replacements > 0) {
        console.log(`   Replaced ${replacements} occurrences of 'return null'`);
      }
    } else {
      console.log(`⏭️  Skipped: ${file} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✨ DataCloneError fix complete!');
console.log('🚀 Now run: npm run build');