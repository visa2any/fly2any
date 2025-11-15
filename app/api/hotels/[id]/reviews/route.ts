import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;

    if (!prisma) {
      // Database unavailable - return empty reviews gracefully
      return NextResponse.json({
        success: true,
        reviews: [],
        averageRating: 0,
        total: 0,
        warning: 'Database temporarily unavailable',
      });
    }

    // Fetch reviews from database
    const reviews = await prisma.hotelReview.findMany({
      where: {
        hotelId: hotelId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to 20 most recent reviews
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.overallRating,
        userName: 'Guest', // Privacy: Don't expose user details
        verified: review.verified,
        createdAt: review.createdAt,
      })),
      averageRating,
      total: reviews.length,
    });
  } catch (error: any) {
    // Graceful degradation on database errors
    console.error('Error fetching reviews:', error.message);

    // Return empty reviews instead of 500 error
    return NextResponse.json({
      success: true,
      reviews: [],
      averageRating: 0,
      total: 0,
      warning: 'Reviews temporarily unavailable',
    });
  }
}
