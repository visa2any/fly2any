/**
 * Referral Rewards Fulfillment System - Fly2Any Growth OS
 * Processes and delivers referral rewards automatically
 */

import { REFERRER_REWARD, REFEREE_DISCOUNT, calculateTotalReward, getUserTier } from './referral-system'

export interface RewardClaim {
  id: string
  userId: string
  type: 'referrer_credit' | 'referee_discount' | 'tier_bonus'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  referralId: string
  bookingId?: string
  expiresAt: Date
  processedAt?: Date
  failureReason?: string
  createdAt: Date
}

export interface UserWallet {
  userId: string
  balance: number
  pendingBalance: number
  lifetimeEarnings: number
  lifetimeRedeemed: number
  transactions: WalletTransaction[]
  lastUpdated: Date
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit' | 'pending' | 'expired'
  amount: number
  description: string
  referralId?: string
  bookingId?: string
  timestamp: Date
}

export interface RewardFulfillmentResult {
  success: boolean
  claimId: string
  amount: number
  newBalance: number
  message: string
}

// Reward expiration periods (in days)
const REWARD_EXPIRY = {
  referrer_credit: 365, // 1 year
  referee_discount: 90, // 3 months
  tier_bonus: 365,
}

export class RewardFulfillmentService {
  private wallets: Map<string, UserWallet> = new Map()
  private pendingClaims: Map<string, RewardClaim> = new Map()

  /**
   * Create reward claim when referral is completed
   */
  async createRewardClaim(
    userId: string,
    type: RewardClaim['type'],
    amount: number,
    referralId: string,
    bookingId?: string
  ): Promise<RewardClaim> {
    const claim: RewardClaim = {
      id: `claim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      type,
      amount,
      status: 'pending',
      referralId,
      bookingId,
      expiresAt: new Date(Date.now() + REWARD_EXPIRY[type] * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    }

    this.pendingClaims.set(claim.id, claim)
    console.log(`[Rewards] Created claim ${claim.id}: $${amount} ${type} for user ${userId}`)

    // Auto-process referrer credits
    if (type === 'referrer_credit') {
      await this.processReward(claim.id)
    }

    return claim
  }

  /**
   * Process and fulfill a reward claim
   */
  async processReward(claimId: string): Promise<RewardFulfillmentResult> {
    const claim = this.pendingClaims.get(claimId)
    if (!claim) {
      return { success: false, claimId, amount: 0, newBalance: 0, message: 'Claim not found' }
    }

    if (claim.status === 'completed') {
      return { success: false, claimId, amount: 0, newBalance: 0, message: 'Already processed' }
    }

    if (claim.expiresAt < new Date()) {
      claim.status = 'expired'
      return { success: false, claimId, amount: 0, newBalance: 0, message: 'Claim expired' }
    }

    claim.status = 'processing'

    try {
      // Get or create wallet
      const wallet = this.getOrCreateWallet(claim.userId)

      // Add credit to wallet
      const transaction: WalletTransaction = {
        id: `tx_${Date.now()}`,
        type: 'credit',
        amount: claim.amount,
        description: this.getTransactionDescription(claim),
        referralId: claim.referralId,
        bookingId: claim.bookingId,
        timestamp: new Date(),
      }

      wallet.transactions.push(transaction)
      wallet.balance += claim.amount
      wallet.lifetimeEarnings += claim.amount
      wallet.lastUpdated = new Date()

      // Mark claim as completed
      claim.status = 'completed'
      claim.processedAt = new Date()

      console.log(`[Rewards] Fulfilled claim ${claimId}: $${claim.amount} → User ${claim.userId} (Balance: $${wallet.balance})`)

      // Notify user
      await this.notifyUser(claim.userId, claim)

      return {
        success: true,
        claimId,
        amount: claim.amount,
        newBalance: wallet.balance,
        message: `$${claim.amount} added to your wallet!`,
      }
    } catch (error) {
      claim.status = 'failed'
      claim.failureReason = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, claimId, amount: 0, newBalance: 0, message: claim.failureReason }
    }
  }

  /**
   * Process referral completion (when referee makes first booking)
   */
  async processReferralCompletion(
    referrerId: string,
    refereeId: string,
    referralId: string,
    bookingId: string,
    bookingAmount: number
  ): Promise<{ referrerResult: RewardFulfillmentResult; refereeResult: RewardFulfillmentResult }> {
    // Get referrer's tier for bonus calculation
    const referrerTier = await this.getReferrerTier(referrerId)
    const referrerReward = calculateTotalReward(referrerTier.completedReferrals)

    // Create and process referrer reward
    const referrerClaim = await this.createRewardClaim(
      referrerId,
      'referrer_credit',
      referrerReward,
      referralId,
      bookingId
    )
    const referrerResult = await this.processReward(referrerClaim.id)

    // Create and process referee discount (if not already applied)
    const refereeClaim = await this.createRewardClaim(
      refereeId,
      'referee_discount',
      REFEREE_DISCOUNT,
      referralId,
      bookingId
    )
    const refereeResult = await this.processReward(refereeClaim.id)

    // Check for tier upgrade bonus
    const newTier = await this.getReferrerTier(referrerId)
    if (newTier.name !== referrerTier.name) {
      await this.awardTierBonus(referrerId, newTier.name, referralId)
    }

    return { referrerResult, refereeResult }
  }

  /**
   * Apply wallet credit to booking
   */
  async applyCredit(
    userId: string,
    bookingId: string,
    amount: number
  ): Promise<{ success: boolean; appliedAmount: number; remainingBalance: number }> {
    const wallet = this.wallets.get(userId)
    if (!wallet || wallet.balance < amount) {
      const available = wallet?.balance || 0
      return { success: false, appliedAmount: 0, remainingBalance: available }
    }

    const appliedAmount = Math.min(amount, wallet.balance)

    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}`,
      type: 'debit',
      amount: -appliedAmount,
      description: `Applied to booking ${bookingId}`,
      bookingId,
      timestamp: new Date(),
    }

    wallet.transactions.push(transaction)
    wallet.balance -= appliedAmount
    wallet.lifetimeRedeemed += appliedAmount
    wallet.lastUpdated = new Date()

    console.log(`[Rewards] Applied $${appliedAmount} credit to booking ${bookingId}`)

    return { success: true, appliedAmount, remainingBalance: wallet.balance }
  }

  /**
   * Get user wallet balance
   */
  getWalletBalance(userId: string): { balance: number; pending: number } {
    const wallet = this.wallets.get(userId)
    if (!wallet) return { balance: 0, pending: 0 }

    return { balance: wallet.balance, pending: wallet.pendingBalance }
  }

  /**
   * Get user wallet details
   */
  getWallet(userId: string): UserWallet | null {
    return this.wallets.get(userId) || null
  }

  /**
   * Get pending claims for user
   */
  getPendingClaims(userId: string): RewardClaim[] {
    return Array.from(this.pendingClaims.values())
      .filter(c => c.userId === userId && c.status === 'pending')
  }

  /**
   * Process expired claims (cron job)
   */
  async processExpiredClaims(): Promise<number> {
    const now = new Date()
    let expired = 0

    this.pendingClaims.forEach(claim => {
      if (claim.status === 'pending' && claim.expiresAt < now) {
        claim.status = 'expired'
        expired++

        // Update pending balance
        const wallet = this.wallets.get(claim.userId)
        if (wallet) {
          wallet.pendingBalance -= claim.amount
        }

        console.log(`[Rewards] Claim ${claim.id} expired`)
      }
    })

    return expired
  }

  /**
   * Get reward statistics
   */
  getStats(): {
    totalWallets: number
    totalBalance: number
    totalEarned: number
    totalRedeemed: number
    pendingClaims: number
  } {
    let totalBalance = 0
    let totalEarned = 0
    let totalRedeemed = 0

    this.wallets.forEach(wallet => {
      totalBalance += wallet.balance
      totalEarned += wallet.lifetimeEarnings
      totalRedeemed += wallet.lifetimeRedeemed
    })

    const pendingClaims = Array.from(this.pendingClaims.values())
      .filter(c => c.status === 'pending').length

    return {
      totalWallets: this.wallets.size,
      totalBalance,
      totalEarned,
      totalRedeemed,
      pendingClaims,
    }
  }

  // Private methods

  private getOrCreateWallet(userId: string): UserWallet {
    let wallet = this.wallets.get(userId)
    if (!wallet) {
      wallet = {
        userId,
        balance: 0,
        pendingBalance: 0,
        lifetimeEarnings: 0,
        lifetimeRedeemed: 0,
        transactions: [],
        lastUpdated: new Date(),
      }
      this.wallets.set(userId, wallet)
    }
    return wallet
  }

  private getTransactionDescription(claim: RewardClaim): string {
    switch (claim.type) {
      case 'referrer_credit':
        return 'Referral reward - Friend completed booking'
      case 'referee_discount':
        return 'Welcome discount - New user reward'
      case 'tier_bonus':
        return 'Tier upgrade bonus'
      default:
        return 'Reward credit'
    }
  }

  private async getReferrerTier(userId: string): Promise<{ name: string; completedReferrals: number }> {
    // In production: fetch from database
    const mockReferrals = Math.floor(Math.random() * 30)
    const tier = getUserTier(mockReferrals)
    return { name: tier.name, completedReferrals: mockReferrals }
  }

  private async awardTierBonus(userId: string, tierName: string, referralId: string): Promise<void> {
    const bonusAmounts: Record<string, number> = {
      Bronze: 10,
      Silver: 25,
      Gold: 50,
      Platinum: 100,
    }

    const bonus = bonusAmounts[tierName]
    if (bonus) {
      await this.createRewardClaim(userId, 'tier_bonus', bonus, referralId)
      console.log(`[Rewards] Tier upgrade bonus: $${bonus} for reaching ${tierName}`)
    }
  }

  private async notifyUser(userId: string, claim: RewardClaim): Promise<void> {
    // In production: send email/push notification
    console.log(`[Rewards] Notification sent to ${userId}: ${claim.type} - $${claim.amount}`)
  }
}

export const rewardFulfillmentService = new RewardFulfillmentService()
