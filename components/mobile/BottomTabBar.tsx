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
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200/80"
      style={{
        zIndex: zIndex.FIXED,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: '0 -1px 8px rgba(0, 0, 0, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 px-1 transition-colors duration-150 relative ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 active:bg-gray-100'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary-600 rounded-full"
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span className={`text-xl mb-0.5 ${isActive ? 'scale-105' : ''}`}>
                {tab.icon}
              </span>

              {/* Label */}
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
