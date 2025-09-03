/**
 * Minimal test to isolate what's causing the timeout
 */

console.log('Starting minimal test...');

// Test basic imports
try {
  console.log('1. Testing basic Next.js import...');
  require('next');
  console.log('✅ Next.js imported successfully');
} catch (error) {
  console.log('❌ Next.js import failed:', error.message);
}

try {
  console.log('2. Testing React import...');
  require('react');
  console.log('✅ React imported successfully');
} catch (error) {
  console.log('❌ React import failed:', error.message);
}

// Test if TypeScript compilation is the issue
try {
  console.log('3. Testing basic TypeScript resolution...');
  require('typescript');
  console.log('✅ TypeScript imported successfully');
} catch (error) {
  console.log('❌ TypeScript import failed:', error.message);
}

console.log('Minimal test completed.');