/**
 * ADVANCED ROBOTS.TXT CONFIGURATION - 2025 EDITION
 *
 * Controls search engine crawler access with:
 * - AI bot management (ChatGPT, Claude, Perplexity)
 * - Search engine crawler optimization
 * - Rate limiting for aggressive bots
 * - Strategic content access control
 *
 * @version 2.0.0
 * @last-updated 2025-01-19
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // === MAJOR SEARCH ENGINES (Full Access) ===
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Googlebot-Video'],
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/booking/*/confirmation',
          '/_next/static/',
          '/private/',
        ],
        crawlDelay: 0, // No delay for Google
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/booking/*/confirmation',
          '/_next/static/',
          '/private/',
        ],
        crawlDelay: 1,
      },

      // === AI SEARCH ENGINES (Controlled Access) ===
      // Allow AI engines to index public content for answering queries
      {
        userAgent: 'Anthropic-AI', // Claude AI
        allow: [
          '/',
          '/flights/',
          '/hotels/',
          '/blog/',
          '/travel-guide/',
          '/faq/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/private/',
        ],
        crawlDelay: 5, // Respectful crawl rate
      },
      {
        userAgent: 'PerplexityBot', // Perplexity AI
        allow: [
          '/',
          '/flights/',
          '/hotels/',
          '/blog/',
          '/travel-guide/',
          '/faq/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/private/',
        ],
        crawlDelay: 5,
      },
      {
        userAgent: 'Claude-Web', // Alternative Claude crawler
        allow: [
          '/',
          '/flights/',
          '/hotels/',
          '/blog/',
          '/travel-guide/',
          '/faq/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/private/',
        ],
        crawlDelay: 5,
      },

      // === AI SEARCH ENGINES - ChatGPT, Google AI, Cohere (Full Access) ===
      // GPTBot powers ChatGPT Search - MUST be allowed for AI visibility
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'cohere-ai'],
        allow: [
          '/',
          '/flights/',
          '/hotels/',
          '/blog/',
          '/travel-guide/',
          '/faq/',
          '/deals/',
          '/destinations/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/private/',
          '/booking/*/confirmation',
        ],
        crawlDelay: 2,
      },
      {
        userAgent: 'Google-Extended', // Google Gemini/AI search
        allow: [
          '/',
          '/flights/',
          '/hotels/',
          '/blog/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/private/',
        ],
        crawlDelay: 3,
      },

      // === AI TRAINING ONLY BOTS (Blocked) ===
      // Block pure data extraction bots not used for search
      {
        userAgent: [
          'CCBot', // Common Crawl (training only)
          'Diffbot', // Data extraction
          'Bytespider', // ByteDance (TikTok)
          'FacebookBot', // Meta AI training
          'img2dataset', // Image scraper
          'Omgilibot', // Data scraper
        ],
        disallow: '/',
      },

      // === SOCIAL MEDIA BOTS (Preview Access Only) ===
      {
        userAgent: ['Twitterbot', 'facebookexternalhit', 'LinkedInBot', 'WhatsApp'],
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
        ],
      },

      // === AGGRESSIVE CRAWLERS (Rate Limited) ===
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'BLEXBot',
        ],
        crawlDelay: 10, // Slow them down
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/private/',
        ],
      },

      // === DEFAULT RULE (Conservative Access) ===
      {
        userAgent: '*',
        allow: [
          '/',
          '/flights/',
          '/hotels/',
          '/cars/',
          '/packages/',
          '/tours/',
          '/blog/',
          '/travel-guide/',
          '/deals/',
          '/explore/',
          '/faq/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/agent/',
          '/affiliate/',
          '/auth/',
          '/booking/*/confirmation',
          '/_next/static/',
          '/private/',
          '/*.json$', // Block JSON files
          '/*?*sort=', // Block sort parameters
          '/*?*filter=', // Block filter parameters
          '/*?*page=', // Block pagination parameters
        ],
        crawlDelay: 2,
      },
    ],

    // Sitemap references
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-flights.xml`,
      `${SITE_URL}/sitemap-hotels.xml`,
      `${SITE_URL}/sitemap-blog.xml`,
      `${SITE_URL}/sitemap-destinations.xml`,
    ],

    // Host declaration (helps with multi-domain setups)
    host: SITE_URL,
  };
}
