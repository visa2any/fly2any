'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

/**
 * Supported locales
 */
export const locales = ['en', 'pt', 'es'] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale
 */
export const defaultLocale: Locale = 'en';

/**
 * Get current language from cookie (client-side only)
 */
export function getLanguage(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  // Check cookie
  const cookies = document.cookie.split(';');
  const langCookie = cookies.find(c => c.trim().startsWith('fly2any_language='));

  if (langCookie) {
    const lang = langCookie.split('=')[1].trim() as Locale;
    if (locales.includes(lang)) {
      return lang;
    }
  }

  return defaultLocale;
}

/**
 * Set language and update cookie
 */
export function setLanguage(lang: Locale): void {
  if (typeof window === 'undefined') return;

  // Set cookie (1 year expiry)
  const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds
  document.cookie = `fly2any_language=${lang}; path=/; max-age=${maxAge}; SameSite=Lax`;

  // Also update localStorage as fallback
  localStorage.setItem('fly2any_language', lang);

  // Reload page to apply new language
  window.location.reload();
}

/**
 * Hook to get and set language
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLanguageState(getLanguage());
  }, []);

  const changeLanguage = (lang: Locale) => {
    setLanguage(lang);
    setLanguageState(lang);
  };

  return {
    language,
    setLanguage: changeLanguage,
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
