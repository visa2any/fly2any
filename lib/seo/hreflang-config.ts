import React from 'react';

/**
 * HREFLANG CONFIGURATION
 * 
 * Comprehensive international SEO configuration for Fly2Any
 * Supports 3 languages (English, Spanish, Portuguese) across multiple regions
 * 
 * @version 2.0.0
 */

export interface HreflangLocale {
  /** ISO 639-1 language code (e.g., 'en', 'es', 'pt') */
  language: string;
  /** ISO 3166-1 country code (e.g., 'US', 'MX', 'BR') */
  country?: string;
  /** Full locale code (e.g., 'en-US', 'es-MX', 'pt-BR') */
  locale: string;
  /** Display name for language/country */
  name: string;
  /** URL path prefix (e.g., '/en', '/es', '/pt') */
  pathPrefix: string;
  /** Canonical domain for this locale */
  canonicalDomain: string;
  /** Default currency for this locale */
  defaultCurrency: string;
  /** Is this the default/fallback locale? */
  isDefault: boolean;
}

export interface HreflangPage {
  /** Page path without locale prefix (e.g., '/flights/results') */
  path: string;
  /** Alternate URLs for this page in other languages */
  alternates: Record<string, string>;
  /** Last modified date for this page (for sitemap) */
  lastModified?: Date;
  /** Change frequency for sitemap */
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** Priority for sitemap (0.0 to 1.0) */
  priority?: number;
}

// ===========================
// SUPPORTED LOCALES
// ===========================

export const SUPPORTED_LOCALES: HreflangLocale[] = [
  {
    language: 'en',
    country: 'US',
    locale: 'en-US',
    name: 'English (United States)',
    pathPrefix: '/en',
    canonicalDomain: 'https://www.fly2any.com',
    defaultCurrency: 'USD',
    isDefault: true,
  },
  {
    language: 'en',
    country: 'GB',
    locale: 'en-GB',
    name: 'English (United Kingdom)',
    pathPrefix: '/en-gb',
    canonicalDomain: 'https://www.fly2any.com',
    defaultCurrency: 'GBP',
    isDefault: false,
  },
  {
    language: 'es',
    country: 'ES',
    locale: 'es-ES',
    name: 'Español (España)',
    pathPrefix: '/es',
    canonicalDomain: 'https://www.fly2any.com',
    defaultCurrency: 'EUR',
    isDefault: false,
  },
  {
    language: 'es',
    country: 'MX',
    locale: 'es-MX',
    name: 'Español (México)',
    pathPrefix: '/es-mx',
    canonicalDomain: 'https://www.fly2any.com',
    defaultCurrency: 'MXN',
    isDefault: false,
  },
  {
    language: 'pt',
    country: 'BR',
    locale: 'pt-BR',
    name: 'Português (Brasil)',
    pathPrefix: '/pt',
    canonicalDomain: 'https://www.fly2any.com',
    defaultCurrency: 'BRL',
    isDefault: false,
  },
  {
    language: 'pt',
    country: 'PT',
    locale: 'pt-PT',
    name: 'Português (Portugal)',
    pathPrefix: '/pt-pt',
    canonicalDomain: 'https://www.fly2any.com',
    defaultCurrency: 'EUR',
    isDefault: false,
  },
];

// Default locale (English US)
export const DEFAULT_LOCALE = SUPPORTED_LOCALES.find(locale => locale.isDefault)!;

// ===========================
// HREFLANG HELPER FUNCTIONS
// ===========================

/**
 * Generate hreflang tags for a specific page
 */
export function generateHreflangTags(
  path: string,
  currentLocale: string = DEFAULT_LOCALE.locale
): Array<{ rel: string; href: string; hreflang?: string }> {
  const tags = [];
  const pagePath = path.startsWith('/') ? path : `/${path}`;
  
  // x-default tag (points to default language version)
  const defaultLocale = DEFAULT_LOCALE;
  const defaultUrl = `${defaultLocale.canonicalDomain}${defaultLocale.pathPrefix}${pagePath}`;
  tags.push({
    rel: 'alternate',
    href: defaultUrl,
    hreflang: 'x-default',
  });

  // Generate alternate tags for all supported locales
  for (const locale of SUPPORTED_LOCALES) {
    const localeUrl = `${locale.canonicalDomain}${locale.pathPrefix}${pagePath}`;
    tags.push({
      rel: 'alternate',
      href: localeUrl,
      hreflang: locale.locale.toLowerCase(),
    });
  }

  // Self-referential tag
  const currentLocaleConfig = SUPPORTED_LOCALES.find(l => l.locale === currentLocale) || DEFAULT_LOCALE;
  const selfUrl = `${currentLocaleConfig.canonicalDomain}${currentLocaleConfig.pathPrefix}${pagePath}`;
  tags.push({
    rel: 'canonical',
    href: selfUrl,
  });

  return tags;
}

/**
 * Generate HTML link tags for hreflang (for Next.js Head component)
 * Returns an array of React elements for use in Head component
 */
export function generateHreflangHtmlTags(
  path: string,
  currentLocale: string = DEFAULT_LOCALE.locale
): Array<React.ReactElement> {
  const tags = generateHreflangTags(path, currentLocale);
  
  return tags.map((tag, index) => {
    const props: any = {
      key: `hreflang-${index}`,
      rel: tag.rel,
      href: tag.href,
    };
    if (tag.hreflang) {
      props.hrefLang = tag.hreflang;
    }
    return React.createElement('link', props);
  });
}

/**
 * Get locale configuration from request (for middleware)
 */
export function getLocaleFromRequest(request: Request): HreflangLocale {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Check if path starts with any locale prefix
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname.startsWith(locale.pathPrefix + '/') || pathname === locale.pathPrefix) {
      return locale;
    }
  }
  
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    
    for (const lang of languages) {
      const languageCode = lang.split('-')[0].toLowerCase();
      const matchingLocale = SUPPORTED_LOCALES.find(l => l.language === languageCode);
      if (matchingLocale) {
        return matchingLocale;
      }
    }
  }
  
  // Check geo location from request (Vercel Edge)
  // @ts-expect-error - geo is available on Vercel Edge runtime
  const geo = request.geo || {};
  const country = geo.country || 'US';
  
  // Map country to preferred locale
  const countryToLocale: Record<string, string> = {
    'US': 'en-US',
    'GB': 'en-GB',
    'ES': 'es-ES',
    'MX': 'es-MX',
    'BR': 'pt-BR',
    'PT': 'pt-PT',
  };
  
  const localeCode = countryToLocale[country] || 'en-US';
  return SUPPORTED_LOCALES.find(l => l.locale === localeCode) || DEFAULT_LOCALE;
}

/**
 * Generate sitemap entries for all locales
 */
export function generateLocalizedSitemapEntries(
  page: HreflangPage
): Array<{ url: string; lastModified?: Date; changeFrequency?: string; priority?: number }> {
  const entries = [];
  
  for (const locale of SUPPORTED_LOCALES) {
    const url = `${locale.canonicalDomain}${locale.pathPrefix}${page.path}`;
    
    entries.push({
      url,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }
  
  return entries;
}

/**
 * Get language switcher configuration for UI
 */
export function getLanguageSwitcherConfig(currentLocale: string) {
  return SUPPORTED_LOCALES.map(locale => ({
    code: locale.locale,
    name: locale.name,
    pathPrefix: locale.pathPrefix,
    isCurrent: locale.locale === currentLocale,
    url: `${locale.canonicalDomain}${locale.pathPrefix}`,
  }));
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): HreflangLocale | null {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname.startsWith(locale.pathPrefix + '/') || pathname === locale.pathPrefix) {
      return locale;
    }
  }
  return null;
}

/**
 * Remove locale prefix from pathname
 */
export function removeLocalePrefix(pathname: string): string {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname.startsWith(locale.pathPrefix + '/')) {
      return pathname.slice(locale.pathPrefix.length);
    }
    if (pathname === locale.pathPrefix) {
      return '/';
    }
  }
  return pathname;
}

/**
 * Add locale prefix to pathname
 */
export function addLocalePrefix(pathname: string, localeCode: string): string {
  const locale = SUPPORTED_LOCALES.find(l => l.locale === localeCode) || DEFAULT_LOCALE;
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  if (normalizedPath === '/' && locale.pathPrefix === DEFAULT_LOCALE.pathPrefix) {
    return '/';
  }
  
  return `${locale.pathPrefix}${normalizedPath}`;
}

export default {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  generateHreflangTags,
  generateHreflangHtmlTags,
  getLocaleFromRequest,
  generateLocalizedSitemapEntries,
  getLanguageSwitcherConfig,
  getLocaleFromPathname,
  removeLocalePrefix,
  addLocalePrefix,
};
