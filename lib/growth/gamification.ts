/**
 * Gamification System - Fly2Any Growth OS
 * Points, badges, achievements, and rewards
 */

export enum BadgeType {
  FIRST_SEARCH = 'first_search',
  FIRST_BOOKING = 'first_booking',
  DEAL_HUNTER = 'deal_hunter',
  GLOBE_TROTTER = 'globe_trotter',
  REFERRAL_MASTER = 'referral_master',
  PRICE_WATCHER = 'price_watcher',
  EARLY_BIRD = 'early_bird',
  FREQUENT_FLYER = 'frequent_flyer',
  EXPLORER = 'explorer',
  VIP = 'vip'
}

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export interface Badge {
  type: BadgeType
  name: string
  description: string
  icon: string
  points: number
  tier: AchievementTier
  requirements: string
  unlockedAt?: Date
}

export interface UserProgress {
  userId: string
  totalPoints: number
  level: number
  badges: Badge[]
  searchCount: number
  bookingCount: number
  referralCount: number
  alertsCreated: number
  countriesVisited: string[]
  consecutiveDays: number
}

export interface PointsTransaction {
  userId: string
  type: 'earn' | 'spend' | 'bonus' | 'referral'
  amount: number
  reason: string
  createdAt: Date
}

export const BADGES: Badge[] = [
  {
    type: BadgeType.FIRST_SEARCH,
    name: 'First Steps',
    description: 'Complete your first flight search',
    icon: '🔍',
    points: 10,
    tier: AchievementTier.BRONZE,
    requirements: '1 search'
  },
  {
    type: BadgeType.FIRST_BOOKING,
    name: 'Ready for Takeoff',
    description: 'Book your first flight',
    icon: '✈️',
    points: 100,
    tier: AchievementTier.SILVER,
    requirements: '1 booking'
  },
  {
    type: BadgeType.DEAL_HUNTER,
    name: 'Deal Hunter',
    description: 'Save $500+ on bookings',
    icon: '💰',
    points: 250,
    tier: AchievementTier.GOLD,
    requirements: '$500+ saved'
  },
  {
    type: BadgeType.GLOBE_TROTTER,
    name: 'Globe Trotter',
    description: 'Visit 10 different countries',
    icon: '🌍',
    points: 500,
    tier: AchievementTier.PLATINUM,
    requirements: '10 countries'
  },
  {
    type: BadgeType.REFERRAL_MASTER,
    name: 'Referral Master',
    description: 'Refer 25 friends who sign up',
    icon: '👥',
    points: 500,
    tier: AchievementTier.PLATINUM,
    requirements: '25 referrals'
  },
  {
    type: BadgeType.PRICE_WATCHER,
    name: 'Price Watcher',
    description: 'Create 10 price alerts',
    icon: '👁️',
    points: 50,
    tier: AchievementTier.BRONZE,
    requirements: '10 alerts'
  },
  {
    type: BadgeType.EARLY_BIRD,
    name: 'Early Bird',
    description: 'Book a flight 90+ days in advance',
    icon: '🐦',
    points: 100,
    tier: AchievementTier.SILVER,
    requirements: '90+ days advance booking'
  },
  {
    type: BadgeType.FREQUENT_FLYER,
    name: 'Frequent Flyer',
    description: 'Book 10 flights',
    icon: '🎖️',
    points: 300,
    tier: AchievementTier.GOLD,
    requirements: '10 bookings'
  },
  {
    type: BadgeType.EXPLORER,
    name: 'Explorer',
    description: 'Search 50 different routes',
    icon: '🧭',
    points: 100,
    tier: AchievementTier.SILVER,
    requirements: '50 routes searched'
  },
  {
    type: BadgeType.VIP,
    name: 'VIP Status',
    description: 'Reach 5,000 total points',
    icon: '👑',
    points: 500,
    tier: AchievementTier.PLATINUM,
    requirements: '5,000 points'
  }
]

// Points configuration
export const POINTS_CONFIG = {
  search: 1,
  booking: 50,
  bookingPerDollar: 1,
  referralSignup: 100,
  referralBooking: 50,
  priceAlertCreated: 5,
  priceAlertTriggered: 10,
  dailyLogin: 5,
  consecutiveDayBonus: 10,
  reviewSubmitted: 25,
  socialShare: 10
}

export class GamificationService {
  /**
   * Calculate user level from points
   */
  calculateLevel(points: number): number {
    // Levels: 0-99=1, 100-299=2, 300-599=3, 600-999=4, 1000+=5, etc.
    if (points < 100) return 1
    if (points < 300) return 2
    if (points < 600) return 3
    if (points < 1000) return 4
    if (points < 2000) return 5
    if (points < 4000) return 6
    if (points < 8000) return 7
    if (points < 15000) return 8
    if (points < 30000) return 9
    return 10
  }

  /**
   * Get points needed for next level
   */
  pointsToNextLevel(points: number): number {
    const thresholds = [100, 300, 600, 1000, 2000, 4000, 8000, 15000, 30000]
    for (const threshold of thresholds) {
      if (points < threshold) return threshold - points
    }
    return 0
  }

  /**
   * Award points to user
   */
  async awardPoints(userId: string, amount: number, reason: string): Promise<PointsTransaction> {
    const transaction: PointsTransaction = {
      userId,
      type: 'earn',
      amount,
      reason,
      createdAt: new Date()
    }

    // In production: Save to database
    console.log(`[Gamification] Awarded ${amount} points to ${userId}: ${reason}`)

    return transaction
  }

  /**
   * Check and award badges
   */
  async checkBadges(progress: UserProgress): Promise<Badge[]> {
    const newBadges: Badge[] = []
    const earnedTypes = progress.badges.map(b => b.type)

    // Check each badge
    for (const badge of BADGES) {
      if (earnedTypes.includes(badge.type)) continue

      let earned = false

      switch (badge.type) {
        case BadgeType.FIRST_SEARCH:
          earned = progress.searchCount >= 1
          break
        case BadgeType.FIRST_BOOKING:
          earned = progress.bookingCount >= 1
          break
        case BadgeType.FREQUENT_FLYER:
          earned = progress.bookingCount >= 10
          break
        case BadgeType.REFERRAL_MASTER:
          earned = progress.referralCount >= 25
          break
        case BadgeType.PRICE_WATCHER:
          earned = progress.alertsCreated >= 10
          break
        case BadgeType.GLOBE_TROTTER:
          earned = progress.countriesVisited.length >= 10
          break
        case BadgeType.EXPLORER:
          earned = progress.searchCount >= 50
          break
        case BadgeType.VIP:
          earned = progress.totalPoints >= 5000
          break
      }

      if (earned) {
        const awardedBadge = { ...badge, unlockedAt: new Date() }
        newBadges.push(awardedBadge)
        await this.awardPoints(progress.userId, badge.points, `Badge unlocked: ${badge.name}`)
      }
    }

    return newBadges
  }

  /**
   * Process daily login bonus
   */
  async processDailyLogin(userId: string, lastLogin: Date | null): Promise<{points: number, consecutiveDays: number}> {
    const now = new Date()
    let consecutiveDays = 1
    let bonusPoints = POINTS_CONFIG.dailyLogin

    if (lastLogin) {
      const daysSinceLastLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceLastLogin === 1) {
        // Consecutive day
        consecutiveDays++
        bonusPoints += POINTS_CONFIG.consecutiveDayBonus * Math.min(consecutiveDays, 7)
      } else if (daysSinceLastLogin > 1) {
        // Streak broken
        consecutiveDays = 1
      }
    }

    await this.awardPoints(userId, bonusPoints, `Daily login bonus (Day ${consecutiveDays})`)

    return { points: bonusPoints, consecutiveDays }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{rank: number, userId: string, name: string, points: number, level: number}>> {
    // In production: Query from database
    return [
      { rank: 1, userId: '1', name: 'John D.', points: 15420, level: 8 },
      { rank: 2, userId: '2', name: 'Sarah M.', points: 12350, level: 7 },
      { rank: 3, userId: '3', name: 'Mike R.', points: 9870, level: 6 },
      { rank: 4, userId: '4', name: 'Emily K.', points: 7650, level: 6 },
      { rank: 5, userId: '5', name: 'David L.', points: 5430, level: 5 }
    ].slice(0, limit)
  }

  /**
   * Calculate redemption value
   */
  getRedemptionValue(points: number): number {
    // 100 points = $1
    return points / 100
  }
}

export const gamificationService = new GamificationService()
