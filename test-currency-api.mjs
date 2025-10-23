/**
 * Currency API Test Script
 *
 * Tests the /api/currency endpoint
 *
 * Prerequisites:
 * 1. Start dev server: npm run dev
 * 2. Run this script: node test-currency-api.mjs
 */

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing Currency API Endpoint\n');
console.log('Make sure dev server is running on http://localhost:3000\n');

// ===========================
// Helper Function
// ===========================

async function testEndpoint(name, method, url, body = null) {
  console.log(`📝 ${name}`);
  console.log(`   ${method} ${url}`);

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
      console.log('   Body:', JSON.stringify(body, null, 2));
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      console.log('   ✓ Success');
      console.log('   Response:', JSON.stringify(data, null, 2).split('\n').slice(0, 10).join('\n'));
      if (JSON.stringify(data).length > 500) {
        console.log('   ... (truncated)');
      }
    } else {
      console.log('   ❌ Error:', response.status);
      console.log('   ', data);
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  console.log('');
}

// ===========================
// Run Tests
// ===========================

async function runTests() {
  // Test 1: Get exchange rates
  await testEndpoint(
    'Test 1: Get USD Exchange Rates',
    'GET',
    `${BASE_URL}/api/currency?base=USD`
  );

  // Test 2: Get popular currencies
  await testEndpoint(
    'Test 2: List Popular Currencies',
    'GET',
    `${BASE_URL}/api/currency?action=list&type=popular`
  );

  // Test 3: Get all supported currencies
  await testEndpoint(
    'Test 3: List All Currencies',
    'GET',
    `${BASE_URL}/api/currency?action=list`
  );

  // Test 4: Get currency info
  await testEndpoint(
    'Test 4: Get EUR Currency Info',
    'GET',
    `${BASE_URL}/api/currency?action=info&currency=EUR`
  );

  // Test 5: Convert single amount
  await testEndpoint(
    'Test 5: Convert 100 USD to EUR',
    'POST',
    `${BASE_URL}/api/currency`,
    {
      action: 'convert',
      amount: 100,
      from: 'USD',
      to: 'EUR',
    }
  );

  // Test 6: Convert with formatting
  await testEndpoint(
    'Test 6: Convert 500 GBP to JPY',
    'POST',
    `${BASE_URL}/api/currency`,
    {
      action: 'convert',
      amount: 500,
      from: 'GBP',
      to: 'JPY',
      format: true,
    }
  );

  // Test 7: Batch conversion
  await testEndpoint(
    'Test 7: Batch Conversion',
    'POST',
    `${BASE_URL}/api/currency`,
    {
      action: 'batch',
      conversions: [
        { amount: 100, from: 'USD', to: 'EUR' },
        { amount: 50, from: 'GBP', to: 'JPY' },
        { amount: 200, from: 'EUR', to: 'BRL' },
      ],
    }
  );

  // Test 8: Invalid currency
  await testEndpoint(
    'Test 8: Invalid Currency (should fail gracefully)',
    'POST',
    `${BASE_URL}/api/currency`,
    {
      action: 'convert',
      amount: 100,
      from: 'USD',
      to: 'INVALID',
    }
  );

  // Test 9: Missing fields
  await testEndpoint(
    'Test 9: Missing Required Fields (should return error)',
    'POST',
    `${BASE_URL}/api/currency`,
    {
      action: 'convert',
      amount: 100,
      // Missing 'from' and 'to'
    }
  );

  // Test 10: Invalid amount
  await testEndpoint(
    'Test 10: Invalid Amount (should return error)',
    'POST',
    `${BASE_URL}/api/currency`,
    {
      action: 'convert',
      amount: 'invalid',
      from: 'USD',
      to: 'EUR',
    }
  );

  // Summary
  console.log('═'.repeat(50));
  console.log('✅ API tests completed!');
  console.log('═'.repeat(50));
  console.log('\nCheck the responses above for any errors.');
  console.log('\nNext: Test in browser');
  console.log('  1. Visit http://localhost:3000/api/currency?base=USD');
  console.log('  2. Open browser console and run:');
  console.log('     fetch(\'/api/currency?base=USD\').then(r=>r.json()).then(console.log)');
}

// Run all tests
runTests().catch(console.error);
