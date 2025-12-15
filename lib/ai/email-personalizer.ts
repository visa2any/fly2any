/**
 * Dynamic Email Personalization
 * AI-driven content selection for emails
 * Level-6: Contextual, behavior-based personalization
 */

import { calculateLeadScore, type LeadScore } from './lead-scorer';
import { calculateIntentScore, type IntentScore } from './intent-scorer';

interface UserContext {
  userId?: string;
  email: string;
  name?: string;

  // Location
  timezone?: string;
  country?: string;
  city?: string;

  // Preferences
  preferredDestinations?: string[];
  preferredAirlines?: string[];
  cabinPreference?: 'economy' | 'premium' | 'business' | 'first';

  // Recent activity
  lastSearch?: {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
  };
  recentlyViewed?: Array<{
    destination: string;
    price: number;
    airline: string;
  }>;

  // Scores
  leadScore?: Partial<LeadScore>;
  intentScore?: Partial<IntentScore>;
}

interface PersonalizedContent {
  subject: string;
  preheader: string;
  headline: string;
  heroImage?: string;
  deals: Array<{
    destination: string;
    price: number;
    savings?: string;
    urgency?: string;
  }>;
  cta: {
    text: string;
    url: string;
  };
  footerMessage: string;
}

// Content templates by segment
const SUBJECT_TEMPLATES = {
  platinum: [
    '{{name}}, exclusive VIP deals just for you ✨',
    'Your personalized travel picks are ready',
    '{{name}}, priority access to flash deals',
  ],
  gold: [
    '{{destination}} calling – prices dropped!',
    '{{name}}, your saved routes have new deals',
    'Hot deals to {{destination}} – book now',
  ],
  silver: [
    'Discover {{destination}} from ${{price}}',
    '{{name}}, trending destinations this week',
    'New deals to your favorite places',
  ],
  bronze: [
    'Explore {{destination}} – flights from ${{price}}',
    'Your weekly travel inspiration',
    'Deals you might love this week',
  ],
  nurture: [
    'Miss us? Here\'s $10 off your next flight',
    'Come back to great travel deals',
    'We\'ve found some trips you might like',
  ],
};

const CTA_TEMPLATES = {
  high_intent: { text: 'Book Now & Save', urgency: true },
  medium_intent: { text: 'View Deals', urgency: false },
  low_intent: { text: 'Explore Destinations', urgency: false },
  dormant: { text: 'Start Planning', urgency: false },
};

/**
 * Generate personalized email content
 */
export function personalizeEmail(
  context: UserContext,
  emailType: 'weekly_deals' | 'price_alert' | 'abandoned' | 'welcome' | 'reactivation'
): PersonalizedContent {
  const tier = context.leadScore?.tier || 'bronze';
  const intent = context.intentScore?.level || 'cold';

  // Select subject
  const subjects = SUBJECT_TEMPLATES[tier];
  const subject = interpolate(
    subjects[Math.floor(Math.random() * subjects.length)],
    context
  );

  // Generate content based on type
  switch (emailType) {
    case 'price_alert':
      return generatePriceAlertContent(context);
    case 'abandoned':
      return generateAbandonedContent(context);
    case 'welcome':
      return generateWelcomeContent(context);
    case 'reactivation':
      return generateReactivationContent(context);
    default:
      return generateWeeklyDealsContent(context, tier, intent);
  }
}

function generateWeeklyDealsContent(
  context: UserContext,
  tier: string,
  intent: string
): PersonalizedContent {
  const name = context.name?.split(' ')[0] || 'Traveler';
  const destination = context.preferredDestinations?.[0] ||
    context.lastSearch?.destination || 'Paris';

  const deals = generateDeals(context, 3);
  const cta = getCTA(intent);

  return {
    subject: interpolate(SUBJECT_TEMPLATES[tier as keyof typeof SUBJECT_TEMPLATES][0], {
      ...context,
      destination,
      price: deals[0]?.price || 299,
    }),
    preheader: `${name}, we found ${deals.length} deals matching your preferences`,
    headline: tier === 'platinum'
      ? `${name}, Your VIP Deals Are Ready`
      : `${name}, Check Out These Deals`,
    deals,
    cta: {
      text: cta.text,
      url: `/deals?utm_source=email&utm_campaign=weekly_${tier}`,
    },
    footerMessage: getFooterMessage(tier),
  };
}

function generatePriceAlertContent(context: UserContext): PersonalizedContent {
  const search = context.lastSearch;

  return {
    subject: `Price drop: ${search?.origin} → ${search?.destination} 📉`,
    preheader: 'The route you\'re tracking just got cheaper!',
    headline: 'Price Alert Triggered!',
    deals: [{
      destination: search?.destination || 'Your Route',
      price: 299,
      savings: 'Save $50',
      urgency: 'Limited availability',
    }],
    cta: {
      text: 'Book Now',
      url: `/flights?origin=${search?.origin}&destination=${search?.destination}`,
    },
    footerMessage: 'You\'re receiving this because you created a price alert.',
  };
}

function generateAbandonedContent(context: UserContext): PersonalizedContent {
  const search = context.lastSearch;
  const name = context.name?.split(' ')[0] || 'there';

  return {
    subject: `${name}, your trip to ${search?.destination} is waiting`,
    preheader: 'Complete your booking before prices change',
    headline: `Still Thinking About ${search?.destination}?`,
    deals: context.recentlyViewed?.slice(0, 2).map(v => ({
      destination: v.destination,
      price: v.price,
      urgency: 'Prices may change',
    })) || [],
    cta: {
      text: 'Continue Booking',
      url: '/checkout/resume',
    },
    footerMessage: 'Need help? Our team is here 24/7.',
  };
}

function generateWelcomeContent(context: UserContext): PersonalizedContent {
  const name = context.name?.split(' ')[0] || 'there';

  return {
    subject: `Welcome to Fly2Any, ${name}! 🎉`,
    preheader: 'Your $10 welcome credit is waiting',
    headline: `Hey ${name}, Welcome Aboard!`,
    deals: [
      { destination: 'Popular: Miami', price: 99, savings: 'From' },
      { destination: 'Trending: Cancun', price: 149, savings: 'From' },
    ],
    cta: {
      text: 'Start Exploring',
      url: '/?new_user=true',
    },
    footerMessage: 'Thanks for joining! Use code WELCOME10 for $10 off.',
  };
}

function generateReactivationContent(context: UserContext): PersonalizedContent {
  const name = context.name?.split(' ')[0] || 'there';

  return {
    subject: `We miss you, ${name}! Here's $20 off`,
    preheader: 'Come back to exclusive travel deals',
    headline: 'It\'s Been a While...',
    deals: [
      { destination: 'Flash: NYC', price: 79, savings: '$20 off', urgency: '48hrs only' },
    ],
    cta: {
      text: 'Claim $20 Credit',
      url: '/account?promo=COMEBACK20',
    },
    footerMessage: 'This offer expires in 48 hours.',
  };
}

function generateDeals(
  context: UserContext,
  count: number
): PersonalizedContent['deals'] {
  const destinations = context.preferredDestinations || ['Miami', 'LA', 'NYC'];
  return destinations.slice(0, count).map((dest, i) => ({
    destination: dest,
    price: 199 + i * 50,
    savings: i === 0 ? 'Best Deal' : undefined,
  }));
}

function getCTA(intent: string): { text: string; urgency: boolean } {
  if (intent === 'ready' || intent === 'hot') return CTA_TEMPLATES.high_intent;
  if (intent === 'warm') return CTA_TEMPLATES.medium_intent;
  if (intent === 'cold') return CTA_TEMPLATES.low_intent;
  return CTA_TEMPLATES.dormant;
}

function getFooterMessage(tier: string): string {
  if (tier === 'platinum') return 'As a VIP member, you get early access to all deals.';
  if (tier === 'gold') return 'You\'re close to VIP status! Book 1 more trip to unlock.';
  return 'Create price alerts to never miss a deal.';
}

function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key]?.toString() || key;
  });
}

/**
 * Get A/B test variant for email
 */
export function getEmailVariant(
  userId: string,
  testName: string
): 'A' | 'B' {
  // Simple hash-based assignment
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'A' : 'B';
}
