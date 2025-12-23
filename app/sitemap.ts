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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core static pages only - sub-sitemaps handle the rest
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/flights`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/hotels`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/cars`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/packages`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${SITE_URL}/tours`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/deals`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/tripmatch`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/travel-guide`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/travel-insurance`, lastModified: now, changeFrequency: 'daily', priority: 0.92 },
    { url: `${SITE_URL}/solo-travel`, lastModified: now, changeFrequency: 'weekly', priority: 0.93 },
    { url: `${SITE_URL}/travel-planning`, lastModified: now, changeFrequency: 'daily', priority: 0.94 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/world-cup-2026`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/usa`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
