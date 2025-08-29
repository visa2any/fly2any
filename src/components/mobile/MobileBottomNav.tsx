'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useMobileUtils } from '@/hooks/useMobileDetection';

// Navigation Item Interface
interface NavItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
  path: string;
  badge?: number;
  requiresAuth?: boolean;
}

// Props Interface
interface MobileBottomNavProps {
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
  customItems?: NavItem[];
  className?: string;
}

// Default Navigation Items
const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: '🏠',
    activeIcon: '🏠',
    path: '/'
  },
  {
    id: 'flights',
    label: 'Voos',
    icon: '✈️',
    activeIcon: '✈️',
    path: '/flights'
  },
  {
    id: 'hotels',
    label: 'Hotéis',
    icon: '🏨',
    activeIcon: '🏨',
    path: '/hoteis'
  },
  {
    id: 'account',
    label: 'Conta',
    icon: '👤',
    activeIcon: '👤',
    path: '/account',
    requiresAuth: true
  },
  {
    id: 'more',
    label: 'Menu',
    icon: '☰',
    activeIcon: '☰',
    path: '/menu'
  }
];

export default function MobileBottomNav({
  isAuthenticated = false,
  onAuthRequired,
  customItems,
  className = ''
}: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isMobileDevice,
    getTouchTargetSize,
    screenWidth,
    deviceOrientation
  } = useMobileUtils();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeItem, setActiveItem] = useState<string>('');
  const [rippleEffect, setRippleEffect] = useState<{x: number, y: number, show: boolean}>({ 
    x: 0, 
    y: 0, 
    show: false 
  });

  const navItems = customItems || DEFAULT_NAV_ITEMS;
  const touchTargetSize = getTouchTargetSize();

  // Auto-hide navigation on scroll
  useEffect(() => {
    if (!isMobileDevice) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobileDevice]);

  // Update active item based on current path
  useEffect(() => {
    const currentItem = navItems.find(item => 
      pathname === item.path || 
      (item.path !== '/' && pathname.startsWith(item.path))
    );
    setActiveItem(currentItem?.id || '');
  }, [pathname, navItems]);

  // Don't render on non-mobile devices
  if (!isMobileDevice) {
    return null;
  }

  const handleNavClick = (item: NavItem, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create ripple effect
    setRippleEffect({ x, y, show: true });
    setTimeout(() => setRippleEffect((prev: any) => ({ ...prev, show: false })), 300);

    // Handle authentication
    if (item.requiresAuth && !isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
        return;
      }
    }

    // Navigate
    if (pathname !== item.path) {
      router.push(item.path);
    }

    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const getItemWidth = () => {
    const navItemCount = navItems.length;
    return `${100 / navItemCount}%`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`
            fixed bottom-0 left-0 right-0 z-50
            bg-white/95 backdrop-blur-xl
            border-t border-gray-200/50
            shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
            safe-area-inset-bottom
            ${className}
          `}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Navigation Items */}
          <div className="flex items-center justify-around relative">
            {navItems.map((item) => {
              const isActive = activeItem === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleNavClick(item, e)}
                  className={`
                    relative flex flex-col items-center justify-center
                    py-2 px-1 overflow-hidden
                    transition-all duration-200
                    ${isActive ? 'text-blue-600' : 'text-gray-600'}
                    active:text-blue-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-inset
                    rounded-lg
                  `}
                  style={{
                    width: getItemWidth(),
                    minHeight: Math.max(touchTargetSize, 64),
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Ripple Effect */}
                  <AnimatePresence>
                    {rippleEffect.show && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bg-blue-500/20 rounded-full pointer-events-none"
                        style={{
                          left: rippleEffect.x - 10,
                          top: rippleEffect.y - 10,
                          width: 20,
                          height: 20,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Active Indicator */}
                  <motion.div
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                  />

                  {/* Icon Container */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative mb-1"
                  >
                    <span className="text-2xl">
                      {isActive ? item.activeIcon : item.icon}
                    </span>
                    
                    {/* Badge */}
                    {item.badge && item.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={{
                      color: isActive ? '#2563eb' : '#6b7280',
                      fontWeight: isActive ? 600 : 400,
                    }}
                    className="text-xs leading-tight text-center"
                    style={{
                      fontSize: screenWidth < 360 ? '10px' : '12px'
                    }}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>

          {/* Floating Action Button (Optional) */}
          {/* You can add a FAB in the center if needed */}
          
          {/* Bottom Safe Area */}
          <div 
            className="h-0"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          />
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

// Utility function to hide bottom nav on specific pages
export const useBottomNavVisibility = (hiddenPaths: string[] = []) => {
  const pathname = usePathname();
  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path));
  return !shouldHide;
};

// Custom hook for managing bottom nav state
export const useBottomNav = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);
  const toggle = () => setIsVisible((prev: any) => !prev);

  return {
    isVisible,
    show,
    hide,
    toggle
  };
};