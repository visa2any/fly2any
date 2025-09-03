#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Specific fixes for remaining errors
const fixes = [
  {
    file: 'src/components/admin/leads/LeadTableView.tsx',
    fixes: [
      { line: 203, type: 'missing_paren', desc: 'Missing closing parenthesis' },
      { line: 477, type: 'missing_paren', desc: 'Missing closing parenthesis' }
    ]
  },
  {
    file: 'src/components/ai/AIEnhancedFlightSearch.tsx',
    fixes: [
      { line: 476, type: 'missing_paren', desc: 'Missing closing parenthesis' }
    ]
  },
  {
    file: 'src/components/ExitIntentPopup.tsx',
    fixes: [
      { line: 235, type: 'extra_brace', desc: 'Extra closing brace' }
    ]
  },
  {
    file: 'src/components/flights/CompetitiveHeroSection.tsx',
    fixes: [
      { line: 107, type: 'chained_method', desc: 'Chained method call issue' }
    ]
  },
  {
    file: 'src/components/flights/FareCustomizer.tsx',
    fixes: [
      { line: 259, type: 'chained_method', desc: 'Chained method call issue' }
    ]
  },
  {
    file: 'src/components/forms/IntelligentFormSystem.tsx',
    fixes: [
      { line: 247, type: 'chained_method', desc: 'Chained method call issue' }
    ]
  }
];

// Function to fix a specific pattern in a file
function fixFilePattern(filePath, content) {
  let modified = false;
  
  // Fix common patterns
  
  // 1. Fix useState with missing semicolon
  if (content.includes('useState<') && content.includes('({})') && !content.includes('({});')) {
    content = content.replace(/useState<([^>]+)>\(\{\}\)(?!;)/g, 'useState<$1>({});');
    modified = true;
    console.log(`  ✓ Fixed useState pattern`);
  }
  
  // 2. Fix missing closing parentheses in function calls
  const lines = content.split('\n');
  const fixedLines = lines.map((line, index) => {
    const lineNum = index + 1;
    
    // Look for common patterns that need fixing
    
    // Pattern: });\n with next line being }) or similar
    if (line.trim() === '});' && index + 1 < lines.length) {
      const nextLine = lines[index + 1];
      if (nextLine.trim() === '})' || nextLine.trim() === '}') {
        // Likely missing semicolon on next line
        return line; // Keep this line as is
      }
    }
    
    // Pattern: Missing closing paren in method chains
    if (line.includes('.slice(0,') && line.endsWith(';')) {
      // Check if this is part of a broken chain
      const prevLine = index > 0 ? lines[index - 1] : '';
      if (prevLine.includes('.filter(') || prevLine.includes('.map(')) {
        // This might be a continuation that should be joined
        console.log(`  ⚠️  Line ${lineNum}: Potential method chain issue - ${line.trim()}`);
      }
    }
    
    return line;
  });
  
  if (modified) {
    return { content: fixedLines.join('\n'), modified };
  } else {
    return { content, modified };
  }
}

// Function to fix specific files
function fixFile(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${relativePath}`);
    return false;
  }
  
  console.log(`\n📝 Processing: ${relativePath}`);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const { content: fixedContent, modified } = fixFilePattern(relativePath, content);
    
    if (modified) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${relativePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${relativePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${relativePath}:`, error.message);
    return false;
  }
}

// Manual fixes for specific syntax issues
function applyManualFixes() {
  console.log('\n🔧 Applying manual fixes for remaining syntax errors...\n');
  
  // Fix specific syntax errors that are hard to detect automatically
  const manualFixes = [
    {
      file: 'src/components/ExitIntentPopup.tsx',
      search: '      });\n      });',
      replace: '      });\n    });'
    },
    {
      file: 'src/components/hotels/HotelBookingFlow.tsx',
      search: '      });\n      });',
      replace: '      });\n    });'
    },
    {
      file: 'src/components/LeadCapture.tsx',
      search: '      });\n      });',
      replace: '      });\n    });'
    },
    {
      file: 'src/components/LeadCaptureSimple.tsx',
      search: '      });\n      });',
      replace: '      });\n    });'
    },
    {
      file: 'src/components/mobile/PremiumMobileLeadForm.tsx',
      search: '      });\n      });',
      replace: '      });\n    });'
    }
  ];
  
  manualFixes.forEach(fix => {
    const fullPath = path.join(process.cwd(), fix.file);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Applied manual fix to ${fix.file}`);
      } else {
        console.log(`ℹ️  Manual fix pattern not found in ${fix.file}`);
      }
    }
  });
}

// Main execution
console.log('🔧 Fixing final syntax errors...');

// Apply manual fixes first
applyManualFixes();

// Apply pattern-based fixes to all error files
const errorFiles = [
  'src/components/admin/leads/LeadTableView.tsx',
  'src/components/ai/AIEnhancedFlightSearch.tsx',
  'src/components/flights/CompetitiveHeroSection.tsx',
  'src/components/flights/FareCustomizer.tsx',
  'src/components/forms/IntelligentFormSystem.tsx',
  'src/components/omnichannel/NotificationSystem.tsx',
  'src/components/travel/PremiumTravelSearch.tsx'
];

let totalFixed = 0;
errorFiles.forEach(file => {
  if (fixFile(file)) {
    totalFixed++;
  }
});

console.log(`\n✨ Processing complete! Fixed ${totalFixed} files with pattern-based fixes.`);
console.log('\nℹ️  Some syntax errors might need manual review for context-specific fixes.');