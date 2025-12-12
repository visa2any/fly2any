'use client';

import { useEffect, useState } from 'react';
import { FlightCardEnhanced, type EnhancedFlightCardProps } from './FlightCardEnhanced';
import { FlightCardMobile } from './FlightCardMobile';

/**
 * RESPONSIVE FLIGHT CARD WRAPPER
 *
 * Automatically renders:
 * - FlightCardMobile on mobile devices (<768px)
 * - FlightCardEnhanced on desktop devices (>=768px)
 *
 * This wrapper ensures:
 * - Desktop version remains completely untouched
 * - Mobile gets optimized ultra-compact UI
 * - Seamless responsive behavior
 */

export function FlightCardResponsive(props: EnhancedFlightCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Prevent hydration mismatch - always render desktop version on server
  if (!isMounted) {
    return (
      <div data-testid="flight-card">
        <FlightCardEnhanced {...props} />
      </div>
    );
  }

  // Client-side: render based on screen width
  return (
    <div data-testid="flight-card">
      {isMobile ? (
        <FlightCardMobile {...props} />
      ) : (
        <FlightCardEnhanced {...props} />
      )}
    </div>
  );
}
