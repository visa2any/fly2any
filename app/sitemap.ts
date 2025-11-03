/**
 * Dynamic Sitemap Generation
 *
 * Generates sitemap.xml for search engines.
 * Includes all static pages and dynamic routes.
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/flights`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hotels`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tripmatch`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // Popular routes (can be fetched from database in production)
  const popularRoutes = [
    { origin: 'JFK', destination: 'LAX' },
    { origin: 'LAX', destination: 'JFK' },
    { origin: 'ORD', destination: 'MIA' },
    { origin: 'ATL', destination: 'LAS' },
    { origin: 'DFW', destination: 'SFO' },
  ];

  const routePages = popularRoutes.map((route) => ({
    url: `${SITE_URL}/flights/${route.origin}-${route.destination}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...routePages];
}
