/**
 * ROUTES SITEMAP - /sitemaps/routes.xml
 * 50,000 flight route pages (Google max per sitemap)
 */

import { NextResponse } from 'next/server';
import {
  TOP_US_AIRPORTS,
  TOP_INTERNATIONAL_AIRPORTS,
  calculateRoutePriority,
  formatRouteSlug,
} from '@/lib/seo/sitemap-helpers';

export const dynamic = 'force-static';
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const urls: string[] = [];

  // All US airports (50 codes)
  const usAirports = TOP_US_AIRPORTS;

  // All International airports (50 codes)
  const intlAirports = TOP_INTERNATIONAL_AIRPORTS;

  // 1. US Domestic routes: 50 × 49 = 2,450 routes
  for (let i = 0; i < usAirports.length; i++) {
    for (let j = 0; j < usAirports.length; j++) {
      if (i !== j) {
        const origin = usAirports[i];
        const dest = usAirports[j];
        const slug = formatRouteSlug(origin, dest);
        const priority = calculateRoutePriority(origin, dest);
        urls.push(`  <url>
    <loc>${SITE_URL}/flights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`);
      }
    }
  }

  // 2. US to International: 50 × 50 = 2,500 routes
  for (const origin of usAirports) {
    for (const dest of intlAirports) {
      const slug = formatRouteSlug(origin, dest);
      urls.push(`  <url>
    <loc>${SITE_URL}/flights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  // 3. International to US: 50 × 50 = 2,500 routes
  for (const origin of intlAirports) {
    for (const dest of usAirports) {
      const slug = formatRouteSlug(origin, dest);
      urls.push(`  <url>
    <loc>${SITE_URL}/flights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`);
    }
  }

  // 4. International to International (top 30 × 30 = 900 routes)
  const topIntl = intlAirports.slice(0, 30);
  for (let i = 0; i < topIntl.length; i++) {
    for (let j = 0; j < topIntl.length; j++) {
      if (i !== j) {
        const slug = formatRouteSlug(topIntl[i], topIntl[j]);
        urls.push(`  <url>
    <loc>${SITE_URL}/flights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
      }
    }
  }

  // Total: ~8,350 routes
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
