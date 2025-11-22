/**
 * TripMatch Reviews API
 *
 * GET  /api/tripmatch/trips/[id]/reviews - Get reviews for trip members
 * POST /api/tripmatch/trips/[id]/reviews - Submit review
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/tripmatch/auth-helpers';

/**
 * GET /api/tripmatch/trips/[id]/reviews
 *
 * Get all reviews for a trip
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tripId } = params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const reviews = await prisma.tripReview.findMany({
      where: { tripId, isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            displayName: true,
            avatarUrl: true,
            userId: true,
          },
        },
        reviewedUser: {
          select: {
            displayName: true,
            avatarUrl: true,
            userId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length,
    });

  } catch (error: any) {
    console.error('❌ Error fetching reviews:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reviews',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/tripmatch/trips/[id]/reviews
 *
 * Submit a review for a trip member
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tripId } = params;
    const body = await request.json();

    // Get authenticated user
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Validate required fields
    if (!body.reviewedUserId || !body.overallRating) {
      return NextResponse.json({
        success: false,
        error: 'reviewedUserId and overallRating are required',
      }, { status: 400 });
    }

    // Validate ratings (1-5)
    const ratings = [
      body.overallRating,
      body.communicationRating,
      body.reliabilityRating,
      body.friendlinessRating,
    ].filter(r => r !== undefined && r !== null);

    for (const rating of ratings) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return NextResponse.json({
          success: false,
          error: 'All ratings must be integers between 1 and 5',
        }, { status: 400 });
      }
    }

    // Check if user already reviewed this person for this trip
    const existingReview = await prisma.tripReview.findUnique({
      where: {
        tripId_reviewerId_reviewedUserId: {
          tripId,
          reviewerId: userId,
          reviewedUserId: body.reviewedUserId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: 'You have already reviewed this user for this trip',
      }, { status: 400 });
    }

    // Create review
    const review = await prisma.tripReview.create({
      data: {
        tripId,
        reviewerId: userId,
        reviewedUserId: body.reviewedUserId,
        overallRating: body.overallRating,
        communicationRating: body.communicationRating || null,
        reliabilityRating: body.reliabilityRating || null,
        friendlinessRating: body.friendlinessRating || null,
        reviewText: body.reviewText?.trim() || null,
        isPublic: body.isPublic !== undefined ? body.isPublic : true,
      },
      include: {
        reviewer: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update reviewed user's average rating
    const userReviews = await prisma.tripReview.findMany({
      where: { reviewedUserId: body.reviewedUserId },
      select: { overallRating: true },
    });

    const avgRating = userReviews.reduce((sum, r) => sum + r.overallRating, 0) / userReviews.length;
    const totalReviews = userReviews.length;

    await prisma.tripMatchUserProfile.update({
      where: { userId: body.reviewedUserId },
      data: {
        avgRating,
        totalReviews,
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error submitting review:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to submit review',
      message: error.message,
    }, { status: 500 });
  }
}
