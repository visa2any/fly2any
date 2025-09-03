#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to replace
const replacements = [
  // Fix React imports
  {
    pattern: /^import\s+\{([^}]+)\}\s+from\s+['"]react['"];?$/gm,
    replacement: (match, imports) => {
      // Add React to the imports if not present
      const importList = imports.split(',').map(i => i.trim());
      if (!importList.some(i => i === 'React' || i.startsWith('React as'))) {
        return `import React, {${imports}} from 'react';`;
      }
      return match;
    }
  },
  // Fix useState, useEffect etc imports that don't have React
  {
    pattern: /^import\s+React,?\s*\{([^}]*(?:useState|useEffect|useCallback|useRef|useMemo|useContext|useReducer|useLayoutEffect)[^}]*)\}\s+from\s+['"]react['"];?$/gm,
    replacement: 'import React, {$1} from \'react\';'
  },
  // Fix React.FC usage
  {
    pattern: /:\s*React\.FC(?!<)/g,
    replacement: ': React.FC'
  },
  // Fix event handlers without proper types
  {
    pattern: /onChange=\{?\((e)\)\s*=>/g,
    replacement: 'onChange={(e: React.ChangeEvent<HTMLInputElement>) =>'
  },
  {
    pattern: /onClick=\{?\((e)\)\s*=>/g,
    replacement: 'onClick={(e: React.MouseEvent) =>'
  },
  {
    pattern: /onSubmit=\{?\((e)\)\s*=>/g,
    replacement: 'onSubmit={(e: React.FormEvent) =>'
  },
  // Fix setState callbacks without types - generic pattern
  {
    pattern: /set[A-Z]\w+\((prev)\s*=>/g,
    replacement: 'set$&((prev: any) =>'
  },
  // Fix styled jsx
  {
    pattern: /<style\s+jsx>/g,
    replacement: '<style jsx={true}>'
  },
  {
    pattern: /<style\s+jsx\s+global>/g,
    replacement: '<style jsx={true} global={true}>'
  }
];

// Function to process a single file
function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if file is already processed or contains 'TYPES_FIXED' comment
    if (content.includes('// TYPES_FIXED')) {
      return;
    }

    replacements.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      if (originalContent !== content) {
        modified = true;
      }
    });

    // Additional specific fixes for common patterns
    
    // Fix Component/PureComponent declarations
    if (content.includes('extends React.Component') || content.includes('extends React.PureComponent')) {
      content = content.replace(/class\s+(\w+)\s+extends\s+React\.(Component|PureComponent)(?!<)/g, 
        'class $1 extends React.$2<any, any>');
      modified = true;
    }

    // Fix React.ReactNode usage
    content = content.replace(/:\s*ReactNode(?=[\s,;>\)])/g, ': React.ReactNode');
    if (content !== content) modified = true;

    // Fix FC with no generic
    content = content.replace(/const\s+(\w+):\s*React\.FC\s*=/g, 'const $1: React.FC<{}> =');
    if (content !== content) modified = true;

    // Add React import if missing but needed
    if (!content.includes('import React') && 
        (content.includes('React.') || content.includes('<') || content.includes('JSX'))) {
      content = `import React from 'react';\n${content}`;
      modified = true;
    }

    if (modified) {
      // Add marker comment
      if (!content.includes('// TYPES_FIXED')) {
        content = `// TYPES_FIXED\n${content}`;
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively process directory
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && 
        !['node_modules', 'dist', 'build', '.next', 'backups'].includes(item)) {
      processDirectory(itemPath);
    } else if (stat.isFile()) {
      processFile(itemPath);
    }
  });
}

// Main execution
console.log('🔧 Fixing React type errors...\n');

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  processDirectory(srcPath);
  console.log('\n✨ React type fixes complete!');
} else {
  console.error('❌ src directory not found!');
  process.exit(1);
}