/**
 * DESTINATIONS SITEMAP - /sitemaps/destinations.xml
 * Destination landing pages, deals, World Cup, airlines
 */

import { NextResponse } from 'next/server';
import { MAJOR_AIRLINES } from '@/lib/seo/sitemap-helpers';
import { WORLD_CUP_TEAMS, WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';

export const dynamic = 'force-static';
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const today = new Date().toISOString().split('T')[0];

// High-value destination landing pages
const destinationSlugs = [
  'hawaii', 'florida', 'las-vegas', 'mexico', 'india', 'bali', 'brazil',
  'oslo', 'berlin', 'munich', 'london', 'paris', 'tokyo', 'dubai',
  'cancun', 'caribbean', 'europe', 'asia', 'south-america', 'australia',
];

// Deals pages
const dealRoutes = [
  'new-york-to-miami', 'los-angeles-to-las-vegas', 'chicago-to-new-york',
  'new-york-to-london', 'miami-to-cancun', 'san-francisco-to-los-angeles',
  'boston-to-miami', 'dallas-to-denver', 'atlanta-to-orlando', 'seattle-to-phoenix',
  'new-york-to-paris', 'los-angeles-to-tokyo', 'miami-to-san-juan',
];

export async function GET() {
  const urls: string[] = [];

  // Destination landing pages (/flights/to/{dest})
  destinationSlugs.forEach((dest) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/flights/to/${dest}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.92</priority>
  </url>`);
  });

  // Deals pages
  dealRoutes.forEach((route) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/deals/cheap-flights-${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);
  });

  // Airline pages
  MAJOR_AIRLINES.forEach((airline) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/airlines/${airline.code.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`);
  });

  // Priority airlines
  ['delta', 'american', 'united', 'emirates', 'spirit', 'alaska', 'frontier'].forEach((airline) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/airlines/${airline}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.93</priority>
  </url>`);
  });

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
