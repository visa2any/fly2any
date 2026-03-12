/**
 * SITEMAP INDEX - References all sub-sitemaps
 *
 * Structure:
 * - /sitemaps/routes.xml → 50,000+ flight routes
 * - /sitemaps/cities.xml → US & International cities
 * - /sitemaps/destinations.xml → Destination landing pages
 * - /sitemaps/blog.xml → Blog posts & guides
 *
 * @version 3.0.0
 */

import { MetadataRoute } from 'next';

export const revalidate = 86400; // Revalidate once a day

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Top-performing flight routes from GSC data (position < 15, high impressions)
  // These get priority crawling to improve rankings
  const topRoutes = [
    'den-to-lhr', 'gru-to-cdg', 'jfk-to-lax', 'mdw-to-jfk', 'gru-to-gig',
    'smf-to-fco', 'dfw-to-den', 'bcn-to-iah', 'ord-to-mke', 'cdg-to-gru',
    'fra-to-ist', 'lax-to-jfk', 'jfk-to-sfo', 'gig-to-fco', 'mex-to-nrt',
    'lga-to-fco', 'nrt-to-ist', 'cdg-to-nrt', 'ewr-to-sea', 'stl-to-lga',
    'gru-to-fco', 'jfk-to-sea', 'lax-to-tokyo', 'dca-to-atl', 'sfo-to-jfk',
    'ord-to-phx', 'lax-to-phx', 'nrt-to-lax', 'ord-to-atl', 'ord-to-sfo',
    'sea-to-fco', 'den-to-dca', 'dxb-to-jfk', 'miami-to-cancun',
    'mco-to-syd', 'den-to-sea', 'las-to-atl', 'mco-to-atl',
  ];

  // Core static pages + top-performing routes
  return [
    // === Core Pages ===
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/flights`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/hotels`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/cars`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/packages`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/tours`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/activities`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/transfers`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/deals`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/tripmatch`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/travel-guide`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/travel-insurance`, lastModified: now, changeFrequency: 'daily', priority: 0.92 },
    { url: `${SITE_URL}/solo-travel`, lastModified: now, changeFrequency: 'weekly', priority: 0.93 },
    { url: `${SITE_URL}/travel-planning`, lastModified: now, changeFrequency: 'daily', priority: 0.94 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/journeys`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/plan-my-trip`, lastModified: now, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/multi-city`, lastModified: now, changeFrequency: 'weekly', priority: 0.88 },
    { url: `${SITE_URL}/group-travel`, lastModified: now, changeFrequency: 'weekly', priority: 0.88 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/world-cup-2026`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/blog/usa-world-cup-visa-guide-2026`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/usa`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/refer`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/affiliate`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/team`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },

    // === Top-Performing Routes (GSC position < 15, prioritized for crawling) ===
    ...topRoutes.map(route => ({
      url: `${SITE_URL}/flights/${route}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),

    // === Hotel City Landing Pages ===
    ...['new-york', 'los-angeles', 'miami', 'las-vegas', 'chicago', 'san-francisco', 'orlando', 'seattle', 'boston', 'denver'].map(city => ({
      url: `${SITE_URL}/hotels/in/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),

    // === Tours City Landing Pages ===
    ...['new-york', 'los-angeles', 'miami', 'las-vegas', 'chicago', 'san-francisco', 'orlando', 'paris', 'rome', 'london', 'barcelona', 'tokyo', 'cancun', 'dubai'].map(city => ({
      url: `${SITE_URL}/tours/in/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),

    // === Activities City Landing Pages ===
    ...['new-york', 'los-angeles', 'miami', 'las-vegas', 'chicago', 'san-francisco', 'orlando'].map(city => ({
      url: `${SITE_URL}/activities/in/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),

    // === Car Rental City Landing Pages ===
    ...['new-york', 'los-angeles', 'miami', 'las-vegas', 'chicago', 'san-francisco', 'orlando', 'denver', 'seattle', 'dallas', 'atlanta', 'boston'].map(city => ({
      url: `${SITE_URL}/cars/in/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),

    // === Airport Transfer City Landing Pages ===
    ...['new-york', 'los-angeles', 'miami', 'las-vegas', 'chicago', 'san-francisco', 'orlando', 'london', 'paris', 'dubai', 'cancun', 'rome', 'bangkok', 'istanbul'].map(city => ({
      url: `${SITE_URL}/transfers/at/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
  ];
}
