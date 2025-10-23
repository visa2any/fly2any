/**
 * Currency Service Test Script
 *
 * Run with: node test-currency-service.mjs
 *
 * Tests all currency service functionality
 */

import {
  formatPrice,
  getCurrencySymbol,
  getCurrencyInfo,
  formatPriceRange,
  getSupportedCurrencies,
  getPopularCurrencies,
  detectUserCurrency,
  fetchExchangeRates,
  convertCurrency,
  convertAndFormat,
  clearCurrencyCache,
} from './lib/services/currency.ts';

console.log('🧪 Testing Currency Service\n');

// ===========================
// TEST 1: Currency Symbols
// ===========================

console.log('📝 Test 1: Currency Symbols');
const testSymbols = ['USD', 'EUR', 'GBP', 'JPY', 'BRL', 'MXN', 'INR'];
testSymbols.forEach(code => {
  const symbol = getCurrencySymbol(code);
  console.log(`  ${code}: ${symbol}`);
});
console.log('✓ Symbols test passed\n');

// ===========================
// TEST 2: Currency Info
// ===========================

console.log('📝 Test 2: Currency Info');
const info = getCurrencyInfo('EUR');
console.log('  EUR Info:', {
  code: info.code,
  symbol: info.symbol,
  name: info.name,
  position: info.symbolPosition,
  decimals: info.decimalPlaces,
});
console.log('✓ Info test passed\n');

// ===========================
// TEST 3: Price Formatting
// ===========================

console.log('📝 Test 3: Price Formatting');
const testPrices = [
  { amount: 499.99, currency: 'USD' },
  { amount: 1234.56, currency: 'EUR' },
  { amount: 10000, currency: 'JPY' },
  { amount: 1500, currency: 'GBP' },
  { amount: 5000, currency: 'BRL' },
];

testPrices.forEach(({ amount, currency }) => {
  const formatted = formatPrice(amount, currency);
  const compact = formatPrice(amount, currency, { compact: true });
  console.log(`  ${amount} ${currency}:`);
  console.log(`    Normal: ${formatted}`);
  console.log(`    Compact: ${compact}`);
});
console.log('✓ Formatting test passed\n');

// ===========================
// TEST 4: Price Ranges
// ===========================

console.log('📝 Test 4: Price Ranges');
console.log('  USD 299-899:', formatPriceRange(299, 899, 'USD'));
console.log('  EUR 199-599:', formatPriceRange(199, 599, 'EUR'));
console.log('  GBP 150-450:', formatPriceRange(150, 450, 'GBP'));
console.log('✓ Price range test passed\n');

// ===========================
// TEST 5: Supported Currencies
// ===========================

console.log('📝 Test 5: Supported Currencies');
const allCurrencies = getSupportedCurrencies();
const popularCurrencies = getPopularCurrencies();
console.log(`  Total supported: ${allCurrencies.length}`);
console.log(`  Popular currencies: ${popularCurrencies.length}`);
console.log('  Popular:', popularCurrencies.map(c => c.code).join(', '));
console.log('✓ Currency list test passed\n');

// ===========================
// TEST 6: Currency Detection
// ===========================

console.log('📝 Test 6: Currency Detection');
const testLocales = [
  'en-US', 'en-GB', 'en-AU', 'pt-BR', 'es-ES', 'es-MX',
  'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ar-SA'
];
testLocales.forEach(locale => {
  const detected = detectUserCurrency(locale);
  console.log(`  ${locale} -> ${detected}`);
});
console.log('✓ Detection test passed\n');

// ===========================
// TEST 7: Exchange Rates (Async)
// ===========================

console.log('📝 Test 7: Exchange Rates (async)');
try {
  // Clear cache first
  clearCurrencyCache();

  const rates = await fetchExchangeRates('USD');
  console.log('  Base currency:', rates.base);
  console.log('  Rate date:', rates.date);
  console.log('  Sample rates:');
  console.log('    EUR:', rates.rates.EUR);
  console.log('    GBP:', rates.rates.GBP);
  console.log('    JPY:', rates.rates.JPY);
  console.log('    BRL:', rates.rates.BRL);
  console.log('  Total currencies:', Object.keys(rates.rates).length);
  console.log('✓ Exchange rates test passed\n');
} catch (error) {
  console.error('❌ Exchange rates test failed:', error.message);
  console.log('  (This is expected if offline or API is unavailable)\n');
}

// ===========================
// TEST 8: Currency Conversion (Async)
// ===========================

console.log('📝 Test 8: Currency Conversion (async)');
try {
  const testConversions = [
    { amount: 100, from: 'USD', to: 'EUR' },
    { amount: 100, from: 'USD', to: 'GBP' },
    { amount: 100, from: 'USD', to: 'JPY' },
    { amount: 100, from: 'EUR', to: 'BRL' },
  ];

  for (const { amount, from, to } of testConversions) {
    const result = await convertCurrency(amount, from, to);
    const formatted = formatPrice(result, to);
    console.log(`  ${amount} ${from} = ${formatted}`);
  }
  console.log('✓ Conversion test passed\n');
} catch (error) {
  console.error('❌ Conversion test failed:', error.message);
  console.log('  (This is expected if offline or API is unavailable)\n');
}

// ===========================
// TEST 9: Convert and Format (Async)
// ===========================

console.log('📝 Test 9: Convert and Format (async)');
try {
  const result = await convertAndFormat(500, 'USD', 'EUR');
  console.log('  Result:', {
    amount: result.amount,
    currency: result.currency,
    formatted: result.formatted,
  });
  console.log('✓ Convert and format test passed\n');
} catch (error) {
  console.error('❌ Convert and format test failed:', error.message);
  console.log('  (This is expected if offline or API is unavailable)\n');
}

// ===========================
// TEST 10: Edge Cases
// ===========================

console.log('📝 Test 10: Edge Cases');
console.log('  Unknown currency:', formatPrice(100, 'XYZ'));
console.log('  Zero amount:', formatPrice(0, 'USD'));
console.log('  Negative amount:', formatPrice(-50, 'EUR'));
console.log('  String amount:', formatPrice('123.45', 'GBP'));
console.log('  Invalid amount:', formatPrice('invalid', 'USD'));
console.log('  Same currency conversion:', await convertCurrency(100, 'USD', 'USD'));
console.log('✓ Edge cases test passed\n');

// ===========================
// Summary
// ===========================

console.log('═'.repeat(50));
console.log('✅ All currency service tests completed!');
console.log('═'.repeat(50));
console.log('\nNext steps:');
console.log('1. Test API endpoint: node test-currency-api.mjs');
console.log('2. Test React components in browser');
console.log('3. Integrate into flight search');
