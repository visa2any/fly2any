'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { zIndex } from '@/lib/design-system';
import { MaxWidthContainer } from './MaxWidthContainer';
import { HamburgerMenu } from '@/components/mobile/HamburgerMenu';
import { NavigationDrawer } from '@/components/mobile/NavigationDrawer';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { UserMenu } from './UserMenu';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/lib/i18n/client';
import CartIcon from '@/components/cart/CartIcon';
import { LocaleSwitcher } from './LocaleSwitcher';

// Language type (kept for backward compatibility)
export type Language = 'en' | 'pt' | 'es';

// Language configuration
export const languages = {
  en: { name: 'English', flag: '🇺🇸', code: 'EN' },
  pt: { name: 'Português', flag: '🇧🇷', code: 'PT' },
  es: { name: 'Español', flag: '🇪🇸', code: 'ES' },
} as const;

// Component props (language and onLanguageChange now optional - managed internally via hooks)
export interface HeaderProps {
  language?: Language; // Deprecated - kept for backward compatibility
  onLanguageChange?: (lang: Language) => void; // Deprecated - kept for backward compatibility
  className?: string;
  showAuth?: boolean;
  logoUrl?: string;
  onSignIn?: () => void;
  onSignUp?: () => void;
  children?: React.ReactNode;
}

/**
 * Global Header Component
 *
 * A beautiful, responsive header with:
 * - Logo with hover effects
 * - Main navigation (Flights, Hotels, Cars, Packages)
 * - Language dropdown (EN/PT/ES)
 * - Auth buttons (Sign In, Sign Up)
 * - Sticky positioning with backdrop blur
 * - Full trilingual support
 *
 * @example
 * ```tsx
 * <Header
 *   language="en"
 *   onLanguageChange={(lang) => setLanguage(lang)}
 * />
 * ```
 */
export function Header({
  className = '',
  showAuth = true,
  logoUrl = '/logo.png',
  onSignIn,
  onSignUp,
  children,
}: HeaderProps) {
  const { data: session } = useSession();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);
  const [worldCupDropdownOpen, setWorldCupDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use next-intl for translations
  const t = useTranslations('Header');
  const { language, setLanguage } = useLanguage();

  // Create adapter for UserMenu component
  const userMenuTranslations = {
    account: t('account'),
    wishlist: t('wishlist'),
    notifications: t('notifications'),
    signin: t('signin'),
  };

  // Create full adapter for NavigationDrawer and other components
  const headerTranslationsAdapter = {
    flights: t('flights'),
    hotels: t('hotels'),
    cars: t('cars'),
    tours: t('tours'),
    activities: t('activities'),
    packages: t('packages'),
    travelInsurance: t('travelInsurance'),
    deals: t('deals'),
    discover: t('discover'),
    explore: t('explore'),
    travelGuide: t('travelGuide'),
    faq: t('faq'),
    blog: t('blog'),
    destinations: t('destinations'),
    airlines: t('airlines'),
    popularRoutes: t('popularRoutes'),
    support: t('support'),
    signin: t('signin'),
    signup: t('signup'),
    wishlist: t('wishlist'),
    notifications: t('notifications'),
    account: t('account'),
  };

  // Level-6: Smart scroll hide (show on scroll UP, hide on scroll DOWN)
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 80, // Trigger after 80px scroll for smoother UX
    debounceDelay: 50, // Faster response
    mobileOnly: false, // Apply to all devices for consistent UX
  });

  // Prevent hydration mismatch for session-dependent rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection for enhanced header visibility (background blur effect)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (langDropdownOpen && !target.closest('.language-dropdown')) {
        setLangDropdownOpen(false);
      }
      if (discoverDropdownOpen && !target.closest('.discover-dropdown')) {
        setDiscoverDropdownOpen(false);
      }
      if (worldCupDropdownOpen && !target.closest('.worldcup-dropdown')) {
        setWorldCupDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [langDropdownOpen, discoverDropdownOpen, worldCupDropdownOpen]);

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLangDropdownOpen(false);
    setLanguage(lang); // Use next-intl language management
  };

  // Handle sign in
  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      // Default behavior: navigate to sign in page
      window.location.href = '/auth/signin';
    }
  };

  // Handle sign up
  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      // Default behavior: navigate to sign up page
      window.location.href = '/auth/signup';
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 ${className}`}
        suppressHydrationWarning
        style={{
          zIndex: zIndex.STICKY,
          // Hide header in PWA standalone mode
          display: 'var(--header-display, block)',
          // Level-6: Transparent at top (immersive), frosted glass on scroll
          background: scrolled
            ? 'rgba(255, 255, 255, 0.97)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          // Level-6: Border only when scrolled
          borderBottom: scrolled
            ? '1px solid rgba(231, 64, 53, 0.08)'
            : 'none',
          // Level-6: Shadow only when scrolled
          boxShadow: scrolled
            ? '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)'
            : 'none',
          // Level-6: Smart hide on scroll DOWN, show on scroll UP
          transform: scrollDirection === 'down' && !isAtTop
            ? 'translateY(-100%)'
            : 'translateY(0)',
          transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), background 150ms, border 150ms, box-shadow 150ms',
          willChange: 'transform',
        }}
      >
        <MaxWidthContainer noPadding className="px-3 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
            {/* Logo - Level-6 Ultra-Premium */}
            <a
              href="/"
              className="flex items-center flex-shrink-0 transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:opacity-90 active:scale-[0.98]"
            >
              <Image
                src="/logo-transparent.png"
                alt="Fly2Any"
                width={880}
                height={304}
                priority
                className="h-9 sm:h-10 lg:h-12 w-auto object-contain transition-all duration-200"
                style={{
                  filter: scrolled ? 'none' : 'brightness(1.15) drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                }}
              />
            </a>

          {/* Main Navigation - Level-6 Apple-Class Style */}
          <nav
            className="hidden lg:flex items-center gap-0 xl:gap-0.5 ml-auto mr-2 xl:mr-4"
            suppressHydrationWarning
          >

            {/* Flights - First */}
            <a
              href="/flights"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  ✈️
                </span>
                {t('flights')}
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* Hotels */}
            <a
              href="/hotels"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  🏨
                </span>
                {t('hotels')}
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* Cars */}
            <a
              href="/cars"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  🚗
                </span>
                Cars
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* Tours */}
            <a
              href="/tours"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  🎯
                </span>
                Tours
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* Activities */}
            <a
              href="/activities"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  🎪
                </span>
                Activities
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* Transfers */}
            <a
              href="/transfers"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  🚐
                </span>
                Transfers
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* Experiences */}
            <a
              href="/experiences"
              className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                  : 'text-white hover:text-white/90 hover:bg-white/10'
              }`}
              style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                  🌟
                </span>
                Experiences
              </span>
              <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
            </a>

            {/* ============================================
                TEMPORARILY HIDDEN - Uncomment when ready to launch
                Cars, Tours, Activities, Packages, Insurance nav links
                ============================================ */}

            {/* Cars - TEMPORARILY HIDDEN
            <a
              href="/cars"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🚗
                </span>
                {t('cars')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            */}

            {/* Tours - TEMPORARILY HIDDEN
            <a
              href="/tours"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🎯
                </span>
                {t('tours')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            */}

            {/* Activities - TEMPORARILY HIDDEN
            <a
              href="/activities"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🎪
                </span>
                {t('activities')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            */}

            {/* Packages - TEMPORARILY HIDDEN
            <a
              href="/packages"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🎁
                </span>
                {t('packages')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            */}

            {/* Travel Insurance - TEMPORARILY HIDDEN
            <a
              href="/travel-insurance"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🛡️
                </span>
                <span className="hidden 2xl:inline">{t('travelInsurance')}</span>
                <span className="2xl:hidden">Insurance</span>
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            */}

            {/* Discover Dropdown - Level-6 */}
            <div className="relative discover-dropdown" onMouseLeave={() => setDiscoverDropdownOpen(false)}>
              <button
                onClick={() => setDiscoverDropdownOpen(!discoverDropdownOpen)}
                onMouseEnter={() => setDiscoverDropdownOpen(true)}
                className={`group relative px-2 xl:px-3 py-2 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] font-semibold text-sm rounded-xl hover:-translate-y-0.5 flex items-center gap-1.5 ${
                  scrolled
                    ? 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/60'
                    : 'text-white hover:text-white/90 hover:bg-white/10'
                }`}
                style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-lg transition-transform duration-150 group-hover:scale-110">
                    🗺️
                  </span>
                  {t('discover')}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${discoverDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-primary-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-left"></span>
              </button>

              {/* Dropdown Menu */}
              {discoverDropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-2xl overflow-hidden z-dropdown animate-slideDown"
                  onMouseLeave={() => setDiscoverDropdownOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {/* Deals */}
                  <a
                    href="/deals"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🔥</span>
                    <span className="font-semibold text-sm">{t('deals')}</span>
                  </a>
                  {/* Destinations */}
                  <a
                    href="/destinations"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🏙️</span>
                    <span className="font-semibold text-sm">{t('destinations')}</span>
                  </a>
                  {/* Airlines */}
                  <a
                    href="/airlines"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">✈️</span>
                    <span className="font-semibold text-sm">{t('airlines')}</span>
                  </a>
                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1"></div>
                  <a
                    href="/blog"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">✍️</span>
                    <span className="font-semibold text-sm">{t('blog')}</span>
                  </a>
                  <a
                    href="/explore"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🌍</span>
                    <span className="font-semibold text-sm">{t('explore')}</span>
                  </a>
                  <a
                    href="/travel-guide"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">📚</span>
                    <span className="font-semibold text-sm">{t('travelGuide')}</span>
                  </a>
                  <a
                    href="/faq"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">❓</span>
                    <span className="font-semibold text-sm">{t('faq')}</span>
                  </a>
                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1"></div>
                  {/* World Cup 2026 */}
                  <a
                    href="/world-cup-2026"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">⚽</span>
                    <span className="font-bold text-sm bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-transparent">World Cup 2026</span>
                  </a>
                </div>
              )}
            </div>

            {/* World Cup 2026 Dropdown - MOVED TO DISCOVER */}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-3" suppressHydrationWarning>

            {/* ============ MOBILE ICONS - Level-6 Apple-Class ============ */}

            {/* Mobile Notification Bell */}
            {mounted && session?.user && (
              <a
                href="/account/notifications"
                className="lg:hidden relative flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/80 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
                aria-label="Notifications"
              >
                <svg className="w-[18px] h-[18px] text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {/* Notification dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white"></span>
              </a>
            )}

            {/* Mobile Profile Icon */}
            {mounted && session?.user && (
              <Link
                href="/account"
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-100/80 hover:bg-neutral-200/80 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
                aria-label="My Account"
              >
                <svg className="w-[18px] h-[18px] text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            {/* Mobile Sign In - Only when not authenticated */}
            {mounted && !session?.user && (
              <Link
                href="/auth/signin"
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-primary-50 hover:bg-primary-100 transition-all duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-95"
                aria-label="Sign In"
              >
                <svg className="w-[18px] h-[18px] text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            {/* ============ DESKTOP ICONS ============ */}

            {/* Locale Switcher - Language & Currency */}
            <LocaleSwitcher scrolled={scrolled} />

            {/* Cart Icon - Desktop & Mobile */}
            <CartIcon className="hidden sm:block" scrolled={scrolled} />

            {/* Notification Bell - Desktop only */}
            {mounted && session?.user && (
              <NotificationBell
                userId={session.user.id}
                className="hidden lg:block"
              />
            )}

            {/* User Menu - Desktop only */}
            {mounted && session?.user && (
              <div className="hidden lg:block">
                <UserMenu
                  user={session.user}
                  translations={userMenuTranslations}
                />
              </div>
            )}

            {/* Language Selector - DISABLED (English Only) */}
            {/* Kept infrastructure intact but hidden from UI */}
            <div className="relative language-dropdown hidden">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="group flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 xl:py-2 text-gray-700 transition-all duration-300 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/30"
                style={{
                  minWidth: '58px',
                }}
              >
                <span className="text-sm xl:text-base transition-transform group-hover:scale-110">
                  {languages[language].flag}
                </span>
                <span className="font-semibold text-[10px] xl:text-xs uppercase tracking-wider text-gray-600 group-hover:text-primary-600">
                  {languages[language].code}
                </span>
                <svg
                  className={`w-2.5 xl:w-3 h-2.5 xl:h-3 text-gray-400 transition-all duration-200 ${langDropdownOpen ? 'rotate-180 text-primary-600' : 'group-hover:text-primary-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu - Clean Minimal Design */}
              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-dropdown animate-slideDown shadow-xl"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {(Object.keys(languages) as Language[]).map((languageKey) => (
                    <button
                      key={languageKey}
                      onClick={() => handleLanguageChange(languageKey)}
                      className={`w-full flex items-center gap-1.5.5 px-4 py-2.5 transition-all duration-150 ${
                        language === languageKey
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{languages[languageKey].flag}</span>
                      <span className="font-medium text-sm flex-1 text-left">
                        {languages[languageKey].name}
                      </span>
                      {language === languageKey && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* My Account Button - Unified auth entry point, hidden on mobile */}
            {mounted && showAuth && !session?.user && (
              <button
                onClick={handleSignIn}
                className="hidden sm:flex items-center gap-1.5 xl:gap-2 px-3 xl:px-5 py-2 xl:py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 font-bold text-xs xl:text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap"
                style={{
                  boxShadow: '0 2px 8px rgba(214, 58, 53, 0.25)',
                }}
              >
                <svg className="w-3.5 xl:w-4 h-3.5 xl:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden lg:inline">{t('account')}</span>
                <span className="lg:hidden">Sign In</span>
              </button>
            )}

            {/* Hamburger Menu (Mobile Only) - Right aligned, pushed to edge */}
            <div className="lg:hidden -mr-1">
              <HamburgerMenu
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>

            {/* Custom children (e.g., additional elements) */}
            {children}
          </div>
        </div>
      </MaxWidthContainer>
    </header>

    {/* Mobile Navigation Drawer */}
    <NavigationDrawer
      isOpen={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      language={language}
      onLanguageChange={setLanguage}
      translations={headerTranslationsAdapter}
      onSignIn={onSignIn}
      onSignUp={onSignUp}
      logoUrl={logoUrl}
      userId={mounted ? session?.user?.id : undefined}
    />
    </>
  );
}

export default Header;
