#!/usr/bin/env node

/**
 * Fix Page Components to Pass Params
 *
 * Updates all generated page.tsx files to properly pass params prop
 * to their ClientPage components.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const projectRoot = path.join(__dirname, '..');

async function fixPageParams() {
  console.log('🔧 Fixing page components to pass params...\n');

  // Find all page.tsx files with dynamic routes
  const allPages = await glob('app/**/page.tsx', {
    cwd: projectRoot,
    absolute: true,
  });

  const dynamicPages = allPages.filter(pagePath => {
    const relativePath = path.relative(projectRoot, pagePath);
    return relativePath.includes('[') && relativePath.includes(']');
  });

  let fixed = 0;

  for (const pagePath of dynamicPages) {
    const content = fs.readFileSync(pagePath, 'utf8');

    // Skip if already passes params or doesn't import ClientPage
    if (!content.includes('ClientPage') || content.includes('params={') || content.includes('...props')) {
      console.log(`⏭️  Skipped: ${path.relative(projectRoot, pagePath)}`);
      continue;
    }

    // Extract parameter name from path
    const relativePath = path.relative(path.join(projectRoot, 'app'), pagePath);
    const segments = relativePath.split(path.sep);
    const dynamicSegment = segments.find(s => s.startsWith('[') && s.endsWith(']'));
    const paramName = dynamicSegment ? dynamicSegment.slice(1, -1) : 'id';

    // Determine props interface based on param name
    let propsType;
    if (paramName === 'id') {
      propsType = '{ params: { id: string } }';
    } else if (paramName === 'slug') {
      propsType = '{ params: { slug: string } }';
    } else if (paramName === 'category') {
      propsType = '{ params: { category: string } }';
    } else if (paramName === 'paymentId') {
      propsType = '{ params: { paymentId: string } }';
    } else {
      propsType = `{ params: { ${paramName}: string } }`;
    }

    // Create new page content with proper types and param passing
    const newContent = `import ClientPage from './ClientPage';

// Required for static export (mobile builds)
export async function generateStaticParams() {
  // Return empty array - page will fetch data client-side via API
  return [];
}

export default function Page(props: ${propsType}) {
  return <ClientPage {...props} />;
}
`;

    fs.writeFileSync(pagePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${path.relative(projectRoot, pagePath)}`);
    fixed++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Fixed: ${fixed}\n`);
}

fixPageParams().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
