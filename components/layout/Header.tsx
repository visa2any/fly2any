'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

  // Use provided translations or defaults
  const t = translations || headerTranslations[language];

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
      className={`sticky top-0 z-50 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 backdrop-blur-md shadow-xl border-b border-white/20 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Subtle Shadow - No Background */}
          <a href="/" className="flex items-center group">
            <div className="relative transition-all duration-300 group-hover:scale-105">
              <Image
                src={logoUrl}
                alt="Fly2Any Travel"
                width={144}
                height={43}
                className="h-9 w-auto drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            </div>
          </a>

          {/* Main Navigation - Enhanced & Right Aligned */}
          <nav className="hidden md:flex items-center space-x-2 ml-auto mr-6">
            <a
              href="/flights"
              className="group relative px-5 py-2.5 text-white/90 hover:text-white transition-all duration-300 font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110 brightness-125 contrast-125">
                  ✈️
                </span>
                {t.flights}
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/hotels"
              className="group relative px-5 py-2.5 text-white/90 hover:text-white transition-all duration-300 font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110 brightness-125 contrast-125">
                  🏨
                </span>
                {t.hotels}
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/cars"
              className="group relative px-5 py-2.5 text-white/90 hover:text-white transition-all duration-300 font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110 brightness-125 contrast-125">
                  🚗
                </span>
                {t.cars}
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/packages"
              className="group relative px-5 py-2.5 text-white/90 hover:text-white transition-all duration-300 font-semibold text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:scale-110 brightness-125 contrast-125">
                  📦
                </span>
                {t.packages}
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Language Dropdown - Clean, No Background */}
            <div className="relative language-dropdown">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="group flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300"
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

              {/* Dropdown Menu - Refined */}
              {langDropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown border-2 border-gray-100">
                  {(Object.keys(languages) as Language[]).map((languageKey) => (
                    <button
                      key={languageKey}
                      onClick={() => handleLanguageChange(languageKey)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 transition-all duration-200 ${
                        language === languageKey
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
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

            {/* Auth Buttons - Refined for Gradient Background */}
            {showAuth && (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={handleSignIn}
                  className="px-5 py-2.5 text-white/90 hover:text-white font-bold text-sm transition-all duration-300 hover:scale-105"
                >
                  {t.signin}
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-6 py-2.5 bg-white text-primary-600 hover:bg-white/95 font-bold text-sm rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {t.signup}
                </button>
              </div>
            )}

            {/* Custom children (e.g., mobile menu button, user avatar, etc.) */}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
