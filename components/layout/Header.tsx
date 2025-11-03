'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MaxWidthContainer } from './MaxWidthContainer';

// Language type
export type Language = 'en' | 'pt' | 'es';

// Language configuration
export const languages = {
  en: { name: 'English', flag: '🇺🇸', code: 'EN' },
  pt: { name: 'Português', flag: '🇧🇷', code: 'PT' },
  es: { name: 'Español', flag: '🇪🇸', code: 'ES' },
} as const;

// Translation content type
export interface HeaderTranslations {
  flights: string;
  hotels: string;
  cars: string;
  packages: string;
  support: string;
  signin: string;
  signup: string;
}

// Default translations
export const headerTranslations = {
  en: {
    flights: 'Flights',
    hotels: 'Hotels',
    cars: 'Cars',
    packages: 'Packages',
    support: '24/7 Support',
    signin: 'Sign In',
    signup: 'Sign Up',
  },
  pt: {
    flights: 'Voos',
    hotels: 'Hotéis',
    cars: 'Carros',
    packages: 'Pacotes',
    support: 'Suporte 24/7',
    signin: 'Entrar',
    signup: 'Cadastrar',
  },
  es: {
    flights: 'Vuelos',
    hotels: 'Hoteles',
    cars: 'Autos',
    packages: 'Paquetes',
    support: 'Soporte 24/7',
    signin: 'Iniciar Sesión',
    signup: 'Registrarse',
  },
} as const;

// Component props
export interface HeaderProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  translations?: HeaderTranslations;
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
  language = 'en',
  onLanguageChange,
  translations,
  className = '',
  showAuth = true,
  logoUrl = '/fly2any-logo.png',
  onSignIn,
  onSignUp,
  children,
}: HeaderProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Use provided translations or defaults
  const t = translations || headerTranslations[language];

  // Scroll detection for enhanced header visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (langDropdownOpen && !target.closest('.language-dropdown')) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [langDropdownOpen]);

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLangDropdownOpen(false);
    onLanguageChange?.(lang);
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
    <header
      className={`sticky top-0 z-[100] transition-all duration-300 ${className}`}
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
      }}
    >
      <MaxWidthContainer noPadding style={{ padding: '0 24px' }}>
        <div className="flex items-center justify-between h-20">
          {/* Logo with Enhanced Visibility - Multi-layered shadows + subtle background */}
          <a href="/" className="flex items-center group">
            <div
              className="relative transition-all duration-300 group-hover:scale-105 px-3 py-2 rounded-xl"
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
                className="h-9 w-auto"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxHeight: '36px',
                  filter: scrolled
                    ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 8px rgba(30, 64, 175, 0.12)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12)) drop-shadow(0 3px 6px rgba(30, 64, 175, 0.10)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))',
                  transition: 'filter 0.3s ease',
                }}
              />
            </div>
          </a>

          {/* Main Navigation - Premium Glassmorphism Style */}
          <nav className="hidden md:flex items-center space-x-1 ml-auto mr-6">
            <a
              href="/flights"
              className="group relative px-4 py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110">
                  ✈️
                </span>
                {t.flights}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="/hotels"
              className="group relative px-4 py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110">
                  🏨
                </span>
                {t.hotels}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="/cars"
              className="group relative px-4 py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110">
                  🚗
                </span>
                {t.cars}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
            <a
              href="/packages"
              className="group relative px-4 py-2.5 text-gray-700 hover:text-primary-600 transition-all duration-300 font-semibold text-sm rounded-lg hover:bg-primary-50/50"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110">
                  📦
                </span>
                {t.packages}
              </span>
              <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Language Dropdown - Glassmorphism Style */}
            <div className="relative language-dropdown">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="group flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 transition-all duration-300 rounded-lg hover:bg-primary-50/50"
              >
                <span className="text-xl transition-transform group-hover:scale-110">
                  {languages[language].flag}
                </span>
                <span className="font-bold text-sm">{languages[language].code}</span>
                <svg
                  className={`w-4 h-4 transition-all duration-300 ${langDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu - Premium Glassmorphism */}
              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-52 rounded-2xl overflow-hidden z-[9999] animate-slideDown"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {(Object.keys(languages) as Language[]).map((languageKey) => (
                    <button
                      key={languageKey}
                      onClick={() => handleLanguageChange(languageKey)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-200 ${
                        language === languageKey
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                          : 'hover:bg-primary-50/50 text-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{languages[languageKey].flag}</span>
                      <span className="font-semibold text-sm flex-1 text-left">
                        {languages[languageKey].name}
                      </span>
                      {language === languageKey && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Auth Buttons - Premium Glassmorphism Style */}
            {showAuth && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleSignIn}
                  className="px-5 py-2.5 text-gray-700 hover:text-primary-600 font-bold text-sm transition-all duration-300 rounded-lg hover:bg-primary-50/50"
                >
                  {t.signin}
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 font-bold text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
                  }}
                >
                  {t.signup}
                </button>
              </div>
            )}

            {/* Custom children (e.g., mobile menu button, user avatar, etc.) */}
            {children}
          </div>
        </div>
      </MaxWidthContainer>
    </header>
  );
}

export default Header;
