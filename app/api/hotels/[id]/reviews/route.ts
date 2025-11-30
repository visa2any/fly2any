import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { liteAPI } from '@/lib/api/liteapi';
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
    const includeSentiment = searchParams.get('sentiment') !== 'false'; // Enable sentiment by default

    // Try cache first (1 hour TTL for reviews)
    const cacheKey = `hotel:reviews:${hotelId}:${limit}:${offset}:${sort}:sentiment-${includeSentiment}`;
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

    // Fetch from LiteAPI with AI sentiment analysis
    let liteApiReviews: any[] = [];
    let sentiment: any = null;

    try {
      console.log(`🔍 Fetching LiteAPI reviews for ${hotelId} with sentiment: ${includeSentiment}`);
      const liteApiData = await liteAPI.getHotelReviews(hotelId, {
        limit: limit,
        getSentiment: includeSentiment,
      });

      // Transform LiteAPI reviews to match our format
      liteApiReviews = (liteApiData.reviews || []).map((review: any) => ({
        id: review.id,
        hotelId,
        rating: review.rating || 4,
        title: review.title,
        content: review.comment || '',
        authorName: review.author?.name || 'Guest',
        authorCountry: review.author?.countryCode,
        verified: true,
        createdAt: review.date || new Date().toISOString(),
        stayDate: review.date || new Date().toISOString(),
        helpful: review.helpfulCount || 0,
        source: 'liteapi',
      }));

      // Capture sentiment analysis from LiteAPI
      if (liteApiData.sentiment) {
        sentiment = {
          overallScore: liteApiData.sentiment.overallScore,
          totalReviews: liteApiData.sentiment.totalReviews,
          categories: liteApiData.sentiment.categories,
          pros: liteApiData.sentiment.pros || [],
          cons: liteApiData.sentiment.cons || [],
        };
        console.log(`✅ Got sentiment analysis: ${sentiment.overallScore}/10 score, ${sentiment.pros?.length || 0} pros, ${sentiment.cons?.length || 0} cons`);
      }
    } catch (liteApiError) {
      console.warn('LiteAPI reviews fetch failed, using fallback:', liteApiError);
    }

    // If no LiteAPI reviews, use liteAPIReviews fallback (generated)
    if (liteApiReviews.length === 0 && dbReviews.length < limit) {
      try {
        const fallbackData = await liteAPIReviews.getHotelReviews(hotelId, {
          limit: limit - dbReviews.length,
          offset: Math.max(0, offset - dbReviews.length),
          sort,
        });
        liteApiReviews = fallbackData.reviews.map(r => ({ ...r, source: 'generated' }));
      } catch (fallbackError) {
        console.warn('Fallback reviews also failed:', fallbackError);
      }
    }

    // Merge reviews (DB first, then LiteAPI)
    const allReviews = [
      ...dbReviews,
      ...liteApiReviews.filter((r: any) => !dbReviews.some(db => db.id === r.id)),
    ];

    // Recalculate summary
    const totalRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => {
      const roundedRating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
      if (roundedRating >= 1 && roundedRating <= 5) {
        ratingDistribution[roundedRating]++;
      }
    });

    const response = {
      success: true,
      data: allReviews.slice(0, limit),
      summary: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
        ratingDistribution,
        recommendationRate: allReviews.length > 0
          ? Math.round((ratingDistribution[4] + ratingDistribution[5]) / allReviews.length * 100)
          : 0,
        source: dbReviews.length > 0 ? 'mixed' : (liteApiReviews.length > 0 ? 'liteapi' : 'generated'),
      },
      // AI Sentiment Analysis from LiteAPI
      sentiment: sentiment,
      meta: {
        hotelId,
        limit,
        offset,
        hasMore: allReviews.length > limit,
        hasSentiment: !!sentiment,
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
        sentiment: null,
        meta: { hotelId: params.id, source: 'generated' },
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: [],
        summary: { averageRating: 0, totalReviews: 0 },
        sentiment: null,
        warning: 'Reviews temporarily unavailable',
      });
    }
  }
}
