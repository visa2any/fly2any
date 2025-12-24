/**
 * Traffic Origin Extraction (Analytics-Safe)
 *
 * NO PII - Only extracts traffic source category from allowed metadata.
 * Used for learning metrics, not business logic.
 */

// ============================================================================
// TYPES
// ============================================================================

export type TrafficOrigin = 'search' | 'direct' | 'campaign' | 'referral' | 'voice' | 'unknown';

export interface OriginMetadata {
  origin: TrafficOrigin;
  source: string | null;  // Sanitized source (e.g., 'google', 'facebook')
  medium: string | null;  // e.g., 'cpc', 'organic', 'social'
}

// ============================================================================
// PATTERNS (Tight - Avoid False Positives)
// ============================================================================

// Search engines - strict domain patterns
const SEARCH_ENGINES = /^(?:www\.)?(?:google|bing|yahoo|duckduckgo|baidu|yandex|ecosia)\.(?:com|co\.[a-z]{2}|[a-z]{2,3})$/i;

// Social platforms
const SOCIAL_PLATFORMS = /^(?:www\.|m\.|l\.)?(?:facebook|instagram|twitter|x|linkedin|pinterest|tiktok|reddit)\.(?:com|co\.[a-z]{2})$/i;

// Voice assistants (future-safe)
const VOICE_AGENTS = /^(?:assistant\.google|alexa|siri|cortana)/i;

// UTM campaign patterns
const UTM_CAMPAIGN = /[?&]utm_(?:campaign|source|medium)=/i;
const UTM_MEDIUM_CPC = /[?&]utm_medium=(?:cpc|ppc|paid|ads?)\b/i;
const UTM_MEDIUM_EMAIL = /[?&]utm_medium=email\b/i;
const UTM_MEDIUM_SOCIAL = /[?&]utm_medium=social\b/i;

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract hostname from referrer (sanitized, no paths/queries)
 */
function extractHostname(referrer: string | null | undefined): string | null {
  if (!referrer || typeof referrer !== 'string') return null;

  try {
    const url = new URL(referrer);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Sanitize source name (remove PII, normalize)
 */
function sanitizeSource(input: string): string {
  if (!input) return 'unknown';

  const parts = input.split('.');
  // Handle TLDs like .co.uk, .com.br by checking for 2-letter second-level
  let main = parts.length >= 2 ? parts[parts.length - 2] : input;
  if (main.length <= 2 && parts.length >= 3) {
    main = parts[parts.length - 3]; // e.g., google from google.co.uk
  }

  // Return only alphanumeric source name (max 20 chars)
  const sanitized = main.replace(/[^a-z0-9]/gi, '').slice(0, 20).toLowerCase();
  return sanitized || 'unknown';
}

/**
 * Extract traffic origin from request metadata
 *
 * ALLOWED INPUTS ONLY:
 * - referrer: HTTP Referer header
 * - url: Current page URL (for UTM parsing)
 * - userAgent: For voice detection (future)
 *
 * NO PII is extracted or stored.
 */
export function extractTrafficOrigin(params: {
  referrer?: string | null;
  url?: string | null;
  userAgent?: string | null;
}): OriginMetadata {
  const { referrer, url, userAgent } = params;

  // 1. Check for voice assistant (future-safe)
  if (userAgent && VOICE_AGENTS.test(userAgent)) {
    return { origin: 'voice', source: 'assistant', medium: 'voice' };
  }

  // 2. Check for UTM campaign parameters
  if (url && UTM_CAMPAIGN.test(url)) {
    let medium: string | null = 'campaign';

    if (UTM_MEDIUM_CPC.test(url)) medium = 'cpc';
    else if (UTM_MEDIUM_EMAIL.test(url)) medium = 'email';
    else if (UTM_MEDIUM_SOCIAL.test(url)) medium = 'social';

    // Extract utm_source if present (sanitized)
    const sourceMatch = url.match(/[?&]utm_source=([^&]+)/i);
    const source = sourceMatch ? sanitizeSource(sourceMatch[1]) : null;

    return { origin: 'campaign', source, medium };
  }

  // 3. Check referrer
  const hostname = extractHostname(referrer);

  if (!hostname) {
    return { origin: 'direct', source: null, medium: null };
  }

  // 3a. Search engine referral
  if (SEARCH_ENGINES.test(hostname)) {
    return { origin: 'search', source: sanitizeSource(hostname), medium: 'organic' };
  }

  // 3b. Social media referral
  if (SOCIAL_PLATFORMS.test(hostname)) {
    return { origin: 'referral', source: sanitizeSource(hostname), medium: 'social' };
  }

  // 3c. Other referral
  return { origin: 'referral', source: sanitizeSource(hostname), medium: 'referral' };
}

/**
 * Validate origin is one of allowed values (type guard)
 */
export function isValidOrigin(origin: string): origin is TrafficOrigin {
  return ['search', 'direct', 'campaign', 'referral', 'voice', 'unknown'].includes(origin);
}
