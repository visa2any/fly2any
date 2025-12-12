/**
 * Growth OS - Main Export
 *
 * Unified growth engine for Fly2Any
 */

// Referral System
export {
  generateReferralCode,
  generateReferralLink,
  isValidReferralCode,
  calculateRewards,
  getReferralShareContent,
  getUserTier,
  calculateTotalReward,
  REFERRAL_TIERS,
} from './referral-system';
export type { Referral, ReferralStats } from './referral-system';

// Price Alerts
export {
  createAlertConfig,
  shouldTriggerAlert,
  calculateSavings,
  generateBookingUrl,
  formatAlertNotification,
  getSmartPriceSuggestions,
  getAlertShareContent,
  getCheckInterval,
  ALERT_CHECK_INTERVALS,
} from './price-alerts';
export type { PriceAlert, PriceHistory, AlertNotification } from './price-alerts';

// Content Factory
export {
  generateDealPost,
  generateDestinationGuide,
  generateSocialPosts,
  generateBlogOutline,
  getTodayContentPlan,
  CONTENT_SCHEDULE,
} from './content-factory';
export type { ContentPiece, DealData } from './content-factory';

// Distribution Engine
export {
  formatForPlatform,
  postToTwitter,
  postToTelegram,
  postToAll,
  createDealPost,
  getNextOptimalTime,
  OPTIMAL_POSTING_TIMES,
  REDDIT_TEMPLATES,
} from './distribution-engine';
export type { PostContent, PostResult, ScheduledPost } from './distribution-engine';
