/**
 * FLIGHT DEALS SITEMAP - /sitemaps/deals.xml
 * Real-time flight deals with dynamic pricing
 * Updated hourly with current deals and prices
 * 
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

// Mock function to get current flight deals - replace with real API call
async function getCurrentFlightDeals() {
  // In production, this would fetch from your database or cache
  // For now, return mock data
  return [
    {
      origin: 'JFK',
      destination: 'LAX',
      price: 189,
      airline: 'American Airlines',
      dealId: 'jfk-lax-aa-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'MIA',
      destination: 'DXB',
      price: 699,
      airline: 'Emirates',
      dealId: 'mia-dxb-ek-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'SFO',
      destination: 'HNL',
      price: 249,
      airline: 'United Airlines',
      dealId: 'sfo-hnl-ua-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'ORD',
      destination: 'CDG',
      price: 499,
      airline: 'Air France',
      dealId: 'ord-cdg-af-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'LAX',
      destination: 'NRT',
      price: 799,
      airline: 'Japan Airlines',
      dealId: 'lax-nrt-jl-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'ATL',
      destination: 'LHR',
      price: 549,
      airline: 'British Airways',
      dealId: 'atl-lhr-ba-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'DFW',
      destination: 'HKG',
      price: 899,
      airline: 'Cathay Pacific',
      dealId: 'dfw-hkg-cx-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'DEN',
      destination: 'FRA',
      price: 649,
      airline: 'Lufthansa',
      dealId: 'den-fra-lh-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'SEA',
      destination: 'AMS',
      price: 599,
      airline: 'KLM',
      dealId: 'sea-ams-kl-2025-01-19',
      lastUpdated: new Date().toISOString()
    },
    {
      origin: 'BOS',
      destination: 'DUB',
      price: 399,
      airline: 'Aer Lingus',
      dealId: 'bos-dub-ei-2025-01-19',
      lastUpdated: new Date().toISOString()
    }
  ];
}

// Format date for sitemap
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export async function GET() {
  try {
    const deals = await getCurrentFlightDeals();
    const today = formatDate(new Date());
    
    const urls = deals.map(deal => {
      // Create SEO-friendly URL for the deal
      const slug = `cheap-flights-${deal.origin.toLowerCase()}-to-${deal.destination.toLowerCase()}-${deal.airline.toLowerCase().replace(/\s+/g, '-')}`;
      const url = `${SITE_URL}/flights/deals/${slug}`;
      
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${formatDate(deal.lastUpdated)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Add main deals page
    urls.unshift(`  <url>
    <loc>${SITE_URL}/flights/deals</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex', // Don't index the sitemap itself
      },
    });
  } catch (error) {
    console.error('Error generating flight deals sitemap:', error);
    
    // Return empty sitemap on error
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/flights/deals</loc>
    <lastmod>${formatDate(new Date())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
}
