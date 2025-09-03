const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying LiveSiteHeader implementation...\n');

// Check if LiveSiteHeader is imported in page.tsx
const pagePath = path.join(__dirname, 'src/app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf-8');

// Check for imports
const hasLiveSiteHeaderImport = pageContent.includes("import LiveSiteHeader from '@/components/home/LiveSiteHeader'");
const hasLiveSiteFooterImport = pageContent.includes("import LiveSiteFooter from '@/components/home/LiveSiteFooter'");

// Check for usage in JSX
const usesLiveSiteHeader = pageContent.includes('<LiveSiteHeader />');
const usesLiveSiteFooter = pageContent.includes('<LiveSiteFooter />');

// Check that ResponsiveHeader is NOT being used
const usesResponsiveHeader = pageContent.includes('<ResponsiveHeader />');
const responsiveHeaderCommented = pageContent.includes('// import ResponsiveHeader');

console.log('✅ Import checks:');
console.log(`  - LiveSiteHeader import: ${hasLiveSiteHeaderImport ? '✓' : '✗'}`);
console.log(`  - LiveSiteFooter import: ${hasLiveSiteFooterImport ? '✓' : '✗'}`);
console.log(`  - ResponsiveHeader commented out: ${responsiveHeaderCommented ? '✓' : '✗'}`);

console.log('\n✅ Usage checks:');
console.log(`  - LiveSiteHeader in JSX: ${usesLiveSiteHeader ? '✓' : '✗'}`);
console.log(`  - LiveSiteFooter in JSX: ${usesLiveSiteFooter ? '✓' : '✗'}`);
console.log(`  - ResponsiveHeader NOT in JSX: ${!usesResponsiveHeader ? '✓' : '✗'}`);

// Check if LiveSiteHeader component exists
const headerPath = path.join(__dirname, 'src/components/home/LiveSiteHeader.tsx');
const headerExists = fs.existsSync(headerPath);

console.log('\n✅ Component file checks:');
console.log(`  - LiveSiteHeader.tsx exists: ${headerExists ? '✓' : '✗'}`);

if (headerExists) {
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  const hasDefaultExport = headerContent.includes('export default function LiveSiteHeader');
  console.log(`  - Has default export: ${hasDefaultExport ? '✓' : '✗'}`);
  
  // Check for key features
  const hasLogo = headerContent.includes('fly2any-logo.png');
  const hasNavigation = headerContent.includes('<nav');
  const hasHeader = headerContent.includes('<header');
  
  console.log('\n✅ LiveSiteHeader features:');
  console.log(`  - Has header tag: ${hasHeader ? '✓' : '✗'}`);
  console.log(`  - Has logo: ${hasLogo ? '✓' : '✗'}`);
  console.log(`  - Has navigation: ${hasNavigation ? '✓' : '✗'}`);
}

// Summary
const allChecks = [
  hasLiveSiteHeaderImport,
  hasLiveSiteFooterImport,
  responsiveHeaderCommented,
  usesLiveSiteHeader,
  usesLiveSiteFooter,
  !usesResponsiveHeader,
  headerExists
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

console.log('\n' + '='.repeat(50));
if (passedChecks === totalChecks) {
  console.log('🎉 SUCCESS: LiveSiteHeader is properly configured!');
  console.log('The root page (/) is now using the original LiveSiteHeader');
  console.log('This is temporary until the full Fly2Any implementation is complete.');
} else {
  console.log(`⚠️  WARNING: ${totalChecks - passedChecks} checks failed`);
  console.log('Please review the configuration above.');
}
console.log('='.repeat(50));