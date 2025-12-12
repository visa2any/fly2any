/**
 * Milestone Notifications - Fly2Any Growth OS
 * Progress tracking, milestone alerts, and celebration animations
 */

import { BadgeType, AchievementTier, BADGES, POINTS_CONFIG } from './gamification'

export interface Milestone {
  id: string
  type: 'badge' | 'level' | 'streak' | 'savings' | 'referral'
  name: string
  description: string
  icon: string
  tier: AchievementTier
  currentValue: number
  targetValue: number
  progress: number // 0-100
  reward?: { points: number; badge?: string }
  isComplete: boolean
  celebrationMessage?: string
}

export interface MilestoneNotification {
  id: string
  type: 'progress' | 'complete' | 'close' | 'streak'
  milestone: Milestone
  message: string
  timestamp: Date
  read: boolean
  celebration?: 'confetti' | 'fireworks' | 'stars' | 'glow'
}

export interface UserMilestoneProgress {
  userId: string
  activeMilestones: Milestone[]
  completedMilestones: string[]
  notifications: MilestoneNotification[]
  streakDays: number
  lastActivityDate: Date
}

// Milestone definitions for each badge
const BADGE_MILESTONES: Record<BadgeType, { steps: number[]; unit: string }> = {
  [BadgeType.FIRST_SEARCH]: { steps: [1], unit: 'search' },
  [BadgeType.FIRST_BOOKING]: { steps: [1], unit: 'booking' },
  [BadgeType.DEAL_HUNTER]: { steps: [100, 250, 500], unit: 'saved' },
  [BadgeType.GLOBE_TROTTER]: { steps: [3, 5, 10], unit: 'countries' },
  [BadgeType.REFERRAL_MASTER]: { steps: [5, 10, 25], unit: 'referrals' },
  [BadgeType.PRICE_WATCHER]: { steps: [3, 5, 10], unit: 'alerts' },
  [BadgeType.EARLY_BIRD]: { steps: [1], unit: 'booking' },
  [BadgeType.FREQUENT_FLYER]: { steps: [3, 5, 10], unit: 'bookings' },
  [BadgeType.EXPLORER]: { steps: [10, 25, 50], unit: 'routes' },
  [BadgeType.VIP]: { steps: [1000, 2500, 5000], unit: 'points' }
}

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 4000, 8000, 15000, 30000]
const LEVEL_NAMES = ['', 'Starter', 'Explorer', 'Adventurer', 'Navigator',
  'Voyager', 'Globetrotter', 'Elite', 'Master', 'Legend', 'Champion']

export class MilestoneService {
  /**
   * Calculate milestones for a user
   */
  calculateMilestones(progress: {
    searchCount: number
    bookingCount: number
    totalPoints: number
    referralCount: number
    alertsCreated: number
    countriesVisited: string[]
    totalSaved: number
    level: number
    earnedBadges: BadgeType[]
  }): Milestone[] {
    const milestones: Milestone[] = []

    // Badge milestones
    for (const badge of BADGES) {
      if (progress.earnedBadges.includes(badge.type)) continue

      const config = BADGE_MILESTONES[badge.type]
      let currentValue = 0
      let targetValue = config.steps[config.steps.length - 1]

      switch (badge.type) {
        case BadgeType.FIRST_SEARCH:
        case BadgeType.EXPLORER:
          currentValue = progress.searchCount
          break
        case BadgeType.FIRST_BOOKING:
        case BadgeType.FREQUENT_FLYER:
          currentValue = progress.bookingCount
          break
        case BadgeType.DEAL_HUNTER:
          currentValue = progress.totalSaved
          break
        case BadgeType.GLOBE_TROTTER:
          currentValue = progress.countriesVisited.length
          break
        case BadgeType.REFERRAL_MASTER:
          currentValue = progress.referralCount
          break
        case BadgeType.PRICE_WATCHER:
          currentValue = progress.alertsCreated
          break
        case BadgeType.VIP:
          currentValue = progress.totalPoints
          break
      }

      const progressPercent = Math.min((currentValue / targetValue) * 100, 100)

      milestones.push({
        id: `badge-${badge.type}`,
        type: 'badge',
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        tier: badge.tier,
        currentValue,
        targetValue,
        progress: progressPercent,
        reward: { points: badge.points, badge: badge.name },
        isComplete: progressPercent >= 100,
        celebrationMessage: `You earned the ${badge.name} badge!`
      })
    }

    // Level milestone
    if (progress.level < 10) {
      const nextLevelPoints = LEVEL_THRESHOLDS[progress.level]
      const currentLevelPoints = LEVEL_THRESHOLDS[progress.level - 1] || 0
      const pointsInLevel = progress.totalPoints - currentLevelPoints
      const pointsNeeded = nextLevelPoints - currentLevelPoints
      const levelProgress = (pointsInLevel / pointsNeeded) * 100

      milestones.push({
        id: `level-${progress.level + 1}`,
        type: 'level',
        name: `Level ${progress.level + 1}: ${LEVEL_NAMES[progress.level + 1]}`,
        description: `Reach ${nextLevelPoints.toLocaleString()} total points`,
        icon: '⭐',
        tier: progress.level >= 7 ? AchievementTier.PLATINUM :
              progress.level >= 5 ? AchievementTier.GOLD :
              progress.level >= 3 ? AchievementTier.SILVER : AchievementTier.BRONZE,
        currentValue: progress.totalPoints,
        targetValue: nextLevelPoints,
        progress: levelProgress,
        reward: { points: 50 },
        isComplete: false,
        celebrationMessage: `You reached Level ${progress.level + 1}!`
      })
    }

    return milestones.sort((a, b) => b.progress - a.progress)
  }

  /**
   * Get milestones that are close to completion (75%+)
   */
  getCloseMilestones(milestones: Milestone[]): Milestone[] {
    return milestones.filter(m => m.progress >= 75 && m.progress < 100)
  }

  /**
   * Generate notification for milestone progress
   */
  generateProgressNotification(
    milestone: Milestone,
    previousProgress: number
  ): MilestoneNotification | null {
    // Only notify at key thresholds: 50%, 75%, 90%, 100%
    const thresholds = [50, 75, 90, 100]
    const crossed = thresholds.find(t =>
      previousProgress < t && milestone.progress >= t
    )

    if (!crossed) return null

    const messages: Record<number, string> = {
      50: `Halfway to ${milestone.name}! Keep going!`,
      75: `Almost there! Just ${Math.ceil(milestone.targetValue - milestone.currentValue)} more to ${milestone.name}`,
      90: `So close! ${milestone.name} is within reach!`,
      100: milestone.celebrationMessage || `Congratulations! You earned ${milestone.name}!`
    }

    return {
      id: `notif-${Date.now()}`,
      type: crossed === 100 ? 'complete' : crossed >= 90 ? 'close' : 'progress',
      milestone,
      message: messages[crossed] || `Progress update on ${milestone.name}`,
      timestamp: new Date(),
      read: false,
      celebration: crossed === 100 ? 'confetti' : crossed >= 90 ? 'stars' : undefined
    }
  }

  /**
   * Generate streak notification
   */
  generateStreakNotification(streakDays: number): MilestoneNotification | null {
    const streakMilestones = [3, 7, 14, 30, 60, 100]

    if (!streakMilestones.includes(streakDays)) return null

    const messages: Record<number, string> = {
      3: '3 day streak! You\'re building momentum!',
      7: '1 week streak! You\'re on fire!',
      14: '2 week streak! Incredible dedication!',
      30: '30 day streak! You\'re a legend!',
      60: '60 day streak! Unstoppable!',
      100: '100 day streak! Champion status!'
    }

    return {
      id: `streak-${Date.now()}`,
      type: 'streak',
      milestone: {
        id: `streak-${streakDays}`,
        type: 'streak',
        name: `${streakDays} Day Streak`,
        description: `Logged in ${streakDays} days in a row`,
        icon: '🔥',
        tier: streakDays >= 30 ? AchievementTier.PLATINUM :
              streakDays >= 14 ? AchievementTier.GOLD :
              streakDays >= 7 ? AchievementTier.SILVER : AchievementTier.BRONZE,
        currentValue: streakDays,
        targetValue: streakDays,
        progress: 100,
        reward: { points: streakDays * 5 },
        isComplete: true
      },
      message: messages[streakDays],
      timestamp: new Date(),
      read: false,
      celebration: streakDays >= 30 ? 'fireworks' : 'stars'
    }
  }

  /**
   * Get next milestone hint for user
   */
  getNextMilestoneHint(milestones: Milestone[]): string | null {
    const closest = milestones.find(m => !m.isComplete)
    if (!closest) return null

    const remaining = closest.targetValue - closest.currentValue

    if (closest.type === 'badge') {
      return `${remaining} more to earn "${closest.name}"`
    }

    if (closest.type === 'level') {
      return `${remaining.toLocaleString()} points to ${closest.name}`
    }

    return `${remaining} more to complete ${closest.name}`
  }
}

export const milestoneService = new MilestoneService()
