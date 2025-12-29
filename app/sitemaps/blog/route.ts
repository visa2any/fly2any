/**
 * BLOG SITEMAP - /sitemaps/blog.xml
 * Blog posts, categories, travel guides, news
 */

import { NextResponse } from 'next/server';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/blog/blog-data';
import { TOP_US_CITIES, TOP_INTERNATIONAL_CITIES } from '@/lib/seo/sitemap-helpers';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1h for blog content

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const today = new Date().toISOString().split('T')[0];

function toSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-');
}

export async function GET() {
  const urls: string[] = [];

  // Blog index
  urls.push(`  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);

  // Blog news section
  urls.push(`  <url>
    <loc>${SITE_URL}/blog/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);

  // Blog categories
  BLOG_CATEGORIES.forEach((category) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/blog/category/${category.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  });

  // Individual blog posts
  BLOG_POSTS.forEach((post) => {
    const lastMod = post.modifiedDate || post.publishedDate;
    urls.push(`  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${post.featured ? '0.85' : '0.7'}</priority>
  </url>`);
  });

  // Travel guides
  [...TOP_US_CITIES.slice(0, 10), ...TOP_INTERNATIONAL_CITIES.slice(0, 10)].forEach((city) => {
    const slug = toSlug(city.city);
    urls.push(`  <url>
    <loc>${SITE_URL}/travel-guide/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // Static content pages
  const contentPages = [
    { path: '/travel-guide', priority: 0.85 },
    { path: '/faq', priority: 0.7 },
    { path: '/reviews', priority: 0.75 },
        { path: '/airport-guides', priority: 0.75 },
  ];

  contentPages.forEach(({ path, priority }) => {
    urls.push(`  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
