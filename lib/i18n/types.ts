/**
 * Shared TypeScript types for i18n translation objects
 * Used across components for type safety with translation adapters
 */

/**
 * Supported languages
 */
export type Language = 'en' | 'pt' | 'es';

/**
 * Language metadata for UI display
 */
export const languages: Record<Language, { code: Language; name: string; flag: string }> = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  pt: { code: 'pt', name: 'Português', flag: '🇧🇷' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
};

/**
 * Header navigation translations
 * Used by: Header, BottomTabBar, NavigationDrawer, GlobalLayout
 */
export interface HeaderTranslations {
  // Navigation items
  flights: string;
  hotels: string;
  cars: string;
  tours: string;
  activities: string;
  packages: string;
  travelInsurance: string;
  deals: string;

  // Discover menu
  discover: string;
  explore: string;
  travelGuide: string;
  faq: string;
  blog: string;
  destinations: string;
  airlines: string;
  popularRoutes: string;

  // Support
  support: string;

  // Authentication
  signin: string;
  signup: string;

  // User menu
  wishlist: string;
  notifications: string;
  account: string;
}

/**
 * User menu specific translations
 * Used by: UserMenu component
 */
export interface UserMenuTranslations {
  account: string;
  wishlist: string;
  notifications: string;
  signin: string;
}
