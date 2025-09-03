#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files and their specific fixes based on the error report
const fixes = {
  'src/app/admin/phone-management/contacts/page.tsx': [
    { line: 122, issue: 'missing closing paren in JSON.stringify' },
    { line: 147, issue: 'missing closing paren in JSON.stringify' },
    { line: 160, issue: 'missing closing paren in JSON.stringify' },
    { line: 183, issue: 'missing closing paren in JSON.stringify' }
  ],
  'src/app/admin/phone-management/lists/page.tsx': [
    { line: 65, issue: 'missing closing paren' }
  ],
  'src/app/flights/page.tsx': [
    { line: 230, issue: 'extra closing paren' },
    { line: 728, issue: 'extra closing brace' }
  ],
  'src/app/page-simple.tsx': [
    { line: 124, issue: 'extra closing paren' }
  ],
  'src/app/page.tsx': [
    { line: 1837, issue: 'missing argument in function call' },
    { line: 1969, issue: 'missing argument in function call' },
    { line: 2102, issue: 'missing argument in function call' },
    { line: 2198, issue: 'missing argument in function call' }
  ],
  'src/components/admin/leads/LeadTableView.tsx': [
    { line: 203, issue: 'unbalanced parentheses' },
    { line: 477, issue: 'unbalanced parentheses' }
  ],
  'src/components/ai/AIEnhancedFlightSearch.tsx': [
    { line: 476, issue: 'missing closing paren' }
  ],
  'src/components/ExitIntentPopup.tsx': [
    { line: 235, issue: 'extra closing brace' }
  ],
  'src/components/flights/CompetitiveHeroSection.tsx': [
    { line: 107, issue: 'chained method call issue' }
  ],
  'src/components/flights/FareCustomizer.tsx': [
    { line: 259, issue: 'chained method call issue' }
  ],
  'src/components/forms/IntelligentFormSystem.tsx': [
    { line: 247, issue: 'chained method call issue' }
  ],
  'src/components/hotels/HotelBookingFlow.tsx': [
    { line: 188, issue: 'extra closing brace' },
    { line: 305, issue: 'extra closing brace' }
  ],
  'src/components/LeadCapture.tsx': [
    { line: 204, issue: 'extra closing brace' },
    { line: 222, issue: 'extra closing brace' }
  ],
  'src/components/LeadCaptureSimple.tsx': [
    { line: 173, issue: 'extra closing brace' }
  ],
  'src/components/mobile/PremiumMobileLeadForm.tsx': [
    { line: 122, issue: 'extra closing brace' }
  ],
  'src/components/omnichannel/NotificationSystem.tsx': [
    { line: 165, issue: 'missing closing paren' }
  ],
  'src/components/travel/PremiumTravelSearch.tsx': [
    { line: 394, issue: 'missing closing paren' }
  ],
  'src/components/ui/brazilian-form.tsx': [
    { line: 88, issue: 'multiple syntax issues - needs manual review' }
  ]
};

function fixFile(filePath, issues) {
  console.log(`\n📝 Processing: ${filePath}`);
  
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    // Sort issues by line number in descending order to process from bottom to top
    issues.sort((a, b) => b.line - a.line);

    issues.forEach(issue => {
      const lineIndex = issue.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        let newLine = line;

        // Apply specific fixes based on the issue type
        if (issue.issue.includes('missing closing paren in JSON.stringify')) {
          // Check if line ends with } but missing )
          if (line.trim().endsWith('}') && !line.trim().endsWith('})')) {
            newLine = line.replace(/\s*$/, ')');
            console.log(`  ✓ Fixed line ${issue.line}: Added missing closing paren`);
            modified = true;
          }
        } else if (issue.issue.includes('extra closing paren')) {
          // Remove extra closing paren
          const parenCount = (line.match(/\)/g) || []).length;
          const openParenCount = (line.match(/\(/g) || []).length;
          if (parenCount > openParenCount && line.trim().endsWith('))')) {
            newLine = line.replace(/\)\s*$/, '');
            console.log(`  ✓ Fixed line ${issue.line}: Removed extra closing paren`);
            modified = true;
          }
        } else if (issue.issue.includes('extra closing brace')) {
          // Check for patterns like }); where we might have extra braces
          if (line.trim() === '});' || line.trim() === '}') {
            // Check context - might need to convert }); to });
            const prevLine = lineIndex > 0 ? lines[lineIndex - 1] : '';
            if (prevLine.includes('setState') || prevLine.includes('set')) {
              // Keep as is, likely correct
            } else {
              // Might be extra
              console.log(`  ⚠️  Line ${issue.line}: Needs manual review - possible extra brace`);
            }
          }
        } else if (issue.issue.includes('chained method call')) {
          // Fix chained method calls that might be broken
          const nextLineIndex = lineIndex + 1;
          if (nextLineIndex < lines.length) {
            const nextLine = lines[nextLineIndex];
            if (nextLine.trim().startsWith('.')) {
              // Merge with previous line
              newLine = line.replace(/;\s*$/, '') + nextLine.trim();
              lines[nextLineIndex] = ''; // Clear the next line
              console.log(`  ✓ Fixed line ${issue.line}: Fixed chained method call`);
              modified = true;
            }
          }
        } else if (issue.issue.includes('missing argument')) {
          // Check for empty function calls like someFunction()
          if (line.includes('(') && line.includes(')')) {
            const match = line.match(/(\w+)\(\s*\)/);
            if (match) {
              console.log(`  ⚠️  Line ${issue.line}: Empty function call ${match[1]}() - needs manual review`);
            }
          }
        }

        lines[lineIndex] = newLine;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No automatic fixes applied to ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing remaining syntax errors...\n');

let totalFixed = 0;
Object.entries(fixes).forEach(([file, issues]) => {
  if (fixFile(file, issues)) {
    totalFixed++;
  }
});

console.log(`\n✨ Processed ${Object.keys(fixes).length} files, fixed ${totalFixed} files`);

// Special handling for brazilian-form.tsx which has multiple issues
console.log('\n🔧 Special handling for brazilian-form.tsx...');

const brazilianFormPath = path.join(process.cwd(), 'src/components/ui/brazilian-form.tsx');
if (fs.existsSync(brazilianFormPath)) {
  let content = fs.readFileSync(brazilianFormPath, 'utf8');
  
  // Fix common patterns in brazilian-form
  // 1. Missing semicolons after const declarations
  content = content.replace(/const\s+(\w+)\s*=\s*([^;]+)(\n\s*const)/g, 'const $1 = $2;$3');
  
  // 2. Fix useState declarations
  content = content.replace(/useState<([^>]+)>\(\{\}\)\s*$/gm, 'useState<$1>({});');
  
  // 3. Fix arrow function declarations
  content = content.replace(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\(/gm, 'const $1 = ($2) => (');
  
  fs.writeFileSync(brazilianFormPath, content, 'utf8');
  console.log('✅ Applied special fixes to brazilian-form.tsx');
}

console.log('\n✅ Fix complete!');
console.log('\nℹ️  Some issues may require manual review, especially:');
console.log('  - src/app/page.tsx (argument expression errors)');
console.log('  - src/components/ui/brazilian-form.tsx (complex syntax issues)');