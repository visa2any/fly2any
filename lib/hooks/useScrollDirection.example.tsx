/**
 * Integration Examples for useScrollDirection Hook
 *
 * This file contains ready-to-use examples for integrating the scroll direction hook
 * into mobile search bars and other UI components.
 */

'use client';

import { useScrollDirection, useScrollMinimize, useScrollVisibility } from './useScrollDirection';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, X } from 'lucide-react';
import { memo } from 'react';

// ============================================================================
// EXAMPLE 1: Mobile Search Bar with Smart Scroll Behavior
// ============================================================================

interface SearchSummary {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

interface MobileSearchBarProps {
  searchSummary: SearchSummary;
  onExpand?: () => void;
  onSearch?: () => void;
}

/**
 * Mobile-optimized search bar that:
 * - Shows full bar (80px) at top
 * - Shrinks to mini bar (50px) when scrolling down
 * - Expands back to full when scrolling up
 * - Sticky positioned when minimized
 */
export const MobileSearchBarExample = memo(function MobileSearchBarExample({
  searchSummary,
  onExpand,
  onSearch,
}: MobileSearchBarProps) {
  const { scrollDirection, isAtTop, scrollY } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
    topThreshold: 50,
  });

  // Determine UI state
  const isScrollingDown = scrollDirection === 'down' && !isAtTop;
  const showMiniBar = isScrollingDown;

  return (
    <div className="md:hidden"> {/* Mobile only */}
      <motion.div
        className={`
          bg-white border-b border-gray-200
          transition-all duration-300 ease-out
          ${showMiniBar ? 'sticky top-0 z-50 shadow-md' : 'relative'}
        `}
        style={{
          // GPU-accelerated transform
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
        animate={{
          height: showMiniBar ? 50 : 80,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {showMiniBar ? (
            // Mini Bar - Compact Summary
            <motion.div
              key="mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full flex items-center gap-2 px-4"
            >
              <Search className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <button
                onClick={onExpand}
                className="flex-1 text-left flex items-center gap-2 min-w-0"
              >
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {searchSummary.origin} → {searchSummary.destination}
                </span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {searchSummary.date}
                </span>
              </button>
              <button
                onClick={onSearch}
                className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </motion.div>
          ) : (
            // Full Bar - Expanded View
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col justify-center px-4 py-3"
            >
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span className="text-base font-semibold text-gray-900">
                  {searchSummary.origin} → {searchSummary.destination}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{searchSummary.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{searchSummary.passengers} passenger{searchSummary.passengers > 1 ? 's' : ''}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50">
          <div>Direction: {scrollDirection || 'null'}</div>
          <div>Scroll Y: {scrollY}px</div>
          <div>At Top: {isAtTop ? 'Yes' : 'No'}</div>
          <div>Mini Bar: {showMiniBar ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// EXAMPLE 2: Simplified Mini Search Bar (using useScrollMinimize)
// ============================================================================

export function SimpleMiniSearchBar({ onSearch }: { onSearch: () => void }) {
  const shouldMinimize = useScrollMinimize({ threshold: 50 });

  return (
    <div className="md:hidden">
      <div
        className={`
          bg-white transition-all duration-300
          ${shouldMinimize ? 'sticky top-0 z-50 shadow-md h-12' : 'relative h-16'}
        `}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className={`text-primary-600 ${shouldMinimize ? 'w-4 h-4' : 'w-5 h-5'}`} />
            <span className={`font-semibold ${shouldMinimize ? 'text-sm' : 'text-base'}`}>
              Search Flights
            </span>
          </div>
          <button
            onClick={onSearch}
            className={`
              bg-primary-600 text-white font-medium rounded-full
              hover:bg-primary-700 transition-colors
              ${shouldMinimize ? 'px-4 py-1.5 text-sm' : 'px-6 py-2 text-base'}
            `}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Floating Action Button with Scroll Visibility
// ============================================================================

export function FloatingActionButton({ onClick }: { onClick: () => void }) {
  const isVisible = useScrollVisibility({
    threshold: 100,
    mobileOnly: false, // Works on all devices
  });

  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-20 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      aria-label="Scroll to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  );
}

// ============================================================================
// EXAMPLE 4: Advanced - Multi-State Search Bar
// ============================================================================

type SearchBarState = 'full' | 'collapsed' | 'mini';

export function AdvancedMobileSearchBar({
  searchSummary,
  onExpand,
  onCollapse,
  onSearch,
}: MobileSearchBarProps & { onCollapse?: () => void }) {
  const { scrollDirection, isAtTop, scrollY } = useScrollDirection({
    threshold: 50,
    mobileOnly: true,
  });

  // Determine state based on scroll position and direction
  const getState = (): SearchBarState => {
    if (isAtTop) return 'full';
    if (scrollDirection === 'down' && scrollY > 200) return 'mini';
    return 'collapsed';
  };

  const state = getState();

  // Height mapping
  const heights = {
    full: 160,      // Full search form
    collapsed: 80,  // Collapsed summary
    mini: 50,       // Mini sticky bar
  };

  return (
    <div className="md:hidden">
      <motion.div
        className={`
          bg-white border-b border-gray-200
          transition-all duration-300 ease-out
          ${state === 'mini' ? 'sticky top-0 z-50 shadow-md' : 'relative'}
        `}
        animate={{ height: heights[state] }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <div className="h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {state === 'full' && (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full p-4"
              >
                <div className="space-y-3">
                  <div className="text-lg font-bold text-gray-900">Find Your Flight</div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <input
                      type="text"
                      placeholder="From - To"
                      className="flex-1 bg-transparent outline-none"
                      defaultValue={`${searchSummary.origin} - ${searchSummary.destination}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <input type="text" placeholder="Date" className="flex-1 bg-transparent outline-none text-sm" defaultValue={searchSummary.date} />
                    </div>
                    <div className="flex-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-600" />
                      <input type="text" placeholder="Passengers" className="flex-1 bg-transparent outline-none text-sm" defaultValue={searchSummary.passengers.toString()} />
                    </div>
                  </div>
                  <button
                    onClick={onSearch}
                    className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Search Flights
                  </button>
                </div>
              </motion.div>
            )}

            {state === 'collapsed' && (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {searchSummary.origin} → {searchSummary.destination}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {searchSummary.date} · {searchSummary.passengers} passenger{searchSummary.passengers > 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={onExpand}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            )}

            {state === 'mini' && (
              <motion.div
                key="mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full px-4 flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-primary-600" />
                <button onClick={onExpand} className="flex-1 text-left">
                  <span className="text-sm font-semibold text-gray-900 truncate block">
                    {searchSummary.origin} → {searchSummary.destination}
                  </span>
                </button>
                <button
                  onClick={onSearch}
                  className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700"
                >
                  Go
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Performance-Optimized Search Bar (Minimal Re-renders)
// ============================================================================

export const PerformanceOptimizedSearchBar = memo(function PerformanceOptimizedSearchBar({
  searchSummary,
}: {
  searchSummary: SearchSummary;
}) {
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
  });

  // Memoize the mini bar state to prevent unnecessary re-renders
  const showMini = scrollDirection === 'down' && !isAtTop;

  return (
    <div
      className={`
        md:hidden bg-white border-b border-gray-200
        transition-all duration-300
        ${showMini ? 'sticky top-0 z-50 shadow-md' : 'relative'}
      `}
      style={{
        height: showMini ? '50px' : '80px',
        transform: 'translateZ(0)', // Force GPU acceleration
        willChange: 'transform',
      }}
    >
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search className={`text-primary-600 flex-shrink-0 ${showMini ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <span className={`font-semibold text-gray-900 truncate ${showMini ? 'text-sm' : 'text-base'}`}>
            {searchSummary.origin} → {searchSummary.destination}
          </span>
        </div>
        {showMini && (
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {searchSummary.date}
          </span>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// EXAMPLE 6: Integration with CollapsibleSearchBar
// ============================================================================

/**
 * Wrapper that combines CollapsibleSearchBar with scroll-aware behavior
 */
export function ScrollAwareCollapsibleSearchBar({
  searchSummary,
  children,
}: {
  searchSummary: SearchSummary;
  children: React.ReactNode;
}) {
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    mobileOnly: true,
  });

  // Auto-collapse when scrolling down (not at top)
  const shouldAutoCollapse = scrollDirection === 'down' && !isAtTop;

  return (
    <div className="md:hidden">
      <motion.div
        className={`
          bg-white rounded-2xl shadow-lg
          ${shouldAutoCollapse ? 'sticky top-4 z-50' : 'relative'}
        `}
        animate={{
          scale: shouldAutoCollapse ? 0.95 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {shouldAutoCollapse ? (
          // Show mini summary when scrolled
          <div className="p-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold flex-1 truncate">
              {searchSummary.origin} → {searchSummary.destination}
            </span>
            <button className="text-xs text-primary-600 font-medium">
              Expand
            </button>
          </div>
        ) : (
          // Show full form at top
          children
        )}
      </motion.div>
    </div>
  );
}
