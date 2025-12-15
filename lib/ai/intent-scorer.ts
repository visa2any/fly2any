/**
 * Predictive Intent Scoring
 * ML-lite approach to score user booking intent in real-time
 * Level-6: Actionable scores for personalization
 */

interface UserSignals {
  // Session signals
  searchCount: number;
  resultsViewed: number;
  flightsClicked: number;
  timeOnSite: number; // seconds
  pagesViewed: number;

  // Behavior signals
  priceAlertsCreated: number;
  savedFlights: number;
  compareFlightsUsed: boolean;
  filterChanges: number;
  sortChanges: number;

  // Context signals
  daysUntilDeparture: number;
  isWeekend: boolean;
  isReturningUser: boolean;
  hasAccount: boolean;

  // Value signals
  highestPriceViewed: number;
  lowestPriceViewed: number;
  avgPriceViewed: number;
}

interface IntentScore {
  score: number; // 0-100
  level: 'cold' | 'warm' | 'hot' | 'ready';
  confidence: number;
  topFactors: string[];
  recommendedActions: string[];
}

// Signal weights (tuned for travel booking)
const WEIGHTS = {
  searchCount: 5,
  resultsViewed: 3,
  flightsClicked: 8,
  timeOnSite: 0.01, // per second
  pagesViewed: 2,
  priceAlertsCreated: 15,
  savedFlights: 12,
  compareFlightsUsed: 10,
  filterChanges: 2,
  sortChanges: 3,
  daysUntilDeparture: -0.5, // closer = higher intent
  isWeekend: 5,
  isReturningUser: 10,
  hasAccount: 8,
  priceRange: 5, // bonus for viewing consistent price range
};

/**
 * Calculate intent score from user signals
 */
export function calculateIntentScore(signals: Partial<UserSignals>): IntentScore {
  let rawScore = 0;
  const factors: string[] = [];

  // Session engagement
  if (signals.searchCount) {
    rawScore += Math.min(signals.searchCount * WEIGHTS.searchCount, 20);
    if (signals.searchCount >= 3) factors.push('Multiple searches');
  }

  if (signals.resultsViewed) {
    rawScore += Math.min(signals.resultsViewed * WEIGHTS.resultsViewed, 15);
  }

  if (signals.flightsClicked) {
    rawScore += Math.min(signals.flightsClicked * WEIGHTS.flightsClicked, 25);
    if (signals.flightsClicked >= 3) factors.push('High engagement with options');
  }

  if (signals.timeOnSite) {
    rawScore += Math.min(signals.timeOnSite * WEIGHTS.timeOnSite, 15);
    if (signals.timeOnSite > 300) factors.push('Extended session');
  }

  // High-intent behaviors
  if (signals.priceAlertsCreated) {
    rawScore += signals.priceAlertsCreated * WEIGHTS.priceAlertsCreated;
    factors.push('Price alert created');
  }

  if (signals.savedFlights) {
    rawScore += signals.savedFlights * WEIGHTS.savedFlights;
    factors.push('Saved flights');
  }

  if (signals.compareFlightsUsed) {
    rawScore += WEIGHTS.compareFlightsUsed;
    factors.push('Used comparison tool');
  }

  // Context bonuses
  if (signals.daysUntilDeparture !== undefined && signals.daysUntilDeparture < 14) {
    rawScore += (14 - signals.daysUntilDeparture) * 2;
    factors.push('Near-term travel');
  }

  if (signals.isReturningUser) {
    rawScore += WEIGHTS.isReturningUser;
    factors.push('Returning visitor');
  }

  if (signals.hasAccount) {
    rawScore += WEIGHTS.hasAccount;
  }

  // Normalize to 0-100
  const score = Math.min(100, Math.max(0, rawScore));

  // Determine level
  let level: IntentScore['level'];
  if (score >= 75) level = 'ready';
  else if (score >= 50) level = 'hot';
  else if (score >= 25) level = 'warm';
  else level = 'cold';

  // Generate recommendations
  const recommendations = getRecommendations(level, signals);

  return {
    score: Math.round(score),
    level,
    confidence: calculateConfidence(signals),
    topFactors: factors.slice(0, 3),
    recommendedActions: recommendations,
  };
}

/**
 * Calculate confidence based on data completeness
 */
function calculateConfidence(signals: Partial<UserSignals>): number {
  const requiredSignals = [
    'searchCount', 'flightsClicked', 'timeOnSite', 'isReturningUser'
  ];
  const presentSignals = requiredSignals.filter(
    s => signals[s as keyof UserSignals] !== undefined
  );
  return 0.5 + (presentSignals.length / requiredSignals.length) * 0.5;
}

/**
 * Get recommended actions based on intent level
 */
function getRecommendations(
  level: IntentScore['level'],
  signals: Partial<UserSignals>
): string[] {
  const actions: string[] = [];

  switch (level) {
    case 'ready':
      actions.push('Show urgency messaging');
      actions.push('Highlight booking benefits');
      if (!signals.hasAccount) actions.push('Offer account creation incentive');
      break;

    case 'hot':
      actions.push('Show price protection offer');
      actions.push('Display social proof');
      if (!signals.priceAlertsCreated) actions.push('Prompt price alert creation');
      break;

    case 'warm':
      actions.push('Show flexible dates');
      actions.push('Offer price comparison');
      if (!signals.savedFlights) actions.push('Encourage saving flights');
      break;

    case 'cold':
      actions.push('Show inspiration content');
      actions.push('Offer newsletter signup');
      actions.push('Display popular destinations');
      break;
  }

  return actions;
}

/**
 * Real-time intent tracker for client-side use
 */
export class IntentTracker {
  private signals: Partial<UserSignals> = {};
  private startTime: number = Date.now();

  constructor(isReturning: boolean = false, hasAccount: boolean = false) {
    this.signals.isReturningUser = isReturning;
    this.signals.hasAccount = hasAccount;
    this.signals.searchCount = 0;
    this.signals.flightsClicked = 0;
    this.signals.pagesViewed = 1;
  }

  trackSearch() {
    this.signals.searchCount = (this.signals.searchCount || 0) + 1;
  }

  trackFlightClick() {
    this.signals.flightsClicked = (this.signals.flightsClicked || 0) + 1;
  }

  trackPriceAlert() {
    this.signals.priceAlertsCreated = (this.signals.priceAlertsCreated || 0) + 1;
  }

  trackSave() {
    this.signals.savedFlights = (this.signals.savedFlights || 0) + 1;
  }

  trackCompare() {
    this.signals.compareFlightsUsed = true;
  }

  trackPageView() {
    this.signals.pagesViewed = (this.signals.pagesViewed || 0) + 1;
  }

  setDepartureDate(date: Date) {
    const now = new Date();
    this.signals.daysUntilDeparture = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  getScore(): IntentScore {
    this.signals.timeOnSite = (Date.now() - this.startTime) / 1000;
    this.signals.isWeekend = [0, 6].includes(new Date().getDay());
    return calculateIntentScore(this.signals);
  }

  getSignals(): Partial<UserSignals> {
    return { ...this.signals };
  }
}
