import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { liteAPIReviews } from '@/lib/api/liteapi-reviews';
import { getCached, setCache } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = (searchParams.get('sort') as 'recent' | 'rating_high' | 'rating_low' | 'helpful') || 'recent';
    const source = searchParams.get('source') || 'all'; // 'db', 'api', 'all'

    // Try cache first (1 hour TTL for reviews)
    const cacheKey = `hotel:reviews:${hotelId}:${limit}:${offset}:${sort}`;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Fetch from database first
    let dbReviews: any[] = [];
    let dbAvgRating = 0;

    if (prisma && (source === 'db' || source === 'all')) {
      try {
        const reviews = await prisma.hotelReview.findMany({
          where: { hotelId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        });

        dbReviews = reviews.map(review => ({
          id: review.id,
          hotelId,
          rating: review.overallRating,
          title: review.title,
          content: review.review,
          authorName: 'Verified Guest',
          verified: review.verified,
          createdAt: review.createdAt.toISOString(),
          stayDate: review.createdAt.toISOString(),
          source: 'database',
        }));

        if (dbReviews.length > 0) {
          dbAvgRating = dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length;
        }
      } catch (dbError) {
        console.warn('Database reviews fetch failed:', dbError);
      }
    }

    // If we have enough DB reviews, return them
    if (dbReviews.length >= limit) {
      const response = {
        success: true,
        data: dbReviews,
        summary: {
          averageRating: Math.round(dbAvgRating * 10) / 10,
          totalReviews: dbReviews.length,
          source: 'database',
        },
        meta: { hotelId, limit, offset, hasMore: dbReviews.length >= limit },
      };

      await setCache(cacheKey, response, 3600);
      return NextResponse.json(response);
    }

    // Otherwise, fetch from LiteAPI (includes generated reviews as fallback)
    const apiReviews = await liteAPIReviews.getHotelReviews(hotelId, {
      limit: limit - dbReviews.length,
      offset: Math.max(0, offset - dbReviews.length),
      sort,
    });

    // Merge reviews (DB first, then API)
    const allReviews = [
      ...dbReviews,
      ...apiReviews.reviews.map(r => ({ ...r, source: 'api' })),
    ];

    // Recalculate summary
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    const response = {
      success: true,
      data: allReviews.slice(0, limit),
      summary: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
        ratingDistribution: apiReviews.summary.ratingDistribution,
        recommendationRate: apiReviews.summary.recommendationRate,
        source: dbReviews.length > 0 ? 'mixed' : 'api',
      },
      meta: {
        hotelId,
        limit,
        offset,
        hasMore: apiReviews.hasMore || allReviews.length > limit,
      },
    };

    // Cache for 1 hour
    await setCache(cacheKey, response, 3600);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error.message);

    // Fallback to generated reviews on any error
    try {
      const fallbackReviews = await liteAPIReviews.getHotelReviews(params.id, { limit: 10 });
      return NextResponse.json({
        success: true,
        data: fallbackReviews.reviews,
        summary: fallbackReviews.summary,
        meta: { hotelId: params.id, source: 'generated' },
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: [],
        summary: { averageRating: 0, totalReviews: 0 },
        warning: 'Reviews temporarily unavailable',
      });
    }
  }
}
