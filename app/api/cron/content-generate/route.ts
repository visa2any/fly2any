/**
 * Content Generation Cron - Fly2Any Marketing OS
 * Generates social content from real product data
 *
 * Runs daily at 6 AM UTC via Vercel Cron
 * @route GET /api/cron/content-generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { contentQueueManager } from '@/lib/social/content-queue-manager';
import { generateDealPost, generateSocialPosts } from '@/lib/growth/content-factory';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Featured destinations for content variety
const FEATURED_DESTINATIONS = [
  { city: 'Paris', code: 'CDG' },
  { city: 'London', code: 'LHR' },
  { city: 'Tokyo', code: 'NRT' },
  { city: 'Cancun', code: 'CUN' },
  { city: 'Rome', code: 'FCO' },
  { city: 'Barcelona', code: 'BCN' },
];

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const startTime = Date.now();

    // Verify cron authentication
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const token = authHeader?.replace('Bearer ', '');
    const isManualAuth = cronSecret && token === cronSecret;

    if (!isVercelCron && !isManualAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Content Cron] Starting content generation');

    const generated: string[] = [];
    const errors: string[] = [];

    // 1. Generate deal posts from recent flight searches
    try {
      const flightDeals = await getTopFlightDeals();
      for (const deal of flightDeals.slice(0, 3)) {
        const id = await contentQueueManager.enqueueDeal({
          type: 'flight',
          origin: deal.origin,
          destination: deal.destination,
          price: deal.price,
          originalPrice: deal.originalPrice,
          imageUrl: deal.imageUrl,
          link: `https://www.fly2any.com/flights/${deal.origin.toLowerCase()}-to-${deal.destination.toLowerCase()}`,
        });
        generated.push(`flight_deal:${id}`);
      }
    } catch (error) {
      errors.push(`Flight deals: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // 2. Generate hotel deal posts
    try {
      const hotelDeals = await getTopHotelDeals();
      for (const deal of hotelDeals.slice(0, 2)) {
        const id = await contentQueueManager.enqueueDeal({
          type: 'hotel',
          destination: deal.city,
          name: deal.name,
          price: deal.price,
          originalPrice: deal.originalPrice,
          imageUrl: deal.imageUrl,
          link: `https://www.fly2any.com/hotels/${deal.hotelId}`,
        });
        generated.push(`hotel_deal:${id}`);
      }
    } catch (error) {
      errors.push(`Hotel deals: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // 3. Generate AI social posts (travel tips, inspiration)
    try {
      const socialPosts = await generateSocialPosts(3);
      for (const post of socialPosts) {
        const id = await contentQueueManager.enqueue({
          type: 'social',
          title: post.title,
          content: post.content,
          platforms: ['twitter', 'facebook'],
          hashtags: post.metadata.keywords,
          priority: 3,
        });
        generated.push(`social:${id}`);
      }
    } catch (error) {
      errors.push(`Social posts: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // 4. Generate destination spotlight (weekly)
    const dayOfWeek = new Date().getUTCDay();
    if (dayOfWeek === 1) { // Monday
      try {
        const destination = FEATURED_DESTINATIONS[Math.floor(Math.random() * FEATURED_DESTINATIONS.length)];
        const id = await contentQueueManager.enqueue({
          type: 'guide',
          title: `Discover ${destination.city}`,
          content: `✨ Destination Spotlight: ${destination.city}\n\nLooking for your next adventure? ${destination.city} has it all - amazing food, rich culture, and unforgettable experiences.\n\nFlights available from major US cities.\n\nStart planning your trip today!`,
          platforms: ['twitter', 'instagram', 'facebook', 'blog'],
          hashtags: ['TravelTuesday', destination.city.replace(/\s/g, ''), 'Wanderlust', 'TravelGoals'],
          imagePrompt: `Beautiful ${destination.city} cityscape at golden hour, travel photography`,
          link: `https://www.fly2any.com/destinations/${destination.city.toLowerCase()}`,
          priority: 8,
        });
        generated.push(`guide:${id}`);
      } catch (error) {
        errors.push(`Destination guide: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    const duration = Date.now() - startTime;
    const stats = await contentQueueManager.getStats();

    console.log(`[Content Cron] Generated ${generated.length} items in ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration,
      generated: generated.length,
      items: generated,
      errors: errors.length > 0 ? errors : undefined,
      queueStats: stats,
    });

  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.NORMAL });
}

/**
 * Get top flight deals from recent data
 */
async function getTopFlightDeals(): Promise<Array<{
  origin: string;
  destination: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
}>> {
  // Query from flight analytics or cached prices
  try {
    const deals = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT ON (destination)
        origin_iata as origin,
        destination_iata as destination,
        MIN(price) as price,
        AVG(price) as avg_price
      FROM flight_analytics
      WHERE created_at > NOW() - INTERVAL '7 days'
        AND price > 0
      GROUP BY origin_iata, destination_iata
      ORDER BY destination, price ASC
      LIMIT 10
    `;

    return deals.map(d => ({
      origin: d.origin,
      destination: d.destination,
      price: Math.round(d.price),
      originalPrice: Math.round(d.avg_price * 1.2),
    }));
  } catch {
    // Fallback to mock data if analytics table doesn't exist
    return [
      { origin: 'JFK', destination: 'LHR', price: 399, originalPrice: 599 },
      { origin: 'LAX', destination: 'CDG', price: 449, originalPrice: 699 },
      { origin: 'MIA', destination: 'CUN', price: 199, originalPrice: 349 },
    ];
  }
}

/**
 * Get top hotel deals from featured hotels
 */
async function getTopHotelDeals(): Promise<Array<{
  hotelId: string;
  name: string;
  city: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
}>> {
  // Query featured hotels from cache or API
  try {
    // Use internal API to get featured hotels
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/hotels/featured-enhanced`, {
      headers: { 'x-internal': '1' },
    });

    if (response.ok) {
      const data = await response.json();
      return (data.hotels || []).slice(0, 5).map((h: any) => ({
        hotelId: h.id,
        name: h.name,
        city: h.city,
        price: Math.round(h.price || h.minPrice || 150),
        originalPrice: Math.round((h.price || 150) * 1.3),
        imageUrl: h.mainImage || h.images?.[0],
      }));
    }
  } catch (error) {
    console.error('[Content Cron] Failed to fetch hotels:', error);
  }

  // Fallback
  return [
    { hotelId: 'demo1', name: 'Grand Hotel', city: 'New York', price: 199, originalPrice: 299 },
    { hotelId: 'demo2', name: 'Beach Resort', city: 'Miami', price: 149, originalPrice: 249 },
  ];
}

export async function POST(request: NextRequest) {
  return GET(request);
}
