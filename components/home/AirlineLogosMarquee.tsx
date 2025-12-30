'use client';

/**
 * AirlineLogosMarquee - Level-6 Ultra-Premium
 * Infinite scroll of major airline logos (white on dark hero)
 */

// Using Duffel CDN for airline logos (already configured in next.config.mjs)
const AIRLINES = [
  { name: 'American Airlines', code: 'AA' },
  { name: 'Delta', code: 'DL' },
  { name: 'United', code: 'UA' },
  { name: 'Southwest', code: 'WN' },
  { name: 'JetBlue', code: 'B6' },
  { name: 'Alaska Airlines', code: 'AS' },
  { name: 'Spirit', code: 'NK' },
  { name: 'British Airways', code: 'BA' },
  { name: 'Lufthansa', code: 'LH' },
  { name: 'Air France', code: 'AF' },
  { name: 'KLM', code: 'KL' },
  { name: 'Emirates', code: 'EK' },
  { name: 'Qatar Airways', code: 'QR' },
  { name: 'Singapore Airlines', code: 'SQ' },
  { name: 'Turkish Airlines', code: 'TK' },
  { name: 'Cathay Pacific', code: 'CX' },
  { name: 'ANA', code: 'NH' },
  { name: 'Qantas', code: 'QF' },
  { name: 'Air Canada', code: 'AC' },
  { name: 'LATAM', code: 'LA' },
  { name: 'Iberia', code: 'IB' },
  { name: 'Virgin Atlantic', code: 'VS' },
  { name: 'Etihad', code: 'EY' },
  { name: 'Korean Air', code: 'KE' },
];

// Duffel CDN provides high-quality airline logos
const getLogoUrl = (code: string) => `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`;

export function AirlineLogosMarquee() {
  return (
    <div className="w-screen relative overflow-hidden -mx-4 py-3 mb-4 md:mb-6">
      {/* Animated track with duplicated content for seamless loop */}
      <div
        className="flex"
        style={{
          width: 'fit-content',
          animation: 'airline-scroll 150s linear infinite'
        }}
      >
        <div
          className="flex items-center gap-12 md:gap-16 px-6"
        >
          {AIRLINES.map((airline, i) => (
            <img
              key={`a-${i}`}
              src={getLogoUrl(airline.code)}
              alt={airline.name}
              title={airline.name}
              className="h-5 md:h-6 w-auto object-contain opacity-60 hover:opacity-90 transition-opacity"
              style={{
                maxWidth: '80px',
                filter: 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
              }}
              loading="lazy"
            />
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div
          className="flex items-center gap-12 md:gap-16 px-6"
          aria-hidden="true"
        >
          {AIRLINES.map((airline, i) => (
            <img
              key={`b-${i}`}
              src={getLogoUrl(airline.code)}
              alt=""
              className="h-5 md:h-6 w-auto object-contain opacity-60 hover:opacity-90 transition-opacity"
              style={{
                maxWidth: '80px',
                filter: 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
              }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AirlineLogosMarquee;
