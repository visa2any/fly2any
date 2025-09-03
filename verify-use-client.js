const fs = require('fs');

console.log('🔍 Verifying "use client" directive placement...\n');

const filePath = 'src/components/GlobalMobileStyles.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Split content into lines
const lines = content.split('\n');

// Check if first line is 'use client'
const firstLine = lines[0].trim();
const isUseClientFirst = firstLine === "'use client';" || firstLine === '"use client";';

console.log(`File: ${filePath}`);
console.log(`First line: "${lines[0]}"`);
console.log(`Second line: "${lines[1]}"`);
console.log(`Third line: "${lines[2]}"`);

if (isUseClientFirst) {
  console.log('\n✅ "use client" directive is correctly positioned at the top of the file!');
} else {
  console.log('\n❌ "use client" directive is NOT at the top of the file.');
}

// Also check if there are any imports before use client
const useClientLineIndex = lines.findIndex(line => 
  line.trim() === "'use client';" || line.trim() === '"use client";'
);

const importLineIndex = lines.findIndex(line => 
  line.trim().startsWith('import ')
);

console.log(`\n"use client" found at line: ${useClientLineIndex + 1}`);
console.log(`First import found at line: ${importLineIndex + 1}`);

if (useClientLineIndex === 0) {
  console.log('\n🎉 Fix verified - "use client" is at line 1 as required!');
} else {
  console.log('\n⚠️ "use client" should be at line 1');
}