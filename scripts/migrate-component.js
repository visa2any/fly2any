#!/usr/bin/env node

/**
 * Automated Component Migration Script for i18n
 *
 * Usage:
 *   node scripts/migrate-component.js path/to/Component.tsx
 *   node scripts/migrate-component.js --all components/booking
 *
 * This script automatically:
 * 1. Adds useTranslations import
 * 2. Adds const t = useTranslations('Namespace')
 * 3. Replaces common hardcoded strings with t('key')
 */

const fs = require('fs');
const path = require('path');

// Translation mappings
const bookingTranslations = {
  '"Secure Payment"': "t('securePayment')",
  "'Secure Payment'": "t('securePayment')",
  '"COMPLETE BOOKING"': "t('completeBooking')",
  "'COMPLETE BOOKING'": "t('completeBooking')",
  '"Processing Payment..."': "t('processingPayment')",
  "'Processing Payment...'": "t('processingPayment')",
  '"Card Number"': "t('cardNumber')",
  "'Card Number'": "t('cardNumber')",
  '"Cardholder Name"': "t('cardholderName')",
  "'Cardholder Name'": "t('cardholderName')",
  '"Expiry Date"': "t('expiryDate')",
  "'Expiry Date'": "t('expiryDate')",
  '"CVV"': "t('cvv')",
  "'CVV'": "t('cvv')",
  '"Billing Address"': "t('billingAddress')",
  "'Billing Address'": "t('billingAddress')",
  '"Continue to Payment"': "t('continueToPayment')",
  "'Continue to Payment'": "t('continueToPayment')",
  '"Passenger Details"': "t('passengerDetails')",
  "'Passenger Details'": "t('passengerDetails')",
  '"Review & Pay"': "t('reviewAndPay')",
  "'Review & Pay'": "t('reviewAndPay')",
  '"Total"': "t('total')",
  "'Total'": "t('total')",
  '"Subtotal"': "t('subtotal')",
  "'Subtotal'": "t('subtotal')",
  '"Taxes"': "t('taxes')",
  "'Taxes'": "t('taxes')",
  '"Flight Details"': "t('flightDetails')",
  "'Flight Details'": "t('flightDetails')",
  '"Airline"': "t('airline')",
  "'Airline'": "t('airline')",
  '"Fare Class"': "t('fareClass')",
  "'Fare Class'": "t('fareClass')",
  '"Passengers"': "t('passengers')",
  "'Passengers'": "t('passengers')",
};

const commonTranslations = {
  '"Continue"': "tCommon('continue')",
  "'Continue'": "tCommon('continue')",
  '"Cancel"': "tCommon('cancel')",
  "'Cancel'": "tCommon('cancel')",
  '"Save"': "tCommon('save')",
  "'Save'": "tCommon('save')",
  '"Delete"': "tCommon('delete')",
  "'Delete'": "tCommon('delete')",
  '"Edit"': "tCommon('edit')",
  "'Edit'": "tCommon('edit')",
  '"Back"': "tCommon('back')",
  "'Back'": "tCommon('back')",
  '"Next"': "tCommon('next')",
  "'Next'": "tCommon('next')",
  '"Submit"': "tCommon('submit')",
  "'Submit'": "tCommon('submit')",
  '"Loading..."': "tCommon('loading')",
  "'Loading...'": "tCommon('loading')",
  '"Search"': "tCommon('search')",
  "'Search'": "tCommon('search')",
  '"Close"': "tCommon('close')",
  "'Close'": "tCommon('close')",
};

function detectNamespace(filePath) {
  if (filePath.includes('booking')) return 'Booking';
  if (filePath.includes('account')) return 'Account';
  if (filePath.includes('hotel')) return 'Hotels';
  if (filePath.includes('car')) return 'Cars';
  if (filePath.includes('flight')) return 'FlightCard';
  if (filePath.includes('search')) return 'SearchBar';
  return 'Common';
}

function migrateComponent(filePath, namespace) {
  console.log(`\n🔄 Migrating: ${filePath}`);
  console.log(`📦 Using namespace: ${namespace}`);

  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Step 1: Add 'use client' if not present
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    content = "'use client';\n\n" + content;
  }

  // Step 2: Add useTranslations import if not present
  if (!content.includes("import { useTranslations } from 'next-intl'")) {
    const importPosition = content.indexOf("'use client';") + "'use client';".length;
    content = content.slice(0, importPosition) + "\n\nimport { useTranslations } from 'next-intl';" + content.slice(importPosition);
  }

  // Step 3: Add useTranslations hook in component
  if (!content.includes('useTranslations(')) {
    // Find component function
    const funcMatch = content.match(/(export (?:default )?function \w+[^{]*{)/);
    if (funcMatch) {
      const funcStart = content.indexOf(funcMatch[0]) + funcMatch[0].length;
      const hookLine = `\n  const t = useTranslations('${namespace}');\n  const tCommon = useTranslations('Common');\n`;
      content = content.slice(0, funcStart) + hookLine + content.slice(funcStart);
    }
  }

  // Step 4: Replace hardcoded strings with translations
  let replacements = 0;

  // Apply namespace-specific translations
  for (const [oldStr, newStr] of Object.entries(bookingTranslations)) {
    if (content !== content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr)) {
      replacements++;
    }
    content = content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
  }

  // Apply common translations
  for (const [oldStr, newStr] of Object.entries(commonTranslations)) {
    if (content !== content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr)) {
      replacements++;
    }
    content = content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
  }

  // Check if anything changed
  if (content === originalContent) {
    console.log('⚠️  No changes needed (already migrated or no hardcoded strings found)');
    return false;
  }

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Migrated successfully! (${replacements} replacements)`);
  return true;
}

function migrateDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalMigrated = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      totalMigrated += migrateDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const namespace = detectNamespace(filePath);
      if (migrateComponent(filePath, namespace)) {
        totalMigrated++;
      }
    }
  }

  return totalMigrated;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🌐 i18n Component Migration Script

Usage:
  node scripts/migrate-component.js path/to/Component.tsx
  node scripts/migrate-component.js --all components/booking

Examples:
  node scripts/migrate-component.js components/booking/ReviewAndPay.tsx
  node scripts/migrate-component.js --all components/booking

This will:
  ✅ Add 'use client' directive
  ✅ Add useTranslations import
  ✅ Add translation hooks
  ✅ Replace hardcoded strings with t('key')
`);
  process.exit(0);
}

if (args[0] === '--all') {
  const dirPath = args[1] || 'components';
  console.log(`\n🚀 Batch migrating all components in: ${dirPath}\n`);
  const count = migrateDirectory(dirPath);
  console.log(`\n✨ Migration complete! ${count} files migrated.`);
} else {
  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const namespace = detectNamespace(filePath);
  migrateComponent(filePath, namespace);
}
