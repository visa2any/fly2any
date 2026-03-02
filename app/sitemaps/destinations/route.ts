/**
 * DESTINATIONS SITEMAP - /sitemaps/destinations.xml
 * Destination landing pages, deals, World Cup, airlines
 */

import { NextResponse } from 'next/server';
import { TOP_DESTINATIONS, TOP_AIRPORTS, TOP_AIRLINES } from '@/lib/seo/programmatic-seo';
import { WORLD_CUP_TEAMS, WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';

export const dynamic = 'force-static';
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const today = new Date().toISOString().split('T')[0];

export async function GET() {
  const urls: string[] = [];

  // /destinations/[slug] — programmatic destination pages
  TOP_DESTINATIONS.forEach((dest) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/destinations/${dest.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>`);
  });

  // /airports/[slug] — programmatic airport pages
  TOP_AIRPORTS.forEach((airport) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/airports/${airport.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  });

  // /airlines/[slug] — programmatic airline pages
  TOP_AIRLINES.forEach((airline) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/airlines/${airline.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.82</priority>
  </url>`);
  });

  // /team — E-E-A-T trust page
  urls.push(`  <url>
    <loc>${SITE_URL}/team</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>`);

  // World Cup 2026 pages
  const wcPages = [
    { path: '', priority: 0.95 },
    { path: '/teams', priority: 0.9 },
    { path: '/stadiums', priority: 0.9 },
    { path: '/schedule', priority: 0.92 },
    { path: '/packages', priority: 0.93 },
    { path: '/hotels', priority: 0.88 },
    { path: '/tickets', priority: 0.88 },
  ];

  wcPages.forEach(({ path, priority }) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/world-cup-2026${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`);
  });

  // Team pages
  WORLD_CUP_TEAMS.forEach((team) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/world-cup-2026/teams/${team.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  });

  // Stadium pages
  WORLD_CUP_STADIUMS.forEach((stadium) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/world-cup-2026/stadiums/${stadium.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  });

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
