'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  logoUrl = '/fly2any-logo.png',
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

  // Scroll direction detection for auto-hide behavior (Phase 8 Track 2A.1)
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true, // Only auto-hide on mobile
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

    window.addEventListener('scroll', handleScroll);
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
        className={`sticky top-0 z-fixed ${className}`}
        suppressHydrationWarning
        style={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderBottom: scrolled
            ? '1px solid rgba(0, 0, 0, 0.12)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: scrolled
            ? '0 2px 12px rgba(0, 0, 0, 0.08)'
            : '0 1px 4px rgba(0, 0, 0, 0.04)',
          // Phase 8 Track 2A.1: Auto-hide on scroll down (mobile only, 80px savings)
          transform: scrollDirection === 'down' && !isAtTop
            ? 'translateY(-100%)'
            : 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1), background 300ms, border 300ms, box-shadow 300ms',
          willChange: 'transform',
        }}
      >
        <MaxWidthContainer noPadding className="px-3 md:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
            {/* Logo with Enhanced Visibility - Left aligned, smaller on mobile */}
            <a href="/" className="flex items-center group flex-shrink-0">
            <div
              className="relative transition-all duration-300 group-hover:scale-105 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl"
              style={{
                background: scrolled
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(6, 182, 212, 0.06))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(6, 182, 212, 0.08))',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
              }}
            >
              <Image
                src={logoUrl}
                alt="Fly2Any Travel"
                width={144}
                height={43}
                priority
                className="w-auto h-6 sm:h-7 md:h-9"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxHeight: '24px',
                  filter: scrolled
                    ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 8px rgba(30, 64, 175, 0.12)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12)) drop-shadow(0 3px 6px rgba(30, 64, 175, 0.10)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))',
                  transition: 'filter 0.3s ease',
                }}
              />
              <style jsx>{`
                @media (min-width: 640px) {
                  img {
                    max-height: 28px !important;
                  }
                }
                @media (min-width: 768px) {
                  img {
                    max-height: 36px !important;
                  }
                }
              `}</style>
            </div>
          </a>

          {/* Main Navigation - Premium Glassmorphism Style */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 ml-auto mr-3 xl:mr-6" suppressHydrationWarning>

            {/* Flights - First */}
            <a
              href="/flights"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform group-hover:scale-110">
                  ✈️
                </span>
                {t('flights')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>

            {/* Hotels */}
            <a
              href="/hotels"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg transition-transform group-hover:scale-110">
                  🏨
                </span>
                {t('hotels')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>

            {/* Deals - Promoted to main nav */}
            <a
              href="/deals"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🔥
                </span>
                {t('deals')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>

            {/* Destinations - Promoted to main nav */}
            <a
              href="/destinations"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  🏙️
                </span>
                {t('destinations')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>

            {/* Airlines - Promoted to main nav */}
            <a
              href="/airlines"
              className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-1 xl:gap-1.5">
                <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                  ✈️
                </span>
                {t('airlines')}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
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

            {/* Discover Dropdown */}
            <div className="relative discover-dropdown">
              <button
                onClick={() => setDiscoverDropdownOpen(!discoverDropdownOpen)}
                onMouseEnter={() => setDiscoverDropdownOpen(true)}
                className="group relative px-2 xl:px-3 py-2 xl:py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-xs xl:text-sm rounded-lg hover:bg-primary-50/50 flex items-center gap-1 xl:gap-1.5"
              >
                <span className="flex items-center gap-1 xl:gap-1.5">
                  <span className="text-base xl:text-lg transition-transform group-hover:scale-110">
                    🗺️
                  </span>
                  {t('discover')}
                </span>
                <svg
                  className={`w-3 xl:w-4 h-3 xl:h-4 transition-all duration-300 ${discoverDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
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
                </div>
              )}
            </div>

            {/* World Cup 2026 Dropdown - Colorful with submenus */}
            <div className="relative worldcup-dropdown">
              <button
                onClick={() => setWorldCupDropdownOpen(!worldCupDropdownOpen)}
                onMouseEnter={() => setWorldCupDropdownOpen(true)}
                className="group relative px-2 xl:px-3 py-2 xl:py-2.5 transition-all duration-300 font-black text-[10px] xl:text-xs 2xl:text-sm rounded-lg hover:bg-primary-50/30 flex items-center gap-0.5 xl:gap-1"
              >
                <span className="flex items-center gap-0.5 xl:gap-1">
                  <span className="text-sm xl:text-base 2xl:text-lg transition-transform group-hover:scale-110">
                    ⚽
                  </span>
                  <span
                    className="bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-transparent whitespace-nowrap"
                    style={{
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    <span className="hidden 2xl:inline">WORLD CUP 2026</span>
                    <span className="2xl:hidden">WC 2026</span>
                  </span>
                  <span className="text-xs xl:text-sm 2xl:text-base">🏆</span>
                </span>
                <svg
                  className={`w-3 xl:w-4 h-3 xl:h-4 text-gray-600 transition-all duration-300 ${worldCupDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* World Cup Dropdown Menu */}
              <div
                className={`absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden z-dropdown transition-all duration-300 ${
                  worldCupDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                }`}
                onMouseLeave={() => setWorldCupDropdownOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                  {/* Main Overview */}
                  <a
                    href="/world-cup-2026"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 text-gray-700 transition-all duration-200 border-b border-gray-100"
                  >
                    <span className="text-xl">🏆</span>
                    <div>
                      <span className="font-bold text-sm block">World Cup 2026</span>
                      <span className="text-xs text-gray-500">Complete Guide</span>
                    </div>
                  </a>

                  {/* Schedule & Matches */}
                  <a
                    href="/world-cup-2026/schedule"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">📅</span>
                    <span className="font-semibold text-sm">Schedule & Matches</span>
                  </a>

                  {/* Stadiums & Venues */}
                  <a
                    href="/world-cup-2026/stadiums"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🏟️</span>
                    <span className="font-semibold text-sm">Stadiums & Venues</span>
                  </a>

                  {/* Teams & Groups */}
                  <a
                    href="/world-cup-2026/teams"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🌍</span>
                    <span className="font-semibold text-sm">Teams & Groups</span>
                  </a>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1"></div>

                  {/* Travel Packages */}
                  <a
                    href="/world-cup-2026/packages"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🎫</span>
                    <span className="font-semibold text-sm">Travel Packages</span>
                  </a>

                  {/* Hotels & Accommodation */}
                  <a
                    href="/world-cup-2026/hotels"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🏨</span>
                    <span className="font-semibold text-sm">Hotels & Accommodation</span>
                  </a>

                  {/* Tickets Information */}
                  <a
                    href="/world-cup-2026/tickets"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 text-gray-700 transition-all duration-200"
                  >
                    <span className="text-xl">🎟️</span>
                    <span className="font-semibold text-sm">Tickets Information</span>
                  </a>
              </div>
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3" suppressHydrationWarning>
            {/* Notification Bell - Only for authenticated users, hidden on mobile */}
            {mounted && session?.user && (
              <NotificationBell
                userId={session.user.id}
                className="hidden md:block"
              />
            )}

            {/* User Menu - Only for authenticated users, hidden on mobile */}
            {mounted && session?.user && (
              <div className="hidden md:block">
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
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 transition-all duration-150 ${
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
                  boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
                }}
              >
                <svg className="w-3.5 xl:w-4 h-3.5 xl:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden lg:inline">{t('account')}</span>
                <span className="lg:hidden">Sign In</span>
              </button>
            )}

            {/* Hamburger Menu (Mobile Only) - Right aligned */}
            <div className="lg:hidden">
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
