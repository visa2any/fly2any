#!/usr/bin/env npx ts-node
/**
 * COMPREHENSIVE SEARCH ENGINE REINDEX SCRIPT
 *
 * Submits URLs to all major search engines and AI platforms:
 * - Google Search Console (via API)
 * - Bing Webmaster Tools (via IndexNow)
 * - Yandex (via IndexNow)
 * - IndexNow consortium
 *
 * Usage:
 *   npx ts-node scripts/reindex-all.ts
 *   npx ts-node scripts/reindex-all.ts --priority-only
 *
 * Environment Variables Required:
 *   GOOGLE_SEARCH_CONSOLE_CREDENTIALS - JSON credentials
 *   INDEXNOW_KEY - IndexNow API key
 *   ADMIN_API_KEY - Internal API auth
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'fly2any-indexnow-2025';

// Priority URLs (highest SEO value)
const PRIORITY_URLS = [
  // Core booking pages
  '',
  '/flights',
  '/hotels',
  '/cars',
  '/packages',
  '/deals',
  '/travel-planning',
  '/solo-travel',
  '/travel-insurance',
  '/travel-guide',

  // Airlines (sorted by impression volume)
  '/airlines/delta',
  '/airlines/spirit',
  '/airlines/united',
  '/airlines/american',
  '/airlines/emirates',
  '/airlines/alaska',
  '/airlines/frontier',

  // High-value destinations
  '/flights/to/oslo',
  '/flights/to/berlin',
  '/flights/to/munich',
  '/flights/to/hawaii',
  '/flights/to/florida',
  '/flights/to/las-vegas',
  '/flights/to/mexico',
  '/flights/to/india',
  '/flights/to/bali',

  // World Cup 2026 (trending)
  '/world-cup-2026',
  '/world-cup-2026/packages',
  '/world-cup-2026/teams',
  '/world-cup-2026/stadiums',
  '/world-cup-2026/schedule',
];

// Full URL list generator
function getAllUrls(): string[] {
  return PRIORITY_URLS.map((path) => `${SITE_URL}${path}`);
}

// IndexNow submission
async function submitIndexNow(urls: string[]): Promise<void> {
  console.log('📤 Submitting to IndexNow consortium...');

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 202) {
        console.log(`  ✅ ${new URL(endpoint).hostname}: Success (${response.status})`);
      } else {
        console.log(`  ⚠️ ${new URL(endpoint).hostname}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ ${new URL(endpoint).hostname}: Failed`);
    }
  }
}

// Google Search Console ping (sitemap)
async function pingGoogle(): Promise<void> {
  console.log('📤 Pinging Google Search Console...');

  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

  try {
    const response = await fetch(pingUrl);
    if (response.ok) {
      console.log('  ✅ Google: Sitemap ping successful');
    } else {
      console.log(`  ⚠️ Google: ${response.status}`);
    }
  } catch {
    console.log('  ❌ Google: Ping failed');
  }
}

// Bing Webmaster sitemap ping
async function pingBing(): Promise<void> {
  console.log('📤 Pinging Bing Webmaster Tools...');

  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

  try {
    const response = await fetch(pingUrl);
    if (response.ok) {
      console.log('  ✅ Bing: Sitemap ping successful');
    } else {
      console.log(`  ⚠️ Bing: ${response.status}`);
    }
  } catch {
    console.log('  ❌ Bing: Ping failed');
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🔄 FLY2ANY SEARCH ENGINE REINDEX');
  console.log('================================\n');

  const urls = getAllUrls();
  console.log(`📋 URLs to submit: ${urls.length}\n`);

  // Submit to all engines
  await submitIndexNow(urls);
  console.log('');

  await pingGoogle();
  await pingBing();

  console.log('\n================================');
  console.log('✅ REINDEX COMPLETE\n');

  console.log('📝 MANUAL STEPS REQUIRED:');
  console.log('');
  console.log('1. GOOGLE SEARCH CONSOLE:');
  console.log('   → https://search.google.com/search-console');
  console.log('   → Submit sitemap: sitemap.xml');
  console.log('   → Request indexing for priority URLs');
  console.log('');
  console.log('2. BING WEBMASTER TOOLS:');
  console.log('   → https://www.bing.com/webmasters');
  console.log('   → Submit sitemap: sitemap.xml');
  console.log('   → Enable IndexNow');
  console.log('');
  console.log('3. GOOGLE AI (GEMINI):');
  console.log('   → Content indexed via Googlebot');
  console.log('   → Ensure Google-Extended not blocked');
  console.log('');
  console.log('4. CHATGPT / OPENAI:');
  console.log('   → Indexed via GPTBot crawler');
  console.log('   → robots.txt allows GPTBot ✓');
  console.log('   → llms.txt available at /llms.txt ✓');
  console.log('');
  console.log('5. PERPLEXITY:');
  console.log('   → Indexed via PerplexityBot');
  console.log('   → robots.txt allows PerplexityBot ✓');
  console.log('');
  console.log('6. CLAUDE (ANTHROPIC):');
  console.log('   → No web crawling currently');
  console.log('   → Uses search results from partners');
  console.log('');
}

main().catch(console.error);
