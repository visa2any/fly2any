#!/usr/bin/env node

/**
 * Add Layout Files to Dynamic Routes
 *
 * For static export with client components, we need to add layout.tsx files
 * with generateStaticParams() to dynamic route directories.
 * This satisfies Next.js requirements without conflicting with 'use client' pages.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const projectRoot = path.join(__dirname, '..');

const LAYOUT_CODE = `// Required for static export (mobile builds)
// This layout provides generateStaticParams() for the dynamic route
export async function generateStaticParams() {
  // Return empty array - pages will fetch data client-side via API
  return [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;

async function addLayoutsToDynamicRoutes() {
  console.log('📁 Adding layout.tsx files to dynamic routes...\n');

  // Find all page.tsx files with dynamic routes
  const allPages = await glob('app/**/page.tsx', {
    cwd: projectRoot,
    absolute: true,
  });

  const dynamicPages = allPages.filter(pagePath => {
    const relativePath = path.relative(projectRoot, pagePath);
    return relativePath.includes('[') && relativePath.includes(']');
  });

  let added = 0;
  let skipped = 0;

  for (const pagePath of dynamicPages) {
    const pageDir = path.dirname(pagePath);
    const layoutPath = path.join(pageDir, 'layout.tsx');

    // Check if layout already exists
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');

      // If it already has generateStaticParams, skip
      if (layoutContent.includes('generateStaticParams')) {
        console.log(`⏭️  Skipped (already has generateStaticParams): ${path.relative(projectRoot, layoutPath)}`);
        skipped++;
        continue;
      }

      // If layout exists but doesn't have generateStaticParams, add it
      const lines = layoutContent.split('\n');
      const newLines = [
        '// Required for static export (mobile builds)',
        'export async function generateStaticParams() {',
        '  // Return empty array - pages will fetch data client-side via API',
        '  return [];',
        '}',
        '',
        ...lines
      ];
      fs.writeFileSync(layoutPath, newLines.join('\n'), 'utf8');
      console.log(`✅ Updated: ${path.relative(projectRoot, layoutPath)}`);
      added++;
    } else {
      // Create new layout file
      fs.writeFileSync(layoutPath, LAYOUT_CODE, 'utf8');
      console.log(`✅ Created: ${path.relative(projectRoot, layoutPath)}`);
      added++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Added/Updated: ${added}`);
  console.log(`   Skipped: ${skipped}\n`);
}

addLayoutsToDynamicRoutes().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
