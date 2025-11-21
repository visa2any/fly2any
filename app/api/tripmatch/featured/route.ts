/**
 * TripMatch Featured Trips API
 *
 * Returns featured trip groups with Redis caching for performance
 * Eliminates N+1 queries and reduces database load
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - 15-minute Redis cache (900s)
 * - Optimized Prisma query with selective includes
 * - Graceful fallback when cache unavailable
 * - Error handling with empty array fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis, { isRedisEnabled } from '@/lib/cache/redis';

const CACHE_KEY = 'tripmatch:featured';
const CACHE_TTL = 900; // 15 minutes

export async function GET(request: NextRequest) {
  try {
    // STEP 1: Check Redis cache first (if enabled)
    if (isRedisEnabled() && redis) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
          console.log('✅ TripMatch: Cache HIT');
          return NextResponse.json(cached, {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
            },
          });
        }
        console.log('⚠️  TripMatch: Cache MISS');
      } catch (cacheError) {
        console.error('Redis cache read error:', cacheError);
        // Continue to database query on cache error
      }
    }

    // STEP 2: Query database with optimized query
    const trips = await prisma!.tripGroup.findMany({
      where: {
        isActive: true, // Only active trips
      },
      orderBy: [
        { featured: 'desc' },   // Featured trips first
        { trending: 'desc' },   // Then trending
        { createdAt: 'desc' },  // Finally by newest (using camelCase)
      ],
      take: 6, // Limit to 6 for homepage
      select: {
        // Selective field selection for performance
        id: true,
        name: true,
        title: true,
        description: true,
        destination: true,
        startDate: true,
        endDate: true,
        estimatedPricePerPerson: true,
        currency: true,
        currentMembers: true,
        maxMembers: true,
        featured: true,
        trending: true,
        coverImageUrl: true,
        slug: true,
        createdAt: true,
        // Include minimal member data
        members: {
          select: {
            id: true,
            userId: true,
          },
          take: 3, // Only show first 3 members for preview
        },
      },
    });

    // STEP 3: Cache the result (if Redis enabled)
    if (isRedisEnabled() && redis && trips.length > 0) {
      try {
        await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(trips));
        console.log('✅ TripMatch: Cached', trips.length, 'trips');
      } catch (cacheError) {
        console.error('Redis cache write error:', cacheError);
        // Non-critical error, continue
      }
    }

    // STEP 4: Return response
    if (trips.length === 0) {
      console.warn('⚠️  TripMatch: No active trips found');
    } else {
      console.log('✅ TripMatch: Returning', trips.length, 'trips');
    }

    return NextResponse.json(trips, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });

  } catch (error) {
    console.error('❌ TripMatch API error:', error);

    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json([], {
      status: 200, // Return 200 with empty array
      headers: {
        'X-Error': 'database-query-failed',
      },
    });
  }
}

/**
 * Invalidate cache (for admin operations)
 */
export async function DELETE(request: NextRequest) {
  try {
    if (isRedisEnabled() && redis) {
      await redis.del(CACHE_KEY);
      return NextResponse.json({ success: true, message: 'Cache invalidated' });
    }
    return NextResponse.json({ success: false, message: 'Cache not enabled' });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { success: false, error: 'Cache invalidation failed' },
      { status: 500 }
    );
  }
}
