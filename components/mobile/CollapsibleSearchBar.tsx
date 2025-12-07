'use client';

import { useState, useEffect, cloneElement, isValidElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';

export interface SearchSummary {
  origin: string;
  destination: string;
  departDate: Date | null;
  returnDate: Date | null;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  tripType: 'roundtrip' | 'oneway';
}

export interface CollapsibleSearchBarProps {
  /** Current search parameters to display in collapsed state */
  searchSummary: SearchSummary;
  /** The full search form component to show when expanded */
  children: React.ReactNode;
  /** Initial collapsed state (default: false) */
  defaultCollapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Show on mobile only (default: true) */
  mobileOnly?: boolean;
  /** Callback when search is submitted (triggers auto-collapse on mobile) */
  onSearch?: () => void;
}

/**
 * CollapsibleSearchBar Component
 *
 * Provides a collapsible search interface optimized for mobile:
 * - Expanded: Shows full search form (~320px height)
 * - Collapsed: Shows compact summary bar (~50px height)
 * - Net savings: ~270px of vertical space when collapsed
 *
 * Usage:
 * ```tsx
 * <CollapsibleSearchBar
 *   searchSummary={{
 *     origin: "JFK",
 *     destination: "LAX",
 *     departDate: new Date(),
 *     returnDate: new Date(),
 *     passengers: { adults: 1, children: 0, infants: 0 },
 *     tripType: "roundtrip"
 *   }}
 * >
 *   <FlightSearchForm {...props} />
 * </CollapsibleSearchBar>
 * ```
 */
export function CollapsibleSearchBar({
  searchSummary,
  children,
  defaultCollapsed = false,
  onCollapseChange,
  mobileOnly = true,
  onSearch,
}: CollapsibleSearchBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [manualOverride, setManualOverride] = useState(false);

  // Smart scroll behavior: auto-collapse on scroll down, auto-expand on scroll up
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
  });

  // Auto-collapse/expand based on scroll direction (unless manually overridden)
  useEffect(() => {
    if (manualOverride) return;

    // Auto-collapse when scrolling down and not at top
    if (scrollDirection === 'down' && !isAtTop) {
      setIsCollapsed(true);
      onCollapseChange?.(true);
    }
    // Auto-expand ONLY when scrolling up (not just being at top)
    // This prevents auto-expansion on page load and keeps form collapsed during initial loading
    else if (scrollDirection === 'up' && isCollapsed) {
      setIsCollapsed(false);
      onCollapseChange?.(false);
    }
  }, [scrollDirection, isAtTop, manualOverride, isCollapsed, onCollapseChange]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setManualOverride(true); // User manually toggled, disable auto behavior temporarily
    onCollapseChange?.(newState);

    // Re-enable auto behavior after 3 seconds
    setTimeout(() => {
      setManualOverride(false);
    }, 3000);
  };

  // Auto-collapse when search is submitted (mobile UX optimization)
  const handleSearchSubmit = () => {
    // Immediately collapse to show loading state and results
    setIsCollapsed(true);
    onCollapseChange?.(true);
    setManualOverride(true); // Prevent auto-expand during loading

    // Call parent's onSearch callback if provided
    onSearch?.();

    // Re-enable auto behavior after 5 seconds
    setTimeout(() => {
      setManualOverride(false);
    }, 5000);
  };

  // Calculate total passengers
  const totalPassengers =
    searchSummary.passengers.adults +
    searchSummary.passengers.children +
    searchSummary.passengers.infants;

  // Format dates
  const formatDate = (date: Date | null) => {
    if (!date) return '--';
    return format(date, 'MMM d');
  };

  // Determine container classes based on mobileOnly prop
  const containerClasses = mobileOnly
    ? 'block md:hidden' // Only show on mobile
    : 'block'; // Show on all screen sizes

  return (
    <div className={containerClasses}>
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* Collapsed State - Compact Summary Bar (~50px) */
          <motion.div
            key="collapsed"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <button
              onClick={handleToggle}
              className="w-full min-h-[56px] bg-gradient-to-br from-white via-white to-primary-50/30 backdrop-blur-lg rounded-2xl shadow-lg p-3.5 hover:shadow-xl active:scale-[0.98] transition-all border border-primary-200/50"
              aria-label="Expand search form"
              aria-expanded="false"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Left: Route */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {searchSummary.origin || 'From'} → {searchSummary.destination || 'To'}
                  </span>
                </div>

                {/* Center: Dates */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {formatDate(searchSummary.departDate)}
                    {searchSummary.tripType === 'roundtrip' && (
                      <> - {formatDate(searchSummary.returnDate)}</>
                    )}
                  </span>
                </div>

                {/* Right: Passengers & Expand Icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">{totalPassengers}</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </button>
          </motion.div>
        ) : (
          /* Expanded State - Full Search Form (~320px) */
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="relative">
              {/* Collapse Button */}
              <button
                onClick={handleToggle}
                className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors border border-gray-200"
                aria-label="Collapse search form"
                aria-expanded="true"
              >
                <ChevronUp className="w-5 h-5 text-primary-600" />
              </button>

              {/* Full Search Form - Clone and inject onSearchSubmit handler */}
              {isValidElement(children)
                ? cloneElement(children, { onSearchSubmit: handleSearchSubmit } as any)
                : children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
