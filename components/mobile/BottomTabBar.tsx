'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { zIndex } from '@/lib/design-system';
import type { HeaderTranslations } from '@/lib/i18n/types';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/** Bottom nav height in pixels */
const NAV_HEIGHT = 56;

/** Minimum touch target size (WCAG AA) */
const MIN_TOUCH_TARGET = 44;

/** Scroll threshold before hiding (px) */
const SCROLL_HIDE_THRESHOLD = 150;

/** Scroll delta to trigger hide/show (px) */
const SCROLL_DELTA_THRESHOLD = 8;

/** Debounce delay for scroll events (ms) */
const SCROLL_DEBOUNCE = 50;

// ============================================================================
// TYPES
// ============================================================================

interface BottomTabBarProps {
  translations: HeaderTranslations;
  onMoreClick: () => void;
}

interface Tab {
  id: string;
  icon: string;
  iconType: 'emoji' | 'image';
  label: string;
  href?: string;
  onClick?: () => void;
  /** Exact match required for active state */
  exactMatch?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * BottomTabBar - Premium Mobile Navigation
 *
 * Features:
 * - Next.js router for smooth SPA navigation (no page reloads)
 * - Smart scroll hide/show with debouncing
 * - Safe-area insets for notched devices
 * - Touch-optimized 44px+ hit areas
 * - Haptic feedback on interaction
 * - Spring physics animations
 * - Keyboard-aware (hides when keyboard opens)
 * - Chat-aware (stays visible when chat is open)
 * - PWA-ready with standalone mode detection
 * - Route-synchronized active states
 */
export function BottomTabBar({ translations, onMoreClick }: BottomTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // State
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // Refs
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialViewportHeight = useRef(0);

  // ============================================================================
  // TAB CONFIGURATION
  // ============================================================================

  const tabs: Tab[] = useMemo(() => [
    {
      id: 'home',
      icon: '/icon-72.png',
      iconType: 'image',
      label: 'Fly2Any',
      href: '/',
      exactMatch: true, // Only active on exact "/" path
    },
    {
      id: 'flights',
      icon: '✈️',
      iconType: 'emoji',
      label: translations.flights || 'Flights',
      href: '/flights',
    },
    {
      id: 'hotels',
      icon: '🏨',
      iconType: 'emoji',
      label: translations.hotels || 'Hotels',
      href: '/hotels',
    },
    {
      id: 'chat',
      icon: '💬',
      iconType: 'emoji',
      label: 'Chat',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('openChatAssistant'));
      },
    },
    {
      id: 'more',
      icon: '☰',
      iconType: 'emoji',
      label: 'More',
      onClick: onMoreClick,
    },
  ], [translations.flights, translations.hotels, onMoreClick]);

  // ============================================================================
  // ROUTE DETECTION & ACTIVE STATE
  // ============================================================================

  useEffect(() => {
    if (!pathname) return;

    // Determine active tab based on current route
    let newActiveTab = 'home';

    for (const tab of tabs) {
      if (!tab.href) continue;

      if (tab.exactMatch) {
        // Exact match for home
        if (pathname === tab.href) {
          newActiveTab = tab.id;
          break;
        }
      } else {
        // Prefix match for other tabs
        if (pathname.startsWith(tab.href) && tab.href !== '/') {
          newActiveTab = tab.id;
          break;
        }
      }
    }

    setActiveTab(newActiveTab);
  }, [pathname, tabs]);

  // ============================================================================
  // PWA DETECTION
  // ============================================================================

  useEffect(() => {
    // Detect if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  // ============================================================================
  // KEYBOARD DETECTION
  // ============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    initialViewportHeight.current = viewport.height;

    const handleResize = () => {
      const heightDiff = initialViewportHeight.current - viewport.height;
      // Keyboard typically takes 150px+ of screen
      setIsKeyboardOpen(heightDiff > 150);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // CHAT LISTENER
  // ============================================================================

  useEffect(() => {
    const handleChatOpen = () => setIsChatOpen(true);
    const handleChatClose = () => setIsChatOpen(false);

    window.addEventListener('openChatAssistant', handleChatOpen);
    window.addEventListener('closeChatAssistant', handleChatClose);

    return () => {
      window.removeEventListener('openChatAssistant', handleChatOpen);
      window.removeEventListener('closeChatAssistant', handleChatClose);
    };
  }, []);

  // ============================================================================
  // SCROLL BEHAVIOR (Smart Hide/Show)
  // ============================================================================

  useEffect(() => {
    // Never hide when keyboard or chat is open
    if (isKeyboardOpen || isChatOpen) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Debounce scroll handling
      scrollTimeout.current = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY.current;
        const absScrollDelta = Math.abs(scrollDelta);

        // Ignore micro-scrolls (prevents jitter)
        if (absScrollDelta < 3) return;

        // Always show near top
        if (currentScrollY < 80) {
          setIsVisible(true);
        }
        // Hide when scrolling down past threshold
        else if (scrollDelta > SCROLL_DELTA_THRESHOLD && currentScrollY > SCROLL_HIDE_THRESHOLD) {
          setIsVisible(false);
        }
        // Show when scrolling up with intent
        else if (scrollDelta < -SCROLL_DELTA_THRESHOLD) {
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
      }, SCROLL_DEBOUNCE);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [isKeyboardOpen, isChatOpen]);

  // ============================================================================
  // HAPTIC FEEDBACK
  // ============================================================================

  const triggerHaptic = useCallback((intensity: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity === 'light' ? 5 : 12);
    }
  }, []);

  // ============================================================================
  // TAB CLICK HANDLER
  // ============================================================================

  const handleTabClick = useCallback((tab: Tab) => {
    triggerHaptic('medium');
    setPressedTab(tab.id);

    // Reset pressed state
    setTimeout(() => setPressedTab(null), 120);

    if (tab.onClick) {
      tab.onClick();
    } else if (tab.href) {
      // Use Next.js router for smooth SPA navigation
      router.push(tab.href);
    }
  }, [router, triggerHaptic]);

  // ============================================================================
  // TOUCH HANDLERS
  // ============================================================================

  const handleTouchStart = useCallback((tabId: string) => {
    triggerHaptic('light');
    setPressedTab(tabId);
  }, [triggerHaptic]);

  const handleTouchEnd = useCallback(() => {
    setPressedTab(null);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div
        className="md:hidden"
        style={{
          height: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
        }}
        aria-hidden="true"
      />

      {/* Navigation Bar */}
      <motion.nav
        initial={false}
        animate={{
          y: isVisible ? 0 : NAV_HEIGHT + 40,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 32,
          mass: 0.9,
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 w-full"
        style={{
          zIndex: zIndex.FIXED + 10, // Slightly above other fixed elements
          height: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 -1px 12px rgba(0,0,0,0.04), 0 -4px 24px rgba(0,0,0,0.02)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Tab Container */}
        <div
          className="flex items-stretch justify-around w-full"
          style={{ height: `${NAV_HEIGHT}px` }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isPressed = pressedTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                onTouchStart={() => handleTouchStart(tab.id)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                whileTap={{ scale: 0.92 }}
                animate={{
                  scale: isPressed ? 0.94 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 28,
                }}
                className={`
                  flex-1 flex flex-col items-center justify-center
                  relative touch-manipulation select-none
                  transition-colors duration-150
                  ${isActive ? 'text-primary-600' : 'text-neutral-500'}
                `}
                style={{
                  minWidth: `${MIN_TOUCH_TARGET}px`,
                  minHeight: `${MIN_TOUCH_TARGET}px`,
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Indicator Pill */}
                <motion.span
                  initial={false}
                  animate={{
                    scaleX: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 28,
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
                  style={{ transformOrigin: 'center' }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.12 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 22,
                  }}
                  className="relative"
                >
                  {tab.iconType === 'image' ? (
                    <div className="relative w-[24px] h-[24px]">
                      <Image
                        src={tab.icon}
                        alt=""
                        fill
                        sizes="24px"
                        className="object-contain"
                        priority
                      />
                    </div>
                  ) : (
                    <span
                      className="text-[22px] leading-none"
                      role="img"
                      aria-hidden="true"
                    >
                      {tab.icon}
                    </span>
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    fontWeight: isActive ? 700 : 500,
                  }}
                  className={`
                    text-[10px] leading-tight mt-0.5 tracking-tight
                    ${isActive ? 'text-primary-600' : 'text-neutral-500'}
                  `}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BottomTabBar;

/** Export nav height for use in other components */
export const BOTTOM_NAV_HEIGHT = NAV_HEIGHT;
