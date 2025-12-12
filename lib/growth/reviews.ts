/**
 * User Reviews System - Fly2Any Growth OS
 * Trust-building, SEO-boosting, viral review system
 */

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  bookingId?: string
  type: 'flight' | 'experience' | 'platform'
  route?: string // e.g., "NYC → Paris"
  airline?: string
  rating: number // 1-5
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  tripType?: 'business' | 'leisure' | 'family' | 'solo'
  travelDate?: string
  verified: boolean
  helpful: number
  notHelpful: number
  images?: string[]
  response?: {
    content: string
    respondedAt: Date
    respondedBy: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  createdAt: Date
  updatedAt: Date
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<number, number> // { 5: 120, 4: 80, ... }
  verifiedPercentage: number
  recommendPercentage: number
}

export interface ReviewFilter {
  type?: Review['type']
  rating?: number
  verified?: boolean
  tripType?: Review['tripType']
  sortBy?: 'recent' | 'helpful' | 'rating_high' | 'rating_low'
}

// Review incentive points
export const REVIEW_POINTS = {
  submit: 25,
  withPhoto: 10,
  verified: 15,
  helpful: 5, // When others mark as helpful
  featured: 50
}

export class ReviewService {
  /**
   * Create a new review
   */
  async createReview(data: {
    userId: string
    userName: string
    bookingId?: string
    type: Review['type']
    route?: string
    airline?: string
    rating: number
    title: string
    content: string
    pros?: string[]
    cons?: string[]
    tripType?: Review['tripType']
    travelDate?: string
    images?: string[]
  }): Promise<Review> {
    const review: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...data,
      verified: !!data.bookingId, // Auto-verify if linked to booking
      helpful: 0,
      notHelpful: 0,
      status: 'pending', // Needs moderation
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Calculate points earned
    let pointsEarned = REVIEW_POINTS.submit
    if (data.images?.length) pointsEarned += REVIEW_POINTS.withPhoto
    if (review.verified) pointsEarned += REVIEW_POINTS.verified

    console.log(`[Reviews] Created review ${review.id}, earned ${pointsEarned} points`)

    // In production: Save to database, award points
    return review
  }

  /**
   * Get reviews with filters
   */
  async getReviews(filter: ReviewFilter = {}, limit = 10, offset = 0): Promise<{
    reviews: Review[]
    total: number
    stats: ReviewStats
  }> {
    // Mock data for demo
    const mockReviews: Review[] = [
      {
        id: 'review_1',
        userId: 'user_1',
        userName: 'Sarah M.',
        type: 'flight',
        route: 'NYC → Paris',
        airline: 'Air France',
        rating: 5,
        title: 'Amazing deal, smooth booking!',
        content: 'Found an incredible deal through Fly2Any. The price was $400 less than other sites. Booking was seamless and customer support was helpful when I had questions.',
        pros: ['Great prices', 'Easy booking', 'Fast confirmation'],
        tripType: 'leisure',
        travelDate: '2024-12',
        verified: true,
        helpful: 47,
        notHelpful: 2,
        status: 'approved',
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10')
      },
      {
        id: 'review_2',
        userId: 'user_2',
        userName: 'Michael R.',
        type: 'flight',
        route: 'LAX → Tokyo',
        airline: 'ANA',
        rating: 5,
        title: 'Best flight search I\'ve used',
        content: 'The AI search is incredible. It found options I couldn\'t find anywhere else. Price alerts saved me $600 on my trip to Japan!',
        pros: ['AI recommendations', 'Price alerts work great', 'Transparent pricing'],
        tripType: 'solo',
        travelDate: '2024-11',
        verified: true,
        helpful: 32,
        notHelpful: 1,
        status: 'approved',
        createdAt: new Date('2024-11-28'),
        updatedAt: new Date('2024-11-28')
      },
      {
        id: 'review_3',
        userId: 'user_3',
        userName: 'Emily K.',
        type: 'platform',
        rating: 4,
        title: 'Great for family travel planning',
        content: 'Used Fly2Any for our family vacation. The trip boards feature helped us plan everything together. Only minor issue was the app could be faster.',
        pros: ['Trip planning tools', 'Good deals', 'Family-friendly'],
        cons: ['App speed could improve'],
        tripType: 'family',
        verified: false,
        helpful: 18,
        notHelpful: 3,
        status: 'approved',
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-15')
      }
    ]

    const stats: ReviewStats = {
      totalReviews: 1247,
      averageRating: 4.7,
      ratingDistribution: { 5: 847, 4: 289, 3: 78, 2: 22, 1: 11 },
      verifiedPercentage: 72,
      recommendPercentage: 94
    }

    return { reviews: mockReviews, total: mockReviews.length, stats }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, userId: string, helpful: boolean): Promise<void> {
    console.log(`[Reviews] ${reviewId} marked ${helpful ? 'helpful' : 'not helpful'} by ${userId}`)
    // In production: Update database, award points to reviewer
  }

  /**
   * Moderate review (admin)
   */
  async moderateReview(reviewId: string, status: Review['status'], moderatorId: string): Promise<void> {
    console.log(`[Reviews] ${reviewId} status changed to ${status} by ${moderatorId}`)
  }

  /**
   * Add business response to review
   */
  async addResponse(reviewId: string, content: string, responderId: string): Promise<void> {
    console.log(`[Reviews] Response added to ${reviewId}`)
  }

  /**
   * Get review schema for SEO
   */
  generateReviewSchema(reviews: Review[], stats: ReviewStats): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Fly2Any Flight Search',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: stats.averageRating.toFixed(1),
        reviewCount: stats.totalReviews,
        bestRating: '5',
        worstRating: '1'
      },
      review: reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.userName },
        datePublished: r.createdAt.toISOString(),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: '5',
          worstRating: '1'
        },
        reviewBody: r.content
      }))
    }
  }

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(): Promise<Review[]> {
    // In production: Query from database
    return []
  }

  /**
   * Flag review for moderation
   */
  async flagReview(reviewId: string, reason: string, reporterId: string): Promise<void> {
    console.log(`[Reviews] ${reviewId} flagged: ${reason}`)
  }
}

export const reviewService = new ReviewService()
