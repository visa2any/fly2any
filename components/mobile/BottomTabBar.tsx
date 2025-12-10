'use client';

import { usePathname } from 'next/navigation';
import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { zIndex } from '@/lib/design-system';
import type { HeaderTranslations } from '@/lib/i18n/types';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';

interface BottomTabBarProps {
  translations: HeaderTranslations;
  onMoreClick: () => void;
}

interface Tab {
  id: string;
  icon: string;
  iconType?: 'emoji' | 'image';  // 'emoji' for text emoji, 'image' for logo
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Bottom Tab Bar for Mobile Navigation - ULTRA HIGH UX
 *
 * Fixed bottom navigation bar with 5 primary tabs.
 * Only visible on mobile devices (<md breakpoint).
 *
 * Features:
 * - Fixed positioning at bottom of screen
 * - 5 tabs: Home, Flights, Hotels, Chat, More
 * - Active state indication with animated pill
 * - Safe area padding for notched devices
 * - Backdrop blur for glass effect
 * - WCAG compliant tap targets (60px min height)
 * - Hide on scroll down, show on scroll up
 * - Haptic feedback on touch
 * - Spring physics animations
 * - Touch-optimized larger targets
 */
export function BottomTabBar({ translations, onMoreClick }: BottomTabBarProps) {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();
  const [isVisible, setIsVisible] = useState(true);
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const lastScrollY = useRef(0);

  // Detect if keyboard is open (visual viewport shrinks on mobile)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Listen for chat open/close events
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

  // Detect keyboard open/close via visual viewport resize
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;

    const handleResize = () => {
      // Keyboard is likely open if viewport shrinks significantly (>150px)
      const heightDiff = initialHeight - viewport.height;
      setIsKeyboardOpen(heightDiff > 150);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  // Smart hide/show - NEVER hide when keyboard or chat is open
  useEffect(() => {
    // Always show when keyboard or chat is open
    if (isKeyboardOpen || isChatOpen) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isNearTop = currentScrollY < 100;
      const isScrollingDown = currentScrollY > lastScrollY.current;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

      // Ignore small scroll movements (prevents jitter)
      if (scrollDelta < 5) return;

      // Always show near top of page
      if (isNearTop) {
        setIsVisible(true);
      } else if (isScrollingDown && currentScrollY > 200 && scrollDelta > 10) {
        // Hide when scrolling down fast past threshold
        setIsVisible(false);
      } else if (!isScrollingDown && scrollDelta > 8) {
        // Show when scrolling up with intent
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isKeyboardOpen, isChatOpen]);

  // Haptic feedback
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity === 'light' ? 8 : 15);
    }
  }, []);

  // Define tabs with translations
  const tabs: Tab[] = [
    {
      id: 'home',
      icon: '/icon-72.png',  // Fly2Any orange logo
      iconType: 'image',
      label: 'Fly2Any',
      href: '/',
    },
    {
      id: 'flights',
      icon: '✈️',
      label: translations.flights,
      href: '/flights',
    },
    {
      id: 'hotels',
      icon: '🏨',
      label: translations.hotels,
      href: '/hotels',
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Chat',
      onClick: () => {
        const e = new CustomEvent('openChatAssistant');
        window.dispatchEvent(e);
      },
    },
    {
      id: 'more',
      icon: '☰',
      label: 'More',
      onClick: onMoreClick,
    },
  ];

  // Check if tab is active
  const isTabActive = (tab: Tab): boolean => {
    if (!pathname) return false;

    if (tab.id === 'more') {
      return false; // More tab is never "active"
    }

    if (tab.href) {
      return pathname.startsWith(tab.href);
    }

    return false;
  };

  // Handle tab click with haptic feedback
  const handleTabClick = useCallback((tab: Tab) => {
    triggerHaptic('medium');
    setPressedTab(tab.id);

    // Reset pressed state after animation
    setTimeout(() => setPressedTab(null), 150);

    if (tab.onClick) {
      tab.onClick();
    } else if (tab.href) {
      // Use router for smoother navigation
      window.location.href = tab.href;
    }
  }, [triggerHaptic]);

  // Handle touch start for immediate feedback
  const handleTouchStart = useCallback((tabId: string) => {
    triggerHaptic('light');
    setPressedTab(tabId);
  }, [triggerHaptic]);

  const handleTouchEnd = useCallback(() => {
    setPressedTab(null);
  }, []);

  return (
    <motion.nav
      initial={false}
      animate={{
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200/60"
      style={{
        zIndex: zIndex.FIXED,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(200%)',
        WebkitBackdropFilter: 'blur(20px) saturate(200%)',
        boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
          <div className="flex items-center justify-around h-[60px]">
            {tabs.map((tab) => {
              const isActive = isTabActive(tab);
              const isPressed = pressedTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  onTouchStart={() => handleTouchStart(tab.id)}
                  onTouchEnd={handleTouchEnd}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale: isPressed ? 0.92 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 25,
                  }}
                  className={`flex-1 flex flex-col items-center justify-center h-full min-w-[64px] relative touch-manipulation select-none ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-neutral-500'
                  }`}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {/* Active indicator - animated brand pill */}
                  <motion.span
                    initial={false}
                    animate={{
                      scaleX: isActive ? 1 : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-gradient-to-r from-primary-500 to-primary-400 rounded-full origin-center"
                    aria-hidden="true"
                  />

                  {/* Icon - larger 26px for better touch */}
                  {tab.iconType === 'image' ? (
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="relative w-[26px] h-[26px] mb-0.5"
                    >
                      <Image
                        src={tab.icon}
                        alt={tab.label}
                        fill
                        sizes="26px"
                        className="object-contain"
                        priority
                      />
                    </motion.div>
                  ) : (
                    <motion.span
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="text-[24px] leading-none mb-0.5"
                    >
                      {tab.icon}
                    </motion.span>
                  )}

                  {/* Label - 10px ultra compact */}
                  <span className={`text-[10px] leading-tight tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
    </motion.nav>
  );
}
