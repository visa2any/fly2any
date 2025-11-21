#!/usr/bin/env node

/**
 * SEO DEPLOYMENT VERIFICATION SCRIPT
 *
 * Validates SEO implementation before and after deployment
 * Checks:
 * - Metadata presence and quality
 * - Schema markup validity
 * - Sitemap generation
 * - Robots.txt configuration
 * - Core Web Vitals
 * - Page performance
 *
 * Usage:
 *   node scripts/verify-seo-deployment.mjs
 *   node scripts/verify-seo-deployment.mjs --url=https://www.fly2any.com
 *   node scripts/verify-seo-deployment.mjs --local
 *
 * @version 1.0.0
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Configuration
const DEFAULT_BASE_URL = 'https://www.fly2any.com';
const LOCAL_BASE_URL = 'http://localhost:3000';

// Parse command line arguments
const args = process.argv.slice(2);
const isLocal = args.includes('--local');
const urlArg = args.find(arg => arg.startsWith('--url='));
const BASE_URL = urlArg ? urlArg.split('=')[1] : (isLocal ? LOCAL_BASE_URL : DEFAULT_BASE_URL);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  passed: 0,
  warnings: 0,
  failed: 0,
  tests: [],
};

/**
 * Fetch URL and return response
 */
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Log test result
 */
function logTest(name, passed, severity = 'error', details = '') {
  const icon = passed ? '✓' : (severity === 'warning' ? '⚠' : '✗');
  const color = passed ? colors.green : (severity === 'warning' ? colors.yellow : colors.red);

  console.log(`${color}${icon}${colors.reset} ${name}`);

  if (!passed && details) {
    console.log(`  ${colors.cyan}→ ${details}${colors.reset}`);
  }

  results.tests.push({ name, passed, severity, details });

  if (passed) {
    results.passed++;
  } else if (severity === 'warning') {
    results.warnings++;
  } else {
    results.failed++;
  }
}

/**
 * Check if HTML contains expected content
 */
function checkHtmlContains(html, pattern, testName, details) {
  const found = pattern.test ? pattern.test(html) : html.includes(pattern);
  logTest(testName, found, 'error', details);
  return found;
}

/**
 * Extract JSON-LD schemas from HTML
 */
function extractSchemas(html) {
  const schemaMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) || [];
  return schemaMatches.map(match => {
    try {
      const jsonStr = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
      return JSON.parse(jsonStr);
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Test 1: Homepage Metadata
 */
async function testHomepageMetadata() {
  console.log(`\n${colors.bright}${colors.blue}Testing Homepage Metadata...${colors.reset}`);

  try {
    const response = await fetchUrl(BASE_URL);
    const html = response.body;

    // Title tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    logTest(
      'Title tag present',
      title.length > 0 && title.length <= 70,
      'error',
      title.length > 70 ? `Title too long: ${title.length} chars` : 'Missing title'
    );

    // Meta description
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    const description = descMatch ? descMatch[1] : '';
    logTest(
      'Meta description present',
      description.length >= 120 && description.length <= 170,
      'warning',
      description.length > 170 ? `Too long: ${description.length} chars` : `Too short: ${description.length} chars`
    );

    // Canonical URL
    checkHtmlContains(html, /<link rel="canonical"/, 'Canonical URL present', 'Missing canonical tag');

    // Open Graph
    checkHtmlContains(html, /<meta property="og:title"/, 'Open Graph title present', 'Missing og:title');
    checkHtmlContains(html, /<meta property="og:description"/, 'Open Graph description present', 'Missing og:description');
    checkHtmlContains(html, /<meta property="og:image"/, 'Open Graph image present', 'Missing og:image');

    // Twitter Card
    checkHtmlContains(html, /<meta name="twitter:card"/, 'Twitter Card present', 'Missing twitter:card');

    // Viewport
    checkHtmlContains(html, /<meta name="viewport"/, 'Viewport meta tag present', 'Missing viewport tag');

  } catch (error) {
    logTest('Homepage fetch', false, 'error', error.message);
  }
}

/**
 * Test 2: Schema Markup
 */
async function testSchemaMarkup() {
  console.log(`\n${colors.bright}${colors.blue}Testing Schema Markup...${colors.reset}`);

  try {
    const response = await fetchUrl(BASE_URL);
    const html = response.body;
    const schemas = extractSchemas(html);

    logTest('Structured data present', schemas.length > 0, 'error', 'No JSON-LD schemas found');

    if (schemas.length > 0) {
      // Check for Organization schema
      const hasOrganization = schemas.some(s => s['@type'] === 'Organization');
      logTest('Organization schema present', hasOrganization, 'warning', 'Organization schema missing');

      // Check for WebSite schema
      const hasWebSite = schemas.some(s => s['@type'] === 'WebSite');
      logTest('WebSite schema present', hasWebSite, 'warning', 'WebSite schema missing');

      // Check for SoftwareApplication schema
      const hasSoftwareApp = schemas.some(s => s['@type'] === 'SoftwareApplication');
      logTest('SoftwareApplication schema present', hasSoftwareApp, 'warning', 'SoftwareApplication schema missing');

      // Validate schema structure
      schemas.forEach((schema, index) => {
        const hasContext = schema['@context'] === 'https://schema.org';
        const hasType = schema['@type'] !== undefined;
        logTest(
          `Schema ${index + 1} valid structure`,
          hasContext && hasType,
          'error',
          !hasContext ? 'Missing @context' : 'Missing @type'
        );
      });
    }

  } catch (error) {
    logTest('Schema markup fetch', false, 'error', error.message);
  }
}

/**
 * Test 3: Sitemap
 */
async function testSitemap() {
  console.log(`\n${colors.bright}${colors.blue}Testing Sitemap...${colors.reset}`);

  try {
    const response = await fetchUrl(`${BASE_URL}/sitemap.xml`);

    logTest('Sitemap accessible', response.statusCode === 200, 'error', `Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const xml = response.body;

      // Check XML structure
      checkHtmlContains(xml, /<urlset/, 'Sitemap XML structure valid', 'Missing <urlset> tag');

      // Count URLs
      const urlMatches = xml.match(/<url>/g) || [];
      const urlCount = urlMatches.length;
      logTest('Sitemap contains URLs', urlCount > 0, 'error', `Found ${urlCount} URLs`);
      logTest('Sitemap substantial', urlCount >= 100, 'warning', `Only ${urlCount} URLs (expect 100+)`);

      // Check for priority tags
      checkHtmlContains(xml, /<priority>/, 'Priority tags present', 'Missing priority optimization');

      // Check for changefreq
      checkHtmlContains(xml, /<changefreq>/, 'Change frequency tags present', 'Missing changefreq tags');

      // Check for lastmod
      checkHtmlContains(xml, /<lastmod>/, 'Last modified dates present', 'Missing lastmod dates');
    }

  } catch (error) {
    logTest('Sitemap fetch', false, 'error', error.message);
  }
}

/**
 * Test 4: Robots.txt
 */
async function testRobotsTxt() {
  console.log(`\n${colors.bright}${colors.blue}Testing Robots.txt...${colors.reset}`);

  try {
    const response = await fetchUrl(`${BASE_URL}/robots.txt`);

    logTest('Robots.txt accessible', response.statusCode === 200, 'error', `Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const txt = response.body;

      // Check for user-agent directives
      checkHtmlContains(txt, /User-agent:/i, 'User-agent directives present', 'Missing user-agent rules');

      // Check for sitemap reference
      checkHtmlContains(txt, /Sitemap:/i, 'Sitemap reference present', 'Missing sitemap URL');

      // Check for Googlebot
      checkHtmlContains(txt, /Googlebot/i, 'Googlebot rules present', 'Missing Googlebot configuration');

      // Check for AI bots (should be controlled)
      const hasAIBotRules = /Anthropic-AI|PerplexityBot|Claude-Web/i.test(txt);
      logTest('AI search bot rules present', hasAIBotRules, 'warning', 'No AI search bot configuration');

      // Check for training bot blocks
      const hasTrainingBlocks = /GPTBot|CCBot/i.test(txt);
      logTest('AI training bots blocked', hasTrainingBlocks, 'warning', 'Consider blocking training bots');
    }

  } catch (error) {
    logTest('Robots.txt fetch', false, 'error', error.message);
  }
}

/**
 * Test 5: Flight Route Page
 */
async function testFlightRoutePage() {
  console.log(`\n${colors.bright}${colors.blue}Testing Flight Route Page (Programmatic SEO)...${colors.reset}`);

  try {
    const response = await fetchUrl(`${BASE_URL}/flights/jfk-to-lax`);

    logTest('Route page accessible', response.statusCode === 200, 'error', `Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const html = response.body;

      // Title includes route
      checkHtmlContains(html, /JFK.*LAX|New York.*Los Angeles/i, 'Title contains route details', 'Generic title');

      // Check for Flight schema
      const schemas = extractSchemas(html);
      const hasFlightSchema = schemas.some(s => s['@type'] === 'Flight');
      logTest('Flight schema present', hasFlightSchema, 'warning', 'Flight schema missing');

      // Check for FAQ schema
      const hasFAQSchema = schemas.some(s => s['@type'] === 'FAQPage');
      logTest('FAQ schema present', hasFAQSchema, 'warning', 'FAQ schema missing');

      // Check for breadcrumbs
      checkHtmlContains(html, /breadcrumb/i, 'Breadcrumb navigation present', 'No breadcrumb found');

      // Check for content length
      const textContent = html.replace(/<[^>]*>/g, '');
      const wordCount = textContent.split(/\s+/).length;
      logTest('Sufficient content', wordCount >= 300, 'warning', `Only ${wordCount} words (expect 300+)`);
    }

  } catch (error) {
    logTest('Route page fetch', false, 'error', error.message);
  }
}

/**
 * Test 6: Destination Page
 */
async function testDestinationPage() {
  console.log(`\n${colors.bright}${colors.blue}Testing Destination Page...${colors.reset}`);

  try {
    const response = await fetchUrl(`${BASE_URL}/destinations/new-york`);

    logTest('Destination page accessible', response.statusCode === 200, 'error', `Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const html = response.body;

      // Check for TouristDestination schema
      const schemas = extractSchemas(html);
      const hasTouristSchema = schemas.some(s => s['@type'] === 'TouristDestination');
      logTest('TouristDestination schema present', hasTouristSchema, 'warning', 'TouristDestination schema missing');

      // Check for geo coordinates
      const hasGeo = html.includes('geo') || html.includes('GeoCoordinates');
      logTest('Geo coordinates present', hasGeo, 'warning', 'Location data missing');

      // Check content quality
      checkHtmlContains(html, /attractions|visit|travel guide/i, 'Destination content present', 'Generic content');
    }

  } catch (error) {
    // Destination page might not exist yet - warning instead of error
    logTest('Destination page fetch', false, 'warning', `Could not access: ${error.message}`);
  }
}

/**
 * Test 7: Airline Page
 */
async function testAirlinePage() {
  console.log(`\n${colors.bright}${colors.blue}Testing Airline Page...${colors.reset}`);

  try {
    const response = await fetchUrl(`${BASE_URL}/airlines/delta-air-lines`);

    logTest('Airline page accessible', response.statusCode === 200, 'error', `Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const html = response.body;

      // Check for Airline schema
      const schemas = extractSchemas(html);
      const hasAirlineSchema = schemas.some(s => s['@type'] === 'Airline');
      logTest('Airline schema present', hasAirlineSchema, 'warning', 'Airline schema missing');

      // Check for aggregate rating
      const hasRating = html.includes('AggregateRating') || html.includes('ratingValue');
      logTest('Rating schema present', hasRating, 'warning', 'Review/rating data missing');
    }

  } catch (error) {
    logTest('Airline page fetch', false, 'warning', `Could not access: ${error.message}`);
  }
}

/**
 * Test 8: RSS Feed
 */
async function testRSSFeed() {
  console.log(`\n${colors.bright}${colors.blue}Testing RSS Feed...${colors.reset}`);

  try {
    const response = await fetchUrl(`${BASE_URL}/rss.xml`);

    logTest('RSS feed accessible', response.statusCode === 200, 'warning', `Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const xml = response.body;

      checkHtmlContains(xml, /<rss/, 'RSS XML structure valid', 'Invalid RSS format');
      checkHtmlContains(xml, /<channel>/, 'RSS channel present', 'Missing channel tag');
      checkHtmlContains(xml, /<item>/, 'RSS items present', 'No blog posts found');
    }

  } catch (error) {
    logTest('RSS feed fetch', false, 'warning', `RSS not available: ${error.message}`);
  }
}

/**
 * Test 9: Performance Headers
 */
async function testPerformanceHeaders() {
  console.log(`\n${colors.bright}${colors.blue}Testing Performance & Security Headers...${colors.reset}`);

  try {
    const response = await fetchUrl(BASE_URL);
    const headers = response.headers;

    // Cache headers
    const hasCacheControl = headers['cache-control'] !== undefined;
    logTest('Cache-Control header present', hasCacheControl, 'warning', 'Missing cache optimization');

    // Security headers
    const hasXFrameOptions = headers['x-frame-options'] !== undefined;
    logTest('X-Frame-Options header present', hasXFrameOptions, 'warning', 'Missing clickjacking protection');

    // Content type
    const contentType = headers['content-type'] || '';
    logTest('Content-Type header present', contentType.includes('text/html'), 'error', 'Unexpected content type');

  } catch (error) {
    logTest('Headers check', false, 'error', error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  FLY2ANY SEO DEPLOYMENT VERIFICATION${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}`);
  console.log(`\n${colors.blue}Target URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.blue}Mode: ${isLocal ? 'LOCAL' : 'PRODUCTION'}${colors.reset}\n`);

  await testHomepageMetadata();
  await testSchemaMarkup();
  await testSitemap();
  await testRobotsTxt();
  await testFlightRoutePage();
  await testDestinationPage();
  await testAirlinePage();
  await testRSSFeed();
  await testPerformanceHeaders();

  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  TEST SUMMARY${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}\n`);

  const total = results.passed + results.warnings + results.failed;
  const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

  console.log(`${colors.green}✓ Passed:   ${results.passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);
  console.log(`${colors.red}✗ Failed:   ${results.failed}${colors.reset}`);
  console.log(`\n${colors.bright}Total Tests: ${total}${colors.reset}`);
  console.log(`${colors.bright}Pass Rate: ${passRate}%${colors.reset}\n`);

  // Overall status
  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bright}✓ SEO DEPLOYMENT VERIFICATION PASSED${colors.reset}\n`);
    process.exit(0);
  } else if (results.failed <= 5) {
    console.log(`${colors.yellow}${colors.bright}⚠ SEO DEPLOYMENT VERIFICATION PASSED WITH WARNINGS${colors.reset}`);
    console.log(`${colors.yellow}  Address ${results.failed} critical issue(s) before production deployment${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}✗ SEO DEPLOYMENT VERIFICATION FAILED${colors.reset}`);
    console.log(`${colors.red}  Fix ${results.failed} critical issue(s) before deploying${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
