/**
 * Referral Tracking Service
 *
 * Handles affiliate referral tracking via URL parameters and cookies
 * Used to attribute bookings to the correct affiliate partner
 */

import { cookies } from 'next/headers'
import { getPrismaClient } from '@/lib/prisma'

const prisma = getPrismaClient()

// Cookie configuration
const REFERRAL_COOKIE_NAME = 'fly2any_ref'
const REFERRAL_COOKIE_DAYS = 30 // 30-day attribution window

/**
 * Client-side: Store referral code in cookie from URL parameter
 * Call this on landing page when ?ref=CODE is present
 */
export function storeReferralCode(referralCode: string): void {
  if (typeof window === 'undefined') return

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + REFERRAL_COOKIE_DAYS)

  document.cookie = `${REFERRAL_COOKIE_NAME}=${referralCode}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`

  console.log(`✅ Referral code stored: ${referralCode} (expires in ${REFERRAL_COOKIE_DAYS} days)`)
}

/**
 * Client-side: Get referral code from cookie
 */
export function getReferralCodeFromCookie(): string | null {
  if (typeof window === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${REFERRAL_COOKIE_NAME}=`)

  if (parts.length === 2) {
    const code = parts.pop()?.split(';').shift()
    return code || null
  }

  return null
}

/**
 * Server-side: Get referral code from cookies
 */
export async function getReferralCodeServer(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const referralCookie = cookieStore.get(REFERRAL_COOKIE_NAME)

    return referralCookie?.value || null
  } catch (error) {
    console.error('Error reading referral cookie:', error)
    return null
  }
}

/**
 * Track referral click (store in database)
 */
export async function trackReferralClick({
  referralCode,
  ipAddress,
  userAgent,
  referrerUrl,
  landingPage,
  utmSource,
  utmMedium,
  utmCampaign,
}: {
  referralCode: string
  ipAddress: string
  userAgent: string
  referrerUrl?: string
  landingPage: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}) {
  try {
    // Find affiliate by referral code
    const affiliate = await prisma!.affiliate.findUnique({
      where: { referralCode },
      select: { id: true, status: true },
    })

    if (!affiliate) {
      console.warn(`⚠️  Invalid referral code: ${referralCode}`)
      return { success: false, error: 'Invalid referral code' }
    }

    if (affiliate.status !== 'active') {
      console.warn(`⚠️  Inactive affiliate: ${referralCode}`)
      return { success: false, error: 'Affiliate not active' }
    }

    // Create click tracking record
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Cookie expires in 30 days
    const cookieExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma!.affiliateReferral.create({
      data: {
        affiliateId: affiliate.id,
        clickId,
        ipAddress,
        userAgent,
        referrerUrl,
        landingPage,
        utmSource,
        utmMedium,
        utmCampaign,
        cookieExpiry,
        status: 'clicked',
      },
    })

    // Update affiliate click count
    await prisma!.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalClicks: { increment: 1 },
      },
    })

    console.log(`✅ Click tracked: ${referralCode} (${clickId})`)

    return {
      success: true,
      clickId,
      affiliateId: affiliate.id,
    }
  } catch (error) {
    console.error('Error tracking referral click:', error)
    return { success: false, error: 'Failed to track click' }
  }
}

/**
 * Track when referred user signs up
 */
export async function trackReferralSignup({
  referralCode,
  userId,
  userEmail,
}: {
  referralCode: string
  userId: string
  userEmail: string
}) {
  try {
    // Find affiliate
    const affiliate = await prisma!.affiliate.findUnique({
      where: { referralCode },
      select: { id: true },
    })

    if (!affiliate) {
      console.warn(`⚠️  Invalid referral code for signup: ${referralCode}`)
      return { success: false }
    }

    // Update referral status to signed_up
    await prisma!.affiliateReferral.updateMany({
      where: {
        affiliateId: affiliate.id,
        status: 'clicked',
        userId: null,
      },
      data: {
        status: 'signed_up',
        userId,
        signedUpAt: new Date(),
      },
    })

    // Update affiliate stats
    await prisma!.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalReferrals: { increment: 1 },
      },
    })

    console.log(`✅ Signup tracked: ${referralCode} (User: ${userEmail})`)

    return { success: true, affiliateId: affiliate.id }
  } catch (error) {
    console.error('Error tracking referral signup:', error)
    return { success: false, error: 'Failed to track signup' }
  }
}

/**
 * Track when referred user makes a booking
 * This creates the commission record with enhanced lifecycle support
 */
export async function trackReferralBooking({
  referralCode,
  userId,
  bookingId,
  customerPaid,
  ourProfit,
  currency,
  productType,
  tripStartDate,
  tripEndDate,
  contentSource,
  contentUrl,
  contentTitle,
  utmCampaign,
  utmSource,
  utmMedium,
  utmContent,
}: {
  referralCode: string
  userId: string
  bookingId: string
  customerPaid: number
  ourProfit: number
  currency: string
  productType: string
  tripStartDate: Date
  tripEndDate: Date
  contentSource?: string
  contentUrl?: string
  contentTitle?: string
  utmCampaign?: string
  utmSource?: string
  utmMedium?: string
  utmContent?: string
}) {
  try {
    // Find affiliate with full details
    const affiliate = await prisma!.affiliate.findUnique({
      where: { referralCode },
      select: {
        id: true,
        tier: true,
        category: true,
        trustLevel: true,
        customHoldPeriod: true,
        customCommissionEnabled: true,
        customFlightCommission: true,
        customHotelCommission: true,
        customPackageCommission: true,
        customCarCommission: true,
        customActivityCommission: true,
        volumeBonusEnabled: true,
        volumeBonusThreshold: true,
        volumeBonusRate: true,
        performanceBonusEnabled: true,
        performanceBonusTarget: true,
        performanceBonusRate: true,
        exclusivityBonusEnabled: true,
        exclusivityBonusRate: true,
        monthlyCompletedTrips: true,
        totalClicks: true,
        completedTrips: true,
      },
    })

    if (!affiliate) {
      console.warn(`⚠️  Invalid referral code for booking: ${referralCode}`)
      return { success: false }
    }

    // ============================================
    // STEP 1: CALCULATE BASE COMMISSION
    // ============================================

    let baseCommissionRate: number

    // Check for custom commission rates
    if (affiliate.customCommissionEnabled) {
      const customRates: Record<string, number | null> = {
        flight: affiliate.customFlightCommission,
        hotel: affiliate.customHotelCommission,
        package: affiliate.customPackageCommission,
        car: affiliate.customCarCommission,
        activity: affiliate.customActivityCommission,
      }

      baseCommissionRate = customRates[productType] || getTierCommissionRate(affiliate.tier)
    } else {
      baseCommissionRate = getTierCommissionRate(affiliate.tier)
    }

    const baseCommissionAmount = ourProfit * baseCommissionRate

    // ============================================
    // STEP 2: CALCULATE BONUSES
    // ============================================

    let volumeBonusAmount = 0
    let performanceBonusAmount = 0
    let exclusivityBonusAmount = 0

    // Volume Bonus (extra % after X bookings per month)
    if (affiliate.volumeBonusEnabled && affiliate.volumeBonusThreshold && affiliate.volumeBonusRate) {
      if (affiliate.monthlyCompletedTrips >= affiliate.volumeBonusThreshold) {
        volumeBonusAmount = baseCommissionAmount * affiliate.volumeBonusRate
      }
    }

    // Performance Bonus (extra % if conversion rate high)
    if (affiliate.performanceBonusEnabled && affiliate.performanceBonusTarget && affiliate.performanceBonusRate) {
      const conversionRate = affiliate.completedTrips / (affiliate.totalClicks || 1)
      if (conversionRate >= affiliate.performanceBonusTarget) {
        performanceBonusAmount = baseCommissionAmount * affiliate.performanceBonusRate
      }
    }

    // Exclusivity Bonus
    if (affiliate.exclusivityBonusEnabled && affiliate.exclusivityBonusRate) {
      exclusivityBonusAmount = baseCommissionAmount * affiliate.exclusivityBonusRate
    }

    const totalCommissionAmount = baseCommissionAmount + volumeBonusAmount + performanceBonusAmount + exclusivityBonusAmount

    // ============================================
    // STEP 3: DETERMINE HOLD PERIOD
    // ============================================

    let holdPeriodDays: number

    if (affiliate.customHoldPeriod !== null && affiliate.customHoldPeriod !== undefined) {
      // Custom override
      holdPeriodDays = affiliate.customHoldPeriod
    } else {
      // Look up from configuration table
      const holdConfig = await prisma!.holdPeriodConfig.findUnique({
        where: {
          category_trustLevel: {
            category: affiliate.category,
            trustLevel: affiliate.trustLevel,
          },
        },
      })

      holdPeriodDays = holdConfig?.holdPeriodDays || 30 // Default to 30 days
    }

    // ============================================
    // STEP 4: FIND REFERRAL ID
    // ============================================

    const referral = await prisma!.affiliateReferral.findFirst({
      where: {
        affiliateId: affiliate.id,
        userId,
        status: { in: ['clicked', 'signed_up'] },
      },
      orderBy: { clickedAt: 'desc' },
    })

    if (!referral) {
      console.warn(`⚠️  No referral found for user ${userId} and affiliate ${affiliate.id}`)
      return { success: false, error: 'No referral found' }
    }

    // ============================================
    // STEP 5: CREATE COMMISSION RECORD
    // ============================================

    const commission = await prisma!.commission.create({
      data: {
        affiliateId: affiliate.id,
        referralId: referral.id,
        bookingId,
        userId,
        bookingType: productType,
        productDetails: {},
        revenueModel: 'commission',
        customerTotalPaid: customerPaid,
        supplierCost: customerPaid - ourProfit,
        yourGrossProfit: ourProfit,
        affiliateTierAtBooking: affiliate.tier,
        commissionRate: baseCommissionRate,
        commissionAmount: totalCommissionAmount, // For backwards compatibility
        bookingDate: new Date(),
        tripStartDate,
        tripEndDate,
        status: 'pending', // Will move to trip_in_progress when trip starts
        holdPeriodDays,
        baseCommissionRate,
        baseCommissionAmount,
        volumeBonusApplied: volumeBonusAmount > 0,
        volumeBonusAmount,
        performanceBonusApplied: performanceBonusAmount > 0,
        performanceBonusAmount,
        exclusivityBonusApplied: exclusivityBonusAmount > 0,
        exclusivityBonusAmount,
        totalCommissionAmount,
        contentSource,
        contentUrl,
        contentTitle,
        utmCampaign,
        utmSource,
        utmMedium,
        utmContent,
      },
    })

    // ============================================
    // STEP 6: CREATE LIFECYCLE LOG
    // ============================================

    await prisma!.commissionLifecycleLog.create({
      data: {
        commissionId: commission.id,
        fromStatus: 'none',
        toStatus: 'pending',
        reason: `Booking created. Trip: ${tripStartDate.toISOString().split('T')[0]} to ${tripEndDate.toISOString().split('T')[0]}. Hold period: ${holdPeriodDays} days.`,
        automated: true,
        metadata: {
          baseCommission: baseCommissionAmount,
          bonuses: {
            volume: volumeBonusAmount,
            performance: performanceBonusAmount,
            exclusivity: exclusivityBonusAmount,
          },
          totalCommission: totalCommissionAmount,
        },
      },
    })

    // ============================================
    // STEP 7: UPDATE REFERRAL STATUS
    // ============================================

    await prisma!.affiliateReferral.update({
      where: { id: referral.id },
      data: {
        status: 'booked',
        bookingId,
        bookedAt: new Date(),
      },
    })

    // ============================================
    // STEP 8: UPDATE AFFILIATE STATS
    // ============================================

    await prisma!.affiliate.update({
      where: { id: affiliate.id },
      data: {
        pendingBalance: { increment: totalCommissionAmount },
        totalCustomerSpend: { increment: customerPaid },
        totalYourProfit: { increment: ourProfit },
        totalCommissionsEarned: { increment: totalCommissionAmount },
      },
    })

    console.log(`✅ Booking tracked: ${referralCode}`)
    console.log(`   Base Commission: ${currency} ${baseCommissionAmount.toFixed(2)} (${(baseCommissionRate * 100).toFixed(0)}%)`)
    if (volumeBonusAmount > 0) console.log(`   + Volume Bonus: ${currency} ${volumeBonusAmount.toFixed(2)}`)
    if (performanceBonusAmount > 0) console.log(`   + Performance Bonus: ${currency} ${performanceBonusAmount.toFixed(2)}`)
    if (exclusivityBonusAmount > 0) console.log(`   + Exclusivity Bonus: ${currency} ${exclusivityBonusAmount.toFixed(2)}`)
    console.log(`   = Total Commission: ${currency} ${totalCommissionAmount.toFixed(2)}`)
    console.log(`   Hold Period: ${holdPeriodDays} days after trip completion`)

    return {
      success: true,
      commissionId: commission.id,
      baseCommissionAmount,
      bonuses: {
        volume: volumeBonusAmount,
        performance: performanceBonusAmount,
        exclusivity: exclusivityBonusAmount,
      },
      totalCommissionAmount,
      holdPeriodDays,
    }
  } catch (error) {
    console.error('Error tracking referral booking:', error)
    return { success: false, error: 'Failed to track booking' }
  }
}

/**
 * Helper: Get tier-based commission rate
 */
function getTierCommissionRate(tier: string): number {
  const tierRates: Record<string, number> = {
    starter: 0.15,  // 15%
    bronze: 0.20,   // 20%
    silver: 0.25,   // 25%
    gold: 0.30,     // 30%
    platinum: 0.35, // 35%
  }
  return tierRates[tier] || 0.15
}

/**
 * Mark commission as available after trip completes (called by cron/webhook)
 */
export async function markCommissionAvailable(commissionId: string) {
  try {
    const commission = await prisma!.commission.findUnique({
      where: { id: commissionId },
      select: {
        id: true,
        affiliateId: true,
        commissionAmount: true,
        status: true
      },
    })

    if (!commission) {
      return { success: false, error: 'Commission not found' }
    }

    if (commission.status !== 'pending') {
      return { success: false, error: 'Commission not pending' }
    }

    // Update commission to available
    await prisma!.commission.update({
      where: { id: commissionId },
      data: {
        status: 'available',
        releasedAt: new Date(),
      },
    })

    // Move from pending to current balance
    await prisma!.affiliate.update({
      where: { id: commission.affiliateId },
      data: {
        pendingBalance: { decrement: commission.commissionAmount },
        currentBalance: { increment: commission.commissionAmount },
      },
    })

    // Update referral status to completed
    await prisma!.affiliateReferral.updateMany({
      where: {
        affiliateId: commission.affiliateId,
        status: 'booked',
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // Update affiliate completed trips counter
    await prisma!.affiliate.update({
      where: { id: commission.affiliateId },
      data: {
        completedTrips: { increment: 1 },
        monthlyCompletedTrips: { increment: 1 },
      },
    })

    console.log(`✅ Commission marked available: ${commissionId}`)

    return { success: true }
  } catch (error) {
    console.error('Error marking commission available:', error)
    return { success: false, error: 'Failed to update commission' }
  }
}

/**
 * Get affiliate ID from referral code
 */
export async function getAffiliateIdByCode(referralCode: string): Promise<string | null> {
  try {
    const affiliate = await prisma!.affiliate.findUnique({
      where: { referralCode },
      select: { id: true, status: true },
    })

    if (!affiliate || affiliate.status !== 'active') {
      return null
    }

    return affiliate.id
  } catch (error) {
    console.error('Error getting affiliate ID:', error)
    return null
  }
}
