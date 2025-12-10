'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';
import { zIndex } from '@/lib/design-system';
import type { Language, HeaderTranslations } from '@/lib/i18n/types';
import { languages } from '@/lib/i18n/types';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  translations: HeaderTranslations;
  onSignIn?: () => void;
  onSignUp?: () => void;
  logoUrl?: string;
  userId?: string;
}

/**
 * Mobile Navigation Drawer
 *
 * Slide-out drawer from the left side for mobile navigation.
 *
 * Features:
 * - Slides in from left with backdrop
 * - Contains all main navigation links
 * - Language selector
 * - Auth buttons
 * - Smooth Framer Motion animations
 * - Focus trap when open
 * - Backdrop click to close
 */
export function NavigationDrawer({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  translations,
  onSignIn,
  onSignUp,
  logoUrl = '/fly2any-logo.png',
  userId,
}: NavigationDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle sign in
  const handleSignIn = () => {
    onClose();
    if (onSignIn) {
      onSignIn();
    } else {
      window.location.href = '/auth/signin';
    }
  };

  // Handle sign up
  const handleSignUp = () => {
    onClose();
    if (onSignUp) {
      onSignUp();
    } else {
      window.location.href = '/auth/signup';
    }
  };

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    onLanguageChange(lang);
    // Keep drawer open when changing language
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            id="mobile-navigation-backdrop"
            className="fixed inset-0 bg-black/50 md:hidden"
            style={{ zIndex: zIndex.MODAL_BACKDROP }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl md:hidden overflow-y-auto"
            style={{ zIndex: zIndex.MODAL_CONTENT }}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Header with Logo, Notifications, and Close Button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <a href="/" onClick={onClose} className="flex items-center gap-2.5">
                {/* Airplane Icon */}
                <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50">
                  <Image
                    src="/icon-192.png"
                    alt="Fly2Any"
                    width={28}
                    height={28}
                    priority
                    className="w-7 h-7"
                  />
                </div>
                {/* Fly2Any Text */}
                <span className="font-bold text-xl bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
                  Fly2Any
                </span>
              </a>
              <div className="flex items-center gap-2">
                {/* Notification Bell for Mobile */}
                {userId && (
                  <NotificationBell userId={userId} />
                )}
                <button
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Account Section - Only for authenticated users */}
            {userId && (
              <>
                <div className="px-4 pt-6 pb-2">
                  <div className="px-4 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      My Account
                    </span>
                  </div>
                  <div className="space-y-1">
                    <a
                      href="/account"
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
                    >
                      <span className="text-xl">👤</span>
                      <span className="text-base">{translations.account}</span>
                    </a>
                    <a
                      href="/account/wishlist"
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
                    >
                      <span className="text-xl">💖</span>
                      <span className="text-base">{translations.wishlist}</span>
                    </a>
                    <a
                      href="/account/notifications"
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
                    >
                      <span className="text-xl">🔔</span>
                      <span className="text-base">{translations.notifications}</span>
                    </a>
                  </div>
                </div>
                {/* Divider */}
                <div className="mx-6 border-t border-gray-200" />
              </>
            )}

            {/* Main Navigation Links */}
            <nav className="px-4 py-6 space-y-2">
              <div className="px-4 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Book Travel
                </span>
              </div>
              <a
                href="/flights"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">✈️</span>
                <span className="text-base">{translations.flights}</span>
              </a>
              <a
                href="/hotels"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🏨</span>
                <span className="text-base">{translations.hotels}</span>
              </a>
              <a
                href="/deals"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-base">{translations.deals}</span>
              </a>
              <a
                href="/destinations"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🏙️</span>
                <span className="text-base">{translations.destinations}</span>
              </a>
              <a
                href="/airlines"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">✈️</span>
                <span className="text-base">{translations.airlines}</span>
              </a>
              {/* ============================================
                  TEMPORARILY HIDDEN - Uncomment when ready to launch
                  Cars, Tours, Activities, Packages, Insurance mobile nav links
                  ============================================ */}
              {/* <a
                href="/cars"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🚗</span>
                <span className="text-base">{translations.cars}</span>
              </a>
              <a
                href="/tours"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🎯</span>
                <span className="text-base">{translations.tours}</span>
              </a>
              <a
                href="/activities"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🎪</span>
                <span className="text-base">{translations.activities}</span>
              </a>
              <a
                href="/packages"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">📦</span>
                <span className="text-base">{translations.packages}</span>
              </a>
              <a
                href="/travel-insurance"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🛡️</span>
                <span className="text-base">{translations.travelInsurance}</span>
              </a> */}
              <a
                href="/world-cup-2026"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl transition-all duration-200 font-black shadow-lg"
              >
                <span className="text-2xl animate-pulse">⚽</span>
                <span className="text-base">WORLD CUP 2026 🏆</span>
              </a>
            </nav>

            {/* Divider */}
            <div className="mx-6 border-t border-gray-200" />

            {/* Discover Section */}
            <nav className="px-4 py-6 space-y-2">
              <div className="px-4 mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Discover
                </span>
              </div>
              <a
                href="/deals"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🔥</span>
                <span className="text-base">{translations.deals}</span>
              </a>
              <a
                href="/explore"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">🌍</span>
                <span className="text-base">{translations.explore}</span>
              </a>
              <a
                href="/travel-guide"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">📚</span>
                <span className="text-base">{translations.travelGuide}</span>
              </a>
              <a
                href="/faq"
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-semibold"
              >
                <span className="text-2xl">❓</span>
                <span className="text-base">{translations.faq}</span>
              </a>
            </nav>

            {/* ============================================
                TEMPORARILY HIDDEN - Language Selector
                Uncomment when ready to launch multi-language support
                ============================================ */}
            {/* <div className="mx-6 border-t border-gray-200" />
            <div className="px-4 py-6">
              <div className="px-4 mb-3">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Language
                </span>
              </div>
              <div className="space-y-1">
                {(Object.keys(languages) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      language === lang
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{languages[lang].flag}</span>
                    <span className="font-semibold text-base flex-1 text-left">
                      {languages[lang].name}
                    </span>
                    {language === lang && (
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
            </div> */}

            {/* Auth Buttons - Only for non-authenticated users */}
            {!userId && (
              <div className="px-4 py-6 space-y-3">
                <button
                  onClick={handleSignIn}
                  className="w-full px-6 py-3.5 text-gray-700 hover:text-primary-600 font-bold text-base rounded-xl transition-all duration-200 hover:bg-primary-50 border-2 border-gray-300 hover:border-primary-500"
                >
                  {translations.signin}
                </button>
                <button
                  onClick={handleSignUp}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 font-bold text-base rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    boxShadow: '0 4px 14px rgba(214, 58, 53, 0.25)',
                  }}
                >
                  {translations.signup}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
