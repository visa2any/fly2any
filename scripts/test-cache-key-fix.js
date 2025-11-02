#!/usr/bin/env node
/**
 * TEST: Cache Key Fix Verification
 * Verifies that storage and retrieval endpoints generate matching cache keys
 */

console.log('\n🔧 CACHE KEY FIX VERIFICATION\n');
console.log('='.repeat(70));

// Test function that mimics the NEW parseAirportCodes logic
function parseAirportCodes(codes) {
  const extractSingleCode = (value) => {
    const trimmed = value.trim();

    // If already a 3-letter code, return as-is
    if (/^[A-Z]{3}$/i.test(trimmed)) {
      return trimmed.toUpperCase();
    }

    // Extract code from formats like "Miami (MIA)" or "MIA - Miami"
    const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
    if (codeMatch) {
      return (codeMatch[1] || codeMatch[2]).toUpperCase();
    }

    return trimmed.toUpperCase();
  };

  return codes.split(',')
    .map(code => extractSingleCode(code))
    .filter(code => code.length > 0);
}

// Test function that mimics the extractAirportCode logic from cheapest-dates
function extractAirportCode(value) {
  if (!value) return '';

  const trimmed = value.trim();

  if (trimmed.includes(',')) {
    const firstCode = trimmed.split(',')[0].trim();
    return extractAirportCode(firstCode);
  }

  if (/^[A-Z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
  if (codeMatch) {
    return (codeMatch[1] || codeMatch[2]).toUpperCase();
  }

  return trimmed.toUpperCase();
}

// Test cases
const testCases = [
  { input: 'Miami (MIA)', expected: 'MIA' },
  { input: 'MIA', expected: 'MIA' },
  { input: 'JFK - New York', expected: 'JFK' },
  { input: 'Dubai (DXB)', expected: 'DXB' },
  { input: 'MIA,JFK', expected: 'MIA' }, // First code only for extractAirportCode
  { input: 'New York City (JFK)', expected: 'JFK' },
];

console.log('\n📋 Test Cases:\n');

let passed = 0;
let failed = 0;

testCases.forEach((test, i) => {
  // Test storage endpoint logic (parseAirportCodes)
  const storageResult = parseAirportCodes(test.input)[0];

  // Test retrieval endpoint logic (extractAirportCode)
  const retrievalResult = extractAirportCode(test.input);

  const storageMatch = storageResult === test.expected;
  const retrievalMatch = retrievalResult === test.expected;
  const bothMatch = storageResult === retrievalResult;

  if (storageMatch && retrievalMatch && bothMatch) {
    console.log(`✅ Test ${i + 1}: "${test.input}"`);
    console.log(`   Storage:   "${storageResult}" ${storageMatch ? '✓' : '✗'}`);
    console.log(`   Retrieval: "${retrievalResult}" ${retrievalMatch ? '✓' : '✗'}`);
    console.log(`   Match: ${bothMatch ? 'YES ✓' : 'NO ✗'}\n`);
    passed++;
  } else {
    console.log(`❌ Test ${i + 1}: "${test.input}"`);
    console.log(`   Expected:  "${test.expected}"`);
    console.log(`   Storage:   "${storageResult}" ${storageMatch ? '✓' : '✗'}`);
    console.log(`   Retrieval: "${retrievalResult}" ${retrievalMatch ? '✓' : '✗'}`);
    console.log(`   Match: ${bothMatch ? 'YES ✓' : 'NO ✗'}\n`);
    failed++;
  }
});

console.log('='.repeat(70));
console.log(`\n🎯 RESULTS: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ ALL TESTS PASSED - Cache keys will now match!\n');
  console.log('Next steps:');
  console.log('1. Restart dev server to apply changes');
  console.log('2. Perform a test search (e.g., MIA → DXB)');
  console.log('3. Verify calendar prices appear correctly\n');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Please review the logic\n');
  process.exit(1);
}
