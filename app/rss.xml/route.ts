/**
 * RSS FEED GENERATION
 *
 * Generates RSS 2.0 feed for blog posts
 * Helps with content distribution and SEO
 *
 * @version 1.0.0
 */

import { BLOG_POSTS } from '@/lib/blog/blog-data';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const SITE_NAME = 'Fly2Any Blog';
const SITE_DESCRIPTION = 'Latest travel tips, flight deals, and destination guides from Fly2Any';

export async function GET() {
  const rss = generateRSSFeed();

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function generateRSSFeed(): string {
  const latestPosts = BLOG_POSTS
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, 50); // Limit to 50 most recent posts

  const rssItems = latestPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedDate).toUTCString()}</pubDate>
      <author>noreply@fly2any.com (${post.author.name})</author>
      <category>${post.category}</category>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
      ${post.featuredImage ? `<enclosure url="${SITE_URL}${post.featuredImage}" type="image/jpeg" />` : ''}
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/blog</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/fly2any-logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}/blog</link>
    </image>
    ${rssItems}
  </channel>
</rss>`.trim();
}
