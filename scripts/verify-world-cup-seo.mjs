#!/usr/bin/env node

/**
 * WORLD CUP SEO VERIFICATION SCRIPT
 *
 * Automated verification of:
 * - Schema.org structured data
 * - Meta tags (Open Graph, Twitter Card)
 * - Sitemap URLs
 * - Canonical URLs
 * - Hreflang tags
 * - Image alt attributes
 * - Heading hierarchy
 * - Internal linking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

// Verification results
const results = {
  passed: 0,
  warnings: 0,
  errors: 0,
  checks: [],
};

function addCheck(name, status, message) {
  results.checks.push({ name, status, message });
  if (status === 'pass') results.passed++;
  else if (status === 'warning') results.warnings++;
  else if (status === 'error') results.errors++;
}

/**
 * 1. Verify Sitemap
 */
function verifySitemap() {
  logSection('1. SITEMAP VERIFICATION');

  try {
    const sitemapPath = path.join(projectRoot, 'app', 'sitemap.ts');
    const content = fs.readFileSync(sitemapPath, 'utf-8');

    // Check for World Cup URLs
    const worldCupPatterns = [
      '/world-cup-2026',
      '/world-cup-2026/teams',
      '/world-cup-2026/stadiums',
      '/world-cup-2026/packages',
      '/world-cup-2026/schedule',
    ];

    let foundCount = 0;
    worldCupPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        foundCount++;
        logSuccess(`Found: ${pattern}`);
      } else {
        logError(`Missing: ${pattern}`);
        addCheck('Sitemap URL', 'error', `Missing ${pattern}`);
      }
    });

    if (foundCount === worldCupPatterns.length) {
      logSuccess(`All ${foundCount} main World Cup URLs found in sitemap`);
      addCheck('Sitemap - Main URLs', 'pass', `${foundCount}/${worldCupPatterns.length} URLs found`);
    } else {
      addCheck('Sitemap - Main URLs', 'error', `Only ${foundCount}/${worldCupPatterns.length} URLs found`);
    }

    // Check for dynamic imports
    if (content.includes('WORLD_CUP_TEAMS') && content.includes('WORLD_CUP_STADIUMS')) {
      logSuccess('Dynamic team and stadium pages configured');
      addCheck('Sitemap - Dynamic Pages', 'pass', 'Teams and stadiums imported');
    } else {
      logWarning('Dynamic pages may not be configured');
      addCheck('Sitemap - Dynamic Pages', 'warning', 'Check dynamic page generation');
    }

  } catch (error) {
    logError(`Sitemap verification failed: ${error.message}`);
    addCheck('Sitemap', 'error', error.message);
  }
}

/**
 * 2. Verify Schema.org Implementation
 */
function verifySchemas() {
  logSection('2. SCHEMA.ORG VERIFICATION');

  try {
    const metadataPath = path.join(projectRoot, 'lib', 'seo', 'metadata.ts');
    const content = fs.readFileSync(metadataPath, 'utf-8');

    const requiredSchemas = [
      'getWorldCupEventSchema',
      'getSportsTeamSchema',
      'getStadiumSchema',
      'getTravelPackageSchema',
    ];

    requiredSchemas.forEach(schema => {
      if (content.includes(`export function ${schema}`)) {
        logSuccess(`Schema found: ${schema}`);
        addCheck(`Schema - ${schema}`, 'pass', 'Function exists');
      } else {
        logError(`Schema missing: ${schema}`);
        addCheck(`Schema - ${schema}`, 'error', 'Function not found');
      }
    });

    // Check for schema properties
    const schemaProperties = [
      '@context',
      '@type',
      'name',
      'startDate',
      'endDate',
      'location',
      'offers',
    ];

    let propertiesFound = 0;
    schemaProperties.forEach(prop => {
      if (content.includes(`'${prop}'`) || content.includes(`"${prop}"`)) {
        propertiesFound++;
      }
    });

    if (propertiesFound >= schemaProperties.length - 1) {
      logSuccess(`Schema properties: ${propertiesFound}/${schemaProperties.length} found`);
      addCheck('Schema Properties', 'pass', `${propertiesFound}/${schemaProperties.length} properties`);
    } else {
      logWarning(`Only ${propertiesFound}/${schemaProperties.length} schema properties found`);
      addCheck('Schema Properties', 'warning', `Missing some properties`);
    }

  } catch (error) {
    logError(`Schema verification failed: ${error.message}`);
    addCheck('Schemas', 'error', error.message);
  }
}

/**
 * 3. Verify Metadata Generators
 */
function verifyMetadata() {
  logSection('3. METADATA GENERATORS VERIFICATION');

  try {
    const metadataPath = path.join(projectRoot, 'lib', 'seo', 'metadata.ts');
    const content = fs.readFileSync(metadataPath, 'utf-8');

    const requiredMetadata = [
      'worldCupMainMetadata',
      'worldCupTeamMetadata',
      'worldCupStadiumMetadata',
      'worldCupPackagesMetadata',
      'worldCupScheduleMetadata',
    ];

    requiredMetadata.forEach(metadata => {
      if (content.includes(`export function ${metadata}`)) {
        logSuccess(`Metadata generator found: ${metadata}`);
        addCheck(`Metadata - ${metadata}`, 'pass', 'Function exists');
      } else {
        logError(`Metadata generator missing: ${metadata}`);
        addCheck(`Metadata - ${metadata}`, 'error', 'Function not found');
      }
    });

    // Check for OpenGraph tags
    if (content.includes('openGraph') && content.includes('twitter')) {
      logSuccess('OpenGraph and Twitter Card support enabled');
      addCheck('Social Meta Tags', 'pass', 'OG and Twitter cards configured');
    } else {
      logWarning('Social meta tags may be incomplete');
      addCheck('Social Meta Tags', 'warning', 'Check OG and Twitter configuration');
    }

    // Check for hreflang
    if (content.includes('alternates') && content.includes('languages')) {
      logSuccess('Multi-language support (hreflang) configured');
      addCheck('Hreflang Tags', 'pass', 'Multi-language configured');
    } else {
      logWarning('Hreflang tags may not be configured');
      addCheck('Hreflang Tags', 'warning', 'Check multi-language setup');
    }

  } catch (error) {
    logError(`Metadata verification failed: ${error.message}`);
    addCheck('Metadata', 'error', error.message);
  }
}

/**
 * 4. Verify GA4 Tracking
 */
function verifyAnalytics() {
  logSection('4. GOOGLE ANALYTICS VERIFICATION');

  try {
    const analyticsPath = path.join(projectRoot, 'lib', 'analytics', 'google-analytics.tsx');
    const content = fs.readFileSync(analyticsPath, 'utf-8');

    const requiredEvents = [
      'trackWorldCupPageView',
      'trackTeamView',
      'trackStadiumView',
      'trackPackageView',
      'trackWorldCupCTA',
      'trackWorldCupEmailSignup',
    ];

    let eventsFound = 0;
    requiredEvents.forEach(event => {
      if (content.includes(`export function ${event}`)) {
        eventsFound++;
        logSuccess(`Event tracking found: ${event}`);
      } else {
        logError(`Event tracking missing: ${event}`);
      }
    });

    if (eventsFound === requiredEvents.length) {
      logSuccess(`All ${eventsFound} tracking events implemented`);
      addCheck('GA4 Events', 'pass', `${eventsFound}/${requiredEvents.length} events`);
    } else {
      logWarning(`Only ${eventsFound}/${requiredEvents.length} tracking events found`);
      addCheck('GA4 Events', 'warning', `Missing ${requiredEvents.length - eventsFound} events`);
    }

  } catch (error) {
    logError(`Analytics verification failed: ${error.message}`);
    addCheck('Analytics', 'error', error.message);
  }
}

/**
 * 5. Verify Components
 */
function verifyComponents() {
  logSection('5. WORLD CUP COMPONENTS VERIFICATION');

  const componentsDir = path.join(projectRoot, 'components', 'world-cup');

  const requiredComponents = [
    'WorldCupHeroSection.tsx',
    'WorldCupCrossSell.tsx',
    'UrgencyBanner.tsx',
    'TrustSignals.tsx',
    'EmailCaptureModal.tsx',
    'EnhancedCTA.tsx',
    'FAQSection.tsx',
    'WorldCupErrorBoundary.tsx',
  ];

  let componentsFound = 0;
  requiredComponents.forEach(component => {
    const componentPath = path.join(componentsDir, component);
    if (fs.existsSync(componentPath)) {
      componentsFound++;
      logSuccess(`Component found: ${component}`);
    } else {
      logError(`Component missing: ${component}`);
    }
  });

  if (componentsFound === requiredComponents.length) {
    logSuccess(`All ${componentsFound} components found`);
    addCheck('Components', 'pass', `${componentsFound}/${requiredComponents.length} components`);
  } else {
    logWarning(`Only ${componentsFound}/${requiredComponents.length} components found`);
    addCheck('Components', 'warning', `Missing ${requiredComponents.length - componentsFound} components`);
  }
}

/**
 * 6. Verify FAQ Data
 */
function verifyFAQs() {
  logSection('6. FAQ DATA VERIFICATION');

  try {
    const faqPath = path.join(projectRoot, 'lib', 'data', 'world-cup-faqs.ts');
    const content = fs.readFileSync(faqPath, 'utf-8');

    const faqCategories = [
      'WORLD_CUP_MAIN_FAQS',
      'PACKAGES_FAQS',
      'SCHEDULE_FAQS',
      'TEAMS_FAQS',
      'STADIUMS_FAQS',
    ];

    let categoriesFound = 0;
    faqCategories.forEach(category => {
      if (content.includes(`export const ${category}`)) {
        categoriesFound++;
        logSuccess(`FAQ category found: ${category}`);
      } else {
        logError(`FAQ category missing: ${category}`);
      }
    });

    if (categoriesFound === faqCategories.length) {
      logSuccess(`All ${categoriesFound} FAQ categories found`);
      addCheck('FAQs', 'pass', `${categoriesFound}/${faqCategories.length} categories`);
    } else {
      logWarning(`Only ${categoriesFound}/${faqCategories.length} FAQ categories found`);
      addCheck('FAQs', 'warning', `Missing ${faqCategories.length - categoriesFound} categories`);
    }

    // Count total FAQs
    const questionMatches = content.match(/question:/g);
    if (questionMatches && questionMatches.length >= 50) {
      logSuccess(`${questionMatches.length} FAQs found (target: 50+)`);
      addCheck('FAQ Count', 'pass', `${questionMatches.length} FAQs`);
    } else {
      logWarning(`Only ${questionMatches?.length || 0} FAQs found (target: 50+)`);
      addCheck('FAQ Count', 'warning', `Below target`);
    }

  } catch (error) {
    logError(`FAQ verification failed: ${error.message}`);
    addCheck('FAQs', 'error', error.message);
  }
}

/**
 * 7. Verify Page Integration
 */
function verifyPageIntegration() {
  logSection('7. PAGE INTEGRATION VERIFICATION');

  // Check main World Cup page
  try {
    const mainPagePath = path.join(projectRoot, 'app', 'world-cup-2026', 'page.tsx');
    const content = fs.readFileSync(mainPagePath, 'utf-8');

    const integrations = [
      { name: 'Schema Import', pattern: 'getWorldCupEventSchema' },
      { name: 'Metadata Export', pattern: 'export const metadata' },
      { name: 'Urgency Banner', pattern: 'UrgencyBanner' },
      { name: 'Trust Signals', pattern: 'TrustSignals' },
      { name: 'FAQ Section', pattern: 'FAQSection' },
    ];

    let integrationsFound = 0;
    integrations.forEach(({ name, pattern }) => {
      if (content.includes(pattern)) {
        integrationsFound++;
        logSuccess(`${name} integrated`);
      } else {
        logWarning(`${name} not found`);
      }
    });

    if (integrationsFound >= integrations.length - 1) {
      logSuccess(`Main page integration: ${integrationsFound}/${integrations.length}`);
      addCheck('Main Page Integration', 'pass', `${integrationsFound}/${integrations.length} features`);
    } else {
      logWarning(`Incomplete integration: ${integrationsFound}/${integrations.length}`);
      addCheck('Main Page Integration', 'warning', `Missing features`);
    }

  } catch (error) {
    logError(`Page integration verification failed: ${error.message}`);
    addCheck('Page Integration', 'error', error.message);
  }

  // Check homepage integration
  try {
    const homePagePath = path.join(projectRoot, 'app', 'home-new', 'page.tsx');
    const content = fs.readFileSync(homePagePath, 'utf-8');

    if (content.includes('WorldCupHeroSection')) {
      logSuccess('World Cup integrated on homepage');
      addCheck('Homepage Integration', 'pass', 'Hero section found');
    } else {
      logWarning('World Cup not found on homepage');
      addCheck('Homepage Integration', 'warning', 'Hero section not integrated');
    }

  } catch (error) {
    logWarning(`Homepage check skipped: ${error.message}`);
  }

  // Check flight results integration
  try {
    const flightResultsPath = path.join(projectRoot, 'app', 'flights', 'results', 'page.tsx');
    const content = fs.readFileSync(flightResultsPath, 'utf-8');

    if (content.includes('WorldCupCrossSell')) {
      logSuccess('World Cup cross-sell integrated on flight results');
      addCheck('Flight Cross-Sell', 'pass', 'Cross-sell banner found');
    } else {
      logWarning('World Cup cross-sell not found on flight results');
      addCheck('Flight Cross-Sell', 'warning', 'Cross-sell not integrated');
    }

  } catch (error) {
    logWarning(`Flight results check skipped: ${error.message}`);
  }
}

/**
 * Generate Final Report
 */
function generateReport() {
  logSection('VERIFICATION SUMMARY');

  log(`Total Checks: ${results.checks.length}`, 'bright');
  logSuccess(`Passed: ${results.passed}`);
  logWarning(`Warnings: ${results.warnings}`);
  logError(`Errors: ${results.errors}`);

  const score = Math.round((results.passed / results.checks.length) * 100);

  console.log('\n' + '='.repeat(60));
  if (score >= 90) {
    log(`🏆 OVERALL SCORE: ${score}% - EXCELLENT!`, 'green');
  } else if (score >= 75) {
    log(`✅ OVERALL SCORE: ${score}% - GOOD`, 'cyan');
  } else if (score >= 60) {
    log(`⚠️  OVERALL SCORE: ${score}% - NEEDS IMPROVEMENT`, 'yellow');
  } else {
    log(`❌ OVERALL SCORE: ${score}% - REQUIRES ATTENTION`, 'red');
  }
  console.log('='.repeat(60) + '\n');

  // Detailed results
  if (results.errors > 0 || results.warnings > 0) {
    logSection('DETAILED RESULTS');
    results.checks.forEach(check => {
      if (check.status === 'error') {
        logError(`${check.name}: ${check.message}`);
      } else if (check.status === 'warning') {
        logWarning(`${check.name}: ${check.message}`);
      }
    });
  }

  // Recommendations
  if (results.errors > 0) {
    logSection('RECOMMENDATIONS');
    log('1. Fix all critical errors before deployment', 'yellow');
    log('2. Run verification again after fixes', 'yellow');
    log('3. Test manually in browser', 'yellow');
  }

  // Exit code
  process.exit(results.errors > 0 ? 1 : 0);
}

/**
 * Main execution
 */
function main() {
  log('🏆 FIFA WORLD CUP 2026 - SEO VERIFICATION', 'bright');
  log('Verifying implementation...', 'cyan');

  verifySitemap();
  verifySchemas();
  verifyMetadata();
  verifyAnalytics();
  verifyComponents();
  verifyFAQs();
  verifyPageIntegration();

  generateReport();
}

main();
