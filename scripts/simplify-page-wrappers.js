#!/usr/bin/env node

/**
 * Simplify Page Wrappers
 *
 * Updates all page.tsx files to just render ClientPage without props.
 * ClientPage components use useParams() hook to access dynamic route parameters.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const projectRoot = path.join(__dirname, '..');

const SIMPLE_PAGE_TEMPLATE = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
export async function generateStaticParams() {
  // Return empty array - page will fetch data client-side via API
  return [];
}

export default function Page() {
  return <ClientPage />;
}
`;

async function simplifyPageWrappers() {
  console.log('🔧 Simplifying page wrapper components...\n');

  // Find all page.tsx files with dynamic routes that import ClientPage
  const allPages = await glob('app/**/page.tsx', {
    cwd: projectRoot,
    absolute: true,
  });

  const dynamicPages = allPages.filter(pagePath => {
    const relativePath = path.relative(projectRoot, pagePath);
    const content = fs.readFileSync(pagePath, 'utf8');
    return relativePath.includes('[') && relativePath.includes(']') && content.includes('ClientPage');
  });

  let updated = 0;

  for (const pagePath of dynamicPages) {
    fs.writeFileSync(pagePath, SIMPLE_PAGE_TEMPLATE, 'utf8');
    console.log(`✅ Updated: ${path.relative(projectRoot, pagePath)}`);
    updated++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}\n`);
}

simplifyPageWrappers().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
