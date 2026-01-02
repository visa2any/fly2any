"use client";

import { useCallback, useMemo } from 'react';
import { translations, defaultLocale, type Locale } from './translations';

// Get nested value from object by dot path
function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) as string | undefined;
}

/**
 * Hook for accessing translations
 * Usage: const { t } = useTranslation('en');
 *        t('quote.title') => 'Quote Builder'
 */
export function useTranslation(locale: Locale = defaultLocale) {
  const currentTranslations = useMemo(() => {
    return translations[locale] || translations[defaultLocale];
  }, [locale]);

  const fallbackTranslations = translations[defaultLocale];

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Try current locale first, then fallback to English
    let value = getNestedValue(currentTranslations, key) || getNestedValue(fallbackTranslations, key);

    if (!value) {
      console.warn(`Missing translation: ${key} for locale: ${locale}`);
      return key;
    }

    // Replace params like {name} with values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value!.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }

    return value;
  }, [currentTranslations, fallbackTranslations, locale]);

  // Shorthand for common namespaces
  const tCommon = useCallback((key: string, params?: Record<string, string | number>) =>
    t(`common.${key}`, params), [t]);

  const tQuote = useCallback((key: string, params?: Record<string, string | number>) =>
    t(`quote.${key}`, params), [t]);

  const tProducts = useCallback((key: string, params?: Record<string, string | number>) =>
    t(`products.${key}`, params), [t]);

  const tTimeline = useCallback((key: string, params?: Record<string, string | number>) =>
    t(`timeline.${key}`, params), [t]);

  const tPricing = useCallback((key: string, params?: Record<string, string | number>) =>
    t(`pricing.${key}`, params), [t]);

  const tTone = useCallback((tone: string, key: string, params?: Record<string, string | number>) =>
    t(`tone.${tone}.${key}`, params), [t]);

  const tGreeting = useCallback((key: string) =>
    t(`greetings.${key}`), [t]);

  const tA11y = useCallback((key: string, params?: Record<string, string | number>) =>
    t(`accessibility.${key}`, params), [t]);

  return {
    t,
    tCommon,
    tQuote,
    tProducts,
    tTimeline,
    tPricing,
    tTone,
    tGreeting,
    tA11y,
    locale,
  };
}

/**
 * Get time-based greeting key
 */
export function getGreetingKey(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Locale detection from browser
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLocale = navigator.language.split('-')[0] as Locale;
  return translations[browserLocale] ? browserLocale : defaultLocale;
}
