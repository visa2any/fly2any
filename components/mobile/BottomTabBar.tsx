'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
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
 * Bottom Tab Bar for Mobile Navigation
 *
 * Fixed bottom navigation bar with 5 primary tabs.
 * Only visible on mobile devices (<md breakpoint).
 *
 * Features:
 * - Fixed positioning at bottom of screen
 * - 5 tabs: Home, Flights, Hotels, Chat, More
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
      <div className="flex items-center justify-around h-[56px]">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-w-[64px] transition-all duration-200 relative ${
                isActive
                  ? 'text-primary-500'
                  : 'text-neutral-500 active:bg-neutral-100'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator - brand red pill */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary-500 rounded-full"
                  aria-hidden="true"
                />
              )}

              {/* Icon - 24px grid */}
              {tab.iconType === 'image' ? (
                <div className={`relative w-[24px] h-[24px] mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    fill
                    sizes="24px"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className={`text-[22px] leading-none mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
              )}

              {/* Label - 11px for readability */}
              <span className={`text-[11px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
