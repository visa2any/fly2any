/**
 * SEARCH INTENT SEGMENTATION SYSTEM
 * Sprint 4 - AI Citation & Conversion Architecture
 *
 * Classifies pages by user intent and defines UX/CTA/Schema rules.
 */

// ============================================================================
// INTENT TYPES
// ============================================================================

export type UserIntent = 'research' | 'compare' | 'ready-to-book';

export interface IntentConfig {
  intent: UserIntent;
  uxPriority: string[];
  ctaType: 'soft' | 'medium' | 'strong';
  ctaPlacement: 'below-fold' | 'mid-page' | 'above-fold';
  showOfferSchema: boolean;
  showFAQSchema: boolean;
  showDirectAnswer: boolean;
  directAnswerPosition: 'hero' | 'after-hero' | 'none';
}

// ============================================================================
// INTENT → UX → CTA MATRIX
// ============================================================================

export const INTENT_CONFIG: Record<UserIntent, IntentConfig> = {
  research: {
    intent: 'research',
    uxPriority: ['information', 'education', 'trust-building'],
    ctaType: 'soft',
    ctaPlacement: 'below-fold',
    showOfferSchema: false,
    showFAQSchema: true,
    showDirectAnswer: true,
    directAnswerPosition: 'hero',
  },
  compare: {
    intent: 'compare',
    uxPriority: ['comparison-tools', 'price-display', 'alternatives'],
    ctaType: 'medium',
    ctaPlacement: 'mid-page',
    showOfferSchema: true,
    showFAQSchema: true,
    showDirectAnswer: true,
    directAnswerPosition: 'after-hero',
  },
  'ready-to-book': {
    intent: 'ready-to-book',
    uxPriority: ['search-widget', 'pricing', 'booking-flow'],
    ctaType: 'strong',
    ctaPlacement: 'above-fold',
    showOfferSchema: true,
    showFAQSchema: false,
    showDirectAnswer: false,
    directAnswerPosition: 'none',
  },
};

// ============================================================================
// PAGE TYPE → INTENT MAPPING
// ============================================================================

export type PageType =
  | 'route'
  | 'destination'
  | 'airline'
  | 'blog'
  | 'guide'
  | 'results'
  | 'booking'
  | 'home';

export const PAGE_INTENT_MAP: Record<PageType, UserIntent> = {
  route: 'compare',
  destination: 'research',
  airline: 'research',
  blog: 'research',
  guide: 'research',
  results: 'ready-to-book',
  booking: 'ready-to-book',
  home: 'compare',
};

// ============================================================================
// INTENT DETECTION
// ============================================================================

interface IntentSignals {
  hasDateParams: boolean;
  hasPassengerCount: boolean;
  referrer: string | null;
  visitCount: number;
  timeOnSite: number;
  pagesViewed: string[];
}

/**
 * Detect user intent from behavioral signals
 */
export function detectUserIntent(
  pageType: PageType,
  signals: Partial<IntentSignals>
): UserIntent {
  // Strong booking signals override page default
  if (signals.hasDateParams && signals.hasPassengerCount) {
    return 'ready-to-book';
  }

  // Returning users with multiple page views → compare
  if ((signals.visitCount || 0) > 1 && (signals.pagesViewed?.length || 0) > 2) {
    return 'compare';
  }

  // Search engine referrer with informational query → research
  if (signals.referrer?.includes('google') || signals.referrer?.includes('bing')) {
    const infoPages: PageType[] = ['blog', 'guide', 'airline', 'destination'];
    if (infoPages.includes(pageType)) {
      return 'research';
    }
  }

  // Default to page type mapping
  return PAGE_INTENT_MAP[pageType];
}

/**
 * Get intent configuration for a page
 */
export function getIntentConfig(pageType: PageType, signals?: Partial<IntentSignals>): IntentConfig {
  const intent = signals ? detectUserIntent(pageType, signals) : PAGE_INTENT_MAP[pageType];
  return INTENT_CONFIG[intent];
}

// ============================================================================
// CTA CONFIGURATION
// ============================================================================

export interface CTAConfig {
  text: string;
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  showPrice: boolean;
}

export function getCTAConfig(intent: UserIntent, context?: { price?: number }): CTAConfig {
  switch (intent) {
    case 'research':
      return {
        text: 'Compare Prices',
        variant: 'secondary',
        size: 'md',
        showPrice: false,
      };
    case 'compare':
      return {
        text: context?.price ? `Search from $${context.price}` : 'Search Flights',
        variant: 'primary',
        size: 'lg',
        showPrice: !!context?.price,
      };
    case 'ready-to-book':
      return {
        text: 'Book Now',
        variant: 'primary',
        size: 'lg',
        showPrice: true,
      };
  }
}

export default { INTENT_CONFIG, PAGE_INTENT_MAP, detectUserIntent, getIntentConfig, getCTAConfig };
