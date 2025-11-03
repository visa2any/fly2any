'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';

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
}: CollapsibleSearchBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
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
              className="w-full min-h-[50px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-3 hover:shadow-xl transition-shadow border border-gray-200"
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

              {/* Full Search Form */}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
