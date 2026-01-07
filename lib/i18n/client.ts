'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Supported locales - TEMPORARILY FROZEN TO ENGLISH ONLY
 * TODO: Re-enable multilingual support by uncommenting 'pt' and 'es'
 */
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale (English only)
 */
export const defaultLocale: Locale = 'en';

/**
 * Get current language - ALWAYS RETURNS ENGLISH
 * TODO: Re-enable cookie-based language detection when multilingual support is activated
 */
export function getLanguage(): Locale {
  // TEMPORARY: Always return English
  return 'en';
}

/**
 * Set language - NO-OP (language switching disabled)
 * TODO: Re-enable language switching when multilingual support is activated
 */
export function setLanguage(lang: Locale): void {
  // TEMPORARY: Language switching is disabled
  console.warn('Language switching is temporarily disabled. Platform is frozen to English only.');
  // No-op: Do not set cookie, localStorage, or reload
}

/**
 * Hook to get and set language
 * TODO: Re-enable language switching when multilingual support is activated
 */
export function useLanguage() {
  // TEMPORARY: Always return English, setLanguage is a no-op
  const language: Locale = 'en';
  const setLanguageNoOp = (lang: Locale) => {
    console.warn('Language switching is temporarily disabled. Platform is frozen to English only.');
  };

  return {
    language,
    setLanguage: setLanguageNoOp,
  };
}

/**
 * Re-export useTranslations from next-intl for convenience
 *
 * Usage:
 * const t = useTranslations('Header');
 * <h1>{t('flights')}</h1>
 */
export { useNextIntlTranslations as useTranslations };

/**
 * Get translations for a namespace (for use outside components)
 */
export function getTranslations(namespace: string): Record<string, any> {
  // This is a placeholder - in real usage, you'd use the translations from the JSON
  // For now, we'll rely on the useTranslations hook in components
  return {};
}
