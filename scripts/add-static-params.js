#!/usr/bin/env node

/**
 * Add generateStaticParams to Dynamic Routes
 *
 * This script adds empty generateStaticParams() exports to all dynamic route pages
 * that don't already have them. This is required for Next.js static export builds.
 *
 * For mobile apps, these pages will fetch data client-side via API calls,
 * so we return an empty array from generateStaticParams().
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const projectRoot = path.join(__dirname, '..');

// Code to add to files that don't have generateStaticParams
const STATIC_PARAMS_CODE = `
// Required for static export (mobile builds)
// Pages fetch data client-side via API calls
export async function generateStaticParams() {
  return [];
}
`;

async function addStaticParams() {
  console.log('🔍 Finding dynamic route pages...');

  // Find all page.tsx files
  const allPages = await glob('app/**/page.tsx', {
    cwd: projectRoot,
    absolute: true,
  });

  // Filter to only dynamic routes (containing [])
  const dynamicPages = allPages.filter(pagePath => {
    const relativePath = path.relative(projectRoot, pagePath);
    return relativePath.includes('[') && relativePath.includes(']');
  });

  console.log(`Found ${dynamicPages.length} dynamic route pages\n`);

  let modified = 0;
  let skipped = 0;

  for (const pagePath of dynamicPages) {
    const content = fs.readFileSync(pagePath, 'utf8');

    // Check if file already has generateStaticParams
    if (content.includes('generateStaticParams')) {
      console.log(`⏭️  Skipped: ${path.relative(projectRoot, pagePath)} (already has generateStaticParams)`);
      skipped++;
      continue;
    }

    // Add generateStaticParams at the top of the file (after imports)
    const lines = content.split('\n');
    let insertIndex = 0;

    // Find the end of imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || line.startsWith('\'use client\'') || line.startsWith('"use client"')) {
        insertIndex = i + 1;
      } else if (insertIndex > 0 && line === '') {
        // Found empty line after imports
        insertIndex = i;
        break;
      }
    }

    // Insert the code
    lines.splice(insertIndex, 0, STATIC_PARAMS_CODE);
    const newContent = lines.join('\n');

    fs.writeFileSync(pagePath, newContent, 'utf8');
    console.log(`✅ Modified: ${path.relative(projectRoot, pagePath)}`);
    modified++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Modified: ${modified}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${dynamicPages.length}\n`);
}

addStaticParams().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
