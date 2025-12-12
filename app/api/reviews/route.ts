/**
 * Reviews API - Fly2Any Growth OS
 * User review submission and retrieval
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reviewService, REVIEW_POINTS } from '@/lib/growth/reviews'
import { getPrismaClient } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch reviews with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as any
    const rating = searchParams.get('rating')
    const verified = searchParams.get('verified')
    const sortBy = searchParams.get('sortBy') as any
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filter = {
      type: type || undefined,
      rating: rating ? parseInt(rating) : undefined,
      verified: verified === 'true' ? true : undefined,
      sortBy: sortBy || 'recent'
    }

    const { reviews, total, stats } = await reviewService.getReviews(filter, limit, offset)

    // Generate schema for SEO
    const schema = reviewService.generateReviewSchema(reviews, stats)

    return NextResponse.json({
      success: true,
      data: { reviews, total, stats },
      schema
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error: any) {
    console.error('[Reviews] GET Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Submit new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to submit a review' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      bookingId,
      type = 'platform',
      route,
      airline,
      rating,
      title,
      content,
      pros,
      cons,
      tripType,
      travelDate
    } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!title || title.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Title must be at least 5 characters' },
        { status: 400 }
      )
    }

    if (!content || content.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Review must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Note: Booking verification will be implemented when a booking model is added
    // For now, bookingId is stored but not verified against any model
    const isVerified = !!bookingId

    // Create review
    const review = await reviewService.createReview({
      userId: session.user.id!,
      userName: session.user.name || 'Anonymous',
      bookingId,
      type,
      route,
      airline,
      rating,
      title,
      content,
      pros: pros?.filter((p: string) => p.trim()) || [],
      cons: cons?.filter((c: string) => c.trim()) || [],
      tripType,
      travelDate
    })

    // Calculate points earned
    let pointsEarned = REVIEW_POINTS.submit
    if (bookingId) pointsEarned += REVIEW_POINTS.verified

    return NextResponse.json({
      success: true,
      data: review,
      pointsEarned,
      message: 'Review submitted successfully! It will be visible after approval.'
    })
  } catch (error: any) {
    console.error('[Reviews] POST Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
