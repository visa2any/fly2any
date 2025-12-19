#!/usr/bin/env node
/**
 * Email Extractor & Validator for Customer Reactivation
 * Filters contacts with valid emails from Google Contacts CSV
 */

const fs = require('fs');
const path = require('path');

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Disposable/temporary email domains to exclude
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
  'throwaway.email', 'fakeinbox.com', 'trashmail.com', 'temp-mail.org',
  'disposablemail.com', 'maildrop.cc', 'yopmail.com', 'sharklasers.com'
]);

// Invalid/spam trap patterns
const INVALID_PATTERNS = [
  /^test@/, /^admin@/, /^info@/, /^noreply@/, /^no-reply@/,
  /^example@/, /^user@/, /^sample@/, /\+.*@/ // plus addressing often indicates testing
];

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const cleaned = email.trim().toLowerCase();
  if (cleaned.length < 5 || cleaned.length > 254) return false;
  if (!EMAIL_REGEX.test(cleaned)) return false;

  const domain = cleaned.split('@')[1];
  if (!domain || domain.length < 3) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  if (!domain.includes('.')) return false;

  // Check for invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(cleaned)) return false;
  }

  return true;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function extractValidEmails(inputPath, outputPath) {
  console.log('📧 Email Extractor & Validator');
  console.log('━'.repeat(50));

  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  const headers = parseCSVLine(lines[0]);
  console.log(`📄 Total rows: ${lines.length - 1}`);

  // Find email columns (Google Contacts has multiple email fields)
  const emailCols = [];
  headers.forEach((h, i) => {
    if (h.toLowerCase().includes('e-mail') || h.toLowerCase().includes('email')) {
      emailCols.push({ index: i, name: h });
    }
  });
  console.log(`📬 Email columns found: ${emailCols.length}`);

  // Find name columns
  const firstNameIdx = headers.findIndex(h => h === 'First Name');
  const lastNameIdx = headers.findIndex(h => h === 'Last Name');
  const labelIdx = headers.findIndex(h => h === 'Labels' || h === 'Group Membership');
  const phoneIdx = headers.findIndex(h => h.includes('Phone'));

  const validContacts = [];
  const invalidEmails = [];
  const seenEmails = new Set();

  const stats = {
    total: 0,
    withEmail: 0,
    validFormat: 0,
    duplicates: 0,
    disposable: 0,
    final: 0
  };

  for (let i = 1; i < lines.length; i++) {
    stats.total++;
    const fields = parseCSVLine(lines[i]);

    // Extract all emails from this contact
    let primaryEmail = null;
    for (const col of emailCols) {
      const email = fields[col.index]?.trim().toLowerCase();
      if (email && email.includes('@')) {
        primaryEmail = email;
        break;
      }
    }

    if (!primaryEmail) continue;
    stats.withEmail++;

    // Validate email
    if (!isValidEmail(primaryEmail)) {
      invalidEmails.push(primaryEmail);
      continue;
    }
    stats.validFormat++;

    // Check duplicates
    if (seenEmails.has(primaryEmail)) {
      stats.duplicates++;
      continue;
    }
    seenEmails.add(primaryEmail);

    // Extract contact info
    const firstName = fields[firstNameIdx]?.replace(/"/g, '').trim() || '';
    const lastName = fields[lastNameIdx]?.replace(/"/g, '').trim() || '';
    const labels = fields[labelIdx]?.replace(/"/g, '').trim() || '';
    const phone = fields[phoneIdx]?.replace(/"/g, '').trim() || '';

    // Determine segment based on labels
    let segment = 'general';
    if (labels.includes('Travel from USA to Brazil')) segment = 'travel_usa_brazil';
    else if (labels.includes('Travel from Brazil')) segment = 'travel_brazil_usa';
    else if (labels.includes('Money') || labels.includes('Remittance')) segment = 'remittance';
    else if (labels.includes('CT LIST')) segment = 'ct_list';
    else if (labels.includes('Travel')) segment = 'travel_general';

    validContacts.push({
      email: primaryEmail,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      phone,
      segment,
      labels
    });
    stats.final++;
  }

  console.log('\n📊 Extraction Results:');
  console.log('━'.repeat(50));
  console.log(`Total contacts:      ${stats.total.toLocaleString()}`);
  console.log(`With email:          ${stats.withEmail.toLocaleString()}`);
  console.log(`Valid format:        ${stats.validFormat.toLocaleString()}`);
  console.log(`Duplicates removed:  ${stats.duplicates.toLocaleString()}`);
  console.log(`━`.repeat(50));
  console.log(`✅ VALID EMAILS:     ${stats.final.toLocaleString()}`);

  // Segment breakdown
  const segments = {};
  validContacts.forEach(c => {
    segments[c.segment] = (segments[c.segment] || 0) + 1;
  });

  console.log('\n🎯 Segment Breakdown:');
  Object.entries(segments).sort((a,b) => b[1] - a[1]).forEach(([seg, count]) => {
    console.log(`  ${seg}: ${count}`);
  });

  // Domain breakdown
  const domains = {};
  validContacts.forEach(c => {
    const domain = c.email.split('@')[1];
    domains[domain] = (domains[domain] || 0) + 1;
  });

  console.log('\n📧 Top Email Domains:');
  Object.entries(domains).sort((a,b) => b[1] - a[1]).slice(0, 10).forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count}`);
  });

  // Write output CSV
  const csvHeader = 'email,first_name,last_name,full_name,phone,segment,labels';
  const csvRows = validContacts.map(c =>
    `"${c.email}","${c.firstName}","${c.lastName}","${c.fullName}","${c.phone}","${c.segment}","${c.labels.replace(/"/g, '""')}"`
  );

  fs.writeFileSync(outputPath, [csvHeader, ...csvRows].join('\n'));
  console.log(`\n💾 Saved to: ${outputPath}`);

  // Also save JSON for easy import
  const jsonPath = outputPath.replace('.csv', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    extracted: new Date().toISOString(),
    stats,
    segments,
    contacts: validContacts
  }, null, 2));
  console.log(`💾 JSON saved: ${jsonPath}`);

  return { stats, validContacts, segments };
}

// Run extraction
const inputFile = process.argv[2] || 'C:\\Users\\Power\\Downloads\\contacts1.csv';
const outputFile = process.argv[3] || 'C:\\Users\\Power\\Downloads\\valid_emails_for_reactivation.csv';

extractValidEmails(inputFile, outputFile)
  .then(result => {
    console.log('\n✅ Extraction complete!');
    console.log(`\n🚀 Ready to import ${result.stats.final} contacts for reactivation campaigns`);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
