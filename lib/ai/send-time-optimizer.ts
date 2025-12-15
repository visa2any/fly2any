/**
 * AI Send-Time Optimization
 * Predicts optimal email send times based on user behavior
 * Level-6: ML-lite approach with historical patterns
 */

interface UserEngagementPattern {
  userId: string;
  timezone: string;
  bestHours: number[]; // 0-23
  bestDays: number[]; // 0-6 (Sun-Sat)
  avgOpenRate: number;
  lastEngagedAt: Date | null;
}

interface SendTimeRecommendation {
  optimalTime: Date;
  confidence: number;
  reason: string;
}

// Default optimal times based on travel industry benchmarks
const DEFAULT_OPTIMAL_HOURS = [9, 10, 14, 19, 20]; // 9am, 10am, 2pm, 7pm, 8pm
const DEFAULT_OPTIMAL_DAYS = [2, 3, 4]; // Tue, Wed, Thu

/**
 * Calculate optimal send time for a user
 */
export function getOptimalSendTime(
  pattern: UserEngagementPattern | null,
  emailType: 'transactional' | 'marketing' | 'alert'
): SendTimeRecommendation {
  const now = new Date();

  // Transactional emails: send immediately
  if (emailType === 'transactional') {
    return {
      optimalTime: now,
      confidence: 1.0,
      reason: 'Transactional emails sent immediately',
    };
  }

  // Price alerts: send within 15 minutes (urgency)
  if (emailType === 'alert') {
    const alertTime = new Date(now.getTime() + 15 * 60 * 1000);
    return {
      optimalTime: alertTime,
      confidence: 0.9,
      reason: 'Price alerts sent with 15-min delay for batching',
    };
  }

  // Marketing: optimize based on user pattern or defaults
  if (pattern && pattern.bestHours.length > 0) {
    return getPersonalizedSendTime(pattern, now);
  }

  return getDefaultOptimalTime(now);
}

/**
 * Get personalized send time based on user engagement history
 */
function getPersonalizedSendTime(
  pattern: UserEngagementPattern,
  now: Date
): SendTimeRecommendation {
  const userTz = pattern.timezone || 'America/New_York';

  // Find next optimal hour
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  // Find best hour today or tomorrow
  let bestHour = pattern.bestHours.find(h => h > currentHour);
  let daysToAdd = 0;

  if (!bestHour) {
    // No good hour today, find best day
    const nextBestDay = pattern.bestDays.find(d => d > currentDay);
    if (nextBestDay !== undefined) {
      daysToAdd = nextBestDay - currentDay;
    } else if (pattern.bestDays.length > 0) {
      daysToAdd = 7 - currentDay + pattern.bestDays[0];
    }
    bestHour = pattern.bestHours[0] || DEFAULT_OPTIMAL_HOURS[0];
  }

  const optimalTime = new Date(now);
  optimalTime.setDate(optimalTime.getDate() + daysToAdd);
  optimalTime.setHours(bestHour, 0, 0, 0);

  return {
    optimalTime,
    confidence: Math.min(0.95, 0.7 + pattern.avgOpenRate * 0.3),
    reason: `Personalized: User typically engages at ${bestHour}:00`,
  };
}

/**
 * Get default optimal time based on industry benchmarks
 */
function getDefaultOptimalTime(now: Date): SendTimeRecommendation {
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  // Find next optimal slot
  let bestHour = DEFAULT_OPTIMAL_HOURS.find(h => h > currentHour + 1);
  let daysToAdd = 0;

  if (!bestHour || !DEFAULT_OPTIMAL_DAYS.includes(currentDay)) {
    // Find next optimal day
    const nextBestDay = DEFAULT_OPTIMAL_DAYS.find(d => d > currentDay);
    if (nextBestDay !== undefined) {
      daysToAdd = nextBestDay - currentDay;
    } else {
      daysToAdd = 7 - currentDay + DEFAULT_OPTIMAL_DAYS[0];
    }
    bestHour = DEFAULT_OPTIMAL_HOURS[0];
  }

  const optimalTime = new Date(now);
  optimalTime.setDate(optimalTime.getDate() + daysToAdd);
  optimalTime.setHours(bestHour, 0, 0, 0);

  return {
    optimalTime,
    confidence: 0.65,
    reason: 'Default: Industry benchmark timing (Tue-Thu, 9am/2pm/7pm)',
  };
}

/**
 * Build user engagement pattern from historical data
 */
export function buildEngagementPattern(
  emailOpens: { openedAt: Date; emailType: string }[]
): Partial<UserEngagementPattern> {
  if (emailOpens.length < 3) {
    return { bestHours: [], bestDays: [], avgOpenRate: 0 };
  }

  // Count opens by hour and day
  const hourCounts: Record<number, number> = {};
  const dayCounts: Record<number, number> = {};

  emailOpens.forEach(open => {
    const hour = open.openedAt.getHours();
    const day = open.openedAt.getDay();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });

  // Get top 3 hours and days
  const sortedHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => parseInt(h));

  const sortedDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => parseInt(d));

  return {
    bestHours: sortedHours,
    bestDays: sortedDays,
    avgOpenRate: emailOpens.length / Math.max(emailOpens.length * 2, 10), // Simplified
    lastEngagedAt: emailOpens[emailOpens.length - 1]?.openedAt || null,
  };
}

/**
 * Schedule email for optimal delivery
 */
export async function scheduleOptimalEmail(
  userId: string,
  emailType: 'transactional' | 'marketing' | 'alert',
  emailData: any
): Promise<{ scheduledFor: Date; confidence: number }> {
  // In production, fetch user pattern from DB
  const pattern: UserEngagementPattern | null = null; // Placeholder

  const recommendation = getOptimalSendTime(pattern, emailType);

  // Store scheduled email (implement with your queue system)
  // await emailQueue.schedule(recommendation.optimalTime, emailData);

  return {
    scheduledFor: recommendation.optimalTime,
    confidence: recommendation.confidence,
  };
}
