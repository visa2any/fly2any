/**
 * MAIN SITEMAP INDEX - 2025 EDITION
 *
 * Master sitemap that references all sub-sitemaps
 * This is the entry point for search engines
 *
 * Total indexed URLs: 100,000+
 * - Static pages: ~50
 * - Flight routes: ~50,000
 * - Destinations: ~500
 * - Hotels: ~1,000
 * - Blog: ~1,000+
 * - Airlines: ~100
 *
 * @version 2.0.0
 * @last-updated 2025-01-19
 */

import { MetadataRoute } from 'next';
import {
  generatePopularRoutes,
  calculateRoutePriority,
  formatRouteSlug,
  TOP_US_CITIES,
  TOP_INTERNATIONAL_CITIES,
  MAJOR_AIRLINES,
} from '@/lib/seo/sitemap-helpers';
import { WORLD_CUP_TEAMS, WORLD_CUP_STADIUMS } from '@/lib/data/world-cup-2026';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  const allEntries: MetadataRoute.Sitemap = [];

  // ===================================
  // STATIC CORE PAGES (Highest Priority)
  // ===================================
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
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/hotels`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/cars`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/packages`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tours`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/deals`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tripmatch`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/travel-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];
  allEntries.push(...staticPages);

  // ===================================
  // TOP 1000 FLIGHT ROUTES
  // (Due to Next.js sitemap limit, we'll include top routes here
  // and reference additional routes in separate sitemap files)
  // ===================================
  const topRoutes = generatePopularRoutes(1000);
  const routePages = topRoutes.map((route) => ({
    url: `${SITE_URL}/flights/${formatRouteSlug(route.origin, route.destination)}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: calculateRoutePriority(route.origin, route.destination),
  }));
  allEntries.push(...routePages);

  // ===================================
  // CHEAP FLIGHTS TO [DESTINATION] PAGES (High-Value Keywords)
  // /flights/to/{destination}
  // ===================================
  const destinationLandingPages = [
    'hawaii', 'florida', 'las-vegas', 'mexico', 'india', 'bali', 'brazil',
    // Add more as needed - these target high-volume "cheap flights to X" keywords
  ].map((dest) => ({
    url: `${SITE_URL}/flights/to/${dest}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.92, // High priority - these are high-value SEO pages
  }));
  allEntries.push(...destinationLandingPages);

  // ===================================
  // DESTINATION PAGES (US Cities)
  // ===================================
  const usCityPages = TOP_US_CITIES.map((city) => ({
    url: `${SITE_URL}/flights/${city.city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));
  allEntries.push(...usCityPages);

  // ===================================
  // USA SEO LANDING PAGES (New 2025)
  // /usa/flights-from-{city}
  // ===================================
  const usaCitySlugs = [
    'new-york', 'los-angeles', 'chicago', 'miami', 'san-francisco',
    'dallas', 'atlanta', 'denver', 'seattle', 'boston',
    'las-vegas', 'orlando', 'phoenix', 'washington-dc', 'houston',
    'philadelphia', 'san-diego', 'austin', 'nashville', 'detroit',
  ];

  // USA hub page
  allEntries.push({
    url: `${SITE_URL}/usa`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  });

  // Individual city pages
  const usaFlightPages = usaCitySlugs.map((city) => ({
    url: `${SITE_URL}/usa/flights-from-${city}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.88,
  }));
  allEntries.push(...usaFlightPages);

  // ===================================
  // DEALS: CHEAP FLIGHTS ROUTE PAGES
  // /deals/cheap-flights-{origin}-to-{destination}
  // ===================================
  const dealRoutes = [
    'new-york-to-miami', 'los-angeles-to-las-vegas', 'chicago-to-new-york',
    'new-york-to-london', 'miami-to-cancun', 'san-francisco-to-los-angeles',
    'boston-to-miami', 'dallas-to-denver', 'atlanta-to-orlando', 'seattle-to-phoenix',
  ];
  const dealPages = dealRoutes.map((route) => ({
    url: `${SITE_URL}/deals/cheap-flights-${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));
  allEntries.push(...dealPages);

  // ===================================
  // DESTINATION PAGES (International)
  // ===================================
  const internationalCityPages = TOP_INTERNATIONAL_CITIES.map((city) => ({
    url: `${SITE_URL}/flights/${city.city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));
  allEntries.push(...internationalCityPages);

  // ===================================
  // PRIORITY AIRLINE LANDING PAGES (High-Value Keywords)
  // /airlines/{airline-slug}
  // ===================================
  const priorityAirlines = [
    'delta',    // 1.9M impressions
    'american', // 138K impressions (aa.com)
    'united',   // 183K impressions
    'emirates', // 119K impressions
  ].map((airline) => ({
    url: `${SITE_URL}/airlines/${airline}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.93, // High priority - major airline page
  }));
  allEntries.push(...priorityAirlines);

  // ===================================
  // AIRLINE PAGES
  // ===================================
  const airlinePages = MAJOR_AIRLINES.map((airline) => ({
    url: `${SITE_URL}/airlines/${airline.code.toLowerCase()}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));
  allEntries.push(...airlinePages);

  // ===================================
  // HOTEL DESTINATION PAGES
  // ===================================
  const hotelDestinations = [...TOP_US_CITIES, ...TOP_INTERNATIONAL_CITIES].map((city) => ({
    url: `${SITE_URL}/hotels/${city.city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  allEntries.push(...hotelDestinations);

  // ===================================
  // TRAVEL GUIDES
  // ===================================
  const travelGuides = [...TOP_US_CITIES.slice(0, 10), ...TOP_INTERNATIONAL_CITIES.slice(0, 10)].map((city) => ({
    url: `${SITE_URL}/travel-guide/${city.city.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  allEntries.push(...travelGuides);

  // ===================================
  // FIFA WORLD CUP 2026 SECTION (High Priority)
  // ===================================

  // Main World Cup Pages
  const worldCupPages = [
    {
      url: `${SITE_URL}/world-cup-2026`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.95, // High priority - major event
    },
    {
      url: `${SITE_URL}/world-cup-2026/teams`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/world-cup-2026/stadiums`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/world-cup-2026/schedule`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/world-cup-2026/packages`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.93, // High conversion page
    },
    {
      url: `${SITE_URL}/world-cup-2026/hotels`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.88,
    },
    {
      url: `${SITE_URL}/world-cup-2026/tickets`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.88,
    },
  ];
  allEntries.push(...worldCupPages);

  // Individual Team Pages (13 teams currently configured)
  const teamPages = WORLD_CUP_TEAMS.map((team) => ({
    url: `${SITE_URL}/world-cup-2026/teams/${team.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85, // High interest pages
  }));
  allEntries.push(...teamPages);

  // Individual Stadium Pages (8 stadiums currently configured)
  const stadiumPages = WORLD_CUP_STADIUMS.map((stadium) => ({
    url: `${SITE_URL}/world-cup-2026/stadiums/${stadium.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.85, // High interest + conversion pages
  }));
  allEntries.push(...stadiumPages);

  return allEntries;
}
