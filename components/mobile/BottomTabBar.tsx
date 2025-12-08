'use client';

import { usePathname } from 'next/navigation';
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
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Bottom Tab Bar for Mobile Navigation
 *
 * Fixed bottom navigation bar with 4 primary tabs.
 * Only visible on mobile devices (<md breakpoint).
 *
 * Features:
 * - Fixed positioning at bottom of screen
 * - 4 tabs: Flights, Hotels, Cars, More
 * - Active state indication
 * - Safe area padding for notched devices
 * - Backdrop blur for glass effect
 * - WCAG compliant tap targets (56px min height)
 */
export function BottomTabBar({ translations, onMoreClick }: BottomTabBarProps) {
  const pathname = usePathname();

  // Scroll direction detection for auto-hide behavior (Phase 8 Track 2A.2)
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true, // Only auto-hide on mobile
  });

  // Define tabs with translations
  const tabs: Tab[] = [
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

  // Handle tab click
  const handleTabClick = (tab: Tab) => {
    if (tab.onClick) {
      tab.onClick();
    } else if (tab.href) {
      window.location.href = tab.href;
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200"
      style={{
        zIndex: zIndex.FIXED,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.08)',
        // Safe area padding for devices with notches/home indicators
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        // Phase 8 Track 2A.2: Auto-hide on scroll down (mobile only, 56px savings)
        transform: scrollDirection === 'down' && !isAtTop
          ? 'translateY(100%)' // Hide by moving down
          : 'translateY(0)',    // Show at normal position
        transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        willChange: 'transform',
      }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] py-2 px-2 transition-all duration-200 relative ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator - top border */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full"
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span className={`text-2xl mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>

              {/* Label */}
              <span
                className={`text-xs font-semibold transition-all duration-200 ${
                  isActive ? 'font-bold' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
