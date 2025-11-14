#!/usr/bin/env node

/**
 * Refactor Dynamic Route Pages for Static Export
 *
 * Converts client component pages to a hybrid model:
 * 1. Create ClientPage component from existing page
 * 2. Create new server component page that exports generateStaticParams
 * 3. Server component renders the client component
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const projectRoot = path.join(__dirname, '..');

async function refactorDynamicPages() {
  console.log('🔄 Refactoring dynamic route pages for static export...\n');

  // Find all page.tsx files with dynamic routes
  const allPages = await glob('app/**/page.tsx', {
    cwd: projectRoot,
    absolute: true,
  });

  const dynamicPages = allPages.filter(pagePath => {
    const relativePath = path.relative(projectRoot, pagePath);
    return relativePath.includes('[') && relativePath.includes(']');
  });

  let refactored = 0;

  for (const pagePath of dynamicPages) {
    const content = fs.readFileSync(pagePath, 'utf8');

    // Check if it's a client component
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      console.log(`⏭️  Skipped (already server component): ${path.relative(projectRoot, pagePath)}`);
      continue;
    }

    // Check if already has generateStaticParams
    if (content.includes('generateStaticParams')) {
      console.log(`⏭️  Skipped (already has generateStaticParams): ${path.relative(projectRoot, pagePath)}`);
      continue;
    }

    const pageDir = path.dirname(pagePath);
    const clientPagePath = path.join(pageDir, 'ClientPage.tsx');

    // Move existing content to ClientPage.tsx
    fs.writeFileSync(clientPagePath, content, 'utf8');

    // Create new server component page
    const relativePath = path.relative(path.join(projectRoot, 'app'), pageDir);
    const segments = relativePath.split(path.sep);
    const dynamicSegment = segments.find(s => s.startsWith('[') && s.endsWith(']'));
    const paramName = dynamicSegment ? dynamicSegment.slice(1, -1) : 'id';

    const newPageContent = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
export async function generateStaticParams() {
  // Return empty array - page will fetch data client-side via API
  return [];
}

export default function Page() {
  return <ClientPage />;
}
`;

    fs.writeFileSync(pagePath, newPageContent, 'utf8');
    console.log(`✅ Refactored: ${path.relative(projectRoot, pagePath)}`);
    console.log(`   Created: ${path.relative(projectRoot, clientPagePath)}`);
    refactored++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Refactored: ${refactored}\n`);
}

refactorDynamicPages().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
