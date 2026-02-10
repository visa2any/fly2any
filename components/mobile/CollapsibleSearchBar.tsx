'use client';

import { useState, useEffect, cloneElement, isValidElement, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Calendar, Users, MapPin, GripHorizontal, Building2, BedDouble } from 'lucide-react';
import { format } from 'date-fns';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';
import { getMobileCityShort, getAirportFlag } from '@/lib/data/airports';

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
  // Hotel-specific
  rooms?: number;
}

export type SearchMode = 'flights' | 'hotels';

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
  /** Auto-expand when scrolling up (default: true). Set to false to keep collapsed unless manually expanded */
  autoExpand?: boolean;
  /** Search mode: flights or hotels (default: flights) */
  mode?: SearchMode;
}

/**
 * CollapsibleSearchBar Component
 *
 * Provides a collapsible search interface optimized for mobile:
 * - Expanded: Shows full search form (~320px height)
 * - Collapsed: Shows compact summary bar (~50px height)
 * - Net savings: ~270px of vertical space when collapsed
 *
 * IMPORTANT: Uses CSS transitions instead of framer-motion AnimatePresence
 * to prevent clientHeight measurement crashes on mobile devices.
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
  autoExpand = true,
  mode = 'flights',
}: CollapsibleSearchBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [manualOverride, setManualOverride] = useState(false);
  const transitionGuardRef = useRef(false);

  // Smart scroll behavior: auto-collapse on scroll down, auto-expand on scroll up
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
  });

  // Guarded state setter — prevents rapid-fire transitions that cause race conditions
  const setCollapsedGuarded = useCallback((newState: boolean) => {
    if (transitionGuardRef.current) return;
    transitionGuardRef.current = true;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
    setTimeout(() => { transitionGuardRef.current = false; }, 220);
  }, [onCollapseChange]);

  // Auto-collapse/expand based on scroll direction (unless manually overridden or autoExpand disabled)
  useEffect(() => {
    if (manualOverride) return;

    // Auto-collapse when scrolling down and not at top
    if (scrollDirection === 'down' && !isAtTop) {
      setCollapsedGuarded(true);
    }
    // Auto-expand ONLY when scrolling up AND autoExpand is enabled
    else if (autoExpand && scrollDirection === 'up' && isCollapsed) {
      setCollapsedGuarded(false);
    }
  }, [scrollDirection, isAtTop, manualOverride, isCollapsed, autoExpand, setCollapsedGuarded]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setCollapsedGuarded(newState);
    setManualOverride(true); // User manually toggled, disable auto behavior temporarily

    // Re-enable auto behavior after 3 seconds
    setTimeout(() => {
      setManualOverride(false);
    }, 3000);
  };

  // Touch-based drag to collapse (replaces framer-motion drag)
  const dragStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dragDistance = e.changedTouches[0].clientY - dragStartY.current;
    // If user drags down more than 50px, collapse the form
    if (dragDistance > 50) {
      setCollapsedGuarded(true);
      setManualOverride(true);
      setTimeout(() => { setManualOverride(false); }, 3000);
    }
    dragStartY.current = null;
  }, [setCollapsedGuarded]);

  // Auto-collapse when search is submitted (mobile UX optimization)
  const handleSearchSubmit = useCallback(() => {
    // Immediately collapse to show loading state and results
    setCollapsedGuarded(true);
    setManualOverride(true); // Prevent auto-expand during loading

    // Call parent's onSearch callback if provided
    onSearch?.();

    // Re-enable auto behavior after 5 seconds
    setTimeout(() => {
      setManualOverride(false);
    }, 5000);
  }, [setCollapsedGuarded, onSearch]);

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

  // CSS transition classes (same pattern as MobileHomeSearchWrapper)
  const transitionClasses = 'transition-all duration-200 ease-out';

  return (
    <div className={containerClasses}>
      {/* Collapsed State - Compact Summary Bar (~50px) */}
      {/* Uses CSS transitions instead of AnimatePresence to avoid clientHeight crash */}
      <div
        className={`${transitionClasses} ${isCollapsed ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none absolute'}`}
        aria-hidden={!isCollapsed}
      >
        <button
          onClick={handleToggle}
          className="w-full min-h-[56px] bg-gradient-to-br from-white via-white to-primary-50/30 backdrop-blur-lg rounded-2xl shadow-lg p-3.5 hover:shadow-xl active:scale-[0.98] transition-all border border-primary-200/50"
          aria-label="Expand search form"
          aria-expanded="false"
        >
          {mode === 'hotels' ? (
            /* Hotels Mode - Destination, Dates, Guests & Rooms */
            <div className="flex items-center justify-between gap-2">
              {/* Left: Destination with hotel icon */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Building2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm font-bold text-gray-900 truncate">
                  {searchSummary.destination || 'Where?'}
                </span>
              </div>

              {/* Center: Check-in - Check-out */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {formatDate(searchSummary.departDate)} - {formatDate(searchSummary.returnDate)}
                </span>
              </div>

              {/* Right: Guests, Rooms & Expand Icon */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">{totalPassengers}</span>
                </div>
                {searchSummary.rooms && (
                  <div className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">{searchSummary.rooms}</span>
                  </div>
                )}
                <ChevronDown className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          ) : (
            /* Flights Mode - Origin → Destination, Dates, Passengers */
            <div className="flex items-center justify-between gap-2">
              {/* Left: Route - Mobile-optimized city names with flags */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-sm flex-shrink-0">{getAirportFlag(searchSummary.origin) || '✈️'}</span>
                <span className="text-sm font-bold text-gray-900 truncate">
                  {getMobileCityShort(searchSummary.origin, 10) || 'From'}
                </span>
                <span className="text-gray-400 text-sm">→</span>
                <span className="text-sm flex-shrink-0">{getAirportFlag(searchSummary.destination) || '✈️'}</span>
                <span className="text-sm font-bold text-gray-900 truncate">
                  {getMobileCityShort(searchSummary.destination, 10) || 'To'}
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
          )}
        </button>
      </div>

      {/* Expanded State - Full Search Form (~320px) with Drag Handle */}
      <div
        className={`${transitionClasses} ${!isCollapsed ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none absolute'}`}
        aria-hidden={isCollapsed}
      >
        <div className="relative">
          {/* Drag Handle - Visible indicator that form can be dragged down to collapse */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex flex-col items-center py-2 cursor-grab active:cursor-grabbing touch-manipulation"
          >
            {/* Visual handle bar */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mb-1" />
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
              <GripHorizontal size={12} />
              <span>Drag down to collapse</span>
            </div>
          </div>

          {/* Full Search Form - Clone and inject onSearchSubmit handler */}
          {isValidElement(children)
            ? cloneElement(children, { onSearchSubmit: handleSearchSubmit } as any)
            : children}
        </div>
      </div>
    </div>
  );
}
