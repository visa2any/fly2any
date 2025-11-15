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

    // Fetch reviews from database
    const reviews = await prisma.hotelReview.findMany({
      where: {
        hotelId: hotelId,
        moderationStatus: 'approved', // Only show approved reviews
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Limit to 20 most recent reviews
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        userName: 'Guest', // Privacy: Don't expose user details
        verifiedStay: review.verifiedStay,
        hotelResponse: review.hotelResponse,
        createdAt: review.createdAt,
      })),
      averageRating,
      total: reviews.length,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
