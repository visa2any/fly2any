/**
 * CITIES SITEMAP - /sitemaps/cities.xml
 * US & International city pages
 */

import { NextResponse } from 'next/server';
import { TOP_US_CITIES, TOP_INTERNATIONAL_CITIES } from '@/lib/seo/sitemap-helpers';

export const dynamic = 'force-static';
export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const today = new Date().toISOString().split('T')[0];

const usaCitySlugs = [
  'new-york', 'los-angeles', 'chicago', 'miami', 'san-francisco',
  'dallas', 'atlanta', 'denver', 'seattle', 'boston', 'las-vegas',
  'orlando', 'phoenix', 'washington-dc', 'houston', 'philadelphia',
  'san-diego', 'austin', 'nashville', 'detroit', 'minneapolis',
  'tampa', 'salt-lake-city', 'charlotte', 'raleigh', 'portland',
];

function toSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-');
}

export async function GET() {
  const urls: string[] = [];

  // USA flight pages
  usaCitySlugs.forEach((city) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/usa/flights-from-${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.88</priority>
  </url>`);
  });

  // US city flight pages
  TOP_US_CITIES.forEach((city) => {
    const slug = toSlug(city.city);
    urls.push(`  <url>
    <loc>${SITE_URL}/flights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  });

  // International city pages
  TOP_INTERNATIONAL_CITIES.forEach((city) => {
    const slug = toSlug(city.city);
    urls.push(`  <url>
    <loc>${SITE_URL}/flights/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  });

  // Hotel city pages
  [...TOP_US_CITIES, ...TOP_INTERNATIONAL_CITIES].forEach((city) => {
    const slug = toSlug(city.city);
    urls.push(`  <url>
    <loc>${SITE_URL}/hotels/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
