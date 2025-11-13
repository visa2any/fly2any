'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { X, MapPin, Calendar, Users, Search, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

interface MobileHomeSearchWrapperProps {
  /** Origin airport code(s) - can be single "JFK" or comma-separated "JFK,EWR,LGA" */
  origin?: string;
  /** Destination airport code(s) - can be single "LAX" or comma-separated "LAX,SNA,ONT" */
  destination?: string;
  /** Departure date in ISO format */
  departureDate?: string;
  /** Return date in ISO format */
  returnDate?: string;
  /** Passenger counts */
  passengers?: PassengerCounts;
  /** Cabin class */
  cabinClass?: 'economy' | 'premium' | 'business' | 'first';
  /** Language preference */
  lang?: 'en' | 'pt' | 'es';
  /** Default service tab (flights, hotels, cars, tours, activities, packages, insurance) */
  defaultService?: 'flights' | 'hotels' | 'cars' | 'tours' | 'activities' | 'packages' | 'insurance';
}

type ViewState = 'collapsed' | 'expanded' | 'hidden';

/**
 * MobileHomeSearchWrapper Component
 *
 * A mobile-optimized wrapper for EnhancedSearchBar that provides:
 * - Desktop (>768px): Renders EnhancedSearchBar unchanged
 * - Mobile (≤768px): Collapsible interface with smart scroll behavior
 *
 * Mobile States:
 * - Collapsed (60-80px): Compact summary showing current search params
 * - Expanded (auto-height): Full EnhancedSearchBar with all features
 * - Hidden: Completely hidden when scrolling down (better UX, less clutter)
 *
 * Features:
 * - Zero feature loss - all EnhancedSearchBar functionality preserved
 * - Smooth spring physics animations via Framer Motion
 * - Auto-hide on scroll down, auto-show on scroll up
 * - 100% width on mobile, no side padding waste
 * - ARIA labels for accessibility
 * - Haptic feedback on touch devices (when available)
 */
export function MobileHomeSearchWrapper({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = { adults: 1, children: 0, infants: 0 },
  cabinClass,
  lang = 'en',
  defaultService = 'flights',
}: MobileHomeSearchWrapperProps) {
  // View state management
  const [viewState, setViewState] = useState<ViewState>('collapsed');
  const [isMobile, setIsMobile] = useState(false);

  // Scroll tracking
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Calculate total passengers
  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  // Format dates for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '--';
    try {
      return format(new Date(dateStr), 'MMM d');
    } catch {
      return '--';
    }
  };

  // Format airport codes for display (extract first code if comma-separated)
  const formatAirportCode = (codes: string | undefined) => {
    if (!codes) return '';
    return codes.split(',')[0].trim();
  };

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On desktop, ensure we're showing the full search bar
      if (!mobile && viewState !== 'expanded') {
        setViewState('expanded');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewState]);

  // Scroll tracking with direction detection - Auto-hide/show behavior
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';

      setScrollY(currentScrollY);
      setScrollDirection(direction);
      lastScrollY.current = currentScrollY;

      // HIDE completely when scrolling down past threshold (better UX)
      if (direction === 'down' && currentScrollY > 50 && viewState === 'collapsed') {
        setViewState('hidden');
      }
      // SHOW when scrolling back up OR near top
      else if ((direction === 'up' || currentScrollY < 30) && viewState === 'hidden') {
        setViewState('collapsed');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, viewState]);

  // Haptic feedback (if available on device)
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // 10ms subtle vibration
    }
  }, []);

  // Handle expand/collapse actions
  const handleExpand = useCallback(() => {
    triggerHaptic();
    setViewState('expanded');
  }, [triggerHaptic]);

  const handleCollapse = useCallback(() => {
    triggerHaptic();
    setViewState('collapsed');
  }, [triggerHaptic]);

  // Spring animation configuration
  const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  };

  // If not mobile, render EnhancedSearchBar directly (desktop behavior)
  if (!isMobile) {
    return <EnhancedSearchBar lang={lang} defaultService={defaultService} />;
  }

  // Mobile rendering with three states
  return (
    <div ref={wrapperRef} className="mobile-search-wrapper md:hidden">
      <AnimatePresence mode="wait">
        {/* COLLAPSED STATE - Compact summary bar (60-80px) */}
        {viewState === 'collapsed' && (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={springConfig}
            className="w-full px-4 py-3"
          >
            <button
              onClick={handleExpand}
              className="w-full min-h-[56px] sm:min-h-[60px] bg-white/95 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/80 active:scale-[0.98] p-3 sm:p-4"
              aria-label="Expand flight search form"
              aria-expanded="false"
              type="button"
            >
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {/* Route */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base font-semibold text-gray-900 flex-1 text-left leading-tight">
                    {formatAirportCode(origin) || 'From'} → {formatAirportCode(destination) || 'To'}
                  </span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" aria-hidden="true" />
                </div>

                {/* Dates & Passengers */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" aria-hidden="true" />
                    <span className="text-[11px] sm:text-xs text-gray-600">
                      {formatDate(departureDate)}
                      {returnDate && <> - {formatDate(returnDate)}</>}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" aria-hidden="true" />
                    <span className="text-[11px] sm:text-xs text-gray-600">{totalPassengers} pax</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" aria-hidden="true" />
                    <span className="text-[11px] sm:text-xs font-medium text-primary-600">Search</span>
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* EXPANDED STATE - Full EnhancedSearchBar with close button */}
        {viewState === 'expanded' && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springConfig}
            className="w-full relative"
          >
            {/* Close Button - Positioned absolutely over the search bar with improved touch target */}
            <button
              onClick={handleCollapse}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 min-w-[48px] min-h-[48px] flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 border border-gray-200/80 active:scale-90"
              aria-label="Collapse search form"
              aria-expanded="true"
              type="button"
            >
              <X className="w-5 h-5 text-gray-700 stroke-[2.5]" aria-hidden="true" />
            </button>

            {/* Full EnhancedSearchBar - All features preserved */}
            <div ref={searchBarRef}>
              <EnhancedSearchBar
                origin={origin}
                destination={destination}
                departureDate={departureDate}
                returnDate={returnDate}
                passengers={passengers}
                cabinClass={cabinClass}
                lang={lang}
                defaultService={defaultService}
              />
            </div>
          </motion.div>
        )}

        {/* HIDDEN STATE - Completely hidden when scrolling down (no UI rendered) */}
        {/* Search bar reappears smoothly when scrolling back up */}
      </AnimatePresence>

      {/* Styles scoped to mobile wrapper */}
      <style jsx>{`
        .mobile-search-wrapper {
          width: 100%;
        }

        /* Ensure mobile-only at media query level */
        @media (min-width: 769px) {
          .mobile-search-wrapper {
            display: none;
          }
        }

        /* Smooth transitions for touch interactions */
        @media (hover: none) and (pointer: coarse) {
          button {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.05);
          }
        }

        /* Accessibility: Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default MobileHomeSearchWrapper;
