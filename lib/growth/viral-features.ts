/**
 * Viral Features - Fly2Any Growth OS
 * Social sharing, social proof, and viral mechanics
 */

export interface ShareableContent {
  type: 'deal' | 'booking' | 'savings' | 'alert' | 'achievement'
  title: string
  description: string
  image?: string
  url: string
  hashtags: string[]
  stats?: Record<string, number>
}

export interface SocialProofData {
  recentSearches: number
  recentBookings: number
  totalSaved: number
  activeUsers: number
  happyTravelers: number
  dealsToday: number
}

export interface ShareStats {
  totalShares: number
  byPlatform: Record<string, number>
  clicks: number
  conversions: number
}

export class ViralFeaturesService {
  private baseUrl = 'https://fly2any.com'

  /**
   * Generate shareable deal card
   */
  generateDealCard(deal: {
    origin: string
    destination: string
    price: number
    originalPrice: number
    airline: string
    departureDate: string
  }): ShareableContent {
    const savings = deal.originalPrice - deal.price
    const savingsPercent = Math.round((savings / deal.originalPrice) * 100)

    return {
      type: 'deal',
      title: `${deal.origin} to ${deal.destination} - $${deal.price}`,
      description: `Save ${savingsPercent}% on flights with ${deal.airline}! Found on Fly2Any`,
      url: `${this.baseUrl}/deals/${deal.origin.toLowerCase()}-${deal.destination.toLowerCase()}?ref=share`,
      hashtags: ['travel', 'flightdeals', 'fly2any', deal.destination.toLowerCase()],
      stats: {
        price: deal.price,
        originalPrice: deal.originalPrice,
        savings,
        savingsPercent
      }
    }
  }

  /**
   * Generate booking success card
   */
  generateBookingCard(booking: {
    route: string
    price: number
    savings: number
    userName: string
  }): ShareableContent {
    return {
      type: 'booking',
      title: `Just booked ${booking.route} for $${booking.price}!`,
      description: `${booking.userName} saved $${booking.savings} with Fly2Any. Find your deal too!`,
      url: `${this.baseUrl}?ref=booking`,
      hashtags: ['travel', 'traveldeals', 'fly2any', 'wanderlust'],
      stats: {
        price: booking.price,
        savings: booking.savings
      }
    }
  }

  /**
   * Generate savings milestone card
   */
  generateSavingsCard(data: {
    totalSaved: number
    bookings: number
    userName: string
  }): ShareableContent {
    return {
      type: 'savings',
      title: `I've saved $${data.totalSaved} with Fly2Any!`,
      description: `${data.userName} has saved $${data.totalSaved} across ${data.bookings} bookings. Join the savings!`,
      url: `${this.baseUrl}?ref=savings`,
      hashtags: ['travelhack', 'flightsavings', 'fly2any', 'budgettravel'],
      stats: {
        totalSaved: data.totalSaved,
        bookings: data.bookings
      }
    }
  }

  /**
   * Generate achievement badge card
   */
  generateAchievementCard(achievement: {
    name: string
    icon: string
    description: string
    userName: string
  }): ShareableContent {
    return {
      type: 'achievement',
      title: `${achievement.icon} ${achievement.name} unlocked!`,
      description: `${achievement.userName} earned the "${achievement.name}" badge on Fly2Any!`,
      url: `${this.baseUrl}/achievements?ref=badge`,
      hashtags: ['achievement', 'travel', 'fly2any'],
      stats: {}
    }
  }

  /**
   * Generate share URLs for each platform
   */
  getShareUrls(content: ShareableContent): Record<string, string> {
    const encodedTitle = encodeURIComponent(content.title)
    const encodedDesc = encodeURIComponent(content.description)
    const encodedUrl = encodeURIComponent(content.url)
    const hashtagString = content.hashtags.map(h => `#${h}`).join(' ')

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${content.hashtags.join(',')}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      copy: content.url
    }
  }

  /**
   * Get real-time social proof data
   */
  async getSocialProof(): Promise<SocialProofData> {
    // In production: Query from database/analytics
    // Using realistic-looking numbers that update periodically
    const baseSearches = 1247
    const baseBookings = 89
    const baseSaved = 127450
    const baseUsers = 15420
    const baseHappy = 12340
    const baseDeals = 47

    // Add some randomness to simulate real-time activity
    const variance = () => Math.floor(Math.random() * 10)

    return {
      recentSearches: baseSearches + variance(),
      recentBookings: baseBookings + Math.floor(variance() / 3),
      totalSaved: baseSaved + variance() * 100,
      activeUsers: baseUsers + variance() * 5,
      happyTravelers: baseHappy + variance() * 2,
      dealsToday: baseDeals + Math.floor(variance() / 2)
    }
  }

  /**
   * Generate social proof widget data
   */
  async getWidgetData(): Promise<{
    recentActivity: Array<{action: string, location: string, timeAgo: string}>
    counters: SocialProofData
  }> {
    const counters = await this.getSocialProof()

    // Generate recent activity items
    const activities = [
      { action: 'just booked', location: 'NYC to Paris' },
      { action: 'saved $234 on', location: 'LA to Tokyo' },
      { action: 'is searching', location: 'Miami to Cancun' },
      { action: 'just booked', location: 'Chicago to London' },
      { action: 'set a price alert for', location: 'Boston to Rome' }
    ]

    const timeAgos = ['just now', '2 min ago', '5 min ago', '8 min ago', '12 min ago']

    const recentActivity = activities.map((a, i) => ({
      ...a,
      timeAgo: timeAgos[i]
    }))

    return { recentActivity, counters }
  }

  /**
   * Track share event
   */
  async trackShare(contentType: string, platform: string, userId?: string): Promise<void> {
    console.log(`[Viral] Share tracked: ${contentType} on ${platform} by ${userId || 'anonymous'}`)
    // In production: Save to analytics
  }

  /**
   * Generate embeddable widget code
   */
  getEmbedCode(type: 'deal-finder' | 'price-alert' | 'social-proof'): string {
    const widgetUrls = {
      'deal-finder': `${this.baseUrl}/embed/deal-finder`,
      'price-alert': `${this.baseUrl}/embed/price-alert`,
      'social-proof': `${this.baseUrl}/embed/social-proof`
    }

    return `<iframe src="${widgetUrls[type]}" width="100%" height="400" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`
  }
}

export const viralService = new ViralFeaturesService()
