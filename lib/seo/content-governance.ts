/**
 * CONTENT GOVERNANCE RULES
 *
 * Defines when to generate, display, or suppress content
 * to maintain quality and avoid thin/duplicate pages.
 *
 * Rules:
 * - When NOT to generate content
 * - When to de-index pages
 * - Seasonal content handling
 * - Inventory-aware logic
 *
 * @version 1.0.0 - Sprint 3
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ContentDecision {
  shouldRender: boolean;
  showPricing: boolean;
  showOfferSchema: boolean;
  showSearchWidget: boolean;
  component: 'FullContent' | 'NoInventory' | 'Seasonal' | 'NotFound';
  reason?: string;
  robotsDirective: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
}

export interface RouteInventory {
  hasInventory: boolean;
  lastUpdated: Date | null;
  priceData?: {
    minPrice: number;
    avgPrice: number;
    currency: string;
  };
}

export interface SeasonalConfig {
  start: string; // ISO date
  end: string;   // ISO date
  recurring: boolean;
  afterPeriod: 'archive' | 'redirect' | 'hide';
}

// ============================================================================
// ROUTE VALIDATION
// ============================================================================

const VALID_AIRPORT_CODES = new Set([
  // US Major Airports
  'JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'SEA', 'MIA', 'BOS',
  'LAS', 'MCO', 'PHX', 'IAH', 'EWR', 'MSP', 'DTW', 'PHL', 'LGA', 'CLT',
  'BWI', 'SLC', 'DCA', 'SAN', 'TPA', 'HNL', 'PDX', 'STL', 'BNA', 'OAK',
  'AUS', 'RDU', 'MCI', 'SMF', 'SJC', 'IND', 'CLE', 'SNA', 'CMH', 'PIT',
  'SAT', 'RSW', 'DAL', 'BUR', 'JAX', 'ONT', 'SDF', 'MSY', 'OGG', 'ABQ',
  'FLL', 'MDW', 'HOU', 'PBI', 'RNO', 'OKC', 'CVG', 'MKE', 'TUS', 'BDL',
  // International Hubs
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'ZRH', 'VIE',
  'NRT', 'HND', 'ICN', 'HKG', 'SIN', 'BKK', 'SYD', 'MEL', 'AKL', 'DXB',
  'DOH', 'IST', 'MEX', 'GRU', 'SCL', 'EZE', 'BOG', 'LIM', 'PTY', 'CUN',
  'YYZ', 'YVR', 'YUL', 'YYC', 'DUB', 'EDI', 'MAN', 'LGW', 'ORY', 'CPH',
]);

/**
 * Check if airport code is valid
 */
export function isValidAirport(code: string): boolean {
  return VALID_AIRPORT_CODES.has(code.toUpperCase());
}

/**
 * Check if route is valid (not same origin/destination)
 */
export function isValidRoute(origin: string, destination: string): boolean {
  if (origin.toUpperCase() === destination.toUpperCase()) {
    return false;
  }

  if (!isValidAirport(origin) || !isValidAirport(destination)) {
    return false;
  }

  return true;
}

// ============================================================================
// DEPRECATED/BLOCKED ROUTES
// ============================================================================

const DEPRECATED_ROUTES = new Set([
  // Example deprecated routes (no longer served)
  // 'ABC-XYZ',
]);

const BLOCKED_ROUTE_PATTERNS = [
  // Regex patterns for routes that should never be generated
  /^TEST-/i,
  /^XXX-/i,
];

/**
 * Check if route is deprecated or blocked
 */
export function isRouteBlocked(origin: string, destination: string): boolean {
  const routeKey = `${origin.toUpperCase()}-${destination.toUpperCase()}`;

  if (DEPRECATED_ROUTES.has(routeKey)) {
    return true;
  }

  for (const pattern of BLOCKED_ROUTE_PATTERNS) {
    if (pattern.test(routeKey)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// SEASONAL CONTENT RULES
// ============================================================================

const SEASONAL_CONTENT: Record<string, SeasonalConfig> = {
  // World Cup 2026 content
  'world-cup-2026': {
    start: '2025-06-01',
    end: '2026-08-31',
    recurring: false,
    afterPeriod: 'archive',
  },

  // Christmas travel (recurring annually)
  'christmas-travel': {
    start: '2025-10-01',
    end: '2026-01-15',
    recurring: true,
    afterPeriod: 'hide',
  },

  // Spring break (recurring annually)
  'spring-break': {
    start: '2026-02-01',
    end: '2026-04-15',
    recurring: true,
    afterPeriod: 'hide',
  },

  // Summer travel
  'summer-travel': {
    start: '2026-05-01',
    end: '2026-09-15',
    recurring: true,
    afterPeriod: 'hide',
  },
};

/**
 * Check if seasonal content should be active
 */
export function isSeasonalContentActive(contentKey: string): boolean {
  const config = SEASONAL_CONTENT[contentKey];
  if (!config) return true; // Non-seasonal content is always active

  const now = new Date();
  const start = new Date(config.start);
  const end = new Date(config.end);

  if (config.recurring) {
    // Adjust year for recurring events
    const currentYear = now.getFullYear();
    start.setFullYear(currentYear);
    end.setFullYear(currentYear);

    // Handle year wraparound (e.g., Oct-Jan for Christmas)
    if (end < start) {
      end.setFullYear(currentYear + 1);
    }
  }

  return now >= start && now <= end;
}

/**
 * Get seasonal content status
 */
export function getSeasonalContentStatus(contentKey: string): {
  isActive: boolean;
  config: SeasonalConfig | null;
  nextActiveDate: Date | null;
} {
  const config = SEASONAL_CONTENT[contentKey];
  if (!config) {
    return { isActive: true, config: null, nextActiveDate: null };
  }

  const isActive = isSeasonalContentActive(contentKey);

  // Calculate next active date if not active
  let nextActiveDate: Date | null = null;
  if (!isActive) {
    const start = new Date(config.start);
    const now = new Date();

    if (config.recurring) {
      start.setFullYear(now.getFullYear());
      if (start < now) {
        start.setFullYear(now.getFullYear() + 1);
      }
    }

    if (start > now) {
      nextActiveDate = start;
    }
  }

  return { isActive, config, nextActiveDate };
}

// ============================================================================
// INVENTORY-AWARE CONTENT LOGIC
// ============================================================================

const PRICE_STALE_THRESHOLD_DAYS = 90;

/**
 * Determine content strategy based on inventory
 */
export function getContentStrategy(inventory: RouteInventory): ContentDecision {
  // No inventory - show alternative content
  if (!inventory.hasInventory) {
    return {
      shouldRender: true,
      showPricing: false,
      showOfferSchema: false,
      showSearchWidget: true,
      component: 'NoInventory',
      reason: 'No current flight inventory',
      robotsDirective: 'index,follow', // Still index for SEO value
    };
  }

  // Check if pricing data is stale
  if (inventory.lastUpdated) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - inventory.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate > PRICE_STALE_THRESHOLD_DAYS) {
      return {
        shouldRender: true,
        showPricing: false, // Don't show stale prices
        showOfferSchema: false,
        showSearchWidget: true,
        component: 'FullContent',
        reason: `Price data stale (${daysSinceUpdate} days old)`,
        robotsDirective: 'index,follow',
      };
    }
  }

  // Valid inventory with fresh pricing
  return {
    shouldRender: true,
    showPricing: true,
    showOfferSchema: true,
    showSearchWidget: true,
    component: 'FullContent',
    robotsDirective: 'index,follow',
  };
}

// ============================================================================
// DE-INDEX RULES
// ============================================================================

interface DeindexCheck {
  shouldDeindex: boolean;
  reason?: string;
}

/**
 * Check if page should be de-indexed
 */
export function shouldDeindexPage(
  route: { origin: string; destination: string },
  inventory: RouteInventory,
  pageMetrics?: { views: number; bounceRate: number }
): DeindexCheck {
  // Invalid route
  if (!isValidRoute(route.origin, route.destination)) {
    return { shouldDeindex: true, reason: 'Invalid route' };
  }

  // Blocked route
  if (isRouteBlocked(route.origin, route.destination)) {
    return { shouldDeindex: true, reason: 'Deprecated or blocked route' };
  }

  // Extremely stale data (> 180 days without inventory)
  if (!inventory.hasInventory && inventory.lastUpdated) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - inventory.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate > 180) {
      return {
        shouldDeindex: true,
        reason: `No inventory for ${daysSinceUpdate} days`,
      };
    }
  }

  // Poor page performance (optional)
  if (pageMetrics) {
    if (pageMetrics.views < 10 && pageMetrics.bounceRate > 0.95) {
      return {
        shouldDeindex: true,
        reason: 'Poor user engagement metrics',
      };
    }
  }

  return { shouldDeindex: false };
}

// ============================================================================
// CONTENT QUALITY RULES
// ============================================================================

interface ContentQualityCheck {
  passes: boolean;
  issues: string[];
}

/**
 * Validate content meets quality standards
 */
export function validateContentQuality(content: {
  title?: string;
  description?: string;
  bodyLength?: number;
  hasSchema?: boolean;
  hasCanonical?: boolean;
}): ContentQualityCheck {
  const issues: string[] = [];

  // Title check
  if (!content.title || content.title.length < 30) {
    issues.push('Title too short (min 30 chars)');
  }
  if (content.title && content.title.length > 70) {
    issues.push('Title too long (max 70 chars)');
  }

  // Description check
  if (!content.description || content.description.length < 100) {
    issues.push('Description too short (min 100 chars)');
  }
  if (content.description && content.description.length > 160) {
    issues.push('Description too long (max 160 chars)');
  }

  // Body length (for thin content prevention)
  if (content.bodyLength && content.bodyLength < 300) {
    issues.push('Body content too thin (min 300 chars)');
  }

  // Required elements
  if (!content.hasSchema) {
    issues.push('Missing structured data (schema.org)');
  }
  if (!content.hasCanonical) {
    issues.push('Missing canonical tag');
  }

  return {
    passes: issues.length === 0,
    issues,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ContentGovernance = {
  // Validation
  isValidAirport,
  isValidRoute,
  isRouteBlocked,

  // Seasonal
  isSeasonalContentActive,
  getSeasonalContentStatus,
  seasonalContent: SEASONAL_CONTENT,

  // Inventory
  getContentStrategy,

  // De-indexing
  shouldDeindexPage,

  // Quality
  validateContentQuality,
};

export default ContentGovernance;
