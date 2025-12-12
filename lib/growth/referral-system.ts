/**
 * Referral System - Viral Loop Engine
 *
 * Rewards structure:
 * - Referrer: $10 credit after referee's first booking
 * - Referee: $10 off first booking
 * - Max 50 referrals per user
 */

import { nanoid } from 'nanoid';

const REFERRER_REWARD = 10; // $10 credit
const REFEREE_DISCOUNT = 10; // $10 off
const MIN_BOOKING_AMOUNT = 100; // Minimum booking to qualify
const MAX_REFERRALS_PER_USER = 50;

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string | null;
  code: string;
  status: 'pending' | 'signed_up' | 'completed' | 'expired';
  referrerReward: number;
  refereeDiscount: number;
  createdAt: Date;
  completedAt: Date | null;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  referralCode: string;
  referralLink: string;
}

/**
 * Generate unique referral code for user
 */
export function generateReferralCode(userId: string): string {
  // Create memorable code: FLY-{random}-{userId suffix}
  const random = nanoid(4).toUpperCase();
  const userSuffix = userId.slice(-4).toUpperCase();
  return `FLY-${random}-${userSuffix}`;
}

/**
 * Generate shareable referral link
 */
export function generateReferralLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
  return `${baseUrl}/r/${code}`;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^FLY-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
}

/**
 * Calculate referral rewards
 */
export function calculateRewards(bookingAmount: number): {
  referrerReward: number;
  refereeDiscount: number;
  qualifies: boolean;
} {
  const qualifies = bookingAmount >= MIN_BOOKING_AMOUNT;
  return {
    referrerReward: qualifies ? REFERRER_REWARD : 0,
    refereeDiscount: qualifies ? REFEREE_DISCOUNT : 0,
    qualifies,
  };
}

/**
 * Get referral share messages for different platforms
 */
export function getReferralShareContent(code: string, userName?: string) {
  const link = generateReferralLink(code);
  const name = userName || 'a friend';

  return {
    twitter: `Get $${REFEREE_DISCOUNT} off your first flight booking on Fly2Any! Use my referral link: ${link} #TravelDeals #CheapFlights`,

    whatsapp: `Hey! I've been using Fly2Any to find cheap flights and thought you'd like it too. Use my link to get $${REFEREE_DISCOUNT} off your first booking: ${link}`,

    email: {
      subject: `${name} invited you to Fly2Any - Get $${REFEREE_DISCOUNT} off!`,
      body: `Hi!\n\nI've been using Fly2Any to find the best flight deals and wanted to share it with you.\n\nUse my referral link to get $${REFEREE_DISCOUNT} off your first booking:\n${link}\n\nHappy travels!`,
    },

    sms: `Get $${REFEREE_DISCOUNT} off flights on Fly2Any! ${link}`,

    facebook: `I just found an amazing way to save on flights! Fly2Any has great deals. Use my link for $${REFEREE_DISCOUNT} off: ${link}`,

    linkedin: `Looking for flight deals? I recommend Fly2Any - they've saved me money on multiple trips. Get $${REFEREE_DISCOUNT} off your first booking: ${link}`,
  };
}

/**
 * Referral program tier system
 */
export const REFERRAL_TIERS = [
  { name: 'Starter', minReferrals: 0, bonus: 0 },
  { name: 'Bronze', minReferrals: 5, bonus: 5 }, // Extra $5 per referral
  { name: 'Silver', minReferrals: 15, bonus: 10 }, // Extra $10 per referral
  { name: 'Gold', minReferrals: 30, bonus: 15 }, // Extra $15 per referral
  { name: 'Platinum', minReferrals: 50, bonus: 25 }, // Extra $25 per referral
];

export function getUserTier(completedReferrals: number) {
  return REFERRAL_TIERS.reduce((tier, current) => {
    if (completedReferrals >= current.minReferrals) return current;
    return tier;
  }, REFERRAL_TIERS[0]);
}

/**
 * Calculate total reward with tier bonus
 */
export function calculateTotalReward(completedReferrals: number): number {
  const tier = getUserTier(completedReferrals);
  return REFERRER_REWARD + tier.bonus;
}
