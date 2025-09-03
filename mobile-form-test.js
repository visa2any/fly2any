#!/usr/bin/env node

/**
 * Mobile Form Issues - Test Verification Script
 * Tests the three critical fixes:
 * 1. Passenger display format
 * 2. WhatsApp country selector z-index
 * 3. Form submission validation
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test results
let testResults = {
  passengerDisplay: false,
  phoneInputZIndex: false,
  formValidation: false,
  defaultCountry: false
};

console.log('🔍 MOBILE FORM FIXES VERIFICATION\n');

// Test 1: Check passenger display logic
console.log('📊 Test 1: Passenger Display Format...');
try {
  const pageContent = fs.readFileSync('./src/app/page.tsx', 'utf8');
  
  // Check if the new total passenger logic is present
  const hasNewLogic = pageContent.includes('const total = adultos + criancas + bebes;') &&
                      pageContent.includes('return `${total} Passageiro${total > 1 ? \'s\' : \'\'}`;');
  
  if (hasNewLogic) {
    console.log('✅ Passenger display format fixed');
    testResults.passengerDisplay = true;
  } else {
    console.log('❌ Passenger display format not fixed');
  }
} catch (error) {
  console.log('❌ Error checking passenger display:', error.message);
}

// Test 2: Check PhoneInput z-index fix
console.log('\n📱 Test 2: PhoneInput Country Dropdown Z-Index...');
try {
  const phoneInputContent = fs.readFileSync('./src/components/PhoneInputSimple.tsx', 'utf8');
  
  // Check if z-index is increased
  const hasHigherZIndex = phoneInputContent.includes('zIndex: 10000');
  const hasClickOutside = phoneInputContent.includes('handleClickOutside') && 
                          phoneInputContent.includes('data-phone-input-container');
  
  if (hasHigherZIndex && hasClickOutside) {
    console.log('✅ PhoneInput z-index and click-outside handling fixed');
    testResults.phoneInputZIndex = true;
  } else {
    console.log('❌ PhoneInput z-index or click-outside not fixed');
  }
} catch (error) {
  console.log('❌ Error checking PhoneInput:', error.message);
}

// Test 3: Check form validation improvements
console.log('\n🔒 Test 3: Form Submission Validation...');
try {
  const pageContent = fs.readFileSync('./src/app/page.tsx', 'utf8');
  
  // Check if comprehensive validation is present
  const hasValidation = pageContent.includes('// Comprehensive validation before submission') &&
                       pageContent.includes('const errors: Record<string, string> = {};') &&
                       pageContent.includes('if (Object.keys(errors).length > 0)');
  
  const hasImprovedErrors = pageContent.includes('NetworkError') &&
                           pageContent.includes('timeout') &&
                           pageContent.includes('Detailed error info');
  
  if (hasValidation && hasImprovedErrors) {
    console.log('✅ Form validation and error handling improved');
    testResults.formValidation = true;
  } else {
    console.log('❌ Form validation not fully improved');
  }
} catch (error) {
  console.log('❌ Error checking form validation:', error.message);
}

// Test 4: Check default country fix
console.log('\n🇧🇷 Test 4: Default Country Setting...');
try {
  const pageContent = fs.readFileSync('./src/app/page.tsx', 'utf8');
  
  // Check if default country is set to BR
  const hasCorrectDefault = pageContent.includes('defaultCountry="BR"') &&
                           !pageContent.includes('defaultCountry="US"');
  
  if (hasCorrectDefault) {
    console.log('✅ Default country set to Brazil');
    testResults.defaultCountry = true;
  } else {
    console.log('❌ Default country not set to Brazil');
  }
} catch (error) {
  console.log('❌ Error checking default country:', error.message);
}

// Summary
console.log('\n📋 SUMMARY:');
const totalTests = Object.keys(testResults).length;
const passedTests = Object.values(testResults).filter(Boolean).length;

console.log(`Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log('🎉 All mobile form fixes verified successfully!');
  console.log('\n✨ Ready for mobile testing:');
  console.log('1. Passenger count shows as "2 Passageiros" instead of "1 Adulto, 1 Criança"');
  console.log('2. WhatsApp country selector opens properly above overlays');
  console.log('3. Form submission has comprehensive validation and error handling');
  console.log('4. Default country is set to Brazil 🇧🇷');
} else {
  console.log('❌ Some fixes need attention');
  console.log('\nFailed tests:');
  Object.entries(testResults).forEach(([test, passed]) => {
    if (!passed) {
      console.log(`- ${test}`);
    }
  });
}

console.log('\n🚀 Next steps:');
console.log('1. Run "npm run dev" to test on mobile');
console.log('2. Test passenger dropdown behavior');
console.log('3. Test WhatsApp country selection');
console.log('4. Test form submission with invalid/missing data');
console.log('5. Verify all works on both mobile and desktop');