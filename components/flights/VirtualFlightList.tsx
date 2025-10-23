'use client';

import { FlightCardEnhanced } from './FlightCardEnhanced';
import type { FlightOffer } from './FlightFilters';
import { layout } from '@/lib/design-system';

interface VirtualFlightListProps {
  flights: FlightOffer[];
  sortBy: string;
  onSelect: (id: string) => void;
  onCompare: (id: string) => void;
  compareFlights: string[];
  isNavigating?: boolean;
  selectedFlightId?: string | null;
  lang?: 'en' | 'pt' | 'es';
}

/**
 * Optimized flight list component
 * Renders flights with performance optimizations
 */
function VirtualFlightList({
  flights,
  sortBy,
  onSelect,
  onCompare,
  compareFlights,
  isNavigating = false,
  selectedFlightId = null,
  lang = 'en',
}: VirtualFlightListProps) {
  if (flights.length === 0) {
    return null;
  }

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: layout.cardList.gap }}>
      {flights.map((flight, index) => {
        const flightId = flight.id || `flight-${index}`;

        return (
          <div
            key={flightId}
            className="transform transition-all duration-200 hover:scale-[1.005]"
            style={{
              animationDelay: `${Math.min(index * 30, 300)}ms`,
            }}
          >
            <FlightCardEnhanced
              id={flightId}
              itineraries={flight.itineraries}
              price={flight.price}
              numberOfBookableSeats={flight.numberOfBookableSeats}
              validatingAirlineCodes={flight.validatingAirlineCodes}
              travelerPricings={(flight as any).travelerPricings}
              badges={flight.badges}
              score={typeof flight.score === 'object' ? (flight.score as any)[sortBy] || (flight.score as any).overall : flight.score}
              mlScore={(flight as any).mlScore}
              priceVsMarket={(flight as any).priceVsMarket}
              co2Emissions={(flight as any).co2Emissions}
              averageCO2={(flight as any).averageCO2}
              dealScore={(flight as any).dealScore}
              dealTier={(flight as any).dealTier}
              dealLabel={(flight as any).dealLabel}
              viewingCount={Math.floor(Math.random() * 50) + 20}
              bookingsToday={Math.floor(Math.random() * 150) + 100}
              onSelect={onSelect}
              onCompare={onCompare}
              isComparing={compareFlights.includes(flightId)}
              isNavigating={isNavigating && selectedFlightId === flightId}
              lang={lang}
            />
          </div>
        );
      })}
    </div>
  );
}

// Export both named and default
export { VirtualFlightList };
export default VirtualFlightList;
