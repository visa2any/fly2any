'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { MapPin, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import EnhancedSearchBar from '@/components/flights/EnhancedSearchBar';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

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
  /** Callback when search is submitted (triggers auto-collapse on mobile) */
  onSearch?: () => void;
  /** Hide the service tabs (for Journey page) */
  hideTabs?: boolean;
  /** Journey mode - redirects to /journey/builder */
  journeyMode?: boolean;
  /** Enable glassmorphism style for hero overlay */
  glassmorphism?: boolean;
  /** Callback when service type changes (for hero photo sync) */
  onServiceTypeChange?: (serviceType: string) => void;
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
 * - Auto-collapse on search submission (mobile UX optimization)
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
  onSearch,
  hideTabs = false,
  journeyMode = false,
  glassmorphism = false,
  onServiceTypeChange,
}: MobileHomeSearchWrapperProps) {
  // Mobile collapsed state label translations
  const mobileLabels = {
    en: {
      from: 'From',
      to: 'To',
      select: 'Select',
      searchTours: 'Search Tours',
      whereExplore: 'Where do you want to explore?',
      searchActivities: 'Search Activities',
      findExperiences: 'Find experiences near you',
      searchTransfers: 'Search Transfers',
      airportRides: 'Airport & city rides',
      searchHotels: 'Search Hotels',
      whereStaying: 'Where are you staying?',
      rentCar: 'Rent a Car',
      whereWhen: 'Where & when?',
      search: 'Search',
      tapToSearch: 'Tap to start searching',
      close: 'Close',
    },
    pt: {
      from: 'De',
      to: 'Para',
      select: 'Selecionar',
      searchTours: 'Buscar Passeios',
      whereExplore: 'Para onde você quer explorar?',
      searchActivities: 'Buscar Atividades',
      findExperiences: 'Encontre experiências perto de você',
      searchTransfers: 'Buscar Transfers',
      airportRides: 'Traslados aeroporto e cidade',
      searchHotels: 'Buscar Hotéis',
      whereStaying: 'Onde você vai ficar?',
      rentCar: 'Alugar Carro',
      whereWhen: 'Onde e quando?',
      search: 'Buscar',
      tapToSearch: 'Toque para começar a buscar',
      close: 'Fechar',
    },
    es: {
      from: 'Desde',
      to: 'Hacia',
      select: 'Seleccionar',
      searchTours: 'Buscar Tours',
      whereExplore: '¿Dónde quieres explorar?',
      searchActivities: 'Buscar Actividades',
      findExperiences: 'Encuentra experiencias cerca de ti',
      searchTransfers: 'Buscar Transfers',
      airportRides: 'Traslados aeropuerto y ciudad',
      searchHotels: 'Buscar Hoteles',
      whereStaying: '¿Dónde te vas a hospedar?',
      rentCar: 'Alquilar Auto',
      whereWhen: '¿Dónde y cuándo?',
      search: 'Buscar',
      tapToSearch: 'Toca para comenzar a buscar',
      close: 'Cerrar',
    },
  } as const;

  const labels = mobileLabels[lang] || mobileLabels.en;

  // CRITICAL: Only render mobile UI after hydration to prevent SSR/CSR mismatch
  const hasMounted = useHasMounted();

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

  // Detect mobile on mount and resize (ONLY after hydration completes)
  useEffect(() => {
    // Skip if not mounted yet to prevent hydration mismatch
    if (!hasMounted) return;

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
  }, [viewState, hasMounted]);

  // State-of-the-art scroll tracking with momentum detection and debouncing
  useEffect(() => {
    if (!isMobile) return;

    let scrollTimeout: NodeJS.Timeout;
    let momentumThreshold = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

      // Calculate scroll momentum for smoother hide/show
      momentumThreshold = scrollDelta > 5 ? scrollDelta : momentumThreshold * 0.9;

      setScrollY(currentScrollY);
      setScrollDirection(direction);
      lastScrollY.current = currentScrollY;

      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // STATE-OF-THE-ART: Multi-threshold scroll behavior
      // Hide with momentum detection - only hide when scrolling down with momentum
      if (direction === 'down' && currentScrollY > 80 && momentumThreshold > 3 && viewState === 'collapsed') {
        setViewState('hidden');
      }
      // Show immediately when scrolling up OR near top (< 50px)
      else if ((direction === 'up' && momentumThreshold > 2) || currentScrollY < 50) {
        if (viewState === 'hidden') {
          setViewState('collapsed');
        }
      }

      // Debounce: Auto-show after scroll ends (user stopped scrolling)
      scrollTimeout = setTimeout(() => {
        if (currentScrollY > 50 && currentScrollY < 200 && viewState === 'hidden') {
          setViewState('collapsed');
        }
        momentumThreshold = 0;
      }, 1200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
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

  // Auto-collapse when search is submitted (mobile UX optimization)
  const handleSearchSubmit = useCallback(() => {
    // Immediately collapse to show loading state and results
    triggerHaptic();
    setViewState('collapsed');

    // Call parent's onSearch callback if provided
    onSearch?.();
  }, [triggerHaptic, onSearch]);

  // Spring animation configuration
  const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  };

  // HYDRATION FIX: Don't render anything until client-side hydration completes
  // This prevents ALL server/client mismatches
  if (!hasMounted) {
    // Return a skeleton/placeholder that matches SSR output - Level-6 Ultra-Premium
    return (
      <div className={`w-full ${glassmorphism ? 'mx-4 md:mx-6' : ''}`} style={{ minHeight: '120px' }}>
        <div className={`${glassmorphism ? 'bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl' : 'bg-white shadow-md border-y border-neutral-100'} p-4 md:p-6`}>
          <div className="animate-pulse">
            {/* Tab pills skeleton */}
            <div className="flex gap-2 mb-4 overflow-hidden">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className={`h-10 w-20 ${glassmorphism ? 'bg-white/10' : 'bg-neutral-200'} rounded-full flex-shrink-0`}></div>
              ))}
            </div>
            {/* Form fields skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className={`h-[52px] ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'} rounded-xl`}></div>
              <div className={`h-[52px] ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'} rounded-xl`}></div>
              <div className={`h-[52px] ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'} rounded-xl`}></div>
              <div className={`h-[52px] ${glassmorphism ? 'bg-white/10' : 'bg-neutral-100'} rounded-xl`}></div>
              <div className={`h-[52px] ${glassmorphism ? 'bg-red-500/50' : 'bg-red-100'} rounded-xl`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // After hydration, render appropriate version
  if (!isMobile) {
    // Desktop: Pass all search data props to preserve form state
    return (
      <div className={glassmorphism ? 'mx-4 md:mx-6' : ''}>
        <div>
          <EnhancedSearchBar
            origin={origin}
            destination={destination}
            departureDate={departureDate}
            returnDate={returnDate}
            passengers={passengers}
            cabinClass={cabinClass}
            lang={lang}
            defaultService={defaultService}
            hideTabs={hideTabs}
            journeyMode={journeyMode}
            transparent={glassmorphism}
            onServiceTypeChange={onServiceTypeChange}
          />
        </div>
      </div>
    );
  }

  // Mobile rendering with three states (only after hydration on mobile devices)
  return (
    <div ref={wrapperRef} className={`mobile-search-wrapper md:hidden ${glassmorphism ? 'px-4' : ''}`}>
      <AnimatePresence mode="wait">
        {/* COLLAPSED STATE - Service-specific Apple-Class compact bar */}
        {viewState === 'collapsed' && (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 28,
              mass: 0.8,
            }}
            className="w-full px-0 py-1"
          >
            <button
              onClick={handleExpand}
              className={`w-full min-h-[52px] px-4 py-3 transition-all duration-200 active:scale-[0.99] touch-manipulation ${
                glassmorphism
                  ? 'rounded-2xl bg-black/20 backdrop-blur-sm border border-white/20'
                  : 'bg-white border-y-2 border-neutral-200 hover:border-primary-400 shadow-md'
              }`}
              aria-label={`Expand ${defaultService} search form`}
              aria-expanded="false"
              type="button"
            >
              {/* Flights: From → To */}
              {defaultService === 'flights' && (
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-neutral-500 font-semibold leading-none uppercase tracking-wide">{labels.from}</span>
                      <span className="text-sm font-bold text-neutral-800 leading-tight truncate">{formatAirportCode(origin) || labels.select}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-primary-500 font-bold text-base">→</div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] text-neutral-500 font-semibold leading-none uppercase tracking-wide">{labels.to}</span>
                      <span className="text-sm font-bold text-neutral-800 leading-tight truncate">{formatAirportCode(destination) || labels.select}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-2 rounded-xl shadow-md shadow-primary-500/25 flex-shrink-0">
                    <Search className="w-4 h-4" />
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Tours: Destination search */}
              {defaultService === 'tours' && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🗺️</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">{labels.searchTours}</span>
                    <p className="text-sm font-bold text-neutral-800 truncate">{labels.whereExplore}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2.5 rounded-xl shadow-md flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Activities: Destination search */}
              {defaultService === 'activities' && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">{labels.searchActivities}</span>
                    <p className="text-sm font-bold text-neutral-800 truncate">{labels.findExperiences}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2.5 rounded-xl shadow-md flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Transfers: Pickup → Dropoff */}
              {defaultService === 'transfers' && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🚗</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">{labels.searchTransfers}</span>
                    <p className="text-sm font-bold text-neutral-800 truncate">{labels.airportRides}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2.5 rounded-xl shadow-md flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Hotels */}
              {defaultService === 'hotels' && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏨</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">{labels.searchHotels}</span>
                    <p className="text-sm font-bold text-neutral-800 truncate">{labels.whereStaying}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-md flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Cars - Car Rentals */}
              {defaultService === 'cars' && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🚗</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">{labels.rentCar}</span>
                    <p className="text-sm font-bold text-neutral-800 truncate">{labels.whereWhen}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-xl shadow-md flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Other services fallback */}
              {!['flights', 'tours', 'activities', 'transfers', 'hotels', 'cars'].includes(defaultService) && (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wide">{labels.search}</span>
                    <p className="text-sm font-bold text-neutral-800 truncate">{labels.tapToSearch}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2.5 rounded-xl shadow-md flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              )}
            </button>
          </motion.div>
        )}

        {/* EXPANDED STATE - Full EnhancedSearchBar with elegant collapse */}
        {viewState === 'expanded' && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={springConfig}
            className="w-full"
          >
            {/* Full EnhancedSearchBar */}
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
                onSearchSubmit={handleSearchSubmit}
                hideTabs={hideTabs}
                journeyMode={journeyMode}
                transparent={glassmorphism}
                onServiceTypeChange={onServiceTypeChange}
              />
            </div>

            {/* Compact Collapse Handle - Level-6 Style */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className="flex justify-center pt-1 pb-2"
            >
              <button
                type="button"
                onClick={handleCollapse}
                className={`flex items-center justify-center gap-0.5 px-4 py-1.5 rounded-full transition-all duration-150 touch-manipulation active:scale-95 ${
                  glassmorphism
                    ? 'bg-white/40 hover:bg-white/60 border border-white/30'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
                aria-label="Minimize search form"
              >
                <ChevronUp className={`w-4 h-4 ${glassmorphism ? 'text-neutral-600' : 'text-neutral-500'}`} />
                <span className={`text-[10px] font-semibold ${glassmorphism ? 'text-neutral-600' : 'text-neutral-500'}`}>{labels.close}</span>
              </button>
            </motion.div>
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
