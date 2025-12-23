/**
 * Hreflang Generation System
 *
 * Ensures correct language/region targeting across international versions.
 * Preserves entity consistency and prevents duplicate content issues.
 *
 * @version 1.0.0
 * @created 2025-12-23
 */

// =============================================================================
// LOCALE CONFIGURATION
// =============================================================================

export const LOCALES = {
  'en-us': {
    lang: 'en',
    region: 'US',
    prefix: '',
    default: true,
    currency: 'USD',
    name: 'English (US)',
  },
  'pt-br': {
    lang: 'pt',
    region: 'BR',
    prefix: '/pt-br',
    default: false,
    currency: 'BRL',
    name: 'Português (Brasil)',
  },
  'es-mx': {
    lang: 'es',
    region: 'MX',
    prefix: '/es-mx',
    default: false,
    currency: 'MXN',
    name: 'Español (México)',
  },
} as const;

export type LocaleCode = keyof typeof LOCALES;
export type LocaleConfig = (typeof LOCALES)[LocaleCode];

export const SUPPORTED_LOCALES = Object.keys(LOCALES) as LocaleCode[];
export const DEFAULT_LOCALE: LocaleCode = 'en-us';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

// =============================================================================
// HREFLANG GENERATION
// =============================================================================

export interface HreflangTag {
  hreflang: string;
  href: string;
}

/**
 * Generate hreflang tags for a page
 * Includes self-reference and x-default
 */
export function generateHreflangTags(
  path: string,
  currentLocale: LocaleCode = DEFAULT_LOCALE,
  availableLocales: LocaleCode[] = SUPPORTED_LOCALES
): HreflangTag[] {
  const cleanPath = normalizePath(path);
  const tags: HreflangTag[] = [];

  // x-default always points to default locale (en-us)
  tags.push({
    hreflang: 'x-default',
    href: `${SITE_URL}${cleanPath}`,
  });

  // All available locales
  for (const locale of availableLocales) {
    const config = LOCALES[locale];
    tags.push({
      hreflang: locale,
      href: `${SITE_URL}${config.prefix}${cleanPath}`,
    });
  }

  return tags;
}

/**
 * Generate hreflang as object for Next.js metadata
 */
export function getHreflangAlternates(
  path: string,
  availableLocales: LocaleCode[] = SUPPORTED_LOCALES
): Record<string, string> {
  const cleanPath = normalizePath(path);
  const alternates: Record<string, string> = {};

  // x-default
  alternates['x-default'] = `${SITE_URL}${cleanPath}`;

  // All locales
  for (const locale of availableLocales) {
    const config = LOCALES[locale];
    alternates[locale] = `${SITE_URL}${config.prefix}${cleanPath}`;
  }

  return alternates;
}

// =============================================================================
// CANONICAL URL GENERATION
// =============================================================================

/**
 * Get canonical URL for a specific locale
 * Canonical is always locale-specific (not x-default)
 */
export function getCanonicalForLocale(
  path: string,
  locale: LocaleCode
): string {
  const config = LOCALES[locale];
  const cleanPath = normalizePath(path);
  return `${SITE_URL}${config.prefix}${cleanPath}`;
}

/**
 * Get entity @id (always canonical, locale-agnostic)
 * Used for schema.org consistency across locales
 */
export function getEntityId(path: string, fragment: string): string {
  const cleanPath = normalizePath(path);
  return `${SITE_URL}${cleanPath}#${fragment}`;
}

// =============================================================================
// PATH UTILITIES
// =============================================================================

/**
 * Remove locale prefix from path
 */
export function removeLocalePrefix(path: string): string {
  return path.replace(/^\/(en-us|pt-br|es-mx)/, '');
}

/**
 * Normalize path for hreflang generation
 */
function normalizePath(path: string): string {
  // Ensure leading slash
  let normalized = path.startsWith('/') ? path : `/${path}`;

  // Remove locale prefix
  normalized = removeLocalePrefix(normalized);

  // Remove trailing slash (except root)
  if (normalized !== '/') {
    normalized = normalized.replace(/\/$/, '');
  }

  // Remove query params
  normalized = normalized.split('?')[0];

  return normalized;
}

/**
 * Detect locale from URL path
 */
export function detectLocaleFromPath(path: string): LocaleCode {
  const match = path.match(/^\/(en-us|pt-br|es-mx)/);
  if (match && match[1] in LOCALES) {
    return match[1] as LocaleCode;
  }
  return DEFAULT_LOCALE;
}

/**
 * Add locale prefix to path
 */
export function addLocalePrefix(path: string, locale: LocaleCode): string {
  const config = LOCALES[locale];
  const cleanPath = removeLocalePrefix(path);

  // Default locale has no prefix
  if (config.default) {
    return cleanPath || '/';
  }

  return `${config.prefix}${cleanPath || ''}`;
}

// =============================================================================
// LOCALE HELPERS
// =============================================================================

/**
 * Get locale configuration
 */
export function getLocaleConfig(locale: LocaleCode): LocaleConfig {
  return LOCALES[locale];
}

/**
 * Check if locale is supported
 */
export function isValidLocale(locale: string): locale is LocaleCode {
  return locale in LOCALES;
}

/**
 * Get default currency for locale
 */
export function getDefaultCurrency(locale: LocaleCode): string {
  return LOCALES[locale].currency;
}

/**
 * Map language code to locale (for browser detection)
 */
export function mapLanguageToLocale(lang: string): LocaleCode {
  const langLower = lang.toLowerCase();

  // Exact match
  if (isValidLocale(langLower)) {
    return langLower;
  }

  // Language prefix match
  if (langLower.startsWith('pt')) return 'pt-br';
  if (langLower.startsWith('es')) return 'es-mx';
  if (langLower.startsWith('en')) return 'en-us';

  return DEFAULT_LOCALE;
}

// =============================================================================
// SITEMAP HREFLANG
// =============================================================================

/**
 * Generate sitemap entry with hreflang annotations
 */
export function generateSitemapEntry(
  path: string,
  lastmod?: string,
  availableLocales: LocaleCode[] = SUPPORTED_LOCALES
): string {
  const cleanPath = normalizePath(path);
  const hreflangTags = generateHreflangTags(cleanPath, DEFAULT_LOCALE, availableLocales);

  const xhtmlLinks = hreflangTags
    .map(
      (tag) =>
        `    <xhtml:link rel="alternate" hreflang="${tag.hreflang}" href="${tag.href}"/>`
    )
    .join('\n');

  return `  <url>
    <loc>${SITE_URL}${cleanPath}</loc>
${xhtmlLinks}
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

// =============================================================================
// METADATA INTEGRATION
// =============================================================================

/**
 * Generate localized alternates for Next.js Metadata
 */
export function getLocalizedAlternates(
  path: string,
  locale: LocaleCode
): {
  canonical: string;
  languages: Record<string, string>;
} {
  return {
    canonical: getCanonicalForLocale(path, locale),
    languages: getHreflangAlternates(path),
  };
}

/**
 * Get inLanguage value for schema.org
 */
export function getSchemaLanguage(locale: LocaleCode): string {
  const config = LOCALES[locale];
  return `${config.lang}-${config.region}`;
}
