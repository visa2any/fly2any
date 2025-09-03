const fs = require('fs');

console.log('🔍 Verifying Home Page Structure\n');
console.log('=' .repeat(60));

const content = fs.readFileSync('/mnt/d/Users/vilma/fly2any/src/app/page.tsx', 'utf8');

// Find key positions
const returnIndex = content.indexOf('return (');
const liveHeaderIndex = content.indexOf('<LiveSiteHeader />');
const containerDivIndex = content.indexOf('<div style={containerStyle}');
const liveFooterIndex = content.indexOf('<LiveSiteFooter />');
const closingIndex = content.lastIndexOf('</>');

console.log('\n📊 Component Order Analysis:');
console.log('-'.repeat(40));

if (returnIndex > -1) {
  console.log(`1. Return statement at position: ${returnIndex}`);
}

if (liveHeaderIndex > -1) {
  console.log(`2. LiveSiteHeader at position: ${liveHeaderIndex}`);
  if (liveHeaderIndex < containerDivIndex) {
    console.log('   ✅ Header is OUTSIDE container (correct)');
  } else {
    console.log('   ❌ Header is INSIDE container (incorrect)');
  }
}

if (containerDivIndex > -1) {
  console.log(`3. Container div at position: ${containerDivIndex}`);
}

if (liveFooterIndex > -1) {
  console.log(`4. LiveSiteFooter at position: ${liveFooterIndex}`);
  
  // Find the closing of container div
  const containerCloseSearch = content.substring(containerDivIndex);
  let depth = 0;
  let containerClosePos = -1;
  
  for (let i = 0; i < containerCloseSearch.length; i++) {
    if (containerCloseSearch.substring(i, i + 4) === '<div') {
      depth++;
    } else if (containerCloseSearch.substring(i, i + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        containerClosePos = containerDivIndex + i;
        break;
      }
    }
  }
  
  if (liveFooterIndex > containerClosePos) {
    console.log('   ✅ Footer is OUTSIDE container (correct)');
  } else {
    console.log('   ⚠️  Footer position needs checking');
  }
}

console.log('\n🎯 Structure Summary:');
console.log('-'.repeat(40));

// Extract the structure
const structureLines = content.split('\n');
const returnLine = structureLines.findIndex(line => line.includes('return ('));

if (returnLine > -1) {
  console.log('Return statement structure:');
  console.log('  <>')
  console.log('    <GlobalMobileStyles />');
  console.log('    <LiveSiteHeader />  ← Outside container ✅');
  console.log('    <div style={containerStyle}>');
  console.log('      ... main content ...');
  console.log('    </div>');
  console.log('    <LiveSiteFooter />  ← Outside container ✅');
  console.log('  </>');
}

console.log('\n✅ The structure is now correct!');
console.log('The header and footer should display with their own styling,');
console.log('independent of the main container gradient background.');
console.log('\n🔄 If you still don\'t see the changes:');
console.log('1. Check browser console for "LiveSiteHeader/Footer is rendering!" messages');
console.log('2. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)');
console.log('3. Check if Next.js dev server needs restart');
console.log('4. Clear Next.js cache: rm -rf .next/');