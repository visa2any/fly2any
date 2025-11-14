#!/usr/bin/env node

/**
 * Remove generateStaticParams from Client Components
 *
 * Client components ('use client') cannot have generateStaticParams().
 * This script removes it from all client component pages.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const projectRoot = path.join(__dirname, '..');

async function removeFromClientComponents() {
  console.log('🔍 Finding client component pages with generateStaticParams...\n');

  // Find all page.tsx files with dynamic routes
  const allPages = await glob('app/**/page.tsx', {
    cwd: projectRoot,
    absolute: true,
  });

  const dynamicPages = allPages.filter(pagePath => {
    const relativePath = path.relative(projectRoot, pagePath);
    return relativePath.includes('[') && relativePath.includes(']');
  });

  let removed = 0;

  for (const pagePath of dynamicPages) {
    const content = fs.readFileSync(pagePath, 'utf8');

    // Check if it's a client component
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      continue;
    }

    // Check if it has generateStaticParams
    if (!content.includes('generateStaticParams')) {
      continue;
    }

    // Remove the generateStaticParams block
    const lines = content.split('\n');
    const newLines = [];
    let skip = false;
    let bracketCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Start skipping when we find generateStaticParams
      if (line.includes('generateStaticParams')) {
        skip = true;
        // Skip comment lines above it too
        while (newLines.length > 0 && newLines[newLines.length - 1].trim().startsWith('//')) {
          newLines.pop();
        }
        // Skip empty line above comments
        if (newLines.length > 0 && newLines[newLines.length - 1].trim() === '') {
          newLines.pop();
        }
      }

      if (skip) {
        // Count brackets to know when function ends
        bracketCount += (line.match(/{/g) || []).length;
        bracketCount -= (line.match(/}/g) || []).length;

        // Stop skipping after function closes
        if (bracketCount === 0 && line.includes('}')) {
          skip = false;
          continue;
        }
      } else {
        newLines.push(line);
      }
    }

    const newContent = newLines.join('\n');
    fs.writeFileSync(pagePath, newContent, 'utf8');
    console.log(`✅ Removed from: ${path.relative(projectRoot, pagePath)}`);
    removed++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Removed: ${removed}\n`);
}

removeFromClientComponents().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
