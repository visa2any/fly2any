/**
 * AI Personalization Engine — Fly2Any
 * True 1:1 personalized travel experiences.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type CabinPreference = 'economy' | 'premium_economy' | 'business' | 'first' | 'any';
export type BudgetSensitivity = 'price_sensitive' | 'value_seeker' | 'comfort_first' | 'premium_only';
export type LoyaltyTier = 'new' | 'returning' | 'frequent' | 'vip';

export interface UserProfile {
  user_id: string;
  loyalty_tier: LoyaltyTier;
  search_history: SearchHistoryItem[];
  booking_history: BookingHistoryItem[];
  preferences: UserPreferences;
  behavioral_signals: BehavioralSignals;
  last_updated: number;
}

export interface UserPreferences {
  cabin: CabinPreference;
  budget_sensitivity: BudgetSensitivity;
  preferred_airlines: string[];
  preferred_destinations: string[];
  time_flexibility: 'rigid' | 'flexible' | 'very_flexible';
  layover_tolerance: 'direct_only' | 'short' | 'any';
  notification_preference: 'all' | 'deals_only' | 'minimal';
}

export interface SearchHistoryItem {
  origin: string;
  destination: string;
  cabin: string;
  price_range: { min: number; max: number };
  timestamp: number;
}

export interface BookingHistoryItem {
  booking_id: string;
  route: string;
  cabin: string;
  total_paid: number;
  extras_purchased: string[];
  timestamp: number;
}

export interface BehavioralSignals {
  avg_session_duration_ms: number;
  searches_before_booking: number;
  abandonment_rate: number;
  price_comparison_frequency: number;
  device_preference: 'mobile' | 'desktop' | 'mixed';
  active_hours: number[]; // 0-23
  emotional_state?: string;
}

export interface PersonalizationDecision {
  decision_id: string;
  user_id: string;
  context: string;
  action: string;
  confidence: number;
  expected_uplift: { conversion: number; engagement: number };
  timestamp: number;
}

export interface PersonalizedContent {
  headline?: string;
  cta_text?: string;
  tone: 'warm' | 'professional' | 'urgent' | 'casual';
  highlight_features: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  profiles: new Map<string, UserProfile>(),
  decisions: [] as PersonalizationDecision[],
  quietHours: { start: 22, end: 7 }, // 10 PM - 7 AM
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export function getOrCreateProfile(userId: string): UserProfile {
  let profile = state.profiles.get(userId);
  if (!profile) {
    profile = {
      user_id: userId,
      loyalty_tier: 'new',
      search_history: [],
      booking_history: [],
      preferences: {
        cabin: 'any',
        budget_sensitivity: 'value_seeker',
        preferred_airlines: [],
        preferred_destinations: [],
        time_flexibility: 'flexible',
        layover_tolerance: 'short',
        notification_preference: 'deals_only',
      },
      behavioral_signals: {
        avg_session_duration_ms: 0,
        searches_before_booking: 0,
        abandonment_rate: 0,
        price_comparison_frequency: 0,
        device_preference: 'mixed',
        active_hours: [],
      },
      last_updated: Date.now(),
    };
    state.profiles.set(userId, profile);
  }
  return profile;
}

export function updateProfile(userId: string, updates: Partial<UserProfile>): void {
  const profile = getOrCreateProfile(userId);
  Object.assign(profile, updates, { last_updated: Date.now() });
}

export function recordSearch(userId: string, search: SearchHistoryItem): void {
  const profile = getOrCreateProfile(userId);
  profile.search_history.unshift(search);
  if (profile.search_history.length > 50) profile.search_history = profile.search_history.slice(0, 50);

  // Infer preferences
  inferPreferencesFromSearch(profile, search);
}

export function recordBooking(userId: string, booking: BookingHistoryItem): void {
  const profile = getOrCreateProfile(userId);
  profile.booking_history.unshift(booking);

  // Update loyalty tier
  const bookingCount = profile.booking_history.length;
  if (bookingCount >= 10) profile.loyalty_tier = 'vip';
  else if (bookingCount >= 5) profile.loyalty_tier = 'frequent';
  else if (bookingCount >= 1) profile.loyalty_tier = 'returning';

  // Learn from extras
  if (booking.extras_purchased.length > 0) {
    profile.preferences.budget_sensitivity =
      booking.extras_purchased.length > 2 ? 'comfort_first' : 'value_seeker';
  }
}

function inferPreferencesFromSearch(profile: UserProfile, search: SearchHistoryItem): void {
  // Cabin preference
  if (search.cabin && search.cabin !== 'any') {
    profile.preferences.cabin = search.cabin as CabinPreference;
  }

  // Budget sensitivity from price range
  if (search.price_range) {
    const avgPrice = (search.price_range.min + search.price_range.max) / 2;
    if (avgPrice < 300) profile.preferences.budget_sensitivity = 'price_sensitive';
    else if (avgPrice > 1500) profile.preferences.budget_sensitivity = 'premium_only';
  }

  // Track destinations
  if (search.destination && !profile.preferences.preferred_destinations.includes(search.destination)) {
    profile.preferences.preferred_destinations.unshift(search.destination);
    if (profile.preferences.preferred_destinations.length > 10) {
      profile.preferences.preferred_destinations = profile.preferences.preferred_destinations.slice(0, 10);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSONALIZATION DECISIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Personalize search results ordering
 */
export function personalizeSearchResults(
  userId: string,
  results: Array<{ id: string; price: number; airline: string; stops: number; cabin: string }>
): Array<{ id: string; score: number; reason: string }> {
  const profile = getOrCreateProfile(userId);
  const { preferences } = profile;

  return results.map(flight => {
    let score = 50; // Base score
    const reasons: string[] = [];

    // Preferred airline bonus
    if (preferences.preferred_airlines.includes(flight.airline)) {
      score += 20;
      reasons.push('preferred_airline');
    }

    // Cabin match
    if (preferences.cabin === flight.cabin || preferences.cabin === 'any') {
      score += 15;
      reasons.push('cabin_match');
    }

    // Price sensitivity
    if (preferences.budget_sensitivity === 'price_sensitive') {
      score += (1000 - flight.price) / 50; // Lower price = higher score
      reasons.push('price_optimized');
    } else if (preferences.budget_sensitivity === 'comfort_first') {
      score += flight.stops === 0 ? 25 : 0; // Direct flights preferred
      reasons.push('comfort_optimized');
    }

    // Layover preference
    if (preferences.layover_tolerance === 'direct_only' && flight.stops === 0) {
      score += 30;
      reasons.push('direct_preferred');
    }

    return { id: flight.id, score: Math.min(100, score), reason: reasons.join(', ') };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Personalize offers and deals
 */
export function personalizeOffers(userId: string): {
  deals: Array<{ type: string; destination: string; discount: string; relevance: number }>;
  decision: PersonalizationDecision;
} {
  const profile = getOrCreateProfile(userId);
  const { preferences, search_history, loyalty_tier } = profile;

  const deals: Array<{ type: string; destination: string; discount: string; relevance: number }> = [];

  // Destination-based deals
  preferences.preferred_destinations.slice(0, 3).forEach((dest, i) => {
    deals.push({
      type: 'destination',
      destination: dest,
      discount: loyalty_tier === 'vip' ? '15% off' : '10% off',
      relevance: 100 - i * 10,
    });
  });

  // Budget-aware deals
  if (preferences.budget_sensitivity === 'price_sensitive') {
    deals.push({
      type: 'flash_sale',
      destination: 'Various',
      discount: 'Up to 40% off',
      relevance: 95,
    });
  }

  // VIP exclusive
  if (loyalty_tier === 'vip') {
    deals.push({
      type: 'vip_exclusive',
      destination: 'Premium Routes',
      discount: 'Early access + 20% off',
      relevance: 100,
    });
  }

  const decision = logDecision(userId, 'offer_personalization', `Generated ${deals.length} personalized deals`, 0.85);

  return { deals: deals.sort((a, b) => b.relevance - a.relevance), decision };
}

/**
 * Personalize content and messaging
 */
export function personalizeContent(userId: string, context: 'search' | 'checkout' | 'confirmation' | 'email'): PersonalizedContent {
  const profile = getOrCreateProfile(userId);
  const { loyalty_tier, preferences, behavioral_signals } = profile;

  let tone: PersonalizedContent['tone'] = 'professional';
  const highlights: string[] = [];
  let headline: string | undefined;
  let cta: string | undefined;

  // Tone based on loyalty
  if (loyalty_tier === 'vip') {
    tone = 'warm';
    highlights.push('VIP Priority Support');
  } else if (loyalty_tier === 'new') {
    tone = 'casual';
    highlights.push('First-time booking bonus');
  }

  // Context-specific personalization
  switch (context) {
    case 'search':
      if (preferences.budget_sensitivity === 'price_sensitive') {
        headline = 'Best value flights for you';
        highlights.push('Price match guarantee');
      } else {
        headline = 'Premium flights tailored for you';
        highlights.push('Flexible rebooking');
      }
      cta = loyalty_tier === 'vip' ? 'View VIP Options' : 'Find Flights';
      break;

    case 'checkout':
      if (behavioral_signals.abandonment_rate > 0.3) {
        tone = 'urgent';
        headline = 'Complete your booking';
        cta = 'Secure This Price';
      } else {
        cta = 'Continue to Payment';
      }
      break;

    case 'confirmation':
      headline = loyalty_tier === 'vip' ? 'Thank you for flying with us again!' : 'Your trip is booked!';
      break;

    case 'email':
      if (isQuietHours()) {
        // Don't send during quiet hours
      }
      headline = `${loyalty_tier === 'vip' ? 'Exclusive: ' : ''}New deals for your favorite destinations`;
      break;
  }

  return { headline, cta_text: cta, tone, highlight_features: highlights };
}

/**
 * Get best notification time
 */
export function getBestNotificationTime(userId: string): { hour: number; confidence: number } {
  const profile = getOrCreateProfile(userId);
  const { behavioral_signals } = profile;

  if (behavioral_signals.active_hours.length > 0) {
    // Most frequent active hour
    const hourCounts = behavioral_signals.active_hours.reduce((acc, h) => {
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const bestHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return { hour: parseInt(bestHour[0]), confidence: 0.8 };
  }

  // Default to 10 AM
  return { hour: 10, confidence: 0.5 };
}

function isQuietHours(): boolean {
  const hour = new Date().getHours();
  return hour >= state.quietHours.start || hour < state.quietHours.end;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

function logDecision(userId: string, context: string, action: string, confidence: number): PersonalizationDecision {
  const decision: PersonalizationDecision = {
    decision_id: generateEventId(),
    user_id: userId,
    context,
    action,
    confidence,
    expected_uplift: { conversion: confidence * 0.15, engagement: confidence * 0.25 },
    timestamp: Date.now(),
  };

  state.decisions.unshift(decision);
  if (state.decisions.length > 500) state.decisions = state.decisions.slice(0, 500);

  return decision;
}

export function getPersonalizationStats(): {
  total_profiles: number;
  decisions_24h: number;
  avg_confidence: number;
  loyalty_distribution: Record<LoyaltyTier, number>;
} {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const recent = state.decisions.filter(d => now - d.timestamp < day);

  const loyaltyDist: Record<LoyaltyTier, number> = { new: 0, returning: 0, frequent: 0, vip: 0 };
  state.profiles.forEach(p => loyaltyDist[p.loyalty_tier]++);

  return {
    total_profiles: state.profiles.size,
    decisions_24h: recent.length,
    avg_confidence: recent.length > 0 ? recent.reduce((s, d) => s + d.confidence, 0) / recent.length : 0,
    loyalty_distribution: loyaltyDist,
  };
}

export function getRecentDecisions(limit = 20): PersonalizationDecision[] {
  return state.decisions.slice(0, limit);
}
