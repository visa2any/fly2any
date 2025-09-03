const fs = require('fs');

try {
  const content = fs.readFileSync('src/app/page.tsx', 'utf8');

  // Extract the return statement content
  const returnMatch = content.match(/return \(([\s\S]*?)\);?\s*}?\s*$/);
  if (!returnMatch) {
    console.log('Could not find return statement');
    process.exit(1);
  }

  let jsxContent = returnMatch[1];
  let depth = 0;
  let maxDepth = 0;
  let line = 1;
  const issues = [];

  // Track opening/closing tags
  const tagStack = [];
  const lines = jsxContent.split('\n');
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const lineContent = lines[lineNum];
    
    // Find all tags in this line
    const tagRegex = /<\/?[a-zA-Z][a-zA-Z0-9-]*[^>]*>/g;
    let match;
    
    while ((match = tagRegex.exec(lineContent)) !== null) {
      const tag = match[0];
      
      // Skip self-closing tags and components
      if (tag.includes('/>')) continue;
      
      // Extract tag name
      const tagNameMatch = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
      if (!tagNameMatch) continue;
      
      const tagName = tagNameMatch[1];
      
      if (tag.startsWith('</')) {
        // Closing tag
        if (tagStack.length === 0) {
          issues.push(`Line ${lineNum + 1}: Unexpected closing tag </${tagName}>`);
        } else {
          const last = tagStack.pop();
          if (last !== tagName) {
            issues.push(`Line ${lineNum + 1}: Expected closing tag </${last}> but found </${tagName}>`);
          }
        }
        depth--;
      } else {
        // Opening tag  
        tagStack.push(tagName);
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      }
    }
  }

  // Check for unclosed tags
  if (tagStack.length > 0) {
    issues.push(`Unclosed tags: ${tagStack.join(', ')}`);
  }

  console.log(`Max nesting depth: ${maxDepth}`);
  console.log(`Final depth: ${depth}`);
  console.log(`Tags in stack: ${tagStack.length}`);

  if (issues.length > 0) {
    console.log('\nIssues found:');
    issues.forEach(issue => console.log('- ' + issue));
  } else {
    console.log('\nNo JSX structure issues found');
  }

  // Additional check for common syntax issues
  console.log('\nChecking for common JSX syntax issues...');
  
  // Check for unclosed parentheses/braces
  const openParens = (jsxContent.match(/\(/g) || []).length;
  const closeParens = (jsxContent.match(/\)/g) || []).length;
  const openBraces = (jsxContent.match(/\{/g) || []).length;
  const closeBraces = (jsxContent.match(/\}/g) || []).length;
  
  console.log(`Parentheses: ${openParens} open, ${closeParens} close`);
  console.log(`Braces: ${openBraces} open, ${closeBraces} close`);
  
  if (openParens !== closeParens) {
    console.log('❌ Mismatched parentheses');
  }
  if (openBraces !== closeBraces) {
    console.log('❌ Mismatched braces');
  }
  
} catch (error) {
  console.error('Error reading file:', error.message);
}