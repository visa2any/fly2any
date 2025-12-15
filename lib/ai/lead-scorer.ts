/**
 * Lead Quality Scoring
 * Prioritize leads for marketing and sales based on conversion likelihood
 * Level-6: Data-driven scoring with actionable tiers
 */

interface LeadProfile {
  // Demographics
  email: string;
  hasAccount: boolean;
  accountAge?: number; // days

  // Engagement history
  emailsReceived: number;
  emailsOpened: number;
  emailsClicked: number;
  websiteVisits: number;
  lastVisit?: Date;

  // Booking history
  totalBookings: number;
  totalSpent: number;
  avgBookingValue: number;
  lastBooking?: Date;

  // Behavior signals
  priceAlertsActive: number;
  savedSearches: number;
  wishlistItems: number;

  // Source quality
  source: 'organic' | 'paid' | 'referral' | 'social' | 'email' | 'unknown';
  referralCode?: string;
}

interface LeadScore {
  score: number; // 0-100
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'nurture';
  ltv: number; // Predicted lifetime value
  conversionProbability: number;
  engagementLevel: 'high' | 'medium' | 'low' | 'dormant';
  recommendedCadence: 'immediate' | 'daily' | 'weekly' | 'monthly';
  nextBestAction: string;
}

// Scoring weights
const WEIGHTS = {
  // Engagement (max 30 points)
  emailOpenRate: 15,
  emailClickRate: 10,
  recentVisit: 5,

  // Value (max 35 points)
  hasBooked: 15,
  bookingValue: 10,
  repeatCustomer: 10,

  // Intent (max 25 points)
  priceAlerts: 10,
  savedSearches: 8,
  wishlist: 7,

  // Quality (max 10 points)
  sourceQuality: 5,
  hasAccount: 5,
};

const SOURCE_QUALITY: Record<LeadProfile['source'], number> = {
  referral: 5,
  organic: 4,
  email: 3,
  social: 2,
  paid: 2,
  unknown: 1,
};

/**
 * Calculate lead quality score
 */
export function calculateLeadScore(lead: Partial<LeadProfile>): LeadScore {
  let score = 0;

  // Engagement scoring
  const openRate = lead.emailsReceived
    ? (lead.emailsOpened || 0) / lead.emailsReceived
    : 0;
  const clickRate = lead.emailsOpened
    ? (lead.emailsClicked || 0) / lead.emailsOpened
    : 0;

  score += openRate * WEIGHTS.emailOpenRate;
  score += clickRate * WEIGHTS.emailClickRate;

  // Recent visit bonus
  if (lead.lastVisit) {
    const daysSinceVisit = (Date.now() - lead.lastVisit.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceVisit < 7) score += WEIGHTS.recentVisit;
    else if (daysSinceVisit < 30) score += WEIGHTS.recentVisit * 0.5;
  }

  // Value scoring
  if (lead.totalBookings && lead.totalBookings > 0) {
    score += WEIGHTS.hasBooked;

    // Booking value tier
    const avgValue = lead.avgBookingValue || 0;
    if (avgValue > 1000) score += WEIGHTS.bookingValue;
    else if (avgValue > 500) score += WEIGHTS.bookingValue * 0.7;
    else if (avgValue > 200) score += WEIGHTS.bookingValue * 0.4;

    // Repeat customer bonus
    if (lead.totalBookings >= 3) score += WEIGHTS.repeatCustomer;
    else if (lead.totalBookings >= 2) score += WEIGHTS.repeatCustomer * 0.5;
  }

  // Intent scoring
  if (lead.priceAlertsActive) {
    score += Math.min(lead.priceAlertsActive * 3, WEIGHTS.priceAlerts);
  }
  if (lead.savedSearches) {
    score += Math.min(lead.savedSearches * 2, WEIGHTS.savedSearches);
  }
  if (lead.wishlistItems) {
    score += Math.min(lead.wishlistItems * 2, WEIGHTS.wishlist);
  }

  // Quality scoring
  score += SOURCE_QUALITY[lead.source || 'unknown'];
  if (lead.hasAccount) score += WEIGHTS.hasAccount;

  // Normalize
  score = Math.min(100, Math.max(0, score));

  // Determine tier
  const tier = getTier(score);

  // Calculate LTV
  const ltv = calculateLTV(lead);

  // Engagement level
  const engagement = getEngagementLevel(lead);

  // Recommended cadence
  const cadence = getCadence(tier, engagement);

  // Next best action
  const nextAction = getNextBestAction(lead, tier);

  return {
    score: Math.round(score),
    tier,
    ltv,
    conversionProbability: score / 100 * 0.3, // Max 30% for cold leads
    engagementLevel: engagement,
    recommendedCadence: cadence,
    nextBestAction: nextAction,
  };
}

function getTier(score: number): LeadScore['tier'] {
  if (score >= 80) return 'platinum';
  if (score >= 60) return 'gold';
  if (score >= 40) return 'silver';
  if (score >= 20) return 'bronze';
  return 'nurture';
}

function calculateLTV(lead: Partial<LeadProfile>): number {
  const baseValue = lead.avgBookingValue || 300;
  const frequency = lead.totalBookings || 0;
  const retention = frequency > 0 ? Math.min(frequency / 3, 1) : 0.3;

  // Simple LTV: avg value * expected bookings per year * years
  return Math.round(baseValue * (1 + retention) * 2);
}

function getEngagementLevel(lead: Partial<LeadProfile>): LeadScore['engagementLevel'] {
  if (!lead.lastVisit) return 'dormant';

  const daysSince = (Date.now() - lead.lastVisit.getTime()) / (1000 * 60 * 60 * 24);
  const openRate = lead.emailsReceived
    ? (lead.emailsOpened || 0) / lead.emailsReceived
    : 0;

  if (daysSince < 7 && openRate > 0.3) return 'high';
  if (daysSince < 30 && openRate > 0.15) return 'medium';
  if (daysSince < 90) return 'low';
  return 'dormant';
}

function getCadence(
  tier: LeadScore['tier'],
  engagement: LeadScore['engagementLevel']
): LeadScore['recommendedCadence'] {
  if (tier === 'platinum' || engagement === 'high') return 'immediate';
  if (tier === 'gold' || engagement === 'medium') return 'daily';
  if (tier === 'silver') return 'weekly';
  return 'monthly';
}

function getNextBestAction(
  lead: Partial<LeadProfile>,
  tier: LeadScore['tier']
): string {
  if (!lead.hasAccount) return 'Account creation campaign';
  if (tier === 'nurture') return 'Re-engagement campaign';
  if (!lead.priceAlertsActive) return 'Price alert promotion';
  if (tier === 'platinum') return 'VIP offer / Personal outreach';
  if (tier === 'gold') return 'Exclusive deal email';
  return 'Weekly deals newsletter';
}

/**
 * Batch score multiple leads
 */
export function batchScoreLeads(
  leads: Partial<LeadProfile>[]
): Map<string, LeadScore> {
  const scores = new Map<string, LeadScore>();

  leads.forEach(lead => {
    if (lead.email) {
      scores.set(lead.email, calculateLeadScore(lead));
    }
  });

  return scores;
}

/**
 * Get leads by tier for campaign targeting
 */
export function segmentLeadsByTier(
  leads: Partial<LeadProfile>[]
): Record<LeadScore['tier'], Partial<LeadProfile>[]> {
  const segments: Record<LeadScore['tier'], Partial<LeadProfile>[]> = {
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
    nurture: [],
  };

  leads.forEach(lead => {
    const score = calculateLeadScore(lead);
    segments[score.tier].push(lead);
  });

  return segments;
}
