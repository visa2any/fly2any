import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Supported locales
export const locales = ['en', 'pt', 'es'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'en';

/**
 * Get locale from cookie or browser preferences
 * Priority: Cookie > Accept-Language header > Default
 */
export function getLocale(): Locale {
  const cookieStore = cookies();
  const languageCookie = cookieStore.get('fly2any_language');

  if (languageCookie && locales.includes(languageCookie.value as Locale)) {
    return languageCookie.value as Locale;
  }

  return defaultLocale;
}

/**
 * next-intl request configuration
 * This is called for every request to load the appropriate messages
 */
export default getRequestConfig(async () => {
  const locale = getLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
